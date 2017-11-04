import { groupsService } from 'services';

import {
    FETCH_GROUP_ASSIGNMENTS_SUCCESS,
    FETCH_GROUP_ASSIGNMENTS_ERROR
} from 'actions/actionTypes';

export function fetchGroupAssignments(groupID, dispatch){
    return groupsService.getGroupAssignments(groupID)
        .then(assignments =>
            dispatch({ type: FETCH_GROUP_ASSIGNMENTS_SUCCESS, assignments, groupID })
        )
        .catch(() =>
            dispatch({ type: FETCH_GROUP_ASSIGNMENTS_ERROR })
        );
}

