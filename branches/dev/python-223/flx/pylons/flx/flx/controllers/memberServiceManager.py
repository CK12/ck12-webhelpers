import logging
from pylons.controllers import WSGIController
from pylons import request
from flx.logic.memberBusinessManager import MemberBusinessLogic
from flx.model import exceptions
from flx.controllers import user as u
from flx.controllers import decorators as dec1
from flx.util import decorators as dec2

log = logging.getLogger(__name__)
__controller__ = 'MemberServiceController'

class MemberServiceController(WSGIController):

    def __init__(self):
        self.businessLogic = MemberBusinessLogic()

    @dec2.responsify() 
    @dec1.checkAuth(throwbackException=True)
    def getLastReadModalities(self, member):
        log.info("Request Parameters:%s" % request.params)
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberID = member.id
        collectionHandles = request.params.get('collectionHandles', '').strip()
        if collectionHandles:
            if not isinstance(collectionHandles, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid collectionHandles : [{collectionHandles}] is received.".format(collectionHandles=collectionHandles).encode('utf-8'))
            collectionHandles = collectionHandles.split(',')
        subjects = request.params.get('subjects', '').strip()
        if subjects:
            if not isinstance(subjects, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid subjects : [{subjects}] is received.".format(subjects=subjects).encode('utf-8'))
            subjects = subjects.upper().split(',')
        
        branches = request.params.get('branches', '').strip()
        if branches:
            if not isinstance(branches, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid branches : [{branches}] is received.".format(branches=branches).encode('utf-8'))
            branches = branches.upper().split(',')
       
        concepts = request.params.get('concepts', '').strip()
        if concepts:
            if not isinstance(concepts, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid concepts : [{concepts}] is received.".format(concepts=concepts).encode('utf-8'))
            concepts = concepts.upper().split(',')

         
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

        kwargs = dict()
        modalityTypes = request.params.get('modalityTypes', '').strip()
        if modalityTypes:
            kwargs['modalityTypes'] = modalityTypes.split(',')

        flow = request.params.get('flow', '').strip()
        if flow:
            kwargs['flow'] = flow
        for param in ['isModality', 'withEID', 'details']:
            value = request.params.get(param, '').strip()
            if not value:
                continue
            if value not in ['true', 'false']:
                raise Exception("Please provide proper value for field:%s" %param)
            kwargs[param] = True if value == 'true' else False

        kwargs['memberID'] = memberID
        kwargs['collectionHandles'] = collectionHandles
        kwargs['subjects'] = subjects
        kwargs['branches'] = branches
        kwargs['offSet'] = offSet
        kwargs['limit'] = limit                                
        log.info("Kwargs Parameters:%s" % kwargs)
        #lastReadModalityDictList = self.businessLogic.getLastReadModalities(memberID=memberID, subjects=subjects, branches=branches, concepts=concepts, offSet=offSet, limit=limit)
        lastReadModalityDictList = self.businessLogic.getLastReadModalities(**kwargs)        
        responseDict = {'lastReadModalities':lastReadModalityDictList}
        return responseDict


    @dec2.responsify() 
    @dec1.checkAuth(throwbackException=True)
    def getLastReadConcepts(self, member):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberID = member.id
        subjects = request.params.get('subjects')
        if subjects is not None:
            if not isinstance(subjects, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid subjects : [{subjects}] is received.".format(subjects=subjects).encode('utf-8'))
            subjects = subjects.upper().split(',')
        
        branches = request.params.get('branches')
        if branches is not None:
            if not isinstance(branches, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid branches : [{branches}] is received.".format(branches=branches).encode('utf-8'))
            branches = branches.upper().split(',')
       
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

        lastReadConceptDictList = self.businessLogic.getLastReadConcepts(memberID=memberID, subjects=subjects, branches=branches, offSet=offSet, limit=limit)
        responseDict = {'lastReadConcepts':lastReadConceptDictList}
        return responseDict


    @dec2.responsify() 
    @dec1.checkAuth(throwbackException=True)
    def getLastReadBranches(self, member):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberID = member.id
        subjects = request.params.get('subjects')
        if subjects is not None:
            if not isinstance(subjects, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid subjects : [{subjects}] is received.".format(subjects=subjects).encode('utf-8'))
            subjects = subjects.upper().split(',')
        
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

        lastReadBranchDictList = self.businessLogic.getLastReadBranches(memberID=memberID, subjects=subjects, offSet=offSet, limit=limit)
        responseDict = {'lastReadBranches':lastReadBranchDictList}
        return responseDict


    @dec2.responsify() 
    @dec1.checkAuth(throwbackException=True)
    def getLastReadSubjects(self, member):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberID = member.id

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

        lastReadSubjectDictList = self.businessLogic.getLastReadSubjects(memberID=memberID, offSet=offSet, limit=limit)
        responseDict = {'lastReadSubjects':lastReadSubjectDictList}
        return responseDict

    @dec2.responsify()
    #@dec1.checkAuth(throwbackException=True)
    def getViewedModalities(self):
        log.info("Request Parameters:%s" % request.params)
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #
        #  If user is not signed in, get the visitorID.
        #
        member = u.getCurrentUser(request, anonymousOkay=False)
        memberID = member.id if member else None
        visitorID = request.cookies.get('dexterjsVisitorID', None) if not member else None
        if not memberID and not visitorID:
            responseDict = {'viewedModalities':[]}
            return responseDict

        eids = request.params.get('eids')
        if eids is not None:
            if not isinstance(eids, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid encodedID : [{eids}] is received.".format(eids=eids).encode('utf-8'))
            eids = eids.upper().split(',')

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

        kwargs = dict()
        modalityTypes = request.params.get('modalityTypes', '').strip()
        if modalityTypes:
            kwargs['modalityTypes'] = modalityTypes.split(',')

        kwargs['memberID'] = memberID
        if visitorID:
            kwargs['visitorID'] = visitorID
        kwargs['eids'] = eids
        kwargs['offSet'] = offSet
        kwargs['limit'] = limit
        log.info("Kwargs Parameters:%s" % kwargs)
        viewedModalityDictList = self.businessLogic.getViewedModalities(**kwargs)
        responseDict = {'viewedModalities':viewedModalityDictList}
        return responseDict

    @dec2.responsify()
    #@dec1.checkAuth(throwbackException=True)
    def getViewedSubjects(self):
        log.info("Request Parameters:%s" % request.params)
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #
        #  If user is not signed in, get the visitorID.
        #
        member = u.getCurrentUser(request, anonymousOkay=False)
        memberID = member.id if member else None
        visitorID = request.cookies.get('dexterjsVisitorID', None) if not member else None
        if not memberID and not visitorID:
            responseDict = {'viewedSubjects':[]}
            return responseDict

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

        kwargs = dict()
        kwargs['memberID'] = memberID
        if visitorID:
            kwargs['visitorID'] = visitorID
        kwargs['offSet'] = offSet
        kwargs['limit'] = limit
        log.info("Kwargs Parameters:%s" % kwargs)
        viewedSubjectDictList = self.businessLogic.getViewedSubjects(**kwargs)
        responseDict = {'viewedSubjects':viewedSubjectDictList}
        return responseDict

    @dec2.responsify()
    #@dec1.checkAuth(throwbackException=True)
    def getViewedBranches(self):
        log.info("Request Parameters:%s" % request.params)
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))

        #
        #  If user is not signed in, get the visitorID.
        #
        member = u.getCurrentUser(request, anonymousOkay=False)
        memberID = member.id if member else None
        visitorID = request.cookies.get('dexterjsVisitorID', None) if not member else None
        if not memberID and not visitorID:
            responseDict = {'viewedBranches':[]}
            return responseDict

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

        kwargs = dict()
        kwargs['memberID'] = memberID
        if visitorID:
            kwargs['visitorID'] = visitorID
        kwargs['offSet'] = offSet
        kwargs['limit'] = limit
        log.info("Kwargs Parameters:%s" % kwargs)
        viewedBranchDictList = self.businessLogic.getViewedBranches(**kwargs)
        responseDict = {'viewedBranches':viewedBranchDictList}
        return responseDict
        
        
    @dec2.responsify() 
    #@dec1.checkAuth(throwbackException=True)
    def getLastReadStandards(self):
        log.info("Request Parameters:%s" % request.params)
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        #
        #  If user is not signed in, get the visitorID.
        #
        member = u.getCurrentUser(request, anonymousOkay=False)
        memberID = member.id if member else None
        visitorID = request.cookies.get('dexterjsVisitorID', None) if not member else None
        if not memberID and not visitorID:
            responseDict = {'lastReadStandards':[]}
            return responseDict

        kwargs = dict()
        kwargs['memberID'] = memberID
        kwargs['visitorID'] = visitorID
        lastReadStandardDictList = self.businessLogic.getLastReadStandards(**kwargs)
        responseDict = {'lastReadStandards':lastReadStandardDictList}
        return responseDict
