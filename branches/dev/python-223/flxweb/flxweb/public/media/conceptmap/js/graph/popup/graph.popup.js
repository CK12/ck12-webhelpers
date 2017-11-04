/* globals d3:false $:false */

define([
    'd3',
    'jquery',
    'exports',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/popup/graph.popup.transitions',
    'conceptmap/graph/graph.logger'
], function(d3, $, exports, config, data, helpers, elements, events, popupTransitions, logger){
    'use strict';

    ///////////////
    // Translate //
    ///////////////

    function positionPopup(nodes) {
        nodes.selectAll('.popup')
            .attr('transform', function(d){
                var textLength, transY, transX;

                var node        = d3.select(this.parentNode),
                    subjectText = node.select('tspan.subjectText');

                var x  = 0,
                    y  = 0,
                    dy = +(subjectText.attr('dy').slice(0, -2));

                transX = x;
                transY = y + (dy * config.fontSize);

                if(helpers.isNucleus(d)){
                    textLength = subjectText.node().getComputedTextLength();
                    transX += textLength + 5;
                    transY -= config.fontSize / 2;
                } else {
                    transY += config.fontSize;
                }


                return 'translate(' + transX + ' ' + transY + ')';
            });

        return nodes;
    }

    function handlePopup(d, i, args){
        var textNode = d3.select(this.parentNode).select('text.popup'),
            text     = textNode.text();

        if(text === config.nodes.text.popup.open){
            popupTransitions.showPopup.call(this, d, i, args);
            textNode.style('opacity', 1);
            logger.nodeDetailsClick(d.EID);
        } else {
            popupTransitions.hidePopup.call(this, d, i, args);
        }
    }

    // This will hide the popup and then click to explore/revert on the same node
    function hideThenClick(d, i) {
        var self = this;
        popupTransitions.hidePopup.call(self, d, i).done(function(){
            events.click.call(self, d, i);
        });
    }

    function setNodeText(node) {
        node = (node || elements.nodes);

        node.select('text.detail')
            .text(function(d) {
                return helpers.isNucleus(d) ? config.nodes.text.detail.close : config.nodes.text.detail.open;
            });
    }

    exports.hideThenClick = hideThenClick;
    exports.handler = handlePopup;
    exports.position = positionPopup;
    exports.hide = popupTransitions.hidePopup;

    exports.setText = setNodeText;
});
