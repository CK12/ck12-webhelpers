import initialState from 'sources/messageBoxDefault.js';

import {
    SHOW_MESSAGE_BOX,
    HIDE_MESSAGE_BOX
} from 'actions/actionTypes';

export default function messageBoxReducer(state = initialState, action) {
    switch (action.type) {
        case SHOW_MESSAGE_BOX:
            return Object.assign({}, action.messageBox);
        case HIDE_MESSAGE_BOX:
            return initialState;
        default:
            return state;
    }
}