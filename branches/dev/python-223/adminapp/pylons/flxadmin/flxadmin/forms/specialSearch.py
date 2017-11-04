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
from flxadmin.lib import helpers as h

class SearchControllerForm(formencode.Schema):
    """ search listing Form
    """
    type_choices = [
     ('False', 'False'),
     ('True', 'True'),
    ]

    #type_sel = [('isHelpful,'+name, lbl) for name, lbl in type_choices]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('Term', 'term'),
     ('TermTxt', 'termTxt'),
     ('Entry', 'entry'),
     ('Updated', 'updated')
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('Term', 'term'),
     ('Entry', 'entry'),
     ('Updated', 'updated')
    ]]

class SearchEntryForm(formencode.Schema):
    term = validators.String(not_empty=True)
    termTxt = validators.String(not_empty=False)
    allow_extra_fields = True
    
    med = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if 'info' in vals[2] else \
                       h.labelinput(*vals) for vals in [
     ('id', '_id', med), 
     ('Term', 'term', 'elong'),
     ('Term Text', 'termTxt', med),
     ('Created', 'created', med),
     ('Updated', 'updated', med),
    ]]

class trySpecialSearchForm(formencode.Schema):
    """ search listing Form
    """

    #type_sel = [('isHelpful,'+name, lbl) for name, lbl in type_choices]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('Term', 'term'),
     ('TermTxt', 'termTxt'),
     ('Entry', 'entry'),
     ('Score', 'score'),
     ('Updated', 'updated')
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('Term', 'term'),
     ('Entry', 'entry'),
     ('Score', 'score')
    ]]
