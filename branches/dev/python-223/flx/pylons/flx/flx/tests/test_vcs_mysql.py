from paste.deploy.converters import asbool
from pylons import config

from flx.tests import *
from flx.model import meta
from flx.model.vcs import vcs as v
from flx.model.model import Resource

import logging
log = logging.getLogger(__name__)

if asbool(config.get('vcs_mysql', True)):    
    class TestVcs(TestController):
    
        def setUp(self):
            super(TestVcs, self).setUp()
            self.session = meta.Session()
            self.memberID = 1
            self.session.begin()
            self.fileName = 'test'
            self.r_vcs = v.vcs(self.memberID, session=self.session)
            self.r_revNo = None
            self.l_vcs = v.vcs(self.memberID, inPlace=True, session=self.session)
            self.l_revNo = None
    
        def tearDown(self):
            super(TestVcs, self).tearDown()
            self.session.commit()

        def __deleteResourceAndContent(self):
            self.session.execute('DELETE FROM Contents WHERE resourceURI="%s" AND ownerID=%s' %
                                 (self.fileName, self.memberID))
            self.session.execute('DELETE FROM Resources WHERE resourceTypeID=1 AND name=handle AND handle=uri AND uri=refHash and uri="%s" AND ownerID=%s' %
                                 (self.fileName, self.memberID))
            
        def test_aaa_createTestResource(self):
            self.__deleteResourceAndContent()
            self.session.execute('INSERT INTO Resources(resourceTypeID, name, handle, uri, refHash, ownerID) VALUE (1, "%s", "%s", "%s", "%s", %s)' %
                                 (self.fileName, self.fileName, self.fileName, self.fileName, self.memberID))
                
        def _add(self, vcs):
            revNo = vcs.add(self.fileName, contents='This is to test commit')
            self.revNo = revNo
            print 'vcs add[%s]' % revNo
            result = vcs.commit('added file[%s]' % self.fileName)
            print 'vcs commit[%s]' % result
            assert result is not None
    
            fileName = '987654321'
            result = vcs.add(fileName, contents='This is to test revert')
            print 'vcs add[%s]' % result
            vcs.revert()
            try:
                result = vcs.get(fileName)
                print 'vcs get[%s]' % result
                assert result is None
            except Exception:
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
            assert self.r_vcs.get(self.fileName) is None
    
        def test_l_remove(self):
            self._remove(self.l_vcs)
            assert self.l_vcs.get(self.fileName) is None
            
        def test_hasChanged(self):
            revNo = self.r_vcs.add(self.fileName, contents='This is to test hasChanged')
            self.revNo = revNo
            result = self.r_vcs.commit('added file[%s]' % self.fileName)
            assert result is not None
            c = 'This is changed'
            assert self.r_vcs.hasChanged(self.fileName, contents=c)
            self.r_vcs.update(self.fileName, contents=c, toInclude=True, cached=True)
            c = 'This is to test hasChanged again'
            assert self.r_vcs.hasChanged(self.fileName, contents=c)
            self.r_vcs.update(self.fileName, contents=c, toInclude=True, cached=True)
            self.r_vcs.remove(self.fileName)
    
        def test_update(self):
            rev1 = self.r_vcs.add(self.fileName, contents='This is 1')
            result = self.r_vcs.commit('added file[%s]' % self.fileName)
            assert result is not None
            rev2 = self.r_vcs.add(self.fileName, contents='This is 2')
            result = self.r_vcs.commit('added file[%s]' % self.fileName)
            assert rev1 and rev2 and result is not None
            
            assert self.r_vcs.get(self.fileName, rev1) == 'This is 1'
            
            self.r_vcs.update(self.fileName, rev1, contents='This is 1.1', toInclude=True)
            result = self.r_vcs.commit('updated file[%s]' % self.fileName)
            assert result is None
    
            assert self.r_vcs.get(self.fileName, rev1) == 'This is 1.1'
    
            self.r_vcs.remove(self.fileName)
            self.r_vcs.commit('remove file[%s]' % self.fileName)
    
        def test_zzz_cleanup(self):
            basedir = self.l_vcs.basedir
            self.l_vcs.basedir = ''
            path = '0/0/%d/%s' % (self.memberID, self.fileName)
            self.l_vcs.remove(path, isDir=False)
            self.l_vcs.basedir = basedir
            result = self.l_vcs.commit('removed dir[%s]' % dir)
            print 'vcs commit[%s]' % result
            self.__deleteResourceAndContent()
            
