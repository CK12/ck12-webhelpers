from flx.controllers.celerytasks.periodictask import PeriodicTask
from pylons.i18n.translation import _
from flx.model import api
from flx.model import model
import flx.lib.helpers as h
from flx.lib.remoteapi import RemoteAPI as remotecall

import logging
import os
import urllib
import time,random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
from jinja2 import Environment, FileSystemLoader
from xml.sax.saxutils import escape as html_escape
from datetime import datetime,timedelta
from dateutil import tz
from flx.model.mongo import user_devices
from flx.model.userdata import appuserdata
import copy
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)
templateEnv = None

EMAIL_SUBJECTS = {
    'ARTIFACT_REVISION_CREATED': 'New revision of materials available at ck12.org',
    'MEMBER_CREATED': 'Welcome to CK-12!',
    'PASSWORD_RESET_REQUESTED': 'CK-12 FlexBook System Password Reset',
    'PASSWORD_RESET_FOR_ACTIVATION': 'CK-12 FlexBook System Password Reset on User Activation',
    'ARTIFACT_RELATED_MATERIAL_ADDED': 'New materials available at ck12.org',
    'MEMBER_PROFILE_UPDATED': 'CK-12 User Information Updated',
    'MEMBER_PASSWORD_UPDATED': 'CK-12 User Password Updated',
    'PUBLISH_REQUEST': '[Publish Flexbook Request]',
    'PRINT_GENERATION_SUCCESSFUL': 'The %s for %s is ready!',
    'PRINT_GENERATION_FAILED': 'The %s generation for %s is unsuccessful!',
    'PRINT_GENERATION_SUCCESSFUL_PDF': 'The %s for %s is ready!',
    'PRINT_GENERATION_FAILED_PDF': 'The %s generation for %s is unsuccessful!',
    'PRINT_GENERATION_SUCCESSFUL_EPUB': 'The %s for %s is ready!',
    'PRINT_GENERATION_FAILED_EPUB': 'The %s generation for %s is unsuccessful!',
    'PRINT_GENERATION_SUCCESSFUL_MOBI': 'The %s for %s is ready!',
    'PRINT_GENERATION_FAILED_MOBI': 'The %s generation for %s is unsuccessful!',
    'MEMBER_FROM_TWITTER': 'Welcome to CK-12! Please continue to complete the signup process',
    'UNDERAGE_REGISTRATION_NOTIFICATION_PARENT': 'Help %s %s Register For CK-12',
    'QUESTION_APPROVED': 'Your question has been added into the exercise',
    'QUESTIONS_CONTRIBUTED': 'The list of questions contributed from %s to %s',
    'REPORT_QUESTION_ERROR': '[STATUS] Error report for a question in the exercise "%s"',
    'ASMT_REPORT_QUESTION_ERROR': '[STATUS] Error report for a question in the assessment',
    'ARTIFACT_PUBLISHED': 'Approval for your publish request',
    'ARTIFACT_PUBLISHED_INFORMATION': 'Artifact Published',
    'GROUP_SHARE': '[%s] %s has shared %s',
    'GROUP_MEMBER_JOINED': '%s has joined the %s group',
    'GROUP_MEMBER_ACTIVATED': 'Your request to join the %s group has been accepted',
    'GROUP_MEMBER_DECLINED': 'Your request to join the %s group has been declined',
    'GROUP_PH_POST': 'See the latest post in your CK-12 group!',
    'PH_POST': 'See the latest post in your CK-12 group!',
    'FORUM_PH_POST': 'A new %s has been posted on %s',
    'INVITE_MEMBER': "Here's %s's gift to you!",
    'GET_REAL_SUBMISSION': "Successful Submission for CK-12 Get Real Competition",
    'ASSIGNMENT_ASSIGNED': 'New Assignment: %s',
    'ASSIGNMENT_DELETED': 'Assignment Deleted: %s',
    'EXECUTIVE_EMAIL': "CK-12 Usage Statistics with eBook Store downloads",
    'ASMT_CONTRIBUTED_QUESTIONS': "Thank You for Your Contribution to CK-12",
    'ASMT_PAST_CONTRIBUTED_QUESTIONS': "Thank You for Your Contribution to CK-12",
    'ASMT_REJECTED_QUESTIONS': "Question Contributed to CK-12",
    'ASMT_PUBLISHED_QUESTIONS': "Question Contributed to CK-12",
    'ARTIFACT_NEW_REVISION_AVAILABLE': "%s Update from CK-12",
    'VERIFY_MEMBER': 'Verify your email address',
    'SIGNUP_UNDERAGE': 'Help %s Register for CK-12',
    'SEND_EMAIL': '%s',
    'ASMT_DELETE_QUESTION_REQUEST': '[STATUS] Request to delete a question in the practice',
    'ASMT_SUMMER_CHALLENGE_CONCEPTS_REMINDER': "[CK-12 BrainFlex] We miss you!",
    'ASMT_WEEKLY_SUMMER_CHALLENGE_REPORT': "[CK-12 BrainFlex] Weekly Progress Report",
    'INVITE_MEMBER_FORUM': '%s has invited you to follow %s',
    'INVITE_MEMBER_FORUM_ANONYMOUS': '%s: You have been invited to follow',
    'ASMT_SC_COACH_INVITATION': 'You were chosen to be a coach',
    'ASMT_SC_STUDENT_COACH_CONFIRMATION': 'Your coach has accepted!',
    'BOOK_FINALIZATION': 'Your book finalization result',
}

DIGEST_EMAIL_SUBJECTS = {
    '6hours': "Six Hourly Digest %s",
    '12hours': "Twelve Hourly Digest %s",
    'daily': "Daily Digest %s",
    'weekly': "Weekly Digest %s"
}

PRINT_GENERATION_STATUS = [
    'PRINT_GENERATION_SUCCESSFUL_PDF', 
    'PRINT_GENERATION_FAILED_PDF', 
    'PRINT_GENERATION_SUCCESSFUL_EPUB', 
    'PRINT_GENERATION_FAILED_EPUB', 
    'PRINT_GENERATION_SUCCESSFUL_MOBI',
    'PRINT_GENERATION_FAILED_MOBI', 
    'PRINT_GENERATION_SUCCESSFUL', 
    'PRINT_GENERATION_FAILED'
    ]

EXCLUDE_EMAIL_PATTERNS = [ '@partners.ck12.org', '@ignore.ck12.org', ]

