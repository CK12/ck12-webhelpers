'use strict';

var globals = require('../shared/global');

function createScript(src){
    var script =  document.createElement('script');
    script.setAttribute('src', src);
    document.head.appendChild(script);
}

function createJSONScript(config) {
    createScript(globals.host + '/js/json.js');

    poll(
        hasJSONScript,
        function(){ window.ck12.content.json(config); },
        console.error,
        5000,
        300
    );
}

function hasJSONScript () {
    return !!window.ck12.content.json;
}

function poll(fn, callback, errback, timeout, interval) {
    var endTime = Number(new Date()) + (timeout || 2000);
    interval = interval || 100;

    (function p() {
        if(fn()) {
            callback();
        }
        else if (Number(new Date()) < endTime) {
            setTimeout(p, interval);
        }
        else {
            errback(new Error('timed out for ' + fn + ': ' + arguments));
        }
    })();
}



module.exports = {
    createJSONScript: createJSONScript,
    hasJSONScript: hasJSONScript
};