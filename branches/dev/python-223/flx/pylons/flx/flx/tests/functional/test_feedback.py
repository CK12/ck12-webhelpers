from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os
import logging
import jsonlib
import time

log = logging.getLogger(__name__)

class TestFeedbackController(TestController):

   def _test_feedback(self):
        rid = 1
        mid = 1
        response = self.app.post(
                        url(controller = 'feedback', action = 'create'),
                        params={
                            'artifactID': rid,
                            'rating': '5',
                            'comments': 'Excellent',
                        },
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        log.info(response)
        assert '"status": 0' in response, "Failed create feedback"
        assert 'ERROR:' not in response, "Error creating feedback"
        response = self.app.delete(
                        url(controller = 'feedback',
                            action = 'delete',
                            artifactID = rid,
                            memid = mid),
                        headers={'Cookie': self.getLoginCookie(mid)}
                    )
        assert '"status": 0' in response, "Failed delete feedback"
        assert 'ERROR:' not in response, "Error deleting feedback"
