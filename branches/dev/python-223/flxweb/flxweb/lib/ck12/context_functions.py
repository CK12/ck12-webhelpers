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

from jinja2.utils import contextfunction
from pylons import config

@contextfunction
def version_info( context, **extra_context ):
    major_version = config['build_major_version']
    minor_version = config['build_minor_version']
    version = '%s.%s' % ( major_version, minor_version )
    return version
