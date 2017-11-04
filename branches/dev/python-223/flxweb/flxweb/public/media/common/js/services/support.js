define(['jquery',
        'common/utils/utils',
        'common/views/modal.view',
        'common/utils/base64'
    ],
    function ($, Util,ModalView,base64) {
        'use strict';

        function SupportService() {
            var supportMailRecipients = 'support@ck12.org';
            var default_senderName = 'CK12 Support';
            var default_senderEmail = 'noreply@ck12.org';

            this.contactSupport = contactSupport;
            var _save_dialog = null;
            var emailModalClosed = true;

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

            function sendSupportMail(error) {
                if (!(error && error.hasOwnProperty('subject') && error.hasOwnProperty('body'))) {
                    return $.Deferred().reject({
                        'error': 'Invalid error Object.'
                    });
                }

                error.body.userEmail = error.body.userEmail || '';
                var params = {};

                params.receivers = supportMailRecipients;
                params.subject = error.subject || '';
                params.body = JSON.stringify(error.body || '');
                params.senderName = error.senderName || default_senderName;
                params.senderEmail = error.senderEmail || default_senderEmail;
                params.purpose = 'errorReport';

                params = base64.encode(JSON.stringify(params));
                params = ('data=' + encodeURIComponent(params)).replace(/%20/g, '+').replace(/\./g,'=');
                return Util.ajax({
                    url: Util.getApiUrl('flx/send/email'),
                    method: 'POST',
                    data: params
                });

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

            function hideSaveDialog() {
                if (_save_dialog) {
                    _save_dialog.close();
                }
            }

            function showSaveDialog(options) {
                options = $.extend({
                    'showOnOpen': true,
                    'headerText': 'Contacting Support',
                    'contentText': '',
                    'modalID': 'save_dialog',
                    'width': 400
                }, options);

                if (options.loading) {
                    options.headerText = '<div><img src="/media/common/images/icon_loading.gif" alt="loading" class="modal-loading"></div><div>' + options.headerText + '</div>';
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

        }

        return new SupportService();

    });
