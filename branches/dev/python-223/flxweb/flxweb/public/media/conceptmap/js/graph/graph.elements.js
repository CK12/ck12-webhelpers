define([
    'jquery'
], function($) {
    'use strict';
    return {
        popup: null,
        svg: null,
        container: null,
        links: null,
        nodes: null,
        groups: null,
        trendingSvg: null,
        trendingContainer: null,
        trendingNodes: null,
        $svgContainer: $('.svg-container'),
        $contentWrapper: $('#conceptmap-wrapper'),
        $overlay: $('.conceptmap__overlay')
    };
});
