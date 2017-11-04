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
# $ID$

from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.artifact import ArtifactManager
from flxweb.model.ck12model import CK12Model
import logging
from flxweb.model.browseTerm import BrowseManager, BrowseTerm
from flxweb.lib.helpers import url
from flxweb.model.modality_configuration_processor import ModalityConfigurationManager
from flxweb.model.modality_configuration_processor import Modality
from flxweb.lib.ck12.exceptions import RemoteAPITimeoutException
from flxweb.lib.ck12.decorators import ck12_cache_region, trace
from copy import deepcopy

log = logging.getLogger(__name__)

class ModalityGroup(CK12Model):
    '''
        ModalityGroup
    '''
    modalities = []
    def __init__(self, dict_obj=None):
        if dict_obj.get('artifact_type'):
            for modality_name in dict_obj.get('artifact_types') :
                modality = ModalityManager.get_modalities().get(modality_name)
                self.modalities.append(modality)
                self['count'] = self.get('count',0);
        CK12Model.__init__(self, dict_obj=dict_obj)

    def has_modality(self, modality_type):
        '''
        Returns True if modality_type is a member of current modality group
        '''
        return modality_type in self.get('artifact_types',[])


class ModalityManager():
    '''
    ModalityManager
    defines settings for modalities,
    provides static methods to query and manipulate modality objects
    '''
    modalities = None #Modality types
    modality_groups = None #Modality groups
    student_modality_types = None

    @staticmethod
    #@ck12_cache_region('forever', invalidation_key='modalityconfigs')
    #@trace
    def get_modality_groups():
        '''
        Returns the list of modality groups
        '''
        if not ModalityManager.modality_groups:
            ModalityManager.modality_groups = [ ModalityGroup(grp) for grp in ModalityConfigurationManager.get_modality_groups()]
        return deepcopy(ModalityManager.modality_groups)

    @staticmethod
    #@ck12_cache_region('forever', invalidation_key='modalityconfigs')
    #@trace
    def get_modalities():
        '''
        Returns the list of all modalities
        '''
        if not ModalityManager.modalities:
            ModalityManager.modalities = ModalityConfigurationManager.get_modalities()
        return ModalityManager.modalities

    @staticmethod
    #@trace
    def get_student_modality_types():
        ''''
        Returns list of modality types available to student users
        '''
        if not ModalityManager.student_modality_types:
            modalities = ModalityConfigurationManager.get_modalities()
            ModalityManager.student_modality_types = [ modality for modality in modalities if modalities[modality].get('student_show') ]
        return ModalityManager.student_modality_types

    @staticmethod
    def get_student_modalities():
        '''
        Returns list of modalities available to student users.
        '''
        student_modality_types = ModalityManager.get_student_modality_types()
        student_modalities = [ {modality_type:ModalityManager.get_modalities().get(modality_type)} for modality_type in student_modality_types ]
        return student_modalities

    @staticmethod
    def get_modality_by_type(artifact_type):
        '''
        Returns Modality object for specified artifact_type
        '''
        modality = ModalityConfigurationManager.get_modalities().get(artifact_type)
        if not modality:
            modality= Modality({})
        return modality

    @staticmethod
    #@trace
    def to_modality_artifact(dict_obj):
        artifact = ArtifactManager.toArtifact(dict_obj)
