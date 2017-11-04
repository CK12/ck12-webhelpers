'use strict';

// http://davidwalsh.name/add-rules-stylesheets
function createStyleSheet (doc) {
    doc = doc || document;

    var style = doc.createElement('style');
    // WebKit hack :(
    style.appendChild(doc.createTextNode(''));
    doc.head.appendChild(style);

    return style.sheet;
}

module.exports = {
    create: createStyleSheet
};