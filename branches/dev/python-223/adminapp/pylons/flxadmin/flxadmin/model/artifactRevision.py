#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# @author: Nachiket Karve
#
# $Id$

from flxadmin.model.ck12model import CK12Model
from urllib import quote

class ArtifactRevision( CK12Model ):
    
    def __init__(self, dict_obj):
        CK12Model.__init__(self,dict_obj)
        self['handle'] = quote(dict_obj['handle'].encode('utf-8'))
    
    def getChildRevisions(self):
        if self.hasChildRevisionInfo():
            return [ ArtifactRevision( revision ) for revision in self.get('children')]
        else:
            return []
    
    def getChildRevisionIDs(self):
        if self.hasChildren():
            if self.hasChildRevisionInfo():
                return [ revision['artifactID'] for revision in self.getChildRevisions() ]
            else:
                return self.get('children')
        else:
            return []
    
    def hasChildren(self):
        return self.has_key('children') and len (self.get('children')) > 0
    
    def hasChildRevisionInfo(self):
        if self.hasChildren():
            children  = self.get('children')
            child = children[0]
            if type(child).__name__ == 'dict' and child.has_key('artifactID'):
                return True
        return False
    
    def getDownloadCount( self ):
        if 'statistics' in self:
            return self['statistics']['downloads']
        else:
            return 0

    def getFavoriteCount( self ):
        if 'statistics' in self:
            return int(self['statistics']['favorites'])
        else:
            return 0

    def isFavorite( self ):
        return self.get( 'isFavorite' )

