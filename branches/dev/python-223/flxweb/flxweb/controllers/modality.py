#;
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
from flxweb.lib.base import BaseController
from flxweb.model.browseTerm import BrowseManager, BrowseTerm
from flxweb.model.modality import ModalityManager
from flxweb.model.modality_configuration_processor import ModalityConfigurationManager
from pylons import request,response, tmpl_context as c, url
from pylons.templating import render_jinja2
import logging
from pylons.controllers.util import abort
from flxweb.forms.modality import ModalityConfigurationForm
from flxweb.lib.ck12.decorators import login_required
from flxweb.lib import helpers as h
from flxweb.lib.ck12.exceptions import RemoteAPITimeoutException, RemoteAPIHTTPException
from pylons.decorators import jsonify
from flxweb.model.artifact import ArtifactManager
from flxweb.model.conceptNode import ConceptNodeManager
from pylons.controllers.util import redirect
import urllib
from flxweb.model.session import SessionManager
try:
    import simplejson as json
except ImportError:
    import json

log = logging.getLogger(__name__)

ARTIFACT_ASSESSMENT_MAP = {
    'asmtpractice': 'practice',
    #'asmtpracticeint': 'interactive practice',
    'asmtquiz': 'quiz',
    'asmttest': 'test',
}

class ModalityController(BaseController):

    def _user_is_not_student(self):
        if c.user:
            return c.user.hasAnyRole(['teacher','admin','author'])
        else:
            role = request.cookies.get('flxweb_role')
            if role=='teacher':
                return True
        return False

    #@trace
    def process_group_counts(self, modality_groups, artifact_counts, difficulty):
        student_modality_types = ModalityManager.get_student_modality_types()
        modality_types = ModalityManager.get_modalities()
        for modality_type in artifact_counts:
            if modality_type in modality_types:
                #get number of modalities if single type for
                modality_type_count_info = artifact_counts[modality_type]
                modality_type_count = 0
                if difficulty:
                    modality_type_count = modality_type_count_info.get(difficulty,0) #for specific difficulty level
                else:
                    for level in modality_type_count_info: #for all difficulty levels
                        modality_type_count = modality_type_count + modality_type_count_info.get(level,0)

                if self._user_is_not_student() or modality_type in student_modality_types:
                    for modality_group in modality_groups:
                        types = modality_group.get('artifact_types',[])
                        grp_count = modality_group.get('count', 0)
                        if '__ALL__' in types:
                            modality_group['count'] = grp_count + modality_type_count
                        if modality_type in types:
                            modality_group['count'] = grp_count + modality_type_count
                            break
                        if '__OTHER__' in types:
                            modality_group['count'] = grp_count + modality_type_count
                            modality_group['artifact_types'].append(modality_type)
        return modality_groups

    #@trace
    def _filter_modalities_set(self, modalities_info):
        modality_artifacts =  modalities_info.get('modalities') or []
        student_modality_types = ModalityManager.get_student_modality_types()
        view_mode = 'student'


        if request.params.get('view') == 'teacher' or self._user_is_not_student():
            view_mode = 'teacher'

        modality_artifacts = [ artifact for artifact in modality_artifacts if artifact.get('artifactType') != 'concept' ]

        #hide non-student modalities for students view
        if view_mode == 'student':
            modality_artifacts = [ artifact for artifact in modality_artifacts if artifact.get('artifactType') in  student_modality_types]

        # page_url = request.url
        for artifact in modality_artifacts:
            #artifact['details_url'] = artifact['share_url'] = '%s%s/%s' % (page_url, artifact.get('artifactType'), artifact.get('handle'))
            artifact['details_url'] = artifact['share_url'] = h.artifact_url(artifact)

        return modality_artifacts

    #@trace
    def render_modalities_page(self, modalities_info):
        all_modality_groups = ModalityManager.get_modality_groups()
        processed_modality_groups = {}
        modality_artifacts =  modalities_info.get('modalities') or []
        domain = modalities_info.get('domain')
        difficulty = modalities_info.get('difficulty')
        by = modalities_info.get('by')
        if not by:
            by = ''
        student_modality_types = ModalityManager.get_student_modality_types()
        view_mode = 'student'
        breadcrumbs = []


        if request.params.get('view') == 'teacher' or self._user_is_not_student():
            view_mode = 'teacher'

        #remove all 'concept' type modalities we don't want duplicates
        modality_artifacts = [ artifact for artifact in modality_artifacts if artifact.get('artifactType') != 'concept' ]
        modality_type_counts = domain['modalityCount']

        #hide non-student modalities for students view
        if view_mode == 'student':
            modality_artifacts = [ artifact for artifact in modality_artifacts if artifact.get('artifactType') in  student_modality_types]
            if modality_type_counts != 0 :
                for modality_type in modality_type_counts.keys():
                    if modality_type not in student_modality_types:
                        del modality_type_counts[modality_type]
        if modality_type_counts != 0:
            if 'concept' in modality_type_counts:
                modality_type_counts['concept'] = {'none':0}

        read_modalities = [ artifact for artifact in modality_artifacts if artifact.get('artifactType') in ['lesson','concept'] ]

        #count modalities per group
        if modality_type_counts != 0:
            processed_modality_groups = self.process_group_counts(all_modality_groups, modality_type_counts, difficulty)

        #count modalities per difficulty level
        modality_difficulty_counts = {}
        if modality_type_counts:
            for mtype in modality_type_counts:
                mtypecount = modality_type_counts.get(mtype)
                for level in mtypecount:
                    levelcount = modality_difficulty_counts.get(level,0)
                    levelcount = levelcount + mtypecount.get(level,0)
                    modality_difficulty_counts[level] = levelcount
        domain['levelCount'] = modality_difficulty_counts


        #filter out empty groups
        processed_modality_groups = [ group for group in processed_modality_groups if group.get('count',0) > 0 ]

        #Bug 13458: do not show unpublished get-real rwas to the users who submitted them
        def _is_nonpublic_getreal_rwa(artifact):
            isnpgrrwa = False
            if artifact.get('artifactType') == 'rwa' and not artifact.is_published():
                itg = artifact.get('internalTagGrid')
                for it in itg:
                    if it[1] == 'GetReal Competition':
                        isnpgrrwa = True
                        break
            return isnpgrrwa

        _t = len(modality_artifacts) #total artifacts before removal
        modality_artifacts = [ artifact for artifact in modality_artifacts if not _is_nonpublic_getreal_rwa(artifact) ]
        rwadelta = _t - len(modality_artifacts) #number of rwas removed

        #adjust the modality count
        for group in processed_modality_groups:
            if 'rwa' in (group.get('artifact_types')or []):
                group['count'] = group.get('count') - rwadelta


        # page_url = request.url
        for artifact in modality_artifacts:
            #artifact['details_url'] = artifact['share_url'] = '%s%s/%s' % (page_url, artifact.get('artifactType'), artifact.get('handle'))
            artifact['details_url'] = artifact['share_url'] = h.artifact_url(artifact)

        # create a list of keywords to be used for SEO
        keywords = []
        for rmodality in read_modalities:
            keywords.extend([t.lower() for t in rmodality.get_seo_keywords()])
        # remove any duplicate keywords
        keywords = list(set(keywords))

        #get read modality counts
        read_modality_count = 0
        try:
            for group in processed_modality_groups:
                if group.get('group_name') == "Read":
                    read_modality_count = group.get('count',0)
                    break
        except Exception, e:
            log.debug("Could not get read modality count.")
            log.exception(e)

        modality_data = {
            'modality_groups': processed_modality_groups,
            'artifacts':modality_artifacts,
            'domain': domain,
            'difficulty': difficulty,
            'read_modality_count': read_modality_count,
            'keywords': keywords,
            'by': by
        }

        domain_next = domain.get('post')
        domain_prev = domain.get('pre')

        c.domain = domain

        eid = domain.get('encodedID')
        if eid:
            eid_branch = '.'.join( eid.split('.')[:2] )

            term = BrowseManager.getBrowseTermByEncodedId(eid)
            term_branch = BrowseManager.getBrowseTermByEncodedId(eid_branch)

            crumb_branch = url('browse', subject = term_branch.slug())
            crumb_branch_title = term_branch.get('name')
            #[Bug 13241] "Software Testing" breadcrumb should be 'Engineering'
            if eid.startswith('ENG'):
                _branch = BrowseManager.getBrowseTermByEncodedId('ENG')
                crumb_branch = url('browse', subject = _branch.slug())
                crumb_branch_title = _branch.get('name')


            if not eid.startswith('UGC'):
                breadcrumbs.append( { 'perma': crumb_branch, 'title': crumb_branch_title } )
            breadcrumbs.append( { 'perma': request.url, 'title': term.get('name') } )

        if domain_next :
            c.next = { 'title': domain_next.get('name') }
            url_next = None
            if difficulty and domain_next.get_modality_count( difficulty_levels=[difficulty] ) > 0:
                url_next = url('concept',branch=term_branch.slug(),
                        artifact_title=domain_next.get('handle'), ext=None, qualified=True, difficulty=difficulty)
            if not url_next:
                url_next = url('concept',branch=term_branch.slug(),
                        artifact_title=domain_next.get('handle'), ext=None, qualified=True)
            c.url_next = url_next

        if domain_prev:
            c.prev = {'title': domain_prev.get('name') }
            url_prev = None
            if difficulty and domain_prev.get_modality_count( difficulty_levels=[difficulty] ):
                url_prev = url('concept',branch=term_branch.slug(),
                        artifact_title=domain_prev.get('handle'), ext=None, qualified=True, difficulty=difficulty)
            if not url_prev:
                url_prev = url('concept',branch=term_branch.slug(),
                        artifact_title=domain_prev.get('handle'), ext=None, qualified=True)
            c.url_prev = url_prev

        c.modality_data = modality_data


        #page url:
        c.page_url = c.concept_url = request.path
        c.breadcrumbs = breadcrumbs

        if view_mode == 'teacher':
            c.modality_data['use_weight'] = 'weight_teacher'
        else:
            c.modality_data['use_weight'] = 'weight_student'

        page_title = []
        if c.domain and c.domain['name']:
            page_title.append(c.domain['name'])
        for crumb in c.breadcrumbs[:-1]:
            page_title.append(crumb['title'])
        c.page_title = ' | '.join(page_title)

        return render_jinja2('details/modalities/concept_modalities.html')

    def collection_concept_modalities_qq(self, collection_handle=None, concept_collection_handle=None):
        return self.concept_modalities_qq(collection_handle, concept_collection_handle)

    def concept_modalities_qq(self, branch, artifact_title):
        c.page_url = c.concept_url = request.path
        return render_jinja2('modality/modalities.html')

    def concept_modalities(self, branch, artifact_title, ext=None):
        difficulty = request.params.get('difficulty')
        by = request.params.get('by')
        if not by:
            by = ''
        try:
            data = ModalityManager.get_node_info(artifact_title, difficulty, by)
            if not data:
                abort(404)
            # Make sure the branch from API matches the branch name from URL
            domain = data.get('domain')
            branch_term = domain.get_branch()
            if branch:
                if not branch == branch_term.slug():
                    log.debug('Branch information from URL and API does not match. URL=%s, API=%s' % ( branch, branch_term.slug() ) )
                    abort(404)
            else:
                if not branch_term.get('encodedID').startswith('UGC'):
                    log.debug('Requested branch %s is not a UGC branch.' % ( branch_term.slug() ) )
                    abort(404)

        except RemoteAPITimeoutException:
            abort(408)

        if difficulty:
            data['difficulty'] = difficulty
            c.difficulty_level = difficulty
        if by:
            data['by'] = by
            c.by = by
        return  self.render_modalities_page(data)

    #@trace
    def modalities_home_for_node(self, subject, branch, title, difficulty=None):
        '''
        Returns modalities page
        '''
        title = ModalityManager._dehyphenate_title(title)

        if ( len(subject) != 3 or len(branch) != 3 ):
            term_path = '%s/%s' % (subject, branch)
            branch_term = BrowseManager.getBrowseTermByPath(term_path)
            if not branch_term:
                abort(404)
            eid = branch_term.get('encodedID')
            if (eid):
                subject = eid.split('.')[0]
                branch = eid.split('.')[1]
            else:
                abort(404)

        data = ModalityManager.get_modalities_for_node(subject, branch, title, difficulty)
        if not data:
            abort(404)
        else:
            data['difficulty'] = difficulty
        return self.render_modalities_page(data)

    def collection_modality_details(self, mtype, mhandle, concept_collection_handle=None, difficulty=None, realm=3, version=None, subject=None, collection_handle=None, title=None, ext=None, modality_realm=None):
        try:
            collection_data = ModalityManager.get_collection_info(collection_handle, concept_collection_handle, realm)
            c.concept_collection_handle = concept_collection_handle
            c.collection_creator_id  = realm
            c.collection_handle = collection_handle
            c.collection_realm = realm
            c.collection_data_json = collection_data
            c.comb_concept_collection_handle =  collection_handle+"-::-"+concept_collection_handle
            if 'descendantCollection' in collection_data['collection']:
                if 'taxonomyComposistionsInfo' in collection_data['collection']['descendantCollection']:
                    concept_collection_handle = collection_data['collection']['descendantCollection']['taxonomyComposistionsInfo'][0]['branches'][0]['concepts'][0]['handle']
            if (realm != 3):
                c.collection_data_json['collection_url'] = "/c/" + collection_handle
            else:
                c.collection_data_json['collection_url'] = "/c/user:" + realm + "/" + collection_handle
        except RemoteAPITimeoutException:
            abort(408)
        except RemoteAPIHTTPException, e:
            log.debug('meow')
            if 2007 in e.get_error_codes():
                abort(404)
        if not collection_data:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)
        return self.modality_details(mtype, mhandle, concept_collection_handle, difficulty, modality_realm, version, subject, collection_handle, title, ext, True)

    def modality_details(self, mtype, mhandle, handle=None, difficulty=None, realm=None, version=None, subject=None, branch=None, title=None, ext=None, collectionUrl=False):
        if mtype == 'simulation':
            return self._force_login( mtype, mhandle, handle, difficulty, realm, version, subject, branch, title, ext, collectionUrl )
        else:
            return self._render_details(mtype, mhandle, handle, difficulty, realm, version, subject, branch, title, ext, collectionUrl)

    @login_required()
    def _force_login(self, mtype, mhandle, handle=None, difficulty=None, realm=None, version=None, subject=None, branch=None, title=None, ext=None, collectionUrl=False ):
        return self._render_details(mtype, mhandle, handle, difficulty, realm, version, subject, branch, title, ext, collectionUrl)

    def _render_details(self, mtype, mhandle, handle=None, difficulty=None, realm=None, version=None, subject=None, branch=None, title=None, ext=None, collectionUrl=False):
        if title:
            title = ModalityManager._dehyphenate_title(title)
        branch_term = None
        breadcrumbs = []
        c.conceptSource = request.params.get('conceptSource')
        c.conceptDifficulty = request.params.get('conceptLevel')
        if c.conceptDifficulty == 'all':
            c.conceptDifficulty = ''
        ext_params = {}
        if ext:
            ext_params['version'] = ext.replace('r','')

        ## Backport for supporting HWP /exercise/<handle> urls
        if mtype == 'exercise':
            mtype = 'asmtpractice'
            mhandle = '%s-Practice' % mhandle

        ## Backport for supporting old user owned quiz urls with mtype asmtpractice
        if realm and ( 'ck12editor' not in realm.lower() ) and mtype == 'asmtpractice':
            mtype = 'asmtquiz'

        collection_handle = None
        concept_collection_handle = None
        collection_creator_id = None

        if collectionUrl:
            collection_handle = branch
            concept_collection_handle = c.concept_collection_handle

        data = None
        try:
            data = ModalityManager.get_modality_details(mtype, mhandle, realm=realm, ext=ext_params, concept_handle=handle,
                    collection_handle=collection_handle, concept_collection_handle=concept_collection_handle, collection_creator_id=collection_creator_id)
            if data and request.GET.get('previewdraft') != 'false' and data.get('artifact')['hasDraft'] == True:
                c.previewdraft = True
                data_draft = ModalityManager.get_modality_draft_details(data.get('artifact').get('artifactRevisionID'))
            else:
                c.previewdraft = None
        except RemoteAPITimeoutException:
            abort(408)
        if not data:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

        # Make sure the branch from API matches the branch name from URL
        domain = data.get('domain')
        domain = BrowseTerm(domain)
        branch_term = domain.get_branch()
        branchInfo = domain.get('branchInfo')
        concept_handle = domain.get('handle')
        branch_handle = branchInfo.get('handle').lower()
        modality_handle = urllib.unquote(domain[mtype]['handle'])
        if not collectionUrl:
            if branch:
                if (not branch.lower() == branch_term.slug()) or\
                   (not handle.lower() == concept_handle.lower()) or\
                   (not urllib.unquote(mhandle.lower()) == modality_handle.lower()): # bug:46507
                    if realm:
                        concept_url = h.url('modality_branch_realm', branch=branch_handle, handle=concept_handle, mtype= mtype, realm=realm, mhandle=modality_handle)
                    else:
                        concept_url = h.url('modality_branch', branch=branch_handle, handle=concept_handle, mtype= mtype, mhandle=modality_handle)
                    return redirect(concept_url,code=301)
            elif not branch_term.get('encodedID').startswith('UGC'):
                    if hasattr(request, 'url'):
                        self._custom404(request.url)
                    else:
                        log.debug('Requested branch %s is not a UGC branch.' % ( branch_term.slug() ) )
                        abort(404)

        if not domain.is_pseudodomain():
            url_branch = url('browse', subject=branch_term.slug())
            url_concept = url('concept', branch=branch_term.slug(), artifact_title=domain.get('handle'), ext=None, qualified=True)
            breadcrumbs.append({'title': branch_term.get('name'), 'perma': url_branch})
        else:
            url_concept = url('ugc-concept', artifact_title=domain.get('handle'), ext=None, qualified=True)

        breadcrumbs.append({'title': domain.get('name'), 'perma': url_concept})

        if c.previewdraft == True:
            #c.modality_xhtml = data_draft.get('artifact').get('xhtml') if data_draft.get('artifact').get('xhtml') else ""
            draftArtifact = data_draft.get('artifact')
            if draftArtifact:
                if data.get('artifact').get('revisions')[0].get('resourceCounts'):
                    draftArtifact['resourceCounts'] = data.get('artifact').get('revisions')[0].get('resourceCounts')
                c.modality_xhtml = ArtifactManager.toArtifact(draftArtifact).getXHTML()
                #Bug 42754: some drafts got saved with artifactType section even when they were converted into a lesson
                if draftArtifact['artifactType'] == 'section':
                    draftArtifact['artifactType'] = data.get('artifact')['artifactType']
                modality_artifact = ModalityManager.to_modality_artifact(draftArtifact)
                modality_artifact.hasDraft = True
        else:
            #c.modality_xhtml = data.get('artifact').get('xhtml') if data.get('artifact').get('xhtml') else ""
            c.modality_xhtml = ArtifactManager.toArtifact(data.get('artifact',{})).getXHTML()
            modality_artifact = ModalityManager.to_modality_artifact( data.get('artifact'))

        # remove artifact from domain
        if domain.get(mtype):
            domain.pop(mtype)
        rendertype = modality_artifact.get_render_type()
        self.__cleanModalityData(modality_artifact)

        #if simulationint, redirect to simulationint URL
        if rendertype == 'simulationint':
            simurl = None
            modality_resource = modality_artifact.get_modality_resource(typeName='interactive')
            if modality_resource and modality_resource['embeddedObject']:
                simurl = modality_resource['embeddedObject']['url']
            else:
                simurl = modality_resource['uri']
            if not simurl:
                if hasattr(request, 'url'):
                    self._custom404(request.url)
                else:
                    abort(404)
            #backURL and artifactID
            simurl = '%s&source=ck12&artifactID=%s' % (simurl,modality_artifact['artifactID'])
            referer = request.params.get('returnUrl') or request.headers.get('Referer', None)
            if referer:
                if 'ck12.org/embed'.lower() in referer.lower():
                    simurl = '%s&backUrl=%s' % (simurl,urllib.quote(referer))
                else:
                    simurl = '%s&backUrl=%s' % (simurl,urllib.quote(referer + '#simulations'))
            if request.params.get('referrer', '').startswith('assessment'):
                simurl = '%s&noReturn=true' % (simurl)
            if request.params.get('referrer'):
                simurl = '%s&referrer=%s' % (simurl, request.params.get('referrer'))
            return redirect(simurl)

        elif rendertype == 'plix':
            questionId = modality_artifact.get('handle').split('-')[-1]
            if collectionUrl:
                collection_handle = c.collection_data_json['collection']['handle']
                concept_collection_absolute_handle = c.collection_data_json['collection']['descendantCollection']['absoluteHandle']
                collection_creator_id = c.collection_data_json['collection']['descendantCollection']['creatorID']
                plixurl = '/assessment/tools/geometry-tool/plix.html?eId=%s&questionId=%s&artifactID=%s&conceptCollectionHandle=%s-::-%s&collectionCreatorID=%s' % (domain.get('encodedID'), questionId, str(modality_artifact.get('id')), collection_handle, concept_collection_absolute_handle, collection_creator_id)
            else:
                plixurl = '/assessment/tools/geometry-tool/plix.html?eId=%s&questionId=%s&artifactID=%s' % (domain.get('encodedID'), questionId, str(modality_artifact.get('id')))
            referer = request.params.get('returnUrl') or request.headers.get('Referer', None)
            if referer:
                if 'ck12.org/embed'.lower() in referer.lower():
                    plixurl = '%s&backUrl=%s&embedded=true' % (plixurl,urllib.quote(referer))
                else:
                    plixurl = '%s&backUrl=%s' % (plixurl,urllib.quote(referer + '#interactive'))
            log.debug('referrer: %s' % request.params.get('referrer'))
            if request.params.get('referrer', '').startswith('assessment'):
                plixurl = '%s&noReturn=true' % (plixurl)
            return redirect(plixurl)

        # create session id to call boxviewer view
        resource = modality_artifact.get_modality_resource()
        log.debug('Resource::: %s' % ( resource ) )
        boxviewer_document_id = None
        if resource and resource.has_key('boxDocuments'):
            boxviewer_document_id = resource['boxDocuments']['documentID']

        boxviewer_session_id = None
        if boxviewer_document_id:
            boxviewer_session_id = ModalityManager.get_Resource_BoxViewer_SessionId(boxviewer_document_id)
        log.debug('boxviewer_session_id::: %s' % ( boxviewer_session_id ) )

        modality_groups = ModalityManager.get_modality_groups()
        if modality_artifact.get('realm'):
            modality_type_counts = domain.get('modalityCount',{})
        elif c.conceptSource == 'community':
            modality_type_counts = domain.get('communityModalityCount',{})
        else:
            modality_type_counts = domain.get('ck12ModalityCount',{})
        if modality_type_counts:
            modality_groups = self.process_group_counts(modality_groups, modality_type_counts, c.conceptDifficulty)
        #filter out empty groups
        modality_groups = [ group for group in modality_groups if group.get('count',0) > 0 ]

        c.domain = BrowseTerm(domain)
        c.modality_data = {
            'modalities':[],
            'modality_groups': modality_groups,
            'domain': domain,
            'artifact': modality_artifact
        }

        if boxviewer_session_id:
            c.modality_data['boxviewer_session_id'] = boxviewer_session_id

        # copy of modality data for JSON dump
        if c.previewdraft == True:
            modality_artifact_json = data_draft.get('artifact')
            modality_artifact_json['feedbacks'] = data.get('artifact')['feedbacks']
        else :
            modality_artifact_json = data.get('artifact')
        downloaduri = None
        if 'revisions' in modality_artifact_json and len(modality_artifact_json['revisions']):
            if c.modality_data['artifact'].get('artifactType') == 'studyguide' and 'attachments' in modality_artifact_json['revisions'][0]:
                if len(modality_artifact_json['revisions'][0]['attachments']) > 0:
                    downloaduri = modality_artifact_json['revisions'][0]['attachments'][0]['uri']
            modality_artifact_json.pop('revisions')
        if 'relatedArtifacts' in modality_artifact_json:
            modality_artifact_json.pop('relatedArtifacts')

        if c.modality_data['artifact'].get('artifactType') == 'simulationint':
            c.hideContentWrap = True
        if c.modality_data['artifact'].get('artifactType') == 'simulation':
            if rendertype != 'link':
                c.hideContentWrap = True

        c.modality_data_json = {
            'modalities':[],
            'modality_groups': modality_groups,
            'domain': domain,
            'artifact': modality_artifact_json,
            'downloaduri': downloaduri
        }

        domain_next = domain.get('post')
        domain_prev = domain.get('pre')

        domain.isElementary = 'Elementary Math' in domain.get('branchInfo').get('name')
        c.domain = domain
        if domain_next :
            c.next = { 'title': domain_next.get('name') }
            url_next = None
            if difficulty and domain_next.get_modality_count( difficulty_levels=[difficulty] ) > 0:
                url_next = url('concept',branch=branch_term.slug(),
                        artifact_title=domain_next.get('handle'), ext=None, qualified=True, difficulty=difficulty)
            if not url_next:
                url_next = url('concept', branch=branch_term.slug(),
                        artifact_title=domain_next.get('handle'), ext=None, qualified=True)
            c.url_next = url_next

        if domain_prev:
            c.prev = {'title': domain_prev.get('name') }
            url_prev = None
            if difficulty and domain_prev.get_modality_count( difficulty_levels=[difficulty] ):
                url_prev = url('concept',branch=branch_term.slug(),
                        artifact_title=domain_prev.get('handle'), ext=None, qualified=True, difficulty=difficulty)
            if not url_prev:
                url_prev = url('concept',branch=branch_term.slug(),
                        artifact_title=domain_prev.get('handle'), ext=None, qualified=True)
            c.url_prev = url_prev

        #page url:
        c.page_url = request.path
        if collectionUrl:
            c.concept_url = "/c/" + c.collection_handle + "/" + c.concept_collection_handle
        else:
            c.concept_url = url_concept
        breadcrumbs.append({ 'perma': c.page_url , 'title': c.domain.get('name')} )
        c.breadcrumbs = breadcrumbs
        c.modality_group = ModalityManager.get_modality_group_by_type(mtype)
        c.branch = branch_term

        if rendertype in ['read','rwa']:
            self.__setContentURL(c)
        if rendertype == 'ilo':
            eo = modality_artifact.get_modality_resource().get('embeddedObject',{})
            if eo:
                c.ilo_embed = eo.get('code')
            else:
                if hasattr(request, 'url'):
                    self._custom404(request.url)
                else:
                    log.debug("Could not find embedded object for exerciseint modality!")
                    abort(404)

        if rendertype == 'asmtpracticeint':
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                log.debug("Interactive practice not supported in modality detail page")
                abort(404)

        if rendertype == 'asmtpractice' or rendertype == 'asmtquiz':
            if ARTIFACT_ASSESSMENT_MAP.has_key(rendertype):
                c.assessmentType = ARTIFACT_ASSESSMENT_MAP[rendertype]
            template = 'exercise_ae/modality_details.html'
        else:
            template = 'details/modalities/modality_details_%s.html' % rendertype

        page_title = []
        if c.domain and c.modality_group:
            if (collectionUrl):
                page_title.append('%s ( %s )' % (c.collection_data_json['collection']['descendantCollection']['title'], c.modality_group['display_text']))
            else:
                page_title.append('%s ( %s )' % (c.domain['name'],c.modality_group['display_text']))
        if c.branch:
            page_title.append(c.branch['name'])
        c.page_title = ' | '.join(page_title)

        #Bug 9991, 10010: hide details tab for students
        c.show_details = True

        #show download modal options only if user is admin or teacher
        c.show_download_modal_options = "false"
        if c.user and (c.user.isTeacher() or c.user.isAdmin()):
            c.show_download_modal_options = "true"

        if modality_artifact.is_published():
            return self.modality_details_public(template)
        else:
            return self.modality_details_notpublic(template)

    def modality_details_public(self, template):
        return render_jinja2(template)

    @login_required()
    def modality_details_notpublic(self, template):
        return render_jinja2(template)

    @login_required()
    def modalities_configuration(self,confType=None):
        """
            return the configuration for modalities
        """
        if c.user.isAdmin() == True:
            template = '/details/modalities/modality_configuration.html'
            c.form = ModalityConfigurationForm()
            if request.method == 'GET':
                if not confType:
                    if (dict(request.params)) :
                        confType = dict(request.params).get('confType')
                    else :
                        confType = 'modalities'
                c.modality_conf_type = confType
                c.error=""
                try :
                    result = ModalityConfigurationManager.get_modalities_all_configuration()
                    c.modality_conf = result
                except Exception, e:
                    c.modality_conf = None
                    c.error = e
                return render_jinja2(template)
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)


    def update_modalities_configuration(self):
        """
            update the configuration for modalities
        """
        if request.method == 'POST':
            params = dict(request.params)
            if ('path' in params.keys()) :
                del(params['path'])
            params = json.loads(params['data'])
            if 'Accept' in request.headers and 'application/json' in request.headers['Accept']:
                response.content_type = 'application/json; charset=utf-8'
            result = ModalityConfigurationManager.update_modalities_configuration(modality_conf=params)
            return json.dumps(result)
        else :
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

    def update_groups_configuration(self):
        """
            update the configuration for modality groups
        """
        if request.method == 'POST':
            params = dict(request.params)
            if ('path' in params.keys()) :
                del(params['path'])
            params = json.loads(params['data'])
            if 'Accept' in request.headers and 'application/json' in request.headers['Accept']:
                response.content_type = 'application/json; charset=utf-8'
            result = ModalityConfigurationManager.update_groups_configuration(group_conf=params)
            return json.dumps(result)
        else :
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

    def new_modality_configuration(self):
        """
            add new modality configuration
        """
        if request.method == 'POST':
            params = dict(request.params)
            if ('path' in params.keys()) :
                del(params['path'])
            params = json.loads(params['data'])
            if 'Accept' in request.headers and 'application/json' in request.headers['Accept']:
                response.content_type = 'application/json; charset=utf-8'
            result = ModalityConfigurationManager.new_modality_configuration(modality_conf=params)
            return json.dumps(result)
        else :
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

    def download_modality_configuration(self):
        """
            download modality configuration
        """
        filename, result = ModalityConfigurationManager.download_modality_configuration()
        response.content_type = 'text/xml; charset=utf-8'
        response.content_disposition = 'attachment; filename="%s"' %(filename)
        return result

    def ajax_modality_config(self):
        """
            returns groups configuration json
        """
        config = {
            'modality_groups':ModalityConfigurationManager.get_modality_groups(),
            'modalities':ModalityConfigurationManager.get_modalities()
        }

        @jsonify
        def _json_resp():
            return config

        def _jsonp_resp(callback_name):
            response.content_type = 'text/javascript; charset=utf-8'
            return '%s(%s)' % (callback_name, config)

        if request.GET.get('callback'):
            return _jsonp_resp( request.GET.get('callback') )
        else:
            return _json_resp()

    @jsonify
    #@trace
    def ajax_modalities(self, concept_handle):
        difficulty = request.params.get('difficulty')
        by = request.params.get('by')
        if not by:
            by = ''
        try:
            data = ModalityManager.get_modalities_by_node_handle(concept_handle, difficulty, by)
            modalities = self._filter_modalities_set(data)
            for modality in modalities:
                if not modality['summary'] or modality['summary'] == 'None':
                    modality['summary'] = ''
            return { 'modalities' : modalities }
        except RemoteAPITimeoutException: abort(408)

    def __cleanModalityData(self, modality_artifact):
        if modality_artifact.get('artifactType') in ['lesson', 'concept']:
            for revision in modality_artifact['revisions']:
                if 'children' in revision:
                    revision.pop('children')
                if 'attachments' in revision:
                    revision.pop('attachments')

    def __setContentURL(self, c):
        params = {'format':'html'}
        if c.previewdraft == True:
            params.update({'returnDraftIfDraftExists':'true'})
        api_endpoint = '/flx/get/perma/modality/%s/%s' % (c.modality_data['artifact'].get('artifactType'),c.modality_data['artifact'].get('handle'))

        if c.modality_data['artifact'].get('realm'):
            api_endpoint = '%s/%s' % (api_endpoint, urllib.quote(c.modality_data['artifact'].get('realm')))
        api_endpoint = '%s/%s' % (api_endpoint, c.modality_data['domain'].get('encodedID'))

        if c.modality_data['artifact'].get('revision'):
            params['extension'] = 'version:%s' % c.modality_data['artifact'].get('revision')

        api_endpoint = '%s?%s' %(api_endpoint,urllib.urlencode(params))
        c.content_url = api_endpoint

    def load_test_details(self, mtype, eid, mhandle, realm=None):
        if eid:
            mtype_map = {
                'practice':'asmtpractice',
                'quiz':'asmtquiz',
                #'interactive practice':'asmtpracticeint'
            }
            ext_params = {}
            mtype = mtype_map[mtype.lower()]
            if not eid.startswith("UGC"):
                conceptNode = ConceptNodeManager.getConceptNodeInfo(eid)
                branch_name = conceptNode.get('branch', {}).get('name')
            else:
                conceptNode = BrowseManager.getBrowseTermByEncodedId(eid)
                branch = conceptNode.get_branch()
                branch_name = branch.get("name")


            artifact = ArtifactManager.getArtifactByPerma(artifact_type=mtype,
                                                      artifact_title=mhandle,
                                                      realm=realm,
                                                      ext=ext_params)

            redirect_url = ''
            if artifact and artifact['collections'] and artifact['collections'][0]:
                branch_name = artifact['collections'][0]['collectionHandle']
                handle = artifact['collections'][0]['conceptCollectionAbsoluteHandle']
                redirect_url = '/c/'
            elif artifact and artifact['domain'] and artifact['domain']['handle']:
                handle = artifact['domain']['handle']
                branch_name = artifact.get_branch_handle()
            else:
                handle = conceptNode.get('handle')
                branch_name = conceptNode.get('branch').get('name')
                branch_name = h.resourceNameToHandle(branch_name)

            if realm:
                redirect_url = redirect_url + branch_name.lower().replace(' ', '-') + '/' + handle + '/' + mtype + '/' + urllib.quote(realm) + '/' + mhandle +'/'
            else:
                redirect_url = redirect_url + branch_name.lower().replace(' ', '-') + '/' + handle + '/' + mtype + '/' + mhandle + '/'

            redirect_url = h.safe_encode(redirect_url)
            if dict(request.params):
                redirect_url = redirect_url + '?' + urllib.urlencode(request.params)
            log.debug("type: %s, redirect_url: %s" % (type(redirect_url).__name__, redirect_url))
            return redirect(redirect_url)
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

    def edit_test_details(self, mtype, eid, mhandle, realm=None):
        if eid:
            if not eid.startswith("UGC"):
                conceptNode = ConceptNodeManager.getConceptNodeInfo(eid)
                branch_name = conceptNode.get('branch', {}).get('name')
            else:
                conceptNode = BrowseManager.getBrowseTermByEncodedId(eid)
                branch = conceptNode.get_branch()
                branch_name = branch.get("name")

            branch_name = h.resourceNameToHandle(branch_name)
            handle = conceptNode.get('handle')

            if request.params.has_key('e_title') and request.params.has_key('encoded_id'):
                c.incoming_ex_title = request.params['e_title']
                c.encoded_id = request.params['encoded_id']
                if request.params.has_key('referrer') and request.params['referrer'] == 'my_content':
                    c.practice_page_url = "/my/library/content/assessment/"
                else:
                    if request.params.has_key('np'):
                        c.exercise_page_url = request.params['np'].encode("utf-8")
                    else:
                        c.exercise_page_url = '/' + branch_name.lower() + '/' + handle

                    if request.params.has_key('ep'):
                        c.practice_page_url = request.params['ep'].encode("utf-8")
                    else:
                        c.practice_page_url = '/' + mtype + '/' + eid + '/' + mhandle
                        if realm:
                            c.practice_page_url = c.practice_page_url +  '/' + realm
            else:
                c.incoming_ex_title = "My Quizzes"
                c.encoded_id = eid
                c.exercise_page_url = c.practice_page_url = "/my/library/content/assessment/"

            c.mode = 'edit'
            c.type = mtype
            c.mhandle = mhandle

            c.user_has_signedin = False
            if not SessionManager.isGuest():
                c.user_has_signedin = True
            if request.params.has_key('questionPage'):
                c.questionPage = True
            if request.params.has_key('question_id'):
                c.question_id = request.params['question_id'].encode("utf-8")
            if request.params.has_key('referrer'):
                c.referrer = request.params['referrer']

            return render_jinja2('exercise_ae/create_test.html')
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)
