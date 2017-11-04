"""
    Map database tables to python classes.
"""

import logging
import time
from urllib import quote, unquote

from sqlalchemy import orm, desc, asc
from pylons import config
from sts.model import meta
from sts.lib import helpers as h

log = logging.getLogger(__name__)

def name2Handle(title):
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
        log.debug('name2Handle: title[%s] handle[%s]' % (title, handle))
    return handle

class TaxonomyModel(object):
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __repr__(self):
        return str(self)

class Subject(TaxonomyModel):
    def asDict(self):
        return {
                'name': self.name,
                'shortname': self.shortname,
                'description': self.description,
                'previewImageUrl': self.previewImageUrl,
                'created': str(self.created),
                'updated': str(self.updated),
                }

class Branch(TaxonomyModel):
    def asDict(self, includeSubject=True):
        info = {
                'name': self.name,
                'shortname': self.shortname,
                'description': self.description,
                'subjectID': self.subject.shortname,
                'previewImageUrl': self.previewImageUrl,
                'bisac': self.bisac,
                'created': str(self.created),
                'updated': str(self.updated),
            }
        if self.subject and includeSubject:
            info['subject'] = self.subject.asDict()

        return info

class ConceptNode(TaxonomyModel):

    PUBLISHED = 'published'
    PROPOSED = 'proposed'
    DELETED = 'deleted'

    def getOrderedEncodedID(self):
        maxLength = int(config.get('max_encode_length', 50))
        return self.encodedID.replace('.', '').ljust(50, '0')

    def asDict(self, includeParent=True, level=None):
        browseInfo = {
                        'name': self.name,
                        'handle': self.handle,
                        'encodedID': self.encodedID,
                        'description': self.description,
                        'subject': self.subject.asDict(),
                        'branch': self.branch.asDict(includeSubject=False),
                        'previewImageUrl': self.previewImageUrl,
                        'created': str(self.created),
                        'updated': str(self.updated),
                        'parent': None,
                     }
        if self.parent:
            if includeParent:
                browseInfo['parent'] = self.parent.asDict(includeParent=False)
            else:
                browseInfo['parent'] = self.parent.encodedID
        browseInfo['childCount'] = len(self.children)
        if level is not None:
            browseInfo['level'] = level
        return browseInfo

class ConceptNodeInstance(TaxonomyModel):
    def asDict(self):
        browseInfo = {
                        'conceptNode': None,
                        'artifactType': None,
                        'encodedID': None,
                        'seq': str(self.seq),
                        'sourceURL': self.sourceURL,
                        'created': str(self.created),
                        'updated': str(self.updated),
                     }
        if self.conceptNode:
            browseInfo['conceptNode'] = self.conceptNode.encodedID
        if self.artifactType:
            browseInfo['artifactType'] = self.artifactType.shortname
        if self.conceptNode and self.artifactType:
            browseInfo['encodedID'] = self.conceptNode.encodedID + '.' + self.artifactType.shortname + '.' + str(self.seq)
        return browseInfo

class ConceptNodeNeighbor(TaxonomyModel):
    pass

class ConceptNodeRelation(TaxonomyModel):

    def asDict(self):
        conceptNodeRelation = {
                        'conceptID': self.conceptID,
                        'relatedConceptID': self.relatedConceptID,
                        'relationType': self.relationType,
                     }
        return conceptNodeRelation

    pass

class ConceptKeyword(TaxonomyModel):
    pass

class ConceptNodeHasKeywords(TaxonomyModel):
    pass

class Language(TaxonomyModel):
    pass

class Country(TaxonomyModel):
    pass

class ArtifactExtensionType(TaxonomyModel):

    PUBLISHED = 'published'
    PROPOSED = 'proposed'
    DELETED = 'deleted'

    def asDict(self):
        return {
                #'id': self.id,
                'typeName': self.typeName,
                'description': self.description,
                'shortname': self.shortname,
                'status': self.status,
                'created': str(self.created),
                'updated': str(self.updated),
                }

