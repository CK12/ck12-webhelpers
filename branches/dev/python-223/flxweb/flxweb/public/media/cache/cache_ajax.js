//define(['jquery'], function($) {
/**
 * SmartCache uses sqlite to cache with regions and namespaces.
 * Will fall back to local storage if sqlite plugin is not available.
 * If a namespace is not provided, 'default' will be used.
 * If a region is not provided, but ttl is, the region is set to 'none'.
 * If neither region nor ttl are provided, the ttl will be set to 24 hours and region to 'default'.
 * If cacheSpace is not provided, localStorage will be used
 * If encrypt is not provided, it will default to false
 * If encryptKey is not provided, default key will be used
 * If decryption fails, it will be treated as "data does not exist"
 ***********************************************************************
 ***********************************************************************
 * To access the cache directly, use the SmartCache object.
 * eg
 * var smartcache = new SmartCache();
 * the following operations are permittied :store, fetch, remove, clear_region, clear_namespace
 ***********************************************************************
 * store(cacheKey, cacheData, opts)
 * where opts =
 * {'ttl':int minutes, 'region':str, 'namespace':str, 'cachesuccess':function(data), 'cachefailure':function(error), 'cacheSpace':str, 'encrypt':boolean}
 ***********************************************************************
 * fetch(cacheKey, opts)
 * where opts =
 * {'region':str, 'namespace':str, 'cachesuccess':function(data), 'cachefailure':function(error), 'cacheSpace':str, 'encrypt':boolean}
 ***********************************************************************
 * remove(cacheKey, cacheData, opts)
 * where opts =
 * {'region':str, 'namespace':str, 'cachesuccess':function(data), 'cachefailure':function(error), 'cacheSpace':str}
 ***********************************************************************
 * clear_region(region,namespace,opts)
 * where opts =
 * {'cachesuccess':function(data), 'cachefailure':function(error), 'cacheSpace':str}
 ***********************************************************************
 * clear_namespace(namespace,opts)
 * where opts =
 * {'cachesuccess':function(data), 'cachefailure':function(error), 'cacheSpace':str}
 ***********************************************************************
 * eg
 *
 * var c = new SmartCache()
 * c.store('k1','d1');
 * c.fetch('k1');
 * c.remove('k1');
 **/
 /* global CryptoJS */
window.SmartCache = function () {
    'use strict';

    this.encrypt = CryptoJS.AES.encrypt;
    this.decrypt = CryptoJS.AES.decrypt;
    this.formatter = CryptoJS.enc.Utf8;
    this.dbName = 'ck12_practice';
    this.dbconn = null;
    this.localstore = false;
    this.cache_regions = {
        'daily': (24 * 60),
        'weekly': (7 * 24 * 60),
        'biweekly': (2 * 7 * 24 * 60),
        'monthly': (30 * 24 * 60)
    };

    if (window.sqlitePlugin && window.sqlitePlugin.openDatabase) {
        this.dbconn = window.sqlitePlugin.openDatabase({
            name: this.dbName,
            location: 2
        });
        this.dbconn.executeSql('CREATE TABLE IF NOT EXISTS smart_cache (namespace text, cacheKey text, data text, expires real, region text, PRIMARY KEY (namespace, cacheKey) )');
    } else {
        var mod = 'teststr';
        try {
            window.localStorage.setItem(mod, true);
            this.localstore = window.localStorage.getItem(mod);
            window.localStorage.removeItem(mod);
        } catch (e) {
            this.localstore = false;
        }
    }
};

window.SmartCache.prototype.getEncryptKey = function () {
    'use strict';

    try {
        // try to get auth cookie for encrypt Key
        return document.cookie.split('auth=')[1].split(';')[0];
    } catch (ee) {
        // if auth cookie not present, use a randomly generated key
        return 'SeSxTXI6l8XyDW84BX65eyDUEFup7UJv';
    }
};

