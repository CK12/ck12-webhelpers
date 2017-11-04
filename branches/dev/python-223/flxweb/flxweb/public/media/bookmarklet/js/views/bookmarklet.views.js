define([
    'bookmarklet/views/bookmarklet.resource.view',
    'bookmarklet/views/bookmarklet.login.view',
    'bookmarklet/views/bookmarklet.ck12.view',
    'bookmarklet/views/bookmarklet.invalid.view'
],
function (resourceView, loginView, ck12View, invalidView) {
    'use strict';
    /**
    * A collection of all views used in Bookmarklet.
    */
    return {
        'resourceView': resourceView,
        'loginView': loginView,
        'ck12View': ck12View,
        'invalidView': invalidView
    };
});
