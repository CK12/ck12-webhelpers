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

from pylons.i18n.translation import _

class ErrorCodes(object):

    #######################################
    # Error codes 
    #######################################
    OK = 0

    REQUIRED_PARAMS_MISSING = 1000

    UNKNOWN_MEMBER = 1001
    CANNOT_CREATE_MEMBER = 1002
    CANNOT_CREATE_BROWSE_TERM = 1003
    CANNOT_CREATE_BROWSE_TERM_ASSOCIATION = 1004
    CANNOT_CREATE_STANDARD = 1005
    CANNOT_CREATE_STANDARD_ASSOCIATION = 1006
    CANNOT_CREATE_FEEDBACK = 1007
    CANNOT_CREATE_ARTIFACT = 1008
    AUTHENTICATION_REQUIRED = 1009
    CANNOT_PUBLISH_ARTIFACT = 1010
    UNAUTHORIZED_OPERATION = 1011
    CANNOT_DELETE_ARTIFACT = 1012
    CANNOT_CREATE_OVERLAY = 1013
    CANNOT_CREATE_ANNOTATION = 1014
    CANNOT_CREATE_BROWSE_TERM_SYNONYM = 1015
    CANNOT_LOAD_BROWSE_TERM_DATA = 1016
    CANNOT_CREATE_INDEX = 1017
    CANNOT_UPDATE_INDEX = 1018
    CANNOT_UPDATE_MEMBER = 1019
    CANNOT_UPDATE_RESOURCE_HASH = 1020
    CANNOT_CREATE_RESOURCE = 1021
    CANNOT_UPDATE_RESOURCE = 1022
    CANNOT_DELETE_RESOURCE = 1023
    CANNOT_CREATE_RESOURCE_ASSOCIATION = 1024
    CANNOT_DELETE_RESOURCE_ASSOCIATION = 1025
    CANNOT_DELETE_FEEDBACK = 1026
    CANNOT_IMPORT_XDT_DATA = 1027
    CANNOT_EXPORT_XDT_DATA = 1028
    CANNOT_REGISTER_APP = 1029
    CANNOT_IMPORT_FROM_WIKI = 1030
    ALREADY_ACTIVATED_MEMBER = 1031
    LOGIN_BEING_USED_ALREADY = 1032
    CANNOT_CREATE_FAVORITE = 1033
    CANNOT_DELETE_FAVORITE = 1034
    FAVORITE_ALREADY_EXIST = 1034
    CANNOT_CREATE_FEATURED_ARTIFACT = 1035
    CANNOT_DELETE_FEATURED_ARTIFACT = 1036
    CANNOT_GET_FEATURED_ARTIFACT_LIST = 1037
    ARTIFACT_ALREADY_EXIST = 1038
    CANNOT_LOAD_BROWSE_CANDIDATE_DATA = 1039
    ALREADY_LOGGED_IN = 1040
    CANNOT_UPDATE_ARTIFACT = 1041
    CANNOT_CREATE_EMBEDDED_OBJECT = 1042
    CANNOT_UPDATE_EMBEDDED_OBJECT_PROVIDER = 1043
    CANNOT_CREATE_ABUSE_REPORT = 1044
    CANNOT_UPDATE_ABUSE_REPORT = 1045
    AUTHENTICATION_REJECTED = 1046
    AUTHENTICATION_FAILED = 1047
    LOGIN_REQUIRED = 1048
    MEMBER_INTERACTION_NEEDED = 1049
    CANNOT_CREATE_EMBEDDED_OBJECT_PROVIDER = 1050
    CANNOT_IMPORT_GDT_DATA = 1051
    CANNOT_EXPORT_GDT_DATA = 1052
    CANNOT_IMPORT_FROM_ZIP = 1053
    CANNOT_CONVERT_GDT2EPUB = 1054
    CANNOT_IMPORT_CONCEPT_MAP = 1055
    CANNOT_CREATE_MATH_CACHE = 1056
    CANNOT_CREATE_NOTIFICATION = 1057
    CANNOT_UPDATE_NOTIFICATION = 1058
    CANNOT_DELETE_NOTIFICATION = 1059

    RESOURCE_ALREADY_EXISTS = 1073
    EMBEDDED_OBJECT_PROVIDER_ALREADY_EXISTS = 1074

    UNKNOWN_ARTIFACT_TYPE = 2001
    NO_SUCH_ARTIFACT = 2002
    NO_SUCH_BOOK = 2003
    NO_SUCH_CHAPTER = 2004
    FORMAT_NOT_SUPPORTED = 2005
    NO_SUCH_BROWSE_TERM = 2006
    NO_SUCH_COUNTRY = 2007
    NO_SUCH_STANDARD = 2008
    NO_SUCH_LESSON = 2009
    NO_SUCH_CONCEPT = 2010
    NO_SUCH_MEMBER = 2011
    NO_SUCH_STATE = 2012
    NO_SUCH_OVERLAY = 2013
    NO_SUCH_ANNOTATION = 2014
    RETRIEVAL_ERROR = 2015
    NO_SUCH_TASK = 2016
    NO_SUCH_FEEDBACK = 2017
    NO_SUCH_RESOURCE = 2018
    NO_SUCH_FAVORITE = 2019
    NO_SUCH_FEATURED_ARTIFACT = 2020
    UNKNOWN_REALM_TYPE = 2021
    INVALID_VERSION = 2022
    NO_SUCH_BROWSE_CANDIDATE = 2023
    NO_SUCH_BROWSE_CATEGORY = 2024
    UNKNOWN_RESOURCE_TYPE = 2025
    NO_SUCH_EMBEDDED_OBJECT = 2026
    NO_SUCH_EMBEDDED_OBJECT_PROVIDER = 2027
    FORBIDDEN_EMBEDDED_OBJECT = 2028
    FORBIDDEN_RESOURCE = 2029
    NO_SUCH_ABUSE_REPORT = 2030
    NO_SUCH_APPROVAL_DOMAIN = 2031
    VALIDATION_FAILED = 2032
    NOT_AUTHORIZED_TO_PRINT = 2033
    NO_SUCH_NOTIFICATION = 2034

    CANNOT_CREATE_WORKSHEET = 3015
    CANNOT_UPLOAD_EXERCISES = 3035

    CANNOT_GET_DOWNLOADCOUNT  = 4001
    CANNOT_GET_DOWNLOADSTATSTYPES  = 4002
    CANNOT_UPDATE_DOWNLOADSTATS  = 4002
    CANNOT_ADD_DOWNLOADSTATSTYPE  = 4003
    CANNOT_DELETE_DOWNLOADSTATSTYPE  = 4003
 
    CANNOT_CREATE_GROUP = 5001
    CANNOT_UPDATE_GROUP = 5002
    CANNOT_DELETE_GROUP = 5003
    NO_SUCH_GROUP = 5004
    CANNOT_ADD_MEMBER_TO_GROUP = 5005
    CANNOT_DELETE_MEMBER_FROM_GROUP = 5006
    UNABLE_TO_GET_MEMBERS = 5007
    CANNOT_ACTIVATE_GROUP_MEMBER = 5008
    CANNOT_DECLINE_GROUP_MEMBER = 5009
    GROUP_ALREADY_EXISTS = 5010

    #LMS Related
    NO_SUCH_LMS_PROVIDER = 6001
    NO_SUCH_LMS_PROVIDER_APP = 6002

    NO_SUCH_ASSIGNMENT = 2051

    GENERIC_ERROR = 1000000

    #######################################
    # Error descriptions 
    #######################################
    _errorDesc = {}

    _errorDesc[OK] = { 'name':'OK' }

    _errorDesc[UNKNOWN_MEMBER] = { 'name':'UNKNOWN_MEMBER' }
    _errorDesc[CANNOT_CREATE_MEMBER] = { 'name':'CANNOT_CREATE_MEMBER' }
    _errorDesc[CANNOT_CREATE_BROWSE_TERM] = { 'name':'CANNOT_CREATE_BROWSE_TERM' }
    _errorDesc[CANNOT_CREATE_BROWSE_TERM_ASSOCIATION] = { 'name':'CANNOT_CREATE_BROWSE_TERM_ASSOCIATION' }
    _errorDesc[CANNOT_CREATE_STANDARD] = { 'name':'CANNOT_CREATE_STANDARD' }
    _errorDesc[CANNOT_CREATE_STANDARD_ASSOCIATION] = { 'name':'CANNOT_CREATE_STANDARD_ASSOCIATION' }
    _errorDesc[CANNOT_CREATE_FEEDBACK] = { 'name':'CANNOT_CREATE_FEEDBACK' }
    _errorDesc[CANNOT_CREATE_ARTIFACT] = { 'name':'CANNOT_CREATE_ARTIFACT' }
    _errorDesc[AUTHENTICATION_REQUIRED] = { 'name':'AUTHENTICATION_REQUIRED' }
    _errorDesc[CANNOT_PUBLISH_ARTIFACT] = { 'name':'CANNOT_PUBLISH_ARTIFACT' }
    _errorDesc[UNAUTHORIZED_OPERATION] = { 'name':'UNAUTHORIZED_OPERATION' }
    _errorDesc[CANNOT_DELETE_ARTIFACT] = { 'name':'CANNOT_DELETE_ARTIFACT' }
    _errorDesc[CANNOT_CREATE_OVERLAY] = { 'name':'CANNOT_CREATE_OVERLAY' }
    _errorDesc[CANNOT_CREATE_ANNOTATION] = { 'name':'CANNOT_CREATE_ANNOTATION' }
    _errorDesc[CANNOT_CREATE_BROWSE_TERM_SYNONYM] = { 'name':'CANNOT_CREATE_BROWSE_TERM_SYNONYM' }
    _errorDesc[CANNOT_LOAD_BROWSE_TERM_DATA] = { 'name':'CANNOT_LOAD_BROWSE_TERM_DATA' }
    _errorDesc[CANNOT_CREATE_INDEX] = { 'name':'CANNOT_CREATE_INDEX' }
    _errorDesc[CANNOT_UPDATE_INDEX] = { 'name':'CANNOT_UPDATE_INDEX' }
    _errorDesc[CANNOT_UPDATE_MEMBER] = { 'name':'CANNOT_UPDATE_MEMBER' }
    _errorDesc[CANNOT_UPDATE_RESOURCE_HASH] = { 'name':'CANNOT_UPDATE_RESOURCE_HASH' }
    _errorDesc[CANNOT_CREATE_RESOURCE] = { 'name':'CANNOT_CREATE_RESOURCE' }
    _errorDesc[CANNOT_UPDATE_RESOURCE] = { 'name':'CANNOT_UPDATE_RESOURCE' }
    _errorDesc[CANNOT_DELETE_RESOURCE] = { 'name':'CANNOT_DELETE_RESOURCE' }
    _errorDesc[CANNOT_CREATE_RESOURCE_ASSOCIATION] = { 'name':'CANNOT_CREATE_RESOURCE_ASSOCIATION' }
    _errorDesc[CANNOT_DELETE_RESOURCE_ASSOCIATION] = { 'name':'CANNOT_DELETE_RESOURCE_ASSOCIATION' }
    _errorDesc[CANNOT_DELETE_FEEDBACK] = { 'name':'CANNOT_DELETE_FEEDBACK' }
    _errorDesc[CANNOT_IMPORT_XDT_DATA] = { 'name':'CANNOT_IMPORT_XDT_DATA' }
    _errorDesc[CANNOT_EXPORT_XDT_DATA] = { 'name':'CANNOT_EXPORT_XDT_DATA' }
    _errorDesc[CANNOT_REGISTER_APP] = { 'name':'CANNOT_REGISTER_APP' }
    _errorDesc[CANNOT_IMPORT_FROM_WIKI] = { 'name':'CANNOT_IMPORT_FROM_WIKI' }
    _errorDesc[ALREADY_ACTIVATED_MEMBER] = { 'name':'ALREADY_ACTIVATED_MEMBER' }
    _errorDesc[LOGIN_BEING_USED_ALREADY] = { 'name':'LOGIN_BEING_USED_ALREADY' }
    _errorDesc[CANNOT_CREATE_FAVORITE] = { 'name':'CANNOT_CREATE_FAVORITE' }
    _errorDesc[CANNOT_DELETE_FAVORITE] = { 'name':'CANNOT_DELETE_FAVORITE' }
    _errorDesc[FAVORITE_ALREADY_EXIST] = { 'name':'FAVORITE_ALREADY_EXIST' }
    _errorDesc[CANNOT_CREATE_FEATURED_ARTIFACT] = { 'name':'CANNOT_CREATE_FEATURED_ARTIFACT' }
    _errorDesc[CANNOT_DELETE_FEATURED_ARTIFACT] = { 'name':'CANNOT_DELETE_FEATURED_ARTIFACT' }
    _errorDesc[CANNOT_GET_FEATURED_ARTIFACT_LIST] = { 'name':'CANNOT_GET_FEATURED_ARTIFACT_LIST' }
    _errorDesc[ARTIFACT_ALREADY_EXIST] = { 'name':'ARTIFACT_ALREADY_EXIST' }
    _errorDesc[CANNOT_LOAD_BROWSE_CANDIDATE_DATA] = { 'name': 'CANNOT_LOAD_BROWSE_CANDIDATE_DATA' }
    _errorDesc[ALREADY_LOGGED_IN] = { 'name': 'ALREADY_LOGGED_IN' }
    _errorDesc[CANNOT_UPDATE_EMBEDDED_OBJECT_PROVIDER] = { 'name': 'CANNOT_UPDATE_EMBEDDED_OBJECT_PROVIDER' }
    _errorDesc[CANNOT_CREATE_ABUSE_REPORT] = { 'name': 'CANNOT_CREATE_ABUSE_REPORT' }
    _errorDesc[CANNOT_UPDATE_ABUSE_REPORT] = { 'name': 'CANNOT_UPDATE_ABUSE_REPORT' }
    _errorDesc[AUTHENTICATION_REJECTED] = { 'name': 'AUTHENTICATION_REJECTED' }
    _errorDesc[AUTHENTICATION_FAILED] = { 'name': 'AUTHENTICATION_FAILED' }
    _errorDesc[LOGIN_REQUIRED] = { 'name': 'LOGIN_REQUIRED' }
    _errorDesc[MEMBER_INTERACTION_NEEDED] = { 'name': 'MEMBER_INTERACTION_NEEDED' }
    _errorDesc[CANNOT_CREATE_EMBEDDED_OBJECT_PROVIDER] = {'name': 'CANNOT_CREATE_EMBEDDED_OBJECT_PROVIDER' }
    _errorDesc[CANNOT_IMPORT_GDT_DATA] = { 'name':'CANNOT_IMPORT_GDT_DATA' }
    _errorDesc[CANNOT_EXPORT_GDT_DATA] = { 'name':'CANNOT_EXPORT_GDT_DATA' }
    _errorDesc[CANNOT_CONVERT_GDT2EPUB] = { 'name':'CANNOT_CONVERT_GDT2EPUB' }
    _errorDesc[CANNOT_IMPORT_CONCEPT_MAP] = { 'name':'CANNOT_IMPORT_CONCEPT_MAP' }
    _errorDesc[CANNOT_CREATE_MATH_CACHE] = { 'name':'CANNOT_CREATE_MATH_CACHE' }
    _errorDesc[CANNOT_CREATE_NOTIFICATION] = { 'name':'CANNOT_CREATE_NOTIFICATION' }
    _errorDesc[CANNOT_UPDATE_NOTIFICATION] = { 'name':'CANNOT_UPDATE_NOTIFICATION' }
    _errorDesc[CANNOT_DELETE_NOTIFICATION] = { 'name':'CANNOT_DELETE_NOTIFICATION' }
    _errorDesc[CANNOT_UPLOAD_EXERCISES] = { 'name':'CANNOT_UPLOAD_EXERCISES' }
    

    _errorDesc[RESOURCE_ALREADY_EXISTS] = { 'name':'RESOURCE_ALREADY_EXISTS' }
    _errorDesc[EMBEDDED_OBJECT_PROVIDER_ALREADY_EXISTS] = { 'name': 'EMBEDDED_OBJECT_PROVIDER_ALREADY_EXISTS' }

    _errorDesc[UNKNOWN_ARTIFACT_TYPE] = { 'name':'UNKNOWN_ARTIFACT_TYPE' }
    _errorDesc[NO_SUCH_ARTIFACT] = { 'name':'NO_SUCH_ARTIFACT' }
    _errorDesc[NO_SUCH_BOOK] = { 'name':'NO_SUCH_BOOK' }
    _errorDesc[NO_SUCH_CHAPTER] = { 'name':'NO_SUCH_CHAPTER' }
    _errorDesc[FORMAT_NOT_SUPPORTED] = { 'name':'FORMAT_NOT_SUPPORTED' }
    _errorDesc[NO_SUCH_BROWSE_TERM] = { 'name':'NO_SUCH_BROWSE_TERM' }
    _errorDesc[NO_SUCH_COUNTRY] = { 'name':'NO_SUCH_COUNTRY' }
    _errorDesc[NO_SUCH_STANDARD] = { 'name':'NO_SUCH_STANDARD' }
    _errorDesc[NO_SUCH_LESSON] = { 'name':'NO_SUCH_LESSON' }
    _errorDesc[NO_SUCH_CONCEPT] = { 'name':'NO_SUCH_CONCEPT' }
    _errorDesc[NO_SUCH_MEMBER] = { 'name':'NO_SUCH_MEMBER' }
    _errorDesc[NO_SUCH_STATE] = { 'name':'NO_SUCH_STATE' }
    _errorDesc[NO_SUCH_OVERLAY] = { 'name':'NO_SUCH_OVERLAY' }
    _errorDesc[NO_SUCH_ANNOTATION] = { 'name':'NO_SUCH_ANNOTATION' }
    _errorDesc[RETRIEVAL_ERROR] = { 'name':'RETRIEVAL_ERROR' }
    _errorDesc[NO_SUCH_TASK] = { 'name':'NO_SUCH_TASK' }
    _errorDesc[NO_SUCH_FEEDBACK] = { 'name':'NO_SUCH_FEEDBACK' }
    _errorDesc[NO_SUCH_RESOURCE] = { 'name':'NO_SUCH_RESOURCE' }
    _errorDesc[NO_SUCH_FAVORITE] = { 'name':'NO_SUCH_FAVORITE' }
    _errorDesc[NO_SUCH_FEATURED_ARTIFACT] = { 'name':'NO_SUCH_FEATURED_ARTIFACT' }
    _errorDesc[UNKNOWN_REALM_TYPE] = { 'name':'UNKNOWN_REALM_TYPE' }
    _errorDesc[INVALID_VERSION] = { 'name':'INVALID_VERSION' }
    _errorDesc[NO_SUCH_BROWSE_CANDIDATE] = { 'name':'NO_SUCH_BROWSE_CANDIDATE' }
    _errorDesc[NO_SUCH_BROWSE_CATEGORY] = { 'name':'NO_SUCH_BROWSE_CATEGORY' }
    _errorDesc[CANNOT_UPDATE_ARTIFACT] = { 'name':'CANNOT_UPDATE_ARTIFACT' }
    _errorDesc[CANNOT_CREATE_EMBEDDED_OBJECT] = { 'name':'CANNOT_CREATE_EMBEDDED_OBJECT' }
    _errorDesc[UNKNOWN_RESOURCE_TYPE] = { 'name':'UNKNOWN_RESOURCE_TYPE' }
    _errorDesc[NO_SUCH_EMBEDDED_OBJECT] = { 'name':'NO_SUCH_EMBEDDED_OBJECT' }
    _errorDesc[NO_SUCH_EMBEDDED_OBJECT_PROVIDER] = { 'name':'NO_SUCH_EMBEDDED_OBJECT_PROVIDER' }
    _errorDesc[FORBIDDEN_EMBEDDED_OBJECT] = { 'name':'FORBIDDEN_EMBEDDED_OBJECT' }
    _errorDesc[FORBIDDEN_RESOURCE] = { 'name': 'FORBIDDEN_RESOURCE' }
    _errorDesc[NO_SUCH_ABUSE_REPORT] = { 'name':'NO_SUCH_ABUSE_REPORT' }
    _errorDesc[NO_SUCH_APPROVAL_DOMAIN] = { 'name':'NO_SUCH_APPROVAL_DOMAIN' }
    _errorDesc[VALIDATION_FAILED] = { 'name':'VALIDATION_FAILED' }
    _errorDesc[NOT_AUTHORIZED_TO_PRINT] = {'name':'NOT_AUTHORIZED_TO_PRINT' }
    _errorDesc[CANNOT_CREATE_WORKSHEET] = { 'name':' CANNOT CREATE WORKSHEET' }
    _errorDesc[CANNOT_GET_DOWNLOADCOUNT] = { 'name':'CANNOT_GET_DOWNLOADCOUNT' }
    _errorDesc[NO_SUCH_NOTIFICATION] = { 'name': 'NO_SUCH_NOTIFICATION' }

    _errorDesc[CANNOT_CREATE_GROUP] = { 'name': 'CANNOT_CREATE_GROUP' }
    _errorDesc[CANNOT_UPDATE_GROUP] = { 'name': 'CANNOT_UPDATE_GROUP' }
    _errorDesc[CANNOT_DELETE_GROUP] = { 'name': 'CANNOT_DELETE_GROUP' }
    _errorDesc[NO_SUCH_GROUP] = { 'name': 'NO_SUCH_GROUP' }
    _errorDesc[CANNOT_ADD_MEMBER_TO_GROUP] = { 'name': 'CANNOT_ADD_MEMBER_TO_GROUP' }
    _errorDesc[CANNOT_DELETE_MEMBER_FROM_GROUP] = { 'name': 'CANNOT_DELETE_MEMBER_FROM_GROUP' }
    _errorDesc[UNABLE_TO_GET_MEMBERS] = { 'name': 'UNABLE_TO_GET_MEMBERS' }
    _errorDesc[CANNOT_ACTIVATE_GROUP_MEMBER] = { 'name': 'CANNOT_ACTIVATE_GROUP_MEMBER' }
    _errorDesc[CANNOT_DECLINE_GROUP_MEMBER] = { 'name': 'CANNOT_DECLINE_GROUP_MEMBER' }
    _errorDesc[GROUP_ALREADY_EXISTS] = { 'name': 'GROUP_ALREADY_EXISTS' }

    @staticmethod
    def get(id):
        errorCode = int(id)
        if ErrorCodes._errorDesc.has_key(errorCode):
            error = ErrorCodes._errorDesc[errorCode]
        else:
            error = {'name':'Error %s' % id}
        return error 

    @staticmethod
    def get_description(id):
        error = ErrorCodes.get(id)
        if error:
            if 'desc' in error:
                return error['desc']
            else:
                return 'Description for %s' % error['name']
        else:
            return 'unknown error code=%s' % id