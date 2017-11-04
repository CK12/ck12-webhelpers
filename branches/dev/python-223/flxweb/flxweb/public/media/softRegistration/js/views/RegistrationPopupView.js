define( [
		'jquery',
        'underscore',
        'backbone',
        'softRegistration/views/PopupView',
        'softRegistration/RegEvents',
        'softRegistration/models/PopupModel',
        'text!softRegistration/templates/SoftRegPopup.html',
	] , function($, _, Backbone, PopupView, RegEvents, PopupModel, softRegTemplate ){  

	var RegistrationPopupView =  PopupView.extend({
            events : _.extend({}, PopupView.prototype.events,{
                'click .soft-reg-signin-ext' : 'startExternalLogin',
                'click .show-more-buttons' : 'showOtherLogins',
                'click .show-less-buttons' : 'hideOtherLogins',
                'click .signup-email-button' : 'hideOtherLogins',
                'click #signup_form_submit'  : 'doInternalSignup',
                'click .soft-reg-month-option' :'handleSelectMonth',
                'click .soft-reg-day-option' :'handleSelectDay',
                'click .soft-reg-year-option' :'handleSelectYear',
                'keyup .soft-reg-input-email'  :  'handleEmailValue',
                'focusout .soft-reg-input-email' : 'handleEmailValidation',
                'keyup .soft-reg-input-password'  :  'handlePasswordValue',
                'focusout .soft-reg-input-password' : 'handlePasswordValidation',
                'keyup .soft-reg-input-name'  :  'handleNameValue',
                'focusout .soft-reg-input-name' : 'handleNameValidation',
                'keyup .soft-reg-input-g-email'  :  'handleGuardianEmailValue',
                'focusout .soft-reg-input-g-email' : 'handleGuardianEmailValidation',
                'click  .soft-reg-sign-in-open' : 'handleSignInClick',
                'click .reg-lorem-role-icon.teacher' : 'hideStudentFields',
                'click .reg-lorem-role-icon.student' : 'showStudentFields',
                "click [roleSelection='true']" : 'handleIsRoleSelected',
                'focusin .forminput' : 'handleFormEnter',
            }),
            defaults : _.extend({}, PopupView.prototype.defaults, {

            }),
            updates:{
                'change:formError' :'#signup_form_submit',
                'updateName' : '.soft-reg-input-name',
                'change:emailError': [ '#soft-reg-email-error','.soft-reg-input-email'],
                'change:passwordError' : [ '#soft-reg-password-error','.soft-reg-input-password'],
                'change:nameError' : ['#soft-reg-name-error','.soft-reg-input-name'],
                'change:brithdayError': '#soft-reg-bday-error',
                'change:guardianEmailError' : ['#soft-reg-guardian-error', '.soft-reg-input-g-email'],
                'change:selectedMonth' : '.soft-reg-drop-down-month-container',
                'change:selectedYear' : '.soft-reg-drop-down-year-container',
                'change:selectedDay' : '.soft-reg-drop-down-bday-container',
                'change:msgList': '.lorem-txt-container',  // we are updating the role ,
                'change:msgPropsRole': '#reg-lorem-container',
                'change:isUnderAge'  : '.soft-reg-internal-form',
                'change:serverError' : '.reg-ext-header-area',
                'change:showMore'   : '.reg-btn-container',
                'change:selectedRole' : ['#reg-lorem-container','.soft-reg-popup-header'],
                'change:formTouched' : '.reg-ext-container', // formTouched changes to be done later,
                'change:isStudent'  : '.soft-reg-student-DOB-container',
                'change:isRoleSelected' : ['.soft-reg-header-tooltip'],
                'change:isHeaderHidden' : '.reg-ext-container'
            },
            modelTriggers : [],
            bodyTemplate:  softRegTemplate, 
			initialize : function(){
                this.model.on(this.modelTriggers.join(' '), this.render, this);
                PopupView.prototype.initialize.apply(this);
			},
            close : function(){
                RegEvents.trigger('SotRegPopupClosed');
                PopupView.prototype.close.apply(this, arguments);
            },
        	startExternalLogin : function(e){
        		var provider =  e.currentTarget.getAttribute('data');
                this.model.handleExternalLogin(provider);
        	},
        	showOtherLogins : function(e){
                this.model.setViewDirty();
                this.model.setShowMore(false);
        	},
        	hideOtherLogins : function(e){
                this.model.setViewDirty();
                this.model.setShowMore(true);
            },
            hideStudentFields : function(e){
                e.stopPropagation();
                this.model.setViewPristine();
                this.model.setIsStudent(false);
            },
            showStudentFields : function(e){
                e.stopPropagation();
                this.model.setViewPristine();
                this.model.setIsStudent(true);
            },
            handleSelectMonth : function(e){
                var month = e.target.textContent || 
                            e.currentTarget.textContent;
                var monthIdx  = e.target.getAttribute('index') ||
                                e.currentTarget.getAttribute('index');
                this.model.setSelectedMonth(month, monthIdx);
            },
            handleSelectDay : function(e){
                var day = e.target.textContent || 
                          e.currentTarget.textContent;
                this.model.setSelectedDay(day);
            },
            handleSelectYear : function(e){
                var year = e.target.textContent || 
                           e.currentTarget.textContent;
                this.model.setSelectedYear(year);
            },
            handleEmailValue : function(e){
                var email = e.target.value || 
                            e.currentTarget.value;
                this.model.setEmail(email);
            },
            handleEmailValidation : function(e){
                this.model.setEmailError();
            },
            handlePasswordValue : function(e){
                var password = e.target.value || 
                               e.currentTarget.value;
                this.model.setPassword(password);
            },
            handlePasswordValidation : function(e){
                this.model.setPasswordError();
            },
            handleGuardianEmailValue : function(e){
                var email = e.target.value || 
                            e.currentTarget.value;
                this.model.setGuardianEmail(email);
            },
            handleGuardianEmailValidation :  function(e){
                this.model.setGuardianEmailError();
            },
            handleNameValue : function(e){
                 var name = e.target.value || 
                           e.currentTarget.value;
                this.model.setName(name);
            },
            handleNameValidation : function(e){
                this.model.setNameError();
            },
            handleSignInClick : function(){
                this.close();
                RegEvents.trigger('raiseEventForSignIn', 'POPUP');
            },
            handleIsRoleSelected : function(e){
                this.model.setIsRoleSelected();
            },
            handleEnterKeyPress : function(e){
                if(e.which == 13 || e.keyCode == 13){
                    this.doInternalSignup(e);
                }
            },
            handleFormEnter : function(e){
                this.model.setHeaderHidden(true);
            },
            doInternalSignup : function(e){
                var self = this;
                e.preventDefault();
                this.model.signUp().then(function(res){
                    self.close();
                }); 
            }
	});

	return RegistrationPopupView;
})
