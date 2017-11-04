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
 */

/**
 * This module defines a class that will populate a template with 
 * related concepts/books given an EID. 
 */
define([
    "underscore",
    "jquery",
    "text!templates/concepts-retrolation-template.html",
    "text!templates/books-retrolation-template.html"
], function(_, $, conceptsRetrolationTemplate, booksRetrolationTemplate ) {

    // ================
    // GLOBAL CONSTANTS
    // ================

    var rSection = /\d+\.\d+/;

    var CONFIG = {
        types: {
            books: "books",
            concepts: "concepts"
        },
        apis: {
            concepts: "/flx/get/retrolation/domain/",
            books: "/flx/get/retrolation/section/"
        }
    };

    /**
     * @constructor
     */
    function RetrolationWidget (config) {
        var DEFAULT_CONFIG = {
            eid: null,
            containerSelector : "",
            insert: "prepend", // or "append"
            type: null, // autodetect based on window.location.href
            callback: function () { },
            renderAfterFetch: true
        };
        this.config = $.extend(true, DEFAULT_CONFIG, config);
        this.$el = null;

        // autodetect correct API 
        // try to see if the artifact_json exists and the artifact type is a `section`.
        if ( !this.config.type ) {
            this.config.type = ( window.artifact_json && window.artifact_json.artifactType === "section" ) ? 
                CONFIG.types.books : CONFIG.types.concepts ;
        }
        
        // automatically get retrolated artifacts if an eid is supplied upon instantiation
        if (this.config.eid) {
            this.fetchRetrolatedArtifacts(this.config.eid, this.config.callback);
        }

        return this;
    }

    /**
     * @method
     * Render the template into the container specified by a DOM query string.
     * @param {string} [queryString] used to lookup a DOM element, config.container
     *                               will be used if this isn't specified.
     */
    RetrolationWidget.prototype.render = function (queryString) {
        var $container = $(queryString || this.config.containerSelector);
        if ( $container.length ) {
            if ( this.config.insert === "append" ) {
                $container.append(this.$el);
            } else {
                $container.prepend(this.$el);
            }
        } else { 
            console.debug("CONTAINER IS NULL");
        }
        return this;
    };

    /**
     * Remove the widget from the DOM
     */
    RetrolationWidget.prototype.remove = function () {
        this.$el.remove();
    };

    /**
     * @method
     * call the API to get all retrolated concepts from an EID
     * @param {string} eid the EID associated with an artifact
     * @param {function} [callback] executed on jquery's AJAX success callback, it is
     *                              passed the jquerified template object.
     */
    RetrolationWidget.prototype.fetchRetrolatedArtifacts = function (eid, callback) {
        callback = !callback ? function () { } : callback.bind(this);
        $.ajax({
            type: "GET",
            url: CONFIG.apis[this.config.type] + eid,
            success: function (data, status, jqXHR) {
                if (typeof data === "string") { data = JSON.parse(data); }
                if (data.responseHeader.status !== 0) {
                    console.debug("NON ZERO STATUS FROM RETROLATION API");
                } else {
                    var formattedData = formatResponse(data.response, this.config.type); 
                    if ( formattedData ) {
                        this.$el = getTemplate(this.config.type, formattedData);
                        if (this.config.renderAfterFetch) {
                            this.render();
                        }
                    }
                    callback(this.$el);
                }
            }.bind(this),
            error: function (jqXHR, status, error) {
                throw new Error("can't fetch retrolation data from server\n\n"+error);
            }
        });
    };

    /**
     * @private
     * @param {object} data the raw server response so the template can use it.
     */
    function formatResponse (data , type) {
        if ( !data.length ) { return null; } // no data... return falsy
        var templateData = {
            concepts: [],
            books: []
        }
        for (var i=0; i<data.length; i++) {
            if ( type === CONFIG.types.books ) {
                templateData.concepts.push({
                    content: data[i].name,
                    href: "/" + data[i].branchInfo.handle + "/" + data[i].handle
                });
            } else {
                coverImage = data[i].book.coverImageSatelliteUrl || data[i].book.coverImage;
                templateData.books.push({
                    bookImageURL: coverImage.replace(/COVER_PAGE/g, 'COVER_PAGE_THUMB_LARGE_TINY').replace(/IMAGE/g, 'IMAGE_THUMB_LARGE_TINY').replace(/show\//, "show/THUMB_LARGE/"),
                    title: data[i].book.title,
                    sectionHref: makeSectionURL(data[i]), //data[i].section.perma,
                    sectionTitle: data[i].section.title,
                    description: data[i].book.summary
                });
            }
        }

        return templateData;
    }


    /**
     * @private
     * @param {object} data contains `book` and `section` keys relating to the book's section.
     * @return {string} url matches the section in the context of the flexbook.
     * Form the section URL based on a section EID
     */
    function makeSectionURL (data) {
        var url = data.book.perma; // should be "book/<title>"
        url += "/section/";
        url += rSection.exec(data.section.encodedID);
        return url;
    }

    /**
     * @private
     * @param {string} type get the correct template given the RetrolationWidget's config.type.
     * @param {array} data contains a formatted data for the template.
     * @return {object} jquery object representing the template DOM element.
     */
    function getTemplate (type, data) {
        // TODO: identify which template to use
        var template = null;
        switch (type) {
            case CONFIG.types.books:
                template = _.template( booksRetrolationTemplate, data, {variable: "data"} );
                break;
            case CONFIG.types.concepts:
                template = _.template( conceptsRetrolationTemplate, data, {variable: "data"} );
                break;
            default:
                throw new Error("the widget type is not recognized");
        }
        return $(template);
    }

    return RetrolationWidget;
});
