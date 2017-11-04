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
/* global artifactID, artifact_json*/
define('flxweb.details.flexbook',
        ['jquery',
        'flxweb.models.artifact',
        'common/utils/utils',
        'common/views/modal.view',
        'jquery-ui',
        'flxweb.library.common',
        'flxweb.global',
        'flxweb.bookbuilder'],
function($, Artifact, Util) {

    function escapeHTML(string) {
        string = string.toString();
        return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function bookContentLoadCallback(event, data) {
        var draftLabel, bookInCollaboration;
        if (data) {
            var artifactHandle = encodeURIComponent(data['handle']);
            var artifactType = data['artifactType'];
            var artifactRevision = data['revision'] || data['revisions'][0]['revision'];
            $('#artifact_content .toc_list').empty();
            if (data['revisions'][0]['children']) {
                bookInCollaboration = Util.getQueryParam('collaboration', window.location.href);
                $.each(data['revisions'][0]['children'], function(i, chapter){
                    draftLabel = '';
                    var chUrl = $.flxweb.settings.webroot_url;
                    if (data['realm']) {
                        chUrl += encodeURIComponent(data['realm'])+'/';
                    }
                    //check if the Book URL has a revision in it i.e /r<\d+>/.
                    //If not, then the links from the TOC should not have revision either.
                    if (/\/r\d+\/?$/.test(document.location.href)) {
                        chUrl += artifactType +'/'+ artifactHandle + '/r'+artifactRevision+'/section/'+(i+1)+'.0/';
                    } else {
                        chUrl += artifactType +'/'+ artifactHandle + '/section/'+(i+1)+'.0/';
                    }
                    if (bookInCollaboration) {
                        chUrl += '?collaboration=true';
                    }
                    if (chapter.hasDraft) {
                        draftLabel = '<span class="draft-section">DRAFT</span>';
                    }
                    var $link = $('<a>',{'href':chUrl}).html('<span>' + (i+1) + '.</span><h2 class="anchor-h2">' + escapeHTML(chapter['title']) + '</h2>' + draftLabel);
                    var $summary = $('<p>', {'class':'listitemsummary'}).html((chapter['summary'] && chapter['summary'] !== 'None') ? escapeHTML(chapter['summary']) : '' );
                    var $li = $('<li>').append($link).append($summary);
                    $('#artifact_content').find('.toc_list').append($li);
                });
            }
        }
    }

    function checkForCollaborator() {

        var _d = $.Deferred();
        Artifact.checkIfbookInCollaborationLibrary(Number(artifactID)).done(function(data){
            if (data){
                Util.ajax({
                    url: Util.getApiUrl('flx/get/editing/group/' + artifactID),
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

    function checkBookCollaboration() {
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
                        $('#add_to_library').attr('title','Book is in Collaboration Editing').addClass('already_in_library');
                        $('#personalize_link').attr('title','Edit this FlexBook').html('Edit');
                        $('#personalize_link').siblings('span.customize-help-wrapper').remove();
                        $('#view_attachments .cannot_add_resources').remove();
                        if(data.finalization){
                            $('#personalize_link').attr('href','javascript:;').addClass('already_in_library');
                        }
                    }
                }
            }
            $('#sideNav2').animate({opacity: 1}, 2000);
        }).fail(function(){
            console.log('Could not determine collaboration status.');
            $('#sideNav2').animate({opacity: 1}, 1000);
        });
    }

    function domReady() {
    	$("#sideNav2").removeClass("hide-for-sidenav2");
        checkBookCollaboration();
        $('#artifact_content').bind('flxweb.artifact.content.load.success',bookContentLoadCallback);
        window.title = $('#artifact_title span.artifact-title-details').text().trim();
        $('#artifact_content').data('loader').done(function(data){
            $('#artifact_content').trigger('flxweb.artifact.content.load.success', data);
        });
        $('.js-collapse-details').off('click.expand').on('click.expand', function() {
            $('#view_details').toggleClass('show');
            $('.show', '.js-collapse-details').toggleClass('hide');
            $('.tip', '.js-collapse-details').toggleClass('up');
        });
        if ($('.answer_key_wrapper').length > 0) {
            $.ajax({
                url: $('.answer_key_wrapper').data('loadurl'),
                success: function (data) {
                    $('.answer_key_wrapper').html(data);
                },
                error: function (jqXHR, textStatus) {
                    console.error(textStatus);
                },
                dataType: 'html'
            });
        }
    }

    $(document).ready(domReady);
});
