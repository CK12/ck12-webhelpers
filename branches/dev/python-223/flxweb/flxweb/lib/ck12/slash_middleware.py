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
# This file originally written by Nachiket Karve
#
# $Id$
from flxweb.config.routing import make_map
from pylons import config

class AddTrailingSlash(object):
    def __init__(self, app, config):
        self.app = app

    def __call__( self, environ, start_response ):
        try:
            path = environ['PATH_INFO']
            method = environ['REQUEST_METHOD']
            if path != '/error/document' and not path.startswith('/_test'):
                mapper = make_map(config)
                matched = mapper.match(path)
                # With matcing routes if one of the following:
                # 1. Could not match a route at all. So see if adding the trailing slash helps.
                # 2. If only the 'redirect_with_query' route matched for a non 'GET' request, don't redirect instead
                # try finding the route using a trailing slash. For 'GET' requests, we want to use redirect
                if not matched or (method != "GET" and matched['action'] == 'redirect_with_query'):
                    environ['PATH_INFO'] = '%s/' % path.rstrip('/')
        except Exception, e:
            raise(e)
        return self.app(environ, start_response)
