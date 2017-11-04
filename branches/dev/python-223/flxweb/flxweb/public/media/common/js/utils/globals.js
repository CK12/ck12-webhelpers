/***************************************
 * Any global js function to be exposed
 * accross the apps ( FBS, auth) can be
 * defined here.
 * NOTE:
 * This file should only contain pure JS
 * functions only.
 ***************************************/
// define waitSeconds above require script tag
// to override the default, until main.js loads
// Needed since, main.js (combined) includes require.config
// and results in timeout issues on slower networks
// window.require = {
//     waitSeconds: 90
// };


/**
 * isWebView checks for useragent against a predefined
 * list of regular expressions for webviews e.g Windows
 * webview, android webview.
 */
window.isWebView = function() {
    'use strict';

    var re, i, useragentsregex = ['MSAppHost', 'CriOS', 'Edge'];
    for (i = 0; i < useragentsregex.length; i++) {
        re = new RegExp(useragentsregex[i]);
        if (re.exec(navigator.userAgent) !== null) {
            return true;
        }
    }
    return false;
};
