define([
    'jquery',
    'underscore',
    'backbone',
    'library/views/library.view',
    'library/views/library.item',
    'practiceapp/templates/templates',
    'common/views/modal.view'
], function($, _, Backbone, LibraryView, LibraryItemView, TMPL, ModalView){
    'use strict';

    var EdmodoQuizItemView = LibraryItemView.extend({
    });

    var ExternalModal = ModalView.extend({
        initialize: function(options){
            this.options = $.extend(this.options, {
                showOnOpen: true,
                headerText: "You will be redirected to ck12.org",
                contentPartial: _.template(TMPL.LIBRARY_EXTERNAL_MODAL, {'target':options.target}, {'variable':'data'}),
                css: {
                    'max-width': '480px'
                },
                buttons: []
            });
            ModalView.prototype.initialize.apply(this);
            this.addClass('modal-external-warn');
        },
        'events': function(){
            return _.extend({}, ModalView.prototype.events(), {
                'click .js-external-accept': 'onExternalOk' 
            });
        },
        onExternalOk: function(){
            this.close();
        }
    });


    var EditCompletionChecker = function(){
        var _c = this,
            COOKIE='quizEditInProgress',
            started = false;
        _.extend(this, Backbone.Events);
        $.cookie(COOKIE, null);

        //watch for window getting focused
        window.onfocus = function(){
            if (started && !$.cookie(COOKIE)){
                _c.trigger('EditCompletionChecker.editComplete');
            }
        };

        //set the cookie
        _c.start = function(){
            $.cookie(COOKIE, 1, {'path': '/'});
            started = true;
        };

        _c.stop = function(){
            started = false;
        };
    };
    

    var EdmodoLibraryView = LibraryView.extend({
        LibraryItemViewClass: EdmodoQuizItemView,
        editCompletionChecker: new EditCompletionChecker(),
        defaultStateCategories: "assessment",
        events: function(){
            return _.extend({},LibraryView.prototype.events, {
                'click .warn-external': 'showExternalWarning'
            });
        },
        initialize: function(options){
            // Moved this here because the library item template was being overriden
            // by last template loaded. Bug #4105
            if(!options.skipTemplateOverride){
	        LibraryItemView.template = _.template(TMPL.LIBRARY_ITEM, null, {'variable':'data'});
            }
            LibraryView.prototype.initialize.call(this, options);
            _.bindAll(this, "showExternalWarning", "refresh");
        },
        render: function(){
            var that = this;
            LibraryView.prototype.render.call(this);
           
            $("#library_main").addClass("edmodolibrary"); 
            //this whole block of hiding filters and other elements feels very hacky :(
            //but works well :)
            this.$(".add-bookmarklet-wrapper").addClass('hide');
            //add correct header
            this.$(".library-header").parent().html(TMPL.LIBRARY_HEADER);
            //hide some other stuff too
            this.$("#library-filters-container").addClass('hide');
            this.$("#library-mobile-filters-container").addClass('hide');
            //and adjust the columns
            this.$(".library-contents-main-wrapper").removeClass('large-10').addClass('large-12');
            // Tangerine-library-css sets a width we do not want, but is used in LTI
            this.$("div.library-contents-main-wrapper").css("width","100%");


            //Add a listener to know when a quiz was edited/created on ck12.org
            this.editCompletionChecker.on("EditCompletionChecker.editComplete", function(){
                that.editCompletionChecker.stop();
                that.refresh();
            });

            //set the initial state
            this.refresh();
        },
        refresh: function(){
            this.setState({
                ownership: "owned",
                categories: this.defaultStateCategories,
                sort: "added,desc"
            }, {updateView: true});
        },
        showExternalWarning: function(e){
            var that = this;
            var target = $(e.currentTarget).attr('href');
            var modal = new ExternalModal({
                'target': target
            });
            modal.on('close', function(){
                that.editCompletionChecker.start();
            });
            return false;
        },
        pageChange: function(data){
            var state = this.getState();
            state.categories = state.categories ? state.categories : this.defaultStateCategories;
            state.pageNum = data.pageNum;
            this.setState(state);
        }
    });
    return EdmodoLibraryView;
});
