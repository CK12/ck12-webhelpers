/**
* Class for sending ADS Events of school claim.
   eventType
	`FBS_ACTION`

	actionName:

	for help popup
	claim_school_help_open
	claim_school_help_dismiss

	for claim school popup
	claim_school_open
	claim_school_dismiss
	claim_school_copy_email
	claim_school_done

	for embed popup
	claim_school_embed_open
	claim_school_embed_dismiss
	claim_school_embed_copy

	for add book action
	claim_school_add_book_start
	claim_school_add_book_complete
	claim_school_add_book_cancel

	for remove book action
	claim_school_remove_book
	claim_school_remove_book_complete
	claim_school_remove_book_cancel

	for title edit
	claim_school_edit_title
	claim_school_edit_title_complete
	claim_school_edit_title_cancel


	each event should also include:
	school_name, 
	school_id 
*
*
*/
define( [], function(){

	/**
	* Payload structure 
	    {
	       actionName : ,
	       school_name : ,
	       school_id : 
	    }
    */

    var DEXTER_EVENT_TYPE =  'FBS_ACTION';

    var _slice  = Array.prototype.slice;

 	
    var _logADS  =  function(eventType,payload){
    	 return window.dexterjs && window.dexterjs.logEvent(eventType, payload || {});
    };

    // expects arguments to be actionName, school_name, school_id, 
    var logADSEvent  =  function(){

    	var args =  _slice.call(arguments);

    	if( args.length < 3 ){
    		throw new Error('Invalid arguments for posting school claim ADS event')
    	};

    	var payload  = {
 			actionName : args[0],
            school_name : args[1],
            school_id : args[2]
    	};

    	var eventType  = args[3] || DEXTER_EVENT_TYPE;
    	_logADS(eventType, payload);

    }
    return {
    	logADS : logADSEvent
    }

})