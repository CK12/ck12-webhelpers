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
# $Id: ck12model.py 14132 2011-12-15 05:07:59Z jleung $


class CK12Model( dict ):

    def __init__( self, dict_obj=None ):
        '''
        Constructs the model object using the key/values from the dict object
        '''
        if dict_obj:
            for key, value in dict_obj.items():
                self[key] = value

    def __getitem__(self, key):
        return dict.get(self, key)