#         artifact = ModalityArtifact(dict_obj)
#         modality_type = artifact.get('artifactType')
#         modalities = ModalityManager.modalities or ModalityManager.get_modalities()
#         modality = modalities.get(modality_type)
#         artifact['modality'] = modality
#         artifact['modality_group'] = ModalityManager.get_modality_group_by_type(modality_type)
#         artifact['modality_display_label'] = modality.get('display_label')
        return artifact

    @staticmethod
    @ck12_cache_region('forever')
    #@trace
    def get_modality_group_by_type(modality_type):
        modality_groups = ModalityManager.get_modality_groups()
        for group in modality_groups:
            if group.has_modality(modality_type):
                return group
        return None

    @staticmethod
    def get_modality_group_by_name(group_name):
        modality_groups = ModalityManager.get_modality_groups()
        for group in modality_groups:
            if group_name == group['group_name']:
                return group
        return None

    @staticmethod
    def get_modalities_for_eid(eid, types, conceptCollectionHandle=None):
        modality_info = None
        params = {}
        if types:
            params['modalities'] = types
        if conceptCollectionHandle:
            params['conceptCollectionHandle'] = conceptCollectionHandle
            params['ownedBy'] = 'ck12'
            params['collectionCreatorID'] = '3'
        try:
            if not eid:
                raise Exception('No EID specified')
            api_endpoint = 'get/info/modalities/%s' % eid
            data = RemoteAPI.makeGetCall(api_endpoint, params)
            if 'response' in data:
                modality_info = ModalityManager._process_modalities_response( data['response'] )
        except Exception, e:
            log.debug("Could not retrieve info for EID: %s" % eid)
            log.exception(e)
        return modality_info

    @staticmethod
    def _get_domain_modality_url(domain, difficulty=None):
        eid = domain.get('encodedID')
        eid_split = eid.split('.')
        eid_sub = '.'.join(eid_split[:2])
        browse_term = BrowseManager.getBrowseTermByEncodedId(eid_sub)
        branch = browse_term.slug()
        subject = browse_term.get('parent').slug()
        domain_term = ModalityManager._hyphenate_title(domain.get('term') or domain.get('name'))
        domain_url = url(controller='modality', action='modalities_home_for_node',
                         subject=subject, branch=branch, title=domain_term.replace(' ','-'), difficulty=difficulty)
        domain_url = domain_url.lower()
        return domain_url

    @staticmethod
    def _hyphenate_title(title):
        title = title.replace('-','@@').replace(' ','-').replace('@@','--') #spaces to hyphens, hyphens to double-hyphens
        return title

    @staticmethod
    def _dehyphenate_title(title):
        title = title .replace('--','@@').replace('-',' ').replace('@@','-') #hyphens to spaces, double hyphens to hyphens
        return title

    @staticmethod
    #@trace
    def _process_domain_pre_post(domain):
        _pre = [ node for node in domain.get('pre',{}).values() ][:1]
        if _pre:
            domain['pre'] = BrowseTerm(_pre[0])
        else:
            domain['pre'] = None
        _post = [ node for node in domain.get('post',{}).values() ][:1]
        if _post:
            domain['post'] = BrowseTerm(_post[0])
        else:
            domain['post'] = None
        return domain

    @staticmethod
    #@trace
    def _process_modalities_response(response_data):
        domain = response_data.get('domain')
        #bring pre/post objects one level up.
        if domain:
            domain =  ModalityManager._process_domain_pre_post(BrowseTerm(domain))

        #process modalities
        modalities = domain.get('modalities',[])
        modalities = [ ModalityManager.to_modality_artifact(modality) for modality in modalities ]
        mod_pop_idx = 0 #modality_popularity_index
        for modality in modalities:
            mod_pop_idx += 1
            modality['popularity'] = mod_pop_idx;

        modality_info = {
            'modalities': modalities,
            'domain': domain
        }
        return modality_info

    @staticmethod
    def get_modalities_or_artifact_by_perma(artifact_type, artifact_handle, artifact_realm=None, difficulty=None):
        modality_info = None
        try:
            api_endpoint = 'get/info/modalities/%s/%s' % ( artifact_type, artifact_handle )
            if artifact_realm:
                api_endpoint = '%s/%s' % ( artifact_type, artifact_realm )
            params = { 'pageSize': 100 }
            if difficulty:
                params.update({ 'extension':'level:%s' % difficulty })
            data = RemoteAPI.makeGetCall(api_endpoint, params)
            resp = data['response']
            if 'domain' in resp:
                modality_info = ModalityManager._process_modalities_response(resp)
            else:
                if artifact_type in resp:
                    modality_info = ArtifactManager.toArtifact(resp.get(artifact_type))
        except Exception, e:
            log.debug("Could not retrieve modalities info.")
            log.exception(e)
        return modality_info

    @staticmethod
    def get_modalities_by_node_handle(handle, difficulty=None, by=None, pageSize=100):
        modality_info = None
        try:
            api_endpoint = 'get/minimal/modalities'
            if difficulty:
                api_endpoint = '%s/%s' % (api_endpoint, difficulty)
            api_endpoint = '%s/%s' % (api_endpoint, handle)
            params = { 'pageSize': pageSize }
            if by:
                params.update({'ownedBy':by})
            data = RemoteAPI.makeGetCall(api_endpoint, params)
            resp = data.get('response')
            modality_info = ModalityManager._process_modalities_response(resp)
        except RemoteAPITimeoutException, ex:
            raise ex
        except Exception, ex:
            log.debug("Could not retrieve info for Node:%s, Difficulty:%s" % ( handle, difficulty ) )
            log.exception(ex)
        return modality_info

    @staticmethod
    #@trace
    def get_node_info(handle, level=None, ownedby=None):
        domain_info = {}
        try:
            api_endpoint = 'get/info/domain/%s' % handle
            params = {}
            if level:
                params['level'] = level
            if ownedby:
                params['ownedBy'] = ownedby
            data = RemoteAPI.makeGetCall(api_endpoint, params)
            resp = data.get('response')
            domain = ModalityManager._process_domain_pre_post( BrowseTerm(resp) )
            domain_info = {
                'modalities': [],
                'domain': domain
            }
        except RemoteAPITimeoutException, ex:
            raise ex
        except Exception, ex:
            log.debug("Could not retrieve info for Node:%s" % handle )
            log.exception(ex)
        return domain_info

    @staticmethod
    #@trace
    def get_modalities_for_node(subject, branch, node, difficulty=None):
        modality_info = None
        try:
            if not subject or not branch or not node:
                raise Exception ('Subject, Branch and Node must be specified')
            api_endpoint = 'get/info/modalities/'
            if difficulty:
                api_endpoint = '%s%s/' % (api_endpoint, difficulty)
            api_endpoint = '%s%s/%s/%s' % (api_endpoint,subject, branch, node )
            params =  { 'pageSize': 100 }
            data = RemoteAPI.makeGetCall(api_endpoint, params)
            resp = data['response']
            modality_info = ModalityManager._process_modalities_response(resp)
        except Exception, e:
            log.debug("Could not retrieve info for Node: %s/%s/%s" % (subject, branch, node ))
            log.exception(e)
        return modality_info

    @staticmethod
    def get_Resource_BoxViewer_SessionId(boxviewer_document_id):
        """
        function to get Box viewer session ID
        """
        boxviewer_session_id = None
        try:
            if not boxviewer_document_id:
                raise Exception ('boxviewer_deocument_id must be specified')
            api_endpoint = 'get/box/viewer/session'
            params = {'document_id':boxviewer_document_id}
            data = RemoteAPI.makeGetCall(api_endpoint, params)
            resp = data['response']
            boxviewer_session_id = resp.get('session')
        except Exception, e:
            log.debug("Could not retrieve info for Resource: %s" % (boxviewer_document_id ))
            log.exception(e)
        return boxviewer_session_id

    @staticmethod
    def get_collection_info(collection_handle, concept_collection_handle, collection_creator_id):
        collection_info = None
        api_endpoint = 'collection/collectionHandle=%s&collectionCreatorID=%s/descendant/absoluteCollectionDescendantHandle=%s' % (collection_handle, collection_creator_id, concept_collection_handle)
        params = {
            'includeTaxonomyComposistionsInfo':'true',
            'ownedBy':'ck12',
            'expirationAge':'daily',
            'considerCollectionDescendantsWithEncodedIDForTraversal': 'true'
        }
        try:
            data = RemoteAPI.makeTaxonomyGetCall(api_endpoint, params)
            collection_info = data['response']
        except RemoteAPITimeoutException, e: raise e
        except Exception, e:
            log.debug("Could not retrieve info for concept %s in collection %s" % (concept_collection_handle, collection_handle ))
            raise e
        return collection_info


    @staticmethod
    def get_modality_details(modality_type, modality_handle, concept_handle=None , realm=None, ext=None, eid=None, collection_handle= None, concept_collection_handle=None, collection_creator_id=None):
        params = {}
        modality = None
        if modality_type in ['lesson','concept']:
            modality_type = 'lesson'
            params.update({'includeConceptContent':True})

        api_endpoint = 'get/perma/modality/info/'
        api_endpoint = '%s%s/%s' % (api_endpoint, modality_type, modality_handle)
        if realm:
            api_endpoint = '%s/%s' % (api_endpoint, realm)
        if concept_handle:
            api_endpoint = '%s/%s' % (api_endpoint, concept_handle)

        ext_params = ''
        if ext:
            for ext_param in ext:
                ext_params = '%s%s:%s;' % (ext_params, ext_param, ext[ext_param])
            ext_params=ext_params.rstrip(';')
        if ext_params:
            params.update({'extension':ext_params})

        if collection_handle and concept_collection_handle:
            params.update({'conceptCollectionHandle': '%s-::-%s' % (collection_handle, concept_collection_handle)})

        if not collection_creator_id:
            params.update({'collectionCreatorID':3})

        modality_info = None
        try:
            data = RemoteAPI.makeGetCall(api_endpoint, params)
            resp = data['response']

            domain = resp.get('domain')
            #bring pre/post objects one level up.
            _pre = [ node for node in domain.get('pre',{}).values() ][:1]
            if _pre:
                domain['pre'] = _pre[0]
            else:
                domain['pre'] = None
            _post = [ node for node in domain.get('post',{}).values() ][:1]
            if _post:
                domain['post'] = _post[0]
            else:
                domain['post'] = None
            _post = domain.get('post')

            artifact = domain.get(modality_type)
            if not artifact:
                return None
            artifact = ArtifactManager.toArtifact(artifact)

            modalities = resp.get('modalities',[])
            modalities = [ ModalityManager.to_modality_artifact(modality) for modality in modalities ]
            modality_info = {
                'modalities': modalities,
                'domain': domain,
                'artifact': artifact
            }
        except RemoteAPITimeoutException, e: raise e
        except Exception, e:
            log.debug("Could not retrieve info for concept %s" % ( concept_handle ))
            log.exception(e)
        return modality_info

    @staticmethod
    def get_modality_draft_details(artifactRevisionID):
        api_endpoint = 'artifactdraft/artifactDraftArtifactRevisionID'
        api_endpoint = '%s=%s' % (api_endpoint, artifactRevisionID)

        modality_info = None
        try:
            data = RemoteAPI.makeGetCall(api_endpoint)
            resp = data['response']['artifactDraft']['draft']

            domain = resp.get('domain')
            #bring pre/post objects one level up.
            _pre = [ node for node in domain.get('pre',{}).values() ][:1]
            if _pre:
                domain['pre'] = _pre[0]
            else:
                domain['pre'] = None
            _post = [ node for node in domain.get('post',{}).values() ][:1]
            if _post:
                domain['post'] = _post[0]
            else:
                domain['post'] = None
            _post = domain.get('post')

            artifact = resp
            artifact['handle'] = data['response']['artifactDraft']['handle']
            if not artifact:
                return None
            artifact = ArtifactManager.toArtifact(artifact)

            modalities = resp.get('modalities',[])
            modalities = [ ModalityManager.to_modality_artifact(modality) for modality in modalities ]
            modality_info = {
                'modalities': modalities,
                'domain': domain,
                'artifact': artifact
            }
        except RemoteAPITimeoutException, e: raise e
        except Exception, e:
            log.exception(e)
        return modality_info
