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
 * This file originally written by Ravi Gidwani 
 *
 * $Id$
 */
define('flxweb.publish', ['backbone', 'jquery', 'text!templates/modality.published.dialog.html', 'jquery-ui', 'flxweb.global'],
    function (Backbone, $, publishedDialog) {
        'use strict';
        var PublishArtifactView = Backbone.View.extend({
            initialize: function () {
                //exit if the element does not exist
                if ($(this.el).length === 0 ||
                    $(this.options.target).length === 0) {
                    return;
                }
                var self = this;
                this.url = $(this.el).data('url');
                $(this.el).load(this.url, function () {
                    //initialize the dialog
                    self.dialog = $.flxweb.createDialog($(self.el), {
                        'title': $(self.el).data('title'),
                        'width': 550,
                        /*'height':400,*/
                        'buttons': {
                            'Publish': function () {
                                self.trigger('flxweb.publishartifact.sendrequest');
                            },
                            'Cancel': function () {
                                $(this).dialog('close');
                            }
                        }
                    });
                });
                //add event listeners
                $(this.options.target).click(function () {
                    self.show();
                    return false;
                });
                this.bind('flxweb.publishartifact.sendrequest', this.onSendRequest);
            },
            show: function () {
                $('#publish_artifact_name').text("'" + window.title + "'");
                this.dialog.open();
                // $('#publish_request_reason').val('');
            },
            hide: function () {
                this.dialog.close();
            },
            onSendRequest: function () {
                var self = this,
                    contributionType = $('input[name=contribution_type]:radio:checked').val();
                if (contributionType === undefined || contributionType === null) {
                    $('.contribution-type .contribution-type-error').show();
                    return;
                }
                $.flxweb.showLoading();
                $.ajax({
                    type: 'POST',
                    url: '/ajax/publish/artifact/' + $(this.options.target).data('artifactrevisionid') + '/',
                    data: {
                        'website': window.location.hostname,
                        'contribution_type': contributionType
                    },
                    success: function (response) {
                        $.flxweb.hideLoading();
                        if (response.status === 'ok') {
                            //self.hide();
                            $.flxweb.notify('Your request has been sent');
                            $('#js_publish_artifact_dialog').html(publishedDialog);
                            $('.book_published').removeClass('hide');
                            $('.book_unpublished').addClass('hide');
                            if (window.js_modality_data) {
                                if (js_modality_data.domain.encodedID.split('.')[0] === 'UGC') {
                                    $('.contribute_more_link').remove();
                                } else {
                                    $('.contribute_more_link').attr('href', '/new/concept?eid=' + js_modality_data.domain.encodedID + '&returnTo=' + encodeURIComponent(window.location.href));
                                }
                                $('.view_modality_link').attr('href', webroot_url + js_modality_data.domain.branchInfo.handle.toLowerCase() + '/' + js_modality_data.domain.handle + '/?by=community');
                                $('.concept-name').text("'" + js_modality_data.domain.name + "'");
                                self.dialog = $.flxweb.createDialog($(self.el), {
                                    'title': 'Modality Published',
                                    'width': 550,
                                    'height': 300,
                                    'buttons': {
                                        'OK': function () {
                                            $(this).dialog('close');
                                        }
                                    }
                                });
                            } else {
                                $('.view_modality_link, .contribute_more_link').remove();
                                self.dialog = $.flxweb.createDialog($(self.el), {
                                    'title': 'Flexbook&#174; Textbook Published',
                                    'width': 550,
                                    'height': 190,
                                    'buttons': {
                                        'OK': function () {
                                            $(this).dialog('close');
                                        }
                                    }
                                });
                            }
                        } else {
                            $.flxweb.showDialog(response.message);
                        }
                    },
                    error: function (response) {
                        $.flxweb.hideLoading();
                        if (response.error) {
                            $.flxweb.showDialog(response.error);
                        } else {
                            $.flxweb.showDialog('There was an error sending your request. Please try again later');
                        }
                    }
                });

            }
        });

        function domReady() {
            window.publishArtifactAppView = new PublishArtifactView({
                el: $('#js_publish_artifact_dialog'),
                target: $('#js_publish_artifact_link')
            });

        }

        $(document).ready(domReady);
    });