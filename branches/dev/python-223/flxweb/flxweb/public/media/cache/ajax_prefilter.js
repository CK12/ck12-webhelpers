/**
 * cache_ajax should be included on all pages that need to write/access the cache
 *
 * To cache a request you must use the option 'localCache'
 *
 * localCache = {} optional list of settings to be used for caching this ajax call
 *   localCache.key defines the key to be used for the request data.
 *   localCache.namespace defines the namespace for this cache entry
 *   localCache.ttl defines ttl in minutes; will be overridden by region.
 *   localCache.cacheSpace defines whether localStorage or sessionStorage should be used to store data
 *   localCache.encrypt defines whether data is to be encrypted before storing/ decrypted before fetching
 *   localCache.encryptKey the key to be used for encrypting/decrypting the information
 *   localCache.region defines the region to be used for this entry.
 *       'daily': sets a ttl of 1 day ,'weekly': 7 day ttl, 'biweekly': 14 day ttl, 'monthly':30 days ttl.
 *   localCache.validatedata function(data).
 *       This function is called to validate data from the cache and from ajax response.
 *       When validating data from the cache, failure (localCache.validatedata returned false) will force an ajax call.
 *       When validating data from ajax, failure will prevent caching this value.
 * eg:
 * $.ajax('http://astro.ck12.org/assessment/api/get/info/tasks', {
 *     localCache: {
 *         region: 'weekly',
 *         validatedata: function (dat) {
 *             try {
 *                 return (dat.responseHeader.status == 0)
 *             } catch (e) {
 *                 console.log(e);
 *                 return false;
 *             }
 *         }
 *     }
 * });
 **/
(function ($) {
    'use strict';
    if(!window.smartcacheFetchedHash){
        window.smartcacheFetchedHash = {};
    }
    document.addEventListener('deviceready', function () {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            if (options.type.toUpperCase() !== 'GET') {
                return;
            }
            if (!options.localCache) {
                return;
            }
            if (options.bypassCachedb) {
                return;
            }
            options.cache = false;
            window.smartcache_instance = window.smartcache_instance || new window.SmartCache();

            var cacheSpace, cachettl, cacheKey, cachenamespace, cacheregion, encrypt, encryptKey,
                smartcache = window.smartcache_instance,
                _dataType = options.dataType || '';

            // Cache it ?
            if (smartcache.dbconn || smartcache.localstore) {
                if (typeof (options.localCache) === 'object') {
                    if (options.localCache.key) {
                        cacheKey = options.localCache.key;
                    } else {
                        cacheKey = options.url.replace(/jQuery.*/, '') + options.type + (options.data || '');
                    }
                    if (options.localCache.namespace) {
                        cachenamespace = options.localCache.namespace;
                    }
                    if (options.localCache.region) {
                        cacheregion = options.localCache.region;
                    }
                    if (options.localCache.ttl) {
                        cachettl = options.localCache.ttl;
                    }
                    if (options.localCache.cacheSpace) {
                        cacheSpace = options.localCache.cacheSpace;
                    }
                    if (options.localCache.encryptKey) {
                        encryptKey = options.localCache.encryptKey;
                    }
                    encrypt = options.localCache.encrypt || false;
                } else {
                    cachettl = options.cacheTTL || (24 * 60);
                    cacheKey = options.cacheKey ||
                        options.url.replace(/jQuery.*/, '') + options.type + (options.data || '');
                }
                if(originalOptions.forceToCall){
                    callAPI();
                }
                else{
                    if(!smartcacheFetchedHash[cacheKey]){
                        var dfd = $.Deferred();
                        smartcacheFetchedHash[cacheKey] = dfd;
                        fetchData();
                    }else{
                        smartcacheFetchedHash[cacheKey].promise().done(function(){
                            fetchData();
                        });
                    }
                }
                jqXHR.abort();

            }
            function fetchData(){
                smartcache.fetch(cacheKey, {
                    'cachesuccess': function (value) {
                        if (_dataType && _dataType.indexOf('json') > -1) {
                            value = JSON.parse(value);
                        }
                        if (options.localCache.validatedata && !options.localCache.validatedata(value, 'cache')) {
                            smartcache.remove(cacheKey, {
                                'region': cacheregion,
                                'namespace': cachenamespace,
                                'ttl': cachettl
                            });
                            throw 'Found value but validatedata failed.';
                        }
                        if (options.success) {
                            options.success(value);
                        }
                        window.smartcacheFetchedHash[cacheKey].resolve();
                    },
                    'cachefailure': function () {
                        callAPI();
                    },
                    'region': cacheregion,
                    'namespace': cachenamespace,
                    'ttl': cachettl,
                    'cacheSpace': cacheSpace,
                    'encryptKey': encryptKey,
                    'encrypt': encrypt
                });
            }
            function callAPI(){
                if (options.success) {
                    options.realsuccess = options.success;
                }

                options.success =
                    function (_data, _status, _jqXHR) {
                        var strdata = _data;
                        if (options.localCache.validatedata && !options.localCache.validatedata(_data)) {
                            if (options.realsuccess && options.realsuccess instanceof Function) {
                                options.realsuccess(_data, _status, _jqXHR);
                            }
                        } else {
                            if (_dataType && _dataType.indexOf('json') > -1) {
                                try {
                                    strdata = JSON.stringify(_data);
                                } catch (e) {
                                    strdata = _data.toString();
                                }
                            }
                            smartcache.store(cacheKey, strdata, {
                                'region': cacheregion,
                                'namespace': cachenamespace,
                                'cacheSpace': cacheSpace,
                                'encrypt': encrypt,
                                'encryptKey': encryptKey,
                                'ttl': cachettl,
                                'cachesuccess': function () {
                                    if (options.realsuccess && options.realsuccess instanceof Function) {
                                        options.realsuccess(_data, _status, _jqXHR);
                                        window.smartcacheFetchedHash[cacheKey].resolve();
                                    }
                                },
                                'cachefailure': function () {
                                    console.log('unable to cache');
                                    if (options.realsuccess && options.realsuccess instanceof Function) {
                                        options.realsuccess(_data, _status, _jqXHR);
                                    }
                                    window.smartcacheFetchedHash[cacheKey].reject();
                                }
                            });
                        }
                    };
                options.bypassCachedb = true;
                $.ajax(options);
            }
        });
    }, false);

    $(document).ready(function () {
        $('body').ready(function () {
            if (!((window.isApp && window.isApp()) || (window.assessment_configs && window.assessment_configs.isApp && window.assessment_configs.isApp()))) {
                window.setTimeout(function () {
                    var e = document.createEvent('Events');
                    e.initEvent('deviceready', true, true);
                    document.dispatchEvent(e);
                }, 50);
            }
        });
    });
}(window.jQuery));
