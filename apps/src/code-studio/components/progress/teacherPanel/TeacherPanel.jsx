import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import TeacherPanelContainer from '@cdo/apps/code-studio/components/progress/teacherPanel/TeacherPanelContainer';
import SectionSelector from '../SectionSelector';
import ViewAsToggle from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {fullyLockedLessonMapping} from '@cdo/apps/code-studio/lessonLockRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {loadLevelsWithProgress} from '@cdo/apps/code-studio/teacherPanelRedux';
import {pageTypes} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import StudentTable from '@cdo/apps/code-studio/components/progress/teacherPanel/StudentTable';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import SelectedStudentInfo from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentInfo';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  hasLockableLessons,
  queryUserProgress
} from '@cdo/apps/code-studio/progressRedux';
import {reload} from '@cdo/apps/utils';
import {updateQueryParam, queryParams} from '@cdo/apps/code-studio/utils';
import {studentShape, levelWithProgress} from './types';

class TeacherPanel extends React.Component {
  static propTypes = {
    unitName: PropTypes.string,
    pageType: PropTypes.oneOf([
      pageTypes.level,
      pageTypes.scriptOverview,
      pageTypes.lessonExtras
    ]),

    // Provided by redux.
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    hasSections: PropTypes.bool.isRequired,
    sectionsAreLoaded: PropTypes.bool.isRequired,
    selectedSection: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }),
    unitHasLockableLessons: PropTypes.bool.isRequired,
    unlockedLessonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    students: PropTypes.arrayOf(studentShape),
    levelsWithProgress: PropTypes.arrayOf(levelWithProgress),
    loadLevelsWithProgress: PropTypes.func.isRequired,
    teacherId: PropTypes.number,
    exampleSolutions: PropTypes.array,
    selectUser: PropTypes.func.isRequired
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.pageType !== pageTypes.scriptOverview && // no progress is shown on script overview page in teacher panel
      nextProps.selectedSection?.id !== this.props.selectedSection?.id
    ) {
      this.props.loadLevelsWithProgress();
    }
  }

  logToFirehose = (eventName, overrideData = {}) => {
    const sectionId =
      this.props.selectedSection && this.props.selectedSection.id;
    const data = {
      section_id: sectionId,
      page_type: this.props.pageType,
      ...overrideData
    };

    firehoseClient.putRecord({
      study: 'teacher_panel',
      event: eventName,
      data_json: JSON.stringify(data)
    });
  };

  onSelectUser = (id, selectType) => {
    this.logToFirehose('select_student', {select_type: selectType});
    const isAsync = this.props.pageType === pageTypes.scriptOverview;
    this.props.selectUser(id, isAsync);
  };

  getSelectedUserId = () => {
    const userIdStr = queryParams('user_id');
    return userIdStr ? parseInt(userIdStr, 10) : null;
  };

  render() {
    const {
      viewAs,
      hasSections,
      sectionsAreLoaded,
      selectedSection,
      unitHasLockableLessons,
      unlockedLessonNames,
      students,
      unitName,
      levelsWithProgress,
      pageType,
      teacherId,
      exampleSolutions
    } = this.props;

    const selectedUserId = this.getSelectedUserId();

    const sectionId = selectedSection && selectedSection.id;

    const displaySelectedStudentInfo =
      viewAs === ViewType.Teacher &&
      !!students?.length &&
      pageType !== pageTypes.scriptOverview;

    const displayLevelExamples =
      viewAs === ViewType.Teacher && exampleSolutions?.length > 0;

    const displayLockInfo =
      hasSections && unitHasLockableLessons && viewAs === ViewType.Teacher;

    return (
      <TeacherPanelContainer logToFirehose={this.logToFirehose}>
        <h3>{i18n.teacherPanel()}</h3>
        <div style={styles.scrollable}>
          <ViewAsToggle logToFirehose={this.logToFirehose} />
          {displaySelectedStudentInfo && (
            <SelectedStudentInfo
              students={students}
              onSelectUser={id => this.onSelectUser(id, 'iterator')}
              selectedUserId={selectedUserId}
              teacherId={teacherId}
              levelsWithProgress={levelsWithProgress}
            />
          )}
          {displayLevelExamples && (
            <div style={styles.exampleSolutions}>
              {exampleSolutions.map((example, index) => (
                <Button
                  __useDeprecatedTag
                  key={index}
                  text={i18n.exampleSolution({number: index + 1})}
                  color="blue"
                  href={example}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ))}
            </div>
          )}
          {!sectionsAreLoaded && (
            <div style={styles.text}>{i18n.loading()}</div>
          )}
          {sectionsAreLoaded && hasSections && (
            <div style={styles.sectionInfo}>
              <div>{i18n.viewingSection()}</div>
              <SectionSelector
                style={{margin: '0px 10px'}}
                reloadOnChange={true}
                logToFirehose={() => this.logToFirehose('select_section')}
              />
              {selectedSection && (
                <a
                  href={teacherDashboardUrl(selectedSection.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.teacherDashboardLink}
                  onClick={() => this.logToFirehose('select_teacher_dashboard')}
                >
                  {i18n.teacherDashboard()}
                </a>
              )}
            </div>
          )}
          {displayLockInfo && (
            <div>
              <div style={styles.text}>{i18n.selectSectionInstructions()}</div>
              {unlockedLessonNames.length > 0 && (
                <div>
                  <div style={styles.text}>
                    <FontAwesome
                      icon="exclamation-triangle"
                      style={styles.exclamation}
                    />
                    <div style={styles.dontForget}>{i18n.dontForget()}</div>
                  </div>
                  <div style={styles.text}>
                    {i18n.lockFollowing()}
                    <ul>
                      {unlockedLessonNames.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          {viewAs === ViewType.Teacher && (students || []).length > 0 && (
            <StudentTable
              levelsWithProgress={levelsWithProgress}
              students={students}
              onSelectUser={id => this.onSelectUser(id, 'select_specific')}
              selectedUserId={selectedUserId}
              sectionId={sectionId}
              unitName={unitName}
            />
          )}
        </div>
      </TeacherPanelContainer>
    );
  }
}

const styles = {
  scrollable: {
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: '90%'
  },
  text: {
    margin: 10
  },
  exclamation: {
    color: 'red'
  },
  dontForget: {
    display: 'inline',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: '"Gotham 7r", sans-serif'
  },
  sectionHeader: {
    margin: 10,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  exampleSolutions: {
    textAlign: 'center',
    margin: 5
  },
  sectionInfo: {
    textAlign: 'center',
    padding: '5px 0px'
  },
  teacherDashboardLink: {
    fontSize: 11
  }
};

export const UnconnectedTeacherPanel = TeacherPanel;
export default connect(
  state => {
    const {
      lessonsBySectionId,
      lockableAuthorized,
      lockableAuthorizedLoaded
    } = state.lessonLock;
    const {
      selectedSectionId,
      sectionsAreLoaded,
      sectionIds
    } = state.teacherSections;
    const currentSection = lessonsBySectionId[selectedSectionId];

    const fullyLocked = fullyLockedLessonMapping(
      state.lessonLock.lessonsBySectionId[selectedSectionId]
    );
    const unlockedLessonIds = Object.keys(currentSection || {}).filter(
      lessonId => !fullyLocked[lessonId]
    );

    let lessonNames = {};
    state.progress.lessons.forEach(lesson => {
      lessonNames[lesson.id] = lesson.name;
    });

    // Pretend we don't have lockable lessons if we're not authorized to see them
    const unitHasLockableLessons =
      lockableAuthorizedLoaded &&
      lockableAuthorized &&
      hasLockableLessons(state.progress);

    return {
      viewAs: state.viewAs,
      hasSections: sectionIds.length > 0,
      sectionsAreLoaded,
      unitHasLockableLessons,
      selectedSection: state.teacherSections.sections[selectedSectionId],
      unlockedLessonNames: unlockedLessonIds.map(id => lessonNames[id]),
      students: state.teacherSections.selectedStudents,
      levelsWithProgress: state.teacherPanel.levelsWithProgress,
      isLoadingLevelsWithProgress:
        state.teacherPanel.isLoadingLevelsWithProgress,
      teacherId: state.currentUser.userId,
      exampleSolutions: state.pageConstants?.exampleSolutions
    };
  },
  dispatch => ({
    loadLevelsWithProgress: () => dispatch(loadLevelsWithProgress()),
    selectUser: (userId, isAsync = false) => {
      updateQueryParam('user_id', userId);
      isAsync ? dispatch(queryUserProgress(userId)) : reload();
    }
  })
)(TeacherPanel);
