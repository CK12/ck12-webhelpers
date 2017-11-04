define([
    'underscore',
    'backbone',
    'marionette',
    'schools/templates/templates',
    'schools/views/book.list',
    'common/utils/utils',
    'schools/services/schoolsADS'
], function(_, Backbone, Mn, TMPL, BookListView, utils, schoolsADS){
    'use strict';
    var SchoolView = Mn.LayoutView.extend({
        modelEvents: {
            'change:editMode': 'render',
            'change:books':'render',
            'change:schoolName':'render',
            'change:updateError' :'render'
        },
        template: _.template(TMPL.SCHOOL),
        triggers: {
            'click .school_title' : 'schoolClick',
            'click .school_link' : 'schoolClick',
            'click .school-breadcrumbs a' : 'stateBreadcrumbClick'

        },
        events:{
            'click .done-edit-you-school' : 'doneSchoolPageChanges',
            'click .add-flex-book-save'   : 'saveABook',
            'click .add-flex-book-cancel': 'clearAddABook',
            'mousedown #add-flex-book-url-field' : 'startAddingFlexbook'
        },
        regions: {
            'bookList':'.bookListMain'
        },
        initialize: function(){
            _.bindAll(this, 'hasBooks','hideTitle');
            this.totalBooks = this.model.get('books').length;
        },
        hasBooks : function(){
            return ( this.totalBooks > 0);
        },
        onRender: function(){
            if (this.hasBooks()){
                this.bookListView = new BookListView({
                    collection: this.model.get('books'),
                    editMode: this.model.get('editMode')
                });
                this.getRegion('bookList').show(this.bookListView);
            }
            if(this.options.detailView){
                this.hideTitle();
                this.showBreadcrumb()    
            };
        },
        templateHelpers: function(){
            var _this = this;
            return {
                hasBooks : _this.hasBooks,
                totalBooks : _this.totalBooks,
                schoolName: utils.toTitleCase(_this.model.get('schoolName'))
            };
        },
        hideTitle: function(){
            this.$('.school_title').addClass('hide');
        },
        showBreadcrumb: function(){
            this.$(".school-breadcrumbs").removeClass('hide');
        },
        doneSchoolPageChanges: function (e) {
            this.model.toggleEditMode()
        },
        saveABook : function () {
            this.model.saveABook(this.$('#add-flex-book-url-field')[0].value,this.model.get('schoolName'), this.model.get('schoolID'))
        },
        clearAddABook : function (e) {
            if(this.$('#add-flex-book-url-field')[0].value && this.$('#add-flex-book-url-field')[0].value.length>0){
                schoolsADS.logADS('claim_school_add_book_cancel',this.model.get('schoolName'), this.model.get('schoolID'));
            }
            this.$('#add-flex-book-url-field')[0].value  = '';
        },
        startAddingFlexbook : function(){
            schoolsADS.logADS('claim_school_add_book_start',this.model.get('schoolName'), this.model.get('schoolID'));
        }

    });
    return SchoolView;
});
