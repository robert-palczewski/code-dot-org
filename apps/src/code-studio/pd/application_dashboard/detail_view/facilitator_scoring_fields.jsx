import React from 'react';

export const FacilitatorScoringFields = {
  currentlyInvolvedInCsEducation: {
    title: 'Champion for CS',
    rubric: (
      <div>
        <p>
          0: Does not currently support CS education
        </p>
        <p>
          3: Supports CS education but not as an educator- Tech employee who volunteers in
          local CS program, afterschool CS program leader, non-profit employee, etc.
        </p>
        <p>
          5: Current CS instructor
        </p>
      </div>
    )
  },
  gradesTaught: {
    title: 'Teaching Experience',
    rubric: (
      <div>
        <p>
          0: No experience at the K-12 level
        </p>
        <p>
          3: K-12 experience, but not at the same level as the program they’re applying to
          lead
        </p>
        <p>
          5: Experience at the same level as the program they’re applying to lead
        </p>
      </div>
    )
  },
  experienceTeachingThisCourse: {
    title: 'Content Knowledge',
    rubric: (
      <div>
        <p>
          0: No experience teaching CS
        </p>
        <p>
          3: Has taught CS, but not this curriculum
        </p>
        <p>
          5: Has taught this curriculum to the appropriate grade level
        </p>
      </div>
    )
  },
  completedPd: {
    title: 'Content Knowledge',
    rubric: (
      <div>
        <p>
          0: Has not participated in the Professional Learning Program for this curriculum
        </p>
        <p>
          3: Has participated in the Professional Learning Program for a different
          curriculum
        </p>
        <p>
          5: Has participated in the Professional Learning Program for this curriculum
        </p>
      </div>
    )
  },
  whyShouldAllHaveAccess: {
    title: 'Equity',
    rubric: (
      <div>
        <p>
          0: Does not articulate why CS should be accessible to all teachers
        </p>
        <p>
          3: Articulates the importance of CS, but is not clear about accessibility for
          all teachers regardless of background or certification.
        </p>
        <p>
          5: Clearly articulates the importance of CS accessibility for all teachers
          regardless of background or certification.
        </p>
      </div>
    )
  },
  skillsAreasToImprove: {
    title: 'Growth minded',
    rubric: (
      <div>
        <p>
          0: Does not describe two strengths and two areas of improvement
        </p>
        <p>
          3: Describes fewer than four total strengths and areas of improvement
        </p>
        <p>
          5: Describes at least two strengths and two areas of improvement
        </p>
      </div>
    )
  },
  inquiryBasedLearning: {
    title: 'Teaching Experience',
    rubric: (
      <div>
        <p>
          0: Does not provide a clear definition or example of inquiry-based learning
        </p>
        <p>
          3: Defines inquiry-based learning but has not led an inquiry-based activity.
        </p>
        <p>
          5: Defines inquiry-based learning and provides a concrete personal example of an
          inquiry-based activity they have led
        </p>
      </div>
    )
  },
  whyInterested: {
    title: 'Program Commitment',
    rubric: (
      <div>
        <p>
          0: Describes neither what they want to learn nor the impact they want to make,
          OR states that they want to learn because their intention is to become a trainer
          primarily for their district
        </p>
        <p>
          3: Describes either what they want to learn OR the impact they want to make
        </p>
        <p>
          5: Describes what they want to learn AND the impact they want to make.
        </p>
      </div>
    )
  }
};
