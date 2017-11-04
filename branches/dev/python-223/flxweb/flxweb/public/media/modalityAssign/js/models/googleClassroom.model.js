define([
    'jquery',
    'underscore',
    'backbone',
    'modalityAssign/services/google.classroom.services',
    'common/views/modal.view'
], function($, _, Backbone, GoogleClassroomService, ModalView){
    "use strict";

    var GoogleClassroomModel = Backbone.Model.extend({
        initialize: function() {
           _.bindAll(this);	
        },
        defaults: function() {
            return {
              selectAll: false,
              pageNum: 1,
              pageSize: 10
           }
        },
        gClassroomAuthStatus: function(){
        	var self = this;
            return GoogleClassroomService.googleClassroomAuthStatus()
                .done(function(data) {
                    self.gClassroomAuthStatusSuccess(data);
                })
                .fail(this.gClassroomAuthStatusError);
        },
        gClassroomAuthStatusSuccess: function(data) {
        	if (data.response.googleClassroomAuthenticated) {
        		this.trigger('authSuccess');
        	} else {
        		this.trigger('authFail');
        	}
        },
        gClassroomAuthStatusError: function() {
	    console.log("Classroom auth status error!!");
        },
        getGoogleAuthURL: function() {
        	var self = this;
            return GoogleClassroomService.getGoogleAuthURL()
                .done(function(data) {
                    self.getGoogleAuthURLSuccess(data);
                })
                .fail(function(data){
                    self.getGoogleAuthURLError(data);
                });
        },
        getGoogleAuthURLSuccess: function(data) {
    		this.trigger('authURLSuccess', data);
        },
        getGoogleAuthURLError: function(error) {
            this.trigger('authURLError', error);
        },
        loadGoogleClassroomCourses: function(options) {
        	var self = this;
            return GoogleClassroomService.loadGoogleClassroomCourses(options)
                .done(function(data) {
                    self.loadCoursesSuccess(data);
                })
                .fail(this.loadCoursesError);
        },
        loadCoursesSuccess: function(data) {
            var processed_items = [], list, i;
            //this.reset(processed_items);
	    this.trigger('loadCoursesSuccess', data);
        },
        loadCoursesError: function(data) {
        	if (!data.response.message) {
        	    ModalView.alert('load fail');
        	}
        },
        assignAssignment: function(options) {
	    var self = this;
        var lmsGroupName = options.lmsGroupName;
            return GoogleClassroomService.assignAssignment(options)
                .done(function(data) {
                    data['lmsGroupName'] = lmsGroupName;
                    self.assignAssignmentSuccess(data);
                })
                .fail(function(data){
                    self.assignAssignmentError(data);
                });
        },
        assignAssignmentSuccess: function(data) {
            console.log("[assignAssignmentSuccess]: data" + data);
            this.trigger('courseAssignSuccess', data);
        },
        assignAssignmentError: function(error) {
            console.log("[assignAssignmentError]: error" + error);	
            this.trigger('courseAssignFailure', error);
        },
        fetchArtifact: function(options) {
        	return LibraryService.fetchArtifact(options);
        }
    });
    return GoogleClassroomModel;
});
