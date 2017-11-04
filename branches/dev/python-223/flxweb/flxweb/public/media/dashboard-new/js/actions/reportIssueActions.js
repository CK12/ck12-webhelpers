import { reportIssueService } from 'services';
import { hideModal} from 'actions/modalActions';
import {
    showMessageText,
    hideMessageText
} from 'actions/messageTextActions';
import {
    FETCH_ARTIFACT_FOR_REPORT_ISSUE_SUCCESS,
    FETCH_ARTIFACT_FOR_REPORT_ISSUE_ERROR,
    POST_REPORT_ISSUE_SUCCESS,
    POST_REPORT_ISSUE_ERROR
} from 'actions/actionTypes';

export function fetchAtrifactForReportIssue(dispatch){
	reportIssueService.fetchArtifactForReportIssue()
        .then(({web}) =>
            dispatch({ type: FETCH_ARTIFACT_FOR_REPORT_ISSUE_SUCCESS, reportIssue:{artifactID:web.artifactID} })
        )
        .catch( ()=>
            dispatch({ type: FETCH_ARTIFACT_FOR_REPORT_ISSUE_ERROR })
        );
}
export function postReportIssue(dispatch,data){
	reportIssueService.postReportIssue(data)
        .then((response) =>{
            dispatch({ type: POST_REPORT_ISSUE_SUCCESS});
            dispatch(hideModal());
            dispatch(showMessageText({
                messageType: 'success',
                message: 'Feedback sent. Thank you for your valuable feedback!'
            }));
        }
        )
        .catch( ()=>
            dispatch({ type: POST_REPORT_ISSUE_ERROR })
        );
}