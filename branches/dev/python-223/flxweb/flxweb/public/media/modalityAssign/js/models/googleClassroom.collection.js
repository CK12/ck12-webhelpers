define([
    'jquery',
    'underscore',
    'backbone',
    'modalityAssign/models/googleClassroom.course.info.model'
], function($, _, Backbone, GoogleCourseInfoModel){
    'use strict';
    
    var GoogleGroupInfoCollection = Backbone.Collection.extend({
        model: GoogleCourseInfoModel,
    });

    return GoogleGroupInfoCollection;
});
