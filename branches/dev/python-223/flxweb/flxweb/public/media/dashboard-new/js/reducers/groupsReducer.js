import defaultState from 'sources/groupsDefault';

import { has } from 'lodash';

import {
    GET_GROUPS,
    ADD_GROUP,
    FETCH_GROUPS_SUCCESS,
    FETCH_GROUPS_ERROR,
    FETCH_GROUPS_PAGINATION_SUCCESS,
    FETCH_GROUPS_PAGINATION_ERROR
} from 'actions/actionTypes';

function hasNoGroups({groups}){
    return groups && !groups.total;
}

function getNonDefaultGroups({groups}){
    return groups.filter((group)=>!has(group, 'IS_DEFAULT'));
}

function createGroupWithRole({group, role}) {
    return Object.assign({}, group, {role});
}

export default function groupReducer(state = defaultState, action) {
    switch (action.type) {
        case FETCH_GROUPS_SUCCESS:
            return Object.assign({}, state,
                (hasNoGroups(action) ? defaultState : action.groups)
            );

        case FETCH_GROUPS_PAGINATION_SUCCESS:
            return Object.assign({}, state, action.groups, {
                groups: [...state.groups.slice(), ...action.groups.groups]
            });

        case ADD_GROUP:
            return Object.assign({}, state, {
                groups: [createGroupWithRole(action), ...getNonDefaultGroups(state)]
            });

        case GET_GROUPS:
        case FETCH_GROUPS_ERROR:
        case FETCH_GROUPS_PAGINATION_ERROR:
        default:
            return state;
    }
}