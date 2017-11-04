(function( global, factory ) {
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = global.document ?
            factory( global, true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( "dexterjs requires a window with a document" );
                }
                return factory( w );
            };
    } else {
        factory( global );
    }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
var isPlainObject = function(object) {
        // not object, not dom el, not window
        if (typeof object !== "object" || object.nodeType || (object !== null && object === object.window)) {
            return false;
        }   
        if (object.constructor && !object.hasOwnProperty.call(object.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
        return true;
    };


var isArray = Array.isArray;



    // adapted from jquery's extend method
    var extend = function extend () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            // skip the boolean and the target
            target = arguments[ i ] || {};
            i++;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object") {
            target = {};
        }

        /* jshint ignore:start */
        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];

                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = extend( deep, clone, copy );

                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
        /* jshint ignore:end */

        // Return the modified object
        return target;
    };
var default_configuration = {
        // TODO: configurable callbacks for onload, onunload, and logEvent

        // mixins are automatically added to the payload parameter of the request body
        mixins: {
            timestamp: null,
            hash: null,
            pageViewData: null,
            resWidth : screen.width,
            resHeight : screen.height,
            device : (window.device) ? window.device.name : '',
            url_referrer : document.referrer,
            page_url: (window.location)?(window.location.href): ''
        },
        // clientID is a mixin, but it is not included in the 'payload' parameter of the request body
        clientID: null,


        // NON-MIXIN CONFIG
        // These details are used for both cookie as well as localStorage
        // NOTE: cookies' 'expire' was deprecated and replaced by
        // max-age, which specifies the seconds before a cookie is nom-nom'd.
        clientStorage: {
            session: {
                name        : 'dexterjsSessionID',
                value       : null,
                domain      : '.ck12.org',
                path        : '/',
                'max-age'   : (60 * 30 ), // units are in seconds
                secure      : false
            },
            visitor: {
                name        : 'dexterjsVisitorID',
                value       : null,
                domain      : '.ck12.org',
                path        : '/',
                'max-age'   : (180 * 24 * 60 * 60 ), // units are in seconds !!!
                secure      : false
            }
        },

        events: {
            timeSpent: 'FBS_TIMESPENT'
        },


        apis: {
            recordEvent: (document.location.protocol+'//'+document.location.host+'/dexter/record/event'),
            recordEventBulk: (document.location.protocol+'//'+document.location.host+'/dexter/record/event/bulk'),
            recordEventBulkZip: (document.location.protocol+'//'+document.location.host+'/dexter/record/event/bulk/zip')
        },

        requireUserSignIn: true,

        noQueue: false,

        trackPageTime: true,

        trackScreenResolution: true,

        trackReferrer : true,

        // DEXTER QUEUE CONFIG
        dexterQueueName: 'dexter',

        // automatically call ajax after each queue push
        dexterQueueAutoFlush: false,

        //Declarative instrumentation plugin
        declarativePlugin: {
            'enabled': true,               // enabled by default
            'defaultDomEvent': 'click',     // by default look for click events only
            'additionalDomEvents': '',      // all other types of dom event. For these element attribute domEvent needs to match
            'selector': '.dxtrack, .dxtrack-user-action',         // selector of the elements to instrument
            'dataPrefix': 'data-dx-'        // prefix for data attributes that include the payload
        },

        //Optimizely plugin
        optimizelyPlugin: {
            'enabled': true              // enabled by default
        }

    };

var cloneObject = function cloneObject(object) {
        try {
            var newObj = {};
            var key;
            for (key in object) if (object.hasOwnProperty(key)) {
                if (typeof object[key] === "object" && object[key] !== null) {
                    newObj[key] = cloneObject(object[key]);
                }
                else {
                    newObj[key] = object[key];
                }
            }
            return newObj;
        } catch(error) {
            console.log(error);
            throw new Error("Circular Objects Not Supported");
        }
    };



    /**
     * Initialize dexterjs, merge the config with the defaults.
     * @param - mixin for default_configuration.
     * @returns {function} - The constructor function
     */
    // TODO: refactor the data object creation process.
    var initialize = function(configuration) {
        /** @private */
        configuration = (typeof configuration === "object") ? configuration : {};

        // Done with cherrypicking and extending mixins

        // ==========================================================================================

        /** @constructor */
        var _init = function() {
            var config = extend(true, {}, default_configuration);
            // Can't just extend the default config... we have a 'mixins' property on the 
            // default_configuration. Let's cherrypick items from configuration and check if
            // they match a key in the default_configuration.mixins object. If there's a match, 
            // then extend the mixins -- not the entire object. 
            (function extendConfiguration() {
                var userMixins = null;
                var matchedMixins = [];
                var keyC, keyM;
                var foundMixins = {};
                var mixins = {};
                var len, i;

                // if user defined a mixins object already, then clone it.
                if (configuration.mixins) {
                    userMixins = cloneObject(configuration.mixins);    
                    //delete configuration.mixins;
                }
                // linear search O(n^2) ... 
                for (keyC in configuration) if (configuration.hasOwnProperty(keyC)) {
                    for (keyM in config.mixins) if (config.mixins.hasOwnProperty(keyM)) {
                        if (keyM === keyC) {
                            matchedMixins.push(keyM);
                            break;
                        }
                    }
                }
                for (i=0, len=matchedMixins.length; i<len; i++) {
                    foundMixins[matchedMixins[i]] = configuration[matchedMixins[i]];
                    //delete configuration[matchedMixins[i]];
                }
                extend(true, mixins, cloneObject(foundMixins));
                configuration.mixins = mixins;
                if (userMixins !== null) {
                    extend(true, configuration.mixins, userMixins); 
                }
                extend(true, config, configuration);
            })();
            // NOTE: This is the major data object that is protected by the get and set methods.
            /** @private */
            var data = {
                config:config,
                dexterjsPageStartTime:null
            };
            var buff;

            this.get = function(key) {
                var value = null;
                var result;
                if (key === undefined) {
                    // handy for development, but bad practice in general, 
                    // don't return the entire config object if the user doesn't pass a key.
                    //return extend(true, {}, data);
                    return null;
                } else {
                    buff = key.indexOf(":");
                    if (buff !== -1) {
                        value = data[key.substr(0, buff)][key.substr(buff+1)];
                    } else {
                        value = data[key];
                    }
                    // don't return object references
                    if (typeof value === "object") {
                        result = {};
                        dexterjs.extend(result, value);
                    } else {
                        result = value;
                    }
                    return value;
                }
            };
            // TODO: you can specify the key as "key1:key2" if you expect key1 to be an object.
            // But this should be abstracted so you can do "key1:key2:...:keyn"
            this.set = function(key, val, silent) {
                if (arguments.length === 0) { return undefined; }
                var extendKey = (typeof val === "object")
                val = extendKey ? cloneObject(val) : val;
                buff = key.indexOf(":");
                if (buff !== -1) {
                    data[key.substr(0, buff)][key.substr(buff+1)] = val;
                }
                else if (extendKey) {
                    extend(true, data[key], val);
                }
                else {
                    data[key] = val;
                }
                if (!silent){
                var configEvent = document.createEvent('Event');
                    configEvent.initEvent('dexterjsConfigChangedEvent', true, true);
                    configEvent.data = data;
                    document.dispatchEvent(configEvent);
                }
                return null;
            };
        };
        _init.prototype = dexterjs.prototype;
        return _init;
    };
var dexterQueue = function dexterQueue(global) {
        var dexter; // reserved for output of dexterjs
        var config; // reserved for dexter.get();
        var dexterQueueName = default_configuration.dexterQueueName;
        global = (global) ? global : (window || this);
        var queue = global[dexterQueueName] || [];

        // Terminal condition.. user defined object isn't an array
        if (!(queue instanceof Array)) {
            console.error(dexterQueueName+" isn't an array");
            return false;
        }
        // See if queue has a config object on it
        if (queue.hasOwnProperty("config")) {
            for (var c in queue.config) {
                dexterjs.set("config:"+c, queue.config[c]);
            }
            dexter = dexterjs(queue.config);
        }
        else {
            dexter = dexterjs();
        }
        // TESTS COMPLETE!

        extend(true, queue, dexter);

        config = dexter.get("config");

        queue.autoFlush = config.dexterQueueAutoFlush;
        
        /**
         * @method - push events onto the queue
         */
        queue.push = function() {
            Array.prototype.push.apply(this, arguments);
            if (this.autoFlush) {
                this.flush();
            }
        };

        /**
         * Clear queue, send all events to dexter backend
         * TODO: bulk upload
         */
        queue.flush = function() {
            var event;
            while (this.length) {
                event = this.pop();
                this.logEvent(event.eventName, event.payload);
            }
        };

        global[dexterQueueName] = queue;

        return queue;
    };


