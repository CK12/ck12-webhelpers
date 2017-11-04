define([
    'backbone',
    'jquery',
    'common/views/modal.view',
    'modalityAssign/templates/modalityAssign.tmpl',
    'common/utils/utils',
    'modalityAssign/views/groupList.info.view',
    'modalityAssign/models/googleClassroom.course.info.model',
    'modalityAssign/models/googleClassroom.collection'
], function(Backbone, $, ModalView, TMPL, Util, GroupListInfoView, GoogleCourseInfoModel, GoogleGroupInfoCollection) {
    'use strict';
    var GoogleClassroomView = Backbone.View.extend({
        groupCollection:"",
        successAssignments:[],
        failedAssignments:[],
        state: {
            pageNum: 1,
            pageSize: 10,
            initialLaunch: true,
        },
	enableAssignBtnOptions: {
	    elem : '#assignClassModal .assign-btn',
	    text : "Assign to classroom"
	},
        events: {
            'click #googleclassroom_auth_link': 'handleGAuth',
            'click #gclassroom_courses_drop li': 'onCourseSelect',
            'click .load-more-gclasses': 'loadMoreCourses',
            'click #select-all': 'handleSelectAll'
        },
        initialize: function(){
            _.bindAll(this, "render", "onAuthFail", "authSuccess", "authURLSuccess", "authURLFailure", "checkWindowStatus", "handleGAuth");
            this.render();
            this.resetState();
            this.model.off("authFail").on("authFail", this.onAuthFail);
            this.model.off("authSuccess").on("authSuccess", this.authSuccess);
            this.model.off("authURLSuccess").on("authURLSuccess", this.authURLSuccess);
            this.model.off("authURLError").on("authURLError", this.authURLFailure);
            this.model.off("loadCoursesSuccess").on("loadCoursesSuccess", this.onLoadCoursesSuccess, this);
            this.model.off("courseAssignSuccess").on("courseAssignSuccess", this.onCourseAssignSuccess, this);
            this.model.off("courseAssignFailure").on("courseAssignFailure", this.onCourseAssignFailure, this);
        },
        resetState: function(){
            this.groupCollection = "";
            this.successAssignments = [];
            this.failedAssignments = [];
            _.extend(this.state, this.model.defaults());
        },
        render: function() {
            this.checkGoogleClassroomAuth();
        },
        pageChange: function(data) {
            this.state.pageNum = data.pageNum;
            this.loadGoogleClassroomCourses();
        },
        getLoadedGroupsTotal: function(){
            return (this.state.pageNum * this.state.pageSize);
        },
        setInitialLaunchFalse: function(){
            this.state.initialLaunch = false;
        },
        getState: function(){
            var state = {
                pageNum : this.state.pageNum,
                pageSize : this.state.pageSize,
                initialLaunch: this.state.initialLaunch
            };
            return state;
        },
        hasSelectedCourse: function(){
            return this.groupCollection.where({isSelected: true}).length > 0;
        },
        getSelectedCourses: function(){
            return this.groupCollection.where({isSelected: true});
        },
        isClassroomAuthLinkSet: function(){
            return this.$('.js_googleclassroom_auth_link').data('href_set') === true;
        },
        setClassroomAuthLinkFlag: function(flag){
            $('.js_googleclassroom_auth_link').data('href_set', flag);
        },
        checkGoogleClassroomAuth: function() {
            this.model.gClassroomAuthStatus();
        },
        getGoogleAuthURL: function() {
            this.model.getGoogleAuthURL();
        },
        hideGoogleAuthURL: function(){
            this.$('#googleclassroom_auth_link').addClass('hide-imp');
        },
        showAssignButton: function() {
            $(".assign-btn","#assignClassModal").removeClass("hide-imp");
        },
        showGroupsContainer: function() {
            this.$('.js_google-classroom-groups-container').removeClass('hide-imp');
        },
        showLoadMore: function() {
            console.log("Need to show load more");
            this.$el.find(".load-more-gclasses","#assignClassModal").removeClass("hide-imp");
        },
        hideLoadMore: function() {
            this.$el.find(".load-more-gclasses","#assignClassModal").addClass("hide-imp");
        },
        checkSelectAll: function() {
            this.$el.find('#select-all').addClass('checked');
        },
        unCheckSelectAll: function() {
            this.$el.find('#select-all').removeClass('checked');
        },
        showZeroGroupState: function() {
            var zero_state_msg = '<p>No active classes found. Please go to your <a href="https://classroom.google.com" target="_blank">Google Classroom</a> account to manage your classes.</p>';
            this.$('.js_google-classroom-groups-container')
                .html(zero_state_msg);
            this.showGroupsContainer();
            return;
        },
        updateGroupCollection: function(courses) {
            if (!this.groupCollection) {
                this.groupCollection = new GoogleGroupInfoCollection(courses);
                this.groupCollection.on('change:isSelected',this.onCourseSelect, this);
            } else {
              var addition = new GoogleGroupInfoCollection(courses);
              if ( addition && addition.models) {
                  this.groupCollection.add(addition.models);
              }
            }
        },
        getAssignmentResults: function(){
            if (this.successAssignments.length === 0){
                return {'status':'error', 'failedGroups': this.failedAssignments};
            } else {
                return {'status':'success','successGroups': this.successAssignments, 'failedGroups': this.failedAssignments};
            }

        },
        preAssignmentCreation: function(){
            this.successAssignments = [];
            this.failedAssignments = [];
        },
        postAssignmentCreations: function(callback){
            console.log("Processed all courses");
            var that = this;
            var assign_complete = setInterval( function(){
                if(that.allCoursesProcessed()){
                    clearInterval(assign_complete);
                    var results = that.getAssignmentResults();
                    callback(results);
                }
            }, 2000);
        },
        allCoursesProcessed: function(){
            var processedCount = (this.successAssignments.length + this.failedAssignments.length );
            return (this.getSelectedCourses().length === processedCount);
        },
        onCourseAssignSuccess: function(data){
            if (data && data.response) {
                var response = data.response;
                if (response.lmsAssignment && response.lmsAssignment.alternateLink){
                    this.successAssignments.push({'url': response.lmsAssignment.alternateLink,
                                                  'name': data.lmsGroupName});
                } else{
                    this.successAssignments.push({'ur':'https://classroom.google.com/',
                                                  'name': data.lmsGroupName});
                }
            }
            
            if (this.allCoursesProcessed()){
            }
        },
        onCourseAssignFailure: function(data){
            this.failedAssignments.push(data);
            if (this.allCoursesProcessed()){
                
            }
        },
        onAuthFail: function() {
            if (!this.isClassroomAuthLinkSet()){
                this.getGoogleAuthURL();
            }
            this.$('.js_google-classroom-groups-container').addClass('hide-imp');
            this.$('.js_google-classroom-login-container').removeClass('hide-imp');
        },
        loadGoogleClassroomCourses: function() {
            var params = {};
            params = {
                    'pageNum': this.state.pageNum,
                    'pageSize': this.state.pageSize
            };
            this.model.loadGoogleClassroomCourses(params);
        },
        htmlEscapArtifactTitle : function(artifactTitle){
            artifactTitle = artifactTitle.replace(/(\r\n|\n|\r)/gm," ");
               var display_title=artifactTitle.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
               return {'artifact_title' : artifactTitle,
                        'display_title' : display_title}
        },
        authSuccess: function() {
	    console.log("Auth success!!! now load my courses");
	    //$(".assign-btn","#assignClassModal").removeClass("hide-imp");
	    this.trigger('disableBtn',
		    { elem: $(this.enableAssignBtnOptions.elem),
		      text: this.enableAssignBtnOptions.text}
	    );
            this.loadGoogleClassroomCourses();
        },
        authURLSuccess: function(data) {
            var state = this.getState();
            if (data.response.googleAuthURL) {
                this.$('.js_googleclassroom_auth_link').attr('href', data.response.googleAuthURL);
                this.setClassroomAuthLinkFlag(true);
                this.$('.js_google-classroom-groups-container').addClass('hide-imp');
                this.$('.js_google-classroom-login-container').removeClass('hide-imp');
                if (state && state.initialLaunch && state.initialLaunch === true) {
                    this.setInitialLaunchFalse();
                    this.$('.js_googleclassroom_auth_link').click();
                }

            }
        },
        authURLFailure: function(data){
            this.setClassroomAuthLinkFlag(false);
            console.log(data);
            this.hideGoogleAuthURL();
            this.$('#googleclassroom_error').removeClass('hide-imp');
        },
        checkWindowStatus: function(gauth_win) {
            // gauth_win may be undefined if popup blocked by browser
            if (!gauth_win || gauth_win.closed) {
                return true;
            }
            return false;
        },
        handleGAuth: function(e) {
            e.preventDefault();
            var timer, self, gauth_win, gauth_link = this.$(e.currentTarget).attr('href');
            self = this;
            gauth_win = window.open(gauth_link, 'gauth_win', 'status=no,titlebar=no,scrollbars=no, menubar=no, location=no, width=500, height=450, resizable=no');
            timer = setInterval(function() {
                if(self.checkWindowStatus(gauth_win)) {
                    clearInterval(timer);
                    self.checkGoogleClassroomAuth();
                }
            }, 1000);
            return false;
        },
        loadMoreCourses: function(e) {
          this.pageChange({pageNum: this.state.pageNum+1});
        },
        onLoadCoursesSuccess: function(data) {
            $("#google-classroom-login-container").addClass('hide-imp');
            var i, groupListView,
	        courses = data.courses;
             
            if (data.total === 0 ) {
                return this.showZeroGroupState();
            }

            if (data.total > this.getLoadedGroupsTotal()){
                this.showLoadMore();
            } else {
                this.hideLoadMore();
            }

            this.updateGroupCollection(courses);
            $("#assignClassModal .group-info-head").removeClass("hide-imp");
            $(".group-tmpl-section","#assignClassModal").removeClass("hide-imp");
            var groupListView = new GroupListInfoView({
                collection : this.groupCollection
            });
            this.showAssignButton();
        },
        selectAllCourses: function(e){
            var that = this;
            this.groupCollection.each(function(gm){
                gm.set('isSelected', that.model.get('selectAll'));
            });
        },
        handleSelectAll: function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var isChecked = !this.model.get("selectAll");
            if(isChecked){
                this.checkSelectAll();
            } else {
                this.unCheckSelectAll();
            }
            this.$el.find('#select-all').removeClass('disabled');
            this.model.set("selectAll", isChecked);
            this.selectAllCourses();
        },
	onCourseSelect: function(e){
        console.log("onCourseSelect: course selected");

        if (this.hasSelectedCourse()){
            this.trigger('enableBtn',
                { elem: $(this.enableAssignBtnOptions.elem),
                  text: this.enableAssignBtnOptions.text}
              );
        }
        //this.$(".assign-btn","#assignClassModal").removeClass("hide-imp");
	    //var target = $(e.currentTarget).find('a');
	    //this.$('#gclassroom_courses_selection').html(target.text()+"<span></span>").trigger('click');
	    //this.$('#gclassroom_courses_selection').data(target.data())
	    /*this.trigger('enableBtn',
		    { elem: $(this.enableAssignBtnOptions.elem),
		      text: this.enableAssignBtnOptions.text}
	    );*/
	},
	createAssignment: function(options, callback){
        this.preAssignmentCreation();
        var assignment_courses = [],
            that = this,
            courses = this.getSelectedCourses();

        var total_courses = courses.length;
        $.each(courses, function(index, course){
	        var handle = Math.round(Math.random()*320000) + '_' + (Number(new Date())),
            data = {'appID':'GOOGLE_CLASSROOM',
                    'appName':'googleClassroom',
	               'handle': handle};

            data["lmsGroupID"] = course.get('id');
            data["lmsGroupName"] = course.get('name');
            data["due"] = course.get('dueDate');
            data["concepts"] = options["artifactID"] + "|" + encodeURIComponent(options["contextURL"]);
            data["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

	        if (options.conceptCollectionHandle) {
		        data["concepts"] += "|" + options.conceptCollectionHandle +
			    "|" + (options.collectionCreatorID || '3'); //default collection collection creator ID
	        }
	        data["assignmentTitle"] = options["assignmentName"];
	        if (options["instruction"]){
		        data["instructions"] = options["instruction"];
	        }
            console.log("[createAssignment] :"+ JSON.stringify(data));
            that.model.assignAssignment(data);
            if (index === total_courses-1){
                that.postAssignmentCreations(callback);
            }
        });
	}
    }, {
    });
    return GoogleClassroomView;
});
