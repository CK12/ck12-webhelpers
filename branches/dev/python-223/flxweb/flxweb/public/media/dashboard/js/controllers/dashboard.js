define([
    'jquery',
    'dashboard/views/dashboard.view',
    'dashboard/services/ck12.dashbaord'
], function ($,view, dashboardService) {
    'use strict';

    function DashboardController() {

        var loadTracksFirstTime = false,
            trackList = false,
            subjectList = false,
            selfStudyTab = false,
            dashboardView = new view(this);

        function checkForResendEmail(result) {
            if ('error' === result) {
                alert('Sorry, we could not resend the verification mail right now. Please try again after some time.');
                result = '';
            } else if (result.hasOwnProperty('response')) {
                result = result.response;
                if (result.hasOwnProperty('message')) {
                    alert('Sorry, we could not resend the verification mail right now. Please try again after some time.');
                    result = '';
                } else {
                    dashboardView.emailSent(result);
                }
            } else {
                alert('Sorry, we could not resend the verification mail right now. Please try again after some time.');
            }
        }

        function getSubjects(branch, subjects) {
            var _d = $.Deferred();
            dashboardService.getSubjects(branch, subjects).done(function (subjects) {
                if (subjects.hasOwnProperty('response')) {
                    subjects = subjects.response;
                    if (subjects.hasOwnProperty('message')) {
                        if (subjects.message.match('No such subject')) {
                            _d.reject('Sorry, the subject you are trying to load does not exist.');
                        } else {
                            _d.reject('Sorry, we could not load the subjects right now. Please try again later.');
                        }
                    } else {
                        _d.resolve(subjects.branches);
                    }
                } else {
                    _d.reject('Sorry, we could not load the subjects right now. Please try again later.');
                }
            }).fail(function () {
                _d.reject('Sorry, the subject you are trying to load does not exist.');
            });

            return _d.promise();
        }

        function loadSubjects(tab) {
            var subjects = {};
            if (tab) {
                selfStudyTab = tab;
            }
            subjects.pageNum = 1;
            subjects.pageSize = 20;
            $.when(getSubjects('MAT', subjects), getSubjects('SCI', subjects), getSubjects('ELA', subjects)).done(function (mat, sci, ela) {
                if (selfStudyTab) {
                    dashboardView.renderInactiveSelfStudy(mat, sci, ela);
                    selfStudyTab = false;
                } else {
                    dashboardView.render(mat, sci, ela);
                }
            }).fail(alert);
        }
        function alert(mat, sci, ela){
            var error =  mat? mat : ''+ sci? sci : ''+ ela? ela : '';
            window.alert(error);
        }

        function checkForMemberDashboardCounts(dashboardState) {
            if ('error' === dashboardState) {
                console.log('Sorry, we could not load the dashboard. Please try again later.');
            } else if (dashboardState.hasOwnProperty('response')) {
                if (dashboardState.response.hasOwnProperty('message')) {
                    alert('Sorry, we could not load the dashboard. Please try again later.');
                } else {
                    dashboardView.renderDashboardState(dashboardState);
                }
            }
        }


        function dashboardState() {
            //Only get the assignment counts for upcoming OR assignments past due not more than 1 month
            var dueDate, params, dueDateStart = new Date();
            dueDateStart.setMonth(dueDateStart.getMonth() - 1);
            dueDate = (dueDateStart.getYear() + 1900).toString();
            dueDate += (dueDateStart.getMonth() < 9) ? '0' + (dueDateStart.getMonth() + 1) : dueDateStart.getMonth() + 1;
            dueDate += (dueDateStart.getDate() < 10) ? '0' + (dueDateStart.getDate()) : dueDateStart.getDate();
            params = {
                'filters': 'state,past-due-after-' + dueDate + ';state,upcoming'
            };

            dashboardService.getMemberDashboardCounts(checkForMemberDashboardCounts, params);
        }

        function saveConceptCompleteness(conceptComplete) {
            dashboardService.saveConceptCompleteness(conceptComplete);
        }

        function checkForAssignments(assignments) {
            if ('error' === assignments) {
                console.log('Sorry, we could not load the assignments. Please try again later.');
            } else if (assignments.hasOwnProperty('response')) {
                if (assignments.response.hasOwnProperty('message')) {
                    alert('Sorry, we could not load the assignments. Please try again later.');
                } else {
                    dashboardView.renderAssignments(assignments);
                }
            }
        }

        function getAssignments(param) {
            dashboardService.getAssignments(checkForAssignments, param);
        }

        function getAssignmentsLms(checkForAssignmentsNew, param) {
            dashboardService.getAssignments(checkForAssignmentsNew, param);
        }

        function checkForGroupActivity(groups, currentTime) {
            if ('error' === groups) {
                console.log('Sorry, we could not load the group activity. Please try again later.');
            } else if (groups.hasOwnProperty('response')) {
                if (groups.response.hasOwnProperty('message')) {
                    alert('Sorry, we could not load the group activity. Please try again later.');
                } else {
                    dashboardView.renderGroupDetails(groups, currentTime);
                }
            }
        }

        function getGroupActivity(param) {
            dashboardService.getGroupActivity(checkForGroupActivity, param);
        }

        function checkForSelfStudyDetails(selfStudy) {
            if ('error' === selfStudy) {
                console.log('Sorry, we could not load the self study tracks. Please try again later.');
            } else if (selfStudy.hasOwnProperty('response')) {
                if (selfStudy.response.hasOwnProperty('message')) {
                    alert('Sorry, we could not load the self study tracks. Please try again later.');
                } else {
                    dashboardView.renderSelfStudyTracks(selfStudy);
                }
            }
        }

        function getSelfStudyDetails(param) {
            dashboardService.getSelfStudyDetails(checkForSelfStudyDetails, param);
        }

        function checkForSubjectTracks(tracks) {
            if ('error' === tracks) {
                console.log('Sorry, we could not load the self study tracks. Please try again later.');
            } else if (tracks.hasOwnProperty('response')) {
                if (tracks.response.hasOwnProperty('message')) {
                    alert('Sorry, we could not load the self study tracks. Please try again later.');
                } else {
                    if (!loadTracksFirstTime) {
                        dashboardView.renderSubjectTracks(tracks);
                    } else if (subjectList) {
                        dashboardView.renderSubjectTracks(tracks, subjectList);
                        subjectList = false;
                        loadTracksFirstTime = false;
                    } else {
                        trackList = tracks;
                    }
                }
            }
        }

        function loadSelfStudy(mat, sci, ela) {
            if (trackList) {
                dashboardView.renderSubjectTracks(trackList, mat.concat(sci, ela));
                trackList = false;
                loadTracksFirstTime = false;
            } else {
                subjectList = mat.concat(sci, ela);
            }
        }

        function getSubjectTracks(subjectName, firstTime) {
            dashboardService.getSubjectTracks(subjectName, checkForSubjectTracks);
            if (firstTime) {
                loadTracksFirstTime = firstTime;
                var subjects = {};
                subjects.pageNum = 1;
                subjects.pageSize = 20;
                $.when(getSubjects('MAT', subjects), getSubjects('SCI', subjects), getSubjects('ELA', subjects)).done(loadSelfStudy).fail(alert);
            }
        }

        function resendVerficationEmail() {
            dashboardService.resendVerficationEmail(checkForResendEmail);
        }

        this.load = dashboardState;
        this.loadSubjects = loadSubjects;
        this.saveConceptCompleteness = saveConceptCompleteness;
        this.getAssignments = getAssignments;
        this.getGroupActivity = getGroupActivity;
        this.getSelfStudyDetails = getSelfStudyDetails;
        this.getSubjectTracks = getSubjectTracks;
        this.getAssignmentsLms = getAssignmentsLms;
        this.resendVerficationEmail = resendVerficationEmail;

    }

    return new DashboardController();
});
