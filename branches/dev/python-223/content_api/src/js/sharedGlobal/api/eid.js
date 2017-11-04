'use strict';

var oboe      = require('oboe'),
    endpoint  = require('./endpoints.js');

function post(args){
    var xhtml     = args.xhtml,
        apiKey    = args.userConfig.apiKey,
        // partnerId = args.userConfig.partnerId,
        bodyUrl   = createBodyURL(args);

    return oboe({
            url: endpoint.eid,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-ck12-meta-appid': apiKey
                // 'x-ck12-meta-partner-name': partnerId
            },
            body: 'xhtml=' + JSON.stringify(xhtml) + '&url=' + encodeURIComponent(bodyUrl)
        });
}

function createBodyURL(args) {
    var userConfig = args.userConfig,
        // If not widget it will return the current pages url
        baseURL = args.eventSourceUrl || location.origin + location.pathname,
        url = baseURL + '?mode=' +  userConfig.mode;

    if(userConfig.conceptName){ url += '&conceptName=' + userConfig.conceptName; }

    return url;
}

module.exports = {
    post: post
};
