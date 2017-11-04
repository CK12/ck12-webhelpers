from datetime import datetime
import json
import logging
import urllib
import pymongo
import traceback
from celery import task
from dexter.views.celerytasks.generictask import GenericTask

taxonomy_server = "http://gamma.ck12.org"
subject_api = '%s/taxonomy/get/info/subjects' % taxonomy_server
branch_api =  '%s/taxonomy/get/info/branches/%s' % (taxonomy_server, '%s')
concept_api = '%s/taxonomy/get/info/concepts/%s/%s?pageSize=-1' % (taxonomy_server, '%s', '%s')

# Initialise Logger
log = logging.getLogger(__name__)

@task(name="tasks.fbs_concept_loader_task", base=GenericTask)
class FBSConceptLoaderTask(GenericTask):
    """
    Class for FBS Concept Loader.
    """
    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.singleInstance = True

    def run(self, **kwargs):
        """Load the concepts to ConceptNodes collection.
        """
        GenericTask.run(self, **kwargs)
        try:
            dt = datetime.now()
            sub_brs = self.get_subject_branches()
            log.info("sub_brs:%s" % sub_brs)
            concept_count = 0
            for sub_br in sub_brs:
                sub , br = sub_br		
                log.info("Processing sub/br:%s/%s" % sub_br)
                concept_url = concept_api % (sub, br)
                response = self._make_call(concept_url)
                concepts = response['response']['conceptNodes']
                log.info("%s concepts to process." % len(concepts))		
                for concept in concepts:			
                    eid = concept.get('encodedID', '').strip().lower()
                    if not eid:
                        log.info("EID not present, concept:%s" % concept)
                        continue						
                    concept.update({'lastUpdated':dt, 'encodedID':eid})
                    self.db.ConceptNodes.update({'encodedID':eid}, concept, upsert=True)			
                    concept_count += 1
            log.info("Total Concepts Updated : %s" % concept_count)
        except Exception as e:
            log.error('Error enountered while running FBSConceptLoader: %s' %(str(e)))
            log.error(traceback.format_exc())

    def get_subject_branches(self):
        """Get the list of subject and respetive branches.
           Returns :: [('MAT', 'ALG'), ('SCI', 'BIO') etc... ]	
        """    
        sub_brs = []
        response = self._make_call(subject_api)
        subjects = map(lambda sub:sub['shortname'], response['response']['subjects'])

        for subject in subjects:
            # Fetch branches.
            branch_url = branch_api % subject
            response = self._make_call(branch_url)
            branches = map(lambda br:br['shortname'], response['response']['branches'])
            if branches:
                sub_brs.extend(map(lambda br:(subject, br), branches))
        return sub_brs

    def _make_call(self, url, params={}):
        """
        Call the url and return the response.
        """
        fp = urllib.urlopen(url)
        resp = fp.read()
        fp.close()
        response = json.loads(resp)
        if response['responseHeader']['status'] != 0:
            raise Exception("_make_call failed invalid response status URL:%s" % url)	    
        return response

    def _get_mongo_db(self):
        """Get mongodb.
        """
        # Get the collection from mongodb
        if db_replica_set:
            conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port,
                                                 replicaSet=db_replica_set,
                                                 read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        else:
            conn = pymongo.MongoClient(host=db_hostname, port=db_port)
        db = conn[db_name]
        if db_username and db_password:
            db.authenticate(db_username, db_password)
        return db
