import logging
from datetime import datetime
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class UserData(ValidationWrapper):

    def __init__(self, db, dc=True):
        self.db = db
        self.dc = dc
        self.required_fields = ['memberID', 'appName']
        self.field_dependecies = { 
                                    'memberID':{'type':int},
                                    'appName':{'type': str},
                              }

    def saveUserData(self, **kwargs):
        try:
            self.before_insert(**kwargs)

            log.info('kwargs: [%s]' %(kwargs))
            now = datetime.now()
            if not kwargs.get('updateTime'):
                kwargs['updateTime'] = now
            # Check collection to see if document already exists, update if true
            obj = self.db.AppUserData.find_one({'memberID':long(kwargs['memberID']), 'appName': kwargs['appName']})
            if obj:
                objectID = obj['_id']
                self.db.AppUserData.update({'_id':objectID},{'$set':kwargs})
            else:
                kwargs['creationTime'] = now
                objectID = self.db.AppUserData.insert(kwargs)
            return self.db.AppUserData.find_one({'_id':objectID})
        except Exception as e:
            log.error('Error saving AppUserData: %s' %(str(e)), exc_info=e)
            raise e
        return True

    def getUserData(self, memberID, appName):
        try:
            return self.db.AppUserData.find_one({'memberID': memberID, 'appName': appName})
        except Exception, e:
            log.error("Error getting AppUserData: %s" % str(e), exc_info=e)
            raise e

    def getUserDataForAllUsers(self, appName):
        try:
            return list(self.db.AppUserData.find({'appName': appName}))
        except Exception, e:
            log.error("Error getting AppUserData: %s" % str(e), exc_info=e)
            raise e
