define([
    'jquery',
    'backbone',
    'underscore',
    'fn/foundation.min',
    'modalityAssign/models/group.info.model',
    'modalityAssign/models/group.info.collection',
    'modalityAssign/views/groupList.info.view',
    'modalityAssign/templates/modalityAssign.tmpl',
    'modalityAssign/services/modality.assign.service',
    'modalityAssign/views/googleClassroom.view',
    'modalityAssign/models/googleClassroom.model',
    'common/views/modal.view'
], function ($, Backbone, _,foundation,GroupInfoModel, GroupInfoCollection, GroupListInfoView, TMPL, ModalityAssignService, GoogleClassroomView, GoogleClassroomModel, ModalView) {
    'use strict';

    var ModalityInfoView = Backbone.View.extend({
        context: this,
        checkbox: null,
        groupCollection : "",
        groupVal : {},
        selectAllFlag : false,
        modalityID : "",
        finalModalData : {
        	'groupList' : [],
        	'assignmentName' : ''
        },
        el : 'body',
        events: {
            'click .edit-assign-title' : 'editTitle',
            'click .edit-assign-instruction' : 'editInstruction',
            'click .close-modal' : 'closeMainModal',
            'click .success-btn' : 'closeSuccessModal',
            'click .lin-to-group' : 'closeSuccessModal',
            'blur .bg-instruction' : 'handleNewInstruction',
            'blur .bg-title' : 'handleNewTitle',
            'click .group-select-head' : 'selectAllGroups',
            'click .assign-btn' : 'createAssignment',
            'click .zero-lbl-txt' : 'showNameField',
            'click #createGroup' : 'createGroup',
            'blur #groupName' : 'updateName',
            /*'click .reveal-modal-bg' : 'stopProcess',*/
            'click .load-more-grp' : 'loadMoreGroups',
	    'click .js-platform-select': 'onPlatformSeletion',
            /*'touchstart .reveal-modal-bg' : 'stopProcess'*/
        },
        initialize: function () {
            _.bindAll(this, 'render', 'editInstruction', 'editTitle','handleNewTitle','handleNewInstruction','renderGroups','handleGroups','getGroupData','modalityZeroState','displayNewGroup','createAssignment','loadFinalModal','closeMainModal','closeSuccessModal','stopProcess','getAllGroups','loadMoreGroups');
            /*this.listenTo(this.model, 'change:title', this.changeTitle);
            this.listenTo(this.model, 'change:instruction', this.changeInstruction);*/
            this.model.on('change:title', this.changeTitle, this);
            this.model.on('change:instruction', this.changeInstruction, this);
            this.model.on('change:platform', this.changeInstruction, this);
            this.render();
            this.resetGroupVal();
            this.touchEvent();
        },
        loaderTmpl : '<span class="loadingContent">loading</span><div class="new-spinner"><div class="dot1"></div><div class="dot2"></div></div>',
        myTmpl : _.template(TMPL.MODALINFO),
        successTmpl : _.template(TMPL.SUCCESSINFO),
        render: function () {
        	var tmpl = this.myTmpl({
        		"assignTitle" : this.model.get("title"),
        		"assignInstruction" : this.model.get("instruction")			        		
            });
        	
        	//main rendering of groups/create groups happen in handleGroups function
        	//code for appending this.$el in body and then reveal open
    		if(this.$el.find($("#assignClassModal")).length===0){
    			this.$el.append(tmpl);
    		}
    		this.modalityZeroState();
        	this.$el.find('#assignClassModal .group-tmpl-section').html(this.loaderTmpl);        
        	this.revealModal($("#assignClassModal"));
            return this;
        },
        touchEvent : function(){
        	var that = this;
        	if($("html").hasClass("touch")){
        		$(".reveal-modal-bg").off("touchstart").on("touchstart", function(evt){
        			that.stopProcess(evt);
        		});
        	}else{
        		$(".reveal-modal-bg").off("click").on("click", function(evt){
        			that.stopProcess(evt);
        		});        		
        	}
        },
        resetGroupVal : function(){
        	this.groupVal = {
            	pageNum : 1,
            	limit : 0,
            	activeGroupLength : 0
            }
        },
        modalityZeroState : function(){
        	this.$el.find("#assignClassModal .assign-title").removeClass("hide-imp").html(this.model.get("title"));
        	this.$el.find("#assignClassModal .bg-instruction").removeClass("hide-imp").html(this.model.get("instruction"));
        	this.$el.find("#assignClassModal .edit-assign-title").removeClass("hide-imp");
        	this.$el.find("#assignClassModal .assign-instruction").addClass("hide-imp");
        	this.$el.find("#assignClassModal .edit-assign-instruction").addClass("hide-imp");
        	this.$el.find("#assignClassModal .assign-btn").addClass("hide-imp");
        	this.$el.find("#assignClassModal .bg-title").addClass("hide-imp");
        	this.$el.find("#assignClassModal .load-more-grp").addClass("hide-imp");
        	this.$el.find("#select-all").addClass("disabled");
            this.$el.find("#assignClassModal .assign-btn").addClass("hide-imp");
            this.$el.find("#assignClassModal #assign-platform-selection-container").removeClass('hide-imp');
	        this.$el.find("#assignClassModal .group-info-head").addClass("hide-imp");
	        this.$el.find("#assignClassModal #google-classroom-login-container").addClass("hide-imp");
	        this.$el.find("#assignClassModal .js_google-classroom-groups-container").addClass("hide-imp");
            this.$el.find("#assignClassModal .zero-state").addClass("hide-imp");

        },
        editInstruction: function () {
            var textField = $(".bg-instruction","#assignClassModal"),
            	dataField = $(".assign-instruction","#assignClassModal"),
            	editBtn = $(".edit-assign-instruction","#assignClassModal"),
            	data = this.model.get("instruction");
            
	            textField.val(data);
	            dataField.addClass("hide-imp");
	            editBtn.addClass("hide-imp");
	            textField.removeClass("hide-imp");
        },
        editTitle: function () {
        	$('#error-message').addClass('hide-imp');
        	$('#error-message').html('');
        	var textField = $(".bg-title","#assignClassModal"),
        		dataField = $(".assign-title","#assignClassModal"),
        		editBtn = $(".edit-assign-title","#assignClassModal"),
        		data = this.decodeHTML(this.model.get("title"));
        
		        textField.val(data).removeClass("error-field");
		        textField.focus();
		        dataField.addClass("hide-imp");
		        editBtn.addClass("hide-imp");
		        textField.removeClass("hide-imp");
        },
        handleNewInstruction : function(){
        	var textField = $(".bg-instruction","#assignClassModal"),
	        	dataField = $(".assign-instruction","#assignClassModal"),
	    		editBtn = $(".edit-assign-instruction","#assignClassModal"),
        		val = textField.val();
        	
        		if(val.trim().length > 0 && val.trim().length < 501){
        			this.model.set("instruction",val);
            		textField.addClass("hide-imp");
            		dataField.removeClass("hide-imp");
            		editBtn.removeClass("hide-imp");
            		$("#error-message").addClass("hide-imp");
        		}else{
    	    		if(val.trim().length > 500){
            			$("#error-message").removeClass("hide-imp").html("Instructions can be upto 500 characters long.");    	    			
    	    		}
        		}
        		textField.val("");
        },
        handleNewTitle : function(){
        	var textField = $(".bg-title","#assignClassModal"),
	        	dataField = $(".assign-title","#assignClassModal"),
	    		editBtn = $(".edit-assign-title","#assignClassModal"),
	    		val = textField.val();
	    	
	    		if(val.trim().length > 0 && val.trim().length < 201){
	    			this.model.set("title",val);
	    			textField.removeClass("error-field");
		    		$("#error-message").addClass("hide-imp").html(" ");
	    		}else{
	    			textField.addClass("error-field");
	    			$("#error-message").removeClass("hide-imp").html("Title can be upto 200 characters.");
	    		}
	    		if(this.model.get("title").trim().length != 0){
	    			textField.addClass("hide-imp");
		    		dataField.removeClass("hide-imp");
		    		editBtn.removeClass("hide-imp");     	    				
    			}
        },
        changeTitle : function(){
        	var dataField = $(".assign-title","#assignClassModal");
        		dataField.text(this.model.get("title"));
        },
        changeInstruction : function(){
        	var dataField = $(".assign-instruction","#assignClassModal");
        		dataField.text(this.model.get("instruction"));
        },
        handleCollectionChange : function(){
			var that = this;
        	
			if(!this.selectAllFlag){
				this.disableBtn({
					elem : $('.assign-btn','#assignClassModal'),
					text : "Assign to class(es)"
				});
	        	
	        	this.groupCollection.each(function(groupModel){
	            	if(!groupModel.get("isSelected")){
	        			that.model.set("selectAll",false);
	        			$("#assignClassModal").find(".group-select-head").removeClass("checked");
	        			return false;
	            	}        		
	        	});
	        	
	        	this.groupCollection.each(function(groupModel){
	        		if(groupModel.get("isSelected")){
	        			that.enableBtn({
	        				elem : $('.assign-btn','#assignClassModal'),
	        				text : "Assign to class(es)"
	        			});
	            		return false;
	        		}
	        	});				
			}
        },
        selectAllGroups : function(data){
        	var that = this;
        	this.selectAllFlag = true;
        	if(this.$el.find("#select-all").hasClass("disabled")){
        		return false;
        	}
        	
        	this.model.set("selectAll",!this.model.get("selectAll"));
        	
        	if(this.model.get("selectAll")){
        		$("#assignClassModal").find(".group-select-head").addClass("checked");
        	}else{
        		$("#assignClassModal").find(".group-select-head").removeClass("checked");
        	}	
        	
        	this.groupCollection.each(function(groupModel){
            		if(!groupModel.get("isAssigned") || groupModel.get("isDueDatePassed")){
                		groupModel.set("isSelected",that.model.get("selectAll"));        			
            		}
            });
        	if(this.model.get("selectAll")){
        		that.enableBtn({
    				elem : $('.assign-btn','#assignClassModal'),
    				text : "Assign to class(es)"
    			});
        	}else{
        		this.disableBtn({
					elem : $('.assign-btn','#assignClassModal'),
					text : "Assign to class(es)"
				});
        	}
        	this.selectAllFlag = false;
        },
        handleGroups : function(){
        	if(this.model.get("groupList").length > 0){
        		this.renderGroups();
        	}else{
        		this.renderZeroState();
        	}
        },
        renderGroups : function(){
        	var groupListView = "",
        		groupData = this.getGroupData();
        	
        		this.groupCollection = new GroupInfoCollection(groupData.groupModelList);
        		this.groupCollection.on('change:isSelected',this.handleCollectionChange, this);
        		this.hideZeroState();
        		//handling special case when all the groups already contain this modality (assignment)
         		groupListView = new GroupListInfoView({
        			collection : this.groupCollection
        		});
        		if(this.groupVal.activeGroupLength===0){
            		/*this.disableBtn({
        				elem : $('.assign-btn','#assignClassModal'),
        				text : "Assign to class(es)"        			
            		});*/
            		//$('.assign-btn','#assignClassModal').removeClass("assign-btn");
            		this.$el.find("#select-all").addClass("disabled");
            	}else{
            		this.$el.find("#select-all").removeClass("disabled");
            	}
    			/*this.disableBtn({
    				elem : $('.assign-btn','#assignClassModal'),
    				text : "Assign to class(es)"
    			});*/
        		//change for bug 49472
    			this.handleCollectionChange();
        		this.stopScreenStuck();
         		if(this.groupVal.limit > 0){
         			$(".load-more-grp","#assignClassModal").removeClass("hide-imp");
         		}else{
         			$(".load-more-grp","#assignClassModal").addClass("hide-imp");
         		}
         		$(".content-wrap").addClass("fixPosition");
        },
        getGroupData : function(){
        	var groupList = this.model.get("groupList"),	//this returns array of objects having info about all groups. For create group flow, it returns empty array
        		groupModelList = [],
        		that = this;
        	
        		this.groupVal.activeGroupLength = groupList.length;
        	
        	$.each(groupList, function(index, obj){
        		if(!(obj instanceof GroupInfoModel)){
            		var testModel = new GroupInfoModel({
            			//'isSelected':obj['selected'],
            			'isAssigned':obj['assigned'],
            			'name':that.encodeHTML(obj['name']),
            			'dueDate':obj['due-date']||'',
            			'isDueDatePassed':obj['isDueDatePassed'],
            			'groupID':obj['groupID']
            		});
            		if(obj['assigned'] && !obj['isDueDatePassed']){
            			that.groupVal.activeGroupLength--;
            		}
            		groupModelList.push(testModel);        			
        		}else{
        			if(obj.get('isAssigned') && !obj.get('isDueDatePassed')){
            			that.groupVal.activeGroupLength--;
            		}
        			groupModelList.push(obj);
        		}
        	});
        	
        	this.model.set("groupList",groupModelList);
        	return {
        		"groupModelList" : this.model.get("groupList"),
        		/*"activeGroupLength" : activeGroupLength*/
        	};
        },
        decodeHTML : function(str){	//change for bug 49067
            if (typeof str === "string") {
                str = str.replace(/&amp;/g,"&");
                str = str.replace(/&lt;/g,"<");
                str = str.replace(/&gt;/g,">");
            }
    		return str;
        },
        encodeHTML : function(str){	//change for bug 49067
            if (typeof str === "string") {
                str = str.replace(/&/g, "&amp;");
                str = str.replace(/</g, "&lt;");
                str = str.replace(/>/g, "&gt;");
            }
    		return str;
        },
        renderZeroState : function(){
    		$(".zero-state","#assignClassModal").removeClass("hide-imp");
    		$(".group-select-head","#assignClassModal").addClass("disabled");
    		$(".assign-btn","#assignClassModal").addClass("disabled");        	
    		$(".group-tmpl-section","#assignClassModal").addClass("hide-imp");
    		$(".content-wrap").addClass("fixPosition");
    		this.$el.find("#select-all").addClass("disabled");
        },
        hideZeroState : function(){
    		$(".zero-state","#assignClassModal").addClass("hide-imp");
    		$(".group-select-head","#assignClassModal").removeClass("disabled");
    		$(".assign-btn","#assignClassModal").removeClass("disabled");
    		$(".group-tmpl-section","#assignClassModal").removeClass("hide-imp");
		if (this.model.get('platform') === 'ck12'){
	            this.$el.find("#assignClassModal .assign-btn").removeClass("hide-imp");
		}
    		//this.$el.find("#assignClassModal .assign-btn").removeClass("hide-imp");
    		this.$el.find("#select-all").removeClass("disabled");
        },
        createAssignment : function(){
        	var selectedGroupsList = [],
        		options = {},
        		that = this,
                selected_platform = this.getPlatform(),
        		artifactId;
        	
        	if(this.isScreenStuck()){
        		return;
        	}
        	this.$el.find("#error-message").addClass("hide-imp");
        	this.$el.find(".error-field").removeClass("error-field");
        	that.finalModalData.groupList = [];
            if (selected_platform === 'ck12'){
        	    this.groupCollection.each(function(model){
                    if(!model.get("isAssigned") || model.get("isDueDatePassed")){
                        if(model.get("isSelected")){
                            if(model.get("isDueDatePassed")){
                                model.set("dueDate","");    //if due date is passed, send empty date in request                         
                            }
                            selectedGroupsList.push(model); 
                            that.finalModalData.groupList.push({
                                "groupID" : model.get("groupID"),
                                "groupName" : model.get("name")
                            })
                        }
                    /*that.finalModalData['groupID'] = model.get("groupID");
                    that.finalModalData['groupNames'] = that.finalModalData['groupNames'] + ", " + model.get("name");*/
                    }
                });
            }
        	this.model.set("title",this.decodeHTML(this.model.get("title")));
        	this.finalModalData['assignmentName'] = this.model.get("title");
        	if(selectedGroupsList.length < 1 && this.model.get('platform') ==='ck12'){
        		return false;
                } else if (this.model.get('platform') === 'google_classroom' && !this.GoogleClassroomView.hasSelectedCourse()){
                    return false;
        	}else if(this.model.get("title").trim().length === 0) {
        		this.$el.find('#error-message').removeClass("hide-imp").text("Please enter assignment name.");
        		this.$el.find(".bg-title").addClass("error-field");
        	}else{
        		this.startScreenStuck();
        		this.disableBtn({
    				elem : $('.assign-btn','#assignClassModal'),
    				text : "Assigning..."        			
        		});
        		this.$el.find('#error-message').addClass('hide-imp');
        		options['groupsList'] = selectedGroupsList;
        		options['onCompletionCallback'] = function(response){
        			that.stopScreenStuck();
        			that.enableBtn({
        				elem : $('.assign-btn','#assignClassModal'),
        				text : "Assign to class(es)"
        			});
        			if(response && response.message){
        				if(response.message.indexOf("exists already") > 0){
        					that.model.set('title','');
        					that.editTitle();
        					$(".error-msg","#assignClassModal .title").removeClass("hide-imp").html("Assignment with same name already exists. Please select a different name.");
        					$(".bg-title","#assignClassModal").addClass("error-field");
        				}
        			}
        			else if(response==="error"){
        				console.log("Error in creating a new assignment.");
        			}else{
        				$(".error-msg","#assignClassModal .title").addClass("hide-imp")
        				$(".bg-title","#assignClassModal").removeClass("error-field");
        				that.loadFinalModal(response);
        			}
        		}
        		options['artifactID'] = this.model.get("artifactID") || window.artifactID;	//All window level values need to be tested once
        		options["contextURL"] = this.getContextURL();
				if (options['contextURL'].indexOf('/c/') >= 0 && window.js_collection_data) { //collection aware
					options['collectionHandle'] = window.js_collection_data.collection.handle;
					options['conceptCollectionHandle'] = window.js_collection_data.collection.descendantCollection.handle;
					options['collectionCreatorID'] = window.js_collection_data.collection.creatorID;
				}else{
					//adding collection info with create assignments from book section page
                    var collectionData = null;
					if(window.artifact_json && window.artifact_json.collections && window.artifact_json.collections.length > 0){
						collectionData = window.artifact_json.collections[0];
                    } else if (window.collectionData) {
                        collectionData = window.collectionData;
                    } else if (window.js_collection_data){
                        options['collectionHandle'] = window.js_collection_data.collection.handle;
                        options['conceptCollectionHandle'] = window.js_collection_data.collection.descendantCollection.handle;
                        options['collectionCreatorID'] = window.js_collection_data.collection.creatorID;
                    } else {
                        console.log("No collection context available!");
                    }
                    if (collectionData) {
						options['collectionHandle'] = collectionData.collectionHandle;
						options['conceptCollectionHandle'] = collectionData.collectionHandle + "-::-" + collectionData.conceptCollectionAbsoluteHandle;
						options['collectionCreatorID'] = collectionData.collectionCreatorID;						
					}
				}
				if(options['contextURL'].indexOf('/c/') >= 0 && window.tdCollectionData){ // To check collection info from Teacher dashboard
					options["conceptCollectionHandle"] = window.tdCollectionData.conceptCollectionHandle;
					options["collectionCreatorID"] = window.tdCollectionData.collectionCreatorID || 3;
				}
        		options["assignmentName"] = this.model.get("title");
        		options["instruction"] = this.model.get("instruction");
			if (selectedGroupsList.length < 1 && this.model.get('platform') === 'google_classroom'){
			    this.GoogleClassroomView.createAssignment(options, this.onGoogleAssignCompletionCallback.bind(this));
			} else {
        		    ModalityAssignService.createAssignment(options);
			}
        	}
        },
        getContextURL : function(){
        	var topURL = window.context_url || window.top.location.href.substring((window.top.location.protocol + '//' + window.top.location.hostname).length),
        		isPLIX = topURL.indexOf("geometry-tool") > 0 ? true : false,
        		isSIM = topURL.indexOf("simulations") > 0 ? true : false,
        		that = this;
        	//only for PLIX context URL has to be processed
        	if(isPLIX){
        		/*topURL = topURL.split("&backUrl")[0] + "&noReturn=true";*/
        		  topURL = that.buildUrlForModality(topURL);
        	}
        	if(isSIM){
        		/*topURL = window.location.origin + topURL.split("&backUrl")[0] + "&noReturn=true";*/
        		  topURL = window.location.origin + that.buildUrlForModality(topURL);
        	}
        	return topURL;
        },
        buildUrlForModality : function(url){
        	var newUrl = url.split("&backUrl")[0];
	        	
        		if(newUrl.indexOf("?") > 0){
	        		return newUrl + "&noReturn=true";
	        	}else{
	        		return newUrl + "?noReturn=true";
	        	}
        },
        isScreenStuck : function(){
        	return $("body").hasClass('screen-stuck')?true:false;
        },
        startScreenStuck : function(){
        	$("body").addClass("screen-stuck");
        },
        stopScreenStuck : function(){
        	$("body").removeClass("screen-stuck");
        },
        disableBtn : function(options){
        	var btn = options['elem'],
        		text = options['text'];
        	
    		btn.addClass("disabled grey").removeClass('tangerine').text(text);
        },
        enableBtn : function(options){
        	var btn = options['elem'],
    			text = options['text'];
    	
    		btn.addClass("tangerine").removeClass('disabled grey').text(text); 
        },
        loadFinalModal: function(response){
        	//console.log("Assignment created and assigned successfully!!"); 
        	var successTmpl = "",
        	successTmpl = this.successTmpl({
        		"assignmentName" : this.encodeHTML(this.finalModalData['assignmentName']),
        		"groupList" : this.finalModalData['groupList'],
                "classroomList": this.finalModalData['classroomList'],
        		"serverURL" : window.API_SERVER_URL || ""
        	}),
        	that = this;
        	this.$el.find("#successModal").remove();	//Removing old success tmpl every time it is opened
        	this.$el.append(successTmpl);
        	this.closeMainModal();
        	$(".content-wrap").addClass("fixPosition");
        	setTimeout(function(){
        		that.revealModal($("#successModal"));
        		$(window).scrollTop(0);
        	},500);
        },
        showNameField : function(){
        	var assignModal = $("#assignClassModal");
        	
        	assignModal.find(".zero-state-slect").addClass("hide-imp");
        	assignModal.find(".edit-mode").removeClass("hide-imp");
        	assignModal.find("#groupName").focus();
        	assignModal.find("#createGroup").removeClass("hide-imp");
        	assignModal.find(".group-due").addClass("hide-imp-for-small");
        },
        createGroup : function(e){
        	var title = "", 
        		group = {}, 
        		type = "class";
        	
        	e.preventDefault();
        	if(!$("#createGroup").hasClass("disabled")){
        		 title = $('#groupName').val();
                 title = $.trim(title);
                 $("#error-message").addClass("hide-imp");
                 if (title) {
                     group = {
                         'groupName': title,
                         'groupScope': 'closed',
                         'groupType': type
                     };
                     $("#createGroup").addClass("disabled");
                     $(".loader","#assignClassModal .zero-state").html(this.loaderTmpl).removeClass("hide-imp");
                     $(".loader","#assignClassModal .zero-state").find(".loadingContent").addClass("hide-imp");
                     $("#assignClassModal .zero-state").find(".zero-state-container").addClass("hide-imp");
                     ModalityAssignService.createGroup({
                     	"data" : group,
                     	"onCompletionCallback" : this.displayNewGroup
                     });
                 } else {
                    $(".error-msg","#assignClassModal .zero-state").removeClass("hide-imp").html("Enter a name for your group.For example: Math Geeks Unite!");
                    $(".loader","#assignClassModal .zero-state").html(this.loaderTmpl).addClass("hide-imp");
                 }
        	}
           
        },
        displayNewGroup : function(response){
			var detailsObj = {},
				group = {},
				tempGroup = [];
			
			if(response && response.responseHeader && response.responseHeader.status === 0){
				group = response.response.group;
				detailsObj['name'] = group['name'];
				detailsObj['groupID'] = group['id'];
				detailsObj['due-date'] = '';
				detailsObj['selected'] = '';
				detailsObj['assigned'] = '';
				tempGroup.push(detailsObj);
				this.model.set("groupList",tempGroup);
				this.hideZeroState();
				this.renderGroups();
				this.enableBtn({
					"elem" : $('.assign-btn','#assignClassModal'),
					"text" : "Assign to class(es)"
				})
			}else{
				$(".error-msg","#assignClassModal .zero-state").removeClass("hide-imp").html(response.response.message);
				$("#createGroup").removeClass("disabled");	//To be verified once for createGroup case
				$("#assignClassModal .zero-state").find(".zero-state-container").removeClass("hide-imp");
				console.log("This name group already exists!!");
			}
			$(".loader","#assignClassModal .zero-state").html("").addClass("hide-imp");
        },
        getAllGroups : function(data){
        	
        	var that = this;
        	this.modalityID =  data["id"] || this.modalityID ;
        	ModalityAssignService.getAllGroups({
        		"pageSize" : 10,
        		"pageNum" : data.pageNum,
        		"onCompletionCallback" : processAllGroups
        	});
        	
        	function processAllGroups(response){
            	
            	var resp = {},
            		groups = {},
                    groupIDs = [],
            		detailsObj = {};
            	
            	if(response && response.responseHeader.status === 0){
            		resp = response.response;
            		
            		if(resp.total > 0){
            			that.groupVal.limit = Math.floor((resp.total - (that.groupVal.pageNum-1)*10)/10);
                		if(resp.total%10 === 0){
                			that.groupVal.limit--;
                		}
            			$.each(resp.groups, function(index, val){
                			detailsObj['name'] = val['name'];
                			detailsObj['due-date'] = '';
                			detailsObj['isDueDatePassed'] = false;
                			detailsObj['assigned'] = '';
                			detailsObj['groupID'] = val['id'];
                			//detailsObj['selected'] = '';
                			groups[val['id']] = detailsObj;	//name to be replaced with id
                			detailsObj = {};
                            groupIDs.push(val['id']);
                		});
                		filterAssignedGroups(groups, groupIDs);
            		}else{
            			that.model.set("groupList",[]);	//If no group z present, setting groupList as empty. This is a condition for create group flow
                        /* Call to handlegroups has moved to revealCK12Platform function.
            			that.handleGroups();
                        */
            		}
            	}else{
            		console.log("Error in API!!");
            	}
            }
        	
            function filterAssignedGroups(groups, groupIDs){
            	var allGroups = groups,
            		tempDate = "",
            		groupsList = that.model.get("groupList") || [];
            	
            	ModalityAssignService.getAssignedGroups({
            		"id" : that.modalityID,
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
            	    			detailsObj['assigned'] =isAssignedForRespectiveCollection(val.assignmentDict);
                                detailsObj['groupID'] = val['id'];
            	    			//detailsObj['selected'] = '';
            	    			allGroups[val['id']] = detailsObj;	
            	    			detailsObj = {};
            	    		});
            				
                            for (var i=0; i < groupIDs.length; i++) {
                				groupsList.push(allGroups[groupIDs[i]]);
                			}
                			
            	    		that.model.set("groupList",groupsList);
                			that.handleGroups();	
            	    		
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
                    	today.setHours(0,0,0,0);
                    	if(new Date(tempDate) <= today){
                    		return true;
                    	}
                	}
                	return false;
                }

                function isAssignedForRespectiveCollection(assignmentObj){
                    var conceptCollectionHandle = window.js_collection_data && window.js_collection_data.collection.descendantCollection.handle;
                    if(conceptCollectionHandle){
                        for(var key in assignmentObj){
                            var conceptCollectionHandleArray = assignmentObj[key].eids.map(function(eid){
                                return eid.conceptCollectionHandle;
                            });
                            if(conceptCollectionHandleArray.indexOf(conceptCollectionHandle) >= 0){
                                return true;
                            }
                        }
                        return false;
                    }
                    else{
                        return true;
                    }
                    
                }
            	
            }
        },
        loadMoreGroups : function(){
        	if(this.groupVal.limit > 0){
        		
        		this.$el.find('#assignClassModal .group-tmpl-section').html(this.loaderTmpl);
        		this.$el.find(".load-more-grp","#assignClassModal").addClass("hide-imp");
        		this.startScreenStuck();
        		this.disableBtn({
    				elem : $('.assign-btn','#assignClassModal'),
    				text : "Assign to class(es)"        			
        		});
        		// special loadMore condition
        		this.model.set("selectAll",false);
        		$("#assignClassModal").find(".group-select-head").removeClass("checked");
        		
        		/*this.selectAllGroups({
        			"loadMore" : true
        		});*/
        		this.$el.find("#select-all").addClass("disabled");
        		this.getAllGroups({
        			"pageNum" : ++this.groupVal.pageNum
        		});
        	}
        },
        updateName : function(){
        	$(".error-msg","#assignClassModal").addClass("hide-imp");
        },
        revealModal : function(modal){
        	$(modal).foundation("reveal","open");
        },
        closeMainModal : function(evt){
        	if(this.isScreenStuck()){
            	evt.stopPropagation();
            	evt.preventDefault();        		
        	}else{
        		this.closeModal($("#assignClassModal"));        		
        		this.model.destroy();
        	}
        	$(".content-wrap").removeClass("fixPosition");
        	$('.error-msg').html('');
        	$('.error-msg').addClass('hide-imp');
        	$('#select-all').removeClass('checked');
        	this.closeDatePicker();
        },
        closeDatePicker : function(){
        	$(".ui-datepicker").css({
        		'display' : 'none'
        	});
        },
        closeSuccessModal : function(){
        	$(".content-wrap").removeClass("fixPosition");
        	this.closeModal($("#successModal"));
        },
        closeModal : function(modal){
        	$(modal).foundation("reveal","close");
        	window.setTimeout(function(){
            	if($(".reveal-modal-bg").css("display")!=="none"){
                	$(".reveal-modal-bg").css("display","none");        		
            	}        		
        	},200);
        },
        stopProcess : function(evt){
        	if(this.isScreenStuck()){
            	evt.stopPropagation();
            	evt.preventDefault();        		
        	}else{	//it means user wants to close current modal. A new model is created everytime.
        		this.model.destroy();
        	}
        	$(".ui-datepicker").css({
        		"display":"none"
        	});
        	//console.log("clicked on main screen");
        },
	// Changes for Google classroom
	hidePlatformSelectionContainer : function(){
            $('#assign-platform-selection-container').addClass('hide-imp');
	},
	revealCK12Platform : function(){ 
	    this.hidePlatformSelectionContainer();
        this.handleGroups();
            this.$el.find(".load-more-grp","#assignClassModal").addClass("hide-imp");
            this.$el.find(".load-more-gclasses","#assignClassModal").addClass("hide-imp");
	    this.$el.find("#assignClassModal .assign-btn").removeClass("hide-imp");
	    this.$el.find("#assignClassModal .group-info-head").removeClass("hide-imp");
	},
	revealGooglePlatform : function(){
	    this.hidePlatformSelectionContainer();
                if(!this.GoogleClassroomView) {
                    this.GoogleClassroomView = new GoogleClassroomView({
                        el: '#assignClassModal',
                        model: new GoogleClassroomModel()
                    });
		    this.GoogleClassroomView.on('disableBtn', this.disableBtn);
		    this.GoogleClassroomView.on('enableBtn', this.enableBtn);
		    this.GoogleClassroomView.on('assignDone', this.onGoogleAssignCompletion);
                } else {
                        this.GoogleClassroomView.initialize();
                }
	},
    getPlatform: function(){
        return this.model.get('platform');
    },
	onPlatformSeletion: function(e) {
	    e.stopPropagation();
	    e.preventDefault();
	    var platform = e.currentTarget.getAttribute('data-platform');
	    this.model.set('platform', platform);
	    console.log(platform + ": platform was selected");
	    if (platform === 'ck12'){
	        this.revealCK12Platform();
	    } else if (platform ==='google_classroom'){
                this.revealGooglePlatform();
	    } else if (platform ==='more'){

	    } else {
		console.log("Unrecognized selection: "+ platform);
	    }	
	},
	onGoogleAssignCompletionCallback: function(response) {
	    this.stopScreenStuck();
	    this.enableBtn({
		    elem : $('.assign-btn','#assignClassModal'),
		    text : "Assign to classroom"
	    });
	    if(response && response.message){
		    if(response.message.indexOf("exists already") > 0){
			    this.model.set('title','');
			    this.editTitle();
			    $(".error-msg","#assignClassModal .title").removeClass("hide-imp").html("Assignment with same name already exists. Please select a different name.");
			    $(".bg-title","#assignClassModal").addClass("error-field");
		    }
	    }
	    else if(response.status ==="error"){
            var error_message = JSON.stringify(response);
            console.error("Error creating assignment for Google Classroom", error_message);
            this.$el.find("#successModal").remove();
            this.closeMainModal();
            //window.showGCAerror = function(){$('#gcaerror').text(error_message);};
            //ModalView.alert("<p>Failed to create asssignment. Please try again later.</p> <a onClick='showGCAerror()'>Show Error</a>\n<p id='gcaerror'></p>" ,null,true);
            ModalView.alert("<p>Failed to create asssignment. Please try again later.</p>" ,null,true);
	    }else{
		    $(".error-msg","#assignClassModal .title").addClass("hide-imp")
		    $(".bg-title","#assignClassModal").removeClass("error-field");
            this.finalModalData['classroomList'] = response.successGroups;
		    this.loadFinalModal(response);
	    }
	}

    });
    return ModalityInfoView;
});
