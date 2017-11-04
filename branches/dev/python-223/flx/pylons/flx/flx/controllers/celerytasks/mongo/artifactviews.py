from flx.controllers.celerytasks.periodictask import PeriodicTask
from pylons.i18n.translation import _ 
from flx.lib import helpers as h
from flx.lib.remoteapi import RemoteAPI
from datetime import datetime, timedelta
import logging
import os
import json

logger = logging.getLogger(__name__)
remoteapi = RemoteAPI()

class ArtifactViewsUpdaterTask(PeriodicTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db
        
    def run(self, **kwargs):
        """
            Update the ArtifactViews collection with the artifact views count.
        """
        PeriodicTask.run(self, **kwargs)
        try:
            page_size = 500
            page_num = 1
            web_prefix_url = self.config.get('web_prefix_url')
            ads_server = '%s/%s' % (web_prefix_url, 'dexter')
            artifact_views_api = 'get/artifact/views'        
            api = '%s/%s' % (web_prefix_url, artifact_views_api)
            params = {'page_size':page_size, 'page_num': page_num}
            process_count = 0
            while True:
                logger.info("Processing pageNum/pageSize : [%s/%s]" % (page_num, page_size))
                # Get all the artifact views.
                response = remoteapi._makeCall(ads_server, artifact_views_api, 500, params_dict=params, method='GET')
                artifact_views = response['response']['artifactViews']
                total = response['response']['total']
                current_total = len(artifact_views)
                logger.info("Total %s artifact views to update." % current_total)
                artifact_ids = []
                for artifact_view in artifact_views:
                    self.db.ArtifactViews.update({'artifact_id':artifact_view['artifactID']}, {'$inc':{'views': artifact_view['views']}}, upsert=True)
                    artifact_ids.append(artifact_view['artifactID'])
                h.reindexArtifacts(artifact_ids, wait=False)                
                process_count = page_num*page_size
                if process_count > total:
                    logger.info("Existing as all the artifact views returned. process_count: [%s]" % process_count)
                    break
                page_num += 1
                params.update({'page_num': page_num})                
        except Exception, e:
            logger.error('Update artifact views count Exception[%s]' % str(e), exc_info=e)
            raise e
            
    def get_ystd_start_end_time():
        """Returns the yesterdays start and end time.
        """
        ystd = datetime.now() - timedelta(days=1)        
        ystd_start_dt = datetime(day=ystd.day, month=ystd.month, year=ystd.year)
        ystd_end_dt = ystd_start_dt + timedelta(hours=23, minutes=59, seconds=59)
        
        return (ystd_start_dt.strftime('%Y-%m-%d %M:%H:%S'), ystd_end_dt.strftime('%Y-%m-%d %M:%H:%S'))        
