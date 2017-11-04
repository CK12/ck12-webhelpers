import initialState from 'sources/modalDefault.js';

import {
    SHOW_MODAL,
    HIDE_MODAL
} from 'actions/actionTypes';

export default function modalReducer(state = initialState, action) {
    switch (action.type) {
        case SHOW_MODAL:
            return Object.assign({}, action.modal);
        case HIDE_MODAL:
            return initialState;
        default:
            return state;
    }
}