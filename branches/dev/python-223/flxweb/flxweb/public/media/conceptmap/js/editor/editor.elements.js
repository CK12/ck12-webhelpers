define(['d3', 'jquery'], function(d3, $){
    'use strict';


    return {
        svg: null,
        container: null,
        links: null,
        nodes: null,
        groups: [],
        search: d3.select('#editor-search-widget'),
        $widget: $('.editor-widget'),

        addButton: {
            links: null,
            nodes: null,
            groups: []
        }
    };
});