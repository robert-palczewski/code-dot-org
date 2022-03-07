import React from 'react';
import {UnconnectedEditSectionForm as EditSectionForm} from './EditSectionForm';
import {action} from '@storybook/addon-actions';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {testSection, courseOfferings} from './teacherDashboardTestHelpers';

export default storybook => {
  storybook = storybook.storiesOf('EditSectionForm', module);

  Object.values(SectionLoginType).forEach(loginType => {
    storybook = storybook.add(`Generic / ${loginType}`, () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          loginType: loginType
        }}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    ));
    storybook = storybook.add('no students yet', () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          studentCount: 0
        }}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    ));
    storybook = storybook.add('save in progress', () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        courseOfferings={courseOfferings}
        sections={{}}
        section={testSection}
        isSaveInProgress={true}
        textToSpeechUnitIds={[]}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    ));
  });
};
