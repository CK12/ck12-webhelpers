from datetime import datetime
from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.mongo import getDB
from bson.objectid import ObjectId
from pylons import config

import logging
log = logging.getLogger(__name__)

class Oauth2AcessToken(ValidationWrapper):
    def __init__(self, dc=False):
	self.db = getDB(config)
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['memberID','accessToken','refreshToken','authTypeID','expires']
        self.right_now = datetime.now()
        
    """
        Create or update entry with memberID.
        Params are:   
            memberID
            accessToken
            refreshToken
            authTypeID
            expires
    """
    def create(self, **kwargs):
        returnResult = True
        if 'returnResult' in kwargs:
            returnResult = kwargs['returnResult']
        kwargs['updated'] = self.right_now
        self.before_insert(**kwargs)
        log.debug('create: kwargs [%s]'%kwargs)
        query = {'memberID': int(kwargs['memberID'])}
        #id = self.db.Oauth2AccessTokens.insert(kwargs)
        updateData = {'accessToken': kwargs['accessToken'], 'expires': kwargs['expires'], 'updated': self.right_now}
        # We may only get the refreshToken once during initial permission grant
        # Only update refreshToken if we have a new value and not remove or set to none.
        if kwargs['refreshToken']:
            updateData['refreshToken'] = kwargs['refreshToken']
        res = self.db.Oauth2AccessTokens.update( query, {'$set': updateData}, upsert=True)
        log.debug('create: response [%s]'%res)
        if res['updatedExisting'] == True:
            return "Updated existing entry for memberID: [%s]"%kwargs['memberID']
        if not res['updatedExisting'] and returnResult:
            return self.getByID(res['upserted'][0]['_id'])
        else:
            log.debug('create: collection id [%s]'%res['upserted']['_id'])
            return self.getByID(id)
        
    """
        Get access token by MemberID
    """
    def getAccessTokenByMemberID(self, memberID):
        accessToken = self.db.Oauth2AccessTokens.find_one({'memberID': int(memberID)})
        return accessToken        
     
    """
        Get the document based on id. 
    """
    def getByID(self, id):
        return self.db.Oauth2AccessTokens.find_one({'_id': ObjectId(str(id))})
            
