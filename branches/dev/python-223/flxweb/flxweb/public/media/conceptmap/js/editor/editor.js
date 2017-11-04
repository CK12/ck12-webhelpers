define([
    'jquery',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.events',
    'conceptmap/editor/editor.elements',
    'conceptmap/editor/editor.data',
    'conceptmap/editor/editor.events',
    'conceptmap/graph/graph.element.manager',
    'conceptmap/graph/graph.data.constructor',
    'conceptmap/graph/graph.transitions',
    'conceptmap/editor/editor.initializer',
    'conceptmap/editor/editor.widget',
    'conceptmap/editor/editor.navigation.view'
], function($, config, helpers, events, editorElements){
    'use strict';

    function createSVG(){
        editorElements.svg = d3.select('.svg-container').append('svg');

        editorElements.svg
            .call(helpers.setViewBox)
            .call(events.zoom);

        editorElements.svg.append('rect')
            .attr('width', config.width)
            .attr('height', config.height)
            .style('fill', 'none')
            .style('pointer-events', 'all');

        editorElements.container = editorElements.svg.append('g')
            .attr('id', 'editorElements')
            // Set initial transform for firefox
            .attr('transform', 'translate(0,0)scale(1)');


        editorElements.nodes = editorElements.container.selectAll('.node');
        editorElements.links = editorElements.container.selectAll('.link');
    }

    createSVG();
});