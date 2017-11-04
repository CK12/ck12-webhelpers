define(['groups/views/group.settings.view',
    'groups/controllers/group.info',
    'groups/services/ck12.groups',
    'common/views/modal.view'
], function (groupSettingsView,
    groupInfoController,
    groupsService,
    ModalView) {
    'use strict';

    function groupSettingsController() {

        var pageContainer, groupInfoDetails;

        function nonMember() {
            require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                groupNonMemberView.render(pageContainer);
            });
        }

        function checkForNotifications(notifications) {
            if ('error' === notifications) {
                console.log('Sorry, we were not able to get your email notifications settings. Please try again later');
                notifications = '';
            } else if (0 !== notifications.responseHeader.status) {
                if (notifications.response.message.match('not a member')) {
                    nonMember();
                    notifications = '';
                } else {
                	ModalView.alert('Sorry, we were not able to get your email notifications settings. Please try again later');
                    notifications = '';
                }
            } else {
                notifications = notifications.response.notifications;
                groupSettingsView.render(notifications, groupInfoDetails);
            }
        }

        function loadNotifications(groupInfo) {
            groupsService.getNotifications(checkForNotifications, groupInfo);
            groupInfoDetails = groupInfo;
        }

        function load(container) {
            pageContainer = container;
            groupInfoController.load(container, loadNotifications, false, true);
        }

        function deleteGroup(callback, group) {
            groupsService.deleteGroup(callback, group);
        }

        function updateNotifications(group, callback) {
            groupsService.updateNotifications(group, callback);
        }

        function updateQAsettings(group, callback) {
            groupsService.updateQAsettings(group, callback);
        }


        this.load = load;
        this.deleteGroup = deleteGroup;
        this.updateNotifications = updateNotifications;
        this.nonMember = nonMember;
        this.updateQAsettings = updateQAsettings;

    }

    return new groupSettingsController();
});