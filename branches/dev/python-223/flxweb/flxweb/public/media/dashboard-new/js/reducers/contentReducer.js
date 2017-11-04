import defaultState from 'sources/contentDefault';

import {
	SET_CONTENT_ACTIVE_TAB,
	GET_CONTENT_ACTIVE_TAB,
	FETCH_STANDARDS_SUCCESS,
	FETCH_STANDARDS_ERROR,
	FETCH_RECENTLY_VIEWED_SUCCESS,
	FETCH_RECENTLY_VIEWED_ERROR,
	FETCH_READ_SUCCESS,
	FETCH_READ_ERROR,
	FETCH_VIDEO_SUCCESS,
	FETCH_VIDEO_ERROR,
	FETCH_PLIX_SUCCESS,
	FETCH_PLIX_ERROR,
	FETCH_RWA_SUCCESS,
	FETCH_RWA_ERROR,
	FETCH_PRACTICE_SUCCESS,
	FETCH_PRACTICE_ERROR,
	FETCH_SIMULATION_SUCCESS,
	FETCH_SIMULATION_ERROR,
	PLACE_IN_LIBRARY_SUCCESS,
	PLACE_IN_LIBRARY_ERROR,
    CHECK_ALL_IN_LIBRARY_SUCCESS,
    CHECK_ALL_IN_LIBRARY_ERROR
} from 'actions/actionTypes';

import { merge } from 'lodash';

export default function contentReducer(state = defaultState, action) {
    switch (action.type) {

        case SET_CONTENT_ACTIVE_TAB:
            return Object.assign({}, state, action.content);
        case FETCH_RECENTLY_VIEWED_SUCCESS:
        case FETCH_VIDEO_SUCCESS:
        case FETCH_READ_SUCCESS:
		case FETCH_PRACTICE_SUCCESS:
        case FETCH_PLIX_SUCCESS:
        case FETCH_SIMULATION_SUCCESS:
        case FETCH_RWA_SUCCESS:
            return Object.assign({}, state, action.content);
        case FETCH_STANDARDS_SUCCESS:
            return Object.assign({}, state, action.standards);
        case PLACE_IN_LIBRARY_SUCCESS:
        	let items = Object.assign([],state.placedInLibrary);
        		items.push(action.item);
        	return Object.assign({}, state, {placedInLibrary: items});
        case CHECK_ALL_IN_LIBRARY_SUCCESS:
        	return Object.assign({}, state, action.content);
        case CHECK_ALL_IN_LIBRARY_ERROR:
        case PLACE_IN_LIBRARY_ERROR:
        case GET_CONTENT_ACTIVE_TAB:
        case FETCH_STANDARDS_ERROR:
        case FETCH_RECENTLY_VIEWED_ERROR:
        case FETCH_READ_ERROR:
        case FETCH_VIDEO_ERROR:
        case FETCH_PLIX_ERROR:
        case FETCH_RWA_ERROR:
		case FETCH_PRACTICE_ERROR:
        case FETCH_SIMULATION_ERROR:
        default:
            return state;
    }
}