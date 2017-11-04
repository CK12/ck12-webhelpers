define([
    "../var/default_configuration",
    "../core/var/idStorage",
    "../var/bakeCookie"
], function(default_configuration, idStorage) {

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
    
    return factoryEvents;

});
