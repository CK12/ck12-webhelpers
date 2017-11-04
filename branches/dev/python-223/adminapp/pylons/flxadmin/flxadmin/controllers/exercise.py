#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.

from pylons import config, request, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from pylons.decorators import jsonify
import formencode
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.exceptions import *
from flxadmin.lib.ck12.errorcodes import ErrorCodes
from flxadmin.forms.exercise import *
from flxadmin.forms.options import getviewmode

import logging
LOG = logging.getLogger( __name__ )


class ExerciseController(BaseController):
    """ for: Exercise listing, details
    """
    
    @ajax_login_required()
    def exercises_list(self, Qclass=None, Qid=None):
        """ Exercise list data, for ajax calls
        """
        template = '/exercise/exercises_list.html'
        params = dict(request.params)
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('exercises'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('hwp/get/info/exercises', params, 'exercises')

        c.viewmode = request.params.get('viewmode', getviewmode('exercises'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        c.asOverlay = Qclass and Qid
        c.Qclass = Qclass
        c.Qid = Qid
        return render(template)

    @login_required()
    def exercises(self, Qclass=None, Qid=None):
        """ Exercise listing page, client should call exercies_list() for data
        """
        template = '/exercise/exercises.html'
        c.pagetitle = 'Exercises'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('exercises'))
        c.from_view = request.params.get('from_view', '')
        c.form = ExercisesForm()
        c.asOverlay = Qclass and Qid
        c.Qclass = Qclass
        c.Qid = Qid
        c.query = request.query_string
        return render(template)

    @login_required()
    @jsonify
    def associate(self, Qclass, Qid, Eid):
        params = {
         'bundle_id': Eid,
         'question_id': Qid,
         'question_class': Qclass,
        }
        return h.api_post('hwp/create/exercise/association', params,
            "Question successfully added to exercise "+Eid)

    @login_required()
    @jsonify
    def deassociate(self, Qclass, Qid, Eid):
        params = {
         'question_id': Qid,
         'question_class': Qclass,
        }
        return h.api_post('hwp/delete/exercise/association/'+Eid, params,
            "Question successfully removed from exercise "+Eid)

    @login_required()
    def exercise(self, id):
        """ Exercise Details
        """
        template = '/exercise/exercise.html'
        c.pagetitle = 'Exercise Details'

        prvlink = 'exercises'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = ExerciseForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.id = id

        data = h.api('hwp/get/info/exercise/'+id, {'nocache':'true'})
        c.exercise = h.traverse(data, ['response', 'exercise'])
        c.levels = c.exercise.get('difficultyLevels') or []
        Qs = c.exercise.get('questions') or []
        decls = [str(q['questionID']) for q in Qs if q.get('questionClass')=='declarative']
        genrs = [str(q['questionID']) for q in Qs if q.get('questionClass')=='generative']
        sep = ', '
        defaults = {
         'declarative_questions': sep.join(decls), 
         'generative_questions':  sep.join(genrs),
        } 
        defaults.update(c.exercise)

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), defaults)

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = h.keep_only(c.form_result, {
             'encodedID': 'encoded_id',
             'title': 'exercise_title',
             'description': 'exercise_desc',
             'declarative_questions': '',
             'generative_questions': '',
            })
            post_data = h.api_post('hwp/update/exercise/'+id, params, 
                'Exercise Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                return htmlfill.render(render(template), c.form_result)
        return redirect(request.url)

    @ajax_login_required()
    def questions_list(self, Qclass, Eid=None):
        """ Questions list data, for ajax calls
        """
        template = '/exercise/questions_list.html'
        params = dict(request.params)
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('/questions/'+Qclass), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('hwp/get/info/questions/'+Qclass, params, 'questions')

        c.viewmode = request.params.get('viewmode', getviewmode('questions'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        c.asOverlay = Qclass and Eid
        c.Qclass = Qclass
        c.Eid = Eid 
        return render(template)

    @login_required()
    def questions(self, Qclass, Eid=None):
        """ Questions listing page, client should call questions_list() for data
        """
        template = '/exercise/questions.html'
        c.pagetitle = Qclass.capitalize()+' Questions'
        c.crumbs = h.htmlalist(['home'])
        c.form = QuestionsForm()
        c.asOverlay = Qclass and Eid
        c.Qclass = Qclass
        c.Eid = Eid 
        c.query = request.query_string
        c.viewmode = request.params.get('viewmode', getviewmode('questions'))
        return render(template)

    @login_required()
    def question(self, Qclass, Qid):
        """ Question Details
        """
        template = '/exercise/question.html'
        c.pagetitle = 'Question Details'

        prvlink = '/questions/'+Qclass
        prvcrumb = (prvlink, Qclass.capitalize()+' Questions')
        c.crumbs = h.htmlalist(['home', prvcrumb])
        c.form = QuestionForm()
        c.valid_text = "Save as Valid"
        c.invalid_text = "Save as Invalid"
        c.isGenerative = Qclass.lower() == 'generative'
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.Qclass = Qclass
        c.Qid = Qid

        data = h.api('hwp/get/info/question/%s/%s' % (Qclass, Qid))
        c.question = h.traverse(data, ['response', Qclass])

        exercises = c.question.get('parentExercises') or []
        exer_ids = [e.get('id') for e in exercises]
        exer_links = [h.htmla_('/exercise/%d'%id, str(id)) for id in exer_ids]
        exer_links_fmtd = h.pprint(exer_links)

        from_view = 'from_view=pane' if c.is_pane else ''
        exers_filter_param = ';'.join(['id,%d'%id for id in exer_ids])
        exers_show = h.htmla_('/exercises/%s/%s?filters=%s&%s' % \
         (Qclass, Qid, exers_filter_param, from_view), '[Show/Deassociate]', '', 'wiz')
        exers_add = h.htmla_('/exercises/%s/%s?%s' % \
         (Qclass, Qid, from_view), '[Add]', '', 'wiz')
        exer_wizs = '%s &nbsp; %s'%(exers_show, exers_add) if exer_ids else exers_add
        exers_fmtd = '%s &nbsp; %s'%(exer_links_fmtd, exer_wizs) if exer_ids else exers_add

        errors_data = h.api('hwp/get/info/error/reports/question/%s/%s' % (Qclass, Qid))
        errors = h.traverse(errors_data, ['response', 'errorReports'])
        errors_links = [h.idlink('/hwerror/', e, 'id') for e in errors if e.get('id')]

        c.fmtd = {
         'exercise_ids': h.pprint(exer_ids, False),
         'exercises': exers_fmtd,
         'errors': errors_links,
        }
        c.deletable = len(exercises) == 0

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            defaults = dict(c.question)
            defaults.update(h.answer_defaults(c.question, c.isGenerative))
            return htmlfill.render(render(template), defaults)
        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = h.keep_only(c.form_result, {
             'difficultyLevel': 'difficulty_level',
             'questionTypeID': 'questiontype_id',
             'displayText': 'display_text',
             'instanceRules': 'instance_rules',
             'question_options': '',
             'answer': 'algebraic_text',
             'answer_text': 'answer_display_text', # answer_text generated by h.answer_*()
            })
            params['is_valid'] = 'T' if request.params['saveas']==c.valid_text else 'F'
            if params['is_valid'] == 'T' and not c.question.get('approvedBy'):
                params['approved_by'] = c.user.get('id')
            # API requires approved_by to be int, uncomment if API is fixed
            # elif params['is_valid'] == 'F':
            #     params['approved_by'] = None 

            post_data = h.api_post('hwp/update/question/%s/%s' % (Qclass, Qid), params, 
                'Question Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                form_result = h.remove_attrs(c.form_result, 'saveas')
                form_result['isValid'] = params['is_valid']
                form_result['questionTypeID'] = c.question.get('questionTypeID')
                return htmlfill.render(render(template), form_result)
        return redirect(request.url)

    def exerciseUploaderForm(self):
        return self._exerciseUploaderForm()

    def _exerciseUploaderForm(self):
        
        template = '/flxadmin/uploader/uploadExercise.html'
        c.crumbs = h.htmlalist(['home'])
        c.input_id = 'exercises/form'
        c.pagetitle = 'Bulk Upload'
        return render(template)
    
    @login_required()
    def uploadExerciseDocs(self):
        try:
            params = {}
            cache_dir    = config.get('cache_share_dir')
            prvlink = '/upload/exercises/form'
            prvcrumb = (prvlink, 'Bulk Upload')
            c.crumbs = h.htmlalist(['home',prvcrumb])
            c.pagetitle = 'Upload Exercises Results'
            if request.params.has_key('file'):
                savedFile = h.saveUploadedFile(request, 'file', dir=cache_dir, allowedExtenstions=['csv'])
                fileObject = open(savedFile , 'r')
                params['file'] = fileObject
                params['filename'] = savedFile
                c.data = h.api_post('/hwp/upload/docs/exercises',params,'Your document has been uploaded successfully',multipart=True)
                c.success = h.flash.pop_message()
            return render('/flxadmin/uploader/exercisesUploadResults.html')
        except Exception as e:
            LOG.error(' uploadExerciseDocs Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPLOAD_EXERCISES
            c.errorDesc = ErrorCodes.get_description(c.errorCode)
            return render('/flxadmin/error/showCode.html')
        
    @ajax_login_required()
    def hw_errors_list(self):
        """ Error Reports list data, for ajax calls
        """
        template = '/exercise/hwerrors_list.html'
        params = dict(request.params)

        if h.int_in_search(params, 'hwp/get/info/error/report/', 'errorReport'):
            return render(template)
            
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('hwerrors'), dict(params))
        pageNum = h.modify_page_attrs(params, pageSize)
        result, total = h.page_get('hwp/get/info/error/reports', params, 'errorReports')

        c.viewmode = request.params.get('viewmode', getviewmode('hw_errors'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @login_required()
    def hw_errors(self):
        """ Questions listing page, client should call questions_list() for data
        """
        template = '/exercise/hwerrors.html'
        c.pagetitle = 'Exercise Error Reports'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('hw_errors'))
        c.form = ErrorsForm()
        return render(template)

    @login_required()
    def hw_error(self, id):
        """ Exercise Error Report Details
        """
        template = '/exercise/hwerror.html'
        c.pagetitle = 'Error Report Details'

        _prvlink = 'hwerrors'
        prvlink = (_prvlink, 'Exercise Error Reports')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url(_prvlink)
        c.form = ErrorForm()
        c.save_prefix = 'Save as '

        data = h.api('hwp/get/info/error/report/'+id)
        c.hwerror = h.traverse(data, ['response', 'errorReport'])

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), c.hwerror)

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            keep = 'response variableValueMap'.split()
            params = h.keep_only(c.form_result, keep)
            params = h.rename_attrs(params, {'variableValueMap': 'variable_value_map'})
            status = request.params['newstatus'].replace(c.save_prefix, '')

            params['status'] = 'RESOLVED-'+status if status != 'NEW' else status
            params['reviewed_by'] = c.user.get('id')
            post_data = h.api_post('hwp/update/error/report/'+id, params, 
                'Error Report Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                form_result = h.remove_attrs(c.form_result, 'newstatus')
                form_result['status'] = params['status']
                return htmlfill.render(render(template), form_result)
        return redirect(request.url)


    # raw json renderers, for url type-ins, not called in app
    @login_required()
    @jsonify
    def exercise_raw(self, id):
        return h.api_raw('hwp/get/info/exercise/'+id, {'nocache':'true'})

    @login_required()
    @jsonify
    def exercises_raw(self):
        return h.api_raw('hwp/get/info/exercises', 
            {'pageSize':25, 'sort':'updateTime,desc'})

    @login_required()
    @jsonify
    def question_raw(self, Qclass, id):
        return h.api_raw('hwp/get/info/question/%s/%s' % (Qclass, id))

    @login_required()
    @jsonify
    def questions_raw(self, Qclass):
        return h.api_raw('hwp/get/info/questions/'+Qclass,
            {'pageSize':25, 'sort':'updateTime,desc'})

    @login_required()
    @jsonify
    def hw_errors_raw(self):
        return h.api_raw('hwp/get/info/error/reports',
            {'pageSize':25, 'sort':'updateTime,desc'})

    @login_required()
    @jsonify
    def hw_error_raw(self, id):
        return h.api_raw('hwp/get/info/error/report/'+id)
