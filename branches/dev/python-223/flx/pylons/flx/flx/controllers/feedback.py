import logging
import json
import traceback
from pylons.i18n.translation import _
from datetime import datetime

from pylons import config, request, tmpl_context as c

from flx.controllers import decorators as d
from flx.model import api
from flx.model import exceptions as ex
import flx.lib.helpers as h
from flx.lib.base import BaseController, render
import flx.controllers.user as u
from flx.controllers.common import ArtifactCache

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)
seq = 101

class FeedbackController(BaseController):
    """
        Feedback related APIs.
    """

    def createForm(self):
        user = u.getCurrentUser(request)
        c.userName = user.name
        c.prefix = self.prefix
        return render('/flx/feedback/createForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def create(self):
        """
            Creates a feedback to a revision of an artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            log.info('Params: %s' %(request.params))
            artifactID = request.params['artifactID']
            typeOfFeedback = ''
            if request.params.has_key('type'):
                typeOfFeedback = request.params['type']
                score = request.params.get(typeOfFeedback,None)
                if not score:
                    score = request.params.get('score')
            elif request.params.has_key('vote'):
                score = request.params['vote']
                typeOfFeedback = 'vote'
            else:
                score = request.params['rating']
                typeOfFeedback = 'rating'
            comments = request.params.get('comments', None)
            feedback = api.createFeedback(artifactID=artifactID,
                                          memberID=user.id,
                                          type=typeOfFeedback,
                                          score=score,
                                          comments=comments,
                                          cache=ArtifactCache())
            result['response']['feedback'] = feedback.asDict()
            result['response']['feedback'] ['hasReportedAbuse'] = False
            try:
                artifact = api.getArtifactByID(id=artifactID)
                ownerLogin = artifact.creator.login
                ownerEmail = artifact.creator.email
                ownerID = artifact.creator.id
                name = artifact.creator.fix().name
                if artifact and comments and ownerLogin == 'ck12editor':
                    data = {'artifactID' : artifact.id,
                            'title' : artifact.getTitle(),
                            'artifact_url' : h.getArtifactURL(artifact),
                            'memberName' : name,
                            'commentsBy': user.name,
                            'comments': comments,
                            'feedback_type' : 'comments' }
                    if str(config.get("send_notifications_to_ck12editor")).lower() == "true":
                        e = api.createEventForType(typeName='ARTIFACT_FEEDBACK_COMMENTS', objectID=artifactID, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=ownerID, subscriberID=ownerID, processInstant=False)
                        n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifactID, objectType='artifact', address=ownerEmail, subscriberID=ownerID, type='email', frequency='instant')
                        h.processInstantNotifications([e.id], notificationIDs=[n.id], user=user.id, noWait=False)
                    #Create or update web notification for artifact feedback comment(s)
                    eventType = api.getEventTypeByName(typeName='ARTIFACT_FEEDBACK_COMMENTS_WEB')
                    notificationFilters = (('objectType', 'artifact'), ('frequency', 'ondemand'), ('type', 'web'), ('subscriberID', ownerID), ('eventTypeID', eventType.id));
                    feedbackNotifications = api.getNotificationsByFilter(filters=notificationFilters)
                    if feedbackNotifications:
                        eventFilters = (('objectType', 'artifact'), ('subscriberID', ownerID), ('objectID', feedbackNotifications[0].objectID), ('eventTypeID', eventType.id));
                        events = api.getEventsByFilters(filters=eventFilters)
                        if events and len(events) > 0:
                            event = events[0]
                            eventData = json.loads(event.eventData)
                            data['no_of_feedbacks'] = eventData.get('no_of_feedbacks', 0) + 1
                            event.created = datetime.now()
                            event.eventData = json.dumps(data, default=h.toJson)
                            api.update(instance=event)
                    else:
                        #Create now notification and event
                        data.update({'no_of_feedbacks' : 1, 'coverimage' : artifact.getCoverImageUri() if artifact.getCoverImageUri() else ''})
                        e = api.createEventForType(typeName='ARTIFACT_FEEDBACK_COMMENTS_WEB', objectID=artifactID, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=ownerID, subscriberID=ownerID, processInstant=False)
                        api.createNotification(eventTypeID=eventType.id, objectID=artifactID, objectType='artifact', address=ownerEmail, subscriberID=ownerID, type='web', frequency='ondemand')

            except Exception, e:
                log.error('Artifact Feedback Notification Exception[%s] traceback' %(traceback.format_exc()))
            log.info('Feedback created successfully: %s' %(result['response']['feedback']))
            return result
        except Exception, e:
            log.error('create feedback Exception[%s]' % str(e))
            log.error('create feedback Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEEDBACK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def createFeedbackReview(self):
        """
            Creates a review to a feedback on an artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            artifactID = request.params['artifactID']
            memberID = request.params['memberID']
            if memberID:
                memberID = long(memberID)
            typeOfFeedback = ''
            if request.params.has_key('type'):
                typeOfFeedback = request.params.get('type')
            else:
                typeOfFeedback = 'rating'
            reviewComment = request.params.get('reviewComment', None)
            feedbackReview = api.createFeedbackReview(artifactID=artifactID,
                                          memberID=memberID,
                                          type=typeOfFeedback,
                                          reviewersMemberID=user.id,
                                          reviewComment=reviewComment,
                                          cache=ArtifactCache())
            result['response']['feedbackReview'] = feedbackReview.asDict()
            result['response']['feedbackReview']['hasReportedAbuse'] = False
            result['response']['feedbackReview']['reviewersMemberName'] = user.name
            log.info('Feedback review created successfully: %s' %(result['response']['feedbackReview']))
            try:
                artifact = api.getArtifactByID(id=artifactID)
                if artifact and reviewComment and memberID and user.login == 'ck12editor':
                    commentsForUser = api.getMemberByID(id=memberID)
                    if commentsForUser:
                        name = commentsForUser.name
                        commentsBy = user.name
                        data = {'artifactID' : artifact.id,
                                'title' : artifact.getTitle(),
                                'artifact_url' : h.getArtifactURL(artifact),
                                'memberName' : name,
                                'commentsBy': commentsBy,
                                'comments': reviewComment,
                                'feedback_type' : 'review' }
                        e = api.createEventForType(typeName='ARTIFACT_FEEDBACK_COMMENTS', objectID=artifactID, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=commentsForUser.id, subscriberID=commentsForUser.id, processInstant=False)
                        n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifactID, objectType='artifact', address=commentsForUser.email, subscriberID=commentsForUser.id, type='email', frequency='instant')
                        h.processInstantNotifications([e.id], notificationIDs=[n.id], user=user.id, noWait=False)
            except Exception, e:
                log.error('Artifact Feedback Review Notification Exception[%s] traceback' %(traceback.format_exc()))
            return result
        except Exception, e:
            log.error('create feedback review Exception[%s]' % str(e))
            log.error('create feedback review Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEEDBACK_REVIEW
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request,False,True, ['artifactID', 'memberID'])
    @d.trace(log, ['artifactID', 'memberID'])
    def createFeedbackAbuse(self, artifactID, memberID):
        """
            Creates an Abuse for a feedback on an artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            comments = request.params.get('comments', None)
            if memberID:
                memberID = long(memberID)
            feedbackAbuse = api.createFeedbackAbuse(artifactID=artifactID,
                                                    memberID=memberID,
                                                    reporterMemberID=user.id,
                                                    comments=comments)
            result['response']['feedbackAbuse'] = feedbackAbuse.asDict()   
            log.info('Feedback abuse created successfully: %s' %(result['response']['feedbackAbuse']))
            try:
                if str(config.get("send_notifications_to_ck12editor")).lower() == "true":
                    artifact = api.getArtifactByID(id=artifactID)
                    toUser = api.getMemberByID(id=3)
                    feedback = api.getArtifactFeedbacksByMember(artifactID=artifactID,memberID=memberID)
                    reviewUser = api.getMemberByID(id=memberID)
                    if toUser and artifact and feedback: 
                        reportedBy = user.name
                        reviewBy = reviewUser.name
                        name = toUser.name
                        data = {'artifactID' : artifact.id,
                                'title' : artifact.getTitle(),
                                'artifact_url' : h.getArtifactURL(artifact),
                                'memberName' : name,
                                'reportedBy': reportedBy,
                                'reviewBy' : reviewBy,
                                'comments': feedback['vote']['comments'],
                                'feedback_type' : 'feedback' }
                        e = api.createEventForType(typeName='ARTIFACT_FEEDBACK_COMMENTS_ABUSE', objectID=artifactID, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=toUser.id, subscriberID=toUser.id, processInstant=False)
                        n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifactID, objectType='artifact', address=toUser.email, subscriberID=toUser.id, type='email', frequency='instant')
                        h.processInstantNotifications([e.id], notificationIDs=[n.id], user=user.id, noWait=False)
                else:
                    log.info("Skipping email to ck12editor due to config.")
            except Exception, e:
                log.error('Artifact Feedback Comments Abuse Notification Exception[%s] traceback' %(traceback.format_exc()))
            return result

        except Exception, e:
            log.error('create feedback abuse Exception[%s]' % str(e))
            log.error('create feedback abuse Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEEDBACK_ABUSE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True, ['reviewID'])
    @d.trace(log, ['reviewID'])
    def createFeedbackReviewAbuse(self, reviewID):
        """
            Creates an Abuse for a Review on a feedback.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            comments = request.params.get('comments', None)
            feedbackReviewAbuse = api.createFeedbackReviewAbuse(artifactFeedbackReviewID=reviewID,
                                                    reporterMemberID=user.id,
                                                    comments=comments)
            result['response']['feedbackReviewAbuse'] = feedbackReviewAbuse.asDict()
            log.info('FeedbackReview abuse created successfully: %s' %(result['response']['feedbackReviewAbuse']))

            try:
                if str(config.get("send_notifications_to_ck12editor")).lower() == "true":
                    review = api.getFeedbackReviewByID(id=reviewID)
                    artifactID = review.artifactID
                    artifact = api.getArtifactByID(id=artifactID)
                    toUser = api.getMemberByID(id=3)
                    reviewUser = api.getMemberByID(id=review.memberID)
                    if toUser and artifact and review:
                        reportedBy = user.name
                        name = toUser.name
                        reviewBy = reviewUser.name
                        data = {'artifactID' : artifact.id,
                                'title' : artifact.getTitle(),
                                'artifact_url' : h.getArtifactURL(artifact),
                                'memberName' : name,
                                'reportedBy': reportedBy,
                                'reviewBy' : reviewBy,
                                'comments': review.reviewComment,
                                'feedback_type' : 'review' }
                        e = api.createEventForType(typeName='ARTIFACT_FEEDBACK_COMMENTS_ABUSE', objectID=artifactID, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=toUser.id, subscriberID=toUser.id, processInstant=False)
                        n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifactID, objectType='artifact', address=toUser.email, subscriberID=toUser.id, type='email', frequency='instant')
                        h.processInstantNotifications([e.id], notificationIDs=[n.id], user=user.id, noWait=False)
                else:
                    log.info("Skipping email to ck12editor due to config.")
            except Exception, e:
                log.error('Artifact Feedback Review Comments Abuse Notification Exception[%s] traceback' %(traceback.format_exc()))

            return result

        except Exception, e:
            log.error('create feedbackReview abuse Exception[%s]' % str(e))
            log.error('create feedbackReview abuse Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEEDBACK_REVIEW_ABUSE
            return ErrorCodes().asDict(c.errorCode, str(e))



    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def updateFeedback(self):
        """
            Updates a feedback on an artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            artifactID = request.params['artifactID']
            typeOfFeedback = ''
            updateComments = True
            isApproved = False
            notAbused = False
            if request.params.has_key('type'):
                if u.isMemberAdmin(user) and request.params.has_key('isApproved'):
                    user = u.getImpersonatedMember(user)
                    updateComments = False
                    isApproved = str(request.params.get('isApproved', False)).lower() == "true"
                if u.isMemberAdmin(user) and request.params.has_key('notAbuse'):
                    user = u.getImpersonatedMember(user)
                    updateComments = False
                    notAbused = str(request.params.get('notAbuse', False)).lower() == "true"
                typeOfFeedback = request.params['type']
                score = request.params.get(typeOfFeedback,None)
                if not score:
                    score = request.params.get('score')
            elif request.params.has_key('vote'):
                score = request.params['vote']
                typeOfFeedback = 'vote'
            else:
                score = request.params['rating']
                typeOfFeedback = 'rating'
            comments = request.params.get('comments', None)
            feedback = api.updateFeedback(artifactID=artifactID,
                                          memberID=user.id,
                                          type=typeOfFeedback,
                                          score=score,
                                          comments=comments,
                                          updateComments=updateComments,
                                          isApproved=isApproved,
                                          notAbuse=notAbused,
                                          cache=ArtifactCache())
            result['response']['feedback'] = feedback.asDict()
            result['response']['feedback']['hasReportedAbuse'] = False
            log.info('Feedback updated successfully: %s' %(result['response']['feedback']))
            return result
        except Exception, e:
            log.error('update feedback Exception[%s]' % str(e))
            log.error('update feedback Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_FEEDBACK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def updateFeedbackReview(self):
        """
            Updates a review to a feedback on an artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            reviewID = request.params['reviewID']
            review = api.getFeedbackReviewByID(id=reviewID)
            if not review:
                raise Exception((_(u"No such review by id: %(reviewID)s")  % {"reviewID":reviewID}).encode("utf-8"))
            reviewersMemberID = review.reviewersMemberID
            if not long(reviewersMemberID) == user.id and not u.isMemberAdmin(user):
                raise Exception("You can update only your review!")
            reviewComment = request.params.get('reviewComment', None)
            updateComments = True
            notAbused = False
            if u.isMemberAdmin(user) and request.params.has_key('notAbuse'):
                user = u.getImpersonatedMember(user)
                updateComments = False
                notAbused = str(request.params.get('notAbuse', False)).lower() == "true"
            feedbackReview = api.updateFeedbackReview(reviewID=reviewID,
                                          reviewersMemberID=user.id,
                                          reviewComment=reviewComment,
                                          updateComments=updateComments,
                                          notAbused=notAbused,
                                          cache=ArtifactCache())
            result['response']['feedbackReview'] = feedbackReview.asDict()
            result['response']['feedbackReview']['reviewersMemberName'] = user.name
            result['response']['feedbackReview']['hasReportedAbuse'] = False
            log.info('Feedback review updated successfully: %s' %(result['response']['feedbackReview']))
            return result
        except Exception, e:
            log.error('Update feedback review Exception[%s]' % str(e))
            log.error('Update feedback review Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_FEEDBACK_REVIEW
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def createFeedbackHelpful(self):
        """
            Creates an entry to indicate if an artifact feedback is helpful or not.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            log.info('PARAMS: %s'%request.params)
            artifactID = request.params['artifactID']
            memberID = request.params['memberID']
            if memberID:
                memberID = long(memberID)
            typeOfFeedback = ''
            if request.params.has_key('type'):
                typeOfFeedback = request.params.get('type')
            else:
                typeOfFeedback = 'rating'
            isHelpful = request.params.get('isHelpful', False)
            if str(isHelpful).lower() == 'true':
                isHelpful = True
            else:
                isHelpful = False
            feedbackHelpful = api.createFeedbackHelpful(artifactID=artifactID,
                                          memberID=memberID,
                                          type=typeOfFeedback,
                                          reviewersMemberID=user.id,
                                          isHelpful=isHelpful,
                                          cache=ArtifactCache())
            result['response']['feedbackHelpful'] = feedbackHelpful
            log.info('Feedback helpful added successfully: %s' %(result['response']['feedbackHelpful']))
            return result
        except Exception, e:
            log.error('create feedback helpful Exception[%s]' % str(e))
            log.error('create feedback helpful Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEEDBACK_HELPFUL
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['revid', 'memid'])
    @d.trace(log, ['revid', 'memid'])
    def delete(self):
        """
            Deletes the given feedback identified by id.
        """
        try:
            user = u.getCurrentUser(request)
            artifactID = request.params['artifactID']
            api.deleteFeedback(artifactID=artifactID,
                               memberID=user.id,
                               cache=ArtifactCache())
            log.info('Feedback for artifactID: [%s] by userID: [%s] deleted successfully' %(artifactID, user.id))
            return ErrorCodes().asDict(ErrorCodes.OK)
        except Exception, e:
            log.error('delete feedback Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_FEEDBACK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteFeedbackReview(self):
        """
            Deletes the given feedback review identified by feedback.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            reviewID = request.params['reviewID']
            review = api.getFeedbackReviewByID(id=reviewID)
            if not review:
                raise Exception((_(u"No such review by id: %(reviewID)s")  % {"reviewID":reviewID}).encode("utf-8"))
            reviewersMemberID = review.reviewersMemberID
            memberID = review.memberID
            artifactID = review.artifactID
            if reviewersMemberID != user.id and not u.isMemberAdmin(user) and memberID != user.id:
                artifact = api.getArtifactByID(artifactID)
                if not artifact or artifact.creator.id != user.id:
                    raise ex.UnauthorizedException((_(u'Only admin or artifact owner or feedback reviewer can delete other user\'s review comment.')).encode("utf-8"))
            ar_delete_status = api.deleteFeedbackReview(reviewID=reviewID)
            result['response']['reviewID'] = reviewID
            result['response']['is_deleted'] = ar_delete_status
            return result
        except Exception, e:
            log.error('delete feedback review Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_FEEDBACK_REVIEW
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteFeedbackHelpful(self):
        """
            Deletes the given feedback helpful identified by member.
        """
        try:
            user = u.getCurrentUser(request)
            artifactID = request.params['artifactID']
            memberID = request.params['memberID']
            if memberID:
                memberID = long(memberID)
            reviewersMemberID = user.id
            api.deleteFeedbackHelpful(artifactID=artifactID,
                               memberID=memberID,reviewersMemberID=reviewersMemberID)
            log.info('Feedback helpful for artifact [%s] for the user[%s]\'s feedback deleted successfully' %(artifactID, memberID))
            return ErrorCodes().asDict(ErrorCodes.OK)
        except Exception, e:
            log.error('delete feedback helpful Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_FEEDBACK_HELPFUL
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log,['artifactIDList'])
    def getArtifactsFeedbacks(self, artifactIDList):
        """
            Get the average rating of an artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            kwargs = {}
            artifactIDList = [long(artifactID) for artifactID in artifactIDList.split(',')]
            kwargs['artifactIDList'] = artifactIDList 
            artifact_rating = api.getArtifactsFeedbacks(**kwargs)
            result['response']['result'] = artifact_rating
            return result
        except Exception, e:
            log.error('getArtifactRating Exception: [%s]' % str(e))
            log.error('getArtifactRating  Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request,False,False,['artifactID'])
    @d.trace(log,['artifactID'])
    def getArtifactFeedbacksByMember(self, artifactID):
        """
            Get the rating of an artifact given by the user.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            kwargs = {}
            kwargs['artifactID'] = artifactID
            kwargs['memberID'] = user.id
            #artifactDict, artifact = PersonalCache().load(memberID=kwargs['memberID'], id=kwargs['artifactID'])
            #if not artifactDict:
            #    feedbacks = []
            #else:
            #    feedbacks = artifactDict.get('feedbacks', [])
            feedbacks = api.getArtifactFeedbacksByMember(memberID=kwargs['memberID'], artifactID=kwargs['artifactID'])
            result['response']['result'] = feedbacks
            return result
        except Exception, e:
            log.error('getArtifactRatingByMember Exception[%s]' % str(e))
            log.error('getArtifactRatingByMember  Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['artifactID'])
    @d.trace(log, ['artifactID', 'pageNum', 'pageSize'])
    def getArtifactComments(self, artifactID, pageNum, pageSize):
        """
            Returns Artifact comments.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            if not user:
                result['response']['result'] = ''
                result['response']['total'] = 0
            else:
                log.info('User id %s' %(user.id))
                artifactComments, total = api.getArtifactComments(artifactID=artifactID, userID = user.id, pageNum=pageNum, pageSize=pageSize)
                result['response']['result'] = artifactComments
                result['response']['total'] = total
            return result
        except Exception, e:
            log.error('getArtifactComments Exception[%s]' % str(e))
            log.error('getArtifactComments  Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

        return result

    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageNum', 'pageSize'])
    def getFeedbackReviews(self, pageNum, pageSize):
        """
            Returns reviews to a comment.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            kwargs = {}
            kwargs['artifactID'] = request.params.get('artifactID')
            kwargs['memberID'] = request.params.get('memberID')
            if kwargs['memberID']:
                kwargs['memberID'] = long(kwargs['memberID'])
            kwargs['type'] = request.params.get('type')
            feedbackReviews, total = api.getFeedbackReviews(artifactID=kwargs['artifactID'], memberID=kwargs['memberID'], type=kwargs['type'], userID = user.id, pageNum=pageNum, pageSize=pageSize)
            result['response']['result'] = feedbackReviews
            result['response']['total'] = total
            return result
        except Exception, e:
            log.error('getFeedbackReviews Exception[%s]' % str(e))
            log.error('getFeedbackReviews  Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
        return result

    @d.jsonify()
    @d.sortable(request, [])
    @d.filterable(request, ['sort'], noformat=True)
    @d.checkAuth(request, False, False, ['sort', 'fq'])
    @d.setPage(request, ['sort', 'fq'])
    @d.trace(log, ['fq', 'sort', 'pageNum', 'pageSize'])
    def getArtifactAbusedComments(self, fq=None, pageNum=1, pageSize=50, sort=None):
        
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            commentType = request.params.get('commentType', 'feedback')
            abusedComments, total = api.getArtifactAbusedComments(commentType=commentType, fq=fq, pageNum=pageNum, pageSize=pageSize, sort=sort)
            result['response']['result'] = abusedComments
            result['response']['total'] = total
            return result
        except Exception, e:
            log.error('getArtifactAbusedComments( Exception[%s]' % str(e))
            log.error('getArtifactAbusedComments( Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
        return result


    @d.jsonify()
    @d.checkAuth(request, False,False,['artifactID'])
    @d.trace(log,['artifactID'])
    def deleteArtifactFeedbackByMember(self, artifactID):
        """
            Delete artifact rating given by the member
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            kwargs = {}
            kwargs['artifactID'] = artifactID
            kwargs['memberID'] = request.params.get('memberID', None)
            kwargs['type'] = request.params['type']
            kwargs['cache'] = ArtifactCache()
            if kwargs['memberID']:
                kwargs['memberID'] = long(kwargs['memberID'])
            if not kwargs['memberID']:
                kwargs['memberID'] = user.id
            elif str(kwargs['memberID']) != str(user.id) and not u.isMemberAdmin(user):
                artifact = api.getArtifactByID(artifactID)
                if artifact.creator.id != user.id:
                    raise ex.UnauthorizedException((_(u'Only admin or artifact owner can delete other user\'s feedback.')).encode("utf-8"))
            ar_delete_status = api.deleteArtifactFeedbackByMemberID(**kwargs)
            artifact_rating_info= {}
            artifact_rating_info['feedback_delete_status'] = ar_delete_status
            result['response'][artifactID] = artifact_rating_info
            return result
        except Exception, e:
            log.error('delete feedback Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_FEEDBACK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteAllArtifactFeedbackByMember(self):
        """
            Delete all artifact rating given by the member
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            kwargs = {}
            kwargs['memberID'] = request.params.get('memberID',None)
            if kwargs['memberID']:
                kwargs['memberID'] = long(kwargs['memberID'])
            if not kwargs['memberID']:
                kwargs['memberID'] = user.id
            elif str(kwargs['memberID']) != str(user.id) and not u.isMemberAdmin(user):
                raise ex.UnauthorizedException((_(u'Only admin can delete all feedbacks.')).encode("utf-8"))
            ar_delete_status = api.deleteAllArtifactFeedbackByMemberID(**kwargs)
            artifact_rating_info= {}
            artifact_rating_info['feedback_delete_status'] = ar_delete_status
            result['response']['result'] = artifact_rating_info
            return result
        except Exception, e:
            log.error('delete feedback Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_FEEDBACK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False,False,['artifactID'])
    @d.trace(log,['artifactID'])
    def deleteAllFeedbackForArtifact(self, artifactID):
        """
            Delete all the ratings for an artifact
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            user = u.getCurrentUser(request)
            if not u.isMemberAdmin(user):
                raise ex.unauthorizedexception((_(u'only admin can delete all the ratings for an artifact.')).encode("utf-8"))
            kwargs = {}
            kwargs['artifactID'] = artifactID
            ar_delete_status = api.deleteArtifactFeedbackByArtifactID(**kwargs)
            artifact_rating_info= {}
            artifact_rating_info['feedback_delete_status'] = ar_delete_status
            result['response'][artifactID] = artifact_rating_info
            return result
        except Exception, e:
            log.error('delete feedback Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_FEEDBACK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def getRWA(self, member):
        """
            Returns the next RWA entry for voting.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            rwa, voted, votable = api.getRWA(member.id)
            if rwa:
                artifactDict, artifact = ArtifactCache().load(id=rwa.id, infoOnly=False)
                #resp = g.ac.getDetail(result,rwa.id)
                #artifactDict = resp['response']['artifact']
            else:
                artifactDict = {}
            result['response']['artifact'] = artifactDict
            result['response']['voted'] = voted
            result['response']['votable'] = votable
            return result
        except Exception, e:
            log.error('getRWA Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member', 'sort'])
    def getRWAs(self, member):
        """
            Returns the next page of RWA entries.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can view RWAs.')).encode("utf-8"))
            rwas = api.getRWAs(pageNum=1, pageSize=1000)
            artifactIDList = []
            for rwa in rwas:
                artifactIDList.append(rwa.id)
            getRealFeedbacks = api.getGetRealFeedbacks(artifactIDList=artifactIDList)
            artifactFeedbackList = []
            for artifactID in getRealFeedbacks.keys():
                feedbackDict = {}
                feedbackDict.update(getRealFeedbacks[artifactID])
                artifactDict, artifact = ArtifactCache().load(id=artifactID, infoOnly=False)
                feedbackDict.update(artifactDict)
                artifactFeedbackList.append(feedbackDict)

            sortKey = request.params.get('sort', 'totalscore')
            #sortedArtifactFeedbackList = sorted(artifactFeedbackList, key=lambda k: k['totalscore'], reverse=True)
            sortedArtifactFeedbackList = sorted(artifactFeedbackList, key=lambda k: k[sortKey], reverse=True)
            result['response']['artifacts'] = sortedArtifactFeedbackList
            result['response']['total'] = len(sortedArtifactFeedbackList)
            return result
        except Exception, e:
            log.error('getRWAs Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            log.error(traceback.format_exc())
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.sortable(request, [])
    @d.filterable(request, ['sort'], noformat=True)
    @d.checkAuth(request, False, False, ['sort', 'fq'])
    @d.setPage(request, ['sort', 'fq'])
    @d.trace(log, ['fq', 'sort', 'pageNum', 'pageSize'])
    def getArtifactFeedbackDetails(self, fq=None, feedbackcount = 10, pageNum=1, pageSize=0, sort=None):
        """
            Return json object having artifact feedbacks helpful count details informations (ArtifacetId, memberID, comment, count)
            with pagination
            It will accept arguments (optional) isHelpful (True,true, False, false ) , feedbackcount (Numericvalues), pageNum, pageSize, sort  
        """ 
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            filters = None
            if fq:
                for name, value in fq:
                    if name == 'count':
                        feedbackcount = int(value)
                        continue
                    value = value.lower() == 'true' if value.lower() in ['true', 'false'] else value
                    if filters is not None:
                        filters = filters + ((name, value), )
                    else:
                        filters = ((name, value), )

            resultData = api.getArtifactFeedbackDetails(filters, feedbackcount=feedbackcount, pageNum=pageNum, pageSize=pageSize, sort=sort)

            data = []        
            for resultDataRow in resultData:
                tmpData = { 'ArtifacetId' : resultDataRow.ArtifactFeedback.artifactID, 
                           'memberID' : resultDataRow.ArtifactFeedback.memberID, 
                           'comment' : resultDataRow.ArtifactFeedback.comments[:100] if resultDataRow.ArtifactFeedback.comments else '',
                           'count' :  resultDataRow.countOfNo,
                           'isApproved' :  resultDataRow.ArtifactFeedback.isApproved,
                          }
                data.append(tmpData)

            result['response']['total'] = resultData.getTotal()  #resultData.getTotal()
            result['response']['limit'] = len(resultData)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['artifactFeedbackReviewDetails'] = data

            return result
        except Exception, e:
            log.error('getArtifactFeedbackDetails Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR 
            log.error(traceback.format_exc())
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['member', 'fq', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'fq', 'sort'])
    @d.trace(log, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    def getFeedbacksByMember(self, member, fq, ids=None, sort=None, pageNum=0, pageSize=0):
        """
            Returns all the feedbacks for member
            API is accessible only for admin user 
        """ 
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            
            member = u.getImpersonatedMember(member)
            feedbacks = api.getAllArtifactFeedbacksByMember(member.id, fq, pageNum=pageNum, pageSize=pageSize, sort=sort)
            feedbackList = []
            for feedback in feedbacks:
                feedbackDict = feedback.asDict()
                feedbackDict['memberName'] = feedback.member.fix().name
                
                feedbackList.append(feedbackDict)


            result['response']['total'] = feedbacks.getTotal()
            result['response']['limit'] = len(feedbacks)
            result['response']['offset'] = (pageNum - 1) * pageSize
            result['response']['result'] = feedbackList
            return result

        except Exception, e:
            log.error('getArtifactFeedbackDetails Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR 
            log.error(traceback.format_exc())
            return ErrorCodes().asDict(c.errorCode, str(e))


