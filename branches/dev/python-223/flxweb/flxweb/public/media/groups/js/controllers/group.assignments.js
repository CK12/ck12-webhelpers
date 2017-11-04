define([
        'jquery',
        'groups/views/group.assignments.non.zero.state.view',
        'groups/views/group.assignments.zero.state.view',
        'groups/controllers/group.info',
        'groups/controllers/assignment.edit',
        'groups/services/ck12.groups',
        'common/views/modal.view'
        
    ],
    function (
        $,
        groupAssignmentsNonZeroView,
        groupAssignmentsZeroView,
        groupInfoController,
        AssignmentEditController,
        groupsService,
        ModalView
        ) {

        'use strict';

        function groupAssignmentsController() {

            var pageContainer, callBack, groupID, errorShown = false;

            function checkForAction(assignment) {
                if ('error' === assignment) {
                    console.log('Sorry, we could not perform this action right now. Please try again after some time.');
                } else if (assignment.hasOwnProperty('response') && assignment.response.hasOwnProperty('message')) {
                    // Incorrect concepts provided. - no study ttracks found
                    if (assignment.responseHeader && assignment.responseHeader.status === 2052) {
                        ModalView.alert('Sorry, there was an error creating this assignment. Please contact us at <a href = "mailto:support@ck12.org">support@ck12.org</a> if you see this error again.');
                    }
                    else if (assignment.response.message.match('doesnt exist') || assignment.response.message.match('does not exist')) {
                    	ModalView.alert('Sorry, we were not able to find the assignment you are trying to perform this action on. Please try again after some time or contact our support team.');
                    } else if (assignment.response.message.match('Not authorized')) {
                    	ModalView.alert('Sorry, you are not authorized to perform this action for this group. Please try again after some time or contact our support team.');
                    } else {
                    	ModalView.alert('Sorry, we could not perform this action right now. Please try again after some time.');
                    }
                } else {
                    if (callBack) {
                        callBack();
                        callBack = '';
                    }
                }
            }

            function checkForDescendants(subjects, id) {
                if ('error' === subjects) {
                    if (!errorShown) {
                        errorShown = true;
                        console.log('Sorry, we could not load the subjects right now. Please try again after some time.');
                    }
                } else if (subjects.hasOwnProperty('response') && subjects.response.hasOwnProperty('message')) {
                    if (subjects.response.message.match('No such subject')) {
                        if (!errorShown) {
                            errorShown = true;
                            ModalView.alert('Sorry, the subject you are trying to load does not exist.');
                        }
                    } else if (!errorShown) {
                        errorShown = true;
                        ModalView.alert('Sorry, we could not load the subjects right now. Please try again after some time.');
                    }
                }
                subjects = subjects.response.branches;
                groupAssignmentsZeroView.renderBranches(subjects, id);
            }

            function checkForAssignmentError(assignment) {
                if ('error' === assignment) {
                    console.log("Sorry, we could not load your group's assignments right now. Please try again after some time.");
                    return true;
                }
                if (assignment.hasOwnProperty('response') && assignment.response.hasOwnProperty('message')) {
                    if (assignment.response.message.match('does not exist')) {
                    	ModalView.alert('Sorry, the group you are trying to access does not exist.');
                    } else if (assignment.response.message.match('not authorized')) {
                        require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                            groupNonMemberView.render(pageContainer);
                        });
                    } else {
                    	ModalView.alert("Sorry, we could not load your group's assignments right now. Please try again after some time.");
                    }
                    return true;
                }
                return false;
            }

            function checkForAssignment(assignment) {
                if (!checkForAssignmentError(assignment)) {
                    assignment = assignment.response;
                    var pageToLoad = ((assignment.total || 0) + (assignment.assignmentCompletedCount || 0)) ? groupAssignmentsNonZeroView : groupAssignmentsZeroView;
                    pageToLoad.render(assignment, groupID);
                }
            }

            function checkForMoreAssignment(assignment) {
                if (!checkForAssignmentError(assignment)) {
                    assignment = assignment.response;
                    if (callBack) {
                        callBack(assignment);
                        callBack = '';
                    }
                }
            }

            function loadAssignments(id) {
                if (!$('#group-assignments-link').length) {
                    require(['groups/views/group.wrong.link.view'], function (groupWrongLinkView) {
                        groupWrongLinkView.render(pageContainer, 'class');
                    });
                    return;
                }
                groupID = id.groupID;
                var assignment = {};
                if ($('#image-edit-link').length) {
                    assignment.sort = 'due,asc';
                    assignment.pageSize = '10';
                    groupsService.getAssignmentsForLeader(checkForAssignment, groupID, assignment);
                } else {
                    assignment.filters = 'state,upcoming;state,past-due';
                    assignment.pageSize = $('#group-assignments-count').text();
                    groupsService.getAssignmentsForMember(checkForAssignment, groupID, assignment);
                }
            }

            function load(container) {
                pageContainer = container;
                groupInfoController.load(container, loadAssignments);
            }

            function editAssignment(container, assignment) {
                AssignmentEditController.editAssignment(container, assignment);
            }

            function showNewspaper(src) {
                AssignmentEditController.showNewspaper(src);
            }

            function getBranches(id) {
                groupsService.getBranches(checkForDescendants, id);
            }

            function loadMoreAssignments(groupID, data, callback) {
                callBack = callback;
                if ($('#image-edit-link').length) {
                    groupsService.getAssignmentsForLeader(checkForMoreAssignment, groupID, data);
                } else {
                    groupsService.getAssignmentsForMember(checkForMoreAssignment, groupID, data);
                }
            }

            function assignAssignment(assignment, id, callback) {
                callBack = callback;
                groupsService.assignAssignment(checkForAction, assignment, id);
            }

            function unAssignAssignment(id, callback) {
                callBack = callback;
                groupsService.unAssignAssignment(checkForAction, id);
            }

            function updateAssignment(assignmentID, data, callback) {
                callBack = callback;
                groupsService.updateAssignment(checkForAction, data, assignmentID);
            }

            function checkForLeaderAssignment(assignment) {
                if (!checkForAssignmentError(assignment)) {
                    assignment = assignment.response;
                    groupAssignmentsNonZeroView.renderLeaderAssignmentDetails(assignment);
                }
            }

            function getLeaderAssignmentDetails(assignmentID) {
                groupsService.getLeaderAssignmentDetails(checkForLeaderAssignment, assignmentID);
            }

            function deleteAllAssignment(assignmentID, callback) {
                callBack = callback;
                groupsService.deleteAllAssignment(checkForAction, assignmentID);
            }

            function renderZeroStateForLeaderAssignments() {
                groupAssignmentsZeroView.render();
            }

            this.load = load;
            this.editAssignment = editAssignment;
            this.getBranches = getBranches;
            this.loadMoreAssignments = loadMoreAssignments;
            this.assignAssignment = assignAssignment;
            this.unAssignAssignment = unAssignAssignment;
            this.updateAssignment = updateAssignment;
            this.getLeaderAssignmentDetails = getLeaderAssignmentDetails;
            this.showNewspaper = showNewspaper;
            this.deleteAllAssignment = deleteAllAssignment;
            this.renderZeroStateForLeaderAssignments = renderZeroStateForLeaderAssignments;

        }

        return new groupAssignmentsController();
    });