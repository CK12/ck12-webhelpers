/**
* The class responsible for initiating a view change for the event raised from 
* ModalitiesWatcher.
* There is only one method exposed outside of this class
*  1. initialize : 
*      Is called from index.js. It needs to be passed some configuration for view showing 
*      It listens to two events from ModalitiesWatcher
*         a. `raiseEventForSoftReg` : For showing a view for soft Registration
*         b. `raiseEventForHardReg` : For redirecting the user for hard registration.
* V1.1 :
* There are essentially three events that need to be raised from the UI and listened at the model level
* 1. Click on Register button
* 2. Click on sign in button
* 3. Click on Close button
* In the current set of implementation , the orchestrator needs to dispatch event either soft/hard
* Essentially a view on event can be either a banner/popup/redirection and orchestrator needs to define what it wants to
* throw to the user , this class needs to listen and display the events by passing the data
*/


define ( [
	'backbone',
	'softRegistration/RegEvents',
	'softRegistration/SoftRegConfig',
	'softRegistration/views/RegistrationPopupView',
	'softRegistration/views/LoginPopupView',
	'softRegistration/views/UnderAgeRegConfirmView',
	'softRegistration/views/SoftRegBlockView',
	'softRegistration/models/RegPopupModel',
	'softRegistration/models/LoginPopupModel',
	'softRegistration/utils',
	'softRegistration/LangUtils',
	'underscore',
	'jquery'
	], function(Backbone, RegEvents , SoftRegConfig, RegistrationPopupView, 
		LoginPopupView, UnderAgeRegConfirmView, SoftRegBlockView, RegPopupModel, LoginPopupModel, 
		utils, LangUtils ,_,  $){


		var RegistrationInitiator =  function(data){

			var _config =  {};
	        var softRegViewType = SoftRegConfig.softRegViewType;
	        var TIME_OUT_FOR_SLIDE = 2000;
	        var defer  =  $.Deferred();
	        
	        // Registers callback to events raised from Modalities Watcher. 
	        // Also takes care of the configuration being passed.
			this.initialize = function(config){
				var EventType  = SoftRegConfig.EventType;
				RegEvents.on(EventType.TRIGGER_REG, this._handleRegistration, this);
				RegEvents.on(EventType.CLOSE_REG, this._handleClearViews, this);
				RegEvents.on(EventType.TRIGGER_UA_SUCCESS_POPUP, this._handleUASuccessView,this);
				// RegEvents.on(EventType.HARD, _handleHardRegistration);
				_config =  config || _config;
				_registerOnLoadEvent();
			}

			var _registerOnLoadEvent =  function(){
				if(document.readyState ==  'complete' || document.readyState ==  'interactive'){
					console.log('document load completed');
					defer.resolve();
				}else{
					window.addEventListener("load", function(){ 
						defer.resolve();
						console.log('window load completed');
					},false) 
				}
				return defer.promise()
			};

			this._handleClearViews =  function(){
					if( this.existingView ){
						try{
							this.existingView.closeBanner();
						}catch(e){
							this.existingView.remove();
						}
						
					}
			};

			this._handleUASuccessView = function(){
				this.existingView = new UnderAgeRegConfirmView({
					bodyClass : 'soft-ua-reg-confirm-popup',
					hideCloseBtn : true
				});
			}

	    	// method to open a registration popup
	    	var _handleRegPopup =  function(data){
	    		if( data.subType == 'SIGNIN'){
	    			var model =  new LoginPopupModel(data);
	    			this.existingView  =  new LoginPopupView({
						    				data: data,
						    				model : model,
						    				bodyClass : 'soft-login-popup',
						    				getTextByKey : LangUtils.getTextByKey,
						    				getDyanmicTextByKey : LangUtils.getDyanmicTextByKey,
						    				closeDesc : 'soft_reg_close',
						    				style : 'popup',
						    				popup : 'signin'
	    							});
	    		}else{
	    			var model =  new RegPopupModel(data);
	    			this.existingView = new RegistrationPopupView({
					    				 model : model,
					    				 data : data,
					    				 getTextByKey : LangUtils.getTextByKey,
					    				 getDyanmicTextByKey : LangUtils.getDyanmicTextByKey,
					    				 bodyClass : 'soft-reg-popup',
					    				 closeDesc : 'soft_reg_close',
						    			 style : 'popup',
						    			 popup : 'signup'
	    						   });
	    		}
	    	};

	    	// method to display the registration banner view
	    	var _handleRegBanner =  function(data){
	    		 this.existingView  = new SoftRegBlockView(data);
	    	};

			// handles the event for triggering redirection registration in view
			var _handleRegRedirection =  function(){
				location.href = utils.getRegistrationURL();
			};

	    	// handles the event for triggering soft registration in view.
	    	// right now there are various ways to handle soft registration
			this._handleRegistration = function (data){
				var viewType =  data.type,
					self = this;
				if ( !isNaN(data.timeout) ){ 
					TIME_OUT_FOR_SLIDE = data.timeout;
				}
				_.extend(data, {
					msgProps : _config.valueProps,
				    hideCloseBtn : _config.disableDismissOnPopup,
				    bannerMsgPropsPrimary :  _config.bannerMsgPropsPrimary,
				    bannerMsgPropsSecondary : _config.bannerMsgPropsSecondary
				})

				defer.done(function(){
	    			setTimeout (
	    			    function(){
							switch( viewType ){
							  case softRegViewType.POPUP : 
								_handleRegPopup.call(self,data);
								break;
							  case softRegViewType.BANNER :
							    _handleRegBanner.call(self,data);
							    break;
							  case softRegViewType.REDIRECTION : 
							    _handleRegRedirection(data); 
							    break; 	
							  default :

							   throw new Error(
							   		'the view type '+ viewType +' is not handled  '
							   	);
							}
						}, TIME_OUT_FOR_SLIDE);
	    		})
						
			};

			this.initialize(data);

		};

		RegistrationInitiator.instance = null;

       var initialize = function(data){
       		if( RegistrationInitiator.instance  == null){
       			RegistrationInitiator.instance = new RegistrationInitiator(data);
       		}
       		return RegistrationInitiator.instance;
       }; 

		return {
			initialize : initialize
		}
		



})