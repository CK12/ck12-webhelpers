define(['jquery',
        'underscore',
        'backbone',
        'library/services/ck12.library',
        'common/utils/utils',
        'library/views/library.view'
    ],
    function ($, _, Backbone, service, util, LibraryView) {
        'use strict';
        var Library = Backbone.Router.extend({
            
            libraryContainerID: "#library-container",
            routes: {
                'library':'libraryHome',
                'library/': 'libraryHome',
                'library/content/:categories(/folder-:label)(/by-:ownership)(/sort-:sort)(/page-:pageNum)(/state-:includeRevisionsInState)(/)': 'libraryContent',
                'library/archived/content/:categories(/by-:ownership)(/sort-:sort)(/page-:pageNum)(/)': 'libraryArchivedContent',
                'library/files(/folder-:label)(/by-:ownership)(/sort-:sort)(/page-:pageNum)(/)': 'libraryFiles',
                'library/archived/files(/by-:ownership)(/sort-:sort)(/page-:pageNum)(/)': 'libraryArchivedFiles',
                '*catchAll': 'catchAll'
            },
            initialize : function (options) {
                var _c = this;
                
                options = $.extend({
                }, options);
                
                _.bindAll(this, "libraryHome", "onViewStateChange");
                _c.view = new LibraryView({
                    'el': $(this.libraryContainerID),
                });
                _c.view.render();
                _c.view.on("stateChange", this.onViewStateChange);
            },
            libraryHome : function(){
                this.setViewState( this.view.getDefaultState() );
            },
            libraryContent : function(categories, label, ownership, sort, pageNum, includeRevisionsInState){
                this.libraryPage(false, 'artifacts', categories, label, ownership, sort, pageNum, includeRevisionsInState);
            },
            libraryArchivedContent : function(categories, ownership, sort, pageNum){
                this.libraryPage(true, 'artifacts', categories, null, ownership, sort, pageNum);
            },
            libraryFiles : function(label, ownership, sort, pageNum){
                this.libraryPage(false, 'resources', null, label, ownership, sort, pageNum);
            },
            libraryArchivedFiles : function( ownership, sort, pageNum){
                this.libraryPage(true, 'resources', null, null, ownership, sort, pageNum);
            },
            libraryPage: function(archived, itemType, categories, label, ownership, sort, pageNum, includeRevisionsInState){
                var viewSate = this.view.getDefaultState(),
                    selectedCategories;

                //parameter cleanup
                categories = categories?categories.toLowerCase():'';
                label = label?label.toLowerCase():'';
                ownership = ownership?ownership.toLowerCase():'';
                sort = sort?sort:'updateTime,desc';

                if (categories){
                    if (categories === 'all'){
                        categories = '';
                    }
                    selectedCategories = _(categories.split(',')).filter(function(x){ return !!($.trim(x)); });
                }

                if (!ownership || !_(['all','bookmarks','owned']).contains(ownership) ){
                    ownership = 'all';
                }
                
                $.extend(viewSate, {
                    categories: categories,
                    label: label,
                    pageNum: pageNum,
                    sort: sort,
                    ownership: ownership,
                    archived: archived,
                    itemType: itemType,
                    includeRevisionsInState: includeRevisionsInState
                });
                this.setViewState(viewSate);
            },
            catchAll: function(path){
                this.setViewState( this.getStateForOldPath(path) );
            },
            onViewStateChange: function(state){
                var navigate_url = this.stateToUrl(state);
                this.navigate(navigate_url);
            },
            setViewState: function(state){
                this.view.setState(state, { silent: true, delayed: false, updateView: true });
            },
            getStateForOldPath : function(path){
                var viewState = this.view.getDefaultState(),
                    path_fragments = [];

                if (path){
                    path_fragments = path.split("/");
                    if (path_fragments[0] === 'tests'){
                        this.view.state.categories = "assessment";
                        viewState.categories = "assessment";
                    }
                }
                return viewState;
            },
            stateToUrl: function(state){
                var url = 'library';

                //archive
                if (state.archived){
                    url += '/archived';
                }
                
                //artifacts vs resources
                if (state.itemType === 'artifacts'){
                    url += '/content';
                } else if(state.itemType === 'resources'){
                    url += '/files';
                } else {
                    url += '/content';
                }

                if (state.itemType !== 'resources'){
                    //categories
                    if (state.categories){
                        url += '/' + state.categories;
                    } else {
                        url += '/all';
                    }
                }

                //label
                if (state.label){
                    url += '/folder-' + state.label;
                }

                //ownership
                if (state.ownership){
                    url += '/by-' + state.ownership;
                }
                
                //sort
                if (state.sort){
                    url += '/sort-' + state.sort;
                }

                //page
                if (state.pageNum){
                    url += '/page-' + state.pageNum;
                }
                if (state.includeRevisionsInState){
                    url += '/state-' + state.includeRevisionsInState;
                }

                return url;
            }
        },{
            start: function(options){
                var library = window.library = new Library(options);
                Backbone.history.start({
                    pushState: true,
                    root: options.root || "/my"
                });
                return library;
            }
        });

        return Library;
    });