class ActivityLog(TaxonomyModel):

    ACTIVITY_TYPE_CONCEPT_NODE_CREATE = 'CONCEPT_NODE_CREATE'
    ACTIVITY_TYPE_CONCEPT_NODE_DELETE = 'CONCEPT_NODE_DELETE'
    ACTIVITY_TYPE_CONCEPT_NODE_UPDATE = 'CONCEPT_NODE_UPDATE'

    ACTIVITY_TYPE_CONCEPT_NODE_PUBLISH = 'CONCEPT_NODE_PUBLISH'
    ACTIVITY_TYPE_CONCEPT_NODE_PURGE = 'CONCEPT_NODE_PURGE'

    ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_CREATE = 'ARTIFACT_EXTENTION_TYPE_CREATE'
    ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_CREATE_FAILED = 'ARTIFACT_EXTENTION_TYPE_CREATE_FAILED'
    ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_UPDATE = 'ARTIFACT_EXTENTION_TYPE_UPDATE'
    ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_UPDATE_FAILED = 'ARTIFACT_EXTENTION_TYPE_UPDATE_FAILED'
    ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_DELETE = 'ARTIFACT_EXTENTION_TYPE_DELETE'
    ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_DELETE_FAILED = 'ARTIFACT_EXTENTION_TYPE_DELETE_FAILED'

    ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_PUBLISH = 'ARTIFACT_EXTENTION_TYPE_PUBLISH'

    ACTIVITY_TYPE_CONCEPT_NODE_CREATE_FAILED = 'CONCEPT_NODE_CREATE_FAILED'
    ACTIVITY_TYPE_CONCEPT_NODE_UPDATE_FAILED = 'CONCEPT_NODE_UPDATE_FAILED'

    ACTIVITY_TYPE_SUBJECT_CREATE = 'SUBJECT_CREATE'
    ACTIVITY_TYPE_SUBJECT_CREATE_FAILED = 'SUBJECT_CREATE_FAILED'
    ACTIVITY_TYPE_SUBJECT_DELETE = 'SUBJECT_DELETE'
    ACTIVITY_TYPE_SUBJECT_DELETE_FAILED = 'SUBJECT_DELETE_FAILED'
    ACTIVITY_TYPE_BRANCH_CREATE = 'BRANCH_CREATE'
    ACTIVITY_TYPE_BRANCH_CREATE_FAILED = 'BRANCH_CREATE_FAILED'
    ACTIVITY_TYPE_BRANCH_DELETE = 'BRANCH_DELETE'
    ACTIVITY_TYPE_BRANCH_DELETE_FAILED = 'BRANCH_DELETE_FAILED'

    ACTIVITY_TYPE_COURSE_NODE_CREATE = 'COURSE_NODE_CREATE'
    ACTIVITY_TYPE_COURSE_NODE_PUBLISH = 'COURSE_NODE_PUBLISH'
    ACTIVITY_TYPE_COURSE_NODE_CREATE_FAILED = 'COURSE_NODE_CREATE_FAILED'
    ACTIVITY_TYPE_CREATE_COURSE_FLOW = 'ACTIVITY_TYPE_CREATE_COURSE_FLOW'
    ACTIVITY_TYPE_COURSE_FLOW_CREATE_FAILED = 'ACTIVITY_TYPE_COURSE_FLOW_CREATE_FAILED'
    ACTIVITY_TYPE_UNIT_NODE_CREATE = 'ACTIVITY_TYPE_UNIT_NODE_CREATE'
    ACTIVITY_TYPE_UNIT_NODE_CREATE_FAILED = 'ACTIVITY_TYPE_UNIT_NODE_CREATE_FAILED'

##
## Views
##

class ConceptNodesAndKeywords(TaxonomyModel):
    pass

class ConceptNodeAdjacents(TaxonomyModel):
    pass

class ConceptNodeDependees(TaxonomyModel):
    pass

class ConceptNodeSearchables(TaxonomyModel):
    pass

##
## Mappings
##

orm.mapper(Language, meta.Languages)
orm.mapper(Country, meta.Countries)
orm.mapper(Subject, meta.Subjects)
orm.mapper(Branch, meta.Branches,
        properties={
            'subject': orm.relation(Subject, lazy=False),
        }
    )


orm.mapper(ConceptNode, meta.ConceptNodes,
        properties={
            'subject': orm.relation(Subject, lazy=False),
            'branch': orm.relation(Branch, lazy=False),
            'parent': orm.relation(ConceptNode, remote_side=[meta.ConceptNodes.c.id], lazy=False),
            'keywords': orm.relation(ConceptKeyword, secondary=meta.ConceptNodeHasKeywords),
            'children': orm.relation(ConceptNode, remote_side=[meta.ConceptNodes.c.parentID], lazy=False),
        }
    )

orm.mapper(ConceptNodeNeighbor, meta.ConceptNodeNeighbors,
        properties={
            'conceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeNeighbors.c.conceptNodeID, lazy=False),
            'requiredConceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeNeighbors.c.requiredConceptNodeID, lazy=False),
        }
    )

orm.mapper(ConceptNodeRelation, meta.ConceptNodeRelations,
        properties={
            'conceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeRelations.c.conceptID, lazy=False),
            'relatedConceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeRelations.c.relatedConceptID, lazy=False),
        }
    )

orm.mapper(ConceptKeyword, meta.ConceptKeywords)

orm.mapper(ConceptNodeHasKeywords, meta.ConceptNodeHasKeywords,
        properties={
            'conceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeHasKeywords.c.conceptNodeID, lazy=False),
            'keyword': orm.relation(ConceptKeyword, primaryjoin=meta.ConceptKeywords.c.id == meta.ConceptNodeHasKeywords.c.keywordID, lazy=False),
        }
    )

orm.mapper(ConceptNodeInstance, meta.ConceptNodeInstances,
        properties={
            'conceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeInstances.c.conceptNodeID, lazy=False),
            'artifactType': orm.relation(ArtifactExtensionType, primaryjoin=meta.ArtifactExtensionTypes.c.id == meta.ConceptNodeInstances.c.artifactTypeID, lazy=False),
        }
    )

orm.mapper(ArtifactExtensionType, meta.ArtifactExtensionTypes)

orm.mapper(ActivityLog, meta.ActivityLog)

orm.mapper(ConceptNodesAndKeywords, meta.ConceptNodesAndKeywords)

orm.mapper(ConceptNodeAdjacents, meta.ConceptNodeAdjacents,
        properties = {
            'conceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeAdjacents.c.id, lazy=False),
            'parent': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeAdjacents.c.parentID, lazy=False),
        }
    )

orm.mapper(ConceptNodeDependees, meta.ConceptNodeDependees,
        properties = {
            'conceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeDependees.c.id, lazy=False),
            'requiredConceptNode': orm.relation(ConceptNode, primaryjoin=meta.ConceptNodes.c.id == meta.ConceptNodeDependees.c.requiredConceptNodeID, lazy=False),
        }
    )

orm.mapper(ConceptNodeSearchables, meta.ConceptNodeSearchables)

