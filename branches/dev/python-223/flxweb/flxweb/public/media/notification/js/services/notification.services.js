define([
    'jquery',
    'common/utils/utils',
    'common/utils/user'
], function ($, util, User) {
    'use strict';
    var API = {
            'GET_MY_EVENTS': util.getApiUrl('flx/get/my/events'),
            'UPDATE_NOTIFICATION_ACCESSTIME': util.getApiUrl('flx/update/member/accesstime/inapp_notifications'),
            'NOTIFICATION_DISMISS': util.getApiUrl('flx/delete/event'),
            'SEND_VERIFICATION_MAIL': util.getApiUrl('auth/verify/email'),
            'SUMMER_CHALLENGE_MESSAGE': '/assessment/api/sc/get/message/daily'
        },
        prof_fields = {
            'grades': 'grades',
            'subjects': 'subjects',
            'roles': 'role',
            'userImage': 'profile image',
            'userLocation': 'location',
            'userSchool': 'school'
        };

    function getIncompleteProfFields(response) {
        var incomplete_prof_fields = $.extend(true, {}, prof_fields);

        if (response.grades instanceof Array && response.grades.length > 0) {
            delete incomplete_prof_fields.grades;
        }
        if (response.subjects instanceof Array && response.subjects.length > 0) {
            delete incomplete_prof_fields.subjects;
        }
        if (response.roles instanceof Array && response.roles.length > 0) {
            delete incomplete_prof_fields.roles;
        }
        if (response.userImage) {
            delete incomplete_prof_fields.userImage;
        }
        if (response.userLocation) {
            delete incomplete_prof_fields.userLocation;
        }
        if (!$.isEmptyObject(response.userSchool) && response.userSchool.name !== '') {
            delete incomplete_prof_fields.userSchool;
        }

        return incomplete_prof_fields;
    }

    function fieldsAsString(incomplete_prof_fields) {
        var key, str = '';
        for (key in incomplete_prof_fields) {
            if (incomplete_prof_fields.hasOwnProperty(key)) {
                str += str ? ', ' + incomplete_prof_fields[key] : incomplete_prof_fields[key];
            }
        }
        return str.replace(/(.*),/, '$1, and ');
    }

    /*function addSummerChallengeNotification(data, enrollmentResponse) {
        var content;
        if (!$.cookie('flx-summer-challenge-notification-created')) {
            $.cookie('flx-summer-challenge-notification-created', new Date(), {
                path: '/'
            });
        }
        if (!$.cookie('flx-summer-challenge-notification-accessed')) {
            data.response['new'] = data.response['new'] + 1;
        }
        if (enrollmentResponse.response && enrollmentResponse.responseHeader) {
            if (enrollmentResponse.responseHeader.status === 17004 || enrollmentResponse.responseHeader.status === 17003) {
                content = '<span>Prevent the summer slide with CK-12 BrainFlex.</span><span class="invite-students">Invite your students or friends!</span>';
            } else if (enrollmentResponse.responseHeader.status === 0 && enrollmentResponse.response.message) {
                content = enrollmentResponse.response.message.message;
            }
        }
        if (content) {
            data.response.events.reverse();
            data.response.events.push({
                'created': $.cookie('flx-summer-challenge-notification-created'),
                'eventData': {
                    'member': {
                        'content': content
                    }
                },
                'id': 2,
                'typeDesc': 'Event for summer challenge invitation',
                'typeName': 'SUMMER_CHALLENGE_WEB'
            });
            data.response.events.reverse();
            data.response.total = data.response.total + 1;
        }
    }
    
    function getSummerChallengeMessage(data) {
        return util.ajax({
            'url': API.SUMMER_CHALLENGE_MESSAGE,
            'loadingElement': '#notifications-loading-icon',
            'isShowLoading': true,
            'data': {
                webView: 'True',
                timezone: new Date().getTimezoneOffset()
            },
            'async': false,
            'success': function (result) {
                addSummerChallengeNotification (data, result);
            }
        });
    }*/

    /*function addUserUnverifiedNotification(data) {
        var userInfo = new User();
        return userInfo.fetch({
            'loadingElement': '#notifications-loading-icon',
            'isPageEnable': true,
            'dataType': 'json',
            'success': function (model, userData) {
                if (userData && data.response && data.response.events) {
                    if (!(userData.emailVerified)) {
                        if (!$.cookie('flx-unverified-notification-created')) {
                            $.cookie('flx-unverified-notification-created', new Date(), {
                                path: '/'
                            });
                        }

                        if (!$.cookie('flx-unverified-notification-accessed')) {
                            data.response['new'] = data.response['new'] + 1;
                        }
                        var content = {};
                        content.student = 'Verify your email address so you can create a study group with your friends.';
                        content.teacher = 'Verify your email address so you can create a class and assign practice.';
                        data.response.events.reverse();
                        data.response.events.push({
                            'created': $.cookie('flx-unverified-notification-created'),
                            'eventData': {
                                'member': {
                                    'content': content[flxweb_role],
                                    'email': userData.email || ''
                                }
                            },
                            'id': 0,
                            'typeDesc': 'Event when user is unverified',
                            'typeName': 'USER_UNVERIFIED'
                        });
                        data.response.events.reverse();
                        data.response.total = data.response.total + 1;
                    }
                }
            }
        });
    }*/

    function addProfileIncompleteNotification(data) {
        if (!(window.ck12_signed_in)) {
            return false;
        }
        var userProfileInfo = new User();
        return userProfileInfo.fetch({
            'loadingElement': '#notifications-loading-icon',
            'isPageDisable': false,
            'isShowLoading': false,
            'dataType': 'json',
            'success': function (model, profiledata) {
                if (profiledata && data.response && data.response.events) {
                    var total_fields_count, incompleted_fields_count,
                        incomplete_prof_fields = getIncompleteProfFields(profiledata),
                        subject = '',
                        content = '',
                        percent_complete = 0;
                    if (incomplete_prof_fields && Object.keys(incomplete_prof_fields).length > 0) {
                        total_fields_count = Object.keys(prof_fields).length;
                        incompleted_fields_count = Object.keys(incomplete_prof_fields).length;
                        percent_complete = Math.round((total_fields_count - incompleted_fields_count) * (100 / total_fields_count));
                        subject = 'Your profile is ' + percent_complete + '% complete';

                        if (incompleted_fields_count && incompleted_fields_count > 1) {
                            content = 'You can complete it by adding your ' + fieldsAsString(incomplete_prof_fields) + '.';

                        } else if (incompleted_fields_count === 1) {
                            switch (Object.keys(incomplete_prof_fields)[0]) {
                            case 'grades':
                                content = 'Tell us which grades you are interested in.';
                                break;
                            case 'subjects':
                                content = 'Tell us which subjects you are interested in.';
                                break;
                            case 'roles':
                                content = 'Update your role information.';
                                break;
                            case 'userImage':
                                content = 'Upload your profile image.';
                                break;
                            case 'userLocation':
                                content = 'Update your location information.';
                                break;
                            case 'userSchool':
                                content = 'What school did you attend?';
                                break;
                            default:
                                content = '';
                            }
                        }
                    } else {
                        return;
                    }

                    data.response.events.reverse();
                    if (!$.cookie('flx-profile-notification-created')) {
                        $.cookie('flx-profile-notification-created', new Date(), {
                            path: '/'
                        });
                    }

                    if (!$.cookie('flx-profile-notification-accessed')) {
                        data.response['new'] = data.response['new'] + 1;
                    }

                    data.response.events.push({
                        'created': $.cookie('flx-profile-notification-created'),
                        'eventData': {
                            'member': {
                                'percent_complete': percent_complete,
                                'subject': subject,
                                'content': content
                            }
                        },
                        'id': 1,
                        'typeDesc': 'Event when profile is incomplete',
                        'typeName': 'PROFILE_INCOMPLETE'
                    });
                    data.response.events.reverse();
                    data.response.total = data.response.total + 1;
                }
            }
        });
    }

    var services = {
        getEvents: function (options) {
            options = $.extend({
                'notificationType': 'web',
                'pageSize': '10',
                'pageNum': '1'
            }, options);
            return util.ajax({
                'url': API.GET_MY_EVENTS + '/' + options.notificationType,
                'loadingElement': '#notifications-loading-icon',
                'isPageDisable': false,
                'isShowLoading': false,
                'data': {
                    'pageSize': options.pageSize,
                    'pageNum': options.pageNum
                },
                'dataType': 'json',
                'success': function (data, status, jqXHR) {
                    var currentTime = jqXHR.getResponseHeader('Date');
                    data.response.currentTime = currentTime;
                    /*if ($.cookie('flx-unverified-notification-dismissed') !== 'true') {
                        addUserUnverifiedNotification(data);
                    }*/
                    if ($.cookie('flx-profile-notification-dismissed') !== 'true') {
                        addProfileIncompleteNotification(data);
                    }
                    //   Disable BrainFlex notification after the end of program - Nimish
                    // if ($.cookie('flx-summer-challenge-notification-dismissed') !== 'true') {
                    //     if (data.response && data.response.events != null) {
                    //         getSummerChallengeMessage(data);
                    //     }
                    // }
                }
            });
        },
        updateAccesstime: function () {
            $.cookie('flx-profile-notification-accessed', new Date(), {
                path: '/'
            });
            $.cookie('flx-unverified-notification-accessed', new Date(), {
                path: '/'
            });
            $.cookie('flx-summer-challenge-notification-accessed', new Date(), {
                path: '/'
            });
            return util.ajax({
                'url': API.UPDATE_NOTIFICATION_ACCESSTIME,
                'isShowLoading': true,
                'loadingElement': '#notifications-loading-icon'
            });
        },
        dismissNotification: function (notification_id) {
            var _d, xhr = null;
            if (notification_id) {
                xhr = util.ajax({
                    'url': API.NOTIFICATION_DISMISS + '/' + notification_id,
                    'dataType': 'json',
                    'loadingElement': '#notifications-loading-icon',
                    'isShowLoading': true
                });
            } else {
                _d = $.Deferred();
                _d.reject('Notification ID not specified');
                xhr = _d.promise();
            }
            return xhr;
        },
        drawProgress: function (canvasID, percent, lineColor, lineWidth, textColor, textFont) {
            lineColor = lineColor || 'black';
            lineWidth = lineWidth || 14;
            textColor = textColor || 'black';
            textFont = textFont || '20px Georgia';

            var canvas = document.getElementById(canvasID);
            if (canvas) {
                percent = $(canvas).data('percent_complete');
                var x, y, radius, deg, startAngle, endAngle, counterClockwise,
                    context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);
                x = canvas.width / 2;
                y = canvas.height / 2;
                radius = y - parseInt((lineWidth / 2), 10) - 2;
                deg = ((360 * percent) / 100);
                startAngle = (-90 * Math.PI) / 180;
                endAngle = ((deg - 90) * Math.PI) / 180;
                endAngle = Math.round(endAngle * 100) / 100;
                counterClockwise = false;
                context.beginPath();
                if (percent > 0){
                    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
                }
                context.lineWidth = lineWidth;
                // line color
                context.strokeStyle = lineColor;
                context.stroke();
                context.font = textFont;
                context.fillStyle = textColor;
                // textAlign aligns text horizontally relative to placement
                context.textAlign = 'center';
                // textBaseline aligns text vertically relative to font style
                context.textBaseline = 'middle';
                context.fillText(percent + '%', x, y);
            }
        },
        sendVerificationMail: function (callback) {
            return util.ajax({
                'url': API.SEND_VERIFICATION_MAIL,
                'loadingElement': '#notifications-loading-icon',
                'isShowLoading': true,
                'success': function (result) {
                    if (callback) {
                        callback(result);
                    }
                },
                'error': function () {
                    if (callback) {
                        callback('error');
                    }
                }
            });
        }
    };
    return services;
});
