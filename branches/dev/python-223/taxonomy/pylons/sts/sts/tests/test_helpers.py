import random
import os
from datetime import datetime

from sts.tests import *
from sts.model import meta
from sts.model import model
from sts.model import api
from sts.lib import helpers as h


class TestHelpers(TestController):

    def setUp(self):
        super(TestHelpers, self).setUp()
        session = meta.Session()

    def tearDown(self):
        super(TestHelpers, self).tearDown()

    def test_getMeanEncode(self):
        mean = h.getMeanEncode('MAT.ALG.000', 'MAT.ALG.999')
        print mean
        assert mean == 'MAT.ALG.499'

        mean = h.getMeanEncode(None, 'MAT.ALG.100')
        print mean
        assert mean == 'MAT.ALG.050'

        mean = h.getMeanEncode('MAT.ALG.200', 'MAT.ALG.202')
        print mean
        assert mean == 'MAT.ALG.201'

        mean = h.getMeanEncode('MAT.ALG.200', 'MAT.ALG.201')
        print mean
        assert mean == 'MAT.ALG.200.5'

        mean = h.getMeanEncode('MAT.ALG.200.5', 'MAT.ALG.200.6')
        print mean
        assert mean == 'MAT.ALG.200.55'

        mean = h.getMeanEncode('MAT.ALG.200.555', 'MAT.ALG.200.556')
        print mean
        assert mean == 'MAT.ALG.200.5555'

        mean = h.getMeanEncode('MAT.ALG.200.5555', 'MAT.ALG.200.556')
        print mean
        assert mean == 'MAT.ALG.200.5557'

        mean = h.getMeanEncode('MAT.ALG.200.5557', 'MAT.ALG.200.556')
        print mean
        assert mean == 'MAT.ALG.200.5558'

        mean = h.getMeanEncode('MAT.ALG.200.5558', 'MAT.ALG.200.556')
        print mean
        assert mean == 'MAT.ALG.200.5559'        
        
        mean = h.getMeanEncode('MAT.ALG.200.5559', 'MAT.ALG.200.556')
        print mean
        assert mean == 'MAT.ALG.200.55595'

        ## Negative
        mean = h.getMeanEncode('MAT.ARI.112', 'MAT.ARI.112')
        assert mean is None

        mean = h.getMeanEncode(None, '')
        assert mean is None

        try:
            mean = h.getMeanEncode('112', '113')
            assert False
        except:
            assert True

    def test_taperingMean(self):
        means = [ 'SCI.PHY.500', 'SCI.PHY.750', 'SCI.PHY.875', 
                'SCI.PHY.937', 'SCI.PHY.968', 'SCI.PHY.984',
                'SCI.PHY.992', 'SCI.PHY.996', 'SCI.PHY.998',
                'SCI.PHY.999', 'SCI.PHY.999.5', 'SCI.PHY.999.7',
                'SCI.PHY.999.8', 'SCI.PHY.999.9', 'SCI.PHY.999.95',
                'SCI.PHY.999.97', 'SCI.PHY.999.98', 'SCI.PHY.999.99',
                'SCI.PHY.999.995', 'SCI.PHY.999.997' ]
        e1 = 'SCI.PHY.000'
        e2 = ''
        for i in range(0, 20):
            mean = h.getMeanEncode(e1, e2)
            print "%d: %s" % (i, mean)
            assert mean == means[i]

            e1 = mean

        means = [ 'SCI.CHE.499', 'SCI.CHE.249', 'SCI.CHE.124',
                'SCI.CHE.062', 'SCI.CHE.031', 'SCI.CHE.015',
                'SCI.CHE.007', 'SCI.CHE.003', 'SCI.CHE.001',
                'SCI.CHE.000.5', 'SCI.CHE.000.2', 'SCI.CHE.000.1',
                'SCI.CHE.000.05', 'SCI.CHE.000.02', 'SCI.CHE.000.01',
                'SCI.CHE.000.005', 'SCI.CHE.000.002', 'SCI.CHE.000.001',
                'SCI.CHE.000.0005', 'SCI.CHE.000.0002' ]
        e1 = ''
        e2 = 'SCI.CHE.999.95'
        for i in range(0, 20):
            mean = h.getMeanEncode(e1, e2)
            print "%d: %s" % (i, mean)
            assert mean == means[i]

            e2 = mean
