import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import manageStudents, {
  setLoginType,
  setStudents,
  convertStudentServerData,
  toggleSharingColumn,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import teacherSections, {
  asyncLoadSectionData
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const section = scriptData.section;
const baseUrl = `/teacher_dashboard/sections/${section.id}`;

$(document).ready(function () {
  registerReducers({teacherSections, manageStudents, sectionData});
  const store = getStore();
  store.dispatch(setLoginType(section.login_type));
  store.dispatch(asyncLoadSectionData(section.id));
  store.dispatch(setSection(section));

  // Show share column by default for CSD and CSP courses,
  // or any script in either course.
  const courseFamiliesToShowShareColumn = ["csd", "csp"];

  if (courseFamiliesToShowShareColumn.includes(section.script.family_name)) {
    store.dispatch(toggleSharingColumn());
  }

  const dataUrl = `/dashboardapi/sections/${section.id}/students`;

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
   }).done(studentData => {
    const convertedStudentData = convertStudentServerData(studentData, section.login_type, section.id);
    store.dispatch(setStudents(convertedStudentData));
  });

  ReactDOM.render(
    <Provider store={store}>
      <Router basename={baseUrl}>
        <Route
          path="/"
          component={props => <TeacherDashboard {...props} sectionId={section.id} section={section} studioUrlPrefix=""/>}
        />
      </Router>
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
