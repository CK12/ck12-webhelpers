import logging
from datetime import datetime
import hashlib
import traceback

from bson.objectid import ObjectId
from pylons import config
from pylons import app_globals as g

from flx.model.remediation.validationwrapper import ValidationWrapper
from flx.lib import helpers as h
from flx.model.remediation import helpers as rh
from flx.lib.remoteapi import RemoteAPI
from flx.model import api

log = logging.getLogger(__name__)

class Remediation(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['memberID', 'encodedID']

    """
        Initiate Remediation
    """
    def initiate(self, **kwargs):
        try:
            global config
            self.before_insert(**kwargs)
            kwargs['creationTime'] = datetime.now()
            kwargs['updateTime'] = datetime.now()
            kwargs['encodedID'] = kwargs['encodedID'].upper()
            log.info('Kwargs: [%s]' %kwargs)
            memberID = kwargs.get('memberID')
            parentID = kwargs.get('parentID', None)
            if parentID:
                parentID = ObjectId(parentID)
                ancestorIDs = [parentID]
                parent = self.db.Remediations.find_one({'_id': parentID})
                if parent:
                    log.info('Found a parent remediation: [%s]' %(parent))
                    parentsAncestors = parent.get('ancestorIDs')
                    if parentsAncestors:
                        ancestorIDs = [parentID] + parentsAncestors
                        log.info('Appending parentID and ancestorIDs of the parent: %s' %(ancestorIDs))
                else:
                    log.error('Invalid parentID specified! Please check the API usage. Adding it to ancestorIDs anyway')
                kwargs['ancestorIDs'] = ancestorIDs
            remediationID = self.db.Remediations.insert(kwargs)
            log.info('Added remediation with _id: [%s]' %(remediationID))

            skipPreReq = kwargs.get('skipPreReq', None)
            encodedID = kwargs.get('encodedID')

            testEncodedID = encodedID
            if not skipPreReq:
                taxonomy_api_server = config.get('taxonomy_api_server')
                if not taxonomy_api_server:
                    config = h.load_pylons_config()
                    taxonomy_api_server = config.get('taxonomy_api_server')
                log.info('Getting the pre-requisites for encodedID: [%s] from: [%s]' %(encodedID, taxonomy_api_server))
                response = RemoteAPI._makeCall(taxonomy_api_server, '/get/info/prerequisite/concept/%s' %(encodedID), timeout=180)
                log.debug('Response from taxonomy server: [%s]' %(response))
                preReqEncodedID = response['response']['pre']['encodedID']
                log.info('Prereq EncodedID: [%s]' %(preReqEncodedID))
                testEncodedID = preReqEncodedID

            noOfQuestions = 10
            testID = Assessment(self.db).getOrCreateTest([{'encodedID':testEncodedID, 'count':noOfQuestions}])

            storeSystemActionKwargs = { 'remediationID':remediationID, 'actionType':'practice', 'objectType':'practice', 'objectValue':testID }
            systemActionID = RemediationSystemAction(self.db).storeSystemAction(**storeSystemActionKwargs)

            response =  self.db.Remediations.find_one(remediationID)
            response['testID'] = testID
            return response
        except Exception as e:
            log.error('Error while initializing remediation: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e
        return True

    def getInfo(self, **kwargs):
        """
        Get the remediation information.
        """
        try:
            remediationID = kwargs.get('remediationID')
            response = self.db.Remediations.find_one({'_id': ObjectId(remediationID)})
            if not response:
                raise Exception('No Remediation record exist for remediationID:%s' %remediationID)
            # Get the EncodedID details.
            encodedID = response.get('encodedID')
            if encodedID:
                browseTerm = api.getBrowseTermByEncodedID(encodedID=encodedID)
                response['concept'] = browseTerm.asDict()
            return response
        except Exception as e:
            log.error('Error while getting remediation information: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e                

    def getDetail(self, **kwargs):   
        """
        Get the remediation details.
        """
        try:
            remediationID = kwargs.get('remediationID')
            params = {'remediationID': remediationID}
            response = self.getInfo(**params)
            actions = self.db.RemediationActions.find({'remediationID':ObjectId(remediationID)}).sort('creationTime', 1)
            actionsList = []
            for action in actions:
                actionsList.append(action)
            response['RemediationActions'] = actionsList
            return response
        except Exception as e:
            log.error('Error while getting remediation information: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e

    def getActionInfo(self, **kwargs):   
        """
        Get the remediation action information.
        """
        try:
            remediationActionID = kwargs.get('remediationActionID')
            response = self.db.RemediationActions.find_one({'_id': ObjectId(remediationActionID)})
            if not response:
                raise Exception('No RemediationAction record exist for remediationActionID:%s' %remediationID)
            remediationID = response.get('remediationID')
            params = {'remediationID': remediationID}
            response['Remediation'] = self.getInfo(**params)
            return response
        except Exception as e:
            log.error('Error while getting remediation action : %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e

    def getRemediationByMember(self, memberID):   
        """
        Get the remediations for Users.
        """
        try:
            response = self.db.Remediations.find({'memberID': memberID})
            if not response:
                raise Exception('No Remediations exists for memberID:%s' %memberID)
            remds = []
            for record in response:
                remds.append(record)            
            return remds
        except Exception as e:
            log.error('Error while getting remediation by Member: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e                

    def getRemediationByEncodedID(self, encodedID):   
        """
        Get the remediations for encodedIDs.
        """
        try:
            response = self.db.Remediations.find({'encodedID': encodedID})
            if not response:
                raise Exception('No Remediations exists for encodedID:%s' %encodedID)
            remds = []
            for record in response:
                remds.append(record)            
            return remds
        except Exception as e:
            log.error('Error while getting remediation by encodedID: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e                

    def getRemediations(self, **kwargs):   
        """
        Get the remediations for memberID/encodedIDs.
        """
        try:
            memberID = kwargs.get('memberID')
            encodedIDs = kwargs.get('encodedIDs')
            # Prepare query dictionary.
            queryDict = dict()
            if memberID:
                queryDict['memberID'] = int(memberID)
            if encodedIDs:
                queryDict['encodedID'] = {'$in': encodedIDs.split(',')}
            response = self.db.Remediations.find(queryDict)
            if not response:
                raise Exception('No Remediations exists for memberID:%s,encodedIDs:%s ' % (memberID, encodedIDs))
            remds = []
            for record in response:
                remds.append(record)            
            return remds
        except Exception as e:
            log.error('Error while getting remediations by memberID/encodedIDs: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e                


    def setEncodedIDQueue(self, remediationID, encodedIDQueue):
        pass


class Assessment(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

    def getOrCreateTest(self, encodedIDList, details=False, numberOfQuestons=None):
        items = []
        encodedIDs = []
        eids = []
        for eachEncodedID in encodedIDList:
            encodedID = eachEncodedID['encodedID']
            eids.append(encodedID)
            #nofOfQuestions = eachEncodedID['count']
            #items.append('EID:%s:%s' %(encodedID, nofOfQuestions))
        # Get question count for every encodedID
        questionCountDict = rh.getQuestionsCount(eids)
        # Set minimum question count.
        if numberOfQuestons:
            minQuestionCount = numberOfQuestons
        else:
            minQuestionCount = 1
        # Get the encodedIDs having required number of questions.
        for encodedID in questionCountDict:
            qCount = questionCountDict[encodedID]
            if qCount >= minQuestionCount:
                encodedIDs.append(encodedID)
                items.append('EID:%s:%s' %(encodedID, qCount))

        if not encodedIDs:
            log.info('No question available for EncodedIDs:%s' %(eids))
            return None

        items.sort()
        items = ";".join(items)
        md5hash = hashlib.md5(items).hexdigest()
        log.info('Test items: [%s], md5hash: [%s]' %(items, md5hash))
        test = self.db.Tests.find_one({'md5hash':md5hash})
        if test:
            testID = test['testID']
            testInfo = test['testInfo']
            log.info('Found an already existing test with testID: [%s] for items: [%s]' %(testID, items))
        else:
            log.info('No test found for items [%s]. Creating a new one' %(items))
            createPracticeParams = {}
            domains = api.getBrowseTermByEncodedIDs(encodedIDList=encodedIDs)
            domainNames = [x.name for x in domains] ; domainNames = ",".join(domainNames)
            createPracticeParams['title'] = 'Remediation - Practice test on %s' %(domainNames)
            createPracticeParams['description'] = 'Test created by the Remediation Engine on %s' %(domainNames)
            createPracticeParams['testTypeName']  = 'practice'
            createPracticeParams['items']  = items
            createPracticeParams['encodedIDs'] = encodedIDs
            response = h.createAssessment(**createPracticeParams)
            responseStatus = response['responseHeader']['status']
            if responseStatus != 0:
                log.error('Non zero response from assessment server: [%s]' %(responseStatus))
                raise Exception('Unable to create assessment item. API response: [%s]' %(response))
            log.info('Assessment response: [%s]' %(response))
            testID = response['response']['test']['_id']
            testInfo = response['response']
            document = {'testID': testID, 'md5hash':md5hash, 'encodedIDs':items, 'testInfo':testInfo}
            self.db.Tests.insert(document)
        return testInfo if details else testID

    def getOrCreateTest_new(self, encodedID, details=False):
        rh.getQuestionsCount(encodedID)
        pass

    def createEncodedIDScore(self, **kwargs):
        """
        Create EncodedIDScore.
        """
        try:
            log.info('Kwargs: [%s]' %kwargs)
            kwargs['creationTime'] = datetime.now()
            kwargs['updateTime'] = datetime.now()
            collectionID = self.db.EncodedIDScore.insert(kwargs)
            response = self.db.EncodedIDScore.find_one(collectionID)
            return response
        except Exception as e:
            log.error('Error while creating EncodedIDScore: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e
        
    def updateEncodedIDScore(self, **kwargs):
        """
        Update EncodedIDScore.
        """
        try:
            log.info('Kwargs: [%s]' %kwargs)
            memberID = kwargs.get('memberID')
            encodedID = kwargs.get('encodedID')
            remediationID = kwargs.get('remediationID')
            testID = kwargs.get('testID')

            if not (memberID and encodedID and remediationID and testID):
                raise Exception('Must provide memberID/encodedID/remediationID/testID.')
            correct = kwargs.get('correct')
            wrong = kwargs.get('wrong')
            if not (correct and wrong):
                raise Exception('Must provide correct/wrong information.')
            
            queryDict = {'memberID':memberID, 'encodedID':encodedID, 'remediationID':remediationID, 'testID':testID }
            EIDScore = self.db.EncodedIDScore.find_one(queryDict)
            if not EIDScore:
                raise Exception('No EncodedIDScore exist for memberID:%s, encodedID:%s, remediationID:%s, testID:%s' % (memberID, encodedID, remediationID, testID))
            updateDict = {}
            updateDict['updateTime'] = datetime.now()
            updateDict['correct'] = correct
            updateDict['wrong'] = wrong

            response = self.db.EncodedIDScore.update(queryDict, {'$set': updateDict})
            return response
        except Exception as e:
            log.error('Error while updating EncodedIDScore: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e
        
    def getEncodedIDScore(self, **kwargs):
        """
        Get EncodedIDScore by memberID and encodedID.
        """
        try:
            log.info('Kwargs: [%s]' %kwargs)
            memberID = kwargs.get('memberID')
            encodedID = kwargs.get('encodedID')
            remediationID = kwargs.get('remediationID')
            if not (memberID and encodedID):
                raise Exception('Must provide memberID/encodedID.')
            queryDict = {'memberID':memberID, 'encodedID':encodedID}
            if remediationID:
                queryDict['remediationID'] = remediationID

            response = self.db.EncodedIDScore.find_one(queryDict)
            if not response:
                #raise Exception('No EncodedIDScore exist for memberID:%s, encodedID:%s' % (memberID, encodedID))
                log.info('No EncodedIDScore exist for memberID:%s, encodedID:%s' % (memberID, encodedID))
            return response
        except Exception as e:
            log.error('Error while getting EncodedIDScore: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e

class RemediationUserAction(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['remediationID', 'actionType', 'objectType', 'objectValue']
        self.field_dependencies = {
                            'remediationID': {
                                  'collection':self.db.Remediations,
                                  'field':'_id',
                             },
                          }


    def storeUserAction(self, **kwargs):
        self.before_insert(**kwargs)
        kwargs['by'] = 'user'
        log.info('Kwargs: [%s]' %kwargs)
        kwargs['creationTime'] = datetime.now()
        kwargs['remediationID'] = ObjectId(kwargs['remediationID'])
        if kwargs['objectType'] == 'artifact':
            kwargs['objectValue'] = int(kwargs['objectValue'])
        remediationActionID = self.db.RemediationActions.insert(kwargs)
        return self.db.RemediationActions.find_one(remediationActionID)


class RemediationSystemAction(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['remediationID']
        self.field_dependencies = {
                            'remediationID': {
                                  'collection':self.db.Remediations,
                                  'field':'_id',
                             },
                          }

    def storeSystemAction(self, **kwargs):
        self.before_insert(**kwargs)
        kwargs['by'] = 'system'
        log.info('Kwargs: [%s]' %kwargs)
        kwargs['creationTime'] = datetime.now()
        kwargs['remediationID'] = ObjectId(kwargs['remediationID'])
        remediationActionID = self.db.RemediationActions.insert(kwargs)
        log.info('Done saving system action with _id: [%s]' %(remediationActionID))
        return self.db.RemediationActions.find_one(remediationActionID)

    def suggestActions(self, **kwargs):
        global config
        self.before_insert(**kwargs)
        log.info('Kwargs: [%s]' %kwargs)
        kwargs['creationTime'] = datetime.now()
        remediationID = ObjectId(kwargs['remediationID'])
        kwargs['remediationID'] = remediationID
        memberID = kwargs['memberID']
        log.info('Fetching remediation for remediationID: [%s]' %(remediationID))
        remediation = self.db.Remediations.find_one(remediationID)
        originalRemediationEncodedID = remediation['encodedID']

        proficiency_threshold = config.get('remediation_proficiency_threshold')
        if not proficiency_threshold:
            config = h.load_pylons_config()
            proficiency_threshold = config.get('remediation_proficiency_threshold')
        proficiency_threshold = float(proficiency_threshold)
        log.info('remediation_proficiency_threshold: [%s]' %(proficiency_threshold))

        prereq_proficiency_threshold = config.get('remediation_prereq_proficiency_threshold')
        if not prereq_proficiency_threshold:
            config = h.load_pylons_config()
            prereq_proficiency_threshold = config.get('remediation_prereq_proficiency_threshold')
        prereq_proficiency_threshold = float(prereq_proficiency_threshold)
        log.info('prereq_proficiency_threshold: [%s]' %(prereq_proficiency_threshold))

        prereqTestID = kwargs.get('prereqTestID')
        if kwargs.has_key('prereqTestID') or kwargs.has_key('artifactID'):
            if prereqTestID:
                submissions, score = h.evaluateSubmissionsFromAssessment(prereqTestID, memberID)
                for encodedID in submissions.keys():
                    # Store submission.
                    submission = submissions[encodedID]
                    createParams = dict()
                    createParams['memberID'] = memberID
                    createParams['encodedID'] = encodedID
                    createParams['correct'] = submission['correct']
                    createParams['wrong'] = submission['wrong']
                    createParams['testID'] = prereqTestID
                    createParams['remediationID'] = remediationID
                    createParams['sprinkleTest'] = kwargs.get('sprinkle', False)
                    Assessment(self.db).createEncodedIDScore(**createParams)

                log.info('score: [%s]' %(score))
                if score < prereq_proficiency_threshold:
                    log.info('User not proficient in the preReqEncodedID')
                    #TODO: Need to implement this flow
                    return {'remediation': remediation}
            remediationEncodedID = originalRemediationEncodedID

        elif kwargs.has_key('testID'):
            lowScoreEncodedIDs = []
            lowestScore = 1.1
            lowestScoreEncodedID = None
            testID = kwargs['testID']
            submissions, score = h.evaluateSubmissionsFromAssessment(testID, memberID)
            # If we have more than one encodedIDs for test then it will be sprinkle test.
            sprinkled = True if len(submissions.keys()) > 1 else False
            for encodedID in submissions.keys():
                # Store submission.
                submission = submissions[encodedID]
                createParams = dict()
                createParams['memberID'] = memberID
                createParams['encodedID'] = encodedID
                createParams['correct'] = submission['correct']
                createParams['wrong'] = submission['wrong']
                createParams['testID'] = testID
                createParams['remediationID'] = remediationID
                createParams['sprinkled'] = sprinkled
                Assessment(self.db).createEncodedIDScore(**createParams)

                score = submissions[encodedID]['score']
                if score < proficiency_threshold:
                    lowScoreEncodedIDs.append(encodedID)
                if score < lowestScore:
                    lowestScore = score
                    lowestScoreEncodedID = encodedID
            log.info('User not proficient in the following encodedIDs: [%s]' %(lowScoreEncodedIDs))
            log.info('User lowest score: [%s] is for the encodedID: [%s]' %(lowestScore, lowestScoreEncodedID))

            if not lowScoreEncodedIDs:
                log.info('User already proficient in the following encodedIDs: [%s]. Suggest the parent concept.' %(submissions.keys()))
                parentID = remediation.get('parentID')
                if parentID:
                    remediation = self.db.Remediations.find_one(parentID)
                    if remediation:
                        # Update the parent's lowScoreEncodedIDs.
                        lowScoreEncodedIDs = remediation.get('lowScoreEncodedIDs', [])
                        if originalRemediationEncodedID in lowScoreEncodedIDs:
                            lowScoreEncodedIDs.remove(originalRemediationEncodedID)
                            queryDict = {'_id':parentID}
                            updateDict = dict()
                            updateDict['updateTime'] = datetime.now()
                            updateDict['lowScoreEncodedIDs'] = lowScoreEncodedIDs
                            response = self.db.Remediations.update(queryDict, {'$set': updateDict})
                            remediation = self.db.Remediations.find_one(parentID)
                return {'isRemediationDone': True, 'remediation': remediation}
            else:
                # Update the remediation with lowestScoreEIDs.
                queryDict = {'_id':remediationID}
                updateDict = dict()
                updateDict['updateTime'] = datetime.now()
                updateDict['lowScoreEncodedIDs'] = lowScoreEncodedIDs
                response = self.db.Remediations.update(queryDict, {'$set': updateDict})

            remediationEncodedID = lowestScoreEncodedID

        # Initiate remediation for lowestScoreEncodedID.
        rmDict = dict()
        rmDict['encodedID'] = remediationEncodedID
        rmDict['memberID'] = memberID
        rmDict['parentID'] = kwargs['remediationID']
        newRemediation = Remediation(self.db).initiate(**rmDict)

        previousUserActions = self.db.RemediationActions.find({'remediationID':remediationID, 'by':'user', 'objectType':'artifact'})
        alreadyStudied = []
        for eachAction in previousUserActions:
            alreadyStudied.append(eachAction['objectValue'])
        log.info('Already studied artifacts: [%s]' %(alreadyStudied))

        log.info('Fetching read modalities for encodedID: [%s]' %(remediationEncodedID))
        domain = api.getBrowseTermByEncodedID(encodedID=remediationEncodedID)
        artifactTypesDict = g.getArtifactTypes()
        readModalities = api.getRelatedArtifactsForDomains(domainIDs=[domain.id], typeIDs=[artifactTypesDict['lesson']], ownedBy='ck12', excludeIDs=alreadyStudied, pageNum=1, pageSize=10)
        artifactsLevelsDict = { 'basic': [], 'at grade': [], 'advanced': [] }
        for modality in readModalities:
            level = str(modality.level).lower()
            artifact = api.getArtifactByID(id=modality.id)
            artifactsLevelsDict[level].append(artifact.asDict())

        suggestedArtifacts = []
        if artifactsLevelsDict['at grade']:
            suggestedArtifacts = artifactsLevelsDict['at grade']
        elif artifactsLevelsDict['basic']:
            suggestedArtifacts = artifactsLevelsDict['basic']
        elif artifactsLevelsDict['advanced']:
            suggestedArtifacts = artifactsLevelsDict['advanced']
        else:
            suggestedArtifacts = artifactsLevelsDict['none']

        if not suggestedArtifacts:
            # TODO: If there are no modalities for remediationEncodedID, then go deep in concept map to find read modalities
            return {'remediation': newRemediation}

        noOfQuestions = 10
        args = dict()
        args['memberID'] = kwargs['memberID']
        args['encodedID'] = remediationEncodedID

        EIDScore = Assessment(self.db).getEncodedIDScore(**args)
        if EIDScore:
            # User has already taken the test so lets do the sprinkled test for sub concepts.
            eids = rh.getChildren(remediationEncodedID)
            testEids = map(lambda eid:{'encodedID':eid, 'count':noOfQuestions},eids)
            testID = Assessment(self.db).getOrCreateTest(testEids)
        else:
            # User is taking test first time for encodedID, so lets do the regular test.
            testID = Assessment(self.db).getOrCreateTest([{'encodedID':remediationEncodedID, 'count':noOfQuestions}])


        #testID = Assessment(self.db).getOrCreateTest([{'encodedID':originalRemediationEncodedID, 'count':noOfQuestions}])
        showPracticeDict = {'practice': {'display':True, 'forConcept':domain.asDict(), 'testID':testID}, 'isRemediationDone': False}

        log.debug('suggestedArtifacts: [%s]' %(suggestedArtifacts))
        objectValue = [x['id'] for x in suggestedArtifacts]
        objectValueComplete = suggestedArtifacts
        systemActionsKwargs = {'remediationID': kwargs['remediationID'], \
                               'objectType': 'artifact', \
                               'objectValue': objectValue, \
                               'practice': { 'display':True, 'forConcept':remediationEncodedID }
                              }
        systemAction = self.storeSystemAction(**systemActionsKwargs)

        systemAction['objectValue'] = objectValueComplete
        systemSuggested = {'systemSuggested':systemAction, 'remediation': newRemediation}
        systemSuggested.update(showPracticeDict)
        log.debug(systemAction)
        return systemSuggested
