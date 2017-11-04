import random

from paste.deploy.converters import asbool
from pylons import config

from flx.tests import *
from flx.lib import helpers as h
from flx.lib.vcs import vcs as v

import logging
log = logging.getLogger(__name__)

if not asbool(config.get('vcs_mysql', True)):
    class TestVcs(TestController):
    
        def setUp(self):
            super(TestVcs, self).setUp()
            self.memberID = 1388
            self.fileName = '3388'
            self.r_vcs = v.vcs(self.memberID)
            self.r_revNo = None
            self.l_vcs = v.vcs(self.memberID, inPlace=True)
            self.l_revNo = None
    
        def tearDown(self):
            super(TestVcs, self).tearDown()
    
        def _add(self, vcs):
            revNo = vcs.add(self.fileName, contents='This is to test commit')
            self.revNo = revNo
            print 'vcs add[%s]' % revNo
            result = vcs.commit('added file[%s]' % self.fileName)
            print 'vcs commit[%s]' % result
            assert result is not None
    
            fileName = 'should-not-exist'
            result = vcs.add(fileName, contents='This is to test revert')
            print 'vcs add[%s]' % result
            vcs.revert()
            try:
                result = vcs.get(fileName)
                print 'vcs get[%s]' % result
                assert result is None
            except Exception, e:
                #
                #  Expecting.
                #
                pass
    
            return revNo
    
        def test_r_add(self):
            self.r_revNo = self._add(self.r_vcs)
    
        def test_l_add(self):
            self.l_revNo = self._add(self.l_vcs)
    
        def _get(self, vcs, revNo):
            result = vcs.get(self.fileName)
            print 'vcs get[%s]' % result
            assert result is not None
    
            result = vcs.get(self.fileName, revNo=revNo)
            print 'vcs get[%s]' % result
            assert result is not None
    
        def test_r_get(self):
            self._get(self.r_vcs, self.r_revNo)
    
        def test_l_get(self):
            self._get(self.l_vcs, self.l_revNo)
    
        def _getSize(self, vcs):
            result = vcs.getSize(self.fileName)
            print 'vcs getSize[%s]' % result
            assert result is not None
    
        def test_r_getSize(self):
            self._getSize(self.r_vcs)
    
        def test_l_getSize(self):
            self._getSize(self.l_vcs)
    
        def _getHistory(self, vcs):
            result = vcs.getHistory(self.fileName)
            print 'vcs get[%s]' % result
            assert result is not None
    
            result = vcs.getHistory(self.fileName, revNo=1)
            print 'vcs get[%s]' % result
            assert result is not None
    
        def test_r_getHistory(self):
            self._getHistory(self.r_vcs)
    
        def test_l_getHistory(self):
            self._getHistory(self.l_vcs)
    
        def _getRevision(self, vcs):
            result = vcs.getRevision(self.fileName)
            print 'vcs getRevision[%s]' % result
            assert result is not None
    
        def test_r_getRevision(self):
            self._getRevision(self.r_vcs)
    
        def test_l_getRevision(self):
            self._getRevision(self.l_vcs)
    
        def _mkdir(self, vcs):
            dir = '8888'
            result = vcs.mkdir(dir)
            print 'vcs mkdir[%s]' % result
            result = vcs.commit('mkdir[%s]' % dir)
            print 'vcs commit[%s]' % result
            result = vcs.remove(dir, isDir=True)
            print 'vcs remove[%s]' % result
            result = vcs.commit('removed[%s]' % dir)
            print 'vcs commit[%s]' % result
    
        def test_r_mkdir(self):
            self._mkdir(self.r_vcs)
    
        def test_l_mkdir(self):
            self._mkdir(self.l_vcs)
    
        def _mkdirs(self, vcs):
            dir = '8888/8888'
            result = vcs.makedirs(dir)
            print 'vcs makedirs[%s]' % result
            result = vcs.revert()
            print 'vcs revert[%s]' % result
    
        def test_r_mkdirs(self):
            self._mkdirs(self.r_vcs)
    
        def test_l_mkdirs(self):
            self._mkdirs(self.l_vcs)
    
        def _remove(self, vcs):
            result = vcs.remove(self.fileName)
            print 'vcs remove[%s]' % result
            result = vcs.commit('removed file[%s]' % self.fileName)
            print 'vcs commit[%s]' % result
    
        def test_r_remove(self):
            self._remove(self.r_vcs)
    
        def test_l_remove(self):
            self._remove(self.l_vcs)
    
        def test_zzz_cleanup(self):
            basedir = self.l_vcs.basedir
            self.l_vcs.basedir = ''
            dir = '0/1/%d' % self.memberID
            self.l_vcs.remove(dir, isDir=True)
            self.l_vcs.basedir = basedir
            result = self.l_vcs.commit('removed dir[%s]' % dir)
            print 'vcs commit[%s]' % result
