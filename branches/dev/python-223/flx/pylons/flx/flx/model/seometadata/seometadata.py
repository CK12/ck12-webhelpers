import logging
from datetime import datetime
import traceback
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class SeoMetaData(ValidationWrapper):

    def __init__(self, db, dc=True):
        self.db = db
        self.dc = dc
        self.required_fields = ['contentType','contentID','metadata']
        self.field_dependecies = { 
                                    'metadata':{'type':dict},
                                    'contentType': {'type':str},
                                    'contentID': {'type':str}
                              }

    """
        Create SEO metadata
    """
    def createSeoMetaData(self, **kwargs):
        try:
            global config
            self.before_insert(**kwargs)

            log.info('kwargs: [%s]' %(kwargs))
            kwargs['updateTime'] = datetime.now()
            # Check collection to see if document already exists, update if true
            objectID = self.db.SeoMetaData.find_one({'contentID':kwargs['contentID'],'contentType':kwargs['contentType']})
            if objectID:
                objectID = objectID['_id']
                self.db.SeoMetaData.update({'_id':objectID},{'$set':kwargs})
            else:
                kwargs['creationTime'] = datetime.now()
                objectID = self.db.SeoMetaData.insert(kwargs)
            return self.db.SeoMetaData.find_one({'_id':objectID})
        except Exception as e:
            log.error('Error creating SEO metadata: %s' %(str(e)))
            log.error(traceback.format_exc(e))
            raise e
        return True

    """
        Get SEO metadata
    """
    def getSeoMetaData(self, **kwargs):
        try:
            # Use url after checking for contentID and contentType
            error_contentID = True if (not kwargs.has_key('contentID') or not kwargs['contentID']) else False
            error_contentType = True if (not kwargs.has_key('contentType') or not kwargs['contentType']) else False
            if error_contentID and error_contentType and kwargs.has_key('url') and kwargs['url']:
                return self.db.SeoMetaData.find_one({'url':kwargs['url']})
            if error_contentID:
                raise Exception("Missing parameter contentID")
            if  error_contentType:
                raise Exception("Missing parameter contentType")
            return self.db.SeoMetaData.find_one({'contentID':kwargs['contentID'],'contentType':kwargs['contentType']})
        except Exception as e:
            log.error('Error getting SEO metadata: %s' %(str(e)))
            log.error(traceback.format_exc(e))
            return None
