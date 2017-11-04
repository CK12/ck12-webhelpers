from flx.tests import *
from flx.model import meta
from flx.model import api
from routes import url_for
import re
import os
import logging
import json
import time
import random

log = logging.getLogger(__name__)

class TestXdtController(TestController):

    def __waitForTask(self, taskId):
        maxCount = 30
        cnt = 0
        while True:
            time.sleep(1)
            cnt += 1
            if cnt >= maxCount:
                assert False, "Exceed max wait of %d secs!" % maxCount
                break

            response = self.app.get(url(controller='task', action='getStatus', taskID = taskId), headers={'Cookie': self.getLoginCookie(1)})
            assert '"status": 0' in response, "Failed to check status"

            js = json.loads(response.normal_body)
            assert js['response']['status'], "Invalid task status"
            assert js['response']['status'] != 'FAILURE', "Task failed."

            if js['response']['status'] == "SUCCESS":
                break

    def __downloadFile(self, file, format=None):
        params = '/%s' % file
        if format:
            params += '/%s' % format

        response = self.app.get(url('/flx/download/xdt') + params, headers={'Cookie': self.getLoginCookie(1)})
        assert response
        #if not file.endswith('.docx'):
        #    print response

    def test_import(self):
        if not os.environ.has_key("RUN_XDT") or not os.environ["RUN_XDT"]:
            print "RUN_XDT not set. Skipping ..."
            return
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'test.docx'), 'rb')
        contents = file.read()
        file.close()
        files = [('fromFile', 'test.docx', contents)]

        response = self.app.post(url(controller='xdt', action='xdtImport'), params = { 'command': 'docx2xhtml' }, upload_files=files, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Failed to schedule import task"

        js = json.loads(response.normal_body)
        output = js['response']['output']
        taskId = js['response']['task_id']

        print "File: %s, Task: %s" % (output, taskId)

        assert output, "Invalid output file name"
        assert taskId, "Invalid task id"

        self.__waitForTask(taskId)

        self.__downloadFile(output)
        self.__downloadFile(output, 'xhtml')

    def test_export(self):
        if not os.environ.has_key("RUN_XDT") or not os.environ["RUN_XDT"]:
            print "RUN_XDT not set. Skipping ..."
            return
        file = open(os.path.join(os.path.dirname(__file__), "..", 'data', 'concept.xhtml'), 'rb')
        contents = file.read()
        file.close()
        files = [('fromFile', 'concept.xhtml', contents)]

        response = self.app.post(url(controller='xdt', action='xdtExport'), upload_files=files, params = { 'command': 'xhtml2docx'}, headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Failed to schedule export task"

        js = json.loads(response.normal_body)
        output = js['response']['output']
        taskId = js['response']['task_id']

        print "File: %s, Task: %s" % (output, taskId)

        assert output, "Invalid output file name"
        assert taskId, "Invalid task id"

        self.__waitForTask(taskId)
        #time.sleep(2)
        self.__downloadFile(output)

    def test_exportArtifact(self):
        if not os.environ.has_key("RUN_XDT") or not os.environ["RUN_XDT"]:
            print "RUN_XDT not set. Skipping ..."
            return
        response = self.app.get(url('/flx/export/xdt/xhtml2docx/') + '225', headers={'Cookie': self.getLoginCookie(1)})
        assert '"status": 0' in response, "Failed to schedule export task"

        js = json.loads(response.normal_body)
        output = js['response']['output']
        taskId = js['response']['task_id']

        print "File: %s, Task: %s" % (output, taskId)

        assert output, "Invalid output file name"
        assert taskId, "Invalid task id"

        self.__waitForTask(taskId)

        self.__downloadFile(output)

