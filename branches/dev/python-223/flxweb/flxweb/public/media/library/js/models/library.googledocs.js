define([
    'jquery',
    'underscore',
    'backbone',
    'library/services/ck12.library',
    'common/views/modal.view'
], function($, _, Backbone, LibraryService, ModalView){
    "use strict";
    var GoogleDocsModel = Backbone.Collection.extend({
        initialize: function() {
        	
        },
        gdtAuthStatus: function() {
        	var self = this;
            return LibraryService.gdtAuthStatus()
                .done(function(data) {
                    self.gdtAuthStatusSuccess(data);
                })
                .fail(this.gdtAuthStatusError);
        },
        gdtAuthStatusSuccess: function(data) {
        	if (data.response.googleDocAuthenticated) {
        		this.trigger('authSuccess');
        	} else {
        		this.trigger('authFail');
        	}
        },
        gdtAuthStatusError: function() {
        	
        },
        getGoogleAuthURL: function() {
        	var self = this;
            return LibraryService.getGoogleAuthURL()
                .done(function(data) {
                    self.getGoogleAuthURLSuccess(data);
                })
                .fail(this.getGoogleAuthURLError);
        },
        getGoogleAuthURLSuccess: function(data) {
    		this.trigger('authURLSuccess', data);
        },
        getGoogleAuthURLError: function() {
        	
        },
        loadDocList: function(options, docsList) {
        	var self = this;
            return LibraryService.loadDocList(options, docsList)
                .done(function(data) {
                    self.loadDocListSuccess(data, docsList);
                })
                .fail(this.loadDocListError);
        },
        loadDocListSuccess: function(data, docsList) {
        	var processed_items = [], list, i;
        	if (docsList) {
        		list = data.documents;
        	} else {
        		list = data.folders;
        	}
            for (i=0; i<list.length; i++){
                processed_items.push(list[i]);
            }
            this.reset(processed_items);
            this.trigger("pageChange", {
                currentPage: data.currentPage,
                totalPages: data.totalPages
            });
        	//this.trigger('loadDocListSuccess', data);
        },
        loadDocListError: function(data) {
        	if (!data.response.message) {
        	    ModalView.alert('load fail');
        	}
        },
        importGoogleDocs: function(options) {
            return LibraryService.importGoogleDocs(options)
                .done(function() {
                    //self.importGoogleDocsSuccess(data, docsList);
                })
                .fail(this.importGoogleDocsError);
        },
        importGoogleDocsError: function() {
        	
        },
        fetchArtifact: function(options) {
        	return LibraryService.fetchArtifact(options);
        }
    });
    return GoogleDocsModel;
});