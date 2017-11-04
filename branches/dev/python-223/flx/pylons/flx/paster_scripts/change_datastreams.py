import sys
from urllib2 import urlopen, build_opener
import os
import traceback

from flx.model import api
from flx.model import meta
from flx.lib.fc import fcclient

session = meta.Session()

def run():
    f = fcclient.FCClient()
    changed = 0

    for rtype in ['cover page', 'image']:
        pageNum = 1
        pageSize = 64
        while True:
            resources = api.getResources(typeName=rtype, pageNum=pageNum, pageSize=pageSize)
            if not resources:
                break

            for r in resources:
                try:
                    print "Processing: %d" % r.id
                    obj = f.getResourceObject(id=r.refHash)
                    print "Datastreams: %s" % obj.datastreams()
                    if obj and ('IMAGE_THUMB_170' in obj or 'IMAGE_THUMB_192' in obj or 'COVER_PAGE_THUMB_170' in obj or 'COVER_PAGE_THUMB_192' in obj):
                        url = r.getUri()
                        print url
                        toFile = os.path.join('/tmp/regen', os.path.basename(r.uri))
                        opener = build_opener()
                        imgFile = opener.open(url, None, 30)
                        output = open(toFile, 'wb')
                        output.write(imgFile.read())
                        output.close()
                        print "Wrote file: %s" % toFile

                        updateResource(r, toFile)
                        print "Finished processing: %d" % r.id
                        os.remove(toFile)
                        changed += 1
                        if changed % 1000 == 0:
                            print "Changed: %d" % changed
                    else:
                        print "Skipping object - already converted?"

                except Exception, e:
                    errf = open("/opt/change_datastreams.log", "a")
                    errf.write("Error processing resource: %d" % r.id)
                    errf.write(traceback.format_exc(e))
                    errf.close()
                    print str(e)

            pageNum += 1
    print "Changed: %d" % changed

def updateResource(resource, image_path):
    try:
        print "ID: %d" % resource.id
        resourceDict = {}
        resourceDict['id'] = int(resource.id)
        resourceDict['resourceRevision'] = resource.revisions[0]
        resourceDict['resourceName'] = resource.name
        resourceDict['resourceDesc'] = resource.description
        resourceDict['uriOnly'] = False
        resourceDict['isExternal'] = False
        resourceDict['uri'] = open(image_path, 'rb')
 
        resourceDict['ownerID'] = resource.ownerID
       
        member = api.getMemberByID(id=resourceDict['ownerID'])

        resourceRevision, copied, versioned = api.updateResource(resourceDict=resourceDict, member=member, commit=True)
        resourceID = resourceRevision.resource.id
        print "ID: %d" % resourceID
        ## Use the perma url
        print resourceRevision.resource.getPermaUri()
    except Exception as e:
        print e


