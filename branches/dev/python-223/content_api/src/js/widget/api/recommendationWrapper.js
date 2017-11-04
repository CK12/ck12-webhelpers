'use strict';

var classie      = require('classie'),
    api          = require('../../sharedGlobal/api/recommendation'),
    modalities   = require('../modalities/modality'),
    widgetData   = require('../shared/widget.data'),
    state        = require('../shared/widget.state'),
    message      = require('../shared/message'),
    nodes        = require('../shared/dom.nodes');

function getWrapper(data){
    var eid = data && data.response && data.response[0] && data.response[0].eid;

    api.get(widgetData, eid)
        .done(handleResponse)
        .fail(state.retry);
}

function handleResponse(data){
    if(!data.response || !data.response.modalities || data.response.modalities.length === 0){
        return state.retry();
    }

    state.createTitle(data.response.modalities[0].domain.name);

    modalities.remove();
    modalities.create(data);

    classie.remove(nodes.content, 'hidden');
    classie.add(nodes.loader, 'hidden');

    message.sendResize();

}

module.exports = {
    get: getWrapper
};