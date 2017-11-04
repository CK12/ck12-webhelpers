
class UnauthorizedException(Exception):
    pass

class ActivityPausedException(Exception):
    def __init__(self, message, infoDict={}):
        Exception.__init__(self, message)
        self.infoDict = infoDict

class ActivityCompletedException(Exception):
    def __init__(self, message, infoDict={}):
        Exception.__init__(self, message)
        self.infoDict = infoDict

class MissingArgumentException(Exception):
    pass
