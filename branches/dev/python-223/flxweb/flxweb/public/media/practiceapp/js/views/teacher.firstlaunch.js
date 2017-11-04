define([
    'jquery',
    'underscore',
    'practiceapp/views/appview',
    'practiceapp/templates/templates',
    'common/utils/user',
    'common/views/login.popup.view'
],
function($, _, AppView, Templates, User, LoginPopUp){
    'use strict';
    function validateEmail(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 

    var signInView = null,
        _c;
     
    var TeacherFirstLaunchView = AppView.extend({
        'events': {
            'click .js_email_submit': 'submitEmail',
            'submit #email-form': 'submitEmail',
            'click #signInButton': 'openSignDialogue'
        },
        'tmpl': _.template(Templates.TEACHER_FIRST_LAUNCH,null,{'variable':'data'}),
        'render': function(){
            _c = this;
            _c.controller.setTitle("Get Started");
            return $(this.tmpl({
                'app_display_name': _c.controller.appContext.config.app_display_name,
                'first_name': _c.controller.appContext.edmodo_user.first_name
            })); 
        },
        'submitEmail': function(){
            var email = $('.js_teacher_email').val() || '',
                edmodo_info = _c.controller.appContext.edmodo_user,
                user=null,
                msg,
                errModal;
            
            $(".ck12-edmodo-header").css('display','none');
            if (email && !validateEmail(email)){
                _c.$el.find('.email-error-message').removeClass('hide');
                return false;
            } else {
                _c.$el.find('.email-error-message').addClass('hide');
            }
            _c.controller.appServices.teacherEmail(email, edmodo_info).done(function(data){
                if (data && data.response && data.response.message){
                    if (data.responseHeader && data.responseHeader.status === 5011){
                        msg = "Looks like email " + email + " is already registered with CK-12.";
                        msg += "Try signing in instead.";
                        errModal = _c.controller.showMessage(msg);
                        errModal.bind('close', function(){
                            $("#sign-in-modal").foundation('reveal','open');
                        });
                    } else if (data.responseHeader && data.responseHeader.status === 5012){
                        errModal = _c.controller.showMessage("Provided email belongs to a CK-12 student account. Please use a teacher account instead.");
                        errModal.bind('close', function(){
                            $("#sign-in-modal").foundation('reveal','open');
                        });
                    } else if (data.responseHeader && data.responseHeader.status === 5013){
                        _c.controller.showMessage("Provided email is already associated with another edmodo account.");
                    }
                } else {
                    user = new User(data.response);
                    _c.controller.trigger("appAuthSuccess", user);
                }
            }).fail(function(err){
                _c.controller.trigger('appError', err);
            });
            return false;
        },
        'openSignDialogue': function() {
            signInView = LoginPopUp.showLoginDialogue();
            _c.bindEventsForLoginView();
        },
        'bindEventsForLoginView': function() {
            signInView.on('login_success', _c.onLoginSuccess);
            signInView.on('cancel_login', _c.onCancelLogin);
            signInView.on('login_failed', _c.onLoginFailed);
        },
        'onLoginSuccess': function(provider) {
            var user = null;
            _c.controller.appServices.sendUserInfo(_c.controller.appContext.edmodo_user).done(function(launch_data){
                if (launch_data.response && launch_data.response.message){
                    if (launch_data.responseHeader && launch_data.responseHeader.status === 5012){
                        var errModal = _c.controller.showMessage("Provided email belongs to a CK-12 student account. Please use a teacher account instead.");
                        errModal.bind('close', function(){
                           /*_c.$("#signin-modal").foundation('reveal','open');*/
                        });
                    } else if (launch_data.responseHeader && launch_data.responseHeader.status === 5013){
                        _c.controller.showMessage("Provided email is already associated with another edmodo account.");
                    }
                } else {
                    $("#sign-in-modal").foundation('reveal','close');
                    user = new User(launch_data.response);
                    _c.controller.trigger("appAuthSuccess", user);
                    signInView.remove();
                }
            }).fail(function(err){
                _c.controller.trigger('appError', err);
                _c.controller.showMessage("Failed to link CK-12 and edmodo user accounts.");
            });
        },
        'onCancelLogin': function() {
            console.log('called onCancelLogin...');
            signInView.off();
            //signInView.remove();
        },
        'onLoginFailed': function() {
            console.log('login failed...');
            //Task to do when CK12 Sign in fails.
        }
    });
    return TeacherFirstLaunchView;
});
