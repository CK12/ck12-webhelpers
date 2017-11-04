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
# $Id: exceptions.py 24199 2013-01-25 10:45:49Z chetan $

from flx.lib.ck12.errorcodes import ErrorCodes


class RemoteAPIException(Exception):
    pass

class InvalidLogin(Exception):
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
    def __init__(self,status_code, api_message = None, response_data = None):
        self.status_code = status_code
        self.api_message = api_message
        self.response_data = response_data
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

class CreateCustomCoverException(Exception):
    '''
    Exception raised while creating an custom cover image.
    '''

class GDTInfoException(Exception):
    '''
    Exception raised in case of an error while fetching user's google documents list
    '''

class GDTImportException(Exception):
    '''
    Exception raised during GDT import
    '''

class GDTImportAuthException(Exception):
    '''
    Exception raised during GDT import in case of invalid authentication
    '''

class XDTImportException(Exception):
    '''
    Exception raised during XDT import
    '''

class ArtifactAlreadyExistsException(Exception):
    '''
    Exception raised when artifact title already exists.
    '''

class RosettaValidationException(Exception):
    '''
    Exception raised on rosetta validation error
    '''
    def __init__(self,message):
        Exception.__init__(self,message)

class ResourceAlreadyExistsException(Exception):
    '''
    Exception raised if resource to create/update already exists.
    '''
    def __init__(self, resource = None, message = None):
        '''
        @param message: exception message
        @param resource: existing resource object
        '''
        self.resource = resource
        Exception.__init__(self, message)

class ResourceExceedsSizeLimitException(Exception):
    '''
    Exception raised if resource exceeds maximum allowed filesize.
    '''

class ResourceSaveException(Exception):
    '''
    Exception raised if resource creation or update fails.
    '''

class ArtifactNotLatestException(Exception):
    '''
    Exception raised when trying to save an older version of artifact.
    '''

class ResourceNotFoundException(Exception):
    '''
    Exception raised when trying to fetch a resource.
    '''

class LabelAlreadyExistsException(Exception):
    '''
    Exception raised when Label already exists.
    '''

class DuplicateChapterTitleException(Exception):
    '''
    Exception raised by backend when there are more than one chapters
    with same title in a book payload
    '''
    
class DuplicateEncodedIDException(Exception):
    '''
    Exception raised by backend when there are duplicate EncodedID
    '''

class InvalidDomainEIDEncodedIDException(Exception):
    '''
    Exception raised by backend when there problem with EncodedID or DomainEID 
    '''
    
class MissingArgumentException(Exception):
    '''
    Exception raised by backend when arguments missing
    '''