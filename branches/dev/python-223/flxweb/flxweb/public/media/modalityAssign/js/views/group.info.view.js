define([
    'jquery',
    'jquery-ui',
    'backbone',
    'underscore',
    'modalityAssign/templates/modalityAssign.tmpl'
], function ($, jui, Backbone, _, TMPL) {
    'use strict';

    var GroupInfoView = Backbone.View.extend({
        checkbox: null,
        events: {
        	'click .group-select' : 'selectGroup',
        	/*'click' : 'selectGroup',*/
        	'change .due-date' : 'modifyDueDate',
        	'focus .due-date' : 'showDatePicker'
        },
        initialize: function () {
            _.bindAll(this, 'render','selectGroup','modifyView','modifyDueDate');
            this.model.on('change:isSelected',this.modifyView,this);
            this.render();
        },
        myTmpl : _.template(TMPL.GROUPINFO),
        render: function(){
        	var tmpl = "";
        	
        	tmpl = this.myTmpl({
        		"selected" : this.model.get("isSelected")? "checked" : "",
        		"assigned" : this.model.get("isAssigned")?true:false,
        		"name" : this.model.get("name"),
        		"dueDate" : this.model.get("dueDate"),
                "isDueDatePassed" : this.model.get("isDueDatePassed"),
                "id" : this.model.get("id")? this.model.get("id"):""
        	});
        	this.$el.addClass("row group-info").html(tmpl);
        	this.handleGroupRow();
            return this.$el;
        },
        handleGroupRow : function(){
        	if(this.model.get("isAssigned")){
        		if(!this.model.get("isDueDatePassed")){
        			this.$el.find('.due-date').attr("readonly","readonly");        			
        			this.$el.addClass("disable-row");
        		}
        		this.$el.find('.group-assigned').addClass("assigned-status");
        	}else{
        		this.$el.find('.group-assigned').addClass("hide-imp");
        	}
        },
        /*renderZeroState : function(){
        	$(".zero-state").removeClass("hide-imp");
        },*/
        modifyView : function(){
        	//this.$el.find(".group-select").attr("selected",this.model.get("isSelected")?"selected":"");
        	if(this.model.get("isSelected")){
        		this.$el.find(".group-select").addClass("checked");
        	}else{
        		this.$el.find(".group-select").removeClass("checked");
        	}
        },
        selectGroup : function(){
        	if(!this.model.get("isAssigned") || this.model.get("isDueDatePassed")){
        		this.model.set("isSelected",!this.model.get("isSelected"));
        		$('#error-message').addClass('hide-imp');
        		$(".bg-title","#assignClassModal").removeClass("error-field");
        		$('#error-message').text('');
        		this.$el.find(".due-date").removeClass("error-field");
        	}
        },
        clearDateValidation: function(){
            this.$el.find('.due-date')
            .removeClass('error-field');
            this.$el.find('.google-date-validation')
            .addClass('hide');
        },
        modifyDueDate : function(){
        	
        	//validation if this is a proper format of due date or not
        	var dueDate = this.$el.find(".due-date").val(),
                dateObj = "",
                platform = this.model.get('platform');
        	
        	if(dueDate.trim().length === 0){
                this.model.set("dueDate","");
                if (platform && platform === 'google'){
                    this.clearDateValidation();
                }
        		return false;
        	}
        	
        	if(!isValidDate(dueDate)){
        		this.model.set("dueDate","");
        		$('#error-message').removeClass('hide-imp');
        		this.$el.find(".due-date").addClass("error-field").val("");
        		$('#error-message').text('Please enter correct date');
                this.model.set("isSelected", false);
                this.$el.find(".group-select").removeClass("checked");
        		return false;
            }

            dateObj = new Date(dueDate);

            if (platform === 'google') {
                this.clearDateValidation(); 

                if (!this.model.hasValidDate(dateObj.toDateString())){
                    this.$el.find('.due-date')
                    .addClass('error-field');
                    this.$el.find('.google-date-validation')
                    .removeClass('hide');
                    this.$el.find(".group-select").removeClass("checked");
                    return false;
                }
            }
        	
        	if(datePeriodCheck(dateObj)){
        		this.$el.find(".due-date").removeClass("error-field");
        		$('#error-message').addClass('hide-imp');
        		$('#error-message').text('');

        		this.model.set("dueDate",dateObj.getFullYear() + "-" + (dateObj.getMonth()+1) + "-" + dateObj.getDate());
            	this.model.set("isSelected",true);
            	
            	//whenever due date is selected, Group is in new non assigned state
            	this.model.set("isDueDatePassed",false);
            	this.model.set("isAssigned",false);
        	}else{
        		this.model.set("dueDate","");
        		$('#error-message').removeClass('hide-imp');
        		this.$el.find(".due-date").addClass("error-field").val("");
        		$('#error-message').text('Due date can not be in past & can be only max 2 years in future!');
        	}
        	
        	function datePeriodCheck(date){
        		var maxDate = new Date(),
        			today = new Date();
        		
        		maxDate.setHours(0,0,0,0);
        		today.setHours(0,0,0,0);
        		
        		maxDate.setFullYear(maxDate.getFullYear() + 2);
        		if(date >= today && date <= maxDate){
        			return true;
        		}
        		return false;
        	}
        	
        	function isValidDate(s) {
        		  var bits = s.split('/'),
        		  	  d = "";
        		  
        		  if(bits.length !== 3 || bits[0].length > 2 || bits[1].length > 2 || bits[2].length > 4){
        			return false;  
        		  }
        		  d = new Date(bits[2], bits[0] - 1, bits[1]);	//format is mm/dd/yyyy
        		  return d && (d.getMonth() + 1) == bits[0];
        	}
        	
        },
        showDatePicker : function(evt){
        	/*evt.stopPropagation();
        	evt.preventDefault();*/
        	if(this.model.get("isAssigned") && !this.model.get("isDueDatePassed")){
        		return;
        	}
        	this.$el.find(".due-date").datepicker({
                minDate: 0,
                dayNamesMin: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
            });
            $('.ui-datepicker-prev').addClass('icon-arrow_left');
            $('.ui-datepicker-next').addClass('icon-arrow_right');
        }
    });
    return GroupInfoView;
});
