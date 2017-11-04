define([
    'd3',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/filter'
], function(d3, data, config, helpers){

    function nodes(node, args){
        var group = node.enter().append('g')
            .attr('class', 'node')
            .style('pointer-events', function(d) {
                return helpers.isActive(d) ? 'all' : 'none';
            });

        group.append('rect')
            .attr('class', 'backplate');

        ////////////
        // Circle //
        ////////////

        group.append('circle')
            .attr('class', 'shadow')
            .attr('r', 0)
            .attr('cx', 5)
            .attr('cy', 5)
            .style('opacity', 0)
            .style('fill', 'rgba(0,0,0,0.3)')
            .style('transform', 'scale(1)');

        group.append('circle')
            .attr('class', 'main')
            .attr('r', 0)
            .style('cursor', 'pointer')
            .style('fill', helpers.getColor)
            .style('fill-opacity', 0)
            .attr('transform', 'scale(1)')
                .each(helpers.radius);     // Set the radius that the node will eventually use
                        // This is mostly for text wrapping ahead of time

        group.append('image')
            .attr('xlink:href', '/media/conceptmap/images/circle-texture.svg')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', 0)
            .attr('width', 0)
            .style('opacity', 0);

        /////////////
        // Details //
        /////////////

        group.append('circle')
            .attr('class', 'detail')
            .attr('r', function(d) {
                return helpers.radius(d) * 2 + 6;
            })
            .style('stroke', config.colors.persianGreen)
            .style('stroke-width', 6)
            .style('stroke-linecap', 'round')
            .style('stroke-dasharray', '15, 15')
            .style('fill', 'none')
            .style('stroke-opacity', 0.7)
            .style('opacity', 0)
            .style('cursor', 'pointer');

        group.append('text')
            .attr('class', 'detail')
            .attr('y', '0.35em')
            .style('font-weight', 'bold')
            .style('fill', config.colors.persianGreen)
            .style('fill-opacity', 0.7)
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .text(config.nodes.text.detail.open);

        //////////
        // Text //
        //////////

        var textGroup = group.append('g')
            .classed('textGroup', true);

        var text = textGroup.append('text')
            .attr('class', 'main')
            .attr('text-anchor', 'start')
            .style('font-weight', function(d) {
                return helpers.isNucleus(d) ? 'bold' : 'normal';
            })
            .style('font-size', function(d) {
                return (helpers.isNucleus(d) ? config.fontSize * 1.1 : config.fontSize) + 'px';
            })
            .text(function(d){ return d.name; })
            .call(function(d){
                helpers.wrapTextDownwards(d, null, {x: true, y: true}, args);
            });

        // Concept text is created by our wrapping method.
        // We need to set the attributes/styles seperately
        text.selectAll('tspan.conceptText')
            .attr('text-anchor', 'start')
            .style('fill-opacity', 0);

        text.append('tspan')
            .attr('text-anchor', 'start')
            .attr('class', 'subjectText')
            .attr('x', function(){
                return this.previousElementSibling.getAttribute('x');
            })
            .attr('y', function(){
                return this.previousElementSibling.getAttribute('y');
            })
            .attr('dy', function(){
                var prevDy = this.previousElementSibling.getAttribute('dy'),
                    newDy  = parseFloat( prevDy.slice(0, -2) );

                return (newDy + config.lineHeight.subject) + 'em';
            })
            .text(function(d) {
                return helpers.getSubject(d.EID);
            })
            .style('fill-opacity', 0);


        ///////////
        // Popup //
        ///////////

        textGroup.append('polygon')
            .attr('class', 'popup')
            .attr('points', '0,0 80,0 80,25 10,25 10,10')
            .style('fill', config.colors.persianGreen)
            .style('opacity', 0)
            .style('stroke', config.colors.persianGreen)
            .style('stroke-width', 0);

        textGroup.append('text')
            .attr('class', 'popup')
            .attr('y', '1.1em')
            .attr('x', '2.9em')
            .style('opacity', 0)
            .style('fill', 'white')
            .text(config.nodes.text.popup.open);

        return group;
    }

    function links(link) {
        var linksEnter = link.enter()
            .insert('line', '.node')
            .attr('class', 'link')
            .attr('x1', function(d) {
                return d.source.x;
            })
            .attr('y1', function(d) {
                return d.source.y;
            })
            .attr('x2', function(d) {
                return d.source.x;
            })
            .attr('y2', function(d) {
                return d.source.y;
            })
            .style('stroke', config.colors.westar)
            .style('stroke-opacity', 0)
            .style('stroke-width', 3)
            .style('stroke-linecap', 'round')
            .style('stroke-dasharray', '20, 0'); //Appears as solid line

        return linksEnter;
    }


    return {
        nodes: nodes,
        links: links
    };
});