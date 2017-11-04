define([
    'jquery',
    'backbone',
    'underscore',
    'library/templates/library.templates'
], function($, Backbone, _, TMPL){
    'use strict';
    var ContentSorterView = Backbone.View.extend({
        events: {
            'click li': 'onSortOptionClick',
            'click #dropdown-sort': 'onSortByClick'
        },
        initialize: function(options){
            options = $.extend({}, options);
            _.bindAll(this, "render", "onSortOptionClick");
        },
        render: function(){
            this.$el.html(ContentSorterView.template);
            return this;
        },
        onSortOptionClick: function(e){
            var target = $(e.currentTarget);
            this.trigger("sort",target);
            return false;
        },
        onSortByClick: function(){
            if (!$('.js-listitem').length) {
                return false;
            }
        }
    }, {
        template: TMPL.CONTENT_SORTER
    });
    return ContentSorterView;
});
