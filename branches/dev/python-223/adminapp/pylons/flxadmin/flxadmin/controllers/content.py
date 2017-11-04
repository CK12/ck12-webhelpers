#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.

import urllib
from pylons import config, request, response, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from pylons.decorators import jsonify
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib import helpers as h
from flxadmin.model.session import SessionManager
from flxadmin.forms.content import *

import logging
LOG = logging.getLogger( __name__ )

GOOGLE_AUTHSUB_URL = r'https://www.google.com/accounts/AuthSubRequest?scope=https%3A%2F%2Fdocs.google.com%2Ffeeds%2F&session=1&secure=0&next='


class ContentController(BaseController):
    """ for: Content imports
    """

    @ajax_login_required()
    @jsonify
    def wiki_imports(self):
        """ Returns {response: [list of wiki imports saved in session]}, which are:
        {'taskID': taskID, 'url':   imported url}
        """
        return {'response': SessionManager.getDataFromSession('wiki_imports')}

    @ajax_login_required()
    @jsonify
    def gdoc_imports(self):
        """ Returns {response: dict of {'taskID': (docID, status)} }
        POST: either:
        {taskID: .., docID: .., status: Optional, status of this task}
        OR {tasks: [list of dicts of above]}
        """
        if request.method == "POST":
            params = request.params
            tasks  = params.get('tasks') or []
            gdoc_imports = SessionManager.getDataFromSession('gdoc_imports') or {}
            if not tasks:
                tasks.append({
                 'taskID': params.get('taskID'),
                 'docID':  params.get('docID'),
                 'status': params.get('status'),
                })
            for task in tasks:
                taskID = task.get('taskID')
                docID  = task.get('docID')
                status = task.get('status') or ''
                if taskID and docID:
                    gdoc_imports[taskID] = {'docID': docID, 'status': status}
            SessionManager.saveDataInSession({'gdoc_imports': gdoc_imports}) 
        return {'response': SessionManager.getDataFromSession('gdoc_imports')}

    @login_required()
    def wiki_import(self):
        """ Wiki import, calls wiki import api and saves url in session for
        display purpose
        """
        template = '/task/wikiimport.html'
        c.pagetitle = 'Wiki Import'
        c.crumbs = h.htmlalist(['home'])
        c.form = WikiImportForm()

        if request.method == "GET":
            return htmlfill.render(render(template), c.form.defaults)

        elif request.method == "POST":
            #if not h.validate(request.params, c.form):
            #    return htmlfill.render(render(template), c.form_result)

            params = dict(request.params)
            if not params['wiki_url'] and params['file']=='':
                c.form_errors = {'wiki_url': 'Either Wiki URL or Upload is required'}
                return htmlfill.render(render(template), params)

            if not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            file_upload = params.has_key('file') and params['file'] != ''
            if file_upload:
                try:
                    cache_dir = config.get('cache_share_dir')
                    savedFile = h.saveUploadedFile(request, 'file', dir=cache_dir, allowedExtenstions=['zip'])
                    fileObject = open(savedFile , 'r')
                    params['file'] = fileObject
                    params['filename'] = savedFile
                    del params['wiki_url']
                except Exception, e:
                    LOG.error(e)
                    h.set_error(e)
                    return htmlfill.render(render(template), c.form_result)
            else:
                del params['file']

            data = h.api_post('import/wiki', params, multipart=file_upload)
            if not data:
                return htmlfill.render(render(template), c.form_result)

            if "response" in data and "task_id" in data["response"]:
                wiki_imports = SessionManager.getDataFromSession('wiki_imports') or []
                wiki_imports.append({  # response only has {task_id: taskID}
                  'taskID': data['response']['task_id'],
                  'url': params.get('wiki_url'),
                })
                SessionManager.saveDataInSession({'wiki_imports': wiki_imports})
            return redirect(request.url)

    @login_required()
    def gdoc_import(self, doctype='doc'):
        """ Google Doc import page
        """
        template = '/content/gdoc_import.html'
        c.pagetitle = 'Google Doc Import'
        c.crumbs = h.htmlalist(['home'])
        c.form = GDocsForm()
        c.doctype = doctype
        c.hasGAuth = False

        if request.method == "POST":
            h.api('import/google/logout')
            return redirect(request.url)

        gAuth = None
        try:
            gAuth = h.api_raw('get/status/google/auth')
            if gAuth and gAuth.get('response'):
                c.hasGAuth = gAuth['response'].get('googleDocAuthenticated')
        except Exception:
            LOG.error('Error calling get/status/google/auth')

        cookies_from_session = SessionManager.getCookiesFromSession()
        flx2 = 'flx2'

        domain = config.get('ck12_login_cookie_domain', '.ck12.org')
        LOG.info("Domain: %s" % domain)
        if c.hasGAuth:
            if flx2 in cookies_from_session:
                s_cookie = cookies_from_session[flx2]  
                response.delete_cookie(flx2, 
                    path=s_cookie.get('path') or '/',
                    domain=domain,
                )
        else: 
            # flx2 cookie needed for GDocs login from browser
            if flx2 in cookies_from_session and flx2 not in request.cookies:
                s_cookie = cookies_from_session[flx2]  
                response.set_cookie(flx2, s_cookie.value,
                    #max_age=s_cookie.get('max-age'), #convert needed for timedelta(seconds=max_age) called for it
                    max_age=None,
                    path=s_cookie.get('path') or '/',
                    domain=domain,
                    secure=s_cookie.get('secure') or None,
                )
            gauth_api = config['flx_core_api_server']+'/import/google/auth'
            gauth_api.replace('https://', 'http://')
            redir = '?redirectUrl='+h.url_('/gdocimport/'+doctype)
            c.GAuthLink = GOOGLE_AUTHSUB_URL + urllib.quote(gauth_api+redir)
        return render(template)

    @ajax_login_required()
    def gdocs_list(self, doctype='doc'):
        """ Google Docs list data, for ajax calls
        """
        template = '/content/gdocs_list.html'
        params = dict(request.params)
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('/gdocimport/'+doctype), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        c.doctype = 'documents' if doctype.startswith('doc') else 'folders'
        result, total = h.page_get('get/%s/google'%c.doctype, params, c.doctype)

        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    @jsonify
    def gdocs_raw(self, doctype='doc'):
        doctype = 'documents' if doctype.startswith('doc') else 'folders'
        return h.api_raw('get/%s/google'%doctype, {'pageSize':25})
    
    @login_required()
    def rebuild_cache(self):
        template = '/task/rebuildcache.html'
        c.pagetitle = 'Rebuild Cache'
        c.crumbs = h.htmlalist(['home'])
        c.form = RebuildCacheForm()
        if request.method == "GET":
            return render(template)
