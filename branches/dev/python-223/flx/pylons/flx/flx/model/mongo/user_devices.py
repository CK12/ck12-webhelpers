from flx.model.mongo.validationwrapper import ValidationWrapper
from datetime import datetime
from flx.model.mongo import page as p

import logging
import random

log = logging.getLogger(__name__)

class UserDevices(ValidationWrapper):
    def __init__(self, db, dc=False, settings=None):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.settings = settings
        self.required_fields = ['uuid','platform','version','model','pushIdentifier','created','updated']

    def getDevices(self,platform,pushIdentifier):
        where = {'pushIdentifier':pushIdentifier, 'platform':platform.lower()}
        return list(self.db.UserDevices.find(where))

    def createDevice(self,uuid,platform,version,model,pushIdentifier,loggedInUserID=None, timezone=None, appVersion=None, appCode=None):
        kwargs = {'created': datetime.now(),'updated': datetime.now(),
                  'uuid':uuid, 'platform':platform.lower(), 'version':version,
                  'model':model, 'pushIdentifier':pushIdentifier,'loggedInUserID':loggedInUserID, 'timezone': timezone, 'appVersion': appVersion, 'appCode': 'appCode'}
        if loggedInUserID:
            kwargs['loggedInUserID']= int(loggedInUserID)
        # Assigning an unique integer as identifier
        kwargs['identifier'] = random.randint(0,999999999)
        self.before_insert(**kwargs)
        id = self.db.UserDevices.insert(kwargs)
        return self.db.UserDevices.find_one(id)

    def registerUserDevice(self,uuid,platform,version,model,pushIdentifier,loggedInUserID, timezone=None, appVersion=None, appCode=None):
        devices = self.getDevices(platform,pushIdentifier)
        kwargs = {'uuid':uuid, 'version':version,
                'model':model,'updated':datetime.now(),'loggedInUserID':loggedInUserID, 'timezone': timezone, 'appVersion': appVersion, 'appCode': appCode}
        if loggedInUserID:
            kwargs['loggedInUserID']= int(loggedInUserID)
        if devices:
            for device in devices:
                self.db.UserDevices.update({'_id':device['_id']},{'$set':kwargs})
        else:
            self.createDevice(uuid,platform,version,model,pushIdentifier,loggedInUserID, timezone=timezone, appVersion = appVersion, appCode = appCode)
        devices = self.getDevices(platform,pushIdentifier)
        return devices

    def getDevicesForUser(self,loggedInUserID, appCode=None):
        if loggedInUserID:
            loggedInUserID = int(loggedInUserID)
            where = {'loggedInUserID':loggedInUserID}
            if appCode:
                where['appCode'] = appCode
            return list(self.db.UserDevices.find(where))
        else:
            return []
       

    def update(self, pushIdentifier, platform, kwargs):
        where = {'pushIdentifier':pushIdentifier, 'platform':platform.lower()}
        if kwargs:
            self.db.UserDevices.update(
                            where,
                            { '$set': kwargs },
                            )

    def delete(self, platform, pushIdentifiers=None, identifiers=None):
        query = {}
        if pushIdentifiers:
            query = {'pushIdentifier': { '$in': pushIdentifiers }, 'platform':platform.lower()}
        elif identifiers:    
            query = {'identifier': { '$in': identifiers }, 'platform':platform.lower()}
        else:
            return
        self.db.UserDevices.remove(query) 

    """
        Get all devices
    """
    def getAll(self, pageNum=0, pageSize=0, appCode=None):
        query = {}
        if appCode:
            query['appCode'] = appCode
        devices = p.Page(self.db.UserDevices, query, pageNum, pageSize)
        return devices

    """
        Get all device users.
    """
    def getDeviceUsers(self, appCode=None):
        query = {}
        if appCode:
            query['appCode'] = appCode
        return self.db.UserDevices.find(query).distinct('loggedInUserID')

