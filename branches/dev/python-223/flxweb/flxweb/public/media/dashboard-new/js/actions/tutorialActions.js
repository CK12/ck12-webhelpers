import {
    HIDE_TUTORIAL,
    SHOW_TOOLTIP_TUTORIAL,
    IS_FIRST_TIME_USER
} from 'actions/actionTypes';

export function hideTutorial() {
    return { type: HIDE_TUTORIAL };
}

export function showTooltip(path){
    return { type: SHOW_TOOLTIP_TUTORIAL, path};
}

export function isFirstTimeUser(state=false){
    return { type: IS_FIRST_TIME_USER, state };
}