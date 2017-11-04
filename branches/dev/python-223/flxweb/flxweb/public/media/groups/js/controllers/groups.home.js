define(['jquery','groups/views/groups.empty.view', 'groups/views/groups.home.view', 'groups/services/ck12.groups','common/views/modal.view'], function ($, groupsEmptyView, groupsHomeView, groupsService,ModalView) {
    'use strict';

    function groupsHomeController() {

        var currentView;
        var pageSize = 8;

        function checkForResendEmail(result) {
            if ('error' === result) {
            	ModalView.alert('Sorry, we could not resend the verification mail right now. Please try again after some time.');
                result = '';
            } else if (result.hasOwnProperty('response')) {
                result = result.response;
                if (result.hasOwnProperty('message')) {
                	ModalView.alert('Sorry, we could not resend the verification mail right now. Please try again after some time.');
                    result = '';
                } else {
                    currentView.emailSent(result);
                }
            } else {
            	ModalView.alert('Sorry, we could not resend the verification mail right now. Please try again after some time.');
            }
        }

        function checkForGroupsError(groups) {
            if ('error' === groups) {
                console.log('Sorry, we could not load your groups right now. Please try again after some time.');
            } else if (0 !== groups.responseHeader.status) {
            	ModalView.alert('Sorry, we could not load your groups right now. Please try again after some time.');
                groups = 'error';
            } else {
                groups = groups.response;
                if (groups.total > groups.limit + groups.offset) {
                    var pageNum = parseInt(groups.offset, 10) / pageSize + 2;
                    pageNum = {
                        'pageNum': pageNum,
                        'pageSize': pageSize
                    };
                    getGroups(pageNum);
                }
                groups = groups.groups;
            }
            return groups;
        }

        function checkForGroups(groups, currentTime) {
            groups = checkForGroupsError(groups);
            groups = 'error' === groups ? '' : groups;
            groupsHomeView.renderGroups(groups, currentTime);
        }

        function loadGroups(groups, currentTime, container) {
            groups = checkForGroupsError(groups);
            if ('error' !== groups) {
                if (groups instanceof Array && groups.length) {
                    currentView = groupsHomeView;
                    groupsHomeView.render(groups, container, currentTime);
                } else {
                    currentView = groupsEmptyView;
                    getImagesForCreateGroup().done(function (images) {
                        groupsEmptyView.render(container, images);
                    });
                }
            }
        }

        function getGroups(groups) {
            groupsService.getGroups(checkForGroups, undefined, groups);
        }

        function getImagesForCreateGroup() {
            return groupsService.getImages();
        }

        function getSubjectsForCreateGroup(){
            return $.when(
                groupsService.getBranches(null, 'sci'),
                groupsService.getBranches(null, 'mat'),
                groupsService.getBranches(null, 'ela')
            ).then(function(){
                var args = Array.prototype.slice.apply(arguments);
                return args.reduce(function(obj, next){
                    var branches = next.response.branches,
                        subject  = branches[0].subject.name;

                    obj[subject] = branches;
                    return obj;
                }, {});
            });
        }

        function load(container) {
            groupsService.getGroups(loadGroups, container, {pageSize: pageSize});
        }

        function createGroup(callback, group) {
            groupsService.createGroup(callback, group);
        }

        function joinGroup(callback, group) {
            groupsService.joinGroup(callback, group);
        }

        function getGroupMenu(callback, group) {
            groupsService.getGroupInfo(callback, group);
        }

        function resendVerficationEmail() {
            groupsService.resendVerficationEmail(checkForResendEmail);
        }

        this.load = load;
        this.getGroups = getGroups;
        this.createGroup = createGroup;
        this.joinGroup = joinGroup;
        this.getGroupMenu = getGroupMenu;
        this.getImagesForCreateGroup = getImagesForCreateGroup;
        this.getSubjectsForCreateGroup = getSubjectsForCreateGroup;
        this.resendVerficationEmail = resendVerficationEmail;

    }

    return new groupsHomeController();
});
