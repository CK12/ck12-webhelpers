tasks = [
    'assembleArtifactTask',
    'AssignmentPushNotifierTask',
    'PushNotifierTask',
    'BrowseTermTask',
    'BrowseTermLoaderTask',
    'ContentLoader',
    'ContributedQuestionsNotifier',
    'CreateIndex',
    'deleteArtifactTask',
    'DocumentLoaderWorker',
    'EflexProcessor',
    'EmailNotifierTask',
    'epub',
    'FinalizeBookTask',
    'Gdt2ePubTask',
    'GdtTask',
    'ImageProcessor',
    'Import1xBooks',
    'MathCacheTask',
    'ModalityLoaderTask',
    'ModifyDocumentBatch',
    'memberViewedArtifactTask',
    'mobi',
    'pdf',
    'PeriodicTask',
    'PhoneHomeTask',
    'PushNotifierTask',
    'Reindex',
    'RetrolationLoaderTask',
    'SeoMetadataTask',
    'StandardsLoaderTask',
    'StandardsLoaderTaskMongo',
    'StandardsCorrelationLoaderTask',
    'SyncCollectionsTask',
    'SyncIndex',
    'TasksMaintainerTask',
    'ThumbnailGenerationTask',
    'UploadDocumentBatch',
    'VcsTask',
    'VocabularyLoaderTask',
    'WikiImporter',
    'worksheet',
    'XdtTask',
    'CourseArtifactLoaderTask',
    'ArtifactUrlValidator',
]

ae_tasks = [
    'ConceptNodes',
    #'ConceptVideos',
    'CreateModality',
    'CreateScreenshot',
    #'CreateTopicDiagnostics',
    'DeduceDifficultyTask',
    #'EmailReminder',
    #'ETCCalculator',
    #'InteractivePracticeMaintainer',
    #'IRTParametersEstimator',
    'IncompletePracticeNotifier',
    'InstantSimulationPracticeUpdater',
    'KeyQuestionsFinder',
    #'PlixCreator',
    'PracticeArtifacts',
    'PushMessenger',
    #'PushMessengerForAssignment',
    'QuestionDifficultyFinder',
    'QuestionUploader',
    'QuestionsTagger',
    #'QuizUpdater',
    'RemoveQuestion',
    'ScoreReporterTask',
    'SimulationInteractivePracticeMaintainer',
    'SpacedPracticeMaintainer',
    'SyncCollectionsTask',
    #'TimeSpentCalculator',
    'UpdatePracticeModality',
    #'WeeklyEmailReminder',
    #'WeeklyEmailReminderToCoach',
    'Worksheet',
    'GuidedPracticeWorksheet',
]
init_in_paneview = [] # listing pages (eg. 'users') to be init to pane view,
# should leave it as [] so all listings init to full view since view can be 
# switched easily by clicking on either view mode change or "open on right" icon
def getviewmode(listing):
    return 'pane' if listing in init_in_paneview else 'full'

link_viewmodes_order = ['full', 'pane'] # defines order of userlink2() and idlink2()
# link_viewmodes_order = ['pane', 'full'] # defines order of userlink2() and idlink2()
# helpers' default link generation:
# ['full', 'pane'] generates open-full-text-link, open-pane-icon-link
# ['pane', 'full'] generates open-pane-text-link, open-full-icon-link

statuses = ['FAILURE', 'IN PROGRESS', 'PENDING', 'SUCCESS'] 
abuse_statuses = ['reported', 'accepted', 'fixed', 'flagged', 'ignored', 'reopened']
import1x_statuses = ['Acknowledged', 'Done', 'Failed', 'In Progress', 'Not Started', 'Declined']

refresh_rate_choices = [
    ('', 'Never'), 
    (15000, 'Every 15 secs'), 
    (30000, 'Every 30 secs'), 
    (60000, 'Every minute')
]
int_as_yesno_choices = [(1, 'Yes'), (0, 'No')]
tf_as_yesno_choices = [('true', 'Yes'), ('false', 'No')]

# Exercises:
# Question types to be displayed as radio button on question detail page
question_types = [
     ('1', 'Short Answer'),
     ('2', 'True/False'),
     ('3', 'Multiple Choice'),
     ('4', 'Select All that Apply'),
     ('5', 'Fill in the Blanks'),
     ('6', 'Geometry Interactive'),
     ('7', 'Ilo Component'),
     ('8', 'Sim Interactive'),
     ('9', 'Highlight the Word'),
     ('10', 'Drag and Drop'),
     ('11', 'Discussion')
]

