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

import logging
LOG = logging.getLogger( __name__ )


class AbuseReportForm(formencode.Schema):
    allow_extra_fields = True
    css = 'info med'
    ordered_fields = [ h.labelreadonly(*vals) for vals in [
     ('Id', 'id', css), 
     ('Status', 'status', css),
     ('Created', 'created', css),
     ('Updated', 'updated', css),
    ]]
    reasonIDs = h.get_sel('/get/info/abuse/reasons', 'reasons', prependTuple=None)

class AbuseReportFormWithReason(AbuseReportForm):
    reasonID = validators.String(not_empty=True, messages={'missing': 'Selection Required if Flagging'})

class ReportAbuseForm(formencode.Schema):
    reason = validators.String(strip=True, not_empty=True)
    allow_extra_fields = True

class AbuseReportsForm(formencode.Schema):
    """ Abuse Reports listing Form
    """
    type_choices = [
     ('', 'All'),
     ('book', 'Book'),
     ('chapter', 'Chapter'),
     ('lesson', 'Lesson'),
     ('concept', 'Concept'),
     ('section', 'Section'),
     ('tebook', 'T.E. Book'),
     ('labkit', 'Labkit'),
     ('studyguide', 'Study Guide'),
     ('workbook', 'Workbook'),
     ('activity', 'Activity'),
     ('attachment', 'Attachment'),
     ('audio', 'Audio'),
     ('conceptmap', 'Concept/Mind Map'),
     ('cthink', 'Critical Thinking'),
     ('enrichment', 'Enrichment'),
     ('exercise', 'Excercise'),
     ('flashcard', 'Flashcard'),
     ('handout', 'Handout'),
     ('image', 'Image'),
     ('interactive', 'Interactive'),
     ('exerciseint', 'Interactive Exercise'),
     ('asmtpracticeint', 'Interactive Practice'),
     ('simulationint', 'Interactive Simulation'),
     ('lab', 'Lab'),
     ('labans', 'Lab Answer Key'),
     ('lecture', 'Lecture'),
     ('lessonplan', 'Lesson Plan'),
     ('lessonplanx', 'Lesson Plan (external)'),
     ('lessonplanans', 'Lesson Plan Answer Key'),
     ('asmtpractice', 'Practice'),
     ('postread', 'Post Read'),
     ('postreadans', 'Post Read Answer Key'),
     ('prepostread', 'Pre/Post Read'),
     ('prepostreadans', 'Pre/Post Read Answer Key'),
     ('preread', 'Pre Read'),
     ('prereadans', 'Pre Read Answer Key'),
     ('presentation', 'Presentation'),
     ('plix', 'PLIX'),
     ('asmtquiz', 'Quiz (Assessment)'),
     ('quiz', 'Quiz'),
     ('quizans', 'Quiz Answer Key'),
     ('quizdemo', 'Quiz Demo'),
     ('rubric', 'Rubric'),
     ('rwa', 'Real World Application'),
     ('rwaans', 'RWA Answer Key'),
     ('simulation', 'Simulation'),
     ('web', 'Web'),
     ('whileread', 'While Read'),
     ('whilereadans', 'While Read Answer Key'),
     ('worksheet', 'Worksheet'),
     ('study-track', 'Study Track'),
     ('quizbook', 'Quiz Book'),
     ('asmttest', 'Diagnostic Test'),
     ('testbook', 'Test Book'),
    ]
    type_sel = [('artifactType,'+name, lbl) for name, lbl in type_choices]
    
    listhead = [ h.htmldiv(*vals) for vals in [
     ('ResourceID', 'resourceID'), 
     ('Resource', 'resource'), 
     ('Artifact ID', 'artifactID'),
     ('Artifact Type', 'artifactType'),
     ('Title', 'title', 'sortable'),
     ('Creator', 'creatorID', 'sortable'),
     ('Status', 'status', 'sortable'),
     ('Reason Type', 'reasonID'),
     ('Reported Reason', 'reason'),
     ('Reporter', 'reporter'),
     ('User Agent', 'userAgent'),
     ('Created', 'created', 'sortable'),
     ('Updated', 'updated', 'sortable'),
     ('Remark', 'remark'),
    ]]
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Resource, id', 'resource'), 
     ('Status', 'status', 'sortable'),
     ('Reported Reason', 'reason'),
     ('Updated', 'updated', 'sortable'),
    ]]
    status_sel = [('status,'+s, s) for s in options.abuse_statuses]
    status_sel.insert(0, ('status,', 'All'))

    reasonIDs = h.get_sel('/get/info/abuse/reasons', 'reasons', prependTuple=None)
    reason_sel = [('reasonID,'+k, v) for k,v in reasonIDs]
    reason_sel.insert(0, ('reasonID,', 'All'))


