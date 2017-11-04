/* global webroot_url */
define(['jquery', 'auth/flx.global'], function ($) {
    'use strict';

    var provider;

    $(function () {
        $.support.placeholder = false;
        var test = document.createElement('input');
        if (test.hasOwnProperty('placeholder')) {
            $.support.placeholder = true;
        }
    });

    function receiveMessage(event) {
        try {
            if (event.data) {
                var event_data = JSON.parse(event.data);
                if (event_data.hasOwnProperty('auth') || event_data.hasOwnProperty('auth_new')) {
                    if (0 === parseInt(event_data.auth, 10) || 0 === parseInt(event_data.auth_new, 10)) { //Success
                        window.location.href = '/account/signin-complete/' + provider + '/?redirect=/my/dashboard';
                        provider = '';
                    } else {
                        console.log('Could not recognize the auth status');
                    }
                }
            }
            window.removeEventListener('message', receiveMessage, false);

            if ('https://api.twitter.com' === event.origin) {
                window.addEventListener('message', receiveMessage, false);
            }
        } catch (e) {
            console.log(e);
        }
    }

    function signin_click(socialProvider, url) {
        provider = socialProvider;
        var auth_server, auth_server_url, providerUrl, left;
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
            url = auth_server_url + provider + '?url=' + encodeURI(escape(providerUrl)) + '&popup=false' + '&returnTo=/my/dashboard';
            window.location.href = url;
        }
        return false;
    }

    //executed when $.support.placeholder is not there.
    function forActiveElement() {
        if (!$.support.placeholder) {
            if (document.activeElement !== undefined) {
                var active = document.activeElement;
                $(':text').focus(function () {
                    if ($(this).attr('placeholder') !== undefined &&
                        $(this).attr('placeholder') !== '' &&
                        ($(this).val() === $(this).attr('placeholder'))) {
                        $(this).val('').removeClass('hasPlaceholder');
                    }
                }).blur(function () {
                    if ($(this).attr('placeholder') !== undefined &&
                        $(this).attr('placeholder') !== '' &&
                        ($(this).val() === '' || $(this).val() === $(this).attr('placeholder'))) {
                        $(this).val($(this).attr('placeholder')).addClass('hasPlaceholder');
                    }
                });
                $(':text').blur();
                $(active).focus();
                $('form').submit(function () {
                    $(this).find('.hasPlaceholder').each(function () {
                        $(this).val('');
                    });
                });
            }
        }
    }

    function isValidBackURL(url){
        var status=false;
        if(url && !/^https?:\/\//.test(url) || /^https?:\/\/\w+-?\w+\.ck12\.org\/?/.test(url)){
            status=true;
        }
        return status;
    }

    function domReady() {
        $('#signin_form').ck12_smartForm({
            ajax: false,
            validateOnBlur: false,
            rules: {
                username: {
                    required: true,
                    maxlength: 127
                },
                password: {
                    required: true
                }
            },
            messages: {
                username: {
                    required: 'Enter your user name or email',
                    maxlength: 'Must be less than 128 characters'
                },
                password: {
                    required: 'Enter your password'
                }
            }
        });

        // [bug:6795]  for signin form hide the previous error message, when typing.
        $('[name=submitbutton]').click(function () {
            $('#signin_errors').attr('style', 'opacity:0');
        });


        // add the ck12 form treatment
        $('#signup_form').ck12_smartForm({
            ajax: false,
            rules: {
                firstName: {
                    required: true,
                    maxlength: 63,
                    remote: {
                        url: webroot_url + 'validate/member/firstName',
                        type: 'post'
                    }
                },
                lastName: {
                    required: true,
                    maxlength: 63,
                    remote: {
                        url: webroot_url + 'validate/member/lastName',
                        type: 'post'
                    }
                },
                email: {
                    required: true,
                    maxlength: 255,
                    simple_email: true,
                    remote: {
                        url: webroot_url + 'validate/member/email',
                        type: 'post'
                    }
                },
                password: {
                    required: true,
                    minlength: 6,
                    ck12_password: true
                }
            },
            messages: {
                firstName: {
                    required: 'Enter your first name',
                    maxlength: 'Must be less than 64 characters',
                    remote: 'Double quotes or smaller than (<) are not allowed in first name'
                },
                lastName: {
                    required: 'Enter your last name',
                    maxlength: 'Must be less than 64 characters',
                    remote: 'Double quotes or smaller than (<) are not allowed in last name'
                },
                email: {
                    required: 'Enter a valid email address',
                    maxlength: 'Must be less than 256 characters',
                    remote: 'This email address is already taken'
                },
                password: {
                    required: 'Enter new password',
                    minlength: 'Must be at least 6 characters'
                }
            }
        });


        // add the ck12 form treatment
        $('#profile_form').ck12_smartForm({
            ajax: false,
            rules: {
                firstName: {
                    required: true,
                    maxlength: 63,
                    remote: {
                        url: webroot_url + 'validate/member/firstName',
                        type: 'post'
                    }
                },
                lastName: {
                    required: true,
                    maxlength: 63,
                    remote: {
                        url: webroot_url + 'validate/member/lastName',
                        type: 'post'
                    }
                },
                email: {
                    required: true,
                    maxlength: 255,
                    simple_email: true,
                    remote: {
                        url: webroot_url + 'validate/member/email',
                        type: 'post'
                    }
                },
                //login aka username
                login: {
                    required: false,
                    minlength: 3,
                    maxlength: 127,
                    ck12_username: true,
                    // ck12_loginemail: true,
                    remote: {
                        url: webroot_url + 'validate/member/login',
                        type: 'post'
                    }
                },
                website: {
                    required: false,
                    maxlength: 2083
                },
                city: {
                    required: false,
                    maxlength: 63
                },
                province: {
                    required: false,
                    maxlength: 63
                },
                zip: {
                    required: false,
                    minlength: 5,
                    maxlength: 5,
                    ck12_zip: true
                },
                postalCode: {
                    required: false,
                    maxlength: 10
                },
                phone: {
                    required: false,
                    minlength: 10,
                    maxlength: 16,
                    ck12_phone: true
                },
                fax: {
                    required: false,
                    minlength: 10,
                    maxlength: 16,
                    ck12_phone: true
                },
                birthday: {
                    required: true,
                    remote: {
                        url: webroot_url + 'validate/member/birthday',
                        type: 'post'
                    }
                }
            },
            messages: {
                firstName: {
                    required: 'Enter your first name',
                    maxlength: 'Must be less than 64 characters',
                    remote: 'Double quotes or smaller than (<) are not allowed in first name'
                },
                lastName: {
                    required: 'Enter your last name',
                    maxlength: 'Must be less than 64 characters',
                    remote: 'Double quotes or smaller than (<) are not allowed in last name'
                },
                email: {
                    required: 'Enter a valid email address',
                    maxlength: 'Must be less than 256 characters',
                    remote: 'This email address is already taken'
                },
                login: {
                    minlength: 'Must be at least 3 characters',
                    maxlength: 'Must be less than 128 characters',
                    remote: 'This login is already taken'
                },
                website: {
                    maxlength: 'Must be less than 2084 characters'
                },
                city: {
                    maxlength: 'Must be less than 64 characters'
                },
                province: {
                    maxlength: 'Must be less than 64 characters'
                },
                zip: {
                    minlength: 'Must be 5 characters',
                    maxlength: 'Must be 5 characters'
                },
                postalCode: {
                    maxlength: 'Must be less than 10 characters'
                },
                phone: {
                    minlength: 'Must be at least 10 digits',
                    maxlength: 'Must be less than 17 digits'
                },
                fax: {
                    minlength: 'Must be at least 10 digits',
                    maxlength: 'Must be less than 17 digits'
                },
                birthday: {
                    required: 'Enter your birthday',
                    remote: 'Enter valid date in mm/dd/yyyy format'
                }
            }
        });

        // add the ck12 form treatment
        $('#password_change_form').ck12_smartForm({
            ajax: false,
            rules: {
                current_password: {
                    required: true
                },
                password: {
                    required: true,
                    minlength: 6,
                    ck12_password: true
                },
                confirm_password: {
                    required: true,
                    minlength: 6,
                    equalTo: '#password'
                }
            },
            messages: {
                current_password: {
                    required: 'Enter current password'
                },
                password: {
                    required: 'Enter new password',
                    minlength: 'Must be at least 6 characters'
                },
                confirm_password: {
                    required: 'Enter the same password as above',
                    minlength: 'Must be at least 6 characters',
                    equalTo: 'Passwords do not match. Please enter the same password as above'
                }
            }
        });

        // add the ck12 form treatment
        $('#password_reset_form').ck12_smartForm({
            ajax: false,
            rules: {
                password: {
                    required: true,
                    minlength: 6,
                    ck12_password: true,
                    ck12_ascii: true
                },
                confirm_password: {
                    required: true,
                    minlength: 6,
                    equalTo: '#password'
                },
                name: {
                    ck12_fullname: true
                }
            },
            messages: {
                password: {
                    required: 'Enter new password',
                    minlength: 'Must be at least 6 characters'
                },
                confirm_password: {
                    required: 'Enter the same password as above',
                    minlength: 'Must be at least 6 characters',
                    equalTo: 'Passwords do not match. Please enter the same password as above'
                }
            }
        });


        // add the ck12 form treatment
        $('#password_forgot_form').ck12_smartForm({
            ajax: false,
            rules: {
                email: {
                    required: true,
                    simple_email: true
                }
            },
            messages: {
                email: {
                    required: 'Enter a valid email address'
                }
            }
        });


        // add the ck12 form treatment
        $('#twitter_email_form').ck12_smartForm({
            ajax: false,
            rules: {
                email: {
                    required: true,
                    simple_email: true
                }
            },
            messages: {
                email: {
                    required: 'Enter a valid email address'
                }
            }
        });

        $('.js-social-sign-in').off('click.sign-in').on('click.sign-in', function () {
            var socialProvider = $(this).attr('data-provider');
            signin_click(socialProvider, 'auth/verify/member/' + socialProvider);
        });

        if ($.flx.queryParam('returnTo') && !isValidBackURL($.flx.queryParam('returnTo'))) {
            $('.js-cancel-forgot-password').addClass('hide');
        } else {
            $('.js-cancel-forgot-password').removeClass('hide');
        }
    }
    $(document).ready(domReady);
    $(document).load(forActiveElement);

    $('#countryID').change(function () {
        var action = $(this).val();

        if (action === '1') {
            $('#stateDiv').css('display', 'block');
            $('#zipDiv').css('display', 'block');
            $('#provinceDiv').css('display', 'none');
            $('#postalCodeDiv').css('display', 'none');
        } else {
            $('#stateDiv').css('display', 'none');
            $('#zipDiv').css('display', 'none');
            $('#provinceDiv').css('display', 'block');
            $('#postalCodeDiv').css('display', 'block');
        }
    });


});
