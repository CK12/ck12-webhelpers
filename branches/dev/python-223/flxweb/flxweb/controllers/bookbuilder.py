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
from flxweb.model.library import *
from flxweb.lib.ck12.json_response import JSONResponse
import logging
import base64
try:
    import simplejson as json
except ImportError:
    import json

log = logging.getLogger(__name__)

class BookbuilderController(BaseController):

    @login_required()
    def dlg_add_to_book(self):
        return render_jinja2 ('/bookbuilder/dialog_addtobook.html')

    @login_required()
    @jsonify
    def ajax_list_books(self):
        try:
            # get the page number
            page_number = request.GET.get('page')
            q = request.GET.get('q')
            if q:
                filters = {'name':q}
            else:
                filters = None
            if not page_number:
                page_number = 1
            else:
                page_number = int(page_number)

            data,books = LibraryManager.get_artifacts(
                                        artifact_types=','.join(ArtifactManager.BOOK_TYPES),
                                        page_num=page_number,
                                        page_size=5,
                                        filters=filters,
                                        return_total_count=True,
                                        book_builder = True
                                )
            if data:
                return {'books':books,'total':data}
            else:
                return {'books':books}
        except Exception,e:
            log.exception(e)
            return []

    @login_required()
    @jsonify
    def ajax_save_book(self,id):
        try:
            request_body = base64.b64decode(request.body)
            artifact = ArtifactManager.toArtifact(json.loads(request_body))
            if 'children' in artifact:
                # make a copy of the children
                #children_copy = artifact['children'][:]
                new_children = []
                for index,child in enumerate(artifact['children']):

                    # if a book has been added to the workspace, get its children and add those instead
                    if type(child) == dict and ('added' in child) and  child['added'] and (child['artifactType'] in ArtifactManager.BOOK_TYPES):
                        book_being_added = ArtifactManager.getArtifactByRevisionId(child['artifactRevisionID'])
                        # delete the book entry from children and add that book's children instead
                        del artifact['children'][index]
                        if 'children' in book_being_added:
                            book_children = book_being_added['children']
                            new_children.extend(book_children)
                    elif type(child) == dict and 'added' in child and child['added'] and child['artifactType'] == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
                        chapter_being_added = ArtifactManager.getArtifactByRevisionId(child['artifactRevisionID'])
                        new_children.append(chapter_being_added)
                    elif type(child) == dict and 'added' in child and  child['added']:
                        #fetch artifact children
                        child_being_added = ArtifactManager.getArtifactByRevisionId(child['artifactRevisionID'])
                        #if child_being_added['artifactType'] != ArtifactManager.ARTIFACT_TYPE_LESSON or child_being_added.getChildren():
                        #don't add lesson if it doesn't contain a concept.
                        new_children.append(child_being_added)



                children_copy = []
                # if this is a existing book,
                # get the original book being modified so that we can compare
                # the titles,etc.
                if 'artifactRevisionID' in artifact:
                    artifact = ArtifactManager.getArtifactByRevisionId(artifact['artifactRevisionID'])
                    if artifact['children']:
                        children_copy = artifact['children']

                # add the new children to the children_copy
                children_copy.extend(new_children)

                # Handle duplicate chapters and duplicate lessons in the children
                # i.e immediate children of the book
                # CASE 1:
                # If there if more than 1 chapter with the same name, then rename
                # e.g MyChapter, MyChapter-1, MyChapter-2
                # CASE 2:
                # if the same lesson/section revision is included more than once,
                # then use only 1
                distinct_children = []
                for index,child in enumerate(children_copy):
                    child = ArtifactManager.toArtifact(child)
                    if child['artifactType'] == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
                        # create regex for checking duplicate chapter titles
                        duplicate_title_regex = re.compile('(%s)(-)?(\d+)?' % re.escape(child['title']))
                        # all the same named chapters will be collected in same_title_chapters
                        same_title_chapters = []
                        for item in distinct_children:
                            if item['artifactType'] == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
                                matches = duplicate_title_regex.match(item['title'])
                                # if there is a duplicate chapter title, collect it
                                if matches:
                                    same_title_chapters.append(item)

                        # if there are duplicate chapter title, change the current chapter title
                        # by adding a suffix like "<chapter title>-<number>"
                        if same_title_chapters:
                            title_without_suffix = duplicate_title_regex.match(child['title']).group(1)
                            child['title'] = '%s-%s' % ( title_without_suffix,len(same_title_chapters))
                            # [Bug 39705] if title is modified, do not pass the handle to backend
                            child.pop('handle',None)
                        #finally add the chapter to distinct_children
                        distinct_children.append(child)
                    elif not any(ArtifactManager.toArtifact(item)['artifactRevisionID'] == child['artifactRevisionID'] for item in distinct_children):
                        distinct_children.append(child)
                    else:
                        log.debug('Removed duplicate %s %s' % (child['artifactType'],child['artifactRevisionID']) )

                # finally set the children_copy as children of the artifact being saved
                artifact['children'] = distinct_children

            if not 'artifactType' in artifact:
                artifact['artifactType'] = ArtifactManager.ARTIFACT_TYPE_BOOK
            return ArtifactManager.saveArtifact(artifact)
        except ArtifactAlreadyExistsException, ex:
            response_obj = JSONResponse("error", c.messages.BOOK_ALREADY_EXISTS)
            return response_obj
        except EmptyArtifactTitleException, ex:
            response_obj = JSONResponse("error", c.messages.EMPTY_ARTIFACT_TITLE)
            return response_obj
        except Exception,e:
            log.exception(e)
            response_obj = JSONResponse("error", c.messages.BOOK_SAVE_UNKNOWN_ERROR)
            return response_obj