class NotifierTask(PeriodicTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize PeriodicTask
        PeriodicTask.__init__(self, **kwargs)
        self.skipIfRunning = True
        self.maxWaitMinutes = 60
        self.routing_key = 'notifier'
        self.dir = os.path.join(self.config.get('flx_home'), 'flx', 'templates', self.config.get('instance'), 'email')
        self._loadTemplates()
        self.instant = 'true'

    def _loadTemplates(self):
        global templateEnv
        if not templateEnv:
            logger.info("Loading templates from: %s" % self.dir)
            templateEnv = Environment(loader=FileSystemLoader(self.dir))

class EmailNotifierTask(NotifierTask):

    TIMEZONE = 'America/Los_Angeles'

    def _getNextNotificationTime(self, notification):
        weekdays = {'mon': 0, 'tue': 1, 'wed': 2, 'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6}
        lastSent = notification.lastSent
        frequency = notification.frequency
        if lastSent:
            timezone = self.TIMEZONE
            if notification.subscriber is not None and notification.subscriber.timezone:
                timezone = notification.subscriber.timezone
            lastSent = h.convert_to_timezone(lastSent, self.TIMEZONE, timezone)
            if frequency == 'weekly':
                wd = weekdays['thu']
                if lastSent.weekday() == wd and lastSent.hour < 8:
                    return lastSent.replace(hour=8, minute=0, second=0)
                dt = h.next_weekday(lastSent, wd)
                return dt.replace(hour=8, minute=0, second=0)
            elif frequency == 'daily':
                dt = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                if lastSent > dt:
                    return dt + timedelta(days=1)
                return dt
            elif frequency == '12hours':
                dt1 = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                if lastSent < dt1:
                    return dt1
                dt2 = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)
                if lastSent < dt2:
                    return dt2
                return dt1 + timedelta(days=1)
            elif frequency == '6hours':
                dt1 = lastSent.replace(hour=2, minute=0, second=0, microsecond=0)
                if lastSent < dt1:
                    return dt1
                dt2 = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                if lastSent < dt2:
                    return dt2
                dt3 = lastSent.replace(hour=14, minute=0, second=0, microsecond=0)
                if lastSent < dt3:
                    return dt3
                dt4 = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)
                if lastSent < dt4:
                    return dt4
                return dt1 + timedelta(days=1)
        return None

    def _getPreviousNotificationTime(self, notification):
        lastSent = notification.lastSent
        frequency = notification.frequency        
        if lastSent:
            if frequency == 'daily':
                dt = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                if lastSent > dt:
                    return dt
                else:
                    lastSent = lastSent - timedelta(days=1)
                    lastSent = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                    return lastSent
            elif frequency == '12hours':
                dt1 = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                if lastSent < dt1:
                    lastSent = lastSent - timedelta(days=1)
                    lastSent = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)                    
                    return lastSent
                dt2 = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)
                if lastSent < dt2:
                    lastSent = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                    return lastSent
                else:
                    lastSent = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)
                    return lastSent                    
            elif frequency == '6hours':
                dt1 = lastSent.replace(hour=2, minute=0, second=0, microsecond=0)
                if lastSent < dt1:
                    lastSent = lastSent - timedelta(days=1)
                    lastSent = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)
                    return lastSent
                dt2 = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                if lastSent < dt2:
                    lastSent = lastSent.replace(hour=2, minute=0, second=0, microsecond=0)
                    return lastSent
                dt3 = lastSent.replace(hour=14, minute=0, second=0, microsecond=0)
                if lastSent < dt3:
                    lastSent = lastSent.replace(hour=8, minute=0, second=0, microsecond=0)
                    return lastSent
                dt4 = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)
                if lastSent < dt4:
                    lastSent = lastSent.replace(hour=14, minute=0, second=0, microsecond=0)
                    return lastSent
                else:
                    lastSent = lastSent.replace(hour=20, minute=0, second=0, microsecond=0)
                    return lastSent
            else:
                return None

    def _getAddresses(self, address):
        if address:
            try:
                address_list = json.loads(address)
            except:
                address_list = [address]
            return address_list
        return []

    def _processNotification(self, now, notification, events=None):
        getEvents = False
        processed = failed = 0
        ## Get last sent
        lastSent = notification.lastSent
        logger.info("Processing: Notification: %s" % (notification.asDict()))

        if notification.frequency == 'off':
            logger.info("User setting: OFF: notification: %s" % notification.asDict())
            return processed, failed

        if notification.frequency == 'ondemand':
            logger.info("Ignoring ondemand notification: %s" % notification.asDict())
            return processed, failed

        timezone = self.TIMEZONE
        if notification.subscriber is not None and notification.subscriber.timezone:
            timezone = notification.subscriber.timezone

        n_time = self._getNextNotificationTime(notification)
        if n_time is None:
            # lstSent was None. So notif was never sent. Set the next notif time to now.
            n_time = h.convert_to_timezone(now, self.TIMEZONE, timezone)

        # Always init user_time after setting n_time
        user_time = h.get_current_time_in_timezone(timezone)

        alreadyProcessed = False
        if user_time < n_time:
            alreadyProcessed = True
        if lastSent and notification.frequency == 'once':
            ## Only once notifications - already processed
            alreadyProcessed = True
        #elif lastSent and notification.frequency == 'instant' and lastSent >= notification.updated:
        #    alreadyProcessed = True

        if alreadyProcessed:
            logger.info("Notification already processed: %s" % notification.asDict())
            return processed, failed

        ## Else we process it
        if not events:
            getEvents = True

        pageNum = 1
        pageSize = 25
        emails = []
        getTypeForPhPost = api.getEventTypeByName(typeName='PH_POST')
        getype = api.getEventTypeByName(typeName='GROUP_PH_POST')

        if events or getEvents:
            if notification.groupID:
                if notification.eventType.name in ('GROUP_MEMBER_JOINED', 'GROUP_SHARE', 'ASSIGNMENT_ASSIGNED', 'ASSIGNMENT_DELETED', 'GROUP_PH_POST', 'PH_POST'):
                    logger.info('Processing notifications for groupID: %s subscriber %s' %(notification.groupID, notification.subscriber.email))
                    emails = [notification.subscriber.email]
                else:
                    if notification.address:
                        emails = self._getAddresses(notification.address)
            else:
                if notification.address:
                    emails = self._getAddresses(notification.address)
                if not emails and notification.subscriber:
                    emails = [notification.subscriber.email]

            logger.info("Sanitizing email list with exclude patterns. emails: %s" % str(emails))
            if emails:
                emails_sanitized = []
                for email in emails:
                    include = True
                    ## Prevent sending to undecryptable emails.
                    if '@' not in email:
                        logger.debug("Excluding email %s because it does not look like a valid email address." % (email))
                        include = False
                    for pat in EXCLUDE_EMAIL_PATTERNS:
                        if email.lower().endswith(pat.lower()):
                            include = False
                            logger.info("Excluding email %s because it matches with an exclude pattern: %s" % (email, pat))
                            break
                    if include: emails_sanitized.append(email)
                emails = emails_sanitized

            logger.info('Evaluating sending notifications to the following sanitized email IDs: %s' %(emails))
            if emails:
                while True:
                    if getEvents:
                        ## If events were passed in, we don't query
                        ## Force Digest E-mails for "PH_POST" Event Type to pick Events for "GROUP_PH_POST"
                        if notification.eventTypeID == getTypeForPhPost.id and notification.frequency.lower() not in ["instant","once"]:
                            notificationCopy = copy.deepcopy(notification)
                            setattr(notificationCopy, "eventTypeID", getype.id)
                            logger.info("Created a Notification Copy :: %s"%notificationCopy)
                            events = api.getEventsForNotification(notification=notificationCopy, since=notification.lastSent, pageNum=pageNum, pageSize=pageSize)                            
                            logger.info("Got events: %d for notification: %s" % (len(events), notification.id))
                        else:
                            events = api.getEventsForNotification(notification=notification, since=notification.lastSent, pageNum=pageNum, pageSize=pageSize)
                            logger.info("Got events: %d for notification: %s" % (len(events), notification.id))

                    ## Check the type of notification and see if we need to do any rule processing
                    if events and notification.rule:
                        evts = []
                        i = 0
                        while i < len(events):
                            evt = events[i]
                            if notification.rule.name == 'EXISTS_IN_LIBRARY':
                                skip = False
                                obj = self._getObjectForEvent(evt)
                                if not obj:
                                    skip = True
                                else:
                                    memberID = notification.subscriber.id
                                    ownerID = self._getOwnerIDForObject(obj)
                                    parentID = self._getParentIDForObject(obj)
                                    if ownerID == memberID:
                                        logger.info("Skipping event [%d] because it is for an object [%d, %s] already owned by the subscriber" % (evt.id, evt.objectID, evt.objectType))
                                        skip = True
                                    else:
                                        objectType = evt.objectType
                                        if evt.objectType == 'artifact':
                                            objectType = 'artifactRevision'
                                            objectID = obj.revisions[0].id
                                        elif evt.objectType == 'resource':
                                            objectType = 'resourceRevision'
                                            objectID = obj.revisions[0].id
                                        if objectType in ['artifactRevision', 'resourceRevision']:
                                            logger.info("ParentID: %s, objectType: %s, memberID: %s" % (parentID, objectType, memberID))
                                            ignoreTypes = ['concept', 'section']
                                            if obj.type.name in ignoreTypes:
                                                logger.info("Skipping event [%d] because it is for a type that we ignore: %s" % (evt.id, ignoreTypes))
                                                skip = True
                                            elif not api.getMemberLibraryObject(memberID=memberID, objectID=objectID, objectType=objectType) and not \
                                                    (parentID and api.getMemberLibraryObjectByParentID(objectType=objectType, parentID=parentID, memberID=memberID)):
                                                logger.info("Skipping event [%d] because it is not for an object that is in user's library" % evt.id)
                                                skip = True
                                if not skip:
                                    evts.append(evt)
                            else:
                                logger.warn("Do not know how to process rule: %s. Ignoring!" % notification.rule.name)
                            i += 1
                        events = evts
                    if not events:
                        break
                    try:
                        for eachEmail in emails:
                            self.sendEmail(eachEmail, events, notification, n_time)
                            kwargs = {'id': notification.id, 'lastSent': now}
                            notification = api.updateNotification(**kwargs)
                    except Exception, e:
                        failed += 1
                        logger.error('Error sending notification: %s' % str(e), exc_info=e)

                        ## Log the failure
                        evt = api.createEventForType(typeName='NOTIFICATION_SEND_FAILED',
                                objectID=notification.id, objectType='notification',
                                eventData='Error sending notification: %s' % str(e), processInstant=False)
                        h.processInstantNotifications(eventIDs=[evt.id], user=self.user, noWait=False)
                        break

                    processed += 1
                    pageNum += 1
                    if not getEvents:
                        ## No more pagination
                        break
            else:
                ## No valid contact email
                logger.warn("No valid email address on file for this notification: %d" % notification.id)
                if notification.frequency == 'once':
                    ## Set lastSent date to a time in far future.
                    endOfTime = now.replace(year=9999)
                    kwargs = {'id': notification.id, 'lastSent': endOfTime}
                    notification = api.updateNotification(**kwargs)
                    logger.info("Updating notification [%s] to lastSent[%s]" % (notification.id, notification.lastSent))
        return processed, failed

    def run(self, eventIDs=None, notificationIDs=None, **kwargs):
        logger.info("Arguments: %s" % kwargs)
        NotifierTask.run(self, **kwargs)
        logger.info("Event ids: %s, notificationIDs: %s" % (eventIDs, notificationIDs))

        ## Make sure we don't run, if already running/scheduled (only for beat-scheduled)
        if not eventIDs and self.isAlreadyRunning():
            return "Skipped"

        if eventIDs and notificationIDs and len(eventIDs) != len(notificationIDs):
            raise Exception((_(u'Number of eventIDs and notificationIDs should match %s %s' % (str(eventIDs), str(notificationIDs)))).encode("utf-8"))

        ## Get events later than last run
        processed = 0
        failed = 0
        now = datetime.now()
        #now = h.get_current_time_in_timezone(self.TIMEZONE)
        # default to pacific timezone

        paginate = True
        pageSize = 64
        pageNum = 1
        getype = api.getEventTypeByName(typeName='GROUP_PH_POST')
        getTypeForPhPost = api.getEventTypeByName(typeName='PH_POST')
        while True:
            notifications = []
            events = []
            if eventIDs:
                for i in range(0, len(eventIDs)):
                    eventID = eventIDs[i]
                    ## If an event is specified, use it (for instant notifications)
                    e = api.getEventByID(id=eventID)
                    if e:
                        if notificationIDs and notificationIDs[i]:
                            notification = api.getNotificationByID(id=notificationIDs[i])
                            if notification and notification.eventTypeID == e.eventTypeID:
                                notifications = [notification]
                                events.append((e, notifications))
                        elif e.objectType == 'group':
                            ## [Bug #53066] Do not include rows where email was sent after the last update date of the Notification
                            notifications = api.getNotificationsForEvent(event=e, frequencies=['instant', 'once']) ##, notSentSinceUpdate=True, onlyRecent=True)
                            if notifications:
                                events.append((e, notifications))
                                self.instant = 'true'
                paginate = False
            else:
                ## Else get notifications from DB (periodic processing) - do not get instant notifications
                notifications = api.getNotifications(notificationTypes=['email'], frequencies=['weekly', 'daily', '12hours', '6hours', 'once'], excludeOnceProcessed=True, pageNum=pageNum, pageSize=pageSize)
                self.instant = 'false'
                events.append((None, notifications))

            if not notifications:
                break

            for (evt, notifications) in events:
                for notification in notifications:
                    gn = None
                    if notification.eventType.name == 'PH_POST':
                        gn = api.getUniqueNotification(getype.id, notification.subscriber.id, 'email', groupID=notification.groupID, objectID=notification.groupID, objectType='group')
                    if gn:
                        logger.info('Ignoring: Notification %d [PH_POST] has GROUP_PH_POST %d' % (notification.id, gn.id))
                        continue

                    if notification.eventType.name == 'PH_POST' and notification.frequency == "instant":
                        gn = api.getUniqueNotification(getTypeForPhPost.id, notification.subscriber.id,
                         'email', groupID=notification.groupID, objectID=notification.groupID,
                          objectType='group')
                        if gn:
                            if gn.frequency != "instant":
                                logger.info('Ignoring: Notification %d [PH_POST] has PH_POST with different frequency, check notification - %d' % (notification.id, gn.id))
                                continue

                    #Bug 56888 : Check if member is part of the group before sending notification
                    if notification.eventType.name in ["GROUP_PH_POST","PH_POST"]:
                        kwargs = {"groupID":notification.groupID,"memberID":notification.subscriber.id}
                        isGroupMember = api.isGroupMember(**kwargs)
                        if not isGroupMember:
                            logger.info("Skipping: Subscriber: %d is not a member of group: %d"%(notification.subscriber.id,notification.groupID))
                            continue

                    evts = None
                    if evt:
                        evts = [evt]
                    p, f = self._processNotification(now, notification, events=evts)
                    processed += p
                    failed += f

            if not paginate:
                break

            pageNum += 1

        self.userdata = json.dumps({'at': str(now), 'processed': processed, 'failed': failed})
        logger.info("Processed %d notifications. Failed: %d" % (processed, failed))

    def preProcessHTMLContentForDigests(self, text):
        try:
            soup = BeautifulSoup(text)
            # Find all <p> tags in text
            soupPTags = soup.findAll("p")
            pStyleTagChange = "margin-top: 0px;"
            imgStyleTagChange = "height: 150px;"
            for pTag in soupPTags:
                pStyleTag = pTag.attrs.get("style", None)
                if pStyleTag is None:
                    pTag['style'] = pStyleTagChange
                else:
                    pStyleTag = pStyleTag.strip()
                    if pStyleTag.endswith(";"):
                        pStyleTag = pStyleTag + pStyleTagChange
                    else:
                        pStyleTag = pStyleTag + ";" + pStyleTagChange
                    pTag['style'] = pStyleTag

            soupImgTags = soup.findAll("img")
            for imgTag in soupImgTags:
                imgStyleTag = imgTag.attrs.get("style", None)
                if imgStyleTag is None:
                    imgTag['style'] = imgStyleTagChange
                else:
                    imgStyleTag = imgStyleTag.strip()
                    if imgStyleTag.endswith(";"):
                        imgStyleTag = imgStyleTag + imgStyleTagChange
                    else:
                        imgStyleTag = imgStyleTag + ";" + imgStyleTagChange
                    imgTag['style'] = imgStyleTag
            return soup.html.body.encode_contents()
        except Exception, e:
            logger.warn("Could not preprocess html content using bs4. error[%s]" % str(e))
            # Returning original text in case of an exception while pre-processing data
            return text

    def loadTemplates(self, notification):
        logger.info("Template dir: %s" % self.dir)
        try:
            if notification.eventType.name in ["GROUP_PH_POST", "PH_POST"] and notification.frequency not in ["instant","once"]:
                htmlName = '%s' % str(notification.eventType.name) + "_DIGEST.html"
                logger.info("Using Digests Template :: %s"%htmlName)
            else:
                htmlName = '%s.html' % notification.eventType.name
            
            #htmlName = '%s.html' % notification.eventType.name
            htmlTemplate = templateEnv.get_template(htmlName)
        except Exception, e:
            logger.warn("Could not find template: %s.html. Defaulting to basic.html. error[%s]" % (notification.eventType.name, str(e)))
            htmlTemplate = templateEnv.get_template('basic.html')

        try:
            txtName = '%s.txt' % notification.eventType.name
            txtTemplate = templateEnv.get_template(txtName)
        except Exception:
            logger.warn("Could not find template: %s.txt. Defaulting to basic.txt" % notification.eventType.name)
            txtTemplate = templateEnv.get_template('basic.txt')

        return htmlTemplate, txtTemplate

    def _getObjectForEvent(self, event):
        obj = None
        if event.objectID:
            if event.objectType == 'artifact':
                obj = api.getArtifactByID(id=int(event.objectID))
            elif event.objectType == 'artifactRevision':
                obj = api.getArtifactRevisionByID(id=int(event.objectID))
            elif event.objectType == 'resource':
                obj = api.getResourceByID(id=int(event.objectID))
            elif event.objectType == 'resourceRevision':
                obj = api.getResourceRevisionByID(id=int(event.objectID))
            elif event.objectType == 'notification':
                obj = api.getNotificationByID(id=str(event.objectID))
        return obj

    def _getOwnerIDForObject(self, obj):
        if type(obj) == model.Artifact:
            return obj.creatorID
        elif type(obj) == model.ArtifactRevision:
            return obj.artifact.creatorID
        elif type(obj) == model.Resource:
            return obj.ownerID
        elif type(obj) == model.ResourceRevision:
            return obj.resource.ownerID
        elif type(obj) == model.Notification:
            return obj.subscriberID
        return None

    def _getParentIDForObject(self, obj):
        if type(obj) == model.Artifact:
            return obj.id
        elif type(obj) == model.Resource:
            return obj.id
        elif type(obj) == model.ArtifactRevision:
            return obj.artifactID
        elif type(obj) == model.ResourceRevision:
            return obj.resourceID
        return None

    def sendEmail(self, to, events, notification, n_time):
        for pat in EXCLUDE_EMAIL_PATTERNS:
            if to.lower().endswith(pat.lower()):
                logger.info("Excluding %s because it matches with exclude pattern: %s" % (to, pat))
                return
        
        member = api.getMemberByEmail(email=to)
        if member:
            if member.stateID != 2:
                #
                #  Member not activated, don't send.
                #
                logger.debug('sendEmail: skip inactive member with email[%s]' % to)
                return

            # Check if email is in blocked emails list
            blockedDict = {'memberID': member.id,
                            'objectType': 'notifications',
                            'subObjectType' : 'email'}
            if api.getBlockedMemberByMemberID(**blockedDict):
                logger.info("Excluding %s because it matches with blocked member list" % to)
                return

        ccList = []
        if notification.copyTo:
            for ccItem in [ c.strip() for c in notification.copyTo.split(',') ]:
                if ccItem:
                    skip = False
                    for pat in EXCLUDE_EMAIL_PATTERNS:
                        if ccItem.lower().endswith(pat.lower()):
                            logger.info("Excluding Cc[%s] because it matches with exclude pattern: %s" % (ccItem, pat))
                            skip = True
                            break
                    if not skip: 
                        ccList.append(ccItem)
        logger.info("Cc list: [%s]" % ccList)

        fromAddr = self.config.get('email_from')
        smtpHost = self.config.get('smtp_server')
        # Create message container - the correct MIME type is multipart/alternative.
        msg = MIMEMultipart('alternative')

        getTypeForPhPost = api.getEventTypeByName(typeName='PH_POST')

        #msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name, 'FlexBook System Event notification')
        msg['From'] = fromAddr
        msg['To'] = to
        if ccList:
            msg['Cc'] = ','.join(ccList)
        if events and events[0].eventType.name in ['PUBLISH_REQUEST', 'SEND_EMAIL_FEEDBACK']:
            msg['Reply-To'] = events[0].owner.email

        htmlTemplate, txtTemplate = self.loadTemplates(notification)

        logger.info("Number of events: %d" % len(events))
        eventDicts = []
        for event in events:
            event.created = event.created.strftime('%Y-%m-%d %H:%M:%S')+' '+time.strftime('%Z')
            eDict = event.asDict()
            eDict['objectDict'] = {}
            if event.objectID:
                obj = self._getObjectForEvent(event)
                if obj:
                    if 'asDict' in dir(obj):
                        eDict['objectDict'] = obj.asDict()
                        if event.objectType == 'artifact':
                            if obj.type.modality:
                                perma = obj.getPerma(realmPos=1)
                                domain = obj.getDomain()
                                if domain:
                                    if domain.get('handle'):
                                        perma = '/' + domain.get('handle') + perma
                                    branchName = 'na'
                                    deid = '.'.join(domain.get('encodedID', 'UGC.UBR').split('.')[:2])
                                    logger.info("Domain EID: %s" % deid)
                                    if deid != 'UGC.UBR':
                                        term = api.getBrowseTermByEncodedID(encodedID=deid)
                                        if term and term.handle:
                                            branchName = term.handle.lower()
                                    perma = '/' + branchName + perma
                            else:
                                perma = obj.getPerma(realmPos=0)
                            eDict['objectDict']['perma'] = perma
                            logger.info("objectDict[perma]: %s" % eDict['objectDict']['perma'])
                            eDict['objectDict']['permaQualified'] = obj.getPerma(qualified=True, realmPos=0)
                    else:
                        logger.warn('Object %s of type %s does not implement "asDict()"' % (event.objectID, event.objectType))
            else:
                logger.info("No object associated with this event: %s [%s]" % (event.id, event.eventType.name))

            if eDict['eventData']:
                if eDict['typeName'] == 'ARTIFACT_RELATED_MATERIAL_ADDED':
                    ## data: type: and id:
                    newObj = api.getArtifactByID(id=int(eDict['eventData']['id']))
                    eDict['newObject'] = newObj.asDict()
            eventDicts.append(eDict)

        for event in eventDicts:
            logger.info("Event data (acessible via events[i].eventData): %s %s" % (type(event.get('eventData')).__name__, event.get('eventData')))
            if event.get('eventData') and type(event['eventData']).__name__ in ['str', 'unicode']:
                try:
                    event['eventData'] = json.loads(event['eventData'])
                except:
                    #
                    #  Not in Json format, leave it as is.
                    #
                    pass

        if notification.eventType.name  in PRINT_GENERATION_STATUS:
            printType = eventDicts[0]['eventData']['printType']
            title = eventDicts[0]['eventData']['title']
            member = api.getMemberByEmail(to)
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % (printType, title)
        elif (notification.eventType.name == 'QUESTION_APPROVED'):
            artifact =  api.getArtifactByEncodedID(encodedID=eventDicts[0]['eventData']['exerciseEncodedID'].replace('.X.','.C.'))
            if artifact:
                eventDicts[0]['eventData']['artifactPerma'] =  artifact.getPerma()
                eventDicts[0]['eventData']['artifactTitle'] =  artifact.getTitle()
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif (notification.eventType.name == 'REPORT_QUESTION_ERROR'):
            artifact =  api.getArtifactByEncodedID(encodedID=eventDicts[0]['eventData']['exerciseEncodedID'].replace('.X.','.C.'))
            if artifact:
                eventDicts[0]['eventData']['artifactPerma'] =  artifact.getPerma()
                eventDicts[0]['eventData']['artifactTitle'] =  artifact.getTitle()
            reportedUser = api.getMemberByEmail(eventDicts[0]['eventData']['email'])
            eventDicts[0]['eventData']['reportedUser'] =  reportedUser.name if reportedUser else 'CK-12 User'
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % (artifact.getTitle() if artifact else '')
        elif (notification.eventType.name == 'ASMT_REPORT_QUESTION_ERROR' or notification.eventType.name == 'ASMT_DELETE_QUESTION_REQUEST'): #or notification.eventType.name == 'ASMT_SUMMER_CHALLENGE_CONCEPTS_REMINDER'):
            reportedUser = api.getMemberByEmail(eventDicts[0]['eventData']['email'])
            eventDicts[0]['eventData']['reportedUser'] =  reportedUser.name if reportedUser else 'CK-12 User'
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif (notification.eventType.name == 'QUESTIONS_CONTRIBUTED'):
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % (eventDicts[0]['eventData']['timeline'][0], eventDicts[0]['eventData']['timeline'][1])
        elif (notification.eventType.name == 'GET_REAL_SUBMISSION'):
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif (notification.eventType.name == 'EXECUTIVE_EMAIL'):
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif notification.eventType.name == 'GROUP_SHARE':
            member = api.getMemberByEmail(to)
            if member.id == event['ownerID']:
                logger.info('\033[91m' + "Ignoring poster %d from group share notification %d \033[0m" % (member.id, notification.id))
                return
            owner = api.getMemberByID(id=event['ownerID'])
            if owner:
                ownerName = owner.name
            group = api.getGroupByID(id=notification.groupID)
            ## Check if group is not deleted
            if group:
                if notification.frequency in ('once', 'instant'):
                    ed = eventDicts[0]['eventData']
                    title = ''
                    if 'title' in ed:
                        title = ed['title']
                    else:
                        artifact = api.getArtifactByID(id=int(ed['id']))
                        title = artifact.asDict()['title']

                    msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) %(group.name, ownerName, title)
                    fromAddr = self.config.get('ck12_team_noreply_email')
                else:
                    msg['Subject'] = DIGEST_EMAIL_SUBJECTS.get(notification.frequency) % ('(Shared Resources) %s' % n_time.strftime('%B %d, %Y %H:%M %p %Z'))
                    fromAddr = '%s (Shared Resources)' % group.name.replace(' ', '-')
                del msg['From']
                msg['From'] = fromAddr

                for eventDict in eventDicts:
                    eventDict['sub'] = msg['Subject']
                    eventDict['eventData']['memberName'] = member.fix().name
                    eventDict['eventData']['groupID'] = group.id
                    eventDict['eventData']['groupName'] = group.name
                    eventDict['eventData']['groupImage'] = group.asDict()['resource']['uri']
                    eventDict['eventData']['groupEventOwner'] = ownerName
                    eventDict['eventData']['groupEventOwnerImage'] = self.config.get('web_prefix_url') + "/auth/member/image/" + str(owner.id)
                    if eventDict['eventData']['title'] is None:
                        artifact = api.getArtifactByID(id=int(eventDict['eventData']['id']))
                        title = artifact.asDict()['title']
                        eventDict['eventData']['title'] = title

        elif (notification.eventType.name == 'GROUP_MEMBER_JOINED'):
            group = api.getGroupByID(id=notification.groupID)
            ## Check if group is not deleted
            if group:
                new_group_member = api.getMemberByID(id=event['eventData']['new_member_id'])
                eventDicts[0]['eventData']['member'] = api.getMemberByID(id=event['eventData']['group_owner_id'])
                eventDicts[0]['eventData']['groupName'] = group.name
                eventDicts[0]['eventData']['group_type'] = group.groupType
                eventDicts[0]['eventData']['new_member_givenName'] = new_group_member.givenName
                eventDicts[0]['eventData']['new_member_surname'] = new_group_member.surname
                eventDicts[0]['eventData']['web_prefix'] = self.config.get('web_prefix_url')
                fromAddr = self.config.get('ck12_team_noreply_email')
                del msg['From']
                msg['From'] = fromAddr
                subject = EMAIL_SUBJECTS.get(notification.eventType.name)
                subject = subject.replace('group', 'discussion') if group.groupType in ['public-forum'] else subject
                msg['Subject'] =  subject %(new_group_member.givenName or 'New User', group.name)
        elif (notification.eventType.name == 'GROUP_MEMBER_ACTIVATED' or notification.eventType.name == 'GROUP_MEMBER_DECLINED'):
            group = api.getGroupByID(id=notification.groupID)
            ## Check if group is not deleted
            if group:
                eventDicts[0]['eventData']['groupName'] = group.name
                msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) %(group.name)
        elif notification.eventType.name in ('GROUP_PH_POST', 'PH_POST'):
            member = api.getMemberByEmail(to)
            owner = api.getMemberByID(id=event['ownerID'])
            group = api.getGroupByID(id=notification.groupID)
            ## Check if group is not deleted
            if group:
                if notification.frequency in ('once', 'instant'):
                    eventData = eventDicts[0]['eventData']

                    _post = eventData['post']

                    if member.id == _post['memberID']:
                        logger.info('\033[91m' + "Ignoring poster %d from peerhelp notification %d \033[0m" % (member.id, notification.id))
                        return

                    #_qID = _post['_id']
                    #_pID = _post['_id']
                    if eventData.has_key('question'):
                        _post = eventData['question']
                        #_qID = _post['_id']

                    #sub = h.smart_truncate(h.html_to_plaintext(_post['content']), int(self.config.get('peerhelp.subject_length')))
                    title = _post['content']
                    UUID = _post['UUID']

                    is_group = False
                    if UUID.startswith(self.config.get('peerhelp.uuid.group')):
                        is_group = True
                    else:
                        # Bug 18875
                        UUID = self.config.get('peerhelp.uuid.group') + str(notification.groupID)

                    pageURL = h.get_peer_help_backurl(UUID)
                    questionURL = pageURL
                    postURL = pageURL
                    '''
                    if pageURL:
                        questionURL = pageURL + _qID
                        postURL = pageURL + _pID
                    '''

                    isAnonymous = False
                    if eventData['post'].get('isAnonymous') == True:
                        isAnonymous = True

                    senderName = ''
                    ownerName = ''
                    if not isAnonymous:
                        if owner.name:
                            ownerName = owner.name
                        else:
                            ownerName = owner.givenName
                            if owner.surname:
                                ownerName = '%s %s.' % (ownerName, owner.surname[0])

                        senderName = ownerName
                    else:
                        ownerName = 'Anonymous'
                        if is_group:
                            senderName = self.config.get('peerhelp.anonymous_sender_group')
                        else:
                            senderName = self.config.get('peerhelp.anonymous_sender')

                    email_from = self.config.get('peerhelp.email_from')
                    clientID = eventData['post']['clientID']
                    action = 'c'
                    if eventData['post']['postType'] == 'question':
                        action = 'a'
                    pID = eventData['post']['_id']
                    if eventData['post']['postType'] == 'comment':
                        pID = eventData['post']['ancestorIDs'][-1]

                    e = email_from.split('@')

                    email_from = '%s+%s+p+%s+%s+%s@%s' % (e[0], clientID, action, pID, notification.groupID, e[1])
                    if is_group:
                        fromAddr = '%s (%s) <%s>' % (senderName, group.name.replace(' ', '-'), email_from)
                    else:
                        fromAddr = '%s <%s>' % (senderName, email_from)
                    del msg['From']

                    if group.groupType in ['public-forum']:
                        ownerName = owner.givenName
                        if (owner.surname).strip():
                            ownerName = '%s %s.' % (ownerName, ((owner.surname).strip())[0])

                        fromAddr =  self.config.get('ck12_team_noreply_email')

                    msg['From'] = fromAddr
                    if group.groupType not in ['public-forum']:
                        msg['Reply-To'] = email_from

                    ownerImg = self.config.get('web_prefix_url') + "/auth/media/auth/images/user_icon_2.png"
                    if not isAnonymous:
                        m = eventData.get('member')
                        if m:
                            iu = m.get('imageURL')
                            if iu:
                                ownerImg = iu

                    postTypes = {
                        'question': 'Question',
                        'comment': 'Comment',
                        'answer': 'Answer',
                        'response': 'Answer'
                    }
                    postType = postTypes[eventData['post']['postType']]

                    eventDicts[0]['eventData']['web_prefix'] = self.config.get('web_prefix_url')
                    eventDicts[0]['eventData']['isGroup'] = is_group
                    eventDicts[0]['eventData']['groupID'] = group.id
                    eventDicts[0]['eventData']['groupName'] = group.name
                    eventDicts[0]['eventData']['groupType'] = group.groupType
                    eventDicts[0]['eventData']['ownerName'] = ownerName
                    eventDicts[0]['eventData']['ownerImg'] = ownerImg
                    eventDicts[0]['eventData']['title'] = title
                    eventDicts[0]['eventData']['questionURL'] = questionURL
                    eventDicts[0]['eventData']['postURL'] = postURL
                    eventDicts[0]['eventData']['postType'] = postType.lower()
                    if group.groupType in ['public-forum']:
                        msg['Subject'] = EMAIL_SUBJECTS.get('FORUM_PH_POST') % (postType.lower(), group.name)
                    else:
                        msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
                else:
                    #Skip forums digest
                    #if group.groupType in ['public-forum']:
                    #    return

                    #TODO : Add more chars in list of chars to replace in from Address.
                    #fromAddr = '%s (Q&A)' % group.name.replace(' ', '-')
                    charsToReplace = [" ",":"]
                    replacement = "-"  
                    fromAddr = group.name
                    for char in charsToReplace:
                        fromAddr = fromAddr.replace(char,replacement)
                    fromAddr = fromAddr + " (Q&A)"

                    del msg['From']
                    msg['From'] = fromAddr

                    msg['Subject'] = DIGEST_EMAIL_SUBJECTS.get(notification.frequency) % ('(Q&A) %s' % n_time.strftime('%B %d, %Y %H:%M %p %Z'))

                    timezone = self.TIMEZONE
                    if notification.subscriber is not None and notification.subscriber.timezone:
                        timezone = notification.subscriber.timezone

                    user_time = h.get_current_time_in_timezone(timezone)
                    daysDifference = getattr(user_time - n_time,"days")                    
                    if daysDifference > 1:
                        logger.info("Info: More than one day difference between notification datetime and user's current datetime, \
                            need to get closest available notification time for user")
                        #Set current user datetime as lastSent datetime for notification 
                        #to calculate the closest notification date to show in email subject
                        updatedNotification = copy.deepcopy(notification)
                        setattr(updatedNotification, "lastSent", user_time)
                        n_time = self._getPreviousNotificationTime(updatedNotification)
                        if n_time is not None:
                            del msg['Subject']
                            msg['Subject'] = DIGEST_EMAIL_SUBJECTS.get(notification.frequency) % ('(Q&A) %s' % n_time.strftime('%B %d, %Y %H:%M %p %Z'))

                    #del msg['Subject']

                    newEventDicts = []
                    for eventDict in eventDicts:
                        eventData = eventDict['eventData']

                        _post = eventData['post']

                        if member.id == _post['memberID']:
                            logger.info('\033[91m' + "Ignoring poster %d from peerhelp notification %d \033[0m" % (member.id, notification.id))
                            continue

                        if eventData.has_key('question'):
                            _post = eventData['question']

                        #Check if its a Digest E-mail for PH-POST Event Type
                        _postID=_post["_id"]
                        if notification.eventTypeID == getTypeForPhPost.id and notification.frequency.lower() not in ["instant","once"]:
                            logger.info("Checking if subscriber should be notified of this Post in the email digests")
                            notificationFilters = []
                            notificationFilters.append(('subscriberID', notification.subscriber.id))
                            notificationFilters.append(('objectID', _postID))
                            notificationFilters.append(('eventTypeID', notification.eventTypeID))
                            notificationFilters.append(('groupID', notification.groupID))
                            notificationFilters.append(('objectType', 'ph_post'))
                            existingNotifications = api.getNotificationsByFilter(filters=notificationFilters).results
                            if len(existingNotifications)==0:
                                logger.info("Skipping : Subscriber %d should not be notified of this Post in the email digests"%notification.subscriber.id)
                                continue

                        title = _post['content'] # Use title till we figure out a way to shorten HTML strings
                        UUID = _post['UUID']

                        if not UUID.startswith(self.config.get('peerhelp.uuid.group')):
                            # Bug 18875
                            UUID = self.config.get('peerhelp.uuid.group') + str(notification.groupID)

                        pageURL = h.get_peer_help_backurl(UUID)
                        questionURL = pageURL
                        postURL = pageURL

                        isAnonymous = False
                        if eventData['post'].get('isAnonymous') == True:
                            isAnonymous = True

                        ownerName = ''
                        if not isAnonymous:
                            postOwner = eventData.get('member')
                            postOwner = api.getMemberByID(postOwner['memberID'])
                            if postOwner.name:
                                ownerName = postOwner.name
                            else:
                                ownerName = postOwner.givenName
                                if postOwner.surname:
                                    ownerName = '%s %s.' % (ownerName, postOwner.surname[0])
                        else:
                            ownerName = 'Anonymous'

                        ownerImg = self.config.get('web_prefix_url') + "/auth/media/auth/images/user_icon_2.png"
                        if not isAnonymous and eventData['member']['imageURL']:
                            ownerImg = eventData['member']['imageURL']

                        actionTypes = {
                            'question': 'asked',
                            'comment': 'commented',
                            'answer': 'answered',
                        }
                        action = actionTypes[eventData['post']['postType']]

                        postTypes = {
                        'question': 'Question',
                        'comment': 'Comment',
                        'answer': 'Answer',
                        'response': 'Answer'
                        }
                        postType = postTypes[eventData['post']['postType']]
                    
                        # Get Owner Name as per new E-mail Digests format.
                        # Only take the first letter of surname from owner name value in Cafe
                        if group.groupType in ['public-forum']:
                            ownerNameSplits = ownerName.split(" ")
                            if len(ownerNameSplits)>1:
                                surname = ownerNameSplits[-1]
                                surnameInitial = str(surname[0]).upper()
                                name = " ".join(ownerNameSplits[0:-1])
                                ownerName = name + " " +surnameInitial
                                logger.info("ownerName:: %s"%ownerName)
                        # End get owner Name

                        eventDict['eventData']['groupID'] = group.id
                        eventDict['eventData']['groupName'] = group.name
                        eventDict['eventData']['groupType'] = group.groupType
                        eventDict['eventData']['ownerName'] = ownerName
                        eventDict['eventData']['ownerImg'] = ownerImg
                        eventDict['eventData']['action'] = action
                        #eventDict['eventData']['title'] = title
                        eventDict['eventData']['title'] = self.preProcessHTMLContentForDigests(title)
                        eventDict['eventData']['questionURL'] = questionURL
                        eventDict['eventData']['postURL'] = postURL
                        eventDict['eventData']['postType'] = postType.lower()

                        eventDict['eventData']['post']['content'] = self.preProcessHTMLContentForDigests(eventDict['eventData']['post']['content'])
                        newEventDicts.append(eventDict)

                    if not newEventDicts:
                        logger.info('\033[91m' + "No events to be processed %d from peerhelp notification %d \033[0m" % (member.id, notification.id))
                        return
                    eventDicts = newEventDicts

                    # Compute subject Line as per new E-mail Digests format
                    #eventsLength = len(eventDicts)
                    #subscriber = notification.subscriber
                    #subscriberName = None
                    #if hasattr(subscriber,"name"):
                    #    subscriberName = subscriber.name

                    #if subscriberName is not None:
                    #    if len(subscriberName)==0:
                    #        if hasattr(subscriber,"givenName"):
                    #            subscriberName=subscriber.givenName
                    #if subscriberName is None:
                    #    if hasattr(subscriber,"givenName"):
                    #        subscriberName=subscriber.givenName

                    #if str(group.groupType).lower() == "public-forum":
                    #    subjectLineGroupType = "Cafe"
                    #if str(group.groupType).lower() == "class":
                    #    subjectLineGroupType = "Class Group"
                    #if str(group.groupType).lower() == "study":
                    #    subjectLineGroupType = "Study Group"

                    #if subscriberName is None:
                    #    subjectLine = "You have "+str(eventsLength)+" new posts on CK-12 "+str(group.name)+" "+subjectLineGroupType
                    #else:
                    #    subjectLine = str(subscriberName).split(" ")[0]+", you have "+str(eventsLength)+" new posts on CK-12 "+str(group.name)+" "+subjectLineGroupType
                    #msg['Subject'] = subjectLine
                    #logger.info("New Subject :: %s"%msg["Subject"])
                    # End compute subject Line

        elif (notification.eventType.name == 'ARTIFACT_PUBLISHED'):
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif (notification.eventType.name == 'ARTIFACT_PUBLISHED_INFORMATION'):
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif (notification.eventType.name == 'PASSWORD_RESET_FOR_ACTIVATION'):
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif notification.eventType.name == 'INVITE_MEMBER':
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % eventDicts[0]['eventData']['inviter']['name']
        elif notification.eventType.name == 'INVITE_MEMBER_FORUM':
            inviterName = eventDicts[0]['eventData']['inviter']['name']
            forumName = eventDicts[0]['eventData']['forum']['forumName']
            if inviterName:
                msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % (inviterName, forumName)
            else:
                msg['Subject'] = EMAIL_SUBJECTS.get('INVITE_MEMBER_FORUM_ANONYMOUS') % (forumName)
 
        elif notification.eventType.name == 'MEMBER_FROM_TWITTER' or notification.eventType.name == 'MEMBER_CREATED':
            if not notification.subscriber:
                notification.subscriber = api.getMemberByEmail(to)
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name)
        elif notification.eventType.name == 'UNDERAGE_REGISTRATION_NOTIFICATION_PARENT':
            eventDicts[0]['eventData']['web_prefix'] = self.config.get('web_prefix_url')
            fromAddr = self.config.get('ck12_support_email')
            del msg['From']
            msg['From'] = fromAddr
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) %(eventDicts[0]['eventData']['firstName'], eventDicts[0]['eventData']['lastName'])
        elif notification.eventType.name == 'ASSIGNMENT_ASSIGNED' or notification.eventType.name == 'ASSIGNMENT_DELETED':
            member = api.getMemberByEmail(to)
            owner = api.getMemberByID(id=event['ownerID'])
            group = api.getGroupByID(id=notification.groupID)
            ## Check if the group is not deleted
            if group:

                if group.creatorID == member.id:
                    logger.info('\033[91m' + "Ignoring poster %d from assignment assigned/deleted for leader [notification=%d] \033[0m" % (member.id, notification.id))
                    return

                if owner:
                    ownerName = html_escape(owner.name)
                eventDicts[0]['eventData']['memberName'] = html_escape(member.fix().name)

                if notification.frequency in ('once', 'instant'):
                    msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % eventDicts[0]['eventData']['assignment']
                    fromAddr = '%s (%s) <noreply@ck12.org>' % (eventDicts[0]['eventData']['creator'], eventDicts[0]['eventData']['group'])
                else:
                    msg['Subject'] = DIGEST_EMAIL_SUBJECTS.get(notification.frequency) % ('(Assignments) %s' % n_time.strftime('%B %d, %Y %H:%M %p %Z'))
                    fromAddr = '%s (Assignments)' % group.name.replace(' ', '-')
                del msg['From']
                msg['From'] = fromAddr.encode('utf-8')
        elif notification.eventType.name == 'ARTIFACT_NEW_REVISION_AVAILABLE':
            msg['subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % eventDicts[0]['eventData']['artifactTypeName'].replace('&#174;', '')
        elif notification.eventType.name == 'SIGNUP_UNDERAGE':
            msg['subject'] = EMAIL_SUBJECTS.get(notification.eventType.name) % eventDicts[0]['eventData']['name']
        elif notification.eventType.name.startswith('SEND_EMAIL') or notification.eventType.name == 'PREVIEW_EMAIL':
            msg['subject'] = EMAIL_SUBJECTS.get('SEND_EMAIL') % eventDicts[0]['eventData']['subject']
            fromAddr = eventDicts[0]['eventData']['sender'].encode('utf-8')
            fromName = eventDicts[0]['eventData']['senderName'].encode('utf-8')
            del msg['From']
            msg['From'] = '%s <%s>' % (fromName, fromAddr)
        else:
            msg['Subject'] = EMAIL_SUBJECTS.get(notification.eventType.name, 'FlexBook System Event notification')

        strings = {'events': eventDicts, 'member': notification.subscriber, 'site': self.config.get('web_prefix_url'), 
        'flxhost': self.config.get('flx_prefix_url'), 'h': h, 'instant':self.instant, 
        'notificationFrequency':str(notification.frequency).lower()}
        #Add the UTM URL information in the context.
        event = eventDicts[0] if eventDicts else {} 
        dataInfo = event.get('eventData', {})
        try:
            utm_url_info = self.getUTMUrlInfo(notification.eventType.name, dataInfo, notification.frequency)
        except:
            utm_url_info = None
        if utm_url_info:
            strings.update(utm_url_info)
        html = htmlTemplate.render(strings)
        logger.debug("HTML: %s" % html)
        text = txtTemplate.render(strings)
        logger.debug("Text: %s" % text)

        # Record the MIME types of both parts - text/plain and text/html.
        part1 = MIMEText(text.encode('utf-8'), 'plain', 'UTF-8')
        part2 = MIMEText(html.encode('utf-8'), 'html', 'UTF-8')

        # Attach parts into message container.
        # According to RFC 2046, the last part of a multipart message, in this case
        # the HTML message, is best and preferred.
        msg.attach(part1)
        msg.attach(part2)

        # Send the message via local SMTP server.
        logger.info("Connecting to: %s" % smtpHost)
        s = smtplib.SMTP(smtpHost, timeout=10)
        # sendmail function takes 3 arguments: sender's address, recipient's address
        # and message to send - here it is sent as one string.
        toList = [ to ]
        if ccList:
            toList.extend(ccList)
        logger.info("Sending email from[%s] to[%s] for events %d" % (fromAddr, toList, len(events)))
        logger.debug('Sending email msg[%s]' % msg.as_string())
        s.sendmail(fromAddr, toList, msg.as_string())
        s.quit()
        logger.info("Email sent to [%s] for events %d notification frequency: %s" % (toList, len(events), notification.frequency))

    def getUTMUrlInfo(self, eventType, info, frequency):
        """
        """
        utm_url_info = dict()
        utm_dict = dict()

        logger.debug("eventType: [%s], frequency: [%s], info: [%s] : " % (eventType, frequency, info))
        group_type = info.get('group_type', info.get('groupType', 'group'))
        if eventType == 'GROUP_MEMBER_JOINED':
            prefix = 'new_member_email_title_link'
            content = self.config.get('%s_utm_content' % prefix)
            source = self.config.get('%s_utm_source' % prefix)
            medium = self.config.get('%s_utm_medium' % prefix, self.config.get('default_email_utm_medium'))
            campaign = self.config.get('%s_utm_campaign' % prefix, self.config.get('default_email_utm_campaign'))
            content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
            source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
            utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
            utm_url = urllib.urlencode(utm_dict)
            utm_url_info['utm_new_memebr_title_link'] = utm_url

            prefix = 'new_member_email_see_who_joined_link'
            content = self.config.get('%s_utm_content' % prefix)
            source = self.config.get('%s_utm_source' % prefix)
            content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
            source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
            utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
            utm_url = urllib.urlencode(utm_dict)
            utm_url_info['utm_new_member_see_who_joined_link'] = utm_url
        elif eventType in ['GROUP_PH_POST', 'PH_POST']:
            if frequency in ['once', 'instant']:
                prefix = 'instant_email_title_link'
                content = self.config.get('%s_utm_content' % prefix)
                source = self.config.get('%s_utm_source' % prefix)
                medium = self.config.get('%s_utm_medium' % prefix, self.config.get('default_email_utm_medium'))
                campaign = self.config.get('%s_utm_campaign' % prefix, self.config.get('default_email_utm_campaign'))
                content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
                utm_url = urllib.urlencode(utm_dict)
                utm_url_info['utm_email_title_link'] = utm_url
                
                prefix = 'instant_email_question_link'
                content = self.config.get('%s_utm_content' % prefix)
                source = self.config.get('%s_utm_source' % prefix)
                content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
                utm_url = urllib.urlencode(utm_dict)
                utm_url_info['utm_email_question_link'] = utm_url

                prefix = 'instant_email_view_on_ck12_button'
                content = self.config.get('%s_utm_content' % prefix)
                source = self.config.get('%s_utm_source' % prefix)
                content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
                utm_url = urllib.urlencode(utm_dict)
                utm_url_info['utm_email_view_on_ck12_button'] = utm_url

                prefix = 'instant_email_view_on_ck12_link'
                content = self.config.get('%s_utm_content' % prefix)
                source = self.config.get('%s_utm_source' % prefix)
                content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
                utm_url = urllib.urlencode(utm_dict)
                utm_url_info['utm_email_view_on_ck12_link'] = utm_url

            else:
                DIGEST_EMAIL_UTM_FREQUECY = {
                    '6hours': "6h",
                    '12hours': "12h",
                    'daily': "24h",
                    'weekly': "7d"
                }
                prefix = 'digest_email_title_link'
                content = self.config.get('%s_utm_content' % prefix)
                source = self.config.get('%s_utm_source' % prefix)
                medium = self.config.get('%s_utm_medium' % prefix, self.config.get('default_email_utm_medium'))
                campaign = self.config.get('%s_utm_campaign' % prefix, self.config.get('default_email_utm_campaign'))
                content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('DIGEST_TYPE', DIGEST_EMAIL_UTM_FREQUECY.get(frequency))
                utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
                utm_url = urllib.urlencode(utm_dict)
                utm_url_info['utm_email_title_link'] = utm_url

                prefix = 'digest_email_read_more_link'
                content = self.config.get('%s_utm_content' % prefix)
                source = self.config.get('%s_utm_source' % prefix)
                content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('DIGEST_TYPE', DIGEST_EMAIL_UTM_FREQUECY.get(frequency))
                utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
                utm_url = urllib.urlencode(utm_dict)
                utm_url_info['utm_email_read_more_link'] = utm_url

                prefix = 'digest_email_view_on_ck12_link'
                content = self.config.get('%s_utm_content' % prefix)
                source = self.config.get('%s_utm_source' % prefix)
                content = content.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('GROUP_TYPE', 'group' if group_type in ['study', 'class'] else 'forum')
                source = source.replace('DIGEST_TYPE', DIGEST_EMAIL_UTM_FREQUECY.get(frequency))
                utm_dict = {'utm_content':content, 'utm_source':source, 'utm_medium':medium, 'utm_campaign':campaign}            
                utm_url = urllib.urlencode(utm_dict)
                utm_url_info['utm_email_view_on_ck12_link'] = utm_url

        logger.debug(utm_url_info)
        return utm_url_info

class QuickEmailNotifierTask(EmailNotifierTask):
    """
        QuickEmailNotifierTask - to process instant notifications "in-process"
        without having to schedule a task and wait for it to finish.
        Must be called with "apply()" method (see helpers.py for an example)
    """

    recordToDB = False

class PushNotifierTask(PeriodicTask):

    recordToDB = True

    def __init__(self, **kwargs):
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'notifier'
        self.minimum_app_version = 55540 #only the svn number 
        self.db = self.mongo_db

class AssignmentPushNotifierTask(PushNotifierTask):

    def run(self, *args, **kwargs):
        logger.info("Arguments1: %s" % kwargs)
        PushNotifierTask.run(self, **kwargs)

        ## Make sure we don't run, if already running/scheduled (only for beat-scheduled)
        if  self.isAlreadyRunning():
            return "Skipped"

        enablePush = True if str(self.config.get('enable_push_notifications', False)).lower() == 'true' else False
        enablePush = True
        if not enablePush:
            self.userdata = json.dumps({'pushedMembers': [], 'errors': ["Push notification is disabled by the server"]})
            logger.error("Push notification is disabled by the server, Stopping the task..")
            return
        localzone = tz.tzlocal()

        members = []
        emails = kwargs.get("emails")
        if emails:
            for each in emails:
                #mem = m.Member(self.db).getMemberByLoginOrEmail(each)
                mem = api.getMemberByEmail(each)
                if mem:
                    members.append(mem.id)
                else:
                    logger.error("No such user %s" % each)

        checkUserTime = True # Do not check the user timing if the emails explicitly given.

        #assessmentApiUrl = self.config.get('assessment_api_url')
        flxServerUrl  = self.config.get("flx_prefix_url")
        practiceAppCode  = self.config.get("ck12_practice_app_code", 'ck12app')

        #Config to send the push notification to dev app or production app in iOS
        useApnSandbox = kwargs.get("useApnSandbox", False) # Set this as false for production
        if emails and not members:
            ## If no valid emails were specified, skip the task - this is different than
            ## invoking the task without any emails (for all)
            raise Exception("No valid members found in the list: %s" % str(emails))

        if not members:
            members = user_devices.UserDevices(self.db).getDeviceUsers() #TODO: Filter by timzone itself.
        else:
            checkUserTime = False

        logger.error("Members %s" % members)
        pushedUsers = []
        users = []
        errors = []

        for memberID in members:
            try:
                if not memberID:
                    continue
                memberID = int(memberID)
                member = api.getMemberByID(id=memberID)
                if not member:
                    raise Exception("No such member with id %s" % memberID)
                member = member.asDict()
                memberID = str(member["id"])
                devices = user_devices.UserDevices(self.db).getDevicesForUser(member["id"])
                if not devices:
                    raise Exception("user has no devices to push the notification id:%s, email: %s" % (member["id"], member["email"]))

                inAppNotification = True
                ud = appuserdata.UserData(self.db).getUserData(memberID=member['id'], appName=practiceAppCode)
                if ud and ud.get("userdata"):
                    inAppNotification = ud.get("userdata").get("inAppNotification", True)

                logger.info("Allow inAppNotification? %s" % inAppNotification)
                if not inAppNotification:
                    raise Exception("user has disabled the push notification id:%s, email: %s" % (member["id"], member["email"]))
                
                userTimezone = None
                for each in devices:
                    if each.get('timezone'):
                        userTimezone = each['timezone']
                        break
                #if not userTimezone: # If not found, get the info from sc if exist.
                #     sc = member.get('summerChallenge')
                #     if sc and sc.get('timezone'):
                #         userTimezone = sc['timezone']
                if not userTimezone: # if it still not found, use palo alto timezone
                     userTimezone = 420

                client_timezone = userTimezone
                client_utcoffset = -1*(client_timezone)*60
                client_tz_object = tz.tzoffset(None, client_utcoffset)

                # Current time in server 
                now = datetime.now(localzone)
                client_now = now.astimezone(client_tz_object)
                client_hour = client_now.hour
                logger.error("Clients hour %s " % client_hour)
                # Run it between 7 am to 8 am client time.
                if(client_hour in [7,8]) or not checkUserTime:
                    member['timeZoneOffset'] = client_tz_object
                    member['timeNow'] = client_now
                    member['timeZone'] = client_timezone
                    users.append(member)
            except Exception,e:
                logger.error('Error processing the push notification for the user %s, Error %s' % (memberID, str(e)), exc_info=e)
                errors.append(str(memberID))

        total = len(users)
        logger.info('No.of members having morning time %s ' %(total))

        pageSize= 20
        pageNum = 0
        offset = 0

        while offset < total:
            selected =  users[offset:offset+pageSize]
            if not selected:
                logger.info("DONE")
                break
            memberIDs =[]
            for each in selected:
                memberIDs.append(each['id'])
            logger.info('Processing membedIDs %s ' %(memberIDs))
            dueIn = 72 # 3 days(including today)
            dueIn = dueIn - datetime.now().hour # substacting the hours already gone today
            assigments = getAssignmentsByDue(self.config, memberIDs, dueIn=dueIn)
            for memberID in assigments.keys():
                member = None
                for each in selected:
                    if int(each['id']) == int(memberID):
                       member = each
                       break
                userEmail = member['email']
                logger.info("Processing the assignments for the member  %s, %s" % (member['id'], userEmail))
                memberAssigns = assigments[memberID]
                logger.info("Member assignments \n %s" % (memberAssigns))
                noOfAssigns = len(memberAssigns)
                msg = None
                now = datetime.now(localzone)
                dueGroup = {}
                for assmt in memberAssigns:
                    due = assmt["due"]
                    due = due.rsplit("-",1)[0]
                    due_date = datetime.strptime(due, '%Y-%m-%dT%H:%M:%S')
                    due_date = due_date + timedelta(hours=23, minutes=59)
                    client_due_date = due_date.replace(tzinfo=member['timeZoneOffset']).astimezone(localzone)
                    dueDays = (client_due_date-now).days
                    logger.info("Assignment due days b/w %s and today(%s) is %s" %(client_due_date, now , dueDays))
                    if dueDays >= 0 : 
                        if not dueGroup.has_key(dueDays):
                            dueGroup[dueDays] = []
                        assmt['dueDate'] = due_date
                        dueGroup[dueDays].append(assmt)
                logger.info("Assignment by due dates \n %s" %(dueGroup))
                dueDayKeys = dueGroup.keys()
                dueDayKeys.sort(reverse=True) #send the least due at last
                badge = None
                pendingAssigments = getPendingAssignments(self.config, memberID=member['id'])
                if pendingAssigments and pendingAssigments.get('total'):
                    badge = pendingAssigments['total']
                    logger.info('Setting the badge value as %s' % str(badge))
                for dueDay in dueDayKeys:
                    assmts = dueGroup[dueDay]
                    noOfAssigns = len(assmts)
                    msg = None
                    action = '%s://assignment?assignmentPage=true' % practiceAppCode
                    if noOfAssigns == 1:
                        tmpt = 'Your assignment for "__class__" is due __day__'
                        assignment = assmts[0]
                        _groupName = assignment['groupName']
                        action = '%s://assignment?assignmentPage=true&assignmentId=%s' % (practiceAppCode, assignment['assignmentID'])
                        _day = getDayString(dueDay, assignment['dueDate'])
                        tmpt = tmpt.replace("__class__", _groupName)
                        msg = tmpt.replace("__day__", _day)
                    else:
                        tmpt = 'You have __count__ assignments __class__due __day__'
                        _day = getDayString(dueDay, assmts[0]['dueDate'])
                        _groupName = ""
                        sameClass = all(assmts[0]['groupID'] == item['groupID'] for item in assmts)
                        if sameClass:
                            _groupName = assmts[0]['groupName']
                            _groupName = 'for "%s" ' %(_groupName)
                        tmpt = tmpt.replace("__count__", str(noOfAssigns))
                        tmpt = tmpt.replace("__day__", _day)
                        msg = tmpt.replace("__class__", _groupName)
                    if msg:
                        payload = {"type":"ASSIGNMENT", "title":"CK-12 Assignments","message":msg, "action": action, "actionLabel":"Let's Go","dismissLabel":"Dismiss", "sound": None}
                        notID = random.randint(0,1000)
                        payload['notId']  = notID
                        payload = json.dumps(payload)
                        params = {}
                        params['to'] = userEmail
                        params['useApnSandbox'] = useApnSandbox # For iOS
                        params['deleteInvalidAPNTokens'] = True # For iOS
                        params['payload'] = payload
                        params['ttl']  = 20*60*60
                        params['collapse_key']  = notID
                        params['appCode']  = practiceAppCode
                        # send the push notification only to the devices which having assignment feature.  
                        params['minAppVersion']  = self.minimum_app_version
                        if badge:
                            params['badge'] = badge
                        try:
                            url = 'flx/pushNotification'
                            logger.info('Calling the push a notification api for the user %s with params %s' %(member['id'], params))
                            result = callApi(self.config, flxServerUrl, url, params, authUser=3)
                            pushedUsers.append({'email': userEmail, 'timezone': member['timeZone'], 'clientNow': str(member['timeNow'])})
                            logger.info(result)
                        except Exception,e:
                            error = 'Error calling the push notification api for the user %s, Error %s' % (userEmail, str(e))
                            errors.append(error)
                            logger.error(error, exc_info=e)
            pageNum = pageNum + 1
            offset = pageNum*pageSize

        self.userdata = json.dumps({'pushedMembers': pushedUsers, 'errors': errors})


def getDayString(dueDay, dueDate):
    _day = 'in %s days' %(dueDay)
    if dueDay == 0:
        _day = 'today'
    elif dueDay == 1:
        _day = 'tomorrow'
    elif dueDay == 2:
        _day = 'on %s' % (dueDate.strftime('%A'))
    return _day


def getAssignmentsByDue(config, memberIDs, dueIn=3):
    params = {}
    params['memberIDs'] = ','.join([str(mID) for mID in memberIDs])
    params['dueIn'] = dueIn
    flxServerUrl  = config.get("flx_prefix_url") #flx_core_api_server
    try:
        url = 'flx/get/incomplete/assignments'
        logger.error('url: %s' % url)
        logger.error('Calling the assigment api to find the assigments with nearest due dates %s' %(params))
        result = callApi(config, flxServerUrl, url, params, authUser=3)
        logger.error(result)
        return result["members"]
    except Exception,e:
        logger.error('Error calling the assignment api %s, Error %s' % (params, str(e)), exc_info=e)
    return {}

def getPendingAssignments(config, memberID):
    params = {}
    params['filters'] = 'state,upcoming'
    flxServerUrl  = config.get("flx_prefix_url") #flx_core_api_server
    try:
        url = 'flx/get/my/assignments'
        logger.error('url: %s' % url)
        logger.error('Calling the assigment api to find the pending assigments count %s' %(params))
        result = callApi(config, flxServerUrl, url, params, authUser=memberID, method='GET')
        return result
    except Exception,e:
        logger.error('Error calling the assignment api %s, Error %s' % (params, str(e)), exc_info=e)
    return {}

def callApi(config, server, url, params=None, authUser=None, returnResponse=False, method=None):
    if authUser:
        resp = remotecall.makeRemoteCallWithAuth(url, server, params_dict=params, ownerID=authUser, method=method)
    else:
        resp = remotecall.makeRemoteCall(url, server, params_dict=params, method=method)
    if returnResponse:
        return resp

    status = resp['responseHeader']['status']
    if status != 0:
        raise Exception('Failed to get the api response for the url %s %s' % (url, resp['response']))
    else:
        return resp['response']

def safe_encode(s):
    if s and type(s).__name__ == 'unicode':
        return s.encode('utf-8')
    return s
