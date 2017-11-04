import logging
from datetime import datetime
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class LMSUserData(ValidationWrapper):

    def __init__(self, db, dc=True):
        self.db = db
        self.dc = dc
        self.required_fields = ['memberID', 'lmsAppName']
        self.field_dependecies = { 
                                    'memberID':{'type':int},
                                    'lmsAppName':{'type': str},
                              }

    def saveLMSUserData(self, **kwargs):
        try:
            self.before_insert(**kwargs)

            log.info('kwargs: [%s]' %(kwargs))
            now = datetime.now()
            kwargs['updateTime'] = now
            # Check collection to see if document already exists, update if true
            obj = self.db.LMSUserData.find_one({'memberID':long(kwargs['memberID']), 'lmsAppName': kwargs['lmsAppName']})
            if obj:
                objectID = obj['_id']
                self.db.LMSUserData.update({'_id':objectID},{'$set':kwargs})
            else:
                kwargs['creationTime'] = now
                objectID = self.db.LMSUserData.insert(kwargs)
            return self.db.LMSUserData.find_one({'_id':objectID})
        except Exception as e:
            log.error('Error saving LMSUserData: %s' %(str(e)), exc_info=e)
            raise e
        return True

    def getLMSUserData(self, memberID, lmsAppName):
        try:
            return self.db.LMSUserData.find_one({'memberID': memberID, 'lmsAppName': lmsAppName})
        except Exception, e:
            log.error("Error getting LMSUserData: %s" % str(e), exc_info=e)
            raise e

