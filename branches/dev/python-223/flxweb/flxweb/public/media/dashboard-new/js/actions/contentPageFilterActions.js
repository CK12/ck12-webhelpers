import {
    GET_CONTENT_FILTER,
    SET_CONTENT_FILTER
} from 'actions/actionTypes';

export function getContentFilter() {
    return { type: GET_CONTENT_FILTER };
}

export function setContentFilter(contentFilter) {
    return { type: SET_CONTENT_FILTER, contentFilter };
}