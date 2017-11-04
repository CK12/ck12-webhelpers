define(['jquery', 'common/utils/utils', 'common/views/modal.view', 'common/utils/user'], function ($, util, ModalView, User) {

    'use strict';

    function groupDiscussionView() {

        function render(config) {

            // collect configuration options here
            var groupID = config.groupInfo.id,
            	ck12PeerHelpClientID = 24839961,
                allowAnonymous = config.groupInfo.allowAnonymous,
                groupName = config.groupInfo.name;
            var self = this;

            $('#group-discussions-link').addClass('cursor-default').parent().addClass('active');
            require(['text!groups/templates/group.discussion.html'], function (pageTemplate) {
                $('#group-details-container').append(pageTemplate);
                if(config.groupInfo.enableQA === false) {
                    ModalView.alert('Sorry, Q&A feature is disabled for this group');
                    $('#group-discussions-count').remove();
                    return;
                }

                $.ajax({
                    type: 'GET',
                    url: '/flx/group/activity?groupID=' + groupID,
                    dataType: 'json',
                    success: function (data) {
                        var dataParsed = data;
                        if (dataParsed.response.message &&
                            dataParsed.response.message.match('not a member')) {
                            require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                                groupNonMemberView.render(document.body);
                            });
                            return false;
                        }
                        var peerHelpConfig = {
                            UUID: 'ck12-group-' + groupID,
                            groupName: groupName,
                            clientID: ck12PeerHelpClientID,
                            groupID: groupID,
                            groupType: 'CLASS',
                            target: '#ck12-peer-help',
                            allowAnonymous: allowAnonymous,
                            zeroStateEnabled: false
                        };
                        PeerHelp.require(['peerhelp'], function (cK12PeerHelp) {
                            User.getUser().done(function(userData){
                                if(userData.isLoggedIn()){
                                    userData.getAppData('groups').done(function(data){
                                        var newGroupData = {
                                            tutorialShown:true
                                        };
                                        if(data.responseHeader.status === 0){
                                            if(!data.response.userdata.tutorialShown){
                                                peerHelpConfig.zeroStateEnabled = true;
                                                userData.setAppData('groups',newGroupData);
                                            }
                                        }else if(data.responseHeader.status === 6006){
                                            peerHelpConfig.zeroStateEnabled = true;
                                            userData.setAppData('groups',newGroupData);
                                        }
                                        //hide the top navigation for small breakpoints.
                                        //Peerhelp has its own
                                        $(window).trigger('hide.small.navigation');
                                        window.peerHelp = new cK12PeerHelp(peerHelpConfig);
                                        window.peerHelp.events.on('toggleSideMenu',function(){
                                            $(window).trigger('toggle.small.navigation');
                                        });
                                        window.peerHelp.events.on('postCountChanged', function (count) {
                                            //$('#group-discussions-count').html(count);
                                            var phFilters = {
                                                groupIDs: [groupID]
                                            };
                                            phFilters = JSON.stringify(phFilters);
                                            $.ajax({
                                                type: 'GET',
                                                url: '/peerhelp/api/get/posts?clientID=' + ck12PeerHelpClientID + '&filters=' + phFilters,
                                                success: function (data) {
                                                    if (data.response.total !== undefined) {
                                                        $('#group-discussions-count').html(data.response.total);
                                                    }
                                                },
                                                error: function () {
                                                    $('#group-discussions-count').html(count);
                                                    console.log('error in Q&A GET');
                                                }
                                            });
                                        });
                                        util.ajaxStop();
                                        window.peerHelp.events.on('profanityDetected', function (postData, sanitizeResponse) {
                                            if (dexter) {
                                                dexter.logEvent('FBS_PROFANITY_FILTER', {
                                                    memberID: postData.memberID,
                                                    profaneWord: sanitizeResponse.profaneWord,
                                                    content: postData.content,
                                                    source: 'FBS_GROUPS_Q&A',
                                                    referrer: 'group_details'
                                                });
                                            }
                                        });
                                        window.peerHelp.events.on('showMobileHeader',function(){
                                            $(window).trigger('show.small.navigation');
                                            $('.title-area > .ph-back').removeClass('hide');
                                        });
                                        //peerhelp starts to load
                                        window.peerHelp.events.on('startLoading', function () {
                                            $('#loading-icon').addClass('show');
                                            $('#page-disable').removeClass('hide');
                                        });
                                        // peerhelp stops to load
                                        window.peerHelp.events.on('load', function () {
                                            $('.js-loading-icon').removeClass('show');
                                            $('.js-page-disable').addClass('hide');
                                        });
                                    });
                                }
                            });
                        });
                    },
                    error: function (jqXHR, status, error) {
                        console.log(status, error);
                        ModalView.alert("Sorry, we could not load your group's activities right now. Please try again after some time.");
                    }
                });
            });
        }
        this.render = render;

    }
    return new groupDiscussionView();
});
