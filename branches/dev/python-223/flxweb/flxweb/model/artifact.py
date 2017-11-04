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

from BeautifulSoup import BeautifulSoup
from flxweb.lib.ck12.decorators import ck12_cache_region , trace
from flxweb.lib.ck12.errorcodes import ErrorCodes
from flxweb.lib.ck12.exceptions import ArtifactSaveException, \
    ResourceAssociationException, RemoteAPIStatusException, \
    ArtifactMetadataSaveException, RemoteAPIException, CreateCustomCoverException, \
    ArtifactAlreadyExistsException, RosettaValidationException, InvalidImageException, \
    ArtifactNotLatestException, DuplicateChapterTitleException,DuplicateEncodedIDException,InvalidDomainEIDEncodedIDException,\
    RemoteAPITimeoutException, EmptyArtifactTitleException, DetailedSaveException, SaveTimeoutException
from flxweb.lib.ck12.util import getUSStatesList
from flxweb.lib.remoteapi import RemoteAPI
from flxweb.lib.unicode_util import UnicodeWriter
from flxweb.model.artifactRevision import ArtifactRevision
from flxweb.model.ck12model import CK12Model
from pylons import config, url
from urllib import quote, unquote
import datetime
import json
import logging
import random
import re
import tempfile
import time
import HTMLParser
import base64

from flxweb.model.resource import Resource, ResourceManager
from flxweb.lib.helpers import safe_encode
from flxweb.lib import helpers as h

JSON_FIELD_RESPONSE = 'response'
JSON_FIELD_RESULT = 'result'

log = logging.getLogger(__name__)

saveerrorslog = logging.getLogger('saveerrors')

def logSaveError(ex):
    '''
    Logs save errors in saveerrors.log
    '''

    error_obj = ex.getErrorInfo()

    logstr = '\n*******************************************\n'
    logstr += 'ERROR_ID: %(errorID)s\n'
    logstr += 'ARTIFACT_ID: %(artifactID)s\n'
    logstr += 'ARTIFACT_REVISION_ID: %(artifactRevisionID)s\n'
    logstr += 'ARTIFACT_TYPE: %(artifactType)s\n'
    logstr += 'USER: %(userEmail)s\n'
    logstr += 'SAVE_PAYLOAD:\n'
    logstr += '%(payload)s\n'
    logstr += 'EXCEPTION TYPE: %(exceptionType)s\n'
    logstr += 'EXCEPTION MESSAGE: %(exceptionMessage)s\n'
    logstr += 'TRACEBACK: %(traceback)s\n'
    logstr += '\n*******************************************\n'
    log.error("Artifact Save Failed !! Error ID: %s" % error_obj['errorID'])
    if type(ex) == ArtifactAlreadyExistsException:
        #only log artifact already exists exceptions to flxweb log
        log.error (json.dumps(error_obj))
    else:
        saveerrorslog.error(logstr % error_obj)
    return error_obj

#@ck12_cache_region('forever')
#@trace
def _get_modality_info_by_type(mtype):
    from flxweb.model.modality import ModalityManager
    typeinfo = ModalityManager.get_modality_by_type(mtype)
    return typeinfo

#@ck12_cache_region('forever')
#@trace
def _get_modality_group_by_type(mtype):
    from flxweb.model.modality import ModalityManager
    group = ModalityManager.get_modality_group_by_type(mtype)
    return group

