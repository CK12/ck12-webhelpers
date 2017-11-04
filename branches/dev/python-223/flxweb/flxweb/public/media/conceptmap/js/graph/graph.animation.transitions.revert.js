define([
    'd3',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/popup/graph.popup'
], function(d3, config, elements, data, helpers, events, popup){
    'use strict';

    var duration = config.duration;

    function revert(datum, index, args){
        args = args || {};

        var dfd  = $.Deferred(),
            node = (args.elements || elements).nodes,
            transitions = [],
            transitionDfds;

        node.call(events.unbind);

        (function startTransitions() {
            transitions.push(collapseNodesToNucleus(node, datum, args.softReset));
            transitions.push(collapseLinksToNucleus(args));

            if(!args.sameNucleus){
                transitions.push(revertNucleusToPreviousGroup(node, datum, args.softReset));
            }
        })();

        transitionDfds = transitions.map(function(transition){
            return transition.dfd;
        });

        $.when.apply(null, transitionDfds).done(function(){

            if(typeof args.cb === 'function'){
                args.cb();
            } else {
                node.call(events.bind, function(node){
                    node.style('pointer-events', function(d) {
                        return helpers.isActive(d) ? 'all' : 'none';
                    });

                    node.call(popup.setText)
                    .call(popup.position);
                });

                helpers.moveGroupToFront(args);

                // Prevents nodes jumping on force ticks when dragging
                node.call(helpers.syncNodeDataToCurrentPosition);
            }

            dfd.resolve();
        });

        return {
            transitions: transitions,
            dfd: dfd
        };
    }

    function revertNucleusToPreviousGroup(node, datum, isSoftReset) {
        var dfd = $.Deferred();

        var firstTransition  = node.transition('first').duration(duration),
            secondTransition = firstTransition.transition('second').duration(duration),
            finalTransition  = secondTransition.delay(duration).transition('third');

        firstTransition
            .select('circle.detail')
                .attr('r', function(d) {
                    return helpers.radius(d) * 2 + 6;
                });

        firstTransition
            .selectAll('.detail, .popup')
                .style('opacity', 0);

        secondTransition
            .select('circle.main')
                .style('fill', function(d) {
                    return helpers.isActive(d) ? helpers.getColor(d) : this.style.fill;
                })
                .attr('r',  helpers.radius);

        secondTransition
            .select('circle.shadow')
                .style('opacity', function(d) {
                    return helpers.isActive(d) ? config.nodes.active.opacity.shadow : config.nodes.inactive.opacity.shadow;
                })
                .attr('r', helpers.radius);

        secondTransition
            .select('image')
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
                })
                .style('opacity', function(d) {
                    return helpers.isNucleus(d) ? 1 : config.nodes.inactive.opacity.image;
                });

        secondTransition
            .select('text.main')
                .style('opacity', function(d) {
                    return helpers.isActive(d) ? 1 : config.nodes.inactive.opacity.text;
                })
                .style('font-weight', function(d) {
                    return helpers.isNucleus(d) ? 'bold' : 'normal';
                });

        secondTransition
            .filter(function(d){
                return helpers.isActive(d) && helpers.isNode(d);
            })
            .selectAll('g.textGroup')
                .attr('transform', function(d){
                    return 'translate(' + helpers.textPositionX(d) + ' ' + helpers.textPositionY(d) + ')'
                });

        if(!isSoftReset){
            finalTransition
                .attr('transform', function(d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });
        }

        helpers.transitionHandler(finalTransition, {
            onStart: dfd.notify,
            onEnd: dfd.resolve
        });
        return {
            id: 'revertNucleus',
            dfd: dfd.promise()
        };
    }

    function collapseNodesToNucleus(node, datum) {
        var dfd = $.Deferred();

        var nodeExit = node.exit(),
            finalTransition = nodeExit.transition('collapseIn').duration(function(d) {
                return d.cardinality * config.quick;
            })
            .transition('revertNodesFinal').duration(duration * 0.8);

        nodeExit.call(events.unbind);

        finalTransition
            .attr('transform', 'translate(' + datum.px + ',' + datum.py + ')')
            .remove();

        finalTransition.select('rect.backplate')
            .style('pointer-events', 'none');

        finalTransition.select('circle.main')
            .style('fill-opacity', 0)
            .attr('r', 0);

        finalTransition.select('circle.shadow')
            .style('opacity', 0)
            .attr('r', 0);

        finalTransition.selectAll('text')
            .style('fill-opacity', 0);

        finalTransition.select('text.main')
            .style('opacity', 0);

        finalTransition.select('image')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', 0)
            .attr('width', 0)
            .style('opacity', 0);

        // editor Specific

        finalTransition.selectAll('.popup')
            .style('opacity', 0);

        finalTransition.selectAll('g.removeButton')
            .style('opacity', 0);

        finalTransition.selectAll('.addLabel')
            .style('opacity', 0);

        // End editor Specific

        helpers.transitionFinished(finalTransition, dfd.resolve);
        return {
            id: 'collapseNodes',
            dfd: dfd.promise()
        };
    }

    function collapseLinksToNucleus(args) {
        var dfd = $.Deferred();

        var link = (args.elements || elements).links;

        var firstTransition = link.transition().duration(duration * 2).transition().duration(duration),
            finalTransition = link.exit().transition().duration(function(d) {
                return d.target.cardinality * config.quick;
            })
            .transition().duration(duration * 0.8);

        firstTransition
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
                return helpers.isActive(d.target) ? 1 : 0.5;
            });

        finalTransition
            .attr('x2', function() {
                return d3.select(this).attr('x1');
            })
            .attr('y2', function() {
                return d3.select(this).attr('y1');
            })
            .style('stroke-opacity', 0)
            .remove();

        helpers.transitionFinished(finalTransition, dfd.resolve);
        return {
            id: 'collapseLinks',
            dfd: dfd.promise()
        };
    }

    return {
        revert: revert
    };
});
