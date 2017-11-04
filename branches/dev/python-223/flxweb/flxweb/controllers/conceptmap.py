
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
# This file was originally written by
#

from flxweb.lib.base import BaseController
from pylons.templating import render_jinja2

class ConceptmapController(BaseController):

    """
    Controller for handling the concept map
    """

    def index(self):
        """
        Default action for rendering the index page.
        """
        return render_jinja2 ('/conceptmap/index.html')
        #return render_jinja2 ('/conceptmap/conceptmap-unavailable.html')
