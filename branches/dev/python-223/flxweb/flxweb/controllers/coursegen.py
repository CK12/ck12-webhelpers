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

from pylons.decorators import jsonify
from pylons import request,tmpl_context as c
from pylons.templating import render_jinja2
from flxweb.lib.base import BaseController
from flxweb.lib.ck12.decorators import login_required
from flxweb.lib.pagination import *
from flxweb.lib.ck12.json_response import JSONResponse
from flxweb.lib.ck12.exceptions import ArtifactAlreadyExistsException
from flxweb.model.search import SearchManager
from flxweb.model.artifact import *
from flxweb.model.browseTerm import BrowseManager 
import logging
try: 
    import simplejson as json
except ImportError: 
    import json

log = logging.getLogger(__name__)

class CoursegenController(BaseController):
    '''
    Course Generator creates a book from standards aligned concepts
    It uses the search by standards and assemble API to do so.
    Step 1: Search all the standards aligned artifacts matching 
            the passed curriculum criteria (state,grade,subject)
    Step 2: Group these artifacts as chapters and send them to the 
            assemble API
    '''
    SUBJECTS = BrowseManager.getCorrelatedSubjects() 
 
    @login_required()
    def dlg_coursegen(self):
        c.subjects = CoursegenController.SUBJECTS
        c.grades = {} 
        c.states = {}
        return render_jinja2 ('/coursegen/dialog_coursegen.html')

    @login_required()
    @jsonify
    def ajax_create_book(self):
        try:
            data = json.loads(request.body)
            total_results_count = 0
            include_raw_response = True
            page_num = 1
            page_size = 10
            #page_size = 100
            artifacts = []
            while True:
                if include_raw_response == True :
                    raw_response, artifacts_result = SearchManager.get_chapters_by_standards(types='lesson,section',
                                                                                      state=data['state'],
                                                                                      grade=data['grade'],
                                                                                      subject=data['subject'],
                                                                                      page_num=page_num,
                                                                                      page_size=page_size,
                                                                                      include_raw_response=True)
                    if raw_response:
                        total_results_count = raw_response['total']
                    include_raw_response = False
                else :
                    artifacts_result = SearchManager.get_chapters_by_standards(types='lesson,section',
                                                                        state=data['state'],
                                                                        grade=data['grade'],
                                                                        subject=data['subject'],
                                                                        page_num=page_num,
                                                                        page_size=page_size)
                #artifacts.extend(artifacts_result)
                if not artifacts and artifacts_result:
                    artifacts.extend(artifacts_result)
                elif artifacts_result:
                    ## Fixed to remove duplicates across fetched pages - Bug #13126
                    for each_artifact_res in artifacts_result:
                        is_title_match = False
                        for each_artifact in artifacts:
                            if each_artifact['title'] == each_artifact_res['title']:
                                is_title_match = True
                                break
                        if is_title_match:
                            children_list1 = [ art['id'] for art in each_artifact['children']]
                            for each_child2 in each_artifact_res['children']:
                                if not children_list1.__contains__(each_child2['id']):
                                    each_artifact['children'].append(each_child2)
                        else:
                            artifacts.append(each_artifact_res)
                if total_results_count <= (page_num * page_size) or  (page_num * page_size) >= 50 or artifacts_result is None:
                    break
                page_num += 1
            '''artifacts = SearchManager.get_chapters_by_standards(types='lesson,section',
                                                                        state=data['state'],
                                                                        grade=data['grade'],
                                                                        subject=data['subject'],
                                                                        page_num=page_num,
                                                                        page_size=page_size)'''
            if not artifacts:
                response_obj = JSONResponse("error", c.messages.NO_STANDARD_ALIGNED_ARTIFACTS)
                return response_obj

            #Bug 14815 Remove the artifacts with duplicate titles in same call (irrespective of contents and difficulty level)
            for each_artifact in artifacts:
                distict_artifact_childs = []
                for each_child in each_artifact['children']:
                    artifact_child_titles = [art['title'] for art in distict_artifact_childs]
                    if not each_child['title'] in artifact_child_titles:
                        distict_artifact_childs.append(each_child)
                each_artifact['children'] = distict_artifact_childs

            # loop and create chapter constructs from the artifacts
            # note, we dont send all the artifact details to the 
            # assemble call. It just need the minimal details.
            # see the assemble API for details.
            chapters = []
            for artifact in artifacts:
                child_ids = []
                chapter = {}
                # create chapter artifact object, so that we have the 
                # minimal xhtml constructs needed
                # see bug #8082 
                chapter_artifact = ArtifactManager.toArtifact(artifact)
                chapter['summary'] = artifact['title']
                chapter['artifactRevisionID'] = 'new'
                chapter['artifactType'] = ArtifactManager.ARTIFACT_TYPE_CHAPTER
                chapter['title'] = artifact['title']
                # pass the minimal chapter xhtml needed
                chapter['xhtml'] = chapter_artifact['xhtml'] 
                for child in artifact['children']:
                    child = ArtifactManager.toArtifact(child)
                    child_ids.append( child.get_revision_id() )
                chapter['children'] = child_ids
                chapters.append(chapter)

            new_book = {
                        'title':data['title'],
                        'summary':data['title'],
                        'artifactID':'new',
                        'artifactType':ArtifactManager.ARTIFACT_TYPE_BOOK,
                        'children': chapters,
                        'xhtml' : ''
                        }
            new_book = ArtifactManager.assembleArtifact(new_book)
            response_obj = JSONResponse(JSONResponse.STATUS_OK,data={'perma':new_book.getPermaHandle()} )
            return response_obj
        except ArtifactAlreadyExistsException, ex:
            response_obj = JSONResponse("error", c.messages.BOOK_ALREADY_EXISTS_INBOX_ARCHIEVED)
            return response_obj
        except Exception,e:
            log.exception(e)
            response_obj = JSONResponse("error", c.messages.GENERAL_OPERATION_FAILED)
            return response_obj
