import logging
import traceback
from datetime import datetime
from bson.objectid import ObjectId
from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.mongo.conceptnode import ConceptNode
from flx.model import exceptions as ex
from pylons.i18n.translation import _
from flx.model.mongo import page as p

log = logging.getLogger(__name__)


class RWE(ValidationWrapper):
    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['ownerID', 'simID', 'eids']
        self.field_dependencies = { }

    def create(self, **kwargs):
        self.before_insert(**kwargs)
        kwargs['created'] = datetime.now()
        kwargs['updated'] = datetime.now()
        id = self.db.Rwe.insert(kwargs)
        return self.getByID(id)
    
    def getByID(self, id):
        id = ObjectId(str(id))
        return self.db.Rwe.find_one(id)

    def update(self, id, **kwargs):
        id = ObjectId(str(id))
        kwargs['updated'] = datetime.now()
        rwe = self.getByID(id)
        if not rwe:
            raise ex.NotFoundException((_(u'RWE of id %s does not exist.' % id)).encode("utf-8"))
        self.db.Rwe.update(
                              { '_id': id },
                              { '$set': kwargs},
                           )
        return self.getByID(id)
    
    def remove(self, id, **kwargs):
        id = ObjectId(str(id))
        rwe = self.getByID(id)
        if not rwe:
            raise ex.NotFoundException((_(u'RWE of id %s does not exist.' % id)).encode("utf-8"))
        ownerID = rwe.get('ownerID')
        if ownerID:
            ownerID = int(ownerID)
        if ownerID != kwargs['ownerID'] and not kwargs['memberAdmin']:
            raise ex.UnauthorizedException((_(u'Only admin or creator can remove RWE record.')).encode("utf-8"))
        
        self.db.Rwe.remove({ '_id': id })
        return rwe
    
    def getRWE(self, pageNum=1, pageSize=10, **kwargs):
        try:
            error_simID = error_eids = False
            query = {}
            if kwargs.get('id'):
                query['_id'] = ObjectId(str(kwargs['id']))
            if kwargs.has_key('simID') and kwargs['simID']:
                query['simID'] = kwargs['simID']
            else:
                error_simID = True
                
            if kwargs.has_key('eids') and kwargs['eids']:
                query['eids'] = {"$in": kwargs['eids']}
            else:
                error_eids = True
                
            # Commented below code to get all RWEs, if params are empty in request
            #if error_simID and error_eids and not kwargs.get('id'):
                #raise Exception("Missing parameters simID/eids")
            
            if kwargs.has_key('ownedBy'):
                if kwargs['ownedBy'] == 'me':
                    query['ownerID'] = str(kwargs['userID'])
                elif kwargs['ownedBy'] == 'ck12':
                    query['ownerID'] = str(3)
                else:       # for 'community' case
                    query['ownerID'] = {'$nin': [3, kwargs['userID']]}
            res = p.Page(self.db.Rwe, query, pageNum, pageSize)
            return res
        except Exception as e:
            log.error('Error getting RWE data: %s' %(str(e)))
            log.error(traceback.format_exc(e))
            return None
