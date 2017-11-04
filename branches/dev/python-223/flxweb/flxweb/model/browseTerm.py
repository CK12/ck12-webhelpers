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
# $Id$

from pylons import config
from flxweb.lib.ck12.util import equalsIgnoreCase, delimit_by
from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.artifact import ArtifactManager
from flxweb.model.ck12model import CK12Model
from flxweb.lib.ck12.decorators import ck12_cache_region
import logging
import ast
import re
import time, datetime
from urllib2 import quote

log = logging.getLogger( __name__ )

def forceInt(o):
    try:
        return int(o)
    except:
        return 1

class BrowseTerm( CK12Model ):
    # Sort order for subjects. see Pivotal story 57810582
    SORT_ORDER = {  'exam preparation':1,
                    'ENG':2,
                    'technology':3,
                    'astronomy':4,
                    'english':5,
                    'history':6,
                    'economics':7,
                    'health': 8
                }

    def __init__( self, dict_obj=None ):
        '''
        Constructs the model object using the key/values from the dict object
        '''

        if dict_obj:

            for key, value in dict_obj.items():
                if key == 'parent':
                    self['parent'] = BrowseTerm( value )
                elif key == 'children':
                    # make sure the children key exists
                    if not 'children' in self:
                        self['children'] = []

                    if type(value).__name__ == 'list':
                        for child in value:
                            childTerm = BrowseTerm( child )
                            childTerm['parent'] = self
                            self['children'].append( childTerm )
                    # sort the children
                    self.sortChildren()
                else:
                    self[key] = value
            # sort key
            if self['encodedID'] in BrowseTerm.SORT_ORDER:
                self['sort'] = BrowseTerm.SORT_ORDER[self['encodedID']]
            else:
                self['sort'] = 1

            #rename mathematics to math.
            # see https://basecamp.com/2241651/projects/2823134-ck-12-homepage/messages/16938907-comments-on#comment_100686347
            if self['encodedID'] == 'MAT':
                self['name'] = 'Math'

    def __repr__(self):
        return 'BrowseTerm:<%s>' % self['encodedID']

    def sortChildren(self):
        self['children'] = sorted(self['children'],key=lambda child: child['sort'])

    def hasNewContent(self):
        haslatest = False
        dun = int(config.get('days_until_new'))
        lma = self.get('latestModalityAdded')
        dateformat = '%Y-%m-%d %H:%M:%S'
        ldma = self.get('latestDescendantModalityAdded')
        today = datetime.datetime.today()
        twa = today - datetime.timedelta(days=dun)
        if lma:
            lmat = time.strptime(lma, dateformat)
            lmadt = datetime.datetime.fromtimestamp( time.mktime( lmat ) )
            if twa < lmadt:
                haslatest = True
        if ldma and not haslatest:
            ldmat = time.strptime(ldma, dateformat)
            ldmadt = datetime.datetime.fromtimestamp( time.mktime(ldmat) )
            if twa < ldmadt:
                haslatest = True
        return haslatest


    def canDrillDown( self,maxLevel=None):
        if not maxLevel:
            maxLevel = BrowseManager.getBrowseTreeMaxLevel()
        return self['hasChildren'] and self['level'] < maxLevel

    def browsePathAsString ( self ):
        path = ''
        for browseTerm in self.browsePath():
            path += '%s/' % browseTerm.slug()

        return path.rstrip( '/' )

    def browsePath ( self ):
        path = []
        if 'parent' in self and not self['parent']['name'] == 'root':
            path.extend( self['parent'].browsePath() )
            path.append( self )
        else:
            path.append( self )
        return path

    def hasArtifacts( self ):
        artifactCount = 0
        if 'descendantArtifactCount' in self:
            try:
                artifactCount += int( self['descendantArtifactCount'] )
            except Exception, e:
                # log any number exceptions
                log.error( 'For "%s" expected "descendantArtifactCount" to be int. But found it to be %s' % ( self['name'], self['descendantArtifactCount'] ) )

        if 'artifactCount' in self:
            try:
                artifactCount += int( self['artifactCount'] )
            except Exception, e:
                # log any number exceptions
                log.error( 'For "%s" expected "descendantArtifactCount" to be int. But found it to be %s' % ( self['name'], self['descendantArtifactCount'] ) )

        return ( artifactCount > 0 )

    def addChildren(self,children):
        '''
        add an instance of BrowseTerm as a child child
        '''
        if not 'children' in self:
            self['children'] = []

        self['children'].extend(children)
        #sort the children
        self.sortChildren()
        return self

    def removeChild(self,name):
        '''
        Remove child
        '''
        if 'children' in self:
            for index,child in enumerate(self['children']):
                if equalsIgnoreCase(child['name'], name):
                    del self['children'][index]
                    break
        #sort the children
        self.sortChildren()
        return self

    def slug(self):
        return BrowseTerm.slugify(self['name'])

    @staticmethod
    def slugify(name):
        '''
        Returns the slugified version of the browseTerm. These are used in the URL(s)
        '''
        slug = name.lower()
        slug = re.sub(r'[\W]+', '-', slug).strip('-')
        slug = re.sub(r'[-]+', '-', slug)
        return slug

    def hasConceptMap(self):
        '''
        Returns true if the browseTerm has a concept map
        It checks against the development.ini file
        '''
        branches = []
        for subject in ast.literal_eval(config['valid_branches']):
            branches.extend(subject['children'])
        concept_maps_list = ','.join([x['slug'] for x in branches if x['map'] == 1])
        return self.slug() in concept_maps_list

    def shortEncodedID(self):
        '''
        Returns the short encoded ID
        e.g for MAT.ALG, it will return only ALG
        '''
        if 'encodedID' in self:
            if '.' in self['encodedID']:
                return self['encodedID'].split('.')[-1]
            else:
                return self['encodedID']

    def books_count(self,include_descendant_count=True):
        '''
        Returns the number of books (all book types)
        associated with this browse term or any of
        its descendant
        '''
        books_count = 0
        if 'artifactCount' in self and\
            type(self['artifactCount']) == dict:
            for book_type in ArtifactManager.BOOK_TYPES:
                if book_type in self['artifactCount']:
                    books_count += self['artifactCount'][book_type]

        if include_descendant_count and\
            'descendantArtifactCount' in self and\
            type(self['descendantArtifactCount']) == dict:
            for book_type in ArtifactManager.BOOK_TYPES:
                if book_type in self['descendantArtifactCount']:
                    books_count += self['descendantArtifactCount'][book_type]
        return books_count

    def concepts_count(self,include_descendant_count=True):
        '''
        Returns the number of concepts (all book types)
        associated with this browse term or any of
        its descendant
        '''
        concepts_count = 0
        if 'artifactCount' in self and\
            type(self['artifactCount']) == dict:
            if ArtifactManager.ARTIFACT_TYPE_CONCEPT in self['artifactCount']:
                concepts_count += self['artifactCount'][ArtifactManager.ARTIFACT_TYPE_CONCEPT]

        if 'descendantArtifactCount' in self and\
            type(self['descendantArtifactCount']) == dict:
            if ArtifactManager.ARTIFACT_TYPE_CONCEPT in self['descendantArtifactCount']:
                concepts_count += self['descendantArtifactCount'][ArtifactManager.ARTIFACT_TYPE_CONCEPT]
        return concepts_count

    def get_modality_count(self,difficulty_levels=None, modality_types=None,descendants=False):
        '''
        returns the total count of modalities for current browseTerm
        @param difficulty_levels: list of difficulty levels to include in count. defaults to all levels
        @param modality_types: list of modality types to inclyde in count, defaults to all modality types.
        @param descendants: True/False, if the modality count should include counts on the descendants of curent browseTerm.
        '''

        if difficulty_levels and not isinstance(difficulty_levels,list):
            raise ValueError("difficulty_levels must be a list")
        if modality_types and not isinstance(modality_types,list):
            raise ValueError("modality_types must be a list")

        mcount = 0
        counts = self.get('modalityCount',{})
        if counts and type(counts) == dict:
            for mtype in counts:
                if not modality_types or mtype in modality_types:
                    mtypecount = counts.get(mtype)
                    for level in mtypecount:
                        if not difficulty_levels or level in difficulty_levels:
                            mcount = mcount + mtypecount.get(level,0)

        if descendants:
            counts = self.get('descendantModalityCount',{})
            if counts and type(counts) == dict:
                for mtype in counts:
                    if not modality_types or mtype in modality_types:
                        mtypecount = counts.get(mtype)
                        for level in mtypecount:
                            if not difficulty_levels or level in difficulty_levels:
                                mcount = mcount + mtypecount.get(level,0)

        return mcount

    def get_branch(self):
        '''
        Returns the branch for the current browseTerm.
        e.g is the encodedID of the current object is
        MAT.ALG.100 then it the branch is 'ALG' and this
        method will return the BrowseTerm object for 'ALG'
        encoded ID is of the format:
        <subject>:<branch>:<number>
        '''
        eid_branch = branch = None
        eid = self['encodedID']
        if 'encodedID' in self and self['encodedID']:
            eid = self['encodedID']

        if eid:
            # split the encodedID of the form <subject>:<branch>:<number>
            # into <subject>:<branch>
            eid_branch = '.'.join( eid.split('.')[:2] )

        if eid_branch:
            branch = BrowseManager.getBrowseTermByEncodedId(eid_branch)
        return branch

    def is_pseudodomain(self):
        '''
        Returns True if the domain is a pseudodomain.
        Pseudodomains are the nodes created to contain user generated modalities
        that are not aligned to any concept node.
        '''
        nodetype = self.get('type')
        return 'pseudodomain' == nodetype

