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
# This file originally written by Ravi Gidwani
#
# $Id$
import logging

log = logging.getLogger( __name__ )

class CK12Model( dict ):

    def __init__( self, dict_obj=None ):
        '''
        Constructs the model object using the key/values from the dict object
        '''
        if dict_obj:
            for key, value in dict_obj.items():
                self[key] = dict_obj[key]
                #self[key] = self.__decode__(value)

    def __decode__(self,obj):
        if type(obj) == dict:
            for key, value in obj.items():
               obj[key] = self.__decode__(value)
        elif type(obj) == list:
            for index,value in enumerate(obj):
                obj[index] = self.__decode__(value)
        elif type(obj) == str:
            obj = obj.decode('utf-8')
        return obj

    def __getitem__(self, key):
        return dict.get(self, key)

