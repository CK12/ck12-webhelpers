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

from flxadmin.lib.ck12.errorcodes import ErrorCodes


class RemoteAPIException(Exception):
    pass

class InvalidLogin(Exception):
    pass

class InvalidArguments(Exception):
    pass

class UnexpectedResponseData(Exception):
    pass

class CreateUserException(Exception):
    pass

class AuthProfileExistsException(Exception):
    def __init__(self, user, authType):
        message = 'Authentication profile %s already exists for user (%s:%s)' % (authType, user['id'], user['email'])
        # Call the base class constructor with the parameters it needs
        Exception.__init__(self, message)
class ResourceUploadException(Exception):
    pass

class ResourceAssociationException(Exception):
    def __init__(self,action, artifact_id, artifact_revision_id, resource_id, resource_revision_id, err_msg):
        message = 'Could not %s resource association with artifact.' % action
        message = '%s resourceID:%s, resourceRevisionID:%s,' % (message, resource_id, resource_revision_id)
        message = '%s artifactID:%s, artifactRevisionID:%s,' % (message, artifact_id, artifact_revision_id)
        if err_msg:
            message = '%s, Reason:%s' % (message, err_msg)
        Exception.__init__(self, message)

class ArtifactSaveException(Exception):
    """
    Exception raised when a artifact failed to save
    """
    def __init__(self,message):
        Exception.__init__(self,message)

class ArtifactMetadataSaveException(Exception):
    '''
    Exception raised when an error is encountered during metadata save
    '''

class RemoteAPIStatusException(Exception):
    '''
    Exception raised when the remote API returns a response
    with a status_code other than 0 i.e 'OK'
    '''
    def __init__(self,status_code, api_message = None):
        self.status_code = status_code
        self.api_message = api_message
        self.error = ErrorCodes.get(status_code) 
        if self.error:
            message = 'API returned status %s' % self.error['name']
        else:
            message = 'API returned unknown status code = %s' % status_code 
        Exception.__init__(self, message)

class EmbeddedObjectException(Exception):
    '''
    Exception raised while creating an embedded object.
    '''