define( [
	'backbone',
	'underscore',
    'jquery',
    'softRegistration/RegistrationService',
    'softRegistration/SoftRegistrationADS',
		'softRegistration/utils',
 ], function( Backbone, _ , $, RegistrationService, SoftRegistrationADS, utils) {

    var EmailRegex =  /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    //(/(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-011\013\014\016-\177])*")@(?:[A-Z0-9]+(?:-*[A-Z0-9]+)*\.)+[A-Z]{2,6}$/i);
    //  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var PasswordRegex =  /[0-9]/;
    var EMAIL_MAX_LENGTH =  128;

    /**
        password: {
            required: true,
            minlength: 6,
            ck12_password: true //(/^(?=.*\d).*$/)
        },
        email: {
                    required: true,
                    maxlength: 128,
                      (/(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-011\013\014\016-\177])*")@(?:[A-Z0-9]+(?:-*[A-Z0-9]+)*\.)+[A-Z]{2,6}$/i)
                    simple_email: true, 
                    remote: {
                        url: '/auth/validate/member/email',
                        type: 'post'
                    }
        },
            
    */

	var PopupModel = Backbone.Model.extend({

	 	defaults : {
                showMore : true, // generic 
                formError : true, //GP
                hasEmailError : true, //GP
                hasPasswordError : true, //GP
                emailError : '', // GP
                passwordError : '', // GP
                email : '',  //GP
                password : '', // GP
                hideCloseBtn : false, //GP,
                width : 0,
                serverError :  '',
                $pristine: true,
        },
        serverErrorUpdateTriggers:[
            'email',
            'password'
        ],
        initialize : function(options){
        	if( options ){
                this.set('hideCloseBtn' ,options.hideCloseBtn);
            }
            var event = this.serverErrorUpdateTriggers.reduce( function(prev, curr){ return prev+ 'change:'+curr+' '}, '');
            this.on(event, this.clearErrors, this);
        },
        // This method is generic method + Reg Related
        setShowMore : function( flag ){
        	this.set('showMore', flag);
            this.setDefaultValuesInFields(); // FIX for errors causing CSS animation issue : TODO : Investigate more
        },
        // Clears the error on show more changes
        clearErrors : function(){
            this.set('serverError','');
        },
        setViewDirty : function(){
            this.set('$pristine', false);
        },
        setViewPristine : function(){
            this.set('$pristine', true);
        },
        // This is partly generic and specifc to registration popup
        setEmail : function(email){
        	this.set('email',email);
            this.set('hasEmailError', !(this.getEmailError() == ''));
        },
        setEmailError : function(){
            this.set('emailError', this.getEmailError());
        },
        getEmailError: function(){
            var email =  this.get('email');

            if( !email || email.length == 0 ){
                return 'REQUIRED';
            }
            if( email.length >= EMAIL_MAX_LENGTH){ 
                return 'MAX_LENGTH';
            } 
            if( EmailRegex.test(email) ) {
                return '';
            }else{
                return 'INVALID_EMAIL';
            }   
        },

        // This method is generic method
        setPassword : function(password){
			this.set('password',password);
            this.set('hasPasswordError', !(this.checkPasswordValidation() == ''));
        },
        setPasswordError : function(){
             this.set('passwordError', this.checkPasswordValidation());
        },
        checkPasswordValidation : function(){
            var password =  this.get('password');
            if( !password || password.length == 0 ){
                return 'REQUIRED';
            } 
            if( password.length < 6){
                return 'MIN_SIZE';
            }

            if( PasswordRegex.test(password) ){
                return '';
            }else{
                return 'AT_LEAST_ONE_NUMBER';
            }
        },
        // this method is specific to signin however, register also requires it.
        signIn : function(){
            var self =  this;
            var defer = $.Deferred();

            this.set('formError', true); // #50804
            this.set('serverError','');

            RegistrationService.handleInternalSignIn({
                user: this.get('email'),
                token : this.get('password')
            }).then( function(res){
                console.log(res);
                // self.setDefaultValuesInFields();
                if( res && res.responseHeader){
                    var status =  res.responseHeader.status;

                    switch( status ){

                        case 0 :
                             SoftRegistrationADS.logADS('FBS_SIGNINS', { referrer : utils.getReferrer() , authType : 'email' });
                             defer.resolve();
                             if( location.pathname == '/features'){
                                var hashPartial =  location.hash.replace('#','');
                                hashPartial =  ( hashPartial ==  'group')? 'groups': hashPartial; // spl case for groups has hash is group and partial should be groups
                                location.href =  '/my/'+ hashPartial;
                             }else{
                                location.reload();
                             }
                             break;
                        case 1001 : 
                             self.set('serverError', 'INCORRECT_CREDENTIALS');
                             defer.reject();
                             break;
                        case 2050 : 
                            self.set('serverError', 'INVALID_EMAIL');
                            defer.reject();
                            break;
                        case 2051 :
                            //MISSING_PASSWORD
                            self.set('serverError', 'MISSING_PASSWORD');
                            defer.reject();
                            break;
                        case 1040 : 
                            //ALREADY_LOGGED_IN
                            self.set('serverError', 'ALREADY_LOGGED_IN');
                            defer.reject();
                            break;
                        case 1001 :
                            //UNKNOWN_MEMBER
                            self.set('serverError', 'UNKNOWN_MEMBER');
                            defer.reject();
                            break;
                        default :
                            self.set('serverError', 'UNKOWN_ERROR'); 
                            defer.reject();  

                    }

                }else{
                         self.set('serverError', 'UNKOWN_ERROR'); 
                         defer.reject();
                }
                self.set('formError', false);
            }).fail(function(rej){
                    console.log(rej);
                    self.set('serverError', 'UNKOWN_ERROR'); 
                    defer.reject();
                    self.set('formError', false);
            })
            return defer.promise();
        },
        //should be called whenever you want to set default values in fields. Normally is the case when you want to
        // clear data after server response.
        setDefaultValuesInFields :  function(){
            this.set({
                email : '',
                password :'',
                emailError : '',
                passwordError : '',
                hasEmailError : false, //GP
                hasPasswordError  : false,
            })
        }
	 });

	 return PopupModel;
})