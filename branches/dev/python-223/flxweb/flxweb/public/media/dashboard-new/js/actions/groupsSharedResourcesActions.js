import { groupsService } from 'services';

import {
    FETCH_GROUP_SHARED_RESOURCES_SUCCESS,
    FETCH_GROUP_SHARED_RESOURCES_ERROR
} from 'actions/actionTypes';

export function fetchSharedResources(groupID, dispatch){
    return groupsService.getGroupSharedActivity(groupID)
        .then(sharedResources =>
            dispatch({ type: FETCH_GROUP_SHARED_RESOURCES_SUCCESS, sharedResources, groupID })
        )
        .catch(() =>
            dispatch({ type: FETCH_GROUP_SHARED_RESOURCES_ERROR })
        );
}

