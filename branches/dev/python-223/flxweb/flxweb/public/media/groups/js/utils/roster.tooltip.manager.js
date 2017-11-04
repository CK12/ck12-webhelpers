/*
*  Module to manage tooltips for roster functionality
* 
*/

var rosterTooltipConfig = {
	"add-members-tooltip-once" : {
		name: "add-members-tooltip-once",
		show_count: 1,
		exclude_page: /group\-(members|assignments|resources|reports)\/[0-9]{1,}\/?/
	},
	"group-members-add-member-tooltip": {
		name: "group-members-add-member-tooltip",
		show_count: 1,
		exclude_page: null
	}
}

define(['groups/services/ck12.groups'],
    function (groupsService) {

        'use strict';

        function RosterTooltipManager() {

            var config = {},
		RegisteredTooltips = {};
		
		function onExcludedPage(regex_pattern){
			return window.location.href.match(regex_pattern);
		}
	    
            function getTooltipFromStorage(name) {
		if (localStorage){
			return localStorage.getItem(name);
		}
	    }

	    function meetsConditions(tooltipObject) {
		    if (tooltipObject && tooltipObject.name) {
			    var count = getTooltipFromStorage(tooltipObject.name);
			    var conditions = checkForTooltip(tooltipObject.name);
			    if (conditions.show_count >= count) {
				   return false;
			    }
			    if (onExcludedPage(tooltipObject.exclude_page)) {
				    return false;
			    }
			    return true;
		    }
	    }
            
	    /**
	     * Check to see if value exists in storage
	     *
	     * name - Name of the key
	     * setIfFalse/config.setIfFalse - If true, set the flag if conditions met.
	     *
	     * */
            function checkForTooltip(name, setIfFalse) {
		    try {
			    setIfFalse = setIfFalse ? true : false;
			    var item = getTooltipFromStorage(name);
			    if (!item && (setIfFalse === true || config.setIfFalse && config.setIfFalse === true) ){
				    if (RegisteredTooltips[name]) {
					    var passed = meetsConditions(RegisteredTooltips[name]);
					    if (passed) {
				                markToolTipViewed(name);
						return true;
					    } else {
						    return false
					    }
				    } else {
				        console.log("[!!] No configuration found for: " + name);
					    return false;
				    }	
			    } else {
				    return false;
			    }
			    // TODO: Fallback to cookie
		    } catch(e) {
			console.log("[#!] Error occured searching for (" + name + "):" + e);
		    }
            }

	    // Set the flag for a tooltip
            function markToolTipViewed(name) {
		try {
			if (localStorage) {
				var count = getTooltipFromStorage(name);
				count = count ? Number(count) + 1 : '1';
				localStorage.setItem(name, String(count));
			}
			//TODO: Fallback to cookie
		} catch(e) {
			consle.log("[#!] Error occured setting local storage (" + name + "):" + e);
		}
	    }

            function bindAddMembersSideBarTooltipEvents(){
                // Handlers for the sidebar tooltip
                $('.add-members-tooltip-cta-link').on('click', function(){
                    $('.js-members-add-students-btn').trigger('click');
                    $('.add-members-tooltip-once').addClass('hide-important');
                });
                $('.add-members-tooltip-confirm-btn').on('click',function(){
                    $('.add-members-tooltip-once').addClass('hide-important');
                });
            }
            // Bind default handlers
            function bindEvents(load_events){
                switch(load_events) {
                    case 'add-members-tooltip-once':
                        bindAddMembersSideBarTooltipEvents();
                        break;
                    default:
                        bindAddMembersSideBarTooltipEvents();
                }
            }

	    //Load configuration
	    function loadConfiguration(config){
	        if (config && config.tooltips) {
			RegisteredTooltips = config.tooltips;
		} else {
			RegisteredTooltips = rosterTooltipConfig;
		}
	    } 

	    // Check config for existing tooltip rules
	    function run(config){
		    loadConfiguration(config);
	    }

            this.checkForTooltip = checkForTooltip;
	    this.markTooltipViewed = markToolTipViewed;
	    this.run = run;
            this.bindEvents = bindEvents;
	    

        }

        return new RosterTooltipManager();
    });
