from auth.tests import *

class TestCleverController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='clever', action='index'))
        # Test response...
