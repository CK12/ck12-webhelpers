from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os
import logging
import jsonlib
import time

log = logging.getLogger(__name__)

class TestPdfController(TestController):

   def test_pdf(self):
        sleep_time = 16 # Begining sleep time
        a = api.getArtifactByEncodedID(encodedID='CK.SCI.ENG.SE.2.Chemistry', typeName='book')
        assert a, "Could not find book by EID: CK.SCI.ENG.SE.2.Chemistry"
        response = self.app.get(url(controller = 'pdf', action = 'render',id=a.id,
                                    revisionID=None, nocache=True,
                                    template='onecolumn'),headers={'Cookie': self.getLoginCookie(1)})
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
             log.info(">>>> Checking pdf book status...")
             result = jsonlib.read(str(response.body))
             response = result['response']
             if response['status'] == 'SUCCESS':
                 log.info('>>>> Pdf creation succeeded...')
                 log.info(response)
                 break
             if response['status'] == 'FAILURE':
                 log.info('>>>> Pdf creation failed...')
                 log.info(response)
                 break
             if sleep_time > 3:
                sleep_time = sleep_time - 1
             log.info(">>>> Will check after "+str(sleep_time)+" seconds...")
             time.sleep(sleep_time)
             attempt += 1
             if attempt >= maxAttempts:
                 assert False, "Exceeded max retires of %d" % maxAttempts
                 break

        assert response['status'] == 'SUCCESS', 'Pdf creation failed...'
