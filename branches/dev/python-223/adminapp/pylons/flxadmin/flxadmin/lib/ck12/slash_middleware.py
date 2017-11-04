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

class AddTrailingSlash(object):
    def __init__(self, app, config):
        self.app = app

    def __call__( self, environ, start_response ):
        try:
            path = environ['PATH_INFO']
            if path != '/error/document' and not path.startswith('/_test'):
                environ['PATH_INFO'] = '%s/' % path.rstrip('/')
        except Exception, e:
            raise(e)
        return self.app(environ, start_response)
