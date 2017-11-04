/* globals $:false d3:false */

define([
    'exports',
    'jquery',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.data.constructor',
    'conceptmap/graph/graph.transitions',
    'conceptmap/graph/graph.position',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.notification',
    'conceptmap/graph/graph.search',
    'conceptmap/filter',
    'conceptmap/editor/editor.widget'
], function(exports, $, elements, data, helpers, events, constructor, transition, position, animation, notification, graphSearch, filter, editorWidget){
    'use strict';

    var INITIALIZE_DURATION = 500;

    function init(eid) {
        var firstNucleus = helpers.isEID(eid) ? data.subjects[eid] : data.nuclei[0],
            isSameNucleus, currentNucleus;

        if(!firstNucleus){
            editorWidget.disableEditor();
            return noDataNotification();
        } else {
            editorWidget.enableEditor();
        }

        currentNucleus = helpers.getCurrentNucleus();
        isSameNucleus  = firstNucleus.EID === (currentNucleus && currentNucleus.EID);

        reset(isSameNucleus);

        transition.expand(firstNucleus, 0,
            helpers.extend({
                positionType: 'start',
                isSameNucleus: isSameNucleus,
                firstNucleus: true
            },
            helpers.getData()
        ));

        graphSearch.setConcept(helpers.getCurrentNucleus());
    }

    function reset(isSameNucleus) {
        data.nuclei = [];
        data.graph = {
            nodes: [],
            links: []
        };
        data.connectionStrength = {};
        data.groups = [];

        if(!isSameNucleus){
            elements.container.selectAll('*').remove();
        } else {
            elements.links.exit().remove();
            elements.nodes.exit().remove();
        }

        elements.links = elements.container.selectAll('.link');
        elements.nodes = elements.container.selectAll('.node');
        elements.groups = [];
    }

    function exitZeroState(eid){
        var dfd = $.Deferred();

        $('form.concept__search').css({
            'transform': ''
        });

        elements.$contentWrapper.removeClass('zeroState');

        filter.set('all');

        setTimeout(function(){
            init(eid);
            editorWidget.show();
            dfd.resolve();
        }, INITIALIZE_DURATION / 2);

        return dfd.promise();
    }

    function searchState(params){
        var dfd = $.Deferred();

        elements.$contentWrapper.removeClass('zeroState');

        elements.svg
            .attr('class', '');

        filter.set(params.filter || 'all');

        setTimeout(function(){
            hideLoading();
            init(params.eid);
            editorWidget.show();
            dfd.resolve();
        }, INITIALIZE_DURATION);

        return dfd.promise();
    }

    function hideLoading(){
        var $pageDisable = $('.page-disable'),
            $spinner = $('.spinner');

        $pageDisable.addClass('hide');
        $spinner.addClass('hide');
    }

    function noDataNotification(){
        notification.create({
            header: '<img src="/media/conceptmap/images/icon-telescope.svg">',
            body:   '<p>Oops! It looks like we don\'t have content for this yet.</p>' +
                    '<p>Try searching for a different concept.</p>',
            duration: Infinity
        });
    }

    exports.init = init;
    exports.exitZeroState = exitZeroState;
    exports.searchState = searchState;
    exports.hideLoading = hideLoading;

});
