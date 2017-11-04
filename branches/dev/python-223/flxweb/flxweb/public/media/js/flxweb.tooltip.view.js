/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Ravi Gidwani
 *
 * $id$
 */
define('flxweb.tooltip.view', ['jquery', 'underscore', 'backbone', 'text!templates/assignToClass-tooltip.html'], function ($, _, Backbone, template) {
    'use strict';

var AssignToClassTooltip  = Backbone.View.extend({
        events: {
          'click #assign-ok-button' : 'close'
        },
        initialize: function () {
        	this.template = template;
        	this.$el.html(this.template);
        	var self = this;
        	$(document).on('click', function (e) {
        		if($('.assign-info-img')[0] === e.target){
                 	return false;
                 }
                 else if(self.$el.find('#assign-tooltip')[0] !== e.target){
                     self.close(e);
                 }
            });
        	this.render();	
        },
        open: function (e) {
        	if(e)
        		e.stopPropagation();
        	this.$el.find('#assign-tooltip').removeClass('hide');
        },
        close: function (e) {
        	e.stopPropagation();
        	this.$el.find('#assign-tooltip').addClass('hide');
        	$('#reveal-overlay').remove();
        },
        render: function (options) {
        	this.options.parent.append(this.$el);
        }
    });

    return AssignToClassTooltip;
});