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
# This file originally written by Ravi Gidwani
#
# $Id: account.py 13791 2011-11-22 00:42:38Z ravi $

import formencode


class SigninForm(formencode.Schema):
    allow_extra_fields = True
    filter_extra_fields = True
    username = formencode.validators.String(not_empty=True)
    password = formencode.validators.String(not_empty=True)
    # user id will be filled in by the authentication form
    user_id = formencode.validators.String(if_missing='-1')
    next = formencode.validators.String(if_missing='')
