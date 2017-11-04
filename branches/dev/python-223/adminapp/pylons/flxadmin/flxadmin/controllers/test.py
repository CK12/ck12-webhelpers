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

from pylons import config, session, request, tmpl_context as c
from pylons.templating import render_jinja2 as render
from pylons.controllers.util import redirect
from pylons import url
from formencode import htmlfill
from webhelpers import paginate

from flxadmin.lib import helpers as h
from flxadmin.lib.decorators import login_required, ajax_login_required
from flxadmin.lib.base import BaseController
from flxadmin.lib.remoteapi import RemoteAPI
from flxadmin.lib.ck12.exceptions import *
from flxadmin.forms.test import *
from flxadmin.forms.options import getviewmode, external_question_type_choices, entity_types
from flxadmin.model.user import UserManager
import json, urllib
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from base64 import b64decode, b64encode
import logging
LOG = logging.getLogger( __name__ )
log = LOG

class TestController(BaseController):
    """ for: Exercise listing, details
    """
    
    def __init__(self):
        self.questionObjectTypes = { 'Q':'question','QP':'pool'}
    
    @ajax_login_required()
    def tests_list(self, Qclass=None, Qid=None):
        """ Test list data, for ajax calls
        """
        template = '/assessment/tests_list.html'
        params = dict(request.params)
        pageSize = 25
        pageUrl = paginate.PageURL(h.url_('tests'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        params_dict = {}
        if params and params['filters']: 
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld and filterVal:
                    if filterFld in ['testTypeID', 'isPublic']:
                        if params_dict.has_key('filters'):
                            params_dict['filters'] = params_dict.get('filters') + ";" +  typeFilter
                        else:
                            params_dict['filters'] = typeFilter

        if params and params['sort']:
            params_dict['sort'] = params['sort']

        if params and params.has_key('search') and params['search']:
            for searchType in params['search'].split(';'):
                if 'encodedIDs,' in searchType or 'ownerID,' in searchType:
                    searchField = 'encodedIDs,'
                    if 'ownerID,' in searchType :
                        searchField = 'ownerID,'
                    eid_list = []
                    for eid in searchType.split(',')[1:]:
                        if eid.strip():
                            eid_list.append("%s%s" % (searchField,eid.strip()))
                    if params_dict.has_key('filters'):
                        params_dict['filters'] = params_dict['filters'] + ";" + ';'.join(eid_list)
                    else:
                        params_dict['filters'] = ';'.join(eid_list)
                if 'title,' in searchType:
                    params_dict['search'] = searchType.strip()

        params_dict['pageNum'] = params['pageNum']
        params_dict['pageSize'] = params['pageSize']
        params_dict['getAll'] = True
        result, total = h.page_get('assessment/api/browse/info/tests', params_dict, 'tests')
        c.viewmode = request.params.get('viewmode', getviewmode('exercises'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        c.asOverlay = Qclass and Qid
        c.Qclass = Qclass
        c.Qid = Qid
        return render(template)

    @login_required()
    def tests(self, Qclass=None, Qid=None):
        """ test listing page, client should call tests_list() for data
        """
        template = '/assessment/tests.html'
        c.pagetitle = 'Tests'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('exercises'))
        c.from_view = request.params.get('from_view', '')
        
        c.form = TestsForm()
        testTypes = [('testTypeID,'+s['_id'], s['name'].capitalize()) for s in self.getAllTestTypes()]
        c.form.type_sel = [('testTypeID,', 'All')]
        c.form.type_sel.extend(testTypes)
        user = session.get( 'user' )
        c.loggedInUserID = user.get('id')

        c.asOverlay = Qclass and Qid
        c.Qclass = Qclass
        c.Qid = Qid
        c.query = request.query_string
        return render(template)

    def getQuestionObjectCode(self, objectName):
        for code, name in self.questionObjectTypes.items():
            if name == objectName:
                return code 
        # Special case
        if objectName == 'questionset':
            return 'EID'

    def getObjectIDsString(self,Qs):
        sitems = []
        include_published_questions = True
        
        for item in Qs:
            code = self.getQuestionObjectCode(item['type'])
            # exercise(encodedID)
            if item.has_key('encodedID'):
                sdict = {}
                sdict['type'] = 'questionset'
                sdict['encodedID'] = item['encodedID']
                sdict['count'] = item['count']
                if item.has_key('level'):
                    include_published_questions = False
                    sdict['level'] = item['level']
                sitems.append(sdict)
            # pool 
            elif item.has_key('items'):
                poolItems = []
                for each in item['items']:
                    poolItems.append(each['id'])
                sdict = {}
                sdict['items'] = poolItems
                sdict['type'] = 'questionpool'  
                sitems.append(sdict)   
            # question  
            else:
                sdict = {}
                sdict['id'] =item['id']
                sdict['type'] = 'question'
                sitems.append(sdict)
                
        self.include_more_published_questions = include_published_questions
        sitems = json.dumps(sitems)
        return sitems

    @login_required()
    def test(self, id):
        """ Test Details
        """
        template = '/assessment/test.html'
        c.pagetitle = 'Test Details'

        prvlink = 'tests'
        c.crumbs = h.htmlalist(['home', prvlink])
        c.form = TestForm()
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.id = id

        data = h.api('/assessment/api/get/detail/test/'+id, params={'itemDetails':True})
        c.test = h.traverse(data, ['response', 'test'])

        c.enable_show_edit_link = True
        c.include_more_published_questions = False
        if c.test :
            user = session.get( 'user' )
            c.loggedInUserID = user.get('id')
            c.levels = c.test.get('difficultyLevels') or []
            c.testItemsJSON = []
            Qs = c.test.get('items') or []
            if c.test.has_key('itemsInput'):
                Qs = c.test.get('itemsInput')
                c.enable_show_edit_link = False
                c.testItemsJSON = json.dumps(c.test.get('itemsInput'));
            defaults = {
                'questions': self.getObjectIDsString(Qs)
            } 
            # Disable show/edit questions link for 'sim interactive practice'
            if (c.test['testType'].get('name')).lower() == 'sim interactive practice':
                c.enable_show_edit_link = False
            
            c.test['policies'] = json.dumps(c.test['policies'])
            if c.test.has_key('encodedIDs'):
                c.test['encodedIDs'] = ', '.join(c.test['encodedIDs']) 
            c.testTypes = [(s['_id'], s['name'].capitalize()) for s in self.getAllTestTypes()]
            if c.test['testType']['name'] in ['practice','quiz'] and c.test['owner']['uID'] == 3 and c.test.has_key('itemsInput'):
                c.include_more_published_questions = self.include_more_published_questions
            c.test['testType'] = c.test['testType']['_id']
            defaults.update(c.test)

        if request.method == 'GET':
            c.success = h.flash.pop_message()

            if c.test :
                return htmlfill.render(render(template), defaults)
            else:
                return htmlfill.render(render(template))

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = h.keep_only(c.form_result, {
             'handle': 'handle',
             'title': 'title',
             'description': 'description',
             'testType': 'testTypeID',
             'encodedIDs':'encodedIDs',
             'policies':'policies',
             'questions':'items',
             'isPublic':'isPublic'
            })
            # 15812 - Set testTypeID to original test type, as test type dropdown is disabled right now
            #Remove this line, once test type drop down is enabled 
            if c.test.get('testType', None):
                params['testTypeID'] = c.test['testType']
            post_data = h.api_post('/assessment/api/update/test/%s'%id, params, 
                'Test Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                c.testTypes = [(s['_id'], s['name'].capitalize()) for s in self.getAllTestTypes()]
                defaults.update(c.form_result)
                return htmlfill.render(render(template), defaults)
        return redirect(request.url)

    @ajax_login_required()
    def updateTest(self, Tid=None):
        if Tid:
            try:
                params = dict(request.params)
                if Tid == 'new':
                    api_url = ''
                else:
                    api_url = 'api/update/test/%s'%Tid
                result = RemoteAPI.makeAssessmentCall(api_url, params)
                
                if 'responseHeader' in result and result['responseHeader']['status'] == 0:
                    data = h.api('/assessment/api/get/detail/test/'+Tid)
                    c.test = h.traverse(data, ['response', 'test'])
                    c.items = c.test.get('items')
                    c.objectIDsString = self.getObjectIDsString(c.items)
                    if c.test.has_key('testType') and c.test['testType']['name'] == 'interactive practice':
                        for item in c.items :
                            displayText = item['object']['questionData']['stem']['displayText']
                            soup = BeautifulSoup(h.safe_encode(displayText))
                            for tag in soup.find_all('div'):
                                tag.replaceWith('')
                            item['object']['questionData']['stem']['displayText'] = soup.get_text()
                        plixLink = [] 
                        if c.items and isinstance(c.items ,list) and c.test['items'][0].has_key('object'):
                            object = c.test['items'][0]['object']
                            for i in object['tags']['iloIDs']:
                                id = str(i)
                                plixLink.append("<a href=%sassessment/question/%s target='_blank'>%s</a>" %(config.get('webroot_url','/flxadmin/'), id, id))
                                c.test['plixLink'] = ', '.join(plixLink)   
                    test_items = render("/assessment/test_questions_list.html")
                    result['response'] = test_items
                return json.dumps(result)
            except Exception, e:
                return json.dumps({'status':'error','response':e.api_message})
    
    @login_required()
    def createOrUpdateTest(self, Action, Tid=None):
        return self.questions(Tid, Action == 'new')
    
    @ajax_login_required()
    def questions_list(self, asOverlay=False, mismatchedLevel=False):
        """ Questions list data, for ajax calls
        """
        fldMappings = {'title': 'questionData.stem.displayText', 'eids': 'encodedIDs',}
        template = '/assessment/questions_list.html'
        params = dict(request.params)
        pageSize = 25
        params_dict = {}
        Qclass = []
        if params and params['filters']: 
            for typeFilter in params['filters'].split(';'):
                filterFld, filterVal = typeFilter.split(',')
                if filterFld and filterVal:
                    if 'questionTypeID' == filterFld:
                        # Append selected quetion types(changed for multiselect)
                        Qclass.append(self.getQuestionType(filterVal))
                    if filterFld in ['tags.level', 'tags.grades', 'isPublic', 'generative', 'draft']:
                        if 'draft' == filterFld and filterVal.lower() == 'false' or (filterFld == 'isPublic' and 'draft,true' in params['filters'].lower()) :
                            continue
                        if params_dict.has_key('filters'):
                            params_dict['filters'] = params_dict.get('filters') + ";" +  typeFilter
                        else:
                            params_dict['filters'] = typeFilter
                    if filterFld == 'contributedBy':
                        params_dict['contributedBy'] = filterVal
                    if filterFld == 'rejectedOnly' and filterVal.lower() == 'true' :
                        params_dict['rejectedOnly'] = filterVal
                    if filterFld == 'withIlosOnly':
                        params_dict['withIlosOnly'] = filterVal
                    if filterFld == 'withHintsOnly':
                        params_dict['withHintsOnly'] = filterVal
                    if filterFld == 'withModalityOnly' and filterVal.lower() == 'true' :
                        params_dict['withModalityOnly'] = filterVal
        
        if params and params['sort']:
            params_dict['sort'] = params['sort']
            
        if params and params.has_key('otherQType') and params['otherQType']:
            params_dict['otherQType'] = params['otherQType']

        if params and params.has_key('search') and params['search']:
            LOG.debug("Search param: %s" % params['search'])
            for searchType in params['search'].split(';'):
                if 'encodedIDs,' in searchType or 'ownerID,' in searchType:
                    searchField = 'encodedIDs,'
                    if 'ownerID,' in searchType :
                        searchField = 'ownerID,'
                    eid_list = []
                    for eid in searchType.split(',')[1:]:
                        if eid.strip():
                            eid_list.append("%s%s" % (searchField,eid.strip()))
                    if params_dict.has_key('filters'):
                        params_dict['filters'] = params_dict['filters'] + ";" + ';'.join(eid_list)
                    else:
                        params_dict['filters'] = ';'.join(eid_list)
                LOG.debug("Search type: %s" % searchType)
                if searchType.startswith('special,'):
                    searchType = searchType.replace('special,', '')
                    LOG.debug("searchParts: %s" % searchType)
                    #Bug-29280, if only field and no term specified
                    try:
                        fld, term = searchType.split(',')
                        fld = fldMappings.get(fld, fld)
                        params_dict['search'] = "%s,%s" % (fld, term.strip())
                    except:
                        pass
                elif searchType.startswith('title,'):
                    searchType = searchType.replace('title,', '')
                    searchField = fldMappings.get('title')
                    params_dict['search'] = "%s,%s" %(searchField,searchType)
                    if params_dict and params_dict['sort']:
                        params_dict['sort'] = 'language,asc;%s' % params_dict['sort']
                    else:
                        params_dict['sort'] = 'language,asc' 
        
        Qclass = ','.join(Qclass)
        if not Qclass:
            QTypes = self.getAllQuestionTypes()
            if  params.has_key('non_Ilo_and_non_Geometry'):
                QTypes.remove('geometry-interactive')
                QTypes.remove('ilo-component')
            Qclass = ','.join(QTypes)
        pageUrl = paginate.PageURL(h.url_('/questions/'+Qclass), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        params_dict['pageNum'] = params['pageNum']
        params_dict['pageSize'] = params['pageSize']
        params_dict['details'] = True
        params_dict['getAll'] = True
        if mismatchedLevel:
            params_dict['mismatchedLevelOnly'] = True
        # Show only questions having ilos, while updating 'interactive practice' test 
        if params.has_key('interactivePractice'):
            params_dict['withIlosOnly'] = True
        result, total = h.page_get('assessment/api/browse/info/questions/'+Qclass,params_dict,'questions')
        c.viewmode = request.params.get('viewmode', getviewmode('questions'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        c.Qclass = Qclass
        c.asOverlay = asOverlay
        c.mismatchedLevel = mismatchedLevel
        return render(template)

    @login_required()
    def questions(self, Tid=None, forNewTest = False):
        """ Questions listing page, client should call questions_list() for data
        """
        template = '/assessment/questions.html'
        c.pagetitle = 'Questions'
        c.crumbs = h.htmlalist(['home'])
        c.form = QuestionsForm()
        QTypes = self.getAllQuestionTypes()
        Qclass = ','.join(QTypes)
        c.asOverlay = False
        user = session.get( 'user' )
        c.loggedInUserID = user.get('id')
        non_Ilo_and_non_Geometry = False
        isInteractivePractice = False
        # 'Add question as pool' link
        c.showPoolLink = False
        # Keep it true only on questions list page(to update EID and levels of multiple questions), not for new test, test questions list page etc. 
        c.questionsList = True
        if Tid or forNewTest:
            if request.referer and 'test/' in request.referer:
                prvlink = (request.referer, 'Test')
                c.crumbs = h.htmlalist(['home', prvlink])
            else:
                prvlink = 'tests'
                c.crumbs = h.htmlalist(['home', prvlink])
            if Tid:
                c.invalid_questions_format = False
                data = h.api('/assessment/api/get/detail/test/'+Tid)
                c.test = h.traverse(data, ['response', 'test'])
                if c.test.has_key('itemsInput'):
                    h.set_error("Unsupported test question format in edit mode.")
                    c.invalid_questions_format = True
                else:
                    c.items = c.test.get('items')
                    if c.test.has_key('testType') and c.test['testType']['name'] == 'interactive practice':
                        items = c.test.get('items')
                        for item in c.items:
                            if item.has_key('object'):
                                displayText = item['object']['questionData']['stem']['displayText']
                                soup = BeautifulSoup(h.safe_encode(displayText))
                                for tag in soup.find_all('div'):
                                    tag.replaceWith('')
                                item['object']['questionData']['stem']['displayText'] = soup.get_text()
                                # Get the plix id
                                if item['object']['tags'].has_key('iloIDs') and item['object']['tags']['iloIDs']:
                                    plixLink = []
                                    for i in item['object']['tags']['iloIDs']:
                                        id = str(i)
                                        plixLink.append("<a href=/assessment/tools/geometry-tool/plix.html?eId=%s&questionId=%s&artifactID=%s&preview=true&backUrl=/flxadmin/assessment/question/%s  target=_bla> %s</a>" %( item['object']['encodedIDs'][0],id,c.test['artifactID'],id,id))
                                    item['object']['tags']['iloIDs'] = ', '.join(plixLink)
                                                      
                    c.test_items = render("/assessment/test_questions_list.html")
                if c.test.has_key('testType'):
                    if c.test['testType']['name'] == 'interactive practice':
                        isInteractivePractice = True
                    if c.test['testType']['name'] == 'practice' or c.test['testType']['name'] == 'quiz':
                        c.showPoolLink = True
            
            c.forTest = True
            c.asOverlay = True
            c.forceAsOverlay = True
            non_Ilo_and_non_Geometry = True
            if forNewTest:
                c.pagetitle = 'Create Test'
                testTypes = {}
                for tt in self.getAllTestTypes():
                    # Don't allow to create 'sim interactive practice'(these tests are created by a periodic task in assessment)
                    if tt['name'].lower() != 'sim interactive practice':
                        # Don't show practice in drop-down unless user is 'ck12editor'
                        if (user.get('login')).lower() == 'ck12editor':
                            testTypes[tt['_id']] = tt['name'].capitalize()
                        elif tt['name'].lower() != 'practice' and tt['name'].lower() != 'interactive practice':
                            testTypes[tt['_id']] = tt['name'].capitalize()
                c.testTypes = testTypes
                template = '/assessment/new_test.html'
                c.questionsList = False
            else:
                c.pagetitle = 'Edit Test'
                template = '/assessment/manage_test_questions.html'
                c.questionsList = False
        if c.form.select_all_checkbox not in c.form.listhead:
            c.form.listhead.insert(0,c.form.select_all_checkbox)
        c.Qclass = Qclass   
        c.query = request.query_string
        
        if non_Ilo_and_non_Geometry:
#             c.form.type_sel = [i for i in c.form.type_sel if i[1]!='Ilo Component' and i[1]!='Geometry Interactive']
            c.form.type_sel = c.form.new_test_type_sel
            c.query = 'non_Ilo_and_non_Geometry'
        
        # Show only questions having ilos, while updating 'interactive practice' test 
        if isInteractivePractice:
            c.query = 'interactivePractice'
        c.viewmode = request.params.get('viewmode', getviewmode('questions'))
        return render(template)

    @login_required()
    def published_questions(self, Tid=None):
        """ Published Questions listing page, client should call questions_list() for data
        """
        template = '/assessment/published_questions.html'
        c.pagetitle = 'Questions'
        c.asOverlay = False
        user = session.get( 'user' )
        c.loggedInUserID = user.get('id')
        if Tid :
            data = h.api('/assessment/api/get/detail/test/'+Tid)
            c.test = h.traverse(data, ['response', 'test'])
            itemsInput = c.test.get('itemsInput')
        if request.method == 'GET':
            eid_info = []
            for item in itemsInput:
                eid_item = {}
                eid_item['encodedID'] = item['encodedID']
                eid_item['conceptName'] = item['conceptNode']['name']
                eid_item['count_in_test'] = item['count']
                eid_info.append(eid_item)
            eid_info_result = []
            for eid_item in eid_info:
                params = {}
                params['eids'] = '%s' % eid_item['encodedID']
                params['getAll'] = True
                params['filters'] = 'isPublic,%s' % True
                result, total = h.page_get('assessment/api/browse/info/questions/question', params, 'questions')
                eid_item['total_count'] = total
                eid_info_result.append(eid_item)
            c.eid_item = eid_info_result
            c.asOverlay = True
        elif request.method == 'POST':
            try:
                params = {
                          'handle': c.test['handle'],
                          'title': c.test['title'],
                          'description': c.test['description'],
                          'testTypeID': c.test['testType']['_id'],
                          'encodedIDs': c.test['encodedIDs'],
                          'policies': json.dumps(c.test['policies']),
                          'items': request.params.get('items'),
                          'isPublic': c.test['isPublic']
                          }
                result = RemoteAPI.makeAssessmentCall('api/update/test/%s'%Tid, params)
                return json.dumps(result)
            except Exception, e:
                return json.dumps({'status':'error','response':e.api_message})
        return render(template)

    @login_required()
    def mismatched_level_questions(self):
        """ Mismatched level questions listing page, client should call questions_list() for data
        """
        template = '/assessment/mismatched_level_questions.html'
        c.pagetitle = 'Questions for Review'
        c.crumbs = h.htmlalist(['home'])
        c.form = MismatchedQuestionsForm()
        QTypes = self.getAllQuestionTypes()
        Qclass = ','.join(QTypes)
        c.asOverlay = False
        user = session.get( 'user' )
        c.loggedInUserID = user.get('id')
        if c.form.select_all_checkbox not in c.form.listhead:
                c.form.listhead.insert(0,c.form.select_all_checkbox)
        c.Qclass = Qclass
        c.query = request.query_string
        c.viewmode = request.params.get('viewmode', getviewmode('questions'))
        return render(template)
    
    def getAllQuestionTypes(self, fullData=False):
        params_dict = {'pageSize':100}
        result, total = h.page_get('assessment/api/browse/info/questionTypes',params_dict, 'questionTypes')
        if fullData:
            return result
        result = [res['name'] for res in result]
        return result 
    
    def getAllTestTypes(self):
        params_dict = {}
        result, total = h.page_get('assessment/api/get/info/testTypes',params_dict, 'testTypes')
        return result
    
    def getAllErrorTypes(self):
        params_dict = {}
        result = RemoteAPI.makeAssessmentGetCall('api/get/info/errorTypes',params_dict)
        return result['response']

    def getQuestionTypeID(self,questionType):
        typeID =  1
        if questionType == 'true-false' :
            typeID = 2 
        elif questionType == 'multiple-choice':
            typeID = 3
        elif questionType == 'select-all-that-apply':
            typeID = 4
        elif questionType == 'fill-in-the-blanks':
            typeID = 5
        elif questionType == 'geometry-interactive':
            typeID = 6
        elif questionType == 'ilo-component':
            typeID = 7
        elif questionType == 'sim-interactive':
            typeID = 8
        elif questionType == 'highlight-the-words':
            typeID = 9
        elif questionType == 'drag-and-drop':
            typeID = 10
        elif questionType == 'discussion':
            typeID = 11
        return typeID

    def getQuestionType(self,questionTypeID):
        Qtype =  'short-answer'
        if int(questionTypeID) == 2:
            Qtype = 'true-false'
        elif int(questionTypeID) == 3:
            Qtype = 'multiple-choice'
        elif int(questionTypeID) == 4:
            Qtype = 'select-all-that-apply'
        elif int(questionTypeID) == 5:
            Qtype = 'fill-in-the-blanks'
        elif int(questionTypeID) == 6:
            Qtype = 'geometry-interactive'
        elif int(questionTypeID) == 7:
            Qtype = 'ilo-component'
        elif int(questionTypeID) == 8:
            Qtype = 'sim-interactive'
        elif int(questionTypeID) == 9:
            Qtype = 'highlight-the-words'
        elif int(questionTypeID) == 10:
            Qtype = 'drag-and-drop'
        elif int(questionTypeID) == 11:
            Qtype = 'discussion'
        return Qtype
    
    def getAllBranches(self):
        params_dict = {'pageSize':100}
        result = RemoteAPI.makeTaxonomyGetCall('get/info/branches',params_dict)
        return result['response']['branches']
    
    '''
        Get dict of branchIDs to branchNames mapping(eg: {"MAT.ALG":"Algebra", "MAT.GEO":"Geometry"})
    '''
    def getEIDBranchMapping(self):
        branches = self.getAllBranches()
        branchMap = {}
        for branch in branches:
            key = branch['subjectID']+'.'+branch['shortname']
            branchMap[key] = branch['name']
        return branchMap
    
    def getAllSubjects(self):
        params_dict = {}
        result = RemoteAPI.makeTaxonomyGetCall('get/info/subjects',params_dict)
        return result['response']['subjects']
    
    '''
        Update the questionData based on the edit done directly on question detail page
    '''
    def getUpdatedQuestionData(self, questionObjData, request, qTypeName):
        # Correct and wrong answer count for the given question
        correctAnsCount = 0
        wrongAnsCount = 0
        # Updated questionData(qData)
        qData = questionObjData
        # responseObjects
        resObj = []
        displayOrder = 1  
        
        for ro in questionObjData['responseObjects']:
            if ro['isCorrect'] == 'T':
                correctAnsCount += 1 
                option = {}
                # isCorrect 
                option['isCorrect'] = 'T'
                # displayText
                if request.params.has_key('answer%s' % correctAnsCount):
                    option['displayText'] = request.params['answer%s' % correctAnsCount]
                # feedback
                if request.params.has_key('ansFeedback%s' % correctAnsCount) and request.params['ansFeedback%s' % correctAnsCount]:
                    option['feedback'] = request.params['ansFeedback%s' % correctAnsCount]
                # feedbackWrong
                if request.params.has_key('ansFeedbackWrong%s' % correctAnsCount) and request.params['ansFeedbackWrong%s' % correctAnsCount]:
                    option['feedbackWrong'] = request.params['ansFeedbackWrong%s' % correctAnsCount]
                # variations
                if request.params.has_key('ansVariations%s' % correctAnsCount) and request.params['ansVariations%s' % correctAnsCount]:
                    option['variations'] = [v.strip() for v in request.params['ansVariations%s' % correctAnsCount].split(',')]
                # displayOrder(Do not add it for short-answer questions)
                if qTypeName != 'short-answer':
                    option['displayOrder'] = displayOrder
                displayOrder += 1
                resObj.append(option)
            else:
                wrongAnsCount += 1
                option = {}
                # isCorrect 
                option['isCorrect'] = 'F'
                # displayText
                if request.params.has_key('distractor%s' % wrongAnsCount) and request.params['distractor%s' % wrongAnsCount]:
                    option['displayText'] = request.params['distractor%s' % wrongAnsCount]
                # feedback
                if request.params.has_key('distFeedback%s' % wrongAnsCount) and request.params['distFeedback%s' % wrongAnsCount]:
                    option['feedback'] = request.params['distFeedback%s' % wrongAnsCount]
                # displayOrder
                if qTypeName != 'short-answer':
                    option['displayOrder'] = displayOrder                   
                displayOrder += 1
                resObj.append(option)
        
        qData['responseObjects'] = resObj
        qData['stem']['displayText'] = request.params['displayText']
        qData['solution'] = request.params.get('solution','')
        return json.dumps(qData)
        
    @login_required()
    def question(self, Qid):
        """ Question Details
        """
        template = '/assessment/question.html'
        c.pagetitle = 'Question Details'
        if '&' in Qid:
            Qid = Qid. split('&')[0]
        prvlink = '/assessment/questions'
        prvcrumb = (prvlink, 'Questions')
        c.crumbs = h.htmlalist(['home', prvcrumb])
        c.form = QuestionForm()
        c.valid_text = "Update"
        
        #c.isGenerative = Qclass.lower() == 'generative'
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url_(prvlink)
        c.Qid = Qid
        params = {}
        params['hints'] = True
        # If this question is part of an interactive practice, then get interactivePId in the response
        params['interactivePracticeIds'] = True
        data = h.api('/assessment/api/get/detail/question/%s' % (Qid), params)
        c.question = h.traverse(data, ['response', 'question'])
        if c.question :
            user = session.get( 'user' )
            c.loggedInUserID = user.get('id')
            c.success = h.flash.pop_message()
            qTypeName = c.question['questionType']['name']
            if c.question.get("rejected"):
                c.question['rejected_reason'] = c.question["rejected"].get("reason")
            c.question['questionTypeID'] = self.getQuestionTypeID(qTypeName)
            c.question['questionTypeName'] = qTypeName 
            # Show the JSON(graph json data) of questionData for geometry questions at question detail page
            if qTypeName == 'geometry-interactive' or qTypeName == 'ilo-component':
                c.question['displayText'] =  c.question['questionData']
            else:
                # Replace "@@ANS_SEQ@@" place holders with blank spaces(______) for 'fill-in-the-blanks' question type
                if qTypeName == 'fill-in-the-blanks':
                    c.question['displayText'] =  c.question['questionData']['stem']['displayText'].replace("@@ANS_SEQ@@", "______")
                elif qTypeName == 'sim-interactive':
                    c.question['displayText'] =  c.question['questionData']['questionText']
                else:
                    c.question['displayText'] =  c.question['questionData']['stem']['displayText']
                if qTypeName == 'sim-interactive':
                    c.question['options'] = c.question['questionData']['answer']
                else:
                    c.question['options'] = c.question['questionData']['responseObjects']
            c.question['policies'] = json.dumps(c.question['policies'])
            c.question['solution'] = c.question['questionData']['solution'] if c.question['questionData'].has_key('solution') else ''
            c.question['difficultyLevel'] = c.question['tags']['level'] if c.question['tags'].has_key('level') else ''
            c.question['grades'] = ', '.join(str(int(grade)) for grade in c.question['tags']['grades']) if c.question['tags'].has_key('grades') else ''
            c.question['references'] = '; '.join(c.question['tags']['references']) if c.question['tags'].has_key('references') else ''
            c.question['collectionHandles'] = ', '.join(c.question['collectionHandles']) if c.question.has_key('collectionHandles') else ''
            c.question['searchTerms'] = '; '.join(c.question['tags']['searchTerms']) if c.question['tags'].has_key('searchTerms') else ''
            c.question['standards'] = ', '.join(c.question['tags']['standards']) if c.question['tags'].has_key('standards') else ''
            c.question['source'] = c.question['tags']['source'] if c.question['tags'].has_key('source') else ''
            c.question['qgrp'] = ', '.join(c.question['tags']['qgrp']) if c.question['tags'].has_key('qgrp') else ''
            c.question['hints'] = ',, '.join(c.question['hints']) if c.question.has_key('hints') else ''
            # IRT related fields
            if c.question.has_key('irt'):
                c.question['disc'] = c.question['irt']['a'] if c.question['irt'].has_key('a') else ''
                c.question['difficulty'] = c.question['irt']['b'] if c.question['irt'].has_key('b') else ''
                c.question['guessing'] = c.question['irt']['c'] if c.question['irt'].has_key('c') else ''
                c.question['irtLevel'] = c.question['irt']['level'] if c.question['irt'].has_key('level') else ''
                c.question['lastUpdated'] = c.question['irt']['updated'] if c.question['irt'].has_key('updated') else ''
                c.question['qLevel'] = c.question['irt']['tLevel'] if c.question['irt'].has_key('tLevel') else ''
            if c.question['tags'].has_key('credits'):
                tags = c.question['tags'] 
                mod_credits = []
                for credit in tags['credits']:
                    cre = ''
                    if credit.has_key('role'):
                        cre += credit['role']
                    if credit.has_key('name'):
                        cre += (':'if cre else '') + credit['name']
                    if credit.has_key('at'):
                        cre += (':'if cre else '') + h.parseISODate(credit['at'])
                    mod_credits.append(cre)
                c.question['credits'] = ';'.join(mod_credits)
                
            # Get the modalities associated with the question with link to the modality page 
            pLink = []
            pSet = []
            if c.question['tags'].has_key('pSet') and c.question['tags']['pSet']:
                for p in c.question['tags']['pSet']:
                    id = str(int(p))
                    pLink.append("<a href=%sartifact/%s target='_blank'>%s</a>" %(config.get('webroot_url','/flxadmin/'), id, id))
                    pSet.append(id)
            c.question['pSet'] = ', '.join(pSet)
            c.question['pLink'] = ', '.join(pLink)
            
            # Get the associated PLIX(geometry-interactive) questions, with link to the detail page for plix 
            plixLink = []
            iloIDs = []
            if c.question['tags'].has_key('iloIDs') and c.question['tags']['iloIDs']:
                for i in c.question['tags']['iloIDs']:
                    id = str(i)
                    plixLink.append("<a href=%sassessment/question/%s target='_blank'>%s</a>" %(config.get('webroot_url','/flxadmin/'), id, id))
                    iloIDs.append(id)
            c.question['iloIDs'] = ', '.join(iloIDs)
            c.question['plixLink'] = ', '.join(plixLink)
            
            # Get the simulations associated with the question, with title and link to the simulation page 
            simLink = []
            simTitle = []
            simIDs = []
            if c.question['tags'].has_key('simIDs') and c.question['tags']['simIDs']:
                for s in c.question['tags']['simIDs']:
                  try:
                    id = str(int(s))
                    simIDs.append(str(id))  
                    # Get the artifact(simulation) info
                    simDetail = h.get_artifact(id)
                    # Title of the simulation
                    title = simDetail['title']
                    # Url to take user to simulation
                    #artifact = h.getNewModalityURLForArtifacts([simDetail])[0]
                    #simPageURL = artifact.get('newModalityURL')
                    simPageURL = '/hi'
                    simLink.append("<a href=%s target='_blank'>%s</a>" %(simPageURL, title))
                    simTitle.append(title)
                  except:
                    pass
            c.question['simTitle'] = ', '.join(simTitle)
            c.question['simIDs'] = ', '.join(simIDs)
            c.question['simLink'] = ', '.join(simLink)
            
            # Get the associated interactive practice id, with link to the detail page for practice 
            interactivePLink = []
            interactivePIDs = []
            if c.question.has_key('interactivePId') and c.question['interactivePId']:
                for pId in c.question['interactivePId']:
                    id = str(pId)
                    interactivePLink.append("<a href=%sassessment/test/%s target='_blank'>%s</a>" %(config.get('webroot_url','/flxadmin/'), id, id))
                    interactivePIDs.append(id)
            c.question['interactivePIDs'] = ', '.join(interactivePIDs)
            c.question['interactivePLink'] = ', '.join(interactivePLink)
            
            #Default no. of instances count
            c.question['instances_list'] = [(i,i) for i in range(0,11)]
            c.question['instances'] = 10
            if c.question.has_key('encodedIDs'):
                c.question['eIDs'] = c.question['encodedIDs']
                c.question['encodedIDs'] = ', '.join(c.question['encodedIDs'])
            if c.question.get('conceptNodes'):
                c.question['conceptNodes'] = ', '.join([ x.get('name') if x else '?' for x in c.question.get('conceptNodes')])

            isQTSmartphoneReady = True
            isQSmartphoneReady  = True
            qtPolicies = c.question['questionType']['policies']
            policy = filter(lambda x: x['name']=='smartphone-ready' , qtPolicies)
            if policy:
                isQTSmartphoneReady =  policy[0]['value']

            if isQTSmartphoneReady:
                qPolicies = c.question['policies']
                if type(qPolicies) in [str, unicode]:
                    qPolicies = json.loads(qPolicies)  
                policy = filter(lambda x: x['name']=='smartphone-ready' , qPolicies)
                if policy:
                    isQSmartphoneReady =  policy[0]['value']

            c.question['isQTSmartphoneReady'] = isQTSmartphoneReady 
            c.question['isQSmartphoneReady'] = isQSmartphoneReady 

            defaults = dict(c.question)
            defaults.update(h.ae_answer_defaults(c.question, c.question['generative'])) 

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            successMsg = "Question Updated Successfully!"

            if c.success is None:
                #Check if 'showSuccessMsg' has been passed as a url param. 
                if request.params.get("showSuccessMsg", None):
                    c.success = successMsg
            else:
                #Dont flash success message in case 'showSuccessMsg' is not present.
                if request.params.get("showSuccessMsg", None) is None:
                    c.success = None

            if c.question :
                return htmlfill.render(render(template), defaults)
            else:
                return htmlfill.render(render(template))
        elif request.method == 'POST':
                import urlparse
                decodedParams = dict(urlparse.parse_qsl(b64decode(request.params['formData']), keep_blank_values=True))
                if not h.validate(decodedParams, c.form):
                    return htmlfill.render(render(template), c.form_result)
                params = h.keep_only(c.form_result, {
                    'questionTypeName' : 'questionTypeName',
                    'encodedIDs': 'encodedIDs',
                    'grades': 'grades',
                    'isPublic': 'isPublic',
                    'difficultyLevel': 'level',
                    'language': 'languageCode',
                    'references': 'references',
                    'searchTerms': 'searchTerms',
                    'credits': 'credits',
                    'policies':'policies',
                    'hints': 'hints',
                    'standards': 'standards',
                    'source': 'source',
                    'qgrp': 'qgrp',
                    'pSet': 'pSet',
                    'collectionHandles': 'collectionHandles',
                    'simIDs': 'simIDs',
                    })
                
                # Allow admin to edit the questions stem and answer choices directly on question details page(for below question types)
                if c.question and (qTypeName=='multiple-choice' or qTypeName=='select-all-that-apply' or qTypeName=='short-answer' or qTypeName=='true-false'):                
                  params['questionData'] = b64encode(self.getUpdatedQuestionData(c.question['questionData'], h.objectview({'params':decodedParams}), qTypeName))

                if params.has_key('hints') and params['hints']:
                    params['hints'] = b64encode(params['hints'])

                if c.question.has_key('draft') and c.question.get('draft',False):
                    params['submit'] = False

                if c.question.get('owner') and int(c.question.get('owner').get('uID')) == int(user.get('id')):
                    user_credits = 'author:'
                else:
                    user_credits = 'editor:'
                user_credits += ('%s %s' %(user.get('firstName',''), user.get('lastName','')) if user.get('lastName', None) else user.get('firstName'))
                new_credits = ''
                if user_credits not in params.get('credits'):
                    new_credits = params.get('credits') + ';' if params.get('credits') else ''
                    new_credits += '%s:%s' % (user_credits, datetime.now().__format__('%Y-%m-%d %H:%M:%S'))
                else:
                    for credit in params.get('credits').split(';'):
                        if user_credits in credit:
                            new_credits += ';' if new_credits else ''
                            new_credits += '%s:%s'%  (user_credits, datetime.now().__format__('%Y-%m-%d %H:%M:%S'))
                        else:
                            new_credits += ';' + credit if new_credits else credit
                params['credits'] = new_credits

                post_data = h.api_post('/assessment/api/update/question/%s'%Qid, params, 
                                       'Question Successfully Updated!')
                if not post_data or c.is_pane:
                    if c.is_pane and post_data:
                        c.success = h.flash.pop_message()
                    defaults.update(c.form_result)
                    return htmlfill.render(render(template), defaults)
        
                request_url = url(controller='test', action='question', Qid=Qid, protocol="https")
                showSuccessMsg = False
                urlExtension = None
                if post_data and isinstance(post_data, dict):
                    if "responseHeader" in post_data:
                        if "status" in post_data["responseHeader"]:
                            if int(post_data["responseHeader"]["status"]) == 0:
                                showSuccessMsg = True
                                urlExtension = "?showSuccessMsg=1"
                if showSuccessMsg:
                    if urlExtension:
                        return redirect(request_url+urlExtension)        
        return redirect(request.url)
    
    @ajax_login_required()
    def errors_list(self):
        """ Error Reports list data, for ajax calls
        """
        template = '/assessment/errors_list.html'
        params = dict(request.params)
        pageSize = 25
        params_dict = {}
        if params and params['filters']: 
            for typeFilter in params['filters'].split(';'):
                if typeFilter.split(',')[1]:
                    if 'errorTypeID' in typeFilter:
                        params_dict['errorTypeID'] = typeFilter.split(',')[1]
                    if 'status' in typeFilter:
                        params_dict['status'] = typeFilter.split(',')[1]
                    if 'branchEID' in typeFilter:
                        params_dict['branchEID'] = typeFilter.split(',')[1]
                    if 'reporterRole' in typeFilter:
                        if typeFilter.split(',')[1] not in ('all'):
                            params_dict['reporterRole'] = typeFilter.split(',')[1]
        if params and params['sort']:
            params_dict['sort'] = params['sort']
        if params and params.has_key('search') and params['search']:
            for searchType in params['search'].split(';'):
                if 'ownerID' in searchType:
                    params_dict['userID'] = ','.join(searchType.split(',')[1:])

        pageUrl = paginate.PageURL(h.url_('assessmenterrors'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        params_dict['pageNum'] = params['pageNum']
        params_dict['pageSize'] = params['pageSize']
        # Get EIDs in result
        params_dict['getEID'] = True

        result, total = h.page_get('assessment/api/browse/info/questionErrors',params_dict,'errorReports')
        # Append new param 'branch' with result. It will be in "EID(branchName)" format(eg: MAT.ALG.144(Algebra))
        eidBranchMap = self.getEIDBranchMapping()
        newResult = []
        for res in result:
            if res.has_key('EIDs') and res['EIDs']:
                res['branch'] = ', '.join([eid+' ('+eidBranchMap[eid[:7]]+')' for eid in res['EIDs']])
                del(res['EIDs'])
            newResult.append(res)
        
        c.viewmode = request.params.get('viewmode', getviewmode('assessment_errors'))
        c.paginator = paginate.Page(newResult, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)

    @ajax_login_required()
    def error_reports(self):
        """ Lists Error Reports for a Specific Question ID.
        """
        template = '/assessment/errors_reports.html'
        params = dict(request.params)
        pageSize = 25
        params_dict = {}
        pageUrl = paginate.PageURL(h.url_('assessmenterrorreports'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        params_dict['pageNum'] = params['pageNum']
        params_dict['pageSize'] = params['pageSize']
        c.form = ErrorReportsForm()
        params_dict["questionID"] = params["questionID"]
        result, total = h.page_get('/assessment/api/browse/info/questionErrors', params_dict, 'errorReports')
        c.viewmode = request.params.get('viewmode', getviewmode('assessment_errors'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)    

    @login_required()
    def assessment_errors(self):
        """ Questions listing page, client should call errors_list() for data
        """
        template = '/assessment/errors.html'
        
        roles_data = UserManager.get_all_user_roles().items()
        roles_list = [["reporterRole,", "All"]]
        for roleID, roleName in roles_data:
            if roleName in ('student', 'teacher'):
                roles_list.append(["reporterRole,"+roleName.lower(), roleName.capitalize()])
        roles_list.append(["reporterRole,guest","Guest"])
        roles_list.append(["reporterRole,admin","Admin"])
        roles_list.append(["reporterRole,member","Member"])

        c.pagetitle = 'Assessment Error Reports'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('assessment_errors'))
        error_types = self.getAllErrorTypes()  
        c.form = ErrorsForm()
        c.form.type_sel = [('errorTypeID,', 'All')]
        error_types = [('errorTypeID,'+errorType['_id'],errorType['name'].replace(" (equations, variables, graphs, images)", "")) for errorType in error_types]
        c.form.type_sel.extend(error_types)
        # Filter the reports branch wise(eg:Geometry, Biology) 
        branch_names = self.getAllBranches()
        c.form.branch_sel = [('branchEID,', 'All')]
        branch_names = [('branchEID,'+branch['subjectID']+'.'+branch['shortname'],branch['name']) for branch in branch_names]
        c.form.branch_sel.extend(branch_names)
        c.form.role_sel = roles_list
        
        return render(template)
    
    @login_required()
    def assessment_error(self, Qid=None):
        """ Assessment Error Report Details
        """
        template = '/assessment/error.html'
        c.pagetitle = 'Error Report Details'

        _prvlink = '/assessment/assessment_errors'
        prvlink = (_prvlink, 'Assessment Error Reports')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url(_prvlink)
        c.form = ErrorForm()
        c.save_prefix = 'Update'

        data = h.api('/assessment/api/get/detail/questionError/'+Qid)
        c.assessment_error = h.traverse(data, ['response', 'errorReport'])
        if c.assessment_error:
            # Append new param 'branch' with data. It will be in "EID(branchName)" format(eg: MAT.ALG.144(Algebra))
            eidBranchMap = self.getEIDBranchMapping()
            eids = data['response']['errorReport'].get('question', {}).get('encodedIDs', [])
            if eids:
                data['response']['errorReport']['branch'] = ', '.join([eid+'('+eidBranchMap[eid[:7]]+')' for eid in eids])

            #This approach can now be removed
            #results = h.api('/assessment/api/browse/info/questionErrors', {"questionID":c.assessment_error["question"]["_id"]})
            #total = 0
            #if results["responseHeader"]["status"] == 0:
            #    total = int(results["response"]["total"])
            #    allResults = h.api('/assessment/api/browse/info/questionErrors', 
            #        {"questionID":c.assessment_error["question"]["_id"], 'pageNum':1, 'pageSize':total})
            #    results = allResults["response"]["errorReports"]
            #c.assessment_error['errorReports'] = json.dumps(results)
            #c.assessment_error['errorReportsTotal'] = total

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            if c.assessment_error:
                error_types = self.getAllErrorTypes()
                c.assessment_error['error_types'] = [(errorType['_id'],errorType['name']) for errorType in error_types]
                return htmlfill.render(render(template), c.assessment_error)
            else:
                return htmlfill.render(render(template))

        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)
            params = h.keep_only(c.form_result, {
                'errorTypeID': 'errorTypeID',
                'reason': 'reason',
                'response': 'response',
                'status': 'status',
            })
            post_data = h.api_post('/assessment/api/update/questionError/%s'%Qid, params, 
                'Error Report Successfully Updated!')
            if not post_data or c.is_pane:
                if c.is_pane and post_data:
                    c.success = h.flash.pop_message()
                error_types = self.getAllErrorTypes()
                c.assessment_error['error_types'] = [(errorType['_id'],errorType['name']) for errorType in error_types]
                return htmlfill.render(render(template), c.form_result)
        return redirect(request.url)
    
    @login_required()
    def upload_questions(self):
        """ Uploads questions by filename or by uploading file
        """
        template = '/assessment/upload_question.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = UploadQuestionForm()
        c.pagetitle = 'Upload Questions'

        if request.method == 'GET':
            c.success = h.flash.pop_message()
            return htmlfill.render(render(template), c.form.defaults)

        elif request.method == 'POST':
            params = dict(request.params)
            if not params['googleDocumentName'] and params['file']=='':
                c.form_errors = {'googleDocumentName': 'Either Google Spreadsheet Name or Upload is required'}
                return htmlfill.render(render(template), params)

            if not params.has_key('impersonateMemberID') or (params.has_key('impersonateMemberID') and params['impersonateMemberID'] == ''):
                params['impersonateMemberID'] = 3 #Default importer ID
            elif params.has_key('impersonateMemberID') and params['impersonateMemberID'] != '':
                try:
                    i = int(params['impersonateMemberID'])
                except ValueError:
                    #Handle the exception
                    LOG.error(ValueError)
                    c.form_errors = {'impersonateMemberID': 'Invalid importer ID, must be an integer.'}
                    return htmlfill.render(render(template), params)
            if not params.has_key('publishOnImport'):
                params['publishOnImport'] = 'false'
            if not h.validate(params, c.form):
                return htmlfill.render(render(template), c.form_result)

            publishOnImport = str(params.get('publishOnImport')).lower() == 'true'
            if publishOnImport:
                params['autoPublish'] = True
            if params.has_key('publishOnImport'):
                del params['publishOnImport']

            file_upload = params.has_key('file') and params['file'] != ''
            if file_upload:
                try:
                    cache_dir = config.get('cache_share_dir')
                    savedFile = h.saveUploadedFile(request, 'file', dir=cache_dir, allowedExtenstions=['csv'])
                    fileObject = open(savedFile , 'r')
                    params['file'] = fileObject
                    params['filename'] = savedFile
                except Exception, e:
                    LOG.error(e)
                    h.set_error(e)
                    return htmlfill.render(render(template))
            else:
                del params['file']
            params['format'] = 'json'
            data = h.api_post('assessment/api/upload/questions', params, 'Questions Uploaded Successfully', multipart=file_upload)
            if not data:
                return htmlfill.render(render(template))

        return redirect(request.url) 

    @ajax_login_required()
    def delete(self, Type=None, id=None):
        if Type == None or id == None:
            return json.dumps({'status':'error','response':"Both type and id expected"})
        try:
            result = RemoteAPI.makeAssessmentCall('api/delete/%s/%s' % (Type, id))
            return json.dumps(result)
        except Exception, e:
            return json.dumps({'status':'error','response':e.api_message,'api_status_code':str(e)})

    @login_required()
    def practice_usage(self):
        template = '/assessment/practice_usage_summary.html'
        c.crumbs = h.htmlalist(['home'])
        c.form = PracticeSummaryForm()
        c.pagetitle = 'Practice Usage Summary'
        defaults = {}
        defaults['granularity'] = 'branch'
        defaults['toDate'] = datetime.now().__format__('%d-%b-%Y')
        defaults['fromDate'] = (datetime.now()-timedelta(days=30)).__format__('%d-%b-%Y')
        c.post_data = None
        if request.method == 'GET':
            return htmlfill.render(render(template), defaults)
        elif request.method == 'POST':
            if not h.validate(request.params, c.form):
                return htmlfill.render(render(template), c.form_result)

            try:
                params_dict = dict(request.params)
                post_data = RemoteAPI.makeAssessmentGetCall('api/get/data/testscores/usage',params_dict=params_dict)
            except Exception, e:
                LOG.exception(e)
                h.set_error(e)
                post_data = {}
            if post_data:
                c.post_data = post_data.get('response')
                c.success = h.flash.pop_message()
                defaults.update(c.form_result)
                return htmlfill.render(render(template), defaults)
        return redirect(request.url)
    
    '''
        Answer Synonyms
    '''
    @ajax_login_required()
    def synonyms_list(self):
        """ Synonyms list data, for ajax calls
        """
        template = '/assessment/synonyms_list.html'
        params = dict(request.params)
        pageSize = 25
        params_dict = {}

        if params and params['sort']:
            params_dict['sort'] = params['sort']
        if params and params.has_key('search') and params['search']:
            for searchType in params['search'].split(';'):
                if 'synonyms' in searchType:
                    params_dict['search'] = params['search']

        pageUrl = paginate.PageURL(h.url_('synonyms'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        params_dict['pageNum'] = params['pageNum']
        params_dict['pageSize'] = params['pageSize']
        params_dict['nocache'] = True
        
        result, total = h.page_get('assessment/api/browse/info/answerSynonyms',params_dict,'answerSynonyms')
        
        c.viewmode = request.params.get('viewmode', getviewmode('synonyms'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                       url=pageUrl, presliced_list=True)
        return render(template)
    
    @login_required()
    def synonyms(self, Tid=None):
        """ Synonyms listing page, client should call synonyms_list() for data
        """
        template = '/assessment/synonyms.html'
        c.pagetitle = 'Synonyms'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('synonyms'))
        c.form = SynonymsForm()
        return render(template)
    
    @login_required()
    def synonym(self, id=None):
        """ Answer Synonyms Details
        """
        template = '/assessment/synonym.html'
        c.pagetitle = 'Answer Synonym Details'

        _prvlink = '/assessment/synonyms'
        prvlink = (_prvlink, 'Synonyms')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url(_prvlink)
        c.form = SynonymForm()
        c.save_prefix = 'Update'

        data = h.api('/assessment/api/get/detail/answerSynonym/'+id)
        c.synonym = h.traverse(data, ['response', 'answerSynonym'])
        
        if c.synonym:
            c.synonym['synonyms'] = ', '.join(c.synonym['synonyms']) if c.synonym.has_key('synonyms') else ''
            if request.method == 'GET':
                if c.synonym :
                    return htmlfill.render(render(template), c.synonym)
                else:
                    return htmlfill.render(render(template))
            elif request.method == 'POST':
                if not h.validate(request.params, c.form):
                    return htmlfill.render(render(template), c.form_result)
                params = h.keep_only(c.form_result, {
                    'synonyms': 'synonyms',
                })
                
                post_data = h.api_post('/assessment/api/update/answerSynonym/%s'%id, params, 
                'Answer Synonyms Successfully Updated!')
                if not post_data or c.is_pane:
                    if c.is_pane and post_data:
                        c.success = h.flash.pop_message()
                    return htmlfill.render(render(template), c.form_result)
        return redirect(request.url)
    
    '''
        Question Hints
    '''
    @ajax_login_required()
    def hints_list(self):
        """ Synonyms list data, for ajax calls
        """
        template = '/assessment/hints_list.html'
        params = dict(request.params)
        params_dict = {}
        # Link to get the questions list page
        questionsPageUrl = "%sassessment/questions?viewmode=full&sort=updated,desc&page=1" % config.get('webroot_url','/flxadmin/') 
        # QuestionId to use in filters
        questionId = None
        otherQType = ''
        
        if params and params.has_key('filters') and params['filters']: 
            for filterName in params['filters'].split(';'):
                if 'subject' in filterName:
                    params_dict['subject'] = filterName.split(',')[1]
                if 'branch' in filterName:
                    params_dict['branch'] = filterName.split(',')[1].replace('$', ',')
                if 'qID' in filterName:
                    params_dict['qID'] = filterName.split(',')[2]
                    questionId = filterName.split(',')[1]
                if 'otherQType' in filterName:
                    otherQType = filterName.split(',')[1]
                    params_dict['otherQType'] = otherQType
        
        if params and params.has_key('search') and params['search']:
            for searchName in params['search'].split(';'):
                if 'concepteid' in searchName:
                    params_dict['conceptOrEID'] = searchName.split(',')[1]
        
        result, total = h.page_get('/assessment/api/get/questions/count/with/hint',params_dict,'count')
        
        def _getRow(iterableData, SubjectName=False, branchName=False, branches=False, isConcept=False):
            row = {}
            # Get all subjects
            if SubjectName:
                subjects = self.getAllSubjects()
            # Get row
            for k, v in iterableData.iteritems():
                # Get subject name
                if SubjectName:
                    row['subjectName'] = ''.join([s['name'] for s in subjects if s['shortname']==k])
                # Get subject name
                elif branchName and branches:
                    row['subjectName'] = branches[k] 
                else:
                    row['subjectName'] = k
                row['countWithHints'] = v['withHint']
                row['countWithoutHints'] = v['withoutHint']
                
                filtersWithHint = urllib.quote("withHintsOnly,True;questionTypeID,%s" % questionId)
                filtersWithoutHint = urllib.quote("withHintsOnly,False;questionTypeID,%s" % questionId)
                # Create the url of questions list page
                if isConcept:
                    row['urlWithHints'] = "%s&filters=%s&search=encodedIDs,%s&otherQType=%s" %(questionsPageUrl, filtersWithHint, v['encodedID'], otherQType)
                    row['urlWithoutHints'] = "%s&filters=%s&search=encodedIDs,%s&otherQType=%s" %(questionsPageUrl, filtersWithoutHint, v['encodedID'], otherQType)
                else:
                    row['urlWithHints'] = "%s&filters=%s&search=encodedIDs,%s&otherQType=%s" %(questionsPageUrl, filtersWithHint, k, otherQType)
                    row['urlWithoutHints'] = "%s&filters=%s&search=encodedIDs,%s&otherQType=%s" %(questionsPageUrl, filtersWithoutHint, k, otherQType)
            return row
        
        items = []
        # Subject
        if result.has_key('subjects') and result['subjects']:
            # Get full subject name
            items.append(_getRow(result['subjects'][0], SubjectName=True))
            # Branches
            if result.has_key('branches') and result['branches']:
                # Get all branches
                branchesDict = self.getEIDBranchMapping()
                for branch in result['branches']:
                    items.append(_getRow(branch, branchName=True, branches=branchesDict))
        
        # Concepts
        if result.has_key('concepts') and result['concepts']:
            for concept in result['concepts']:
                items.append(_getRow(concept, isConcept=True))
        
        c.items = items                
        return render(template)
    
    
    @login_required()
    def hints(self, Tid=None):
        """ Hints listing page, client should call hints_list() for data
        """
        template = '/assessment/hints.html'
        c.pagetitle = 'Hints'
        c.crumbs = h.htmlalist(['home'])
#         c.viewmode = request.params.get('viewmode', getviewmode('hints'))
        c.form = HintsForm()
        subjects = [("subject,%s" % s['shortname'], s['name']) for s in self.getAllSubjects()]
        c.form.subject_sel = [('', 'Select Subject')]
        c.form.subject_sel.extend(subjects)
        
        c.form.branch_sel = [('branch,', 'Select Branch')]
        # Assessment Question types
        questionTypes = [("qID,%s,%s" %(self.getQuestionTypeID(q['name']), q['_id']), q['name']) for q in self.getAllQuestionTypes(fullData=True)]
        c.form.type_sel = [('', 'All')]
        c.form.type_sel.extend(questionTypes)
        
        # External Question types
        externalQuestionTypes = [('otherQType,'+id, lbl) for id, lbl in external_question_type_choices]
        c.form.other_type_sel = [('', 'All')]
        c.form.other_type_sel.extend(externalQuestionTypes)
        return render(template)
    
    '''
        Assessment Actions History
    '''
    @ajax_login_required()
    def actions_list(self):
        """ Actions list data, for ajax calls
        """
        template = '/assessment/actions_list.html'
        params = dict(request.params)
        pageSize = 25
        params_dict = {}

        if params and params['sort']:
            params_dict['sort'] = params['sort']
        
        if params and params.has_key('filters') and params['filters']: 
            for filterName in params['filters'].split(';'):
                if 'entityTypeName' in filterName:
                    entityTypeName = filterName.split(',')[1]
        
        pageUrl = paginate.PageURL(h.url_('actions'), params)
        pageNum = h.modify_page_attrs(params, pageSize)
        params_dict['pageNum'] = params['pageNum']
        params_dict['pageSize'] = params['pageSize']
        
        result, total = h.page_get('assessment/api/browse/info/actions/%s' % entityTypeName, params_dict, 'actions')
        
        c.viewmode = request.params.get('viewmode', getviewmode('actions'))
        c.paginator = paginate.Page(result, pageNum, pageSize, total, 
                        url=pageUrl, presliced_list=True)
        return render(template)
    
    @login_required()
    def actions(self, Tid=None):
        """ Actions listing page, client should call actions_list() for data
        """
        template = '/assessment/actions.html'
        c.pagetitle = 'Actions'
        c.crumbs = h.htmlalist(['home'])
        c.viewmode = request.params.get('viewmode', getviewmode('actions'))
        c.form = ActionsForm()
        
        c.form.entity_sel = [('entityTypeName,'+id, lbl) for id, lbl in entity_types]
        
        return render(template)
    
    @login_required()
    def action(self, id=None):
        """ Action History Details
        """
        template = '/assessment/action.html'
        c.pagetitle = 'Action History Details'

        _prvlink = '/assessment/actions'
        prvlink = (_prvlink, 'Actions')
        c.crumbs = h.htmlalist(['home', prvlink])
        c.is_pane = request.params.get('viewmode', '').startswith('pane')
        c.cancel = '' if c.is_pane else h.url(_prvlink)
        c.form = ActionForm()

        data = h.api('/assessment/api/get/detail/action/'+id)
        c.action = h.traverse(data, ['response', 'action'])
        if c.action:
            if request.method == 'GET':
                if c.action :
                    return htmlfill.render(render(template), c.action)
                else:
                    return htmlfill.render(render(template))
        
        return redirect(request.url)
