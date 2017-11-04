/**
 * Copyright 2007-2013 CK-12 Foundation
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
 *
 * $Id$
 */
/* global artifact_json, context_json, MathJax */
define('flxweb.details.chapter', [
    'jquery',
    'flxweb.models.artifact',
    'flxweb.details.common',
    'common/utils/utils',
    'common/views/modal.view',
    '../modality/js/utils/plix.dressing',
    'jquery-ui',
    'flxweb.library.common',
    'flxweb.global',
    'flxweb.bookbuilder'
], function($, Artifact, artifactDetailsCommon, Util, ModalView, PlixDressing) {

    function escapeHTML(string) {
        string = string.toString();
        return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function bookContentLoadCallback(event, data) {
        var bookinfo = context_json;
        var $tocList = $('#artifact_content').find('.toc_list');
        var chapter_pos = $tocList.data('chapterPosition');
        var chUrl = '', chapter_children = [];
        var $li, $link, $summary, bookInCollaboration;
        if (context_json){
            var artifactHandle = context_json.handle;
            var artifactType = context_json.artifactType;
            var artifactRevision = context_json.revision || context_json.revisions[0].revision;
            var artTypeHandle   = artifactType + '/' + artifactHandle;
            //check if the Book URL has a revision in it i.e /r<\d+>/.
            //If not, then the links from the TOC should not have revision either.
            var bookHasRevision = /\/r\d+\//.test(document.location.href);
            var revisionPath    = '/r' + artifactRevision;
            var sectionPath     = '/section/' + chapter_pos + '.';
        }
        $('#artifact_content .toc_list').empty();
        if (data.revisions[0].children){
            chapter_children = data.revisions[0].children;
            bookInCollaboration = Util.getQueryParam('collaboration', window.location.href);
        }
        $.each(chapter_children, function(i, chapter){
            chUrl = $.flxweb.settings.webroot_url;
            draftLabel = '';
            if (chapter.hasDraft) {
                draftLabel = '<span class="draft-section">DRAFT</span>';
            }
            if (chapter_pos){
                if (bookinfo && bookinfo.realm) {
                    chUrl += encodeURIComponent(bookinfo.realm)+'/';
                }
                chUrl += artTypeHandle;
                if ( bookHasRevision ) {
                    chUrl += revisionPath;
                }
                chUrl += sectionPath + (i+1) + '/';
                if (bookInCollaboration) {
                    chUrl += '?collaboration=true';
                }
                $link = $('<a>',{href:chUrl}).html('<span>' + chapter_pos + '.' + (i+1) + '.</span><h2 class="anchor-h2">' + escapeHTML(chapter.title) + '</h2>' + draftLabel);
                $li = $('<li>').append($link);
            } else {
                chUrl += chapter.artifactType +'/'+ chapter.handle;
                if (bookInCollaboration) {
                    chUrl += '?collaboration=true';
                }
                $link = $('<a>',{'href':chUrl}).html('<span>' + (i+1) + '.</span><h2 class="anchor-h2">' + escapeHTML(chapter.title) + '</h2>');
                $summary = $('<p>', {'class':'listitemsummary'}).html(chapter.summary ? escapeHTML(chapter.summary) : '' );
                $li = $('<li>').append($link).append($summary);
            }
            $tocList.append($li);
        });
        if (chapter_children.length) {
            $('.chapter-outline-header').removeClass('hide');
        }

        processXHTML(data.xhtml);
        $('a', '#artifact_content').each(function() {
            if (!($(this).attr('href').match('ck12.org') || $(this).attr('href').indexOf('#') === 0)) {
                $(this).attr('target', '_blank');
            }
        });
        // renderMathJax();
    }

    function renderMathJax() {
        var cnt = 0;
        $('.x-ck12-mathEditor, .x-ck12-math, .x-ck12-hwpmath, .x-ck12-block-math', '#artifact_content').each(function() {
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
                    /*if($this.data("math-class")=="x-ck12-block-math"){
                    	mathLatex = "@$$"+mathLatex+"@$$";
	                }
    	            else {
	                    mathLatex = "@$"+mathLatex+"@$";
        	        }
        	        mathLatex = mathLatex.replace(/</g, "&lt;");*/
                    $this.html(mathLatex).removeAttr('data-tex-mathjax').closest('p').css('overflow-y','hidden');
                    // MathJax.Hub.Queue(['Typeset', MathJax.Hub, $(this)[0]]);
                    cnt ++;
                }
                else {
                    if($this.attr('alt') !== undefined){
                        $this.attr('alt',$this.attr('alt').replace('<', '\\lt ').replace('>', '\\gt '));
                    }
                    if(!$this.data('tex')){
                        $this.remove();
                    }
                }
            } catch (merr) {
                console.log('Error rendering math: ' + merr);
            }
        });
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'artifact_content']);
        PlixDressing.init();
        console.log('Queued ' + cnt + ' math expressions');
    }

    function processXHTML(ixhtml) {
        var $tc = $('#temp_artifact_xhtml_content');
        $tc.html(ixhtml);
        var $dataEls = $tc.children('.x-ck12-data');
        if ($dataEls.size() > 0) {
            var introduction = $dataEls.first().html();
            if ($dataEls.size() > 1) {
                var summary = $dataEls.get(1).innerHTML;
                if ($.trim(summary)) {
                    $('#artifact_content h3').removeClass('hide').after(summary);
                }
            }
            $('#artifact_content .js_detailbody').prepend($('<p>').html(introduction));
        }
        $tc.html('');
    }
    
    function checkForCollaborator() {
    	var bookID, _d = $.Deferred();
        Util.ajax({
            url: Util.getApiUrl('flx/get/editing/group/' + artifact_json.revisions[0].ancestors['0.0'].artifactID),
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
        return _d.promise();
    }
    
    function checkChapterCollaboration() {
    	var members, index = 0, collaborator = false, userID;
        userID = $('header').data('user');
        checkForCollaborator().done(function(data) {
            if (data && data.group && data.group.members) {
                members = data.group.members;
                for (index = 0; index < members.length; index++) {
                    if (members[index].id === userID) {
                        collaborator = true;
                        break;
                    }
                }
                if(collaborator){
                	$($('.js-shareGroupLink')[0]).attr('title','Book is in Collaboration Editing').addClass('already_in_library').siblings('.groups_share_dialog').remove();
                	$('#add_to_book').attr('title','Book is in Collaboration Editing').addClass('already_in_library');
                	if(artifact_json.creatorID != userID) {
                		$('#view_attachments .cannot_add_resources').remove();
                	}
                }
            }
            $('#sideNav2').animate({opacity: 1}, 2000);
        }).fail(function(){
            ModalView.alert("There was an error.");
        });
    }

    function artifactContentLoadSuccess() {
        $('#artifact_content').data('loader').done(function(data){
            $('#artifact_content').trigger('flxweb.artifact.content.load.success', data);
            if($.cookie('flxweb_role') === 'teacher'){
                $('.modality-info').removeClass('hide');
            }
            window.setTimeout(renderMathJax, 3000);
        });
    }

    function checkForCollaborator() {
        var bookID, _d = $.Deferred();
        bookID = artifact_json.revisions[0].ancestors['0.0'].artifactID;
        Artifact.checkIfbookInCollaborationLibrary(bookID).done(function(data){
            if (data){
                Util.ajax({
                    url: Util.getApiUrl('flx/get/editing/group/' + bookID),
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
            } else {
                _d.reject(null);
            }
        });
        return _d.promise();
    }

    function checkChapterCollaboration() {
        var members, index = 0, collaborator = false, userID;
        userID = $('header').data('user');
        checkForCollaborator().done(function(data) {
            if (data && data.group && data.group.members) {
                members = data.group.members;
                for (index = 0; index < members.length; index++) {
                    if (members[index].id === userID) {
                        collaborator = true;
                        break;
                    }
                }
                if(collaborator){
                    $($('.js-shareGroupLink')[0]).attr('title','Book is in Collaboration Editing').addClass('already_in_library').siblings('.groups_share_dialog').remove();
                    $('#add_to_book').attr('title','Book is in Collaboration Editing').addClass('already_in_library');
                    if(artifact_json.creatorID != userID) {
                        $('#view_attachments .cannot_add_resources').remove();
                    }
                }
            }
            artifactDetailsCommon.artifactXhtml(true, collaborator);
            artifactContentLoadSuccess();
            $('#sideNav2').animate({opacity: 1}, 2000);
        }).fail(function(){
            artifactDetailsCommon.artifactXhtml(true, collaborator);
            artifactContentLoadSuccess();
            console.log('Could not determine collaboration status.');
            $('#sideNav2').animate({opacity: 1}, 1000);
        });
    }

    function domReady() {
        var bookInCollaboration;
        $("#sideNav2").removeClass("hide-for-sidenav2");
        bookInCollaboration = Util.getQueryParam('collaboration', window.location.href);
        if (bookInCollaboration === 'true') {
            $('a', '#nav_artifact').add('a', '#navartifacttopsmall').each(function() {
                $(this).attr('href', $(this).attr('href') + '?collaboration=true');
            });
        }
        checkChapterCollaboration();
        $('#artifact_content').bind('flxweb.artifact.content.load.success',bookContentLoadCallback);
        $('.js-collapse-details').off('click.expand').on('click.expand', function() {
            $('#view_details').toggleClass('show');
            $('.show', '.js-collapse-details').toggleClass('hide');
            $('.tip', '.js-collapse-details').toggleClass('up');
        });

        $('#artifact_content').off('click.hash', 'a').on('click.hash', 'a', function(e) {
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
    }

    $(document).ready(domReady);
});
