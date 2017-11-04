define([
    'jquery',
    'underscore',
    'backbone',
    'library/views/library.item',
    'practiceapp/templates/templates'
], function($, _, Backbone, LibraryItemView, TMPL){
    'use strict';
    var LTILibraryRowView = LibraryItemView.extend({
        initialize: function(options){
            LibraryItemView.prototype.initialize.apply(this, arguments);
            this.itemTemplate = _.template(TMPL.LIBRARY_ROW, null, {'variable':'data'});
            console.log(this.itemTemplate);
        }
    });
    return LTILibraryRowView;
});