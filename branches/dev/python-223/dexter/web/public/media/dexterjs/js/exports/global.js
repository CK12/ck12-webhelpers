define([
    "../core",
], function(dexterjs) {

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

});
