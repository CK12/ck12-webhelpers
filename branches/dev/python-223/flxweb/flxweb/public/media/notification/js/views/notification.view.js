define([
    'jquery',
    'underscore',
    'backbone',
    'notification/models/notification.models',
    'notification/templates/notification.templates',
    'notification/services/notification.services'
], function ($, _, Backbone, NM, NT, NS) {
    'use strict';
    var NotificationCountManager = NM.NotificationCountManager,
        NotificationCollection = NM.NotificationCollection,
        tmpl_notification_main = NT.NOTIFICATION_MAIN,
        tmpl_notification_item = NT.NOTIFICATION_ITEM;


    var InAppNotificationIconView = Backbone.View.extend({
        events: {
            'click': 'onClick'
        },
        initialize: function () {
            $('body').off('click.drop').on('click.drop', function () {
                setTimeout(function () {
                    if ($('#notification_container').hasClass('open')) {
                        $('#notification_nav').children('a').children('i').addClass('notification_open');
                    } else {
                        $('#notification_nav').children('a').children('i').removeClass('notification_open');
                    }
                }, 0);
            });
            this.hideCount();
        },
        hideCount: function () {
            this.$('.notification-count').addClass('hide');
        },
        showCount: function () {
            this.$('.notification-count').removeClass('hide');
        },
        setCount: function (count) {
            if (count && !isNaN(count)) {
                this.$('.notification-count').text(count);
                this.showCount();
            } else {
                this.$('.notification-count').text('');
                this.hideCount();
            }
        },
        onClick: function (e) {
            var right = $(window).width() - $('#notification_nav').offset().left;
            setTimeout(function () {
                if (right < 430) {
                    $('#notification_container').addClass('left-auto').css('right', '-webkit-calc(100% - ' + right + 'px)').css('right', 'calc(100% - ' + right + 'px)');
                } else {
                    $('#notification_container').removeClass('left-auto');
                }
                if ($('#notification_container').hasClass('open')) {
                    $(e.target).addClass('notification_open');
                } else {
                    $(e.target).removeClass('notification_open');
                }
            }, 0);
        }
    });

    var NotificationItemView = Backbone.View.extend({
        'events': {
            'click': 'onclick',
            'click .notification-dismiss-wrapper': 'dismissNotification',
            'click .js-resend-email-notify': 'sendVerificationMail'
        },
        'template': _.template(tmpl_notification_item, null, {
            'variable': 'data'
        }),
        'tagName': 'li',
        initialize: function () {
            // _.bindAll(this, 'onClick', 'dismissNotification');
        },
        render: function () {
            try {
                var data = this.model.toJSON();
                return this.$el.append(this.template(data));
            } catch (e) {
                console.log("Error rendering event notification: " + e);
                return; 
            }
        },
        onclick: function () {
            var action_url = this.model.getURL();
            if (action_url) {
                if (this.model.isNewWindow()) {
                    window.open(action_url);
                } else {
                    window.location.href = action_url;
                }
            }
            return false;
        },
        dismissNotification: function () {
            this.trigger('dismiss', this);
            if (window._ck12) {
	            var payload = {
	                'memberID': $( "header" ).attr( "data-user" ),
	                'action_type': "bell",
	                'action_name':"dismiss",
	                'screen_name': window.location.href,
	                'notificationType': this.model.get('typeName')
	            };
	            _ck12.logEvent('FBS_ACTION', payload);
	        }
            return false;
        },
        checkForMailSent: function (result) {
            if ('error' !== result) {
                $('.js-resend-email-notify').addClass('hide-important').next().removeClass('hide');
            } else {
                alert('Sorry, we could not resend the verification mail right now. Please try again after some time.');
            }
        },
        sendVerificationMail: function () {
            NS.sendVerificationMail(this.checkForMailSent);
        }
    });

    var InAppNotificationPanelView = Backbone.View.extend({
        'events': {
            'scroll #notifications_list': 'checkForMore'
        },
        'template': tmpl_notification_main,
        initialize: function () {
            _.bindAll(this, 'checkForMore', 'showLoading', 'hideLoading', 'render', 'addOneNotification', 'onNotificationAdd', 'onNotificationRemove', 'fetchMore');
            this.$list = null;
            this.notificationItems = [];
            this.collection.on('add', this.onNotificationAdd, this);
            this.collection.on('remove', this.onNotificationRemove, this);

            this.showLoading();
        },
        render: function () {
            this.$el.append(this.template);
            this.$list = this.$el.find('#notifications_list');
            this.$list.on('scroll', this.checkForMore);
            return this.$el;
        },
        getNoficationProgressRingColor: function (notification){
            if (notification.get('typeName') == 'CONCEPT_PRACTICE_INCOMPLETE_WEB'){
                var percentComplete = notification.getProfilePercentComplete();
                if(percentComplete > 84.9){
                    return "#b8d543";
                }else if(percentComplete < 65){
                    return "#ff6633";
                }else{
                    return "gold";
                }
            }
            return null;
        },
        addOneNotification: function (notification) {
            var notificationItem = new NotificationItemView({
                'model': notification
            });
            notificationItem.on('dismiss', this.dismissNotification, this);
            this.notificationItems.push(notificationItem);
            this.$list.append(notificationItem.render());
            var ringColor = this.getNoficationProgressRingColor(notification) || '#B8D543';
            NS.drawProgress('progress-ring-' + notification.id, 60, ringColor, 5, '#56544D', 'bold 16px ProximaNova');
        },
        showEmptyNotifications: function () {
            this.$('.notification-panel').addClass('notifications-empty');
        },
        hideEmptyNotifications: function () {
            this.$('.notification-panel').removeClass('notifications-empty');
        },
        onNotificationAdd: function (obj) {
            this.addOneNotification(obj);
        },
        onNotificationRemove: function () {
            if (this.collection.length === 0) {
                this.showEmptyNotifications();
            }
        },
        fetchMore: function () {
            var _c = this,
                more = this.collection.fetchMore();
            if (more) {
                _c.showLoading();
                more.done(function () {
                    _c.checkForMore();
                }).always(function () {
                    _c.hideLoading();
                });
            }
            return more;
        },
        showLoading: function () {
            this.$('.notifications-loading').removeClass('hide');
        },
        hideLoading: function () {
            this.$('.notifications-loading').addClass('hide');
        },
        checkForMore: function () {
            var _c = this,
                _x = null;
            if (this.$list.scrollTop() + this.$list.height() > this.$list[0].scrollHeight - 160) {
                _x = this.fetchMore();
                if (_x) {
                    _x.always(function () {
                        if (_c.collection.length === 0) {
                            _c.showEmptyNotifications();
                        } else {
                            _c.hideEmptyNotifications();
                        }
                    });
                }
            }
            return _x;
        },
        dismissNotification: function (notificationItem) {
            var currentDate, expirationDate;
            if ('PROFILE_INCOMPLETE' === notificationItem.model.get('typeName')) {
                $.cookie('flx-profile-notification-dismissed', 'true', {
                    path: '/'
                });
            }
            if ('USER_UNVERIFIED' === notificationItem.model.get('typeName')) {
                $.cookie('flx-unverified-notification-dismissed', 'true', {
                    path: '/'
                });
            }
            currentDate = new Date();
            expirationDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+1, 0, 0, 0);
            if ('SUMMER_CHALLENGE_WEB' === notificationItem.model.get('typeName')) {
                $.cookie('flx-summer-challenge-notification-dismissed', 'true', {
                    expires: expirationDate,
                    path: "/"
                });
            }
            notificationItem.model.destroy();
            notificationItem.remove();
        },
        dismissAll: function () {
            var _c = this;
            _.each(this.notificationItems, function (notificationItem) {
                _c.dismissNotification(notificationItem);
            });
        }
    });

    var InAppNotificationsView = Backbone.View.extend({

        events: {
            'click #notification_nav': 'notificationNavClick',
            'click .notification-nav-icon': 'notificationNavIconClick',
            'click .notification_close_container': 'hidePopup',
            'touchstart .notification_close_container': 'hidePopup',
            'click .lnk_notifications_dismiss_all': 'dismissAll',
            'click body': 'hideNotification'
        },

        initialize: function () {

            _.bindAll(this, 'render', 'showPopup', 'hidePopup', 'onNotificationRemove');

            //Initialize the model and collection
            this.model = new NotificationCountManager();
            this.notificationCollection = new NotificationCollection();

            //Bind model events
            this.model.on('change', this.countChange, this);
            this.notificationCollection.on('remove', this.onNotificationRemove, this);

            //Initialize subviews
            this.$notification_container = $('#notification_container');
            this.$notification_popup = $('#notification_popup');

            this.nav_icon = new InAppNotificationIconView({
                'el': this.$('.notification-nav-icon')
            });
            this.sidebar_icon = new InAppNotificationIconView({
                'el': this.$('.notification-nav-sidebar-icon')
            });
            this.notificationsView = new InAppNotificationPanelView({
                'collection': this.notificationCollection
            });
            this.panel = this.notificationsView.render();

            this.hidePopup();
        },
        showDropdown: function () {
            var _x = null,
                _c = this;
            if (!this.$notification_container.children().length) {
                this.$notification_container.append(this.panel);
            }
            _x = this.notificationsView.checkForMore();
            if (_x) {
                _x.done(function () {
                    _c.nav_icon.setCount(0);
                    _c.sidebar_icon.setCount(0);
                    _c.model.save();
                });
            }
        },
        showPopup: function () {
            var _x = null,
                _c = this;
            if (!this.$notification_popup.children().length) {
                this.$notification_popup.append(this.panel);
            }
            this.$notification_popup.removeClass('hide');
            $('body>header,body>.header-space,body>.content-wrap,body>.content-wrap-landing,body>.footer-space,body>footer,body>#teacher_testimonials,body>.testimonial_arrow,body>.share-plane-container').hide();
            _x = this.notificationsView.checkForMore();
            if (_x) {
                _x.done(function () {
                    _c.nav_icon.setCount(0);
                    _c.sidebar_icon.setCount(0);
                    _c.model.save();
                });
            }
        },
        hidePopup: function () {
            this.$notification_popup.addClass('hide');
            $('body>header,body>.header-space,body>.content-wrap,body>.content-wrap-landing,body>.footer-space,body>footer,body>#teacher_testimonials,body>.testimonial_arrow,body>.share-plane-container').show();
            $(document).foundation('section', 'reflow');
            $('body').css('height', 'auto').trigger('notificationClose');
            return false;
        },
        countChange: function () {
            this.nav_icon.setCount(this.model.get('new_notifications'));
            this.sidebar_icon.setCount(this.model.get('new_notifications'));
        },
        notificationNavClick: function () {
            this.showDropdown();
        },
        notificationNavIconClick:function () {
            if (window._ck12) {
            	if(this.model.get('new_notifications')>=1) {
            		var curr_state = "active";
            	}
            	else{
            		var curr_state = "inactive";
            	}
            	if ($('#notification_container').hasClass('open')){
            		var bell_type = "bell_open"
            	}
            	else{ 
            		var bell_type = "bell_close"
            	}
	            var payload = {
	                'memberID': $( "header" ).attr( "data-user" ),
	                'action_type': bell_type,
	                'action_name':curr_state,
	                'screen_name': window.location.href
	            };
	            _ck12.logEvent('FBS_ACTION', payload);
	        }
        },        
        
        hideNotification: function (ev) {
            if (!($(ev.target).closest('#notification_container').length || $(ev.target).closest('#notification_nav').length)) {
                if ($('#notification_container').hasClass('open')) {
                    $('.notification-nav-icon').trigger('click');
                }
            }
        },
        notificationSidebarClick: function () {
            this.showPopup();
        },
        dismissAll: function () {
            this.notificationsView.dismissAll();
            if (window._ck12) {
	            var payload = {
	                'memberID': $( "header" ).attr( "data-user" ),
	                'action_type': "bell",
	                'action_name':"dismiss_all",
	                'screen_name': window.location.href
	            };
	            _ck12.logEvent('FBS_ACTION', payload);
	        }
        },
        onNotificationRemove: function (notification) {
            if (notification.get('is_new')) {
                //new_notifications
                var new_notifications = this.model.get(new_notifications);
                if (new_notifications > 0) {
                    new_notifications -= 1;
                }
                this.model.set({
                    'new_notifications': new_notifications
                });
            }
        }
    });

    return InAppNotificationsView;
});
