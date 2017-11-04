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
# This file originally written by Ravi Gidwani
#
# $Id$

class JSONResponse( dict ):
    '''
    Use this class to send a standard json response back to the
    caller e.g to JS calls.
    The json format returned is:
    {
        status  : "ok|error",
        message : <the success/error message>,
        data    : dictionary of any data to be passed to server
        html    : <any html code to be returned>
    }
    '''
    STATUS_OK = 'ok'
    STATUS_ERROR = 'error'
    
    def __init__(self,status,message=None,data=None):
        self['status'] = status
        if message:
            self['message'] = message
        if data:
            self['data']=data
