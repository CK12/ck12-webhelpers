import unittest
from dexter.views.errorCodes import ErrorCodes
from dexter.tests.test_case_wrapper import TestCaseWrapper
import json
import time
import logging

log = logging.getLogger(__name__)


class EventTestCase(unittest.TestCase, TestCaseWrapper):
    def setUp(self):
        self.testapp = super(EventTestCase, self).setUpApp()
        self.memberID = 1

    # Code for testing Register event type API
    def test_1_register_event(self):

        url = "/register/client"
        client_name = "test_client_1"
        target_url = "%s?name=%s"%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        url = "/get/client"
        client_name = "test_client_1"
        target_url = "%s?name=%s"%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        clientID = res.json_body["response"]["client"]["clientID"]
        field_parameters = [{
                              "name": "artifactID",
                              "mandatory": "true"
                            },
                            {
                              "name": "memberID",
                              "mandatory": "true"
                            }]

        url = "/register/event"
        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT",
                   "parameters": json.dumps(field_parameters)
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)


        field_parameters = [{
                              "name": "artifactID"
                            },
                            {
                              "name": "memberID"
                            }]

        url = "/register/event"
        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT",
                   "parameters": json.dumps(field_parameters)
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_REGISTER_EVENT)
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_REGISTER_EVENT)
        
    # Code for testing record event API
    def test_2_record_event(self):
       
        url = "/get/client"
        client_name = "test_client_1"
        target_url = "%s?name=%s"%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        clientID = res.json_body["response"]["client"]["clientID"]
        
        url = "/record/event"
        payload = {
                    "artifactID": 100,
                    "memberID": self.memberID
                  }

        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT",
                   "payload": json.dumps(payload)
                 }
        res = self.testapp.post(str(url), params, status=200)
        content = 'GIF89a\x01\x00\x01\x00\x80\xff\x00\xff\xff\xff\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        assert res.body == content, 'Failed to record event'
        
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_RECORD_EVENT)


    # Code for testing record event API
    def test_3_store_event(self):

        url = "/get/client"
        client_name = "test_client_1"
        target_url = "%s?name=%s"%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        clientID = res.json_body["response"]["client"]["clientID"]
        
        url = "/record/event"
        payload = {
                    "artifactID": 101,
                    "memberID": self.memberID
                  }

        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT",
                   "payload": json.dumps(payload)
                 }
        res = self.testapp.post(str(url), params, status=200)
        content = 'GIF89a\x01\x00\x01\x00\x80\xff\x00\xff\xff\xff\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        assert res.body == content, 'Failed to record event'

        # Verify that the event is properly stored.
        url = "/get/event"
        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT",
                   "payload": json.dumps(payload)
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
        assert res.json_body["response"]["event"]["clientID"] == str(clientID)
        assert res.json_body["response"]["event"]["eventType"] == "FBS_HIT"
        assert res.json_body["response"]["event"]["payload"]["memberID"] == payload["memberID"]
        assert res.json_body["response"]["event"]['payload']["artifactID"] == payload["artifactID"]

    # Code for testing resolved event.
    def test_4_resolve_event(self):
        url = "/get/client"
        client_name = "test_client_1"
        target_url = "%s?name=%s"%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        clientID = res.json_body["response"]["client"]["clientID"]
        
        url = "/record/event"
        payload = {
                    "artifactID": 102,
                    "memberID": self.memberID
                  }

        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT",
                   "payload": json.dumps(payload)
                 }
        res = self.testapp.post(str(url), params, status=200)
        content = 'GIF89a\x01\x00\x01\x00\x80\xff\x00\xff\xff\xff\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        assert res.body == content, 'Failed to record event'

        # Check if event is resolved.
        url = "/get/event"
        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT",
                   "payload": json.dumps(payload)
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)

        assert res.json_body["response"]["event"]["clientID"] == str(clientID)
        assert res.json_body["response"]["event"]["eventType"] == "FBS_HIT"
        assert res.json_body["response"]["event"]["payload"]["memberID"] == payload["memberID"]
        assert res.json_body["response"]["event"]['payload']["artifactID"] == payload["artifactID"]        

        eventID = res.json_body["response"]["event"]['_id']
        url = "/get/event"
        params = {'eventID':eventID}
        max_wait_time = 300
        status_interval = 10
        start_time = time.time()
        while True:
            res = self.testapp.post(str(url), params, status=200)
            self._checkJsonResponseHeader(res.json_body)
            resolved = res.json_body["response"]["event"]["resolved"]
            if resolved:
                    break
            if (time.time() - start_time) > max_wait_time:
                break
            time.sleep(status_interval)

        # Verify that event is propery resolved.
        url = "/get/resolved_event"
        params = {"eventType": "FBS_HIT", "eventID": eventID}
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
        assert res.json_body["response"]["resolved_event"]["memberID"] == payload["memberID"]
        assert res.json_body["response"]["resolved_event"]["artifactID"] == payload["artifactID"]
        assert res.json_body["response"]["resolved_event"]["memberID_firstName"]
        assert res.json_body["response"]["resolved_event"]["memberID_lastName"]
        assert res.json_body["response"]["resolved_event"]["memberID_email"]
        assert res.json_body["response"]["resolved_event"]["artifactID_creator"]
        assert res.json_body["response"]["resolved_event"]["artifactID_artifactType"]
            
    def test_5_unregister_event(self):
        url = "/get/client"
        client_name = "test_client_1"
        target_url = "%s?name=%s"%(url, client_name)
        res = self.testapp.post(str(target_url), status=200)
        self._checkJsonResponseHeader(res.json_body)
        clientID = res.json_body["response"]["client"]["clientID"]

        url = "/unregister/event"
        params = {
                   "clientID": clientID,
                   "eventType": "FBS_HIT"
                 }
        res = self.testapp.post(str(url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
      
        # Code for checking the Exception block 
        res = self.testapp.post(str(url), params = {}, status=200)
        self._checkJsonFailureResponse(res.json_body, errorCode = ErrorCodes.CANNOT_UNREGISTER_EVENT)
     
        url = "/unregister/client"
        client_name = "test_client_1"
        target_url = "%s?name=%s"%(url, client_name)
        params = {
                   "clientID": clientID
                 }
        res = self.testapp.post(str(target_url), params, status=200)
        self._checkJsonResponseHeader(res.json_body)
