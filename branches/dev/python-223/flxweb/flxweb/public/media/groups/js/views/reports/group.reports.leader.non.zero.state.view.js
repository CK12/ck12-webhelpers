define(['jquery', 'common/utils/utils', 'underscore'], function ($, utils, _){
    'use strict';

    var groupReportsController;
    require(['groups/controllers/group.reports'], function (controller) {
        groupReportsController = controller;
    });

    function groupReportsLeaderNonZeroView() {

		var pageTemplate, queryParam,backContainer,assignmentOffset=0,remainingAssignment=0,remainingConcepts=0,nextConceptIndex=0,nextIndex=0,assignmentList ={},groupMembers,scoreList={},visibleAssignment,assignmentWidth = 170,navigationWidth = 100,conceptExtendViewActive=false, conceptsTemplate = '';
        function bindExitEvents(){
            $('#report-exit-fullscreen-link').off('click.exit').on('click.exit', function(event){
                $('body').removeClass('full-height');
                backContainer.removeClass('hide');
                $('#report-view-container-normal-view').html($('#report-view-container-fullscreen-view').html());
                $('#report-full-page').remove();
                $('header').removeClass('hide');
                $('footer').removeClass('hide');
                fixedHeaderHandler(false);
                bindEvents();
            });
            bindEvents();
        }

		function bindEvents() {
        // function bindEvents(assignments, memberList, scores) { // Changes for member sorting
            //Event Binding
            $('.member-link').off('click.member').on('click.member', function () {
            	$(".group-activity .side-nav").removeClass("compressed-view");
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


            $('#report-full-screen-link').off('click.fullscreen').on('click.fullscreen', function(event){
                fullScreen('#group-reports', '#report-view-container-normal-view');
                return false;
            });

            $('.date-information-icon').off('click.dateinfo').on('click.dateinfo', function(event){
                if (!$(this).siblings().filter('.date-information-container').hasClass('hide')){
                    $(this).siblings().filter('.date-information-container').addClass('hide');
                }else{
                    $(this).siblings().filter('.date-information-container').removeClass('hide');
                }
                event.stopPropagation();
                return false;
            });

            $('.compact-view').off('click.assignmentrow').on('click.assignmentrow', function(){
                $('.compact-view').removeClass('hide');
                $('.assignment-text-info').addClass('hide');
                $('.assignment-text-info').removeClass('selected');
                $(this).addClass('hide');
                $('.concept-details-view').addClass('hide');
                $('.concept-details-view').removeClass('border-bottom');
                $(this).next().addClass('selected');

                var row = this;
                while(true){
                    if ($(row).next().hasClass('concept-details-view') || $(row).next().hasClass('assignment-text-info')){
                        $(row).next().removeClass('hide');
                        row = $(row).next();
                        if ($(row).next().hasClass('compact-view')){
                           $(row).addClass('border-bottom');
                        }
                    }else{
                        break;
                    }
                }
            });

            $('.assignment-text-info').off('click.assignmenttxtrow').on('click.assignmenttxtrow', function(){
                $(this).prev().removeClass('hide');
                $(this).removeClass('selected');
                $(this).addClass('hide');
                var row = this;
                while(true){
                    if ($(row).next().hasClass('concept-details-view')){
                        $(row).next().addClass('hide');
                        row = $(row).next();
                    }else{
                        break;
                    }
                }
                $('.concept-details-view').removeClass('border-bottom');
            });
			$("#loadMore span").off("click").on("click",function(){
				loadNextPage();
			})
            $('#next-pointer').off('click.next').on('click.next', function(){
                if ($(this).hasClass('active')){
/*					                    loadNextPage();
                    // loadNextPage(assignments, memberList, scores); // Changes for member sorting
                    $('#previous-pointer').removeClass('inactive').addClass('active');
                    if (memberList.length <= (groupReportsController.getPageNum() * 5)){
                        $(this).removeClass('active').addClass('inactive');
                    }*/
					nextIndex++;
					$("#group-report-details").find("thead tr th:nth-child("+nextIndex+")").addClass("hide");
					$("#group-report-details").find("tbody tr td:nth-child("+nextIndex+")").addClass("hide");
					$('#previous-pointer').removeClass("inactive").addClass("active");
					if(nextIndex>=remainingAssignment){
						$(this).removeClass('active').addClass("inactive");
					}
                }
            });

            $('#previous-pointer').off('click.previous').on('click.previous', function(){
                if ($(this).hasClass('active')){
                    /*loadPreviousPage(assignments, memberList, scores); // Changes for member sorting
                    $('#next-pointer').removeClass('inactive').addClass('active');
                    if (groupReportsController.getPageNum() === 1){
                        $(this).removeClass('active').addClass('inactive');
                    }*/
					$("#group-report-details").find("thead tr th:nth-child("+nextIndex+")").removeClass("hide");
					$("#group-report-details").find("tbody tr td:nth-child("+nextIndex+")").removeClass("hide");
					nextIndex--;
					if(nextIndex <= 0){
						$(this).removeClass('active').addClass("inactive");
					}
					if(nextIndex>=remainingAssignment){
						$('#next-pointer').removeClass('active').addClass("inactive");
					}else{
						$('#next-pointer').addClass('active').removeClass("inactive");
                    }
                }
            });

            $('.js-score').off('click.concept').on('click.concept', function(){
                var conceptInfo = {},
                    parentTd = $(this).parent(),
                    parentTr = $(parentTd).parent(),
                    studentID = $(this).data('member-id'),
                    assignmentTr = $('.assignment-text-info.selected'),
                    lastAccessDate = $(this).data('last-access-date');

                conceptInfo.conceptName = $(parentTr).find('#concept-name').text(),
                conceptInfo.encodedID = $(parentTr).data('concept-eid'),
                conceptInfo.conceptType = $(parentTr).data('concept-type'),
                conceptInfo.conceptHandle = $(parentTr).data('concept-handle'),
                conceptInfo.realm = $(parentTr).data('realm'),
                conceptInfo.conceptId = $(parentTr).data('concept-id'),
                conceptInfo.assignmentID = $(assignmentTr).data('assignment-id'),
                conceptInfo.assignmentName = $(assignmentTr).find('#assignment-name').text();
                if (parentTr.hasClass('compact-view')){
                    return false;
                }
                if (groupReportsController.isGroupLeader()){
                    conceptInfo.studentID = studentID;
                    conceptInfo.groupID = groupReportsController.getGroupInfo().id;
                }

                if(lastAccessDate && window.adaptive_practice_launch_date && new Date(lastAccessDate) < new Date(window.adaptive_practice_launch_date)){
                	conceptInfo.oldReport = true;
                }
                groupReportsController.loadConceptView(conceptInfo, $(parentTr).find('.quiz-concept-list'));
            });

			$("#group-report-container tbody tr").hover(function(){
				$("#reportLeftMemberList tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").addClass("hover-background");
				$("#group-report-container tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").addClass("hover-background");
			},function(){
				$("#reportLeftMemberList tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").removeClass("hover-background");
				$("#group-report-container tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").removeClass("hover-background");
			});
			$("#reportLeftMemberList tbody tr").hover(function(){
				$("#group-report-container tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").addClass("hover-background");
			},function(){
				$("#group-report-container tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").removeClass("hover-background");
			});

			//binding events for assignment detail
			$("#group-report-details .assignment-name").off("click").on("click",function(e){
				if($(this).hasClass("active-assignment")){
					return ;
				}
				var assignmentID = $(this).attr("data-id");
				$("#group-report-details thead th").hide();
				$("#group-report-details tbody td").hide();
				$("#group-report-details thead th[data-id='"+$(this).attr("data-id")+"']").show();
				$("#group-report-details tbody td[data-id='"+$(this).attr("data-id")+"']").show();
				$(this).addClass("active-assignment");
				$('#pagination-link-wrapper').addClass('hide');

				renderConcepts($(this).attr("data-id"),$(this).attr("data-due"));

				bindConceptEvents();

				if (typeof history !== 'undefined' && typeof  history.pushState !== 'undefined' && !e.isTrigger){
					history.pushState({'assignmentID':assignmentID}, null, location.pathname + '?assignmentID='+assignmentID);
				}
				$("#loadMore").addClass("hide");
			});

			$("#closeConcept").off("click").on("click",function(){
				$(this).addClass("hide");
				closeExpandedView();
				conceptExtendViewActive = true;
				$("#loadMore").removeClass("hide");
			});

			$('#concept-navigation-wrapper #next-concept').off('click.next').on('click.next', function(){
				if ($(this).hasClass('active')){
					var transform = 0;
					nextConceptIndex++;

					transform = (nextConceptIndex*(visibleAssignment -1) <= remainingConcepts )? nextConceptIndex*(visibleAssignment -1) : (remainingConcepts)
							$("#assignment-concepts-details").css({"transform":"translateX(-"+transform*assignmentWidth+"px)"});
					$('#concept-navigation-wrapper #previous-concept').removeClass("inactive").addClass("active");
					if(nextConceptIndex*(visibleAssignment -1) >=remainingConcepts){
						$(this).removeClass('active').addClass("inactive");
					}
				}
			});

			$('#concept-navigation-wrapper #previous-concept').off('click.previous').on('click.previous', function(){
				if ($(this).hasClass('active')){
					var transform = 0;
					nextConceptIndex--;
					transform = (nextConceptIndex*(visibleAssignment -1));
					$("#assignment-concepts-details").css({"transform":"translateX(-"+transform*assignmentWidth+"px)"});
					if(nextConceptIndex <= 0){
						$(this).removeClass('active').addClass("inactive");
					}
					if(nextConceptIndex>=remainingConcepts){
						$('#concept-navigation-wrapper #next-concept').removeClass('active').addClass("inactive");
					}else{
						$('#concept-navigation-wrapper #next-concept').addClass('active').removeClass("inactive");
					}
				}
			});
		}

		function getConceptTemplate(assignmentID, conceptEncodedID, memberID) {
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
                            if(concept.type === 'asmtquiz') {
                                conceptsTemplate = groupReportsController.renderconeptListForQuiz(concept.domains);
                                conceptsTemplate = '<ul class="quiz-concept-list hide">' + conceptsTemplate + '</ul>';
                            }
                            return false;
                        }
                    });
                    return false;
                }
            });
            return conceptsTemplate;
        }

		function bindConceptEvents(){
			$("#group-report-container tbody tr").hover(function(){
				$("#reportLeftMemberList tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").addClass("hover-background");
				$("#group-report-container tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").addClass("hover-background");
			},function(){
				$("#reportLeftMemberList tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").removeClass("hover-background");
				$("#group-report-container tbody").find("tr[data-member='"+$(this).attr("data-member")+"']").removeClass("hover-background");
			});
			$(".concept-status-wrapper").off("click.concept").on("click.concept",function(){
				var assignmentId = $("#group-report-details .active-assignment").attr("data-id"),
				conceptIndex = $(this).parent().attr("data-concept-index"),
				studentID = $(this).parent().parent().attr("data-member"),
				selectedConcept = assignmentList[assignmentId]["concepts"][conceptIndex],
				lastAccessDate = $(this).parent().attr("data-lastaccess"),
				conceptInfo = {};

                conceptInfo.conceptName = selectedConcept["name"];
                // If a practice modality is assigned, we may need to get the EID from domains array.
                conceptInfo.encodedID = selectedConcept.encodedID || (selectedConcept.domains && selectedConcept.domains[0] && selectedConcept.domains[0].encodedID);
				conceptInfo.conceptType = selectedConcept["type"];
				conceptInfo.conceptHandle = selectedConcept["handle"];
				conceptInfo.realm = selectedConcept["login"];
				conceptInfo.conceptId = selectedConcept["id"];

				conceptInfo.assignmentID = assignmentId;
                conceptInfo.assignmentName = assignmentList[assignmentId]["name"];
                
                // add collection related info
                conceptInfo.collectionHandle = selectedConcept.collectionHandle;
                conceptInfo.collectionCreatorID = selectedConcept.collectionCreatorID;
                conceptInfo.conceptCollectionHandle = selectedConcept.conceptCollectionHandle;
                conceptInfo.conceptCollectionAbsoluteHandle = selectedConcept.conceptCollectionAbsoluteHandle;
                
                // #Bug 56803 adding conceptCollectionTiltle to fix the issue
                conceptInfo.conceptCollectionTitle = selectedConcept.conceptCollectionTitle;

				if (groupReportsController.isGroupLeader()){
					conceptInfo.studentID = studentID;
					conceptInfo.groupID = groupReportsController.getGroupInfo().id;
				}

				if(lastAccessDate && window.adaptive_practice_launch_date && new Date(lastAccessDate) < new Date(window.adaptive_practice_launch_date)){
					conceptInfo.oldReport = true;
                }

				if (typeof history !== 'undefined' && typeof  history.pushState !== 'undefined' ){
                    var idOrEid = (['asmtpractice', 'domain'].indexOf(conceptInfo.conceptType) !== -1 && conceptInfo.encodedID) ? conceptInfo.encodedID : conceptInfo.conceptId;
					history.pushState({'assignmentId':assignmentId,'eids':conceptInfo.encodedID,'memberID':studentID}, null, location.pathname + '#concept/'+assignmentId+'/'+idOrEid+'/'+ studentID);
				}
				groupReportsController.loadConceptView(conceptInfo, $(getConceptTemplate(parseInt(assignmentId), conceptInfo.conceptId.toString(), parseInt(studentID))));

			});
			$(".late-submission").off("click").on("click",function(e){
				e.stopPropagation();
				if(!$("body").find(".late-submission-toolTip").length){
					$("body").append($(pageTemplate).find("#lateSubmissionToolTipTemp").html())
				}
				var style = {
						top:$(this).offset().top,
						left:$(this).offset().left
				},
				dueDateActual = new Date($("#group-report-details").find(".active-assignment").attr("data-due")),
				dueDate = new Date($("#group-report-details").find(".active-assignment").attr("data-due"));
				dueDate.setDate(dueDate.getDate() + 1);// we are added due date time 00:00:00
				dueDate = new Date(dueDate.toDateString());
				var lastAccess = new Date($(this).parent().parent().attr("data-lastaccess")),
				diff = lastAccess - dueDate,
				diffDays = parseInt(diff / (1000 * 3600 * 24)),
				diffHours = Math.ceil(((diff / (1000 * 3600 * 24)) - diffDays)*24),
				temp = "",dateStr;
				if(diffDays){
					temp+= diffDays+" days "
				}
				if(diffHours){
					temp+= diffHours+"hrs "
				}
				temp+= "late";
				dateStr = (dueDateActual.getMonth() + 1) + "/" + dueDateActual.getDate() + "/" + dueDateActual.getFullYear().toString().substr(2,2);
				$("body").find(".late-submission-toolTip .late-duration-text").text(temp);
				$("body").find(".late-submission-toolTip .turned-in-date").text(dateStr);
				$("body").find(".late-submission-toolTip").css(style)
				$("body").find(".late-submission-toolTip").removeClass("hide");
			})
			$(document).off("click.groupReportLateSubmissionTooltip").on("click.groupReportLateSubmissionTooltip",function(){
				$("body").find(".late-submission-toolTip").addClass("hide");
			})
		}
		function closeExpandedView(){
			$("#assignment-report-wrapper").addClass("hide");
			$("#group-report-details").css({"width":visibleAssignment*assignmentWidth});
			$(".active-assignment").removeClass("active-assignment");
			$("#group-report-details thead th").removeAttr("style");
			$("#group-report-details tbody td").removeAttr("style");
			$("#assignment-concepts-details").removeAttr("style");

			$("#concept-navigation-wrapper").addClass("hide");
			if(remainingAssignment){
				$('#pagination-link-wrapper').removeClass('hide');
			}
			conceptExtendViewActive = false;
			nextConceptIndex = 0;
		}
		function renderConcepts(id,due){
			var headerHtml="",bodyHtml,dummytr="",conceptScoreTemp = $(pageTemplate).find("#conceptsReportTemp").html(),
			dueDate = new Date(due),conceptLists = assignmentList[id].concepts;
			dueDate.setDate(dueDate.getDate() + 1);// we are added due date time 00:00:00
			dueDate = new Date(dueDate.toDateString());
			$.each(assignmentList[id].concepts,function(index,concept){
            var temp = "<th class='concept-header'><div>" +
                utils.encodeHTML(concept.encodedID ? concept.conceptCollectionTitle || concept.name : concept.name) +
                "</div></th>";
				headerHtml += temp;
			});

			//render scores

			$.each(groupMembers, function(index, member){
				var memberID = member.id,scoreTemp="",scoreKey = memberID+"-"+id,counttd=0,evenTr,
				scores = scoreList[scoreKey];
				dummytr="";
				evenTr = (index % 2) ? "":"even-tr";
				for(var j in conceptLists){
					var i = conceptLists[j]["id"],temp = "",evenOrOdd = (counttd % 2 ) ? "odd-concept" : "even-concept",conceptScore = conceptScoreTemp,lastAccess="";

					lastAccess = scores[i]["lastAccess"];
					conceptScore = conceptScore.replace(/@@score@@/,scores[i]["score"]);
					//conceptScore = conceptScore.replace(/@@height@@/,((scores[i]["score"] && scores[i]["score"] >= 10)? (scores[i]["score"])*25/100 : 1)+"px");

					if(scores[i]["score"] === ""){
						if(scores[i]["status"] === "completed"){
							conceptScore = '<span class="icon-checkmark app-icons"></span>'
						}else{
							conceptScore = "__";
						}
					}else if(scores[i]["score"] <= 60){
						conceptScore = conceptScore.replace(/@@color@@/,"red");
					}else if(scores[i]["score"] <= 80){
						conceptScore = conceptScore.replace(/@@color@@/,"yellow");
					}else{
						conceptScore = conceptScore.replace(/@@color@@/,"green");
					}
					if(lastAccess){
						var lastAccessDate = new Date(lastAccess);

						if(lastAccessDate > dueDate){
							conceptScore = conceptScore.replace(/@@hide@@/,"");
						}else{
							conceptScore = conceptScore.replace(/@@hide@@/,"hide");
						}

					}

					temp = "<td data-lastaccess='"+lastAccess+"' data-concept-index='"+counttd+"' class='"+evenOrOdd+"'>"+conceptScore+"</td>";
					if(i !== "completedCount" && i !== "incompleteCount" ){
						scoreTemp+= temp;
						dummytr+="<td class='"+evenOrOdd+"'></td>"
					}
					counttd++;
				}
				bodyHtml += "<tr data-member='"+memberID+"'class='"+evenTr+"'>"+scoreTemp+"</tr>" ;
			});
			dummytr = "<tr class='dummy-tr'>"+dummytr+"</tr>";
			bodyHtml = dummytr + bodyHtml;
			$("#assignment-report-wrapper thead").html("<tr>"+headerHtml+"</tr>");
			$("#assignment-report-wrapper tbody").html(bodyHtml);
			$("#assignment-report-wrapper").removeClass("hide");
			$("#closeConcept").removeClass("hide");

			$("#group-report-details").css({"width":""});
			if((visibleAssignment-1)>= assignmentList[id].concepts.length){
				$("#assignment-report-wrapper").removeAttr("style");
			}else{
				$("#assignment-report-wrapper").css({"width":(visibleAssignment-1)*assignmentWidth});
				$("#concept-navigation-wrapper").removeClass("hide");
				$("#concept-navigation-wrapper #next-concept").addClass("active").removeClass("inactive");
				$('#concept-navigation-wrapper #previous-concept').addClass('inactive').removeClass("active");

				remainingConcepts = assignmentList[id].concepts.length - (visibleAssignment-1);
			}
		}
        function renderMemberList(memberList){
            var memberTemplate = $(pageTemplate).find('#member-top-template').html(),
                membersHTML = "";
            //First remove all the members, except first empty th tag
            $('.js-member-row > th:not(:first-of-type)').remove();
            // memberList = memberList.slice(0,5); // changes for member sorting
            $.each(memberList, function(index, member){
                var tempMemberTemplate = memberTemplate;
                tempMemberTemplate = "<th>" + tempMemberTemplate;
                tempMemberTemplate = tempMemberTemplate.replace(/@@userFullName@@/g, member.name);
                tempMemberTemplate = tempMemberTemplate.replace(/@@username@@/g, member.name.split(' ')[0]);
                tempMemberTemplate = tempMemberTemplate.replace(/@@userAuthID@@/g, member.id);
                tempMemberTemplate = tempMemberTemplate.replace(/@@userID@@/g, member.id);
                tempMemberTemplate = tempMemberTemplate.replace(/@@backGroundColor@@/g, (index % 2)? 'background-light' : 'background-darker');
                tempMemberTemplate += "</th>" ;
                membersHTML += tempMemberTemplate;
            });
            $('.js-member-row').append(membersHTML);
        }

        function getBackGroundColorClass(assignmentIndex, memberIndex){
            if (!(assignmentIndex % 2) && !(memberIndex % 2)){
                return "background-darkest";
            }else if (((assignmentIndex % 2) && !(memberIndex % 2)) || (!(assignmentIndex % 2) && (memberIndex % 2))){
                return "background-darker";
            }
            return "background-light";
        }

        function renderGroupReport(assignments, membersList, scoresList){
            var compactViewTemplate = $(pageTemplate).find('#compact-view-row-template > tbody').html(),
                conceptDetailedViewTemplate = $(pageTemplate).find('#concept-detailed-view-row-template > tbody').html(),
                assignmentsHTML = "";
            // membersList = membersList.slice(0,5); // Changes for member sorting
            $.each(assignments, function(assignmentIndex, assignment){
                var tempAssignmentTemplate = compactViewTemplate,
                    assignmentDetailedViewTemplate = $(pageTemplate).find('#assignment-detail-view-row-template > tbody').html(),
                    conceptHTML='';

                tempAssignmentTemplate = tempAssignmentTemplate.replace(/@@assignmentName@@/g, assignment.name);
                tempAssignmentTemplate = tempAssignmentTemplate.replace(/@@assignmentID@@/g, assignment.assignmentID);
                tempAssignmentTemplate = tempAssignmentTemplate.replace(/@@background-color-class@@/g, (assignmentIndex % 2) ? "even": "odd");
                assignmentDetailedViewTemplate = assignmentDetailedViewTemplate.replace(/@@assignmentName@@/g, assignment.name);
                assignmentDetailedViewTemplate = assignmentDetailedViewTemplate.replace(/@@assignmentID@@/g, assignment.assignmentID);
                assignmentDetailedViewTemplate = assignmentDetailedViewTemplate.replace(/@@span-column-count@@/g, membersList.length);
                var assignmentDateInformationTemplate = $(pageTemplate).find('#assignment-date-information-template').html();
                if (membersList.length < 3 ){
                    var assignmentDateInformationTemplate = $(pageTemplate).find('#assignment-date-information-icon-template').html();
                }
                var dueDate = null;
                if (assignment.due) {
                    dueDate = new Date(assignment.due);
                }
                if (dueDate && isFinite(dueDate) && dueDate.getMonth()+1){
                    dueDate = ("0" + (dueDate.getMonth() + 1)).slice(-2) + '/' + ("0" + dueDate.getDate()).slice(-2) + '/' + dueDate.getFullYear();
                    assignmentDateInformationTemplate = assignmentDateInformationTemplate.replace(/@@assignment-due-date@@/g, '');
                    assignmentDateInformationTemplate = assignmentDateInformationTemplate.replace(/@@assignmentDueDate@@/g, dueDate);
                }else{
                    assignmentDateInformationTemplate = assignmentDateInformationTemplate.replace(/@@assignment-due-date@@/g, 'hide');
                    assignmentDateInformationTemplate = assignmentDateInformationTemplate.replace(/@@assignmentDueDate@@/g, '');
                }
                assignmentDetailedViewTemplate = assignmentDetailedViewTemplate.replace(/@@ASSIGNMENT-DATE-INFORMATION-HOLDER@@/gi, assignmentDateInformationTemplate);

                tempAssignmentTemplate += assignmentDetailedViewTemplate;
                $.each(assignment.concepts, function(index, concept){
                    var tempConceptTemplate = conceptDetailedViewTemplate,
                        conceptScoreTemplate = $(pageTemplate).find('#concept-score-template').html(),
                        conceptScoreHTML = "",
                        conceptListTemplate='',
                        isPracticeAvailable=true;

                    tempConceptTemplate = tempConceptTemplate.replace(/@@conceptName@@/g,
                         _.escape(
                            concept.type === 'domain' ? (concept.conceptCollectionTitle || concept.name || '') : (concept.name || '')
                        )
                    );
                    tempConceptTemplate = tempConceptTemplate.replace(/@@conceptEID@@/g, concept.encodedID || (concept.domains && concept.domains[0].encodedID) || '');
                    tempConceptTemplate = tempConceptTemplate.replace(/@@conceptType@@/g, concept.type);
                    tempConceptTemplate = tempConceptTemplate.replace(/@@conceptHandle@@/g, concept.handle);
                    tempConceptTemplate = tempConceptTemplate.replace(/@@conceptRealm@@/g, concept.login);
                    tempConceptTemplate = tempConceptTemplate.replace(/@@conceptID@@/g, concept.id);
                    tempConceptTemplate = tempConceptTemplate.replace(/@@quizIconState@@/g, concept.type === 'asmtquiz' ? '' : 'hide');

                    $.each(membersList, function(memberIndex, member){
                        var tempConceptScoreTemplate = conceptScoreTemplate,
                            member_assignment_key = member.id + "-" + assignment.assignmentID,
                            conceptScore = 0;
                        $.each(scoresList, function(scoreIndex, score){
                            var isInvalidScore = true,
                                lastAccessDate = '';
                            if (score[member_assignment_key]
                                && score[member_assignment_key][concept.id]){
                                isInvalidScore = false;
                                if (score[member_assignment_key][concept.id]['status'] === 'completed'){
                                    if (score[member_assignment_key][concept.id]['score'] !== ""){
                                    	lastAccessDate = score[member_assignment_key][concept.id]['lastAccess'];
                                        conceptScore = score[member_assignment_key][concept.id]['score'];
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@lastAccessDate@@/g, lastAccessDate);
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@member-concept-score@@/g, conceptScore + '%');
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@show-on-practice@@/, '');
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@show-on-no-practice@@/, 'hide');
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@memberID@@/, member.id);
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-score@@/, 'js-score');
                                        //Height of vertical bar
                                        var score_graph_height = 35;
                                        var progress_bar_height = (conceptScore * score_graph_height)/100;
                                        progress_bar_height += "px";
                                       tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-progress-bar-height@@/g, progress_bar_height);
                                        var progress_bar_background_color = "red";

                                        /*
                                         Green ( Greater than 84.9 % )
                                         Yellow (Less than 84.9 %)
                                         Red ( less than 64.9 %)
                                        */
                                        if (conceptScore > 64.9 && conceptScore <= 84.9){
                                            progress_bar_background_color = "yellow";
                                        }else if (conceptScore > 84.9){
                                            progress_bar_background_color = "green";
                                        }
                                        tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@progress-bar-background-color@@/g, progress_bar_background_color);
                                    }else{
                                        //Show completion tick mark icon
                                        isPracticeAvailable = false;
                                        tempConceptScoreTemplate = $(pageTemplate).find('#concept-completion-template').html();
                                    }
                                }else{
                                    //Concept status for member is incomplete show dash
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@member-concept-score@@/g, '&#151;');
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-progress-bar-color-wrapper@@/g, 25);
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/progress-color-@@progress-bar-background-color@@/g, '');
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@show-on-practice@@/, 'hide');
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@show-on-no-practice@@/, '');
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@memberID@@/, '');
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-score@@/, '');
                                    tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-progress-bar-height@@/g, '0px');
                                }
                            }
                            if (isInvalidScore){
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@member-concept-score@@/g, '&#151;');
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-progress-bar-color-wrapper@@/g, 25);
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/progress-color-@@progress-bar-background-color@@/g, '');
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@show-on-practice@@/, 'hide');
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@show-on-no-practice@@/, '');
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@memberID@@/, '');
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-score@@/, '');
                                tempConceptScoreTemplate = tempConceptScoreTemplate.replace(/@@js-progress-bar-height@@/g, '0px');
                            }

                        });

                        conceptScoreHTML += '<td>' + tempConceptScoreTemplate + '</td>';
                    });
                    tempConceptTemplate = tempConceptTemplate.replace('<td>@@CONCEPT-SCORE-HOLDER@@</td>', conceptScoreHTML);
                    if (isPracticeAvailable){
                        tempConceptTemplate = tempConceptTemplate.replace('@@show-practice-unavailable-text@@', 'hide');
                    }else{
                        tempConceptTemplate = tempConceptTemplate.replace('@@show-practice-unavailable-text@@', '');
                    }
                    if(concept.type === 'asmtquiz') {
                        conceptListTemplate = groupReportsController.renderconeptListForQuiz(concept.domains);
                        tempConceptTemplate = tempConceptTemplate.replace('<span>@@quiz-concept-list@@</span>','<ul class="quiz-concept-list hide">'+conceptListTemplate+'</ul>');
                    } else {
                        tempConceptTemplate = tempConceptTemplate.replace('<span>@@quiz-concept-list@@</span>','');
                    }
                    conceptHTML += tempConceptTemplate;
                });
                var assignmentScoreHTML = "",
                    assignmentScoreTemplate = $(pageTemplate).find('#assignment-score-template').html();
                $.each(membersList, function(memberIndex, member){
                    var tempAssignmentScoreTemplate = assignmentScoreTemplate,
                        member_assignment_key = member.id + "-" + assignment.assignmentID,
                        assignmentCompletedCount = 0;

                    tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@assignment-total-count@@/g, assignment.totalCount);

                    $.each(scoresList, function(scoreIndex, score){
                        if (score[member_assignment_key]){
                            assignmentCompletedCount = score[member_assignment_key]["completedCount"];
                            return false;
                        }
                    });

                    tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@assignment-completed-count@@/g, assignmentCompletedCount);
                    var member_assignment_completion_percentage = 0;
                    if (assignment.totalCount && assignmentCompletedCount && assignment.totalCount === assignmentCompletedCount){
                        member_assignment_completion_percentage = 100;
                        tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@hide-on-completed@@/g, "hide");
                        tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@progress-bar-background-color@@/g, "complete");
                    }else if (assignment.totalCount && assignmentCompletedCount){
                        member_assignment_completion_percentage = (100 * assignmentCompletedCount) / assignment.totalCount;
                        tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@hide-on-completed@@/g, "");
                        tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@progress-bar-background-color@@/g, "incomplete");
                    }else{
                        tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@hide-on-completed@@/g, "");
                        tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@progress-bar-background-color@@/g, "none");
                    }
                    tempAssignmentScoreTemplate = tempAssignmentScoreTemplate.replace(/@@assigmentProgressPercentage@@/g, member_assignment_completion_percentage);
                    assignmentScoreHTML += '<td class="' + getBackGroundColorClass(assignmentIndex, memberIndex) + '">' + tempAssignmentScoreTemplate + '</td>';
                });

                tempAssignmentTemplate = tempAssignmentTemplate.replace('<td>@@ASSIGNMENT-AVERAGE-SCORE-HOLDER@@</td>', assignmentScoreHTML);
                tempAssignmentTemplate += conceptHTML;
                assignmentsHTML += tempAssignmentTemplate;
            });
            $('#group-report-details tbody').html(assignmentsHTML);
            $('.progress-bar-vertical').each(function () {
                if($(this).attr('data-height')) {
                    $(this).css('height', $(this).attr('data-height'));
                }
            });
            $('.progress-bar-horizontal').each(function () {
                if($(this).attr('data-width')) {
                    $(this).css('width', $(this).attr('data-width'));
                }
            });
            $('.js-assignment-name').each(function () {
                $(this).text(this.title);
            });

        }

        function render(memberList, assignments, scores) {
            require([
              'text!groups/templates/reports/group.reports.header.html',
			         'text!groups/templates/reports/group.reports.leader.non.zero.state.new.html',
              ], function (homeTemplate, pageTempl) {
                pageTemplate = pageTempl;
                $('#group-details-container .activity-header').siblings().filter(':not(.activity-header-edit)').remove();
                $('#group-details-container .activity-header-wrapper').siblings().remove();
                $('#group-details-container .activity-header-wrapper').append($(homeTemplate).find('#leader-non-zero-header').html());

                $('#group-name').text(groupReportsController.getGroupInfo().name);
                $('#group-reports-link').addClass('cursor-default').parent().addClass('active');
                $('#group-reports-count').addClass('group-count-black');
                $('#group-details-container').append($(pageTemplate).find('#leader-non-zero-body-container-template').html());
                $('#report-view-wrapper').append($(pageTemplate).find('#report-template').html());

                if ((groupReportsController.getTotalMemberCount() <= groupReportsController.getPageSize())){
                    $('#pagination-link-wrapper').addClass('hide');
                }else{
                    $('#next-pointer').addClass('active');
                    $('#previous-pointer').addClass('inactive');
                }
                memberList.sort(function(memberA, memberB) {
                    if(memberA.name.toLowerCase() < memberB.name.toLowerCase()){
                        return -1;
                    }else if (memberA.name.toLowerCase() > memberB.name.toLowerCase()){
                        return 1;
                    }else{
                        return 0;
                    }
                });
				//renderMemberList(memberList);
				//renderGroupReport(assignments, memberList, scores);
				groupMembers = memberList;
				scoreList = scores[0];
				queryParam = urlResolver();
                //renderMemberList(memberList);
                //renderGroupReport(assignments, memberList, scores);
				addNewMockUI();
				renderReportHeader(assignments, memberList, scores);
				fixedHeaderHandler(false);
				bindEvents();
				setTimeout(function(){
					setView();
				},500)
			});
		}
		function urlResolver(){
			var assignmentID = utils.gup("assignmentID",location.href);
			return {
				"assignmentID" : assignmentID
			}
		}
		function setView(){
			if(queryParam && queryParam.assignmentID){
				$("#group-report-details .assignment-name[data-id='"+queryParam.assignmentID+"']").trigger("click");
			}
		}
		function renderReportHeader(assignments, memberList, scores,calculateUI){
			var assignmentHeaderTemp = $(pageTemplate).find('#reportHeaderAssignmentListsTemp').html(),
			reportMemberNameTemp = $(pageTemplate).find('#reportMemberNameTemp').html(),
			assignmentZeroStateTemp = $(pageTemplate).find('#assignmentZeroStateTemp').html(),
			assignmentIncompleteStateTemp = $(pageTemplate).find('#assignmentIncompleteStateTemp').html(),
			assignmentCompleteStateTemp = $(pageTemplate).find('#assignmentCompleteStateTemp').html(),
			assignHTML = "",memberAssignHTML="",scoreHTML="",assignment=[],availableWidth;
      var csvHeader = [], csvStudents = new Array();
			if(calculateUI !== false){
				availableWidth = window.innerWidth - ($("#group-report-details").offset().left + $("#pagination-link-wrapper").width() + $("#closeConcept").width());
				visibleAssignment = parseInt((availableWidth)/assignmentWidth);
				visibleAssignment = (availableWidth - visibleAssignment*assignmentWidth) >= navigationWidth ? visibleAssignment : visibleAssignment - 1;
				visibleAssignment = visibleAssignment + 1;
				$("#group-report-details").css({"width":visibleAssignment*assignmentWidth});
				if (visibleAssignment >= assignments.length){
					$('#pagination-link-wrapper').addClass('hide');
				}else{
					$('#pagination-link-wrapper').removeClass('hide');
					$('#next-pointer').addClass('active');
					$('#previous-pointer').addClass('inactive');
					remainingAssignment = assignments.length - visibleAssignment;
				}
			}
			// rendering assignments name inside table head
      csvHeader.push('Student Name');
			for(var i=0;i<assignments.length;i++){
				var even = (i % 2)? "":" even-header ";

				var temp = "<th data-id='"+assignments[i].assignmentID+"' data-due='"+assignments[i].due+"'class='assignment-name"+even+"'>"+assignmentHeaderTemp+"</th>";
				temp = temp.replace(/@@assignmentName@@/g,utils.encodeHTML(assignments[i].name));
				temp = temp.replace(/@@conceptCount@@/g,assignments[i].concepts.length);
				assignHTML = assignHTML + temp;
        var header = assignments[i].name+' ('+ assignments[i].concepts.length +')';
        if (header.includes(',')) {
          header = '"' + header + '"';
        }
        csvHeader.push(header);
				assignment.push(assignments[i].assignmentID);
				assignmentList[assignments[i].assignmentID] = assignments[i];
			}
			$("#group-report-details").find("thead").html("<tr>"+assignHTML+"</tr>");

			// rendering member name inside left table
			$.each(memberList, function(index, member){
				var tempMemberTemplate = reportMemberNameTemp;
				tempMemberTemplate = "<td>" + tempMemberTemplate;
				tempMemberTemplate = tempMemberTemplate.replace(/@@userFullName@@/g, member.name);
				tempMemberTemplate = tempMemberTemplate.replace(/@@username@@/g, member.name.split(' ')[0]);
				tempMemberTemplate = tempMemberTemplate.replace(/@@userAuthID@@/g, member.id);
				tempMemberTemplate = tempMemberTemplate.replace(/@@userID@@/g, member.id);
				tempMemberTemplate = tempMemberTemplate.replace(/@@backGroundColor@@/g, (index % 2)? 'background-light' : 'background-darker');
				tempMemberTemplate += "</td>" ;
				memberAssignHTML += "<tr data-member='"+member.id+"'>"+tempMemberTemplate+"</tr>";
        csvStudents[index] = [member.name];
			});
			$("#reportLeftMemberList").find("tbody").append(memberAssignHTML);

			//render scores

			$.each(memberList, function(index, member){
				var memberID = member.id,scoreTemp="";
        var csvStudent = csvStudents[index];

				for(var i=0;i<assignment.length;i++){
					var hide = /*(i+1 >= visibleAssignment) ? " hide " : */"";
					var scoreKey = memberID+"-"+assignment[i],
					totalConcepts = (scores[0][scoreKey]["completedCount"] + scores[0][scoreKey]["incompleteCount"]),
					completedConcepts = (scores[0][scoreKey]["completedCount"]);
					csvStudent.push(completedConcepts);

					if(completedConcepts === 0){
						scoreTemp = scoreTemp + "<td data-id='"+assignment[i]+"' class='"+hide+"'>"+assignmentZeroStateTemp+"</td>"

					}else if(completedConcepts && completedConcepts < totalConcepts){
						var temp = assignmentIncompleteStateTemp;
						temp = temp.replace(/@@completeCount@@/g,completedConcepts);
						temp = temp.replace(/@@totleCount@@/g,totalConcepts);
						temp = temp.replace(/@@width@@/g,((completedConcepts/totalConcepts)*100)+"%");
						scoreTemp = scoreTemp + "<td data-id='"+assignment[i]+"' class='"+hide+"'>"+temp+"</td>"
					}else{
						scoreTemp = scoreTemp + "<td data-id='"+assignment[i]+"' class='"+hide+"'>"+assignmentCompleteStateTemp+"</td>"
					}
				}
        csvStudents[index] = csvStudent;

				scoreHTML = scoreHTML + "<tr data-member='"+memberID+"'>"+scoreTemp+"</tr>"
      });

      //Prepare Download CSV
      var csvLines = [];
      csvLines.push(csvHeader.join(','));
      for (var i = 0; i < csvStudents.length; i ++) {
        csvLines.push(csvStudents[i].join(','));
      }
      var blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;'});
      function downloadCSVIE(event){
        if(navigator.msSaveBlob){
          navigator.msSaveBlob(blob, 'assingment-report.csv');
        }
      }
      var csvDownloadLink = URL.createObjectURL(blob);
      $('#download-csv-report a').attr('href', csvDownloadLink);
      $('#download-csv-report a').attr('download', 'assignment-report.csv');
      $('#download-csv-report a').attr('onclick', downloadCSVIE);

			$("#group-report-details").find("tbody").append(scoreHTML);
			if (groupReportsController.getTotalMemberCount() <= (groupReportsController.getPageNum() * groupReportsController.getPageSize())){
                $("#loadMore").hide();
            }else{
            	$("#loadMore").show();
            }
		}
		function fixedHeaderHandler(isFullscreenView) {/*
            var $fixedHeader,
                $topHeaderheight;
            if (!isFullscreenView){
                var $header = $("#group-report-details > thead").clone();
                $fixedHeader = $("#header-fixed").append($header);
                if ($fixedHeader.children().size() > 1){
                    $($fixedHeader.children()[0]).remove();
                }
                $topHeaderheight = $('body > header').height();
            }else{
                $fixedHeader = $("#header-fixed");//;.append($header);
                $topHeaderheight = 0;
            }
            $(window).off("scroll").on("scroll", function() {
                if ($("#group-report-details").length){
                    var tableOffset = $("#group-report-details").offset().top;
                    $fixedHeader.css('top', $topHeaderheight + "px");

                    $('#header-fixed').find('th:first').width($('#group-report-details th:first').width());
                    var offset = $(this).scrollTop();
                    var scrollLeft = $(this).scrollLeft();
                    $fixedHeader.css('left',$('#group-report-details').offset().left - scrollLeft + 'px');
                    $("#pagination-link-wrapper").css('left',$('#group-report-details').offset().left + $('#group-report-details').width() +  'px');
                    $("#pagination-link-wrapper").css('top', $topHeaderheight + "px");

                    if ((offset + $topHeaderheight) >= tableOffset) {
                        $fixedHeader.show();
                        $("#pagination-link-wrapper").css('position','fixed');
                    }else if (offset < tableOffset) {
                        $fixedHeader.hide();
                        $("#pagination-link-wrapper").css('position','static');
                    }
                }
             });
		 */}
		function addNewMockUI(){
			var groupActivityOffset = $(".group-activity").offset(),
			reportViewContainerOffset = $("#report-view-container-normal-view").parent().offset(),
			marginLeftForIcons = 40,
			topPos = groupActivityOffset.top - reportViewContainerOffset.top ,
			leftPos = groupActivityOffset.left - reportViewContainerOffset.left + marginLeftForIcons;

			$(".group-activity .side-nav").addClass("compressed-view");
			//Adding new css position and transition for report view container
			$("#report-view-container-normal-view").parent().addClass("extend-view");
			setTimeout(function(){
				$("#report-view-container-normal-view").parent().css({
					"margin-left":leftPos,
					"transform":'translate('+0+'px ,'+topPos+'px)',
					"position":"relative",
					"width":window.innerWidth - groupActivityOffset.left - marginLeftForIcons - 15
				});
				$("#group-details-container").css({"margin-bottom":topPos});
			},200)

        }
        function fullScreen(container, informationContainer) {
            backContainer = $(container);
            $('header').addClass('hide');
            $('footer').addClass('hide');
            $('body').addClass('full-height');
            $('body').prepend($(pageTemplate).find('#report-full-page-template').html());
            $('#report-view-container-fullscreen-view').html($(informationContainer).html());
            backContainer.addClass('hide');
            fixedHeaderHandler(true);
            bindExitEvents();
        }

        function postCallBack(report){
            report = report.response;
            //renderMemberList(report.groupMembers);
            //renderGroupReport(report.assignments, report.groupMembers, report.member_assignment);
			for(var i in report.groupMembers){
				groupMembers.push(report.groupMembers[i]);
			}
			for(var key in report.member_assignment[0]){
				scoreList[key] = report.member_assignment[0][key];
			}
			renderReportHeader(report.assignments, report.groupMembers, report.member_assignment,false);
            setData(report);
            bindEvents();
        }

        function formQuizRelatedConceptList(concept) {
            var conceptArray = concept.domains;
            $.each(conceptArray, function(index, conceptList){
                $('#quiz-concept-list-hidden').append('<li class="concept-list-name"><a class="js-concept-list-name" data-handle="' + conceptList.handle + '">' + conceptList.name + '</a></li>');
            });

        }

		function loadNextPage(){
        //function loadNextPage(assignments, memberList, scores){ // Changes for member sorting
            groupReportsController.setPageNum(groupReportsController.getPageNum() + 1);
			groupReportsController.loadData(postCallBack);
            /* Changes for Member Sorting
            var currentPageMemberList = memberList.slice((groupReportsController.getPageNum()-1)*5, groupReportsController.getPageNum()*5);
            renderMemberList(currentPageMemberList);
            renderGroupReport(assignments, currentPageMemberList, scores);
            bindEvents(assignments, memberList, scores);
            */
            // groupReportsController.loadData(postCallBack);
        }

        function setData(reportData){
            groupReportsController.setData(reportData);
        }

		function loadPreviousPage(){
        //function loadPreviousPage(assignments, memberList, scores){ // changes for member sorting
            groupReportsController.setPageNum(groupReportsController.getPageNum() - 1);
			groupReportsController.loadData(postCallBack);
            /* Changes for member sorting
            var currentPageMemberList = memberList.slice((groupReportsController.getPageNum()-1)*5, groupReportsController.getPageNum()*5);
            renderMemberList(currentPageMemberList);
            renderGroupReport(assignments, currentPageMemberList, scores);
            bindEvents(assignments, memberList, scores);
            */
        }

        function formQuizRelatedConceptList(concept) {
            var conceptArray = concept.domains;
            $.each(conceptArray, function(index, conceptList){
                $('#quiz-concept-list-hidden').append('<li class="concept-list-name"><a class="js-concept-list-name" data-handle="' + conceptList.handle + '">' + conceptList.name + '</a></li>');
            });

        }

        this.render = render;

    }
    return new groupReportsLeaderNonZeroView();
});
