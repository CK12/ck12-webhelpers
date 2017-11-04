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

from flx.controllers import decorators as d
from flx.lib import helpers as h
from flx.lib.lms.lti import LTIManager
from flx.model import api, exceptions as ex
import flx.controllers.user as u
from flx.lib.remoteapi import RemoteAPI
from flx.controllers.errorCodes import ErrorCodes
import logging
#Initialing logger

log = logging.getLogger(__name__)

class SchoologyManager(LTIManager):
    '''
        Schoology specific library class for intergration with FBS.
    '''
    
    def __init__(self, appID, **kwargs):
        super(SchoologyManager, self).__init__(appID, **kwargs)
