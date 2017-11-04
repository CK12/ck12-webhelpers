define( [
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone){

    var ModalityQuickAssignmentNotification = Backbone.Model.extend({
        defaults:{
            'notificationState_NoState':                'notificationState_NoState',
            'notificationState_AssignedNotTurnedIn':    'notificationState_AssignedNotTurnedIn',
            'notificationState_AssignedAndTurnedIn':    'notificationState_AssignedAndTurnedIn',
            'notificationState_AssignedDue':            'notificationState_AssignedDue'
        },

        'initialize': function(artifactID,  modalityID, collectionHandle){
            this.artifactID = artifactID;
            this.modalityID = modalityID;
            this.checkIfAnyAssignmentExists(artifactID, null, collectionHandle);
            // For sims, cookies are not available due to different subdomain. Instead we will check isTeacher and flip the condition
            // For some teachers the Sim might show up as assigned (if they are part of the group)
            this.isTeacher = window.flxweb_roles ? window.flxweb_roles.indexOf("teacher") !== -1 : $.cookie("flxweb_role") === "teacher";	// changes for bug 57277
        },

        getGroupID: function(){
            return this.groupID;
        },

        checkAssignmentStatusForNewsPaperView: function(modalityID, ownedBy, callBack){
            if(!modalityID){
                return;
            }

            var that = this;
            var API_SERVER_URL = window.API_SERVER_URL || '';
            $.ajax({
                url: API_SERVER_URL + '/flx/get/my/assigned/modalities/' + modalityID + '?format=json&ownedBy=' + ownedBy,
                'xhrFields': {
                    'withCredentials': true
                },
                'crossDomain': true,
                'dataType' : 'json',
                success: function (response) {
                    if (response.responseHeader.status === 0) {
                        callBack(that.getArtifactsStatus(response.response.modalities));
                    }
                },
                error: function () {
                    console.log('error occurred while getting the assignments for ' +  modalityID);
                }
            });
        },

        /*
        This method is able to handle the reponse of checkAssignmentStatusForNewsPaperView method.

        The priority of assignment are as follows:
        overdue (if any of the assignment is over due)
        assigned but not submited. (none of them are over due)
        completed.
        */
        getArtifactsStatus: function(modalities){
            var artifactStatus = {};
            var currentHref,_collectionHandle='';
            currentHref = window.location.href.split('/');
            if(currentHref.indexOf('c') !== -1){
                _collectionHandle = currentHref[currentHref.indexOf('c') + 1];
            }
            for(var key in modalities){
                var artifact = modalities[key];

                artifactStatus[key] = 'notificationState_NoState';

                // check for each assignment for an artifact.
                for(var i = 0; i < artifact.length; i++){
                    if(_collectionHandle === '' || !artifact[i].conceptCollectionHandle || (_collectionHandle === artifact[i].conceptCollectionHandle.split('-::-')[0])){
                        // if any of the assignment is incomplete, set the state incomplete.
                        // if ther is any over due assignment, we will give priotiy to overdue and it will be shown as a notification.
                        if(artifact[i].status === 'incomplete'){
                            if(artifact[i].due){
                                var dueDate = new Date(artifact[i].due),
                                    currentTime = Date.now();

                                // Setting due time as end of the due day.
                                dueDate.setMinutes(59);
                                dueDate.setHours(23);

                                // if the assignment dude date is already passed.
                                if(currentTime - dueDate.getTime() > 0){
                                    artifactStatus[key] = 'notificationState_AssignedDue';
                                    break;
                                }
                                else{
                                    artifactStatus[key] = 'notificationState_AssignedNotTurnedIn';
                                }
                            }
                            else{
                                artifactStatus[key] = 'notificationState_AssignedNotTurnedIn';
                            }
                        }
                        else if(artifactStatus[key] === 'notificationState_NoState' && artifact[i].status === 'completed'){
                            artifactStatus[key] = 'notificationState_AssignedAndTurnedIn';
                        }
                    }
                }
            }

            return artifactStatus;
        },

        /*
        This method can be used independently.
        If a callback function is passed it will return assignment state to the callback.
        */
        checkIfAnyAssignmentExists: function(artifactID, callBack, collectionHandle){
            if(!artifactID){
                return;
            }

            var that = this;
            var API_SERVER_URL = window.API_SERVER_URL || '';
            $.ajax({
                url: API_SERVER_URL + '/flx/get/my/' + artifactID + '/groups',
                'xhrFields': {
                    'withCredentials': true
                },
                'crossDomain': true,
                'dataType' : 'json',
                success: function (response) {
                    if (response.responseHeader.status === 0) {
                        that.setNotificationState(response.response.groups, artifactID, callBack, collectionHandle);
                    }
                },
                error: function () {
                    console.log('error occurred while getting the assignments for ' +  artifactID);
                }
            });
        },

        setNotificationState: function(assignedGroupsInfo, artifactID, callBack, collectionHandle){
        	var state = this.get('notificationState_NoState'),
            isCompleted = true,
            assigned = false,
            earlierDueDate,
            latestCompletedDate,
            statusIncomplete;

        if(assignedGroupsInfo){
            var that = this;
            for(var i = 0; i < assignedGroupsInfo.length; i++){
                that.groupID = assignedGroupsInfo[i].id;
                $.each(assignedGroupsInfo[i].assignmentDict, function(assignmentKey, assignmentObject){

                    if(assignmentObject.eids.length <= 0 || that.isTeacher){
                        state = that.get('notificationState_NoState');
                        return;
                    }

                    // Check if the assignment is completed w.r.t the targeted eid.
                    var _eidObject = {};
                    $.each(assignmentObject.eids, function(eidKey, eidObject){
                        if((!collectionHandle || !eidObject.collectionHandle) || (collectionHandle && eidObject.collectionHandle && collectionHandle === eidObject.collectionHandle)){
                        	isCompleted &= (eidObject.status === 'completed') ;	
                        }
                        _eidObject = eidObject;
                        if(isCompleted){
                            var _completedDate = new Date (eidObject.lastAccess);
                            if(!latestCompletedDate){
                            	latestCompletedDate = _completedDate;
                            }else {
                            	latestCompletedDate = (latestCompletedDate >= _completedDate) ? latestCompletedDate : _completedDate;
                            }
                            that.completedDate = latestCompletedDate.toDateString();
                        }
                    });
                    if((!collectionHandle || !_eidObject.collectionHandle) || (collectionHandle && _eidObject.collectionHandle && collectionHandle === _eidObject.collectionHandle)){
                        if(_eidObject.status === 'completed' && !assigned){
                            state = that.get('notificationState_AssignedAndTurnedIn');
                        }
                        else{
                        	assigned = true;
                            state = that.get('notificationState_AssignedNotTurnedIn');
                        }
                        // check if the assignment is due of not.
                        if(assignmentObject.due && _eidObject.status === 'incomplete'){
                            var dueDate   = new Date(assignmentObject.due),
                                currentTime = Date.now();

                            // Setting due time as end of the due day.
                            dueDate.setMinutes(59);
                            dueDate.setHours(23);
                            
                            if(!earlierDueDate && currentTime - dueDate.getTime() > 0){
                            	earlierDueDate = dueDate;
                            }else if(earlierDueDate && currentTime - earlierDueDate.getTime() > 0){
                            	earlierDueDate = (earlierDueDate.getTime() - dueDate.getTime()) ? earlierDueDate : dueDate; 
                            }
                            
                            if(earlierDueDate && state === that.get('notificationState_AssignedNotTurnedIn')){
                            	statusIncomplete = true;
                            }

                            // if state is assignment is not turned in AND due date has passed.
                            if(state === that.get('notificationState_AssignedNotTurnedIn') && currentTime - dueDate.getTime() > 0){
                                state = that.get('notificationState_AssignedDue');
                                var _dueDate = new Date (earlierDueDate);
                                that.dudDate = _dueDate.toDateString();
                                return false;
                            }
                        }
                    }
                });
            }
        }

        if(statusIncomplete){
        	var _dueDate = new Date (earlierDueDate);
        	this.dudDate = _dueDate.toDateString();
        	this.state = this.get('notificationState_AssignedDue');
        }else{
        	this.state = state;	
        }
        if(!callBack){
            this.trigger('assignmentStateChange', this.state);
        }
        else{
            callBack(this.state);
        }
        },

        turnInAssignment : function(){
            if(!this.artifactID){
                return;
            }

            var that = this;
            var API_SERVER_URL = window.API_SERVER_URL || '';
            var bodyData = {
                'artifactID': that.artifactID,
                'status': 'completed'
            };
            if (window.js_collection_data && window.js_collection_data.collection) {
                bodyData.collectionContexts = this.modalityID
                + '||'
                +  window.js_collection_data.collection.descendantCollection.handle
                + '|'
                + window.js_collection_data.collection.creatorID;
            }
            $.ajax({
                'url': API_SERVER_URL + '/flx/update/my/assignment/status',
                'xhrFields': {
                    'withCredentials': true
                },
                'crossDomain': true,
                'data': bodyData,
                'type': 'POST',
                'dataType' : 'json',
                'success': function (data) {
                    if(data && data.response && data.response.message){
                        console.log(data.response.message);
                        that.state = 'notificationState_AssignedNotTurnedIn';
                        that.trigger('assignmentStateChange', that.state);
                    }
                    else if (data && data.responseHeader && data.responseHeader.status === 0) {
                        that.completedDate = (new Date()).toDateString();
                        that.state = 'notificationState_AssignedAndTurnedIn';
                        that.trigger('assignmentStateChange', that.state);
                    }
                }
            });
        },

        canTurnIn: function(){
            if(!this.state){
                return false;
            }

            if(this.state === 'notificationState_NoState' || this.state === 'notificationState_AssignedAndTurnedIn'){
                return false;
            }
            else{
                return true;
            }
        }
    });

    return ModalityQuickAssignmentNotification;
});
