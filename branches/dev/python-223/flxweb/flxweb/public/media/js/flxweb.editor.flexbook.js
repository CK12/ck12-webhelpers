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
define('flxweb.editor.flexbook', ['jquery', 'underscore', 'common/utils/utils',
        'flxwebSave/APIUtil',  'common/views/modal.view', 'flxweb.models.artifact',
        'flxweb.editor.errors', 'common/views/breadcrumb.view',
        'text!templates/flxweb.editor.chapter.html', 'text!templates/flxweb.editor.admin.chapter.html',
        'text!templates/flxweb.editor.collab.chapter.html', 'flxweb.editor.managecollaborators',
        'jquery-ui', 'flxweb.global', 'flxweb.editor.tinymce', 'flxweb.editor.common', 'flxweb.settings'
    ],
    function ($, _, Util, APIUtil, ModalView, Artifact, Errors, Breadcrumb, chapterTemplate, adminChapterTemplate, collabChapterTemplate, manageCollaboration) {
        'use strict';

        var xhr, artifact = null,
            artifact_cache = new Hash(), // maintain an unmodified copy of artifact.
            modified_children_count = 0, // List of ALL artifacts
            reload_after_save = true,
            edit_concept_after_save = null,
            save_in_progress = false,
            save_before_finalize = false,
            showRevisionPopup = true,
            logged_in_userid = window.editor_userid,
            isOwner = true,
            GoogleDocs,
            taskIDTimer,
            userRole;

        window.ac = artifact_cache;

        function checkForDuplicateTitle() {
            if ($.flxweb.editor.isTitleDuplicate()) {
                save_in_progress = false;
                $.flxweb.editor.hideSaveDialog();
                $.flxweb.editor.showSaveDialog({
                    'width': 670,
                    'className': 'save-error-modal',
                    'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                    'contentText': Errors.BOOK_ALREADY_EXISTS.message,
                    'buttons': [{
                        'text': 'How do I fix this?',
                        'className': 'dusty-grey',
                        'icon': 'icon-new-window',
                        'onclick': function () {
                            save_in_progress = false;
                            $.flxweb.editor.hideSaveDialog();
                            window.open(Errors.BOOK_ALREADY_EXISTS.faqLink, '_blank');
                        }
                    }, {
                        'text': 'OK, got it!',
                        'className': 'turquoise',
                        'onclick': function () {
                            save_in_progress = false;
                            $.flxweb.editor.hideSaveDialog();
                        }
                    }]
                });
                return true;
            }
            return false;
        }

        function ArtifactUpdater(artifact) {
            var __artifact, _artifact = artifact;
            __artifact = _artifact.clone();

            function saveSuccess(model, response) {
                if (response) {
                    var evt, payload;
                    if (!(response.status && response.status === 'error')) {
                        //ADS log customize Complete
                        payload = {};
                        payload.artifactID = response.artifactID;
                        payload.memberID = ads_userid;
                        artifactRevisionID = response.artifactRevisionID;
                        $.flxweb.logADS('fbs_customize_complete', payload);

                        _artifact.set(response);
                        //fetchArtifact();
                        evt = $.Event('flxweb.editor.flexbook.artifact_update_success');
                        evt.artifact = _artifact;
                        evt.artifact_old = __artifact;
                        $(document).trigger(evt);
                    } else {
                        evt = $.Event('flxweb.editor.flexbook.artifact_update_error');
                        evt.artifact = _artifact;
                        if (response.hasOwnProperty('data')) {
                            delete response.data.traceback;
                            evt.errorData = {
                                'body': response.data || {},
                                'subject': 'Artifact Save Error, ID: ' + (response.data.errorID || new Date().getTime()),
                                'http_status': xhr.status
                            };
                        }
                        showRevisionPopup = true;
                        evt.message = response.message;
                        $(document).trigger(evt);
                    }
                }
            }

            function saveError(model, errorXHR) {
                var evt_err = $.Event('flxweb.editor.flexbook.artifact_update_error');
                evt_err.artifact = _artifact;
                evt_err.errorData = {
                    'body': {
                        'artifactRevisionID': _artifact.get('artifactRevisionID'),
                        'artifactID': _artifact.get('artifactID'),
                        'exceptionType': 'API_FAIL',
                        'error_type': errorXHR  && errorXHR.status ? errorXHR.status : 'SAVE_FAIL_BOOK',
                        'artifactType': 'book',
                        'errorID': new Date().getTime(),
                        'httpstatus': xhr.status
                    },
                    'subject': 'Artifact Save Error, API FAILED',
                    'httpstatus': '500'
                };
                evt_err.message = 'Status: ' + errorXHR.status + ' Message:' + errorXHR.statusText;
                $(document).trigger(evt_err);
                showRevisionPopup = true;
            }

            function saveArtifactContentFinal() {

                if(window.toggleForOldAPI || !shouldCallNewAPI(_artifact.toJSON()) ){

                  xhr = _artifact.save(null, {
                      type : 'POST',
                      success: saveSuccess,
                      error: saveError
                  });

                }else{

                  xhr =  APIUtil.requestSaveAPI(_artifact, 'POST', saveSuccess, saveError);
                }
            }

            function saveArtifact() {
                var encodeID = null,
                    messageToUsers = null,
                    $publishCheckBlock = $('#book_publish_status');

                if ($('#txt_artifactencodedid').length) {
                    encodeID = $('#txt_artifactencodedid').val().toLowerCase().trim() === 'none' ? '' : $('#txt_artifactencodedid').val().trim();
                }
                if ($('#txt_artifactmessagetousers').length) {
                    messageToUsers = $('#txt_artifactmessagetousers').val().toLowerCase().trim() === 'none' ? '' : $('#txt_artifactmessagetousers').val().trim();
                }

                _artifact.set({
                    'encodeID': encodeID,
                    'handle': null,
                    'messageToUsers': messageToUsers
                }); //remove encode ID
                if (edit_concept_after_save === null && $('#deep_copy').length) {
                    _artifact.set({
                        'deepCopy': $('#deep_copy').is(':checked'),
                        'deepCopy_phase': $('#deepCopy_phase').is(':checked') ? 'analysis' : 'copy'
                    });
                }
                if ($publishCheckBlock.length && !$publishCheckBlock.hasClass('hide')) {
                    _artifact.set({
                        'publish': $('#published_status').is(':checked')
                    });
                }
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
            }

            saveArtifact();
        }

        function shouldCallNewAPI(artifact){
          // RIGHT NOW NEW APIS Support
          var allowedArtifactTypes =  ['book', 'chapter', 'lesson', 'enrichment', 'section', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook',
                                        'lecture', 'lab', 'preread', 'postread', 'activity', 'prepostread', 'whileread', 'flashcard','studyguide',
                                        'lessonplan', 'handout', 'rubric', 'presentation', 'web', 'rwa'];
          return ( allowedArtifactTypes.indexOf(artifact.artifactType) != -1)
                  && !artifact.deepCopy; // ADDED BECAUSE NEW APIS DO NOT TAKE REQUESTS FOR DEEP COPY

        }

        function getChildSequence(ui_list) {
            var rows = $(ui_list).find('> li'),
                sequence = [];
            rows.each(function () {
                sequence.push($(this).data('artifactid'));
            });
            return sequence;
        }

        function getArtifactPosition(lookup_artifact) {
            var pos, listitems = $('li.js_artifact_list_item');
            $(listitems).each(function () {
                if ($(this).data('artifactid') === lookup_artifact.get('artifactID') &&
                    $(this).data('artifactrevisionid') === lookup_artifact.get('artifactRevisionID')) {
                    pos = $(this).find('.js_artifact_row .js_index_label').text();
                    if (pos) {
                        pos = pos.trim();
                        if (pos.indexOf('.') === -1) {
                            pos = pos.toString() + '.0';
                        }
                    }
                }
            });
            return pos;
        }

        function artifactSaveSuccess(event) {
            //Handle successful save of an artifact (book or chapter)
            var redirect_url, perma, latest, location, _concept, position, payload,
                _artifact = event.artifact,
                _artifact_old = event.artifact_old;
            if (Artifact.isBookType(_artifact.get('artifactType'))) {
                save_in_progress = false;
                $.flxweb.editor.hideSaveDialog();
                $('.modified').removeClass('modified');
                perma = artifact.get('perma');
                latest = artifact.get('latestRevision');
                location = $.flxweb.settings.webroot_url;

                if (!(_artifact.get('coverImage'))) {
                    payload = {
                        'error_type': 'COVER_IMAGE_LOST',
                        'page_type': 'flexbook_editor',
                        'previousCover': _artifact_old.get('coverImage'),
                        'artifactID': _artifact.get('artifactID'),
                        'artifactRevisionID': _artifact.get('artifactRevisionID'),
                        'userID': $('header').data('user')
                    };
                    $.flxweb.logADS('fbs_error', payload);
                }

                //book saved,
                if (_artifact.get('taskID') && edit_concept_after_save === null) {
                    $.flxweb.editor.showSaveDialog({
                        'headerText': 'CK-12 FlexBook&#174; Textbooks',
                        'contentText': 'Thank you! The book you requested is being generated. We will email you when it is generated.',
                        'buttons': [{
                            'text': 'OK',
                            'className': 'dusty-grey',
                            'onclick': function () {
                                $.flxweb.editor.hideSaveDialog();
                                window.skipUnsavedWarning = true;
                                location += 'my/dashboard/';
                                window.location = location;
                            }
                        }]
                    });

                } else {
                    // replace current state with saved artifact editor
                    redirect_url = '/editor/';
                    redirect_url += _artifact.get('realm') + '/';
                    redirect_url += _artifact.get('artifactType') + '/';
                    redirect_url += _artifact.get('handle');
                    // replace all occurrences of encoded slashes (forward and backward)
                    redirect_url = redirect_url.replace('%2F', '%252F');
                    redirect_url = redirect_url.replace('%5C', '%255C');
                    history.replaceState({}, _artifact.get('title'), redirect_url);

                    if (reload_after_save) {
                        location += escape(perma) + 'r' + latest + '/';
                        window.skipUnsavedWarning = true;
                        window.location = location;
                    } else {
                        if (edit_concept_after_save) {
                            _concept = edit_concept_after_save;

                            position = getArtifactPosition(_concept);
                            if (position) {
                                location += 'editor/';
                                location += escape(perma) + 'r' + latest + '/';
                                location += 'section/';
                                location += position + '/' + _concept.get('handle') + '/';
                                window.skipUnsavedWarning = true;
                                window.location = location;
                            } else {
                                location += 'new/concept/?context=' + escape(perma) + 'r' + latest + '/';
                                window.skipUnsavedWarning = true;
                                window.location = location;
                            }
                        }
                    }
                }
            } else {
                //child artifact saved, update the book
                artifact.replaceChild(_artifact_old.get('id'), _artifact);
                modified_children_count--;
                if (modified_children_count === 0) {
                    ArtifactUpdater(artifact);
                }
            }
            if(save_before_finalize) {
                save_before_finalize = false;
                artifact.dirty = false;
                manageCollaboration.handleFinalizeBook(artifact);
            }
        }

        function artifactSaveError(event) {
            save_in_progress = false;
            $.flxweb.editor.hideSaveDialog();
            var error_type, payload, error_exception, options = {
                'width': 670,
                'className': 'save-error-modal',
                'headerText': '<img src="/media/common/images/sad_flexbook.svg" alt="please contact support">',
                'contentText': 'There was an error saving this FlexBook&#174; Textbook',
                'buttons': [{
                    'text': 'OK, got it!',
                    'className': 'turquoise',
                    'onclick': $.flxweb.editor.hideSaveDialog
                }]
            };
            if (event.hasOwnProperty('message') && event.message.indexOf('Revision passed is not the latest for artifact') !== -1) {
                $.extend(options, {
                    'contentText': 'Looks like the FlexBook/Modality was modified since you started editing. This can happen if you use a shared account or have multiple editors open in many tabs.',
                    'buttons': [{
                        'text': 'Edit Latest Version',
                        'className': 'dusty-grey',
                        'onclick': function () {
                            window.skipUnsavedWarning = true;
                            window.location.reload();
                        }
                    }]
                });
            } else {
                if (event.hasOwnProperty('errorData')) {
                    error_type = event.errorData.body.error_type || 'BOOK_SAVE_UNKNOWN_ERROR';
                    error_exception = event.errorData.body.exceptionType || 'UNKNOWN_EXCEPTION';
                    if (!(Errors.hasOwnProperty(error_type))) {
                        error_type = 'BOOK_SAVE_UNKNOWN_ERROR';
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
                                        'page_type': 'flexbook_editor',
                                        'error_id': event.errorData.body.errorID || ''
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
                                    $.flxweb.editor.contactSupport(event.errorData);
                                }
                            }]
                        });
                    }
                } else if (event.hasOwnProperty('message')) {
                    $.extend(options, {
                        'contentText': event.message
                    });
                }
            }
            $.flxweb.editor.showSaveDialog(options);
            payload = {
                'error_type': 'save_error',
                'error_code': error_type || 'ARTIFACT_SAVE_UNKNOWN_ERROR',
                'error_exception': error_exception || 'UNKNOWN_EXCEPTION',
                'page_type': 'flexbook_editor',
                'feature': 'editor',
                'http_status': event.errorData.http_status
            };
            $.flxweb.logADS('fbs_error', payload);
        }

        /*not used in this file
        function saveFlexBookChildren() {
            //Save any children that are modified before proceeding with the book save.
            var i, child, children = artifact.getChildren();
            for (i = 0; i < children.length; i++) {
                child = children[i];
                if (child.dirty) {
                    if (child.get('artifactType') === 'chapter') {
                        ArtifactUpdater(child);
                    }
                }
            }
        }*/

        /**
         *
         * Validates the Artifact Title
         * Rules:
         * 1) Should not be 'Untitled FlexBook'
         */
        /* not used in this file
        function validateArtifactTitle() {
            var artifactTitle = $('#txt_artifacttitle').val();
            var msg = null;
            var title = 'Invalid Title';
            //Rule#1: Check for 'Untitled FlexBook'
            if (!(artifactTitle.trim())) {
                msg = 'Book title cannot be blank.';
            } else if (artifactTitle.trim().toLowerCase() === 'untitled flexbook') {
                msg = 'Can you suggest a different title for your FlexBook?';
                title = 'Please rename your FlexBook';
            }
            if (msg) {
            $.flxweb.editor.showSaveDialog({
                    'headerText': 'title',
                    'contentText': msg,
                    'buttons': [{
                        'text': 'Edit Title',
                        'className': 'turquoise',
                        'onclick': function () {
                            $('#txt_artifacttitle').focus().select();
                            $.flxweb.editor.hideSaveDialog();
                        }
                    }, {
                        'text': ' ',
                        'className': 'dusty-grey',
                        'onclick': $.flxweb.editor.hideSaveDialog
                    }]
                });
                return false;
            }
            return true;
        }*/

        /*function validateArtifactEncodedID() {
            var artifactencodedid = $('#txt_artifactencodedid').val();
            artifactencodedid = $.trim(artifactencodedid);
            var msg = null;

            // if EID is not default 'none' or blank i.e if it is specified.
            if (artifactencodedid !== '' && artifactencodedid.toLowerCase() !== 'none') {

                if (artifact.get('artifactType') === 'book') {


                    eg. 'CK.MAT.ENG.SE.1.Math-Grade-7.1'
                         CK.MAT.ENG.SE.1.Math-Grade-7
                    PROV - any number of letter/digits
                    SUB - 3 letters/numbers
                    LNG - 3 letters/numbers
                    TP - any number of letters/numbers
                    ED - any digits number
                    Handle - any length, letters/numbers/dashes - no spaces
                    SEQ - number (OPTIONAL - only for chapters)
                    SEQ2 - number (OPTIONAL - only for sections)


                    var tmp = artifactencodedid.split('.');

                    var sub = tmp[1];
                    var lng = tmp[2];
                    var ed = tmp[4];
                    var handle = tmp[tmp.length - 2];

                    var intRegex = /^\d+$/;

                    if (tmp.length < 5) {
                        msg = 'Invalid Encoded ID format.';
                    }
                    if ((sub && sub.length !== 3) || (lng && lng.length !== 3)) {
                        msg = 'Subject and Language code must be 3 characters long in Encoded ID.';
                    }
                    if (ed && !intRegex.test(ed)) {
                        msg = 'Edition number must be numeric in Encoded ID.';
                    }
                    if (handle && encodeURIComponent(handle) !== handle) {
                        msg = 'Url-unsafe characters are not allowed for handle in Encoded ID.';
                    }

                }
            }

            if (msg) {
            $.flxweb.editor.showSaveDialog({
                    'headerText': 'Warning',
                    'contentText': msg,
                    'buttons': [{
                        'text': 'Edit encoded ID',
                        'className': 'turquoise',
                        'onclick': function () {
                            $('#txt_artifactencodedid').focus().select();
                            $('#txt_artifactencodedid').data('edit', 'true');
                            $.flxweb.editor.hideSaveDialog();
                        }
                    }, {
                        'text': 'Save anyway',
                        'className': 'dusty-grey',
                        'onclick': function () {
                            $('#txt_artifactencodedid').data('edit', 'false');
                            $.flxweb.editor.hideSaveDialog();
                            saveArtifact();
                        }
                    }]
                });
                return false;
            }
            return true;
        }*/

        function getArtifactRevisionComments() {
            if ($.inArray(flxweb_role, ($.flxweb.settings.edit_allowed_roles).split(',')) !== -1) {
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
                            });
                            $.flxweb.editor.hideSaveDialog();
                            saveFlexBook();
                        }
                    }]
                });
            } else {
                return true;
            }
            return false;
        }

        /**
         * check all chapter titles,
         * return false with appropriate message if duplicate titles are found
         */
        function validateDuplicateChapterTitles() {
            var child,
                children = artifact.getChildren(),
                hasDuplicateTitles = false;

            $(children).each(function (idx) {
                if (hasDuplicateTitles) {
                    return;
                }
                child = this;
                if (child.get('artifactType') === 'chapter') {
                    $(children).each(function (_idx) {
                        if (idx !== _idx) {
                            if (this.get('artifactType') === 'chapter') {
                                if (this.get('title') === child.get('title')) {
                                    hasDuplicateTitles = true;
                                    var dupTitle = this.get('title');
                                    $.flxweb.editor.showSaveDialog({
                                        'headerText': 'CK-12 FlexBook&#174; Textbooks',
                                        'contentText': $.flxweb.gettext('You have more than one chapters with title:<strong><%= title %></strong>. Please edit the chapter titles to make them unique', {
                                            'title': _.escape(dupTitle)
                                        }),
                                        'buttons': [{
                                            'text': 'OK',
                                            'className': 'turquoise',
                                            'onclick': $.flxweb.editor.hideSaveDialog
                                        }]
                                    });
                                }
                            }
                        }
                    });
                }
            });
            return !hasDuplicateTitles;
        }

        function cacheChildren(artifact) {
            var i, child, children = artifact.getChildren();
            for (i = 0; i < children.length; i++) {
                child = children[i];
                artifact_cache.set(child.get('id'), child);
                if (child.hasChildren()) {
                    cacheChildren(child);
                }
            }
        }

        function syncArtifactState() {
            //iterate through rows and reorganize artifact
            var _artifact_id, _artifact, _children, i, _id, _seq,
                rows = $('#chapter_list >.js_artifact_list >li'),
                sorted_artifacts = [];
            rows.each(function () {
                _artifact_id = $(this).data('artifactid');
                _artifact = artifact_cache.get(_artifact_id);
                if (_artifact.get('artifactType') === 'chapter') {
                    _artifact.set({
                        'bookTitle': artifact.get('title')
                    }, {
                        'silent': true
                    });
                }
                if ($(this).find('ul.modified').length) {
                    _seq = getChildSequence($(this).find('ul.js_artifact_list'));
                    _children = [];
                    for (i = 0; i < _seq.length; i++) {
                        _id = _seq[i];
                        if (artifact_cache.get(_id)) {
                            _children.push(artifact_cache.get(_id));
                        }
                    }
                    _artifact.setChildren(_children);
                    _artifact.set({
                        'isDirty': true
                    });
                }
                sorted_artifacts.push(_artifact);
            });
            artifact.setChildren(sorted_artifacts);
            cacheChildren(artifact);
        }

        function saveFlexBook() {
            // Validate the artifact title
            if (!Util.validateResourceTitle($('#txt_artifacttitle').val(), 'artifact') || !validateDuplicateChapterTitles()) {
                save_in_progress = false;
                return false;
            }

            /*
            Bug 13049 fbs encodedID need not validations.
            if($('#txt_artifactencodedid').data('edit') != 'false'){
                if (!validateArtifactEncodedID()){
                    save_in_progress = false;
                    return false;
                }
            }*/

            if (showRevisionPopup) {
                if (!getArtifactRevisionComments()) {
                    save_in_progress = false;
                    return false;
                }
            }
            artifact.set({
                'title': $('#txt_artifacttitle').val()
            });

            syncArtifactState();
            $.flxweb.editor.showSaveDialog({
                'headerText': 'Saving FlexBook&#174; textbook...',
                'contentText': 'Hold tight, this may take some time...',
                'loading': true,
                'hideClose': true
            });
            //Begin book saving process
            ArtifactUpdater(artifact);
            return false;
        }

        function updateRowIndices() {
            //update row numbers
            var index_labels = $('.js_index_label'),
                idx_parent = 0,
                idx_child = 0,
                level = 0,
                href = '',
                edit_links = $('.js_row_edit, .js_row_update');
            $(index_labels).each(function () {
                level = $(this).parents().filter('.js_artifact_list').size();
                if (level === 1) {
                    idx_parent++;
                    idx_child = 0;
                    $(this).text(idx_parent);
                } else {
                    idx_child++;
                    $(this).text(idx_parent + '.' + idx_child);
                }
            });
            //update edit links with proper position
            idx_parent = 0;
            idx_child = 0;
            level = 0;
            $(edit_links).each(function () {
                level = $(this).parents().filter('.js_artifact_list').size();
                if (level === 1) {
                    if ($(this).hasClass('js_row_edit')) {
                        idx_parent++;
                        idx_child = 0;
                    }
                    href = $(this).attr('href');
                    if ($(this).attr('data-draft') === 'true' && href !== '#' && $(this).hasClass('js_row_edit')) {
                        $(this).prev().find('a').each(function () {
                            href = $(this).attr('href');
                            href = href.replace(/\/section\/\d+\.\d+\//, '/section/' + idx_parent + '.' + idx_child + '/');
                            href = href.replace(/\/section\/\d+\.\d+\?/, '/section/' + idx_parent + '.' + idx_child + '?');
                            $(this).attr('href', href);
                        });
                    } else if (href && href !== '#') {
                        href = href.replace(/\/section\/\d+\.\d+\//, '/section/' + idx_parent + '.' + idx_child + '/');
                        $(this).attr('href', href);
                    }
                } else {
                    if ($(this).hasClass('js_row_edit')) {
                        idx_child++;
                    }
                    href = $(this).attr('href');
                    if ($(this).attr('data-draft') === 'true' && href !== '#' && $(this).hasClass('js_row_edit')) {
                        $(this).prev().find('a').each(function () {
                            href = $(this).attr('href');
                            href = href.replace(/\/section\/\d+\.\d+\//, '/section/' + idx_parent + '.' + idx_child + '/');
                            href = href.replace(/\/section\/\d+\.\d+\?/, '/section/' + idx_parent + '.' + idx_child + '?');
                            $(this).attr('href', href);
                        });
                    } else if (href && href !== '#') {
                        href = href.replace(/\/section\/\d+\.\d+\//, '/section/' + idx_parent + '.' + idx_child + '/');
                        $(this).attr('href', href);
                    }
                }
            });
            $('.js_artifact_list').each(function () {
                if ($(this).children().length === 0) {
                    $(this).addClass('js_empty');
                }
            });
        }

        function reCalculateDraftCount() {
            var count;
            $('.chapterlist .artifact_type_chapter.loaded').each(function () {
                count = $(this).find('.js_artifact_list_item[data-draft="true"]').length;
                if (count) {
                    $(this).find('.draft-chapter').text('Drafts(' + count + ')');
                } else {
                    $(this).find('.draft-chapter').text('');
                }
            });
        }

        function reCalculateAssignmentCount(ui,_this) {
            if($(ui.item).find($(".js_artifact_row")).hasClass("assigned-section")){
                //drop at chapter  level
                if($(ui.item).siblings(".loaded").length>0){
                    var assignCount = $(_this).parents(".loaded").find($(".assignment-count")).attr('data-count');
                    assignCount === "" ? assignCount = 0 : assignCount = parseInt(assignCount)-1;
                    if(assignCount > 0){
                        $(_this).parents(".loaded").find($(".assignment-count")).text('Assignments(' + assignCount + ')').attr('data-count', assignCount);
                    }
                    else {
                        $(_this).parents(".loaded").find($(".assignment-count")).text('').attr('data-count', assignCount);
                    }
                }
                //drop at section level
                else if($(ui.item).parents(".loaded").length>0){
                    var assignCount = $(ui.item).parents(".loaded").find($(".assignment-count")).attr('data-count');
                        if(!assignCount){
                            assignCount = 0;
                        }
                        assignCount = parseInt(assignCount) +1;
                    var previChapAssignCount = parseInt($(_this).parents(".loaded").find($(".assignment-count")).attr('data-count'))-1;
                    if(previChapAssignCount>0){
                        $(_this).parents(".loaded").find($(".assignment-count")).text('Assignments(' + (previChapAssignCount) + ')').attr('data-count', (previChapAssignCount));
                    }
                    else {
                        $(_this).parents(".loaded").find($(".assignment-count")).text('').attr('data-count', (previChapAssignCount));
                    }
                    $(ui.item).parents(".loaded").find($(".assignment-count")).text('Assignments(' + (assignCount) + ')').attr('data-count',( assignCount));
                    $(ui.item).parents(".loaded").find('.js_chapter_actions').find('.js_row_remove').addClass('hidden');
                }
            }
        }

        function artifactRowUpdate(event, ui) {
            //call the artifacRowUpdate once only
            // see http://stackoverflow.com/questions/3101129/jquery-sortable-update-event-can-called-only-one-time
            if (ui.sender === null) {
                var dropped_list_parent, other_list_items, row, newIndex, oldIndex, payload,
                    _this = this;
                //prevent chapters from being dropped into other chapters.
                if (ui.item.data('artifacttype') === 'chapter' && ui.item.parent().hasClass('conceptlist')) {
                    $(_this).sortable('cancel');
                }
                //prevent drop into an outdated chapter
                dropped_list_parent = ui.item.parents('li');
                if ($(dropped_list_parent).length) {
                    dropped_list_parent = dropped_list_parent[0];
                    if (($(dropped_list_parent).data('islatest')).toString().toLowerCase() === 'false') {
                        $(_this).sortable('cancel');
                    }
                }
                //on drop, see if the artifact already exists in the children list
                other_list_items = ui.item.siblings();
                $(other_list_items).each(function () {
                    if ($(_this).data('artifactid') === ui.item.data('artifactid')) {
                        $(_this).sortable('cancel');
                        return false;
                    }
                });

                updateRowIndices();
                $(_this).addClass('modified');
                row = $(ui.item);
                $(row).parent().addClass('modified').removeClass('js_empty');
                $.flxweb.events.triggerEvent($(document), 'flxweb.editor.flexbook.row_moved', {
                    'artifactRevisionID': $(row).data('artifactrevisionid'),
                    'artifactType': $(row).data('artifacttype'),
                    'artifactID': $(row).data('artifactid'),
                    'newIndex': $(row).find('.js_index_label').html()
                });
                newIndex = $(row).find('.js_index_label').html();
                oldIndex = $(ui.item).find('.js_index_label').html();
                payload = {
                    'oldIndex': oldIndex,
                    'newIndex': newIndex,
                    'artifactID': artifactID
                };
                $.flxweb.logADS('fbs_rearrange_content', payload);
                syncArtifactState();
                reCalculateDraftCount();
                if($(ui.item.parent()).attr("data-artifactid") != $(_this).attr("data-artifactid")){
                    reCalculateAssignmentCount(ui,_this);
                }

            }
        }

        function artifactRowReceive(evt, ui) {
            $(this).addClass('modified');
            if (ui.sender) {
                ui.sender.addClass('modified');
            }
        }

        function summaryClick() {
            //Initialize tinyMCE editor for summary.
            $.flxweb.editor.tinymce.init($(this));
        }

        function getSummary() {
            //Returns the contents of #artifact_summary block.
            return $('#artifact_summary').html();
        }

        function onSummaryEdit() {
            //Sets artifact summary to current contents of #artifact_summary block.
            artifact.set({
                'summary': getSummary()
            });
        }

        function formHref(chapterDetails) {
            var $list, booktype, book_handle, realm, version, href;
            $list = $('#chapter_list > ul');
            booktype = $list.attr('data-booktype');
            book_handle = $list.attr('data-book_handle');
            realm = encodeURIComponent($list.attr('data-realm'));
            version = $list.attr('data-version');
            if (realm === 'None') {
                href = '/' + 'editor';
            } else {
                href = '/' + 'editor' + '/' + realm;
            }
            href += '/' + booktype + '/' + book_handle + '/r' + version +
                '/' + 'section' + '/' + chapterDetails.position + '/' + chapterDetails.section_title;
            return href;
        }

        function isEditorDirty() {
            if ((window.skipUnsavedWarning)) {
                return false;
            }
            return (
                artifact.dirty ||
                $('.modified').size() > 0
            );
        }

        function rowEditClick(e) {
            var _artifact = artifact_cache.get($($(e.currentTarget).parents('.js_artifact_list_item').get(0)).data('artifactid')),
                editor = $.flxweb.editor.chapterEditor;
            if ($(e.currentTarget).prev('ul').length) {
                return;
            }

            if (_artifact.get('artifactType') === 'chapter') {
                editor.open(_artifact.clone());
                return false;
            }
            if (userRole !== 'collaborator' && isEditorDirty()) {
                e.preventDefault();
                if ($('#deep_copy').is(':checked')) {

                    $.flxweb.editor.showSaveDialog({
                        'headerText': 'Warning',
                        'contentText': "Deep Copy option will not work with 'Write a Modality'",
                        'buttons': [{
                            'text': 'Cancel',
                            'className': 'dusty-grey',
                            'onclick': $.flxweb.editor.hideSaveDialog
                        }, {
                            'text': 'Save anyway',
                            'className': 'turquoise',
                            'onclick': function () {
                                $.flxweb.editor.hideSaveDialog();
                                reload_after_save = false;
                                edit_concept_after_save = _artifact;
                                saveFlexBook();
                            }
                        }]
                    });

                    return false;
                }
                reload_after_save = false;
                edit_concept_after_save = _artifact;
                saveFlexBook();
                return false;
            }
            if (userRole === 'collaborator') {
                e.preventDefault();
                manageCollaboration.checkAuthority(_artifact.get('artifactID')).done(function(data) {
                    if (data === 'authorized') {
                        location.href = $(e.currentTarget).attr('href');
                    } else {
                        $(e.currentTarget).addClass('hide');
                        ModalView.alert('You cannot edit the section "' + _artifact.get('title') + '" as it has been unassigned');
                    }
                });
            }
        }
        
        function displaySections(chapterArtifact, sectionList, currentList) {
            var bookEditingAssignments, isOwned, isLatest, chapterDetails, newArtifact,
                isNew, str, childIndex, template, sectionIndex, href, parentIndex,
                domainHandle = '', count = 0, assigned = false, assigneeID = false, assigneeEmail = false;
            // Bug #37657 update cahce after fetching chapter
            artifact_cache.set(chapterArtifact.get('id'), chapterArtifact);
            parentIndex = currentList.index() + 1;
            if (sectionList) {
                str = '';
                isNew = Artifact.is_new(artifact);
                for (sectionIndex = 0; sectionIndex < sectionList.length; sectionIndex++) {
                    childIndex = parentIndex + '.' + (sectionIndex + 1);
                    if (sectionList[sectionIndex].domain) {
                        domainHandle = sectionList[sectionIndex].domain.handle;
                    }
                    chapterDetails = {
                        'artifactType': sectionList[sectionIndex].artifactType,
                        'domainHandle': domainHandle,
                        'handle': sectionList[sectionIndex].handle,
                        'position': childIndex,
                        'section_title': encodeURIComponent(sectionList[sectionIndex].handle)
                    };
                    isLatest = Artifact.is_latest(sectionList[sectionIndex]);
                    isOwned = ((sectionList[sectionIndex].creatorID).toString() === logged_in_userid);
                    bookEditingAssignments = manageCollaboration.getAssignments();
                    if (userRole === 'owner') {
                        if (bookEditingAssignments) {
                            for (count= 0; count < bookEditingAssignments.length; count++) {
                                if (bookEditingAssignments[count].artifactID === sectionList[sectionIndex].artifactID) {
                                    assigned = true;
                                    assigneeID = bookEditingAssignments[count].assigneeID;
                                    assigneeEmail = bookEditingAssignments[count].assigneeEmail;
                                }
                            }
                        }
                    } else if (userRole === 'collaborator') {
                        if (bookEditingAssignments) {
                            //collab
                            for (count= 0; count < bookEditingAssignments.length; count++) {
                                if (bookEditingAssignments[count].artifactID === sectionList[sectionIndex].artifactID && bookEditingAssignments[count].assigneeID === $('header').data('user')) {
                                    assigned = true;
                                }
                            }
                        }
                    }
                    sectionList[sectionIndex].title = _.escape(sectionList[sectionIndex].title);
                    href = formHref(chapterDetails);
                    template = chapterTemplate({
                        'hasDraft': sectionList[sectionIndex].hasDraft,
                        'conceptNode': sectionList[sectionIndex],
                        'assigned': assigned,
                        'assigneeID': assigneeID,
                        'assigneeEmail': assigneeEmail,
                        'tocnumber': childIndex,
                        'section': sectionList[sectionIndex],
                        'href': href,
                        'isOwned': isOwned,
                        'isNew': isNew,
                        'isLatest': isLatest
                    });
                    assigned = false;
                    assigneeID = false;
                    assigneeEmail = false;
                    str += template;
                    newArtifact = new Artifact(sectionList[sectionIndex]);
                    artifact_cache.set(newArtifact.get('id'), newArtifact);
                    cacheChildren(newArtifact);
                }
                if (str) {
                    currentList.find('ul').removeClass('js_empty').html(str);
                }
            }
        }

        function chapterExpandToggle(obj) {
            //Expand/collapse chapter rows
            //Checks whether this function is called by any event or by ordinary call
            var chapterArtifact, sectionList, currentList, thisElement, artifactRevisionID, _this;

            artifactRevisionID = $.trim($(this).parents('li.js_artifact_list_item').attr('data-artifactRevisionID'));
            thisElement = $(this).find('.js_expand_toggle')[0];
            currentList = $(thisElement).parents('li.js_artifact_list_item');
            if (currentList.hasClass('loaded')) {
                _this = $(thisElement).hasClass('row_expand_toggle') ? thisElement : obj;
                $(_this).toggleClass('ui-icon-triangle-1-e').toggleClass('ui-icon-triangle-1-s');
                $(_this).closest('.js_artifact_row').next().toggleClass('hide');
            } else if (currentList.attr('data-artifacttype') === 'chapter') {
                $.flxweb.editor.showSaveDialog({
                    'headerText': 'CK-12 FlexBook&#174; Textbooks',
                    'loading': true,
                    'hideClose': true
                });
                Util.ajax({
                    url: Util.getApiUrl('flx/get/info/revisions/' + artifactRevisionID),
                    data: {
                        'forUpdate': true
                    },
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: function (result) {
                        if (result && result.response) {
                            if (result.response.artifacts) {
                                chapterArtifact = result.response.artifacts[0];
                                sectionList = chapterArtifact.revisions[0].children;
                                chapterArtifact = new Artifact(chapterArtifact);
                                displaySections(chapterArtifact, sectionList, currentList);
                            }
                            currentList.addClass('loaded');
                            _this = $(thisElement).hasClass('row_expand_toggle') ? thisElement : obj;
                            $(_this).toggleClass('ui-icon-triangle-1-e').toggleClass('ui-icon-triangle-1-s');
                            $(_this).closest('.js_artifact_row').next().toggleClass('hide');
                            $('body').trigger('conceptsLoaded');
                        }
                    },
                    complete: $.flxweb.editor.hideSaveDialog
                });
            }
        }

        function removeRow(row) {
            var index, payload, title = $(row).find('.js_artifact_title:first').text(),
                remove_artifact_ID = $(row).attr('data-artifactid');
            artifact_cache.remove(remove_artifact_ID);
            $(row).parent().addClass('modified');
            $(row).fadeOut(400, function () {
                $(this).remove();
                updateRowIndices();
                $.flxweb.events.triggerEvent($(document), 'flxweb.editor.flexbook.row_removed', {
                    'artifactRevisionID': $(row).data('artifactrevisionid'),
                    'artifactID': $(row).data('artifactid'),
                    'artifactType': $(row).data('artifacttype')
                });

                var childIndex = -1;
                $.each($.flxweb.editor.current_artifact.get('children'), function (index, child) {
                    if (child.title === title && child.artifactID === $(row).data('artifactid') && child.artifactType === $(row).data('artifacttype')) {
                        childIndex = index;
                        return;
                    }
                });
                if (childIndex !== -1) {
                    ($.flxweb.editor.current_artifact.get('children')).splice(childIndex, 1);
                }
                $.flxweb.notify('Removed : ' + title);
                reCalculateDraftCount();
            });
            index = $(row).find('.js_index_label').html();
            payload = {
                'index': index,
                'artifactID': artifactID,
                'removedArtifactID': remove_artifact_ID
            };
            $.flxweb.logADS('fbs_remove_content', payload);
            return false;
        }

        function artifactInTOC(artifact) {
            if (artifact_cache.get(artifact.get('artifactID')) === null) {
                return false;
            }
            return true;
        }

        function initSortableRows() {
            //Create a nested sortable list.
            $('#chapter_list ul.js_artifact_list').sortable({
                'update': artifactRowUpdate,
                'receive': artifactRowReceive,
                'containment': $('#editor_container'),
                'helper': 'clone',
                'handle': '.js_row_handle',
                'connectWith': '#chapter_list ul.js_artifact_list',
                'placeholder': 'ui-state-highlight',
                'start': function (e, ui) { //fix placeholder height
                    ui.placeholder.height(ui.item.height());
                }
            });

            $('.artifact_type_chapter').droppable({
                'over': function () {
                    chapterExpandToggle($(this).find('.ui-icon-triangle-1-e'));
                }
            });

        }

        /*function destroySortableRows() {
            $('#chapter_list ul').sortable('destroy');
        }*/

        function refreshSortableRows() {
            $('#chapter_list ul.js_artifact_list').sortable('refresh');
        }

        function getChapterRow(chapter, position, idx) {
            var chapter_row, concept_row, j, child,
                children = chapter.getChildren(),
                jsondata = chapter.toJSON();
            jsondata.position = position;
            jsondata.index = idx;
            chapter_row = $.flxweb.template.render('#ck12_template_chapter_row', jsondata);
            for (j = 0; j < children.length; j++) {
                child = children[j];
                artifact_cache.set(child.get('artifactID'), child);
                jsondata = child.toJSON();
                position = idx + '.' + (j + 1);
                jsondata.position = position;
                jsondata.index = position;
                concept_row = $.flxweb.template.render('#ck12_template_concept_row', jsondata);
                $(chapter_row).find('.conceptlist').removeClass('js_empty').append(concept_row);
            }
            return chapter_row;
        }

        function addArtifact(artifact) {
            var position, jsondata, children, child, chapter_row, concept_row, artifact_in_toc, i, old_chapter_row, _idx, _pos,
                rowType, new_row,
                idx = $('.chapterlist>li').size() + 1;

            if (Artifact.isBookType(artifact.get('artifactType'))) {
                if (artifact.get('artifactID') === $.flxweb.editor.current_artifact.get('artifactID')) {
                    $.flxweb.editor.showSaveDialog({
                        'headerText': 'CK-12 FlexBook&#174; Textbooks',
                        'contentText': 'Cannot add a FlexBook&#174; textbook into itself.',
                        'buttons': [{
                            'text': 'OK',
                            'className': 'turquoise',
                            'onclick': $.flxweb.editor.hideSaveDialog
                        }]
                    });
                } else {
                    children = artifact.getChildren();
                    for (i = 0; i < children.length; i++) {
                        child = children[i];
                        artifact_in_toc = artifactInTOC(child);
                        artifact_cache.set(child.get('artifactID'), child);
                        jsondata = child.toJSON();
                        position = idx + '.0';
                        jsondata.position = position;
                        jsondata.index = idx;
                        if (child.get('artifactType') === 'chapter') {
                            old_chapter_row = null;
                            if (artifact_in_toc) {
                                _idx = null;
                                _pos = null;
                                $('.chapterlist > li').each(function (loop_idx) {
                                    if ($(this).data('artifactid') === child.get('artifactID')) {
                                        old_chapter_row = $(this);
                                        _idx = loop_idx + 1;
                                        _pos = _idx + '.0';
                                        return false;
                                    }
                                });
                                chapter_row = getChapterRow(child, _pos, _idx);
                                chapter_row.addClass('loaded');
                                $(old_chapter_row).replaceWith(chapter_row);
                            } else {
                                chapter_row = getChapterRow(child, position, idx);
                                chapter_row.addClass('loaded');
                                $('.chapterlist').append(chapter_row).addClass('modified');
                            }
                            chapter_row.effect('pulsate');
                        } else {
                            if (!artifact_in_toc) {
                                concept_row = $.flxweb.template.render('#ck12_template_concept_row', jsondata);
                                $('.chapterlist').append(concept_row).addClass('modified');
                                concept_row.effect('pulsate');
                            } else {
                                $('.chapterlist li').each(function () {
                                    if ($(this).data('artifactid') === child.get('artifactID')) {
                                        $(this).effect('pulsate');
                                    }
                                });
                            }
                        }
                        if (!artifact_in_toc) {
                            idx++;
                        }
                    }
                }
            } else {
                if (!artifactInTOC(artifact)) {
                    artifact_cache.set(artifact.get('id'), artifact);
                    jsondata = artifact.toJSON();
                    if (!jsondata.artifactID) {
                        jsondata.artifactID = jsondata.id;
                    }
                    if (!jsondata.artifactRevisionID) {
                        jsondata.artifactRevisionID = jsondata.id;
                    }
                    position = idx + '.0';
                    rowType = (artifact.get('artifactType') === 'chapter') ? 'chapter' : 'concept';
                    jsondata.position = position;
                    jsondata.index = idx;
                    new_row = $.flxweb.template.render('#ck12_template_' + rowType + '_row', jsondata);
                    new_row.addClass('loaded');
                    $('.chapterlist').append(new_row).addClass('modified');
                    $.flxweb.events.triggerEvent(document, 'flxweb.editor.flexbook.add_artifact', {
                        'artifact': artifact.attributes
                    });
                    new_row.effect('pulsate');
                } else {
                    $('.chapterlist li').each(function () {
                        if ($(this).data('artifactid') === artifact.get('artifactID')) {
                            $(this).effect('pulsate');
                        }
                    });
                }
            }
            //destroySortableRows();
            syncArtifactState();
            refreshSortableRows();
            initSortableRows();
        }

        function chapterUpdateSuccess(data) {
            $.flxweb.editor.hideSaveDialog();
            var $this, chapter, _idx, _pos, chapter_row, assignmentCount,
                chapter_rows = $('.chapterlist>li');
            chapter = new Artifact(data.response.artifacts[0]);
            chapter_rows.each(function (loop_idx) {
                $this = $(this);
                if ($this.data('artifactid') === chapter.get('artifactID')) {
                    displaySections(chapter, chapter.get('revisions')[0].children, $this);
                    $this.find('span.js_artifact_title').text(chapter.get('title'));
                    $this.find('.js_chapter_actions').find('.js_row_edit').removeClass('hide');
                    $this.find('.js_chapter_actions').find('.js_row_update').addClass('hide');
                    $this.data('artifactrevisionid', chapter.get('artifactRevisionID'));
                    $this.find('.js_expand_toggle').addClass('ui-icon-triangle-1-e').removeClass('ui-icon-triangle-1-s');
                    $this.find('.conceptlist ~ div').remove();
                    $this.effect('pulsate');
                    $this.addClass('loaded');
                    $this.data('data-islatest', 'True');
                    $this.find('ul.conceptlist').addClass('modified');
                    $('body').trigger('conceptsLoaded');

                    //update the artifact in cache
                    chapter.set({
                        'isDirty': true
                    });
                    artifact_cache.set(chapter.get('artifactID'), chapter);
                    reCalculateDraftCount();
                    assignmentCount = $this.find('ul.conceptlist').find('.assigned-section').length;
                    if (assignmentCount) {
                        $this.find('.assignment-count').text('Assignments(' + assignmentCount + ')').attr('data-count', assignmentCount);
                    } else {
                        $this.find('.assignment-count').text('').attr('data-count', 0);
                    }
                }
            });
            syncArtifactState();
            refreshSortableRows();
            initSortableRows();
        }

        function rowUpdateClick() {
            var id, _artifact, latestRevisionId,
                row = $(this).parents('.js_artifact_list_item').get(0);

            id = $(row).data('artifactid');
            _artifact = artifact_cache.get(id);

            if (_artifact.get('artifactType') === 'chapter') {
                //handle chapter update
                latestRevisionId = _artifact.get('latestRevisionID');
                $.flxweb.editor.showSaveDialog({
                    'headerText': 'CK-12 FlexBook&#174; Textbooks',
                    'contentText': $.flxweb.gettext('Updating chapter: <%= chapter_title %>', {
                        'chapter_title': _.escape(_artifact.get('title'))
                    }),
                    'loading': true,
                    'hideClose': true
                });
                Util.ajax({
                    url: Util.getApiUrl('flx/get/info/revisions/' + _artifact.get('latestRevisionID')),
                    cache: false,
                    isPageDisable: true,
                    isShowLoading: true,
                    success: chapterUpdateSuccess,
                    error: function () {
                        $.flxweb.editor.hideSaveDialog();
                        $.flxweb.editor.showSaveDialog({
                            'headerText': 'CK-12 FlexBook&#174; Textbooks',
                            'contentText': $.flxweb.gettext('Error updating chapter. Please try again later.'),
                            'buttons': [{
                                'text': 'OK',
                                'className': 'turquoise',
                                'onclick': $.flxweb.editor.hideSaveDialog
                            }]
                        });
                    }
                });
            } else {
                //handle concept/section update. just bring artifactRevisionID to latestRevisionID.
                latestRevisionId = _artifact.get('latestRevisionID');
                _artifact.set('artifactRevisionID', latestRevisionId);
                $(row).data('artifactrevisionid', latestRevisionId);
                $(row).attr('data-artifactrevisionid', latestRevisionId);
                artifact_cache.set(id, _artifact);
                $(this).addClass('hide');
                $(row).find('.js_row_edit').removeClass('hide');
                $(row).find('.js-more-options').removeClass('hide');
                artifact.dirty = true;
                $(this).parents('ul').addClass('modified');
                syncArtifactState();
            }
            return false;
        }

        function addConceptClick() {
            if ($('#deep_copy').is(':checked')) {
                $.flxweb.editor.showSaveDialog({
                    'headerText': 'Warning',
                    'contentText': "Deep Copy option will not work with 'Write a Modality'",
                    'buttons': [{
                        'text': 'Cancel',
                        'className': 'dusty-grey',
                        'onclick': $.flxweb.editor.hideSaveDialog
                    }, {
                        'text': 'Save anyway',
                        'className': 'turquoise',
                        'onclick': function () {
                            $.flxweb.editor.hideSaveDialog();
                            if (isEditorDirty() || $.flxweb.editor.current_artifact.get('id') === 'new') {
                                reload_after_save = false;
                                edit_concept_after_save = new Artifact({
                                    'artifactType': 'concept'
                                });
                                saveFlexBook();
                            }
                        }
                    }]
                });
                return false;
            }
            if (isEditorDirty() || $.flxweb.editor.current_artifact.get('id') === 'new') {
                reload_after_save = false;
                edit_concept_after_save = new Artifact({
                    'artifactType': 'concept'
                });
                saveFlexBook();
                return false;
            }
        }

        function chapterSaveSuccess(evt, data) {
            try {
                $.flxweb.editor.chapterEditor.close();
            } catch (e) {
                console.log(e);
            }
            var chapter_id, old_chapter_id, row_id, _idx, _pos, chapter_row,
                chapter = data.artifact,
                old_chapter = data.old_artifact;
            chapter.set({
                'isDirty': true
            });
            chapter_id = chapter.get('artifactID');
            old_chapter_id = old_chapter.get('artifactID');
            row_id = old_chapter_id;
            if (!old_chapter_id) {
                row_id = chapter_id;
            }
            if (artifact_cache.get(row_id)) {
                //existing chapter
                $('.chapterlist > li').each(function (loop_idx) {
                    if ($(this).data('artifactid') === row_id) {
                        _idx = loop_idx + 1;
                        _pos = _idx + '.0';
                        //chapter_row = getChapterRow(chapter, _pos, _idx);
                        //chapter_row.addClass('loaded');
                        //$(this).replaceWith(chapter_row);
                        //$(chapter_row).find('.js_row_edit').off('click.save').on('click.save', rowEditClick);
                        $(this).find('span.js_artifact_title').text(chapter.get('title'));
                        $(this).effect('pulsate');
                    }
                });
            } else {
                //new chapter
                addArtifact(chapter);
            }
            artifact_cache.set(chapter_id, chapter);
            syncArtifactState();
            refreshSortableRows();
            initSortableRows();
        }

        function addNewChapter() {
            if (!Util.validateResourceTitle($('#txt_artifacttitle').val(), 'artifact')) {
                return false;
            }

            var chapter = new Artifact({
                'title': 'New Chapter',
                'id': 'new_' + new Date(),
                'artifactType': 'chapter',
                'isLatest': true,
                'bookTitle': artifact.get('title'),
                'isDirty': true
            });

            $.flxweb.editor.chapterEditor.open(chapter);
            return false;
        }

        function openGDTimporter() {
            $.flxweb.gdtimport.open();
            return false;
        }

        function artifactFetchSuccess(newArtifact, response) {
            newArtifact.set({
                'dirty': false
            }, {
                'silent': true
            });
            $.flxweb.events.triggerEvent(document, 'flxweb.gdtimport.success', {
                'artifact': newArtifact
            });
        }

        function importSuccess(json_status) {
            var newArtifact, userdata = JSON.parse(json_status.userdata);
            if (userdata) {
                newArtifact = new Artifact({
                    'artifactType': userdata.artifactType,
                    'realm': userdata.realm,
                    'handle': userdata.handle,
                    'id': userdata.id
                });
                newArtifact.fetch({
                    'success': artifactFetchSuccess
                });
            }
        }

        function openGoogleDocsModal() {
            require(['library/views/library.googledocs', 'library/models/library.googledocs'], function (GoogleDocsView, GoogleDocsModel) {
                $('#contentwrap').append('<div id="google-docs-container"></div>');
                if (!GoogleDocs) {
                    GoogleDocs = new GoogleDocsView({
                        el: $('#google-docs-container'),
                        model: new GoogleDocsModel(),
                        importSuccess: importSuccess
                    });
                } else {
                    GoogleDocs.render();
                }
                $('#dropdown-modality').addClass('disabled');
            });
        }

        function openXDTimporter() {
            $.flxweb.xdtimport.open();
            return false;
        }

        function gdtImportSuccess(evt, data) {
            $('#googleDocsModal').foundation('reveal', 'close');
            addArtifact(data.artifact);
        }

        function xdtImportSuccess(evt, data) {
            $.flxweb.xdtimport.close();
            addArtifact(data.artifact);
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
        }

        function addContent(e, data) {
            addArtifact(data.artifact);
            $.flxweb.editor.AddContentDialog.close();
        }

        function clickSaveFlexbook() {
            if (save_in_progress) {
                return false;
            }

            if (checkForDuplicateTitle()) {
                return false;
            }

            save_in_progress = true;
            reload_after_save = true;
            edit_concept_after_save = null;
            saveFlexBook();
            return false;
        }

        function confirmRemoveRow() {
            var title, row;
            if (!$('#save_dialog').is(':visible')) {
                row = $(this).parents('li')[0];
                title = $(row).find('.js_artifact_title:first').text();
                $.flxweb.editor.showSaveDialog({
                    'headerText': 'CK-12 FlexBook&#174; Textbooks',
                    'contentText': 'Are you sure you want to remove ' + _.escape(title) + '?',
                    'buttons': [{
                        'text': 'Cancel',
                        'className': 'dusty-grey',
                        'onclick': $.flxweb.editor.hideSaveDialog
                    }, {
                        'text': 'Remove',
                        'className': 'turquoise',
                        'onclick': function () {
                            removeRow(row);
                            $.flxweb.editor.hideSaveDialog();
                        }
                    }]
                });
            }
            return false;
        }

        function renderPublishStatus() {
            var $publsihCheck = $('#published_status');
            $('#deep_copy').off('change.deep').on('change.deep', function () {
                $('#book_publish_status').toggleClass('hide');
            });
            if ($publsihCheck.size() && $publsihCheck.data('publish').toLowerCase() === 'true') {
                $publsihCheck.trigger('click');
            }
        }

        function createBreadcrumb() {
            var breadcrumbObject = {
                'Home': '/',
                'Library': '/my/library'
            };
            if (!Artifact.is_new(artifact)) {
                breadcrumbObject['_' + artifact.get('title')] = '/' + escape(artifact.get('perma')) + 'r' + artifact.get('latestRevision') + '/';
            }
            breadcrumbObject.Edit = '';
            Breadcrumb.init(breadcrumbObject);
        }

        function roleBasedtempalting() {
            manageCollaboration.getUserRole().done(function(role) {
                userRole = role;
                if (role === 'owner' && manageCollaboration.userIsContentAdmin()) {
                    chapterTemplate = _.template(adminChapterTemplate, null, {
                        'variable': 'data'
                    });
                } else if(role === 'collaborator') {
                    /*load latest revision*/
                    if (artifact.get('revision') !== artifact.get('latestRevision')) {
                        window.location.href = window.location.href.replace(new RegExp('/r'+ artifact.get('revision') +'/'), '/r' +artifact.get('latestRevision') + '/');
                    }
                    chapterTemplate = _.template(collabChapterTemplate, null, {
                        'variable': 'data'
                    });
                } else {
                    chapterTemplate = _.template(chapterTemplate, null, {
                        'variable': 'data'
                    });
                }
            });
        }

        function checkForTask(taskId, showModal){
            var _d = $.Deferred();
            Util.ajax({
                url: Util.getApiUrl('flx/get/status/task/' + taskId),
                cache: false,
                isPageDisable: showModal,
                isShowLoading: showModal,
                success: function (data) {
                    _d.resolve(data.response);
                },
                error: function() {
                    _d.reject('Failed');
                }
            });
            return _d.promise();
        }

        function handleFinalizationTask(showModal) {
            var regex, results, taskId = $('#finalizeBook').attr('task-id');
            if (!showModal) {
                showModal = false;
            }
            checkForTask(taskId, showModal).done(function(data) {
                $('.close', '.modal-uikit-view').trigger('click');
                if (data && data.status && data.status != 'SUCCESS' && data.status != 'FAILURE') {
                    if (showModal) {
                        ModalView.alert('We are creating new revision of the FlexBook. We will email you once it is done.');
                    }
                }else if (data && data.status && data.status === 'SUCCESS') {
                    clearInterval(taskIDTimer);
                    ModalView.alert('A new revision of the FlexBook has been created.');
                    setTimeout(function() {
                        regex = new RegExp('.*book/.*/(r.*/)');
                        results = regex.exec(window.location.href);
                        if (results && results[1]) {
                            window.location.href = window.location.href.replace(results[1], '');
                        } else {
                            window.location.reload();
                        }
                    }, 2000);
                }else if (data && data.status && data.status === 'FAILURE') {
                    clearInterval(taskIDTimer);
                    ModalView.alert('Failed to create new revision of the FlexBook. Please contact customer support.');
                } else {
                    manageCollaboration.handleFinalizeBook(artifact);
                }
            }).fail(function() {
                ModalView.alert('Please try again');
            });
        }

        function finalizationTimer() {
            taskIDTimer = setInterval(handleFinalizationTask, 10000);
        }

        function domReady() {

            renderPublishStatus();
            if (artifactID === 'new') {
                chapterTemplate = _.template(chapterTemplate, null, {
                    'variable': 'data'
                });
                //Chanpter expand/collapse
                $('.js_artifact_list_item .js-expand-toggle').live('click', chapterExpandToggle);
            } else {
                roleBasedtempalting();
                //Chanpter expand/collapse
                $('body').off('assignmentsLoaded').on('assignmentsLoaded', function() {
                    $('.js_artifact_list_item .js-expand-toggle').live('click', chapterExpandToggle);
                });
            }
            //Initialize artifact objects
            artifact = $.flxweb.editor.current_artifact;

            //fill up the artifact_cache so it has all the artifacts it needs
            artifact_cache.set(artifact.get('id'), artifact);
            cacheChildren(artifact);

            //Summary change handler
            $(document).bind($.flxweb.editor.tinymce.events.CONTENT_CHANGED, onSummaryEdit);
            //TODO: need a different event, CONTENT_CHANGED is primarily for the content.

            //Make summary editable
            $('#artifact_summary').live('click', summaryClick);

            //generic handler for all artifact saves.
            $(document).bind('flxweb.editor.flexbook.artifact_update_success', artifactSaveSuccess);
            $(document).bind('flxweb.editor.flexbook.artifact_update_error', artifactSaveError);

            initSortableRows();
            //Save button handler
            $('.js_save_artifact').click(clickSaveFlexbook);
            //Row action handlers
            $('.js_row_remove').live('click', confirmRemoveRow);
            $('#chapter_list').off('click.save', '.js_row_edit, .js-edit-section').on('click.save', '.js_row_edit, .js-edit-section', function(e) {
                rowEditClick(e);
            });
            $('.js_row_update').live('click', rowUpdateClick);
            //Other actions
            $('.js_addconcept').click(addConceptClick);
            $('#btn_gdtimport').off('click').on('click', function () {
                openGoogleDocsModal();
            });
            $('#btn_xdtimport').click(openXDTimporter);
            $('#btn_addchapter').click(addNewChapter);
            //Artifact addition
            $(document).bind('flxweb.gdtimport.success', gdtImportSuccess);
            $(document).bind('flxweb.xdtimport.success', xdtImportSuccess);
            $(document).bind('flxweb.editor.chapter.save_success', chapterSaveSuccess);
            $(document).bind('flxweb.editor.addcontent.add_artifact', addContent);
            $('#btn_addcontent').click(function () {
                $.flxweb.editor.AddContentDialog.open();
                return false;
            });
            $('.js_coverimage_edit').click(function () {
                $.flxweb.editor.CustomCoverDialog.open();
                return false;
            });

            // hide update option for non owner
            if (artifact.get('creatorID') !== $('header').data('user')) {
                isOwner = false;
                $('.js_row_edit').removeClass('hide');
                $('.js_row_update').addClass('hide');
            }
            $('.js_artifact_list_item.artifact_type_chapter').each(function () {
                if ($(this).data('islatest') !== 'True' && isOwner && $(this).data('chapterowner') === 'True') {
                    $(this).find('.editor_chapterinfo').block({
                        'message': $.flxweb.gettext('Please update the chapter before editing its contents'),
                        'css': {
                            'border': '0px',
                            'width': '80%',
                            'margin': '2% 10%',
                            'color': '#FFFFFF',
                            'background': 'transparent',
                            'text-shadow': 'none',
                            'font-weight': 'bold'
                        },
                        overlayCSS: {
                            'opacity': '0.6'
                        }
                    });
                }
            });

            $('#manageCollaborators').off('click').on('click', function() {
                $.flxweb.editor.ManageCollaboratorsDialog.open();
            });
            $('#finalizeBook').off('click.modal').on('click.modal', function() {
                var showModal = true;
                if (save_in_progress) {
                    return false;
                }
                if (isEditorDirty()) {
                    if (checkForDuplicateTitle()) {
                        return false;
                    }

                    save_before_finalize = true;
                    save_in_progress = true;
                    reload_after_save = false;
                    edit_concept_after_save = null;
                    saveFlexBook();
                    return false;
                } else {
                    var taskId = $('#finalizeBook').attr('task-id');
                    if(taskId && $.trim(taskId) != ''){
                        handleFinalizationTask(showModal);
                    }
                    else {
                         manageCollaboration.handleFinalizeBook(artifact);
                    }
                }
            });
            $(document).bind('flxweb.finalize.book', finalizationTimer);
            $('input,textarea', '#content').off('keyup.dirty').on('keyup.dirty', function() {
                artifact.dirty = true;
            });

            $(document).bind('flxweb.editor.covereditor.coverchange', coverImageChange);

            window.onbeforeunload = function () {
                if (isEditorDirty() && userRole != 'collaborator') {
                    return 'Unsaved changes will be lost. Are you sure you want to leave this page?';
                }
            };
            createBreadcrumb();
        }


        $(document).ready(domReady);
    });
