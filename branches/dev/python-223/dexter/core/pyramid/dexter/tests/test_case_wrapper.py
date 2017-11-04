from pyramid import testing

from paste.deploy.loadwsgi import appconfig
from dexter import main
from webtest import TestApp
from datetime import datetime

import logging

log = logging.getLogger(__name__)

# Wrapper class for test cases
class TestCaseWrapper(object):

    def setUpApp(self):
        settings = appconfig('config:development.ini', 'main', relative_to='.')
        app = main({}, **settings)
        #app = main({})
        return TestApp(app) 

    def tearDown(self):
        testing.tearDown()

    def _checkJsonResponseHeader(self, response, label=None):
        self.failUnless('responseHeader' in response) 
        #print "Response: %s" % str(response)
        if response['responseHeader']['status'] != 0:
             print "Failed Response: %s" % str(response)
        self.failUnless(response['responseHeader']['status'] == 0)
        if label:
            self.failUnless(response['response'].has_key(label))
            
    # Method for checking the Non-zero response code (For testing Exception block as well )
    def _checkJsonFailureResponse(self, response, errorCode):
        self.failUnless('responseHeader' in response)
        if response['responseHeader']['status'] != errorCode:
            print "Incorrect Response: %s" % str(response)
        self.failUnless(response['responseHeader']['status'] == errorCode)
        
    def getLoginCookie(self, user='jillt'):
        return { 'Cookie': 'dexter=%s' % user }

    def create_timestamp(self):
        return datetime.now().strftime("%Y%m%d%H%M%S%f")

    def checkOrder(self, objects, field, order='asc'):
        if objects:
            lastVal = None
            for obj in objects:
                assert obj.has_key(field)
                val = obj[field]
                log.info("Value: %s" % str(val))
                if lastVal:
                    if order == 'asc':
                        assert val >= lastVal, "Failed to assert ascending order for: %s" % field
                    else:
                        assert val <= lastVal, "Failed to assert descending order for : %s" % field
                lastVal = val

