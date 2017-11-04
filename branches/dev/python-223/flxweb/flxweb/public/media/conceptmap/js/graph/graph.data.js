define(function(){
    'use strict';

    return {
        // Data sets
        modalities: null,
        related: null,
        subjects: null,

        graph: {
            nodes: [],
            links: []
        },
        nuclei: [],
        connectionStrength: {},
        groups: [],
        filter: 'All',
        zoomScale: 1 // Set to 1 as will be used initially
    };
});
