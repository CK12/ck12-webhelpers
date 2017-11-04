/* globals d3:false */

define([
    'exports',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/popup/graph.popup',
    'conceptmap/graph/graph.data.constructor',
    'conceptmap/graph/graph.position',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.events',
    'conceptmap/filter'
], function(exports, config, data, helpers, elements, popup, constructor, position, animation, events, filter){
    'use strict';

////////////
// Expand //
////////////

    function expandGroup(d, i, args){
        args = args || helpers.getData();
        args.currentNucleus = args.currentNucleus || helpers.getCurrentNucleus();

        var positionType = args.positionType || 'expand',
            groupIndex   = args.isSameNucleus ? helpers.getGroup(d, args) : false,
            force        = args.force || events.force,
            transitions;

        if(typeof args.dataConstructor === 'function'){
            args.dataConstructor(args);
        } else {
            constructor.construct(d, args);
            d.fixed = true;
        }
        position[positionType](d, args);

        force.sync();

        force.setFixedState(true);

        helpers.syncData(args);

        transitions = animateExpand(i, args)
        helpers.syncElementsToGroup(groupIndex, args);

        if(!args.skipShift){
            // Reset scale to 1 when on initial nucleus
            if(args.firstNucleus || args.dataType === 'editor'){ args.scale = 1; }
            shiftGraph(args);
        }

        helpers.addFilterToGroup(filter.currentValue());

        return transitions;
    }

////////////
// Revert //
////////////

    function revertGroup(d, i){
        var animationRevert;

        constructor.collapse();
        position.collapse(d);

        events.force.sync();
        d.fixed = true;

        helpers.syncData();

        animationRevert = helpers.getTransition(
            animation.revert(d, i).transitions,
            'revertNucleus'
        );

        animationRevert.dfd.progress(function(){
            filter.set(helpers.getCurrentGroup().filter);
            shiftGraph();
        });

        events.force.setFixedState(true);
    }

    function softRevert(d, i, cb){
        constructor.collapse(d, true);

        events.force.sync();
        d.fixed = true;

        helpers.syncData();
        animation.revert(d, i, {
            sameNucleus: true,
            softReset:   true
        }).dfd.done(cb);

        events.force.setFixedState(true);
    }

///////////
// Shift //
///////////

    function beginShiftGraph(args) {
        var dfd = $.Deferred();

        args = args || {};

        var els = args.els || elements;

        var nucleus   = helpers.getCurrentNucleus(args),
            transform = helpers.getTransform(els.container),
            scale, translate, duration;

        scale      = typeof args.scale === 'number' ? args.scale : transform.scale[0];
        translate  = [(config.width / 2 - nucleus.x * scale), (config.height / 2 - nucleus.y * scale)];

        duration = args.duration || config.duration;

        helpers.blockAnimations(duration);

        // reset zoom object positioning
        events.resetZoom(translate, scale);

        var centerGraph = els.container
            .transition('centerGraph').duration(duration)
                .attr('transform', 'translate(' + translate + ')' + 'scale(' + scale + ')');

        els.nodes
            .filter(function(d){
                return d === nucleus;
            })
            .transition('centerNucleus').duration(duration)
                .attr('transform', 'translate(' + nucleus.x + ' ' + nucleus.y + ')');

        helpers.transitionHandler(centerGraph, {
            onStart: dfd.notify,
            onEnd: dfd.resolve
        });

        return dfd.promise();
    }

///////////
// Proxy //
///////////

    function popupProxy(fn){
        var args = Array.prototype.slice.call(arguments, 1),
            self = this;

        if( helpers.isPopupOpen() ) {
            return popup.hide.call(self).done(function(){
                return fn.apply(self, args);
            });
        } else {
            return fn.apply(self, args);
        }
    }

    function animateExpand(index, isSameNucleus, _duration) {
        return popupProxy.call(this, animation.expand, index, isSameNucleus, _duration);
    }

    function shiftGraph(args){
        return popupProxy.call(this, beginShiftGraph, args);
    }

/////////////
// Exports //
/////////////

    exports.expand = expandGroup;

    exports.revert = revertGroup;
    exports.softRevert = softRevert;

    exports.centerGraph = beginShiftGraph;
});
