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
from flxadmin.model.lms import LmsManager as LmsManager

class ArtifactsForm(formencode.Schema):
    """ Artifacts listing Form
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

    # also avail: latestRevision, revision, isLatest
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Type', 'artifactTypeID', 'sortable'),
     ('Title', 'title', 'sortable'),
     ('Creator', 'creatorID', 'sortable'),
     ('Created', 'creationTime', 'sortable'),
     ('Modified', 'updateTime', 'sortable'),
     ('Index', ''),
     ('View', ''),
    ]]
    

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Title, Type', 'title', 'sortable'),
     ('Creator', 'creatorID', 'sortable'),
     ('Modified', 'updateTime', 'sortable'),
    ]]
    
    pagesize_sel = [('pageSize,'+str(size), size) for size in [10,25,50]]
    
    publish_sel = [('published,'+name, lbl) for name, lbl in [('false', 'False'), ('true', 'True')]]
    contribution_sel = [('contribution_type,'+name, lbl) for name, lbl in [('all', 'Not Specified'), \
                                                                           ('original', 'Original Content'), \
                                                                           ('derived', 'CK-12 Content derived'), \
                                                                           ('modified', 'Customized from other content')
                                                                           ]]

class AssignmentsForm(formencode.Schema):
    """ Assignments listing Form
    """
    def __init__(self):
        #Add lms options only once, after user is logged-in
        if len(self.lms_filter_sel) <= 1:
            self.lms_filter_sel.extend([('%s,%s'%('providerID',lms_provider['id']), lms_provider['name'])for lms_provider in LmsManager.getAllLMSProviders()])
        
    type_choices = [
     ('assignment', 'Assignments'),
    ]
    type_sel = [('artifactType,'+name, lbl) for name, lbl in type_choices]

    origin_choices = [
     ('', 'All'),
     ('ck-12', 'CK-12'),
     ('lms', 'LMS'),
    ]
    origin_sel = [('origin,'+name, lbl) for name, lbl in origin_choices]
    
    status_choices = [
     ('', 'All'),
     ('upcoming', 'Up-coming'),
     ('past', 'Past Due'),
    ]
    status_sel = [('due,'+name, lbl) for name, lbl in status_choices]

    lms_filter_sel = [('providerID,', 'Select LMS')]
    #lms_filter_sel.extend([('%s,%s'%('providerID',lms_provider['id']), lms_provider['name'])for lms_provider in LmsManager.getAllLMSProviders()])

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Type', 'assignmentType'),
     ('Title', 'title', 'sortable'),
     ('Creator', 'creatorID', 'sortable'),
     ('Origin', 'assigned'),
     ('GroupID', 'groupID', 'sortable'),
     ('Due', 'due', 'sortable'),
     ('Created', 'creationTime', 'sortable'),
     ('Modified', 'updateTime', 'sortable'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Title, Type', 'title', 'sortable'),
     ('Creator', 'creatorID', 'sortable'),
     ('Modified', 'updateTime', 'sortable'),
    ]]
    
class ArtifactForm(formencode.Schema):
    title = validators.String(strip=True)
    encodedID = validators.String(strip=True)
    conceptNode = validators.String(strip=True)
    level = validators.String(strip=True)
    license = validators.String(strip=True)
    summary = validators.String()
    allow_extra_fields = True
    
    css_long = 'info xlong'
    css = 'info xmed'
    edit_css = 'xmed'
    edit_long = 'xlong'
    
    ordered_fields = [ h.labelreadonly(*vals) if 'info' in vals[2] else h.labelinput(*vals) for vals in [
     ('Title', 'title', edit_long),
     ('Handle', 'handle', edit_long),
     ('Type', 'artifactType', css),
     ('Revision', 'revision', css),
     ('Latest Revision', 'latestRevision', css),
     ('Id', 'id', css),
     ('Encoded Id', 'encodedID', edit_css),
     #Bug 56074 - Removing Domain Encoded ID as it wont be required anymore. 
     #('Domain Encoded Id', 'conceptNode', edit_css),
     ('Concepts', 'concepts', css_long),
     ('EIDs', 'eids', css_long),
     ('Created', 'created', css),
     ('Modified', 'modified', css),
     ('Last Read', 'lastRead', css),
     ('Extended Artifacts', 'extendedArtifactsCount', css),
     ('Realm', 'realm', css),
     ('License', 'license', edit_css),
    ]]
    level_sel = [(s.lower(), s) for s in ('', 'At Grade', 'Basic', 'Advanced')]
    
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Revision', 'revision'),
     ('Artifact Revision ID', 'revisionID'),
     # ('Id', 'id'), 
     # ('Id', 'artifactRevisionID'), 
     ('Statistics', 'statistics'),
     ('Created', 'created'),
     ('Published', 'published'),
    ]]

    #Bug 56074 - Header for Collection Table 
    associationCollectionListHead = [ h.htmldiv(*vals) for vals in [
     ('Sr No', 'serial_number'),
     ('Concept Collection Title', 'concept_collection_title'),
     ('EncodedID', 'encoded_id'),
     ('Collection Title ', 'collection_title'),
     ('Collection-aware URL', 'collection_aware_url'),
    ]]    

class AssignmentForm(formencode.Schema):
    name = validators.String(strip=True)
    allow_extra_fields = True
    
    css_long = 'info xlong'
    css = 'info xmed'
    edit_css = 'xmed'
    edit_long = 'xlong'
        
    ordered_fields = [ h.labelreadonly(*vals) if 'info' in vals[2] else h.labelinput(*vals) for vals in [
     ('Id', 'id', css),
     ('Title', 'name', edit_long),
     ('Description', 'description', css_long),
     ('Type', 'assignmentType', css),
     ('creationTime', 'creationTime', css),
     ('Group Id', 'groupID', css),
     ('Due', 'due', edit_css),
     ('Concept Count', 'totalCount', css),
     ('Origin', 'origin', css),
     ('LMS Provider Id', 'providerID', css),
     ('Provider Assignment Id', 'providerAssignmentID', css),
    ]]
    level_sel = [(s.lower(), s) for s in ('', 'At Grade', 'Basic', 'Advanced')]
    
    """listhead = [ h.htmldiv(*vals) for vals in [
     ('Revision', 'revision'),
     ('Title', 'title'),
     # ('Id', 'id'), 
     # ('Id', 'artifactRevisionID'), 
     ('Statistics', 'statistics'),
     ('Creator', 'creator'),
     ('Created', 'created'),
     ('Published', 'published'),
    ]]"""


class RevisionForm(formencode.Schema):
    css_long = 'info xlong'
    css = 'info xmed'
    artifact_form = ArtifactForm()
    ordered_fields = [ h.labelreadonly(*vals) for vals in [
     ('Title', 'title', css_long),
     ('Handle', 'handle', css_long),
     ('Type', 'artifactType', css),
     ('Revision', 'revision', css),
     ('Id', 'id', css),
     ('Encoded Id', 'encodedID', css),
     ('Domain Encoded Id', 'conceptNode', css),
     ('Created', 'created', css),
     ('Modified', 'modified', css),
     ('Realm', 'realm', css),
     ('License', 'license', css),
     ('Level', 'level', css),
     ('Language', 'language', css),
     ('Is Favorite', 'isFavorite', css),
     ('Labels', 'labels', css),
     ('File', 'file', css),
     ('Offset', 'offset', css),
     ('Added to Library', 'addedToLibrary', css),
    ]]
    listhead = artifact_form.listhead

class CoverForm(formencode.Schema):
    resourceUri = validators.URL()
    resourcePath = validators.String()
    allow_extra_fields = True

class UploadBrowseTermsForm(formencode.Schema):
    browseTerms = validators.String(not_empty=True)

class UploadFoundationGridForm(formencode.Schema):
    foundationGrid = validators.String(not_empty=True)

class UploadStandardsCorrelationForm(formencode.Schema):
    googleDocumentName = validators.String()
    googleWorksheetName = validators.String()
    file = validators.String()
    useMongo = validators.StringBoolean(if_missing=False)

class UploadStateStandardsForm(formencode.Schema):
    googleDocumentName = validators.String()
    googleWorksheetName = validators.String()
    file = validators.String()
    useMongo = validators.StringBoolean(if_missing=False)


class UploadVocabularyForm(formencode.Schema):
    googleDocumentName = validators.String()
    googleWorksheetName = validators.String()
    file = validators.String()

class UploadRetrolationForm(formencode.Schema):
    googleDocumentName = validators.String()
    googleWorksheetName = validators.String()
    file = validators.String()

class FeedbacksForm(formencode.Schema):
    """ Reviews and Reviews Reply listing form
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Member Name', 'membername',), 
     ('Comments', 'comments'),
     ('Type', 'type'),
     ('Created', 'creationTime'),
     ('Helpful', 'helpful'),
     ('Not Helpful', 'nothelpfull'),
     ('Score', 'score'),
     ('Action', 'action'),
    ]]

    inlinelisthead = [ h.htmldiv(*vals) for vals in [
     ('Member Name', 'membername'), 
     ('Comments', 'comments'),
     ('Type', 'type'),
     ('Created', 'creationTime'),
     ('Update Time', 'updateTime'),
     ('Action', 'action'),
    ]]
    
