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
 * This file originally written by Nachiket Karve
 *
 * $Id$
 */
/* global artifactID */
define('flxweb.details.modality.read', ['jquery', 'underscore', 'common/utils/utils', 'backbone',
        'flxweb.modality_views', 'flxweb.bookbuilder', 'flxweb.artifactrender',
        'flxweb.reviews', 'cache/cdn_cache','common/utils/user',
        '../modality/js/utils/plix.dressing', 'flxweb.models.artifact', 'flxweb.summary',
        'jquery-ui', 'flxweb.vocabulary', 'flxweb.settings', 'flxweb.global', 'flxweb.utils.base64',
        'flxweb.publish', 'flxweb.standards.boards', 'flxweb.guided_practice','flxweb.attachments', 'flxweb.edit.resource', 'flxweb.details.image_attribution'
    ],
    function ($, _, Util, Backbone, mv, Bookbuilder, ArtifactRender, ReviewsModule, CDNCache, User, PlixDressing, Artifact, ArtifactSummaryView) {
        'use strict';

        var ReadModalityDetailsView = mv.ModalityDetailsView.extend({
            'events': function () {
                return _.extend({}, mv.ModalityDetailsView.prototype.events, {
                    'click .js_resource_popup': 'resource_popup'
                });
            },
            'bookBuilderView': null, //Add to FlexBook
            'initialize': function (options) {
                ReadModalityDetailsView.__super__.initialize.call(this, options);
                this.bookBuilderView = new Bookbuilder.BookbuilderView({
                    target: $('#add_to_book')
                });
                this.$('.js_renderlink').each(function () {
                    new ArtifactRender.ArtifactRenderLinkView({
                        'el': this
                    });
                });
            },
            'resource_popup': function (e) {
                //get the parent row div so that we can get the
                //resource details from data attributes
                var eoDiv, width, height, embedHTML, src,
                    resource_row = $(e.currentTarget).parents('.js_resource_row');
                eoDiv = resource_row.find('.js_resource_code');
                width = eoDiv.data('resource-width');
                height = eoDiv.data('resource-height');

                if (isNaN(width)) {
                    // width is in percentage
                    width = parseInt(width.split('%')[0], 10);
                    width = Math.round($(window).width() / width) * 100;
                }

                if (isNaN(height)) {
                    // height is in percentage
                    height = parseInt(height.split('%')[0], 10);
                    height = Math.round($(window).height() / height) * 100;
                }

                width = width ? width + 20 : 500;
                height = height ? height + 100 : 500;
                width = Math.min(width, 900);
                height = Math.min(height, 600);

                embedHTML = eoDiv.text();
                src = resource_row.data('resource-uri');
                if ('string' === typeof src && src.length) {
                    src = src.split('//');
                    if (1 === src.length) {
                        src = src[0];
                    } else {
                        src = src[1];
                    }
                    if (0 === src.indexOf('braingenie')) {
                        // width = dialog width - element padding
                        // height = dialog height - element padding - video scaling(95%) - buffer space
                        embedHTML = $(embedHTML).find('iframe').prop({
                            'width': width - 35,
                            'height': ((height - 71) * 0.95) - 10
                        }).end()[0].outerHTML;
                    }
                }

                $.flxweb.showDialog(eoDiv.text(), {
                    'title': resource_row.data('resource-name'),
                    'width': width,
                    'height': height,
                    'buttons': {}
                });
            }
        });

        function showMoreMeta() {
            $(this).hide();
            $('.js_more_keywords', $(this).parent()).removeClass('hide');
            return false;
        }

        function initReviewList() {
            //Reviews
            if (window.artifactID) {
                new ReviewsModule.ReviewsListView({
                    el: $('#reviews'),
                    artifactID: window.artifactID,
                    myReviewView: window.myReview
                });
            }
        }

        function processXHTML(ixhtml) {
            var _content, _objectives, _vocabulary, tempEle, removeId,
                _xhtml = '',
                xhtml_re = new RegExp(/<!-- Begin inserted XHTML \[CONCEPT: \d*\] -->([\s\S]*)<!-- End inserted XHTML \[CONCEPT: \d*\] -->/gmi),
                $tc = $('#temp_lesson_xhtml_content'), _contentWrap;

            _content = xhtml_re.exec(ixhtml);

            if (_content) {
                _xhtml = _content[1];
                _xhtml = _xhtml.replace('<h2 id="x-ck12-Q29uY2VwdA.."> Concept </h2>', '');
            } else {
                /*xhtml_re = new RegExp(/<div class="x-ck12-data-concept">([\s\S]*)<\/div>/gmi);
                //xhtml_re = new RegExp(/<div class="x-ck12-data-concept">(.*?)<\/div>/gmi);
                _content = xhtml_re.exec(ixhtml);*/

                _contentWrap = $('<div>'+ixhtml.replace(/body/g,"bodytagincontent")+'<div>');
                _content = $('<div>').append(_contentWrap.find('.x-ck12-data-concept').clone()).html();

                if (_content) {
                    //_xhtml = _content[1];
                	_xhtml = _content;
                } else {
		            // SEO change: Remove the <title> element from the DOM
		            // We just want one <title> element on the page.
		            try {
		                _xhtml = ixhtml.replace(/<title>.*<\/title>/g,'');
	                } catch(e) {
			            console.error(e);
		                _xhtml = ixhtml;
		            }
                }
            }
            $tc.html(ixhtml);
            if (window.GuidedPracticeExists) {
                if (js_modality_data.artifact.encodedID.match('MAT')) {
                    removeId = '#x-ck12-RXhwbG9yZSBNb3Jl';
                } else if (js_modality_data.artifact.encodedID.match('SCI')) {
                    removeId = '#x-ck12-UmV2aWV3';
                }
                tempEle = $('<div/>').html(ixhtml);
                tempEle.find(removeId).nextUntil('h3').andSelf().remove();
                _xhtml = tempEle.html();
            }
            if ($tc.find('.x-ck12-data-objectives').size() > 0) {
                _objectives = $tc.find('.x-ck12-data-objectives').first().html();
                if ((_objectives || '').trim()) {
                    $('.js_metadata_objectives_container div.objectives_content').html(_objectives).parent().removeClass('hide');
                }
            }
            if ($tc.find('.x-ck12-data-vocabulary').size() > 0) {
                _vocabulary = $tc.find('.x-ck12-data-vocabulary').first().html();
                if ((_vocabulary || '').trim()) {
                    $('.js_metadata_vocabulary_container div.objectives_content').html(_vocabulary).parent().removeClass('hide');
                }
            }
            $tc.html('');

            return _xhtml;
        }

        function onStandardBoardsSuccess(data) {
            var $el = $('.js_standardboards_container');
            $el.removeClass('hide').html(data);
            $('.js_lnk_show_meta').click(showMoreMeta);
            eval($(data).find('script').text());
            $el.show(800);
        }

        function renderMathJax() {
            var $this, cnt = 0;
            $('.x-ck12-mathEditor, .x-ck12-math, .x-ck12-hwpmath, .x-ck12-block-math', '#modality_content, #js_metadata_container_mjax').each(function () {
                try {
                    var mathLatex,
                    	$this = $(this),
                    	decodedTex;
                    if($this.hasClass('x-ck12-mathEditor') && $this.data('tex')){
                    	decodedTex = decodeURIComponent($this.attr('data-tex'));
	                    if (decodedTex.indexOf('\\begin{align') === -1) {
	                        mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
	                    } else {
	                        mathLatex = decodedTex;
	                    }
	                    mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
	                    /*if ($this.data('math-class') === 'x-ck12-block-math') {
	                        mathLatex = '@$$' + mathLatex + '@$$';
	                    } else {
	                        mathLatex = '@$' + mathLatex + '@$';
	                    }
	                    mathLatex = mathLatex.replace(/</g, '&lt;');*/
	                    $this.html(mathLatex).removeAttr('data-tex-mathjax').closest('p').css('overflow-y','hidden');
	                    $this.closest('p').addClass('math-inline-block');
	                    cnt++;
                    }
                    else {
                    	if($this.attr('alt') !== undefined){
                    		$this.attr('alt',$this.attr('alt').replace("<", "\\lt ").replace(">", "\\gt "));
                    	}
                    	if(!$this.data('tex')){
                    		$this.remove();
                    	}
                    }
                } catch (merr) {
                    console.log('Error rendering math: ' + merr);
                }
            });
            setTimeout(function() {
                $('p').removeClass('math-inline-block');
            }, 500);
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'modality_content']);
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'js_metadata_container_mjax']);
            console.log('Queued ' + cnt + ' math expressions');
            $(document).trigger('beginMathJaxRenderQueue', {count: cnt});
            PlixDressing.init();
        }

        function checkModalityUnderCollaboration() {
            var _d = $.Deferred();
            Artifact.getMyCollaborativeFlexBookIDs().done(function(artifactIDs){
                if(artifactIDs.length){
                    Util.ajax({
                        url: Util.getApiUrl('flx/get/editing/group/assignments'),
                        data: {
                            'artifactID': artifactID
                        },
                        cache: false,
                        isPageDisable: true,
                        isShowLoading: true,
                        success: function (data) {
                            _d.resolve(data.response);
                        },
                        error: function() {
                            _d.reject('Failed');
                        }
                    });
                }
            })

            return _d.promise();
        }

        function modalityDetailsView() {
            var userID = $('header').data('user');
            checkModalityUnderCollaboration().done(function(data) {
                if(data.bookEditingAssignments[0] && data.bookEditingAssignments.length) {
                	$('#add_to_library').attr('title','Section is a part of Collaboration Editing').addClass('already_in_library');
                	$('.js-shareGroupLink').attr('title','Section is a part of Collaboration Editing').addClass('already_in_library').siblings('.groups_share_dialog').remove();
                	$('#add_to_book').attr('title','Section is a part of Collaboration Editing').addClass('already_in_library');
                	if(data.bookEditingAssignments[0].assigneeID === userID){
                		$('#personalize_link').attr('title','Edit this Concept').html('Edit').siblings('span.customize-help-wrapper').remove();
                		$('.cannot_add_resources .editAttachmentLink').html('here.').next().remove();
                	}
                	else {
                		$('#personalize_link').attr({title:'Edit this Concept', href:'javascript:;'}).addClass('already_in_library').html('Edit').siblings('span.customize-help-wrapper').remove();
                		$('.js_resources_container .cannot_add_resources').remove();
                	}
                }
            }).fail(function() {
                ModalView.alert("There was an error.");
            });
        }

        function addToTable(annotations){
            var anno_html = '';
            annotations.forEach(function(annotation){
                anno_html += '<tr data-annoId="'+annotation.id+'">'+
                                '<td><span class="circle '+annotation.highlightColor+'"></span></td>'+
                                '<td>'+ _.escape(annotation.quote)+'</td><td>'+ _.escape(annotation.text||'')+'</td>'+
                                '<td><span class="delete-btn-container"><i class="icon-delete_cc delete-annotation-btn" data-annoId="'+annotation.id+'"></i></span></td>'+
                              '</tr>';
            });
            $('#notes-pagination').parent().before(anno_html);
        }


        function enableSummaryLink(){
            if(js_modality_data.artifact.creatorID == 3){
                var self = this;
                Util.ajax({
                    url: Util.getApiUrl('flx/get/artifactsummary/' + artifactID),
                    contentType: 'application/json'
                }).done(function(data){
                    if(data.response && data.response.artifactID == artifactID && data.response.summaries.length > 0){
                        $('#artifact_summary_dialog').parent().removeClass('hide');
                        window.artifactSummaryView = new ArtifactSummaryView({
                            target: $('#artifact_summary_dialog'),
                            model: new Backbone.Model({title: js_modality_data.artifact.title, summaries : data.response.summaries})
                        });
                    }
                });
            }
        }

        function loadSummaryDialog() {
            window.artifactSummaryView.render();
            return false;
        }

        $(document).ready(function () {

        	modalityDetailsView();
            enableSummaryLink();
        	if($('#add_to_library').length != 0 && js_modality_data.artifact.revisionInLibrary != null){
        		$('#add_to_library').addClass('already_in_library').attr('title','Already in Library').removeAttr('id');
        	}
            new ReadModalityDetailsView(window.js_modality_data);
            $('.js_lnk_show_meta').click(showMoreMeta);
            //Resource edit bindings
            window.editResourceDialog.bind('flxweb.resource.update.onsuccess', window.editResourceDialog.updateDetailsOrEditorResourceRow);
            window.editResourceDialog.bind('flxweb.resource.make.public.required', window.editResourceDialog.interEditResourceClick);
            //TODO: need to remove global reference for view.
            //Reviews
            if (window.artifactID) {
                window.myReview = new ReviewsModule.MyReviewView({
                    el: $('#myreview'),
                    artifactID: window.artifactID
                });
            }


            /* Changed metadata */
            if(js_modality_data.artifact.hasOwnProperty('changed_metadata')){
            	var removeChangedMetadata = js_modality_data.artifact.changed_metadata.remove,
                    addChangedMetadata = js_modality_data.artifact.changed_metadata.add,
                    $modalityGrades = $('#modality_grades'),
                    $modalitySubjects = $('#modality_subjects_wrapper .keywordlist'),
                    $modalitytags = $('#modality_tags_wrapper .keywordlist'),
                    $modalitysearch = $('#modality_search_wrapper .keywordlist'),
                    removeGradeLevel, addGradeLevel,
                    removeSubjects, addSubjects,
                    removeTags, addTags,
                    removeSearch, addSearch,
                    indexMetadata, newMetadata;

            	if(removeChangedMetadata){
            		removeGradeLevel = removeChangedMetadata['grade level'],
            		removeSubjects = removeChangedMetadata['subject'],
            		removeTags = removeChangedMetadata['tag'],
            		removeSearch = removeChangedMetadata['search'];
            	}
            	if(addChangedMetadata) {
            		addGradeLevel = addChangedMetadata['grade level'],
            		addSubjects = addChangedMetadata['subject'],
            		addTags = addChangedMetadata['tag'],
            		addSearch = addChangedMetadata['search'];
            	}

                /* Grade Level */
                if(addGradeLevel && addGradeLevel.length > 0){
                	newMetadata = '';
                    for(indexMetadata = 0;indexMetadata < addGradeLevel.length;indexMetadata++){
                        newMetadata = newMetadata + '<a href="/search/?q=grade:'+addGradeLevel[indexMetadata]+'" title="'+addGradeLevel[indexMetadata]+'">'+addGradeLevel[indexMetadata]+'</a>';
                        if(indexMetadata != (addGradeLevel.length)-1){
                        	newMetadata = newMetadata + ', ';
                        }
                    }
                    if($modalityGrades.length == 0){
                        newMetadata = '<div class="columnwrap spacetopmedium"><h2 class="toptitle">Grades</h2><div id="modality_grades">'+newMetadata+'</div></div>';
                        $('#modality_grades_wrapper').html(newMetadata);
                    }
                    else {
                    	newMetadata = ', ' + newMetadata;
                        $modalityGrades.append(newMetadata);
                    }
                }
                if(removeGradeLevel && removeGradeLevel.length > 0){
                    for(indexMetadata = 0;indexMetadata < removeGradeLevel.length;indexMetadata++){
                        $modalityGrades.find('a[title="'+removeGradeLevel[indexMetadata]+'"]').remove();
                    }
                    if($modalityGrades.find('a').length == 0){
                        $('#modality_grades_wrapper').html('');
                    }
                }

                /* Subjects */
                if(addSubjects && addSubjects.length > 0){
                    newMetadata = '';
                    for(indexMetadata = 0;indexMetadata < addSubjects.length;indexMetadata++){
                        newMetadata = newMetadata + '<a class="keyworditem" href="/search/?q=&amp;subject='+(addSubjects[indexMetadata].replace(/ /g,'-')).toLowerCase()+'" title="'+addSubjects[indexMetadata]+'"><span itemprop="keywords"> '+addSubjects[indexMetadata]+' </span></a>';
            	    }
            	    if($modalitySubjects.length == 0){
            	        newMetadata = '<div class="spacetopmedium"><section><div class="alternate-h2 toptitle"> Subjects: </div><div class="keywordlist">'+newMetadata+'</div></section></div><div class="clear"></div>';
                        $('#modality_subjects_wrapper').html(newMetadata);
                    }
                    else {
                        $modalitySubjects.find('a.keyworditem').last().after(newMetadata);
                    }
                }
                if(removeSubjects && removeSubjects.length > 0){
                    for(indexMetadata = 0;indexMetadata < removeSubjects.length;indexMetadata++){
                        $modalitySubjects.find('a[title="'+removeSubjects[indexMetadata]+'"]').remove();
                    }
                    if($modalitySubjects.find('a').length == 0){
                        $('#modality_subjects_wrapper').html('');
                    }
                }

                /* Tags */
                if(addTags && addTags.length > 0){
                    newMetadata = '';
                    for(indexMetadata = 0;indexMetadata < addTags.length;indexMetadata++){
                        newMetadata = newMetadata + '<a class="keyworditem" href="/search/?q=tag:'+encodeURI(addTags[indexMetadata])+'" title="'+addTags[indexMetadata]+'"><span itemprop="keywords"> '+addTags[indexMetadata]+' </span></a>';
            	    }
            	    if($modalitySubjects.length == 0){
            	        newMetadata = '<div class="spacetopmedium"><section><div class="alternate-h2 toptitle"> Tags: </div><div class="keywordlist">'+newMetadata+'</div></section></div><div class="clear"></div>';
                        $('#modality_tags_wrapper').html(newMetadata);
                    }
                    else {
                    	$modalitytags.find('a.keyworditem').last().after(newMetadata);
                    }
                }
                if(removeTags && removeTags.length > 0){
                    for(indexMetadata = 0;indexMetadata < removeTags.length;indexMetadata++){
                    	$modalitytags.find('a[title="'+removeTags[indexMetadata]+'"]').remove();
                    }
                    if($modalitytags.find('a').length == 0){
                        $('#modality_tags_wrapper').html('');
                    }
                }

                /* Search */
                if(addSearch && addSearch.length > 0){
                    newMetadata = '';
                    for(indexMetadata = 0;indexMetadata < addSearch.length;indexMetadata++){
                        newMetadata = newMetadata + '<a class="keyworditem" href="/search/?q='+encodeURI(addSearch[indexMetadata])+'" title="'+addSearch[indexMetadata]+'"><span itemprop="keywords">'+addSearch[indexMetadata]+'</span></a>';
            	    }
            	    if($modalitysearch.length == 0){
            	        newMetadata = '<div class="spacetopmedium"><section><div class="alternate-h2 toptitle"> Search Keywords: </div><div class="keywordlist">'+newMetadata+'</div></section></div><div class="clear"></div>';
                        $('#modality_search_wrapper').html(newMetadata);
                    }
                    else {
                    	$modalitysearch.find('a.keyworditem').last().after(newMetadata);
                    }
                }
                if(removeSearch && removeSearch.length > 0){
                    for(indexMetadata = 0;indexMetadata < removeSearch.length;indexMetadata++){
                    	$modalitysearch.find('a[title="'+removeSearch[indexMetadata]+'"]').remove();
                    }
                    if($modalitysearch.find('a').length == 0){
                        $('#modality_search_wrapper').html('');
                    }
                }
            }

            if (js_modality_data.artifact.hasOwnProperty('domains')) {
                /* Concept Nodes */
            	var newMetadata,
                    indexMetadata,
                    $modalityConceptNode = $('#modality_concept_node_wrapper .articleinfowrap'),
                    metadataDomains = js_modality_data.artifact.domains;
                if(metadataDomains && metadataDomains.length > 0){
                    newMetadata = '';
                    for(indexMetadata = 0; indexMetadata < metadataDomains.length; indexMetadata++) {
                        if(metadataDomains[indexMetadata].action == 'add') {
                            newMetadata += '<a title="'+metadataDomains[indexMetadata].encodedid+' ('+metadataDomains[indexMetadata].browseTerm+')" href="/search/?q='+metadataDomains[indexMetadata].browseTerm+'&type=concept" itemprop="keywords" data-encodedid="'+metadataDomains[indexMetadata].encodedid+'">'+metadataDomains[indexMetadata].encodedid+' ('+metadataDomains[indexMetadata].browseTerm+')</a>'
                        }
                        else if(metadataDomains[indexMetadata].action == 'remove'){
                            $modalityConceptNode.find('a[data-encodedid="'+metadataDomains[indexMetadata].encodedid+'"]').remove();
                        }
                    }
                    if($modalityConceptNode.length == 0 && $.trim(newMetadata) != ''){
                        newMetadata = '<section class="spacetopmedium"><h2 class="toptitle"> Concept Nodes: </h2><div class="articleinfowrap">'+newMetadata+'</div></section><div class="clear"></div>';
                        $('#modality_concept_node_wrapper').html(newMetadata);
                    }
                    else if($modalityConceptNode.length != 0 && $.trim($modalityConceptNode.html()) == '' && $.trim(newMetadata) == ''){
                        $('#modality_concept_node_wrapper').html('');
                    }
                    else {
                        $modalityConceptNode.append(newMetadata);
                    }
                }
            }

            if ($('#modality_content').length > 0) {
                var ajaxOptions = {
                    url: $('#modality_content').data('loadurl'),
                    success: function (data) {
                        if (data && data.indexOf('responseHeader') === -1) {
                            $('#modality_content').html(processXHTML(data));
                            $('p').each(function(){
                                if($.trim($(this).text()) == '' && $(this).children().length == 0){
                                    $(this).hide();
                                }
                            });
                            $('#modality_content').find('iframe').not('iframe[src*="tuvalabs.com"]').wrap('<div class="flex-video"></div>').each(function () {
                                if (this.src && this.src.indexOf('/assessment/ui/') !== -1) {
                                    $(this).parent().after('<div class="show-for-small"><a target="_blank" href="' + $(this).attr('src') + '" title="View Interactive">Click to view Interactive</a></div>');
                                    $(this).parent().addClass('geo-ilo-embed hide-for-small').removeClass('flex-video');
                                }
                                if (this.src && this.src.indexOf('ck12.org/embed')!== -1){
                                    $(this).addClass('ck12-embed-iframe');
                                    $(this).parent().removeClass('flex-video');
                                }
                            });
                            $('a', '#modality_content').each(function() {
                                var href = $(this).attr('href');
                                if (href) {
                                    if (!(href.match('ck12.org') || href.indexOf('#') === 0)) {
                                        $(this).attr('target', '_blank');
                                    }
                                }
                            });
                            //renderMathJax();
                        } else {
                            $('#modality_content').html('');
                            //hide copy edit and download link if artifact do not have xhtml
                            $('.js_editable').parent().hide();
                        }
                        $(window).scroll();
                        // 	show attributes for image in xhtml
                        $(document).trigger('flxweb.load.ImageAttributes');
                        window.vocabContainer = $('#modality_content');
                        $(document).trigger('flxweb.load.showvocabtooltips');
                        if (window.location.hash) {
                            window.location.hash = window.location.hash; // bug 33428, jump to hash after content is loaded
                        }
                        $("#modality_content").on('click', '.x-ck12-content-toggle', function(e){
                            console.log("!!");
                            e.preventDefault();
                            var targetElm = $(this).next()
                            var hidden = targetElm.hasClass('hide');
                            //TODO: make the labels below configurable on the element.
                            var txtShow = "Show Answers";
                            var txtHide = "Hide Answers";

                            if (hidden){
                                //show the div
                                $(this).find('a').text(txtHide);
                                targetElm.removeClass('hide');
                                window.dexterjs.logEvent('FBS_ACTION', {actionName:'hidden_content_toggle_show'});
                            } else {
                                $(this).find('a').text(txtShow);
                                targetElm.addClass('hide');
                                window.dexterjs.logEvent('FBS_ACTION', {actionName:'hidden_content_toggle_hide'});
                            }
                        });
                        $("#modality_content .x-ck12-hide-content").each(function(i,elm){
                            //TODO: make the labels below configurable on the element.
                            var txtShow = "Show Answers";
                            var txtHide = "Hide Answers";
                        	var toggleElm = $("<div class='x-ck12-content-toggle'></div>").html(_.template(
                        	  "<a href='#'><%=data.text%></a>",
                        	  {text: txtShow},
                        	  {variable:'data'}
                        	));
                        	$(elm).addClass('hide');
                        	$(toggleElm).insertBefore(elm);
                        });
                        window.setTimeout(renderMathJax, 3000);

                    },
                    error: function (jqXHR, textStatus) {
                        console.error(textStatus);
                    },
                    dataType: 'html'
                };

                //if we are loading drafts, don't use the CDN Cache
                if (ajaxOptions.url.indexOf('returnDraftIfDraftExists=true') !== -1) {
                    $.ajax(ajaxOptions);
                } else {
                    var cdnCache = new CDNCache(ajaxOptions);
                    cdnCache
                        .setExpirationAge('daily')
                        .fetch();
                }
            }

            $('#review_list_container').bind('flxweb.modality.read.initreviewlist', initReviewList);

            $('.quick-tips a').on('click', function(e){
                e.preventDefault();
                var $targetLink = $(e.currentTarget),
                    name = $targetLink.attr('name');
                if(name === 'vocabulary'){
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_ACTION', {
                            action_type: 'link',
                            action_name: 'qt_vocabulary',
                            screen_name: 'modality',
                            additional_params1: window.artifactID
                        });
                    }
                    window.scrollTo(0, $('.vocabulary_content').offset().top-100);
                }else if(name === 'myAnnotations'){
                    if (window.dexterjs){
                        window.dexterjs.logEvent('FBS_ACTION', {
                            action_type: 'link',
                            action_name: 'qt_annotations',
                            screen_name: 'modality',
                            additional_params1: window.artifactID
                        });
                    }
                    window.scrollTo(0, $('.myAnnotations').offset().top -100);
                }
            });

            $('.resources_container').one('flxweb.modality.resource.load', function () {
                var resourceTemplate, index, addMetadata, item, row_toggle_link, resourceURL, draft, html = '';
                draft = window.js_modality_data.artifact;
                if (draft.draftResources && draft.draftResources instanceof Array && draft.draftResources.length) {
                    resourceTemplate = $('#ck12_template_resource_row').html();
                    for (index = 0; index < draft.draftResources.length; index++) {
                        addMetadata = $(resourceTemplate);
                        item = draft.draftResources[index];

                        row_toggle_link = addMetadata.find('.js_resource_public_toggle');
                        resourceURL = item.resourceType === 'video' || item.resourceType === 'interactive' ? '' : item.resourceDetailsUrl;
                        addMetadata.find('.loading').remove();
                        addMetadata.find('.actions').removeClass('hide');

                        if (item.resourceIsPublic) {
                            addMetadata.find('.js_publishstate_icon').addClass('hide');
                            addMetadata.find('.js_noimage').removeClass('hide');
                            row_toggle_link.attr('data-ispublic', 'true').data('ispublic', 'true').removeClass('js_resource_processing').text(row_toggle_link.data('txtmakeprivate'));
                        } else {
                            addMetadata.find('.js_publishstate_icon').removeClass('hide');
                            addMetadata.find('.js_noimage').addClass('hide');
                            row_toggle_link.attr('data-ispublic', 'false').data('ispublic', 'false').removeClass('js_resource_processing').text(row_toggle_link.data('txtmakepublic'));
                        }

                        addMetadata.attr({
                            'data-resource-id': item.resourceId,
                            'data-resource-name': item.resourceName,
                            'data-resource-type': item.resourceType
                        }).data({
                            'resource-id': item.resourceId,
                            'resource-name': item.resourceName,
                            'resource-type': item.resourceType
                        });

                        addMetadata.find('.attachment_icon').addClass('type_' + item.resourceType);
                        addMetadata.find('.actions .js_resource_remove').attr({
                            'data-resource-id': item.resourceId,
                            'data-resource-revision-id': item.resourceRevisionId,
                            'data-artifact-id': item.artifactId,
                            'data-artifact-revision-id': item.artifactRevisionId
                        });

                        addMetadata.find('.actions .js_resource_edit').data('resource-public', item.resourceIsPublic).attr('data-resource-public', item.resourceIsPublic);
                        addMetadata.find('.js_resource_link').prop('href', resourceURL).text(item.resourceName);

                        // put description in hidden div
                        addMetadata.find('.actions .js_resource_description').html(item.resourceDescription);

                        // if there's a message for no resources displayed;
                        addMetadata.find('.js_msg_no_resources').addClass('hide');
                        addMetadata.find('.js_row_actions').remove();

                        html += addMetadata[0].outerHTML;
                    }
                    html = '<div class="artifact_attachment_container js_resource_container">' + html + '</div>';
                    $('.resources_container').html(html);
                } else {
                    item = $(this);
                    item.html('Loading...');
                    item.load(item.data('loadurl'), function () {
                        item.show(800);
                    });
                }
            });
            $('.js_modality_resources, .js_resources_toggle').one('click', function () {
                $('.resources_container').trigger('flxweb.modality.resource.load');
            });

            $('#artifact_summary_dialog').on('click', loadSummaryDialog);

            $('.js_standardboards_container').one('flxweb.modality.standardboards.load', function () {
                $.ajax({
                    url: $(this).data('loadurl'),
                    success: function (data) {
                        if (data && data.indexOf('NO_STANARD_BOARDS') === -1) {
                            onStandardBoardsSuccess(data);
                        }
                    },
                    error: function (jqXHR, textStatus) {
                        console.error(textStatus);
                    },
                    dataType: 'html'
                });

            });
            $('.js_metadata_toggle, .js_modality_details').one('click', function () {
                $('.js_standardboards_container').trigger('flxweb.modality.standardboards.load');
            });

            $('.modalitycontent').off('click.hash', 'a').on('click.hash', 'a', function(e) {
                var scrollElement,
                    href = $(this).attr('href');
                if (href && (href[0] === '#') && (href !== '#')) {
                    href = href.substring(1, href.length);
                    scrollElement = $(document.getElementById(href));
                    if(scrollElement.length !== 0) {
                    	e.preventDefault();
                        if(!scrollElement.is(':visible') && scrollElement.closest('[itemprop=video]').length){
                    	    scrollElement = scrollElement.closest('[itemprop=video]');
                        }
                        $('body').scrollTo(scrollElement.offset().top - $('header').height());
                    }
                }
            });

            /*$(window).on("hashchange", function () {
                window.scrollTo(window.scrollX, window.scrollY - $('header').height());
            });*/

            if($('#draft-label').text().length === 0){
                var user = User.getUser();
                var isLoggedIn = false;
                if(user.done(function(userInfo){
                    isLoggedIn = userInfo.isLoggedIn();
                    if(!userInfo.isLoggedIn()){
                        var nonsignin_html = '<tr><td><span class="circle disable-circle"></span></td><td colspan="2">Please <a href="#" class="signin-link">Sign In</a> to create your own Highlights / Notes</td></tr>';
                        var $nonsignin = $(nonsignin_html);
                        $('#notes-pagination').parent().before($nonsignin);
                        $nonsignin.on('click', 'a', function(e){
                            if (window.dexterjs){
                                window.dexterjs.logEvent('FBS_SIGNIN_CTA', {
                                    feature: 'annotations',
                                    source : 'my_notes',
                                    additional_params1: window.artifactID,
                                    additional_params2: window.artifactRevisionID
                                });
                            }
                            e.preventDefault();
                            require(['common/views/login.popup.view'], function(loginPopup){
                                loginPopup.showLoginDialogue();
                            });
                        });
                    }
                }))
                $(document).bind('flxweb.vocabulary.done', function(){
                    $(window).scroll(function(){
                        var stopPos = $('#modalities_container').height();
                        var $quickTip = $('.quick-tips').parent();

                        if($(window).scrollTop() > stopPos){
                            if(!$quickTip.hasClass('quick-tips-stop')){
                                $quickTip.addClass('quick-tips-stop');
                            }
                        }else{
                            if($quickTip.hasClass('quick-tips-stop')){
                                $quickTip.removeClass('quick-tips-stop');
                            }
                        }
                    });
                    require(['ck12annotator/ck12annotator', 'ck12annotator/mathjax.loaded'], function(CK12Annotator, mathjaxLoad){
                        mathjaxLoad.done(function(){
                            var containerSelector = '#modality_content';
                            var ck12Annotator = new CK12Annotator(containerSelector, window.artifactID, window.artifactRevisionID, isLoggedIn);
                            ck12Annotator.create();
                            var $tableSection = $('.myAnnotations-container');
                            ck12Annotator.annotationsPromise.done(function(annotations){
                                var newAnnotations = [];
                                annotations = annotations.filter(function(anno){    //Hide buggy annotations
                                    if(anno.migrated && anno.quote.trim().length < 3 && (!anno.text|| anno.text.length === 0)){
                                        return false;
                                    }
                                    return true;
                                });
                                var page = 0;
                                var itemsPerPage = 5;
                                var totalPage = Math.ceil(annotations.length/itemsPerPage)-1;
                                var showAnnotations = annotations.slice(0, itemsPerPage);
                                if(user.done(function(userInfo){
                                    if(userInfo.isLoggedIn()){
                                        $('.report-link').removeClass('hide');
                                        var email = 'support@ck12.org',
                                        subject = 'Having trouble with annotations',
                                        emailBody = '<Please provide some details about the issue you are experiencing with annotations>%0D%0A%0D%0A' +
                                        '--- Technical Details ---%0D%0A' +
                                        'Page:' + window.location.href + '%0D%0A' +
                                        'ID:' + userInfo.userInfoDetail.id+'%0D%0A'+
                                        'Browser:' + window.navigator.userAgent+'%0D%0A%0D%0A';
                                        $('.report-link a').attr('href', 'mailto:' + email + '?subject=' + subject + '&body=' +   emailBody);
                                        $('.report-link').off('click','a').on('click', 'a', function(e){
                                            // e.preventDefault();
                                            if (window.dexterjs){
                                                window.dexterjs.logEvent('FBS_ACTION', {
                                                    action_type: 'mailto_link',
                                                    action_name: 'report_an_issue',
                                                    screen_name: 'annotations',
                                                    additional_params1: window.artifactID
                                                    // additional_params2: window.context_json.encodedID
                                                });
                                            }
                                        });

                                        if(annotations.length === 0){
                                            var noAnnoMessage = '<tr class="no-annotation-message"><td><span class="circle disable-circle"></span></td><td colspan="2">Highlight or Annotate any text from above, and it will appear here.</td></tr>';
                                            var $noAnnoMessage = $(noAnnoMessage);
                                            $('#notes-pagination').parent().before($noAnnoMessage);
                                            return;
                                        }
                                        addToTable(showAnnotations);
                                        $('#notes-pagination').parent().removeClass('hide');
                                        if(page >= totalPage){
                                            $('#notes-pagination').parent().hide();
                                        }
                                    }
                                }))
                                $('.myAnnotations-container').off('click','.delete-annotation-btn').on('click','.delete-annotation-btn', function(){
                                    var annoID = $(this).attr('data-annoId');
                                    var targetAnno = annotations.filter(function(anno) {
                                        return anno.id === annoID;
                                    });
                                    if(targetAnno.length === 0){
                                        targetAnno = newAnnotations.filter(function (anno) {
                                            return anno.id === annoID;
                                        })
                                        var index = newAnnotations.indexOf(targetAnno[0]);
                                        if(index !== -1){
                                            targetAnno = newAnnotations.splice(index,1);
                                        }
                                    }
                                    $(containerSelector).data('annotator').deleteAnnotation(targetAnno[0]);

                                });
                                $('#notes-pagination').on('click', function(){
                                    if (window.dexterjs){
                                        window.dexterjs.logEvent('FBS_ACTION', {
                                            action_type: 'button',
                                            action_name: 'show_more',
                                            screen_name: 'my_notes',
                                            additional_params1: window.artifactID
                                        });
                                    if(annotations.length === 0){
                                        var noAnnoMessage = '<tr class="no-annotation-message"><td><span class="circle disable-circle"></span></td><td colspan="3">Highlight or Annotate any text from above, and it will appear here.</td></tr>';
                                        var $noAnnoMessage = $(noAnnoMessage);
                                        $('#notes-pagination').parent().before($noAnnoMessage);
                                        return;
                                    }
                                    page++;
                                    if(page >= totalPage){
                                        $(this).parent().hide();
                                    }
                                    showAnnotations = annotations.slice(page*itemsPerPage, page*itemsPerPage+itemsPerPage);
                                    addToTable(showAnnotations);
                                }});
                                
                                $(document).off('createdNewAnnotation').on('createdNewAnnotation', function(e, annotation){
                                    $('.no-annotation-message').remove();
                                    var newAnno = '<tr data-annoId="'+annotation.id+'">'+
                                    '<td><span class="circle '+annotation.highlightColor+'"></span></td>'+
                                    '<td>'+ _.escape(annotation.quote)+'</td>'+
                                    '<td>'+ _.escape(annotation.text||'')+'</td>'+
                                    '<td><span class="delete-btn-container"><i class="icon-delete_cc delete-annotation-btn" data-annoId="'+annotation.id+'" title="Delete?"></i></span></td>'+
                                    '</tr>';
                                    $('.myAnnotations-container tbody').prepend(newAnno);
                                    newAnnotations.push(annotation);
                                });
                                $(document).off('updateAnnotation').on('updateAnnotation', function(e, annotation){
                                    var $targetRow = $tableSection.find('tr[data-annoId='+annotation.id+']');
                                    $targetRow.find('td:nth-child(1) .circle').attr('class', 'circle '+annotation.highlightColor);
                                    $targetRow.find('td:nth-child(3)').html(_.escape(annotation.text || ''));
                                });
                                $(document).off('deletedAnnotation').on('deletedAnnotation', function(e,annotation){
                                    $tableSection.find('tr[data-annoId='+annotation.id+']').remove();
                                    if($tableSection.find('tr').length === 2){ //no annotation in the table. 2 is table header and hidden 'show more' button.
                                    var noAnnoMessage = '<tr class="no-annotation-message"><td><span class="circle disable-circle"></span></td><td colspan="2">Highlight or Annotate any text from above, and it will appear here.</td></tr>';
                                    var $noAnnoMessage = $(noAnnoMessage);
                                    $('#notes-pagination').parent().before($noAnnoMessage);
                                }
                            });

                            $(document).off('createdNewAnnotation').on('createdNewAnnotation', function(e, annotation){
                                $('.no-annotation-message').remove();
                                var newAnno = '<tr data-annoId="'+annotation.id+'">'+
                                                '<td><span class="circle '+annotation.highlightColor+'"></span></td>'+
                                                '<td>'+ _.escape(annotation.quote)+'</td>'+
                                                '<td>'+ _.escape(annotation.text||'')+'</td>'+
                                                '<td><span class="delete-btn-container"><i class="icon-delete_cc delete-annotation-btn" data-annoId="'+annotation.id+'" title="Delete?"></i></span></td>'+
                                              '</tr>';
                                $('.myAnnotations-container tbody').prepend(newAnno);
                                newAnnotations.push(annotation);
                            });
                            $(document).off('updateAnnotation').on('updateAnnotation', function(e, annotation){
                                var $targetRow = $tableSection.find('tr[data-annoId='+annotation.id+']');
                                $targetRow.find('td:nth-child(1) .circle').attr('class', 'circle '+annotation.highlightColor);
                                $targetRow.find('td:nth-child(3)').html(_.escape(annotation.text || ''));
                            });
                            $(document).off('deletedAnnotation').on('deletedAnnotation', function(e,annotation){
                                $tableSection.find('tr[data-annoId='+annotation.id+']').remove();
                                if($tableSection.find('tr').length === 2){ //no annotation in the table. 2 is table header and hidden 'show more' button.
                                  var noAnnoMessage = '<tr class="no-annotation-message"><td><span class="circle disable-circle"></span></td><td colspan="3">Highlight or Annotate any text from above, and it will appear here.</td></tr>';
                                  var $noAnnoMessage = $(noAnnoMessage);
                                  $('#notes-pagination').parent().before($noAnnoMessage);
                                }
                            });

                        });
                        });

                    });
                });
            }
        });
    });
