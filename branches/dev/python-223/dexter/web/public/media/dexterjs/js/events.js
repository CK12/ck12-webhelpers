define([
    "./var/getCookie",
    "./var/getRandomString",
    "./ajax",
    "./events/userEvents",
    "./events/factoryEvents"
], function(getCookie, getRandomString, ajax, userEvents, factoryEvents) {

    var events = {
        userEvents: userEvents,
        factoryEvents: factoryEvents
    };

    return events;
});
