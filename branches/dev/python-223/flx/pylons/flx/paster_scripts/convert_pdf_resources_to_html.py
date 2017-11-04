import logging
import shutil
from datetime import datetime
from tempfile import NamedTemporaryFile
import os
import urllib2
import subprocess
import json
from bs4 import BeautifulSoup
import traceback

LOG_FILE_PATH="/tmp/artifact_convert_pdf_to_html.log"
STUDY_GUIDE_HTML_DL_LOCATION = "/tmp/study_guides_html/"

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.DEBUG)
log = logger

from flx.model import api, meta, model
from flx.controllers import member
from flx.controllers.artifact import ArtifactController as AC

OWNER_ID=3
ARTIFACT_TYPE="studyguide"

DELETE_RESOURCE_IF_EXISTS = True
DELETE_RESOURCE_ARTIFACT_ASSOCIATIONS_IF_EXISTS = True

ARTIFACT_IDS = []

#zoomValues = {"studyguide":2}

#zoom = zoomValues.get(ARTIFACT_TYPE, 2)

OUTPUTSIZES = ["320", "768", "1024"]

OUTPUTSIZENAMES = {"320": "small", "768": "medium", "1024": "large"}

def convertPDFtoHTMLandPreProcess(resourceToConvert, artifact, session):
	#replacing 'https' for 'http' , to avoid SSL handshake failures when initialing downloads
	resourceSatelliteURL = resourceToConvert["satelliteUrl"].replace("https","http")
	resp = urllib2.urlopen(resourceSatelliteURL)
	tf = NamedTemporaryFile(delete=False)
	tf.write(resp.read())
	tf.close()
	log.debug("Temporary File Name :: %s"%tf.name)

	#Create Directory as per artifact ID
	htmlResourceDLPath = os.path.join(STUDY_GUIDE_HTML_DL_LOCATION, str(artifact.id))
	if not os.path.exists(htmlResourceDLPath):
		os.mkdir(htmlResourceDLPath)

	#Get Existing PDF Resource Revision publish Time. 
	#The publish Time of PDF resource will be applied to all the converted documents for all the sizes 
	pdfResourceRevision = api.getUnique(model.ResourceRevision, 'id', resourceToConvert["revisions"][0]["id"])
	pdfRRPublishTime = pdfResourceRevision.publishTime

	for size in OUTPUTSIZES:
		log.debug("Processing document conversion for Size : %s px"%size)

		#Execute conversion command
		commandArgs = ["pdf2htmlEX", tf.name, "--fit-width="+size, "--dest-dir="+htmlResourceDLPath]
		returnCode = subprocess.call(commandArgs)
		log.debug("Executing conversion command :: %s"%" ".join(commandArgs))
		if returnCode != 0:
			raise Exception("PDF to HTML Conversion process failed and exited with non-zero return code.")

		#Preprocess HTML
		htmlfileName = os.path.basename(tf.name) + ".html"
		soup = BeautifulSoup(open(os.path.join(htmlResourceDLPath, htmlfileName)))
		metatag = soup.new_tag('meta')
		metatag.attrs["description"] = artifact.description
		soup.head.append(metatag)

		addMarginTopOnPageLoad = soup.new_tag("script")

		addMarginTopOnPageLoad.string = "document.addEventListener('DOMContentLoaded', function(event) { \
		var p = document.getElementById('pf1'); \
		var leftPos = p.getBoundingClientRect().left;\
		var marginValue = ((parseFloat(leftPos)*60)/100) + 'px';\
		p.style.marginTop = marginValue;\
		var bottomMarginValue = ((parseFloat(leftPos)*70)/100) + 'px';\
		var lastPageFrame = document.querySelectorAll('div.pf:last-child')[0];\
		lastPageFrame.style.marginBottom = bottomMarginValue;});"
		soup.head.append(addMarginTopOnPageLoad)

		titleText = artifact.name + " | " + artifact.description
		soup.head.find("title").append(titleText)

		#Write final soup output to file, take the filename from handle/uri
		if resourceToConvert["handle"] is not None and len(resourceToConvert["handle"].strip()) != 0:
			htmlfileName = resourceToConvert["handle"].replace("pdf", "html")
		elif resourceToConvert["uri"] is not None and len(resourceToConvert["uri"].strip()) != 0:
			htmlfileName = resourceToConvert["uri"].replace("pdf", "html")

		name, ext = os.path.splitext(htmlfileName)
		htmlfileName = name + "_" + OUTPUTSIZENAMES[size] + ext
		log.debug("html file name to write as per size: %s"%htmlfileName)

		with open(os.path.join(htmlResourceDLPath, htmlfileName), "w") as fileHandle:
			fileHandle.write(str(soup))

		log.debug("Converted html document placed at :: %s"%str(os.path.join(htmlResourceDLPath, htmlfileName)))

		convertedHtmlFilePath = os.path.join(htmlResourceDLPath, htmlfileName)

		#Create Resource and associate with artifact
		artifactRevision = artifact.revisions[0]
		resourceDict = {}
		path, name = os.path.split(convertedHtmlFilePath)
		resourceDict['uri'] = open(convertedHtmlFilePath, "rb")
		resourceDict['uriOnly'] = False
		resourceDict['isExternal'] = False
		resourceDict['resourceType'] = api.getResourceTypeByName(name='html')
		resourceDict['handle'] = resourceDict['name'] = name
		resourceDict['description'] = artifact.description
		language = api.getLanguageByName(name='English')
		resourceDict['languageID'] = language.id
		resourceDict['ownerID'] = OWNER_ID
		resourceDict['creationTime'] = datetime.now()
		resourceDict['isAttachement'] = True

		#Delete Resource if it exists
		if DELETE_RESOURCE_IF_EXISTS:
			existingResourceRevision = api.getResourceByHandle(handle = resourceDict["handle"], 
				typeID = resourceDict["resourceType"].id, ownerID=OWNER_ID)
			if existingResourceRevision:
				resource = existingResourceRevision.revisions[0].resource
				log.debug("Deleting Existing Resource with resource ID :: %d"%resource.id)
				api.deleteResource(resource = resource, 
					deleteAssociations = DELETE_RESOURCE_ARTIFACT_ASSOCIATIONS_IF_EXISTS)

		resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)

		#Update new Resource Revision `publishTime` parameter
		if pdfRRPublishTime is not None:
			htmlResourceRevision = api.getUnique(model.ResourceRevision, 'id', resourceRevision.id)
			if htmlResourceRevision:
				log.debug("Updating html resource revision `publishTime` parameter for resource revision ID :: %s"%htmlResourceRevision.id)
				htmlResourceRevision.publishTime = pdfRRPublishTime
				session.add(htmlResourceRevision)
				session.flush()

		log.debug("Resource Revision :: %s"%resourceRevision.asDict())
		log.debug("Artifact Revision :: %s"%artifactRevision.asDict())

		rID = resourceRevision.resourceID
		log.debug("Created New Resource :: %s for Artifact ID :: %s"%(rID, artifact.id))
		log.debug("Updating Resource ID :: %s and setting `isAttachment` flag to true."%rID)

		resource = api.getUnique(model.Resource, 'id', rID)
		if resource:
			resource.isAttachment = True
			session.add(resource)
			session.flush()

		artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
		 resourceRevisionID=resourceRevision.id)
		log.debug("artifact revisions has resource api result:%s"%artifactRevisionHasResource)

	os.remove(tf.name)

