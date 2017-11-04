define(['underscore','jquery', 'common/utils/utils','groups/utils/roster.tooltip.manager','common/views/modal.view'], function (_, $, util, rosterTooltipMGR,ModalView) {
    'use strict';

    var groupMembersController;
    require(['groups/controllers/group.members'], function (controller) {
        groupMembersController = controller;
    });

    var rosterEditMemberView;
    require(['groups/views/roster.edit.member.view'], function (editMember) {
        rosterEditMemberView = editMember;
    });

    function groupMembersView() {

        var deleteMemberElement, membersTemplate, groupID, scrollPage, adminID, adminRole,
            offset = 100;
        adminID = '';

        /*        function filterMembers(filter) {
            $('.member-detail-container').addClass('hide');
            $('.member-detail-container').each(function () {
                if ($(this).attr('data-filter').match(filter) && '0' !== $(this).find('.js-member-count').html()) {
                    $(this).removeClass('hide');
                }
            });
        }*/


	// Only show group leader the roser options
	function showTeacherRosterFeatures() {
	    $('.js-members-add-students-btn').removeClass('hide-important');
	    // Add students button tooltip
	    if (rosterTooltipMGR.checkForTooltip('group-members-add-member-tooltip', true)) {
	        $('.js-group-members-add-member-tooltip').removeClass('hide-important');
	    }
	}

        function openDropdown(e) {
            var target = $(e.target),
                dropdownBox = target.parents('.js-member-parent').find('.more-options-dropdown-wrapper');
            if (!dropdownBox.hasClass('open')) {
                dropdownBox.removeClass('hide');
                setTimeout(function () {
                    dropdownBox.addClass('open');
                }, 10);
           }
        }

        function deleteMemberCallback(group) {
            var element;
            if ('error' === group) {
                console.log('Sorry, we were not able to remove the member right now. Please try again after some time.');
                group = '';
            } else if (0 !== group.responseHeader.status) {
            	ModalView.alert('Sorry, we were not able to remove the member right now. Please try again after some time.');
                group = '';
            } else {
                $('#removeMemberModal').removeAttr('data-member');
                element = $('#group-members-count');
                element.html(parseInt(element.html(), 10) - 1);
                element = deleteMemberElement.parents('.member-detail-container').find('.js-member-count');
                element.html(parseInt(element.html(), 10) - 1);
                deleteMemberElement.remove();
            }
        }

         // Update a group member with any name changes
        function applyMemberNameChanges(memberID) {
            if (memberID) {
                var $member = $('#'+memberID);
                $member.find('.member-name').attr('data-fname', $('#update-firstname').val());
                $member.find('.member-name').attr('data-lname', $('#update-lastname').val());
                $member.find('span.ie8text').text($('#update-firstname').val() +" "+ $('#update-lastname').val());
            }
        }

        function updateMemberCallback(response) {
	    var memberID = response.response.id;
	    $('.js-close-edit-member').trigger('click');
	    $('#'+memberID).find('.icon-ellipsis').addClass('hide-important');
	    $('#'+memberID).find('.js-member-update-successful').removeClass('hide');
            applyMemberNameChanges(memberID);
	    window.setTimeout(function(){
		$('#'+memberID).find('.js-member-update-successful').addClass('hide');
		$('#'+memberID).find('.icon-ellipsis').removeClass('hide-important');
	    }, 3000);
        }

        function deleteMember() {
            var group;
            group = {
                'groupID': groupID,
                'memberID': $('#removeMemberModal').attr('data-member')
            };
            $('#removeMemberModal').find('.close-reveal-modal').trigger('click');
            groupMembersController.removeMember(deleteMemberCallback, group);
        }

        function bindEventsForMember() {
            $('.js-remove-member').off('click.groups').on('click.groups', function (e) {
                deleteMemberElement = $(this).parents('.js-member-parent');
                $('#removeMemberModal').attr('data-member', deleteMemberElement[0].id);
                var name = $(this).parents('.js-member-parent').find('span.member-name').text().trim();
                $('#member-long-name').html(name);
                name = name.split(' ')[0];
                $('#member-short-name').html(name);
                if ($(e.target).hasClass('js-menu-item')) {
                    $('#removeMemberModal').foundation('reveal', 'open');
                }
            });
        }

        function bindEvents() {
            $('.js-group-members-add-member-tooltip').on('click', function(e){
                $(this).addClass('hide-important');
            });

            $('.add-members-tooltip-cta-link').click(function(){
                $('.js-members-add-students-btn').trigger('click');
                $('.add-members-tooltip-once').addClass('hide-important');
            });

            $('.add-members-tooltip-confirm-btn').click(function(){
                $('.add-members-tooltip-once').addClass('hide-important');
            });

            $('#cancel-modal').off('click.groups').on('click.groups', function () {
                $('#removeMemberModal').find('.close-reveal-modal').trigger('click');
            });

            $('.js-edit-student-member').on('click', function (e){
              e.preventDefault();
              rosterEditMemberView.launch(this);
            });

            $('#delete-member').off('click.groups').on('click.groups', deleteMember);
            $('#group-teacher, #group-student').off('click','span.more-options').on('click','span.more-options',openDropdown);
            $('body').off('click.drop').on('click.drop', function(e){
                var $target = $(e.target);
                if('.more-options-dropdown-wrapper.open') {
                    $('.more-options-dropdown-wrapper.open').removeClass('open').addClass('hide');
                }
            });

            /*            $('.js-dropdown-element').off('click.groups').on('click.groups', function () {
                $('#members-dropdown').find('.js-name').html($(this).find('.js-name').html());
                $('#members-dropdown').find('.js-count').html($(this).find('.js-count').html());
                $('#members-dropdown').parent().trigger('click');
                filterMembers($(this).attr('data-filter'));
            });*/

            // $(window).off('scroll.groups').on('scroll.groups', function () {
            //     if (($(document).scrollTop() + $(window).height()) === $(document).height() && scrollPage) {
            //         var group = {
            //             'groupID': groupID,
            //             'pageNum': scrollPage,
            //             'pageSize': offset,
            //             'filters': 'userRole,student+member+admin;groupMemberRole,groupmember',
            //             'sort': 'a_name'
            //         };
            //         scrollPage = 0;
            //         groupMembersController.getMembers(group, true, 'student');
            //     }
            // });

        }

        function renderGroupMembers(members, isPaginate, userRole) {
            var index, membersHTML, role, studentCount, teacherCount, assignmentCount;
            studentCount = members.studentCount || 0;
            teacherCount = members.teacherCount || 0;
            assignmentCount = Number($('#group-assignments-count').text());
            var memberReportLink ="/group-reports/"+groupID+"/#assignment/";
            var groupAssignmentsLink ="/group-assignments/"+groupID;

            if ('student' === userRole) {
                scrollPage = members.total > members.offset + members.limit ? members.offset / offset + 2 : 0;
            }
            groupID = members.id;
            members = members.members;
            if (deleteMemberElement) {
                deleteMemberElement.children().not(':eq(0)').remove();
                deleteMemberElement.next().find('.pagination').empty();
                deleteMemberElement = '';
            }

            for (index = 0; index < members.length; index++) {
                membersHTML = membersTemplate;
                if (members[index].id && members[index].id.toString() === $('#group-members').attr('data-user')) {
                    membersHTML = membersHTML.replace(/@@current-user@@/g, '');
                } else {
                    membersHTML = membersHTML.replace(/@@current-user@@/g, 'hide');
                }
                membersHTML = membersHTML.replace(/@@username@@/g, _.escape(members[index].name) || '');
                membersHTML = membersHTML.replace(/@@firstName@@/g, members[index].firstName || '');
                membersHTML = membersHTML.replace(/@@lastName@@/g, members[index].lastName || '');
                membersHTML = membersHTML.replace(/@@userAuthID@@/g, members[index].id || '');
                membersHTML = membersHTML.replace(/@@userID@@/g, members[index].id || '');
                // If there are no assignments take the teacher to the assignments page
                if (assignmentCount === 0){
                      membersHTML = membersHTML.replace(/@@member-report-link@@/g, groupAssignmentsLink);
                } else {
                    membersHTML = membersHTML.replace(/@@member-report-link@@/g, (memberReportLink +  members[index].id));
                }
                role = members[index].userRole;
                if ('groupadmin' === members[index].groupMemberRole && 'admin' === userRole) {
                    adminID = members[index].id;
                    adminRole = role;
                    if (!isPaginate) {
                        $('#group-leader').append(membersHTML);
                        $('#group-leader').find('.js-remove-member').remove();
                        $('#group-leader').find('.more-options').remove();
                    }
                    role = 'leader';
                } else if ('teacher' === role && 'teacher' === userRole) {
                    membersHTML = membersHTML.replace(/@@showDeleteIcon@@/g, '');
                    membersHTML = membersHTML.replace(/@@showEllipsisIcon@@/g, 'flagged-for-removal');
                    $('#group-teacher').append(membersHTML);
                } else{
                    // Don't show the edit student option if not created by group leader
                    if ( members[index].isCreatedByTeacher){
                      membersHTML = membersHTML.replace(/@@hide@@/g, '');
                      membersHTML = membersHTML.replace(/@@hide-no-edit-icon@@/g, 'hide');
                    } else{
                      membersHTML = membersHTML.replace(/@@hide-no-edit-icon@@/g, '');
                      membersHTML = membersHTML.replace(/@@hide@@/g, 'no-edit-member');
                    }
                    membersHTML = membersHTML.replace(/@@slogin@@/g, members[index].login || '');
		    // Show student member row for a class
		    if ($('#group-info-container').data('group-type') === 'class'){
		        membersHTML = membersHTML.replace(/@@showDeleteIcon@@/g, 'show-for-medium-down');
			membersHTML = membersHTML.replace(/@@showEllipsisIcon@@/g, 'hide-for-medium-down');
		    } else {
		    // Show student member row for a study group
                        membersHTML = membersHTML.replace(/@@showDeleteIcon@@/g, '');
                        membersHTML = membersHTML.replace(/@@showEllipsisIcon@@/g, 'flagged-for-removal');
                    }
                    $('#group-student').append(membersHTML);
                }
            }
            if (!$('#image-edit-link').length) {
                $('.js-remove-member').remove();
            }
            // Remove anything flagged for removal
            $('.flagged-for-removal').remove();
            if ('student' === userRole || 'teacher' === userRole) {
                // Remove group type specific elements
                if ($('#group-assignments-link').length){
                    $('.js-for-study').remove();
                }else{
                    $('.js-for-class').remove();
                }
                if ('student' === userRole) {
                    if (!isPaginate) {

                        if (!($('#group-student').find('.js-member-parent').length)) {
                            $('#group-student').addClass('hide');
                        } else {
                            $('#group-student').removeClass('hide');
                        }

                        $('#group-student').find('.js-member-count').html(studentCount);
                        $('#group-teacher').find('.js-member-count').html(teacherCount);
                        bindEvents();
                    }
                } else {

                    if (!($('#group-teacher').find('.js-member-parent').length)) {
                        $('#group-teacher').addClass('hide');
                    } else {
                        $('#group-teacher').removeClass('hide');
                    }

                }
                if (adminID && $('#group-members').attr('data-user') != adminID.toString()) {
                    $('.more-options.icon-ellipsis').remove();
                    $('.more-options-dropdown-wrapper').remove();
                } else {
                    if ($('.js-for-class').length && adminRole === "teacher"){
                        showTeacherRosterFeatures();
                    }
                }
                util.ajaxStop();
                bindEventsForMember();
            }
        }

        function getAllMembers(group) {
            require(['text!groups/templates/group.members.entry.html'], function (template) {
                membersTemplate = template;
                var params = {};

                params.groupID = group.groupID;
                params.pageSize = offset;
                groupMembersController.getMembers(params);
            });
        }


        function render(id) {
            groupID = id.groupID;
            require(['text!groups/templates/group.members.html'], function (pageTemplate) {
                $('#group-members-link').addClass('cursor-default').parent().addClass('active');
                $('#group-members-count').addClass('group-count-black');

                if ($('#group-assignments-link').length) {
                    pageTemplate = pageTemplate.replace(/@@GroupLeader@@/g, 'Class');
                } else {
                    pageTemplate = pageTemplate.replace(/@@GroupLeader@@/g, 'Study Group');
                }
                $('#group-details-container').append($(pageTemplate).find('#group-members-container'));
                $('#group-members').append($(pageTemplate).find('#removeMemberModal'));
                getAllMembers(id);
                /*$('#members-dropdown').find('.js-count').html(group.membersCount || '0');
                $('#all-members-count').html(group.membersCount || '0');*/

                rosterEditMemberView.render('#group-details-container', updateMemberCallback);
            });
        }

        this.render = render;
        this.renderGroupMembers = renderGroupMembers;

    }

    return new groupMembersView();
});
