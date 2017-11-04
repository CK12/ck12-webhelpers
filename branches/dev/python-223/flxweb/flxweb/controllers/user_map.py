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

from pylons.templating import render_jinja2
from flxweb.lib.base import BaseController

import logging

log = logging.getLogger(__name__)

class UserMapController(BaseController):

    """
    Controller for the ck-12 users map
    """

    def index(self):
        """
        Serves the static sitemapindex.
        """
        return render_jinja2("/user_map/index.html")
