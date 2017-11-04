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

from flxweb.lib.base import BaseController
from pylons import config, request, response, tmpl_context as c
from pylons.controllers.util import abort
from pylons.templating import render_jinja2
from pylons.decorators import jsonify
from pylons.controllers.util import redirect
from flxweb.config.routing import make_map
from flxweb.model.artifact import ArtifactManager
from flxweb.model.browseTerm import BrowseManager
from flxweb.lib.helpers import url, get_chunked_list, safe_encode, safe_decode
import simplejson, logging, re
from flxweb.model.task import TaskManager
from flxweb.lib.ck12.decorators import ajax_login_required, login_required,\
    trace
from urllib import unquote
from flxweb.model.modality import ModalityManager
from flxweb.lib.ck12.util import parse_perma
from flxweb.lib.ck12.exceptions import RemoteAPITimeoutException
from flxweb.lib import helpers as h

log = logging.getLogger(__name__)

class DetailsController(BaseController):

    #@trace
    def artifact_perma (self, artifact_type, artifact_title, realm, ext, noindex=None):
        # SEO change for Pivotal story 139517797
        # If noindex is true, add <meta name="robots" content="noindex" />
        # to the html template
        if noindex:
            c.noindex = True

        get_details = False
        #process ext
        ext_params = {}
        if ext:
            params = ext.split('/')
            if params[0].lower().startswith('r'):
                version = params[0].strip('r')
                ext_params['version'] = version
        if artifact_type == 'concept':
            artifact_type = 'lesson'
            ext_params.update({'includeChildContent':'true', 'includeRelatedArtifacts':'true'})
        if artifact_type in ArtifactManager.BOOK_TYPES:
            ext_params.update({'includeExtendedArtifacts':'true'})

        try:
            if artifact_type != 'lesson' or realm or request.GET.get('ref') or ext:
                artifact = ArtifactManager.getArtifactByPerma(artifact_type, artifact_title, realm, ext_params, details=get_details)
            else:
                difficulty = request.GET.get('difficulty')
                artifact = ModalityManager.get_modalities_by_node_handle(artifact_title, difficulty, pageSize=1)
                c.difficulty_level = difficulty
                if not artifact:
                    artifact = ArtifactManager.getArtifactByPerma(artifact_type, artifact_title, realm, ext_params, details=get_details)
            if artifact and request.GET.get('previewdraft') != 'false' and artifact.get('hasDraft') == True:
                c.previewdraft = True
                artifact = ArtifactManager.getArtifactDraftByArtifactRevisionID(artifact.get('artifactRevisionID'))
            else:
                c.previewdraft = None
        except RemoteAPITimeoutException:
            log.debug("!!!!")
            abort(408)

        if artifact:
            #Bug 46507: check handles to make sure they match. Else we redirect to the correct handles
            self.check_handles(artifact_title, artifact)

            #get breadcrumbs
            crumb = None
            crumb_concept = None
            try:
                if artifact.is_published():
                    #only add subject crumbs for published artifacts
                    if artifact.get('artifactType') in ArtifactManager.BOOK_TYPES:
                        #for books, look for subject metadata
                        subjects = artifact.get_subjects()
                        if subjects:
                            # get browseterms for each item in subjects
                            browseterms = [ BrowseManager.getBrowseTermByName(subject.get('name')) for subject in subjects ]
                            if browseterms:
                                crumb_term = None
                                for term in browseterms:
                                    if term:
                                        if not crumb_term:
                                            crumb_term = term
                                        else:
                                            #pick the deepest of subject and branch
                                            if crumb_term.get('level') < term.get('level'):
                                                crumb_term = term
                                if crumb_term:
                                    #create breadcrumb item
                                    crumb = { 'perma': url('browse', subject=crumb_term.slug() ) , 'title': crumb_term.get('name') , 'is_subject': True}
                    elif artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_LESSON:
                        #for concepts, use eid to get the correct browseterm
                        eid = artifact.getDomainEID()
                        if eid:
                            eid = '.'.join(eid.split('.')[:2]) #we only need the subject and branch
                            term = BrowseManager.getBrowseTermByEncodedId(eid) # get the browseterm
                            #[Bug 13241] "Software Testing" breadcrumb should be 'Engineering'
                            if eid.startswith('ENG'):
                                term = BrowseManager.getBrowseTermByEncodedId('ENG')
                            if term:
                                # create breadcrumb item
                                crumb = { 'perma': url('browse', subject=term.slug() ) , 'title': term.get('name'), 'is_subject': True }
                    elif artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_RWA:
                        eid = request.GET.get('eid')
                        ref = request.GET.get('ref')
                        rtitle = request.GET.get('rtitle')
                        if eid and ref and rtitle:
                            eid = '.'.join(eid.split('.')[:2])
                            term = BrowseManager.getBrowseTermByEncodedId(eid) # get the browseterm
                            if term:
                                # create breadcrumb item
                                crumb = { 'perma': url('browse', subject=term.slug() ) , 'title': term.get('name'), 'is_subject': True }
                                crumb_concept = { 'perma': url(ref), 'title': rtitle }
                                log.debug(crumb_concept)
            except:
                #if anything goes wrong, do not add the breadcrumb.
                crumb = None
                crumb_concept= None
            breadcrumbs = []
            if crumb:
                #if crumb exists, add it to the list of breadcrumbs.
                breadcrumbs .append(crumb)
            if crumb_concept:
                breadcrumbs.append(crumb_concept)

            _artifact_type = artifact.get('artifactType')
            #if _artifact_type == 'lesson':
            #    _artifact_type = 'concept'
            page_url = url( controller='details', action='book_details_react', artifact_type=_artifact_type, artifact_title=artifact.get('handle'), realm=artifact.get('realm'), ext=None)
            ref = request.GET.get('ref')
            #add modalities breadcrumb
            if ref:
                try:
                    modalities_url = url( ref, qualified=True )
                    domain = artifact.get('domain')
                    if domain and artifact.get('artifactType') not in ArtifactManager.BOOK_TYPES:
                        if len(breadcrumbs) == 0:
                            term_eid = domain.get('encodedID')
                            if term_eid:
                                term_eid = '.'.join( term_eid.split('.')[:2] )
                                term = BrowseManager.getBrowseTermByEncodedId(term_eid)
                                if term:
                                    branch_url = url('browse', subject=term.slug(), qualified=True)
                                    breadcrumbs.append({'perma': branch_url, 'title': term.get('name')})
                        if modalities_url:
                            breadcrumbs.append({ 'perma': modalities_url, 'title': domain.get('name') })
                except:
                    log.debug("Could not create breadcrumbs for ref: %s" % ref)

            #then add the artifact itself as as the last item in the chain of breadcrumbs.
            breadcrumbs.append( {
                'perma' : page_url,
                'title': artifact.get('title'),
                'type':artifact.get('artifactType'),
                'owner':artifact.is_owner(c.user),
                'realm': artifact.get('realm')
            } )
            c.breadcrumbs = breadcrumbs

            prev = artifact.getPrevious()
            if prev:
                c.prev_artifact = prev
                c.url_prev_artifact = url(controller='details', action='book_details_react',
                                          artifact_type = prev.get('artifactType'),
                                          artifact_title = prev.get('handle'),
                                          realm = prev.get('realm'),
                                          ext = 'r%s' % prev.getVersionNumber())
            next_artifact = artifact.getNext()
            if next_artifact:
                c.next_artifact = next_artifact
                c.url_next_artifact = url(controller='details', action='book_details_react',
                                          artifact_type = next_artifact.get('artifactType'),
                                          artifact_title = next_artifact.get('handle'),
                                          realm = next_artifact.get('realm'),
                                          ext = 'r%s' % next_artifact.getVersionNumber())

            c.url_view_reader = "read/" + artifact['perma']

            c.title = artifact_title

            c.eid = request.GET.get('eid')
            c.ref = request.GET.get('ref')
            return self.render_artifact_details(artifact)
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)


    @jsonify
    def artifact_info (self, artifact_type, artifact_title, realm, ext):
        get_details = True
        #process ext
        ext_params = {}
        if ext:
            params = ext.split('/')
            if params[0].lower().startswith('r'):
                version = params[0].strip('r')
                ext_params['version'] = version
        ext_params['includeChildHeaders'] = 'true'
        ext_params['includeConceptContent'] = 'true'

        artifact = ArtifactManager.getArtifactByPerma(artifact_type, artifact_title, realm, ext_params, details=get_details)

        api_response = {}
        if artifact:
            h2_re = re.compile('<h2 id=[\'|"](.*?)[\'|"].*?>(.*?)</h2>', re.DOTALL)
            artifact_xhtml = artifact.getXHTML()
            h2_containers = h2_re.findall(artifact_xhtml)
            h2_titles = []
            h2_ids = []
            for each_container in h2_containers:
                h2_ids.append(each_container[0].strip())
                h2_titles.append(each_container[1].strip())
            api_response['artifact_xhtml'] = artifact_xhtml
            api_response['nested_toc_titles'] = h2_titles
            api_response['nested_toc_ids'] = h2_ids
        return api_response

    def artifact_perma_paginated (self, artifact_type, artifact_title, realm, ext):
        get_details = True
        #process ext
        ext_params = {}
        if ext:
            params = ext.split('/')
            if params[0].lower().startswith('r'):
                version = params[0].strip('r')
                ext_params['version'] = version
        ext_params['includeChildHeaders'] = 'true'
        ext_params['includeConceptContent'] = 'true'

        artifact = ArtifactManager.getArtifactByPerma(artifact_type, artifact_title, realm, ext_params, details=get_details)

        if artifact:
            # collect feedback list.

            toc_list = {}
            toc_rev_ids = []
            toc_artifact_map = {}
            header_titles = []
            header_ids = []
            headers = ['h3','h2']
            do_show_custom_toc = "false"
            if artifact_type == ArtifactManager.ARTIFACT_TYPE_LESSON or artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT or artifact_type == ArtifactManager.ARTIFACT_TYPE_SECTION:
                do_show_custom_toc = "true"
                artifact_xhtml = artifact.getXHTML()
                for each_header in headers:
                    header_re = re.compile('<%s id=[\'|"](.*?)[\'|"].*?>(.*?)</%s>'%(each_header, each_header), re.DOTALL)
                    header_containers = header_re.findall(artifact_xhtml)
                    for each_container in header_containers:
                        header_ids.append(each_container[0].strip())
                        header_titles.append(each_container[1].strip())
                    if header_titles:
                        break
            if artifact_type in ArtifactManager.BOOK_TYPES:
                for each_child in artifact.getChildren():
                    toc_list[each_child['title']] = []
                    nested_child_list = each_child.getChildren()
                    if nested_child_list:
                        if type(nested_child_list[0]) == int:
                            for each_nested_child in nested_child_list:
                                toc_list[each_child['title']].append(each_nested_child)
                                toc_rev_ids.append(each_nested_child)
                        else:
                            for each_nested_child in nested_child_list:
                                toc_list[each_child['title']].append(each_nested_child.get_revision_id())
                                toc_rev_ids.append(each_nested_child.get_revision_id())
                chunked_rev_ids = get_chunked_list(toc_rev_ids, 100)
                for each_list in chunked_rev_ids:
                    response_map = ArtifactManager.get_artifacts_by_revision_ids(each_list, True, True)
                    if response_map:
                        toc_artifact_map.update(response_map)

            prev_artifact = artifact.getPrevious()
            if prev_artifact:
                c.prev_artifact = prev_artifact
                c.url_prev_artifact = prev_artifact.get('perma')
            next_artifact = artifact.getNext()
            if next_artifact:
                c.next_artifact = next_artifact
                c.url_next_artifact = next_artifact.get('perma')

            if not artifact_type in ArtifactManager.BOOK_TYPES:
                c.url_view_single_page = artifact['perma']

            c.title = artifact_title
            c.toc_list = toc_list
            c.toc_artifact_map = toc_artifact_map
            c.header_titles = header_titles
            c.artifact = artifact
            c.do_show_custom_toc = do_show_custom_toc
            c.attachments = ArtifactManager.get_artifact_resources(artifact['artifactType'], artifact['handle'], artifact['realm'], 'attachment')
            template = 'details/paginated_section_details.html'
            return render_jinja2(template)
        else:
            abort(404)

    def artifact_perma_context(self, render_context, perma_handle):
        perma_handle.rstrip('/')
        perma_handle = '%s/' % perma_handle
        perma = parse_perma(perma_handle)
        #process ext
        ext_params = {}
        ext = perma.get('ext')
        if ext:
            params = ext.split('/')
            if params[0].lower().startswith('r'):
                version = params[0].strip('r')
                ext_params['version'] = version
        if not perma:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                log.error("Error creating perma")
                abort(404)
        artifact = ArtifactManager.getArtifactByPerma(perma['artifact_type'], perma['artifact_title'], perma['realm'], ext_params, details=True)
        if artifact:
            if render_context == 'embed':
                return self.artifact_embed(artifact)
            if render_context == 'print':
                return self.artifact_print(artifact)
            if render_context == 'related':
                return self.artifact_related(artifact)
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                log.error("Could not get an artifact from perma call :%s" % perma)
                abort(404)

    @ajax_login_required()
    def ajax_artifact_render_status(self, render_type, artifact_id, revision_id, nocache=False, template_type=None):
        artifacturl = ""
        kwargs = {}
        if request.params.has_key('artifacturl'):
            artifacturl = request.params['artifacturl']
            kwargs = {'artifacturl': artifacturl}
        nocache = nocache == "True"
        task = TaskManager.get_render_task(render_type, artifact_id, revision_id, nocache, template_type, **kwargs)
        if task:
            if 'Accept' in request.headers and 'application/json' in request.headers['Accept']:
                response.content_type = 'application/json; charset=utf-8'
            return simplejson.dumps(task)
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)


    def render_artifact_details(self, artifact):
        artifact_type = artifact.get('artifactType')
        #[Bug 55967] check for book's published state only if it's a contextual section view
        ancestors = artifact.get_ancestors()
        if ancestors:
            if artifact_type == 'lesson' or artifact_type == 'section' or artifact_type == 'chapter':
                if artifact.is_book_published():
                    return self.artifact_details(artifact)
                else:
                    return self.artifact_details_notpublic(artifact)
        if artifact.is_published():
            return self.artifact_details(artifact)
        else:
            return self.artifact_details_notpublic(artifact)

    @login_required()
    def artifact_details_notpublic(self, artifact):
        return self.artifact_details(artifact)

    def artifact_details(self, artifact):
        url_pdf = artifact.get('url_pdf')
        c.url_pdf = None
        c.url_pdf_onecolumn = None
        c.url_pdf_twocolumn = None
        if url_pdf :
            if type(url_pdf) == list:
                for _url in url_pdf:
                    if _url.endswith('s1.pdf'):
                        c.url_pdf_onecolumn = _url
                        c.url_pdf = _url
                    if _url.endswith('s2.pdf'):
                        c.url_pdf_twocolumn = _url
            else:
                c.url_pdf = url_pdf

        artifact.get('url_pdf')

        artifact_type = artifact.get('artifactType')
        if artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT:
            artifact_type = ArtifactManager.ARTIFACT_TYPE_LESSON
        artifact_handle = artifact.get('handle')
        artifact_version = artifact.getVersionNumber()
        artifact_realm = artifact.get('realm')

        #related/extended artifacts
        related_list = {}
        if artifact_type in ArtifactManager.BOOK_TYPES:
            related_list = artifact.getExtended(use_api=False)
            related_list = related_list[:3]
            c.relation_type='extended'
        elif artifact_type in ['lesson','concept']:
            related_list = artifact.getRelated(use_api=False)
            c.relation_type='related'
        c.related_list = related_list

        c.artifact = artifact
        # copy of artifact for JSON dump
        c.artifact_json = artifact
        if 'revisions' in c.artifact_json and 'attachments' in c.artifact_json['revisions'][0]:
            c.artifact_json['revisions'][0].pop('attachments')

        # [Bug https://bugs.ck12.org/show_bug.cgi?id=55020]
        # only render filtered properties from ancestors as part of artifact_json
        if 'revisions' in c.artifact_json and 'ancestors' in c.artifact_json['revisions'][0]:
            ancestors = c.artifact_json['revisions'][0].get('ancestors', {})
            for ancestor in ancestors:
                ancestors[ancestor] = { filtered_key: ancestors[ancestor].get(filtered_key) for filtered_key in [
                  'artifactID',
                  'artifactRevisionID',
                  'handle',
                  'artifactType',
                  'realm',
                  'creatorID'
                ] }

        if 'relatedArtifacts' in c.artifact_json:
            if 'artifactList' in c.artifact_json['relatedArtifacts']:
                for relatedArtifactsListItem in c.artifact_json['relatedArtifacts']['artifactList']:
                    if 'revisions' in relatedArtifactsListItem:
                        relatedArtifactsListItem.pop('revisions')
        #Bug 9991, 10010: hide details tab for students
        c.show_details_tab = True

        # bug 10018:
        # show answer keys link to non student users
        # NOTE: we will show the link for the anonymous users
        # but will require the user to signin to see the form
        if c.artifact.is_teacher_book():
            c.show_answer_keys_link = True
        else:
            c.show_answer_keys_link = False

        if artifact.get('perma'):
            c.url_view_reader = "read/" + artifact['perma']
        template_type='concept'
        if artifact['artifactType'] in ArtifactManager.BOOK_TYPES:
            template_type = 'book'
        elif artifact['artifactType'] == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
            template_type='chapter'
        elif artifact['artifactType'] == ArtifactManager.ARTIFACT_TYPE_RWA:
            template_type='rwa'
        template = 'details/%s_details.html' % template_type

        c.artifactID = artifact['artifactID']

        #get practice details
        eid = artifact.getDomainEID()
        if eid and artifact_type == 'lesson':
            concepteid = h.getDomainEIDFromEID(eid)
            if concepteid:
                collectionInfo = artifact.get('collections')
                try:
                    collectionInfo = collectionInfo[0]
                except:
                    collectionInfo = None
                conceptCollectionHandle = None
                if collectionInfo:
                    conceptCollectionHandle = '%s-::-%s' % ( collectionInfo['collectionHandle'], collectionInfo['conceptCollectionAbsoluteHandle'] )
                modalitiesArtifact = ModalityManager.get_modalities_for_eid(concepteid,'asmtpractice', conceptCollectionHandle)
                if modalitiesArtifact and modalitiesArtifact["modalities"]:
                    modalitiesArtifact = modalitiesArtifact["modalities"]
                    for modality in modalitiesArtifact:
                        if modality["artifactType"] == 'asmtpractice' and modality["handle"] and modality.has_key("creator") and modality["creator"].strip() == 'CK-12':
                            c.practicePerma = "practice/"+ modality["handle"]
                            c.assessmentArtifact = modality

        return render_jinja2(template)

    def artifact_embed(self, artifact):
        c.artifact = artifact
        return render_jinja2('details/concept_embed.html')

    def artifact_print(self, artifact):
        c.artifact = artifact
        return render_jinja2('details/concept_print.html')

    def artifact_related(self, artifact):
        c.artifact = artifact
        c.related_items = ArtifactManager.getRelatedArtifacts(artifact['id'], 'concept')
        return render_jinja2('related/results_grid.html')

    def ajax_chapterinfo(self, booktype, book_handle, version, position, chapter_handle, realm=None):
        paragraph_re = re.compile('<p.*?</p>', re.DOTALL)
        chapter = ArtifactManager.getArtifactByPerma(ArtifactManager.ARTIFACT_TYPE_CHAPTER, chapter_handle, realm, details=True)

        c.chapter_intro = chapter.getChapterIntroduction()
        if c.chapter_intro:
            search = paragraph_re.search(c.chapter_intro)
            if search:
                c.chapter_intro = search.group(0)

        c.chapter_summary = chapter.getChapterSummary()
        if c.chapter_summary:
            search = paragraph_re.search(c.chapter_summary)
            if search:
                c.chapter_summary = search.group(0)

        c.chapter = chapter
        c.position = int(position.split('.')[0])
        c.book_context_url = '%s/%s/v%s/section/' % (booktype, book_handle, version)
        if realm:
            c.book_context_url = '%s/%s' % ( realm, c.book_context_url)
        c.chapter_url = '%s%s%s/%s/%s/' % (config.get('webroot_url'), c.book_context_url, position, chapter.get('artifactType'), chapter.get('handle') )
        return render_jinja2('details/ajax_conceptlist.html')

    def book_details_react(self, *args, **kwargs):
        keys_to_filter = ['booktype','book_handle','realm','title','position','version','section_title','artifact_title','ext','artifact_type']
        filtered_kwargs = { key: (kwargs[key] if key in kwargs else None) for key in keys_to_filter }

        #get mode from config
        mode = config.get('fbs_details_mode')
        mode_override = config.get('fbs_details_mode_override')

        if mode_override == 'cookie':
            #look for mode in cookie
            mode = request.cookies.get('fbs_details_mode',mode)
        elif mode_override == 'query':
            #look for the mode in query
            mode = request.params.get('fbs_details_mode',mode)

        log.debug('fbs_details_mode: %s' % mode)

        if mode == 'react':
            return render_jinja2('details/book_details_react.html')
        else:
            if filtered_kwargs['position']:
                artifact_perma_context_book_kwargs = {key: filtered_kwargs[key] for key in ['realm','booktype','book_handle','version','position','section_title',] }
                return self.artifact_perma_context_book(**artifact_perma_context_book_kwargs)
            else:
                artifact_perma_kwargs = {key: filtered_kwargs[key] for key in ['realm','artifact_type','artifact_title','ext']}
                return self.artifact_perma(**artifact_perma_kwargs)





    def artifact_perma_context_book(self, booktype, book_handle, version, position, section_title=None, realm=None, noindex=None):
        # SEO change for Pivotal story 139517797
        # If noindex is true, add <meta name="robots" content="noindex" />
        # to the html template
        if noindex:
            c.noindex = True
        artifact = ArtifactManager.getPermaDescendantArtifact(booktype, book_handle, version, position, realm, rtype='info')
        if not artifact:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

        if version:
            url_book_context = '%s/%s/r%s/section/' % (booktype, book_handle, version )
        else:
            url_book_context = '%s/%s/section/' % (booktype, book_handle )
        if realm:
            url_book_context = '%s/%s' % ( realm, url_book_context )
        url_book_context = safe_decode(url_book_context)

        if request.GET.get('previewdraft') != 'false' and artifact.get('hasDraft') == True:
            c.previewdraft = True
            artifact_new = ArtifactManager.getArtifactDraftByArtifactRevisionID(artifact.get('artifactRevisionID'))
            artifact_new['feedbacks'] = artifact['feedbacks']
            artifact_new['revisions'] = artifact['revisions']
            artifact_new['pre'] = artifact['pre']
            artifact_new['post'] = artifact['post']
            artifact = artifact_new
            artifact.hasDraft = True
            changed_metadata = artifact.get('changed_metadata')
            if changed_metadata:
                add = changed_metadata.get('add')
                remove = changed_metadata.get('remove')

                gradeGrid = artifact.get('gradeGrid')
                subjectGrid = artifact.get('subjectGrid')
                searchGrid = artifact.get('searchGrid')
                tagGrid = artifact.get('tagGrid')
                if add:
                    grade_level = add.get('grade level')
                    if grade_level:
                        for grade_term in grade_level:
                            gradeGrid.append([grade_term])
                    subject = add.get('subject')
                    if subject:
                        for subject_term in subject:
                            subjectGrid.append([subject_term])
                    search = add.get('search')
                    if search:
                        for search_term in search:
                            searchGrid.append([search_term])
                    tag = add.get('tag')
                    if tag:
                        for tag_term in tag:
                            tagGrid.append([tag_term])
                if remove:
                    grade_level = remove.get('grade level')
                    if grade_level:
                        for grade_term in grade_level:
                            for grade_item in gradeGrid:
                                if len(grade_item) > 1 and int(grade_item[1]) == grade_term:
                                    gradeGrid.remove(grade_item)
                    subject = remove.get('subject')
                    if subject:
                        for subject_term in subject:
                            for subject_item in subjectGrid:
                                if len(subject_item) > 1 and subject_item[1] == subject_term:
                                    subjectGrid.remove(subject_item)
                    search = remove.get('search')
                    if search:
                        for search_term in search:
                            for search_item in searchGrid:
                                if len(search_item) > 1 and search_item[1] == search_term:
                                    searchGrid.remove(search_item)
                    tag = remove.get('tag')
                    if tag:
                        for tag_term in tag:
                            for tag_item in tagGrid:
                                if len(tag_item) > 1 and tag_item[1] == tag_term:
                                    tagGrid.remove(tag_item)
        else:
            c.previewdraft = None

        ancestors = artifact.get_ancestors()
        book = ancestors.get('0.0')
        #Bug 46507: check handles to make sure they match. Else we redirect to the correct handles
        self.check_handles(book_handle,book)
        chapter = None
        # if the position is not dotted (as seen in some crawled urls, default to x.0
        if not '.' in position:
            position = '%s.0' % position

        if not position.endswith('.0'):
            chapter_position = '%s.0' % position.split('.')[0]
            chapter = ancestors.get(chapter_position)

        pre = artifact.get('pre')
        if pre:
            prev_sibling = pre.get('section')
            if prev_sibling:
                prev_sibling_section_position = prev_sibling.keys()[0]
                if prev_sibling_section_position and prev_sibling[prev_sibling_section_position]:
                    prev_artifact = ArtifactManager.toArtifact(prev_sibling[prev_sibling_section_position])
                    c.prev_artifact = prev_artifact
                    #if (prev_artifact.get('artifactType') != ArtifactManager.ARTIFACT_TYPE_CONCEPT):
                    c.url_prev_artifact = url(controller='details', action='book_details_react',
                        booktype=book.get('artifactType'),
                        book_handle=book.get('handle'),
                        version=version,
                        position= prev_sibling_section_position,
                        realm=book.get('realm'),
                        qualified=True)

            prev_parent = pre.get('parent')
            if prev_parent:
                prev_parent_section_position = prev_parent.keys()[0]
                if prev_parent_section_position and prev_parent[prev_parent_section_position]:
                    prev_parent_artifact = ArtifactManager.toArtifact(prev_parent[prev_parent_section_position])
                    c.prev_parent_artifact = prev_parent_artifact
                    c.url_prev_parent = url(controller='details', action='book_details_react',
                        booktype=book.get('artifactType'),
                        book_handle=book.get('handle'),
                        version=version,
                        position= prev_parent_section_position,
                        realm=book.get('realm'),
                        qualified=True)

        post = artifact.get('post')
        if post:
            post_sibling = post.get('section')
            if post_sibling:
                post_sibling_section_position = post_sibling.keys()[0]
                if post_sibling_section_position and post_sibling[post_sibling_section_position]:
                    next_artifact = ArtifactManager.toArtifact(post_sibling[post_sibling_section_position])
                    c.next_artifact = next_artifact
                    #if next_artifact.get('artifactType') != ArtifactManager.ARTIFACT_TYPE_CONCEPT:
                    c.url_next_artifact = url(controller='details', action='book_details_react',
                        booktype=book.get('artifactType'),
                        book_handle=book.get('handle'),
                        version=version,
                        position= post_sibling_section_position,
                        realm=book.get('realm'),
                        qualified=True)

            post_parent = post.get('parent')
            if post_parent:
                post_parent_section_position = post_parent.keys()[0]
                if post_parent_section_position and post_parent[post_parent_section_position]:
                    post_parent_artifact = ArtifactManager.toArtifact(post_parent[post_parent_section_position])
                    c.post_parent_artifact = post_parent_artifact
                    c.url_next_parent = url(controller='details', action='book_details_react',
                        booktype=book.get('artifactType'),
                        book_handle=book.get('handle'),
                        version=version,
                        position= post_parent_section_position,
                        realm=book.get('realm'),
                        qualified=True)

        c.position = position
        c.chapter_position = int(position.split('.')[0])
        c.url_book_context = url_book_context
        c.title = section_title

        c.context = book
        # copy of book for JSON dump
        c.context_json = book
        if 'children' in c.context_json:
            c.context_json.pop('children')
        if 'revisions' in c.context_json:
            c.context_json.pop('revisions')

        c.editable = True
        if not book.is_latest() and book.is_owner(c.user):
            c.editable = False
        #replace chapter cover
        if artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
            artifact['coverImage'] = book.get('coverImage')
        #build breadcrumbs
        breadcrumbs = []
        crumb = None
        try:
            if book.is_published():
                # get subject breadcrumb only for published books
                subjects = book.get_subjects()
                if subjects:
                    browseterms = [ BrowseManager.getBrowseTermByName(subject.get('name')) for subject in subjects ]
                    if browseterms:
                        crumb_term = None
                        for term in browseterms:
                            if term:
                                if not crumb_term:
                                    crumb_term = term
                                else:
                                    if crumb_term.get('level') < term.get('level'):
                                        crumb_term = term
                        if crumb_term:
                            crumb = { 'perma': url('browse', subject=crumb_term.slug() ) , 'title': crumb_term.get('name') , 'is_subject': True}
        except:
            crumb = None

        if crumb:
            breadcrumbs.append(crumb)

        if version:
            ext = 'r' + version
        else:
            ext = version
        breadcrumbs.append({'perma': url(controller='details',
                                         action='book_details_react',
                                         artifact_type=booktype,
                                         artifact_title=book_handle,
                                         realm=book.get('realm'),
                                         ext=ext),
                            'title':book.get('title'),'type':book.get('artifactType'),'owner':book.is_owner(c.user),'realm':book.get('realm')})
        if not position.endswith('.0'):
            if not chapter.is_latest() and chapter.is_owner(c.user):
                c.editable = False
            chapter_url = url(controller='details', action='book_details_react',
                        booktype=book.get('artifactType'),
                        book_handle=book.get('handle'),
                        version=version,
                        position= '%s' % chapter_position,
                        realm=book.get('realm'))
            breadcrumbs.append({'perma':chapter_url,'title':chapter.get('title'),'type':chapter.get('artifactType'),'position':chapter_position})
        breadcrumbs.append({'perma':artifact.getPermaHandle(True),'title':artifact.get('title'),'type':artifact.get('artifactType'),'position':position})
        c.breadcrumbs = breadcrumbs
        c.page_url = url(controller='details', action='book_details_react',
                        booktype=book.get('artifactType'),
                        book_handle=book.get('handle'),
                        version=version,
                        position= position,
                        realm=book.get('realm'))
        return self.render_artifact_details(artifact)

    @jsonify
    def ajax_get_resources(self, perma_handle, resource_type):
        resources = None
        perma_handle.rstrip('/') #strip all trailing slashes
        perma_handle = '%s/' % perma_handle #and add just one
        perma = parse_perma(perma_handle.encode('utf-8'))
        if perma:
            artifact_type = perma['artifact_type']
            artifact_handle = perma['artifact_title']
            artifact_realm = perma['realm']
            resources = ArtifactManager.get_artifact_resources(artifact_type, artifact_handle, artifact_realm, resource_type)
        return resources

    def ajax_get_resources_list(self, perma_handle):
        resources = None

        if perma_handle:
            perma_handle.rstrip('/') #strip all trailing slashes
            perma_handle = '%s/' % perma_handle #and add just one
            perma = parse_perma(perma_handle.encode('utf-8'))

            if perma:
                resource_type = 'resource'
                artifact_type = perma['artifact_type']
                if artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT:
                    artifact_type = ArtifactManager.ARTIFACT_TYPE_LESSON
                artifact_handle = perma['artifact_title']
                artifact_realm = perma['realm']
                artifact_version = perma['ext'].split('/')[0].strip('r')
                # attachments_only=True returns attachments including answer key and answer demo type for resources list.
                resources = ArtifactManager.get_artifact_resources(artifact_type, artifact_handle, artifact_realm, artifact_version, resource_type, attachments_only=True)
                #Bug 14123 removing reversing resource list.
                #resources.reverse()
                c.resources_list = resources
                c.atrifactType = artifact_type

        c.artifact_id = request.GET.get('artifact_id')
        c.artifact_revision_id = request.GET.get('artifact_revision_id')
        c.owned = request.GET.get('owned','').lower() == 'true'
        c.editable = request.GET.get('editable','').lower() == 'true'


        return render_jinja2('details/ajax_resources_list.html')

    def ajax_get_resources_list_answer_key(self, perma_handle):
        resources = None

        if perma_handle:
            perma_handle.rstrip('/') #strip all trailing slashes
            perma_handle = '%s/' % perma_handle #and add just one
            perma = parse_perma(perma_handle.encode('utf-8'))

            if perma:
                resource_type = 'resource'
                artifact_type = perma['artifact_type']
                if artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT:
                    artifact_type = ArtifactManager.ARTIFACT_TYPE_LESSON
                artifact_handle = perma['artifact_title']
                artifact_realm = perma['realm']
                artifact_version = perma['ext'].split('/')[0].strip('r')
                # attachments_only=True returns attachments including answer key and answer demo type for resources list.
                resources = ArtifactManager.get_artifact_resources(artifact_type, artifact_handle, artifact_realm, artifact_version, resource_type, attachments_only=True)
                #Bug 14123 removing reversing resource list.
                #resources.reverse()
                c.resources_list = resources
                c.atrifactType = artifact_type

        c.artifact_id = request.GET.get('artifact_id')
        c.artifact_revision_id = request.GET.get('artifact_revision_id')
        c.owned = request.GET.get('owned','').lower() == 'true'
        c.editable = request.GET.get('editable','').lower() == 'true'


        return render_jinja2('details/ajax_answer_key.html')

    def ajax_get_related_list(self, artifact_id, artifact_type):
        related_list = {}
        if artifact_type in ArtifactManager.BOOK_TYPES:
            related_list = ArtifactManager.get_extended_artifacts(artifact_id, artifact_type, 'artifact')
            related_list = related_list[:3]
            c.relation_type='extended'
        elif artifact_type in ['lesson','concept']:
            related_list = ArtifactManager.getRelatedArtifacts(artifact_id, artifact_type, 3)
            c.relation_type='related'
        c.related_list = related_list
        return render_jinja2('details/ajax_related_list.html')

    def get_task_status(self,taskid):
        task = TaskManager.get_task_by_id(taskid)
        response.headers['Content-type'] = 'application/json; charset=utf-8'
        return simplejson.dumps(task)

    def ajax_get_vocabulary_list(self, perma_handle):
        vocabularies = None
        languages = None
        language_code = 'en'

        if perma_handle:
            #perma_handle.rstrip('/') #strip all trailing slashes
            #perma_handle = '%s/' % perma_handle #and add just one
            #mapper = make_map(config)
            #perma = mapper.match('/%s' % perma_handle.encode('utf-8'))
            perma = parse_perma(perma_handle)
            params = {}
            if request.params.has_key('code'):
                language_code = request.params['code']

            if perma:
                artifact_type = perma['artifact_type']
                if artifact_type == ArtifactManager.ARTIFACT_TYPE_CONCEPT:
                    artifact_type = ArtifactManager.ARTIFACT_TYPE_LESSON
                artifact_handle = perma['artifact_title']
                artifact_realm = perma['realm']
                artifact_version = perma['ext'].split('/')[0].strip('r')

                response = ArtifactManager.get_artifact_vocabulary(artifact_type, artifact_handle, artifact_realm, artifact_version, language_code)
                if response:
                    vocabularies = response['vocabularies']
                    languages    = response['languages']
                c.vocabularies_list = vocabularies
                c.languages_list = languages
                c.language_code = language_code
                if languages:
                    language= filter(lambda x: x['languageCode']==language_code , languages)
                    if len(language)>0:
                        c.language_name = language[0]['languageName']

        return render_jinja2('details/ajax_vocabulary_list.html')

    def check_handles(self,handle, artifact):
        '''
        Checks the correctness of the handles. Following cases are handled.

        1. Bug: 34058 (maintained the old fix from 34058)
        2. if the given (used in the current URL) handle does not match the one
        from artifact, redirect to the new URL with correct handle.
        '''

        if 'domain' in artifact and 'modalities' in artifact :
            artifact['difficulty'] = request.GET.get('difficulty')
            domain = artifact.get('domain')
            branch = domain.get('branchInfo')

            concept_handle = domain.get('handle').lower()
            branch_handle = branch.get('handle').lower()
            concept_url = h.url('concept', branch=branch_handle, artifact_title=concept_handle)
            return redirect(concept_url,code=301)

        if 'handle' in artifact:
            handle = unquote(handle)
            artifact_handle = unquote(artifact['handle'])
            if handle != artifact_handle and hasattr(request, 'url'):
                try:
                    corrected_url = request.url.replace(handle,artifact_handle)
                    log.debug("Redirecting to %s since handle=%s does not match handle=%s" % (corrected_url,handle,artifact_handle) )
                    return redirect(corrected_url,code=301)
                except Exception, e:
                    pass
