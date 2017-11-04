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
# This file originally written by Nachiket Karve
#
# $Id$

from flxweb.config.routing import make_map
from flxweb.controllers.decorators import jsonify
from flxweb.lib.base import BaseController
from flxweb.lib.ck12.decorators import login_required
from flxweb.lib.ck12.exceptions import EmbeddedObjectException,\
    CreateCustomCoverException, ArtifactAlreadyExistsException,\
    RosettaValidationException, InvalidImageException, ArtifactNotLatestException,\
    DuplicateChapterTitleException,DuplicateEncodedIDException,InvalidDomainEIDEncodedIDException,\
    EmptyArtifactTitleException
from flxweb.lib.ck12.json_response import JSONResponse
from flxweb.lib.ck12.util import getUSStatesList, parse_perma, replace_last
from flxweb.lib.pagination import PageableWrapper, Paginator
from flxweb.model.artifact import ArtifactManager, FlexBookArtifact, LessonArtifact
from flxweb.model.embeddedobject import EmbeddedObjectManager
from flxweb.model.gdtimport import GDTImporter
from flxweb.model.math import MathManager
from flxweb.model.conceptNode import ConceptNodeManager
from pylons.controllers.util import redirect
from functools import partial
from pylons import config, request, response, tmpl_context as c
from pylons.controllers.util import abort
from pylons.templating import render_jinja2
import logging
import simplejson
from flxweb.model.task import TaskManager
import os
import shutil
import base64
from flxweb.model.resource import ResourceManager
from flxweb.model.browseTerm import BrowseManager
from flxweb.lib.helpers import url
from urllib import quote, unquote
from flxweb.model.modality import ModalityManager
from flxweb.model.user import UserManager

log = logging.getLogger(__name__)

