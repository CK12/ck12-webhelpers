define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'forums/services/forum.services',
    'common/utils/user',
    'common/utils/date',
    'common/views/modal.view'
], function($, _, Backbone, Mn, TMPL, ForumServices, User, date, ModalView){
    var ForumsBlockView = Mn.ItemView.extend({
        template: _.template(TMPL.ForumBlock),
        radio:  Backbone.Wreqr.radio.channel('global'),
        events:{
            'click .btn-follow': 'follow',
            'click .btn-following': 'unfollow',
            'click .forum-title-link': 'forumClick',
            'click .stats': 'forumClick',
            'click .forum-image': 'forumClick',
            'click .last-comment-wrapper': 'forumClick',
            'click .cafe-edit-container' : 'updateCafe'
        },
        initialize: function(options){
            _.bindAll(this, 'processPeerHelpResponse', 'processFollowResponse', 'processUnfollowResponse', 'updateModel');
            this.user = options.user;
        },
        showMembers: function(){
            var self = this;
            var memberCountsData = {
                groupIDs: this.model.id,
                clientID: '24839961',
                groupType: 'public-forum',
                totalMembers: 5,
                publicForums: true
            };
            ForumServices.getMemberCounts(memberCountsData).done(function(data){
                if(data.responseHeader.status === 0){
                    self.model.set('membersData', {
                        total: data.response.groups[self.model.id].total,
                        members: data.response.groups[self.model.id].members
                    });
                }
            });
        },
        updateCafe: function(){
            var data = {
                name: this.model.get('name'),
                tagLine: this.model.get('tagLine'),
                description: this.model.get('description'),
                roles: this.model.get('taggedWithRoles'),
                groupID: this.model.get('id'),
                callBack: this.updateModel
            };
            this.radio.vent.trigger('showCreateDialog', data);
        },
        updateModel: function(group){
            this.model.set(group);
        },
        processPeerHelpResponse: function(data){
            if(ForumServices.validStatus(data)){
                if(data.response && data.response.posts && data.response.posts.length > 0){
                    data.response.posts[0].updated = date.getTimeDifference(data.response.posts[0].updated).big;
                    try {
                        // Cleanspeak flagged content check to see if latest post should be shown to user
                        // Case: cleanspeak action not defined, pre-cleanspeak integration
                        if ( !data.response.posts[0].cleanspeakAction ){
                            data.response.posts[0]['showToUser'] = true;
                            // Case: authorOnly is false or user is owner
                        } else if (data.response.posts[0].authorOnly === false || (window.ads_userid && String(data.response.posts[0].memberID) === String(window.ads_userid))){
                            data.response.posts[0]['showToUser'] = true;
                        } else {
                            data.response.posts[0]['showToUser'] = false;
                        }
                    } catch (e){
                        console.log('Failed checking for cleanspeak flagged content: '+e);
                        data.response.posts[0]['showToUser'] = true;
                    }
                }
                return data;
            }
            return false;
        },
        follow: function(){
            var model = this.model.toJSON();
            var data = {
                groupID: model.id,
                accessCode: model.accessCode
            };
            var self = this;
            this.user.done(function(userData){
                if(userData.isLoggedIn()){
                    ForumServices.follow(data).done(function(data){
                        if(self.processFollowResponse(data)){
                            if (window.dexterjs){
                                window.dexterjs.logEvent('FBS_ACTION', {
                                    screen_name:'forum_browse',
                                    action_type:'link',
                                    action_name:'follow',
                                    memberID: window.ads_userid,
                                    groupID : self.model.id
                                });
                            }
                            self.showMembers();
                            self.$el.find('.tip').removeClass('hide');
                            // setTimeout(function(){
                            //     self.$el.find('.tip').css('opacity', '0');
                            // },10000);
                        }
                    }).fail(function(data){
                        ModalView.alert(data);
                    });
                }else{
                    require(['common/views/login.popup.view'], function(loginPopup){
                        loginPopup.showLoginDialogue();
                    });
                }
            });
        },
        processFollowResponse: function(data){
            if(ForumServices.validStatus(data)){
                this.model.set('isMember', true);
                return true;
            }else if (data.responseHeader.status == 13001){
                ModalView.alert(data.response.message);
            }
            return false;
        },
        unfollow: function(){
            var self = this;
            var data = {
                groupID: this.model.id
            };
            this.user.done(function(userData){
                data.memberID = userData.userInfoDetail.id;

                if(userData.userInfoDetail.id === self.model.toJSON().creator.authID){
                    ModalView.alert('The forum Owner can not unfollow his own forum!');
                }else{
                    ForumServices.unfollow(data).done(function(data){
                        if(self.processUnfollowResponse(data)){
                            if (window.dexterjs){
                                window.dexterjs.logEvent('FBS_ACTION', {
                                    screen_name:'forum_browse',
                                    action_type:'link',
                                    action_name:'unfollow',
                                    memberID: window.ads_userid,
                                    groupID: self.model.id
                                });
                            }
                            self.showMembers();
                        }
                    }).fail(function(data){
                        ModalView.alert(data);
                    });
                }
            });

        },
        processUnfollowResponse: function(data){
            if(ForumServices.validStatus(data)){
                this.model.set('isMember', false);
                return true;
            }
            return false;
        },
        enableAdminFeature: function(){
            var self = this;
            this.user.done(function(data){
                if(data.isLoggedIn()){
                    var admins = data.userInfoDetail.roles.filter(function(role){
                        return role.is_admin_role;
                    });
                    if(admins.length > 0){
                        self.$el.find('.cafe-edit-container').removeClass('hide');
                    }
                }
            });
        },
        onRender: function(){
            this.enableAdminFeature();
        },
        modelEvents: {
            'change': 'fieldChanged'
        },
        fieldChanged: function(){
            this.render();
        },
        forumClick: function(){
            this.radio.vent.trigger('goToForum', {id: this.model.id});
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_ACTION', {
                    screen_name:'forum_browse',
                    action_type:'link',
                    action_name:'forum_title',
                    memberID: window.ads_userid,
                    groupID: this.model.id
                });
            }
            return false;
        }
    });
    return ForumsBlockView;
});
