from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os
import logging
import jsonlib
import time

log = logging.getLogger(__name__)

class TestFeaturedController(TestController):

   def test_featured(self):
        aid = 1
        mid = 1
        #
        #  Creation test.
        #
        response = self.app.post(
                        url(controller = 'featured', action = 'create'),
                        params={
                            'id': aid,
                            'order': 1,
                            'comments': 'Testing',
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed create featured"
        assert 'ERROR:' not in response, "Error creating featured"
        response = self.app.post(
                        url(controller = 'featured', action = 'create'),
                        params={
                            'id': aid,
                            'order': 1,
                            'comments': 'Testing',
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpectedly creating featured"
        response = self.app.post(
                        url(controller = 'featured', action = 'create'),
                        params={
                            'id': aid,
                            'order': 1,
                            'comments': 'Testing',
                        },
                        headers={'Cookie': self.getLoginCookie(2)}
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpectedly creating featured"
        #
        #  Get test.
        #
        response = self.app.post(
                        url(controller = 'featured', action = 'get'),
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed get featured"
        assert 'ERROR:' not in response, "Error getting featured"
        #
        #  Update test.
        #
        response = self.app.post(
                        url(controller = 'featured', action = 'update', id=aid),
                        params={
                            'order': 2,
                            'comments': 'Testing 2',
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed update featured"
        assert 'ERROR:' not in response, "Error updating featured"
        #
        #  Deletion test.
        #
        response = self.app.delete(
                        url(controller = 'featured',
                            action = 'delete',
                            id = aid),
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed delete featured"
        assert 'ERROR:' not in response, "Error deleting featured"
        response = self.app.delete(
                        url(controller = 'featured',
                            action = 'delete',
                            id = 0),
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpectedly deleting featured"
        response = self.app.delete(
                        url(controller = 'featured',
                            action = 'delete',
                            id = 0),
                        headers={'Cookie': self.getLoginCookie(2)}
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpectedly deleting featured"
