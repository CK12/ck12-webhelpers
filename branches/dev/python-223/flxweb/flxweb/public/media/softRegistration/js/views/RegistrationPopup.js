define( [
		'jquery',
        'underscore',
        'backbone',
        // 'common/views/modal.view',
        'softRegistration/views/Popup',
        'softRegistration/RegEvents',
        'softRegistration/RegistrationService',
        'softRegistration/PopupModel',
        'text!softRegistration/templates/SoftRegPopup.html',
        'text!softRegistration/templates/SoftLoginPopup.html'
	] , function($, _, Backbone, PopupView, RegEvents,RegistrationService, PopupModel, softRegTemplate, softLoginTemplate ){  

	var RegistrationPopup =  PopupView.extend({
            events :{
                "click .popup-close" : "close",
                'click .soft-reg-signin-ext' : 'startExternalLogin',
                'click .show-more-buttons' : 'showOtherLogins',
                'click .show-less-buttons' : 'hideOtherLogins',
                'click .signup-email-button' : 'showEmailRegForm',
                'click #signup_form_submit'  : 'doInternalSignup',
                'click #signin_form_submit'  : 'doInternalSignIn',
                'click .soft-reg-role-student' : 'showStudentFields',
                'click .soft-reg-role-teacher' : 'hideStudentFields',
                'click #password_check' : 'showPassword',
                'click .soft-reg-month-option' :'handleSelectMonth',
                'click .soft-reg-day-option' :'handleSelectDay',
                'click .soft-reg-year-option' :'handleSelectYear',
                'focusout .soft-reg-input-email' : 'handleEmailValidation',
                'focusout .soft-reg-input-password' : 'handlePasswordValidation',
                'focusout .soft-reg-input-name' : 'handleNameValidation',
                'click  .soft-reg-sign-in-open' : 'handleSignInClick',
                'click  .soft-reg-sign-up-open' : 'handleSignUpClick'
            },
			initialize : function(){
                this.model.on('change', _.debounce(this.render,200), this);
                PopupView.prototype.initialize.apply(this);
			},
            close : function(){
                RegEvents.trigger('SotRegPopupClosed');
                PopupView.prototype.close.apply(this, arguments);
            },
        	startExternalLogin : function(e){
        		var provider =  e.currentTarget.getAttribute('data');
        		console.log(e);
        		console.log(provider);
                RegistrationService.handleExternalLogin( provider );
        	},
        	showOtherLogins : function(e){
                this.model.setShowMore(false);
        	},
        	hideOtherLogins : function(e){
                this.model.setShowMore(true);
            },
        	showEmailRegForm:  function(e){
                this.model.setShowMore(true);
        	},
            hideStudentFields : function(e){
                this.model.setIsStudent(false);
            },
            showStudentFields : function(e){
                this.model.setIsStudent(true);
            },
            handleSelectMonth : function(e){
                var month = e.target.textContent || e.currentTarget.textContent;
                var monthIdx  = e.target.getAttribute('index') || e.currentTarget.getAttribute('index');
                this.model.setSelectedMonth(month, monthIdx);
            },
            handleSelectDay : function(e){
                var day = e.target.textContent || e.currentTarget.textContent;
                this.model.setSelectedDay(day);
            },
            handleSelectYear : function(e){
                var year = e.target.textContent || e.currentTarget.textContent;
                this.model.setSelectedYear(year);
            },
            handleEmailValidation : function(e){
                var email = e.target.value || e.currentTarget.value;
                this.model.setEmail(email);
            },
            handlePasswordValidation : function(e){
                var password = e.target.value || e.currentTarget.value;
                this.model.setPassword(password);
            },
            handleNameValidation : function(e){
                var name = e.target.value || e.currentTarget.value;
                this.model.setName(name);
            },
            handleSignInClick : function(){
                this.close();
                RegEvents.trigger('raiseEventForSignIn', 'POPUP');
            },
            handleSignUpClick : function(){
                this.close();
                RegEvents.trigger('raiseEventForReg', 'POPUP');
            },
            doInternalSignup : function(e){
                e.preventDefault();
                this.model.signUp();
            },
            doInternalSignIn : function(e){
                e.preventDefault();
               this.model.signIn();

            },
            showPassword : function(e){
                    $('#ck12-password').attr() == 'password'?$('#ck12-password').attr('text'):$('#ck12-password').attr('password')
            }
	}, {
		showRegPopup : function(options){

            var self = this;
            var model =  new PopupModel(options.modelAttrs);
            var regPopupModal = new RegistrationPopup({
                partial : softRegTemplate,
                data : options,
                model : model,
                bodyClass : 'soft-reg-popup'
                // width: '800px',
            });
            return regPopupModal;
		},
        showLoginPopup : function( options ){
            var self = this;
            var model =  new PopupModel(options.modelAttrs);
            var loginPopupModal = new RegistrationPopup({
                'partial': softLoginTemplate,
                 data : options,
                'width' : '900px',
                 model : model,
                 bodyClass : 'soft-login-popup'
            });
            return loginPopupModal;
        }
	});

	return RegistrationPopup;
})