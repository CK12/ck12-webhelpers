from flx.tests import *
from flx.model import meta
from flx.model import api
import logging
import json
import base64

log = logging.getLogger(__name__)
eoID = None

class TestEmbeddedobjectController(TestController):

    def test_01create(self):
        global eoID
        parameters = {
                'code': base64.b64encode('<iframe width="425" height="349" src="http://www.youtube.com/v/Gn2pdkvdbGQ" frameborder="0" allowfullscreen></iframe>'),
                #'url': 'http://www.youtube.com/v/Gn2pdkvdbGQ',
                'authors': 'Nimish P',
                'license': 'CC by NC SA',
            }
        response = self.app.post(url(controller='embeddedObject', action='create'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, 'Error creating resource'
        j = json.loads(response.normal_body)
        assert j['response']['id'], 'Empty id on response'
        id = j['response']['id']
        eoID = id
        assert j['response']['type'] == 'youtube', 'Incorrect type'
        assert j['response']['resource'], "Missing associated resource"
        assert j['response']['resource']['license'] == 'CC by NC SA', "Missing license info"
        assert j['response']['resource']['authors'] == 'Nimish P', "Missing authors info"

        parameters = {
                'code': base64.b64encode('<iframe width="425" height="349" src="http://www.youtube.com/v/Gn2pdkvdbGQ" frameborder="0" allowfullscreen></iframe>'),
                'authors': 'Nimish P',
                'license': 'Proprietary',
                }
        response = self.app.post(url(controller='embeddedObject', action='create'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, 'Error creating resource by code'
        j = json.loads(response.normal_body)
        assert j['response']['id'], 'Empty id on response'
        assert id == j['response']['id'], 'A different object created for same resource'
        assert j['response']['type'] == 'youtube', 'Incorrect type'
        assert j['response']['resource'], "Missing associated resource"
        assert j['response']['resource']['license'] == 'Proprietary', "Missing license info or license info not changed for existing object."
        assert j['response']['resource']['authors'] == 'Nimish P', "Missing authors info or license info changed even if object not created."

    def test_getInfo(self):
        parameters = {
                'code': base64.b64encode('<iframe width="425" height="349" src="http://www.youtube.com/v/Gn2pdkvdbGQ" frameborder="0" allowfullscreen></iframe>')
                }
        response = self.app.post(url(controller='embeddedObject', action='getInfo'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, 'Error getting embeddedobject by code'
        j = json.loads(response.normal_body)
        assert j['response']['id'], 'Empty id on response'
        assert eoID == j['response']['id'], 'A different object returned for same code'
        assert j['response']['url'].split('?')[0] == 'http://www.youtube.com/v/Gn2pdkvdbGQ'
        id = j['response']['id']

        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=id))
        assert '"status": 0' in response, 'Error getting info for resource by id'
        j = json.loads(response.normal_body)
        assert j['response']['id'], 'Empty id on response'
        assert j['response']['id'] == id, 'A different embeddedobject returned'
        assert j['response']['url'].split('?')[0] == 'http://www.youtube.com/v/Gn2pdkvdbGQ'

    def test_eoblacklistByID(self):
        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Error getting info for resource by url'
        j = json.loads(response.normal_body)
        id = j['response']['id']

        parameters = {
                'id': id
                }
        response = self.app.post(url(controller='embeddedObject', action='addToBlacklist'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Error blacklisting embeddedObject"

        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=id))
        assert '"status": 0' not in response, 'Got blacklisted embeddedObject'

        ## Remove from blacklist
        parameters = {
                'id': id
                }
        response = self.app.post(url(controller='embeddedObject', action='removeFromBlacklist'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert response
        assert '"status": 0' in response, "Error removing embeddedObject from blacklist"

        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=id))
        assert '"status": 0' in response, 'Error getting embeddedObject after removing from blacklist'


    def test_eoblacklistByProviderID(self):
        session = meta.Session()
        provider = api.getProviderByDomain(domain='www.youtube.com')
        assert provider
        providerID = provider.id

        parameters = {
                'providerID': providerID
                }
        response = self.app.post(url(controller='embeddedObject', action='addToBlacklist'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Error blacklisting embeddedObject by provider"

        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' not in response, 'Got blacklisted embeddedObject'

        ## Remove from blacklist
        parameters = {
                'providerID': providerID
                }
        response = self.app.post(url(controller='embeddedObject', action='removeFromBlacklist'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert response
        assert '"status": 0' in response, "Error removing embeddedObject from blacklist"

        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Could not get embeddedObject after removing from blacklist'

    def test_eoResourceAssociationAdd(self):
        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Error getting info for resource by url'
        j = json.loads(response.normal_body)
        id = j['response']['id']

        parameters = {
                'embeddedObjectID': id,
                'resourceID': 7
                }
        response = self.app.post(url(controller='embeddedObject', action='createAssociation'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, 'Error associating embeddedObject to resource'

        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Error getting info for resource by url'
        j = json.loads(response.normal_body)
        assert j['response']['resource']['id'] == 7, 'Associating embeddedObject to resource failed'

    def test_eoResourceAssociationRemove(self):
        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Error getting info for resource by url'
        j = json.loads(response.normal_body)
        id = j['response']['id']

        parameters = {
                'embeddedObjectID': id,
                'resourceID': 7
                }
        response = self.app.post(url(controller='embeddedObject', action='createAssociation'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, 'Error associating embeddedObject to resource'

        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Error getting info for resource by url'
        j = json.loads(response.normal_body)
        assert j['response']['resource']['id'] == 7, 'Associating embeddedObject to resource failed'

    def test_eoRender(self):
        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Error getting info for resource by url'
        j = json.loads(response.normal_body)
        id = j['response']['id']

        response = self.app.get(url(controller='embeddedObject', action='renderObject', id=id))
        assert response, 'Could not render object'

    def test_getMulti(self):
        response = self.app.get(url(controller='embeddedObject', action='getInfo', url=eoID))
        assert '"status": 0' in response, 'Error getting info for resource by url'
        j = json.loads(response.normal_body)
        id = j['response']['id']

        response = self.app.get(url(controller='embeddedObject', action='getInfoMulti', ids='%d,' % id))
        assert '"status": 0' in response, "Error getting info for multiple objects"
        j = json.loads(response.normal_body)
        assert type(j['response']['embeddedObjects']).__name__ == 'list', "Did not get a list back"

    def test_createProvider(self):
        parameters = {
                'name': 'testprovider',
                'domain': '*.testprovider.com',
                'needsApi': False,
                'blacklisted': False,
                }
        response = self.app.post(url(controller='embeddedObject', action='createEmbeddedObjectProvider'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['id'], 'Could not find id for provider'
        assert j['response']['name'] == 'testprovider' and j['response']['domain'] == '*.testprovider.com'
        assert j['response']['needsApi'] == 0 and j['response']['blacklisted'] == 0
        testProviderID = j['response']['id']

        parameters = {
                'id': testProviderID,
                'name': 'testprovider_updated',
                'domain': '*.testprovider-updated.com',
                'needsApi': False,
                'blacklisted': True,
                }
        response = self.app.post(url(controller='embeddedObject', action='updateEmbeddedObjectProvider'), params=parameters, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['id'], 'Could not find id for provider'
        assert j['response']['id'] == testProviderID, 'Got a different id'
        assert j['response']['name'] == 'testprovider_updated' and j['response']['domain'] == '*.testprovider-updated.com'
        assert j['response']['needsApi'] == 0 and j['response']['blacklisted'] == 1

        api.deleteProvider(providerID=testProviderID)

    def test_getEmbeddedObjectProviders(self):
        response = self.app.get(url(controller='embeddedObject', action='getEmbeddedObjectProvidersInfo'), params={ 'filters': 'name,youtube;blacklisted,0', 'sort': 'name,asc', 'pageNum': 1, 'pageSize': 5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'providers' in j['response'].keys()

        response = self.app.get(url(controller='embeddedObject', action='getEmbeddedObjectProvidersInfo'), params={ 'filters': 'name,teachertube', 'search': 'domain,.com', 'sort': 'updated,asc', 'pageNum': 1, 'pageSize': 5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'providers' in j['response'].keys()

        response = self.app.get(url(controller='embeddedObject', action='getEmbeddedObjectProvidersInfo'), params={ 'searchAll': 'tube', 'sort': 'id,asc', 'pageNum': 1, 'pageSize': 5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'providers' in j['response'].keys()

        response = self.app.get(url(controller='embeddedObject', action='getEmbeddedObjectProvidersInfo'), params={ 'searchAll': 'tube'})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'providers' in j['response'].keys()

        response = self.app.get(url(controller='embeddedObject', action='getEmbeddedObjectProvidersInfo'), params={})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'providers' in j['response'].keys()

