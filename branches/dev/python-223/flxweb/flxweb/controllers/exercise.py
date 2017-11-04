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
import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort 
from flxweb.model.artifact import ArtifactManager 
from flxweb.model.artifact import Artifact 
from flxweb.model.exercise import ExerciseManager 
from flxweb.model.task import TaskManager
from flxweb.model.session import SessionManager
from flxweb.forms.exercise import ErrorReportForm
from flxweb.model.browseTerm import BrowseManager
from flxweb.lib.ck12.decorators import login_required
from flxweb.lib.base import BaseController
from flxweb.lib.ck12 import messages 
from flxweb.controllers.modality import ARTIFACT_ASSESSMENT_MAP
import flxweb.lib.helpers as h
from pylons.templating import render_jinja2
from pylons.decorators import jsonify
from pylons.i18n.translation import _
import simplejson
import formencode

log = logging.getLogger(__name__)

class ExerciseController(BaseController):


    def exercise_perma (self, exercise_title, realm, ext, render_context="ajax"):
        c.user_has_signedin = False   
        c.exercise_exist = False
        c.exercise = None
        c.artifact = None
        c.related_exercises = None
        c.scorecardscount = 0
        c.exercise_mode = render_context
        
        if request.params.has_key('artifact_data'):
            artifact = request.params['artifact_data'] 
            artifact = simplejson.loads(artifact)
            artifact = Artifact(artifact)
        else: 
            #process ext
            ext_params = {}
            artifact_type = 'lesson'
            if ext:
                params = ext.split('/')
                if params[0].lower().startswith('v'):
                    version = params[0].strip('v')
                    ext_params['version'] = version
            include_details = True if render_context == 'embed' else False 
            artifact = ArtifactManager.getArtifactByPerma(artifact_type, exercise_title, realm, ext_params, details=include_details)

        if artifact != None and artifact.has_key('encodedID'):
            artifact['artifactID'] = artifact['id']
            artifact['realm'] = realm
            branch_eid = artifact.get_branch_encodedid()
            branch = BrowseManager.getBrowseTermByEncodedId(branch_eid)
            artifact['branch'] = branch.slug()
            artifact['domain'] = artifact['artifact_domain_handle']
            c.artifact = artifact
            exercise = ExerciseManager.getExercise(encodedID = artifact['encodedID'])
            c.title = artifact['handle']
            c.artifactType = artifact['artifactType']
            c.assessmentType = ARTIFACT_ASSESSMENT_MAP.get(c.artifactType)
            if exercise and exercise.get_questions_count() > 0:
                c.exercise_exist = True
                c.exercise = exercise

            # Lists the related artifacts to display in embed box
            # Here we using the prev, next artifacts as related exercises
            if render_context == 'embed':
                artifacts = []
                artifacts.append(artifact.getPrevious())
                artifacts.append(artifact.getNext())
                related_exercises = []
                for rel_artifact in artifacts:
                    if rel_artifact and rel_artifact.has_key('exerciseCount') and int(rel_artifact['exerciseCount']) > 0:
                        art_dict = {}
                        art_dict['perma'] = rel_artifact['handle']
                        art_dict['title'] = rel_artifact['title']
                        related_exercises.append(art_dict)
                c.related_exercises = related_exercises

            if not SessionManager.isGuest() and render_context != "embed":
                user = SessionManager.getCurrentUser()
                c.user_has_signedin = True   
                scorecards = ExerciseManager.getQuizResultDetails(userID = user['id'], encodedID = artifact['encodedID'])
                if scorecards:
                    c.scorecardscount = len(scorecards['quizResults'])

            if render_context == 'embed':  
                return render_jinja2('exercise/embed_exercise_details.html')
            else:
                return render_jinja2('exercise_ae/ajax_exercise_details.html')
        else:
            log.error((_(u"Could not get artifact data for the exercise title %(exercise_title)s") %({"exercise_title":exercise_title})).encode("utf-8"))
            if render_context == 'embed':  
                return render_jinja2('exercise/embed_exercise_details.html')
            else:
                if hasattr(request, 'url'):
                    self._custom404(request.url)
                else: 
                    abort(404)

    def get_quiz(self, encoded_id):
        quiz = ExerciseManager.getQuiz(encodedID = encoded_id)
        if isinstance(quiz,str) or isinstance(quiz,unicode):
           # if 'quiz' is a string, Then it should be an error message which came from the server. 
           c.quiz = None
           c.quiz_error = quiz
        elif quiz is not None:
            quiz = quiz['quiz'] 
            c.questionsCount = len(quiz['questions']) 
            c.quizDuration = int(quiz['timeLimit']/60)
            c.quiz = quiz
        c.title = request.params.get('title', 'Unknown')
        return render_jinja2('exercise/ajax_quiz_details.html')

    def get_latest_test_results(self, userID, limit,encodedID= None ):
        latest_results = ExerciseManager.getLatestTestResults( userID, 
                                                               params = {'limit' : limit },
                                                               encodedID = encodedID,
                                                             )
        latest_results_data = []
        if latest_results is not None:
            latest_results = latest_results['results']
            if len(latest_results) > 0:
                for latest_result in latest_results:
                    latest_data = {}
                    latest_data['time'] = h.convertTime( latest_result['creationTime'] )
                    latest_data['totalAttempt'] = latest_result['totalAttempt']
                    latest_data['correctCount'] = latest_result['correctCount']
                    latest_data['incorrectCount'] = latest_data['totalAttempt'] - latest_data['correctCount']
                    if latest_data['totalAttempt']:			
                        latest_data['percentage'] = int( ( float(latest_result['correctCount'])/latest_result['totalAttempt'] ) *100 )
                    else:
                       latest_data['percentage'] = 0 
                    latest_results_data.append(latest_data) 

        return latest_results_data  

    def get_exercise_question_count(self, encoded_id):
        result = {'encodedID': encoded_id }
        result['questionCount'] = ExerciseManager.getExerciseQuestions(encoded_id)
        if request.headers.has_key('Accept') and 'application/json' in request.headers['Accept']:
            response.content_type = 'application/json; charset=utf-8'
        return simplejson.dumps(result)

    def create_workbook(self):
        params = request.params
        if params.has_key('in_etitle') and params.has_key('in_enid') and params.has_key('in_ehandle') and params.has_key('in_artifactType') and params['in_realm']:
            c.incoming_ex_title = params['in_etitle']
            c.incoming_ex_encodedid = params['in_enid']
            c.branch_eid = '.'.join(c.incoming_ex_encodedid.split('.')[:2])
            c.branch_handle = BrowseManager.getBrowseTermByEncodedId(c.branch_eid).get('handle')
            c.incoming_ex_handle = params['in_ehandle']
            c.incoming_ex_artifact_type = params['in_artifactType']
            c.incoming_ex_realm = params['in_realm']
            c.incoming_ex_max_question_count = ExerciseManager.getExerciseQuestions(params['in_enid'])
            c.branch = params['in_branch']
            c.domain = params['in_domain']
            c.exercise_page_url = params['ep'].encode("utf-8")
        c.user_has_signedin = False
        if not SessionManager.isGuest():
            c.user_has_signedin = True
 
        return render_jinja2('exercise/workbook_details.html')

    def renderExerciseWorksheetStatus(self, taskID):
        status = TaskManager.get_task_by_id(taskID)
        if request.headers.has_key('Accept') and 'application/json' in request.headers['Accept']:
            response.content_type = 'application/json; charset=utf-8'
        return simplejson.dumps(status)

    def createExerciseWorksheet(self, encodedID):
        params = request.params
        createResponse = ExerciseManager.createExerciseWorksheet(encodedID, params)
        if createResponse:
            if request.headers.has_key('Accept') and 'application/json' in request.headers['Accept']:
                response.content_type = 'application/json; charset=utf-8'
            return simplejson.dumps(createResponse)
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

    def renderExerciseWorkBookStatus(self, taskID):
        status = TaskManager.get_task_by_id(taskID)
        if status:
            if request.headers.has_key('Accept') and 'application/json' in request.headers['Accept']:
                response.content_type = 'application/json; charset=utf-8'
        return simplejson.dumps(status)

    def createExerciseWorkBook(self):
        params = request.params
        try:
            createResponse = ExerciseManager.createExerciseWorkBook(params)
            if request.headers.has_key('Accept') and 'application/json' in request.headers['Accept']:
                response.content_type = 'application/json; charset=utf-8'
            return simplejson.dumps(createResponse)
        except Exception as e:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                log.exception((_(u"Something went wrong with create workbook: "+ str(e))).encode("utf-8"))
                abort(404)

    def questionFromExercise(self,encodedID):
        attnd_practices = SessionManager.getDataFromSession('attendedPractices')
        attnd_practices = {} if attnd_practices == None else attnd_practices
        if attnd_practices.has_key(encodedID):  
            attnd_questions =  attnd_practices[encodedID]
        else:
            attnd_questions = [] 
            
        max_restrict = request.params.get('max_restrict',None) if request.params.has_key('max_restrict') else 'true'

        response = ExerciseManager.getQuestionFromExercise(encodedID, prevQuestions = attnd_questions, maxRestrict = max_restrict)
        # -1 flag is set to indicate MAX_PRACTICE_REACHED
        if response and response != -1:
            question = response['question']
            q_data = (question['questionClass'][0].upper(), question['questionID'])
            attnd_questions.append(q_data)
            attnd_practices[encodedID] = attnd_questions

            dataDict = {}
            dataDict['attendedPractices'] = attnd_practices
            SessionManager.saveDataInSession(dataDict)
            c.question = question
            return render_jinja2('exercise/question_form.html')
        else:
            # If max reached, Remove all the attended questions for the exercise from Session
            attnd_practices = SessionManager.getDataFromSession('attendedPractices')
            if attnd_practices != None:
                if attnd_practices.has_key(encodedID):
                    attnd_practices.pop(encodedID)
                    if len(attnd_practices) == 0:
                        try:
                            dataDict = ['attendedPractices']
                            SessionManager.deleteDataFromSession(dataDict)
                        except Exception as e:
                            log.error((_(u'questionFromExercise: %(e.__str__())s') % ({"e.__str__()":e.__str__()})).encode("utf-8"))
                    else:
                        dataDict = {}
                        dataDict['attendedPractices'] = attnd_practices
                        SessionManager.saveDataInSession(dataDict)
            return 'MAX_REACHED'

    @jsonify
    def assessAnswer(self):
        rawRequest = request._body__get()
        requestDict = simplejson.loads(rawRequest)
        try:
            requestDict['variableValueMap'] = eval(requestDict['variableValueMap'])
        except Exception as e:
            log.info((_(u'Declarative question: ? '+ e.__str__())).encode("utf-8"))

        if 'testResultID' in session:
            requestDict['testResultID'] = session['testResultID']
 
        if request.params.has_key('qrid'):
            requestDict['quizResultID'] = request.params.get('qrid')
            
        responseDict = ExerciseManager.assessAnswer(requestDict)
        result = {}
        try:
            result["isCorrect"] = responseDict['isCorrect']
            c.result = responseDict 
            result["resultMessage"] = render_jinja2('exercise/assess_answer_result.html')
            if responseDict.has_key('quizResult'):
                quizProgress = responseDict['quizResult']
                result["quizProgress"] = {}
                result["quizProgress"]['correctCount'  ] = quizProgress.get('correctCount')
                result["quizProgress"]['wrongCount'    ] = quizProgress.get('wrongCountInAttempted')
                result["quizProgress"]['totalQuestions'] = quizProgress.get('totalQuestions')
                result["quizProgress"]['totalAttempt'  ] = quizProgress.get('totalAttempt')
        except Exception as e:
            log.info((_(u"This may be due to empty answer sent: %(e.__str__())s") % ({"e.__str__()":e.__str__()})).encode("utf-8"))
        return result

    @jsonify
    def ajax_startTest(self, encodedID):
        if request.method == "POST":
            result = {}
            dataDict = {}
            #result['isLoggedIn'] = False
            result['testStarted'] = False
            if not SessionManager.isGuest():
                requestDict = {}
                user = SessionManager.getCurrentUser()
                requestDict['userName'] = "%s %s" % (user['firstName'],user['lastName'])
                requestDict['userEmail'] = user['email']
                requestDict['encodedID'] = encodedID
                result['testStarted'] = True
                try:
                    responseDict = ExerciseManager.startTest(requestDict)
                    dataDict['testResultID'] = responseDict['testResultID']
                except Exception as e:
                    log.exception(e)
                    dataDict['error'] = str(e)
                    
                SessionManager.saveDataInSession(dataDict)
            else:
                dataDict['guestInitiatesTest'] = True
                SessionManager.saveDataInSession(dataDict)
            return result

    @jsonify
    def ajax_startQuiz(self, encodedID):
        if request.method == "POST":
            result = {}
            getQuizResultKey = 'quiz'
            result['statusFlag'] = 'ERROR'
            if not SessionManager.isGuest():
                quizData = ExerciseManager.getQuiz(encodedID = encodedID)
                if quizData and type(quizData) not in [str,unicode] and quizData[getQuizResultKey].has_key('questions'):
                    quizID = quizData[getQuizResultKey]['id']
                    timeLimit = quizData[getQuizResultKey]['timeLimit']
                    quizQuestions = quizData[getQuizResultKey]['questions']
                    quizResultObject = ExerciseManager.startQuiz(quizID = quizID)
                    if quizResultObject:
                        quizResultID = quizResultObject['quizResultID']
                        result['statusFlag'] = 'START'
                        result['timeLimit'] = timeLimit
                        result['quizQuestionsCount'] = len(quizQuestions)
                        result['quizResultID'] = quizResultID
            #else:
                 #TODO: Discuss about this 
            #    dataDict['guestInitiatesTest'] = True
            #    SessionManager.saveDataInSession(dataDict)
            return result

    def questionFromQuiz(self):
        c.signalQuit = False
        quizResultID = request.params.get('qrid')
        displayOrder = request.params.get('do',0)
        c.displayOrder = displayOrder
        c.quizMode = True

        response = ExerciseManager.getQuestionFromQuiz(quizResultID, displayOrder)
        if response and response.has_key('question'):
            c.question = response['question']
        else:
            c.question = None

        return render_jinja2('exercise/question_form.html')

   
    def endQuiz(self, encodedID):
        requestDict = {}
       
        quizResultID = request.params.get('qrid') 
        duration = request.params.get('duration', 0) 
        result = request.params.get('result', 'T') 

        if quizResultID:
            #stop and update the quiz
            requestDict['quizResultID'] = quizResultID

            requestDict['duration'] = duration

            ExerciseManager.endQuiz(requestDict)
            #self.clearTestTrySession()

            #get full report
            user = SessionManager.getCurrentUser()
            if user is not None and result != 'F':
                userID = user['id']
                
                scorecards = ExerciseManager.getQuizResultDetails(userID = userID, encodedID = encodedID)
                c.scorecards = scorecards['quizResults']
                for scorecard in c.scorecards:
                    scorecard['creationTime'] = h.convertTime( scorecard['creationTime'] )
                c.firstView = True
                return render_jinja2('exercise/quiz_scorecard.html')

    def getUserQuizResults(self, encodedID):
        user = SessionManager.getCurrentUser()
        if user is not None:
            userID = user['id']
            scorecards = ExerciseManager.getQuizResultDetails(userID = userID, encodedID = encodedID)
            c.scorecards = scorecards['quizResults']
            for scorecard in c.scorecards:
                scorecard['creationTime'] = h.convertTime( scorecard['creationTime'] )

            c.firstView = False
            return render_jinja2('exercise/quiz_scorecard.html')

    def stopTest(self):
        requestDict = {}
        params = request.params

        try:
            requestDict['testResultID'] = session['testResultID']
            if params.has_key('duration'):
                requestDict['duration'] = params['duration']
        except Exception as e:
            requestDict['testResultID'] = None  
            log.info(e.__str__())

        result = ExerciseManager.stopTest(requestDict)
        self.clearTestTrySession()

        if result is None:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)
        try:
            dataDict = ['testResultID', 'testDuration']
            SessionManager.deleteDataFromSession(dataDict)
        except Exception as e:
            log.error((_(u'stopTest: %(e.__str__())s') % ({"e.__str__()":e.__str__()})).encode("utf-8"))
        c.result = result
        return render_jinja2('exercise/display_result.html')

    def updateTest(self):
        requestDict = {}
        params = request.params 
        try:
            requestDict['testResultID'] = session['testResultID']
            requestDict['duration'] = params['duration']
        except Exception as e:
            log.error(e) 
            return
        responseDict = ExerciseManager.updateTest(requestDict)
        if responseDict['testResultID']:
            dataDict = {}
            dataDict['testDuration'] = params['duration']
            SessionManager.saveDataInSession(dataDict)
        return  

    def updateQuestionAttempt(self):
        requestDict = {}
        
        try:
            requestDict['testResultID'] = session['testResultID'] 
        except Exception as e:
            requestDict['testResultID'] = None  
            log.info(e.__str__())
            return
        ExerciseManager.updateQuestionAttempt(requestDict)
        return

    def clearTestTrySession(self):
        try:
            if 'guestInitiatesTest' in session:
                dataDict = ['guestInitiatesTest']
                SessionManager.deleteDataFromSession(dataDict)
            return
        except Exception as e:
            return

    def reportError(self):
        c.form = ErrorReportForm()
        c.form_display_error = None

        if not request.params.has_key('qid') or not request.params.has_key('qclass'):
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)

        question_id = request.params["qid"]
        question_class = request.params["qclass"]
        question_var_map = request.params.get("varmap")
        c.form_isFormSubmitted = False
        params = {}
        c.user_has_signedin = False
        if question_var_map is not None:
            params['varvaluemap'] = question_var_map

        if not SessionManager.isGuest():
             user = SessionManager.getCurrentUser()
             c.form.email = user['email']
             c.user_has_signedin = True  

        response = ExerciseManager.getQuestion(questionClass = question_class, questionID = question_id, check_approval=False, params = params)
        if response and response.has_key('question'):
            c.question = response['question']
        else:
            c.form_display_error = messages.ERROR_REPORT_FORM_DISPLAY_FAILED 
         
        return render_jinja2('exercise/report_error.html')

    def reportErrorQuestion(self):
        c.form = ErrorReportForm()
        try:
            c.form_display_error = None
            c.user_has_signedin = False
            question_id = request.params["question_id"]
            question_class = request.params["question_class"]
            question_var_map = request.params.get("variable_value_map")
            submitAnyways = request.params.get("submitAnyways")
            params = {} 
            if question_var_map is not None:
                params['varvaluemap'] = question_var_map

            if not SessionManager.isGuest():
                c.user_has_signedin = True  

            # validate the form
            c.form = c.form.to_python( request.params )

            params = dict(request.params)
            
            isErrorReportSubmitted = ExerciseManager.checkErrorReport(params = params)
            
            if isErrorReportSubmitted and ( submitAnyways is None or submitAnyways == "False"):
                c.form_isFormSubmitted = True
            else:
                c.form_isFormSubmitted = False
                response = ExerciseManager.createErrorReport(params = params, category = 'question') 
                if response is not None:
                    return render_jinja2('exercise/report_error_complete.html')

        except formencode.validators.Invalid, error:
            c.form_success = None
            c.form = error.value
            c.form_errors = error.error_dict or {}
        except Exception, e:
            log.exception(e)
            c.form_success = None
            c.form_error = messages.ERROR_REPORT_SAVE_FAILED

        response = ExerciseManager.getQuestion(questionClass = question_class, questionID = question_id, check_approval=False, params = params)
        if response and response.has_key('question'):
            c.question = response['question']
        else:
            c.question = None
            c.form_display_error = messages.ERROR_REPORT_FORM_DISPLAY_FAILED 
        
        return render_jinja2('exercise/report_error.html')
    
    @login_required()
    def create_test(self):
        params = request.params
        if params.has_key('e_title'):
            c.incoming_ex_title = params['e_title']
        
        if params.has_key('encoded_id'):
            c.encoded_id = params['encoded_id']
        
        if params.has_key('np'):
            c.exercise_page_url = params['np'].encode("utf-8")
            
        if params.has_key('ep'):
            c.practice_page_url = params['ep'].encode("utf-8")    
            
        if params.has_key('mtype'):
            c.type = params['mtype']
        else:
            c.type = 'practice'
        
        if params.has_key('mhandle'):
            c.mhandle = params["mhandle"]
        
        if(params.has_key('referrer')):
            c.referrer = params["referrer"]
            
        c.user_has_signedin = False
        if not SessionManager.isGuest():
            c.user_has_signedin = True
 
        return render_jinja2('exercise_ae/create_test.html')
