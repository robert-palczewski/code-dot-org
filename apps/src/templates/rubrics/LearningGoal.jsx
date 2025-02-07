import React, {useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {
  learningGoalShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  BodyThreeText,
  BodyFourText,
  ExtraStrongText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import EvidenceLevels from './EvidenceLevels';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import AiAssessment from './AiAssessment';
import HttpClient from '@cdo/apps/util/HttpClient';

export default function LearningGoal({
  learningGoal,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
  studentLevelInfo,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [isAutosaving, setIsAutosaving] = useState(false);
  const [autosaved, setAutosaved] = useState(false);
  const [errorAutosaving, setErrorAutosaving] = useState(false);
  const [learningGoalEval, setLearningGoalEval] = useState(null);
  const [displayFeedback, setDisplayFeedback] = useState('');
  const understandingLevel = useRef(0);
  const teacherFeedback = useRef('');

  const aiEnabled = learningGoal.aiEnabled && teacherHasEnabledAi;
  const base_endpoint = '/learning_goal_evaluations';

  // Timer variabls for autosaving
  const autosaveTimer = useRef();
  const saveAfter = 2000;

  const handleClick = () => {
    const eventName = isOpen
      ? EVENTS.RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT
      : EVENTS.RUBRIC_LEARNING_GOAL_EXPANDED_EVENT;
    analyticsReporter.sendEvent(eventName, {
      ...(reportingData || {}),
      learningGoalKey: learningGoal.key,
      learningGoal: learningGoal.learningGoal,
    });
    setIsOpen(!isOpen);
  };

  const handleFeedbackChange = event => {
    if (studentLevelInfo.user_id && learningGoal.id) {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
      teacherFeedback.current = event.target.value;
      setDisplayFeedback(teacherFeedback.current);
      autosaveTimer.current = setTimeout(() => {
        autosave();
      }, saveAfter);
    }
  };

  const autosave = () => {
    setAutosaved(false);
    setIsAutosaving(true);
    setErrorAutosaving(false);
    const bodyData = JSON.stringify({
      studentId: studentLevelInfo.user_id,
      learningGoalId: learningGoal.id,
      feedback: teacherFeedback.current,
      understanding: understandingLevel.current,
    });
    HttpClient.put(`${base_endpoint}/${learningGoalEval.id}`, bodyData, true, {
      'Content-Type': 'application/json',
    })
      .then(() => {
        setIsAutosaving(false);
        setAutosaved(true);
      })
      .catch(error => {
        console.log(error);
        setIsAutosaving(false);
        setErrorAutosaving(true);
      });
    clearTimeout(autosaveTimer.current);
  };

  useEffect(() => {
    if (studentLevelInfo && learningGoal.id) {
      const body = JSON.stringify({
        userId: studentLevelInfo.user_id,
        learningGoalId: learningGoal.id,
      });
      HttpClient.post(`${base_endpoint}/get_or_create_evaluation`, body, true, {
        'Content-Type': 'application/json',
      })
        .then(response => response.json())
        .then(json => {
          setLearningGoalEval(json);
          if (!json.feedback) {
            teacherFeedback.current = '';
          } else {
            teacherFeedback.current = json.feedback;
            setDisplayFeedback(teacherFeedback.current);
          }
          if (json.understanding) {
            understandingLevel.current = json.understanding;
          }
        })
        .catch(error => console.log(error));
    }
  }, [studentLevelInfo, learningGoal]);

  // Callback to retrieve understanding data from EvidenceLevels
  const radioButtonCallback = radioButtonData => {
    understandingLevel.current = radioButtonData;
    if (!isAutosaving) {
      autosave();
    }
  };

  return (
    <details className={style.learningGoalRow}>
      <summary className={style.learningGoalHeader} onClick={handleClick}>
        <div className={style.learningGoalHeaderLeftSide}>
          {isOpen && (
            <FontAwesome
              icon="angle-up"
              onClick={() => setIsOpen(false)}
              className={style.arrowIcon}
            />
          )}
          {!isOpen && (
            <FontAwesome
              icon="angle-down"
              onClick={() => setIsOpen(true)}
              className={style.arrowIcon}
            />
          )}
          {/*TODO: [DES-321] Label-two styles here*/}
          <span>{learningGoal.learningGoal}</span>
        </div>
        <div className={style.learningGoalHeaderRightSide}>
          {aiEnabled && <AiToken />}
          {/*TODO: Display status of feedback*/}
          {canProvideFeedback && (
            <BodyThreeText>{i18n.needsApproval()}</BodyThreeText>
          )}
        </div>
      </summary>
      {/*TODO: Pass through data to child component*/}
      <div className={style.expandedBorder}>
        {teacherHasEnabledAi && !!studentLevelInfo && (
          <div className={style.openedAiAssessment}>
            <AiAssessment
              isAiAssessed={learningGoal.aiEnabled}
              studentName={studentLevelInfo.name}
              aiConfidence={50}
              aiUnderstandingLevel={1}
            />
          </div>
        )}
        <div className={style.learningGoalExpanded}>
          <EvidenceLevels
            learningGoalKey={learningGoal.key}
            evidenceLevels={learningGoal.evidenceLevels}
            canProvideFeedback={canProvideFeedback}
            understanding={understandingLevel.current}
            radioButtonCallback={radioButtonCallback}
          />
          {learningGoal.tips && (
            <div>
              <Heading6>{i18n.tipsForEvaluation()}</Heading6>
              <div className={style.learningGoalTips}>
                <SafeMarkdown markdown={learningGoal.tips} />
              </div>
            </div>
          )}
          <div className={style.feedbackArea}>
            <label className={style.evidenceLevelLabel}>
              <span>{i18n.feedback()}</span>
              <textarea
                className={style.inputTextbox}
                name="teacherFeedback"
                value={displayFeedback}
                onChange={handleFeedbackChange}
                disabled={!studentLevelInfo}
              />
            </label>
            {isAutosaving ? (
              <span className={style.autosaveMessage}>{i18n.saving()}</span>
            ) : (
              autosaved && (
                <span className={style.autosaveMessage}>
                  <FontAwesome icon="circle-check" /> {i18n.savedToGallery()}
                </span>
              )
            )}
            {errorAutosaving && (
              <span className={style.autosaveMessage}>
                {i18n.feedbackSaveError()}
              </span>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}

LearningGoal.propTypes = {
  learningGoal: learningGoalShape.isRequired,
  teacherHasEnabledAi: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
};

const AiToken = () => {
  return (
    <div>
      {' '}
      <BodyFourText className={classnames(style.aiToken, style.aiTokenText)}>
        <ExtraStrongText>
          {i18n.artificialIntelligenceAbbreviation()}
        </ExtraStrongText>

        <FontAwesome icon="check" title={i18n.aiAssessmentEnabled()} />
      </BodyFourText>
    </div>
  );
};
