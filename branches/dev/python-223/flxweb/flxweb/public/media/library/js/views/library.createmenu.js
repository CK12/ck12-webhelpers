define([
    'jquery',
    'backbone',
    'library/models/library.googledocs',
    'library/views/library.googledocs',
    'library/models/library.worddoc',
    'library/views/library.worddoc',
    'library/models/library.coursegen',
    'library/views/library.coursegen',
    'library/templates/library.templates'
], function($, Backbone, GoogleDocsModel, GoogleDocsView, WordDocsModel, WordDocsView, CoursegenModel, CoursegenView, TMPL){
    'use strict';
    var CreateMenu = Backbone.View.extend({
    	libraryGoogleDocsContainerID: "#google-docs-container",
    	libraryWordDocsContainerID: "#word-docs-container",
    	libraryCoursegenContainerID: "#coursegen-container",
    	events: {
            'click #btn_gdtimport': 'openGoogleDocsModal',
            'click #btn_xdtimport': 'openUploadWordDocsModal',
            'click #curriculum_book': 'openCoursegenModal'
        },
        initialize: function(options){
            options = $.extend({}, options);
        },
        render: function(){
            this.$el.html(CreateMenu.template());
            return this;
        },
        openGoogleDocsModal: function(){
        	var self = this;
        	if(!this.GoogleDocsView) {
        		this.GoogleDocsView = new GoogleDocsView({
            		el: $(self.libraryGoogleDocsContainerID),
                	model: new GoogleDocsModel()
                });
        	} else {
        		this.GoogleDocsView.render();
        	}
        },
        openUploadWordDocsModal: function() {
        	var self = this;
        	if(!this.WordDocsView) {
        		this.WordDocsView = new WordDocsView({
            		el: $(self.libraryWordDocsContainerID),
                	model: new WordDocsModel()
                });
        	} else {
        		this.WordDocsView.render();
        	}
        },
        openCoursegenModal: function() {
        	var self = this;
        	if(!this.CoursegenView) {
        		this.CoursegenView = new CoursegenView({
            		el: $(self.libraryCoursegenContainerID),
                	model: new CoursegenModel()
                });
        	} else {
        		this.CoursegenView.render();
        	}
        }
    }, {
        template: TMPL.CREATE_MENU
    });
    
    return CreateMenu;
});
