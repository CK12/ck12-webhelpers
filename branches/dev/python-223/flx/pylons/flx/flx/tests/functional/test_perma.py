from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os
import logging
import json
import time

log = logging.getLogger(__name__)

class TestPermaController(TestController):

    def test_perma(self):
        #
        #  Construct test.
        #
        response = self.app.get(
                        url(controller = 'perma', action = 'construct', id=2),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed construct perma"
        assert 'ERROR:' not in response, "Error constructing perma"

        response = self.app.get(
                        url(controller = 'perma', action = 'construct', id=202),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed construct perma"
        assert 'ERROR:' not in response, "Error constructing perma"

        response = self.app.get(
                        url(controller = 'perma', action = 'construct', id=215),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed construct perma"
        assert 'ERROR:' not in response, "Error constructing perma"

        response = self.app.get(
                        url(controller = 'perma', action = 'construct', id=20000),
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpected OK in constructing perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='chapter',
                            handle='Climate-::of::-CK-12-Earth-Science',
                            realm='user:admin'),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed in getting from perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='chapter',
                            handle='Ions-and-the-Compounds-They-Form-::of::-CK-12-Chemistry'),
                        params = { 'extension': 'version:1' },
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed in getting from perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='chapter',
                            handle='Climate-::of::-CK-12-Earth-Science',
                            realm='user:admin'),
                        params = {
                            'extension': 'version:1, withMathJax:True',
                        },
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed in getting from perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='chapter',
                            handle='Climate-::of::-CK-12-Earth-Science',
                            realm='user:not-there'),
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpected OK in getting from perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='chapter',
                            handle='Climate-::of::-CK-12-Earth-Science',
                            realm='user:admin'),
                        params = {
                            'extension': 'version:2',
                        },
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpected OK in getting from perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='concept',
                            handle='Climate-::of::-CK-12-Earth-Science',
                            realm='user:admin'),
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpected OK in getting from perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='artifact',
                            handle='Climate',
                            realm='user:admin'),
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpected OK in getting from perma"

        response = self.app.post(
                        url(controller = 'perma',
                            action = 'get',
                            type='chapter',
                            handle='Climate-::of::-CK-12-Earth-Science',
                            realm='key:admin'),
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpected OK in getting from perma"

    def test_getParent(self):
        response = self.app.post(
                        url(controller = 'perma',
                            action = 'getParent',
                            type='chapter',
                            handle='Climate-::of::-CK-12-Earth-Science',
                            realm='user:admin'),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed perma get parent"
        assert 'ERROR:' not in response, "Error constructing perma"    
        
    def test_getDescendant(self):
        response = self.app.get(
                        url(controller = 'perma',
                            action = 'getDescendant',
                            rtype='detail',
                            type='book',
                            handle='Geometry',
                            realm='user:admin',
                            section='2.0',
                            extension='version:1'),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed perma get descendant"
        assert 'ERROR:' not in response, "Error getting descendant"

        response = json.loads(response.normal_body)['response']
        print response['artifact']['post']
        assert response['artifact']['post']
        post = response['artifact']['post']
        #assert post['parent']['3.0']['handle'] == 'Parallel-and-Perpendicular-Lines-::of::-Geometry'
        #assert post['section']['3.0']['handle'] == 'Parallel-and-Perpendicular-Lines-::of::-Geometry'
        assert post['parent'] == None
        assert post['section'][''] == None

        assert response['artifact']['pre']
        pre = response['artifact']['pre']
        #assert pre['parent']['1.0']['handle'] == 'Basics-of-Geometry-::of::-Geometry'
        #assert pre['section']['1.0']['handle'] == 'Basics-of-Geometry-::of::-Geometry'
        assert pre['parent'] == None
        assert pre['section'][''] == None

        ## Try the first section
        response = self.app.get(
                        url(controller = 'perma',
                            action = 'getDescendant',
                            rtype='detail',
                            type='book',
                            handle='Geometry',
                            realm='user:admin',
                            section='1.0',
                            extension='version:1'),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed perma get descendant"
        assert 'ERROR:' not in response, "Error getting descendant"

        response = json.loads(response.normal_body)['response']
        assert response['artifact']['post']['section'][''] == None
        assert response['artifact']['pre']['section'][''] == None


        ## Last section
        response = self.app.get(
                        url(controller = 'perma',
                            action = 'getDescendant',
                            rtype='detail',
                            type='book',
                            handle='Geometry',
                            realm='user:admin',
                            section='12.0',
                            extension='version:1'),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed perma get descendant"
        assert 'ERROR:' not in response, "Error getting descendant"

        response = json.loads(response.normal_body)['response']

        assert response['artifact']['post']['section'][''] == None
        assert response['artifact']['pre']['section'][''] == None

        ## No section
        response = self.app.get(
                        url(controller = 'perma',
                            action = 'getDescendant',
                            rtype='detail',
                            type='book',
                            handle='Geometry',
                            realm='user:admin',
                            extension='version:1'),
                    )
        assert '"status": 0' not in response, "Unexpected success perma get descendant"

        ## Invalid section
        response = self.app.get(
                        url(controller = 'perma',
                            action = 'getDescendant',
                            rtype='detail',
                            type='book',
                            handle='Geometry',
                            realm='user:admin',
                            section='50.0',
                            extension='version:1'),
                    )
        assert '"status": 0' not in response, "Unexpected success perma get descendant"

    def test_getExtendedArtifacts(self):
        books = api.getArtifacts(typeName='book', pageNum=1, pageSize=1)
        assert books
        handle = books[0].handle
        realm = 'user:%s' % books[0].creator.login

        response = self.app.get(url(controller='perma', action='getExtendedArtifacts', type='book', handle=handle, realm=realm, artifactTypes='artifact'))
        assert '"status": 0' in response, "Error getting extended artifacts info from artifact id"

        response = self.app.get(url(controller='perma', action='getExtendedArtifacts', type='book', handle=handle, realm=realm, artifactTypes='labkit,workbook'))
        assert '"status": 0' in response, "Error getting extended artifacts info from artifact id"

        response = self.app.get(url(controller='perma', action='getExtendedArtifacts', type='book', handle='%s-changed' % handle, realm=realm, artifactTypes='labkit,workbook'))
        assert '"status": 0' not in response, "Unexpected success getting extended artifacts info from artifact id"