class GetRealContributions(formencode.Schema):
    """ Get Real Contribution listing form
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Artifact Id', 'artifactID',), 
     ('Title', 'title'),
     ('Branch-Concept','branch_concept'),
     ('Type', 'type'),
     ('Created By', 'creator_name'),
     ('Created', 'createdDate'),
     ('Public Score', 'publicscore'),
     ('Official Score', 'officialscore'),
     ('Final Score', 'totalscore'),
     ('Action', 'action'),
    ]]


class ArtifactFeedbackReviewForm(formencode.Schema):
    """ Artifacts listing Form
    """
    type_choices = [
     ('False', 'False'),
     ('True', 'True'),
    ]

    type_sel = [('isHelpful,'+name, lbl) for name, lbl in type_choices]

    approved_type_sel = [('isApproved,'+name, lbl) for name, lbl in type_choices]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Artifact Id', 'artifactID', 'sortable'), 
     ('Member Id', 'memberID', 'sortable'),
     ('Comment', 'comments', 'sortable'),
     ('Count', 'countOfNo', 'sortable'),
     ('Action', 'action'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Artifact Id', 'artifactID', 'sortable'), 
     ('Member Id', 'memberID', 'sortable'),
     ('Comment', 'comments', 'sortable'),
     ('Count', 'countOfNo', 'sortable'),
     ('Action', 'action'),
    ]]

class ReviewAbuseReportForm(formencode.Schema):
    """ Artifact Feedback and Reviews abuse listing Form
    """
    type_choices = [
     ('feedback', 'Feedbacks'),
     ('review', 'Reviews'),
    ]

    type_sel = [('commentType,'+name, lbl) for name, lbl in type_choices]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Artifact ID', 'artifactID', 'sortable'),
     ('Owner ID', 'memberID', 'sortable'),
     ('Artifact Comments', 'comments'),
     ('Reporter Member Id', 'memberID'),
     ('Created', 'creationTime'),
     ('Action', 'action'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Artifact Id', 'artifactID', 'sortable'),
     ('Artifact Comments', 'comments'),
     ('Reporter Member Id', 'memberID', 'sortable'),
     ('Action', 'action'),
    ]]

'''
    RWE related
'''
class RwesForm(formencode.Schema):
    """ RWEs listing Form
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Title', 'title'),
     ('Sim ID', 'simID'),
     ('Encoded IDs', 'eids'),
     ('Level', 'level'),
     ('Modified', 'updated', 'sortable date'),
    ]]
    
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Title, Sim ID', 'title', 'sortable'),
     ('Modified', 'updated', 'sortable date'),
    ]]
    
    pagesize_sel = [('pageSize,'+str(size), size) for size in [10,25,50]]

