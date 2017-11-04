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

from pylons import request, tmpl_context as c
from flxweb.model.artifact import ArtifactManager 
from flxweb.model.exercise import ExerciseManager 
from flxweb.model.session import SessionManager
from flxweb.lib.base import BaseController
from pylons.controllers.util import abort
from pylons.templating import render_jinja2
from flxweb.lib.ck12.decorators import login_required
from pylons.i18n.translation import _
import simplejson
import urllib
from flxweb.model.conceptNode import ConceptNodeManager
from flxweb.lib import helpers as h
from pylons.controllers.util import redirect

log = logging.getLogger(__name__)

class ExerciseGeneratorController(BaseController):
    @login_required()
    def addQuestionForExercise(self, exercise_title, realm=None, ext=None):
        #Bug 13946 - as exercise has its own details page, changed artifact_type from 'lesson' to 'exercise'
        artifact_type = 'exercise'
        if request.GET.has_key('artifact_type'):
            artifact_type = request.GET['artifact_type']
        get_details = False
        ext_params = {}
        if ext:
            params = ext.split('/')
            if params[0].lower().startswith('v'):
                version = params[0].strip('v')
                ext_params['version'] = version
             
        artifact = ArtifactManager.getArtifactByPerma(artifact_type, exercise_title, realm, ext_params, details=get_details)

        if request.GET.has_key('ep'):
            artifact['exercise_page_url'] = request.GET['ep'].encode("utf-8")
        if artifact and artifact['encodedID']:
            exerciseEncodedID = ExerciseManager.getExerciseEncodedID (artifact["encodedID"])
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)
        exercise = ExerciseManager.getExercise(encodedID = exerciseEncodedID)
        log.error((_(u'Artifact obj: %(artifact["title"])s') % ({'artifact["title"]':str(artifact["title"])})).encode("utf-8"))
        if exercise == None and not SessionManager.isGuest():
            exerciseData = {}
            exerciseData['exercise_title'] = artifact["title"]
            exerciseData['exercise_desc'] = "Exercises on "+ artifact["title"]   
            exerciseData['encoded_id'] = exerciseEncodedID
            exercise = ExerciseManager.createExercise(exerciseData)

        c.artifact = artifact
        c.exercise = exercise
        c.user_has_signedin = False

        if not SessionManager.isGuest():
            c.user_has_signedin = True 	

        return render_jinja2('exercise/create_exercise.html')
  
    @login_required()
    def addQuestion(self, exercise_id):
        
        if(exercise_id == 'ae'):
            exercisePageUrl = urllib.quote(request.params['ep']) if request.params.get('ep', None) else None
            exercisePageTitle = urllib.quote(request.params['title']) if request.params.get('title', None) else None
            if not exercisePageTitle:
            	assessmentFrameURL = h.url_assessment("?question/create/") + "&ep=" + exercisePageUrl
            else:
            	assessmentFrameURL = h.url_assessment("?question/create/") + "&ep=" + exercisePageUrl +"&title="+ exercisePageTitle
            return redirect(assessmentFrameURL)    
        else:
            rawRequest = request._body__get()
            questionDict = simplejson.loads(rawRequest)
            exercise_handle = questionDict.pop('exercise_handle')
            exercise_handle = urllib.unquote(exercise_handle) 
            exerciseID, questionID, rulesError = ExerciseManager.addQuestionForExercise(exercise_id, questionDict)
            c.exercisePerma = '/exercise/'+exercise_handle
            c.questionID = questionID
            c.exerciseID = exerciseID 
            c.rulesError = rulesError
            return render_jinja2('exercise/add_question_message.html')

    @login_required()
    def deleteQuestion(self, exercise_id=None, encoded_id=None):
        questionDict = {} 
        questionDict['question_id'] = request.POST['question_id']
        questionDict['question_class'] = request.POST['question_class']
        ExerciseManager.removeQuestionFromExercise(exerciseID=exercise_id, encodedID=encoded_id, **questionDict)
        if request.POST.has_key('del_question'):
             ExerciseManager.deleteQuestion(questionDict['question_class'], questionDict['question_id'])
        return 

    @login_required()
    def previewQuestion(self, question_class, question_id):
        response = ExerciseManager.getQuestion(question_class, question_id, check_approval=False)
        if response and response.has_key('question'):
            c.question = response['question']
            if request.params.get('embed') and request.params.get('embed') == "False":
                c.embed = False
            else:
                c.embed = True 
            return render_jinja2('exercise/preview_question.html')

    @login_required()
    def keepQuestion(self, question_class, question_id):
        response = ExerciseManager.keepQuestion(question_class, question_id)
        if response:
            return response

    @login_required()
    def addQuestionForExercise_ae(self, exercise_title, realm=None, ext=None):
        #Bug 13946 - as exercise has its own details page, changed artifact_type from 'lesson' to 'exercise'
        artifact_type = 'exercise'
        param = '?'
        
        if request.GET.has_key('artifact_type'):
            artifact_type = request.GET['artifact_type']
        
        if request.GET.has_key('realm'):
            realm = request.GET['realm'] 
        if str(realm).lower() == "none":
            realm = None

        get_details = False
        ext_params = {}
        if ext:
            params = ext.split('/')
            if params[0].lower().startswith('v'):
                version = params[0].strip('v')
                ext_params['version'] = version
             
        artifact = ArtifactManager.getArtifactByPerma(artifact_type, exercise_title, realm, ext_params, details=get_details)
        
        #if artifact no longer exists for this handle abort
        if artifact == None:
            abort(404)

        if request.GET.has_key('ep'):
            artifact['exercise_page_url'] = request.GET['ep'].encode("utf-8")
        
        if request.params.has_key('conceptid'):
            conceptid = request.params['conceptid']
        else:
            conceptid = artifact["domain"]["encodedID"]
            
        c.user_has_signedin = False

        if not SessionManager.isGuest():
            c.user_has_signedin = True  
            
        if artifact_type == "asmtpracticeint":
             param = "?qType=geometry-interactive&"  
        
        if artifact.get('exercise_page_url'):
            assessmentFrameURL = h.url_assessment("?question/create/") + conceptid + param + "ep=" + artifact.get('exercise_page_url')
        else:
            assessmentFrameURL = h.url_assessment("?question/create/") + conceptid + param + "ep=" + h.url('modality_branch',branch=artifact.get_branch_handle(),handle=artifact.get('domain').get('handle'),mtype='asmtpractice',mhandle=artifact.get('handle'),qualified=True)
        
        return redirect(assessmentFrameURL) 
    
    @login_required()
    def addQuestionForConcept(self, conceptid):
        conceptNode = ConceptNodeManager.getConceptNodeInfo(conceptid)
        log.debug('addQuestionForConcept..................')
        if conceptNode:
            branchName = conceptNode.get('branch').get('name')
            branchName = h.resourceNameToHandle(branchName)
            
            if request.params.has_key('ep') and request.params.has_key('title'):
                conceptNode['exercise_page_url'] = request.params.get('ep')
                conceptNode['title'] = request.params.get('title')
            else:
                conceptNode['exercise_page_url'] = '/' + branchName.lower() + '/' + conceptNode.get('handle') +'/'
                conceptNode['title'] = conceptNode.get('name')
            
            artifact = conceptNode
            
            if artifact.get('exercise_page_url'):
                assessmentFrameURL = h.url_assessment("?question/create/") + conceptid + "&ep=" + urllib.quote(artifact.get('exercise_page_url'))
            else:
                assessmentFrameURL = h.url_assessment("?question/create/") + conceptid  + "&ep=" + h.url('modality_branch',branch=artifact.get_branch_handle(),handle=artifact.get('domain').get('handle'),mtype='asmtpractice',mhandle=artifact.get('handle'),qualified=True)
            
            return redirect(assessmentFrameURL) 
        else:
            if hasattr(request, 'url'):
                self._custom404(request.url)
            else:
                abort(404)
