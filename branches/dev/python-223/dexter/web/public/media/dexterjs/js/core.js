
define([
    "./utils/extend",
    "./core/initialize",
    "./core/var/dexterQueue",
    "./events",
    "./storage",
    "./polyfils",
    "./plugins/declarative",
    "./plugins/optimizely"
],
function(extend, initialize, dexterQueue, events, Storage, polyfils, Declarative, Optimizely) {
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

    return dexterjs;
});
