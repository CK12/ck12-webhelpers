define(
    ["jquery"],
    function($) {

        var assessmentAPI = {
            previewQuestion         : webroot_url + "/assessment/ui/#question/preview/",
            getQuestionInstanceInfo : webroot_url + "/assessment/api/get/info/questionInstance/",
            getQuestionInfo         : webroot_url + "/assessment/api/get/info/question/"
        };

        var groupsURL = {
            'createGroup': webroot_url + 'flx/create/group',
            'myGroups': webroot_url + 'flx/group/my',
            'groupActivity': webroot_url + 'flx/group/activity',
            'groupImages': webroot_url + 'flx/get/info/resources/group%20system%20image',
            'groupMembers': webroot_url + 'flx/group/members',
            'joinGroup': webroot_url + 'flx/group/add/member',
            'groupInfo': webroot_url + 'flx/group/info',
            'updateGroup': webroot_url + 'flx/update/group',
            'deleteGroup': webroot_url + 'flx/delete/group',
            'removeMember': webroot_url + 'flx/group/delete/member',
            'updateNotifications': webroot_url + 'flx/set/member/notifications',
            'getNotifications': webroot_url + 'flx/get/member/notifications',
            'getAssignmentsForLeader': webroot_url + 'flx/get/my/group/assignments/',
            'getAssignmentsForMember': webroot_url + 'flx/get/group/member/assignments/',
            'getSubjects': webroot_url + 'taxonomy/get/info/branches/',
            'getDescendants': webroot_url + 'flx/get/info/browseTerm/descendants/',
            'getModalityCount': webroot_url + 'flx/featured-modal-type-counts/',
            'getModalities': webroot_url + 'flx/browse/modality/artifact/',
            'createAssignment': webroot_url + 'flx/create/assignment',
            'assignAssignment': webroot_url + 'flx/assign/assignment/',
            'unAssignAssignment': webroot_url + 'flx/unassign/assignment/',
            'updateAssignment': webroot_url + 'flx/update/assignment/',
            'search': webroot_url + 'flx/search/modality/minimal/domain/',
            'getGroupAssignmentReport': webroot_url + 'flx/get/group/assignments/report/'
        };

        // How do i hook this up with utils!?
        var util = {};
        util.ajax = function (options) {
            var deferred, success_callback, error_callback, loadingElement;

            loadingElement = options.loadingElement || '#loading-icon';
            if (options) {
                if (options.success) {
                    success_callback = options.success;
                    options.success = null;
                }
                if (options.error) {
                    error_callback = options.error;
                    options.error = null;
                }
                if (!options.dataType) {
                    options.dataType = 'json'; //default to json response
                }
            }
            deferred = $.Deferred();
            options.success = function (data, status, jqXHR) {
                //TODO: some processing, check for error codes etc...
                //if everything looks good, resolve the deferred object
                //otherwise, reject the deferred with appropriate error
                if (success_callback) {
                    success_callback(data, status, jqXHR);
                }
                deferred.resolve(data);
            };
            options.error = function (jqXHR, status, error) {
                //TODO: in case of error, reject the deferred with
                //appropriate error object.
                if (error_callback) {
                    error_callback(jqXHR, status, error);
                }
                deferred.reject({
                    'error': error
                });
            };
            $.ajax(options);
            return deferred.promise();
        };




        function getGroups(callback, container, groups) {
            groups = groups || {};
            groups.activity = true;
            groups.newAssignmentCheck = true;
            util.ajax({
                url: groupsURL.myGroups,
                data: groups,
                success: function (result, status, jqXHR) {
                    var currentTime = jqXHR.getResponseHeader("Date");
                    if (callback) {
                        callback(result, currentTime, container);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error', container);
                    }
                }
            });
        }

        function getGroupInfo(callback, groups) {
            util.ajax({
                url: groupsURL.groupInfo,
                data: groups,
                success: function (result) {
                    if (callback) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }



        function alextest(contextType, contextID) {
            //if (!window.ae) throw new Error("ae unavailable");
            if (!contextType || !contextType.toLowerCase) {
                throw new Error("bad contextType");
            }
            function getGroupURL(cid) {
                var myGroups = getGroups(function(){console.log(arguments);});
            }

            function getQuestionURL(cid) {

            }

            function getQuestionInstanceURL(cid) {

            }

            var url = "";
            switch (contextType.toLowerCase()) {
                case "group":
                    url = getGroupURL(contextID);
                break;
                case "question":
                    url = getQuestionURL(contextID);
                break;
                case "questioninstance":
                    url = getQuestionInstanceURL(contextID);
                break;
                default:
                    throw new Error("unhandled contextType");
            }
            var questionData = null;
            if (window.ae) {
                var testData = ae.controllers.tv.getTestData();
                questionData = {
                    questionID          : testData.questionID,
                    questionInstanceID  : testData.questionInstanceID,
                    contextEID          : testData.contextEID,
                    testID              : testData.testID
                };
            }

            return ({
                questionData:questionData
            });
        }

        return ({
            getContextURL: function(contextType, contextID) {
                //if (!window.ae) throw new Error("ae unavailable");
                if (!contextType || !contextType.toLowerCase) {
                    throw new Error("bad contextType");
                }
                function getGroupURL(cid) {

                }

                function getQuestionURL(cid) {

                }

                function getQuestionInstanceURL(cid) {

                }

                var url = "";
                switch (contextType.toLowerCase()) {
                    case "group":
                        url = getGroupURL(contextID);
                    break;
                    case "question":
                        url = getQuestionURL(contextID);
                    break;
                    case "questioninstance":
                        url = getQuestionInstanceURL(contextID);
                    break;
                    default:
                        throw new Error("unhandled contextType");
                }

                var testData = ae.controllers.tv.getTestData();
                var questionData = {
                    questionID          : testData.questionID,
                    questionInstanceID  : testData.questionInstanceID,
                    contextEID          : testData.contextEID,
                    testID              : testData.testID
                };

                return ({
                    questionData:questionData
                });

            }
        });
    }
);
