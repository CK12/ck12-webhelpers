"""The base Controller API

Provides the BaseController class for subclassing.
"""
from pylons.controllers import WSGIController
from pylons import tmpl_context as c, request, config, response

from flxadmin.model.session import SessionManager
from flxadmin.model.user import UserManager,ACLManager, User
from flxadmin.lib import helpers as h
from pylons.controllers.util import abort
import logging
LOG = logging.getLogger(__name__)

class BaseController(WSGIController):
    def __before__( self ):
        logged_in_user = SessionManager.getCurrentUser()
        cookies = request.cookies
        auth_cookie = config.get( 'ck12_login_cookie' )
        c.user_error_code=0
        if (not auth_cookie in cookies) and 'flxadmin' in cookies and logged_in_user:
            # User probably signed out from main app, so log user out
            if not config.get('debug'):
                LOG.debug("Auto logout, reason: cookies has 'flxadmin' but not auth_cookie, user exists in session. Clearing cookies:")
                LOG.debug(request.cookies)
                UserManager.logout()
                for cookie in request.cookies:
                    response.delete_cookie(cookie)
                logged_in_user = None
        elif auth_cookie in cookies and (\
         not 'flxadmin' in cookies or \
         not logged_in_user or not User().hasAdminRole()):
         ## or (not logged_in_user and cookies[auth_cookie] != SessionManager.getDataFromSession('auth-session-id'))):
         # auth-session-id check requires no logged_in_user, o/w it will hitchhike
         # admin's login and be logged in as non-admin.  So the check is not 
         # needed as it is already covered in 'not logged_in_user' check.
            LOG.debug("Auto login, reason: has cookies[auth_cookie] but either no cookies['flxadmin'], no session['user'], or cookies[auth_cookie]!=session's auth-session-id")
            logged_in_user = UserManager.login('', '', request.headers.get('cookie'))

        c.errors = []
        c.user = logged_in_user
        if c.user:
            c.nav = [{
                'title': 'User Management',
                'links': [
                    'users', 
                    ('/users/have1xbooks', 'Users Who Have 1.x Books'),
                    ('/user/1xbooks', "User's Imported 1.x Books"),
                    ('/upload/students', 'Upload Students'),
                    ('/users/users_export', 'Users Export'),
                    ('/user/acl', 'Access Control'),
                    ('/user/trace', 'User Trace'),
                    ('/admin/traces', 'Admin Trace'),
                    ('/user/restrictions', 'Manage User Restrictions')
                ]},{
                'title': 'Artifact Management',
                'links': [
                    'artifacts',
                    ('/artifactfeedbackreview','Artifact Feedback Review'),
                    ('/feedback/abuse/report','Artifact Feedback Abuse Report'),
                    ('/rwes', 'Real World Examples'),
                    ('wiki_import', 'Wiki Import'),
                    ('rebuild_cache', 'Rebuild Cache'),
                    ('/gdocimport/doc', 'Google Docs Import'),
                    ('/upload/browseTerms', 'Upload Browse Terms'),
                    ('/upload/foundationGrid', 'Upload Foundation Grid'),
                    ('/upload/standardsCorrelation', 'Upload Standards Correlation'),
                    ('/upload/stateStandards', 'Upload State Standards'),
                    ('/upload/modality', 'Upload Modality'),
                    ('/upload/retrolation', 'Upload Retrolation'),
                    ('/upload/vocabulary', 'Upload Vocabulary'),
                    ('/upload/seometadata', 'Upload SEO Metadata'),
                    ('/get-real-contributions', 'Get Real Contributions'),
                    ('/ugc_artifacts', 'User Generated Artifacts'),
                    ('/specialsearchentries','Special Search Entry'),
                    ('/upload/modality/courses', 'Upload Modality Course'),
                    ('/manage/modalities','Modality Manangement'),
                    ('/concepts', 'Update Concept'),
                    ('/urlmaps', 'URL Mapping'),
                    ('/manage/schools', 'Manage Schools')                    
                ]},{
                #'title': 'Exercise Management',
                #'links': [
                #    'exercises',
                #    ('/questions/declarative', 'Declarative Questions'),
                #    ('/questions/generative', 'Generative Questions'),
                #    ('hwerrors', 'Error Reports'), 
                #    ('/upload/exercises/form','Bulk Upload'),
                #]},{
                'title': 'Resources and Media Management',
                'links': [
                    'resources', 
                    ('issues', 'User Reported Issues and Feedback'),
                    ('providers', 'Embedded Object Providers'),
                    ('/provider/create', 'Create Embedded Object Provider'),
                ]},{
                'title': 'Notifications and Events',
                'links': [
                    'notifications',
                    ('/notification/create', 'Create Notification'),
                    ('events', 'Events'),
                    ('/maintenance/notification/create', 'Maintenance Notification'),
                ]},{
                'title': 'Task Management',
                'links': [
                    'tasks',
                ]},{
                'title': 'Statistics',
                'links': [
                    ('saythanks', 'Say Thanks'),
                ]
            },{
		'title': 'Group Management',
		'links': [
			('groups', 'Groups'),
			#('/group/quizreport', 'Quiz Reports')
            ('/assignments', 'Assignments'),
            ('/posts', 'Q&A Posts'),
            ('/forums/sequence', 'Forums Sequence')
		]
		 },{
            'title': 'API Access',
            'links': [
                      ('/partner_api', 'API Access')
                      
                      ]
         },{
            'title': 'Assessment',
            'links': [
                      ('', 'Assessment'),
                      ('/assessment/tests', 'Tests'),
                      ('/assessment/create/test/new', 'New Test (Advanced)'),
                      ('/assessment/questions', 'Questions'),
                      ('/assessment/mismatchedLevel/questions', 'Questions for Review'),
                      ('/assessment/assessment_errors', 'Error Reports'),
                      ('/assessment/upload/questions', 'Bulk Upload'),
                      ('/assessment/tasks', 'Tasks'),
                      ('/assessment/practice/usage', 'Practice Usage'),
                      ('/assessment/synonyms', 'Synonyms'),
                      ('/assessment/hints', 'Hints'),
                      ('/assessment/actions', 'Actions')
                      ]
         #},{
            #'title': 'Switch User',
            #'links':[('dlg-switchuser','Switch User', 'switchuser')
            #         ]
         },{
            'title': 'App Manager',
            'links':[('','Manage Apps'),
                    ('/apps/mobile','Mobile Apps(iOS+Android)'),
                    #('/lti_apps','LTI Applications')
                    ]
         }]

            u = c.user
            lbl = '%s %s' % (u.get('firstName'), u.get('lastName'))
            if not lbl:
                lbl = 'My Profile'
            c.right_navs = h.htmlalist([
             ('/user/profile/%d'%u.get('authID', 0), lbl), 
             ('signout', 'Sign Out'),
            ])
            
            new_nav = []
            paths = ACLManager.get_allowed_paths(User().hasAdminRole(getAdminRole=True))
            for nav in c.nav:
                #if nav.has_key('links') and nav['links'][0] in userACL:
                new_nav_item = {}
                new_nav_item['title'] = nav['title']
                new_nav_item['links'] = []
                has_menu_link = True
                txt = None
                path = nav['links'][0]
                if isinstance(path, (list, tuple)):
                    path, txt = path[0], path[1]
                #If main nav is not in allowed ACL, make it as text to allow sub-menus action if any
                if nav.has_key('links') and (path not in paths) \
                    and (ACLManager.validate_access(h.url_(path, qualified = False)) == False):
                    txt = txt or path.capitalize()
                    new_nav_item['links'].append(('', txt))
                    has_menu_link = False
                elif nav.has_key('links'):
                    new_nav_item['links'].append(nav['links'][0])
                if nav.has_key('links'):
                    for sub_nav in nav['links'][1:]:
                        #if sub_nav in userACL:
                        path = sub_nav[0]
                        if path in paths or ACLManager.validate_access(h.url_(path, qualified = False)):
                            new_nav_item['links'].append(sub_nav)
                if (has_menu_link) or (not has_menu_link and len(new_nav_item['links']) > 1):
                    new_nav.append(new_nav_item)
            c.nav = new_nav
            if not ACLManager.validate_access(request.path):
                abort(409)

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        return WSGIController.__call__(self, environ, start_response)
