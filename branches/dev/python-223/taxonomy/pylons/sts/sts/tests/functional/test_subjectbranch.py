import json
from urllib import quote

from sts.tests import *
from sts.model import api
import logging
log = logging.getLogger(__name__)

ADMIN_USER = {
         'id': 1,
         'login': 'testAdmin',
         'email': None,
         'name': 'Test Admin',
         'authType': 'ck-12',
         'sessionID': None,
         'timeout': 0
       }

class TestSubjectBranchController(TestController):

    def test_getInfoSubject(self):
        response = self.app.get(url(controller='subjectbranch', action='getSubjectInfo', subjectID='MAT'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'MAT'

        response = self.app.get(url(controller='subjectbranch', action='getSubjectInfo', subjectID='sci'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'SCI'

    def test_getInfoBranch(self):
        response = self.app.get(url(controller='subjectbranch', action='getBranchInfo', subjectID='MAT', branchID='GEO'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'GEO'

        response = self.app.get(url(controller='subjectbranch', action='getBranchInfo', subjectID='mat', branchID='alg'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'ALG'

    def test_getSubjects(self):
        response = self.app.get(url(controller='subjectbranch', action='getSubjects'), params={'pageNum': 1, 'pageSize': 2})
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0 and j['response']['limit'] <= 2
        for subject in j['response']['subjects']:
            assert subject['shortname']

    def test_getBranches(self):
        response = self.app.get(url(controller='subjectbranch', action='getBranches', subjectID='MAT'), params={'pageNum': 1, 'pageSize': 2})
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['total'] > 0 and j['response']['limit'] <= 2
        for branch in j['response']['branches']:
            assert branch['subject']['shortname'] == 'MAT'

        ## Negative
        response = self.app.get(url(controller='subjectbranch', action='getBranches', subjectID='XYZ'), params={'pageNum': 1, 'pageSize': 2})
        assert response
        assert '"status": 0' not in response

    def test_createSubject(self):
        parameters = {
                'name': 'TestSubject',
                'description': 'Test subject',
                'shortname': 'TSU',
            }
        response = self.app.post(url(controller='subjectbranch', action='createSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'TSU'

        ## negative subject already exists.
        parameters = {
                'name': 'TestSubject2',
                'description': 'Test subject',
                'shortname': 'MAT',
            }
        response = self.app.post(url(controller='subjectbranch', action='createSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        ## negative shortname is more than 3 characters.
        parameters = {
                'name': 'TestSubject3',
                'description': 'Test subject',
                'shortname': 'MATT',
            }
        response = self.app.post(url(controller='subjectbranch', action='createSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        ## negative subject name is empty.
        parameters = {
                'name': '',
                'description': 'Test subject',
                'shortname': 'MAT',
            }
        response = self.app.post(url(controller='subjectbranch', action='createSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        ## negative subject shortname is empty.
        parameters = {
                'name': 'TestSubject2',
                'description': 'Test subject',
                'shortname': '',
            }
        response = self.app.post(url(controller='subjectbranch', action='createSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        api.deleteSubject(id='TSU', cookies=self.getLoginAppCookieObject())

    def test_createBranch(self):
        parameters = {
                'name': 'TestBranch',
                'description': 'Test branch',
                'shortname': 'tbr',
                'subjectID': 'mat',
            }
        response = self.app.post(url(controller='subjectbranch', action='createBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'TBR'

        ## negative shortname is more than 3 characters.
        parameters = {
                'name': 'TestBranch2',
                'description': 'Test branch',
                'shortname': 'tbr2',
            }
        response = self.app.post(url(controller='subjectbranch', action='createBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        ## negative shortname already exists.
        parameters = {
                'name': 'TestBranch3',
                'description': 'Test branch',
                'shortname': 'tbr',
            }
        response = self.app.post(url(controller='subjectbranch', action='createBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        ## negative name is empty.
        parameters = {
                'name': '',
                'description': 'Test branch',
                'shortname': 'tbr2',
            }
        response = self.app.post(url(controller='subjectbranch', action='createBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        ## negative shortname is empty.
        parameters = {
                'name': 'TestBranch4',
                'description': 'Test branch',
                'shortname': '',
            }
        response = self.app.post(url(controller='subjectbranch', action='createBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        api.deleteBranch(id='TBR', cookies=self.getLoginAppCookieObject())

        #negative branch name should not be same as any other subject name.
        parameters = {
                'name': 'QA Test',
                'description': 'QA Test Subject',
                'shortname': 'QAT',
            }
        response = self.app.post(url(controller='subjectbranch', action='createSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'QAT'

        parameters = {
                'name': 'QA Test',
                'description': 'QA Test Branch',
                'shortname': 'QAT',
            }
        response = self.app.post(url(controller='subjectbranch', action='createBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' not in response

        api.deleteSubject(id='QAT', cookies=self.getLoginAppCookieObject())

    def test_deleteSubject(self):
        parameters = {
                'name': 'TestSubject',
                'description': 'Test subject',
                'shortname': 'TSU',
            }
        response = self.app.post(url(controller='subjectbranch', action='createSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'TSU'

        response = self.app.post(url(controller='subjectbranch', action='deleteSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params={'id': j['response']['shortname']})
        assert '"status": 0' in response

        response = self.app.post(url(controller='subjectbranch', action='deleteSubject'), headers={'Cookie': self.getCookiesHeaderVal()}, params={'id': j['response']['shortname']})
        assert '"status": 0' not in response    
        
    def test_deleteBranch(self):
        parameters = {
                'name': 'TestBranch',
                'description': 'Test branch',
                'shortname': 'tbr',
                'subjectID': 'mat',
            }
        response = self.app.post(url(controller='subjectbranch', action='createBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params=parameters)
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'TBR'

        response = self.app.post(url(controller='subjectbranch', action='deleteBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params={'id': j['response']['shortname']})
        assert '"status": 0' in response
        
        response = self.app.post(url(controller='subjectbranch', action='deleteBranch'), headers={'Cookie': self.getCookiesHeaderVal()}, params={'id': j['response']['shortname']})
        assert '"status": 0' not in response
