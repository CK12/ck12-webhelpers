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
# $Id$

import formencode
import logging
from flxweb.lib import helpers as h

log = logging.getLogger(__name__)

class ServicesHealthForm (formencode.Schema):
    """
    Form used on the health page.
    """
    listhead = [h.htmldiv(*vals) for vals in [
     ('Status', 'status'),
     ('Host', 'host'),
     ('Service', 'service'),
     ('Description','description'),
     ('Re-Check','retry') 
    ]]
