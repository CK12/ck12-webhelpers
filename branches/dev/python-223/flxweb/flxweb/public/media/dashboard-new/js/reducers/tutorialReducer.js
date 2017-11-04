import defaultState from 'sources/tutorialDefault.js';
import { set, merge } from 'lodash';
import {
    HIDE_TUTORIAL,
    SHOW_TOOLTIP_TUTORIAL,
    IS_FIRST_TIME_USER
} from 'actions/actionTypes';


function setTooltipState(state, action, tooltipState){
    return merge({}, state, defaultState, // defaultState takes precendence
        set({}, action.path, tooltipState)
    );
}

function hideTutorial(){
    return Object.assign({}, defaultState);
}

export default function tutorialReducer(state = defaultState, action) {
    switch (action.type) {
        case SHOW_TOOLTIP_TUTORIAL:
            return setTooltipState(state, action, true);

        case HIDE_TUTORIAL:
            return hideTutorial();

        case IS_FIRST_TIME_USER:
            return Object.assign({}, state, {
                isFirstTimeUser: action.state
            });

        default:
            return state;
    }
}