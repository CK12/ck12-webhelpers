import defaultState from 'sources/reportIssueDefault';

import {
    FETCH_ARTIFACT_FOR_REPORT_ISSUE_SUCCESS,
    FETCH_ARTIFACT_FOR_REPORT_ISSUE_ERROR,
    POST_REPORT_ISSUE_SUCCESS,
    POST_REPORT_ISSUE_ERROR
} from 'actions/actionTypes';

export default function reportIssueReducer(state = defaultState, action) {
    switch (action.type) {
        case FETCH_ARTIFACT_FOR_REPORT_ISSUE_SUCCESS:
            return Object.assign({}, state, action.reportIssue);
        case FETCH_ARTIFACT_FOR_REPORT_ISSUE_ERROR:
        case POST_REPORT_ISSUE_SUCCESS:
        case POST_REPORT_ISSUE_ERROR:
        default:
            return state;
    }
}