class Artifact(CK12Model):

    # GRADE TO AGE MAP. Used for LRMI
    GRADE_AGE_MAP = {
                        '1' : '6-7',
                        '2' : '7-8',
                        '3' : '8-9',
                        '4' : '9-10',
                        '5' : '10-11',
                        '6' : '11-12',
                        '7' : '12-13',
                        '8' : '13-14',
                        '9' : '14-15',
                        '10' : '15-16',
                        '11' : '16-17',
                        '12' : '17-18'
                    }

    ARTIFACT_TYPE_CONCEPT = 'concept'

    def __init__(self, dict_obj=None):
        CK12Model.__init__(self, dict_obj)
        if dict_obj and self.get('id') and self.get('handle'):
            self['perma'] = self.getPermaHandle()
            if 'encodedID' in self and self['encodedID']:
                self['conceptNode'] = '.'.join(self['encodedID'].split('.')[:-2])

            if not self['handle-encoded']:
                self['handle'] = quote(self['handle'].encode('utf-8'),'').replace('/', '%2F')
                self['handle-encoded'] = True

            #If children are not present on artifact, get them from revision
            if not self.has_key('children') and  self.has_key('revisions'):
                _artifact = self['revisions'][0]
                if _artifact.has_key('children'):
                    self['children'] = _artifact['children']

            if not 'artifactRevisionID' in self:
                artifactRevisionID = None
                if self.has_key('latestRevisionID'):
                    artifactRevisionID = self.get('latestRevisionID')
                else:
                    rev = self.getRevision()
                    if rev and rev.has_key('artifactRevisionID'):
                        artifactRevisionID = rev.get('artifactRevisionID')
                self['artifactRevisionID'] = artifactRevisionID

            if not 'latestRevision' in self:
                self['latestRevision'] = self.getLatestVersionNumber()

            if not 'isLatest' in self:
                self['isLatest'] = self.is_latest()

            # get following from revision and make them available
            # through the artifact object
            # 1) PDF/EPUB URLs
            # 2) Resource counts (resources like video,etc)
            if self.has_key('revisions'):
                revision = self.getRevision()
                if revision:
                    self['url_pdf'] = revision.get('pdf')
                    self['url_epub'] = revision.get('epub')
                    self['url_mobi'] = revision.get('mobi')
                    if 'resourceCounts' in revision:
                        self['resourceCounts'] = revision.get('resourceCounts')
            #labels
            self['labels'] = self.getLibraryLabels()
            # cover thumbnail images in small and large.
            if 'coverImage' in self or 'coverImageSatelliteUrl' in self:
                self['coverImageThumbLarge'] = self.thumbnail_large()
                self['coverImageThumbSmall'] = self.thumbnail_small()
            else:
                self['coverImage'] = None
                self['coverImageThumbLarge'] = None
                self['coverImageThumbSmall'] = None

            #contributed_by label
            self['contributed_by'] = self.get_contributor_label()

        else:
            if not self['perma']:
                self['perma'] = ''
            if not self['revisions']:
                self['revisions'] = []
            if not self['children']:
                self['children'] = []

    def thumbnail_small(self):
        '''
        Returns the 95x95 pixels version of the first image as the cover image
        for the artifact
        '''
        try:
            if 'coverImageSatelliteUrl' in self and self['coverImageSatelliteUrl']:
                image_url = self['coverImageSatelliteUrl']
                image_url = image_url.replace('COVER_PAGE', 'COVER_PAGE_THUMB_SMALL_TINY')
                image_url = image_url.replace('IMAGE', 'IMAGE_THUMB_SMALL_TINY')
                return image_url
            elif 'coverImage' in self and self['coverImage']:
                image_url = self['coverImage']
                imgsize_re = re.compile( 'show/(default/)?' )
                image_url = imgsize_re.sub('show/THUMB_SMALL/',image_url)
                return image_url

            if self['artifactType']:
                if self.is_flexbook():
                    default_cover_name = 'default_book_cover_small'
                else:
                    default_cover_name = 'default_%s_cover_small' % self['artifactType']
                cover = config.get(default_cover_name)
                if not cover:
                    cover =  config['default_cover_thumbnail_small']
                return cover
            return config['default_cover_thumbnail_small']
        except Exception,e:
            log.debug('could not get book cover for %s' % self['artifactID'])
            log.exception(e)
            return config['default_cover_thumbnail_small']

    def thumbnail_large(self):
        '''
        Returns the 192x192 pixels version of the first image as the cover image
        for the artifact
        '''
        try:
            if 'coverImageSatelliteUrl' in self and self['coverImageSatelliteUrl']:
                image_url = self['coverImageSatelliteUrl']
                image_url = image_url.replace('COVER_PAGE', 'COVER_PAGE_THUMB_LARGE_TINY')
                image_url = image_url.replace('IMAGE', 'IMAGE_THUMB_LARGE_TINY')
                return image_url
            elif 'coverImage' in self and self['coverImage']:
                image_url = self['coverImage']
                imgsize_re = re.compile( 'show/(default/)?' )
                image_url = imgsize_re.sub('show/THUMB_LARGE/',image_url)
                return image_url

            if self['artifactType']:
                if self.is_flexbook():
                    default_cover_name = 'default_book_cover_large'
                else:
                    default_cover_name = 'default_%s_cover_large' % self['artifactType']
                cover = config.get(default_cover_name)
                if not cover:
                    cover = config['default_cover_thumbnail_large']
                return cover
            return config['default_cover_thumbnail_large']
        except Exception,e:
            log.debug('could not get book cover for %s' % self['artifactID'])
            log.exception(e)
            return config['default_cover_thumbnail_large']

    def coverImage(self):
        '''
        Returns the cover image
        for the artifact
        '''
        try:
            if 'coverImage' in self and self['coverImage']:
                image_url = self['coverImage']
                imgsize_re = re.compile( 'show/(default/)?' )
                image_url = imgsize_re.sub('show/THUMB_LARGE/',image_url)
                return image_url
            elif 'coverImageSatelliteUrl' in self and self['coverImageSatelliteUrl']:
                image_url = self['coverImageSatelliteUrl']
                image_url = image_url.replace('COVER_PAGE', 'COVER_PAGE_THUMB_LARGE_TINY')
                image_url = image_url.replace('IMAGE', 'IMAGE_THUMB_LARGE_TINY')
                return image_url

            if self['artifactType']:
                if self.is_flexbook():
                    default_cover_name = 'default_book_cover_large'
                else:
                    default_cover_name = 'default_%s_cover_large' % self['artifactType']
                cover = config.get(default_cover_name)
                if not cover:
                    cover = config['default_cover_thumbnail_large']
                return cover
            return config['default_cover_thumbnail_large']
        except Exception,e:
            log.debug('could not get book cover for %s' % self['artifactID'])
            log.exception(e)
            return config['default_cover_thumbnail_large']

    def __str__(self):
        return '<%s.%s object at %s>' % (self.__class__.__module__, self.__class__.__name__, hex(id(self)))

    def is_teacher_book(self):
        '''
        Use this method to check if the artifact is a TE book
        '''
        return self['artifactType'] == ArtifactManager.ARTIFACT_TYPE_TEACHER_BOOK


    def is_flexbook(self):
        '''
        Use this method to check if the artifact is a book
        '''
        return self['artifactType'] in ArtifactManager.BOOK_TYPES

    def is_concept(self):
        '''
        Use this method to check if the artifact is concept
        '''
        return self['artifactType'] == ArtifactManager.ARTIFACT_TYPE_CONCEPT

    def is_section(self):
        '''
        Use this method to check if the artifact is section
        '''
        return self['artifactType'] == ArtifactManager.ARTIFACT_TYPE_SECTION

    def is_chapter(self):
        '''
        Use this method to check if the artifact is chapter
        '''
        return self['artifactType'] == ArtifactManager.ARTIFACT_TYPE_CHAPTER

    def is_lesson(self):
        '''
        Use this method to check if the artifact is lesson
        '''
        return self['artifactType'] == ArtifactManager.ARTIFACT_TYPE_LESSON

    def is_new(self):
        '''
        Returns true if the artifact is a new i.e a non persisted
        artifact
        '''
        return not self.get('id') or self.get('id') == 'new' or str(self.get('id')).startswith('new')

    def is_owner(self,user):
        '''
        Returns true if the passed user is the owner of the artifact
        '''
        if 'creatorID' in self and user and 'id' in user:
            return self['creatorID'] == user['id']
        else:
            return False

    def getPermaHandle(self, include_version=False, concept_collection_handle=None, collection_creator_id=None):
        '''
        Returns the perma url handle for the artifact in the format <realm>/<type>/<ext>
        '''
        artifact_handle = self['handle']
        artifact_type = self['artifactType']
        if artifact_type == 'lesson':
            artifact_type = 'concept'
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
        # replace all occurrences of encoded slashes (forward and backward)
        # see bug 8982 for details

        if concept_collection_handle  and collection_creator_id :
            perma = '%s?conceptCollectionHandle=%s&&collectionCreatorID=%s' %(perma, concept_collection_handle, collection_creator_id)

        if self.get('collections') :
            perma = 'c/%s' %(perma)

        perma = perma.replace('%2F','%252F')
        perma = perma.replace('%5C','%255C')
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

    def getDomainEID(self):
        eid = False
        domain = self.get('domain', {})
        if domain:
            eid = domain.get('encodedID')
        if not eid:
            eid = self.get('encodedID')
        if eid:
            eid = h.getDomainEIDFromEID(eid)
        return eid

    '''
    returns artifact XHTML.
    this method only returns the contents of <body> tag, handles image thumbnail replacement
    and adds wmode to flash objects
    '''
    def getXHTML(self, truncate_body=True):
        xhtml = ''
        if self.has_key('xhtml'):
            xhtml = self['xhtml']

            if truncate_body:
                start_index = xhtml.find('<body>')
                end_index = xhtml.find('</body>')
                if start_index > 0 and end_index > 0:
                    xhtml = xhtml[start_index + 6:end_index]

        return xhtml

    def getRelated(self, type='lesson', count=0,use_api=True):
        '''
        Returns the list of related artifacts of specified type
        Note: if the relatedArtifacts key/field is already present in
        the artifact object, then it is used to return the related a
        list of artifact objects. Else a new request will be made to
        the related API to fetch the related artifacts
        '''
        if 'relatedArtifacts' in self and\
            'artifactList' in self['relatedArtifacts']:
            related = []
            for item in self['relatedArtifacts']['artifactList']:
                related.append( ArtifactManager.toArtifact(item) )
            return related
        elif use_api:
            return ArtifactManager.getRelatedArtifacts(self['id'], type, count)
        return []

    def getExtended(self, use_api=True):
        '''
        Returns the list of extended artifacts of specified type
        Note: if the extendedArtifacts key/field is already present in
        the artifact object, then it is used to return the related a
        list of artifact objects. Else a new request will be made to
        the related API to fetch the related artifacts
        '''
        extended_artifacts = []
        if 'extendedArtifacts' in self:
            artifacts_by_type = self['extendedArtifacts']
            for _type in artifacts_by_type:
                for artifact_obj in artifacts_by_type[_type]:
                    artifact = ArtifactManager.toArtifact(artifact_obj)
                    extended_artifacts.append(artifact)
        elif use_api:
            extended_artifacts = ArtifactManager.get_extended_artifacts(self['id'], self.get('artifactType'))

        return extended_artifacts


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
        if current_revision > 0 and self.getRevisions():
            for revision in self.getRevisions():
                if revision['revision'] == current_revision:
                    return revision
        else :
            return None


    def get_revision_id(self):
        '''
        Returns the current revision ID
        '''
        artifactRevisionID = self.get('artifactRevisionID') #this gets correct revision ID when dealing with ArtifactRevision
        if not artifactRevisionID:
            revision = self.getRevision()
            if revision:
                artifactRevisionID = revision.get('artifactRevisionID') #this gets revision from Artifact's Revision
        return artifactRevisionID

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

    def getLatestVersionNumber(self):
        '''
        returns latest version number of the artifact
        '''
        if 'latestRevision' in self:
            return self.get('latestRevision')
        else:
            revision = self.getRevision()
            if revision and  'latestRevision' in revision:
                return revision.get('latestRevision')

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

    def get_branch_handle(self):
        '''
        Returns Branch Handle URL for this artifact
        '''
        branch_eid = self.get_branch_encodedid()
        branch = None
        if branch_eid:
            from flxweb.model.browseTerm import BrowseManager
            branch = BrowseManager.getBrowseTermByEncodedId(branch_eid).slug()
        return branch

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
                    extendedArtifacts[eatype] = [ ArtifactManager.toArtifact(a) for a in _artifacts ]
        return extendedArtifacts

    def get_authors(self):
        '''
        Returns list of authors
        '''
        return self.get('authors')


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
        if 'resourceCounts' in self and resource_name in self['resourceCounts']:
            return self['resourceCounts'][resource_name]
        else:
            return 0

    def has_video(self):
        '''
        Returns true if the artifact has videos.
        Note: we check for both resource counts of 'video'
        and 'cover video'. The 'allVideos' is simply the
        sum of video and cover video resource counts.
        '''
        return  self.get_resource_count('video') > 0 or\
                self.get_resource_count('cover video') > 0 or\
                self.get_resource_count('allVideos') > 0

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

    def has_attachments(self):
        '''
        Returns true if the artifact has interactive resources
        '''
        return self.get_resource_count('allAttachments') > 0

    def _get_ck12_data_segments(self, segment_type=None):
        '''
        extract x-ck12-data segments from artifact xhtml
        @param segment_type
            type of data segment (knowledge-tree, objectives, problem-set etc...)
        '''
        segment_class = "x-ck12-data"
        if segment_type:
            segment_class = "x-ck12-data-%s" % segment_type
        xhtml = self.get('xhtml')
        if xhtml:
            parser = BeautifulSoup(xhtml)
            del xhtml
            matches = parser.findAll('div', {'class': segment_class } )
            if matches:
                data_segments = [ unicode(ds.renderContents(),'utf-8') for ds in matches]
                del parser
                return data_segments

    def _get_ck12_data_segments_summary(self, segment_type=None):
        '''
        extract x-ck12-data segments from artifact xhtml
        @param segment_type
            type of data segment (knowledge-tree, objectives, problem-set etc...)
        '''
        segment_class = "x-ck12-data"
        match = []
        if segment_type:
            segment_class = "x-ck12-data-%s" % segment_type
        xhtml = self.get('xhtml')
        if xhtml:
            parser = BeautifulSoup(xhtml)
            del xhtml
            matches = parser.findAll('div', {'class': segment_class } )[0]
            matches = matches.findNextSibling('div', {'class': segment_class } )
            if matches:
                match.append(matches)
                data_segments = [ unicode(ds.renderContents(),'utf-8') for ds in match]
                del parser
                return data_segments

    def getAddedToLibrary(self):
        '''
        Returns the date on which this artifact
        was added to the library of current user
        Returns none otherwise
        '''
        revision = self.getRevision()
        if revision and 'addedToLibrary' in revision:
            return revision['addedToLibrary']
        else:
            return None

    def getLibraryLabels(self):
        '''
        Returns the list library labels associated with this
        artifact.
        '''
        revision = self.getRevision()
        if revision and 'labels' in revision and\
            revision['labels']:
            return [label['label'] for label in revision['labels']]
        else:
            return []

    def get_grades(self):
        '''
        Returns list of grades associated with this artifact.
        '''
        grades = []
        if self.has_key('gradeGrid'):
            for grade_term in self['gradeGrid']:
                if len(grade_term) > 1:
                    grades.append({'name':grade_term[1], 'id': grade_term[0]})
                else:
                    grades.append({'name': grade_term[0]})
        return grades

    def get_tags(self, isRaw=None):
        '''
        Returns list of tags associated with this artifact.
        '''
        tags = []
        if self.has_key('tagGrid'):
            for tag_term in self['tagGrid']:
                if len(tag_term) > 1:
                    tags.append({'name':tag_term[1], 'id': tag_term[0]})
                else:
                    tags.append({'name':tag_term[0]})
        _t = {}
        for v in tags:
            _t[v['name']] = v
        tags = _t.values()
        if not isRaw:
        	tags = sorted(tags, key=lambda x: x['name'].lower())
        return tags

    def get_search_keywords(self):
        '''
        Returns list of search keywords associated with this artifact.
        '''
        keywords = []
        if self.has_key('searchGrid'):
            for tag_term in self['searchGrid']:
                if len(tag_term) > 1:
                    if tag_term[1] not in keywords:
                        keywords.append(tag_term[1])
                    else:
                        keywords.append(tag_term[0])
        return keywords

    def get_seo_keywords(self):
        '''
        Returns list of search tags associated with this artifact.
        To be used for meta tags only.
        This one returns search grid and/or tags grid
        '''
        keywords = []
        if self.has_key('searchGrid'):
            for tag_term in self['searchGrid']:
                if len(tag_term) > 1:
                    if tag_term[1] not in keywords:
                        keywords.append(tag_term[1])
                    else:
                        keywords.append(tag_term[0])
        if self.has_key('tagGrid'):
            for tag_term in self['tagGrid']:
                if len(tag_term) > 1:
                    if tag_term[1] not in keywords:
                        keywords.append(tag_term[1])
                else:
                    keywords.append(tag_term[0])

        return keywords

    def get_seo_keywords_grid(self):
        '''
        Returns list of search tags associated with this artifact.
        '''
        keywords = []
        if self.has_key('searchGrid'):
            for tag_term in self['searchGrid']:
                if len(tag_term) > 1:
                    keywords.append({'id':tag_term[0],'name':tag_term[1]})
                else:
                    keywords.append({'name':tag_term[0]})
        return keywords

    def get_states(self):
        '''
        Returns list of states associated with this artifact.
        '''
        us_states = getUSStatesList()
        states = []
        if self.has_key('stateGrid'):
            for state_term in self['stateGrid']:
                statecode = state_term[1]
                state_id = state_term[0]
                statename = us_states.get(statecode, statecode)
                states.append({'name': statename, 'id': state_id, 'code': statecode})
        return states

    def get_subjects(self):
        '''
        Returns list of subjects associated with this artifact
        '''
        subjects = []
        if self.has_key('subjectGrid'):
            for subject_term in self['subjectGrid']:
                if len(subject_term) > 1:
                    subjects.append({'name':subject_term[1], 'id':subject_term[0]})
                else:
                    subjects.append({'name': subject_term[0]})
        return subjects

    def get_level(self):
        '''
        Returns difficulty level associated with this artifact
        '''
        level = 'At Grade'
        if self.has_key('level') and self.get('level'):
            level = self.get('level','')
        return level

    def get_domains(self):
        """
        Returns concept Node / taxonomy term / domain associated with artifact
        """
        domain = []
        if ('collections' in self):
            for collection_term in self['collections']:
                if (collection_term['collectionCreatorID'] == 3):
                    title = '%s (%s - %s)' % (collection_term['encodedID'],collection_term['conceptCollectionTitle'], collection_term['collectionTitle'])
                    domain.append({
                    'name':collection_term['conceptCollectionTitle'],
                    'conceptCollectionHandle': collection_term['collectionHandle'] + "-::-"+ collection_term['conceptCollectionAbsoluteHandle'],
                    'collectionCreatorID': collection_term['collectionCreatorID'],
                    'encodedid':collection_term['encodedID'],
                    'title':title
                    })
        elif self.has_key('foundationGrid'):
            for domain_term in self['foundationGrid']:
                title = '%s (%s)' % (domain_term[2],domain_term[1])
                domain.append({'name':domain_term[1],'encodedid':domain_term[2],'title':title})
                #break
        return domain

    def get_published_date(self):
        '''
        Return the publish date for this artifact.
        '''
        published = self.get('published') #if working with artifact revision
        if not published:
            revision = self.getRevision()
            if revision:
                published = revision.get('published')
        return published

    def is_published(self):
        '''
        Returns whether this artifact is published or not.
        '''
        if self.get_published_date():
            return True
        return False

    def get_book_published_date(self):
            '''
            Return the publish date for the book.
            '''
            ancestors = self.get_ancestors()
            book = ancestors.get('0.0')
            published = book.get('published') #if working with artifact revision
            if not published:
                revision = book.getRevision()
                if revision:
                    published = revision.get('published')
            return published

    def is_book_published(self):
            '''
            Returns whether this book is published or not.
            '''
            if self.get_book_published_date():
                return True
            return False

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        Specific artifact types should overload this method
        '''
        return self['artifactType'].title()

    def get_age_ranges(self):
        '''
        Returns a list of age ranges for the artifact
        This data is derieved based on the grade data
        '''
        try:
            age_ranges = []
            if 'gradeGrid' in self:
                for g in self['gradeGrid']:
                    if len(g) > 1:
                        if g[1] in Artifact.GRADE_AGE_MAP:
                            age_ranges.append(Artifact.GRADE_AGE_MAP[g[1]])
        except Exception,e:
            log.exception(e)
        return age_ranges

    def get_standard_boards(self):
        '''
        Returns a list of standard boards for the artifact
        This data is retrieved through separate REST call
        Look into BrowseManager for more details
        '''
        standardBoards = []
        try:
            if self.has_key('standardBoards'):
                for stdBoard in self['standardBoards']:
                    standardBoardId = stdBoard['id']
                    standardBoardName = stdBoard['name']
                    standardBoards.append({ 'name': standardBoardName, 'id': standardBoardId })
        except Exception, e:
            log.exception(e)
        return standardBoards

    def is_latest(self):
        '''
        Returns true if the concept is at its latest revision.
        '''
        try:
            current_version = int( self.getVersionNumber() )
            latest_version = int (self.getLatestVersionNumber())
            return current_version == latest_version
        except:
            rev = self.getRevision()
            if rev and rev.has_key('isLatest'):
                return rev['isLatest']

    def get_ancestors(self):
        '''
        Returns artifact ancestors.
        This ancestor is only available in
        '''
        ancestors = {}
        revision = self.getRevision()
        if revision:
            ancestors = revision.get('ancestors',{})
            for ancestor in ancestors:
                ancestors[ancestor] = ArtifactManager.toArtifact(ancestors[ancestor] )
        return ancestors

    def get_contributor_label(self):
        contrib_label = ''
        contrib = self.get('contributor')
        if not contrib and self.get('realm'):
            contrib = 'community'
        if contrib:
            if contrib == 'teacher':
                contrib_label = 'Teacher Contributed'
            elif contrib == 'student':
                contrib_label = 'Student Contributed'
            elif contrib == 'community':
                contrib_label = 'Community Contributed'
        return contrib_label

    def get_branch_encodedid(self):
        '''
        Returns the branch aka Subject encodedID.
        EncodedID of the artifact is used to this purpose.
        So if there is no EncodedID for artifact, it returns None
        '''
        eid_branch = None
        eid = self['encodedID']
        if 'encodedID' in self and self['encodedID']:
            eid = self['encodedID']
        elif 'domain' in self and self['domain']\
            and 'encodedID' in self['domain']\
            and self['domain']['encodedID']:
            eid = self['domain']['encodedID']

        if eid:
            # split the encodedID of the form <subject>:<branch>:<number>
            # into <subject>:<branch>
            eid_branch = '.'.join( eid.split('.')[:2] )
        return eid_branch

class ModalityArtifact(Artifact):
    '''
    ModalityArtifact
    provides a modality wrapper around artifact
    '''
    def __init__(self, dict_obj=None):
        Artifact.__init__(self, dict_obj=dict_obj)
        self['modality'] = _get_modality_info_by_type(self.get('artifactType'))
        self['modality_group'] = _get_modality_group_by_type(self.get('artifactType'))
        self['modality_display_label'] = self['modality'].get('display_label')
        if self['artifactType'] in ['lesson','concept']:
            self['thumbnail_img'] = self.get_thumb_postcard()
        else:
            self['thumbnail_img'] = self.get_thumb_large()

    ##@trace
    def is_resource(self):
        '''
        returns True if ModalityArtifact is a resource
        '''
        #FIXME: this does not handle xhtml based RWA
        return not self['artifactType'] in ['lesson','concept']

    ##@trace
    def get_modality_resource(self, typeName=None):
        '''
        returns the modality resource.
        '''
        resource = None
        rev = self.getRevision()
        if rev and rev.has_key('attachments') and rev.get('attachments'):
            for attachment in rev.get('attachments'):
                if typeName and attachment['type'] != typeName:
                    continue
                elif attachment['type'] in ['answer key','answer demo','quiz answer key','quiz answer demo','inlineworksheet']:
                    continue
                resource = attachment
                resource = Resource(resource)
                return resource
        return resource

    ##@trace
    def get_resource_thumb(self):
        thumb = None
        resource = self.get_modality_resource()
        if resource and 'thumbnail' in resource:
            thumb = resource['thumbnail']
        return thumb

    ##@trace
    def get_thumb_small(self):
        thumb = None
        if 'coverImageSatelliteUrl' in self and self['coverImageSatelliteUrl']:
            image_url = self['coverImageSatelliteUrl']
            thumb = image_url.replace('COVER_PAGE', 'COVER_PAGE_THUMB_SMALL_TINY')
            thumb = image_url.replace('IMAGE', 'IMAGE_THUMB_SMALL_TINY')
        elif 'coverImage' in self and self['coverImage']:
            image_url = self['coverImage']
            imgsize_re = re.compile( 'show/(default/)?' )
            thumb = imgsize_re.sub('show/THUMB_SMALL/',image_url)

        if not thumb:
            thumb = self.get_resource_thumb()
        return thumb

    ##@trace
    def get_thumb_large(self):
        thumb = None
        if 'coverImageSatelliteUrl' in self and self['coverImageSatelliteUrl']:
            image_url = self['coverImageSatelliteUrl']
            thumb = image_url.replace('COVER_PAGE', 'COVER_PAGE_THUMB_LARGE_TINY')
            thumb = image_url.replace('IMAGE', 'IMAGE_THUMB_LARGE_TINY')
        elif 'coverImage' in self and self['coverImage']:
            image_url = self['coverImage']
            imgsize_re = re.compile( 'show/(default/)?' )
            thumb = imgsize_re.sub('show/THUMB_LARGE/',image_url)

        if not thumb:
            thumb = self.get_resource_thumb()
        return thumb

    ##@trace
    def get_thumb_postcard(self):
        thumb = None
        if 'coverImageSatelliteUrl' in self and self['coverImageSatelliteUrl']:
            image_url = self['coverImageSatelliteUrl']
            thumb = image_url.replace('COVER_PAGE', 'COVER_PAGE_THUMB_POSTCARD_TINY')
            thumb = image_url.replace('IMAGE', 'IMAGE_THUMB_POSTCARD_TINY')
        elif 'coverImage' in self and self['coverImage']:
            image_url = self['coverImage']
            imgsize_re = re.compile( 'show/(default/)?' )
            thumb = imgsize_re.sub('show/THUMB_POSTCARD/',image_url)
        if not thumb:
            thumb = self.get_resource_thumb()
        return thumb

    ##@trace
    def get_render_type(self):
        '''
        Returns render type for current modality
        '''
        rendertype = 'generic'
        # type-specific renderings first
        if self.get('artifactType') == 'exerciseint': #exerciseint objects are ck-12 produced ILOs, they need to be rendered differently to enable ADS tracking for ILO events
            rendertype = 'ilo'
        elif self.get('artifactType') == 'exercise': #template for HWP exercises
            rendertype = 'exercise'
        elif self.get('artifactType') == 'asmtpractice': #template for Assessment Engine practices
            rendertype = 'asmtpractice'
        elif self.get('artifactType') == 'asmtpracticeint': #template for Assessment Engine practices
            rendertype = 'asmtpracticeint'
        elif self.get('artifactType') == 'asmtquiz': #template for Assessment Engine quiz
            rendertype = 'asmtquiz'
        elif ('resourceCounts' in self and 'contents' in self.get('resourceCounts')) and self.get('hasXhtml'): # if artifact has xhtml, it is user created modality and use read template with edit and download actions.
            rendertype = 'read'
        elif self.get('artifactType') == 'quiz': #template for quiz modality detail page
            rendertype = 'quiz'
        elif self.get('artifactType') == 'rwa': #template for xhtml based real world applications. similar to read but with less actions.
            if self.get_modality_resource():
                resource = self.get_modality_resource()
                if resource and resource.is_eo():
                    rendertype = 'embed'
                elif resource and resource.get('isExternal'):
                    rendertype = 'link'
                else:
                    rendertype = 'download'
            else:
                #rendertype = 'rwa'
                rendertype = 'with_answerkey'
        elif self.get('artifactType') == 'simulationint': #template for simulation int
            rendertype = 'simulationint'
        elif self.get('artifactType') == 'plix': ## template for plix
            rendertype = 'plix'
        elif self.is_resource() and self.get_modality_resource() and (self.get('artifactType') != 'lecture' or self.get('hasDraft') == False):
            resource = self.get_modality_resource()
            if resource and resource.is_eo():
                rendertype = 'embed'
            elif resource and resource.get('isExternal'):
                rendertype = 'link'
            else:
                rendertype = 'download'
        else:
            rendertype = 'read'
        return rendertype

class ConceptArtifact(ModalityArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type Concept
    '''

    def __init__(self, dict_obj):
        ModalityArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_CONCEPT

