from pylons.controllers import WSGIController
from pylons import request, response
from flx.logic.visitorBusinessManager import VisitorBusinessLogic
from flx.controllers import user
from flx.model import exceptions
from flx.controllers import decorators as dec1
from flx.util import decorators as dec2
import json

__controller__ = 'VisitorServiceController'

class VisitorServiceController(WSGIController):

    def __init__(self):
        self.businessLogic = VisitorBusinessLogic()

    @dec2.responsify(argNames=['visitorID']) 
    def getLastReadModalities(self, visitorID):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        if not visitorID or not isinstance(visitorID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid visitorID : [{visitorID}] is received.".format(visitorID=visitorID).encode('utf-8'))

        subjectEID = request.params.get('subjectEID')
        if subjectEID is not None:
            if not isinstance(subjectEID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid subjectEID : [{subjectEID}] is received.".format(subjectEID=subjectEID).encode('utf-8'))
        
        branchEID = request.params.get('branchEID')
        if branchEID is not None:
            if not isinstance(branchEID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid branchEID : [{branchEID}] is received.".format(branchEID=branchEID).encode('utf-8'))
       
        conceptEID = request.params.get('conceptEID')
        if conceptEID is not None:
            if not isinstance(conceptEID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid conceptEID : [{conceptEID}] is received.".format(conceptEID=conceptEID).encode('utf-8'))
         
        offSet = request.params.get('offSet')
        if offSet is not None:
            try :
                offSet=long(offSet)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
            if offSet <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
        else:
            offSet = 0;          
        
        limit = request.params.get('limit')
        if limit is not None:
            try :
                limit=long(limit)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
            if limit <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
        else:
            limit = 10;  

        lastReadModalityDictList = self.businessLogic.getLastReadModalities(visitorID=visitorID, subjectEID=subjectEID, branchEID=branchEID, conceptEID=conceptEID, offSet=offSet, limit=limit)
        responseDict = {'lastReadModalities':lastReadModalityDictList}
        return responseDict


    @dec2.responsify(argNames=['visitorID']) 
    def getLastReadConcepts(self, visitorID):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        if not visitorID or not isinstance(visitorID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid visitorID : [{visitorID}] is received.".format(visitorID=visitorID).encode('utf-8'))

        subjectEID = request.params.get('subjectEID')
        if subjectEID is not None:
            if not isinstance(subjectEID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid subjectEID : [{subjectEID}] is received.".format(subjectEID=subjectEID).encode('utf-8'))
        
        branchEID = request.params.get('branchEID')
        if branchEID is not None:
            if not isinstance(branchEID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid branchEID : [{branchEID}] is received.".format(branchEID=branchEID).encode('utf-8'))
       
        offSet = request.params.get('offSet')
        if offSet is not None:
            try :
                offSet=long(offSet)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
            if offSet <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
        else:
            offSet = 0;          
        
        limit = request.params.get('limit')
        if limit is not None:
            try :
                limit=long(limit)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
            if limit <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
        else:
            limit = 10;  

        lastReadConceptDictList = self.businessLogic.getLastReadConcepts(visitorID=visitorID, subjectEID=subjectEID, branchEID=branchEID, offSet=offSet, limit=limit)
        responseDict = {'lastReadConcepts':lastReadConceptDictList}
        return responseDict


    @dec2.responsify(argNames=['visitorID']) 
    def getLastReadBranches(self, visitorID):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        if not visitorID or not isinstance(visitorID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid visitorID : [{visitorID}] is received.".format(visitorID=visitorID).encode('utf-8'))

        subjectEID = request.params.get('subjectEID')
        if subjectEID is not None:
            if not isinstance(subjectEID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid subjectEID : [{subjectEID}] is received.".format(subjectEID=subjectEID).encode('utf-8'))
        
        offSet = request.params.get('offSet')
        if offSet is not None:
            try :
                offSet=long(offSet)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
            if offSet <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
        else:
            offSet = 0;          
        
        limit = request.params.get('limit')
        if limit is not None:
            try :
                limit=long(limit)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
            if limit <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
        else:
            limit = 10;  

        lastReadBranchDictList = self.businessLogic.getLastReadBranches(visitorID=visitorID, subjectEID=subjectEID, offSet=offSet, limit=limit)
        responseDict = {'lastReadBranches':lastReadBranchDictList}
        return responseDict

    @dec2.responsify(argNames=['visitorID'])
    def getLastReadSubjects(self, visitorID):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        if not visitorID or not isinstance(visitorID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid visitorID : [{visitorID}] is received.".format(visitorID=visitorID).encode('utf-8'))

        offSet = request.params.get('offSet')
        if offSet is not None:
            try :
                offSet=long(offSet)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
            if offSet <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for offSet : [{offSet}] received.".format(offSet=offSet).encode('utf-8'))
        else:
            offSet = 0;
        
        limit = request.params.get('limit')
        if limit is not None:
            try :
                limit=long(limit)
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
            if limit <=0:
                raise exceptions.InvalidArgumentException(u"Invalid value for limit : [{limit}] received.".format(limit=limit).encode('utf-8'))
        else:
            limit = 10;  

        lastReadSubjectDictList = self.businessLogic.getLastReadSubjects(visitorID=visitorID, offSet=offSet, limit=limit)
        responseDict = {'lastReadSubjects':lastReadSubjectDictList}
        return responseDict