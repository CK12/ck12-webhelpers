import { get } from 'lodash';
import defaultState from 'sources/countsDefault';

import {
    GET_COUNTS,
    INCREMENT_COUNT,
    FETCH_COUNTS_SUCCESS,
    FETCH_COUNTS_ERROR
} from 'actions/actionTypes';

export default function userReducer(state = defaultState, action) {
    switch (action.type) {

        case FETCH_COUNTS_SUCCESS:
            return Object.assign({}, state, action.counts);

        case INCREMENT_COUNT:
            return Object.assign({}, state, {
                [action.countType]: get(state, action.countType) + action.amount
            });

        case GET_COUNTS:
        case FETCH_COUNTS_ERROR:
        default:
            return state;
    }
}