class WrongTypeException(Exception):

    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)

class UnauthorizedException(Exception):

    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)


class ExternalException(Exception):
    pass
class NotFoundException(Exception):
    pass
class AlreadyExistsException(Exception):
    pass
class MissingArgumentException(Exception):
    pass
class InvalidArgumentException(Exception):
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
