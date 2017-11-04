define([
    'jquery',
    'groups/views/group.resources.non.zero.state.view',
    'groups/views/group.resources.zero.state.view',
    'groups/controllers/group.info',
    'groups/services/ck12.groups',
    'common/views/modal.view'
], function (
    $,
    groupResourcesNonZeroView,
    groupResourcesZeroView,
    groupInfoController,
    groupsService,
    ModalView) {
    'use strict';

    function groupResourcesController() {

        var pageContainer, callBack, groupID,
            errorShown = false;

        function actionComplete(result, id) {
            if ('error' === result) {
                console.log("Sorry, we could not perform this action right now. Please try again after some time.");
            } else if (result.hasOwnProperty('response') && result.response.hasOwnProperty('message')) {
                if (result.response.message.match('not authorized')) {
                	ModalView.alert("Sorry, you cannot perform this action for this group. Please contact customer support for further details.");
                } else if (result.response.message.match("doesn't exist")) {
                	ModalView.alert("Sorry, the resource you are trying to remove does not exist. Please try again later or contact customer support.");
                } else {
                	ModalView.alert("Sorry, we could not perform this action right now. Please try again after some time.");
                }
            } else {
                groupResourcesNonZeroView.actionComplete(id);
            }
        }

        function checkForActivityError(activity) {
            if ('error' === activity) {
                if (!errorShown) {
                    errorShown = true;
                    console.log("Sorry, we could not load your group's activities right now. Please try again after some time.");
                }
                return false;
            }
            if (0 !== activity.responseHeader.status) {
                if (activity.response.message.match('does not exist')) {
                    if (!errorShown) {
                        errorShown = true;
                        ModalView.alert('Sorry, the group you are trying to access does not exist.');
                    }
                    return false;
                }
                if (activity.response.message.match('not a member')) {
                    require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                        groupNonMemberView.render(pageContainer);
                    });
                    return false;
                }
                if (!errorShown) {
                    errorShown = true;
                    ModalView.alert("Sorry, we could not load your group's activities right now. Please try again after some time.");
                }
                return false;
            }
            return true;
        }

        function loadActivities(activity, currentTime) {
            if (checkForActivityError(activity)) {
                if ('Type' === $.trim($('#dropdown-title').text())) {
                    callBack(0, activity.response, currentTime);
                } else {
                    callBack(1, activity.response, currentTime);
                }
            }
        }

        function checkForActivity(activity, currentTime) {
            if (checkForActivityError(activity)) {
                activity = activity.response;
                if (activity.activity instanceof Array && activity.activity.length) {
                    groupResourcesNonZeroView.render(activity, currentTime, groupID);
                } else {
                    groupResourcesZeroView.render(groupID);
                }
            }
        }

        function loadResources(id) {
            id.filters = 'activityType,share;includeViewed,true';
            groupsService.getGroupActivity(checkForActivity, id);
            groupID = id.groupID;
        }

        function load(container) {
            pageContainer = container;
            groupInfoController.load(container, loadResources);
        }

        function getActivities(callback, group) {
            errorShown = false;
            callBack = callback;
            groupsService.getGroupActivity(loadActivities, group);
        }

        function unshare(data) {
            groupsService.unshare(actionComplete, data);
        }

        this.load = load;
        this.getActivities = getActivities;
        this.unshare = unshare;

    }

    return new groupResourcesController();
});