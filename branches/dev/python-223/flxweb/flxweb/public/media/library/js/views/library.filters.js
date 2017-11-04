define([
    'jquery',
    'backbone',
    'underscore',
    'library/templates/library.templates',
    'library/views/library.filters.categories',
    'library/views/library.filters.folders',
    'library/views/library.filters.ownership'
], 
function($, Backbone, _, TMPL, CategoriesFilter, FoldersFilter, OwnershipFilter){
    'use strict';
    
    var FiltersView = Backbone.View.extend({
        
        viewMode: "",
        desktopContainer: null,
        mobileContainer: null,
        
        filtersContainer: null,
        filtersContainerMobile: null,
        
        categoriesContainerID: "#library_categories_container",
        categoriesFilter: null,
        
        folderContainerID: "#library_folders_container",
        foldersFilter: null,
        
        ownershipContainerID: "#library_ownership_container",
        ownershipFilter: null,
        
        $filtersMain: null,
        pendingFilters: {},
        
        events: {
            'click.files .js_filter_files': 'onFilterFiles',
            'click.expand .js-expandable-filter': 'expandFilters',
            'change.filter input': 'checkForInput'
        },
        
        initialize: function(options){
            
            _.bindAll(this, "render", "switchView", "onSelectLabel",
                "onFilterFiles","onOwnershipChange","onCategoryChange", "onRevisionStateFilterChange");
            
            if (options.desktopContainer){
                this.$desktopContainer = options.desktopContainer;
            } else {
                throw "No filters container specified for desktop view";
            }
            
            if (options.mobileContainer){
                this.$mobileContainer = options.mobileContainer;
            } else {
                throw "No filters container specified for mobile view";
            }
            
            if (options.ownershipContainer){
                this.$ownershipContainer = options.ownershipContainer;
            }
            
            this.$filtersMain = $(FiltersView.template);
            this.switchView();
            
            this.categoriesFilter = new CategoriesFilter({
                el: this.$filtersMain.find(this.categoriesContainerID),
                model: this.model.categories
            });
            this.categoriesFilter.on("selectionChange", this.onCategoryChange);
            
            this.foldersFilter = new FoldersFilter({
                el: this.$filtersMain.find(this.folderContainerID),
                model: this.model.labels
            });
            this.foldersFilter.on("selectLabel", this.onSelectLabel);
            
            this.ownershipFilter = new OwnershipFilter({
                el: this.$filtersMain.find(this.ownershipContainerID)
            });
            this.ownershipFilter.on("ownershipChange", this.onOwnershipChange);
            this.ownershipFilter.on("revisionStateFilterChange", this.onRevisionStateFilterChange);

            $(window).off("resize.switchFiltersView").on("resize.switchFilersView", this.switchView);
        },
        changeMode: function(mode, modeContainer){
            var modeChanged = false;
            if(this.viewMode !== mode){ // no need to reset element if it's already the same view
                this.viewMode = mode;
                this.setElement(modeContainer);
                modeChanged = true;
            }
            if (modeChanged){
                this.$filtersMain.appendTo( this.$(".filter-container") );
            }
        },
        switchView: function(){
            if ( this.$desktopContainer.is(":visible") || $(window).width() >= 768){
                console.log("DESKTOP MODE");
                this.changeMode("desktop", this.$desktopContainer);
            } else {
                console.log("MOBILE MODE");
                this.changeMode("mobile", this.$mobileContainer);
            }
        },
        render: function(){
            console.log("Rendering filters");
            this.categoriesFilter.render();
            this.foldersFilter.render();
            this.ownershipFilter.render();
            return this;
        },
        onSelectLabel: function(e){
            if (this.viewMode === "desktop"){
            this.trigger("selectLabel", e);
            } else {
                this.updatePendingFiltes(e);
            }
            
        },
        onFilterFiles: function(){
            this.$el.find('#filter_files').addClass('selected');
            this.trigger("filterFiles");
        },
        onOwnershipChange: function(e){
            if (this.viewMode === "desktop"){
            this.trigger("filterOwnership", e);
            } else {
                this.trigger("mobileFilterOwnership", e);
                this.updatePendingFiltes(e);
            }
        },
        expandFilters: function(event) {
            var $target = $(event.target),
                $filter = $target.closest('.js-expandable-filter');
            if($target.closest('.filter-clear-wrap').length) {
                return false;
            }
            $filter.toggleClass('expanded').next().toggleClass('hide');
            if($filter.parent().find('input:checked').length) {
                $filter.find('.filter-clear-wrap').toggleClass('hide');
            }
        },
        checkForInput: function(event) {
            var $filterContainer = $(event.currentTarget).parents('.categories-filter-container');
            if($filterContainer.find('input:checked').length) {
                $filterContainer.find('.filter-clear-wrap').removeClass('hide');
            } else {
                $filterContainer.find('.filter-clear-wrap').addClass('hide');
            }
        },
        onCategoryChange: function(e){
            if (this.viewMode === "desktop"){
                this.trigger('categoryChange', e);    
            } else {
                this.updatePendingFiltes(e);
            }
            
        },
        setFilterState: function(state){
            this.categoriesFilter.selectCategories(state.categories);
            this.ownershipFilter.setOwnership(state.ownership, state.includeRevisionsInState);
            this.foldersFilter.setFolder(state.label);
        },

        updatePendingFiltes : function(filters){
            $.extend( this.pendingFilters, filters );
        },

        clearPendingFilters: function(){
            this.pendingFilters = {};
        },
        onRevisionStateFilterChange: function(e){
//            if (this.viewMode === "desktop"){
            this.trigger("revisionStateFilter", e);
//            } else {
//                this.updatePendingFiltes(e);
//            }
        }

    }, {
        template: TMPL.FILTERS
    });
    return FiltersView;
});
