define([
        'jquery',
        'backbone',
        'underscore',
        'common/utils/date',
        'notification/services/notification.services'
    ],
    function ($, Backbone, _, dateUtils, NS) {
        'use strict';

        var NOTIFICATION_CLASSES_BY_TYPE = {};

        /**
         * Global notifications
         *
         * Checks for new notifications and updates the count
         */
        var NotificationCountManager = Backbone.Model.extend({
            initialize: function () {
                this.fetch();
            },
            fetch: function () {
                var ncm = this,
                    xhr = NS.getEvents({
                        pageSize: 1
                    });
                xhr.done(function (data) {
                    ncm.set(ncm.parse(data));
                });
                return xhr;
            },
            save: function () {
                return NS.updateAccesstime();
            },
            parse: function (data) {
                var parsed_data = {};
                if (data && data.response) {
                    parsed_data = {
                        'new_notifications': (parseInt(data.response['new'], 10) || 0),
                        'total_notifications': (parseInt(data.response.total, 10) || 0)
                    };
                }
                return parsed_data;
            }
        });

        /**
         * Notifications
         *
         * Base model for notifications
         */
        var Notification = Backbone.Model.extend({
            getEventData: function () {
                return this.get('eventData');
            },
            getInitiator: function () {
                return this.get('owner');
            },
            getInitiatorName: function () {
                var initiator = this.getInitiator(),
                    initiator_name = 'Anonymous';

                if (initiator) {
                    initiator_name = initiator.givenName || '';
                    if (initiator_name.length < Notification.NOTIFICATION_INITIATOR_NAME_LEN_MAX) {
                        if (initiator.surname && (initiator_name.length + 3 < Notification.NOTIFICATION_INITIATOR_NAME_LEN_MAX)) {
                            initiator_name += ' ' + initiator.surname[0] + '.';
                        }
                    } else {
                        initiator_name = initiator_name.substr(0, Notification.NOTIFICATION_INITIATOR_NAME_LEN_MAX - 3) + '...';
                    }
                }

                return initiator_name;
            },
            getInitiatorID: function () {
                var initiator = this.getInitiator(),
                    initiatorID = null;

                if (initiator) {
                    if (initiator.id) {
                        initiatorID = initiator.id;
                    } else if (initiator.memberID) {
                        initiatorID = initiator.memberID;
                    }
                }

                return initiatorID;
            },
            getInitiatorThumb: function () {
                var thumb = '',
                    //initiator = this.getInitiator(),
                    initiatorID = this.getInitiatorID();
                /*
            if (initiator && initiator.imageURL){
                thumb = initiator.imageURL;
            }
            */
                if (initiatorID) {
                    thumb = '/auth/member/image/' + initiatorID;
                }
                return thumb;
            },
            getVerb: function () {
                return 'did';
            },
            getContent: function () {
                return 'Something interesting ...';
            },
            getEmail: function () {
                return 'Anonymous';
            },
            getTimestamp: function () {
                var created = this.get('created'),
                    td = dateUtils.getTimeDifference(created, this.get('currentTime')),
                    ts = '';
                if (td) {
                    ts = td.big;
                }
                return ts;
            },
            isProfileNotification: function () {
                return false;
            },
            isUserNotification: function () {
                return false;
            },
            getProfilePercentComplete: function () {
                return 0;
            },
            getNotificationID: function (){
                return this.id;
            },
            toJSON: function () {
                return {
                    'initiator': this.getInitiatorName(),
                    'initiator_thumb': this.getInitiatorThumb(),
                    'verb': this.getVerb(),
                    'content': this.getContent(),
                    'email': this.getEmail(),
                    'timestamp': this.getTimestamp(),
                    'is_new': this.get('is_new'),
                    'profile_notification': this.isProfileNotification(),
                    'user_notification': this.isUserNotification(),
                    'percent_complete': this.getProfilePercentComplete(),
                    'notificationID': this.getNotificationID()
                };
            },
            destroy: function (options) {
                var _id = this.get('id'),
                    _c = this;
                if(_c.get('typeName') === 'PROFILE_INCOMPLETE') {
                    _c.trigger('destroy', _c, _c.collection, options);
                } else {
                    var xhr = NS.dismissNotification(_id);
                    xhr.done(function () {
                        _c.trigger('destroy', _c, _c.collection, options);
                    });
                    return xhr;
                }
            },
            /**
             * Notification.getURL
             *
             * Returns action URL for the notification. By default it will look for
             * url in eventData. If eventData doesn't have URL, and the notification
             * is for a group, the group URL is returned instead.
             *
             * Models extending Notification should override this method to fit their needs.
             */
            getURL: function () {
                var action_url = null,
                    eventData = this.getEventData();
                if (eventData && eventData.url) {
                    action_url = eventData.url;
                } else {
                    if (this.get('objectType') === 'group') {
                        //if group type is forums, use forum url
                        if (eventData && (('public-forum' === eventData.group_type) ||
                            (eventData.post && eventData.post.groupType === 'public-forum')) ) {
                            var question_id = eventData.post.postType === 'question'? eventData.post._id : eventData.question._id;
                            action_url = '/forum/' + this.get('objectID') + '/question/' + question_id;
                        } else {
                            action_url = '/group/' + this.get('objectID');
                        }
                    }
                }
                return action_url;
            },
            /**
            * By default loads action url in current window
            *
            * Models extending Notification should override this method to fit their needs.
            */
            isNewWindow: function(){
                return false;
            }
        }, {
            CLASSNAME: 'Notification',
            NOTIFICATION_INITIATOR_NAME_LEN_MAX: 50,
            NOTIFICATION_CONTENT_LEN_MAX: 60,

            getNotificationClassByType: function (notification_type) {
                var notification_class = NOTIFICATION_CLASSES_BY_TYPE[notification_type];
                if (!notification_class) {
                    notification_class = Notification;
                }
                return notification_class;
            },
            fromJSON: function (obj) {
                var NotificationClass = Notification.getNotificationClassByType(obj.typeName);
                return new NotificationClass(obj);
            }
        });

        var GroupJoinNotification = Notification.extend({
            getVerb: function () {
                return 'joined';
            },
            getContent: function () {
                var groupName = this.getEventData().group_name;
                groupName = (groupName || '').replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
                return groupName || 'Group';
            }
        }, {
            CLASSNAME: 'GroupJoinNotification'
        });

        var GroupAdminAddedNotification = Notification.extend({
            getInitiatorName: function () {
                return this.getEventData().added_by.name;
            },
            getVerb: function () {
                return 'added you to their';
            },
            getContent: function () {
                var groupName = this.getEventData().group_name;
                groupName = (groupName || '').replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
                return (groupName || 'Group') + ' class.';
            }
        }, {
            CLASSNAME: 'GroupAddedToNotification'
        });

        var ProfileIncompleteNotification = Notification.extend({
            getVerb: function () {
                return '';
            },
            getInitiatorName: function () {
                return this.getEventData().member.subject;
            },
            getContent: function () {
                return this.getEventData().member.content;
            },
            getTimestamp: function () {
                var created = this.get('created'),
                    td = dateUtils.getTimeDifference(created, this.get('currentTime')),
                    ts = '';
                if (td) {
                    ts = td.big;

                }
                return ts;
                //return '';
            },
            getURL: function () {
                var action_url = editprofile_url;
                return action_url;
            },
            isProfileNotification: function () {
                return true;
            },
            getProfilePercentComplete: function () {
                return this.getEventData().member.percent_complete;
            }
        }, {
            CLASSNAME: 'ProfileIncompleteNotification'
        });

        var PracticeChangesNotification = Notification.extend({
            getVerb: function () {
                return '';
            },
            getInitiatorName: function () {
                return '';
            },
            getInitiatorThumb: function() {
                return '/media/images/practice_icon_95px.png';
            },
            getContent: function () {
                return this.getEventData().member.content;
            },
            getTimestamp: function () {
                var created = this.get('created'),
                    td = dateUtils.getTimeDifference(created, this.get('currentTime')),
                    ts = '';
                if (td) {
                    ts = td.big;

                }
                return ts;
                //return '';
            },
            getURL: function () {
                return '/practice';
            },
            isPracticeChangesNotification: function () {
                return true;
            },
            isProfileNotification: function () {
                return false;
            },
            isUserNotification: function () {
                return false;
            },
            getProfilePercentComplete: function () {
                return 0;
            }
        }, {
            CLASSNAME: 'PracticeChangesNotification'
        });

        var SummerChallengeNotification = Notification.extend({
            getVerb: function () {
                return '';
            },
            getInitiatorName: function () {
                return '';
            },
            getInitiatorThumb: function() {
                return '/media/images/brain.svg';
            },
            getContent: function () {
                return this.getEventData().member.content;
            },
            getTimestamp: function () {
                var created = this.get('created'),
                    td = dateUtils.getTimeDifference(created, this.get('currentTime')),
                    ts = '';
                if (td) {
                    ts = td.big;

                }
                return ts;
                //return '';
            },
            getURL: function () {
                return '/summer';
            },
            isSummerChallengeNotification: function () {
                return true;
            },
            isProfileNotification: function () {
                return false;
            },
            isUserNotification: function () {
                return false;
            },
            getProfilePercentComplete: function () {
                return 0;
            }
        }, {
            CLASSNAME: 'SummerChallengeNotification'
        });

        /**
         *  ArtifactNewRevisionNotification
         *
         *  Notification class for Artifact New Revision Available Event
         */
        var ArtifactNewRevisionNotification = Notification.extend({
            getTitle: function () {
                return this.getEventData().title;
            },
            isBook: function () {
                return this.getEventData().isBook;
            },
            getDisplayText: function () {
                return 'A new version of the ' + this.getEventData().artifactTypeName + ' <b>' + this.getTitle() + ' </b>' + ' is available';
            },
            getInitiatorName: function () {
                var name = '';
                return name;
            },
            getInitiatorThumb: function () {
                var thumb = '';
                if (this.getEventData() && this.getEventData().cover_img) {
                    thumb = this.getEventData().cover_img;
                } else if (this.isBook()) {
                    thumb = '/media/images/thumb_dflt_flexbook_sm.png';
                } else if (!this.isBook()) {
                    thumb = '/media/images/thumb_dflt_concept_sm.png';
                }
                return thumb;
            },
            getVerb: function () {
                var verb = '';

                return verb;
            },
            getContent: function () {
                return this.getDisplayText(); //only get the text content;
            },
            getURL: function () {
                var evt = this.getEventData(),
                    url = '#';
                if (evt) {
                    url = evt.artifact_url;
                }
                return url;
            }
        }, {
            CLASSNAME: 'ArtifactNewRevisionNotification'
        });

         /**
         *  ConceptPracticeIncompleteNotification
         *
         *  Notification class for Concept Practice Incomplete Event
         */
        var ConceptPracticeIncompleteNotification = Notification.extend({
            getTitle: function () {
                return this.getEventData().conceptName;
            },
            getDisplayText: function () {
                var text = 'Answer <b><a class="inline" href="'+  this.getURL() + '">' + this.getEventData().questionsRemaining + ' more question';
                text += this.getEventData().questionsRemaining? 's': '';
                text += '</a></b> correctly to complete ';
                text += _.template('<%- data.title %>.', {title: this.getTitle() }, {variable:'data'});
                return text;
            },
            getInitiatorName: function () {
                var name = '';
                return name;
            },
            getInitiatorThumb: function () {
                var thumb = '';
                return thumb;
            },
            getVerb: function () {
                var verb = '';

                return verb;
            },
            getContent: function () {
                return this.getDisplayText(); //only get the text content;
            },
            getURL: function () {
                var evt = this.getEventData(),
                    url = '#';
                if (evt) {
                    url = evt.coverSheetLink;
                }
                return url;
            },
            getProfilePercentComplete: function(){
                return this.getEventData().progress;
            },
            isProfileNotification: function(){
                return true;
            }
        }, {
            CLASSNAME: 'ConceptPracticeIncompleteNotification'
        });

        /**
         *  ArtifactRevisionPrintFormatNotification
         *
         *  Notification class for Artifact Revision Print Format Generation Success Event
         */
        var ArtifactRevisionPrintFormatNotification = Notification.extend({
            getEventData: function(){
                return JSON.parse(this.get('eventData'));
            },
            getTitle: function () {
                return this.getEventData().title;
            },
            getPrintType: function (){
                return this.getEventData().printType;
            },
            isSuccessfulGeneration: function(){
                return 'PRINT_GENERATION_SUCCESSFUL_WEB' == this.get('typeName');
            },
            getDownloadURL: function () {
                return this.getEventData().downloadUri;
            },
            getArtifactUrl: function () {
                return this.getEventData().artifactUrl;
            },
            getDisplayText: function () {
                if (this.isSuccessfulGeneration()){
                    return 'The ' + this.getPrintType() + ' you requested for ' + '<b><a class="inline" target="_blank" href="' + this.getDownloadURL() + '" >' + this.getTitle() + '</a></b>' + ' is available for download.';
                }else{
                    return 'Unfortunately we were unable to  process your ' + this.getPrintType() + ' request. Please retry or contact to mailto <a href="mailto:support@ck12.org">support@ck12.org</a>';
                }
            },
            getInitiatorName: function () {
                var name = '';
                return name;
            },
            getInitiatorThumb: function () {
                var thumb = '';
                if (this.getEventData() && this.getEventData().coverimage) {
                    thumb = this.getEventData().coverimage;
                } else {
                    var artifactType = this.getEventData().artifactType;
                    if (['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook'].indexOf(artifactType) != -1){
                        thumb = '/media/images/thumb_dflt_flexbook_sm.png';
                    }else if (['concept', 'chapter'].indexOf(artifactType) != -1){
                        thumb = '/media/images/thumb_dflt_' + this.getEventData().artifactType + '_sm.png';
                    }else{
                        thumb = '/media/images/thumb_dflt_concept_sm.png';
                    }
                }
                return thumb;
            },
            getVerb: function () {
                var verb = '';

                return verb;
            },
            getContent: function () {
                return this.getDisplayText(); //only get the text content;
            },
            getURL: function () {
                if (this.isSuccessfulGeneration()){
                    return this.getDownloadURL();
                }else{
                    return this.getMailToUrl();
                }
            },
            getMailToUrl: function() {
                return 'mailto:support@ck12.org';
            },
            isNewWindow: function(){
                return this.isSuccessfulGeneration();
            }
        }, {
            CLASSNAME: 'ArtifactRevisionPrintFormatNotification'
        });

        /**
        *  ArtifactFeedbackCommentsNotification
        *
        *  Notification class for Artifact Feedback Comments Event
        */
        var ArtifactFeedbackCommentsNotification = Notification.extend({
            getTitle: function () {
                return this.getEventData().title;
            },
            getUserName: function (){
                return this.getEventData().commentsBy;
            },
            getCommentsCount: function(){
                return this.getEventData().no_of_feedbacks;
            },
            getArtifactUrl: function () {
                return this.getEventData().artifact_url;
            },
            getDisplayText: function () {
                var commentsCount = this.getCommentsCount();
                if (commentsCount == 1){
                    return 'User ' + this.getUserName() + ' has commented on ' + '<b><a class="inline" href="' + this.getArtifactUrl() + '" >' + this.getTitle() + '</a></b>.';
                }else{
                    return 'You have ' + commentsCount + ' comments for ' + '<b><a class="inline" href="' + this.getArtifactUrl() + '" >' + this.getTitle() + '</a></b>.';
                }
            },
            getInitiatorName: function () {
                var name = '';
                return name;
            },
            getInitiatorThumb: function () {
                var thumb = '';
                if (this.getEventData() && this.getEventData().coverimage) {
                    thumb = this.getEventData().coverimage;
                } else {
                    thumb = '/media/images/thumb_dflt_concept_sm.png';
                }
                return thumb;
            },
            getVerb: function () {
                var verb = '';

                return verb;
            },
            getContent: function () {
                return this.getDisplayText(); //only get the text content;
            },
            getURL: function () {
                return this.getArtifactUrl();
            }
        }, {
            CLASSNAME: 'ArtifactFeedbackCommentsNotification'
        });

        /**
         *  GroupPostNotification
         *
         *  Notification class for Group's Peerhelp events
         */
        var GroupPostNotification = Notification.extend({
            getPost: function () {
                return this.getEventData().post;
            },
            getInitiatorName: function () {
                var name = Notification.prototype.getInitiatorName.apply(this, arguments),
                    post = this.getPost();
                if (post) {
                    if (post.isAnonymous) {
                        name = 'Anonymous';
                    }
                }
                return name;
            },
            getInitiatorThumb: function () {
                var thumb = '',
                    post = this.getPost();
                if (post) {
                    if (post.isAnonymous) {
                        thumb = '';
                    } else {
                        thumb = Notification.prototype.getInitiatorThumb.apply(this, arguments);
                    }
                }
                return thumb;
            },
            getVerb: function () {
                var verb = 'posted',
                    post = this.getPost();

                if (post && post.postType && GroupPostNotification.VERBS[post.postType]) {
                    verb = GroupPostNotification.VERBS[post.postType];
                }

                return verb;
            },
            getContent: function () {
                var post = this.getPost(),
                    content = '';
                content = post ? post.content : '';
                content = $('<div>').html(content).text(); //only get the text content
                if (new RegExp('<?.*?>[\s]*</[a-z0-9]+>').test(content)){
                	content = content.replace(/&/g, '&amp;')
                					.replace(/</g, '&lt;')
                					.replace(/>/g, '&gt;')
                					.replace(/"/g, '&quot;');
                }
                if (!content) {
                    content = 'Content is too long to display';
                }
                if (content.length > Notification.NOTIFICATION_CONTENT_LEN_MAX) {
                    content = content.substring(0, Notification.NOTIFICATION_CONTENT_LEN_MAX - 3) + '...';
                }
                return content;
            }
        }, {
            CLASSNAME: 'GroupPostNotification',
            VERBS: {
                'comment': 'commented',
                'question': 'asked',
                'answer': 'answered'
            }
        });


        /**
         * GroupAssignmentNotificationBase
         *
         * Base class for handling Group Assignment Notifications
         */
        var GroupAssignmentNotificationBase = Notification.extend({
            getVerb: function () {
                return 'did';
            },
            getContent: function () {
                var content = 'an assignment.',
                    evt = this.getEventData(),
                    tmpl = '<a href="<%= data.assignmentURL %>"><%= data.assignment %></a>';
                evt.assignment = (evt.assignment || '').replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
                if (evt) {
                    content = _.template(tmpl, evt, {
                        'variable': 'data'
                    });
                }
                return content;
            },
            getURL: function () {
                var evt = this.getEventData(),
                    url = '#';
                if (evt) {
                    url = evt.assignmentURL;
                }
                return url;
            }
        }, {
            CLASSNAME: 'GroupAssignmentNotificationBase'
        });

        /**
         * GroupAssignmentAssignNotification
         *
         * Notification class for Group Assignments.
         * Used when assignment is assigned to a group.
         */
        var GroupAssignmentAssignNotification = GroupAssignmentNotificationBase.extend({
            getVerb: function () {
                return 'assigned';
            }
        }, {
            CLASSNAME: 'GroupAssignmentAssignNotification'
        });


        /**
         * GroupAssignmentDeleteNotification
         *
         * Notification class for Group Assignments.
         * Used for assignment removal notification.
         */
        var GroupAssignmentDeleteNotification = GroupAssignmentNotificationBase.extend({
            getVerb: function () {
                return 'deleted';
            }
        }, {
            CLASSNAME: 'GroupAssignmentDeleteNotification'
        });


        /**
         * GroupShareNotification
         *
         * Notification class for GROUP_SHARE_WEB event.
         * This type of notification is triggered when a member shares a resource with group.
         * All other members of the group except the sharer get this notification.
         */
        var GroupShareNotification = Notification.extend({
            getVerb: function () {
                return 'shared';
            },
            getSharedArtifact: function () {
                return this.getEventData();
            },
            getArtifactTitle: function () {
                return this.getSharedArtifact().title;
            },
            getArtifactURL: function () {
                var artifact = this.getSharedArtifact();
                return artifact.url;
            },
            getContent: function () {
                var contentData = {
                    url: this.getArtifactURL(),
                    title: this.getArtifactTitle()
                };
                return _.template('<a href="<%= data.url %>"><%- data.title %></a>', contentData, {
                    'variable': 'data'
                });
            }

        }, {
            CLASSNAME: 'GroupShareNotification'
        });

        var UserUnverifiedNotification = Notification.extend({
            getVerb: function () {
                return '';
            },
            isUserNotification: function () {
                return true;
            },
            getTimestamp: function () {
                var created = this.get('created'),
                    td = dateUtils.getTimeDifference(created, this.get('currentTime')),
                    ts = '';
                if (td) {
                    ts = td.big;

                }
                return ts;
                //return '';
            },
            getContent: function () {
                return this.getEventData().member.content;
            },
            getEmail: function () {
                return this.getEventData().member.email;
            }
        }, {
            CLASSNAME: 'UserUnverifiedNotification'
        });

        var NotificationCollection = Backbone.Collection.extend({
            initialize: function () {
                this.pageSize = 10;
                this.pageNum = 0;
                this.totalPages = 1;
            },
            fetch: function (options) {
                var _c = this,
                    _d = $.Deferred();

                options = $.extend({
                    'pageSize': _c.pageSize,
                    'pageNum': _c.pageNum
                }, options);

                //fetch notifications
                _c.fetching = true;
                NS.getEvents(options)
                    .done(function (data) {
                        _c.add(_c.parse(data));
                        _c.pageNum = options.pageNum;
                        _d.resolve();
                    })
                    .fail(function () {
                        _d.reject();
                    })
                    .always(function () {
                        _c.fetching = false;
                    });
                return _d.promise();
            },
            parse: function (data) {
                var models = [],
                    _accessTime = null,
                    notificationTime = null;

                if (data && data.response && data.response.events) {

                    if (data.response.since) {
                        _accessTime = new Date(data.response.since);
                    }

                    _.each(data.response.events, function (event) {
                        var str_created_time = event.created.replace(/-/g, '/');
                        notificationTime = new Date(str_created_time);
                        event.currentTime = new Date();
                        if (!_accessTime) { //no last accessed time found, everything is new
                            event.is_new = true;
                        } else {
                            if (_accessTime < notificationTime) {
                                event.is_new = true;
                            }
                        }

                        models.push(Notification.fromJSON(event));
                    });
                    this.totalPages = data.response.total / this.pageSize;
                }

                return models;
            },
            canFetchMore: function () {
                return (this.pageNum < this.totalPages);
            },
            fetchMore: function () {
                if (!this.fetching && this.canFetchMore()) {
                    return this.fetch({
                        'pageNum': this.pageNum + 1
                    });
                }
            }
        });


        /**
         * Configuration for notification classes...
         * Used by Notification.fromJSON
         * TODO: configure assignment related notifications...
         */
        NOTIFICATION_CLASSES_BY_TYPE = {
            'GROUP_PH_POST_WEB': GroupPostNotification,
            'GROUP_SHARE_WEB': GroupShareNotification,
            'GROUP_MEMBER_JOINED_WEB': GroupJoinNotification,
            'ASSIGNMENT_ASSIGNED_WEB': GroupAssignmentAssignNotification,
            'ASSIGNMENT_DELETED_WEB': GroupAssignmentDeleteNotification,
            'PRACTICE_CHANGED_WEB': PracticeChangesNotification,
            'SUMMER_CHALLENGE_WEB': SummerChallengeNotification,
            'PROFILE_INCOMPLETE': ProfileIncompleteNotification,
            'ARTIFACT_NEW_REVISION_AVAILABLE_WEB': ArtifactNewRevisionNotification,
            'USER_UNVERIFIED': UserUnverifiedNotification,
            'PRINT_GENERATION_SUCCESSFUL_WEB': ArtifactRevisionPrintFormatNotification,
            'PRINT_GENERATION_FAILED_WEB': ArtifactRevisionPrintFormatNotification,
            'ARTIFACT_FEEDBACK_COMMENTS_WEB': ArtifactFeedbackCommentsNotification,
            'CONCEPT_PRACTICE_INCOMPLETE_WEB' : ConceptPracticeIncompleteNotification,
            'GROUP_ADMIN_ADDED_MEMBER_WEB': GroupAdminAddedNotification

        };

        return {
            'NotificationCountManager': NotificationCountManager,
            'Notification': Notification,
            'NotificationCollection': NotificationCollection
        };
    });
