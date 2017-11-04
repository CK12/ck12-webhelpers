define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'forums/templates/templates',
    'forums/views/home/forum.home.layoutview',
    'forums/views/home/forum.home.header.view',
    'forums/views/members/forum.member.view',
    'forums/views/settings/forum.settings.layoutview',
    'forums/services/forum.services',
    'forums/models/models',
    'common/utils/user',
    'forums/services/forum.services',
    'forums/views/forum.sidenav.view',
    'forums/views/home/forum.mobile.nav.view',
    'forums/tutorial',
    'common/views/modal.view'

], function($, _, Backbone, Mn, TMPL, ForumHomeView, ForumHomeHeaderView, ForumMemberView,
    ForumSettingView, ForumService, Models, User, ForumServices, ForumSideNavView,
    ForumMobileNavView, Tutorial, ModalView){

    var ForumsDetailView = Mn.LayoutView.extend({
        template: _.template(TMPL.FORUMDETAIL),
        radio:  Backbone.Wreqr.radio.channel('global'),
        initialize: function(options){
            $(window).scrollTop(0);
            $('#forumBanner').addClass('hide');
            this.root_url = window.location.protocol + '//'+ window.location.hostname+'/'; //(new URLHelper('/')).url();
            // for mobile
            document.getElementsByClassName('page-title')[0].innerHTML = 'Home';
            var self = this;
            $('li.back-icon').off('click').on('click', function(){
                self.navigationBack();
            });
            if ('classList' in document.createElement('a')) {
                document.getElementsByClassName('back-icon')[0].classList.remove('hide-one', 'hidden');
                document.getElementsByClassName('name')[0].classList.add('hide-small');
            } else { // IE-9 :(
                var temp = document.getElementsByClassName('back-icon')[0];
                temp.className = temp.className.replace(/\bhide-one\b/, '');
                temp.className = temp.className.replace(/\bhidden\b/, '');
                document.getElementsByClassName('name')[0].className += 'hide-small';
            }
            $(window).trigger('hide.small.navigation');

            // end for mobile

            this.id = options.forum_id;
            this.selected = options.selected_nav;
            this.postID = options.post_id;
            this.activateQuestionEditor = options.activateQuestionEditor;
            this.url = 'forum/' + this.id;
            // $('head > title').html('Cafe '+this.selected+' | CK-12 Foundation');
            // this.homeView = new ForumHomeView({'forum_id':this.id });


            this.model = new Models.Forum({id: this.id});
            this.model.fetch().done(function(data){
                if(data.response.group && data.response.group.description){
                    $('head').append('<meta name="description" content="'+ data.response.group.description + '">');
                }
                // $('head > title').html(data.response.group.name+' |Cafe | CK-12 Foundation');
                if(data.response.group && data.response.group.name && data.response.group.id){
                    $('head').append('<meta property="og:title" content="'+ data.response.group.name + '" />'+
                    '<meta property="og:type" content="website" />'+
                    '<meta property="og:url" content="'+self.root_url+'forum/'+data.response.group.id+'/home" />'+
                    '<meta property="og:image" content="'+self.root_url+'media/forums/images/girl_happy.png" />');
                }
            });
            this.user = options.user;
            Tutorial.init(this.model.id, this.user);

            var _self = this;
            //Listen to peerhelp event once initialized
            $(document).on('postInitPeerhelp', function(){
               //Event to tigger when user auto-follows forum from Q & A
                window.peerHelp.events.on('memberJoinedGroup',function(data) {
                    _self.followSuccessCallback(data);
                    // event.preventDefault();
                });

                window.peerHelp.events.on('shareDiscussion',function(data) {
                    _self.share(data);
                });
            });

        },
        regions:{
            // 'sideNav': '#forum-info-container',
            'levelOne': '#levelOne',
            'levelTwo': '#levelTwo'
        },
        events:{
            // 'click #forum-home-link': 'homeLinkHandler',
            'click .back-button': 'home',
            'click #nav-tour': 'showTour',
            'click #nav-guide-line': 'forumGuideLine',
            'click .members-count': 'members',
            'click .link-setting': 'settings',
            // 'click .go-back-nav': 'goBack',
            'click .go-back-level0': 'goToforumlist',
            'click .go-back-level1': 'home',
            'click #mobile-forum-home': 'home',
            'click #mobile-nav-tour': 'showTour',
            'click #mobile-forum-settings-link':'settings',
            'click #mobile-forum-members': 'members',

            'click #delete-forum': 'deleteForum',
            'click #delete-forum-cancel': 'cancel',

            'click .link-unfollow': 'unfollow',
            'click .link-follow': 'follow',
            'click .link-share': 'share',

            'click #invite-follower': 'share',


            'click .js-setting-no': 'home',
            'click .js-setting-yes': 'showSetting'

        },
        home: function(){
            $('#forums-main .ph-back').removeClass('hide');
            $('.back-icon').addClass('hide');

            $(window).scrollTop(0);
            this.selected = 'home';


            $('.nav-link-wrapper').removeClass('active');
            this.$el.find('#nav-home').addClass('active');
            this.$el.find('.side-nav > h5').hide();
            this.$el.find('.go-back-level2').addClass('hide');

            // $('head > title').html('Forum Home | CK-12 Foundation');
            this.homeView = new ForumHomeView({model: this.model, user: this.user, activateQuestionEditor: this.activateQuestionEditor});
            this.activateQuestionEditor = false;
            this.getRegion('levelOne').show(this.homeView);
            this.$el.find('#levelOne').removeClass('maxHeight');
            this.$el.find('#levelTwo').addClass('maxHeight');
            $('.mobile-use-container').css('left','0');
            var url = this.url + '/home';
            this.$el.find('.go-back-level1 > span').text(this.model.toJSON().group.name);

            Backbone.history.navigate(url);
            document.getElementsByClassName('page-title')[0].innerHTML = 'Home';

            this.forumMobileNavView = new ForumMobileNavView({model:this.model, user: this.user});
            this.homeView.getRegion('mobileNav').show(this.forumMobileNavView);
        },
        members: function(){
            // go back icon setting
            $('#forums-main .ph-back').addClass('hide');
            $('.back-icon').removeClass('hide');
            $('body').removeClass('no-Scroll');

            $(window).scrollTop(0);
            this.selected = 'member';

            this.$el.find('.go-back-level1 > span').html('<a>'+this.model.toJSON().group.name+'</a>');
            this.$el.find('.go-back-level2').removeClass('hide').find('span').html('Forum Followers');

            // $('head > title').html('Forum Followers | CK-12 Foundation');
            $('.nav-link-wrapper').removeClass('active');
            this.$el.find('#nav-member').addClass('active');
            this.$el.find('.side-nav > h5').hide();
            $('.mobile-use-container').css({'left':'-100%'});
            if(!this.homeView){
                $('.mobile-use-container').css({'transition':'all 0s'});
                setTimeout(function(){
                    $('.mobile-use-container').css({'transition': ''});
                },500);
            }
            this.memberView = new ForumMemberView({model:this.model, user: this.user});
            this.getRegion('levelTwo').show(this.memberView);

            this.$el.find('#levelTwo').removeClass('maxHeight');
            this.$el.find('#levelOne').addClass('maxHeight');


            var url = this.url + '/member';
            Backbone.history.navigate(url);

            document.getElementsByClassName('page-title')[0].innerHTML = 'Followers';
            return false;
        },
        settings: function(){
            // go back icon setting
            $('#forums-main .ph-back').addClass('hide');
            $('.back-icon').removeClass('hide');
            $('body').removeClass('no-Scroll');
            this.$el.find('.side-nav > h5').hide();
            $(window).scrollTop(0);
            this.selected = 'setting';

            this.$el.find('.go-back-level1 > span').html('<a>'+this.model.toJSON().group.name+'</a>');
            this.$el.find('.go-back-level2').removeClass('hide').find('span').html('Forum Settings');

            // $('head > title').html('Forum Settings | CK-12 Foundation');
            $('.nav-link-wrapper').removeClass('active');
            this.$el.find('#nav-setting').addClass('active');

            $('.mobile-use-container').css('left','-100%');
            if(!this.homeView){
                $('.mobile-use-container').css({'transition':'all 0s'});
                setTimeout(function(){
                    $('.mobile-use-container').css({'transition': ''});
                },500);
            }
            this.settingView =  new ForumSettingView({model: this.model, user: this.user});
            this.getRegion('levelTwo').show(this.settingView);

            this.$el.find('#levelTwo').removeClass('maxHeight');
            this.$el.find('#levelOne').addClass('maxHeight');

            var url = this.url + '/setting';
            Backbone.history.navigate(url);
            document.getElementsByClassName('page-title')[0].innerHTML = 'Settings';
            return false;
        },
        questionDetailsView: function(){
            // go back icon setting
            $('#forums-main .ph-back').addClass('hide');
            $('.back-icon').removeClass('hide');

            $(window).scrollTop(0);
            this.selected = 'questionDetails';

            this.$el.find('.go-back-level1 > span').html('<a>'+this.model.toJSON().group.name+'</a>');
            this.$el.find('.go-back-level2').removeClass('hide').find('span').html('Question Details');


            // $('head > title').html('Post Details | CK-12 Foundation');
            $('.nav-link-wrapper').removeClass('active');
            this.$el.find('#nav-setting').addClass('active');

            $('.mobile-use-container').css('left','-100%');
            if(!this.homeView){
                $('.mobile-use-container').css({'transition':'all 0s'});
                setTimeout(function(){
                    $('.mobile-use-container').css({'transition': ''});
                },500);
            }
            this.homeView = new ForumHomeView({model: this.model, user: this.user, isQuestionDetailsView: true, postID : this.postID});

            this.getRegion('levelTwo').show(this.homeView);

            this.$el.find('#levelTwo').removeClass('maxHeight');
            this.$el.find('#levelOne').addClass('maxHeight');


            var url = this.url + '/question/' + this.postID;
            Backbone.history.navigate(url);
            document.getElementsByClassName('page-title')[0].innerHTML = 'Post Details View';

            this.forumMobileNavView = new ForumMobileNavView({model:this.model, user: this.user});
            this.homeView.getRegion('mobileNav').show(this.forumMobileNavView);

            return false;
        },
        navigationBack: function(){
            if(this.selected === 'home'){
                this.goToforumlist();
            }else{
                this.home();
            }
        },
        goToforumlist: function(){
            this.radio.vent.trigger('goToForumList');
            return false;
        },
        deleteForum: function(){
            var forumID = this.options.forum_id;
            ForumService.deleteForum({groupID: forumID}).done(function(){
                location.href='/forums';
                window.dexterjs.logEvent('FBS_FORUM_DELETE', {
                    groupID: forumID,
                    memberID: window.ads_userid
                });
            });
        },
        cancel: function(){
            $('#deleteforumModal').foundation('reveal','close');
        },
        test: function(){
            return this.forum;
        },
        modelEvents:{
            'change': 'fieldsChanged'
        },
        fieldsChanged: function(){
            // create side nav
            this.sideView = new ForumSideNavView({
                'forum_id': this.id,
                selected_nav: this.selected,
                'isMember': this.model.toJSON().isMember,
                'forum': this.model
            });
            // this.getRegion('sideNav').show(this.sideView);
            if(this.selected === 'home'){
                if(!this.homeView){
                    this.home();
                }
            }else if(this.selected === 'member'){
                this.members();

            }else if(this.selected === 'setting'){
                this.settings();
            }else if(this.selected === 'questionDetailsView'){
                this.questionDetailsView();
            }
        },
        follow: function(){
            var model = this.model.toJSON();
            var data = {
                groupID: model.id,
                accessCode: model.group.accessCode
            };
            var self = this;
            this.user.done(function(userData){
                if(userData.isLoggedIn()){
                    ForumServices.follow(data).done(function(data){
                        self.followSuccessCallback(data);
                    }).fail(function(errorMessage){
                        ModalView.alert(errorMessage);
                    });
                }else{
                    require(['common/views/login.popup.view'], function(loginPopup){
                        loginPopup.showLoginDialogue();
                    });
                }
            });
        },
        followSuccessCallback : function(data){
            if(data.responseHeader.status === 0){
                var group = this.model.get('group');
                group.membersCount++;
                this.model.set({
                    group: group,
                    isMember: true
                });
                if(this.forumMobileNavView){
                    this.forumMobileNavView.model.set('isMember', true);
                }
                if(this.homeView && this.homeView.homeHeaderView){
                    this.homeView.homeHeaderView.model.set({'isMember' : true});
                    this.homeView.homeHeaderView.showMembers();
                }
                // this.sideView.model.set({'isMember' : true});

                if (window.peerHelp){
                    window.peerHelp.isGroupMember = true;
                }
                if (window.dexterjs){
                    window.dexterjs.logEvent('FBS_ACTION', {
                        screen_name:'forum_details',
                        action_type:'link',
                        action_name:'follow',
                        memberID: window.ads_userid,
                        groupID: this.model.id
                    });
                }
            }else if (data.responseHeader.status == 13001){
                ModalView.alert(data.response.message);
            }
        },

        unfollow: function(){
            var self = this;
            var data = {
                groupID: this.model.id
            };
            this.user.done(function(userData){
                data.memberID = userData.userInfoDetail.id;
                if(userData.userInfoDetail.id === self.model.toJSON().group.creator.authID){
                    ModalView.alert('The forum Owner can not unfollow his own forum!');
                }else{
                    ForumServices.unfollow(data).done(function(data){
                        if(data.responseHeader.status === 0){
                            var group = self.model.get('group');
                            group.membersCount--;
                            self.model.set('group', group);
                            self.model.set('isMember', false);
                            if(self.forumMobileNavView){
                                self.forumMobileNavView.model.set('isMember', false);
                            }
                            if(self.homeView && self.homeView.homeHeaderView){
                                self.homeView.homeHeaderView.model.set({'isMember' : false});
                                self.homeView.homeHeaderView.showMembers();
                            }
                            self.sideView.model.set({'isMember' : false});

                            if (window.peerHelp){
                                window.peerHelp.isGroupMember = false;
                            }
                            if (window.dexterjs){
                                window.dexterjs.logEvent('FBS_ACTION', {
                                    screen_name:'forum_details',
                                    action_type:'link',
                                    action_name:'unfollow',
                                    memberID: window.ads_userid,
                                    groupID: self.model.id
                                });
                            }
                        }
                    }).fail(function(errorMessage){
                        ModalView.alert(errorMessage);
                    });
                }
            });
        },
        share: function(data){
            var self = this;
            this.user.done(function(userData){
                var dataOptions = {
                    eventType : 'FBS_ACTION',
                    shareType : 'email',
                    _ck12: true,
                    'payload': {
                        'memberID': window.ads_userid,
                        'screen_name': 'forum_details',
                        'page': 'forum_details',
                        'action_type': 'link',
                        'action_name': 'invite_member',
                        'groupID' : self.model.id
                    },
                    'userEmail': userData.userInfoDetail.email
                };
                if (data && data.postID){
                    dataOptions.shareTitle   = self.model.toJSON().group.name;
                    dataOptions.resourceType = 'questionDiscussion';
                    dataOptions.context      = 'Share Discussion';
                    dataOptions.shareUrl     = self.root_url + 'forum/' + self.model.id + '/question/' + data.postID;
                    dataOptions.shareImage   = self.root_url + 'media/forums/images/share-pic.png';
                }else{
                    dataOptions.shareTitle   = self.model.toJSON().group.name;
                    dataOptions.resourceType = 'Discussion';
                    dataOptions.context      = 'Share this Discussion';
                    dataOptions.shareUrl     = self.root_url + 'forum/' + self.model.id + '/home';
                    dataOptions.shareImage   = self.root_url + 'media/forums/images/girl_happy.png';
                }
                if(userData.isLoggedIn()){
                    dataOptions.userSignedIn = true;
                }
                require(['common/views/share.via.email.view'], function(share){
                    share.open(dataOptions);
                });
            });
        },
        showTour: function(){
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_ACTION', {
                    screen_name: 'forum_details',
                    action_type: 'link',
                    action_name: 'how_this_works',
                    memberID: window.ads_userid,
                    groupID: this.model.id
                });
            }
            Tutorial.show(this.model.id);
        },

        forumGuideLine: function(){
            if (window.dexterjs){
                window.dexterjs.logEvent('FBS_ACTION', {
                    screen_name: 'forum_details',
                    action_type: 'link',
                    action_name: 'forum_guidelines',
                    memberID: window.ads_userid,
                    groupID: this.model.id
                });
            }
        },
        showSetting: function(){

            var model = this.model.toJSON();
            var data = {
                groupID: model.id,
                accessCode: model.group.accessCode
            };
            var self = this;
            this.user.done(function(userData){
                if(userData.isLoggedIn()){
                    ForumServices.follow(data).done(function(data){
                        self.followSuccessCallback(data);
                        if(ForumServices.validStatus(data)){
                            self.settingView.model.set('isMember', true);
                        }
                    }).fail(function(errorMessage){
                        ModalView.alert(errorMessage);
                    });
                }else{
                    require(['common/views/login.popup.view'], function(loginPopup){
                        loginPopup.showLoginDialogue();
                    });
                }
            });
            return false;
        }
    });
    return ForumsDetailView;
});
