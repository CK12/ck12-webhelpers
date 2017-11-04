import unittest
from dexter.views.errorCodes import ErrorCodes
from dexter.tests.test_case_wrapper import TestCaseWrapper

import logging

log = logging.getLogger(__name__)


class ClientTestCase(unittest.TestCase, TestCaseWrapper):
    def setUp(self):
        self.testapp = super(ClientTestCase, self).setUpApp()

    # Code for testing Register Client API
    def test_1_register_client(self):
        url = '/register/client'
        client_name = 'test_client_1'
        target_url = '%s?name=%s'%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_REGISTER_CLIENT)
     
    # Code for testing get Client API
    def test_2_get_client(self):
        url = '/get/client'
        client_name = 'test_client_1'
        target_url = '%s?name=%s'%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_GET_CLIENT)
        
    # Code for testing update Client API
    def test_3_update_client(self):
        url = '/get/client'
        client_name = 'test_client_1'
        target_url = '%s?name=%s'%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        clientID = res.json_body['response']['client']['clientID']
        
        url = '/update/client'
        client_name = 'test_client_2'
        target_url = '%s?name=%s'%(url, client_name)
        params = {
                   'clientID': clientID
                 }
        res = self.testapp.post(str(target_url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
        url = '/update/client'
        client_name = 'test_client_1'
        target_url = '%s?name=%s'%(url, client_name)
        params = {
                   'clientID': clientID
                 }
        res = self.testapp.post(str(target_url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(target_url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_UPDATE_CLIENT)
        
    def test_4_unregister_client(self):
        url = '/get/client'
        client_name = 'test_client_1'
        target_url = '%s?name=%s'%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        clientID = res.json_body['response']['client']['clientID']
        url = '/unregister/client'
        client_name = 'test_client_1'
        params = {
                   'clientID': clientID
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
      
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_UNREGISTER_CLIENT)
     
