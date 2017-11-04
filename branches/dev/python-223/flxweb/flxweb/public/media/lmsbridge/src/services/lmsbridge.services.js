import {ck12ajax, ck12AuthAjax} from 'ck12-ajax';
import Promise from 'bluebird';

// This gets set to https://www.ck12.org/flx in build
const FLX_API_PREFIX = '/flx';

const createAssignmentError = (error) => {
    return {
      error: true,
      payload: error
    };

};
const createAssignmentSuccess = (response) => {
    return {
      payload: response
    };
}
 /*
            AUTH_API_PREFIX = config.auth_api_path,
            LMS_PROVIDER = config.lms_provider,
            AUTH_APP_NAME = config.auth_app_name,
            FLX_APP_NAME = config.app_name,
            PROVIDER = config.provider;
*/

/**
 * PracticeAppServices.assign
 *
 * Assign a concept(s) to LMS group
 * @Param
 *  EID_List: array of concept encodedIDs,
 * @param
 *  group_id: ID of group for assignment
 * @Param
 *  Title: assignment title
 * @param
 *  due_date: Due date for assignment
 */
//export const assign = function (EID, ck12_group_id, lms_group_id, title, due_date, assign_handle, launch_key, appID, provider="lti", appName="ltiApp") {
const assign = function (post_data, api_server_url) {
    let url = `${FLX_API_PREFIX}/assign/assignment/${post_data.lmsGroupID}`;
    if (api_server_url) {
        url = `${api_server_url}${FLX_API_PREFIX}/assign/assignment/${post_data.lmsGroupID}`;
    }
    return ck12ajax({
        url: url,
        data: post_data,
        method: 'POST',
	withCredentials: true,
	requestedWith: false
    });
};

const submitScore = function (post_data, api_server_url) {
    let url = `${FLX_API_PREFIX}/update/my/${post_data.appID}/assignment/status`;
    if (api_server_url) {
        url = `${api_server_url}${FLX_API_PREFIX}/update/my/${post_data.appID}/assignment/status`;
    }
    return ck12ajax({
        url: url,
        data: post_data,
        method: 'POST',
	withCredentials: true,
	requestedWith: false
    });
};

export const createAssignment = (concepts, EID, ck12_group_id, lms_group_id, title, due_date, assign_handle, launch_key, appID, api_server_url, provider="lti", appName="ltiApp") => {
    var post_data = {
        'concepts' : concepts,
        'appName': appName,
        'handle': assign_handle,
        'appID': appID,
        'assignmentTitle': title
    };
    if (provider === 'lti'){
        post_data.lmsGroupID = ck12_group_id;
        post_data.launch_key = launch_key;
    } else {
        post_data.groupID = ck12_group_id;
        post_data.lmsGroupID = lms_group_id;
        post_data.due = due_date;
        post_data.assignmentUrl = 'app://?assignmentEID=' + EID;
    }
    return new Promise((resolve) => {
        assign(post_data, api_server_url)
            .then((response) =>{
                //resolve(createAssignmentSuccess(response));
                resolve(response);
            }).catch((err) =>{
                resolve(createAssignmentError(err));
           });
    });
};

export const submitLMSScore = (assignmentID, score, launch_key, context_id, artifactID, appID, api_server_url, provider='lti') => {
    var postData = {
	assignmentID: assignmentID,
	score: score,
	artifactID: artifactID,
	nonPractice: true,
        appID: appID,
        contextID: context_id
    };
    if (provider === 'lti'){
	postData.launchKey = launch_key;
	postData.contextID = context_id;
    }
    return new Promise((resolve) => {
        submitScore(postData, api_server_url)
            .then((response) =>{
                resolve(response);
            }).catch((err) =>{
                resolve(createAssignmentError(err));
           });
    });
};
