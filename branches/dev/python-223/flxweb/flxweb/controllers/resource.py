from flxweb.lib.base import BaseController
from flxweb.lib.ck12.exceptions import ResourceAssociationException, \
    RemoteAPIStatusException, RemoteAPIException, ResourceAlreadyExistsException,\
    ResourceExceedsSizeLimitException, ResourceNotFoundException,\
    ResourceSaveException
from flxweb.lib.ck12.json_response import JSONResponse
from flxweb.lib.ck12.messages import RESOURCE_ALREADY_EXISTS, \
    RESOURCE_ASSOCIATION_FAILED, RESOURCE_UPLOAD_FAILED, RESOURCE_FILE_TOO_LARGE,\
    RESOURCE_SAVE_FAILED
from flxweb.model.artifact import ArtifactManager
from flxweb.model.resource import ResourceManager
from pylons import request, response, tmpl_context as c
import logging
import os
import simplejson
from pylons.controllers.util import abort
from pylons.templating import render_jinja2
from flxweb.lib.ck12.decorators import login_required
from flxweb.model.browseTerm import BrowseManager
from flxweb.model.modality import ModalityManager
from flxweb.lib.helpers import url
from flxweb.controllers.decorators import jsonify
from flxweb.lib.ck12 import messages
from flxweb.controllers.decorators import jsonify
from flxweb.lib.ck12 import messages


log = logging.getLogger(__name__)

