define([
    'jquery',
    'underscore',
    'backbone',
    'bookmarklet/templates/bookmarklet.templates',
    'common/services/signin.services',
    'common/views/modal.view'
],
function ($, _, Backbone, TMPL, signInService, ModalView) {
    'use strict';

    var bookmarkletLoginView,
        _c,
        providerName;

    bookmarkletLoginView = Backbone.View.extend({
        'events': {
            'click.bookmarklet #show-more': 'showMore',
            'click.bookmarklet #close': 'close',
            'click.bookmarklet .js-sign-in-submit': 'submitLoginInfo',
            'blur.bookmarklet .js-signin-edit': 'checkInputs',
            'keyup.bookmarklet .js-signin-edit': 'checkInputs',
            'change.bookmarklet .js-signin-edit': 'checkInputs',
            'paste.bookmarklet .js-signin-edit': 'pasteInput',
            'click.bookmarklet .js-sign-in-button': 'signIn',
            'click.bookmarklet #agree-checkbox': 'checkAgreeTerms'
        },
        'initialize': function () {
            try {
                _c = this;
                this.$el.html(bookmarkletLoginView.template_login());
                $('html').css('background-color', '#FFFFFF');
            } catch (e) {
                ModalView.alert('Something is not right');
                console.log(e);
            }
        },
        'showMore': function (e) {
            var $this = $(e.target).closest('#show-more');
            $('.sign-in-button-wrapper').toggleClass('button-open');
            $this.add('.sign-in-button-hide').toggleClass('hide');
        },
        'close': function () {
            if (window.parent && window.parent.postMessage) {
                try {
                    window.parent.postMessage(JSON.stringify({
                        'close': true
                    }), '*');
                } catch (e) {
                    console.log(e);
                }
            }
        },
        'submitLoginInfo': function (e) {
            var $this = $(e.target).closest('.js-sign-in-submit');
            if ($this.hasClass('disabled') || !($('.js-signin-edit:eq(0)').val() && $('.js-signin-edit:eq(1)').val())) {
                return false;
            }
            var data = {};
            $this.parent().siblings('input').each(function () {
                data[this.name] = this.value;
            });

            signInService.signIn(_c.signInSuccess, data);
        },
        'checkInputs': function (e) {
            var enabled = true,
                inputs = $('.js-signin-edit'),
                $submitLink = $('.js-sign-in-submit'),
                isAgreeToTerms = $('#agree-checkbox').hasClass('checked');
            $('.js-signin-error').addClass('hide');
            if (isAgreeToTerms) {
                inputs.each(function () {
                    if ($.trim($(this).val()) === '' || $(this).hasClass('error')) {
                        enabled = false;
                        return false;
                    }
                });
            } else {
                enabled = false;
            }
            if (enabled) {
                $submitLink.removeClass('disabled grey dusty-grey').addClass('tangerine standard').prop('disabled', false);
            } else {
                $submitLink.addClass('disabled grey dusty-grey').removeClass('tangerine standard').prop('disabled', true);
            }
            if (13 === (e.keyCode || e.which)) {
                $submitLink.trigger('click');
            }
        },
        'signIn': function (e) {
            var $this = $(e.target).closest('.js-sign-in-button'),
                provider = $this.attr('data-provider');
            _c.signin_click(provider, 'auth/verify/member/' + provider);
        },
        'pasteInput': function (e) {
            var $this = $(e.target);
            if ($this.hasClass('signin-popup-password')) {
                $('.js-sign-in-submit').removeClass('disabled grey dusty-grey').addClass('tangerine standard').prop('disabled', false);
            }
        },
        'signin_click': function (provider, url) {
            var auth_server,
                auth_server_url,
                providerUrl,
                left,
                webroot_url = 'https://' + window.location.host + '/';
            providerName = provider;
            webroot_url = 'https://' + window.location.host + '/';
            auth_server = (window.flxweb_settings && window.flxweb_settings.auth_root_url) ? window.flxweb_settings.auth_root_url : 'https://' + window.location.host;
            auth_server_url = (window.flxweb_settings && window.flxweb_settings.auth_login_url) ? window.flxweb_settings.auth_login_url : auth_server + '/auth/login/member/';
            providerUrl = (window.flxweb_settings && window.flxweb_settings.auth_login_provider_verification_urls) ? webroot_url + url : 'https://' + window.location.host + '/' + url; //TODO:Fix it to use the config from flxweb
            left = (screen.width - 735) / 2;
            window.removeEventListener('message', _c.receiveMessage, false);
            window.removeEventListener('message', _c.receiveMessage, false);
            window.addEventListener('message', _c.receiveMessage, false);
            url = auth_server_url + provider + '?url=' + encodeURI(escape(providerUrl));
            window.open(url, provider + '_window', 'location=no, menubar=no, resizable=yes status=no, scrollbars=no, width=719, height=425,top=193,left=' + left);
            return false;
        },
        'receiveMessage': function (event) {
            try {
                if (event.data) {
                    var event_data = JSON.parse(event.data);
                    if (event_data.hasOwnProperty('auth') || event_data.hasOwnProperty('auth_new')) {
                        if (0 === parseInt(event_data.auth, 10) || 0 === parseInt(event_data.auth_new, 10)) { //Success
                            window.location.href = '/account/signin-complete/' + providerName + '/?redirect=' + encodeURIComponent(window.location.href);
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
                    window.location.href = '/account/signin-complete/ck-12?redirect=' + encodeURIComponent(window.location.href);
                }
            } else {
                _c.trigger('login_failed');
                $('.js-unknown-error').removeClass('hide');
            }
        },
        'checkAgreeTerms': function (e) {
            $(e.target).closest('#agree-checkbox').toggleClass('checked');
            _c.checkInputs(e);
        }
    }, {
        'template_login': _.template(TMPL.BOOKMARKLET_LOGIN, null, {
            'variable': 'data'
        })
    });

    return bookmarkletLoginView;
});
