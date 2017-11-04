class ErrorCodes:
    OK = 0

    AUTHENTICATION_REQUIRED = 1009
    UNAUTHORIZED_OPERATION = 1011
    MEMBER_NOT_IN_GROUP = 5013    

    # Client Related
    CANNOT_REGISTER_CLIENT = 2001
    CANNOT_UPDATE_CLIENT = 2002
    CANNOT_UNREGISTER_CLIENT = 2003
    CANNOT_GET_CLIENT = 2004
    CANNOT_GET_CLIENTS = 2004

    # Event Related
    CANNOT_REGISTER_EVENT = 3001
    CANNOT_UNREGISTER_EVENT = 3002
    CANNOT_RECORD_EVENT = 3003

    # Rule Related
    CANNOT_REGISTER_RULE = 4001
    CANNOT_UNREGISTER_RULE = 4002
    CANNOT_RECORD_RULE = 4003

    # Parameter Related
    CANNOT_REGISTER_PARAMETER = 5001
    CANNOT_UNREGISTER_PARAMETER = 5002
    CANNOT_UPDATE_PARAMETER = 5003
    CANNOT_GET_PARAMETER = 5004

    # Aggregation Related
    CANNOT_AGGREGATE = 6001

    # Event task Related
    CANNOT_REGISTER_EVENTTASK = 7001
    CANNOT_UPDATE_EVENTTASK = 7002
    CANNOT_UNREGISTER_EVENTTASK = 7003
    CANNOT_GET_EVENTTASK = 7004
    CANNOT_GET_EVENTTASKS = 7004

    # Entity related
    CANNOT_GET_ENTITY = 8001

    # ADS API Related
    CANNOT_GET_FBS_DOWNLOAD = 9001
    CANNOT_GET_ASSESSMENT_COUNT = 9002
    CANNOT_GET_LMS_INSTALL_COUNT = 9003

    # Pageview API Related
    CANNOT_GET_PAGEVIEW_COUNT = 10001
    CANNOT_GET_PAGEVIEW_ARTIFACTS = 10002

    CANNOT_GET_PAGETYPE = 10003

    CANNOT_UPDATE_CONTENT_SUMMARY = 11001

    CANNOT_GET_SCHOOLS = 12001
    CANNOT_GET_SCHOOL_ARTIFACTS = 12002
    CANNOT_CREATE_SCHOOL = 12003
    CANNOT_ASSOCIATE_ARTIFACT = 12004
    CANNOT_UPDATE_SCHOOL_ARTIFACT = 12005
    CANNOT_GET_SCHOOL_COUNTS = 12006

    CANNOT_GET_TRENDING_MODALITIES = 13001

    UNKNOWN_ERROR  = 5000

    errorDesc = {}

    def __init__(self):
        self.errorDesc[self.OK] = { 'name':'OK' }

        self.errorDesc[self.UNKNOWN_ERROR] = { 'name':'UNKNOWN ERROR' }

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
