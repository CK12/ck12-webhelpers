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
# This file originally written by Girish Vispute
# $Id:$

import formencode
from formencode import validators
from flxadmin.lib import helpers as h
from flxadmin.forms import options


class TestsForm(formencode.Schema):
    """ Tests listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('EncodedID', 'encodedID'),
     ('Test Type', 'testTypeID','sortable'),
     ('Title', 'title', 'sortable'),
     ('# Questions', 'questionsCount'),
     ('Published?', 'isPublic'),
     ('Owner', 'userID'),
     ('Created', 'created', 'sortable date'),
     ('Updated', 'updated', 'sortable date'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id', 'sortable'), 
     ('Title , Type, Owner', 'title'),
     ('Updated', 'updated', 'sortable date'),
    ]]
    
    test_public_choices = [('', 'All'), ('true', 'Yes'), ('false', 'No')]
    test_public_sel = [('isPublic,'+id, lbl) for id, lbl in test_public_choices]

class TestForm(formencode.Schema):
    encodedIDs = validators.String(strip=True)
    title = validators.String(not_empty=True)
    handle = validators.String(not_empty=True)
    questions = validators.String(not_empty=True)
    description = validators.String(strip=True)
    allow_extra_fields = True
    
    med = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if 'info' in vals[2] else \
                       h.labelinput(*vals) for vals in [
     ('Id', '_id', med), 
     ('Title', 'title', 'elong'), 
     ('Handle', 'handle', 'elong'),
     ('Description', 'description', 'elong'),
     ('Created', 'created', med),
     ('Updated', 'updated', med),
    ]]


class QuestionsForm(formencode.Schema):
    """ Questions listing Form 
    """
    select_all_checkbox = h.htmldiv('Action', 'select_all', False)
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('Type', 'questionTypeID', 'sortable'), 
     ('Level', 'tags.level', 'sortable'),
     ('Encoded IDs','encodedIDs', 'sortable'),
     ('Question', 'displayText'),
     ('Published', 'isPublic'),
     ('Owner', 'ownerID', 'sortable'),
     ('Updated', 'updated', 'sortable date'),
     ('Hints', 'hints'),
    ]] 

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id', 'sortable'),
     ('Question, Type, Owner', 'displayText'),
     ('Updated', 'updated', 'sortable date'),
    ]] 

#     type_sel = [('questionTypeID,'+id, lbl) for id, lbl in options.question_type_choices]
#     type_sel.insert(0, ('questionTypeID,', 'All'))
    
    type_sel = options.question_type_choices
    new_test_type_sel = options.new_test_question_type_choices
    
    level_sel = [('tags.level,'+s, s.capitalize()) for s in options.question_levels]
    level_sel.insert(0, ('tags.level,', 'All'))

    grade_sel = [('tags.grades,'+s, s.capitalize()) for s in options.question_grades]
    grade_sel.insert(0, ('tags.grades,', 'All'))
    
    public_choices = [('', 'All'), ('true', 'Yes'), ('false', 'No')]
    public_sel = [('isPublic,'+id, lbl) for id, lbl in public_choices]

    rejected_choices = [ ('False', 'All'), ('True', 'Rejected')]
    rejected_sel = [('rejectedOnly,'+id, lbl) for id, lbl in rejected_choices]
    
    ilo_choices = [('', 'All'), ('True', 'With ILOs'), ('False', 'Without ILOs')]
    ilo_sel = [('withIlosOnly,'+id, lbl) for id, lbl in ilo_choices]
    
    hint_choices = [('', 'All'), ('True', 'With Hints'), ('False', 'Without Hints')]
    hint_sel = [('withHintsOnly,'+id, lbl) for id, lbl in hint_choices]
    
    modality_choices = [('', 'All'), ('true', 'With Modality')]
    modality_sel = [('withModalityOnly,'+id, lbl) for id, lbl in modality_choices]

    draft_choices = [('False', 'No'), ('True', 'Yes')]
    draft_sel = [('draft,'+id, lbl) for id, lbl in draft_choices]

    contributed_choices = [('', 'All'), ('ck12', 'CK-12'), ('community', 'Community')]
    contributed_sel = [('contributedBy,'+id, lbl) for id, lbl in contributed_choices]

    generative_choices = [('', 'All'), ('True', 'Algorithmic'), ('False', 'Static')]
    generative_sel = [('generative,'+id, lbl) for id, lbl in generative_choices]

class QuestionForm(formencode.Schema):
    """ Question Form 
    """
    allow_extra_fields = True
    # Question types to be displayed as radio button on question detail page
    question_types = options.question_types
    question_levels = options.question_levels

class MismatchedQuestionsForm(formencode.Schema):
    """ Mismatched Questions listing Form 
    """
    select_all_checkbox = h.htmldiv('Action', 'select_all', False)
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('Type', 'questionTypeID', 'sortable'), 
     ('Authored Level', 'tags.level', 'sortable authored_level_header'),
     ('Recommended Level (Accepted)', 'deduced.level', 'deduced_level_header'),
     ('Encoded IDs','encodedID'),
     ('Question', 'displayText'),
     ('Published', 'isPublic'),
     ('Owner', 'ownerID'),
     ('Updated', 'updated', 'sortable date'),
     ('Hints', 'hints'),
    ]] 

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id', 'sortable'),
     ('Question, Type, Owner', 'displayText'),
     ('Updated', 'updated', 'sortable date'),
    ]] 
    
#     type_sel = [('questionTypeID,'+id, lbl) for id, lbl in options.question_type_choices]
#     type_sel.insert(0, ('questionTypeID,', 'All'))
    type_sel = options.question_type_choices
    
    level_sel = [('tags.level,'+s, s.capitalize()) for s in options.question_levels]
    level_sel.insert(0, ('tags.level,', 'All'))

    grade_sel = [('tags.grades,'+s, s.capitalize()) for s in options.question_grades]
    grade_sel.insert(0, ('tags.grades,', 'All'))

    public_choices = [('', 'All'), ('true', 'Yes'), ('false', 'No')]
    public_sel = [('isPublic,'+id, lbl) for id, lbl in public_choices]

    rejected_choices = [ ('False', 'No'), ('True', 'Yes')]
    rejected_sel = [('rejectedOnly,'+id, lbl) for id, lbl in rejected_choices]

    draft_choices = [('False', 'No'), ('True', 'Yes')]
    draft_sel = [('draft,'+id, lbl) for id, lbl in draft_choices]

    contributed_choices = [('', 'All'), ('ck12', 'CK-12'), ('community', 'Community')]
    contributed_sel = [('contributedBy,'+id, lbl) for id, lbl in contributed_choices]

    generative_choices = [('', 'All'), ('True', 'Algorithmic'), ('False', 'Static')]
    generative_sel = [('generative,'+id, lbl) for id, lbl in generative_choices]
    

class ErrorForm(formencode.Schema):
    response = validators.String()
    allow_extra_fields = True
    
    css = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if len(vals)==3 else \
                       h.labelreadonlyarea(*vals) for vals in [
     ('Question Instance ID', 'questionInstanceID', css),
     ('Created', 'created', css), 
     ('Created By', 'email', css), 
     ('Updated', 'updated', css),
    ]]
    status_sel = [(id, id) for id in options.assessment_error_statuses]

class ErrorsForm(formencode.Schema):
    """ Error Reports listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id', 'sortable'), 
     ('Error Type', 'errorType'),#, 'sortable'), 
     ('Reason', 'reason'),#, 'sortable'),
     ('Status', 'status', 'sortable'),
     ('EID(Branch)', 'branch'),
     ('Reporter', 'userID', 'sortable'),
     ('Reviewer', 'reviewedBy'),
     ('Updated', 'updated', 'sortable date'),
     ('Created', 'created', 'sortable date'),
     ('Pending Count', 'unresolvedReportCount', 'sortable'),
    ]] 
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id', 'sortable'), 
     ('Reason, Type - Status', 'reason'),#, 'sortable'),
     ('Updated', 'updated', 'sortable date'),
    ]] 

    status_sel = [('status,'+id, id) for id in options.assessment_error_statuses]
    status_sel.insert(0, ('status,', 'All'))

