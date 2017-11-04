define([
    "./ajax/var/xmlhttp",
    "./utils/var/serialize",
    "./utils/extend",
    "./var/cloneObject",
    "./ajax/var/logEvent"
], function(xmlhttp, serialize, extend, cloneObject, logEvent) {
    
    var ajax = {
        logEvent:logEvent
    };
    return ajax;

});
