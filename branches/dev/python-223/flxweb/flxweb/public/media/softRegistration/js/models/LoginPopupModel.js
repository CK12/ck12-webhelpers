define( [
    'backbone',
    'underscore',
    'softRegistration/models/PopupModel',
    'softRegistration/RegistrationService',
    'softRegistration/utils'
 ], function( Backbone, _ , PopupModel, RegistrationService, utils) {
     

     /**
      username: {
                    required: true,
                    maxlength: 127
                },
     */

    var SPECIAL_CHARS_REGEX = /[^\w\-]/gi ; 
    var USERNAME_REGEX  = /^(?=.*\d)|(?=.*\w)(?!").*$/;
    var MIN_LENGTH = 3;
    var MAX_LENGTH = 127;

    var LoginPopupModel = PopupModel.extend({

        defaults : _.extend({}, PopupModel.prototype.defaults,{
            // add any default properties of Login Popup Model
            loginCredentials : '',
            hasLoginCredentialsError : true,
            loginCredentialsError : ''
        }) ,
        serverErrorUpdateTriggers: [
            'loginCredentials',
            'showMore',
            'password'
        ],
        initialize : function(options){
            PopupModel.prototype.initialize.apply(this, options);
            this.on('change:hasLoginCredentialsError change:hasPasswordError', this.handleFormError, this);
        },
        handleForgetPassword : function(){
            var url = utils.getForgetPasswordUrl();
            location.href = url;
        },
        handleFormError : function(){
            this.set('formError', this.get('hasLoginCredentialsError') ||
                                  this.get('hasPasswordError'));
        },
        setLoginCredentials : function( val ){
            this.set('loginCredentials', val);
            this.set('hasLoginCredentialsError', !(this.checkLoginCredValidation() == ''));
        },
        setLoginCredentialsError : function(){
            this.set('loginCredentialsError', this.checkLoginCredValidation());
        },
        checkLoginCredValidation : function(){
             var loginCredentials =  this.get('loginCredentials'),
                 loginCredErr =  '';

             switch( true ){

                case ( !loginCredentials || loginCredentials.length == 0 ) :
                    loginCredErr = 'REQUIRED';
                    break;
                case ( loginCredentials.length > MAX_LENGTH) :
                    loginCredErr = 'MAX_LENGTH';
                    break;
                default :
                    loginCredErr =  '';
             }

             return loginCredErr;
        },
        checkPasswordValidation : function(){
            var password =  this.get('password');
            if( !password || password.length == 0 ){
                return 'REQUIRED';
            } 
            return '';
        },
        signIn : function(){
            this.set('email', this.get('loginCredentials'));
            return PopupModel.prototype.signIn.apply(this,arguments);
        },
        setDefaultValuesInFields :  function(){
            PopupModel.prototype.setDefaultValuesInFields.apply(this, arguments);
            this.set({
                loginCredentials : '', 
                loginCredentialsError :'',
                hasLoginCredentialsError: true  
            })
        },
        handleExternalLogin : function(provider){
            RegistrationService.handleExternalLogin(provider, 'SIGN_IN');
        }
     });

     return LoginPopupModel;
})
