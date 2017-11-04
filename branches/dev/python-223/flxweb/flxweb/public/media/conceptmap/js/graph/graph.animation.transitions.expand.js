define([
    'jquery',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/popup/graph.popup',
    'conceptmap/graph/graph.element.stub',
    'conceptmap/graph/graph.animation.effects',
    'conceptmap/filter'
], function($, config, elements, data, events, helpers, popup, elementStub, animationEffects, filter){
    'use strict';

    var duration = config.duration;

    function expand(index, args) {
        var transitions = [];

        var els = args.elements || elements;

        var nodes          = els.nodes,
            links          = els.links,
            currentNucleus = d3.select(helpers.getCurrentNucleusNode(args)),
            groupEnter, linksEnter, transitionDfds;

        var transitionDuration = helpers.getNodeDuration(helpers.getCurrentNucleus(args), filter.currentValue()) + duration;

        helpers.blockAnimations(transitionDuration);

        nodes.call(events.unbind);

        currentNucleus.call(animationEffects.scaleDownNode, 300);

        (function startTransitions() {
            if(!args.isSameNucleus){
                transitions.push(moveNodeToNewPositionAsNucleus(nodes, args));
                transitions.push(moveLinkToNewPositionWithNucleus(links, args));
            }

            // Elements need to be made after initial transitions else they
            // become part of that same transition
            groupEnter = elementStub.nodes(nodes, args);
            linksEnter = elementStub.links(links);

            transitions.push(expandNodesOutwardsFromNucleus(groupEnter, index, args));
            transitions.push(expandLinksOutwardsFromNucleus(linksEnter, args));
        })();

        transitionDfds = transitions.map(function(transition){
            return transition.dfd;
        });

        // When all transitions finish
        $.when.apply(null, transitionDfds).done(function(){

            if(typeof args.cb === 'function'){
                args.cb();
            } else {
                nodes.call(events.bind);
            }

            nodes.call(helpers.syncGroupDimensions);
            groupEnter.call(helpers.syncGroupDimensions);

            groupEnter.call(popup.position);
            currentNucleus.call(popup.position);

            helpers.moveGroupToFront(args);
        });

        return transitions;
    }


    ////////////////
    // Reposition //
    ////////////////

    function moveNodeToNewPositionAsNucleus(node, args) {
        var dfd = $.Deferred();

        var firstTransition = node.transition('moveFirst').duration(duration / 2),
            finalTransition = node.transition('moveFinal').duration(duration);

        node.style('pointer-events', function(d) {
            return helpers.isActive(d) ? 'all' : 'none';
        });

        node.select('tspan.subjectText')
            .text(function(d) {
                return helpers.getSubject(d.EID);
            });

        firstTransition
            .selectAll('.popup, .detail')
                .style('opacity', 0);

        finalTransition
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            })
            .style('opacity', 1);

        finalTransition
            .select('circle.main')
                .style('fill', function(d) {
                    return helpers.isActive(d) ? helpers.getColor(d) : helpers.inactiveLighten(d);
                })
                .attr('r', helpers.radius);

        finalTransition
            .select('circle.shadow')
                .style('opacity', function(d) {
                    return helpers.isActive(d) ? config.nodes.active.opacity.shadow : config.nodes.inactive.opacity.shadow;
                })
                .attr('r', helpers.radius);

        finalTransition
            .select('circle.detail')
                .attr('r', function(d) {
                    return helpers.radius(d) * 2 + 6;
                });

        finalTransition.select('image')
            .style('opacity', function(d){
                return helpers.isNucleus(d) ? 1 : config.nodes.inactive.opacity.image;
            })
            .attr('x', function(d) {
                return -(helpers.radius(d));
            })
            .attr('y', function(d) {
                return -(helpers.radius(d));
            })
            .attr('height', function(d) {
                return 2 * (helpers.radius(d));
            })
            .attr('width', function(d) {
                return 2 * (helpers.radius(d));
            });

        finalTransition
            .filter(function(d){
                return helpers.isNucleus(d);
            })
            .selectAll('g.textGroup')
                .attr('transform', function(d){
                    return 'translate(' + helpers.textPositionX(d) + ' ' + helpers.textPositionY(d) + ')'
                });

        finalTransition.select('text.main')
            .style('font-weight', function(d) {
                return helpers.isNucleus(d) ? 'bold' : 'normal';
            })
            .style('font-size', function(d) {
                return (helpers.isNucleus(d) ? config.fontSize * 1.1 : config.fontSize) + 'px';
            })
            .style('opacity', function(d) {
                return helpers.isActive(d) ? 1 : config.nodes.inactive.opacity.text;
            });

        helpers.transitionFinished(finalTransition, dfd.resolve);
        return {
            id: 'moveNode',
            dfd: dfd.promise()
        };
    }

    function moveLinkToNewPositionWithNucleus(links){
        var dfd = $.Deferred();
        var finalLinkTransition = links
            .transition('moveFinal').delay(25).duration(duration);

        finalLinkTransition
            .attr('x1', function(d) {
                return d.source.x;
            })
            .attr('y1', function(d) {
                return d.source.y;
            })
            .attr('x2', function(d) {
                return d.target.x;
            })
            .attr('y2', function(d) {
                return d.target.y;
            })
            .style('stroke-opacity', function(d) {
                return helpers.isActive(d.target) ? 1 : config.nodes.inactive.opacity.link;
            });

        elements.links.exit().transition().duration(config.duration)
            .style('stroke-opacity', 0)
            .remove();

        helpers.transitionFinished(finalLinkTransition, dfd.resolve);
        return {
            id: 'moveLink',
            dfd: dfd.promise()
        };
    }

    ////////////
    // Expand //
    ////////////

    function expandNodesOutwardsFromNucleus(nodeEnter, index, args) {
        var dfd = $.Deferred();

        var _duration = typeof args.duration === 'number' ? args.duration : helpers.stagger;

        var currentNucleus  = helpers.getCurrentNucleus(args),
            firstTransition = nodeEnter.transition('expandFirst').duration(_duration),
            finalTransition = firstTransition.transition('expandFinal').duration(duration);

        firstTransition.select('circle.main')
            .style('fill-opacity', function(d, i) {
                return i === index ? 1 : 0;
            });

        firstTransition
            .attr('transform', 'translate(' + currentNucleus.x + ',' + currentNucleus.y + ')');

        finalTransition
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });

        finalTransition.selectAll('tspan.conceptText, tspan.subjectText')
            .style('fill-opacity', 1);

        finalTransition.select('circle.main')
            .style('fill', helpers.getColor)
            .style('fill-opacity', 1)
            .attr('r', function(d){
                return helpers.radius(d, null, args);
            });

        finalTransition.select('image')
            .attr('x', function(d) {
                return -helpers.radius(d, null, args);
            })
            .attr('y', function(d) {
                return -helpers.radius(d, null, args);
            })
            .attr('height', function(d) {
                return 2 * helpers.radius(d, null, args);
            })
            .attr('width', function(d) {
                return 2 * helpers.radius(d, null, args);
            })
            .style('opacity', function(d){
                return helpers.isNucleus(d) ? 1 : 0;
            });

        finalTransition.select('circle.shadow')
            .style('opacity', config.nodes.inactive.opacity.shadow)
            .attr('r', function(d){
                return helpers.radius(d, null, args);
            });

        helpers.transitionHandler(finalTransition, {
            onStart: dfd.notify,
            onEnd: dfd.resolve
        });

        return {
            id: 'expandNodes',
            dfd: dfd.promise()
        };
    }

    function expandLinksOutwardsFromNucleus(linksEnter, args){
        var dfd = $.Deferred();

        var _duration = typeof args.duration === 'number' ? args.duration : function(d) {
            return helpers.stagger(d.target, null, args);
        };

        var finalTransition = linksEnter
            .transition('linkStagger').duration(_duration)
            .transition('linkStaggerFinal').duration(duration);

        finalTransition
            .attr('x2', function(d) {
                return d.target.x;
            })
            .attr('y2', function(d) {
                return d.target.y;
            })
            .style('stroke-opacity', 1);

        helpers.transitionFinished(finalTransition, dfd.resolve);
        return {
            id: 'expandLinks',
            dfd: dfd.promise()
        };
    }

    return {
        expand: expand
    };
});