class BrowseManager( RemoteAPI ):

    GRADES = {
                'K': 'Kindergarten',
                '1': '1st Grade',
                '2': '2nd Grade',
                '3': '3rd Grade',
                '4': '4th Grade',
                '5': '5th Grade',
                '6': '6th Grade',
                '7': '7th Grade',
                '8': '8th Grade',
                '9': '9th Grade',
                '10': '10th Grade',
                '11': '11th Grade',
                '12': '12th Grade'
            }


    # The Others subject is a sudo subject that only exists
    # for the web application.
    OTHER_SUBJECT = BrowseTerm({'name':'More', 'encodedID' : 'other',
                                'hasChildren':True, 'id':-1,'level':1
                                })

    OTHER_SUBJECT.addChildren([
            BrowseTerm({'name':'Engineering', 'encodedID' : 'ENG',
                                'hasChildren':False, 'id':-1,'level':2,
                                'parent':OTHER_SUBJECT,'children':[]}),
            BrowseTerm({'name':'Technology', 'encodedID' : 'technology',
                                'hasChildren':False, 'id':-1,'level':2,
                                'parent':OTHER_SUBJECT,'children':[]}),
#            BrowseTerm({'name':'English', 'encodedID' : 'english',
#                                'hasChildren':False, 'id':-1,'level':2,
#                                'parent':OTHER_SUBJECT,'children':[]}),
            BrowseTerm({'name':'Astronomy', 'encodedID' : 'astronomy',
                                'hasChildren':False, 'id':-1,'level':2,
                                'parent':OTHER_SUBJECT,'children':[]}),
            BrowseTerm({'name':'History', 'encodedID' : 'history',
                                'hasChildren':False, 'id':-1,'level':2,
                                'parent':OTHER_SUBJECT,'children':[]}),
            BrowseTerm({'name':'Economics', 'encodedID' : 'economics',
                                'hasChildren':False, 'id':-1,'level':2,
                                'parent':OTHER_SUBJECT,'children':[]}),
            BrowseTerm({'name':'SAT Exam Prep.', 'encodedID' : 'exam preparation',
                                'hasChildren':False, 'id':-1,'level':2,
                                'parent':OTHER_SUBJECT,'children':[]}),
            BrowseTerm({'name':'Health', 'encodedID' : 'health',
                                'hasChildren':False, 'id':-1,'level':2,
                                'parent':'','children':[], 'has_concepts':False})
    ])


    ENGLISH_WRITING_BROWSETERM = BrowseTerm({'name':'Writing', 'encodedID' : 'writing',
                                                'hasChildren':False, 'id':-1,'level':2, 'children':[]})
    @classmethod
    def getValidSubjects(cls):
        return config.get('valid_subjects').split(',')

    @classmethod
    def getConceptGridRootName(cls):
        return config.get( 'browse_concept_grid_root' )

    @classmethod
    def getBrowsePageSize(cls):
        return config.get( 'browse_page_size' )

    @classmethod
    def getBrowseTreeMaxLevel(cls):
        return int( config.get( 'browse_tree_max_level' ) )

    @classmethod
    @ck12_cache_region('forever', invalidation_key='grid')
    def getConceptGridBase(cls, levels=2):
        conceptGrid = {}
        try:
            browseTerm = BrowseManager.getConceptGridRootName()
            conceptGrid = BrowseManager.getBrowseTermDescendents(browseTerm, levels)
        except Exception,e:
            log.error('Error fetching the concept grid base nodes')
            log.exception(e)
        return conceptGrid

    @classmethod
    @ck12_cache_region('forever', invalidation_key='grid')
    def getConceptGrid(cls):
        conceptGrid = {}
        try:
            conceptGrid = BrowseManager.getConceptGridBase()
            valid_children = []
            # get the 3rd level
            valid_subjects = BrowseManager.getValidSubjects()
            for sIndex,subject in enumerate(conceptGrid['children']):
                if subject['encodedID'] not in valid_subjects:
                    log.debug("!!!! Skipping %s subject as it is not listed in valid_subjects in development.ini" % subject)
                else:
                    for bIndex,branch in enumerate(subject['children']):
                        fetchedSubject = BrowseManager.getBrowseTermDescendents( branch['encodedID'], 1)
                        oldSubject = subject['children'][bIndex]
                        if 'parent' in oldSubject:
                            fetchedSubject['parent'] = oldSubject['parent']
                        subject['children'][bIndex] = fetchedSubject
                    valid_children.append(subject)
                    if subject['encodedID'] == 'ELA':
                        #special case for english branch
                        # add writing branch under english
                        writing_browseterm = BrowseManager.ENGLISH_WRITING_BROWSETERM
                        writing_browseterm['parent'] = subject
                        #fetch writing flexbooks
                        total_count,artifact = BrowseManager.getArtifactsByBrowseTerm(
                                                        ArtifactManager.ARTIFACT_TYPE_BOOK,
                                                        writing_browseterm['encodedID'],1,1,
                                                        None,True)
                        if total_count:
                            writing_browseterm['artifactCount'] = { ArtifactManager.ARTIFACT_TYPE_BOOK:total_count }

                        subject['children'].append(writing_browseterm)

            conceptGrid['children'] = valid_children

            conceptGrid = BrowseManager.addOthersSubject(conceptGrid)

            for subject in conceptGrid['children']:
                # Note: the children list is copied using [:], since we are modifying
                # the list in the loop
                for branch in subject['children'][:]:
                    if not branch.books_count() and not branch.get_modality_count(descendants=True):
                        log.debug('!!!!! Removed %s as it has 0 books/concepts to be shown in browse' % branch['name'])
                        subject['children'].remove(branch)
        except Exception,e:
            log.error('Error fetching the concept grid nodes')
            log.exception(e)
        return conceptGrid

    @classmethod
    def getConceptTracksGrid(cls):
        """ Like getConceptGrid(), but include concepts for "tracks" only
        """
        conceptGrid = {}
        try:
            conceptGrid = BrowseManager.getConceptGridBase()

            for subject in conceptGrid['children']:
                # Note: children list copied using [:], since we're modifying it
                for branch in subject['children'][:]:
                    if not branch.get_modality_count(descendants=True):
                        log.debug('removed %s as it has 0 concepts to be shown in browse' % branch['name'])
                        subject['children'].remove(branch)
        except Exception,e:
            log.error('Error fetching the concept tracks grid nodes')
            log.exception(e)
        return conceptGrid

    @classmethod
    def hasMiddleHighSchool(self, current_branch='Physics'):
        try:
            linked_branch = [x for x in ast.literal_eval(config['valid_branches']) if (x.has_key('cross_over_link') and x['name'].lower() == current_branch.lower()) and (x['cross_over_link'] == 'ms' or x['cross_over_link'] == 'hs')]
            if linked_branch:
                return linked_branch[0]['cross_over_link'], linked_branch[0]['link']
            else:
                return "false"
        except Exception,e:
            log.exception(e)


    @classmethod
    @ck12_cache_region('forever')
    def addOthersSubject(cls, conceptGrid ):
        try:
            for branch in BrowseManager.OTHER_SUBJECT['children']:
                total_count,artifact = BrowseManager.getArtifactsByBrowseTerm(
                                                        ArtifactManager.ARTIFACT_TYPE_BOOK,
                                                        branch['encodedID'],1,1,
                                                        None,True)
                if total_count:
                    branch['artifactCount'] = { ArtifactManager.ARTIFACT_TYPE_BOOK:total_count }
                    log.debug('%s has %s books' % (branch['encodedID'], branch['artifactCount'][ArtifactManager.ARTIFACT_TYPE_BOOK]))
        except Exception,e:
            log.exception(e)
        conceptGrid.addChildren([BrowseManager.OTHER_SUBJECT])
        return conceptGrid

    @classmethod
    @ck12_cache_region('forever')
    def getBrowseTermByPath(cls, browsePath, levels=1 ):
        try:
            if browsePath:
                # split path with "/"
                slugs = browsePath.split( '/' )
                # staring parent node is NONE i.e root of the concept tree
                browseTerm = None
                # loop through the names and get to the final browseTerm
                for slug in slugs:
                    browseTerm = BrowseManager.getBrowseTermBySlug( slug, browseTerm )

            return browseTerm
        except Exception, e:
            log.error( e );
            return {}

    @classmethod
    @ck12_cache_region('forever')
    def getBrowseTermDescendents(cls, browseTerm, levels=1 ):
        if not browseTerm:
            return {}

        if isinstance(browseTerm, BrowseTerm):
            browseTerm = browseTerm.get('encodedID')

        data = RemoteAPI.makeGetCall( 'get/info/browseTerm/descendants/%s/%s' % ( browseTerm, levels ) )
        if not "term" in data["response"]:
            return {}

        return BrowseTerm( data["response"]["term"] )


    @classmethod
    @ck12_cache_region('forever')
    def getBrowseTermInfo(cls, browseTerm):
        term_info = None
        if browseTerm:
            data = RemoteAPI.makeGetCall('get/info/browseTerm/%s' % quote(browseTerm) )
            if 'response' in data:
                term_info = BrowseTerm( data['response'] )
        return term_info

    @classmethod
    @ck12_cache_region('forever')
    def getBrowseTermsForEncodedID(cls, eid, pageNum=1, pageSize=10):
        '''
        Returns browse term descendants for provided eid grouped by their level-3 ancestors
        '''
        if not eid or not isinstance(eid, (str,unicode) ):
            raise ValueError("eid must be a non-empty string")

        params = {
            'pageNum': forceInt(pageNum),
            'pageSize': forceInt(pageSize)
        }

        data = RemoteAPI.makeGetCall('browse/modality/artifact/%s/all' % eid, params)
        if ((not data) or
            (not ('response' in data)) or
            (not ('results' in data['response']))):
            return None

        browse_term_groups = []
        browse_term_group_ids = {}

        for browse_term in data['response']['results']:
            ancestor = browse_term.pop('descendantOf', None)
            if not ancestor:
                continue

            ancestor = BrowseTerm(ancestor)
            ancestor_id = ancestor['id']

            term = BrowseTerm(browse_term)
            term['descendantOfID'] = ancestor_id

            # If the ancestor_id is already present, find it and
            # append the term to it instead.  Because ancestor is
            # an object rather than a native, we can reliably
            # store references to it in a hash.

            if ancestor_id in browse_term_group_ids:
                browse_term_group_ids[ancestor_id]['children'].append(term)
                continue

            # Else add the ancestor to the root object list, and
            # add the term as the ancestor's first children

            ancestor['children'] = [term]
            browse_term_group_ids[ancestor_id] = ancestor
            browse_term_groups.append(ancestor)

        return browse_term_groups

    @classmethod
    def getBrowseTermBySlug(cls, slug, startingNode=None ):
        if not slug:
            return None

        if not startingNode:
            startingNode = BrowseManager.getConceptGrid()

        # make sure the slug is a slug
        # Note: Slugifying a slug should not change a slug
        slug = BrowseTerm.slugify(slug)
        if equalsIgnoreCase( startingNode.slug(), slug ):
            return startingNode
        elif 'children' in startingNode:
            for child in startingNode['children']:
                found = BrowseManager.getBrowseTermBySlug ( slug, child )
                if found:
                    return found
        else:
            return None

    @classmethod
    @ck12_cache_region('forever')
    def getBrowseTermByName(cls, browseTerm, startingNode=None ):

        if not browseTerm:
            return None

        if not startingNode:
            startingNode = BrowseManager.getConceptGrid()

        if equalsIgnoreCase( startingNode ['name'], browseTerm ):
            return startingNode
        elif 'children' in startingNode:
            for child in startingNode['children']:
                found = BrowseManager.getBrowseTermByName ( browseTerm, child )
                if found:
                    return found
        else:
            return None

    @classmethod
    @ck12_cache_region('forever')
    def getArtifactsByBrowseTerm( cls,type, browse_term, page_num,
                               page_size,sort=None,return_total_count=False ):
        artifacts_list = []
        try:
            if page_num:
                page_num = int( page_num )
            else :
                page_num = 1

            if not page_size:
                page_size = 10

            params = {
                        'pageNum':page_num,
                        'pageSize':page_size,
                        'filters':False,
                        'includeEIDs':1,
                        'ck12only': True
                    }

            if ArtifactManager.ARTIFACT_TYPE_BOOK in type:
                params['extendedArtifacts']=True

            if sort:
                params['sort'] = sort

            if type == 'book':
                browse_api_url = 'browse/subject/book/%s' % (browse_term)
                results_key = browse_term
            else:
                browse_api_url = 'browse/category/%s/%s/all' % ( type, browse_term )
                results_key = 'results'

            data = RemoteAPI.makeGetCall(browse_api_url, params)
            artifacts_list = []
            if 'response' in data and \
               results_key in data['response']:
                data = data['response']
                for item in data[results_key]:
                    artifact = ArtifactManager.toArtifact(item)
                    artifact = BrowseManager.cleanArtifact(artifact)
                    artifacts_list.append(artifact)
        except Exception, e:
            log.exception( e )

        if return_total_count:
            if 'total' in data:
                total_count = data['total']
            else:
                total_count = 0
            return total_count,artifacts_list
        else:
            return artifacts_list

    @classmethod
    def cleanArtifact(cls,artifact):
        """
        Remove unwanted fields from the artifact object, to reduce
        the size in cache.
        """
        to_delete = ['attachments','revisions','domain',
                     'standardsGrid','stateGrid','subjectGrid',
                     'tagGrid','foundationGrid']
        for key in to_delete:
            if key in artifact:
                del artifact[key]

        return artifact

    @classmethod
    def getBrowseTermByEncodedId(cls,encode_id,root_node=None):
        if not root_node:
            root_node = BrowseManager.getConceptGrid()

        if encode_id == root_node['encodedID']:
            return root_node
        elif 'children' in root_node:
            for child in root_node['children']:
                found = BrowseManager.getBrowseTermByEncodedId(encode_id,child)
                if found:
                    return found
                else:
                    term = BrowseManager.getBrowseTermInfo(encode_id)
                    if term:
                        return term

    @classmethod
    @ck12_cache_region('forever')
    def getArtifactCount( cls,types ):
        try:
            page_num = 1
            page_size = 1
            if not type(types) == list:
                raise ValueError('types parameter should be a list of artifact types')
            params = {'pageNum':page_num, 'pageSize':page_size,'filters':False}
            browse_api_url = 'browse/%s/__all__' % (','.join(types))
            data = RemoteAPI.makeGetCall(browse_api_url, params)
            if 'response' in data and \
               'total' in data['response']:
                count = data['response']['total']
        except Exception, e:
            log.exception( e )
            count = 0

        return count

    @classmethod
    def getCorrelatedSubjects( cls, standardboard=None, grade=None ):
        subjects = []
        try:
            api_url = 'get/info/subjects/correlated'
            if standardboard:
                api_url = '%s/%s' % (api_url,standardboard)
            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and\
               'subjects' in data['response']:
                subjects = data['response']['subjects']
                #Bug - 13240 Remove 'life science', 'physical science' as currently no EIDs in these branches
                #TODO: Whenever there will be EID's for these, remove this check
                #subjectsWithoutEID = ['life science','physical science']
                #subjects = [subject for subject in subjects if subject['name'] not in subjectsWithoutEID]
                #subjects.append({'id':12114, 'name':'physical science'})
        except Exception, e:
            log.exception( e )
        return subjects

    @classmethod
    def getCorrelatedGrades( cls ,subject=None,standardboard=None ):
        grades = []
        message = ''
        try:
            api_url = 'get/info/grades/correlated'
            if subject:
                api_url = '%s/%s' % (api_url,subject)

            if standardboard:
                api_url = '%s/%s' % (api_url,standardboard)

            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and 'grades' in data['response']:
                grades = data['response']['grades']
                for index,grade in enumerate(grades):
                    if grade['name'] in BrowseManager.GRADES:
                        grade['longname'] = BrowseManager.GRADES[grade['name']]
                        grades[index] = grade
        except Exception, e:
            log.exception( e )
        return grades

    @classmethod
    def getAlternateCorrelatedGrades( cls ,subject=None,standardboard=None ):
        grades = []
        message = ''
        try:
            api_url = 'get/info/grades/correlated_alternate'

            if subject:
                api_url = '%s/%s' % (api_url,subject)

            if standardboard:
                api_url = '%s/%s' % (api_url,standardboard)

            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and 'grades' in data['response']:
                 grades = data['response']['grades']
                 for index,grade in enumerate(grades):
                     if grade['name'] in BrowseManager.GRADES:
                         grade['longname'] = BrowseManager.GRADES[grade['name']]
                         grades[index] = grade

            data['response']['grades'] = grades

        except Exception, e:
                log.exception(e)
        return data['response']

    @classmethod
    def getCorrelatedStandardboards( cls ,subject=None,grade=None ):
        standardBoards = []
        try:
            api_url = 'get/info/standardboards/correlated'
            if subject:
                api_url = '%s/%s' % (api_url,subject)

            if grade:
                api_url = '%s/%s' % (api_url,grade)

            data = RemoteAPI.makeGetCall(api_url)
            if 'response' in data and\
               'standardBoards' in data['response']:
                standardBoards= data['response']['standardBoards']
        except Exception, e:
            log.exception( e )
        return standardBoards

    @classmethod
    def getStandardboardData(cls, standardboard=None):
	"""
	Provide a Standardboard id or Standardboard name ex:(US.AK), and it will return the
	Standardboard data.
	"""
	boardData = {}

	try:
		api_url = 'get/info/standardboarddata'
		params = {'standardboard': standardboard}
		data = RemoteAPI.makeGetCall(api_url, params)

		if ('response' in data) and ('boardData' in data['response']):
			boardData = data['response']['boardData']

	except Exception, e:
		log.exception(e)
	return (boardData)

    @classmethod
    def getCorrelatedStandardboardsByArtifact( cls, artifactId=None ):
        standardBoards = []
        try:
            api_url = 'get/info/standardboards/correlated/artifact'
            if artifactId:
                api_url = '%s/%s' % (api_url, artifactId)
                data = RemoteAPI.makeGetCall(api_url)
                if 'response' in data and\
                   'standardBoards' in data['response']:
                    standardBoards= data['response']['standardBoards']
            else:
                return standardBoards
        except Exception, e:
            log.exception(e)
        return standardBoards

    @classmethod
    def collateStandardsByChapter(cls, artifacts_standards):
        if 'artifacts' in artifacts_standards and 'standards' in artifacts_standards:
            artifacts = artifacts_standards['artifacts']
            standards = artifacts_standards['standards']
            if 'children' in artifacts:
                for chapterOrLesson in artifacts['children']:
                    chapter_standards = []
                    if 'standards' in chapterOrLesson:
                        for standard in chapterOrLesson['standards']:
                            chapter_standards.append(str(standard))
                            gradeRange = cls.createGradeRange(standards[str(standard)]['grades'])
                            standards[str(standard)]['grades'] = gradeRange
                    if 'children' in chapterOrLesson:
                        for section in chapterOrLesson['children']:
                            if 'standards' in section:
                                for standard in section['standards']:
                                    gradeRange = cls.createGradeRange(standards[str(standard)]['grades'])
                                    standards[str(standard)]['grades'] = gradeRange
                                    chapter_standards.append(str(standard))
                    chapterOrLesson['standards'] = list(set(chapter_standards))
            else:
                if artifacts.has_key('standards'):
                    for standard in artifacts['standards']:
                        if 'grades' in standards[str(standard)]:
                            gradeRange = cls.createGradeRange(standards[str(standard)]['grades'])
                            standards[str(standard)]['grades'] = gradeRange
            # Convert grades array to string for presentation
            # Remove underscore and further string from section.
            for standard in standards.keys():
                if standards[standard].has_key('grades'):
                    standards[standard]['grades'] = delimit_by(standards[standard]['grades'], ', ')
                    standards[standard]['section'] = re.sub(r'_.*', '', standards[standard]['section'])

        return artifacts_standards

    @classmethod
    def getCorrelatedStandardsByArtifactAndStandardBoards( cls, standardBoardId, artifactId):
        artifacts_standards = {}
        try:
            api_url = 'get/standard/correlations'
            if artifactId and standardBoardId :
                api_url = '%s/%s' % (api_url, standardBoardId)
                api_url = '%s/%s' % (api_url, artifactId)
                data = RemoteAPI.makeGetCall(api_url)
                if 'response' in data and\
                   'artifacts' in data['response']:
                    artifacts_standards['artifacts'] = data['response']['artifacts']
                    artifacts_standards['standards'] = data['response']['standards']
            else:
                return artifacts_standards
        except Exception, e:
            log.exception(e)
        return cls.collateStandardsByChapter(artifacts_standards)

    @classmethod
    def createGradeRange(cls, grades):
        ranges = []
        rstart = rend = None
        index = 0
        if not grades:
            return ranges
        # find out non digit grades
        ranges = [c for c in grades if not c.isdigit()]
        # find out digit grades to create range
        grades = [int(c) for c in grades if c.isdigit()]
        len = grades.__len__()

        while index < len:
            rstart = grades[index]
            rend = rstart
            while (index+1) < len and (grades[index+1] - grades[index]) == 1:
                rend = grades[index+1]
                index +=1
            ranges.append('%s' % rstart if rstart == rend else '%s-%s' % (rstart, rend))
            index +=1
        return ranges

    @classmethod
    def get_subjects(cls):
        subjects = ast.literal_eval(config['valid_branches'])
        return subjects
