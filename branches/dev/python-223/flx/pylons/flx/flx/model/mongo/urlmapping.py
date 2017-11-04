from datetime import datetime
from flx.model.mongo.validationwrapper import ValidationWrapper
from bson.objectid import ObjectId
from flx.model.mongo import page as p
import re

import logging
log = logging.getLogger(__name__)

class UrlMapping(ValidationWrapper):
    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['newUrl','oldUrl']
        self.right_now = datetime.now()
        
    """
        Store newUrl corresponding to oldUrl
    """
    def create(self, **kwargs):
        kwargs['created'] = self.right_now
        kwargs['updated'] = self.right_now
        self.before_insert(**kwargs)
        id = self.db.UrlMappings.insert(kwargs)
        return self.getByID(id)
        
    """
        Update newUrl corresponding to oldUrl
    """
    def update(self, **kwargs):
        query = {}
        query['oldUrl'] = kwargs['oldUrl']
        
        # Update
        self.db.UrlMappings.update(query, {'$set':{'newUrl': kwargs['newUrl'], 'updated': self.right_now}})
        return self.getByOldUrl(kwargs['oldUrl'])
                
    """
        Delete record corresponding to oldUrl 
    """
    def delete(self, oldUrl):
        self.db.UrlMappings.remove({'oldUrl': oldUrl})
               
    """
        Get newUrl based on oldUrl.
    """
    def getByOldUrl(self, oldUrl):
        urlMapInfo = self.db.UrlMappings.find_one({'oldUrl': oldUrl})
        # If no result found, then try to find with and without slash at the end of oldUrl 
        if not urlMapInfo:
            if not oldUrl.endswith("/"):
                urlMapInfo = self.db.UrlMappings.find_one({'oldUrl': "%s/" % oldUrl})
            else:
                urlMapInfo = self.db.UrlMappings.find_one({'oldUrl': oldUrl[:-1]})
        
        # Check for slash at the start of string
        if not urlMapInfo:
            if not oldUrl.startswith("/"):
                urlMapInfo = self.db.UrlMappings.find_one({'oldUrl': "/%s" % oldUrl})
            else:
                urlMapInfo = self.db.UrlMappings.find_one({'oldUrl': oldUrl[1:]})
        return urlMapInfo        
     
    """
        Get all the mapped urls.
    """
    def browseUrlMaps(self, pageNum=1, pageSize=10,sort=None, **kwargs):
        query = {}
        if kwargs.has_key('oldUrl') and kwargs['oldUrl']:
            query['oldUrl'] = re.compile(kwargs['oldUrl'], re.IGNORECASE)

        if kwargs.has_key('newUrl') and kwargs['newUrl']:
            query['newUrl'] = re.compile(kwargs['newUrl'], re.IGNORECASE)
        if sort:
            sort = self.validateSort(sort, sortableFields=['updated'])
            res = p.Page(self.db.UrlMappings, query, pageNum, pageSize,sort=sort)
            return res
        res = p.Page(self.db.UrlMappings, query, pageNum, pageSize)
        return res   
                   
    """
        Get the document of mapped url based on id. 
    """
    def getByID(self, id):
        return self.db.UrlMappings.find_one({'_id': ObjectId(str(id))})
            
