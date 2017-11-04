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
from flxweb.lib.base import BaseController
from pylons.templating import render_jinja2
from pylons.controllers.util import redirect

import logging

log = logging.getLogger( __name__ )

class EmbedController(BaseController):
    def embed(self):
        return render_jinja2('embed/embed.html')

    def embed_artifact(self, artifactID):
        intID = None
        if artifactID:
            try:
                intID = int(artifactID.replace('-', ''))
            except ValueError, ve:
                log.error("Unable to parse artifactID: %s" % artifactID, exc_info=ve)
        if intID:
            redirect('/embed/#module=launcher&artifactID=%s&nochrome=true' % intID)
        raise Exception("Could not parse artifact embed.")

    def embed_react(self, anything=None):
        return render_jinja2('embed/embed-react.html')

    def embed_test(self):
        return render_jinja2('embed/embed_test.html')
