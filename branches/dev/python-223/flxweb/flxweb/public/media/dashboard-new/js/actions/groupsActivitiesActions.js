import { groupsService } from 'services';

import {
    FETCH_GROUP_ACTIVITY_SUCCESS,
    FETCH_GROUP_ACTIVITY_ERROR,
    MARK_GROUP_ACTIVITY_VIEWED_SUCCESS,
    MARK_GROUP_ACTIVITY_VIEWED_ERROR
} from 'actions/actionTypes';

export function fetchGroupActivity(groupID, dispatch){
    return groupsService.getGroupActivity(groupID)
        .then(activity =>
            dispatch({ type: FETCH_GROUP_ACTIVITY_SUCCESS, activity, groupID })
        )
        .catch(() =>
            dispatch({ type: FETCH_GROUP_ACTIVITY_ERROR })
        );
}

export function markGroupActivityViewed(groupID, activityIDs, dispatch){
    return groupsService.markActivityViewed(activityIDs)
        .then(()=>
            dispatch({
                type: MARK_GROUP_ACTIVITY_VIEWED_SUCCESS,
                groupID,
                activityIDs
            })
        )
        .catch(()=>
            dispatch({ type: MARK_GROUP_ACTIVITY_VIEWED_ERROR })
        );
}