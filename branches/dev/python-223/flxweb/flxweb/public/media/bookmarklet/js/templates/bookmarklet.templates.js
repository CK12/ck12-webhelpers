define([
    'text!bookmarklet/templates/bookmarklet.login.html',
    'text!bookmarklet/templates/bookmarklet.resource.view.html',
    'text!bookmarklet/templates/bookmarklet.invalid.html',
    'text!bookmarklet/templates/bookmarklet.CK12.html'
], function (BLH, BRVH, BIH, BCH) {
    'use strict';
    return {
        'BOOKMARKLET_LOGIN': BLH,
        'BOOKMARKLET_RESOURCE_VIEW': BRVH,
        'BOOKMARKLET_INVALID': BIH,
        'BOOKMARKLET_CK12': BCH
    };
});