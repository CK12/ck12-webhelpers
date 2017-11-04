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
define('flxweb.details.modality.ae', ['jquery','common/utils/utils', 'flxweb.reviews', 'flxweb.assessmentFrameListener', 'flxweb.details.modality.exercise', 'flxweb.global','jquery.appdownload'],
    function ($, Util, ReviewsModule, frameListener,smartbanner) {
        'use strict';

        function UIControllerAE() {
            var permaUrl = $('#permaUrl').val(),
                baseUrl = $('#assessment_base_url').val(),
                renderer = null,
                task_type_display_name = null,
                artifactID = (window.js_modality_data && window.js_modality_data.artifact && window.js_modality_data.artifact.artifactID) ? window.js_modality_data.artifact.artifactID : null,
                /*revisionID = (window.js_modality_data && window.js_modality_data.artifact && window.js_modality_data.artifact.artifactRevisionID) ? window.js_modality_data.artifact.artifactRevisionID : null,*/
                params = null,
                testType ,
                handle,
                urlConfig,
                successModalTemplate = '<div class="reveal-modal modal-uikit medium success-modality-modal" id="successModalityModal">' +
                                       '<a class="close-reveal-modal close hide-small sign-in-close">+</a>' +
                                       '<div class="top-head">@@successHeader@@</div><div class="success-download-msg">@@successMessage@@</div>' +
                                       '<div class="text-center"><a id="ok-btn" data-reveal-id="successModalityModal" class="ok-btn button standard turquoise">OK! Got it</a></div></div>';

            if(window.js_modality_data.artifact.artifactType ===  "asmtpractice"){
            	var handleData = permaUrl.split('/'),
            		handleConfig = handleData[0] + '/' + window.js_modality_data.domain.branchInfo.handle + '/' + handleData[1] ;
            	 urlConfig = {
                        'test_detail': 'detail/' + handleConfig.toLowerCase(),
                        'test_attempts': 'attempts/' + permaUrl,
                        'embed_test': 'embed/' + permaUrl
                    };
            }else {
            	urlConfig = {
                        'test_detail': 'detail/' + permaUrl,
                        'test_attempts': 'attempts/' + permaUrl,
                        'embed_test': 'embed/' + permaUrl
                    };
            }

            function getQueryParams() {
                var url = window.location.href, i,
                    queryParams = null;

                url = (url.split('?').length > 1) ? url.split('?')[1] : null;
                if (url) {
                    queryParams = url.split('&');

                    if (queryParams.length !== 0) {
                        for (i = 0; i < queryParams.length; i++) {
                            if (queryParams[i].split('=').length === 2) {
                                //if params is null create an empty object for it
                                params = params  || {};

                                params[queryParams[i].split('=')[0]] = queryParams[i].split('=')[1];
                            }
                        }
                    }
                }
            }

            function updateQueryParamBasedValues() {

                //need to update test_attempts url if scoreOffset is present inquery param
                if (params && params.scoreOffset) {
                    urlConfig.test_attempts = urlConfig.test_attempts + '?scoreOffset=' + params.scoreOffset;
                }
            }

            function addReferrer(url) {
                var modUrl = '',
                    referrer = 'concept_details';

                //TODO:find out the referrer for concept details page
                
                modUrl = url;
                if(!/[\?\&]referrer/.test(url)){
                	modUrl = modUrl + ((url.indexOf('?') !== -1) ? ('&referrer=' + referrer) : ('?referrer=' + referrer));
                }
                if(/\attempts/.test(url)){
                	modUrl = modUrl.replace("attempts","detail");
                	modUrl = modUrl + "&attemptPage=true";
                }
                if(!/\&attemptPageReferrer/.test(modUrl)){
                	modUrl = modUrl + "&attemptPageReferrer=practice_details";
                }
                
                return modUrl;
            }
            
            function handleMenuItem(e) {
            	var that = e.target.parentElement,
        	    $that = $(that),
        	    targetElement = e.target,
                selectedUrlconfig = $(e.target.parentElement).attr('urlconfig') ||  $(e.currentTarget).attr('urlconfig'),
            	disabled = $that.hasClass('disable'),
                url = null;
            if (selectedUrlconfig && !disabled) {
                if($that.hasClass('selected')){
                    $("#embedModal").addClass("hide");
                    $that.removeClass('selected');
                }
                else {
                	$that.parent().parent().parent().find(".selected").removeClass("selected");
                	$that.addClass('selected').siblings('li').removeClass('selected');
                    if (!window.ck12_signed_in && selectedUrlconfig !== "test_detail") {
                        $.flxweb.alertToSignin();
                        return;
                    }
                    url = baseUrl + urlConfig[selectedUrlconfig]; // + userName;
                    url = addReferrer(url);
                    if(selectedUrlconfig === "embed_test" ){
                        if($("#embedModal").find(".embed-modal").length === 0){
                            $("#embedModal").append('<div class="sudo-arrow"></div><iframe id="assessmentFrame" class="embed-modal" src="" style="width:100%;border:0px;height: 675px;" scrolling="no"></iframe>');
                            $('#embedModal').find('.embed-modal').attr('src', url);
                            $("#embedModal").removeClass("hide");
                        }else{
                            $("#embedModal").removeClass("hide");
                        }
                        $(document).on('click.embedClose', function (e) {
             		       if(e.target.offsetParent && !e.target.offsetParent.hasAttribute("urlconfig")){
             			       $("#embedModal").addClass("hide");
             			       $('li.ellipse li.embedUrl').removeClass('selected');
                               $(this).off(e);
                           }
                        });
                     }else{
                         $("#embedModal").addClass("hide");
                         $('#exercisewrapper').find("#assessmentFrame").attr('src', url);
                     }
                }
            } else if (!window.ck12_signed_in && !$that.hasClass("ellipse") && !disabled) {
                if (!$that.find('#add_to_library').length && !(targetElement === $('#reveal-overlay')[0]) && !$that.hasClass('modality-info')) {
                    $.flxweb.alertToSignin();
                }
                return false;
            }else if(that.querySelector("a") && that.querySelector("a").innerHTML === "Customize"){
            	var user = document.querySelector("header").getAttribute("data-user");
            	if(!window.sessionStorage.getItem("customizePopup"+user)){
            		$(document).click();
                	var href = that.querySelector("a").getAttribute("href");
                	$("#customizeModalityModal").foundation("reveal","open");
                	$("#customizeModalityModal .button").off("click").on("click",function(){
                		window.sessionStorage.setItem("customizePopup"+user,true)
                		$("#customizeModalityModal").foundation("reveal","close");
				if (window.lmsContext === 'lti-app'){
                		    window.open(href,'lms-context-override');
				} else {
                		    window.location.href = href;
				}
                	})
                	return false;
            	}else{
            		return true;
            	}
            }
        }
            
            function addSuccessModal() {
                if($('#successModalityModal').length === 0) {
                    $('body').append(successModalTemplate);
                    $('#ok-btn').off('click.download').on('click.download', function(){
                        $('#successModalityModal').find('.close-reveal-modal').trigger('click');
                    });
                }
                setTimeout(function(){
                    $('#successModalityModal').foundation('reveal', 'open');
                }, 1000);
            }

            function postDownloadRequestError() {
                $('#downloadModalityModal').find('.close-reveal-modal').trigger('click');
                successModalTemplate = successModalTemplate.replace('@@successHeader@@', 'Error generating ' + task_type_display_name).replace('@@successMessage@@', 'Error generating ' + task_type_display_name);
                addSuccessModal();
            }

            function postDownloadRequestSuccess(data) {
                $('#downloadModalityModal').find('.close-reveal-modal').trigger('click');
                if (data.responseHeader.status === 1011) {
                    successModalTemplate = successModalTemplate.replace('@@successHeader@@', 'Authorization Error').replace('@@successMessage@@', 'You are not authorized to request worksheet with answer keys');
                    return;
                }

                if (data.responseHeader.status !== 0) {
                    postDownloadRequestError(data);
                    return;
                }
                successModalTemplate = successModalTemplate.replace('@@successHeader@@', 'Your worksheet is being generated.').replace('@@successMessage@@', 'We will email you when it is available for download.');
                addSuccessModal();
            }
            
            function postDownloadRequest(key) {
                var answerKey = key || $(':input[name="answerKeys"]:checked').val(),
                    url = null, // format = '/assessment/api/export/test/<testType>/<handle>[/<realm>]?renderer=pdf,html&answer_key=<answerKey>',
                    perma = $('#permaUrl').val();

                url = '/assessment/api/export/test/' + perma + '?renderer=' + renderer + '&answer_key=' + answerKey;

                $.ajax({
                    'url': url,
                    'success': postDownloadRequestSuccess,
                    'error': postDownloadRequestError,
                    'method': 'POST'
                });
            }

            function showDownloadModal() {
                var showModal = window.showDonloadModalOptions;

                renderer = $(this).attr('data-rendertype');
                task_type_display_name = (renderer === 'pdf') ? 'PDF' : ((renderer === 'html') ? 'HTML' : 'Document');
                $('#downloadModalityModal').find('#ansOdd').prop( "checked", true );

                if (showModal) {
                    $('#downloadModalityModal').foundation('reveal', 'open');
                } else {
                    postDownloadRequest('none');
                }
            }

            function bindEvents() {
                //removing default backbone event listeners
                $('#modalitysidebarMenu > li > a').removeClass('js_block_show');

                $('#modalitysidebarMenu > li').on('click', handleMenuItem);

                $('.js_renderlink').off('click.download').on('click.download', showDownloadModal);

                //fixing special character issue in tweeter share 
                //TODO: fix in the modality actions template
                $('.shareTweetLink', '#shareDiv').removeAttr('href').on('click', function () {
                    var shareURL = 'http://twitter.com?status=Reading%20@@page_url@@',
                        testDetailsUrl = escape(encodeURI($('meta[itemprop=url]').attr('content')));

                    shareURL = shareURL.replace('@@page_url@@', testDetailsUrl);
                    window.open(shareURL);
                });
                $('#download-pdf-btn').off('click.download').on('click.download', function(){postDownloadRequest(false)});
                $("body").off("click").on("click",function(e){
                	$
                });
            }

            function checkForcedSignIn() {
                var selectedUrlconfig = $.cookie('assessmentFrameUrlConfig') || ((params && params.tab) ? params.tab : null),
                    $menuElement = null,
                    url = null,
                    ele = null;

                if (selectedUrlconfig && window.ck12_signed_in) {
                    $.removeCookie('assessmentFrameUrlConfig');
                    $menuElement = $('#modalitysidebarMenu > li[urlconfig="' + selectedUrlconfig + '"]');

                    if ($menuElement.length !== 0) {
                        $menuElement.click();
                    } else {
                        selectedUrlconfig = addReferrer(selectedUrlconfig);
                        selectedUrlconfig = addCollection(selectedUrlconfig);
                        $('#assessmentFrame').attr('src', selectedUrlconfig);

                        //In this case we have switched from practice mode to quiz mode in assessment frame
                        $('#modalitysidebarMenu > li').removeClass('selected');
                        $('#testDetail').addClass('selected');
                    }
                } else {
                    selectedUrlconfig = 'test_detail';
                    ele = $('#assessmentFrame');

                    if (selectedUrlconfig) {
                        url = baseUrl + urlConfig[selectedUrlconfig]; // + userName;
                        url = addReferrer(url);
                        url = addCollection(url);
                        ele.attr('src', url);

                        $('#modalitysidebarMenu > li').removeClass('selected');
                        $('#testDetail').addClass('selected');
                    }
                }
            }

            function addCollection(url){
            	var _collectionData = Util.getCollectionData(window.location.href);
            	if(_collectionData.collectionHandle){
                	url += '&collectionHandle='+_collectionData.collectionHandle;
                }
                if(_collectionData.collectionCreatorID){
                	url += '&collectionCreatorID='+_collectionData.collectionCreatorID;
                }
                if(_collectionData.conceptCollectionHandle){
                	url += '&conceptCollectionHandle='+_collectionData.conceptCollectionHandle;
                }
                return url;
            }
            
            function initReviewList() {
                if (artifactID) {
                    new ReviewsModule.ReviewsListView({
                        el: $('#reviews'),
                        'artifactID': artifactID,
                        myReviewView: window.myReview
                    });
                }
            }
             function addSmartBanner(){
	    	     if($.smartbanner){
	     		    $.smartbanner({
	 			    title: 'CK-12',
	 			   author : "CK-12 Foundation",
	 			    daysHidden: 2,
	 			    daysReminder : 2,
	 			    icon : "/media/images/logo_120.png",
	 			    appendToSelector: $('.content-wrap')
	 		     	 });
	              }
             }
             function handleMenuRole(){
                 var isTeacher = window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";
            	 if(isTeacher){
                 	$(".testAttempt").addClass("hide");
                 }else{
                	 $(".customize-practice").addClass("hide-important");
                	 $(".create-question").addClass("hide-important");
                	 $(".assign-to-class").addClass("hide-important");
                	 
                 }
             }
            function init() {
                getQueryParams();
                updateQueryParamBasedValues();
                bindEvents();

                checkForcedSignIn();

                if (artifactID) {
                    window.myReview = new ReviewsModule.MyReviewView({
                        el: $('#myreview'),
                        'artifactID': artifactID
                    });
                }
                $('#review_list_container').bind('flxweb.modality.read.initreviewlist', initReviewList);
                frameListener.init({
                    'apis': ['resize', 'showSigninDialog', 'loadQuiz', 'getParentURL', 'setParentURL']
                });
                // if ( !(/(iPhone).*OS [9,10].*AppleWebKit.*Version.*Mobile.*Safari/.test(navigator.userAgent)) ) {
                // 	addSmartBanner();
                // } 
                addSmartBanner();
                 handleMenuRole();
                 $('#downloadModalityModal').appendTo('body');
            }

            this.init = init;
        }

        $(document).ready(function () {
            var view = new UIControllerAE();
            view.init();
        });
    }
);
