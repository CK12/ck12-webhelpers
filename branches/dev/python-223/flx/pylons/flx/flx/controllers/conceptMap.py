import logging
import datetime

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _

from flx.controllers import decorators as d
from flx.model import api, exceptions as ex, utils
from flx.lib.base import BaseController
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class ConceptmapController(BaseController):
    """
        ConceptMap related APIs.
    """

    @d.jsonify()
    @d.trace(log)
    def createFeedbacks(self):
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            c.errorCode = ErrorCodes.OK
            params = dict(request.params)

            member = u.getCurrentUser(request)
            if member:
                visitorID = ''
            else:
                member = api.getMemberByID(id=2)
                visitorID = params.get('visitorID', None)
                if not visitorID:
                    raise ex.MissingArgumentException(('Visitor ID missing.').encode("utf-8"))
            memberID = member.id
            encodedID = params.get('encodedID', None)
            if not encodedID:
                raise ex.MissingArgumentException(('Base node data missing.').encode("utf-8"))
            encodedID = encodedID.strip()
            suggestions = params.get('suggestions', None)
            if not suggestions:
                raise ex.MissingArgumentException(('No suggestion.').encode("utf-8"))
            suggestions = suggestions.split(',')
            log.debug('createFeedbacks: suggestions[%s]' % suggestions)
            comments = params.get('comments', None)
            status = 'reviewing'
            creationTime = datetime.datetime.now()

            feedbacks = []
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                for suggestion in suggestions:
                    suggestion = suggestion.strip()
                    log.debug('createFeedbacks: suggestion[%s]' % suggestion)
                    s = suggestion[0]
                    if s != '+' and s != '-':
                        raise ex.InvalidArgumentException((_(u'Suggestion "%s" not started with either "+" or "-".') % suggestion).encode("utf-8"))
                    data = {
                        'memberID': memberID,
                        'visitorID': visitorID,
                        'encodedID': encodedID,
                        'suggestion': suggestion,
                        'comments': comments,
                        'status': status,
                        'creationTime': creationTime,
                    }
                    feedback = api._createConceptMapFeedback(session, **data)
                    feedbacks.append(feedback.asDict())

            result['response']['feedbacks'] = feedbacks
            return result 
        except Exception, e:
            log.exception(e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def updateFeedbacks(self):
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            c.errorCode = ErrorCodes.OK
            params = dict(request.params)

            member = u.getCurrentUser(request)
            if member:
                visitorID = ''
            else:
                member = api.getMemberByID(id=2)
                visitorID = params.get('visitorID', None)
                if not visitorID:
                    raise ex.MissingArgumentException(('Visitor ID missing.').encode("utf-8"))
            memberID = params.get('memberID', None)
            if memberID:
                if not u.isMemberAdmin(member):
                    raise ex.UnauthorizedException((_(u'Only admins are authorized to review feedbacks.')).encode("utf-8"))
                reviewer = member.id
                notes = params.get('notes', None)
                status = params.get('status')
                if status not in ('accepted', 'rejected', 'reviewing'):
                    raise ex.InvalidArgumentException((_(u'Invalide status, %s') % status).encode("utf-8"))
            else:
                reviewer = None
                memberID = member.id
                status = 'reviewing'
            encodedID = params.get('encodedID', None)
            if not encodedID:
                raise ex.MissingArgumentException(('Base node data missing.').encode("utf-8"))
            encodedID = encodedID.strip()
            suggestions = params.get('suggestions', None)
            if not suggestions:
                raise ex.MissingArgumentException(('No suggestions.').encode("utf-8"))
            suggestions = suggestions.split(',')
            log.debug('updateFeedbacks: suggestions[%s]' % suggestions)
            comments = params.get('comments', None)
            updateTime = datetime.datetime.now()

            feedbacks = []
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                for suggestion in suggestions:
                    suggestion = suggestion.strip()
                    log.debug('updateFeedbacks: suggestion[%s]' % suggestion)
                    s = suggestion[0]
                    if s != '+' and s != '-':
                        raise ex.InvalidArgumentException((_(u'Suggestion "%s" not started with either "+" or "-".') % suggestion).encode("utf-8"))
                    data = {
                        'memberID': memberID,
                        'visitorID': visitorID,
                        'encodedID': encodedID,
                        'suggestion': suggestion,
                    }
                    results = api._getConceptMapFeedbacks(session, **data)
                    log.debug('updateFeedbacks: results[%s]' % results)
                    if results and reviewer:
                        #
                        #  Update with reviewer's note.
                        #
                        feedback = results[0]
                        feedback.reviewer = reviewer
                        feedback.notes = notes
                        feedback.status = status
                        feedback.updateTime = updateTime
                        api._update(session, feedback)
                        log.debug('updateFeedbacks: review feedback[%s]' % feedback)
                        feedbacks.append(feedback.asDict())
                    elif not results:
                        #
                        #  See if this suggestion was there already.
                        #  If so, just delete to cancel out.
                        #
                        rs = '+' if s == '-' else '-'
                        rSuggestion = '%s%s' % (rs, suggestion[1:])
                        log.debug('updateFeedbacks: rSuggestion[%s]' % rSuggestion)
                        data = {
                            'memberID': memberID,
                            'visitorID': visitorID,
                            'encodedID': encodedID,
                            'suggestion': rSuggestion,
                        }
                        results = api._getConceptMapFeedbacks(session, **data)
                        if results:
                            feedback = results[0]
                            log.debug('updateFeedbacks: delete feedback[%s]' % feedback)
                            #
                            #  Delete existing feedback node.
                            #
                            feedbackDict = feedback.asDict()
                            feedbackDict['suggestion'] = suggestion
                            feedbacks.append(feedbackDict)
                            session.delete(feedback)
                        else:
                            #
                            #  Add new feedback node.
                            #
                            data = {
                                'memberID': memberID,
                                'visitorID': visitorID,
                                'encodedID': encodedID,
                                'suggestion': suggestion,
                                'comments': comments,
                                'status': status,
                                'creationTime': datetime.datetime.now(),
                            }
                            feedback = api._createConceptMapFeedback(session, **data)
                            feedbackDict = feedback.asDict()
                            feedbacks.append(feedbackDict)
                    else:
                        #
                        #  Already there, noop.
                        #
                        pass

            if len(feedbacks) == 0:
                data = {
                    'memberID': memberID,
                    'visitorID': visitorID,
                    'encodedID': encodedID,
                }
                results = api._getConceptMapFeedbacks(session, **data)
                for feedback in results:
                    feedbacks.append(feedback.asDict())
            result['response']['feedbacks'] = feedbacks
            return result 
        except Exception, e:
            log.exception(e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def getFeedbacks(self, member):
        try:
            params = dict(request.params)
            log.debug('getFeedbacks: params[%s]' % params)
            memberID = params.get('memberID', None)
            if not memberID or ( memberID and memberID != str(member.id) ):
                isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id)
                if not isSuperAdmin:
                    raise ex.UnauthorizedException((_(u'Only admin can get concept map feedback of others.')).encode("utf-8"))

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            c.errorCode = ErrorCodes.OK

            encodedID = params.get('encodedID', None)
            suggestion = params.get('suggestion', None)
            reviewer = params.get('reviewer', None)
            visitorID = params.get('visitorID', None)
            status = params.get('status', None)

            feedbacks = []
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                data = {
                    'memberID': memberID,
                    'visitorID': visitorID,
                    'encodedID': encodedID,
                    'suggestion': suggestion,
                    'reviewer': reviewer,
                    'status': status,
                }
                results = api._getConceptMapFeedbacks(session, **data)
                for feedback in results:
                    feedbacks.append(feedback.asDict())

            result['response']['feedbacks'] = feedbacks
            return result 
        except Exception, e:
            log.exception(e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
