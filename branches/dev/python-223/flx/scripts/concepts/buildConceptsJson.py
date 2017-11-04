import requests
import json
import logging
import logging.handlers
import time
import csv
# Logging configuration
log_filename = "/tmp/concept_json.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(log_filename, maxBytes=10*1024*1024, backupCount=30)
#handler = logging.StreamHandler()
handler.setFormatter(formatter)
log.addHandler(handler)

collection_api = "https://gamma.ck12.org/taxonomy/collections/published"
collection_concept_api = "https://api-gamma.ck12.org/taxonomy/collection/collectionHandle=%s&collectionCreatorID=3?includeRelations=True&expirationAge=daily"
modalities_api = "https://api-gamma.ck12.org/flx/get/minimal/modalities/%s?pageSize=10&pageNum=0&ownedBy=ck12&modalities=&level=&conceptCollectionHandle=%s&collectionCreatorID=3&expirationAge=daily"
concept_json_file = '/tmp/concepts.json'
related_concepts_csv = '/tmp/related_concepts.csv'

all_concepts_info = dict()
related_concepts_info = dict()

def _call_api(api):
    """Function to call the api.
    """
    response = requests.get(api)
    json_response = response.json()
    return json_response

    
def main():
    """Main function.
    """
    stime = time.time()
    # Get the list published collections 
    response = _call_api(collection_api)
    log.info("Calling the published collections api : [%s]" % collection_api)   
    collections = response['response']['collections']
    log.info("Collection Count : [%s]" % len(collections))
    # Build the related concepts mapping with key as encodedID and value as related concepts.
    _build_related_concepts(related_concepts_csv)
    # Fetch and process the concepts for each collection
    for collection in collections:
        log.info("Processing Collection : [%s]" % collection['title'])
        collection_handle = collection['handle']
        # Get the concepts for the collection
        concept_api = collection_concept_api % collection_handle
        log.info("Calling collection concepts api : [%s]" % concept_api)   
        response = _call_api(concept_api)
        concepts_info = response['response']['collection']
        concepts = _get_concepts(concepts_info, collection_handle)    
        for concept in concepts:
            encodedID = concept.pop('encodedID')
            all_concepts_info[encodedID] = concept

    log.info("Writing data to file [%s]" % concept_json_file)            
    with open(concept_json_file, 'w') as outfile:
        json.dump(all_concepts_info, outfile)
            
    log.info("buildConceptJson script completed.")
    log.info("Time Taken : [%s]" % (time.time() - stime))
    
def _get_concepts(concepts_info, collection_handle):
    """
    """
    log.info("In _get_concepts, processing collection : [%s]" % collection_handle)    
    childs = concepts_info.get('contains', [])
    log.info("Starting Childs count : [%s]" % len(childs))
    concepts = []
    
    def _process_child_concepts(childs):
        """Processes the child concepts.
        """
        for child in childs:
            if child.has_key('contains'):
                log.info("absoluteHandle : [%s]" % child['absoluteHandle'])
                log.info("Childs count : [%s]" % len(childs))
                log.info("Getting childrens for absoluteHandle : [%s]" % child['absoluteHandle'])  
                # Calling the method recursivly to process child concepts
                _process_child_concepts(child['contains'])
            else:
                concept = {}
                concept['name'] = child['title']      
                url = '/c/%s/%s/' % (collection_handle, child['handle'])
                concept['url'] = url
                concept['description'] = child.get('description', '')
                encodedID = child['encodedID']
                concept['encodedID'] = child['encodedID']
                concept['related'] = related_concepts_info.get(encodedID, [])                
                concept['modalities'] = _get_concept_modalities(child['absoluteHandle'], child['handle'])
                concepts.append(concept)
    # Builnd the concepts list for the collection
    _process_child_concepts(childs)
    return concepts

def _get_concept_modalities(absolute_handle, handle):
    """Get the modalities for the concept.
    """
    log.info("In _get_concept_modalities, absolute_handle/handle : [%s/%s]" % (absolute_handle, handle))
    modalities = []    
    api = modalities_api % (absolute_handle, handle)
    log.info("Calling modality api, [%s]" % api)
    response = _call_api(api)
    try:
        _modalities = response['response']['domain']['modalities']
    except:
        _modalities = []
    log.info("Modality count [%s]" % len(_modalities))
    for _modality in _modalities:
        #print _modality['artifactRevisionID']
        modality = {}
        modality['type'] = _modality['artifactType']
        modality['image'] = _modality.get('coverImageSatelliteUrl', '')
        modality['level'] = _modality['level']
        modality['creator'] = _modality['creator']
        modality['perma'] = _modality['perma']
        modality['summary'] = _modality['summary']
        modality['title'] = _modality['title']
        modalities.append(modality)
    return modalities

def _build_related_concepts(csv_file):
    """Build the mapping for related concepts.
       Eg. {'MAT.TRG.257': [{'EID': 'SCI.PSC.231.22', 'similarity': ''}], 'SCI.BIO.525.2': [{'EID': 'MAT.ALG.936.4', 'similarity': 0.3256} } 
    """
    global related_concepts_info
    fp = open(csv_file)
    reader = csv.reader(fp, delimiter=',', quotechar='"')    
    for row in reader:
        related_concept = dict()
        row = [x.strip() for x in row]
        concept_eid = row[0]
        related_concept_eid = row[1]
        try:
            similarity = float(row[2])
        except:
            similarity = ''
        # Build related concept 
        related_concept['EID'] = related_concept_eid
        related_concept['similarity'] = similarity
        
        if not related_concepts_info.has_key(concept_eid):
            related_concepts_info[concept_eid] = []
        related_concepts_info[concept_eid].append(related_concept)
        
if __name__ == "__main__":
    main()