class ResourceController(BaseController):

    def resource_upload(self):
        params = request.POST
        filelike = params.get('uploadfile', None)
        resource_type = params.get('type','attachment')
        resource_desc = params.get('desc','')
        resource_uri = params.get('src',None)
        resource_id = params.get('resourceid','')
        is_attachment = params.get('isAttachment', False) == 'true'
        is_public = params.get('isPublic', False) == 'true'
        is_external = params.get('isExternal','0') == '1'
        force_unique = params.get('forceUnique', False)
        resource_name = params.get('resource_name', None)
        fileobj_present = False

        try:
            fileobj_present = hasattr(filelike,'file')
        except:
            fileobj_present = False

        if fileobj_present:
            resource_name = resource_handle = filelike.filename
            if force_unique:
                resource_name = resource_handle = '%s-%s' % (ResourceManager.get_upload_filename_prefix(), resource_name)
            resource_fileobj = filelike.file
        elif resource_uri and not resource_name:
            resource_name = os.path.basename(resource_uri)
            is_external = True
            resource_handle = '%s-%s' % (ResourceManager.get_upload_filename_prefix(), os.path.basename(resource_uri) )
            resource_fileobj = None
        else:
            resource_handle = params.get('resource_handle','')
            resource_fileobj = None
        try:
            _response = ResourceManager.save_resource(resource_name = resource_name,
                                                 resource_desc = resource_desc,
                                                 resource_type=resource_type,
                                                 resource_id=resource_id,
                                                 resource_fileobj = resource_fileobj,
                                                 resource_handle=resource_handle,
                                                 is_attachment = is_attachment,
                                                 is_public = is_public,
                                                 resource_uri=resource_uri,
                                                 is_external=is_external)
        except ResourceAlreadyExistsException, ex:
            existing_resource = ex.resource
            _response = JSONResponse("error", RESOURCE_ALREADY_EXISTS, {"reason" : "RESOURCE_ALREADY_EXISTS","resource": existing_resource})
        except ResourceSaveException:
            _response = JSONResponse("error",RESOURCE_SAVE_FAILED, {"reason" : "RESOURCE_SAVE_FAILED"})
        except ResourceExceedsSizeLimitException:
            _response = JSONResponse("error", RESOURCE_FILE_TOO_LARGE, {"reason" : "RESOURCE_FILE_TOO_LARGE"})
        except RemoteAPIStatusException, ex:
            _response = JSONResponse("error", "Unknown Error")
        except Exception, ex:
            _response = JSONResponse("error", "Unknown Error")

        if  'ACCEPT' in request.headers and\
            'application/json' in request.headers['ACCEPT']:
            response.headers['Content-type'] = 'application/json; charset=utf-8'
        else:
            response.headers['Content-type'] = 'text/plain; charset=utf-8'

        if 'X-Requested-With' in request.headers and 'XMLHttpRequest' in request.headers['X-Requested-With']:
            return  simplejson.dumps(_response)
        else:
            response.headers['Content-type'] = 'text/html; charset=utf-8'
            return "<html><body>%s</body></html>" % ( simplejson.dumps(_response) )



    def resource_delete(self, resource_id):
        delete_status = simplejson.dumps({})
        try:
            delete_status = ResourceManager.delete_resource_by_id(resource_id)
            log.debug("delete status: %s" % delete_status)
        except RemoteAPIStatusException:
            pass
        response.headers['Content-type'] = 'text/json; charset=utf-8'
        return simplejson.dumps(delete_status)

    def attachment_upload(self, artifact_id, artifact_revision_id):
        filelike = request.POST.get('uploadfile')
        is_public = request.POST.get('isPublic', False)
        desc = request.POST.get('desc', '')
        resource = None
        _response = None
        try:
            resource = ResourceManager.save_resource(resource_name = filelike.filename,
                                                 resource_desc = desc,
                                                 resource_fileobj=filelike.file,
                                                 is_attachment="true",
                                                 is_public=is_public)
            if resource:
                resource_id = resource.get('id')
                resource_revision_id = resource.get('resourceRevisionID')
                try:
                    ArtifactManager.attach_resource(artifact_id, artifact_revision_id, resource_id, resource_revision_id)
                    resource['associatedArtifactID']  = artifact_id
                    resource['associatedArtifactRevisionID']  = artifact_revision_id
                    _response =  resource
                except ResourceAssociationException:
                    #resource association failed, remove uploaded resource
                    ResourceManager.delete_resource_by_id(resource_id)
                    _response = JSONResponse("error", RESOURCE_ASSOCIATION_FAILED, {"reason" : "RESOURCE_ASSOCIATION_FAILED"})
            else:
                _response = JSONResponse('error', RESOURCE_UPLOAD_FAILED, {"reason":"RESOURCE_UPLOAD_FAILED"})
        except ResourceAlreadyExistsException,ex:
            existing_resource = ex.resource
            #since the resource already exists, attach it to the artifact
            try:
                resource_id = existing_resource.get('id')
                resource_revision_id = existing_resource.get('resourceRevisionID')
                ArtifactManager.attach_resource(artifact_id, artifact_revision_id, resource_id, resource_revision_id)
                _response = JSONResponse("error", RESOURCE_ALREADY_EXISTS, {"reason" : "RESOURCE_ALREADY_EXISTS","resource": existing_resource})
            except ResourceAssociationException:
                _response = JSONResponse("error", RESOURCE_ASSOCIATION_FAILED, {"reason" : "RESOURCE_ASSOCIATION_FAILED"})

        except ResourceSaveException:
            _response = JSONResponse("error",RESOURCE_SAVE_FAILED, {"reason" : "RESOURCE_SAVE_FAILED"})
        except ResourceExceedsSizeLimitException:
            _response = JSONResponse("error", RESOURCE_FILE_TOO_LARGE, {"reason" : "RESOURCE_FILE_TOO_LARGE"})
        except RemoteAPIStatusException:
            _response = JSONResponse("error", "Unknown Error")

        if  'ACCEPT' in request.headers and\
            'application/json' in request.headers['ACCEPT']:
            response.headers['Content-type'] = 'application/json; charset=utf-8'
        else:
            response.headers['Content-type'] = 'text/plain; charset=utf-8'

        if 'X-Requested-With' in request.headers and 'XMLHttpRequest' in request.headers['X-Requested-With']:
            return  simplejson.dumps(_response)
        else:
            response.headers['Content-type'] = 'text/html; charset=utf-8'
            return "<html><body>%s</body></html>" % ( simplejson.dumps(_response) )


    def attachment_delete(self, artifact_id, artifact_revision_id, resource_id, resource_revision_id):
        detach_status = None
        try:
            detach_status = ArtifactManager.remove_resource(artifact_id, artifact_revision_id, resource_id, resource_revision_id)
            log.debug("delete status: %s" % detach_status)
        except RemoteAPIStatusException, ex:
            log.debug("Resource was not detatched.")
            log.exception(ex)

        if detach_status:
            try:
                ResourceManager.delete_resource_by_id(resource_id)
            except RemoteAPIException:
                log.debug("Resource was not deleted.")
            except RemoteAPIStatusException, ex:
                log.debug("Resource was not deleted. Reason: %s" % ex.api_message)
                pass
        response.headers['Content-type'] = 'text/json; charset=utf-8'
        return simplejson.dumps(detach_status)

    @login_required()
    def render_resource_nonpublic(self, resource):
        return self.render_resource(resource)

    def render_resource(self, resource):
        c.resource = resource
        resource_template ='details/resource_details.html'
        eo = resource.get('embeddedObject',{})
        provider = eo.get('provider',{})
        if provider and provider.get('name') == 'CK-12':
            if c.modality_type and c.modality_type == 'exerciseint':
                c.ilo_embed = eo.get('code')
                resource_template = 'ilowrapper/ilowrapper.html'
        return render_jinja2(resource_template)

    def resource_details(self, resource_type, resource_handle, realm=None, stream='default'):
        try:

            ref = request.GET.get('ref')
            eid = request.GET.get('eid')
            ref_title = request.GET.get('rtitle')
            artifactID = request.GET.get('aid','')
            if eid:
                eid_branch = '.'.join( eid.split('.')[:2] )

                term_branch = BrowseManager.getBrowseTermByEncodedId(eid_branch)


                breadcrumbs = []
                if ref and ref_title:
                    crumb = url(ref, qualified=True)
                    crumb_branch = url('browse', subject=term_branch.slug())
                    breadcrumbs.append( { 'perma': crumb_branch, 'title': term_branch.get('name') } )
                    breadcrumbs.append( { 'perma': crumb, 'title': ref_title } )
                    breadcrumbs.append( {} )

                c.breadcrumbs = breadcrumbs

            # handle the case when apache strips of slash from http://
            if 'http:/' in resource_handle and not 'http://' in resource_handle:
                resource_handle = resource_handle.replace('http:/','http://')
            resource = ResourceManager.get_resource_by_perma(resource_type, resource_handle, realm, stream)

            artifactType = ''
            artifactRevisionID = ''
            # Reviews and Ratings
            if 'artifactRevisions' in resource and len(resource['artifactRevisions']):
                for artifact_rev in resource['artifactRevisions']:
                    if str(artifact_rev.get('artifactID')) == str(artifactID):
                        artifactType = artifact_rev.get('artifactType')
                        artifactRevisionID = artifact_rev.get('artifactRevisionID')
                        break
                c.artifactID = artifactID
                c.artifactRevisionID = artifactRevisionID
                c.modality_type = artifactType
                c.context_eid = eid or ''

            if resource.is_public():
                return self.render_resource(resource)
            else:
                return self.render_resource_nonpublic(resource)
        except ResourceNotFoundException:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

    def file_upload(self):
        params = request.POST
        filelike = params.get('uploadfile', None)
        fileobj_present = False
        filename = None
        fileobj = None
        _response = {}

        try:
            fileobj_present = hasattr(filelike,'file')
        except:
            pass

        if fileobj_present:
            filename = '%s-%s' % (ResourceManager.get_upload_filename_prefix(), filelike.filename)
            fileobj = filelike.file
            tmp_upload_dir = ResourceManager.get_unique_upload_dir()
            stored_file_path = ResourceManager.store_upload_file( tmp_upload_dir , filename, fileobj)
            _response = JSONResponse('ok',None, {'filepath': stored_file_path})
            if not ResourceManager.validate_resource_size(stored_file_path) :
                _response = JSONResponse('error', messages.RESOURCE_FILE_TOO_LARGE,{  })
        else:
            _response = JSONResponse('error', 'no file uploaded', {})


        if  'ACCEPT' in request.headers and\
            'application/json' in request.headers['ACCEPT']:
            response.headers['Content-type'] = 'application/json; charset=utf-8'
        else:
            response.headers['Content-type'] = 'text/plain; charset=utf-8'

        if 'X-Requested-With' in request.headers and 'XMLHttpRequest' in request.headers['X-Requested-With']:
            return  simplejson.dumps(_response)
        else:
            response.headers['Content-type'] = 'text/html; charset=utf-8'
            return "<html><body>%s</body></html>" % ( simplejson.dumps(_response) )
