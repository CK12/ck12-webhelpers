define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    'use strict';
    var GroupInfoModel = Backbone.Model.extend({
        
    	defaults : {
    		name : '',
    		isSelected : false,
    		isAssigned : false,
    		dueDate : '',
    		groupID : '',
    		isDueDatePassed : false
    	},
    	
        initialize: function(){
            _.bindAll(this);
        }
    });

    return GroupInfoModel;
});