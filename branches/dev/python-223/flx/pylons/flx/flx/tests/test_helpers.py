import random
import time
import os

from flx.tests import *
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib import helpers as h

artifact = None

class TestHelpers(TestController):

    def setUp(self):
        super(TestHelpers, self).setUp()
        session = meta.Session()

    def test_xhtml_to_text(self):
        artifact = api.getArtifactByID(id=2)
        xhtml = artifact.getXhtml()
        assert xhtml
        print len(xhtml)
        if xhtml:
            text = h.xhtml_to_text(xhtml)
            assert text
            assert len(text) > 0 and len(text) < len(xhtml)
            print len(text)

