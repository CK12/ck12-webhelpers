class ErrorCodes:
    OK = 0

    UNKNOWN_MEMBER = 1001
    CANNOT_LOAD_CONCEPT_NODE_DATA = 1002
    AUTHENTICATION_ERROR = 1003
    AUTHENTICATION_REQUIRED = 1004
    CANNOT_EXPORT_CONCEPT_NODE_DATA = 1005
    INSUFFICIENT_PRIVILEGES = 1006
    CANNOT_EXPORT_ARTIFACT_EXTENSION_TYPE_DATA = 1005
    CANNOT_CREATE_CONCEPT_NODE = 1006
    CANNOT_CREATE_ARTIFACT_EXTENSION_TYPE = 1007
    CANNOT_CREATE_SUBJECT = 1008
    CANNOT_CREATE_BRANCH = 1009
    CANNOT_CREATE_CONCEPT_NODE_NEIGHBOR = 1010
    CANNOT_DELETE_CONCEPT_NODE_NEIGHBOR = 1011
    AUTHENTICATION_REJECTED = 1012
    CANNOT_ASSOCIATE_CONCEPT_NODE_WITH_KEYWORD = 1013
    CANNOT_DELETE_CONCEPT_NODE_KEYWORD_ASSOCIATION = 1014
    CANNOT_DELETE_ARTIFACT_EXTENSION_TYPE = 1015
    CANNOT_DELETE_SUBJECT = 1016
    CANNOT_DELETE_BRANCH = 1017
    CANNOT_CREATE_CONCEPT_NODE_INSTANCE = 1018
    CANNOT_CREATE_NODE_ATTRIBUTE = 1019
    CANNOT_CREATE_NODE_RELATION = 1020
    CANNOT_UPDATE_ARTIFACT_EXTENSION_TYPE = 1021
    CANNOT_DELETE_CONCEPT_NODE = 1022
    CANNOT_CREATE_CONCEPT_NODE_PREREQUIRES = 1023

    CANNOT_CREATE_COURSE_NODE = 1030
    CANNOT_CREATE_COURSE_FLOW = 1031
    CANNOT_GET_COURSE_FLOW = 1032
    CANNOT_UPDATE_COURSE_NODE = 1033

    CANNOT_CREATE_UNIT_NODE = 1040
    CANNOT_UPDATE_UNIT_NODE = 1041

    NO_SUCH_CONCEPT_NODE = 2001
    NO_SUCH_ARTIFACT_EXTENSION_TYPE = 2002
    NO_SUCH_SUBJECT = 2003
    NO_SUCH_BRANCH = 2004
    NO_SUCH_COURSE_NODE = 2005
    NO_SUCH_KEYWORD = 2005
    NO_SUCH_NODE = 2006

    INVALID_ARGUMENT = 2007
    AUTHENTICATION_REQUIRED = 1024
    UNAUTHORIZED_OPERATION = 1025
    GENERIC_ERROR = 1000000

    
    errorDesc = {}

    def __init__(self):
        self.errorDesc[self.OK] = { 'name':'OK' }
        self.errorDesc[self.UNKNOWN_MEMBER] = { 'name':'UNKNOWN_MEMBER' }
        self.errorDesc[self.CANNOT_LOAD_CONCEPT_NODE_DATA] = { 'name':'CANNOT_LOAD_CONCEPT_NODE_DATA' }
        self.errorDesc[self.AUTHENTICATION_ERROR] = { 'name':'AUTHENTICATION_ERROR' }
        self.errorDesc[self.AUTHENTICATION_REQUIRED] = { 'name':'AUTHENTICATION_REQUIRED' }
        self.errorDesc[self.CANNOT_EXPORT_CONCEPT_NODE_DATA] = { 'name':'CANNOT_EXPORT_CONCEPT_NODE_DATA' }
        self.errorDesc[self.INSUFFICIENT_PRIVILEGES] = { 'name':'INSUFFICIENT_PRIVILEGES' }
        self.errorDesc[self.CANNOT_EXPORT_ARTIFACT_EXTENSION_TYPE_DATA] = { 'name':'CANNOT_EXPORT_ARTIFACT_EXTENSION_TYPE_DATA' }
        self.errorDesc[self.CANNOT_CREATE_CONCEPT_NODE] = { 'name':'CANNOT_CREATE_CONCEPT_NODE' }
        self.errorDesc[self.CANNOT_CREATE_ARTIFACT_EXTENSION_TYPE] = { 'name':'CANNOT_CREATE_ARTIFACT_EXTENSION_TYPE' }
        self.errorDesc[self.CANNOT_UPDATE_ARTIFACT_EXTENSION_TYPE] = { 'name':'CANNOT_UPDATE_ARTIFACT_EXTENSION_TYPE' }
        self.errorDesc[self.CANNOT_CREATE_SUBJECT] = { 'name':'CANNOT_CREATE_SUBJECT' }
        self.errorDesc[self.CANNOT_CREATE_BRANCH] = { 'name':'CANNOT_CREATE_BRANCH' }
        self.errorDesc[self.CANNOT_CREATE_CONCEPT_NODE_NEIGHBOR] = { 'name':'CANNOT_CREATE_CONCEPT_NODE_NEIGHBOR' }
        self.errorDesc[self.CANNOT_DELETE_CONCEPT_NODE_NEIGHBOR] = { 'name':'CANNOT_DELETE_CONCEPT_NODE_NEIGHBOR' }
        self.errorDesc[self.AUTHENTICATION_REJECTED] = { 'name':'AUTHENTICATION_REJECTED' }
        self.errorDesc[self.CANNOT_ASSOCIATE_CONCEPT_NODE_WITH_KEYWORD] = { 'name': 'CANNOT_ASSOCIATE_CONCEPT_NODE_WITH_KEYWORD' }
        self.errorDesc[self.CANNOT_DELETE_CONCEPT_NODE_KEYWORD_ASSOCIATION] = { 'name': 'CANNOT_DELETE_CONCEPT_NODE_KEYWORD_ASSOCIATION' }
        self.errorDesc[self.CANNOT_DELETE_ARTIFACT_EXTENSION_TYPE] = { 'name': 'CANNOT_DELETE_ARTIFACT_EXTENSION_TYPE' }
        self.errorDesc[self.CANNOT_DELETE_SUBJECT] = { 'name':'CANNOT_DELETE_SUBJECT' }
        self.errorDesc[self.CANNOT_DELETE_BRANCH] = { 'name':'CANNOT_DELETE_BRANCH' }
        self.errorDesc[self.CANNOT_CREATE_NODE_ATTRIBUTE] = { 'name':'CANNOT_CREATE_NODE_ATTRIBUTE' }
        self.errorDesc[self.CANNOT_CREATE_NODE_RELATION] = { 'name':'CANNOT_CREATE_NODE_RELATION' }
        self.errorDesc[self.CANNOT_DELETE_CONCEPT_NODE] = { 'name':'CANNOT_DELETE_CONCEPT_NODE' }

        self.errorDesc[self.CANNOT_CREATE_COURSE_NODE] = { 'name':'CANNOT_CREATE_COURSE_NODE' }
        self.errorDesc[self.CANNOT_CREATE_COURSE_FLOW] = { 'name':'CANNOT_CREATE_COURSE_FLOW' }
        self.errorDesc[self.CANNOT_GET_COURSE_FLOW] = { 'name':'CANNOT_GET_COURSE_FLOW' }
        self.errorDesc[self.CANNOT_UPDATE_COURSE_NODE] = { 'name':'CANNOT_UPDATE_COURSE_NODE' }

        self.errorDesc[self.CANNOT_CREATE_UNIT_NODE]={'name':'CANNOT_CREATE_UNIT_NODE'}
        self.errorDesc[self.CANNOT_UPDATE_UNIT_NODE]={'name':'CANNOT_UPDATE_UNIT_NODE'}

        self.errorDesc[self.NO_SUCH_CONCEPT_NODE] = { 'name': 'NO_SUCH_CONCEPT_NODE' }
        self.errorDesc[self.NO_SUCH_ARTIFACT_EXTENSION_TYPE] = { 'name': 'NO_SUCH_ARTIFACT_EXTENSION_TYPE' }
        self.errorDesc[self.NO_SUCH_SUBJECT] = { 'name': 'NO_SUCH_SUBJECT' }
        self.errorDesc[self.NO_SUCH_BRANCH] = { 'name': 'NO_SUCH_BRANCH' }
        self.errorDesc[self.NO_SUCH_COURSE_NODE] = { 'name': 'NO_SUCH_COURSE_NODE' }
        self.errorDesc[self.NO_SUCH_KEYWORD] = { 'name': 'NO_SUCH_KEYWORD' }
        self.errorDesc[self.NO_SUCH_NODE] = { 'name': 'NO_SUCH_NODE' }

        self.errorDesc[self.INVALID_ARGUMENT] = { 'name': 'INVALID_ARGUMENT' }
        self.errorDesc[self.AUTHENTICATION_REQUIRED] = { 'name': 'AUTHENTICATION_REQUIRED' }
        self.errorDesc[self.UNAUTHORIZED_OPERATION] = { 'name': 'UNAUTHORIZED_OPERATION' }
        self.errorDesc[self.GENERIC_ERROR] = { 'name': 'GENERIC_ERROR' }


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
