import Base64 from 'common/utils/base64';
import URLHelper from 'urlHelper';

const auth_launch_url = "/auth/launch/lti/ltiApp";

/**
 * Takes a plain js object and creates a lti launch url
 *
 * @param {object} js object 
 */
function buildLTILaunchURL(data, auth_launch_url="/auth/launch/lti/ltiApp"){
    let LTISelectionParamsStr = JSON.stringify(data);
    let Base64LTISelectionParams = Base64.encode(LTISelectionParamsStr);
    let ltiLaunchURL = new URLHelper(auth_launch_url + "/" + Base64LTISelectionParams);
    return ltiLaunchURL;
}

function buildLTIContentReturnURL(ltiLaunchURL, returnUrl, title){
    if (!returnUrl){
        return '';
    }

    let ltiRedirectURL = new URLHelper(returnUrl);
    //prepare content return URL
    ltiRedirectURL.updateSearchParams({
        return_type: "lti_launch_url",
        embed_type: "basic_lti",
        url: ltiLaunchURL.url(),
        text: title,
        title: title
    });
    let url = ltiRedirectURL.url();
    console.log(url);
    return url;
}

function resetLTIAppContext(){
    console.log("Reset LTI app context");
    sessionStorage.removeItem('app-context');
    sessionStorage.removeItem('ltiAppInfo');
}

export {buildLTILaunchURL, buildLTIContentReturnURL, resetLTIAppContext};
