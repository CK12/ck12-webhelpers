from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.lib.base import BaseController
from flx.model import api, exceptions as ex, utils
from flx.model.maintenance_notification_processor import MaintenanceNotificationManager
from flx.lib import helpers as h
from pylons import request, tmpl_context as c
from pylons.i18n.translation import _
import flx.controllers.user as u
import json, base64
import logging
import traceback


log = logging.getLogger(__name__)

def createEventForTypeHelper(eventType, ownerID, eventData, objectID, objectType, processInstant, notificationFilters, onlyGroupAdmins=False, subObjectID=None, onlyForMember=False):
    notifications = api.getNotificationsByFilter(filters=notificationFilters)
    notificationIDs = []
    groupIDs = []
    getype = api.getEventTypeByName(typeName='GROUP_PH_POST')
    for notification in notifications:
        gn = None
        if notification.eventType.name == 'PH_POST':
            gn = api.getUniqueNotification(getype.id, notification.subscriber.id, 'email', groupID=notification.groupID)
        if notification.frequency != 'off' and gn is None:
            notificationIDs.append(notification.id)
        if notification.type == 'web' and notification.groupID and not onlyForMember:
            groupIDs.append(notification.groupID)

    if groupIDs:
        events = []
        groupIDs = list(set(groupIDs))
        memberIDs = api.getMemberIDsForGroupIDs(groupIDs, onlyAdmins=onlyGroupAdmins)
        for memberID in memberIDs:
            if memberID != ownerID:
                event = api.createEventForType(typeName=eventType, objectID=objectID, objectType=objectType, 
                    eventData=eventData, ownerID=ownerID, processInstant=processInstant, notificationIDs=notificationIDs, subscriberID=memberID, subObjectID=subObjectID)
                events.append(event)
        return events
    else:
        event = api.createEventForType(typeName=eventType, objectID=objectID, objectType=objectType, 
            eventData=eventData, ownerID=ownerID, processInstant=processInstant, notificationIDs=notificationIDs, subscriberID=ownerID, subObjectID=subObjectID)
        return event

def createEventForTypeHelperWithSession(session, eventType, ownerID, eventData, objectID, objectType, processInstant, notificationFilters, onlyGroupAdmins=False, subObjectID=None, onlyForMember=False):
    notifications = api._getNotificationsByFilter(session, filters=notificationFilters)
    notificationIDs = []
    groupIDs = []
    getype = api._getEventTypeByName(session, typeName='GROUP_PH_POST')
    for notification in notifications:
        gn = None
        if notification.eventType.name == 'PH_POST':
            gn = api._getUniqueNotification(session, getype.id, notification.subscriber.id, 'email', groupID=notification.groupID)
        if notification.frequency != 'off' and gn is None:
            notificationIDs.append(notification.id)
        if notification.type == 'web' and notification.groupID and not onlyForMember:
            groupIDs.append(notification.groupID)

    if groupIDs:
        events = []
        groupIDs = list(set(groupIDs))
        memberIDs = api._getMemberIDsForGroupIDs(session, groupIDs, onlyAdmins=onlyGroupAdmins)
        for memberID in memberIDs:
            if memberID != ownerID:
                event = api._createEventForType(session, typeName=eventType, objectID=objectID, objectType=objectType, 
                    eventData=eventData, ownerID=ownerID, processInstant=processInstant, notificationIDs=notificationIDs, subscriberID=memberID, subObjectID=subObjectID)
                events.append(event)
        return events
    else:
        event = api._createEventForType(session, typeName=eventType, objectID=objectID, objectType=objectType, 
            eventData=eventData, ownerID=ownerID, processInstant=processInstant, notificationIDs=notificationIDs, subObjectID=subObjectID)
        return event

