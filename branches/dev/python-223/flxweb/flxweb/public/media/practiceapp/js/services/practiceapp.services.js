define(['jquery', 'underscore', 'common/utils/utils'], function ($, _, utils) {

    'use strict';

    var _df = utils.deferredFunction, //deferred function utility
        ck12ajax = utils.ck12ajax;

    var PracticeAppServices = function (config) {

        var FLX_API_PREFIX = config.flx_api_path,
            AUTH_API_PREFIX = config.auth_api_path,
            LMS_PROVIDER = config.lms_provider,
            AUTH_APP_NAME = config.auth_app_name,
            FLX_APP_NAME = config.app_name,
            PROVIDER = config.provider;
        
        /**
         * In practice app, there are some APIs which needs to be called silently but got called with other APIs
         * and passing boolean(showLoading/pageDisable) doesn't work. SO calling this on success/error of previous API.
         * */
        function hideLoadingIcon(){
            $("#loading-icon").addClass('hide').removeClass("show");
            $("#page-disable").addClass('hide');
        }

        function cookieExists(cookie_name){
            var haveCookie = false;
            if($.cookie(cookie_name)){
                haveCookie = true;
            }
            return haveCookie;
        }

        /**
         * PracticeAppServices.launchRequest
         *
         * Used to send launch_key provided by edmodo to auth backend for login.
         * @Param
         *  launch_key (String): launchKey provided by edmodo app launch.
         */
        this.launchRequest = _df(function (_d, launch_key) {
            var url = AUTH_API_PREFIX + 'launch/', postData = {};
            if (PROVIDER === 'lti'){
                url += "lti/" + FLX_APP_NAME;
                postData.launch_key = launch_key;
            } else {
                url += LMS_PROVIDER + '/';
                url += AUTH_APP_NAME + '/';
                url += FLX_APP_NAME + '/' + launch_key;
            }
            if ($.cookie(launch_key)){
                console.log('Sending lti Cookie: ' + launch_key);
            }  
            utils.ajax({
                'url': url,
                'data': postData,
                'method': 'POST',
                'isPageDisable': true,
                'isShowLoading': true
            }).done(function (data) {
                console.log( 'lti Cookie exists: ' + cookieExists(launch_key) + ' key:'+launch_key);
                if (data.responseHeader.status!==0 && data.responseHeader.status!==1001){
                    return _d.reject(data);
                 }
                _d.resolve(data);
            }).fail(function (x, s, e) {
                console.log( 'lti Cookie exists: ' + cookieExists(launch_key) + ' key:'+launch_key);
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });

        /**
         * PracticeAppServices.sendUserInfo
         *
         * Used to send edmodo user info to auth after successful sign-in by CK-12 teacher user.
         */
        this.sendUserInfo = _df(function (_d, edmodo_info) {
            var edmodo_info_str = JSON.stringify(edmodo_info);
            utils.ajax({
                'isPageDisable': true,
                'isShowLoading': true,
                'url': AUTH_API_PREFIX + 'create/' + LMS_PROVIDER,
                'data': {
                    'edmodoInfo': edmodo_info_str,
                    'appName': FLX_APP_NAME,
                    'appID': config.appID
                },
                'type': 'POST'
            }).done(function (data) {
                if (!data.message) {
                    _d.resolve(data);
                } else {
                    _d.reject(data);
                }

            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
            });
        });
        });

        /**
         * PracticeAppServices.teacherEmail
         *
         * Use to send first-time teacher user's email address to auth backend for login.
         */
        this.teacherEmail = _df(function (_d, email, edmodo_info) {
            var edmodo_info_str = JSON.stringify(edmodo_info),
                api = AUTH_API_PREFIX + 'login/' + LMS_PROVIDER;

            if (email) {
                api += '/' + email;
            }

            utils.ajax({
                'url': api,
                'isPageDisable': true,
                'isShowLoading': true,
                'data': {
                    'edmodoInfo': edmodo_info_str,
                    'appName': FLX_APP_NAME,
                    'appID': config.appID
                },
                'type': 'POST'
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
            });
        });
        });


        //TODO: PracticeAppServices.login should be moved to common module
        /**
         * PracticeAppServices.login
         *
         * Use to send first-time teacher user's email address to auth backend for login.
         */
        this.login = function (login, token) {
            return ck12ajax({
                url: AUTH_API_PREFIX + 'member/login/ck12',
                data: {
                    'login': login,
                    'token': token,
                    'appName': FLX_APP_NAME,
                    'appID': config.appID
                },
                type: 'POST'
            });
        };

        /**
         * PracticeAppServices.getGroups
         *
         * Fetch LMS groups for logged in user
         *
         * @param
         *  filters:
         *      filters.myRole (filter groups by role [admin|member])
         *      filters.permission (filter groups by sharing permissions (non-class))
         */
        this.getGroups = _df(function (_d, filters) {
            var params = {
                'appName': FLX_APP_NAME,
                'pageSize': 100,
                'appID': config.appID
            };

            if (filters && 'object' === typeof filters) {
                var str_filters = '';
                _(filters).each(function (val, key) {
                    str_filters += key + ',' + val + ';';
                });
                params.filters = str_filters;
            }

            utils.ajax({
                url: FLX_API_PREFIX + 'group/my',
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                cache: false
            }).done(function (data) {
                if (data.response && data.response.message) {
                    _d.reject(data);
                }
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
            });
        });
        });


        /**
         * PracticeAppServices.assign
         *
         * Assign a concept(s) to LMS group
         * @Param
         *  EID_List: array of concept encodedIDs,
         * @param
         *  group_id: ID of group for assignment
         * @Param
         *  Title: assignment title
         * @param
         *  due_date: Due date for assignment
         */
        this.assign = function (EID, ck12_group_id, lms_group_id, title, due_date, assign_handle, launch_key, concepts) {
            var post_data = {
                'appName': FLX_APP_NAME,
                'handle': assign_handle,
                'appID': config.appID,
                'assignmentTitle': title,
                'concepts': concepts
            };
            if (PROVIDER === 'lti'){
                post_data.lmsGroupID = ck12_group_id;
                post_data.launch_key = launch_key;
            } else {
                post_data.groupID = ck12_group_id;
                post_data.lmsGroupID = lms_group_id;
                post_data.due = due_date;
                post_data.assignmentUrl = 'app://?assignmentEID=' + EID;
            }
            return ck12ajax({
                url: FLX_API_PREFIX + 'assign/assignment/' + ck12_group_id,
                data: post_data,
                type: 'POST'
            });
        };

        /**
         * PracticeAppServices.getGroupsForAssignmentEID
         *
         * Return list of groups which have an assigned assessment for provided EID
         * @Param
         *  assignment_eid: Concept EID
         *
         */
        this.getGroupsForAssignmentEID = _df(function (_d, assignment_eid) {
            var api_url = FLX_API_PREFIX + 'get/my/' + assignment_eid + '/groups';
            utils.ajax({
                'url': api_url,
                'data': {
                    'appName': FLX_APP_NAME,
                    'appID': config.appID
                },
                'isPageDisable': true,
                'isShowLoading': true,
                'cache': false
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
            });
        });
        });


        /**
         * PracticeAppServices.getAssignments
         *
         * Fetch all assignments assigned to a logged in user
         * @Param
         *  params: API params
         *    params.filters: assessment filters
         *    params.pageSize: page size used for response pagination
         *    params.pageNum: page number used for pagination
         *
         */
        this.getAssignments = _df(function (_d, params) {
            var api = FLX_API_PREFIX + 'get/my/assignments';
            utils.ajax({
                url: api,
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                cache: false
            }).done(function (data) {
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
            });
        });
        });

        /**
         * PracticeAppServices.getAssignmentsForGroup
         */

        this.getAssignmentsForGroup = function (group_id, params) {
            params = $.extend({
                'appName': FLX_APP_NAME,
                'appID': config.appID
            }, params);
            var api = FLX_API_PREFIX + 'get/group/member/assignments/' + group_id;
            return ck12ajax({
                url: api,
                data: params,
                cache: false
            });
        };

        this.getConceptsWithPoints = _df(function (_d, eid) {
            var API_SERVER_URL = window.API_SERVER_URL || "";
            var api = API_SERVER_URL + '/assessment/api/get/tests/unit/' + eid;
            var localCache = false;
            if(window.isApp && window.isApp()){
                var eid_parts = eid.split('.');
                localCache = {'namespace':'ck12data','key':eid+'_descendants','region':eid_parts[0]+'.'+eid_parts[1]};
            }
            utils.ajax({
                'url': api,
                'isPageDisable': true,
                'isShowLoading': true,
                'dataType': 'json',
                'localCache':localCache
            }).done(function (data) {
            	hideLoadingIcon();
                if (data.responseHeader.status === 0) {
                    _d.resolve(data.response);
                }
            }).fail(function (x, s, e) {
            	hideLoadingIcon();
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });

        this.getTestScoresByEids = _df(function (_d, eid) {
            var API_SERVER_URL = window.API_SERVER_URL || "";
            var api = API_SERVER_URL + '/assessment/api/get/info/testScores/concepts/my?encodedIDs=' + eid + '&includeLatest=false&includeHighest=true&includeLowest=false';
            utils.ajax({
                'url': api,
                'isPageDisable': true,
                'isShowLoading': true,
                'dataType': 'json'
            }).done(function (data) {
                if (data.responseHeader.status === 0) {
                    _d.resolve(data.response);
                }
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });
        
        this.getPAndAByEids = _df(function (_d, eid) {
            var API_SERVER_URL = window.API_SERVER_URL || "";
            var api = API_SERVER_URL + '/assessment/api/get/info/pointsAndAwards/concepts/my?eids=' + eid;
            utils.ajax({
                'url': api,
                'isPageDisable': false,
                'isShowLoading': false,
                'dataType': 'json'
            }).done(function (data) {
                if (data.responseHeader.status === 0) {
                    _d.resolve(data.response);
                }
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
            });
        });
        });
        
        this.getAdaptivePracticeInfo = _df(function (_d, eid) {
            var API_SERVER_URL = window.API_SERVER_URL || "";
            // var api = API_SERVER_URL + "/assessment/api/get/detail/test/practice/encodedid/" + eid + "?adaptive=true&skipILOQuestions=True";
            /*var api = API_SERVER_URL + "/assessment/api/get/info/test/practice/encodedid/" + eid + "?adaptive=true";*/
            var api = API_SERVER_URL + "/assessment/api/get/detail/test/practice/encodedid/" + eid + "?adaptive=true&skipILOQuestions=True";
            utils.ajax({
                'url': api,
                'isPageDisable': true,
                'isShowLoading': true,
                'dataType': 'json'
            }).done(function (data) {
                if (data.responseHeader.status === 0) {
                    _d.resolve(data.response);
                }
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
            });
        });
        });
        
        this.getQuizInfo = _df(function (_d, id) {
            var API_SERVER_URL = window.API_SERVER_URL || "";
            var api = API_SERVER_URL + "/assessment/api/get/info/test/" + id;
            utils.ajax({
                'url': api,
                'isPageDisable': true,
                'isShowLoading': true,
                'dataType': 'json'
            }).done(function (data) {
                if (data.responseHeader.status === 0) {
                    _d.resolve(data.response);
            }
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });
        
        this.getQuizzes = _df(function (_d, artifactID) {
            var API_SERVER_URL = window.API_SERVER_URL || "";
            var params = {
                'ownedByMe': true,
                'pageNum' : 1,
                'pageSize': 100
            };

            if (artifactID){
                params.filters = "artifactID," + artifactID;
            }

            utils.ajax({
                url: API_SERVER_URL + '/assessment/api/browse/info/tests',
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                cache: false
            }).done(function (data) {
                if (data.response && data.response.message) {
                    _d.reject();
                }
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });

        this.createQuiz = _df(function(_d, settings){
            var API_SERVER_URL = window.API_SERVER_URL || "";
            utils.ajax({
                url: API_SERVER_URL + '/assessment/api/create/test',
                data: settings,
                type : "POST",
                isPageDisable: true,
                isShowLoading: true,
                cache: false
            }).done(function (data) {
                if (data.responseHeader.status === 0) {
                    _d.resolve(data.response);
                }else{
                    _d.reject(data.response);
                }
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });
         
        this.searchLms = function(settings){
            var params = {},
                API_SERVER_URL = window.API_SERVER_URL || "",
                artifactType = settings.artifactType || "domain,asmtquiz";
            
            params.pageSize = settings.pageSize || 10;
            params.pageNum = settings.pageNum || 1;
            params.ck12only = settings.ck12only || false;
	    params.excludeSubjects = settings.excludeSubjects || "english";
            var localcache = false;
            if( (window.isApp && window.isApp()) || (typeof(assessment_configs) !== "undefined" && window.assessment_configs.isApp()) ){
                localcache = {
                    region:"daily", namespace:"user",
                    validatedata:function(dat){
                        try{return (dat.responseHeader.status === 0);}
                        catch(e){
                            console.log(e);
                            return false;
                        }
                    }
                };
            }
            utils.ajax({
                url: API_SERVER_URL + "/flx/search/direct/modality/minimal/" + artifactType + "/" + settings.value,
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                localCache:localcache,
		useCDN: true,
		cdnExpirationAge: 'quarter-hourly',
		cdnCacheUserInfo: !params.ck12only,
                success: function (result) {
                	hideLoadingIcon();
                    if (settings.callback) {
                        settings.callback(result);
                    }
                },
                error: function () {
                	hideLoadingIcon();
                    if (settings.callback) {
                        settings.callback('error');
                    }
                }
            });
        };
        
        this.searchHints = _df(function(_d, settings){
            var API_SERVER_URL = window.API_SERVER_URL || "",
                artifactType = settings.artifactType || "domain";
            var localcache = false;
            if(((window.isApp && window.isApp()) || (typeof(assessment_configs) !== "undefined" && window.assessment_configs.isApp()))){
                localcache = {
                    region:"daily",
                    namespace:"user",
                    validatedata:function(dat){
                        try{return (dat.responseHeader.status === 0);}
                        catch(e){
                            console.log(e);
                            return false;
                        }
                    }
                };
            }
            settings.data.excludeSubjects = settings.data.excludeSubjects ? settings.data.excludeSubjects : 'technology,engineering,english';
        	utils.ajax({
                url: API_SERVER_URL + '/flx/search/hints/' + artifactType + '/title/' + settings.term,
                data: settings.data,
                type : "GET",
                isPageDisable: false,
                isShowLoading: false,
                cache: !localcache,
                localCache: localcache,
		useCDN: true,
		cdnExpirationAge: 'daily',
            }).done(function (data) {
                _d.resolve(data.response);
            }).fail(function () {
                _d.resolve();
            });
        });
        
        this.getAllBranches = function () {
            if (window.practiceAppBranches) {
                return window.practiceAppBranches;
            }
        };

        this.submitLMSScore = _df(function( _d, assignmentID, score, launch_key, context_id, artifactID){
            var api = FLX_API_PREFIX + 'update/my/' + config.appID + "/assignment/status";
            var postData = {
                assignmentID: assignmentID,
                score: score,
                artifactID: artifactID,
                nonPractice: true
            };
            if (PROVIDER === 'lti' || PROVIDER ==='google'){
                postData.launchKey = launch_key;
                postData.contextID = context_id;
            }
            utils.ajax({
                url: api,
                data : postData,
                type: "POST"
            }).done(function(data){
                _d.resolve(data);
            }).fail(function(){
                _d.reject();
            });
        });

        this.addMemberToGroup = _df(function (_d, assignment_eid,contextID,providerMemberID, launch_key, assignmentID, permission) {
            var api_url = FLX_API_PREFIX + 'group/add/member/' + config.appID;
            utils.ajax({
                'url': api_url,
                'data': {
                    'appName': FLX_APP_NAME,
                    'contextID': contextID,
                    'providerMemberID': providerMemberID,
                    'assignmentEID': assignment_eid || null,
                    'assignmentID': assignmentID || null,
                    'launch_key': launch_key,
		    'permission': permission
                },
                type: "POST"
            }).done(function (data) {
                console.log(data.response);
                 if( data.responseHeader.status!==0){
                     return _d.reject(data);
                 }
                _d.resolve(data);
            }).fail(function (x, s, e) {
                _d.reject({
                    'xhr': x,
                    'status': s,
                    'error': e
                });
            });
        });

     /**
     * PartnerAppServices.getAssignment
     *
     * Get assignemnt by assignmentID for a logged in user
     * @param assignmentID (int) : the ID of the assignment
     *
     */
     this.getAssignment = _df(function (_d, assignmentID) {
	 var api = FLX_API_PREFIX + 'get/assignment/'+ assignmentID;
	 utils.ajax({
	     url: api,
	     isPageDisable: true,
	     isShowLoading: true,
	     cache: false
	 }).done(function (data) {
	     if( data.responseHeader.status!==0){
		 return _d.reject(data);
	     }
	     data.response.assignment.concept = data.response.assignment.concepts[0];
	     _d.resolve(data.response.assignment);
	 }).fail(function (x, s, e) {
	     _d.reject({
		'xhr': x,
		'status': s,
		'error': e
	     });
	 });
     });


     /**
     * PartnerAppServices.getMinimalModalities
     *
     * Get minial modalities from encodedID
     * @param encodedID (string) : the encodedID of the concept
     *
     */
     this.getMinimalModalities = _df(function (_d, encodedID, conceptData) {
     var api = FLX_API_PREFIX + 'get/minimal/modalities/'+ encodedID +'?pageSize=1&termOnly=true';
     var data = {};
     if (conceptData.conceptCollectionHandle && conceptData.collectionCreatorID) {
        data.conceptCollectionHandle = conceptData.conceptCollectionHandle;
        data.collectionCreatorID = conceptData.collectionCreatorID;
     }
	 utils.ajax({
         url: api,
         data: data,
	     cache: false
	 }).done(function (data) {
	     if( data.responseHeader.status!==0 && data.responseHeader.status !== 2063){
		 return _d.reject(data);
	     }
	     _d.resolve(data.response);
	 }).fail(function (x, s, e) {
	     _d.reject({
		'xhr': x,
		'status': s,
		'error': e
	     });
	 });
     });

     /**
     * PartnerAppServices.getLtiInfo
     *
     * Get ltiInfo by launch key for a logged in user
     * @param launch_key (int) : the ID of the assignment
     *
     */
     this.getLTIInfo = _df(function (_d, launch_key){
	 var api = AUTH_API_PREFIX + 'get/info/lti';
	 utils.ajax({
	     url: api,
	     data: {'launch_key': launch_key},
	     cache: false
	 }).done(function (data) {
	     if( data.responseHeader.status!==0){
		 return _d.reject(data);
	     }
	     _d.resolve(data.response);
	 }).fail(function (x, s, e) {
	     _d.reject({
		'xhr': x,
		'status': s,
		'error': e
	     });
	 });
     });

     /**
     * PracticeAppServices.getGoogleClassroomAuthStatus
     *
     * Get ltiInfo by launch key for a logged in user
     * @param launch_key (int) : the ID of the assignment
     *
     */
     this.getGoogleClassroomAuthStatus = _df(function (_d){
	 var api = FLX_API_PREFIX + 'get/status/googleclassroom/auth';
	 utils.ajax({
	     url: api,
	     data: {'role':'student'},
	     cache: false
	 }).done(function (data) {
	     if( data.responseHeader.status!==0){
		 return _d.reject(data);
	     }
	     _d.resolve(data.response);
	 }).fail(function (x, s, e) {
	     _d.reject({
		'xhr': x,
		'status': s,
		'error': e
	     });
	 });
     });

     /**
     * PracticeAppServices.getGoogleClassroomAuthStatus
     *
     * Get ltiInfo by launch key for a logged in user
     * @param launch_key (int) : the ID of the assignment
     *
     */
     this.getGoogleAuthURL = _df(function (_d){
         var api = FLX_API_PREFIX + 'get/authURL/googleclassroom';
	 utils.ajax({
         url: api,
         data: {'role': 'student'}, 
	     cache: false
	 }).done(function (data) {
	     if( data.responseHeader.status!==0){
		 return _d.reject(data);
	     }
	     _d.resolve(data.response);
	 }).fail(function (x, s, e) {
	     _d.reject({
		'xhr': x,
		'status': s,
		'error': e
	     });
	 });
     });
    };
    return PracticeAppServices;
});
