import defaultState from 'sources/appDataDefault';

import {
    SAVE_APP_DATA_SUCCESS,
    SAVE_APP_DATA_ERROR,

    FETCH_APP_DATA_SUCCESS,
    FETCH_APP_DATA_ERROR
} from 'actions/actionTypes';

export default function appDataReducer(state = defaultState, action) {
    switch (action.type) {
        case FETCH_APP_DATA_SUCCESS:
        case SAVE_APP_DATA_SUCCESS:
            return Object.assign({}, state, {
                IS_DEFAULT: false,
                userdata: action.userdata
            });

        case FETCH_APP_DATA_ERROR:
            return Object.assign({}, state, {
                IS_DEFAULT: false // In case the user never saved to app data before
            });
        case SAVE_APP_DATA_ERROR:
        default:
            return state;
    }
}