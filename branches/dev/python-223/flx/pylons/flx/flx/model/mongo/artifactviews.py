import logging
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class ArtifactViews(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = []

    """
        Get Artifact Views.
    """
    def getArtifactViews(self, **kwargs):
        try:
            artifact_id = int(kwargs['artifact_id'])
            artifact_view = self.db.ArtifactViews.find_one({'artifact_id':artifact_id})
            views = None
            if artifact_view:
                views = artifact_view['views']
            log.info("Artifact/Views: [%s/%s]" % (artifact_id, views))
            return views
        except Exception as e:
            log.error('Error getting artifact views: [%s]' %(str(e)), exc_info=e)
            raise e
