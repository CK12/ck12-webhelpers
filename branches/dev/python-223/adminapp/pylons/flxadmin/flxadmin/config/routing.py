"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from routes import Mapper

def make_map(config):
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False
    map.explicit = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    # CUSTOM ROUTES HERE
    
    # proxy to API services to bypass js cross-domain problem in local development
    map.connect('apiproxy', '/apiproxy', controller='apiproxy', action='proxy')
    map.connect('apiproxyraw', '/apiproxy/{raw}', controller='apiproxy', action='proxy')
    map.connect('external', '/external', controller='apiproxy', action='external')

    # home, signin/signout
    map.connect('home', '/', controller='home', action='index')
    map.connect('signin', '/signin', controller='authentication', action='signin')
    map.connect('signout', '/signout', controller='authentication', action='signout')
    map.connect('auth-signout', '%s/signout'%config['flx_auth_api_server'], _static=True)

    # users
    map.connect('users', '/user/profiles', controller='user', action='profiles')
    map.connect('/user/profiles_list', controller='user', action='profiles_list')
    map.connect('/user/profiles/raw', controller='user', action='profiles_raw')
    map.connect('/user/trace', controller='user', action='trace')
    map.connect('profile_detail', '/user/profile/{id}', controller='user', action='profile')
    map.connect('/user/profile/{id}/raw', controller='user', action='profile_raw')
    map.connect('/upload/students', controller='user', action='upload_students')
    map.connect('member_groups', '/member_groups_list/{id}', controller='user', action='groups_list')
    map.connect('/admin/traces', controller='user', action='admin_traces')
    map.connect('/admin/traces_list', controller='user', action='admin_traces_list')
    map.connect('/user/restrictions', controller='user', action='user_restrictions')
    map.connect('/user/restrictions_list', controller='user', action='user_restrictions_list')

    # ADS
    map.connect('/user/report/delete/{id}', controller='user', action='delete_user_report_data')
    map.connect('/ads/testquery', controller='ads', action='test_query')
    map.connect('/ads/encodequery', controller='ads', action='encode_query')

    # user's 1.x books
    map.connect('/user/1xbooks', controller='user', action='user_1xbooks')
    map.connect('/user/1xbooks_list', controller='user', action='user_1xbooks_list')
    map.connect('/user/1xbooks/raw', controller='user', action='user_1xbooks_raw')
    map.connect('/user/1xbooks/raw/{id}', controller='user', action='user_1xbooks_raw')
    map.connect('/users/have1xbooks', controller='user', action='users_have1xbooks')
    map.connect('/users/have1xbooks_list', controller='user', action='users_have1xbooks_list')
    map.connect('/users/have1xbooks/raw', controller='user', action='users_have1xbooks_raw')
    map.connect('/users/users_export', controller='user', action='user_export')
    map.connect('/users/ajax_users_export', controller='user', action='ajax_users_export')
    map.connect('/remove/download/{filename}', controller='download', action='download_and_remove')
    map.connect('/update/member/forget/password/{email}', controller='user', action='reset_password_email')

    #Search
    map.connect('/specialsearchentries', controller='specialSearch', action='specialSearchEntries')
    map.connect('/specialsearchentries_list', controller='specialSearch', action='specialSearchEntries_list')
    map.connect('/specialsearchentry/{term}', controller='specialSearch', action='specialSearchEntry')
    map.connect('/specialsearchentry/{term}/{entry}', controller='specialSearch', action='specialSearchEntry', requirements={ 'term': 'new|delete'})
    map.connect('/specialsearchentry', controller='specialSearch', action='specialSearchEntry')
    map.connect('/tryspecialsearch', controller='specialSearch', action='trySpecialSearch')
    map.connect('/tryspecialsearch_list', controller='specialSearch', action='tryspecialsearch_list')
    # artifacts
    map.connect('artifacts', '/artifacts', controller='artifact', action='artifacts')
    map.connect('/artifactfeedbackreview', controller='artifact', action='artifactfeedbackreview')
    map.connect('/artifactfeedbackreview_list', controller='artifact', action='artifactfeedbackreview_list')
    map.connect('/feedback/abuse/report', controller='artifact', action='reviews_abuse_report')
    map.connect('/feedback/abuse/report_list', controller='artifact', action='reviews_abuse_report_list')
    
    map.connect('assignments', '/assignments', controller='artifact', action='assignments')
    map.connect('/assignment/{id}', controller='artifact', action='assignment')
    map.connect('/artifacts_list', controller='artifact', action='artifacts_list')
    map.connect('/artifacts/raw', controller='artifact', action='artifacts_raw')
    map.connect('/artifact/{id}', controller='artifact', action='artifact')
    map.connect('/artifact/{id}/raw', controller='artifact', action='artifact_raw')
    map.connect('/content/{artifactOrRevision}/{id}', controller='artifact', action='content')
    map.connect('/content/{artifactOrRevision}/{id}/raw', controller='artifact', action='content_raw')
    map.connect('/newcover/{artifactOrRevision}/{id}', controller='artifact', action='newcover')
    map.connect('/review/{id}', controller='artifact', action='feedbacks', reviewsByUser=False)
    map.connect('/manage/user/reviews', controller='artifact', action='feedbacks', reviewsByUser=True)
    map.connect('/feedback_list/{id}', controller='artifact', action='feedbacks_list')
    map.connect('/user_feedback_list', controller='artifact', action='feedbacks_list')
    map.connect('/json/feedback/reply/{artifactID}/{memberID}', controller='artifact', action='getlistreply')
    map.connect('/json/feedback/delete', controller='artifact', action='deleteArtifactFeedback')
    map.connect('/json/feedback/update', controller='artifact', action='updateArtifactFeedback')
    map.connect('/json/review/delete', controller='artifact', action='deleteFeedbackReview')
    map.connect('/artifact/notifyusers/{revisionID:[0-9]+}/{artifactID:[0-9]+}', controller='artifact', action='notify_users')
    map.connect('/artifact/notifyusers/{revisionID:[0-9]+}', controller='artifact', action='notify_users')
    map.connect('/ugc_artifacts', controller='artifact', action='ugc_artifacts')
    map.connect('/manage/modalities', controller='modality', action='modalities')
    map.connect('/modalities_list', controller='modality', action='modalities_list')
    map.connect('/upload/modality/courses', controller='modality', action='upload_modality_course')
    #map.connect('/school', controller='artifact', action='create_school')

    map.connect('/schools_list', controller='school', action='schools_list')
    map.connect('/manage/schools', controller='school', action='manage_schools')
    map.connect('/create/school', controller='school', action='create_school')
    map.connect('/update/school/{schoolID}', controller='school', action='update_school')
    #map.connect('/manage/school/artifacts', controller='dexter', action='stateSchoolForm')
    
    # concepts
    map.connect('concepts', '/concepts', controller='concept', action='concepts')
    map.connect('/concepts_list', controller='concept', action='concepts_list')
    map.connect('/concept/{eid}', controller='concept', action='concept')
    
    # RWEs
    map.connect('/rwes', controller='artifact', action='rwes')
    map.connect('/rwes_list', controller='artifact', action='rwes_list')
    map.connect('/rwe/{id}', controller='artifact', action='rwe')
    
     # URLMapping
    map.connect('/urlmaps', controller='artifact', action='urlmaps')
    map.connect('/urlmaps_list', controller='artifact', action='urlmaps_list')
    map.connect('/urlmap/{id}', controller='artifact', action='urlmap')


    # uploads
    map.connect('/upload/browseTerms', controller='artifact', action='upload')
    map.connect('/upload/foundationGrid', controller='artifact', action='upload')
    map.connect('/upload/standardsCorrelation', controller='artifact', action='upload_standards')
    map.connect('/upload/stateStandards', controller='artifact', action='upload_standards')
    map.connect('/upload/modality', controller='modality', action='upload_modality')
    map.connect('/upload/retrolation', controller='artifact', action='upload_retrolation')
    map.connect('/upload/vocabulary', controller='artifact', action='upload_vocabulary')
    map.connect('/upload/seometadata', controller='artifact', action='upload_seometadata')

    # content imports 
    map.connect('rebuild_cache', '/rebuild_cache', controller='content', action='rebuild_cache')
    map.connect('wiki_import', '/wikiimport', controller='content', action='wiki_import')
    map.connect('wiki_imports', '/wiki_imports', controller='content', action='wiki_imports')
    map.connect('gdoc_imports', '/gdoc_imports', controller='content', action='gdoc_imports')
    map.connect('/gdocimport/{doctype}/raw', controller='content', action='gdocs_raw')
    map.connect('/gdocimport/{doctype}', controller='content', action='gdoc_import')
    map.connect('/gdocs_list/{doctype}', controller='content', action='gdocs_list')

    # excercises 
    map.connect('exercises', '/exercises', controller='exercise', action='exercises')
    map.connect('/exercises/raw', controller='exercise', action='exercises_raw')
    map.connect('/exercises/{Qclass}/{Qid}', controller='exercise', action='exercises')
    map.connect('/exercises_list/{Qclass}/{Qid}', controller='exercise', action='exercises_list')
    map.connect('/exercises_list', controller='exercise', action='exercises_list')
    map.connect('/exercise/{id}', controller='exercise', action='exercise')
    map.connect('/exercise/{id}/raw', controller='exercise', action='exercise_raw')
    map.connect('/associate/{Qclass}/{Qid}/{Eid}', controller='exercise', action='associate')
    map.connect('/deassociate/{Qclass}/{Qid}/{Eid}', controller='exercise', action='deassociate')
    
    # assessments 
    map.connect('tests', '/assessment/tests', controller='test', action='tests')
    #map.connect('/tests', controller='test', action='tests')
    map.connect('/assessment/tests_list', controller='test', action='tests_list')
    #map.connect('/tests_list', controller='test', action='tests_list')
    map.connect('/assessment/test/{id}', controller='test', action='test')
    #map.connect('/test/{id}', controller='test', action='test')
    map.connect('questions', '/assessment/questions', controller='test', action='questions' )
    map.connect('/assessment/questions/{Tid}', controller='test', action='questions' )
    map.connect('/assessment/questions/published/{Tid}', controller='test', action='published_questions' )
    map.connect('/assessment/mismatchedLevel/questions', controller='test', action='mismatched_level_questions' )
    map.connect('/assessment/questions_list', controller='test', action='questions_list')
    map.connect('/assessment/questions_list/{asOverlay}/{mismatchedLevel}', controller='test', action='questions_list')
    map.connect('/assessment/questions_list/{asOverlay}', controller='test', action='questions_list')
    map.connect('/assessment/question/{Qid}', controller='test', action='question')
    map.connect('/assessment/update/test/{Tid}', controller='test', action='updateTest')
    map.connect('/assessment/upload/questions', controller='test', action='upload_questions')
    map.connect('/assessment/delete/question/{id}', controller='test', action='delete', Type='question')
    map.connect('/assessment/delete/{Type}/{id}', controller='test', action='delete', requirements={ 'Type': 'test|answerSynonym'})
    map.connect('/assessment/test/{Action}/{Tid}', controller='test', action='createOrUpdateTest', requirements={ 'Action': 'edit'})
    map.connect('/assessment/create/test/{Action}', controller='test', action='createOrUpdateTest', requirements={ 'Action': 'new'})

    #assessment task
    map.connect('/assessment/tasks', controller='assessmenttask', action='tasks')
    map.connect('/assessment_tasks_list', controller='assessmenttask', action='tasks_list')
    map.connect('/assessment/task/{id}', controller='assessmenttask', action='task')

    # assessment errors
    map.connect('assessmenterrors', '/assessment/assessment_errors', controller='test', action='assessment_errors')
    map.connect('/assessment/errors_list', controller='test', action='errors_list')
    map.connect('/assessment/error/{Qid}', controller='test', action='assessment_error')
    map.connect('/assessment/practice/usage', controller='test', action='practice_usage')
    map.connect('assessmenterrorreports','/assessment/error_reports', controller='test', action='error_reports')
    
    # assessment synonyms
    map.connect('synonyms', '/assessment/synonyms', controller='test', action='synonyms')
    map.connect('/assessment/synonyms_list', controller='test', action='synonyms_list')
    map.connect('/assessment/synonym/{id}', controller='test', action='synonym')
    
    # assessment hints
    map.connect('hints', '/assessment/hints', controller='test', action='hints')
    map.connect('/assessment/hints_list', controller='test', action='hints_list')
    
    # assessment synonyms
    map.connect('actions', '/assessment/actions', controller='test', action='actions')
    map.connect('/assessment/actions_list', controller='test', action='actions_list')
    map.connect('/assessment/action/{id}', controller='test', action='action')
    
    # questions upload
    map.connect('/upload/docs/exercises', controller='exercise', action='uploadExerciseDocs')
    map.connect('/upload/exercises/form', controller='exercise', action='exerciseUploaderForm')

    # questions 
    map.connect('/questions/{Qclass}', controller='exercise', action='questions')
    map.connect('/questions/{Qclass}/raw', controller='exercise', action='questions_raw')
    map.connect('/questions/{Qclass}/{Eid}', controller='exercise', action='questions')
    map.connect('/questions_list/{Qclass}/{Eid}', controller='exercise', action='questions_list')
    map.connect('/questions_list/{Qclass}', controller='exercise', action='questions_list')
    map.connect('/question/{Qclass}/{Qid}', controller='exercise', action='question')
    map.connect('/question/{Qclass}/{id}/raw', controller='exercise', action='question_raw')

    # homework errors 
    map.connect('hwerrors', '/hwerrors', controller='exercise', action='hw_errors')
    map.connect('/hwerrors_list', controller='exercise', action='hw_errors_list')
    map.connect('/hwerrors/raw', controller='exercise', action='hw_errors_raw')
    map.connect('/hwerror/{id}', controller='exercise', action='hw_error')
    map.connect('/hwerror/{id}/raw', controller='exercise', action='hw_error_raw')

    # events
    map.connect('events', '/events', controller='event', action='events')
    map.connect('/events_list', controller='event', action='events_list')
    map.connect('/events/raw', controller='event', action='events_raw')

    # notifications 
    map.connect('notifications', '/notifications', controller='event', action='notifications')
    map.connect('/notifications_list', controller='event', action='notifications_list')
    map.connect('/notification/create', controller='event', action='create_notification')
    map.connect('/maintenance/notification/create', controller='event', action='create_maintenance_notification')
    map.connect('/maintenance/notification_list', controller='event', action='maintenance_notifications_list')
    map.connect('/notification/{id}', controller='event', action='notification')
    map.connect('/notification/{id}/raw', controller='event', action='notification_raw')
    map.connect('/notifications/raw', controller='event', action='notifications_raw')

    # revisions
    map.connect('/revisions_list/{id}', controller='artifact', action='revisions_list')
    map.connect('/revision/{id}', controller='artifact', action='revision')
    map.connect('/revision/{id}/raw', controller='artifact', action='revision_raw')

    # resources
    map.connect('resources', '/resources', controller='resource', action='resources')
    map.connect('/resources_list', controller='resource', action='resources_list')
    map.connect('/resource/upload', controller='resource', action='upload')
    map.connect('/resource/{id}', controller='resource', action='resource')
    map.connect('/resource/{id}/raw', controller='resource', action='resource_raw')

    # providers 
    map.connect('providers', '/providers', controller='resource', action='providers')
    map.connect('/providers/raw', controller='resource', action='providers_raw')
    map.connect('/providers_list', controller='resource', action='providers_list')
    map.connect('/provider/create', controller='resource', action='create_provider')
    map.connect('/provider/{id}', controller='resource', action='provider')
    map.connect('/provider/{id}/raw', controller='resource', action='provider_raw')

    # abuse reports
    map.connect('abusereports', '/abusereports', controller='resource', action='abusereportsredirect')
    map.connect('issues','/issues', controller='resource', action='abusereports')
    map.connect('/abusereports_list', controller='resource', action='abusereports_list')
    map.connect('/abusereports/raw', controller='resource', action='abusereports_raw')
    map.connect('/abusereport/{id}', controller='resource', action='abusereportredirect')
    map.connect('/issue/{id}', controller='resource', action='abusereport')
    map.connect('/abusereport/{id}/raw', controller='resource', action='abusereport_raw')
    map.connect('/reportabuse/{id}', controller='resource', action='reportabuse')

    # tasks
    map.connect('tasks', '/tasks', controller='task', action='tasks')
    map.connect('/tasks_list', controller='task', action='tasks_list')
    map.connect('/tasks/raw', controller='task', action='tasks_raw')
    map.connect('/task/{id}', controller='task', action='task')
    map.connect('/task/{id}/raw', controller='task', action='task_raw')

    # re-index
    map.connect('/reindex/{id}', controller='task', action='reindex')
    map.connect('/reindex/', controller='task', action='reindex')
    map.connect('reindex', '/reindex', controller='task', action='reindex')

    # print formats
    map.connect('/format/{id}/{revisionID}', controller='artifact', action='format')
    map.connect('/format/{id}', controller='artifact', action='format')
    map.connect('/formatsinfo/{id}/{revisionID}', controller='artifact', action='formats_info')
    map.connect('/formatsinfo/{id}/', controller='artifact', action='formats_info')
    map.connect('/formatsinfo/{id}', controller='artifact', action='formats_info')

    # stats
    map.connect('saythanks', '/stats/saythanks', controller='stats', action='saythanks')
    map.connect('/stats/saythanks/raw', controller='stats', action='saythanks_raw')
    map.connect('/add/downloadstatstypes', controller='stats', action='addDownloadStatsType')
    
    #Switch user
    map.connect('dlg-switchuser','/dlg-switchuser', controller="authentication", action="dlg_switchuser")
    map.connect('switchuser-list-users','/ajax/switchuser/list/', controller="authentication", action="ajax_list_users") 
    map.connect( 'auth-switchuser', '%s/switch/member/' % config['flx_auth_api_server'],_static=True )
    map.connect( 'authorized_switch','/account/federated/authorized/switch/', controller='authentication', action='switchuser') 
    
     
    # groups
    map.connect('groups', '/groups', controller='groups', action='groups')
    map.connect('/groups_list', controller='groups', action='groups_list')
    map.connect('/group/quizreport', controller='groups', action='quiz_report')
    map.connect('/group/{id}', controller='groups', action='group')
    map.connect('/group_members_list/{id}', controller='groups', action='members_list')

    #Q&A Posts
    map.connect('posts', '/posts', controller='groups', action='peerhelp_posts')
    map.connect('/posts_list', controller='groups', action='peerhelp_posts_list')

    # Public forums sort order
    map.connect('forums', '/forums/sequence', controller='groups', action='forums_sequence')
    map.connect('/forums_list', controller='groups', action='forums_list')

    # get real contributions
    map.connect('/get-real-contributions', controller='artifact', action='get_real_contributions')
    map.connect('/get-real-contributions-list', controller='artifact', action='get_real_contributions_list')
    
    # Partner API Key Management
    map.connect('partnerapi', '/partner_api', controller='partnerapi', action='partner_api')
    map.connect('applications', '/api_partner_applications_list', controller='partnerapi', action='getAllApplications')
    map.connect('paths', '/apipaths/', controller='partnerapi', action='getAllPaths')
    map.connect('/json/{path}/delete/{ID}', controller='partnerapi', action='deleteByID')
    map.connect('/json/update/application/{ID}', controller='partnerapi', action='updateApplication')
    map.connect('/json/new/application/', controller='partnerapi', action='createApplication')
    map.connect('/json/new/path/', controller='partnerapi', action='createPath')

    #user acl management
    map.connect('acl', '/user/acl', controller='user', action='acl')
    map.connect('/user/acl_list', controller='user', action='acl_list')
    
    #lms related
    map.connect('lms-providers', '/lms/provider/raw', controller='lms', action='get_raw_all_lms_providers')
    map.connect('lms-provider-apps', '/lms/provider/apps/{providerID}/raw', controller='lms', action='get_raw_lms_provider_apps')
    map.connect('/get/lms/providerapp/users', controller= 'lms', action='get_lms_provider_app_users')

    map.connect('/lti_apps', controller='lms', action='lti_apps')
    map.connect('/lti_apps_list', controller='lms', action='lti_apps_list')
    map.connect('/lti_app/{provider}/{site}', controller='lms', action='lti_app')
    
    #Mobile Application Version Management related
    map.connect('/apps/mobile', controller='applicationManagement', action='applicationManagementForm')
    return map
