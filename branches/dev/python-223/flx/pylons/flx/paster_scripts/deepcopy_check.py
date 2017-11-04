# Script to ensure that deecopy worked as expected.
#
# Usage: deepcopy_check.runTests(artifactID1,artifactID2,[test1,test2,...])
#        To just check published deepcopy_check.runTest(artifactID1,artifactID2,['publish'])
#        
# Author: Felix Nance

from flx.model import api
import logging
import itertools
import sys
from datetime import datetime

LOG_FILENAME = "/tmp/deepcopy_check.log"

# Custom exception Artifact types do not match.
class ArtifactMatchError(Exception):
    def __init__(self,atype,btype):
        self.artifactA = atype
        self.artifactB = btype

    def __str__(self):
        return repr(self.artifactA,self.artifactB)
   
def newLogger(name=None):
    if not name:
        name = __name__
    logger=logging.getLogger(name)
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
        logger.addHandler(handler)
    return logger


# Some Globals 
log = newLogger()

# Supported  artifact types
supportedArtifactTypes = ['book','tebook', 'workbook', 'labkit']

sourceArtifact = None
copyArtifact = None

# A flag for a more serious error. Will hault program.
foundError = 0

# Simple object that holds the test details.
tests = { 'publish':{
                     'method': 'testPublished',
                     'desc': 'Publish Check: Artifact is fully published.',
                     'pass':[],
                     'fail':[]
                    },
          'ccount':{
                    'method': 'testChildCount',
                    'desc': 'Child Count: Artifact child counts match.',
                    'pass':[],
                    'fail':[]
                   },
          'browseTerms':{
                    'method': 'testBrowseTerms',
                    'desc': 'Browse Terms: All the browse term info matches.',
                    'pass':[],
                    'fail':[]
                   },
          'authors':{
                   'method': 'testAuthors',
                   'desc': 'Authors: All the authors match.',
                   'pass':[],
                   'fail':[]
                   }

        }

# Clear any test results
def _resetTests():
    global foundError 
    foundError = 0
    for key, val in tests.iteritems():
        val['pass'] = []
        val['fail'] = []

def getArtifacts(artId1=None, artId2=None):
    """ Get aritifact from id, check that the artifact is supported. """
             
    global foundError 
    if artId1 and artId2: 
        global sourceArtifact 
        global copyArtifact 
        sourceArtifact = api.getArtifactByID(id=artId1)
        copyArtifact = api.getArtifactByID(id=artId2)
    else: 
        log.error ('One or more artifact Ids are missing.')

    # Make sure artifact types are supported.
    if str(sourceArtifact.type.name) not in supportedArtifactTypes:
        log.warn('Artifact type %s is not supported.'%(sourceArtifact.type.name))
        foundError = 1
    if str(copyArtifact.type.name) not in supportedArtifactTypes:
        log.warn('Artifact type %s is not supported.'%(copyArtifact.type.name))
        foundError = 1


def testPublished(artifact):
    """ Check that all artifacts aer published. """
 
    name = 'publish'
    log.debug('Checking publish for ArtifactID: %s'%(str(artifact.id)))
    if artifact.revisions[0].publishTime:
	log.debug('Pass: Artifact is published at %s'%(str(artifact.revisions[0].publishTime)))
        # Update test object with pass info
        tests[name]['pass'].append('[{0.type.name}] ({0.id}) {0.name}  {0.revisions[0].publishTime}.'.format(artifact) )
        #tests[name]['pass'].append('[{0.type.name}] ({0.id}) {0.name} published at u{0.revisions[0].publishTime}.'.format(artifact) )
    else:
	log.debug('Fail: Latest revision %s is not published.'%str(artifact.revisions[0].id))
        # Update test object with fail info
        tests[name]['fail'].append('  > [{0.type.name}] ({0.id}) {0.name}.'.format(artifact) )

def testAuthors(source,copy):
    """ Check that the authors info matches using getAuthors(). """

    name = 'authors'
    log.debug('Checking authors.')
    source_authors = source.getAuthors()
    copy_authors = copy.getAuthors()
    
    if len(source_authors) == len(copy_authors):
        for authorsA,authorsB in itertools.izip(source_authors,copy_authors):
            # Check author's role.
            if authorsA['role'] != authorsB['role']:
                log.debug('Fail: Role did not match %s : %s'%(authorsA['role'],authorsB['role']))
		tests[name]['fail'].append('  > Role did not match %s : %s'%(authorsA['role'],authorsB['role']))
            # Check author's role id.
            if authorsA['roleID'] != authorsB['roleID']:
                log.debug('Fail: roleID did not match %s : %s'%(authorsA['roleID'],authorsB['roleID']))
		tests[name]['fail'].append('  > roleID did not match %s : %s'%(authorsA['roleID'],authorsB['roleID']))
            # Check author's sequence.
            if authorsA['sequence'] != authorsB['sequence']:
                log.debug('Fail: Sequence did not match %s : %s'%(authorsA['sequence'],authorsB['sequence']))
		tests[name]['fail'].append('  > sequence did not match %s : %s'%(authorsA['sequence'],authorsB['sequence']))
            # Check author's name.
            if len(tests[name]['fail']) == 0:
                log.debug('Pass: Authors %s matched %s.'%(authorsA['name'],authorsB['name']))
	        tests[name]['pass'].append('Pass: Author %s matched %s'%(authorsA['name'],authorsB['name'])) 
    else:
        log.debug('Fail: Number of authors did not match %s : %s'%(len(source_authors),len(copy_authors)))
	tests[name]['fail'].append('  > Number of authors did not match %s : %s'%(len(source_authors),len(copy_authors)))

