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
# $Id: decorators.py 12422 2011-08-19 22:51:58Z jleung $

from decorator import decorator
from pylons import session, url, request
from pylons.controllers.util import redirect, abort
import logging
LOG = logging.getLogger(__name__)


def login_required():
    def wrapper( func, self, *args, **kwargs ):
        user = session.get( 'user' )
        login_url = url( controller='authentication', action='signin' )
        if request.path_qs:
            login_url += '?next=' + request.path_qs
        elif request.path:
            login_url += '?next=' + request.path

        if user is None or not user.isAdmin():
            LOG.debug("Redirecting user to login page (user is None or not admin)")
            if login_url:
                redirect( login_url, code=302 )
                return
            else:
                abort( 401 )
        return func( self, *args, **kwargs )
    return decorator( wrapper )

def ajax_login_required():
    """ login required decorator for ajax (just 401 instead of login page redirection)
    """
    def wrapper( func, self, *args, **kwargs ):
        user = session.get( 'user' )
        if user is None or not user.isAdmin():
            abort( 401 )
        return func( self, *args, **kwargs )
    return decorator( wrapper )