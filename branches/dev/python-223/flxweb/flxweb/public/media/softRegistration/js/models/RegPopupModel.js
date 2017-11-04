define( [
    'backbone',
    'underscore',
    'jquery',
    'softRegistration/models/PopupModel',
    'softRegistration/RegistrationService',
    'softRegistration/SoftRegConfig',
    'softRegistration/RegEvents',
    'softRegistration/SoftRegistrationADS',
    'softRegistration/utils',
 ], function( Backbone, _ , $ ,PopupModel, RegistrationService, SoftRegConfig, RegEvents, SoftRegistrationADS , utils) {

    var getDaysList =  function(month){
        return Array.apply(null,  Array(31)).map(function(val, idx){return idx+1})
    };

    var getYearsList =  function(){
        var date =  new Date();
        var currentYear =  date.getFullYear();
        return Array.apply(null,  Array(100)).map(function(val, idx){return currentYear - idx})
    }; 
    var EmailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    // /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
     
    var EventType = SoftRegConfig.EventType;
    var STUDENT_ROLE =  'student';
    var TEACHER_ROLE =  'teacher';
    var FOOTER_MSG_KEY =  'footermsg';
    var HEADER_MSG_KEY =  'headermsg';
    var SPECIAL_CHARS_REGEX = /^[^/\\()\[\]:~!@#$%^<>&\'\"|*]*$/
    ///[^\w\-]/gi ; 

    /**
     name: {
            ck12_fullname: true,
            invalid_fullname: true //(/^[^/\\()\[\]:~!@#$%^<>&|*]*$/)
            },
     birthday: {
                    required: true,
                    ck12_birthdate: true, (/^((0?[1-9]|1[012])[/](0?[1-9]|[12][0-9]|3[01])[/](19|20)[0-9]{2})*$/)
                    remote: {
                        url: '/auth/validate/member/birthday',
                        type: 'post'
                    }
                }

    */

    var RegPopupModel = PopupModel.extend({

        defaults : _.extend({}, PopupModel.prototype.defaults,{
                isStudent : false,
                selectedRole : '',
                selectedMonth : '',
                selectedYear :  '',
                selectedDay : '',
                guardianEmail : '',
                monthList : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'],
                dayList : getDaysList() ,
                yearList : getYearsList(),
                hasNameError : true,
                hasBirthdayError : true, // the reason it is true bcause it has not been touched
                hasGuardianEmailError : true,
                guardianEmailError : '',
                nameError : '',
                brithdayError : '',
                name : '',
                selectedMonthIdx: undefined,
                isRoleSelected : false,
                headerMsg :  false,
                footerMsg : {
                    'student': '',
                    'teacher': ''
                },
                msgFooterProp : '',
                msgProps : {
                    'student': [
                        'Practice more questions and track your progress',
                        'Use our tools to highlight, take notes and save your annotations for later revision',
                        'Create and participate in groups to get help from others',
                        'Play with interactives and simulations to explore'
                    ],
                    'teacher': [
                        'Give more questions and track students\' progress',
                        'Use our tools to highlight, take notes and save your annotations for later revision',
                        'Create and participate in groups to get help from others',
                        'Play with interactives and simulations to explore'
                    ]
                },
                isHeaderHidden : false,
                isUnderAge : false
        }),
        formErrorUpdateTriggers:  [
            'hasEmailError',
            'hasPasswordError',
            'hasNameError',
            'hasBirthdayError',
            'hasGuardianEmailError',
            'isUnderAge',
            'selectedRole'
        ],
         serverErrorUpdateTriggers: [
            'email',
            'showMore',
            'password',
            'selectedRole',
            'selectedMonth',
            'selectedDay',
            'selectedYear',
            'guardianEmail',
            'name'
        ],
        initialize : function(options){
            var obj = JSON.parse( JSON.stringify(this.get('msgProps'))); // Costly Affair :|
            var self = this;
            PopupModel.prototype.initialize.apply(this, arguments);
            if( options && options.msgProps ){
                 if(Array.isArray( options.msgProps) ){
                    obj[STUDENT_ROLE] = options.msgProps;
                    obj[TEACHER_ROLE] = options.msgProps;

                 }else if ( typeof options.msgProps == 'object'){

                    Object.keys(options.msgProps).forEach( function(key){
                        if( key.toLowerCase() == STUDENT_ROLE){
                            obj[STUDENT_ROLE] = options.msgProps[key];
                        }else if( key.toLowerCase() ==  TEACHER_ROLE ){
                            obj[TEACHER_ROLE] = options.msgProps[key];
                        }else if( key.toLowerCase() ==  HEADER_MSG_KEY ){
                           self.set('headerMsg', options.msgProps[key])  // Assuming that the other thing apart from
                        }else if( key.toLowerCase() == FOOTER_MSG_KEY){
                          var footerMsgProps =  options.msgProps[key];
                          var footerMsg =  {};
                            Object.keys(footerMsgProps).forEach( function(footerKey){
                              if( footerKey.toLowerCase() == STUDENT_ROLE){
                                  footerMsg[STUDENT_ROLE] = footerMsgProps[footerKey];
                              }else if( footerKey.toLowerCase() ==  TEACHER_ROLE ){
                                  footerMsg[TEACHER_ROLE] = footerMsgProps[footerKey];
                              }
                            });
                          self.set('footerMsg', footerMsg);
                        }
                    })
                       
                 }else{
                    console.warn('msgProps passed is not valid')
                 }
                 this.set('msgProps', obj);    
            }
            var event = this.formErrorUpdateTriggers.reduce( function(prev, curr){ return prev+ 'change:'+curr+' '}, '');
            this.on(event, this.handleFormError, this);
            this.postInitialize();
        },

        postInitialize : function(){
            this.set('selectedRole', STUDENT_ROLE);
            this.set('isStudent', true);
            this.set('msgFooterProp', this.get('footerMsg')[this.get('selectedRole')]); // TODO : UI is dependent on the order of execution of this and next line as
            this.set('msgList', this.get('msgProps')[this.get('selectedRole')] );  //  bindins are done

        },
        setShowMore : function( flag ){
           this.setHeaderHidden(false); 
           PopupModel.prototype.setShowMore.apply(this, arguments);
            // this code is written for the sole purpose that we need to clear out the entries 
            // this.clearStudentData();
            // this.clearFormErrors();
            
        },
        setIsRoleSelected : function(){
            this.set('isRoleSelected', true);
        },
        setIsStudent : function( flag ){
            this.set('isStudent', flag);
            if( flag ){
                this.set('selectedRole', STUDENT_ROLE);
            }else{
                this.set('selectedRole', TEACHER_ROLE);
                this.clearStudentData();
            }
            this.set('msgFooterProp', this.get('footerMsg')[this.get('selectedRole')]); // TODO : Order is important here
            this.set('msgList', this.get('msgProps')[this.get('selectedRole')] );
        },
        setHeaderHidden : function(flag){
            this.set('isHeaderHidden', flag);
        },
        //when the user navigates from in house form
        clearFormErrors : function(){
            this.set({
                'hasEmailError': true,
                'hasPasswordError': true,
                'hasNameError' : true,
                'hasBirthdayError': true,
                'hasGuardianEmailError': true,
                'emailError':'',
                'passwordError':'',
                'nameError':'',
                'brithdayError': '',
                'guardianEmailError':''
            })
        },
        // clear only those data related to DOB and underAge
        clearStudentData : function(){
             this.set('isUnderAge', false);
             this.set('selectedDay', '');
             this.set('selectedYear', '');
             this.set('selectedMonth', '');
             this.set('selectedMonthIdx', undefined);
             this.set('hasBirthdayError', true);
             this.set('brithdayError', '');
        },
        setSelectedMonth : function(month, monthIdx){
            this.set({
                'selectedMonth': month,
                'selectedMonthIdx': monthIdx
            });
            this.doBirthdayCheck();
        },
        setSelectedDay : function( day ){
            this.set('selectedDay',day);
            this.doBirthdayCheck();
        },
        setSelectedYear : function(year){
            this.set('selectedYear',year);
            this.doBirthdayCheck();
        },
        setEmailError : function(){
            PopupModel.prototype.setEmailError.apply(this, arguments);
            var self =  this,
                email =  this.get('email');

            if( this.getEmailError() == ''){
                RegistrationService.handleEmailCheck(email).then(function(response){
                    if ( response ){
                       if(self.get('name') === ''){
                            self.setName(email.split('@')[0]);
                            self.set('nameError', self.getNameError());
                            self.trigger('updateName');
                       } 
                    }else{
                        self.set('hasEmailError', true);
                        self.set('emailError', 'EMAIL_ALREADY_TAKEN');
                    }
                })
                
            }
        },
        setGuardianEmail  : function(email){
            this.set('guardianEmail',email);
            this.set('hasGuardianEmailError', (this.getGuardianEmailError() != ''));
        },
        setGuardianEmailError : function(){
            this.set('guardianEmailError', this.getGuardianEmailError());
        },
        getGuardianEmailError : function(){
            var email =  this.get('guardianEmail'),
                guardianEmailErrorStr =  '';

            switch( true ){
                case ( !email || email.length == 0 ) :
                    guardianEmailErrorStr =  'REQUIRED';
                break;

                case !(EmailRegex.test(email) ) :
                    guardianEmailErrorStr =  'INVALID_EMAIL';
                break;

                default : 
                    guardianEmailErrorStr = '';
            }
            return guardianEmailErrorStr;
        },
        setName : function(name){
            this.set('name',name);
            this.set('hasNameError', (this.getNameError() != ''));
        },

        setNameError : function(){
            this.set('nameError', this.getNameError());
        },

        getNameError : function(){
            var name =  this.get('name'),
                nameErrorStr ='';  

            switch( true ){
                case ( !name || name.length == 0 ) :
                  nameErrorStr =  'REQUIRED';
                break;

                case (!SPECIAL_CHARS_REGEX.test(name)):
                  nameErrorStr =  'SPECIAL_CHARS_NOT_ALLOWED';
                break;

                case (name.length > 63):
                  nameErrorStr =  'MAX_LENGTH';
                break;
                default :
                   nameErrorStr = '';

            }
            return nameErrorStr;
        },
        signUp : function(){
            var self =  this;
            var request,
                 defer = $.Deferred();

            if( this.get('formError')){
                defer.reject();
            }else{
                this.set('formError', true); //50804
                this.set('serverError','');

                if( this.get('isUnderAge') && this.get('isStudent')){

                request =  {
                    name : this.get('name'),
                    email : this.get('guardianEmail'),
                    birthday : this.formatBirthday()
                };
                RegistrationService.handleUnderAgeSignUp(request).then( function(response){
                    console.log(response)
                     self.set('formError', false); //50804
                     if(response.responseHeader.status === 0){
                         defer.resolve();
                         RegEvents.trigger(EventType.TRIGGER_UA_SUCCESS_POPUP)// order of resolving and triggerring events is in order
                    }else{
                        // TODO generic error placeholders 
                        self.set('serverError', 'Error Code : '+response.responseHeader.status);
                        defer.reject();
                    }
                }).fail(function(rej){
                    self.set('serverError', 'UNKOWN_ERROR'); 
                    defer.reject();
                    self.set('formError', false);
                })

                }else{

                    request =  {
                        name: this.get('name'),
                        email : this.get('email'),
                        password : this.get('password'),
                        authType : 'ck-12',
                        role : this.get('isStudent')? STUDENT_ROLE : TEACHER_ROLE
                    };

                    if( this.get('isStudent') ){
                        if( this.validateBirthday()){
                            request.birthday =  this.formatBirthday();
                        }else{
                            console.error('brithday not valid one');
                            self.set('serverError', 'INVALID_IRTHDAY_DATE');
                            return ;
                        }
                    }
                    RegistrationService.handleInternalSignUp(request).then( function(response){
                        console.log(response);

                        if( response && response.responseHeader){
                        var status =  response.responseHeader.status;

                            switch( status ){

                                case 0 :
                                     SoftRegistrationADS.logADS('FBS_SIGNUPS', { referrer : utils.getReferrer() , authType : 'email' })
                                     self.signIn().then(function(res){
                                             defer.resolve();
                                             self.setDefaultValuesInFields();
                                     });
                                    
                                     break;
                                case 1000 : 
                                     self.set('serverError', 'EMAIL_REQUIRED');
                                     break;
                                     
                                case 2050 : 
                                     self.set('serverError', 'INVALID_EMAIL');
                                     break;

                                case 2051 :
                                    //MISSING_PASSWORD
                                    self.set('serverError', 'MISSING_PASSWORD');
                                    break;

                                case 5011 : 

                                    //MEMBER_ALREADY_EXISTS
                                    self.set('serverError', 'MEMBER_ALREADY_EXISTS');
                                    break;

                                case 1002: 
                                    //CANNOT_CREATE_MEMBER
                                    self.set('serverError', 'CANNOT_CREATE_MEMBER');
                                    break;

                                case 1040:
                                    //ALREADY_LOGGED_IN
                                    self.set('serverError', 'ALREADY_LOGGED_IN');
                                    break;    

                                default :
                                    self.set('serverError', 'UNKOWN_ERROR');

                            }

                        }else{
                               self.set('serverError', 'UNKOWN_ERROR'); 
                        }
                        self.set('formError', false); //50804
                    }).fail(function(rej){
                        self.set('serverError', 'UNKOWN_ERROR'); 
                        defer.reject();
                        self.set('formError', false);
                    })
                }
            }     
            return defer.promise();
            
        },
        formatBirthday : function(){
            return this.get('selectedMonthIdx') + '/' + this.get('selectedDay') + '/' + this.get('selectedYear');
        },
        validateBirthday : function(){
            return this.get('selectedMonthIdx') && this.get('selectedDay') && this.get('selectedYear');
        },
        doBirthdayCheck : function(){
            var self =  this;
            if( this.validateBirthday()){
                var birthday = this.formatBirthday();
                var request = {
                    birthday : birthday
                }
                RegistrationService.handleBirthdayCheck(request).then( function(res){
                    if( res ){
                        self.set('hasBirthdayError', false);
                        self.set('brithdayError','')
                        self.set('isUnderAge',self.checkUnderAgeCriteria(birthday));
                    }else{
                        self.set('hasBirthdayError', true);
                        self.set('brithdayError', 'INVALID_DATE');
                    }
                })  
            }else{

            }
        },

        // returns true if the candidate is under age or else false
        checkUnderAgeCriteria : function(dt){
            var date =  new Date(dt);
            var currDate =  new Date();
            var yearDiff =  currDate.getFullYear() - date.getFullYear(),
                monthDiff =  currDate.getMonth() - date.getMonth(),
                dayDiff  =  currDate.getDate() - date.getDate();
            var isUnderAge =  false;    

            switch(true){
                case yearDiff > 13 :
                  isUnderAge = false;
                 break;
                case yearDiff < 13 :
                  isUnderAge =  true;
                break;
                case yearDiff ==  13 :
                    switch(true){
                            case monthDiff > 0 :
                               isUnderAge =  false;
                             break;
                            case monthDiff < 0 :
                               isUnderAge = true;
                            break;
                            case monthDiff ==  0 :
                                switch(true){
                                    case dayDiff >= 0 :
                                       isUnderAge = false;
                                     break;
                                    case dayDiff < 0 :
                                       isUnderAge =  true;
                                     break;
                                }  
                            break;
                     }  
                break;

            } 

            return isUnderAge;   

        },
        //should be called whenever you want to set default values in fields. Normally is the case when you want to
        // clear data after server response.
        setDefaultValuesInFields :  function(){
            PopupModel.prototype.setDefaultValuesInFields.apply(this, arguments);
            this.set({
                guardianEmail : '', 
                guardianEmailError :'',
                hasGuardianEmailError: true,
                name : '',
                nameError : '',
                hasNameError : true,
                selectedMonth: '',
                selectedYear: '',
                selectedDay : '',
                brithdayError : '',
                hasBirthdayError : true,
                isUnderAge:  false   
            })
        },
         handleFormError : function(){

            var isStudent =  this.get('isStudent'),
                isUnderAge  = this.get('isUnderAge'),
                hasEmailError = this.get('hasEmailError'),
                hasPasswordError = this.get('hasPasswordError'),
                hasNameError  = this.get('hasNameError'),
                hasBirthdayError  = this.get('hasBirthdayError'),
                hasGuardianEmailError = this.get('hasGuardianEmailError'),
                formError = false;

             switch( true ){

                  case isStudent && isUnderAge : 
                       // hasNameError, hasGuardianEmailError, hasBirthdayError
                       formError =  hasNameError || hasGuardianEmailError || hasBirthdayError;
                       break;

                  case isStudent  && !isUnderAge :
                       // hasEmailError, hasPasswordError, hasNameError, hasBirthdayError
                       formError =  hasEmailError || hasPasswordError || hasNameError || hasBirthdayError;
                       break;

                  default : 
                      // hasEmailError, hasPasswordError, hasNameError
                      formError =  hasEmailError || hasPasswordError || hasNameError;
                   
             }    
            this.set('formError', formError);
        },
        handleExternalLogin : function( provider ){
            RegistrationService.handleExternalLogin(provider, 'SIGN_UP', this.get('selectedRole'));
        }

     });

     return RegPopupModel;
})
