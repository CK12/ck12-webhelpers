define(['jquery', 'common/utils/utils'], function ($, util) {
    'use strict';

    var groupReportsController;
    require(['groups/controllers/group.reports'], function (controller) {
        groupReportsController = controller;
    });

    function groupReportsView() {
        var conceptListTemplate = '';

        function getConceptInfo(assignmentID, conceptEncodedID, memberID) {
            var conceptInfo = {};
            if (groupReportsController.isGroupLeader()) {
                conceptInfo.studentID = memberID;
                conceptInfo.groupID = groupReportsController.getGroupInfo().id;
            }
            $.each(groupReportsController.getAssignmentsList(), function (index, assignment) {
                if (assignmentID === assignment.assignmentID) {
                    $.each(assignment.concepts, function (conceptIndex, concept) {
                        // If a practice modality is assigned, we may need to get the EID from domains array.
                        concept.encodedID = concept.encodedID || (concept.domains && concept.domains[0] && concept.domains[0].encodedID);
                        if ((concept.encodedID && conceptEncodedID === concept.encodedID.toString()) || (concept.id && conceptEncodedID === concept.id.toString()) ) {
                            conceptInfo.encodedID = concept.encodedID;
                            conceptInfo.assignmentID = assignment.assignmentID;
                            conceptInfo.assignmentName = assignment.name;
                            conceptInfo.conceptName = concept.name;
                            conceptInfo.conceptType = concept.type;
                            conceptInfo.conceptHandle = concept.handle;
                            conceptInfo.realm = concept.login;
                            conceptInfo.conceptId = concept.id;
                            if (concept.collectionHandle) {
                                conceptInfo.collectionHandle = concept.collectionHandle;
                                conceptInfo.conceptCollectionHandle = concept.conceptCollectionHandle;
                                conceptInfo.collectionCreatorID = concept.collectionCreatorID;
                                conceptInfo.conceptCollectionTitle = concept.conceptCollectionTitle
                            }
                            if(concept.type === 'asmtquiz') {
                                conceptListTemplate = groupReportsController.renderconeptListForQuiz(concept.domains);
                                conceptListTemplate = '<ul class="quiz-concept-list hide">' + conceptListTemplate + '</ul>';
                            }
                            return false;
                        }
                    });
                    return false;
                }
            });
            return conceptInfo;
        }

        function deactivateReportsInLeftNavigation() {
            $('ul.side-nav li a')
                .off('click.home-links').on('click.home-links', function (event) {
                    if ($(this).parent().hasClass('active')) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }).filter('#group-reports-link').css({
                    'color': '#56544d',
                    'cursor': 'default'
                });
        }
        function getPracticeHandleForEID(eid){

        }
        function routeView(data) {
            var conceptInfo,
                routeViewVar = location.hash;
            deactivateReportsInLeftNavigation();
            if (routeViewVar && routeViewVar.indexOf('#concept') !== -1) {
                conceptInfo = null;
                if (!data) {
                    routeViewVar = routeViewVar.split('/');
                    conceptInfo = getConceptInfo(parseInt(routeViewVar[1]), routeViewVar[2], parseInt(routeViewVar[3]));
                } else {
                    conceptInfo = data.conceptInfo;
                }
                if ((!groupReportsController.isGroupLeader()) && routeViewVar[3]) {
                    location.hash = routeViewVar[0] + '/' + routeViewVar[1] + '/' + routeViewVar[2];
                }
                groupReportsController.getPracticeHandleForEID({
                	'eid':conceptInfo.encodedID,
                	'success':function(response){
                		conceptInfo.practiceHandle = response.test && response.test.handle; //adding practice handle for bug 54152
                		groupReportsController.loadConceptView(conceptInfo, $(conceptListTemplate));
                	},
                	'error':function(response){
                		groupReportsController.loadConceptView(conceptInfo, $(conceptListTemplate));
                	}
                })
            } else if (routeViewVar && routeViewVar.indexOf('#assignment') !== -1) {
                routeViewVar = routeViewVar.split('/');
                groupReportsController.loadMemberView(parseInt(routeViewVar[1]));
            } else {
                if (groupReportsController.isGroupLeader()) {
                    groupReportsController.loadReportView();
                } else {
                    groupReportsController.loadMemberView();
                }
            }
        }

        function bindEvents() {
            $(window).off('popstate.reports').on('popstate.reports', function (event) {
                routeView(event.state);
            });
        }

        //This is wrapper for group reports to support browser back button with in group report pages
        function render() {
            routeView();
            util.ajaxStop();
            bindEvents();
        }

        this.render = render;

    }
    return new groupReportsView();
});
