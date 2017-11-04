'use strict';

var eid            = require('../sharedGlobal/api/eid'),
    recommendation = require('../sharedGlobal/api/recommendation');

function init(jsonData){
    if(jsonData.userConfig && jsonData.userConfig.conceptName){
        recommend(jsonData);
    } else {
        eid.post( jsonData )
            .done(function(data){
                recommend(jsonData, data);
            })
            .fail(function(e){
                console.log(e);
            });
    }
}

function recommend(mainData, data){
    var eid = data && data.response && data.response[0] && data.response[0].eid;

    recommendation.get(mainData, eid)
        .done(function (_data) {
            mainData.userConfig.callback(_data);
        })
        .fail(function(e){
            console.log(e);
        });
}
window.ck12.content.json = init;