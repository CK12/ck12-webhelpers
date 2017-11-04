define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    'use strict';
    var LibraryCategory = Backbone.Model.extend({
        //Returns a comma separated list of artifact types
        initialize: function(){
            _.bindAll(this, "getCSArtifactTypes", "toggleSelection", "select", "deselect");
        },
        getCSArtifactTypes: function() {
            return this.get('artifactTypes').join(",");
        },
        toggleSelection: function(){
            (this.get("selected")?this.deselect:this.select)();
        },
        select: function(){
            if (!this.get('selected')){
                this.set({"selected": true});
            }
        },
        deselect: function(){
            if (this.get('selected')){
                this.set({"selected": false});
            }
        }
    });

    return LibraryCategory;
});