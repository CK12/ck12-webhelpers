import logging
from datetime import datetime
import traceback

LOG_FILE_PATH="/tmp/publish_artifact_resources.log"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.DEBUG)
log = logger

from flx.model import api, meta
from flx.controllers import member

OWNER_ID=3
ARTIFACT_TYPE="studyguide"

def run():
	owner=member.getMember(OWNER_ID)
	pageNum=1
	pageSize=10
	ResourcesPublished = 0
	PublishedResourceIDs = list()
	PublishedResourceRevisionIDs = list()
	session = meta.Session()
	try:
		while True:
			artifacts = api.getArtifactsByOwner(owner=owner, typeName=ARTIFACT_TYPE, pageNum=pageNum, pageSize=pageSize)
			if len(artifacts.results) == 0:
				break
			for artifact in artifacts:
				artifactRevision = api.getArtifactRevisionByArtifactID(artifactID=artifact.id, artifactRevisionID=0)
				artifactRevisions = [artifactRevision]
				for artifactRevision in artifactRevisions:
					rList = api.getResourcesFromArtifactRevisionID(artifactRevisionID=artifactRevision.id, attachmentsOnly=True)
					if rList:
						for rr, r in rList:
							if r.isAttachment == 1 and r.satelliteUrl is not None \
							and (r.handle.find(".pdf")!=-1 or r.uri.find(".pdf")!=-1) \
							and rr.publishTime is None and r.ownerID == OWNER_ID:
								log.debug("\n Unpublished Artifact Resources which will be published with current datetime :")
								log.debug("ArtifactID :: %s | ArtifactRevisionID :: %s | ResourceID :: %s | RR ID :: %s"%\
									(artifact.id, artifactRevision.id, r.id, rr.id))

								print "Publishing ResourceID :: %s | ResourceRevision ID :: %s with current datetime"%(r.id, rr.id)
								rr.publishTime = datetime.now()
								session.add(rr)
								PublishedResourceIDs.append(r.id)
								PublishedResourceRevisionIDs.append(rr.id)
								ResourcesPublished += 1
			else:
				pageNum+=1
				print "Processing Records From :: %s To :: %s"%((pageNum-1)*pageSize, pageNum*pageSize)
		#Flush session once all updated records are added to the session object.
		session.flush()
	except:
		print "Got Exception while publishing PDF Resources"
		log.error("Got Exception while publishing PDF Resources")
		log.error(traceback.format_exc())
	finally:
		session.close()
		log.debug("Published Resources list :: %s"%PublishedResourceIDs)
		log.debug("Published Resources Revisions list :: %s"%PublishedResourceRevisionIDs)
		print "Published %d pdf resources of type : '%s'"%(ResourcesPublished, ARTIFACT_TYPE)