define([
    "../core",
    "../var/default_configuration",
    "../var/cloneObject",
    "../utils/extend"
], function(dexterjs, default_configuration, cloneObject, extend) {

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

    return initialize;
});
