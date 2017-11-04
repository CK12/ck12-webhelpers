import initialState from 'sources/groupsAssignments'

import {
    FETCH_GROUP_ASSIGNMENTS_SUCCESS,
    FETCH_GROUP_ASSIGNMENTS_ERROR
} from 'actions/actionTypes';

export default function groupsAssignmentsReducer(state = initialState, action) {
    switch (action.type) {

        case FETCH_GROUP_ASSIGNMENTS_SUCCESS:
            return Object.assign({}, state, {
                [action.groupID]: action.assignments
            });

        case FETCH_GROUP_ASSIGNMENTS_ERROR:
        default:
            return state;
    }
}