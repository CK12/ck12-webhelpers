define([
        'jquery',
        'groups/views/reports/group.reports.view',
        'groups/views/reports/group.reports.leader.non.zero.state.view',
        'groups/views/reports/group.reports.leader.zero.state.view',
        'groups/views/reports/group.reports.member.non.zero.state.view',
        'groups/views/reports/group.reports.member.zero.state.view',
        'groups/views/reports/group.reports.concept.view',
        'groups/controllers/group.info',
        'groups/controllers/assignment.edit',
        'groups/services/ck12.groups',
        'common/views/modal.view'
    ],
    function (
        $,
        groupReportsView,
        groupReportsLeaderNonZeroView,
        groupReportsLeaderZeroView,
        groupReportsMemberNonZeroView,
        groupReportsMemberZeroView,
        groupReportsConceptView,
        groupInfoController,
        assignmentEditController,
        groupsService,
        ModalView) {

        'use strict';

        function groupReportsController() {

            var pageContainer,
                groupInfo,
                currentMemberID,
                membersList,
                assignmentsList,
                memberScoresList,
                groupLeader,
                pageNum,
                pageSize, totalMemberCount;

            function checkForReport(report) {
                if ('error' === report) {
                    console.log("Sorry, we could not load groups report right now. Please try again after some time.");
                } else if (0 !== report.responseHeader.status) {
                    if (report.response.message && report.response.message.match("doesn't exist")) {
                    	ModalView.alert('Sorry, the group you are trying to access does not exist.');
                    } else if (report.response.message && report.response.message.match('not in group').length) {
                        require(['groups/views/group.non.member.view'], function (groupNonMemberView) {
                            groupNonMemberView.render(pageContainer);
                        });
                    } else {
                    	ModalView.alert("Sorry, we could not load groups report right now. Please try again after some time.");
                    }
                } else {
                    report = report.response;
                    setData(report);
                    groupReportsView.render();
                    /*if (report && report.assignments.length && report.groupMembers.length){
                        setData(report);
                        if (isGroupLeader()){
                            //Render Group Leader non zero state view
                            groupReportsLeaderNonZeroView.render(report.groupMembers, report.assignments, report.member_assignment);
                        }else{
                            //Render Group member non zero state view
                            loadMemberView(currentMemberID);
                        }
                    }else {
                        if (isGroupLeader()){
                            //Render Group Leader zero state view
                            groupReportsLeaderZeroView.render();
                        }else{
                            //Render Group member zero state view
                            groupReportsMemberZeroView.render();
                        }
                    }*/
                }
            }

            function loadConceptView(conceptInfo, conceptListHtml){
                var memberInfo = null;
                var memberID = conceptInfo.studentID || getCurrentMemberID();
                $.each(membersList, function(index, member){
                    if (parseInt(member.id, 10) === parseInt(memberID, 10)){
                        memberInfo = member;
                        return false;
                    }
                });
                if (!conceptInfo || (!conceptInfo.encodedID && !(conceptInfo.conceptType === 'asmtquiz'))){
                    require(['groups/views/group.wrong.link.view'], function (groupWrongLinkView) {
                        groupWrongLinkView.render(pageContainer, 'class', 'group-reports-link');
                    });
                    return false;
                }
                groupReportsConceptView.render(memberInfo, conceptInfo, conceptListHtml);
            }

            function loadReportView(){
                if (getAssignmentsList().length && getMembersList().length && isGroupLeader()){
                    //Render Group Leader non zero state view
                    groupReportsLeaderNonZeroView.render(getMembersList(), getAssignmentsList(), getMemberScoresList());
                }else if (isGroupLeader()){
                    groupReportsLeaderZeroView.render();
                }else{
                    require(['groups/views/group.wrong.link.view'], function (groupWrongLinkView) {
                        groupWrongLinkView.render(pageContainer, 'class', 'group-reports-link');
                    });
                    return false;
                }
            }

            function loadMemberView(memberID){
                if (!memberID){
                    memberID = getCurrentMemberID();
                }
                //Render Group Leader non zero state view
                var memberInfo = null;
                $.each(membersList, function(index, member){
                    if (parseInt(member.id, 10) === parseInt(memberID, 10)){
                        memberInfo = member;
                        return false;
                    }
                });
                if (!memberInfo){
                    require(['groups/views/group.wrong.link.view'], function (groupWrongLinkView) {
                        groupWrongLinkView.render(pageContainer, 'class', 'group-reports-link');
                    });
                    return false;
                }
                if (getAssignmentsList().length && getMembersList().length){
                    groupReportsMemberNonZeroView.render(memberInfo, getAssignmentsList(), getMemberScoresList(),membersList);
                }else if (! isGroupLeader()){
                    groupReportsMemberZeroView.render();
                }
            }

            function setGroupInfo(group){
                groupInfo = group;
            }

            function getGroupInfo(){
                return groupInfo;
            }

            function setMemberScoresList(memberScores){
                memberScoresList = memberScores;
            }

            function getMemberScoresList(){
                return memberScoresList;
            }

            function setMembersList(members){
                membersList = members;
                pageSize = members.length;
            }

            function getMembersList(){
                return membersList;
            }

            function setAssignmentsList(assignments){
                assignmentsList = assignments;
            }

            function getAssignmentsList(){
                return assignmentsList;
            }

            function isGroupLeader(){
                return groupLeader;
            }

            function setGroupLeader(isGroupLeader){
                groupLeader = isGroupLeader;
            }

            function setPageNum(page){
                pageNum = page;
            }

            function getPageNum(){
                return pageNum || 1;
            }

            function getPageSize(){
                return pageSize || 10;
            }

            function getCurrentMemberID(){
                return currentMemberID;
            }

            function setTotalMemberCount(membersSize){
                totalMemberCount = membersSize;
            }

            function getTotalMemberCount(){
                return totalMemberCount;
            }

            function setData(report){
                setAssignmentsList(report.assignments);
                setMembersList(report.groupMembers);
                setMemberScoresList(report.member_assignment);
                setTotalMemberCount(report.total);
            }

            function loadData(callBackFunction){
                var group = {groupID : getGroupInfo().id};
                if (! isGroupLeader()){
                    group.memberID = currentMemberID;
                } else {
			var member = isMemberView();
			if (member && member !=='-1'){
			    group.memberID = member;
			}
		}
                group.pageSize = 0;
                group.pageNum = getPageNum();
                groupsService.getGroupAssignmentReport(callBackFunction, group);
            }

            function loadReports(groupInfo, groupLeader) {
                if (!$('#group-reports-link').length) {
                    require(['groups/views/group.wrong.link.view'], function (groupWrongLinkView) {
                        groupWrongLinkView.render(pageContainer, 'class');
                    });
                    return;
                }
                setGroupLeader(groupLeader);
                setGroupInfo(groupInfo);
                loadData(checkForReport);
            }

            function load(container, memberID) {
                pageContainer = container;
                currentMemberID = memberID;
                groupInfoController.load(container, loadReports, false, true);
            }

            function editAssignment(container) {
                assignmentEditController.editAssignment(container);
            }

            function renderconeptListForQuiz(concepts) {
                return groupReportsConceptView.renderconceptList(concepts);
            }

            function showNewsPaperForReport(handle, parentHandle) {
                assignmentEditController.showNewspaper(handle, parentHandle);
            }

	    /*
	     * Check the page url to see if it is a member assignment view
	     * i.e (/group-reports/2550/#assignment/672520)
	     * True:
	     *   return (string) - memberID or '-1' if not found or parse issue
	     * False:
	     *   return (boolean) - fasle
	     */
	    function isMemberView(){
		var match, re = /^.*\/group-reports\/\d*\/#assignment\/(\d+)/;
		match = re.exec(window.location.href);
		if (match && match.length) {
			if (match.length > 1) {
			    return match[1];
			} else return '-1';
		}
		else return false;
	    }
	    function getPracticeHandleForEID(options){
	    	groupsService.getPracticeHandleForEID(options);
	    }

            this.load = load;
            this.loadMemberView = loadMemberView;
            this.loadReportView = loadReportView;
            this.getPageNum = getPageNum;
            this.setPageNum = setPageNum;
            this.getPageSize = getPageSize;
            this.loadData = loadData;
            this.getGroupInfo = getGroupInfo;
            this.editAssignment = editAssignment;
            this.isGroupLeader = isGroupLeader;
            this.getCurrentMemberID = getCurrentMemberID;
            this.loadConceptView = loadConceptView;
            this.getTotalMemberCount = getTotalMemberCount;
            this.getAssignmentsList = getAssignmentsList;
            this.setData = setData;
            this.renderconeptListForQuiz = renderconeptListForQuiz;
            this.showNewsPaperForReport = showNewsPaperForReport;
            this.getPracticeHandleForEID = getPracticeHandleForEID;
        }

        return new groupReportsController();
    });
