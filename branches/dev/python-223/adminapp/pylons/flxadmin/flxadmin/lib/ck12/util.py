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

def equalsIgnoreCase(string1,string2):
    """
    Does a case insensitive string comparison
    """
    if not string1 or not string2:
        return False
    return string1.lower() == string2.lower()

def to_unicode(obj, encode=False):
    if not isinstance( obj, basestring):
        obj = unicode(obj)
    if encode:
        obj = obj.encode('utf-8')
    return obj