class RweForm(formencode.Schema):
    allow_extra_fields = True
    css = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if len(vals)==3 else \
                       h.labelreadonlyarea(*vals) for vals in [
     ('Created', 'created', css), 
     ('Updated', 'updated', css),
    ]]
    
'''
    URLMAP related
'''
class UrlmapsForm(formencode.Schema):
    """ Urlmaps listing Form
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'),
     ('Old Url', 'oldUrl'),
     ('New Url', 'newUrl'),
     ('Created', 'created'),
     ('Modified', 'updated', 'sortable date'),
    ]]
    
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'),
     ('Old Url', 'oldUrl'),
     ('New Url', 'newUrl')
    ]]
    
    pagesize_sel = [('pageSize,'+str(size), size) for size in [10,25,50]]
class UrlmapForm(formencode.Schema):
    allow_extra_fields = True
    css = 'info xmed'
    ordered_fields = [ h.labelreadonly(*vals) if len(vals)==3 else \
                       h.labelreadonlyarea(*vals) for vals in [
     ('Id', '_id', css),                                                               
     ('Old Url', 'oldUrl', css), 
    ]]
    

class ConceptsForm(formencode.Schema):
    """ Concept listing Form
    """
    css_long = 'info xlong'
    css = 'info xmed'

    ordered_fields = [ h.labelreadonly(*vals) if 'info' in vals[2] else h.labelinput(*vals) for vals in [
     ('EncodedID', 'encodedID', css),
     ('Id', 'id', css),
     ('Created', 'created', css),
     ('Modified', 'updated', css),
    ]]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('EncodedID', 'encodedID', 'sortable'),
     ('Title', 'name', 'sortable'),
     ('Description', 'description', 'sortable'),   
     ('Created', 'created', 'sortable'),
     ('Modified', 'updated', 'sortable'),
     ('View', ''),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Title, Type', 'name', 'sortable'),
     ('Description', 'description', 'sortable'),
     ('Modified', 'updated', 'sortable'),
    ]]

class SchoolsForm(formencode.Schema):
    """ School listing Form
    """
    def __init__(self):
        state_choices = h.getSchoolStates()
        state_choices = [('all', 'All')] + state_choices
        # Updating the states
        self.state_sel = [('state,'+name, lbl) for name, lbl in state_choices]
        super(SchoolsForm, self).__init__()
    css_long = 'info xlong'
    css = 'info xmed'

    status_choices = [('all', 'All'), ('true', 'Deleted'), ('false', 'Not Deleted')]
    status_sel = [('isDeleted,'+name, lbl) for name, lbl in status_choices]


    ordered_fields = [ h.labelreadonly(*vals) if 'info' in vals[2] else h.labelinput(*vals) for vals in [
     ('School ID', 'schoolID', css),
     ('School Name', 'schoolName', css),
     ('State', 'state', css),
     ('City', 'city', css),
     ('Zipcode', 'zipcode', css),
     ('isDeleted', 'isDeleted', css),
    ]]

    listhead = [ h.htmldiv(*vals) for vals in [
     ('School ID', 'schoolID', 'sortable'), 
     ('School Name', 'schoolName', 'sortable'), 
     ('State', 'state', 'sortable'),
     ('City', 'city', 'sortable'),
     ('Zipcode', 'zipcode', 'sortable'),   
     ('View', ''),
     ('Delete/Restore', ''),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('School Name', 'school_name', 'sortable'), 
     ('State', 'state', 'sortable'),
     ('City', 'city', 'sortable'), 
     ('Zipcode', 'zipcode', 'sortable'),
    ]]
