/* global webroot_url */
define([
    'jquery',
    'underscore',
    'account/templates/accounts.templates',
    'common/utils/ck12.smartform'
], function ($, _, TMPL) {
    'use strict';

    var groupsRowTemplate = _.template(TMPL.groups_row, null, {
            'variable': 'data'
        }),
        accountsMainTemplate = _.template(TMPL.account_main, null, {
            'variable': 'data'
        });

    function accountView(controller) {

        var groupNotifications, disconnectButton,
            groupTotalCount = 0,
            isRender = false,
            isResize = true,
            provider = '';

        function setUserTimeZone() {
            $('#timezone-save-confirmation').removeClass('hide');
            $('.js-timezone-save').addClass('disabled').addClass('grey').removeClass('tangerine');
        }

        function checkForOnNotifications() {
            var groupOnCount = 0;
            $('.js-groups-row').each(function () {
                if ($(this).find('.onoffswitch input').is(':checked')) {
                    groupOnCount++;
                }
            });
            $('#groups-count').text(groupOnCount);
            if ($('#marketing-notification-switch').is(':checked')) {
                $('#marketing-notification').removeClass('hide');
            } else {
                $('#marketing-notification').addClass('hide');
            }
            if (1 === groupOnCount) {
                $('#more-multiple-groups').addClass('hide');
            } else {
                $('#more-multiple-groups').removeClass('hide');
            }
            if (!(groupOnCount || $('#marketing-notification-switch').is(':checked'))) {
                $('.js-on-notify').addClass('hide');
                $('.js-off-notify').removeClass('hide');
            } else {
                $('.js-on-notify').removeClass('hide');
                $('.js-off-notify').addClass('hide');
                if ($('#groups-notifications').length && $('#marketing-notification-switch').is(':checked')) {
                    $('#on-connect').removeClass('hide');
                } else {
                    $('#on-connect').addClass('hide');
                }
            }

        }

        function bindGroupEvents() {
            $('.js-toggle-check').off('click.notifications').on('click.notifications', function () {
                var group, parent, temp;
                group = {};
                parent = $(this).parents('.js-groups-row');
                temp = $('[name="' + this.id + '"]');
                if ($(this).is(':checked')) {
                    group[this.name] = 'yes';
                    isRender = true;
                    temp.prop('disabled', false).eq(0).trigger('click');
                    if (this.id.match('peerHelp')) {
                        $('[name="peerHelp-type-' + parent[0].id + '"]').prop('disabled', false).eq(0).trigger('click');
                    }
                    isRender = false;
                    parent.find('.js-' + this.name + '-off').addClass('hide');
                    parent.find('.js-' + this.name + '-on').removeClass('hide1');
                } else {
                    group[this.name] = 'no';
                    temp.prop('disabled', true);
                    temp = $('#' + temp.attr('data-target')).prev();
                    temp.addClass('disabled');
                    if (this.id.match('peerHelp')) {
                        $('[name="peerHelp-type-' + parent[0].id + '"]').prop('disabled', true);
                    }
                    $(this).parents('.groups-switch-wrapper').find('.groups-notification-close').children(':visible').trigger('click');
                    parent.find('.js-' + this.name + '-off').removeClass('hide');
                    parent.find('.js-' + this.name + '-on').addClass('hide1');
                }
                group.groupID = parent[0].id;

                controller.updateSettings(group).done(checkForOnNotifications);
            });

            $('.js-on-link').off('click.notifications').on('click.notifications', function () {
                $(this).parents('.js-groups-row').find('[name="' + $(this).attr('data-target') + '"]').trigger('click');
            });

            $('.js-notifications-edit').off('click.notifications').on('click.notifications', function () {
                var This = $(this).parent();
                This.addClass('hide');
                This.parent().parent().next().removeClass('hide');
                This = This.parent().parent().parent();
                This.addClass('groups-notification-open');
                This.parents('.js-groups-row').find('.groups-white-border').removeClass('hide');
            });

            $('.js-frequency-radio').off('click.notifications').on('click.notifications', function () {
                var group, text, groupID, This;
                group = {};
                groupID = $(this).parents('.js-groups-row')[0].id;
                text = $(this).attr('data-text');
                This = $(this).attr('data-target');
                This = $('#' + This);
                if ($(this).hasClass('js-has-dropdown')) {
                    This.prev().removeClass('disabled');
                    This = This.find('.active');
                    text += This.text();
                    group[$('#' + this.name)[0].name] = This.attr('data-param');
                } else {
                    This.prev().addClass('disabled');
                    group[$('#' + this.name)[0].name] = this.id.split('-')[1];
                }
                $('#' + this.name + '-label').text(text);
                if (!isRender) {
                    group.groupID = groupID;
                    if (this.name.match('peerHelp') && $('#peerHelp-my-' + groupID).is(':checked')) {
                        group.onlyParticipation = 'yes';
                    }
                    controller.updateSettings(group);
                }
            });

            $('.js-frequency-dropdown').off('click.notifications').on('click.notifications', function () {
                var id = $(this).parent()[0].id.replace(/dropdown/g, 'digest');
                if ($(this).hasClass('active')) {
                    if (!isRender) {
                        $(this).parent().prev().trigger('click');
                    } else {
                        $('#' + id).trigger('click');
                    }
                    return;
                }
                $(this).siblings().removeClass('active');
                $(this).addClass('active');
                $(this).parent().prev().find('a').text($(this).text());
                $('#' + id).trigger('click');
            });

            $('.js-dropdown').off('click.notifications').on('click.notifications', function () {
                if ($(this).hasClass('disabled')) {
                    return false;
                }
            });

            $('.js-type-radio').off('click.notifications').on('click.notifications', function () {
                $('#' + this.name + '-label').text($(this).attr('data-text'));
                if (!isRender) {
                    var group, frequency, groupID;
                    group = {};
                    groupID = $(this).parents('.js-groups-row')[0].id;
                    group.groupID = groupID;
                    if (this.id.match('my')) {
                        group.onlyParticipation = 'yes';
                    }
                    frequency = $('[name="peerHelp-' + groupID + '"]:checked')[0].id.split('-')[1];
                    if ('digest' === frequency) {
                        frequency = $('#peerHelp-dropdown-' + groupID).find('.active').attr('data-param');
                    }
                    group.peerHelp = frequency;
                    controller.updateSettings(group);
                }
            });

        }

        function expandNotifications(groups) {
            if (groups) {
                groups = groups.groups;
                var index, template, groupID, temp, parent;
                template = '';
                for (index = 0; index < groups.length; index++) {
                    groupID = groups[index].id;
                    if (groupNotifications.hasOwnProperty(groupID)) {
                        if (groups[index].role.match('admin')) {
                            temp = 'Shared resources, new members';
                        } else if (groups[index].groupType.match('study')) {
                            temp = 'Shared resources';
                        } else if (groups[index].groupType.match('class')) {
                            temp = 'Assignments, shared resources';
                        } else {
                            temp = '';
                        }
                        template += groupsRowTemplate({
                            'groupsID': groupID,
                            'groupImage': groups[index].resource ? groups[index].resource.uri || '' : '',
                            'groupName': groups[index].name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') || '',
                            'resourceSharedLabel': temp
                        });
                    }
                }
                $('#notification-detail-wrapper').after(template);
                bindGroupEvents();
                isRender = true;
                for (index in groupNotifications) {
                    if (groupNotifications.hasOwnProperty(index)) {
                        parent = $('#' + index);
                        if ('off' !== groupNotifications[index].GROUP_SHARE.frequency) {
                            parent.find('[name="resourceShared"]').prop('checked', true);
                            if ($('#share-' + groupNotifications[index].GROUP_SHARE.frequency + '-' + index).length) {
                                $('#share-' + groupNotifications[index].GROUP_SHARE.frequency + '-' + index).trigger('click');
                            } else {
                                $('#share-dropdown-' + index).prev().removeClass('disabled');
                                $('#share-dropdown-' + index).find('[data-param="' + groupNotifications[index].GROUP_SHARE.frequency + '"]').trigger('click');
                            }
                        } else {
                            parent.find('.js-resourceShared-off').removeClass('hide');
                            parent.find('.js-resourceShared-on').addClass('hide1');
                        }
                        if (groupNotifications[index].hasOwnProperty('GROUP_PH_POST')) {
                            $('#peerHelp-all-' + index).trigger('click');
                        } else {
                            $('#peerHelp-my-' + index).trigger('click');
                        }
                        temp = groupNotifications[index].GROUP_PH_POST || groupNotifications[index].PH_POST;
                        if ('off' !== temp.frequency) {
                            parent.find('[name="peerHelp"]').prop('checked', true);
                            if ($('#peerHelp-' + temp.frequency + '-' + index).length) {
                                $('#peerHelp-' + temp.frequency + '-' + index).trigger('click');
                            } else {
                                $('#peerHelp-dropdown-' + index).prev().removeClass('disabled');
                                $('#peerHelp-dropdown-' + index).find('[data-param="' + temp.frequency + '"]').trigger('click');
                            }
                        } else {
                            parent.find('.js-peerHelp-off').removeClass('hide');
                            parent.find('.js-peerHelp-on').addClass('hide1');
                        }
                    }
                }
                isRender = false;
            }
            $('#notification-details').removeClass('hide');
            $('#edit-notifications').removeClass('js-disabled').parent().addClass('hide').parents('.account-notifications-wrapper').addClass('background-vanilla');
            $('#notification-summary-wrapper').addClass('notification-open');
            $('#notification-details').addClass('js-loaded');
        }

        function editNotifications() {
            if (!($('#edit-notifications').hasClass('js-disabled'))) {
                $('#edit-notifications').addClass('js-disabled');
                if (!($('#notification-details').hasClass('js-loaded'))) {
                    controller.getGroups(groupTotalCount).done(expandNotifications);
                } else {
                    expandNotifications();
                }
            }
        }

        function checkForm() {
            $('#user-info-save').addClass('hide').prev().removeClass('margin-top');
            if ($('#login').prop('disabled')) {
                if (!$('[data-for="email"]').is(':visible') && !$('[data-for="password"]').is(':visible') && 6 <= $('#password').val().length) {
                    $('#usernameFormSubmit').removeClass('disabled');
                } else {
                    $('#usernameFormSubmit').addClass('disabled');
                }
            } else {
                if (!($('[data-for="login"]').is(':visible') && $('[data-for="email"]').is(':visible')) && !$('[data-for="password"]').is(':visible') && 6 <= $('#password').val().length) {
                    $('#usernameFormSubmit').removeClass('disabled');
                } else {
                    $('#usernameFormSubmit').addClass('disabled');
                }
            }
        }

        function checkPasssword() {
            $('#password-save').addClass('hide').prev().removeClass('margin-top');
            if (!($('[data-for="newpassword"]').is(':visible') || $('[data-for="currentpassword"]').is(':visible')) && 6 <= $('#newpassword').val().length && $('#currentpassword').val()) {
                $('#passwordFormSubmit').removeClass('disabled');
            } else {
                $('#passwordFormSubmit').addClass('disabled');
            }
        }

        function receiveMessage(event) {
            try {
                if (event.data) {
                    var event_data = JSON.parse(event.data);
                    if (event_data.hasOwnProperty('auth') || event_data.hasOwnProperty('auth_new')) {
                        if (0 === parseInt(event_data.auth, 10) || 0 === parseInt(event_data.auth_new, 10)) { //Success
                            $('#' + provider + '-connect').addClass('hide').next().removeClass('hide-important');
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
                url = auth_server_url + provider + '?url=' + encodeURI(escape(providerUrl)) + '&popup=false' + '&returnTo=' + encodeURIComponent(window.location.href);
                window.location.href = url;
            }
            return false;
        }

        function checkForInfoError() {
            if ($('#login').prop('disabled')) {
                if ($('#email').hasClass('error') && !$('#password').hasClass('error') && !$('#email').val()) {
                    console.log('Please enter a valid email address.');
                    return true;
                }
            } else {
                if ((!$('#login').val() || $('#login').hasClass('error')) && (!$('#email').val() || $('#email').hasClass('error')) && !$('#password').hasClass('error')) {
                    console.log('Please enter a valid email address and/or a username');
                    return true;
                }
            }
            return false;
        }

        function editAppNotifications() {
            $('#app-notification-details').removeClass('hide');
            $('#edit-app-notifications').parent().addClass('hide').parents('.account-app-notifications-wrapper').addClass('background-vanilla');
            $('#app-notification-summary-wrapper').addClass('notification-open');
        }

        function bindEvents(temp) {

            $('#passwordForm').ck12_smartForm({
                ajax: false,
                rules: {
                    currentpassword: {
                        required: true,
                        notEqual: '#newpassword'
                    },
                    newpassword: {
                        required: true,
                        minlength: 6,
                        notEqual: '#currentpassword',
                        ck12_password: true,
                        ck12_ascii: true
                    }
                },
                messages: {
                    currentpassword: {
                        required: 'Please enter your current password.',
                        notEqual: 'Please enter different passwords.'
                    },
                    newpassword: {
                        required: 'Please enter a new password.',
                        minlength: 'Enter at least 6 characters.',
                        notEqual: 'Please enter different passwords.'
                    }
                }
            });

            $('#passwordForm').find('input').off('keypress.user').on('keypress.user', function (e) {
                if (13 === (e.keyCode || e.which)) {
                    $(this).blur();
                    $('#passwordFormSubmit').trigger('click');
                }
            });

            $('#passwordFormSubmit').off('click.password').on('click.password', function () {
                if (!$(this).hasClass('disabled')) {
                    var data = {};
                    data['old password'] = $('#currentpassword').val().trim();
                    data.password = $('#newpassword').val().trim();
                    controller.passwordChange(data).done(function () {
                        $('#password-save').removeClass('hide').prev().addClass('margin-top');
                        $('#passwords-show').prop('checked', false);
                        $('.js-password-change').prop('type', 'password');
                        $('.js-password-change').val('').removeClass('valid');
                        $('#passwordFormSubmit').addClass('disabled');
                    });
                }
            });
            $('#passwords-show').off('change.password').on('change.password', function () {
                var password = this.checked ? 'text' : 'password';
                $('.js-password-change').prop('type', password);
            });
            $('.js-password-change').off('change.ck12').on('change.ck12', checkPasssword).off('keyup.ck12').on('keyup.ck12', checkPasssword).off('blur.ck12').on('blur.ck12', checkPasssword);

            $('#nameForm').ck12_smartForm({
                ajax: false,
                rules: {
                    name: {
                        ck12_name: true,
                        required: true
                    }
                },
                messages: {
                    name: {
                        required: 'Please enter a name.'
                    }
                }
            });

            $('#name').off('keypress.user').on('keypress.user', function (e) {
                if (13 === (e.keyCode || e.which)) {
                    $(this).blur();
                    return false; // to ensuer that the form is not submitted by mistake
                }
            }).off('change.user').on('change.user', function () {
                $(this).blur();
                if (!$(this).hasClass('error') && $(this).val().trim()) {
                    var name = $(this).val().trim().split(' '),
                        member = {};
                    member.givenName = name.splice(0, 1)[0];
                    member.lastName = name.join(' ');
                    member.invalidate_client = true;
                    controller.saveProfile(member).done(function () {
                        name = member.givenName + ' ' + member.lastName;
                        name = name.length > 18 ? name.substring(0, 18) + '...' : name;
                        $('.js_user_name').text(name);
                    });
                }
            });

            var loginRemote = $('#login').prop('disabled') ? false : {
                url: 'https://' + (window.location.host || window.API_SERVER_HOST) + '/auth/ajax/validate/member/login',
                type: 'post',
                xhrFields: {
                    withCredentials: true
                }
            };

            $('#usernameForm').ck12_smartForm({
                ajax: false,
                rules: {
                    login: {
                        minlength: 3,
                        maxlength: 64,
                        ck12_username_emptyable: true,
                        notEqual: '#emailID',
                        invalid_username: true,
                        remote: loginRemote
                    },
                    email: {
                        simple_email_emptyable: true,
                        remote: {
                            url: 'https://' + (window.location.host || window.API_SERVER_HOST) + '/auth/validate/member/email',
                            type: 'post',
                            xhrFields: {
                                withCredentials: true
                            }
                        }
                    },
                    password: {
                        required: true,
                        minlength: 6,
                        ck12_password: temp,
                        ck12_ascii: temp
                    }
                },
                messages: {
                    login: {
                        minlength: 'Must be at least 3 characters.',
                        maxlength: 'Must be less than 128 characters.',
                        notEqual: 'Username can not be same as email id.',
                        invalid_username: 'Username is not valid, No special characters allowed.',
                        remote: 'This username has already been taken.'
                    },
                    email: {
                        remote: 'This email has already been taken.'
                    },
                    password: {
                        required: 'Please enter a password.',
                        minlength: 'Enter at least 6 characters.'
                    }
                }
            });

            $('#usernameForm').find('input').off('keypress.user').on('keypress.user', function (e) {
                if (13 === (e.keyCode || e.which)) {
                    $(this).blur();
                    $('#usernameFormSubmit').trigger('click');
                }
            });

            $('#usernameFormSubmit').off('click.submit').on('click.submit', function () {
                var data, self = this;
                if (!$(self).hasClass('disabled')) {

                    // Bug 42929 : force validation on all inputs before save
                    $('#usernameForm').find('input').focus().blur();

                    if (checkForInfoError()) {
                        $(self).addClass('disabled');
                        return false;
                    }

                    $(self).removeClass('disabled');
                    data = {};
                    data.password = $('#password').val();
                    if (!$('#login').hasClass('error') && !$('#login').prop('disabled') && 3 <= $('#login').val().length) {
                        data.login = $('#login').val();
                    }
                    if ($('#login').prop('readonly')) {
                        data.login = $('#login').val();
                    }
                    if (!$('#email').hasClass('error') && ($('#email').val() || '').length) {
                        data.email = $('#email').val();
                    }
                    $('.user-name-error').add('.user-name-error-small').addClass('hide');
                    $('#usernameForm').find('input').blur().removeClass('error');
                    $(self).removeClass('disabled'); // required to be twice in this handler
                    controller.updateUserInfo(data).done(function () {
                        $('#user-info-save').removeClass('hide').prev().addClass('margin-top');
                        $('.social-topic-text').addClass('hide');
                        $('.password .user-text').text('Password');
                        $('#change-password').removeClass('hide');
                        $('#password-check').remove();
                        $('#password').val('');
                        $(self).addClass('disabled');
                        if (data.hasOwnProperty('login')) {
                            $('#login').prop('readonly', true).prop('disabled', true).next().remove();
                        } else {
                            $('#login').val('').focusin();
                        }
                        $('#emailID').val(data.email || $('#emailID').val()).focusin();

                    });
                    return false;
                }
            });

            $('.js-user-info').off('change.ck12').on('change.ck12', checkForm).off('keyup.ck12').on('keyup.ck12', checkForm).off('blur.ck12').on('blur.ck12', checkForm);
            $('#password').off('change.ck12').on('change.ck12', checkForm).off('keyup.ck12').on('keyup.ck12', checkForm).off('blur.ck12').on('blur.ck12', checkForm);

            $('#login').off('focus.user').on('focus.user', function () {
                $('#username-change').removeClass('hide').siblings('.email-label').children().addClass('text-margin');
            }).off('blur.user').on('blur.user', function () {
                $('#username-change').addClass('hide').siblings('.email-label').children().removeClass('text-margin');
            });

            $('#password-show').off('change.password').on('change.password', function () {
                var password = this.checked ? 'text' : 'password';
                $('#password').prop('type', password);
            });

            $('.js-social-connect').off('click.social').on('click.social', function () {
                var socialProvider = this.id.split('-')[0];
                signin_click(socialProvider, 'auth/verify/member/' + socialProvider);
            });

            $('.js-disconnect-link').off('click.social').on('click.social', function () {
                disconnectButton = $(this);
                if (1 === $('.js-disconnect-link:visible').length && $('.social-topic-text').is(':visible')) {
                    $('.js-wait-social-text').text(disconnectButton.parent().prev().children('span').text());
                    if ($('#side-reveal-icon').is(':visible')) {
                        var top = Math.round(disconnectButton.offset().top - disconnectButton.parents('.social-account-container').parent().offset().top);
                        top += Math.round(disconnectButton.height() + 22);
                        $('#wait-disconnect-tooltip').css('top', top).slideToggle('slow');
                    } else {
                        $('#wait-disconnect').foundation('reveal', 'open');
                    }
                } else {
                    disconnectButton.next().slideToggle('slow');
                }
            });

            $('.js-wait-tooltip-close').off('click.social').on('click.social', function () {
                $('#wait-disconnect-tooltip').slideUp('slow');
            });

            $(window).off('resize.social').on('resize.social', function () {
                if (isResize) {
                    isResize = false;
                    setTimeout(function () {
                        if ($('#side-reveal-icon').is(':visible')) {
                            if ($('#wait-disconnect').is(':visible')) {
                                $('#wait-disconnect').foundation('reveal', 'close');
                                var top = Math.round(disconnectButton.offset().top - disconnectButton.parents('.social-account-container').parent().offset().top);
                                top += Math.round(disconnectButton.height() + 22);
                                $('#wait-disconnect-tooltip').css('top', top).show();
                            }
                        } else {
                            if ($('#wait-disconnect-tooltip').is(':visible')) {
                                $('#wait-disconnect-tooltip').hide();
                                $('#wait-disconnect').foundation('reveal', 'open');
                            }
                        }
                        isResize = true;
                    }, 500); // allow for resize to complete
                }
            });

            $('#wait-disconnect-ok').off('click.social').on('click.social', function () {
                $('#wait-disconnect').children(':eq(0)').trigger('click');
            });

            $('.js-social-close').off('click.social').on('click.social', function () {
                $(this).parents('.disconnect-tooltip').slideUp('slow');
            });

            $('body').off('click.social').on('click.social', function (e) {
                if (!($(e.target).closest('.disconnect-tooltip').length || $(e.target).hasClass('js-disconnect-link')) && $('.disconnect-tooltip').is(':visible')) {
                    $('.js-social-close').trigger('click');
                }
                if (!($(e.target).closest('#wait-disconnect-tooltip').length || $(e.target).hasClass('js-disconnect-link')) && $('#wait-disconnect-tooltip').is(':visible')) {
                    $('.js-wait-tooltip-close').trigger('click');
                }
            });

            $('.js-social-disconnect').off('click.social').on('click.social', function () {
                var socialProvider, self;
                self = $(this).parents('.disconnect-tooltip');
                socialProvider = self.prev().prev()[0].id.split('-')[0];
                socialProvider = {
                    'auth_type': socialProvider
                };
                controller.disconnectSocial(socialProvider).done(function () {
                    self.find('.js-social-close').trigger('click');
                    self.prev().addClass('hide-important').prev().removeClass('hide');
                });
            });

            $('#edit-notifications').off('click.notifications').on('click.notifications', editNotifications);

            $('#marketing-notification-switch').off('change.email').on('change.email', function () {
                var data = {};
                data.newNewsletter = $(this).is(':checked') ? 'yes' : 'no';
                data.newUpdate = $(this).is(':checked') ? 'yes' : 'no';
                controller.updateSettings(data).done(function () {
                    checkForOnNotifications();
                });
            });

            $('.js-small-link').off('click.link').on('click.link', function () {
                if ($('#side-reveal-icon').is(':visible')) {
                    editNotifications();
                }
            });

            $('#account-timezone').find('li').off('click.notification').on('click.notification', function () {
                var dropdown = $(this).parent().prev();
                if ($(this).hasClass('active')) {
                    dropdown.trigger('click');
                    return;
                }
                $(this).siblings().removeClass('active');
                $(this).addClass('active');
                dropdown.find('a').html($(this).children().html());
                $('#timezone-save-confirmation').addClass('hide');
                $('.js-timezone-save').removeClass('disabled').removeClass('grey').addClass('tangerine');
                if (!isRender) {
                    dropdown.trigger('click');
                }
            });
            $('.js-timezone-save').off('click.timezone').on('click.timezone', function () {
                if (!($(this).hasClass('disabled'))) {
                    var timezone = {};
                    timezone.timezone = $('#account-timezone').find('.active').children().attr('title').replace(' ', '_');
                    controller.setUserTimeZone(timezone).done(function () {
                        setUserTimeZone();
                    });
                }
            });

            $('#notification-detail-close').off('click.notifications').on('click.notifications', function () {
                var This = $('#edit-notifications');
                This.parent().removeClass('hide');
                This.parents('.account-notifications-wrapper').removeClass('background-vanilla');
                $('#notification-summary-wrapper').removeClass('notification-open');
                $('#notification-details').addClass('hide');
                $('.account-settings-space:last').removeClass('hide');
            });

            $('#edit-app-notifications').off('click.notifications').on('click.notifications', editAppNotifications);

            $('#app-notification-detail-close').off('click.notifications').on('click.notifications', function () {
                var This = $('#edit-app-notifications');
                This.parent().removeClass('hide');
                This.parents('.account-app-notifications-wrapper').removeClass('background-vanilla');
                $('#app-notification-summary-wrapper').removeClass('notification-open');
                $('#app-notification-details').addClass('hide');
                $('.account-settings-space:last').removeClass('hide');
                $('#coach-email-save').addClass('hide').prev().removeClass('margin-top');
                $('#notification-save').addClass('hide');
                //  saveAppNotification();
            });
            $('#saveAppNotifications').off('click.appnotification').on('click.appnotification', saveAppNotification);
            $('#remainder-switch').off('change.notification').on('change.notification', function () {
                var data = {},
                    notify = false;
                if ($('#remainder-switch').is(':checked')) {
                    data['emails'] = true;
                } else {
                    data['emails'] = false;
                }
                if (data) {
                    notifyEmailCoach(data,notify);
                }
            });
            $('.js-app-notification-switch').off('change.notifications').on('change.notifications', function () {
                var data = {};
                data.inAppNotification = $(this).is(':checked');
                controller.updateAppNotificationInfo(data).done(function () {
                    console.log('settings updated');
                });
            });
            $('.js-app-small-link').off('click.link').on('click.link', function () {
                if (window.innerWidth < 768) {
                    editAppNotifications();
                }
            });
            $('.sc-coach-type,.sc-coach-type-arrow').off('click').on('click', function () {
                $('.sc-coach-type-options').toggleClass('hide');
            });
            $('.sc-coach-option').off('click').on('click', function () {
                var data = $(this).data('val');
                $('.sc-coach-type-options').addClass('hide');
                $('.sc-coach-type').val($(this).text());
                $('.sc-coach-type').attr('data-val', data);
            });
            $('.sc-coach-form-section').find('input').off('change.notify').on('change.notify', removeNotification).off('keyup.notify').on('keyup.notify', removeNotification).off('blur.notify').on('blur.notify', removeNotification);
        }

        function removeNotification() {
            $('#notification-save').addClass('hide');
            $('.sc-coach-error-msg').addClass('hide');
            $('#server-error').addClass('hide');
            $('.sc-coach-form-section input').css({'border-color':'#ccc'});
        }

        function saveAppNotification() {
            var data = {},
                validUser = (/^[a-zA-Z]+\.?[a-zA-Z\s_/.]*[a-zA-Z]{2,}$/),
                notify,
                validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            data['coachEmail'] = getCoachInfo().email;
            data['coachName'] = getCoachInfo().name;
            data['coachType'] = $('.sc-coach-type').data('val');
            if ($('#remainder-switch').is(':checked')) {
                data['emails'] = true;
            } else {
                data['emails'] = false;
            }
            if (!data['coachName'] || !validUser.test(data['coachName'])) {
                $('.sc-coach-name-error-msg').removeClass('hide').html('Please enter a valid name for your coach.');
                $('input.sc-coach-name').css({'border-color':'#FF6633'});
                return false;
            } else {
                $('.sc-coach-name-error-msg').addClass('hide');
            }
            if (!validEmail.test(data['coachEmail']) || !data['coachEmail']) {
                $('.sc-coach-email-error-msg').removeClass('hide').html('Please enter a valid email address for your coach.');
                return false;
            } else {
                $('.sc-coach-email-error-msg').addClass('hide').html('');
                $('input.sc-coach-email').css({'border-color':'#ccc'});
            }
            //service for coach addition to be written here
            if (data) {
                notify = true;
                notifyEmailCoach(data,notify);
            }
        }

        function notifyEmailCoach(data,notify) {
            var API_SERVER_URL = window.API_SERVER_URL || '',
                url = API_SERVER_URL + '/assessment/api/sc/update/member?notification=True';
            $.ajax({
                'url': url,
                'type': 'POST',
                'dataType' : 'json',
                'data': data,
                'success': function (response) {
                    if (response.responseHeader.status === 0 && notify) {
                        $('#notification-save').removeClass('hide');
                        $('#server-error').addClass('hide');
                        window.scrollTo(0, document.body.scrollHeight);
                    } else if (response.response.message) {
                        $('#notification-save').addClass('hide');
                        $('#server-error').removeClass('hide').html(response.response.message);
                    }

                },
                'error': function () {
                    console.log('error');
                }
            });
        }

        function getCoachInfo() {
            var name = $('.sc-coach-name').val(),
                email = $('.sc-coach-email').val();
            name = name.replace(/\s+/g, ' ');

            return {
                'email': email,
                'name': name
            };
        }

        function render(container, notifications, timeZones, userTimeZone, accountInfo, appNotificationInfo) {
            var key, temp, timezone,
                groupOnCount = 0,
                isSCOver = new Date(appNotificationInfo.member.summerChallenge.scEndDate) - new Date() > 0 ? false : true;
            accountInfo.login = accountInfo.login !== accountInfo.defaultLogin ? accountInfo.login : '';
            var hideEmailField = (accountInfo.email && (accountInfo.email.indexOf('partners.ck12.org') !== -1));
            console.log('hideEmailField', hideEmailField);
            //change for FBS_TIMESPENT event, bug 53983
            if (window.practiceAppHelper && window.practiceAppHelper.appLocalStorage) {
                window.ads_userid = window.practiceAppHelper.appLocalStorage.getItem('currentUserID');
            }
            $('.loader-container').addClass('hide');
            $(container).append(accountsMainTemplate({
                'login': accountInfo.login,
                'email': accountInfo.email,
                'isUnderage': accountInfo.isUnderage,
                'name': (appNotificationInfo.member.firstName || '') + ' ' + (appNotificationInfo.member.lastName || ''),
                'returnTo': window.location.href,
                'appHome': 'https://' + window.location.hostname + '/',
                'hideEmailField': hideEmailField
            }));
            timeZones = timeZones.timezones || [];
            notifications = notifications.notifications;
            for (key in notifications.groupNotifications) {
                if (notifications.groupNotifications.hasOwnProperty(key)) {
                    groupTotalCount++;
                    temp = notifications.groupNotifications[key].GROUP_PH_POST || notifications.groupNotifications[key].PH_POST;
                    if ('off' !== notifications.groupNotifications[key].GROUP_SHARE.frequency || 'off' !== temp.frequency) {
                        groupOnCount++;
                    }
                }
            }
            if (groupTotalCount) {
                $('#groups-count').text(groupOnCount);
                $('.js-yes-groups').remove();
                if (1 === groupOnCount) {
                    $('#more-multiple-groups').addClass('hide');
                }
                groupNotifications = notifications.groupNotifications;
            } else {
                $('.js-no-groups').remove();
                $('#notification-details').addClass('js-loaded');
            }
            if ('off' !== notifications.NEWSLETTER_PUBLISHED.frequency) {
                $('#marketing-notification').removeClass('hide');
                $('#marketing-notification-switch').prop('checked', true);
                $('#on-connect').removeClass('hide');
            } else if (!groupOnCount) {
                $('.js-on-notify').addClass('hide');
                $('.js-off-notify').removeClass('hide');
            }
            $('#account-settings-main').removeClass('hide');
            temp = '';
            for (key = 0; key < timeZones.length; key++) {
                timezone = '<label>(GMT' + timeZones[key][1] + ') </label>' + timeZones[key][0].replace('_', ' ');
                temp += '<li><a title="' + timeZones[key][0].replace('_', ' ') + '">' + timezone + '</a></li>';
            }
            $('#account-timezone').html(temp);
            $('#password-show').prop('checked', false);
            temp = true;
            if (accountInfo.hasOwnProperty('authTypes')) {
                if (accountInfo.authTypes.hasOwnProperty('ck-12')) {
                    temp = false;
                    $('.social-topic-text').addClass('hide');
                    $('.password .user-text').text('Password');
                    $('#password-check').remove();
                    $('#change-password').removeClass('hide');
                }
                if (accountInfo.authTypes.hasOwnProperty('google')) {
                    $('#google-connect').addClass('hide').next().removeClass('hide-important');
                }
                if (accountInfo.authTypes.hasOwnProperty('twitter')) {
                    $('#twitter-connect').addClass('hide').next().removeClass('hide-important');
                }
                if (accountInfo.authTypes.hasOwnProperty('facebook')) {
                    $('#facebook-connect').addClass('hide').next().removeClass('hide-important');
                }
                if (accountInfo.authTypes.hasOwnProperty('azure')) {
                    $('#azure-connect').addClass('hide').next().removeClass('hide-important');
                }
            }
            if (appNotificationInfo.member.summerChallenge && appNotificationInfo.member.summerChallenge.enroll && !isSCOver) {
                $('.brainflex-notification-section').removeClass('hide');
                if (appNotificationInfo.member.summerChallenge.coachName) {
                    $('.sc-coach-name').val(appNotificationInfo.member.summerChallenge.coachName);
                }
                if (appNotificationInfo.member.summerChallenge.coachEmail) {
                    $('.sc-coach-email').val(appNotificationInfo.member.summerChallenge.coachEmail);
                }
                if (appNotificationInfo.member.summerChallenge.coachType) {
                    var coachType = appNotificationInfo.member.summerChallenge.coachType.toLowerCase();
                    $('.sc-coach-type').attr('data-val', appNotificationInfo.member.summerChallenge.coachType);
                    if (coachType.indexOf('teacher') != -1 || coachType.indexOf('parent') != -1) {
                        coachType = 'Teacher/Parent';
                    } else if (coachType == 'friend') {
                        coachType = 'Friend';
                    } else {
                        coachType = 'Other';
                    }
                    $('.sc-coach-type').val(coachType);
                }
                if (appNotificationInfo.member.summerChallenge.emails) {
                    $('#remainder-switch').prop('checked', true);
                }
            } else {
                $('#summerChellengeEnrolled').addClass('hide');
            }
            if (window.location.href.match('email')) {
                window.scrollTo($('.brainflex-notification-section').offset().top);
            }
            $('.disconnect-tooltip').add('#wait-disconnect-tooltip').hide();
            $('#password').add('.js-user-info').val('');
            $('.js-user-info').add('#name').each(function () {
                $(this).val(this.title);
                $(this).removeAttr('title');
            });
            bindEvents(temp);
            if (userTimeZone) {
                userTimeZone = $('[title="' + userTimeZone.replace('_', ' ') + '"]').parent();
            } else {
                userTimeZone = $('#account-timezone').find('li').filter(function () {
                    return $(this).children()[0].title.match(/us\/pacific/gi);
                });
            }
            if (!(userTimeZone.length)) {
                userTimeZone = $('#account-timezone').find('li:first');
            }
            isRender = true;
            userTimeZone.trigger('click');
            $('#email').trigger('change');
            isRender = false;

            controller.getUserId();
            $('#in-app-notification-switch').prop('checked', appNotificationInfo.member.hasOwnProperty('inAppNotification') ? (appNotificationInfo.member.inAppNotification ? true : false) : true);
        }

        this.render = render;

    }
    return accountView;
});
