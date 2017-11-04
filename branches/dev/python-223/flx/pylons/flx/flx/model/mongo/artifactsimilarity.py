import logging
from datetime import datetime

from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model import api
from flx.model.exceptions import AlreadyExistsException, InvalidArgumentException, NotFoundException
from pylons.i18n.translation import _

log = logging.getLogger(__name__)

ck12Member = api.getMemberByLogin('ck12editor')

class ArtifactSimilarity(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['artifactID', 'artifactRevisionID', 'sourceArtifactID', 'sourceArtifactRevisionID']

    def getArtifactSimilarity(self, **kwargs):
        """
            Get Artifact Similarity for given artifactID or artifactRevisionID 
        """
        result = None
        try:
            #If artifactRevisionID is not specified then return latest revision similarity            
            if kwargs.has_key('artifactID') and not kwargs.has_key('artifactRevisionID'):
                result = list(self.db.ArtifactSimilarity.find(kwargs).sort('artifactRevisionID', -1).limit(1))
                if result:
                    result = result[0]
            else:
                result = self.db.ArtifactSimilarity.find_one(kwargs)
        except Exception as e:
            log.error('Error getting artifact similarity: %s' %(str(e)), exc_info=e)
            raise e
        return result

    def createArtifactSimilarity(self, **kwargs):
        """
            Create Artifact Similarity for given artifactID, artifactRevisionID
        """
        self.before_insert(**kwargs)
        
        artifactID = kwargs['artifactID']
        artifactRevisionID = kwargs['artifactRevisionID']
        sourceArtifactID = kwargs['sourceArtifactID']
        sourceArtifactRevisionID = kwargs['sourceArtifactRevisionID']

        #Validate input artifact for given artifactID-artifactRevisionID
        artifact = api.getArtifactRevisionByArtifactID(artifactID=artifactID, artifactRevisionID=artifactRevisionID)
        if not artifact:
            raise InvalidArgumentException((_(u'Invalid artifact id[%s] or artifactRevisionID[%s].' \
                                              % (artifactID, artifactRevisionID))).encode("utf-8"))

        sourceArtifactRevision = api.getArtifactRevisionByArtifactID(artifactID=sourceArtifactID, artifactRevisionID=sourceArtifactRevisionID)

        if not sourceArtifactRevision or int(ck12Member.id) != int(sourceArtifactRevision.artifact.creator.id):
            raise InvalidArgumentException((_(u'Invalid source artifact id[%s] or artifactRevisionID[%s] or artifact not owned by ck-12.' \
                                              % (sourceArtifactID, sourceArtifactRevisionID))).encode("utf-8"))

        self._validateSourceArtifact(sourceArtifactID,sourceArtifactRevisionID, kwargs.get('sourceEncodedID'))

        if kwargs.has_key('sourceEncodedID'):
            kwargs['sourceEncodedID'] = kwargs['sourceEncodedID'].upper()
        
        artifactSimilarity = self.db.ArtifactSimilarity.find_one({'artifactID': artifactID, 'artifactRevisionID': artifactRevisionID})

        #Don't raise exception if already exist, update same similarity
        #if artifactSimilarity:
        #    raise AlreadyExistsException((_(u'Artifact similarity for artifactID[%s] and artifactRevisionID[%s] already exists' \
        #                                        %(artifactID, artifactRevisionID))).encode("utf-8"))
        kwargs['creationTime'] = artifactSimilarity.get('creationTime', datetime.now()) if artifactSimilarity else datetime.now()
        kwargs['updateTime'] = datetime.now()
        log.info("Adding ArtifactiSimilarity %s" % kwargs)

        self.db.ArtifactSimilarity.update({"artifactRevisionID":artifactRevisionID}, {"$set": kwargs}, upsert=True)
        
        return kwargs

    def updateArtifactSimilarity(self, **kwargs):
        """
            Update Artifact Similarity for given artifactID, artifactRevisionID
        """
        where = {}
        if kwargs.has_key('artifactID'):
            where['artifactID'] = kwargs['artifactID']
        artifactRevisionID = kwargs['artifactRevisionID']
        sourceArtifactID = kwargs['sourceArtifactID']
        sourceArtifactRevisionID = kwargs['sourceArtifactRevisionID']

        where.update({'artifactRevisionID': artifactRevisionID})
        
        artifactSimilarity = self.getArtifactSimilarity(**where)

        if not artifactSimilarity:
            raise NotFoundException((_(u'No such artifact similarity for artifactID[%s] and artifactRevisionID[%s].' \
                                                %(kwargs.get('artifactID'), artifactRevisionID))).encode("utf-8"))

        self._validateSourceArtifact(sourceArtifactID,sourceArtifactRevisionID, kwargs.get('sourceEncodedID'))
        
        if kwargs.has_key('sourceEncodedID'):
            kwargs['sourceEncodedID'] = kwargs['sourceEncodedID'].upper()

        kwargs['artifactID'] = artifactSimilarity.get('artifactID')        
        kwargs['creationTime'] = artifactSimilarity.get('creationTime')
        kwargs['updateTime'] = datetime.now()
        log.info("Adding ArtifactiSimilary %s" % kwargs)

        self.db.ArtifactSimilarity.update({"artifactRevisionID":artifactRevisionID}, {"$set": kwargs}, upsert=False)

        return kwargs

    def _validateSourceArtifact(self, artifactID, artifactRevisionID, encodedID=None):
        sourceArtifactRevision = api.getArtifactRevisionByArtifactID(artifactID=artifactID, artifactRevisionID=artifactRevisionID)

        if not sourceArtifactRevision or int(ck12Member.id) != int(sourceArtifactRevision.artifact.creator.id):
            raise InvalidArgumentException((_(u'Invalid source artifact id[%s] or artifactRevisionID[%s] or artifact not owned by ck-12.' \
                                              % (artifactID, artifactRevisionID))).encode("utf-8"))

        if encodedID:
            domainEID = sourceArtifactRevision.artifact.getDomain()['encodedID']
            if domainEID.lower() != encodedID.lower():
                raise InvalidArgumentException((_(u'Invalid encodedID [%s] for artifactID[%s].' \
                                  % (encodedID, artifactID))).encode("utf-8"))

