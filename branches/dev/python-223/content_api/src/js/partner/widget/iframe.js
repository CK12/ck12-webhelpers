'use strict';

var globals  = require('../shared/global'),
    modality = require('../modality/modality'),
    message  = require('./messageHandler');

function createIframeElement(config) {
    var iframe  = document.createElement('iframe'),
        align,
        vAlign  = 'top',
        hAlign  = 'right',
        vOffset = 20,
        hOffset = 20,
        parent  = config.parent ? document.querySelector( config.parent ) : document.body,
        src;

    src = globals.host + '/widget.html?' +
          '&utm_medium=content-api' +
          '&title=' + document.title + '&url=' + encodeURIComponent(globals.data.sourceUrl);

    if(config.align || config.x || config.y){
        align = config.align ? config.align.split(' ') : ['top', 'right'];
        if(align[0] === 'top' || align[0] === 'bottom') {
            vAlign = align[0];
            hAlign = align[1];
        } else {
            vAlign = align[1];
            hAlign = align[0];
        }

        if(config.x) { hOffset = config.x; }
        if(config.y) { vOffset = config.y; }
    }
    iframe.id = config.id || 'ck-12-bookmarklet';
    iframe.className = config.class || '';
    // Initial height is 170px. Resize events handle iframe size later on
    iframe.height = 175;
    iframe.width = 246;
    iframe.src = src;
    iframe.style.position = config.position || 'fixed';
    iframe.style[vAlign] = vOffset + 'px';
    iframe.style[hAlign] = hOffset + 'px';
    iframe.style.zIndex = config.zIndex || 999;
    iframe.style.border = '0px';

    parent.appendChild(iframe);
    return iframe;
}

function sendWidgetMessage(config, iframe){
    // Give time for the iframe to load
    setTimeout(function () {
        iframe.contentWindow.postMessage( config, globals.host );
    }, 1000);
}

function init (config) {
    var iframe = createIframeElement(config.userConfig);

    globals.widgets.push(iframe);
    config.widgetNum = globals.widgets.length;

    // Allow to receive messages back from the widget iframe
    // Only bind once.
    if(config.widgetNum === 1) { window.addEventListener('message', message.receiveHandler, false); }
    sendWidgetMessage(config, iframe);
}

module.exports = {
    create: init
};
