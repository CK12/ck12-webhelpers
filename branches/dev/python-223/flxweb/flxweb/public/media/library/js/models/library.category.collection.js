define([
    'jquery',
    'underscore',
    'backbone',
    'library/models/library.category'
], function($, _, Backbone, LibraryCategory){
    'use strict';
    var LibraryCategoryCollection = Backbone.Collection.extend({
        model: LibraryCategory,
        //returns comma separated list of artifact types for a catagory alias
        getArtifactTypeByAlias: function(alias) {
            var category, types;
            category = this.find(function(cat) {
                return (cat.get('alias') === alias);
            });
            if (category) {
                types = category.get('artifactTypes');
            }
            return types;
        },
        getArtifactTypesForAliases: function(aliases){
            var arr_aliases, alias, types=[];
            arr_aliases = aliases.split(",");
            for (var i=0, l=arr_aliases.length; i<l; i++){
                alias = $.trim(arr_aliases[i]);
                types = types.concat(this.getArtifactTypeByAlias(alias));
            }
            return types;
        },
        getAllArtifactTypes: function(){
            var types = [];
            this.each(function(c){
                types = types.concat(c.get('artifactTypes'));
            });
            return types;
        },
        deselectAll: function(){
            this.each(function(c){
                c.deselect();
            });
        },
        selectAll: function(){
            this.each(function(c){
                c.select();
            });
        },
        selectCategoriesByAliases: function(aliases){
            var arr_aliases;
            arr_aliases = aliases.split(",");
            if (arr_aliases.length){
                this.deselectAll();
            }
            this.each(function(c){
                if( _(arr_aliases).contains(c.get('alias')) ){
                    c.select();
                }
            });
        }
    });

    return LibraryCategoryCollection;
});