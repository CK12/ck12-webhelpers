//import default state 
import defaultState from 'sources/contentPageFilterDefault'
//import actionTypes
import {
    GET_CONTENT_FILTER,
    SET_CONTENT_FILTER
} from 'actions/actionTypes';

import { merge } from 'lodash';

export default function contentFilterReducer(state = defaultState, action) {
    switch (action.type) {

        case SET_CONTENT_FILTER:
            return merge({}, state, action.contentFilter);

        case GET_CONTENT_FILTER:
        default:
            return state;
    }
}