import json
from flx.tests import *

__controller__ = 'TestSpecialSearchController'

specialSearchEntryID = None

class TestSpecialSearchController(TestController):


    def test_10createSpecialSearchEntry(self):
        global specialSearchEntryID
        userID = 1
        params = {
            'term': 'El Paso EPISD',
            'entry': json.dumps({'url': 'http://www.ck12.org/blog/el-paso-isd-partners-with-ck-12-foundation-to-adopt-digital-flexbooks-throughout-district/' })
        }
        response = self.app.post(url(controller='specialSearch', action='createSpecialSearchEntry'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        print ">>> test_createSpecialSearchEntry: %s" % str(response)
        assert '"status": 0' in response, "Failed to create SpecialSearchEntry."
        js = json.loads(response.normal_body)
        specialSearchEntryID = js['response']['_id']
        print specialSearchEntryID
         
    def test_40updateSpecialSearchEntry(self):
        global specialSearchEntryID
        userID = 1
        
        params = {
                  'term': 'El Paso EPISD Texas',
        }
        response = self.app.post(url(controller='specialSearch', action='updateSpecialSearchEntry'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        assert '"status": 0' not in response, "Expected error not found."

        params['id'] = specialSearchEntryID
        print params
        response = self.app.post(url(controller='specialSearch', action='updateSpecialSearchEntry'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        assert '"status": 0' in response, "Failed to update SpecialSearchEntry."
        jr = json.loads(response.normal_body)
        assert jr['response']['term'] == params['term'], "Updated term does not match the arguments"

        params['entry'] = json.dumps({'url': 'http://www.ck12.org/blog/el-paso-isd-partners-with-ck-12-foundation-to-adopt-digital-flexbooks-throughout-district/', 'title': 'CK-12 Partnership with EPISD'})
        response = self.app.post(url(controller='specialSearch', action='updateSpecialSearchEntry'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        assert '"status": 0' in response, "Failed to update SpecialSearchEntry."
        print response
        jr = json.loads(response.normal_body)
        assert jr['response']['entry']['title'] == 'CK-12 Partnership with EPISD', "Updated entry does not match the arguments"

    def test_15matchSpecialSearchEntry(self):
        response = self.app.get(url(controller='specialSearch', action='matchSpecialSearchEntries', term='Paso'))
        assert '"status": 0' in response, "Failed to match SpecialSearchEntry."
        js = json.loads(response.normal_body)
        assert js['response']['entries'][0]['term'] == 'El Paso EPISD', "Did not find expected SpecialSearchEntry"

    def test_20getSpecialSearchEntry(self):
        response = self.app.get(url(controller='specialSearch', action='getSpecialSearchEntry', term='El Paso EPISD'))
        assert '"status": 0' in response, "Failed to get SpecialSearchEntry."
        js = json.loads(response.normal_body)
        assert js['response']['term'] == 'El Paso EPISD', "Did not find expected SpecialSearchEntry"

    def test_30getSpecialSearchEntries(self):
        response = self.app.get(url(controller='specialSearch', action='getSpecialSearchEntries'), params={'pageNum': 1, 'pageSize': 1})
        assert '"status": 0' in response, "Failed to get SpecialSearchEntries."
        js = json.loads(response.normal_body)
        assert js['response']['entries'][0]['term'] == 'El Paso EPISD', "Did not find expected SpecialSearchEntry"

        response = self.app.get(url(controller='specialSearch', action='getSpecialSearchEntries'), params={'pageNum': 1, 'pageSize': 1, 'termLike': 'paso'})
        assert '"status": 0' in response, "Failed to get SpecialSearchEntries."
        js = json.loads(response.normal_body)
        assert js['response']['entries'][0]['term'] == 'El Paso EPISD', "Did not find expected SpecialSearchEntry"

    def test_50deleteSpecialSearchEntry(self):
        global specialSearchEntryID
        userID = 1
        
        params = { }
        response = self.app.post(url(controller='specialSearch', action='deleteSpecialSearchEntry'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        assert '"status": 0' not in response, "Expected error not found."

        params['term'] = 'El Paso EPISD Texas'
        response = self.app.post(url(controller='specialSearch', action='deleteSpecialSearchEntry'), params=params, headers={'Cookie': self.getLoginCookie(userID)})
        assert '"status": 0' in response, "Failed to delete SpecialSearchEntry."

        response = self.app.get(url(controller='specialSearch', action='getSpecialSearchEntries'), params={'pageNum': 1, 'pageSize': 1})
        assert '"status": 0' in response, "Failed to get SpecialSearchEntries."
        js = json.loads(response.normal_body)
        assert js['response']['total'] == 0, "Deleted entry is still showing up"