var getCookie = function getCookie(c_name) {
        var i, x, y, iCookie, pos, ARRcookies = document.cookie.split(';');
        var l = ARRcookies.length;
        for (i = 0; i < l; i++) {
            iCookie = ARRcookies[i];
            pos = iCookie.indexOf('=')
            x = iCookie.substr(0, pos);
            y = iCookie.substr(pos + 1);
            x = x.replace(/^\s+|\s+$/g, '');
            if (x === c_name) {
                // NOTE: the unescape function was deprecated in ECMA v3
                return decodeURIComponent(y);
            }
        }
        return null;
    };

var getRandomString = function getRandomString(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', value = '';
        for (var i = length; i > 0; --i) {
            value += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return value;
    };

var xmlhttp = function() {
        try {
            return new XMLHttpRequest();
        } catch (error) {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (error2) {
                return new ActiveXObject("Msxml2.XMLHTTP");
            }
        } 
    };

var buildParams = function buildParams( prefix, obj, add ) {
        var name;
        var rbracket = /\[\]$/;
        var buff = "";

        if ( isArray( obj ) ) {
            // DEPRECATED, instead of serializing the array elements the way jQuery does it, 
            // we will stringify each element and comma seperate the elements. Finally, we 
            // wrap the stringified elements with brackets and pass it as an argument to buildParams
            /* 
            // Serialize array item.
            obj.forEach(function(v, i) {
                if ( rbracket.test( prefix ) ) {
                    // Treat each array item as a scalar.
                    add( prefix, v );
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, add );
                }
            });
            */
            obj.forEach(function(el, idx, self) {
                buff += JSON.stringify(el);
                if (idx !== self.length-1) {
                    buff += ",";
                }
            });
            buildParams( prefix, "[" + buff + "]", add );

        } else if ( typeof obj === "object" ) {
            // Serialize object item.
            for ( name in obj ) {
                buildParams( prefix + "[" + name + "]", obj[ name ], add );
            }

        } else {
            // Serialize scalar item.
            add( prefix, obj );
        }
    };

var serialize = function serialize ( a ) {
        var r20 = /%20/g,
            prefix,
            s = [],
            add = function( key, value ) {
                /* jshint ignore:start */
                // If value is a function, invoke it and return its value
                value = (typeof value === "function") ? value() : ( value == null ? "" : value );
                s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
                //  double url encode a single quote; dexter backend throws errors on sending 
                //  single quotes and %27, so we encodeURLComponent the "%27" to obtain "%2527"
                s[ s.length - 1 ] = s[ s.length - 1 ].replace(/'/g, "%2527");
                /* jshint ignore:end */
            };

            // encode params recursively.
            for ( prefix in a ) {
                buildParams( prefix, a[ prefix ], add );
            }

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
    };

var post = function post(url, postData, config) {
        var xhr = xmlhttp();
        var buffer;
        var dummyF = function() { return null; };
        var DEFAULTS = {
            success:dummyF,
            error: dummyF,
            headers: { 
                // default form urlencoded type
                "Content-Type" : "application/x-www-form-urlencoded;charset=UTF-8"
            }
        };
        config = (config === undefined) ? { } : config;
        config = extend(true, DEFAULTS, config);

        xhr.open("POST", url);
        for (buffer in config.headers) {
            xhr.setRequestHeader(buffer, config.headers[buffer]);
        }

        // TODO: may need to handle special server codes in the future
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ( xhr.status === 200 || xhr.status === 304 ) {
                    config.success();
                } else {
                    config.error();
                }
            }
        };

        if (config.headers["Content-Type"] === "application/json") {
            xhr.send(JSON.stringify(postData));
        }
        else {
            xhr.send(serialize(postData));
        }
    };


var bakeCookie = function bakeCookie(ingreedients, cookieValue) {
        ingreedients = (typeof ingreedients === "string") ? {name:ingreedients} : ingreedients;
        if (!ingreedients) { throw new Error("Unknown Cookie!"); }
        var cookie = "";
        cookie += ingreedients.name + "=" + (ingreedients.value || cookieValue || getRandomString(25)) + ";";
        cookie += "domain="               + (ingreedients.domain || window.location.host)+ ";";
        cookie += "path="                 + (ingreedients.path || "/") + ";";
        cookie += "max-age="              + (ingreedients["max-age"] || "session")  + ";";
        if (ingreedients.secure) {
            cookie += "secure;";
        }
        return cookie;
    };

var idStorage = (function(){
            var config = default_configuration;
            var useCookies = (document.location.protocol.indexOf("http") !== -1) ? true : false;
            
            /** @private */
            function saveId(type,id) {
                if (useCookies){
                    document.cookie = bakeCookie(config.clientStorage[type], id);
                } else {
                    localStorage[config.clientStorage[type].name] = JSON.stringify({
                        "id" : id,
                        "expiry" : new Date().getTime() + config.clientStorage[type]["max-age"]*1000 
                    });
                }
            };

            /** @private */
            function getIdFromLocalStorage(key) {
                var currentTime = new Date().getTime();
                try {
                    var storedObj = JSON.parse(localStorage[key]);
                    if (storedObj && (storedObj.expiry > currentTime)){
                        return storedObj.id;
                    }
                } catch (e){
                    console.debug("Invalid JSON stored in localStorage");
                }
                
            };

            /** @private */
            function getId(type){
                var id;
                if (useCookies){
                    id = getCookie(config.clientStorage[type].name);
                } else {
                    id = getIdFromLocalStorage(config.clientStorage[type].name);
                }
                id = id || generateAndStoreId(type);
                return id;
            };

            /** @private */
            function generateAndStoreId(type){
                var id = getRandomString(25);
                saveId(type,id);
                return id;
            };

            function getVisitorId(){
                return getId("visitor");
            };

            function getSessionId(){
                return getId("session");
            };

            function updateIdExpiry(){
                    saveId("session",getSessionId());
                    saveId("visitor",getVisitorId());
            };

            return {
                "getVisitorId" : getVisitorId,
                "getSessionId" : getSessionId,
                "updateIdExpiry" : updateIdExpiry
            };
    })();
    


var cipher = {
        unhexlify: function(str) {
            var result = '';
            for (var i=0, l=str.length; i<l; i+=2) {
                result += String.fromCharCode(parseInt(str.substr(i, 2), 16));
            }
            return result;
        },
        hexlify: function(str) {
            var result = '';
            var padding = '00';
            for (var i=0, l=str.length; i<l; i++) {
                var digit = str.charCodeAt(i).toString(16);
                var padded = (padding+digit).slice(-2);
                result += padded;
            }
            return result;
        },
        rpad: function(str, pad, len) {
            if (str != null && typeof str === 'string') {
                while (str.length < len) {
                    str += pad;
                }
            }
            return str;
        },
        encode: function(key, clear) {
            var enc = [];
            var clear = this.rpad(String(clear), 'z', 20);
            for (var i = 0; i < clear.length; i++) {
                var key_c = key[i % key.length];
                var enc_c = String.fromCharCode((clear[i].charCodeAt(0) + key_c.charCodeAt(0)) % 256);
                enc.push(enc_c);
            }
            return enc.join("");
        },
        decode: function(key, enc) {
            var dec = [];
            for (var i = 0; i < enc.length; i++) {
                var key_c = key[i % key.length];
                var dec_c = String.fromCharCode((256 + enc[i].charCodeAt(0) - key_c.charCodeAt(0)) % 256);
                dec.push(dec_c);
            }
            return dec.join("").replace(/z+$/, '');
        }
    };

