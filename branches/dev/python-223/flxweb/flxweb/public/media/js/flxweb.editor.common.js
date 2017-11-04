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
 * $id$
 */
define(
    'flxweb.editor.common', ['jquery', 'flxweb.models.artifact', 'common/views/modal.view',
        'common/utils/utils', 'common/utils/user', 'common/utils/url','flxweb.utils.cookie', 'jquery-ui',
        'flxweb.global', 'flxweb.edit.resource'
    ],
    function ($, Artifact, ModalView, Util, User,Url, cookie) {
        'use strict';

        var artifact, _save_dialog,
            emailModalClosed = false,
            userEmail = '',
            userLogin = '',
            keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            supportMailRecipients = 'support@ck12.org', // comma separated list of recipients for "contact support" email
            walkThroughTemplate = '',
            titleCheckInProgress = false,
            isDuplicateTitle = false,
            doTitleDuplicateCheck = true;

        function utf8_encode(string) {
            string = string.replace(/\r\n/g, '\n');
            var n, c, utftext = '';

            for (n = 0; n < string.length; n++) {

                c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }

        function base64Encode(input) {
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4, output = '',
                i = 0;

            input = utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            }

            return output;
        }

        function istitleCheckInProgress() {
            return titleCheckInProgress;
        }

        function isTitleDuplicate() {
            return isDuplicateTitle;
        }

        function toggleCollapsible() {
            var container = $(this).parent();
            $(container).find('.js_arrow').toggleClass('arrow').toggleClass('arrow_right');
            $(container).find('.js_collapsible_content').toggleClass('hide');
        }

        function onEditTitle(titleInput) {
            var title = (titleInput.value || '').trim();
            if (title) {
                if (doTitleDuplicateCheck && 'true' !== artifact.get('handleChanged')) {
                    titleCheckInProgress = false;
                    artifact.set({
                        'title': title
                    });
                    $($.flxweb.editor).trigger('saveArtifact');
                } else {
                    artifact.set({
                        'title': title
                    });
                }
            } else {
                $(titleInput).focus();
            }
        }

        function onEditDescription() {
            artifact.set({
                'summary': ($(this).val() || '').trim()
            });
        }

        function addAttachment(e, data) {
            var attachments = artifact.get('attachments') || [],
                resource = data.resource;

            if (!(resource.hasOwnProperty('associatedArtifactID') && resource.hasOwnProperty('associatedArtifactRevisionID'))) {
                attachments.push({
                    'attachmentUrl': resource.uri,
                    'attachmentID': resource.id,
                    'attachmentRevisionID': resource.resourceRevisionID
                });
            }
        }

        function removeAttachment(e, data) {
            var i, attachment, resource_row, attachments = artifact.get('attachments');

            if (!attachments) {
                return false;
            }

            for (i = 0; i < attachments.length; i++) {
                attachment = attachments[i];
                if (attachment.attachmentID === data.resource_id && attachment.attachmentRevisionID === data.resource_revision_id) {
                    attachments.splice(i, 1); // remove it
                    break;
                }
            }
            artifact.set('attachments', attachments);
            // remove the row
            $('.js_resource_row').each(function () {
                if ($(this).data('resource-id') === data.resource_id) {
                    resource_row = $(this);
                    return false;
                }
            });
            if (resource_row && resource_row.size()) {
                resource_row.hide(500, function () {
                    $(this).remove();
                });
            }
        }

        function onAttachmentChange() {
            // whenever an attachment is added or removed,
            // iterate through resource rows and put an array of
            // resourceRevisionIDs on artifact object for artifact save.
            // add draftResources object for drafts containing relevant resource information.
            var resourceData,
                revisionIDs = [],
                draftResourceObejct = {},
                draftResources = [],
                chapterArtifactID;
            window.resourceTarget.find('.js_resource_row').each(function () {
                resourceData = $(this).find('.js_resource_remove').data();
                if (resourceData.resourceRevisionId) {
                    revisionIDs.push(resourceData.resourceRevisionId);
                    draftResourceObejct = {
                        'resourceRevisionId': resourceData.resourceRevisionId,
                        'resourceId': resourceData.resourceId,
                        'artifactId': resourceData.artifactId,
                        'artifactRevisionId': resourceData.artifactRevisionId
                    };
                    resourceData = $(this).data();
                    draftResourceObejct.resourceName = resourceData.resourceName;
                    draftResourceObejct.resourceType = resourceData.resourceType;
                    draftResourceObejct.resourceExternal = resourceData.resourceExternal;
                    draftResourceObejct.resourceUri = resourceData.resourceUri;

                    draftResourceObejct.resourceDetailsUrl = $(this).find('.js_resource_link').attr('href');
                    draftResourceObejct.resourceDescription = $(this).find('.js_resource_description').html();
                    draftResourceObejct.resourceIsPublic = $(this).find('.js_resource_edit').data('resourcePublic');

                    draftResources.push(draftResourceObejct);
                }
            });
            // ADDED BY @Pratyush : forChangeFields added as a meta data for new API to understand what all fields changed
            var forChangeFields  =  artifact.get('forChangeFields') || {};
            forChangeFields['resources'] = true;
            if (window.chapterResourceUpload) {
                window.chapter.set({
                    'resourceRevisionIDs': revisionIDs,
                    'draftResources': draftResources,
                    'forChangeFields': forChangeFields
                });
                chapterArtifactID = window.chapter.get('id');
                window.chapterResourceCache[chapterArtifactID] = $('.chapter_resources_container', '#chapteredit_attachments').html();
            } else {
                artifact.set({
                    'resourceRevisionIDs': revisionIDs,
                    'draftResources': draftResources,
                    'forChangeFields': forChangeFields
                });
            }
        }

        function hideSaveDialog() {
            if (_save_dialog) {
                _save_dialog.close();
            }
        }

        function setEditorVersionText(){
            var version = 'New';

            $('.js-editor-switch-version').text(version);
        }

        function showSaveDialog(options) {
            options = $.extend({
                'showOnOpen': true,
                'headerText': 'Saving your CK-12 Flexbook&#174;',
                'contentText': '',
                'modalID': 'save_dialog',
                'width': 400
            }, options);

            if (options.loading) {
                options.headerText = '<div><img src="/media/common/images/icon_loading.gif" alt="loading" class="modal-loading"></div><div class="header-text ellipsis">' + options.headerText + '</div>';
            }
            if (options.hideClose) {
                options.closeID = 'hide';
            }
            if (options.hasOwnProperty('buttons') && options.buttons instanceof Array && options.buttons.length) {
                var index, button;
                for (index = 0; index < options.buttons.length; index++) {
                    button = options.buttons[index];
                    if (button.hasOwnProperty('icon')) {
                        button.text = '<span>' + (button.text || '') + '</span><i class="' + (button.icon || '') + '"></i>';
                    }
                }
            }
            _save_dialog = new ModalView(options);
        }

        function emailFail() {
            showSaveDialog({
                'width': 670,
                'className': 'sent-email-modal',
                'headerID': 'hide',
                'contentText': 'Sorry, we were unable to contact support at this time. Please try again later.',
                'buttons': [{
                    'text': 'OK',
                    'className': 'turquoise',
                    'onclick': hideSaveDialog
                }]
            });
        }

        function emailSent() {
            showSaveDialog({
                'width': 670,
                'className': 'sent-email-modal',
                'headerText': '<img src="/media/common/images/email_check.png" alt="email sent">',
                'contentText': 'Hold tight! You\'ll hear back from us within 24 hours.',
                'buttons': [{
                    'text': 'Done',
                    'className': 'turquoise',
                    'onclick': hideSaveDialog
                }]
            });
        }

        function sendSupportMail(error) {
            if (!(error && error.hasOwnProperty('subject') && error.hasOwnProperty('body'))) {
                return $.Deferred().reject({
                    'error': 'Invalid error Object.'
                });
            }

            error.body.userEmail = error.body.userEmail || userEmail;
            var params = {};

            params.receivers = supportMailRecipients;
            params.subject = error.subject || '';
            params.body = JSON.stringify(error.body || '');
            params.purpose = 'errorReport';

            params = base64Encode(JSON.stringify(params));
            params = ('data=' + encodeURIComponent(params)).replace(/%20/g, '+');
            return Util.ajax({
                url: Util.getApiUrl('flx/send/email'),
                method: 'POST',
                data: params
            });

        }

        function contactSupport(error) {
            hideSaveDialog();
            emailModalClosed = false;
            showSaveDialog({
                'width': 670,
                'className': 'sending-email-modal',
                'headerText': '<img src="/media/common/images/email_support.png" alt="sending email">',
                'buttons': [{
                    'text': 'Sending...',
                    'className': 'turquoise',
                    'onclick': function () {
                        emailModalClosed = true;
                        hideSaveDialog();
                    }
                }]
            });
            sendSupportMail(error).done(function (response) {
                setTimeout(function () {
                    hideSaveDialog();
                    if (!emailModalClosed) {
                        if (response.response.hasOwnProperty('message')) {
                            emailFail();
                        } else {
                            emailSent();
                        }
                    }
                    emailModalClosed = false;
                }, 1000);
            }).fail(function (response) {
                setTimeout(function () {
                    hideSaveDialog();
                    if (!emailModalClosed && 'Invalid error Object.' !== response.error) {
                        emailFail();
                    }
                    emailModalClosed = false;
                }, 1000);
            });
        }

        function removeClass(content, classToRemove) {
            var temp = content.find('.' + classToRemove);
            temp.removeClass(classToRemove).each(function () {
                if (!(this.classList.length)) {
                    $(this).removeAttr('class');
                }
            });
            return content;
        }

        function removeValidatorattributes(content) {
            content = content || '';
            content = $('<div>' + content + '</div>');
            content = removeClass(content, 'x-ck12-dirty');
            content = removeClass(content, 'x-ck12-validationerror');
            content = removeClass(content, 'x-ck12-validated');
            content.find('[data-error]').removeAttr('data-error');
            return content.html();
        }

        function showDraftWalkthrough(walkThroughTemplate, showCheckbox) {
            hideSaveDialog();
            if (!$('.draft-walkthrough-modal').length) {
                showSaveDialog({
                    'width': 670,
                    'headerText': 'Introducing some new enhancements</br>to make creating sections easier!',
                    'contentText': walkThroughTemplate,
                    'className': 'draft-walkthrough-modal' + (showCheckbox ? '' : ' checkbox-hidden'),
                    'buttons': [{
                        'text': 'Got it!',
                        'className': 'turquoise large',
                        'onclick': hideSaveDialog
                    }]
                });
            }
            $('.dont-show-checkbox').off('change.draftWalkthrough').on('change.draftWalkthrough', function () {
                /*if ($(this).prop('checked') === true) {
                    $.cookie('draftWalkthroughCookie', 'true', {
                        path: '/'
                    });
                } else {
                    $.cookie('draftWalkthroughCookie', 'false', {
                        path: '/'
                    });
                }*/
                var currentUserSpecific;
                User.getUser().done(function(user){
                    currentUserSpecific = user;
                });
                if ($(this).prop('checked') === true) {
                    currentUserSpecific.setAppData('flxweb-editor',{ noDraftWalkThrough:true });
                }
                else {
                    currentUserSpecific.setAppData('flxweb-editor',{ noDraftWalkThrough:false });
                }
            });
        }

        function callDraftWalkthrough(showCheckbox) {
            if (walkThroughTemplate) {
                showDraftWalkthrough(walkThroughTemplate, showCheckbox);
            } else {
                require(['text!templates/draft.walkthrough.html'],
                    function (walkThroughTmpl) {
                        walkThroughTemplate = walkThroughTmpl;
                        showDraftWalkthrough(walkThroughTemplate, showCheckbox);
                    });
            }
        }

        function domReady() {
            if (!artifact_json) {
                if ($('#artifact_json').length) {
                    artifact_json = JSON.parse($('#artifact_json').text());
                }
            }
            if (!attachments) {
                if ($('#attachments_json').length) {
                    attachments = JSON.parse($('#attachments_json').text());
                }
            }
            artifact = new Artifact(artifact_json);
            var artifactTitle, user,
                payload = {},
                artifact_id = artifact.get('artifactID') || artifact.get('id');

            user = new User();
            user.fetch({
                'success': function (model, userInfo) {
                    userEmail = userInfo.email || '';
                    userLogin = userInfo.login || '';
                    userLogin = userLogin ? 'user:' + userLogin : '';
                }
            });

            var currentUrl =  new Url(window.location.href);
            var searchParams =  currentUrl.search_params;
            var eid = searchParams.eid;
            var collectionCreatorID =  searchParams.collectionCreatorID;
            var conceptCollectionHandle = searchParams.conceptCollectionHandle;
            artifact.replaceCollection(collectionCreatorID, conceptCollectionHandle, eid);

            window.artifact_id = artifact_id;
            // ADS log customize start
            payload.artifactID = artifact_id;
            payload.memberID = ads_userid;
            $.flxweb.logADS('fbs_customize_start', payload);

            // var revision_id = artifact.get('artifactRevisionID');
            // $.flxweb.logADS('fbs_customize_start', 'customize_started',
            // 1, [artifact_id, revision_id, ads_userid], []);

            // $('#txt_artifacttitle').change(onEditTitle);
            $('#txt_artifacttitle').on('keyup', function(e) {
                var keyCode = e.keyCode,
                    modKey = (e.ctrlKey && !e.altKey) || e.metaKey;
                if ((keyCode < 16 || keyCode > 20) && keyCode != 224 && keyCode != 91 && !self.typing && !modKey) {
                    onEditTitle(this);
                }
            });
            $('#txt_artifact_description').change(onEditDescription);

            $('.js_editortabs').tabs({
                'select': function (evt, ui) {
                    if (ui.tab && ui.tab.hash) {
                        window.location.hash = ui.tab.hash;
                    }
                    // Bug 13023 : hide context menu from all
                    // editors on tab switch.
                    if (window.tinyMCE && tinyMCE.hasOwnProperty('editors')) {
                        $.each(tinyMCE.editors, function (i, ed) {
                            ed.selectEditorTab = true;
                            ed.execCommand('mceRemoveContextMenu', undefined, undefined, {
                                'skip_focus': true
                            });
                            ed.selectEditorTab = false;
                        });
                    }
                },
                'create': function () {
                    $('.js_editortabs').find('ul').removeClass('hide');
                    $('.js_viewtab').removeClass('hide');
                }
            });

            $.extend(true, $.flxweb, {
                'editor': {
                    current_artifact: artifact,
                    showSaveDialog: showSaveDialog,
                    hideSaveDialog: hideSaveDialog,
                    contactSupport: contactSupport,
                    removeValidatorattributes: removeValidatorattributes,
                    istitleCheckInProgress: istitleCheckInProgress,
                    isTitleDuplicate: isTitleDuplicate
                }
            });
            $('.js_collapsible_toggle').click(toggleCollapsible);
            $('.js_save_artifact').click(function () {
                $.flxweb.events.triggerEvent(document, 'flxweb.editor.save_start');
            });

            $(document).bind('flxweb.attachments.changed', onAttachmentChange);

            $('#txt_artifactencodedid').on('change', function () {
                artifact.trigger('change');
            });

            artifactTitle = ($('#txt_artifacttitle').val() || '').toLowerCase().trim();
            $('.var_count').text(artifactTitle.length + ' / ' + $('#txt_artifacttitle').attr('maxlength'));

            // Bug 7359 Character limitation counter for title.
            $('.counter').each(function () {
                $(this).find('input').off('keyup.count').on('keyup.count', function () {
                    var $this = $(this),
                        inputMaxLength = parseInt($this.attr('maxlength')),
                        text = $this.val(),
                        chars = text.length;
                    if (!isNaN(inputMaxLength) && chars > inputMaxLength) {
                        $this.val(text.substr(0, inputMaxLength));
                    }
                    $this.parent().parent().find('.var_count').text($this.val().length + ' / ' + inputMaxLength);
                });
            });

            window.editResourceDialog.bind('flxweb.resource.update.onsuccess', function (data) {
                window.editResourceDialog.updateDetailsOrEditorResourceRow(data);
                onAttachmentChange();
            });
            window.editResourceDialog.bind('flxweb.resource.make.public.required', window.editResourceDialog.interEditResourceClick);

            setEditorVersionText();

            // share menu link
            $('.actionLink').off('click.action').on('click.action', function () {
                $(this).parent().toggleClass('dropMenuOpen');
                return false;
            });
            $('.js_different_link').off('click.draftWalkthrough').on('click.draftWalkthrough', function () {
                payload = {
                    'feature': 'editor',
                    'help_topic_id': 'EDITOR_WHATS_DIFFERENT',
                    'page_type': (window.pageType || 'editor').toLowerCase().replace(/\s/, '_')
                };
                $.flxweb.logADS('fbs_help', payload);
                if ($(window).width() > 767) {
                    callDraftWalkthrough(false);
                }
            });
            $('.js-editor-tab').off('click.off').on('click.on', function() {
                $('body').trigger('click');
            });
            /*if (($.cookie('draftWalkthroughCookie') !== 'true')) {
                callDraftWalkthrough(true);
            }*/
            user.getAppData('flxweb-editor').done(function(ad){
                if(!(ad.response && ad.response.userdata && ad.response.userdata.noDraftWalkThrough === true)){
                    callDraftWalkthrough(true);
                }
            }).fail(function(){
                //user.setAppData('flxweb-editor',{ noDraftWalkThrough:true });
                callDraftWalkthrough(true);
            });
        }

        $(document).ready(domReady);
    });
