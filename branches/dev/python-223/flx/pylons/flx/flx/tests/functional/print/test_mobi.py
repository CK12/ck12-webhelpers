from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os
import logging
import jsonlib
import time

log = logging.getLogger(__name__)

class TestMobiController(TestController):

   def test_mobi(self):
        sleep_time = 15
        a = api.getArtifactByEncodedID(encodedID='CK.SCI.ENG.SE.2.Chemistry', typeName='book')
        assert a, "Could not find book by EID: CK.SCI.ENG.SE.2.Chemistry"
        response = self.app.get(url(controller = 'mobi', action='render',id=a.id,
                                    revisionID=None, nocache='True'),headers={'Cookie': self.getLoginCookie(1)})
        log.info(response)
        assert '"task_id"' in response, "Starting celery task failed"
        result = jsonlib.read(str(response.body))
        response = result['response']
        task_id = response["task_id"]
        log.info('>>> Task Id :- '+task_id)

        maxAttempts = 100
        attempt = 0
        while 1 :
             response = self.app.get(url(controller='task',
                                         action='getStatus',taskID = task_id ),headers={'Cookie': self.getLoginCookie(1)})
             log.info(">>>> Checking mobi book status...")
             result = jsonlib.read(str(response.body))
             response = result['response']
             if response['status'] == 'SUCCESS':
                 log.info('>>>> mobi creation succeeded...')
                 log.info(response)
                 break
             if response['status'] == 'FAILURE':
                 log.info('>>>> mobi creation failed...')
                 log.info(response)
                 break
             log.info(">>>> Will check after "+str(sleep_time)+" seconds...")
             time.sleep(sleep_time)
             attempt += 1
             if attempt >= maxAttempts:
                 assert False, "Exceeded max retires of %d" % maxAttempts
                 break

        assert response['status'] == 'SUCCESS', 'mobi creation failed...'
