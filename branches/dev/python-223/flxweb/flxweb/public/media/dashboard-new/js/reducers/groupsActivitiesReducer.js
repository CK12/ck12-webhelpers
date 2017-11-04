import initialState from 'sources/groupsActivities';

import {
    FETCH_GROUP_ACTIVITY_SUCCESS,
    FETCH_GROUP_ACTIVITY_ERROR,
    MARK_GROUP_ACTIVITY_VIEWED_SUCCESS,
    MARK_GROUP_ACTIVITY_VIEWED_ERROR
} from 'actions/actionTypes';

import { includes } from 'lodash';

function markGroupActivityViewed(state, groupID, ids=[]){
    let activities = state[groupID].activity.slice()
        .filter( activity => !includes(ids, activity.id));

    return Object.assign({}, state, {
        [groupID]: {activity: activities}
    });
}

export default function groupsAssignmentsReducer(state = initialState, action) {
    switch (action.type) {

        case FETCH_GROUP_ACTIVITY_SUCCESS:
            return Object.assign({}, state, {
                [action.groupID]: action.activity
            });

        case MARK_GROUP_ACTIVITY_VIEWED_SUCCESS:
            return markGroupActivityViewed(state, action.groupID, action.activityIDs);

        case FETCH_GROUP_ACTIVITY_ERROR:
        case MARK_GROUP_ACTIVITY_VIEWED_ERROR:
        default:
            return state;
    }
}