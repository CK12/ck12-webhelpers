import defaultState from 'sources/subjectsDefault.js';

import {
    GET_SUBJECTS,
    FETCH_SUBJECTS_SUCCESS,
    FETCH_SUBJECTS_ERROR
} from 'actions/actionTypes';


export default function subjectsReducer(state = defaultState, action) {
    switch (action.type) {
        case FETCH_SUBJECTS_SUCCESS:
            return Object.assign({}, state, action.subjects);

        case GET_SUBJECTS:
        case FETCH_SUBJECTS_ERROR:
        default:
            return state;
    }
}