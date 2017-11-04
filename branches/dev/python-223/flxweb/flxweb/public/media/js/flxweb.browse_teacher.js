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
define('flxweb.browse_teacher',
       ['jquery', 'backbone', 'flxweb.concept_models', 'flxweb.modality_models', 
        'flxweb.browse_models',
        'jquery-ui', 'flxweb.global','jquery.isotope', 'jquery.hoverIntent'],
       function($, Backbone, fcm, fmm, fbm) {

    var ModalityGroupsView,
        TeacherBrowseGroupCollectionView,
        TeacherBrowseGroupView,
        TeacherConceptCollectionView,
        TeacherConceptView,
        TeacherModalityGroupCollectionView,
        pathroot = window.location.pathname.split('/').slice(0, 3).join('/');


    function setTemplate(id, variable) {
        if (! variable) { 
            variable = 'data';
        }
        return _.template($(id).html(), null, {'variable': variable});
    }


    /*
      #  ___ _         _              _       
      # | __| |_____ _| |__  ___  ___| |__ ___
      # | _|| / -_) \ / '_ \/ _ \/ _ \ / /(_-<
      # |_| |_\___/_\_\_.__/\___/\___/_\_\/__/
      #                       
    */

    TeacherFlexbooksView = Backbone.View.extend({
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
     *  _____            _             __   ___               
     * |_   _|__ __ _ __| |_  ___ _ _  \ \ / (_)_____ __ _____
     *   | |/ -_) _` / _| ' \/ -_) '_|  \ V /| / -_) V  V (_-<
     *   |_|\___\__,_\__|_||_\___|_|     \_/ |_\___|\_/\_//__/
     *                             
     */

    TeacherTermUnitView = Backbone.View.extend({
        tagName: 'ul',
        className: 'topic-concept-teacher-list',

        nextLevel: function() {
            if (this.model.get('level') === 3) {
                return {model: TeacherTermConceptLabelView, field: 'children'};
            }
            if (this.model.get('level') === 4) {
                return {model: TeacherTermConceptView, field:'children'};
            }
            if (this.model.get('level') === 5) {
                return {model: TeacherTermModalityView, field: 'modality_groups'};
            }
            return {model: TeacherTermItemView, field: 'children'};
        },
        
        render: function() {
            var t = this.$el, 
                nextLevel = this.nextLevel();
            this.model.get(nextLevel.field).each(function(m) {
                t.append(new (nextLevel.model)({model: m}).render().el);
            });
            return this;
        }
    });

    TeacherTermItemView = Backbone.View.extend({
        tagName: 'li',
        className: 'topic-concept-teacher-item',
        template: setTemplate('#teacher-term-item-template', 'c'),

        events: {
            'click .topic-concept-handle': 'toggle',
            'click .topic_concept_switch': 'toggle'
        },

        open: function() {
            if (!this.subview) {
                this.subview = (new TeacherTermUnitView({
                    model: this.model,
                    el: this.$('.topic-concept-teacher-list:first')
                })).render();
            }
            this.$('.topic-concept-handle').first().addClass('topic-concept-opened').removeClass('topic-concept-closed');
            this.subview.$el.slideDown('fast');
        },

        close: function() {
            this.$('.topic-concept-handle').first().addClass('topic-concept-closed').removeClass('topic-concept-opened');
            this.subview.$el.slideUp('fast');
        },

        toggle: function(ev) {
            /* stopPropagation is correct here.  These are nested
            items.  We want only the most local handling element to
            hear the event. */
            ev.stopPropagation(); 
            if (this.$('.topic-concept-teacher-list:first').is(':visible')) {
                this.close(); 
            } else {
                this.open();
            }
        },

        render: function() {
            var j = this.model.toJSON();
            j.full_handle = [pathroot, j.handle].join('/');
            this.$el.html(this.template(j));
            return this;
        }
    });

    TeacherTermConceptLabelView = TeacherTermItemView.extend({
        template: setTemplate('#teacher-term-concept-labels-template', 'c'),

        open: function() {
            TeacherTermItemView.prototype.open.call(this);
            this.$('.modality_types:first').stop().fadeIn();
        },

        close: function() {
            TeacherTermItemView.prototype.close.call(this);
            this.$('.modality_types:first').stop().fadeOut();
        }
    });

    TeacherTermConceptView = TeacherTermItemView.extend({
        template: setTemplate('#teacher-term-concepts-template', 'c')
    });

    TeacherTermModalityView = TeacherTermItemView.extend({
        template: setTemplate('#modality-filter-template', 'data'),
        className: 'topic-concept-modality-item',
        
        render: function() {
            var j = this.model.toJSON();
            j.handle = this.model.get('concept').get('handle');
            this.$el.html(this.template(j));
            return this;
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
        $.cookie('browseview', 'teacherview', {path: '/', expires: 365});
        $('.browse-buttons button').click(function(ev) {
            var view = $(ev.currentTarget).data('view');
            if (view) {
                $.cookie('browseview', view, {path: '/', expires: 365});
                window.location.reload(true);
            }
        });

        $('#browse-concepts-inner').append((new TeacherTermUnitView({
            model: new fbm.BrowseTerm(fbm.ck12_browse_business_rules(window.ck12.browse_term))}).render().el));

        $('#browse-flexbooks').append((new TeacherFlexbooksView({
            collection: new fbm.FlexbookCollection(window.ck12.books)}).render().el));
    });
});
