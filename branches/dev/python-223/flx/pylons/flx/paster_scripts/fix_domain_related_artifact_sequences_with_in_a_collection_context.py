import logging
import time
import sys
import zlib
import sqlalchemy
import re


from flx.model.mongo import getDB as getMongoDB
from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo.conceptnode import ConceptNode
from flx.model import meta, model
from flx.lib import helpers
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from pylons import config


#Usage: $paster shell
#>>>from paster_scripts import fix_domain_related_artifact_sequences_with_in_a_collection_context
#>>>fix_domain_related_artifact_sequences_with_in_a_collection_context.run()
def run(commitFixesToDataBase=False):

    LOG_FILENAME = "/tmp/fix_domain_related_artifact_sequences_with_in_a_collection_context.log"
    handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1000*1024*1024, backupCount=5)
    log = logging.getLogger(__name__)
    log.setLevel(logging.DEBUG)
    log.addHandler(handler)
    handler.doRollover()

    processStartTime = time.time()
    session = meta.Session
    totalNumberOfDomainBrowseTerms = 0
    try:
        session.begin()
        try:
            browseTermTypeInfos = session.query(meta.BrowseTermTypes.c.name, meta.BrowseTermTypes.c.id).filter(meta.BrowseTermTypes.c.name.in_(['domain', 'pseudodomain'])).all()
            browseTermTypeNameIDMap = {}
            for browseTermTypeInfo in browseTermTypeInfos:
                browseTermTypeName = browseTermTypeInfo[0]
                browseTermTypeID = browseTermTypeInfo[1]
                browseTermTypeNameIDMap[browseTermTypeName] = browseTermTypeID

            if 'domain' not in browseTermTypeNameIDMap or 'pseudodomain' not in browseTermTypeNameIDMap:
                raise Exception(u"BrowseTermTypeID of 'domain' / 'pseudodomain' types could not be determined from the dataBase.")
            else:
                domainBrowseTermTypeID = browseTermTypeNameIDMap['domain']
                pseudoDomainBrowseTermTypeID = browseTermTypeNameIDMap['pseudodomain']
                domainRealtedBrowseTermTypeIDs = (domainBrowseTermTypeID, pseudoDomainBrowseTermTypeID)

            totalNumberOfDomainBrowseTermsQuery = session.query(func.count(meta.BrowseTerms.c.id)).filter(meta.BrowseTerms.c.termTypeID.in_(domainRealtedBrowseTermTypeIDs))
            totalNumberOfDomainBrowseTerms = totalNumberOfDomainBrowseTermsQuery.one()[0]
        except exc.NoResultFound, nre:
            raise Exception(u"Total number of domain-related-browse-term rows could not be determined. NoResultFoundException occured - "+str(nre))
        except exc.MultipleResultsFound, mre:
            raise Exception(u"Total number of domain-related-browse-term rows could not be determined. MultipleResultsFound occured - "+str(mre))
    except SQLAlchemyError, sqlae:
        session.rollback()
        raise Exception(u"Total number of domain-related-browse-term rows could not be determined. SQLAlchemyError occured - "+str(sqlae))
    except Exception, e:
        session.rollback()
        raise e
    finally:
        session.close()

    print "TOTAL NUMBER OF DOMAIN-RELATED-BROWSE-TERMS FOUND : "+str(totalNumberOfDomainBrowseTerms)
    print 
    log.info("TOTAL NUMBER OF DOMAIN-RELATED-BROWSE-TERMS FOUND : "+str(totalNumberOfDomainBrowseTerms))
    log.info("")

    offset = 0
    while offset < totalNumberOfDomainBrowseTerms:
        print
        print "STARTED PROCESSING DOMAIN-RELATED-BROWSE-TERM CHUNK WITH START = "+str(offset)+", END = "+str(offset+1)
        log.info("")
        log.info("STARTED PROCESSING DOMAIN-RELATED-BROWSE-TERM CHUNK WITH START = "+str(offset)+", END = "+str(offset+1))
        chunkStartTime = time.time()
        try:
            session.begin()
            domainBrowseTermsSubQuery = session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.termTypeID.in_(domainRealtedBrowseTermTypeIDs)).order_by(meta.BrowseTerms.c.id).offset(offset).limit(1).subquery("domainBrowseTermsSubQuery")
            domainBrowseTermRelatedArtifactInfos = session.query(domainBrowseTermsSubQuery.c.id, meta.RelatedArtifacts.c.artifactID, meta.Artifacts.c.artifactTypeID, meta.RelatedArtifacts.c.sequence, meta.RelatedArtifacts.c.conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID).filter(meta.RelatedArtifacts.c.domainID == domainBrowseTermsSubQuery.c.id, meta.RelatedArtifacts.c.artifactID == meta.Artifacts.c.id).all()
            collectionContextArtifactsMap = {}
            for domainBrowseTermRelatedArtifactInfo in domainBrowseTermRelatedArtifactInfos:
                conceptCollectionHandle = domainBrowseTermRelatedArtifactInfo[4]
                collectionCreatorID = domainBrowseTermRelatedArtifactInfo[5]

                domainBrowseTermID = domainBrowseTermRelatedArtifactInfo[0]
                artifactID = domainBrowseTermRelatedArtifactInfo[1]
                artifactTypeID = domainBrowseTermRelatedArtifactInfo[2]
                artifactSequence = domainBrowseTermRelatedArtifactInfo[3]
                if (conceptCollectionHandle, collectionCreatorID) not in collectionContextArtifactsMap:
                    collectionContextArtifactsMap[(conceptCollectionHandle, collectionCreatorID)] = []
                collectionContextArtifactsMap[(conceptCollectionHandle, collectionCreatorID)].append({'domainBrowseTermID':domainBrowseTermID, 'artifactID':artifactID, 'artifactTypeID':artifactTypeID, 'artifactSequence':artifactSequence})

            relatedArtifactsToUpdate = []
            relatedArtifactsToDelete = []
            for collectionContext in collectionContextArtifactsMap:
                conceptCollectionHandle = collectionContext[0]
                collectionCreatorID = collectionContext[1]

                collectionContextArtifacts = collectionContextArtifactsMap[collectionContext]
                collectionContextArtifacts.sort(key = lambda collectionContextArtifact:collectionContextArtifact['artifactSequence'])

                #Already Processed CollectionContexts -  should not consider sequence
                processedCollectionContextArtifacts = set([])
                artifactTypeIDMaxSequenceMap = {}
                for collectionContextArtifact in collectionContextArtifacts:
                    domainBrowseTermID = collectionContextArtifact.get('domainBrowseTermID')
                    artifactID = collectionContextArtifact.get('artifactID')
                    artifactTypeID = collectionContextArtifact.get('artifactTypeID')
                    artifactSequence = collectionContextArtifact.get('artifactSequence')
                    if (domainBrowseTermID, artifactID, artifactTypeID) not in processedCollectionContextArtifacts:
                        if artifactTypeID not in artifactTypeIDMaxSequenceMap:
                            artifactTypeIDMaxSequenceMap[artifactTypeID] = 0
                        artifactTypeIDMaxSequenceMap[artifactTypeID] = artifactTypeIDMaxSequenceMap[artifactTypeID]+1

                        #Update
                        newArtifactSequence = artifactTypeIDMaxSequenceMap[artifactTypeID]
                        if newArtifactSequence != artifactSequence:
                            relatedArtifactsToUpdate.append(meta.RelatedArtifacts.update().where(sqlalchemy.and_(meta.RelatedArtifacts.c.domainID == domainBrowseTermID, meta.RelatedArtifacts.c.artifactID == artifactID, meta.RelatedArtifacts.c.sequence == artifactSequence, meta.RelatedArtifacts.c.conceptCollectionHandle == conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID == collectionCreatorID)).values({meta.RelatedArtifacts.c.sequence:newArtifactSequence}))
                        processedCollectionContextArtifacts.add((domainBrowseTermID, artifactID, artifactTypeID))
                    else:
                        #Delete
                        relatedArtifactsToDelete.append((domainBrowseTermID, artifactID, artifactSequence, conceptCollectionHandle, collectionCreatorID))

            if not relatedArtifactsToUpdate and not relatedArtifactsToDelete:
                print "DOMAIN-RELATED-BROWSE-TERM RELATED ARTIFACT SEQUENCES DOESN'T NEED ANY FIXING."
                log.info("DOMAIN-RELATED-BROWSE-TERM RELATED ARTIFACT SEQUENCES DOESN'T NEED ANY FIXING.")
            else:
                if relatedArtifactsToDelete:
                    relatedArtifactsFilters = [sqlalchemy.and_(meta.RelatedArtifacts.c.domainID==relatedArtifactToDelete[0], meta.RelatedArtifacts.c.artifactID==relatedArtifactToDelete[1], meta.RelatedArtifacts.c.sequence==relatedArtifactToDelete[2], meta.RelatedArtifacts.c.conceptCollectionHandle==relatedArtifactToDelete[3], meta.RelatedArtifacts.c.collectionCreatorID==relatedArtifactToDelete[4]) for relatedArtifactToDelete in relatedArtifactsToDelete]
                    session.execute(meta.RelatedArtifacts.delete().where(sqlalchemy.or_(*relatedArtifactsFilters)))

                if relatedArtifactsToUpdate:
                    for relatedArtifactToUpdate in relatedArtifactsToUpdate:
                        session.execute(relatedArtifactToUpdate)

                print "DOMAIN-RELATED-BROWSE-TERM RELATED ARTIFACT SEQUENCES NEEDED FIXING AND IS FIXED."
                log.info("DOMAIN-RELATED-BROWSE-TERM RELATED ARTIFACT SEQUENCES NEEDED FIXING AND IS FIXED.")

            if commitFixesToDataBase:
                session.commit()
            else:
                session.rollback()

            print "DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING SUCCESSFULL."
            log.info("DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING SUCCESSFULL.")
        except SQLAlchemyError, sqlae:
            session.rollback()
            print "CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae)
            log.info("CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING FAILED. REASON : SQLAlchemyError - "+str(type(sqlae))+" - "+str(sqlae))
            log.exception(sqlae)
        except (KeyboardInterrupt, SystemExit) as e:
            session.rollback()
            print "CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e)
            log.info("CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING FAILED. REASON : KeyboardInterrupt - "+str(type(e))+" - "+str(e))
            log.exception(e)
            sys.exit(-1)
        except Exception, e:
            session.rollback()
            print "CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e)
            log.info("CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK PROCESSING FAILED. REASON : Exception - "+str(type(e))+" - "+str(e))
            log.exception(e)
        finally:
            session.close()

        print "TIME TAKEN FOR CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK : %s seconds" %((time.time()-chunkStartTime))
        print "ENDED PROCESSING DOMAIN-RELATED-BROWSE-TERM CHUNK WITH START = "+str(offset)+", END = "+str(offset+1)
        print
        log.info("TIME TAKEN FOR CURRENT DOMAIN-RELATED-BROWSE-TERM CHUNK : %s seconds" %((time.time()-chunkStartTime)))
        log.info("ENDED PROCESSING DOMAIN-RELATED-BROWSE-TERM CHUNK WITH START = "+str(offset)+", END = "+str(offset+1))
        log.info("")
        offset = offset+1

    print "TOTAL TIME TAKEN FOR PROCESSING THE FOUND DOMAIN-RELATED-BROWSE-TERMS : %s minutes" %((time.time()-processStartTime)/60)
    log.info("TOTAL TIME TAKEN FOR PROCESSING THE FOUND DOMAIN-RELATED-BROWSE-TERMS : %s minutes" %((time.time()-processStartTime)/60))
    handler.close()