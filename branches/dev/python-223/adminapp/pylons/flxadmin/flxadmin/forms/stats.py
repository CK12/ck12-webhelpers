#
# Copyright 2011-201x CK-12 Foundation
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
# This file originally written by John Leung
# $Id:$

import formencode
from formencode import validators
from formencode.htmlgen import html
from flxadmin.lib.ck12 import messages
from flxadmin.lib import helpers as h


class SayThanksForm(formencode.Schema):
    appleAppStore = validators.Int(not_empty=True)
    kindleStore = validators.Int(not_empty=True)
    allow_extra_fields = True
