define([
    'jquery',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/popup/graph.popup'
], function($, config, helpers, popup){

    function positionText(nodes){
        var transition = nodes
            .transition('moveText')
            .ease('quad-out')
            .duration(500);

        transition.each(function(d){
            var nucleus   = helpers.getSelectedGroup(d).nucleus,
                node      = d3.select(this),
                nodeTrans = node.transition(), // Inherit parent transition
                pos;

            d.angle = Math.PI + Math.atan2(nucleus.y - d.y, nucleus.x - d.x);
            pos = helpers.getTextPosition(node, d);

            nodeTrans
                .selectAll('g.textGroup')
                    .attr('transform', function(){
                        return 'translate(' + pos.x + ' ' + pos.y +  ')';
                    });
        });
    }

    function repositionNodes(nodes, nucleus, duration){
        var _duration = duration || config.duration;

        var dfd = $.Deferred(),
            nucleusTransition = nucleus ? nucleus.transition('reposition').duration(_duration) : false,
            finalTransition   = nodes.transition('reposition').duration(_duration);

        if(nucleusTransition){
            nucleusTransition
                .attr('transform', function(d){
                    return 'translate(' + d.x + ',' + d.y + ')';
                });
        }

        finalTransition
            .attr('transform', function(d){
                return 'translate(' + d.x + ',' + d.y + ')';
            });

        helpers.transitionHandler(finalTransition, {
            onStart: dfd.notify,
            onEnd: dfd.resolve
        });

        return {
            id: 'repositionNodes',
            dfd: dfd.promise()
        };
    }

    function repositionLinks(links, duration){
        var dfd = $.Deferred(),
            finalTransition = links.transition('reposition').duration(duration || config.duration);

        finalTransition
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
            });

        helpers.transitionHandler(finalTransition, {
            onStart: dfd.notify,
            onEnd: dfd.resolve
        });

        return {
            id: 'repositionLinks',
            dfd: dfd.promise()
        };
    }

    function reposition(group, duration){
        return [
            repositionNodes(group.nodes, group.nucleus, duration),
            repositionLinks(group.links, duration)
        ];
    }

    return {
        text: positionText,
        nodes: repositionNodes,
        links: repositionLinks,
        all: reposition
    };
});