"""
Story #104668698 Make video modalities editable in the TinyMCE editor
"""

from flx.lib import helpers as h
from flx.model import api
from flx.controllers.common import ArtifactCache
from flx.model.api import _transactional

import logging

from datetime import datetime
LOG_FILENAME = "/tmp/modality_conversion.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

def run(artifactTypeName="lecture", ownerID=3, artifactIDs=[]):
    if not artifactIDs:
        artifacts = api.getArtifacts(typeName = artifactTypeName, ownerID = ownerID)
    else:
        artifacts = []
        for id in artifactIDs:
            artifact = api.getArtifactByID(id=id)
            artifacts.append(artifact)
            
    resourceType = api.getResourceTypeByName(name = "contents") 
    
    for a in artifacts:
        
        try:
            artifactDict, arev = ArtifactCache().load(id = a.id, artifact = a)
            contentAdded = False
            for ar in artifactDict['revisions']:
                if 'contents' in ar['resourceCounts']:
                    continue

                log.info("artifactID: %s artifactRevisionID: %s" %(ar['artifactID'], ar['artifactRevisionID']))

                attachments = ar.get('attachments', [])
                log.info('attachments: %s' % attachments)
                
                embeddedObject = None
                for attachment in attachments:
                    if attachment['type'] != "video" :
                        continue
                    embeddedObject = attachment.get('embeddedObject', None)
                    
                    if embeddedObject['provider']['name'] == "YouTube":
                        break

                if embeddedObject:
                
                    #create content resource and associate with the artifactRevision
                    xhtml = '''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"> <head><title></title></head> <body><p> %s </p></body></html>''' %embeddedObject['iframe']


                    log.info("xhtml: %s" %xhtml)
                    uri = '%s%s' % (str(ar['artifactRevisionID']), '.xhtml')                    
                    resourceDict = {
                        'ownerID': attachment['ownerID'],
                        'uriOnly': False,
                        'uri': uri,
                        'isExternal': False,
                        'name': attachment['name'],
                        'handle': attachment['handle'],
                        'resourceType': resourceType,
                        'contents': xhtml,
                        'creationTime': datetime.now(),
                    }
                    
                    create(resourceDict = resourceDict, artifactRevisionDict = ar)
                        
                    contentAdded = True
            
            if contentAdded:
                idList = [a.id]
                h.reindexArtifacts(artifactIds = idList)
        except Exception, e:
            log.error("Error [%s]" % str(e), exc_info=e)

@_transactional()
def create(session, resourceDict, artifactRevisionDict):
    resourceRevision = api._createResource(session, resourceDict = resourceDict, commit = True)
    arid = artifactRevisionDict['artifactRevisionID']
    ahr = api._getArtifactRevisionHasResource(session, arid, resourceRevision.id)
    if not ahr:
        ahr = api._createArtifactHasResource(session, artifactRevisionID=arid, resourceRevisionID=resourceRevision.id)
        log.info('ahr[%s]' % ahr)
    ArtifactCache(session=session).invalidate(artifactRevisionDict['artifactID'], arid)
