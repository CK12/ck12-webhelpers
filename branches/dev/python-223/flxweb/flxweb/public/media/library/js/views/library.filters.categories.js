define([
    'jquery',
    'backbone',
    'underscore',
    'library/templates/library.templates',
    'library/views/library.category'
], function( $, Backbone, _, TMPL, CategoryView ){
    'use strict';
    var CategoriesFilter = Backbone.View.extend({
        categoryViews : [],
        selectedCategories : [],
        events: {
            'click .filter-clear-wrap' : 'clearFilters',
            'click #moreLink' : 'expandFilter'
        },
        initialize: function(){
            _.bindAll(this, "renderCategories", "cleanup", "categorySelected",
                "categoryDeselected", "selectCategories", "clearFilters");
            this.model.on("reset", this.renderCategories);
        },
        render: function(){
            console.log("!!!");
            this.$el.html( CategoriesFilter.template() );
            this.renderCategories();
            return this;
        },
        cleanup: function(){
            var v;
            for (var i = 0, l = this.categoryViews.length; i<l; i++){
                v = this.categoryViews[i];
                v.remove();
            }
        },
        renderCategories: function(){
            var that = this;
            this.cleanup();
            this.model.each(function(item){
                var categoryView = new CategoryView({
                        model: item 
                    }),
                    selected = _(that.selectedCategories).contains(item.get('alias'));
                categoryView.on('select', that.categorySelected);
                categoryView.on('deselect', that.categoryDeselected);
                that.$("#category-list-container").append( categoryView.render().$el );
                that.categoryViews.push(categoryView);
                categoryView.setSelectionState(selected);
                if (selected){
                    that.$el.find(".filter-clear-wrap").removeClass('hide');
                }
            });
        },
        categorySelected: function(category){
            this.selectedCategories.push(category.get('alias'));
            this.triggerSelectionChange();
        },
        categoryDeselected: function(category){
            var alias = category.get('alias');
            this.selectedCategories = _.without(this.selectedCategories, alias);
            this.triggerSelectionChange();
        },
        triggerSelectionChange: function(){
            this.trigger('selectionChange', { categories: this.selectedCategories });
        },
        selectCategories: function(categories){
            var v, m, selected, that=this;
            categories = categories?categories.split(','):[];
            this.selectedCategories = categories;
            for (var i = 0, l = this.categoryViews.length; i<l; i++){
                v = this.categoryViews[i];
                m = v.model;
                selected = ( _(categories).contains(m.get('alias')) );
                v.setSelectionState(selected);
                if (selected){
                    that.$el.find(".filter-clear-wrap").removeClass('hide');
                }
            }
        },
        clearFilters: function(){
            this.$el.find(".filter-clear-wrap").addClass('hide');
            for (var i = 0, l = this.categoryViews.length; i<l; i++){
                this.categoryViews[i].setSelectionState(false);
            }
            this.selectedCategories = [];
            this.triggerSelectionChange();
        },
        expandFilter: function(e) {
            $('#category-list-container').addClass('expand-filter');
            $(e.currentTarget).parent().addClass('hide');
        }
    }, {
        template: TMPL.CATEGORIES
    });
    return CategoriesFilter;
});
