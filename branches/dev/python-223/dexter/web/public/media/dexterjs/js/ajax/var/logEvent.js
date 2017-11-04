define([
    "./post",
    "../../utils/extend",
    "../../core/var/idStorage",
    "../../var/getCookie",
    "../../utils/var/cipher"
], function(post, extend, idStorage, cookie, cipher) {
        /**
         * Post an event to the server
         *
         * @context (this)  can either be the factory dexterjs or a dexterjs object created via the factory
         * @param {string} eventType  name of event, 'event group'.
         * @param {object} payload  (optional) object literal containing key:value pairs to be appended in payload.
         *
         * Special Case: Bulk Upload.
         * @param {Array} eventType  (special case) List of events to upload in a single AJAX call.
         * @param {function} callback  (optional) execute some function after the post's success. 
         * @param {object} callback  (optional) an object with success and error callback functions.
         * @returns - false on fail, true otherwise. Does not guarantee ajax success
         */
        return function logEvent(eventType, payload, callback) {
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
});