class ErrorReportsForm(formencode.Schema):
    """ Error Reports Listings Form on Error Report Details Page
    """
    headers = [ h.htmldiv(*vals) for vals in [
         ('Id', '_id', 'sortable'), 
         ('Error Type', 'errorType'),#, 'sortable'), 
         ('Reason', 'reason'),#, 'sortable'),
         ('Status', 'status', 'sortable'),
         ('Reporter', 'userID', 'sortable'),
         ('Reporter Role', 'Reporter_Role'),
         ('Reviewer', 'reviewedBy'),
         ('Updated', 'updated', 'sortable date'),
         ('Created', 'created', 'sortable date'),
         ('Pending Count', 'unresolvedReportCount', 'sortable'),
    ]]
    select_all_checkbox = h.labelcheckbox('', 'select_all', False)
    headers.insert(0, select_all_checkbox)
    status_sel = [(id, id) for id in options.assessment_error_statuses]
    status_sel.insert(0, ('status,', 'All'))

class UploadQuestionForm(formencode.Schema):
    googleDocumentName = validators.String()
    googleWorksheetName = validators.String()
    file = validators.String()
    impersonateMemberID = validators.String()
    publishOnImport = validators.String()
    defaults = {
     'impersonateMemberID': 3,
    }

class PracticeSummaryForm(formencode.Schema):
    fromDate = validators.String(not_empty=True)
    toDate = validators.String(not_empty=True)
    granularity_sel = [(s.lower(), s) for s in ('Branch', 'Subject')]
    granularity = validators.OneOf(['branch', 'subject'])

class SynonymForm(formencode.Schema):
    allow_extra_fields = True
    
    css = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if len(vals)==3 else \
                       h.labelreadonlyarea(*vals) for vals in [
     ('Created', 'created', css), 
     ('Updated', 'updated', css),
    ]]

class SynonymsForm(formencode.Schema):
    """ Synonyms listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'), 
     ('Synonyms', 'synonyms', 'sortable'), 
     ('Updated', 'updated', 'sortable'),
     ('Created', 'created', 'sortable')
    ]] 
    
class HintsForm(formencode.Schema):
    """ Hints listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Subject/Branch/Concept', 'subject'), 
     ('Questions with Hints', 'withHints'),
     ('Questions without Hints', 'withoutHints')
    ]] 
    
class ActionsForm(formencode.Schema):
    """ Hints listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id'),                                               
     ('Entity Type', 'entityType'), 
     ('Action', 'action'),
     ('Action Time', 'actionTime', 'sortable')
    ]]
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', '_id', 'sortable'), 
     ('Entity Type - Action', 'entitytype'),
     ('Action Time', 'actionTime', 'sortable date'),
    ]] 

class ActionForm(formencode.Schema):
    allow_extra_fields = True
    css = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if len(vals)==3 else \
                       h.labelreadonlyarea(*vals) for vals in [
     ('Id', '_id', css),
     ('Action', 'action', css),
     ('Entity Type', 'entityType', css),
    ]]
