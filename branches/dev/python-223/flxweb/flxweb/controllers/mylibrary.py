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

from pylons.decorators import jsonify
import re
from pylons import response, request,tmpl_context as c
from pylons.controllers.util import abort
from pylons.controllers.util import abort
from pylons.templating import render_jinja2
from pylons.i18n.translation import _
from flxweb.controllers.dashboard import DashboardController
from flxweb.lib.ck12.decorators import login_required
from flxweb.lib.ck12.exceptions import LabelAlreadyExistsException
from flxweb.lib.pagination import *
from flxweb.lib.ck12.json_response import JSONResponse
from flxweb.model.library import *
from functools import partial
import logging
from flxweb.model.modality import ModalityManager
try: 
    import simplejson as json
except ImportError: 
    import json

log = logging.getLogger(__name__)


class MylibraryController(DashboardController):

    # Constants for identifying the object types
    OBJ_CONTENT = 'content'
    OBJ_FILES = 'files' 

    # Values shown in the 'FILTER BY TYPE' section
    ITEM_TYPE_BOOKS = {'label':_('FlexBooks'),'key':'book', 'object_type': OBJ_CONTENT}
    ITEM_TYPE_CONCEPTS = {'label':_('Read Modalities'),'key':'concept', 'object_type': OBJ_CONTENT}
    ITEM_TYPE_FILES = {'label':_('Files'),'key':'resources', 'object_type': OBJ_FILES}
   
    dict_modtypes = ModalityManager.get_modalities()
    conf_types = config.get('modality_filter_types').split(',')
    ITEM_TYPE_MODALITIES = [{'label':_(dict_modtypes.get(i).get('display_label')),'key':i,'object_type': OBJ_CONTENT} for i in conf_types if i in dict_modtypes.keys()]
     
    ITEM_TYPES = [ITEM_TYPE_BOOKS,ITEM_TYPE_CONCEPTS]
    ITEM_TYPES.extend(ITEM_TYPE_MODALITIES) 
    ITEM_TYPES.append(ITEM_TYPE_FILES) 
    
    def get_mylibrary_page_size(self):
        return config.get( 'mylibrary_page_size' )

    @login_required()
    def tabs(self,object_type=None,tab=None,item_type=None,label=None):

        c.item_types = MylibraryController.ITEM_TYPES
               
        #default to my tab 
        if not tab:
            tab = MylibraryController.TAB_CONTENT

        #default to content object type
        if not object_type:
            object_type = MylibraryController.OBJ_CONTENT 

        # default to books
        if not item_type:
            item_type = MylibraryController.ITEM_TYPE_BOOKS['key'] 

        # default to 'all' label
        if not label:
            label = LibraryManager.LABEL_ALL_ITEMS['label']  

        for item in MylibraryController.ITEM_TYPES:
            if item['key'] == item_type:
                c.item_type_label = item['label'] 

        # set context variables
        c.object_type = object_type
        c.tab = tab
        c.item_type = item_type


        # decide what to render based on the tab,object_type and item_type
        # if tab=my,object-type= content,label = archive => my/content/archive/
        # if tab=my,object_type = content,item_type=book|concept => my/content/
        # if tab=my,object_type = files, item_type=all => my/files/all/
        # if tab=fav,object_type = content,item_type=book|concept => fav/content/
        # if tab=fav,object_type = files, item_type=all => fav/files/all/
        if object_type == MylibraryController.OBJ_CONTENT and\
            tab == MylibraryController.TAB_CONTENT and\
            label == LibraryManager.LABEL_ARCHIVED['label']:
                return self.my_artifacts_archive(item_type,label)
        elif object_type == MylibraryController.OBJ_FILES and\
            tab == MylibraryController.TAB_CONTENT and\
            label == LibraryManager.LABEL_ARCHIVED['label']:
                return self.my_resources_archive(item_type,label)
        elif object_type == MylibraryController.OBJ_CONTENT and\
            tab == MylibraryController.TAB_CONTENT:
                return self.my_artifacts(item_type,label)
        elif object_type == MylibraryController.OBJ_CONTENT and\
            tab == MylibraryController.TAB_BOOKMARKS:
                return self.fav_artifacts(item_type,label)
        elif object_type == MylibraryController.OBJ_FILES and\
            tab == MylibraryController.TAB_CONTENT:
                return self.my_resources(item_type, label)
        elif object_type == MylibraryController.OBJ_FILES and\
            tab == MylibraryController.TAB_BOOKMARKS:
                return self.fav_resources(item_type, label)
        elif tab == MylibraryController.TAB_TESTS:
                return self.my_tests(item_type, label)
        else:
            abort(404)

    @login_required()
    def my_artifacts(self,artifact_type=None,label=None):
        # if we are looking for concepts, then only show 
        # 'lesson' because from flxweb app point of view, 
        # they are same as concept.
        # do not show "concept" to avoid duplicates. see bug #7059
        if artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT:
            artifact_type = 'lesson'
        self.artifacts(artifact_type,label,ownership=LibraryManager.OWNERSHIP_OWNED)
        return render_jinja2 ('/mylibrary/contents.html')

    @login_required()
    def my_artifacts_archive(self,artifact_type=None,label=None):
        # if we are looking for concepts, then only show 
        # 'lesson' because from flxweb app point of view, 
        # they are same as concept.
        # do not show "concept" to avoid duplicates. see bug #7059
        if artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT:
            artifact_type = 'lesson'
        self.artifacts(artifact_type,label,ownership=LibraryManager.OWNERSHIP_OWNED)
        return render_jinja2 ('/mylibrary/archive.html')

    @login_required()
    def fav_artifacts(self,artifact_type=None,label=None):
        # if we are looking for concepts, then only show 
        # 'lesson' and 'section' for bookmarks 
        # because from flxweb app point of view, 
        # they are same as concept.
        # do not show "concept" to avoid duplicates. see bug #7059
        if artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT:
            artifact_type = 'lesson,section'
        self.artifacts(artifact_type,label,ownership=LibraryManager.OWNERSHIP_BOOKMARKS)
        return render_jinja2 ('/mylibrary/favorites.html')


    @login_required()
    def my_resources_archive(self,artifact_type=None,label=None):
        self.resources(artifact_type,label,ownership=LibraryManager.OWNERSHIP_OWNED)
        return render_jinja2 ('/mylibrary/files_archive.html')

    @login_required()
    def artifacts(self,artifact_type=None,label=None,ownership=None):
        # get the sort parameter
        c.sort = request.GET.get('sort')

        if not c.sort:
            c.sort = 'updateTime,desc'
        c.sort_options = [ ("name,asc","Name A..Z"),\
                        ("name,desc","Name Z..A"),\
                        ("creationTime,desc","Newest first"),\
                        ("creationTime,asc","Oldest first"),\
                        ("updateTime,desc","Recently modified"),\
                        ("updateTime,asc","Oldest modified")]

        # get the page number
        page_number = request.GET.get('pageNum')
        if not page_number:
            page_number = 1
        else:
            page_number = int(page_number)


        page_size = self.get_mylibrary_page_size()

        labels = [label]
        c.selected_label = label

        if c.selected_label and\
            c.selected_label == LibraryManager.LABEL_ARCHIVED['label']:
            c.archived_items = True
        else:
            c.archived_items = False


        # if for 'book' show all types of books
        if artifact_type == ArtifactManager.ARTIFACT_TYPE_BOOK:
            artifact_type = ','.join(ArtifactManager.BOOK_TYPES)

        pageable = PageableWrapper(partial(LibraryManager.get_artifacts,\
                                    artifact_types=artifact_type,
                                    labels=labels,
                                    sort=c.sort,
                                    ownership=ownership,
                                    return_total_count=True))

        c.paginator = Paginator(pageable,page_number,page_size)

        c.labels = LibraryManager.get_labels()
        # combine system and my labels in a flat list for json
        all_labels = []
        if c.labels:
            all_labels.extend(c.labels['system'])
            all_labels.extend(c.labels['my'])
        c.labels_json = json.dumps(all_labels)

    
    @login_required()
    def my_resources(self,artifact_type=None,label=None):
        self.resources(artifact_type,label,ownership=LibraryManager.OWNERSHIP_OWNED)
        return render_jinja2 ('/mylibrary/fileslist.html')

    @login_required()
    def fav_resources(self,artifact_type=None,label=None):
        self.resources(artifact_type,label,ownership=LibraryManager.OWNERSHIP_BOOKMARKS)
        return render_jinja2 ('/mylibrary/favoritefiles.html')
    
    @login_required()
    def resources(self,resource_type=None,label=None, ownership=None):
        # get the sort parameter
        c.sort = request.GET.get('sort')

        if not c.sort:
            c.sort = 'creationTime,desc'
        c.sort_options = [ ("name,asc","Name A..Z"),\
                        ("name,desc","Name Z..A"),\
                        ("creationTime,desc","Newest first"),\
                        ("creationTime,asc","Oldest first")]

       
        # get the page number
        page_number = request.GET.get('pageNum')
        if not page_number:
            page_number = 1
        else:
            page_number = int(page_number)

        page_size = self.get_mylibrary_page_size()
 
        labels = [label]
        c.selected_resource_type = resource_type
        c.selected_label = label

        if c.selected_label and\
            c.selected_label == LibraryManager.LABEL_ARCHIVED['label']:
            c.archived_items = True
        else:
            c.archived_items = False

        pageable = PageableWrapper(partial(LibraryManager.get_resources,\
                                    resource_types='resource',
                                    labels=labels,
                                    sort=c.sort,
                                    ownership=ownership,
                                    return_total_count=True))

        c.paginator = Paginator(pageable,page_number,page_size)

        c.labels = LibraryManager.get_labels()
        # combine system and my labels in a flat list for json
        all_labels = []
        all_labels.extend(c.labels['system'])
        all_labels.extend(c.labels['my'])
        c.labels_json = json.dumps(all_labels)


    @login_required()
    def dlg_add_to_library(self):
        c.labels = LibraryManager.get_labels(include_system_labels=True,
                                             include_app_labels=False)
        # combine system and my labels in a flat list for json
        all_labels = []
        all_labels.extend(c.labels['system'])
        all_labels.extend(c.labels['my'])
        c.all_labels_json = json.dumps(all_labels)
        return render_jinja2 ('/mylibrary/dialog_addtolibrary.html')

    @login_required()
    def ajax_apply_labels(self):
        try:
            item = json.loads(request.body)
            object_type = 'artifactRevision'
            object_for_api = {}
            
            if 'artifactRevisionID' in item:
                object_for_api = {'objectID':item['artifactRevisionID']}
            
            if 'resourceRevisionID' in item:
                object_type = 'resourceRevision'
                object_for_api = {'objectID':item['resourceRevisionID']}

            if 'systemLabels' in item and item['systemLabels']:
                object_for_api['systemLabels'] = item['systemLabels']

            if 'myLabels' in item and item['myLabels']:
                object_for_api['labels'] = item['myLabels']
            
            LibraryManager.add_objects_to_library([object_for_api],object_type)
        except Exception,e:
            response.status = 301
            return JSONResponse(JSONResponse.STATUS_ERROR, _(str(e)) )

    @login_required()
    @jsonify
    def ajax_remove(self,id,object_type):
        if object_type == MylibraryController.OBJ_CONTENT:
            object_type = 'artifactRevision'
        elif object_type == MylibraryController.OBJ_FILES:
            object_type = 'resourceRevision'
            
        try:
            LibraryManager.remove_from_library(id, object_type)
            #backbone.js destroy needs some minimal json to be returned
            return {'id':id}
        except Exception,e:
            response.status = 301
            return JSONResponse(JSONResponse.STATUS_ERROR, _(str(e)) )


    @login_required()
    def ajax_archive(self,id,object_type):
        
        if object_type == MylibraryController.OBJ_CONTENT:
            object_type = 'artifactRevision'
        elif object_type == MylibraryController.OBJ_FILES:
            object_type = 'resourceRevision'
            
        try:
            LibraryManager.archive_objects([id], object_type)
        except Exception,e:
            response.status = 301
            return JSONResponse(JSONResponse.STATUS_ERROR, _(str(e)) )

    @login_required()
    @jsonify
    def ajax_delete_label(self,id):
        try:
            label = Label.getLabelFromId(id)
            return LibraryManager.delete_label(label)
        except Exception,e:
            response.status = 301
            return JSONResponse(JSONResponse.STATUS_ERROR, _('Error delete label') )

    @login_required()
    @jsonify
    def ajax_update_label(self):
        try:
            label = json.loads(request.body)
            if re.search("[!#$%&'*+\/=?^_`{}\",;.]+",label['label']):
                return JSONResponse(JSONResponse.STATUS_ERROR, _('Invalid label. A label can contain numbers, letters, spaces and hyphens'))
            if 'action' in label and\
                label['action'] == 'create':
                label = LibraryManager.create_label(label['label'])
            else:
                label = LibraryManager.update_label(label['label'])

            return JSONResponse(JSONResponse.STATUS_OK, data=label )
        except LabelAlreadyExistsException,e:
            return JSONResponse(JSONResponse.STATUS_ERROR, _('Label already exists') )
        except Exception,e:
            log.exception(e)
            return JSONResponse(JSONResponse.STATUS_ERROR, _('Error creating label') )
    
    @login_required()    
    def my_tests(self,artifact_type=None,label=None):
        return render_jinja2 ('/exercise_ae/my_tests.html')

    @login_required()    
    def bookmarks(self,anything=None):
        return render_jinja2 ('/mylibrary/bookmarks_removed.html')
        
    @login_required()
    def library_new(self, anything=None):
        c.page_name = 'my_content'
        return render_jinja2('/mylibrary/library.html')


