from flx.tests import *
import json

class TestUserdeviceController(TestController):

    def test_registerDevice(self):
        response = self.app.get(url(controller='userDevice', action='registerDevice'), params={'platform':'android', 'appCode': "ck12app", "uuid": "dummy", "pushIdentifier": "dummy",'appCode':"ck12app"},headers={'Cookie': self.getLoginCookie(4)})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)

