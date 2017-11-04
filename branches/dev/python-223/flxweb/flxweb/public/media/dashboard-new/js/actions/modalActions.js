import {
    SHOW_MODAL,
    HIDE_MODAL
} from 'actions/actionTypes';

export function showModal(modal) {
    return { type: SHOW_MODAL, modal };
}

export function hideModal() {
    return { type: HIDE_MODAL };
}