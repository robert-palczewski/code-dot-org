#!/usr/bin/env ruby

# Distribute downloaded translations from i18n/locales
# back to blockly-core, apps, pegasus, and dashboard.

require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'cdo/languages'

require 'cdo/crowdin/legacy_utils'
require 'cdo/crowdin/project'

require 'fileutils'
require 'json'
require 'parallel'
require 'tempfile'
require 'yaml'
require 'active_support/core_ext/object/blank'

require_relative 'i18n_script_utils'
require_relative 'redact_restore_utils'
require_relative 'metrics'
require_relative 'utils/malformed_i18n_reporter'
require_relative '../animation_assets/manifest_builder'

Dir[File.expand_path('../resources/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module SyncOut
    def self.perform
      puts "Sync out starting"
      I18n::Resources::Apps.sync_out
      I18n::Resources::Dashboard.sync_out
      I18n::Resources::Pegasus.sync_out
      rename_from_crowdin_name_to_locale
      restore_redacted_files
      distribute_translations
      Services::I18n::CurriculumSyncUtils.sync_out
      puts "updating TTS I18n (should usually take 2-3 minutes, may take up to 15 if there are a whole lot of translation updates)"
      I18nScriptUtils.with_synchronous_stdout do
        I18nScriptUtils.run_standalone_script "dashboard/scripts/update_tts_i18n.rb"
      end
      puts "updating TTS I18n Static Messages (should usually be a no-op)"
      I18nScriptUtils.with_synchronous_stdout do
        I18nScriptUtils.run_standalone_script "dashboard/scripts/update_tts_i18n_static_messages.rb"
      end
      clean_up_sync_out(CROWDIN_PROJECTS)
      I18n::Metrics.report_status(true, 'sync-out', 'Sync out completed successfully')
      puts "Sync out completed successfully"
    rescue => exception
      I18n::Metrics.report_status(false, 'sync-out', "Sync out failed from the error: #{exception}")
      puts "Sync out failed from the error: #{exception}"
      raise exception
    end

    # Cleans up any files the sync-out is responsible for managing. When this function is done running,
    # the locale filesystem should be ready for a new i18n-sync cycle.
    # @param projects [Hash] The Crowdin project configurations used by the i18n-sync.
    def self.clean_up_sync_out(projects)
      # Cycle through each project and move temp files to /tmp/i18n-sync
      projects.each do |_project_identifier, project_options|
        # Move *_files_to_sync_out.json to /tmp/i18n-sync/ because these files have been successfully
        # synced and we don't want the next i18n-sync-out to redistribute the files.
        files_to_sync_out_path = project_options[:files_to_sync_out_json]
        if File.exist?(files_to_sync_out_path)
          i18n_sync_tmp_dir = '/tmp/i18n-sync'
          FileUtils.mkdir_p(i18n_sync_tmp_dir)
          puts "Backing up temp file #{files_to_sync_out_path} to #{i18n_sync_tmp_dir}"
          FileUtils.mv(files_to_sync_out_path, i18n_sync_tmp_dir)
        else
          # This will happen if a sync-down hasn't happened since the last successful sync-out.
          puts "No temp file #{files_to_sync_out_path} found to backup."
        end
      end
    end

    # Files downloaded from Crowdin are organized by language name; rename folders
    # to be organized by locale, and remove any locales that are not in our system.
    def self.rename_from_crowdin_name_to_locale
      # Move directories like `i18n/locales/Italian` to `i18n/locales/it-it` for
      # all languages in our system
      PegasusLanguages.get_crowdin_name_and_locale.each do |prop|
        crowdin_locale_dir = I18nScriptUtils.locale_dir(prop[:crowdin_name_s])
        next unless File.exist?(crowdin_locale_dir)

        # copy and remove rather than moving so we can easily and recursively deal
        # with existing files
        i18n_locale_dir = I18nScriptUtils.locale_dir(prop[:locale_s])
        I18nScriptUtils.rename_dir(crowdin_locale_dir, i18n_locale_dir)
      end

      # Now, any remaining directories named after the language name (rather than
      # the four-letter language code) represent languages downloaded from crowdin
      # that aren't in our system. Remove them.
      # A regex is used in the .select rather than Dir.glob because Dir.glob will ignore
      # character case on file systems which are case insensitive by default, such as OSX.
      FileUtils.rm_r Dir.glob("i18n/locales/*").grep(/i18n\/locales\/[A-Z].*/)
    end

    def self.restore_redacted_files
      locales = PegasusLanguages.get_locale
      original_dir = "i18n/locales/original"
      original_files = Dir.glob("#{original_dir}/**/*.*").to_a
      if original_files.empty?
        raise <<~ERR
          No original files found from which to restore.

          Originals are created by running the sync-in, but are not persisted in
          git; this likely happened because a sync-out was attempted without a
          corresponding sync-in.
        ERR
      end

      puts "Restoring redacted files in #{locales.count} locales, parallelized between #{Parallel.processor_count / 2} processes"

      # Prepare some collection literals
      resource_and_vocab_paths = [
        'i18n/locales/original/dashboard/scripts.yml',
        'i18n/locales/original/dashboard/courses.yml'
      ]

      Parallel.each(locales, in_processes: (Parallel.processor_count / 2)) do |prop|
        locale = prop[:locale_s]
        next if locale == 'en-US'
        next unless File.directory?("i18n/locales/#{locale}/")

        malformed_i18n_reporter = I18n::Utils::MalformedI18nReporter.new(locale)

        original_files.each do |original_path|
          relative_path = original_path.delete_prefix(original_dir)
          next unless I18nScriptUtils.file_changed?(locale, relative_path)

          translated_path = original_path.sub("original", locale)
          next unless File.file?(translated_path)

          if original_path == 'i18n/locales/original/dashboard/blocks.yml'
            next # moved to I18n::Resources::Dashboard::Blocks::SyncOut#restore
          elsif original_path.starts_with? "i18n/locales/original/course_content"
            next # moved to I18n::Resources::Dashboard::CourseContent::SyncOut#restore_level_content
          else
            # Everything else is differentiated only by the plugins used
            plugins = []
            if resource_and_vocab_paths.include? original_path
              plugins << 'resourceLink'
              plugins << 'vocabularyDefinition'
            elsif original_path.starts_with? "i18n/locales/original/curriculum_content"
              plugins.push(*Services::I18n::CurriculumSyncUtils::REDACT_RESTORE_PLUGINS)
            elsif original_path.starts_with? "i18n/locales/original/docs"
              plugins << 'visualCodeBlock'
              plugins << 'link'
              plugins << 'resourceLink'
            elsif I18n::Resources::Apps::Labs::REDACTABLE_LABS.include?(File.basename(original_path, '.json'))
              next # moved to I18n::Resources::Apps::Labs::SyncOut#restore_crawding_locale_files
            end
            RedactRestoreUtils.restore(original_path, translated_path, translated_path, plugins)
          end

          malformed_i18n_reporter.process_file(translated_path)
        end
        malformed_i18n_reporter.report
      end
      puts "Restoration finished!"
    end

    # Recursively run through the data received from crowdin, sanitizing it for
    # consumption by our system.
    #
    # Sanitization rules applied:
    #   - restore carraige returns (crowdin escapes them)
    #   - eliminate empty strings from hashes (empty strings are how crowdin
    #     returns untranslated strings for certain serialization formats)
    def self.sanitize!(data)
      if data.is_a? Hash
        data.values.each {|datum| sanitize!(datum)}
        data.delete_if {|_key, value| value.nil? || value.try(:empty?)}
      elsif data.is_a? Array
        data.each {|datum| sanitize!(datum)}
      elsif data.is_a? String
        data.gsub!(/\\r/, "\r")
      elsif [true, false].include? data
        # pass
      elsif data.nil?
        # pass
      else
        raise "can't process unknown type: #{data}"
      end
    end

    # We provide URLs to the translators for Resources only; because
    # the sync has a side effect of applying Markdown formatting to
    # everything it encounters, we want to make sure to un-Markdownify
    # these URLs
    def self.postprocess_course_resources(locale, courses_source)
      courses_yaml = YAML.load_file(courses_source)
      lang_code = PegasusLanguages.get_code_by_locale(locale)
      return if courses_yaml[lang_code].nil? # no processing of empty files
      if courses_yaml[lang_code]['data']['resources']
        courses_resources = courses_yaml[lang_code]['data']['resources']
        courses_resources.each do |_key, resource|
          next if resource['url'].blank?
          resource['url'].strip!
          resource['url'].delete_prefix!('<')
          resource['url'].delete_suffix!('>')
        end
      end
      File.write(courses_source, I18nScriptUtils.to_crowdin_yaml(courses_yaml))
    end

    # Distribute downloaded translations from i18n/locales
    # back to blockly, apps, pegasus, and dashboard.
    def self.distribute_translations
      locales = PegasusLanguages.get_locale
      puts "Distributing translations in #{locales.count} locales, parallelized between #{Parallel.processor_count / 2} processes"

      Parallel.each(locales, in_processes: (Parallel.processor_count / 2)) do |prop|
        locale = prop[:locale_s]
        locale_dir = File.join("i18n/locales", locale)
        next if locale == 'en-US'
        next unless File.directory?(locale_dir)

        ### Dashboard
        Dir.glob("i18n/locales/#{locale}/dashboard/*.{json,yml}") do |loc_file|
          next if loc_file == File.join('i18n/locales', locale, 'dashboard/blocks.yml')
          next if loc_file == File.join('i18n/locales', locale, 'dashboard/course_offerings.json')
          next if loc_file == File.join('i18n/locales', locale, 'dashboard/block_categories.yml')
          next if loc_file == File.join('i18n/locales', locale, 'dashboard/parameter_names.yml')
          next if loc_file == File.join('i18n/locales', locale, 'dashboard/progressions.yml')
          next if loc_file == File.join('i18n/locales', locale, 'dashboard/variable_names.yml')

          ext = File.extname(loc_file)
          relative_path = loc_file.delete_prefix(locale_dir)
          next unless I18nScriptUtils.file_changed?(locale, relative_path)

          basename = File.basename(loc_file, ext)
          postprocess_course_resources(locale, loc_file) if File.basename(loc_file) == 'courses.yml'
          # Special case the un-prefixed Yaml file.
          destination = (basename == "base") ?
                          "dashboard/config/locales/#{locale}#{ext}" :
                          "dashboard/config/locales/#{basename}.#{locale}#{ext}"

          if ext == ".json"
            # JSON files in this directory need the root key to be set to the locale
            loc_data = JSON.parse(File.read(loc_file))
            loc_data = I18nScriptUtils.to_dashboard_i18n_data(locale, basename, loc_data)
            I18nScriptUtils.sanitize_data_and_write(loc_data, destination)
          else
            I18nScriptUtils.sanitize_file_and_write(loc_file, destination)
          end
        end

        ### Docs
        Dir.glob("i18n/locales/#{locale}/docs/*.json") do |loc_file|
          # Each programming environment file gets merged into programming_environments.{locale}.json
          relative_path = loc_file.delete_prefix(locale_dir)
          next unless I18nScriptUtils.file_changed?(locale, relative_path)

          loc_data = JSON.parse(File.read(loc_file))
          next if loc_data.empty?

          programming_env = File.basename(loc_file, '.json')
          destination = "dashboard/config/locales/programming_environments.#{locale}.json"
          programming_env_data = File.exist?(destination) ?
                                   I18nScriptUtils.parse_file(destination).dig(locale, "data", "programming_environments") || {} :
                                   {}
          programming_env_data[programming_env] = loc_data[programming_env]
          # JSON files in this directory need the root key to be set to the locale
          programming_env_data = I18nScriptUtils.to_dashboard_i18n_data(locale, 'programming_environments', programming_env_data)
          I18nScriptUtils.sanitize_data_and_write(programming_env_data, destination)
        end

        ### Standards
        Dir.glob("i18n/locales/#{locale}/standards/*.json") do |loc_file|
          # For every framework, we place the frameworks and categories in their
          # respective places.
          relative_path = loc_file.delete_prefix(locale_dir)
          next unless I18nScriptUtils.file_changed?(locale, relative_path)

          # These JSON files contain the framework name, a set of categories, and a
          # set of standards.
          loc_data = JSON.parse(File.read(loc_file))
          framework = File.basename(loc_file, '.json')

          # Frameworks
          destination = "dashboard/config/locales/frameworks.#{locale}.json"
          framework_data = File.exist?(destination) ?
                             I18nScriptUtils.parse_file(destination).dig(locale, "data", "frameworks") || {} :
                             {}
          framework_data[framework] = {
            "name" => loc_data["name"]
          }
          framework_data = I18nScriptUtils.to_dashboard_i18n_data(locale, 'frameworks', framework_data)
          I18nScriptUtils.sanitize_data_and_write(framework_data, destination)

          # Standard Categories
          destination = "dashboard/config/locales/standard_categories.#{locale}.json"
          category_data = File.exist?(destination) ?
                            I18nScriptUtils.parse_file(destination).dig(locale, "data", "standard_categories") || {} :
                            {}
          (loc_data["categories"] || {}).keys.each do |category|
            category_data[category] = {
              "description" => loc_data["categories"][category]["description"]
            }
          end
          category_data = I18nScriptUtils.to_dashboard_i18n_data(locale, 'standard_categories', category_data)
          I18nScriptUtils.sanitize_data_and_write(category_data, destination)

          # Standards
          destination = "dashboard/config/locales/standards.#{locale}.json"
          standard_data = File.exist?(destination) ?
                            I18nScriptUtils.parse_file(destination).dig(locale, "data", "standards") || {} :
                            {}
          (loc_data["standards"] || {}).keys.each do |standard|
            standard_data[standard] = {
              "description" => loc_data["standards"][standard]["description"]
            }
          end
          standard_data = I18nScriptUtils.to_dashboard_i18n_data(locale, 'standards', standard_data)
          I18nScriptUtils.sanitize_data_and_write(standard_data, destination)
        end
      end

      puts "Distribution finished!"
    end
  end
end

I18n::SyncOut.perform if __FILE__ == $0
