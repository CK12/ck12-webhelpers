# A script to do a find and replace  an artifact's and children xhtml for regex epression and replacement pattern
# User James Sousa was having save issues, due to http://archive.ck12.org in the image src and alt 
# He was seeing error massage Images got absolute URL from Rosseta validation.
# 11.21.13 Felix

from flx.model import api
import re
import logging
import urllib
import datetime
import uuid


LOG_FILENAME = "/tmp/remove_archive_images.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

# Find the instances of re pattern(s)
def _find_And_Replace_Xhtml(xhtml,regex=['src="http://archive\.ck12\.org/ck12/ucs/\?math=','alt="/archive\.ck12\.org/ck12/ucs/\?math=','src="http://archive\.ck12\.org/ck12/ucs/\?blockmath=','alt="/archive\.ck12\.org/ck12/ucs/\?blockmath=','alt="ath=','src="http://www\.ck12\.org/flx',],sub=['src="/flx/math/inline/','alt="','src="/flx/math/block/','alt="','alt="','src="/flx']):
	xhtml = xhtml
	compiled_regex = map(lambda x: re.compile(x),regex)
	for i,ptrn in enumerate(compiled_regex):
		#print " Found %s occurences of %s"%(len(ptrn.findall(xhtml)),ptrn.pattern)
		log.info(" Found %s occurences of %s"%(len(ptrn.findall(xhtml)),ptrn.pattern))
		xhtml = ptrn.sub(sub[i],xhtml)
	return xhtml	

def _dl_image(xhtml,regex='src="(http://archive\.ck12\.org/ck12/images\?id=[0-9]*)"'):
	images_path = re.findall(regex,xhtml)
	return images_path

def _create_image_resource(artifactRevision,imageUrls):
	flxImages =[]	
	for image in imageUrls:
		resourceDict = {}
		resourceDict['resourceType'] = api.getResourceTypeByName(name="image")
		resourceDict['name'] = "image_%s"%(str(uuid.uuid1())[0:6])
		resourceDict['description'] = ''
		resourceDict['isExternal'] = False
		resourceDict['uriOnly'] = False
		resourceDict['uri'] = open(urllib.urlretrieve(image)[0],'rb')
		resourceDict['creationTime'] = datetime.datetime.now()
		resourceDict['ownerID'] = artifactRevision.artifact.creatorID
		resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
		downloadUri = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=False)
		#print "Old: %s, New: %s"%(image,downloadUri)
		downloadUri= 'src="%s'%downloadUri
		log.info("Old: %s, New: %s"%(image,downloadUri))
		artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                    resourceRevisionID=resourceRevision.id)
		flxImages.append(downloadUri)
	return flxImages

def run(artifactID,dryRun=False):
	#print "Dry run enabled, will not update revision(s) xhtml."
	log.info("Dry run enabled, will not update revision(s) xhtml.")
	book = api.getArtifactByID(id=artifactID)	
	for child in book.revisions[0].getChildren():
		#print child.getTitle()
		log.info(child.getTitle())
		for section in child.revisions[0].getChildren():
			oldimages = []
			newimages = []
			xhtml = section.revisions[0].getXhtml()
			#if section.type.name == c
			artifactRevisionID = section.revisions[0].id
			#print artifactRevisionID, section.getTitle()
			log.info("RevisionID: %s  Title: %s"%(artifactRevisionID, section.getTitle()))
			oldimages = _dl_image(xhtml)
			if oldimages:
				newimages = _create_image_resource(section.revisions[0],oldimages)
				temp = []
				for img in oldimages:
					temp.append('src="http://archive\.ck12\.org/ck12/images\?id=[0-9]*"')
				xhtml = _find_And_Replace_Xhtml(xhtml,regex=temp,sub=newimages)
			updated_xhtml = _find_And_Replace_Xhtml(xhtml)
			if not dryRun:
				api.replaceRevisionContent(artifactRevisionID, updated_xhtml)	

