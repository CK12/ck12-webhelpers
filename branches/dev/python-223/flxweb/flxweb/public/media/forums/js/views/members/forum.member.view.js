define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'forums/models/models',
    'forums/views/members/forum.member.collection.view',
    'forums/views/members/forum.member.item.view',
    'forums/views/home/forum.home.header.view',
    'forums/services/forum.services',
    'common/utils/user',
    'common/views/modal.view'

], function($, _, Backbone, Mn, TMPL, Models, ForumMemberCollectionView,
    ForumMemberItemView, ForumMemberHeaderView,
    ForumServices, User, ModalView){

    var ForumsMemberView = Mn.LayoutView.extend({
        template: _.template(TMPL.FORUMMEMBER),
        regions:{
            'memberHeaderInfo': '#member-header',
            'memberList': '#forum-member-list',
            'memberLeaderList': '#forum-member-leader-list'
        },
        events:{
            'mousedown #btn-add-member': 'addNewFollower',
            'click #btn-load-more': 'loadMore'
        },
        initialize: function(options){
            this.pageNum = 1;
            this.pageSize = 10;
            this.user = options.user;
            $(window).trigger('show.small.navigation');
        },
        addNewFollower: function(){

            var newEmail = $('.add-new-member').val();
            var self = this;
            this.user.then(function(user){
                self.currentUser = user.userInfoDetail;
                var data = {
                    'from':{
                        'name': self.currentUser.firstName + ' ' + self.currentUser.lastName,
                        'email': self.currentUser.email
                    },
                    'invites':[{
                        'email': newEmail
                    }],
                    'campaign': 'forum-new_member_joined-email-notification:email:product',
                    'forum': self.model.id+':'+self.model.toJSON().group.name
                };
                ForumServices.inviteMember({'data':JSON.stringify(data)}).done(function(){
                    $('.invite-follwer-wrapper').removeClass('hide');
                    $('.new-member').addClass('hide');
                }).fail(function(errorMessage){
                    ModalView.alert(errorMessage);
                });
            });
        },
        loadMore: function(){
            var self = this;
            this.pageNum++;
            if(!ForumServices.hasMore(this.pageNum, this.pageSize, this.model.toJSON().group.membersCount)){
                this.$el.find('#btn-load-more').addClass('hide');
            }
            var data = {
                groupID: this.model.id,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };
            ForumServices.getForumMembers(data).done(function(data){
                self.forum_members.add(data.response.members);
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
        onRender: function(){
            var self = this;
            var data = {
                groupID: this.model.id,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            };
            if(this.pageNum*this.pageSize >= this.model.toJSON().group.membersCount){
                this.$el.find('#btn-load-more').addClass('hide');
            }
            ForumServices.getForumMembers(data).done(function(data){
                self.forumMemberData = data.response;
                self.members = new Models.MemberCollection(self.forumMemberData.members);
                self.getRegion('memberHeaderInfo').show(new ForumMemberHeaderView({
                    group: self.model.get('group'),
                    isMember : self.model.get('isMember'),
                    user: self.user,
                    type: 'member'
                }));
                // self.getRegion('memberLeaderList').show(new ForumMemberCollectionView({
                //     collection: self.members.getMemberLeaders(),
                //     childView: ForumMemberItemView
                // }));

                self.getRegion('memberLeaderList').show(new ForumMemberItemView({
                    model: new Models.Member(self.model.toJSON().group.creator)
                }));
                self.forum_members = self.members.getMembers();
                self.getRegion('memberList').show(new ForumMemberCollectionView({
                    collection: self.forum_members,
                    childView: ForumMemberItemView
                }));
            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        }
    });
    return ForumsMemberView;
});
