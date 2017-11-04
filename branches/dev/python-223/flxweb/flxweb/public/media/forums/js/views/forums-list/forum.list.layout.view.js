define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'forums/views/forums-list/forum.list.collection.view',
    'forums/services/forum.services',
    'forums/models/models',
    'common/utils/user',
    'common/views/modal.view',
    'forums/views/modals/guidelines.view'

], function($, _, Backbone, Mn, TMPL, ForumListCollectionView, ForumServices, Models, User, ModalView, ForumGuideline){
    var ForumListLayoutView = Mn.LayoutView.extend({
        template: _.template(TMPL.ForumList),
        radio:  Backbone.Wreqr.radio.channel('global'),
        regions:{
            'forumsList':'#forums-list',
            'forumGuidelineContainer': '#forum-guideline-container'
        },
        events:{
            'click #btn-load-more-forum': 'loadMore',
            'click .create-new-cafe-btn': 'showCreateDialog',
            'click .all': 'showAllForum',
            'click .student': 'showStudentForum',
            'click .teacher': 'showTeacherForum'
        },
        initialize: function(options){
            $('#forumBanner').removeClass('hide');
            $('.modal-uikit-overlay').parent().remove();
            $('body').removeClass('noscroll');

            $(window).trigger('show.small.navigation');
            this.pageNum = 1;
            this.pageSize = 12;
            this.total = 0;
            this.filter = 'all';
            //var self = this;
            this.collection = new Models.ForumCollection();
            this.data = {
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                sort: 'creationTime,desc'
            };
            this.user = options.user;
            this.renderForums();
            document.getElementsByClassName('page-title')[0].innerHTML = '';
            $('.title-area > .name').removeClass('hide-small');
            $('head').append('<meta name="description" content="These discussion forums are a place where you can have a conversation and develop your viewpoints on topics that matter to you.">');
            $('body').removeClass('no-Scroll');
        },
        showCreateDialog: function(){
            this.radio.vent.trigger('showCreateDialog');
        },
        showAllForum: function(){
            this.filter = 'all';
            this.data = {
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                sort: 'creationTime,desc'
            };
            this.collection.reset();
            this.$el.find('.filter').removeClass('active');
            this.$el.find('.all').addClass('active');
            this.data.pageNum = 1;
            if(!this.$el.find('#btn-load-more-forum').hasClass('hide')){
                this.$el.find('#btn-load-more-forum').addClass('hide');
            }
            this.renderForums();
        },
        showStudentForum: function(){
            this.filter = 'student';
            this.data = {
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                sort: 'creationTime,desc',
                taggedRoles: 'student'
            };
            this.collection.reset();
            this.$el.find('.filter').removeClass('active');
            this.$el.find('.student').addClass('active');
            this.data.pageNum = 1;
            if(!this.$el.find('#btn-load-more-forum').hasClass('hide')){
                this.$el.find('#btn-load-more-forum').addClass('hide');
            }
            this.renderForums();
        },
        showTeacherForum: function(){
            this.filter = 'teacher';
            this.data = {
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                sort: 'creationTime,desc',
                taggedRoles: 'teacher'
            };
            this.collection.reset();
            this.$el.find('.filter').removeClass('active');
            this.$el.find('.teacher').addClass('active');
            this.data.pageNum = 1;
            if(!this.$el.find('#btn-load-more-forum').hasClass('hide')){
                this.$el.find('#btn-load-more-forum').addClass('hide');
            }
            this.renderForums();
        },
        validTotal: function(data){
            if(data && data.response && typeof data.response.total){
                return true;
            }
            return false;
        },
        loadMore: function(){
            this.data.pageNum++;
            this.renderForums(this.data);
        },
        enableAdminFeature: function(){
            var self = this;
            this.user.done(function(data){
                if(data.isLoggedIn()){
                    var admins = data.userInfoDetail.roles.filter(function(role){
                        return role.is_admin_role;
                    });
                    if(admins.length > 0){
                        self.$el.find('.create-new-cafe-btn').removeClass('hide');
                    }
                }
            });
        },
        renderForums: function(){
            var self = this;
            ForumServices.getForums(this.data).done(function(forumData){
                var groupIds = forumData.response.group.map(function(group){
                    return group.id;
                });
                self.getCounts(groupIds, forumData);

            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
        getCounts: function(groupIDs, forumData){
            var postsCountsData = {
                groupIDs: JSON.stringify(groupIDs),
                clientID: '24839961',
                groupType: 'public-forum'
            };
            var memberCountsData = {
                groupIDs: groupIDs.join(','),
                clientID: '24839961',
                groupType: 'public-forum',
                totalMembers: 5,
                publicForums: true
            };

            var self = this;
            var postsCounts = ForumServices.getAllPostsCounts(postsCountsData),
                memberCounts = ForumServices.getMemberCounts(memberCountsData);

            $.when(postsCounts, memberCounts).done(function(pCounts, mCounts){
                forumData.response.group.forEach(function(group){
                    group.peerHelpInfo = {
                        threadsCount: pCounts.response.counts[group.id].threadsCount,
                        commentsCount: pCounts.response.counts[group.id].commentsCount
                    };
                    group.membersData = {
                        total: mCounts.response.groups[group.id].total,
                        members: mCounts.response.groups[group.id].members
                    };
                });
                self.collection.add(forumData.response.group);
                if(!ForumServices.hasMore(self.data.pageNum, self.data.pageSize, forumData.response.total)){
                    self.$el.find('#btn-load-more-forum').addClass('hide');
                }else{
                    self.$el.find('#btn-load-more-forum').removeClass('hide');
                }

            }).fail(function(errorMessage){
                ModalView.alert(errorMessage);
            });
        },
        onRender: function(){
            var forumListCollectionView = new ForumListCollectionView({
                collection: this.collection,
                user: this.user
            });
            this.enableAdminFeature();
            this.getRegion('forumsList').show(forumListCollectionView);
            this.getRegion('forumGuidelineContainer').show(this.forumGuideline = new ForumGuideline());
        },
        showGuideline: function(){
            this.forumGuideline.showGuideline();
        }

    });
    return ForumListLayoutView;
});
