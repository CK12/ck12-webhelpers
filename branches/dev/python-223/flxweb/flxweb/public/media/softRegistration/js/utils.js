define( [
	'softRegistration/SoftRegConfig',
	'softRegistration/RegStorage'
], function(SoftRegConfig, RegStorage){

	var urlConfig =  SoftRegConfig.urlConfig;

	// method to fetch the cookie value by name
	var readCookie  = function (name){
    	var c = document.cookie.split('; ');
    	var cookies = {}, C;

    	for(i=c.length-1; i>=0; i--){
           C = c[i].split('=');
           cookies[C[0]] = C[1];
    	}	

    	return cookies[name];
	};

	//form the registration URL for hard registration
	var getRegistrationURL =  function(){
		var role =  readCookie('flxweb_role') || 'student' ;
		var url =  urlConfig.SIGNUP_COMPLETE_URL + role+'?requestor=' + urlConfig.requestor+ "&returnTo="+urlConfig.returnTo ;
		return url;
	};

	var getForgetPasswordUrl =  function(){
		var url =  urlConfig.FORGET_PASSWORD_URL + "?returnTo="+urlConfig.returnTo ;
		return url;
	};

	var BANNER_REFERRER = 'enc_reg_banner',
	    POPUP_REFERRER  = 'enc_reg_popup';
	var getReferrer =  function(){
			var viewCount = RegStorage.getViewCount();

			switch( viewCount ){
				  case 2:
					 return BANNER_REFERRER;
					 break;
					case 3 :
					  return POPUP_REFERRER;
						break;
					default :
					  return null; // should not happen
			}
	}

	// get page params 
	// get the page params from the URL.
	// can be handy if one wishes to use the modality type
	// in view

	var getPageParams =  function(){
	    var	 url,
		     hostname,
		     urlSpilt =  [],
		     regex  = /\//;

		url  = location.href;
		hostname  = location.hostname+ '/';
		url =  decodeURIComponent(url);
		url =  url.replace(hostname,'').replace(/https{0,1}:\/{2}|\/$|\?\S*/g,'');
		urlSpilt = url.split(regex);
		urlSpilt = urlSpilt.filter(function(val){
	         return val.length >0
	    })
		// console.log(urlSpilt);
		return urlSpilt
	};

	var hasRedirectedFromSEO =  function(){
		var referrer =  document.referrer;
		var SETestRegex =  SoftRegConfig.SEReferrerRegex ;
		var hasLanded =  SETestRegex.length == 0;

		if( referrer.length ==0 ) return false;

		var anchorEle =  document.createElement('a');
		anchorEle.href =  referrer;

		var referrerHost =  anchorEle.hostname;

		for ( var i = 0, len =  SETestRegex.length ; i < len; i++){
			hasLanded =  hasLanded || SETestRegex[i].test(referrerHost);
			if( hasLanded ) break;
		}
		// console.log(' it has landed : '+ hasLanded)
		return hasLanded;
	}
	return {
		readCookie : readCookie,
		getRegistrationURL: getRegistrationURL,
		getPageParams : getPageParams,
		hasRedirectedFromSEO : hasRedirectedFromSEO,
		getForgetPasswordUrl: getForgetPasswordUrl,
		getReferrer : getReferrer
	}
})
