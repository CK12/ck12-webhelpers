/*global webroot_url, ads_userid, _ck12*/
define(['jquery', 'common/utils/utils', 'common/utils/url', 'common/views/share.via.email.view', 'common/utils/user', 'auth/flx.global', 'fn/foundation/foundation.forms'], function ($, util,CK12URL, ShareEmailView, User) {

    'use strict';

    $(function () {
        var isThanksModalOpen = false,
            underAgeSubmit = true,
            isSuccessModalOpen = false,
            userDetails = {
                'user_email': '',
                'loggedin': false
            },
            isUnderAgeCalling = false;

        function getUrlTerm(name, url) {
            var regexS = '[\\?&]' + name + '=([^&#]*)';
            var regex = new RegExp(regexS);
            var tmpURL = (url === undefined) ? window.location.href : url;
            var results = regex.exec(tmpURL);
            if (results === null) {
                return '';
            }
            return results[1];
        }

        function calculateAge() {
            var date1, date2, milli, milliPerYear, yearsApart, val;
            val = $('.js-signup-form-wrapper:visible').find('.birthday').val();
            val = val.split('/');
            date1 = new Date(parseInt(val[2], 10), (parseInt(val[0], 10) - 1), parseInt(val[1], 10));
            date2 = new Date();

            milli = date2 - date1;
            milliPerYear = 1000 * 60 * 60 * 24 * 365.26;

            yearsApart = milli / milliPerYear;
            return yearsApart;
        }

        function underAgeRegistration() {
            var params = {
                'username': $('#login').val(),
                'password': $('#password').val(),
                't': getUrlTerm('t', window.location.href)
            };
            util.ajax({
                url: util.getApiUrl('auth/signup/u13'),
                type: 'post',
                data: params,
                async: false,
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (result && result.responseHeader && result.responseHeader.status === 0) {
                        isUnderAgeCalling = true;
                        $('.done-creation').attr('href', 'http://' + window.location.host);
                        $('.username').text($('#login').val());
                        $('.userpassword').text($('#password').val());
                        $('body').addClass('share-modal-open');
                        if (window.innerWidth < 768) {
                            $('#signup_u13_form').addClass('hide-important');
                            $('.content-wrap').children().addClass('hide-important');
                            $('#signup_u13_form').removeClass('hide-important');
                            $('#underageSuccess-mob').removeClass('hide-important');
                        } else {
                            $('#signup_u13_form').removeClass('hide-important');
                            $('#underageSuccess-mob').addClass('hide-important');
                            $('#underageSuccessModal').foundation('reveal', 'open');
                        }
                        isSuccessModalOpen = true;
                        $('.close-done-creation').off('click.close').on('click.close', function () {
                            window.location.href = $('#underageSuccessModal .done-creation').attr('href');
                        });
                        $('#underageSuccessModal .close').off('click.close').on('click.close', function () {
                            window.location.href = $('#underageSuccessModal .done-creation').attr('href');
                        });
                    } else if (result && result.response && result.response.message) {
                        alert(result.response.message);
                    } else {
                        alert('Sorry, we are unable to process the request. Please try again');
                    }
                },
                error: function () {
                    alert('Sorry, we are unable to process the request. Please try again');
                }
            });
        }

        function bindUnderageSmartForm() {
            $('#signup_underage_form').ck12_smartForm({
                ajax: false,
                rules: {
                    nameUnderage: {
                        ck12_fullname: true,
                        invalid_fullname: true
                    },
                    parentEmail: {
                        required: true,
                        maxlength: 128,
                        simple_email: true
                    },
                    birthday: {
                        required: true,
                        ck12_birthdate: true,
                        remote: {
                            url: '/auth/validate/member/birthday',
                            type: 'post'
                        }
                    }
                },
                messages: {
                    parentEmail: {
                        required: 'Enter valid email address(e.g. name@address.com)',
                        maxlength: 'Must be less than 128 characters.',
                        remote: 'This email address is already taken.'
                    },
                    birthday: {
                        required: 'Enter your birthday.',
                        remote: 'Please enter a valid date.'
                    }
                }
            });
        }

        function underAgeSignup() {
            var params = {
                'name': $('#nameUnderage').val(),
                'birthday': $('#signup_underage_form #birthday').val(),
                'email': $('#parentEmail').val()
            };
            util.ajax({
                url: util.getApiUrl('auth/request/u13/signup'),
                type: 'post',
                data: params,
                async: false,
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (result && result.responseHeader && result.responseHeader.status === 0) {
                        // $('.back-homepage a').attr('href', 'http://' + window.location.host);
                        if (window.innerWidth < 768) {
                            $('.content-wrap').children().addClass('hide-important');
                            $('#signup_underage_form').removeClass('hide-important');
                            $('#underageThanks-mob').removeClass('hide-important');
                            $('#signup_underage_form .signup-header-small').addClass('hide');
                        } else {
                            $('#underageThanks-mob').addClass('hide-important');
                            $('#underageThanksModal').foundation('reveal', 'open');
                        }
                        isThanksModalOpen = true;
                    } else if (result && result.response && result.response.message) {
                        alert(result.response.message);
                    } else {
                        alert('Sorry, we are unable to process the request. Please try again');
                    }
                },
                error: function () {
                    alert('Sorry, we are unable to process the request. Please try again');
                }
            });
        }

        $('#signup_student_form').ck12_smartForm({
            ajax: false,
            rules: {
                name: {
                    ck12_fullname: true,
                    invalid_fullname: true
                },
                email: {
                    required: true,
                    maxlength: 128,
                    simple_email: true,
                    remote: {
                        url: '/auth/validate/member/email',
                        type: 'post'
                    }
                },
                password: {
                    required: true,
                    minlength: 6,
                    ck12_password: true
                },
                password_confirm: {
                    required: true,
                    minlength: 6,
                    ck12_password: true,
                    equalTo: '#password'
                },
                birthday: {
                    required: true,
                    ck12_birthdate: true,
                    remote: {
                        url: '/auth/validate/member/birthday',
                        type: 'post'
                    }
                }
            },
            messages: {
                password: {
                    required: 'Enter at least 6 characters.',
                    minlength: $.format('Enter at least {0} characters.')
                },
                email: {
                    required: 'Enter valid email address(e.g. name@address.com)',
                    maxlength: 'Must be less than 128 characters.',
                    remote: 'This email address is already taken.'
                },
                birthday: {
                    required: 'Enter your birthday.',
                    remote: 'Please enter a valid date.'
                }
            }
        });

        bindUnderageSmartForm();

        $('#signup_student_form').off('submit').on('submit', function (event) {
            var $signUpFormSubmit = $('#signup_form_submit');
            if($signUpFormSubmit.hasClass('disabled')) {
                return false;
            } else {
                if ($('#signup_student_form #birthday').prev().find('.invalid').length) {
                    $('#signup_student_form #birthday').addClass('error');
                    $signUpFormSubmit.addClass('disabled');
                    $signUpFormSubmit.addClass('disabled grey').removeClass('tangerine standard');
                    return false;
                }
                $('#signup_student_form input').trigger('blur');
                if ($(this).find('input.error').length) {
                    return false;
                }
                var name = $(this).find('#name').val() || '';
                name = $.trim(name);
                var arr = name.split(' ');
                $(this).find('#firstName').val(arr.splice(0, 1));
                $(this).find('#lastName').val(arr.join(' '));
                if (calculateAge() < 13) {
                    event.preventDefault();
                    $('#signup_student_form').addClass('hide');
                    $('#signup_underage_form').removeClass('hide');
                    bindUnderageSmartForm();
                } else {
                    $('#signup_student_form').removeClass('hide');
                    $('#signup_underage_form').addClass('hide');
                }
            }
        });

        $('#signup_underage_form').off('submit').on('submit', function () {
            if (underAgeSubmit) {
                if ($('#signup_underage_form #birthday').prev().find('.invalid').length) {
                    $('#signup_underage_form #birthday').addClass('error');
                    $('#underage_form_submit').addClass('disabled');
                    $('#underage_form_submit').addClass('disabled grey').removeClass('tangerine standard');
                    return false;
                }
                $('#signup_underage_form input').trigger('blur');
                if ($('#underage_form_submit').hasClass('disabled')) {
                    return false;
                }
                if ($(this).find('input.error').length) {
                    return false;
                }
                //var name = $(this).find('#nameUnderage').val() || '';
                //name = $.trim(name);
                //var arr = name.split(' ');
                //$(this).find('#firstName').val(arr.splice(0,1));
                //$(this).find('#lastName').val(arr.join(' '));
                if (calculateAge() < 13) {
                    $('#signup_student_form').addClass('hide');
                    $('#signup_underage_form').removeClass('hide');
                    bindUnderageSmartForm();
                    underAgeSubmit = false;
                    underAgeSignup();
                    return false;
                }
                $('#signup_student_form').removeClass('hide');
                $('#signup_underage_form').addClass('hide');
            } else {
                return false;
            }
        });

        $('#signup_student_form input').on('keyup blur change', function () {
            var enabled = true;
            var inputs = $('#name').add('#email').add('#password').add('#birthday');
            inputs.each(function () {
                if ($.trim($(this).val()) === '' || $(this).hasClass('error')) {
                    enabled = false;
                    return false;
                }
            });
            if (enabled) {
                $('#signup_form_submit').removeClass('disabled grey').addClass('tangerine standard');
            } else {
                $('#signup_form_submit').addClass('disabled grey').removeClass('tangerine standard');
            }
        });

        $('#signup_underage_form input').on('keyup blur change', function () {
            var enabled = true;
            var inputs = $('#nameUnderage').add('#parentEmail').add('#signup_underage_form #birthday');
            inputs.each(function () {
                if ($.trim($(this).val()) === '' || $(this).hasClass('error')) {
                    enabled = false;
                    return false;
                }
            });
            if (enabled) {
                $('#underage_form_submit').removeClass('disabled grey').addClass('tangerine standard');
            } else {
                $('#underage_form_submit').addClass('disabled grey').removeClass('tangerine standard');
            }
        });

        $('.birthday').on('blur', function () {
            $('.birthday').val($(this).val());
            if (calculateAge() < 13) {
                $('#signup_student_form').addClass('hide');
                $('#signup_underage_form').removeClass('hide');
                bindUnderageSmartForm();
            } else {
                $('#signup_student_form').removeClass('hide');
                $('#signup_underage_form').addClass('hide');
            }
        });

        $('input.name').on('keyup blur change', function () {
            $('input.name').not(this).val($(this).val());
        });

        $('#signup_teacher_form').ck12_smartForm({
            ajax: false,
            rules: {
                name: {
                    ck12_fullname: true,
                    invalid_fullname: true
                },
                email: {
                    required: true,
                    maxlength: 128,
                    simple_email: true,
                    remote: {
                        url: '/auth/validate/member/email',
                        type: 'post'
                    }
                },
                password: {
                    required: true,
                    minlength: 6,
                    ck12_password: true
                },
                password_confirm: {
                    required: true,
                    minlength: 6,
                    ck12_password: true,
                    equalTo: '#password'
                }
            },
            messages: {
                password: {
                    required: 'Enter at least 6 characters.',
                    minlength: $.format('Enter at least {0} characters.')
                },
                email: {
                    required: 'Enter valid email address(e.g. name@address.com)',
                    maxlength: 'Must be less than 128 characters.',
                    remote: 'This email address is already taken.'
                }
            }
        });
        $('#signup_teacher_form').off('submit').on('submit', function () {
            if ($('#signup_form_submit').hasClass('disabled')) {
                return false;
            } else {
                $('#signup_teacher_form input').trigger('blur');
                if ($(this).find('input.error').length) {
                    return false;
                }
                var name = $(this).find('#name').val() || '';
                name = $.trim(name);
                var arr = name.split(' ');
                $(this).find('#firstName').val(arr.splice(0, 1));
                $(this).find('#lastName').val(arr.join(' '));
            }
        });

        $('#signup_teacher_form input').on('keyup blur change', function () {
            var enabled = true;
            var inputs = $('#name').add('#email').add('#password');
            inputs.each(function () {
                if ($.trim($(this).val()) === '' || $(this).hasClass('error')) {
                    enabled = false;
                    return false;
                }
            });
            if (enabled) {
                $('#signup_form_submit').removeClass('disabled grey').addClass('tangerine standard');
            } else {
                $('#signup_form_submit').addClass('disabled grey').removeClass('tangerine standard');
            }
        });
        $('#signup_u13_form').ck12_smartForm({
            rules: {
                login: {
                    required: true,
                    minlength: 3,
                    maxlength: 64,
                    ck12_username: true,
                    invalid_username: true,
                    remote: {
                        url: webroot_url + 'ajax/validate/member/login',
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
                login: {
                    required: 'Please enter valid username.',
                    minlength: 'Must be at least 3 characters.',
                    maxlength: 'Must be less than 128 characters.',
                    notEqual: 'Username can not be same as email id.',
                    remote: 'This username has already been taken.'
                },
                password: {
                    required: 'Enter at least 6 characters.',
                    minlength: $.format('Enter at least {0} characters.')
                }
            }


        });

        $('#signup_u13_form').off('submit').on('submit', function (event) {
            if(!isUnderAgeCalling){
                $('#signup_u13_form input').trigger('blur');
                if ($('#signup_form_submit').hasClass('disabled')) {
                    return false;
                }
                if ($(this).find('input.error').length) {
                    return false;
                }
                underAgeRegistration();
            }
            event.preventDefault();
        });

        $('#signup_u13_form input').on('keyup blur change', function () {
            var enabled = true;
            var inputs = $('#login').add('#password');
            inputs.each(function () {
                if ($.trim($(this).val()) === '' || $(this).hasClass('error')) {
                    enabled = false;
                    return false;
                }
            });
            if (enabled) {
                $('#signup_form_submit').removeClass('disabled grey').addClass('tangerine standard');
            } else {
                $('#signup_form_submit').addClass('disabled grey').removeClass('tangerine standard');
            }
        });

        $('#signup_form').ck12_smartForm({
            ajax: false,
            rules: {
                name: {
                    ck12_fullname: true,
                    invalid_fullname: true
                },
                email: {
                    required: true,
                    maxlength: 128,
                    simple_email: true,
                    remote: {
                        url: '/auth/validate/member/email',
                        type: 'post'
                    }
                },
                password: {
                    required: true,
                    minlength: 6,
                    ck12_password: true
                },
                password_confirm: {
                    required: true,
                    minlength: 6,
                    ck12_password: true,
                    equalTo: '#password'
                },
                birthday: {
                    required: true,
                    ck12_birthdate: true,
                    remote: {
                        url: '/auth/validate/member/birthday',
                        type: 'post'
                    }
                }
            },
            messages: {
                password: {
                    required: 'Enter at least 6 characters.',
                    minlength: $.format('Enter at least {0} characters')
                },
                email: {
                    required: 'Enter a valid email address',
                    maxlength: 'Must be less than 128 characters',
                    remote: 'This email address is already taken'
                },
                birthday: {
                    required: 'Enter your birthday',
                    remote: 'Please enter a valid date'
                }
            }
        });
        $('#signup_form').bind('submit', function () {
            if ($(this).hasClass('disabled')) {
                return false;
            }
            if ($(this).find('input.error').length) {
                return false;
            }
            var name = $(this).find('#name').val() || '';
            name = $.trim(name);
            var arr = name.split(' ');
            $(this).find('#firstName').val(arr.splice(0, 1));
            $(this).find('#lastName').val(arr.join(' '));
        });

        $('#signup_form input').on('keyup blur change', function () {
            var enabled = true;
            var inputs = $('#name').add('#email').add('#password').add('#birthday');
            inputs.each(function () {
                if ($.trim($(this).val()) === '' || $(this).hasClass('error')) {
                    enabled = false;
                    return false;
                }
            });
            if (enabled) {
                $('#signup_form_submit').removeClass('disabled grey').addClass('tangerine standard');
            } else {
                $('#signup_form_submit').addClass('disabled grey').removeClass('tangerine standard');
            }
        });

        $('.js-signup-email-button').off('click.signup').on('click.signup', function () {
            $('.signup-mail-button-container').addClass('hide');
            $('#signup_student_form').removeClass('hide');
            $('#signup_teacher_form').removeClass('hide');
            $('.js-social-login-wrapper').addClass('hide-for-small');
            $('.signup-separator').addClass('hide-for-small');
            $('.js-signup-join-wrapper').addClass('signup-using-email');
            $('.content-wrap').addClass('signup-using-email-wrapper');
            if ($('#signup_student_form').length) {
                $('html, body').animate({
                    scrollTop: $('#signup_student_form').offset().top - 150
                });
            } else if ($('#signup_teacher_form').length) {
                $('html, body').animate({
                    scrollTop: $('#signup_teacher_form').offset().top - 150
                });
            }
        });

        $('.js-sign-up-close').off('click.signup').on('click.signup', function () {
            window.history.back();
        });

        $('.content-wrap').addClass('signup-content-wrap');

        $('.show-more-buttons').off('click.show').on('click.show', function () {
            $('.signin-button-hide').removeClass('hide');
            $(this).addClass('hide');
            $('.signin-button-container').addClass('show-all');
        });

        //hide the show password checkbox for browsers that don't support changing input type
        if (/MSIE [8]/.test(navigator.userAgent)) {
            $('.pwd-toggle-container').hide();
        } else {
            try {
                $('#password_display_toggle').off('click').on('click', function () {
                    var $password_check = $('#password_check');
                    $password_check.toggleClass('checked');
                    if ($password_check.hasClass('checked')) {
                        $('#password').attr('type', 'text');
                    } else {
                        $('#password').attr('type', 'password');
                    }
                });
            } catch (err) {
                $('.pwd-toggle-container').hide();
            }
        }

        $('.js-mail-credentials').off('click.mail').on('click.mail', function () {
            var This, finalInstructions = '';
            $('.js-credentials-wrapper').first().find('span').each(function () {
                finalInstructions += $(this).text();
                This = $(this);
                while (This.next()[0] && 'br' === This.next()[0].nodeName.toLowerCase()) {
                    finalInstructions += '%0D%0A';
                    This = This.next();
                }
            });
            $('.done-creation').trigger('click');
            ShareEmailView.open({
                'shareTitle': 'Thanks for Creating ' + $('#underageSuccessModal').attr('data-name') + '\'s Account',
                'shareUrl': window.location.protocol + '//' + window.location.host,
                'shareBody': decodeURIComponent(finalInstructions),
                'userSignedIn': window.ck12_signed_in || false,
                'context': 'Share CK-12 Foundation',
                'payload': {
                    'memberID': ads_userid
                },
                'userEmail': userDetails.user_email || '',
                '_ck12': true
            });
        });

        $('.js-print-credentials').off('click.print').on('click.print', function () {
            window.print();
        });

        function bindEventsForDate() {
            $('.date-list').off('click.date').on('click.date', function () {
                var dataParam, text, $this, selected = true,
                    day, month, year, dataSelected, parentContainer;
                $this = $(this);
                parentContainer = $(this).parents('.signup-form-container');
                text = $this.text();
                dataSelected = $this.attr('data-date');
                dataParam = $this.parent().attr('data-param');
                $('.' + dataParam).html(text + '<span></span>');
                $('[data-param=' + dataParam + ']').removeClass('open').addClass('selected').attr('data-selected', dataSelected).css({
                    left: '-99999px'
                });
                $('.date-drop-down').each(function () {
                    if (!$(this).hasClass('selected')) {
                        selected = false;
                    }
                });

                if (selected) {
                    month = parentContainer.find('.monthDropDown').attr('data-selected');
                    day = parentContainer.find('.dayDropDown').attr('data-selected');
                    year = parentContainer.find('.yearDropDown').attr('data-selected');
                    $('.birthday').val(month + '/' + day + '/' + year);
                    parentContainer.find('.birthday').trigger('blur');
                }
            });

            $('body').off('click.date').on('click.date', function (ev) {
                var currentElement;
                if (!($(ev.target).closest('.date-drop-down').length)) {
                    if (!($(ev.target).closest('.birthdate-dropdown').length)) {
                        $('.date-drop-down').removeClass('open').css({
                            left: '-99999px'
                        });
                    } else {
                        currentElement = $(ev.target).closest('.birthdate-dropdown').attr('data-dropdown');
                        $('.date-drop-down').not('#' + currentElement).removeClass('open').css({
                            left: '-99999px'
                        });
                    }
                }
            });
        }

        function initializeDatePicker() {
            var count, currentYear, str = '';
            if ($('#monthDropDown').length) {
                for (count = 1; count <= 31; count++) {
                    str += '<li class="day-list date-list" data-date="' + count + '">' + count + '</li>';
                }
                $('.dayDropDown').append(str);
                str = '';
                currentYear = new Date().getFullYear();
                for (count = currentYear; count > (currentYear - 100); count--) {
                    str += '<li class="year-list date-list" data-date="' + count + '">' + count + '</li>';
                }
                $('.yearDropDown').append(str);
                bindEventsForDate();
            }
        }

        function fetchUserInfo() {
            var user = new User();
            user.fetch({
                'success': function(model, userInfo) {
                    userDetails = {
                        'user_email': userInfo.email || '',
                        'loggedin': true
                    };

                }
            });
        }

        function isValidBackURL(url){
            var status=false;
            if(url && !/^https?:\/\//.test(url) || /^https?:\/\/\w+-?\w+\.ck12\.org\/?/.test(url)){
                status=true;
            }
            return status;
        }

        function domReady() {
            var queryParams,referrer,payload;
            queryParams = new CK12URL(window.location.href);

            if (queryParams && queryParams.search_params) {
                if ('referrer' in queryParams.search_params) {
                    referrer = queryParams.search_params['referrer'];
                } else if ('returnTo' in queryParams.search_params) {
                    referrer = queryParams.search_params['returnTo'];
                }
            }
            if (!referrer) {
                referrer = 'not provided';
            }

            payload = {
                'referrer': referrer
            };

            if (window._ck12){
                _ck12.logEvent('FBS_SIGNUP_PAGE', payload);
            }

            function bindevents() {
                $(window).off('resize.thanks').on('resize.thanks', function () {
                    if (isThanksModalOpen === true) {
                        if (window.innerWidth >= 768) {
                            $('.underageThanksSubmit').attr('data-reveal-id', 'underageThanksModal');
                            $('.content-wrap').children().removeClass('hide-important');
                            $('#underageThanks-mob').addClass('hide-important');
                            $('#underageThanksModal').foundation('reveal', 'open');
                        } else if (window.innerWidth < 768) {
                            $('#signup_underage_form .signup-header-small').addClass('hide');
                            $('#underageThanksModal').foundation('reveal', 'close');
                            $('#underageThanks-mob').removeClass('hide-important');
                            $('.underageThanksSubmit').removeAttr('data-reveal-id', 'underageThanksModal');

                        }
                    } else if (isSuccessModalOpen === true) {
                        if (window.innerWidth >= 768) {
                            $('#signup_u13_form').removeClass('hide-important');
                            $('.content-wrap').children().removeClass('hide-important');
                            $('#underageSuccess-mob').addClass('hide-important');
                            $('#underageSuccessModal').foundation('reveal', 'open');
                        } else if (window.innerWidth < 768) {
                            $('#signup_u13_form').addClass('hide-important');
                            $('#underageSuccessModal').foundation('reveal', 'close');
                            $('#underageSuccess-mob').removeClass('hide-important');
                        }
                    }
                });
                $('.resend-mail').off('click.resend').on('click.resend', function () {
                    $.ajax({
                        url: webroot_url + 'verify/email'
                    }).done(function () {
                        $('.resend-mail').addClass('hide');
                        $('.sent-verification-email').removeClass('hide');

                    });
                });
            }
            $('.signup-form-wrapper input').not(':submit,.form-submit-wrap input').val('');
            initializeDatePicker();
            bindevents();
            fetchUserInfo();
            $(window).trigger('resize.thanks');
            if ($.flx.queryParam('returnTo') && !isValidBackURL($.flx.queryParam('returnTo'))) {
                $('#continueButton').attr('href', '/my/dashboard');
            }
        }
        $(document).ready(domReady);
    });


});
