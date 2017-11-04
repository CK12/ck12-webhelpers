import os
import json
import logging

from pylons import app_globals as g
from flx.model import api
from flx.lib.remoteapi import RemoteAPI
from flx.lib import helpers as h

LOG_FILE_PATH = "/tmp/add_modality.log"
# Taxonomy server & apis
SERVER_NAME = "http://www.ck12.org"
TAXONOMY_SERVER = "http://www.ck12.org/taxonomy"
SUBJECT_API = "/get/info/subjects"
BRANCH_API = "/get/info/branches/%s"
CONCEPT_API = "/get/info/concepts/%s/%s"
DESCENDANT_CONCEPT_API = "/get/info/descendants/concepts/%s/1"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
#hdlr = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)

remoteapi = RemoteAPI()


def run(force_delete=False, memberID=3, subBrEID=None):
    """Add read modality if the concept does not have any read modality.
       force_delete -->  This flag will delete the artifact which is associated with auto-created-by-system browseterm.
       memberID --> memberID
       subBrEID --> Subject branch encodedID, eg. MAT.ARI, SCI.BIO
    """
    # Prepare the list of TypeIDs and browseTermTypes
    artifactTypesDict = g.getArtifactTypes()
    typeIDs=[artifactTypesDict['lesson']]
    typeID = typeIDs[0]
    termTypes = g.getBrowseTermTypes()
    termTypeID = termTypes['internal-tag']
    # Prpeare browseTerm list.
    defaultBrowseTerms = []    
    lvlTerm = api.getBrowseTermByIDOrName(idOrName='basic', type=termTypes['level'])
    if lvlTerm:
        defaultBrowseTerms.append({'browseTermID': lvlTerm.id})
    inTerm = api.getBrowseTermByIDOrName(idOrName='auto-created-by-system', type=termTypeID)
    if inTerm:
        defaultBrowseTerms.append({'browseTermID': inTerm.id})
    # Prepare resources
    language = api.getLanguageByName(name='English')
    resourceType = api.getResourceTypeByName(name='contents')
    resourceDict = {
        'resourceType': resourceType,
        'description': '',
        'isExternal': False,
        'uriOnly': False,
        'languageID': language.id,
    }
    # Get the list of all the subjects and branches.
    if subBrEID:
        results = [tuple(subBrEID.split('.'))]
    else:
        results = getSubjectBranches()
    for result in results:
        try:
            concept_api = CONCEPT_API % result
            # Get all the concepts under branch.
            response = remoteapi._makeCall(TAXONOMY_SERVER, concept_api, 500, params_dict={'pageSize':1000}, method='GET')
            cons = response['response']['conceptNodes']
            if cons:
                conList = []
                subName = cons[0]['subject']['name']
                brName = cons[0]['branch']['name']
                # Prepare list of concepts under branch.
                for con in cons:
                    eid = con['encodedID']
                    logger.info("Processing encodedID:%s" % eid)
                    #print "Processing encodedID:%s" % eid
                    # get read modality count.
                    domain = api.getBrowseTermByEncodedID(encodedID=eid)
                    if not domain:
                        logger.info("No Browseterm exists for encodedID:%s" % (eid))    
                        continue
                    # Check if lesson artifact exists for internal-tag.
                    artifact = getArtifact(typeID, termTypeID, con['handle'], eid, memberID)
                    if not artifact:
                        # Do not add read modalities if already exists.
                        modalities = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], typeIDs=typeIDs, memberID=memberID)
                        logger.info("Read modality count for encodedID:%s is %s" % (eid, len(modalities)))
                        if not modalities.getTotal():
                            # If read modalities do not exists create new read modality.
                            logger.info("Creating Read modalities for eid:%s" % eid)
                            browseTerms = defaultBrowseTerms + [{'browseTermID': domain.id}]
                            createReadModality(con, memberID, browseTerms, resourceDict)
                    elif force_delete:
                        # If modality exist and force_delete flag is set delete the modality and create new modality.
                        logger.info("Deleting Read modalities for eid/artifactID %s/%s" %(eid, artifact.id))
                        api.deleteArtifactByID(artifact.id)   
                        # Create new read modality.
                        logger.info("Creating Read modalities for eid:%s" % eid)
                        browseTerms = defaultBrowseTerms + [{'browseTermID': domain.id}]
                        createReadModality(con, memberID, browseTerms, resourceDict)
                    else:
                        logger.info("Read modalities with internal-tag exists for eid:%s" %eid)
                logger.info('Completed processing for Subject/Branch :%s/%s' % (subName, brName))                
        except Exception as e:
            import traceback
            traceback.print_exc()
            logger.error('Unable to get modality count for Record:%s, Exception:%s' % (result, str(e)))            
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
    
