from sts.tests import *
from sts.model import api
import re
import os
import logging
import json
import time
from urllib import quote

log = logging.getLogger(__name__)

class TestArtifactExtensionTypeController(TestController):

    def test_getInfo(self):
        response = self.app.get(url(controller='artifactextensiontype', action='getInfo', id='FB'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'FB'

        response = self.app.get(url(controller='artifactextensiontype', action='getInfo', id='c'))
        assert response
        assert '"status": 0' in response

        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'C'

    def test_getList(self):
        pageNum = 1
        while True:
            response = self.app.get(url(controller='artifactextensiontype', action='listExtensionTypes', status='published'), params={'pageSize':2, 'pageNum':pageNum})
            assert response
            assert '"status": 0' in response

            j = json.loads(response.normal_body)
            assert j['response']['limit'] <= 2
            assert j['response']['offset'] == (pageNum-1)*2

            for extType in j['response']['artifactExtensionTypes']:
                assert extType['status'] == 'published'
            
            if j['response']['limit'] == 0:
                break
            pageNum += 1

    def test_export(self):
        response = self.app.get(url(controller='artifactextensiontype', action='exportArtifactExtensionTypeData'), headers={'Cookie': self.getLoginCookie(ADMIN_USER)})
        print response.headers
        assert response and response.headers.has_key('Content-Disposition')
        assert response.headers.get('Content-Type') == 'text/csv'
        assert response.headers.get('Content-Length') > '100'

    def test_create(self):
        parameters = {
                'name': 'Test Simulation Type',
                'description': 'Simulation using flash or HTML 5',
                'shortname': 'ts'
            }
        response = self.app.post(url(controller='artifactextensiontype', action='create'), headers={'Cookie': self.getLoginCookie(ADMIN_USER)}, params=parameters)
        print response
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'TS'

        parameters = {
                'name': 'Test Simulation Type 2',
                'description': 'Simulation using flash or HTML 5',
                'shortname': 'ts'
            }
        response = self.app.post(url(controller='artifactextensiontype', action='create'), headers={'Cookie': self.getLoginCookie(ADMIN_USER)}, params=parameters)
        print response
        assert '"status": 0' not in response

        api.deleteArtifactExtensionType(id='TS')

        response = self.app.get(url(controller='artifactextensiontype', action='getInfo', id='TS'))
        print response
        assert '"status": 0' not in response

    def test_delete(self):
        parameters = {
                'name': 'Test Simulation Type',
                'description': 'Simulation using flash or HTML 5',
                'shortname': 'ts'
            }
        response = self.app.post(url(controller='artifactextensiontype', action='create'), headers={'Cookie': self.getLoginCookie(ADMIN_USER)}, params=parameters)
        print response
        assert '"status": 0' in response
        j = json.loads(response.normal_body)
        assert j['response']['shortname'] == 'TS'

        response = self.app.post(url(controller='artifactextensiontype', action='delete'), params={'id': j['response']['shortname']}, headers={'Cookie': self.getLoginCookie(ADMIN_USER)})
        print response
        assert '"status": 0' in response

        response = self.app.post(url(controller='artifactextensiontype', action='delete'), params={'id': j['response']['shortname']}, headers={'Cookie': self.getLoginCookie(ADMIN_USER)})
        print response
        assert '"status": 0' not in response

