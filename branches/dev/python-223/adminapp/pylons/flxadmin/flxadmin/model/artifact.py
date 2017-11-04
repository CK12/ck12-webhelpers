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

from beaker.cache import cache_region
from flxadmin.lib.ck12.decorators import ck12_add_nocache
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.lib.ck12.exceptions import ArtifactSaveException, \
    ResourceAssociationException, RemoteAPIStatusException, \
    ArtifactMetadataSaveException
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.unicode_util import UnicodeWriter
from flxadmin.model.artifactRevision import ArtifactRevision
from flxadmin.model.ck12model import CK12Model
from urllib import quote
import logging
import re
import tempfile


JSON_FIELD_RESPONSE = 'response'
JSON_FIELD_RESULT = 'result'

log = logging.getLogger(__name__)

class Artifact(CK12Model):
    
    ARTIFACT_TYPE_CONCEPT = 'concept'

    def __init__(self, dict_obj=None):
        CK12Model.__init__(self, dict_obj)
        if dict_obj and self.get('id') and self.get('handle') and self.get('artifactType')!= 'simulationint':
            self['perma'] = self.getPermaHandle()
            self['handle'] = quote(self['handle'].encode('utf-8'))

            #If children are not present on artifact, get them from revision
            if not self.has_key('children') and  self.has_key('revisions'):
                _artifact = self['revisions'][0]
                if _artifact.has_key('children'):
                    self['children'] = _artifact['children']
                else:
                    self['children'] = []

            if not 'revision_id' in self:
                revision_id = None
                if self.has_key('artifactRevisionID'):
                    revision_id = self.get('artifactRevisionID')
                else:
                    rev = self.getRevision() 
                    if rev and rev.has_key('artifactRevisionID'):
                        revision_id = rev.get('artifactRevisionID')
                self['revision_id'] = revision_id

            #    if not revision_id:
            #        revision_id = self.get('id')
            #    self['revision_id'] = revision_id
            
            
            # get following from revision and make them available
            # through the artifact object
            # 1) PDF/EPUB URLs
            # 2) Resource counts (resources like video,etc)
            if self.has_key('revisions'):
                revision = self.getRevision()
                self['url_pdf'] = revision.get('pdf')
                self['url_epub'] = revision.get('epub')
                self['url_mobi'] = revision.get('mobi')
                if 'resourceCounts' in revision:
                    self['resourceCounts'] = revision.get('resourceCounts')
        else:
            if not self['perma']:
                self['perma'] = ''
            if not self['revisions']:
                self['revisions'] = []
            if not self['children']:
                self['children'] = []
        if 'domain' in self and self['domain']:
            self['conceptNode'] = self['domain'].get('encodedID')
        self['concepts'] = []
        self['eids'] = []
        if 'foundationGrid' in self and self['foundationGrid']:
            for x in self['foundationGrid']:
                if len(x) > 2:
                    self['concepts'].append(x[1])
                    self['eids'].append(x[2])
        self['concepts'] = ', '.join(self['concepts'])
        self['eids'] = ', '.join(self['eids'])
 
    def __str__(self):
        return '<%s.%s object at %s>' % (self.__class__.__module__, self.__class__.__name__, hex(id(self)))
    
    def is_flexbook(self):
        '''
        Use this method to check if the artifact is a book 
        '''
        return False 

    def is_concept(self):
        '''
        Use this method to check if the artifact is concept
        '''
        return False 

    '''
    returns the perma url handle for the artifact in the format <realm>/<type>/<ext>
    '''
    def getPermaHandle(self, include_version=False):
        artifact_handle = self['handle']
        artifact_type = self['artifactType']
        artifact_realm = self.get('realm')
        perma = ''
        if artifact_handle:
            perma = '%s/%s/' % (artifact_type, quote(artifact_handle.encode('utf-8'), ':'))

        if artifact_realm:
            perma = '%s/%s' % (quote(artifact_realm.encode('utf-8'),":"), perma)

        if include_version:
            artifact_version = self.getVersionNumber()
            if artifact_version:
                perma = '%sr%s/' % (perma, artifact_version)
        return perma

    '''
    returns True if the artifact is of expected_type
    '''
    def isType(self, expected_type):
        return self['artifactType'] == expected_type

    '''
    returns the count of total downloads for the artifact
    '''
    def getDownloadCount(self):
        if ('revisions' in self) and ('statistics' in self['revisions'][0]):
            return self['revisions'][0]['statistics']['downloads']
        else:
            return 0

    '''
    returns the count of total favorites for the artifact
    '''
    def getFavoriteCount(self):
        total_favorites = 0
        for revision in self.getRevisions():
            total_favorites += revision.getFavoriteCount()
        return total_favorites

    '''
    returns artifact XHTML.
    this method only returns the contents of <body> tag, handles image thumbnail replacement 
    and adds wmode to flash objects
    '''
    def getXHTML(self, truncate_body=True, optimize_images=True):
        xhtml = ''
        if self.has_key('xhtml'):
            xhtml = self['xhtml']
    
            if truncate_body:
                start_index = xhtml.find('<body>')
                end_index = xhtml.find('</body>')
                if start_index > 0 and end_index > 0:
                    xhtml = xhtml[start_index + 6:end_index]
            if optimize_images:
                xhtml = xhtml.replace("/default/image/", "/THUMB_POSTCARD/image/")
    
            xhtml = xhtml.replace('<param name="allowscriptaccess" value="always" />', '<param name="allowscriptaccess" value="always" /><param name="wmode" value="transparent" />')
            xhtml = xhtml.replace('<embed', '<embed wmode="transparent"')

        return xhtml

    '''
    returns the list of related artifacts of specified type
    '''
    def getRelated(self, type='concept', count=0):
        return ArtifactManager.getRelatedArtifacts(self['id'], type, count)

    '''
    returns the previous artifact as per concept grid
    '''
    def getPrevious(self):
        pre = self.getPrerequisites(1)
        if pre:
            return pre[0]
        return None

    '''
    returns next artifact as per the concept grid
    '''
    def getNext(self):
        post = self.getPostrequisites(1)
        if post:
            return post[0]
        return None

    '''
    returns list of artifact prerequisites
    '''
    def getPrerequisites(self, count=None):
        if 'pre' in self:
            prereq_json = self.get('pre')
            prerequisites = []
            for encoding_id in prereq_json:
                requisite = prereq_json.get(encoding_id)
                prerequisites.append(ArtifactManager.toArtifact(requisite))
            return prerequisites
        else:
            return None

    '''
    returns list of artifact postrequisites(?)
    it basically returns a list of artifacts which 
    lie ahead on the concept grid from the current artifact.
    '''
    def getPostrequisites(self, count=None):
        if self.has_key('post'):
            postreq_json = self.get('post')
            postrequisites = []
            for encoding_id in postreq_json:
                requisite = postreq_json.get(encoding_id)
                postrequisites.append(ArtifactManager.toArtifact(requisite))
            return postrequisites
        else:
            return None

    '''
    returns current artifact revision
    '''
    def getRevision(self):
        current_revision = self.getVersionNumber()
        if current_revision > 0 :
            for revision in self.getRevisions():
                if revision['revision'] == current_revision:
                    return revision
        pass

    def get_revision_id(self):
        '''
        Returns the current revision ID
        '''
        revision_id = self.get('artifactRevisionID') #this gets correct revision ID when dealing with ArtifactRevision
        if not revision_id:
            revision_id = self.getRevision().get('artifactRevisionID') #this gets revision from Artifact's Revision
        return revision_id
    
    def get_artifact_id(self): 
        '''
        Returns artifact ID
        '''
        return self.get('artifactID')

    '''
    returns list of artifact revisions
    '''
    def getRevisions(self):
        if 'revisions' in self:
            revisions_list = []
            for revision in self['revisions']:
                revisions_list.append(ArtifactRevision(revision))
            return revisions_list
        pass

    def getVersionNumber(self):
        '''
        returns current version number of the artifact
        '''
        version = 0
        version = self.get('revision')
        if not version and self.getRevisions():
            version = self.getRevisions()[0].get('revision')
        return version
    
    def getMessageToUsers(self):
        '''
        returns message to users for the artifact
        '''
        messageToUsers = self.get('messageToUsers')
        if not messageToUsers and self.getRevisions():
            messageToUsers = self.getRevisions()[0].get('messageToUsers')
        return messageToUsers

    def getLatestVersionNumber(self):
        '''
        returns latest version number of the artifact
        '''
        return self.get('latestRevision')

    '''
    returns True if user has favorited the artifact. 
    '''
    def isFavorite(self):
        fav = False
        if self.get('isFavorite'):
            fav = True
        for revision in self.getRevisions():
            if revision.isFavorite():
                fav = True
                break
        return fav
    
    '''
    Returns the video thumbnail of the embed code returned as part of the API call.
    Normally this video embed code is the 1st video of the artifact 
    '''
    def getVideoThumbnail(self):
        if 'revisions' in self:
            if 'coverVideoSnippet' in self['revisions'][0]:
                coverVideoSnippet = self['revisions'][0]['coverVideoSnippet']
                thumbnail_url = re.search('<param name="thumbnail" value="([^\"]*)(") />', coverVideoSnippet)
                if thumbnail_url:
                    return thumbnail_url.group(1)
        #TODO: what should be returned if no video?

    '''
    Returns the anchor of 1st video of the artifact 
    '''
    def getVideoAnchor(self):
        if 'revisions' in self:
            if 'coverVideoSnippet' in self['revisions'][0]:
                coverVideoSnippet = self['revisions'][0]['coverVideoSnippet']
                anchor_name = re.search('<a name="([^\"]*)(")', coverVideoSnippet)
                if anchor_name:
                    return anchor_name.group(1)
        #TODO: what should be returned if no video?
    
    def get_children_count(self):
        '''
        Returns the count of the children of this Artifact.
        '''
        if self.has_key('children'):
            return len(self['children'])
        else:
            return 0

    def hasChildren(self):
        '''
        Returns True if Artifact has child Artifacts.
        '''
        return self.has_key('children') and len(self['children']) > 0
    
    def getChildren(self):
        '''
        Returns the list of Artifact children
        
        @return: 
            list of child Artifacts
        '''
        artifacts = []
        if self.hasChildren():
            for child in self['children']:
                if type(child) == int:
                    artifacts.append(child)
                else:
                    artifacts.append(ArtifactManager.toArtifact(child))
        return artifacts
    
    def set_children(self, children_list):
        '''
        sets children_list as artifact children
        @param children_list: list of child Artifacts 
        '''
        children_to_be_added = []
        for child in children_list:
            if isinstance(child, Artifact):
                children_to_be_added.append(child)
            else:
                log.debug('child has to be an Artifact, skipping item' % child)
        self['children'] = children_to_be_added
    
    def has_exercises(self):
        '''
        Returns True if artifact has exercises
        '''
        return False
    
    def get_exercise_perma(self):
        '''
        Returns Exercise URLfor this artifact
        '''
        if self.has_exercises():
            return self['perma'].replace(self['artifactType'], 'exercise')
    
    def get_extended_artifacts(self):
        '''
        returns list of extended artifacts
        '''
        _eajson = self.get('extendedArtifacts') #original extendedArtifacts dict
        extendedArtifacts = {}
        if _eajson:
            for eatype in _eajson:
                extendedArtifacts.update({ eatype:[] })
                _artifacts = _eajson.get(eatype)
                if _artifacts:
                    extendedArtifacts[eatype] = [ Artifact(a) for a in _artifacts ]
        return extendedArtifacts
    
    def get_authors(self):
        '''
        Returns list of authors
        '''
        authors_src = self.get('authors')
        if authors_src:
            authors = []
            for author in authors_src:
                author_name = author.get('name')
                #remove username part from author name
                username_re = re.compile(',?\s?\(\w+\)')
                username_re_search = username_re.search(author_name)
                if username_re_search:
                    author['name'] = author_name.replace(username_re_search.group(0), '')
                authors.append(author)
            return authors
        return None
        
    
    def get_authors_by_role(self):
        '''
        Returns list of authors grouped by role
        '''
        authors_by_role = {}
        authors = self.get_authors()
        if authors:
            for author in authors:
                author_role = author.get('role')
                if not authors_by_role.has_key(author_role):
                    authors_by_role[author_role] = []
                authors_by_role[author_role].append(author.get('name'))
        return authors_by_role

    
    def get_resource_count(self,resource_name):
        '''
        Returns the count of the resource(e.g video,audio,etc.) 
        available in the artifact.
        '''
        resource_name = resource_name.lower()
        if 'resourceCounts' in self and resource_name in self['resourceCounts']:
            return self['resourceCounts'][resource_name]
        else:
            return 0
            
    def has_video(self):
        '''
        Returns true if the artifact has video
        '''
        return self.get_resource_count('video') > 0 

    def has_content(self):
        '''
        Returns true if the artifact has contents
        '''
        return self.get_resource_count('contents') > 0 
    
    def has_interactive(self):
        '''
        Returns true if the artifact has interactive resources
        '''
        return self.get_resource_count('interactive') > 0
    
    def _get_ck12_data_segments(self, segment_type=None):
        '''
        extract x-ck12-data segments from artifact xhtml
        @param segment_type 
            type of data segment (knowledge-tree, objectives, problem-set etc...)
        '''
        if segment_type:
            data_segment_regex = re.compile('<div class="x-ck12-data-%s">(.*?)</div>' % segment_type, re.DOTALL)
        else:
            data_segment_regex = re.compile('<div class="x-ck12-data">(.*?)</div>', re.DOTALL)
        xhtml = self.getXHTML()
        if xhtml:
            matches = data_segment_regex.findall(xhtml)
            return matches