class NotificationController(BaseController):

    @d.jsonify()
    @d.trace(log)
    def createEvent(self):
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            eventData = None
            params = request.params
            if params.get('eventData'):
                try: 
                    eventData = h.safe_decode(base64.b64decode(params['eventData']))
                except TypeError:
                    log.warn("Could not decode eventData")
            events = self._createEvent(params, eventData)
            log.info("events: %s" % str(events))
            # For backward compatibility
            if type(events) == type([]):
                event = events[0]
            else:
                event = events
            result['response'] = event.asDict()
            if type(events) == type([]):
                result['response'].update({'events': [e.asDict() for e in events]})
            return result
        except Exception, e:
            log.error('Event create Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def createEvents(self):
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            eventsInfo = json.loads(request.params.get('eventsInfo'))
            commonEventsData = request.params.get('eventsData') # note the 's'
            try:
                commonEventsData = h.safe_decode(base64.b64decode(commonEventsData))
            except TypeError:
                log.warn("Could not decode commonEventsData")

            response = []
            for eventInfo in eventsInfo:
                try:
                    if not eventInfo.has_key('eventData'):
                        eventInfo['eventData'] = commonEventsData

                    events = self._createEvent(eventInfo)
                    # For backward compatibility
                    resp = {}
                    if type(events) == type(list):
                        event = events[0]
                        resp.update({'events': [e.asDict() for e in events]})
                    else:
                        event = events
                    resp.update({'status': 0, 'event': event.asDict()})
                    response.append(resp)
                except Exception, e:
                    response.append({'status': ErrorCodes.CANNOT_CREATE_EVENT, 'msg': str(e)})

            result['response'] = response
            return result
        except Exception, e:
            log.error('Event create Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _createEvent(self, kwargs, eventData=None):
        log.info("kwargs: %s" % str(kwargs))
        eventType = kwargs.get('eventType')
        if eventType:
            etype = api.getEventTypeByName(typeName=eventType)
            if not etype:
                raise Exception((_(u'No such eventType: %(eventType)s')  % {"eventType":eventType}).encode("utf-8"))
        else:
            raise Exception((_(u'Event type must be specified.')).encode("utf-8"))

        eventData = eventData if eventData else kwargs.get('eventData')
        psInstant = kwargs.get('processInstant')

        notificationFilters = None

        if kwargs.has_key('notificationFilters'):
            notificationFilters = kwargs.get('notificationFilters')
            if notificationFilters:
                notificationFilters = json.loads(notificationFilters)
                log.info("Got notification filters: %s" % notificationFilters)
                found = False
                for k, v in notificationFilters:
                    if k == 'eventTypeID':
                        found = True
                        break
                if not found:
                    notificationFilters.append(('eventTypeID', etype.id))
        elif kwargs.has_key('notificationIDs'):
            notificationIDs = kwargs.get('notificationIDs')
            notificationFilters = tuple([ ('id', long(x)) for x in notificationIDs.split(',') ])
        elif kwargs.has_key('notificationID'):
            notificationFilters = (('id', kwargs.get('notificationID')), )

        objectID = objectType = ownerID = None
        processInstant = False

        if kwargs.get('objectID'):
            objectID = kwargs['objectID']
            objectType = kwargs.get('objectType')
            if not objectType:
                raise Exception((_(u'Must specify an objectType along with objectID')).encode("utf-8"))
        subObjectID = kwargs.get('subObjectID')

        user = u.getCurrentUser(request, anonymousOkay=True)
        if user.login != 'guest':
            ownerID = user.id
        if psInstant and str(psInstant).lower() == 'true':
            processInstant = True 

        return createEventForTypeHelper(eventType, ownerID, eventData, objectID, objectType, processInstant, notificationFilters, subObjectID=subObjectID)

    @d.jsonify()
    @d.trace(log)
    def deleteEvents(self):
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            filters = request.params.get('filters')
            if filters is None:
                log.error('Delete events filters missing')
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, 'Delete events filters missing')

            filters = json.loads(filters)

            filtersList = []
            for f in filters:
                if f[0] == 'eventTypeName':
                    etype = api.getEventTypeByName(typeName=f[1])
                    if not etype:
                        raise Exception((_(u'No such eventType: %(eventType)s')  % {"eventType":f[1]}).encode("utf-8"))
                    filtersList.append(('eventTypeID', etype.id))
                else:
                    filtersList.append(tuple(f))

            rows = api.deleteEventsByFilter(filtersList)

            result['response'] = {'rows': rows}
            return result
        except Exception, e:
            log.error('Event delete Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, argNames=['notificationType'])
    @d.setPage(request, ['notificationType', 'member'])
    @d.trace(log, ['notificationType', 'member', 'pageNum', 'pageSize'])
    def getMyEvents(self, notificationType, member, pageNum, pageSize):
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            if notificationType == 'web':
                notificationTypes = notificationType.split(',')
                
                #Get artifact revision update, print generation related web notification
                webEventTypes = ['ARTIFACT_NEW_REVISION_AVAILABLE_WEB', 'ARTIFACT_FEEDBACK_COMMENTS_WEB', \
                                 'PRINT_GENERATION_SUCCESSFUL_WEB', 'PRINT_GENERATION_FAILED_WEB', 'CONCEPT_PRACTICE_INCOMPLETE_WEB', 
                                 ]
                notificationFilters = (('objectType', 'artifact'), ('objectType', 'artifactRevision'), ('frequency', 'ondemand'), ('type', 'web'), ('subscriberID', member.id))
                tx = utils.transaction(self.getFuncName())
                with tx as session:
                    from pylons import app_globals as g

                    eventTypeDict, eventTypeNameDict = g.getEventTypes(session=session)

                    groupIDs = [group.groupID for group in api._getMemberGroups(session, member.id) if group.groupID not in (1, 2)]
                    notifications = api._getNotificationsForGroupIDs(session, groupIDs, notificationTypes)
                    eventTypeIDs = list(set([n.eventTypeID for n in notifications]))
                    for id in eventTypeDict.keys():
                        if eventTypeDict[id] in webEventTypes:
                            notificationFilters = notificationFilters + tuple([('eventTypeID', id)])
                            if id not in eventTypeIDs:
                                eventTypeIDs.append(id)

                    artifactNotifications = api._getNotificationsByFilter(session, filters=notificationFilters)

                    filters = (('subscriberID', member.id), ('objectType', 'group'), ('objectType', 'artifact'), ('objectType', 'artifactRevision'))
                    filters = filters + tuple([('objectID', g) for g in groupIDs])
                    filters = filters + tuple([('objectID', n.objectID) for n in artifactNotifications])
                    filters = filters + tuple([('eventTypeID', e) for e in eventTypeIDs])
                    events = api._getEventsByFilters(session, filters=filters, pageNum=pageNum, pageSize=pageSize)

                    accessTime = api._getMemberAccessTime(session, memberID=member.id, objectType='inapp_notifications', objectID=0)
                    if accessTime:
                        filters = filters + (('since', accessTime.accessTime), )
                    newevents = api._getEventsByFilters(session, filters=filters, pageNum=1, pageSize=1, doCount=True, doCountOnly=True)

                    result['response']['new'] = newevents.getTotal()
                    result['response']['total'] = events.getTotal()
                    result['response']['offset'] = (pageNum-1)*pageSize
                    result['response']['since'] = accessTime.asDict()['accessTime'] if accessTime else None
                    result['response']['limit'] = len(events)
                    result['response']['events'] = [ x.asDict(getOwner=True) for x in events ]
            else:
                #TODO: Implement other notificationTypes
                result['response'] = 'Currently only supports web'
            return result
        except Exception, e:
            log.error('get events Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_EVENT, str(e))

    @d.jsonify()
    @d.trace(log)
    def createNotification(self):
        """
            Create a new notification. This API does not need authentication.
            A casual user should be able to subscribe to certain events like
            publishing of new editions for a book or related material for a book.

            Expected parameters:
                eventType: Name of the event type.
                type: Notification type ('email', 'text')
                objectID: Object id for which the notification exists (optional)
                objectType: Object type for the object id (optional, required if objectID is specified)

                One of the following is required:
                    address: Address to which the notification should be sent (optional)
                    subscriberID: member id of the user subscribing for the notification (optional)
                frequency: How often a notification should be sent ('once', 'instant', 'daily', 'weekly')
                            (optional - default 'once')
                ruleName: A rule name for rule-based notifications (optional)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=True)
        try:
            user = u.getImpersonatedMember(user)
            kwargs = {}
            eventType = request.params.get('eventType')
            if eventType:
                etype = api.getEventTypeByName(typeName=eventType)
                if not etype:
                    raise Exception((_(u'No such eventType: %(eventType)s')  % {"eventType":eventType}).encode("utf-8"))
                kwargs['eventTypeID'] = etype.id
            else:
                raise Exception((_(u'Event type must be specified.')).encode("utf-8"))

            kwargs['type'] = request.params.get('notificationType')
            if request.params.get('objectID'):
                kwargs['objectID'] = request.params['objectID']
                kwargs['objectType'] = request.params.get('objectType')
                if not kwargs['objectType']:
                    raise Exception((_(u'Must specify an objectType along with objectID')).encode("utf-8"))

            if request.params.has_key('address'):
                kwargs['address'] = request.params.get('address')
            if user.login != 'guest':
                kwargs['subscriberID'] = user.id
            if not kwargs.has_key('address') and not kwargs.has_key('subscriberID'):
                raise Exception((_(u'Either an address or subscriberID must be specified.')).encode("utf-8"))

            kwargs['groupID'] = request.params.get('groupID', None)
            kwargs['frequency'] = request.params.get('frequency', 'once')
            if eventType == 'PH_POST':
                notification = api.getUniqueNotification(eventTypeID=etype.id, subscriberID=user.id,
                        groupID=kwargs['groupID'], objectID=None, type='email')
                if notification:
                    kwargs['frequency'] = notification.asDict()['frequency']

            kwargs['copyTo'] = request.params.get('copyTo')
            kwargs['ruleID'] = None
            if request.params.get('ruleName'):
                rule = api.getNotificationRuleByName(name=request.params['ruleName'])
                if not rule:
                    raise Exception((_(u"No such rule by name: %(request.params['ruleName'])s")  % {"request.params['ruleName']":request.params['ruleName']}).encode("utf-8"))
                kwargs['ruleID'] = rule.id

            log.debug("createNotification: %s" % str(kwargs))
            notification = api.createNotification(**kwargs)
            result['response'] = notification.asDict()
            return result
        except Exception, e:
            log.error('Notification create Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def updateNotification(self):
        """
            Update an existing notification
            Parameters:
                id: Id of the notification to be updated

                All of the following parameters are optional - but at least one must be specified.
                Do not include the parameters that should be left unchanged.
                    eventType: Name of the event type to be associated with the notification
                    notificationType: Type of notification
                    objectID: id of the object associated with this notification 
                    objectType: Type of the object identified by objectID
                    address: Address where this notification should be sent.
                    frequency: Frequency of this notification
                    ruleName: Name of the rule if it should be added or changed
                    resetLastSent: A flag to reset the lastSent field to null. This will 
                        cause the notification to be resent
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=True)
        try:
            user = u.getImpersonatedMember(user)
            kwargs = {}
            id = request.params.get('id')
            if not id:
                raise Exception((_(u"Notification ID must be specified.")).encode("utf-8"))
            try:
                id = int(id)
            except ValueError:
                raise Exception((_(u"Notification ID must be numeric[%(id)s]." % {'id':id})).encode("utf-8"))

            notification = api.getNotificationByID(id=id)
            if not notification:
                raise Exception((_(u"No such notification: %(id)d")  % {"id":id}).encode("utf-8"))

            kwargs['id'] = notification.id
            if notification.subscriberID:
                u.checkOwner(user, notification.subscriberID, notification)

            eventType = request.params.get('eventType')
            if eventType:
                etype = api.getEventTypeByName(typeName=eventType)
                if not etype:
                    raise Exception((_(u'No such eventType: %(eventType)s')  % {"eventType":eventType}).encode("utf-8"))
                kwargs['eventTypeID'] = etype.id

            if request.params.has_key('notificationType'):
                kwargs['type'] = request.params.get('notificationType')

            if request.params.has_key('objectID'):
                kwargs['objectID'] = request.params['objectID']
                if kwargs['objectID']:
                    kwargs['objectID'] = kwargs['objectID']
            if request.params.has_key('objectType'):
                kwargs['objectType'] = request.params.get('objectType')

            if request.params.has_key('address'):
                kwargs['address'] = request.params.get('address')

            if request.params.get('frequency'):
                kwargs['frequency'] = request.params.get('frequency')

            if request.params.has_key('copyTo'):
                kwargs['copyTo'] = request.params.get('copyTo')
            if request.params.has_key('ruleName'):
                ruleID = None
                if request.params['ruleName']:
                    rule = api.getNotificationRuleByName(name=request.params['ruleName'])
                    if not rule:
                        raise Exception((_(u"No such notification rule: %(request.params['ruleName'])s")  % {"request.params['ruleName']":request.params['ruleName']}).encode("utf-8"))
                    ruleID = rule.id
                kwargs['ruleID'] = ruleID

            resetLastSent = str(request.params.get('resetLastSent')).lower() == 'true'
            kwargs['resetLastSent'] = resetLastSent

            notification = api.updateNotification(**kwargs)
            result['response'] = notification.asDict()
            return result
        except Exception, e:
            log.error('Notification update Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def deleteNotification(self):
        """
            Delete a notification based on id
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=True)
        try:
            id = request.params.get('id')
            if not id:
                raise Exception((_(u"Notification ID must be specified.")).encode("utf-8"))
            id = int(id)

            notification = api.getNotificationByID(id=id)
            if not notification:
                raise Exception((_(u"No such notification: %(id)d")  % {"id":id}).encode("utf-8"))

            if notification.subscriberID:
                u.checkOwner(user, notification.subscriberID, notification)

            api.deleteNotification(id=notification.id)
            return result
        except Exception, e:
            log.error('Notification delete Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id'])
    def getInfo(self, id):
        """
            Get information about a notification
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=True)
        try:
            id = int(id)
            notification = api.getNotificationByID(id=id)
            if not notification:
                raise Exception((_(u"No such notification: %(id)d")  % {"id":id}).encode("utf-8"))

            if notification.subscriberID and user.login != 'guest':
                u.checkOwner(user, notification.subscriberID, notification)
            result['response'] = notification.asDict()
            return result
        except Exception, e:
            log.error('No such notification Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request) 
    @d.trace(log, ['pageNum', 'pageSize'])
    def getEventTypes(self, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            eventTypes = api.getEventTypes(pageNum=pageNum, pageSize=pageSize)
            eventTypeDicts = []
            for eventType in eventTypes:
                eventTypeDicts.append(eventType.asDict())
            result['response']['total'] = eventTypes.getTotal()
            result['response']['limit'] = len(eventTypes)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['eventTypes'] = eventTypeDicts
            return result
        except Exception as e:
            log.error("No such event types Exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_EVENT_TYPE, str(e))

    @d.jsonify()
    @d.checkAuth(request, argNames=['typeName'])
    @d.trace(log, ['member','typeName'])
    def getEventTypeByName(self, member, typeName):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            eventType = api.getEventTypeByName(typeName)

            if eventType is None:
                raise Exception((_(u"No such event: %(eventType)s")  % {"eventType":typeName}).encode("utf-8"))

            result['response']['eventType'] = eventType.asDict()
            return result
        except Exception as e:
            log.error("No such event types Exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_EVENT_TYPE, str(e))

    @d.jsonify()
    @d.setPage(request) 
    @d.trace(log, ['pageNum', 'pageSize'])
    def getNotificationRules(self, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            rules = api.getNotificationRules(pageNum=pageNum, pageSize=pageSize)
            rulesDict = []
            for rule in rules:
                rulesDict.append(rule.asDict())
            result['response']['total'] = rules.getTotal()
            result['response']['limit'] = len(rules)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['notificationRules'] = rulesDict
            return result
        except Exception as e:
            log.error("No such notification rules Exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_NOTIFICATION_RULE, str(e))

    @d.jsonify()
    @d.trace(log, ['eventType', 'frequency', 'address'])
    def getMyNotification(self, eventType, frequency, address=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=True)
        try:
            eventTypeObj = api.getEventTypeByName(typeName=eventType)
            if not eventTypeObj:
                raise Exception((_(u'No such event type: %(eventType)s')  % {"eventType":eventType}).encode("utf-8"))

            objectID = request.params.get('objectID')
            if objectID:
                objectID = objectID
            objectType = request.params.get('objectType')
            if objectID and not objectType:
                raise Exception((_(u'objectType must accompany an objectID')).encode("utf-8"))
            notificationType = request.params.get('notificationType', 'email')

            #log.debug("User: %s" % user.login)
            if user.login == 'guest':
                subscriberID = None
                if not address:
                    raise Exception((_(u'User not logged in and address not specified')).encode("utf-8"))
            else:
                subscriberID = user.id

            notification = api.getUniqueNotification(eventTypeID=eventTypeObj.id,
                    subscriberID=subscriberID, type=notificationType, 
                    objectID=objectID, objectType=objectType,
                    address=address, groupID=None, frequency=frequency)

            if not notification:
                raise Exception((_(u'No notification for %(eventType)s, %(address)s, %(frequency)s')  % {"eventType":eventType,"address": address,"frequency": frequency}).encode("utf-8"))
            if notification.subscriberID:
                u.checkOwner(user, notification.subscriberID, notification)

            result['response'] = notification.asDict()
            return result
        except Exception, e:
            log.error('No such notification Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member'])
    @d.filterable(request, ['sort', 'member'], noformat=True)
    @d.setPage(request, ['member', 'sort', 'fq'])
    @d.trace(log, ['member', 'sort', 'fq', 'pageNum', 'pageSize'])
    def getEvents(self, member, fq, pageNum, pageSize, sort=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            events = api.getEventsByFilters(filters=fq, sort=sort, pageNum=pageNum, pageSize=pageSize)
            result['response']['total'] = events.getTotal()
            result['response']['offset'] = (pageNum-1)*pageSize
            result['response']['limit'] = len(events)
            result['response']['events'] = [ x.asDict() for x in events ]
            return result
        except Exception, e:
            log.error('get events Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_EVENT, str(e))

    @d.jsonify()
    @d.checkAuth(request, argNames=['typeName'])
    @d.sortable(request, ['member','typeName'])
    @d.filterable(request, ['member', 'typeName','sort'], noformat=True)
    @d.setPage(request, ['member', 'typeName', 'sort', 'fq'])
    @d.trace(log, ['member', 'typeName', 'pageNum', 'pageSize', 'fq', 'sort'])
    def getSelfNotificationsByEventType(self, member, typeName, pageNum, pageSize, fq, sort=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            eventType = api.getEventTypeByName(typeName)

            if eventType is None:
                raise ex.InvalidArgumentException((_(u'Invalid event type: %s.' % typeName)).encode("utf-8"))

            #
            # If no additional filters are provided then initialize fq
            #
            if not fq:
                fq = []
            #
            # get only member's own notification events
            #
            fq.append(('objectType','member'))
            fq.append(('objectID',member.id))
            fq.append(('eventTypeID', eventType.id))
            fq.append(('subscriberID', member.id))
            if sort is None:
                sort = 'lastSent,desc'

            notifications = api.getNotificationsByFilter(filters=fq, sort=sort, pageNum=pageNum, pageSize=pageSize)
            result['response']['total'] = notifications.getTotal()
            result['response']['offset'] = (pageNum-1)*pageSize
            result['response']['limit'] = len(notifications)
            result['response']['notifications'] = [ x.asDict() for x in notifications ]
            return result

        except ex.InvalidArgumentException, iae:
            log.debug('get: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            log.error('get self notifications Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_NOTIFICATION, str(e))

    @d.jsonify()
    @d.checkAuth(request, argNames=['eventID'])
    @d.trace(log, ['member', 'eventID'])
    def deleteEvent(self, member, eventID):
        try:
            event = api.getEventByID(eventID)
            if not event:
                raise Exception('No such event [%s]' % str(eventID))

            authorized = False
            if event.ownerID:
                if event.ownerID != member.id:
                    authorized = False
                    error_msg = 'Unauthorized operation, not owner.'
                else:
                    authorized = True

            if event.subscriberID:
                if event.subscriberID != member.id and not authorized:
                    authorized = False
                    error_msg = 'Unauthorized operation, not subscriber.'
                else:
                    authorized = True

            if not u.isMemberAdmin(member) and not authorized:
                authorized = False
                error_msg = 'Only administrator can call this API'
            else:
                authorized = True

            if not authorized:
                raise Exception(error_msg)

            api.deleteEventByID(eventID)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            return result
        except Exception, e:
            log.error('deleteEvent: Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_EVENT, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member'])
    @d.filterable(request, ['sort', 'member'], noformat=True)
    @d.setPage(request, ['member', 'sort', 'fq'])
    @d.trace(log, ['member', 'sort', 'fq', 'pageNum', 'pageSize'])
    def getNotifications(self, member, fq, pageNum, pageSize, sort=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            notifications = api.getNotificationsByFilter(filters=fq, sort=sort, pageNum=pageNum, pageSize=pageSize)
            result['response']['total'] = notifications.getTotal()
            result['response']['offset'] = (pageNum-1)*pageSize
            result['response']['limit'] = len(notifications)
            result['response']['notifications'] = [ x.asDict() for x in notifications ]
            return result
        except Exception, e:
            log.error('get notifications Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_NOTIFICATION, str(e))

    @d.jsonify()
    @d.trace(log, ['id'])
    def getMaintenanceNotification(self, id = None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            maintenanceNotifications = MaintenanceNotificationManager.get_notification()
            if id:
                idExists = False
                for maintenanceNotification in maintenanceNotifications:
                    if maintenanceNotification['id'] == id:
                        idExists = True
                        result['response'] = maintenanceNotification
                if not idExists:
                    raise Exception((_(u'No such Notification: %(nid)s')  % {"nid":id}).encode("utf-8"))
            else:
                result['response'] = maintenanceNotifications
            return result
        except Exception, e:
            log.error('get system maintenance notifications Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_NOTIFICATION, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def updateMaintenanceNotification(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            notifications = request.params.get('data', None)
            
            if not notifications:
                raise Exception((_(u'Missing Required Information')).encode("utf-8"))
            if isinstance(notifications, dict):
                notifications = [notifications]
            response = MaintenanceNotificationManager.update_notification_configuration(notifications)
            result['response'] = response
            return result
        except Exception, e:
            log.error('update system maintenance notifications Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_NOTIFICATION, str(e))
