define([
    'd3',
    'conceptmap/graph/graph.initializer',
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.data',
    'conceptmap/graph/graph.elements',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.events',
    'conceptmap/graph/graph.animation',
    'conceptmap/graph/graph.shortnames'

], function(d3, initializer, config, data, elements, helpers, events, animation, shortnames) {
    'use strict';

    var DURATION    = config.duration,
        NODE_MARGIN = 15;

    function positionTitles(){
        var $searchBarTitles = $('.concept__titles');

        $searchBarTitles.css({
            top: config.height * 0.275
        });

        $searchBarTitles.removeClass('hide');
    }

    function wrapNodeText(nodes){
        var nodeTextWidth = getNodeWidth() - NODE_MARGIN;
        return helpers.wrapTextDownwards(nodes, nodeTextWidth);
    }

    function getX(i, args){
        var isLowerHalf = i <= args.midPoint;
        if(i === 0){ return args.centerX; }

        var x = isLowerHalf ? -(args.nodeWidth * i) : (args.nodeWidth * (i - args.midPoint));

        return x + args.centerX;
    }

    function getY(i, args){
        var isOdd       = i % 2 > 0,
            isLowerHalf = i <= args.midPoint;

        if(isLowerHalf){
            return isOdd ? args.nodeMinY : args.nodeMaxY;
        } else {
            return !isOdd ? args.nodeMinY : args.nodeMaxY;
        }
    }

    function getMinY(height) {
        return height * 0.425;
    }

    function getMaxY(height) {
        return height * 0.75;
    }

    function getRowWidth(winWidth){
        winWidth = winWidth || helpers.winWidth();
        return Math.min(winWidth, 1020); // 1020 max foundation row width
    }

    function getNodeWidth(rowWidth){
        rowWidth = rowWidth || getRowWidth();
        // Small screen sizes (>= 600px) need to stretch to the end of the screen
        // Otherwise the nodes run into another
        var minBreakpoint = Math.min.apply(null, config.widthBreakpoints),
            nodes         = rowWidth <= minBreakpoint ? Math.round(config.trending.numNodes / 2) : config.trending.numNodes;

        return rowWidth / nodes;
    }

    function positionNodes(nodes) {
        nodes = nodes || elements.trendingNodes;

        var height   = helpers.svgHeight(),
            winWidth = helpers.winWidth();

        var rowWidth   = getRowWidth(winWidth),
            numNodes   = config.trending.numNodes,
            nodeWidth  = getNodeWidth(rowWidth),
            nodeMinX   = Math.max(0, ((winWidth - rowWidth) / 2) ),
            nodeMinY   = getMinY(height),
            nodeMaxY   = getMaxY(height),
            centerX    = rowWidth / 2 + nodeMinX,
            midPoint   = Math.floor(numNodes / 2);

        var yArgs = {
            midPoint: midPoint,
            nodeMinY: nodeMinY,
            nodeMaxY: nodeMaxY
        };

        var xArgs = {
            midPoint: midPoint,
            centerX: centerX,
            nodeWidth: nodeWidth
        };

        nodes.each(function(d, i){
            var x = getX(i, xArgs),
                y = getY(i, yArgs);

            d3.select(this)
                .attr('transform', 'translate(' + x + ',' + y + ')' );
        });

    }

    ////////////////////////
    // NODE/DATA CREATION //
    ////////////////////////

    function createNodes(_data){
        var node = elements.trendingNodes;

        var nodeEnter = node.data(_data)
            .enter().append('g')
            .attr('class', 'node')
            .style('opacity', config.trending.defaultOpacity)
            .style('pointer-events', 'all')
            .call(positionNodes);

        nodeEnter.append('rect')
            .classed('backplate', true);

        nodeEnter.append('circle')
            .attr('class', 'shadow')
            .attr('cx', 5)
            .attr('cy', 5)
            .style('opacity', config.nodes.inactive.opacity.shadow)
            .style('fill', 'rgba(0,0,0,0.3)')
            .style('transform', 'scale(1)');

        nodeEnter.append('circle')
            .attr('class', 'main')
            .style('cursor', 'pointer')
            .style('fill', function(d) {
                return config.nodes.colors[helpers.getBranch(d.EID)][0];
            })
            .style('fill-opacity', 1)
            .style('transform', 'scale(1)');

        nodeEnter.append('image')
            .attr('xlink:href', '/media/conceptmap/images/circle-texture.svg');

        var textGroup = nodeEnter.append('g')
            .classed('textGroup', true);

        var text = textGroup.append('text')
            .attr('class', 'main')
            .attr('text-anchor', 'middle')
            .style('font-weight', 'normal')
            .style('font-size', config.fontSize + 'px')
            .attr('y', 100)
            .attr('dy', 0)
            .text(function(d){ return d.name; })
            .call(wrapNodeText);

        text.append('tspan')
            .attr('text-anchor', 'middle')
            .attr('class', 'subjectText')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', function(d){
                var numSiblings = $(this).siblings('tspan').length,
                    dy = (numSiblings * config.lineHeight.concept + (config.lineHeight.subject / 2));

                return dy + 'em';
            })
            .text(function(d) {
                return helpers.getSubject(d.EID);
            })
            .style('fill-opacity', 1);

        nodeEnter.append('circle')
            .attr('class', 'detail')
            .attr('r', function(d){
                return helpers.radius(d) + 15;
            })
            .style('stroke', config.colors.persianGreen)
            .style('stroke-width', 6)
            .style('stroke-linecap', 'round')
            .style('stroke-dasharray', '15, 15')
            .style('fill', 'none')
            .style('stroke-opacity', 0.7)
            .style('opacity', 0)
            .style('cursor', 'pointer');

        nodeEnter.append('text')
            .attr('class', 'detail')
            .attr('y', '0.35em')
            .style('font-weight', 'bold')
            .style('fill', config.colors.persianGreen)
            .style('fill-opacity', 0.7)
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .text(config.nodes.text.detail.open);

        nodeEnter.selectAll('text.main').call(animation.effects.fadeIn, DURATION * 2);
        nodeEnter.selectAll('circle:not(.detail)').call(animation.effects.growInCircle, DURATION);
        nodeEnter.selectAll('image').call(animation.effects.growInImage, DURATION);


        setTimeout(function(){
            nodeEnter
                .call(events.on.mouse)
                .call(events.on.clickTrending)
                .call(helpers.syncGroupDimensions);

            elements.trendingNodes = nodeEnter;

        }, DURATION * 2);
    }

    function createSVG(){
        var div = d3.select('.svg-container');

        elements.trendingSvg = div.append('svg');

        elements.trendingSvg.call(helpers.setViewBox);

        elements.trendingContainer = elements.trendingSvg.append('g')
            .attr('id', 'trendingElements')
            // Set initial transform for firefox
            .attr('transform', 'translate(0,0)scale(1)');

        elements.trendingNodes = elements.trendingContainer.selectAll('.node');
    }

    //////////////////////
    // DATASET CREATION //
    //////////////////////

    function createData(subject){
        var shortname = helpers.getShortnameBySubject(subject),
            list, sample;

        list = subject && shortname ? helpers.getRelatedByShortname(shortname) : _.pick(data.subjects, config.trending.defaults);
        sample = helpers.sampleSubjectsWithRelated(list);

        createNodes(sample);
    }

    function init(subject){
        createSVG();
        setTimeout(function(){ createData(subject); }, 250);
        positionTitles();
        initializer.hideLoading();
    }

    return {
        init: init,
        positionNodes: positionNodes

    };
});
