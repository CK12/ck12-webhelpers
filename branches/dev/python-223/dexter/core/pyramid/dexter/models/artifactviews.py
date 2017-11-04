from bson.objectid import ObjectId
import logging
from datetime import datetime

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class ArtifactViews(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = []
        self.required_field_structure = {}

    """
        Register a parameter
    """
    @h.trace
    def getArtifactViews(self, **kwargs):
        """
        """
        page_num = kwargs.get('page_num', 1)
        page_size = kwargs.get('page_size', 10)        
        time_buckets = kwargs['time_buckets']
        log.info("Time buckets: %s " % str(time_buckets))
        project_query = {"arftID":{"$toLower":"$artifactID"}, "time_bucket":1}
        match_query = {"time_bucket":{"$in": time_buckets}}
        group_query = {"_id":"$arftID", "views": {"$sum":1}}
        skip = (page_num - 1) * page_size 
        results = self.db.Resolved_FBS_MODALITY.aggregate([{"$project":project_query},{"$match":match_query}, {"$group": group_query}, {"$sort": {"_id":1}},{"$skip":skip}, {"$limit":page_size}])
        
        log.info("results:%s" % results)
        artifact_views = [{'artifactID':result['_id'], 'views':result['views']} for result in results['result']]
        return artifact_views
