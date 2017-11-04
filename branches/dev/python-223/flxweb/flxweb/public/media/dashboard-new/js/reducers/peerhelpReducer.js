import { merge } from 'lodash';

import {
    FETCH_QA_COUNTS_SUCCESS,
    FETCH_QA_COUNTS_ERROR
} from 'actions/actionTypes';

const defaultState = {
    QACounts: {}
};

export default function peerhelpReducer(state = defaultState, action) {
    switch (action.type) {

        case FETCH_QA_COUNTS_SUCCESS:
            return merge({}, state, {
                QACounts: {
                    [action.groupID]: action.counts
                }
            });

        case FETCH_QA_COUNTS_ERROR:
        default:
            return state;
    }
}