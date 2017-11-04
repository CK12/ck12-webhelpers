
define([
    'exports',
    'conceptmap/graph/graph.data.manager',
    'conceptmap/graph/graph.data.constructor',
    'conceptmap/graph/graph.helpers',
    'conceptmap/graph/graph.config',
    'conceptmap/editor/editor.helpers',
    'conceptmap/editor/editor.session.manager'
], function(exports, dataManager, dataConstructor, helpers, config, editorHelpers, editorSessionManager){
    'use strict';

    function reconstruct(nucleusEid, eids, args) {
        var graphData = helpers.getData(args.dataType),
            conceptNucleus = dataManager.createNucleus( helpers.getConcept(nucleusEid), args);

        var removedEids = eids
            .filter(editorHelpers.isRemoved)
                .map(editorHelpers.getUnmodifiedEid);

        var addedEids = eids
            .filter(editorHelpers.isAdded)
                .map(editorHelpers.getUnmodifiedEid);

        var originalEids = eids.filter(function(eid){
            return !editorHelpers.isModified(eid);
        });

        if(!originalEids.length){
            originalEids = helpers.getRelated(nucleusEid);

            originalEids = dataConstructor.sortAllByRelevancy(originalEids)
                .map(function(related){
                    return related.EID;
                }).filter(function(eid){
                    // Check for removed
                    return removedEids.indexOf(eid) === -1;
                });
        }

        // Setup Concept
        var originalConcepts = originalEids.map(function(eid){
            return helpers.clone( helpers.getConcept(eid) );
        });

        var addedConcepts = addedEids
            // Ensure that added concepts are not an original
            .filter(function(eid){
                return originalEids.indexOf(eid) === -1;
            })
            .map(function(eid){
                var concept = helpers.clone( helpers.getConcept(eid) );
                concept.stateType = 'added';
                return concept;
            });

        var concepts = originalConcepts.concat(addedConcepts);

        graphData.dataset.nuclei.push(conceptNucleus);
        graphData.dataset.graph.nodes.push(conceptNucleus);

        var group = dataManager.createGroup(conceptNucleus);

        concepts.forEach(function(concept, i){
            dataManager.add(concept, helpers.extend(
                {
                    cardinality: i,
                    groupIndex: 0,
                    group: group,
                    source: 0,
                    target: i + 1,
                    dataType: args.dataType
                },
                graphData
            ));
        });

        editorSessionManager.syncRemoved(removedEids);
    }

    exports.reconstruct = reconstruct;
});