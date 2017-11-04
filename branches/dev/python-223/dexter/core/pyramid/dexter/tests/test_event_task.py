import unittest
from dexter.views.errorCodes import ErrorCodes
from dexter.tests.test_case_wrapper import TestCaseWrapper

import logging

log = logging.getLogger(__name__)


class EventTaskTestCase(unittest.TestCase, TestCaseWrapper):
    def setUp(self):
        self.testapp = super(EventTaskTestCase, self).setUpApp()

    # Code for testing Register Event Task API
    def test_1_register_event_task(self):
        url = '/register/event_task'
        task_name = 'test_eventtask_1'
        frequency = 100
        eventtype = 'FBS_MODALITY'
        target_url = '%s?name=%s&eventtype=%s&frequency=%s'%(url, task_name, eventtype, frequency)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_REGISTER_EVENTTASK)
     
    # Code for testing get Event Task API
    def test_2_get_event_task(self):
        url = '/get/event_task'
        task_name = 'test_eventtask_1'
        target_url = '%s?name=%s'%(url, task_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_GET_EVENTTASK)
        
    # Code for testing update Event Task API
    def test_3_update_event_task(self):
        url = '/update/event_task'
        task_name = 'test_eventtask_1'
        new_frequency = 200
        target_url = '%s?name=%s&frequency=%s'%(url, task_name, new_frequency)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)

        target_url = '/update/event_task'
        # Code for checking the Exception block 
        res = self.testapp.post(str(target_url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_UPDATE_EVENTTASK)
        
    def test_4_unregister_event_task(self):
        url = '/unregister/event_task'
        task_name = 'test_eventtask_1'
        target_url = '%s?name=%s'%(url, task_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
      
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_UNREGISTER_EVENTTASK)
     
