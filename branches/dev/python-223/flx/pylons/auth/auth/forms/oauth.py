#
# Copyright 2007-2012 CK-12 Foundation
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
# This file originally written by Stephen AuYeung
#
# $Id: oauth.py 13791 2012-10-12 00:42:38Z stephen $

from auth.lib.ck12 import messages
from auth.model import api
import formencode
import logging
import re

log = logging.getLogger(__name__)

class AuthorizeForm(formencode.Schema):
    """
    Form used on the OAuth authorize page.
    """
    allow_extra_fields = True
    filter_extra_fields = True
