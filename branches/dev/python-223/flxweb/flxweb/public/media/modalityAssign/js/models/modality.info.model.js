define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    'use strict';
    var ModalityInfoModel = Backbone.Model.extend({
        
    	defaults : {
    		title : '',
    		instruction : '',
    		groupList : [],
		platform: '',
    		artifactID : 0,
    		selectAll : false
    	},
    	
        initialize: function(){
            _.bindAll(this);
        }
    });

    return ModalityInfoModel;
});
