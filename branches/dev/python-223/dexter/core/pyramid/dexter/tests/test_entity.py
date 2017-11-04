import unittest
from dexter.views.errorCodes import ErrorCodes
from dexter.tests.test_case_wrapper import TestCaseWrapper
import logging
log = logging.getLogger(__name__)


class EntityTestCase(unittest.TestCase, TestCaseWrapper):
    def setUp(self):
        self.testapp = super(EntityTestCase, self).setUpApp()

    # Code for testing get entity API
    def test_get_entity(self):
        url = "/get/entity"
        
        parameter_name = "artifactID"
        entity_key = "1353"
        target_url = "%s?paramName=%s&amp;entityKey=%s"%(url, parameter_name, entity_key)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_GET_ENTITY)

