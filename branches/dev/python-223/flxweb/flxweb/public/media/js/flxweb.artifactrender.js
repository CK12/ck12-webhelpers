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
define('flxweb.artifactrender', ['jquery', 'underscore', 'backbone', 'flxweb.global'],
    function ($, _, Backbone) {
        'use strict';

        var ArtifactRenderLinkView, ArtifactRenderModule = {};
        /**
         * View for artifact download links (PDF/EPUB/Mobi)
         * initialization:
         * var arlv = new ArtifactRenderLinkView({'el': artifact_render_link });
         * where artifact_render_link is a dom element which has following data attributes:
         * data-artifactid  (ID of the artifact)
         * data-artifactrevisionid (revisionID of the artifact)
         * data-rendertype (Type of output: PDF, ePub, mobi, HTML)
         * data-rendertemplatetype (optional)
         * data-rendercache (optional)
         */
        ArtifactRenderLinkView = Backbone.View.extend({
            'artifact_id': null,
            'revision_id': null,
            'render_type': null,
            'render_template': null,
            'nocache': null,
            'href': null,
            'task_type_display_name': null,

            'events': {
                'click': 'renderlink_click'
            },

            'initialize': function () {
                this.artifact_id = this.$el.data('artifactid');
                this.revision_id = this.$el.data('artifactrevisionid');
                this.render_type = this.$el.data('rendertype');
                this.render_template = this.$el.data('rendertemplatetype');
                this.nocache = this.$el.data('rendercache') === 'nocache';
                if (this.render_type === 'mobi') {
                    this.task_type_display_name = 'Kindle Book';
                } else if (this.render_type === 'pdf') {
                    this.task_type_display_name = 'PDF';
                } else if (this.render_type === 'html') {
                    this.task_type_display_name = 'HTML';
                } else {
                    this.task_type_display_name = 'ePub';
                }
                this.href = this.$el.attr('href');
            },
            'trigger_render_task': function () {
                var self = this,
                    render_url = window.webroot_url + 'render/' + this.render_type + '/status/' + this.artifact_id + '/' + this.revision_id + '/';
                if (this.nocache) {
                    render_url += 'nocache/';
                }
                if (this.render_template) {
                    render_url += this.render_template + '/';
                }
                render_url += '?artifacturl=' + window.location.href;
                $.ajax({
                    url: render_url,
                    cache: false,
                    dataType: 'json',
                    success: function (json_status) {
                        self.render_task_success(json_status);
                    },
                    error: function (json_status) {
                        self.render_task_error(json_status);
                    }
                });
                return false;
            },
            'render_task_success': function (json_status) {
                /**
                 * Success callback for ajax task queries. Will show dialog informing user about the email notification.
                 * @param json_status: JSON response
                 */
                if (json_status.status === 'SUCCESS') {
                    window.open(json_status.userdata.downloadUri, 'downloadwindow');
                } else {
                    $.flxweb.showDialog('Thank you! The ' + this.task_type_display_name + ' you requested is being generated. We will email you when it is available for download.', {
                        'title': this.task_type_display_name + ' Notification'
                    });
                }
            },
            'render_task_error': function () {
                /**
                 * Will show dialog when error occurred while ajax task queries.
                 */
                $.flxweb.showDialog('Error generating ' + this.task_type_display_name, {
                    'title': 'Error generating ' + this.task_type_display_name
                });
            },
            'renderlink_click': function () {
                var self = this;
                if (self.href === '#') {
                    //specified rendering doesn't yet exist for current artifact and needs to be generated
                    self.trigger_render_task();
                    self.updateArtifactUserNotification(self.$el);
                    return false;
                }
                //Wait for default download action
                setTimeout(function () {
                    self.updateArtifactUserNotification(self.$el);
                }, 500);
            },

            addArtifactUserNotification: function (objectID) {
                //Artifact Revision Available Notifications for doesn't exists, create new one
                var update_user_artifact_notification_url = webroot_url + 'flx/update/artifact/usernotification/' + objectID,
                    data = {};
                data.sendEmailNotification = false;
                data.subscriberID = ads_userid;
                data.artifact_url = window.location.href.replace(window.location.hash, '');
                $.ajax({
                    url: update_user_artifact_notification_url,
                    cache: false,
                    dataType: 'json',
                    data: data,
                    success: function (status) {
                        if (status && status.responseHeader && status.responseHeader.status === 0) {
                            //console.log('Updated User Artifact Notification.....')
                        } else {
                            // console.log('Failed to Updated User Artifact Notification.....')
                        }
                    },
                    error: function () {
                        //console.log('Failed to Updated User Artifact Notification.....')
                    }
                });
            },

            checkArtifactUserNotificationByFrequency: function (options) {
                $.ajax({
                    url: options.notification_url,
                    cache: false,
                    dataType: 'json',
                    data: options.data,
                    success: function (status) {
                        if (status && status.responseHeader && status.responseHeader.status !== 0) {
                            if (options.frequency !== 'off') {
                                options.successCallback(options.objectID);
                            } else {
                                options.failureCallback(options.context, 'ondemand', options.this);
                            }
                        }
                    },
                    error: function () {
                        //options.failureCallback(options.context, 'ondemand', options.this);
                    }
                });
            },

            updateArtifactUserNotification: function (context, frequency, old_context) {
                //Check for both notifications with event type 'ARTIFACT_NEW_REVISION_AVAILABLE_WEB', frequencies off and ondemand
                var options = {};
                options.objectID = $(context).data('artifactid');
                options.context = context;
                options.data = {
                    'objectID': options.objectID,
                    'objectType': 'artifact',
                    'notificationType': 'web'
                };
                if (!frequency) {
                    options.this = this;
                    context = this;
                    frequency = 'off';
                } else {
                    context = old_context;
                }
                options.frequency = frequency;
                options.notification_url = webroot_url + 'flx/get/info/notification/ARTIFACT_NEW_REVISION_AVAILABLE_WEB/' + frequency;
                options.successCallback = context.addArtifactUserNotification;
                options.failureCallback = context.updateArtifactUserNotification;
                context.checkArtifactUserNotificationByFrequency(options);
            }
        });

        ArtifactRenderModule.ArtifactRenderLinkView = ArtifactRenderLinkView;
        return ArtifactRenderModule;
    }
);
