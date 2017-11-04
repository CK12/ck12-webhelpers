import pymongo
import traceback
import logging
import logging.handlers
from datetime import datetime, timedelta
import urllib2
import json
from celery import task
from dexter.views.celerytasks.generictask import GenericTask
from dexter.models import iplocation

# Initialise Logger
log = logging.getLogger(__name__)

subject_url = 'http://www.ck12.org/taxonomy/get/info/subjects'
branch_url =  'http://www.ck12.org/taxonomy/get/info/branches'

@task(name="tasks.fbs_concept_aggregate_task", base=GenericTask)
class FBSConceptAggregateTask(GenericTask):
    """
    Class for FBS Concept Aggregation.
    """
    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.singleInstance = False
        self.setup_subject_branches()

    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)
        try:
            #Get the searches for the previous hour
            prev_time = datetime.now() - timedelta(hours=1)
            hour_time_bucket = prev_time.strftime('%Y-%m-%d %H-hour')
            log.info('Processing concept queries for hour time bucket: [%s]', hour_time_bucket)
            concepts = self.db.FBS_MODALITY.find({"time_bucket": hour_time_bucket})
            #month_time_bucket = ['2014-10-month', '2014-09-month']
            #log.info('Processing concept queries for month time bucket: [%s]', month_time_bucket)
            #concepts = self.db.Events.find({'eventType':'FBS_MODALITY', "time_bucket": {'$in': month_time_bucket}}).limit(10)
            inserted_count = 0
            skipped_count = 0
            concepts_skipped = []
            for concept in concepts:
                log.info("Processing FBS_MODALITY record ID:%s" % concept.get('_id', '-1'))
                concept_payload = concept
                client_ip = concept_payload.get("client_ip")
                if not client_ip:
                    skipped_count += 1
                    continue
                encoded_id = concept_payload.get("context_eid", '').strip()
                if not (encoded_id and self.is_valid_eid(encoded_id)):
                    log.info("Encoded ID not valid, EncodedID :%s" %encoded_id)
                    skipped_count += 1
                    continue
                ip_info = iplocation.IPLocation(self.db).get_location(ip_address=client_ip)
                country, state, city, zipcode, isp = [ip_info.get(x, 'unknown') 
                                                      for x in ['country_long', 'region', 'city', 'zipcode', 'isp']]

                concept_time_bucket = concept.get('time_bucket')
                concept_aggregation =  {'encodedID': encoded_id, \
                                       'country': country, \
                                       'state': state, \
                                       'city':city, \
                                       'zipcode':zipcode, \
                                       'isp': isp, \
                                       'time_bucket': concept_time_bucket, \
                                       'created_time': datetime.now()}
                id = self.db.ConceptAggregate.insert(concept_aggregation)
                log.info("Insreted record in ConceptAggregate, %s", id)
                inserted_count += 1

            log.info("Skipped Records Count : %s", skipped_count)
            log.info("Inserted Records Count : %s", inserted_count)
        except Exception as e:
            log.error('Error enountered while running FBSConceptAggregator: %s' %(str(e)))
            log.error(traceback.format_exc())
        #log.info('Done running FBSConceptAggregator celery-beat with taskID: %s' %(self.taskID))


    def is_valid_eid(self, eid):
        """
        Check if the encodedID has a valid format SUB.BRN.XXX.YYY or SUB.BRN.XXX
        """
        eid_parts = eid.split('.')
        # Eid should be SUB.BRN.XXX.YYY or SUB.BRN.XXX
        if not len(eid_parts) in [3, 4]:
            return False
        eid_parts = map(lambda x:x.lower(), eid_parts)
        # Valid Subject not present
        if eid_parts[0] not in self.subjects:
            return False
        # Valid Branch not present
        if eid_parts[1] not in self.branches:
            return False
        # Encoded id not valid.
        try:
            if len(eid_parts) == 3:
                tmp_data = int(eid_parts[2])
            else:
                tmp_data = int(eid_parts[2])
                tmp_data = int(eid_parts[3])
        except ValueError, e:
            return False
        return True

    def setup_subject_branches(self):
        """Get all the subjects and respective branches.
        """
        resp = urllib2.urlopen(subject_url)
        data = resp.read()
        sub_resp = json.loads(data)
        self.subjects = map(lambda x:x['shortname'].lower(), sub_resp['response']['subjects'])
        log.info("Subjects :%s" % self.subjects)
        resp = urllib2.urlopen(branch_url)
        data = resp.read()
        br_resp = json.loads(data)
        self.branches = map(lambda x:x['shortname'].lower(), br_resp['response']['branches'])
        log.info("Branches :%s" % self.branches)