window.SmartCache.prototype.store = function (cacheKey, cacheData, opts) {
    'use strict';

    opts = this.cleanOpts(opts);

    var expires,
        successCallback = opts.cachesuccess,
        failureCallback = opts.cachefailure,
        ttl = opts.ttl,
        region = opts.region,
        namespace = opts.namespace,
        cacheSpace = opts.cacheSpace || 'local',
        encrypt = opts.encrypt || false,
        encryptKey = opts.encryptKey;

    try {

        if (this.dbconn) {
            this.dbconn.executeSql('CREATE TABLE IF NOT EXISTS smart_cache (namespace text, cacheKey text, data text, expires real, region text, PRIMARY KEY (namespace, cacheKey) )');
            this.dbconn.transaction(function (tx) {
                tx.executeSql('delete from smart_cache where cacheKey = ? and namespace = ?', [cacheKey, namespace]);
                expires = (+new Date()) + ttl;
                tx.executeSql('insert into smart_cache (namespace, cacheKey, data, expires, region) VALUES (?,?,?,?,?)', [namespace, cacheKey, cacheData, expires, region]);
            }, function (tx, err) {
                console.log('Error storing: ');
                console.log(tx);
                console.log(err);
                if (failureCallback && failureCallback instanceof Function) {
                    failureCallback(err);
                }
            }, function () {
                if (successCallback && successCallback instanceof Function) {
                    successCallback();
                }
            });
        } else if (this.localstore) {
            expires = (+new Date()) + ttl;
            if (encrypt) {
                cacheData = this.encrypt(cacheData, (encryptKey || this.getEncryptKey()));
            }
            if ('session' === cacheSpace) {
                window.sessionStorage.setItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::DATA', cacheData);
                window.sessionStorage.setItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::EXPIRES', expires);
            } else {
                window.localStorage.setItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::DATA', cacheData);
                window.localStorage.setItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::EXPIRES', expires);
            }
            if (successCallback && successCallback instanceof Function) {
                successCallback();
            }
        } else if (failureCallback && failureCallback instanceof Function) {
            failureCallback();
        }
    } catch (e) {
        console.log(e);
        if (failureCallback && failureCallback instanceof Function) {
            failureCallback(e);
        }
    }
};
window.SmartCache.prototype.remove = function (cacheKey, opts) {
    'use strict';

    var cacheValues, key,
        successCallback = opts.cachesuccess,
        failureCallback = opts.cachefailure,
        namespace = opts.namespace,
        cacheSpace = opts.cacheSpace || 'local',
        region  = opts.region;

    try {
        opts = this.cleanOpts(opts);

        if (this.dbconn) {
            this.dbconn.transaction(function (tx) {
                tx.executeSql('delete from smart_cache where cacheKey = ? and namespace = ?', [cacheKey, namespace]);
            }, function (tx, err) {
                console.log('Error deleting: ');
                console.log(tx);
                console.log(err);
                if (failureCallback && failureCallback instanceof Function) {
                    failureCallback(err);
                }
            }, function () {
                if (successCallback && successCallback instanceof Function) {
                    successCallback();
                }
            });
        } else if (this.localstore) {
            if ('session' === cacheSpace) {
                cacheValues = window.sessionStorage;
            } else {
                cacheValues = window.localStorage;
            }

            for (key in cacheValues) {
                if (cacheValues.hasOwnProperty(key)) {
                    if (key.match('^SC::' + namespace + '::'+ region+'::' + cacheKey + '::(EXPIRES|DATA)$') ||
                        ( key === 'SC::' + namespace + '::'+ region+'::' + cacheKey + '::EXPIRES') ||
                        ( key === 'SC::' + namespace + '::'+ region+'::' + cacheKey + '::DATA') ) {
                        if ('session' === cacheSpace) {
                            window.sessionStorage.removeItem(key);
                        } else {
                            window.localStorage.removeItem(key);
                        }
                    }
                }
            }
            if (successCallback && successCallback instanceof Function) {
                successCallback();
            }
        } else if (failureCallback && failureCallback instanceof Function) {
            failureCallback();
        }
    } catch (e) {
        console.log(e);
        if (failureCallback && failureCallback instanceof Function) {
            failureCallback(e);
        }
    }
};
window.SmartCache.prototype.fetch = function (cacheKey, opts) {
    'use strict';

    opts = this.cleanOpts(opts);

    var expiry, cachedata,
        successCallback = opts.cachesuccess,
        failureCallback = opts.cachefailure,
        region = opts.region,
        namespace = opts.namespace,
        cacheSpace = opts.cacheSpace || 'local',
        encrypt = opts.encrypt || false,
        encryptKey = opts.encryptKey,
        rightnow = +new Date(),
        err = 'Could not fetch value for key:' + cacheKey;

    try {

        if (this.dbconn) {
            this.dbconn.transaction(function (tx) {
                tx.executeSql('select * from smart_cache where cacheKey = ? and namespace = ? and expires > ?', [cacheKey, namespace, rightnow],
                    function (tx, rs) {
                        if (rs.rows.length > 0) {
                            console.log('Found in localstore cache:');
                            console.log(rs.rows.item(0));
                            if (successCallback) {
                                successCallback(rs.rows.item(0).data);
                            }
                            return;
                        }
                        if (failureCallback && failureCallback instanceof Function) {
                            failureCallback();
                        }
                        return;
                    },
                    function (tx, err) {
                        console.log('Error fetching: ');
                        console.log(tx);
                        console.log(err);
                        if (failureCallback && failureCallback instanceof Function) {
                            failureCallback(err);
                        }
                    });
            }, function (tx, err) {
                console.log('Error in transaction while fetching:');
                console.log(tx);
                console.log(err);
                if (failureCallback && failureCallback instanceof Function) {
                    failureCallback(err);
                }
            }, function () {
                //do nothing success callback should have fired when row was found
            });
        } else if (this.localstore) {
            if ('session' === cacheSpace) {
                expiry = parseInt(window.sessionStorage.getItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::EXPIRES'), 10);
            } else {
                expiry = parseInt(window.localStorage.getItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::EXPIRES'), 10);
            }
            if ((+new Date()) < expiry) {
                if ('session' === cacheSpace) {
                    cachedata = window.sessionStorage.getItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::DATA');
                } else {
                    cachedata = window.localStorage.getItem('SC::' + namespace + '::' + region + '::' + cacheKey + '::DATA');
                }
                if (cachedata) {
                    try {
                        // nested try added ONLY to check whether data is decryptable or not
                        if (encrypt) {
                            cachedata = this.decrypt(cachedata, (encryptKey || this.getEncryptKey())).toString(this.formatter);
                        }
                    } catch (ee) {
                        console.log(ee);
                        if (failureCallback && failureCallback instanceof Function) {
                            failureCallback(err);
                        }
                        return;
                    }
                    if (successCallback && successCallback instanceof Function) {
                        successCallback(cachedata);
                    }
                    return;
                }
                if (failureCallback && failureCallback instanceof Function) {
                    failureCallback(err);
                }
            } else if (failureCallback && failureCallback instanceof Function) {
                failureCallback(err);
            }
        } else if (failureCallback && failureCallback instanceof Function) {
            failureCallback(err);
        }
        return;
    } catch (e) {
        console.log(e);
        if (failureCallback && failureCallback instanceof Function) {
            failureCallback(e);
        }
        return;
    }
};

window.SmartCache.prototype.clear_region = function (region, namespace, opts) {
    'use strict';

    opts = this.cleanOpts(opts);

    var cacheSize, keyi, regX, i,
        successCallback = opts.cachesuccess,
        failureCallback = opts.cachefailure,
        cacheSpace = opts.cacheSpace || 'local';

    try {

        if (this.dbconn) {
            this.dbconn.transaction(
                function (tx) {
                    if (namespace) {
                        tx.executeSql('delete from smart_cache where region = ? and namespace = ?', [region, namespace]);
                    } else {
                        tx.executeSql('delete from smart_cache where region = ?', [region]);
                    }
                },
                function (tx, err) {
                    console.log('Error deleting region: ');
                    console.log(tx);
                    console.log(err);
                    if (failureCallback && failureCallback instanceof Function) {
                        failureCallback(err);
                    }
                },
                function () {
                    if (successCallback && successCallback instanceof Function) {
                        successCallback();
                    }
                }
            );
        } else if (this.localstore) {
            if ('session' === cacheSpace) {
                cacheSize = window.sessionStorage.length;
            } else {
                cacheSize = window.localStorage.length;
            }
            for (i = 0; i < cacheSize; ++i) {
                if ('session' === cacheSpace) {
                    keyi = window.sessionStorage.key(i);
                } else {
                    keyi = window.localStorage.key(i);
                }
                regX = '^SC::' + (namespace || '.*') + '::' + region + '::';
                if (keyi.match(regX)) {
                    console.log('removing item:' + keyi);
                    if ('session' === cacheSpace) {
                        window.sessionStorage.removeItem(keyi);
                    } else {
                        window.localStorage.removeItem(keyi);
                    }
                }
            }
            if (successCallback && successCallback instanceof Function) {
                successCallback();
            }
        } else if (failureCallback && failureCallback instanceof Function) {
            failureCallback();
        }
    } catch (e) {
        console.log(e);
        if (failureCallback && failureCallback instanceof Function) {
            failureCallback(e);
        }
    }
};

window.SmartCache.prototype.clear_namespace = function (namespace, opts) {
    'use strict';

    opts = this.cleanOpts(opts);

    var cacheSize, keyi, i, regX,
        successCallback = opts.cachesuccess,
        failureCallback = opts.cachefailure,
        cacheSpace = opts.cacheSpace || 'local';

    try {

        if (this.dbconn) {
            this.dbconn.transaction(
                function (tx) {
                    tx.executeSql('delete from smart_cache where namespace = ?', [namespace]);
                },
                function (tx, err) {
                    console.log('Error deleting namespace: ');
                    console.log(tx);
                    console.log(err);
                    if (failureCallback && failureCallback instanceof Function) {
                        failureCallback(err);
                    }
                },
                function () {
                    if (successCallback && successCallback instanceof Function) {
                        successCallback();
                    }
                }
            );
        } else if (this.localstore) {
            if ('session' === cacheSpace) {
                cacheSize = window.sessionStorage.length;
            } else {
                cacheSize = window.localStorage.length;
            }
            for (i = 0; i < cacheSize; ++i) {
                if ('session' === cacheSpace) {
                    keyi = window.sessionStorage.key(i);
                } else {
                    keyi = window.localStorage.key(i);
                }
                regX = '^SC::' + namespace + '::';

                if (keyi.match(regX)) {
                    console.log('removing item:' + keyi);
                    if ('session' === cacheSpace) {
                        window.sessionStorage.removeItem(keyi);
                    } else {
                        window.localStorage.removeItem(keyi);
                    }
                }
            }
            if (successCallback && successCallback instanceof Function) {
                successCallback();
            }
        } else if (failureCallback && failureCallback instanceof Function) {
            failureCallback();
        }
    } catch (e) {
        console.log(e);
        if (failureCallback && failureCallback instanceof Function) {
            failureCallback(e);
        }
    }
};

window.SmartCache.prototype.cleanOpts = function (opts) {
    'use strict';

    opts = opts || {};
    opts.region = opts.region || 'none';

    if (this.cache_regions.hasOwnProperty(opts.region) && !isNaN(parseInt(this.cache_regions[opts.region], 10))) {
        // set ttl from regions
        opts.ttl = parseInt(this.cache_regions[opts.region], 10);
    } else {
        if (opts.hasOwnProperty('ttl') && !isNaN(parseInt(opts.ttl, 10))) {
            // use custom ttl
            opts.ttl = parseInt(opts.ttl, 10);
        } else {
            // set default to 24 hours
            opts.ttl = 24 * 60;
            // if the region was previously set to none, change it to default since
            opts.region = opts.region === 'none' ? 'default' : opts.region;
        }
    }

    opts.ttl = opts.ttl * 1000 * 60; //convert to milliseconds

    opts.namespace = opts.namespace || 'default';
    var alphanumericexp = /^[0-9a-z_\.]+$/i;
    if (!opts.region.match(alphanumericexp)) {
        throw 'Invalid region name, must be alphanumeric(allows _ and .)';
    }
    if (!opts.namespace.match(alphanumericexp)) {
        throw 'Invalid namespace, must be alphanumeric(allows _ and .)';
    }

    return opts;
};
//});
