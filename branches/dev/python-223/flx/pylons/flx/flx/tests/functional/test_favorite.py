from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os
import logging
import jsonlib
import time

log = logging.getLogger(__name__)

class TestFavoriteController(TestController):

   def test_favorite(self):
        rid = 1
        mid = 1
        response = self.app.post(
                        url(controller = 'favorite', action = 'create'),
                        params={
                            'revisionID': rid,
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed create favorite"
        assert 'ERROR:' not in response, "Error creating favorite"
        response = self.app.post(
                        url(controller = 'favorite', action = 'create'),
                        params={
                            'revisionID': rid,
                            'memberID': 1
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' not in response, "Unexpectedly creating favorite"
        response = self.app.delete(
                        url(controller = 'favorite',
                            action = 'delete',
                            revisionID = rid,
                            memberID = mid),
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        assert '"status": 0' in response, "Failed delete favorite"
        assert 'ERROR:' not in response, "Error deleting favorite"
        response = self.app.delete(
                        url(controller = 'favorite',
                            action = 'delete',
                            revisionID = 0,
                            memberID = mid),
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        assert '"status": 0' not in response, "Unexpectedly deleting favorite"
