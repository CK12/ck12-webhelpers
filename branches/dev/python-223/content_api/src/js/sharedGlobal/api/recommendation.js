'use strict';

var oboe = require('oboe'),
    endpoint = require('./endpoints'),
    difficulty = require('../difficulty/level'),
    modalities = require('../modalitites/modalities');

function get(mainData, eid) {
    // try {
    //     dexterjs.logEvent('FBS_CONTENT_API_WIDGET', {
    //         partnerName: mainData.userConfig.partnerId,
    //         context_eid: eid
    //     });
    // } catch(e) {
    //     console.log(e);
    // }

    return oboe({
        url: createURL(mainData, eid),
        method: 'GET',
        headers: {
            'x-ck12-meta-appid': mainData.userConfig.apiKey
            // 'x-ck12-meta-partner-name': mainData.userConfig.partnerId
        }
    });
}

function createURL (mainData, eid) {
    var difficultyLevel = mainData.userConfig.difficultyLevel || 'basic',
        modalityTypes = encodeURIComponent( modalities.getTypes(mainData) ),
        url = endpoint.recommend +
                '?modalityTypes=' + modalityTypes +
                '&instanceID=_partner&format=json';

    if(eid){ url += '&encodedID=' + eid; }
    if(mainData.userConfig.conceptName){ url += '&conceptName=' + encodeURIComponent(mainData.userConfig.conceptName); }
    url += '&scoreLevel=' + difficulty[difficultyLevel];

    return url;
}

module.exports = {
    get: get
};
