/**
* Capture ADS event when user clicks on the close button:
 FBS_USER_ACTION with Desc = “soft_reg_close”.
 Additional parameter called “style” to capture banner or popup.
 ( You can use declarative dexterJS for this).
Capture ADS event when user clicks on the sign-in button:
 FBS_USER_ACTION with Desc = “soft_reg_signin”.
 Additional parameter called “style” to capture banner or popup.
 ( You can use declarative dexterJS for this).
Capture ADS event when user clicks on the sign-up button:
FBS_USER_ACTION with Desc = “soft_reg_signup”.
Additional parameter called “style” to capture banner or popup.
( You can use declarative dexterJS for this)
Capture ADS event when user clicks on “Show more” or “Show less” links
on the SignUp/SignIn popup
Capture ADS event when user clicks on “Show more” or “Show less” links on
the SignUp/SignIn popup
For FBS_SIGNINS and FBS_SIGNUPS

*
*
*/
define( [], function(){


    var _slice  = Array.prototype.slice;


    var _logADS  =  function(eventType,payload){
    	 return window.dexterjs && window.dexterjs.logEvent(eventType, payload || {});
    };

    // expects arguments to be actionName, school_name, school_id,
    var logADSEvent  =  function(){

    	var args =  _slice.call(arguments);

    	if( args.length == 0 ){
    		throw new Error('Invalid arguments for posting Soft Registration ADS event')
    	};

    	var eventType  = args[0];
      var payload =  args[1];
    	_logADS(eventType, payload);

    }
    return {
    	logADS : logADSEvent
    }

})
