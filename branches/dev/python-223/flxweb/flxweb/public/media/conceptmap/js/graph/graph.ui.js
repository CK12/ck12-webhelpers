/* globals $:false */

define([
    'exports',
    'conceptmap/filter',
    'conceptmap/graph/graph.search'
], function(exports, filter, graphSearch){
    'use strict';

    function disable() {
        filter.disable();
        graphSearch.disable();
    }

    function enable() {
        filter.enable();
        graphSearch.enable();
    }

    exports.disable = disable;
    exports.enable = enable;
});

