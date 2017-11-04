define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'forums/services/forum.services',
    'common/views/modal.view',
    'forums/views/home/forum.home.header.view'

], function($, _, Backbone, Mn, TMPL, ForumService, ModalView, ForumHomeHeaderView){
    var ForumsSettingView = Mn.LayoutView.extend({
        template: _.template(TMPL.FORUMSETTING),
        regions:{
            header: '#settings-header'
        },
        events: {
            'click .js-forum-title-edit': 'showNameEditor',
            'click .forum-title-save': 'saveTitle',
            'click .forum-title-cancel': 'cancelTitleEdit',

            'click .js-forum-description-edit': 'showDescriptionEditor',
            'click .js-group-detail-cancel': 'cancelDescriptionEdit',
            'click #description-save': 'saveDescription',

            'click #profile-anonymous': 'profileAnonymousToggle',
            'click #email-notification': 'emailNotificationToggle',
            'mouseover .anonymous-info-icon': 'showToolTip',
            'mouseleave .anonymous-info-icon': 'hideToolTip',
            'click #peerhelp-dropdown-big-common>li': 'sendEmailFrequency',
            'click .receive-email-freq': 'frequencyRadioHandler',
            'click .email-me-about': 'emailMeRadioHandler'
            // 'click .js-frequency-option-dropdown': 'showDropdown'
        },
        initialize: function(options){
            this.user = options.user;
            $(window).trigger('show.small.navigation');
        },
        showNameEditor: function(){
            this.$el.find('#forum-title-edit').val(this.model.get('group').name);
            this.$el.find('.forum-name-container').addClass('hide');
            this.$el.find('.forum-title-edit').removeClass('hide');
        },
        saveTitle: function(){
            var data = {
                groupID: this.model.id,
                newGroupName: this.$el.find('#forum-title-edit').val(),
                newGroupDesc: this.model.toJSON().group.description,
                groupType:'public-forum'
            };
            var self = this;
            ForumService.updateForum(data).done(function(data){
                if(data.responseHeader.status === 0){
                    self.model.set('group', data.response.group);
                    // self.$el.find('.forum-name').html(data.response.group.name);
                    // self.$el.find('.update-error-message').addClass('hide');
                    // self.cancelTitleEdit();
                }else if(data.responseHeader.status === 5010){
                    self.$el.find('.update-error-message').removeClass('hide');
                    self.$el.find('.update-error-message').html('The forum title has already been used');
                }else{
                    self.$el.find('.update-error-message').removeClass('hide');
                    self.$el.find('.update-error-message').html(data.response.message);
                }
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
        cancelTitleEdit: function(){
            var originalTitle = this.$el.find('.forum-name').html();
            this.$el.find('.forum-title-edit').val(originalTitle).addClass('hide');
            this.$el.find('.forum-name-container').removeClass('hide');
            this.$el.find('.update-error-message').addClass('hide');
        },

        showDescriptionEditor: function(){
            this.$el.find('#forum-description-edit').val(this.model.get('group').description);
            this.$el.find('.forum-description-edit').removeClass('hide');
            this.$el.find('.forum-discription-container').addClass('hide');
        },
        saveDescription: function(){
            var data = {
                groupID: this.model.id,
                newGroupName: this.model.toJSON().group.name,
                newGroupDesc: this.$el.find('#forum-description-edit').val(),
                groupType:'public-forum'
            };
            var self = this;
            ForumService.updateForum(data).done(function(data){
                if(data.responseHeader.status === 0){
                    self.model.set('group', data.response.group);
                }
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
        cancelDescriptionEdit: function(){
            this.$el.find('.forum-description-edit').addClass('hide');
            this.$el.find('.forum-discription-container').removeClass('hide');
        },
        onRender: function(){
            var forum_id = this.model.id;
            var self = this;
            this.getRegion('header').show(new ForumHomeHeaderView({
                group: this.model.get('group'),
                isMember : this.model.get('isMember'),
                user: this.user,
                type: 'setting'
            }));
            if(!this.model.get('isMember')){
                return;
            }
            ForumService.getNotifications().done(function(data){
                if(data.responseHeader.status === 0){
                    var forum_settings = data.response.notifications.groupNotifications[forum_id];
                    if(forum_settings.hasOwnProperty('GROUP_PH_POST')){
                        $('#peerHelp-all-big-common').prop('checked', true);
                    }else{
                        self.my = 'yes';
                        $('#peerHelp-my-big-common').prop('checked', true);
                    }

                    var emailNotification  = forum_settings.GROUP_PH_POST||forum_settings.PH_POST;
                    var emailNotificationFrequency = emailNotification.frequency;
                    if(emailNotificationFrequency === 'off'){
                        $('.forums-notification-expand').addClass('hide');
                        $('#email-notification').prop('checked', false);
                    }else{
                        $('.forums-notification-expand').removeClass('hide');
                        $('#email-notification').prop('checked', true);
                        self.frequency = emailNotificationFrequency;

                        if(emailNotificationFrequency === 'instant' || emailNotificationFrequency === 'weekly'){
                            $('#peerhelp-'+emailNotificationFrequency+'-big-common').prop('checked', true);
                        }else{
                            $('#peerhelp-digest-big-common').prop('checked', true);
                            $('.js-frequency-option-dropdown').removeClass('disabled');
                            $('.dropdown-label').text(self.frequency.replace('hours', ' hours'));
                        }
                    }
                }
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
            var requestData = {
                groupID: forum_id,
                nocache:1448067342228
            };
            ForumService.getAnonymous(requestData).done(function(data){
                $('#profile-anonymous').prop('checked', data.group.allowAnonymous);
            });
        },
        profileAnonymousToggle: function(){
            var checked = this.$el.find('#profile-anonymous').is(':checked');
            var data = {
                allowAnonymous:checked,
                typeName:'GROUP_QA_ANONYMOUS_PERMISSION',
                enableQA:'true',
                groupID: this.model.id
            };
            ForumService.updateAnonymous(data).done(function(){
                console.log('done');
            });

        },
        emailNotificationToggle: function(e){
            var target = $(e.target);
            if(target.hasClass('onoffswitch-checkbox')) {
                var data = {
                    groupID: this.model.id
                };
                if(target.prop('checked')){
                    data.peerHelp = 'yes';
                    $('.forums-notification-expand').removeClass('hide');
                    this.$el.find('#peerhelp-instant-big-common').prop('checked', true);
                    if(this.my === 'yes'){
                        data.onlyParticipation = 'yes';
                    }
                }else{
                    data.peerHelp = 'no';
                    $('.forums-notification-expand').addClass('hide');
                }
                ForumService.updateNotifications(data).fail(function(errorMessage){
                    ModalView.alert(errorMessage);
                });
            }

        },
        sendEmailFrequency: function(e){
            var text = $(e.currentTarget).find('a').text();
            $('.dropdown-label').text(text);
            $('#close-dropdown').trigger('click');
            var target = $(e.currentTarget).attr('class').split('-')[2];
            this.frequency = target;
            $('#peerhelp-digest-big-common').prop('checked', true);
            this.sendToServer();
        },
        emailMeRadioHandler: function(e){
            var el = $(e.target);
            if(el.hasClass('js-type-radio')){
                if($('#peerHelp-my-big-common').prop('checked')){
                    this.my = 'yes';
                }else{
                    this.my = 'no';
                }
            }
            var frequency = this.$el.find('.receive-email-freq input:checked').attr('id').split('-')[1];
            if(frequency === 'digest'){
                this.frequency = $('.js-frequency-option-dropdown a').text().replace(' hours', 'hours');
            }else{
                this.frequency = frequency;
            }
            if(el.hasClass('js-type-radio')|| el.hasClass('js-noti-radio')){
                this.sendToServer();
            }
        },
        frequencyRadioHandler: function(e){
            var el = $(e.target);

            if(el.hasClass('js-noti-radio') || el.attr('for')){
                var frequency =  (el.attr('id') && el.attr('id').split('-')[1]) || el.attr('for').split('-')[1];
                if(frequency === 'digest'){
                    this.frequency = $('.js-frequency-option-dropdown a').text().replace(' hours', 'hours');
                }else{
                    this.frequency = frequency;
                }
            }
            if(el.hasClass('js-type-radio')|| el.hasClass('js-noti-radio')){
                this.sendToServer();
            }
        },
        sendToServer: function(){
            var data ={
                'groupID': this.model.id,
                'peerHelp': this.frequency
            };
            if(this.my === 'yes'){
                data.onlyParticipation = this.my;
            }
            ForumService.updateNotifications(data).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
        showDropdown: function(e){
            var el = $(e.currentTarget);
            if(el.hasClass('disabled')){
                return false;
            }
        },
        showToolTip: function(e){
            $(e.target).find('.anonymous-info').show();
        },
        hideToolTip: function(){
            $('.anonymous-info').hide();
        }
    });
    return ForumsSettingView;
});
