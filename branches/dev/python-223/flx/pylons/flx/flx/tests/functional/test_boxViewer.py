import json
from flx.tests import *

class TestBoxviewerController(TestController):

    def test_getSession(self):
        userID = 1
        params = {
            'document_id': 'd83185c6849845c79f4d5ddf6ab53838',
#             'document_id': '05f0c78459eb41e08a6b9be5bc9e3d70'
        }
        response = self.app.post(url(controller='boxViewer', action='getSession'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        print ">>> test_getBoxViewerSession: %s" % str(response)
        assert '"status": 0' in response, "Failed to get session from Boxviewer."
        js = json.loads(response.normal_body)
        print js['response']
        
    def test_getBoxDocumentList(self):
        userID = 1
        params = {
            'limit': 20,
            'created_before': '2014-11-05T10:56:51.301',
            'created_after': '2014-05-05T10:56:51.301',
        }
        response = self.app.post(url(controller='boxViewer', action='getBoxDocumentList'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        print ">>> test_getBoxDocumentList: %s" % str(response)
        assert '"status": 0' in response, "Failed to get Document List from Boxviewer."
        js = json.loads(response.normal_body)
        print js['response']
