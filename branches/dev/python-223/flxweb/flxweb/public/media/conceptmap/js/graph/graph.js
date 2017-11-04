/* globals d3:false, $:false */

define([
    'd3',
    'jquery',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.initializer',
    'conceptmap/graph/graph.zeroState',
    'conceptmap/graph/graph.seo',
    'conceptmap/tutorial/tutorial',
    'conceptmap/filter',
    'conceptmap/editor/editor',
    'conceptmap/editor/editor.initializer',
], function(d3, $, elements, config, data, helpers, events, initializer, zeroState, seo, tutorial, filter, editor, editorInitializer) {
    'use strict';

    // Position fixed if touch device, otherwise double tap will scroll the page downwards
    if(helpers.isTouchDevice){
        elements.$contentWrapper.css({
            position: 'fixed',
            width: '100vw'
        });
    }

    function createPopup(){
        elements.popup = d3.select('#more-info-block')
            .data(function(){
                return [{
                    x: null,
                    y: null,
                    width: null,
                    height: null
                }];
            })
            .call(events.popupDrag);
    }

    function createSVG(){
        elements.svg = d3.select('.svg-container').append('svg')
            .attr('class', 'hide')
            .call(events.zoom);

        elements.svg
            .call(helpers.setViewBox);

        elements.svg.append('rect')
            .attr('width', config.width)
            .attr('height', config.height)
            .style('fill', 'none')
            .style('pointer-events', 'all');

        elements.container = elements.svg.append('g')
            .attr('id', 'allElements')
            // Set initial transform for firefox
            .attr('transform', 'translate(0,0)scale(1)');

        elements.links = elements.container.selectAll('.link');
        elements.nodes = elements.container.selectAll('.node');
    }

    (function createElements(){
        createSVG();
        createPopup();
    })();


    function init(){
        $.when(
            $.getJSON('/media/conceptmap/data/modalities.json'),
            $.getJSON('/media/conceptmap/data/subjects.json'),
            $.getJSON('/media/conceptmap/data/related.json')
        ).then(function( modalities, subjects, related ) {
            data.modalities = modalities[0];
            data.subjects   = subjects[0];
            data.related    = related[0];

            var params = helpers.getURLParams();

            // Fails will trigger a normal zero state
            // When either not a first time user or server issues
            // Without showing the tutorial
            tutorial.init().fail(function(){
                var isEID = helpers.isEID(params.eid);

                if(isEID && params.editor === 'true'){
                    initializer.searchState(params).done(function(){
                        seo.init(params);
                        editorInitializer.init();
                    });
                } else if(isEID){
                    initializer.searchState(params);
                    seo.init(params);
                } else {
                    zeroState.init(params.subject);
                }
            });


            var onResize = helpers.debounce(function winResize(){
                events.resizeSVG();
                tutorial.onResize();
            }, 500);

            // Add resizing event
            $(window).on('resize orientationchange', onResize);
        });
    }

    return {
        init: init
    };
});