class LessonArtifact (ModalityArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type Lesson
    '''

    def __init__(self, dict_obj):
        ModalityArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_LESSON
        self['vocabulary_info'] = self.get('vocabulary') #there's a conflict on the key 'vocabulary' (see bug #12039) move it to vocabulary_info
        if not dict_obj.get('artifactID') and not dict_obj.get('xhtml'): #body for empty lesson
            self['xhtml'] = self.get_template_xhtml()
        if self['xhtml']:
            self['objectives'] = self.get_objectives()
            self['vocabulary'] = self.get_vocabulary()

    def get_template_xhtml(self):
        return '<body>\
                <div class="x-ck12-data-objectives"><!-- %LOS% --></div>\
                <div class="x-ck12-data-concept"><!--    <concept /> --></div>\
                <div class="x-ck12-data-vocabulary"><!-- %LVS% --></div>\
                </body>'

    def get_objectives(self):
        '''
        Returns contents of 'x-ck12-data-objectives' div of from xhtml.
        '''
        objectives_xhtml = None
        data_segments = self._get_ck12_data_segments('objectives')
        if data_segments:
            objectives_xhtml = data_segments[0].strip().rstrip()
            objectives_xhtml = objectives_xhtml.replace('<!-- %LOS% -->','')
        return objectives_xhtml

    def set_xhtml(self, concept_xhtml=None, objectives_xhtml=None, vocabulary_xhtml=None ) :
        xhtml = self.get_template_xhtml()

        if concept_xhtml == None:
            concept_xhtml = self.get_concept_xhtml() or ''
        if objectives_xhtml == None:
            objectives_xhtml = self.get_objectives() or ''
        if vocabulary_xhtml == None:
            vocabulary_xhtml = self.get_vocabulary() or ''

        xhtml = xhtml.replace('<!--    <concept /> -->',concept_xhtml)
        xhtml = xhtml.replace('<!-- %LOS% -->',objectives_xhtml)
        xhtml = xhtml.replace('<!-- %LVS% -->',vocabulary_xhtml)
        self['xhtml'] = xhtml

    def get_vocabulary(self):
        '''
        Returns contents of 'x-ck12-data-vocabulary' div of from xhtml.
        '''
        vocabulary_xhtml = None
        data_segments = self._get_ck12_data_segments('vocabulary')
        if data_segments:
            vocabulary_xhtml = data_segments[0].strip().rstrip()
            vocabulary_xhtml = vocabulary_xhtml.replace('<!-- %LVS% -->','')
        return vocabulary_xhtml

    def get_concept_xhtml(self):
        _xhtml = self.get('xhtml','')

        if _xhtml:
            xhtml_re = re.compile("<!-- Begin inserted XHTML \[CONCEPT: \d*\] -->(.*?)<!-- End inserted XHTML \[CONCEPT: \d*\] -->",
                                  re.MULTILINE and re.DOTALL)
            search = xhtml_re.search(_xhtml)
            if search:
                _xhtml = search.group(1)
                _xhtml = _xhtml.replace('<h2 id="x-ck12-Q29uY2VwdA.."> Concept </h2>','')
            else:
                xhtml_re = re.compile('<div class="x-ck12-data-concept">(.*?)</div>', re.DOTALL and re.MULTILINE)
                search = xhtml_re.search(_xhtml)
                if search:
                    _xhtml = search.group(1)
            #replace  placeholders
            _xhtml = _xhtml.replace('<!--    <concept /> -->','')
            _xhtml = _xhtml.replace('<!-- %LOS% -->','')
            _xhtml = _xhtml.replace('<!-- %LVS% -->','')
        return _xhtml

    def getXHTML(self):
        return self.get_concept_xhtml()

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Concept'

class ChapterArtifact (Artifact):

    '''
    Extends Artifact to provide methods specific to artifact type Chapter
    '''
    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_CHAPTER
        if not dict_obj.get('artifactID') and not dict_obj.get('xhtml'): #body for empty chapter
            self['xhtml'] = self.get_template_xhtml()
        if self['chapterIntroduction'] is not None:
            self.set_introduction( self['chapterIntroduction'] )
        else:
            self['chapterIntroduction'] = self.getChapterIntroduction()

        if self['chapterSummary'] is not None:
            self.set_summary( self['chapterSummary'] )
        else:
            self['chapterSummary'] = self.getChapterSummary()

    def get_template_xhtml(self):
        return '<body>\
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
        data_segments = self._get_ck12_data_segments_summary()
        if data_segments:
            summary = data_segments[0].strip().rstrip()
        return summary

    def set_introduction(self, introduction):
        xhtml = self.get_template_xhtml()
        summary = self.getChapterSummary()
        xhtml = xhtml.replace('<!-- %CHAP_CONT% -->', introduction)
        xhtml = xhtml.replace('<!-- %CHAP_TAIL_SUBSECTIONS% -->', summary)
        self['xhtml'] = xhtml

    def set_summary(self, summary):
        xhtml = self.get_template_xhtml()
        introduction = self.getChapterIntroduction()
        xhtml = xhtml.replace('<!-- %CHAP_CONT% -->', introduction)
        xhtml = xhtml.replace('<!-- %CHAP_TAIL_SUBSECTIONS% -->', summary)
        self['xhtml'] = xhtml


class FlexBookArtifact (Artifact):
    '''
    Extends Artifact to provide methods specific to artifact type Flexbook
    '''

    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_BOOK

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'FlexBook'

class TeacherBookArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type tebook
    '''

    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_TEACHER_BOOK

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Teacher Edition'

class WorkbookArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type workbook
    '''

    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_WORKBOOK

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Workbook'

class StudyGuideArtifact (ModalityArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type studyguide
    '''

    def __init__(self, dict_obj):
        ModalityArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_STUDY_GUIDE

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Study Guide'

class LabKitArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type labkit
    '''

    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_LAB_KIT

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Lab Kit'

class QuizbookArtifact (FlexBookArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type labkit
    '''

    def __init__(self, dict_obj):
        FlexBookArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_QUIZBOOK

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Quizzes and Tests'

class SectionArtifact (Artifact):
    '''
    Extends Artifact to provide methods specific to artifact type Section
    '''

    def __init__(self, dict_obj):
        Artifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_SECTION

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Concept'

class RWAArtifact (ModalityArtifact):
    '''
    Extends Artifact to provide methods specific to artifact type Section
    '''

    def __init__(self, dict_obj):
        ModalityArtifact.__init__(self, dict_obj)
        self['artifactType'] = ArtifactManager.ARTIFACT_TYPE_RWA

    def display_label(self):
        '''
        Returns the Label i.e. the display name for this artifact
        '''
        return 'Concept'

class ArtifactManager(object):
    '''
    Provides static methods for Artifact retrieval and manipulation.
    '''
    ARTIFACT_TYPE = 'artifact'
    ARTIFACT_TYPE_CONCEPT = 'concept'
    ARTIFACT_TYPE_BOOK = 'book'
    ARTIFACT_TYPE_TEACHER_BOOK = 'tebook'
    ARTIFACT_TYPE_WORKBOOK = 'workbook'
    ARTIFACT_TYPE_STUDY_GUIDE = 'studyguide'
    ARTIFACT_TYPE_LAB_KIT = 'labkit'
    ARTIFACT_TYPE_QUIZBOOK = 'quizbook'
    ARTIFACT_TYPE_CHAPTER = 'chapter'
    ARTIFACT_TYPE_LESSON = 'lesson'
    ARTIFACT_TYPE_SECTION = 'section'
    ARTIFACT_TYPE_RWA = 'rwa'

    ARTIFACT_CLASSES = {
        ARTIFACT_TYPE_CONCEPT:ConceptArtifact,
        ARTIFACT_TYPE_LESSON:LessonArtifact,
        ARTIFACT_TYPE_CHAPTER:ChapterArtifact,
        ARTIFACT_TYPE_BOOK:FlexBookArtifact,
        ARTIFACT_TYPE_TEACHER_BOOK:TeacherBookArtifact,
        ARTIFACT_TYPE_WORKBOOK:WorkbookArtifact,
        ARTIFACT_TYPE_STUDY_GUIDE: StudyGuideArtifact,
        ARTIFACT_TYPE_LAB_KIT: LabKitArtifact,
        ARTIFACT_TYPE_QUIZBOOK: QuizbookArtifact,
        ARTIFACT_TYPE_SECTION:SectionArtifact,
        ARTIFACT_TYPE_RWA:RWAArtifact,
    }

    BOOK_TYPES = [ ARTIFACT_TYPE_BOOK, ARTIFACT_TYPE_TEACHER_BOOK, ARTIFACT_TYPE_WORKBOOK, ARTIFACT_TYPE_LAB_KIT, ARTIFACT_TYPE_QUIZBOOK ]
    SEARCHABLE_BOOK_TYPES = [ ARTIFACT_TYPE_BOOK, ARTIFACT_TYPE_TEACHER_BOOK, ARTIFACT_TYPE_WORKBOOK, ARTIFACT_TYPE_LAB_KIT]

    @staticmethod
    def isEncodedID(id):
        parts = id.split('.')
        if len(parts) > 3:
            if len(parts[0]) == 3 and len(parts[1]) == 3 and len(parts[2]) == 3:
                return True
        return False

    @staticmethod
    def getArtifactByPerma(artifact_type, artifact_title, realm=None, ext=None, details=False, forUpdate=False):
        '''
        retrieve an artifact by its perma definition
        @param artifact_type: type of artifact (concept, chapter, lesson, book)
        @param artifact_title: hyphenated artifact title
        @param realm: artifact realm
        @param ext: extended parameters (revision number, language etc)
        '''
        # quote the title. see bug 8982 for details
        artifact_title = quote( safe_encode(artifact_title) )
        if ArtifactManager.isEncodedID(artifact_title):
            api_endpoint = 'get/detail/%s/%s' % (artifact_type, artifact_title)
        else:
            if details:
                api_endpoint = 'get/perma/%s/%s' % (artifact_type, artifact_title)
            else:
                api_endpoint = 'get/perma/info/%s/%s' % (artifact_type, artifact_title)
            if realm:
                api_endpoint = '%s/%s' % (api_endpoint, realm)

        params = {}
        if ext:
            extensions = ''
            for key in ext:
                extensions = '%s%s:%s,' % (extensions, key, ext[key])
            log.debug("extended parameters: %s " % extensions)
            params['extension'] = extensions.rstrip(',')
            if forUpdate == True:
                params.update({'forUpdate':'true'})

        data = None
        try:
            data = RemoteAPI.makeGetCall(api_endpoint, params)
        except RemoteAPITimeoutException, e: raise e
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code):
                return None #artifact does not exist
            if (ErrorCodes.INVALID_VERSION == ex.status_code):
                return None

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
    def getArtifactById(artifact_id, details=False, forUpdate=False):
        '''
        retrieve an artifact by ID
        '''
        if details :
            api_endpoint = 'get/detail/'
        else:
            api_endpoint = 'get/info/'
        api_endpoint = '%s%s' % (api_endpoint, artifact_id)
        artifact_type = 'concept'

        params = { }

        if forUpdate == True:
            params.update({'forUpdate':'true'})


        if forUpdate == True:
            params.update({'forUpdate':'true'})

        try:
            data = RemoteAPI.makeCall(api_endpoint, params)
        except RemoteAPITimeoutException, e: raise e
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
    def get_artifacts_by_revision_ids(id_list,return_as_dict=False,use_requested_rev_ids=False):
        '''
        retrieve artifact info for a list of artifact revision ids
        if 'return_as_dict' is passed as True,it will return
        a dictionary with artifact 'latestRevisionID' as the key
        '''
        if return_as_dict:
            artifacts = {}
        else:
            artifacts = []
        if id_list:
            ids = ','.join([ str(id) for id in id_list ])
            api = 'get/info/revisions/%s' % (ids)
            params = {'pageSize':len(id_list)}
            data = RemoteAPI.makeGetCall(api, params)
            if data and (JSON_FIELD_RESPONSE in data):
                if 'artifacts' in data[JSON_FIELD_RESPONSE]:
                    if return_as_dict:
                        for obj in data[JSON_FIELD_RESPONSE]['artifacts']:
                            artifact = ArtifactManager.toArtifact(obj)
                            if not use_requested_rev_ids:
                                artifacts [artifact['latestRevisionID']] = artifact
                            else:
                                artifactRevisionID = None
                                if artifact.has_key('artifactRevisionID'):
                                    artifactRevisionID = artifact.get('artifactRevisionID')
                                else:
                                    rev = artifact.getRevision()
                                    if rev and rev.has_key('artifactRevisionID'):
                                        artifactRevisionID = rev.get('artifactRevisionID')
                                if not artifactRevisionID:
                                    artifactRevisionID = artifact['latestRevisionID']
                                artifacts[artifactRevisionID] = artifact
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
        if return_as_dict:
            artifacts = {}
        else:
            artifacts = []

        if id_list:
            ids = ','.join([ str(id) for id in id_list ])
            api = 'get/info/artifacts/%s' % (ids)
            params = {'pageSize':len(id_list)}
            data = RemoteAPI.makeGetCall(api, params)
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
    def getPermaDescendantArtifact(artifact_type, artifact_title, version, section, realm, rtype=None, ext={}):
        api_endpoint = 'get/perma/descendant'
        if rtype:
            api_endpoint = '%s/%s' % (api_endpoint, rtype)
        api_endpoint = '%s/%s/%s' % (api_endpoint, artifact_type, quote( safe_encode(artifact_title) ) )
        if realm:
            api_endpoint = '%s/%s' % (api_endpoint, realm)
        params = {
            'section' : section
        }
        if not ext:
            ext = {}
        if version:
            ext.update({ 'version': version })

        ext.update({
                     'includeConceptContent':'true',
                     'includeRelatedArtifacts':'true'
                  })
        extensions = ''
        for key in ext:
            extensions = '%s%s:%s,' % (extensions, key, ext[key])
        log.debug("extended parameters: %s " % extensions)
        params['extension'] = extensions.rstrip(',')
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
    def getArtifactDraftByArtifactRevisionID(artifactRevisionID):
        api_endpoint = 'artifactdraft/artifactDraftArtifactRevisionID'
        api_endpoint = '%s=%s' % (api_endpoint, artifactRevisionID)
        try:
            data = RemoteAPI.makeGetCall(api_endpoint)
        except RemoteAPIStatusException, ex:
            if (ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code):
                return None #artifact does not exist
            else:
                raise ex
        if data and (JSON_FIELD_RESPONSE in data):
            for key in data[JSON_FIELD_RESPONSE]:
                artifact_type = key
            if (artifact_type in data[JSON_FIELD_RESPONSE]):
                artifact = ArtifactManager.toArtifact(data[JSON_FIELD_RESPONSE][artifact_type]['draft'])
                return artifact
        else:
            return None

    @staticmethod
    def _getAuthorsJSON(authors):
        '''
        ArtifactManager._getAuthorsJSON
        a utility to convert Authors Attribution dictionary sent from frontend
        into a JSON string required by the backend.
        '''
        authors_obj = {}
        for author in authors:
            if not authors_obj.get(author['role']):
                authors_obj[author['role']] = []
            htmlparser_obj = HTMLParser.HTMLParser()
            author_name = htmlparser_obj.unescape(author['name'])
            authors_obj[author['role']].append(author_name)
        return json.dumps(authors_obj)

    @staticmethod
    def saveArtifact(artifact):
        '''
        ArtifactManager.saveArtifact
        uses Create/Update endpoints to save an artifact.
        If artifact does not have an ID, a new artifact will be created.
        If artifact already has an id, same artifact will be updated.

        @param artifact:
            Artifact to be saved

        @return:
            status of artifact save operation
        '''
        savedata = {}
        is_upload = False
        attached_file = None
        user = None
        is_deep_copy = False
        attachments = None

        try:
            from flxweb.model.session import SessionManager
            user = SessionManager.getCurrentUser()
        except:
            log.debug("Could not fetch logged in user's info.")

        if not artifact.get('title') or not artifact.get('title').strip().rstrip():
            raise ArtifactSaveException('Cannot save Artifact with empty title.')
        savedata['title'] = artifact.get('title')

        new_handle = artifact.get('handle')
        if new_handle:
            savedata['handle'] = new_handle
        log.debug("user is owner: %s" % artifact.is_owner(user))
        log.debug("user is admin or author: %s" % user.isAdmin() or user.hasAnyRole('author'))

        if not artifact.is_new() and not artifact.is_owner(user) and not ( user.isAdmin() or user.hasAnyRole('author') ):
            #[Bug #43480] if user is not an admin and this is a derivation, don't send the handle
            savedata['handle'] = ''
        if artifact.get('originalHandle'):
            savedata['originalHandle'] = artifact.get('originalHandle')

        if artifact.get('encodeID'):
            savedata['encodedID'] = artifact.get('encodeID')

        savedata['messageToUsers'] = artifact.get('messageToUsers','')
        savedata['comment'] = artifact.get('revisionComment','')
        if artifact.get('deepCopy') == True:
            savedata['deepCopy'] = True
            is_deep_copy = True
            if artifact.get('deepCopy_phase') == 'analysis':
                savedata['deepCopy_phase'] = 'analysis'
            else:
                savedata['deepCopy_phase'] = 'copy'
            if artifact.get('publish') == True:
                savedata['publish'] = True
            else:
                savedata['publish'] = False
        savedata['summary'] = artifact.get('summary','')
        domains = artifact.get('domains');
        changed_metadata = artifact.get('changed_metadata')
        log.debug(changed_metadata)
        if changed_metadata:
            savedata['changed_metadata'] = changed_metadata
        cover_revision = artifact.get('coverRevision', None)
        if cover_revision:
            cover_revision['coverImage'] = artifact.get('coverImage')

        log.debug("RRIDs: %s" % artifact.get('resourceRevisionIDs'))
        if artifact.has_key('resourceRevisionIDs'):
            #send attached resource revision IDs with save call for atomic resource association
            savedata['resourceRevisionIDs'] = ','.join([str(x) for x in artifact.get('resourceRevisionIDs')])
        else:
            #(deprecated, fallback) if resourceRevisionIDs are not available and attachments are
            # associate them after successful save
            attachments = artifact.get('attachments', None)

        #attrubutions
        if artifact.is_new():
            authors = artifact.get('authors')
            if not authors:
                artifact['authors'] = []
                if user:
                    user_name = '%s %s' % ( user.get('firstName'), user.get('lastName') )
                    artifact['authors'].append({'name':user_name ,'role':'author'})
                else:
                    log.debug("User info not available. Default author was not added to new artifact.")
        savedata['authors'] = ArtifactManager._getAuthorsJSON(artifact.get('authors',[]))

        #Domain EID
        if 'domainEID' in artifact:
            savedata['domainEIDs'] = ','.join(artifact.get('domainEID',[]))
        else:
            savedata['domainEIDs'] = ''
        #look for new domain being set
        if artifact.get('domains'):
            _domain = artifact.get('domains','')
            domain_list = []
            for dom in _domain:
                if dom.get('action','').lower() == 'add':
                    domain_list.append(dom['encodedid'])
            if domain_list:
                savedata['domainEIDs'] = ','.join(domain_list)
        else:
            #if no domain is being added or removed, look for existing domain
            if not savedata['domainEIDs']:
                if artifact.get('domain'):
                    _domain = artifact.get('domains','')
                    domain_list = []
                    for dom in _domain:
                        if dom.get('action','').lower() == 'add':
                            domain_list.append(dom['encodedid'])
                    if domain_list:
                        savedata['domainEIDs'] = ','.join ([ str(x) for x in domain_list])

        #construct payload for assemble API for book save.
        if artifact.get('artifactType') in ArtifactManager.BOOK_TYPES:
            children_list = [ ]
            non_new_children_ids = []
            for child in artifact.getChildren():
                grandchildren = []
                child_obj = {}
                if child.is_new():
                    child_obj['artifactRevisionID'] = "new"
                else:
                    if child.get('id') in non_new_children_ids:
                        child_obj['id'] = "new"
                        child_obj['artifactRevisionID'] = "new"
                    else:
                        child_obj['artifactRevisionID'] = child.get_revision_id()

                child_obj['artifactType'] = child.get('artifactType')
                child_obj['title'] = child.get('title')
                if child_obj.has_key('handle'):
                    child_obj['handle'] = child.get('handle')
                child_obj['summary'] = child.get('summary')
                child_obj['comment'] = child.get('revisionComment','')
                child_obj['authors'] = ArtifactManager._getAuthorsJSON(child.get('authors',[]))
                if not child_obj['summary']:
                    child_obj['summary'] = ''

                if child.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER:
                    #include xhtml only if it's present and has changed
                    if child.getXHTML():
                        # Bug 37657 also include xhtml when only the chapter sections are modified.
                        if child.get('content_modified') or child.get('isDirty'):
                            child_obj['xhtml'] = child.getXHTML()
                if child.get('make_copy'):
                    child_obj['make_copy'] = True
                if child.get('updated'):
                    child_obj['updated'] = True

                #if chapter has changed, mark it updated.
                if  child.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER and not child.is_new():
                    if child.get('isDirty'):
                        child_obj['updated'] = True
                        if not child.is_owner(user):
                            #if modified chapter is not owned by the user, mark for copy
                            child_obj['make_copy'] = True

                for grandchild in child.getChildren() :
                    if  type(grandchild) == int :
                        grandchildren.append(grandchild)
                    else:
                        grandchildren.append(grandchild.get_revision_id())
                child_obj['children'] = grandchildren
                children_list.append(child_obj)
                if not child.is_new():
                    non_new_children_ids.append(child.get('id'))
            savedata['children'] = children_list
            savedata['artifactType'] = artifact.get('artifactType')
            if artifact.is_new():
                savedata['artifactRevisionID'] = 'new'
                savedata['artifactID'] = 'new'
            else:
                savedata['artifactRevisionID'] = artifact.get_revision_id()
                savedata['artifactID'] = artifact.get_artifact_id()
                #if user doesn't own the flexbook, make a copy
                if not artifact.is_owner(user):
                    savedata['make_copy'] = True
            if artifact.get('xhtml'):
                savedata['xhtml'] = artifact.get('xhtml')
            if cover_revision:
                savedata['coverImageID'] = cover_revision.get('resourceID',None)
                savedata['coverImageRevID'] = cover_revision.get('id',None)
        else:
            #save lesson+concept
            if artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_LESSON:
                savedata['autoSplitLesson'] = True
                if artifact.get('xhtml') or artifact.get('xhtml') == '':
                    concept_xhtml = artifact.getXHTML()
                    objectives_xhtml = artifact.get('lesson_objectives','')
                    vocabulary_xhtml = artifact.get('lesson_vocabulary','')
                    artifact.set_xhtml(concept_xhtml, objectives_xhtml=objectives_xhtml, vocabulary_xhtml=vocabulary_xhtml)
            if artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_SECTION:
                if user and not artifact.is_owner(user):
                    #savedata['autoSplitLesson'] = True
                    savedata['upgradeToLesson'] = True

            #set xhtml
            if artifact.get('xhtml'):
                log.debug(artifact.get('xhtml',''))
                savedata['xhtml'] = base64.b64encode(artifact.get('xhtml','').encode('utf-8'))
            if artifact.get('xhtml') == '':
                savedata['xhtml'] = ''

            if artifact.is_new():
                api_endpoint = 'create/%s' % (artifact['artifactType'])
                savedata['cover image name'] = ''
                savedata['cover image description'] = ''
                savedata['cover image path'] = ''
                savedata['cover image uri'] = ''
            else:
                api_endpoint = 'update/%s/%s/revision/%s' % (artifact['artifactType'], artifact['id'], artifact.getVersionNumber())
                savedata['id'] = '%s' % artifact.get('id')
                if not artifact.is_owner(user):
                    #if artifact is not new and not owned by the user, make a copy
                    savedata['forceCopy'] = True

            #set children
            savedata['children'] = ''
            if artifact.hasChildren() and artifact.getChildren():
                list_children = []
                for child in artifact.getChildren():
                    if child and not type(child).__name__ == 'int':
                        revision_id = '%s' % child.get_revision_id()
                        if not revision_id in list_children:
                            list_children.append(revision_id)
                savedata['children'] = ','.join(list_children)
            #set attachmentUri if artifact payload contains it
            if artifact.get('attachmentUri'):
                savedata['attachmentUri'] = artifact.get('attachmentUri')
                savedata['contentType'] = 'web'

            attachmentPath = artifact.get('attachmentPath')

            if attachmentPath:
                attachmentPath = attachmentPath.encode('utf-8')
                savedata['contentType'] = 'attachment'
                if ResourceManager.upload_dir_is_shared():
                    savedata['attachmentPathLocation'] = attachmentPath
                else:
                    attached_file = open( attachmentPath ,'r' )
                    savedata['attachmentPath'] = attached_file
                    is_upload = True

            # save attachmentEmbedCode if artifact has it
            if 'attachmentEmbedCode' in artifact:
                savedata['attachmentEmbedCode'] = artifact['attachmentEmbedCode']


            coverImageUri = artifact.get('cover image uri','')
            if coverImageUri:
                savedata['cover image uri'] = coverImageUri

            if artifact.get('internal-tags'):
                savedata['internal-tags'] = artifact.get('internal-tags')

        log.debug("Saving Artifact : %s" % savedata)

        save_exception = None
        save_data = None
        try:
            #raise ArtifactSaveException("meow")
            if artifact.get('artifactType') in ArtifactManager.BOOK_TYPES:
                artifact = ArtifactManager.assembleArtifact(savedata, not artifact.is_new() )
            else:
                #Bug 55671: title needs to be encoded and sent as titleEnc. Don't send both (http://bugs.ck12.org/show_bug.cgi?id=55671#c5)
                del savedata['title']
                savedata['titleEnc'] = base64.b64encode(artifact.get('title','').encode('utf-8'))
                log.debug("multipart: %s" % is_upload)
                save_data = RemoteAPI.makeCall(api_endpoint, savedata, multipart=is_upload)
                #close open files
                if attached_file:
                    try:
                        attached_file.close()
                    except:
                        log.debug('could not close attached file: %s' % attachmentPath)

                # check response
                if 'message' in save_data['response']:
                    log.debug("Artifact Save Failed !! Save Payload: %s" % savedata)
                    log.debug('Artifact was not saved. Reason %s' % save_data['response']['message'])
                    save_exception = ArtifactSaveException(save_data['response']['message'])

                aType = 'lesson' if (savedata.get('upgradeToLesson') and artifact['artifactType'] == 'section') else artifact['artifactType']
                if aType in save_data['response']:
                    artifact = ArtifactManager.toArtifact(save_data['response'][aType])
                    artifact_url = h.artifact_url(artifact, True)
                    artifact['artifact_url'] = artifact_url
                else:
                    log.error("response from update: %s" % str(save_data['response']))
                    save_exception = ArtifactSaveException('API response did not have artifactType field')
        except RemoteAPITimeoutException, e:
            save_exception = SaveTimeoutException()
        except RemoteAPIStatusException, ex:
            if ErrorCodes.ARTIFACT_ALREADY_EXIST == ex.status_code:
                save_exception = ArtifactAlreadyExistsException()
            elif ErrorCodes.EMPTY_ARTIFACT_TITLE == ex.status_code:
                save_exception = EmptyArtifactTitleException()
            elif ErrorCodes.INVALID_HTML_CONTENT == ex.status_code:
                save_exception = RosettaValidationException( ex.api_message )
            elif ErrorCodes.INVALID_ROSETTA_CONTENT == ex.status_code:
                save_exception = RosettaValidationException( ex.api_message )
            elif ErrorCodes.INVALID_IMAGE_ENDPOINT == ex.status_code:
                save_exception = InvalidImageException( ex.api_message )
            elif ErrorCodes.CANNOT_CREATE_ARTIFACT == ex.status_code or ErrorCodes.CANNOT_UPDATE_ARTIFACT == ex.status_code:
                if 'exists already' in ex.api_message:
                    save_exception = ArtifactAlreadyExistsException()
                elif 'Duplicate entry' in ex.api_message and 'encodedID' in ex.api_message:
                    save_exception = DuplicateEncodedIDException()
                elif 'Invalid domainEID' in ex.api_message or 'Invalid encodedID' in ex.api_message or 'EID:' in ex.api_message or 'encodedID' in ex.api_message:
                    save_exception = InvalidDomainEIDEncodedIDException()
                else:
                    save_exception =  ArtifactSaveException(ex.api_message)
            elif ErrorCodes.NO_SUCH_ARTIFACT == ex.status_code:
                if 'not the latest revision' in ex.api_message:
                    save_exception = ArtifactNotLatestException()
                else:
                    save_exception = ArtifactSaveException(ex.api_message)
            elif ErrorCodes.DUPLICATE_CHAPTER_TITLE == ex.status_code:
                save_exception = DuplicateChapterTitleException()
            else:
                save_exception = ex
        except ArtifactSaveException, ex:
            save_exception = ex
        except ArtifactAlreadyExistsException, ex:
            save_exception = ex
        except Exception, ex:
            log.debug("Generic Exception")
            log.exception(ex)
            save_exception = DetailedSaveException(ex.message);


        if save_exception:
            log.debug("Artifact Save Failed !! Save Payload: %s" % savedata)
            save_exception.setInfo(artifact, savedata, user)
            logSaveError(save_exception)
            raise save_exception


        #on successful save, create cover association
        if not is_deep_copy:
            if cover_revision and not is_deep_copy:
                try:
                    ArtifactManager._modify_resource_association('create',
                        artifact.get_artifact_id(), artifact.get_revision_id(),
                        cover_revision.get('resourceID'), cover_revision.get('id'))
                except Exception:
                    log.debug("Could not update artifact cover. artifact_revision:%s, resource_revision:%s"
                          % (artifact.get_revision_id(), cover_revision.get('id')) )
            if attachments:
                for attachment in attachments:
                    attachment_id = attachment.get('attachmentID', None)
                    attachment_revision_id = attachment.get('attachmentRevisionID', None)
                    if attachment_id and attachment_revision_id:
                        try:
                            ArtifactManager.attach_resource(artifact.get_artifact_id(), artifact.get_revision_id(),
                                  attachment_id, attachment_revision_id)
                        except Exception:
                            log.debug("Could not associate attachment with artifact. artifact_revision:%s, resource_revision:%s"
                                   % (artifact.get_revision_id(),attachment_revision_id) )
        return artifact

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

        user = None
        try:
            from flxweb.model.session import SessionManager
            user = SessionManager.getCurrentUser()
        except:
            log.debug("Could not fetch logged in user's info.")

        if artifact.get('artifactType') == ArtifactManager.ARTIFACT_TYPE_CHAPTER :
            artifact['bookTitle'] = bookTitle
        try:
            log.info('Contextual Save:saving artifact')
            artifact = ArtifactManager.saveArtifact(artifact)
            log.info ('artifact saved. id: %s, revisionID: %s' % ( artifact.get_artifact_id(), artifact.get_revision_id() ))
        except ArtifactSaveException, ex:
            log.debug("failed to save artifact %s:%s within context %s:%s"
                      % (artifact.get_artifact_id(), artifact.get('title'),
                         context.get_artifact_id(), context.get('title')) )
            raise ex
        if not position.endswith('.0'):
            #update and save chapter+book
            chapter_position = int(position.split('.')[0])
            chapter_position_str = '%s.0' % chapter_position
            chapter_position = chapter_position-1
            artifact_position = int(position.split('.')[1])
            artifact_position = artifact_position -1
            log.debug("Artifact Index: %s, Chapter Index: %s" %(artifact_position, chapter_position) )

            log.debug('Contextual Save:getting chapter')
            chapter = ArtifactManager.getPermaDescendantArtifact(
                context.get('artifactType'), unquote( context.get('handle') ),
                context.getVersionNumber(), chapter_position_str,
                unquote( context.get('realm') )  if context.get('realm') else None)
            chapter['bookTitle'] = context.get('title')
            _children = dict(enumerate(chapter.getChildren()))
            log.debug("Children:%s" % len(_children))
            _children[artifact_position] = artifact #replace the saved lesson/section in chapter
            _artifact = chapter
            #update child artifact
            chapter.set_children(_children.values())
            chapter['updated'] = True
            log.debug("Chapter marked for update: %s" % chapter['updated'])
            if not chapter.is_owner(user):
                chapter['make_copy'] = True
            #log.info('Contextual Save:saving chapter')
            #chapter = ArtifactManager.saveArtifact(chapter)
            #_artifact = chapter
            artifact_position = chapter_position
            log.info ('chapter updated. id: %s' % chapter.get_artifact_id())
        else:
            #update and save book
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
            context['handle'] = unquote(context.get('handle'))
            context = ArtifactManager.saveArtifact(context)
            log.info ('context saved. id: %s' % context.get_artifact_id())

            artifact['context'] = context;
            artifact['position'] = position;
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
        except RemoteAPITimeoutException, e: raise e
        except RemoteAPIStatusException, ex:
            raise ex
        return data

    @staticmethod
    @ck12_cache_region('short_term', 'latest')
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
    @ck12_cache_region('short_term', 'popular')
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
    @ck12_cache_region('forever')
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
                from flxweb.model.modality import ModalityManager
                artifactClass = ModalityArtifact
                '''if artifactType in ModalityManager.get_modalities():
                    artifactClass = ModalityArtifact
                else:
                    log.debug("No class defined for artifact type %s. Fall back to generic Artifact model." % (artifactType));'''
        return artifactClass(dict_obj)

    @staticmethod
    def get_artifact_resources(artifact_type,
                               artifact_handle,
                               artifact_realm=None,
                               artifact_version=None,
                               resource_type='resource',
                               attachments_only=True):
        '''
        ArtifactManager.get_artifact_resources
        @param artifact_type: type of artifact
        @param artifact_handle: artifact handle
        @param artifact_realm: artifact realm  (example: user:admin)
        @param resource_type: type of resource ( use 'resource' for all resources)
        '''
        api_endpoint = 'get/perma/info/resources/%s/%s' % (artifact_type, quote( unquote(safe_encode(artifact_handle)) ) )
        if artifact_realm:
            api_endpoint = '%s/%s' % (api_endpoint, artifact_realm)
        api_endpoint = '%s/%s' % (api_endpoint, resource_type)
        params = {'_':datetime.datetime.now()}
        if artifact_version:
            params.update({'extension':'version:%s' % artifact_version})
        if attachments_only:
            params.update({'attachmentsOnly':'true'})

        data = RemoteAPI.makeGetCall(api_endpoint, params)
        if data and ('response' in data) and ('resources' in data['response']):
            resources = [Resource(r) for r in data['response']['resources']]
            resources = sorted(resources, key=lambda k: k['name'])
            return resources
        else:
            log.debug("response did not contain any resources. API:%s" % api_endpoint)
            return None

    @staticmethod
    def get_artifact_vocabulary(artifact_type,
                               artifact_handle,
                               artifact_realm=None,
                               artifact_version=None,
                               language_code=None):
        '''
        ArtifactManager.get_artifact_resources
        @param artifact_type: type of artifact
        @param artifact_handle: artifact handle
        @param artifact_realm: artifact realm  (example: user:admin)
        @param language_code: language code
        '''
        api_endpoint = 'get/perma/info/vocabulary/%s/%s' % (artifact_type, quote( unquote(safe_encode(artifact_handle)) ) )
        if artifact_realm:
            api_endpoint = '%s/%s' % (api_endpoint, artifact_realm)
        params = {}
        if language_code:
            params.update({'languageCode':language_code})

        data = RemoteAPI.makeGetCall(api_endpoint, params)
        if data and ('response' in data) and ('vocabularies' in data['response']) and len(data['response']['vocabularies']) > 0:
            return data['response']
        else:
            log.debug("response did not contain any vocabularies. API:%s" % api_endpoint)
            return None

    @staticmethod
    def get_extended_artifacts(artifact_id, artifact_type=None, extended_artifact_type='artifact'):
        api_endpoint = 'get/info/extended'
        if artifact_type:
            api_endpoint = '%s/%s' % (api_endpoint, artifact_type)
        api_endpoint = '%s/%s/%s' %(api_endpoint, artifact_id, extended_artifact_type)

        extended_artifacts = []
        try:
            data = RemoteAPI.makeGetCall(api_endpoint)
            response = data['response']
            if 'extendedArtifacts' in response:
                artifacts_by_type = response['extendedArtifacts']
                for _type in artifacts_by_type:
                    for artifact_obj in artifacts_by_type[_type]:
                        artifact = ArtifactManager.toArtifact(artifact_obj)
                        extended_artifacts.append(artifact)

        except RemoteAPIException, ex:
            log.debug("Error encountered while fetching extended artifacts for id:%s, artifact_type:%s, extended_artifact_type:%s"
                      % (artifact_id, artifact_type, extended_artifact_type))
            log.exception(ex)
        return extended_artifacts


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
        except RemoteAPITimeoutException, e: raise e
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
    def _upload_metadata_csv(csvfile):
        '''
        update metadata associations using a CSV file
        @param csvfile: CSV file object
        '''
        api_endpoint = 'load/browseTerms'
        params = {'waitFor':'true','file':csvfile}
        try:
            data = RemoteAPI.makeCall(api_endpoint, params, multipart=True)
            return data
        except RemoteAPITimeoutException, e: raise e
        except RemoteAPIStatusException, ex:
            log.exception(ex)
            return None

    @staticmethod
    def update_artifact_metadata(artifact_id, changed_metadata, domains=None):
        '''
        writes metadata changes csv file
        @param artifact: Artifact object with metadata changes
        @return: csvfile or None
        '''
        if not artifact_id:
            raise ArtifactMetadataSaveException("Invalid Artifact")
        cm = changed_metadata
        if not cm and not domains:
            raise ArtifactMetadataSaveException("Artifact does not have any metadata changes")
        csvfile = None
        try:
            csvfile = tempfile.TemporaryFile()
            writer = UnicodeWriter(csvfile)
            #write header row
            writer.writerow(['artifactID','browseTerm','browseTermType','browseTermParent','encodedID','action'])
            if cm:
                for action in cm:
                    _ma = cm.get(action)
                    for meta_type in _ma:
                        _mat = _ma.get(meta_type)
                        for meta_value in _mat:
                            writer.writerow([artifact_id, meta_value, meta_type, '', '', action])
            if domains:
                for domain in domains:
                    writer.writerow([artifact_id, domain['browseTerm'], 'domain', '', domain['encodedid'], domain['action']])

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
    def create_custom_cover(book_title, cover_file_path=None, cover_url=None, useOriginal=False):
        stored_file = None
        api = 'create/customCover'
        params = {'bookTitle': book_title, 'useOriginal':useOriginal}
        use_multipart = False
        if cover_file_path:
            try:
                stored_file = open(cover_file_path, 'r')
            except:
                raise CreateCustomCoverException("Could not open cover file for upload.")
            if not stored_file:
                raise CreateCustomCoverException("Could not open cover file for upload.")
            params.update({'coverImagePath':stored_file})
            use_multipart = True
        elif cover_url:
            params.update({'coverImageURI':cover_url})
        try:
            data = RemoteAPI.makeCall(api, params, multipart=use_multipart)
            log.debug("API Response: %s " %data)
            if data and 'response' in data:
                return data['response']
            else:
                return None
        except RemoteAPITimeoutException, e: raise e
        except RemoteAPIException, ex:
            raise CreateCustomCoverException("Failed to create custom cover.")
        except RemoteAPIStatusException, ex:
            raise CreateCustomCoverException("Failed to create custom cover.")

    @staticmethod
    def assembleArtifact(artifact, updating=False):
        '''
        Assembles i.e creates a book, in turn creating new chapters
        see
        https://insight.ck12.org/wiki/index.php/Release_2.0_Server_Design_Specification#Assemble_Artifact
        '''
        if not artifact:
            raise ValueError('passed artifact is none')

        if not artifact['artifactType'] in ArtifactManager.BOOK_TYPES:
            raise ValueError('At present API only supports assembling book artifact type')

        from flxweb.model.session import SessionManager
        user = SessionManager.getCurrentUser()

        api_endpoint = 'assemble/artifact'
        log.debug("Assembling Artifact")
        savedata = {}
        if updating:
            savedata['updating'] = 'true'
        savedata['artifact'] = base64.b64encode(json.dumps(artifact))
        log.debug(" Assemble payload: %s " % savedata)
        try:
            data = RemoteAPI.makeWriteCall(api_endpoint, savedata)
        except RemoteAPITimeoutException, e: raise e
        except RemoteAPIStatusException, ex:
            log.debug('Book Assembling failed. Exception=%s' % ex)
            if ErrorCodes.ARTIFACT_ALREADY_EXIST == ex.status_code:
                raise ArtifactAlreadyExistsException()
            elif ErrorCodes.CANNOT_CREATE_ARTIFACT == ex.status_code:
                if 'exists already' in ex.api_message:
                    raise ArtifactAlreadyExistsException()
                else:
                    raise ArtifactSaveException(ex.api_message)
            else:
                raise ex

        if 'message' in data['response']:
            log.debug('Artifact was not saved. Reason %s' % data['response']['message'])
            raise ArtifactSaveException(data['response']['message'])

        if 'artifact' in data['response']:
            artifact = ArtifactManager.toArtifact(data['response']['artifact'])
            log.debug('saved artifact : %s' % json.dumps(artifact))
            return artifact
        elif 'taskID' in data['response'] and data['response']['taskID']:
            return data['response']
        else:
            raise ArtifactSaveException('API did not return artifact. Instead returned %s' % data)

    @staticmethod
    def publishArtifactRequest(revision_id,comments=None,website=None,contributionType=None):
        #we are now making two calls. The publish requests is being call for record keeping
        #and then the second call publishes the artifact immediately
        api_endpoint = 'request/publish/revision/%s' % (revision_id)
        api_endpoint2 = 'publish/revision/%s' % (revision_id)
        if not comments:
            comments=''

        if not website:
            website = ''

        params = {'comments':comments,'website':website,'contributionType':contributionType}
        try:
            data = RemoteAPI.makeCall(api_endpoint,params)
            data2 = RemoteAPI.makeCall(api_endpoint2,params)
            log.debug(data)
            log.debug(data2)
            return True
        except RemoteAPITimeoutException, e: raise e
        except RemoteAPIStatusException, ex:
            raise ex

    @staticmethod
    def get_1x_artifact_info( artifact_type, artifact_id):
        '''
        Queries get/1x/{type}/{id} api.
        If the artifact is already migrated, returns the info of migrated 2.0 artifact
        returns None if the artifact is not migrated yet.
        '''
        api_endpoint = 'get/1x/%s/%s' % (artifact_type, artifact_id)
        try:
            data = RemoteAPI.makeCall(api_endpoint)
            response = data['response']
            obj = {}
            if 'artifact' in response:
                obj.update({'artifact': ArtifactManager.toArtifact(response['artifact']) })
            if 'parent' in response:
                obj.update({ 'parent' : ArtifactManager.toArtifact(response['parent']) })
            if 'position' in response:
                obj.update({ 'position' : response['position'] })
            if not obj:
                return None
            return obj
        except RemoteAPITimeoutException, e: raise e
        except RemoteAPIStatusException:
            return None
