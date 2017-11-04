define([
    'jquery',
    'underscore',
    'backbone',
    'modalityAssign/models/group.info.model'
], function($, _, Backbone,GroupInfoModel){
    'use strict';
    var GoogleCourseInfoModel = GroupInfoModel.extend({
        defaults : {
            platform:"google",
            id:"",
            ownerId: "",
            dueDate:""
    	},
    	
        initialize: function(){
            _.bindAll(this);
        },
        hasValidDate: function(dueDate){
            if (!dueDate) {
                return true;
            }
            return dueDate != new Date().toDateString();
        }

    });

    return GoogleCourseInfoModel;
});
