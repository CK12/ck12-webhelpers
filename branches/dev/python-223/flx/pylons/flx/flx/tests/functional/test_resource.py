# -*- coding: utf-8 -*-

from flx.tests import *
from flx.model import meta
from flx.model import api
import flx.lib.helpers as h
import os
import logging
import json
import time
import codecs

log = logging.getLogger(__name__)

class TestResourceController(TestController):

    def test_createResource(self):
        session = meta.Session()
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'images', 'cover_physics_generic_chapter.png'), 'rb')
        contents = file.read()
        file.close()
        files = [('resourcePath', 'cover_physics_generic_chapter_testimage.png', contents)]
        parameters = { 'resourceType': 'cover page',
                'resourceName': 'cover_physics_generic_chapter_testimage.png',
                'resourceDesc': 'Chapter cover image for Physics - generic test image.',
                'resourceAuthors': 'Nimish P, Ezra N',
                'resourceLicense': 'Creative Commons by NC SA',
                }

        response = self.app.post(url(controller='resource', action='createResource'), upload_files=files, params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        print ">>> test_createResource: %s" % str(response)
        assert '"status": 1021' not in response, "Failed to create resource."
        js = json.loads(response.normal_body)
        resourceID = js['response']['id']
        print resourceID

        resource = api.getResourceByID(id=resourceID)
        assert resource.license == 'Creative Commons by NC SA', "Missing license info"
        assert resource.authors == 'Nimish P, Ezra N', "Missing Authors info"

        ## Create resource association
        response = self.app.post(url(controller='resource', action='createAssociation'), params={ 'resourceID': resourceID, 'artifactID': 1 }, headers={'Cookie': self.getLoginCookie(104)})
        print response
        assert '"status": 1024' not in response, "Failed to create resource association"
        js = json.loads(response.normal_body)
        resourceIDNew = js['response']['resourceID']
        resourceRevisionID = js['response']['resourceRevisionID']

        ## Delete the new resource - try  should fail
        response = self.app.post(url(controller='resource', action='deleteResource'), params = {'id': resourceIDNew }, headers={'Cookie': self.getLoginCookie(104)})
        print "Should get failure: ", response.normal_body
        assert '"status": 1023' in response

        if resourceID != resourceIDNew:
            ## Delete the original resource - try  should pass
            response = self.app.post(url(controller='resource', action='deleteResource'), params = {'id': resourceID }, headers={'Cookie': self.getLoginCookie(1)})
            print response.normal_body
            assert '"status": 1023' not in response, "Delete resource failed"

        ## Delete resource association - deleting as 1 is okay since 1 is admin
        response = self.app.post(url(controller='resource', action='deleteAssociation'), params = {'resourceID': resourceIDNew, 'artifactID': 1}, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 1025' not in response

        ## Add association back using other API
        response = self.app.post(url(controller='resource', action='createAssociations'), params={'resourceRevisionIDs': '%d,%d' % (resourceRevisionID, resourceRevisionID), 'artifactRevisionID': 1}, headers={'Cookie': self.getLoginCookie(3)})
        assert '"status": 0' not in response, "Unexpected succeed in create associations"

        ## Add association back using other API
        response = self.app.post(url(controller='resource', action='createAssociations'), params={'resourceRevisionIDs': '%d,%d' % (resourceRevisionID, resourceRevisionID), 'artifactRevisionID': 1}, headers={'Cookie': self.getLoginCookie(104)})
        assert '"status": 0' in response, "Failed in create associations"
        js = json.loads(response.normal_body)
        assert js['response']['associations'] == 1

        ## Delete resource association - deleting as 1 is okay since 1 is admin
        response = self.app.post(url(controller='resource', action='deleteAssociation'), params = {'resourceID': resourceIDNew, 'artifactID': 1}, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 1025' not in response

        ## Delete the resource
        response = self.app.post(url(controller='resource', action='deleteResource'), params = {'id': resourceIDNew }, headers={'Cookie': self.getLoginCookie(104)})
        assert '"status": 1023' not in response

    def test_createResourceContent(self):
        session = meta.Session()
        filename = os.path.join(os.path.dirname(__file__), "..", 'data', 'chapters', '10.xhtml')
        file = open(filename, 'rb')
        contents = file.read()
        file.close()
        files = [('resourcePath', os.path.basename(filename), contents)]
        parameters = { 'resourceType': 'contents',
                'resourceName': 'cover_physics_generic_chapter.png',
                'resourceDesc': 'Chapter cover image for Physics - generic image.'
                }

        response = self.app.post(url(controller='resource', action='createResource'), upload_files=files, params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 1021' in response, "Failed to create resource."

    def test_createResourceStreaming(self):
        session = meta.Session()
        filename = os.path.join(os.path.dirname(__file__), "..", 'data', 'car-open-homepagevideo-350.flv')
        file = open(filename, 'rb')
        contents = file.read()
        file.close()
        filename = os.path.basename(filename)
        files = [('resourcePath', filename, contents)]
        parameters = { 'resourceType': 'video',
                'resourceName': filename,
                'resourceDesc': 'Open Content car video from PBS Nova'
                }

        response = self.app.post(url(controller='resource', action='createResource'), upload_files=files, params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 1021' not in response, "Failed to create resource."
        ret = json.loads(response.normal_body)
        resourceID = ret['response']['id']
        resource = api.getResourceByID(id=resourceID)
        assert resource
        uri = resource.getUri()
        print uri
        import urllib
        fcResID = 'f-s:%s' % resource.refHash
        #assert uri and (fcResID in uri or fcResID in urllib.unquote(uri))

        ## Delete the resource
        response = self.app.post(url(controller='resource', action='deleteResource'), params = {'id': resourceID }, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 1023' not in response, "Failed to delete the resource id: %d" % resourceID

    def test_createAndUpdateResourceExternal(self):
        session = meta.Session()
        parameters = { 
                'resourceType': 'image',
                'resourceName': 'CK-12 Logo',
                'resourceUri':  'http://www.ck12.org/about/templates/ck12/images/logo.jpg',
                'resourceDesc': 'CK-12 Logo link'
                }

        response = self.app.post(url(controller='resource', action='createResource'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 1021' not in response, "Failed to create resource."
        ret = json.loads(response.normal_body)
        externalResourceID = ret['response']['id']

        resource = api.getResourceByID(id=externalResourceID)
        revision = resource.revisions[0].revision
        ownerID = resource.owner.id
        parameters = { 
                'id': externalResourceID,
                'resourceType': 'image',
                'resourceName': '%s (updated)' % resource.name,
                'resourceUri':  'http://www.ck12.org/about/templates/ck12/images/logo.jpg',
                }

        response = self.app.post(url(controller='resource', action='updateResource'), params=parameters, headers={'Cookie': self.getLoginCookie(resource.owner.id)})
        print response
        assert '"status": 1022' not in response, "Failed to update resource."
        result = json.loads(response.normal_body)
        assert result['response']['id'] == externalResourceID, "Resource update failed"
        resource = api.getResourceByID(id=externalResourceID)
        assert resource.isExternal, "Resource update failed - type did not change"

    def test_updateResourceContents(self):
        session = meta.Session()
        resource = api.getResourceByID(id=10)
        revision = resource.revisions[0].revision

        # Make sure file is changed
        from tempfile import NamedTemporaryFile
        tf = NamedTemporaryFile(delete=False)
        tf.close()
        tf = codecs.open(tf.name, 'wb', encoding='utf-8')
        for line in open(os.path.join(os.path.dirname(__file__), "..", 'data', 'chapters', '10.xhtml'), 'r'):
            if 'Foundations of Life Science (Modified)' in line:
                line = u"<h1>Foundations of Life Science unicode[’] %s</h1>" % str(time.time())
            tf.write(line)
        tf.close()

        ## Cannot use codecs here - the data must be binary steam
        file = open(tf.name, "rb")
        contents = file.read()
        file.close()
        os.remove(tf.name)

        files = [('resourcePath', '10.xhtml', contents)]
        parameters = { 
                'id': 10,
                'resourceType': '%s' % resource.type.name,
                'resourceName': '%s (updated)' % resource.name,
                'resourceLicense': 'Proprietary',
                'resourceAuthors': 'CK-12 Foundation',
                }

        response = self.app.post(url(controller='resource', action='updateResource'), upload_files=files, params=parameters, headers={'Cookie': self.getLoginCookie(resource.owner.id)})
        print response
        assert '"status": 1022' not in response, "Failed to update resource."    
        result = json.loads(response.normal_body)
        assert result['response']['id'] == 10
        resource = api.getResourceByID(id=10)
        assert resource.revisions[0].revision != revision, "Did not detect change is version"
        assert resource.license == 'Proprietary', "Missing license info"
        assert resource.authors == 'CK-12 Foundation', "Missing Authors info"
        
    def test_updateResourceImage(self):
        session = meta.Session()
        resource = api.getResourceByID(id=7)
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'images', 'cover_physics_generic_chapter.png'), 'rb')
        contents = file.read()
        file.close()
        files = [('resourcePath', 'cover_physics_generic_chapter.png', contents)]
        parameters = { 
                'id': 7,
                'resourceType': '%s' % resource.type.name,
                'resourceName': '%s (updated)' % resource.name
                }

        ## Should be copied
        response = self.app.post(url(controller='resource', action='updateResource'), upload_files=files, params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        print response
        assert '"status": 0' in response, "Failed in update resource"

    def test_getInfo(self):
        response = self.app.get(url(controller='resource', action='getInfo', id=7))
        assert response, "Failed to get resource info"
        assert '"status": 0' in response, "Get resource info failed."

        j = json.loads(response.normal_body)
        assert j['response']['resource'] and j['response']['resource']['id'] == 7
        revID = None
        for rev in j['response']['resource']['revisions']:
            assert rev['resourceID'] == 7, "Invalid revision information"
            revID = rev['id']

        assert revID
        type = j['response']['resource']['type']

        response = self.app.get(url(controller='resource', action='getInfo', id=7, type=type, revisionID=revID))
        assert response, "Failed to get resource info with type and revision"
        assert '"status": 0' in response, "Get resource info failed."

        j = json.loads(response.normal_body)
        assert len(j['response'][type]['revisions']) == 1, "Revision list has more than one revision"
        assert j['response'][type]['revisions'][0]['id'] == revID, "Incorrect revision returned!"

    def test_getInfoPerma(self):
        response = self.app.get(url(controller='resource', action='getInfo', id=238))
        assert response, "Failed to get resource info"
        assert '"status": 0' in response, "Get resource info failed."

        j = json.loads(response.normal_body)
        type = j['response']['resource']['type']
        handle = j['response']['resource']['handle']

        response = self.app.get(url(controller='resource', action='getPerma', stream='default', type=type, handle=handle))
        assert response, "Failed to get a response"
        assert '"status": 0' not in response, "Received success when expecting failure!"

        response = self.app.get(url(controller='resource', action='getPerma', stream='default', type=type, handle=handle, realm='user:Byron'))
        assert response, "Failed to get resource info using perma api"
        assert '"status": 0' in response, "Get perma resource info failed"

        j2 = json.loads(response.normal_body)
        id = j2['response']['resource']['id']
        assert id == 238, "Different resource returned!"

    def test_constructPerma(self):
        response = self.app.get(url(controller="resource", action="constructPerma", id=7))
        assert response, "Failed to construct perma url for resource"
        assert '"status": 0' in response, "Error constructing perma url" 

        j = json.loads(response.normal_body)
        assert j['response']['perma'], "Got empty perma url"
        assert 'thumb' not in j['response']['perma'], "Got url for wrong stream!"

        response = self.app.get(url(controller="resource", action="constructPerma", id=7, stream='thumb_170'))
        assert response, "Failed to construct perma url for resource"
        assert '"status": 0' in response, "Error constructing perma url" 

        j = json.loads(response.normal_body)
        assert j['response']['perma'], "Got empty perma url"
        assert 'thumb_170' in j['response']['perma'], "Got url for wrong stream!"

    def test_createAbuseReport(self):
        session = meta.Session()
        resource = api.getResourceByID(id=6)
        assert resource
        resourceID = resource.id
        resourceRevisionID = resource.revisions[0].id
        assert resourceID and resourceRevisionID

        parameters = {
                'resourceID': resourceID,
                'resourceRevisionID': resourceRevisionID,
                'reason': 'Copyrighted image'
        }

        response = self.app.post(url(controller='resource', action='createAbuseReport'), params=parameters, headers={'Cookie': self.getLoginCookie(104)})
        assert response
        assert '"status": 0' in response, "Failed to create abuse report"
        j = json.loads(response.normal_body)
        assert j['response']['id'], "Could not get report id"
        reportID = j['response']['id']
        assert j['response']['status'] == 'reported'

    def test_editAbuseReport(self):
        session = meta.Session()
        resource = api.getResourceByID(id=6)
        assert resource
        resourceID = resource.id
        resourceRevisionID = resource.revisions[0].id
        assert resourceID and resourceRevisionID

        response = self.app.get(url(controller='resource', action='getAbuseReportInfoForResourceRevision', resourceRevisionID=resourceRevisionID), params={'pageSize': 2, 'pageNum': 1})
        assert response
        assert '"status": 0' in response, "Failed to get abuse report info"
        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0
        assert j['response']['limit'] <= 2
        reportID = None
        for report in j['response']['reports']:
            for rev in report['resource']['revisions']:
                assert rev['id'] == resourceRevisionID
            reportID = report['id']

        assert reportID

        response = self.app.post(url(controller='resource', action='updateAbuseReport'), params={'id': reportID, 'status': 'flagged', 'remark': 'Removing'}, headers={'Cookie': self.getLoginCookie(1)})
        assert response and '"status": 0' in response.normal_body, "Failed to update abuse report"
        j = json.loads(response.normal_body)
        assert j['response']['id'] == reportID
        assert j['response']['status'] == 'flagged'

        response = self.app.get(url(controller='resource', action='getInfo', id=resourceID))
        assert response and '"isAbused":' in response

    def test_getAbuseReportInfo(self):
        session = meta.Session()
        reports = api.getAbuseReportsByStatus(status='flagged')
        assert reports and reports[0]
        reportID = reports[0].id

        response = self.app.get(url(controller='resource', action='getInfoAbuseReport', id=reportID))
        assert response and '"status": 0' in response, "Error getting abuse report info"
        j = json.loads(response.normal_body)
        assert j['response']['id'] == reportID
        assert j['response']['status'] == 'flagged'
        assert j['response']['reviewer']['id'] == 1
        assert j['response']['reporter']['id'] == 104

