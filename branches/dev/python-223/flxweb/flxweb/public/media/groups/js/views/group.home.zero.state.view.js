define(['jquery', 'common/utils/utils', 'hammer'], function ($, util) {
    'use strict';

    var groupAssignmentsController;
    require(['groups/controllers/group.assignments'], function (controller) {
        groupAssignmentsController = controller;
    });

    var groupRosterController;
    require(['groups/controllers/group.roster'], function (controller) {
        groupRosterController = controller;
    });

    function groupHomeView() {
        var drag, rosterGroup;

        function initRoster(group, elementID, view){
            var initView = view || 'menu';
            var group = group || rosterGroup;
            Roster.init({
              elm: document.getElementById(elementID),
              group: group,
              initView:'menu'
            });
        }

        function swipeLeft() {
            var index, $pagination, length;
            $pagination = $('.pagination');
            index = $pagination.find('.option-button.active').index();
            length = $pagination.find('.option-button').length;
            if (index < (length - 1)) {
                index = index + 1;
                $('.groups-home-page-mobile-wrapper').css('left', -(index * 100) + '%');
                $pagination.find('.option-button').removeClass('active');
                $pagination.find('.option-button:eq(' + index + ')').addClass('active');
            }
        }

        function swipeRight() {
            var index, $pagination;
            $pagination = $('.pagination');
            index = $pagination.find('.option-button.active').index();
            if (index > 0) {
                index = index - 1;
                $('.groups-home-page-mobile-wrapper').css('left', -(index * 100) + '%');
                $pagination.find('.option-button').removeClass('active');
                $pagination.find('.option-button:eq(' + index + ')').addClass('active');
            }
        }

        function bindEvents() {
            var userRole = $('#group-home').data('userRole') || null;

            // Action reserved for teachers and admins.
            if (userRole && userRole.toLowerCase() === 'teacher' || userRole.toLowerCase() === 'administrator'){
                $('.zero-state-add-students-btn').on('click', function(){
                    groupRosterController.launchRoster(rosterGroup, 'rosterApp',' menu');
                });
            } else {
                $('.zero-state-add-students-btn').addClass('hide');
                $('.zero-state-add-btn-container').css('margin-bottom','76px');
            }

            $('.js-email-instr-wrapper').off('click.groups').on('click.groups', function () {
                var finalInstructions, This;
                finalInstructions = '';
                $(this).find('span').each(function () {
                    This = $(this);
                    finalInstructions += This.text();
                    while (This.next()[0] && 'br' === This.next()[0].nodeName.toLowerCase()) {
                        finalInstructions += '\n';
                        This = This.next();
                    }
                });
                This = $(this);
                This.addClass('hide');
                This.next().removeClass('hide');
                This.next().val(finalInstructions);
                This.next().focus();
                This.next()[0].select();
            });

            $('.js-instructions-edit').off('change.groups').on('change.groups', function () {
                var index, instructions, finalInstructions;
                instructions = $(this).val().split(/\n/);
                finalInstructions = '';
                for (index = 0; index < instructions.length; index++) {
                    finalInstructions += instructions[index] ? '<span class="instructions">' + instructions[index] + '</span>' : '';
                    finalInstructions += index !== instructions.length - 1 ? '<br>' : '';
                }
                $(this).prev()[0].innerHTML = finalInstructions;
            }).off('blur.groups').on('blur.groups', function () {
                $(this).prev().removeClass('hide');
                $(this).addClass('hide');
            });

            $('.js-email-instructions').off('click.groups').on('click.groups', function () {
                var finalInstructions, This, group_name;
                finalInstructions = '';
                $('.js-email-instr-wrapper').first().find('span').each(function () {
                    finalInstructions += $(this).text().replace(/&/g, '%26');
                    This = $(this);
                    while (This.next()[0] && 'br' === This.next()[0].nodeName.toLowerCase()) {
                        finalInstructions += '%0D%0A';
                        This = This.next();
                    }
                });
                group_name = $('#group-name').text();
                location.href = 'mailto:?subject=You are invited to join ' + group_name + '&body=' + finalInstructions;
                return false;
            });

            $('.js-join-group-link').off('click.groups').on('click.groups', function () {
                this.select();
            });

            $('#join-group-code').off('click.groups').on('click.groups', function () {
                this.select();
            });

            Hammer('.groups-home-page-mobile-wrapper').off('dragleft.drag').on('dragleft.drag', function () {
                drag = 'left';
                //swipeLeft();
            });

            Hammer('.groups-home-page-mobile-wrapper').off('dragright.drag').on('dragright.drag', function () {
                drag = 'right';
                //swipeRight();
            });

            Hammer('.groups-home-page-mobile-wrapper').off('release.drag').on('release.drag', function () {
                if (drag === 'left') {
                    drag = undefined;
                    swipeLeft();
                } else if (drag === 'right') {
                    drag = undefined;
                    swipeRight();
                }
            });

            $('.option-button').off('click.drag').on('click.drag', function () {
                var index = $(this).index();
                $('.groups-home-page-mobile-wrapper').css('left', -(index * 100) + '%');
                $('.pagination').find('.option-button').removeClass('active');
                $(this).addClass('active');
            });

            $('#visit-settings').off('click.visit').on('click.visit', function () {
                location.href = $('#group-settings-link').attr('href') + '#registration';
            });

        }

        function render(groupID) {
            require(['text!groups/templates/group.home.zero.state.html'], function (pageTemplate) {
                $('#group-home-link').addClass('cursor-default').parent().addClass('active');
                $('#group-details-container').append(pageTemplate);
                if ($('#group-assignments-link').length) {
                    $('#group-type').append('class:');
                    $('.link_studygroup').remove();
                    $('.js-for-study').remove();
                } else {
                    $('#group-type').append('study group:');
                    $('.link_class').remove();
                    $('.js-for-class').remove();
                    $('.js-for-study-zero-home').removeClass('show-for-medium-down');
                }
                bindEvents();
                var groupLink, groupName, groupCode, goToServer, groupCount;
                groupName = $('#group-name').text() || '';
                groupCode = $('#group-name').attr('data-access-code') || '';
                $('#group-name-instructions').text(groupName);
                groupLink = webroot_url + 'join/group/?accessCode=' + groupCode;
                goToServer = '1. Go to ' + location.hostname;
                groupCount = $("#group-members-count").text();

		rosterGroup = {
			    id: groupID,         //required
			    accessCode: groupCode, //required for email-invite page
			    name: groupName     //this is group name. it is required for email-invite page
			};
                $('.js-join-group-link').val(groupLink);
                $('.js-instructions-goToUrl').text(goToServer);
                $('.js-instructions-group-link').text(groupLink);
                $('.js-join-group-code').text(groupCode);
                $('.js-instructions-group-code').append(groupCode);
                if ($('#create-assignment-btn').length) {
                    $('#create-assignment-btn')[0].href = webroot_url + "group-assignments/" + groupID+"?pageType=create";
                }
                if ($('#join-group-code').length) {
                    $('#join-group-code').val(groupCode);
                }
                util.ajaxStop();
                if (!$('html').hasClass('lt-ie9')) {
                    $(document).foundation();
                }
            });
        }

        this.render = render;

    }
    return new groupHomeView();
});
