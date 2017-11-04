import json
import logging

from flx.controllers.celerytasks.generictask import GenericTask
from pylons.i18n.translation import _ 
from flx.lib.remoteapi import RemoteAPI
from flx.model import api
from datetime import datetime
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

class ContributedQuestionsNotifier(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.routing_key = "print"
        self.days = self.config.get('contributed_questions_notification_interval', 3)
        self.eventType = 'QUESTIONS_CONTRIBUTED' 
        self.notificationType = 'email'
        self.address = self.config.get('contributed_questions_notification_address', 'nobody@ck12.org')
        self.frequency = 'instant' 

    def run(self, **kwargs):

        GenericTask.run(self, **kwargs)
        try:
            questions = []
            eventData = {}

            params = {}
            params['filters'] = 'approvedBy,None'
            params['days'] = self.days
            params['modifyImgUrls'] = 'true'
            params['pageSize'] = 500  #TODO Need to send a seperate mail if the total questions exceeds the max pageSize

            declarativeQuestions = RemoteAPI.makeHomeworkpediaGetCall('/get/info/questions/declarative', params_dict=params )
            decQuestions = declarativeQuestions['response']['questions']
            [q.__setitem__('questionClass','declarative') for q in decQuestions]

            generativeQuestions = RemoteAPI.makeHomeworkpediaGetCall('/get/info/questions/generative', params_dict=params )
            genQuestions = generativeQuestions['response']['questions']
            [q.__setitem__('questionClass','declarative') for q in genQuestions]

            questions = decQuestions + genQuestions
            eventData['questions'] = questions
            tlTo = datetime.now()
            tlFrom = tlTo + relativedelta( days = -int(self.days))
            tlFrom = tlFrom.strftime("%a %d. %B %Y")
            tlTo   = tlTo.strftime("%a %d. %B %Y")
            eventData['timeline'] = (tlFrom, tlTo)
            eventData['days'] = self.days

            if len(questions) > 0:
                kwargs = {}
                logger.info("JSON: %s" % questions)
                etype = api.getEventTypeByName(typeName=self.eventType)
                kwargs['eventTypeID'] = etype.id
                kwargs['type'] = self.notificationType
                kwargs['address'] = self.address
                kwargs['frequency'] = self.frequency
                notification = api.createNotification(**kwargs)
                logger.info("JSON: %s" % notification)
                if notification:
                    event = api.createEventForType(typeName=self.eventType, eventData=json.dumps(eventData), processInstant=True, notificationID=notification.id)
                else:
                   raise Exception((_(u'Error creating notification')).encode("utf-8"))
            return 'Getting contributed questions completed successfully'
        except Exception as e:
            logger.error('Getting contributed questions failed: %s' %(e.__str__()))
            return 'Getting contributed questions failed: %s' %(e.__str__())
