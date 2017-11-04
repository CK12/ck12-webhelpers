from flx.tests import *

class TestTranslatorController(TestController):

    def __notused_test_index(self):
        response = self.app.get(url(controller='translator', action='index'))
        # Test response...