def createReadModality(concept, memberID, browseTerms=None, resourceDict=None):
    """Create read modality for the given concept.
    """
    #return
    # Prepare create lesson parameters.
    name = concept['name']
    handle = concept['handle']
    eid = concept['encodedID']
    creator = memberID
    domainEIDs = [eid]
    autoSplitLesson = True
    typeName = 'lesson'

    # Get xhtml
    concepts = getDescendantInfo(eid)
    contents = getContentXhtml(name, concepts)
    # Prepare resources
    resourceDict['name'] = name
    resourceDict['contents'] = contents
    resources = [resourceDict]

    # Club all the parameters for creating modality.
    kwargs = dict()
    kwargs['name'] = name
    kwargs['handle'] = "%s-auto" % handle
    kwargs['description'] = "Explore additional resources on %s" %(concept['name'])
    #kwargs['encodedID'] = "%s.L.1" % eid
    kwargs['creator'] = creator
    kwargs['autoSplitLesson'] = True
    kwargs['typeName'] = 'lesson'
    kwargs['domainEIDs'] =  domainEIDs
    kwargs['browseTerms'] = browseTerms
    kwargs['resources'] = resources
    try:
        # Create artifact
        artifact, concept = api.createLesson(**kwargs)
        # Index artifact
        taskId = h.reindexArtifacts([artifact.id], memberID)
    except Exception as e:
        logger.error('Create lesson failed:%s, Exception:%s' % (kwargs, str(e)))            
        raise e

def getContentXhtml(title, concepts):
    """Returns the content XHTML.
    """
    template = """
                <body>
                    <div class="x-ck12-data-objectives"></div>
                    <div class="x-ck12-data-concept">
                        <p><b>%s</b></p>
                        %s
                    </div>
                    <div class="x-ck12-data-vocabulary"></div>
                </body>
               """
    html = ""
    html += "<p>Here are some additional resources that provide a more in-depth exploration of this topic.</p><ul>"

    for concept in concepts:
        name, link = concept
        html += '<li><p><a href="%s">%s</a></p></li>' % (link, name)
    html += '</ul>'
    xhtml = template % (title, html)
    return xhtml

def getDescendantInfo(eid):
    """Return the descendants for the given concept.    
    """
    # Fetch the list of childrens.
    descendant_concept_api = DESCENDANT_CONCEPT_API % eid
    response = remoteapi._makeCall(TAXONOMY_SERVER, descendant_concept_api, 500, params_dict={'pageSize':1000}, method='GET')
    childs = response['response']['conceptNode']['children']    
    brName = response['response']['conceptNode']['branch']['name']    
    concepts = []
    base_url = "%s/%s" % (SERVER_NAME, brName.lower())
    for child in childs:
        name = child['name']
        link = "%s/%s" % (base_url, child['handle'])
        record = (name, link)
        concepts.append(record)
    return concepts

def getArtifact(typeID, termTypeID, handle, domainEID, memberID):
    """
    """
    record = api.getRelatedArtifactByPerma(typeID, handle, memberID, domainEID)
    if record:
        artifact = record.artifact
        browseTerms = api.getArtifactHasBrowseTermsByType(artifact.id, termTypeID)
        for browseTerm in browseTerms:
            if browseTerm.name == 'auto-created-by-system':
                return artifact
#run(subBrEID="MAT.ARI", force_delete= True)
