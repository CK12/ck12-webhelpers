import {
    FETCH_GROUP_SHARED_RESOURCES_SUCCESS,
    FETCH_GROUP_SHARED_RESOURCES_ERROR
} from 'actions/actionTypes';

export default function groupsSharedResourcesReducer(state = {}, action) {
    switch (action.type) {

        case FETCH_GROUP_SHARED_RESOURCES_SUCCESS:
            return Object.assign({}, state, {
                [action.groupID]: action.sharedResources
            });

        case FETCH_GROUP_SHARED_RESOURCES_ERROR:
        default:
            return state;
    }
}