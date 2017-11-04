import logging

from flx.lib.remoteapi import RemoteAPI

LOG_FILE_PATH = "/tmp/invalidate_featured_modalities_bookflow.log"
# Taxonomy server & apis
SERVER_NAME = "http://www.ck12.org/"
TAXONOMY_SERVER = "http://www.ck12.org/taxonomy"
SUBJECT_API = "/get/info/subjects"
BRANCH_API = "/get/info/branches/%s"
CONCEPT_API = "/get/info/concepts/%s/%s"
FEATURED_MODALITY_API = "flx/get/featured/modalities/lesson/"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
#hdlr = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

remoteapi = RemoteAPI()


def run():
    """calls this API get/featured/modalities/{types}/{encodedID:.*?} for all the encodedIDs to generate the cache
    """
    # Get the list of all the subjects and branches.
    results = getSubjectBranches()
    for result in results:
        try:
            concept_api = CONCEPT_API % result
            # Get all the concepts under branch.
            response = remoteapi._makeCall(TAXONOMY_SERVER, concept_api, 500, params_dict={'pageSize':1000}, method='GET')
            cons = response['response']['conceptNodes']
            if cons:
                subName = cons[0]['subject']['name']
                brName = cons[0]['branch']['name']
                # Prepare list of concepts under branch.
                for con in cons:
                    eid = con['encodedID']

                    print 'Calling API  :%s/%s%s' % (SERVER_NAME, FEATURED_MODALITY_API, eid)

                    logger.info('Calling API  :%s/%s%s' % (SERVER_NAME, FEATURED_MODALITY_API, eid))
                    response = remoteapi._makeCall(SERVER_NAME, "%s%s" %(FEATURED_MODALITY_API, eid), 500,
                                                   params_dict={'nocache':'true', 'version':'bookflow'}, method='GET')

                print 'Completed processing for Subject/Branch :%s/%s' % (subName, brName)
                logger.info('Completed processing for Subject/Branch :%s/%s' % (subName, brName))
        except Exception as e:
            import traceback
            traceback.print_exc()
            logger.error('Exception Invalidating cache for featured modality api, Exception:%s' % (result, str(e)))            
            return

def getSubjectBranches():
    """Get the list of subject and respetive branches.
    """
    # Fetch subjects.
    response = remoteapi._makeCall(TAXONOMY_SERVER, SUBJECT_API, 500, params_dict={'pageSize':1000}, method='GET')
    subjects = response['response']['subjects']
    subBrancheList = []
    for subject in subjects:
        # Fetch branches.
        shortname = subject['shortname']
        branch_api = BRANCH_API % shortname
        response = remoteapi._makeCall(TAXONOMY_SERVER, branch_api, 500, params_dict={'pageSize':1000}, method='GET')
        branches = map(lambda x:x['shortname'], response['response']['branches'])
        if branches:
            subBrancheList.extend(map(lambda x:(shortname,x), branches))

    return subBrancheList
