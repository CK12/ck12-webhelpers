import random
import time
import os
import re

from flx.tests import *
from flx.model import meta
from flx.model import api
from flx.lib import helpers as h
from flx.lib.fc import fcclient as fc

artifact = None

pidExp = re.compile(r'f-[ds]:([0-9]+)')

class TestFedora(TestController):

    def setUp(self):
        super(TestFedora, self).setUp()
        session = meta.Session()
        self.useImageSatellite, self.imageSatelliteServer, self.iamImageSatellite = h.getImageSatelliteOptions()

    def test_loadResources(self):
        if self.useImageSatellite:
            return
        fcclient = fc.FCClient()

        results = fcclient.searchResources(query='pid~f-?:*')
        print len(results)
        deleted = 0
        for result in results:
            try:
                pid = result['pid']
                m = pidExp.match(pid)
                if m:
                    rid = m.group(1)
                    ret = fcclient.deleteResource(id=int(rid))
                    deleted += 1
                    print "Deleted resource with id: %s? %s" % (rid, str(ret))
                else:
                    print "Did not recognize pid: %s" % pid
            except Exception, e:
                print e
            if deleted >= 100:
                print "Deleted %d resources. That's enough!" % deleted
                break

        artifacts = api.getArtifacts(pageNum=1, pageSize=30)
        for artifact in artifacts:
            print "Artifact: %d" % artifact.id
            revision = artifact.revisions[0]
            if revision.resourceRevisions:
                for rr in revision.resourceRevisions:
                    r = rr.resource
                    if not r.type.versionable:
                        print "Resource type: ", r.type.name
                        ## Need to save to fedora commons
                        relPath = r.getUri(oldStyle=True)
                        print "relPath: %s" % relPath
                        if not r.isExternal and os.path.exists(relPath):
                            name = unicode(os.path.basename(relPath))
                            if not fcclient.checkResource(name=name, resourceType=r.type.name):
                                print "Saving file: %s with id: %d" % (relPath, r.id)
                                fcclient.saveResource(id=r.id, resourceType=r.type, isExternal=r.isExternal, creator=r.ownerID, name=name, content=open(relPath, "rb"), isAttachment=r.isAttachment)
                            else:
                                print "Resource %s already exists for id: %d" % (name, r.id)
                            existingObj = fcclient.checkResource(name=name, resourceType=r.type.name)
                        else:
                            ## External
                            if not fcclient.checkResource(name=relPath, resourceType=r.type.name):
                                print "Saving external resource: %s with id: %d" % (relPath, r.id)
                                fcclient.saveResource(id=r.id, resourceType=r.type, isExternal=True, creator=r.ownerID, name=relPath, content=relPath, isAttachment=r.isAttachment)
                            else:
                                print "Resource %s already exists for id: %d" % (relPath, r.id)
                            existingObj = fcclient.checkResource(name=relPath, resourceType=r.type.name)
                        assert existingObj is not None, "Resource could not be added"

    def test_checkResource(self):
        if self.useImageSatellite:
            return
        fcclient = fc.FCClient()
        result = fcclient.checkResource(name='http://www.ck12.org/about/templates/ck12/images/logo.jpg', resourceType='image')
