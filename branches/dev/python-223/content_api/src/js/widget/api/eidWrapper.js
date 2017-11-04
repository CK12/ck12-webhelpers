'use strict';

var api            = require('../../sharedGlobal/api/eid'),
    recommendation = require('./recommendationWrapper'),
    widgetData     = require('../shared/widget.data'),
    state          = require('../shared/widget.state');

function postWrapper() {
    api.post( widgetData )
        .done(function(data){
            state.createTitle(data.response[0].name);
            recommendation.get(data);
        })
        .fail(function () {
            state.retry();
        });
}

module.exports = {
    post: postWrapper
};