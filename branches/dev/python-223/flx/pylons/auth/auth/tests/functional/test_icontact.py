from auth.tests import *

class TestIcontactController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='icontact', action='index'))
        # Test response...
