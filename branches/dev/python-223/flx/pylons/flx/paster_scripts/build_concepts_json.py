import requests
import json
import logging
import logging.handlers
import time

from pylons import app_globals as g
from flx.model import api

related_artifacts_json_file = "/tmp/concept_data/related_artifacts.json"
concept_json_file = '/tmp/concept_data/data.json'

# Logging configuration
log_filename = "/tmp/concept_data/concept_json.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=10*1024*1024, backupCount=30)
#handler = logging.StreamHandler()
handler.setFormatter(formatter)
log.addHandler(handler)

artifact_info = dict()

def _call_api(_api):
    """Function to call the api.
    """
    response = requests.get(_api)
    json_response = response.json()
    return json_response

def run():
    """Generates concept json.
    """
    stime = time.time()
    # Prefetch the artifact details.
    _build_artifact_info()
    all_concepts_info = dict()
    data = open(related_artifacts_json_file).read()
    artifacts_data = json.loads(data)
    total_count = len(artifacts_data)
    log.info("Total [%s] artifacts to process." % total_count)
    count = 0
    index = 0
    limit = 5
    no_collections_count = 0
    # Get the artifact types
    modalities = ['lesson', 'lecture', 'enrichment', 'rwa']
    artifact_types = g.getArtifactTypes()
    type_ids = []
    for modality in modalities:
        if artifact_types.has_key(modality):
            type_ids.append(artifact_types[modality])
    log.info("type_ids: [%s]" % type_ids)
    for artifact_id in artifacts_data:
        try:
            #if index >= limit:
            #    break
            index += 1
            log.info("Processing record [%s/%s], artifactID: [%s]" % (index,total_count,artifact_id))
            # Get collection information from artifact.
            artifact_dict = _get_artifact_dict(artifact_id)
            collections = artifact_dict.get('collections')
            if not collections:
                no_collections_count += 1     
                log.info("No collections for artifact ID: [%s]" % artifact_id)
                continue
            collection_info = collections[0] 
            encodedID = collection_info['encodedID']
            log.info("encodedID: [%s]" % encodedID)
            # Prepare the concept information
            concept = dict()
            concept['encodedID'] = encodedID
            concept['name'] = collection_info['conceptCollectionTitle']
            domain = api.getBrowseTermByEncodedID(encodedID)
            # Get the concept description        
            concept['description'] = domain.description
            # Build the url 
            collection_handle = collection_info['collectionHandle']
            concept_handle = collection_info['conceptCollectionAbsoluteHandle']
            concept_collection_handle = '%s-::-%s' % (collection_handle, concept_handle)
            url = '/c/%s/%s/' % (collection_handle, concept_handle)
            concept['url'] = url
            # Get the concept modalities
            concept['modalities'] = _get_concept_modalities(concept_collection_handle, domain, type_ids)
            # Get related artifacts
            related_artifacts_data = artifacts_data[artifact_id]
            concept['related'] = _get_related_artifacts(related_artifacts_data)
            concept_key = "%s_%s" % (encodedID, collection_handle)
            all_concepts_info[concept_key] = concept
            count += 1
            log.info("Processing record [%s/%s] completed." % (index, total_count))
        except Exception as ex:
            log.info("Got Exception for artifact_id: [%s], Exception: [%s]" % (artifact_id, str(ex)))

    log.info("Records processed count: [%s]" % count)
    log.info("Records with no collection info count: [%s]" % no_collections_count)
    log.info("Writing data to file [%s]" % concept_json_file)            
    with open(concept_json_file, 'w') as outfile:
        json.dump(all_concepts_info, outfile)
            
    log.info("buildConceptJson script completed.")
    log.info("Time Taken : [%s]" % (time.time() - stime))

def _get_concept_modalities(concept_collection_handle, domain, type_ids):
    """Get the modalities for the concept.
    """
    modalities = []
    try:
        log.info("In _get_concept_modalities, concept_collection_handle : [%s]" % concept_collection_handle)
        _modalities = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], ownedBy='ck12', conceptCollectionHandle=concept_collection_handle, conceptCollectionHandleLikeQuery=False, typeIDs=type_ids, 
                     collectionCreatorID=3)
        artifact_ids = list(set([modality.id for modality in _modalities]))
        artifacts = []
        for artifact_id in artifact_ids:
            _modality = _get_artifact_dict(artifact_id)
            modality = {}
            modality['type'] = _modality['artifactType']
            modality['image'] = _modality.get('coverImageSatelliteUrl', '')
            modality['level'] = _modality['level']
            modality['creator'] = _modality['creator']
            modality['perma'] = _modality['perma']
            modality['summary'] = _modality['summary']
            modality['title'] = _modality['title']
            modalities.append(modality)
        log.info("Modality count [%s]" % len(modalities))
    except Exception as ex:
        log.info("Exception in _get_concept_modalities, Exception: [%s]" % str(ex))        
    return modalities

def _get_related_artifacts(related_artifacts_data):
    """
    """
    log.info("In _get_related_artifacts")
    related_artifacts = []
    for related_artifact_info in related_artifacts_data:
        related_artifact_id = related_artifact_info['relatedArtifact']
        similarity = related_artifact_info['similarity']
        artifact_dict = _get_artifact_dict(related_artifact_id)
        #artifact_dict = artifact.asDict()
        collections = artifact_dict.get('collections')
        if not collections:
            log.info("No collections for related artifact, ID:[%s]" % related_artifact_id)
            continue
        collection_info = collections[0] 
        related_artifact_eid = collection_info['encodedID']
        related_artifacts.append({'EID':related_artifact_eid, 'similarity':similarity})
    log.info("Related Artifacts count [%s]" % len(related_artifacts))    
    return related_artifacts

def _get_artifact_dict(artifact_id):
    """
    """
    global artifact_info
    artifact_id = int(artifact_id)
    # Check if artifact information is available in global dictionary
    artifact_dict = artifact_info.get(artifact_id)
    if not artifact_dict:
        # Get the artifact information and save in global dictionary.
        log.info("No record for artifact, ID: [%s]" % artifact_id)
        artifact = api.getArtifactByID(id=artifact_id)
        artifact_dict = artifact.asDict()
        artifact_info[artifact_id] = artifact_dict
    return artifact_dict

def _build_artifact_info():
    """Fetch all the artifact and its details and store in global dictionary.
    """
    global artifact_info
    # Get the data from json
    data = open(related_artifacts_json_file).read()
    artifacts_data = json.loads(data)
    # Prepare the list of artifact IDs
    _ids = []
    for artifacts_id in artifacts_data:
        related = artifacts_data[artifacts_id]
        related_ids = [x['relatedArtifact'] for x in related]
        _ids.extend(related_ids)
    _ids.extend(artifacts_data.keys())
    _ids = set(_ids)
    _ids = [int(_id) for _id in _ids]
    total_ids = len(_ids)
    start = 0
    end = 100
    batch_size = 100
    arft_keys = ['collections', 'artifactType', 'coverImageSatelliteUrl', 'level', 'creator', 'perma', 'summary', 'title']    
    # Fetch the details for each artifact in batches defined by batch size
    while True:
        log.info("start/end [%s/%s]" % (start, end))
        ids = _ids[start:end]
        artifacts = api.getArtifactsByIDs(ids)
        for artifact in artifacts:
            info = dict()
            artifact_dict = artifact.asDict()
            _id = artifact_dict['id']
            for arft_key in arft_keys:
                info[arft_key] = artifact_dict.get(arft_key)
            # Store the artifact information in global dictionary
            artifact_info[_id] = info
        start = end
        end = end + batch_size
        if start >= total_ids:
            break
