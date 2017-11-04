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
from flxadmin.forms import options
from flxadmin.model.lms import LmsManager as LmsManager
from flxadmin.model.user import UserManager

class UserProfilesForm(formencode.Schema):
    """ User profiles Form
    """
    def __init__(self):
        #Add lms options only once, after user is logged-in
        if len(self.lms_filter_sel) <= 1:
            self.lms_filter_sel.extend([('%s,%s'%('providerID',lms_provider['id']), lms_provider['name'])for lms_provider in LmsManager.getAllLMSProviders()])

    filter_sel = [
     ('roleID,', 'All'), # temp fix, api needs to change to be roleID= instead 
    ]

    filter_sel.extend([('%s,%s'%('roleID', key), value) for key,value in UserManager.get_all_user_roles().items()])

    lms_filter_sel = [('providerID,', 'Select LMS')]
    #lms_filter_sel.extend([('%s,%s'%('providerID',lms_provider['id']), lms_provider['name'])for lms_provider in LmsManager.getAllLMSProviders()])
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Image', 'image', ''),
     ('Login', 'login', ''),
     ('First Name', 'firstName', ''),
     ('Last Name', 'lastName', ''),
     ('Email', 'email', ''),
     ('Last Login', 'lastLogin', 'sortable'),
     ('LMS User Token', 'lmsUserToken'),
     ('Activation', 'stateID', 'sortable'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Login', 'login', 'sortable'),
     ('Name, Email', '', ''),
     ('Last Login', 'lastLogin', 'sortable'),
     ('LMS User Token', 'lmsUserToken'),
    ]]

class UserProfileForm(formencode.Schema):
    """ User profile Form
    suffix and title have max lengths of 7, but don't validate that here since 
    data may have previously not have that limit and the limitation may change.
    """
    email = validators.Email(not_empty=True)
    firstName = validators.String()
    lastName = validators.String()
    suffix = validators.String()
    title = validators.String()
    gender = validators.OneOf(['male', 'female', ''])
    roleID = validators.Int(not_empty=True)
    allow_extra_fields = True

    css = 'info med'

    ordered_fields = [ h.labelreadonlyarea(*vals) for vals in [
     ('Authentication', 'authTypes',2 , 80, 'info xlong'),
    ]]
    ordered_fields.extend([ h.labelreadonlyarea(*vals) for vals in [
     ('LMS Groups Association', 'lmsProviderUserGroups',3 , 80, 'info'),
    ]])
    ordered_fields.extend([ h.labelreadonly(*vals) for vals in [
     ('LMS User Token', 'lmsProviderUserToken', css),
     ('Registered', 'registered', css),
     ('Feedback Count', 'feedbackCount', css),
     ('Viewed Count', 'viewedCount', css),
     ('Favorite Count', 'favoriteCount', css),
     ('Birthday', 'birthday', css),
    ]])

    user_groups_list_head = [ h.htmldiv(*vals) for vals in [
        ('Id', 'id'),
        ('Group Name', 'name', 'xlong'),
        ('Role', 'group role'),
    ]]

class UsersWhoHave1xBooksForm(formencode.Schema):
    """ Users who have 1.x Books Listing Form
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('User ID', 'memberID', 'sortable'), 
     ('1.x User ID', 'memberID1x', 'sortable'),
     ('Email', 'email', 'sortable'),
     ('Status', 'status', 'sortable'),
     ('Started', 'started', 'sortable'),
     ('Completed', 'migrated', 'sortable'),
     ("1.x Books Action/Details", ''),
     ("Imported Books", ''),
    ]]
    status_sel = [('status,'+s, s) for s in options.import1x_statuses]
    status_sel.insert(0, ('status,', 'All'))

class Users1xBooksForm(formencode.Schema):
    """ User's 1.x Books Listing Form
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('1.x Artifact ID', 'fid'),
     ('2.x Artifact ID', 'artifactID'),
    ]]
    
class UploadStudentsForm(formencode.Schema):
    students = validators.String(not_empty=True)
    prefix = validators.String(not_empty=True)

class ACLForm(formencode.Schema):
    """ ACL listing Form 
    """
    select_all_checkbox = h.labelcheckbox('','select_all', False)
    role_sel = [('role,'+opt, lbl) for opt, lbl in [
     ('', 'Select Role'),
     ('content-admin', 'Content Admin'),
     ('support-admin', 'Support Admin'),
     ('content-de-author-admin', 'Content DE Authors'),
     ('content-contractor-admin', 'Content Contractor'),
     ('content-support-admin', 'Content Support'),
     ]]
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Path', 'path'),
     ('Permission Level', '')
    ]]

class AdminTracesForm(formencode.Schema):
    """ Modalities listing Form
    """
    
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Admin ID', 'adminID'), 
     ('Member ID', 'memberID'),
     ('State', 'state'),
     ('Modified', 'updateTime'),
    ]]

class UserRestricitonsForm(formencode.Schema):
    """ User Restrictions listing Form
    """
    filter_sel = [
        ('objectType,', 'All'),
        ('objectType,group', 'Group'),
        ('objectType,artifact', 'Artifact'), 
    ]

    
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Member ID', 'memberID', 'sortable'), 
     ('Object Type', 'objectType', 'sortable'),
     ('Sub Object Type', 'subObjectType'),
     ('Object ID', 'objectID'),
     ('Blocked By', 'blockedBy', 'sortable'),
     ('Reason', 'reason'),
     ('Created', 'creationTime', 'sortable'),
     ('Action', 'action', ''),
    ]]
