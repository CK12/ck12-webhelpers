class InvalidArtifactException(Exception):
    pass

class AlreadyExistsException(Exception):
    pass

class MissingArgumentException(Exception):
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

class EmptyArtifactHandleException(Exception):
    pass

class ExternalException(Exception):
    pass

class EdmodoAPIFailureException(Exception):
    pass

class LTIGradePassbackFailureException(Exception):
    pass

class TeacherAccessTokenNotFoundException(Exception):
    pass

class InvalidEmbedCode(Exception):
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

class UnknownArtifactTypeException(Exception):
    """
        Passed Artifact Type doesn't exist in Database
    """
    pass

class CannotCreateArtifactException(Exception):
    """
        Cannot create Artifact because of missing parameters such as title
    """
    pass

class NoSuchArtifactException(Exception):
    """
        Artifact doesn't exist in Database
    """
    
class CannotCreateLabelException(Exception):
    """
        Invalid label. A label can contain numbers, letters, spaces and hyphens
    """

class NoSuchCollectionException(Exception):
    """
        No such collection.
    """

class OldRevisionUpdateException(Exception):
    """
        Old revision has come up for update
    """

class DeprecatedDomainException(Exception):
    """
        This domain term is deprecated
    """
    def __init__(self, message, redirectedConcept):
        super(Exception, self).__init__(message)
        self.redirectedConcept = redirectedConcept
