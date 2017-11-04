define(function () {
    'use strict';
    /**
    * Get minimal details for creating plix assignments
    *
    * @return object
    */
    function getPlixDetails(data){
        var details = {};

        details.title = data.title ? data.title : '';
        details.artifactID = data.artifactID ? data.artifactID : '';
        details.mtype = 'plix';
        details.context_url = window.location.href.substring((window.location.protocol + '//' + window.location.hostname).length);
        return details;
    }
    /**
    * Get minimal details for creating simulation assignments
    *
    * @return object
    */
    function getSimulationDetails(data){
        var details = {};

        details.title = data.title ? data.title : '';
        details.artifactID = data.artifactID ? data.artifactID : '';
        details.mtype = 'simulationint';
        details.context_url = window.location.protocol + '//' + window.location.hostname +window.location.pathname;
        return details;
    }

    /**
    * Checks the window for helper objects js_modality_data or artifact_json
    * and returns one if defined
    *
    * @return {object || null} object with artifact/modality details
    */
    function getPageArtifactDetails(){
        var details = null;
        if (window.js_modality_data){
            details = window.js_modality_data.artifact;
        } else if (window.artifact_json){
            details = window.artifact_json;
        }
        return details;
    }

    /**
    * Checks the window for collection object
    * and returns one if defined
    *
    * @return {object || null} object with collections data
    */
    function getPageCollectionDetails(){
        var details = null;
        if (window.js_collection_data && window.js_collection_data.collection){
            details = window.js_collection_data.collection;
        } else if (window.artifact_json && window.artifact_json.collections && window.artifact_json.collections.length > 0) {
            details = window.artifact_json.collections[0];
        }
        return details;
    }

    /**
    * Get the minimal details needed to create an assignment
    * from an artifact/modality.
    *
    * return {object} modality details or {}
    */
    function getAssignmentDetails(){
        var data = {};
        var modality_data = getPageArtifactDetails();
        var collection_data = getPageCollectionDetails();
        if (modality_data) {
            data.title = modality_data.title;
            data.artifactID = modality_data.artifactID;
            data.domaineid = modality_data.domain ? modality_data.domain.encodedID : '';
            data.mtype = modality_data.artifactType;
            data.realm = modality_data.realm;
            data.handle = modality_data.handle;
            // If we have the collection data we add it here
            if (collection_data) {
                data.collectionHandle = collection_data.handle ? collection_data.handle : '';
                data.conceptCollectionHandle = collection_data.descendantCollection ? collection_data.descendantCollection.handle : '';
                data.collectionCreatorID = collection_data.creatorID ? collection_data.creatorID : '';
            }
        }
        return data;
    }

    return {getAssignmentDetails: getAssignmentDetails,
        getPlixDetails: getPlixDetails,
        getSimulationDetails: getSimulationDetails
    };
});