var logEvent = function logEvent(eventType, payload, callback) {
            var data        = this.get("config");
            var _mixins     = cloneObject(data.mixins);
            var paramData   = {};
            var apis        = data.apis;
            var param       = null;
            var bulkPayload = null;
            var clientID    = _mixins.clientID || data.clientID;
            var postConfig  = {};
            var buffer      = typeof callback;
            var cipherKey   = 'maytheforcebewithyouandwithyou';

            if ( buffer === "function" ) {
                postConfig.success = callback;
            } 
            else if ( buffer === "object" ) {
                extend(true, postConfig, callback);
            }

            // REQUIRED CONFIGURATIONS
            if (typeof eventType !== "string") {
                // special case: eventType is a list of events
                if (eventType instanceof Array) {
                    payload = eventType;
                }
                else { throw new Error("[dexterjs:error] eventType isn't a string"); }
            }
            else {
                payload = (payload === undefined) ? {} : payload;
            }
            if (!clientID) {
                throw new Error("Required clientID is missing.");
            }
            // TODO: DEPRECATE
            // Set guest memberID if memberID not available. Allow null override.
            if (payload.memberID) {
                // If payload has memberID set, use it. This has highest preference
                _mixins.memberID = payload.memberID;
            }
            if (_mixins.memberID == null || _mixins.memberID == 2 || _mixins.memberID == '2') {
                // Get the memberID from the cookie, if available
                // But if the payload has set it to a valid value already, we take that.
                var cookieName = (apis.recordEvent && apis.recordEvent.indexOf('www.ck12.org') !== -1) ? 'dxtr' : 'dxtr-test';
                // console.debug("API: " + apis.recordEvent + ", cookieName: " + cookieName);
                var memberIDVal = getCookie(cookieName);
                if (memberIDVal) {
                    _mixins.memberID = cipher.decode(cipherKey, cipher.unhexlify(memberIDVal));
                }
            }
            // client should set the memberID, this is just a fallback because
            // we may still have window.ads_userid in some places...
            if (_mixins.memberID == null || _mixins.memberID === '') {
                _mixins.memberID = window.ads_userid || data.memberID || 2;
            }
            try {
                var memberIDInt = parseInt(_mixins.memberID);
            } catch (error) {
                throw "INVALID MEMBER ID";
            }
            // ADD sessionID and visitorID to the _mixins object
            _mixins.sessionID = idStorage.getSessionId();
            _mixins.visitorID = idStorage.getVisitorId();
            // we'll be sending the _mixins object; extend it with user's payload.
            extend(true, _mixins, payload);
            _mixins.memberID = memberIDInt; // memberID should be an integer always
            // console.debug("memberID: " + _mixins.memberID);

            /* jshint ignore:start */ // Don't send null or undefined parameters
            for (param in _mixins) if (_mixins.hasOwnProperty(param) && _mixins[param] == null) {
                delete _mixins[param];
            }
            /* jshint ignore:end */

            // support for pageViewData, which should be either an object or function that returns an
            // object with relevant data about the page. If it's a function, then it will be executed, 
            // and the output will be passed to the server.
            // In either case (function/object) the _mixins are extended by the results.
            buffer = typeof _mixins.pageViewData;
            if (buffer === "function") {
                extend(true, _mixins, _mixins.pageViewData());
            } else if (buffer === "object") {
                console.debug("Consider adding these values directly to the mixins object.");
                extend(true, _mixins, _mixins.pageViewData);
            }

            // Support for bulk upload: 
            if ((payload instanceof Array)) {
                bulkPayload = {};
                bulkPayload.clientID = clientID;
                // format the list of events
                payload.forEach(function(event, idx, self) {
                    if (event.clientID) {
                        delete event.clientID;
                    }
                    if (event.eventType) {
                        event.eventType = event.eventType.toUpperCase();
                    }
                    else {
                        throw new Error("Bulk upload requires events to contain eventType parameter");
                    }
                });
                bulkPayload.events = payload;
                post(apis.recordEventBulk, bulkPayload, postConfig);
            }
            else {
                paramData.eventType = eventType.toUpperCase(); // SET EVENT NAME
                paramData.clientID  = clientID;
                paramData.payload   = JSON.stringify(_mixins);
                if (!payload.timestamp) {
                    payload.timestamp = new Date().toISOString();
                }
                post(apis.recordEvent, paramData, postConfig); // Call the ADS API to record the event.
            }
            return true;
        };


    
    var ajax = {
        logEvent:logEvent
    };

    /**
     * @constructor 
     * @param dexterjs - This is the user's instance of dexterjs.
     */
    function userEvents(dexterjs) {
        var _events = {
            logEvent: ajax.logEvent
        };
        return _events;
    }


    /** @private */
    function startPageTimer() {
        dexterjs.set("dexterjsPageStartTime", new Date().getTime()); 
    }

    /** @private */
    function dexterjsLogPageTime() {
        var dexterjsPageStartTime = dexterjs.get("dexterjsPageStartTime");
        var config = dexterjs.get("config");
        // return early if the user sets trackPageTime to a falsy value
        if (!config.trackPageTime) { return false; }
        var endTime = new Date().getTime();
        var timeOnPage = Math.round((endTime - dexterjsPageStartTime)/1000);
        //pageType, URL, memberID, sessionID (cookie with a shorter expiration time), visitorID (cookie with a longer expiration time), duration (in seconds)
        var payload = {
            "URL" : document.location.href,
            //TODO: abstract this userid
            "memberID": window.ads_userid,
            "sessionID": idStorage.getSessionId(),
            "visitorID": idStorage.getVisitorId(),
            "duration": timeOnPage
        };

        // TODO: support legacy while also supporting configurable options 
        if (window.adsPage) {
            payload.pageType = window.adsPage;
        } 
        else if (window.pageType) {
            payload.pageType = window.pageType;
        }
        if (window.adsSubject) {
            payload.subject = window.adsSubject;
        }
        if (window.adsBranch) {
            payload.branch = window.adsBranch;
        }
        if (window.adsContextEid) {
            payload.context_eid = window.adsContextEid;
        } 

        // LOG EVENT
        dexterjs.logEvent(config.events.timeSpent, payload);
     }


    /**
     * Events defined for the dexterjs factory
     * @factory
     */
    function factoryEvents (dexterjs) {
        var _events = {
            dexterjsOnload: function() {
               startPageTimer();
               idStorage.updateIdExpiry();
            },

            dexterjsOnBeforeUnload: function() {
                dexterjsLogPageTime();
            },

            logEvent: ajax.logEvent
        };

        return _events;

    }


    var events = {
        userEvents: userEvents,
        factoryEvents: factoryEvents
    };


    /**
     * Interface object for browser's localStorage
     */
    function LocalStorageInterface (config) {
        var dbName = config.db.name;

        /**
         * Save the argument to the dbName in localStorage
         */
        this.write = function(string) {
            localStorage[dbName] = string;
        };

        /**
         * Read a key's value from the localStorage
         * @returns Object or null. If the dbName points to an undefined location, then return null.
         */
        this.read = function() {
            if (undefined === localStorage[dbName]) { return null; }
            else {
                return localStorage[dbName];
            }
        };

        /**
         * @method
         * delete all data in the db 
         */
        this.dump = function() {
            delete localStorage[config.db.name];
        };
    }



    /**
     * An interface is an instantiable object that handles reads/writes to some 
     * type of DB. The idea is very similar to a java interface,
     * which has been implemented by a class.
     *
     * An interface is expected to implement the following methods:
     *
     * read
     * write
     * dump
     *
     * 
     * ---- method signatures ----
     *
     * read() 
     *      - returns the entire contents of the config.db.name, or null.
     * write(string) 
     *      - returns undefined
     * dump()
     *      - returns undefined
     *
     */

    /**
     * Driver class for saving data to a browser storage database. 
     *
     * This constructor will instantiate the proper INTERFACE. The interface should
     * implement methods (such as 'read', 'write', and 'dump') and handle manipulations to  
     * the database that it is implementing. For example, LocalStorageInterface implements 
     * the 'read' method, which 
     * Given some db.name, this constructor will use the instantiated interface, parse the 
     * existing db field as JSON, and cache the result as a local js object.
     *
     *
     * @constructor
     * @param {object} config - configuration object which extends or overwrites the defaults.
     */
    function Storage(config) {
        var interface = null;
        var model = {};
        var _old; // detect whether the cached model is out of sync with the db writes.
        config = (typeof config !== "object") ? {} : config;
        // extend default config with some user defined config object.
        config = extend(true, {
            "db": {
                "name": "dexterjs",
                "type": "localStorage"
            },
            "model": {
                "queue": []
            },
            "interface": "localStorage"
        }, config);


        // SETUP THE INTERFACE TO THE STORAGE OBJECT
        switch (config.interface) {
            default: 
                interface = new LocalStorageInterface(config);
        }

        /** 
         * @private 
         */
        function initialize () {
            this.read();
            model = extend(true, config.model, model);
            _old = false;
        }

        // warning, objects are passed by reference.
        this.set = function(key, val) {
            model[key] = val;
            _old = true;
        };

        this.get = function(key) {
            return model[key];
        };

        /**
         * @method
         * Write to storage via interface
         */
        this.save = function() {
            _old = false;
            interface.write( JSON.stringify(model) );
        };

        /** 
         * @method
         * Get interface string, parse it as JSON, and save the result as a local JS variable
         */
        this.read = function() {
            var buff = interface.read();
            if (buff === null) {
                return model;
            }
            else {
                model = JSON.parse(buff);
                return model;
            }
        };

        /**
         * Write key:value to the cached model and interface
         * Special Case: no arguments just causes a save.
         * @param {string} key points to the key in the db.
         * @param {string} value is the value associated with the key.
         */
        this.write = function() {
            if (arguments.length===0) { return this.save(); }
            this.set.apply(this, arguments);
            this.save();
        };

        /**
         * Append a value to the given data object specified by key.
         * If the key is undefined, then do a write. 
         * This method is intended to concatenate an existing array with a new array, but 
         * has fallbacks in case the value isn't really an array so the data isn't lost.
         * @method
         */
        this.append = function(key, value) {
            var _v = this.get(key);
            var _vt = typeof _v;

            // check if existing value is NOT an object
            if (_vt !== "object" || _vt === "undefined" || _vt === "boolean") {
                this.write.apply(this, arguments);
            }
            // the existing value could be an array...
            else if (_v instanceof Array ) {
                if (value instanceof Array) {
                    this.write(key, _v.concat(value)); // maintains a single array
                }
                else { 
                    // otherwise, just push the new object onto the existing array
                    _v.push(value);
                    this.write(key, _v); 
                }
            }
            // the existing value must be some object. In this case it's awkward to "append" an object
            // to another object, 
            else {
                console.warn("[Dexterjs] The value passed is an object literal!\nUsing the extend method instead of append.");
                this.extend(key, value);
            }
        };

        /**
         * Given a key that points to an object and a value that is an object, extend the existing objct
         * with the new value.
         * @method
         */
        this.extend = function(key, value) {
            this.write( key, extend(true, this.get(key), value) );
        };

        /**
         * Given a key that points to an integer (possible string), add 1 to the value and set the updated key
         * @method
         */
        this.increment = function(key) {
            this.set(key, parseInt(this.get(key)) + 1);
        };

        /**
         * DELETE ALL DATA IN THE INTERFACE !!!
         * DELETE CACHED STORAGE OBJECT!!!
         * @method
         */
        this.dump = function() {
            model = {};
            interface.dump();
        };

        initialize.call(this);
    }

    function polyfils() {
        /**
         * Handle missing console
         */
        if (!window.console) {
            window.console = {};
            window.console.log = window.console.warn = window.console.debug = function() {};
        }
    }
