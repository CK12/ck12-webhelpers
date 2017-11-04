define( ['jquery',
'underscore',
'backbone'],
function ($, _, Backbone){

    var template = '<div id="quick_assignment_notification" class="row collapse teal-theme-back desktop-view_margin modality_quick_assign_notification">'+
    '<div class="notification-data alert_big">'+
    '<span id="notification-status-icon-container"><i id="notification-status-icon" class="icon-notice"></i></span>'+
    '<span id="assignmentNotification"></span>'+
    '<span id="turn-in-container"><div id="turn-in-button" style="margin: 0px;"class="button tangerine small">Turn In</div></span>'+
    '</div>'+
    '<div id="dismiss_assignment-notification" class="dxtrack" data-dx-eventname="FBS_ACTION" data-dx-action_type="link" data-dx-action_name="dismiss_assignment_notification">'+
    '<i class="icon-close"></i>'+
    '</div>'+
    '</div>';

    var ModalityAssignmentNotificationView = Backbone.View.extend({
        defaults:{
            'plix_notificationState_AssignedNotTurnedIn'    : '<span>This is currently assigned to you. Try some challenge questions to turn in this assignment.</span>',
            'plix_notificationState_AssignedAndTurnedIn'    : '<span>You successfully completed this assignment on: ##date##.</span>',
            'plix_notificationState_AssignedDue'            : '<span>This assignment was due on ##date##. Try some challenge questions to turn in this assignment.</span>',

            'practice_notificationState_AssignedNotTurnedIn'    : '<span>This is currently assigned to you.</span> <span id=\'go-to-assignment\'>Go to  Assignment.</span>',
            'practice_notificationState_AssignedAndTurnedIn'    : '<span>You successfully completed this assignment on: ##date##.</span> <span id=\'go-to-assignment\'>Go to  Assignment.</span>',
            'practice_notificationState_AssignedDue'            : '<span>This assignment was due on ##date##.</span> <span id=\'go-to-assignment\'>Go to  Assignment.</span>',

            'notificationState_AssignedNotTurnedIn'         : '<span>This is currently assigned to you. </span><span id=\'go-to-assignment\'>Go to  Assignment.</span>',
            'notificationState_AssignedAndTurnedIn'         : '<span>You successfully completed this assignment on: ##date##. </span><span id=\'go-to-assignment\'>Go to Assignment.</span>',
            'notificationState_AssignedDue'                 : '<span>This assignment was due on ##date##. </span><span id=\'go-to-assignment\'>Go to Assignment.</span>',

            'simulations_notificationState_AssignedNotTurnedIn'                 : '<span>This is currently assigned to you. Proceed to interact with the Simulation to turn it in.</span>',
            'simulations_notificationState_AssignedNotTurnedIn_withTurnIn'      : '<span>This is currently assigned to you. </span>',
            'simulations_notificationState_AssignedAndTurnedIn'                 : '<span>You successfully completed this assignment on: ##date##. </span>',
            'simulations_notificationState_AssignedDue'                         : '<span>This assignment was due on ##date##.</span>'
        },

        events: {
            'click #dismiss_assignment-notification': 'dismissAssignmentNotification',
            'click #turn-in-button'                 : 'turnInAssignment',
            'click #go-to-assignment'               : 'goToAssignment'
        },

        'initialize': function (options) {
            _.bindAll(this,'assignmentStateChange');
            this.$el = $(template);

            if(!this.options){
                this.options = options;
            }

            // Decoupling the dependency from caller's HTML DOM structure.
            // Now caller can specify where to show the notification.
            if(this.options.$container){
                $(this.options.$container).append(this.$el);

                if(this.options.referrer === 'SIMULATIONS'){
                    this.$el.removeClass('collapse');
                }
            }
            else if(!this.options.referrer || this.options.referrer === 'FLEXBOOKS' || this.options.referrer === 'MODALITY' || this.options.referrer === 'PRACTICE_MODALITY' || this.options.referrer === 'EMBED_VIEW'){
                $($.find('.quick-assignment-notification')).append(this.$el);
            }
            else if(this.options.referrer === 'PLIX'){
                this.$el.addClass('plix-notification');
                $($.find('#plix')).parent().prepend(this.$el);
            }

            this.model.view = this;
            this.model.bind('assignmentStateChange', this.assignmentStateChange);
            _.bindAll(this, 'showTurnInButton', 'changeMessageForSimulationView', 'dismissAssignmentNotification', 'turnInAssignment', 'assignmentStateChange', 'goToAssignment');
        },

        goToAssignment : function(){
            window.location.href = '/group-assignments/' + this.model.getGroupID();
        },

        // It will show only for "notificationState_AssignedDue" and "notificationState_AssignedNotTurnedIn" state
        showTurnInButton: function(isShow){
            if(isShow === true){
                if(this.state && (this.state.indexOf('notificationState_AssignedDue') !== -1 || this.state.indexOf('notificationState_AssignedNotTurnedIn') !== -1)){
                    if(this.state === 'simulations_notificationState_AssignedNotTurnedIn'){
                        this.$el.find('#assignmentNotification').html(_.template(this.defaults['simulations_notificationState_AssignedNotTurnedIn_withTurnIn']));
                    }

                    this.$el.find('#turn-in-container').show();
                }
            }
            else{
                this.$el.find('#turn-in-container').hide();
            }
        },

        changeMessageForSimulationView: function(){
            if(this.state){
                if(this.state === 'simulations_notificationState_AssignedNotTurnedIn'){
                    this.$el.find('#assignmentNotification').html(_.template(this.defaults['simulations_notificationState_AssignedNotTurnedIn_withTurnIn']));
                }
            }
        },

        assignmentStateChange: function(state){
            if(state === 'notificationState_NoState'){
                return;
            }

            this.$el.show();
            this.$el.find('#turn-in-container').hide();
            this.$el.find('#assignmentNotification').html('');

            if(state === 'notificationState_AssignedDue'){
                this.$el.removeClass('teal-theme-back green-theme-back alert-theme-back').addClass('alert-theme-back');
                this.$el.find('#notification-status-icon').removeClass().addClass('icon-notification');
                this.$el.find('#turn-in-button').removeClass('tangerine').addClass('turquoise');

                if(this.options.referrer === 'PLIX'){
                    state = 'plix_notificationState_AssignedDue';
                }
                else if(this.options.referrer === 'PRACTICE_MODALITY'){
                    state = 'practice_notificationState_AssignedDue';
                }
                else if(this.options.referrer === 'SIMULATIONS'){
                    state = 'simulations_notificationState_AssignedDue';
                }
                else{
                    this.$el.find('#turn-in-container').show();
                }

                this.$el.find('#assignmentNotification').append(_.template(this.defaults[state].replace('##date##', this.model.dudDate)));
            }
            else if(state === 'notificationState_AssignedAndTurnedIn'){
                this.$el.removeClass('teal-theme-back green-theme-back alert-theme-back').addClass('green-theme-back');
                this.$el.find('#notification-status-icon').removeClass().addClass('icon-checkmark');

                if(this.options.referrer === 'PLIX'){
                    state = 'plix_notificationState_AssignedAndTurnedIn';
                }
                else if(this.options.referrer === 'PRACTICE_MODALITY'){
                    state = 'practice_notificationState_AssignedAndTurnedIn';
                }
                else if(this.options.referrer === 'SIMULATIONS'){
                    state = 'simulations_notificationState_AssignedAndTurnedIn';
                }

                this.$el.find('#assignmentNotification').append(_.template(this.defaults[state].replace('##date##', this.model.completedDate)));
            }
            else if(state === 'notificationState_AssignedNotTurnedIn'){
                this.$el.removeClass('teal-theme-back green-theme-back alert-theme-back').addClass('teal-theme-back');
                this.$el.find('#notification-status-icon').removeClass().addClass('icon-notice');
                this.$el.find('#turn-in-button').removeClass('turquoise').addClass('tangerine');

                if(this.options.referrer === 'PLIX'){
                    state = 'plix_notificationState_AssignedNotTurnedIn';
                }
                else if(this.options.referrer === 'PRACTICE_MODALITY'){
                    state = 'practice_notificationState_AssignedNotTurnedIn';
                }
                else if(this.options.referrer === 'SIMULATIONS'){
                    state = 'simulations_notificationState_AssignedNotTurnedIn';
                }
                else{
                    this.$el.find('#turn-in-container').show();
                }

                this.state = state;
                this.$el.find('#assignmentNotification').append(_.template(this.defaults[state]));
            }

            var document_url = document.URL;
            var isApp = (document_url.indexOf('referrer=__app') !== 1 || (document_url.indexOf('http://') === -1 && document_url.indexOf('https://') === -1));
            if(isApp){
                this.$el.find('#go-to-assignment').hide();
            }
        },

        dismissAssignmentNotification: function(){
            this.$el.remove();
        },

        turnInAssignment: function(){
            if(!this.assignmentTurningIn){
                this.assignmentTurningIn = true;
                this.model.turnInAssignment();

                window.dexterjs.logEvent('FBS_ACTION', {
                    memberID: window.ads_userid,
                    screen_name: 'modality_details',
                    action_type: 'button',
                    action_name: 'turn_in',
                    additional_params1: this.model.artifactID,
                    additional_params2: this.model.modalityID
                });
            }
        }
    });

    return ModalityAssignmentNotificationView;
});
