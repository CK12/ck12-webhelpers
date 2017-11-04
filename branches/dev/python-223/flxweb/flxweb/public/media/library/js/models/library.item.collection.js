define([
    'jquery',
    'underscore',
    'backbone',
    'library/models/library.item'
], function($, _, Backbone, LibraryItem){
    'use strict';
    var LibraryItemCollection = Backbone.Collection.extend({
        model: LibraryItem
    });
    return LibraryItemCollection;
});