# -*- coding: utf-8 -*-
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
# $Id$

from flxweb.lib.remoteapi import RemoteAPI
from flxweb.lib.ck12.errorcodes import ErrorCodes
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException
import logging

log = logging.getLogger( __name__ )

class HealthManager( object ):
    
    @staticmethod
    def health_custome_service(api=None,host=None,params=None,api_timeout=None):
        '''
        check the status for remote api and return status and description of error if any 
        '''
        try:
            if api is not None :
                data = RemoteAPI.makeCustomGetCall(api=api, server_host=host, params_dict=params, api_timeout=api_timeout)
                status = data['responseHeader']['status']
                return status , "-" 
        except RemoteAPIStatusException,re:
            if re.status_code == ErrorCodes.AUTHENTICATION_REQUIRED:
                return 0 , "-"
            else :
                return re.status_code, re
        except Exception, e:
            log.exception(e)
            return -1, e.__repr__()
