require.config({
    "baseUrl":"/athenaapp/media"
});

require(['require.config'], function(){
    require(['_main']);
});

define("_main", function (require) {
    "use strict";
    var $ = require("jquery");
    require("fn/vendor/custom.modernizr");
    require("fn/foundation.min");
    var CK12AthenaBridge = require("athenaapp/CK12AthenaBridge");
    var ck12AthenaBridge = null;
    var AthenaApp        = require("athenaapp/athenaapp");
    var athenaApp        = null;

    // Hollow console
    if (typeof console === "undefined" || typeof console.log === "undefined") {
        console = {}; console.log = function() {};
    }
    //initialize foundation framework and any its plugins
    $(document).foundation();
    // init Bridge and pass to app
    ck12AthenaBridge = new CK12AthenaBridge();
    ck12AthenaBridge.initialize(function(initialState) {
        // Init App
        athenaApp = new AthenaApp({
            bridge: ck12AthenaBridge,
            initialState: initialState
        });
    });
    return athenaApp;
});
