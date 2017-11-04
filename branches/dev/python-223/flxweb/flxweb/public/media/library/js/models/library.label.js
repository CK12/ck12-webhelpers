// library.label.js
define([
    'jquery',
    'underscore',
    'backbone',
    'library/services/ck12.library',
], function($, _, Backbone, LibraryService){
    'use strict';
    var LibraryLabelModel = Backbone.Model.extend({
        deleteLabel: function(options, cid) {
            var self = this;
            return LibraryService.deleteLabel(options)
                .done(function() {
                    self.deleteLabelSuccess(cid);
                })
                .fail(this.deleteLabelError);
        },

        deleteLabelSuccess: function(cid) {
            this.trigger('delete', cid);
        },

        deleteLabelError: function() {

        }
    });
    return LibraryLabelModel;
});