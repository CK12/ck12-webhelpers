define(['common/utils/utils'], function (util) {
    'use strict';

    function dashboardService() {

        var dashboardURL = {
            'memberDashboardCounts': util.getApiUrl('flx/get/my/counts'),
            'getSubjects': util.getApiUrl('taxonomy/get/info/branches/'),
            'studentAssignments': util.getApiUrl('flx/get/my/assignments'),
            'studentGroupActivity': util.getApiUrl('flx/group/my'),
            'selfStudyTracks': util.getApiUrl('flx/get/my/selfStudies'),
            'subjectTracks': util.getApiUrl('flx/get/my/selfStudies'),
            'resendVerficationEmail': util.getApiUrl('auth/verify/email')
        };

        function getMemberDashboardCounts(callback, params) {
            util.ajax({
                url: dashboardURL.memberDashboardCounts,
                data: params,
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback && callback instanceof Function) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback && callback instanceof Function) {
                        callback('error');
                    }
                }
            });
        }

        function getSubjects(branch, params, callback) {
            return util.ajax({
                url: dashboardURL.getSubjects + branch,
                data: params,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback && callback instanceof Function) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback && callback instanceof Function) {
                        callback('error');
                    }
                }
            });
        }

        function getAssignments(callback, param) {
            util.ajax({
                url: dashboardURL.studentAssignments,
                data: param,
                dataType: 'json',
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback && callback instanceof Function) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback && callback instanceof Function) {
                        callback('error');
                    }
                }
            });
        }

        function getGroupActivity(callback, param) {
            util.ajax({
                url: dashboardURL.studentGroupActivity,
                data: param,
                dataType: 'json',
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result, status, jqXHR) {
                    if (callback && callback instanceof Function) {
                        callback(result, jqXHR.getResponseHeader('Date'));
                    }
                },
                error: function () {
                    if (callback && callback instanceof Function) {
                        callback('error');
                    }
                }
            });
        }

        function getSelfStudyDetails(callback, param) {
            util.ajax({
                url: dashboardURL.selfStudyTracks,
                data: param,
                dataType: 'json',
                cache: false,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback && callback instanceof Function) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback && callback instanceof Function) {
                        callback('error');
                    }
                }
            });
        }

        function getSubjectTracks(param, callback) {
            util.ajax({
                url: dashboardURL.subjectTracks,
                dataTYpe: 'json',
                cache: false,
                data: param,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback && callback instanceof Function) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback && callback instanceof Function) {
                        callback('error');
                    }
                }
            });
        }

        function resendVerficationEmail(callback) {
            util.ajax({
                url: dashboardURL.resendVerficationEmail,
                isPageDisable: true,
                isShowLoading: true,
                success: function (result) {
                    if (callback && callback instanceof Function) {
                        callback(result);
                    }
                },
                error: function () {
                    if (callback && callback instanceof Function) {
                        callback('error');
                    }
                }
            });
        }

        this.getMemberDashboardCounts = getMemberDashboardCounts;
        this.getSubjects = getSubjects;
        this.getAssignments = getAssignments;
        this.getGroupActivity = getGroupActivity;
        this.getSelfStudyDetails = getSelfStudyDetails;
        this.getSubjectTracks = getSubjectTracks;
        this.resendVerficationEmail = resendVerficationEmail;
    }

    return new dashboardService();

});
