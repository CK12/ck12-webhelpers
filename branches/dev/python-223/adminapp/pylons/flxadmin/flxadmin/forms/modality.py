import formencode
from formencode import validators
from flxadmin.lib import helpers as h
from flxadmin.model.artifact import ArtifactManager

class ModalitiesForm(formencode.Schema):
    """ Modalities listing Form
    """
    modality_type_choices = [
     ('', 'All'),
     ('lesson', 'Lesson'),
     ('concept', 'Concept'),
     ('studyguide', 'Study Guide'),
     ('activity', 'Activity'),
     ('activityans', 'Activity Answer Key'),
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
     ('asmttest', 'Diagnostic Test'),
     ('asmtpractice', 'Asmt Practice Test'),
    ]
    type_sel = [('modalities,'+name, lbl) for name, lbl in modality_type_choices]

    select_all_checkbox = h.labelcheckbox('', 'select_all', False)

    origin_choices = [
     ('', 'All'),
     ('ck12', 'CK-12'),
     ('community', 'Community'),
    ]
    origin_sel = [('origin,'+name, lbl) for name, lbl in origin_choices]

    level_choices = [
     ('', 'All'),
     ('at-grade', 'At Grade'),
     ('basic', 'Basic'),
     ('advanced', 'Advanced'),
    ]

    level_sel = [('level,'+name, lbl) for name, lbl in level_choices]
    
    course_filter_sel = [('course,', 'Select Course')]
    courses = ArtifactManager.getAllCourses()
    if courses.has_key('courses') and courses['courses']:
        courses = courses['courses']
        course_filter_sel.extend([('%s,%s'%('course',course['handle']), course['title'])for course in courses])

    #US 148539925 : iterate over published collections and 
    #create options in the 'collections' dropdown filter.
    collection_filter_sel = [('collection', 'Select Collection')]
    collections = ArtifactManager.getPublishedCollections()
    if collections.has_key('collections') and collections['collections']:
        publishedCollections = collections['collections']
        collection_filter_sel.extend([('%s,%s_%s'%('collection',publishedCollection['handle'],\
            publishedCollection['creatorID']), publishedCollection['handle']) \
        for publishedCollection in publishedCollections])

    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'), 
     ('Type', 'artifactTypeID'),
     ('Title', 'title'),
     ('Creator', 'creator'),
     #('Course Name', 'course_name'),
     ('Collections', 'collection_name'),
     ('Level', 'level'),
     ('created', 'creationTime'),
    ]]

    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id', 'sortable'), 
     ('Title, Type', 'title'),
     ('Creator', 'creatorID'),
     #('Course Name', 'course_name'),
     ('Collections', 'collection_name'),
     ('Level', 'level'),
    ]]
    
    pagesize_sel = [('pageSize,'+str(size), size) for size in [10,25,50]]
    
    returnAll_sel = 'returnAll,'+str("True")

class UploadModalityForm(formencode.Schema):
    googleDocumentName = validators.String()
    googleWorksheetName = validators.String()
    file = validators.String()
    publishOnImport = validators.StringBoolean(if_missing=False)
