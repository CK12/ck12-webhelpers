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

"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from routes import Mapper
import ast

def make_map( config ):
    """Create, configure and return the routes Mapper"""
    map = Mapper( directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'] )
    map.minimization = False
    map.explicit = False

    map.connect( 'nojavascript','/nojavascript/', controller='landing', action='nojavascript' )
    map.connect( 'nocookies','/nocookies/', controller='landing', action='nocookies' )
    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect( '/error/{action}', controller='error' )
    map.connect( '/error/{action}/{id}', controller='error' )

    # Valid branches allowed in URLs like /<branch>/<concept-handle>/
    branches = []
    for subject in ast.literal_eval(config['valid_branches']):
        branches.extend(subject['children'])
    valid_branches = '(?i)%s' %  '|'.join([x['slug'] for x in branches])

    # CUSTOM ROUTES HERE
    map.redirect( '/index.html', '/student/' )
    map.connect( 'home','/', controller='landing', action='index' )
    map.connect( 'student','/student/', controller='landing', action='student' )
    map.connect( 'teacher','/teacher/', controller='landing', action='teacher' )

    # signin/signout
    map.connect( 'signin-complete-newuser','/account/signin-complete/{authType}/{newuser}/', controller='authentication', action='signin_complete' )
    map.connect( 'signin-complete','/account/signin-complete/{authType}/', controller='authentication', action='signin_complete' )
    map.connect( 'signout','/account/signout/', controller='authentication', action='signout' )

    # Federated authentication. Provides auth services like facebook/google auth
    map.connect( 'authorized_popup','/account/federated/authorized/popup/', controller='authentication', action='authorized',popup=True )
    map.connect( 'authorized','/account/federated/authorized/', controller='authentication', action='authorized',popup=None )

    # static routes pointing to CK12 auth service
    map.connect( 'auth-signup', '%s/signup' % config['flx_auth_api_server'],_static=True )
    map.connect( 'auth-signin', '%s/signin' % config['flx_auth_api_server'],_static=True )
    map.connect( 'auth-profile', '%s/profile' % config['flx_auth_api_server'],_static=True )
    map.connect( 'auth-signout', '%s/signout' % config['flx_auth_api_server'],_static=True )
    map.connect( 'auth-password-change', '%s/change/password' % config['flx_auth_api_server'],_static=True )

    # account settings/profile/change password
    map.connect( 'settings','/account/settings/', controller='account', action='settings' )
    map.connect( 'auth-settings','https://%s/account/settings' % config['hosts'],_static=True )

    #search
    map.connect( 'oldsearch', '/oldsearch/', controller='search', action='searchModalitiesOld' )
    map.connect( 'search', '/search/', controller='search', action='searchModalitiesNew' )

    #Collection routes
    #map.connect('/browse/', controller='browse', action='collection')
    map.connect('/math/', controller='browse', action='collection')
    map.connect('/science/', controller='browse', action='collection')
    map.connect('/english/', controller='browse', action='collection')
    map.connect( 'elementary-math', '/elementary-math/', controller='browse', action='elementary_math' ,grade=1 )
    map.connect( 'elementary-math', '/elementary-math-grade-{grade}/', controller='browse', action='elementary_math' )
    map.connect('/c/{collection_handle}/', controller='browse', action='collection')
    map.connect('/c/{realm}/{collection_handle}/', controller='browse', action='collection', requirements={'realm':'[^/]*?:[^/]*?'} )
    map.connect( 'concept-collection', '/c/{collection_handle}/{concept_collection_handle}/', controller='modality', action='collection_concept_modalities_qq', ext=None, realm=None )
    map.connect( 'concept-collection', '/c/{realm}/{collection_handle}/{concept_collection_handle}/', controller='modality', action='collection_concept_modalities_qq', ext=None,
        requirements={'realm':'[^/]*?:[^/]*?'} )
    map.connect( 'modality_branch','/c/{collection_handle}/{concept_collection_handle}/{mtype}/{mhandle}/',controller='modality',action='collection_modality_details',realm=3,modality_realm=None,
                    requirements={'branch':valid_branches})
    map.connect( 'modality_branch_ext','/c/{collection_handle}/{concept_collection_handle}/{mtype}/{mhandle}/*ext/',controller='modality',action='collection_modality_details',realm=3,modality_realm=None,
                    requirements={'ext':'r\d+','branch':valid_branches})
    map.connect( 'modality_branch_realm','/c/{collection_handle}/{concept_collection_handle}/{mtype}/{modality_realm}/{mhandle}/',controller='modality',action='collection_modality_details',realm=3,
                    requirements={'realm':'[^/]*?:[^/]*?','branch':valid_branches})
    map.connect( 'modality_branch_realm_ext','/c/{collection_handle}/{concept_collection_handle}/{mtype}/{modality_realm}/{mhandle}/*ext/',controller='modality',action='collection_modality_details',realm=3,
                    requirements={'realm':'[^/]*?:[^/]*?','ext':'r\d+','branch':valid_branches})
    map.connect( 'modality_branch','/c/{realm}/{collection_handle}/{concept_collection_handle}/{mtype}/{mhandle}/',controller='modality',action='collection_modality_details',modality_realm=None,
                    requirements={'branch':valid_branches})
    map.connect( 'modality_branch_ext','/c/{realm}/{collection_handle}/{concept_collection_handle}/{mtype}/{mhandle}/*ext/',controller='modality',action='collection_modality_details',modality_realm=None,
                    requirements={'ext':'r\d+','branch':valid_branches})
    map.connect( 'modality_branch_realm','/c/{realm}/{collection_handle}/{concept_collection_handle}/{mtype}/{modality_realm}/{mhandle}/',controller='modality',action='collection_modality_details',
                    requirements={'realm':'[^/]*?:[^/]*?','branch':valid_branches})
    map.connect( 'modality_branch_realm_ext','/c/{realm}/{collection_handle}/{concept_collection_handle}/{mtype}/{modality_realm}/{mhandle}/*ext/',controller='modality',action='collection_modality_details',
                    requirements={'realm':'[^/]*?:[^/]*?','ext':'r\d+','branch':valid_branches})

    # browse
    map.connect( 'subjects','/browse/', controller='browse', action='subjects' )
    # browse subject
    map.connect( 'math','/math/', controller='browse', action='browseSubject' )
    map.connect( 'science','/science/', controller='browse', action='browseSubject' )
    map.connect( 'english','/english/', controller='browse', action='browseSubject' )
    # map.connect( 'elementary-math', '/elementary-math/', controller='browse', action='elm' )
    # Schools using CK-12
    map.connect('/schools/{state}/{school}-{number}', controller='backport',action='school_redirect',
        requirements={'school': '(.+)', 'number':'[a-z0-9]{32}(/)?'})
    map.connect( 'schools-home','/schools/', controller='browse', action='schools', anything=None )
    map.connect( 'schools-detail','/schools/*anything', controller='browse', action='schools' )

    # CBSE books
    map.connect( 'cbse-detail','/cbse/', controller='browse', action='cbse_books' )
    map.connect( 'college-flexbooks','/college/', controller='browse', action='college_flexbooks' )
    map.connect( 'standards-flexbooks','/books/standards/{standardstype}/', controller='browse', action='standards_flexbooks',
                requirements={'standardstype': 'ccss|ngss'} )
    map.connect( 'elementary-science','/elementary-science/', controller='browse', action='elementary_science' )
    #
    map.connect( 'schools-r-home','/r-schools/', controller='browse', action='schoolsReact', anything=None )
    map.connect( 'schools-r-detail','/r-schools/*anything', controller='browse', action='schoolsReact' )

    # Auto Aligned Standards
    map.connect( 'auto-std-aligned-home','/autoStandard/', controller='auto_aligned_std', action='standards_selector',anything=None)
    map.connect( 'auto-std-aligned-home-detail','/autoStandard/*anything', controller='auto_aligned_std', action='standards_selector')

    # CK-12 Standard Search
    map.connect( 'ck-12-ask-home','/ask/', controller='aligned_search', action='home',anything=None)
    map.connect( 'ck-12-ask-detail','/ask/*anything', controller='aligned_search', action='home')


    # Forums
    map.connect( 'forums','/forums/', controller='groups', action='forums')
    map.connect( 'forum-setting','/forum/{id}/setting', controller='groups', action='forums_authenticated')
    map.connect( 'forum-detail','/forum/*anything', controller='groups', action='forums')

    # standards aligned page
    map.connect( 'standards','/standards/', controller='standards', action='list',subject=None,state=None,grade=None )
    map.connect( '/standards/{subject}/{state}/{grade}/', controller='standards', action='list' )
    map.connect( '/ajax/standards/books/{subject}/{state}/{grade}/{standardboard}/{standardboardID}/{standardboardLongname}/', controller="standards", action="ajax_books")
    map.connect( '/ajax/standards/books/{subject}/{state}/{grade}/', controller="standards", action="ajax_books")
    map.connect( '/ajax/standards/{state}/subjects/', controller="standards", action="ajax_subjects")
    map.connect( '/ajax/standards/{subject}/states/', controller="standards", action="ajax_states")
    map.connect( '/ajax/standards/{subject}/{state}/grades/', controller="standards", action="ajax_grades")
    map.connect( '/ajax/standards/{subject}/{state}/alternate_grades/', controller="standards", action="ajax_alternate_grades")
    map.connect( '/ajax/boards/standards/correlated/{standard_board_id}/{artifact_id}/', controller="standards", action="ajaxStandardBoardsBySubjectAndGrade")
    map.connect( '/ajax/standards/correlated/{standard_board_id}/{artifact_id}/', controller="standards", action="ajaxStandardsByArtifactAndStandardBoard")
    map.connect( '/ajax/artifact/standardboards/{artifact_id}/', controller="standards", action="ajaxStandardBoardsByArtifactID")

    #routes for new library implementation
    map.connect( 'my', '/my/', controller='mylibrary', action='library_new', anything=None)
    map.connect( 'library', '/my/library/', controller='mylibrary', action='library_new', anything=None)
    map.connect( 'library-state', '/my/library/*anything', controller='mylibrary', action='library_new')
    map.connect( 'library-tests', '/my/tests/', controller='mylibrary', action='library_new', anything=None)
    map.connect( 'library-tests-state', '/my/tests/*anything', controller='mylibrary', action='library_new')

    # ================ Concept Map
    map.connect( '/conceptmap/', controller='conceptmap', action='index' )
    # ================


    # exercises
    map.connect( '/get/questionfromexercise/encodedid/{encodedID}/', controller='exercise', action='questionFromExercise' )
    map.connect( '/get/preview/question/{question_class}/{question_id}/', controller='exercise_generator', action='previewQuestion',
                 requirements={'question_class':'generative|declarative'} )
    map.connect( '/assess/answer/', controller='exercise', action='assessAnswer' )
    map.connect( '/start/test/{encodedID}/', controller='exercise', action='ajax_startTest' )
    map.connect( '/update/test/', controller='exercise', action='updateTest' )
    map.connect( '/stop/test/', controller='exercise', action='stopTest' )
    map.connect( '/update/questionattempt/', controller='exercise', action='updateQuestionAttempt')
    map.connect( '/clearsession/testtry/', controller='exercise', action='clearTestTrySession' )
    map.connect( '/exercise/add/question/{exercise_id}/', controller='exercise_generator', action='addQuestion', realm=None, ext=None)
    map.connect( '/exercise/delete/question/{exercise_id}/', controller='exercise_generator', action='deleteQuestion', realm=None, ext=None)
    map.connect( '/exercise/delete/question/encodedid/{encoded_id}/', controller='exercise_generator', action='deleteQuestion', realm=None, ext=None)
    map.connect( '/exercise/keep/question/{question_class}/{question_id}/', controller='exercise_generator', action='keepQuestion', realm=None, ext=None )
    map.connect( '/exercise/report/error/', controller='exercise', action='reportError')
    map.connect( '/exercise/report/error/question/', controller='exercise', action='reportErrorQuestion')

    map.connect( '/exercise/add/{exercise_title}/', controller='exercise_generator', action='addQuestionForExercise')
    map.connect( '/exercise/add/{exercise_title}/ae/', controller='exercise_generator', action='addQuestionForExercise_ae')
    map.connect( 'addQuestionForConcept', '/exercise/add/question/{conceptid}/ae/', controller='exercise_generator', action='addQuestionForConcept')

    map.connect( '/exercise/add/{exercise_title}/*ext/', controller='exercise_generator', action='addQuestionForExercise', realm=None)
    map.connect( '/exercise/embed/{exercise_title}/', controller='exercise', action='exercise_perma',
                 realm=None, ext=None, render_context="embed")
    map.connect( '/exercise/{exercise_title}/*ext/', controller='exercise', action='exercise_perma',
                 realm=None)
    map.connect( '/exercise/{exercise_title}/', controller='exercise', action='exercise_perma',
                 realm=None, ext=None)
    map.connect( '/ajax/exercise/questioncount/{encoded_id}/', controller='exercise', action='get_exercise_question_count')
    map.connect( '/ajax/exercise/quiz/{encoded_id}/', controller='exercise', action='get_quiz')
    map.connect( '/ajax/exercise/{exercise_title}/', controller='exercise', action='exercise_perma',
                 realm=None, ext=None, render_context="ajax")
    map.connect( '/ajax/exercise/{exercise_title}/*ext/', controller='exercise', action='exercise_perma',
                 realm=None, render_context="ajax")
    map.connect( '/render/exercise/worksheet/status/{taskID}/', controller='exercise', action='renderExerciseWorksheetStatus' )
    map.connect( '/render/exercise/worksheet/{encodedID}/', controller='exercise', action='createExerciseWorksheet' )

    map.connect( '/render/exercise/workbook/status/{taskID}', controller='exercise', action='renderExerciseWorkBookStatus' )
    map.connect( '/render/exercise/workbook/', controller='exercise', action='createExerciseWorkBook' )
    map.connect( '/create/exercise/test/', controller='exercise', action='create_test' )

    # Groups
    map.connect( '/ajax/groups/share', controller='groups', action='share_to_groups' )

    # Quiz
    map.connect( '/start/quiz/{encodedID}/', controller='exercise', action='ajax_startQuiz' )
    map.connect( '/get/questionfromquiz/', controller='exercise', action='questionFromQuiz' )
    map.connect( '/end/quiz/{encodedID}/', controller='exercise', action='endQuiz' )
    map.connect( '/view/user/quizresults/{encodedID}/', controller='exercise', action='getUserQuizResults' )

    #
    # mapping for 1.x urls
    #
    # Special handling for a old CLRN book. see bug 10142
    map.redirect('/flexr/flexbook/2957', '/book/CK-12-Earth-Science-For-High-School/', _redirect_code="301 Moved Permanently")
    map.redirect('/flexbook/21st_Century_Physics/', '/book/CK-12-21st-Century-Physics-A-Compilation-of-Contemporary-and-Emerging-Technologies/', _redirect_code="301 Moved Permanently")
    map.redirect('/flexr/browse/', '/browse/', _redirect_code="301 Moved Permanently")

    map.redirect('/flexr/', '/', _redirect_code="301 Moved Permanently")
    map.redirect('/flexbook/', '/', _redirect_code="301 Moved Permanently")
    map.connect('/{flexr_prefix}/*rest', controller="backport", action="redirect_clean", to="/", status_code=301,
                requirements={ 'flexr_prefix': 'flexr|flexbook'})

    #
    # permaURLs
    #
    map.connect( 'embed_url', '/embed/*perma_handle/', controller='details', action='artifact_perma_context', render_context='embed' )
    map.connect( 'print_url', '/print/*perma_handle/', controller='details', action='artifact_perma_context', render_context='print' )
    map.connect( 'related_url', '/related/*perma_handle/', controller='details', action='artifact_perma_context', render_context='related' )

    #Book reading views
    map.connect( '/getinfo/{realm}/{artifact_type}/{artifact_title}/*ext/', controller='details', action='artifact_info' )
    map.connect( '/getinfo/{realm}/{artifact_type}/{artifact_title}/', controller='details', action='artifact_info', ext=None )
    map.connect( '/getinfo/{artifact_type}/{artifact_title}/*ext/', controller='details', action='artifact_info', realm=None )
    map.connect( '/getinfo/{artifact_type}/{artifact_title}/', controller='details', action='artifact_info', realm=None, ext=None )

    map.connect('/ajax/chapterinfo/{chapter_perma}/', controller='details', action='ajax_chapterinfo')
    map.connect('/ajax/chapterinfo/{booktype}/{book_handle}/r{version}/{position}/{chapter_handle}/', controller='details', action='ajax_chapterinfo', realm=None,
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/ajax/chapterinfo/{realm}/{booktype}/{book_handle}/r{version}/{position}/{chapter_handle}/', controller='details', action='ajax_chapterinfo',
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )

    ## Test editor
    map.connect( '/editor/test/{mtype}/{eid}/{mhandle}/{realm}',controller='modality',action='edit_test_details', requirements={'mtype': 'quiz|practice|interactive practice'})
    map.connect( '/editor/test/{mtype}/{eid}/{mhandle}',controller='modality',action='edit_test_details', requirements={'mtype': 'quiz|practice|interactive practice'})

    # contextual editing views
    map.connect('/editor/{booktype}/{book_handle}/r{version}/section/{position}/', controller='editor', action='artifact_editor_context_book', realm=None,
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/editor/{booktype}/{book_handle}/r{version}/section/{position}/{section_title}/', controller='editor', action='artifact_editor_context_book', realm=None,
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/editor/{realm}/{booktype}/{book_handle}/r{version}/section/{position}/', controller='editor', action='artifact_editor_context_book',
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/editor/{realm}/{booktype}/{book_handle}/r{version}/section/{position}/{section_title}/', controller='editor', action='artifact_editor_context_book',
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )


    # contextual reading views WITHOUT Realm
    map.connect('/{booktype}/{book_handle}/r{version}/section/{position}/{section_title}/', controller='backport', action='redirect_without_section_handle_and_revision',
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/{booktype}/{book_handle}/r{version}/section/{position}/', controller='details', action='book_details_react', realm=None,
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/{booktype}/{book_handle}/section/{position}/', controller='details', action='book_details_react', realm=None, version=None,
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )

    # contextual reading views WITH realm
    map.connect('/{realm}/{booktype}/{book_handle}/r{version}/section/{position}/', controller='details', action='book_details_react',
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/{realm}/{booktype}/{book_handle}/section/{position}/', controller='details', action='book_details_react', version=None,
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )
    map.connect('/{realm}/{booktype}/{book_handle}/r{version}/section/{position}/{section_title}/', controller='details', action='book_details_react',
            requirements={'booktype': 'book|tebook|workbook|studyguide|labkit|quizbook'} )

    # For old concept url
    map.connect( '/{old_modality_path}/{artifact_handle}/', controller='backport',action='concept_url',
                requirements={'old_modality_path':'concept|lesson'})
    map.connect( '/{old_modality_path}/{artifact_handle}/*ext/',controller='backport',action='concept_url',
                requirements={'ext':'r\d+','old_modality_path':'concept|lesson' })

    # artifact editor
    map.connect( 'editor', '/editor/c/*perma_handle/', controller='editor', action='edit_artifact' ) #this order is very very important
    map.connect( 'editor', '/editor/*perma_handle/', controller='editor', action='edit_artifact' )

    # permaURL with realm
    map.connect( '/{realm}/{artifact_type}/{artifact_title}/', controller='details', action='book_details_react',
                 ext=None, requirements={'artifact_type':'book|tebook|workbook|studyguide|labkit|quizbook|lesson|section|chapter','realm':'[^/]*?:[^/]*?'} )

    # permaURL with realm and extended params
    map.connect( '/{realm}/{artifact_type}/{artifact_title}/*ext/', controller='details', action='book_details_react',
                 requirements={'artifact_type':'book|tebook|workbook|studyguide|labkit|quizbook|lesson|section|chapter','realm':'[^/]*?:[^/]*?','ext':'r\d+'} )

    # permaURL with no realm or extended params
    map.connect( '/{artifact_type}/{artifact_title}/', controller='details', action='book_details_react',
                 realm=None, ext=None, requirements={'artifact_type':'book|tebook|workbook|studyguide|labkit|quizbook|lesson|section|chapter|'} )

    # permaURL with extended params
    map.connect( '/{artifact_type}/{artifact_title}/*ext/', controller='details', action='book_details_react',
                 realm=None, requirements={'artifact_type':'book|tebook|workbook|studyguide|labkit|quizbook|lesson|section|chapter', 'ext':'r\d+'} )

    #Editor
    map.connect('/ajax/data/artifact/', controller='editor', action='artifact_save', artifact_id=None,conditions=dict(method=['POST','PUT']))
    map.connect('/ajax/data/artifact/{artifact_id}/', controller='editor', action='artifact_save', conditions=dict(method=['POST','PUT']))
    map.connect('/ajax/data/artifact/{artifact_id}/', controller='editor', action='artifact_by_id', conditions=dict(method=['GET']))
    map.connect('/ajax/data/artifact/{artifact_id}/', controller='editor', action='artifact_delete', conditions=dict(method=['DELETE']))
    map.connect('/preview/math/', controller='editor', action='preview_math_expression' )
    map.connect('/ajax/create/embeddedobject/', controller='editor',action='ajax_create_embedded_object')
    map.connect('/ajax/get/embeddedobject/{eo_id}/', controller='editor', action='ajax_get_embedded_object')
    #Editor dialogs
    map.connect('/dialog/addcontent/', controller="editor", action="dialog_addcontent")
    map.connect('/ajax/addcontent/getinfo/{revision_id}/', controller='editor', action='ajax_artifact_info')
    map.connect('/dialog/addfromgdocs/', controller="editor", action="dialog_addfromgdocs")
    map.connect('/dialog/uploadworddoc/', controller="editor", action="dialog_uploadworddoc")
    map.connect('/dialog/chapteredit/', controller="editor", action="dialog_chapteredit")
    map.connect('/dialog/managecollaborators/', controller="editor", action="dialog_managecollaborators")
    map.connect('/dialog/addconceptnode/', controller="editor", action="dialog_addconceptnode")
    map.connect('/ajax/search/conceptnode/', controller="editor", action="ajax_search_concept_node")
    map.connect('/ajax/search/collection/', controller="editor", action="ajax_search_collection_node")
    map.connect('/ajax/search/title/hints/', controller="search", action="ajax_search_title_hints")
    #Render
    map.connect('/render/{render_type}/status/{artifact_id}/{revision_id}/', controller='details', action='ajax_artifact_render_status', nocache=False, template_type=None)
    map.connect('/render/{render_type}/status/{artifact_id}/{revision_id}/nocache/', controller='details', action='ajax_artifact_render_status', nocache=True)
    map.connect('/render/{render_type}/status/{artifact_id}/{revision_id}/{template_type}/', controller='details', action='ajax_artifact_render_status', nocache=False)
    map.connect('/render/{render_type}/status/{artifact_id}/{revision_id}/nocache/{template_type}/', controller='details', action='ajax_artifact_render_status', nocache=True)

    #settings JS
    map.connect('/js/settings/*anything', controller='javascript', action='settings')
    map.connect('tinymce_gzip','/compressor/tinymce_gzip/', controller='tinymce_compressor', action='gzip_compressor')
    map.connect('tinymce4_gzip','/compressor/tinymce4_gzip/', controller='tinymce_compressor', action='gzip_compressor4')


    #Resource
    map.connect('ajax_resource_attach', '/ajax/resource/attach/{artifact_id}/{artifact_revision_id}/', controller='resource', action='attachment_upload')
    map.connect('ajax_resource_detatch', '/ajax/resource/detach/{artifact_id}/{artifact_revision_id}/{resource_id}/{resource_revision_id}/', controller='resource', action='attachment_delete')
    map.connect('ajax_resource_upload', '/ajax/resource/upload/', controller='resource', action='resource_upload')
    map.connect('ajax_resource_delete', '/ajax/resource/delete/{resource_id}/', controller='resource', action='resource_delete')
    map.connect('ajax_resource_perma', '/ajax/resource/{resource_type}/*perma_handle/', controller='details', action='ajax_get_resources')
    map.connect('/ajax/resource_list/new/', controller='details', action='ajax_get_resources_list', perma_handle=None)
    map.connect('/ajax/resource_list/*perma_handle/', controller='details', action='ajax_get_resources_list')
    map.connect('/ajax/resource_list_answer_key_link/*perma_handle/', controller='details', action='ajax_get_resources_list_answer_key')

    map.connect('ajax_file_upload','/ajax/file/upload/', controller='resource', action='file_upload')

    map.connect( '/{realm}/resource/{resource_type}/*resource_handle', controller='resource', action='resource_details', stream=None )

    #Vocabulary
    map.connect('/ajax/vocabulary_list/*perma_handle/', controller='details', action='ajax_get_vocabulary_list')

    #saythanks
    map.connect('/saythanks/', controller='saythanks', action='index')

    #GDT import related
    map.connect('/gdt/auth/confirm/', controller='editor', action="gdt_auth_confirm")
    map.connect('/gdt/auth/status/', controller='editor', action="gdt_auth_status")
    map.connect('/gdt/get/doclist/', controller='editor', action="gdt_list_docs")
    map.connect('/gdt/get/collist/', controller='editor', action="gdt_list_collections")
    map.connect('/gdt/import/task/', controller='editor' , action='gdt_task_create')
    #task status check
    map.connect('/task/status/{taskid}/', controller='details', action='get_task_status')
    #XDT import related
    map.connect('/xdt/upload/', controller="editor", action='xdt_upload')

    map.connect('create-artifact','/new/{artifact_type}/', controller="editor", action='new_artifact',
                requirements={'artifact_type':'book|concept'})

    map.connect('/ajax/related_list/{artifact_id}/{artifact_type}/', controller='details', action='ajax_get_related_list')

    # book builder aka 'add to book'
    map.connect('dlg-add-to-book','/dialog/addtobook/', controller='bookbuilder', action='dlg_add_to_book')
    map.connect('/ajax/bookbuilder/books/{id}/', controller='bookbuilder', action='ajax_save_book',
        conditions=dict(method=['PUT','POST']))
    map.connect('/ajax/bookbuilder/books/{id}', controller='bookbuilder', action='ajax_save_book',
        conditions=dict(method=['PUT','POST']))
    map.connect('/ajax/bookbuilder/books/', controller='bookbuilder', action='ajax_list_books')

    # coursegen aka curriculum aligned book creator
    map.connect('dlg-coursegen','/dialog/coursegen/', controller='coursegen', action='dlg_coursegen')
    map.connect('/ajax/coursegen/book/', controller='coursegen', action='ajax_create_book')

    map.connect('customcover', '/ajax/custom_cover/', controller='editor', action='ajax_custom_cover')

    # publish artifact request dialog/form
    map.connect('dlg-publish-artifact','/dialog/publish/artifact/', controller='dialog', action='dlg_publish_artifact')
    map.connect('/ajax/publish/artifact/{revision_id}/', controller='dialog', action='ajax_publish_artifact',
        conditions=dict(method=['PUT','POST']))

    # Taxonomy UI
    map.connect( '/eids/', controller='taxonomy', action='index' )

    #Review Feedback
    map.connect( 'review_feedback','/review/feedback/', controller='review_feedback', action='create_feedback' ,artifactID=None,comments=None,vote=None )
    map.connect( '/json/reviews/summary/{artifactID}/',controller='review_feedback',action='summary')
    map.connect( '/json/reviews/my/{artifactID}/',controller='review_feedback',action='get_myreview',conditions=dict(method=['GET']))
    map.connect( '/json/reviews/my/{artifactID}/',controller='review_feedback',action='save_myreview',conditions=dict(method=['POST','PUT']))
    map.connect( '/json/reviews/my/{artifactID}/',controller='review_feedback',action='remove_myreview',conditions=dict(method=['DELETE']))
    map.connect( '/json/reviews/{artifactID}/{pageNum}/',controller='review_feedback',action='list')
    map.connect( '/json/reviews/reply/{artifactID}/{memberID}/',controller='review_feedback',action='listreply')
    map.connect( '/json/reviews/reply/',controller='review_feedback',action='save_reply', conditions=dict(method=['PUT','POST']))
    map.connect( '/json/reviews/updatereply/{reviewID}/{reviewersMemberID}',controller='review_feedback',action='update_reply', conditions=dict(method=['PUT','POST']))
    map.connect( '/json/reviews/updatereply/{reviewID}/{reviewersMemberID}',controller='review_feedback',action='delete_reply', conditions=dict(method=['DELETE']))
    map.connect( '/json/reviews/feedback_usability/',controller='review_feedback',action='update_feedback_usability', conditions=dict(method=['PUT','POST']))

    # Murugan
    map.connect( '/murugan/', controller='murugan', action='murugan' )
    map.connect( '/ajax/murugan/comments', controller='murugan', action='getComments' )

    # Sitemap
    map.connect( '/sitemap.xml', controller='sitemap', action='static' )
    map.connect( '/sitemap.xml/', controller='sitemap', action='static' )
    map.connect( '/sitemap-plix.xml', controller='sitemap', action='plixSiteMap' )
    map.connect( '/sitemap-studyguides.xml', controller='sitemap', action='sgSiteMap' )
    map.connect( '/sitemap-studyguides.xml/', controller='sitemap', action='sgSiteMap' )
    map.connect( '/sitemapindex.xml', controller='sitemap', action='index' )

    # ILO wrapper
    map.connect ('/ilowrapper/', controller='ilowrapper', action='index')

    # Modality configuration
    map.connect('/modality/configuration/', controller='modality', action='modalities_configuration', confType=None)
    map.connect('/update_modalities/configuration/', controller='modality', action='update_modalities_configuration')
    map.connect('/update_groups/configuration/', controller='modality', action='update_groups_configuration')
    map.connect('/new_modality/configuration/', controller='modality', action='new_modality_configuration')
    map.connect('/download/modality_configuration/', controller='modality', action='download_modality_configuration')
    map.connect('/ajax_modality_config/', controller='modality', action='ajax_modality_config')

    map.connect('ajax_modalities','/ajax/modalities/{concept_handle}/', controller='modality', action='ajax_modalities')

    # Embed views
    map.connect('embed', '/embed/', controller='embed', action='embed')
    map.connect('embed-artifact', '/a/{artifactID}/', controller='embed', action='embed_artifact')
    map.connect('embed-react', '/embed-react/', controller='embed', action='embed_react', anything=None)
    map.connect('embed-react', '/embed-react/*anything', controller='embed', action='embed_react')
    map.connect('embed_test', '/embed_test/', controller='embed', action='embed_test')
    #
    # External links proxy
    # Opens the external links in a ck12 branded page
    map.connect('/external/', controller='external', action='url')

    #Benfits
    map.connect( 'features', '/features', controller='landing', action='benefits_landing')

    #Dashboard
    map.connect( 'myprogress', '/my/dashboard/', controller='dashboard', action='dashboard_new')
    map.connect( 'dashboard', '/my/dashboard/', controller='dashboard', action='dashboard_new')
    map.connect( 'dashboard_student', '/my/dashboard/student/', controller='dashboard', action='dashboard_new')

    #Dashboard New
    map.connect( 'dashboard_new', '/my/dashboard-new/', controller='dashboard_new', action='index')
    map.connect( 'dashboard_new_', '/my/dashboard-new/*rest', controller='dashboard_new', action='index')

    # Groups
    map.connect( 'groups','/my/groups/', controller='groups', action='mygroups')
    map.connect( '/group/*rest', controller='groups', action='group_home')
    map.connect( '/group-assignments/*rest', controller='groups', action='group_assignments')
    map.connect( '/group-members/*rest', controller='groups', action='group_members')
    map.connect( '/group-resources/*rest', controller='groups', action='group_resources')
    map.connect( '/group-settings/*rest', controller='groups', action='group_settings')
    map.connect( '/group-reports/*rest', controller='groups', action='group_reports')
    map.connect( '/group-discussions/*rest', controller='groups', action='group_discussions')
    map.connect( '/join/group/', controller='groups', action='join_group')


    # Profile Builder
    map.connect('/profile/update/profileInformation/', controller='account', action='profileInformation')
    map.connect('/save/profile/image', controller='account', action='profileImage')
    map.connect('/ajax/validate/member/login/{login}', controller='account', action='validateProfileUsername')
    map.connect('/ajax/validate/member/login', controller='account', action='validateProfileUsername', conditions=dict(method=['POST']))
    map.connect('/ajax/get/info/my', controller='account', action="getInfoMy")

    # User Map
    map.connect('/map/', controller='user_map', action='index')

    # Google Classroom
    map.connect('/googleclassroom/', controller='google_classroom', action='index')

    # Edmodo App
    map.connect('/app/edmodo/{app_name}/install/', controller='edmodo', action='install')
    map.connect('/app/edmodo/{app_name}/launch/', controller='edmodo', action='launch')

    # CK-12 Browser Bookmarklet
    map.connect('/bookmarklet/', controller='landing', action='bookmarklet')

    #Concept Dashboard
    map.connect('/coversheet/', controller='landing', action='coversheet')

    #practice landing page
    map.connect( 'practice', '/practice/', controller='landing', action='practice_landing')

    # Study guides browse
    map.connect( '/study-guides/', controller='landing', action='studyguides_landing' )
    map.connect( '/study-guides/{subject}/', controller='landing', action='studyguides_landing', subject=None )

    ##############################
    # OLD/Backward supported URLs
    ##############################
    # For old browse
    map.redirect( '/browse/{subject}/','/{subject}/',_redirect_code="301 Moved Permanently")
    # For old library i.e content pages
    map.redirect('/my/content/', '/my/library/', _redirect_code="301 Moved Permanently")
    map.redirect('/my/content/*rest', '/my/library/', _redirect_code="301 Moved Permanently")

    ################################
    # Redirecting english to writing
    ################################
    map.redirect( '/english/','/writing/',_redirect_code="301 Moved Permanently")

    #############################
    # KEEP THEM LAST.These URLs are more generic hence keep them last
    #############################
    # Redirect modality with concept to modality with lesson
    map.redirect('/na/{handle}/concept/{mhandle}/', '/na/{handle}/lesson/{mhandle}/', _redirect_code="301 Moved Permanently")
    map.connect( 'modality_ext','/na/{handle}/concept/{mhandle}/*ext/',controller='backport',action='redirect_without_revision',realm=None,
                    requirements={'ext':'r\d+'})
    map.redirect('/na/{handle}/concept/{realm}/{mhandle}/', '/na/{handle}/lesson/{realm}/{mhandle}/', _redirect_code="301 Moved Permanently")
    map.connect( 'modality_realm_ext','/na/{handle}/concept/{realm}/{mhandle}/*ext/',controller='backport',action='redirect_without_revision',
                    requirements={'realm':'[^/]*?:[^/]*?','ext':'r\d+'})
    map.redirect('/{branch}/{handle}/concept/{mhandle}/', '/{branch}/{handle}/lesson/{mhandle}/', _redirect_code="301 Moved Permanently")
    map.connect( 'modality_branch_ext','/{branch}/{handle}/{mtype}/{mhandle}/*ext/',controller='backport',action='redirect_without_revision',realm=None,
                    requirements={'ext':'r\d+','branch':valid_branches, 'mtype':'concept'})
    map.redirect('/{branch}/{handle}/concept/{realm}/{mhandle}/', '/{branch}/{handle}/lesson/{realm}/{mhandle}/', _redirect_code="301 Moved Permanently")
    map.connect( 'modality_branch_realm_ext','/{branch}/{handle}/concept/{realm}/{mhandle}/*ext/',controller='backport',action='redirect_without_revision',
                    requirements={'realm':'[^/]*?:[^/]*?','ext':'r\d+','branch':valid_branches})

    # concept url of the form /{branch}/{concept handle}/
    map.connect( 'concept','/{branch}/{artifact_title}/', controller='modality', action='concept_modalities_qq', ext=None,
                    requirements={'branch':valid_branches}, realm=None)
    map.connect( 'ugc-concept','/na/{artifact_title}/', controller='modality', action='concept_modalities_qq', ext=None,branch=None, realm=None)



    map.connect( 'modality','/na/{handle}/{mtype}/{mhandle}/',controller='modality',action='modality_details',realm=None)
    map.connect( 'modality_ext','/na/{handle}/{mtype}/{mhandle}/*ext/',controller='modality',action='modality_details',realm=None,
                    requirements={'ext':'r\d+'})
    map.connect( 'modality_realm','/na/{handle}/{mtype}/{realm}/{mhandle}/',controller='modality',action='modality_details',
                    requirements={'realm':'[^/]*?:[^/]*?'})
    map.connect( 'modality_realm_ext','/na/{handle}/{mtype}/{realm}/{mhandle}/*ext/',controller='modality',action='modality_details',
                    requirements={'realm':'[^/]*?:[^/]*?','ext':'r\d+'})
    map.connect( 'modality_branch','/{branch}/{handle}/{mtype}/{mhandle}/',controller='modality',action='modality_details',realm=None,
                    requirements={'branch':valid_branches})
    map.connect( 'modality_branch_ext','/{branch}/{handle}/{mtype}/{mhandle}/*ext/',controller='modality',action='modality_details',realm=None,
                    requirements={'ext':'r\d+','branch':valid_branches})
    map.connect( 'modality_branch_realm','/{branch}/{handle}/{mtype}/{realm}/{mhandle}/',controller='modality',action='modality_details',
                    requirements={'realm':'[^/]*?:[^/]*?','branch':valid_branches})
    map.connect( 'modality_branch_realm_ext','/{branch}/{handle}/{mtype}/{realm}/{mhandle}/*ext/',controller='modality',action='modality_details',
                    requirements={'realm':'[^/]*?:[^/]*?','ext':'r\d+','branch':valid_branches})
    # new browse URLs of the form /{branch}/
    map.connect( 'browse','/{subject}/', controller='browse', action='browse',
                    requirements={'subject':valid_branches})
    map.connect( '/{mtype}/{eid}/{mhandle}', controller='modality',action='load_test_details',
                    requirements={'mtype': 'quiz|practice|interactive practice'})
    map.connect( '/{mtype}/{eid}/{mhandle}/{realm}', controller='modality',action='load_test_details',
                    requirements={'mtype': 'quiz|practice|interactive practice'})

    # UI KIT
    map.connect( 'theme','/theme/', controller='javascript', action='theme')

	# Standards Browser
    map.connect('/{standardtype}/', controller='landing', action='standard',
        requirements={'standardtype': 'ccss|ngss|standard'} )

    map.connect('/{standardtype}/{set}/{domain}/', controller='landing', action='standard',
        requirements={'standardtype': 'ccss|ngss|standard'} )

    #summer challenge
    map.connect('/summer/dashboard/', controller='landing', action='summer_dashboard')
    map.connect('/summer/subjects/', controller='landing', action='summer')
    map.connect('/summer/start/', controller='landing', action='summer')
    map.connect('/summer/authenticated/', controller='landing', action='summer_dashboard')
    map.connect('/summer/coach/authenticated/', controller='landing', action='summer_dashboard')
    map.connect('/summer/coach/', controller='landing', action='summer_dashboard')
    map.connect('/summer/coach/*rest', controller='landing', action='summer_dashboard')
    map.connect('/summer/2017/', controller='landing', action='summer')
    map.connect('summer', '/summer/', controller='landing', action='summer')
    map.connect('/summer/2016/', controller='landing', action='summer_dashboard')



    map.connect('/*(url1)', controller='backport', action='redirect_with_query',conditions=dict(method=['GET']))
    return map
