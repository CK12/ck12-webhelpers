define([
    'underscore',
    'marionette',
    'schools/views/book'
], function(_, Mn, BookView){
    'use strict';
    var BookList = Mn.CollectionView.extend({
        childView: BookView,

        initialize: function (options) {
            this.editMode = options.editMode
        },
        onChildviewBookLinkClick: function(e){
            this.triggerMethod('booklist:bookLinkClick',e);
        },
        childViewOptions: function(model, index){
            return {
                index: index,
                editMode: this.editMode
            }
        }
    });
    return BookList;
});