define([
    'jquery',
    'backbone',
    'underscore',
    'modalityAssign/views/group.info.view'
], function ($, Backbone, _, GroupInfoView) {
    'use strict';

    var GroupListInfoView = Backbone.View.extend({
        el : '#assignClassModal div.group-tmpl-section',
    	checkbox: null,
        events: {
        	
        },
        initialize: function () {
            _.bindAll(this, 'render');
            this.render();
        },
        render: function () {
        	var groupView = "",
    			groupStr = [],
    			that = this;
    	
        	this.$el.html("");
    		this.collection.each(function(group){
	    		groupView = new GroupInfoView({
	    			'model':group
	    		});
	    		that.$el.append(groupView.render());
	    	});                    	
        }
    });
    return GroupListInfoView;
});