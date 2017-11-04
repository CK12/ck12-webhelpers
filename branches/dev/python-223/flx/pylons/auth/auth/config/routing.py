"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    map.connect('/get/error/{action}/{id}', controller='error')

    hideInternal = str(config.get('hide_internal_apis')).lower() == 'true'
    development = str(config.get('deployment_target')).lower() == 'development'

    # CUSTOM ROUTES HERE

    #
    #  OpenID provider support.
    #
    map.connect('', controller='openIDClient', action='index')
    map.connect('/authenticate/member/openid', controller='openIDClient', action='authenticate')
    map.connect('/verify/member', controller='intAuth', action='authenticated')

    map.connect('/get/member/approval/{domain}', controller='openIDServer', action='getApproval')
    map.connect('/remember/member/approval/{domain}/{approve}', controller='openIDServer', action='rememberApproval')
    map.connect('/revoke/member/approval/{domain}', controller='openIDServer', action='revokeApproval')

    map.connect('/login/member/ck12', controller='member', action='login')
    map.connect('/get/member/ck12/info', controller='ck12', action='getInfo')
    map.connect('/verify/member/ck12', controller='ck12', action='authenticated')
    map.connect('/test/login/member/ck12', controller='ck12', action='test')
    #
    #  OAuth 1.0a provider support.
    #
    map.connect('/oauth/request/token', controller='oAuthServer', action='getRequestToken')
    map.connect('/oauth/authorize', controller='oAuthServer', action='authorize')
    map.connect('/oauth/access/token', controller='oAuthServer', action='getAccessToken')
    map.connect('/oauth/me', controller='oAuthServer', action='getMyInfo')

    map.connect('/oauth/get/client', controller='oAuthServer', action='getClient')
    map.connect('/oauth/create/client', controller='oAuthServer', action='createClient')

    if development:
        #
        #  Authentication via OAuth (for internal testing only).
        #
        map.connect('/login/member/oauth', controller='oAuthClient', action='login')
        map.connect('/get/member/oauth/info', controller='oAuthClient', action='getInfo')
        map.connect('/verify/member/oauth', controller='oAuthClient', action='authenticated')
        map.connect('/test/login/member/oauth', controller='oAuthClient', action='test')
    #
    #  Authentication via Facebook.
    #
    map.connect('/login/member/facebook', controller='facebook', action='login')
    map.connect('/get/member/facebook/info', controller='facebook', action='getInfo')
    map.connect('/get/member/facebook/email/complete', controller='facebook', action='getEmailComplete')
    map.connect('/get/member/facebook/email/verified', controller='facebook', action='verifiedEmail')
    map.connect('/get/member/facebook/email/{userID}', controller='facebook', action='getEmail')
    map.connect('/verify/member/facebook', controller='facebook', action='authenticated')
    map.connect('/test/login/member/facebook', controller='facebook', action='test')
    #
    #  Authentication via Twitter.
    #
    map.connect('/login/member/twitter', controller='twitter', action='login')
    map.connect('/get/member/twitter/info', controller='twitter', action='getInfo')
    map.connect('/get/member/twitter/email/{userID}/{screenName}/{token}/{ttoken}', controller='twitter', action='getEmail')
    map.connect('/get/member/twitter/email/complete', controller='twitter', action='getEmailComplete')
    map.connect('/get/member/twitter/email/verified', controller='twitter', action='verifiedEmail')
    map.connect('/verify/member/twitter', controller='twitter', action='authenticated')
    map.connect('/test/login/member/twitter', controller='twitter', action='test')
    #
    #  Authentication via clever
    #
    map.connect('/login/member/clever', controller='clever', action='login')
    map.connect('/get/member/clever/info', controller='clever', action='getInfo')
    map.connect('/verify/member/clever', controller='clever', action='authenticated')
    map.connect('/test/login/member/clever', controller='clever', action='test')
    #
    #  Authentication via Google.
    #
    map.connect('/login/member/google', controller='google', action='login')
    map.connect('/get/member/google/info', controller='google', action='getInfo')
    map.connect('/verify/member/google', controller='google', action='authenticated')
    map.connect('/verify/member/app/google/{appCode}', controller='google', action='verifyAppMember')
    map.connect('/test/login/member/google', controller='google', action='test')
    #
    #  Authentication via Microsoft Live.
    #
    map.connect('/login/member/live', controller='live', action='login')
    map.connect('/get/member/live/info', controller='live', action='getInfo')
    map.connect('/verify/member/live', controller='live', action='authenticated')
    map.connect('/test/login/member/live', controller='live', action='test')
    #
    #  Authentication via Microsoft Azure/Office 365.
    #
    map.connect('/login/member/azure', controller='azure', action='login')
    map.connect('/get/code/azure', controller='azure', action='getCode')
    map.connect('/get/member/azure/info', controller='azure', action='getInfo')
    map.connect('/verify/member/azure', controller='azure', action='authenticated')
    map.connect('/test/login/member/azure', controller='azure', action='test')
    #
    #  Authentication via Schoolnet.
    #
    map.connect('/login/member/schoolnet', controller='schoolnet', action='login')
    map.connect('/get/member/schoolnet/info', controller='schoolnet', action='getInfo')
    map.connect('/verify/member/schoolnet', controller='schoolnet', action='authenticated')
    map.connect('/get/schoolnet/wsdl', controller='schoolnet', action='getWSDL')
    map.connect('/test/login/member/schoolnet', controller='schoolnet', action='test')
    #
    #  Authentication via ClassLink.
    #
    map.connect('/login/member/classlink', controller='classlink', action='login')
    map.connect('/get/member/classlink/info', controller='classlink', action='getInfo')
    map.connect('/verify/member/classlink', controller='classlink', action='authenticated')
    map.connect('/test/login/member/classlink', controller='classlink', action='test')
    #
    #  Authentication via Edmodo Connect.
    #
    map.connect('/login/member/edmodo', controller='edmodoconnect', action='login')
    map.connect('/get/member/edmodo/info', controller='edmodoconnect', action='getInfo')
    map.connect('/verify/member/edmodo', controller='edmodoconnect', action='authenticated')
    map.connect('/test/login/member/edmodo', controller='edmodoConnect', action='test')
    #
    #  Edmodo Authentication.
    #
    map.connect('/launch/edmodo/{app}/{appName}/{key}', controller='edmodo', action='launch', requirements={'app': 'math|science'})
    map.connect('/launch/edmodo/{app}/{key}', controller='edmodo', action='launch', requirements={'app': 'math|science'})
    map.connect('/launch/edmodo/{app}', controller='edmodo', action='launch', requirements={'app': 'math|science'})
    map.connect('/login/edmodo/{email}', controller='edmodo', action='login')
    map.connect('/login/edmodo', controller='edmodo', action='login', email=None)
    map.connect('/create/edmodo', controller='edmodo', action='create')
    map.connect('/test/login/member/edmodo', controller='edmodo', action='test')
    #
    #  LTI Authentication.
    #
    map.connect('/register/lti/{provider}/application/{site}/{appName}', controller='lti', action='registerApplication', requirements={'provider': 'canvas|schoology|itslearning|classlink|haikulearning|safarimontage|moodle|corelearningexchange'})
    map.connect('/register/lti/{provider}/application/{appName}', controller='lti', action='registerApplication', requirements={'provider': 'canvas|schoology|itslearning|classlink|haikulearning|safarimontage|moodle|corelearningexchange'})
    map.connect('/get/applications', controller='lti', action='getApplications')
    map.connect('/launch/lti/{appName}/{extra}', controller='lti', action='launch')
    map.connect('/launch/lti/{appName}', controller='lti', action='launch')
    map.connect('/launch/itslearning/{appName}/{extra}', controller='lti', action='launch')
    map.connect('/login/lti/{email}', controller='lti', action='login')
    map.connect('/login/lti', controller='lti', action='login', email=None)
    map.connect('/create/lti', controller='lti', action='create')
    map.connect('/get/info/lti', controller='lti', action='get_launch_info')

    map.connect('/federatedLogin/member', controller='member', action='federatedLogin')
    map.connect('/federatedLogin/memberForm/*returnTo', controller='extAuth', action='loginForm')
    map.connect('/federatedLogin/memberForm', controller='extAuth', action='loginForm')
    map.connect('/signin/*returnTo', controller='extAuth', action='loginForm')
    map.connect('signin', '/signin', controller='extAuth', action='loginForm')
    map.connect('login', '/signin', controller='extAuth', action='loginForm')
    map.connect('/login/member/internal', controller='member', action='loginInternal')
    
    if development:
        map.connect('/login/memberForm', controller='member', action='loginForm')
        map.connect('/login/memberForm/*returnTo', controller='member', action='loginForm')

    map.connect('/login/member', controller='member', action='login')
    map.connect('/logout/member', controller='member', action='logout')
    map.connect('signout','/signout', controller='member', action='logout')
    map.connect('logout','/signout', controller='member', action='logout')
    #map.connect('/verify/email', controller='member', action='verifyEmail')
    #map.connect('/verified/email', controller='member', action='verifiedEmail')

    map.connect('/switch/member/{id}', controller='intAuth', action='switchLogin')
    map.connect('/switch/member', controller='intAuth', action='switchLogin')
    
    # HubSpot calls
    map.connect('/set/hubspot/contact/opt/in', controller='member', action='setHubSpotContactNotification', optout=False)
    map.connect('/set/hubspot/contact/opt/out', controller='member', action='setHubSpotContactNotification', optout=True)
    
    # iContact calls
    map.connect('/get/icontact/company/id', controller='icontact', action='getCompanyID')
    map.connect('/get/icontact/profile/id', controller='icontact', action='getProfileID')
    map.connect('/get/icontact/subscriptions', controller='icontact', action='getSubscription')
    map.connect('/get/icontact/subscription/{id}', controller='icontact', action='getSubscription')
    map.connect('/get/icontact/lists', controller='icontact', action='getList')
    map.connect('/get/icontact/list/{id}', controller='icontact', action='getList')
    map.connect('/get/icontact/contacts', controller='icontact', action='getContact')
    map.connect('/get/icontact/contact/{id}', controller='icontact', action='getContact')
    map.connect('/get/icontact/contact/email/{email}', controller='icontact', action='getContactByEmail')
    map.connect('/create/icontact/subscription', controller='icontact', action='createSubscription')
    map.connect('/update/icontact/subscription/{id}', controller='icontact', action='updateSubscription')
    map.connect('/create/icontact/list', controller='icontact', action='createList')
    map.connect('/update/icontact/list/{id}', controller='icontact', action='updateList')
    map.connect('/create/icontact/contact', controller='icontact', action='createContact')
    map.connect('/update/icontact/contact/{id}', controller='icontact', action='updateContact')
    map.connect('/update/icontact/contact', controller='icontact', action='updateContact', id=None)
    map.connect('/delete/icontact/contact/{id}', controller='icontact', action='deleteContact')
    map.connect('/delete/icontact/contact', controller='icontact', action='deleteContact', id=None)
    map.connect('/test/icontact', controller='icontact', action='test')
    
    #Partner related APIs
    map.connect('/partner/{partnerName}/member/login', controller='partnerServiceManager', action='loginMember')

    #Marketing tool calls i.e.to icontact/hubspot
    map.connect('/set/marketingTool/contact', controller='member', action='setMarketingToolNotification')

    map.connect('/create/member/auth/{type}/{id}', controller='member', action='createMemberAuthType')
    map.connect('/create/member/auth/{id}', controller='member', action='createMemberAuthType')
    map.connect('/create/member/signupForm', controller='member', action='signupForm')
    map.connect('/create/member/signupCompleteForm', controller='member', action='signupCompleteForm')
    map.connect('/signup/student/email', controller='member', action='signupForm', role='student', join='false')
    map.connect('/signup/teacher/email', controller='member', action='signupForm', role='teacher', join='false')
    map.connect('/signup/student', controller='member', action='signupForm', role='student', join='true')
    map.connect('/signup/teacher', controller='member', action='signupForm', role='teacher', join='true')
    map.connect('signup', '/signup', controller='member', action='signupForm', role='student', join='true')
    map.connect('signup_complete', '/signup/complete', controller='member', action='signupCompleteForm')
    map.connect('request_u13_signup', '/request/u13/signup', controller='member', action='underageSignupRequest', conditions=dict(method=['POST']))
    map.connect('signup_u13', '/signup/u13', controller='member', action='signupUnderage')
    map.connect('create_u13', '/create/u13', controller='member', action='createU13', conditionss=dict(method=['POST']))
    map.connect('create_student', '/create/student', controller='member', action='createStudent', conditions=dict(method=['POST']))

    map.connect('underage_signup_complete', '/underage/signup/complete', controller='member', action='underageSignupComplete')
    map.connect('underage_email_verify', '/member/verify', controller='member', action= 'verifyUnderageApproval')
    map.connect('underage_approval_resend', '/underage/approval/resend', controller='member', action='resendUnderageApprovalEmail')
    map.connect('/create/member', controller='member', action='create')
    map.connect('member_underagealreadyexistse', '/member/underageAlreadyExists', controller='member', action='underageAlreadyExists')
    map.connect('member_resendApprovalEmail', '/member/resendApprovalEmail', controller='member', action='resendApprovalEmail')
    map.connect('member_accountAlreadyActivated', '/member/accountAlreadyActivated', controller='member', action='accountAlreadyActivated')
    map.connect('member_underage_signup', '/member/underageSignup', controller='member', action='underageSignup')

    map.connect('profile','/profile', controller='member', action='updateProfileForm')
    map.connect( 'flxweb-settings', '%s/account/settings' % config['web_prefix_url'],_static=True )
    map.connect( 'flxweb-home', '%s/home' % config['web_prefix_url'],_static=True )
    map.connect('/update/member/login/time/{id}', controller='member', action='updateLoginTime')
    map.connect('/update/member/password/{id}', controller='member', action='updatePassword')
    map.connect('/update/member/forget/passwordForm', controller='member', action='forgetPasswordForm')
    map.connect('forgetPassword', '/forgot/password', controller='member', action='forgetPasswordForm')
    map.connect('/update/member/forget/password/{email}', controller='member', action='forgetPassword')
    map.connect('/update/member/forget/password', controller='member', action='forgetPassword')
    map.connect('/update/member/forget/passwordCompleteForm', controller='member', action='forgetPasswordCompleteForm')
    map.connect('/forgot/password/complete', controller='member', action='forgetPasswordCompleteForm')
    map.connect('/update/member/reset/passwordForm', controller='member', action='resetPasswordForm')
    map.connect('/reset/password', controller='member', action='resetPasswordForm')
    map.connect('/update/member/reset/password', controller='member', action='resetPassword')
    map.connect('/update/member/reset/passwordCompleteForm', controller='member', action='resetPasswordCompleteForm')
    map.connect('/reset/password/complete', controller='member', action='resetPasswordCompleteForm')
    map.connect('changePassword','/change/password', controller='member', action='changePasswordForm')
    map.connect('/update/member/change/passwordCompleteForm', controller='member', action='changePasswordCompleteForm')
    map.connect('/change/password/complete', controller='member', action='changePasswordCompleteForm')

    map.connect('/update/member/roles/{id}', controller='member', action='updateMemberRoles')

    map.connect('/update/member/role/{id}/{roleID}', controller='member', action='updateMemberRole')
    map.connect('/update/member/role', controller='member', action='updateMemberRole')
    map.connect('/update/member/profileForm/{id}', controller='member', action='updateProfileForm')
    map.connect('/update/member/profileForm', controller='member', action='updateProfileForm')

    map.connect('/update/member/{id}', controller='member', action='update')
    map.connect('/update/member', controller='member', action='update')

    if development:
        map.connect('/delete/member/{id}', controller='member', action='delete')
    
    map.connect('/is/member/email/{email}/verified', controller='member', action='isMemberVerified')
    map.connect('/is/member/verified', controller='member', action='isMemberVerified')

    map.connect('/activate/member/{id}', controller='member', action='activate')
    map.connect('/activate/member', controller='member', action='activate')
    map.connect('/deactivate/member/{id}', controller='member', action='deactivate')
    map.connect('/deactivate/member', controller='member', action='deactivate')
    map.connect('/disable/member/{id}', controller='member', action='disable')
    map.connect('/disable/member', controller='member', action='disable')

    map.connect('/validate/member/email/{email}', controller='member', action='validate')
    map.connect('/validate/member/email', controller='member', action='validate')
    map.connect('/ajax/validate/member/login/{login}', controller='member', action='validateUsername')
    map.connect('/ajax/validate/member/login', controller='member', action='validateUsername')
    map.connect('/validate/member/login/{login}', controller='member', action='validate')
    map.connect('/validate/member/login', controller='member', action='validate')
    map.connect('/validate/member/firstName/{firstName}', controller='member', action='validate')
    map.connect('/validate/member/firstName', controller='member', action='validate')
    map.connect('/validate/member/lastName/{lastName}', controller='member', action='validate')
    map.connect('/validate/member/lastName', controller='member', action='validate')
    map.connect('/validate/member/birthday/{birthday}', controller='member', action='validate')
    map.connect('/validate/member/birthday', controller='member', action='validate')

    map.connect('/get/detail/my', controller='member', action='getDetail')
    map.connect('/get/info/my', controller='member', action='getInfo')

    # user timezone
    map.connect('/get/member/timezone', controller='member', action='getMemberTimezone')
    map.connect('/set/member/timezone', controller='member', action='setMemberTimezone')
    
    # user email/username
    map.connect('/update/my/login', controller='member', action='update_member_login')
    map.connect('/remove/my/social_account', controller='member', action='remove_member_account')
    
    map.connect('/get/member/roles', controller='member', action='getMemberRoles')
    map.connect('/get/member/{id}', controller='member', action='get')
    map.connect('/get/member', controller='member', action='get')
    map.connect('/get/members', controller='member', action='get')
    map.connect('/get/members/csv', controller='member', action='getmembersforExport')
    map.connect('/remove/download/{filename}', controller='download', action='download_and_remove')
    map.connect('/invite', controller='member', action='invite')
    map.connect('/member/image/{id}', controller='member', action='profileImage')
    map.connect('/member/image/{id}/{size}', controller='member', action='profileImage')

    map.connect('/get/info/countries', controller='location', action='getCountries')
    map.connect('/get/info/states', controller='location', action='getStates')
    map.connect('/get/info/timezones', controller='location', action='getTimezones')
    #
    #  Invalidate cache.
    #
    map.connect('/invalidate/globals/{name}', controller='cache', action='invalidateGlobals')
    
    if not hideInternal:
        #
        #  Member related.
        #
        map.connect('/update/memberForm/{id}', controller='member', action='updateForm')
        #
        #  Upload student related.
        #
        map.connect('/upload/studentsForm', controller='upload', action='uploadStudentsForm')

    map.connect('/upload/students', controller='students', action='uploadStudents', conditions=dict(method=['POST']))
    map.connect('/upload/students/{school}/{code}/{grade}', controller='students', action='uploadStudents', conditions=dict(method=['POST']))

    #Profile Related
    map.connect('/set/member/grades', controller='member', action='setMemberGrades')
    map.connect('profileimage', '/save/profile/image', controller='member', action='createProfileImage')

    map.connect('/upload/students/{prefix}', controller='upload', action='uploadStudents')
    map.connect('/upload/students', controller='upload', action='uploadStudents')

    map.connect('/js/settings/', controller='javascript', action='settings')

    map.connect('/{controller}/{action}')
    map.connect('/{controller}/{action}/{id}')

    map.connect('/check/emailUsed', controller='member', action='checkEmailUsed')
    map.connect('/check/loginUsed', controller='member', action='checkLoginUsed')

    map.connect('/get/zip/code/{zip}', controller='address', action='getZipCodeInfo')
    map.connect('/get/zip/codes/{state}/{city}', controller='address', action='getZipCodeInfo')
    map.connect('/search/school/{search_term}', controller='member', action='searchUSSchools')

    # Trace
    map.connect('/get/admin/trace/of/{memberID}', controller='member', action='getMemberTraces')
    map.connect('/get/admin/trace/by/{adminID}', controller='member', action='getMemberTraces')
    map.connect('/get/admin/trace/{adminID}/{memberID}', controller='member', action='getMemberTraces')
    map.connect('/get/admin/traces', controller='member', action='getMemberTraces')

    return map
