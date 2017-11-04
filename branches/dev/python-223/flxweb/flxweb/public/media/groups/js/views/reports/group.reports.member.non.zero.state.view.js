define(['jquery', 'underscore'], function ($, _) {
    'use strict';

    var groupReportsController;
    require(['groups/controllers/group.reports'], function (controller) {
        groupReportsController = controller;
    });

    function groupReportsMemberNonZeroView() {

        var pageTemplate, studentID;

        function bindEvents() {
            //Event Binding
            $('.concept-container #concept-name').off('click.concept').on('click.concept', function(event){
                var conceptInfo = {},
                	lastAccessDate = $(this).data("last-access-date") || "",
                    $this = $(this),
                    concept_id;
                if ($this.find('a').hasClass('hide')){
                    return false;
                }
                conceptInfo.encodedID = $this.data('concept-eid');
                conceptInfo.assignmentID = $this.data('assignment-id');
                conceptInfo.assignmentName = $this.data('assignment-name');
                conceptInfo.conceptType = $this.data('concept-type');
                conceptInfo.conceptHandle = $this.data('concept-handle');
                conceptInfo.realm = $this.data('realm');
                conceptInfo.conceptId = $this.data('concept-id'),
                conceptInfo.conceptName = $this.find('a').text();
                if ($this.data('collection-handle')) {
                    conceptInfo.collectionHandle = $this.data('collection-handle');
                    conceptInfo.collectionCreatorID = $this.data('collection-creator-ID');
                }
                concept_id = (['asmtpractice', 'domain'].indexOf(conceptInfo.conceptType) !== -1 && conceptInfo.encodedID) ? conceptInfo.encodedID : conceptInfo.conceptId;

                var historyURL = location.pathname + '#concept/' + conceptInfo.assignmentID + '/' + concept_id ;
                if (groupReportsController.isGroupLeader()){
                    conceptInfo.studentID = studentID;
                    conceptInfo.groupID = groupReportsController.getGroupInfo().id;
                    historyURL += '/' + studentID;
                }

                if(lastAccessDate && window.adaptive_practice_launch_date && (new Date(lastAccessDate) < new Date(window.adaptive_practice_launch_date))){
                	conceptInfo.oldReport = true;
                }
                //Bug 30893 - Browsers which don't support history pushState, browser back button
                //for page navigations won't be supported
                if (typeof history !== 'undefined' && typeof  history.pushState !== 'undefined' ){
                    history.pushState({'conceptInfo':conceptInfo}, null, historyURL);
                }
                if (['asmtpractice', 'domain'].indexOf(conceptInfo.conceptType) !== -1 && conceptInfo.encodedID) {
                    var $that = $this;
                    groupReportsController.getPracticeHandleForEID({
                        'eid':conceptInfo.encodedID,
                        'success':function(response){
                            conceptInfo.practiceHandle = response.test && response.test.handle; //adding practice handle for bug 54152
                            groupReportsController.loadConceptView(conceptInfo, $that.parent().find('.quiz-concept-list'));
                        },
                        'error':function(response){
                            groupReportsController.loadConceptView(conceptInfo, $that.parent().find('.quiz-concept-list'));
                        }
                    });
                } else {
                    groupReportsController.loadConceptView(conceptInfo, $this.parent().find('.quiz-concept-list'));
                }
            });
            $(".filter-select.member-list-select").off("click").on("click",function(e){
            	e.stopPropagation();
            	$(this).find(".down-arrow").toggleClass("rotate");
            	$(this).parent().find(".filter-options").toggleClass("hide");
            });
            $('.member-link').off('click.member').on('click.member', function () {
                if ($('#report-exit-fullscreen-link').length){
                    $('#report-exit-fullscreen-link').trigger('click');
                }
                var memberID = $(this).find('#user-id').data('userid');
                //Bug 30893 - Browsers which don't support history pushState, browser back button
                //for page navigations won't be supported
                if (typeof history !== 'undefined' && typeof  history.pushState !== 'undefined' ){
                    history.pushState({'memberID':memberID}, null, location.pathname + '#assignment/' + memberID);
                }
                groupReportsController.loadMemberView(memberID);
                return false;
            });
            $("body").off("click").on("click",function(){
            	$(this).find(".down-arrow").removeClass("rotate");
            	$(this).parent().find(".filter-options").addClass("hide");
            });
        }

        function overrideLeftNavigation(){
            $('ul.side-nav li a')
                .off('click.home-links')
                .css({'color': '#00ABA4', 'cursor': 'pointer'});
            $('ul.side-nav li a i').css({'color': '#b8d543', 'cursor': 'pointer'});
        }

        function renderAssignments(memberID, assignments, memberConceptScores){
            var assignmentsHTML = '';
            var scores = new Array();
            studentID = memberID;
            $.each(assignments, function (index, assignment) {
                var assignmentHTML = $(pageTemplate).find('#assignment-container-template').html(),
                    conceptsHTML = '',
                    tempConceptScoreTemplate='',
                    lastAccessTemplate='';
                assignmentHTML = assignmentHTML.replace(/@@assignmentName@@/g, assignment.name);
                $.each(assignment.concepts, function (index, concept) {
                    var conceptHTML = $(pageTemplate).find('#concept-container-template').html();
                    conceptHTML = conceptHTML.replace(/@@conceptEID@@/g, concept.encodedID || (concept.domains && concept.domains[0] && concept.domains[0].encodedID) || '');
                    conceptHTML = conceptHTML.replace(/@@conceptName@@/g,
                        _.escape(
                            concept.type === 'domain' ? (concept.conceptCollectionTitle || concept.name || '') : (concept.name || '')
                        )
                    );
                    conceptHTML = conceptHTML.replace(/@@conceptType@@/g, concept.type);
                    conceptHTML = conceptHTML.replace(/@@conceptHandle@@/g, concept.handle);
                    conceptHTML = conceptHTML.replace(/@@conceptRealm@@/g, concept.login);
                    conceptHTML = conceptHTML.replace(/@@conceptID@@/g, concept.id);
                    conceptHTML = conceptHTML.replace(/@@quizIconState@@/g, concept.type === 'asmtquiz' ? '' : 'hide');
                    conceptHTML = conceptHTML.replace(/@@assignmentName@@/g, assignment.name);
                    conceptHTML = conceptHTML.replace(/@@assignmentID@@/g, assignment.assignmentID);
                    if (concept.collectionHandle && concept.collectionCreatorID) {
                        conceptHTML = conceptHTML.replace(/@@collectionHandle@@/g, concept.collectionHandle);
                        conceptHTML = conceptHTML.replace(/@@collectionCreatorID@@/g, concept.collectionCreatorID);
                    } else {
                        conceptHTML = conceptHTML.replace(/@@collectionHandle@@/g, '');
                        conceptHTML = conceptHTML.replace(/@@collectionCreatorID@@/g, '');
                    }
                    var member_assignment_key = memberID + "-" + assignment.assignmentID;
                    var conceptScore = 0, maxGraphScore = 0;
                    var dueDate = assignment.due;
                    var lastAccess = '',
                        lastAccessDate = '';
                    if(dueDate) {
                        dueDate = new Date(dueDate);
                        dueDate.setDate(dueDate.getDate() + 1);
                        dueDate = new Date(dueDate.toDateString());
                    }
                    $.each(memberConceptScores, function(scoreIndex, score){
                        var isInvalidScore = true,
                            conceptListTemplate;

                        lastAccessDate = '';
                        if (score[member_assignment_key] && score[member_assignment_key][concept.id]){
                            isInvalidScore = true;
                            if (score[member_assignment_key][concept.id]['status'] === 'completed'){
                                //Status is completed and has score
                                if (score[member_assignment_key][concept.id]['score'] !== ""){
                                    tempConceptScoreTemplate = $(pageTemplate).find('#concept-more-score-template').html();
                                    conceptScore = score[member_assignment_key][concept.id]['score'];
                                    if (conceptScore < 15 ){
                                        tempConceptScoreTemplate = $(pageTemplate).find('#concept-less-score-template').html();
                                    }
                                    maxGraphScore = conceptScore;
                                    if (conceptScore === 0) {
                                    	conceptScore = conceptScore + '';
                                    }
                                    if (conceptScore > 100) {
                                        maxGraphScore = 100;
                                    }
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@conceptScore@@/g, conceptScore ? conceptScore + '%' : '');
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@conceptScoreMax@@/g, maxGraphScore ? maxGraphScore + '%' : '');

                                    var progress_bar_background_color = "red";
                                    /*
                                        Green ( Greater than 84.9 % )
                                        Yellow (Less than 84.9 %)
                                        Red ( less than 64.9 %)
                                    */
                                    if (conceptScore > 64.9 && conceptScore <= 84.9){
                                        progress_bar_background_color = "yellow";
                                    }else if (conceptScore >= 84.9){
                                        progress_bar_background_color = "green";
                                    }
                                    scores[scores.length] = conceptScore;
                                    if (conceptScore){
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@progress-bar-background-color@@/g, progress_bar_background_color);
                                    }else{
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/progress-color-@@progress-bar-background-color@@/g, '');
                                    }
                                    if(concept.type === 'asmtquiz') {
                                        conceptListTemplate = groupReportsController.renderconeptListForQuiz(concept.domains);
                                        tempConceptScoreTemplate += '<ul class="quiz-concept-list hide">' + conceptListTemplate + '</ul>';
                                    }
                                    conceptHTML = conceptHTML.replace(/@@concept-score-container@@/, tempConceptScoreTemplate);
                                    conceptHTML = conceptHTML.replace(/@@show-on-practice@@/, '');
                                    conceptHTML = conceptHTML.replace(/@@show-on-no-practice@@/, 'hide');
                                }else{
                                    //Show completion tick mark icons
                                    conceptHTML = conceptHTML.replace(/@@show-on-practice@@/, 'hide');
                                    conceptHTML = conceptHTML.replace(/@@show-on-no-practice@@/, '');
                                    tempConceptScoreTemplate = $(pageTemplate).find('#concept-completion-template').html();
                                    conceptHTML = conceptHTML.replace(/@@concept-score-container@@/, tempConceptScoreTemplate);
                                }
                                if (score[member_assignment_key]
                                  && score[member_assignment_key][concept.id]
                                  && score[member_assignment_key][concept.id]['lastAccess']){
                                	lastAccessDate = new Date(score[member_assignment_key][concept.id]['lastAccess']);
                                    lastAccess = lastAccessDate.getMonth() || 0 === lastAccessDate.getMonth() ? (lastAccessDate.getMonth() + 1) + '/' + lastAccessDate.getDate() + '/' + (lastAccessDate.getFullYear()) : '&nbsp;';
                                }
                                lastAccessTemplate = $(pageTemplate).find('#last-access-template').html();
                                lastAccessTemplate = lastAccessTemplate.replace(/@@last-try-text@@/, 'Last Try:');
                                lastAccessTemplate = lastAccessTemplate.replace(/@@last-access-date@@/, lastAccess || '-');
                                if (!groupReportsController.isGroupLeader()){
                                    conceptHTML = conceptHTML.replace(/@@last-access-container@@/, lastAccessTemplate);
                                }else{
                                    conceptHTML = conceptHTML.replace(/@@last-access-container@@/, '');
                                }
                            }else{
                                scores[scores.length] = 0;
                                tempConceptScoreTemplate = $(pageTemplate).find('#concept-more-score-template').html();
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@conceptScore@@/g, '');
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/progress-color-@@progress-bar-background-color@@/g, '');
                                conceptHTML = conceptHTML.replace(/@@concept-score-container@@/, tempConceptScoreTemplate);
                                conceptHTML = conceptHTML.replace(/@@show-on-practice@@/, 'hide');
                                conceptHTML = conceptHTML.replace(/@@show-on-no-practice@@/, '');
                                lastAccessTemplate = $(pageTemplate).find('#last-access-template').html();
                                lastAccessTemplate = lastAccessTemplate.replace(/@@last-try-text@@/, '&#151;');
                                lastAccessTemplate = lastAccessTemplate.replace(/@@last-access-date@@/, lastAccess || '');
                                if (!groupReportsController.isGroupLeader()){
                                    conceptHTML = conceptHTML.replace(/@@last-access-container@@/, lastAccessTemplate);
                                }else{
                                    conceptHTML = conceptHTML.replace(/@@last-access-container@@/, '');
                                }
                            }
                        }
                        if (isInvalidScore){
                            tempConceptScoreTemplate = $(pageTemplate).find('#concept-less-score-template').html();
                            tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@conceptScore@@/g, '');
                            tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/progress-color-@@progress-bar-background-color@@/g, '');
                            conceptHTML = conceptHTML.replace(/@@concept-score-container@@/, tempConceptScoreTemplate);
                            conceptHTML = conceptHTML.replace(/@@show-on-practice@@/, 'hide');
                            conceptHTML = conceptHTML.replace(/@@show-on-no-practice@@/, '');
                            conceptHTML = conceptHTML.replace(/@@last-access-container@@/, '');
                        }
                        if (lastAccessDate && dueDate && lastAccessDate > dueDate) {
                            conceptHTML = conceptHTML.replace(/@@hide@@/, '');
                        } else {
                            conceptHTML = conceptHTML.replace(/@@hide@@/, 'hide');
                        }

                        conceptHTML = conceptHTML.replace(/@@lastAccessDate@@/, lastAccessDate);
                    });
                    conceptsHTML += conceptHTML;
                });
                assignmentHTML = assignmentHTML.replace(/@@concept-container@@/g, conceptsHTML);
                assignmentsHTML += assignmentHTML;
            });
            var total = 0;
            $.each(scores,function() {
                total += parseInt(this, 10);
            });
            if (scores.length){
                $('#average-score').text(Math.round(total/scores.length) + '%');
            }else{
                $('#average-score').text('0%');
            }
            $('.assignment-wrapper').append(assignmentsHTML);
            $('.js-progress-bar').each(function () {
                if ($(this).attr('data-width')) {
                    $(this).css('width', $(this).attr('data-width'));
                }
            });
            $('.js-assignment-title').each(function () {
                $(this).text(this.title);
            });
        }
        function renderOtherMembersInOptions(memberList,homeTemplate,currentMember){
        	var reportMemberNameTemp = $(homeTemplate).find('#reportMemberNameTemp').html(),memberAssignHTML="";
        	// rendering member name inside left table
        	$.each(memberList, function(index, member){
                var tempMemberTemplate = reportMemberNameTemp;
                tempMemberTemplate = "<li class='columns small-4'>" + tempMemberTemplate;
                tempMemberTemplate = tempMemberTemplate.replace(/@@userFullName@@/g, member.name);
                tempMemberTemplate = tempMemberTemplate.replace(/@@username@@/g, member.name.split(' ')[0]);
                tempMemberTemplate = tempMemberTemplate.replace(/@@userAuthID@@/g, member.id);
                tempMemberTemplate = tempMemberTemplate.replace(/@@userID@@/g, member.id);
                //tempMemberTemplate = tempMemberTemplate.replace(/@@backGroundColor@@/g, (index % 2)? 'background-light' : 'background-darker');
                tempMemberTemplate += "</li>" ;
               if(currentMember.id !== member.id){
            	   memberAssignHTML += tempMemberTemplate;
               }

            });
        	$(".member-list-options").find("ul.member-list").append(memberAssignHTML);
        }
        function render(member, assignments, memberConceptScores, memberList) {
            require([
              'text!groups/templates/reports/group.reports.header.html',
              'text!groups/templates/reports/group.reports.member.non.zero.state.html'], function (homeTemplate, pageTempl) {
                pageTemplate = pageTempl;
                var memberHeaderHTML = groupReportsController.isGroupLeader() ?$(homeTemplate).find('#member-non-zero-header-for-leader').html() : $(homeTemplate).find('#member-non-zero-header').html();
                memberHeaderHTML = memberHeaderHTML.replace(/@@username@@/g, member.name);
                memberHeaderHTML = memberHeaderHTML.replace(/@@userAuthID@@/g, member.id);

                //Remove the custom header and body if user lands from group reports view
                $('#group-details-container .activity-header').siblings().filter(':not(.activity-header-edit)').remove();
                $('#group-details-container .activity-header-wrapper').siblings().remove();
                $('#group-details-container .activity-header-wrapper').append(memberHeaderHTML);
                if (!groupReportsController.isGroupLeader()){
                    $('#member-name').text('Your Latest Concept Scores');
                    $('.member-image').addClass('hide');
                    $('.text-small').text('');
                    $('.member-name-wrapper').removeClass('left-space');
                }else{
                    overrideLeftNavigation();
                    if(memberList && memberList.length >1){
                    	renderOtherMembersInOptions(memberList,homeTemplate,member);
                    }else{
                    	 $(".filter-select.member-list-select").removeClass("filter-select");
                    	 $(".member-list-drop").addClass("hide");
                    }
                }
                $('#group-reports-link').addClass('cursor-default').parent().addClass('active');
                $('#group-reports-count').addClass('group-count-black');
                $('#group-details-container').append($(pageTemplate).find('#member-non-zero-body-container-template').html());
                renderAssignments(member.id, assignments, memberConceptScores);
                bindEvents();
            });
        }

        this.render = render;

    }
    return new groupReportsMemberNonZeroView();
});
