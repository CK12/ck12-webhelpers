define([
        'groups/views/assignment.edit.view',
        'groups/services/ck12.groups',
        'common/views/modal.view'
    ],
    function (AssignmentEditView, groupsService, ModalView) {

        'use strict';

        function AssignmentEditController() {

            var errorShown = false;

            function checkForResult(result) {
                if (result.hasOwnProperty('response')) {
                    result = result.response;
                    if (result.hasOwnProperty('message')) {
                        result = '';
                    }
                } else {
                    result = '';
                }
                return result;
            }

            function checkForQuiz(result) {
                result = checkForResult(result);
                if (result) {
                    AssignmentEditView.renderQuizes(result);
                } else {
                	ModalView.alert('Sorry, we could not load your quizzes right now. Please try again after some time.');
                }
            }

            function checkForDelete(assignment) {
                if ('error' === assignment) {
                    console.log('Sorry, we could not perform this action right now. Please try again after some time.');
                } else if (assignment.hasOwnProperty('response')) {
                    assignment = assignment.response;
                    if (assignment.hasOwnProperty('message')) {
                        if (assignment.message.match('doesnt exist') || assignment.message.match('does not exist')) {
                        	ModalView.alert('Sorry, we were not able to find the assignment you are trying to perform this action on. Please try again after some time or contact our support team.');
                        } else {
                        	ModalView.alert('Sorry, we could not perform this action right now. Please try again after some time.');
                        }
                    } else {
                        AssignmentEditView.deleteComplete();
                    }
                }
            }

            function checkForAction(assignment, data, id) {
                if ('error' === assignment) {
                    console.log('Sorry, we could not perform this action right now. Please try again after some time.');
                } else if (assignment.hasOwnProperty('response')) {
                    // Incorrect concepts provided. - no study ttracks found
                    if (assignment.responseHeader && assignment.responseHeader.status === 2052) {
                        ModalView.alert('Sorry, there was an error creating this assignment. Please contact us at <a href = "mailto:support@ck12.org">support@ck12.org</a> if you see this error again.');
                        return;
                    }
                    assignment = assignment.response;
                    if (assignment.hasOwnProperty('message')) {
                        if (assignment.message.match('doesnt exist') || assignment.message.match('does not exist')) {
                        	ModalView.alert('Sorry, we were not able to find the assignment you are trying to perform this action on. Please try again after some time or contact our support team.');
                        } else if (assignment.message.match('Not authorized')) {
                        	ModalView.alert('Sorry, you are not authorized to perform this action. Please try again after some time or contact our support team.');
                        } else if (assignment.message.match('exists already') || assignment.message.match('Duplicate entry')) {
                            AssignmentEditView.showDuplicateNameError();
                        } else {
                        	ModalView.alert('Sorry, we could not perform this action right now. Please try again after some time.');
                        }
                    } else {
                        AssignmentEditView.updateComplete(data, id);
                    }
                }
            }

            function checkForSearch(search) {
                if ('error' === search) {
                    console.log('Sorry, we cannot perform this search right now. Please try again later.');
                } else if (search.hasOwnProperty('response') && search.response.hasOwnProperty('message')) {
                	ModalView.alert('Sorry, we cannot perform this search right now. Please try again later.');
                } else {
                    AssignmentEditView.renderSearch(search.response);
                }
            }

            function checkForAssignments(assignment) {
                if ('error' === assignment) {
                    console.log('Sorry, we could not save this assignment right now. Please try again after some time.');
                } else if (assignment.hasOwnProperty('response')) {
                    // Incorrect concepts provided. - no study ttracks found
                    if (assignment.responseHeader && assignment.responseHeader.status === 2052) {
                        ModalView.alert('Sorry, there was an error creating this assignment. Please contact us at <a href = "mailto:support@ck12.org">support@ck12.org</a> if you see this error again.');
                        return;
                    }
                    assignment = assignment.response;
                    if (assignment.hasOwnProperty('message')) {
                        if (assignment.message.match('exists already')) {
                            AssignmentEditView.showDuplicateNameError();
                        } else {
                        	ModalView.alert('Sorry, we could not save this assignment right now. Please try again after some time.');
                        }
                    } else {
                        AssignmentEditView.saveComplete(assignment.assignment);
                    }
                }
            }

            function getDate(date) {
                if (!date) {
                    return '';
                }
                var temp;
                date = date.split('/');
                temp = parseInt(date[2], 10);
                if (2000 > temp) {
                    temp += 2000;
                }
                date[2] = date[0];
                date[0] = temp;
                temp = date[2];
                date[2] = date[1];
                date[1] = temp;
                date = date.join('-');
                return date;
            }

            function checkForAssignAssignment(assignment) {
                if ('error' === assignment) {
                    console.log('Sorry, we could not perform this action right now. Please try again after some time.');
                } else if (assignment.hasOwnProperty('response') && assignment.response.hasOwnProperty('message')) {
                    if (assignment.response.message.match('doesnt exist') || assignment.response.message.match('does not exist')) {
                    	ModalView.alert('Sorry, we were not able to find the assignment you are trying to perform this action on. Please try again after some time or contact our support team.');
                    } else if (assignment.response.message.match('Not authorized')) {
                    	ModalView.alert('Sorry, you are not authorized to perform this action for this group. Please try again after some time or contact our support team.');
                    } else {
                    	ModalView.alert('Sorry, we could not perform this action right now. Please try again after some time.');
                    }
                } else {
                  AssignmentEditView.closeAssignmentModal();
                }
            }

            function checkForCreateAndAssignAssignments(assignment, payload) {
                if ('error' === assignment) {
                    console.log('Sorry, we could not save this assignment right now. Please try again after some time.');
                } else if (assignment.hasOwnProperty('response')) {
                    // Incorrect concepts provided. - no study ttracks found
                    if (assignment.responseHeader && assignment.responseHeader.status === 2052) {
                        ModalView.alert('Sorry, there was an error creating this assignment. Please contact us at <a href = "mailto:support@ck12.org">support@ck12.org</a> if you see this error again.');
                        return;
                    }
                    assignment = assignment.response;
                    if (assignment.hasOwnProperty('message')) {
                        if (assignment.message.match('exists already')) {
                            AssignmentEditView.showDuplicateNameError();
                        } else {
                        	ModalView.alert('Sorry, we could not save this assignment right now. Please try again after some time.');
                        }
                    } else {
                        AssignmentEditView.saveComplete(assignment.assignment);
                        var assignment_id = assignment.assignment.id;
                        var id_param = assignment_id + "/" + payload.group_id;
                        var due = {};
                        due.due = getDate(payload.due);
                        groupsService.assignAssignment(checkForAssignAssignment, due, id_param);
                    }
                }
            }

            function checkForDescendantError(subjects) {
                if ('error' === subjects) {
                    if (!errorShown) {
                        errorShown = true;
                        console.log('Sorry, we could not load the subjects right now. Please try again after some time.');
                    }
                    return true;
                }
                if (subjects.hasOwnProperty('response') && subjects.response.hasOwnProperty('message')) {
                    if (subjects.response.message.match('No such subject')) {
                        if (!errorShown) {
                            errorShown = true;
                            ModalView.alert('Sorry, the subject you are trying to load does not exist.');
                        }
                    } else if (!errorShown) {
                        errorShown = true;
                        ModalView.alert('Sorry, we could not load the subjects right now. Please try again after some time.');
                    }
                    return true;
                }
                errorShown = false;
                return false;
            }

            function checkForSubjects(subjects, id) {
                if (!checkForDescendantError(subjects)) {
                    subjects = subjects.response.branches;
                    AssignmentEditView.renderBranches(subjects, id);
                }
            }

            function getBranches(id) {
                groupsService.getBranches(checkForSubjects, id);
            }

            function getBranchesLms(id, checkForSubjectsNew) {
                groupsService.getBranches(checkForSubjectsNew, id);
            }

            function editAssignment(container, assignment) {
                AssignmentEditView.render(container, assignment);
            }

            function checkForDescendants(subjects) {
                if (!checkForDescendantError(subjects)) {
                    subjects = subjects.response;
                    AssignmentEditView.renderDescendants(subjects);
                }
            }

            function checkForRecommendationError(concepts) {
                if ('error' === concepts) {
                    if (!errorShown) {
                        errorShown = true;
                        console.log('Sorry, we could not load recommendations right now.');
                    }
                    return true;
                }
                errorShown = false;
                return false;
            }

            function checkForRecommendations(concepts, update) {
                  if (!checkForRecommendationError(concepts)){
                    	AssignmentEditView.renderRecommendations(concepts, update);
                  }
            }

            function getDescendants(id) {
                errorShown = false;
                groupsService.getDescendants(checkForDescendants, id);
            }

            function getDescendantsLms(id, checkForDescendantsNew) {
                errorShown = false;
                groupsService.getDescendants(checkForDescendantsNew, id);
            }

            function getCollection(collectionData, checkForDescendantsNew) {
                errorShown = false;
                groupsService.getCollection(checkForDescendantsNew, collectionData);
            }

            function getModalitiesCountLms(collectionData, callback){
                errorShown = false;
                groupsService.getModalitiesCount(callback, collectionData);
            }

            function getModalities(id) {
                errorShown = false;
                groupsService.getModalities(checkForDescendants, id);
            }

            function getModalitiesLms(id, checkForDescendantsNew) {
                errorShown = false;
                groupsService.getModalities(checkForDescendantsNew, id);
            }

            function createAssignment(assignment) {
                groupsService.createAssignment(checkForAssignments, assignment);
            }

            function createAndAssignAssignment(assignment) {
              groupsService.createAssignment(checkForCreateAndAssignAssignments, assignment);
            }

            function search(value, pageNum) {
                groupsService.search(checkForSearch, value, pageNum);
            }

            function searchLms(checkForSearch, value) {
                groupsService.search(checkForSearch, value);
            }

            function updateAssignment(data, assignmentID) {
                groupsService.updateAssignment(checkForAction, data, assignmentID);
            }

            function showNewspaper(src, filters) {
                AssignmentEditView.showNewspaper(src, filters);
            }

            function deleteAllAssignment(assignmentID) {
                groupsService.deleteAllAssignment(checkForDelete, assignmentID);
            }

            function getMyQuizes(data) {
                groupsService.getMyQuizes(checkForQuiz, data);
            }

            function getAssignmentReccomendation(data, update) {
                data.update = update;
                groupsService.getAssignmentReccomendation(checkForRecommendations, data);
            }

            this.editAssignment = editAssignment;
            this.getBranches = getBranches;
            this.getDescendants = getDescendants;
            this.getCollection = getCollection;
            this.getModalitiesCountLms = getModalitiesCountLms;
            this.getModalities = getModalities;
            this.createAssignment = createAssignment;
            this.search = search;
            this.updateAssignment = updateAssignment;
            this.showNewspaper = showNewspaper;
            this.deleteAllAssignment = deleteAllAssignment;
            this.searchLms = searchLms;
            this.getBranchesLms = getBranchesLms;
            this.getDescendantsLms = getDescendantsLms;
            this.getModalitiesLms = getModalitiesLms;
            this.getMyQuizes = getMyQuizes;
            this.getAssignmentReccomendation = getAssignmentReccomendation;
            this.createAndAssignAssignment = createAndAssignAssignment;
        }
        return new AssignmentEditController();
    });
