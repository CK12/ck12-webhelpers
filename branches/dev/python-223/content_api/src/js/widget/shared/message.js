'use strict';

var widgetData = require('../shared/widget.data'),
    extend     = require('../utils/extend');

function postMessage(obj){
    widgetData.eventSource.postMessage(
        extend( obj, widgetData.mainData ),
    widgetData.eventOrigin);
}

function sendModality(){
    postMessage( { modalityUrl: this.getAttribute('data-modality-url') } );
}

function sendResize(){
    postMessage( { resize: document.body.clientHeight + 5 } );
}

module.exports = {
    sendResize: sendResize,
    sendModality: sendModality
};