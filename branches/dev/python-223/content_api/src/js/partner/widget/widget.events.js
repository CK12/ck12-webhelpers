'use strict';

var nodes    = require('../shared/dom.nodes'),
    modal    = require('../modal/modal'),
    modality = require('../modality/modality');

function handleResize(widget, val){
    widget.height = val;
}

function handleModality(modalityUrl){
    if( shouldCreateModality(modalityUrl) ){
        modality.create(modalityUrl);
    }
    modal.trigger();
}

function shouldCreateModality(modalityUrl){
    var modalContentEl = nodes.modal.contentEl;

    return modalContentEl.children.length === 1 || ( modal.containsModality() && modalContentEl.lastChild.src.split('//')[1] !== modalityUrl.split('//')[1] );
}

module.exports = {
    handleResize: handleResize,
    handleModality: handleModality
};