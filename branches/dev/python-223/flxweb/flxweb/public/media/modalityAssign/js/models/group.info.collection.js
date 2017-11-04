define([
    'jquery',
    'underscore',
    'backbone',
    'modalityAssign/models/group.info.model'
], function($, _, Backbone, groupInfo){
    'use strict';
    
    var GroupInfoCollection = Backbone.Collection.extend({
        model: groupInfo,
    });

    return GroupInfoCollection;
});