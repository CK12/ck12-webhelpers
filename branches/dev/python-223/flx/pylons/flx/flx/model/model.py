"""
    Map database tables to python classes.
"""

from BeautifulSoup import BeautifulSoup, Tag
from flx.lib import helpers as h
from flx.lib.fc import fcclient as fc
from flx.model import meta
from pylons import config
from pylons.i18n.translation import _
from sqlalchemy import orm, desc, asc
from sqlalchemy.sql import select, func, and_, not_, distinct
from urllib import quote, unquote
from flx.model.mongo import artifactviews, collectionNode
from flx.model.mongo import getDB as getMongoDBConnection
from flx.model.exceptions import ResourceBlacklistedException
import json
import logging
import re
import traceback

########## Reviewed Model Classes ##########

class ArtifactDraft(object):

    def __init__(self, **kw):
        self.__dict__.update(kw)

#####################################

log = logging.getLogger(__name__)

ck12Editor = None
RESOURCE_TYPE_RE = re.compile(r'http[s]?://.*%2B([A-Za-z_0-9]*?)\.1$')
PRINT_RESOURCE_TYPES = ['pdf', 'epub', 'mobi', 'epubk']
COVER_RESOURCE_TYPES = ['cover page', 'cover page icon', 'cover video']

ARTIFACT_TYPES_MAP = {
        'web': 'web',
        'enrichment': 'video',
        'lecture': 'video',
        'flashcard': 'web',
        'studyguide': 'studyguide',
        'preread': 'reading',
        'prereadans': 'reading',
        'postread': 'reading',
        'postreadans': 'reading',
        'prepostread': 'reading',
        'prepostreadans': 'reading',
        'whileread': 'reading',
        'whilereadans': 'reading',
        'conceptmap': 'interactive',
        'quiz': 'quiz',
        'quizans': 'quiz',
        'quizdemo': 'quiz',
        'simulation': 'interactive',
        'simulationint': 'interactive',
        'activity': 'activity',
        'activityans': 'activity',
        'lessonplan': 'lessonplan',
        'lessonplanx': 'lessonplan',
        'lessonplanans': 'lessonplan',
        'lessonplanxans': 'lessonplan',
        'lab': 'lab',
        'labans': 'lab',
        'worksheet': 'worksheet',
        'worksheetans': 'worksheet',
        'presentation': 'presentation',
        'interactive': 'interactive',
        'exerciseint': 'interactive',
        'image': 'image',
        'rubric': 'rubric',
        'handout': 'handout',
        'audio': 'audio',
        'cthink': 'cthink',
        'rwa': 'interactive',

        ## Catch-all
        'attachment': 'attachment',
        }

## Map modality resources to multiple resources along with the name to append to parent resource's name
RESOURCE_DEPENDENCY_MAP = {
          'quiz' : {'answer key':'Answer Key','answer demo':'Answer Demo'},
          'activity' : {'answer key':'Answer Key','answer demo':'Answer Demo'},
          'lab' : {'answer key':'Answer Key','answer demo':'Answer Demo'},
          'lessonplan' : {'answer key':'Answer Key','answer demo':'Answer Demo'},
          'reading' : {'answer key':'Answer Key','answer demo':'Answer Demo'},
          'interactive' : {'answer key':'Answer Key','answer demo':'Answer Demo'},
          'worksheet' : {'answer key':'Answer Key','answer demo':'Answer Demo'},
          }

CANONICAL_DOMAIN_MAPPING = { 'SCI.LSC': ['SCI.BIO'], 'SCI.PSC': ['SCI.PHY', 'SCI.CHE'] }

BRANCH_ENCODEDID_MAPPING = {'MAT.ARI': 'arithmetic',
                            'MAT.MEA': 'measurement',
                            'MAT.ALG': 'algebra',
                            'MAT.GEO': 'geometry',
                            'MAT.PRB': 'probability',
                            'MAT.STA': 'statistics',
                            'MAT.CAL': 'calculus',
                            'MAT.TRG': 'trigonometry',
                            'MAT.ALY': 'analysis',
                            'MAT.EM1': 'elementary-math-grade-1',
                            'MAT.EM2': 'elementary-math-grade-2',
                            'MAT.EM3': 'elementary-math-grade-3',
                            'MAT.EM4': 'elementary-math-grade-4',
                            'MAT.EM5': 'elementary-math-grade-5',
                            'SCI.PHY': 'physics',
                            'SCI.BIO': 'biology',
                            'SCI.ESC': 'earth-science',
                            'SCI.CHE': 'chemistry',
                            'SCI.LSC': 'life-science',
                            'SCI.PSC': 'physical-science', 
                            'ELA.SPL': 'spelling',
                            'ENG.TST': 'testing',
                           }

BROWSE_TERM_TYPE_CONTRIBUTOR_VALUES = [ 'teacher', 'student', 'community' ]
SORTED_GRADES = ['k', 'kindergarten', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'higher-ed']
CONCEPT_COLLECTION_HANDLE_SEPARATOR = '-::-'
UNPUBLISHED_BRANCHES = [ "MAT.EM1", "MAT.EM2", "MAT.EM3", "MAT.EM4", "MAT.EM5", "MAT.ALY", "SCI.LSC", "SCI.PSC" ]

def getChapterSeparator():
    return '-::of::-'

