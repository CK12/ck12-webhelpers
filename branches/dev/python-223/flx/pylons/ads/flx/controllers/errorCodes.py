class ErrorCodes:
    OK = 0

    UNKNOWN_MEMBER = 1001
    AUTHENTICATION_REQUIRED = 1002
    
    ADS_CANNOT_REGISTER_DIMENSION = 5001
    ADS_CANNOT_REGISTER_METRIC = 5002
    ADS_CANNOT_REGISTER_EVENTGROUP = 5003
    ADS_CANNOT_REGISTER_EVENT = 5004
    ADS_CANNOT_ADD_HIERARCHY = 5005
    ADS_CANNOT_ADD_LEVEL = 5006
    ADS_CANNOT_SET_DIMENSION_LOAD_SCRIPT = 5007
    ADS_CANNOT_LOAD_DIMENSION = 5008
    ADS_CANNOT_PROCESS_EVENT = 5009
    ADS_CANNOT_PROCESS_QUERY = 5010

    ADS_GUIDANCE_ERROR = 6001
    
    errorDesc = {}

    def __init__(self):
        self.errorDesc[self.OK] = { 'name':'OK' }
        self.errorDesc[self.UNKNOWN_MEMBER] = { 'name':'UNKNOWN_MEMBER' }
        self.errorDesc[self.AUTHENTICATION_REQUIRED] = { 'name':'AUTHENTICATION_REQUIRED' }
        
        self.errorDesc[self.ADS_CANNOT_REGISTER_DIMENSION] = { 'name': 'ADS_CANNOT_REGISTER_DIMENSION' }
        self.errorDesc[self.ADS_CANNOT_REGISTER_METRIC] = { 'name': 'ADS_CANNOT_REGISTER_METRIC' }
        self.errorDesc[self.ADS_CANNOT_REGISTER_EVENTGROUP] = { 'name': 'ADS_CANNOT_REGISTER_EVENTGROUP' }
        self.errorDesc[self.ADS_CANNOT_REGISTER_EVENT] = { 'name': 'ADS_CANNOT_REGISTER_EVENT' }
        self.errorDesc[self.ADS_CANNOT_ADD_HIERARCHY] = { 'name': 'ADS_CANNOT_ADD_HIERARCHY' }
        self.errorDesc[self.ADS_CANNOT_ADD_LEVEL] = { 'name': 'ADS_CANNOT_ADD_LEVEL' }
        self.errorDesc[self.ADS_CANNOT_SET_DIMENSION_LOAD_SCRIPT] = { 'name': 'ADS_CANNOT_SET_DIMENSION_LOAD_SCRIPT' }
        self.errorDesc[self.ADS_CANNOT_LOAD_DIMENSION] = { 'name': 'ADS_CANNOT_LOAD_DIMENSION' }
        self.errorDesc[self.ADS_CANNOT_PROCESS_EVENT] = { 'name': 'ADS_CANNOT_PROCESS_EVENT' }
        self.errorDesc[self.ADS_CANNOT_PROCESS_QUERY] = { 'name': 'ADS_CANNOT_PROCESS_QUERY' }

        self.errorDesc[self.ADS_GUIDANCE_ERROR] = { 'name': 'ADS_GUIDANCE_ERROR' }

    def asDict(self, errorCode, message=None, infoDict=None):
        errDict = {
                    'responseHeader':{'status':errorCode, 'QTime':0},
                    'response':{
                    },
                  }
        if message is not None:
            errDict['response']['message'] = message
        if infoDict is not None:
            errDict['response'].update(infoDict)
        return errDict

    def getName(self, id):
        errorCode = int(id)
        if self.errorDesc.has_key(errorCode):
            errorDesc = self.errorDesc[errorCode]
            name = errorDesc['name']
        else:
            name = 'UNKNOWN ERROR'
        return name

    def getDescription(self, id):
        errorCode = int(id)
        if self.errorDesc.has_key(errorCode):
            errorDesc = self.errorDesc[errorCode]
            name = errorDesc['name']
            desc = u'The description of error %s' % name
        else:
            name = 'UNKNOWN ERROR'
            desc = 'Unknow error code %d' % id
        return name, desc
