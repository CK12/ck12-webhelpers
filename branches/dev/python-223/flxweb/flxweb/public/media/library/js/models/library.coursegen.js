define([
    'jquery',
    'underscore',
    'backbone',
    'library/services/ck12.library'
], function($, _, Backbone, LibraryService){
    "use strict";
    var CoursegenModel = Backbone.Collection.extend({
        initialize: function() {
        	
        },
        fetchSubjects: function() {
        	var self = this;
        	return LibraryService.fetchSubjects()
	            .done(function(data) {
	            	self.subjectsFetchSuccess(data);
	            })
	            .fail(function(err) {
	            	self.subjectsFetchError(err);
	            });
        },
        subjectsFetchSuccess: function(data) {
        	this.trigger('subjectsFetchSuccess', data);
        },
        subjectsFetchError: function(err) {
        	
        },
        fetchStandardboards: function(options) {
        	var self = this;
        	return LibraryService.fetchStandardboards(options)
	            .done(function(data) {
	            	self.standardboardsFetchSuccess(data);
	            })
	            .fail(function(err) {
	            	self.standardboardsFetchError(err);
	            });
        },
        standardboardsFetchSuccess: function(data) {
        	this.trigger('standardboardsFetchSuccess', data);
        },
        standardboardsFetchError: function(err) {
        	
        },
        fetchGrades: function(options) {
        	var self = this;
        	return LibraryService.fetchGrades(options)
	            .done(function(data) {
	            	self.gradesFetchSuccess(data);
	            })
	            .fail(function(err) {
	            	self.gradesFetchError(err);
	            });
        },
        gradesFetchSuccess: function(data) {
        	this.trigger('gradesFetchSuccess', data);
        },
        gradesFetchError: function(data) {
        	
        },
        getChaptersByStandards: function(options, params, include_raw_response) {
        	var self = this, _d = $.Deferred();
        	LibraryService.getChaptersByStandards(options, params, include_raw_response)
	            .done(function(data, raw_response) {
	            	_d.resolve(data, raw_response);
	            })
	            .fail(function(err) {
	            	_d.reject(err);
	            });
        	return _d.promise();
        },
        chaptersFetchSuccess: function(data) {
        	this.trigger('chaptersFetchSuccess', data);
        },
        chaptersFetchError: function(err) {
        	
        },
        assembleBook: function (options) {
        	var self = this;
        	return LibraryService.assembleBook(options)
	            .done(function(data) {
	            	self.assembleBookSuccess(data);
	            })
	            .fail(function(err) {
	            	self.assembleBookError(err);
	            });
        },
        assembleBookSuccess: function(data) {
        	this.trigger('assembleBookSuccess', data);
        },
        assembleBookError: function(err) {
        	this.trigger('assembleBookError', err);
        },
        getRevisions: function (self) {
            var revision, revisions_list = [];
            if (self['revisions']) {
            	for (revision = 0; revision < self['revisions'].length; revision++) {
            		revisions_list.push(self['revisions'][revision]);
            	}
            	return revisions_list
            }
        },
        getRevision: function (self) {
        	var current_revision, revision, revisions;
        	current_revision = this.getVersionNumber(self);
        	revisions = this.getRevisions(self);
            if (current_revision > 0 && revisions.length) {
            	for (revision in revisions)
                    if (revisions[revision]['revision'] == current_revision)
                        return revisions[revision];
            } else {
            	return null;
            }
        },
        getVersionNumber: function (self) {
            var version;
            version = self['revision'];
            if (!version && this.getRevisions(self)) {
            	version = this.getRevisions(self)[0]['revision'];
            }
            return version;
        },
        getRevisionID: function (self) {
        	var artifactRevisionID, revision;
        	artifactRevisionID = self['artifactRevisionID'];
        	if (!artifactRevisionID) {
        		revision = this.getRevision(self);
        		if (revision) {
        			 artifactRevisionID = revision['artifactRevisionID'];
        		}
        	}
        	return artifactRevisionID;
        }
    });
    return CoursegenModel;
});