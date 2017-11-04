define([
    'practiceapp/views/splashscreen',
    'practiceapp/views/teacher.home',
    'practiceapp/views/student.home',
    'practiceapp/views/practice.view',
    'practiceapp/views/teacher.firstlaunch',
    'practiceapp/views/concept.coversheet',
    'practiceapp/views/lti.teacher.home',
    'practiceapp/views/errorpage',
    'practiceapp/views/lti.resource.selection.modal',
    'athenaapp/views/play'
],
function(SplashScreenView, TeacherHomeView, StudentHomeView, PracticeView,
        TeacherFirstLaunchView, ConceptCoverSheetView, LTITeacherHomeView,ErrorPageView,ResourceModalView,PlayView){
    /**
     * A collection of all views used in Practice App. 
     */
    return {
        'SplashScreenView': SplashScreenView,
        'TeacherHomeView': TeacherHomeView,
        'StudentHomeView': StudentHomeView,
        'PracticeView' : PracticeView,
        'TeacherFirstLaunchView': TeacherFirstLaunchView,
        'ConceptCoverSheetView': ConceptCoverSheetView,
        'LTITeacherHomeView': LTITeacherHomeView,
        'ErrorPageView': ErrorPageView,
        'ResourceModalView' : ResourceModalView,
        'PlayView': PlayView
    };
});
