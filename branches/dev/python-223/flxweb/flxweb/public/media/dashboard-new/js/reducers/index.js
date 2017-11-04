import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as form } from 'redux-form';

import user from 'reducers/userReducer';
import userSubjects from 'reducers/userSubjectsReducer';
import userGrades from 'reducers/userGradesReducer';
import counts from 'reducers/countsReducer';
import groups from 'reducers/groupsReducer';
import content from 'reducers/contentReducer';
import standards from 'reducers/standardsReducer';
import groupsFilter from 'reducers/groupsFilterReducer';
import groupsAssignments from 'reducers/groupsAssignmentsReducer';
import groupsActivitites from 'reducers/groupsActivitiesReducer';
import groupsSharedResources from 'reducers/groupsSharedResourcesReducer';
import modal from 'reducers/modalReducer';
import messageBox from 'reducers/messageBoxReducer';
import messageText from 'reducers/messageTextReducer';
import subjects from 'reducers/subjectsReducer';
import contentFilter from 'reducers/contentFilterReducer';
import tutorial from 'reducers/tutorialReducer';
import reportIssue from 'reducers/reportIssueReducer';
import peerhelp from 'reducers/peerhelpReducer';
import appData from 'reducers/appDataReducer';

const rootReducer = combineReducers({
    routing: routerReducer,
    appData,
    content,
    contentFilter,
    counts,
    form,
    groups,
    groupsActivitites,
    groupsAssignments,
    groupsFilter,
    groupsSharedResources,
    messageBox,
    messageText,
    modal,
    peerhelp,
    reportIssue,
    standards,
    subjects,
    tutorial,
    user,
    userGrades,
    userSubjects
});

export default rootReducer;