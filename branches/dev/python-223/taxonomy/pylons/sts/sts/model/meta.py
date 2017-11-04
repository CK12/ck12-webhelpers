"""SQLAlchemy Metadata and Session object"""
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy import *

__all__ = ['Base', 'Session']

# SQLAlchemy session manager. Updated by model.init_model()
Session = scoped_session(sessionmaker())

# The declarative Base
Base = declarative_base()

meta = MetaData()

## Structures for Taxonomy Service
Languages = Table('Languages', meta,
  Column('id', SmallInteger(),  primary_key=True, nullable=False),
  Column('code', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=False),
)

Countries = Table('Countries', meta,
  Column('id', Integer(),  primary_key=True, nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=False),
  Column('code2Letter', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False)),
  Column('code3Letter', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False)),
  Column('codeNumeric', SmallInteger()),
  Column('image', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False)),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

Subjects = Table('Subjects', meta,
  Column('id', Integer(),  primary_key=True, nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=False),
  Column('description', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=True),
  Column('shortname', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False),  nullable=False),
  Column('previewImageUrl', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

Branches = Table('Branches', meta,
  Column('id', Integer(), primary_key=True, nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('shortname', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('subjectID', Integer(), ForeignKey('Subjects.id'), nullable=True),
  Column('description', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('previewImageUrl', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('bisac', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

ConceptNodes = Table('ConceptNodes', meta,
  Column('id', Integer(), primary_key=True, nullable=False),
  Column('encodedID', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('parentID', Integer(), ForeignKey('ConceptNodes.id'), nullable=True),
  Column('subjectID', Integer(), ForeignKey('Subjects.id'), nullable=False),
  Column('branchID', Integer(), ForeignKey('Branches.id'), nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('handle', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('description', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('previewImageUrl', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('status', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

ConceptNodeRelations = Table('ConceptNodeRelations', meta,
  Column('conceptID', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('relatedConceptID', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('relationType', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), primary_key=True, nullable=True),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

ConceptNodeNeighbors = Table('ConceptNodeNeighbors', meta,
  Column('conceptNodeID', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('requiredConceptNodeID', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
)

ConceptKeywords = Table('ConceptKeywords', meta,
  Column('id', Integer(), primary_key=True, nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
)

ConceptNodeHasKeywords = Table('ConceptNodeHasKeywords', meta,
  Column('conceptNodeID', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('keywordID', Integer(), ForeignKey('ConceptKeywords.id'), primary_key=True, nullable=False),
)

ConceptNodeInstances = Table('ConceptNodeInstances', meta,
  Column('conceptNodeID', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('artifactTypeID', Integer(), ForeignKey('ArtifactExtensionTypes.id'), primary_key=True, nullable=False),
  Column('seq', Integer(), primary_key=True, nullable=False),
  Column('sourceURL', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

ArtifactExtensionTypes = Table('ArtifactExtensionTypes', meta,
  Column('id', Integer(), primary_key=True, nullable=False),
  Column('typeName', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('description', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('shortname', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('status', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

ActivityLog = Table('ActivityLog', meta,
  Column('id', Integer(), primary_key=True, nullable=False),
  Column('activityType', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('actionObject', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('memberID', Integer(), nullable=False),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
)

ConceptNodesAndKeywords = Table("ConceptNodesAndKeywords", meta,
  Column('id', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('keywordID', Integer(), primary_key=True, nullable=False),
  Column('encodedID', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('parentID', Integer(), ForeignKey('ConceptNodes.id'), nullable=True),
  Column('subjectID', Integer(), ForeignKey('Subjects.id'), nullable=False),
  Column('branchID', Integer(), ForeignKey('Branches.id'), nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('handle', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('description', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('previewImageUrl', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('status', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
  Column('keyword', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
)

ConceptNodeAdjacents = Table("ConceptNodeAdjacents", meta,
  Column('id', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('encodedID', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('orderedEncodedID', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('subjectID', Integer(), ForeignKey('Subjects.id'), nullable=False),
  Column('branchID', Integer(), ForeignKey('Branches.id'), nullable=False),
  Column('parentID', Integer(), ForeignKey('ConceptNodes.id'), nullable=True),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('handle', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('previewImageUrl', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
)

ConceptNodeDependees = Table("ConceptNodeDependees", meta,
  Column('id', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('requiredConceptNodeID', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=True),
  Column('encodedID', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('subjectID', Integer(), ForeignKey('Subjects.id'), nullable=False),
  Column('branchID', Integer(), ForeignKey('Branches.id'), nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('handle', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('previewImageUrl', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
)

ConceptNodeSearchables = Table("ConceptNodeSearchables", meta,
  Column('id', Integer(), ForeignKey('ConceptNodes.id'), primary_key=True, nullable=False),
  Column('keywordID', Integer(), ForeignKey('ConceptKeywords.id'), primary_key=True, nullable=True),
  Column('encodedID', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('parentID', Integer(), ForeignKey('ConceptNodes.id'), nullable=True),
  Column('subjectID', Integer(), ForeignKey('Subjects.id'), nullable=False),
  Column('branchID', Integer(), ForeignKey('Branches.id'), nullable=False),
  Column('name', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('handle', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('description', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('previewImageUrl', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=True),
  Column('status', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
  Column('created', DateTime(timezone=False), nullable=False),
  Column('updated', DateTime(timezone=False), nullable=False),
  Column('keyword', String(length=None, convert_unicode=False, unicode_error=None, _warn_on_bytestring=False), nullable=False),
)


