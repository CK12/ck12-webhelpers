'use strict';

var globals = require('../shared/global'),
    clone   = require('../utils/clone'),
    error   = require('../../sharedGlobal/utils/error');

function extend(config){
    var _clone = clone.object(globals.data),
        content;

    _clone.userConfig = config;

    if(config.conceptName){
        _clone.xhtml = config.conceptName;
        _clone.userConfig.mode = 'specified';
    } else {
        if(typeof config.content === 'string' || (config.content && config.content.nodeName)){
            if(config.content.nodeName) {
                content = config.content.innerHTML;
                config.content = content; // Set content to string as we do not want to send the node to the iframe during postMessage or we get a DataCloneError
            } else {
                content = document.querySelector(config.content);
                content = content.nodeName ? content.innerHTML : error.throw('No DOM node found for content');
            }
        } else {
            content = document.body.innerHTML;
        }
        // strip out script tags
        _clone.xhtml = stripScripts(content);
        _clone.userConfig.mode = 'auto';
    }

    return _clone;
}

function stripScripts(string) {
    var div = document.createElement('div'),
        scripts = div.getElementsByTagName('script'),
        i = scripts.length;

    div.innerHTML = string;

    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
    return div.innerHTML;
}

module.exports = {
    extend: extend
};