def getArtifacts():
	
	#Forcefully delete previously exported files.
	if os.path.exists(STUDY_GUIDE_HTML_DL_LOCATION):
		shutil.rmtree(STUDY_GUIDE_HTML_DL_LOCATION)
	os.mkdir(STUDY_GUIDE_HTML_DL_LOCATION)		

	owner=member.getMember(OWNER_ID)
	pageNum=1
	pageSize=10
	ac = AC()
	pdfDocumentsConverted = 0
	artifactsIDs = list()
	resourceIDs = list()
	session = meta.Session()
	try:
		while True:
			if ARTIFACT_IDS:
				artifacts = api.getArtifactsByIDs(ARTIFACT_IDS)
			else:
				artifacts = api.getArtifactsByOwner(owner=owner, typeName=ARTIFACT_TYPE, pageNum=pageNum, pageSize=pageSize)
				if len(artifacts.results) == 0:
					break
			for artifact in artifacts:
				#resourceInfo = json.loads(ac.getResourcesInfo(id=artifact.id, resourceTypes=ARTIFACT_TYPE, attachmentsOnly=True))
				#Remove `ARTIFACT_TYPE` filter while fetching resources for the artifact 
				resourceInfo = json.loads(ac.getResourcesInfo(id=artifact.id, attachmentsOnly=True))
				#print resourceInfo
				if resourceInfo["responseHeader"]["status"] == 0:
					if resourceInfo["response"]["resources"]:
						#resource = resourceInfo["response"]["resources"][0]
						for resource in resourceInfo["response"]["resources"]:
							attrsToCheck = ["handle", "uri", "originalName"]
							for attr in attrsToCheck:
								if resource[attr].find(".pdf") != -1 and resource["satelliteUrl"] is not None:
									convertPDFtoHTMLandPreProcess(resource, artifact, session)
									artifactsIDs.append(str(artifact.id))
									resourceIDs.append(resource["id"])
									pdfDocumentsConverted+=1
									#Break after conversion is completed once, if we dont break here, the same resource 
									#will get converted multiple times.
									break
							else:
								log.debug("Skipping Processing Resource :: %d for Artifact :: %d as its not in PDF format."%(resource["id"],artifact.id))
			else:
				pageNum+=1
				print "Processing Records From :: %s To :: %s"%((pageNum-1)*pageSize, pageNum*pageSize)
			if ARTIFACT_IDS:
				log.debug("Processed through %s Artifacts."%ARTIFACT_IDS)
				print "Completed Processing through Provided Artifact IDs List"
				break
	except:
		print "Got Exception while converting PDF Resources to HTML"
		log.error("Got Exception while converting PDF Resources to HTML")
		log.error(traceback.format_exc())
	finally:
		session.close()
		log.debug("Converted Artifacts list :: %s"%artifactsIDs)
		log.debug("Converted Resources list :: %s"%resourceIDs)
		print "Converted %d pdf documents to html resources for all the output sizes."%pdfDocumentsConverted

def run():
	getArtifacts()

if __name__ == "__main__":
	run()
