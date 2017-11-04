import unittest
from dexter.views.errorCodes import ErrorCodes
from dexter.tests.test_case_wrapper import TestCaseWrapper
import logging
log = logging.getLogger(__name__)


class ParameterTestCase(unittest.TestCase, TestCaseWrapper):
    def setUp(self):
        self.testapp = super(ParameterTestCase, self).setUpApp()

    # Code for testing Register parameter API
    def test_1_register_parameter(self):
        url = "/register/parameter"
        params = {
                   "name": "test_parameter_1",
                   "type": "int",
                   "api" : None
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        params = {
                   "name": "test_parameter_1",
                   "api" : None
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_REGISTER_PARAMETER)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_REGISTER_PARAMETER)
        
    # Code for testing get parameter API
    def test_2_get_parameter(self):
        url = "/get/parameter"
        parameter_name = "test_parameter_1"
        target_url = "%s?name=%s"%(url, parameter_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_GET_PARAMETER)
        
        
    # Code for testing update parameter API
    def test_3_update_parameter(self):
        url = "/get/parameter"
        parameter_name = "test_parameter_1"
        target_url = "%s?name=%s"%(url, parameter_name)
        res = self.testapp.post(str(target_url), status=200)
        parameter_id = res.json_body["response"]["parameter"]["_id"]
        url = "/update/parameter"
        parameter_name = "test_parameter_2"
        params = {
                  "parameter_id": parameter_id,
                  "name": parameter_name
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_UPDATE_PARAMETER)
        
    def test_4_unregister_parameter(self):
        url = "/get/parameter"
        parameter_name = "test_parameter_2"
        target_url = "%s?name=%s"%(url, parameter_name)
        res = self.testapp.post(str(target_url), status=200)
        parameter_id = res.json_body["response"]["parameter"]["_id"]
        
        url = "/unregister/parameter"
        params = {
                   "parameter_id": parameter_id
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_UNREGISTER_PARAMETER)
