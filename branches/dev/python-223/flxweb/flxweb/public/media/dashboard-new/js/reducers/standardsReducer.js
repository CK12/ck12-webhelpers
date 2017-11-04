import defaultState from 'sources/standardsDefault';

import {
	FETCH_STANDARDS_SUCCESS,
	FETCH_STANDARDS_ERROR,
	SET_SELECTED_STANDARD_INDEX,
	SET_SELECTED_SUBJECT_INDEX,
	SET_SELECTED_GRADE_INDEX,
	FETCH_STANDARDS_CORRELATIONS_SUCCESS,
	FETCH_STANDARDS_CORRELATIONS_ERROR,
	FETCH_BOOKS_SUCCESS,
	FETCH_BOOKS_ERROR
} from 'actions/actionTypes';

import { merge } from 'lodash';

export default function standardsReducer(state = defaultState, action) {
    switch (action.type) {
    	case SET_SELECTED_STANDARD_INDEX:
    	case SET_SELECTED_SUBJECT_INDEX:
    	case SET_SELECTED_GRADE_INDEX:
        case FETCH_STANDARDS_SUCCESS:
        case FETCH_BOOKS_SUCCESS:
        case FETCH_STANDARDS_CORRELATIONS_SUCCESS:
            return Object.assign({}, state, action.standards);
        case FETCH_STANDARDS_CORRELATIONS_ERROR:
        case FETCH_BOOKS_ERROR:
        case FETCH_STANDARDS_ERROR:
        default:
            return state;
    }
}