import json
from flx.tests import *

class TestRweController(TestController):

    def test_createRWE(self):
        userID = 1
        params = {
            'title': 'Test Mathematics-ALG',
            'content': '<p>This is a test only.</p>',
            'imageUrl': 'notexist.html',
            'level': 'advanced',
            'ownerID': 3,
            'simID': 1234,
            'eids': 'MAT.ARI.100,MAT.ARI.110',
        }
        response = self.app.post(url(controller='rwe', action='createRWE'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        print ">>> test_createRWE: %s" % str(response)
        assert '"status": 0' in response, "Failed to create RWE."
        js = json.loads(response.normal_body)
        print js['response']
         
    def test_updateRWE(self):
        userID = 1
        
        params = {
                  'simID': 1234,
                  'eids': 'MAT.ARI.100,MAT.ARI.110',
                  'ownedBy':'community'
        }
        response = self.app.post(url(controller='rwe', action='getRWE'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        print ">>> test_getRWE: %s" % str(response)
        assert '"status": 0' in response, "Failed to get RWE."
        js = json.loads(response.normal_body)
        print js['response']
        
        RWEs = js['response']['RWEs']
        assert RWEs is not None, "No RWEs returned"
        
        if RWEs:
            params = {
                      'id': RWEs[0]['_id'],
                      'title': 'Test Mathematics-ALG',
                      'content': '<p>This is a update test only.</p>',
                      'imageUrl': 'notexist.html',
                      'level': 'advanced',
                      'ownerID': 3,
                      'simID': 1234,
                      'eids': 'MAT.ARI.100,MAT.ARI.110',
            }
            response = self.app.post(url(controller='rwe', action='updateRWE'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
            print ">>> test_updateRWE: %s" % str(response)
            assert '"status": 0' in response, "Failed to update RWE."
            js = json.loads(response.normal_body)
            print js['response']
         
    def test_getRWE(self):
        userID = 1
        params = {
                  'simID': 1234,
                  'eids': 'MAT.ARI.100,MAT.ARI.110',
                  'ownedBy':'community'
        }
        response = self.app.post(url(controller='rwe', action='getRWE'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        print ">>> test_getRWE: %s" % str(response)
        assert '"status": 0' in response, "Failed to get RWE."
        js = json.loads(response.normal_body)
        print js['response']
