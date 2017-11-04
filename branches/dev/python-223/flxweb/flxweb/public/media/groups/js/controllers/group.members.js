define(['groups/views/group.members.view',
    'groups/controllers/group.info',
    'groups/services/ck12.groups',
    'common/views/modal.view'
], function (groupMembersView,
    groupInfoController,
    groupsService,
    ModalView) {

    'use strict';

    function groupMembersController() {

        var pageContainer,
            errorShown = false;

        function checkForMembers(members, isPaginate, role) {
            if ('error' === members) {
                if (!errorShown) {
                    errorShown = true;
                    console.log("Sorry, we could not load your group's members right now. Please try again after some time.");
                }
                members = '';
            } else if (0 !== members.responseHeader.status) {
                if (members.response.message.match('does not exist')) {
                    if (!errorShown) {
                        errorShown = true;
                        ModalView.alert('Sorry, the group you are trying to access does not exist.');
                    }
                    members = '';
                } else if (members.response.message.match('not a member')) {
                    if (!errorShown) {
                        errorShown = true;
                        require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                            groupNonMemberView.render(pageContainer);
                        });
                    }
                    members = '';
                } else {
                    if (!errorShown) {
                        errorShown = true;
                        ModalView.alert("Sorry, we could not load your group's members right now. Please try again after some time.");
                    }
                    members = '';
                }
            } else {
                groupMembersView.renderGroupMembers(members.response, isPaginate, role);
            }
        }

        function load(container) {
            pageContainer = container;
            groupInfoController.load(container, groupMembersView.render);
        }

        function removeMember(callback, group) {
            groupsService.removeMember(callback, group);
        }

        function updateMember(callback, memberID, propertiesObj){
            groupsService.updateMember(callback, memberID,  propertiesObj);
        }

        function getMembers(group, isPaginate, userRole) {
            groupsService.getGroupMembers(checkForMembers, group, isPaginate, userRole);
        }
        function compare(a, b){
            if(a.firstName+a.lastName > b.firstName+b.lastName){
                return 1;
            }
            if(a.firstName+a.lastName < b.firstName+b.lastName){
                return -1;
            }
            return 0;
        }
        function showMembers(allMembers){
            var admins = [];
            var teachers = [];
            var students = [];
            allMembers.response.members.forEach(function(member){
                if(member.groupMemberRole === 'groupadmin'){
                    admins.push(member);
                }else if(member.groupMemberRole === 'groupmember' && member.userRole === 'teacher'){
                    teachers.push(member);
                }else{
                    students.push(member);
                }
            });
            admins.sort(compare);
            allMembers.response.members = admins;
            checkForMembers(allMembers, false, 'admin');
            teachers.sort(compare);
            allMembers.response.members = teachers;
            allMembers.response.teacherCount = teachers.length;
            checkForMembers(allMembers, false, 'teacher');
            students.sort(compare);
            allMembers.response.members = students;
            allMembers.response.studentCount = students.length;
            checkForMembers(allMembers, false, 'student');
        }
        function getAllMembers(allMembers, numsOfMembers, group){
            var promises = [];
            var pageNum = 2;
            if(numsOfMembers > group.pageSize){
                var numOfPromises = Math.ceil(numsOfMembers/group.pageSize -1);
                for(var i = 0; i < numOfPromises; i++){
                    group.pageNum = pageNum++;
                    promises.push(groupsService.getGroupMembers(group));
                }
                $.when.apply($, promises).then(function() {
                    var otherPagesMembers = Array.prototype.slice.call(arguments);
                    otherPagesMembers.forEach(function(onePageMembers){
                        if(onePageMembers && onePageMembers.responseHeader && onePageMembers.responseHeader.status === 0){
                            allMembers.response.members = allMembers.response.members.concat(onePageMembers.response.members);
                        }
                    });
                    showMembers(allMembers);
                });
            }else{
                showMembers(allMembers);
            }
        }
        function getMembers(group) {
            var promise = groupsService.getGroupMembers(group);
            var promises = [];
            var allMembers = {};
            promise.done(function(pageOneMembers){
                if(pageOneMembers && pageOneMembers.responseHeader && pageOneMembers.responseHeader.status === 0){
                    var total = pageOneMembers.response.total;
                    getAllMembers(pageOneMembers, total, group);
                }
            });
        }

        this.load = load;
        this.removeMember = removeMember;
        this.getMembers = getMembers;
        this.updateMember = updateMember;

    }

    return new groupMembersController();
});
