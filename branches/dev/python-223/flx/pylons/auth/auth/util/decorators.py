from pylons import response
from auth.model import exceptions
from auth.controllers.responseStatusCodes import ResponseStatusCodes
from auth.controllers.errorCodes import ErrorCodes
from datetime import datetime
import logging
import json
import socket

def getValidArgs(validArgNames, **kwargs):
    validArgs = {}
    for validArgName in validArgNames:
        if kwargs.has_key(validArgName):
            validArgs[validArgName] = kwargs[validArgName]
    return validArgs

class responsify(object):
    hostName = socket.gethostname().encode('rot-13') if socket.gethostname() else None

    def __init__(self, argNames=[]):
        self.argNames = argNames

    def __call__(self, api):
        def responsify(apiSelf, *args, **kwargs):

            def _populateResponse(responseStatus, responseHeaders, responseDict):
                try:
                    responseBody = {}
                    responseBody['response'] = responseDict
                    responseBody['responseHeader'] = {
                        'time':str(endTime - startTime),
                        'status':0,
                        'source': self.hostName
                    }
                    responseBody = json.dumps(responseBody)
                except (Exception) as e:
                    logging.exception(e)
                    responseStatus = ResponseStatusCodes.INTERNAL_SERVER_ERROR
                    responseBody = {
                        'response' : {
                            'errors':[{
                                'errorCode':ErrorCodes.GENERIC_ERROR,
                                'errorMessage':str(e)
                            }]
                        },
                        'responseHeader':{
                            'time':str(endTime - startTime),
                            'status':-1,
                            'source': self.hostName
                        }
                    }
                    responseBody = json.dumps(responseBody)
                
                response.status = responseStatus
                response.headers.update(responseHeaders)
                response.content_type = 'application/json'
                response.charset = 'utf-8'
                response.body = responseBody

            startTime = datetime.now()
            try:
                validArgs = getValidArgs(self.argNames, **kwargs)
                responseDict = api(apiSelf, **validArgs)
                if responseDict.get('redirectRequest') and responseDict.get('redirectURL'):
                    responseStatus = ResponseStatusCodes.SEE_OTHER
                    responseHeaders = {'Location':responseDict.get('redirectURL')}
                else:
                    responseStatus = ResponseStatusCodes.OK
                    responseHeaders = {}
            except (exceptions.InvalidHTTPMethodException) as e:
                logging.exception(e)
                responseStatus = ResponseStatusCodes.INVALID_HTTP_METHOD
                responseHeaders = {}
                responseDict = {
                    'errors':[{
                        'errorCode':ErrorCodes.INVALID_ARGUMENT,
                        'errorMessage':str(e)
                    }]   
                }
            except (exceptions.InvalidContentTypeException) as e:
                logging.exception(e)
                responseStatus = ResponseStatusCodes.INVALID_CONTENT_TYPE
                responseHeaders = {}
                responseDict = {
                    'errors':[{
                        'errorCode':ErrorCodes.INVALID_ARGUMENT,
                        'errorMessage':str(e)
                    }]
                }
            except (exceptions.AuthenticationRequiredException) as e:
                logging.exception(e)
                responseStatus = ResponseStatusCodes.AUTHENTICATION_REQUIRED
                responseHeaders = {}
                responseDict = {
                    'errors':[{
                        'errorCode':ErrorCodes.AUTHENTICATION_REQUIRED,
                        'errorMessage':str(e)
                    }]
                }
            except (exceptions.UnauthorizedException) as e:
                logging.exception(e)
                responseStatus = ResponseStatusCodes.UNAUTHORIZED_OPERATION
                responseHeaders = {}
                responseDict = {
                    'errors':[{
                        'errorCode':ErrorCodes.UNAUTHORIZED_OPERATION,
                        'errorMessage':str(e)
                    }]
                }
            except (exceptions.InvalidArgumentException, exceptions.ResourceNotFoundException, exceptions.ResourceAlreadyExistsException) as e:
                logging.exception(e)
                responseStatus = ResponseStatusCodes.BAD_REQUEST
                responseHeaders = {}
                responseDict = {
                    'errors':[{
                        'errorCode':ErrorCodes.INVALID_ARGUMENT,
                        'errorMessage':str(e)
                    }]
                }
            except (exceptions.SystemDataException, exceptions.SystemInternalException, exceptions.SystemImplementationException, exceptions.SystemConfigurationException, Exception) as e:
                logging.exception(e)
                responseStatus = ResponseStatusCodes.INTERNAL_SERVER_ERROR
                responseHeaders = {}
                responseDict = {
                    'errors':[{
                        'errorCode':ErrorCodes.GENERIC_ERROR,
                        'errorMessage':str(e)
                    }]
                }
            endTime = datetime.now()
            _populateResponse(responseStatus, responseHeaders, responseDict)

        return responsify