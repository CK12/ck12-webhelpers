import {
    SHOW_MESSAGE_TEXT,
    HIDE_MESSAGE_TEXT
} from 'actions/actionTypes';

export function showMessageText(messageText) {
    return { type: SHOW_MESSAGE_TEXT, messageText };
}

export function hideMessageText() {
    return { type: HIDE_MESSAGE_TEXT };
}