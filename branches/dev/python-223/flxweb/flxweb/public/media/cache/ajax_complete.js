'use strict';


(function ($) {

    document.addEventListener('deviceready', function () {
        $(document).ajaxComplete(function (event, jqXHR, settings) {

            if (!settings.updateCache) {
                return;
            }

            window.smartcache_instance = window.smartcache_instance || new window.SmartCache();

            var cacheSpace, cacheKey, cachenamespace, cacheregion,
                smartcache = window.smartcache_instance;

            if (smartcache.dbconn || smartcache.localstore) {
                if (typeof (settings.updateCache) === 'object') {
                    if (settings.updateCache.key) {
                        cacheKey = settings.updateCache.key;
                        cacheKey = cacheKey.replace(/jQuery.*/, '') + ( settings.updateCache.method || 'GET' )+ (settings.updateCache.data || '');
                    } else {
                        return;
                    }
                    if (settings.updateCache.namespace) {
                        cachenamespace = settings.updateCache.namespace;
                    }
                    if (settings.updateCache.region) {
                        cacheregion = settings.updateCache.region;
                    }
                    if (settings.updateCache.cacheSpace) {
                        cacheSpace = settings.updateCache.cacheSpace;
                    }

                } else {
                    cacheKey = settings.cacheKey ||
                        settings.url.replace(/jQuery.*/, '') + settings.type;
                }
                smartcache.remove(cacheKey, {
                    'cachesuccess': function () {
                        console.log('removal from localstorage success');
                    },
                    'cachefailure': function () {
                        console.log('removal from localstorage failure');
                    },
                    'region': cacheregion,
                    'namespace': cachenamespace,
                    'cacheSpace': cacheSpace
                });
            }
        });

    }, false);
}(window.jQuery));
