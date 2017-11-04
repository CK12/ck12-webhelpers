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

from pylons import request, tmpl_context as c
from pylons.templating import render_jinja2
from pylons.decorators import jsonify
from flxweb.lib.base import BaseController
from flxweb.model.browseTerm import BrowseManager
from flxweb.model.search import SearchManager
from flxweb.lib.ck12.json_response import JSONResponse
import logging

log = logging.getLogger(__name__)

class StandardsController(BaseController):

    """
    Controller for standards aligned page
    """
    def list(self, subject,state,grade):
        c.states = BrowseManager.getCorrelatedStandardboards()
        c.grades = {}
        c.books = []
        c.message = ''
        c.show_books = True
        c.show_states = True
        c.selected_subject_value = None
        c.selected_grade_value = None

        if subject and state and c.states:
            c.selected_subject_value = subject.lower()
            c.selected_grade_value = grade
            for item in c.states:
                if state == ('%s.%s' % (item['countryCode'],item['name'])):
                    c.selected_state_value = item['id']
                    c.grades = BrowseManager.getCorrelatedGrades(subject=subject,standardboard=c.selected_state_value)
                    c.subjects = BrowseManager.getCorrelatedSubjects(standardboard=c.selected_state_value)
        try:
            if (subject and state) and (not c.grades):
                if (not state.__str__().isdigit()):
                    response = BrowseManager.getAlternateCorrelatedGrades(subject=subject,standardboard=state)
                    c.grades = response['grades']
                    c.message = response['message']
                    state = response['standardboard']
        except:
            pass

        return render_jinja2 ('/standards/index.html')

    @jsonify
    def ajax_states(self,subject):
        try:
            states = BrowseManager.getCorrelatedStandardboards(subject=subject)
            log.info("states: %s" % str(states))
            response_obj = JSONResponse(JSONResponse.STATUS_OK,data={'states':states} )
            return response_obj
        except Exception,e:
            log.exception(e)
            response_obj = JSONResponse("error", c.messages.GENERAL_OPERATION_FAILED)
            return response_obj

    @jsonify
    def ajax_subjects(self,state):
        try:
            subjects = BrowseManager.getCorrelatedSubjects(standardboard=state)
            response_obj = JSONResponse(JSONResponse.STATUS_OK,data={'subjects':subjects} )
            return response_obj
        except Exception,e:
            log.exception(e)
            response_obj = JSONResponse("error", c.messages.GENERAL_OPERATION_FAILED)
            return response_obj
    
    @jsonify
    def ajax_grades(self,subject,state):
        try:
            grades = BrowseManager.getCorrelatedGrades(subject=subject,standardboard=state)
            response_obj = JSONResponse(JSONResponse.STATUS_OK,data={'grades':grades, 'message':'', 'standardboard':'', 'standardboardID':'', 'standardboardLongname':''})
            return response_obj
        except Exception,e:
            log.exception(e)
            response_obj = JSONResponse("error", c.messages.GENERAL_OPERATION_FAILED)
            return response_obj

    @jsonify
    def ajax_alternate_grades(self,subject, state):
        try:
            response = BrowseManager.getAlternateCorrelatedGrades(subject=subject,standardboard=state)
            response_obj = JSONResponse(JSONResponse.STATUS_OK,data={'grades':response['grades'], 'message': response['message'], 'standardboard': response['standardboard'], 'standardboardID': response['standardboardID'], 'standardboardLongname': response['standardboardLongname']})

            return response_obj
        except Exception,e:
            log.exception(e)
            response_obj = JSONResponse("error", c.messages.GENERAL_OPERATION_FAILED)
            return response_obj

    def ajax_books(self,subject,state,grade,standardboard=None,standardboardID=None,standardboardLongname=None):
        c.books = []
        c.message = request.params.get('Message')

        standardboardName = ''
        if standardboard:
            state = standardboard
            standardboardData = BrowseManager.getStandardboardData(standardboard=state)
            standardboardID = standardboardData.get('id')
            standardboardName = standardboardData.get('name')
        else:
            try:
                c.grades = BrowseManager.getCorrelatedGrades(subject=subject,standardboard=state)
            except:
                c.grades = {}

            if (not standardboardID) and (not standardboardLongname):
                standardboardData = BrowseManager.getStandardboardData(standardboard=state)
                standardboardID = standardboardData.get('id')
                standardboardName = standardboardData.get('name')
                standardboardLongname = standardboardData.get('longname')

            if (not c.grades):
                if (not state.__str__().isdigit()):
                    response = BrowseManager.getAlternateCorrelatedGrades(subject=subject,standardboard=state)
                    c.grades = response['grades']
                    c.message = response['message']
                    state = response['standardboard']
                    standardboardID = response['standardboardID']
                    standardboardName = response['standardboardName']
                    standardboardLongname = response['standardboardLongname']

        try:
            c.books = SearchManager.search_artifacts_by_standards(
                                        types='book',
                                        state=state,
                                        grade=grade,
                                        subject=subject,
                                        page_size=1000)
        except Exception,e:
            log.exception(e)

        c.selected_subject = subject
        c.selected_state = state
        c.selected_grade = grade
        c.state_id = standardboardID
        c.state_name = standardboardName

        return render_jinja2 ('/standards/ajax_list.html')

    def ajaxStandardsByArtifactAndStandardBoard(self, standard_board_id, artifact_id):
        c.artifacts_standards = {}
        try:
            c.artifacts_standards = BrowseManager.getCorrelatedStandardsByArtifactAndStandardBoards(standard_board_id, artifact_id)
        except Exception, e:
            log.exception(e)

        return render_jinja2('/standards/artifact_standard_corrleation_rev.html')

    def ajaxStandardBoardsByArtifactID(self, artifact_id):
        c.standard_boards = {}
        c.artifactID = artifact_id
        try:
            c.standard_boards = BrowseManager.getCorrelatedStandardboardsByArtifact(artifact_id)
        except Exception, e:
            log.exception(e)

        return render_jinja2('/standards/ajax_standardboards.html')


    def ajaxStandardBoardsBySubjectAndGrade(self, standard_board_id, artifact_id):
        try:
            c.standardBoardsList = BrowseManager.getCorrelatedStandardboardsByArtifact(artifact_id)
            if (len(c.standardBoardsList) <= 1):
                c.standardBoardsList = []
            c.artifacts_standards = BrowseManager.getCorrelatedStandardsByArtifactAndStandardBoards(standard_board_id, artifact_id)
            c.standard_board_id = int(standard_board_id)
            c.artifact_id = int(artifact_id)
        except Exception, e:
            log.exception(e)

        return render_jinja2('/standards/artifact_standards_correlations_with_boards.html')
