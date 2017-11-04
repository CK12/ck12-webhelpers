/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Shivprasad
 *
 * $Id$
 */

define( ["jquery","common/utils/concept_coversheet", "modalityAssign/modality.assign.lib"], 
    function($, coverSheet, modalitylib) {
        'use strict';

        function practiceBadge(obj){
	        var practiceModality = {},
	         	practiceBadgeRendered = false,
                conceptCollectionHandle = false,
                collectionCreatorID = 3,
	         	encodedId = '',
	         	handle = '',
	         	assessmentPresent = false,
	         	MODALITY_INFO_URL = '/flx/browse/modality/artifact/@@encodedId@@?termOnly=true&format=json',
	        	MODALITY_ITEM_URL = '/flx/get/minimal/modalities/@@encodedId@@?pageSize=1',
	        	conceptTitle = '',
	        	modalitiesPresent = false,
	        	defaultPracticeModality = null,
	        	adaptive = true,
	        	showNextConcept = /book/.test(window.location.pathname) ? "&nextPractice=false" : "",
    			_repeat = 0,
    			isGoalAchieved=false,
    			isUserLoggedIn = false,
    			isMemoryBoostPop = false,
    			isShowWidget=true,
    			practiceObj = {
	        			
	        	},
    			modalityLib = obj && obj.modalitylib,
    			collectionData = null;


    		function init(options){
	        	encodedId = options.encodedId? options.encodedId : '';
	        	handle = options.handle? options.handle : '';
	        	if(options.collection){
	        		conceptCollectionHandle = options.collection.collectionHandle+'-::-'+options.collection.conceptCollectionAbsoluteHandle
	        	}else {
	        		conceptCollectionHandle = options.conceptCollectionHandle ? options.conceptCollectionHandle : false;
	        	}
	        	collectionCreatorID = options.collectionCreatorID ? options.collectionCreatorID : 3;
	        	if(conceptCollectionHandle && !window.js_collection_data){
	        		window.js_collection_data = {
	        				"collection" : {
		        				"handle" : options.collection.collectionHandle,
		        				"creatorID" : collectionCreatorID,
		        				"descendantCollection" : {
		        					"handle" : conceptCollectionHandle
		        				}
	        				}
	        		}
	        	}
	        	if(encodedId && handle){
	        		$(".practice-badge").attr("data-encodedid",encodedId).attr("data-handle",handle);
	        		initModalities(conceptCollectionHandle, collectionCreatorID);
	        	}
	        }

        	function bindEvents(){
        		//TODO
        	}

        	function initModalities(conceptCollectionHandle, collectionCreatorID, retry) {
        		var url =  MODALITY_INFO_URL.replace("@@encodedId@@", encodedId);
                if (conceptCollectionHandle)
                    url = url + '&conceptCollectionHandle=' + conceptCollectionHandle + '&collectionCreatorID=' + collectionCreatorID;
                $.ajaxSetup({
            		"cache":true,
					"cacheControl":"max-age=86400"
            	});
                $.getJSON(url, function(data){

	        		var	modalitiesData = {},
	        			markup = [],
	        			url = MODALITY_ITEM_URL,
	        			i = 0;
	        		if(data && data.response && data.response.results && data.response.results.length !== 0 && data.response.results[0].collection){
	        			collectionData = data.response.results[0].collection;
	        		}
	        		if(data && data.response && data.response.results && data.response.results.length !== 0 && data.response.results[0].modalityCount){
	        			handle = data.response.results[0].handle;
	        			conceptTitle = data.response.results[0].name;

	            		url = url.replace("@@encodedId@@", encodedId);

	            		for(i in data.response.results[0].modalityCount){
	            			if (i === "asmtpractice") {
	            				assessmentPresent = true;
	            				practiceModality.assessmentPresent = true;
	            				url = url + '&modalities=asmtpractice&ownedBy=ck12';
	            			}
	            			modalitiesPresent = true;
	            		}
	            		if(modalitiesPresent){
                            if (conceptCollectionHandle)
                                url = url + '&conceptCollectionHandle=' + conceptCollectionHandle + '&collectionCreatorID=' + collectionCreatorID;
                            $.ajaxSetup({
                        		"cache":true,
            					"cacheControl":"max-age=86400"
                        	});
                            $.getJSON(url, function(data){

	            				if(data && data.response && data.response.domain && data.response.domain.modalities && data.response.domain.modalities.length !== 0){
	            					for(i=0;i<data.response.domain.modalities.length;i++){
	            						getDefaultPracticeDetails(data.response.domain.modalities[i]);
	            					}
	            					/*if(data.response.domain.modalities.length > 0 && data.response.domain.modalities[0].collections && data.response.domain.modalities[0].collections.length > 0){
	            						collectionData = data.response.domain.modalities[0].collections[0];
	            					}*/
	            					
	            					if(!collectionData && data.response.domain.modalities[0].collections && data.response.domain.modalities[0].collections.length > 0){
	            	        			for(var i = 0; i < data.response.domain.modalities[0].collections.length; i++){
	            	        				if(data.response.domain.modalities[0].collections[i].isCanonical){
	            	        					collectionData = data.response.domain.modalities[0].collections[i];
	            	        					break;
	            	        				}
	            	        			}
	            	        		}
	            					
	            					if(!practiceBadgeRendered){
	            							if(adaptive){
	            								renderAdaptivePracticeBadge();
	            							}else{
	            								renderPracticeBadge();
	            							}

	            	                	practiceBadgeRendered = true;
	            	                }
	            	        		bindEvents();
	                			}
	                		});
	            		}
					}
					// We don't need to be end up in an infinite loop, hence check for retry flag
                    else if (!retry && data && data.response && data.response.redirectedConcept && data.responseHeader.status === 2063) {
                        encodedId = data.response.redirectedConcept.encodedID;
                        initModalities(conceptCollectionHandle, collectionCreatorID, true);
                    }
	        	});
        	}

        	function getDefaultPracticeDetails(m){
            	//first practice perma
            	if(!practiceModality.perma){
            		practiceModality.perma = m.perma.replace("asmtpractice","practice");
            	}

            	//default practice perma
            	if($.trim(m.creator) === "CK-12"){
            		defaultPracticeModality = m;
            		practiceModality.perma = m.perma.replace("asmtpractice","practice");
            	}
        	}
        	
        	function renderAdaptivePracticeBadge(){
        		var url = "/assessment/api/get/info/test/@@PERMA@@?adaptive=true&checkFreeAttempts=True&checkUserLogin=true&spacedSchedule=True";

        		if(collectionData && collectionData.collectionHandle){
        			url += "&collectionHandle=" + collectionData.collectionHandle;
        		}

	        	//if asmtpractice modality present then show practice badge
	            if(practiceModality && practiceModality.assessmentPresent){
	            	url = url.replace("@@PERMA@@", practiceModality.perma);
	            	//get practice details
	            	//http://astro.ck12.org/assessment/api/get/summary/testScores/my/test/practice/Principles-of-Biology-Practice?includeHighest=True&includeLatest=False&checkFreeAttempts=True
	            	$.ajax({
	            		"url": url,
	            		"cache" : false,
	            		"dataType" : "json",
	            		"success": function(data){
	            			var score = null,
	            				testType = "practice",
	            				scoreNum = 0,
	            				answerToComplete,
	            				correctAnswer,
	            				questionCount = 0,
	            				badgeDetails = {},
	            				completeQuestionsCount,
	            				isCreator = true;
                            var isTeacher =  window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
						    if (!data.response.test) {
						    	return;
						    }
                            if (data.response.test && !data.response.test.eta) {
                                data.response.test.eta = 600; // Default to 10 mins
                            }
                            if(data && data.response && data.response.spacedSchedule){
                            	badgeDetails["spacedSchedule"]=data.response.spacedSchedule;
                            }
			    if (data.response.test.userLogin) {
			    				isUserLoggedIn = true;
			    				if(window.artifact_breadcrumbs) {
			    					for(var i =0; i < window.artifact_breadcrumbs.length; i++){
			    						if(window.artifact_breadcrumbs[i].realm){
			    							isCreator = false;
			    						}
			    					}
			    					//isCreator = (window.artifact_breadcrumbs[0].realm) ? false : true;
			    				}
		    					if (isTeacher) {
		    						if(data.response.test.artifactID){
		    							practiceObj.artifactId = data.response.test.artifactID;
		    							practiceObj.title = data.response.test.title;
		    						}
                                    if(data.response.test.eta && data.response.test.eta !== null){
                                        score = data.response;
                                        badgeDetails["modality"]=practiceModality;
                                        badgeDetails["score"]=score;
                                        initNewPracticeBadge(badgeDetails);
                                        initPracticeBadgeEvents({"user": true, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});

                                    } else if(data.response.test.pointsAndAwards) {
                                        answerToComplete = data.response.test.pointsAndAwards.answersToComplete,
                                        correctAnswer = data.response.test.pointsAndAwards.correctAnswers,
                                        completeQuestionsCount = data.response.test.pointsAndAwards.goal || data.response.test.questionsCount;
                                        score = Math.round((correctAnswer/completeQuestionsCount)*100);
                                        badgeDetails["modality"]=practiceModality;
                                        badgeDetails["score"]=score;
                                        initNewPracticeBadge(badgeDetails);
                                        /*initNewPracticeBadge(practiceModality,score);*/
                                        initPracticeBadgeEvents({"user": false, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
                                    } else {
                                        badgeDetails["modality"]=practiceModality;
                                        badgeDetails["score"]=score;
                                    	initNewPracticeBadge(badgeDetails);
                                        /*initNewPracticeBadge(practiceModality,score);*/
                                        initPracticeBadgeEvents({"user": false, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
                                    }
                                } else if(data.response.test.pointsAndAwards) {
                                    answerToComplete = data.response.test.pointsAndAwards.answersToComplete,
                                    correctAnswer = data.response.test.pointsAndAwards.correctAnswers,
                                    completeQuestionsCount = data.response.test.pointsAndAwards.goal || data.response.test.questionsCount;

                                    if(data.response.test.availableQuestionsCount === 0){
                                        score = Math.round((correctAnswer/completeQuestionsCount)*100);
                                        badgeDetails["modality"]=practiceModality;
                                        badgeDetails["score"]=score;
                                        badgeDetails["questionCount"]=questionCount;
                                    	initNewPracticeBadge(badgeDetails);
                                        /*initNewPracticeBadge(practiceModality, score ,answerToComplete,questionCount);*/
                                        initPracticeBadgeEvents({"user": true, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "questionCount" : questionCount, "isTeacher": isTeacher, "isUserCreated": !isCreator });
                                    }else{
                                        score = Math.round((correctAnswer/completeQuestionsCount)*100);
                                        badgeDetails["modality"]=practiceModality;
                                        badgeDetails["score"]=score;
                                        badgeDetails["completeQuestionsCount"]=completeQuestionsCount;
                                        badgeDetails["answerToComplete"]=answerToComplete;
                                        initNewPracticeBadge(badgeDetails);
                                        initPracticeBadgeEvents({"user": true, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher, "isUserCreated": !isCreator });
                                    }
                                    if(score >= 100){
                                    	isGoalAchieved = true;
                                    }
                                    if(badgeDetails && badgeDetails.spacedSchedule){
                                    	isMemoryBoostPop  = true;
                                    }
                                    /*Practice widget loads now*/
                                    if(isCreator)
                                    	loadPracticeWidget(badgeDetails);

                                } else {
                                    score = data.response;
                                    badgeDetails["modality"]=practiceModality;
                                    badgeDetails["score"]=score;
                                    initNewPracticeBadge(badgeDetails);
                                    initPracticeBadgeEvents({"user": true, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher, "isUserCreated": !isCreator });

                                    /*Practice widget loads now*/
                                    if(isCreator)
                                    	loadPracticeWidget();
                                }

			   } else if(data.response.test.freeAttempts) {
                                score = data.response;
                                badgeDetails["modality"]=practiceModality;
                                badgeDetails["score"]=score;
                                initNewPracticeBadge(badgeDetails);
                                loadPracticeWidget();
	            				initPracticeBadgeEvents({"user": false, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
			   } else {
				   				badgeDetails["modality"]=practiceModality;
                                badgeDetails["score"]=score;
                                initNewPracticeBadge(badgeDetails);
                                loadPracticeWidget();
	            				initPracticeBadgeEvents({"user": false, "attempts": false, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
							}
	            			if(isTeacher){
	            				//$(".redirect-button").addClass("hide");
                                $("span:nth-child(1)", ".redirect-button").add("span", ".practice-button").text("Select");
                                $(".js-badge-icon").removeClass("icon-arrow_right").addClass("icon-arrow-up");
            					$(".practice-button").addClass("hide");
            					$(".practice-summary").css("margin-top",30 +'px');
            					$(".practice-badge").css("cursor","pointer");
            					$(".badge-option-container").addClass("teacher-user");
	            				//binding for hiding badge options tooltip
	            				$("body").off("click.global").on("click.global", function(evt){ 
	            					$(".badge-option-container").find(".js-more-badge-option").addClass("hide");
	            				});	
	            			}else{
	            				$(".js-badge-pipe").remove();
	            			}
	            			$(".practice-badge").removeClass("hide");
	            		},
	            		"error": function(data){
	            			//console.log("something went wrong!");
	            		}
	            	});
	            }
        	}

            function checkMemoryBoost(testObj){
            	var _memoryBoost = "",
            		difference="",
            		_spScheduleData = testObj && testObj.spacedSchedule;
            	if(_spScheduleData){
            		var today = new Date(),
        			dueDate = new Date(_spScheduleData.nextTime);
        			//difference = (today - dueDate)/(24*60*60*1000);
        			today.setHours(0,0,0,0);
            		dueDate.setHours(0,0,0,0);
        			difference = (today - dueDate)/(24*60*60*1000);

            		if(difference < 0){
            			if(testObj && testObj.isRestart){
            				_memoryBoost = {
                    				"due-msg" : "Strong",
                    				"btn-msg" : "Restart",
                    				"icon" : "icon-boost-strong",
                    				"class" : "boost-strong"
                    		}
            			}else{
            				_memoryBoost = {
                    				"due-msg" : "Strong",
                    				"btn-msg" : "Keep practicing",
                    				"icon" : "icon-boost-strong",
                    				"class" : "boost-strong"
                    		}
            			}
            		}else if(0 <= difference && difference <= 1){
            			//_memoryBoost = "due_for_review";
            			_memoryBoost = {
                				"due-msg" : "Due for review",
                				"btn-msg" : "Boost your memory",
                				"icon" : "icon-boost-due",
                				"class" : "boost-due"
                		}
            			logMemoryBoostADS();
            		}else if(1 < difference){
            			//_memoryBoost = "overdue";
            			_memoryBoost = {
                				"due-msg" : "Review overdue",
                				"btn-msg" : "Boost your memory",
                				"icon" : "icon-boost-overdue",
                				"class" : "boost-overdue"
                		}
            			logMemoryBoostADS();
            		}
            	}
            	return _memoryBoost
        	}

            function logMemoryBoostADS(referrer) {
                if (window._ck12) {
                    window._ck12.logEvent('FBS_MEMORY_BOOST ', {
                        'memberID': window.ads_userid,
                        'context_eid': encodedId,
                        /*'referrer': referrer || 'practice_details'*/
                        'referrer': referrer || 'modality_details'
                    });
                }
            }

        	function renderPracticeBadge(){
        		var url = "/assessment/api/get/summary/testScores/my/test/@@PERMA@@?includeHighest=True&includeLatest=True&checkFreeAttempts=True";
	        	//if asmtpractice modality present then show practice badge
	            if(practiceModality && practiceModality.assessmentPresent){
	            	url = url.replace("@@PERMA@@", practiceModality.perma);
	            	//get practice details
	            	//http://astro.ck12.org/assessment/api/get/summary/testScores/my/test/practice/Principles-of-Biology-Practice?includeHighest=True&includeLatest=False&checkFreeAttempts=True
	            	$.ajax({
	            		"url": url,
	            		"cache" : false,
	            		"dataType" : "json",
	            		"success": function(data){
	            			var score = null,
	            				testType = "practice",
	            				scoreNum = 0;
                            var isTeacher =  window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
                            if(data && data.response && data.response.summary && data.response.summary.latestScore && data.response.summary.highestScore){
                                scoreNum = parseInt(data.response.summary.latestScore.attemptNum - data.response.summary.highestScore.attemptNum + 1);
                            }
	            			if(data && data.responseHeader && data.responseHeader.status == "11009"){
	            				//practice attempts left show
	            				initPracticeBadge(practiceModality, score);
	            				initPracticeBadgeEvents({"user": false, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
	            				$(".practice-badge").removeClass("hide");
	            			}
	            			else if(data && data.responseHeader && data.responseHeader.status == "13029"){
	            				initPracticeBadge(practiceModality, score);
	            				initPracticeBadgeEvents({"user": false, "attempts": false, "perma" : practiceModality.perma, "score" : score,"scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
	            				$(".practice-badge").removeClass("hide");
	            			}
	            			else{
	            				score = data && data.response && data.response.summary && data.response.summary.highestScore && data.response.summary.highestScore;
	            				if(score && score.score !== undefined){
	            					testType = getTestType(score);
	            					score = parseInt(score.score, 10)/parseInt(score.questionsCount, 10) * 100;
	            					score = parseInt(score * 10, 10)/10;
	            					initPracticeBadge(practiceModality, score);
	                				initPracticeBadgeEvents({"user": true, "data": data, "perma" : practiceModality.perma, "score" : score,"scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
	            				}else{
	            					initPracticeBadge(practiceModality, null);
	                				initPracticeBadgeEvents({"user": true, "data": data, "perma" : practiceModality.perma, "score" : null, "scoreOffset" : scoreNum, "testType" : testType, "isTeacher": isTeacher});
	            				}

	            				$(".practice-badge").removeClass("hide");
	            				if($($(".description").children()).hasClass("concept-title")){
	            					if(($(".concept-title").height() - $(".description").height()) > 5){
		            					$(".concept-title").append("<span class='dot'>...</span>");
		            				}
	            				}
	            			}
	            		},
	            		"error": function(data){
	            			//console.log("something went wrong!");
	            		}
	            	});
	            }
        	}

        	function renderProgress(context, score){
        		var value = 360/100*parseInt(score, 10),barColor,
	        		deg = "rotate(" + value + "deg)",
	        		width = context.width(),
	        		//height = (context.height() === width) ? context.height() : width,
	        		height = width,
	        		transformObject = {
	        			"-webkit-transform" : deg,
	        			"-moz-transform" : deg,
	        			"-ms-transform" : deg,
	        			"transform" : deg,
	        			"clip" : "rect(0px," + (width/2) + "px," + width + "px,0px)"
	        		};

        		context.css("height", height + "px");
        		context.find(".pie").css(transformObject);
            	if(score > 84.9){
            		barColor = "#b8d543";
        		}else if(score < 65){
        			barColor = "#ff6633";
        		}else{
        			barColor = "gold";
        		}
        		context.find(".hold").css("border-color", barColor);
        		context.find(".hold").css("clip", "rect(0px," + width + "px," + width + "px," + (width/2) + "px)");
        		if(score > 50){
        			context.find(".hold").addClass("gt50");
        			context.find(".pie:last").addClass("fill");
        		}else{
        			context.find(".gt50").removeClass("gt50");
        			context.find(".fill").removeClass("fill");
        		}
        		context.css("visibility", "visible");
        	}
        	function initNewPracticeBadge(badgeDetails){
        		/*var context = $("#practiceBadge .pie-container"),*/

        		var context = $(".pie-container"),
        			desc = "",
        			iconClass = "icon-running",
        			smallIconClass = "icon-running",
        			colorClass = "limegreen",
        			buttonText = "Try again",
        			smallButtonText = "Retry",
        			modality = badgeDetails && badgeDetails.modality,
        			score = badgeDetails && badgeDetails.score,
        			answerToComplete = badgeDetails && badgeDetails.answerToComplete,
        			questionCount = badgeDetails && badgeDetails.questionCount,
        			spacedSchedule = badgeDetails && badgeDetails.spacedSchedule,
        			smallParentContainer = $(".practice-badge-container.small", "#practiceBadge");

        	  if(isUserLoggedIn) {
        		 // Removing this condition "!(score && score.test && score.test.eta)" for bug 47055
        		 if(score === null || (score && score.test && score.test.eta)|| score === 0 && answerToComplete === 0){
	        		//renderProgress(context, 0);
	        		context.each(function(){
	        			renderProgress($(this), 0);
	        		});
	        		$(".description", "#practiceBadge").html("<b>Practice </b>" + '<span class="concept-title">' + _.escape(conceptTitle) + '</span>');
	        		if(score === null || score === 0 ){
	        			score = 0;
		        		smallParentContainer.find(".small-score").html(score + "%");
	        			context.find(".large-text").html(score + "<sup>%</sup>");
	        		}else if(score && score.test && score.test.eta && score.test.eta !== null){
	        			var timeInMinutes = parseInt(score.test.eta / 60);
	        			context.find('.inner-circle').html('<div class="average-time"><span class="small-text margin-top">Estimated</span><span class="large-text">'+timeInMinutes+'</span><span class="attach-text"> mins</span><span class="small-text">to complete</span></div>');
	        			context.find('.content').addClass('hide');
	        		}else if(!(score && score.test && score.test.eta)){
	        			var timeInMinutes = 10;
	        			context.find('.inner-circle').html('<div class="average-time"><span class="small-text margin-top">Estimated</span><span class="large-text">'+timeInMinutes+'</span><span class="attach-text"> mins</span><span class="small-text">to complete</span></div>');
	        			context.find('.content').addClass('hide');
	        		}
	        		$(".icon-container", "#practiceBadge").addClass("hide");
	        		smallParentContainer.find(".redirect-button").addClass("button");
	        		smallParentContainer.find(".redirect-button i").addClass(smallIconClass);
	        	}else{
	        		//renderProgress(context, score);
	        		if(window && window.isPracticeWidgetView && !isShowWidget){
		        		context.find('.inner-circle').html("");
		        		context.find('.content').removeClass("hide");
	        		}

	        		context.each(function(){
	        			if(score > 100){
	        				renderProgress($(this), 100);
	        			}else{
	        				renderProgress($(this), score);
	        			}

	        		});
	        		smallParentContainer.find(".best-score-block,.graph-block,.small-score").removeClass("hide");
	        		//smallParentContainer.find(".small-button-text").addClass("hide");

	        		smallParentContainer.find(".small-score").html(score + "%");
	        		context.find(".large-text").html(score + "<sup>%</sup>");

	        		if(spacedSchedule){
	        			var memoryBoostMsg = checkMemoryBoost({
	        				"spacedSchedule" : spacedSchedule,
	        				"isRestart" : questionCount === 0
	        			});
	        			if(memoryBoostMsg && typeof memoryBoostMsg === "object"){
	        				$(".individual-modality").removeAttr("title");
	        				$(".practice-section",".practice-badge-container").addClass("hide-imp");
	        				$(".boost-practice-section",".practice-badge-container").removeClass("hide-imp");
	        				$(".redirect-button",".practice-badge-container").addClass("for-boost")
	        				$(".memory-boost-section",".practice-badge").removeClass("hide");
	        				$(".top-section",".practice-badge").addClass("hide");
	        				$(".boost-icon",".memory-boost-section").addClass(memoryBoostMsg['icon']);
	        				$(".boost-message",".memory-boost-section").addClass(memoryBoostMsg['class']).text(memoryBoostMsg['due-msg']);
	        				$(".button-text", "#practiceBadge").addClass("memory-boost-btn");
	        				if(memoryBoostMsg['class']!=='boost-strong'){
	        					$(".button-text", "#practiceBadge").addClass('memory-spaced-practice');
	        					$(".small-button-text",".practice-badge-container").addClass('memory-spaced-practice');
	        				}
	        				$(".icon-arrow_right", ".redirect-button").addClass("hide");
	        				buttonText = memoryBoostMsg['btn-msg'];
	        				smallButtonText = memoryBoostMsg['btn-msg'];
	        			}
	        		}else{
		        		if(score === 100 || score > 100){
		        			desc = "<b>Superstar!</b>";
		        			iconClass = "icon-star";
		        			smallIconClass = "icon-running";
		        			buttonText = "Keep Going";
		        			smallButtonText = "Keep Going";
		        		}else if(score > 84.9){
		        			desc = "<b>Great job!</b>";
		        			iconClass = "icon-trophy";
		        			smallIconClass = "icon-grps_report";
		        			buttonText = "Get "+ answerToComplete +" more correct";
		        			smallButtonText = "Keep Going";
		            	}else if(score >= 65 && score < 84.9){
		            		desc = "<b>Improve your score.</b>";
		            		colorClass = "gold";
		            		smallIconClass = "icon-running";
		            		buttonText = "Get "+ answerToComplete +" more correct";
		        			smallButtonText = "Keep Going";
		            	}else if(score > 0 && score <  64.9){
		            		desc = "<b>Improve your score.</b>";
		            		colorClass = "tangerine";
		            		smallIconClass = "icon-running";
		            		buttonText = "Get "+ answerToComplete +" more correct";
		        			smallButtonText = "Keep Going";
		            	}
		            	else if(score === 0 && answerToComplete > 0){
		            		desc = "<b>Improve your score.</b>";
		            		colorClass = "tangerine";
		            		smallIconClass = "icon-running";
		            		buttonText = "Get "+ answerToComplete +" more correct";
		        			smallButtonText = "Keep Going";
		            		//initNewPracticeBadge(practiceModality, score);
	        				//initPracticeBadgeEvents({"user": false, "attempts": true, "perma" : practiceModality.perma, "score" : score, "scoreOffset" : scoreNum, "testType" : testType});
		            	}
		        		if(questionCount === 0){
	    					buttonText = "Restart";
	    					smallButtonText = "Restart";
	    				}
	        		}

	        		$(".description", "#practiceBadge").html(desc);
            		$(".icon-container", "#practiceBadge").removeClass("hide").find("i").addClass(iconClass);
            		$(".redirect-button", smallParentContainer).find("i").addClass(smallIconClass);
            		context.addClass(colorClass);
            		$(".button-text", "#practiceBadge").text(buttonText);
            		smallParentContainer.find(".small-button-text").text(smallButtonText);
	        	}
        	  }	else {
        		  $(".description", "#practiceBadge").html("<b>Practice </b>" + '<span class="concept-title">' + _.escape(conceptTitle) + '</span>');
        		  context.each(function(){
	        			renderProgress($(this), 0);
	        	  });
        		  if(score && score.test && score.test.eta && score.test.eta !== null){
	        			var timeInMinutes = parseInt(score.test.eta / 60);
	        			context.find('.inner-circle').html('<div class="average-time"><span class="small-text margin-top">Estimated</span><span class="large-text">'+timeInMinutes+'</span><span class="attach-text"> mins</span><span class="small-text">to complete</span></div>');
	        			context.find('.content').addClass('hide');
	        		}else if(!(score && score.test && score.test.eta)){
	        			var timeInMinutes = 10;
	        			context.find('.inner-circle').html('<div class="average-time"><span class="small-text margin-top">Estimated</span><span class="large-text">'+timeInMinutes+'</span><span class="attach-text"> mins</span><span class="small-text">to complete</span></div>');
	        			context.find('.content').addClass('hide');
	        	  }
        		  $(".icon-container", "#practiceBadge").addClass("hide");
	        	  smallParentContainer.find(".redirect-button").addClass("button");
	        	  smallParentContainer.find(".redirect-button i").addClass(smallIconClass);
        	  }
        	}
        	function initPracticeBadge(modality, score){
        		var context = $("#practiceBadge .pie-container"),
        			desc = "",
        			iconClass = "icon-running",
        			smallIconClass = "icon-running",
        			colorClass = "limegreen",
        			buttonText = "Try again",
        			smallButtonText = "Retry",
        			smallParentContainer = $(".practice-badge-container.small", "#practiceBadge");
	        	if(score === null){
	        		//renderProgress(context, 0);
	        		context.each(function(){
	        			renderProgress($(this), 0);
	        		});
	        		$(".description", "#practiceBadge").html("<b>Practice </b>" + '<span class="concept-title">' + _.escape(conceptTitle) + '</span>');

	        		$(".icon-container", "#practiceBadge").addClass("hide");
	        		smallParentContainer.find(".redirect-button").addClass("button");
	        		smallParentContainer.find(".redirect-button i").addClass(smallIconClass);

	        	}else{
	        		//renderProgress(context, score);
	        		context.each(function(){
	        			renderProgress($(this), score);
	        		});
	        		smallParentContainer.find(".best-score-block,.graph-block,.small-score").removeClass("hide");
	        		//smallParentContainer.find(".small-button-text").addClass("hide");

	        		smallParentContainer.find(".small-score").html(score + "%");
	        		context.find(".large-text").html(score + "<sup>%</sup>");

	        		if(score === 100){
	        			desc = "<b>Superstar!</b>";
	        			iconClass = "icon-star";
	        			smallIconClass = "icon-grps_report";
	        			buttonText = "Track your Progress";
	        			smallButtonText = "View Progress";
	        		}else if(score > 84.9){
	        			desc = "<b>Great job!</b>";
	        			iconClass = "icon-trophy";
	        			smallIconClass = "icon-grps_report";
	        			buttonText = "Review Performance";
	        			smallButtonText = "View Progress";
	            	}else if(score < 65){
	            		desc = "<b>Improve your score.</b>";
	            		colorClass = "tangerine";
	            		smallIconClass = "icon-retry";
	            	}else{
	            		desc = "<b>You are almost there!</b>";
	            		colorClass = "gold";
	            		smallIconClass = "icon-retry";
	            	}

	        		$(".description", "#practiceBadge").html(desc);
            		$(".icon-container", "#practiceBadge").removeClass("hide").find("i").addClass(iconClass);
            		$(".redirect-button", smallParentContainer).find("i").addClass(smallIconClass);
            		context.addClass(colorClass);
            		$(".button-text", "#practiceBadge").text(buttonText);
            		smallParentContainer.find(".small-button-text").text(smallButtonText);
	        	}
        	}
        	function getRestartModal(){
        		var tmpl = [],status;

        		tmpl.push('<div id="restartAlert" class="restart-modal">');
        		tmpl.push('<div class="message-body">Your progress will be reset. Are you sure you want to restart?</div>');
        		tmpl.push('<div class="btn-cont"><input type="button" value="Cancel" class="button small dusty-grey closeModal">');
        		tmpl.push('<input type="button" value="Yes" class="button small turquoise restartActivity"></div></div>');
        		tmpl = tmpl.join("");
        		 $('body').append(tmpl);
        		 $('body').append('<div class="window-page-disable" id ="pageOverlay"></div>');

        	}

        	function generatePracticeUrl(options){
        		var practiceUrl = "",
        			memoryBoost = "";

        		if(isMemoryBoostPop && $(".practice-badge-container").find(".memory-spaced-practice").length){
                   	memoryBoost = "&spractice=true&seid="+$(".practice-badge").attr("data-encodedid");
    			}

        		if(!isGoalAchieved || options && options.fromBadge){
        			practiceUrl = "/assessment/ui/?test/view/practice/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() + "&"  +showNextConcept+"&referrer=practice_badge&fromPracticeWidget=true"+"&"+memoryBoost+"&repeat=" + (_repeat++);
        		}else{
        			practiceUrl = "/assessment/ui/?test/detail/practice/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() + "&"  +showNextConcept+"&referrer=practice_badge&fromPracticeWidget=true"+"&"+memoryBoost;
        			if(isMemoryBoostPop && $(".practice-badge-container").find(".memory-spaced-practice").length){
        				practiceUrl = "/assessment/ui/?test/view/practice/"  + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() + "&" + memoryBoost + showNextConcept+"&referrer=practice_badge&fromPracticeWidget=true" ;
        			}
        		}

        		return practiceUrl;
        	}

            //utility function to create practice URl
            function widgetPracticeUrlUtility(options){
                var practiceUrl = "",
                memoryBoost = "",
                score="",
                spacedSchedule = options && options.spacedScheduleObject,
                isMemoryBoostPop = spacedSchedule ? true : false,
                encodedId=options && options.encodedId,
                isGoalAchieved=false,
                practiceHandle = options && options.practiceHandle,
                branchHandle = options &&  options.branchHandle,
                pointsAndAwards = options && options.pointsAndAwards,
                collectionInfo = options && options.collectionInfo || "",
                correctAnswer = pointsAndAwards && pointsAndAwards.correctAnswers,
                completeQuestionsCount = pointsAndAwards && ((pointsAndAwards.pointsAndAwards && pointsAndAwards.pointsAndAwards.goal) || pointsAndAwards.questionsCount),
                showNextConcept= "&nextPractice="+options.showNextConcept;

                var memoryBoostMsg = checkMemoryBoost({
                    "spacedSchedule" : spacedSchedule,
                    "isRestart" :  false
                });

                if(correctAnswer){
                    score = Math.round((correctAnswer/completeQuestionsCount)*100);
                    if(score >= 100){
                        isGoalAchieved = true;
                    }
                }

                if(isMemoryBoostPop && (memoryBoostMsg && memoryBoostMsg['class']!=='boost-strong')){
                    memoryBoost = "&spractice=true&seid="+encodedId;
                }
                if(!isGoalAchieved){
                    practiceUrl = "/assessment/ui/?test/view/practice/" + branchHandle +"/" + practiceHandle.toLowerCase() + collectionInfo + "&"  +showNextConcept+"&referrer=practice_badge&fromPracticeWidget=true"+"&"+memoryBoost+"&repeat=" + (_repeat++);
                }else{
                    practiceUrl = "/assessment/ui/?test/detail/practice/" +branchHandle +"/" + practiceHandle.toLowerCase() + collectionInfo + "&"  +showNextConcept+"&referrer=practice_badge&fromPracticeWidget=true"+"&"+memoryBoost;
                    if(isMemoryBoostPop && (memoryBoostMsg && memoryBoostMsg['class']!=='boost-strong')){
                        practiceUrl = "/assessment/ui/?test/view/practice/"  + branchHandle +"/" + practiceHandle.toLowerCase() + collectionInfo + "&" + memoryBoost + showNextConcept+"&referrer=practice_badge&fromPracticeWidget=true" ;
                    }
                }

                return practiceUrl;

            }

        	function getCollectionData(){
    			var collectionParams = "",
    				conceptCollectionHandle = "";

    			if(collectionData && collectionData.collectionCreatorID > 0 && collectionData.collectionCreatorID === 3){
    				conceptCollectionHandle = collectionData.collectionHandle + "-::-" + collectionData.conceptCollectionAbsoluteHandle;
    				collectionParams = "&collectionHandle=" + collectionData.collectionHandle + "&collectionCreatorID=" + collectionData.collectionCreatorID + "&conceptCollectionHandle=" + conceptCollectionHandle;
        		}

    			return collectionParams;
        	}

        	function bindCustomizeBtn(){
        		if(!isUserLoggedIn){
        			$(".icon-settings_single:not(.js_signinrequired)","#leftsecondary").addClass("js_signinrequired");
        		}else{
        			$(".icon-settings_single").off("click").on("click", function(){
        				window.top.location.href = $(this).siblings("#personalize_link").attr("href");
        			});
        		}
        	}

        	function loadPracticeWidget(options){
        		if($(window).width()<=1024){
        			$(".practice-badge-wrapper").removeClass("hide");
        		}
        		if($(window).height()<=768){
        			var viewHeight = $(window).height(),
        				headerHeight = 110,
        				height = viewHeight - headerHeight -110
        			
        			$("#practiceWidget").find(".widget-iframe").css({
        				"min-height":height+"px",
        				"height":height+"px",
        			})
        			$("#practiceWidget").find(".widget-container").css({
        				"min-height":height+"px",
        				"height":height+20+"px",
        			})
        		}
        		
        		if($("#practiceWidget").children().hasClass("sticky-widget"))
        			$("#practiceWidget").children().removeClass("sticky-widget").removeClass("sticky-widget-full")
        			
        		bindCustomizeBtn();
        		if(window && window.isPracticeWidgetView && isShowWidget){

            		var practiceUrl = generatePracticeUrl(options),
        				widgetSection = "practiceWidget",
        				settings = {
       	        			 "onMinimize" : onMinimizeCallback,
    	        			 "onMaximize" : onMaximizeCallback,
    	        			 "onNormalize" : onNormalizeCallback
    	        		 };

	        		 window.practiceWidgetRenderer && window.practiceWidgetRenderer.render(widgetSection,practiceUrl,settings);
        		}
        	}

        	/*For now maximize and normalize callbacks are same but may change in future so separate handling*/
        	function onNormalizeCallback(){
        		//scrollNone(false);
        		$("#practiceWidget").removeClass("practiceWidget-static-class");
        		$("#practiceWidget").children().removeClass("sticky-widget-full")
        		if($(window).height()<=768){
        			var viewHeight = $(window).height(),
        				headerHeight = 110,
        				height = viewHeight - headerHeight -110
        			
        			$("#practiceWidget").find(".widget-iframe").css({
        				"min-height":height+"px",
        				"height":height+"px",
        			})
        			$("#practiceWidget").find(".widget-container").css({
        				"min-height":height+"px",
        				"height":height+20+"px",
        			})
        		}else{
        			$(".widget-iframe").css("height","600px");
        		}
        		var widgetWindow = document.getElementsByClassName("widget-iframe")[0].contentWindow;
        		if(widgetWindow && widgetWindow.handleReportView){
        			widgetWindow.setTimeout(function(){
        				widgetWindow.handleReportView();
        			},500);
        		}
        	}

        	function onMinimizeCallback(){
        		showBadgeSection();
        		window.scrollTo(0,0)
   			 	console.log('Practice widget loading...');
        	}

        	function onMaximizeCallback(){
        		var widgetWindow = document.getElementsByClassName("widget-iframe")[0].contentWindow;
        		$("#practiceWidget").addClass("practiceWidget-static-class");
        		$("#practiceWidget").children().addClass("sticky-widget-full")
        		window.scrollTo(0,0)
        		if($(window).height()<=768){
        			
        			$("#practiceWidget").find(".widget-iframe").css({
        				"min-height":"auto",
        				"height":"auto",
        			})
        			$("#practiceWidget").find(".widget-container").css({
        				"min-height":"auto",
        				"height":"auto",
        			})
        		}
        		//scrollNone(true);
        		if(widgetWindow && widgetWindow.handleReportView){
        			widgetWindow.setTimeout(function(){
        				widgetWindow.handleReportView();
        			},500);
        		}
        	}

        	function scrollNone(flag){
        		if(flag)
        			$('body').css({"overflow":"hidden"});
        		else
        			$('body').css({"overflow":"visible"});
        	}

        	function showBadgeSection(){
        		var widgetWindow = document.getElementsByClassName("widget-iframe")[0].contentWindow;
        		isShowWidget=false;
        		if(widgetWindow && widgetWindow.submitTestFromWidget){
        			widgetWindow.submitTestFromWidget();
        		}
        		/*To get updated status of practice scores*/
        		renderAdaptivePracticeBadge();
        		$("#practiceWidget").addClass("hide");
        		$("#details_tabs").addClass("large-11").removeClass("large-8 change-width");
        		$("#nav_artifact").parent().removeClass("change-width");
        		window.setTimeout(function(){
        			$(".practice-badge-wrapper").removeClass("hide");
        		},500);
        	}

        	function showWidgetSection(){
        		isShowWidget=true;
        		$(".practice-badge-wrapper").addClass("hide");
        		$("#details_tabs").removeClass("large-11").addClass("large-8 change-width");
        		$("#nav_artifact").parent().addClass("change-width");
        		window.setTimeout(function(){
        			loadPracticeWidget({
        				"fromBadge" : true
        			});
        			$("#practiceWidget").removeClass("hide");
        		},500);
        	}

        	window.loginCheck = function() {
        		if($.cookie('widgetUserLogin')) {
        			$('#top_nav_signin').trigger('click');
        			return false;
        		}
        		else
        			return true;
        	}

        	function initPracticeBadgeEvents(options){
        		var showCoverSheet = null,
	        		showLogin = (options && !options.user && !options.attempts),
	        		redirectToReportTunnel = null,
	        		percentage = options && options.score,
	        		ep = window.location.href,
                    showModalityPage = options.isTeacher && getCollectionData()==="",
	        		perma = (options.perma && options.perma.charAt(0) === "/") ? options.perma.substring(1) : options.perma;

	        	showCoverSheet = (!showLogin && percentage === null); //show Coversheet if user has not tried the practice yet
	        	redirectToReportTunnel = percentage && percentage > 84.9;
	        	var supportsOrientationChange = "onorientationchange" in window,
	            orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

	        	$("body").off("click.loadCoverSheet",".practice-badge-container").on("click.loadCoverSheet",".practice-badge-container",function(e){
	        		e.stopPropagation();
	        		if(options && (options.isTeacher || options.isUserCreated) || !(window && window.isPracticeWidgetView)){
	        			if(options.isTeacher && ($(e.target).hasClass("redirect-button") || $(e.target).parents(".redirect-button").length === 1)){
	        				toggleBadgeOptions($(".redirect-button",".badge-option-container"));
	        			}else{
	        				bindBadgeWithoutWidget.call($(this)[0],e);
	        			}
	        		}else{
	        			if($(window).width()<=1024){
	        				bindBadgeWithoutWidget.call($(this)[0],e);
	        			}else{
	        				bindBadgeForWidget.call($(this)[0],e);
	        			}

	        		}
	        	});
	        	$(window).off("scroll").on("scroll",function(){
	        		if(window.isPracticeWidgetView){
						if($("#nav_artifact") && $("#nav_artifact").length > 0){
							var visibleDistance = parseInt($("#nav_artifact").offset().top) + parseInt($("#nav_artifact").height()) - parseInt($(".sticky-widget").height());
		        			var distance = $("#practiceWidget").offset().top -100 /*headerHeight*/ ;
			        		
		        			if ( $(window).scrollTop() >= distance ) {
			        			$("#practiceWidget").children().addClass('sticky-widget')
			        	    }else{
			        	    	$("#practiceWidget").children().removeClass('sticky-widget')
			        	    }
			        		
			        		if($(".sticky-widget").length > 0 && $(".sticky-widget").offset().top >= visibleDistance){
			        			$(".sticky-widget").addClass("not-visible");
			        		}else{
			        			$(".sticky-widget").removeClass("not-visible");
			        		}							
						}
	        		}
	        	});
	        	
	        	//change for bug#57857
	        	$(window).on('load', function () {
	        	    // Only wire up the resize handler after loading is complete to prevent fire of resize before page is loaded.
		        	$(window).on(orientationEvent,function(){
		        		var isTeacher =  window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
		        		if(window.isPracticeWidgetView){
		        			if($(window).width()<=1024){
		        				$(".practice-badge-wrapper").removeClass("hide");
			        		}else if($(window).width()>1024){
			        			if(isShowWidget && !isTeacher){
			        				$(".practice-badge-wrapper").addClass("hide");
			        			}
			        		}
		        		}
		        	});
	        	});
	        	
	        	function toggleBadgeOptions(elem){
	        		elem.siblings(".js-more-badge-option").toggleClass("hide");
	        	}

	        	function bindBadgeForWidget(e){
	        		var memoryBoost ="",
                	isMemoryBoost = false;

	        		if($(this).find(".memory-spaced-practice").length){
	                	isMemoryBoost = true;
	                	memoryBoost = "&spractice=true&seid="+$(this).closest(".practice-badge").attr("data-encodedid");
	                }
	        		if($(e.target).hasClass("boost-tooltip")){
	                	$(".tooltip-info",".practice-badge").toggleClass("hide");
	                	return false;
	                }
	        		if($(e.target).hasClass("boost-overdue") || $(e.target).hasClass("memory-icon") || $(e.target).parents().hasClass("memory-boost-section")){
	        			e.stopPropagation();
	        			e.preventDefault();
	        		}else{
		        		showWidgetSection();
	        		}
	        	}

	        	function bindBadgeWithoutWidget(e){

                    var memoryBoost ="",
                    	isMemoryBoost = false;

                    if($(this).find(".memory-spaced-practice").length){
                    	isMemoryBoost = true;
                    	memoryBoost = "&spractice=true&seid="+$(this).closest(".practice-badge").attr("data-encodedid");
                    }
	        		if($(e.target).hasClass("boost-tooltip")){
                    	$(".tooltip-info",".practice-badge").toggleClass("hide");
                    	return false;
                    }
	        		if($(e.target).hasClass("boost-overdue") || $(e.target).hasClass("memory-icon") || $(e.target).parents().hasClass("memory-boost-section")){
	        			e.stopPropagation();
	        			e.preventDefault();
	        		}
                    else{
                    	if(options && options.isTeacher){
                        	if($(e.target).hasClass("js-assign-btn")){
                        		if (window.ck12_signed_in) {
                                    var modalityOptions = {
                            			"title" : practiceObj.title,
                            			"artifactID" : practiceObj.artifactId
                                    };
                                    // Set the collection data
                                    if (collectionData && collectionData.collectionCreatorID && !(window.artifact_json && window.artifact_json.collections && window.artifact_json.collections.length > 0)) {
                                        modalityOptions.collectionData = collectionData;
                                    }
                            		modalityLib.init(modalityOptions);
                                }else{
                                    $.flxweb.alertToSignin();
                                }                        		
                        		return false;
                        	}
                        	if(!$(e.target).hasClass("js-preview-btn")){
                        		return false;
                        	}                    		
                    	}
    	        		if (showModalityPage) {
                            var loc = '/' + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() + '/' + defaultPracticeModality.domain.handle  + '/' + defaultPracticeModality.perma + '?referrer=practice_badge' + showNextConcept;
                            window.location.href = loc;
                        } else if(showCoverSheet) {
    	                	var target = $(this).closest(".practice-badge"),
    	                		handle = target.attr("data-handle"),
    	        				encodedId = target.attr("data-encodedid");
    	                	coverSheet.init({
    	                		"handle": handle,
    	                		"encodedId": encodedId,
    	                		"conceptTitle": conceptTitle,
    	                		"callback": $.noop,
    	                		"referrer": "practice_badge",
    	                		"defaultPracticeModality": defaultPracticeModality
    	                	});
    	            	}else if(showLogin){
    	            		window.location.href = "/assessment/ui/?test/view/"+ options.testType + "/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() + "&" + showNextConcept+ "&referrer=practice_badge&ep=" + encodeURIComponent(ep);
    	            		//show login popup with exausted attempts message
    	            	}else if(adaptive && options.questionCount == 0 && !isMemoryBoost){
    	            		    getRestartModal();
    	            		    $(".closeModal").off("click").on("click",function(){
    	                			$("body").find("#restartAlert").remove();
    	                			$("#pageOverlay").remove();
    	                		});
    	                		$(".restartActivity").off("click").on("click",function(){
    	                			window.location.href = "/assessment/ui/?test/view/"+options.testType + "/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() +  "&" + showNextConcept + "&restartPractice=true" + "&referrer=practice_badge&ep=" + encodeURIComponent(ep);
    	                		});

    	            	}else if(adaptive && options.questionCount == 0 && isMemoryBoost){
                			window.location.href ="/assessment/ui/?test/view/"+options.testType + "/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() +  "&" + memoryBoost + showNextConcept +"&restartPractice=true" + "&referrer=practice_badge&ep=" + encodeURIComponent(ep);
                        }else if(redirectToReportTunnel) {
    	            		if(adaptive){
    	            			window.location.href = "/assessment/ui/?test/view/"+options.testType + "/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() +  "&" + memoryBoost + showNextConcept+"&referrer=practice_badge&ep=" + encodeURIComponent(ep);
    	            		}else{
    	            			if(options.scoreOffset > 0){
    		            			window.location.href = "/assessment/ui/?test/view/"+options.testType + "/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData()  +  "&scoreOffset="+ options.scoreOffset + showNextConcept +"&mode=tunnel&referrer=practice_badge&ep=" + encodeURIComponent(ep);
    		            		} else{
    		            			window.location.href ="/assessment/ui/?test/view/"+options.testType + "/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() + "&mode=tunnel"+showNextConcept+"&referrer=practice_badge&ep=" + encodeURIComponent(ep);
    		            		}
    	            		}

    	            		//form test url and redirect to assessment tunnel
    	            	}else{ //if user has attempted the practice before but score less than 84.9%
    	            		window.location.href = "/assessment/ui/?test/view/"+options.testType + "/" + defaultPracticeModality.domain.branchInfo.handle.toLowerCase() +"/" + defaultPracticeModality.handle + getCollectionData() + "&" + memoryBoost +showNextConcept+"&referrer=practice_badge&ep=" + encodeURIComponent(ep);
    	            	}
                    }

	        	}

        	}

        	function getTestType(response){
                var policy,
                    targetPolicy = "timelimit",  //policy on the basis of which we will differentiate between quiz and practice
                    resultTestType = "quiz";

                if(response.policies){
                    for(var i = 0; i < response.policies.length; i++){
                        policy = response.policies[i];
                        if(policy.name === targetPolicy){
                        	resultTestType = (parseInt(policy.value, 10) === 0) ? "practice" : "quiz";
                            break;
                        }
                    }
                }
                return resultTestType;
            }


        	this.init = init;
            this.widgetPracticeUrlUtility = widgetPracticeUrlUtility;
        }
        return new practiceBadge({
        	"modalitylib" : modalitylib
        });

    }
);