# Multiple select drop-down
question_type_choices = [
     ('questionTypeID,', 'All'),                    
     ([('questionTypeID,selSiblings', 'All Basic'),
     ('questionTypeID,1', 'Short Answer'),
     ('questionTypeID,2', 'True/False'),
     ('questionTypeID,3', 'Multiple Choice'),
     ('questionTypeID,4', 'Select All that Apply'),
     ('questionTypeID,5', 'Fill in the Blanks'),
     ('questionTypeID,9', 'Highlight the Word'),
     ('questionTypeID,10', 'Drag and Drop'),
     ('questionTypeID,11', 'Discussion')], 'Basic'),
     ([('questionTypeID,selSiblings','All Interactive'), ('questionTypeID,6','Geometry Interactive'), ('questionTypeID,7','Ilo Component'), ('questionTypeID,8','Sim Interactive')], 'Interactive')
]

# Multiple select drop-down on New Test(Advanced) page(exclude Geometry Interactive and Ilo Component questions)
new_test_question_type_choices = [
     ('questionTypeID,', 'All'),                    
     ([('questionTypeID,selSiblings', 'All Basic'),
     ('questionTypeID,1', 'Short Answer'),
     ('questionTypeID,2', 'True/False'),
     ('questionTypeID,3', 'Multiple Choice'),
     ('questionTypeID,4', 'Select All that Apply'),
     ('questionTypeID,5', 'Fill in the Blanks'),
     ('questionTypeID,9', 'Highlight the Word'),
     ('questionTypeID,10', 'Drag and Drop'),
     ('questionTypeID,11', 'Discussion')], 'Basic'),
     ([('questionTypeID,8','Sim Interactive')], 'Interactive')
]

question_levels = ['easy', 'medium', 'hard']
hw_error_statuses = ['NEW', 'RESOLVED-FIXED', 'RESOLVED-INVALID']

#Assessment
question_grades = ['1','2','3','4','5','6','7','8','9','10','11','12']
assessment_error_statuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'RESOLVED']

# Events, Notifications:
notification_types = ['email'] 
notification_freqs = ['instant', 'once', 'daily', 'weekly'] 

# Resources:
print_formats = ['epub', 'mobi', 'pdf'] 
image_types = ['image', 'cover page', 'cover page icon', 'equation']
resource_types = ['attachment','audio','contents','cover page','cover page icon','cover video','equation','expression','image','video']

download_types = ['attachment', 'studyguide', 'lessonplan']
download_types_ = download_types[:]
download_types.extend(print_formats)

update_via_upload_only_types = ['audio', 'interactive']
update_via_upload_only_types.extend(download_types_)

updatable_types = update_via_upload_only_types[:]
updatable_types.extend(image_types)

# artifacts
artifactTypes = [
    'activity', 'activityans', 'asmtpractice', 'asmtquiz', 'asmttest', 'asmtpracticeint', 'assignment', 'attachment', 'audio',
    'book', 
    'chapter', 'concept', 'conceptmap', 'cthink',
    'domain',
    'enrichment', 'exercise', 
    'flashcard', 'folder', 
    'handout',
    'image', 'interactive', 
    'lab', 'labans', 'labkit', 'lecture', 'lesson', 'lessonplan', 'lessonplanans', 'lessonplanx', 'lessonplanxans', 
    'postread', 'postreadans', 'prepostread', 'prepostreadans', 'preread', 'prereadans', 'presentation', 
    'quiz', 'quizans', 'quizdemo', 
    'rubric', 'rwa', 'rwaans', 
    'section', 'simulation', 'simulationint', 'studyguide', 'study-track', 
    'teaching-material', 'tebook', 
    'web', 'whileread', 'whilereadans', 'workbook', 'worksheet', 'worksheetans', 'plix'
    ]

# External question Types
external_question_type_choices = [
     ('BG', 'Braingenie'),
     ('FM', 'FlexMath'),
     ('DG', 'Digitized'),
     ('CK12', 'CK-12'),
]

# Entity Type names(to track the history of actions taken from Assessment)
entity_types=[
    ('question', 'Question'),
    ('test', 'Test')                
]
