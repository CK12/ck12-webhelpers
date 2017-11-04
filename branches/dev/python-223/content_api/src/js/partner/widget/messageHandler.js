'use strict';

var globals = require('../shared/global'),
    widgetEvents = require('./widget.events');

function receiveMessageHandler(event) {
    // Prevents other iframe 'message' events from being used
    if(!event.data.ck12 && !event.data.widgetNum) { return; }

    var currentWidget = globals.widgets[event.data.widgetNum - 1];

    if(event.data.modalityUrl){
        widgetEvents.handleModality(event.data.modalityUrl);
    }

    if(event.data.resize && event.data.resize !== currentWidget.clientHeight){
        widgetEvents.handleResize(currentWidget, event.data.resize);
    }
}

module.exports = {
    receiveHandler: receiveMessageHandler
};