var xpath = function xpath(elm) {
        var allNodes = document.getElementsByTagName('*');
        for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
            if (elm.hasAttribute('id')) {
                var uniqueIdCount = 0;
                for (var n = 0; n < allNodes.length; n++) {
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                    if (uniqueIdCount > 1) break;
                }
                if (uniqueIdCount == 1) {
                    segs.unshift('id("' + elm.getAttribute('id') + '")');
                    return segs.join('/');
                } else {
                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
                }
            } else if (elm.hasAttribute('class')) {
                segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
            } else {
                for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                    if (sib.localName == elm.localName) i++;
                }
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
            }
        }
        return segs.length ? '/' + segs.join('/') : null;
    };

var addSlashes = function addslashes(str) {
        return (str + '')
            .replace(/[\\"']/g, '\\$&')
            .replace(/\u0000/g, '\\0');
    };

/*
* License: https://raw.githubusercontent.com/Autarc/optimal-select/master/LICENSE
* Taken and compiled as AMD module from https://github.com/Autarc/optimal-select
*/
var selector = /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.optimize = exports.select = undefined;

	var _select2 = __webpack_require__(1);

	var _select3 = _interopRequireDefault(_select2);

	var _optimize2 = __webpack_require__(4);

	var _optimize3 = _interopRequireDefault(_optimize2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.select = _select3.default;
	exports.optimize = _optimize3.default;
	exports.default = _select3.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * # Select
	                                                                                                                                                                                                                                                   *
	                                                                                                                                                                                                                                                   * Construct a unique CSS queryselector to access the selected DOM element(s).
	                                                                                                                                                                                                                                                   * Applies different matching and optimization strategies for efficiency.
	                                                                                                                                                                                                                                                   */

	exports.default = getQuerySelector;
	exports.getSingleSelector = getSingleSelector;
	exports.getMultiSelector = getMultiSelector;

	var _adapt = __webpack_require__(2);

	var _adapt2 = _interopRequireDefault(_adapt);

	var _match = __webpack_require__(3);

	var _match2 = _interopRequireDefault(_match);

	var _optimize = __webpack_require__(4);

	var _optimize2 = _interopRequireDefault(_optimize);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Choose action depending on the input (single/multi)
	 * @param  {HTMLElement|Array} input   - [description]
	 * @param  {Object}            options - [description]
	 * @return {string}                    - [description]
	 */
	function getQuerySelector(input) {
	  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  if (Array.isArray(input)) {
	    return getMultiSelector(input, options);
	  }
	  return getSingleSelector(input, options);
	}

	/**
	 * Get a selector for the provided element
	 * @param  {HTMLElement} element - [description]
	 * @param  {Object}      options - [description]
	 * @return {String}              - [description]
	 */
	function getSingleSelector(element, options) {

	  if (element.nodeType === 3) {
	    return getSingleSelector(element.parentNode);
	  }
	  if (element.nodeType !== 1) {
	    throw new Error('Invalid input - only HTMLElements or representations of them are supported! (not "' + (typeof element === 'undefined' ? 'undefined' : _typeof(element)) + '")');
	  }

	  var globalModified = (0, _adapt2.default)(element, options);

	  var selector = (0, _match2.default)(element, options);
	  var optimized = (0, _optimize2.default)(selector, element, options);

	  // debug
	  // console.log(`
	  //   selector: ${selector}
	  //   optimized:${optimized}
	  // `)

	  if (globalModified) {
	    delete global.document;
	  }

	  return optimized;
	}

	/**
	 * Get a selector to match multiple children from a parent
	 * @param  {Array}  elements - [description]
	 * @param  {Object} options  - [description]
	 * @return {string}          - [description]
	 */
	function getMultiSelector(elements, options) {
	  var commonParentNode = null;
	  var commonClassName = null;
	  var commonAttribute = null;
	  var commonTagName = null;

	  for (var i = 0, l = elements.length; i < l; i++) {
	    var element = elements[i];
	    if (!commonParentNode) {
	      // 1st entry
	      commonParentNode = element.parentNode;
	      commonClassName = element.className;
	      // commonAttribute = element.attributes
	      commonTagName = element.tagName;
	    } else if (commonParentNode !== element.parentNode) {
	      return console.log('Can\'t be efficiently mapped. It probably best to use multiple single selectors instead!');
	    }
	    if (element.className !== commonClassName) {
	      var classNames = [];
	      var longer, shorter;
	      if (element.className.length > commonClassName.length) {
	        longer = element.className;
	        shorter = commonClassName;
	      } else {
	        longer = commonClassName;
	        shorter = element.className;
	      }
	      shorter.split(' ').forEach(function (name) {
	        if (longer.indexOf(name) > -1) {
	          classNames.push(name);
	        }
	      });
	      commonClassName = classNames.join(' ');
	    }
	    // TODO:
	    // - check attributes
	    // if (element.attributes !== commonAttribute) {
	    //
	    // }
	    if (element.tagName !== commonTagName) {
	      commonTagName = null;
	    }
	  }

	  var selector = getSingleSelector(commonParentNode, options);
	  console.log(selector, commonClassName, commonAttribute, commonTagName);

	  if (commonClassName) {
	    return selector + ' > .' + commonClassName.replace(/ /g, '.');
	  }
	  // if (commonAttribute) {
	  //
	  // }
	  if (commonTagName) {
	    return selector + ' > ' + commonTagName.toLowerCase();
	  }
	  return selector + ' > *';
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.default = adapt;

	function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

	/**
	 * # Universal
	 *
	 * Check and extend the environment for universal usage
	 */

	/**
	 * [adapt description]
	 * @param  {[type]} element [description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	function adapt(element, options) {

	  // detect environment setup
	  if (global.document) {
	    return false;
	  }

	  var context = options.context;


	  global.document = context || function () {
	    var root = element;
	    while (root.parent) {
	      root = root.parent;
	    }
	    return root;
	  }();

	  // https://github.com/fb55/domhandler/blob/master/index.js#L75
	  var ElementPrototype = Object.getPrototypeOf(global.document);

	  // alternative descriptor to access elements with filtering invalid elements (e.g. textnodes)
	  if (!Object.getOwnPropertyDescriptor(ElementPrototype, 'childTags')) {
	    Object.defineProperty(ElementPrototype, 'childTags', {
	      enumerable: true,
	      get: function get() {
	        return this.children.filter(function (node) {
	          // https://github.com/fb55/domelementtype/blob/master/index.js#L12
	          return node.type === 'tag' || node.type === 'script' || node.type === 'style';
	        });
	      }
	    });
	  }

	  if (!Object.getOwnPropertyDescriptor(ElementPrototype, 'attributes')) {
	    // https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes
	    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap
	    Object.defineProperty(ElementPrototype, 'attributes', {
	      enumerable: true,
	      get: function get() {
	        var attribs = this.attribs;

	        var attributesNames = Object.keys(attribs);
	        var NamedNodeMap = attributesNames.reduce(function (attributes, attributeName, index) {
	          attributes[index] = {
	            name: attributeName,
	            value: attribs[attributeName]
	          };
	          return attributes;
	        }, {});
	        Object.defineProperty(NamedNodeMap, 'length', {
	          enumerable: false,
	          configurable: false,
	          value: attributesNames.length
	        });
	        return NamedNodeMap;
	      }
	    });
	  }

	  if (!ElementPrototype.getAttribute) {
	    // https://docs.webplatform.org/wiki/dom/Element/getAttribute
	    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
	    ElementPrototype.getAttribute = function (name) {
	      return this.attribs[name] || null;
	    };
	  }

	  if (!ElementPrototype.getElementsByTagName) {
	    // https://docs.webplatform.org/wiki/dom/Document/getElementsByTagName
	    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
	    ElementPrototype.getElementsByTagName = function (tagName) {
	      var HTMLCollection = [];
	      traverseDescendants(this.childTags, function (descendant) {
	        if (descendant.name === tagName || tagName === '*') {
	          HTMLCollection.push(descendant);
	        }
	      });
	      return HTMLCollection;
	    };
	  }

	  if (!ElementPrototype.getElementsByClassName) {
	    // https://docs.webplatform.org/wiki/dom/Document/getElementsByClassName
	    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
	    ElementPrototype.getElementsByClassName = function (className) {
	      var names = className.trim().replace(/\s+/g, ' ').split(' ');
	      var HTMLCollection = [];
	      traverseDescendants([this], function (descendant) {
	        var descendantClassName = descendant.attribs.class;
	        if (descendantClassName && names.every(function (name) {
	          return descendantClassName.indexOf(name) > -1;
	        })) {
	          HTMLCollection.push(descendant);
	        }
	      });
	      return HTMLCollection;
	    };
	  }

	  if (!ElementPrototype.querySelectorAll) {
	    // https://docs.webplatform.org/wiki/css/selectors_api/querySelectorAll
	    // https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
	    ElementPrototype.querySelectorAll = function (selectors) {
	      var _this = this;

	      selectors = selectors.replace(/(>)(\S)/g, '$1 $2').trim(); // add space for '>' selector

	      // using right to left execution => https://github.com/fb55/css-select#how-does-it-work

	      var _getInstructions = getInstructions(selectors);

	      var _getInstructions2 = _toArray(_getInstructions);

	      var discover = _getInstructions2[0];

	      var ascendings = _getInstructions2.slice(1);

	      var total = ascendings.length;
	      return discover(this).filter(function (node) {
	        var step = 0;
	        while (step < total) {
	          node = ascendings[step](node, _this);
	          if (!node) {
	            // hierarchy doesn't match
	            return false;
	          }
	          step += 1;
	        }
	        return true;
	      });
	    };
	  }

	  if (!ElementPrototype.contains) {
	    // https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
	    ElementPrototype.contains = function (element) {
	      var inclusive = false;
	      traverseDescendants([this], function (descendant, done) {
	        if (descendant === element) {
	          inclusive = true;
	          done();
	        }
	      });
	      return inclusive;
	    };
	  }

	  return true;
	}

	/**
	 * [getInstructions description]
	 * @param  {[type]} selectors [description]
	 * @return {[type]}           [description]
	 */
	function getInstructions(selectors) {
	  return selectors.split(' ').reverse().map(function (selector, step) {
	    var discover = step === 0;

	    var _selector$split = selector.split(':');

	    var _selector$split2 = _slicedToArray(_selector$split, 2);

	    var type = _selector$split2[0];
	    var pseudo = _selector$split2[1];


	    var validate = null;
	    var instruction = null;

	    (function () {
	      switch (true) {

	        // child: '>'
	        case />/.test(type):
	          instruction = function checkParent(node) {
	            return function (validate) {
	              return validate(node.parent) && node.parent;
	            };
	          };
	          break;

	        // class: '.'
	        case /^\./.test(type):
	          var names = type.substr(1).split('.');
	          validate = function validate(node) {
	            var nodeClassName = node.attribs.class;
	            return nodeClassName && names.every(function (name) {
	              return nodeClassName.indexOf(name) > -1;
	            });
	          };
	          instruction = function checkClass(node, root) {
	            if (discover) {
	              return node.getElementsByClassName(names.join(' '));
	            }
	            return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
	          };
	          break;

	        // attribute: '[key="value"]'
	        case /^\[/.test(type):
	          var _type$replace$split = type.replace(/\[|\]|"/g, '').split('=');

	          var _type$replace$split2 = _slicedToArray(_type$replace$split, 2);

	          var attributeKey = _type$replace$split2[0];
	          var attributeValue = _type$replace$split2[1];

	          validate = function validate(node) {
	            var hasAttribute = Object.keys(node.attribs).indexOf(attributeKey) > -1;
	            if (hasAttribute) {
	              // regard optional attributeValue
	              if (!attributeValue || node.attribs[attributeKey] === attributeValue) {
	                return true;
	              }
	            }
	            return false;
	          };
	          instruction = function checkAttribute(node, root) {
	            if (discover) {
	              var _ret2 = function () {
	                var NodeList = [];
	                traverseDescendants([node], function (descendant) {
	                  if (validate(descendant)) {
	                    NodeList.push(descendant);
	                  }
	                });
	                return {
	                  v: NodeList
	                };
	              }();

	              if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	            }
	            return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
	          };
	          break;

	        // id: '#'
	        case /^#/.test(type):
	          var id = type.substr(1);
	          validate = function validate(node) {
	            return node.attribs.id === id;
	          };
	          instruction = function checkId(node, root) {
	            if (discover) {
	              var _ret3 = function () {
	                var NodeList = [];
	                traverseDescendants([node], function (descendant, done) {
	                  if (validate(descendant)) {
	                    NodeList.push(descendant);
	                    done();
	                  }
	                });
	                return {
	                  v: NodeList
	                };
	              }();

	              if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
	            }
	            return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
	          };
	          break;

	        // universal: '*'
	        case /\*/.test(type):
	          validate = function validate(node) {
	            return true;
	          };
	          instruction = function checkUniversal(node, root) {
	            if (discover) {
	              var _ret4 = function () {
	                var NodeList = [];
	                traverseDescendants([node], function (descendant) {
	                  return NodeList.push(descendant);
	                });
	                return {
	                  v: NodeList
	                };
	              }();

	              if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object") return _ret4.v;
	            }
	            return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
	          };
	          break;

	        // tag: '...'
	        default:
	          validate = function validate(node) {
	            return node.name === type;
	          };
	          instruction = function checkTag(node, root) {
	            if (discover) {
	              var _ret5 = function () {
	                var NodeList = [];
	                traverseDescendants([node], function (descendant) {
	                  if (validate(descendant)) {
	                    NodeList.push(descendant);
	                  }
	                });
	                return {
	                  v: NodeList
	                };
	              }();

	              if ((typeof _ret5 === 'undefined' ? 'undefined' : _typeof(_ret5)) === "object") return _ret5.v;
	            }
	            return typeof node === 'function' ? node(validate) : getAncestor(node, root, validate);
	          };
	      }
	    })();

	    if (!pseudo) {
	      return instruction;
	    }

	    var rule = pseudo.match(/-(child|type)\((\d+)\)$/);
	    var kind = rule[1];
	    var index = parseInt(rule[2], 10) - 1;

	    var validatePseudo = function validatePseudo(node) {
	      if (node) {
	        var compareSet = node.parent.childTags;
	        if (kind === 'type') {
	          compareSet = compareSet.filter(validate);
	        }
	        var nodeIndex = compareSet.findIndex(function (child) {
	          return child === node;
	        });
	        if (nodeIndex === index) {
	          return true;
	        }
	      }
	      return false;
	    };

	    return function enhanceInstruction(node) {
	      var match = instruction(node);
	      if (discover) {
	        return match.reduce(function (NodeList, matchedNode) {
	          if (validatePseudo(matchedNode)) {
	            NodeList.push(matchedNode);
	          }
	          return NodeList;
	        }, []);
	      }
	      return validatePseudo(match) && match;
	    };
	  });
	}

	/**
	 * Recursive walki
	 * @param  {[type]} nodes   [description]
	 * @param  {[type]} handler [description]
	 * @return {[type]}         [description]
	 */
	function traverseDescendants(nodes, handler) {
	  nodes.forEach(function (node) {
	    var progress = true;
	    handler(node, function () {
	      return progress = false;
	    });
	    if (node.childTags && progress) {
	      traverseDescendants(node.childTags, handler);
	    }
	  });
	}

	/**
	 * [getAncestor description]
	 * @param  {[type]} node     [description]
	 * @param  {[type]} root     [description]
	 * @param  {[type]} validate [description]
	 * @return {[type]}          [description]
	 */
	function getAncestor(node, root, validate) {
	  while (node.parent) {
	    node = node.parent;
	    if (validate(node)) {
	      return node;
	    }
	    if (node === root) {
	      break;
	    }
	  }
	  return null;
	}
	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = match;
	/**
	 * # Match
	 *
	 * Retrieves selector
	 */

	var defaultIgnore = {
	  attribute: function attribute(attributeName) {
	    return ['style', 'data-reactid', 'data-react-checksum'].indexOf(attributeName) > -1;
	  }
	};

	/**
	 * Get the path of the element
	 * @param  {HTMLElement} node    - [description]
	 * @param  {Object}      options - [description]
	 * @return {String}              - [description]
	 */
	function match(node, options) {
	  var path = [];
	  var element = node;
	  var length = path.length;

	  var _options$root = options.root;
	  var root = _options$root === undefined ? document : _options$root;
	  var _options$skip = options.skip;
	  var skip = _options$skip === undefined ? null : _options$skip;
	  var _options$ignore = options.ignore;
	  var ignore = _options$ignore === undefined ? {} : _options$ignore;


	  var skipCompare = skip && (Array.isArray(skip) ? skip : [skip]).map(function (entry) {
	    if (typeof entry !== 'function') {
	      return function (element) {
	        return element === entry;
	      };
	    }
	    return entry;
	  });

	  var skipChecks = function skipChecks(element) {
	    return skip && skipCompare.some(function (compare) {
	      return compare(element);
	    });
	  };

	  var ignoreClass = false;

	  Object.keys(ignore).forEach(function (type) {
	    if (type === 'class') {
	      ignoreClass = true;
	    }
	    var predicate = ignore[type];
	    if (typeof predicate === 'function') return;
	    if (typeof predicate === 'number') {
	      predicate = predicate.toString();
	    }
	    if (typeof predicate === 'string') {
	      predicate = new RegExp(predicate);
	    }
	    // check class-/attributename for regex
	    ignore[type] = predicate.test.bind(predicate);
	  });

	  if (ignoreClass) {
	    (function () {
	      var ignoreAttribute = ignore.attribute;
	      ignore.attribute = function (name, value, defaultPredicate) {
	        return ignore.class(value) || ignoreAttribute && ignoreAttribute(name, value, defaultPredicate);
	      };
	    })();
	  }

	  while (element !== root) {

	    if (skipChecks(element) !== true) {
	      // global
	      if (checkId(element, path, ignore)) break;
	      if (checkClassGlobal(element, path, ignore, root)) break;
	      if (checkAttributeGlobal(element, path, ignore, root)) break;
	      if (checkTagGlobal(element, path, ignore, root)) break;

	      // local
	      checkClassLocal(element, path, ignore);

	      // define only one selector each iteration
	      if (path.length === length) {
	        checkAttributeLocal(element, path, ignore);
	      }
	      if (path.length === length) {
	        checkTagLocal(element, path, ignore);
	      }

	      if (path.length === length) {
	        checkClassChild(element, path, ignore);
	      }
	      if (path.length === length) {
	        checkAttributeChild(element, path, ignore);
	      }
	      if (path.length === length) {
	        checkTagChild(element, path, ignore);
	      }
	    }

	    element = element.parentNode;
	    length = path.length;
	  }

	  if (element === root) {
	    path.unshift('*');
	  }

	  return path.join(' ');
	}

	/**
	 * [checkClassGlobal description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkClassGlobal(element, path, ignore, root) {
	  return checkClass(element, path, ignore, root);
	}

	/**
	 * [checkClassLocal description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkClassLocal(element, path, ignore) {
	  return checkClass(element, path, ignore, element.parentNode);
	}

	/**
	 * [checkClassChild description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkClassChild(element, path, ignore) {
	  var className = element.getAttribute('class');
	  if (checkIgnore(ignore.class, className)) {
	    return false;
	  }
	  return checkChild(element, path, '.' + className.trim().replace(/\s+/g, '.'));
	}

	/**
	 * [checkAttributeGlobal description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkAttributeGlobal(element, path, ignore, root) {
	  return checkAttribute(element, path, ignore, root);
	}

	/**
	 * [checkAttributeLocal description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkAttributeLocal(element, path, ignore) {
	  return checkAttribute(element, path, ignore, element.parentNode);
	}

	/**
	 * [checkAttributeChild description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkAttributeChild(element, path, ignore) {
	  var attributes = element.attributes;
	  return Object.keys(attributes).some(function (key) {
	    var attribute = attributes[key];
	    var attributeName = attribute.name;
	    var attributeValue = attribute.value;
	    if (checkIgnore(ignore.attribute, attributeName, attributeValue, defaultIgnore.attribute)) {
	      return false;
	    }
	    var pattern = '[' + attributeName + '="' + addSlashes(attributeValue) + '"]';
	    return checkChild(element, path, pattern);
	  });
	}

	/**
	 * [checkTagGlobal description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkTagGlobal(element, path, ignore, root) {
	  return checkTag(element, path, ignore, root);
	}

	/**
	 * [checkTagLocal description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkTagLocal(element, path, ignore) {
	  return checkTag(element, path, ignore, element.parentNode);
	}

	/**
	 * [checkTabChildren description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkTagChild(element, path, ignore) {
	  var tagName = element.tagName.toLowerCase();
	  if (checkIgnore(ignore.tag, tagName)) {
	    return false;
	  }
	  return checkChild(element, path, tagName);
	}

	/**
	 * [checkId description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkId(element, path, ignore) {
	  var id = element.getAttribute('id');
	  if (checkIgnore(ignore.id, id)) {
	    return false;
	  }
	  path.unshift('#' + id);
	  return true;
	}

	/**
	 * [checkClass description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @param  {HTMLElement} parent  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkClass(element, path, ignore, parent) {
	  var className = element.getAttribute('class');
	  if (checkIgnore(ignore.class, className)) {
	    return false;
	  }
	  var matches = parent.getElementsByClassName(className);
	  if (matches.length === 1) {
	    path.unshift('.' + className.trim().replace(/\s+/g, '.'));
	    return true;
	  }
	  return false;
	}

	/**
	 * [checkAttribute description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {Object}      ignore  - [description]
	 * @param  {HTMLElement} parent  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkAttribute(element, path, ignore, parent) {
	  var attributes = element.attributes;
	  return Object.keys(attributes).some(function (key) {
	    var attribute = attributes[key];
	    var attributeName = attribute.name;
	    var attributeValue = attribute.value;
	    if (checkIgnore(ignore.attribute, attributeName, attributeValue, defaultIgnore.attribute)) {
	      return false;
	    }
	    var pattern = '[' + attributeName + '="' + addSlashes(attributeValue) + '"]';
	    var matches = parent.querySelectorAll(pattern);
	    if (matches.length === 1) {
	      path.unshift(pattern);
	      return true;
	    }
	  });
	}

	/**
	 * [checkTag description]
	 * @param  {HTMLElement} element - [description]
	 * @param  {Array}       path    - [description]
	 * @param  {HTMLElement} parent  - [description]
	 * @param  {Object}      ignore  - [description]
	 * @return {Boolean}             - [description]
	 */
	function checkTag(element, path, ignore, parent) {
	  var tagName = element.tagName.toLowerCase();
	  if (checkIgnore(ignore.tag, tagName)) {
	    return false;
	  }
	  var matches = parent.getElementsByTagName(tagName);
	  if (matches.length === 1) {
	    path.unshift(tagName);
	    return true;
	  }
	  return false;
	}

	/**
	 * [checkChild description]
	 * Note: childTags is a custom property to use a view filter for tags on for virutal elements
	 * @param  {HTMLElement} element  - [description]
	 * @param  {Array}       path     - [description]
	 * @param  {String}      selector - [description]
	 * @return {Boolean}              - [description]
	 */
	function checkChild(element, path, selector) {
	  var parent = element.parentNode;
	  var children = parent.childTags || parent.children;
	  for (var i = 0, l = children.length; i < l; i++) {
	    if (children[i] === element) {
	      path.unshift('> ' + selector + ':nth-child(' + (i + 1) + ')');
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * [checkIgnore description]
	 * @param  {Function} predicate        [description]
	 * @param  {string}   name             [description]
	 * @param  {string}   value            [description]
	 * @param  {Function} defaultPredicate [description]
	 * @return {boolean}                   [description]
	 */
	function checkIgnore(predicate, name, value, defaultPredicate) {
	  if (!name) {
	    return true;
	  }
	  var check = predicate || defaultPredicate;
	  if (!check) {
	    return false;
	  }
	  return check(name, value || name, defaultPredicate);
	}
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = optimize;

	var _adapt = __webpack_require__(2);

	var _adapt2 = _interopRequireDefault(_adapt);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Apply different optimization techniques
	 * @param  {string}      selector - [description]
	 * @param  {HTMLElement} element  - [description]
	 * @return {string}               - [description]
	 */
	function optimize(selector, element) {
	  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


	  var globalModified = (0, _adapt2.default)(element, options);

	  // chunk parts outside of quotes (http://stackoverflow.com/a/25663729)
	  var path = selector.replace(/> /g, '>').split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);

	  if (path.length < 3) {
	    return selector;
	  }

	  var shortened = [path.pop()];
	  while (path.length > 1) {
	    var current = path.pop();
	    var prePart = path.join(' ');
	    var postPart = shortened.join(' ');

	    var pattern = prePart + ' ' + postPart;
	    var matches = document.querySelectorAll(pattern);
	    if (matches.length !== 1) {
	      shortened.unshift(optimizePart(prePart, current, postPart, element));
	    }
	  }
	  shortened.unshift(path[0]);
	  path = shortened;

	  // optimize start + end
	  path[0] = optimizePart('', path[0], path.slice(1).join(' '), element);
	  path[path.length - 1] = optimizePart(path.slice(0, -1).join(' '), path[path.length - 1], '', element);

	  if (globalModified) {
	    delete global.document;
	  }

	  return path.join(' ').replace(/>/g, '> ').trim();
	}

	/**
	 * Improve a chunk of the selector
	 * @param  {string}      prePart  - [description]
	 * @param  {string}      current  - [description]
	 * @param  {string}      postPart - [description]
	 * @param  {HTMLElement} element  - [description]
	 * @return {string}               - [description]
	 */
	/**
	 * # Optimize
	 *
	 * 1.) Improve efficiency through shorter selectors by removing redundancy
	 * 2.) Improve robustness through selector transformation
	 */

	function optimizePart(prePart, current, postPart, element) {
	  if (prePart.length) prePart = prePart + ' ';
	  if (postPart.length) postPart = ' ' + postPart;

	  // robustness: attribute without value (generalization)
	  if (/\[*\]/.test(current)) {
	    var key = current.replace(/=.*$/, ']');
	    var pattern = '' + prePart + key + postPart;
	    var matches = document.querySelectorAll(pattern);
	    if (matches.length === 1 && matches[0] === element) {
	      current = key;
	    } else {
	      // robustness: replace specific key-value with tag (heuristic)
	      var references = document.querySelectorAll('' + prePart + key);
	      for (var i = 0, l = references.length; i < l; i++) {
	        if (references[i].contains(element)) {
	          var description = references[i].tagName.toLowerCase();
	          var pattern = '' + prePart + description + postPart;
	          var matches = document.querySelectorAll(pattern);
	          if (matches.length === 1 && matches[0] === element) {
	            current = description;
	          }
	          break;
	        }
	      }
	    }
	  }

	  // robustness: descendant instead child (heuristic)
	  if (/>/.test(current)) {
	    var descendant = current.replace(/>/, '');
	    var pattern = '' + prePart + descendant + postPart;
	    var matches = document.querySelectorAll(pattern);
	    if (matches.length === 1 && matches[0] === element) {
	      current = descendant;
	    }
	  }

	  // robustness: 'nth-of-type' instead 'nth-child' (heuristic)
	  if (/:nth-child/.test(current)) {
	    // TODO: consider complete coverage of 'nth-of-type' replacement
	    var type = current.replace(/nth-child/g, 'nth-of-type');
	    var pattern = '' + prePart + type + postPart;
	    var matches = document.querySelectorAll(pattern);
	    if (matches.length === 1 && matches[0] === element) {
	      current = type;
	    }
	  }

	  // efficiency: combinations of classname (partial permutations)
	  if (/\.\S+\.\S+/.test(current)) {
	    var names = current.trim().split('.').slice(1).map(function (name) {
	      return '.' + name;
	    }).sort(function (curr, next) {
	      return curr.length - next.length;
	    });
	    while (names.length) {
	      var partial = current.replace(names.shift(), '');
	      var pattern = '' + prePart + partial + postPart;
	      var matches = document.querySelectorAll(pattern);
	      if (matches.length === 1 && matches[0] === element) {
	        current = partial;
	      }
	    }
	    // robustness: degrade complex classname (heuristic)
	    if (current && current.match(/\./g).length > 2) {
	      var _references = document.querySelectorAll('' + prePart + current);
	      for (var i = 0, l = _references.length; i < l; i++) {
	        if (_references[i].contains(element)) {
	          // TODO:
	          // - check using attributes + regard excludes
	          var _description = _references[i].tagName.toLowerCase();
	          var pattern = '' + prePart + _description + postPart;
	          var matches = document.querySelectorAll(pattern);
	          if (matches.length === 1 && matches[0] === element) {
	            current = _description;
	          }
	          break;
	        }
	      }
	    }
	  }

	  return current;
	}
	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ])

    'use strict';
    /**
     *A plugin to instrument dexter events declaratively using data attributes.
     *Can be enabled/disabled using the configuration:
     *
     *<b>Default config</b>:
     *  enabled - true
     *  defaultDomEvent - 'click'. see notes.
     *  additionalDomEvents - Empty. Allows capturing other dom events in addition to the defaultDomEvent. See notes.
     *  selector - Looks for 'dxtrack' or 'dxtrack-user-action' class on elements to be tracked
     *  dataPrefix - picks all the data attributes that start with 'data-dx-'
     *
     * Notes:
     * 1. 'defaultDomEvent' limit the defaultDomEvent to events like click.
     * 2. The 'additionalDomEvents' should be a comma separated list of dom events. The dexterjs event will only be fired
     * if the elements 'domEvent' attribute matches one of these events.
     * 3. The 'additionalDomEvents' config should be a superset i.e should include ALL the values you plan to use in the 'domEvent'
     * attribute of the elements.
     * 4. All the events are attached to document object. So only the events that can be attached to document can be used
     * with declarativePlugin.
     *
     *<b>Overide config</b>
     *You can overide the default config when you initialize dexterjs, by passing in the declarativePlugin
     *config with rest of your config
     *
     *      dexterjs.set('config', {
     *          clientID: 'XXXXXX',
     *          trackPageTime: false,
     *          declarativePlugin: {
     *              enabled: true,
     *              defaultDomEvent: 'click',
     *              additionalDomEvents: 'touchend',
     *              selector: '.dxtrack, .dxtrack2',
     *              dataPrefix: 'data-dx'
     *          }
     *      });
     *
     *
     *<b>Examples</b>
     *  You can see some <a href="../../examples/declarative.html">examples</a>
     *
     * @constructor
     * @param {object} dexterjs - dexterjs instance that includes the configuration.
     */
    function Declarative(dexterjs) {
        var config = dexterjs.get('config');
        config = (typeof config !== 'object') ? {} : config;
        var documentElement = document.documentElement;
        var cachedPush = Array.prototype.push;
        var matches = documentElement.matches || documentElement.webkitMatchesSelector || documentElement.mozMatchesSelector || documentElement.oMatchesSelector || documentElement.msMatchesSelector;

        /**
         * @private
         */
        function initialize() {
            initEventListeners();
            //listen for any dexterjs config changes. Normally this will happen
            //when initiliazing dexterjs using dexterjs.set()

            //Remove any previous listener. Less likely for this to happen
            document.removeEventListener('dexterjsConfigChangedEvent', configChangeListener);
            //Listen for dexter config changes
            document.addEventListener('dexterjsConfigChangedEvent', configChangeListener);
        }

        /**
         *@private
         */
        function configChangeListener(event) {
            config = extend(true, config, event.data.config);
            initEventListeners();
        }

        /**
         * @private
         */
        function handleDelegate(element, event, dataPrefix) {
            var payload = {};
            //if domEvent attribute is specified on element, it should match the current event
            //if not, the current event should match the defaultDomEvent
            var domEvent = element.getAttribute(dataPrefix + 'domEvent');
            var classes = element.getAttribute('class');
            if ((domEvent && event.type !== domEvent) || (config.declarativePlugin.defaultDomEvent.indexOf(event.type) === -1)) {
                //do not process this event
                return;
            }

            //first get the eventName attribute and bail out if absent
            var eventName = element.getAttribute(dataPrefix + 'eventname');
            //if eventName is absent and if this element does not have dxtrack-user-action class
            if (!eventName || eventName === '') {
                if (classes.indexOf('dxtrack-user-action') !== -1) {
                    //NOTE: dxtrack-user-action is a new generic user action defined.
                    //SEE Pivotal story: https://www.pivotaltracker.com/story/show/127373531
                    eventName = 'FBS_USER_ACTION';
                    //Make sure the data-dx-desc attribute is specified.
                    //This is a required attribute for dxtrack-user-action
                    if (!('data-dx-desc' in element.attributes)) {
                        console.warn('Dexter event not fired. Reason: missing the required "' + dataPrefix + 'desc" attribute on element', element);
                        return;
                    }

                } else {
                    //else we don't have enough details for logging this ads eventName
                    console.warn('Dexter event not fired. Reason: missing the ' + dataPrefix + ' eventname', element);
                    return;
                }
            }

            //can't use element.dataset due to lack of IE support, instead loop attributes
            //and get the needed payload
            var attributes = element.attributes;
            for (var j = 0, attrLen = attributes.length; j < attrLen; j++) {
                var data = attributes[j];
                if (data.name.indexOf(dataPrefix) === 0) {
                    var dataName = data.name.replace(dataPrefix, '');
                    if (dataName === 'eventname') {
                        //skip eventName data attribute, as we already send it
                        //in logEvent
                        continue;
                    }

                    if (dataName === 'payload') {
                        //if the data attribute name is 'payload', parse JSON and use that as payload
                        var jsonPayload = JSON.parse(data.value.replace(/'/g, '\''));
                        payload = extend(true, payload, jsonPayload);
                    } else {
                        payload[dataName] = data.value;
                    }
                } else {
                    //for declarative events, send all attributes
                    payload[data.name] = data.value;
                }
            }
            //we also send following additional information for declarative events:
            //xpath, selector, domContent
            payload['selector'] = selector.select(element, {
                ignore: {
                    attribute: function (name, value, defaultPredicate) {
                        // exclude data-dx-payload data attribute
                        return (/data-dx-payload*/)
                            .test(name) || defaultPredicate(name, value);
                    }
                }
            });
            payload['xpath'] = xpath(element);
            payload['domContent'] = element.innerText;
            dexterjs.logEvent(eventName, payload);
        }

        function delegateListener(event) {
            var elementQuerySelector = config.declarativePlugin.selector;
            var dataPrefix = config.declarativePlugin.dataPrefix;
            var qs = document.querySelector(elementQuerySelector);
            //Make sure there is atleast 1 element on page that has declarative
            //syntax
            if (qs) {
                var el = event.target;
                var matched = false;

                while (el && !(matched = matches.call(el, elementQuerySelector))) {
                    el = el.parentElement;
                }

                if (matched) {
                    try {
                        handleDelegate(el, event, dataPrefix);
                    } catch (err) {
                        console.log(err);
                        //don't raise exception, to prevent problems in
                        //normal execution, while firing dexterjs events.
                    }
                }
            }
        }

        function delegate(eventType) {
            //remove any previous event handler
            document.removeEventListener(eventType, delegateListener, true);
            //Use the event capturing mode
            document.addEventListener(eventType, delegateListener, true);
        }

        /**
         * @private
         * Add event listeners
         */
        function initEventListeners() {
            if (config.declarativePlugin.enabled) {
                var events = ['click']; //default
                var additionalEventStr = null;
                var defaultDomEventStr = config.declarativePlugin.defaultDomEvent;
                if (defaultDomEventStr) {
                    events = []; //overide default
                    cachedPush.apply(events, defaultDomEventStr.split(/[\s,]+/));
                }

                additionalEventStr = config.declarativePlugin.additionalDomEvents;
                if (additionalEventStr) {
                    cachedPush.apply(events, additionalEventStr.split(/[\s,]+/));
                }

                for (var i = 0; i < events.length; i++) {
                    delegate(events[i]);
                }
            }
        }

        initialize.call(this);
    }
var deepLookup = function deepLookup(prop, sourceObj) {
        var propPaths = (prop)?(''+prop).split('.'):[],
            currObj = sourceObj,
            prop;
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
    };


    "use strict";
    /**
     *A plugin to push optimizely information to dexter.
     *
     *<b>Default config</b>:
     *  enabled - true
     *
     *
     *<b>Overide config</b>
     *You can overide the default config when you initialize dexterjs, by passing in the optimizelyPlugin
     *config with rest of your config
     *
     *      dexterjs.set("config", {
     *          clientID: "XXXXXX",
     *          optimizelyPlugin: {
     *              enabled: true
     *          }
     *      });
     *
     *
     * @constructor
     * @param {object} dexterjs - dexterjs instance that includes the configuration.
     */
    function Optimizely(dexterjs) {
        var config = dexterjs.get("config");
        config = (typeof config !== "object") ? {} : config;


        /**
         * @private
         */
        function initialize() {
            initEventListeners();
            //listen for any dexterjs config changes. Normally this will happen
            //when initiliazing dexterjs using dexterjs.set()

            //Remove any previous listener. Less likely for this to happen
            document.removeEventListener("dexterjsConfigChangedEvent", configChangeListener);
            //Listen for dexter config changes
            document.addEventListener("dexterjsConfigChangedEvent", configChangeListener);
        }

        /**
         *@private
         */
        function configChangeListener(event) {
            config = extend(true, config, event.data.config);
            initEventListeners();
        }


        /**
         * @private
         * Add event listeners
         */
        function initEventListeners() {
            var allExperiments, variationNamesMap, activeExperiments=[], variations=[];
            if (config.optimizelyPlugin.enabled) {

                allExperiments = deepLookup('optimizely.data.experiments', window);
                variationNamesMap = deepLookup('optimizely.data.state.variationNamesMap', window);
                if (allExperiments && variationNamesMap){
                     Object.keys(variationNamesMap).forEach(function(key){
                        var experiment = allExperiments[key].name,
                            variation = variationNamesMap[key];

                        activeExperiments.push(experiment);
                        variations.push(variation);

                    });
                    dexterjs.set('config', {
                        mixins:{
                            optimizelyState_exp: activeExperiments.join('||'),
                            optimizelyState_var: variations.join('||')
                        }
                    }, true);
                }
            } else {
                dexterjs.set('config', {
                    mixins:{
                        optimizelyState: null
                    }
                }, true);
            }
        }


        initialize.call(this);
    }


    "use strict";

    polyfils();
    var storage = null; // for localStorage
    var dexterizedEvents = null; // for events-factory output
    var dexterjs = null;
    var declarative = null; // for declarative instrumentation
    var optimizelyPlugin = null; // for optimizely plugin


    /**
     * Handle all the configurable options that were either passed to
     * dexterjs or set by default.
     * TODO: this is specifically for factory output.
     */
    function handleConfiguration(dexterjs) {
        var config = dexterjs.get("config");
        if (!config.trackScreenResolution) {
            delete config.mixins.resHeight;
            delete config.mixins.resWidth;
        }
        if (!config.trackReferrer) {
            delete config.mixins.url_referrer;
        }

        //if (config.trackPageTime === true) { }
    }

    // setup storage
    storage = new Storage({type: "localStorage"});

    /**
     * @factory
     * Define the dexterjs object here
     */
    dexterjs = function(configuration) {
        var Dexter = initialize(configuration);
        var _dexterjs = {};
        extend(true, _dexterjs, new Dexter());

        // handle factory specific preparation here
        handleConfiguration(_dexterjs);
        var _events = events.userEvents(_dexterjs);

        // Configured methods for new dexterjs object
        _dexterjs.logEvent = _events.logEvent;

        return _dexterjs;
    };

    dexterjs.extend = extend;
    dexterjs.storage = storage;

    // extend the factory to include a clone of the default configuration with get and set methods.
    // NOTE: would use the extend method, however it doesn't yet handle functions, and it may not be so
    // simple to add this functionality because it's a recursive function.
    (function() {
        var DexterConfig = initialize({}); // will initialize with default_configuration
        var dexterConfig = new DexterConfig();
        for (var config in dexterConfig) if (dexterConfig.hasOwnProperty(config)) {
            dexterjs[config] = dexterConfig[config];
        }
    })();

    // Define the prototypes here.
    dexterjs.prototype = {
        constructor: dexterjs,
        extend: extend,
        storage: storage
    };

    // setup the factory events
    dexterizedEvents = events.factoryEvents(dexterjs);
    dexterjs.logEvent = dexterizedEvents.logEvent;

    // fire the onload event
    dexterizedEvents.dexterjsOnload();

    // bind the beforeunload event
    window.addEventListener("beforeunload", dexterizedEvents.dexterjsOnBeforeUnload);

    // setup Declarative
    declarative = new Declarative(dexterjs);
    optimizelyPlugin = new Optimizely(dexterjs);

    // create an instance of a dexterjs object for the dexterQueue
    dexterQueue(window);


if ( typeof define === "function" && define.amd ) {
    define([], function() {
        return dexterjs;
    });
}




    var _dexterjs = window.dexterjs;


    dexterjs.noConflict = function() {
        if (window.dexterjs === dexterjs ) {
            window.dexterjs = _dexterjs;
        }
        return dexterjs;
    };


    if ( typeof noGlobal === typeof undefined ) {
        window.dexterjs = dexterjs;
    }



    dexterjs.version = "0.1.3";
}));
