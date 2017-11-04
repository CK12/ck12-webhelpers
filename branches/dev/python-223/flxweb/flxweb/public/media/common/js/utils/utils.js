
/* globals window, Base64 */
//Common utility methods
define([
    'jquery',
    'underscore'
],
function ($, _) {
    'use strict';

    var loadingElement,
        disableElement,
        isShowLoading,
        isPageDisable,
        API_PREFIX = '',
        WEBROOT_URL = '/',
        BRANCH_NAMES_DATA = {
            'ELA.SPL': 'Spelling',
            'ENG.TST': 'Software Testing',
            'MAT.ALG': 'Algebra',
            'MAT.ALY': 'Analysis',
            'MAT.ARI': 'Arithmetic',
            'MAT.CAL': 'Calculus',
            'MAT.EM1': 'Elementary Math Grade 1',
            'MAT.EM2': 'Elementary Math Grade 2',
            'MAT.EM3': 'Elementary Math Grade 3',
            'MAT.EM4': 'Elementary Math Grade 4',
            'MAT.EM5': 'Elementary Math Grade 5',
            'MAT.GEO': 'Geometry',
            'MAT.MEA': 'Measurement',
            'MAT.PRB': 'Probability',
            'MAT.STA': 'Statistics',
            'MAT.TRG': 'Trigonometry',
            'SCI.BIO': 'Biology',
            'SCI.CHE': 'Chemistry',
            'SCI.ESC': 'Earth Science',
            'SCI.LSC': 'Life Science',
            'SCI.PHY': 'Physics',
            'SCI.PSC': 'Physical Science',
            'SOC.HIS': 'History'
        };

    // DO NOT REMOVE - this is for practice app where webroot_url needs to be a fully qualified server domain name
    if (window.isApp && window.isApp() && window.webroot_url !== null) {
        WEBROOT_URL = window.webroot_url;
        // Bug 50444 Set the apihost to use API_SERVER_URL without the http[s] prefix.
        if (typeof window.apihost == 'undefined' || window.apihost == '') {
            window.apihost = window.API_SERVER_URL;
            if (window.apihost) {
                window.apihost = window.apihost.replace(/^http[s]?:\/\//, '');
            }
        }
    }

    function _df(asyncfunc) {
        return function f() {
            var args = [].splice.call(arguments, 0),
                _d = $.Deferred();
            args.splice(0, 0, _d);
            asyncfunc.apply(null, args);
            return _d.promise();
        };
    }

    function slugify(str) {
        return str.toLowerCase().replace(/([^a-zA-Z\d\s])/g, '').replace(/[\s+]/g, '-');
    }

    var getLocation = _.once(function() {
        var _d = $.Deferred();
        var locationInfo = {};
        var fauxLocationInfo = {};
        try {
            fauxLocationInfo = JSON.parse(Base64.decode($.cookie('ck12-faux-location')));
        } catch(e) {
            fauxLocationInfo = {};
        }
        exports.ajax({
            url: '/dexter/get/location/ip',
            localCache: {
                ttl: 15
            }
        }).done(function (data) {
            _.extend(locationInfo, data.response.ip_info, fauxLocationInfo);
            _d.resolve(locationInfo);
        }).fail(function(e){
            _d.reject(e);
        });
        return _d.promise();
    });

    function toTitleCase(str) {
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

        return str.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function (match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ':' &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }

            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }

            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    }

    function getQueryParam(name, url){
        var regexS = '[\\?&]'+name+'=([^&#]*)';
        var regex = new RegExp( regexS );
        var tmpURL = (url === undefined) ? window.location.href : url;
        var results = regex.exec( tmpURL );
        if( results === null ) {
            return '';
        } else {
            return results[1];
        }
    }

    function deepLookup(prop, sourceObj) {
        var propPaths = prop.split('.'),
            currObj = sourceObj;
        if (typeof currObj === 'undefined'){ return undefined; }
        for (var i = 0, l = propPaths.length; i < l; i++) {
            prop = propPaths[i];
            if ( (typeof currObj) === 'object' && !(currObj instanceof Array) ){
                if ( propPaths[i] in currObj ){
                    currObj = currObj[prop];
                } else {
                    return undefined;
                }
            } else {
                try {
                    if ( (currObj instanceof Array) && !Number.isNaN(Number.parseInt(prop)) ){
                        prop = Number.parseInt(prop);
                    }
                    currObj = currObj[prop];
                    if (typeof currObj === 'undefined'){
                        return undefined;
                    }
                } catch(e) {
                    console.log(e);
                    return undefined;
                }
            }

        }
        return currObj;
    }


    function optimizelyStateToDexterString(stateObj){
        var keys = Object.keys(stateObj);
        return keys.map(function(key){
            return 'OEXP:' + key + '|OVAR:' + stateObj[key];
        }).join(',');
    }


    function b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    }

    var exports = {
        template: function (template, data) {
            var _ = require('underscore');
            data = data || null;
            template = template || '';
            return _.template(template, data, {
                'variable': 'data'
            });
        },
        ajaxStart: function (enableShowClass) {
            var loadingIcon = loadingElement || '#loading-icon',
                pageDisable = disableElement || '#page-disable';

            if (isShowLoading) {
                if(enableShowClass){
                    $(loadingIcon).addClass('show');
                }else{
                    $(loadingIcon).removeClass('hide');
                }
            }

            if (isPageDisable) {
                $(pageDisable).removeClass('hide');
            }
        },
        ajaxStop: function (enableShowClass) {
            if(enableShowClass){
                $('.js-loading-icon').removeClass('show');
            }
            $('.js-page-disable').addClass('hide');
        },
        showLoadingIcon: function () {
            var self = this;
            disableElement = disableElement || '#page-disable';
            $(document).off('ajaxStart.ck12').on('ajaxStart.ck12', function () {
                if (isShowLoading) {
                    $(loadingElement).removeClass('hide');
                }
                if (isPageDisable) {
                    $(disableElement).removeClass('hide');
                }
            });
            $(document).off('ajaxStop.ck12').on('ajaxStop.ck12', function () {
                $('.js-loading-icon').addClass('hide');
                $('.js-page-disable').addClass('hide');
                if (isShowLoading) {
                    $(loadingElement).addClass('hide');
                }
                if (isPageDisable) {
                    $(disableElement).addClass('hide');
                }
                loadingElement = '';
                isPageDisable = false;
                disableElement = '';
                self.ajaxStop();

                isShowLoading = false;
            });
            $(window).off('load.loading').on('load.loading', function () {
                $('.js-loading-icon').addClass('hide');
                $('.js-page-disable').addClass('hide');
                if (isShowLoading) {
                    $(loadingElement).addClass('hide');
                }
                if (isPageDisable) {
                    $(disableElement).addClass('hide');
                }
                self.ajaxStop();
                if ($.active) {
                    self.ajaxStart();
                }
                loadingElement = '';
                isPageDisable = false;
                isShowLoading = false;
                disableElement = '';
            });
        },
        showSpinner: function() {
            $('.js-new-spinner').removeClass('hide');
        },
        hideSpinner: function() {
            $('.js-new-spinner').addClass('hide');
        },
        ajax: function (options) {
            var deferred, success_callback, error_callback;

            if (options) {
                if (options.success) {
                    success_callback = options.success;
                    options.success = null;
                }
                if (options.error) {
                    error_callback = options.error;
                    options.error = null;
                }
                if (!options.dataType) {
                    options.dataType = 'json'; //default to json response
                }
                isShowLoading = options.isShowLoading || false;
                if (isShowLoading) {
                    loadingElement = options.loadingElement || '#loading-icon';
                }
                isPageDisable = options.isPageDisable || false;
                if (isPageDisable) {
                    disableElement = options.disableElement || '#page-disable';
                }

                if (options.base64) {
                    options.contentType = 'text/plain';
                    options.data = b64EncodeUnicode(options.data);
                }

                if ($.active) {
                    this.ajaxStart();
                }
            }

            deferred = $.Deferred();

            options.success = function (data, status, jqXHR) {
                //TODO: some processing, check for error codes etc...
                //if everything looks good, resolve the deferred object
                //otherwise, reject the deferred with appropriate error

                if (success_callback) {
                    success_callback(data, status, jqXHR);
                }
                deferred.resolve(data);
            };
            options.error = function (jqXHR, status, error) {
                //TODO: in case of error, reject the deferred with
                //appropriate error object.
                if (error_callback) {
                    error_callback(jqXHR, status, error);
                }
                deferred.reject({
                    'error': error
                });
            };

            if (window.isApp && window.isApp() && options.url.charAt(0) === '/') {
                options.url = WEBROOT_URL + options.url.slice(1);
            }
            if (options.useCDN) {
                var expirationAge = options.cdnExpirationAge || 'daily';
                // Delayed loading to avoid circular dependency (cdn_cache -> common/utils/user -> common/utils/utils)
                require(['cache/cdn_cache'], function(CDNCache) {
                    var cdnCache = new CDNCache(options);
                    if (options.cdnCacheUserInfo) {
                        cdnCache.cacheUserInfo(true);
                        cdnCache.useSecureCookies(true);
                    }
                    cdnCache.setExpirationAge(expirationAge).fetch();
                });
            } else {
                $.ajax(options);
            }

            return deferred.promise();
        },
        deferredFunction: _df,
        getApiUrl: function (url, secure) {
            return (secure ? 'https://' + (window.apihost || window.location.host) + '/' : WEBROOT_URL) + API_PREFIX + url;
        },
        decodeURI : function(url){
            var decodeCharMap = {
                '%24' : '$',
                '%26' : '&',
                '%2B' : '+',
                '%2C' : ',',
                '%3A' : ':',
                '%3B' : ';',
                '%3D' : '=',
                '%3F' : '?',
                '%40' : '@'
            };
            Object.keys(decodeCharMap).forEach(function(val){
                url = url.replace( new RegExp(val,'g'),decodeCharMap[val]);
            });
            return url;
        },
        encodeHTML : function(str){
            if (typeof str === 'string') {
                str = str.replace(/&/g, '&amp;');
                str = str.replace(/</g, '&lt;');
                str = str.replace(/>/g, '&gt;');
            }
            return str;
        },
        decodeHTML : function(str){
            str = str.replace(/&amp;/g, '&');
            str = str.replace(/&lt;/g, '<');
            str = str.replace(/&gt;/g, '>');

            return str;
        },
        gup : function(name, url){
            var regexS;
            if(name === 'ep'){
                regexS = '[\\?&]'+name+'=([^]*)';
            }else{
                regexS = '[\\?&]'+name+'=([^?&]*)';
            }

            var regex = new RegExp( regexS );
            var tmpURL = (url === undefined) ? window.location.href : url;
            var results = regex.exec( tmpURL );
            if( results == null ){
                return '';
            } else{
                return decodeURIComponent(results[1].replace(/\+/g, ' '));
            }

        },
        getCollectionData :function(path){
            var  _collectionData = {
                collectionHandle : this.gup('collectionHandle', path),
                collectionCreatorID:this.gup('collectionCreatorID', path),
                conceptCollectionHandle:this.gup('conceptCollectionHandle', path)
            };
            if(_collectionData.collectionHandle === '' && _collectionData.conceptCollectionHandle){
                _collectionData.collectionHandle = _collectionData.conceptCollectionHandle.split('::')[0].substr(0,_collectionData.conceptCollectionHandle.split('::')[0].length-1);
            }
            return _collectionData;
        },
        ck12ajax: _df(function (_d, ajax_options) { //TODO: move this to common
            var _ = require('underscore');
            exports.ajax(ajax_options).done(function (data) {
                if (data && data.response) {
                    if (data.response.message) {
                        _d.reject(_.extend({
                            'errorType': 'APIError'
                        }, data));
                    } else {
                        _d.resolve(data);
                    }
                }
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e,
                    'errorType': 'HTTPError'
                });
            });
        }),
        validateForSpecialCharacters: function (artifactTitle) {
            var pattern = /^[\*|\&|\-|\?|\\|\#|%]+$/g;
            return pattern.test(artifactTitle);
        },
        validateResourceTitle: function (artifactTitle, type, txt_box_name) {
            var msg = null;
            artifactTitle = (artifactTitle || '').trim();
            txt_box_name = txt_box_name || $('#txt_artifacttitle');

            if (artifactTitle === '') {
                msg = type === 'concept' ? 'Concept title cannot be blank.' : 'Book title cannot be blank';
            } else if (artifactTitle.toLowerCase() === 'untitled concept' && type === 'concept') {
                msg = 'Concept title cannot be Untitled Concept.';
            } else if (artifactTitle.toLowerCase() === 'untitled flexbook' && type === 'artifact') {
                msg = 'Book title cannot be Untitled Flexbook&#174; textbook.';
            } else if (artifactTitle.toLowerCase() === 'untitled modality' && type === 'concept') {
                msg = 'Modality title cannot be Untitled Modality.';
            } else if (artifactTitle.toLowerCase().indexOf('/') !== -1) {
                msg = 'Slash ( / ) is not a valid character in title.';
            } else if (this.validateForSpecialCharacters(artifactTitle)) {
                msg = 'Special characters like #,%,*,-,?,\\ are not allowed in the title field.';
            }
            if (msg) {
                var ModalView = require('common/views/modal.view');
                ModalView.validateAlert(msg, txt_box_name);
                return false;
            }
            return true;
        },
        poll: function poll(fn, callback, errback, timeout, interval) {
            var endTime = Number(new Date()) + (timeout || 2000);
            interval = interval || 100;

            (function p() {
                if(fn()) {
                    callback();
                }
                else if (Number(new Date()) < endTime) {
                    setTimeout(p, interval);
                }
                else {
                    errback(new Error('timed out for ' + fn + ': ' + arguments));
                }
            })();
        },
        // Gets the value at path of object. If not resolved returns undefined
        get: function (obj, path) {
            return path.split('.').reduce(function (o, x) {
                return (typeof o === 'undefined' || o === null) ? o : o[x];
            }, obj);
        },
        // Gets the branch name from Encoded ID
        getBranchName: function(encodedID) {
            // extract first 7 characters
            encodedID = encodedID.slice(0,7).toUpperCase();
            return BRANCH_NAMES_DATA[encodedID];
        },
        slugify: slugify,
        toTitleCase: toTitleCase,
        getQueryParam: getQueryParam,
        deepLookup: deepLookup,
        optimizelyStateToDexterString:optimizelyStateToDexterString,
        getLocation : getLocation,
        b64EncodeUnicode: b64EncodeUnicode
    };
    exports.showLoadingIcon();
    return exports;
});
