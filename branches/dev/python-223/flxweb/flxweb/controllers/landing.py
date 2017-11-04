# -*- coding: utf-8 -*-
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
#$Id$

from pylons import url,request,response, tmpl_context as c
from pylons.templating import render_jinja2
from pylons.controllers.util import redirect
from flxweb.lib.ck12.decorators import login_required
from flxweb.lib.base import BaseController
from flxweb.model.browseTerm import BrowseManager
from flxweb.lib.ck12.decorators import ck12_cache_region
import logging

log = logging.getLogger(__name__)

class LandingController(BaseController):
    """
    Controller for the landing page actions
    The landing page behaves as:
    If user not signed in:
        step 1: Default to the student landing page
        step 2: if the user switches to the student/teacher
                landing page, then show that as the default
                landing page for this user. Remember this
                choice untill the browser is closed or the
                cookie is cleared.
    else if user is signed in:
        take them to the dashboard page.
    """

    def nojavascript(self):
        return render_jinja2 ("/landing/nojavascript.html")

    def nocookies(self):
        return render_jinja2 ("/landing/nocookies.html")

    def index(self):
        #Bug 22356: after signin/signup, redirect to dashboard
        #This is a special case for handling scenarios where auth
        #looses the returnTo parameter and redirect to landing page.
        #check if the request has a userinfo query parameter,
        #if so, send to dashboard
        userinfo = request.params.get('userinfo')
        if userinfo:
            return redirect( url('dashboard'))

        is_teacher = False
        role_cookie = None
        if c.user:
            is_teacher = c.user.isTeacher()
        else:
            role_cookie = request.cookies.get('flxweb_role')
            if 'teacher' == role_cookie:
                is_teacher = True

        if is_teacher:
            return redirect( url('teacher',**request.params) )
        elif role_cookie:
            return redirect( url('student',**request.params) )
        else:
            return self.student()

    def student(self):
        #Bug 22356: after signin/signup, redirect to dashboard
        #This is a special case for handling scenarios where auth
        #looses the returnTo parameter and redirect to landing page.
        #check is the request has a userinfo query parameter,
        #if so, send to dashboard
        userinfo = request.params.get('userinfo')
        if userinfo:
            return redirect( url('dashboard'))

        c.subjects = BrowseManager.get_subjects()
        # set the role cookie
        # 7 days cookie 7*24*60*60
        response.set_cookie('flxweb_role','student',max_age=604800, secure=True)
        return render_jinja2 ('/landing/student.html')

    def teacher(self):
        #Bug 22356: after signin/signup, redirect to dashboard
        #This is a special case for handling scenarios where auth
        #looses the returnTo parameter and redirect to landing page.
        #check is the request has a userinfo query parameter,
        #if so, send to dashboard
        userinfo = request.params.get('userinfo')
        if userinfo:
            return redirect( url('dashboard'))

        c.subjects = BrowseManager.get_subjects()
        # set the role cookie
        # 7 days cookie 7*24*60*60
        response.set_cookie('flxweb_role','teacher',max_age=604800, secure=True)
        return render_jinja2 ('/landing/teacher.html')

    def standard(self):
        return render_jinja2('standard/index.html')

    def bookmarklet(self):
        return render_jinja2('bookmarklet/index.html')

    def coversheet(self):
        if request.params.get('eid'):
            c.eid = request.params.get('eid')
        if request.params.get('ep'):
            c.ep = request.params.get('ep')
        if request.params.get('handle') and request.params.get('login'):
            c.handle = request.params.get('handle')
            c.login = request.params.get('login')
        if request.params.get('assignmentId'):
            c.assignmentId = request.params.get('assignmentId')
        if request.params.get('conceptTitle'):
            c.conceptTitle = request.params.get('conceptTitle')
        return render_jinja2('coversheet/index.html')

    def practice_landing(self):
        return render_jinja2('/practicelanding/practice_landing.html')

    def studyguides_landing(self, subject=None):
        return render_jinja2('/studyguides_landing/studyguides_landing.html')

    def benefits_landing(self):
        c.subjects = BrowseManager.get_subjects()
        return render_jinja2('/benefitslanding/index.html')

    def summer(self):
        return render_jinja2('/summerchallenge/index.html')

    @login_required()
    def summer_dashboard(self):
        return render_jinja2('/summerchallenge/index.html')
