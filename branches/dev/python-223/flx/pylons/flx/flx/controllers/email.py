import json
import logging
import traceback
import datetime
import time

from base64 import b64decode
from pylons import request, config, session, tmpl_context as c
from pylons.i18n.translation import _ 

from flx.controllers import decorators as d
from flx.model import api, exceptions as ex, utils
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes
from jinja2 import Environment, FileSystemLoader
import os
import urllib, binascii

log = logging.getLogger(__name__)

templateEnv = None
templateDir = os.path.join(config.get('flx_home'), 'flx', 'templates', config.get('instance'), 'email')

class EmailController(BaseController):
    """
        Email related APIs.
    """
    EMAIL_QUOTA_ENABLED = config.get('EMAIL_QUOTA_ENABLED', '0')
    HOURLY_EMAIL_QUOTA = config.get('HOURLY_EMAIL_QUOTA', 50)
    MAX_EMAIL_RECEIVERS = config.get('MAX_EMAIL_RECEIVERS', 30)

    def _loadTemplates(self):
        global templateEnv
        global templateDir
        log.debug("Loading templates from: %s" % templateDir)
        templateEnv = Environment(loader=FileSystemLoader(templateDir))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['member'])
    @d.trace(log, ['member'])
    def sendPreviewEmail(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            try:
                log.debug('sendPreviewEmail: params[%s]' % request.params)
                strg = request.params.get('data').encode('utf-8')
                data = b64decode(strg)
                params = json.loads(data)
            except Exception,e:
                log.exception(e)
                raise ex.InvalidArgumentException((_(u'Invalid request')).encode("utf-8"))

            purpose, types = self._getPurpose(params)
            log.debug('sendPreviewEmail: purpose[%s] types[%s]' % (purpose, types))

            log.debug('sendPreviewEmail: member[%s]' % member)
            memberID = member.id if member else None
            if member:
                realSenderName = member.fix().name
                realSenderEmail = member.email
            else:
                realSenderName = params.get('senderName', None)
                if not realSenderName:
                    raise ex.InvalidArgumentException((_(u'Required parameter, senderName, is missing')).encode("utf-8"))
                try:
                    realSenderName = urllib.unquote(binascii.a2b_base64(realSenderName))
                except Exception, parsee:
                    log.warn("Error unquoting: [%s]" % str(e), exc_info=parsee)
                realSenderEmail = params.get('senderEmail', None)
                if not realSenderEmail or not '@' in realSenderEmail:
                    raise ex.InvalidArgumentException((_(u'Required parameter, senderEmail, is missing')).encode("utf-8"))
            log.debug('send: realSenderName[%s],realSenderEmail[%s]' % (realSenderName, realSenderEmail) )

            receivers = params.get('receivers', '')
            if not receivers:
                raise ex.InvalidArgumentException((_(u'Required parameter, receivers, is missing')).encode("utf-8"))

            subject = params.get('subject', '')
            if not subject:
                if purpose not in ['app_link']:
                    raise ex.InvalidArgumentException((_(u'Required parameter, subject, is missing')).encode("utf-8"))

            body = params.get('body', '')
            if not body:
                if purpose not in ['app_link']:
                    raise ex.InvalidArgumentException((_(u'Required parameter, body, is missing')).encode("utf-8"))

            receiver_emails = set([ m.strip().lower() for m in receivers.split(',') ])
            # limit to MAX_EMAIL_RECEIVERS  in a single request
            if len(receiver_emails) > EmailController.MAX_EMAIL_RECEIVERS:
                return ErrorCodes().asDict(ErrorCodes.EMAIL_RECEIVERS_EXCEEDED, 'You can email maximum %s people at a time' % EmailController.MAX_EMAIL_RECEIVERS)

            sender = 'noreply@ck12.org'
            senderName = 'CK-12 Foundation'

            emailMessages = []
            tx = utils.transaction(self.getFuncName())
            with tx as txSession:
                if receiver_emails:
                    for receiver in receiver_emails:
                        data = {
                            'sender': sender,
                            'senderName': senderName,
                            'replyTo': sender,
                            'receiver': receiver,
                            'subject': subject,
                            'body': body,
                            'senderEmail': realSenderEmail,
                            'types': types,
                        }
                        log.debug('send: data%s' % data)
                        e = api._createEventForType(txSession, typeName='PREVIEW_EMAIL', objectID=None, objectType=None, eventData=json.dumps(data, default=h.toJson), ownerID=memberID, processInstant=False)
                        n = api._createNotification(txSession, eventTypeID=e.eventTypeID, objectID=None, objectType=None, address=receiver, subscriberID=memberID, type='email', frequency='instant')
            h.processInstantNotifications([e.id], notificationIDs=[n.id], user=memberID, noWait=False)
            emailMessages.append('Sent to %s from %s, %s' % (receiver, sender, senderName))

            result['response']['emails'] = emailMessages
            return result
        except ex.InvalidArgumentException, iae:
            log.debug('send: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            log.exception(e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True, [])
    def emailTemplatesForm(self, member):
        c.emailTemplates = [f for f in os.listdir(templateDir) if os.path.isfile(os.path.join(templateDir, f))]
        c.emailTemplates.remove('EMAIL_PREVIEW.html')
        c.emailTemplates = [template for template in c.emailTemplates if template.endswith('.html') and template != 'EMAIL_PREVIEW.html' ]
        #Sort eventTypes of name
        c.emailTemplates.sort()
        return render('/flx/email/EMAIL_PREVIEW.html')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['templateName'])
    def renderEmailTemplate(self, templateName=None, member=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            c.errorCode = ErrorCodes.OK
            params = dict(request.params)
            events = []
            isCustomTemplate = False
            global templateDir
            if not templateName:
                rawTemplateData = params.get('rawTemplate', None)
                log.info("Raw template data : %s" % rawTemplateData)
                if not rawTemplateData:
                    htmlTemplate = "Either templateName or template data is required"
                    result['response']  = {'preview' : htmlTemplate, 'html' : ''}
                    return result

                isCustomTemplate = True    

                templateName = h.getRandomString(6) + ".html"
                log.info("Custom template name : %s " % templateName)
                filePath = templateDir + "/" +  templateName

                h.saveContents(filePath, rawTemplateData);
                log.info("Custom template saved at : %s " % filePath)
                
            try:
                global templateEnv
                if not templateEnv:
                    self._loadTemplates()
                htmlTemplate = templateEnv.get_template("%s" % (templateName))
                log.debug("%s/%s" % (templateDir, templateName))
                
                sourceHandle = open("%s/%s" % (templateDir, templateName), 'r')
                rawTemplate = sourceHandle.read()
    
            except Exception, e:
                log.warn("Could not find template: %s. error[%s]" % (templateName, str(e)))
                htmlTemplate = "Could not find email template: %s. Error[%s]" % (templateName, str(e))
                result['response']  = {'preview' : htmlTemplate, 'html' : ''}
                return result
            finally:
                if isCustomTemplate:
                    os.remove(filePath)

            additionalParams = params.get('additionalParams', None)
            eventParams = params.get('eventParams', None)
            if eventParams:
                try:
                    eventParams = json.loads(eventParams);
                except Exception, e:
                    pass

            if not params.has_key('eventData'):
                newDict = {'objectDict': {}}
                newDict.update({'eventData': {}})
                newDict.update({'newObject': {}})
                events.append(newDict)
            else:
                try:
                    eventData = json.loads(params['eventData']);
                except Exception, e:
                    eventData = params['eventData']

                for event in eventData:
                    newDict = {'objectDict': event}
                    newDict.update({'eventData': event})
                    newDict.update({'newObject': event})
                    for param in eventParams:
                        newDict.update({param: eventParams[param]})
                    events.append(newDict)
            try:
                log.info("events : %s" % events)
                templateParams = {'events' : events, 'h': h}
                #If any additional params required for email tempalte
                if additionalParams:
                    try:
                        additionalParams = json.loads(additionalParams);
                    except Exception, e:
                        pass
                    for param in additionalParams:
                        if param == 'memberID':
                            m = api.getMember(id=int(additionalParams[param]))
                            templateParams.update({'member': m})
                            continue
                        templateParams.update({param: additionalParams[param]})
    
                log.info("Test Event data = %s" % templateParams)
                result['response'] = {'preview' : render(htmlTemplate, templateParams), 
                                      'html' : rawTemplate,
                                      'memberEmail' : member.email if member else ""
                                      }
            except Exception as e:
                log.error(traceback.format_exc())
                htmlTemplate = "Unable to render template: %s. Error[%s]" % (templateName, str(e))
                result['response']  = {'preview' : htmlTemplate, 'html' : rawTemplate}
            
            return result
            return result 
        except Exception, e:
            log.exception(e)
            c.errorCode = ErrorCodes.GENERIC_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
        
    def _getMemberIDs(self, groupIDs, member):
        if groupIDs and not member:
            raise ex.InvalidArgumentException((_(u'Parameter, groupIDs, is not supported')).encode("utf-8"))

        groupIDs = set([ g.strip() for g in groupIDs.split(',') ])
        if not groupIDs:
            raise ex.InvalidArgumentException((_(u'Parameter, groupIDs, is empty')).encode("utf-8"))

        for groupID in groupIDs:
            adminIDs = api.getMemberIDsForGroupIDs(groupIDs=[ groupID ], onlyAdmins=True)
            if not adminIDs or member.id not in adminIDs:
                raise ex.InvalidArgumentException((_(u'Group %s is invalid' % groupID)).encode("utf-8"))

        memberIDs = api.getMemberIDsForGroupIDs(groupIDs=groupIDs)
        return memberIDs

    def _process(self, purpose, types, receiver, memberID, realSenderName, realSenderEmail, title, body, params, emailMessages, skipUnsubscribed=True):
        if not receiver:
            return

        sender = 'noreply@ck12.org'

        tx = utils.transaction(self.getFuncName())
        with tx as txSession:
            created = False
            receiver = receiver.strip().lower()
            emailReceiver = api._getEmailReceiverByEmail(txSession, email=receiver)
            if emailReceiver:
                if skipUnsubscribed and emailReceiver.status == 'unsubscribed':
                    #
                    #  Don't send email but don't tell the sender either (in case of spamming).
                    #
                    emailMessages.append('Sent to %s from %s, %s' % (receiver, realSenderEmail, realSenderName))
                    return
            else:
                data = {
                    'email': receiver,
                    'status': 'active',
                }
                emailReceiver = api._createEmailReceiver(txSession, **data)
                created = True

            if not realSenderEmail:
                emailSender = None
            else:
                realSenderEmail = realSenderEmail.strip().lower()
                #log.debug('send: realSenderEmail[%s]' % realSenderEmail)
                emailSender = api._getEmailSenderByEmail(txSession, email=realSenderEmail)
                #log.debug('send: emailSender[%s]' % emailSender)
                if not emailSender:
                    data = {
                        'email': realSenderEmail,
                        'name': realSenderName,
                    }
                    emailSender = api._createEmailSender(txSession, **data)
                    created = True

            if created and emailSender:
                txSession.flush()

            subject = title
            if purpose == 'errorReport':
                subject = '%s has encountered %s' % (realSenderName, title.upper())
            elif purpose in ['share', 'summer', 'feedback', 'app_link']:
                if not emailSender:
                    #
                    #  Set unsigned in sender as guest user.
                    #
                    emailSender = api._getMemberByID(txSession, id=2)

                emailSharing = api._getEmailSharing(txSession, senderID=emailSender.id, receiverID=emailReceiver.id, emailType=purpose)
                if emailSharing:
                    emailSharing.count += 1
                    api._update(txSession, emailSharing)
                else:
                    data = {
                        'senderID': emailSender.id,
                        'receiverID': emailReceiver.id,
                        'emailType': purpose,
                        'count': 1,
                    }
                    log.debug('_process: data[%s]' % data)
                    emailSharing = api._createEmailSharing(txSession, **data)
                if purpose == 'feedback':
                    subject = '%s has provided feedback on %s' % (realSenderName, title.upper())
                elif purpose == 'share':
                    subject = '%s has shared %s with you' % (realSenderName, title.upper())
                elif purpose == 'app_link':
                    subject = 'CK-12 FlexBook app download link!'
            #else:
            #    raise ex.InvalidArgumentException((_(u'Purpose %s is invalid' % purpose)).encode("utf-8"))

            data = {
                'sender': sender,
                'senderName': 'CK-12 Foundation',
                'replyTo': sender,
                'receiver': receiver,
                'subject': subject,
                'body': body,
                'senderEmail': realSenderEmail,
                'types': types,
            }
            #log.debug('send: data%s' % data)
            if purpose:
                typeName='SEND_EMAIL_%s' % purpose.upper()
                if purpose in ['feedback']:
                    data['replyTo'] = realSenderEmail
            else:
                typeName='SEND_EMAIL'
                
            import hashlib

            hash = hashlib.md5(str(data).encode('utf8')).hexdigest()
            e = api._createEventForType(txSession, typeName=typeName, objectID=hash, objectType=typeName, eventData=json.dumps(data, default=h.toJson), ownerID=memberID, processInstant=False)
            n = api._createNotification(txSession, eventTypeID=e.eventTypeID, objectID=hash, objectType=typeName, address=receiver, subscriberID=memberID, type='email', frequency='instant')
        h.processInstantNotifications([e.id], notificationIDs=[n.id], user=memberID, noWait=False)
        emailMessages.append('Sent to %s from %s, %s' % (receiver, realSenderEmail, realSenderName))

    def _getPurpose(self, params):
        purpose = params.get('purpose', '')
        if not purpose:
            types = ''
        else:
            if ':' in purpose:
                purpose, types = purpose.split(':')
                types = [ t.strip() for t in types.split(',') ]
            else:
                types = ['fb']
            purpose = purpose.strip()
        return purpose, types

    @d.jsonify()
    @d.trace(log)
    def send(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            try:
                try:
                    strg = request.params.get('data').encode('utf-8')
                    data = b64decode(strg)
                    params = json.loads(data)
                except:
                    params = request.params
                #log.debug('send: params[%s]' % params)
            except Exception,e:
                log.exception(e)
                raise ex.InvalidArgumentException((_(u'Invalid request')).encode("utf-8"))

            purpose, types = self._getPurpose(params)

            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member else None
            if member:
                log.debug('send: member.id[%s]' % member.id)
                realSenderName = member.fix().name
                realSenderEmail = member.email
            else:
                realSenderName = params.get('senderName', None)
                if not realSenderName:
                    if purpose not in ['app_link']:
                        raise ex.InvalidArgumentException((_(u'Required parameter, senderName, is missing')).encode("utf-8"))
                if realSenderName:
                    try:
                        realSenderName = urllib.unquote(binascii.a2b_base64(realSenderName))
                    except Exception, parsee:
                        log.warn("Error unquoting: [%s]" % str(parsee), exc_info=parsee)
                realSenderEmail = params.get('senderEmail', None)
                if not realSenderEmail or not '@' in realSenderEmail:
                    if purpose not in ['app_link']:
                        raise ex.InvalidArgumentException((_(u'Required parameter, senderEmail, is missing')).encode("utf-8"))
            #log.debug('send: realSenderName[%s] realSenderEmail[%s]' % (realSenderName, realSenderEmail))

            groupIDs = params.get('groupIDs', '')

            receivers = params.get('receivers', '')
            if not receivers and not groupIDs:
                raise ex.InvalidArgumentException((_(u'Required parameter, receivers, is missing')).encode("utf-8"))

            title = params.get('subject', '')
            if not title:
                if purpose not in ['app_link']:
                    raise ex.InvalidArgumentException((_(u'Required parameter, subject, is missing')).encode("utf-8"))

                title = 'CK-12 FlexBook App download link!'

            body = params.get('body', '')
            if not body:
                if purpose not in ['app_link']:
                    raise ex.InvalidArgumentException((_(u'Required parameter, body, is missing')).encode("utf-8"))

            receiver_emails = set([ m.strip().lower() for m in receivers.split(',') ])
            validation_result = h.validate_email(email_ids=receiver_emails)
            if validation_result['success'] is False:
                return ErrorCodes().asDict(ErrorCodes.EMAIL_ADDRESS_INCORRECT, 'Incorrect E-mail Id(s) : %s'%validation_result["invalid_email_ids"])

            # limit to MAX_EMAIL_RECEIVERS  in a single request
            if len(receiver_emails) > EmailController.MAX_EMAIL_RECEIVERS:
                return ErrorCodes().asDict(ErrorCodes.EMAIL_RECEIVERS_EXCEEDED, 'You can email maximum %s people at a time' % EmailController.MAX_EMAIL_RECEIVERS)
            if EmailController.EMAIL_QUOTA_ENABLED == '1':
                current_time = time.mktime(datetime.datetime.now().timetuple())
                dexter_id = None
                if 'dexterjsVisitorID' in request.cookies:
                    dexter_id = request.cookies['dexterjsVisitorID']

                log.info('Checking email sending quota for user (user id:%s, dexterjsVisitorID: %s)' % (memberID, dexter_id) ) 
                log.info('Quota settings (HOURLY_EMAIL_QUOTA=%s, MAX_EMAIL_RECEIVERS=%s)' % (EmailController.HOURLY_EMAIL_QUOTA, EmailController.MAX_EMAIL_RECEIVERS) ) 

                #if the user has previously exceeded the email quota, don't allow sending
                #until 1 hour has lapsed
                if 'email_quota_exceeded' in session and session['email_quota_exceeded']:
                    exceeded_on = datetime.datetime.fromtimestamp(session['email_quota_exceeded'])
                    time_diff = current_time - time.mktime(exceeded_on.timetuple())
                    if time_diff < 60 * 60:
                        log.info('**************************')
                        log.info('WARNING!! Exceeded email quota user tried to send again')
                        log.info('User id: %s' % memberID)
                        log.info('Dexter id: %s' % dexter_id)
                        #log.info('Sender email: %s' % realSenderEmail)
                        #log.info('Receiver emails: %s' % receiver_emails)
                        log.info('SKIPPING SENDING OF EMAILS')
                        log.info('**************************')
                        return ErrorCodes().asDict(ErrorCodes.EMAIL_QUOTA_EXCEEDED, 'You have exceeded the number of people you can send email in an hour. Please try again after some time.')
                    else:
                        #its been more than 1 hour that the user exceeded the email quota, so reset it
                        session['email_quota_exceeded'] = None
                        session.save()
                
                # counter to keep track of any previous emails sent
                emails_sent = 0
                # get the number of emails the user has already sent in this session in the past hour
                # Stored in session as: {'<timestamp>': <count of emails sent>}
                if 'previous_emails' in session:
                    previous_emails = session['previous_emails']
                    log.info('previous_emails from session %s' % previous_emails )
                    # only count the emails in past hour
                    for t,email_count in previous_emails.items():
                        sent_on = datetime.datetime.fromtimestamp(t)
                        time_diff = current_time - time.mktime(sent_on.timetuple())
                        # if the entry is within an hour, count the emails sent
                        if time_diff < 60 * 60:
                            emails_sent += email_count
                        else:
                            # if it has been more than an hour, remove the entry 
                            previous_emails.pop(t)
                else:
                    previous_emails = {}

                log.info('previous_emails after validation %s' % previous_emails )
                log.info('emails_sent=%s' % emails_sent)
               
                # make sure emails_sent does not exceed the preset quota for a user in 1 hour 
                if (emails_sent + len(receiver_emails) ) > EmailController.HOURLY_EMAIL_QUOTA:
                    log.info('**************************')
                    log.info('WARNING!! User email quota exceeded')
                    log.info('User id: %s' % memberID)
                    log.info('Dexter id: %s' % dexter_id)
                    #log.info('Sender email: %s' % realSenderEmail)
                    log.info('Previous sent emails count: %s' % emails_sent)
                    log.info('Requested receivers: %s' % len(receiver_emails))
                    #log.info('Receiver emails: %s' % receiver_emails)
                    log.info('SKIPPING SENDING OF EMAILS')
                    log.info('**************************')
                    session['email_quota_exceeded_on'] = time.time()
                    session.save()
                    return ErrorCodes().asDict(ErrorCodes.EMAIL_QUOTA_EXCEEDED,'You have exceeded the number of people you can send email in an hour. Please try again after some time.' )

                previous_emails[time.time()] = len(receiver_emails)
                session['previous_emails'] = previous_emails
                session.save()
                log.info('Everything looks good, sending emails')

            emailMessages = []
            if groupIDs:
                memberIDs = self._getMemberIDs(groupIDs, member)
                if member:
                    try:
                        #
                        #  Remove self.
                        #
                        memberIDs.remove(member.id)
                    except ValueError:
                        pass
                groupEmails = api.getEmails(memberIDs)
                for receiver in groupEmails:
                    self._process(purpose, types, receiver, memberID, realSenderName, realSenderEmail, title, body, params, emailMessages, skipUnsubscribed=False)

                if receiver_emails:
                    #
                    #  Remove duplicate emails, if any.
                    #
                    groupEmailSet = set(groupEmails)
                    receiverSet = set(receiver_emails)
                    for receiver in receiverSet:
                        if receiver in groupEmailSet:
                            receiver_emails.remove(receiver)

            if receiver_emails:
                for receiver in receiver_emails:
                    self._process(purpose, types, receiver, memberID, realSenderName, realSenderEmail, title, body, params, emailMessages)

            result['response']['emails'] = emailMessages
            return result
        except ex.InvalidArgumentException, iae:
            log.debug('send: Invalid Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.INVALID_ARGUMENT
            return ErrorCodes().asDict(c.errorCode, str(iae))
        except Exception, e:
            log.exception(e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_EVENT
            return ErrorCodes().asDict(c.errorCode, str(e))
