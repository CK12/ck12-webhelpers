define(['jquery', 'groups/controllers/groups.home', 'common/utils/utils','common/views/modal.view'], function ($, groupsController, util, ModalView) {
    'use strict';

    function groupNonMemberView() {

        function joinGroupCallback(result) {
            if (result) {
                if ('error' === result) {
                    console.log('Sorry, we could not join you to the group at this time. Please try again later.');
                } else if (result.hasOwnProperty('message')) {
                    if (result.message.toLowerCase().match('does not match')) {
                        $('#group-join-wrong-error').removeClass('hide');
                        $('#join-group-code').addClass('input-required');
                    } else if (result.message.toLowerCase().match('already in the group')) {
                        $('#group-join-member-error').removeClass('hide');
                        $('#join-group-code').addClass('input-required');
                    } else {
                    	ModalView.alert('Sorry, we could not join you to the group at this time. Please try again later.');
                    }
                } else {
                    $('#joinGroupModal').find('.close-reveal-modal').trigger('click');
                    location.reload();
                }
            }
        }

        function bindEvents() {

            $('#join-group').off('click.groups').on('click.groups', function () {
                var groupID, questionID, matches;
                var accessCode = $('#join-group-code').val();
                if (location.pathname.indexOf('/group-discussions/') !== -1) {
                    matches = location.pathname.match(/\/group-discussions\/(\d+)(\/question\/([^\/\s]*))?/);
                    groupID = matches[1];
                    questionID = matches[3];
                } else {
                    groupID = location.pathname.split('/');
                    groupID = groupID[groupID.length - 1] || groupID[groupID.length - 2];
                }
                accessCode = $.trim(accessCode);
                if (accessCode) {
                    accessCode = {
                        'accessCode': accessCode,
                        'groupID': groupID
                    };
                    groupsController.joinGroup(joinGroupCallback, accessCode);
                } else {
                    $('#join-group-code').val('');
                    $('#group-join-empty-error').removeClass('hide');
                    $('#join-group-code').addClass('input-required');
                }
            });

            $('#join-group-code').off('keypress.error').on('keypress.error', function (e) {
                $('.js-join-group-error').addClass('hide');
                $(this).removeClass('input-required');
                if (13 === (e.which || e.keyCode)) {
                    $('#join-group').trigger('click');
                }
            }).off('change.error').on('change.error', function () {
                $('.js-join-group-error').addClass('hide');
                $(this).removeClass('input-required');
            });
        }

        function render(container) {
            require(['text!groups/templates/group.non.member.modal.html'], function (template) {
                $(container).append(template);
                $('#nonMemberModalLink').trigger('click');
                util.ajaxStop();
                bindEvents();
            });
        }

        this.render = render;

    }
    return new groupNonMemberView();
});
