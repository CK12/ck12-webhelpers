define(['underscore', 'jquery', 'backbone', 'common/utils/utils'],
    function (_, $, Backbone, util) {
        'use strict';
        var auth_url = util.getApiUrl('auth/get/info/my',true),
            profile_datail_url = util.getApiUrl('flx/get/detail/my'),
            save_data_url = util.getApiUrl('save/userdata/flxweb'),
            get_data_url = util.getApiUrl('get/userdata/flxweb'),
            // save_appdata_url = util.getApiUrl('save/appdata/flxweb'),
            // get_appdata_url = util.getApiUrl('get/appdata/flxweb'),
            checkDataValidation = function (data, source) {
                try {
                    if (source === 'cache') {
                        if (window.ck12_signed_in && data.response.id.toString() === window.ads_userid) {
                            return (data.responseHeader.status === 0);
                        }
                        return false;
                    }
                    return (data.responseHeader.status === 0);
                } catch (e) {
                    console.log(e);
                    return false;
                }
            },
            userInfoCacheOptions = {
                region: 'daily',
                cacheSpace: 'session',
                encrypt: true,
                key: 'userInfoData',
                namespace: 'userInfo',
                validatedata: checkDataValidation
            },
            userDetailCacheOptions = {
                region: 'daily',
                cacheSpace: 'session',
                encrypt: true,
                key: 'userProfileData',
                namespace: 'userProfile',
                validatedata: checkDataValidation
            },
            callCacheAjax = function () {
                var e = document.createEvent('Events');
                e.initEvent('deviceready', true, true);
                document.dispatchEvent(e);
            },
            User = Backbone.Model.extend({
                _d : $.Deferred(),
                'fetch': function (options) {
                    if (!options){
                        options = {};
                    }
                    var _d = $.Deferred(),
                        _c = this,
                        userInfoDetail,
                        parseData;
                    $.when(util.ajax({
                        'url': auth_url,
                        'localCache': userInfoCacheOptions,
                        'isPageDisable': options.isPageDisable === false ? false : true,
                        'isShowLoading': options.isShowLoading === false ? false : true,
                        'xhrFields': {
                            'withCredentials': true
                        }
                    }), util.ajax({
                        'url': profile_datail_url,
                        'isPageDisable': options.isPageDisable === false ? false : true,
                        'isShowLoading': options.isShowLoading === false ? false : true,
                        'localCache': userDetailCacheOptions
                    })).done(function (userInfoResponse, userDetailResponse) {
                        userInfoDetail = $.extend(true, userInfoDetail, userInfoResponse.response, userDetailResponse.response);
                        parseData = _c.parse(userInfoDetail);
                        if ($.isEmptyObject(parseData) || !_c.set(parseData, options)) {
                            return false;
                        }
                        if (options && options.success) {
                            options.success(_c, userInfoDetail);
                        }
                        _d.resolve(userInfoDetail);
                    }).fail(function () {
                        _d.reject();
                    });
                    return _d.promise();
                },
                'parse': function (data) {
                    if (data) {
                        if (data.hasOwnProperty('message')) {
                            return {};
                        }
                        return data;
                    }
                    return {};
                },
                'is_student': function () {
                    var is_student = false,
                        roles = this.get_roles();
                    if (roles) {
                        is_student = !!(_.find(roles, function (role) {
                            return role.name === 'student';
                        }));
                    } else {
                        is_student = (window.flxweb_role === 'student');
                    }
                    return is_student;
                },
                'get_roles': function () {
                    return this.get('roles');
                },
                'getInfo': function () {
                    var _c = this;
                    return util.ajax({
                        'url': auth_url,
                        'localCache': userInfoCacheOptions,
                        'isPageDisable': true,
                        'isShowLoading': true,
                        'xhrFields': {
                            'withCredentials': true
                        },
                        'success': function (response) {
                            _c.set($.extend(true, _c.toJSON(), response.response));
                        }
                    });
                },
                'getDetails': function () {
                    var _c = this;
                    return util.ajax({
                        'url': profile_datail_url,
                        'localCache': userDetailCacheOptions,
                        'isPageDisable': true,
                        'isShowLoading': true,
                        'success': function (response) {
                            _c.set($.extend(true, _c.toJSON(), response.response));
                        }
                    });
                },
                'saveData': function (key, value) {
                    var userdata, options, _c;
                    _c = this;
                    userdata = {
                        'key': key,
                        'value': value
                    };
                    userdata = JSON.stringify(userdata);
                    options = {
                        'userdata': userdata
                    };
                    return util.ajax({
                        'url': save_data_url,
                        'type': 'POST',
                        'data': options,
                        'isPageDisable': true,
                        'isShowLoading': true,
                        'success': function (response) {
                            _c.set($.extend(true, _c.toJSON(), response.response));
                        }
                    });
                },
                'getData': function (key) {
                    var _c = this,
                        userDataCacheOptions = {
                            region: 'daily',
                            cacheSpace: 'session',
                            encrypt: true,
                            key: 'userData' + key,
                            namespace: 'userData',
                            validatedata: checkDataValidation
                        };

                    return util.ajax({
                        'url': get_data_url,
                        'data': key,
                        'localCache': userDataCacheOptions,
                        'isPageDisable': true,
                        'isShowLoading': true,
                        'success': function (response) {
                            _c.set($.extend(true, _c.toJSON(), response.response));
                        }
                    });
                },
                'deleteUserInfo': function () {
                    window.smartcache_instance = window.smartcache_instance || new window.SmartCache();
                    window.smartcache_instance.remove('userInfoData', {
                        region: 'daily',
                        namespace: 'userInfo',
                        cacheSpace: 'session'
                    });
                    window.smartcache_instance.remove('userProfileData', {
                        region: 'daily',
                        namespace: 'userProfile',
                        cacheSpace: 'session'
                    });
                    window.smartcache_instance.remove('flxweb-up-forums', {
                        region: 'daily',
                        namespace: 'appData',
                        cacheSpace: 'session'
                    });

                    // as an extra precaution, delete user info from localstorage too
                    window.smartcache_instance.remove('userInfoData', {
                        region: 'daily',
                        namespace: 'userInfo'
                    });
                    window.smartcache_instance.remove('userProfileData', {
                        region: 'daily',
                        namespace: 'userProfile'
                    });
                    window.smartcache_instance.remove('flxweb-up-forums', {
                        region: 'daily',
                        namespace: 'appData'
                    });
                },
                'isLoggedIn': function(){
                    var parseData = this.parse(this.userInfoDetail);
                    if ($.isEmptyObject(parseData)) {
                        return false;
                    }
                    return true;
                },
                'setAppData': function (appName, obj) {
                    var appData, save_appdata_url, _c;
                    _c = this;
                    save_appdata_url = '/flx/save/appdata/flxweb-up-' + appName;
                    appData = JSON.stringify(obj);
                    util.ajax({
                        'url': save_appdata_url,
                        'type': 'PUT',
                        'data': appData,
                        'contentType': 'application/json; charset=utf-8',
                        'dataType': 'json',
                        'isPageDisable': false,
                        'isShowLoading': false,
                        'success': function (response) {
                            _c.getAppData(appName, true);
                            _c.set($.extend(true, _c.toJSON(), response.response));
                        }
                    });
                },
                'getAppData': function (appName, forceToCall) {
                    var _c = this,
                        appDataCacheOptions = {
                            region: 'daily',
                            cacheSpace: 'session',
                            encrypt: true,
                            key: 'flxweb-up-' + appName,
                            namespace: 'appData'
                            // validatedata: checkDataValidation
                        },
                        //forceToCall = forceToCall || false,
                        get_appdata_url = '/flx/get/appdata/flxweb-up-' + appName;
                    return util.ajax({
                        'url': get_appdata_url,
                        // 'data': key,
                        'localCache': appDataCacheOptions,
                        'isPageDisable': false,
                        'isShowLoading': false,
                        'forceToCall': forceToCall,
                        'success': function (response) {
                            _c.set($.extend(true, _c.toJSON(), response.response));
                        }
                    });
                }

            }, {
                /* @method - Create a dummy user */
                createHollowUser: function () {
                    var user = new User();
                    user.groups = [];
                    return user;
                },
                getUser: function(){
                    var user = new User();
                    util.ajax({
                        'url': auth_url,
                        'localCache': userInfoCacheOptions,
                        'isPageDisable': true,
                        'isShowLoading': true,
                        'xhrFields': {
                            'withCredentials': true
                        }
                    }).done(function(userInfoResponse){
                        user.userInfoDetail = userInfoResponse.response;
                        user._d.resolve(user);
                    }).fail(function(){
                        user._d.reject();
                    });
                    return user._d.promise();
                }
            });
        callCacheAjax();

        return User;
    });