class ConceptArtifact(Artifact):
    '''
    Extends Artifact to provide methods specific to artifact type Concept
    '''
    
    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_CONCEPT
    
    def has_exercises(self):
        '''
        Returns True if concept has exercises
        '''
        return True

    def is_concept(self):
        '''
        Use this method to check if the artifact is concept
        '''
        return True 
    
class LessonArtifact (Artifact):
    '''
    Extends Artifact to provide methods specific to artifact type Lesson
    '''
    
    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_LESSON
        if not dict_obj.get('artifactID') and not dict_obj.get('xhtml'): #body for empty lesson
            self['xhtml'] = '<body>\
                            <div class="x-ck12-data-knowledge-tree"><!-- %KT% --></div>\
                            <div class="x-ck12-data-objectives"><!-- %LHS% --></div>\
                            <div class="x-ck12-data-concept"><!--    <concept /> --></div>\
                            <div class="x-ck12-data-problem-set"><!-- %LTS% --></div>\
                            </body>'
    
    def get_knowledge_tree(self):
        '''
        Returns contents of 'x-ck12-data-knowledge-tree' div of from xhtml'.
        '''
        knowledge_tree_xhtml = None
        data_segments = self._get_ck12_data_segments('knowledge-tree')
        if data_segments:
            knowledge_tree_xhtml = data_segments[0].strip().rstrip()
        return knowledge_tree_xhtml
    
    def get_objectives(self):
        '''
        Returns contents of 'x-ck12-data-objectives' div of from xhtml'.
        '''
        objectives_xhtml = None
        data_segments = self._get_ck12_data_segments('objectives')
        if data_segments:
            objectives_xhtml = data_segments[0].strip().rstrip()
        return objectives_xhtml
        
    def get_problem_set(self):
        '''
        Returns contents of 'x-ck12-data-problem-set' div of from xhtml'.
        '''
        problem_set_xhtml = None
        data_segments = self._get_ck12_data_segments('problem-set')
        if data_segments:
            problem_set_xhtml = data_segments[0].strip().rstrip()
        return problem_set_xhtml
            

