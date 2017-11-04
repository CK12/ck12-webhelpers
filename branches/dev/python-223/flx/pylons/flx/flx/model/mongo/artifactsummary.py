import logging

from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)


class ArtifactSummary(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['artifactID']

    def getArtifactSummary(self, **kwargs):
        """
            Get Artifact Summary for given artifactID
        """
        result = None
        try:
            result = self.db.ArtifactSummaries.find_one(kwargs)
            if result:
                del result['_id']
        except Exception as e:
            log.error('Error getting artifact summary: %s' %(str(e)), exc_info=e)
            raise e
        return result
