define([
    'underscore',
    'text!modalityAssign/templates/modal.info.html',
    'text!modalityAssign/templates/group.info.html',
    'text!modalityAssign/templates/modal.successInfo.html',
    'text!modalityAssign/templates/google.courses.html',
    'text!modalityAssign/templates/google.course.item.html'
], function (_, modalInfo, groupInfo, successInfo, googleCourse, googleCourseItem) {
    'use strict';
    function _t(tmpl){
        return _.template(tmpl, null, {"variable":"data"});
    }
    return {
        /*'MAIN': _t(main),*/
    	'MODALINFO' : modalInfo,
    	'GROUPINFO' : groupInfo,
    	'SUCCESSINFO' : successInfo,
    	'GOOGLECOURSES' : googleCourse,
    	'GOOGLECOURSEITEM' : googleCourseItem
    };
});
