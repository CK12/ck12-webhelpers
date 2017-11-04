import csv
import logging

from flx.lib.remoteapi import RemoteAPI

# Server & APIs
SERVER_NAME = "http://www.ck12.org"
FLX_SERVER = "%s/flx" % SERVER_NAME
TAXONOMY_SERVER = "%s/taxonomy" % SERVER_NAME
GRADE_API = "/get/info/grades/correlated/%s/%s"
SEARCH_API = "/search/standard/book/US.%s/%s/%s"
SUBJECT_API = "/get/info/subjects"
BRANCH_API = "/get/info/branches/%s"

INPUT_FILE_PATH = "/opt/2.0/flx/pylons/flx/paster_scripts/standards_correlations.csv"
LOG_FILE_PATH = "/tmp/standards_correlation.log"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

remoteapi = RemoteAPI()

def run():
    """
    This function prints the Afrtifact Titles for every branch and every state.
    """
    records = []
    # Get all the states and there information from csv file.
    with open(INPUT_FILE_PATH) as csvfile:
        reader = csv.reader(csvfile)
        for rec in reader:
            records.append(rec)
    logger.info("Got %s records from csv." % len(records))
    branches = getBranches()    
    logger.info("Branches : %s" % branches)
    resultDict = dict()
    for rec in records:
        logger.info("Procssing record : %s" % rec)
        srNo, sCode, t1, sName, t2= rec
        titles = []         
        # Process every state for all the branches.
        for branch in branches:
            logger.info("Procssing branch : %s" % branch)
            # Fetch the grades.
            grade_api = GRADE_API % (branch, srNo)    
            response = remoteapi._makeCall(FLX_SERVER, grade_api, 500, method='GET')
            grades = response['response']['grades']
            logger.info("Grades : %s" % grades)
            cnt = 0
            for grd in grades:
                logger.info("Procssing grade : %s" % grd)
                grade = grd['name']
                # Fetch the artifact titles.
                search_api = SEARCH_API % (sCode, grade, branch)
                response = remoteapi._makeCall(FLX_SERVER, search_api, 500, params_dict={'pageSize':1000}, method='GET')
                try:
                    results = response['response']['Artifacts']['result']
                    if results:
                        artifacts = results[0]['artifacts']                
                        for artifact in artifacts:
                            if artifact['title'] not in titles:
                                titles.append(artifact['title'])
                            cnt += 1
                except Exception as e:
                    logger.error('Unable to get titles for State/Branch/Grade: %s/%s/%s, Exception:%s' % (sName, branch, grade, str(e)))
                    
            logger.info("%s titles present in Branch:%s" % (cnt, branch))
        resultDict[sName] = titles
        logger.info("%s titles present in State:%s" % (len(titles), sName))        

    # Display the Artifact Titles.
    standardBoards = resultDict.keys()
    standardBoards.sort()
    for name in standardBoards:
        titles = resultDict[name]
        titles.sort()
        index = 1
        if titles:
            print "\n\n"
            logger.info("\n\n")
            print "%s ( %s titles )" % (name, len(titles))
            logger.info("%s ( %s titles )" % (name, len(titles)))
            print "-" * 100
            logger.info("-" * 100)
            for title in titles:
                print "%s. %s" % (str(index).rjust(5), title)
                logger.info("%s. %s" % (str(index).rjust(5), title))
                index += 1

def getBranches():
    """Get the list of branches.
    """
    # Fetch subjects.
    response = remoteapi._makeCall(TAXONOMY_SERVER, SUBJECT_API, 500, params_dict={'pageSize':1000}, method='GET')
    subjects = response['response']['subjects']
    branches = []
    for subject in subjects:
        # Fetch branches.
        shortname = subject['shortname']
        branch_api = BRANCH_API % shortname
        response = remoteapi._makeCall(TAXONOMY_SERVER, branch_api, 500, params_dict={'pageSize':1000}, method='GET')
        brs = map(lambda x:x['name'], response['response']['branches'])
        if brs:
            branches.extend(map(lambda x:x.lower(), brs))
    return branches
