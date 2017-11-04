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
define('flxweb.attachments', ['jquery',
        'common/views/modal.view',
        'jquery-ui',
        'jquery.iframe-transport',
        'jquery.fileupload',
        'flxweb.global',
        'flxweb.settings'
    ],
    function ($, ModalView) {

        'use strict';

        var resource_row_template = null;

        function _removeResourceRow(row) {
            //Remove resource row
            row.hide(500, function () {
                $(this).remove();
                if ($('#chapteredit_attachments').is(':visible')) {
                    window.resourceTarget = $('#chapteredit_attachments');
                    window.chapterResourceUpload = true;
                } else {
                    window.resourceTarget = $('#edit_attachments');
                    window.chapterResourceUpload = false;
                }
                $.flxweb.events.triggerEvent(document, 'flxweb.attachments.changed');
                if (window.resourceTarget.find('.resources_container .artifact_attachment_container .resource_row').length === 0) {
                    if (window.resourceTarget.find('.js_msg_no_resources').length) {
                        $('.js_msg_no_resources').removeClass('hide');
                    } else {
                        window.resourceTarget.find('.js_resource_container').html('<div class="js_msg_no_resources">Currently there are no resources to be displayed.</div>');
                    }
                }
            });
        }

        function detatch(evt, deleteElm) {
            var data,
                artifact_id = $(deleteElm).data('artifact-id'),
                artifact_revision_id = $(deleteElm).data('artifact-revision-id'),
                resource_id = $(deleteElm).data('resource-id'),
                resource_revision_id = $(deleteElm).data('resource-revision-id'),
                detach_url = $.flxweb.settings.webroot_url + '/ajax/resource/detach/';

            if (artifact_id.length !== 0 || artifact_revision_id.length !== 0) {
                detach_url += artifact_id + '/' + artifact_revision_id + '/';
                detach_url += resource_id + '/' + resource_revision_id + '/';
            } else {
                //Remove attachments in artifact data 
                data = {
                    'resource_id': resource_id,
                    'resource_revision_id': resource_revision_id
                };
                $.flxweb.events.triggerEvent(document, 'flxweb.attachments.remove_attachment', data);
                //If attached file is not associated with any artifact, Just remove it
                detach_url = $.flxweb.settings.webroot_url + 'ajax/resource/delete/';
                detach_url += resource_id + '/';
            }
            $.ajax({
                url: detach_url,
                success: function () {
                    _removeResourceRow($(deleteElm).parents().filter('.js_resource_row'));
                }
            });

            return false;
        }

        //Bug 8230 : Resource remove confirmation. 
        function confirmRemoveRow() {
            var resource_row, self = $(this);

            resource_row = self.parents().filter('.js_resource_row');

            $.flxweb.showDialog('Are you sure you want to remove "' + $(resource_row).data('resource-name') + '"? </br> Note that It will also be deleted from all the previous revisions.', {
                'buttons': [{
                    'text': 'Remove',
                    'click': function (evt) {
                        if ($.flxweb.editor && artifact_json && artifact_json.artifactType && artifact_json.artifactType.indexOf('book') === -1) {
                            _removeResourceRow(resource_row);
                        } else {
                            detatch(evt, self);
                        }
                        $(this).dialog('close');
                    }
                }, {
                    'text': 'Cancel',
                    'click': function () {
                        $(this).dialog('close');
                    }
                }]
            });
            return false;
        }

        function rowHoverIn() {
            $(this).find('.js_resource_public_toggle').removeClass('hide');
        }

        function rowHoverOut() {
            $(this).find('.js_resource_public_toggle').addClass('hide');
        }

        function validateFileType(filename) {
            var filetype_re,
                filetype_re_str = '(.doc|dot|docx|dotx,|odt|ott|txt|' +
                'xlsx|xltx|xls|xlt|ods|ots|' +
                'ppt|pps|pot|pptx|potx|ppsx|odp|otp|swf|' +
                'pdf|zip|tar|tar.gz|' +
                'epub|mobi|' +
                'jpg|jpeg|png|bmp|' +
                'cdf|flv|' +
                'key|keynote|pages|numbers|' +
                'mp4|mp3)$';

            filetype_re = new RegExp(filetype_re_str, 'i');
            return filetype_re.test(filename);
        }

        function validateFileSize(uploadfile) {
            if (uploadfile.size > parseInt($.flxweb.settings.attachment_max_upload_size, 10)) {
                return false;
            }
            return true;
        }

        function fileUploadAdd(e, data) {
            var row, row_id, filename = data.files[0].name;
            if ($(e.target).parents('#chapteredit_attachments').length) {
                window.chapterResourceUpload = true;
            } else {
                window.chapterResourceUpload = false;
            }
            if (validateFileType(filename)) {
                if (validateFileSize(data.files[0])) {
                    row = $(resource_row_template);
                    row_id = 'resource_row_' + Number(new Date());
                    data.row_id = row_id;
                    row.attr('id', row_id).find('.js_resource_link').text(filename);
                    $(e.target).parents('.resource_actions').siblings().find('.js_resource_container').prepend(row);
                    data.submit();
                } else {
                    $.flxweb.showDialog('Failed to upload "' + filename + '" <br > Uploaded file is too large. Maximum size allowed is ' +
                        parseInt($.flxweb.settings.attachment_max_upload_size, 10) / (1024 * 1024) + ' MB', {
                            'title': 'Error uploading file'
                        });
                }
            } else {
                $.flxweb.showDialog('Files with extension .' + filename.split('.').pop() + ' are not supported as attachments.', {
                    'title': 'Invalid Extension'
                });
            }
        }

        function fileUploadSuccess(data, resource, row) {
            var art_id = '',
                art_rev_id = '',
                res_id = resource.id,
                res_rev_id = resource.resourceRevisionID,
                res_name = resource.name,
                res_description = resource.description,
                res_type = resource.type,
                res_isPublic = resource.isPublic,
                resource_details_url = '';
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.success', {
                'resource': resource,
                'fileupload_data': data
            });
            if (resource.hasOwnProperty('associatedArtifactID') && resource.hasOwnProperty('associatedArtifactRevisionID')) {
                art_id = resource.associatedArtifactID;
                art_rev_id = resource.associatedArtifactRevisionID;
            }
            resource_details_url = $.flxweb.settings.webroot_url;
            if (resource.realm && resource.realm.length !== 0) {
                resource_details_url += resource.realm + '/';
            }
            resource_details_url += 'resource/' + resource.type + '/' + resource.handle;

            row.attr({
                'data-resource-id': res_id,
                'data-resource-name': res_name,
                'data-resource-type': res_type
            }).data({
                'resource-id': res_id,
                'resource-name': res_name,
                'resource-type': res_type
            });

            row.find('.loading').remove();
            row.find('.actions').removeClass('hide');
            row.find('.js_resource_link').attr('href', resource_details_url);

            row.find('.actions .js_resource_remove').attr({
                'data-resource-id': res_id,
                'data-resource-revision-id': res_rev_id,
                'data-artifact-id': art_id,
                'data-artifact-revision-id': art_rev_id
            });
            row.find('.actions .js_resource_edit').data('resource-public', res_isPublic).attr('data-resource-public', res_isPublic);
            // put description in hidden div
            row.find('.actions .js_resource_description').html(res_description);
            // if there's a message for no resources displayed;
            $('.js_msg_no_resources').addClass('hide');
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.changed');
        }

        function fileUploadDone(e, data) {
            var filename, error_msg, attachedToCurrentArtifact = false,
                row = $('#' + data.row_id),
                resource = data.result;
            window.resourceTarget = $(e.target).parents('.resourceview');

            if (resource.status === 'error') {
                //Bug 17494: if resource already exists, means resource already uploaded by user, so use existing resource
                if (resource.hasOwnProperty('data') && 'RESOURCE_ALREADY_EXISTS' === resource.data.reason && resource.data.hasOwnProperty('resource')) {
                    $(e.target).parents('.resource_actions').siblings().find('.js_resource_container').find('.js_resource_link:not(:first)').each(function() {
                        if ($.trim($(this).text()) === resource.data.resource.name) {
                            attachedToCurrentArtifact = true;
                            return false;
                        }
                    });
                    if (attachedToCurrentArtifact) {
                        ModalView.alert(resource.message);
                        row.remove();
                    } else {
                        fileUploadSuccess(data, resource.data.resource, row);
                    }
                } else {
                    filename = data.files[0].name;
                    row.find('.loading').remove();
                    row.find('.failed').removeClass('hide');
                    error_msg = 'Failed to upload "' + filename + '"<br />' + resource.message;
                    row.find('.failed a').data('failure-message', error_msg).attr('data-failure-message', error_msg);
                }
            } else {
                fileUploadSuccess(data, resource, row);
            }

        }

        function fileUploadProgress(e, data) {
            var row = $('#' + data.row_id),
                progress = parseInt(data.loaded / data.total * 100, 10);
            if (row.length) {
                row.find('.loading .progressbar').css({
                    'width': progress + '%'
                });
            }
            $.flxweb.events.triggerEvent(document, 'flxweb.attachments.progress', {
                'progress': progress,
                'fileupload_data': data
            });
        }

        function handleError(data) {
            var error_msg = data.message;
            if (data.data.resource) {
                error_msg = 'Failed to update "' + data.data.resource.name + '"<br />' + error_msg;
            }
            $.flxweb.showDialog(error_msg, {
                'title': 'Error updating permissions',
                'close': function () {
                    $('.js_resource_row .js_resource_public_toggle').removeClass('js_resource_processing');
                }
            });
        }

        function loadData(data) {
            var resourceURL,
                resource_id = data.id,
                resource_name = data.name,
                resource_desc = data.description,
                resource_type = data.type,
                res_isPublic = data.isPublic,
                row_toggle_link = null;

            /*var realm = (data.realm && data.realm.length) ? data.realm + '/' : '';
            var resourceURL = $.flxweb.settings.webroot_url + realm + 'resource/'+data.type+'/'+encodeURIComponent(data.handle);*/

            resourceURL = data.type === 'video' || data.type === 'interactive' ? '' : data.uri;

            $('.js_resource_row').each(function () {
                if ($(this).data('resource-id') === resource_id) {
                    row_toggle_link = $(this).find('.js_resource_public_toggle');
                    if (res_isPublic) {
                        $(this).find('.js_publishstate_icon').addClass('hide');
                        $(this).find('.js_noimage').removeClass('hide');
                        row_toggle_link.attr('data-ispublic', 'true').data('ispublic', 'true').removeClass('js_resource_processing').text(row_toggle_link.data('txtmakeprivate'));
                    } else {
                        $(this).find('.js_publishstate_icon').removeClass('hide');
                        $(this).find('.js_noimage').addClass('hide');
                        row_toggle_link.attr('data-ispublic', 'false').data('ispublic', 'false').removeClass('js_resource_processing').text(row_toggle_link.data('txtmakepublic'));
                    }
                    $(this).find('.js_resource_description').text(resource_desc);
                    $(this).data({
                        'resource-name': resource_name,
                        'resource-type': resource_type
                    }).attr({
                        'data-resource-name': resource_name,
                        'data-resource-type': resource_type
                    });

                    $(this).find('.attachment_icon').removeClass().addClass('attachment_icon imgwrap type_' + resource_type);

                    $(this).find('.actions .js_resource_edit').data('resource-public', res_isPublic).attr('data-resource-public', res_isPublic);

                    $(this).find('.js_resource_link').prop('href', resourceURL).text(resource_name);
                    $(this).effect('pulsate');
                }
            });

        }

        function resourceUpdateSuccess(data) {
            if (data.status === 'error') {
                handleError(data);
            } else {
                loadData(data);
                $.flxweb.notify('Successfully updated permissions for ' + data.name);
            }
        }

        function resourceUpdateError() {
            $.flxweb.showDialog('Failed to update permissions for the resource.');
            $('.js_resource_processing').removeClass('js_resource_processing');
        }

        function updateResource(resource_obj) {
            $.ajax({
                'url': $.flxweb.settings.webroot_url + 'ajax/resource/upload/',
                'type': 'POST',
                'data': resource_obj,
                'success': resourceUpdateSuccess,
                'error': resourceUpdateError,
                'dataType': 'json'
            });
        }

        function notifyAttachmentSuccess(e, data) {
            $.flxweb.notify('"' + data.resource.name + '" was successfully uploaded.');
        }

        function toggleResourcePublic() {
            var data, resource_description, is_public, $editlink,
                $row_toggle_link = $(this);

            resource_description = $($row_toggle_link).parent().find('.js_resource_description').text();
            is_public = $($row_toggle_link).data('ispublic').toString();
            $editlink = $($row_toggle_link).parent().find('.js_resource_edit');

            is_public = is_public === '1' || is_public.toLowerCase() === 'true';
            data = {
                'resourceid': $($row_toggle_link).parents().filter('.js_resource_row').data('resource-id'),
                'resource_name': $($row_toggle_link).parents().filter('.js_resource_row').data('resource-name'),
                'isPublic': !is_public,
                'isAttachment': true,
                'desc': resource_description
            };
            $($row_toggle_link).addClass('js_resource_processing');
            if ($.trim(resource_description) === '' && !is_public) {
                $.flxweb.showDialog('Please provide more information about the resource before making it public.', {
                    'title': 'Details Required',
                    'width': 500,
                    'buttons': {
                        'Edit Resource': function () {
                            window.editResourceDialog.trigger('flxweb.resource.make.public.required', $editlink, true);
                            $(this).dialog('close');
                        },
                        'Cancel': function () {
                            $row_toggle_link.removeClass('js_resource_processing');
                            $(this).dialog('close');
                        }
                    }
                });
            } else {
                updateResource(data);
            }
            return false;
        }

        function onUploadFailedClick() {
            var row = $(this).parents().filter('.js_resource_row');
            $.flxweb.showDialog($(this).data('failure-message'), {
                'title': 'Error uploading file',
                'close': function () {
                    //row.hide(500, function(){ $(this).remove(); });
                },
                'buttons': {
                    'Remove': function () {
                        row.hide(500, function () {
                            $(this).remove();
                        });
                        $(this).dialog('close');
                    },
                    'Close': function () {
                        $(this).dialog('close');
                    }
                }
            });
            return false;
        }

        function onResourceFailedRemoveClick() {
            $(this).parents().filter('.js_resource_row').hide(500, function () {
                $(this).remove();
            });
            return false;
        }

        function resourcePopup() {
            //get the parent row div so that we can get the
            //resource details from data attributes
            var eoDiv, width, height, embedHTML, src,
                resource_row = $(this).parents('.js_resource_row');
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

            $.flxweb.showDialog(embedHTML, {
                'title': resource_row.data('resource-name'),
                'width': width,
                'height': height,
                'buttons': {}
            });
        }
        
        function fileupload() {
            $('#resource_upload, .resource_upload').fileupload({
                'dataType': 'json',
                'singleFileUploads': true,
                'add': fileUploadAdd,
                'done': fileUploadDone,
                'progress': fileUploadProgress
            });
        }


        function domready() {
            fileupload();
            $(document).bind('flxweb.chapter.editor.open', function() {
                fileupload();
            });
            $('.js_resource_row').live('mouseover', rowHoverIn);
            $('.js_resource_row').live('mouseout', rowHoverOut);
            $('.js_resource_row .js_resource_remove').live('click', confirmRemoveRow);
            resource_row_template = $('#ck12_template_resource_row').html();

            $.flxweb.updateResource = updateResource;
            $.flxweb.loadData = loadData;
            $(document).bind('flxweb.attachments.success', notifyAttachmentSuccess);
            $('.js_resource_public_toggle').live('click', toggleResourcePublic);
            $('.js_resource_row .js_row_actions_failed .js_failed_link ').live('click', onUploadFailedClick);
            $('.js_resource_row .js_row_actions_failed .js_failed_remove ').live('click', onResourceFailedRemoveClick);
            // add the resource popup for interactive resources e.g video/interactive
            $('.js_resource_popup').live('click', resourcePopup);
        }

        $(document).ready(domready);
    });