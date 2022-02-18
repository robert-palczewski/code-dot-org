
module JavalabFilesHelper
  # Get all files related to the project at the given channel id as a hash. The hash is in the format
  # below. All values are StringIO.
  # {
  #   "sources": {"main.json": <main source file for a project>, "grid.txt": <serialized maze if it exists>},
  #   "assets": {"asset_name_1": <asset_value>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the channel doesn't have validation and/or a maze, those fields will not be present.
  def self.get_project_files(channel_id)
    storage_id, storage_app_id = storage_decrypt_channel_id(channel_id)
    all_files = {}
    sources = {}
    # get main.json
    source_data = SourceBucket.new.get(channel_id, "main.json")
    # Note: we can call .string on this value (and all other values for files) to get the raw string.
    sources["main.json"] = source_data[:body]

    # get maze file
    channel = ChannelToken.where(storage_app_id: storage_app_id, storage_id: storage_id).first
    level = Level.cache_find(channel.level_id)
    if level
      serialized_maze = level.try(:get_serialized_maze)
      if serialized_maze
        sources["grid.txt"] = StringIO.new(serialized_maze.to_s)
      end
    end
    all_files["sources"] = sources

    # get level assets
    assets = {}
    asset_bucket = AssetBucket.new
    asset_list = asset_bucket.list(channel_id)
    asset_list.each do |asset|
      assets[asset[:filename]] = asset_bucket.get(channel_id, asset[:filename])[:body]
    end

    # get starter assets
    if level
      starter_asset_bucket = Aws::S3::Bucket.new(LevelStarterAssetsController::S3_BUCKET)
      (level&.project_template_level&.starter_assets || level.starter_assets || []).map do |friendly_name, uuid_name|
        filename = "#{LevelStarterAssetsController::S3_PREFIX}#{uuid_name}"
        asset = starter_asset_bucket.object(filename)
        assets[friendly_name] = asset.get.body
      end
    end
    all_files["assets"] = assets

    # get validation code
    if level.respond_to?(:validation) && level.validation
      all_files["validation"] = StringIO.new(level.validation.to_json)
    end

    return all_files
  end
end
