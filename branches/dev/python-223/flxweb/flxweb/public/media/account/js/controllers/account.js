define(['account/views/account.view',
'account/services/ck12.account',
'common/utils/user',
'jquery'
], function (accountView, accountService, User, $) {
    'use strict';

    function AccountController() {

        accountView = new accountView(this);

        function resultValidation(result) {
            if (result.hasOwnProperty('response')) {
                result = result.response;
                if (result.hasOwnProperty('message')) {
                    result = '';
                }
            } else {
                result = '';
            }
            return result;
        }

        function checkForPasswordChange(result) {
            try {
                if (result.hasOwnProperty('response')) {
                    result = result.response;
                    if (result.hasOwnProperty('message')) {
                        if (result.message.match('Incorrect password')) {
                            alert('The Password you have entered in the Current Password field is incorrect. Please check it again to make sure it is spelled correctly.');
                        } else if (result.message.match('missing password')) {
                            alert('You did not enter a password. Please enter your password and try again.');
                        } else {
                            alert('Sorry, we could not update the user info right now. Please try again later or contact our customer support.');
                        }
                        result = '';
                    }
                } else {
                    result = '';
                    alert('Sorry, we could not update the user info right now. Please try again later or contact our customer support.');
                }
                return result;
            } catch (e) {
                console.log(e);
                return '';
            }
        }

        function checkForUserInfoUpdate(result) {
            try {
                if (result.hasOwnProperty('response')) {
                    result = result.response;
                    if (result.hasOwnProperty('message')) {
                        if (result.message.match('Incorrect password')) {
                            alert('The password you have entered is incorrect. Please check it again to make sure it is spelled correctly.');
                        } else if (result.message.match('missing password')) {
                            alert('You did not enter a password. Please enter your password and try again.');
                        } else if (result.message.match('invalid email')) {
                            alert('You entered an invalid email address. Please enter a new email address and try again.');
                        } else if (result.message.match('username validation failed')) {
                            alert('The username you entered does not follow our security regulations. Please enter a new username and try again.');
                        } else if (result.message.match('in use already')) {
                            alert('The username you entered is already taken by another user. Please enter a new username and try again.');
                        } else {
                            alert('Sorry, we could not update the user info right now. Please try again later or contact our customer support.');
                        }
                        result = '';
                    }
                } else {
                    result = '';
                    alert('Sorry, we could not update the user info right now. Please try again later or contact our customer support.');
                }
                return result;
            } catch (e) {
                console.log(e);
                return '';
            }
        }

        function load(container) {
            $.when(accountService.getUserTimeZone(),
            accountService.getTimeZones(),
            accountService.getSettings(),
            User.getUser(),
            accountService.getAppNotificationInfo()).done(function (timeZone, timeZones, settings, accountInfo, appNotificationInfo) {
                timeZone = resultValidation(timeZone);
                timeZones = resultValidation(timeZones);
                settings = resultValidation(settings);
                if ('userInfoDetail' in accountInfo) {
                    accountInfo = accountInfo.userInfoDetail;
                }
                appNotificationInfo = resultValidation(appNotificationInfo);
                if (settings && timeZones && timeZone && accountInfo && appNotificationInfo) {
                    accountView.render(container, settings, timeZones, timeZone.timezone, accountInfo,appNotificationInfo);
                } else {
                    alert('Sorry, we could not load your account settings right now. Please try again after some time.');
                }
            }).fail(function () {
                console.log('Sorry, we could not load your account settings right now. Please try again after some time.');
            });
        }

        function loadForApp(container) {


            $.when(accountService.getUserTimeZone(),
            accountService.getTimeZones(),
            accountService.getSettings(),
            accountService.getMyInfo(),
            accountService.getAppNotificationInfo()).done(function (timeZone, timeZones, settings, accountInfo, appNotificationInfo) {
                timeZone = resultValidation(timeZone);
                timeZones = resultValidation(timeZones);
                settings = resultValidation(settings);
                accountInfo = resultValidation(accountInfo);
                appNotificationInfo = resultValidation(appNotificationInfo);
                if (settings && timeZones && timeZone && accountInfo && appNotificationInfo) {
                    accountView.render(container, settings, timeZones, timeZone.timezone, accountInfo, appNotificationInfo);
                } else {
                    alert('Sorry, we could not load your account settings right now. Please try again after some time.');
                }
            }).fail(function () {
                console.log('Sorry, we could not load your account settings right now. Please try again after some time.');
            });
        }

        function updateSettings(data) {
            var _d = $.Deferred();
            accountService.updateSettings(data).done(function (result) {
                result = resultValidation(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    console.log('Sorry, we could not update your setting right now. Please try again after some time.');
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not update your setting right now. Please try again after some time.');
                _d.reject();
            });
            return _d.promise();
        }

        function getGroups(groupTotalCount) {
            var _d = $.Deferred();
            accountService.getGroups(groupTotalCount).done(function (result) {
                result = resultValidation(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    alert('Sorry, we could not load your groups right now. Please try again after some time.');
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not load your groups right now. Please try again after some time.');
                _d.reject();
            });
            return _d.promise();
        }

        function setUserTimeZone(data) {
            var _d = $.Deferred();
            accountService.setUserTimeZone(data).done(function (result) {
                result = resultValidation(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    alert('Sorry, we could not save your time-zone right now. Please try again later or contact our customer support.');
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not save your time-zone right now. Please try again later or contact our customer support.');
                _d.reject();
            });
            return _d.promise();
        }

        function updateUserInfo(data) {
            var _d = $.Deferred();
            accountService.updateUserInfo(data).done(function (result) {
                result = checkForUserInfoUpdate(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not update the user info right now. Please try again later or contact our customer support.');
                _d.reject();
            });
            return _d.promise();
        }

        function disconnectSocial(data) {
            var _d = $.Deferred();
            accountService.disconnectSocial(data).done(function (result) {
                result = resultValidation(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    alert('Sorry, we could not disconnect this social account right now. Please try again later or contact our customer support.');
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not disconnect this social account right now. Please try again later or contact our customer support.');
                _d.reject();
            });
            return _d.promise();
        }

        function getUserId() {
            var userId = $('header').data('user');
            if (!userId && window.practiceAppHelper) {
                userId = window.practiceAppHelper.getUserInfo().uID;
                if (!userId) {
                    window.practiceAppHelper.checkLogin(true);
                    userId = window.practiceAppHelper.getUserInfo().uID;
                }
            }
            return userId;
        }

        function saveProfile(data) {
            var _d = $.Deferred();
            var userId = getUserId();
            accountService.saveProfile(data, userId).done(function (result) {
                result = resultValidation(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    console.log('Sorry, we could not update your profile right now. Please try again later or contact our customer support.');
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not update your profile right now. Please try again later or contact our customer support.');
                _d.reject();
            });
            return _d.promise();
        }

        function passwordChange(data) {
            var _d = $.Deferred();
            var userId = getUserId();
            accountService.passwordChange(data, userId).done(function (result) {
                result = checkForPasswordChange(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    console.log('Sorry, we could not update your password right now. Please try again later or contact our customer support.');
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not update your password right now. Please try again later or contact our customer support.');
                _d.reject();
            });
            return _d.promise();
        }

        function updateAppNotificationInfo(data) {
            var _d = $.Deferred();
            accountService.updateAppNotificationInfo(data).done(function (result) {
                result = resultValidation(result);
                if (result) {
                    _d.resolve(result);
                } else {
                    console.log('Sorry, we could not update your setting right now. Please try again after some time.');
                    _d.reject();
                }
            }).fail(function () {
                console.log('Sorry, we could not update your setting right now. Please try again after some time.');
                _d.reject();
            });
            return _d.promise();
        }

        this.load = load;
        this.loadForApp = loadForApp;
        this.updateSettings = updateSettings;
        this.getGroups = getGroups;
        this.setUserTimeZone = setUserTimeZone;
        this.updateUserInfo = updateUserInfo;
        this.disconnectSocial = disconnectSocial;
        this.saveProfile = saveProfile;
        this.passwordChange = passwordChange;
        this.getUserId = getUserId;
        this.updateAppNotificationInfo = updateAppNotificationInfo;

    }

    return new AccountController();
});
