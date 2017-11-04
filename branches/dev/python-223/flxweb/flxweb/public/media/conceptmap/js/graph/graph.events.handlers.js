 /* globals d3:false */
define([
    'require',
    'exports',
    'd3',
    'conceptmap/graph/graph.events.bind',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.transitions',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.logger',
    'conceptmap/graph/graph.search'
], function(require, exports, d3, eventsBind, config, elements, data, helpers, transition, animation, logger, graphSearch){

    function click(d, i){
        if (d3.event && d3.event.defaultPrevented) { return; }
        if (d === data.nuclei[0] || (helpers.isNucleus(d) && data.nuclei[data.nuclei.length - 1] !== d)) { return; }

        if (helpers.isNucleus(d)) {
            transition.revert(d, i);
        } else {
            transition.expand(d, i);
        }

        logger.nodeClick(d.EID);
    }

    function clickTrending(){
        var currentGroup       = d3.select(this),
            transform          = helpers.getTransform(currentGroup),
            currentDatum       = currentGroup.datum(),
            center             = helpers.getCenterCoords(elements.trendingSvg.node()),
            nodeShrinkDuration = config.duration * 1.5;

        // Circular Dependency
        var initializer = require('conceptmap/graph/graph.initializer');

        // Begin changing UI
        initializer.exitZeroState(currentDatum.EID);

        // Unbind all events and add class differentiator
        currentGroup
            .attr('class', 'node no-hide')
            .call(eventsBind.off.mouse)
            .call(eventsBind.off.click);

        // Unbind all events from rest of g.nodes and fade out
        elements.trendingSvg.selectAll('.node:not(.no-hide)')
            .call(eventsBind.off.mouse)
            .call(eventsBind.off.click)
            .call(animation.effects.fadeOut, config.duration / 2, config.trending.defaultOpacity);

        // Translate to center of SVG
        transform.translate = [center.x, center.y];
        currentGroup
            .call(animation.effects.shrinkNodeToCenter, nodeShrinkDuration, transform);


        // Initially set the svg here to calculate text length for wrapping
        elements.svg
            .style('position', 'absolute')
            .attr('opacity', 0)
            .attr('class', '');

        setTimeout(function svgTransitionIllusion(){
            // Set main svg to absolute to appear over trending svg
            // And then finally remove positioning for proper UI events
            elements.svg
                .attr('opacity', 1)
                .style('z-index', 2)
                .transition().duration(config.duration / 2)
                .style('position', '')
                .style('z-index', '');

            // If we resize the window, d3 will put a transform on the container element for some reason
            // Ensure that it is overwritten and the container is left as is
            elements.container
                .attr('transform', 'translate(0,0)scale(1)');

            // Fade trending with opacity to prevent jarring
            // Then finally hide
            elements.trendingSvg
                .attr('opacity', 0)
                .transition().duration(config.duration / 2)
                .attr('class', 'hide');

        }, nodeShrinkDuration + 10); // Prevent animations from bleeding into another

        graphSearch.setConcept(currentDatum);
        logger.nodeClick(currentDatum.EID, 'landing_page');
    }

    function mouseenter(d, args) {
        args = args || {};

        var currentGroup          = d3.select(helpers.getParentGroup(this)),

            currentTransition     = currentGroup
                .transition('mouse').duration(config.duration / 2),

            currentTransitionFast = currentGroup
                .transition('mouseFast').duration(config.duration / 3);

        var dataset = (args && args.dataset) || data,
            evts    = (args && args.events)  || eventsBind;

        if(d.elements){
            d.elements.nodes.filter(function(){
                return d3.select(this).classed('isActive');
            }).each(function(){
                d3.select(this)
                    .call(mouseleave, null, args);
            });
        }

        // Unbind mouseenter else we end up with a mouseenter loop when
        // moving the group to the bottom with moveToFront
        currentGroup
            .call(evts.off.mouseenter)
            .classed('isActive', true);

        if(helpers.isAnimating()){ return; }

        currentTransition
            .attr('transform', helpers.changeScale);

        if(helpers.isTouchDevice){
            currentGroup.moveToFront();
        } else if(helpers.isNode(d) || helpers.isNucleus(d)){
            // Need to unbind mouseleave when moving to front
            // Otherwise it will fire a mouseleave prematurely
            currentGroup
                .call(evts.off.mouseleave)
                .moveToFront()
                .call(evts.on.mouseleave);
        }

        currentTransition
            .select('polygon.popup')
                .style('opacity', 1);

        currentTransition
            .select('text.popup')
                .style('opacity', 1);

        if (args.editor || d === dataset.nuclei[0] || (helpers.isNucleus(d) && !helpers.isCurrentNucleus(d))) { return; }

        currentTransition
            .select('text.detail')
                .text(function(_d){
                    return helpers.isNucleus(_d) ? config.nodes.text.detail.close : config.nodes.text.detail.open;
                })
                .style('opacity', function(_d){
                    var isFirstNucleus = _d === dataset.nuclei[0],
                        isEditor       = _d.editor;

                    return !isFirstNucleus && !isEditor ? 1 : 0;
                });

        currentTransitionFast
            .select('circle.main')
                .attr('transform', function(){
                    return  helpers.isZeroState() || helpers.isNucleus(d) ? 'scale(1)' : 'scale(1.75)';
                })
                .style('fill', function() {
                    return helpers.lighten(helpers.getColor(d), config.nodes.active.colorLighten);
                });

        currentTransitionFast
            .select('circle.shadow')
                .style('transform', function(){
                    return  helpers.isZeroState() || helpers.isNucleus(d) ? 'scale(1)' : 'scale(1.5)';
                })
                .style('opacity', config.nodes.active.opacity.shadow);

        if (helpers.isNucleus(d)) { return; }

        currentTransition
            .select('circle.detail')
                .style('opacity', 1);

    }

    function mouseleave(d, args) {
        var currentGroup      = d3.select(helpers.getParentGroup(this)),
            currentTransition = currentGroup
                .interrupt()
            .transition('mouse').duration(config.duration / 2);

        var evts = (args && args.events) || eventsBind;

        currentGroup
            .call(evts.on.mouseenter)
            .classed('isActive', false);

        if(helpers.isAnimating()){ return; }

        currentTransition
            .select('circle.detail')
                .style('opacity', 0);

        currentTransition
            .select('text.detail')
                .style('opacity', 0);

        currentTransition
            .select('circle.main')
                .attr('transform', 'scale(1)')
                .style('fill', helpers.getColor);

        currentTransition
            .select('circle.shadow')
                .style('transform', 'scale(1)')
                .style('opacity', config.nodes.inactive.opacity.shadow);

        currentTransition
            .select('polygon.popup')
                .style('opacity', 0);

        currentTransition
            .select('text.popup')
                .style('opacity', 0);

        if(!helpers.isPopupOpen()){
            currentTransition
                .attr('transform', helpers.revertScale);
        }

        helpers.moveNucleusToFront();
    }

    exports.click = click;
    exports.clickTrending = clickTrending;

    exports.mouseenter = mouseenter;
    exports.mouseleave = mouseleave;
});