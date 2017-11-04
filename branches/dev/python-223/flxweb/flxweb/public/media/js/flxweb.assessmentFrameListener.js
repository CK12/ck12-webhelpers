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

define( 'flxweb.assessmentFrameListener',
    ['jquery','common/views/login.popup.view','flxweb.global'], 
    function($, signin) {
        'use strict';
        
        function assessmentFrameListener(){
        	var LISTENER_APIS = [],
        		requestedApis = [],
        		DEFAULT_APIS = ["resize"],
        		listenerObject,
        		signinInstance;
        	
        	function init(options){
        		requestedApis = (options && options.apis && options.apis.length !== 0)? options.apis: DEFAULT_APIS;
        		requestedApis.push("backHandle");
        		
        		initListener();
        		exposeApis();
        		bindEvents();
        	}
        	
        	function initListener(){
        		listenerObject = {
        				"resize": resize,
             			"showSigninDialog": showSigninDialog,
             			"loadQuiz": loadQuiz,
             			"getParentURL" : getParentURL,
             			"loadTestDetailsPage": loadTestDetailsPage,
             			"shareTest": shareTest,
             			"loadTestDetails": loadTestDetails,
             			"setParentURL": setParentURL,
             			"loadMyTests": loadMyTests,
                        "backHandle": backHandle,
             			"contributeQuestionForConcept": contributeQuestionForConcept
        		};
        		
        		LISTENER_APIS = [];
        		
        		for(var key in listenerObject){
        			LISTENER_APIS.push(key);
        		}
        	}
        	
        	function exposeApis(){
        		window.assessmentFrameListener = {};
        		
        		for(var i=0;i<requestedApis.length;i++){
        			if($.inArray(requestedApis[i],LISTENER_APIS) !== -1){
        				window.assessmentFrameListener[requestedApis[i]] = listenerObject[requestedApis[i]];
        			}
        			else{
        				//console.log("No such API available.");
        			}
        		}
        	}
        	
        	function resize(options){
	        	var height = (options && options.height)? options.height: 350;
	        	
                if(options && options.noPadding){
                    height = height;
                }else{
                	height = height + 50;
                }
	        	$("#assessmentFrame").css("height", height);
	        	$(".js-assessment-frame").animate({"height": height},"slow");
	        	//console.log("Frame resized. height: "+ height + "px");
		     }
			 
        	function showSigninDialog(options){
            	var $coversheet = $(".concept-coversheet"); 
                if(options && options.hashUrl){
                    $.cookie('assessmentFrameUrlConfig', options.hashUrl);
                }
                
                if($coversheet.length > 0 && $coversheet.hasClass("open")){
                	$coversheet.addClass("coversheet-open");
                }
                signinInstance = signin.showLoginDialogue();
            }
			 
			 function loadQuiz(){
		        	var permaUrl = $("#permaUrl").val(),
		        		handle = permaUrl.split("/")[1],
		        		url = window.location.href,
		        		redirectUrl;
		        	
		        	handle = handle.split("-");
		        	handle[handle.length-1] = "Exercise";
		        	redirectUrl = "quiz/" + handle.join("-");
		        	
		        	window.location.href = url.replace(permaUrl,redirectUrl);
		     }
		        
		     function getParentURL(){
		        	return window.location.href;
		     }
		     
		     function setParentURL(url){
		    	 	$.removeCookie('assessmentFrameUrlConfig');
		        	window.location.href = url;
		     }
		     
		     function loadTestDetailsPage(){
		    	 if($("#testDetailsUrl").length !== 0){
		    		 window.location.href = $("#testDetailsUrl").attr("href");
		    	 }
		     }
		     
		     function loadTestDetails(options){
		 		var mtype,
		 			URL_CONSTANTS = {}, 
		 			mode = (options && options.mode) ? options.mode.toLowerCase(): null;
		 		
		 		if(options && options.handle && options.encodedId && options.type){
		 			mtype = options.type.toLowerCase();
		 			
		 			URL_CONSTANTS.TEST_DETAILS = "/"+ mtype +"/"+ options.encodedId +"/"+ options.handle;
		 			URL_CONSTANTS.EDIT_TEST = "/editor/test/"+ mtype +"/"+ options.encodedId +"/"+ options.handle + "?referrer=my_content" ;
		 			
		 			window.location.href = (mode === 'edit')? URL_CONSTANTS.EDIT_TEST : URL_CONSTANTS.TEST_DETAILS;
		 		}
		 		else if(options && options.mode && options.mode === "create"){
		 			URL_CONSTANTS.CREATE_TEST = "/create/exercise/test/" + "?referrer=my_content";
		 			
		 			window.location.href = URL_CONSTANTS.CREATE_TEST;
		 		}
		 	 }
		     

		 	//This could be entirely hosted by assessment itself
		 	function shareTest(options){
		 		var mtype_map = {
		 	                'practice':'asmtpractice',
		 	                'quiz':'asmtquiz',
		 	                'interactive practice':'asmtpracticeint'
		 	        },
		 	        mhandle = null,
		 	        realm = null,
		 	        mtype = mtype_map[options.type.toLowerCase()],
		 	        testDetailsUrl = null,
		 	        errorMessage = "some of the required values for sharing test are missing!",
		 	        share_map = {
		 	        	"twitter": "http://twitter.com?status=Reading%20@@page_url@@",
		 	        	"facebook": "https://www.facebook.com/sharer.php?u=@@page_url@@",
		 	        	"mail": "mailto:?&subject=@@artifact_title@@&body=@@artifact_title@@ : @@page_url@@"
		 	        },
		 	        shareURL = null,
		 	        webroot_url = null,
		 	        artifactTitle = '';
		 			
		 		if(window.location.origin){
		 			webroot_url = window.location.origin;
		 		}
		 		else{
		 			var pathArray = window.location.href.split( '/' );
		 			var protocol = pathArray[0];
		 			var host = pathArray[2];
		 			webroot_url = protocol + '//' + host;
		 		}
		 		
		 		if(!(options && options.handle && options.encodedId && options.shareVia && options.concepthandle && options.branchhandle)){
		 			//console.log(errorMessage);
		 			return;
		 		}
		 		
		 		mhandle = options.handle.split("/")[0];
		 		realm = options.handle.split("/")[1];
		 		
		 		if(realm && mhandle && mtype && webroot_url){
		 			testDetailsUrl = webroot_url + '/' + options.branchhandle.toLowerCase() + '/' + options.concepthandle + '/' + mtype + '/' + realm + '/' + mhandle +'/';
		 		}
		 		else if(mhandle && mtype && webroot_url){
		 			testDetailsUrl = webroot_url + '/' + options.branchhandle.toLowerCase() + '/' + options.concepthandle + '/' + mtype + '/' + mhandle + '/';
		 		}
		 		else{
		 			//console.log(errorMessage);
		 			return;
		 		}
		 		
		 		artifactTitle = mhandle.replace(/\-/g," ");
		 		
		 		shareURL = share_map[options.shareVia];
		 		testDetailsUrl = escape(encodeURI(testDetailsUrl));
		 		shareURL = shareURL.replace("@@page_url@@", testDetailsUrl);
		 		shareURL = shareURL.replace(/@@artifact_title@@/g, escape(artifactTitle));
		 		
		 		window.open(shareURL);
		 	}
		 	
		 	function loadMyTests(){
				window.location.href = '/my/tests/'; 
			}

			function backHandle () {
				$('#createworkbookwrapper .back-button')[0].click();
			}
	function contributeQuestionForConcept(options){
				var title = $("#createworkbookwrapper> h1> a").html(),
					ep = (title !== '')? $("#createworkbookwrapper> h1> a.js-quiz-back").attr("href"): '',	
					url = '/exercise/add/question/ae/';
				if(ep === "" || ep === undefined){
					ep = window.location.href;
					
				}
				if(options){

					url = (ep && title)? url + '?title='+ title +'&ep='+ encodeURIComponent(ep): url;
					
					window.location.href = url;
				}
			}
		 	
		 	function bindEvents(){
		 		var ua = navigator.userAgent,
		 			isAndroid = ua.match(/Android/i),
		 			supportsOrientationChange,
		 			orientationEvent;
		 		
		 		if(isAndroid){
	            	// Detect whether device supports orientationchange event
	        		supportsOrientationChange = "onorientationchange" in window;
	        		orientationEvent = supportsOrientationChange ? "orientationchange" : "";

	        		orientationEvent && window.addEventListener(orientationEvent, function() {
	        			$("#assessmentFrame")[0].contentDocument.location.reload();
	        		}, false);
	        	}
				$('#createworkbookwrapper .back-button').on('click', function (e) {
					var queries = function () {
						var query_string = {};
						var query = window.location.search.substring(1);
						var vars = query.split("&");
						for (var i=0;i<vars.length;i++) {
							var pair = vars[i].split("=");
							if (typeof query_string[pair[0]] === "undefined") {
								query_string[pair[0]] = decodeURIComponent(pair[1]);
							} else if (typeof query_string[pair[0]] === "string") {
								var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
								query_string[pair[0]] = arr;
							} else {
								query_string[pair[0]].push(decodeURIComponent(pair[1]));
							}
						}
						return query_string;
					}();
					
					if (window.frames[0].assessmentFrameListener) {
						var handleObj = window.frames[0].assessmentFrameListener.handleBack(e);
						if (handleObj.backHandledInternally) {
							e.preventDefault();
						} else if (handleObj.referrer === "assignment" && handleObj.ep) {
							e.preventDefault();
							if (handleObj.ep) {
								window.location.href = handleObj.ep;
							}
						} else if (handleObj.referrer === "coversheet") {
							e.preventDefault();
							var coversheetUrl = window.location.search.split('&coversheetUrl=')[1];
							window.location.href = coversheetUrl;
						} else if (window.location.search.search('coversheetUrl') > -1 && !handleObj.preview) {
							e.preventDefault();
							var coversheetUrl = window.location.search.split('&coversheetUrl=')[1];
							window.location.href = coversheetUrl;
						}
					} else if (queries.referrer === "assignment") {
						e.preventDefault();
						window.location.href = '/my/groups/';
					}
				});
			}

		     this.init = init;
        }
        
        return new assessmentFrameListener();
    }
);
