define([
    'underscore',
    'backbone1x',
    'marionette',
    'schools/views/school'
], function(_, Backbone, Mn, SchoolView){
    'use strict';
    var SchoolList = Mn.CollectionView.extend({
        childView : SchoolView
    });
    return SchoolList;
});