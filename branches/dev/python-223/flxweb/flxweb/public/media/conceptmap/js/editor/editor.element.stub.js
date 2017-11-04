define([
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.force.factory',
    'conceptmap/editor/editor.elements',
    'conceptmap/editor/editor.events'
], function(config, helpers, animation, ForceFactory, editorElements, editorEvents){

    function addRemoveButton() {
        var diameter = 24;

        var removeButton = editorElements.nodes
            .append('g')
                .attr('class', 'removeButton')
                .attr('transform', 'translate(0, ' + (-diameter) + ')')
                .style('visibility', function(d){
                    return helpers.isNucleus(d) ? 'hidden' : 'visible';
                })
                .style('pointer-events', function(d){
                    return helpers.isNucleus(d) ? 'none' : null;
                })
                .style('opacity', 0);

        removeButton.append('circle')
            .attr({
                fill: config.colors.fuscousGray,
                cx: diameter / 2,
                cy: diameter / 2,
                r:  diameter / 2
            });

        removeButton.append('path')
            .attr({
                d: 'M6.75 6.75l10.607 10.607m0-10.607L6.75 17.357',
                stroke: config.colors.white,
                strokeWidth: 2
            });

        return removeButton;
    }

    function createAddLabel(d) {
        var nodes;

        if(d instanceof Array){
            nodes = d;
        } else {
            nodes = editorElements.nodes.filter(function(_d){
                return d === _d;
            });
        }

        nodes.each(function(){
            var textMain     = d3.select(this).select('text.main').node();

            var documentFragment = document.createDocumentFragment(),
                fragment         = d3.select(documentFragment);

            fragment.append('svg:rect')
                .classed('addLabel', true)
                .attr({
                    x: 0,
                    y: -50,
                    rx: 5,
                    ry: 5,
                    width: 60,
                    height: 24
                });

            fragment.append('svg:text')
                .classed('addLabel', true)
                .attr({
                    x: 6,
                    y: 0,
                    dy: '-33px'
                })
                .style('font-size', 16)
                .text('Added');

            textMain.parentNode.insertBefore(documentFragment, textMain);
        });

    }

    function createAddButton(){
        var nucleus       = helpers.getCurrentNucleus(helpers.getData('editor')),
            addButtonData = helpers.getData('editorAddButton');

        (function setUpData() {
            resetAddButton();

            addButtonData.dataset.graph.nodes.push(nucleus);
            addButtonData.dataset.nuclei.push(nucleus);

            addButtonData.dataset.graph.nodes.push(helpers.extend(
                {
                    x: nucleus.x,
                    y: nucleus.y,
                    group: 0,
                    parentGroup: 0,
                    radius: 50,
                    maxTextWidth: 15
                },
                addButtonData
            ));

            addButtonData.dataset.graph.links.push({
                source: 0,
                target: 1
            });

            addButtonData.dataset.groups = [{
                links: [addButtonData.dataset.graph.links[0]],
                nodes: [addButtonData.dataset.graph.nodes[0]],
                nucleus: addButtonData.dataset.nuclei[0]
            }];

            helpers.syncData(addButtonData);
            editorEvents.addButtonForce.sync();
        })();


        // Stub elements in
        addButtonData.elements.links
              .enter().append('line')
                .attr('class', 'addButtonLink link')
                .style({
                    stroke: config.colors.mountainMeadow,
                    'stroke-width': 2,
                    'stroke-dasharray': '5, 5',
                    'stroke-opacity': 0
                });

        var g = addButtonData.elements.nodes
            .enter().append('g')
                .attr('class', 'addButtonNode node')
                .attr('transform', function(){
                    return 'translate(' + nucleus.x + ' ' + nucleus.y + ')scale(0)';
                })
                .style('visibility', function(d){
                    return helpers.isNucleus(d) ? 'hidden' : 0;
                })
                .style('pointer-events', function(d){
                    return helpers.isNucleus(d) ? 'none' : 'all';
                })
                .call(editorEvents.addButtonForce.drag);

        g.append('circle')
            .attr('r', 50)
            .style({
                stroke: config.colors.mountainMeadow,
                'fill': config.colors.harp,
                'stroke-width': 2,
                'stroke-dasharray': '5, 5'
            });

        g.append('path')
            .attr('fill', config.colors.mountainMeadow)
            .attr('transform', 'translate(-20, -20)') // Add symbol dimensions are 40 x 40
            .attr('d', 'M25,15 L25,1.25 C25,0.56 24.44,0 23.75,0 L16.25,0 C15.56,0 15,0.56 15,1.25 L15,15 L1.25,15 C0.56,15 0,15.56 0,16.25 L0,23.75 C0,24.44 0.56,25 1.25,25 L15,25 L15,38.75 C15,39.44 15.56,40 16.25,40 L23.75,40 C24.44,40 25,39.44 25,38.75 L25,25 L38.75,25 C39.44,25 40,24.44 40,23.75 L40,16.25 C40,15.56 39.44,15 38.75,15 L25,15 Z');

        var textGroup = g.append('g').classed('textGroup', true),
            text      = textGroup.append('text');

        var tspan = text.append('tspan')
            .classed('addButtonText', true)
                .attr({
                    fill: config.colors.mountainMeadow
                })
                .style({
                    'font-size': '24px',
                    'font-weight': 'bold',
                    opacity: 0
                });

        if(!helpers.isMicrosoftBrowser){
            // Causes the page to refresh in Edge for some reason...
            tspan.text('Add');
        }


        // TODO Remove needing a subjectText tspan dependency
        text.append('tspan')
            .classed('subjectText', true)
                .attr('dy', '0em');

        return g;
    }

    function resetAddButton(){
        var addButtonData = helpers.getData('editorAddButton'),
            dataset       = addButtonData.dataset,
            elements      = addButtonData.elements;


        dataset.nuclei = [];
        dataset.graph = {
            nodes: [],
            links: []
        };
        dataset.groups = [];

        if(elements.links){
            elements.links.exit().remove();
        }
        if(elements.nodes){
            elements.nodes.exit().remove();
        }

        elements.links = editorElements.container.selectAll('.addButtonLink');
        elements.nodes = editorElements.container.selectAll('.addButtonNode');

        elements.groups = [];
    }


    return {
        addRemoveButton: addRemoveButton,
        createAddButton: createAddButton,
        createAddLabel: createAddLabel
    };
});