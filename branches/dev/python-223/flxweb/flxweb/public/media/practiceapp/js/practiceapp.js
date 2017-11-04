/* vim: set noexpandtab: */
define([
    "jquery-ui",
    'jquery',
    'underscore',
    'backbone',
    'practiceapp/views/views',
    'common/utils/url',
    'common/utils/user',
    'common/utils/timers',
    'practiceapp/services/practiceapp.services',
    'practiceapp/config/config',
    'common/views/modal.view',
    'practiceapp/views/assign.concept.view',
    'common/utils/concept_coversheet',
    'common/utils/base64',
    'text!practiceapp/templates/resource.selection.popup.html',
    'practiceapp/utils/buildEmbedURL'
],
function(jqueryUI, $, _, Backbone, Views, URLHelper, User, Timers, PracticeAppServices, Config, ModalView, AssignConceptView, coverSheet, Base64, RSpopup, BuildURL){
    /**
     * Main controller for practice app. 
     */
    'use strict';
    function PracticeApp(){
        var _c = this,          //reference to self
            appUrl = new URLHelper(), //app URL
            appContext = {},    //Application context to be shared across views
            appServices = null,
            activeView = null,   //Currently active view
            splashTimeout = null, //splash screen timeout
            assignConceptPopup = null;
      
        function showIndexAlertBanner(context){
            $("#lms_banner_alert").css({top:'-25px'});
            $("#lms_banner_alert").removeClass('hide');
        }

	function prepEmbedUrl(url) {
	    var re = /\/embed\//;
	    // Only check embed urls
	    if (re.test(url)){
	        url = (new URLHelper(url).updateHashParams({'hideConceptLink':true})).url();
            }
	    return url;
	}
      
        function switchView(View, options){
            if (activeView && 'function' === typeof activeView.destroy){
                activeView.destroy();
            }
            activeView = new View($.extend(true, {
                'el': $("#practiceapp_container"),
                'controller': _c
            }, options));
            bindSubViewEvents();
        }

        /**
         * Initialize Dexter for analytics
         */
        function initializeDexter() {
            var appID = appContext.config.app_name,
                provider = appContext.config.provider;
                
            _c.dexterjs = window.dexterjs({
                memberID: null,
                clientID: 24839961,
                mixins: {
                    appID: appID,
                    lmsProvider: provider
                }
            });
            try {
                var page_view = {'URL': window.location.href};
                _c.dexterjs.logEvent('FBS_PAGE_VIEW', page_view);
            } catch(e){
                console.log("Error trying to send dexter event FBS_PAGE_VIEW: " + e);
            }
        }
       
        /** 
         * Make flx call to add member to group (Bug #445764)
         *
         */
        function addMemberToGroup(assignmentEID, assignmentID, callback){
            if(assignmentEID || assignmentID){
                    try{
			var contextID, userID, ltiInfo, permission=null; 
			if (_c.appContext.config.provider === 'google'){
			    contextID = _c.appUrl.search_params.contextID;
			    userID =  _c.appContext.googleID;
			    permission =  _c.appContext.googlePermission;
			} else {
                            ltiInfo = _c.appContext.user.get('ltiInfo');
			    contextID = ltiInfo.context_id;
			    userID = ltiInfo.user_id;
			}	
                        var addmember = appServices.addMemberToGroup(assignmentEID,contextID,userID,_c.appContext.launch_key,assignmentID,permission);
		        addmember.done(function(response){
                            console.log("Add member to group done: "+ JSON.stringify(response.response));
			    return callback(response.response.assignmentID);
                        });
		        addmember.fail(function(e){
                            if ( e && e.responseHeader && e.responseHeader.status === 6009){
                                // For students tell them we could not load the assignment
                                // they will not be able to edit the assignment
                                if ( _c.appContext.user.is_student()) {
                                    _c.showMessage("Sorry we couldn't load this assignment. Please try again later. <br> Error Code: LMS6009");
                                    return;
                                }
                              // For teachers tell them this was a specific course copy issue
                              // provide a link to our help center with details on how to fix.
                              _c.showMessage("Sorry we could not copy this assignment to your lms. <br> Error Code: LMS6009 <br> <a target='_blank' href='https://ck12support.zendesk.com/hc/en-us/articles/115001395754'>Show me how to fix this</a>");
                              return;
                            }
                            console.log("Add member to group failure: "+ JSON.stringify(e));
			    return callback();
                        });
                   } catch(e){
                       console.log("JS Error trying to add member to group: " + e);
                       _c.showMessage("Sorry we could not load this assignment. Please try again later.");
		       //return callback();
                   }
            }
        }

        /**
         *  Check to see if the LMS supports grade passback
         *  @param ltiInfo (object) - Object with LMS launch info
         */
        function supportsGradePassback(ltiInfo){
            return ltiInfo ? ltiInfo.hasOwnProperty('lis_outcome_service_url') : false;
        }

        function processExtraRedirect(redirect){
            $.cookie('ck12_no_profilebuilder', 'true', {
                path: '/'
            });
            window.setTimeout(function(){
                window.location.href = redirect;
            }, 10);
        }

        function processExtraAssignmentEID(assignmentEID, ep){
            addMemberToGroup(assignmentEID, null, function(assignmentID){
                // Show course copy link
                window.lmsCourseCopy = buildLTILaunchURL({'assignmentID':assignmentID}).url();
                window.parent.postMessage({'lmsCom': window.lmsCourseCopy}, '*');
                
                console.log("[LMS6009 Course Copy] This is your new CK-12 assignment url: "+ window.lmsCourseCopy);
                // This is now a proxy to get the assignmentID
                // for pre collection practice and quiz assignments
                var assignment = appServices.getAssignment(assignmentID);
                assignment.done(function (assignmentObj) {
                    var assignmentEID = assignmentObj.concept.domains ? assignmentObj.concept.domains[0].encodedID : assignmentObj.concept.encodedID;
                    if (assignmentObj.concept.type === 'asmtpractice' || assignmentObj.concept.type === 'domain') {
                        var modality = appServices.getMinimalModalities(assignmentEID, assignmentObj.concept);
                        modality.done(function (response_data) {
                            if (response_data && response_data.redirectedConcept) {
                                assignmentEID = response_data.redirectedConcept.encodedID;
                            }
                            showCoverSheet(assignmentEID, ep, false, false, assignmentObj.concept);
                        });

                        modality.fail(function (message) {
                            console.log(message);
                            _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                        });
                    } else if (assignmentObj.concept.type === 'asmtquiz') {
                        // For quizes load the cover sheet
                        // assignmentEID will be an artifactID
                        try {
                            if (!assignmentObj.concept.id){
                                throw new Error("Concept id not found");
                            }
                            showCoverSheet(String(assignmentObj.concept.id), ep, false, false);
                        } catch(e) {
                            console.log(String(e));
                            _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                        }
                    } 
                });
                assignment.fail(function(message){
		            console.log(message);
                    _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                });
            });
        }

        function processExtraModalityURI(ltiExtra, is_student){
            addMemberToGroup(null, ltiExtra.assignmentID, function(_assignmentID){
                var url = prepEmbedUrl(ltiExtra.modalityURI);
                _c.launchPlayView(url);
                if (is_student){
                    //try reporting the score to LMS.
                    console.log("ArtifactID:",ltiExtra.artifactID);
                    submitLTIScore(_assignmentID, ltiExtra.artifactID);
                }
            });
        }

        function processExtraAssignmentID(assignmentID, prefix, is_student, ep, options){
            addMemberToGroup(null, assignmentID, function(_assignmentID){
	        //Get the assignment Info
                var assignment = appServices.getAssignment(_assignmentID);
                assignment.done(function (assignmentObj) {
                    var assignmentEID = assignmentObj.concept.domains ? assignmentObj.concept.domains[0].encodedID : assignmentObj.concept.encodedID;
                    if (assignmentObj.concept.type === 'asmtpractice' || assignmentObj.concept.type === 'domain') {
                        var modality = appServices.getMinimalModalities(assignmentEID, assignmentObj.concept);
                        modality.done(function (response_data) {
                            if (response_data && response_data.redirectedConcept) {
                                assignmentEID = response_data.redirectedConcept.encodedID;
                            }
                            showCoverSheet(assignmentEID, ep, false, false, assignmentObj.concept, options);
                        });

                        modality.fail(function (message) {
                            console.log(message);
                            _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                        });
                    } else if (assignmentObj.concept.type === 'asmtquiz') {
                        // For quizes load the cover sheet
                        // assignmentEID will be an artifactID
                        try {
                            if (!assignmentObj.concept.id){
                                throw new Error("Concept id not found");
                            }
                            showCoverSheet(String(assignmentObj.concept.id), ep, false, false,null, options);
                        } catch(e) {
                            console.log(String(e));
                            _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                        }
                    } else if (assignmentObj.concept.type === 'plix') {
                        loadPlixAssignment(_assignmentID, assignmentObj.concept.contextUrl, is_student, options.lmsGroupID);
                    } else {
                        console.log("We need to show embed view");
                        var url = BuildURL.buildEmbedUrlByAssignment(assignmentObj.concept, prefix);
                        _c.launchPlayView(url);
                        if (is_student) {
                            var assignmentID = assignmentObj.assignmentID;
                            var artifactID = assignmentObj.concept.id;
                            submitLTIScore(assignmentID, artifactID);
                        }
                    }

                });

                assignment.fail(function(message){
		    console.log(message);
                });
            });
        }

        function loadPlixAssignment(assignmentID, url, isStudent, lmsGroupID) {
            sessionStorage.setItem('lms-assignment', 'plix');
            sessionStorage.setItem('app-context', 'lti-app');
		    if (isStudent) {
		        sessionStorage.setItem('lms-assignmentID', assignmentID);
            }
            var appcontext = setAppContext("", _c.appContext.config.provider, _c.appContext.config.appID , _c.appContext.config.app_name,lmsGroupID,"","");
            sessionStorage.setItem('ltiAppInfo', JSON.stringify(appcontext));
            url = new URLHelper(url).url();
            window.location.href = new URLHelper(url).url();
        }

        function processInteractiveAssignment(assignmentID, type, url, is_student, user_id){
	    var intac_type = type ? String(type) : '';
	    sessionStorage.setItem('app-context','lti-app');
	    sessionStorage.setItem('lms-assignment', intac_type);
            addMemberToGroup(null, assignmentID, function(_assignmentID){
		// Set assignmentID for student.
		// This will trigger the turin for plix
		if ( type === 'plix' ){
	            document.getElementsByTagName('html')[0].setAttribute('data-lms-assignment','true');
		    if (is_student) {
		        setLTIAppInfo();
		        sessionStorage.setItem('lms-assignmentID', _assignmentID)
		    }
	        }
		if (type === 'simulation'){
		    window.name = "lms-context-simulation-assignment";
		    if (is_student) {
			//Localstorage does not work across subdomains
		        setLTIAppInfo(user_id);
		        //localStorage.setItem('lms-assignmentID', _assignmentID)
			url = url + "&lms_assignmentID="+ _assignmentID;
		    }
		}
                window.location.href = new URLHelper(url).url();
            });
	}

        _c.launchTeacherFirstLaunchView= function(){
            /**
             * Launches teacher first-launch view
             * Used when teacher launches the app for first time,
             * only if LMS doesn't provide email info with app launch
             */
            switchView(Views.TeacherFirstLaunchView);
        };
        
        _c.launchTeacherView = function(){
            /**
             * Launches teacher view 
             */
            var teacherView = Views.TeacherHomeView;
            if (appContext.config.provider === "lti") {
                teacherView = Views.LTITeacherHomeView;
            }
            switchView(teacherView);
            bindEventsForTeacherView();
        };
        
        _c.launchPracticeView = function(){
            switchView(Views.PracticeView);
        };
        
        _c.launchStudentView = function(){
            /**
             * Launches student view (Edmodo only)
             */
            switchView(Views.StudentHomeView);
        };
        
        _c.launchPlayView = function(uri){
            /**
             * Used to launch play view (Embedded modality view) 
             */
            switchView(Views.PlayView, {URI:uri});
        };
        
        _c.setTitle = function(title){
            /**
             * Change the title text displayed in app header 
             */
            $(".app-title").text(title);
        };

        /**
         * Get the name of the LMS using the ltiInfo from launch 
         */
        _c.getLMSName = function(){
            var ltiInfo = _c.appContext.user.get('ltiInfo');
            var lms_name = "";
            if (ltiInfo){
                lms_name = ltiInfo.tool_consumer_info_product_family_code;
            } else if (sessionStorage.hasOwnProperty('ltiAppInfo')){
                try {
		    lms_name = JSON.parse(sessionStorage.getItem('ltiAppInfo')).lms_name;
		} catch(e){
		    console.log("Could not get lms name: "+String(e));
		}
	    }
            return lms_name;
        };

        _c.showScoreSheet = function() {
            /**
             *  Shows score sheet (Edmodo) 
             */
            var testScoreID = _c.appUrl.search_params.testScoreID;
            var groupIDs = _.map(_c.appContext.user.groups, function(g){ return g.id; }).join(",");
            var testSheetURL = _.template("<%= data.testSheetUrlPrefix %><%= data.testScoreID %>&context=<%= data.context %>&groupIDs=<%= data.groupIDs %>&ep=<%= data.ep %>",{
                'testSheetUrlPrefix': '/assessment/ui/?test/detail&testScoreID=',
                'testScoreID': testScoreID,
                'context' : _c.appContext.appName,
                'ep': _c.appUrl.pathname,
                'groupIDs': groupIDs
            },
            {'variable': 'data'});
            window.location.href = testSheetURL;
        
        };
        
        _c.showMessage = function(msg){
            /**
             *  Show a modal popup message
             *  @param msg (String) : Message text
             */
            return ModalView.alert(msg);
        };
        
        function onAppLaunchSuccess(launch_data){
            var base_url = (new URLHelper(window.location.href).updateSearchParams({'launch_key':null})).url();
            window.history.replaceState({},"LMS App", base_url);
            splashTimeout.done(function(){ //wait for splash screen to run its course
                // Remove cookie with launch key Bug 43470
                $.removeCookie(appContext.launch_key, {path:'/'});
                var user = null;
                if (launch_data.responseHeader && launch_data.responseHeader.status === 1001){
                    //First time teacher user
                    appContext.edmodo_user = launch_data.response.edmodoInfo;
                    _c.launchTeacherFirstLaunchView();
                } else {
                    user = new User(launch_data.response);
                    _c.trigger("appAuthSuccess", user);
                }
            });
        }
        
        function onAppLaunchError(launch_data){
            //_c.showMessage("There was an error while initializing the app. Please try launching the app again from " + _c.appContext.config.lms_provider);
            var error_message = "Authentication Failed";
            try{ 
                if ( launch_data.response && launch_data.response.message){
                    error_message = launch_data.response.message;
                } else if ( launch_data.xhr && launch_data.xhr.error){
                    error_message = launch_data.xhr.error;
                }
            }catch(e){ console.log("Error getting response message: "+ e); }
            switchView(Views.ErrorPageView, {"errorMsg": error_message});
        }
      

        function showPermissionPopup(url){
            $('.splashscreen-progress-text').text("Waiting for permissions");
            function getPermissions(e){
                console.dir(e);
                var gauth_win = window.open(url, 'gauth_win', 'status=no,titlebar=no,scrollbars=no, menubar=no, location=no, width=500, height=450, resizable=no');
                // Handle popup blocker
                if (!gauth_win) {
                    ModalView.alert("Click <b>OK</b> to review permissions and continue.",getPermissions, true);
                    clearInterval(timer);
                }
                var timer = setInterval(function() {   
                    if (gauth_win && gauth_win.closed) {  
                        clearInterval(timer);
                        //window.location.reload();
                        googleAuthSuccess(appContext.user);
                        console.log("closed window");
                    }  
                }, 1000);
            }
            //ModalView.confirm( getPermissions,"Please review permisions to continue", "We need your help!");
            //ModalView.alert("Please review permissions to continue",getPermissions, true);
            getPermissions();
        }

        function googleAuthSuccess(user){
            var groupID, groupFetch, edmodoInfo, ep,
            prefix = appContext.config.embed_url_prefix,
            is_student = user.is_student();
            if (!appContext.config.appID || !appContext.launchAssignmentID){
                //if appID or assignmentID is not found
		        // throw an error
                onAppLaunchError();
                return;
            }
            groupID = _c.appUrl.search_params.contextID; // Google Classroom groupID
	        ep = "none";// To hide close button
	        // Verify Assignment	
            $('.splashscreen-progress-text').text("Verifying Assignment");
	        var checkClassroomAuthention = appServices.getGoogleClassroomAuthStatus();
	        checkClassroomAuthention.done(function(data){
                console.log(data);
		        //If not authenticated launch permissions window
		        if (data && !data.googleClassroomAuthenticated){
                    _c.showMessage("Could not verify assignment. Please try opening the assignment again.");
		            return;
		        }
		        appContext.googleID = data.id;
		        appContext.googlePermission = (data.permissions && data.permissions.length ) ? data.permissions[0].permission: 'student';
	            processExtraAssignmentID(appContext.launchAssignmentID, prefix, is_student, ep, {'lmsGroupID': groupID});
	        }).fail(function(err){
		        if (err.responseHeader && err.responseHeader.status===6011) {
		            $('.splashscreen-progress-text').text("Generating permissions url");
                    if (!appContext.googleAuthURL){
		                var googleAuthUrl = appServices.getGoogleAuthURL();

		                googleAuthUrl.done(function(data){
                            console.log("data: " + data);
                            appContext.googleAuthURL = data.googleAuthURL;
			                showPermissionPopup(data.googleAuthURL);
		                }).fail(function(err){
                            console.log("error: " + err);
		                    _c.showMessage("Could not verify assignment. Please try opening the assignment again.");
		                });
                    } else {
                        showPermissionPopup(appContext.googleAuthUrl);
                    }
		        } else {
                    _c.showMessage("Could not verify assignment. Please try opening the assignment again.");
                }
	        });
        }

        function edmodoAuthSuccess(user){
            var groupFetch, edmodoInfo;
            edmodoInfo = appContext.user.get('edmodoInfo');
            if (edmodoInfo){
                appContext.config.appID = edmodoInfo.appID;
                $.cookie('edmodoappID', edmodoInfo.appID);
            } else {
                //if edmodoInfo is not present, look for a cookie
                appContext.config.appID = $.cookie('edmodoappID');
            }
            if (!appContext.config.appID){
                //if app id is still not found, error out.
                onAppLaunchError();
                return;
            } 
            //fetch groups
            $('.splashscreen-progress-text').text("Synching Edmodo groups");
            if (user.is_student()){
                groupFetch = appServices.getGroups({
                    appID: appContext.config.appID
                });
            } else {
                groupFetch = appServices.getGroups({
                    myRole: 'admin',
                    appID: appContext.config.appID
                });
            }
            // For teachers we will let the group fetch happen asynchronously
            // and allow access to the app will the groups are being processed.
            // After the fetch is done we fire a trigger that the teacher view
            // will handle.
            
            if (!user.is_student()){
                if ( !_c.appUrl.search_params.assignmentEID && _c.appUrl.search_params.assignmentID){
                    var assignment = appServices.getAssignment(_c.appUrl.search_params.assignmentID);
                    assignment.done(function (assignmentObj) {
                        var assignmentEID = assignmentObj.concept.domains ? assignmentObj.concept.domains[0].encodedID : assignmentObj.concept.encodedID;
                        if (assignmentObj.concept.type === 'asmtquiz') {
                            _c.coverSheetData = {eid: String(assignmentObj.concept.id), collectionParams: null};
                        } else {
                            _c.coverSheetData = {eid: assignmentEID, collectionParams: assignmentObj.concept};
                        }
                        _c.launchTeacherView();
                    });
                } else {
                    _c.launchTeacherView();
                }
            } 
            groupFetch.done(function(data){
                user.groups = data.response.groups; //TODO: ideally, getGroups should return a better group model.
                _c.trigger('groupFetchDone');
                if(user.is_student()){
                    var assignmentEID = _c.appUrl.search_params.assignmentEID;
                    var assignmentID = _c.appUrl.search_params.assignmentID;
                    // The following changes were done for bug #57077
                    if (_c.launchContext !== 'coversheet' && !assignmentID && !assignmentEID){
                        _c.launchStudentView();
                    } else if (assignmentID){

                        var assignment = appServices.getAssignment(assignmentID);
                        assignment.done(function (assignmentObj) {
                            var assignmentEID = assignmentObj.concept.domains ? assignmentObj.concept.domains[0].encodedID : assignmentObj.concept.encodedID;
                        
                            if (assignmentObj.concept.type === 'asmtpractice' || assignmentObj.concept.type === 'domain') {
                                var modality = appServices.getMinimalModalities(assignmentEID, assignmentObj.concept);
                                modality.done(function (response_data) {
                                    if (response_data && response_data.redirectedConcept) {
                                        assignmentEID = response_data.redirectedConcept.encodedID;
                                    }
                                    showCoverSheet(assignmentEID, _c.appUrl.pathname, false, true, assignmentObj.concept);
                                });

                                modality.fail(function (message) {
                                    console.log(message);
                                    _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                                });
                            } else if (assignmentObj.concept.type === 'asmtquiz') {
                                // For quizes load the cover sheet
                                try {
                                    if (!assignmentObj.concept.id){
                                        throw new Error("Concept id not found");
                                    }
                                    showCoverSheet(String(assignmentObj.concept.id), _c.appUrl.pathname, false, true);
                                } catch(e) {
                                    console.log(String(e));
                                    _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                                }
                            }
                        });
                        assignment.fail(function(message){
                            console.log(message);
                            _c.showMessage("Sorry we could not load this assignment. Please try again later.");
                        });
                    } else {
                        var assignedGroups = appServices.getGroupsForAssignmentEID(assignmentEID);

                        assignedGroups.done(function(data){
                            var group = data && data.response && data.response.groups.length > 0 ? data.response.groups[0] : [];
                            // There should always be at least one group for the given assignmentEID
                            if (!group) {
                                return _c.showMessage("Failed to fetch groups for "+ assignmentEID +" . Please try launching the app again.");
                            }

                            var firstAssigment = group.assignmentDict[Object.keys(group.assignmentDict)[0]];
                            if (!firstAssigment.eids || firstAssigment.eids.length ===0){
                                _c.showMessage("Sorry we could not load this assignment. Please try again later. <br> Error Code: LMS_NO_CONCEPT_FOR_ASSIGNMENT");
                            }
                            var collectionParams = {};
                            collectionParams.collectionHandle = firstAssigment.eids[0].collectionHandle ? firstAssigment.eids[0].collectionHandle : '';
                            collectionParams.conceptCollectionAbsoluteHandle = firstAssigment.eids[0].conceptCollectionAbsoluteHandle ? firstAssigment.eids[0].conceptCollectionAbsoluteHandle : '';
                            collectionParams.conceptCollectionHandle = firstAssigment.eids[0].conceptCollectionHandle ? firstAssigment.eids[0].conceptCollectionHandle : '';
                            collectionParams.collectionCreatorID = firstAssigment.eids[0].collectionCreatorID ? firstAssigment.eids[0].collectionCreatorID : '';
                            collectionParams.id = firstAssigment.eids[0].artifactID ? firstAssigment.eids[0].artifactID : '';

                            showCoverSheet(assignmentEID, _c.appUrl.pathname, false, true, collectionParams);    
                        });
                    }
                }
            }).fail(function(err){
                _c.trigger('appError', err);
                _c.showMessage("Failed to fetch groups. Please try launching the app again.");
            });
        }
        
        function ltiAuthSuccess(user){
            console.log("Here");
            var ltiInfo, ltiExtra, ltiExtraStr, ltiExtraDecoded;
            ltiInfo = appContext.user.get('ltiInfo');

            // Closing the cover sheet calls launch again but does not have lti info.
            if (ltiInfo){
                if(ltiInfo.oauth_consumer_key){
                    _c.dexterjs.set("config", {
                        mixins: { ltiConsumerKey:ltiInfo.oauth_consumer_key}
                    });
                }
                if (ltiInfo.custom_ck12libraryid){
                    appContext.showLibrary = true;
                    appContext.libraryID = ltiInfo.custom_ck12libraryid;
                }
                appContext.config.appID = ltiInfo.appID;
                $.cookie('ck12_ltiapp',ltiInfo.appID);
                $.cookie('ck12_ltiContextID',ltiInfo.context_id);
            } else {
                //if ltiInfo is not present, look for a cookie
                appContext.config.appID = $.cookie('ck12_ltiapp');
            }
            if (!appContext.config.appID){
                //if app id is still not found, error out.
                onAppLaunchError();
                return;
            }

            ltiExtraStr = appUrl.search_params.extra;
            if (ltiExtraStr){
                ltiExtraDecoded = Base64.decode(ltiExtraStr);
                console.log("Decoded extra parameters:", ltiExtraDecoded);
                // We are doing this because we found that some lms are removing trailing periods.
		var loop_count = 0;
                while ( loop_count !== 5){
                    try{
                        ltiExtra = appContext.ltiExtra = JSON.parse(ltiExtraDecoded);
                        break;
                    }catch(err){
                        console.log("Could not parse JSON trying again with an added period.");
                        ltiExtraStr = ltiExtraStr + ".";
                        ltiExtraDecoded = Base64.decode(ltiExtraStr);
                    }
                    loop_count++;
                }
            }
            
            if (ltiExtra){
                var is_student = user.is_student();
                if ( ltiExtra.redirect ){
                	processExtraRedirect(ltiExtra.redirect);
                } else if ( ltiExtra.plixUrl){
                        processInteractiveAssignment(ltiExtra.assignmentID, 'plix',ltiExtra.plixUrl, is_student);
                } else if ( ltiExtra.simsUrl){
                        processInteractiveAssignment(ltiExtra.assignmentID, 'simulation', ltiExtra.simsUrl, is_student, user.id);
                } else if ( ltiExtra.assignmentEID){
                    //var ep = "none";_c.appUrl.pathname+"?extra="+ltiExtraStr;
                	processExtraAssignmentEID(ltiExtra.assignmentEID, "none");
                } else if( ltiExtra.modalityURI ){
                	processExtraModalityURI(ltiExtra, is_student);
                } else if( ltiExtra.assignmentID){
                   var prefix = _c.appContext.config.embed_url_prefix;
                   //var ep = _c.appUrl.pathname+"?extra="+ltiExtraStr;
                   processExtraAssignmentID(ltiExtra.assignmentID, prefix, is_student, "none");
                } 
            } else {
                if(user.is_student()){
                    _c.launchStudentView();
                } else {
		    var lms_name = _c.getLMSName( _c.appContext.config.appID );
		    var appReturn = location.search.search('appReturn') !==-1;
		    if (lms_name === 'schoology' && !appReturn && !window.disableNewLtiFlow){
                        onTryNewFlow.call(_c);
		    } else {
                        _c.launchTeacherView();
		    }
                }
            }
        }

        function getLaunchKey(){
            var launch_key = appContext.hasOwnProperty('launch_key') ? appContext.launch_key : '';
            if (!launch_key && sessionStorage.hasOwnProperty('ltiAppInfo')){
                    launch_key = JSON.parse(sessionStorage.getItem('ltiAppInfo')).launch_key;
            }
            if (!launch_key) {
                    return _c.showMessage("Launch key not found. Please try refreshing the page to launch the app again.");
            }
            return launch_key;
        }
        
        function onAppAuthSuccess(user){
            /**
             * Once authentication is successful, 
             */
            appContext.user = user;
            _c.dexterjs.set("config",{
                'memberID': user.id
            });
            if(appContext.config.provider === "lti"){
                var ltiInfo = appContext.user.get('ltiInfo');
                // If ltiInfo is not found make an api call 
                // with launch key to get it from auth.
                if (!ltiInfo){
                    var launch_key = getLaunchKey();
                    var _ltiInfo = appServices.getLTIInfo(launch_key);
                    _ltiInfo.done(function(data){
                        appContext.user.set('ltiInfo', data);
                        ltiAuthSuccess(appContext.user);
                    });
                    _ltiInfo.fail(function(message){
                        console.log(message);
                        return _c.showMessage("Please try refreshing the page to launch the app again. <br> Error Code: LMS_NO__LTI_INFO");
                    });
                } else {
                    ltiAuthSuccess(user);
                }
            } else if (appContext.config.provider === "google") {
                appContext.launchAssignmentID = appUrl.search_params.assignmentID;
                $(".splashscreen-appname-container").addClass("hide");
                console.log("Loading google classroom flow");
                googleAuthSuccess(user);
            } else {
               edmodoAuthSuccess(user);
            }
            _c.dexterjs.logEvent("LAUNCH_SUCCESS", {
                launchKey: appUrl.search_params.launch_key,
            });
        }
        
        function onAppReady(){
            var launch_key = appUrl.search_params.launch_key;
            var auth_failed = appUrl.search_params.auth_failed;
            if (auth_failed){
                $.removeCookie(appContext.launch_key, {path:'/'});
                _c.trigger('appError', auth_failed,true);

            } else if (launch_key){
                //Store launch in cookie to use again if launching from same session
                $.cookie('ck12_lti_launch_key',launch_key);
                appContext.launch_key = launch_key;
                if ($.cookie(launch_key)){
                    console.log('lti Cookie: ' + launch_key);
                } else{
                    console.log('lti cookie was not found for key: '+launch_key);
                }
                appServices.launchRequest(launch_key).done(function(response){
                    _c.trigger('appLaunchSuccess',response);
                }).fail(function(response){
                    _c.trigger('appLaunchError',response);
                });
            } else {
                if($.cookie('ck12_lti_launch_key')) {
                    appContext.launch_key = $.cookie('ck12_lti_launch_key') ;
                }
                var user = new User();
                user.fetch({
                    'success': function() {
                        _c.trigger("appAuthSuccess", user);
                    },
                    'error': function(model, err) {
                        _c.trigger('appError', err);
                        _c.showMessage("Authentication failed. Please try launching the app again from " + _c.appContext.config.lms_provider);
                    }
                });
            }
        }
        
        function onAppError(err,isAuthFailure,noCookies){
            var data = {"errorMsg": err};
            if (isAuthFailure){
                data.ltiAuthFailure = isAuthFailure;
		var errorCode = appUrl.search_params.errorCode;
                //Check to see if roles where sent back
                var ltiUser_roles = appUrl.search_params.roles;
                if (ltiUser_roles && ltiUser_roles.match(/admin/i) ){
                    data.isAdmin = true;
                    data.hideSupportButton = true;
                }
		if (errorCode){
			switch(errorCode){
		                // 2052 Error code = unkown cosumer key (configuration issue)
				case "2052":
					data.bannerText = "Looks like this app's configuration is not quite right.";
					data.hideSupportButton = true;
					data.isAdmin = true;
					break;
				default:
					break;
			}
		}
                if ($.cookie('lti_auth_error')){
                    // Pylons set_cookie was escaping the equal sign
                    var b64string = $.cookie('lti_auth_error').replace(/\\075/g,"=");
                    b64string = Base64.decode(b64string).split(";");
                    data.senderName = b64string[0].replace(/\u0000/g, "") || "";
                    data.senderEmail = b64string[1].replace(/\u0000/g, "") || "";
                    $.removeCookie('lti_auth_error', {path:'/'});
                }
            }
	    if(noCookies){
	        data.noCookies = noCookies;
	    }
            switchView(Views.ErrorPageView, data);
            console.log("Application encountered an error:", err);
        }

        function buildLTILaunchURL(data){
            var LTISelectionParamsStr = JSON.stringify(data);
            var Base64LTISelectionParams = Base64.encode(LTISelectionParamsStr);
            var ltiLaunchURL = new URLHelper(_c.appContext.config.auth_launch_url + "/" + Base64LTISelectionParams);
            return ltiLaunchURL;
        }
        
        function buildLTIContentReturnURL(ltiLaunchURL, title){
            var ltiInfo = _c.appContext.user.get('ltiInfo');
            var returnUrl = ltiInfo.ext_content_return_url;
            if (!returnUrl){
                    return false;
            }

            var ltiRedirectURL = new URLHelper(returnUrl);            
            //prepare content return URL
            ltiRedirectURL.updateSearchParams({
                return_type: "lti_launch_url",
                embed_type: "basic_lti",
                url: ltiLaunchURL.url(),
                text: title,
                title: title
            });
            console.log(ltiRedirectURL.url());
            return ltiRedirectURL.url();
        }

        /**
         * Show resource selection modal where content return url is not supported
         * @param launch_url (String): URL for the user to copy
         * @param lms_name (String): Name of the lms to get the help center article for
         */
        function showResourceSelectionModal(launch_url, lms_name){
	    var rsTemplate = _.template(RSpopup);
            var helplink = "https://ck12support.zendesk.com/hc/en-us/sections/201430807-Other-Learning-Management-Systems";
            Views.ResourceModalView({
                //headerPartial: "<div class='small-12 columns text-center'>Your selection is ready!</div>",
                contentPartial: rsTemplate({
                    launchURL: launch_url,
                    helpcenter_url: helplink
                }),
                el_id: "clip"
            });
        }

        function submitLTIScore(assignmentID, artifactID){
            var contextID;//ltiInfo = _c.appContext.user.get('ltiInfo');
	    if (_c.appContext.config.provider === 'google'){
		contextID = _c.appUrl.search_params.contextID;
		//userID =  _c.appContext.googleID;
		//permission =  _c.appContext.googlePermission;
	    } else {
                var ltiInfo = _c.appContext.user.get('ltiInfo');
                contextID = ltiInfo.context_id;
            }
            if (!artifactID){
                console.log("Could not report score. artifactID not specified.");
            }
            appServices.submitLMSScore(assignmentID, 100, appUrl.search_params.launch_key, contextID, artifactID);
        }

        function onAssignConcept(assignData) {
            var ltiInfo = _c.appContext.user.get('ltiInfo');
            var lms_name = _c.getLMSName( _c.appContext.config.appID );
            var launch_key = appUrl.search_params.launch_key ? appUrl.search_params.launch_key : _c.appContext.launch_key;
            var options = {};
            var assignementHandle;
            var extraParams, url_params;
            if (_c.appContext.config.provider === "lti"){
                //create assignemnt here
                extraParams = assignData.current_concept.extraParams;
                assignementHandle = assignData.current_concept.handle + '_' + (Number(new Date()));
                options.artifactID = extraParams.artifactID;
                options.assignmentName = assignementHandle;
                options.conceptCollectionHandle = '';
                if(extraParams.collectionHandle){
                    options.contextURL = '/c/' + 
                        extraParams.collectionHandle +
                        '/' + extraParams.conceptCollectionAbsoluteHandle +
                        '/' + extraParams.mtype +
                        '/' + extraParams.handle + '/';
                    options.conceptCollectionHandle = extraParams.conceptCollectionHandle || 
                        extraParams.collectionHandle + '-::-' + extraParams.conceptCollectionAbsoluteHandle;
                    options.collectionCreatorID = extraParams.collectionCreatorID;
                } else if (extraParams.mtype === 'asmtquiz') {
                    options.contextURL = '';
                } else {
                    options.contextURL = '/' + 
                        extraParams.branch +
                        '/' + extraParams.context +
                        '/' + extraParams.mtype +
                        '/' + extraParams.handle + '/';
                }
                var concepts = options.artifactID +
                    '|' +
                    encodeURIComponent(options.contextURL) +
                    '|' +
                    options.conceptCollectionHandle +
                    '|' +
                    (options.collectionCreatorID || '');
                appServices.assign(
                    assignData.current_concept.eid,
                    ltiInfo.context_id,
                    null,
                    assignData.current_concept.title,
                    null,
                    assignementHandle,
                    launch_key,
                    concepts
                ).done(function (assignmentData) {
                    url_params = {
                        assignmentID: assignmentData.response.assignment.assignmentID,
                        lmsgroupID: ltiInfo.context_id
                    };

                    var launchURL = buildLTILaunchURL(url_params);
                    var contentReturnURL = buildLTIContentReturnURL(launchURL, assignData.current_concept.title);
                    console.log('contentReturnURL', contentReturnURL);
                    if (contentReturnURL) {
                        console.log("redirecting to: " + contentReturnURL);
                        window.location = contentReturnURL;
                    } else {
                        showResourceSelectionModal(launchURL.url(), lms_name);
                    }

                }).fail(function () {
                    _c.showMessage("Failed to create assignment. Please try again later.");
                });
            } else {
                if(assignConceptPopup) {
                    assignConceptPopup.undelegateEvents();
                }
                assignConceptPopup = new AssignConceptView({
                    'el': assignData.container,
                    'conceptParams': assignData,
                    'controller': _c
                });
            }
        }
        
        /**
         * Show cover sheet for a concept
         * @param eid (String): EID of concept shown on cover sheet
         * @param ep (String): Exit page. This parameter is passed to the assessment iframe.
         * @param showAssign (Boolean): set this to false to hide assign button on cover sheet
         * @param showClose (Boolean): set this to false to hide close button on cover sheet 
         * @param collectionParams (Object): Optional. Contains collection related params
         * @param lmsConceptID (int): The ID of the concept. Needed for get group calls in assessment
         * @param lmsGroupID (int): The ID of the lms group. This should match lmsProviderGroupID
         */
        function showCoverSheet(eid,ep, showAssign, showClose, collectionParams, options){
            console.log("opening coversheet");
            var ltiContextID, lmsGroupID = '';
            if (_c.appContext.config.provider === "lti") {
                var ltiInfo = _c.appContext.user.get('ltiInfo');
                if (ltiInfo){
                    ltiContextID = ltiInfo.context_id;
                }else{
                    ltiContextID = $.cookie('ck12_ltiContextID');
                }
                if(!ltiContextID){
                    _c.trigger('appError', "Context ID not found");
                }
            }
            coverSheet.initLms({
                    "handle": '',
                    "encodedId": eid,
                    "collectionHandle": collectionParams ? collectionParams.collectionHandle || '' : '',
                    "conceptCollectionAbsoluteHandle": collectionParams ? collectionParams.conceptCollectionAbsoluteHandle || '' : '',
                    "conceptCollectionHandle": collectionParams ? collectionParams.conceptCollectionHandle || '' : '',
                    "collectionCreatorID": collectionParams ? collectionParams.collectionCreatorID || '' : '',
                    "conceptTitle": "",
                    "callback": null,
                    "context": _c.appContext.appName,
                    "ep": ep,
                    "user": _c.appContext.user,
                    "appID": _c.appContext.config.appID,
                    "launch_key": _c.appContext.launch_key || _c.appUrl.search_params.launch_key,
                    "showAssignBtn": !!showAssign,
                    "showCloseBtn": !!showClose,
                    "ltiContextID": ltiContextID,
                    "lmsConceptID" :  (collectionParams && collectionParams.id) ? collectionParams.id : '',
                    "lmsGroupID" :  (options && options.lmsGroupID) ? options.lmsGroupID : ''
                });
        }

        /**
         * Handler for onCoverSheet event
         * @param eid (String): EID for concept to be shown in coversheet 
         * @param collectionParams (Object): Optional. contains collection related params
         */
        function onOpenCoverSheet(eid, collectionParams) {
            showCoverSheet(eid, _c.appUrl.pathname, true, true, collectionParams);
        }
        
        /**
         *  Handler for setURI event
         * @param uri (String) : embed view URL  
         */
        function onSetURI(data){
            var ltiInfo = _c.appContext.user.get('ltiInfo');
            var lms_name = _c.getLMSName( _c.appContext.config.appID );
            var launch_key = appUrl.search_params.launch_key ? appUrl.search_params.launch_key : _c.appContext.launch_key;
            var extraParams, options = {};
            extraParams = data.extraParams;
            options.artifactID = data.artifactID;
            options.conceptCollectionHandle = '';
            if(extraParams.collectionHandle){
                options.contextURL = '/c/' + 
                    extraParams.collectionHandle +
                    '/' + extraParams.conceptCollectionAbsoluteHandle +
                    '/' + extraParams.mtype +
                    '/' + extraParams.handle + '/';
                options.conceptCollectionHandle = extraParams.conceptCollectionHandle || 
                    extraParams.collectionHandle + '-::-' + extraParams.conceptCollectionAbsoluteHandle;
                options.collectionCreatorID = extraParams.collectionCreatorID;
            } else if (extraParams.mtype === 'asmtquiz') {
                options.contextURL = '';
            } else {
                options.contextURL = '/' + 
                    extraParams.branch +
                    '/' + extraParams.context +
                    '/' + extraParams.mtype +
                    '/' + extraParams.handle + '/';
            }
            var concepts = options.artifactID +
                '|' +
                encodeURIComponent(options.contextURL) +
                '|' +
                options.conceptCollectionHandle +
                '|' +
                (options.collectionCreatorID || '');
            appServices.assign(
                    data.artifactID,
                    ltiInfo.context_id,
                    null,
                    data.title,
                    null,
                    '' + Math.round(Math.random()*320000) + '_' + (Number(new Date())),
                    launch_key,
                    concepts
                ).done(function(assignmentData){
                    // Include the ltiInfo.context_id to track origin of assignment 
                    var url_params = {
                        assignmentID: assignmentData.response.assignment.assignmentID,
                        lmsgroupID: ltiInfo.context_id
                    };
                    // If the lms has an issue with long launch urls, we can just use the assignmentID
                    // Add the lms name to assignmentID_launch_url in the config 
                    if (lms_name === "schoology"){
                        url_params.modalityURI = data.uri;
                        url_params.artifactID = data.artifactID;
                    }
		    var launchURL = buildLTILaunchURL(url_params);
		    var contentURI = buildLTIContentReturnURL(launchURL, data.title);
		    if (contentURI){
		        console.log("redirecting to: " + contentURI);
		        window.location = contentURI;
		    }else {
		        showResourceSelectionModal(launchURL.url(),lms_name);
		    }
                }).fail(function(){
                    ModalView.alert("Failed to create assignment");
                });
        }

	function setAppContext(launch_key, provider,appID,appName,lmsgroupID,lmsName,returnURL){
	    var appcontext = {'launch_key': launch_key,
		              'provider': provider,
		              'appID': appID,
		              'appName': appName,
		              'lms_groupID': lmsgroupID,
		              'lms_name': lmsName,
		              'content_return_url': returnURL,
	                      'created': Date.now()};
	    return appcontext;
	};

	function setLTIAppInfo(setLocalStorage){
	    var appcontext = {};
	    if(!_c.context){
                _c.context = _c.appContext;
	    }
	    var ltiInfo = _c.context.user.get('ltiInfo');
	    if (!ltiInfo){
	        ltiInfo = JSON.parse(sessionStorage.get('ltiAppInfo'));
	    } else {
	        appcontext = setAppContext(_c.context.launch_key,
			_c.context.config.provider,
			_c.context.config.appID,
			_c.context.appName,
			ltiInfo.context_id,
			ltiInfo.tool_consumer_info_product_family_code,
			ltiInfo.ext_content_return_url);
	    }
	    if (setLocalStorage){
                appcontext.key = setLocalStorage;
	        $.cookie('ltiAppInfo',JSON.stringify(appcontext),{path: '/', domain: 'ck12.org'});
	    }
	    sessionStorage.setItem('ltiAppInfo', JSON.stringify(appcontext));
	}

	/*
	 * Swith to the new flow
	 */
	function onTryNewFlow(){
	    if(!this.context){
                this.context = this.appContext;
	    }
	    var ltiInfo = this.context.user.get('ltiInfo');
            var appcontext = "";
	    sessionStorage.setItem('app-context','lti-app');
	    sessionStorage.removeItem('lms-assignment');
	    if (!ltiInfo){
	        ltiInfo = JSON.parse(sessionStorage.get('ltiAppInfo'));
	    } else {
	        appcontext = setAppContext(this.context.launch_key,
			this.context.config.provider,
			this.context.config.appID,
			this.context.appName,
			ltiInfo.context_id,
			ltiInfo.tool_consumer_info_product_family_code,
			ltiInfo.ext_content_return_url);
	    }
	    sessionStorage.setItem('ltiAppInfo', JSON.stringify(appcontext));
	    window.location.href = "https://"+window.location.hostname+"/browse/"
	}

        /**
         * Bind events 
         */
        function bindEvents(){
            _c.on('appReady', onAppReady);
            _c.on('appLaunchSuccess', onAppLaunchSuccess);
            _c.on('appAuthSuccess', onAppAuthSuccess);
            _c.on('appLaunchError', onAppLaunchError);
            _c.on('appError', onAppError);
        }
        
        function bindSubViewEvents(){
            activeView.on('openCoverSheet', onOpenCoverSheet);
        }

        /**
         * Bind events on teacher view 
         */
        function bindEventsForTeacherView() {
            activeView.on('assignConcept', onAssignConcept);
            activeView.on('setURI', onSetURI);
	    activeView.on('tryNewFlow', onTryNewFlow);
        }
        

        
        function init(){
            /**
             * Initialize the app 
             */
            var _view = null;
            //Turn this controller into a backbone event bus. Buses are good.
            _.extend(_c, Backbone.Events);
            _c.appContext = appContext;
            _c.appUrl = appUrl;
            bindEvents();
            if(appUrl.search_params.app_mode || (appUrl.path_fragments.length > 1 && appUrl.path_fragments[appUrl.path_fragments.length - 1] === "index-app.html")){ //launch practice app view if app_mode is set to true or index page is index-app.html. 
                launchMobileAppView();
            }else if (appUrl.path_fragments.length > 1){
                //parse the URL
                appContext.appName = appUrl.path_fragments[1];
                appContext.config = Config.getConfig(appContext.appName);
                _c.appServices = appServices = new PracticeAppServices(appContext.config);
                
                if (appUrl.search_params && (appUrl.search_params.assignmentEID || appUrl.search_params.assignmentID)){
                    _c.launchContext = 'coversheet';
                }
                if (appUrl.search_params && appUrl.search_params.testScoreID){
                    _c.launchContext = 'scoresheet';
                }
                
                //show splash screen
                _view = Views.SplashScreenView;
                splashTimeout = new Timers.Timeout(2500).start(); //start the splash screen timeout
                switchView(_view);
                
                //set a dummy cookie
                $.cookie('practiceAppCookie', 'true', {
                    path: '/'
                });
                
                //check if cookie was set successfully
                if(($.cookie('practiceAppCookie') === 'true')) {
                    //App is now ready for action
                    initializeDexter();
                    _c.trigger('appReady');
                } else {
                    _c.trigger('appError', "Oops, looks like third party cookies are disabled on your browser.",null,true);
                }
            }
        }
        
        function launchMobileAppView(){
            /**
             *  Initialization flow for android/iOS app 
             */
            var user = new User(),
                userConfig = null;
            user.fetch().done(function(response){
                if(response){
                    _c.appContext.user = user;
                    appContext.appName = "androidPracticeApp";
                     appContext.config = Config.getConfig(appContext.appName);
                     
                     appContext.config.flx_api_path = window.API_SERVER_URL + appContext.config.flx_api_path;
                     appContext.config.auth_api_path = window.API_SERVER_URL + appContext.config.auth_api_path;
                     
                     if(window.practiceAppHelper && window.practiceAppHelper.localConfig){
                         window.practiceAppHelper.localConfig.user = response;
                         userConfig = window.practiceAppHelper.localConfig.user;
                     }

                     var userImage;
                     if (userConfig.imageURL !== null) {
                        userImage = (userConfig.imageURL.indexOf('http') === 0) ? userConfig.imageURL : window.API_SERVER_URL + userConfig.imageURL;
                     } else { 
                        // Use the default image
                        userImage = './media/practiceapp/images/user_icon_2.png';
                     }
                     
                     if(window.practiceAppHelper && window.practiceAppHelper.initHeader){
                         window.practiceAppHelper.initHeader({
                             "name" : userConfig.firstName + " " + userConfig.lastName,
                             "image" : userImage,
                             "uID" : userConfig.id,
                             "path" : "../..",
                             "backButtonHandler" : function(){
                            	 window.practiceAppHelper.backButtonHandler();
                             },
                             "onLogOut" : function(){
                            	 if(window.practiceAppHelper && window.practiceAppHelper.appLocalStorage){
                            		 window.practiceAppHelper.appLocalStorage.setItem("subject", "");
                            		 window.practiceAppHelper.appLocalStorage.setItem("branch", "");
                            		 window.practiceAppHelper.appLocalStorage.setItem("practiceHandle", "");
                            		 window.practiceAppHelper.appLocalStorage.setItem("searchTerm", "");
                            		 window.practiceAppHelper.appLocalStorage.setItem("walkthrough", "");
                             	 }
                            	 window.location.href = "../../login.html"; 
                             }
                         });
                     }

                     _c.appServices = appServices = new PracticeAppServices(appContext.config);
                     _c.launchPracticeView();
                    } else {
                        window.location.href = "../../login.html";
                    }

            }).fail(function(){
                if(window.practiceAppHelper && window.practiceAppHelper.checkForNetwork){
                    window.practiceAppHelper.checkForNetwork();
                }
                // _c.showMessage("err is " + err);
            });
        }
        
        init();
    }
    
    return PracticeApp;
});
