define([
    'jquery',
    'backbone',
    'underscore',
    'library/models/library.label.collection',
    'library/models/library.item',
    'library/models/library.item.collection',
    'library/models/library.category.collection',
    'library/services/ck12.library',
    'common/utils/user'
], function($, Backbone, _, LibraryLabelCollection, LibraryItem, LibraryItemCollection, LibraryCategoryCollection, LibraryService, User) {
    'use strict';
    //TODO: MOVE MODELS UNDER library/js/models. One file per model
    var LibraryModel = Backbone.Model.extend({
        items: null,
        labels: null,
        categories: null,
        shownFilters: null,

        pageNum: 1,
        pageSize: 10,

        artifactTypes: null,
        sort: "updateTime,desc",
        activeLabel: null,

        initialize: function(options) {
            if (options.excludeBooks){
                this.excludeBooks = true;
            }
	    if (options.shownFilters){
            this.shownFilters = options.shownFilters;
	    }
            _.bindAll(this, "itemFetchSuccess", "itemFetchError", "labelFetchSuccess",
                "labelFetchError", "categoryFetchSuccess", "categoryFetchError",
                "fetchLabels");
            this.items = new LibraryItemCollection();
            this.labels = new LibraryLabelCollection();
            this.categories = new LibraryCategoryCollection();
            this.currentUserInfo = new User().fetch();
        },

        fetchLabels: function() {
            return LibraryService.fetchLabels()
                .done(this.labelFetchSuccess)
                .fail(this.labelFetchError);
        },

        labelFetchSuccess: function(data) {
            this.labels.reset(data);
        },

        labelFetchError: function(err) {
            this.trigger('labelFetchError', err);
        },

        fetchItems: function(options) {
            var categories = options.categories,
                artifactTypes;
            if (!categories){
                artifactTypes = this.categories.getAllArtifactTypes();
            } else {
                artifactTypes = this.categories.getArtifactTypesForAliases(categories);
            }
            options.artifact_types = artifactTypes;
            return LibraryService.fetchItems(options)
                .done(this.itemFetchSuccess)
                .fail(this.itemFetchError);
        },

        itemFetchSuccess: function(data) {
            var self = this;
            this.currentUserInfo.done(function(userData){
                var processed_items = [];
                for (var i=0, l= data.items.length; i<l; i++){
                    var item = data.items[i];
                    item.currentUser = userData;
                    processed_items.push( LibraryItem.fromJSON( item  ) );
                }
                self.items.archived = data.archived;
                self.items.reset(processed_items);
                self.trigger("pageChange", {
                    currentPage: data.currentPage,
                    totalPages: data.totalPages
                });
            });
        },

        itemFetchError: function(err) {
            this.trigger('itemFetchError', err);
        },

        fetchCategories: function() {
            console.log("shown filters",this.shownFilters);
            return LibraryService.fetchCategories({excludeBooks: this.excludeBooks, shownFilters: this.shownFilters})
                .done(this.categoryFetchSuccess)
                .fail(this.categoryFetchError);
        },

        categoryFetchSuccess: function(data) {
            this.categories.reset(data);
        },

        categoryFetchError: function(err) {
            this.trigger('categoryFetchError', err);
        }
    });

    return LibraryModel;
});
