
define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/views/forums-list/forum.list.layout.view',
    'forums/views/forums-list/forum.list.collection.view',
    'forums/views/forum.detail.layout.view',
    'forums/views/home/forum.home.layoutview',
    'forums/views/members/forum.member.view',
    'forums/views/settings/forum.settings.layoutview',
    'forums/views/forum.sidenav.view',
    'forums/views/forum-banner/forum.banner.layout.view',
    'forums/models/models',
    'common/utils/user'
    // 'forums/tests/fakeServer'


],function($, _, Backbone, Marionette, ForumListLayoutView, ForumListCollectionView, ForumDetailLayoutView,
    ForumHomeView, ForumMemberView, ForumSettingView, ForumSideNavView, ForumBanner, Models, User){
    var ForumsApp = Marionette.Application.extend({
        regions: {
            forumBanner: '#forumBanner',
            mainRegion: '#forums-main'
        },
        initialize: function(){
            $('.content-wrap').addClass('no-padding');
            this.user = User.getUser();
            var self = this;
            this.vent.on('goToForumList', function(){
                self.list();
                Backbone.history.navigate('/forums/');
            });
            this.vent.on('goToForum', function(data){
                self.home(data.id);
                Backbone.history.navigate('/forum/'+data.id+'/home');
            });
            this.vent.on('showCreateDialog', function(data){
                if(data){
                    data.forumListLayoutView = self.forumListLayoutView;
                }
                self.forumBannerView.showCreateDialog(data);
            });
            this.vent.on('hideCreateDialog', function(){
                self.forumBannerView.hideCreateDialog();
            });
            this.vent.on('showGuideline', function(){
                self.forumListLayoutView.showGuideline();
            });
        },
        // controller actions
        list: function(){
            // User.getUser().then(function(user){
                // if(user.isLoggedIn()){
                //     console.log('login');
                // }else{
                //     console.log(' not logged in');
                // }
            // });
            this.forumBannerView = new ForumBanner({user: this.user});
            this.forumListLayoutView = new ForumListLayoutView({user: this.user});
            this.forumBanner.show(this.forumBannerView);
            this.mainRegion.show(this.forumListLayoutView);
        },
        mobileNav: function(forum_id){
            this.home(forum_id);
            $('#forum-info-container').removeClass('hide-content');
            $('#forum-detail-container').addClass('hide-content');

        },
        home: function(forum_id, queryString){
            var activateQuestionEditor = new RegExp(/activateQuestionEditor=true/g).test(queryString);
            if (activateQuestionEditor){
                Backbone.history.navigate('/forum/'+forum_id+'/home');
            }
            this.renderPage(ForumHomeView, forum_id, 'home', null, activateQuestionEditor);
        },
        member: function(forum_id){
            this.renderPage(ForumMemberView, forum_id, 'member');
        },
        setting: function(forum_id){
            this.renderPage(ForumSettingView, forum_id, 'setting');
        },
        questionDetailsView: function(forum_id, post_id)
        {
            this.renderPage(ForumHomeView, forum_id, 'questionDetailsView', post_id);
            Backbone.history.navigate('/forum/'+forum_id+'/question/'+post_id);
        },

        // helper functions
        renderPage: function(View, forum_id, selected_nav, post_id, activateQuestionEditor){
            var forumDetailLayoutView = new ForumDetailLayoutView({'forum_id': forum_id, selected_nav: selected_nav, user: this.user, post_id: post_id, activateQuestionEditor:activateQuestionEditor});
            this.mainRegion.show(forumDetailLayoutView);
        }

    });
    return ForumsApp;
});