class ChapterArtifact (Artifact):

    '''
    Extends Artifact to provide methods specific to artifact type Chapter
    '''
    
    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_CHAPTER
        if not dict_obj.get('artifactID') and not dict_obj.get('xhtml'): #body for empty chapter
            self['xhtml'] = '<body>\
                            <div class="x-ck12-data"><!-- %CHAP_CONT% --></div>\
                            <div class="x-ck12-data-lesson"><!-- <lessons /> --></div>\
                            <div class="x-ck12-data"><!-- %CHAP_TAIL_SUBSECTIONS% --></div>\
                            </body>'
    
    def getChapterIntroduction(self):
        '''
        return chapter Introduction
        '''
        introduction = ''
        data_segments = self._get_ck12_data_segments()
        if data_segments:
            introduction = data_segments[0].strip().rstrip()
        return introduction
        
    def getChapterSummary(self):
        '''
        return chapter Summary
        '''
        summary = ''
        data_segments = self._get_ck12_data_segments()
        if data_segments:
            summary = data_segments[1].strip().rstrip()
        return summary

class FlexBookArtifact (Artifact):
    '''
    Extends Artifact to provide methods specific to artifact type Flexbook
    '''
  
    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_BOOK

    def is_flexbook(self):
        '''
        Use this method to check for artifact being a flexbook
        '''
        return True
    
class TeacherBookArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type tebook
    '''
  
    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_TEACHER_BOOK

class WorkbookArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type workbook
    '''
  
    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_WORKBOOK

class StudyGuideArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type studyguide
    '''
  
    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_STUDY_GUIDE

class LabKitArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type labkit
    '''
  
    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_LAB_KIT

class SectionArtifact (Artifact):
    '''
    Extends Artifact to provide methods specific to artifact type Section
    '''
    
    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_SECTION

class SimulationArtifact (Artifact):
    '''
    Extends Artifact to provide methods specific to artifact type Simulation
    '''
    
    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_SIMULATION

class ArtifactManager(object):
    '''
    Provides static methods for Artifact retrival and manipulation.
    '''
    ARTIFACT_TYPE = 'artifact'
    ARTIFACT_TYPE_CONCEPT = 'concept'
    ARTIFACT_TYPE_BOOK = 'book'
    ARTIFACT_TYPE_TEACHER_BOOK = 'tebook'
    ARTIFACT_TYPE_WORKBOOK = 'workbook'
    ARTIFACT_TYPE_STUDY_GUIDE = 'studyguide'
    ARTIFACT_TYPE_LAB_KIT = 'labkit'
    ARTIFACT_TYPE_CHAPTER = 'chapter'
    ARTIFACT_TYPE_LESSON = 'lesson'
    ARTIFACT_TYPE_SECTION = 'section'
    ARTIFACT_TYPE_SIMULATION = 'simulationint'
    
    ARTIFACT_CLASSES = {
        ARTIFACT_TYPE_CONCEPT:ConceptArtifact,
        ARTIFACT_TYPE_LESSON:LessonArtifact,
        ARTIFACT_TYPE_CHAPTER:ChapterArtifact,
        ARTIFACT_TYPE_BOOK:FlexBookArtifact,
        ARTIFACT_TYPE_TEACHER_BOOK:TeacherBookArtifact,
        ARTIFACT_TYPE_WORKBOOK:WorkbookArtifact,
        ARTIFACT_TYPE_STUDY_GUIDE: StudyGuideArtifact,
        ARTIFACT_TYPE_LAB_KIT: LabKitArtifact,
        ARTIFACT_TYPE_SECTION:SectionArtifact,
        ARTIFACT_TYPE_SIMULATION:SimulationArtifact
    }

    @staticmethod
    def isEncodedID(id):
        parts = id.split('.')
        if len(parts) > 3:
            if len(parts[0]) == 3 and len(parts[1]) == 3 and len(parts[2]) == 3:
                return True
        return False

    @staticmethod
    def getArtifactByPerma(artifact_type, artifact_title, realm=None, ext=None, details=False):
        '''
        retrieve an artifact by its perma definition
        @param artifact_type: type of artifact (concept, chapter, lesson, book)
        @param artifact_title: hyphenated artifact title
        @param realm: artifact realm
        @param ext: extended parameters (revision number, language etc) 
        '''
        if ArtifactManager.isEncodedID(artifact_title):
            api_endpoint = 'get/detail/%s/%s' % (artifact_type, artifact_title)
        else:
            if details:
                api_endpoint = 'get/perma/%s/%s' % (artifact_type, artifact_title)
            else:
                api_endpoint = 'get/perma/info/%s/%s' % (artifact_type, artifact_title)
            if realm:
                api_endpoint = '%s/%s' % (api_endpoint, realm)
        params = {} #TODO: handle extended parameters
        if ext:
            extensions = ''
            for key in ext:
                extensions = '%s%s:%s,' % (extensions, key, ext[key])
            params['extension'] = extensions.rstrip(',')
                
        try:
            data = RemoteAPI.makeCall(api_endpoint, params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code):
                return None #artifact does not exist
        
        if data and (JSON_FIELD_RESPONSE in data) and (artifact_type in data[JSON_FIELD_RESPONSE]):
            artifact = ArtifactManager.toArtifact(data[JSON_FIELD_RESPONSE][artifact_type])
            return artifact
        else:
            log.error("%s was not found in response for %s with %s params" % (artifact_type, api_endpoint, params));
            return None
    
    
    @staticmethod
    def getArtifactByRevisionId(revision_id):
        '''
        retrieve an artifact by its revisionID
        '''
        api = 'get/info/revisions/%s' % revision_id
        try:
            data = RemoteAPI.makeGetCall(api)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code):
                return None #artifact does not exist
        
        if data and JSON_FIELD_RESPONSE in data:
            response = data[JSON_FIELD_RESPONSE]
            if 'artifacts' in response:
                artifacts = response.get('artifacts')
                artifact = ArtifactManager.toArtifact(artifacts[0])
                return artifact
            else:
                return None #TODO:exception-response does not contain any artifacts
        else:
            return None #TODO: exception-artifacts could not be loaded

    @staticmethod
    def getConceptsForAssignmentArtifact(artifactID):
        api_url = 'get/assignment/'
        api_endpoint = '%s%s' % (api_url, artifactID)
        params = {}
        try:
            data = RemoteAPI.makeCall(api_endpoint, params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code):
                return None #artifact does not exist
            else:
                raise ex

        concepts = []
        if data and JSON_FIELD_RESPONSE in data:
            response = data[JSON_FIELD_RESPONSE]
            if "responseHeader" in data:
                responseHeader = data["responseHeader"]
                if responseHeader["status"]!=0 and 'message' in response:
                    log.debug("Error fetching concepts for assignment, message returned :: %s"%response["message"])
                else:
                    concepts = response["assignment"]["concepts"]
        return concepts
    
    @staticmethod
    def getArtifactById(artifact_id, details=False):
        '''
        retrieve an artifact by ID
        '''
        if details :
            api_endpoint = 'get/detail/'
        else:
            api_endpoint = 'get/info/'
        api_endpoint = '%s%s' % (api_endpoint, artifact_id)
        artifact_type = 'concept'
        
        params = {}
        try:
            data = RemoteAPI.makeCall(api_endpoint, params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code):
                return None #artifact does not exist
            else:
                raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            for key in data[JSON_FIELD_RESPONSE]:
                artifact_type = key 
            if (artifact_type in data[JSON_FIELD_RESPONSE]):
                artifact = ArtifactManager.toArtifact(data[JSON_FIELD_RESPONSE][artifact_type])
                return artifact
        else:
            log.error("no artifact was found in response for %s with params %s" % (api_endpoint, params))
        return None

    @staticmethod
    def getAssignments(artifact_id, params):
        '''
        retrieve an artifact by ID
        '''
        api_endpoint = 'get/all/assignments'

        try:
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict=params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ASSIGNMENT == ex.status_code):
                return None #assignment does not exist
            else:
                raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            if ('assignments' in data[JSON_FIELD_RESPONSE] and data[JSON_FIELD_RESPONSE]['assignments']):
                return data[JSON_FIELD_RESPONSE]['assignments'][0]
        else:
            log.error("no assignment was found in response for %s with params %s" % (api_endpoint, params))
        return None

    @staticmethod
    def getMemberConceptScores(params={}):
        '''
        retrieve assessment recoreded scores by membersIDs and conceptIDs
        '''
        api_endpoint = 'api/get/summary/testScores/students'

        try:
            data = RemoteAPI.makeAssessmentGetCall(api_endpoint, params_dict=params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_GROUP == ex.status_code):
                return None
            else:
                raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            return data[JSON_FIELD_RESPONSE]
        else:
            log.error("no assignment was found in response for %s with params %s" % (api_endpoint, params))
        return None

    @staticmethod
    def getAllCourses(params={}):
        '''
            returns the list of all courses
        '''
        api_endpoint = 'get/info/courses'
        try:
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict=params)
        except RemoteAPIStatusException, ex:
            raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            return data[JSON_FIELD_RESPONSE]
        else:
            log.error("Unable to get list of courses")
        return []

    @staticmethod
    def getPublishedCollections(params={}):
        '''
            returns the list of all published collections
        '''
        api_endpoint = 'collections/published'        
        try:
            data = RemoteAPI.makeTaxonomyGetCall(api_endpoint, params_dict=params, update_request_header=False)
        except RemoteAPIStatusException, ex:
            raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            return data[JSON_FIELD_RESPONSE]
        else:
            log.error("Unable to get list of collections")
        return []        

    @staticmethod
    def getGroupAssignmentReport(groupID, params={}):
        '''
        retrieve an assignment details by groupID
        '''
        api_endpoint = '/get/group/assignments/report/%s' % ( groupID)

        try:
            data = RemoteAPI.makeGetCall(api_endpoint, params_dict=params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_GROUP == ex.status_code):
                return None
            else:
                raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            return data[JSON_FIELD_RESPONSE]
        else:
            log.error("no assignment was found in response for %s with params %s" % (api_endpoint, params))
        return None
    
    @staticmethod
    def get_artifacts_by_revision_ids(id_list,return_as_dict=False):
        '''
        retrieve artifact info for a list of artifact revision ids
        if 'return_as_dict' is passed as True,it will return
        a dictionary with artifact 'latestRevisionID' as the key
        '''
        ids = ','.join([ str(id) for id in id_list ])
        api = 'get/info/revisions/%s' % (ids)
        params = {'pageSize':len(id_list)}
        data = RemoteAPI.makeGetCall(api, params)
        if return_as_dict:
            artifacts = {}
        else:
            artifacts = []
        if data and (JSON_FIELD_RESPONSE in data):
            if 'artifacts' in data[JSON_FIELD_RESPONSE]:
                if return_as_dict:
                    for obj in data[JSON_FIELD_RESPONSE]['artifacts']:
                        artifact = ArtifactManager.toArtifact(obj)
                        artifacts [artifact['latestRevisionID']] = artifact 
                else:
                    artifacts = [ ArtifactManager.toArtifact(obj) for obj in data[JSON_FIELD_RESPONSE]['artifacts'] ]
        return artifacts
    
    @staticmethod
    def get_artifacts_by_ids(id_list,return_as_dict=False):
        '''
        retrieve artifact info for a list of artifact ids
        if 'return_as_dict' is passed as True,it will return
        a dictionary with artifact 'id' as the key
        '''
        ids = ','.join([ str(id) for id in id_list ])
        api = 'get/info/artifacts/%s' % (ids)
        params = {'pageSize':len(id_list)}
        data = RemoteAPI.makeGetCall(api, params)
        if return_as_dict:
            artifacts = {}
        else:
            artifacts = []
        if data and (JSON_FIELD_RESPONSE in data):
            if 'artifacts' in data[JSON_FIELD_RESPONSE]:
                if return_as_dict:
                    for obj in data[JSON_FIELD_RESPONSE]['artifacts']:
                        artifact = ArtifactManager.toArtifact(obj)
                        artifacts [artifact['id']] = artifact 
                else:
                    artifacts = [ ArtifactManager.toArtifact(obj) for obj in data[JSON_FIELD_RESPONSE]['artifacts'] ]
        return artifacts
    
    @staticmethod
    def getRelatedArtifacts(id, type, count=0):
        '''
        get other artufacts of specified type for a given artifact
        @param id: artifact ID
        @param type: type of related artifacts to retrieve for provided artifact
        @param count: max. number of related artifacts to be retrieved.
        '''
        api_endpoint = 'get/related/%s/%s' % (type, id)
        params = {}
        if count:
            params.update({'pageSize':count})

        related = RemoteAPI.makeGetCall(api_endpoint, params)
        if related and ('response' in related) and ('result' in related['response']):
            artifacts = []
            artifacts = [ ArtifactManager.toArtifact(related_artifact) for related_artifact in related['response']['result']]
            return  artifacts
        else:
            log.error("%s was not found in response for %s with %s params" % (type, api_endpoint, params));
            return None
        
    @staticmethod
    def getPermaDescendantArtifact(artifact_type, artifact_title, version, section, realm):
        api_endpoint = 'get/perma/descendant/%s/%s' % (artifact_type, artifact_title)
        if realm:
            api_endpoint = '%s/%s' % (api_endpoint, realm)
        params = {
            'extension':'version:%s' % (version),
            'section' : section
        }
        #if not section.endswith('.0') == ArtifactManager.ARTIFACT_TYPE_LESSON:
            #params['extension'] = '%s,includeChildContent:true' % params['extension']
        try:
            data = RemoteAPI.makeGetCall(api_endpoint, params)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code):
                return None #artifact does not exist
            else:
                raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            for key in data[JSON_FIELD_RESPONSE]:
                artifact_type = key 
            if (artifact_type in data[JSON_FIELD_RESPONSE]):
                artifact = ArtifactManager.toArtifact(data[JSON_FIELD_RESPONSE][artifact_type])
                return artifact
        else:
            return None
        
    @staticmethod
    def saveArtifact(artifact):
        '''ArtifactManager.saveArtifact
        uses Create/Update endpoints to save an artifact.
        If artifact does not have an ID, a new artifact will be created.
        If artifact already has an id, same artifact will be updated.
        
        @param artifact: 
            Artifact to be saved
        
        @return: 
            status of artifact save operation
        '''
        savedata = {}
        if not artifact.get('title') or not artifact.get('title').strip().rstrip():
            raise ArtifactSaveException('Cannot save Artifact with empty title.')
        savedata['title'] = artifact.get('title')
        savedata['summary'] = artifact.get('summary')
        savedata['xhtml'] = artifact.get('xhtml') or ''
        if artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
            booktitle = artifact.get('bookTitle')
            if not booktitle:
                raise Exception("Chapter must have bookTitle")
            savedata['bookTitle'] = booktitle
        if not artifact.get('id') or artifact.get('id') == 'new':
            api_endpoint = 'create/%s' % (artifact['artifactType'])
            savedata['cover image name'] = ''
            savedata['cover image description'] = ''
            savedata['cover image path'] = ''
            savedata['cover image uri'] = ''
        else:
            api_endpoint = 'update/%s/%s' % (artifact['artifactType'], artifact['id'])
            savedata['id'] = '%s' % artifact.get('id')

        savedata['children'] = '' 
        if artifact.hasChildren() and artifact.getChildren():
            list_children = ['%s' % child.get_revision_id() for child in artifact.getChildren()]
            savedata['children'] = ','.join(list_children)
        log.debug("Saving Artifact : %s" % savedata)
        try:
            data = RemoteAPI.makeCall(api_endpoint, savedata)
        except RemoteAPIStatusException, ex:
            raise ex
        if 'message' in data['response']:
            log.debug('Artifact was not saved. Reason %s' % data['response']['message'])
            raise ArtifactSaveException(data['response']['message'])

        if artifact['artifactType'] in data['response']:
            artifact = ArtifactManager.toArtifact(data['response'][artifact['artifactType']])
            return artifact
        else:
            raise ArtifactSaveException('API response did not have artifactType field')

    
    @staticmethod
    def save_artifact_in_context(artifact, context, position):
        '''
        @param artifact
            artifact to be saved. has to be a child within given context
        @param context
            root artifact, usually a book (book, tebook etc...)
        @param position
            position where artifact is located inside context
        @return
            status of save operation
        '''
        bookTitle = context.get('title')
        _artifact = None
        
        if artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER :
            artifact['bookTitle'] = bookTitle
        try:
            log.info('Contextual Save:saving artifact')
            artifact = ArtifactManager.saveArtifact(artifact)
            log.info ('artifact saved. id: %s' % artifact.get_artifact_id())
        except ArtifactSaveException, ex:
            log.debug("failed to save artifact %s:%s within context %s:%s"
                      % (artifact.get_artifact_id(), artifact.get('title'),
                         context.get_artifact_id(), context.get('title')) )
            raise ex
        if not position.endswith('.0'):
            chapter_position = int(position.split('.')[0])
            chapter_position_str = '%s.0' % chapter_position
            chapter_position = chapter_position-1
            artifact_position = int(position.split('.')[1])
            artifact_position = artifact_position -1
            log.info("Artifact Position: %s, Chapter Position: %s" %(artifact_position, chapter_position) )
            
            log.info('Contextual Save:getting chapter')
            chapter = ArtifactManager.getPermaDescendantArtifact(
                context.get('artifactType'), context.get('handle'), 
                context.getVersionNumber(), chapter_position_str,
                context.get('realm'))
            chapter['bookTitle'] = context.get('title')
            _children = dict(enumerate(chapter.getChildren()))
            log.info("Children:%s" % len(_children))
            _children[artifact_position] = artifact
            _artifact = chapter
            #update child artifact
            chapter.set_children(_children.values())
            log.info('Contextual Save:saving chapter')
            chapter = ArtifactManager.saveArtifact(chapter)
            log.info ('chapter saved. id: %s' % chapter.get_artifact_id())
        else:
            artifact_position = int(position.split('.')[0])
            artifact_position = artifact_position -1
            _artifact = artifact
        try:
            #update the book
            log.info("Artifact Position: %s" %(artifact_position) )
            log.info('Contextual Save:saving book')
            _children = dict(enumerate(context.getChildren()))
            _children[artifact_position] = _artifact
            context.set_children(_children.values())
            context = ArtifactManager.saveArtifact(context)
            log.info ('context saved. id: %s' % context.get_artifact_id())
            return artifact
        except ArtifactSaveException, ex:
            log.debug("failed to save context %s:%s while saving %s:%s" 
                      % (context.get_artifact_id(), context.get('title'),
                       artifact.get_artifact_id(), artifact.get('title')) )
            raise ex

    @staticmethod
    def deleteArtifact(artifact):
        log.debug('Deleting Artifact. id: %s' % artifact.get_artifact_id())
        api_endpoint = 'delete/%s/%s' % (artifact['artifactType'], artifact.get_artifact_id())
        try:
            data = RemoteAPI.makeCall(api_endpoint)
        except RemoteAPIStatusException, ex:
            raise ex
        return data

    @staticmethod
    def deleteArtifactById(artifactType, artifactId):
        log.debug('Deleting %s id: %s' % (artifactType, artifactId))
        api_endpoint = 'delete/%s/%s' % (artifactType, artifactId)
        try:
            data = RemoteAPI.makeCall(api_endpoint)
        except RemoteAPIStatusException, ex:
            raise ex
        return data
        
    @staticmethod
    @cache_region('short_term', 'latest')
    def getLatest(artifactType, count):
        '''
        returns the list of recently updated artifacts of specified type
        @param artifactType: type of artifact (book, concept, chapter, lesson)
        @param count: maximum number of items expected in the returned list  
        '''
        try:
            data = RemoteAPI.makeGetCall('get/latest/%s' % artifactType, {'pageSize': count})
            if data and ('response' in data) and ('result' in data['response']):
                artifacts = []
                artifacts = [ ArtifactManager.toArtifact(latestArtifact) for latestArtifact in data['response']['result']]
                return artifacts
            else:
                return []
        except Exception, e:
            log.error(e);
            return []

    @staticmethod
    @cache_region('short_term', 'popular')
    def getPopular(artifactType, count):
        '''
        returns the list of popular artifacts of specified type
        @param artifactType: type of artifact (book, concept, chapter, lesson)
        @param count: maximum number of items expected in the returned list  
        '''
        try:
            data = RemoteAPI.makeGetCall('get/popular/%s' % artifactType, {'pageSize': count})
            if data and ('response' in data) and ('result' in data['response']):
                artifacts = []
                artifacts = [ ArtifactManager.toArtifact(popularArtifact) for popularArtifact in data['response']['result']]
                return artifacts
            else:
                return []
        except Exception, e:
            log.error(e);
            return []

    @classmethod
    @ck12_add_nocache()
    @cache_region('forever')
    def getFeatured(cls,artifactType, count):
        '''
        returns the list of featured artifacts of specified type
        @param artifactType: type of artifact (book, concept, chapter, lesson)
        @param count: maximum number of items expected in the returned list  
        '''
        try:
            data = RemoteAPI.makeGetCall('get/featured/%s' % artifactType, {'pageSize': count})
            if data and ('response' in data) and ('result' in data['response']):
                artifacts = []
                for featured in data['response']['result']:
                    if 'artifact' in featured:
                        artifacts.append(ArtifactManager.toArtifact(featured['artifact'][0]))
                return artifacts
            else:
                return []
        except Exception, e:
            log.error(e);
            return []
    
    @staticmethod
    def toArtifact (dict_obj=None):
        '''
        toArtifact. Used to transform an artifact dict from coreAPI response 
        into an appropriate Artifact object
        '''
        artifactClass = Artifact
        if dict_obj and dict_obj.has_key('artifactType'):
            artifactType = dict_obj.get('artifactType')
            if ArtifactManager.ARTIFACT_CLASSES.has_key(artifactType):
                artifactClass = ArtifactManager.ARTIFACT_CLASSES[artifactType]
            else:
                log.debug("No class defined for artifact type %s. Fall back to generic Artifact model." % (artifactType));
        return artifactClass(dict_obj)
    
    @staticmethod
    def get_artifact_resources(artifact_type, artifact_handle, artifact_realm=None, resource_type='resource'):
        '''
        ArtifactManager.get_artifact_resources
        @param artifact_type: type of artifact
        @param artifact_handle: artifact handle
        @param artifact_realm: artifact realm  (example: user:admin)
        @param resource_type: type of resource ( use 'resource' for all resources)  
        '''
        api_endpoint = 'get/perma/info/resources/%s/%s' % (artifact_type, artifact_handle)
        if artifact_realm:
            api_endpoint = '%s/%s' % (api_endpoint, artifact_realm)
        api_endpoint = '%s/%s' % (api_endpoint, resource_type)
        
        data = RemoteAPI.makeGetCall(api_endpoint)
        if data and ('response' in data) and (artifact_type in data['response']):
            artifact_obj = data['response'][artifact_type]
            if 'resources' in artifact_obj:
                return artifact_obj['resources']
            else:
                log.debug("response did not contain any resources. API:%s" % api_endpoint)
                return None
        else:
            log.debug("response did not contain any resources. API:%s" % api_endpoint)
            return None
    
    @staticmethod 
    def _modify_resource_association(action, artifact_id, artifact_revision_id, resource_id, resource_revision_id):
        log.debug('%s resource association: artifact%sr%s, resource:%sr%s , ' % (action, artifact_id, artifact_revision_id, resource_id, resource_revision_id))
        api = '%s/resource/association' % action
        params = {
            'resourceID':resource_id,
            'resourceRevisionID':resource_revision_id,
            'artifactID': artifact_id,
            'artifactRevisionID': artifact_revision_id
        }
        try:
            data = RemoteAPI.makeCall(api, params)
        except RemoteAPIStatusException, ex:
            raise ex
        if data['response'].has_key('message'):
            raise ResourceAssociationException(action, artifact_id, artifact_revision_id, resource_id, resource_revision_id, data['response'].get('message'))
        return data
    
    @staticmethod
    def attach_resource(artifact_id, artifact_revision_id, resource_id, resource_revision_id):
        action = 'create'
        data = ArtifactManager._modify_resource_association(action, artifact_id, artifact_revision_id, resource_id, resource_revision_id)
        return data
    
    @staticmethod
    def remove_resource(artifact_id, artifact_revision_id, resource_id, resource_revision_id):
        action = 'delete'
        data = ArtifactManager._modify_resource_association(action, artifact_id, artifact_revision_id, resource_id, resource_revision_id)
        return data

    @staticmethod
    def get_my_artifacts(artifact_types=ARTIFACT_TYPE,
                                   page_num=None, page_size=None,
                                   sort=None):
        try:
            if page_num:
                page_num = int(page_num)
            else:
                page_num = 1

            if not page_size:
                page_size = 10 

            results_key = 'artifacts'
            mylib_api_url = 'get/mylib/info/%s' % (artifact_types)
            params = {'pageNum':page_num, 'pageSize':page_size}
            if sort:
                params['sort'] = sort

            data = RemoteAPI.makeGetCall(mylib_api_url, params)
            artifacts_list = []
            if 'response' in data:
                data = data['response']
                if results_key in data:
                    artifacts = data[results_key]
                    artifacts_list = [ArtifactManager.toArtifact(artifact) for id,artifact in artifacts.items() ]
            return data, artifacts_list
        except Exception, e:
            log.exception(e)
            return None

    @staticmethod
    def _upload_metadata_csv(csvfile):
        '''
        update metadata associations using a CSV file
        @param csvfile: CSV file object 
        '''
        api_endpoint = 'load/browseTerms'
        log.debug(csvfile)
        params = {'noWait':'true','file':csvfile}
        try:
            data = RemoteAPI.makeCall(api_endpoint, params, multipart=True)
            return data
        except RemoteAPIStatusException, ex:
            log.exception(ex)
            return None
    
    @staticmethod
    def update_artifact_metadata(artifact):
        '''
        writes metadata changes csv file 
        @param artifact: Artifact object with metadata changes
        @return: csvfile or None
        '''
        if not artifact:
            raise ArtifactMetadataSaveException("Invalid Artifact")
        cm = artifact.get('changed_metadata')
        if not cm :
            raise ArtifactMetadataSaveException("Artifact does not have any metadata changes")
        artifact_id = '%s' % artifact.get_artifact_id()
        csvfile = None
        try:
            csvfile = tempfile.TemporaryFile()
            writer = UnicodeWriter(csvfile)
            #write header row
            writer.writerow(['artifactID','browseTerm','browseTermType','browseTermParent','encodedID','action'])
            for action in cm:
                _ma = cm.get(action)
                for meta_type in _ma:
                    _mat = _ma.get(meta_type)
                    for meta_value in _mat:
                        writer.writerow([artifact_id, meta_value, meta_type, '', '', action])
            csvfile.flush()
            data = ArtifactManager._upload_metadata_csv(csvfile)
            csvfile.close()
            return data
        except Exception, ex:
            log.exception(ex)
            if csvfile:
                try:
                    csvfile.close()
                except:
                    pass
            raise ex

    @staticmethod
    @cache_region('short_term', 'browseTerm')
    def get_browse_term_info(name):
        try:
            api_endpoint = 'get/info/browseTerm/%s' % name
            data = RemoteAPI.makeCall(api_endpoint, {})
            return data['response']
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_BROWSE_TERM == ex.status_code):
                return None #browse term does not exist
            else:
                log.error(ex)
                raise ex
