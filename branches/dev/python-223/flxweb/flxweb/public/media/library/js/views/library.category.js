define([
    'jquery',
    'backbone',
    'underscore',
    'library/templates/library.templates'
], function ($, Backbone, _, TMPL) {
    'use strict';

    var CategoryView = Backbone.View.extend({
        checkbox: null,
        events: {
            'click .checkbox': 'onClick'
        },
        initialize: function () {
            _.bindAll(this, 'render', 'onClick');
        },
        render: function () {
            this.setElement($(CategoryView.template(this.model.toJSON())));
            this.checkbox = this.$el.find('input[type="checkbox"]');
            return this;
        },
        onClick: function () {
            if (!this.checkbox.is(':checked')) {
                this.trigger('select', this.model);
            } else {
                this.trigger('deselect', this.model);
            }
            if (window._ck12) {
                _ck12.logEvent('FBS_USER_ACTION', {
                    'memberID': window.ads_userid,
                    'value': this.checkbox.siblings('label').text().trim(),
                    'status': !this.checkbox.is(':checked'),
                    'desc': 'FBS_LIBRARY_FILTER'
                });
            } else if (window.dexterjs) {
		var config = window.dexterjs.get('config');
		if (config && config.hasOwnProperty('mixins') && config.mixins.hasOwnProperty('appID')){
		    if ( config.mixins.appID == 'ltiApp'){
			window.dexterjs.logEvent('FBS_USER_ACTION', {
			    'memberID': config.memberID,
			    'value': this.checkbox.siblings('label').text().trim(),
			    'status': !this.checkbox.is(':checked'),
			    'desc': 'FBS_LIBRARY_FILTER'
			});
		    }
		}
	    }
        },
        setSelectionState: function (selected) {
            if (selected) {
                this.checkbox.prop('checked', true);
            } else {
                this.checkbox.prop('checked', false);
            }
        }
    }, {
        template: TMPL.CATEGORY
    });
    return CategoryView;
});
