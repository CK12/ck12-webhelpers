from flx.tests import *
from flx.lib import helpers as h
import urllib2
import urllib
import logging
import json
import time
from pylons import config

REFRESH_TOKEN_JSON_PATH = '/opt/2.0/flx/pylons/flx/flx/tests/data/refreshtoken.json'
TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'
CLIENT_ID = '824097203574-63jbk69l49co9clv3n90uie92f4nv4kk.apps.googleusercontent.com'
CLIENT_SECRET = 'Kajg1lMONa5BCBomMDHSz-6p'

log = logging.getLogger(__name__)

class TestGdtController(TestController):

    def __waitForTask(self, taskId):
        maxCount = 30
        cnt = 0
        while True:
            time.sleep(3)
            cnt += 1
            if cnt >= maxCount:
                assert False, "Exceed max wait of %d secs!" % maxCount
                break

            response = self.app.get(url(controller='task', action='getStatus', taskID = taskId), headers={'Cookie': self.getLoginCookie(1)})
            assert '"status": 0' in response, "Failed to check status"

            js = json.loads(response.normal_body)
            assert js['response']['status'], "Invalid task status"
            assert js['response']['status'] != 'FAILURE', "Task failed."

            if js['response']['status'] == "SUCCESS":
                return js['response']['userdata']
        return None

    def test_importGdt(self):

        response = self.app.post(url(controller='gdt', action='gdtImportArtifact'), 
                params = {
                    'command': 'gdocImport', 
                    'title': 'Sample Light Lesson',
                    'artifactType': 'lesson'
                },
                headers={'Cookie': self.getLoginCookie(1)})

        assert '"status": 0' not in response, "Expected failure; got success"

        test_token = self._getAccessToken()
        response = self.app.post(url(controller='gdt', action='gdtImportArtifact'), 
                params = {
                    'command': 'gdocImport', 
                    'docID': '1PWTGuS53F-V-71GGFjsrvuPgcjeQOCHmzWi7OZcuPk8',
                    'title': 'GDT Nature of Light - Lesson',
                    'artifactType': 'lesson',
                    'googleAuthTokenFromTest': test_token
                },
                headers={'Cookie': self.getLoginCookie(1)})

        assert '"status": 0' in response, "Failed importing Google Document"
        j = json.loads(response.normal_body)
        assert j['response']['taskID']
        userdata = self.__waitForTask(j['response']['taskID'])
        j2 = json.loads(userdata)
        assert j2['id'], "Could not find the artifactID in userdata"
        assert j2['artifactType'] == 'lesson', "Incorrect artifact type; expected lesson"

        response = self.app.get(url(controller='artifact', action='getInfo', id=j2['id'], type=j2['artifactType']))
        assert '"status": 0' in response, "Could not get the new artifact by id: %s" % j2['id']
        j = json.loads(response.normal_body)
        assert j['response']['lesson']['id'] == int(j2['id']), "Got wrong artifact"

        response = self.app.get(url(controller='artifact', action='deleteArtifact', id=j2['id'], type=j2['artifactType']), headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Could not delete the new artifact by id: %s" % j2['id']

    def test_gdtImportForm(self):
        response = self.app.get(url(controller='gdt', action='gdtImportForm'), headers={ 'Cookie': self.getLoginCookie(1)})
        assert response and '<form' in response, "Could not get GDT import form"

    def _getAccessToken(self):
        """
        Get the access token from refresh token.
        """
        # Get the refresh token json.
        with open(REFRESH_TOKEN_JSON_PATH, 'r') as f:
            data = f.read()
        jsonData = json.loads(data)
        params = dict()
        params['client_id'] = CLIENT_ID
        params['client_secret'] = CLIENT_SECRET
        params['refresh_token'] = jsonData['refresh_token']
        params['grant_type'] = 'refresh_token'

        # Get the access token from refresh token.
        params = urllib.urlencode(params)
        req = urllib2.Request(TOKEN_URL)
        f = urllib2.urlopen(req, params)
        tokenData = f.read()
        tokenJson = json.loads(tokenData)
        access_token = tokenJson['access_token']

        return access_token
