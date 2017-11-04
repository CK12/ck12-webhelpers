define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'forums/views/forum-banner/forum.create.discussion.item.view',
    'forums/views/forum-banner/forum.share.item.view',
    'forums/services/forum.services',
    'forums/tutorial'
], function($, _, Backbone, Mn, TMPL, ForumCreateDiscussion, ForumShare, ForumService, Tutorial){
    var BannerView = Mn.LayoutView.extend({
        template: _.template(TMPL.ForumBannerLayout),
        radio:  Backbone.Wreqr.radio.channel('global'),
        regions:{
            'forumCreateContainer':'#forum-create-container',
            'forumShareContainer':'#forum-share-container'
        },
        events:{
            'click #create-forum-final': 'createForumHandler',
            'click .guideline-link': 'showGuideline',
            'click .tour': 'showTour',
            'click #share-forum-cancel': 'goToDetailPage',
            'click #share-ok': 'goToDetailPage'
        },
        initialize: function(options){
            _.bindAll(this, 'createNewForum');
            this.user = options.user;
            this.root_url = window.location.protocol + '//'+ window.location.hostname+'/';//(new URLHelper('/')).url();
            this.action = 'create';
        },
        onRender: function(){
            this.getRegion('forumCreateContainer').show(new ForumCreateDiscussion());
            this.getRegion('forumShareContainer').show(new ForumShare());
        },
        resetForm: function(){
            this.$el.find('#forum-name').val('');
            this.$el.find('#forum-tagline').val('');
            this.$el.find('#forum-description').val('');
            this.$el.find('#create-forum-final').html('Create Discussion');
            this.$el.find('#checkbox1').prop('checked', false);
            this.$el.find('#checkbox2').prop('checked', false);
            this.$el.find('#forum_image').val('');
        },
        showCreateDialog: function(data){
            this.resetForm();
            this.$el.find('.forums-name-button').addClass('hide');
            $('#forumBanner').removeClass('narrow-banner');
            this.$el.find('.forums-filters').hide();
            this.$el.find('.forums-header').addClass('top-to-bottom');
            this.$el.find('.modal-like-content-wrapper').css('opacity', '1');
            $('.content-wrap').addClass('hide');
            // this.$el.find('#forum-name').focus();
            // $('.modal-like-container').css('left', '-100%');
            if(data){
                this.action = 'update';
                this.oldForumData = data;
                this.groupID = data.groupID;
                this.updateOneCafeCallBack = data.callBack;
                this.fillOutFormByData(data);
            }else{
                this.action = "create";
                this.groupID = null;
            }
        },
        fillOutFormByData: function(data){
            var that = this;
            this.$el.find('#forum-name').val(data.name);
            this.$el.find('#forum-tagline').val(data.tagLine);
            this.$el.find('#forum-description').val(data.description);
            this.$el.find('#create-forum-final').html('Update Discussion');
            data.roles.forEach(function(role){
                if(role.name.toLowerCase() === 'student'){
                    that.$el.find('#checkbox1').prop('checked', true);
                }else if(role.name.toLowerCase() === 'teacher'){
                    that.$el.find('#checkbox2').prop('checked', true);
                }
            });
        },
        hideCreateDialog: function(){
            $('.forums-name-button').removeClass('hide');
            // $('.forums-filters').show();
            $('body').css('overflow','none');
            $('.modal-like-content-wrapper').css('opacity', '0');
            $('.content-wrap').removeClass('hide');
            $('.forums-header').removeClass('top-to-bottom');
            setTimeout(function(){
                if(!$('#forumBanner').hasClass('narrow-banner')){
                    $('#forumBanner').addClass('narrow-banner');
                }
            }, 1000);
            this.$el.find('.create-error-message').html('');
            this.$el.find('#forum-name').css('border-color', '#DDDDDD').val('');
            this.$el.find('#forum-description').val('');
        },
        createForumHandler: function(){
            //Get all input fields data
            this.forum_name = this.$el.find('#forum-name').val().trim();
            if(this.forum_name.length === 0){
                this.$el.find('.create-error-message').html('Please enter a title');
                this.$el.find('#forum-name').css('border-color', 'red');
                return;
            }
            this.forum_description = this.$el.find('#forum-description').val().trim();
            this.forum_tagline = this.$el.find('#forum-tagline').val().trim();
            this.students = this.$el.find('#checkbox1').prop('checked') || false;
            this.teachers = this.$el.find('#checkbox2').prop('checked') || false;
            this.file = this.$el.find('#forum_image')[0].files[0];

            //show loading icon
            this.$el.find('.create-cancel-btn').addClass('hide');
            this.$el.find('.spin-container').removeClass('hide');
            var buttonText = 'Creating a Discussion';
            if(this.action === 'update'){
                buttonText = 'Updating a Discussion'
            }
            this.$el.find('#create-forum-final').text(buttonText).prop('disabled', true);

            this.createNewForum();
        },
        showGuideline: function(){
            this.radio.vent.trigger('showGuideline');
        },
        goToDetailPage: function(){
            location.href = '/forum/'+this.forum_id+'/home';
        },
        showTour: function(){
            Tutorial.show();
        },
        createNewForum: function(){
            var formData = new FormData();
            formData.append('groupScope', 'closed');
            formData.append('groupType', 'public-forum');

            if(this.action === 'create'){
                formData.append('groupName', this.forum_name);
            }else{
                formData.append('newGroupName', this.forum_name);
            }

            if(this.forum_description.length > 0){
                if(this.action === 'create'){
                    formData.append('groupDescription', this.forum_description);
                }else{
                    formData.append('newGroupDesc', this.forum_description);
                }
            }

            if(this.forum_tagline.length > 0){
                formData.append('tagLine', this.forum_tagline);
            }
            var taggedRoles = null;
            if(this.students){
                taggedRoles = 'student';
            }
            if(this.teachers){
                if(taggedRoles){
                    taggedRoles += ',teacher';
                }else{
                    taggedRoles = 'teacher';
                }
            }
            formData.append('taggedRoles', taggedRoles);

            if(this.file){
                var timeStamp = new Date().getTime();
                formData.append('resourceType', 'image');
                formData.append('resourceName', this.file.name);
                formData.append('resourcePath', this.file, this.file.name);
            }
            if(this.action === 'create'){
                this.createForumAPI(formData);
            }else{
                formData.append('groupID', this.groupID);
                this.updateForumAPI(formData, taggedRoles);
            }
        },
        updateForumAPI: function(data, taggedRoles){
            var that = this,
                reRenderForumList = false;
                if(this.oldForumData){
                    var filter = this.oldForumData.forumListLayoutView.filter;
                    if(filter !== 'all' && (!taggedRoles || taggedRoles.indexOf(filter) === -1)){
                        reRenderForumList = true;
                    }
                }
            ForumService.updateForum(data).done(function(data){
                if(data.responseHeader.status === 0){
                    if(that.oldForumData && reRenderForumList){
                        if(filter === 'student'){
                            that.oldForumData.forumListLayoutView.showStudentForum();
                        }else{
                            that.oldForumData.forumListLayoutView.showTeacherForum();
                        }
                    }
                    that.updateOneCafeCallBack(data.response.group);
                    that.$el.find('.create-cancel-btn').removeClass('hide');
                    that.$el.find('.spin-container').addClass('hide');
                    that.$el.find('#create-forum-final').text('Create Discussion').prop('disabled', false);
                    that.hideCreateDialog();
                }
            });
        },
        createForumAPI: function(data){
            var self = this;
            ForumService.createForum(data).done(function(data){
                self.$el.find('.create-cancel-btn').removeClass('hide');
                self.$el.find('.spin-container').addClass('hide');
                self.$el.find('#create-forum-final').text('Create discussion').prop('disabled', false);
                if(data.responseHeader.status === 0){
                    self.forum_id = data.response.group.id;
                    self.$el.find('.forum-link:first > a').attr('href',self.root_url+ 'forum/' + self.forum_id + '/home?utm_medium=email&utm_source=share-content-share-this-forum&utm_campaign=product&utm_content=forum-title');
                    self.$el.find('.forum-link:last > a').attr('href',self.root_url+ 'forum/' + self.forum_id + '/home?utm_medium=email&utm_source=share-content-share-this-forum&utm_campaign=product&utm_content=follow-link');
                    self.$el.find('.forum-link:first > a').text(self.$el.find('#forum-name').val());
                    self.$el.find('.share').removeClass('hide');
                    self.user.done(function(userData){
                        self.$el.find('.creator-name').text(userData.userInfoDetail.firstName);
                    });
                    self.$el.find('.modal-like-container').css('left', '-100%');
                }else if(data.responseHeader.status === 5010){
                    self.$el.find('.create-error-message').html('The title has already been used');
                }else{
                    self.$el.find('.create-error-message').html(data.response.message);
                }
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        }
    });
    return BannerView;
});
