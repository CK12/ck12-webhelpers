define([
    'jquery',
    'backbone',
    'underscore',
    'library/views/library.item',
    'library/templates/library.templates'
], function($, Backbone, _, LibraryItemView, TMPL){
    'use strict';
    var LibraryItemsList = Backbone.View.extend({
        LibraryItemViewClass: LibraryItemView,
        items: [],
        empty_template: TMPL.EMPTY_ITEMS,
        initialize: function(options){
            _.bindAll(this, "onModelReset", "onArchive");
            this.model.on("reset", this.onModelReset);
            if (options.LibraryItemViewClass){
                this.LibraryItemViewClass = options.LibraryItemViewClass;
            }
            if( options.EmptyTemplate ){
                this.empty_template = options.EmptyTemplate
            }
        },
        clearLibrary: function(){
            var item;
            for (var i = 0, l = this.items.length; i<l; i++){
                item = this.items[i];
                item.remove();
            }
            this.$el.empty();
        },
        onModelReset: function(data){
            var item, len = data.models.length, $paginator = $('#library-paginator');
            this.clearLibrary();
            if (len){
                for (var i = 0, l=len; i < l; i++){
                    item = new this.LibraryItemViewClass({'model':data.models[i]});
                    item.on('archive', this.onArchive);
                    this.items.push(item.render());
                    this.$el.append(item.$el);
                    $paginator.removeClass('hide');
                }
            } else {
                if (this.model.archived) {
                	this.$el.append(this.empty_template().replace('library', 'archive'));
                } else {
                    this.$el.append(this.empty_template);
                }
                $paginator.addClass('hide');
            }
        },
        render: function(){
            return this;
        },
        onArchive: function(e){
            this.trigger('archive', e);
        }
    });

    return LibraryItemsList;
});