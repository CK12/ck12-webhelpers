import time
import json
import urllib
from urlparse import urlparse, parse_qs
from pylons import app_globals as g
from flx.model import api
from flx.lib.unicode_util import UnicodeWriter
from flx.lib.remoteapi import RemoteAPI
import logging

TAXONOMY_SERVER = 'http://gamma.ck12.org/taxonomy'
SUBJECT_URL = "http://gamma.ck12.org/taxonomy/get/info/subjects"
BRANCH_URL = "http://gamma.ck12.org/taxonomy/get/info/branches/%s"
CONCEPT_URL = "http://gamma.ck12.org/taxonomy/get/info/concepts/%s/%s?pageSize=-1"
CSV_FILE = "/tmp/video_count.csv"
HEADER_FIELDS = ['EID', 'Video Count (Khan Academy)', 'Has Modality']
LOG_FILE_PATH = "/tmp/logs/video_count.log"
YOUTUBE_API_KEY = "AIzaSyB-jeOlRYEE0gOuCKSFtaPFBQC9a8a6NOA"
YOUTUBE_API = "https://www.googleapis.com/youtube/v3/videos?id=#ID#&key=%s&fields=items(id,snippet(channelTitle))&part=snippet" % YOUTUBE_API_KEY

# Initialise Logger
log = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

def process_branch(subject, branch, type_ids):
	"""
	This function will generate the CSV containing 3 columns, EID, Video Count (Khan academy), Has Modality 
	"""
	log.info("Started processing Sub/Br :%s/%s" % (subject, branch))
	# Get all the Descendants info , till max depth 7.
	csv_rows = []
	baseEID = '%s.%s' % (subject.lower(), branch.lower())
	concept_api = 'get/info/descendants/concepts/%s/7' %(baseEID)
	response = RemoteAPI._makeCall(TAXONOMY_SERVER, concept_api, 500, params_dict={'pageSize':1000}, method='GET')
	childs = response['response']['branch']['children']
	level = 1
	log.info("Total %s childs to process" % len(childs))
	def _processEIDs(level, childs):
		"""
		Recursive function to get the suggestions.
		"""
		# We can go deep down until level 7.
		if level > 7:
		    return None

		childrens = []
		modalitiesCount = 0
		for child in childs:
			encodedID = child['encodedID']
			rows = get_csv_row(encodedID, type_ids)		
			csv_rows.extend(rows)
			# Prepare the list concepts present on next level.
			childrens.extend(child['children'])

		# Set the concept count for every level.
		#key = "level_%s" % level
		#conceptCountDict[key] = {'concept_count' : len(childs), 'modalities_count': modalitiesCount}

		if childrens:
			# Do recursive call.
			level = level + 1
			_processEIDs(level, childrens)

	_processEIDs(level, childs)
	log.info("Completed processing Sub/Br :%s/%s" % (subject, branch))
	log.info("SUB/BR csv rows count:%s" % len(csv_rows))
	return csv_rows

def get_csv_row(encodedID, video_type_ids):
	"""
	"""
	domain = api.getBrowseTermByEncodedID(encodedID=encodedID)
	result = api.getRelatedArtifactsForDomains(domainIDs=[domain.id],  ownedBy='ck12')
	modalities = result.results
	has_modality = True if modalities else False
	video_links = []
	video_count = 0
	for modality in modalities:
		# Check for video modalities
		if modality.artifactTypeID not in video_type_ids:		
			continue
		arft_rev = api.getArtifactRevisionByID(id=modality.artifactRevisionID)
		# Consider only published modalities.
		if not (hasattr(arft_rev, 'publishTime') and arft_rev.publishTime):
			continue

		resouce_revisions = arft_rev.resourceRevisions
		for resouce_revision in resouce_revisions:
			resource = resouce_revision.resource
			resource_type = resource.type.name
			if resource_type != 'video':
				continue
			uri_obj = urlparse(resource.uri)
			params = parse_qs(uri_obj.query)
			param = params.get('v', '')
			if isinstance(param, list):
				video_id = param[0]
			else:
				video_id = param
			y_api = YOUTUBE_API.replace('#ID#', video_id)
			response = callURL(y_api)
			try:
				if response['items'][0]['snippet']['channelTitle'].lower() == "khan academy":
					video_count += 1
					video_links.append(resource.uri)
			except:
				pass												
				
	if video_links:
		rows = []
		for video_link in video_links:
			rows.append([encodedID, video_count, has_modality, video_link])
	else:
		rows =  [[encodedID, video_count, has_modality, '']]
	return rows

def getSubjectBranches():
    """
    Get the list of subject and respetive branches.
    """
    # Fetch subjects.
    response = callURL(SUBJECT_URL)
    subjects = response['response']['subjects']
    subBrancheList = []
    for subject in subjects:
        # Fetch branches.
        shortname = subject['shortname']
        response = callURL(BRANCH_URL, shortname)
        branches = map(lambda x:x['shortname'], response['response']['branches'])
        if branches:
            subBrancheList.extend(map(lambda x:(shortname,x), branches))

    return subBrancheList

def callURL(url, params=None):
    """
    Calls the given url and return the extracted json.
    """
    if params:
        url = url % (params)
    fp = urllib.urlopen(url)
    data = fp.read()
    response = json.loads(data)

    return response

def run():
	stime = time.time()
	# Prepare the list of TypeIDs for videos
	artifact_types_dict = g.getArtifactTypes()
	type_ids = [artifact_types_dict['enrichment'], artifact_types_dict['lecture']]
	sub_brs = getSubjectBranches()
	log.info("Subject/Branches to process:%s" % str(sub_brs))
	outf = open(CSV_FILE, "wb")
	writer = UnicodeWriter(outf)
	writer.writerow(HEADER_FIELDS)
	#sub_brs = [('mat', 'alg')]
	for sub_br in sub_brs:
		sub, br = sub_br
		csv_rows = process_branch(sub, br, type_ids)
		writer.writerows(csv_rows)
	outf.close()
	log.info("Time Taken:%s" % (time.time() - stime))

if __name__ == "__main__":
	run()
