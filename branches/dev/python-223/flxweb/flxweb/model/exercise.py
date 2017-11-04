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
# This file originally written by Deepak Babu
#
# $Id$

from flxweb.lib.remoteapi import RemoteAPI
from flxweb.model.ck12model import CK12Model
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException
from flxweb.lib.ck12.errorcodes import ErrorCodes
from pylons.i18n.translation import _
import logging
import json

JSON_FIELD_RESPONSE = 'response'
JSON_FIELD_HEADER = 'responseHeader'
JSON_FIELD_RESULT = 'result'

log = logging.getLogger( __name__ )

class ExerciseManager( RemoteAPI ):

    @staticmethod
    def getExercise( encodedID=None, exerciseID=None):
        if encodedID: 
            api_endpoint = 'get/info/exercise/encodedid/%s' % encodedID
        else:
            api_endpoint = 'get/info/exercise/%s' % exerciseID
        params = {}
 
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='getExercise')
            return Exercise(data['exercise']) 
        except:
            return None


    @staticmethod
    def exerciseExists ( encodedID ):
        if encodedID is None:
            return False
            
        exercise = ExerciseManager.getExercise( encodedID )
        if exercise is not None:
            if exercise.has_key('questionCount') and exercise["questionCount"] > 0:
                return True
        
        return False

    @staticmethod
    def getExerciseQuestions ( encodedID ):
        if encodedID is None:
            return 0
        exercise = ExerciseManager.getExercise( encodedID )
        if exercise is not None:
            if exercise.has_key('questionCount'):
                return exercise["questionCount"]
        return 0

    @staticmethod
    def createExercise( exerciseData ):
        api_endpoint = 'create/exercise'
        try:
            data = ExerciseManager.getResponse(api_endpoint, exerciseData, namespace='createExercise') 
            return data
        except:
            return None

    @staticmethod
    def addQuestionForExercise( exercise_id, questionData ):
        if questionData.has_key('question_options'):  
            #This will fix the parameters encoding issue while send the parameter as array of dicts
            questionData['question_options'] = json.dumps(questionData['question_options'])
        rulesError = ''
        questionID = None
        if questionData['question_class'] == 'generative':
            rulesError = ExerciseManager.validateInstanceRules( questionData )
        if rulesError == '':
            questionID = ExerciseManager.addQuestion( questionData )
            api_endpoint = 'create/exercise/association'
            exerciseData = {}
        if questionID is not None:
             exerciseData['question_class'] = questionData['question_class']
             exerciseData['bundle_id'] = exercise_id
             exerciseData['question_id'] = questionID 
             try:
                data = ExerciseManager.getResponse(api_endpoint, exerciseData, namespace='addQuestionForExercise')
                return data['bundleID'], questionID, rulesError
             except:
                return None,questionID, rulesError
        else:
             return None,None,rulesError
 
    @staticmethod
    def addQuestion( questionData ):
        questionClass = questionData['question_class']  
        api_endpoint = 'create/question/'+questionClass
        try:
            data = ExerciseManager.getResponse(api_endpoint, questionData, namespace='addQuestion') 
            return data['questionID'] 
        except:
            return None

    @staticmethod
    def validateInstanceRules( questionData ):
        questionClass = questionData['question_class']  
        api_endpoint = 'validate/instancerules/'+questionClass
        try:
            data = ExerciseManager.getResponse(api_endpoint, questionData, namespace='validateInstanceRules') 
            return data 
        except:
            return None

    @staticmethod
    def deleteQuestion( questionClass, questionID ):
        api_endpoint = 'delete/question/%s/%s' % ( questionClass, questionID)
        params = {}
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='deleteQuestion') 
            return data 
        except:
            return None

    @staticmethod
    def removeQuestionFromExercise(exerciseID=None, encodedID=None, **questionData):
        if exerciseID is not None:
            api_endpoint = 'delete/exercise/association/%s' % (exerciseID)
        else:
            api_endpoint = 'delete/exercise/association/encodedid/%s' % (encodedID)

        try:
            data = ExerciseManager.getResponse(api_endpoint, questionData, namespace='removeQuestionInExercise') 
            return data 
        except:
            return None

    @staticmethod
    def getQuestionFromExercise( encodedID , prevQuestions = [], maxRestrict = 'true'):
        prevQuestions = ';'.join([ ",".join([each[0],str(each[1])]) for each in prevQuestions])
        api_endpoint = 'get/questionfromexercise/encodedid/%s' % (encodedID)
        params = {}
        params['max_restrict'] = maxRestrict
        if len(prevQuestions) > 1:
            params['prev_questions'] = prevQuestions   
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='getQuestionFromExercise') 
            return Exercise(data) 
        except RemoteAPIStatusException, e:
            log.debug((_(u'API returned status code(%(e.status_code)s)=%(e.status_code)s') % ({"e.status_code":e.status_code,"e.status_code":ErrorCodes.get_description(e.status_code)})).encode("utf-8"))
            log.debug((_(u'API returned with message: %(e.api_message)s') % ({"e.api_message":e.api_message})).encode("utf-8"))
            if e.status_code == ErrorCodes.MAX_PRACTICE_REACHED or e.status_code == ErrorCodes.NO_QUESTIONS_TO_DISPLAY:
                return -1     
            else:
                return None 
        except:
            return None

    @staticmethod
    def getQuestionFromQuiz(quizResultID, displayOrder=1):
        api_endpoint = 'get/questionfromquiz/%s/%s' % (quizResultID, displayOrder)
        params = {} #TODO: handle extended parameters
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='getQuestionFromQuiz') 
            return Exercise(data) 
        except:
            return None


    @staticmethod
    def createExerciseWorksheet( encodedID, worksheetData ):
        api_endpoint = 'create/exercise/worksheet/encodedid/%s' % (encodedID)
        try:
            data = ExerciseManager.getResponse(api_endpoint, worksheetData, caller=RemoteAPI.makeHwpCall, namespace='createExerciseWorksheet') 
            return data 
        except:
            return None

    @staticmethod
    def createExerciseWorkBook( workBookData ):
        api_endpoint = 'create/workbook'
        try:
            data = ExerciseManager.getResponse(api_endpoint, workBookData, caller=RemoteAPI.makeHwpCall, namespace='createExerciseWorkBook') 
            return data 
        except Exception,e:
            return None

    @staticmethod
    def getQuestion( questionClass, questionID, check_approval = True , params = {}):
        api_endpoint = 'get/question/%s/%s' % ( questionClass, questionID)
        if check_approval is False:
            params['bypass'] = 'true'    
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='getQuestion') 
            return data 
        except:
            return None

    @staticmethod
    def keepQuestion( questionClass, questionID ):
        api_endpoint = 'keep/question/%s/%s' % ( questionClass, questionID)
        params = {} #TODO: handle extended parameters
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='keepQuestion') 
            return data 
        except:
            return None

    @staticmethod
    def assessAnswer( paramsInJSON ):
        api_endpoint = 'assess/answer'
        try:
            data = ExerciseManager.getResponse(api_endpoint, paramsInJSON, namespace='assessAnswer') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def startTest( params ):
        api_endpoint = 'start/test'
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='startTest') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def getQuiz( encodedID=None, quizID=None, quizCode=None ):
        if encodedID: 
            api_endpoint = 'get/quiz/encodedid/%s' % encodedID
        elif quizID:
            api_endpoint = 'get/quiz/%s' % quizID
        else:
            api_endpoint = 'get/quiz/quizcode/%s' % quizCode
        params = {}
 
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='getQuiz') 
            return Exercise(data) 
        except Exception,e:
            if e.status_code == ErrorCodes.EXERCISE_HAS_LESS_QUESTIONS_TO_CREATE_QUIZ:  
                return e.api_message
            return None

    @staticmethod
    def startQuiz( quizID=None, quizCode=None ):
        if quizID:
            api_endpoint = 'start/quiz/%s' % quizID
        else:
            api_endpoint = 'start/quiz/quizcode/%s' % quizCode
        params = {}
 
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='startQuiz') 
            return Exercise(data) 
        except:
            return None


    @staticmethod
    def endQuiz( params ):
        api_endpoint = 'end/quiz'
 
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='endQuiz') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def getQuizResultDetails(userID, encodedID = None):
        api_endpoint = 'get/detail/user/quizresults/%s' % userID
        if encodedID:
            api_endpoint = 'get/detail/user/quizresults/%s/%s' % (userID,encodedID)
        params = {}
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='getQuizResultDetails') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def stopTest( params ):
        api_endpoint = 'stop/test'
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='stopTest') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def updateTest( params ):
        api_endpoint = 'update/test'
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='updateTest') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def updateQuestionAttempt( params ):
        api_endpoint = 'increment/questionattempt'
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='updateQuestionAttempt') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def getLatestTestResults(userID, params, encodedID = None ):
        if encodedID is not None:
            api_endpoint = 'get/user/tests/%s/%s' % (userID, encodedID) 
        else:
            api_endpoint = 'get/user/tests/%s' % (userID) 
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='updateQuestionAttempt') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def createErrorReport( params, category):
        api_endpoint = 'create/error/report/%s' % (category)
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='createErrorReport') 
            return Exercise(data) 
        except:
            return None

    @staticmethod
    def checkErrorReport( params ):
        api_endpoint = 'get/info/error/reports/question/%s/%s/%s/%s' % (params['question_class'], params['question_id'], params['email'], params['error_type_id'])
        try:
            data = ExerciseManager.getResponse(api_endpoint, params, namespace='getErrorReportsForQuestion')
            if len(data['errorReports']) == 0:
                return False
            else:
                return True
        except:
            return None

    @staticmethod
    def getExerciseEncodedID(encodedID):
        """
           Given a concept or a lesson encoding, return the exercise encoding
        """
        return encodedID.replace('.C.', '.X.').replace('.L.', '.X.')

    @staticmethod
    def getArtifactEncodedID(exerciseEncodedID, artifactType):
        """
           Given a exercise encoding, return the artifact encoding (lesson or concept)
        """
        aCode = '.X.'  
        if artifactType == 'concept':
            aCode = '.C.'
        elif artifactType == 'lesson':   
            aCode = '.L.'
        return exerciseEncodedID.replace('.X.', aCode)

    @staticmethod
    def getResponse(api_endpoint, requestData, caller=RemoteAPI.makeHwpCall , namespace=''):
        data = caller( api_endpoint, requestData )
        if data and ( JSON_FIELD_RESPONSE in data ):
            #check for errors
            status = data[JSON_FIELD_HEADER]['status']
            if status == 0:
                return data[JSON_FIELD_RESPONSE]
            else:
                log.error((_(u"In %(namespace)s, There was an error found in response for %(api_endpoint)s with %(requestData)s params. Error code: %(status)s") % ({"namespace":namespace, "api_endpoint":api_endpoint, "requestData":requestData, "status":status})).encode("utf-8"));
                raise Exception((_(u"In %(namespace)s, There was an error found in response for %(api_endpoint)s with %(requestData)s params. Error code: %(status)s") % ({"namespace":namespace, "api_endpoint":api_endpoint, "requestData":requestData, "status":status})).encode("utf-8"));
        else:
            log.error((_(u"In %(namespace)s, response not found for %(api_endpoint)s with %(requestData)s params") % ({"namespace":namespace, "api_endpoint":api_endpoint, "requestData":requestData})).encode("utf-8"));
            raise Exception((_(u"In %(namespace)s, response not found for %(api_endpoint)s with %(requestData)s params") % ({"namespace":namespace, "api_endpoint":api_endpoint, "requestData":requestData})).encode("utf-8"));

class Exercise( CK12Model ):

    def __init__( self, dict_obj=None ):
        CK12Model.__init__( self, dict_obj )

    def get_questions_count(self):
        '''
        Returns the valid questions count in the exercise
        '''
        if self.has_key('questionCount') and self.get('questionCount'):
            return self.get('questionCount') 
        else:
            return 0
