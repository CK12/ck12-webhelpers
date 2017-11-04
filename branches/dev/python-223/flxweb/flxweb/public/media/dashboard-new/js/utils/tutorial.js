import routes from 'routes';
import cookie from './cookie';

import { showTooltip, isFirstTimeUser } from 'actions/tutorialActions';
import { saveAppData } from 'actions/appDataActions';

export const tutorialPaths = {
    menuContent: 'menuBar.content',
    menuGroups: 'menuBar.groups',
    cardTitle: 'groupsPage.groupCard.cardTitle',
    assignmentDropdown: 'groupsPage.groupCard.class.withAssignments.assignmentDropdown',
    circleGraph: 'groupsPage.groupCard.class.withAssignments.circleGraph',
    activityCount: 'groupsPage.groupCard.class.withAssignments.activityCount',
    activityFeed: 'groupsPage.groupCard.class.withAssignments.activityFeed',
    mastheadTutorial: 'masthead.tutorial'
};

function isContentPage(location){
    return location.pathname === routes.home || /content/.test(location.pathname);
}

function getTooltip(location) {
    return isContentPage(location) ? tutorialPaths.menuContent : tutorialPaths.menuGroups;
}

export function hasTutorialCookie(cookieName){
    return cookie.hasItem(cookieName);
}

export function hasSeenPageTutorial({location, appData}){
    const { IS_DEFAULT, userdata: {seenContentPageTutorial, seenGroupsPageTutorial} } = appData;
    if(IS_DEFAULT){ return true; } // Wait until app data is finished loading in
    return isContentPage(location) ? seenContentPageTutorial : seenGroupsPageTutorial;
}

export function getPageKey({location}){
    return isContentPage(location) ? 'seenContentPageTutorial' : 'seenGroupsPageTutorial';
}

export function showTutorial(props){
    const {dispatch, location} = props;
    const tooltip = getTooltip(location);

    dispatch(showTooltip(tooltip));
    if(!hasSeenPageTutorial(props)){
        dispatch(isFirstTimeUser(true));
    }
}