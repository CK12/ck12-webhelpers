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
    'common/utils/utils',
    'practiceapp/services/practiceapp.services',
    'practiceapp/services/partner.services',
    'practiceapp/config/config',
    'common/views/modal.view'
],
function(jqueryUI, $, _, Backbone, Views, URLHelper, User, Timers, Utils, PracticeAppServices, PartnerServices, Config, ModalView){
    /**
     * Main controller for partner integrations. 
     */
    'use strict';
    var config = {
        'flx_api_path' : '/flx/',
        'auth_api_path': '/auth/',
        'splash_img' : 'logo_tagline.svg'
    };

    // Deferred function utility
    //var _df = Utils.deferredFunction;

    /**
     * Initialize Dexter for analytics
     */
    function initializeDexter(_appName, _provider){
        var dexterjs = window.dexterjs({
            memberID: null,
            clientID: 24839961,
            mixins: {
                appID: _appName
            }
        });
    }

    function showMessage(msg){
        /**
         *  Show a modal popup message
         *  @param msg (String) : Message text
         */
        return ModalView.alert(msg);
    }

    // Create test sheet url using Url Helper
    // takes url prefix and object of query params
    function getTestSheetURL(prefix){
        var testSheetUrl = new URLHelper(prefix);

        return testSheetUrl.url();
    }

    // Create embed url using Url Helper
    // takes url prefix and object of query params
    function getEmbedURL(prefix, paramsObj){
        var embedUrl = new URLHelper(prefix);
        embedUrl.updateHashParams(paramsObj);

        return embedUrl.url();
    }

    function PartnerApp(){
        var _c = this,          //reference to self
            appUrl = new URLHelper(), //app URL
            appContext = {},    //Application context to be shared across views
            partnerServices = null,
            activeView = null;   //Currently active view
            _c.availableModes = ['ASSIGNMENT', 'ASSIGNMENT_PROGRESS'];
            _c.availableEmbedTypes = ['lesson','lecture','enrichment','rwa','plix','simulationint'];
            _c.assignmentTypes = {'domain': 'practice', 'asmtquiz':'quiz', 'asmtpractice': 'practice'};
            appContext.config = config;
            _c.embedUrlPrefix = "/embed/#module=modality&view_mode=embed&nochrome=true&app_context=parnter_app";
            _c.studentTestSheetUrlPrefix = "/assessment/ui/?test/detail"; 
            _c.studentTestSheetUrlSuffix = "&coversheet=true&isPageView=true&context=partnerApp"; 
            _c.teacherReportUrlPrefix = "/assessment/ui/?test/detail"; 
            _c.teacherReportUrlSuffix = "&context=partnerApp"; 
            
        /**
         * Bind events 
         */
        function bindEvents(that){
            that.on('appAuthSuccess', onAppAuthSuccess);
        }
       
        // TODO: Make the verifyAssignment resolve an object
        // and move the redirect here 
        function onAppAuthSuccess(user){
            // Fetch the assignment and pass the assignment to get verified
            _c.appContext.user = user;
            var assignment = _c.fetchAssignment(_c.assignmentID,'assignment');
            assignment.done(function(assignmentObj){
                // Make it resolve an object to prevent redirect while testing
                _c.verifyAssignment(_c.appContext.user.is_student(), assignmentObj, _c.appMode, _c.assignmentTypes);
                // do redirect here
            });

            assignment.fail(function(message){
                showMessage(message);
            });
        }

        function init(){
            /**
             * Initialize the app 
             */
            var _view = Views.SplashScreenView;
            //Turn this controller into a backbone event bus. Buses are good.
            _.extend(_c, Backbone.Events);
            _c.appContext = appContext;
            //show splash screen
            _c.switchView(_view);
            _c.appUrl = appUrl;
            bindEvents(_c);
            _c.partnerServices = partnerServices = new PartnerServices(appContext.config);

             // Move to a function that takes the url and build the parameters
             // Will return an object with the expected params
            var params = PartnerApp.getURLParams(['mode','partnerStudentID','partnerAppName', 'assignmentID','partnerMemberID']);
            _c.appMode = params.mode;
            _c.partnerStudentID = params.partnerStudentID;
            _c.partnerAppName = params.partnerAppName;
            _c.assignmentID = params.assignmentID;
            _c.partnerMemberID = params.partnerMemberID;
 
            if (!_c.isModeSupported(_c.appMode)){
                showMessage("Mode "+ _c.appMode + " is not supported");
            }else if (!_c.assignmentID){
                showMessage("Assignment not found.");
            }else{
                _c.verifyUserLoggedIn();
                //initializeDexter();
                console.log("Finished initializing");
            }
        }
        
        init();
    }

    // 1. Fetch Assignment return assignment object && status
    //   -- pass assignmentID and valid [assignment types]
    //    -- return assignment object or message if failure
    PartnerApp.prototype.fetchAssignment = function( assignmentID, type){
        var df = $.Deferred();

        this.partnerServices.getAssignment(assignmentID).done(function(assignment){
            var assignmentObj = assignment;
               
            if (assignmentObj && assignmentObj.type!==type){
                    console.log("This is not an assignment.");
                    df.reject("Not a valid assignment");
            }
            assignmentObj.concept = assignmentObj.concepts[0];
            df.resolve(assignmentObj);
        }).fail(function(response){
            var message = "We are unable to process assignment of id: "+ assignmentID +" please try again later.";
            if (response.response && response.response.message){
                message = response.response.message;
            }
            df.reject(message);
       });
       return df.promise();
    };

    PartnerApp.prototype.getGroupMembers = function( groupID, partnerAppName, partnerStudentID){
        var df = $.Deferred();

        var filters = { providerMemberID : partnerStudentID};

        this.partnerServices.getGroupMembers(groupID, partnerAppName, filters).done(function(members){
            console.log(members);
            df.resolve(members);
        });
        return df.promise();
    };

    /**
     * For Assignments
     * - verify assignment exists
     * - assignment is assigned to at least one of student's groups
     */ 
    PartnerApp.prototype.verifyAssignment = function(is_student,assignmentObj, mode, assignmentTypes){
         // 2. Check if assginment is for embedd
         // 3. Check if it is student practice or quiz
         // 4. Check if it is for teacher
        var that = this;
         
        var showEmbed = this.isEmbeddable(assignmentObj.concept.type);
        if ( showEmbed ){
            console.log("We need to show embed view");
            var url = this.buildEmbedUrl(assignmentObj.concept);
            this.launchPlayView(url);
            if (is_student){
                var assignmentID = assignmentObj.assignmentID;
                var artifactID = assignmentObj.concept.id;
                this.submitModalityScore(assignmentID, artifactID);
            }
        } else {
            if(is_student){
                var assignmentUrl = this.getAssignmentUrl('student',assignmentTypes[assignmentObj.concept.type],assignmentObj);
                window.location.href = assignmentUrl;
            } else {

                // Teachers cannot attend assignment only view reports
                if (mode !== "ASSIGNMENT_PROGRESS"){
                    showMessage("Teachers can only access reports. Please change mode parameter.");
                }
                else if (!this.partnerStudentID){
                    showMessage("Student member ID parameter is required to review a report.");
                } else {
                    // Verify student is in group and get the student ID
                    this.getGroupMembers(assignmentObj.groupID, this.partnerAppName, this.partnerStudentID).then(function(members){

                        var member = members ? members[0] : null;
                        if ( members[0].providerMemberID === that.partnerStudentID ){
                            assignmentObj.studentID = member.id;
                            var reportUrl = that.getAssignmentUrl('teacher',assignmentTypes[assignmentObj.concept.type],assignmentObj);
                            window.location.href = reportUrl;
                        } else {
                            showMessage("Student is not a member of this group.");
                        }
                    }).fail(function(){
                        console.log('failed');
                    });
                }
            }
        }
    };

   /**
    * Make sure the user is logged in
    *   If logged in will set the user
    */ 
    PartnerApp.prototype.verifyUserLoggedIn = function(){
        var that = this;
        /*var user = new User().fetch(); //returns a promise

          user.done(function(){
              // Add some checking here
        });*/
        // make call to /auth/get/info/my
        this.partnerServices.getMyInfo().done(function(data){
            var user = new User(data.response);
            console.log("User fetched");
            that.trigger("appAuthSuccess", user);
        }).fail(function(){
            showMessage("Authentication failed. Please try launching the app again from " + that.partnerAppName);
        });
    };

    /**
     * Make sure we allow this type of assignment for embed view
     *   List of supported types in availableEmbedTypes
     */ 
    PartnerApp.prototype.isEmbeddable = function(type){
        return  this.availableEmbedTypes.indexOf(type) !== -1;
    };

    /* Modality embed
     * - handle = modality_handle
     * - mtype = modality_type
     * - context = concept_handle
     * - realm = modality_realm
     * - branch = branch_handle
     * - filters = branch_handle
     * - nochrome = branch_handle
     * - display_style
    */ 
    PartnerApp.prototype.buildEmbedUrl = function(assignmentInfo){
        var type = assignmentInfo.type,
            url_params = {mtype: type };

        if (type === 'lesson'){
            url_params.handle = assignmentInfo.handle;
            url_params.branch = assignmentInfo.branchHandle;

        } else { // 'lecture','enrichment','rwa','plix','simulationint'
            url_params.handle = assignmentInfo.handle;
            url_params.context = assignmentInfo.domains[0].handle;
            url_params.branch = assignmentInfo.domains[0].branchInfo.handle;
        } 

        return getEmbedURL(this.embedUrlPrefix, url_params);
    };

    /**
     * Make sure the mode is supported
     *   List of supported modes in availableModes
     */ 
    PartnerApp.prototype.isModeSupported = function(mode){
        var supported = null;
        if (!mode){
            supported = false;
        } else {
            supported = this.availableModes.indexOf(mode) !== -1;
        }
        return supported;
    };

    PartnerApp.prototype.getAssignmentUrl = function(context,type,assignmentInfo) {
        var urlPrefix = "";
	// Removing query params for SEO friendly url changes in story #136373817
	// Bug #54094
        /*var queryParams = { 
	    'type': type,
            'handle': assignmentInfo.concepts[0].handle,
            'assignmentId': assignmentInfo.id
        };*/

        if (context === 'student'){
            urlPrefix = this.studentTestSheetUrlPrefix + '/' + type +"/"+assignmentInfo.concepts[0].handle + this.studentTestSheetUrlSuffix;
        } else if (context === 'teacher'){ 
              urlPrefix = this.teacherReportUrlPrefix + '/' + type +"/"+assignmentInfo.concepts[0].handle + this.teacherReportUrlSuffix;
	      urlPrefix +="&studentID="+assignmentInfo.studentID+"&groupID="+assignmentInfo.groupID;
              //queryParams.studentID = assignmentInfo.studentID;
              //queryParams.groupID = assignmentInfo.groupID;
        }
            
        if (type === 'quiz'){
	    urlPrefix += "&ownerID="+assignmentInfo.concepts[0].creatorID;
            //queryParams.ownerID = assignmentInfo.concepts[0].creatorID;
        }

        // Make sure ep is added at the end
	urlPrefix += "&ep=none";
        //queryParams.ep = 'none';

        return getTestSheetURL(urlPrefix);
    };

    PartnerApp.prototype.submitModalityScore = function(assignmentID, artifactID){
        if (!artifactID){
            console.log("Could not report score. artifactID not specified.");
        }
        this.partnerServices.submitModalityScore(assignmentID, 100, artifactID);
    };

    PartnerApp.prototype.launchPlayView = function(uri){
        /**
         * Used to launch play view (Embedded modality view) 
         */
        this.switchView(Views.PlayView, {URI:uri});
    };

    PartnerApp.prototype.switchView = function(View, options){
        var that = this;
        if (this.activeView && 'function' === typeof this.activeView.destroy){
            this.activeView.destroy();
        }
        this.activeView = new View($.extend(true, {
            'el': $("#partnerapp_container"),
            'controller': that
        }, options));
    };

    // This will parse the url params and add them to the matching keys of the object
    PartnerApp.getURLParams = function (param_list) {
        var appUrl = new URLHelper();
        var object = {};
        _.each(param_list, function (k){ 
            object[k] = appUrl.search_params[k] || null;
        });         
   
        console.dir(object); 
        return object;
   }; 
    
    return PartnerApp;
});
