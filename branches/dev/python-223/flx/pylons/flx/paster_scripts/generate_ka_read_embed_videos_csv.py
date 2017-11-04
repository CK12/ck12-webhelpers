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
CSV_FILE = "/tmp/ka_read_video_links.csv"
HEADER_FIELDS = ['EID', 'Modality Link']
LOG_FILE_PATH = "/tmp/logs/ka_read_video_links.log"
YOUTUBE_API_KEY = "AIzaSyB-jeOlRYEE0gOuCKSFtaPFBQC9a8a6NOA"
YOUTUBE_API = "https://www.googleapis.com/youtube/v3/videos?id=#ID#&key=%s&fields=items(id,snippet(channelTitle))&part=snippet" % YOUTUBE_API_KEY
SERVER_NAME = 'http://gamma.ck12.org/'

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
	branch_name = response['response']['branch']['name'].replace(' ', '-').lower()
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
			rows = get_csv_row(branch_name, encodedID)		
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

def get_csv_row(branch_name, encodedID):
	"""
	"""
	modality_type = "lesson"
	domain = api.getBrowseTermByEncodedID(encodedID=encodedID)
	result = api.getRelatedArtifactsForDomains(domainIDs=[domain.id],  ownedBy='ck12')
	modalities = result.results
	if not modalities:
		return []
	video_links = []
	for modality in modalities:
		# Check for video modalities
		artifact = api.getArtifactByID(id=modality.id)
		modality_type = artifact.type.name
		if modality_type not in ['lesson']:
			continue
		arft_rev = api.getArtifactRevisionByID(id=modality.artifactRevisionID)
		# Consider only published modalities.
		if not (hasattr(arft_rev, 'publishTime') and arft_rev.publishTime):
			continue
		resouce_revisions = arft_rev.resourceRevisions
		for resouce_revision in resouce_revisions:
			resource = resouce_revision.resource
			resource_type = resource.type.name
			if resource_type not in ['video', 'cover video']:
				continue
			video_id = None
			url_obj = urlparse(resource.uri)
			if url_obj.netloc != "www.youtube.com":
				continue
			if url_obj.path.startswith('/embed/'):
				video_id = url_obj.path.replace('/embed/', '')
			else:
				qs = parse_qs(url_obj.query)
				video_id = qs.get('v', '')
				if isinstance(video_id, list):
					video_id = video_id[0]
			if not video_id:
				continue
			y_api = YOUTUBE_API.replace('#ID#', video_id)
			response = callURL(y_api)
			try:
				if response['items'][0]['snippet']['channelTitle'].lower() == "khan academy":
					video_link = SERVER_NAME + '/'.join([branch_name, domain.handle, modality_type, modality.handle])
					video_links.append(video_link)
			except Exception as e:
				log.error("VideoID:%s, Error:%s" % (video_id, str(e)))
				
	rows = [[encodedID, video_link] for video_link in video_links]		
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
	type_ids = [artifact_types_dict['lesson']]
	sub_brs = getSubjectBranches()
	log.info("Subject/Branches to process:%s" % str(sub_brs))
	outf = open(CSV_FILE, "wb")
	writer = UnicodeWriter(outf)
	writer.writerow(HEADER_FIELDS)
	sub_brs = [('sci', 'bio')]
	for sub_br in sub_brs:
		sub, br = sub_br
		csv_rows = process_branch(sub, br, type_ids)
		writer.writerows(csv_rows)
	outf.close()
	log.info("Time Taken:%s" % (time.time() - stime))

if __name__ == "__main__":
	run()
