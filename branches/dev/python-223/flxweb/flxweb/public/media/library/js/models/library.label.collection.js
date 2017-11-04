define([
    'jquery',
    'underscore',
    'backbone',
    'library/models/library.label',
    'common/views/modal.view',
    'library/services/ck12.library',
], function($, _, Backbone, LibraryLabelModel, ModalView, LibraryService){
    'use strict';

    var LibraryLabelCollection = Backbone.Collection.extend({
        model: LibraryLabelModel,
        createLabel: function(options) {
            return LibraryService.createLabel(options)
	            .done(function() {
	                //self.createLabelSuccess(data);
	            })
	            .fail(this.createLabelError);
        },
        createLabelSuccess: function(data) {
        	this.add(data.label);
        },
        createLabelError: function() {
        	
        },
        
        applyLabels: function(options) {
            return LibraryService.applyLabels(options)
                .done(function() {
                    //self.applyLabelsSuccess(data);
                })
                .fail(this.applyLabelsError);
        },
        
        applyLabelsSuccess: function() {
        	ModalView.alert('label applied');
        },
        
        applyLabelsError: function() {
        	
        }
    });

    return LibraryLabelCollection;
});