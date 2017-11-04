'use strict';

var modal      = require('../modal/modal'),
    stylesheet = require('../utils/dom.stylesheet'),
    nodes      = require('../shared/dom.nodes');

/**
 * creates the modality
 * @param  {String} src url for the iframe
 * @return {undefined}
 */
function createModality(src) {
    var iframe = document.createElement('iframe'),
        modalContentEl = nodes.modal.contentEl;

    iframe.src = src;
    iframe.height = window.innerHeight;

    if ( modal.containsModality() ) {
        modalContentEl.removeChild(modalContentEl.lastChild);
    }
    modalContentEl.appendChild(iframe);
}

module.exports = {
    create: createModality
};