define(['jquery',
    'groups/views/group.home.non.zero.state.view',
    'groups/views/group.home.zero.state.view',
    'groups/controllers/group.info',
    'groups/services/ck12.groups',
    'common/views/modal.view'
], function ($,
    groupHomeNonZeroView,
    groupHomeZeroView,
    groupInfoController,
    groupsService,
    ModalView) {

    'use strict';

    function groupHomeController() {

        var pageContainer, groupID;

        function checkForActivity(activity, currentTime) {
            if ('error' === activity) {
                console.log("Sorry, we could not load your group's activities right now. Please try again after some time or contact our support team.");
            } else if (0 !== activity.responseHeader.status) {
                if (activity.response.message.match('does not exist')) {
                	ModalView.alert('Sorry, the group you are trying to access does not exist.');
                } else if (activity.response.message.match('not a member')) {
                    require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                        groupNonMemberView.render(pageContainer);
                    });
                } else {
                	ModalView.alert("Sorry, we could not load your group's activities right now. Please try again after some time or contact our support team.");
                }
            } else {
                activity = activity.response;
                if (activity.offset > 0) {
                    groupHomeNonZeroView.loadGroupActivity(activity, currentTime);
                } else if (1 >= activity.total) {
                    if ($('#image-edit-link').length) {
                        groupHomeZeroView.render(groupID);
                    } else {
                    	ModalView.alert('This page is available only for group leaders at this time. Please try again after some time or contact our support team.');
                    }
                } else {
                    groupHomeNonZeroView.render(activity, currentTime, groupID);
                }
            }
        }

        function loadActivities(group) {
            groupsService.getGroupActivity(checkForActivity, group);
            groupID = group.groupID;
        }

        function load(container) {
            pageContainer = container;
            groupInfoController.load(container, loadActivities);
        }

        this.load = load;
        this.loadActivities = loadActivities;

    }

    return new groupHomeController();
});