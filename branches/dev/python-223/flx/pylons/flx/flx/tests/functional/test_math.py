from flx.tests import *
from flx.model import meta
from flx.model import api
import re
import os, sys
import logging
import json
import time

log = logging.getLogger(__name__)

class TestMath(TestController):
    
    def test_createInline(self):
        session = meta.Session()
        response = self.app.post(url(controller='math', action='inline', id='a + b = c'), headers={'Cookie': self.getLoginCookie(1)})
        #print "This is the math location: " + str(response.location)
        assert response.location != None 
        
    def test_createInlineNeg(self):
        session = meta.Session()
        response = self.app.post(url(controller='math', action='inline', id='a + b &= c'), headers={'Cookie': self.getLoginCookie(1)})
        #print "This is the math location: " + str(response.location)
        assert response.location is None
        
    def test_createBlock(self):
        session = meta.Session()
        response = self.app.post(url(controller='math', action='block', id='a + b &= c\\\\d + e &= f'), headers={'Cookie': self.getLoginCookie(1)})
        #print "This is the math location: " + str(response.location)
        assert response.location != None
        
    def test_createAlignat(self):
        session = meta.Session()
        response = self.app.post(url(controller='math', action='alignat', id='a + b &= c\\\\d + e &= f'), headers={'Cookie': self.getLoginCookie(1)})
        #print "This is the math location: " + str(response.location)
        assert response.location != None
        
    def test_parallelCreateMath(self):
        import threading
        class MathMaker(threading.Thread):

            def __init__(self, app, exp):
                threading.Thread.__init__(self)
                self.app = app
                self.exp = exp

            def run(self):
                #num = random.random()
                #print "Sleeping for %f" % num
                #time.sleep(num)
                s = int(time.time() * 1000)
                response = self.app.get('/math/inline/{%s}' % self.exp)
                assert response
                print response.status
                assert '40' not in response.status and '50' not in response.status, "Error rendering math"
                ts = int(time.time()*1000) - s
                log.info("Time spent for math making (ms): %d" % ts)
                print "Time spent for math making (ms): %d" % ts

        try:
            mathMakers = []
            max = 10
            for i in range(0, max):
                mathMakers.append(MathMaker(self.app, i))
    
            for mm in mathMakers:
                mm.start()
    
            for mm in mathMakers:
                mm.join()
        except:
            assert False

    