class ResourcesForm(formencode.Schema):
    """ Resources listing Form (currently not sortable). Types include:
    image types:    image, cover page, cover page icon, equation
    download types: epub, mobi, pdf, attachment, studyguide, lessonplan
    iframe types:   video, cover video
    other types:    contents, expression, audio, html, interactive
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'),#, 'sortable'), 
     ('Name', 'name'),#, 'sortable'),
     ('Type', 'type'),#, 'sortable'),
     ('Description', 'description'),#, 'sortable'),
     ('Created', 'created'),#, 'sortable'),
    ]]
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'),#, 'sortable'), 
     ('Name', 'name'),#, 'sortable'),
     ('Type', 'type'),#, 'sortable'),
     ('Created', 'created'),#, 'sortable'),
    ]]
    
    resource_type_sel = [('type,'+s, s.capitalize()) for s in options.resource_types]
    resource_type_sel.insert(0, ('type,resource', 'All'))
    
class ResourceForm(formencode.Schema):
    resourceUri = validators.URL()
    resourcePath = validators.String()
    allow_extra_fields = True
    
    css = 'info elong'
    med = 'info xmed'
    ordered_fields = [
     h.labelreadonly(*vals) if 'info' in vals[2] else h.labelinput(*vals) for vals in [
     ('Id', 'id', css), 
     ('Name', 'name', css),
     ('Handle', 'handle', css),
     ('Original Name', 'originalName', css),
     ('Perma Uri', 'permaUri', css),
     ('Type', 'type', css),
     ('Description', 'description', 'elong'),
     ('Authors', 'authors', 'elong'),
     ('License', 'license', 'xmed'),
     ('Created', 'created', med),
     ('Streamable', 'streamable', med),
     ('Is External', 'isExternal', med),
    ]]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'),
     ('Resource Id', 'resourceID'),
     ('Revision', 'revision'),
     ('Hash', 'hash'), 
     ('Created', 'created'),
    ]]


class ProviderForm(formencode.Schema):
    allow_extra_fields = True
    name = validators.String(not_empty=True, strip=True)
    domain = validators.String(not_empty=True, strip=True)
    css = 'info med'
    edit = 'long'
    ordered_fields = [
     h.labelreadonly(*vals) if 'info' in vals[2] else h.labelinput(*vals) for vals in [
     ('Id', 'id', css),
     ('Name', 'name', edit), 
     ('Domain', 'domain', edit),
     ('Created', 'created', css),
     ('Updated', 'updated', css),
    ]]
    yesno_choices = options.int_as_yesno_choices

class NewProviderForm(formencode.Schema):
    allow_extra_fields = True
    name = validators.String(not_empty=True, strip=True)
    domain = validators.String(not_empty=True, strip=True)
    needsApi = validators.String()
    blacklisted = validators.String()
    yesno_choices = options.tf_as_yesno_choices

class ProvidersForm(formencode.Schema):
    """ Providers listing Form
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('ID', 'id', 'sortable'), 
     ('Name', 'name', 'sortable'), 
     ('Domain', 'domain', 'sortable'),
     ('Needs API', 'needsApi'),
     ('Blacklist', 'blacklisted', 'sortable'),
     ('Created', 'created', 'sortable'),
     ('Updated', 'updated', 'sortable'),
    ]]
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('ID', 'id', 'sortable'), 
     ('Name, Domain', 'name', 'sortable'), 
     ('Needs API', 'needsApi'),
     ('Blacklist', 'blacklisted', 'sortable'),
     ('Updated', 'updated', 'sortable'),
    ]]
    blacklisted = [('blacklisted,%d'%val, s) for val, s in options.int_as_yesno_choices]
    blacklisted.insert(0, ('blacklisted,', 'All'))
    # Uncomment when API allows needsApi filtering:
    # needsApi = [('needsApi,%d'%val, s) for val, s in options.int_as_yesno_choices]
    # needsApi.insert(0, ('needsApi,', 'All'))

