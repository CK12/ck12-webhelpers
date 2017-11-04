import defaultState from 'sources/userDefault.js';

import {
    GET_USER,
    SET_USER,
    FETCH_USER_SUCCESS,
    FETCH_USER_ERROR,
    UPDATE_USER_IMAGE_SUCCESS,
    UPDATE_USER_IMAGE_ERROR
} from 'actions/actionTypes';

export default function userReducer(state = defaultState, action) {
    switch (action.type) {
        case FETCH_USER_SUCCESS:
        case SET_USER:
            return Object.assign({}, state, action.user);

        case UPDATE_USER_IMAGE_SUCCESS:
            return Object.assign({}, state, {imageURL: action.imageURL })

        case GET_USER:
        case FETCH_USER_ERROR:
        case UPDATE_USER_IMAGE_ERROR:
        default:
            return state;
    }
}