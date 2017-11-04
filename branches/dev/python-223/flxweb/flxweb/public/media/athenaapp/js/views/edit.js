/**
 * Copyright 2007-2014 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Alexander Ressler
 *
 * $Id$
 */

/**
 * This file defines the view for the 'edit' mode in the Athena host.
 */
define([
    "jquery",
    "practiceapp/views/appview",
    "practiceapp/templates/templates",
    "groups/controllers/assignment.edit",
    "common/utils/concept_coversheet",
    "practiceapp/views/teacher.home",
    "embed/utils/embed.helper",
    "embed/views/concept.renderer",
    "modality/controllers/modality",
    "common/views/modal.view",
    "common/utils/utils",
    "common/utils/url",
], function ($, AppView, Templates, AssignmentEditController, coverSheet, TeacherHomeView,
    EmbedHelper, ConceptEmbedView, ModalityEmbedView, ModalView, util, URL)
{
    "use strict";

    // GLOBALS
    var self        = null; // used in messageListener TODO: remove because we can only have 1 instance of this on a page.
    var controller  = null;
    var context     = null;
    var modalIframe = null;
    var iframeModalView = null;
    var embedder    = null;
    var embedParams = "&utm_source=viewer&utm_medium=embed&utm_campaign=Athena"; // FOR GA CAMPAIGN

    /**
     * @callback - Executed in postRender.
     */
    function bindControllerEvents() {
        controller.on("renderDecendants renderTopics renderConcepts renderBranches renderTracks", applyCSSTouchup);
    }

    /**
     * Add some utility classes to elements in the page
     */
    function applyCSSTouchup() {
        $(".js-group-assignment-nav").addClass("no-select-no-drag");
        $(".subject-title").addClass("no-select-no-drag");
        $(".select-track-wrapper").addClass("no-select-no-drag");
        $(".js-concept-name").addClass("no-select-no-drag");
    }

    function escapeHTML(string) {
        string = string.toString();
        return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /**
     * Responsible for getting the template for concepts in concept view page
     * @param {Function} templateFunction The function responsible for creating HTML 
     *  template in concept page
     * @param {Object} concepts Array of concepts to be rendered 
     * @param {number} level The level at which the concepts is to be rendered. Starts from 1
     * @returns {Object} 'template' contains the HTML template to render and 'conceptCount' contains
     *  the number of concepts present in current page   
     */
    function createConceptRowTemplate(templateFunction, concepts, level) {
        var i = 0,
            len = 0,
            count = 0,
            template = "";
        var parentHandle, eID, nextLevelConcepts, collectionHandle;
        var returnTemplate;

        for (i, len = concepts.length; i < len; i++) {
            collectionHandle = concepts[i].handle.split('-::-')[0];
            eID = (concepts[i].encodedID || "").replace(/\./g, "-");
            
            if (eID) {
                count++;
                parentHandle = util.getBranchName(concepts[i].encodedID).replace(/ /g, '-');
            } else {
                // doesn't matter anyway. Its not strict to set. We are only
                // setting it here beacuse we have set it in assignment flow
                parentHandle = collectionHandle;
            }
            //Check if we have to drill down to get level 4 concepts
            nextLevelConcepts = concepts[i].contains;
            if (eID || nextLevelConcepts) {
                template += templateFunction({
                    "conceptName":  escapeHTML(concepts[i].title || ""),
                    "handle": eID ? (concepts[i].conceptHandle || "") : "",
                    "conceptCollectionHandle": concepts[i].handle || '',
                    "conceptCollectionAbsoluteHandle": concepts[i].absoluteHandle || '',
                    "collectionCreatorID": concepts[i].creatorID || '',
                    "parentHandle": parentHandle,
                    "collectionHandle": collectionHandle,
                    "encodedID": eID,
                    "isChecked": $(".js-add-concepts-wrapper").find("[data-encodedID=" + eID + "]").length ? "checked" : "",
                    "conceptLevel": level
                });
            }
            // Drill down to generate child concepts
            if (!eID && nextLevelConcepts) {
                returnTemplate = createConceptRowTemplate(templateFunction, nextLevelConcepts, level + 1);
                template += returnTemplate.template;
                count += returnTemplate.conceptCount;
            }
        }
        return {
            'template': template,
            'conceptCount': count
        };
    }

    /**
     * @constructor
     * Prompt user to select and insert a modality. Set the athena configuration object.
     * This view triggers the following events:
     *      "setURI" - passes a URI string as event data
     *      "editIframeClosed" - no data, this is the close/end signal      
     */
    var EditView = TeacherHomeView.extend({
        
        modalityTypes : "lesson,lecture,enrichment",
        modalityFilters: "text,multimedia",
        conceptDataWrapperWidth: "56%",

        initialize: function() {
            EditView.__super__.initialize.apply(this, arguments); // run parent class init first
            self = this;
            this.postRender();
        },

        postRender: function() {
            context = this.config.app_name;
            controller = this.controller;
            bindControllerEvents();
        },

        events: {
            "click.subjects .js-node-wrapper": "renderTopics",
            "click.subjects .js-group-assignment-nav": "showSubjects",
            "click.subjects .js-concept-select": "showConceptEmbedView",
            "click.subjects .js-search-open": "openSearch",
            "click.subjects .js-search-close": "closeSearch",
            "click.subjects .js-search": "searchConcepts",
            "keypress.subjects #assignment-search-input": "callSearch"
        },

        // Same as in TeacherHomeView ... we are just hiding the buttons, and empty concepts
        // TODO: abstract filters, currently we're passing "text,multimedia", but this doesn't align with the type
        // of filters passed allong in the argument of renderConcepts
        renderConcepts: function (concepts) {
            var that = this;
            var conceptRowTemplate;

            conceptRowTemplate = createConceptRowTemplate(that.tmpl_concepts, concepts, 1);
            
            //if ($(".js-search-open").is(":visible")) {
            $("#concept-heading").html($("#tracks-wrapper").find(".js-selected").html());
            $("#concept-heading").prepend($("#branch-image").html());
            $("#concepts-wrapper").html(conceptRowTemplate.template);
            $("#concept-heading").find(".concept-count").text(conceptRowTemplate.conceptCount + " concepts");
            //}
            // Hide all the buttons that are used to assign
            this.$el.find(".js-assign-concept.button").hide();
        },

        /**
         * Show the list of modalities for a praticular concept.
         */
        showConceptEmbedView: function(event) {
            var that = this;

            if (!$(event.target).hasClass('js-assign-concept')) {
                var selection = $(event.target).closest('.select-concept-wrapper');
                var handle = $(selection).attr("data-handle"),
                    branchHandle = $(selection).attr("data-parent-handle"),
                    collectionHandle = $(selection).attr("data-collection-handle") || '',
                    encodedId = $(selection).attr("data-encodedid").replace(/\-/g, '.'),
                    collectionCreatorID = $(selection).attr('data-collection-creator-ID') || '',
                    conceptCollectionAbsoluteHandle = $(selection).attr('data-concept-collection-absolute-handle') || '',
                    conceptCollectionHandle = $(selection).attr('data-concept-collection-handle'),
                    conceptTitle = '';

                conceptTitle = $.trim($(selection).find('.js-concept-name').html());
                if ($('.dashboard-modal-wrapper').length) {
                    $('.dashboard-modal-wrapper').find('.js-select-concept-wrapper').attr('data-encodedid', encodedId);
                }

                var embedURI = EmbedHelper.getConceptEmbedUrl({
                    concept_handle: handle,
                    concept_collection_absolute_handle: conceptCollectionAbsoluteHandle,
                    concept_collection_handle: conceptCollectionHandle,
                    collection_creator_ID: collectionCreatorID,
                    concept_collection_title: conceptTitle,
                    branch_handle: branchHandle,
                    collection_handle: collectionHandle,
                    nochrome: true,
                    filters: that.modalityFilters,
                    display_style: "list"
                });

                // Launch an iframe with the embed code and listen to the postMessage trigger
                // from inside of embed.html
                EditView.renderEmbedView(embedURI, {
                    css: {
                        "margin-top": "30px"
                    },
                    onopen: function() {
                        window.addEventListener("message", that.messageListener);
                        window.addEventListener("resize", EditView.resizeIframe);
                        window.scrollTo(0,0);
                    },
                    onclose: function() {
                        window.removeEventListener("message", that.messageListener);
                        window.removeEventListener("resize", EditView.resizeIframe);
                        that.trigger("editIframeClosed"); // finished or iframe closed
                    }
                });
            }
            return null;
        },

        /** @callback - callback for postMessage */
        messageListener: function(event) {
            var message;
            try {
                message = JSON.parse(event.data);
            } catch(error) {
                message = {};
                console.log(error);
            }
            switch (message.message) {
                case "embedderReady":
                    embedder = modalIframe.contentWindow.embedder;
                    embedder.on("hashchange", self.hashChangeDetected, self);
                    self.hashChangeDetected(embedder.getConfiguration());
                    break;
                case "modalityFilterApplied":
                    self.modalityFilterApplied();  // calls embedder.getConfiguration
                    break;
            }
        },

        /**
         * @callback - Callback for when the user changes views in the embedded iframe.
         * @param {object} config - object containing the module and params.
         */
        hashChangeDetected: function(config) {
            if (config.module === "concept") {
                this.setConceptView();
            }
            else if (config.module === "modality") {
                this.setModalityView();
            }
            return null;
        },

        /**
         * @callback - Callback for postMessage message: modalityFilterApplied.
         *             Get embedder confg and either trigger setConceptView or setModalityView.
         */
        modalityFilterApplied: function () {
            var config = embedder.getConfiguration();
            if (config.module === "concept") {
                this.setConceptView();
            }
            else if (config.module === "modality") {
                this.setModalityView();
            }
        },

        /** Inserts the 'Add' buttons into each list item and sets up the event handlers. */
        setConceptView: function () {
            var that = this;
            var $listItems = $(modalIframe.contentDocument).find("li.modality .modality_info_wrapper");
            var $buttons;
            $(modalIframe.contentDocument).find(".content-wrap.row").first().find(".button.js-add").remove();
            $listItems.append("<div class='button tangerine js-add'>Add</div>");
            $buttons = $listItems.find(".js-add").css({
                position: "absolute",
                width:"105px",
                right: "30px",
                margin: "46px 0px"
            });
            $listItems.find(".data_wrapper").css({
                "max-width": this.conceptDataWrapperWidth
            });
            $buttons.on("click", function(event) {
                var $parent = $(this).parent();
                var embedURI = $parent.find("a").first().attr("href");
                // TODO: sloppy, but it works for now
                var $dataParent =  $parent.parent().parent().parent();
                var artifactID = $dataParent.data("artifactid");
                var contextEID = $dataParent.data("domaineid");
                var title = $dataParent.data("title");
                var url = new URL(embedURI);
                var collectionParams = null;
                if(url.hash_params.collectionHandle){
                    collectionParams = {
                        collectionHandle: url.hash_params.collectionHandle,
                        collectionCreatorID: url.hash_params.collectionCreatorID,
                        conceptCollectionHandle: url.hash_params.conceptCollectionHandle,
                        conceptCollectionAbsoluteHandle: url.hash_params.conceptCollectionAbsoluteHandle
                    }
                }
                that.setEmbedURI(embedURI, artifactID, contextEID, title, collectionParams);
                iframeModalView.close();
            });
            that.conceptViewPostProcess($(modalIframe.contentDocument));
        },

        /** Method to perform any post-processing on the concept view */
        conceptViewPostProcess: function(iframeContext){

        },

        /** Inserts the 'Add' button at the top and sets up the event handler. */
        setModalityView: function () {
            var that = this;
            var container = $(modalIframe.contentDocument).find(".content-wrap.row").first();
            var $button;
            var embedURI;
            //$(container).find(".modality_title > div").append("<div class='button tangerine js-add'>Add</div>");
            $(container).append("<div class='button tangerine js-add'>Add</div>");
            $button = $(container).find(".js-add").css({
                position: "absolute",
                width: "105px",
                top: "25px",
                right: "20px"
            });

            $button.on("click", function(event) {
                var $dataParent = $(this).parent().find("#modality_content");
                var artifactID = $dataParent.data("artifactid");
                var contextEID = $dataParent.data("domaineid");
                var title = $dataParent.data("title");
                embedURI = modalIframe.contentWindow.location.href;
                that.setEmbedURI(embedURI, artifactID, contextEID, title);
                iframeModalView.close();
            });
            that.modalityViewPostProcess($(modalIframe.contentDocument));
        },

        /** Method to perform any post-processing to the modality view */
        modalityViewPostProcess: function(iframeContext){

        },

        /** Any setting of the athena configuration happens here */
        setEmbedURI: function (embedURI, artifactID, contextEID, title) {
            var provider = controller.appContext.config.provider;
            // check if embedURI is http or https
            if (embedURI.substr(0,5)[4] === ":") {
                embedURI = "https" + embedURI.substr(4);
            }
            // add additional params
            //embedURI += "&nochrome=true";
            embedURI += "&app_context="+provider;
            embedURI += embedParams;
            this.trigger("setURI", embedURI); // 
            controller.dexterjs.logEvent("ATHENA_MODALITY_INSERT", {
                artifactID: artifactID,
                context_eid: contextEID
            });
        }

    },{
        resizeIframe: function(event) {
            var width = iframeModalView.$modalBody.width();
            var height = iframeModalView.$modalBody.height();
            modalIframe.setAttribute("width", width);
            modalIframe.setAttribute("height", height);
        },
        renderEmbedView: function(embedURI, options){
            var opener = null;
            if (options && options.onopen && ( typeof options.onopen === "function" )){
                opener = options.onopen;
            }
            options.onopen = function(){
                modalIframe = this.iframe; // set it now... here
                if (opener){
                    opener();
                }
            };
            // Bug #48370
            if (embedURI.search("http") === -1){
               var _path = embedURI.substr(embedURI.search("#"));
               embedURI = "https://"+window.location.hostname + "/embed" + _path;
            }
            iframeModalView = ModalView.iframe(embedURI, options);
        }
    });

    return EditView;
});
