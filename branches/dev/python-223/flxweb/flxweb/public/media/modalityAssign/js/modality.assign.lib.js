define([
    'jquery',
    'modalityAssign/models/modality.info.model',
    'modalityAssign/views/modality.info.view',
    'modalityAssign/services/modality.assign.service',
    'flxweb.settings'
], function ($, ModalityInfoModel, ModalityInfoView, ModalityAssignService, Settings) {
    'use strict';
    
    var data = {
    		'conceptId' : '',
    		'type' : '',
    		'id' : window.artifactID || ''
    },
    modalityView = "",
    modalityData = "",
    dataDone = $.Deferred(),
    cdnurl = null;
  
    // Get the prefix for the url of this JS file - to determine the CDN prefix, if any.
    function getCDNUrl() {
        if (cdnurl != null) {
            return cdnurl;
        }
        cdnurl = '';
        try {
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src.indexOf('modality.assign.lib.js') !== -1) {
                    cdnurl = scripts[i].src.replace(/modalityAssign\/js\/modality\.assign\.lib\.js([\?|#|&].+)?/, '');
                    break;
                }
            }
        } catch (e) {
            console.log("Could not get cdnurl. Falling back to: " + cdnurl);
        }
        console.log("cdnurl: " + cdnurl);
        return cdnurl;
    }

    function createStyleSheet(){
    	var elem1 = document.createElement("link"),
            elem2 = document.createElement("link");
        // For sims - just get the url from JS
        var staticPrefix = (window.location.href.indexOf("/simulations/") !== -1) ? getCDNUrl() : $.flxweb.settings.url_media;
        staticPrefix = /\/$/.test(staticPrefix) ? staticPrefix : staticPrefix + '/';
        console.debug("staticPrefix: " + staticPrefix);
    	$(elem1).attr({
    		"rel" : "stylesheet",
    		"href" : staticPrefix + "modalityAssign/css/modality.assign.css"
    	});
    	$(elem2).attr({
    		"rel" : "stylesheet",
    		"href" : staticPrefix + "common/css/fontck12.css"
    	});
    	$("head").append($(elem1));
    	$("head").append($(elem2));
        if (window.location.href.indexOf("/simulations/") !== -1) {
            /*These two files are already available in FLXWEB, but prepending because these files are missing in SIM*/
            var elem3 = document.createElement("link"),
                elem4 = document.createElement("link");
            $(elem3).attr({
                "rel" : "stylesheet",
                "href" : staticPrefix + "lib/jquery-ui/css/jquery-ui-1.8.17.custom.css"
            });
            $(elem4).attr({
                "rel" : "stylesheet",
                "href" : staticPrefix + "lib/foundation/foundation.min.css"
            });

            $("head").prepend($(elem3));
            $("head").prepend($(elem4));
        }
        //change for bug 49316
        $('<meta>', {name: 'viewport',content: 'width=device-width, initial-scale=1.0'}).appendTo('head');
    }
    
    createStyleSheet();
    
    function init(options){
    	//this.data = data;	//this is yet to be corrected once we receive right API data
    	var encodedId;
    	if(options){
    		window.title = options.title;
    		if(options.artifactID){
    			data.id = options.artifactID;
    		}
    		window.context_url = options.context_url || null;
            window.collectionData = options.collectionData || null;
    	}else{
    		data.id = window.artifactID;
    		window.context_url = null ;
    	}
    	if(options){
    		initializeModal(options);
    	}else{
    		initializeModal();
    	}
    	
    	/*getAllGroups({
    		"pageNum" : pageNum
    	});*/
    	if(window.encodedId){
			encodedId = window.encodedId;
		}else if(window.artifact_json && window.artifact_json.domain && window.artifact_json.domain.encodedID){
			encodedId =  window.artifact_json.domain.encodedID;
		}else if( typeof(js_modality_data) !== "undefined"  && js_modality_data.artifact.domain.encodedID){
			encodedId = js_modality_data.artifact.domain.encodedID;
		}else{
			encodedId = "";
		}
			var payload = {
		        	"memberID": window.ads_userid || '',
		        	"action_type" : "link" ,
		        	"action_name" : "assign",
		        	"screen_name" : "modality_details",
		        	"artifactID" :  window.artifactID,
		        	"context_eid" : encodedId || ''
        	}
			window.dexterjs.logEvent('FBS_ACTION', payload);
    }
    
    function initializeModal(options){
    	var assignmentData = "";
    	
    	assignmentData = getAssignmentData();
    	if(options && options.title){
    		assignmentData.title = options.title;
    	}
    	if(options && options.artifactID){
    		assignmentData.artifactID = options.artifactID;
    	}
    	modalityData = new ModalityInfoModel(assignmentData);
    	
    	if(!modalityView){
        	modalityView = new ModalityInfoView({
        		'model' : modalityData
        	});    		
    	}else{
    		modalityView.model.set(modalityData);
    		modalityView.initialize();
    	}
    	modalityView.getAllGroups({
    		"pageNum" : 1,
    		"id" : data["id"]
    	});
    	console.log(modalityView);
    }
    
    function getAssignmentData(data){
    	return ModalityAssignService.getAssignmentInfo();
    }
    
    /*function getAllGroups(data){
    	ModalityAssignService.getAllGroups({
    		"pageSize" : 10,
    		"pageNum" : data.pageNum,
    		"onCompletionCallback" : processAllGroups
    	});
    }
    
    function processAllGroups(response){
    	
    	var resp = {},
    		groups = {},
    		detailsObj = {};
    	
    	if(response && response.responseHeader.status === 0){
    		resp = response.response;
    		
    		if(resp.total > 0){
        		$.each(resp.groups, function(index, val){
        			detailsObj['name'] = val['name'];
        			detailsObj['due-date'] = '';
        			detailsObj['isDueDatePassed'] = false;
        			detailsObj['assigned'] = '';
        			detailsObj['groupID'] = val['id'];
        			//detailsObj['selected'] = '';
        			groups[val['id']] = detailsObj;	//name to be replaced with id
        			detailsObj = {};
        		});
        		filterAssignedGroups(groups);
    		}else{
    			modalityView.model.set("groupList",[]);	//If no group z present, setting groupList as empty. This is a condition for create group flow
    			handleGroups();
    		}
    	}else{
    		console.log("Error in API!!");
    	}
    }
    
    function filterAssignedGroups(groups){
    	var allGroups = groups,
    		tempDate = "",
    		groupsList = [];
    	
    	ModalityAssignService.getAssignedGroups({
    		"id" : data["id"],
    		"onCompletionCallback" : function(response){
    			var groups = [],
    				detailsObj = {},
    				resp = "";
    			if(response && response.response){
    				resp = response.response;
    	    		$.each(resp.groups, function(index, val){
    	    			detailsObj['name'] = val['name'];
    	    			detailsObj['due-date'] = getDueDate(val.assignmentDict);
    	    			detailsObj['isDueDatePassed'] = hasDueDatePassed();
    	    			detailsObj['assigned'] = true;	//This API returns all assignments which are already assigned to this group so this must be true
    	    			detailsObj['groupID'] = val['id'];
    	    			//detailsObj['selected'] = '';
    	    			allGroups[val['id']] = detailsObj;	//name to be replaced with id
    	    			detailsObj = {};
    	    		});
    				
    	    		for(var key in allGroups){
        				groupsList.push(allGroups[key]);
        			}
        			
    	    		modalityView.model.set("groupList",groupsList);
        			handleGroups();	
    	    		
    			}else{
    				console.log("Error in API!!");
    			}
    		}
    	});
        
    	function getDueDate(assignmentObj){
    		for(var key in assignmentObj){
        		tempDate = assignmentObj[key].due;
        	}
    		if(tempDate){
        		tempDate = new Date(tempDate);
        		return (parseInt((tempDate.getMonth()+1)/10)? tempDate.getMonth()+1 : "0" + (tempDate.getMonth()+1)) + "/" + tempDate.getDate() + "/" + tempDate.getFullYear();    			
    		}
    		return "";
        }
        
        function hasDueDatePassed(){
        	if(tempDate){
            	var today = new Date();
            	if(new Date(tempDate) < today){
            		return true;
            	}
        	}
        	return false;
        }
    	
    }
    
	function handleGroups(){
		modalityView.handleGroups();
	}*/
    
    return {
    	"init" : init
    };
});
