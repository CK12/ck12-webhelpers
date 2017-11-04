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
# This file originally written by Shanmuga Bala
#
# $Id$

from flxweb.lib.remoteapi import RemoteAPI
from pylons import config
import logging
from urllib import quote

log = logging.getLogger( __name__ )

MATH_RENDER_SUCCESS = 0
MATH_RENDER_FAILIURE = 1

class MathManager(RemoteAPI):

    @staticmethod
    def renderMath(mathType, expr):
        """
            It will validate and check the math expression by rendering the expression
        """
        #[Bug 10410] Expression needs to be all ascii
        expr = expr.encode('ascii', 'ignore')
        # quote math expression
        expr = quote(expr,'')
        api_endpoint = 'math/%s/%s' %( mathType, expr)
        statusDict = { 'expression':expr } 
        response = RemoteAPI.makeCall(api_endpoint, raw_response=True)

        if response.getcode() == 200 and response.headers.dict.has_key('content-length') and int(response.headers.dict.get('content-length')) > 0:
            status = MATH_RENDER_SUCCESS
            mathUrl = '%s/%s' %( RemoteAPI.getServerURL(), api_endpoint )
            statusDict['mathUrl'] = mathUrl
        else: 
            status = MATH_RENDER_FAILIURE
            #TODO: Need to find a way to get math render errors from math server 
            statusDict['error'] = ''

        statusDict['status'] = status
        return statusDict
