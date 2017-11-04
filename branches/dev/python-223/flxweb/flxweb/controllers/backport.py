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
#$Id: backport.py 23655 2012-12-13 18:54:52Z nachiket $

from pylons import url,request
from pylons.controllers.util import redirect
from flxweb.lib.base import BaseController
from flxweb.lib import helpers as h
from flxweb.lib.ck12.util import parse_perma
from flxweb.model.artifact import ArtifactManager
from flxweb.model.browseTerm import BrowseManager
from flxweb.model.resource import ResourceManager
from pylons.controllers.util import abort
from flxweb.lib.ck12.exceptions import ResourceNotFoundException
import logging
import re
from urllib import quote
from flxweb.model.modality import ModalityManager

log = logging.getLogger(__name__)

class BackportController(BaseController):
    """
    This controller is used for backporting 
    any old URLs
    """
    
    def concept_url(self,realm=None,artifact_handle=None,ext=None):
        '''
        Backports the old /concept/<handle> URLs
        to /<branch>/<concept-handle>
        '''

        ref = request.GET.get('ref')
        ext_params = {} 
        if ext:
            ext_params['version'] = ''.join( ext.split('r')[1:] )
        
        #try to look for a domain that matches artifact_handle
        node_info = None
        domain = None
        try:
            node_info = ModalityManager.get_node_info(artifact_handle)
        except:
            log.debug("Domain not found for hande: %s" % artifact_handle)
        
        if node_info:
            domain = node_info.get('domain')
            branch_term = domain.get_branch()
            concept_url = url('concept',
                    branch=branch_term.slug(),
                    artifact_title=artifact_handle)
            return redirect(concept_url, 301)
        

        # get the artifact information using the handle
        artifact = ArtifactManager.getArtifactByPerma(artifact_type='lesson',
                                                      artifact_title=artifact_handle,
                                                      realm=realm,
                                                      ext=ext_params)
        # if the ref parameter exists or realm, then is a read
        # modality url
        if artifact and (ref or realm):
            if ext:
                versioned = True
            else:
                versioned = False
            artifact_url = h.artifact_url(artifact, versioned)
            return redirect(artifact_url,code=301)
        elif artifact and 'domain' in artifact and artifact['domain']:
            branch_eid = artifact.get_branch_encodedid()
            branch = None
            # Get the branch details if it is not a UGC branch
            if branch_eid and not branch_eid.startswith('UGC'):
                # if artifact handle is not same as domain handle, then artifact_url
                if artifact['domain']['handle'] and artifact_handle != artifact['domain']['handle']:
                    concept_url = h.artifact_url(artifact, False)
                    return redirect(concept_url,301)
                # it is a concept url
                else:
                    try:
                        branch = BrowseManager.getBrowseTermByEncodedId(branch_eid)
                    except:
                        log.debug("Could not fetch branch for EID: %s" % branch_eid )
                    if branch:
                        concept_url = url('concept',
                                    branch=branch.slug(),
                                    artifact_title=artifact_handle)
                        return redirect(concept_url,301)
            elif realm:
                # It's a read modality URL for UGC concept on a UGC branch
                artifact_url = h.artifact_url(artifact, versioned)
                return redirect(artifact_url,301)
        # else if all fails, 404
        return abort(404)
    
    def rwa_url(self,realm=None,artifact_handle=None,ext=None):
        '''
        Backports the old /rwa/<handle> URLs
        to /<branch>/<concept-handle>/rwa/<rwa-handle>
        '''

        ref = request.GET.get('ref')
        ext_params = {} 
        if ext:
            ext_params['version'] = ''.join( ext.split('r')[1:] )

        # get the artifact information using the handle
        artifact = ArtifactManager.getArtifactByPerma(artifact_type='rwa',
                                                      artifact_title=artifact_handle,
                                                      realm=realm,
                                                      ext=ext_params)
        if artifact:
            if ext:
                versioned = True
            else:
                versioned = False

            artifact_url = h.artifact_url(artifact, versioned)
            return redirect(artifact_url,code=301)
        # else if all fails, 404
        return abort(404)

    def resource_url(self,resource_type=None,resource_handle=None, realm=None,stream='default'):
        '''
        Backports the old /resource/<type>/<handle> URLs
        to /<branch>/<concept-handle>/<mtype>/<mhandle>
        '''
        try:
            ref = request.GET.get('ref')
            eid = request.GET.get('eid')
            aid = request.GET.get('aid')
            branch = concept = artifact = resource = None
            # if aid i.e artifactID is present then use that to get the modality as artifact
            if aid:
                artifact = ArtifactManager.getArtifactById(aid)
            #else depend on the resource handle
            else:
                # handle the case when apache strips of slash from http://
                if 'http:/' in resource_handle and not 'http://' in resource_handle:
                    resource_handle = resource_handle.replace('http:/','http://')
    
                if resource_handle:
                    # get the old resource object
                    try:
                        resource = ResourceManager.get_resource_by_perma(resource_type, resource_handle, realm, stream)
                    except Exception,e:
                        log.debug('Could not get resource')
                    if resource:
                        artifact_info = resource.get_artifact_info()
                        if artifact_info and\
                            'artifactRevisionID' in artifact_info:
                            artifact = ArtifactManager.getArtifactByRevisionId(artifact_info['artifactRevisionID'])
    
            #depend on the eid first to determine the contexual concept 
            if eid:
                concept = BrowseManager.getBrowseTermInfo(eid)
                if concept:
                    branch = concept.get_branch()
            #else see if we have ref that we can use to determine the concept
            elif ref:
                perma = parse_perma(ref)
                if 'artifact_title' in perma:
                    concept = ArtifactManager.getArtifactByPerma(artifact_type='concept',
                                                                  artifact_title=perma['artifact_title'],
                                                                  realm=perma['realm'])
                    branch_eid = concept.get_branch_encodedid()
                    # Get the branch details if it is not a UGC branch
                    if branch_eid and not branch_eid.startswith('UGC'):
                        branch = BrowseManager.getBrowseTermByEncodedId(branch_eid)
            #else pick the domain from artifact
            elif 'domain' in artifact:
                domain = artifact['domain']
                if domain and 'encodedID' in domain:
                    concept = BrowseManager.getBrowseTermInfo(domain['encodedID'])
                    if concept:
                        branch = concept.get_branch()
            if branch and concept and artifact:
                modality_url = url('modality_branch',
                                branch=branch.slug(),
                                handle=concept.get('handle'),
                                mtype=artifact.get('artifactType'),
                                mhandle=artifact.get('handle'))                                
                return redirect(modality_url,code=301)
            elif branch and concept:                                    
                #if we cannot locate the new modality for old resource,· 
                # atleast redirect to the correct concept page           
                concept_url = url('concept',                             
                         branch=branch.slug(),                           
                         artifact_title=concept.get('handle'))           
                return redirect(concept_url,301)      
            #else if all fails, 404
            return abort(404)
        except ResourceNotFoundException:
            abort(404)

    def redirect_with_query(self,url1):
        '''
        If a url is requested without a slash, append a trailing slash
        and then send a 301 redirect to the slashed URL.
        This is an SEO related enhanvement done to prevent same page having
        two different URLs (slashed and unslashsed) competing against each other
        '''
        # if the URL does not end with "/", add slash "/"
        if url1 and not url1.endswith("/"):
            quoted_url = quote("/%s/" % url1.encode('utf8'))
            slashed_url = url(quoted_url, **request.params)
            return redirect(slashed_url, 301)
        else:
            self._custom404(url1)

    def redirect_without_revision(self):
        '''
        Redirecting modality with concept (having revision) to modality with lesson (removing revision)
        '''
        concept_url = request.url.replace('/concept/', '/lesson/')
        concept_url = re.sub(r'/r\d+/','/', concept_url)
        return redirect(concept_url, 301)

    def redirect_without_section_handle_and_revision(self, booktype, book_handle, position):
        '''
        Redirect old section URL pattern to existing section pattern
        Removing revision number as well as section-handle
        '''
        section_url = '/' + booktype + '/' + book_handle + '/section/' + position + '/'
        return redirect(section_url, 301)
            
    def school_redirect(self,state,school):
        '''
        Bug 46319 - backport old school url with trialing numbers to a cleaner url
        '''
        school_url = '/schools/%s/%s' % (state,school) 
        return redirect(school_url,301)

    def redirect_clean(self,rest,to,status_code):
        '''
        Use this redirect in the routing when you don't want the leftover part of the
        of URL. e.g to redirect following URL to "/".
        http://www.ck12.org/flexr/flexbook/*
        NOTE: the default _redirect_code in routing file, forces to capture the * part
        of the URL and forwards the same to the redirected URL.
        '''
        return redirect(to,int(status_code))
