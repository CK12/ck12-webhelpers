define([
    'practiceapp/views/splashscreen',
    'practiceapp/views/teacher.home',
    'practiceapp/views/student.home',
    'practiceapp/views/teacher.firstlaunch',
    'practiceapp/views/concept.coversheet',
    'athenaapp/views/edit',
    'athenaapp/views/play'
],
function(SplashScreenView, TeacherHomeView, StudentHomeView, 
        TeacherFirstLaunchView, ConceptCoverSheetView, EditView, PlayView){
    /**
     * A collection of all views used in Practice App. 
     */
    return {
        'SplashScreenView': SplashScreenView,
        'TeacherHomeView': TeacherHomeView,
        'StudentHomeView': StudentHomeView,
        'TeacherFirstLaunchView': TeacherFirstLaunchView,
        'ConceptCoverSheetView': ConceptCoverSheetView,
        'EditView': EditView,
        'PlayView': PlayView
    };
});
