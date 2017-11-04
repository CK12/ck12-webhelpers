from flx.controllers.celerytasks.periodictask import PeriodicTask
import logging
from flx.model.mongo import relatedartifacts
from flx.lib.remoteapi import RemoteAPI

logger = logging.getLogger(__name__)
TAXONOMY_SERVER = "http://www.ck12.org/taxonomy"
SUBJECT_API = "/get/info/subjects"
BRANCH_API = "/get/info/branches/%s"
CONCEPT_API = "/get/info/concepts/%s/%s"
remoteapi = RemoteAPI()

class createRelatedArtifacts(PeriodicTask):

    recordToDB = False

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        PeriodicTask.__init__(self, **kwargs)
        self.routing_key = 'artifact'
        # Get the flx2 database of mongodb.
        self.db = self.mongo_db

    def run(self, **kwargs):
        """
            Create the related artifacts for each  concept.
        """
        PeriodicTask.run(self, **kwargs)
        global TAXONOMY_SERVER
        TAXONOMY_SERVER = self.config.get('taxonomy_server')
        
        # Get the list of all the subjects and branches.
        results = self.getSubjectBranches()
        #results = [('MAT', 'ALG')]
        for result in results:
            try:
                concept_api = CONCEPT_API % result
                # Get all the concepts under branch.
                response = remoteapi._makeCall(TAXONOMY_SERVER, concept_api, 500, params_dict={'pageSize':5000}, method='GET')
                cons = response['response']['conceptNodes']
                if cons:
                    subName = cons[0]['subject']['name']
                    brName = cons[0]['branch']['name']
                    # Prepare list of concepts under branch.
                    for con in cons:
                        eid = con['encodedID']
                        kwargs = {}
                        kwargs['encodedID'] = eid
                        try:
                            relatedartifacts.RelatedArtifacts(self.db).createRelatedArtifact(**kwargs)
                        except Exception as e:
                            logger.error('Unable to created related artifacts for encodedID: [%s]' %(eid))

                logger.info('Completed processing for Subject/Branch :%s/%s' % (subName, brName))
            except Exception as e:
                logger.error("Error creating related artifacts for url[%s], Exception:%s" % (concept_api, str(e)), exc_info=e)            

    def getSubjectBranches(self):
        """Get the list of subject and respective branches.
        """
        # Fetch subjects.
        response = remoteapi._makeCall(TAXONOMY_SERVER, SUBJECT_API, 500, params_dict={'pageSize':1000}, method='GET')
        subjects = response['response']['subjects']
        subBranchesList = []
        for subject in subjects:
            # Fetch branches.
            shortname = subject['shortname']
            branch_api = BRANCH_API % shortname
            response = remoteapi._makeCall(TAXONOMY_SERVER, branch_api, 500, params_dict={'pageSize':1000}, method='GET')
            branches = map(lambda x:x['shortname'], response['response']['branches'])
            if branches:
                subBranchesList.extend(map(lambda x:(shortname,x), branches))
    
        return subBranchesList
