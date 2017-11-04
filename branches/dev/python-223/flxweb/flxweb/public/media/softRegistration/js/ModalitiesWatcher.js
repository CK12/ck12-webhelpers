/**
* Class establishing the logic for initiating the Soft Registration flow.
* The current implementation is to trigger an event based on certain number of categorized page
* visits. The category of Pages can be either Modality Page or All Pages and is configurable.
* The Counter logic is somewhat as below :
*  a. There is a defined number of page views after which we need to trigger a soft wall
*  b. After that a registration wall shows up
*  c. If the user ignores/closes it, we either show it up again after a certain interval.
*  d. Or the counter can completely stop and not to ask the user again anytime.
*    Explaination of variables :

*    cycle : It is essentially the period between two registration walls

*    config.numberOfViewCycles : It tells the number of views that have been completed.
                                 It can be reset once the registration wall hits. After
                                 that it can be dependent on other params whether it continues
                                 getting populated or not

*    config.maxViewInCurrentCycle : It tells like how many views can be seen before the registration wall
									hits. It can vary in each cycle based on logic.
*    cyclesCompleted              : It tells like how many cycles have been completed. It is relevant when you want
									to stop soft-registration in after certain cycles are completed.

*    Current Count Expiry :
        Essentially the rationale behind having an expiry token is to make sure if the user is coming after a
        certain time-period , we should be clearing the counter so that if the user comes at a later point of time
        , he should not be shown the registration wall based on the previous searches he did some days ago.

        However, if the user happens to ignore the registration wall, then that does get persisted forever and does
        not get cleared.

*/
define([
	'backbone',
	'common/utils/user',
	'softRegistration/RegEvents',
	'softRegistration/SoftRegConfig',
	'softRegistration/RegistrationOrchestrator',
	'softRegistration/RegStorage',
	'softRegistration/utils',
	'softRegistration/SoftRegistrationADS',
	'jquery'
], function(Backbone, User, RegEvents , SoftRegConfig , RegistrationOrchestrator, RegStorage , utils, SoftRegistrationADS,  $){

	var ModalitiesWatcher = function(data){
		var pageType = SoftRegConfig.pageType;
	  var EventType = SoftRegConfig.EventType;
		var config =  {};
		var defer = $.Deferred();
		var _prevRoute =  null;
		var _prevParams =  null;

		/** config.numberOfViewCycles : number of view cycles that have been completed
		*   config.maxViewInCurrentCycle : Max number of pages that can be visited in current cycle
		*/
		this.initialize =  function(parentConfig){
			var self = this;
			// if the caller has not passed any config, then we take the default config from config class
			config  = parentConfig || SoftRegConfig.defaultModalityConfig;

			// if cache expiry is not defined, then make it max value
			// TODO is to have a flag , rather than
			config.cacheExpiry =  config.cacheExpiry || Number.MAX_VALUE;

			// Initialize the rule orchestrator and storage classes
			RegStorage.initialize(config);
			RegistrationOrchestrator.initialize(config);

			// Event Listener for closing of popup, mainly for decreamental purposes
			RegEvents.on('raiseEventForReg', this.handleRegEvent, this);
			RegEvents.on('raiseEventForSignIn', this.handleSignInEvent, this);
			RegEvents.on(EventType.PAGE_ROUTE_CHANGE, this.handleSinglePageRoute, this);
			RegEvents.on(EventType.TRIGGER_UA_SUCCESS_POPUP, this.handleViewCycleCompletion, this); // Once it is success for U-13 , do not let the popup come again
			window.addEventListener(EventType.PAGE_ROUTE_CHANGE, function(e){
				self.handleSinglePageRoute(e.detail.route, e.detail.param);
			})
			this.registerLogout();
			Backbone.history.on('route', function(router, name, args){
				self.handleSinglePageRoute(name, args)
			})

			if(this.shouldAbandonInit() || SoftRegConfig.singlePageRule.test(location.pathname)) return ;

			this.postInit();

		};

		this.postInit =  function(){
			// check expiry and clear storage
			this.checkExpiryAndClearStorage();
			// Essenitally if all pages are considered , then we increase the page counter on initialization
			if( config.pagesToConsider == pageType.ALL ) {
				this.increasePageCounter();
			}
			defer.resolve();
		};

		this.shouldAbandonInit =  function(){
			return ( this.isSoftRegDisabled() || ( this.isRedirectionFlagged() && !config.shouldCountForSEORedirection  ) ) ;
		};

		// the function to check the various cases and increase the counter
		// Right now on any page, we are increasing the counter
		this.increasePageCounter =  function(){
			 var modalityParams =  utils.getPageParams(), // get modality params of the current modality
			 	 pathName =  location.pathname,
			 	 histPathArrays, //historic paths in an array. Used for ignoring already visited pages if
			 	 shouldVisitedPageBeStored = config.shouldVisitedPageBeStored,
			 	 currViewCount ;  // stores the current view count

				if(!this.shouldExemptPage( modalityParams )){

					currViewCount = this.getViewCount();  // current Count of visited modalities
					histPathArrays   =  RegStorage.getModalitiesArray(); // current array of visited modalities

					if( !shouldVisitedPageBeStored  ){  //  If current modality need not be stored for future to count the number refs
						RegStorage.saveModalitiesCount(++currViewCount); // increase the modality count
						config.enableCacheTTL ? RegStorage.saveCountExpiryTS() : null;

					}else{
						if( histPathArrays.indexOf( pathName ) == -1){
							histPathArrays.push(pathName); // Add the current modality to the path array
							RegStorage.saveModalitiesArray(histPathArrays); // save the new array to local storage
						    RegStorage.saveModalitiesCount(++currViewCount); // increase the modality count
						    config.enableCacheTTL ? RegStorage.saveCountExpiryTS() : null;

						}else{   // If the current modalities exist then we need not
						  console.debug('this one is already visited')
					  }
					}

				}else{
					console.log('exempted because of modality Type is ', modalityParams[0])
				}

		};


		this.isPreviousRoute =  function(route, params){
			if( route === _prevRoute) {
				var _paramType =  typeof params ;
				if( _paramType === 'string'){
					if( _prevParams === params ) { // if the previous params matches the current one, it is previous route
						return true ;
					};
				}else if( Array.isArray( params) === Array.isArray( _prevParams)){
						if( params.length !== _prevParams.length ){
							return false; // if the previous params length is not equal to the current one, it is new route
						}
						for ( var i = 0, len = params.length ; i < len ; i++){
							if( params[i] != _prevParams[i]){
								return false; // if the previous params length is not equal to the current one, it is new route
							}
						}
					return true;
					// routes matching, params are array are matching in order
					// if it is not new route from the above checks, then it is old route
				}
			}
			return false;
			// returns false
			//1. if routes are not matching
			//2. routes matching, params are string and not matching
		};

		// BUG 50721 : Special Case of Issue where routes were changing twice before page load
		// The corresponding module could not handle it , so handling as a special case
		this.isSpecialRouteExemption   = function( route, params){
			return ( route == 'loadGrade' && params.length == 0  && $.cookie('flxwebgrade') != null)
		};

		// Whenever there is a single page Route Change, then we need to handle the following use cases.
		this.handleSinglePageRoute =  function(route, params){
			console.log( route, params);
			if( this.isPreviousRoute(route, params) || this.isSpecialRouteExemption( route, params)) return;
			_prevRoute = route;
			_prevParams = params;
			if ( this.shouldAbandonInit() ) return ;
			this.postInit();
			RegEvents.trigger(EventType.CLOSE_REG)
			this.triggerSoftRegistration();
		};

		//
		this.checkExpiryAndClearStorage =  function(){
			if( Date.now() >= RegStorage.getCountExpiryTS() ){
				RegStorage.clearModalitiesCount();
				RegStorage.clearCountExpiryTS();
			}
		};

		this.registerLogout = function(){
			var self = this;
			$('#top_usermenu_signout').bind('click', function(){
				self.handleClearAll();
			})
		}

		this.handleClearAll =  function(){
            window.localStorage.removeItem("studentId");
            window.localStorage.removeItem("coachView");
            RegStorage.clearModalitiesCount();
            RegStorage.clearCountExpiryTS();
            RegStorage.clearShouldDisableSoftReg();
            RegStorage.clearSessionTriggeredFromSEO();
		};

		this.isSoftRegDisabled =  function(){
			return RegStorage.getShouldDisableSoftReg() || RegistrationOrchestrator.DisableRule.call(this, config) ;
		};


		// Checks if the modality page has landed directly from SEO,
		// If the page has landed from SEO, then we dont allow trigger to happen

    /** LOGIC IS LIKE THIS
    Land from SEO
        1. DO NOT ALLOW REDIRECTION TO BE counted
        2. DO ALLOW REDIRECTION TO BE counted

    DIDN'T LAND FROM SEO

        1. IF SESSION IS GENERATED VIA SEO
              1. IF CURRENT PAGE IS GENERATED VIA ADDRESS BAR
              2. IF CURRENT PAGE IS NOT GENERATED VIA ADDRESS BAR

        2.  IF SESSION IS NOT GENERATED VIA SEO
              1. ALLOW PAGE counter
              2. DO NOT ALLOW PAGE COUNTER


    */
		this.isRedirectionFlagged =  function(){

      var hasLandedFromSEO  =  utils.hasRedirectedFromSEO();
      var sessionTriggeredFromSEO =  RegStorage.hasSessionTriggeredFromSEO(); // SS

      if( hasLandedFromSEO ){
        // dump some flag to SS
        // based on shouldTriggerSRFromSEO flag
        if( config.shouldTriggerSRFromSEO){

          RegStorage.sessionTriggeredFromSEO();
          return false;

        }else{

          return true;

        }


      }else{
           if( sessionTriggeredFromSEO ){

                if( document.referrer == ''){

                    return true;

                }else{

                    return false;
                }

           }else{
              return !config.shouldCountForAddressBarAccess;
           }
      }
		};

		// triggers to check cases fulfilment of soft registration conditional to
		// user not logged in and the configuration passed
		this.triggerSoftRegistration =  function(){
			var self = this;
			defer.done(function(){
				if( self.shouldAbandonRegistrationTrigger() ) return ;

				// in case the call is to make modality counter
				if( config.pagesToConsider ==  pageType.MODALITIES ){
					self.increasePageCounter();
				}
				self.checkUserLoginState(self.modalityCheckCallback, self.clearAllCb );
			});
		};

		this.shouldAbandonRegistrationTrigger =  function(){
			return this.isSoftRegDisabled() || this.isRedirectionFlagged() || this.shouldExemptPage(utils.getPageParams());
		};

		// check if user is logged in or not.
		// if logged in then clear every thing and there is no scope for soft reg
		// if not logged in then there is a scope for soft reg
		this.checkUserLoginState = function(callback, cleanupCallback){
			var self =  this;
				User.getUser()
				.done(function(res){
				 	if(!res.userInfoDetail.id){
				 			callback.call(self)
				 	}else{
				 		cleanupCallback.call(self);
				 	}
				})
				.fail( function(rej){
					// callback.call(self); // BUG 52528 : Because of Auth API failures at times, though the user seems logged in, the ER banner shows up
				})
		};

		// clears the entries in storage for page count, page pathname array
		this.clearAllCb =  function(){
				RegStorage.clearModalitiesCount();
	            RegStorage.clearModalitiesArray();
	            RegStorage.clearCountExpiryTS();
	            RegStorage.setShouldDisableSoftReg(true)
		};

		// based on the rules defined
		// it either calls trigger or clear based on which rule is truthy
		this.modalityCheckCallback =  function(){
			 var modalityParams =  utils.getPageParams() ; // get modality params of the current modality

				var returnedRule =  RegistrationOrchestrator.RuleOrchestrator.call(this);

				if ( !returnedRule.status || returnedRule.status  == 'IGNORE'){

					console.log('noop in page check');

				}else if ( returnedRule.status == 'CLOSE'){

					this.handleViewCycleCompletion();

				}else if ( returnedRule.status == 'SHOW'){

					RegEvents.trigger(EventType.TRIGGER_REG, returnedRule);  //TODO : Merge modality params to be discussed

					var style =  returnedRule.type.toLowerCase(), popup =  '';

					if( style == 'popup'){
						popup =  returnedRule.subType ? returnedRule.subType.toLowerCase() : 'signup';
					}
					var role =  $.cookie('flxweb_role') || 'student';

					SoftRegistrationADS.logADS('FBS_SOFT_REG', {
									member_type :  role,
									style : style,
									popup : popup
					})

				}
		};

		// should exempt the page
		this.shouldExemptPage =  function(params){
			return RegistrationOrchestrator.ExemptionOrchestrator(params);
		};

		// callback on a cycle completion
		// either it can be cancel of a popup or ignorance of  banner.
		this.handleViewCycleCompletion =  function(){
			this.clearAllCb();
		};


		this.getViewCount =  function(){
			return RegStorage.getViewCount();
		};

		this.handleRegEvent = function(viewType){
			var timeout =  0;
			if( viewType == 'BANNER'){
				timeout  =  1000;
			}
			RegEvents.trigger(EventType.TRIGGER_REG, {
				type: 'POPUP',
				subType :'REGISTRATION',
				timeout : timeout
			})
		};
		this.handleSignInEvent = function(viewType){
			var timeout =  0;
			if( viewType == 'BANNER'){
				timeout  =  1000;
			};
			RegEvents.trigger(EventType.TRIGGER_REG, {
				type: 'POPUP',
				subType :'SIGNIN',
				timeout : timeout
			})
		};

		this.initialize(data);
	};

	ModalitiesWatcher.instance  = null;

   	var initialize = function(data){
       		if( ModalitiesWatcher.instance  == null){
       			ModalitiesWatcher.instance = new ModalitiesWatcher(data);
       		}
       		return ModalitiesWatcher.instance;
    };

    var triggerSoftRegistration =  function(data){
    	if( ModalitiesWatcher.instance ){
    		ModalitiesWatcher.instance.triggerSoftRegistration(data);
    	}
    }


	return {
		initialize : initialize,
		triggerSoftRegistration : triggerSoftRegistration
	}

})
