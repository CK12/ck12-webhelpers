define([
    'jquery',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/editor/editor.events',
    'conceptmap/editor/editor.elements'
], function($, config, helpers, editorEvents, editorElements){
    'use strict';

    function expandInAddButton() {
        var dfd = $.Deferred();

        var addButtonData = helpers.getData('editorAddButton'),
            nucleus, finalPos, addButton, finalTransition;

        // --- Mock Add Button Force

        // Allow force to run so that we know where the add button's
        // final position will be
        editorEvents.addButtonForce.friction(0.01)
        editorEvents.addButtonForce.start();


        // Allow tick to final position
        var k = 0;
        while ((editorEvents.addButtonForce.alpha() >= 0) && (k < 100)) {
            editorEvents.addButtonForce.tick();
            ++k;
        }

        editorEvents.addButtonForce.stop();
        editorEvents.addButtonForce.friction(0.3); // Reset friction back


        // --- Setup animation
        nucleus = addButtonData.dataset.graph.nodes.filter(helpers.isNucleus)[0];

        finalPos = addButtonData.dataset.graph.nodes
            .filter(helpers.isNode)[0];


        finalPos = {
            x: finalPos.x,
            y: finalPos.y
        };

        addButton = addButtonData.elements.nodes
            .filter(helpers.isNode)
                .attr('transform', function(){
                    return 'translate(' + nucleus.x + ' ' + nucleus.y + ')scale(0)';
                });

        addButtonData.elements.links
            .attr('x2', function(d) {
                return d.source.x;
            })
            .attr('y2', function(d) {
                return d.source.y;
            });


        // --- Begin animation
        finalTransition = editorElements.container.transition().duration(1000);

        finalTransition
            .selectAll('.addButtonNode')
            .filter(helpers.isNode)
                .attr('transform', function(){
                    return 'translate(' + finalPos.x + ' ' + finalPos.y + ')scale(1)';
                });

        finalTransition
            .selectAll('.addButtonLink')
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
                .style('stroke-opacity', 1);

        helpers.transitionFinished(finalTransition, dfd.resolve);
        return dfd.promise();
    }

    return {
        expandInAddButton: expandInAddButton
    };
});
