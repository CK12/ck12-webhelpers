/**
 * Copyright 2007-2011 CK-12 Foundation
 * 
 * All rights reserved
 * 
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 * 
 * This file originally written by Ravi Gidwani
 * 
 * $Id$
 */
define('flxweb.browse_views',
       ['jquery', 'backbone', 'flxweb.concept_models', 'flxweb.modality_models', 
        'flxweb.browse_models', 'jquery-ui', 
        'flxweb.global', 'jquery.hoverIntent', 
        'jquery.scrollTo', 'jquery.dotdotdot'],
   function($, Backbone, fcm, fmm, fbm) {

    var BrowseGroupCollectionView,
        BrowseGroupView,
        ConceptView,
        ModalityGroupsView,
        pathroot = window.location.pathname.split('/').slice(0, 3).join('/');

    function setTemplate(id, variable) {
        if (! variable) { 
            variable = 'data';
        }
        return _.template($(id).html(), null, {'variable': variable});
    }
    
    function getParent(cur, level){
        if (!cur || !level){ return null; }
        if (cur.get('level') == level) { return cur; }
        return getParent( cur.get('parent'), level);
    }
    
    
    /*
      #  ___ _         _              _       
      # | __| |_____ _| |__  ___  ___| |__ ___
      # | _|| / -_) \ / '_ \/ _ \/ _ \ / /(_-<
      # |_| |_\___/_\_\_.__/\___/\___/_\_\/__/
      #                       
    */

    FlexbooksView = Backbone.View.extend({
        template: setTemplate('#flexbook-block-template', 'c'),
        render: function() {
            if (0 === this.collection.length) {
                this.$el.html('');
                return this;
            }

            this.$el.html(this.template(this.collection.toJSON()));
            return this;
        }
    });

    /*
     *  ___ _           _         _    __   ___               
     * / __| |_ _  _ __| |___ _ _| |_  \ \ / (_)_____ __ _____
     * \__ \  _| || / _` / -_) ' \  _|  \ V /| / -_) V  V (_-<
     * |___/\__|\_,_\__,_\___|_||_\__|   \_/ |_\___|\_/\_//__/
     *                                                        
     */

    
    /*
     *  __  __         _      _ _ _           ___                      
     * |  \/  |___  __| |__ _| (_) |_ _  _   / __|_ _ ___ _  _ _ __ ___
     * | |\/| / _ \/ _` / _` | | |  _| || | | (_ | '_/ _ \ || | '_ (_-<
     * |_|  |_\___/\__,_\__,_|_|_|\__|\_, |  \___|_| \___/\_,_| .__/__/
     *                                |__/                    |_|      
     */

    ModalityGroupView = Backbone.View.extend({
        tagName: 'li',
        template: setTemplate('#modality-filter-template'),

        render: function() {
            var j = this.model.toJSON();
            j.subject = getParent(this.model.get('concept'), 2).get('handle').toLowerCase();
            j.handle = this.model.get('concept').get('handle');
            this.$el.html(this.template(j));
            return this;
        }
    });

    ModalityGroupsView = Backbone.View.extend({

        render: function() {
            var el = this.$el;
            this.model.get('modality_groups').each(function(m) { 
                el.append(new ModalityGroupView({model: m}).render().el); 
            });
            return this;
        },

        show: function(next) { this.$el.slideDown('fast'); },
        hide: function(next) { this.$el.slideUp('fast'); }
    });
        
    /*
     *   ___                      _     _    _    _   
     *  / __|___ _ _  __ ___ _ __| |_  | |  (_)__| |_ 
     * | (__/ _ \ ' \/ _/ -_) '_ \  _| | |__| (_-<  _|
     *  \___\___/_||_\__\___| .__/\__| |____|_/__/\__|
     *                      |_|                       
     * Unit -> Chapter -> Concept Headers (Black) -> CONCEPTS (Green)
     */


    SubconceptView = Backbone.View.extend({
        className: 'browse_subconcept',
        tagName: 'li',
        template: setTemplate('#subconcept-item-template', 'c'),

        events: {
            'click .topic_concept_vm': 'toggleModalities'
        },

        toggleModalities: function() {
            if ((this.modalities) && (this.modalities.$el.is(':visible'))) {
                this.modalities.hide();
                this.$('.topic_concept_vm').removeClass('modality_open');
                return;
            }

            if (!(this.modalities)) {
                this.modalities = (new ModalityGroupsView({
                    model: this.model,
                    el: this.$('.browse_modality_list')
                }).render());
            }

            this.modalities.show();
            this.$('.topic_concept_vm').addClass('modality_open');
        },

        render: function() {
            var j = this.model.toJSON();
            j.subject = getParent(this.model, 2).get('handle').toLowerCase();
            this.$el.html(this.template(j));
            return this;
        }
    });

    SubconceptsView = Backbone.View.extend({
        show: function(next) { 
            var _this = this;
            return $.Deferred(function(dfd) {
                _this.$el.slideDown('fast', dfd.resolve);
            }).promise();
        },

        hide: function(next) { 
            var _this = this;
            return $.Deferred(function(dfd) {
                _this.$el.slideUp('fast', dfd.resolve);
            }).promise();
        },

        render: function() {
            this.$el.append.apply(this.$el, this.collection.map(function(c) {
                return (new SubconceptView({model: c})).render().el; }));
            return this;
        }
    });

    ConceptView = Backbone.View.extend({
        className: 'clearfix topic_concept',
        tagName: 'li',
        template: setTemplate('#chapter-concept-item-template', 'c'),

        events: {
            'click .topic-concept-handle': 'toggleSubconcepts'
        },

        initialize: function(options) { 
            this.count = options.count;
        },

        toggleSubconceptsState: function(state) {
            var _this = this;

            if (!state) {
                if (this.subconcepts) {
                    this.$('.topic-concept-handle').removeClass('topic-concept-opened');
                    return this.subconcepts.hide();
                }
                this.$('.topic-concept-handle').removeClass('topic-concept-opened');
                return;
            }

            if (!(this.subconcepts)) {
                this.subconcepts = (new SubconceptsView({
                    collection: this.model.get('children'),
                    el: this.$('.topic_concept_subconcepts_list')
                }).render());
            }

            this.$('.topic-concept-handle').addClass('topic-concept-opened');
            return this.subconcepts.show();
        },

        toggleSubconcepts: function() {
            var _this = this;
            if ((this.subconcepts) && (this.subconcepts.$el.is(':visible'))) {
                $.when(this.toggleSubconceptsState(false)).then(function() {
                    _this.$('.topic-concept-handle').trigger('expando');
                });
                return this;
            }
            $.when(this.toggleSubconceptsState(true)).then(function() {
                _this.$('.topic-concept-handle').trigger('expando');
            });
            return this;
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    /*
     *  ___                           ___                      _     _  _             _            
     * | _ )_ _ _____ __ _____ ___   / __|___ _ _  __ ___ _ __| |_  | || |___ __ _ __| |___ _ _ ___
     * | _ \ '_/ _ \ V  V (_-</ -_) | (__/ _ \ ' \/ _/ -_) '_ \  _| | __ / -_) _` / _` / -_) '_(_-<
     * |___/_| \___/\_/\_//__/\___|  \___\___/_||_\__\___| .__/\__| |_||_\___\__,_\__,_\___|_| /__/
     *                                                   |_|                                       
     *
     * Unit -> CHAPTER -> CONCEPT HEADERS (Black) -> Concepts (Green)
     */


    MainDisplayElement = Backbone.View.extend({
        isVisible: function() {
            return this.$el.is(':visible');
        },

        hide: function(reset) {
            var _this = this, 
                promise;

            promise = $.Deferred(function(dfd) {
                _this.$el.fadeOut('fast', dfd.resolve);
            }).promise();
            this.trigger('hide', this);
            return promise;
        },

        show: function(next) {
            var _this = this;

            $.Deferred(function (dfd) {
                _this.$el.fadeIn('fast', dfd.resolve);
            }).promise();
            this.trigger('show', this);
            return this;
        }
    });

    /* This isn't well named.  It's the list of concept headers (level
     * 3) found within a chapter. */

    BrowseTermChapterListView = Backbone.View.extend({
        
        initialize: function() {
            this.opened = false;
            this.subviews = [];
            this.$el.bind('expando', '.topic-concept-handle', _.bind(this.checkExpando, this));
        },

        checkExpando: function() {
            var t = 'expand',
                vl = this.$('.topic_concept_subconcepts_list:visible').length;
            if ((vl !== 0) && (vl != this.subviews.length)) {
                return;
            }
            if (vl === this.subviews.length) {
                t = 'collapse';
            }
            $('.topic_expand_all').html(t + ' all');
        },

        toggleAllSubconcepts: function() {
            var o, vl, _this = this;

            vl = this.$('.topic_concept_subconcepts_list:visible').length;

            if (vl === this.subviews.length) {
                this.opened = true;
            }

            if (vl === 0) {
                this.opened = false;
            }

            this.opened = o = (! this.opened);
            $.when.apply(null, _.map(this.subviews, function(c) { return c.toggleSubconceptsState(o); })).then(
                function() {
                    _this.checkExpando();
                });
            return this;
        },

        render: function() {
            var tcl = this.$('.topic_concept_list');
            this.subviews = this.collection.map(function(c) {
                return (new ConceptView({model: c})).render();
            });
            tcl.append.apply(tcl, _.pluck(this.subviews, 'el'));
            return this;
        }
    });

    /* The long form of a Chapter (level 2) with Concept headers. */

    BrowseTermChapterLongView = MainDisplayElement.extend({
        className: 'topic_concept_view',
        template: setTemplate('#chapter-concept-list-template', 'c'),
        
        events: {
            'click .topic_concept_toolbar .closer': 'hide',
            'click .topic_expand_all': 'toggleAllSubconcepts',
            'conceptclose': 'hide'
        },

        toggleAllSubconcepts: function(ev) {
            ev.preventDefault();
            this.listView.toggleAllSubconcepts();
        },

        initialize: function(options) {
            this.listView = new BrowseTermChapterListView({
                collection: this.model.get('children'), 
                el: this.el
            });
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.listView.render();
            return this;
        }
    });

    /*  ___                           ___ _              _           
     * | _ )_ _ _____ __ _____ ___   / __| |_  __ _ _ __| |_ ___ _ _ 
     * | _ \ '_/ _ \ V  V (_-</ -_) | (__| ' \/ _` | '_ \  _/ -_) '_|
     * |___/_| \___/\_/\_//__/\___|  \___|_||_\__,_| .__/\__\___|_|  
     *                                             |_|               
     * Unit -> CHAPTER -> Concept Headers (Black) -> Concepts (Green)
     *
     * These are the initial displays seen by the students.  For any
     * given Unit (level 1) item, there will be a collection of
     * chapters (level 2).  Here, we give the summary view of the
     * chapter.  If the user picks any chapter, the table of concepts
     * will be displayed.
     */

    BrowseTermChapterView = Backbone.View.extend({
        tagName: 'li',
        className: 'browsetitles clearfix',
        template: setTemplate('#browse-term-chapter-template', 'group'),

        render: function() {
            var j = this.model.toJSON();
            j.full_handle = [pathroot, j.handle].join('/');
            this.$el.html(this.template(j));
            return this;
        }
    });

    NoBrowseTermsView = Backbone.View.extend({
        tagName: 'li',
        className: 'browsetitles clearfix',
        template: setTemplate('#no-browse-term-chapter-template', 'group'),
        render: function() {
            var subject = (this.model.get('name') || 'this subject');
            this.$el.html(this.template({subject: subject}));
            return this;
        }
    });
                

    /*
     *  ___                          _   _      _ _   
     * | _ )_ _ _____ __ _____ ___  | | | |_ _ (_) |_ 
     * | _ \ '_/ _ \ V  V (_-</ -_) | |_| | ' \| |  _|
     * |___/_| \___/\_/\_//__/\___|  \___/|_||_|_|\__|
     *
     * UNIT -> Chapter -> Concept Headers (Black) -> Concepts (Green)
     *                             
     */

    /* Design decision: the hover feature is pure decoration.  It
     * doesn't need to be instantiated on a per-listitem basis, it
     * just needs to work.  Put it here, as an element-wide delegate,
     * and be done with it.  For all I know, hoverIntent runs $.each()
     * underneath, but I have to assume it's smarter than that. */

    BrowseTermUnitView = Backbone.View.extend({
        template: setTemplate('#browse-term-unit-template'),

        scale: function(scaled, group) {
            var opts = {queue: false, duration: 300};
            if (scaled) {
                this.$el
                    .find('li.browsetitles')
                    .find('.scale_wrapper')
                    .stop()
                    .animate({scale: 0.666666}, opts)
                    .end()
                    .animate({width: "110px", height: "155px"}, opts);
                this.$('div.flexbooks').stop().fadeOut();
                this.$('.js_browse_section').addClass('scaled');
                this.$(".imagemask").removeClass('active');
                this.$("a[href='#" + group + "'] .imagemask").addClass('active');
            } else {
                this.$el
                    .find('li.browsetitles')
                    .find('.scale_wrapper')
                    .stop()
                    .animate({scale: 1.0}, opts)
                    .end()
                    .animate({width: "150px", height: "250px"}, opts);
                this.$('div.flexbooks').stop().fadeIn();
                this.$('.js_browse_section').removeClass('scaled');
                this.$(".imagemask").removeClass('active');
            }
        },

        render: function() {
            var t;
            this.$el.html(this.template());
            t = this.$('.browsecards');
            if (this.model.get('children').length === 0) {
                t.append(new NoBrowseTermsView({model: this.model}).render().el);
            } 

            this.model.get('children').each(function(m) {
                t.append(new BrowseTermChapterView({model: m}).render().el);
            });

            this.flexbooks = new FlexbooksView({
                collection: new fbm.FlexbookCollection(window.ck12.books),
                el: this.$('.flexbooks')
            }).render();
            
            return this;
        }
    });



    /*   ___         _           _ _         
     *  / __|___ _ _| |_ _ _ ___| | |___ _ _ 
     * | (__/ _ \ ' \  _| '_/ _ \ | / -_) '_|
     *  \___\___/_||_\__|_| \___/_|_\___|_|  
     *                                       
     */


    BreadcrumbView = Backbone.View.extend({
        el: $('#subject-group-name'),
        template: setTemplate('#breadcrumb-template'),
        
        set: function(model) {
            this.model = model;
            return this;
        },

        show: function() { this.$el.stop().show(); this.$el.prev().removeClass('breadcrumblink'); return this; },
        hide: function() { this.$el.stop().hide(); this.$el.prev().addClass('breadcrumblink'); return this; },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        setAndShow: function(model) {
            this.set(model).render().show();
        }
    });
    
    
    BrowseRouter = Backbone.Router.extend({
        browse_groups_view: null,
        views: {},

        'routes': { 
            ':group': 'viewGroup',
            '*path': 'viewGroups',
            '': 'viewGroup'
        },

        'initialize': function(options) {
            this.el = $('#browse-concepts');

            this.breadcrumbs_view = new BreadcrumbView();
            modality_group_collection = new fbm.ModalityGroupCollection(window.ck12.modality_groups);
            this.browse_term = new fbm.BrowseTerm(fbm.ck12_browse_business_rules(window.ck12.browse_term));
            this.root = (new BrowseTermUnitView({
                model: this.browse_term
            })).render();
            $('#browse-main').append(this.root.el);
            $.flxweb.fixBrokenImages(
                '.browsecard_topic_image', 
                '/media/images/modality_generic_icons/concept_gicon.png');
            $.flxweb.fixBrokenImages(
                '.browse-flexbook-item img',
                '/media/images/thumb_dflt_flexbook_lg.png');
        },

        fadeAll: function() {
            var hides = _.map(this.views, function(v) { 
                if (v.hide) { return v.hide(); }
                return null;
            });
            this.breadcrumbs_view.hide();
            return _.select(hides, function (t) { 
                return (t !== null); });
        },

        viewGroups: function() {
            var _this = this;
            $('#browse-main').stop().show();
            this.fadeAll();
            this.root.scale(false);
        },

        viewGroup: function(group) {
            var _this = this;
            this.root.scale(true, group);

            $.when(this.fadeAll()).then(function() {
                var view;
                view = _this.views[group];
                if (!view) {
                    view = _this.views[group] = (
                        new BrowseTermChapterLongView(
                            {model: _this.browse_term.getChildFor(group)}));
                    view.render();
                    _this.el.append(view.el);
                }
                _this.breadcrumbs_view.setAndShow(view.model);
                view.show();
            });
        }
    });

    /*
     *  ___      _ _   _      _ _         _   _          
     * |_ _|_ _ (_) |_(_)__ _| (_)_____ _| |_(_)___ _ _  
     *  | || ' \| |  _| / _` | | |_ / _` |  _| / _ \ ' \ 
     * |___|_||_|_|\__|_\__,_|_|_/__\__,_|\__|_\___/_||_|
     *     
     */

    $(document).ready(function() {
        var browse_router = new BrowseRouter();

        $('.browse-buttons button').click(function(ev) {
            var view = $(ev.currentTarget).data('view');
            if (view) {
                window.location.href = view;
            }
        });

        $('.backtotop a').click(function(ev) {
            ev.preventDefault();
            $.scrollTo($('.contenttop').first(), {duration: 300});
        });
        
        $(".browsecard_topic_name").dotdotdot();
        $(".browse-flexbook-block .title").dotdotdot({'height': 48});
            
        Backbone.history.start();
    });
});
