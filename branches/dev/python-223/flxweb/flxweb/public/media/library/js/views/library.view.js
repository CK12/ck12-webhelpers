define([
    'jquery',
    'underscore',
    'backbone',
    'library/templates/library.templates',
    'library/views/library.filters',
    'library/views/library.createmenu',
    'library/views/library.foldermanager',
    'library/views/library.contentsorter',
    'library/views/library.itemslist',
    'library/views/library.paginator',
    'library/models/library.models',
    'common/views/modal.view'
],
function ($, _, Backbone, TMPL, LibraryFilters, CreateMenu, 
    FolderManager, ContentSorter, LibraryItemsList, LibraryPaginator, 
    LibraryModel, ModalView) {
        'use strict';
        var LibraryView;

        LibraryView = Backbone.View.extend({
            
            //view containers
            libraryDesktopFiltersContainerID: "#library-filters-container",
            libraryMobileFiltersContainerID: "#library-mobile-filters-container",
            createMenuContainerID: "#create_new_content_container",
            folderManagerContainerID: "#change_label_container",
            contentSorterContainerID: "#sort_content_container",
            libraryItemsContainerID: "#library-items-list",
            libraryPaginatorContainerID: "#library-paginator",
            
            //Various view classes
            LibraryFiltersClass : LibraryFilters,
            CreateMenuClass: CreateMenu,
            FolderManagerClass: FolderManager,
            ContentSorterClass: ContentSorter,
            LibraryItemsListClass: LibraryItemsList,
            LibraryPaginatorClass: LibraryPaginator,
            LibraryItemViewClass: null,
            LibraryEmptyTemplate: null,
            
            //view instances
            libraryFilters: null,
            createMenu: null,
            folderManager: null,
            contentSorter: null,
            libraryItems: null,
            paginator: null,
            
            //model
            libraryModel : null,

            //view state
            //TODO: this should probably be a model on its own
            state: {
                categories: "",
                label: "",
                pageNum: 1,
                sort: "updateTime,desc",
                ownership: "all",
                itemType: "artifacts",
                archived: false
            },

            stateChangeDelay: 800, //timeout in milliseconds, used when setState is called with delay=true;
            stateChangeTimer:null, //reference variable to clear state change timeout
            
            itemLabelTemplate: TMPL.ITEM_LABEL,
            
            events: {
                'click.showMobileFilters .js-filter-link-container': 'showMobileFiltersView',
                'click.hideMobileFilters .js-back-icon': 'hideMobileFiltersView',
                'click.applyFilters .apply-filters': 'applyFilters',
                'click.bookmarklet .js-close-add-bookmarklet': 'closeBookmarkletBanner',
                'click.bookmarklet #add-bookmarklet-button': 'preventClick',
                'mouseenter.bookmarklet #add-bookmarklet-button': 'showToolTip',
                'mouseleave.bookmarklet #add-bookmarklet-button': 'showToolTip',
                'dragend.bookmarklet #add-bookmarklet-button': 'dropBookmarklet',
                'click.viewArchive .js_view_archived': 'onShowArchivedToggle',
                'click.restore #btn_restore_archived': 'onRestore',
                'click.clearall .js-clear-all': 'onClearAll'
            },
            initialize: function (options) {
                _.bindAll(this, 
                    "render",
                    "onCategoryFetchComplete",
                    "onCategoryFetchError", 
                    "setState",
                    "updatePagination",
                    "pageChange",
                    "labelChange",
                    "onSort",
                    "onShowFiles",
                    "onFilterOwnership",
                    "mobileFilterOwnership",
                    "onFilterCategory",
                    "onShowArchivedToggle",
                    "onArchive",
                    "handleApplyLabels",
                    "applyFilters",
                    "onRevisionStateFilter");
                options = $.extend({}, options);
                
                if (options.excludeBooks){
                    this.excludeBooks = true;
                }
		
		if (options.shownFilters){
		    this.shownFilters = options.shownFilters;
		}

                this.libraryModel = new LibraryModel({
                    excludeBooks : this.excludeBooks,
                    shownFilters : this.shownFilters
                });
                this.libraryModel.fetchCategories()
                    .done(this.onCategoryFetchComplete)
                    .done(this.onCategoryFetchError);
                this.libraryModel.fetchLabels();
                
                this.$el.html(LibraryView.template());
                this.libraryFilters =  new this.LibraryFiltersClass({
                    'desktopContainer': this.$(this.libraryDesktopFiltersContainerID),
                    'mobileContainer': this.$(this.libraryMobileFiltersContainerID),
                    'model': this.libraryModel
                });
                this.createMenu = new this.CreateMenuClass({
                    'el': this.$(this.createMenuContainerID)
                });
                this.folderManager = new this.FolderManagerClass({
                    'el': this.$(this.folderManagerContainerID),
                    'model': this.libraryModel.labels
                });
                this.contentSorter = new this.ContentSorterClass({
                    'el': this.$(this.contentSorterContainerID)
                });
                $(window).off('resize.libraryView').on('resize.libraryView', function () {
                    if ($('.mobile-filters-wrapper').is(':visible') && $(window).width() >= 768) {
                        $('.js-back-icon').trigger('click');
                    }
                });

                this.libraryItems = new this.LibraryItemsListClass({
                    el: this.$(this.libraryItemsContainerID),
                    model: this.libraryModel.items,
                    LibraryItemViewClass: this.LibraryItemViewClass,
                    emptyTemplate: this.LibraryEmptyTemplate
                });

                this.libraryItems.on('archive', this.onArchive);

                this.paginator = new this.LibraryPaginatorClass({
                    el: this.$(this.libraryPaginatorContainerID),
                    model: this.libraryModel
                });

                this.paginator.on('pageChange', this.pageChange);
                this.folderManager.on('applyLabels', this.handleApplyLabels);
                this.libraryFilters.on('selectLabel', this.labelChange);
                this.libraryFilters.on('filterFiles', this.onShowFiles);
                this.libraryFilters.on('filterOwnership', this.onFilterOwnership);
                this.libraryFilters.on('mobileFilterOwnership', this.mobileFilterOwnership);
                this.libraryFilters.on('categoryChange', this.onFilterCategory);
                this.contentSorter.on('sort', this.onSort);
                this.libraryFilters.on('revisionStateFilter', this.onRevisionStateFilter);

                this.bindModelEvents();
                $('.content-wrap').addClass('no-padding');
                if(($.cookie('flxbookmarkletCookie') === 'true')) {
                    $('.add-bookmarklet-container').addClass('hide-important');
                }
                this.addBookmarkletScript();
            },
            getDefaultState: function(){
                return {
                    selectedCategories: [],
                    label: "",
                    pageNum: 1,
                    sort: "updateTime,desc",
                    ownership: "all",
                    itemType: "artifacts",
                    archived: false
                };
            },
            handleApplyLabels: function(labelObj){
            	var self, options = {}, mapping = [], object = {}, i, labelsArray, str, refresh = false, $selectedLabel, selectedLabel;
                self = this;
                $.each($('#library-items-list').find(':checkbox:checked'), function() {
                    object = {
                        'objectID' : parseInt($(this).data('revisionid'), 10),
                        'objectType' : $(this).data('itemtype'),
                        'labels' : labelObj.labels || [],
                        'systemLabels' : labelObj.systemLabels || []
                    };
                    mapping.push(object);
                });
            	$selectedLabel = $('.label-item.selected');
            	if ($selectedLabel.length) {
            	    selectedLabel = $selectedLabel.attr('data-label');
            	    if ($.inArray(selectedLabel, labelObj.labels) === -1 && $.inArray(selectedLabel, labelObj.systemLabels) === -1) {
            	        refresh = true;
            	    }
            	}
                mapping = JSON.stringify(mapping);
                options = {
                    'mappings' : mapping
                };
                this.libraryModel.labels.applyLabels(options).done(function(){
                    str = '';
                    if (labelObj.labels) {
                        for (i = 0; i < labelObj.labels.length; i++) {
                            str += self.itemLabelTemplate({'label': labelObj.labels[i],
                                'systemLabel': 0
                            });
                        }
                    }
                    if (labelObj.systemLabels) {
                        for (i = 0; i < labelObj.systemLabels.length; i++) {
                            str += self.itemLabelTemplate({'label': labelObj.systemLabels[i],
                                'systemLabel': 1
                            });
                        }
                    }
                    $.each($('#library-items-list').find(':checkbox:checked'), function() {
                        $(this).parents('.js-listitem').find('.js_artifact_labels').html(str);
        	        	$(this).trigger('click');
                    });
                    ModalView.alert('Folder changes have been applied to selected items');
                    if (refresh) {
                        window.location.reload();
                    }
                });
            },
            onArchive: function(e){
                var that = this;
                var options = {
                    'mappings' : JSON.stringify([{
                        'objectID' : parseInt(e.revisionid, 10),
                        'objectType' : e.itemtype,
                        'labels' : e.labels,
                        'systemLabels': e.systemLabels
                    }])
                };
                that.libraryModel.labels.applyLabels(options).done(function(){
                    ModalView.alert("Item archived successfully");
                    that.setState(that.getState());
                });
            },
            onRestore: function(){
                var that = this,
                    mappings = [],
                    systemLabels = [],
                    labels = [],
                    object = null,
                    options = {};

                $.each($('#library-items-list').find(':checkbox:checked'), function() {
                    systemLabels = [];
                    labels = [];
                    $(this).parents('.js-listitem').find('.labels').each(function() {
                        if ($(this).attr('data-systemLabel') === '1') {
                            systemLabels.push($(this).attr('data-label'));
                        } else if ($(this).attr('data-label') !== 'archived'){
                            labels.push($(this).attr('data-label'));
                        }
                    });
                    object = {
                        'objectID' : parseInt($(this).data('revisionid'), 10),
                        'objectType' : $(this).data('itemtype'),
                        'labels' : labels,
                        'systemLabels' : systemLabels
                    };
                    mappings.push(object);
                });

                options.mappings = JSON.stringify(mappings);
                if(mappings.length) {
                    that.libraryModel.labels.applyLabels(options).done(function(){
                        ModalView.alert("Items restored.");
                        that.setState(that.getState());
                    });
                } else {
                    ModalView.alert("Please select items to restore.");
                }

            },
            bindModelEvents: function(){
                this.libraryModel.categories.on("change", this.onCategoryChange);
                this.libraryModel.on("pageChange", this.updatePagination);
            },
            render: function(){
                this.libraryFilters.render();
                this.createMenu.render();
                this.folderManager.render();
                this.contentSorter.render();
                this.libraryItems.render();
                this.paginator.render();
                return this;
            },
            hideMobileFiltersView: function () {
                $('body').removeClass('filter-view');
                $('.js-library-main-container').show(500);
                $('.js-mobile-filters-wrapper').removeClass('filters-expanded');
                $('.js-mobile-filters-wrapper').hide();
            },
            addScrollEffect: function () {
                var headerHeight, footerHeight, bodyHeight, windowHeight;
                headerHeight = $('.js-mobile-filters-header').outerHeight();
                footerHeight = $('.js-mobile-clear-all').outerHeight();
                windowHeight = $(window).height();
                bodyHeight = windowHeight - headerHeight - footerHeight;
                $('.js-mobile-filter-container').css({
                    'height': bodyHeight + 'px'
                });
            },
            showMobileFiltersView: function () {
                var self = this;
                $('.js-library-main-container').hide();
                $('.js-mobile-filters-wrapper').show(500);
                $('.js-mobile-filters-wrapper').addClass('filters-expanded');
                $('body').addClass('filter-view');
                self.addScrollEffect();
                $(window).off('resize.scrollEffect').on('resize.scrollEffect', function () {
                    self.addScrollEffect();
                });
            },
            setState: function(state, options){
                var that = this;
                if (!options){
                    options = {};
                }
                //if state change was requested before LibraryView was ready,
                //wait for it to get ready, then set the state again
                if (!that.ready){
                    that.on("ready", function(){
                        that.setState(state, { silent: options.silent, delayed: options.delayed });
                        that.off("ready");
                    });
                } else {
                    if (options.delayed){
                        window.clearTimeout(this.stateChangeTimer);
                        this.stateChangeTimer = window.setTimeout(function(){
                            that.setState(state, { silent: options.silent, delayed: false });
                        }, this.stateChangeDelay);
                    } else {

                        that.libraryModel.fetchItems({
                            categories: state.categories,
                            pageNum: state.pageNum,
                            labels: state.label?[state.label]:null,
                            sort: state.sort,
                            itemType: state.itemType,
                            ownership: state.ownership,
                            archived: state.archived,
                            includeRevisionsInState: state.includeRevisionsInState
                        }).done(function(data){
                            that.trigger('LibraryView.ItemFetchComplete', data);
                        });
                    }
                }
                if (!options.silent && !options.delayed){
                    this.trigger("stateChange", state);
                }
                if (options.updateView){
                    var btn_show_archived = $(".btn_view_archived");
                    //set filter state
                    this.libraryFilters.setFilterState(state);
                    if (state.archived){
                        btn_show_archived
                            .removeClass('dusty-grey')
                            .addClass('tangerine')
                            .text("View Library")
                            .attr('title', 'View Library Items')
                            .data('labeltoggle', "View Archived");
                        this.$el.addClass('state-archived');
                    } else {
                        btn_show_archived
                            .addClass('dusty-grey')
                            .removeClass('tangerine')
                            .text("View Archived")
                            .attr('title', 'View Archived Items')
                            .data('labeltoggle', "View Library");
                        this.$el.removeClass('state-archived');
                    }
                    $.extend(this.state, state);
                }
                if (state.archived) {
                    $('#library_folders_container').addClass('hide');
                    $('#library_folders_container').next().addClass('hide');
                } else {
                    $('#library_folders_container').removeClass('hide');
                    $('#library_folders_container').next().removeClass('hide');
                }
            },
            getState: function(){
                var state = {
                    pageNum : this.state.pageNum,
                    categories : this.state.categories,
                    sort: this.state.sort,
                    label: this.state.label,
                    ownership: this.state.ownership,
                    itemType: this.state.itemType,
                    archived: this.state.archived,
                    includeRevisionsInState: this.state.includeRevisionsInState
                };
                return state;
            },
            onCategoryFetchComplete: function(){
                //the LibraryView NEEDS categories information to render any content.
                //on successful fetch of categories, trigger a ready event
                this.ready = true;
                this.trigger('ready');
            },
            onCategoryFetchError: function(){
                //the LibraryView NEEDS categories information to render any content.
                //if, for any reason, categories fail to load. Trigger an error
                //This error should be handled by the route or controller responsible for
                //initializing this LibraryView
                this.trigger("initializationError");
            },
            updatePagination: function(data){
                this.paginator.update({
                    current: data.currentPage,
                    total: data.totalPages
                });
            },
            pageChange: function(data){
                var state = this.getState();
                state.pageNum = data.pageNum;
                this.setState(state);
                $('html, body').animate({
                    scrollTop: 0
                });
            },
            labelChange: function(data){
                this.state.label = data.label;
                if(data.label === "All"){
                    this.state.label = null;
                }
                this.setState(this.getState());
                $('html, body').animate({
                    scrollTop: 0
                });
            },
            onSort: function(targetData){
                this.state.sort = targetData.data().sort;
                this.setState(this.getState());
                $('#dropdown-sort').text(targetData.text()).trigger('click');
            },
            closeBookmarkletBanner: function() {
                $('.add-bookmarklet-container').addClass('hide-important');
                $.cookie('flxbookmarkletCookie', 'true', {
                    path: '/'
                });
            },
            preventClick: function() {
                ModalView.alert('Drag this link to your bookmarks toolbar.');
                return false;
            },
            showToolTip: function(e) {
                $(e.target).closest('.add-bookmarklet-wrapper').find('.drag-tooltip').toggleClass('hide');
            },
            dragBookmarklet: function() {
                LibraryView.bookmarkletDroppedPosition = 100;
                window.setTimeout(function(){
                    if(LibraryView.bookmarkletDroppedPosition < 0) {
                        if (window._ck12) {
                            window._ck12.logEvent('FBS_BKMKLT_INSTALL', {
                                'memberID': window.ads_userid,
                                'referrer': 'library'
                            });
                        }
                    }
                },2000);
            },
            onShowFiles: function(){
                if (this.state.sort && this.state.sort.indexOf("updateTime") !== -1){
                    //this.contentSorter.setSelection("creationTime,desc");
                    this.state.sort = "creationTime,desc";
                }
                this.state.itemType = "resources";
                this.setState(this.getState());
                this.hideMobileFiltersView();
                $('.sort-options-dropdown').find('[data-sort="updateTime,desc"]').addClass('hide');
                $('#dropdown-sort').text('Newest first');
            },
            dropBookmarklet: function(e) {
                LibraryView.droppedPosition = e.originalEvent.clientY;
            },
            onFilterOwnership: function(e){
                this.state.ownership = e.ownership;
                this.state.includeRevisionsInState = e.includeRevisionsInState;
                this.setState(this.getState());
            },
            mobileFilterOwnership: function(e){
                this.state.ownership = e.ownership;
                this.state.includeRevisionsInState = e.includeRevisionsInState;
                //this.setState(this.getState());
            },
            onFilterCategory: function(e){
                this.state.categories = e.categories.join(',');
                this.setState(this.getState());
                $('html, body').animate({
                    scrollTop: 0
                });
            },
            onShowArchivedToggle: function(e){
                var btn_show_archived = $(e.currentTarget),
                    label_current = btn_show_archived.text(),
                    label_toggle = btn_show_archived.data('labeltoggle');

                btn_show_archived
                    .toggleClass('dusty-grey')
                    .toggleClass('tangerine')
                    .text(label_toggle)
                    .attr('title', label_toggle + ' Items')
                    .data('labeltoggle', label_current);
                $('#dropdown-label').addClass('button-disabled').removeClass('turquoise');

                this.$el.toggleClass('state-archived');
                this.state.archived = !this.state.archived;
                this.state.label = "";
                this.setState(this.getState());
                return false;
            },
            onClearAll: function(){
                this.state = this.getDefaultState();
                this.setState(this.getState(), {updateView: true});
                this.hideMobileFiltersView();
                $('#filter_files').removeClass('selected');
                $('.filter-clear-wrap').addClass('hide');
            },
            addBookmarkletScript: function() {
                var scriptContent = 'javascript: (function() {' +
                        'var app = document.createElement("script");' +
                        'app.type = "text/javascript";' +
                        'app.async = true;' +
                        'app.id = "ck-12-bookmarklet-script";' +
                        'app.src = "https://' + window.location.host + '/media/bookmarklet/bookmarklet.main.js";' +
                        'document.body.appendChild(app);' +
                        '})();';
                $('#add-bookmarklet-button').attr('href', scriptContent);
            },
            applyFilters : function(){
                var label,
                    state = this.getState(),
                    pendingState = this.libraryFilters.pendingFilters;
                if (pendingState.categories){
                    state.categories = pendingState.categories.join(",");
            }
                if (pendingState.label){
                    state.label = pendingState.label;
                }
                if (pendingState.ownership){
                    state.ownership = pendingState.ownership;
                }
                if ($('#label-filter').find('.label-item.selected').length) {
                    label = $('#label-filter').find('.label-item.selected').attr('data-label');
                    if(label === "All"){
                        state.label = null;
                    } else {
                        state.label = label;
                    }
                }
                this.setState(state);
                this.hideMobileFiltersView();
                this.libraryFilters.clearPendingFilters();
            },
            onRevisionStateFilter: function(e){
                this.state.includeRevisionsInState = e.includeRevisionsInState;
                this.state.ownership = e.ownership;
                this.setState(this.getState());
            }
        }, {
            'template': TMPL.MAIN
        });
        
        return LibraryView;
    });
