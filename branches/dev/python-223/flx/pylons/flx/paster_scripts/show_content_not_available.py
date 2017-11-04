# This script replaces the content of the artifact with a new html content
# He was seeing error massage Images got absolute URL from Rosseta validation.
# 11.26.13 Felix

from flx.model import api
from flx.controllers.common import ArtifactCache
import uuid

#import logging
#LOG_FILENAME = "/tmp/remove_archive_images.log"
#log = logging.getLogger(__name__)
#log.setLevel(logging.DEBUG)
#handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
#log.addHandler(handler)


def run(artifactID, fileName=None, 
        replaceXhtml = ('<h3>This content is no longer available</h3>'
                        '<p id="x-ck12-YWZkNjg4OTg0ODYyYjMxNDNkYzhiOGYyNTA4NTFiZGQ.-fil">'
						'This content has been removed from our site and is no longer available.'
						'We apologize for the inconvenience caused.</p>'), 
        dryRun=True):

    replaceXhtml = replaceXhtml
    artifact_list = []
    
    def _writeOldXhtml(artifactID,xhtml):
        # Save a copy of the latest revision content
        OLD_XHTML_FILENAME = "/tmp/saved_xhtml_%s.%s.txt"%(artifact.id,str(uuid.uuid1())[0:6])
        with open(OLD_XHTML_FILENAME,'w') as xhtmlDump:
            xhtmlDump.write(xhtml)

    def _writeNewXhtml(artifactID,revisionID):
        if dryRun:
            print "Dry run enabled, will not update revision(s) xhtml."
            print "ArtifactID: %s RevisionID: %s"%(artifactID,revisionID)
            print "Xhtml:\n %s"%(replaceXhtml)
        # Update xhtml for artifact
        else: 
            print "Updating artifact revsion xhtml."
            print "ArtifactID: %s RevisionID: %s"%(artifactID,revisionID)
            print "Xhtml:\n %s"%(replaceXhtml)
            api.replaceRevisionContent(revisionID,replaceXhtml)

    if fileName:
	rawIds = None
        with open(fileName,'r') as f:
	    rawIds = f.read().strip().split(',')
	artifact_list = map(lambda x: api.getArtifactByID(id=x),rawIds)

        for i,artifact in enumerate(artifact_list):
	    if artifact <> None:
		if artifact.type.name <> "chapter":	
		    artifactID = str(artifact.id)
		    _writeOldXhtml(artifactID,artifact.revisions[0].getXhtml())
		    _writeNewXhtml(artifactID,str(artifact.revisions[0].id))
		    try:
			api.invalidateArtifact(ArtifactCache(), artifact=artifact)
			ArtifactCache().load(id=artifactID) 
			print "Invalidated cache for artifact: %s"%(artifactID)
		    except:
			print "Could not invalidate cache for artifact: %s"%(artifactID)
	    else:
		print "Artifact ID invalid or not found for: %s"%(rawIds[i])
    else:
	artifact = api.getArtifactByID(id=artifactID)
	if artifact <> None:	
	    if artifact <> None and artifact.type.name <> "chapter":	
		artifactID = str(artifact.id)
		_writeOldXhtml(artifactID,artifact.revisions[0].getXhtml())
		_writeNewXhtml(artifactID,str(artifact.revisions[0].id)) 
		try:
		    api.invalidateArtifact(ArtifactCache(), artifact=artifact)
		    ArtifactCache().load(id=artifactID) 
		    print "Invalidated cache for artifact: %s"%(artifactID)
		except:
		    print "Could not invalidate cache for artifact: %s"%(artifactID)
	else:
	    print "Artifact ID invalid or not found for: %s"%(artifactID)
