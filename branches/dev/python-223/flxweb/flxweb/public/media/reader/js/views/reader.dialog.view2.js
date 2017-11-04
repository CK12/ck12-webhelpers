define(['jquery', 'backbone', 'underscore', 'fn/foundation.min', 'reader/templates/reader.tmpl', 'common/services/email.services', 'common/utils/user'],
    function ($, Backbone, _, foundation, TMPL, EmailServices, User) {
        'use strict';
        var ReaderDialogView = Backbone.View.extend({
            el: 'body',
            events: {
                'click .reader-dialog-close': 'closeModal',
                'click .emailpanel-notifyme': 'notifyMe',
                'click .emailpanel-signup': 'signup'
            },
            initialize: function (options) {
                this.data = options.data;
                this.user = User.getUser();
                _.bindAll(this, 'render');
                this.render();
            },
            myTmpl: _.template(TMPL.READER_DIALOG2),
            render: function () {
                var that = this;
                this.user.done(function(userInfo){
                    that.userEmail = userInfo.userInfoDetail.email;
                    var tmpl = that.myTmpl({
                        'data': that.data,
                        'isLoggedIn': userInfo.isLoggedIn()
                    });
                    that.$el.append(tmpl);
                    that.setElement($('#readerDialogModal'));
                    return that;
                });
            },
            reset: function () {
                this.$el.find('.reader-dialog-hint').removeClass('hide');
                this.$el.find('.emailpanel-notifyme').removeClass('hide');
                this.$el.find('.reader-dialog-success-message').addClass('hide');
            },
            revealModal: function () {
                this.reset();
                $('#readerDialogModal').foundation('reveal', 'open');
            },
            closeModal: function () {
                $('#readerDialogModal').foundation('reveal', 'close');
            },
            notifyMe: function () {
                this.$el.find('.reader-dialog-hint').addClass('hide');
                this.$el.find('.emailpanel-notifyme').addClass('hide');
                this.$el.find('.reader-dialog-success-message').removeClass('hide');
            },
            signup: function() {
                window.location.hash='showDialog';
                require(['common/views/login.popup.view'], function(loginPopup){
                    loginPopup.showLoginDialogue();
                });
            }
        });
        return ReaderDialogView;
    });
