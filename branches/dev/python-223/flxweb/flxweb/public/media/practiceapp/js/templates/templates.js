define([
    'text!practiceapp/templates/splashscreen.html',
    'text!practiceapp/templates/student.home.html',
    'text!practiceapp/templates/teacher.home.html',
    'text!practiceapp/templates/practice.home.html',
    'text!practiceapp/templates/teacher.firstlaunch.html',
    'text!practiceapp/templates/subject.row.html',
    'text!practiceapp/templates/concept.tracks.row.html',
    'text!practiceapp/templates/concept.tracks.row.app.html',
    'text!practiceapp/templates/concept.row.html',
    'text!practiceapp/templates/concept.row.score.html',
    'text!practiceapp/templates/student.assignment.list.html',
    'text!practiceapp/templates/coversheet.container.html',
    'text!practiceapp/templates/group.list.html',
    'text!practiceapp/templates/selected.groups.due.date.html',
    'text!practiceapp/templates/quiz.row.html',
    'text!practiceapp/templates/adaptive.modal.html',
    'text!practiceapp/templates/library.item.html',
    'text!practiceapp/templates/library.header.html',
    'text!practiceapp/templates/library.external.modal.html',
    'text!practiceapp/templates/assign.concept.pop-up.html',
    'text!practiceapp/templates/lti.library.item.html',
    'text!practiceapp/templates/lti.teacher.home.html',
    'text!practiceapp/templates/lti.library.header.html',
    'text!practiceapp/templates/error.page.html'
],
function(ST, SHT, THT, PHT, TFL, SRT, CTRT, CTRTA, CRT, CRST, SALT, CSCTR, GLT, SGDD, QRT, AMT, LI, LH, LEM, ACP, LLI, LTH, LLH,ERR){
    /**
     * A collection of all templates used in Practice App 
     */
    return {
        'SPLASH_SCREEN': ST,
        'STUDENT_HOME': SHT,
        'TEACHER_HOME': THT,
        'PRACTICE_HOME': PHT,
        'TEACHER_FIRST_LAUNCH': TFL,
        'SUBJECT_ROW': SRT,
        'CONCEPT_TRACKS_ROW': CTRT,
        'CONCEPT_TRACKS_ROW_APP' : CTRTA,
        'CONCEPT_ROW': CRT,
        'CONCEPT_ROW_SCORE' : CRST,
        'STUDENT_ASSIGNMENT_LIST': SALT,
        'COVERSHEET_CONTAINER': CSCTR,
        'GROUP_LIST': GLT,
        'SELECTED_GROUPS_DUE_DATE': SGDD,
        'QUIZ_ROW' : QRT,
        'ADAPTIVE_MODAL' : AMT,
        'LIBRARY_ITEM': LI,
        'LIBRARY_HEADER': LH,
        'LIBRARY_EXTERNAL_MODAL': LEM,
        'ASSIGN_POPUP': ACP,
        'LTI_LIBRARY_ITEM': LLI,
        'LTI_TEACHER_HOME': LTH,
        'LTI_LIBRARY_HEADER': LLH,
        'ERROR_PAGE':ERR
    };
});
