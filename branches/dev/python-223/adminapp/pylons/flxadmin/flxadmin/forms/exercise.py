#
# Copyright 2011-201x CK-12 Foundation
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
# This file originally written by John Leung
# $Id:$

import formencode
from formencode import validators
from flxadmin.lib import helpers as h
from flxadmin.forms import options


class ExercisesForm(formencode.Schema):
    """ Exercises listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('EncodedID', 'encodedID', 'sortable'),
     ('Exercise', 'title', 'sortable'),
     ('Created', 'creationTime', 'sortable date'),
     ('Updated', 'updateTime', 'sortable date'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Exercise', 'title', 'sortable'),
     ('Updated', 'updateTime', 'sortable date'),
    ]]

class ExerciseForm(formencode.Schema):
    encodedID = validators.String(strip=True)
    title = validators.String(strip=True)
    description = validators.String(strip=True)
    generative_questions = validators.String(strip=True)
    declarative_questions = validators.String(strip=True)
    allow_extra_fields = True
    
    med = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if 'info' in vals[2] else \
                       h.labelinput(*vals) for vals in [
     ('Id', 'id', med), 
     ('Encoded Id', 'encodedID', 'xmed'), 
     ('Title', 'title', 'elong'),
     ('Description', 'description', 'elong'),
     ('Created', 'creationTime', med),
     ('Updated', 'updateTime', med),
    ]]


class QuestionsForm(formencode.Schema):
    """ Questions listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Type', 'questionTypeID', 'sortable'), 
     ('Level', 'difficultyLevel', 'sortable'),
     ('Question', 'displayText'),
     ('Valid', 'isValid', 'sortable'),
     ('Approver', 'approvedBy', 'sortable'),
     ('Creator', 'createdBy', 'sortable'),
     # ('Created', 'creationTime', 'sortable date'),
     ('Updated', 'updateTime', 'sortable date'),
    ]] 

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'),
     ('Question, Type, Creator', 'displayText', 'sortable'),
     ('Updated', 'updateTime', 'sortable date'),
    ]] 

    type_sel = [('questionTypeID,'+id, lbl) for id, lbl in options.question_type_choices]
    type_sel.insert(0, ('questionTypeID,', 'All'))

    level_sel = [('difficultyLevel,'+s, s.capitalize()) for s in options.question_levels]
    level_sel.insert(0, ('difficultyLevel,', 'All'))

    status_choices = [('', 'All'), ('T', 'Yes'), ('F', 'No')]
    status_sel = [('isValid,'+id, lbl) for id, lbl in status_choices]
    
    draft_choices = [('', 'All'), ('T', 'Yes'), ('F', 'No')]
    draft_sel = [('draft,'+id, lbl) for id, lbl in draft_choices]
    
    status_approval = [ ('', 'No'),('None', 'Yes')]
    status_approval_sel = [('approvedBy,'+id, lbl) for id, lbl in status_approval]

class QuestionForm(formencode.Schema):
    """ Question Form 
    """
    allow_extra_fields = True

    question_type_choices = options.question_type_choices
    question_levels = options.question_levels


class ErrorForm(formencode.Schema):
    response = validators.String()
    variableValueMap = validators.String()
    allow_extra_fields = True
    
    css = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if len(vals)==3 else \
                       h.labelreadonlyarea(*vals) for vals in [
     ('Question Type', 'questionClass', css), 
     ('Status', 'status', css), 
     ('Created', 'creationTime', css), 
     ('Created By', 'email', css), 
     ('Error Type', 'errorType', css), 
     ('Error Reason', 'reason', 5, 82, 'greybkgnd'),
     ('Updated', 'updateTime', css), 
    ]]

class ErrorsForm(formencode.Schema):
    """ Error Reports listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Question', 'questionClass'),#, 'sortable'), 
     ('Error Type', 'errorType'),#, 'sortable'), 
     ('Reason', 'reason'),#, 'sortable'),
     ('Status', 'status', 'sortable'),
     ('Reviewer', 'reviewedBy', 'sortable date'),
     ('Updated', 'updateTime', 'sortable date'),
     ('Created', 'creationTime', 'sortable date'),
    ]] 
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Reason, Error Type - Status', 'reason'),#, 'sortable'),
     ('Updated', 'updateTime', 'sortable date'),
     ('Created', 'creationTime', 'sortable date'),
    ]] 

    type_choices = [
     ('', 'All'),
     ('1', 'Erroneous Question'),
     ('2', 'Concept Assc. Issue'),
     ('3', 'Others'),
    ]
    type_sel = [('errorTypeID,'+id, lbl) for id, lbl in type_choices]

    question_choices = [
     ('', 'All'),
     ('D', 'Declarative'),
     ('G', 'Generative'),
    ]
    question_sel = [('questionClassID,'+id, lbl) for id, lbl in question_choices]

    status_sel = [('status,'+id, id) for id in options.hw_error_statuses]
    status_sel.insert(0, ('status,', 'All'))
