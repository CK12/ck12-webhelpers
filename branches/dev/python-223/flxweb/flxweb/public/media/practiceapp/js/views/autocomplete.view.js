define([
    'jquery',
    'underscore',
    'practiceapp/views/appview'
],
function($, _, AppView){
	'use strict';
	
	function checkEid(encodedID){
		encodedID = encodedID || "";
		
		if(subjectEids.indexOf(encodedID.slice(0,3)) > -1){
			return true;
		}
		
		return false;
	}
	
	var onSelectHandler = null,
		searchService = null,
		cache = {},
		subjectEids = "",
    	AutoCompleteView = AppView.extend({
	    	initialize : function(options){
	    		var autoCompeleteItem = null,
	    			artifactType = "";
	    		
	    		onSelectHandler = options.success; //this will be called when user selects an option
	    		searchService = options.search; //function to call for search
	    		artifactType = options.artifactType || "domain";
	    		subjectEids = options.subjectEid || ['SCI', 'MAT'];
	    		
	    		if(subjectEids instanceof Array){
	    			subjectEids = subjectEids.join(",");
	    		}
	    		this.$el.autocomplete({
	        		"delay" : 500,
	        		"source" : function(request, response){
	        			var term = $.trim(request.term);
	        			
	        			if(term === ""){
	        				$(".hint-loader").removeClass("active");
	        				return;
	        			}
	        			
	        			if(cache.hasOwnProperty(term)){
	        				$(".hint-loader").removeClass("active");
        					response(cache[term]);
        					return;
        				}
	        			
	        			searchService({
	        				"term" : term,
	        				"artifactType" : artifactType,
	        				"data" : {
	        					"pageSize" : 5
	        				}
	        			}).done(function(data){
	        				var suggestion = (data && data.hits) || [],
	        					term = $.trim(request.term),
	        					pattern = new RegExp(term, 'gi'),
                                len, index;

        					for (var i = 0; i < suggestion.length; i++) {
        						if(checkEid(suggestion[i].encodedID)){
        							suggestion[i].title = suggestion[i].title.replace(/\sPractice$/i, "");
                                    suggestion[i].label = suggestion[i].title.replace(pattern, '<strong>$&<\/strong>');
                                    if (suggestion[i].title.toLowerCase().indexOf(term.toLowerCase()) >= 0) {
                                        continue;
                                    } else if (suggestion[i].cctitles && (len = suggestion[i].cctitles.length)) {
                                        for (index = 0; index < len; index++) {
                                            if (suggestion[i].cctitles[index].toLowerCase().indexOf(term.toLowerCase()) >= 0) {
                                                suggestion[i].label = suggestion[i].cctitles[index].replace(pattern, '<strong>$&<\/strong>');
                                                break;
                                            }
                                        }
                                    }
        						}else{
        							suggestion.splice(i, 1);
        							i = i - 1;
        						}
                            }
        					
            				cache[term] = suggestion;
            				response(suggestion);
	        			});
	        		},
	        		"select" : function(event, ui){
	        			this.value = ui.item.value;
	        			$("#concepts-wrapper").removeClass("blurred");
	        			onSelectHandler();
	        		},
	        		"focus": function(event, ui) {
                        var index, len;
                        ui.item.value = ui.item.title; //default
                        if (ui.item.title.toLowerCase().indexOf($(this).val().toLowerCase()) >= 0) {
                            //skip nothing to do
                        } else if (ui.item.cctitles && (len = ui.item.cctitles.length)) {
                            for (index = 0; index < len; index++) {
                                if (ui.item.cctitles[index].toLowerCase().indexOf($(this).val().toLowerCase()) >= 0) {
                                    ui.item.value = ui.item.cctitles[index];
                                    break;
                                }
                            }
                        }
	                    $('.li-focus').removeClass('li-focus');
	                    $('.li-active-class').removeClass('li-active-class');
	                    $('.ui-state-focus').parent('li').addClass('li-focus');
	                    $('.ui-state-focus').add('.ui-state-hover').parent('li').addClass('li-active-class');
	                },
	                "open" : function(){
	                	var target = $('.ui-autocomplete'),
	                		height = 0;
	                	
	                	target.height("auto");

	                	height = target.height();
	                	
	                	target.height(0);
	                	target.height(height);
	                	
	                	$("#concepts-wrapper").addClass("blurred");
	                	$(".hint-loader").removeClass("active");
	                },
	                "close" : function(){
	                	$('.ui-autocomplete').height("auto");
	                	$("#concepts-wrapper").removeClass("blurred");
	                	if($.trim($(this).val()) !== ""){ //bug #38177
	                		$(".ui-widget.ui-autocomplete").css("display","inline-block");
	                	}
	                },
	                "search" : function(){
	                	$(".hint-loader").addClass("active");
	                },
	                "response" : function(){
	                	$(".hint-loader").removeClass("active");
	                }
	        	});
	    		
	    		if(this.$el.data()) {
	                autoCompeleteItem = this.$el.data('ui-autocomplete') || this.$el.data('autocomplete');
	                autoCompeleteItem._renderItem = function(ul, item) {
	                    var re = new RegExp('^' + this.term);
	                    return $('<li class="autocomplete-list"></li>')
	                        .data('item.autocomplete', item)
                                .append('<i class="icon-search"></i><a class="autocomplete-link left">' + item.label + '</a>')
	                        .appendTo(ul);
	                };
	            }
	    	}
    });
    
    return AutoCompleteView;
});
