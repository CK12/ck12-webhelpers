define( [
		'jquery',
        'underscore',
        'backbone',
        'softRegistration/views/PopupView',
        'softRegistration/RegEvents',
        'softRegistration/models/PopupModel',
        'text!softRegistration/templates/SoftLoginPopup.html'
	] , function($, _, Backbone, PopupView, RegEvents, PopupModel, softLoginTemplate ){


	var LoginPopupView =  PopupView.extend({
			defaults : _.extend({}, PopupView.prototype.defaults, {

			}),
            events : _.extend({}, PopupView.prototype.events, {
                "click .popup-close" : "close",
                'click .soft-reg-signin-ext' : 'startExternalLogin',
                'click .show-more-buttons' : 'showOtherLogins',
                'click .show-less-buttons' : 'hideOtherLogins',
                'click .signup-email-button' : 'showEmailRegForm',
                'click #signin_form_submit'  : 'doInternalSignIn',
                'click .soft-reg-forgot-password': 'handleForgetPassword',
                'keyup .soft-reg-input-email'  :  'handleEmailValue',
                'focusout .soft-reg-input-email' : 'handleEmailValidation',
                'keyup .soft-reg-input-password'  :  'handlePasswordValue',
                'focusout .soft-reg-input-password' : 'handlePasswordValidation',
                'click  .soft-reg-sign-up-open' : 'handleSignUpClick'
            }),
            updates:{
                'change:formError' :'#signin_form_submit',
                'change:loginCredentialsError': [ '#soft-reg-email-error','.soft-reg-input-email'],
                'change:passwordError' : [ '#soft-reg-password-error','.soft-reg-input-password'],
                'change:serverError' : '.reg-ext-header-area',
            },
            modelTriggers : [
                'change:showMore',
            ],
            bodyTemplate:  softLoginTemplate,
            //both
			initialize : function(){
                // this.model.on('change', _.debounce(this.render,200), this);
                this.model.on(this.modelTriggers.join(' '), this.render, this);
                PopupView.prototype.initialize.apply(this);
			},
			//both
            close : function(){
                RegEvents.trigger('SotRegPopupClosed');
                PopupView.prototype.close.apply(this, arguments);
            },
            //both
        	startExternalLogin : function(e){
        		var provider =  e.currentTarget.getAttribute('data');
						this.model.handleExternalLogin( provider );
        	},
        	//both 
        	showOtherLogins : function(e){
                this.model.setViewDirty();
                this.model.setShowMore(false);
        	},
        	// both
        	hideOtherLogins : function(e){
                this.model.setViewDirty();
                this.model.setShowMore(true);
            },
            //both 
        	showEmailRegForm:  function(e){
                this.model.setShowMore(true);
        	},
            handleEmailValue : function(e){
                var credentials = e.target.value || e.currentTarget.value;
                this.model.setLoginCredentials(credentials);
            },
            //both 
            handleEmailValidation : function(e){
                this.model.setLoginCredentialsError();
            },
            handlePasswordValue : function(e){
                 var password = e.target.value || e.currentTarget.value;
                this.model.setPassword(password);
            },
            //both 
            handlePasswordValidation : function(e){
               this.model.setPasswordError();
            },
            // login related
            handleSignUpClick : function(){
                this.close();
                RegEvents.trigger('raiseEventForReg', 'POPUP');
            },
             handleEnterKeyPress : function(e){
                if(e.which == 13 || e.keyCode == 13){
                    this.doInternalSignIn(e);
                }
            },
            // login related
            doInternalSignIn : function(e){
                var self = this;
                e.preventDefault();
                if( ! this.model.get('formError')){ // Additional check, the sign in button should be disabled
                    this.model.signIn().then(function(res){
                        self.close();
                    });
                }
            },
            handleForgetPassword : function(){
                this.model.handleForgetPassword();
            }
	});

	return LoginPopupView;
})