class EditorController(BaseController):

    @login_required()
    def edit_artifact(self, perma_handle):
        perma_handle.rstrip('/') #strip all trailing slashes
        perma_handle = '%s/' % perma_handle #and add just one
        perma = parse_perma(perma_handle.encode('utf-8'))
        use_details = True
        if not perma:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

        artifact_type = perma['artifact_type']
        artifact_handle = perma['artifact_title']
        artifact_handle = unquote(unquote( artifact_handle ))
        artifact_realm = perma['realm']

        ext = perma['ext']
        #process ext
        ext_params = {}
        current_user_data =  UserManager.getLoggedInUser()
        if ext:
            params = ext.split('/')
            if params[0].lower().startswith('r'):
                version = params[0].strip('r')
                ext_params['version'] = version
        ext_params.update({'forUpdate':'true'})
        #in case of concept, fetch lesson
        if artifact_type == 'concept':
            artifact_type = 'lesson'
            ext_params.update({'includeConceptContent':'true'})

        artifact = ArtifactManager.getArtifactByPerma(artifact_type, artifact_handle, artifact_realm, ext_params, details=use_details)

        if artifact:
            if ext:
                params = ext.split('/')
                if params[0].lower().startswith('r'):
                    if current_user_data and current_user_data['id'] == artifact['creatorID'] and artifact['latestRevision'] != artifact['revision']:
                        updated_perma_handle = replace_last(perma_handle, ext + '/', '')
                        return redirect('/editor/' + updated_perma_handle,code=301)

            if artifact.get('artifactType') in ArtifactManager.BOOK_TYPES:
                c.Book_Types = ArtifactManager.BOOK_TYPES

            collection_creator_id =  request.GET.get('collectionCreatorID')
            concept_collection_handle  = request.GET.get('conceptCollectionHandle')
            collections = []

            if current_user_data and current_user_data['id'] != artifact['creatorID']:
                
                artifact['collections'] = []
                if collection_creator_id and concept_collection_handle :
                    collection_handle_data =  concept_collection_handle.split('-::-')

                    collection_data = ModalityManager.get_collection_info(collection_handle_data[0], collection_handle_data[1], collection_creator_id)

                    concept_collection_title = ''
                    collection_title = ''

                    if 'collection' in collection_data:
                        collection_title =  collection_data['collection']['title']
                        concept_collection_title= collection_data['collection']['descendantCollection']['title']
                        eid =  collection_data['collection']['descendantCollection']['encodedID']
                        collection_creator_id = collection_data['collection']['descendantCollection']['creatorID']

                    artifact['collections'] = [{
                        'collectionCreatorID' : collection_creator_id,
                        'collectionHandle' : collection_handle_data[0],
                        'conceptCollectionAbsoluteHandle': collection_handle_data[1],
                        'collectionTitle' : collection_title,
                        'conceptCollectionTitle': concept_collection_title,
                        'encodedID': eid
                    }]

            
            return self.render_artifact_editor(artifact)
        else:
            abort(404)

    @login_required()
    def render_artifact_editor(self, artifact):
        if artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_LESSON:
            artifact['objectives'] = artifact.get_objectives()
            artifact['vocabulary'] = artifact.get_vocabulary()
        artifact['artifactXHTML'] = artifact.getXHTML()

        c.artifact = artifact
        c.artifact_json = simplejson.dumps(artifact)
        #if not artifact.is_new():
        #    attachments = ArtifactManager.get_artifact_resources(artifact['artifactType'], quote(artifact['handle']), artifact['realm'], artifact.getVersionNumber())
        #    c.artifact.attachments = attachments
        #    c.attachment_json = simplejson.dumps(attachments)
        template_type='concept'

        c.browseTerm = BrowseManager.getConceptGrid()
        c.gradeslist = [ str(grade['name']).lower() for grade in c.artifact.get_grades()]
        c.usstateslist = getUSStatesList()
        c.Book_Types = ArtifactManager.BOOK_TYPES
        c.page_referrer = request.headers.get('Referer', None)

        if artifact['artifactType'] in ArtifactManager.BOOK_TYPES:
            template_type = 'book'
            c.enable_modalities = False
            #[Bug 39752] if the user doesn't own the book, mark it dirty to enforce save (derivation) before editing book sections.
            if not artifact.is_owner(c.user):
                log.debug(">>>> Artifact not owned by the user. Mark it dirty.")
                artifact['__dirty'] = True

        else:
            c.enable_modalities = True
        self.fill_modality_artifact_types()

        template = 'editor/%s_editor.html' % template_type
        return render_jinja2(template)

    def fill_modality_artifact_types(self):
        dict_modtypes = ModalityManager.get_modalities()
        conf_types = config.get('modality_types').split(',')
        c.modality_artifact_types = [{'type':i,'display_label':dict_modtypes.get(i).get('display_label')} for i in dict_modtypes.keys()]

    def artifact_by_perma (self, perma_handle):
        perma_handle.rstrip('/')
        perma_handle = '%s/' % perma_handle
        perma = parse_perma(perma_handle)
        if not perma: abort(404)
        artifact = ArtifactManager.getArtifactByPerma(perma['artifact_type'], perma['artifact_title'], perma['realm'], perma['ext'])

        if not artifact: abort(404)
        response.headers['Content-type'] = 'text/json; charset=utf-8'
        return simplejson.dumps(artifact)

    def artifact_save(self, artifact_id):
        data = base64.b64decode(request.body)
        data = simplejson.loads(data)

        response_obj = None
        error_type = None
        error_msg = None
        error_exception = None

        artifact = ArtifactManager.toArtifact(data)
        try:
            if artifact.has_key('context') and artifact.has_key('position'):
                context = ArtifactManager.toArtifact(artifact.get('context'))
                #context object does not have children information yet, fetch it.
                book_handle = context.get('handle')

                #Bug 43480: send the non-cdn-url book xhtml to assemble API
                updated_context = ArtifactManager.getArtifactByPerma(artifact_type=context.get('artifactType'),artifact_title=book_handle, realm=context.get('realm'),ext={'version':context.getVersionNumber()},details=True, forUpdate=True)
                if updated_context['xhtml_prime']:
                    updated_context['xhtml'] = updated_context['xhtml_prime']
                log.debug("Updated context. XHTML: %s" % updated_context['xhtml'])
                context = updated_context

                position = artifact.get('position')
                response_obj = ArtifactManager.save_artifact_in_context( artifact, context, position )
            else:
                response_obj = ArtifactManager.saveArtifact(artifact)
        except RosettaValidationException, ex:
            error_exception = ex
            log.debug("Rosetta Validation Error!!!")
            rosetta_error_msg = ex.__str__()
            error_type = 'ROSETTA_VALIDATION_FAILED'
            if rosetta_error_msg and c.user.isAdmin():
                error_msg = 'Rosetta validator: %s'%rosetta_error_msg

        except InvalidImageException, ex:
            error_exception = ex
            log.debug("Image Validation Error!!!")
            log.debug(ex.__str__())
            error_type = 'IMAGE_ENDPOINT_VALIDATION_FAILED'

        except ArtifactAlreadyExistsException, ex:
            error_exception = ex
            if artifact.get('artifactType') in ArtifactManager.BOOK_TYPES:
                error_type ='BOOK_ALREADY_EXISTS'
            elif artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
                error_type = 'CHAPTER_ALREADY_EXISTS'
            elif artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CONCEPT or \
               artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_LESSON :
                error_type = 'CONCEPT_ALREADY_EXISTS'
            else :
                error_type = 'ARTIFACT_ALREADY_EXISTS'

        except EmptyArtifactTitleException, ex:
            error_exception = ex
            error_type = 'EMPTY_ARTIFACT_TITLE'

        except ArtifactNotLatestException, ex:
            error_exception = ex
            if artifact.get('artifactType') in ArtifactManager.BOOK_TYPES:
                error_type = 'BOOK_NOT_LATEST'
            elif artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
                error_type = 'CHAPTER_NOT_LATEST'
            elif artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CONCEPT or \
               artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_LESSON :
                error_type = 'CONCEPT_NOT_LATEST'
            else :
                error_type = 'ARTIFACT_NOT_LATEST'
        except DuplicateChapterTitleException, ex:
            error_exception = ex
            error_type = 'DUPLICATE_CHAPTER_TITLE'
        except DuplicateEncodedIDException, ex:
            error_exception = ex
            error_type = 'DUPLICATE_ENCODEDID'
        except InvalidDomainEIDEncodedIDException, ex:
            error_exception = ex
            error_type = 'INVALID_ENCODEDID_DOMAINEID'
        except Exception, ex:
            error_exception = ex
            error_type = 'ARTIFACT_SAVE_UNKNOWN_ERROR'
            if 'Must have either resource or children' in ex.message:
                error_type = 'ARTIFACT_SAVE_NOXHTML_ERROR'
            log.exception(ex)

        if error_exception:
            error_info = error_exception.getErrorInfo()
            #remove payload
            del error_info['payload']
            error_info['error_type'] = error_type
            if not error_msg:
                error_msg = getattr(c.messages, error_type)
            response_obj = JSONResponse("error", error_msg, error_info)
            if 'EXISTS' in error_type:
                response_obj['exists'] = True
            if 'Name or service not known' in error_exception.message:
                response_obj['invalid_url'] = True

        response.headers['Content-type'] = 'text/json; charset=utf-8'
        return simplejson.dumps(response_obj)

    def artifact_by_id (self, artifact_id):
        artifact = ArtifactManager.getArtifactById(artifact_id, details=True, forUpdate=True)
        if not artifact:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)
        response.headers['Content-type'] = 'text/json; charset=utf-8'
        return simplejson.dumps(artifact)

    def artifact_delete(self, artifact_id):
        pass

    def preview_math_expression(self):
        math_types = ['block', 'inline', 'alignat']
        math_type = request.POST.get('type','')
        expr = request.POST.get('expression')
        if math_type not in math_types or expr is None:
            abort(404)
        responseDict = MathManager.renderMath(math_type, expr)
        response.headers['Content-type'] = 'application/json; charset=utf-8'
        return simplejson.dumps(responseDict)

    @jsonify()
    def ajax_create_embedded_object(self):
        embed_code = request.GET.get('embed_code')
        try:
            eo = EmbeddedObjectManager.create_embedded_object(embed_code)
        except EmbeddedObjectException, eox:
            response_obj = JSONResponse("error", eox.message)
            return response_obj
        return eo

    def ajax_get_embedded_object(self, eo_id):
        result = None
        try:
            eo = EmbeddedObjectManager.get_embedded_object_by_id(eo_id)
        except EmbeddedObjectException, eox:
            response_obj = JSONResponse("error", eox.message)
            result = response_obj
        result = eo
        response.headers['Content-type'] = 'text/json; charset=utf-8'
        return simplejson.dumps(result)

    def artifact_editor_context_book(self, booktype, book_handle, version, position, section_title=None, realm=None):
        ext = {'forUpdate':'true'}
        artifact = ArtifactManager.getPermaDescendantArtifact(artifact_type=booktype, artifact_title=book_handle, version=version, section=position, realm=realm, ext=ext)
        if not artifact:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

        current_user_data =  UserManager.getLoggedInUser()

        if current_user_data and current_user_data['id'] != artifact['creatorID']:      
            artifact['collections'] = []

        ancestors = artifact.get_ancestors()
        context = ancestors.get('0.0')
        book_handle = context.get('handle')
        
        if (not context.is_latest()) and current_user_data and current_user_data['id'] == artifact['creatorID'] :
            current_version = context.getVersionNumber()
            latestVersionNumber = context.getLatestVersionNumber()
            updated_request = replace_last(request.url, '/r' + current_version + '/', '/r' + latestVersionNumber + '/')
            return redirect(updated_request,code=301)

        chapter = None
        if not position.endswith('.0'):
            chapter_position = '%s.0' % position.split('.')[0]
            chapter = ancestors.get(chapter_position)

        url_book_context = '%s/%s/v%s/section/' % (booktype, book_handle, version )
        if realm:
            url_book_context = '%s/%s' % ( realm, url_book_context )

        artifact['context'] = context
        artifact['position'] = position

        c.position = position
        c.url_book_context = url_book_context
        c.title = section_title

        #build breadcrumbs
        breadcrumbs = []
        breadcrumbs.append({
            'perma': url_book_context,
            'title':context.get('title')
        })
        if not position.endswith('.0'):
            #chapter_position = '%s.0' % position.split('.')[0]
            #chapter = ArtifactManager.getPermaDescendantArtifact(booktype, book_handle, version, chapter_position, realm)
            chapter_url = '%s/section/%s' % (url_book_context, chapter_position)
            breadcrumbs.append({'perma':chapter_url,'title':chapter.get('title')})
        section_url = '%s/section/%s' % (url_book_context, position)
        breadcrumbs.append({'perma': section_url,'title':artifact.get('title')})
        c.breadcrumbs = breadcrumbs

        return self.render_artifact_editor(artifact)

    def dialog_addcontent(self):
        c.mode = 'dialog'
        if request.params.has_key('mode'):
            c.mode = request.params['mode']
        return render_jinja2('editor/dialog_addcontent.html')

    def dialog_chapteredit(self):
        return render_jinja2('editor/dialog_chapteredit.html')

    def dialog_managecollaborators(self):
        return render_jinja2('editor/dialog_managecollaborators.html')

    def dialog_addconceptnode(self):
        return render_jinja2('editor/dialog_addconceptnode.html')

    def dialog_addfromgdocs(self):
        #get flx2 cookie if not already authorized for gdocs
        if not GDTImporter.is_authorised_for_gdocs():
            cookies = GDTImporter.get_flx2_cookie()
            if cookies and 'response' in cookies:
                log.debug(cookies['response'])
                domain = config.get('flx_cookie_domain')
                log.debug("cookie domain: %s" % domain)
                response.set_cookie(cookies['response']['name'],cookies['response']['cookie'],domain=domain)

        if request.GET.get('showCollections'):
            c.show_collections = True
            c.enable_modalities = True
        self.fill_modality_artifact_types()
        return render_jinja2('editor/dialog_addfromgdocs.html')

    def gdt_auth_confirm(self):
        if request.GET.get('error'):
            html = "<div><center><br/><br/><br/><b>Unable to complete Google Authentication.<br/>Error:%s</b><br/><br/><input type='button' name='close' value='Close' onclick='window.close();'/></div>" % request.GET['error']
            return '<!DOCTYPE html><html><head><title>Auth Error</title></head><body>%s</body></html>' % html
        js_snippet = '<script language="javascript" type="text/javascript">'
        js_snippet = js_snippet + 'var o = window.opener;'
        js_snippet = js_snippet + 'try { if(o && o.$ && o.$.flxweb && o.$.flxweb.events){o.$.flxweb.events.triggerEvent(o.document,"flxweb.gdtimport.auth_success")} } catch(err) {}'
        js_snippet = js_snippet + 'window.close();'
        js_snippet = js_snippet + '</script>'
        #remove the cookie after gdocs authorization
        if GDTImporter.is_authorised_for_gdocs():
            log.debug("Authorised with gdocs, remove cookie")
            cookies = GDTImporter.get_flx2_cookie()
            if cookies and 'response' in cookies:
                domain = config.get('flx_cookie_domain')
                log.debug("cookie domain: %s" % domain)
                #response.set_cookie(cookies['response']['name'],max_age=0, domain=domain)
        return '<!DOCTYPE html><html><head><title>Auth Success</title>%s</head><body></body></html>' % js_snippet

    def gdt_auth_status(self):
        status = GDTImporter.is_authorised_for_gdocs()
        log.debug("Authorised for gdocs: %s " %status)
        response.headers['Content-type'] = 'application/json; charset=utf-8'
        return simplejson.dumps({'gdt_authenticated':status})

    def gdt_list_docs(self):
        # get the page number
        page_number = request.GET.get('pageNum')
        if not page_number:
            page_number = 1
        else:
            page_number = int(page_number)
        page_size = 10
        pageable = PageableWrapper(partial(GDTImporter.get_gdoc_list,return_total_count=True))
        c.gdocs_paginator = Paginator(pageable, page_number, page_size)
        c.page_num = page_number
        c.doc_type = 'document'
        c.enable_modalities = False
        return render_jinja2('editor/ajax_gdocs_list.html')

    def gdt_list_collections(self):
        page_number = request.GET.get('pageNum')
        if not page_number:
            page_number = 1
        else:
            page_number = int(page_number)
        page_size = 10
        pageable = PageableWrapper(partial(GDTImporter.get_gdoc_list,return_total_count=True, list_folders=True))
        c.gdocs_paginator = Paginator(pageable, page_number, page_size)
        c.show_collections = True
        c.enable_modalities = True
        c.page_num = page_number
        c.doc_type = 'folder'
        return render_jinja2('editor/ajax_gdocs_list.html')

    def gdt_task_create(self):
        docid = request.GET.get('docID')
        title = request.GET.get('title')
        artifactType = request.GET.get('artifactType','lesson')
        task = TaskManager.create_gdt_import_task(docid, title, artifactType)
        response.headers['Content-type'] = 'application/json; charset=utf-8'
        return simplejson.dumps(task)

    def dialog_uploadworddoc(self):
        return render_jinja2('editor/dialog_uploadworddoc.html')

    def xdt_upload(self):
        title = request.POST.get('txt_xdt_upload')
        artifactType = request.POST.get('artifactType','lesson')
        filelike = request.POST.get('file_xdt_upload')

        #Encode file name, to take care for unicode characters.
        file_name = filelike.filename.encode("utf-8")
        if not title:
            title = file_name.lstrip(os.sep)

        #persist the filelike object
        filename = '%s-%s' % (ResourceManager.get_upload_filename_prefix(), file_name.lstrip(os.sep) )
        stored_filename = os.path.join(ResourceManager.get_upload_dir(), filename )
        stored_file = open(stored_filename, 'w')
        shutil.copyfileobj(filelike.file, stored_file)
        filelike.file.close()
        stored_file.close()

        log.debug('uploading document to XDT: %s' % file_name)
        task = TaskManager.create_xdt_import_task(stored_filename, title, artifactType)
        if  'ACCEPT' in request.headers and\
            'application/json' in request.headers['ACCEPT']:
            response.headers['Content-type'] = 'application/json; charset=utf-8'
        else:
            response.headers['Content-type'] = 'text/plain; charset=utf-8'

        if 'X-Requested-With' in request.headers and 'XMLHttpRequest' in request.headers['X-Requested-With']:
            return simplejson.dumps(task)
        else:
            response.headers['Content-type'] = 'text/html; charset=utf-8'
            return "<html><body>%s</body></html>" % simplejson.dumps(task)

    def new_artifact(self, artifact_type):
        artifact = None
        c.returnTo = request.GET.get('returnTo') or '/my/library'
        if artifact_type in ArtifactManager.BOOK_TYPES:
            artifact = FlexBookArtifact({'id': 'new',
                                         'title': 'Untitled FlexBook'})

        else:
            collection_creator_id =  request.GET.get('collectionCreatorID')
            concept_collection_handle  = request.GET.get('conceptCollectionHandle')
            eid  = request.GET.get('eid')
            collections = []

            if collection_creator_id and concept_collection_handle :
                collection_handle_data =  concept_collection_handle.split('-::-')

                collection_data = ModalityManager.get_collection_info(collection_handle_data[0], collection_handle_data[1], collection_creator_id)

                concept_collection_title = ''
                collection_title = ''

                if 'collection' in collection_data:
                    collection_title =  collection_data['collection']['title']
                    concept_collection_title= collection_data['collection']['descendantCollection']['title']
                    eid =  collection_data['collection']['descendantCollection']['encodedID']

                collections.append({
                    'collectionCreatorID' : collection_creator_id,
                    'collectionHandle' : collection_handle_data[0],
                    'conceptCollectionAbsoluteHandle': collection_handle_data[1],
                    'collectionTitle' : collection_title,
                    'conceptCollectionTitle': concept_collection_title,
                    'encodedID': eid
                })

            artifact = LessonArtifact({'id': 'new',
                                         'title': 'Untitled Modality',
                                         'collections': collections
                                         })
            c.enable_modalities = True
            c.context_query_perma = False
            context_perma = request.GET.get('context')
            if context_perma:
                c.context_query_perma = True
                perma = parse_perma(context_perma.encode('utf-8'))
                if perma:
                    context_type = perma['artifact_type']
                    context_handle = perma['artifact_title']
                    context_realm = perma['realm']
                    ext = perma['ext']
                    #process ext
                    ext_params = {}
                    if ext:
                        params = ext.split('/')
                        if params[0].lower().startswith('r'):
                            version = params[0].strip('r')
                            ext_params['version'] = version
                    context_artifact = ArtifactManager.getArtifactByPerma(context_type, context_handle, context_realm, ext_params, details=True)
                    if context_artifact:
                        position = '1.0'
                        if context_artifact.getChildren():
                            position = '%s.0' % (len(context_artifact.getChildren())+1)
                        artifact['context'] = context_artifact
                        artifact['position'] = position
                c.enable_modalities = False # hide all other options for modality in context of book.
        return self.render_artifact_editor(artifact)

    def ajax_custom_cover(self):
        booktitle = request.POST.get('book_title')
        filelike = request.POST.get('file_coverimage')
        filename = filelike.filename.encode("utf-8")
        useOriginal = request.POST.get('useOriginal', False) == 'true'
        log.debug("!here! %s " % filelike)
        imageurl = request.POST.get('txt_cover_url')
        customcover = None
        if True:
            log.debug("Image file detected.")
            try:
                #persist the filelike object
                filename = '%s-%s' % (ResourceManager.get_upload_filename_prefix(), filename.lstrip(os.sep) )
                stored_filename = os.path.join(ResourceManager.get_upload_dir(), filename )
                stored_file = open(stored_filename, 'w')
                shutil.copyfileobj(filelike.file, stored_file)
                filelike.file.close()
                stored_file.close()

                log.debug('uploading image to custom cover endpoint: %s' % filelike.filename)
                customcover = ArtifactManager.create_custom_cover(booktitle, cover_file_path = stored_filename, useOriginal=useOriginal)
            except CreateCustomCoverException, ex:
                raise ex
        else:
            try:
                customcover = ArtifactManager.create_custom_cover(booktitle, cover_url = imageurl, useOriginal=useOriginal)
            except CreateCustomCoverException, ex:
                raise ex

        if  'ACCEPT' in request.headers and\
            'application/json' in request.headers['ACCEPT']:
            response.headers['Content-type'] = 'application/json; charset=utf-8'
        else:
            response.headers['Content-type'] = 'text/plain; charset=utf-8'

        if 'X-Requested-With' in request.headers and 'XMLHttpRequest' in request.headers['X-Requested-With']:
            return  simplejson.dumps({'custom_cover_info': customcover})
        else:
            response.headers['Content-type'] = 'text/html; charset=utf-8'
            return "<html><body>%s</body></html>" % simplejson.dumps({'custom_cover_info': customcover})

    def ajax_artifact_info(self, revision_id):
        artifact = None
        try:
            artifacts = ArtifactManager.get_artifacts_by_revision_ids([revision_id])
            artifact = artifacts[0]
            if artifact.get('artifactType') in ArtifactManager.BOOK_TYPES :
                children_revision_ids = [ chapter.get_revision_id() for chapter in artifact.getChildren() ]
                children_list = ArtifactManager.get_artifacts_by_revision_ids(children_revision_ids)
                sequensed_children_list = []

                for child in artifact.getChildren():
                    child_id = child.get_artifact_id()
                    for _child in children_list:
                        if _child.get_artifact_id() == child_id:
                            if _child.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
                                _child['bookTitle'] = artifact.get('title')
                            sequensed_children_list.append(_child)

                artifact.set_children(sequensed_children_list)
            response.headers['Content-type'] = 'application/json; charset=utf-8'
            return simplejson.dumps(artifact)



        except Exception, ex:
            raise ex

    def ajax_search_concept_node(self):
        search_term = request.GET.get('q')
        format = request.GET.get('format')

        pageNum = request.GET.get('pageNum')
        if not pageNum:
            pageNum = 1
        else:
            pageNum = int(pageNum)

        pageSize = request.GET.get('pageSize')
        if not pageSize:
            pageSize = 10
        else:
            pageSize = int(pageSize)

        if format == 'json':
            nodes = ConceptNodeManager.browseConceptNode(search_term,pageNum,pageSize)
            return simplejson.dumps(nodes)
        else:
            pageable = PageableWrapper(partial(ConceptNodeManager.browseConceptNode,search_term=search_term,return_total_count=True))
            c.search_paginator = Paginator(pageable, pageNum, pageSize)
            return render_jinja2('editor/ajax_concept_nodes_list.html')

    def ajax_search_collection_node(self):
        search_term = request.GET.get('q')
        format = request.GET.get('format')

        pageNum = request.GET.get('pageNum')
        if not pageNum:
            pageNum = 1
        else:
            pageNum = int(pageNum)

        pageSize = request.GET.get('pageSize')
        if not pageSize:
            pageSize = 10
        else:
            pageSize = int(pageSize)

        if format == 'json':
            nodes = ConceptNodeManager.browseCollectionNode(search_term,pageNum,pageSize)
            return simplejson.dumps(nodes)
        else:
            pageable = PageableWrapper(partial(ConceptNodeManager.browseCollectionNode,search_term=search_term,return_total_count=True))
            c.search_paginator = Paginator(pageable, pageNum, pageSize)
            return render_jinja2('editor/ajax_collection_nodes_list.html')
