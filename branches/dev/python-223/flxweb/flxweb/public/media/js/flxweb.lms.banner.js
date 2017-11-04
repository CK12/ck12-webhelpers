define([],function(){
    return function(page_context){

	// Handle click to switch back to old app.
	window.backToPreviousLTI = function(e){
	    e.preventDefault();
            var dexterPayload = {'desc': 'classic_lti_app_switch'};
            if (window._ck12){
                _ck12.logEvent('FBS_USER_ACTION', dexterPayload);
            }
            setTimeout(function(){
                window.location.href = "/lmspractice/ltiApp/index.html?appReturn";
            }, 1500);

	}
        // Check to see if banner should be shown.
	function shouldShowBanner(){
	    var modality_data = window.js_modality_data;
	    if (!/lti-app/.test(window.lmsContext)){
	        return false;
	    } else if (modality_data && modality_data.artifact &&modality_data.artifact.artifactType === "studyguide"){
		return false;
	    } else {
		return true;
	    }
	}

	function showBanner(){
	    try {
		var class_attr = document.getElementById('lti_help_banner').getAttribute('class').replace('hide','');
		document.getElementById('lti_help_banner').setAttribute('class', class_attr);
	    } catch(e){
		console.log("Could not show banner:"+ String(e));
	    }
	}

        // Check to see if banner should be shown.
	if (shouldShowBanner()){
		if (page_context && page_context === 'browse' && !sessionStorage.getItem('lti-switch-banner') ){
		    // For banner on brose page only show it once per session
		    try {
			showBanner('browse');
			sessionStorage.setItem('lti-switch-banner',1);
		    } catch(e){
			console.log("Error showing banner:" +String(e));
		    }
		} else if (page_context && page_context === 'concept'){
		    showBanner('concept');
		}
	    }
    }
})
