# Copyright 2007-2015 CK-12 Foundation
#
# All rights reserved
#
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Felix Nance
#
import logging
from pylons import config
from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model import exceptions as ex
import pymongo
from datetime import datetime as dt
from flx.model.mongo import page as p

log = logging.getLogger(__name__)

# Using this decorator to convert certain strings to numbers.
# - params is a list of keys to convert
def convert_to_number(params):
    def c2n_decorator(func):
        def func_wrapper(*args,**kwargs):
            log.debug( "CN: %s, AT: %s, Q: %s"%(kwargs['collectionName'],kwargs['auditType'],kwargs['query']))
            if kwargs.has_key('query') and kwargs['query']:
                for item in params:
                   if kwargs['query'].has_key(item):
                       kwargs['query'][item] = int(kwargs['query'][item])
            return func(*args,**kwargs)
        return func_wrapper
    return c2n_decorator

def _getConfig():
    global config
    if not config or not config.has_key('mongo_uri'):
        log.info("Initializing config ...")
        from flx.lib.helpers import load_pylons_config
        config = load_pylons_config()
    return config

class AuditTrail(ValidationWrapper):

    def __init__(self,dc=True, **kwargs):
        from flx.model.mongo import getDB

        config = _getConfig()
        self.db = getDB(config)
        #dc - dependency check flag
        self.dc = dc
        self.valid_collections = config['audit_trail_collection_names'].split(",")
        self.valid_audit_types = config['audit_trail_audit_types'].split(",")
        self.required_fields = ['memberID', 'auditType']
        self.field_dependecies = {
                                    'memberID':{'type':int},
                                    'auditType': {'type':str}
                              }
    #add check for collectionName
    def insertTrail(self, **kwargs):
        """
        Records the audit information and stores it in a mongodb database.
        Store all the information you will need to retry a request.
       
        collectionName - lmsRequests  ex. db.lmsRequests.find({})
 
        auditType - the name that will be use for the collection 
            ex. lti_grade_passback

        data - an object containing the information being inserted.
            ex. request_params - JSON Dumps for the request paramers
                assignmentID
                memberID
                scoreUrl
        """
        try:
            collectionName = kwargs['collectionName'] if kwargs.has_key('collectionName') else None
            data = kwargs['data'] if kwargs.has_key('data') else None
            if not collectionName:
                raise ex.MissingArgumentException('Required parameter collection name is missing.')
            if collectionName not in self.valid_collections:
                raise ex.InvalidArgumentException('Invalid collection name.')
            if not data:
                raise ex.MissingArgumentException('Required parameter data is missing.')

            # Before insert validates against self.required_fields
            self.before_insert(**data)
            if data['auditType'] not in self.valid_audit_types:
                raise ex.InvalidArgumentException('Invalid audit type.')
            if not data.has_key('creationTime'):
                data['creationTime'] = dt.utcnow()
            result = self.db[collectionName].insert(data)
        except Exception, e:
            log.error("Insert trail exception:  %s"%e,exc_info=e)
            raise e
        return True

    @convert_to_number(["score","memberID","artifactID","nonImpersonatedMemberID"])
    def getTrail(self, **kwargs):#collectionName, auditType, query=None):
        """
        Looks for an audit trail by collection name and audit type.
        Returns resluts sorted by creation time descending. 
        """
        try:
            collectionName = kwargs.get('collectionName', None)
            auditType = kwargs.get('auditType', None)
            query = kwargs.get('query', None)
            pageNum = kwargs.get('pageNum', 1)
            pageSize = kwargs.get('pageSize', 20)

            if not collectionName:
                raise ex.MissingArgumentException('Required parameter collection name is missing.')
            if collectionName not in self.valid_collections:
                raise ex.InvalidArgumentException('Invalid collection name.')
            if not auditType:
                raise ex.MissingArgumentException('Required parameter audit type is missing.')
            if auditType not in self.valid_audit_types:
                raise ex.InvalidArgumentException('Invalid audit type.')
            # If no query is given, get all results for the auditType
            if not query:
                query = {'auditType' : auditType} 
            log.debug("Query [%s]"%query)
            sort = self.validateSort('_id,desc', sortableFields=['_id','creationTime'])
            result = p.Page(self.db[collectionName], query, pageNum, pageSize, sort=sort)
            return result
        except Exception, e:
            log.error("Get trail exception:  %s"%e,exc_info=e)
            raise e
