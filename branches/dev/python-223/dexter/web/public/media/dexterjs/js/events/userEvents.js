define([
    "../ajax",
    "../var/getRandomString",
    "../var/getCookie"
],function(ajax, getRandomString, getCookie) {
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
    return userEvents;
});
