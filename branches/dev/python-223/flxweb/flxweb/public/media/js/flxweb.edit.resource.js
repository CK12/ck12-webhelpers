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
 *
 * $Id$
 */
define('flxweb.edit.resource', ['backbone', 'jquery', 'jquery-ui', 'flxweb.global'],
    function (Backbone, $) {
        'use strict';

        var EditResourceDialog = Backbone.View.extend({
            initialize: function () {
                //exit if the element does not exist
                if ($(this.el).length === 0 || $(this.options.target).length === 0) {
                    return;
                }

                var self = this;
                self.dialog = $.flxweb.createDialog($(self.el), {
                    'title': $(self.el).data('title'),
                    'width': 550,
                    'buttons': {
                        'Save': function () {
                            if ($('#chapteredit_attachments').is(':visible')) {
                                window.resourceTarget = $('#chapteredit_attachments');
                                window.chapterResourceUpload = true;
                            } else {
                                window.resourceTarget = $('#edit_attachments');
                                window.chapterResourceUpload = false;
                            }
                            self.trigger('flxweb.resource.update');
                        },
                        'Cancel': function () {
                            self.trigger('flxweb.edit.resource.dialog.close');
                            $(this).dialog('close');
                        }
                    }
                });
                $(self.options.target).live('click', self.openEditDialog);
                self.bind('flxweb.resource.update', self.onFormSubmit);
                self.bind('flxweb.edit.resource.dialog.close', self.onCloseDialog);
                $('#res_edit_form').submit(self.onFormSubmit);

            },
            show: function () {
                this.dialog.open();
            },
            hide: function () {
                $('.js_resource_row .js_resource_public_toggle').removeClass('js_resource_processing');
                this.dialog.close();
            },

            onCloseDialog: function () {
                $('.js_resource_row .js_resource_public_toggle').removeClass('js_resource_processing');
            },

            openEditDialog: function () {
                window.editResourceDialog.trigger('flxweb.resource.edit.link.click', this);
                $('#res_edit_form').find('.error').addClass('hide');
                window.editResourceDialog.show();
                return false;
            },

            //For old resource containg slashes in resource name, take the last part of the resource name with out slashes
            getValidResourceName: function (resource_name) {
                if (resource_name === undefined || resource_name.indexOf('/') === -1) {
                    return resource_name;
                }
                var last_slash_index = resource_name.lastIndexOf('/');
                if (last_slash_index === resource_name.length - 1) {
                    resource_name = resource_name.substring(0, last_slash_index);
                }
                return resource_name.substring(resource_name.lastIndexOf('/') + 1, resource_name.length);
            },

            artifactDetailsOrEditorEditLink: function (link, makePublic) {
                var isPublic,
                    res_edit_form = $('#res_edit_form'),
                    $edit_link = $(link);
                res_edit_form.find('#res_id').val($edit_link.parents().filter('.js_resource_row').data('resource-id'));
                res_edit_form.find('#res_name').val(editResourceDialog.getValidResourceName($edit_link.parents().filter('.js_resource_row').data('resource-name')));
                res_edit_form.find('#res_desc').val($edit_link.parent().find('.js_resource_description').text());
                res_edit_form.find('#res_type').val($edit_link.parents().filter('.js_resource_row').data('resource-type')).attr('selected', true);
                res_edit_form.find('#res_external').val($edit_link.parents().filter('.js_resource_row').data('resource-external'));
                res_edit_form.find('#res_uri').val($edit_link.parents().filter('.js_resource_row').data('resource-uri'));

                isPublic = $edit_link.data('resource-public').toString();

                if (makePublic || isPublic.toLowerCase() === 'true') {
                    res_edit_form.find('#res_public').prop('checked', 'checked');
                    res_edit_form.find('#res_public').val('true');
                } else {
                    res_edit_form.find('#res_public').removeAttr('checked');
                    res_edit_form.find('#res_public').val('false');
                }
            },

            resourceDetailsEditLink: function (link) {
                var isPublic,
                    res_edit_form = $('#res_edit_form'),
                    $edit_link = $(link);
                res_edit_form.find('#res_id').val($edit_link.data('resource-id'));
                res_edit_form.find('#res_name').val(editResourceDialog.getValidResourceName($edit_link.data('resource-name')));
                res_edit_form.find('#res_external').val($edit_link.data('resource-external'));
                res_edit_form.find('#res_uri').val($edit_link.data('resource-uri'));
                res_edit_form.find('#res_desc').val($edit_link.parent().find('.js_resource_description').text());
                res_edit_form.find('#res_type').val($edit_link.data('resource-type')).attr('selected', true);
                res_edit_form.find('.js_page_url_template').val($edit_link.parent().find('.js_page_url_template').text());
                isPublic = $edit_link.data('resource-public').toString();

                if (isPublic.toLowerCase() === 'true') {
                    res_edit_form.find('#res_public').prop('checked', 'checked');
                    res_edit_form.find('#res_public').val('true');
                } else {
                    res_edit_form.find('#res_public').removeAttr('checked');
                    res_edit_form.find('#res_public').val('false');
                }
            },

            interEditResourceClick: function (link, makePublic) {
                window.editResourceDialog.artifactDetailsOrEditorEditLink(link, makePublic);
                $('#res_edit_form').find('.error').addClass('hide');
                window.editResourceDialog.show();
                return false;
            },

            onFormSubmit: function () {
                var publish_chkbox, res_edit_form = $('#res_edit_form');
                if (window.editResourceDialog.validateForm(res_edit_form)) {
                    publish_chkbox = res_edit_form.find('#res_public');
                    publish_chkbox.val(publish_chkbox.prop('checked'));
                    res_edit_form.find('#res_handle').val(res_edit_form.find('#res_name').val());
                    $.flxweb.showLoading();
                    $.ajax({
                        'url': $.flxweb.settings.webroot_url + res_edit_form.attr('action'),
                        'type': res_edit_form.attr('method'),
                        'data': res_edit_form.serialize(),
                        'dataType': 'json',
                        'success': window.editResourceDialog.onUpdateSuccess,
                        'error': window.editResourceDialog.onUpdateError
                    });
                }
                return false;
            },

            onUpdateSuccess: function (data) {
                $.flxweb.hideLoading();
                window.editResourceDialog.trigger('flxweb.resource.update.onsuccess', data);
            },

            updateDetailsOrEditorResourceRow: function (data) {
                if (data.status === 'error') {
                    window.editResourceDialog.handleError(data);
                } else {
                    $.flxweb.loadData(data);
                    $.flxweb.notify('Successfully updated resource "' + data.name + '"');
                    window.editResourceDialog.hide();
                }
            },

            updateLibraryResourceRow: function (data) {
                var resource_id, resource_name, resource_desc, resource_type, res_isPublic, realm, resourceURL,
                    resource = data;
                if (resource.status === 'error') {
                    window.editResourceDialog.handleError(data);
                } else {
                    resource_id = resource.id;
                    resource_name = resource.name;
                    resource_desc = resource.description;
                    resource_type = resource.type;
                    res_isPublic = Boolean(resource.isPublic).toString();
                    realm = (resource.realm && resource.realm.length !== 0) ? resource.realm + '/' : '';
                    resourceURL = $.flxweb.settings.webroot_url + realm + 'resource/' + resource.type + '/' + encodeURIComponent(resource.handle);
                    $('.js_resource_row').each(function () {
                        if ($(this).data('resource-id') === resource_id) {

                            $(this).find('.js_resource_description').text(resource_desc);
                            $(this).find('.libraryartifacttitle a').text(resource_name);
                            $(this).find('.libraryartifacttitle a').attr('href', resourceURL);

                            $(this).data({
                                'resource-name': resource_name,
                                'resource-type': resource_type
                            }).attr({
                                'data-resource-name': resource_name,
                                'data-resource-type': resource_type
                            });

                            $(this).find('.actions .js_resource_edit').each(function () {
                                $(this).data('resource-public', res_isPublic).attr('data-resource-public', res_isPublic);
                            });

                        }
                    });
                    $.flxweb.notify('Successfully updated resource ' + data.name);
                    window.editResourceDialog.hide();
                }
            },

            reloadResourceDetailsPage: function (data) {
                if (data.status === 'error') {
                    window.editResourceDialog.handleError(data);
                } else {
                    var realm = (data.realm && data.realm.length !== 0) ? data.realm + '/' : '';
                    window.location = $.flxweb.settings.webroot_url + realm + 'resource/' + data.type + '/' + encodeURIComponent(data.handle);
                }
            },
            onUpdateError: function (data) {
                $.flxweb.hideLoading();
                this.trigger('flxweb.resource.update.onerror', [data]);
            },

            validateForm: function (res_edit_form) {
                res_edit_form.find('.error').addClass('hide');
                var isValidated = true,
                    resTitle = $.trim(res_edit_form.find('#res_name').val()),
                    publish_chkbox = res_edit_form.find('#res_public');

                if (resTitle === '') {
                    window.editResourceDialog.showTitleErrorMsg(res_edit_form);
                    isValidated = false;
                } else if (resTitle.indexOf('/') !== -1) {
                    window.editResourceDialog.showTitleErrorMsg(res_edit_form);
                    isValidated = false;
                } else if (resTitle.length > 100) {
                    window.editResourceDialog.showTitleErrorMsg(res_edit_form);
                    isValidated = false;
                }
                if ((publish_chkbox.attr('checked') && publish_chkbox.attr('checked') === 'checked') && $.trim(res_edit_form.find('#res_desc').val()) === '') {
                    res_edit_form.find('.js_res_desc_msg').removeClass('hide');
                    isValidated = false;
                }
                return isValidated;
            },

            showTitleErrorMsg: function (res_edit_form) {
                res_edit_form.find('.js_res_name_msg').removeClass('hide');
            },

            handleError: function (data) {
                var error_msg = data.message;
                if (data.data.resource) {
                    error_msg = 'Failed to update ' + data.data.resource.name + '<br />' + error_msg;
                }
                $.flxweb.showDialog(error_msg, {
                    'title': 'Error updating file',
                    'close': $.noop
                });
            }
        });

        function domReady() {
            var editResourceDialog = new EditResourceDialog({
                el: $('#js_edit_resource'),
                target: $('.js_resource_row .js_resource_edit')
            });
            editResourceDialog.bind('flxweb.resource.edit.link.click', editResourceDialog.artifactDetailsOrEditorEditLink);
            window.editResourceDialog = editResourceDialog;
        }
        $(document).ready(domReady);
    });