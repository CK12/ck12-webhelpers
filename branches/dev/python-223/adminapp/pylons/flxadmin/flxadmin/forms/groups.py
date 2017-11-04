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
from flxadmin.model.lms import LmsManager as LmsManager

class GroupsForm(formencode.Schema):
    """
    Groups Listing Form
    """
    def __init__(self):
        #Add lms options only once, after user is logged-in
        if len(self.lms_filter_sel) <= 1:
            self.lms_filter_sel.extend([('%s,%s'%('providerID',lms_provider['id']), lms_provider['name'])for lms_provider in LmsManager.getAllLMSProviders()])

    group_type_filter_sel = [
     ('groupType,', 'All'),
     ('groupType,study', 'Study Groups'),
     ('groupType,class', 'Class Groups'),
     ('groupType,public-forum', 'Forums'),
    ]

    lms_filter_sel = [('providerID,', 'Select LMS')]
    #lms_filter_sel.extend([('%s,%s'%('providerID',lms_provider['id']), lms_provider['name'])for lms_provider in LmsManager.getAllLMSProviders()])

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Group Name', 'name', 'sortable'),
     ('Owner', 'creatorID', 'sortable'),
     ('Visibility', 'isVisible', 'sortable'),
     ('Access Code', 'accessCode', 'sortable'),
     ('Group Scope', 'groupScope', 'sortable'),
     ('Group Type', 'groupType', 'sortable'),
     ('LMS Association', 'lmsInformation', 'sortable'),
     ('Created', 'creationTime', 'sortable date'),
     ('Updated', 'updateTime', 'sortable date'),
    ]]
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Group Name, Access Code', 'name', 'sortable'),
     ('Scope, Type', 'groupType', 'sortable'),
     ('Updated', 'updateTime', 'sortable date'),
     ('Owner', 'creatorID', 'sortable'),
     ('Visibility', 'isVisible', 'sortable'),
    ]]

class PostsForm(formencode.Schema):
    """
    Posts Listing Form
    """
    group_type_filter_sel = [
     ('groupType,', 'All'),
     ('groupType,study', 'Study Groups'),
     ('groupType,class', 'Class Groups'),
     ('groupType,public-forum', 'Forums'),
    ]

    post_type_filter_sel = [
     ('postType,', 'All'),
     ('postType,question', 'Questions'),
     ('postType,answer', 'Answers'),
     ('postType,comment', 'Comments'),
    ]

    review_flag_type_filter_sel = [
     ('flaggedForReview,', 'All'),
     ('flaggedForReview,false', 'False'),
     ('flaggedForReview,true', 'True')
    ]

    posted_type_filter_sel = [
        ('created,', 'All'),
        ('created,today', 'Today'),
        ('created,yesterday', 'Yesterday'),
        ('created,lastThirtyDays', 'Last 30 Days '),
        ('created,lastOneYear', 'Last 1 Year'),

    ]
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Group ID', 'groupID'),
     ('Type', 'type'),
     ('User Name', 'username'),
     ('Post', 'post', 'long'),
     ('Flag Count', 'avgFlags.total', 'sortable'),
     ('Vote Count', 'avgRating.vote', 'sortable'),
     ('Action', 'action', 'med'),
     ('Created', 'created', 'sortable date'),
     ('Updated', 'updated', 'sortable date'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Group ID', 'groupID'),
     ('Type', 'type'),
     ('User Name', 'username'),
     ('Post', 'post', 'long'),
     ('Flag Count', 'avgFlags.total', 'sortable'),
     ('Vote Count', 'avgRating.vote', 'sortable'),
     ('Action', 'action', 'med'),
    ]]


class ForumsSequenceForm(formencode.Schema):
    """
    Forums Listing Form
    """
    css_long = 'info long'

    group_type_filter_sel = [
     ('groupType,public-forum', 'Forums'),
    ]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Group ID', 'groupID'),
     ('Group Name', 'name', css_long),
     ('Creation Time', 'creationTime', 'short'),
     ('Visible', 'isVisible', 'short'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Group ID', 'groupID'),
     ('Group Name', 'name', css_long),
     ('Creation Time', 'creationTime', 'short'),
     ('Visible', 'isVisible', 'short'),
    ]]


class GroupForm(formencode.Schema):
    allow_extra_fields = True
    
    css_long = 'info xlong'
    css = 'info xmed'
    edit_css = 'xmed'
    edit_long = 'xlong'
    ordered_fields = [ h.labelreadonly(*vals) for vals in [
        ('Id', 'id', css_long),
        ('Group Name', 'name', css_long),
        ('Access Code', 'accessCode', css_long),
        ('Group Scope', 'groupScope', css_long),
        ('Group Type', 'groupType', css_long),
        ('Description', 'description', css_long),
        ('Created', 'creationTime', css_long),
        ('Modified', 'updateTime', css_long),
        ]]
    
    list_head = [ h.htmldiv(*vals) for vals in [
        ('Id', 'id'),
        ('Member', 'name'),
        ('Member Role', 'userRole'),
        ('Group Role', 'group role'),
        ('Action',''),
    ]]
    
    lms_list_head = [ h.htmldiv(*vals) for vals in [
        ('App Name', 'appName'),
        ('Group Title', 'title'),
        ('Provider Group ID', 'providerGroupID'),
        ('Created', 'creationTime'),
    ]]
    
    assignment_list_head = [ h.htmldiv(*vals) for vals in [
        ('Id', 'assignmentID'),
        ('Type', 'type'),
        ('Name', 'name'),
        ('Due', 'due'),
        ('Assigned', 'assigned'),
        ('Concepts Count', 'creationTime'),
    ]]
    
class GroupQuizReportForm(formencode.Schema):
    """
    Groups Listing Form
    """
    aggregate_select = [
     ('avg','Average'),
     ('max','Best'),
     ('min','Lowest'),
    ]
    format_select = [
     ('json', 'Online'),
     ('csv', 'Downloadable Spreadsheet'),
    ]
