define([
    'jquery',
    'underscore',
    'practiceapp/views/appview',
    'practiceapp/templates/templates',
    'common/utils/concept_coversheet'],
function($, _, AppView, Templates, coverSheet){
    'use strict';
    var StudentViewData,
        controller,
        initialGroupID=null,
        context='';
    var StudentHomeView = AppView.extend({
        'el': $('body'),
        'events': {
            "click.studentview #group-dropdown li": "groupChange",
            "click.studentview .completed-assignment-link": "toggleAssignmentViewMode",
            "click.studentview .member-assignment-list-container": "assignmentRowClick",
            "click.studentview .js-completed-assignment": "seeCompletedAssignment",
            "click.studentview .js-group-dropdown": "openDropdown"
        },
        'tmpl': _.template(Templates.STUDENT_HOME, null, {'variable':'data'}),
        'tmpl_assignment_list': _.template(Templates.STUDENT_ASSIGNMENT_LIST, null, {
            'variable': 'data'
        }),
        'render': function(){
            controller = this.controller;
            context = this.config.app_name;
            controller.setTitle("CK-12 Assignments");
            StudentViewData = this;
            var groups = this.context.user.groups,
                firstGroup = null;
            groups = _(groups).sortBy(function(g){
            if (groups && groups.length){
                firstGroup = groups[0];
                initialGroupID = firstGroup.id;
            }
                return g.lmsGroups[0].title;
            });
            var tmplData = {
                'groups' : groups,
                'firstGroupTitle': (firstGroup !== null)?firstGroup.lmsGroups[0].title:''
            };
            if (controller.launchContext === 'coversheet'){
		window.setTimeout( function(){
                    StudentViewData.showCoverSheet();
                },10);
            }
            if (controller.launchContext === 'scoresheet'){
                this.showScoreSheet();
            }
            $('body').addClass('app-view');
            if (initialGroupID){
                this.renderAssignmentsForGroup(initialGroupID);
            }
            return $(this.tmpl(tmplData));
        },
        'showCoverSheet': function(){
            var eid = controller.appUrl.search_params.assignmentEID;
            this.trigger('openCoverSheet', eid);
        },
        'showScoreSheet': function(){
            var testScoreID = controller.appUrl.search_params.testScoreID;
            var testSheetURL = _.template("<%= data.testSheetUrlPrefix %><%= data.testScoreID %>&context=<%= data.context %>&ep=<%= data.ep %>",{
                'testSheetUrlPrefix': '/assessment/ui/views/test.detail.new.html?testScoreID=',
                'testScoreID': testScoreID,
                'context' : context,
                'ep': controller.appUrl.pathname,
                'appID': controller.appContext.config.appID
            },
            {'variable': 'data'});
            window.location.href = testSheetURL;
        },
        'initialize': function () {
            console.log("Initializing student home view");
            var This = this;
            _.bindAll(this, 'render', 'renderAssignments', 'parseDate', 'showCoverSheet');
            StudentHomeView.__super__.initialize.apply(this, arguments); // run parent class init first
            $('body').off('click.studentview').on('click.studentview', function(e) {
                if(!$(e.target).closest('.js-group-dropdown').length) {
                    $('.group-dropdown-list').removeClass('dropdown-open');
                }
            });
            $('body').off('click.coversheet').on('click.coversheet','.js-close-coversheet',function() {
                This.removePractice();
            });
        },
        'renderAssignmentsForGroup': function(group_id){
        console.log(group_id);
            var This = this;
            $.when(controller.appServices.getAssignmentsForGroup(group_id,{
                    'filters': 'state,past-due;state,upcoming;',
                    'pageSize': 100
            }),controller.appServices.getAssignmentsForGroup(group_id,{
                    'filters': 'state,completed;',
                    'pageSize': 100
            })).done(function(incompleteAssignments, completeAssignments){
                if (!incompleteAssignments && !completeAssignments){
                    console.log('Could not load the assignments.');
                    console.log("Complete Assignments", completeAssignments);
                    console.log("Incomplete Assignments", incompleteAssignments);
                } else {
                    var assignments = [], assignmentCompletedCount = 0;
                    incompleteAssignments = incompleteAssignments.response;
                    completeAssignments = completeAssignments.response;
                    
                    if (incompleteAssignments && incompleteAssignments.assignments instanceof Array && incompleteAssignments.assignments.length){
                        assignments = assignments.concat(incompleteAssignments.assignments);
                    }
                    
                    if (completeAssignments && completeAssignments.assignments instanceof Array && completeAssignments.assignments.length){
                        assignments = assignments.concat(completeAssignments.assignments);
                        assignmentCompletedCount = completeAssignments.assignmentCompletedCount;
                    }
                    This.renderAssignments({
                        'assignments':assignments,
                        'assignmentIncomplete': incompleteAssignments,
                        'assignmentCompletedCount': assignmentCompletedCount
                    });
                }
            }).fail( function(err){
                console.log("Failed to load groups");
                controller.trigger('appError', err);
            });
        },
        'renderAssignments': function(info) {
            var pastTemplate = '',
                upcomingTemplate = '',
                completeTemplate = '',
                template = '',
                This = this;
            if (info.assignments instanceof Array && info.assignments.length) {
                $('#empty-assignment').addClass('hide');
                $("#member-no-assignment").addClass('hide');
                _.each(info.assignments, function(assignmentList){
                    console.log(assignmentList);
                    if (assignmentList.incompleteCount) {
                        if (assignmentList.isPastDue) {
                            pastTemplate += This.createTemplate(assignmentList);
                        } else {
                            upcomingTemplate += This.createTemplate(assignmentList);
                        }
                    } else {
                        completeTemplate += This.createTemplate(assignmentList);
                    }
                });
                $('#past-due-items').empty().append(pastTemplate);
                $('#upcoming-items').empty().append(upcomingTemplate);
                $('#complete-items').empty().append(completeTemplate);
                if(!info.assignmentIncomplete.assignments.length) {
                    template = $(This.tmpl_assignment_list).find('#member-no-assignment').html();
                    $('#member-assignment').addClass('hide');
                    $('#member-no-assignment').find('.group-name').text($('.js-selected-group-title').text().trim()+".");
                    $('#member-no-assignment').removeClass('hide');
                    $('.completed-assignment-link').addClass('hide');
                } else {
                    $('#member-assignment').removeClass('hide');
                    if($('#complete-items').find('.js-member-assignment').length) {
                        $('.completed-assignment-link').removeClass('hide');
                    }
                    else{
                        $('.completed-assignment-link').addClass('hide');
                    }
                    $('#complete').addClass('hide');
                }
                $('#complete-items').find('.member-assignment-due').addClass('hide-important');
                $('.js-assignment-name').each(function () {
                    $(this).text($(this).parent()[0].title);
                });
                this.checkAssignmentType();
            } else {
                template = $(This.tmpl_assignment_list).find('#empty-assignment').html();
                $('#empty-assignment').removeClass('hide');
                $('#member-assignment').addClass('hide');
                $("#member-no-assignment").addClass('hide');
                $('.completed-assignment-link').addClass('hide');
            }
        },
        'createTemplate': function(assignmentList) {
            var This = this,
                template ='',
                groupID = assignmentList.group.id,
                assignmentName = assignmentList.name.replace(/-\d+:.*/,'');
                _.each(assignmentList.concepts, function(concept) {
                    template += This.tmpl_assignment_list({
                        'assignmentName': assignmentName,
                        'dueDate': This.parseDate(assignmentList.due) || '&nbsp',
                        'turnedInDate': This.parseDate(assignmentList.concepts[0].lastAccess) || '&nbsp;',
                        'groupID': groupID,
                        'encodedID': concept.encodedID,
                        'assignmentID': concept.id,
                        'collectionHandle': concept.collectionHandle || '',
                        'conceptCollectionHandle': concept.conceptCollectionHandle || '',
                        'collectionCreatorID': concept.collectionCreatorID || ''
                    });
                });
                return template;
        },
        'parseDate': function(dueDate) {
            if (!dueDate) {
                return '';
            }
            if (!(new Date(dueDate).getTime())) {
                dueDate = dueDate.replace(/\-/g, '/');
            }
            dueDate = new Date(dueDate);
            var year = dueDate.getFullYear();
            if (year < 1900) { // for ie8 bug
                year += 1900;
            }
            dueDate = dueDate.getMonth()+1 ? (dueDate.getMonth()+1) + '/' + dueDate.getDate() + '/' + year : '';
            return dueDate;
        },
        'groupChange': function(e){
            var grp_id = $(e.target).data('groupid');
            $(".js-selected-group-title").text($(e.target).text());
            $('.group-dropdown-list').removeClass('dropdown-open');
            this.renderAssignmentsForGroup(grp_id);
        },
        'toggleAssignmentViewMode': function(){
            if ($(".msg_show_completed").hasClass('hide')){
                $(".msg_show_completed").removeClass('hide');
                $(".msg_hide_completed").addClass('hide');
                
                this.checkAssignmentType();
                $("#complete").addClass('hide');
            } else {
                $(".msg_show_completed").addClass('hide');
                $(".msg_hide_completed").removeClass('hide');
                
                $("#past-due, #upcoming").addClass('hide');
                $("#complete").removeClass('hide');
            }
        },
        'assignmentRowClick': function(e){
            var target = $($(e.target).closest('.member-assignment-list-container'));
            coverSheet.initLms({
                "handle": '',
                "encodedId": "" + ( target.data('eid') || "" ) ,
                "conceptTitle": "",
                "callback": null,
                "context": controller.appContext.config.app_name,
                "ep": controller.appUrl.pathname[controller.appUrl.pathname.length-1] !="?" ? controller.appUrl.pathname + "?" : controller.appUrl.pathname,
                "user": controller.appContext.user,
                "appID": controller.appContext.config.appID,
                "launch_key": controller.appContext.launch_key,
                "showCloseBtn" : true,
                "collectionHandle": target.data('collectionHandle'),
                "conceptCollectionHandle": target.data('conceptCollectionHandle'),
                "collectionCreatorID": target.data('collectionCreatorId')
            });
        },
        'removePractice': function() {
            $('.dashboard-modal-wrapper').removeClass('coversheet-open');
            $('.concept-coversheet').foundation("reveal", "close");
        },
        'checkAssignmentType': function() {
            if (0 === $('#past-due-items').children().length) {
                $('#past-due').addClass('hide');
            } else {
                $('#past-due').removeClass('hide');
            }
            if (0 === $('#upcoming-items').children().length) {
                $('#upcoming').addClass('hide');
            } else {
                $('#upcoming').removeClass('hide');
            }
        },
        'seeCompletedAssignment': function() {
            $('#member-no-assignment').addClass('hide');
            $('#past-due, #upcoming').addClass('hide');
            $('#complete').removeClass('hide');
            $('#member-assignment').removeClass('hide');
        },
        'openDropdown': function() {
            $('.group-dropdown-list').toggleClass('dropdown-open');
        }
    });
    return StudentHomeView;
});
