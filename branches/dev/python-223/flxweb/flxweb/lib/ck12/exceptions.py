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

from flxweb.lib.ck12.errorcodes import ErrorCodes
import time
import random
import traceback

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

class DetailedSaveException(Exception):
    '''
    Save exception with more details
    '''
    payload = None
    artifact = None
    user = None
    err_id = 0

    def __init__(self, message=""):
        self.err_id = self.__getErrorID__()
        Exception.__init__(self,message)

    def setInfo(self, artifact, payload, user):
        self.artifact = artifact
        self.payload = payload
        self.user = user

        #file objects won't get serialized, just keep paths
        if payload.get('attachmentPath'):
            payload['attachmentPath'] = '%s' % payload.get('attachmentPath')

    def getErrorInfo(self):
        if not self.err_id:
            self.err_id = self.__getErrorID__()
        error_obj = {
            'errorID': self.err_id,
            'artifactID' : self.artifact.get('artifactID'),
            'artifactRevisionID': self.artifact.get('artifactRevisionID'),
            'artifactType': self.artifact.get('artifactType'),
            'userEmail': self.user.get('email'),
            'payload': self.payload,
            'exceptionMessage': self.message,
            'exceptionType': type(self).__name__,
            'traceback': traceback.format_exc()
        }
        return error_obj

    def __getErrorID__(self):
        return '%s%s' % ( time.strftime("%Y%m%d%H%M%S"), random.randint(1000,9999))



class ArtifactSaveException(DetailedSaveException):
    """
    Exception raised when a artifact failed to save
    """
    def __init__(self,message):
        Exception.__init__(self,message)

class ArtifactMetadataSaveException(DetailedSaveException):
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

class RemoteAPIHTTPException(Exception):
    '''
    '''
    def __init__(self, httpStatus, errors):
        self.httpStatus = httpStatus
        self.errors = errors
        if not self.errors:
            self.errors = []
        Exception.__init__(self, 'API returned with HTTP status %s' % httpStatus)
    
    def get_error_codes(self):
        '''
        Return list of error codes
        '''
        return [x['errorCode'] for x in self.errors]

class RemoteAPITimeoutException(Exception):
    '''
    Exception raised when remote API request fails due to timeout
    '''


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

class ArtifactAlreadyExistsException(DetailedSaveException):
    '''
    Exception raised when artifact title already exists.
    '''

class RosettaValidationException(DetailedSaveException):
    '''
    Exception raised on rosetta validation error
    '''
    def __init__(self,message):
        Exception.__init__(self,message)

class InvalidImageException(DetailedSaveException):
    '''
    Exception raised on the presence invalid image endpoints in the html 
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

class ArtifactNotLatestException(DetailedSaveException):
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

class DuplicateChapterTitleException(DetailedSaveException):
    '''
    Exception raised by backend when there are more than one chapters
    with same title in a book payload
    '''

class EmptyArtifactTitleException(DetailedSaveException):
    '''
    Exception raised by backend when the title/ handle is empty
    or contains only special characters which are split by backend
    '''

class DuplicateEncodedIDException(DetailedSaveException):
    '''
    Exception raised by backend when there are duplicate EncodedID
    '''

class InvalidDomainEIDEncodedIDException(DetailedSaveException):
    '''
    Exception raised by backend when there problem with EncodedID or DomainEID 
    '''

class SaveTimeoutException(DetailedSaveException):
    '''
    Exception raised when save API times out
    '''
