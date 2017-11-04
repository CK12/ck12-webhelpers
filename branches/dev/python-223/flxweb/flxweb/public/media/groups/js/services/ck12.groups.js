define(['jquery','common/utils/utils'], function ($, util) {
    'use strict';

    function groupService() {
        var groupsURL = {
            'createGroup': util.getApiUrl('flx/create/group'),
            'getGroups': util.getApiUrl('flx/group/my'),
            'groupActivity': util.getApiUrl('flx/group/activity'),
            'groupImages': util.getApiUrl('flx/get/info/resources/group%20system%20image'),
            'groupMembers': util.getApiUrl('flx/group/members'),
            'joinGroup': util.getApiUrl('flx/group/add/member'),
            'groupInfo': util.getApiUrl('flx/group/info'),
            'updateGroup': util.getApiUrl('flx/update/group'),
            'deleteGroup': util.getApiUrl('flx/delete/group'),
            'removeMember': util.getApiUrl('flx/group/delete/member'),
            'updateNotifications': util.getApiUrl('flx/set/member/notifications'),
            'getNotifications': util.getApiUrl('flx/get/member/notifications'),
            'getAssignmentsForLeader': util.getApiUrl('flx/get/my/group/assignments/'),
            'getAssignmentsForMember': util.getApiUrl('flx/get/group/member/assignments/'),
            'getSubjects': util.getApiUrl('taxonomy/get/info/branches/'),
            'getDescendants': util.getApiUrl('flx/get/info/browseTerm/descendants/'),
            'getCollection': util.getApiUrl('taxonomy/collection/'),
            'getModalitiesCount': util.getApiUrl('flx/featured-modal-type-counts/'),
            'getModalities': util.getApiUrl('flx/browse/modality/artifact/'),
            'createAssignment': util.getApiUrl('flx/create/assignment'),
            'assignAssignment': util.getApiUrl('flx/assign/assignment/'),
            'unAssignAssignment': util.getApiUrl('flx/unassign/assignment/'),
            'updateAssignment': util.getApiUrl('flx/update/assignment/'),
            'countStudyTrack': util.getApiUrl('flx/count/my/studytracks'),
            'search': util.getApiUrl('flx/search/modality/minimal/domain/'),
            'unshare': util.getApiUrl('flx/group/unshare/'),
            'getGroupAssignmentReport': util.getApiUrl('flx/get/group/assignments/report/'),
            'leaderAssignmentDetails': util.getApiUrl('flx/get/assignment/'),
            'deleteAllAssignment': util.getApiUrl('flx/delete/all/assignments/'),
            'resendVerficationEmail': util.getApiUrl('auth/verify/email'),
            'myQuizes': util.getApiUrl('flx/get/mylib/info/asmtquiz'),
            'updateQAsettings': util.getApiUrl('flx/group/set/qastatus'),
            'updateMember': util.getApiUrl('auth/update/member', true),
            'syncMember': util.getApiUrl('flx/sync/member'),
            'getMyStudents': util.getApiUrl('flx/get/my/students'),
            'getPracticeInfo':util.getApiUrl('assessment/api/get/info/test/practice/encodedid/'),
            'getAssignmentReccomendation': util.getApiUrl('flx/get/recommendations/assignment/concept')
        };

        function getAssignmentReccomendation(callback, data) {
            data = data || {};
            var update = (typeof data.update !== 'undefined') ? data.update : false;
            util.ajax({
                url: groupsURL.getAssignmentReccomendation,
                isPageDisable: true,
                isShowLoading: true,
                method: 'POST',
                data: data,
                success: function (result) {
                    if (callback) {
                        callback(result, update);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }

        function getMyQuizes(callback, data) {
            var params = {};
            data = data || {};
            params.ownership = data.ownership || 'owned';
            params.pageSize = data.pageSize || 100;
            params.sort = data.sort || 'added,desc';
            util.ajax({
                url: groupsURL.myQuizes,
                isPageDisable: true,
                isShowLoading: true,
                data: params,
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

        function createGroup(callback, groups) {
            util.ajax({
                url: groupsURL.createGroup,
                data: groups,
                method: 'POST',
                isPageDisable: true,
                isShowLoading: true,
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

        function getGroups(callback, container, groups) {
            groups = groups || {};
            groups.activity = true;
            groups.newAssignmentCheck = true;
            util.ajax({
                url: groupsURL.getGroups,
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result, status, jqXHR) {
                    if (callback) {
                        callback(result, jqXHR.getResponseHeader('Date'), container);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error', container);
                    }
                }
            });
        }

        function getGroupActivity(callback, groups) {
            util.ajax({
                url: groupsURL.groupActivity,
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result, status, jqXHR) {
                    if (callback) {
                        callback(result, jqXHR.getResponseHeader('Date'));
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }

        function getImages() {
            var _d = $.Deferred();

            util.ajax({
                url: groupsURL.groupImages,
                data: {'publishedOnly':'true'},
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    var images = [];
                    if (0 !== result.responseHeader.status) {
                        _d.reject('error fetching group images');
                    } else {
                        images = result.response.resources;
                        _d.resolve(images);
                    }
                },
                error: function () {
                    _d.reject('error fetching group images');
                }
            });

            return _d.promise();
        }

        function getGroupMembers(groups) {
            // groups.nocache = new Date().getTime(); // to prevent browsers caching the response (mainly for ie)
            var dfd = $.Deferred();
            util.ajax({
                url: groupsURL.groupMembers,
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    dfd.resolve(result);
                },
                error: function (error) {
                    dfd.resolve(error);
                }
            });

            return dfd;
        }

        function joinGroup(callback, groups) {
            util.ajax({
                url: groupsURL.joinGroup,
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback) {
                        callback(result.response);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }

        function getGroupInfo(callback, groups) {
            groups.nocache = new Date().getTime(); //  prevent caching in ie.
            util.ajax({
                url: groupsURL.groupInfo,
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
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

        function updateGroup(callback, groups) {
            util.ajax({
                url: groupsURL.updateGroup,
                method: 'POST',
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
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

        function deleteGroup(callback, groups) {
            util.ajax({
                url: groupsURL.deleteGroup,
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
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

        function removeMember(callback, groups) {
            util.ajax({
                url: groupsURL.removeMember,
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
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

        function updateNotifications(groups, callback) {
            util.ajax({
                url: groupsURL.updateNotifications,
                method: 'POST',
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
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

        function getNotifications(callback, groups) {
            groups.nocache = new Date().getTime(); // to prevent browsers caching the response (mainly for ie)
            util.ajax({
                url: groupsURL.getNotifications,
                data: groups.id,
                isPageDisable: true,
                isShowLoading: true,
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

        function getAssignmentsForLeader(callback, id, assignment) {
            assignment.nocache = new Date().getTime(); // to prevent browsers caching the response (mainly for ie)
            util.ajax({
                url: groupsURL.getAssignmentsForLeader + id,
                data: assignment,
                isPageDisable: true,
                isShowLoading: true,
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

        function getAssignmentsForMember(callback, id, assignment) {
            assignment.nocache = new Date().getTime(); // to prevent browsers caching the response (mainly for ie)
            util.ajax({
                url: groupsURL.getAssignmentsForMember + id,
                data: assignment,
                isPageDisable: true,
                isShowLoading: true,
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

        function getBranches(callback, id) {
            return util.ajax({
                url: groupsURL.getSubjects + id.toUpperCase(),
                data: {
                    'pageSize': 20
                },
                useCDN: true,
                cdnExpirationAge: 'daily',
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback) {
                        callback(result, id);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error', id);
                    }
                }
            });
        }

        function getDescendants(callback, id) {
            var data = {};
            data.pageSize = 100;
            data.ownedBy = 'ck12';
            var localCache = false;
            if (window.isApp && window.isApp()) {
                localCache = {
                    'namespace': 'ck12data',
                    'key': id.replace('/1', '_descendants'),
                    'region': id.replace('/1', '')
                };
            }
            util.ajax({
                url: groupsURL.getDescendants + id,
                data: data,
                localCache: localCache,
                isPageDisable: true,
                isShowLoading: true,
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

        function getCollection(callback, collectionData) {
            var data = {};
            data.includeRelations = true;
            data.maxRelationDepth = 4;
            data.includeTaxonomyComposistionsInfo = collectionData.includeTaxonomyComposistionsInfo ? true : false;
            return util.ajax({
                url: groupsURL.getCollection + 'collectionHandle=' + 
                    collectionData.collectionName + '&collectionCreatorID=3', 
                data: data,
                useCDN: true,
                cdnExpirationAge: 'daily',
                localCache: false,
                isPageDisable: true,
                isShowLoading: true,
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

        function getModalitiesCount(callback, collectionData){
            var data = {};
            if (collectionData.modalityTypes) {
                data.considerModalitiesOfTypes = collectionData.modalityTypes;
            }

            // By default retrieve ck12 owned counts
            if (!collectionData.hasOwnProperty('includeCK12OwnedCounts') ||
                !collectionData.hasOwnProperty('includeCommunityOwnedCounts')) {
                    data.includeCK12OwnedCounts = true;
                    data.includeCommunityOwnedCounts = false;
            } else {
                data.includeCK12OwnedCounts = collectionData.includeCK12OwnedCounts || false;
                data.includeCommunityOwnedCounts = collectionData.includeCommunityOwnedCounts || false;
            }

            return util.ajax({
                url: groupsURL.getModalitiesCount + 'collectionHandle=' + 
                    collectionData.collectionHandle + '&collectionCreatorID=3',
                data: data,
                useCDN: true,
                cdnExpirationAge: 'daily',
                localCache: false,
                isPageDisable: true,
                isShowLoading: true,
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

        function getModalities(callback, id) {
            var data = {};
            data.pageSize = 100;
            util.ajax({
                url: groupsURL.getModalities + id,
                data: data,
                isPageDisable: true,
                isShowLoading: true,
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

        function createAssignment(callback, assignment) {
            util.ajax({
                url: groupsURL.createAssignment,
                data: assignment,
                method: 'POST',
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback) {
                        callback(result, assignment);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }

        function assignAssignment(callback, assignment, id) {
            util.ajax({
                url: groupsURL.assignAssignment + id,
                data: assignment,
                method: 'POST',
                isPageDisable: true,
                isShowLoading: true,
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

        function updateAssignment(callback, assignment, id) {
            util.ajax({
                url: groupsURL.updateAssignment + id,
                data: assignment,
                method: 'POST',
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback) {
                        callback(result, assignment, id);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }

        function unAssignAssignment(callback, id) {
            util.ajax({
                url: groupsURL.unAssignAssignment + id,
                method: 'POST',
                isPageDisable: true,
                isShowLoading: true,
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

        function countStudyTrack(callback) {
            util.ajax({
                url: groupsURL.countStudyTrack,
                method: 'POST',
                isPageDisable: true,
                isShowLoading: true,
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

        function search(callback, value, pageNum) {
            var params = {};
            params.pageSize = 10;
            params.pageNum = pageNum || 1;
            util.ajax({
                url: groupsURL.search + value,
                data: params,
                useCDN: true,
                cdnExpirationAge: 'daily',
                isPageDisable: true,
                isShowLoading: true,
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

        function getGroupAssignmentReport(callback, groups) {
            util.ajax({
                url: groupsURL.getGroupAssignmentReport + groups.groupID,
                data: groups,
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
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

        function unshare(callback, data) {
            util.ajax({
                url: groupsURL.unshare + data,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback) {
                        callback(result, data);
                    }
                },
                error: function () {
                    if (callback) {
                        callback('error', data);
                    }
                }
            });
        }

        function getLeaderAssignmentDetails(callback, assignmentID) {
            util.ajax({
                url: groupsURL.leaderAssignmentDetails + assignmentID,
                isPageDisable: true,
                isShowLoading: true,
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

        function deleteAllAssignment(callback, assignmentID) {
            util.ajax({
                url: groupsURL.deleteAllAssignment + assignmentID,
                method: 'POST',
                isPageDisable: true,
                isShowLoading: true,
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

        function resendVerficationEmail(callback) {
            util.ajax({
                url: groupsURL.resendVerficationEmail,
                isPageDisable: true,
                isShowLoading: true,
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

        function updateQAsettings(groups, callback) {
            util.ajax({
                url: groupsURL.updateQAsettings,
                method: 'POST',
                data: groups,
                isPageDisable: true,
                isShowLoading: true,
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

        function syncMember(callback, memberID) {
            util.ajax({
                url: groupsURL.syncMember + "/" + memberID,
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

        function updateMember(callback, memberID, data) {
            util.ajax({
                url: groupsURL.updateMember +"/"+ memberID,
                method: 'POST',
                data: data,
                xhrFields: { withCredentials: true},
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    syncMember(null,result.response.id);
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

        function getMyStudents(callback, groupID) {
            var params = {};
            params.groupID = groupID;
            params.pageSize = 1000;
            util.ajax({
                url: groupsURL.getMyStudents,
                data: params,
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

        function getPracticeHandleForEID(options){
            util.ajax({
                url: groupsURL.getPracticeInfo + options.eid + '?minimal=True',
                success: function (response) {
                    if (options && options.success) {
                    	options.success(response.response);
                    }
                },
                error: function () {
                    if (options && options.error) {
                    	options.error('error');
                    }
                }
            });
        }
        this.getGroups = getGroups;
        this.createGroup = createGroup;
        this.getGroupActivity = getGroupActivity;
        this.getImages = getImages;
        this.getGroupMembers = getGroupMembers;
        this.joinGroup = joinGroup;
        this.getGroupInfo = getGroupInfo;
        this.updateGroup = updateGroup;
        this.deleteGroup = deleteGroup;
        this.removeMember = removeMember;
        this.updateNotifications = updateNotifications;
        this.getNotifications = getNotifications;
        this.getAssignmentsForLeader = getAssignmentsForLeader;
        this.getAssignmentsForMember = getAssignmentsForMember;
        this.getBranches = getBranches;
        this.getDescendants = getDescendants;
        this.getCollection = getCollection;
        this.getModalitiesCount = getModalitiesCount;
        this.getModalities = getModalities;
        this.createAssignment = createAssignment;
        this.assignAssignment = assignAssignment;
        this.unAssignAssignment = unAssignAssignment;
        this.updateAssignment = updateAssignment;
        this.getGroupAssignmentReport = getGroupAssignmentReport;
        this.countStudyTrack = countStudyTrack;
        this.search = search;
        this.unshare = unshare;
        this.getLeaderAssignmentDetails = getLeaderAssignmentDetails;
        this.deleteAllAssignment = deleteAllAssignment;
        this.resendVerficationEmail = resendVerficationEmail;
        this.getMyQuizes = getMyQuizes;
        this.updateQAsettings = updateQAsettings;
        this.updateMember = updateMember;
        this.getMyStudents = getMyStudents;
        this.getPracticeHandleForEID = getPracticeHandleForEID;
        this.getAssignmentReccomendation = getAssignmentReccomendation;
    }

    return new groupService();

});
