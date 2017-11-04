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

import simplejson
import urllib
from pylons import config, request, session, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from pylons.decorators import jsonify
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.ck12.exceptions import *
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.model.artifact import ArtifactManager as Manager
from flxadmin.forms.artifact import *
from flxadmin.forms.options import getviewmode

import logging
LOG = logging.getLogger( __name__ )


class SchoolController(BaseController):
    """ for: School listing
    """
    

    @ajax_login_required()
    def schools_list(self):
        """ Schools list data, for ajax calls
        """
        template = '/school/schools_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('schools'))
        c.form = SchoolsForm()
        filter_dict = {}
        LOG.info('params:%s' % params)
        school_name = params.get('searchAll')
        school_filters = params.get('filters', '').strip()
        if school_filters:
            filters = school_filters.split(';')
            filter_dict = dict()
            for item in filters:
                key, value = item.split(',')
                filter_dict[key] = value.replace('_', ' ')
                
                
        LOG.info('filter_dict:%s' % filter_dict)
        sort = params.get('sort', '')
        page_num = params.get('page', 1)
        page_size = 10
        school_attbs = {'schoolName':school_name, 'pageNum':page_num, 'pageSize':page_size, 'sort':sort}
        school_attbs.update(filter_dict)
        school_names_data, total = self._get_schools(school_attbs)
        LOG.info("school_names_data:%s" % school_names_data)
        page_url = paginate.PageURL(h.url_('#'), {})
        result = school_names_data

        c.paginator = paginate.Page(result, page_num, page_size, total, 
                        url=page_url,presliced_list=True)
        return render(template)

    @login_required()
    def manage_schools(self):
        template = '/school/schools.html'
        c.pagetitle = 'Manage Schools'        
        c.createtitle = 'Create School'
        c.updatetitle = 'Update School'
        prvlink = '/'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = SchoolsForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.crumbs = h.htmlalist(['home'])
        c.save_prefix = 'Create'
        return render(template)

    @login_required()
    def create_school(self):
        template = '/school/create_school.html'
        c.pagetitle = 'Create School'
        prevlink = '/manage/schools'
        prevText = 'Manage Schools'
        c.crumbs = h.htmlalist(['home'])
        c.crumbs.append(h.htmla_(prevlink, prevText))
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prevlink)
        c.save_prefix = 'Create'
        return render(template)

    @login_required()
    def update_school(self, schoolID=None):
        """ Update School details
        """
        template = '/school/school.html'
        c.pagetitle = 'School Details'
        prevlink = '/manage/schools'
        prevText = 'Manage Schools'
        c.crumbs = h.htmlalist(['home'])
        c.crumbs.append(h.htmla_(prevlink, prevText))
        c.form = SchoolsForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prevlink)
        schools_data, total = self._get_schools({'schoolID':schoolID})
        LOG.info("school_data:%s" % schools_data)

        if schools_data:
            claim_info = self._get_school_claim(schoolID)
            school_data = schools_data[0]
            school_data['claimStatus'] = claim_info['claimStatus']
            if claim_info['claimStatus'] == 'CLAIMED':
                school_data['claimMemberID'] = claim_info['memberID']
                school_data['orgClaimMemberID'] = claim_info['memberID']
            c.school = school_data
            LOG.info("claim_info:%s"%claim_info)
            LOG.info("school_info:%s"%school_data)
        user = session.get( 'user' )
        c.loggedInUserID = user['email']
        c.save_prefix = 'Update'

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            #14361 - udpate content page link to new modality url instead of using perma url
            return htmlfill.render(render(template), c.school)

    def _get_schools(self, school_attbs):
        schools_data = []
        total = 0
        try:
            response = h.makeGetCall('flx/get/schools_by_attributes', school_attbs )
            responseHeader = response['responseHeader']
            if responseHeader and responseHeader['status'] != 0:
                raise Exception("Exception:%s" % response['response']['message'])
            schools_data = response['response']['schools']
            total = response['response']['total']
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            h.set_error(e)
        except Exception, e:
            LOG.exception(e)
            h.set_error(e)
        return schools_data, total

    def _get_school_claim(self, school_id):
        schools_claim = None
        total = 0
        school_attbs = {'schoolID':school_id, 'memberID':1}
        try:
            response = h.makeGetCall('flx/get/school/claim', school_attbs )
            responseHeader = response['responseHeader']
            if responseHeader and responseHeader['status'] != 0:
                raise Exception("Exception:%s" % response['response']['message'])
            schools_claim = response['response']['schoolClaim']
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            h.set_error(e)
        except Exception, e:
            LOG.exception(e)
            h.set_error(e)
        return schools_claim
