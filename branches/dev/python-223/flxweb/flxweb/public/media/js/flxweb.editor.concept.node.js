/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Javed Attar
 * artifactID
 * $Id$
 */
define('flxweb.editor.concept.node', [
    'backbone',
    'jquery',
    'common/utils/url',
    'flxweb.global',
    'flxweb.editor.common'
],
    function (Backbone, $, Url) {
        'use strict';

        var AddTaxonomyDialog = Backbone.View.extend({
            artifact: null,
            result_div: null,
            search_form: null,
            loading_placeholder: null,
            initialize: function () {
                //exit if the element does not exist
                if ($(this.el).length === 0 ||
                    $(this.options.target).length === 0) {
                    return;
                }

                var self = this;
                self.dialog = $.flxweb.createDialog($(self.el), {
                    'title': $(self.el).data('title'),
                    'width': 550
                });
                self.dialog.bind('flxweb.dialog.open', self.onDialogOpen);
                $(this.options.target).click(function () {
                    self.show();
                    return false;
                });
            },
            show: function () {
                this.dialog.open();
            },
            hide: function () {
                this.dialog.close();
            },
            searchConceptNode: function () {
                var search_term = ($('#input_concept_node').val() || '').trim();
                $('#input_concept_node').val(search_term);
                if (!search_term) {
                    window.addTaxonomyDialog.result_div.html(window.addTaxonomyDialog.empty_input_message);
                    return false;
                }
                $.ajax({
                    'url': $(this).attr('action'),
                    'type': $(this).attr('method'),
                    'data': $(this).serialize(),
                    'success': window.addTaxonomyDialog.searchConceptNodeSuccess
                });
                window.addTaxonomyDialog.result_div.html(window.addTaxonomyDialog.loading_placeholder);
                return false;
            },
            paginate: function () {
                $.ajax({
                    'url': $(this).data('page_url'),
                    'type': 'GET',
                    'data': $(this).serialize(),
                    'success': window.addTaxonomyDialog.searchConceptNodeSuccess
                });
                window.addTaxonomyDialog.result_div.html(window.addTaxonomyDialog.loading_placeholder);
                return false;
            },
            searchConceptNodeSuccess: function (data) {
                $('#js_dialog_addtaxonomy').find('.term_results').html(data);
                $('#js_dialog_addtaxonomy').find('.gdoc_paginator').find('a').each(function () {
                    $(this).click(window.addTaxonomyDialog.paginate);
                });
            },

            removeDomain: function () {
                // bug 15328 while creating modality allow remove all concept node. Remove of last concept node blocked.
                // modality should have least one Concept Node.
                if (window.addTaxonomyDialog.artifact.get('id') !== 'new' && window.addTaxonomyDialog.artifact.isLastNode()) {
                    $.flxweb.showDialog('All Concept Node cannot be removed. Modality must belong to at least one Concept Node.');
                    return;
                }

                var title, domain,
                    encodedID = $(this).data('encodedid'),
                    domainTerm = $(this).data('domainterm');
                title = encodedID + ' (' + domainTerm + ')';
                domain = {
                    'browseTerm': domainTerm,
                    'encodedid': encodedID,
                    'action': 'add',
                    'title': title
                };
                window.addTaxonomyDialog.artifact.removeDomain(domain);
                $(this).parent().remove();
            },
            removeCollection: function () {
                // bug 15328 while creating modality allow remove all concept node. Remove of last concept node blocked.
                // modality should have least one Concept Node.
                if (window.addTaxonomyDialog.artifact.get('id') !== 'new' && window.addTaxonomyDialog.artifact.get('collections').length < 2) {
                    $.flxweb.showDialog('All Collection Node cannot be removed. Modality must belong to at least one Collection Node.');
                    return;
                }

                var collection,
                    creatorID = $(this).data('creatorid'),
                    conceptCollectionHandle = $(this).data('conceptcollectionhandle'),
                    encodedID =  $(this).data('encodedid');

                collection = {
                    collectionCreatorID : creatorID,
                    conceptCollectionHandle : conceptCollectionHandle,
                    encodedID : encodedID
                };
                window.addTaxonomyDialog.artifact.removeCollection(collection);
                $(this).parent().remove();
            },
            addCollection: function(e){
              var encodedID,
                  creatorID,
                  conceptCollectionHandle,
                  collectionTitle,
                  conceptCollectionTitle,
                  collection;


                  encodedID = $(this).data('encodedid');
                  creatorID = $(this).data('creatorid');
                  conceptCollectionHandle =  $(this).data('conceptcollectionhandle');
                  collectionTitle = $(this).data('collectiontitle');
                  conceptCollectionTitle = $(this).data('conceptcollectiontitle');


              // Bug 15699 encoded id is checked for 3 parts.
              if (encodedID.split('.').length < 3) {
                  $.flxweb.showDialog('Invalid Collection Node specified. Please correct and try again.');
                  return;
              }
              var collectionData =  conceptCollectionHandle.split('-::-')
              collection = {
                  collectionCreatorID: creatorID,
                  conceptCollectionHandle : conceptCollectionHandle,
                  collectionHandle: collectionData[0],
                  conceptCollectionAbsoluteHandle: collectionData[1],
                  conceptCollectionTitle : conceptCollectionTitle,
                  collectionTitle : collectionTitle,
                  encodedID : encodedID
              };

              if (window.addTaxonomyDialog.artifact.isCollectionDuplicate(collection)) {
                  $.flxweb.showDialog('Specified Collection Node is already added.');
                  return;
              }

              window.addTaxonomyDialog.artifact.addCollection(collection);
              window.addTaxonomyDialog.attachCollectionsToView([collection]);
            },
            attachCollectionsToView : function( collectionArray ){
                if( !collectionArray ) return ;
                var _tmpl = '#ck12_template_new_collection',
                    collection_elm;
                for ( var i =0; i < collectionArray.length; i++){
                  collection_elm = $.flxweb.template.render(_tmpl, collectionArray[i]);
                  $('.js_domain_container').append(collection_elm);
                }
                window.addTaxonomyDialog.hide();
            },
            addDomain: function (eid, name) {
                var encodedID, domainTerm, title, domain, domain_elm,
                    _tmpl = '#ck12_template_new_domain';
                if (eid && name) {
                    encodedID = eid;
                    domainTerm = name;
                } else {
                    encodedID = $(this).data('encodedid');
                    domainTerm = $(this).data('domainterm');
                }

                // Bug 15699 encoded id is checked for 3 parts.
                if (encodedID.split('.').length < 3) {
                    $.flxweb.showDialog('Invalid Concept Node specified. Please correct and try again.');
                    return;
                }
                title = encodedID + ' (' + domainTerm + ')';
                domain = {
                    'browseTerm': domainTerm,
                    'encodedid': encodedID,
                    'action': 'add',
                    'title': title
                };

                if (window.addTaxonomyDialog.artifact.isDomainDuplicate(domain)) {
                    $.flxweb.showDialog('Specified Concept Node is already added.');
                    return;
                }

                window.addTaxonomyDialog.artifact.addDomain(domain);
                domain_elm = $.flxweb.template.render(_tmpl, domain);
                $('.js_domain_container').append(domain_elm);
                window.addTaxonomyDialog.hide();
            },
            onDialogOpen: function () {
                $('#frm_taxonomysearchdialog').submit(window.addTaxonomyDialog.searchConceptNode);
                window.addTaxonomyDialog.result_div = $('#js_dialog_addtaxonomy').find('.term_results');
                window.addTaxonomyDialog.loading_placeholder = $('#js_dialog_addtaxonomy').find('.js_dialog_loading_placeholder').html();
                window.addTaxonomyDialog.empty_input_message = $('#js_dialog_addtaxonomy').find('.js_empty_input_message').html();
                return false;
            }

        });

        function bindEvents() {
            // $('#taxonomycontainer .js_domain_remove').live('click', window.addTaxonomyDialog.removeDomain);
            $('#taxonomycontainer .js_domain_remove').live('click', window.addTaxonomyDialog.removeCollection);
            $('#taxonomycontainer .js_collection_remove').live('click', window.addTaxonomyDialog.removeCollection);
            // $('#js_dialog_addtaxonomy').find('table tbody tr').live('click', window.addTaxonomyDialog.addDomain);
            $('#js_dialog_addtaxonomy').find('table tbody tr').live('click', window.addTaxonomyDialog.addCollection);
        }

        function domReady() {

            window.addTaxonomyDialog = new AddTaxonomyDialog({
                el: $('#js_dialog_addtaxonomy'),
                target: $('#btn_addtaxonomy')
            });
            window.addTaxonomyDialog.artifact = $.flxweb.editor.current_artifact;
            bindEvents();
            var eid = new Url(window.location.href).search_params.eid;
            if (eid) {
                $.ajax({
                    'type': 'GET',
                    'url': webroot_url + 'flx/get/info/browseTerm/' + eid,
                    'dataType': 'json',
                    'success': function (response) {
                        // window.addTaxonomyDialog.addDomain(eid, response.response.name);
                        window.addTaxonomyDialog.attachCollectionsToView( window.addTaxonomyDialog.artifact.get('collections'))
                    }
                });
            }
        }
        $(document).ready(domReady);

        var ConceptNodeModule = {};
        ConceptNodeModule.AddTaxonomyDialog = AddTaxonomyDialog;
        return ConceptNodeModule;
    });
