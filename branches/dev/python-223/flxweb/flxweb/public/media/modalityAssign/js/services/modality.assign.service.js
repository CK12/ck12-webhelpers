define(['jquery',
  'backbone',
  'common/utils/utils'
], function($, Backbone,Utils) {
  
  "use strict";

  var modalityAssignService = Backbone.Model.extend({

	defaults:{
		'title' : '',
		'instruction' : '',
		'groups': ''
	},  
	  
    initialize: function(){
    	 _.bindAll(this,'getAllGroups','getAssignmentInfo','getAssignedGroups');
    },
    
    getAllGroups: function(data){
 		 var API_SERVER_URL = window.API_SERVER_URL || '',
 		 	 url = API_SERVER_URL + '/flx/group/my?groupType=class&filters=myRole,admin&sort=d_creationTime&pageNum='+data.pageNum+"&pageSize="+data.pageSize;
 		 
 		 Utils.ajax({
	          'url': url,
              'xhrFields': {
                  'withCredentials': true
              },
              'crossDomain': true,
	          'success': function (response) {
	              data.onCompletionCallback(response); 
	          },
	          'error': function (error) {
	        	  data.onCompletionCallback(error);
	          }
	      });
     },
     
     getAssignedGroups : function(details){
    	 var API_SERVER_URL = window.API_SERVER_URL || '',
	 	 	 modalityId = details['id'],
	 	 	 url = "",
	 	 	 that = this;
    	 
    	 	 url = API_SERVER_URL + '/flx/get/my/'+modalityId+'/groups';
    	 
    	 	Utils.ajax({
  	          'url': url,
              'xhrFields': {
                  'withCredentials': true,
              },
              'cache' : false,
              'crossDomain': true,
  	          'success': function (response) {
  	        	 details.onCompletionCallback(response);
  	          },
  	          'error': function (error) {
  	        	  details.onCompletionCallback(error);
  	          }
  	      });
     },
     
     getAssignmentInfo : function(onCompletionCallback){
 		 var API_SERVER_URL = window.API_SERVER_URL || '',
		 	 url = API_SERVER_URL + '';
 		 
 		 return {
 	 		'title' : processTitle(getModalityTitle()),
 			'instruction' : this.get('instruction'),
 			'groupList' : this.get('groups')
 		 };
 		 
 		 
        function getModalityTitle() {
            // Modality details page
            var title = $('.modalitycontentwrap .title') && $('.modalitycontentwrap .title').first().text().trim();
            // PLIX
            if (!title) {
                title = $('h1#title') && $('h1#title').first().text().trim();
            }
            if (!title) {
                title = window.title;
            }
            return encodeHTML(title);
        }
        
        function encodeHTML(str){
            if (typeof str === "string") {
                str = str.replace(/&/g, "&amp;");
                str = str.replace(/</g, "&lt;");
                str = str.replace(/>/g, "&gt;");
            }
    		return str;
    	}

 	    function processTitle(title){
 	    	var topURL = window.top.location.pathname,
 			isPLIX = topURL.indexOf("geometry-tool") !== -1 ? true:false,
 			isSIM = topURL.indexOf("simulations") !== -1 ? true:false,
 			tempIndex = "";
 	    	
 	    	if(isPLIX){
 	    		tempIndex = title.lastIndexOf("Plix");
 	    		if(tempIndex > 0)
 	    		title = title.substring(0,tempIndex).trim();    		
 	    	}else if(isSIM){
 	    		tempIndex = title.lastIndexOf("Interactive");
 	    		if(tempIndex > 0)
 	    		title = title.substring(0,tempIndex).trim();
 	    	}else{
 	    		tempIndex = title.lastIndexOf("By");
 	    		if(tempIndex > 0)
 	    		title = title.substring(0,tempIndex).trim();
 	    	}
 	    	return title;
 	    }
 		 
     },
     
     createAssignment : function(options){
 		 var API_SERVER_URL = window.API_SERVER_URL || '',
 		 	 data = {},
 		 	 that = this,
 		 	 url = API_SERVER_URL + '/flx/create/assignment';
 		 
	 		 data["concepts"] = options["artifactID"] + "|" + encodeURIComponent(options["contextURL"]);
			 if (options.conceptCollectionHandle) {
				data["concepts"] += "|" + options.conceptCollectionHandle + 
					"|" + (options.collectionCreatorID || '3'); //default collection collection creator ID
			 }
	 		 data["name"] = options["assignmentName"];
	 		 if(options["instruction"]){
	 			data["description"] = options["instruction"];
	 		 }
 		 
	 		 Utils.ajax({
		          'url': url,
		          'data' : data,
		          'type': 'POST',
                  'xhrFields': {
                    'withCredentials': true
                  },
                  'crossDomain': true,
		          'success': function (response) {
		        	  if(response && response.response && response.response.assignment){
			        	  var miniOptions = {
			        			  //"studyTrackID" : response.response.assignment.studyTracks[0].id,
			        			  "assignmentID" : response.response.assignment.id,
			        			  "groupsList" : options["groupsList"],
			        			  "onCompletionCallback" : options["onCompletionCallback"]
			        	  }
			        	  that.assignAssignment(miniOptions); 		        		  
		        	  }else{
		        		  options.onCompletionCallback(response.response);
		        		  console.log("Please change assignment name. Same name of assignment already exists"); 
		        	  }
		          },
		          'error': function (error) {
		        	  options.onCompletionCallback("error");
		          }
		     });    	 
     },
     
     assignAssignment : function(options){
 		 var API_SERVER_URL = window.API_SERVER_URL || '',
 		 	 data = {},
 		 	 responseCounter = options["groupsList"] && options["groupsList"].length,
 		 	 successCounter = 0,
 		 	 ajaxURL = [],
 		 	 finalResponse = [],
 		 	 url = API_SERVER_URL + '/flx/assign/assignment';

 		 	//data["studyTrackID"] = options["studyTrackID"];
 		 	data["assignmentID"] = options["assignmentID"];
 		 	data["groupsList"] = options["groupsList"];	//This list contains array of groups in the format {"groupID":"","dueDate":""}
 		 
 		 	if(responseCounter){
 	 		 	$.each(data["groupsList"], function(index,value){
 	 		 		//ajaxURL[index] = url + "/" + data["studyTrackID"] + "/" + value.get("groupID");
 	 		 		ajaxURL[index] = url + "/" + data["assignmentID"] + "/" + value.get("groupID");
 	 		 		if(value.get("dueDate")){ //format: yyyy-mm-dd or yyyy-m-dd or yyyy-m-d or allow empty value in due date
 	 		 			ajaxURL[index] = ajaxURL[index] + "?due="+ value.get("dueDate");
 	 		 		}
 	 		 		Utils.ajax({
 	 			          'url': ajaxURL[index],
                          'xhrFields': {
                              'withCredentials': true
                          },
                          'crossDomain': true,
 	 			          'success': function (response) {
 	 			        	  successCounter++;
 	 			        	  if(successCounter === responseCounter){
 	 			        		 options.onCompletionCallback("success");
 	 			        	  }
 	 			          },
 	 			          'error': function (error) {
 	 			        	 successCounter++;
 	 			        	 if(successCounter === responseCounter){
 				        		 options.onCompletionCallback("error");
 				        	 }
 	 			          }
 	 			    });    	 
 	 		 	
 	 		 	}); 		 		
 		 	}else{
 		 		console.log("No groups were selected!!");
 		 	}
      	}, 
      	createGroup : function(options){
      		 var API_SERVER_URL = window.API_SERVER_URL || '',
 		 	 data = options.data,
 		 	 that = this,
 		 	 url = API_SERVER_URL + '/flx/create/group';
      		 
	 		 Utils.ajax({
		          'url': url,
		          'data' : data,
		          'type': 'POST',
                  'xhrFields': {
                      'withCredentials': true
                  },
                  'crossDomain': true,
		          'success': function (response) {
		        	  options.onCompletionCallback(response);
		          },
		          'error': function (error) {
		        	  options.onCompletionCallback(error);
		          }
		     });   
      	}
     

  });

  return new modalityAssignService();
});
