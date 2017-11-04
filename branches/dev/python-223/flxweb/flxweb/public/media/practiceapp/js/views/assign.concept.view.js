define([
        'jquery',
        'underscore',
        'backbone',
        'practiceapp/templates/templates'
    ],
    function($, _, Backbone, Templates){
    'use strict';

    var groupListInfo,
        controller = null,
        conceptParams,
        target,
        assignmentInProgress = false;

    var AssignConceptView =  Backbone.View.extend({
        'tmpl_assign_popup':Templates.ASSIGN_POPUP,
        'tmpl_groups': _.template(Templates.GROUP_LIST, null, {
            'variable': 'data'
        }),
        initialize: function(options) {
            controller = options.controller;
            conceptParams = options.conceptParams;
            target = conceptParams.target;
            groupListInfo = controller.appContext.user.groups;
            this.current_concept = conceptParams.current_concept;
            this.$el.html(this.tmpl_assign_popup);
            this.render();
        },
        events: {
            'click.assign .js-group-list': 'selectGroup',
            'click.assign #toggle-group-button': 'toggleSelectGroups',
            'focus.assign .js-due': 'openDatePicker',
            'click.assign .js-cancel-assign': 'cancelAssign',
            'click.assign .js-confirm-assign': 'confirmAssign',
            'change.assign .js-due': 'changeDueDate',
            'click.assign .js-date-close': 'closeErrorPopup',
            'blur.assign .js-due': 'changeDueDate'
        },
        render: function() {
            $('.concept-header-text').text(this.current_concept.concept_title);
            $('.groups-list-container').addClass('hide');
            $('#lms-group-list').empty();
            $('#lms-assigned-group-list').empty();
            $('.js-confirm-assign').addClass('js-disabled').addClass('disabled').removeClass('turquoise').addClass('grey');
            if(target.hasClass('coversheet-assign-button')) {
                $('.dashboard-modal-wrapper').addClass('coversheet-open');
            }
            if(!groupListInfo.length) {
                $('.no-groups-container').removeClass('hide');
            } else {
                this.renderGroupList();
                $('.js-due').datepicker({
                    minDate: 0,
                    dayNamesMin: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
                });
            }
        },
        renderGroupList: function() {
            var _c = this, templateUnassigned = '', templateAssigned = '', assignedGroupList, dueDateStr;
            controller.appServices.getGroupsForAssignmentEID(_c.current_concept.eid).done(function(result){
                assignedGroupList = result.response.groups;
                if(assignedGroupList instanceof Array && assignedGroupList.length) {
                    _.each(assignedGroupList, function(assignedGroup) {
                        var dueDate;
                        dueDateStr='';
                        dueDate = _(assignedGroup.assignmentDict).values()[0].due;
                        if (dueDate){
                            dueDate = new Date(dueDate);
                            dueDateStr = [dueDate.getMonth()+1,dueDate.getDate(),dueDate.getFullYear()].join('/');
                        }
                        templateAssigned += _c.tmpl_groups({
                            'groupName': assignedGroup.lmsGroups[0].title,
                            'ck12GroupID': assignedGroup.id,
                            'lmsGroupID': assignedGroup.lmsGroups[0].providerGroupID,
                            'dueDate': dueDateStr
                        });
                        $('#lms-group-list').find('div[data-ck12groupid ="' + assignedGroup.id+ '"]').addClass('assigned');
                    });
                    $('#lms-assigned-group-list').append(templateAssigned);
                    $('#lms-assigned-group-list .js-group-list').removeClass('pointer');
                    $('.unassigned-list-wrapper').removeClass('large-12').addClass('large-6');
                    $('#assigned-group-list-container').removeClass('hide');
                    $('#lms-assigned-group-list .due-date').addClass('hide-important');
                    $('#lms-assigned-group-list .js-concept-check').addClass('hide-important');
                    $('#lms-assigned-group-list .assign-due-date').removeClass('hide-important');
                    $('#lms-group-list').find('.js-group-row.assigned').remove();
                    if(!$('#lms-group-list').find('.js-group-row').length) {
                        $('.unassigned-list-wrapper').addClass('hide').parents('.groups-list-container').addClass('all-groups-assigned');
                        $('.assigned-group-list-wrapper').removeClass('large-6').addClass('large-12');
                        $('.all-assigned-ok').removeClass('hide');
                        if(groupListInfo.length === 1) {
                            $('.assign-group-modal').addClass('single-group-container');
                            $('.assigned-list-header, .all-assigned-groups-list').addClass('hide');
                            $('.group-context').text("Edmodo Groups");
                            $('.concept-header-text').text(_c.current_concept.title + " has been assigned to " + groupListInfo[0].lmsGroups[0].title + '.').addClass('single-group-concept-header');
                            $('.single-group-due').text(dueDateStr);
                            $('.single-group-assigned').removeClass('hide');
                        } else {
                            $('.concept-header-text').text(_c.current_concept.title + " has been assigned to all groups.");
                        }
                    } else {
                        $('.unassigned-list-wrapper').removeClass('hide').parents('.groups-list-container').removeClass('all-groups-assigned');
                        $('.assigned-group-list-wrapper').addClass('large-6').removeClass('large-12');
                        $('.all-assigned-ok').addClass('hide');
                    }
                } else {
                    $('.unassigned-list-wrapper').removeClass('hide').parents('.groups-list-container').removeClass('all-groups-assigned');
                    $('.assigned-group-list-wrapper').addClass('large-6').removeClass('large-12');
                    $('#assigned-group-list-container').addClass('hide');
                    $('.unassigned-list-wrapper').removeClass('large-6').addClass('large-12');
                    if(groupListInfo.length === 1) {
                        $('.single-group-assigned').addClass('hide');
                        $('.group-select-header').addClass('hide').next().addClass('left');
                        $('.group-list-name').addClass('hide').next().addClass('left');
                        $('.assign-group-modal').addClass('single-group-container');
                        $('.group-context').text(groupListInfo[0].lmsGroups[0].title);
                        $('.concept-header-text').removeClass('single-group-concept-header');
                    }
                }
                $('.groups-list-container').removeClass('hide');
                $('#assign-groups-modal').foundation('reveal', 'open');
            }).fail(function(err){
                //error handling
                console.log("Failed to get assignments for EID: ", _c.current_concept.eid);
                controller.trigger('appError', err);
            });
            $('#toggle-group-button').text('Select All');
            _.each(groupListInfo, function (group) {
                templateUnassigned += _c.tmpl_groups({
                    'groupName': group.lmsGroups[0].title,
                    'ck12GroupID': group.id,
                    'lmsGroupID': group.lmsGroups[0].providerGroupID
                });
            });
            $('#lms-group-list').append(templateUnassigned);
        },
        selectGroup: function(e) {
            var This = $(e.target).closest('.js-group-list');
            if (This.closest('#lms-assigned-group-list').size() !== 0){
                return false;
            }
            if(This.hasClass('selected') && !$('#ui-datepicker-div').is(':visible')) {
                This.parents('.js-group-row').find('.js-due').val('').attr('value', '');
            }
            This.toggleClass('selected').find('.js-concept-check').toggleClass('checked');
            this.checkForAllSelection();
            this.checkForAssignment();
        },
        checkForAllSelection: function() {
            if ($('.unassigned-list-wrapper').find('.js-group-list').not('.selected').length) {
                $('#toggle-group-button').text('Select All');
            } else {
                $('#toggle-group-button').text('Select None');
            }
        },
        checkForAssignment: function() {
            if ($('.js-group-list.selected').length) {
                $('.js-confirm-assign').removeClass('disabled').removeClass('js-disabled').removeClass('grey').addClass('turquoise');
            } else {
                $('.js-confirm-assign').addClass('disabled').addClass('js-disabled').removeClass('turquoise').addClass('grey');
            }
        },
        toggleSelectGroups: function(e) {
            var This = $(e.target);
            if ('Select All' === This.text()) {
                $('.js-group-list').not('.selected').find('.js-concept-check').trigger('click');
            } else {
                $('.js-group-list.selected').find('.js-concept-check').trigger('click');
            }
            this.checkForAllSelection();
        },
        openDatePicker: function(e) {
            e.stopPropagation();
            var This = $(e.target); 
            This.removeClass('input-error2');
            if (This.parent().siblings('.js-invalid-date').is(':visible') || This.parent().siblings('.js-before-date').is(':visible') || This.parent().siblings('.js-empty-date').is(':visible')) {
                This.val('');
                $('.js-invalid-date').addClass('hide');
                $('.js-before-date').addClass('hide');
                $('.js-empty-date').addClass('hide');
            }
            $('.ui-datepicker-prev').addClass('icon-arrow_left');
            $('.ui-datepicker-next').addClass('icon-arrow_right');
        },
        cancelAssign: function() {
            $('#assign-groups-modal').foundation('reveal', 'close');
        },
        confirmAssign: function(){
            if(!$('.js-confirm-assign').hasClass('js-disabled')) {
                if (assignmentInProgress){
                    return false;
                }
                var _c = this,
                assignments = [],
                emptyDue,
                isDueDateEmpty = false,
                grp_info,
                due_date;
                $('.unassigned-list-wrapper .js-group-list.selected').each(function(){
                    if($(this).parents('.js-group-row').find('.js-due').val().length === 0) {
                        emptyDue =   $(this).parents('.js-group-row').find('.js-due');
                        isDueDateEmpty = true;
                        return true;
                    }
                });
                if(!isDueDateEmpty) {
                    if(!$('.js-date-popup').is(':visible')) {
                        $('#assign-groups-modal .js-group-row').each(function(){
                             if ($(this).find('.js-group-list.selected').size()){
                                 grp_info = $(this).data();
                                 //console.log(grp_info);
                                 due_date = $(this).find('.js-due').val();
                                 if (due_date){
                                     due_date = due_date.split('/');
                                     due_date = due_date[2] + '-' + due_date[0] + '-' + due_date[1];
                                 }
                                 assignmentInProgress = true;
                                 assignments.push( controller.appServices.assign(
                                     _c.current_concept.eid,
                                     grp_info.ck12groupid,
                                     grp_info.lmsgroupid,
                                     _c.current_concept.title,
                                     due_date,
                                     _c.current_concept.handle + '_' + (Number(new Date()))
                                 ) );
                                 $('#assign-groups-modal .close-reveal-modal').trigger('click');
                             }
                         });
                    }
                } else {
                    emptyDue.parent().siblings('.js-empty-date').removeClass('hide');
                    $('.unassigned-list-wrapper .js-group-list.selected').parent().find('input[value=""]').addClass('input-error2');
                }
                if (assignments.length !== 0){
                    $.when.apply($, assignments).done(function(){
                        controller.showMessage("Your assignment has been posted to " + controller.appContext.config.provider_display_name + ".");
                        assignmentInProgress = false;
                    }).fail(function(){
                        controller.showMessage("There was an error while creating assignments on " + controller.appContext.config.provider_display_name + ". Please try again later.");
                        assignmentInProgress = false;
                    });
                }
            }
        },
        changeDueDate: function(e) {
            var This = $(e.target),
                _c = this,
                isDateValid = true,
                isDateBefore = false,
                due = This.val();
                
            This.removeClass('input-error2');
            This.parent().siblings('.js-date-popup').addClass('hide');
            
            This.attr('value', due);
            if (due) {
                if (!_c.isValidDate(due)) {
                    This.parent().siblings('.js-invalid-date').removeClass('hide');
                    This.addClass('input-error2');
                    isDateValid = false;
                    this.selectConceptWithDue(This, isDateValid);
                    return;
                }
                if (_c.isBeforeDate(due)) {
                    This.parent().siblings('.js-before-date').removeClass('hide');
                    This.addClass('input-error2');
                    isDateBefore = true;
                    this.selectConceptWithDue(This, isDateBefore);
                    return;
                }
                this.selectConceptWithDue(This, true);
            }
        },
        closeErrorPopup: function(e) {
            var This = $(e.target);
            This.parent().addClass('hide');
            $('.js-due.input-error2').removeClass('input-error2').val('').attr('value', '');
            //This.parent().siblings('.due-date-container').find('.js-due').removeClass('input-error2').val('');
        },
        selectConceptWithDue: function(This, isDate) {
            var conceptContainer = This.parents('.js-group-row').find('.js-group-list');
            if(isDate && !conceptContainer.hasClass('selected')) {
                conceptContainer.trigger('click');
            } else if (!isDate && conceptContainer.hasClass('selected')) {
                conceptContainer.trigger('click');
            }
        },
        isValidDate: function(checkDate) {
            if (!new Date(checkDate).getYear()) {
                return false;
            }
            checkDate = checkDate.split('/');
            if (3 !== checkDate.length) {
                return false;
            }
            if (12 < parseInt(checkDate[0], 10)) {
                return false;
            }
            if (31 < parseInt(checkDate[1], 10)) {
                return false;
            }
            if (4 !== checkDate[2].length) {
                return false;
            }
            var date = new Date(checkDate[2], parseInt(checkDate[0] - 1, 10), checkDate[1]);
            if ((date.getMonth() + 1) !== parseInt(checkDate[0], 10)) {
                return false;
            }
            return true;
        },
        isBeforeDate: function(checkDate) {
            checkDate = checkDate.split('/');
            checkDate = checkDate.join('/');
            checkDate = new Date(checkDate);
            if ((new Date() - checkDate) > (86400 * 1000)) {
                return true;
            }
            return false;
        }
    });

    return AssignConceptView;
});