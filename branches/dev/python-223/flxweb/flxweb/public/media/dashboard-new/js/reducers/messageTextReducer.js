import initialState from 'sources/messageTextDefault.js';

import {
    SHOW_MESSAGE_TEXT,
    HIDE_MESSAGE_TEXT
} from 'actions/actionTypes';

export default function messageTextReducer(state = initialState, action) {
    switch (action.type) {
        case SHOW_MESSAGE_TEXT:
            return Object.assign({}, action.messageText);
        case HIDE_MESSAGE_TEXT:
            return initialState;
        default:
            return state;
    }
}