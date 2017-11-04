define(['jquery'], 
function($){
    var config = {
        'flx_api_path' : '/flx/',
        'auth_api_path': '/auth/'
    };
    
    //lets see if we can move these configurations into app policies
    var configurations = {
        'googleClassroom': $.extend({
            splash_img : 'logo_tagline.svg',
            auth_app_name : '',
            app_name : 'googleClassroom',
            appID : 'GOOGLE_CLASSROOM',
            app_display_name : '',
            lms_provider: '',
            provider_display_name: '',
            provider: "google",
            app_subject_eid : '',
            app_subject_label: '',
            hidden_branches: [],
            auth_launch_url: "",
            embed_url_prefix: "/embed/#module=modality&filters=text%2Cmultimedia%2Cassessment%2Creal_world&view_mode=embed&nochrome=true&app_context=lti&utm_source=viewer&utm_medium=embed&utm_campaign=LTIApp",
	    enabled_new_flow: []
        }, config),
        'edmPracticeMath': $.extend({
            splash_img : 'logo_tagline.svg',
            auth_app_name : 'math',
            app_name : 'edmPracticeMath',
            app_display_name: 'CK-12 Math Practice',
            lms_provider : 'edmodo',
            provider_display_name : "Edmodo",
            app_subject_eid : 'MAT',
            app_subject_label: 'Math',
            hidden_branches : ['ELM']
        }, config),
        'edmPracticeScience': $.extend({
            splash_img : 'logo_tagline.svg',
            auth_app_name : 'science',
            app_name : 'edmPracticeScience',
            app_display_name: 'CK-12 Science Practice',
            lms_provider : 'edmodo',
            provider_display_name : "Edmodo",
            app_subject_eid : 'SCI',
            app_subject_label: 'Science',
            hidden_branches : []
        }, config),
        'athenaScienceResources': $.extend({
            splash_img : 'logo_tagline.svg',
            auth_app_name : 'science',
            app_name : 'athenaScienceResources',
            app_display_name: 'CK-12 SCIENCE RESOURCES',
            lms_provider : null,
            provider_display_name : "Microsoft Athena",
            provider: "athena",
            app_subject_eid : 'SCI',
            app_subject_label: 'Science',
            hidden_branches : []
        }, config),
        'athenaMathResources': $.extend({
            splash_img : 'logo_tagline.svg',
            auth_app_name : 'math',
            app_name : 'athenaMathResources',
            app_display_name: 'CK-12 MATH RESOURCES',
            lms_provider : null,
            provider_display_name : "Microsoft Athena",
            provider : "athena",
            app_subject_eid : 'MAT',
            app_subject_label: 'Math',
            hidden_branches : []
        }, config),
        'androidPracticeApp': $.extend({
            splash_img : 'splash-maths.png',
            auth_app_name : 'ck12',
            app_name : 'androidPracticeApp',
            app_display_name: 'CK-12 Practice',
            lms_provider : null,
            provider_display_name : "Android",
            provider : "android",
            app_subject_eid : 'MAT',
            app_subject_label: 'Math',
            hidden_branches : ['MEA','ALY'],
            //API_SERVER_URL : "http://astro.ck12.org"
            API_SERVER_URL : ""
        }, config),
        'ltiApp': $.extend({
            splash_img : 'logo_tagline.svg',
            auth_app_name : '',
            app_name : 'ltiApp',
            app_display_name : 'CK-12 Practice',
            lms_provider: '',
            provider_display_name: '',
            provider: "lti",
            app_subject_eid : 'MAT,SCI',
            app_subject_label: '',
            hidden_branches: [],
            auth_launch_url: "/auth/launch/lti/ltiApp",
            embed_url_prefix: "/embed/#module=modality&filters=text%2Cmultimedia%2Cassessment%2Creal_world&view_mode=embed&nochrome=true&app_context=lti&utm_source=viewer&utm_medium=embed&utm_campaign=LTIApp",
	    enabled_new_flow: ['schoology']
        }, config)
    };
    
    return {
        getConfig: function (app_name){
            if (configurations[app_name]){
                return configurations[app_name]; 
            } else {
                throw new Error("No configuration defined for app " + app_name);
            }
        }
    };
});
