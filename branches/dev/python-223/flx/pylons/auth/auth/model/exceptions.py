from auth.controllers.errorCodes import ErrorCodes

class InvalidArtifactException(Exception):
    pass

class MissingArgumentException(Exception):
    pass

class AlreadyExistsException(Exception):
    pass

class InvalidArgumentException(Exception):
    pass

class WrongTypeException(Exception):
    pass

class NotFoundException(Exception):
    pass

class UnauthorizedException(Exception):
    pass

class ResourceTooLargeException(Exception):
    pass

class DuplicateResourceException(Exception):
    pass

class DuplicateTitleException(Exception):
    pass

class DuplicateDownloadTypeException(Exception):
    pass

class DuplicateDownloadTypeException(Exception):
    pass

class InvalidEmbedCode(Exception):
    pass

class InvalidLoginException(Exception):
    pass

class InvalidEmailException(Exception):
    pass

class AlreadyLoggedInException(Exception):
    pass

class TokenExpired(Exception):
    pass

class InvalidContentTypeException(Exception):
    pass
class InvalidHTTPMethodException(Exception):
    pass
class ResourceNotFoundException(Exception):
    pass
class ResourceAlreadyExistsException(Exception):
    pass
class SystemDataException(Exception):
    pass
class SystemImplementationException(Exception):
    pass
class SystemConfigurationException(Exception):
    pass
class SystemInternalException(Exception):
    pass
class AuthenticationRequiredException(Exception):
    pass

class ResourceBlacklistedException(Exception):
    pass
class InvalidLTIConsumerKeyException(Exception):
    pass	
	
class RemoteAPIStatusException(Exception):
    '''
    Exception raised when the remote API returns a response
    with a status_code other than 0 i.e 'OK'
    '''
    def __init__(self,status_code, api_message = None, response_data = None):
        self.status_code = status_code
        self.api_message = api_message
        self.response_data = response_data
        errorCodes = ErrorCodes()
        self.error = errorCodes.getName(status_code)
        if self.error:
            message = 'API returned status %s' % self.error
        else:
            message = 'API returned unknown status code = %s' % status_code 
        Exception.__init__(self, message)
