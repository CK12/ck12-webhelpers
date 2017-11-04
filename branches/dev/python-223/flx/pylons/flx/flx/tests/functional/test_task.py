from flx.tests import *
import logging
import json

log = logging.getLogger(__name__)

class TestTaskController(TestController):

    def test_getTasksInfo(self):
        response = self.app.get(url(controller='task', action='getTasksInfo'), params={ 'filters': 'name,emailnotifiertask;status,success', 'sort': 'started,asc', 'pageNum': 1, 'pageSize': 5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'tasks' in j['response'].keys()

        response = self.app.get(url(controller='task', action='getTasksInfo'), params={ 'filters': 'name,emailnotifiertask', 'search': 'status,PENDING', 'sort': 'started,asc', 'pageNum': 1, 'pageSize': 5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'tasks' in j['response'].keys()

        response = self.app.get(url(controller='task', action='getTasksInfo'), params={ 'searchAll': 'success', 'sort': 'id,asc', 'pageNum': 1, 'pageSize': 5})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'tasks' in j['response'].keys()

        response = self.app.get(url(controller='task', action='getTasksInfo'), params={ 'searchAll': 'success'})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'tasks' in j['response'].keys()

        response = self.app.get(url(controller='task', action='getTasksInfo'), params={})
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['limit'] <= j['response']['total']
        assert 'tasks' in j['response'].keys()

