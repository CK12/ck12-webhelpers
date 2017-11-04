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


class ConceptController(BaseController):
    """ for: Concept listing
    """
    
    @login_required()
    def concepts(self):
        """ Concept listing page, client should call concepts_list() for data
        """
        template = '/concept/concepts.html'
        c.pagetitle = 'Concepts'
        c.crumbs = h.htmlalist(['home'])
        c.form = ConceptsForm()
        c.viewmode = request.params.get('viewmode', getviewmode('concepts'))
        return render(template)

    @ajax_login_required()
    def concepts_list(self):
        """ Concepts list data, for ajax calls
        """
        template = '/concept/concepts_list.html'
        params = dict(request.params)
        c.viewmode = request.params.get('viewmode', getviewmode('concepts'))
        concepts_data = []
        encodedID = params.get('searchAll')
        concepts_data = self._get_concept(encodedID)

        pageNum = 1
        pageSize = 10
        pageUrl = '#'
        result, total = concepts_data, len(concepts_data)

        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def concept(self, eid=None):
        """ Concept details
        """
        template = '/concept/concept.html'
        c.pagetitle = 'Concept Details'
        prvlink = 'concepts'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = ConceptsForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.update_title = ''
        concepts_data = self._get_concept(eid)
        if concepts_data:
            c.concept = concepts_data[0]
            c.update_title = eid.lower().startswith('ela.')
        user = session.get( 'user' )
        c.loggedInUserID = user['email']

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            #14361 - udpate content page link to new modality url instead of using perma url
            return htmlfill.render(render(template), c.concept)

        if request.method == 'POST':
            description = request.params.get('description')
            eid = request.params.get('encodedID')
            params = dict()
            params['id'] = eid
            params['description'] = description
            params['cookies'] = request.cookies
            post_data = h.api_post('taxonomy/update/concept', params, 'Concept description Updated Successfully!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.form_result)
            return redirect(request.url)

    def _get_concept(self, encodedID):
        if not encodedID:
            return []
        concepts_data = []
        try:
            response = h.makeGetCall('taxonomy/get/info/concept/%s' %encodedID )
            responseHeader = response['responseHeader']
            if responseHeader and responseHeader['status'] != 0:
                raise Exception("Exception:%s" % response['response']['message'])
            concepts_data = [response['response']]
        except RemoteAPIStatusException, e:
            LOG.exception(e)
            h.set_error(e)
        except Exception, e:
            LOG.exception(e)
            h.set_error(e)
        return concepts_data
