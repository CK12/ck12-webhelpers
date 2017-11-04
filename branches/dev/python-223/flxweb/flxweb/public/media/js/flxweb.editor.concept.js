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
 * $Id: flxweb.details.flexbook.js 12422 2011-08-19 22:51:58Z ravi $
 */
define('flxweb.editor.concept', [
        'jquery', 'underscore', 'common/utils/utils', 'common/utils/user', 'flxweb.editor.errors', 'flxweb.models.artifact', 'common/views/breadcrumb.view', 'common/utils/date',
        'flxweb.editor.tinymce.loader',
        'flxweb.utils.cookie',
        'flxwebSave/APIUtil',
        'common/views/modal.view',
        'text!templates/editor_attribution_list.html',
        'text!templates/editor_subject_list.html',
        'text!templates/editor_tag_list.html',
        'text!templates/editor_search_list.html',
        'text!templates/editor_concept_list.html',
        'text!templates/editor_collection_list.html',
        'text!templates/artifact_xhtml_template.html',
        'flxweb.global', 'flxweb.editor.common', 'flxweb.editor.tinymce', 'flxweb.settings', 'flxweb.editor.covereditor'
    ],
    function ($, _, Util, User, Errors, Artifact, Breadcrumb, DateUtil, loader, cookie, APIUtil, ModalView,
        editor_attribution_list, editor_subject_list, editor_tag_list, editor_search_list, editor_concept_list, editor_collection_list, artifact_xhtml_template) {

        'use strict';

        var draftInterval, draftSaveInProgress, xhr, navigate,
            artifact = null,
            save_in_progress = false,
            showRevisionPopup = true,
            ck12Settings = $.flxweb.settings,
            data_image_save_in_progress = false,
            doSave = false,
            dataImageClass = 'x-ck12-encodedimage',
            imagesLeft = 0,
            imageerror = false,
            ignoreDataImages = false,
            draftID = false,
            isDraftSaveError = false,
            ignoreVideo = false,
            userRole,
            userInfo,
            draftFinalized = false,
            artifactChangeEvent = false,
            artifactForceSaveEvent = false,
            stickyScrollTop = Math.round($('.validation-container').offset().top - $('header').height());

        window.imageClassIterator = 0;
        editor_attribution_list = _.template(editor_attribution_list, null, {
            'variable': 'data'
        });
        editor_subject_list = _.template(editor_subject_list, null, {
            'variable': 'data'
        });
        editor_tag_list = _.template(editor_tag_list, null, {
            'variable': 'data'
        });
        editor_search_list = _.template(editor_search_list, null, {
            'variable': 'data'
        });
        editor_concept_list = _.template(editor_concept_list, null, {
            'variable': 'data'
        });
        editor_collection_list = _.template(editor_collection_list, null, {
            'variable': 'data'
        });
        artifact_xhtml_template = _.template(artifact_xhtml_template, null, {
            'variable': 'data'
        });

        function onArtifactSaveSuccess(response) {
            var payload;
            if (!(response.status && response.status === 'error')) {
                artifact.set(response, {
                    'silent': true
                });
                artifact.set({
                    'latestRevisionID': response.artifactRevisionID,
                    'creator': userInfo ? userInfo.userInfoDetail.firstName + ' ' + userInfo.userInfoDetail.lastName : null
                });
                xhr = '';
                return true;
            }
            $.flxweb.editor.hideSaveDialog();
            save_in_progress = false;
            showRevisionPopup = true;
            var xhrStatus, error_type, error_exception, options = {
                'width': 670,
                'className': 'save-error-modal',
                'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                'contentText': 'There was an error saving this ' + $('#modality_select').find(':selected').text() + ' modality',
                'buttons': [{
                    'text': 'OK, got it!',
                    'className': 'turquoise',
                    'onclick': $.flxweb.editor.hideSaveDialog
                }]
            };
            if (xhr.hasOwnProperty('status')) {
                xhrStatus = xhr.status;
            }
            if (response.hasOwnProperty('data')) {
                error_type = response.data.error_type || 'ARTIFACT_SAVE_UNKNOWN_ERROR';
                error_exception = response.data.exceptionType || 'UNKNOWN_EXCEPTION';
                if (!(Errors.hasOwnProperty(error_type))) {
                    error_type = 'ARTIFACT_SAVE_UNKNOWN_ERROR';
                    error_exception = 'UNKNOWN_EXCEPTION';
                }
                $.extend(options, {
                    'contentText': Errors[error_type].message
                });
                if (Errors[error_type].hasOwnProperty('faqLink')) {
                    $.extend(options, {
                        'buttons': [{
                            'text': 'How do I fix this?',
                            'className': 'dusty-grey',
                            'icon': 'icon-new-window',
                            'onclick': function () {
                                $.flxweb.editor.hideSaveDialog();
                                var ads_payload = {
                                    'feature': 'editor',
                                    'help_topic_id': 'EDITOR_FAQ_SAVE_ERROR_MODAL',
                                    'page_type': 'concept_editor',
                                    'error_id': response.data.errorID
                                };
                                $.flxweb.logADS('fbs_help', ads_payload);
                                window.open(Errors[error_type].faqLink, '_blank');
                            }
                        }, {
                            'text': 'OK, got it!',
                            'className': 'turquoise',
                            'onclick': $.flxweb.editor.hideSaveDialog
                        }]
                    });
                } else if (Errors[error_type].hasOwnProperty('CTA')) {
                    $.extend(options, {
                        'buttons': [{
                            'text': Errors[error_type].CTA,
                            'className': 'turquoise',
                            'onclick': function () {
                                var data = {};
                                delete response.data.traceback;
                                if (xhrStatus) {
                                    response.data.httpstatus = xhrStatus;
                                }
                                data.body = response.data;
                                data.subject = 'Artifact Save Error, ID: ' + (response.data.errorID || new Date().getTime());
                                $.flxweb.editor.contactSupport(data);
                            }
                        }]
                    });
                }
            } else if (response.hasOwnProperty('message')) {
                $.extend(options, {
                    'contentText': response.message
                });
            }
            $.flxweb.editor.showSaveDialog(options);
            payload = {
                'error_type': 'save_error',
                'error_code': error_type || 'ARTIFACT_SAVE_UNKNOWN_ERROR',
                'error_exception': error_exception || 'UNKNOWN_EXCEPTION',
                'page_type': 'concept_editor',
                'feature': 'editor',
                'http_status': '200'
            };
            $.flxweb.logADS('fbs_error', payload);
            return false;
        }

        function artifactSaveSuccess(model, response) {
            if (response) {
                var redirect_url, payload, previousCover = artifact.get('coverImage');
                if (onArtifactSaveSuccess(response)) {
                    if (response.context && response.position) {
                        redirect_url = $.flxweb.settings.webroot_url;
                        redirect_url += escape(response.context.perma);
                        redirect_url += 'r' + response.context.latestRevision;
                        redirect_url += '/section/';
                        redirect_url += response.position + '/';
                        redirect_url += artifact.get('handle') + '/';
                    } else {
                        redirect_url = artifact.get('artifact_url');
                    }
                    draftID = undefined;
                    /*ADS log customize Complete*/
                    payload = {
                        'artifactID': response.artifactID,
                        'memberID': ads_userid
                    };
                    $.flxweb.logADS('fbs_customize_complete', payload);
                    save_in_progress = false;
                    $.flxweb.editor.hideSaveDialog();
                    $('#draft-label').data('saved', true);
                    if (!(artifact.get('coverImage'))) {
                        payload = {
                            'error_type': 'COVER_IMAGE_LOST',
                            'page_type': 'concept_editor',
                            'previousCover': previousCover,
                            'artifactID': artifact.get('artifactID'),
                            'artifactRevisionID': artifact.get('artifactRevisionID'),
                            'userID': $('header').data('user')
                        };
                        $.flxweb.logADS('fbs_error', payload);
                    }
                    draftFinalized = true;
                    window.location = redirect_url;
                }
            }
        }

        function artifactSaveError(artifact, errorData) {
            save_in_progress = false;
            showRevisionPopup = true;
            $.flxweb.editor.hideSaveDialog();
            $.flxweb.editor.showSaveDialog({
                'width': 670,
                'className': 'save-error-modal',
                'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                'contentText': $.flxweb.gettext(
                  (errorData && errorData.status != undefined && Errors[errorData.status] ?
                    Errors[errorData.status].message :
                    Errors.SAVE_FAIL_MODALITY.message), {
                    'modality': $('#modality_select').find(':selected').text()
                }),
                'buttons':
                ( errorData &&
                  errorData.status != undefined &&
                  Errors[errorData.status] &&
                  Errors[errorData.status].BTN_TEXT ?
                  [{
                      'text': Errors[errorData.status].BTN_TEXT ,
                      'className': 'turquoise',
                      'onclick': $.flxweb.editor.hideSaveDialog
                  }] :
                [{
                    'text': Errors.SAVE_FAIL_MODALITY.CTA,
                    'className': 'turquoise',
                    'onclick': function () {
                        var data = {},
                            errorJSON = {};
                        errorJSON.error_type = 'SAVE_FAIL_MODALITY';
                        errorJSON.exceptionType = 'API_FAIL';
                        errorJSON.errorID = new Date().getTime();
                        errorJSON.artifactRevisionID = artifactRevisionID;
                        errorJSON.artifactID = artifactID;
                        errorJSON.artifactType = $('#modality_select').val();
                        if (xhr.hasOwnProperty('status')) {
                            errorJSON.httpstatus = xhr.status;
                        }
                        data.body = errorJSON;
                        data.subject = 'Artifact Save Error, API FAILED';
                        $.flxweb.editor.contactSupport(data);
                    }
                }])
            });
            var payload = {
                'error_type': 'save_error',
                'error_code': 'SAVE_FAIL_MODALITY',
                'error_exception': 'API_FAIL',
                'page_type': 'concept_editor',
                'feature': 'editor',
                'http_status': '500'
            };
            $.flxweb.logADS('fbs_error', payload);
        }

        function validateArtifactEncodedID() {

            var msg, tmp, sub, brn, nnn, dddd, j,
                artifactencodedid = ($('#txt_artifactencodedid').val() || '').trim(),
                intRegex = /^\d+$/;

            // if EID is not default 'none' or blank i.e if it is specified.
            if (artifactencodedid !== '' && artifactencodedid.toLowerCase() !== 'none') {

                if (artifact.get('artifactType') === 'concept' || artifact.get('artifactType') === 'lesson') {

                    /*eg.   'ENG.TST.110.123.L.7387848
                            'MAT.ALG.130.L.1'
                    SUB - 3 letters/numbers
                    BRN - 3 letters/numbers
                    NNN - 3 digit numbers only
                    DDDD - any digit number (OPTIONAL)
                    T - any length letter/number
                    J - any digit number only
                    */

                    tmp = artifactencodedid.split('.');

                    sub = tmp[0];
                    brn = tmp[1];
                    nnn = tmp[2];
                    dddd = tmp[3];
                    j = tmp[tmp.length - 1];

                    if ((sub && sub.length !== 3) || (brn && brn.length !== 3)) {
                        msg = 'INVALID_ENCODEDID_BRANCH';
                    }
                    if ((nnn && nnn.length !== 3) || !intRegex.test(nnn)) {
                        msg = 'INVALID_ENCODEDID_CONCEPT';
                    }
                    if (tmp.length === 6 && dddd && !intRegex.test(dddd)) {
                        msg = 'INVALID_ENCODEDID_CONCEPT_DECIMAL';
                    }
                    if (j && !intRegex.test(j)) {
                        msg = 'INVALID_ENCODEDID_J_VALUE';
                    }
                    if (tmp.length < 3) {
                        msg = 'INVALID_ENCODEDID_FORMAT';
                    }
                }
            }

            if (msg) {
                $.flxweb.editor.showSaveDialog({
                    'headerText': 'Warning',
                    'contentText': Errors[msg].message,
                    'buttons': [{
                        'text': 'Save anyway',
                        'className': 'dusty-grey',
                        'onclick': function () {
                            $('#txt_artifactencodedid').data('edit', 'false');
                            $.flxweb.editor.hideSaveDialog();
                            saveArtifact();
                        }
                    }, {
                        'text': 'Edit encoded ID',
                        'className': 'turquoise',
                        'onclick': function () {
                            $('#txt_artifactencodedid').focus().select();
                            $('#txt_artifactencodedid').data('edit', 'true');
                            $.flxweb.editor.hideSaveDialog();
                        }
                    }]
                });

                return false;
            }
            return true;
        }

        function getArtifactRevisionComments() {
            if (-1 !== ($.flxweb.settings.edit_allowed_roles).split(',').indexOf(flxweb_role)) {
                var msg = 'Brief description of changes (including author initials for shared works):<br/>' + $('#revisionCommentInput').html();
                $.flxweb.editor.showSaveDialog({
                    'headerText': 'Revision Comments (Optional)',
                    'contentText': msg,
                    'buttons': [{
                        'text': 'Cancel',
                        'className': 'dusty-grey',
                        'onclick': $.flxweb.editor.hideSaveDialog
                    }, {
                        'text': 'Save',
                        'className': 'turquoise',
                        'onclick': function () {
                            showRevisionPopup = false;
                            artifact.set({
                                'revisionComment': ($('.dialog_msg input#txt_artifact_revision_comment.forminput').val() || '').trim()
                            }, {
                                'silent': true
                            });
                            $.flxweb.editor.hideSaveDialog();
                            User.getUser().done(function(user){
                                userInfo = user;
                                saveArtifact();
                            });
                        }
                    }]
                });
            } else {
                return true;
            }
            return false;
        }

        function checkForLargeContent() {
            var content_length = JSON.stringify(artifact.get('xhtml')).length,
                warn_size = $('#artifact_content').tinymce().getParam('warn_large_content_min_size') * 1024; //In bytes
            if (content_length > warn_size) {
                return true;
            }
            return false;
        }

        function processXHTML(xhtml) {
        	$('span[class^="MathJax"], div[id^="MathJax"], img:not([src])', xhtml).remove();
            /*$('span[class^="MathJax"]', xhtml).remove();
            $('img:not([src])', xhtml).remove();*/
            if (xhtml.find('#MathJax_Hidden').length > 0 && xhtml.find('#MathJax_Hidden').parent().children().length === 1) {
                xhtml.find('#MathJax_Hidden').parent().remove();
            }
            //$('div[id^="MathJax"]', xhtml).remove();
            xhtml = $.flxweb.editor.removeValidatorattributes(xhtml.html());
            xhtml = $('<div>' + xhtml + '</div>');
            xhtml.find("div[itemprop='video']").each(function() {
                if ($(this).next('p:empty').length) {
                    $(this).next('p:empty').remove();
                }
            });
            $('.MathJax_Display', xhtml).remove();
            $('span[data-mce-type="bookmark"]', xhtml).remove();
            //xhtml.find('div').html($.trim(xhtml.find('div').html()));
            xhtml.find('div').each(function () {
                var _t = $(this);
                _t.html((_t.html() || '').trim());
            });

            $('div:empty', xhtml).remove();
            $.each((xhtml.find('.x-ck12-mathEditor, p:empty, span[style]')), function () {
            	var $this = $(this);
            	if($this.hasClass('x-ck12-mathEditor')){
                	$this.html('').attr('data-contenteditable', false).removeAttr('contenteditable').removeClass('selectedElement showContextMenu forSingleClick doubleClick');
            		if($this.data('edithtml').indexOf('paste-option') !== -1){
            			$this.attr('data-edithtml','');
            		}
                } else if(this.tagName === 'P' && $this.is(':empty')) {
                	$this.html('&#160;');
                } else if($this.css('display') === 'none' || ($this.attr('style')).indexOf('display: none') !== -1) {
                	$this.html('');
                }
            });
            xhtml.find('*').removeClass('x-ck12-validated x-ck12-dirty').removeAttr('data-error'); //removing validation related classes before saving the artifact.
            return $(xhtml).html();
        }

        function checkForDuplicateTitle() {
            if ($.flxweb.editor.isTitleDuplicate()) {
                $.flxweb.editor.showSaveDialog({
                    'width': 670,
                    'className': 'save-error-modal',
                    'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                    'contentText': Errors.CONCEPT_ALREADY_EXISTS.message,
                    'buttons': [{
                        'text': 'How do I fix this?',
                        'className': 'dusty-grey',
                        'icon': 'icon-new-window',
                        'onclick': function () {
                            $.flxweb.editor.hideSaveDialog();
                            window.open(Errors.CONCEPT_ALREADY_EXISTS.faqLink, '_blank');
                        }
                    }, {
                        'text': 'OK, got it!',
                        'className': 'turquoise',
                        'onclick': $.flxweb.editor.hideSaveDialog
                    }]
                });
                return true;
            }
            return false;
        }

        function shouldCallNewAPI(artifact){
          // RIGHT NOW NEW APIS Support
          var allowedArtifactTypes =  ['book', 'chapter', 'lesson','enrichment', 'section', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook',
                                        'lecture', 'lab', 'preread', 'postread', 'activity', 'prepostread', 'whileread', 'flashcard','studyguide',
                                        'lessonplan', 'handout', 'rubric', 'presentation', 'web', 'rwa'];
          return ( allowedArtifactTypes.indexOf(artifact.artifactType) != -1)

        }

        function saveArtifactContentFinal() {
            var save_msg = 'Saving Modality...';
            if (artifact.get('creatorID') && artifact.get('creatorID') !== window.ads_userid) {
                // if user is creator of modality save
                // if user is NOT creator of modality making copy
                save_msg = 'Saving Copy of Modality...';
            }
            $.flxweb.editor.showSaveDialog({
                'headerText': save_msg,
                'contentText': 'Hold tight, this may take some time...',
                'loading': true,
                'hideClose': true
            });
            clearInterval(draftInterval);

            if(window.toggleForOldAPI || !shouldCallNewAPI(artifact.toJSON())){
              xhr = artifact.save({}, {
                  type: 'POST',
                  success: artifactSaveSuccess,
                  error: artifactSaveError
              });
            }else{
              var updateUrl =  APIUtil.getUpdateModalityURL(artifact.toJSON());

              if( updateUrl){
                xhr   =  APIUtil.requestUpdateAPI(updateUrl, artifact,artifactSaveSuccess, artifactSaveError );
              }else{
                xhr  =  APIUtil.requestSaveAPI( artifact, 'POST', artifactSaveSuccess, artifactSaveError);
              }
            }
        }

        function saveArtifactContent() {
            User.getUser().done(function(user){
                userInfo = user;
                if ($.flxweb.editor.istitleCheckInProgress()) {
                    $($.flxweb.editor).off('saveArtifact').one('saveArtifact', function () {
                        if (checkForDuplicateTitle()) {
                            return;
                        }
                        saveArtifactContentFinal();
                    });
                    return;
                }
                saveArtifactContentFinal();
            });
        }

        function saveArtifactResources(){

          if( !(window.toggleForOldAPI || !shouldCallNewAPI(artifact.toJSON())) ){ // if new APIs should be called then skip this API call
              return ;
          }
        	var idx, resourceInDraft, data, artifactId, artifactRevisionId, resourceId, resourceRevisionId, detachURL,
        	    draftArtifactResources =  artifact.get('draftResources'),
        	    orignalArtifactResources = artifact.get('revisions')[artifact.get('revisions').length-1].attachments;

        	for(idx = 0; idx < orignalArtifactResources.length; idx++) {
        		resourceInDraft = _.find(draftArtifactResources, function(item) {
            	    return item.resourceId == orignalArtifactResources[idx].id;
            	});
        		if(!resourceInDraft){
        			artifactId = artifact.get('artifactID'),
        			artifactRevisionId = artifact.get('artifactRevisionID'),
        			resourceId = orignalArtifactResources[idx].id,
        			resourceRevisionId = orignalArtifactResources[idx].resourceRevisionID,
        			detachURL = $.flxweb.settings.webroot_url + 'ajax/resource/detach/';

                if (artifactId.length !== 0 || artifactRevisionId.length !== 0) {
                	detachURL += artifactId + '/' + artifactRevisionId + '/';
                	detachURL += resourceId + '/' + resourceRevisionId + '/';
                } else {
                    //Remove attachments in artifact data
                    data = {
                        'resource_id': resourceId,
                        'resource_revision_id': resourceRevisionId
                    };
                    //If attached file is not associated with any artifact, Just remove it
                    detachURL = $.flxweb.settings.webroot_url + 'ajax/resource/delete/';
                    detachURL += resourceId + '/';
                }
                $.ajax({
                    url: detachURL,
                    success: function () {
                        console.log('Resource removed successfully');
                    }
                });
        		}
            }
        }

        function saveArtifact() {
        	var xhtml = tinyMCE.get('artifact_content').getContent(),
        		objectives = null,
        		vocabulary = null,
        		encodeID = null,
        		artifactType = null,
        		msg;
        	xhtml = $('<div>' + xhtml + '</div>');

        	saveArtifactResources();

        	xhtml.find("div[itemprop='video']").each(function() {
        		if ($(this).next('p:empty').length) {
        			$(this).next('p:empty').remove();
        		}
        	});

        	xhtml.find("table td").each(function() {
        		if($(this).html() == ""){
        			$(this).html("&nbsp;");
        		}
        	});

        	if(artifact.attributes.artifactType=="lecture" && xhtml.find("div[itemprop='video']").length==0 && !ignoreVideo){
        		$.flxweb.editor.showSaveDialog({
        			'headerText': 'Confirming',
        			'contentText': Errors['VIDEO_MODALITY_WITHOUT_VIDEO'].message,
        			'buttons': [{
        				'text': 'Continue Editing',
        				'className': 'tangerine',
        				'onclick': function () {
        					$.flxweb.editor.hideSaveDialog();
        					save_in_progress = false;
        				}
        			}, {
        				'text': 'Save anyway',
        				'className': 'turquoise',
        				'onclick': function () {
        					$.flxweb.editor.hideSaveDialog();
        					ignoreVideo = true;
        					saveArtifact();
        				}
        			}]
        		});
        		return false;
        	}

            if (save_in_progress || $('.js_save_artifact').hasClass('js-disabled')) {
                return false;
            }

            if (checkForDuplicateTitle()) {
                return false;
            }

            if (data_image_save_in_progress) {
                $.flxweb.editor.showSaveDialog({
                    'headerText': 'Saving Images',
                    'contentText': 'Images Left : ' + imagesLeft,
                    'loading': true,
                    'hideClose': true
                });
                doSave = true;
                return false;
            }
            if (!Util.validateResourceTitle($('#txt_artifacttitle').val(), 'concept', $('#txt_artifacttitle'))) {
                if ($('#mce_fullscreen').size() > 0) {
                    $('#mce_fullscreen').tinymce().execCommand('mceFullScreen');
                }
                return false;
            }
            if ($('#txt_artifactencodedid').data('edit') !== 'false') {
                if (!validateArtifactEncodedID()) {
                    return false;
                }
            }

            if (xhtml.find('.' + dataImageClass).length && !ignoreDataImages) {
                $.flxweb.editor.showSaveDialog({
                    'width': 670,
                    'className': 'data-images-modal',
                    'headerText': $('#encoded-image-error-modal-template').find('.headerText').html(),
                    'contentText': $('#encoded-image-error-modal-template').find('.contentText').html(),
                    'buttons': [{
                        'text': 'OK. Got it!',
                        'className': 'dusty-grey',
                        'onclick': function () {
                            $.flxweb.editor.hideSaveDialog();
                            save_in_progress = false;
                        }
                    }, {
                        'text': 'Save anyway',
                        'className': 'turquoise',
                        'onclick': function () {
                            $.flxweb.editor.hideSaveDialog();
                            ignoreDataImages = true;
                            saveArtifact();
                        }
                    }]
                });
                return false;
            }

            if (showRevisionPopup) {
                if (!getArtifactRevisionComments()) {
                    return false;
                }
            }

            save_in_progress = true;

            artifact.set({
                'xhtml': processXHTML(xhtml)
            }, {
                'silent': true
            });

            artifact.set({
                'modified': (new Date()).toISOString()
            });

            if ($('#modality_select').length) {
                artifactType = $('#modality_select').val().toLowerCase() === 'none' ? '' : ($('#modality_select').val() || '').trim();
                artifact.set({
                    'artifactType': (artifactType || '').trim()
                }, {
                    'silent': true
                });
            }

            if ($('#lesson_objectives').length) {
                objectives = processXHTML($('<div>' + $('#lesson_objectives').tinymce().getContent() + '</div>'));
                artifact.set({
                    'lesson_objectives': objectives
                }, {
                    'silent': true
                });
            }

            if ($('#lesson_vocabulary').length) {
                vocabulary = processXHTML($('<div>' + $('#lesson_vocabulary').tinymce().getContent() + '</div>'));
                artifact.set({
                    'lesson_vocabulary': vocabulary
                }, {
                    'silent': true
                });
            }
            if ($('#txt_artifactencodedid').length) {
                encodeID = ($('#txt_artifactencodedid').val().toLowerCase() || '').trim() === 'none' ? '' : ($('#txt_artifactencodedid').val() || '').trim();
                artifact.set({
                    'silent': true
                });
            }

            artifact.set({
                'handle': null
            }, {
                'encodeID': encodeID
            });
            if($('#auto-save-success .js-last-save-time').text() != ''){
                $('#auto-save-success').removeClass('hide').siblings().addClass('hide');
            }
            if (!checkForLargeContent()) {
                saveArtifactContent();
            } else {

                $.flxweb.editor.showSaveDialog({
                    'headerText': 'Warning',
                    'contentText': Errors.LARGE_TEXT.message,
                    'buttons': [{
                        'text': 'Continue editing',
                        'className': 'dusty-grey',
                        'onclick': function () {
                            $.flxweb.editor.hideSaveDialog();
                            save_in_progress = false;
                        }
                    }, {
                        'text': 'Save anyway',
                        'className': 'turquoise',
                        'onclick': function () {
                            $.flxweb.editor.hideSaveDialog();
                            saveArtifactContent();
                        }
                    }]
                });

                $('.ui-dialog-titlebar-close').off('click.closedialog').on('click.closedialog', function () {
                    save_in_progress = false;
                });
            }
            return false;
        }

        function saveFinalize() {
            $.flxweb.editor.hideSaveDialog();
            $.flxweb.logADS('fbs_finalize_confirm', {
                'artifactID': artifact.get('artifactID'),
                'page_type': 'concept_editor'
            });
            saveArtifact();
        }

        function saveArtifactConfirm() {
        	console.log('ace:'+artifactChangeEvent+' afse:'+artifactForceSaveEvent);
            if ((artifactChangeEvent || !artifactForceSaveEvent) && (save_in_progress || $('.js_save_artifact').hasClass('js-disabled'))) {
                return false;
            }

            if (!artifactChangeEvent || artifactForceSaveEvent) {
                var n, nodes = tinyMCE.activeEditor.dom.select('p:not(".x-ck12-validated")');
                for (n in nodes) {
                    $(nodes[n]).addClass('x-ck12-dirty');
                }
            }

            $.flxweb.logADS('fbs_finalize', {
                'artifactID': artifact.get('artifactID'),
                'page_type': 'concept_editor'
            });

            $.flxweb.editor.showSaveDialog({
                'width': 560,
                'className': 'save-confirm-modal',
                'headerText': $('#save-confirm-modal-template').find('.headerText').html(),
                'contentText': $('#save-confirm-modal-template').find('.contentText').html(),
                'buttons': [{
                    'text': 'Continue Editing',
                    'className': 'tangerine',
                    'onclick': function () {
                        $.flxweb.editor.hideSaveDialog();
                        save_in_progress = false;
                    }
                }, {
                    'text': 'Finalize',
                    'className': 'dusty-grey',
                    'onclick': saveFinalize
                }]
            });
        }

        function discardArtifactConfirm() {
            $.flxweb.editor.showSaveDialog({
                'width': 560,
                'className': 'discard-confirm-modal',
                'headerText': "Are you sure you want to discard your current draft?",
                'buttons': [{
                    'text': 'Yes, permanently discard',
                    'className': 'dusty-grey',
                    'onclick': discardDraft
                  }, {
                    'text': 'No, keep editing',
                    'className': 'tangerine',
                    'onclick': function () {
                        $.flxweb.editor.hideSaveDialog();
                        save_in_progress = false;
                  }
                }]
            });
        }

        function discardDraft () {
            if (draftID) {
                var url = Util.getApiUrl('wr/flx/artifactdraft/delete/' + draftID);
                Util.ajax({
                    type: 'DELETE',
                    url: url,
                    contentType: 'application/json',
                    success: function (res, status, jqxhr) {
                        $('#draft-label').data('saved', true);
                        window.location.href = $('#btn_cancel_artifact')[0].href;
                    },
                    error: function (jqXHR, status, error) {

                    }
                });
            } else {
                $('#draft-label').data('saved', true);
                window.location.href = $('#btn_cancel_artifact')[0].href;
            }
        }

        function saveDraft() {
            if (!save_in_progress && !draftSaveInProgress && !isDraftSaveError && !($('#draft-label').data('saved'))) {
            	saveDraftEvents();
            }
        }
        
        function saveDraftEvents() {
            var url, 
                encodeID = null,
                artifactType = null,
                artifactContent,
                contentText,
                $artifactContent = $('<div>'+$('#artifact_content').tinymce().getContent()+'</div');

            $artifactContent.find("table td").each(function() {
                if($(this).html() == ""){
                    $(this).html("&nbsp;");
                }
            });

            artifact.set({
                'title': $('#txt_artifacttitle').val()
            });

            artifactContent = processXHTML($('<div>' + ($artifactContent.html()).replace(/div/g,'divReplace') + '</div>')).replace(/(div([rR]eplace)+)/g,'div');

            artifact.set({
                'xhtml': $.trim(artifactContent)
            }, {
                'silent': true
            });
            if ($.trim(artifactContent)) {
                artifact.set({
                    'hasXhtml': true
                });
            } else {
                artifact.set({
                    'hasXhtml': false
                });
            }
            if ($('#lesson_objectives').length) {
                artifact.set({
                    'lesson_objectives': processXHTML($('<div>' + $('#lesson_objectives').tinymce().getContent() + '</div>'))
                }, {
                    'silent': true
                });
            }

            if ($('#lesson_vocabulary').length) {
                artifact.set({
                    'lesson_vocabulary': processXHTML($('<div>' + $('#lesson_vocabulary').tinymce().getContent() + '</div>'))
                }, {
                    'silent': true
                });
            }

            if ($('#txt_artifactencodedid').length) {
                encodeID = ($('#txt_artifactencodedid').val().toLowerCase() || '').trim() === 'none' ? '' : ($('#txt_artifactencodedid').val() || '').trim();
                artifact.set({
                    'encodeID': encodeID
                }, {
                    'silent': true
                });
            }

            if ($('#modality_select').length) {
                artifactType = $('#modality_select').val().toLowerCase() === 'none' ? '' : ($('#modality_select').val() || '').trim();
                if ('section' === artifactType) {
                    artifactType = $.flxweb.editor.current_artifact.get('artifactType') || 'section';
                }
                artifact.set({
                    'artifactType': (artifactType || '').trim()
                }, {
                    'silent': true
                });
            }

            // combine content, lesson objectives and vocabulary sections into common artifact xhtml template
            artifact.set({
                'xhtml': artifact_xhtml_template(artifact)
            }, {
                'silent': true
            });

            artifact.set({
                'modified': (new Date()).toISOString()
            });

            //Bug 45679, do not save context and position in draft
            var draft_payload = artifact.toJSON();
            draft_payload = _.pick(
                    draft_payload,
                    _.difference(
                        Object.keys(draft_payload),
                        ['context','position']
                    )
                );


            url = draftID ? Util.getApiUrl('wr/flx/artifactdraft/update/' + draftID) : Util.getApiUrl('wr/flx/artifactdraft/create');
            if(!draftID){
            	Util.ajax({
                    url: Util.getApiUrl('flx/start/editing/draft/of/' + artifact.get('artifactRevisionID')),
                    success: function(res){
                    	console.log("success");
                    },
                    error: function () {
                    	console.log("error");
                    }
                });
            }
            draftSaveInProgress = true;
            Util.ajax({
                type: 'POST',
                base64: true,
                data: JSON.stringify(draft_payload),
                url: url,
                contentType: 'application/json',
                success: function (res, status, jqxhr) {
                    draftSaveInProgress = false;
                    /*if(res.response.artifactDraft.updatedTime) {
                        artifact.set('modified', res.response.artifactDraft.updatedTime);
                    }
                    if(!artifact.get('created') && res.response.artifactDraft.createdTime) {
                        artifact.set('created', res.response.artifactDraft.createdTime);
                    }*/
                    $('#draft-label').data('saved', true);
                    var timeDiff = DateUtil.getTimeDifference((res.response.artifactDraft.updatedTime || (new Date()).toString()), (jqxhr.getResponseHeader('Date') || ''));
                    $('#auto-save-success').removeClass('hide').siblings().addClass('hide').end().find('.js-last-save-time').text(timeDiff.big.toLowerCase());
                    try {
                        draftID = res.response.artifactDraft.id;
                        if (navigate) {
                            $.flxweb.editor.hideSaveDialog();
                            window.location = navigate;
                            navigate = '';
                        }
                    } catch (e) {
                        console.log('error in saving draft');
                        console.log(e);
                    }
                },
                error: function (jqXHR, status, error) {
                    if (!draftFinalized) {
                        draftSaveInProgress = false;
                        isDraftSaveError = true;
                        var payload = {
                            'url': url,
                            'response': error,
                            'status': status,
                            'artifactID': artifact.get('artifactID'),
                            'artifactRevisionID': artifact.get('artifactRevisionID'),
                            'userID': $('header').data('user'),
                            'error_type': 'DRAFT SAVE FAIL',
                            'page_type': 'concept_editor'
                        };
                        $.flxweb.logADS('fbs_error', payload);
                        if (jqXHR && jqXHR.responseText && jqXHR.responseText.indexOf('is not the latest one') !== -1) {
                            contentText = 'Looks like the FlexBook/Modality was modified since you started editing. This can happen if you use a shared account or have multiple editors open in many tabs.';
                            $.flxweb.editor.showSaveDialog({
                                'width': 670,
                                'className': 'save-error-modal',
                                'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                                'contentText': contentText,
                                'buttons': [{
                                    'text': 'Edit Latest Version',
                                    'className': 'dusty-grey',
                                    'onclick': function () {
                                        $('#draft-label').data('saved', 'true');
                                        window.location.reload();
                                    }
                                }]
                            });
                            return;
                        }
                        if (userRole === 'assignee' || userRole === 'collaborator') {
                            if (jqXHR && jqXHR.responseText && jqXHR.responseText.indexOf('has not been assigned to') !== -1) {
                                contentText = 'Your changes could not be saved as the section you are editing is assigned to someone else. Please close the editor discarding all the changes.';
                            } else {
                                contentText = 'Your changes could not be auto-saved. Please try again later or contact customer support.';
                            }
                            $.flxweb.editor.showSaveDialog({
                                'width': 670,
                                'className': 'save-error-modal',
                                'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                                'contentText': contentText,
                                'buttons': [{
                                    'text': 'Contact Support',
                                    'className': 'turquoise',
                                    'onclick': function () {
                                        $.flxweb.editor.contactSupport({
                                            'body': artifact.toJSON(),
                                            'subject': 'DRAFT SAVE FAIL'
                                        });
                                    }
                                }]
                            });
                        } else {
                            if (jqXHR && jqXHR.responseText && jqXHR.responseText.indexOf('is being edited by others') !== -1) {
                                contentText = 'Your changes could not be saved as the section you are editing is assigned to someone else. Please close the editor discarding all the changes.';
                                $.flxweb.editor.showSaveDialog({
                                    'width': 670,
                                    'className': 'save-error-modal',
                                    'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                                    'contentText': contentText,
                                    'buttons': [{
                                        'text': 'Contact Support',
                                        'className': 'turquoise',
                                        'onclick': function () {
                                            $.flxweb.editor.contactSupport({
                                                'body': artifact.toJSON(),
                                                'subject': 'DRAFT SAVE FAIL'
                                            });
                                        }
                                    }]
                                });
                            } else {
                                contentText = 'Your changes could not be auto-saved. Please try finalizing this modality or contact customer support.';
                                $.flxweb.editor.showSaveDialog({
                                    'width': 670,
                                    'className': 'save-error-modal',
                                    'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                                    'contentText': contentText,
                                    'buttons': [{
                                        'text': 'Finalize',
                                        'className': 'dusty-grey',
                                        'onclick': saveFinalize
                                    }, {
                                        'text': 'Contact Support',
                                        'className': 'turquoise',
                                        'onclick': function () {
                                            $.flxweb.editor.contactSupport({
                                                'body': artifact.toJSON(),
                                                'subject': 'DRAFT SAVE FAIL'
                                            });
                                        }
                                    }]
                                });
                            }
                        }
                    }
                }
            });
        }

        function initEditor(editor_elm) {
            var content, elm = $(editor_elm);
            if ($(elm).size()) {

                //Bug 8828 wait for the tinyMCE instances to initialize, then pick the content
                //from artifact_json object and put it in respective tinyMCE.
                if (elm.selector === '#artifact_content') {
                    content = artifact.get('artifactXHTML');
                    if (draftID) {
                        content = artifact.get('xhtml');
                    }
                    if ($(content).hasClass('x-ck12-data-concept')) {
                        content = $(content).filter('.x-ck12-data-concept').html();
                    }
                } else if (elm.selector === '#lesson_objectives') {
                    content = artifact.get('objectives');
                    if (draftID) {
                        content = artifact.get('lesson_objectives');
                    }
                } else if (elm.selector === '#lesson_vocabulary') {
                    content = artifact.get('vocabulary');
                    if (draftID) {
                        content = artifact.get('lesson_vocabulary');
                    }
                } else {
                    content = $(elm).html();
                }

                content = content || '';

                $(elm).bind('flxweb.editor.tinymce.on_init', function (e, data) {
                    if (data.editor) {
                        var tmce = $(elm).tinymce();
                        tmce.setContent(content);
                        if ('#artifact_content' === elm.selector || '#lesson_objectives' === elm.selector || '#lesson_vocabulary' === elm.selector) {
                            $(tmce.dom.select('span.x-ck12-mathEditor, img.x-ck12-math, img.x-ck12-hwpmath, img.x-ck12-block-math')).each(function () {
                                var mathLatex,
                                	$this = $(this),
                                	mathId = tinymce.DOM.uniqueId(),
                                	decodedTex, testVariable, dataMathMethod, mathSpan;
                                if($this.data('tex')){
                                    decodedTex = decodeURIComponent($this.attr('data-tex'));
                                    if (decodedTex.indexOf('\\begin{align') === -1) {
                        			    mathLatex = '\\begin{align*}' + decodedTex + '\\end{align*}';
                        		    } else {
                        			    mathLatex = decodedTex;
                        		    }
                                    mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
                                    while (tinymce.activeEditor.dom.get(mathId) != null) {
                                	    mathId = tinymce.DOM.uniqueId();
                				    }
                                    $this.attr('id',mathId).html(mathLatex).removeAttr('data-tex-mathjax').prop('contenteditable', false);
                                    //MathJax.Hub.Queue(['Typeset',MathJax.Hub,$(this)[0]]);
                                    if (!$this.prevAll().length) {
                                        $this.before('<span></span>');
                                    }
                                } else if($this.hasClass("x-ck12-math") || $this.hasClass("x-ck12-hwpmath") || $this.hasClass("x-ck12-block-math")) {
                                	testVariable = $this.attr("src").split("/");
                					for(var i = 0; i<testVariable.length; i++){
                					    if(testVariable[i] == "alignat" || testVariable[i] == "inline" || testVariable[i] == "block"){
                					    	decodedTex = testVariable.slice(i+1).join("/");
                					    	decodedTex= decodeURIComponent(decodedTex);
                					    	dataMathMethod = testVariable[i];
                					    }
                					}
                					mathLatex = (dataMathMethod === "block" ? '\\begin{align*}' + decodedTex + '\\end{align*}' : decodedTex);
                					mathLatex = ('@$' + mathLatex + '@$').replace(/</g, '&lt;');
                                    while (tinymce.activeEditor.dom.get(mathId) != null) {
                                	    mathId = tinymce.DOM.uniqueId();
                				    }
                                    mathSpan = document.createElement("span");
                                    mathSpan.setAttribute("class", 'x-ck12-mathEditor');
                                    mathSpan.setAttribute("data-mathmethod", dataMathMethod);
                                    mathSpan.setAttribute("data-contenteditable", "false");
                                    mathSpan.setAttribute("data-edithtml", "");
                                    mathSpan.setAttribute("data-tex", encodeURIComponent(decodedTex));
                                    mathSpan.setAttribute("data-math-class", $this.attr("class"));
                                    mathSpan.setAttribute("id", mathId);
                                    mathSpan.setAttribute("contenteditable", false);
                                    mathSpan.innerHTML = mathLatex;
                                    this.parentNode.replaceChild(mathSpan, this);
                                } else {
                                	$this.remove();
                                }
                            });
                        }
                    }
                });
                $(elm).tinymce($.flxweb.editor.tinymce.config);
            }
        }

        function modalityTypeSelectChanged() {
            if ($(this).val() && $(this).val() === 'lesson') {
                $('#lesson_objectives_parent').parent('section').show();
            } else {
                $('#lesson_objectives_parent').parent('section').hide();
            }
        }

        function coverImageChange(e, data) {
            $('.js_coverimage').attr('src', data.thumb_url + '?_=' + Number(new Date()));

            // ADDED BY @Pratyush : forChangeFields added as a meta data for new API to understand what all fields changed
            var forChangeFields  =  artifact.get('forChangeFields') || {};
            forChangeFields['resources'] = true;

            artifact.set({
                'coverImage': data.cover_url,
                'coverRevision': data.cover_revision,
                forChangeFields : forChangeFields
            });
            $.flxweb.editor.CustomCoverDialog.close();
            $('.js_coverimage').load(function () {
                stickyScrollTop = Math.round($('.validation-container').offset().top - $('header').height());
            });
        }

        function getAttributes(image) {
            var attributes = '';
            if (image.width) {
                attributes += ' width="' + image.width + '"';
            }
            if (image.title) {
                attributes += ' title="' + image.title + '"';
            }
            if (image.alt) {
                attributes += ' alt="' + image.alt + '"';
            }
            return attributes;
        }

        function afterUpload() {
            if (!imagesLeft) {
                if (doSave) {
                    doSave = false;
                    saveArtifact();
                }
                $('#image-progress').addClass('hide');
                if (!imageerror) {
                    $('#image-success').removeClass('hide');
                } else {
                    $('#image-check').addClass('hide');
                }
            }
        }

        function uploadComplete(resource, imageClass) {
            var image = $($('#artifact_content').tinymce().dom.doc).find('.' + imageClass),
                regEx = new RegExp('/show/(THUMB_LARGE|default|THUMB_POSTCARD)?/?', 'g'),
                src = resource.uri;
            if (image.length) {
                if (src.indexOf(ck12Settings.render_resource_perma_endpoint) === -1) {
                    src = ck12Settings.render_resource_perma_endpoint + resource.permaUri;
                }
                src = src.replace(regEx, '/show/default/');
                image.parent().append('<span class="x-ck12-img-inline"><img src="' + src + '"' + getAttributes(image[0]) + '></span>');
                image.remove();
            }
            afterUpload();
        }

        function uploadFailed(imageClass) {
            var image = $($('#artifact_content').tinymce().dom.doc).find('.' + imageClass);
            if (image.length) {
                image.removeClass(imageClass).addClass(dataImageClass);
                if (!(image.parent().hasClass('x-ck12-img-inline'))) {
                    $(image)[0].outerHTML = '<span class="x-ck12-img-inline">' + $(image)[0].outerHTML + '</span>';
                }
            }
            imageerror = true;
            afterUpload();
        }

        function onUpload() {
            imagesLeft--;
            if (imagesLeft) {
                if (doSave) {
                    $.flxweb.editor.hideSaveDialog();
                    $.flxweb.editor.showSaveDialog({
                        'headerText': 'Saving Images',
                        'contentText': 'Images Left : ' + imagesLeft,
                        'loading': true,
                        'hideClose': true
                    });
                }
            } else {
                data_image_save_in_progress = false;
            }
        }

        function dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var i, byteString, mimeString, ia;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            } else {
                byteString = unescape(dataURI.split(',')[1]);
            }

            // separate out the mime component
            mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            ia = new Uint8Array(byteString.length);
            for (i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }


        function bindEvents() {
            artifact.on('change', function () {
            	console.log('ace:'+artifactChangeEvent+' afse:'+artifactForceSaveEvent);
            	artifactChangeEvent = true;
                $('#draft-label').fadeIn(800).data('saved', false);
                $('#auto-save').removeClass('hide');
                if(userRole != 'assignee'){
                    $('#btn_save_artifact').add('#btn_discard_artifact').removeClass('hide');
                }
                if($('#save_dialog').length === 0){
                    $('#auto-save-progress').removeClass('hide').siblings().addClass('hide');
                }
                $('#btn_cancel_artifact').prop('title', 'Keep as Draft').text('Keep as Draft');
            });

            $('#btn_cancel_artifact').off('click.navigate').on('click.navigate', function (e) {
            	console.log('ace:'+artifactChangeEvent+' afse:'+artifactForceSaveEvent);
            	if (!artifactChangeEvent || artifactForceSaveEvent) {
                    var n, nodes = tinyMCE.activeEditor.dom.select('p:not(".x-ck12-validated")');
                    navigate = this.href;
                    $.flxweb.editor.showSaveDialog({
                        'headerText': 'Saving "' + _.escape(artifact.get('title')) + '"...',
                        'contentText': 'Hold tight, this may take some time...',
                        'loading': true,
                        'hideClose': true
                    });
                    for (n in nodes) {
                        $(nodes[n]).addClass('x-ck12-dirty');
                    }
                	saveDraftEvents();
                }
            	if (save_in_progress || draftSaveInProgress || false === $('#draft-label').data('saved')) {
                    e.preventDefault();
                    navigate = this.href;
                    $.flxweb.editor.showSaveDialog({
                        'headerText': 'Saving "' + _.escape(artifact.get('title')) + '"...',
                        'contentText': 'Hold tight, this may take some time...',
                        'loading': true,
                        'hideClose': true
                    });
                    if (false === $('#draft-label').data('saved')) {
                        saveDraft();
                    }
                }
            });

            $('.js-edit-tips').off('click.tips').on('click.tips', function () {
                var payload = {
                    'feature': 'editor',
                    'page_type': 'concept_editor'
                };
                payload.help_topic_id = $(this).hasClass('editor-tips-expand') ? 'EDITOR_FAQ_COLLAPSE' : 'EDITOR_FAQ_EXPAND';
                $.flxweb.logADS('fbs_help', payload);
                $(this).toggleClass('editor-tips-expand').next().slideToggle('slow');
            });

            $('.js-editor-tips-close').off('click.tips').on('click.tips', function () {
                var payload = {
                    'feature': 'editor',
                    'help_topic_id': 'EDITOR_FAQ_COLLAPSE',
                    'page_type': 'concept_editor'
                };
                $.flxweb.logADS('fbs_help', payload);
                $('.js-edit-tips').toggleClass('editor-tips-expand').next().slideToggle('slow');
            });

            $('.js-editing_link').off('click.edit').on('click.edit', function (e) {
                e.preventDefault();
                var payload = {
                    'feature': 'editor',
                    'help_topic_id': this.id,
                    'page_type': 'concept_editor'
                };
                $.flxweb.logADS('fbs_help', payload);
                window.open(this.href, '_blank');
            });

            $('.js-close-icon').off('click.error').on('click.error', function () {
                $('#data-image-alert-container').addClass('hide');
            });

            $('.js-contact-support').off('click.support').on('click.support', function () {
                var data = {};
                data.body = {
                    'content': $('#artifact_content').tinymce().getContent(),
                    'artifact': artifact.toJSON()
                };
                data.subject = 'ROSETTA ERROR SUPPORT MAIL';
                $.flxweb.editor.contactSupport(data);
            });

            $('.js-next-error').off('click.error').on('click.error', function () {
                var nextError,
                    dataImage = $('#data-image-alert-container');
                nextError = $(dataImage.data('errors')).eq(dataImage.data('current') + 1);
                dataImage.data('target', nextError).data('current', dataImage.data('current') + 1);
                $($('#artifact_content').tinymce().contentDocument).find('body').scrollTop($($('#artifact_content').tinymce().dom.doc).find(nextError).offset().top);
                $('body').scrollTop(100);
                if (dataImage.data('current') >= dataImage.data('errors').length - 1) {
                    dataImage.data('current', -1);
                }
            });

            $('#modality_select').off('change.editor').on('change.editor', modalityTypeSelectChanged);
            $('.js_save_artifact').off('click.editor').on('click.editor', saveArtifactConfirm);
            $('.js_discard_artifact').off('click.editor').on('click.editor', discardArtifactConfirm);

            // in-place-edit for book summary
            // $('#artifact_summary').live('click', summaryClick); <apparently not used, revert if issues found>

            $('.js_coverimage_edit').off('click.coverImage').on('click.coverImage', $.flxweb.editor.CustomCoverDialog.open);

            setTimeout(function(){
                if (!artifactChangeEvent) {
                	deliberateAutoSaveEvents('sT');
                	var deliberateAutoSave = setInterval(function () {
                    	if (!artifactChangeEvent || artifactForceSaveEvent) {
                    		deliberateAutoSaveEvents('sI');
                        } else {
                            clearInterval(deliberateAutoSave);
                        }
                    }, 60000);
                }
            }, 20000);
            
            $(document).on('flxweb.editor.covereditor.coverchange', coverImageChange);

            $(document).off('scroll.errorAlert').on('scroll.errorAlert', function () {
                $('.js-sticky').css('top', (Math.max($(window).scrollTop() - stickyScrollTop, 0) + 'px'));
            });

            $(document).on($.flxweb.editor.tinymce.events.DATA_IMAGE, function (e, image) {
                if (!image || !image.src) {
                    return false;
                }
                try {
                    window.imageClassIterator++;
                    var options,
                        imageClass = 'x-ck12-dataimage-' + window.imageClassIterator,
                        form = new FormData(document.createElement('form'));
                    form.append('uploadfile', dataURItoBlob(image.src));
                    form.append('forceUnique', 'true');
                    form.append('type', 'image');
                    form.append('type_list', 'inline');
                    if (image.width) {
                        form.append('width', image.width);
                    }
                    options = {
                        type: 'POST',
                        format: 'html',
                        url: ck12Settings.resource_upload_endpoint,
                        dataType: 'html',
                        data: form,
                        contentType: false,
                        processData: false,
                        success: function (res) {
                            onUpload();
                            var errorData, data = $.parseJSON(res);
                            if (data.status !== 'error') {
                                uploadComplete(data, imageClass);
                            } else {
                                errorData = data.data;
                                if (errorData && errorData.reason === 'RESOURCE_ALREADY_EXISTS' && errorData.resource) {
                                    uploadComplete(errorData.resource, imageClass);
                                } else {
                                    uploadFailed(imageClass);
                                }
                            }
                        },
                        error: function () {
                            onUpload();
                            uploadFailed(imageClass);
                        }

                    };
                    data_image_save_in_progress = true;
                    if (!imagesLeft) {
                        imageerror = false;
                    }
                    imagesLeft++;
                    $('#image-success').addClass('hide');
                    $('#image-check').add('#image-progress').removeClass('hide');
                    $.ajax(options);
                } catch (err) {
                    console.log(err);
                    console.log(image);
                    return false;
                }
            });
        }

        function deliberateAutoSaveEvents(caller) {
        	console.log(caller+' ace:'+artifactChangeEvent+' afse:'+artifactForceSaveEvent);
            var n, nodes = tinyMCE.activeEditor.dom.select('p:not(".x-ck12-validated")');
            artifactForceSaveEvent = true;
            for (n in nodes) {
                $(nodes[n]).addClass('x-ck12-dirty');
            }
            $('#draft-label').fadeIn(800).data('saved', false);
            $('#auto-save').removeClass('hide');
            if(userRole != 'assignee'){
                $('#btn_save_artifact').add('#btn_discard_artifact').removeClass('hide');
                }
            if($('#save_dialog').length === 0){
                $('#auto-save-progress').removeClass('hide').siblings().addClass('hide');
                }
            $('#btn_cancel_artifact').prop('title', 'Keep as Draft').text('Keep as Draft');
        }

        function initEditors() {
            loader.done(function(){
                // init content editor last, so that, it is the one ultimately with focus
                initEditor($('#lesson_objectives'));
                initEditor($('#lesson_vocabulary'));
                initEditor($('#artifact_content'));
                $('#draft-label').data('saved', true);
                draftInterval = setInterval(saveDraft, 10000);
                bindEvents();
            });
        }

        function loadResources() {
            var resources = $('.resources_container');
            resources.load(resources.data('loadurl'), function () {
                resources.show(800);
            });
        }

        function setArtifact(draft) {
            artifact.set(draft, {
                'silent': true
            });
            var removeMetadata, addMetadata, item, index, resourceTemplate, resourceURL, row_toggle_link,
                html = '',
                attributions = Artifact.get_authors_by_role(artifact);
            $('#txt_artifacttitle').val(draft.title).trigger('keyup');
            $('#txt_artifactencodedid').val(draft.encodeID);
            if (draft.coverImage) {
                $('#cover_preview').prop('src', draft.coverImage);
                $('.js_coverimage').prop('src', draft.coverImage).prop('alt', draft.title).prop('title', draft.title).load(function () {
                    stickyScrollTop = Math.round($('.validation-container').offset().top - $('header').height());
                });
            }
            $('#txt_artifact_description').val(draft.summary);

            if (draft.draftResources && draft.draftResources instanceof Array) {
                if (draft.draftResources.length) {
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

                        html += addMetadata[0].outerHTML;
                    }
                } else {
                    html = '<div class="js_msg_no_resources">Currently there are no resources to be displayed.</div>';
                }
                html = '<div class="artifact_attachment_container js_resource_container">' + html + '</div>';
                $('.resources_container').html(html);
                html = '';
            } else {
                loadResources();
            }

            if (draft.level) {
                item = $('.js_levelselect[data-levelname="' + draft.level + '"]');
                if (!item.hasClass('selected')) {
                    item.trigger('click');
                }
            } else {
                $('.js_levelselect.selected').trigger('click');
            }

            if (draft.hasOwnProperty('changed_metadata') && (draft.changed_metadata.hasOwnProperty('remove') || draft.changed_metadata.hasOwnProperty('add'))) {

                $('#gradescontainer').find('.js_gradeselect').filter(function () {
                    removeMetadata = draft.changed_metadata.hasOwnProperty('remove') ? draft.changed_metadata.remove['grade level'] || [] : [];
                    addMetadata = draft.changed_metadata.hasOwnProperty('add') ? draft.changed_metadata.add['grade level'] || [] : [];
                    return ((-1 !== removeMetadata.indexOf($(this).data('gradename')) && $(this).hasClass('selected')) || (!($(this).hasClass('selected')) && -1 !== addMetadata.indexOf($(this).data('gradename'))));
                }).trigger('click');

                removeMetadata = undefined;
                addMetadata = undefined;
                $('.js_subjectslist_container').find('.js_subject').filter(function () {
                    removeMetadata = draft.changed_metadata.hasOwnProperty('remove') ? draft.changed_metadata.remove.subject || [] : [];
                    return -1 !== removeMetadata.indexOf($(this).find('.js_metadata_remove').data('subjectname'));
                }).remove();
                removeMetadata = undefined;
                if (draft.changed_metadata.hasOwnProperty('add') && draft.changed_metadata.add.hasOwnProperty('subject')) {
                    for (item = 0; item < draft.changed_metadata.add.subject.length; item++) {
                        html += editor_subject_list({
                            subject: draft.changed_metadata.add.subject[item]
                        });
                    }
                    $('.js_subjectslist_container').append(html);
                    html = '';
                }

                $('.js_tagslist_container').find('.js_tag').filter(function () {
                    removeMetadata = draft.changed_metadata.hasOwnProperty('remove') ? draft.changed_metadata.remove.tag || [] : [];
                    return -1 !== removeMetadata.indexOf($(this).find('.js_metadata_remove').data('tagname'));
                }).remove();
                removeMetadata = undefined;
                if (draft.changed_metadata.hasOwnProperty('add') && draft.changed_metadata.add.hasOwnProperty('tag')) {
                    for (item = 0; item < draft.changed_metadata.add.tag.length; item++) {
                        html += editor_tag_list({
                            tag: draft.changed_metadata.add.tag[item]
                        });
                    }
                    $('.js_tagslist_container').append(html);
                    html = '';
                }

                $('.js_search_keyword_list_container').find('.js_search_keywords').filter(function () {
                    removeMetadata = draft.changed_metadata.hasOwnProperty('remove') ? draft.changed_metadata.remove.search || [] : [];
                    return -1 !== removeMetadata.indexOf($(this).find('.js_metadata_remove').data('keywordnam'));
                }).remove();
                removeMetadata = undefined;
                if (draft.changed_metadata.hasOwnProperty('add') && draft.changed_metadata.add.hasOwnProperty('search')) {
                    for (item = 0; item < draft.changed_metadata.add.search.length; item++) {
                        html += editor_search_list({
                            search: draft.changed_metadata.add.search[item]
                        });
                    }
                    $('.js_search_keyword_list_container').append(html);
                    html = '';
                }
            }

            if (draft.hasOwnProperty('domains')) {
                for (item = 0; item < draft.domains.length; item++) {
                    if ('add' === draft.domains[item].action) {
                        html += editor_concept_list({
                            domain: draft.domains[item]
                        });
                    }
                }
                $('.js_domain_container').html(html);
                html = '';
            }
            if( draft.hasOwnProperty('collections')) {
              for (item = 0; item < draft.collections.length; item++) {
                    html += editor_collection_list({
                        collection: draft.collections[item]
                    });
              }
              $('.js_domain_container').html(html);
              html = '';
            }

            html += editor_attribution_list({
                attribution_type: 'author',
                attribution_label: 'Authors:',
                attribution_list: attributions.author
            });
            html += editor_attribution_list({
                attribution_type: 'contributor',
                attribution_label: 'Contributors:',
                attribution_list: attributions.contributor
            });
            html += editor_attribution_list({
                attribution_type: 'editor',
                attribution_label: 'Editors:',
                attribution_list: attributions.editor
            });
            html += editor_attribution_list({
                attribution_type: 'translator',
                attribution_label: 'Translators:',
                attribution_list: attributions.translator
            });
            html += editor_attribution_list({
                attribution_type: 'source',
                attribution_label: 'Sources:',
                attribution_list: attributions.source
            });
            html += editor_attribution_list({
                attribution_type: 'reviewer',
                attribution_label: 'Reviewer:',
                attribution_list: attributions.reviewer
            });
            html += editor_attribution_list({
                attribution_type: 'technicalreviewer',
                attribution_label: 'Technical Reviewer:',
                attribution_list: attributions.technicalreviewer
            });
            $('#attribution_list').html(html);
        }

        function nonDraftActions() {
            loadResources();
            if ($('#modality_select').val() === 'lesson' || $('#modality_select').val() === 'concept' || !$('#modality_select').length) {
                $('#lesson_objectives').parent().removeClass('hide');
            } else {
                $('#lesson_objectives').parent().addClass('hide');
            }
        }

        function getArtifactDraft(artifactRevisionID) {
            if (!artifactRevisionID) {
                return $.Deferred().reject({
                    'error': 'Invalid error Object.'
                });
            }
            if (artifact.get('hasDraft')) {
                $('#btn_cancel_artifact').prop('title', 'Keep as Draft').text('Keep as Draft');
                if(userRole != 'assignee'){
                    $('#btn_save_artifact').add('#btn_discard_artifact').removeClass('hide');
                }
                return Util.ajax({
                    url: Util.getApiUrl('flx/artifactdraft/artifactDraftArtifactRevisionID=' + artifactRevisionID),
                    contentType: 'application/json',
                    success: function (response, status, jqxhr) {
                        if (response.hasOwnProperty('response')) {
                            response = response.response;
                            if (response.hasOwnProperty('artifactDraft') && !($.isEmptyObject(response.artifactDraft))) {
                                draftID = response.artifactDraft.id;
                                if (artifact.get('position') && artifact.get('context')) {
                                    response.artifactDraft.draft.position = artifact.get('position');
                                    response.artifactDraft.draft.context = artifact.get('context');
                                } else {
                                    //Bug 45679, Remove artifactDraft's context and position
                                    // if it's not contextual edit.
                                    response.artifactDraft.draft = _.pick(
                                            response.artifactDraft.draft,
                                            _.difference(
                                                Object.keys(response.artifactDraft.draft),
                                                ['context','position']
                                            )
                                        );
                                }

                                setArtifact(response.artifactDraft.draft || {});
                                $('#draft-label').show();
                                var timeDiff = DateUtil.getTimeDifference((response.artifactDraft.updatedTime || (new Date()).toString()), (jqxhr.getResponseHeader('Date') || ''));
                                $('#auto-save').removeClass('hide');
                                $('#auto-save-success').removeClass('hide').siblings().addClass('hide').end().find('.js-last-save-time').text(timeDiff.big.toLowerCase());
                            }
                        }
                        initEditors();
                    },
                    error: initEditors
                });
            }
            nonDraftActions();
            initEditors();
        }

        function getBreadcrumbUrl(context, crumb, position) {
            return $.flxweb.settings.webroot_url + context.realm + '/' + context.artifactType + '/' + context.handle + '/section/' + position;
        }

        function createBreadcrumb() {
            var breadcrumbObject = {
                    'Home': '/',
                    'Library': '/my/library'
                },
                modalityName = artifact.get('title'),
                //modalityNameUrl = artifact.get('handle').replace(/\-/gi, ' ').replace(/[^\w\s]/gi, '').replace(/\s+/gi, ' ').replace(/\s/g, '-'), // Added for 42734 & modified for 52322
                modalityNameUrl = artifact.get('handle').replace(/\-/gi, ' ').replace(/\s+/gi, ' ').replace(/\s/g, '-'),
                position = artifact.get('position'),
                chapter,
                chapter_position,
                context = artifact.get('context');
            if (Artifact.is_new(artifact)) {
                if (artifact.get('context')) {
                    breadcrumbObject['_' + artifact.get('context').title] = '/' + artifact.get('context').perma;
                }
            } else if (artifact.get('context') && artifact.get('position')) {
                if (artifact.get('revisions') && artifact.get('revisions')[0] && artifact.get('revisions')[0].hasOwnProperty('ancestors')) {
                    context = artifact.get('revisions')[0].ancestors['0.0'];
                    breadcrumbObject['_' + context.title] = '/' + context.realm + '/' + context.artifactType + '/' + context.handle;
                    if (!position.match(/\.0$/)) {
                        chapter_position = position.split('.')[0] + '.0';
                        chapter = artifact.get('revisions')[0].ancestors[chapter_position];
                        breadcrumbObject['Ch' + chapter_position.split('.')[0]] = getBreadcrumbUrl(context, chapter, chapter_position);
                        breadcrumbObject['_' + position.split('.')[1] + '. ' + artifact.get('title')] = getBreadcrumbUrl(context, artifact_json, position);
                    } else {
                        breadcrumbObject['_' + position.split('.')[0] + '. ' + artifact.get('title')] = getBreadcrumbUrl(context, artifact_json, position);
                    }
                } else {
                    breadcrumbObject['_' + context.title] = '/' + context.realm + '/' + context.artifactType + '/' + context.handle;
                    breadcrumbObject['_' + position.split('.')[0] + '. ' + artifact.get('title')] = getBreadcrumbUrl(context, artifact_json, position);
                }
            } else if (!artifact.get('domain')) {
                breadcrumbObject['_' + modalityName] = artifact.get('artifact_url');
            } else {
                breadcrumbObject['_' + modalityName] = ( (artifact.get('collections') && artifact.get('collections').length > 0 ) ? '/c/' : '/') + (artifact.get('domain').branch === 'UBR' ? 'na' : artifact.get('domain').branchInfo.handle.toLowerCase().replace(/\s/g, '-')) + '/' + artifact.get('domain').handle + '/' + artifact.get('artifactType') + (artifact.get('realm') ? ('/' + artifact.get('realm')) : '') + '/' + modalityNameUrl;
            }
            breadcrumbObject.Edit = '';
            Breadcrumb.init(breadcrumbObject);
        }

        function updateCloseLink(response) {
            var redirect_url, $cancelArtifact = $('#btn_cancel_artifact');
            if (response.context && response.position) {
                redirect_url = $cancelArtifact.prop('href');
                redirect_url = redirect_url.replace(/\/editor.*(\/r\d+)/, function (m, g1) {
                    return m.replace(g1, '/r' + (Number(g1.split('/r')[1]) + 1));
                });
            } else {
                redirect_url = artifact.get('artifact_url');
            }
            $cancelArtifact.prop('href', redirect_url);
        }

        function existingArtifactSaveSuccess(model, response) {
            if (response) {

                var revision, payload,
                    redirect_url = '/editor/',
                    previousCover = artifact.get('coverImage');
                if (onArtifactSaveSuccess(response)) {
                    redirect_url += (artifact.get('collections') && artifact.get('collections').length > 0 ) ? 'c/':'';
                    redirect_url += artifact.get('realm') + '/';
                    if (response.hasOwnProperty('context') && response.hasOwnProperty('position')) {
                        redirect_url += response.context.artifactType + '/';
                        redirect_url += response.context.handle;
                        revision = response.context.latestRevision;
                        redirect_url += revision ? '/r' + revision : '';
                        redirect_url += '/section/';
                        redirect_url += response.position + '/';
                        redirect_url += artifact.get('handle');
                    } else {
                        redirect_url += artifact.get('artifactType') + '/';
                        redirect_url += artifact.get('handle');
                        revision = Artifact.getVersionNumber(artifact);
                        redirect_url += revision ? '/r' + revision : '';
                    }

                    revision = response.hasOwnProperty('context') ? response.context.latestRevision : Artifact.getVersionNumber(artifact);

                    // replace all occurrences of encoded slashes (forward and backward) [Bug 8982]
                    redirect_url = redirect_url.replace('%2F', '%252F');
                    redirect_url = redirect_url.replace('%5C', '%255C');
                    $.flxweb.editor.hideSaveDialog();
                    // Bug #43328, update modality type dropdown value with returned artifactType
                    $('#modality_select option:first').prop('value', artifact.get('artifactType'));
                    history.replaceState({}, artifact.get('title'), redirect_url);
                    if (!(artifact.get('coverImage'))) {
                        payload = {
                            'error_type': 'COVER_IMAGE_LOST',
                            'page_type': 'concept_editor',
                            'previousCover': previousCover,
                            'artifactID': artifact.get('artifactID'),
                            'artifactRevisionID': artifact.get('artifactRevisionID'),
                            'userID': $('header').data('user')
                        };
                        $.flxweb.logADS('fbs_error', payload);
                    }
                    $('#new-modality-save').removeClass('disabled js-disabled').off('click.save').text('Saved!');
                    $('#page-blur').remove();
                    $('header', '#content').removeClass('save-new-modality');
                    $('#new-modality-save-container').add('#existing-modality-title-label').addClass('hide');
                    initEditors();
                    createBreadcrumb();
                    updateCloseLink(response);
                } else {
                    $('#new-modality-save').removeClass('disabled js-disabled').text('Save');
                }
                save_in_progress = false;
                $('.js_loadingplaceholder').addClass('hide');
            }
        }

        function existingModalitySave ($this) {
            nonDraftActions();
            if ($this.hasClass('disabled')) {
                return;
            }
            var draft, draftxhtml,
                title = $('#txt_artifacttitle'),
                eID = $('#txt_artifactencodedid');

            draftxhtml = $('<div>'+artifact.get('xhtml')+'</div>');

            draftxhtml.find('span.x-ck12-mathEditor').each(function(){
                $(this).attr('id','mathId_' + Math.floor((Math.random() * 1000) + 1));
            });

            artifact.set({
                'xhtml': draftxhtml.html()
            });

            if (!(Util.validateResourceTitle(title.val(), 'concept', title))) {
                return;
            }
            if (eID.data('edit') !== 'false') {
                if (!validateArtifactEncodedID()) {
                    return false;
                }
            }
            title = (title.val() || '').trim();
            artifact.set({
                'title': title
            });
            artifact.set({
                'handle': null
            });

            if (eID.length) {
                eID = (eID.val() || '').trim();
                artifact.set({
                    'encodeID': eID
                });
            }
            $.flxweb.editor.showSaveDialog({
                'headerText': 'Saving "' + _.escape(artifact.get('title')) + '"...',
                'contentText': 'Hold tight, this may take some time...',
                'loading': true,
                'hideClose': true
            });
            draft = _.clone(artifact.toJSON());
            //delete draft.xhtml;
            //delete draft.artifactXHTML;
            draft = new Artifact(draft);
            save_in_progress = true;
            $this.addClass('disabled js-disabled').text('Saving...');


            if(window.toggleForOldAPI || !shouldCallNewAPI(draft.toJSON())){

              xhr = draft.save({}, {
                  type: 'POST',
                  success: existingArtifactSaveSuccess,
                  error: artifactSaveError
              });

            }else{

              var updateUrl =  APIUtil.getUpdateModalityURL(draft.toJSON());
              if( updateUrl){
                xhr   =  APIUtil.requestUpdateAPI(updateUrl, draft,existingArtifactSaveSuccess, artifactSaveError );
              }else{
                xhr  =  APIUtil.requestSaveAPI( draft, 'POST', existingArtifactSaveSuccess, artifactSaveError);
              }

            }
        }

        function saveExistingModality() {
            $('body').append('<div id="page-blur" class="page-blur"></div>');
            $('header', '#content').addClass('save-new-modality');
            $('#new-modality-save-container').add('#existing-modality-title-label').removeClass('hide');
            $('#txt_artifactencodedid').val('');

            $('#new-modality-save').off('click.save').on('click.save', function () {
                var $this = $(this);
                User.getUser().done(function(user){
                    userInfo = user;
                    existingModalitySave($this);
                });
            });

            $('#txt_artifacttitle').trigger('change');
        }

        function newArtifactSaveSuccess(model, response) {
            if (response) {
                var revision, payload,
                    redirect_url = '/editor/',
                    previousCover = artifact.get('coverImage');
                if (onArtifactSaveSuccess(response)) {

                    redirect_url += (artifact.get('collections') && artifact.get('collections').length > 0 ) ? 'c/':'';
                    redirect_url += artifact.get('realm') ? artifact.get('realm') + '/' : '';
                    if (response.hasOwnProperty('context') && response.hasOwnProperty('position')) {
                        redirect_url += response.context.artifactType + '/';
                        redirect_url += response.context.handle;
                        revision = response.context.latestRevision;
                        redirect_url += revision ? '/r' + revision : '';
                        redirect_url += '/section/';
                        redirect_url += response.position + '/';
                        redirect_url += artifact.get('handle');
                    } else {
                        redirect_url += artifact.get('artifactType') + '/';
                        redirect_url += artifact.get('handle');
                        revision = Artifact.getVersionNumber(artifact);
                        redirect_url += revision ? '/r' + revision : '';
                    }
                    // replace all occurrences of encoded slashes (forward and backward) [Bug 8982]
                    redirect_url = redirect_url.replace('%2F', '%252F');
                    redirect_url = redirect_url.replace('%5C', '%255C');
                    save_in_progress = false;
                    $.flxweb.editor.hideSaveDialog();
                    history.replaceState({}, artifact.get('title'), redirect_url);
                    if (!(artifact.get('coverImage'))) {
                        payload = {
                            'error_type': 'COVER_IMAGE_LOST',
                            'page_type': 'concept_editor',
                            'previousCover': previousCover,
                            'artifactID': artifact.get('artifactID'),
                            'artifactRevisionID': artifact.get('artifactRevisionID'),
                            'userID': $('header').data('user')
                        };
                        $.flxweb.logADS('fbs_error', payload);
                    }
                    $('#new-modality-save').removeClass('disabled js-disabled').off('click.save').text('Saved!');
                    $('#page-blur').remove();
                    $('header', '#content').removeClass('save-new-modality');
                    $('#new-modality-save-container').add('#new-modality-title-label').addClass('hide');
                    $('#modality_select').addClass('disabled').prop('disabled', true);
                    initEditors();
                    createBreadcrumb();
                    updateCloseLink(response);
                } else {
                    save_in_progress = false;
                    $('#new-modality-save').removeClass('disabled js-disabled').text('Save');
                }
            }
        }

        function newModalitySave($this) {
            nonDraftActions();
            if ($this.hasClass('disabled')) {
                return;
            }

            var artifactType = $('#modality_select'),
                title = $('#txt_artifacttitle'),
                eID = $('#txt_artifactencodedid');

            if (!(Util.validateResourceTitle(title.val(), 'concept', title))) {
                return;
            }
            if (eID.data('edit') !== 'false') {
                if (!validateArtifactEncodedID()) {
                    return false;
                }
            }
            if (artifactType.length) {
                artifactType = artifactType.val().toLowerCase() === 'none' ? '' : (artifactType.val() || '').trim();
            } else {
                artifactType = artifact.get('artifactType');
            }
            title = (title.val() || '').trim();
            artifact.set({
                'title': title,
                'artifactType': artifactType,
                'created': (new Date()).toISOString()
            });
            
            artifact.setLevel('at grade');

            //eID = (eID.val() || '').trim();
            if (eID.length) {
                artifact.set({
                    'encodeID': (eID.val() || '').trim()
                });
            }

            $.flxweb.editor.showSaveDialog({
                'headerText': 'Saving "' + _.escape(artifact.get('title')) + '"...',
                'contentText': 'Hold tight, this may take some time...',
                'loading': true,
                'hideClose': true
            });
            $this.addClass('disabled js-disabled').text('Saving...');

            if(window.toggleForOldAPI || !shouldCallNewAPI(artifact.toJSON()) ){

              xhr = artifact.save({}, {
                  type: 'POST',
                  success: newArtifactSaveSuccess,
                  error: artifactSaveError
              });

            }else{

              var updateUrl =  APIUtil.getUpdateModalityURL(artifact.toJSON());
              if( updateUrl){
                xhr   =  APIUtil.requestUpdateAPI(updateUrl, artifact ,newArtifactSaveSuccess, artifactSaveError );
              }else{
                xhr  =  APIUtil.requestSaveAPI( artifact, 'POST', newArtifactSaveSuccess, artifactSaveError);
              }
            }
        }

        function saveNewModality() {
            $('body').append('<div id="page-blur" class="page-blur"></div>');
            $('header', '#content').addClass('save-new-modality');
            $('#new-modality-save-container').add('#new-modality-title-label').removeClass('hide');
            if (artifact.get('context') && artifact.get('position')) {
                $('#editor-title-only').addClass('hide');
            }

            $('#new-modality-save').off('click.save').on('click.save', function () {
                var $this = $(this);
                User.getUser().done(function(user){
                    userInfo = user;
                    newModalitySave($this);
                });
            });
        }

        function checkAuthority() {
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/check/editing/authority/for/' + artifactID),
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

        function checkModalityUnderCollaboration() {
            var _d = $.Deferred();
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
            return _d.promise();
        }

        function checkForCollaborator(bookID) {
            var _d = $.Deferred();
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
            return _d.promise();
        }

        function nonCollaborationView() {
            if (artifact.get('creatorID') !== $('header').data('user')) {
                saveExistingModality();
            } else {
                getArtifactDraft(artifact.get('artifactRevisionID'));
                createBreadcrumb();
            }
        }

        function roleBasedView() {
            var context;
            if(userRole !== 'collaborator') {
                if (userRole === 'assignee') {
                    /*load latest revision*/
                    context = artifact.get('context');
                    if (context['revision'] !== context['latestRevision']) {
                        window.location.href = window.location.href.replace(new RegExp('/r'+ context['revision'] +'/'), '/r' +context['latestRevision'] + '/');
                    }
                }
                $('.hide-for-collaborator').removeClass('hide');
                $('.readonly-for-collaborator').attr('readonly', false);
                $('.metadata_level').addClass('js_levelselect');
                $('.metadata_grade').addClass('js_gradeselect');
                $('.js_row_actions.actions').removeClass('hide');
                $('.resource_actions.resource_wrapper').removeClass('hide');

                $('#edit_attachments').addClass('show-edit-attachments');
            }
            $('#contentwrap').children().removeClass('hide');
        }

        function checkEditingAuthority() {
            var bookUserID, ancestor, bookID, members, index = 0, collaborator = false, userID;
            userID = $('header').data('user');
            checkAuthority().done(function(data) {
                if (data === 'authorized') {
                    if (artifact.get('creatorID') !== userID) {
                        //for assignee hide all buttons
                        /* $('#btn_save_artifact').parent().addClass('hide'); */
                        $('.changeimagewrap', '.coverimage').addClass('hide');
                        $('#txt_artifacttitle').attr('readonly', 'readonly');
                        userRole = 'assignee';
                    } else {
                        userRole = 'owner';
                    }
                    //owner and assignee flow
                    getArtifactDraft(artifact.get('artifactRevisionID'));
                    createBreadcrumb();
                    roleBasedView();
                } else {
                    if (artifact.get('revisions') && artifact.get('revisions')[0] && artifact.get('revisions')[0].hasOwnProperty('ancestors')) {
                        ancestor = artifact.get('revisions')[0]['ancestors']['0.0'];
                        bookID = ancestor.artifactID;
                        checkForCollaborator(bookID).done(function(data) {
                            if (data && data.group && data.group.members) {
                                members = data.group.members;
                                for (index = 0; index < members.length; index++) {
                                    if (members[index].id === userID) {
                                        collaborator = true;
                                        break;
                                    }
                                }
                                if (ancestor.creatorID === userID && artifact.get('creatorID') !== userID) {
                                    saveExistingModality();
                                    userRole = 'other';
                                } else if (artifact.get('creatorID') === userID) {
                                    //Block everything for owner if not authorized to edit section
                                    $('#contentwrap').html('<div class="no-authority text-center" style="font-size: 40px;">The FlexBook section you are trying to edit is assigned to another collaborator.</div>')
                                    console.log('Block everything');
                                    userRole = 'owner';
                                } else if (collaborator) {
                                    //Block everything for collaborator if not authorized to edit section
                                    $('#contentwrap').html('<div class="no-authority text-center" style="font-size: 40px;">The FlexBook section you are trying to edit is assigned to another collaborator.</div>')
                                    console.log('Block everything');
                                    userRole = 'collaborator';
                                } else {
                                    saveExistingModality();
                                    userRole = 'other';
                                }
                            } else {
                                nonCollaborationView();
                                userRole = 'other';
                            }
                            roleBasedView();
                        }).fail(function(){
                            ModalView.alert("There was an error.");
                        });
                    } else {
                        saveExistingModality();
                        userRole = 'other';
                    }
                }
            }).fail(function(){
                ModalView.alert("There was an error.");
            });
        }

        function modalityEditorView() {
            var userID = $('header').data('user');
            checkModalityUnderCollaboration().done(function(data) {
                if(data.bookEditingAssignments && data.bookEditingAssignments.length) {
                    if (artifact.get('creatorID') === userID) {
                        //Block everything for owner if not authorized to edit section
                        $('#contentwrap').html('<div class="no-authority text-center" style="font-size: 40px;">The FlexBook section you are trying to edit is assigned to another collaborator.</div>')
                        console.log('Block everything');
                        userRole = 'owner';
                    } else {
                        saveExistingModality();
                        userRole = 'other';
                    }
                } else {
                    if (artifact.get('creatorID') === userID) {
                        //owner flow
                        userRole = 'owner';
                        getArtifactDraft(artifact.get('artifactRevisionID'));
                        createBreadcrumb();
                    } else {
                        saveExistingModality();
                        userRole = 'other';
                    }
                }
                roleBasedView();
            }).fail(function() {
                ModalView.alert("There was an error.");
            });
        }

        function isValidBackURL(url){
            var status=false;
            if(url && !/^https?:\/\//.test(url) || /^https?:\/\/\w+-?\w+\.ck12\.org\/?/.test(url)){
                status=true;
            }
            return status;
        }

        function domready() {
            artifact = $.flxweb.editor.current_artifact;
            if (Artifact.is_new(artifact)) {
                userRole = 'other';
                saveNewModality();
                roleBasedView();
            } else {
                if (artifact.get('revisions') && artifact.get('revisions')[0] && artifact.get('revisions')[0].hasOwnProperty('ancestors')) {
                    checkEditingAuthority();
                } else {
                    modalityEditorView();
                }
            }
            if ($.flxweb.queryParam('returnTo') && !isValidBackURL($.flxweb.queryParam('returnTo'))) {
                $('.js-editor-back').attr('href', '/my/library');
            }

            window.onbeforeunload = function () {
                if (false === $('#draft-label').data('saved')) {
                    // equality with only false is requried here
                    return 'Unsaved changes will be lost. Are you sure you want to leave this page?';
                }
            };

        }

        $(document).ready(domready);
    });