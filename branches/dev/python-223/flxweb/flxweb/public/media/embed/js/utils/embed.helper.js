define([
    'jquery',
    'common/utils/url'
],function($, URLUtil) {
    'use strict';

    var EMBED_PREFIX, EmbedHelper;

    /**
    * @param {Object} embed_params
    * returns embed URL using provided embed_params
    */
    function createEmbedUrl(embed_params) {
        var embed_url = new URLUtil(EMBED_PREFIX);
        embed_url.updateHashParams(embed_params);
        return embed_url.url();
    }

    EMBED_PREFIX = '/embed/';
    EmbedHelper = {
        /**
        *
        * @param {Object} options
        *
        */
        getConceptEmbedUrl: function(options) {
            var embed_params;

            options = $.extend({
                'concept_handle': null, //(Required)
                'branch_handle': null, //(Optional)
                'nochrome': false, //(Optional) set true to hide header & footer in embed view
                'filters': '' //(Optional) comma separated list of modality groups to show in concept embed view
            }, options);

            if (options.concept_handle === null) {
                throw 'concept_handle must be provided';
            }

            embed_params = {
                'module': 'concept',
                'handle': options.concept_handle,
                'branch': options.branch_handle,
                'filters': options.filters,
                'nochrome': options.nochrome,
                'display_style': options.display_style,
                'view_mode': 'embed' //(Required, do not overwrite.)
            };

            if(options.collection_handle){
                embed_params.collectionHandle = options.collection_handle;
            }
            if(options.concept_collection_absolute_handle) {
                embed_params.conceptCollectionAbsoluteHandle = options.concept_collection_absolute_handle;
                embed_params.conceptCollectionTitle = encodeURI(options.concept_collection_title || '');
                embed_params.conceptCollectionHandle = options.concept_collection_handle;
                embed_params.collectionCreatorID = options.collection_creator_ID || '3'; //default collection creator ID
            }

            return createEmbedUrl(embed_params);
        },
        /**
        *
        * @param {Object} options
        */
        getModalityEmbedUrl: function(options) {
            var embed_params;

            options = $.extend({
                'modality_handle': null, //(Required) modality handle,
                'modality_type': null, //(Required) artifactType of modality
                'concept_handle': null, //(Optional) handle of the concept to which the modality belongs
                'modality_realm': null, //(Optional) modality realm (realm: modality creator namespace)
                'branch_handle': null, // (Optional) branch handle
                'nochrome': options.nochrome, //(Optional) set true to hide header & footer in embed view
                'filters': options.filters //(Optional) comma separated list of modality groups to show in concept embed view after navigating back
            }, options);


            if (!options.modality_handle || !options.modality_type) {
                throw 'modality_handle and modality_type must be provided';
            }

            embed_params = {
                'module': 'modality',
                'handle': options.modality_handle,
                'mtype': options.modality_type,
                'context': options.concept_handle,
                'realm': options.modality_realm,
                'branch': options.branch_handle,
                'filters': options.filters,
                'nochrome': options.nochrome,
                'display_style': options.display_style,
                'view_mode': 'embed' //(Required, do not overwrite.)
            };

            return createEmbedUrl(embed_params);
        }

    };

    return EmbedHelper;
});
