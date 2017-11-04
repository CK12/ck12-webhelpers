import {
    SHOW_MESSAGE_BOX,
    HIDE_MESSAGE_BOX
} from 'actions/actionTypes';

export function showMessageBox(messageBox) {
    return { type: SHOW_MESSAGE_BOX, messageBox };
}

export function hideMessageBox() {
    return { type: HIDE_MESSAGE_BOX };
}