/* global PeerHelp */
define([
    'jquery',
    'underscore',
    'backbone1x',
    'marionette',
    'common/utils/utils',
    'forums/templates/templates',
    'forums/views/home/forum.home.header.view',
    'forums/views/home/forum.about.view',
    'forums/views/home/forum.mobile.nav.view',
    'forums/views/home/no.discussion.view'
], function($, _, Backbone, Mn, utils, TMPL, ForumHomeHeaderView, ForumAboutView, ForumMobileNav, NoDiscussionView){
    'use strict';

    var ForumsHomeView = Mn.LayoutView.extend({
        template: _.template(TMPL.ForumHomeLayout),
        regions:{
            'homeHeader':'#home-header',
            'homeAbout': '#home-about',
            'mobileNav': '#mobile-side-nav-container'
        },
        initialize: function(options){
            this.user = options.user;
            var groupID = this.model.id,
                self = this,
                isGroupMember = this.model.get('isMember'),
                peerHelpConfig = {
                    'UUID': 'ck12-group-' + groupID,
                    'groupName': this.model.get('group').name,
                    'clientID': 24839961,
                    'groupID': parseInt(groupID),
                    'groupType': 'public-forum',
                    'target': '#ck12-peer-help',
                    'allowAnonymous': false,
                    'previewMode': false,
                    'guestMode': true,
                    'zeroStateEnabled': false,
                    'isGroupMember': this.model.get('isMember'),
                    'groupAccessCode': this.model.get('group').accessCode,
                    'enableTags': true,
                    'isQuestionDetailsView' : options.isQuestionDetailsView || false,
                    'postID' : options.postID,
                    'activateQuestionEditor': options.activateQuestionEditor || false
                };
            this.peerHelpConfig = peerHelpConfig;
            $(window).trigger('hide.small.navigation');
            PeerHelp.require(['peerhelp'], function (cK12PeerHelp) {
                //hide the top navigation for small breakpoints.
                //Peerhelp has its own

                window.peerHelp = new cK12PeerHelp(peerHelpConfig);

                $('#loading-icon').addClass('show');
                $('#page-disable').addClass('show');
                window.peerHelp.events.on('toggleSideMenu',function(){
                    $(window).trigger('toggle.small.navigation');
                });
                window.peerHelp.events.on('guestModeActionClicked',function(event) {
                    if(event.gesture){
                        event.gesture.srcEvent.preventDefault();
                    }
                    require(['common/views/login.popup.view'], function(loginPopup){
                        loginPopup.showLoginDialogue();
                    });
                    event.preventDefault();
                });
                window.peerHelp.events.on('postDeleted', function (postModel) {
                    if (postModel && postModel.postType !== 'question' && !self.peerHelpConfig.isQuestionDetailsView){
                        self.getRegion('homeHeader').show(self.getHeaderView());
                    }
                });
                window.peerHelp.events.on('postAdded', function (postModel) {
                    if (postModel && postModel.get('postType') !== 'question' && !self.peerHelpConfig.isQuestionDetailsView){
                        self.getRegion('homeHeader').show(self.getHeaderView());
                    }
                });
                window.peerHelp.events.on('postCountChanged', function (count) {
                    if (count == 0 && self.peerHelpConfig.isQuestionDetailsView){
                        $('#forum-info-container').addClass('hide');
                        var noDiscussionView = new NoDiscussionView({'groupID': self.model.id});
                        $('#forum-detail-container').parent().append(noDiscussionView.$el);
                        $('#forum-detail-container').addClass('hide');
                        $('.go-back-level1').on('click.goback', function(){
                            $('#no-discussion-container').remove();
                            $('#forum-info-container').removeClass('hide');
                            $('#forum-detail-container').removeClass('hide');
                            $('.go-back-level1').off('click.goback');
                        });
                        /*ModalView.alert("The question you were looking for has been deleted.", function(){
                            location.href = '/forum/' + self.model.id + '/home';
                        }, true);*/
                    }else if (self.peerHelpConfig.isQuestionDetailsView){
                        //Don't show header details for question details view
                        $('#home-header').addClass('show-for-small');
                        $('#ck12-peer-help').css({'margin-top' : 0});
                        return false;
                    }else{
                        self.getRegion('homeHeader').show(self.getHeaderView());
                    }
                });
                //peerhelp starts to load
                window.peerHelp.events.on('startLoading', function () {
                    $('#loading-icon').addClass('show');
                    $('#page-disable').addClass('show');
                });
                // peerhelp stops to load
                window.peerHelp.events.on('load', function () {
                    $('#loading-icon').removeClass('show');
                    $('#page-disable').removeClass('show');
                });
                // utils.ajaxStop();
                // window.peerHelp.events.on('profanityDetected', function (postData, sanitizeResponse) {
                //     if (dexter) {
                //         dexter.logEvent('FBS_PROFANITY_FILTER', {
                //             memberID: postData.memberID,
                //             profaneWord: sanitizeResponse.profaneWord,
                //             content: postData.content,
                //             source: 'FBS_GROUPS_Q&A',
                //             referrer: 'group_details'
                //         });
                //     }
                // });
                window.peerHelp.isGroupMember = isGroupMember;
                //Event to register for peerhelp events after peerhelp is initialized
                $.event.trigger('postInitPeerhelp');

            });
        },
        onRender: function(){
            this.homeAboutView = new ForumAboutView({model: this.model});
            this.getRegion('homeAbout').show(this.homeAboutView);
        },
        getHeaderView: function(){
            this.homeHeaderView = new ForumHomeHeaderView({
                group: this.model.get('group'),
                isMember : this.model.get('isMember'),
                user: this.user,
                type: 'home'
            });
            return this.homeHeaderView;
        }
    });
    return ForumsHomeView;
});
