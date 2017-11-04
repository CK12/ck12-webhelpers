import {
    GET_GROUPS_FILTER,
    SET_GROUPS_FILTER
} from 'actions/actionTypes';

export function getGroupsFilter(groupsFilter) {
    return { type: GET_GROUPS_FILTER, groupsFilter };
}

export function setGroupsFilter(groupsFilter) {
    return { type: SET_GROUPS_FILTER, groupsFilter };
}