def testBrowseTerms(source,copy):
    """ Check that the browse term info matches. """
 
    name = 'browseTerms'
    log.debug('Checking browse terms.')
    # Ignore these keys.
    ignore = ['id','_sa_instance_state']

    try:
	m_details = source.browseTerms[0].__dict__
	c_details = copy.browseTerms[0].__dict__

    # This usally means there are no browse terms.
    except IndexError as e:
        log.info("No browse terms found Source:%s Copy:%s"%(len(source.browseTerms),len(copy.browseTerms)))

    else:

	# First make sure we have the same number of keys
	if len(m_details) == len(c_details):
	    for key in c_details.keys():
		if key not in ignore:
		    if m_details[key] == c_details[key]:
			log.debug('Pass: Detail %s matched %s.'%(key,m_details[key]))
			tests[name]['pass'].append('Pass: Detail %s matched %s'%(key,m_details[key]))
		    else:
			log.debug('Fail: Details did not match %s %s : %s.'%(key,m_details[key],c_details[key]))
			# Update test object with fail info
			tests[name]['fail'].append('  > Details did not match %s %s : %s.'%(key,m_details[key],c_details[key]))
	else:
	    log.debug('Fail: Number of detail items %s : %s.'%(len(m_details),len(c_details[key])))
	    # Update test object with fail info
	    tests[name]['fail'].append('  > Number of detail items %s : %s.'%(len(m_details),len(c_details[key])))
            
def testChildCount(source,copy):
    """ Check that the number of children for the artifact match. """

    name = 'ccount'
    if len(source.getChildren())!=0 and len(copy.getChildren())!=0:
	ccount1 = source.getChildren()
	ccount2 = copy.getChildren()

	if str(ccount1[0].type.name) == str(ccount2[0].type.name):
	    log.debug('Checking child count for type %s'%ccount1[0].type.name)
	    if len(ccount1) == len(ccount2):
		log.debug('Pass: Child count %s'%(str(len(ccount1))))
                tests[name]['pass'].append('Child counts for type [%s] matched with %s'%(ccount1[0].type.name,len(ccount1))) 
	    else:
		log.debug('FAil: Child count does not match.')
                tests[name]['fail'].append('  > Child counts for type [%s] do not match %s : %s'%(ccount1[0].type.name,len(ccount1),len(ccount2))) 
		foundError=1
    else:
	log.debug('No children for this Artifact: %s'%(source.id if len(source.getChildren())==0 else copy.id))

def checkArtifacts(source, copy):
    """ Calls the test methods that do the checking. Also checks artifact types. """
 
    global foundError
    # Begin running checks
    try:
        source_tname = str( source.type.name)
        copy_tname = str(copy.type.name)
        # Check to see if artifact types match.
        if source_tname!= copy_tname:
            raise ArtifactMatchError(source_tname,copy_tname)
        else:
	    #log.info('Source Artifact ID: %s  Copy Artifact ID: %s'%( str(source.id),str(copy.id)))  
	    #log.info('Artifact type = %s'%( str(source_tname)))
            pass
    except ArtifactMatchError as e:
	log.warn('ArtifactMatchError: {0.artifactA} & {0.artifactB}.Stopping...'.format(e)) 
	log.warn('Stopping...') 
        foundError = 1
    else:
	# Check is published
        testPublished(copy) 
        testChildCount(source,copy)
        testBrowseTerms(source,copy)
        testAuthors(source,copy)
	log.debug('Done checking.')
        return

def loopArtifacts(source,copy):
    """ Iterate through the artifact & children. Call checkArtifacts() each time. """    

    # If the artfiact has children get them
    if foundError!=1:
        checkArtifacts(source,copy)
	if len(source.getChildren())!=0 and len(copy.getChildren())!=0:
	    mchildren = source.getChildren()
	    cchildren = copy.getChildren()
        
	    for childA,childB in itertools.izip(source.getChildren(),copy.getChildren()):
		loopArtifacts(childA,childB)

def getResults(runtime,checks=['publish','ccount','browseTerms','authors']):
    """ Get the test results and print them out via log. """

    global tests
    passed = []
    failed = []

    for key, val in tests.iteritems():
        if (key in checks ) and (len(val['fail'])==0): 
            #log.info('Passed %s: %s'%(key,val['desc']))
            passed.append('%s'%(val['desc']))
            #log.debug('%s'%val['pass'])

        if (key in checks ) and (len(val['fail'])!=0): 
            failed.append('%s'%(val['desc']))
            for item in val['fail']:
                failed.append(item)

    log.info('Results from checks\n'
              'Run at: {1}\n'
              '\t---------------------\n'
              '\tArtifact Name:   {0.name}\n'
              '\tCreator Login:   {0.creator.login}\n'
              '\tCreator Email:   {0.creator.email}\n'   
              '\tArtifact Type:   {0.type.name}\n'     
              '\tArtifact   ID:   {0.id}\n'     
              '\tRevision   ID:   {0.revisions[0].id}\n'
              '\tUpdate   Time:   {0.updateTime}\n'
              '\tCreation Time:   {0.creationTime}\n'
              '\t---------------------\n'.format(copyArtifact,runtime))     
    log.info('Passed: %s/%s'%(len(passed),len(checks)))
    for ok in passed:
        log.info('\t%s'%ok)

    if len(failed)!=0:
	log.info('Failed:')
	for fail in failed:
	    log.info('\t%s'%fail)

def runTests(sourceID,copyID,checks=['publish', 'ccount', 'browseTerms','authors']):
    """ Main function to run selected checks on given artifacts """

    runtime = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 

    # Get the artifacts.
    getArtifacts(sourceID,copyID)

    # Recursive loop through artifact children. 
    loopArtifacts(sourceArtifact,copyArtifact)
    if foundError!=1:
        getResults(runtime,checks)

    _resetTests()
    
 
