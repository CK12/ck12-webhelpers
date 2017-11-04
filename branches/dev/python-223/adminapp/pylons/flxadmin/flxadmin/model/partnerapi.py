#
# Copyright 2007-2011 CK-12 Foundation
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
# This file originally written by Girish Vispute
#
# $Id: $

from flxadmin.lib.ck12.exceptions import RemoteAPIStatusException
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib import helpers as h
import logging
import json

log = logging.getLogger(__name__)

class PartnerapiManager(object):

    @staticmethod
    def getAPIResponse(response=None):
        data = None
        try:
            data = response.read()
            data = json.loads( data )
        except Exception,e:
            log.info(e)
        return data

    @staticmethod
    def getAllPartnerApplications(params=None):
        """
        retrieve all applications.
        """
        api_endpoint = "application"
        
        try:
            params_str = None
            if params.has_key('pageSize') and params.has_key('pageNum'):
                params_str = "results_per_page=%s&page=%s" % (params['pageSize'],params['pageNum'])
            response = RemoteAPI.makePartnerAPIGetCall(api_endpoint,params_dict=params_str,raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception getting all applications : Exception = %s" % (ex))
        except Exception, ex:
            log.info("Exception getting all applications : Exception = %s" % (ex))
        return None

    @staticmethod
    def getApplicationByID(ID):
        """
        retrieve application by id.
        """
        api_endpoint = "application/%s" % ID
        try:
            response = RemoteAPI.makePartnerAPIGetCall(api_endpoint,raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception getting application for ID = (%s) : Exception = %s" % (ID,ex))
        except Exception, ex:
            log.info("Exception getting application for ID = (%s) : Exception = %s" % (ID,ex))
        return None

    @staticmethod
    def updateApplication(ID,params):
        """
            update the application paths using application ID.
        """
        api_endpoint = "application"
        try:
            api_endpoint = "%s/%s" %(api_endpoint,ID)
            response = RemoteAPI.makePartnerAPICall(api_endpoint,params_dict=params,method="PUT",raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception updating application for ID = (%s),  Exception = %s" % (ID,ex))
        except Exception, ex:
            msg = ''.join(ex.readlines())
            log.info("Exception updating application for ID = (%s),  Exception = %s" % (ID,msg))
            return json.loads(msg) 
        return None

    @staticmethod
    def isApplicationExist(name):
        """
            Return True if application is already exist
            else False
        """
        try:
            filters = [dict(name='name', op='eq', val=name)]
            params = json.dumps(dict(filters=filters))
            api_endpoint = "application"
            params = str(params).replace("\"","%22").replace("'","%22").replace(" ","%20")
            params="q=%s" %(params)
            response = RemoteAPI.makePartnerAPIGetCall(api_endpoint,params_dict=params, raw_response=True)
            response = PartnerapiManager.getAPIResponse(response)
            if response['num_results'] > 0 :
                return True
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception getting path for name = (%s) : Exception = %s" % (path,ex))
        except Exception, ex:
            log.info("Exception getting path for name = (%s) : Exception = %s" % (path,ex))
        return False

    @staticmethod
    def createNewApplication(params):
        """
            create new partner application.
        """
        try:
            api_endpoint = "application"
            params = json.loads(params)
            if not params.has_key('hash'):
                params['hash'] = h._generateHash(params['name'])
            params = json.dumps(params)
            response = RemoteAPI.makePartnerAPICall(api_endpoint,params_dict=params,method="POST",raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception %s" % str(ex))
        except Exception as ex:
            msg = ''.join(ex.readlines())
            log.info("Exception creating new application - %s" % msg)
            return json.loads(msg) 
        return None

    @staticmethod
    def getAllAPIPaths():
        """
        retrieve all paths.
        """
        api_endpoint = "path"
        try:
            response = RemoteAPI.makePartnerAPIGetCall(api_endpoint, raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception getting all paths : Exception = %s" % (ex))
        except Exception, ex:
            log.info("Exception getting all paths : Exception = %s" % (ex))
        return None

    @staticmethod
    def getPathByID(ID):
        """
        retrieve path by id.
        """
        api_endpoint = "path/%s" % ID
        try:
            response = RemoteAPI.makePartnerAPIGetCall(api_endpoint,raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception getting path for ID = (%s) : Exception = %s" % (ID,ex))
        except Exception, ex:
            log.info("Exception getting path for ID = (%s) : Exception = %s" % (ID,ex))
        return None

    @staticmethod
    def isPathExist(path):
        """
            Return True if path is already exist
            else False
        """
        try:
            filters = [dict(name='mask', op='eq', val=path)]
            params = json.dumps(dict(filters=filters))
            api_endpoint = "path"
            params = str(params).replace("\"","%22").replace("'","%22").replace(" ","%20")
            params="q=%s" %(params)
            response = RemoteAPI.makePartnerAPIGetCall(api_endpoint,params_dict=params, raw_response=True)
            response = PartnerapiManager.getAPIResponse(response)
            if response['num_results'] > 0 :
                return True
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception getting path for name = (%s) : Exception = %s" % (path,ex))
        except Exception, ex:
            log.info("Exception getting path for name = (%s) : Exception = %s" % (path,ex))
        return False
    
    @staticmethod
    def createNewPath(params):
        """
            create new path.
        """
        try:
            api_endpoint = "path"
            response = RemoteAPI.makePartnerAPICall(api_endpoint,params_dict=params,method="POST",raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception %s" %ex)
        except Exception, ex:
            msg = ''.join(ex.readlines())
            log.info("Exception creating new path %s" %msg)
            return json.loads(msg) 
        return None

    @staticmethod
    def deleteByID(api_endpoint,ID):
        """
            Delete partner application/path using ID
        """
        api_endpoint = "%s/%s" %(api_endpoint,ID)
        try:
            response = RemoteAPI.makePartnerAPICall(api_endpoint,method="DELETE", raw_response=True)
            return PartnerapiManager.getAPIResponse(response)
        except RemoteAPIStatusException, ex:
            log.info("Remote API Exception deleting application for ID = (%s),  Exception = %s" % (ID,ex))
        except Exception, ex:
            log.info("Exception deleting application for ID = (%s),  Exception = %s" % (ID,ex))
        return None
