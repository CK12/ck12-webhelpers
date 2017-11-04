/**
 * Services for sending emails using flx email APIs
 **/
define(['jquery',
    'underscore',
    'common/utils/utils',
    'common/utils/base64'
], function ($, _, utils, Base64) {
    'use strict';

    var EMAIL_POST_API = utils.getApiUrl('flx/send/email', true);
    //specific key used by server side for emails
    Base64 = Base64.newInstance('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=');

    var EmailServices = {
        /**
        This function allows sending emails based on server side templates.
        The purpose parameter will be mapped to email templates on server side.
        Refer /flx/send/email API for types of templates supported
        **/
        sendTemplateEmail: function (recipientEmails, purpose) {
            var emailDataJSON = {
                'receivers': recipientEmails,
                'purpose': purpose
            };
            return EmailServices._makeCall(emailDataJSON);
        },

        /**
        This function allows sending customized emails based passed parameters.
        The purpose parameter will be mapped to email templates on server side.
        Refer /flx/send/email API for types of templates supported
        **/
        send: function (recipientEmails, subject, body, senderName, senderEmail, purpose) {
            var emailDataJSON = {
                'receivers': recipientEmails,
                'subject': subject,
                'body': body,
                'senderName': senderName,
                'senderEmail': senderEmail,
                'purpose': purpose
            };
            return EmailServices._makeCall(emailDataJSON);
        },

        _makeCall: function (emailDataJSON) {
            var _d = $.Deferred();
            var encodedData = Base64.encode(JSON.stringify(emailDataJSON));
            var emailData = ('data=' + encodeURIComponent(encodedData)).replace(/%20/g, '+');
            $.ajax({
                type: 'POST',
                url: EMAIL_POST_API,
                dataType: 'json',
                contentType: 'application/x-www-form-urlencoded',
                xhrFields: {
                    withCredentials: true
                },
                data: emailData
            }).done(function (emailResponse) {
                if (emailResponse.response.hasOwnProperty('message')) {
                    if (emailResponse.responseHeader.status === 10001) {
                        //log email quota to ADS
                        if (window.dexterjs) {
                            //var payload = JSON.parse(JSON.stringify(options.sharePayload));
                            //logShareAds("fbs_share_email_quota_exceeded", "email");
                            //window.dexterjs.logEvent(eventType, payload);
                        }
                    }
                    _d.reject();
                } else {
                    _d.resolve();
                }
            }).fail(function () {
                _d.reject();
            });

            return _d.promise();
        }
    };

    return EmailServices;
});