def title2Handle(title):
    handle = title.strip() if title else None
    if handle:
        t = handle
        while True:
            handle = unquote(t)
            if handle == t:
                break
            t = handle
        #
        #  Remove unsafe characters.
        #
        for ch in [ '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '/', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '`', '{', '|', '}', '~', ':' ]:
            handle = handle.replace(ch, '')
        #
        #  1. Change space to '-'.
        #  2. Reduce repeating '-' into a single one.
        #
        import re

        handle = handle.replace(' ', '-')
        handle = re.sub(r'(-)\1+', r'\1', handle)
        ## Replace more than one consecutive periods to a single period.
        handle = re.sub(r'\.(\.+)', '.', handle)
        log.debug('title2Handle: title[%s] handle[%s]' % (title, handle))
    return handle

def resourceName2Handle(name):
    if name:
        return name.rstrip('/').replace(' ', '-')
    return name

def stripChapterName(chapterName):
    import re

    pattern = getChapterSeparator()
    names = re.split(pattern, chapterName)
    return names[0]

def getArtifactPerma(login, handle, type, realmFirst=False, qualified=False, realmPos=2):
    realm = ''
    global ck12Editor
    global config
    if ck12Editor is None:
        ck12Editor = config.get('ck12_editor', 'ck12editor')
    if login == ck12Editor:
        realm = ''
    else:
        name = login
        realm = 'user:%s' % name

    if realmFirst == True:
        realmPos = 0

    artifactType = type
    if not realm:
        perma = '/%s/%s' % (artifactType, handle)
    else:
        if realmPos == 0:
            perma = '/%s/%s/%s' % (realm, artifactType, handle)
        elif realmPos == 1:
            perma = '/%s/%s/%s' % (artifactType, realm, handle)
        else:
            perma = '/%s/%s/%s' % (artifactType, handle, realm)
    if qualified:
        if not config or not config.get('flx_prefix_url'):
            config = h.load_pylons_config()
        perma = u'%s%s' % (config.get('flx_prefix_url'), perma)
    return perma

def getStandardTerms(standards):
    standardTerms = {}
    for standard in standards:
        standardBoard = standard.standardBoard
        term = '%s.%s' % (standardBoard.country.code2Letter.upper(), standardBoard.name.upper())
        terms = []
        for grade in standard.grades:
            terms.append('%s.%s' % (term, grade.name))
        for term in terms:
            term += '.%s.%s' % (standard.subject.name, standard.section.replace('.', '_'))
            standardTerms[term] = term
    return standardTerms.keys()

def getStandardGrid(standards, standardBoardID=None, includeDescription=False):
    standardGrid = {}
    for standard in standards:
        standardBoard = standard.standardBoard
        if standardBoardID and standardBoard.id != standardBoardID:
            continue
        name = '%s.%s' % (standardBoard.country.code2Letter.upper(), standardBoard.name)
        if not standardGrid.has_key(name):
            standardGrid[name] = []
        standardGrid[name].append(standard.asDict(includeDescription=includeDescription))
    return standardGrid

GRADES_SORT_DICT = {
    'Pre-K': 0, 'K': 1, '1': 2, '2': 3, '3': 4,
    '4': 5, '5': 6, '6': 7, '7': 8, '8': 9, '9': 10,
    '10': 11, '11': 12, '12': 13, '13': 14,
    '14': 15, '15': 16 }

def sortGradesDict(gd):
    return sorted(gd, lambda x,y: cmp(GRADES_SORT_DICT.get(x[1], 999), GRADES_SORT_DICT.get(y[1], 999)))

def getBranchHandle(encodedID):
    if encodedID:
        return BRANCH_ENCODEDID_MAPPING.get(encodedID[0:7].upper())
    return encodedID

INVALIDATE = 0
LOAD = 1
UPDATE = 2
PROCESS = 3
STREAM_TYPES = ['default', 'thumb_small', 'thumb_large', 'thumb_postcard', 'default_tiny', 'thumb_small_tiny', 'thumb_large_tiny', 'thumb_postcard_tiny']
STREAM_TYPES.extend([x.upper() for x in STREAM_TYPES])

LEVEL = 3

"""
    Classes to be filled in by the mapper of SqlAlchemy.
"""

class FlxModel(object):

    mongodb = None

    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')
        #return unicode(self.asDict()).encode('utf-8')

    def __repr__(self):
        return str(self)

    @staticmethod
    def processMulti(items, level=LEVEL):
        if hasattr(items, 'keys'):
            d = {}
            #
            #  Dictionary.
            #
            for key in items.keys():
                value = items.get(key, None)
                log.debug('processMulti: dict key[%s] %s[%s]' % (key, type(items), items))
                if isinstance(value, FlxModel):
                    d[key] = value.asDict(level - 1, top=False)
                else:
                    d[key] = processMulti(value, level - 1)
            return d
        elif hasattr(items, '__iter__'):
            #
            #  List.
            #
            l = []
            for value in items:
                log.debug('processMulti: list %s[%s]' % (type(value), value))
                if isinstance(value, FlxModel):
                    l.append(value.asDict(level=level - 1, top=level == LEVEL))
                else:
                    l.append(processMulti(value, level - 1))
            log.debug('processMulti: return %s[%s]' % (type(l), l))
            return l

    def asDict(self, level=LEVEL, top=True):
        """
            Return the dictionary this instance.
        """
        if level <= 0:
            return '...'

        d = {}
        mine_dict = self.__dict__
        for key in mine_dict.keys():

            if key == '_sa_instance_state':
                continue
            value = mine_dict.get(key)
            log.debug('asDict[%d]: key[%s] %s[%s]' % (level, key, type(value), value))
            if hasattr(value, 'keys') or hasattr(value, '__iter__'):
                children = FlxModel.processMulti(value, level - 1)
                d[key] = children
            elif isinstance(value, FlxModel):
                child = value.asDict(level - 1, top=False)
                d[key] = child
            else:
                #log.debug('asDict[%d]: single key[%s] value[%s]' % (level, key, value))
                d[key] = value
        return d

    @classmethod
    def getMongoDB(cls):
        if not cls.mongodb:
            cls.mongodb = getMongoDBConnection(config)
        return cls.mongodb

class Artifact(FlxModel):

    def __init__(self, **kw):
        FlxModel.__init__(self, **kw)

    def getId(self):
        return self.id

    def getEncodedId(self):
        return self.encodedID

    def getOwnerId(self):
        return self.creatorID

    def getArtifactType(self):
        return self.type.name

    def getModality(self):
        return 1 if self.type.modality else 0

    def getAuthors(self):
        authors = []
        for author in self.authors:
            d = {}
            d['name'] = author.name
            d['artifactID'] = author.artifactID
            d['roleID'] = author.roleID
            if author.role:
                d['role'] = author.role.name
            d['sequence'] = author.sequence
            authors.append(d)
        return authors

    def getCreator(self):
        if not hasattr(self, 'creator'):
            self.creator = Member.cache(LOAD, id=self.creatorID)
        self.creator = self.creator.fix()
        name = self.creator.name
        if not name or name.strip() == '':
            name = self.creator.email
        return name
    
    def getCreatorAuthID(self):
        return self.creatorID

    def getTitle(self):
        return stripChapterName(self.name)

    def getHandle(self):
        return self.handle

    def setTitle(self, title):
        self.name = title

    def getSummary(self):
        return self.description

    def getMessageToUsers(self, revision=None):
        if revision is None:
            revision = self.revisions[0]

        return revision.getMessageToUsers()

    def setSummary(self, summary):
        self.description = summary

    def getCreated(self):
        return self.creationTime

    def getModified(self):
        return self.updateTime

    def getLastUpdateTime(self):
        return self.updateTime if self.updateTime > self.revisions[0].creationTime else self.revisions[0].creationTime

    def getRelatedDomainTerm(self):
        session = meta.Session()
        query = session.query(RelatedArtifactsAndLevels).filter(RelatedArtifactsAndLevels.id == self.id)
        ## Try for real domains first
        query = query.filter(not_(RelatedArtifactsAndLevels.domainEID.ilike('UGC.UBR.%%')))
        r = query.first()
        if r:
            if not r.conceptCollectionHandle:
                from flx.model import migrated_concepts as mc 
                supercedingConcept = mc._getSupercedingConcept(session, encodedID=r.domain.encodedID, artifactID=self.id)
                if supercedingConcept:
                    return supercedingConcept
            return r.domain
        else:
            ## PseudoDomains - if not real domains
            r = session.query(RelatedArtifactsAndLevels).filter(RelatedArtifactsAndLevels.id == self.id).first()
            return r.domain if r else None
        return None

    def getDomains(self):
        rdomains = []
        session = meta.Session()
        query = session.query(RelatedArtifact)
        query = query.filter(RelatedArtifact.artifactID == self.id)
        domainIDsEncountered = set([])
        for r in query.all():
            if r:
                domain = r.domain
                if not domain.encodedID.startswith('UGC.UBR.'):
                    from flx.model import migrated_concepts as mc 
                    supercedingConcept = mc._getSupercedingConcept(session, encodedID=r.domain.encodedID, artifactID=self.id)
                    if supercedingConcept:
                        domain = supercedingConcept
                if domain.id not in domainIDsEncountered:
                    rdomains.append(domain)
                    domainIDsEncountered.add(domain.id)
        return rdomains

    def getDomain(self, recursive=True):
        term = self.getRelatedDomainTerm()
        return self._getDomainTermDict(term, recursive=recursive, returnSupercedingConcept=False)

    def _getDomainTermDict(self, term, recursive=True, returnSupercedingConcept=True):
        if term:
            if returnSupercedingConcept:
                from flx.model import migrated_concepts as mc 
                supercedingConcept = mc._getSupercedingConcept(meta.Session(), encodedID=term.encodedID, artifactID=self.id)
                if supercedingConcept:
                    term = supercedingConcept
            d = term.asDict()
            if recursive:
                d['parent'] = None
                p = term.parent
                pDict = d
                while p:
                    pDict['parent'] = p.asDict()
                    pDict = pDict['parent']
                    p = p.parent
            return d
        return None


    def getFoundationGrid(self):
        from flx.model import migrated_concepts as mc
        eids = set()
        foundationGrid = []
        session = meta.Session()
        relatedEids = session.query(RelatedArtifactsAndLevels.domainEID).distinct().filter(and_(RelatedArtifactsAndLevels.id == self.id, not_(RelatedArtifactsAndLevels.domainEID.ilike('UGC.UBR.%%')))).all() 
        for (relatedEid,) in relatedEids:
            term = session.query(BrowseTerm).filter(and_(BrowseTerm.termTypeID == 4, BrowseTerm.encodedID == relatedEid)).first()
            if term:
                supercedingConcept = mc._getSupercedingConcept(session, term.encodedID, artifactID=self.id)
                if supercedingConcept:
                    term = supercedingConcept
                if not term.encodedID in eids:
                    eids.add(term.encodedID)
                    foundationGrid.append((term.id, term.name, term.encodedID, term.handle, getBranchHandle(term.encodedID)))
        return foundationGrid

    def getTagGrid(self):
        tagGrid = []
        for term in self.tagTerms:
            tagGrid.append((term.id, term.name))
        return tagGrid

    def getInternalTagGrid(self):
        internalTagGrid = []
        for term in self.browseTerms:
            if term.type.name == 'internal-tag':
                internalTagGrid.append((term.id, term.name))
        return internalTagGrid

    def getGradeLevelGrid(self):
        gradesGrid = []
        for term in self.browseTerms:
            if term.type.name == 'grade level':
                gradesGrid.append((term.id, term.name))
        return sortGradesDict(gradesGrid)

    def getSubjectGrid(self):
        subjectGrid = []
        for term in self.browseTerms:
            if term.type.name == 'subject':
                subjectGrid.append((term.id, term.name))
        return subjectGrid

    def getStateGrid(self):
        stateGrid = []
        for term in self.browseTerms:
            if term.type.name == 'state':
                stateGrid.append((term.id, term.name))
        return stateGrid

    def getStandardBoardByName(self, boardName):
        session = meta.Session()
        query = session.query(StandardBoard)
        query = query.prefix_with('SQL_CACHE')
        return query.filter(StandardBoard.name == boardName).one()

    def getStandardGrid(self, revision=None):

        mygrid = grid = {}
        #if revision is None:
        #    revision = self.revisions[0]
        ## Disable revision grid for now
        #grid = revision.getStandardGrid()
        for bt in self.browseTerms:
            if bt.type.name == 'domain':
                board = None
                if bt.encodedID:
                    if bt.encodedID.startswith('MAT.'):
                        board = self.getStandardBoardByName(boardName='CCSS')
                    elif bt.encodedID.startswith('SCI.'):
                        board = self.getStandardBoardByName(boardName='NGSS')
                    if board:
                        log.debug("Using board: %s" % board.id)
                        mygrid = getStandardGrid(bt.standards, standardBoardID=board.id, includeDescription=True)
                        ## Merge the revision grid with domain grid
                        if grid:
                            for k in mygrid.keys():
                                if not grid.has_key(k):
                                    grid[k] = []
                                grid[k].extend(mygrid[k])
                        else:
                            grid = mygrid
        return grid

    def getSearchGrid(self):
        searchGrid = []
        for term in self.searchTerms:
            searchGrid.append((term.id, term.name))
        return searchGrid

    def getStandardTerms(self, revision=None):
        if revision is None:
            revision = self.revisions[0]

        terms = revision.getStandardTerms()
        sterms = {}
        for t in terms:
            sterms[t] = t

        for bt in self.browseTerms:
            if bt.type.name == 'domain':
                myterms = getStandardTerms(bt.standards)
                for t in myterms:
                    sterms[t] = t
        return sterms.keys()

    def getLevel(self):
        for bt in self.browseTerms:
            if bt.type.name == 'level':
                return bt.name.lower()
        return None

    def getContributorTerm(self):
        for bt in self.browseTerms:
            if bt.type.name == 'contributor':
                return bt.name.lower()
        return None

    def getStatistics(self, revision=None):
        if revision is None:
            revision = self.revisions[0]

        return revision.getStatistics()

    def getRating(self, revision=None):
        if revision is None:
            revision = self.revisions[0]
        return revision.getRating()

    def getResourceRevision(self, revision, uriType):
        if revision is None:
            revision = self.revisions[0]

        return revision.getResourceRevision(uriType)

    def getResourcesRevision(self, revision, uriType):
        if revision is None:
            revision = self.revisions[0]

        return revision.getResourcesRevision(uriType)

    def getUri(self, revision, uriType):
        resourceRevision = self.getResourceRevision(revision, uriType)
        if resourceRevision is None:
            return None

        return resourceRevision.resource.getUri()

    def getContentsUri(self, revision=None):
        if revision is None:
            revision = self.revisions[0]
        contentUri = self.getUri(revision, 'contents')
        return contentUri
    
    def getCoverImageUri(self, revision=None):
        if revision is None:
            revision = self.revisions[0]
        coverImageUri = revision.getCoverImageUri()
        return coverImageUri

    def getCoverVideoUri(self, revision=None):
        if revision is None:
            revision = self.revisions[0]
        coverVideoUri = revision.getCoverVideoUri()
        return coverVideoUri

    def getContentInfo(self, revision=None):
        resourceRevision = self.getResourceRevision(revision, 'contents')
        if resourceRevision is None:
            return 0, None
        id = resourceRevision.id
        uri = resourceRevision.resource.uri
        return id, uri

    def getXhtml(self, revision=None, withMathJax=False, includeChildContent=False, includeChildHeaders=False, includePracticeLinks=False, replaceMathJax=False):
        if revision is None:
            revision = self.revisions[0]

        return revision.getXhtml(withMathJax=withMathJax,
                                 includeChildContent=includeChildContent, includeChildHeaders=includeChildHeaders, includePracticeLinks=includePracticeLinks, replaceMathJax=replaceMathJax)

    def getBrowseTerms(self, idOnly=False):
        termList = []
        seenTerms = set()
        terms = [ term.asDict() for term in self.browseTerms]
        terms.extend([d.asDict() for d in self.getDomains()])
        for browseTerm in terms:
            if browseTerm['id'] not in seenTerms:
                seenTerms.add(browseTerm['id'])
                if idOnly:
                    termList.append(browseTerm['id'])
                else:
                    termList.append(browseTerm)
        return termList

    def getTagTerms(self, idOnly=False):
        termList = []
        for tagTerm in self.tagTerms:
            if idOnly:
                termList.append(tagTerm.id)
            else:
                termList.append(tagTerm.asDict())
        return termList

    def getSearchTerms(self, idOnly=False):
        termList = []
        for searchTerm in self.searchTerms:
            if idOnly:
                termList.append(searchTerm.id)
            else:
                termList.append(searchTerm.asDict())
        return termList

    def getChildList(self, revision=None, levels=0, childDict=None):
        if revision is None:
            revision = self.revisions[0]

        if childDict and childDict.has_key(revision.id):
            childList = childDict[revision.id]
        else:
            childList = None
        if levels <= 0 and childDict is not None:
            return childList

        return revision.getChildList(levels=levels, childList=childList)

    def getChildren(self, revision=None):
        if revision is None:
            revision = self.revisions[0]

        return revision.getChildren()

    def getLicense(self):
        return self.license.name if self.license else None

    def getLanguage(self):
        return self.language.name if self.language else None

    def _aggregateArtifactRating(self, artifactRatings):
        """
            Return the aggregate rating for an artifact
        """
        ratingDict = {}
        for i in range(1,6):
            ratingDict[str(i)] = 0
        ratingDict['average'] = 0
        totalCount = 0
        totalRating = 0
        for eachArtifactRating in artifactRatings:
            count = eachArtifactRating.count
            rating = eachArtifactRating.score
            ratingDict[str(rating)] = count
            totalCount = totalCount + count
            totalRating = totalRating + count*rating
        if totalCount != 0:
            ratingDict['average'] = round(totalRating/float(totalCount), 1)
        ratingDict['count'] = totalCount
        return ratingDict

    def _aggregateArtifactVoting(self, artifactVotings):
        """
            Return the aggregate voting for an artifact
        """
        votingDict = {}
        votingDict['like'] = 0
        votingDict['dislike'] = 0
        for eachArtifactVoting in artifactVotings:
            if eachArtifactVoting.score == -1:
                votingDict['dislike'] = eachArtifactVoting.count
            elif eachArtifactVoting.score == 1:
                votingDict['like'] = eachArtifactVoting.count
        return votingDict

    def _calculateLDLScore(self, likes, dislikes, feedback_cap):

        if likes == 0:
            likes = 0.1
        if dislikes == 0:
            dislikes = 0.1

        total_feedback = likes + dislikes

        if likes == dislikes:
            l_dl_score = 0
        elif total_feedback <= 10 and total_feedback >= feedback_cap:
            l_dl_score = min(likes - dislikes, 4)
        else:
            l_dl_score = min( pow( (likes/dislikes), (likes-dislikes)/abs(likes-dislikes) ), 4) * (likes-dislikes)/abs(likes-dislikes)
            l_dl_score = l_dl_score * min( (total_feedback)/feedback_cap, 1)
        return l_dl_score

    def getScore(self):
        lowFeedbackCap = 1
        highFeedbackCap = 50
        lScoreCap = 20
        lowLDLWeight = 0.4
        highLDLWeight = 0.3
        lWeight = 0.3

        score = 0.0
        artifactFeedback = self.getFeedbacks()
        if 'voting' not in artifactFeedback:
            return score
        artifactVoting = artifactFeedback['voting']
        likes = artifactVoting.get('like', 0)
        dislikes = artifactVoting.get('dislike', 0)
        if likes <= 1 and dislikes <= 1:
            return score

        likes = float(likes)
        dislikes = float(dislikes)

        lowLDLScore = self._calculateLDLScore(likes, dislikes, lowFeedbackCap)
        lScore = min((likes/lScoreCap)*4,  4)
        highLDLScore = self._calculateLDLScore(likes, dislikes, highFeedbackCap)

        finalScore = (lowLDLScore*lowLDLWeight + lScore*lWeight + highLDLScore*highLDLWeight)*25
        return finalScore

    def getViews(self, db):
        """Get the artifact views.
        """
        kwargs = {}
        kwargs['artifact_id'] = self.getId()
        artifact_views = artifactviews.ArtifactViews(db).getArtifactViews(**kwargs)
        return artifact_views

    def getFeedbacks(self):
        feedbackDict = {}
        artifactRating = []
        artifactVoting = []
        for eachFeedback in self.feedbacks:
            if eachFeedback.type == 'rating':
                artifactRating.append(eachFeedback)
            elif eachFeedback.type == 'vote':
                artifactVoting.append(eachFeedback)
        ratingDict = self._aggregateArtifactRating(artifactRating)
        votingDict = self._aggregateArtifactVoting(artifactVoting)
        feedbackDict['rating'] = ratingDict
        feedbackDict['voting'] = votingDict
        return feedbackDict

    def asContentDict(self, 
                      revision=None, 
                      withMathJax=False, 
                      artifactDict=None, 
                      includeChildContent=False, 
                      includeChildHeaders=False,
                      includePracticeLinks=False,
                      replaceMathJax=False,
                      resourceInfo=None,
                      memberID=None):
        if artifactDict is None:
            artifactDict = self.asDict(revision=revision, memberID=memberID)

        if revision is None:
            revision = self.revisions[0]

        artifactDict['revision'] = revision.revision

        xhtml = revision.getXhtml(withMathJax=withMathJax, includeChildContent=includeChildContent, includeChildHeaders=includeChildHeaders, includePracticeLinks=includePracticeLinks, replaceMathJax=replaceMathJax, resourceInfo=resourceInfo)
        if xhtml is not None:
            artifactDict['xhtml'] = xhtml
        
        ## Do not include details for children - only the info
        if includeChildContent and revision.children is not None:
            artifactDict['children'] = artifactDict['revisions'][0]['children']
        return artifactDict

    def getPermaParts(self):
        handle = self.getHandle()
        if handle is None or handle == '':
            handle = self.name.replace(' ', '-')
        return handle, self.artifactTypeID, self.creatorID

    def getPerma(self, realmFirst=False, qualified=False, realmPos=2):
        login = None
        name = self.creator.login
        if name is None or name == '':
            name = self.creator.name.replace(' ', '')
        login = name

        handle = self.getHandle()
        if handle is None or handle == '':
            handle = self.name.replace(' ', '-')
        artifactType = self.type.name
        return getArtifactPerma(login, handle, artifactType, realmFirst=realmFirst, qualified=qualified, realmPos=realmPos)

    def asDict(self,
               revisions=None,
               revision=None,
               levels=0,
               feedbacks=None,
               standardGrid=None,
               foundationGrid=None,
               tagGrid=None,
               internalTagGrid=None,
               gradeGrid=None,
               stateGrid=None,
               subjectGrid=None,
               searchGrid=None,
               resourceInfo=None,
               childList=None, 
               parentList=None,
               latestRevisionOnly=True,
               memberID=None,
               includeRevisions=True,
               includeFeedbacks=True):
        if hasattr(self, 'cacheDict'):
            return self.cacheDict

        artifactDict = {}
        artifactDict['artifactType'] = self.getArtifactType()
        artifactDict['type'] = self.type.asDict()
        artifactDict['id'] = self.getId()
        artifactDict['artifactID'] = self.getId()
        artifactDict['encodedID'] = self.getEncodedId()
        artifactDict['authors'] = self.getAuthors()
        artifactDict['creator'] = self.getCreator()
        artifactDict['creatorID'] = self.creatorID
        artifactDict['creatorAuthID'] = self.getCreatorAuthID()
        artifactDict['creatorLogin'] = self.creator.login
        artifactDict['title'] = self.getTitle()
        artifactDict['license'] = self.getLicense()
        artifactDict['language'] = self.getLanguage()
        artifactDict['isModality'] = self.getModality()
        #
        #  Figure out the realm.
        #
        global ck12Editor
        if ck12Editor is None:
            ck12Editor = config.get('ck12_editor', 'ck12editor')
        if self.creator.login == ck12Editor:
            artifactDict['realm'] = None
        else:
            name = self.creator.login
            if name is None or name == '':
                name = self.creator.name.replace(' ', '')
            artifactDict['realm'] = 'user:%s' % name

        artifactDict['handle'] = self.getHandle()
        artifactDict['perma'] = self.getPerma()
        artifactDict['summary'] = self.getSummary()
        artifactDict['messageToUsers'] = self.getMessageToUsers()
        artifactDict['created'] = self.getCreated()
        artifactDict['modified'] = self.getModified()
        if foundationGrid is None:
            artifactDict['foundationGrid'] = self.getFoundationGrid()
        else:
            artifactDict['foundationGrid'] = foundationGrid
        if tagGrid is None:
            artifactDict['tagGrid'] = self.getTagGrid()
        else:
            artifactDict['tagGrid'] = tagGrid
        if internalTagGrid is None:
            artifactDict['internalTagGrid'] = self.getInternalTagGrid()
        else:
            artifactDict['internalTagGrid'] = internalTagGrid

        if gradeGrid is None:
            artifactDict['gradeGrid'] = self.getGradeLevelGrid()
        else:
            artifactDict['gradeGrid'] = sortGradesDict(gradeGrid)
        if stateGrid is None:
            artifactDict['stateGrid'] = self.getStateGrid()
        else:
            artifactDict['stateGrid'] = stateGrid
        if subjectGrid is None:
            artifactDict['subjectGrid'] = self.getSubjectGrid()
        else:
            artifactDict['subjectGrid'] = subjectGrid
        if searchGrid is None:
            artifactDict['searchGrid'] = self.getSearchGrid()
        else:
            artifactDict['searchGrid'] = searchGrid

        
        if revisions is None:
            revisions = self.revisions
        elif type(revisions).__name__ != 'list':
            revisions = [ revisions ]
        revisionReceived = True;
        if revision is None :
            revisionReceived = False;
            revision = revisions[0]

        if standardGrid is None:
            artifactDict['standardGrid'] = self.getStandardGrid()
        else:
            artifactDict['standardGrid'] = standardGrid

        artifactDict['level'] = self.getLevel()
        artifactDict['domain'] = self.getDomain()
        artifactDict['contributor'] = self.getContributorTerm()
        artifactDict['exerciseCount'] = 0 #self.getExerciseCount()
        if self.type.modality:
            artifactDict['collections'] = self.getAssociatedCollections(collectionCreatorID=3)
        
        artifactRevisionID = revision.id
        coverImage = revision.getCoverImageUri(resourceInfo=resourceInfo)
        coverImageSatelliteUrl = revision.getCoverImageSatelliteUri()        
        artifactDict['artifactRevisionID'] = artifactRevisionID
        if coverImage is not None :
            artifactDict['coverImage'] = coverImage
        if coverImageSatelliteUrl is not None :
            artifactDict['coverImageSatelliteUrl'] = coverImageSatelliteUrl
        
        # new save api requirement
        coverImageResourceID = revision.getCoverImageResourceID()
        if coverImageResourceID:
            artifactDict['coverImageResourceID'] = coverImageResourceID


        artifactDict['latestRevision'] = self.revisions[0].revision
        artifactDict['latestRevisionID'] = self.revisions[0].id

        if includeRevisions:
            revisionList = []
            if revisionReceived :
                revisionList.append(revision.asDict(levels=levels,
                                                        revisions=revisions,
                                                        feedbacks=feedbacks,
                                                        resourceInfo=resourceInfo,
                                                        childList=childList,
                                                        parentList=parentList,
                                                        memberID=memberID))
            else :
                for revision in revisions:
                    revisionList.append(revision.asDict(levels=levels,
                                                            revisions=revisions,
                                                            feedbacks=feedbacks,
                                                            resourceInfo=resourceInfo,
                                                            childList=childList,
                                                            parentList=parentList,
                                                            memberID=memberID))
                    if latestRevisionOnly:
                        break
            artifactDict['revisions'] = revisionList
            
        if includeFeedbacks:
            artifactDict['feedbacks'] =  self.getFeedbacks()
        
        if self.type.name == 'assignment':
            #
            #  Get extra data for assignment.
            #
            session = meta.Session()
            query = session.query(Assignment)
            query = query.filter_by(assignmentID=self.id)
            assignment = query.one()
            artifactDict['assignment'] = assignment.asDict()
        return artifactDict

    def getAssociatedCollections(self, collectionCreatorID=3):
        session = meta.Session()
        query = session.query(RelatedArtifact)
        query = query.filter(RelatedArtifact.artifactID == self.id)
        query = query.filter(and_(RelatedArtifact.conceptCollectionHandle != None, RelatedArtifact.conceptCollectionHandle != ''))
        if collectionCreatorID:
            query = query.filter(RelatedArtifact.collectionCreatorID == collectionCreatorID)
        collections = []
        for r in query.all():
            if r.conceptCollectionHandle:
                log.debug("conceptCollectionHandle: %s, collectionCreatorID: %s" % (r.conceptCollectionHandle, r.collectionCreatorID))
                collectionHandle, conceptCollectionAbsoluteHandle = h.splitConceptCollectionHandle(r.conceptCollectionHandle)
                collection = collectionNode.CollectionNode(Artifact.getMongoDB()).getByConceptCollectionHandle(conceptCollectionHandle=r.conceptCollectionHandle, collectionCreatorID=r.collectionCreatorID)
                if not collection:
                    log.warn("Cannot find an entry for conceptCollectionHandle[%s], collectionCreatorID[%s]" % (r.conceptCollectionHandle, r.collectionCreatorID))
                    continue

                c = { 
                        'collectionHandle': collectionHandle, 
                        'collectionTitle': collection['collection']['title'],
                        'conceptCollectionAbsoluteHandle': conceptCollectionAbsoluteHandle, 
                        'conceptCollectionTitle': collection['title'],
                        'encodedID': collection['encodedID'],
                        'collectionCreatorID': r.collectionCreatorID,
                        'isCanonical': r.collectionCreatorID == 3 and collectionHandle in BRANCH_ENCODEDID_MAPPING.values()
                    }
                collections.append(c)
        return collections

    def getExerciseCount(self):
        cnt = 0
        try:
            domains = self.getDomains()
            if self.type.name in ['lesson'] and domains:
                domainIDs = [ x.id for x in domains ]
                if domainIDs:
                    session = meta.Session()
                    exTypeID = session.query(ArtifactType.id).filter(ArtifactType.name == 'exercise').first()
                    cnt = session.query(RelatedArtifactsAndLevels.id).filter(
                            and_(RelatedArtifactsAndLevels.domainID.in_(domainIDs),
                                RelatedArtifactsAndLevels.artifactTypeID == exTypeID.id)).count()
        except Exception as e:
            log.error("Failed  getting exercise count for %s" % self.id, exc_info=e)
            pass
        return cnt

    def getAssessments(self):
        assessments = []
        try:
            domains = self.getDomains()
            if self.type.name in ['lesson'] and domains:
                domainIDs = [ x.id for x in domains ]
                if domainIDs:
                    session = meta.Session()
                    exTypeID = session.query(ArtifactType.id).filter(ArtifactType.name == 'asmtpractice').first()
                    query = session.query(RelatedArtifactsAndLevels.id, RelatedArtifactsAndLevels.handle, RelatedArtifactsAndLevels.domainTerm, RelatedArtifactsAndLevels.domainHandle, RelatedArtifactsAndLevels.domainEID).filter(
                            and_(RelatedArtifactsAndLevels.domainID.in_(domainIDs),
                                RelatedArtifactsAndLevels.artifactTypeID == exTypeID.id, RelatedArtifactsAndLevels.creatorID == 3))
                    assessments = query.all()
        except Exception as e:
            log.error("Failed  getting exercise count for %s" % self.id, exc_info=e)
            pass
        return assessments

class ArchivedMemberStudyTrackItemStatus(FlxModel):
    pass

class ArtifactHandle(FlxModel):
    pass

class ArtifactAuthor(FlxModel):
    pass

class ArtifactAttributer(FlxModel):
    pass

class ArtifactContributionType(FlxModel):
    pass

class FeaturedArtifact(FlxModel):
    pass

class TypedFeaturedArtifact(FlxModel):
    pass

class ArtifactHasBrowseTerms(FlxModel):
    pass

class ArtifactHasTagTerms(FlxModel):
    pass

class ArtifactHasSearchTerms(FlxModel):
    pass

class StopWord(FlxModel):
    pass

def getRevisions(session, idList):
    if idList is None or len(idList) == 0:
        return []

    query = session.query(ArtifactRevision).distinct()
    query = query.filter(ArtifactRevision.id.in_(idList))
    revisions = query.all()
    return revisions

def getRevisionStructs(revisions, childList=None):
    revisionDict = {}
    revisionArtifactDict = {}
    for revision in revisions:
        artifactID = revision.artifactID
        revisionArtifactDict[revision.id] = artifactID
        if not revisionDict.has_key(artifactID):
            revisionDict[artifactID] = []
        revisionDict[artifactID].append(revision)
    return revisionDict, revisionArtifactDict

def getChildDict(session, revisionIDList):
    if revisionIDList is None or len(revisionIDList) == 0:
        return {}

    query = session.query(ArtifactRevisionRelation)
    query = query.filter(ArtifactRevisionRelation.artifactRevisionID.in_(revisionIDList)).order_by(ArtifactRevisionRelation.artifactRevisionID, ArtifactRevisionRelation.sequence)
    children = query.all()
    childDict = {}
    for child in children:
        revID = child.artifactRevisionID
        if not childDict.has_key(revID):
            childDict[revID] = []
        childDict[revID].append(child.hasArtifactRevisionID)
    return childDict

def getResourceInfo(session, revisionIDList):
    if revisionIDList is None or len(revisionIDList) == 0:
        return {}

    query = session.query(RevisionAndResources).distinct()
    query = query.filter(RevisionAndResources.revID.in_(revisionIDList))
    resourceRevisions = query.all()

    resourceIDList = []
    for resourceRevision in resourceRevisions:
        resourceIDList.append(resourceRevision.resourceID)

    if len(resourceIDList) == 0:
        return {}
    query = session.query(Resource).distinct()
    query = query.filter(Resource.id.in_(resourceIDList))
    resources = query.all()
    resourceDict = {}
    for resource in resources:
        resourceDict[resource.id] = resource

    resourceRevisionDict = {}
    for resourceRevision in resourceRevisions:
        revID = resourceRevision.revID
        if not resourceRevisionDict.has_key(revID):
            resourceRevisionDict[revID] = {}
        id = resourceRevision.id
        resourceRevisionDict[revID][id] = [ resourceRevision, resourceDict[resourceRevision.resourceID] ]
    log.debug("resourceRevisionDict: %s" % resourceRevisionDict)
    return resourceRevisionDict

class ArtifactRevision(FlxModel):
    def getMessageToUsers(self):
        return self.messageToUsers

    def getStandardGrid(self, standardBoardID=None, includeDescription=False):
        return getStandardGrid(self.standards, standardBoardID=standardBoardID, includeDescription=includeDescription)

    def getStandardTerms(self):
        return getStandardTerms(self.standards)

    def getStatistics(self):
        return { 'downloads': self.downloads }

    def getRating(self, feedbacks=None):
        if feedbacks is None:
            feedbacks = self.feedbacks

        if feedbacks is None or len(feedbacks) == 0:
            return ''
        sum = 0
        for feedback in feedbacks:
            sum += feedback.rating
        rating = sum / len(feedbacks)
        return rating

    def getResourceRevision(self, uriType, resourceInfo=None):

        def getResourcesFromArtifactRevisionID(artifactRevisionID):
            session = meta.Session()
            subQuery = session.query(ArtifactRevisionHasResources)
            subQuery = subQuery.filter_by(artifactRevisionID=artifactRevisionID)
            subQuery = subQuery.order_by(ArtifactRevisionHasResources.resourceRevisionID)
            subQuery = subQuery.subquery()
            query = session.query(ResourceRevision)
            query = query.join(subQuery, ResourceRevision.id == subQuery.c.resourceRevisionID)
            return query.all()

        def getResource(resourceRevision):
            if resourceRevision.resource:
                return resourceRevision.resource

            session = meta.Session()
            query = session.query(Resource)
            query = query.filter_by(id = resourceRevision.resourceID)
            resource = query.one()
            return resource

        if resourceInfo is not None:
            keys = sorted(resourceInfo.keys(), reverse=True)
            for key in keys:
                info = resourceInfo[key]
                resource = info[1]
                if resource.type.name == uriType:
                    return info[0]
        else:
            if len(self.resourceRevisions) == 0:
                self.resourceRevisions = getResourcesFromArtifactRevisionID(self.id)
            for resourceRevision in self.resourceRevisions:
                resource = getResource(resourceRevision)
                if resource.type.name == uriType:
                    return resourceRevision
        return None

    def getResourcesRevision(self, uriType, resourceInfo=None):
        resourcesRevision = []
        if resourceInfo is not None:
            keys = resourceInfo.keys()
            for key in keys:
                info = resourceInfo[key]
                resource = info[1]
                if resource.type.name == uriType:
                    resourcesRevision.append(info[0])
        else:
            for resourceRevision in self.resourceRevisions:
                resource = resourceRevision.resource
                if resource.type.name == uriType:
                    resourcesRevision.append(resourceRevision)
        return resourcesRevision

    def getResources(self, uriType, resourceInfo=None):
        resources = []
        if resourceInfo is not None:
            keys = resourceInfo.keys()
            for key in keys:
                info = resourceInfo[key]
                resource = info[1]
                if resource.type.name == uriType:
                    resources.append(resource)
        else:
            for resourceRevision in self.resourceRevisions:
                resource = resourceRevision.resource
                if resource.type.name == uriType:
                    resources.append(resource)
        return resources

    def getUri(self, uriType, resourceInfo=None, unresolved=False, satelliteUrl=False):
        """
            Get the uri for given uriType
            If unresolved is True, the uri will be returned as-is from the database
            Otherwise, (default) the uri is resolved to replace image host name etc.
        """
        resourceRevision = self.getResourceRevision(uriType,
                                                    resourceInfo=resourceInfo)
        if resourceRevision is None:
            artifact_name = self.artifact.type.name
            if artifact_name in ("book", "chapter", "lesson"):
                if satelliteUrl:
                    return config.get('default_cover_%s_satellite_url' % artifact_name)
                else:
                    return config.get('default_cover_%s' % artifact_name)
            return None

        if satelliteUrl:
            return resourceRevision.resource.satelliteUrl

        if resourceInfo is not None:
            return resourceInfo[resourceRevision.id][1].getUri(unresolved=unresolved, perma=True)

        return resourceRevision.resource.getUri(unresolved=unresolved, perma=True)

    def getCoverImageResourceID(self):
        resourceRevision = self.getResourceRevision('cover page')
        return None if resourceRevision is None else resourceRevision.resource.id

    def getCoverImageUri(self, resourceInfo=None, unresolved=False, returnWithID=False):
        coverImageUri = self.getUri('cover page', resourceInfo, unresolved=unresolved)
        if returnWithID:
            resourceRevision = self.getResourceRevision('cover page')
            id = None
            if resourceRevision is None:
                id = None
            else:
                id = resourceRevision.id
            return coverImageUri,id
        else:
            return coverImageUri

    def getCoverImageSatelliteUri(self):
        return self.getUri('cover page', satelliteUrl=True)

    def getCoverVideoUri(self, resourceInfo=None, unresolved=False):
        coverVideoUri = self.getUri('cover video', resourceInfo, unresolved=unresolved)
        return coverVideoUri

    def getCoverVideoDescription(self, resourceInfo=None):
        resourceRevision = self.getResourceRevision('cover video',
                                                    resourceInfo=resourceInfo)
        if resourceRevision is None:
            return None
        if resourceInfo is not None:
            resource = resourceInfo[resourceRevision.id][1]
        else:
            resource = resourceRevision.resource
        description = resource.description
 
        return description

    def getXhtmlFromResourceRevision(self, resourceRevision, resourceInfo=None, considerContentResourceOnly=False):
        if resourceRevision is None:
            if considerContentResourceOnly is True:
                return None
            else:
                # No XHTML resource exists. Lets to ahead and create an XHTML with a link to the resource perma
                artifactType = self.artifact.type.name
                artifactTitle = self.artifact.name
                resourcePerma = None
                if artifactType in ['asmtpractice', 'book']:
                    return None
                skipResources = ['contents', 'cover page', 'cover page icon', 'cover video', 'answer key', 'answer demo', 'assessment bundle']
                htmlTemplate = '''
                <!--This is not content XHTML. Ignore-->
                <title> %(artifactTitle)s </title>
                <h2> %(artifactTitle)s </h2>
                <p id="x-ck12-NWE5ZjJiZWFiNGE0NWZjODIxNDllMjIyMDk4NDlmZDA.-l8a">This content is available online at www.ck12.org. Please <a href="%(resourcePerma)s">click here</a> to view or download the content</p>
                '''
                resourceRevisions = self.resourceRevisions
                for eachResourceRevision in resourceRevisions:
                    resourceType = eachResourceRevision.resource.type.name
                    log.info('Generating XHTML for resourceType: [%s]' %(resourceType))
                    if resourceType in skipResources:
                        continue
                    if resourceType == 'video':
                        resourcePerma = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                        break
                    if resourceType == 'audio':
                        resourcePerma = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                        break
                    if resourceType == 'web':
                        resourcePerma = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                        break
                    if resourceType == 'attachment':
                        resourcePerma = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                        break
                    if resourceType == 'quiz':
                        resourcePerma = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                        break
                    else:
                        resourcePerma = eachResourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                        break
                params = {"artifactTitle":artifactTitle, "artifactType": artifactType, "resourcePerma":resourcePerma}
                if resourcePerma:
                    htmlTemplate = htmlTemplate %(params)
                    document = h.transform_to_xhtml(htmlTemplate)
                    return document

                return None
        #
        #  Check if it's abused. If so, return the placeholder instead.
        #
        if resourceRevision.isContentAbused():
            return resourceRevision.getPlaceholder()

        if resourceInfo is not None:
            resource = resourceInfo[resourceRevision.id][1]
        else:
            resource = resourceRevision.resource
        uri = resource.uri
        if uri is None:
            return None

        revNo = resourceRevision.revision
        #
        #  TODO:  Should use the artifact creator instead of the resource
        #         owner in the future. Need to make the copy over during
        #         creation though.
        #
        from flx.model.vcs import vcs as v
        vcs = v.vcs(resource.ownerID, session=meta.Session())
        xhtml = h.safe_decode(vcs.get(uri, revNo=revNo))
        return xhtml

    def getXhtml(self, withMathJax=False, resourceInfo=None, includeChildContent=False, includeChildHeaders=False, includePracticeLinks=False, replaceMathJax=False, considerContentResourceOnly=False, resolveChildConceptContent=False, considerMultipleContentResources=False, processXhtmlForWrappingInContentComments=True):
        if considerMultipleContentResources:
            resourceRevisions = self.getResourcesRevision('contents', resourceInfo=resourceInfo)
            self.xhtml = None
            for resourceRevision in resourceRevisions:
                self.xhtml = self.getXhtmlFromResourceRevision(resourceRevision, resourceInfo, considerContentResourceOnly)  
                if self.xhtml:
                    break
        else:
            resourceRevision = self.getResourceRevision('contents', resourceInfo=resourceInfo)
            self.xhtml = self.getXhtmlFromResourceRevision(resourceRevision, resourceInfo, considerContentResourceOnly)
        
        if resolveChildConceptContent and self.xhtml:
            conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
            conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
            conceptStartXHTML = re.search(conceptStartXHTML, self.xhtml)
            conceptEndXHTML = re.search(conceptEndXHTML, self.xhtml)
            if conceptStartXHTML and conceptEndXHTML:
                self.xhtml = self.xhtml[:conceptStartXHTML.start()]+"""<div class="x-ck12-data-concept"><!--<concept />--></div>"""+self.xhtml[conceptEndXHTML.end():]
        if includeChildContent:
            self._processXhtml(includePracticeLinks=includePracticeLinks, considerContentResourceOnly=considerContentResourceOnly, considerMultipleContentResources=considerMultipleContentResources)

        if processXhtmlForWrappingInContentComments:
            self.xhtml = h.processLessonXhtmlForWrappingInContentComments(self.xhtml)

        if includeChildHeaders:
            self._includeChildHeaders()
        if replaceMathJax:
            self._replaceMathJax()
        if withMathJax:
            self.xhtml = h.replace_math(self.xhtml)
        self.xhtml = h.safe_decode(self.xhtml)
        return self.xhtml

    CK12_DATA_START = re.compile(r'<div class="x-ck12-data[0-9a-z\-]*">')
    CK12_DATA_END = '</div>'
    CONCEPT_REGEX = re.compile(r'<concept\s*/>')
    LESSON_REGEX = re.compile(r'<lessons\s*/>')
    SECTION_REGEX = re.compile(r'<sections\s*/>')

    def _replaceMathJax(self):

        log.info('Replacing mathJax')
        xhtml = self.xhtml
        if not xhtml:
            return
        img_template = '<img src="%(src)s" class="%(format)s" alt="%(alt)s" />'

        edit_html_re = re.compile('data-edithtml=\"(.*?)\"', re.DOTALL)
        edit_htmls = edit_html_re.findall(xhtml)

        i = 0
        soup = BeautifulSoup(xhtml)
        for each_new_math in soup.findAll('span', {'class': "x-ck12-mathEditor"}):
            data = {}
            encoded_formula = each_new_math['data-tex']
            math_format = each_new_math['data-math-class']
            if math_format == 'x-ck12-block-math':
                url_format = 'block'
            elif math_format == 'x-ck12-hwpmath':
                url_format = 'alignat'
            else:
                url_format = 'inline'
            img_src = '/flx/math/%s/%s' %(url_format, encoded_formula)
            data['src'] = img_src
            data['format'] = math_format
            data['alt'] = unquote(encoded_formula)
            each_new_math['data-edithtml'] = edit_htmls[i]
            each_new_math_unicode = unicode(each_new_math)
            image_tag = img_template %(data)
            image_tag = unicode(image_tag)
            i = i + 1
            log.info(type(each_new_math_unicode))
            log.info(type(image_tag))
            xhtml = xhtml.replace(each_new_math_unicode, image_tag)

        log.info('XHTML after replacing mathJax: [%s]' %(xhtml))
        self.xhtml = xhtml

    def _processXhtml(self, includePracticeLinks=False, considerContentResourceOnly=False, considerMultipleContentResources=False):
        """
            Replace any CK-12 data class directives (as xhtml comments) by the actual content for the children
        """
        global config
        regexList = [ ('concept', self.CONCEPT_REGEX), ('lesson', self.LESSON_REGEX), ('section', self.SECTION_REGEX) ]
        pos = 0
        if self.xhtml:
            for ck12DataMatch in self.CK12_DATA_START.finditer(self.xhtml):
                if ck12DataMatch:
                    pos, endOfStart = ck12DataMatch.span()
                    if pos >= 0:
                        posEnd = self.xhtml.find(self.CK12_DATA_END, endOfStart)
                        if posEnd >= 0:
                            specialDirective = self.xhtml[endOfStart:posEnd]
                            ## Get concept if any
                            childXhtml = ''

                            for type2replace, regex in regexList:
                                log.debug("Trying regex: %s, type2replace: %s" % (regex.pattern, type2replace))
                                m = regex.search(specialDirective)
                                if m:
                                    log.info("Found placeholder for [%s]" % regex.pattern)
                                    if self.artifact.type.name == 'lesson':
                                        for child in self.children:
                                            if type(child) == Artifact:
                                                if child.type.name != type2replace:
                                                    continue
                                                rev = child.revisions[0]
                                            else:
                                                rev = child.child
                                                if rev.artifact.type.name != type2replace:
                                                    continue
                                            xhtml = rev.getXhtml(includeChildContent=True, considerContentResourceOnly=considerContentResourceOnly, considerMultipleContentResources=considerMultipleContentResources, processXhtmlForWrappingInContentComments=False)
                                            if xhtml:
                                                bodyStart = xhtml.find('<body>')
                                                if bodyStart >= 0:
                                                    bodyEnd = xhtml.find('</body>', bodyStart+6)
                                                    if bodyEnd >= 0:
                                                        xhtml = xhtml[bodyStart+6:bodyEnd]
                                                    else:
                                                        xhtml = xhtml[bodyStart+6:]
                                                if includePracticeLinks:
                                                    log.info('includePracticeLinks: [%s]' %(includePracticeLinks))
                                                    assessments = self.artifact.getAssessments()
                                                    if assessments:
                                                        assessment = assessments[0]
                                                        assessmentID, assessmentHandle, domainTerm, domainHandle, domainEID = assessment[0], assessment[1], assessment[2], assessment[3], assessment[4]
                                                        encodedIDParts = domainEID.split('.')
                                                        branch = encodedIDParts[0] + '.' + encodedIDParts[1]
                                                        if BRANCH_ENCODEDID_MAPPING.has_key(branch):
                                                            branch_handle = BRANCH_ENCODEDID_MAPPING[branch]
                                                            if not config or not config.get('web_prefix_url'):
                                                                config = h.load_pylons_config()
                                                            web_prefix_url = config.get('web_prefix_url', 'http://www.ck12.org')
                                                            link = "%s/%s/%s/%s/%s" %(web_prefix_url, branch_handle, domainHandle, "asmtpractice", assessmentHandle)
                                                            log.info('Practice link: [%s]' %(link))
                                                            practice_header = '<h3>Practice Online</h3><a href=%s>%s Practice</a>' %(link, domainTerm)
                                                            xhtml = xhtml + practice_header
                                                        else:
                                                            log.info('No branch mapping found to add practice links')

                                                childXhtml += '\n<!-- Begin inserted XHTML [CONCEPT: %d] -->\n' % rev.id + xhtml + '\n<!-- End inserted XHTML [CONCEPT: %d] -->\n' % rev.id
                                    elif self.artifact.type.name == 'chapter':
                                        for child in self.children:
                                            ## TODO: Fix to support "sections"
                                            #if type2replace == child.child.artifact.type.name:
                                            if type(child) == Artifact:
                                                typeName = child.type.name.encode('utf-8')
                                                rev = child.revisions[0]
                                            else:
                                                rev = child.child
                                                typeName = rev.artifact.type.name.encode('utf-8')
                                            xhtml = rev.getXhtml(includeChildContent=True)
                                            if xhtml:
                                                bodyStart = xhtml.find('<body>')
                                                if bodyStart >= 0:
                                                    bodyEnd = xhtml.find('</body>', bodyStart+6)
                                                    if bodyEnd >= 0:
                                                        xhtml = xhtml[bodyStart+6:bodyEnd]
                                                    else:
                                                        xhtml = xhtml[bodyStart+6:]
                                                childXhtml += '\n<!-- Begin inserted XHTML [%s: %d] -->\n' % (typeName.upper(), rev.id) \
                                                        + xhtml + '\n<!-- End inserted XHTML [%s: %d] -->\n' % (typeName.upper(), rev.id)
                                else:
                                    log.debug("Did not find any placeholder to replace")
     
                            if childXhtml:
                                self.xhtml = self.xhtml[:pos] + childXhtml + self.xhtml[posEnd+len(self.CK12_DATA_END):]
                                pos += len(childXhtml)
                            else:
                                pos = posEnd + len(self.CK12_DATA_END)
                        else: ## posEnd is not found
                            pos = endOfStart
                    else: ## pos is < 0 (invalid)
                        break
                else: ## ck12DataMatch is none
                    break

    def _randomizeHeaderID(self, matchobj):
        return matchobj.group(0).replace(matchobj.group(1), matchobj.group(1) + '-%s' %(h.getRandomString(3)))

    def _includeChildHeaders(self):
        chapter = self.artifact
        if not self.xhtml:
            return
        chapter_xhtml = self.xhtml
        #chapter_xhtml = chapter_xhtml.decode('utf-8')
        title_re = re.compile('<title>.*?</title>', re.DOTALL)
        chapter_xhtml = title_re.sub('<title>%s</title>' %(chapter.getTitle()),
                         chapter_xhtml)
        if self.artifact.type.name == 'chapter':
            header = 'h1'
        else:
            header = 'h2'
        chapter_xhtml = self._createReferencesSection(chapter_xhtml, header=header)
        self.xhtml = chapter_xhtml
        if self.artifact.type.name != 'chapter':
            return

        id_header_re = re.compile('<h\d+ id="(.*?)">')
        children = chapter.getChildren()
        reDict = {}
        reContentDict = {}

        if len(children) != 0:
            i = 1
            startPos = 0
            for eachChild in children:
                childType = eachChild.type.name
                childTypeUpper = childType.upper()
                childTitle = eachChild.getTitle()
                anchor_id = h.genURLSafeBase64Encode(childTitle)
                childHeading = '\n\n' + '<h1 id=\'%s\'> \n %s \n </h1>' %(anchor_id, childTitle)
                reDict[childType] = re.compile(r'<!--[ ]*Begin inserted XHTML[ ]*\[%s: \d+\][ ]*-->' %(childTypeUpper), re.DOTALL)
                reContentDict[childType] = re.compile('<!--[ ]*Begin inserted XHTML[ ]*\[%s: \d+\][ ]*-->(.*?)<!--[ ]*End inserted XHTML[ ]*\[%s: \d+\][ ]*-->' %(childTypeUpper, childTypeUpper), re.DOTALL)
                if reDict.has_key(childType):
                    child_re = reDict[childType]
                    child_content_re = reContentDict[childType]
                    childSnippetMatch = child_re.search(chapter_xhtml[startPos:])
                    if childSnippetMatch:
                        start, end = childSnippetMatch.span()
                        childSnippet = chapter_xhtml[start+startPos:end+startPos]
                        chapter_xhtml = chapter_xhtml.replace(childSnippet, childSnippet +
                                                              childHeading)
                        startPos = startPos + end

                    childContentMatch = child_content_re.search(chapter_xhtml[startPos:])
                    if childContentMatch:
                        childContent = childContentMatch.groups()[0]
                        id_headers = id_header_re.findall(childContent)
                        newChildContent = childContent
                        for eachIDHeader in id_headers:
                            if eachIDHeader:
                                newChildContent = newChildContent.replace(eachIDHeader, eachIDHeader + "_" +  str(i))
                        chapter_xhtml = chapter_xhtml.replace(childContent, newChildContent)
                else:
                    pass
                i = i + 1
        chapter_xhtml = re.sub('<h\d+ id="(.*?)">', self._randomizeHeaderID, chapter_xhtml)
        self.xhtml = chapter_xhtml
        #self.xhtml = self._createReferencesSection(chapter_xhtml)

    def _get_comments(self, html_sting):
        re_comments = re.compile('<!--(.*?)-->', re.DOTALL)
        allComments = re_comments.findall(html_sting)
        return allComments

    def _get_values_from_comment(self, comment):
        re_attribute = re.compile('@@(.*?)[ ]*=[ ]*"(.*)"', re.DOTALL)
        key = ''
        value = ''
        keyValues = re_attribute.findall(comment)
        if keyValues:
            key, value = keyValues[0]
        return key, value

    def _createReferencesSection(self, xhtml_content, header='h1'):

        try:
            soup = BeautifulSoup(xhtml_content)

            olTag = Tag(soup, 'ol')
            imagesInformationFound = False
            for eachDiv in soup.findAll(['div', 'span']):
                if eachDiv.has_key('class') and (eachDiv['class'].find('x-ck12-img') >= 0 or eachDiv['class'].find('x-ck12-img-inline') >= 0):
                    imageDiv = eachDiv.prettify()
                    liTag = Tag(soup, 'li')
                    title = eachDiv.img['title'] if (eachDiv.img and eachDiv.img.has_key('title')) else ''
                    authorString = ''
                    titleString = title
                    licenseString = ''
                    for eachComment in self._get_comments(imageDiv):
                        key, value = self._get_values_from_comment(eachComment)
                        if key == 'author' and value:
                            authorString = value
                        if key == 'url' and value and title:
                            titleString = '<a href="%s">%s</a>' %(value, title)
                        elif key == 'url' and value and not title:
                            titleString = '<a href="%s">%s</a>' %(value, value)
                        if key == 'license' and value:
                            licenseString = value

                    if authorString or titleString or licenseString:
                        liTag.string = h.safe_decode(authorString) + '. ' + h.safe_decode(titleString) + '. ' + h.safe_decode(licenseString)
                        olTag.append(liTag)
                        imagesInformationFound = True

            if imagesInformationFound:
                referencesSectioName = 'References'
                h1Tag = '<%s id="%s">\n%s\n</%s>\n' %(header, h.genURLSafeBase64Encode(referencesSectioName), referencesSectioName, header)
                referencesString = h1Tag + olTag.prettify().decode('utf-8')
                referencesString = referencesString.replace('&lt;', '<').replace('&gt;', '>')
                xhtml_content = xhtml_content.replace('</body>', '%s\n</body>' %(referencesString))
            return h.safe_decode(xhtml_content)
        except Exception as e:
            log.error('Error in creating the references section: %s' %(str(e)))
            log.error(traceback.format_exc())
            return xhtml_content

    def getChildList(self, levels=0, childList=None):
        log.debug('getChildList: levels[%s] childList[%s]' % (levels, str(childList)))
        if childList is not None:
            if levels > 0:
                session = meta.Session()
                revisions = getRevisions(session, childList)
                revisionDict, revisionArtifactDict = getRevisionStructs(revisions, childList)
                childDict = getChildDict(session, childList)

                resourceRevisionDict = getResourceInfo(session, childList)

                childIDList = childList
                childList = []
                for childID in childIDList:
                    artifactID = revisionArtifactDict[childID]
                    revisions = revisionDict[artifactID]
                    for revision in revisions:
                        if childID == revision.id:
                            break

                    artifact = revision.artifact
                    if childDict.has_key(revision.id):
                        grandChildList = childDict[revision.id]
                    else:
                        grandChildList = []
                    resourceInfo = resourceRevisionDict[revision.id] if resourceRevisionDict.has_key(revision.id) else None
                    childList.append(artifact.asDict(revisions=revisions,
                                                     revision=revision,
                                                     levels=levels - 1,
                                                     feedbacks=[],
                                                     standardGrid=[],
                                                     foundationGrid=[],
                                                     tagGrid=[],
                                                     internalTagGrid=[],
                                                     gradeGrid=[],
                                                     stateGrid=[],
                                                     subjectGrid=[],
                                                     searchGrid=[],
                                                     resourceInfo=resourceInfo,
                                                     childList=grandChildList))
                return childList
            else :
                return childList

        else :
            childList = []
            for child in self.children:
                if levels > 0:
                    childList.append(child.child.asDict(levels=levels - 1))
                else:
                    childList.append(child.hasArtifactRevisionID)
            return childList

    def getChildren(self):
        childList = []
        children = self.children
        for child in children:
            if child and hasattr(child, 'creator'):
                childList.append(child)
            else:
                childList.append(child.child.artifact)
        return childList

    def asContentDict(self,
                      revisionDict=None, 
                      withMathJax=False, 
                      includeChildContent=False, 
                      includeChildHeaders=False,
                      includePracticeLinks=False,
                      replaceMathJax=False,
                      resourceInfo=None,
                      memberID=None):
        if revisionDict is None :
            revisionDict = self.asDict(memberID=memberID)

        xhtml = self.getXhtml(withMathJax=withMathJax, includeChildContent=includeChildContent, includeChildHeaders=includeChildHeaders, includePracticeLinks=includePracticeLinks, replaceMathJax=replaceMathJax, resourceInfo=resourceInfo)
        if xhtml is not None:
            revisionDict['xhtml'] = xhtml

        revisionArtifactDomain = self.artifact.getDomain()
        if revisionArtifactDomain is not None:
            revisionDict['domain'] = revisionArtifactDomain

        revisionArtifactType = self.artifact.type.asDict()
        if revisionArtifactType is not None:
            revisionDict['type'] = revisionArtifactType

        return revisionDict

    def getAttachmentsAsDict(self, resourceInfo=None, memberID=None):
        """
            Return attachments - if memberID is None, returns the public attachment count
            Otherwise, return the private and public attachment count for that memberID
        """
        attachments = []
        resources = []
        if resourceInfo is not None:
            keys = resourceInfo.keys()
            for key in keys:
                info = resourceInfo[key]
                resource = info[1]
                resources.append((resource, resource.revisions[0]))
        else:
            for rr in self.resourceRevisions:
                resources.append((rr.resource, rr))

        for resource, rr in resources:
            if resource.isAttachment:
                try:
                    attachments.append(resource.asDict(resourceRevision=rr))
                except ResourceBlacklistedException as rbe:
                    log.warn("Ignoring resource (id:%d). It is blacklisted." % resource.id, exc_info=rbe)
        return attachments

    def getAttachmentCount(self, resourceInfo=None, memberID=None):
        """
            Return attachment count - if memberID is None, returns the public attachment count
            Otherwise, return the private and public attachment count for that memberID
        """
        attachments = 0
        resources = []
        if resourceInfo is not None:
            keys = resourceInfo.keys()
            for key in keys:
                info = resourceInfo[key]
                resource = info[1]
                resources.append((resource, resource.revisions[0]))
        else:
            for rr in self.resourceRevisions:
                resources.append((rr.resource, rr))

        for resource, rr in resources:
            if resource.isAttachment:
                attachments += 1
        return attachments

    def getResourceCounts(self, resourceInfo=None, memberID=None):
        """
            Returns count for all resource types for this artifact revisions
              If memberID is None, then returns public count for attachments
              Otherwise, returns private and public count for that memberID
            Other resource types are unaffected.
        """
        counts = { 
                'allAttachments': 0,
                'allVideos': 0,
                }
        resources = []
        if resourceInfo is not None:
            keys = resourceInfo.keys()
            for key in keys:
                info = resourceInfo[key]
                resource = info[1]
                resources.append((resource, resource.revisions[0]))
        else:
            for rr in self.resourceRevisions:
                resources.append((rr.resource, rr))

        for resource, rr in resources:
            rType = resource.type.name
            if not counts.has_key(rType):
                counts[rType] = 0
            if resource.isAttachment:
                counts['allAttachments'] += 1
                counts[rType] += 1
            else:
                counts[rType] += 1
            if rType in ['video', 'cover video']:
                counts['allVideos'] += 1
        return counts

    def asDict(self,
               revisions=None,
               levels=0,
               feedbacks=None,
               resourceInfo=None,
               childList=None,
               parentList=None,
               memberID=None):
        if hasattr(self, 'cacheDict'):
            return self.cacheDict

        revisionDict = {}
        revisionDict['id'] = self.id
        revisionDict['artifactRevisionID'] = self.id
        revisionDict['artifactID'] = self.artifactID
        revisionDict['artifactType'] = self.artifact.getArtifactType()
        revisionDict['revision'] = self.revision
        revisionDict['comment'] = self.comment

        artifact = self.artifact
        if revisions is None:
            revisions = artifact.revisions
        revisionDict['encodedID'] = artifact.getEncodedId()
        revisionDict['authors'] = artifact.getAuthors()
        revisionDict['creator'] = artifact.getCreator()
        revisionDict['creatorID'] = artifact.getOwnerId()
        revisionDict['creatorAuthID'] = artifact.getCreatorAuthID()
        revisionDict['title'] = artifact.getTitle()
        revisionDict['summary'] = artifact.getSummary()
        revisionDict['handle'] = artifact.getHandle()
        revisionDict['resourceCounts'] = self.getResourceCounts(resourceInfo=resourceInfo, memberID=memberID)
        revisionDict['attachments'] = self.getAttachmentsAsDict(resourceInfo=resourceInfo, memberID=memberID)

        offset = len(revisions) - 1
        for revision in revisions:
            if revision.id == self.id:
                break
            offset -= 1
        revisionDict['offset'] = offset

        revisionDict['statistics'] = {
                                        'downloads': self.downloads,
                                        #'favorites': self.favorites,
                                        #'rating': self.getRating(feedbacks),
                                     }
        revisionDict['created'] = self.creationTime
        if self.publishTime is not None:
            revisionDict['published'] = self.publishTime

        contentRevision = self.getResourceRevision('contents',
                                                   resourceInfo=resourceInfo)
        pdf = self.getResources('pdf', resourceInfo=resourceInfo)
        revisionDict['pdf'] = []
        for eachPDFResource in pdf:
            revisionDict['pdf'].append(eachPDFResource.getPermaUri(fullUrl=True))
        epub = self.getResourceRevision('epub', resourceInfo=resourceInfo)
        if epub:
            if type(epub) != ResourceRevision:
                epub = epub.resourceRevision
            revisionDict['epub'] = epub.resource.getPermaUri(fullUrl=True)
        mobi = self.getResourceRevision('mobi', resourceInfo=resourceInfo)
        if mobi:
            if type(mobi) != ResourceRevision:
                mobi = mobi.resourceRevision
            revisionDict['mobi'] = mobi.resource.getPermaUri(fullUrl=True)

        if contentRevision is not None:
            if resourceInfo is not None:
                resource = resourceInfo[contentRevision.id][1]
            else:
                resource = contentRevision.resource
            contents = resource.uri
            if contents is not None:
                revisionDict['file'] = contents
            if resource.languageID is not None:
                revisionDict['language'] = resource.language.name

        childrenAdded = False
        if childList:
            childList = self.getChildList(levels=levels, childList=childList)
            revisionDict['children'] = childList
            childrenAdded=True

        if self.children is not None and not childrenAdded:
            if self.children and len(self.children) > 0 and hasattr(self.children[0], 'artifactID'):
                children = []
                for child in self.children:
                    children.append(child.asDict())
                revisionDict['children'] = children

        revisionDict['parents'] = parentList if parentList else []
        return revisionDict

class ArtifactRevisionHasResources(FlxModel):
    pass

class ArtifactRevisionRelation(FlxModel):
    pass

class ArtifactsAndBrowseTerms(FlxModel):
    pass

class ArtifactsAndTagTerms(FlxModel):
    pass

class ArtifactsAndSearchTerms(FlxModel):
    pass

class ArtifactAndChildren(FlxModel):
    pass

class ArtifactAndResources(FlxModel):
    pass

class ArtifactFeedback(FlxModel):
    def asDict(self):
        #session = meta.Session()
        is_helpful = 0
        is_not_helpful = 0
        feedbackHelpful = self.getIsHelpfulForFeedback()
        for each in feedbackHelpful:
            if each.isHelpful:
                is_helpful += 1
            else:
                is_not_helpful +=1

        feedback = {
                        'artifactID': self.artifactID,
                        'memberID': self.memberID,
                        'type': self.type,
                        'score': self.score,
                        'comments': self.comments,
                        'notAbuse': self.notAbuse,
                        'creationTime': self.creationTime,
                        'totalReviews': self.getTotalReviewsForFeedback(),
                        'isHelpful': is_helpful,
                        'isNotHelpful': is_not_helpful,
                     }
        return feedback

    def getTotalReviewsForFeedback(self):
        session = meta.Session()
        query = session.query(ArtifactFeedbackReview)
        query = query.filter_by(artifactID=self.artifactID)
        query = query.filter_by(memberID=self.memberID)
        query = query.filter_by(type=self.type)
        return query.count()

    def getIsHelpfulForFeedback(self):
        session = meta.Session()
        query = session.query(ArtifactFeedbackHelpful)
        query = query.filter_by(artifactID=self.artifactID)
        query = query.filter_by(memberID=self.memberID)
        query = query.filter_by(type=self.type)
        return query.all()

class ArtifactFeedbackReview(FlxModel):
    def asDict(self):
        feedbackReview = {
                            'id': self.id,
                            'artifactID': self.artifactID,
                            'memberID': self.memberID,
                            'type': self.type,
                            'reviewersMemberID': self.reviewersMemberID,
                            'reviewComment': self.reviewComment,
                            'notAbuse': self.notAbuse,
                            'creationTime': self.creationTime,
                            'updationTime': self.updationTime
                         }
        return feedbackReview

class ArtifactFeedbackAbuseReport(FlxModel):
    def asDict(self):
        feedbackAbuseReport = {
                                'artifactID': self.artifactID,
                                'memberID': self.memberID,
                                'reporterMemberID': self.reporterMemberID,
                                'comments': self.comments,
                                'creationTime': self.creationTime
                              }

        return feedbackAbuseReport

class ArtifactFeedbackReviewAbuseReport(FlxModel):
    def asDict(self):
        feedbackReviewAbuseReport = {
                                      'artifactFeedbackReviewID': self.artifactFeedbackReviewID,
                                      'reporterMemberID': self.reporterMemberID,
                                      'comments': self.comments,
                                      'creationTime': self.creationTime
                                     }

        return feedbackReviewAbuseReport

class ArtifactFeedbackHelpful(FlxModel):
    def asDict(self):
        feedbackHelpful = {
                            'artifactID': self.artifactID,
                            'memberID': self.memberID,
                            'type': self.type,
                            'reviewersMemberID': self.reviewersMemberID,
                            'isHelpful': self.isHelpful
                         }
        return feedbackHelpful

class ArtifactFeedbackAndCount(FlxModel):
    def asDict(self):
        feedback = {
                        'artifactID': self.artifactID,
                        'type': self.type,
                        'score': self.score,
                        'count': self.count
                     }
        return feedback

class ArtifactFeedbackHelpfulAndCount(FlxModel):
    def asDict(self):
        review = {
                        'artifactID': self.artifactID,
                        'memberID': self.memberID,
                        'type': self.type,
                        'isHelpful': self.isHelpful,
                        'count': self.count
                     }
        return review

class ArtifactRevisionFavorite(FlxModel):
    pass

class PublishRequest(FlxModel):
    pass

class GroupActivity(FlxModel):
    def asDict(self):
        groupActivityInfo = {
                                'id': self.id,
                                'groupID': self.groupID,
                                'ownerID': self.ownerID,
                                'activityType': self.activityType,
                                'objectType': self.objectType,
                                'objectID': self.objectID,
                                'activityData': self.activityData,
                                'creationTime': self.creationTime,
                            }
        return groupActivityInfo

class SharedArtifact(FlxModel):
    pass

class ArtifactType(FlxModel):
    pass

class BrowseTermType(FlxModel):
    pass

class BrowseTerm(FlxModel):
    def asDict(self, includeParent=False, recursive=False, includeSubjectBranchInfo=True):
        global config
        browseInfo = {
                        'id': self.id,
                        'term': self.name,
                        'name': self.name,
                        'handle': self.handle.lower() if self.handle else self.handle,
                        'from': self.type.name,
                        'type': self.type.name,
                        'encodedID': self.encodedID,
                        'description': self.description,
                     }
        parent = self.parent
        if parent is not None:
            if includeParent:
                browseInfo['parent'] = parent.asDict(includeParent=recursive, recursive=recursive)
            else:
                browseInfo['parentID'] = parent.id
        domainUrl = self.getDomainUrl()
        if domainUrl:
            browseInfo['previewImageUrl'] = domainUrl
        else:
            #browseInfo['previewImageUrl'] = 'http://www.ck12.org/media/images/placeholder_concept.png'
            if not config or not config.get('web_prefix_url'):
                config = h.load_pylons_config()
            placeholder_prefix = config.get('web_prefix_url')
            browseInfo['previewImageUrl'] = placeholder_prefix + '/' + 'media/images/modality_generic_icons/concept_gicon.png'

        browseInfo['previewIconUrl'] = None
        domainIconUrl = self.getDomainIconUrl()
        if domainIconUrl:
            browseInfo['previewIconUrl'] = domainIconUrl

        if self.encodedID:
            subject = None
            branch = None
            parts = self.encodedID.split('.')
            if len(parts) >= 2:
                subject = parts[0]
                branch = parts[1]
            elif len(parts) == 1:
                subject = parts[0]
            browseInfo['subject'] = subject
            browseInfo['branch'] = branch
            if includeSubjectBranchInfo and branch and subject:
                branchEID = '%s.%s' % (subject, branch)
                log.debug("Getting branch info for %s" % branchEID)
                session = meta.Session()
                brn = session.query(BrowseTerm).filter_by(encodedID=branchEID).first()
                if brn:
                    browseInfo['branchInfo'] = brn.asDict(includeParent=False, recursive=False, includeSubjectBranchInfo=False)
        return browseInfo

    def getDomainUrl(self):
        if self.type.name == 'domain':
            session = meta.Session()
            query = session.query(DomainUrl)
            query = query.filter_by(domainID=self.id)
            url = query.first()
            if url:
                return url.url
        return None

    def getDomainIconUrl(self):
        if self.type.name == 'domain':
            session = meta.Session()
            query = session.query(DomainUrl)
            query = query.filter_by(domainID=self.id)
            url = query.first()
            if url:
                return url.iconUrl
        return None

    def getTopLevelAncestorTerm(self):
        term = self
        if term.termTypeID == 4 \
                and term.encodedID \
                and term.encodedID.count('.') <= 1:
            return term
        while True:
            if term and term.parent:
                if term.parent.termTypeID == 4 \
                        and term.parent.encodedID \
                        and term.parent.encodedID.count('.') <= 1:
                    log.info("Found parent: %s" % term.parent.encodedID)
                    return term
                term = term.parent
            else:
                break
        return None

class TagTerm(FlxModel):
    pass

class SearchTerm(FlxModel):
    pass

class PseudoDomainHandleSequencer(FlxModel):

    def getUniqueHandle(self):
       return self.handle + '-' + str(self.sequence)

class BrowseTermHasSynonyms(FlxModel):
    pass

class DomainNeighbor(FlxModel):
    pass

class EncodedIDNeighbor(FlxModel):
    pass

class Language(FlxModel):
    pass

class Resource(FlxModel):
    def getUri(self, suffix='', oldStyle=False, unresolved=False, perma=False, local=False):
        """
            Return the uri for this resource.
            Suffix is optional suffix to get a variation of the resource (eg. 'thumb' will return a thumbnail image)
            oldStyle is deprecated and should not be used except when loading data into fedora.
            unresolved when set to True returns the uri as-is from the database otherwise the uri is changed to reflect
                the correct host name of the media server.
        """
        if self.type.versionable or self.isExternal or unresolved:
            return self.uri

        if self.type.name not in ['cover page', 'image']:
            suffix = ''

        if local:
            fcclient = fc.FCClient()
            url = fcclient.getResourceLink(self.refHash, self.type, dsSuffix=suffix)
            if oldStyle:
                return url.replace('f-d:', 'flx2-d:').replace('f-s:', 'flx2-s:')
            return url

        if oldStyle:
            return h.getDataPath(self.uri, id=self.ownerID)

        if perma:
            return self.getPermaUri(suffix=suffix, fullUrl=True)

        fcclient = fc.FCClient()
        ## If using image satellite server, return the satellite perma
        useImageSatellite, imageSatelliteServer, iamImageSatellite = h.getImageSatelliteOptions()
        if useImageSatellite and not iamImageSatellite and self.satelliteUrl:
            url = self.satelliteUrl
            if suffix and suffix != 'default':
                dsName = fcclient.getDSName(self.type.name, suffix)
                typeName = self.type.name.upper().replace(' ', '_')
                ## Sometimes the type in the url is different from the type in db (if the 
                ## resource was already created under a different type name)
                ## Get the type from the url and replace it
                if typeName not in url:
                    typeNameOld = typeName
                    m = RESOURCE_TYPE_RE.match(url)
                    if m:
                        typeName = m.group(1)
                        dsName = dsName.replace(typeNameOld, typeName)

                if dsName != typeName:
                    url = url.replace(typeName, dsName)
            return url

        return fcclient.getResourceLink(self.refHash, self.type, dsSuffix=suffix)

    def getPermaUri(self, suffix='default', fullUrl=False, qualified=False):
        global config
        resourceType, handle, realm = self.getPermaParts()
        if suffix == 'default' or self.type.name not in ['cover page', 'image']:
            suffix = None
        if realm is None:
            perma = '/%s/%s' % (quote(resourceType), quote(h.safe_encode(handle)))
        else:
            perma = '/%s/%s/%s' % (quote(resourceType), quote(h.safe_encode(realm)), quote(h.safe_encode(handle)))

        if suffix:
            perma = '/%s%s' % (quote(suffix), perma)

        if fullUrl or qualified:
            perma = u'/flx/show%s' % (perma)
            if qualified:
                if not config or not config.get('flx_prefix_url'):
                    config = h.load_pylons_config()

                prefixUrl = config.get('flx_prefix_url')
                if prefixUrl.endswith('/flx'):
                    prefixUrl = prefixUrl[:-4]
                perma = u'%s%s' % (prefixUrl, perma)
        return perma

    def getPermaParts(self):
        login = self.owner.login
        ck12Editor = config.get('ck12_editor')
        if not ck12Editor:
            ck12Editor = 'ck12Editor'
        if login == ck12Editor:
            realm = None
        else:
            if login:
                realm = 'user:%s' % login.strip()
            else:
                raise Exception((_(u"No login found!")).encode("utf-8"))

        resourceType = self.type.name

        handle = self.handle
        if not handle:
            handle = self.uri.replace(' ', '-')
        handle = u'%s' % handle
        
        return resourceType, handle, realm
        
    def getXhtml(self, revisionID=0, withMathJax=False):
        if not revisionID:
            resourceRevision = self.revisions[0]
        else:
            for resourceRevision in self.revisions:
                if resourceRevision.id == revisionID:
                    break

        return resourceRevision.getXhtml(withMathJax=withMathJax)

    def getSatelliteUrl(self):
        return self.satelliteUrl

    def asDict(self, resourceRevision=None, suffix=None,addResourceURL=False):
        if not resourceRevision:
            resourceRevision = self.revisions[0]
        resourceTypeName, handle, realm = self.getPermaParts()
        resourceDict = {
                'id': self.id,
                'name': self.name,
                'type': resourceTypeName,
                'description': self.description,
                'uri': self.getUri(suffix=suffix, perma=True),
                'permaUri': self.getPermaUri(suffix=suffix),
                'handle': handle,
                'realm': realm,
                'isExternal': self.isExternal,
                'isAttachment': self.isAttachment,
                'streamable': self.type.streamable,
                'originalName': self.uri,
                'ownerID': self.ownerID,
                'authors': self.authors,
                'license': self.license,
                'created': self.creationTime if self.creationTime else None,
                'revision': resourceRevision.revision,
                'resourceRevisionID': resourceRevision.id,
                'revisions': [ resourceRevision.asDict() ],
                'publishTime': resourceRevision.publishTime if resourceRevision.publishTime else None,
                'filesize': resourceRevision.filesize,
                'isAbused': resourceRevision.isContentAbused(),
                'satelliteUrl': self.satelliteUrl,
                }
        
        if self.boxDocuments:
            resourceDict['boxDocuments'] = self.boxDocuments.asDict()

        if addResourceURL:
            resourceDict['resourceURL'] = self.satelliteUrl

        eo = self.getEmbeddedObject()
        if eo:
            resourceDict['thumbnail'] = eo.thumbnail
            resourceDict['embeddedObject'] = eo.asDict(resourceInfo=False)
        return resourceDict

    def getEmbeddedObject(self):
        session = meta.Session()
        query = session.query(EmbeddedObject)
        query = query.filter_by(resourceID=self.id)
        return query.first()

class InlineResourceDocument(FlxModel):
    def asDict(self):
        boxDict = {}
        boxDict['id'] = self.id
        boxDict['resourceID'] = self.resourceID
        boxDict['documentID'] = self.documentID
        boxDict['created'] = self.creationTime if self.creationTime else None
        boxDict['updated'] = self.updateTime if self.updateTime else None
        return boxDict

class ResourceRevision(FlxModel):
    def isContentAbused(self):
        session = meta.Session()

        query = session.query(AbuseReport)
        query = query.filter_by(resourceRevisionID=self.id)
        query = query.filter_by(status='flagged')
        reports = query.count()

        eo = self.resource.getEmbeddedObject()
        if eo and eo.isBlacklisted():
            return True
        
        return reports > 0

    def getPlaceholder(self):
        return '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Content Disabled</title></head><body>The requested content has been disabled.</body></html>'

    def getXhtml(self, withMathJax=False):
        if self.resource.type.name == 'contents':
            #
            #  Check if it's abused. If so, return the placeholder instead.
            #
            if self.isContentAbused():
                return self.getPlaceholder()

            from flx.model.vcs import vcs as v
            vcs = v.vcs(self.resource.ownerID, session=meta.Session())
            self.xhtml = vcs.get(self.resource.uri, revNo=self.revision)
            if withMathJax:
                self.xhtml = h.replace_math(self.xhtml)
            return self.xhtml
        return None

    def asDict(self):
        revDict = {}
        revDict['id'] = self.id
        revDict['revision'] = self.revision
        revDict['hash'] = self.hash
        revDict['filesize'] = self.filesize
        revDict['created'] = self.creationTime if self.creationTime else None
        revDict['publishTime'] = self.publishTime if self.publishTime else None
        revDict['isPublic'] = self.publishTime != None
        revDict['resourceID'] = self.resourceID
        return revDict

class RevisionAndResources(ResourceRevision):
    pass

class ResourceType(FlxModel):

    def asDict(self):
        rtDict = {}
        rtDict['id'] = self.id
        rtDict['name'] = self.name
        rtDict['description'] = self.description
        rtDict['versionable'] = self.versionable
        rtDict['streamable'] = self.streamable
        return rtDict

class WorkDirectory(FlxModel):
    pass

class MathImage(FlxModel):
    pass

class Country(FlxModel):
    pass

class ActionType(FlxModel):
    pass

class AccessControl(FlxModel):
    pass

class Group(FlxModel):
    def asDict(self, obfuscateEmail=False, includeMembers=False):
        info = {
            'id' : self.id,
            'parentID' : self.parentID,
            'name' : self.name,
            'handle' : self.handle,
            'description' : self.description,
            'isActive' : self.isActive,
            'accessCode' : self.accessCode,
            'groupScope' : self.groupScope,
            'groupType' : self.groupType,
            'origin' : self.origin,
            'creationTime' : self.creationTime,
            'updateTime' : self.updateTime,
            'membersCount' : self.membersCount,
            'resourcesCount' : self.resourcesCount,
            'totalAssignmentsCount': self.totalAssignmentsCount,
            'isVisible' : self.isVisible,
            'subjects': self.getSubjectAsDict(),
            'grades': self.getGradesAsDict(),
        }

        if self.resourceRevision:
            dct = self.resourceRevision.resource.asDict()
            info['resource'] = {}
            info['resource']['id'] = dct['resourceRevisionID']
            info['resource']['uri'] = dct.get('satelliteUrl', dct.get('uri'))

        if self.lmsGroups:
            lmsGroupList = []
            for lmsGroup in self.lmsGroups:
                lmsGroupList.append(lmsGroup.asDict())
            info['lmsGroups'] = lmsGroupList

        info['creator'] = {}
        info['creator']['id'] = self.creator.id
        info['creator']['authID'] = self.creator.id
        info['creator']['name'] = self.creator.fix().name
        info['creator']['firstName'] = self.creator.givenName
        info['creator']['lastName'] = self.creator.surname
        email = self.creator.email
        if obfuscateEmail:
            if '@' not in email:
                email = email[:3] + '*'*(len(email) - 3)
            else:
                emailID, domain = email.split('@', 1)
                email = emailID[:3] + '*'*(len(emailID) - 3) + '@' + domain
        info['creator']['email'] = email

        if includeMembers and self.members:
            memberList = []
            for ghs in self.members:
                memberList.append(ghs.member_info.asDict())
            info['members'] = memberList

        if self.groupType == 'public-forum':
            info['tagLine'] = ''
            info['taggedWithRoles'] = []
            if self.additionalMetadata:
                taggedRoles = []

                for eachMetadata in self.additionalMetadata:
                    info['tagLine'] = eachMetadata.tagLine
                    if eachMetadata.roles:
                        taggedRoles.append(eachMetadata.roles.asDict())

                info['taggedWithRoles'] = taggedRoles

        return info
    
    def getSubjectAsDict(self):
        subjects = []
        for subject in self.subjects:
            subjects.append(subject.asDict())
        return subjects

    def getGradesAsDict(self):
        grades = []
        for grade in self.grades:
            grades.append(grade.asDict())
        return grades

    def isClassGroup(self):
        return self.groupType == 'class'

class GroupHasArtifacts(FlxModel):
    pass

class GroupMemberStates(FlxModel):
    pass 

class GroupHasMembers(FlxModel):

    def asDict(self, includePersonal=False):
        info = {
                'groupID': self.groupID,
                'memberID': self.memberID,
                'roleID': self.roleID,
               }
        return info


class ForumMetadata(FlxModel):
    pass


class Member(FlxModel):

    def fix(self):
        for attr in ['givenName', 'surname', 'login', 'email']:
            if hasattr(self, attr):
                setattr(self, attr, h.decode_encrypted(getattr(self, attr)))
        if not hasattr(self, 'name'):
            self.name = ('%s %s' % (self.givenName, self.surname)).strip()
        return self

    def asDict(self, includePersonal=False, obfuscateEmail=False, top=True):
        info = {
                'id': self.id,
                'stateID': self.stateID,
                'authID': self.id,
                'email': self.email.lower(),
                'login': self.login,
                'defaultLogin': self.defaultLogin,
                'creationTime': str(self.creationTime),
                'updatetime': str(self.updateTime),
                'timezone': self.timezone,
                'name': ('%s %s' % (self.givenName, self.surname)).strip(), 
            }

        if obfuscateEmail:
            email = self.email.lower()
            if '@' not in email:
                email = email[:3] + '*'*(len(email) - 3)
            else:
                emailID, domain = email.split('@')
                email = emailID[:3] + '*'*(len(emailID) - 3) + '@' + domain
            info['email'] = email

        if includePersonal:
            info['givenName'] = self.givenName
            info['surname'] = self.surname
            if not info['givenName'] and not info['surname']:
                info['givenName'] = self.email
        return info

    def infoDict(self):
        mdict = {
                'firstName': self.givenName,
                'lastName': self.surname,
                'name': ('%s %s' % (self.givenName, self.surname)).strip(), 
                'email': self.email.lower(), 
                'login': self.login,
                'defaultLogin': self.defaultLogin,
                'creationTime': str(self.creationTime),
                'updatetime': str(self.updateTime),
                'timezone': self.timezone
                }
        if not mdict['firstName'] and not mdict['lastName']:
            mdict['firstName'] = self.email
            mdict['name'] = self.email
        return mdict

class MemberAccessTime(FlxModel):
    pass

class MemberViewedGroupActivity(FlxModel):
    pass

class MemberAuthApproval(FlxModel):
    pass

class MemberRole(FlxModel):
    pass

class MemberViewedArtifact(FlxModel):
    pass

class CampaignMember(FlxModel):
    pass

class TypedMemberViewedArtifact(FlxModel):
    pass

class TypedArtifactFavorite(FlxModel):
    pass

class MemberHasGrades(FlxModel):
    pass

class MemberHasSubjects(FlxModel):
    pass

class GroupHasSubjects(FlxModel):
    pass

class GroupHasGrades(FlxModel):
    pass

class BlockedMembers(FlxModel):
    pass

class Grade(FlxModel):

    def asDict(self):
        return {
                'id': self.id,
                'name': 'Kindergarten' if self.name == 'k' else self.name,
                }

class Subject(FlxModel):
    
    SUBJECTS_EID_MAP = {'algebra': 'MAT.ALG', 
                    'analysis': 'MAT.ALY',
                    'arithmetic': 'MAT.ARI',
                    'biology': 'SCI.BIO',
                    'calculus': 'MAT.CAL',
                    'chemistry': 'SCI.CHE',
                    'earth science': 'SCI.ESC',
                    'elementary math grade 1': 'MAT.EM1',
                    'elementary math grade 2': 'MAT.EM2',
                    'elementary math grade 3': 'MAT.EM3',
                    'elementary math grade 4': 'MAT.EM4',
                    'elementary math grade 5': 'MAT.EM5',
                    'engineering': 'ENG',
                    'geometry': 'MAT.GEO',
                    'health': None,
                    'health and wellness' : None,
                    'history': 'SOC.HIS',
                    'life science': 'SCI.LSC',
                    'mathematics': 'MAT',
                    'measurement': 'MAT.MEA',
                    'physical science': 'SCI.PSC',
                    'physics': 'SCI.PHY',
                    'probability': 'MAT.PRB',
                    'probability and statistics': None,
                    'science': 'SCI',
                    'spelling': 'ELA.SPL',
                    'statistics': 'MAT.STA',
                    'technology': None,
                    'trigonometry': 'MAT.TRG'
                    }
    
    def asDict(self, includeEID=False):
        sDict = {
                'id': self.id,
                'name': self.name,
                }
        if includeEID:
            sDict['encodedID'] = Subject.SUBJECTS_EID_MAP[self.name]
        return sDict

class StandardBoard(FlxModel):
    
    @classmethod
    def compare(cls, x, y):
        if x.sequence == y.sequence:
            return cmp(x.longname.lower(), y.longname.lower())
        else:
            return int(x.sequence - y.sequence)

    def asDict(self):
        return {
                'id': self.id,
                'name': self.name,
                'longname': self.longname,
                'sequence': self.sequence,
                'countryID': self.country.id,
                'countryCode': self.country.code2Letter,
                'countryName': self.country.name,
            }

class StandardHasGrades(FlxModel):
    pass

class Standard(FlxModel):
    def asDict(self, includeDescription=False, includeBoard=False):
        grades = []
        for grade in self.grades:
            grades.append(grade.name)
        standardDict = {
            'id': self.id,
            'subject': self.subject.name,
            'section': self.section,
            'title': re.sub(r'_\d+$', '', self.title) if self.title else "",
            'grades': grades,
        }
        if includeDescription:
            standardDict['description'] = self.description
        if includeBoard:
            standardDict['standardBoard'] = self.standardBoard.asDict()
        return standardDict

class ArtifactRevisionHasStandards(FlxModel):
    pass

class RevisionAndStandards(FlxModel):
    pass

class StandardAndGrades(FlxModel):
    pass

class ArtifactsStandardsGradesAndBrowseTerms(FlxModel):
    pass

class BrowseTermCandidates(FlxModel):
    pass

class ContentRevision(FlxModel):
    pass

class Content(FlxModel):
    pass

TASK_STATUS_IN_PROGRESS = 'IN PROGRESS'
TASK_STATUS_PENDING = 'PENDING'
TASK_STATUS_SUCCESS = 'SUCCESS'
TASK_STATUS_FAILURE = 'FAILURE'
TASK_STATUSES = [TASK_STATUS_IN_PROGRESS, TASK_STATUS_PENDING, TASK_STATUS_SUCCESS, TASK_STATUS_FAILURE]

class Task(FlxModel):
    def asDict(self):
        taskDict = {}
        taskDict['id'] = self.id
        taskDict['name'] = self.name
        taskDict['taskID'] = self.taskID
        taskDict['status'] = self.status
        if self.owner:
            taskDict['owner'] = {
                    'id': self.owner.id,
                    'login': self.owner.login
                    }
        taskDict['message'] = self.message
        taskDict['userdata'] = self.userdata
        taskDict['artifactKey'] = self.artifactKey
        taskDict['hostname'] = self.hostname
        taskDict['started'] = self.started
        taskDict['updated'] = self.updated
        return taskDict

class EmbeddedObjectProvider(FlxModel):
    def asDict(self):
        d = {
                'id': self.id,
                'name': self.name,
                'domain': self.domain,
                'blacklisted': self.blacklisted,
                'needsApi': self.needsApi,
                'created': self.created,
                'updated': self.updated,
                }
        return d

class EmbeddedObject(FlxModel):
    def isBlacklisted(self):
        """
            Check if the embedded object is blacklisted
        """
        if self.blacklisted or self.provider.blacklisted:
            return True
        return False

    def constructIFrame(self):
        schemaOrgTag = '<div itemprop="video" itemscope itemtype="http://schema.org/VideoObject">'
        src = self.resource.getPermaUri(fullUrl=True, qualified=False)
        if self.description:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="description" content="%s" />' %(quote(self.description))
        if self.thumbnail:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="image" content="%s" />' %(self.thumbnail)
        if self.caption:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="name" content="%s" />' %(self.caption)
        if src:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="url" content="%s" />' %(src)

        iframeAttributes = ''
        if self.id:
            iframeAttributes = iframeAttributes + 'name="%s" ' %(self.id)
        if self.caption:
            iframeAttributes = iframeAttributes + 'title="%s" ' %(self.caption)
        if self.description:
            iframeAttributes = iframeAttributes + 'longdesc="%s" ' %(quote(self.description))
        self.className = 'x-ck12-%s' % self.type.replace(' ', '_')
        if self.className:
            iframeAttributes = iframeAttributes + 'class="%s" ' %(self.className)
        if self.width:
            iframeAttributes = iframeAttributes + 'width="%s" ' %(self.width)
        if self.height:
            iframeAttributes = iframeAttributes + 'height="%s" ' %(self.height)
        if src:
            iframeAttributes = iframeAttributes + 'src="%s" ' %(src)
        iframeAttributes = iframeAttributes + 'frameborder="0" '

        iframe = '<iframe ' + iframeAttributes + '> </iframe>'
        iframe = schemaOrgTag + iframe + '</div>'
        return iframe

    def asDict(self, errorIfBlacklisted=True, resourceInfo=True):
        """
            Return the embedded object in dictionary format.
            By default, raise exception if the object or its provider is blacklisted.
            Setting errorIfBlacklisted parameter to False can override this behavior
        """
        if errorIfBlacklisted and self.isBlacklisted():
            raise ResourceBlacklistedException((_(u'The object is blacklisted: %(self.id)d')  % {"self.id":self.id}).encode("utf-8"))

        info = {}
        info['id'] = self.id
        info['caption'] = self.caption
        info['description'] = self.description
        info['code'] = self.code
        info['iframe'] = self.constructIFrame()
        info['url'] = self.uri
        info['width'] = self.width
        info['height'] = self.height
        info['thumbnail'] = self.thumbnail
        info['type'] = self.type
        info['provider'] = {
                'id': self.provider.id,
                'name': self.provider.name,
                }
        if resourceInfo and self.resource:
            info['resource'] = {
                    'id': self.resourceID,
                    'type': self.resource.type.name,
                    'perma': self.resource.getPermaUri(fullUrl=True),
                    'authors': self.resource.authors,
                    'license': self.resource.license,
                }
        info['blacklisted'] = int(self.blacklisted or self.provider.blacklisted)
        return info

class AbuseReason(FlxModel):

    def asDict(self):
        arDict = {}
        arDict['id'] = self.id
        arDict['name'] = self.name
        arDict['description'] = self.description
        return arDict

class AbuseReport(FlxModel):
    statuses = ['flagged', 'ignored', 'accepted', 'fixed', 'reported', 'reopened']

    def isStatusValid(self):
        return self.status in self.statuses

    def asDict(self, resourceInfo=None):
        info = {
                'id': self.id,
                'status': self.status,
                'reporter': self.reporter.asDict() if self.reporter else None,
                'resource': resourceInfo,
                'artifactID': self.artifactID,
                'reason': self.reason,
                'reasonID': self.reasonID,
                'reviewer': self.reviewer.asDict() if self.reviewer else None,
                'remark': self.remark,
                'imageUrl': self.imageUrl,
                'userAgent' : self.userAgent,
                'created': self.created,
                'updated': self.updated,
        }
        return info


class DomainUrl(FlxModel):
    pass

class Retrolation(FlxModel):
    pass

class EmbeddedObjectCache(FlxModel):
    pass

class DownloadStats(FlxModel):

    def asDict(self):
        dsDict = {}
        dsDict['id'] = self.id
        dsDict['downloadType'] = self.downloadType
        dsDict['count'] = self.count
        dsDict['updateTime'] = self.updateTime
        return dsDict

class EventType(FlxModel):

    def asDict(self):
        eDict = {}
        eDict['id'] = self.id
        eDict['name'] = self.name
        eDict['description'] = self.description
        return eDict

class Event(FlxModel):

    def asDict(self, getOwner=False):
        eDict = {}
        eDict['id'] = self.id
        eDict['typeName'] = self.eventType.name
        eDict['typeDesc'] = self.eventType.description
        eDict['objectID'] = self.objectID
        eDict['objectType'] = self.objectType
        eDict['eventData'] = None
        if self.eventData:
            try:
                eDict['eventData'] = json.loads(self.eventData)
            except Exception:
                log.warn("Error formatting eventData as json: %s. Keeping as string!" % self.eventData)
                eDict['eventData'] = self.eventData

        if getOwner:
            if not self.owner:
                eDict['owner'] = {}
            else:
                eDict['owner'] = self.owner.asDict(includePersonal=True, obfuscateEmail=True)
        else:
            eDict['ownerID'] = self.ownerID

        eDict['subscriberID'] = self.subscriberID
        eDict['created'] = self.created
        return eDict

class NotificationRule(FlxModel):
    def asDict(self):
        eDict = {}
        eDict['id'] = self.id
        eDict['name'] = self.name
        eDict['description'] = self.description
        return eDict

class Notification(FlxModel):

    def asDict(self):
        d = {}
        d['id'] = self.id
        d['eventType'] = self.eventType.name
        d['eventTypeID'] = self.eventType.id
        d['objectID'] = self.objectID
        d['objectType'] = self.objectType
        d['notificationType'] = self.type
        d['rule'] = self.rule.name if self.rule else None
        d['address'] = self.address
        d['subscriber'] = self.subscriber.login if self.subscriber else None
        d['groupID'] = self.groupID
        d['frequency'] = self.frequency
        d['lastSent'] = self.lastSent
        d['created'] = self.created
        d['updated'] = self.updated
        return d

class License(FlxModel):
    pass

class EflexUserDetail(FlxModel):
    pass

class EflexUserRequest(FlxModel):
    pass

class MemberLibraryObject(FlxModel):
    
    def asDict(self):
        return {
                'id': self.id,
                'objectID': self.objectID,
                'objectType': self.objectType,
                'parentID': self.parentID,
                'memberID': self.memberID,
                'created': self.created,
                'domainID': self.domainID
                }

class MemberLibraryArtifactRevision(FlxModel):
    pass

class MemberLibraryArtifactRevisionsAndBrowseTerm(FlxModel):
    pass

class MemberLibraryResourceRevision(FlxModel):
    pass

MEMBER_LABEL_ARCHIVED = 'archived'
PROTECTED_MEMBER_LABELS = [ MEMBER_LABEL_ARCHIVED ]

class MemberLabel(FlxModel):

    def asDict(self):
        d = {}
        d['label'] = self.label
        d['created'] = self.created
        d['systemLabel'] = self.systemLabel
        d['sticky'] = self.sticky
        #member = Member.cache(LOAD, id=self.memberID)
        member = meta.Session().query(Member).filter_by(id=self.memberID).first()
        d['member'] = member.login if member else None
        return d

class MemberLibraryObjectHasLabel(FlxModel):
    pass

class MemberLibraryArtifactRevisionHasLabel(FlxModel):
    pass

class MemberLibraryArtifactRevisionHasLabelsAndBrowseTerm(FlxModel):
    pass

class MemberLibraryResourceRevisionHasLabel(FlxModel):
    pass

class ArtifactAndRevision(FlxModel):
    pass

class From1xBookMember(FlxModel):
    pass

class From1xBookMemberInfo(FlxModel):
    pass

class From1xBook(FlxModel):
    pass

class From1xChapter(FlxModel):
    pass

class DomainHasStandard(FlxModel):
    pass

class ArtifactDomainAndStandard(FlxModel):
    pass

class ArtifactDomainsStandardsGradesAndBrowseTerms(FlxModel):
    pass

class PublishedArtifact(FlxModel):
    pass

class RelatedArtifact(FlxModel):
    pass

class RelatedArtifactsBackup(FlxModel):
    pass

class RelatedArtifactsAndLevels(FlxModel):
    pass

class Vocabularies(FlxModel):
    pass

class ArtifactHasVocabularies(FlxModel):
    pass

class ArtifactsAndVocabularies(FlxModel):
    def asDict(self):
        vocabularyInfo = {
                        'artifactID': self.id,
                        'sequence': self.sequence,
                        'term': self.term,
                        'definition': self.definition,
                        'languageCode': self.languageCode,
                        'languageName': self.languageName,
                     }

        return vocabularyInfo 

class RwaVote(FlxModel):
    pass


class RwaVote(FlxModel):
    pass

class StandardsBoardsSubjectsAndGrades(FlxModel):
    pass

class Assignment(FlxModel):
    def asDict(self):
        due = self.due
        if not due or due == 0:
            due = ''
        assignmentInfo = {
            'assignmentID': self.assignmentID,
            'groupID': self.groupID,
            'assignmentType': self.assignmentType,
            'due': due,
            'origin': self.origin,
        }
        return assignmentInfo

class MemberStudyTrackItemStatus(FlxModel):
    def asDict(self):
        statusInfo = {
            'memberID': self.memberID,
            'assignmentID': self.assignmentID,
            'studyTrackItemID': self.studyTrackItemID,
            'status': self.status,
            'score': self.score,
            'lastAccess': self.lastAccess,
        }
        return statusInfo

class StudyTrackItemContext(FlxModel):
    pass

class MemberSelfStudyItemStatus(FlxModel):
    def asDict(self):
        memberSelfStudyItemDict = {}
        memberSelfStudyItemDict['memberID'] = self.memberID
        memberSelfStudyItemDict['domainID'] = self.domainID
        memberSelfStudyItemDict['domainEncodedID'] = self.item.encodedID
        memberSelfStudyItemDict['conceptCollectionHandle'] = self.conceptCollectionHandle
        memberSelfStudyItemDict['collectionCreatorID'] = self.collectionCreatorID
        memberSelfStudyItemDict['contextUrl'] = self.contextUrl
        memberSelfStudyItemDict['status'] = self.status
        memberSelfStudyItemDict['score'] = self.score
        memberSelfStudyItemDict['lastAccess'] = self.lastAccess
        return memberSelfStudyItemDict
                            
class LMSProvider(FlxModel):
    def asDict(self):
        return {
                'id': self.id,
                'name': self.name,
                'description': self.description
                }

class LMSProviderApp(FlxModel):
    pass

class LMSProviderGroup(FlxModel):
    def asDict(self):
        lmsGroup = {
            'appID': self.appID,
            'providerGroupID': self.providerGroupID,
            'groupID': self.groupID,
            'title': self.title,
            'creationTime': self.creationTime,
            'updateTime': self.updateTime,
        }
        return lmsGroup

class LMSProviderGroupMember(FlxModel):
    pass

class LMSProviderAssignment(FlxModel):
    pass

class LMSProviderAssignmentScore(FlxModel):
    pass

class Course(FlxModel):
	def getTitle(self):
		return self.title
	
	def getDescription(self):
		return self.description
	
	def getShortname(self):
		return self.shortname

	def asDict(self):
		courseDict={
			'handle': self.handle,
			'shortName': self.shortName,
			'title': self.title,
			'description': self.description,
			'creationTime': self.creationTime,
			'updateTime': self.updateTime
		}
		return courseDict

class EmailReceiver(FlxModel):
    pass

class EmailSender(FlxModel):
    pass

class EmailSharing(FlxModel):
    pass

class BookEditingAssignment(FlxModel):
    pass


class BookEditingDraft(FlxModel):
    pass

class BookFinalization(FlxModel):
    pass

class BookFinalizationLock(FlxModel):
    pass

class ConceptMapFeedback(FlxModel):
    pass

class TeacherStudentRelation(FlxModel):
    pass

class MigratedConcept(FlxModel):
    pass

########## Reviewed Object Table Mappings ##########

orm.mapper(ArtifactDraft, meta.ArtifactDraft,
           properties={
            'type': orm.relation(ArtifactType, lazy='select'),
            'creator': orm.relation(Member, lazy='select'),
            'revision': orm.relation(ArtifactRevision, lazy='select')
           }
          )

####################################################

"""
    1.  Map tables to classes.
    2.  Set up one-to-one, many-to-one, and many-to-many relationships.
    3.  Add attributes converting identifiers to instances.
"""

orm.mapper(ArtifactHandle, meta.ArtifactHandles)

orm.mapper(ArtifactAuthor, meta.ArtifactAuthors,
        properties = {
            'role': orm.relation(MemberRole,
                primaryjoin=meta.ArtifactAuthors.c.roleID == meta.MemberRoles.c.id,
                lazy='select')
        }
    )

orm.mapper(ArtifactAttributer, meta.ArtifactAttributers,
        properties = {
            'role': orm.relation(MemberRole,
                primaryjoin=meta.ArtifactAttributers.c.roleID == meta.MemberRoles.c.id,
                lazy='select')
        }
    )

orm.mapper(ArtifactContributionType, meta.ArtifactContributionType)

orm.mapper(FeaturedArtifact, meta.FeaturedArtifacts)
orm.mapper(TypedFeaturedArtifact, meta.TypedFeaturedArtifacts)

orm.mapper(License, meta.Licenses)

artifactMapper = \
    orm.mapper(Artifact, meta.Artifacts,
               properties={
                'revisions': orm.relation(ArtifactRevision,
                                          primaryjoin=meta.Artifacts.c.id == meta.ArtifactRevisions.c.artifactID,
                                          order_by=[desc(meta.ArtifactRevisions.c.id)],
                                          cascade='all, delete-orphan',
                                          back_populates='artifact'),
                'authors': orm.relation(ArtifactAuthor,
                                         lazy='select',
                                         cascade='all, delete-orphan',
                                         primaryjoin=meta.Artifacts.c.id == meta.ArtifactAuthors.c.artifactID,
                                         order_by=[meta.ArtifactAuthors.c.roleID, meta.ArtifactAuthors.c.sequence]),
                'ancestor': orm.relation(ArtifactRevision,
                                         primaryjoin=meta.Artifacts.c.ancestorID == meta.ArtifactRevisions.c.id,
                                         uselist=False, lazy='select'),
                'creator': orm.relation(Member,
                                        primaryjoin=meta.Artifacts.c.creatorID == meta.Members.c.id,
                                        uselist=False, lazy='select'),
                'browseTerms': orm.relation(BrowseTerm,
                                            secondary=meta.ArtifactHasBrowseTerms,
                                            lazy='select',
                                            cascade='all',
                                            passive_deletes=True),
                'tagTerms': orm.relation(TagTerm,
                                         secondary=meta.ArtifactHasTagTerms,
                                         lazy='select',
                                         cascade='all',
                                         passive_deletes=True),
                'searchTerms': orm.relation(SearchTerm,
                                            secondary=meta.ArtifactHasSearchTerms,
                                            lazy='select',
                                            cascade='all',
                                            passive_deletes=True),
                'feedBacks': orm.relation(ArtifactFeedback, lazy='select'),
                'feedbacks': orm.relation(ArtifactFeedbackAndCount, lazy='select', viewonly=True),
                'type': orm.relation(ArtifactType, uselist=False, lazy='select'),
                'viewed': orm.relation(MemberViewedArtifact, cascade='all, delete-orphan'),
                'sortableName': orm.column_property((func.substring_index(meta.Artifacts.c.name, '-::of::-', 1)).label('sortableName')),
                'license': orm.relation(License, uselist=False, lazy='select'),
                'language': orm.relation(Language, uselist=False, lazy='select'),
                'attributers': orm.relation(ArtifactAttributer, cascade='all, delete-orphan', lazy='select'), 
                'related': orm.relation(RelatedArtifact, cascade='all, delete-orphan'),
                'vocabulary': orm.relation(ArtifactHasVocabularies,
                                           primaryjoin=meta.Artifacts.c.id == meta.ArtifactHasVocabularies.c.artifactID,
                                           lazy='select',
                                           cascade='all',
                                           passive_deletes=True),
                'handles': orm.relation(ArtifactHandle,
                                        primaryjoin=meta.Artifacts.c.id == meta.ArtifactHandles.c.artifactID,
                                        cascade='all, delete-orphan',
                                        passive_deletes=True,
                                        single_parent=True,
                                        backref='artifact'),
                'contributionType': orm.relation(ArtifactContributionType, uselist=False, lazy='select'),
                'domainCollectionContexts': orm.relation(RelatedArtifact,
                                        primaryjoin=meta.Artifacts.c.id == meta.RelatedArtifacts.c.artifactID,
                                        cascade='all, delete-orphan',
                                        passive_deletes=True,
                                        back_populates='artifact'),
                'studyTrackItemContexts': orm.relation(StudyTrackItemContext,
                                        primaryjoin=meta.Artifacts.c.id == meta.StudyTrackItemContexts.c.studyTrackID,
                                        cascade='all, delete-orphan',
                                        passive_deletes=True,
                                        backref='studyTrackArtifact'),
                'studyTrackContexts': orm.relation(StudyTrackItemContext,
                                        primaryjoin=meta.Artifacts.c.id == meta.StudyTrackItemContexts.c.studyTrackItemID,
                                        cascade='all, delete-orphan',
                                        passive_deletes=True,
                                        backref='studyTrackItemArtifact'),
                'contributionType': orm.relation(ArtifactContributionType, uselist=False, lazy=False),
               }
              )

artifactsAndBrowseTermsMapper = \
    orm.mapper(ArtifactsAndBrowseTerms, meta.ArtifactsAndBrowseTerms,
               properties={
                'type': orm.relation(ArtifactType, uselist=False),
               }
              )

artifactsAndTagTermsMapper = \
    orm.mapper(ArtifactsAndTagTerms, meta.ArtifactsAndTagTerms,
        properties={
            'type': orm.relation(ArtifactType, uselist=False),
        }
    )

artifactsAndSearchTermsMapper = \
    orm.mapper(ArtifactsAndSearchTerms, meta.ArtifactsAndSearchTerms,
        properties={
            'type': orm.relation(ArtifactType, uselist=False),
        }
    )

artifactAndChildren = \
    orm.mapper(ArtifactAndChildren, meta.ArtifactAndChildren)

orm.mapper(ArchivedMemberStudyTrackItemStatus, meta.ArchivedMemberStudyTrackItemStatus)
orm.mapper(ArtifactHasBrowseTerms, meta.ArtifactHasBrowseTerms)
orm.mapper(ArtifactHasTagTerms, meta.ArtifactHasTagTerms)
orm.mapper(ArtifactHasSearchTerms, meta.ArtifactHasSearchTerms)
orm.mapper(StopWord, meta.StopWords)
orm.mapper(ArtifactRevisionHasStandards, meta.ArtifactRevisionHasStandards)
orm.mapper(ArtifactRevision, meta.ArtifactRevisions,
           properties={
            'artifact': orm.relation(Artifact,
                                    primaryjoin=meta.ArtifactRevisions.c.artifactID == meta.Artifacts.c.id,
                                    back_populates='revisions', lazy='joined'),
            'resourceRevisions': orm.relation(ResourceRevision,
                                              lazy='select',
                                              order_by=[desc(meta.ResourceRevisions.c.id)],
                                              cascade='all',
                                              passive_deletes=True,
                                              secondary=meta.ArtifactRevisionHasResources),
            'children': orm.relation(ArtifactRevisionRelation,
                                     primaryjoin=meta.ArtifactRevisions.c.id == meta.ArtifactRevisionRelations.c.artifactRevisionID,
                                     order_by=[asc(meta.ArtifactRevisionRelations.c.sequence)],
                                     cascade='all, delete-orphan',
                                     passive_deletes=True,
                                     lazy='select',
                                     backref='parent'),
            'parents': orm.relation(ArtifactRevisionRelation,
                                    primaryjoin=meta.ArtifactRevisions.c.id == meta.ArtifactRevisionRelations.c.hasArtifactRevisionID,
                                    order_by=[asc(meta.ArtifactRevisionRelations.c.artifactRevisionID)],
                                    passive_deletes=True,
                                    cascade='all, delete-orphan',
                                    backref='child'),
            'standards': orm.relation(Standard,
                                      lazy='select',
                                      secondary=meta.ArtifactRevisionHasStandards),
            'publishRequests': orm.relation(PublishRequest, cascade='all, delete-orphan'),
           }
          )
orm.mapper(ArtifactRevisionHasResources, meta.ArtifactRevisionHasResources)
orm.mapper(ArtifactRevisionRelation, meta.ArtifactRevisionRelations)
orm.mapper(ArtifactRevisionFavorite, meta.ArtifactRevisionFavorites)

artifactFeedbackMapper = \
    orm.mapper(ArtifactFeedback, meta.ArtifactFeedbacks,
               properties={
                'member': orm.relation(Member,
                                        primaryjoin=meta.ArtifactFeedbacks.c.memberID == meta.Members.c.id,
                                        lazy='select'),
                'reviews': orm.relation(ArtifactFeedbackReview,
                                        primaryjoin=(meta.ArtifactFeedbackReviews.c.artifactID == meta.ArtifactFeedbacks.c.artifactID) & \
                                                    (meta.ArtifactFeedbackReviews.c.memberID == meta.ArtifactFeedbacks.c.memberID) & \
                                                    (meta.ArtifactFeedbackReviews.c.type == meta.ArtifactFeedbacks.c.type),
                                        ),
                'helpfuls': orm.relation(ArtifactFeedbackHelpful,
                                        primaryjoin=(meta.ArtifactFeedbackHelpful.c.artifactID == meta.ArtifactFeedbacks.c.artifactID) & \
                                                    (meta.ArtifactFeedbackHelpful.c.memberID == meta.ArtifactFeedbacks.c.memberID) & \
                                                    (meta.ArtifactFeedbackHelpful.c.type == meta.ArtifactFeedbacks.c.type),
                                        ),
                'abuseReports': orm.relation(ArtifactFeedbackAbuseReport,
                                        primaryjoin=(meta.ArtifactFeedbackAbuseReports.c.artifactID == orm.foreign(meta.ArtifactFeedbacks.c.artifactID)) & \
                                                    (meta.ArtifactFeedbackAbuseReports.c.memberID == orm.foreign(meta.ArtifactFeedbacks.c.memberID)),
                                        uselist=True
                                        )
               }
              )

artifactFeedbackReviewMapper = \
    orm.mapper(ArtifactFeedbackReview, meta.ArtifactFeedbackReviews,
               properties={
                'member': orm.relation(Member,
                                        primaryjoin=meta.ArtifactFeedbackReviews.c.reviewersMemberID == meta.Members.c.id,
                                        lazy='select'),
                'abuseReports': orm.relation(ArtifactFeedbackReviewAbuseReport,
                                        primaryjoin=meta.ArtifactFeedbackReviewAbuseReports.c.artifactFeedbackReviewID  == meta.ArtifactFeedbackReviews.c.id,
                                        )
               }
              )

artifactFeedbackHelpfulMapper = \
    orm.mapper(ArtifactFeedbackHelpful, meta.ArtifactFeedbackHelpful,
               properties={
                'member': orm.relation(Member,
                                        primaryjoin=meta.ArtifactFeedbackHelpful.c.reviewersMemberID == meta.Members.c.id,
                                        lazy='select'),
               }
              )

orm.mapper(ArtifactFeedbackAbuseReport, meta.ArtifactFeedbackAbuseReports,
               properties={
                'member': orm.relation(Member,
                                        primaryjoin=meta.ArtifactFeedbackAbuseReports.c.reporterMemberID == meta.Members.c.id,
                                        lazy='select'),
               }
              )

orm.mapper(ArtifactFeedbackReviewAbuseReport, meta.ArtifactFeedbackReviewAbuseReports,
               properties={
                'member': orm.relation(Member,
                                        primaryjoin=meta.ArtifactFeedbackReviewAbuseReports.c.reporterMemberID == meta.Members.c.id,
                                        lazy='select'),
               }
              )

orm.mapper(ArtifactFeedbackAndCount, meta.ArtifactFeedbackAndCount)
orm.mapper(ArtifactFeedbackHelpfulAndCount, meta.ArtifactFeedbackHelpfulAndCount)
orm.mapper(PublishRequest, meta.PublishRequests)
orm.mapper(ArtifactType, meta.ArtifactTypes)
orm.mapper(GroupActivity, meta.GroupActivities,
           properties={
            'owner': orm.relation(Member,
                                        primaryjoin=meta.GroupActivities.c.ownerID == meta.Members.c.id,
                                        uselist=False),
            'group': orm.relation(Group,
                                        primaryjoin=meta.Groups.c.id == meta.GroupActivities.c.groupID,
                                        uselist=False),
           }
          )

orm.mapper(MemberViewedGroupActivity, meta.MemberViewedGroupActivities)

orm.mapper(SharedArtifact, meta.SharedArtifacts,
           properties={
            'artifact': orm.relation(Artifact, uselist=False),
            'member': orm.relation(Member, uselist=False),
            'role': orm.relation(MemberRole, uselist=False),
           }
          )

orm.mapper(BrowseTermType, meta.BrowseTermTypes)
orm.mapper(BrowseTerm, meta.BrowseTerms,
           properties={
            'type': orm.relation(BrowseTermType, uselist=False, lazy='select'),
            'parent': orm.relation(BrowseTerm,
                                   remote_side=[meta.BrowseTerms.c.id], lazy='select'),
            'standards': orm.relation(Standard,
                                      secondary=meta.DomainHasStandards, lazy='select'),
           }
          )

orm.mapper(TagTerm, meta.TagTerms)

orm.mapper(SearchTerm, meta.SearchTerms)

orm.mapper(PseudoDomainHandleSequencer, meta.PseudoDomainHandleSequencer)

orm.mapper(BrowseTermHasSynonyms, meta.BrowseTermHasSynonyms,
        properties={
            'term': orm.relation(BrowseTerm,
                primaryjoin=meta.BrowseTerms.c.id == meta.BrowseTermHasSynonyms.c.termID, uselist=False),
            'synonym': orm.relation(BrowseTerm,
                primaryjoin=meta.BrowseTerms.c.id == meta.BrowseTermHasSynonyms.c.synonymTermID, uselist=False)
            }
        )

orm.mapper(DomainNeighbor, meta.DomainNeighbors,
        properties={
            'domain': orm.relation(BrowseTerm,
                primaryjoin=meta.BrowseTerms.c.id == meta.DomainNeighbors.c.domainID, uselist=False),
            'requiredDomain': orm.relation(BrowseTerm,
                primaryjoin=meta.BrowseTerms.c.id == meta.DomainNeighbors.c.requiredDomainID, uselist=False)
            }
        )

orm.mapper(EncodedIDNeighbor, meta.EncodedIDNeighbors,
        properties={
            'domain': orm.relation(BrowseTerm,
                primaryjoin=meta.BrowseTerms.c.id == meta.EncodedIDNeighbors.c.domainID, uselist=False),
            'requiredDomain': orm.relation(BrowseTerm,
                primaryjoin=meta.BrowseTerms.c.id == meta.EncodedIDNeighbors.c.requiredDomainID, uselist=False)
            }
        )


orm.mapper(Language, meta.Languages)
orm.mapper(Resource, meta.Resources,
           properties={
            'revisions': orm.relation(ResourceRevision,
                                      primaryjoin=meta.Resources.c.id == meta.ResourceRevisions.c.resourceID,
                                      order_by=[desc(meta.ResourceRevisions.c.id)],
                                      back_populates='resource',
                                      cascade='delete'),
            'type': orm.relation(ResourceType,
                                 lazy='select',
                                 uselist=False),
            'owner': orm.relation(Member,
                                  lazy='select',
                                  uselist=False),
            'language': orm.relation(Language,
                                     lazy='select',
                                     uselist=False),
            'boxDocuments': orm.relation(InlineResourceDocument,
                                     backref='resource',
                                     uselist=False,
                                     cascade='delete'),
            'inlineDocuments': orm.relation(InlineResourceDocument, cascade='delete', lazy='select'),
            'embeddedObjects': orm.relation(EmbeddedObject, back_populates='resource', cascade='delete', lazy='select'),
            'contents': orm.relation(Content,
                                     primaryjoin=and_(meta.Resources.c.uri == meta.Contents.c.resourceURI, meta.Resources.c.ownerID==meta.Contents.c.ownerID),
                                     order_by=[desc(meta.Contents.c.contentRevisionID)],
                                     back_populates='resource',
                                     cascade='delete', lazy='select')
           }
          )

orm.mapper(InlineResourceDocument, meta.InlineResourceDocuments)
orm.mapper(ResourceRevision, meta.ResourceRevisions,
            properties={
                'resource': orm.relation(Resource,
                                                 primaryjoin=meta.ResourceRevisions.c.resourceID == meta.Resources.c.id,
                                                 back_populates='revisions',
                                                 lazy='select'
                                                 ),            
                'abuseReports': orm.relation(AbuseReport, back_populates='resourceRevision', lazy='select')
            }
        )
orm.mapper(RevisionAndResources, meta.RevisionAndResources,
            properties={
                'artifactRevision': orm.relation(ArtifactRevision,
                                                 primaryjoin=meta.RevisionAndResources.c.revID == meta.ArtifactRevisions.c.id,
                                                 lazy='select',
                                                 ),
                'resourceRevision': orm.relation(ResourceRevision,
                                                 primaryjoin=meta.RevisionAndResources.c.id == meta.ResourceRevisions.c.id,
                                                 lazy='select'
                                                 ),
                'resource': orm.relation(Resource,
                                                 primaryjoin=meta.RevisionAndResources.c.resourceID == meta.Resources.c.id,
                                                 lazy='select'
                                                 ),
            }
        )
orm.mapper(ResourceType, meta.ResourceTypes)

orm.mapper(WorkDirectory, meta.WorkDirectory)
orm.mapper(MathImage, meta.MathImage)

orm.mapper(Group, meta.Groups,
           properties={
            'parent': orm.relation(Group, uselist=False, lazy='select'),
            'creator': orm.relation(Member,
                primaryjoin=meta.Groups.c.creatorID == meta.Members.c.id, lazy='select'),
            'resourceRevision': orm.relation(ResourceRevision,
                primaryjoin=meta.Groups.c.resourceRevisionID == meta.ResourceRevisions.c.id, lazy='select'),
            'lmsGroups': orm.relation(LMSProviderGroup,
                primaryjoin=meta.Groups.c.id == meta.LMSProviderGroups.c.groupID, backref='group'),
            'membersCount': orm.column_property(
                select([func.count(meta.GroupHasMembers.c.groupID)]).where(meta.GroupHasMembers.c.groupID==meta.Groups.c.id).correlate(meta.Groups),
                deferred=True
            ),
            'resourcesCount': orm.column_property(
                select([func.count(distinct(meta.GroupActivities.c.objectID))]).where(and_(meta.GroupActivities.c.groupID==meta.Groups.c.id, meta.GroupActivities.c.activityType=='share')).correlate(meta.Groups),
                deferred=True
            ),
            'totalAssignmentsCount': orm.column_property(
                select([func.count(distinct(meta.Assignments.c.assignmentID))]).where(and_(meta.Assignments.c.groupID==meta.Groups.c.id, meta.Assignments.c.assignmentType=='assignment')).correlate(meta.Groups),
                deferred=True
            ),
            'members': orm.relation(GroupHasMembers, primaryjoin=meta.Groups.c.id==meta.GroupHasMembers.c.groupID, cascade='all, delete-orphan'
            ),
            'assignments': orm.relation(Assignment, primaryjoin=meta.Groups.c.id==meta.Assignments.c.groupID, cascade='all, delete-orphan'),
            'subjects': orm.relation(Subject, secondary=meta.GroupHasSubjects),
            'grades': orm.relation(Grade, secondary=meta.GroupHasGrades),
            'additionalMetadata': orm.relation(
                ForumMetadata, primaryjoin=meta.Groups.c.id == meta.ForumMetadata.c.groupID, cascade='all, delete-orphan'),
           }
          )
orm.mapper(Country, meta.Countries)

orm.mapper(ActionType, meta.ActionTypes)
orm.mapper(AccessControl, meta.AccessControls)
orm.mapper(GroupHasArtifacts, meta.GroupHasArtifacts,
           properties={
            'artifacts': orm.relation(Artifact),
           }
          )

orm.mapper(MemberRole, meta.MemberRoles)
orm.mapper(GroupMemberStates, meta.GroupMemberStates),
orm.mapper(GroupHasMembers, meta.GroupHasMembers,
           properties={
            'member_info': orm.relation(Member,
                primaryjoin=meta.GroupHasMembers.c.memberID == meta.Members.c.id,
                lazy='select'),
            'group': orm.relation(Group),
            'role': orm.relation(MemberRole,
                primaryjoin=meta.GroupHasMembers.c.roleID == meta.MemberRoles.c.id,
                lazy='select'),
            'status': orm.relation(GroupMemberStates,
                primaryjoin=meta.GroupHasMembers.c.statusID == meta.GroupMemberStates.c.id,
                lazy='select'),
           }
          )

orm.mapper(Member, meta.Members,
           properties={
            'favorites': orm.relation(ArtifactRevisionFavorite, backref='member', cascade='delete'),
            'viewed': orm.relation(MemberViewedArtifact, cascade='delete'),
            'events': orm.relation(Event, primaryjoin=meta.Members.c.id==meta.Events.c.subscriberID, cascade='delete'),
            'ownedEvents': orm.relation(Event, primaryjoin=meta.Members.c.id==meta.Events.c.ownerID, cascade='delete'),
            'notifications': orm.relation(Notification, cascade='delete'),
            'groupRoles': orm.relation(GroupHasMembers, primaryjoin=meta.Members.c.id==meta.GroupHasMembers.c.memberID, cascade='delete', lazy='select'),
            'systemRoles': orm.relation(GroupHasMembers, primaryjoin=and_(meta.Members.c.id==meta.GroupHasMembers.c.memberID, meta.GroupHasMembers.c.groupID==1), lazy='select'),
            'libraryObjects': orm.relation(MemberLibraryObject, cascade='delete'),
            'labels': orm.relation(MemberLabel, cascade='delete', lazy='select'),
            'tasks': orm.relation(Task, cascade='delete'),
            'grades': orm.relationship(Grade, secondary=meta.MemberHasGrades),
            'subjects': orm.relationship(Subject, secondary=meta.MemberHasSubjects),
            'studyTrackStatus': orm.relationship(MemberStudyTrackItemStatus, cascade='delete', lazy='select'),
            'resources': orm.relationship(Resource, cascade='delete', lazy='select'),
            'accessTime': orm.relationship(MemberAccessTime, cascade='delete', lazy='select'),
            'eflexDetails': orm.relationship(EflexUserDetail, cascade='delete', lazy='select'),
           }
          )
orm.mapper(MemberAccessTime, meta.MemberAccessTimes)
orm.mapper(MemberAuthApproval, meta.MemberAuthApprovals)
orm.mapper(MemberViewedArtifact, meta.MemberViewedArtifacts)
orm.mapper(CampaignMember, meta.CampaignMembers)
orm.mapper(TypedMemberViewedArtifact, meta.TypedMemberViewedArtifacts)
orm.mapper(TypedArtifactFavorite, meta.TypedArtifactFavorites)
orm.mapper(MemberHasGrades, meta.MemberHasGrades)
orm.mapper(MemberHasSubjects, meta.MemberHasSubjects)
orm.mapper(GroupHasSubjects, meta.GroupHasSubjects)
orm.mapper(GroupHasGrades, meta.GroupHasGrades)


orm.mapper(ForumMetadata, meta.ForumMetadata,
           properties={
            'roles': orm.relation(MemberRole, lazy='select')
           })

orm.mapper(Grade, meta.Grades)
orm.mapper(Subject, meta.Subjects)
orm.mapper(StandardBoard, meta.StandardBoards,
           properties={
            'country': orm.relation(Country, uselist=False, lazy='select'),
           }
          )
orm.mapper(StandardHasGrades, meta.StandardHasGrades)
orm.mapper(Standard, meta.Standards,
           properties={
            'grades': orm.relation(Grade,
                                   secondary=meta.StandardHasGrades, lazy='select'),
            'subject': orm.relation(Subject,
                                    uselist=False, lazy='select'),
            'standardBoard': orm.relation(StandardBoard,
                                          uselist=False, lazy='select'),
           }
          )
orm.mapper(RevisionAndStandards, meta.RevisionAndStandards,
        properties={
            'standard': orm.relation(Standard, primaryjoin=meta.RevisionAndStandards.c.standardID == meta.Standards.c.id),
        }
    )
orm.mapper(StandardAndGrades, meta.StandardAndGrades)
orm.mapper(ArtifactsStandardsGradesAndBrowseTerms, meta.ArtifactsStandardsGradesAndBrowseTerms)

orm.mapper(BrowseTermCandidates, meta.BrowseTermCandidates,
            properties={
                'category': orm.relation(BrowseTerm,
                    primaryjoin=meta.BrowseTermCandidates.c.categoryID == meta.BrowseTerms.c.id),
            }
        )

orm.mapper(Task, meta.Tasks,
        properties={
            'owner': orm.relation(Member, primaryjoin=meta.Tasks.c.ownerID == meta.Members.c.id),
        }
    )

orm.mapper(EmbeddedObjectProvider, meta.EmbeddedObjectProviders)

orm.mapper(EmbeddedObject, meta.EmbeddedObjects,
        properties = {
            'provider': orm.relation(EmbeddedObjectProvider, primaryjoin=meta.EmbeddedObjects.c.providerID == meta.EmbeddedObjectProviders.c.id, lazy='select'),
            'resource': orm.relation(Resource, back_populates='embeddedObjects', lazy='select')
        }
    )

orm.mapper(AbuseReason, meta.AbuseReasons)
orm.mapper(AbuseReport, meta.AbuseReports,
        properties={
            'resourceRevision': orm.relation(ResourceRevision, lazy='select'),
            'artifact': orm.relation(Artifact, primaryjoin=meta.AbuseReports.c.artifactID == meta.Artifacts.c.id, lazy='select'),
            'reporter': orm.relation(Member, primaryjoin=meta.AbuseReports.c.reporterID == meta.Members.c.id, lazy='select'),
            'reviewer': orm.relation(Member, primaryjoin=meta.AbuseReports.c.reviewerID == meta.Members.c.id, lazy='select'),
            'abuseReason': orm.relation(AbuseReason, lazy='select')
        }
    )

orm.mapper(DomainUrl, meta.DomainUrls,
            properties={
                'domain': orm.relation(BrowseTerm, primaryjoin=meta.DomainUrls.c.domainID == meta.BrowseTerms.c.id),
            }
        )

orm.mapper(Retrolation, meta.Retrolation,
            properties={
                'domain': orm.relation(BrowseTerm, primaryjoin=meta.Retrolation.c.domainEID == meta.BrowseTerms.c.encodedID),
            }
        )

orm.mapper(EmbeddedObjectCache, meta.EmbeddedObjectCache)

orm.mapper(ArtifactAndResources, meta.ArtifactAndResources, 
        properties={
            'artifact': orm.relation(Artifact, primaryjoin=meta.ArtifactAndResources.c.artifactID == meta.Artifacts.c.id, lazy='select'),
            'resource': orm.relation(Resource, primaryjoin=meta.ArtifactAndResources.c.id == meta.Resources.c.id, lazy='select'),
         }
    )

orm.mapper(DownloadStats, meta.DownloadStats)

orm.mapper(EventType, meta.EventTypes)

orm.mapper(Event, meta.Events,
        properties={
            'eventType': orm.relation(EventType, primaryjoin=meta.EventTypes.c.id == meta.Events.c.eventTypeID, lazy='select'),
            'owner': orm.relation(Member, primaryjoin=meta.Events.c.ownerID == meta.Members.c.id, lazy='select'),
            'subscriber': orm.relation(Member, primaryjoin=meta.Events.c.subscriberID == meta.Members.c.id, lazy='select'),
        }
    )

orm.mapper(NotificationRule, meta.NotificationRules)

orm.mapper(Notification, meta.Notifications,
        properties={
            'eventType': orm.relation(EventType, primaryjoin=meta.EventTypes.c.id == meta.Notifications.c.eventTypeID, lazy='select'),
            'rule': orm.relation(NotificationRule, primaryjoin=meta.NotificationRules.c.id == meta.Notifications.c.ruleID, lazy='select'),
            'subscriber': orm.relation(Member, primaryjoin=meta.Notifications.c.subscriberID == meta.Members.c.id, lazy='select'),
        }
    )

orm.mapper(EflexUserDetail, meta.EflexUserDetails,
            properties={
                'eflexRequests': orm.relation(EflexUserRequest, 
                    primaryjoin=meta.EflexUserDetails.c.id == meta.EflexUserRequests.c.eflexUserDetailID,
                    lazy='select',
                    cascade='delete'),
            }
           )

orm.mapper(EflexUserRequest, meta.EflexUserRequests)

orm.mapper(MemberLibraryObject, meta.MemberLibraryObjects,
        properties={
            'member': orm.relation(Member, primaryjoin=meta.MemberLibraryObjects.c.memberID == meta.Members.c.id, lazy='select'),
            'domain': orm.relation(BrowseTerm, primaryjoin=meta.MemberLibraryObjects.c.domainID == meta.BrowseTerms.c.id, lazy='select'),
            'labels': orm.relationship(MemberLibraryObjectHasLabel, 
                primaryjoin=meta.MemberLibraryObjects.c.id == meta.MemberLibraryObjectHasLabels.c.libraryObjectID, lazy='select', 
                cascade='all, delete-orphan'),
        }
    )

orm.mapper(MemberLibraryArtifactRevision, meta.MemberLibraryArtifactRevisions,
        properties={
            'member': orm.relation(Member, primaryjoin=meta.MemberLibraryArtifactRevisions.c.memberID == meta.Members.c.id, lazy='select'),
            'artifactRevision': orm.relation(ArtifactRevision, primaryjoin=meta.MemberLibraryArtifactRevisions.c.artifactRevisionID == meta.ArtifactRevisions.c.id, lazy='select'),
            'sortableName': orm.column_property((func.substring_index(meta.MemberLibraryArtifactRevisions.c.name, '-::of::-', 1)).label('sortableName')),
            'domain': orm.relation(BrowseTerm, primaryjoin=meta.MemberLibraryArtifactRevisions.c.domainID == meta.BrowseTerms.c.id, lazy='select'),
            'labels': orm.relationship(MemberLibraryArtifactRevisionHasLabel, 
                primaryjoin=and_(meta.MemberLibraryArtifactRevisions.c.id == meta.MemberLibraryArtifactRevisionHasLabels.c.libraryObjectID,
                    meta.MemberLibraryArtifactRevisionHasLabels.c.labelID != None), lazy='select', cascade='all, delete-orphan'),
        }
    )

orm.mapper(MemberLibraryArtifactRevisionsAndBrowseTerm, meta.MemberLibraryArtifactRevisionsAndBrowseTerms,
        properties={
            'member': orm.relation(Member, primaryjoin=meta.MemberLibraryArtifactRevisionsAndBrowseTerms.c.memberID == meta.Members.c.id, lazy='select'),
            'domain': orm.relation(BrowseTerm, primaryjoin=meta.MemberLibraryArtifactRevisionsAndBrowseTerms.c.domainID == meta.BrowseTerms.c.id, lazy='select'),
            'artifactRevision': orm.relation(ArtifactRevision, primaryjoin=meta.MemberLibraryArtifactRevisionsAndBrowseTerms.c.artifactRevisionID == meta.ArtifactRevisions.c.id, lazy='select'),
            'sortableName': orm.column_property((func.substring_index(meta.MemberLibraryArtifactRevisionsAndBrowseTerms.c.name, '-::of::-', 1)).label('sortableName')),
        }
    )

orm.mapper(MemberLibraryResourceRevision, meta.MemberLibraryResourceRevisions,
        properties={
            'member': orm.relation(Member, primaryjoin=meta.MemberLibraryResourceRevisions.c.memberID == meta.Members.c.id, lazy='select'),
            'domain': orm.relation(BrowseTerm, primaryjoin=meta.MemberLibraryResourceRevisions.c.domainID == meta.BrowseTerms.c.id, lazy='select'),
            'resourceRevision': orm.relationship(ResourceRevision, primaryjoin=meta.MemberLibraryResourceRevisions.c.resourceRevisionID == meta.ResourceRevisions.c.id, lazy='select'),
            'labels': orm.relationship(MemberLibraryResourceRevisionHasLabel, 
                primaryjoin=and_(meta.MemberLibraryResourceRevisions.c.id == meta.MemberLibraryResourceRevisionHasLabels.c.libraryObjectID,
                    meta.MemberLibraryResourceRevisionHasLabels.c.labelID != None), lazy='select'),
        }
    )

orm.mapper(MemberLabel, meta.MemberLabels,
        properties={
            'member': orm.relationship(Member, primaryjoin=meta.MemberLabels.c.memberID == meta.Members.c.id, lazy='select'),
        }
    )

orm.mapper(MemberLibraryObjectHasLabel, meta.MemberLibraryObjectHasLabels,
        properties={
            'label': orm.relationship(MemberLabel, primaryjoin=meta.MemberLibraryObjectHasLabels.c.labelID == meta.MemberLabels.c.id, lazy='select'),
        }
    )

orm.mapper(MemberLibraryArtifactRevisionHasLabel, meta.MemberLibraryArtifactRevisionHasLabels,
        properties={
            #'label': orm.relationship(MemberLabel, primaryjoin=meta.MemberLibraryArtifactRevisionHasLabels.c.labelID == meta.MemberLabels.c.id, lazy='joined'),
            'artifactRevision': orm.relationship(ArtifactRevision, primaryjoin=meta.MemberLibraryArtifactRevisionHasLabels.c.artifactRevisionID == meta.ArtifactRevisions.c.id, lazy='select'),
            'sortableName': orm.column_property((func.substring_index(meta.MemberLibraryArtifactRevisionHasLabels.c.name, '-::of::-', 1)).label('sortableName')),
        }
    )

orm.mapper(MemberLibraryArtifactRevisionHasLabelsAndBrowseTerm, meta.MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms,
        properties={
            'label': orm.relationship(MemberLabel, primaryjoin=meta.MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms.c.labelID == meta.MemberLabels.c.id, lazy='select'),
            'artifactRevision': orm.relationship(ArtifactRevision, primaryjoin=meta.MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms.c.artifactRevisionID == meta.ArtifactRevisions.c.id, lazy='select'),
            'sortableName': orm.column_property((func.substring_index(meta.MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms.c.name, '-::of::-', 1)).label('sortableName')),
        }
    )

orm.mapper(MemberLibraryResourceRevisionHasLabel, meta.MemberLibraryResourceRevisionHasLabels,
        properties={
            'label': orm.relationship(MemberLabel, primaryjoin=meta.MemberLibraryResourceRevisionHasLabels.c.labelID == meta.MemberLabels.c.id, lazy='select'),
            'resourceRevision': orm.relationship(ResourceRevision, primaryjoin=meta.MemberLibraryResourceRevisionHasLabels.c.resourceRevisionID == meta.ResourceRevisions.c.id, lazy='select'),
        }
    )

orm.mapper(ContentRevision, meta.ContentRevisions,
        properties={
            'contents': orm.relation(Content,
                                        primaryjoin=meta.ContentRevisions.c.id==meta.Contents.c.contentRevisionID,
                                        back_populates='revision'
                                    )
        }
    )
orm.mapper(Content, meta.Contents,
        properties={
            'resource': orm.relation(Resource,
                                        primaryjoin=and_(meta.Contents.c.resourceURI==meta.Resources.c.uri, meta.Contents.c.ownerID==meta.Resources.c.ownerID),
                                        back_populates='contents',
                                        lazy='select'
                                    ),
            'revision': orm.relation(ContentRevision,
                                        primaryjoin=meta.Contents.c.contentRevisionID==meta.ContentRevisions.c.id,
                                        back_populates='contents',
                                        lazy='select'
                                    )

        }
    )
orm.mapper(ArtifactAndRevision, meta.ArtifactAndRevisions,
        properties={
            'artifactRevision': orm.relation(ArtifactRevision, primaryjoin=meta.ArtifactAndRevisions.c.artifactRevisionID == meta.ArtifactRevisions.c.id),
            'artifact': orm.relation(Artifact, primaryjoin=meta.ArtifactAndRevisions.c.id == meta.Artifacts.c.id),
        }
    )

orm.mapper(From1xBookMember, meta.From1xBookMembers)
orm.mapper(From1xBookMemberInfo, meta.From1xBookMemberInfo)
orm.mapper(From1xBook, meta.From1xBooks)
orm.mapper(From1xChapter, meta.From1xChapters)

orm.mapper(DomainHasStandard, meta.DomainHasStandards)
orm.mapper(ArtifactDomainAndStandard, meta.ArtifactDomainAndStandards,
        properties={
            'standard': orm.relation(Standard, primaryjoin=meta.ArtifactDomainAndStandards.c.standardID == meta.Standards.c.id),
        }
    )
orm.mapper(ArtifactDomainsStandardsGradesAndBrowseTerms, meta.ArtifactDomainsStandardsGradesAndBrowseTerms)

orm.mapper(PublishedArtifact, meta.PublishedArtifacts)
orm.mapper(RelatedArtifact, meta.RelatedArtifacts,
        properties={
            'domain': orm.relationship(BrowseTerm, primaryjoin=meta.RelatedArtifacts.c.domainID == meta.BrowseTerms.c.id, lazy='select'),
            'artifact': orm.relationship(Artifact, primaryjoin=meta.Artifacts.c.id == meta.RelatedArtifacts.c.artifactID, lazy='select'),
        }
    )

orm.mapper(RelatedArtifactsBackup, meta.RelatedArtifactsBackup)

orm.mapper(RelatedArtifactsAndLevels, meta.RelatedArtifactsAndLevels,
        properties={
            'domain': orm.relationship(BrowseTerm, primaryjoin=meta.RelatedArtifactsAndLevels.c.domainID == meta.BrowseTerms.c.id, lazy='select'),
            'artifact': orm.relationship(Artifact, primaryjoin=meta.Artifacts.c.id == meta.RelatedArtifactsAndLevels.c.id, lazy='select'),
        }
    )

orm.mapper(Vocabularies, meta.Vocabularies,
        properties={
            'language': orm.relation(Language, lazy='select'),
        }
)
orm.mapper(ArtifactHasVocabularies, meta.ArtifactHasVocabularies,
        properties={
            'vocabulary': orm.relation(Vocabularies, primaryjoin=meta.ArtifactHasVocabularies.c.vocabularyID == meta.Vocabularies.c.id, lazy='select'),
        }
)
orm.mapper(ArtifactsAndVocabularies, meta.ArtifactsAndVocabularies)
orm.mapper(RwaVote, meta.RwaVotes)
orm.mapper(StandardsBoardsSubjectsAndGrades, meta.StandardsBoardsSubjectsAndGrades)
orm.mapper(Assignment, meta.Assignments,
        properties={
            'artifact': orm.relation(Artifact, primaryjoin=meta.Assignments.c.assignmentID == meta.Artifacts.c.id, uselist=False),
            'group': orm.relation(Group, primaryjoin=meta.Assignments.c.groupID == meta.Groups.c.id, uselist=False),
            'lmsAssignments': orm.relation(LMSProviderAssignment, primaryjoin=meta.Assignments.c.assignmentID == meta.LMSProviderAssignments.c.assignmentID, backref='assignment', cascade='delete'),
        }
    )
orm.mapper(MemberStudyTrackItemStatus, meta.MemberStudyTrackItemStatus,
        properties={
            'member': orm.relation(Member, primaryjoin=meta.MemberStudyTrackItemStatus.c.memberID == meta.Members.c.id, uselist=False, lazy='select'),
            'assignment': orm.relation(Assignment, primaryjoin=meta.MemberStudyTrackItemStatus.c.assignmentID == meta.Assignments.c.assignmentID, uselist=False, lazy='select', backref=orm.backref('memberStudyTrackStatuses', cascade='all')),
            'item': orm.relation(Artifact, primaryjoin=meta.MemberStudyTrackItemStatus.c.studyTrackItemID == meta.Artifacts.c.id, uselist=False, lazy='select'),
        }
    )
orm.mapper(StudyTrackItemContext, meta.StudyTrackItemContexts)

orm.mapper(LMSProvider, meta.LMSProviders)
orm.mapper(LMSProviderApp, meta.LMSProviderApps)
orm.mapper(LMSProviderGroup, meta.LMSProviderGroups)
orm.mapper(LMSProviderGroupMember, meta.LMSProviderGroupMembers)
orm.mapper(LMSProviderAssignment, meta.LMSProviderAssignments)
orm.mapper(LMSProviderAssignmentScore, meta.LMSProviderAssignmentScores)

orm.mapper(Course, meta.Courses)

orm.mapper(EmailReceiver, meta.EmailReceivers)
orm.mapper(EmailSender, meta.EmailSenders)
orm.mapper(EmailSharing, meta.EmailSharings)

orm.mapper(BookEditingAssignment, meta.BookEditingAssignments)
orm.mapper(BookEditingDraft, meta.BookEditingDrafts)
orm.mapper(BookFinalization, meta.BookFinalizations)
orm.mapper(BookFinalizationLock, meta.BookFinalizationLocks)

orm.mapper(ConceptMapFeedback, meta.ConceptMapFeedbacks)
orm.mapper(BlockedMembers, meta.BlockedMembers)
orm.mapper(TeacherStudentRelation, meta.TeacherStudentRelations,
        properties={
            'student': orm.relation(Member, primaryjoin=meta.Members.c.id == meta.TeacherStudentRelations.c.studentID, uselist=False, lazy='select'),
            'teacher': orm.relation(Member, primaryjoin=meta.Members.c.id == meta.TeacherStudentRelations.c.teacherID, uselist=False, lazy='select'),
        }
    )
orm.mapper(MigratedConcept, meta.MigratedConcepts)
orm.mapper(MemberSelfStudyItemStatus, meta.MemberSelfStudyItemStatus,        
    properties={
            'item': orm.relationship(Artifact, primaryjoin=meta.MemberSelfStudyItemStatus.c.domainID == meta.Artifacts.c.id, lazy=False),
        }
    )
