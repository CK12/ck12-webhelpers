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
# $Id$

from flxweb.lib.base import BaseController
from flxweb.lib.pagination import *
from flxweb.model.search import SearchManager
from flxweb.model.artifact import ArtifactManager
from flxweb.model.modality import ModalityManager
from pylons import tmpl_context as c, request
from pylons.templating import render_jinja2
from pylons import config, response, url
from functools import partial
import logging
import cgi
import simplejson
import re
from pylons.decorators import jsonify

LOG = logging.getLogger(__name__)



class SearchController(BaseController):
    '''
    Controller for search related actions and functionality.
    '''
    # Options to be shown in the Sort drop down.
    # Note: the format is <label> : <key to be sent to backend API>
    SORT_OPTIONS = {
                    'Relevance' : 'score',
                    'Title:A-Z' : 'stitle,asc',
                    'Title:Z-A' : 'stitle,desc',
                    'Most Recent' : 'modified,desc',
                    'Least Recent' : 'modified,asc',
                    }


    FILTERS =   [
                    {'key':'at','label':'Everything','value':'everything'},
                    {'key':'at','label':'FlexBook&#174; Textbooks','value':'book'},
                    {'key':'at','label':'Concepts','value':'concept'},
                    {'key':'at','label':'Teacher Editions','value':'tebook'},
                    {'key':'at','label':'Workbooks','value':'workbook'},
                    {'key':'at','label':'Lab Kits','value':'labkit'},
                    # {'key':'at','label':'Quizzes and Tests','value':'quizbook'},
                    # RG: As per NP, there are no studyguides and this type may be deprecated
                    #{'key':'at','label':'Study Guides','value':'studyguide'},
                ]

    MODALITY_FILTERS = [
                            {'key':'m','label':'All','value':'all'},
                            {'key':'m','label':'Read','value':'read'},
                            {'key':'m','label':'Real World Applications','value':'rwa'},
                            {'key':'m','label':'Video','value':'video'},
                            {'key':'m','label':'Activities','value':'activities'},
                            {'key':'m','label':'Study Aids','value':'studyaids'},
                            {'key':'m','label':'Assessment','value':'assessment'},
                            {'key':'m','label':'Mind Map','value':'mindmap'},
                            {'key':'m','label':'Web Links','value':'web'},
                            {'key':'m','label':'Images','value':'images'},
                            {'key':'m','label':'Teaching Resources','value':'teaching_resource'},
                            {'key':'m','label':'Simulations','value':'simulations'}
                            #{'key':'mod','label':'Attachment','value':'attachment'},
                        ]
    MODALITY_BLOCK_TYPES = ['rwaans','labans','worksheetans','activityans',\
                            'prereadans','postreadans','whilereadans','prepostreadans',\
                            'concept', 'rubric', 'lessonplanx', 'lessonplanxans', 'lessonplanans',\
                            'attachment', 'audio', 'quizans']

    MODALITY_TYPE_MAPPING = {
                            'read' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Read')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'rwa' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Real World')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'video' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Video')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'activities' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Activities')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'studyaids' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Study Aids')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'assessment' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Assessments')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'mindmap' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Mind Map')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'web' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Web Links')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'images' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Images')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'teaching_resource' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Lesson Plans')['artifact_types'] if type not in MODALITY_BLOCK_TYPES]),
                            'simulations' : ','.join([type for type in ModalityManager.get_modality_group_by_name('Simulations')['artifact_types'] if type not in MODALITY_BLOCK_TYPES])
                            #'attachment'
                        }

    ALL_ARTIFACT_TYPES = '%s,lesson,section' % ','.join(ArtifactManager.SEARCHABLE_BOOK_TYPES)
    ALL_MODALITY_TYPES =  '%s,domain' % ','.join(MODALITY_TYPE_MAPPING.values())
    ALL_MODALITY_AND_ARTIFACT_TYPES = '%s,%s' % (ALL_ARTIFACT_TYPES, ALL_MODALITY_TYPES)

    CONTENT_FILTERS = [
                       {'key':'cf','label':'All','value':'all'},
                       {'key':'cf','label':'Has Exercises','value':'exercises'},
                       {'key':'cf','label':'Has Videos','value':'videos'},
                       {'key':'cf','label':'Has Resources','value':'attachments'},
                       ]

    ARTIFACT_TYPE_MAPPING = {
                             "book":"FlexBook&#174; textbook",
                             "tebook":"Teacher Edition",
                             "workbook":"Workbook",
                             "labkit":"Lab Kit",
                             "concept":"Concept",
                             "lesson":"Lesson"
                             }

    #9618 - Advance search fileds mapping <search field:API field>.
    SPECIAL_SEARCH_FIELDS = {'tag' : 'tags.ext:',\
                              'subject' : 'subjects.ext:',\
                              'grade' : 'gradeLevels.ext:',\
                              'author' : 'authors:',\
                              'domain' : 'domains.ext:',\
                              'searchTerm' : 'searchTerms.ext:'
                             }

    def get_search_page_size(self):
        return config.get( 'search_page_size' )

    def searchModalitiesOld(self, search_term=''):
        '''
        Action called when search is performed. Based on the query parameters
        it will return the search results in one of the list or grid view based
        on the 'mode' query parameter
        Parameters:
        q = search term/query
        pageNum = requested page number
        at = Artifact Type. viz book, concept, lesson
        mode = list or grid
        sort = how to sort the results. Should be one of the SORT_OPTIONS
        '''
        # get the search term from the 'q' query parameter
        query = request.GET.get('q')
        # if present, use that as the search term
        if (not search_term or search_term == '') and query:
            search_term = query

        # get the page number
        page_number = request.GET.get('pageNum')
        if not page_number:
            page_number = 1
        else:
            page_number = int(page_number)

        # get the view mode i.e grid/list
        c.mode = request.GET.get('mode')
        if not c.mode:
            c.mode = 'list'

        c.origin = request.GET.get('origin')

        # get the artifact type from the 'at' query parameter
        c.at = request.GET.get('at')
        # show only concepts if we are looking for exercises for workbook
        c.only_has_exercises = False
        if c.mode == 'workbookDialog':
            c.at = 'concept'
            c.only_has_exercises = True

        artifact_types = c.at
        if not c.at or c.at.lower() == 'everything':
            c.at = 'everything'
            if not ( c.mode == 'workbookDialog' or c.mode == 'dialog'): 
                artifact_types = SearchController.ALL_MODALITY_AND_ARTIFACT_TYPES
            else:
                artifact_types = SearchController.ALL_ARTIFACT_TYPES
        elif c.at == 'concept':
            # if we are looking for concepts, then show 'section' and 
            # lesson because from flxweb app point of view, they are same as 
            # concept and don't include concepts to avoid duplicates with 
            # lessons
            if not (c.mode == 'workbookDialog' or c.mode == 'dialog'): 
                artifact_types = SearchController.ALL_MODALITY_TYPES
            else:
                artifact_types = 'lesson,section'
        # get the sort parameter
        c.sort = request.GET.get('sort')
        c.mod_filters = request.params.getall('m')
        
        if c.mod_filters and 'all' not in c.mod_filters:
            c.at = 'concept'
            artifact_types = ''
            modalityDone = []
            for i in range(len(c.mod_filters)):
                modality = c.mod_filters[i]
                if modality not in modalityDone:
                    modalityDone.append(modality)
                    artifact_types += "%s," % SearchController.MODALITY_TYPE_MAPPING.get(modality)
                    artifact_types.rstrip(",")
        else:
            c.mod_filters = ['all']
        c.m_query_params = "&m=%s" % '&m='.join(c.mod_filters)
        m_search_term = None
        if self.isSpecialSearchForModality(search_term):
            c.at = 'concept'
            m_search_term = search_term
            modality_groups, m_search_term = self.getModalityGroupForSpecialSearch(search_term)
            # set artifact_types to modality types iff c.origin is not filters.
            if c.origin != 'mf':
                
                m_search_term = m_search_term.replace('type:', '')
                m_types = []
                for group in modality_groups:
                    m_search_term = m_search_term.replace(group, '')
                    if group in SearchController.MODALITY_TYPE_MAPPING.keys():
                        m_types.append(SearchController.MODALITY_TYPE_MAPPING.get(group))

                if m_types.__len__() > 0:
                    artifact_types = ','.join(m_types)
                    c.m_query_params = "&m=%s" % '&m='.join(modality_groups)
                    c.mod_filters = modality_groups
            else:
                #remove group from search_term
                for group in modality_groups:
                    m_search_term = m_search_term.replace(group, '')
                m_search_term = m_search_term.replace('type:', '')
        # get the search page size from config
        page_size = self.get_search_page_size() 

        # check if the user has selected to show 'Just Things from my library'
        c.only_my_artifacts = request.GET.get('my')
        if not c.only_my_artifacts or c.only_my_artifacts.lower() == 'false':
            c.only_my_artifacts = False
        # 10285 - Convert the characters "&", "<" and ">" in search_term to HTML-safe sequences
        # flag quote is true, to translate double-quote character (""")
        try:
            if c.origin =='mf':
                c.search_term = cgi.escape(m_search_term, True)
            else:
                c.search_term = cgi.escape(search_term, True)
        except Exception, e:
            #LOG.error("Exception : search_term = %s" % str(e))
            c.search_term = search_term

        if m_search_term:
            search_term = m_search_term

        # then make the search API calls
        c.search_filters = SearchController.FILTERS
        #c.search_content_filters = SearchController.CONTENT_FILTERS
        c.search_modality_filters = SearchController.MODALITY_FILTERS
        c.selected_filters= {'at':c.at, 'm': c.mod_filters}

        #Bug 9618 - passed special_search as a argument to search model - search_artifacts method.
        special_search = False
        specialSearchTerm = self.isSpecialSearch(search_term)
        if specialSearchTerm is not None:
            search_term = specialSearchTerm
            special_search = True

        pageable = PageableWrapper(partial(SearchManager.search_modalities,
                                           type=artifact_types,
                                           search_term=search_term,
                                           only_my_artifacts=c.only_my_artifacts,
                                           only_has_exercises=c.only_has_exercises,
                                           ck12only=True,
                                           sort=c.sort,
                                           return_total_count=True,special_search=special_search))
        c.search_paginator = Paginator(pageable,page_number,page_size)
        c.sort_options = SearchController.SORT_OPTIONS

        c.new_request_params = ''
        c.suggested_term = None
        lsearchTerm = c.search_term.lower()
        if lsearchTerm in SearchManager.SUGGESTIONS:
            c.suggested_term = SearchManager.SUGGESTIONS[lsearchTerm][0]
            pageable = PageableWrapper(partial(SearchManager.search_modalities,
                                           type=artifact_types,
                                           search_term=SearchManager.SUGGESTIONS[lsearchTerm][0],
                                           only_my_artifacts=c.only_my_artifacts,
                                           ck12only=True,
                                           sort=c.sort,
                                           return_total_count=True,special_search=special_search))
            c.search_paginator = Paginator(pageable,page_number,page_size)

        if c.mode == 'list':
            return render_jinja2 ('/search/results_list.html')
        elif c.mode == 'dialog' or c.mode == 'workbookDialog':
            return render_jinja2 ('search/dialog_results_list.html')
        else:
            return render_jinja2 ('/search/results_grid.html')

    def searchModalitiesNew(self):
        return render_jinja2('/search/new/new.search.html')

    def ajax_search_title_hints(self):
        term = request.GET.get('query')
        hints = {'query': term, 'suggestions':[]}
        regex = re.compile('\w+', re.U)
        if regex.findall(term):
            data = SearchManager.search_hints(term)
            if data:
                for hint in data:
                    suggestion = {}
                    artifact_type = hint["type"]
                    artifact_title = hint["title"]
                    artifact_enc_title = hint["encoded_title"]
                    at=artifact_type
                    if artifact_type in ['lesson', 'domain', 'concept']:
                        artifact_type = 'node'
                        at='concept'
                    else:
                        artifact_type = 'artifact'
                    searchUrl = url('search') + '?q=%s&at=%s' % (artifact_enc_title, at)
                    if at == 'concept':
                        searchUrl += '&m=all'
    
                    suggestion['url'] = searchUrl
                    suggestion['display_label'] = artifact_title
                    suggestion['value'] = artifact_title
                    suggestion['artifact_type'] = artifact_type
                    hints['suggestions'].append( suggestion )

        response.headers['Content-type'] = 'text/json; charset=utf-8'
        return simplejson.dumps(hints)

    #9618 - Check query for advance search fileds
    def isSpecialSearch(self,search_term):
        if ':' in search_term :
            searchField = search_term.split(':')
            if searchField[0] in SearchController.SPECIAL_SEARCH_FIELDS.keys() :
                return "%s%s"%(SearchController.SPECIAL_SEARCH_FIELDS[searchField[0]],searchField[1])
        return None

    def getModalityGroupForSpecialSearch(self,search_term):
        if ':' in search_term and 'type:' in search_term:
            delimiter = None
            if ';' in search_term:
                parts = search_term.split(';')
                delimiter = ';'
            elif ',' in search_term:
                parts = search_term.split(',')
                delimiter = ','
            else:
                parts = search_term.split(' ')
                delimiter = ' '

            modality_groups = []
            for i in range(parts.__len__()):
                part = parts[i]
                if 'type:' in part.strip():
                    if part.__len__() > 5:
                        modality_groups.append(part.split(':')[1])
                    else:
                        modality_groups.append(parts[i+1])

            return modality_groups, search_term

    def isSpecialSearchForModality(self,search_term):
        if ':' in search_term and 'type:' in search_term:
            return True
        return False
