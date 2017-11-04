define(['jquery',
    'underscore',
    'modality/templates/modality.templates',
    'common/utils/url',
    'common/utils/user',
    'common/utils/modality',
    'common/views/login.popup.view',
    'common/utils/concept_coversheet',
    'common/utils/utils',
    'common/views/share.via.email.view',
    'common/views/footer.view',
    'common/models/assignment.quick.notification.model',
    'ltiBridge',
    /*'common/utils/practice_badge',*/
    'jquery.appdownload'
], function ($, _, TMPL, URL, User, modalityUtil, signin, coverSheet, util, ShareEmailView, FooterView, QuickAssignmentNotificationModel,ltiBridge /*, badge*/ ) {
    'use strict';

    var userDetails = {
        'user_email': '',
        'loggedin': false
    };
    var collectionCarryForward = '';
    var defferrd;
    /**
     * @constructor
     */
    
    function ConceptView(controller) {
        // TODO: This view is not self-complete. It relies heavily on the reference to it's controller.
        // Need to improve upon this.
        // ar: Since this isn't a backbone view, this view should extend the Events object defined in assessment/lib/Events.js,
        //     and trigger view events to which its controller will listen and react accordingly. This view should not
        //     have reference to a `controller`. Rather, this view should have a defined event lifecycle
        //     such that another view with a compatible event life cycle may replace it without issue.

        var modalityTemplate = _.template(TMPL.MODALITY, null, {
                'variable': 'data'
            }),
            /*
             * filterTemplate = _.template(TMPL.MODALITY_FILTERS, null, {
             * 'variable': 'data' }),
             */
            topInfoTemplate = _.template(TMPL.CONCEPT_INFO_TOP, null, {
                'variable': 'data'
            }),
            featuredTemplate = _.template(TMPL.FEATURED_CONTENT, null, {
                'variable': 'data'
            }),
            topFiltersTemplate = _.template(TMPL.CONCEPT_FILTERS_TOP, null, {
                'variable': 'data'
            }),
            /*practiceBadgeTemplate = _.template(TMPL.PRACTICE_BADGE, null, {
                'variable': 'data'
            }),*/
            metaDescriptionTemplate = _.template('<meta itemprop="description" content="<%= data.description %>">', null, {
                'variable': 'data'
            }),
            dropdownTemplate = _.template(TMPL.CONCEPT_DROPDOWN, null, {
                'variable': 'data'
            }),
            contributeTemplate = _.template(TMPL.CONCEPT_CONTRIBUTE, null, {
                'variable': 'data'
            }),
            isResize = true,
            isResizeFeatured = true,
            applied_filter = null,
            resizeTimeout = 0,
            user = new User(),
            isReload = false,
            allCount = 0,
            adaptive = true,
            featured_sort = ['Read', 'Video', 'Assessments', 'Simulations', 'PLIX'],
            addPlane = true;

        function toggleDropdown() {
            $(this).toggleClass('dropdown_active');
        }

        function hideAllDropdowns() {
            $('.dropdown_active').removeClass('dropdown_active');
        }

        function cleanupFilters() {
            $('.filters_list').find('li.modality_group').each(function () {
                $(this).remove();
            });
        }

        function changeDifficulty(level) {
            window.location.href = new URL().updateSearchParams({
                'difficulty': level,
                'filterReferrer': 'level'
            }).url();
        }

        function cleanupModalities() {
            $('.modality_list').find('li').each(function () {
                $(this).remove();
            });
        }

    	function getCollectionData(collectionData){
			var collectionParams = "",
				conceptCollectionHandle = "";
			defferrd = $.Deferred();
			if(collectionData && collectionData.collectionCreatorID > 0 && collectionData.collectionCreatorID === 3){
				conceptCollectionHandle = collectionData.collectionHandle + "-::-" + collectionData.conceptCollectionAbsoluteHandle;
				collectionParams = "&collectionHandle=" + collectionData.collectionHandle + "&collectionCreatorID=" + collectionData.collectionCreatorID + "&conceptCollectionHandle=" + conceptCollectionHandle;
				defferrd.resolve();
			
			}

			return collectionParams;
    	}

        function bindPracticeEvents(practiceModality, score, testType, scoreOffset, isLogin, questionCount) {
            $('.js-practice_button', $(this)).off('click.practice').on('click.practice', function (e) {
            	$.when(defferrd).done(function(){
					
				
            	e.stopPropagation();
                e.preventDefault();
                var memoryBoost = "",
                	collectionData = [],
                	collectionParams = "",
                	testType  = testType || practiceModality.artifactType;
                
                if(testType === "asmtpractice"){
                	testType = "practice";
                }
                /*if(practiceModality.collections && practiceModality.collections.length > 0){
					collectionData = practiceModality.collections[0];
					collectionParams = getCollectionData(collectionData);
                }*/
                if($(".memory-spaced-practice").hasClass("memory-spaced-practice")){
                	memoryBoost = "&spractice=true&seid="+practiceModality.domain.encodedID;
                }
                try {
                    var isTeacher = window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
                    if (!isLogin) {
                        if (score.match('trial attempt reached')) { // Maximum allowed trial attempt reached
                            if (isTeacher) {
                                window.location.href = practiceModality.details_url + "?referrer=featured_content";
                            } else {
                                window.location.href = '/assessment/ui/?test/view?' + practiceModality.perma.replace('asmtpractice', 'practice').replace(/^(\/)/, '') + collectionCarryForward + '&referrer=featured_content&ep=' + encodeURIComponent(window.location.href);
                            }
                        } else { // User not logged in
                            coverSheet.init({
                                'handle': practiceModality.domain.handle,
                                'encodedId': practiceModality.domain.encodedId || practiceModality.domain.encodedID,
                                'conceptTitle': practiceModality.domain.name,
                                'callback': $.noop,
                                'referrer': 'featured_content',
                                'defaultPracticeModality': practiceModality
                            });
                        }
                    } else if (adaptive && questionCount && memoryBoost === "") {
                        var tmpl = [];
                        tmpl.push('<div id="restartAlert" class="restart-modal">');
                        tmpl.push('<div class="message-body">Your progress will be reset. Are you sure you want to restart?</div>');
                        tmpl.push('<div class="btn-cont"><input type="button" value="Cancel" class="button small dusty-grey closeModal">');
                        tmpl.push('<input type="button" value="Yes" class="button small turquoise restartActivity"></div></div>');
                        tmpl = tmpl.join('');
                        $('body').append(tmpl);
                        $('body').append('<div class="window-page-disable" id ="pageOverlay"></div>');
                        $('.closeModal').off('click.remove').on('click.remove', function () {
                            $('#restartAlert').add('#pageOverlay').remove();
                        });
                        $('.restartActivity').off('click.restart').on('click.restart', function () {
                            window.location.href ='/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle + collectionCarryForward + '&restartPractice=true' +(memoryBoost)+ '&referrer=featured_content&ep=' + encodeURIComponent(window.location.href);
                        });
                    }else if(adaptive && questionCount && memoryBoost !== ""){
                    	 window.location.href = '/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle + collectionCarryForward  + '&restartPractice=true' +(memoryBoost)+ '&referrer=featured_content&ep=' + encodeURIComponent(window.location.href);
                    }else {
                        if (84.9 < score) {
                            if (adaptive) {
                                if (isTeacher) {
                                    window.location.href = practiceModality.details_url + '?referrer=featured_content' + collectionCarryForward;
                                } else {
                                    var purl = '/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle + collectionCarryForward;
                                    if (memoryBoost) {
                                        purl += '&' + memoryBoost;
                                    }
                                    purl += '&referrer=featured_content&ep=' + encodeURIComponent(window.location.href);
                                    window.location.href = purl;
                                }
                            } else if (scoreOffset > 0) {
                                if (isTeacher) {
                                    window.location.href = practiceModality.details_url+ '?referrer=featured_content' + collectionCarryForward;
                                } else {
                                    window.location.href = '/assessment/ui/?test/detail/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle + collectionCarryForward + '&scoreOffset=' + scoreOffset + '&mode=tunnel&referrer=featured_content&ep=' + encodeURIComponent(window.location.href);
                                }
                            } else {
                                if (isTeacher) {
                                    window.location.href = practiceModality.details_url + '?referrer=featured_content' + collectionCarryForward;
                                } else {
                                    window.location.href = '/assessment/ui/?test/detail/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle + collectionCarryForward  + '&mode=tunnel&referrer=featured_content&ep=' + encodeURIComponent(window.location.href);
                                }
                            }
                        } else {
                            if (isTeacher) {
                                window.location.href = practiceModality.details_url + '?referrer=featured_content' + collectionCarryForward;
                            } else {
                                var purl = '/assessment/ui/?test/view/' + testType +"/" + practiceModality.domain.branchInfo.handle.toLowerCase() + "/"+ practiceModality.handle + collectionCarryForward;
                                if (memoryBoost) {
                                    purl += '&'+memoryBoost;
                                }
                                purl += '&referrer=featured_content&ep=' + encodeURIComponent(window.location.href);
                                window.location.href = purl;
                            }
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            	})
            });

            $(".tooltip-icon",".featured_practice_wrapper").off("click").on("click", function(e){
            	$(".tooltip-info",".featured_practice_wrapper").toggleClass("hide");
            	e.preventDefault();
            	e.stopImmediatePropagation();

            });
            $(".memory-boost-section-icon").off("click").on("click", function(e){
            	e.preventDefault();
            	e.stopImmediatePropagation();
            });

            $(".boost-tooltip",".js-practice_button").off("click").on("click", function(evt){
            	$(".tooltip-info",".js-practice_button").toggleClass("hide");
            	evt.stopPropagation();
            	evt.preventDefault();
            });
        }

        function practiceButtonHandler(practiceModality, score) {
            var answerToComplete, correctAnswer, questionCount, completeQuestionsCount,
                context = $(this),
                practice_score = $('.js-practice_score', context),
                score_bar = context.find('.progress-bar'),
                score_bar_wrapper = context.find('.progress-wrapper'),
                practice_score_circle = $('.score_circle', context),
                practice_button = $('.js-practice_button', context),
                memoryBoostSection = $('.memory-boost-section', context),
                memoryBoostMsg = "",
                spacedSchedule = "",
                barColor;
            if(score && score.spacedSchedule){
            	spacedSchedule = score.spacedSchedule;
            }
            if (score.hasOwnProperty('test') && score.test.hasOwnProperty('userLogin')) {
                var timeInMinutes, isTeacher = window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
            	if(isTeacher){
            		if(score.test.eta && score.test.eta !== null){
                		timeInMinutes = parseInt(score.test.eta / 60);
                		practice_score_circle.html('<div class="content"><span class="small-text margin-top">Estimated</span><span class="large-text">'+timeInMinutes+'</span><span class="attach-text"> mins</span><span class="small-text">to complete</span></div>');
                		practice_score_circle.removeClass('svg-circle');
//                		$(".js-practice_button").addClass("hide");
            		}else if(!score.test.eta){
						timeInMinutes = 10;
						practice_score_circle.html('<div class="content"><span class="small-text margin-top">Estimated</span><span class="large-text">'+timeInMinutes+'</span><span class="attach-text"> mins</span><span class="small-text">to complete</span></div>');
						practice_score_circle.removeClass('svg-circle');
            		}else{
            			practice_score.text('0%');
            		}
                    // changes for teacher role.
            		$(".asmt-title").removeClass("hide");
            		$(".asmt-title").next(".featured_summary").hide();
            		$(".js-practice_button").addClass("hide");
                    $(".resource_desc", context).text("Preview practice, create your own quiz, and download worksheets.");
                    $(".resource_desc", context).css({"text-align": "left"});
                    $(".featured_practice").removeClass("featured_practice hide");
                    $(".featured_practice_wrapper").addClass("js-practice_button").removeClass("hide").css("cursor","pointer");
                    bindPracticeEvents.call(context, practiceModality, '', 'practice', 0, true);
            	}else if (score.test.hasOwnProperty('pointsAndAwards')) {
            		$(".js-practice_button").removeClass("hide");
            		$(".js-practice_button").removeClass(".js-practice_button");
                	$(".type_asmtpractice").find(".modality_info_wrapper").addClass("js-practice_button");
                    answerToComplete = score.test.pointsAndAwards.answersToComplete || 0;
                    correctAnswer = score.test.pointsAndAwards.correctAnswers || 0;
                    questionCount = 0 === score.test.availableQuestionsCount;
                    completeQuestionsCount = score.test.pointsAndAwards.goal || score.test.questionsCount || 1;
                    score = Math.round((correctAnswer / completeQuestionsCount) * 100);
                    practice_score.text(score + '%');
                    var dasharray = +(score_bar.attr('stroke-dasharray'));
                    var offsetScore = (+score >= 100 ) ? 100 : +score;
                    var offsetPercent = dasharray - ((+offsetScore * dasharray)/100);
                	if(offsetScore > 84.9){
                		barColor = "#b8d543";
            		}else if(offsetScore < 65){
            			barColor = "#ff6633";
            		}else{
            			barColor = "gold";
            		}
                    score_bar.attr({
                    	"stroke" : barColor
                    })
                    score_bar.attr('stroke-dashoffset', offsetPercent);

                    memoryBoostMsg = checkMemoryBoost({
                    	"spacedSchedule" : spacedSchedule,
                    	"context" : context,
                    	"isRestart" : questionCount
                    });
                    if(memoryBoostMsg && typeof memoryBoostMsg === "object"){

                    	//Removing href for memory boost case
                    	$(".modality_info_wrapper.js-practice_button").find("a").removeAttr("href");

                    	memoryBoostSection.removeClass("hide");
                    	memoryBoostSection.find(".boost-icon").addClass(memoryBoostMsg['icon']);
                    	memoryBoostSection.find(".boost-message").addClass(memoryBoostMsg['class']).text(memoryBoostMsg['due-msg']);
                		practice_button.find('span').text(memoryBoostMsg['btn-msg']);
                    	practice_button.find('.icon-arrow3_right').addClass("hide");
                    	practice_button.addClass("memory-boost-btn");
                    	if(memoryBoostMsg['class']!=='boost-strong'){
                    		practice_button.addClass("memory-spaced-practice");
                    	}
                    	$(".practice-btn-section",".modality_info_wrapper").addClass("small-6");
                    	$(".featured_summary").addClass("hide");
                    }else{
                    	$(".practice-btn-section",".modality_info_wrapper").addClass("small-offset-1 small-10 small-offset-1");
                        if (questionCount) {
                            practice_button.find('span').text('Restart');
                        } else if (100 <= score) {
                            practice_button.find('span').text('Keep Going');
                        } else {
                            practice_button.find('span').text('Get ' + answerToComplete + ' more correct ');
                        }
                    }
                    bindPracticeEvents.call(context, practiceModality, score, 'practice', 0, true, questionCount);
                } else {
                	$(".js-practice_button").removeClass("hide");
                	$(".js-practice_button").removeClass(".js-practice_button");
                	$(".type_asmtpractice").find(".modality_info_wrapper").addClass("js-practice_button");
                	//new code to show eta
                	if(score.test.eta && score.test.eta !== null){
                		var timeInMinutes = parseInt(score.test.eta / 60);
                		practice_score_circle.html('<div class="content"><span class="small-text margin-top">Estimated</span><span class="large-text">'+timeInMinutes+'</span><span class="attach-text"> mins</span><span class="small-text">to complete</span></div>');
                		practice_score_circle.removeClass('svg-circle');
                	}else{
                         practice_score.text('0%');
                	}

                    practice_button.find('span').text('Practice');
                    bindPracticeEvents.call(context, practiceModality, '', 'practice', 0, true);
                }
            } else if (score.hasOwnProperty('test') && score.test.hasOwnProperty('freeAttempts')) {
                practice_score.text('0%');
                practice_button.find('span').text('Practice');
                bindPracticeEvents.call(context, practiceModality, 'Maximum allowed trial attempt reached', 'practice', 0);
            } else {
                practice_score.text('0%');
                practice_button.find('span').text('Practice');
                bindPracticeEvents.call(context, practiceModality, '', 'practice', 0, true);
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
        			//_memoryBoost = "strong";
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
        			if(testObj && testObj.context.hasClass("modality")){
        				logMemoryBoostADS();
        			}else{
        				logMemoryBoostADS("featured_content");
        			}
        		}else if(1 < difference){
        			//_memoryBoost = "overdue";
        			_memoryBoost = {
            				"due-msg" : "Review overdue",
            				"btn-msg" : "Boost your memory",
            				"icon" : "icon-boost-overdue",
            				"class" : "boost-overdue"
            		}
        			if(testObj && testObj.context.hasClass("modality")){
        				logMemoryBoostADS();
        			}else{
        				logMemoryBoostADS("featured_content");
        			}
        		}
        	}
        	return _memoryBoost
    	}

        function renderModalities(modalities, isCollectionUrl) {
            if (modalities instanceof Array && modalities.length) {
                modalities = _.sortBy(modalities, function (m) {
                    var _mt = controller.modality_types[m.artifactType];

                    if (!_mt) {
                        return 9999;
                    }
                    if (user.is_student()) {
                        return _mt.weight_student;
                    }
                    return _mt.weight_teacher;
                });
                cleanupModalities();
                $('.modality_list').html(contributeTemplate({
                    'domain': modalities[0].domain,
                    'isCollectionUrl': isCollectionUrl
                }));

                var quickAssignmentNotificationModel = new QuickAssignmentNotificationModel();
                _.each(modalities, function (modality) {
                    modality = controller.processModality(modality);
		    //TODO: FN - Temporary change for bug #56147
		    // This hides the simulations modality cards
                    if (modality) {
                        modality.modalityIcon = modalityUtil.getModalityIcon(modality.modality_group.display_text);
                        modality = getCollectionTitle(modality);
                        var _m = $(modalityTemplate(modality));
                        if (!modality.practice || !user.is_student()) {
	                        _m.find('.modality_info_wrapper').off('click.concept').on('click.concept', function (e) {
	                        	var This = this ;
	                        	$.when(defferrd).done(function(){
				    // Open these modalities in a new window
				    var _href = $(This).find('a').prop('href');
				    
				    if(collectionCarryForward){
				    	_href += collectionCarryForward;
				    }
				    if (window.lmsContext === 'lti-app' && /simulationint|plix/.test(_href) ){
					e.preventDefault();
				        //For simulations add query-param lmsContext=true
				        if (e.currentTarget.querySelector('.simulationint')) {
                                             _href = _href + "&lmsContext=true";
					}
					//window.location = _href;
					// Hold off on this
					var other_window = window.open(_href,'lms-context-ref');
					// List for postmessage from other window
					// to receive info needed to create the assignment
					// for lms using bridge 
					try {
					    window.addEventListener('message', function(event) {
					        console.log("Received post message");
						if (event.origin !== window.origin && event.origin.slice(-8) !== window.origin.slice(-8)) {
							return;
						}
						other_window.close();
					        var LTIBridge = new ltiBridge();
					        LTIBridge.onAssignAction(JSON.parse(event.data));
					    });
					} catch(e) {
					    console.log("Error on create assignment via postmessage:" + String(e));
					}
				    } else {
	                                window.location = collectionCarryForward ? _href : $(This).find('a').attr('href');
				    }
	                        });
	                       });
                        }
                        _m.find('.js_sharemenuwrap').off('click.share').on('click.js_sharemenuwrap', function () {
                            $(this).find('.share_menu').toggleClass('hide');
                        });
                        $('.modality_list').append(_m);

                        if (modality.practice) { //changes for elementary math practice tile
                            _m.addClass('elementary-math-practice-tile');
                            practiceButtonHandler.call(_m[0], modality, modality.practice);
                        }
                        if(!modality.published) {
                            addPlane = false;
                        }
                    }
                });

                // check out for artifact assignment status
                quickAssignmentNotificationModel.checkAssignmentStatusForNewsPaperView(controller.encodedId, controller.filter_by, function(artifactStatus){
                    if(!artifactStatus){
                        return;
                    }

                    var $bannerImage;

                    for (var key in artifactStatus){
                       $bannerImage = $("#" + key).find(".assignment-banner");

                       switch(artifactStatus[key]){
                            case "notificationState_AssignedNotTurnedIn":
                                $bannerImage.addClass("assignedBanner");
                                break;
                            case "notificationState_AssignedAndTurnedIn":
                                $bannerImage.addClass("completedBanner")
                                break;
                            case "notificationState_AssignedDue":
                                $bannerImage.addClass("overdueBanner")
                                break;
                        }

                        $bannerImage.show();
                    }
                });
            }
        }

        function getCollectionTitle(modality) {
        	if(modality.artifactType === 'asmtpractice'){
            	var currentHref,_collectionHandle;
            	currentHref = window.location.href.split('/');
            	if(currentHref.indexOf('c') !== -1){
            		_collectionHandle = currentHref[currentHref.indexOf('c') + 1];
            		if(modality.collections && modality.collections.length !== 0){
            			_.each(modality.collections, function(value){
            				if(value.collectionHandle === _collectionHandle){
            					modality.collectionTitle = value.conceptCollectionTitle;
            				}
            			})
            		}
            	}
            }
        	return modality;
        }
        
        function bindShareAdsEvents() {
            $('.js_social_share').off('click.share').on('click.share', function (event) {
                var payload,
                    socialNetworkName = $(event.currentTarget).data('sharetype'),
                    artifactId = $(event.currentTarget).parents('li.modality').attr('id');
                payload = {
                    'artifactID': artifactId,
                    'memberID': ads_userid,
                    'social_network': socialNetworkName,
                    'page': 'concept_details'
                };
                if (window._ck12) {
                    _ck12.logEvent('fbs_share', payload);
                }
            });
        }

        function initializeShare() {
            var payload = {
                    'memberID': ads_userid,
                    'page': 'concept_details'
                };
            if(addPlane){
                FooterView.initShare({
                    'shareImage': controller.concept_image,
                    'shareUrl': window.location.href,
                    'shareTitle': $('.artifact_title_text').text(),
                    'context': 'Share this Concept',
                    'payload': payload,
                    '_ck12': true
                });
            }
            $('.open-share-email-modal').off('click.share').on('click.share', function (event) {
                var $conceptCard = $(this).parents('.modalitywrap'),
                    regx = /http[s]{0,1}:\/\//g,
                    shareImageUrl = $conceptCard.find('.modality_info_wrapper .thumbnail_wrapper').find('img').attr('src');
                if (!regx.test(shareImageUrl)) {
                    shareImageUrl = window.location.protocol + '//' + window.location.host + shareImageUrl;
                }
                ShareEmailView.open({
                    'shareImage': shareImageUrl,
                    'shareUrl': window.location.protocol + '//' + window.location.host + $conceptCard.find('.data_wrapper .modalitybody').find('a').attr('href'),
                    'shareTitle': $conceptCard.find('.data_wrapper .modalitybody').find('a:first').text(),
                    'userSignedIn': window.ck12_signed_in || false,
                    'context': 'Share this Modality',
                    'payload': {
                        'artifactID': $(event.currentTarget).parents('li.modality').attr('id'),
                        'memberID': ads_userid,
                        'page': 'concept_details'
                    },
                    'userEmail': userDetails.user_email,
                    '_ck12': true
                });
            });
        }

        function applyFilter(group_name) {
            hideAllDropdowns();
            applied_filter = group_name;
            var group = _.find(controller.modality_groups, function (grp) {
                return grp.group_classname === group_name;
            });
            controller.active_filter = group;
            $('.lnk_modality_filter').removeClass('selected');
            $('.lnk_modality_filter.group_' + group_name).addClass('selected');
            controller.getModalities(group_name).done(function (modalities) {
                // render modalities
                renderModalities(modalities, (controller.collection_handle != ""));
                bindShareAdsEvents();
                initializeShare();
            });
        }

        function logFilterADS(referrer) {
            if (window._ck12) {
                window._ck12.logEvent('FBS_MODALITY_FILTER ', {
                    'memberID': window.ads_userid,
                    'context_eid': controller.encodedId,
                    'modalityGroup': controller.active_filter.group_name.toLowerCase().replace(' ', '_'),
                    'referrer': referrer || 'concept_details'
                });
            }
        }

        function logMemoryBoostADS(referrer) {
            if (window._ck12) {
                window._ck12.logEvent('FBS_MEMORY_BOOST ', {
                    'memberID': window.ads_userid,
                    'context_eid': controller.encodedId,
                    'referrer': referrer || 'concept_details'
                });
            }
        }

        function onFilterClick() {
            applyFilter($(this).find('.lnk_modality_filter').data('groupname'));
            logFilterADS();
            return false;
        }

        function checkForcedSignIn() {
            var selectedUrlconfig = $.cookie('assessmentFrameUrlConfig');
            if (selectedUrlconfig && window.ck12_signed_in) {
                $.removeCookie('assessmentFrameUrlConfig');
                window.location.href = selectedUrlconfig;
            }
        }

        function checkForActiveButton(top) {
            var concept = $('#concept_list');
            top = Math.round(top || (concept.offset().top - concept.parent().offset().top - 4));
            if ((concept.parent().innerHeight() - top) >= concept.height()) {
                $('#bottom_button').removeClass('active');
                $('#concept_line').removeClass('bottom');
            } else {
                $('#bottom_button').addClass('active');
                $('#concept_line').addClass('bottom');
            }
            if (0 <= top) {
                $('#top_button').removeClass('active');
                $('#concept_line').removeClass('top');
            } else {
                $('#top_button').addClass('active');
                $('#concept_line').addClass('top');
            }
        }

        function setDropDownScroll() {
            var concept, scroll, top;
            concept = $('#concept_list');
            concept.css('top', '0px');
            scroll = Math.floor(concept.find('.active').index() / 10);
            if (scroll && -1 !== scroll) {
                top = concept.offset().top - concept.parent().offset().top - 4;
                top -= concept.parent().innerHeight() * scroll;
                concept.css('top', top + 'px');
                $('.js-concept_button').addClass('js-disabled');
                setTimeout(function () {
                    checkForActiveButton();
                    $('.js-concept_button').removeClass('js-disabled');
                }, 800);
            } else {
                checkForActiveButton();
            }
        }

        function toggleConceptDropdown(setScroll) {
            $('#concept_list_container').slideToggle('slow', function () {
                var concept = $('#concept_list');
                concept.find('a').add('.concept_descriptions').css('max-width', concept.width() - 45 + 'px');
                $('#artifact_dropdown').removeClass('js-disabled').toggleClass('dropdown_open').children('i').toggleClass('icon-arrow3-down').toggleClass('icon-arrow3-up');
                if ($(window).width() < 767) {
                    $(window).scrollTop(0);
                }
                if (setScroll) {
                    setDropDownScroll();
                }
            });
        }

        function renderConceptsDropDown(concepts) {
            $('#concept_list_count').text(concepts.total + ' CONCEPTS');
            var index, concept, html = '';
            concepts = concepts.results;
            for (index = 0; index < concepts.length; index++) {
                concept = concepts[index];
                html += dropdownTemplate({
                    'conceptURL': (controller.branch_handle || '') + '/' + (concept.handle || ''),
                    'conceptName': concept.name || ''
                });
            }
            concept = $('#concept_list');
            concept.html(html).children().filter(function () {
                return this.title === $('#artifact_title').find('span[itemprop="name"]').text().trim();
            }).addClass('active');
            toggleConceptDropdown(true);
        }

        /**
         * Iterate over a list of modalities and count up the types
         * given a level
         * @param {array} counts modality_counts
         * @param {array} types the type of level to match in the `modalities` list
         * @param {string} level the type of level to match in the `modalities` list
         * @return {number} total count of all modality types
         */
        function countModalities(counts, types, level) {
            var mtype, _level, total = 0;
            for (mtype in counts) {
                if (counts.hasOwnProperty(mtype) && _.contains(types, mtype)) {
                    for (_level in counts[mtype]) {
                        if (counts[mtype].hasOwnProperty(_level)) {
                            if (level) {
                                if (level === _level) {
                                    total += counts[mtype][_level];
                                }
                            } else {
                                total += counts[mtype][_level];
                            }
                        }
                    }
                }
            }
            return total;
        }

        function toggleHelpTooltip() {
            $('#level-tooltip-container').toggleClass('hide');
        }

        function bindEvents() {
            $('.js-concept_button').off('click.scroll').on('click.scroll', function () {
                if ($('.js-concept_button').hasClass('js-disabled') || !($(this).hasClass('active'))) {
                    return false;
                }
                var top, This, concept, conceptListHeight;
                This = $(this);
                concept = $('#concept_list');
                conceptListHeight = concept.parent().innerHeight();
                top = concept.offset().top - concept.parent().offset().top - 4;
                top += This.hasClass('bottom_button') ? (-conceptListHeight) : conceptListHeight;
                This.addClass('js-disabled');
                concept.css('top', top + 'px');
                setTimeout(function () {
                    checkForActiveButton(top);
                    This.removeClass('js-disabled');
                }, 800);
            });

            $('#artifact_dropdown').off('click.dropdown').on('click.dropdown', function () {
                var This = $(this),
                    $conceptList = $('#concept_list');
                if (This.hasClass('js-disabled')) {
                    return false;
                }
                This.addClass('js-disabled');
                if ($conceptList.length && $conceptList.is(':empty')) {
                    controller.getConcepts($conceptList.attr('data-encodedID')).done(function(response){
                        if (response.redirectedConcept && response.redirectedConcept.encodedID && !response.results) {
                            controller.getConcepts(response.redirectedConcept.encodedID).done(renderConceptsDropDown);
                        } else {
                            renderConceptsDropDown(response);
                        }
                    });
                } else {
                    toggleConceptDropdown();
                }
            });

            $('.js-concept-close-icon').off('click.dropdown').on('click.dropdown', function () {
                $('#artifact_dropdown').trigger('click');
            });

            $('#concept_list').off('click.active').on('click.active', '.active a', function () {
                return false;
            });

            $('.filters_top_container').find('.js_filter_by').off('click.concept').on('click.concept', function () {
                hideAllDropdowns();
                window.location.href = new URL().updateSearchParams({
                    'by': $(this).data('by'),
                    'filterReferrer': 'source',
                    'difficulty': $('#level-dropdown').data('difficulty-level')
                }).url();
                return false;
            });

            $('.filters_top_container').find('.js_filter_level').off('click.concept').on('click.concept', function () {
                hideAllDropdowns();
                changeDifficulty($(this).data('difficulty'));
                return false;
            });

            $('.filters_top_container').find('.js_difficulty_select').off('change.concept').on('change.concept', function () {
                changeDifficulty($(this).val());
                return false;
            });

            $('.filters_top_container').find('.gradedropdown ').off('click.concept').on('click.concept', toggleDropdown);

            $('.mdoalityfilterdropmenuwrap').off('click.concept').on('click.concept', toggleDropdown);

            $('#modality_filters_list').off('click.concept').on('click.concept', '.modality_group', onFilterClick);

            $('#level-help').off('click.level-help').on('click.level-help', toggleHelpTooltip);

            $('.js-level-tooltip-close').off('click.tooltip-close').on('click.tooltip-close', toggleHelpTooltip);

            $(window).off('resize.filters').on('resize.filters', function () {
                if (isResize) {
                    isResize = false;
                    setTimeout(function () {

                        resizeTimeout = 500; // is zero if triggered manually

                        // for concept list dropdown
                        if ($('#artifact_dropdown').length > 0) {
                            $('#concept_list_container').css('top', $('#artifact_dropdown').offset().top - $('#concept_list_container').parent().offset().top + 38 + 'px');
                        }
                        $('.concept_descriptions a').add('.concept_descriptions').css('max-width', $('#concept_list').width() - 45 + 'px');

                        if ($('#concept_list_container').is(':visible') && $(window).width() < 767) {
                            $(window).scrollTop(0);
                        }

                        var totalVisible, extraModalities, extraModalitiesHTML, count;
                        $('#modality_filters_list').children('.modality_group').removeClass('hide');
                        // for all filter count
                        if (!$('#modality_filters_list').children('.modality_group.hide-small:hidden').length) {
                            $('[data-groupname=all]').find('.js-count').text('(' + allCount + ')');
                        } else {
                            count = allCount;
                            $('#modality_filters_list').children('.modality_group.hide-small:hidden').each(function () {
                                count -= parseInt($(this).find('.js-count').text().trim().slice(1, -1), 10);
                            });
                            $('[data-groupname=all]').find('.js-count').text('(' + count + ')');
                        }

                        // for modality filters
                        $('.mdoalityfilterdropmenuwrap').addClass('hide').removeClass('dropdown_active');
                        totalVisible = Math.round($('#modality_filters_list').width() / $('#modality_filters_list').find('.modality_group:eq(0)').width());
                        if ($('#modality_filters_list').children('.modality_group').length <= totalVisible) {
                            isResize = true;
                            return false;
                        }
                        totalVisible -= 2;
                        $('#modality_filters_list').children('.modality_group.hide-small:hidden').each(function () {
                            if ($(this).index() <= totalVisible) {
                                totalVisible++;
                            }
                        });
                        extraModalities = $('#modality_filters_list').children('.modality_group').eq(totalVisible).nextAll('.modality_group').not('.hide-small:hidden');
                        extraModalitiesHTML = '';
                        extraModalities.each(function () {
                            extraModalitiesHTML += this.outerHTML;
                        });
                        extraModalities.addClass('hide');
                        $('#more-concept-count').text(extraModalities.length);
                        $('#modality_extra_filter_list').empty().append(extraModalitiesHTML);
                        $('.mdoalityfilterdropmenuwrap').removeClass('hide');
                        isResize = true;
                    }, resizeTimeout); // allow for resize to complete
                }
            });

            $(document).off('click.concept').on('click.concept', function (e) {

            	//close memory boost tooltip if opened
            	if(!$(e.target).hasClass("tooltip-icon")){
            		$(".tooltip-info").addClass("hide");
            	}

                // for more filter
                if (!($(e.target).hasClass('mdoalityfilterdropmenuwrap') || $(e.target).parents('li:first').hasClass('mdoalityfilterdropmenuwrap'))) {
                    $('.mdoalityfilterdropmenuwrap').removeClass('dropdown_active');
                }

                // for share pop up
                if (!($(e.target).closest('.js_sharemenuwrap').length || $(e.target).closest('.share_menu').length)) {
                    $('.share_menu').addClass('hide');
                }

                // for level help tooltip
                if (!($(e.target).closest('#level-tooltip-container').length || $(e.target).closest('#level-help').length) && $('#level-tooltip-container').is(':visible')) {
                    toggleHelpTooltip();
                }

                // for concept list dropdown, needs to be last in this handler
                if ('concept_list_container' === e.target.id || $(e.target).parents('#concept_list_container').length || 'artifact_dropdown' === e.target.id || $(e.target).parents('#artifact_dropdown').length) {
                    return; // do not return false
                }
                if ($('#artifact_dropdown').hasClass('dropdown_open') && !($('#artifact_dropdown').hasClass('js-disabled'))) {
                    $('#artifact_dropdown').addClass('js-disabled');
                    toggleConceptDropdown();
                }

            });

            $('.back-icon').off('click.back').on('click.back', function () {
                window.history.back();
            });

            $('body').off('click.contribute').on('click.contribute', '.js-signin-required', function () {
                if (!window.ck12_signed_in) {
                    signin.showLoginDialogue({
                        'returnTo': ( controller.concept_collection_handle_long && controller.creator ==3 ) ?
                                    '/new/concept?eid=' + controller.encodedId + '&conceptCollectionHandle=' + controller.concept_collection_handle_long + '&collectionCreatorID=' + controller.creator :
                                    '/new/concept?eid=' + controller.encodedId
                    }).off('login_success').on('login_success', function (providerName) {
                        window.location.href = ( controller.concept_collection_handle_long && controller.creator ==3 ) ?
                                                '/account/signin-complete/' + providerName + '/?redirect=' + '/new/concept?eid=' + controller.encodedId + '&conceptCollectionHandle=' + controller.concept_collection_handle_long + '&collectionCreatorID=' + controller.creator + '&returnTo=' + window.location.href :
                                                '/account/signin-complete/' + providerName + '/?redirect=' + '/new/concept?eid=' + controller.encodedId + '&returnTo=' + window.location.href;
                    });
                } else {
		    // Open editor in new window
		    var _url =  ( controller.concept_collection_handle_long && controller.creator ==3 ) ?
                    '/new/concept?eid=' + controller.encodedId + '&conceptCollectionHandle=' + controller.concept_collection_handle_long + '&collectionCreatorID=' + controller.creator + '&returnTo=' + encodeURIComponent(window.location.href) :
                    '/new/concept?eid=' + controller.encodedId + '&returnTo=' + encodeURIComponent(window.location.href);
		    if (window.lmsContext === 'lti-app'){
                        var new_window = window.open(_url,'_blank');
			new_window.name = 'lms-context-override'
			new_window.focus();
		    } else {
                    window.location.href = _url;//'/new/concept?eid=' + controller.encodedId + '&returnTo=' + encodeURIComponent(window.location.href);
		    }
                }
            });
        }

        function logConceptADSEvents() {
            var modalityUrl = new URL(window.location.href),
                filterBy = modalityUrl.search_params.by || '',
                difficultyLevel = modalityUrl.search_params.difficulty || '',
                filterReferrer = modalityUrl.search_params.filterReferrer || '';
            if (window._ck12) {
                if (filterBy && filterReferrer === 'source') {
                    window._ck12.logEvent('FBS_MODALITY_SOURCE', {
                        'memberID': window.ads_userid,
                        'context_eid': controller.encodedId,
                        'modalitySource': filterBy
                    });
                }
                if (difficultyLevel && filterReferrer === 'level') {
                    window._ck12.logEvent('FBS_MODALITY_LEVEL', {
                        'memberID': window.ads_userid,
                        'context_eid': controller.encodedId,
                        'level': difficultyLevel.replace('+', ' ') || 'all'
                    });
                }
            }
        }

        function fetchUserInfo() {
            user.fetch({
                'success': function (model, userInfo) {
                    userDetails = {
                        'user_email': userInfo.email || '',
                        'loggedin': true
                    };

                }
            });
        }

        function renderFilters(domain) {
            cleanupFilters();
            fetchUserInfo();

            var ck12ModalityCount, communityModalityCount, key, sorted_groups, menu, types, total_count, filter_elm,
                ck12Contributed = false,
                communityContributed = false,
                _filters_list = $('.filters_list'),
                _lvl = (controller.filter_level === 'at+grade') ? 'at grade' : controller.filter_level;

            communityModalityCount = domain.communityModalityCount;
            ck12ModalityCount = domain.ck12ModalityCount;
            if (controller.filter_level) {
                for (key in ck12ModalityCount) {
                    if (ck12ModalityCount.hasOwnProperty(key)) {
                        if (ck12ModalityCount[key].hasOwnProperty(controller.filter_level.replace(/\+/, ' '))) {
                            ck12Contributed = true;
                        }
                    }
                }
                for (key in communityModalityCount) {
                    if (communityModalityCount.hasOwnProperty(key)) {
                        if (communityModalityCount[key].hasOwnProperty(controller.filter_level.replace(/\+/, ' '))) {
                            communityContributed = true;
                        }
                    }
                }
            } else {
                ck12Contributed = !$.isEmptyObject(ck12ModalityCount);
                communityContributed = !$.isEmptyObject(communityModalityCount);
            }
            // render top filters (difficulty, contributed by...)
            $('.filters_top_container').html(topFiltersTemplate({
                'by': controller.filter_by,
                'level': controller.filter_level,
                'count_by_level': controller.count_by_level,
                'ck12ContentCurrentLevel': ck12Contributed,
                'communityContentCurrentLevel': communityContributed,
                'domain': domain,
                'onlyAllLevel': controller.onlyAllLevel
            }));

            isReload = false;
            if (!($('.js_filter_by.active').length)) {
                if ($('.js_filter_by').length) {
                    hideAllDropdowns();
                    $('.js_filter_by').addClass('active');
                    controller.filter_by = $('.js_filter_by').data('by') || 'ck12';
                    isReload = true;
                    controller.loadConcept(true);
                } else {
                    $('.modality_list').replaceWith('<p class="modality-no-content">There are no modalities for this concept.</p>');
                    bindEvents();
                }
                return false;
            }

            sorted_groups = _(controller.modality_groups).sortBy(function (g) {
                return g.sequence;
            });
            _.each(sorted_groups, function (modality_group) {
                if (_.contains(controller.requested_filters, modality_group.group_classname)) {
                    // calculate group count
                    types = modality_group.artifact_types;
                    total_count = 0;
                    if (modality_group.group_classname === 'all') {
                        total_count = modality_group.count;
                    }
                    total_count += countModalities(controller.modality_count, types, _lvl);
                    // add modality group to the list
                    if (total_count) {
                        modality_group.count = total_count;
                        modality_group.modalityIcon = modalityUtil.getModalityIcon(modality_group.display_text || '');
                        filter_elm = controller.filterTemplate(modality_group);
                        _filters_list.append(filter_elm);
                        if (!applied_filter) {
                            // do not reapply filter if it's already applied...
                            if (controller.active_filter) {
                                if (modality_group.group_classname === controller.active_filter) {
                                    applyFilter(modality_group.group_classname);
                                }
                            } else {
                                applyFilter(modality_group.group_classname);
                            }
                        }
                    }
                }
            });
            menu = $('.mdoalityfilterdropmenuwrap').remove();
            _filters_list.append(menu);
            if (!applied_filter) {
                applyFilter('all'); // if no filter is applied, default to ALL
            }
            bindEvents();
            resizeTimeout = 0;
            $('#modality_filters_list').children('.modality_group').addClass('hide');
            allCount = parseInt($('[data-groupname=all]').find('.js-count').text().trim().slice(1, -1), 10);
            $(window).trigger('resize.filters');
            logConceptADSEvents();
            if (window.location.hash && !window.location.search.match('filterReferrer')) {
                logFilterADS('modality_details');
            }
        }

        function addSmartBanner() {
            if ($.smartbanner) {
                $.smartbanner({
                    title: 'CK-12',
                    author : "CK-12 Foundation",
                    daysHidden: 2,
                    daysReminder: 2,
                    icon: "/media/images/logo_120.png",
                    appendToSelector: $('.content-wrap')
                });
            }
        }

        function renderConcept(domain) {

        	collectionCarryForward = getCollectionData(domain.collection);
        	
            if (!isReload) {
                $('.content-wrap').addClass('collapse no-padding');
                if ('collectionInfo' in  domain)
                    window.document.title = domain.collectionInfo.conceptCollectionTitle + ' | CK-12 Foundation';
                else
                    window.document.title = domain.name + ' | CK-12 Foundation';

                var desc_meta, concept;
                desc_meta = $(metaDescriptionTemplate({
                    'description': 'Study ' + domain.name + ' with help of videos, practices,study guides and flashcards and real world applications for K-12 education'
                }));

                $('#concept_meta_container').append(desc_meta);

                // set prev/next domains
                _.each(domain.pre, function (item) {
                    domain.prev = item;
                });
                _.each(domain.post, function (item) {
                    domain.next = item;
                });
                $('.concept_info_top').html(topInfoTemplate({
                    'domain': domain,
                    'branch_handle': controller.branch_handle
                }));

                if (domain.branchInfo.name.match('Elementary Math') && !domain.description) {
                    $('meta[name=description]').attr('content', domain.name);
                } else {
                    $('meta[name=description]').attr('content', domain.description);
                }

                /*$('.concept-wrapper').append(practiceBadgeTemplate({
                    'domain': domain,
                    'branch_handle': controller.branch_handle
                }));
                if (badge) {
                    badge.init({
                        'encodedId': $('#conceptEcodedId').val(),
                        'handle': $('#conceptHandle').val()
                    });
                }*/

                checkForcedSignIn();

                concept = $('#concept_list_container').remove();
                $('.concept_info_top').after(concept);
                $('#concept_list_container').removeClass('hide').hide(); // to maintain uniformity

                // if ( !(/(iPhone).*OS [9,10].*AppleWebKit.*Version.*Mobile.*Safari/.test(navigator.userAgent)) ) {
                //	addSmartBanner();
                // }
                // if ( !(/(iPhone).*OS [9,10].*AppleWebKit.*Version.*Mobile.*Safari/.test(navigator.userAgent)) ) {
                //	addSmartBanner();
                // }
                addSmartBanner();

                // log ADS event
                if (window._ck12) {
                    window._ck12.logEvent('fbs_view', {
                        'page': 'concept_details',
                        'context_eid': domain.encodedID,
                        'branch': 'Subject:' + controller.branch_handle
                    });
                }
            }
            renderFilters(domain);
        }

        function noConcept() {
            try {
                alert('Sorry, the concept you are trying to view does not exist. Please make sure the entered url is correct.');
            } catch (e) {
                // for "prevent additional dialogues" in FF.
                console.log('Sorry, the concept you are trying to view does not exist. Please make sure the entered url is correct.');
            }
        }

        function bindEventsConcept() {
            $('.js_concept_link').off('click.concept').on('click.concept', function (e) {
                if ($(this).find('a').prop('href')) {
			// Open these modalities in a new window
			var _href = $(this).find('a').prop('href');
			if (window.lmsContext === 'lti-app' && /simulationint|plix/.test(_href) ){
			    e.preventDefault();
			    //For simulations add query-param lmsContext=true
			    var featured_title = e.currentTarget.querySelector(".featured_group");
			    featured_title = featured_title ? featured_title.title : null;
			    if ( featured_title && featured_title.toLowerCase() === "interactive simulations") {
				 _href = _href + "&lmsContext=true";
			    }
			    var other_window = window.open(_href,'lms-context-ref');
			    // List for postmessage from other window
			    // to receive info needed to create the assignment
			    // for lms using bridge 
			    try {
				window.addEventListener('message', function(event) {
				    console.log("Received post message");
				    if (event.origin !== window.origin && event.origin.slice(-8) !== window.origin.slice(-8)) {
					    return;
				    }
				    other_window.close();
				    var LTIBridge = new ltiBridge();
				    LTIBridge.onAssignAction(JSON.parse(event.data));
				});
			    } catch(e) {
				console.log("Error on create assignment via postmessage:" + String(e));
			    }
		    } else {
                        window.location = $(this).find('a').prop('href');
		    }
                }
            }).off('mouseenter.feature').on('mouseenter.feature', function () {
                if($(this).find(".memory-boost-btn").length==0){
                	$(this).addClass('hover').find('.featured_thumbnail_wrapper.overlay').fadeIn();
                }
            }).off('mouseleave.feature').on('mouseleave.feature', function () {
            	if($(this).find(".memory-boost-btn").length==0){
            		$(this).removeClass('hover').find('.featured_thumbnail_wrapper.overlay').fadeOut();
                }
            });
        }

        function getTestType(policies) {
            if (policies && policies instanceof Array) {
                var index;
                for (index = 0; index < policies.length; index++) {
                    if ('timelimit' === policies[index].name) {
                        return 0 === parseInt(policies[index].value, 10) ? 'practice' : 'quiz';
                    }
                }
            }
            return 'quiz';
        }

        function bindEventsFeatured() {
            var featuredWidth, featured = $('#featured_content');
            $(window).off('resize.featured').on('resize.featured', function () {
                if (isResizeFeatured) {
                    isResizeFeatured = false;
                    setTimeout(function () {
                        if (featured.is(':visible')) {
                            featuredWidth = featured.children(':eq(1)').length ? (parseInt(featured.children(':eq(1)').css('margin-left').replace('px', ''), 10) * (featured.children().length - 1)) : 0;
                            featuredWidth = featured.children().width() * featured.children().length + featuredWidth;
                            featured.css('width', featuredWidth);
                        }
                        isResizeFeatured = true;
                    }, 500);
                }
            });
        }

        function renderFeatured(featured,collectionHandle) {
            try {
                if (featured && featured instanceof Array && featured.length) {
                    featured = _(featured).sortBy(function (i) {
                        return featured_sort.indexOf(modalityUtil.getModalityType(i.artifactType));
                    });

                    var index,
                        concept = '',
                        practiceModality = '';
                    for (index = 0; index < featured.length; index++) {
                        featured[index] = controller.processModality(featured[index]);
                        featured[index].modalityIcon = modalityUtil.getModalityIcon(featured[index].modality_group.display_text);
                        if (featured[index]) {
			    concept += featuredTemplate(getCollectionTitle(featured[index]));
			    if ('asmtpractice' === featured[index].artifactType) {
				practiceModality = featured[index];
			    }
                        }
                    }
                    featured = $('#featured_content');
                    if (concept) {
                        featured.append(concept);
                        $('#featured-loading-icon').addClass('hide').removeClass('show');
                        if (practiceModality) {
                            if (adaptive) {
                                window.ADAPTIVE_TEST_PROMISE = window.ADAPTIVE_TEST_PROMISE ? window.ADAPTIVE_TEST_PROMISE : controller.getAdaptiveScores(practiceModality.perma.replace('asmtpractice', 'practice').replace(/^(\/)/, ''), collectionHandle);

                                window.ADAPTIVE_TEST_PROMISE.done(function (score) {
                                	practiceButtonHandler.call(featured[0], practiceModality, score);
                                    $(".featured_practice").removeClass("hide");
                                });
                            } else {
                                controller.getScores(practiceModality.perma.replace('asmtpractice', 'practice').replace(/^(\/)/, '')).done(function (score) {
                                	$(".featured_practice").removeClass("hide");
                                    var scoreOffset,
                                        practice_score = $('.js-practice_score'),
                                        score_bar = featured.find('.progress-bar'),
                                        score_bar_wrapper = featured.find('.progress-wrapper'),
                                        practice_button = $('.js-practice_button');
                                    if (score.hasOwnProperty('message')) {
                                        practice_score.text('0%');
                                        practice_button.find('span').text('Practice');
                                        bindPracticeEvents.call(featured[0], practiceModality, score.message, 'practice', true);
                                    } else if (score.hasOwnProperty('summary') && score.summary.hasOwnProperty('highestScore') && !($.isEmptyObject(score.summary.highestScore))) {
                                        scoreOffset = parseInt((score.summary.latestScore.attemptNum || 0) - (score.summary.highestScore.attemptNum || 0) + 1, 10);
                                        score = score.summary.highestScore;
                                        index = getTestType(score.policies || '');
                                        score = Math.floor(parseInt((score.score || 0), 10) / parseInt((score.questionsCount || 1), 10) * 100);
                                        practice_score.text(score + '%');
                                        var dasharray = +(score_bar.attr('stroke-dasharray'));
                                        var offsetScore = (+score >= 100 ) ? 100 : +score;
                                        var offsetPercent = dasharray - ((+offsetScore * dasharray)/100);
                                        score_bar.attr('stroke-dashoffset', offsetPercent);
                                        if (100 === score) {
                                            practice_button.find('span').text('Track your Progress');
                                        } else if (84.9 < score) {
                                            practice_button.find('span').text('Review Performance');
                                        } else {
                                            practice_button.find('span').text('Try again');
                                        }
                                        bindPracticeEvents.call(featured[0], practiceModality, score, index, scoreOffset, true);
                                    } else {
                                        practice_score.text('0%');
                                        practice_button.find('span').text('Practice');
                                        bindPracticeEvents.call(featured[0], practiceModality, 0, 'practice', 0, true);
                                    }
                                    util.ajaxStop();
                                });
                            }
                        }
                        concept = featured.children().length;
                        if (concept <= 3) {
                            featured.parent().addClass('featured_three');
                        } else if (4 === concept) {
                            featured.parent().addClass('featured_four');
                        } else if (5 === concept) {
                            featured.parent().addClass('featured_five');
                        }
                        index = (featured.children().width() + 2) * concept; // +2 for border
                        if (featured.children().length > 1) {
                            index += parseInt(featured.children(':eq(1)').css('margin-left').replace('px', ''), 10) * (concept - 1);
                        }
                        featured.css('width', index);
                        bindEventsConcept();
                        bindEventsFeatured();
                        $(window).trigger('resize.featured');
                        $('.featured_thumbnail_wrapper.overlay').hide();
                    } else {
                        featured.parents('.featured_content').addClass('hide');
                    }
                } else {
                    $('#featured_content').parents('.featured_content').addClass('hide');
                }
            } catch (e) {
                console.log(e);
                console.log('Something is not right.');
            }
        }

        this.renderFilters = renderFilters;
        this.renderConcept = renderConcept;
        this.renderModalities = renderModalities;
        this.cleanupFilters = cleanupFilters;
        this.cleanupModalities = cleanupModalities;
        this.applyFilter = applyFilter;
        this.noConcept = noConcept;
        this.renderFeatured = renderFeatured;
    }

    return ConceptView;
});
