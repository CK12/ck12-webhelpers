from pylons.controllers import WSGIController
from pylons import request, response
from flx.logic.partnerBusinessManager import PartnerBusinessLogic
from flx.controllers import user
from flx.model import exceptions
from flx.controllers import decorators as dec1
from flx.util import decorators as dec2
from datetime import datetime
import json

__controller__ = 'PartnerServiceController'

class PartnerServiceController(WSGIController):

    def __init__(self):
        self.businessLogic = PartnerBusinessLogic()

    @dec2.responsify(argNames=['partnerAppName'])
    @dec1.checkAuth(argNames=['partnerAppName'], throwbackException=True, verifyPartnerLogin=True)
    def buildAssignment(self, member, partnerAppName):
        if request.method != 'POST':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        if request.content_type != 'application/json':
            raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(contentType=request.content_type).encode('utf-8'))                

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        if not partnerAppName or not isinstance(partnerAppName, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid partnerAppName : [{partnerAppName}] is received. partnerAppName is mandatory.".format(partnerAppName=partnerAppName).encode('utf-8'))

        assignmentData = request.body
        try:
            assignmentDict = json.loads(assignmentData)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid assignmentData : [{assignmentData}] received in the request parameters. A valid JSON is expected.".format(assignmentData=assignmentData).encode('utf-8'))

        partnerGroupID = assignmentDict.get('partnerGroupID')
        if not partnerGroupID or not isinstance(partnerGroupID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid partnerGroupID : [{partnerGroupID}] is received. partnerGroupID is mandatory.".format(partnerGroupID=partnerGroupID).encode('utf-8'))

        #partnerGroupName is not mandatory for already existing groups.
        partnerGroupName = assignmentDict.get('partnerGroupName')
        if partnerGroupName is not None:
            if not partnerGroupName or not isinstance(partnerGroupName, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid partnerGroupName : [{partnerGroupName}] is received.".format(partnerGroupName=partnerGroupName).encode('utf-8'))

        assignmentArtifactIDs = assignmentDict.get('assignmentArtifactIDs')
        if not assignmentArtifactIDs or not isinstance(assignmentArtifactIDs, list) or not all(isinstance(assignmentArtifactID, long) or isinstance(assignmentArtifactID, int) for assignmentArtifactID in assignmentArtifactIDs):
            raise exceptions.InvalidArgumentException(u"Invalid assignmentArtifactIDs : [{assignmentArtifactIDs}] received. assignmentArtifactIDs are mandatory.".format(assignmentArtifactIDs=assignmentArtifactIDs).encode('utf-8'))
        assignmentDict['assignmentArtifactIDs'] = list(set(assignmentArtifactIDs))

        assignmentName = assignmentDict.get('assignmentName')
        if not assignmentName or not isinstance(assignmentName, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid assignmentName : [{assignmentName}] is received. assignmentName is mandatory".format(assignmentName=assignmentName).encode('utf-8'))

        #partnerAssignmentID is not mandatory.
        partnerAssignmentID = assignmentDict.get('partnerAssignmentID')
        if partnerAssignmentID is not None:
            if not partnerAssignmentID or not isinstance(partnerAssignmentID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid partnerAssignmentID : [{partnerAssignmentID}] is received.".format(partnerAssignmentID=partnerAssignmentID).encode('utf-8'))

        assignmentDueBy = assignmentDict.get('assignmentDueBy')
        if assignmentDueBy is not None:
            try:
                assignmentDueBy = datetime.strptime(assignmentDueBy[:19], '%Y-%m-%dT%H:%M:%S')
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid assignmentDueBy : [{assignmentDueBy}] received. Need a proper future datetime in format of YYYY-MM-DDTHH-MM-SS as assignmentDueBy.".format(assignmentDueBy=assignmentDueBy).encode('utf-8'))
            if assignmentDueBy < datetime.now():
                raise exceptions.InvalidArgumentException(u"Invalid for assignmentDueBy : [{assignmentDueBy}] received. Need a proper future datetime in format of YYYY-MM-DDTHH-MM-SS as assignmentDueBy.".format(assignmentDueBy=assignmentDueBy).encode('utf-8'))
            assignmentDict['assignmentDueBy'] = assignmentDueBy

        assignmentDict = self.businessLogic.buildAssignment(memberDict, assignmentDict, partnerAppName)
        responseDict = {'assignment':assignmentDict}
        return responseDict

    @dec2.responsify(argNames=['partnerAppName'])
    @dec1.checkAuth(argNames=['partnerAppName'], throwbackException=True, verifyPartnerLogin=True)
    def enrollMembersInGroup(self, member, partnerAppName):
        if request.method != 'POST':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        if request.content_type != 'application/json':
            raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(contentType=request.content_type).encode('utf-8'))                

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        if not partnerAppName or not isinstance(partnerAppName, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid partnerAppName : [{partnerAppName}] is received. partnerAppName is mandatory.".format(partnerAppName=partnerAppName).encode('utf-8'))

        enrollData = request.body
        try:
            enrollDict = json.loads(enrollData)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid enrollData : [{enrollData}] received in the request parameters. A valid JSON is expected.".format(enrollData=enrollData).encode('utf-8'))

        partnerGroupID = enrollDict.get('partnerGroupID')
        if not partnerGroupID or not isinstance(partnerGroupID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid partnerGroupID : [{partnerGroupID}] is received. partnerGroupID is mandatory.".format(partnerGroupID=partnerGroupID).encode('utf-8'))

        #partnerGroupName is not mandatory for already existing groups.
        partnerGroupName = enrollDict.get('partnerGroupName')
        if partnerGroupName is not None:
            if not partnerGroupName or not isinstance(partnerGroupName, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid partnerGroupName : [{partnerGroupName}] is received..".format(partnerGroupName=partnerGroupName).encode('utf-8'))

        partnerMemberIDs = enrollDict.get('partnerMemberIDs')
        if not partnerMemberIDs or not isinstance(partnerMemberIDs, list) or not all(isinstance(partnerMemberID, basestring) for partnerMemberID in partnerMemberIDs):
            raise exceptions.InvalidArgumentException(u"Invalid partnerMemberIDs : [{partnerMemberIDs}] is received. partnerMemberIDs are mandatory".format(partnerMemberIDs=partnerMemberIDs).encode('utf-8'))
        enrollDict['partnerMemberIDs'] = list(set(partnerMemberIDs))
        
        enrollDict = self.businessLogic.enrollMembersInGroup(memberDict, enrollDict, partnerAppName)
        responseDict = {'enroll':enrollDict}
        return responseDict

    @dec2.responsify(argNames=['partnerAppName', 'partnerGroupID', 'assignmentID'])
    @dec1.checkAuth(argNames=['partnerAppName', 'partnerGroupID', 'assignmentID'], throwbackException=True)
    def getAssignmentProgress(self, member, partnerAppName, partnerGroupID, assignmentID):
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        #I guess member is already authenticated by this step using his login cookie in the request
        #And we would have a proper memberID, memberEmail, memberLogin, memberDefaultLogin
        memberDict = {}
        memberDict['memberID'] = member.id
        memberDict['memberEmail'] = member.email
        memberDict['memberLogin'] = member.login
        memberDict['memberDefaultLogin'] = member.defaultLogin

        if not partnerAppName or not isinstance(partnerAppName, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid partnerAppName : [{partnerAppName}] is received. partnerAppName is mandatory.".format(partnerAppName=partnerAppName).encode('utf-8'))

        if not partnerGroupID or not isinstance(partnerGroupID, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid partnerGroupID : [{partnerGroupID}] is received.partnerGroupID is mandatory.".format(partnerGroupID=partnerGroupID).encode('utf-8'))

        try :
            assignmentID=long(assignmentID)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid value for assignmentID : [{assignmentID}] received. assignmentID is mandatory and should be a proper long integer.".format(assignmentID=assignmentID).encode('utf-8'))
        if assignmentID <=0:
            raise exceptions.InvalidArgumentException(u"Invalid value for assignmentID : [{assignmentID}] received. assignmentID is mandatory and should be a proper long integer.".format(assignmentID=assignmentID).encode('utf-8'))

        assignmentProgressDict = self.businessLogic.getAssignmentProgress(memberDict, partnerAppName, partnerGroupID, assignmentID)
        responseDict = {'assignmentProgress':assignmentProgressDict}
        return responseDict