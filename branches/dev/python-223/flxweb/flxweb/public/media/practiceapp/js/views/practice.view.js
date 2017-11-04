/* vim: set noexpandtab: */
define([
	'jquery',
	'underscore',
	'practiceapp/views/appview',
	'practiceapp/views/teacher.home',
	'practiceapp/templates/templates',
	'groups/controllers/assignment.edit',
	'common/utils/concept_coversheet'

], function ($, _, AppView, TeacherHomeView, Templates, AssignmentEditController, coverSheet)
{
    "use strict";
    
    var context, controller, self, 
    	localConfig = {
    		"subject" : "",
    		"branch" : "",
    		"practiceHandle" : ""
    };
    var lastPtype = '';

    var PracticeView = TeacherHomeView.extend({
    	'tmpl': Templates.TEACHER_HOME,
        'tmpl_subjects': _.template(Templates.SUBJECT_ROW, null, {
            'variable': 'data'
        }),
        'tmpl_tracks': _.template(Templates.CONCEPT_TRACKS_ROW_APP, null, {
            'variable': 'data'
        }),
    	'tmpl_concepts_row': _.template(Templates.CONCEPT_ROW_SCORE, null, {
            'variable': 'data'
        }),
        initialize: function() {
        	self = this;
        	_.bindAll(this, 'renderTopics', 'renderConcepts', 'renderSearch', 'renderConceptFromData', 'renderBranchFromData');
        	
        	PracticeView.__super__.initialize.apply(this, arguments); // run parent class init first
        	
        	bindTouchEvent();
        },

        events: {
        	"mousedown.subjects .js-concept-select": "showPractice",
            "click.subjects .js-node-wrapper": 'renderTopics',
            "click.subjects .js-group-assignment-nav": "showSubjects",
            "click.subjects .js-search-open": "openSearch",
            "click.subjects .js-search-close": "closeSearch",
            "click.subjects .js-search": "searchConcepts",
            "keypress.subjects #assignment-search-input": "callSearch",
            "submit #searchForm" : "searchFormHandler",
            "click.subject .subject-heading" : "showBranchList"
        },
        
        searchFormHandler : function(event){ //in IOS to show search button input type search need to be wrap inside form. added this to prevent form from submit
        	event.preventDefault();
        	return false;
        },
        
        showBranchList : function(e){
        	$(e.currentTarget).addClass("active");
        	$("#subjects-container").find(".slideinleft, .slideoutleft").removeClass("slideinleft slideoutleft");
        	$(".assignments-subjects-container").find(".subject-heading").addClass('slideoutleft');
        	$(e.currentTarget).next('.subject-content').addClass('slideinleft');
        	$(".assignments-subjects-container").removeClass("show-heading").addClass("show-content");
        	setActive("subject");
        },
        
        showSubjectList : function(){
        	var target = $(".assignments-subjects-container").find(".subject-heading.active");
        	$("#subjects-container").find(".slideinleft, .slideoutleft").removeClass("slideinleft slideoutleft");
        	$(".assignments-subjects-container").find(".subject-heading").addClass("slideinright");
        	target.removeClass("active");
        	$(".assignments-subjects-container").removeClass("show-content").addClass("show-heading");
        },
        
        renderConcepts : function(unit){
            var eID, parentHandle, count = 0, template = [], points = 0, eidArray = [];
            var that = this;
            var validModalityCounter = null,
            	concepts = unit.descendants,
            	noQuestion = false,
            	isFirst = true;

            $.each(concepts, function (index, concept) {
                parentHandle = '';
                
                if (concept.hasOwnProperty('practice')) {
                    count++;
                    eID = (concept.encodedID || '').replace(/\./g, '-');
                    
                    /*if(concept.practice.pointsAndAwards && !$.isEmptyObject(concept.practice.pointsAndAwards)){
    					points = Math.round(parseInt(concept.practice.pointsAndAwards.correctAnswers, 10)/parseInt(concept.practice.pointsAndAwards.goal, 10) * 100);
    					testScoreId = concept.practice.pointsAndAwards.testScoreID;
    					noQuestion = (concept.practice.pointsAndAwards.availableQuestionsCount === 0) ? true : false;
    				}else{
    					points = null;
    				}*/
    				
                    if(template.length > 0){
                    	isFirst = false;
                    }
                    template.push(that.tmpl_concepts_row({
                        'conceptName': concept.name || '',
                        'handle': concept.handle || '',
                        'parentHandle': parentHandle,
                        'encodedID': eID,
                        'points' : 1,
                        'isFirst' : isFirst
                    }));
                    
                    eidArray.push(eID);
                }
            });
            
            if ($(".js-search-open").is(":visible")) {
            	template = '<div class="best-scr"><div class="best-scr-cont">Best score</div></div>' + template;
            	$("#concepts-wrapper").html(template);
            	if($("#tracks-wrapper").find(".js-selected").length > 0){
            		$("#concept-heading").html($("#tracks-wrapper").find(".js-selected").html());
            	}else{
            		template = that.tmpl_tracks({
            							'conceptCount': '',
            							'trackName': unit.name || '',
            							'encodedID': unit.encodedID || ''
            					});
            		$("#concept-heading").html($(template).find(".track-name-wrapper"));
            		$("#tracks-wrapper").find("[data-encodedid='" + unit.encodedID + "']").closest(".select-track-wrapper").addClass("js-selected");
            	}
            }
            
        	addBestScoreInfo(eidArray, null, {
        		"success" : addProgressSuccess,
        		"error" : addProgressError
        	});
        },
        
        renderConceptsForTrack : function(){ //this will load the concepts for the first track as soon as tracks loaded 
        	var This = $("#tracks-wrapper").find(".js-node-name:first"),
        	appLocalStorage = (window.practiceAppHelper && window.practiceAppHelper.appLocalStorage);
        	
        	animate($("#tracks-container"), "slideinleft");
        	
        	if(This.length > 0){
        		$("[data-target=concepts-container]").find('span').attr('data-text', This.text());
        		This.closest('.select-track-wrapper').addClass('js-selected').siblings().removeClass('js-selected');
        		controller.appServices.getConceptsWithPoints(This.attr('data-encodedId')).done(function(result){
                	self.renderConcepts(result.unit);
                	if(appLocalStorage && appLocalStorage.getItem("subject") !== ""){
                    	appLocalStorage.setItem("branch", This.attr('data-encodedId'));
                    	appLocalStorage.setItem("practiceHandle", "");
                    	updateLocalConfigFromStorage();
                    }
                }).fail(function(err){
                	if(window.practiceAppHelper && window.practiceAppHelper.checkForNetwork){
                		window.practiceAppHelper.checkForNetwork();
                	}
                	 console.log("Error in getting concepts with points " + err);
                });
        	}
            if (window.practiceAppHelper) window.practiceAppHelper.logGAEventForApp("Concepts/" + This.text() + "/auto");
        },
        
        renderTopics : function(e){
        	var This, selectTab, Th, branchName,eidType = "",
            appLocalStorage = (window.practiceAppHelper && window.practiceAppHelper.appLocalStorage),
            type = "branch";
            This = $(e.target).hasClass('js-node-name') ? $(e.target) : $(e.target).closest('.js-node-wrapper').find('.js-node-name');
            selectTab = $('.js-group-assignment-nav.selected').next();
             
            if (This.text() !== selectTab.find('span').attr('data-text')) {
                if (!$('#tracks-container').is(':visible')) {
                    $('#branch-name').empty();
                    $('#tracks-wrapper, #concepts-wrapper').html(''); //as now we are loading tracks and concepts simultaneously
                    AssignmentEditController.getDescendantsLms(This.attr('data-encodedId') + '/1', this.checkForDescendantsNew);
                    if(appLocalStorage){
                    	appLocalStorage.setItem("subject", This.attr('data-encodedId'));
                    	appLocalStorage.setItem("branch", "");
                    	appLocalStorage.setItem("practiceHandle", "");
                    	updateLocalConfigFromStorage();
                    }
                } else {
                    Th = This.closest('.select-track-wrapper');
                    if(!Th.hasClass("js-selected")){
                    	Th.addClass('js-selected').siblings().removeClass('js-selected');
                    	$('#concepts-wrapper').html('');
                        controller.appServices.getConceptsWithPoints(This.attr('data-encodedId')).done(function(result){
                        	self.renderConcepts(result.unit);
                        	animate($("#concepts-container"), 'slideinleft');
                        }).fail(function(err){
                        	if(window.practiceAppHelper && window.practiceAppHelper.checkForNetwork){
                        		window.practiceAppHelper.checkForNetwork();
                        	}
                        	 console.log("Error in getting concepts with points " + err);
                        });
                    }
                    
                    if(appLocalStorage && appLocalStorage.getItem("subject") !== ""){
                    	appLocalStorage.setItem("branch", This.attr('data-encodedId'));
                    	appLocalStorage.setItem("practiceHandle", "");
                    	updateLocalConfigFromStorage();
                    }
                    
                    $("#concept-heading").html(Th.html());
                    type = "concept";
                }
                selectTab.find('span').attr('data-text', This.text());
                selectTab.removeClass('hide-important').addClass('selected').siblings().removeClass('selected');
                selectTab.next('.js-group-assignment-nav').addClass('hide-important').find('span').attr('data-text', '');
                setActive(type);
                setHeader(type);
            } else {
                selectTab.trigger('click');
                if(selectTab.attr("data-target") === "concepts-container"){
                	setActive("concept");
                	setHeader("concept");
                }else{
                	setActive(type);
                	setHeader(type);
                }
                
            }
            if (controller && controller.trigger) {
                controller.trigger("renderTopics");
            }
        },
        
        renderSearch: function(result) {
        	var eID,
        		eIDArray = ['MAT', 'SCI'],
        		eidArray = [],
        		template = [],
        		parentHandle,
        		conceptName = "",
        		isFirst = true,
				collectionData,
				collectionIndex,
				collectionHandle,
				conceptCollectionAbsoluteHandle,
				collectionTitle,
				len,
				foundCanonical;
            result = result.Artifacts;
            var term = $("#assignment-search-input").val();
            if (window.practiceAppHelper) window.practiceAppHelper.logGAEventForApp("Search/" + term);
            
            if ($('.js-search-close').is(':visible')) {
                $('#assignment-empty-search-container').removeClass('hide');
                $('#assignment-search-suggestion').parent().removeClass('hide');
                if (result.result instanceof Array && result.result.length) {
                    _.each(result.result, function (resultData) {
                    	conceptName = resultData.name;
						collectionHandle = '';
						collectionTitle = '';
                        if (resultData.hasOwnProperty('parent')) {
                            parentHandle = resultData.parent.handle || '';
                        } else {
                            parentHandle = '';
                        }

						foundCanonical = false;
						if (resultData.hasOwnProperty('collections') && resultData.collections.length) {
							collectionData = resultData.collections;
							for (collectionIndex = 0, len = collectionData.length; collectionIndex < len; collectionIndex++) {
								if (collectionData[collectionIndex].isCanonical && collectionData[collectionIndex].exactMatch) {
									collectionHandle = collectionData[collectionIndex].collectionHandle;
									collectionTitle = collectionData[collectionIndex].collectionTitle;
									conceptCollectionAbsoluteHandle = collectionData[collectionIndex].conceptCollectionAbsoluteHandle;
									conceptName = collectionData[collectionIndex].conceptCollectionTitle + " (" + collectionTitle + ")";
									// bring modality data to root level
									resultData.modalityCount = collectionData[collectionIndex].ck12ModalityCount;
									for (var modality in collectionData[collectionIndex].communityModalityCount) {
										if (resultData.modalityCount[modality]) {
											resultData.modalityCount[modality]['at grade'] = (resultData.modalityCount[modality]['at grade'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['at grade'] || 0);
											resultData.modalityCount[modality]['basic'] = (resultData.modalityCount[modality]['basic'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['basic'] || 0);
										} else {
											resultData.modalityCount[modality] = collectionData[collectionIndex].communityModalityCount[modality];
										}
									}
									foundCanonical = true;						
									break;
								} else if (collectionData[collectionIndex].isCanonical && !foundCanonical) {
									collectionHandle = collectionData[collectionIndex].collectionHandle;
									collectionTitle = collectionData[collectionIndex].collectionTitle;
									conceptCollectionAbsoluteHandle = collectionData[collectionIndex].conceptCollectionAbsoluteHandle;
									conceptName = collectionData[collectionIndex].conceptCollectionTitle + " (" + collectionTitle + ")";
									// bring modality data to root level
									resultData.modalityCount = collectionData[collectionIndex].ck12ModalityCount;
									for (var modality in collectionData[collectionIndex].communityModalityCount) {
										if (resultData.modalityCount[modality]) {
											resultData.modalityCount[modality]['at grade'] = (resultData.modalityCount[modality]['at grade'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['at grade'] || 0);
											resultData.modalityCount[modality]['basic'] = (resultData.modalityCount[modality]['basic'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['basic'] || 0);
										} else {
											resultData.modalityCount[modality] = collectionData[collectionIndex].communityModalityCount[modality];
										}
									}
									foundCanonical = true;
								}
							}
						}
						if (!foundCanonical && resultData.hasOwnProperty('branchInfo')) {
							conceptName = conceptName + " (" + resultData.branchInfo.name + ")";
						}
                        
                        if (((actualData.artifactType && actualData.artifactType === "asmtpractice") || (resultData.hasOwnProperty('modalityCount') && resultData.modalityCount.hasOwnProperty('asmtpractice'))) && $.inArray(resultData.encodedID.slice(0, 3), eIDArray) > -1) {
                            eID = (resultData.encodedID || '').replace(/\./g, '-');
                            
                            if(template.length > 0){
                            	isFirst = false;
                            }
                            template.push(self.tmpl_concepts_row({
                            	'conceptName': conceptName || '',
                                'handle': actualData.handle || '',
                                'parentHandle': parentHandle,
								'collectionHandle': collectionHandle || '',
								'conceptCollectionAbsoluteHandle': conceptCollectionAbsoluteHandle || '',
                                'encodedID': eID,
                                'points' : 1,
                                'isFirst' : isFirst
                            }));
                            
                            eidArray.push(eID);
                        }
                    });
                    
                    if(eidArray.length > 0){
                    	$('#concepts-wrapper').html(template.join(""));
                        $('.js-search-heading').removeClass('hide');
                        
                        addBestScoreInfo(eidArray, null, {
                    		"success" : addProgressSuccess,
                    		"error" : addProgressError
                    	});
                    }else{
                    	this.renderEmptySearch(result.suggestions);
                    }
                } else {
                    this.renderEmptySearch(result.suggestions);
                }
            }
        },
        
        showPractice : function(e){
        	var target = $(e.target),
        		This = $(e.target).closest('.select-concept-wrapper'),
        		handle = This.attr("data-handle"),
        		points = parseInt(This.attr("data-points"), 10),
        		testDetailUrl = encodeURIComponent('./test.detail.new.html?practice/" + handle + "-Practice&isPageView=true');
        	
        	e.preventDefault();
        	e.stopPropagation();
        	
        	if(This.closest(".blurred").length > 0){ //blurred will be added to concepts-wrapper when hints are shown so disable click in that case
        		return false;
        	}
        	
        	if(!/-Practice$/i.test(handle)){
        		handle = handle + "-Practice";
        	}
        	
        	testDetailUrl = encodeURIComponent('./test.detail.new.html?practice/' + handle + '&isPageView=true');
        	
        	if(window.practiceAppHelper && window.practiceAppHelper.appLocalStorage){
        		window.practiceAppHelper.appLocalStorage.setItem("practiceHandle", "practice/" + handle + "-Practice");
        		updateLocalConfigFromStorage();
        	}
        	
        	if(target.hasClass("js-open-practice")){ //if click on the button directly take user to test view other wise open test detail. TODO: test detail needs to be replaced with coversheet
        		if(target.attr("data-testScoreId") && target.attr("data-testScoreId") !== ""){
        			handle = target.attr("data-testScoreId");
        			window.location.href = "../../ui/views/test.detail.new.html?testScoreID=" + handle + "&mode=tunnel&ep=" + testDetailUrl;
        		}else if(target.hasClass("restartPractice")){
        			openRestartModal({
        				url : "../../ui/views/test.view.new.html?title=" + handle + "-Practice&type=practice&restartPractice=true&ep=" + testDetailUrl
        			});
        		}else{
        			window.location.href = "../../ui/views/test.view.new.html?title=" + handle + "-Practice&type=practice&ep=" + testDetailUrl;
        	   }
            }
        },
        
        renderBranchFromData : function(subjectEid, isActive){ //if isActive is true then check for search after rendering branches
        	updateTab("subject", subjectEid);
        	setActiveSubject(subjectEid);
        	AssignmentEditController.getDescendantsLms(subjectEid + '/1', self.renderBranches);
        	if(isActive){
        		self.checkSearch();
        	}
        },
        
        renderConceptFromData : function(subjectEid, branchEid, isActive){ //if isActive is true then check for search after rendering concept
        	self.renderBranchFromData(subjectEid);
        	controller.appServices.getConceptsWithPoints(branchEid).done(function(result){
        		updateTab("branch", branchEid);
        		self.renderConcepts(result.unit);
        		setHeader('concept');
        		animate($("#concepts-container"), 'slideinleft');
            	if(isActive){
            		self.checkSearch();
            	}
            }).fail(function(err){
            	if(window.practiceAppHelper && window.practiceAppHelper.checkForNetwork){
            		window.practiceAppHelper.checkForNetwork();
            	} 
            	console.log("Error in getting concepts with points " + err);
            });
        },
        
        prepareTrack : function(subjects){
        	var tracks = null;
        	if(!self.checkForDescendantError(subjects)) {
        		subjects = subjects.response;
        		tracks = subjects.term;
        		self.renderTracks(tracks);
        	}
        },
        
        renderBranches : function(subjects){
        	self.prepareTrack(subjects);
        	setHeader('branch');
        },
        
        postInitialize : function(){
        	var subjectEid, branchEid, practiceHandle, tab;
        	
        	context = this.config.app_name;
        	controller = this.controller;
        	
        	 if(window.practiceAppHelper && window.practiceAppHelper.appLocalStorage){
        		 subjectEid = window.practiceAppHelper.appLocalStorage.getItem("subject");
   	        	 branchEid = window.practiceAppHelper.appLocalStorage.getItem("branch");
   	        	 practiceHandle = window.practiceAppHelper.appLocalStorage.getItem("practiceHandle");
   	        	 
   	        	if(subjectEid && branchEid){
   	        		setActive("concept");
   	        		self.renderConceptFromData(subjectEid, branchEid, true); //check for search after rendering concepts.
   	        		window.practiceAppHelper.appLocalStorage.setItem("practiceHandle", "");
   	        		updateLocalConfigFromStorage();
   	        	}else if(subjectEid){
   	        		setActive("branch");
   	        		self.renderBranchFromData(subjectEid, true);//check for search after rendering branches.
   	        		window.practiceAppHelper.appLocalStorage.setItem("branch", "");
   	        		window.practiceAppHelper.appLocalStorage.setItem("practiceHandle", "");
   	        		updateLocalConfigFromStorage();
   	        	}else{
   	        		self.checkSearch(); //check for search
   	        		setHeader('subject');
   	        	}
   	        	
   	        	window.practiceAppHelper["backButtonHandler"] = this.backButtonHandler; //exposing this method to window level object. Currently app.js is not a require module
   	         }
        	 onOrientationChange();
         },
        
        conceptCoverSheetOpened : function(){
        	$(".js-assign-concept").addClass("hide");
        },
        
        changeState : function(newState){
        	var appLocalStorage = window.practiceAppHelper && window.practiceAppHelper.appLocalStorage;
        	
        	if(appLocalStorage && newState){
        		switch(newState){
		        	case "concepts-container":
		        		appLocalStorage.setItem("subject", localConfig.subject);
		        		appLocalStorage.setItem("branch", localConfig.branch);
		        		appLocalStorage.setItem("practiceHandle", "");
		        		this.setSearchTerm("");
		        		break;
		        	case "tracks-container":
		        		appLocalStorage.setItem("subject", localConfig.subject);
		        		appLocalStorage.setItem("branch", "");
		        		appLocalStorage.setItem("practiceHandle", "");
		        		this.setSearchTerm("");
		        		break;
		        	case "subjects-container":
		        		appLocalStorage.setItem("subject", "");
		        		appLocalStorage.setItem("branch", "");
		        		appLocalStorage.setItem("practiceHandle", "");
		        		this.setSearchTerm("");
		        		break;
	        	}
        	}
        },
        
        backButtonHandler : function(){
        	var selected = $(".js-group-assignment-nav.selected"),
        		target = null,
        		newTarget = null,
        		actionCompleted = false,
        		active = "",
                isCategoriesPage = ($("[data-name=Math]").children(":visible").length > 0);
        	
        	if(!$(".assignment-search-container").hasClass("hide")){
        		$(".js-search-close").trigger("click.subjects");
        		return true;
        	}
        	if(selected.length > 0){
        		target = selected.attr("data-target");
        		if((target === "concepts-container" && $("#tracks-container").is(":visible")) || target === "tracks-container"){
        			active = "subject";
        			newTarget = "subjects-container";
        			$("#subjects-container").find(".slideinleft, .slideoutleft").removeClass("slideinleft slideoutleft");
        		}else if(target === "concepts-container"){
        			active = "branch";
        			newTarget = "tracks-container";
        		}else if(target === "subjects-container"){
        			$("#subjects-container").find(".slideinleft, .slideoutleft").removeClass("slideinleft slideoutleft");
        			active = "subject-list";
        			newTarget = "subjects-container";
        		}
        	}
        	
        	if(active !== ""){
        		setActive(active);
        		setHeader(active);
    			actionCompleted = true;
    			self.changeState && self.changeState(newTarget);
    			
    			if(newTarget !== "subjects-container"){
        			animate($("#" + newTarget), "slideinright");
    			}else{
    				$("#subjects-container").find(".subject-heading.active").next(".subject-content").addClass("slideinright");
    			}
        	}
        	
        	if(active === "subject-list" && isCategoriesPage) { //if subject list is active then setting actionCompleted as false to 
                actionCompleted = false;
        	}
        	
        	return actionCompleted; //will close the app if actionCompleted is false (if it is subject screen).
        },
        
        checkNetwork : function(){
        	if(window.practiceAppHelper && window.practiceAppHelper.checkForNetwork){
        		window.practiceAppHelper.checkForNetwork();
        	}
        },
        
        setSearchTerm : function(searchTerm){
        	if(window.practiceAppHelper && window.practiceAppHelper.appLocalStorage){
        		window.practiceAppHelper.appLocalStorage.setItem("searchTerm", searchTerm);
        }
        },
        
        checkSearch : function(){
        	var appLocalStorage = (window.practiceAppHelper && window.practiceAppHelper.appLocalStorage) || false,
        		searchTerm = "";
        	
        	if(appLocalStorage){
        		searchTerm = appLocalStorage.getItem("searchTerm");
        		if(searchTerm){
        			window.setTimeout(function(){
        				$(".js-search-open").trigger("click");
            			$("#assignment-search-input").val(searchTerm);
            			self.searchConcepts();
        			}, 10);
        		}
        	}
        	
        	this.controller.on("renderTracks", this.renderConceptsForTrack); //this function will be called after page initialisation completes and after rendering of branches/subject/concepts
        },
        
        "animate" : animate,
        
        renderEmptySearch: function(result) {
            $('#concepts-wrapper').parent().addClass('assignment-search-no-padding');
            require(['text!groups/templates/groups.assignment.search.empty.html'], function (template) {
            	var artifactType = ("androidPracticeApp" === context) ? "asmtpractice" : "domain,asmtquiz",
            		searchVal = $.trim($('#assignment-search-input').val()).toLowerCase();

            	$('#concepts-wrapper').html(template);
                if (searchVal && result[searchVal] && result[searchVal][0] !== searchVal) {
                    $('#assignment-search-suggestion').text(result[searchVal][0]);
                    controller.appServices.searchLms({
                    	"callback" : self.checkForSearch,
                    	"value" : result[searchVal][0],
                    	"artifactType" :  artifactType
                    });
                    searchVal = '';
                } else {
                    $('#assignment-empty-search-container').removeClass('hide');
                }
            });
        }
    });
    
    function bindTouchEvent(){
    	var searchContainer = $(".assignment-search-container"),
    		searchButton = $(".js-search-open"),
    		searchOffset = Math.max(searchContainer.offset().top, searchButton.offset().top),
    		body = $("body");
    	
    	body.off("touchstart").on("touchstart", ".no-hover", function(e){
    		$(this).addClass("touch-background");
    	});
    	
    	body.off("touchend").on("touchend", ".no-hover", function(e){
    		$(".touch-background").removeClass("touch-background");
    		$(this).removeClass("touch-background");
    	});
    	
    	$(window).scroll(function(event){
    		if(body[0].scrollTop > searchOffset){
    			searchContainer.add(searchButton).addClass('fixed-top');
    		}else{
    			searchContainer.add(searchButton).removeClass('fixed-top');
    		}
    	});
    	$(window).off("orientationchange").on("orientationchange",function(){
    		onOrientationChange();
    	});
    }
    
    /**
     * When we are directly loading concepts/branch then this should be called to make current subject active
     * */
    function setActiveSubject(eid){
    	var container = $("#subjects-container");
		
    	container.find("[data-name].active").removeClass("active");
		if(/MAT\.EM/i.test(eid)){
			container.find("[data-name='Elementary Math']").addClass("active");
		}else if(/MAT/i.test(eid)){
			container.find("[data-name=Math]").addClass("active");
		}else {
			container.find("[data-name=Science]").addClass("active");
		}
		$(".assignments-subjects-container").removeClass("show-heading").addClass("show-content");
    }
    
   /* function renderProgress(context, score){
		var value = 360/100*parseInt((score > 100 ? 100 : score), 10),
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
		context.find(".hold").css("clip", "rect(0px," + width + "px," + width + "px," + (width/2) + "px)");
		if(score > 50){
			context.find(".hold").addClass("gt50");
			context.find(".pie:last").addClass("fill");
		}else{
			context.find(".gt50").removeClass("gt50");
			context.find(".fill").removeClass("fill");
		}
		
		if(score > 84.9){
			context.addClass("limegreen");
		}else if(score < 65){
			context.addClass("tangerine");
		}else{
			context.addClass("gold");
		}
		context.css("visibility", "visible");
	}*/
    
    /*function renderProgress(context, percent, options){
    	var lineColor = (options && options.lineColor) || 'black',
        	lineWidth = (options && options.lineWidth) || 3,
        	textColor = (options && options.textColor) || '#56544d',
        	textFont = (options && options.textFont) || 'bold 10px ProximaNova',
        	context, x, y, radius, deg, startAngle, endAngle, counterClockwise = false;

        var canvas = context.find("canvas")[0];
        
        if (canvas) {
        	if(percent > 84.9){
        		lineColor = "#b8d543";
    		}else if(percent < 65){
    			lineColor = "#ff6633";
    		}else{
    			lineColor = "gold";
    		}
        	
            context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            x = canvas.width / 2;
            y = canvas.height / 2;
            radius = y - parseInt((lineWidth / 2), 10) - 2;

            deg = ((360 * percent) / 100);
            startAngle = (-90 * Math.PI) / 180;
            endAngle = ((deg - 90) * Math.PI) / 180;
            endAngle = Math.round(endAngle * 100) / 100;
            counterClockwise = false;

            context.beginPath();
            context.arc(x, y, radius, 0, 2*Math.PI, false);
            context.lineWidth = lineWidth;
            context.strokeStyle = "#eee";
            context.stroke();
            
            context.beginPath();
            context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
            context.lineWidth = lineWidth;
            
            // line color
            context.strokeStyle = lineColor;
            context.stroke();

            context.font = textFont;
            context.fillStyle = textColor;
            // textAlign aligns text horizontally relative to placement
            context.textAlign = 'center';
            // textBaseline aligns text vertically relative to font style
            context.textBaseline = 'middle';
            context.fillText(percent + '%', x, y);
        }
    }*/
    
    function renderProgress(context, percent){
    	var target = context.find(".bar"),
    		r = parseInt(context.find("circle").attr("r"), 10),
    		cx = parseInt(context.find("circle").attr("cx"), 10),
    		cy = parseInt(context.find("circle").attr("cy"), 10),
    		value = percent,
    		strokeLength = 0,
    		barColor = "#eee",
    		endAngle = 0;
    	   
        	if (value < 0) { 
        		value = 0;
        	}
        	
        	if (value > 100) { 
        		value = 100;
        	}
        	
        	if(value > 84.9){
        		barColor = "#b8d543";
    		}else if(value < 65){
    			barColor = "#ff6633";
    		}else{
    			barColor = "gold";
    		}
        	
        endAngle = value*(360/100);
        
        target.attr({"d" : describeArc(cx, cy, r, 0, endAngle), "stroke" : barColor });
        context.find(".progress-label").html(percent + "%");
    }
    
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
	  
	  angleInRadians = Math.round(angleInRadians * 100)/100;

	  return {
	    x: centerX + (radius * Math.cos(angleInRadians)),
	    y: centerY + (radius * Math.sin(angleInRadians))
	  };
	}

	function describeArc(x, y, radius, startAngle, endAngle){
	    var start = polarToCartesian(x, y, radius, endAngle);
	    var end = polarToCartesian(x, y, radius, startAngle);

	    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

	    var d = [
	        "M", start.x, start.y, 
	        "A", radius, radius, 0, arcSweep, 0, end.x, end.y
	    ].join(" ");

	    return d;       
	}
    
    function addBestScoreInfo(eids, searchResultObject, callback){
    	var template = "", point = 0, scoreObject = null, eid = "";
    	
    	eids = eids.join(",");
    	eids = eids.replace(/-/g, ".");
    	controller.appServices.getPAndAByEids(eids).done(function(response){
    		var pointsAndAwards = response.pointsAndAwards;
    		if(callback && typeof callback.success === "function"){
    			callback.success(pointsAndAwards);
    		}else{
    			for (var PA in pointsAndAwards){
        			scoreObject = pointsAndAwards[PA];
        			eid = PA.replace(/\./g, "-");
        			point = (parseInt(scoreObject.correctAnswers, 10))/(parseInt(scoreObject.goal, 10));
        			point = Math.round(point*100);
        			
        			if($.isEmptyObject(searchResultObject[eid]) === false){
        				searchResultObject[eid].points = point;
        			}
        			
        			if(scoreObject.testScoreID){
        				searchResultObject[eid].testScoreId = scoreObject._id;
        			}
        			
        			if(scoreObject.availableQuestionsCount === 0) {
        				searchResultObject[eid].noQuestion = true;
        			}
        		}
    			renderSearchResult(searchResultObject);
    		}
    	}).fail(function(){
    		if(callback && typeof callback.error === "function"){
    			callback.error();
    		}else{
    			renderSearchResult(searchResultObject);
    		}
    	});
    }
    
    function addProgressSuccess(pointsAndAwards){
    	var target = null,
    		pAndA = null,
    		container = $("#concepts-wrapper"),
    		point = 0;
    	for(var PA in pointsAndAwards){
    		pAndA = pointsAndAwards[PA];
    		PA = PA.replace(/\./g, "-");
    		
    		target = container.find("[data-encodedid=" + PA + "]");
    		
    		if(target.length > 0){
    			point = (parseInt(pAndA.correctAnswers, 10))/(parseInt(pAndA.goal, 10));
    			point = Math.round(point*100);
    			target.attr("data-points", point);
    			target.find(".concept-score").addClass("active");
    			target.find(".best-score-value").text(point + "%");
    			renderProgress(target.find(".progress-container"), point);
    		}
    	}
    	
    	container.find(".concept-score:not(.active)").addClass("hide");
    }
    
    function addProgressError(){
    	
    }
    
    function renderSearchResult(searchResultObject){
    	var template = "";
    	for(var eid in searchResultObject){
    		if(searchResultObject.hasOwnProperty(eid)){
    			template = template + self.tmpl_concepts_row(searchResultObject[eid]);
    		}
    	}
    	
    	$('#concepts-wrapper').html(template);
        $('.js-search-heading').removeClass('hide');
        
        $("#concepts-wrapper").find("[data-points]").each(function(){
        	$(this).find(".concept-score").removeClass("hide");
        	renderProgress($(this).find(".progress-container"), parseInt($(this).attr("data-points"), 10));
        });
        
        self.setSearchTerm($("#assignment-search-input").val()); //set searchTerm in local storage and will clear it on closeSearch function
    }
    
    function updateTab(tab, eid){
    	var target = (tab === "subject") ? "tracks-container" : "concepts-container",
    		contentTarget = (tab === "subject") ? $("#subjects-container") : $("#tracks-container"),
    		container = $("#" + target), 
    		name = contentTarget.find("[data-encodedid='" + eid + "']").first().text(),
    		tab = $('.js-group-assignment-nav[data-target=' + target + ']');
    		
    		tab.find('span').attr('data-text', name);
    		tab.removeClass("hide-important");
    		
    		$('#branch-image').find('span').addClass('icon-' + name.toLowerCase().replace(/[\s]+/g, '-'));
    }
    
    function setActive(type){
    	var target, This;
    	
    	switch(type){
	    	case "branch":
	    		target = "tracks-container";
	    		break;
	    	case "concept":
	    		target = "concepts-container";
	    		break;
	    	case "subject":
	    	case "subject-list":
	    		target = "subjects-container";
	    		break;
    	}
    	
    	This = $('.js-group-assignment-nav[data-target=' + target + ']');
        This.addClass('selected').siblings().removeClass('selected');
        
        This = $('#' + target);
        This.removeClass('hide').siblings().addClass('hide');
    	
    	if(type === "subject-list"){
    		self.showSubjectList();
    	}else{
            $("#groups-assignment-container").attr("data-type", type);
    	}
    	
    	if(target === "subjects-container" && $(".subject-heading:visible").length === $(".subject-heading").length){
        	$("#backButton").addClass("hidden");
        }else{
        	$("#backButton").removeClass("hidden");
        }
    	
    	if(target === "subjects-container"){
    		setHeader('subject');
    	}
    }
    
    function setHeader(type){
    	var content = "", ptype = "", topicName = "";
    	
    	switch(type){
	    	case "concept":
	    		if($("#groups-assignment-container").children(":visible").length > 1){ //in desktop view for concepts tracks will also be visible and we need to show branch name
                    // Tablet view (left pane topics; right pane concepts)
	    			content = $('#branch-name-header').attr('data-text');
                    topicName = $('#tracks-container').find('.select-track-wrapper.js-selected').find('.track-name').text();
	    		}else{
	    			content = $("#concept-heading").find(".js-node-name").text();
	    		}
                ptype = "Concepts";
	    		break;
	    	case "branch":
	    		content = $("#branch-name-header").attr("data-text");
                ptype = "Topics";
	    		break;
	    	case "subject":
	    		if($("#subjects-container").find(".subject-heading:visible").length !== $("#subjects-container").find(".subject-heading").length){
	    			content = $("#subjects-container").find(".subject-heading.active").attr("data-name");
	    		}
                ptype = "Branches";
	    		break;
    	}
    	
    	$("#headerText").find(".header-title, .logo-img").addClass("hide");
    	
    	if(content !== ""){
    		$("#headerText").find(".header-title").text(content).removeClass("hide");
    	}else{
    		$("#headerText").find(".logo-img").removeClass("hide");
            ptype = "Subjects";
    	}
        if (topicName !== "") {
            ptype += "/" + topicName;
        } else if (content !== "") {
            ptype += "/" + content;
        }
        if (ptype !== lastPtype) {
            if (window.practiceAppHelper) window.practiceAppHelper.logGAEventForApp(ptype);
            lastPtype = ptype;
        }
    }
    
    function updateLocalConfigFromStorage(){ //call this only when value really needs to be updated not on tab change.
    	var appLocalStorage = window.practiceAppHelper && window.practiceAppHelper.appLocalStorage;
    	
    	if(appLocalStorage){
    		localConfig.subject = appLocalStorage.getItem("subject");
           	localConfig.branch = appLocalStorage.getItem("branch");
           	localConfig.practiceHandle = appLocalStorage.getItem("practiceHandle");
    	}
    }
    
    function animate(target, type, isHidden){
    	var avlAnimation = ["slideinleft", "slideinright", "slideoutleft", "slideoutright"],
    		hiddenClass = (isHidden === false) ? "" : "hide";
    	
    	if($(window).width() < 768){ //add animation only for mobile viewport
    		target.removeClass(hiddenClass + " " + avlAnimation.join(" "));
        	
        	target.off("webkitAnimationEnd animationend").on("webkitAnimationEnd animationend", function(){
        		$(this).removeClass("slide " + type);
        		
        		if(/slideout/.test(type)){
        			$(this).addClass(hiddenClass);
        		}
        	});
        	
        	target.addClass("slide " + type);
    	}
    	
    }
    
    function openRestartModal(settings){
		if($("#restartAlert").length === 0){
			getRestartModal();
			
			$("#closeRestartModal").off("click.restart").on("click.restart", function(){
				$("#restartAlert, #pageOverlay").addClass("hide");
			});
			
			$("#restartActivity").off("click.restart").on("click.restart", function(){
				window.location.href = settings.url;
			});
		}
		
		$("#restartAlert, #pageOverlay").removeClass("hide");
	}
    
    function getRestartModal(){
		var tmpl = [],status;
		
		tmpl.push('<div id="restartAlert" class="restart-modal">');
		tmpl.push('<div class="message-body-text">Your progress will be reset. Are you sure you want to restart?</div>');
		tmpl.push('<div class="btn-cont"><input type="button" value="Cancel" class="button small dusty-grey closeModal" id="closeRestartModal">');
		tmpl.push('<input type="button" value="Yes" class="button small turquoise" id ="restartActivity"></div></div>');
		tmpl = tmpl.join("");
		$('body').append(tmpl);
		$('body').append('<div class="window-page-disable" id ="pageOverlay"></div>');
	}
    
    function onOrientationChange(){
    	$("#groups-assignment-container").css({"min-height" : $(window).height()-96});
    }

    return PracticeView;
});
