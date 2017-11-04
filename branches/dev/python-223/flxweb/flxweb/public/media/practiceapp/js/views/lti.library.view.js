define([
    'jquery',
    'underscore',
    'backbone',
    'library/views/library.view',
    'practiceapp/views/library.view',
    'library/views/library.item',
    'practiceapp/templates/templates',
    'common/views/modal.view'
], function($, _, Backbone, LibraryView, EdmodoLibraryView, LibraryItemView, TMPL, ModalView){
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
    

    var LTILibraryView = EdmodoLibraryView.extend({
        LibraryItemViewClass: EdmodoQuizItemView,
        editCompletionChecker: new EditCompletionChecker(),
        excludeBooks:true,
        defaultStateCategories: "text, multimedia, real_world, assessment",
        shownFilters: ["text","multimedia","real_world","assessment"],
        events: function(){
            return _.extend({},EdmodoLibraryView.prototype.events, {
                'click .mylibrary_assign': 'onAssignClick',
                'click .js-listitem': 'onRowClick',
                'click.clearall .js-clear-all': 'onClearAll'
            });
        },
        initialize: function(options){
            LibraryItemView.template = _.template(TMPL.LTI_LIBRARY_ITEM, null, {'variable':'data'});
            options.skipTemplateOverride=true;
            console.log("!! Here !!")
            EdmodoLibraryView.prototype.initialize.call(this, options);
            _.bindAll(this, "showExternalWarning", "refresh", "render", "onAssignClick", "onRowClick");
        },
        onClearAll: function(){
            LibraryView.prototype.onClearAll.call(this);
        },
        render: function(){
            var that = this;
            LibraryView.prototype.render.call(this);
            //this whole block of hiding filters and other elements feels very hacky :(
            //but works well :)
            this.$(".add-bookmarklet-wrapper").addClass('hide');
            //add correct header
            this.$(".library-header").parent().html(TMPL.LTI_LIBRARY_HEADER);
            

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
                sort: "added,desc",
                ownership: "all"
            });
        },
        onAssignClick: function(e){
            var btn = $(e.currentTarget);
            // Add collection data for quiz
            try {
                if (btn.data('mtype') === 'asmtquiz'){
                    var currentItemModel = this.libraryModel.items.where({"artifactID":btn.data("artifactid")})[0];
                    var domainCollectionContexts = currentItemModel.get("domainCollectionContexts");
                    var collectionContext = "";
                    if (domainCollectionContexts) {
                        collectionContext = domainCollectionContexts.filter( function(i){ return i.collectionContext;})[0];
                    }
                    if (collectionContext){
                        btn.data('handle', (btn.data('realm') +"/"+btn.data('handle')));
                        btn.data('collectionHandle', collectionContext.collectionContext.collectionHandle || "")
                        btn.data('conceptCollectionHandle', collectionContext.collectionContext.conceptCollectionHandle || "")
                        btn.data('conceptCollectionAbsoluteHandle', collectionContext.collectionContext.conceptCollectionAbsoluteHandle || "")
                        btn.data('collectionCreatorID', collectionContext.collectionContext.collectionCreatorID || "")
                    }
                }
            } catch (e) {
                console.error("Error trying to add collection info for quiz: " + e);
            }
            this.trigger("assign", btn.data());
            return false;
        },
        onRowClick: function(e){
            var btn = $(e.currentTarget).find(".mylibrary_assign");
            this.trigger("showEmbedView", btn.data());
        }
    });
    return LTILibraryView;
});
