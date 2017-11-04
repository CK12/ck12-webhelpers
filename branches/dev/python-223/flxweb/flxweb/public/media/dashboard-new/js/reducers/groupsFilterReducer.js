import defaultState from 'sources/groupsFilterDefault';

import {
    GET_GROUPS_FILTER,
    SET_GROUPS_FILTER
} from 'actions/actionTypes';

import { merge } from 'lodash';

export default function groupsFilterReducer(state = defaultState, action) {
    switch (action.type) {

        case SET_GROUPS_FILTER:
            return merge({}, state, action.groupsFilter);

        case GET_GROUPS_FILTER:
        default:
            return state;
    }
}