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
# This file originally written by Girish Vispute
# $Id:$

import formencode
from flxadmin.lib import helpers as h


class PartnerapiForm(formencode.Schema):
    css_long = 'info xlong'
    css = 'info xmed'
    edit_css = 'xmed'
    edit_long = 'xlong'
        
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Name', 'name'),
     ('Email', 'email'),
     ('Hash', 'hash'),
     ('Action', 'action'),
    ]]
