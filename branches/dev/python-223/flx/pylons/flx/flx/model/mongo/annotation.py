import logging
from datetime import datetime
from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model import api
from bson.objectid import ObjectId
log = logging.getLogger(__name__)

class Annotation(ValidationWrapper):

    def __init__(self, db, dc=True):
        self.db = db
        self.dc = dc
        self.required_fields = ['memberID', 'artifactID', 'annotation_type', 'revisionID', 'highlightColor', 'quote',
                                'ranges']
        self.field_dependencies = {
                                    'memberID':{'type':int},
                                    'artifactID':{'type': int},
                                  }
        self.maxAncestorLevels = 2

    def __copyAnnotationsFromAncestor(self, artifactID, revisionID, memberID):
        idMap = {}
        ## Check if annotations exist on the given artifactID
        anCount = self.db.Annotation.find({'memberID': memberID, 'artifactID': artifactID}, {'_id': 1}).count()
        log.debug("Count of existing annotations: %s" % anCount)
        if anCount > 0:
            ## Annotations already exist - no need to copy
            return idMap
        alreadyDeleted = self.db.AnnotationHistory.find_one({'memberID': memberID, 'artifactID': artifactID})
        if alreadyDeleted:
            ## Annotations were present on this artifact for this user - but they were deleted
            return idMap

        ## Copy the annotations from the ancestor - go up to 2 levels
        annotations = None
        artifact = api.getArtifactByID(id=artifactID)
        for i in range(0, self.maxAncestorLevels):
            if artifact and artifact.ancestor:
                ancestor = artifact.ancestor.artifact
                annotations = list(self.db.Annotation.find({'memberID': memberID, 'artifactID': ancestor.id}))
                if annotations:
                    ## If there are some annotations to copy - we stop looking
                    break
                artifact = ancestor
        if annotations:
            copied = 0
            for an in annotations:
                try:
                    oldId = an.pop('_id')
                    an['artifactID'] = artifactID
                    an['revisionID'] = revisionID
                    newId = self.db.Annotation.insert(an)
                    idMap[oldId] = newId
                    copied += 1
                except Exception as e:
                    log.error("Error copying annotation from ancestor: %s" % str(e), exc_info=e)
            if copied:
                ## Remove the item from history
                self.db.AnnotationHistory.remove({'memberID': memberID, 'artifactID': artifactID})
            log.debug("Copied %d/%d annotations from ancestor: %s to artifact: %s, idMap: %s" % (copied, len(annotations), ancestor.id, artifactID, idMap))
        else:
            log.debug("No annotations found to copy in parent or grandparent of artifactID: %s for memberID: %s" % (artifactID, memberID))
        return idMap

    def create(self, **kwargs):
        try:
            self.before_insert(**kwargs)

            log.info('kwargs: [%s]' %(kwargs))
            ## Copy annotations from ancestor (if any)
            self.__copyAnnotationsFromAncestor(artifactID=kwargs['artifactID'], revisionID=kwargs['revisionID'], memberID=kwargs['memberID'])

            now = datetime.now()
            kwargs['updated'] = kwargs['created'] = now
            objectID = self.db.Annotation.insert(kwargs)
            
            an = self.db.Annotation.find_one({'_id': objectID})
            if an:
                an['id'] = an.pop('_id')
            ## Remove the item from history
            self.db.AnnotationHistory.remove({'memberID': kwargs['memberID'], 'artifactID': kwargs['artifactID']})
            return an

        except Exception as e:
            log.error('Error saving Annotation: %s' %(str(e)), exc_info=e)
            raise e

    def getByID(self, id):
        try:
            id = ObjectId(str(id))
            return self.db.Annotation.find_one({'_id': id})

        except Exception as e:
            log.error('Error getting Annotation: %s' %(str(e)), exc_info=e)
            return None
        
    def update(self, id, **kwargs):
        try:
            self.before_update(**kwargs)
            id = ObjectId(str(id))
            ## Get the annotation
            annotation = self.db.Annotation.find_one({'_id': id})
            if not annotation:
                raise Exception("No such annotation: %s" % id)
            
            if kwargs.get('artifactID') and kwargs.get('revisionID'):
                ## Copy annotations from ancestor (if any)
                idMap = self.__copyAnnotationsFromAncestor(artifactID=kwargs['artifactID'], revisionID=kwargs['revisionID'], memberID=annotation['memberID'])
                if id in idMap:
                    id = idMap[id]
            kwargs['updated'] = datetime.now()
            log.info("kwargs: %s" %kwargs)
            self.db.Annotation.update({'_id': id}, {'$set': kwargs})
            an = self.getByID(id)
            if an:
                an['id'] = an.pop('_id')
            return an
             
        except Exception as e:
            log.error('Error updating Annotation: %s' %(str(e)), exc_info=e)
            
    def delete(self, id, artifactID, revisionID):
        try:
            id = ObjectId(str(id))
            annotation = self.db.Annotation.find_one({'_id': id})
            if not annotation:
                raise Exception("No such annotation: %s" % id)
            ## Copy annotations from ancestor (if any)
            idMap = self.__copyAnnotationsFromAncestor(artifactID=artifactID, revisionID=revisionID, memberID=annotation['memberID'])
            if id in idMap:
                id = idMap[id]
            self.db.Annotation.remove({'_id': id, 'artifactID': artifactID, 'memberID': annotation['memberID'] })
            count = self.db.Annotation.find({'artifactID': artifactID, 'memberID': annotation['memberID']}, {'_id': 1}).count()
            if count == 0:
                ## Make an entry into AnnotationHistory collection
                doc = { 'memberID': annotation['memberID'], 'artifactID': artifactID, 'created': datetime.now() }
                self.db.AnnotationHistory.update({'memberID': annotation['memberID'], 'artifactID': artifactID}, doc, upsert=True)
        except Exception as e:
            log.error('Error deleting Annotation: %s' %(str(e)), exc_info=e)

    def search(self, memberID, artifactID, checkAncestors=True):
        
        artifact = api.getArtifactByID(id=artifactID)
        for i in range(0, self.maxAncestorLevels+1):
            if artifact:
                log.debug("Level [%d]: Getting annotations for memberID [%s], artifactID [%s]" % (i, memberID, artifact.id))
                annotations = list(self.db.Annotation.find({'memberID': memberID, 'artifactID': artifact.id}))
                if annotations:
                    break
                if i == 0:
                    alreadyDeleted = self.db.AnnotationHistory.find_one({'memberID': memberID, 'artifactID': artifact.id})
                    if alreadyDeleted:
                        break
                if artifact.ancestor:
                    artifact = artifact.ancestor.artifact
        for an in annotations:
            an['id'] = an.pop('_id')
        result = {}
        result['total'] = len(annotations)
        result['rows'] = annotations
        return result

    def getMigrated(self, find_dict):
        annotations = list(self.db.Annotation.find(find_dict))
        for an in annotations:
            an['id'] = an.pop('_id')
        result = {}
        result['total'] = len(annotations)
        result['rows'] = annotations
        return result

    def getPopularAnnotations(self, artifactID):
        annotations = list(self.db.PopularHighlight.find({'artifactID': artifactID}))
        for an in annotations:
            an['id'] = an.pop('_id')
        result = dict()
        result['total'] = len(annotations)
        result['rows'] = annotations
        return result
