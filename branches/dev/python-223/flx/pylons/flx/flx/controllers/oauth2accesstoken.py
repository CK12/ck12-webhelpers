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
from pylons import request, tmpl_context as c
from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model import exceptions as ex
from flx.model.mongo.oauth2accesstoken import Oauth2AcessToken
import flx.controllers.user as u
from pylons.i18n.translation import _

import logging

log = logging.getLogger(__name__)

class Oauth2AccesstokenController(MongoBaseController):

    def __init__(self):
        self.oauth2AT = Oauth2AcessToken()

    @d.jsonify()
    @d.checkAuth(request)
    def getAccessTokenByMemberID(self,member, memberID=None):
        """
            Lookup access token by memberID
        """
        try:
            memberID = request.params.get('memberID')
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
	    if not u.isMemberAdmin(member):
	        raise ex.UnauthorizedException((_(u'Only admin can make this api call.')).encode("utf-8"))
            if not memberID:
                raise ex.MissingArgumentException((_(u'Required parameter memberID missing')).encode("utf-8"))
            accessToken = self.oauth2AT.getAccessTokenByMemberID(memberID)
            result['response'] = accessToken
            return result
        except Exception, e:
            c.errorCode = ErrorCodes.CANNOT_GET_AUDIT_TRAIL
            log.error("Could not get access token for member %s"%e,exc_info=e)
            return ErrorCodes().asDict(c.errorCode,str(e))

    @d.jsonify()
    def createAccessTokenEntry(self, **kwargs):
        """
            Insert a new access token document into mongodb.
        """
        try:
            log.debug("createAccessTokenEntry request params: [%s]"%request.params)
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            memberID = request.params.get('memberID')
            accessToken = request.params.get('accessToken')
            refreshToken = request.params.get('refreshToken')
            authTypeID = request.params.get('authTypeID')
            expires = request.params.get('expires')

            res = self.oauth2AT.create(memberID = memberID,
                                       accessToken=accessToken,
				       refreshToken = refreshToken,
				       authTypeID = authTypeID,
				       expires = expires)
            result['response'] = res
            return result
        except Exception, e:
            c.errorCode = ErrorCodes.CANNOT_INSERT_AUDIT_TRAIL
            log.error("Could not create access token entry %s"%e,exc_info=e)
            return ErrorCodes().asDict(c.errorCode,str(e))
