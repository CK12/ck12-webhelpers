/**
* The class is the ONLY class that should be invoked by external application/modules
* to Soft Registration.
* This class exposes two methods :
*  1. initialize 
*     a. Initializes ModalitiesWatcher and RegistrationInitiator. 
*     b. Takes the configuration from invoker merges it along with Default Config 
         and passes it to ModalitiesWatcher and viewConfig to RegistrationInitiator.
      c. Is invoked by public/media/js/main.js and public/media/main.js   
*  2. triggerSoftRegistration :
*     a. Its just a wrapper to call the triggerSoftRegistration of ModalitiesWatcher.
*     b. Should be invoked from pages where we need to display the soft registration 
*        view/popup upon fulfilling the criteria.
*     c. Right now, its being invoked for modalities pages in public/media/js/flxweb.modalities.common.js
*             
*/
define([
	'softRegistration/ModalitiesWatcher',
	'softRegistration/RegistrationInitiator',
	'softRegistration/SoftRegConfig',
	'underscore',
	'jquery'
	], function(ModalitiesWatcher, RegistrationInitiator, SoftRegConfig, _ , $ ){


		// we are using promises because we can't rely on the invoker to make the call to initialize first and then trigger
		// we are exposing two fns and the sequence of calling is dependent on caller, but for us initialization should happen
		// before any trigger.

		var defer = $.Deferred();

		var isBoolean =  function(val){
			return typeof val == 'boolean'
		};

		var isArray  = function(val){
			return Array.isArray(val)
		};
		var isString  = function(val){
			return typeof val == 'string';
		};

		var isObject =  function(val){
			return typeof val == 'object' && !val.hasOwnProperty('length')
		}


		return {
			initialize: function( modalityConfig , viewConfig ){
				modalityConfig =  modalityConfig || {};
				viewConfig =  viewConfig || {};

				var defaultViewConfig =  SoftRegConfig.defaultViewConfig;
				var defaultModalityConfig =  SoftRegConfig.defaultModalityConfig;

				// to optimizely we need to expose three things 
				// 1. disableDismissOnPopup  : boolean
				// 2. valueProps : {
				//     "Student": [], have 4/5
				//     "Teacher": []  have 4/5
				// }

			    // have 4/5
				// 3. exemptedPaths : [] of regex/string or regex/string
				// 4. bannerMsgPropsPrimary : '' String,
				// 5. bannerMsgPropsSecondary : '' String,
				// 6. enabled  : boolean
				// 7. shouldVisitedPageBeStored : boolean
				
				var extConfig =  window._softRegConfig || {};

				var extViewConfig   = {};
				var extModelConfig  = {};

				if( isBoolean( extConfig.disableDismissOnPopup )){
						extViewConfig.disableDismissOnPopup  = extConfig.disableDismissOnPopup
				}
				if( isObject( extConfig.valueProps)){
						extViewConfig.valueProps    =  extConfig.valueProps;
				}

				if( isString(extConfig.bannerMsgPropsSecondary)){
						extViewConfig.bannerMsgPropsSecondary  =  extConfig.bannerMsgPropsSecondary;
				}
				if( isString(extConfig.bannerMsgPropsPrimary)){
						extViewConfig.bannerMsgPropsPrimary  =  extConfig.bannerMsgPropsPrimary;
				}

				if( isArray( extConfig.exemptedPaths )){
						extModelConfig.exemptedPaths = extConfig.exemptedPaths;
				}
				if( isBoolean( extConfig.enabled) ){
						extModelConfig.enabled = extConfig.enabled;
				}

				if( isBoolean( extConfig.shouldVisitedPageBeStored)){
						extModelConfig.shouldVisitedPageBeStored = extConfig.shouldVisitedPageBeStored;
				}

        if( isObject( extConfig.rule)){
          extModelConfig.rule = extConfig.rule;
        }

				if( isBoolean( extConfig.shouldCountForAddressBarAccess ) ){
          extModelConfig.shouldCountForAddressBarAccess =  extConfig.shouldCountForAddressBarAccess;
        }

        if( isBoolean( extConfig.shouldTriggerSRFromSEO)){
          extModelConfig.shouldTriggerSRFromSEO =  extConfig.shouldTriggerSRFromSEO;
        }


				 _.extend(modalityConfig,defaultModalityConfig, extModelConfig );

			
				_.extend( viewConfig, defaultViewConfig,extViewConfig )

				// initialize registration
				RegistrationInitiator.initialize( viewConfig );

				// initialize modality 
				ModalitiesWatcher.initialize( modalityConfig );

				defer.resolve();
				return defer.promise()
			},
			triggerSoftRegistration : function(){
				// DO NOT Trigger if the pages are schools or forum pages as these are single pages and any are triggering
				//  route change event on load from BB router
				if( !SoftRegConfig.singlePageRule.test(location.pathname)){
					defer.done( function(){
						ModalitiesWatcher.triggerSoftRegistration();
					})
				}	
			}
		}
		
	})