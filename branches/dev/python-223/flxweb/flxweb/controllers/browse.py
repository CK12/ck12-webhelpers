# -*- coding: utf-8 -*-
#
# Copyright 2007-2012 CK-12 Foundation
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
# $Id$

from pylons import tmpl_context as c, request,config
from pylons.templating import render_jinja2
from pylons.controllers.util import abort
from flxweb.lib.base import BaseController
from flxweb.model.browseTerm import BrowseManager
from flxweb.lib.filters import ck12_user_is_teacher

import logging
import json
log = logging.getLogger(__name__)

class BrowseController(BaseController):
    """
    Controller for handling the browse page actions
    """

    def subjects(self):
        c.subjects = BrowseManager.get_subjects()
        c.page_name = 'browse';
        return render_jinja2('/browse/subjects.html')

    def browseSubject(self):
        c.page_name = 'browse';
        return render_jinja2('/browse/browse.subject.html')

    def browse(self, subject ):
        if request.params.has_key('ui'):
            c.ui = request.params['ui']
        if request.params.has_key('view') and request.params['view'] != 'listview':
                view = request.params['view']
                if view == 'mapview':
                    return self.mapview(subject)
        #default to list view
        return self.listview(subject)

    def new_browse(self):
        return render_jinja2('/courses/courses.html')

    def elementary_math(self, grade):
        return render_jinja2('/browse/elementary_math.html')

    def get_browse_groups_to_context(self):
        # Special Case: Engineering does have concepts.

        if c.branch['level'] <= 1 or\
                c.branch['parent']['encodedID'] == 'other':
            c.show_concepts = False
            c.show_children = True
            c.show_breadcrumb = False
            return

        try:
            c.browse_groups = BrowseManager.getBrowseTermsForEncodedID( c.branch.get('encodedID') , 1, 5000)
        except:
            pass

    def context(self, subject):
        c.books = []
        c.concepts = {}
        c.branch = BrowseManager.getBrowseTermByPath(subject)
        c.subject = subject
        c.browse_groups = {}
        c.show_concepts = c.show_books = True
        c.show_children = False
        c.concepts_count = 0
        c.is_teacher = ck12_user_is_teacher(c.user)

        if not c.branch:
            abort(404)

        #get the concepts information
        if c.branch.has_key('hasChildren') and c.branch['hasChildren']:
            c.branch = BrowseManager.getBrowseTermDescendents(c.branch['encodedID'],4)
            c.show_concepts = True
            c.concepts_count = 1 #TODO: do we really need this count?
            c.concepts = c.branch['children']

        self.get_browse_groups_to_context()

        for group in c.browse_groups:
            c.concepts_count = c.concepts_count + len (group.get('children',[]))

        # get ONLY books for the subject
        encoded_id = c.branch['encodedID']
        c.books.extend(BrowseManager.getArtifactsByBrowseTerm('book',
                                                                encoded_id,
                                                                1,
                                                                1000,
                                                                'stitle,asc'))

        # [Bug #46530] hide CBSE books on browse pages.  (Temporary fix)
        # A better solution should be discussed as part of Zebrafish sprint
        c.books = [book for book in c.books if 'CBSE' not in book.get('title')]

        # [Bug #46804] books on health branch need to appear in specific order
        # Which co-incidentally happens to be reverse alphabetical order
        if subject == 'health':
            c.books = list(reversed(c.books))
            # [Bug #54845] hide HealthCorps SE and Workbook
            # replace the HealthCorps SE FlexBook with HealthCorps TE
            try:
               HC_SE_book = c.books[1]
               c.books[1] = HC_SE_book.get_extended_artifacts()['tebook'][0];
            except:
               pass
        c.books_count = len(c.books)


    def listview(self, subject ):
    	c.middle_high_school = BrowseManager()
        self.context(subject)
        c.browse_view = 'list'
        return render_jinja2('/browse/browse.html')

    def mapview(self, subject=None):
        self.context(subject)
        c.browse_view = 'map'
        return render_jinja2('/browse/browse_map.html')

    def schools(self, anything=None):
        return render_jinja2('/browse/schools.html')

    def cbse_books(self, anything=None):
        return render_jinja2('/browse/cbse_books.html')

    def college_flexbooks(self, anything=None):
        return render_jinja2('/browse/college_flexbooks.html')
        
    def standards_flexbooks(self, anything=None):
        return render_jinja2('/browse/standards_flexbooks.html')

    def elementary_science(self, anything=None):
        return render_jinja2('/browse/elem-sci.html')

    def schoolsReact(self, anything=None):
        return render_jinja2('/browse/schools-react.html')

    def collection(self, collection_handle=None):
        return render_jinja2('/browse/collection.html')

    def collection_mapview(self, collection_handle=None):
        return self.mapview(collection_handle)
