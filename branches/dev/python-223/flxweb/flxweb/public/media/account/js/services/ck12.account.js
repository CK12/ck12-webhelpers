define([
    'common/utils/utils',
    'jquery'
], function (util, $) {
    'use strict';

    function accountService() {

        var accountsURL = {
            'getSettings': util.getApiUrl('flx/get/member/notifications'),
            'updateSettings': util.getApiUrl('flx/set/member/notifications'),
            'getGroups': util.getApiUrl('flx/group/my'),
            'getTimeZones': util.getApiUrl('auth/get/info/timezones', true),
            'getUserTimeZone': util.getApiUrl('auth/get/member/timezone?format=json', true),
            'setUserTimeZone': util.getApiUrl('auth/set/member/timezone', true),
            'getAccountInfo': util.getApiUrl('auth/get/member/', true),
            'getMyInfo': util.getApiUrl('auth/get/info/my', true),
            'updateUserInfo': util.getApiUrl('auth/update/my/login', true),
            'disconnectSocial': util.getApiUrl('auth/remove/my/social_account', true),
            'saveProfile': util.getApiUrl('auth/update/member/', true),
            'passwordChange': util.getApiUrl('auth/update/member/password/', true),
            'updateAppNotificationInfo': '/assessment/api/update/settings/member',
            'getAppNotificationInfo': '/assessment/api/get/info/my?scInfo=SC2017&scProperties=True'
        };

        function getSettings() {
            var _d = $.Deferred(),
                params = {};
            params.nocache = new Date().getTime(); // to prevent browsers caching the response (mainly for ie)
            util.ajax({
                url: accountsURL.getSettings,
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function updateSettings(data) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.updateSettings,
                method: 'POST',
                data: data,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function getGroups(data) {
            var _d = $.Deferred(),
                params = {};
            params.pageSize = data;
            util.ajax({
                url: accountsURL.getGroups,
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function getTimeZones() {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.getTimeZones,
                xhrFields: {
                    withCredentials: true
                },
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function getUserTimeZone() {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.getUserTimeZone,
                xhrFields: {
                    withCredentials: true
                },
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function setUserTimeZone(data) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.setUserTimeZone,
                method: 'POST',
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function getAccountInfo(memberID) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.getAccountInfo + memberID,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function getMyInfo() {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.getMyInfo,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function updateUserInfo(data) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.updateUserInfo,
                method: 'POST',
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function disconnectSocial(data) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.disconnectSocial,
                method: 'POST',
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function saveProfile(data, userId) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.saveProfile + userId,
                method: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                data: data,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function passwordChange(data, userId) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.passwordChange + userId,
                method: 'POST',
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function getAppNotificationInfo() {
            var _d = $.Deferred(),
                params = {};
            params.nocache = new Date().getTime(); // to prevent browsers caching the response (mainly for ie)
            util.ajax({
                url: accountsURL.getAppNotificationInfo,
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        function updateAppNotificationInfo(data) {
            var _d = $.Deferred();
            util.ajax({
                url: accountsURL.updateAppNotificationInfo,
                method: 'POST',
                data: data,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    _d.resolve(result);
                },
                error: function () {
                    _d.reject('error');
                }
            });
            return _d.promise();
        }

        this.getSettings = getSettings;
        this.updateSettings = updateSettings;
        this.getGroups = getGroups;
        this.getTimeZones = getTimeZones;
        this.getUserTimeZone = getUserTimeZone;
        this.setUserTimeZone = setUserTimeZone;
        this.getAccountInfo = getAccountInfo;
        this.getMyInfo = getMyInfo;
        this.updateUserInfo = updateUserInfo;
        this.disconnectSocial = disconnectSocial;
        this.saveProfile = saveProfile;
        this.passwordChange = passwordChange;
        this.getAppNotificationInfo = getAppNotificationInfo;
        this.updateAppNotificationInfo = updateAppNotificationInfo;

    }

    return new accountService();

});
