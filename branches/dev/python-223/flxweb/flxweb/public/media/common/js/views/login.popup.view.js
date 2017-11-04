define([
    'jquery',
    'underscore',
    'backbone',
    'text!common/templates/login.popup.html',
    'common/services/signin.services',
    'common/utils/url'
],function ($, _, Backbone, loginTemplate, signInService, Url) {
    'use strict';

    var LoginPopUpView,
        _c,
        providerName,
        loginInstance,
        returnParam;

    function main() {
        LoginPopUpView = Backbone.View.extend({
            'initialize': function (options) {
                var dialogueCss = '<link rel="stylesheet" type="text/css" media="all" href="/media/common/css/signinDialogue.css" /> ';
                var requestor = encodeURIComponent(window.location.href);
                var returnTo = encodeURIComponent(window.location.href);
                var signupUrl = '/auth/signup';
                var flxwebRole = $.cookie('flxweb_role');
                var hostname = options && options.hostname || window.location.hostname;

                if (flxwebRole && flxwebRole === 'teacher') {
                    signupUrl += '/teacher';
                } else {
                    signupUrl += '/student';
                }

                if (window.location.pathname.indexOf('/summer/') !== -1) {
                    returnTo = returnParam ||  '/my/dashboard/';
                }else if (window.location.pathname.indexOf('/auth/') === 0) { //if we are on any auth page, default returnTo to dashboard
                    returnTo = '/my/dashboard/';
                }

                _c = this;
                //for password reset, returnTo will be requestor, since the cancel button on forgot password, needs to bring the user back here
                $('.js-return-to').attr('href', 'https://' + hostname + '/auth/forgot/password?returnTo=' + requestor);
                //$('.js-sign-up').attr('href', $('header').find('.join').children('a').attr('href'));

                //$('.js-sign-in').attr('data-return',returnTo);

                $('.js-sign-up').attr('href','https://' + (window.apihost || window.location.hostname) + signupUrl + '?requestor=' + requestor + '&returnTo=' + returnTo);
                _c.render();
                $('#sign-in-modal').bind('closed', function () {
                    _c.trigger('cancel_login');
                });
                $('head').append(dialogueCss);
                _c.off('login_success').on('login_success', _c.onLoginSuccessEvent);
            },
            'events': {
                'click.signin .js-sign-in-button': 'signIn',
                'click.signin #show-more': 'showMore',
                'click.signin .js-sign-in-close': 'closeSignIn',
                'click.signin .js-sign-in-submit': 'submitLoginInfo',
                'click.signin .js-sign-up': 'signUp',
                'blur.signin .js-signin-edit': 'checkInputs',
                'keyup.signin .js-signin-edit': 'checkInputs',
                'change.signin .js-signin-edit': 'checkInputs',
                'paste.signin .js-signin-edit': 'pasteInput'
            },
            'render': function () {
                window.scroll(0, 0);
                $('.js-signin-error').add('.sign-in-button-hide').addClass('hide');
                $('.js-signin-edit').val('');
                $('.js-sign-in-submit').addClass('disabled grey dusty-grey').removeClass('tangerine standard');
                $('.js-sign-in-submit').prop('disabled', true);
                $('.sign-in-button-wrapper').removeClass('button-open');
                $('#show-more').removeClass('hide');
                if ($(window).width() < 768) {
                    $('.content-wrap').addClass('hide');
                }
                $('#sign-in-modal').foundation('reveal', 'open');
            },
            'signin_click': function (provider, url) {
                var auth_server,
                    auth_server_url,
                    providerUrl,
                    left,
                    returnTo,
                    webroot_url = 'https://' + window.location.host + '/';
                providerName = provider;
                returnTo = $('.js-sign-in').attr('data-return') || encodeURIComponent(window.location.href);
                if (window.flxweb_settings && window.flxweb_settings.auth_root_url) {
                    auth_server = window.flxweb_settings.auth_root_url;
                } else if (window.apihost) {
                    auth_server = 'https://' + window.apihost;
                } else {
                    auth_server = 'https://' + window.location.host;
                }
                auth_server_url = (window.flxweb_settings && window.flxweb_settings.auth_login_url) ? window.flxweb_settings.auth_login_url : auth_server + '/auth/login/member/';
                providerUrl = (window.flxweb_settings && window.flxweb_settings.auth_login_provider_verification_urls) ? webroot_url + url : 'https://' + (window.apihost || window.location.host) + '/' + url; //TODO:Fix it to use the config from flxweb
                left = (screen.width - 735) / 2;
                window.removeEventListener('message', _c.receiveMessage, false);
                window.addEventListener('message', _c.receiveMessage, false);
                if (!window.isWebView()) {
                    url = auth_server_url + provider + '?url=' + encodeURI(escape(providerUrl));
                    window.open(url, provider + '_window', 'location=no, menubar=no, resizable=yes status=no, scrollbars=no, width=719, height=425,top=193,left=' + left);
                } else {
                    url = auth_server_url + provider + '?url=' + encodeURI(escape(providerUrl)) + '&popup=false' + '&returnTo=' + encodeURIComponent(returnTo || window.location.href);
                    window.location.href = url;
                }
                return false;
            },
            'showMore': function (e) {
                var This = $(e.target).closest('#show-more');
                $('.sign-in-button-wrapper').toggleClass('button-open');
                $(This).add('.sign-in-button-hide').toggleClass('hide');
            },
            'closeSignIn': function () {
                $('.content-wrap').removeClass('hide');
                $('#sign-in-modal').foundation('reveal', 'close');
            },
            'signIn': function (e) {
                var This = $(e.target).closest('.js-sign-in-button'),
                    provider = $(This).attr('data-provider');
                _c.signin_click(provider, 'auth/verify/member/' + provider);
            },
            'submitLoginInfo': function (e) {
                var This = $(e.target).closest('.js-sign-in-submit');
                if ($(This).hasClass('disabled') || !($('.js-signin-edit:eq(0)').val() && $('.js-signin-edit:eq(1)').val())) {
                    return false;
                }
                var data = {};
                This.siblings('input').each(function () {
                    data[this.name] = this.value;
                });
                signInService.signIn(_c.signInSuccess, data);
            },
            'signUp': function (e) {
                var This = $(e.target).closest('.js-sign-up');
                if (!This.attr('href')) {
                    $('#sign-in-modal').foundation('reveal', 'close');
                    $('.content-wrap').removeClass('hide');
                }
            },
            'checkInputs': function (e) {
                var enabled = true,
                    inputs = $('.js-signin-edit');
                $('.js-signin-error').addClass('hide');
                inputs.each(function () {
                    if ($.trim($(this).val()) === '' || $(this).hasClass('error')) {
                        enabled = false;
                        return false;
                    }
                });
                if (enabled) {
                    $('.js-sign-in-submit').removeClass('disabled grey dusty-grey').addClass('tangerine standard');
                    $('.js-sign-in-submit').prop('disabled', false);
                } else {
                    $('.js-sign-in-submit').addClass('disabled grey dusty-grey').removeClass('tangerine standard');
                    $('.js-sign-in-submit').prop('disabled', true);
                }
                if (13 === (e.keyCode || e.which)) {
                    $('.js-sign-in-submit').trigger('click');
                }
            },
            'pasteInput': function (e) {
                var This = $(e.target);
                if (This.hasClass('signin-popup-password')) {
                    $('.js-sign-in-submit').removeClass('disabled grey dusty-grey').addClass('tangerine standard');
                    $('.js-sign-in-submit').prop('disabled', false);
                }
            },
            'receiveMessage': function (event) {
                try {
                    if (event.data) {
                        var event_data = JSON.parse(event.data);
                        if (event_data.hasOwnProperty('auth') || event_data.hasOwnProperty('auth_new')) {
                            if (0 === parseInt(event_data.auth, 10) || 0 === parseInt(event_data.auth_new, 10)) { //Success
                                var newMember = event_data.hasOwnProperty('auth_new') ? true : false;
                                // trigger login_success and reload the window on the basis of provider name.
                                $('.content-wrap').removeClass('hide');
                                _c.trigger('login_success', [providerName, newMember]);
                            } else {
                                console.log('Could not recognize the auth status');
                            }
                        }
                    }
                    window.removeEventListener('message', _c.receiveMessage, false);

                    if ('https://api.twitter.com' === event.origin) {
                        window.addEventListener('message', _c.receiveMessage, false);
                    }
                } catch (e) {
                    console.log(e);
                }
            },
            'signInSuccess': function (response) {
                if (response.hasOwnProperty('response')) {
                    if (response.response.hasOwnProperty('message')) {
                        _c.trigger('login_failed');
                        if (response.response.message.match('Incorrect')) {
                            $('.js-incorrect-error').removeClass('hide');
                        } else {
                            $('.js-unknown-error').removeClass('hide');
                        }
                    } else {
                        $('.content-wrap').removeClass('hide');
                        _c.trigger('login_success', ['ck-12', false]);
                        $('#sign-in-modal').foundation('reveal', 'close');
                    }
                } else {
                    _c.trigger('login_failed');
                    $('.js-unknown-error').removeClass('hide');
                }
            },
            'onLoginSuccessEvent': function (data) {
                var providerName = data[0];
                var newMember = data.length > 1 ? data[1] : false;
                var returnTo = $('.js-sign-in').attr('data-return') || '',
                    url = '';
                if (returnTo === '') {
                    url = new Url();
                    returnTo = (url.search_params && url.search_params.returnTo) || returnParam || '';
                    while (returnTo !== decodeURIComponent(returnTo)) {
                        returnTo = decodeURIComponent(returnTo);
                    }
                }
                if (newMember) {
                    window.location.href = (window.apihost ? '//' + window.apihost : '') + '/auth/signup/complete?returnTo=' + encodeURIComponent(returnTo || window.location.href);
                } else {
                    window.location.href = (window.apihost ? '//' + window.apihost : '') + '/account/signin-complete/' + providerName + '/?redirect=' + encodeURIComponent(returnTo || window.location.href);
                }
            }
        });

        function showLoginDialogue(options) {
            if (options) {
                returnParam = options.returnTo;
            }
            if (loginInstance) {
                _c.render();
                return loginInstance;
            }
            $('body').append(loginTemplate);
            loginInstance = new LoginPopUpView(_.extend({
                'el': $('#sign-in-modal')
            },options));
            return loginInstance;
        }
        this.showLoginDialogue = showLoginDialogue;
    }

    return new main();
});
