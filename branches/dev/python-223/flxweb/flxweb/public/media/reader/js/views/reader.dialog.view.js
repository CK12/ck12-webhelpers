define(['jquery', 'backbone', 'underscore', 'fn/foundation.min', 'reader/templates/reader.tmpl', 'common/services/email.services'],
    function ($, Backbone, _, foundation, TMPL, EmailServices) {
        'use strict';
        var ReaderDialogView = Backbone.View.extend({
            el: 'body',
            events: {
                'click .reader-dialog-close': 'closeModal',
                'click .emailpanel-sendlink': 'sendLink',
                'blur .emailpanel-email-input': 'validateEmail',
                'keypress .emailpanel-email-input': 'resetError'
            },
            initialize: function (options) {
                this.data = options.data;
                _.bindAll(this, 'render', 'sendLink');
                this.render();
            },
            myTmpl: _.template(TMPL.READER_DIALOG),
            render: function () {
                var tmpl = this.myTmpl({
                    'data': this.data
                });
                this.$el.append(tmpl);
                this.setElement($('#readerDialogModal'));
                return this;
            },
            reset: function () {
                this.$el.find('.reader-dialog-rightpanel-successpanel').addClass('hide');
                this.$el.find('.reader-dialog-rightpanel-emailpanel').removeClass('hide');
                this.$el.find('.tooltip-left').addClass('hide');
                this.$el.find('.emailpanel-email-input').val('');
            },
            revealModal: function () {
                this.reset();
                $('#readerDialogModal').foundation('reveal', 'open');
            },
            closeModal: function () {
                $('#readerDialogModal').foundation('reveal', 'close');
            },
            resetError: function () {
                this.toggleError(true);
            },
            toggleError: function (isValid) {
                if (isValid) {
                    //hide any previous validation errors
                    this.$el.find('.tooltip-left').addClass('hide');
                    this.$el.find('.reader-dialog-rightpanel-emailpanel-email .icon-notification').addClass('hide');
                    this.$el.find('.reader-dialog-rightpanel-emailpanel-email .input').removeClass('alert');
                } else {
                    //show validation errors
                    this.$el.find('.tooltip-left').removeClass('hide');
                    this.$el.find('.reader-dialog-rightpanel-emailpanel-email .icon-notification').removeClass('hide');
                    this.$el.find('.reader-dialog-rightpanel-emailpanel-email .input').addClass('alert');
                }
            },
            validateEmail: function () {
                var email = this.$el.find('.emailpanel-email-input').val();
                var isValid = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email);
                this.toggleError(isValid);
                return isValid;
            },
            sendLink: function () {
                if (this.validateEmail()) {
                    //make the call
                    var email = this.$el.find('.emailpanel-email-input').val();
                    var self = this;
                    EmailServices.sendTemplateEmail(email, 'app_link:fb').done(function () {
                        //show the success
                        self.$el.find('.reader-dialog-rightpanel-successpanel').removeClass('hide');
                        self.$el.find('.reader-dialog-rightpanel-emailpanel').addClass('hide');
                        //fire ADS
                        if (window.dexterjs) {
                            var payload = {
                                'desc': 'reader_web_email_sent',
                                'referrer':'reader_dialog',
                                'email': email,
                                'artifactRevisionID': self.data.artifactRevisionID
                            };
                            window.dexterjs.logEvent('FBS_USER_ACTION', payload);
                        }
                    }).fail(function () {
                        alert('Sorry, sending the email failed. Please try again.');
                    });
                }
            }
        });
        return ReaderDialogView;
    });
