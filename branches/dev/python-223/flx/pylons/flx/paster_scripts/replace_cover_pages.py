import sys
from urllib2 import urlopen, build_opener
import urllib
import os
import traceback
from datetime import datetime

from flx.model import api
from flx.model import meta
from flx.lib.fc import fcclient

session = meta.Session()

def run():
    resourceDict = {}
    resources = api.getResources(typeName='cover page')
    print "Resources: %d" % len(resources)
    for resource in resources:
        if 'http://authors' in resource.uri:
            print "Deleting resource with uri: %s" % resource.uri
            if not resourceDict.has_key(resource.uri):
                resourceDict[resource.uri] = []
            ars = api.getArtifactRevisionsForResource(resourceID=resource.id)
            for ar in ars:
                resourceDict[resource.uri].append(ar.id)
                ## Delete the association
                api.deleteArtifactHasResource(artifactRevisionID=ar.id, resourceRevisionID=resource.revisions[0].id)
                print "Deleted resource successfully!"

            ## Delete the resource
            api.deleteResource(resource=resource)
        else:
            print "Skipping resource with uri: %s" % resource.uri

    print "resourceDict: %s" % resourceDict
    ## Create new resources
    dir = "/tmp/covers"
    for uri in resourceDict.keys():
        fname = os.path.join(dir, os.path.basename(uri))
        urllib.urlretrieve(uri, fname)
        print "Downloaded :%s" % fname

        if os.path.exists(fname):
            rDict = {}
            image_path = fname
            path, name = os.path.split(image_path)
            rDict['uri'] = open(image_path, "rb")
            rDict['uriOnly'] = False
            rDict['isExternal'] = False
            rDict['resourceType'] = api.getResourceTypeByName(name='cover page')
            rDict['name'] = name
            rDict['description'] = 'Cover page %s' % name
            language = api.getLanguageByName(name='English')
            rDict['languageID'] = language.id
            rDict['ownerID'] = 3   
            rDict['creationTime'] = datetime.now()
            rDict['authors'] = None
            rDict['license'] = None
            
            resourceRevision = api.createResource(resourceDict=rDict, commit=True)

            if resourceRevision:
                print "Successfully created resource for: %s with id: %s" % (uri, resourceRevision.resource.id)
                ars = resourceDict.get(uri)
                for ar in ars:
                    api.createArtifactHasResource(artifactRevisionID=ar, resourceRevisionID=resourceRevision.id)
                    print "Associated resource with ar: %d" % ar
            else:
               print "Failed creating resource for uri: %s" % uri
        else:
            print "Failed downloading image: %s"% uri


