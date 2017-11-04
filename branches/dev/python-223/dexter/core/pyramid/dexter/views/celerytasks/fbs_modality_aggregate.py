import pymongo
import traceback
import logging
import logging.handlers
from datetime import datetime, timedelta
import urllib2
import json
from urlparse import urlparse

from celery import task
from dexter.views.celerytasks.generictask import GenericTask
from dexter.models import iplocation

subject_url = 'http://www.ck12.org/taxonomy/get/info/subjects'
branch_url =  'http://www.ck12.org/taxonomy/get/info/branches'

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()  # Prints on console
#hdlr = logging.FileHandler('/tmp/modality_aggregate.log') # Use for smaller logs
#formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
#hdlr.setFormatter(formatter)
#log.addHandler(hdlr)
#log.setLevel(logging.INFO)

modality_types = set(['activity', 'activityans', 'asmtpractice', 'asmtpracticeg', 'asmtpracticeint', 'asmtquiz', 'asmttest', 'attachment', 'audio', 'concept', 'conceptmap', 'cthink', 'enrichment', 'exerciseint', 'flashcard', 'handout', 'image', 'interactive', 'lab', 'labans', 'lecture', 'lesson', 'lessonplan', 'lessonplanans', 'lessonplanx', 'lessonplanxans', 'plix', 'postread', 'postreadans', 'prepostread', 'prepostreadans', 'preread', 'prereadans', 'presentation', 'quiz', 'quizans', 'quizdemo', 'rubric', 'rwa', 'rwaans', 'simulation', 'simulationint', 'studyguide', 'web', 'whileread', 'whilereadans', 'worksheet', 'worksheetans'])

@task(name="tasks.fbs_modality_aggregate_task", base=GenericTask)
class FBSModalityAggregateTask(GenericTask):
    """
    Class for FBS Modality Aggregation.
    """
    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.singleInstance = True
        self.setup_subject_branches()
        self.server_name = self.config.get('web_prefix_url')
        self.allowed_domains = self.config.get('allowed_domains', '').split(',')
        
    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)
        modality_dict = dict()
        try:
            #Get the modalities for the previous day
            prev_time = datetime.now() - timedelta(hours=1)
            day_time_bucket = prev_time.strftime('%Y-%m-%d %H-hour')
            #day_time_bucket = '2016-29-week'
            log.info('Processing modalities in the last hour: [%s]', day_time_bucket)
            modalities = self.db.Events.find({'eventType':'FBS_MODALITY', "time_bucket": day_time_bucket})
            inserted_count = 0
            skipped_count = 0            
            for modality in modalities:
                log.info("Processing FBS_MODALITY record ID:%s" % modality.get('_id', '-1'))
                modality_payload = modality.get("payload", {})
                client_ip = modality_payload.get("client_ip")
                if not client_ip:
                    skipped_count += 1
                    continue                
                if not modality_payload:
                    log.info("Payload is empty.")
                    skipped_count += 1
                    continue
                encoded_id = modality_payload.get("context_eid", '').strip()
                if not (encoded_id and self.is_valid_eid(encoded_id)):
                    log.info("Encoded ID not available/not valid, EncodedID :%s" %encoded_id)
                    skipped_count += 1
                    continue                
                if not modality_payload.get('modality_type'):
                    log.info("modality_type not available.")
                    skipped_count += 1
                    continue                    
                if not modality_payload.get('artifactID'):
                    log.info("artifactID not available.")                    
                    skipped_count += 1
                    continue
                #server_name = self.config.get('web_prefix_url')
                url_referrer = modality_payload.get('url_referrer')
                if not url_referrer or urlparse(url_referrer).netloc != urlparse(self.server_name).netloc:
                    log.info("Event is not from: [%s]." %(self.server_name))
                    if urlparse(url_referrer).netloc not in self.allowed_domains:
                        log.info("Event is not from allowed domains: [%s]. Skipping" %(self.allowed_domains))
                        skipped_count += 1
                        continue
                artifact_id = str(modality_payload.get('artifactID'))
                modality_type = modality_payload.get('modality_type', '').lower()
                if modality_type not in modality_types:
                    log.info("Not a modality, modality type :%s" % modality_type)
                    skipped_count += 1                    
                    continue
                ip_info = iplocation.IPLocation(self.db).get_location(ip_address=client_ip)
                country, state, city, zipcode, isp = [ip_info.get(x, 'unknown') 
                                                      for x in ['country_long', 'region', 'city', 'zipcode', 'isp']]
                subject, branch = encoded_id.split('.')[:2]                
                modality_key = "%s_%s_%s_%s_%s" % (artifact_id, country, state, branch.upper(), modality_type)
                if modality_dict.has_key(modality_key):
                    modality_dict[modality_key]['count'] += 1
                else:                
                    modality_time_bucket = modality.get('time_bucket')
                    modality_aggregation =  {'encodedID': encoded_id, \
                                           'time_bucket': modality_time_bucket, \
                                           'modality_type': modality_type, \
                                           'artifactID':artifact_id, \
                                           'subject': subject.upper(), \
                                           'branch': branch.upper(), \
                                           'country': country, \
                                           'state': state, \
                                           'city':city, \
                                           'zipcode':zipcode, \
                                           'isp':isp, \
                                           'timestamp': datetime.now(),
                                           'count': 1}
                    modality_dict[modality_key] = modality_aggregation
            for modality_key in modality_dict:
                modality_aggregation = modality_dict[modality_key]
                count = modality_aggregation['count']
                del modality_aggregation['count']
                artifact_id = modality_aggregation['artifactID']
                modality_type = modality_aggregation['modality_type']
                branch = modality_aggregation['branch']
                country = modality_aggregation['country']
                state = modality_aggregation['state']
                
                update_info = {'$set':modality_aggregation, '$inc':{'count':count}}
                update_params = {'artifactID':artifact_id, 'modality_type':modality_type, 'branch':branch, 
                                 'country':country, 'state':state}
                log.info("update params: [%s]" % update_params)
                result = self.db.ModalityAggregate.update(update_params, update_info, upsert=True)                
                log.info("update result: [%s]" % result)                
                inserted_count += count
            log.info("Skipped Records Count : %s", skipped_count)
            log.info("Inserted/Updated Records Count : %s", inserted_count)
        except Exception as e:
            log.error('Error enountered while running FBSModalityAggregator: %s' %(str(e)))
            log.error(traceback.format_exc())


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
