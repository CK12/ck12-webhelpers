define([
    'conceptmap/graph/graph.animation.effects',
    'conceptmap/graph/graph.animation.position',
    'conceptmap/graph/graph.animation.transitions.expand',
    'conceptmap/graph/graph.animation.transitions.revert'
], function(effects, position, expand, revert){
    'use strict';

    return {
        effects: effects,
        position: position,
        expand: expand.expand,
        revert: revert.revert
    };
});