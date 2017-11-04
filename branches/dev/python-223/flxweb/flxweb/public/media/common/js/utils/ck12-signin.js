// Common sign-in methods
/* global $, webroot_url */
define(function () {
    'use strict';
    var signin = {
        // shows the sign-in modal
        alertToSignin: function (returnTo) {

            function signin_click(provider, url) {

                function receiveMessage(event) {
                    var event_data, auth_status;
                    event_data = event.data;
                    if (event_data) {
                        event_data = event_data.split(':');
                        if (event_data.length === 2 && (event_data[0] === 'auth' || event_data[0] === 'auth_new')) {
                            auth_status = parseInt(event_data[1], 10);
                            if (auth_status === 0) { //Success
                                $('.content-wrap').removeClass('hide');
                                window.location.href = '/account/signin-complete/' + provider + '/?redirect=' + encodeURIComponent(returnTo || window.location.href);
                            } else {
                                console.debug('Could not recognize the auth status');
                            }
                        }
                    }
                    window.removeEventListener('message', receiveMessage, false);
                }

                var auth_server, auth_server_url, providerUrl, left;
                window.webroot_url = 'https://' + window.location.host + '/';
                auth_server = (window.flxweb_settings && window.flxweb_settings.auth_root_url) ? window.flxweb_settings.auth_root_url : 'https://' + window.location.host;
                auth_server_url = (window.flxweb_settings && window.flxweb_settings.auth_login_url) ? window.flxweb_settings.auth_login_url : auth_server + '/auth/login/member/';
                providerUrl = (window.flxweb_settings && window.flxweb_settings.auth_login_provider_verification_urls) ? webroot_url + url : 'https://' + window.location.host + '/' + url; //TODO:Fix it to use the config from flxweb
                left = (screen.width - 735) / 2;
                window.removeEventListener('message', receiveMessage, false);
                window.removeEventListener('message', receiveMessage, false);
                window.addEventListener('message', receiveMessage, false);
                if (!window.isWebView()) {
                    url = auth_server_url + provider + '?url=' + encodeURI(escape(providerUrl));
                    window.open(url, provider + '_window', 'location=no, menubar=no, resizable=yes status=no, scrollbars=no, width=719, height=425,top=193,left=' + left);
                } else {
                    url = auth_server_url + provider + '?url=' + encodeURI(escape(providerUrl)) + '&popup=false' + '&returnTo=' + encodeURIComponent(returnTo || window.location.href);
                    window.location.href = url;
                }
                return false;
            }

            function signInSuccess(response) {
                if (response.hasOwnProperty('response')) {
                    if (response.response.hasOwnProperty('message')) {
                        if (response.response.message.match('Incorrect')) {
                            $('.js-incorrect-error').removeClass('hide');
                        } else {
                            $('.js-unknown-error').removeClass('hide');
                        }
                    } else {
                        $('.content-wrap').removeClass('hide');
                        window.location.href = '/account/signin-complete/ck-12?redirect=' + encodeURIComponent(returnTo || window.location.href);
                    }
                } else {
                    $('.js-unknown-error').removeClass('hide');
                }
            }

            function signInError() {
                $('.js-unknown-error').removeClass('hide');
            }

            function bindEventsSignIn() {
                $('.js-sign-up').off('click.signup').on('click.signup', function() {
                    if (!$(this).attr('href')) {
                        $('#sign-in-modal').foundation('reveal', 'close');
                    }
                });

                $('.js-sign-in-button').off('click.sign-in').on('click.sign-in', function () {
                    var provider = $(this).attr('data-provider');
                    signin_click(provider, 'auth/verify/member/' + provider);
                });

                $('#sign-in-modal input').on('keyup blur change', function(){
                    var enabled = true;
                    var inputs = $('#username').add('#password');
                    inputs.each(function(){
                        if ( $.trim($(this).val()) == '' || $(this).hasClass('error') ){
                            enabled = false;
                            return false;
                        }
                    });
                    if (enabled){
                        $('.js-sign-in-submit').removeClass('disabled grey dusty-grey').addClass('tangerine standard');
                    } else {
                        $('.js-sign-in-submit').addClass('disabled grey dusty-grey').removeClass('tangerine standard');
                    }
                });

                $('#show-more').off('click.show').on('click.show', function () {
                    $('.sign-in-button-wrapper').toggleClass('button-open');
                    $(this).add('.sign-in-button-hide').toggleClass('hide');
                });

                $('.js-sign-in-close').off('click.close').on('click.close', function () {
                    $('.content-wrap').removeClass('hide');
                    $('#sign-in-modal').foundation('reveal', 'close');
                });

                $('.js-signin-edit').off('change.signin').on('change.signin', function () {
                    $('.js-signin-error').addClass('hide');
                    if (this.value && $('.js-signin-edit').not(this).val()) {
                        $('.js-sign-in-submit').prop( 'disabled', false ).removeClass('dusty-grey').addClass('tangerine standard');
                    } else {
                        $('.js-sign-in-submit').prop( 'disabled', true ).addClass('dusty-grey').removeClass('tangerine standard');
                    }
                }).off('keypress.signin').on('keypress.signin', function (e) {
                    $('.js-signin-error').addClass('hide');
                    if (this.value && $('.js-signin-edit').not(this).val()) {
                        $('.js-sign-in-submit').prop( 'disabled', false ).removeClass('dusty-grey').addClass('tangerine standard');
                    } else {
                        $('.js-sign-in-submit').prop( 'disabled', true ).addClass('dusty-grey').removeClass('tangerine standard');
                    }
                    if (13 === (e.keyCode || e.which)) {
                        $('.js-sign-in-submit').trigger('click');
                    }
                }).off('keyup.signin').on('keyup.signin', function () {
                    $('.js-signin-error').addClass('hide');
                    if (this.value && $('.js-signin-edit').not(this).val()) {
                        $('.js-sign-in-submit').prop( 'disabled', false ).removeClass('dusty-grey').addClass('tangerine standard');
                    } else {
                        $('.js-sign-in-submit').prop( 'disabled', true ).addClass('dusty-grey').removeClass('tangerine standard');
                    }
                    /*	if (13 === (e.keyCode || e.which)) {
                    $('.js-sign-in-submit').trigger('click');
                }*/
                });

                $('.js-sign-in-submit').off('click.signin').on('click.signin', function () {
                    if ($(this).prop('disabled') || !($('.js-signin-edit:eq(0)').val() && $('.js-signin-edit:eq(1)').val())) {
                        $('.js-empty-error').removeClass('hide');
                        return false;
                    }
                    var data = {};
                    $(this).siblings('input').each(function () {
                        data[this.name] = this.value;
                    });
                    $.ajax({
                        'url': '/auth/login/member',
                        'method': 'POST',
                        'data': data,
                        'dataType' : 'json',
                        'success': signInSuccess,
                        'error': signInError
                    });
                });
            }

            $('.js-return-to').attr('href', '/auth/forgot/password?returnTo=' + encodeURIComponent(window.location.href));
            $('.js-sign-up').attr('href', $('header').find('.join').children('a').attr('href'));
            $('.js-signin-error').add('.sign-in-button-hide').addClass('hide');
            $('.js-signin-edit').val('');
            $('.sign-in-button-wrapper').removeClass('button-open');
            $('#show-more').removeClass('hide');
            if ($('#side-reveal-icon').is(':visible')) {
                $('.content-wrap').addClass('hide');
            }
            $('#sign-in-modal').foundation('reveal', 'open');
            bindEventsSignIn();
        }
    };

    return signin;
});
