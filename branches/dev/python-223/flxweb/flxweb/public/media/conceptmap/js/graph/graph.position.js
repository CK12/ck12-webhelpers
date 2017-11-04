define([
    'conceptmap/graph/graph.config',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.data'
], function(config, helpers, data){
    'use strict';

    function startPosition(d, args) {
        args = args || {};
        var dataset = args.dataset || data;

        var coords = args.coords || helpers.getCenterCoords(args);

        var x = dataset.groups[0].nucleus.x = dataset.groups[0].nucleus.px = coords.x;
        var y = dataset.groups[0].nucleus.y = dataset.groups[0].nucleus.py = coords.y;

        var nodes = dataset.groups[0].nodes;
        for (var j = 0; j < nodes.length; j++) {
            var angle = 2 * (1 + j) * Math.PI / nodes.length;
            nodes[j].x = nodes[j].px = x + config.nodes.linkLength * Math.cos(angle);
            nodes[j].y = nodes[j].py = y + config.nodes.linkLength * Math.sin(angle);
            nodes[j].angle = angle;
        }
    }

    function expandPosition(d, args) {
        args = args || {};
        var dataset = args.dataset || data;

        var center = helpers.getPreviousGroup().nucleus,
            angle  = Math.PI + Math.atan2(center.y - d.y, center.x - d.x);

        var distance = Math.sqrt(Math.pow(center.y - d.y, 2) + Math.pow(center.x - d.x, 2));
        distance = (distance < config.nodes.linkLength * 2 ? config.nodes.linkLength * 4 : distance);

        var x = (center.x + distance * Math.cos(angle)),
            y = (center.y + distance * Math.sin(angle));

        d.x = d.px = x;
        d.y = d.py = y;

        d.angle = angle;

        var nodes = dataset.groups[dataset.groups.length - 1].nodes;
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].x = nodes[i].px = d.x + config.nodes.linkLength * Math.cos(angle - Math.PI + 2 * (1 + i) * Math.PI / (nodes.length + 1));
            nodes[i].y = nodes[i].py = d.y + config.nodes.linkLength * Math.sin(angle - Math.PI + 2 * (1 + i) * Math.PI / (nodes.length + 1));
            nodes[i].angle = angle - Math.PI + 2 * (1 + i) * Math.PI / (nodes.length + 1);
            nodes[i].fixed = true;
        }
    }

    function collapsePosition(d) {
        var group = helpers.getCurrentGroup(d),
            nucleus = group ? group.nucleus : d,
            angle = Math.PI + Math.atan2(nucleus.y - d.y, nucleus.x - d.x);

        d.x = nucleus.x + config.nodes.linkLength * Math.cos(angle);
        d.y = nucleus.y + config.nodes.linkLength * Math.sin(angle);
        d.angle = angle;
    }

    function collapseNode(d) {
        var group = helpers.getCurrentGroup(d),
            nucleus = group ? group.nucleus : d;

        d.x = d.px = nucleus.x;
        d.y = d.py = nucleus.y;
    }

    return {
        start: startPosition,
        expand: expandPosition,
        collapse: collapsePosition,
        collapseNode: collapseNode,
    };
});
