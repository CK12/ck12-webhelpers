import logging
from flx.model import meta, model
from flx.model import exceptions
from flx.controllers.common import ArtifactCache
from flx.lib.localtime import Local
from sqlalchemy import orm
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import exc
from sqlalchemy.sql.expression import func
from urllib import quote, unquote
import json
import zlib
import re

log = logging.getLogger(__name__)

class MemberVisitorDataModel(object):
    
    def getLastReadModalities(self, modalityIDs=[]):
        meta.Session.begin()
        try:    
            modalityInfoDictMap = {}
            if modalityIDs:
                if not isinstance(modalityIDs, list) or not all(isinstance(modalityID, long) or isinstance(modalityID, int) for modalityID in modalityIDs):
                    raise exceptions.InvalidArgumentException(u"Invalid modalityIDs : [{modalityIDs}] is received. A list of integers is expected.".format(modalityIDs=modalityIDs).encode('utf-8'))
                        
                #Querying meta object for the artifact level information
                modalityInfoTuples = meta.Session.query(meta.Artifacts.c.id, meta.Artifacts.c.name, meta.Artifacts.c.handle, meta.ArtifactTypes.c.name).filter(meta.Artifacts.c.id.in_(modalityIDs)).join(meta.ArtifactTypes, meta.Artifacts.c.artifactTypeID==meta.ArtifactTypes.c.id).all()
                for modalityInfoTuple in modalityInfoTuples:
                    modalityInfoDict = {}
                    modalityInfoDict[u'modalityID'] = modalityInfoTuple[0]
                    modalityInfoDict[u'modalityTitle'] = modalityInfoTuple[1]
                    modalityInfoDict[u'modalityHandle'] = modalityInfoTuple[2]
                    modalityInfoDict[u'modalityType'] = modalityInfoTuple[3]
                    modalityInfoDictMap[modalityInfoTuple[0]] = modalityInfoDict
                
                #retreiving latestRevisionIDs
                modalityLatestRevisionIDTuples = meta.Session.query(meta.ArtifactRevisions.c.artifactID, func.max(meta.ArtifactRevisions.c.id)).filter(meta.ArtifactRevisions.c.artifactID.in_(modalityIDs)).group_by(meta.ArtifactRevisions.c.artifactID).all()
                modalityLatestRevisionIDs = []
                for modalityLatestRevisionIDTuple in modalityLatestRevisionIDTuples:
                    if not modalityInfoDictMap.has_key(modalityLatestRevisionIDTuple[0]):
                        modalityInfoDictMap[modalityLatestRevisionIDTuple[0]] = {}
                    
                    modalityInfoDictMap[modalityLatestRevisionIDTuple[0]][u'modalityLatestRevisionID'] = modalityLatestRevisionIDTuple[1]
                    modalityLatestRevisionIDs.append(modalityLatestRevisionIDTuple[1])

                #Querying model objects for artifactRevision and artifactRevisionResource infos
                modalityLatestRevisionDOs = meta.Session.query(model.ArtifactRevision).filter(model.ArtifactRevision.id.in_(modalityLatestRevisionIDs)).all()
                for modalityLatestRevisionDO in modalityLatestRevisionDOs:
                    modalityLatestRevisionCoverResources = [] #to contain the satelliteURLs of any cover resource
                    for modalityLatestRevisionResourceRevisionDO in modalityLatestRevisionDO.resourceRevisions:
                        modalityLatestRevisionResourceDO = modalityLatestRevisionResourceRevisionDO.resource
                        if modalityLatestRevisionResourceDO.type.name in ('cover page', 'cover page icon', 'cover video'):
                            modalityLatestRevisionCoverResourceDict = {}       
                            modalityLatestRevisionCoverResourceDict[u'modalityLatestRevisionCoverResourceID'] = modalityLatestRevisionResourceDO.id
                            modalityLatestRevisionCoverResourceDict[u'modalityLatestRevisionCoverResourceType'] = modalityLatestRevisionResourceDO.type.name
                            satelliteURL = None
                            if modalityLatestRevisionResourceDO.isExternal:
                                satelliteURL = modalityLatestRevisionResourceDO.uri
                            else:
                                satelliteURL = modalityLatestRevisionResourceDO.satelliteUrl
                            modalityLatestRevisionCoverResourceDict[u'modalityLatestRevisionCoverResourceSatelliteURL'] = satelliteURL
                            modalityLatestRevisionCoverResources.append(modalityLatestRevisionCoverResourceDict)

                    if not modalityInfoDictMap.has_key(modalityLatestRevisionDO.artifactID):
                        modalityInfoDictMap[modalityLatestRevisionDO.artifactID] = {}
                        modalityInfoDictMap[modalityLatestRevisionDO.artifactID][u'modalityLatestRevisionID'] = modalityLatestRevisionDO.id

                    modalityInfoDictMap[modalityLatestRevisionDO.artifactID][u'modalityLatestRevisionCoverResources'] = modalityLatestRevisionCoverResources

                #Querying meta for Artifact Domain Information

                #At this stage it is possible that some modlaityIDs from the 
                #given mongoDB-modalityIDs are not found in the dataBase. 
                #We just log them and ignore them

            meta.Session.commit()
            return modalityInfoDictMap
        except SQLAlchemyError, sqlae:
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def getLastReadConcepts(self, conceptEIDs=[]):
        meta.Session.begin()
        try:
            browseTermInfoDictMap = {}
            if conceptEIDs:
                if not isinstance(conceptEIDs, list) or not all(isinstance(conceptEID, basestring) for conceptEID in conceptEIDs) or not all((conceptEID.count('.')>=2 or conceptEID == u'')for conceptEID in conceptEIDs):
                    raise exceptions.InvalidArgumentException(u"Invalid conceptEIDs : [{conceptEIDs}] is received. A list of strings in the format of 'SUB.BRA.CONCEPT' is expected.".format(conceptEIDs=conceptEIDs).encode('utf-8'))

                conceptBranchMap = dict((conceptEID,conceptEID[:conceptEID.index('.', conceptEID.index('.')+1)])for conceptEID in conceptEIDs if conceptEID != u'')
                branchEIDs = conceptBranchMap.values()
                browseTermEIDs = conceptEIDs + branchEIDs

                #Querying meta object for the artifact level information
                browseTermInfoTuples = meta.Session.query(meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id, meta.BrowseTerms.c.name, meta.BrowseTerms.c.handle, meta.DomainUrls.c.url, meta.DomainUrls.c.iconUrl).filter(meta.BrowseTerms.c.encodedID.in_(browseTermEIDs)).join(meta.DomainUrls, meta.BrowseTerms.c.id==meta.DomainUrls.c.domainID).all()
                for browseTermInfoTuple in browseTermInfoTuples:
                    browseTermInfoDict = {}
                    browseTermInfoDict[u'browseTermEID'] = browseTermInfoTuple[0]
                    browseTermInfoDict[u'browseTermID'] = browseTermInfoTuple[1]
                    browseTermInfoDict[u'browseTermTitle'] = browseTermInfoTuple[2]
                    browseTermInfoDict[u'browseTermHandle'] = browseTermInfoTuple[3]
                    browseTermInfoDict[u'browseTermURL'] = browseTermInfoTuple[4]
                    browseTermInfoDict[u'browseTermIconURL'] = browseTermInfoTuple[5]
                    browseTermInfoDictMap[browseTermInfoTuple[0]] = browseTermInfoDict
                
                conceptInfoDictMap = {}
                for conceptEID in conceptEIDs:
                    if browseTermInfoDictMap.has_key(conceptEID):
                        conceptInfoDict = {}
                        conceptInfoDict[u'conceptEID'] = browseTermInfoDictMap[conceptEID][u'browseTermEID']
                        conceptInfoDict[u'conceptID'] = browseTermInfoDictMap[conceptEID][u'browseTermID']
                        conceptInfoDict[u'conceptTitle'] = browseTermInfoDictMap[conceptEID][u'browseTermTitle']
                        conceptInfoDict[u'conceptHandle'] = browseTermInfoDictMap[conceptEID][u'browseTermHandle']
                        conceptInfoDict[u'conceptURL'] = browseTermInfoDictMap[conceptEID][u'browseTermURL']
                        conceptInfoDict[u'conceptIconURL'] = browseTermInfoDictMap[conceptEID][u'browseTermIconURL']

                        branchEID = conceptBranchMap.get(conceptEID)
                        if browseTermInfoDictMap.has_key(branchEID):
                            conceptInfoDict[u'conceptBranch'] = {}
                            conceptInfoDict[u'conceptBranch'][u'conceptBranchEID'] = browseTermInfoDictMap[branchEID][u'browseTermEID']
                            conceptInfoDict[u'conceptBranch'][u'conceptBranchID'] = browseTermInfoDictMap[branchEID][u'browseTermID']
                            conceptInfoDict[u'conceptBranch'][u'conceptBranchTitle'] = browseTermInfoDictMap[branchEID][u'browseTermTitle']
                            conceptInfoDict[u'conceptBranch'][u'conceptBranchHandle'] = browseTermInfoDictMap[branchEID][u'browseTermHandle']
                            conceptInfoDict[u'conceptBranch'][u'conceptBranchURL'] = browseTermInfoDictMap[branchEID][u'browseTermURL']
                            conceptInfoDict[u'conceptBranch'][u'conceptBranchIconURL'] = browseTermInfoDictMap[branchEID][u'browseTermIconURL']

                        conceptInfoDictMap[conceptEID] = conceptInfoDict

                #At this stage it is possible that some conceptEIDs from the 
                #given mongoDB-conceptEIDs are not found in the dataBase. 
                #We just log them and ignore them

            meta.Session.commit()
            return conceptInfoDictMap
        except SQLAlchemyError, sqlae:
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def getLastReadBranches(self, branchEIDs=[]):
        meta.Session.begin()
        try:
            branchInfoDictMap = {}
            if branchEIDs:
                if not isinstance(branchEIDs, list) or not all(isinstance(branchEID, basestring) for branchEID in branchEIDs) or not all((branchEID.count('.') == 1 or branchEID == u'')for branchEID in branchEIDs):
                    raise exceptions.InvalidArgumentException(u"Invalid branchEIDs : [{branchEIDs}] is received. A list of strings in the format of 'SUB.BRA' is expected.".format(branchEIDs=branchEIDs).encode('utf-8'))

                #Querying meta object for the artifact level information
                branchInfoTuples = meta.Session.query(meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id, meta.BrowseTerms.c.name, meta.BrowseTerms.c.handle, meta.DomainUrls.c.url, meta.DomainUrls.c.iconUrl).filter(meta.BrowseTerms.c.encodedID.in_(branchEIDs)).join(meta.DomainUrls, meta.BrowseTerms.c.id==meta.DomainUrls.c.domainID).all()
                for branchInfoTuple in branchInfoTuples:
                    branchInfoDict = {}
                    branchInfoDict[u'branchEID'] = branchInfoTuple[0]
                    branchInfoDict[u'branchID'] = branchInfoTuple[1]
                    branchInfoDict[u'branchTitle'] = branchInfoTuple[2]
                    branchInfoDict[u'branchHandle'] = branchInfoTuple[3]
                    branchInfoDict[u'branchURL'] = branchInfoTuple[4]
                    branchInfoDict[u'branchIconURL'] = branchInfoTuple[5]
                    branchInfoDictMap[branchInfoTuple[0]] = branchInfoDict
                
                #At this stage it is possible that some branchEIDs from the 
                #given mongoDB-branchEIDs are not found in the dataBase. 
                #We just log them and ignore them

            meta.Session.commit()
            return branchInfoDictMap
        except SQLAlchemyError, sqlae:
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()

    def getLastReadSubjects(self, subjectEIDs=[]):
        meta.Session.begin()
        try:
            subjectInfoDictMap = {}
            if subjectEIDs:
                if not isinstance(subjectEIDs, list) or not all(isinstance(subjectEID, basestring) for subjectEID in subjectEIDs) or not all((subjectEID.count('.') == 0 or subjectEID == u'')for subjectEID in subjectEIDs):
                    raise exceptions.InvalidArgumentException(u"Invalid subjectEIDs : [{subjectEIDs}] is received. A list of strings in the format of 'SUB' is expected.".format(subjectEIDs=subjectEIDs).encode('utf-8'))

                #Querying meta object for the artifact level information
                subjectInfoTuples = meta.Session.query(meta.BrowseTerms.c.encodedID, meta.BrowseTerms.c.id, meta.BrowseTerms.c.name, meta.BrowseTerms.c.handle, meta.DomainUrls.c.url, meta.DomainUrls.c.iconUrl).filter(meta.BrowseTerms.c.encodedID.in_(subjectEIDs)).join(meta.DomainUrls, meta.BrowseTerms.c.id==meta.DomainUrls.c.domainID).all()
                for subjectInfoTuple in subjectInfoTuples:
                    subjectInfoDict = {}
                    subjectInfoDict[u'subjectEID'] = subjectInfoTuple[0]
                    subjectInfoDict[u'subjectID'] = subjectInfoTuple[1]
                    subjectInfoDict[u'subjectTitle'] = subjectInfoTuple[2]
                    subjectInfoDict[u'subjectHandle'] = subjectInfoTuple[3]
                    subjectInfoDict[u'subjectURL'] = subjectInfoTuple[4]
                    subjectInfoDict[u'subjectIconURL'] = subjectInfoTuple[5]
                    subjectInfoDictMap[subjectInfoTuple[0]] = subjectInfoDict
                
                #At this stage it is possible that some subjectEIDs from the 
                #given mongoDB-subjectEIDs are not found in the dataBase. 
                #We just log them and ignore them

            meta.Session.commit()
            return subjectInfoDictMap
        except SQLAlchemyError, sqlae:
            meta.Session.rollback()
            raise exceptions.SystemInternalException(unicode(sqlae).encode('utf-8'))
        except Exception, e:
            meta.Session.rollback()
            raise e
        finally:
            meta.Session.expire_all()
            meta.Session.close()
            meta.Session.remove()
