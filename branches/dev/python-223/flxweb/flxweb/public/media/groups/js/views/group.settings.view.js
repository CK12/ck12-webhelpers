define(['jquery', 'common/utils/utils', 'clipboard','common/views/modal.view'], function ($, util,clipboard, ModalView) {
    'use strict';

    var groupSettingsController;
    require(['groups/controllers/group.settings'], function (controller) {
        groupSettingsController = controller;
    });

    var groupRosterController;
    require(['groups/controllers/group.roster'], function (controller) {
        groupRosterController = controller;
    });

    function groupSettingsView() {

        var groupID, rosterGroup,
            animationProgress = false,
            isRender = false,
            isIndirect = false;

        function initRoster(group, elementID, view){
            var initView = view || 'menu';
            var group = group || rosterGroup;
            Roster.init({
              elm: document.getElementById(elementID),
              group: group,
              initView:'menu'
            });
        }

        function deleteGroupCallback(group) {
            if ('error' === group) {
                console.log('Sorry, we were not able to delete the group right now. Please try again after some time.');
                group = '';
            } else if (0 !== group.responseHeader.status) {
            	ModalView.alert('Sorry, we were not able to delete the group right now. Please try again after some time.');
                group = '';
            } else {
                $('#deleteGroupModal').find('.close-reveal-modal').trigger('click');
                $('#group-settings').addClass('hide');
                location.href = '/my/groups/';
            }
        }

        function deleteGroup() {
            var group;
            group = {
                'groupID': groupID
            };
            groupSettingsController.deleteGroup(deleteGroupCallback, group);
        }

        function handleFrquencyToggle(This, size) {
            var group, onOff, temp;
            group = {};
            onOff = '.js-' + This.id.split('-')[0];
            temp = $('[name="' + This.id + '"]');
            if ($(This).is(':checked')) {
                group[This.name] = 'yes';
                isRender = true;
                temp.prop('disabled', false).eq(0).trigger('click');
                if (This.id.match('peerhelp')) {
                    $('.js-type-radio').prop('disabled', false).eq(0).trigger('click');
                }
                isRender = false;
                $(onOff + '-off-' + size).addClass('hide');
                $(onOff + '-on-' + size).removeClass('hide1');
            } else {
                group[This.name] = 'no';
                temp.prop('disabled', true);
                temp = $('#' + temp.attr('data-target')).prev();
                temp.addClass('disabled');
                if (This.id.match('peerhelp')) {
                    $('.js-type-radio').prop('disabled', true);
                }
                $('[name="' + This.id.split('-')[0] + '-close"]:visible').trigger('click');
                $(onOff + '-off-' + size).removeClass('hide');
                $(onOff + '-on-' + size).addClass('hide1');
            }
            if (!isIndirect) {
                group.groupID = groupID;
                groupSettingsController.updateNotifications(group);
                isIndirect = true;
                $('[name="' + This.name + '"]').not(This).trigger('click');
                setTimeout(function () {
                    isIndirect = false;
                }, 5); // to allow for the other click handler to run
            }
        }

        function handleFrequencyRadio(This) {
            var group, target, text, dropdown;
            text = $(This).attr('data-text');
            dropdown = $('#' + $(This).attr('data-target'));
            if ($(This).hasClass('js-has-dropdown')) {
                dropdown.prev().removeClass('disabled');
                dropdown = dropdown.find('.active');
                text += dropdown.text();
                target = dropdown[0];
            } else {
                dropdown.prev().addClass('disabled');
                target = This;
            }
            $('.js-' + This.name + '-label').text(text);
            if (!isRender) {
                group = {};
                group[$('#' + This.name)[0].name] = target.id.split('-')[1];
                group.groupID = groupID;
                if (This.name.match('peerhelp') && $('.js-type-radio:checked').next(':visible').prev()[0].id.match('my')) {
                    group.onlyParticipation = 'yes';
                }
                groupSettingsController.updateNotifications(group);
                target = This.id.split('-');
                target.pop();
                target.pop();
                target = '.js-' + target.join('-');
                isRender = true;
                $(target).not(this).trigger('click');
                setTimeout(function () {
                    isRender = false;
                }, 5); // to allow for the other click handler to run
            }

        }

        function handleQaSettingsToggle(This) {
            var $this = $(This);
            var group;
            group = {};
            if ($this.is(':checked')) {
                group[This.name] = true;
                if(This.id.match('discussion')) {
                    $('#group-discussions-link').attr('href', '/group-discussions/' + groupID).parent().removeClass('QAdisabled');
                    $('[name = allowAnonymous]').removeAttr('disabled').parent().removeClass('anonymous-disabled');
                }
                //isRender = false;
            } else {
                group[This.name] = false;
                if(This.id.match('discussion')) {
                    $('#group-discussions-link').removeAttr('href').parent().addClass('QAdisabled');
                    $('[name = allowAnonymous]').attr('disabled', 'disabled').parent().addClass('anonymous-disabled');
                }
            }
            if(This.id.match('discussion')) {
                group["typeName"] = "GROUP_QA_STATUS";
                group["allowAnonymous"] = $('[name = allowAnonymous]').is(':checked');
                $('#group-discussions-link').attr({
                    'data-enable-qa': group[This.name],
                    'data-allow-anonymous': group["allowAnonymous"]
                });
            } else {
                group["typeName"] = "GROUP_QA_ANONYMOUS_PERMISSION";
                group["enableQA"] = $('[name = enableQA]').is(':checked');
                $('#group-discussions-link').attr({
                    'data-enable-qa': group["enableQA"],
                    'data-allow-anonymous': group[This.name]
                });
            }
            if (!isIndirect) {
                group.groupID = groupID;
                groupSettingsController.updateQAsettings(group);
                $('[name="' + This.name + '"]').not(This).prop('checked', !$('[name="' + This.name + '"]').not(This).is(':checked'));
                isIndirect = true;
                setTimeout(function () {
                    isIndirect = false;
                }, 5); // to allow for the other click handler to run
            }
            $('#qa-turnoff-alert').foundation('reveal', 'close');
        }

        function initClipboard(){
            // Using third party libary https://clipboardjs.com/
            var clip_copy = new clipboard('.js-copy-link');
            clip_copy.on('success' ,function(e){
                e.trigger.innerHTML = "Copied";
                window.setTimeout(function(){
                e.trigger.innerHTML = "Copy";
                }, 3000); 
                console.log('copied');
            });
            clip_copy.on('error',function(e){
                e.trigger.innerHTML = "Press ⌘-C to copy";
                window.setTimeout(function(){
                e.trigger.innerHTML = "Copy";
                }, 3000); 
            });
        }

        function bindEvents() {
            initClipboard()

            var userRole = $('#group-settings').data('userRole') || null;

            // Action reserved for teachers and admins.
            if (userRole && userRole.toLowerCase() === 'teacher' || userRole.toLowerCase() === 'administrator'){
                $('#add-students-link').click(function(){
                    groupRosterController.launchRoster(rosterGroup, 'rosterApp',' menu');
                });
            } else {
                $('.settings-grey-divider').addClass('hide');
                $('#add-students-link').addClass('hide');
            }

            $('.js-notify-big').off('click.groups').on('click.groups', function () {
                handleFrquencyToggle(this, 'big');
            });

            $('.js-notify-small').off('click.groups').on('click.groups', function () {
                handleFrquencyToggle(this, 'small');
            });

            $('[name="share-big"]').off('click.groups').on('click.groups', function () {
                handleFrequencyRadio(this);
            });

            $('[name="share-small-leader"]').off('click.groups').on('click.groups', function () {
                handleFrequencyRadio(this);
            });

            $('[name="share-small-member"]').off('click.groups').on('click.groups', function () {
                handleFrequencyRadio(this);
            });

            $('[name="peerhelp-big"]').off('click.groups').on('click.groups', function () {
                handleFrequencyRadio(this);
            });

            $('[name="peerhelp-small-leader"]').off('click.groups').on('click.groups', function () {
                handleFrequencyRadio(this);
            });

            $('[name="peerhelp-small-member"]').off('click.groups').on('click.groups', function () {
                handleFrequencyRadio(this);
            });

            $('.js-dropdown').off('click.notifications').on('click.notifications', function () {
                if ($(this).hasClass('disabled')) {
                    return false;
                }
            });

            $('.js-frequency-dropdown').off('click.groups').on('click.groups', function () {
                if ($(this).hasClass('active')) {
                    if (!isRender) {
                        $(this).parent().prev().trigger('click');
                    } else {
                        $(this).parent().prev().find('a').text($(this).text());
                        $('#' + $(this).parent()[0].id.replace(/dropdown/g, 'digest')).trigger('click');
                    }
                    return;
                }
                $(this).siblings().removeClass('active');
                $(this).addClass('active');
                $(this).parent().prev().trigger('click');
                $(this).parent().prev().find('a').text($(this).text());
                $('#' + $(this).parent()[0].id.replace(/dropdown/g, 'digest')).trigger('click');
                if (!isIndirect) {
                    var target = this.id.split('-');
                    target.pop();
                    target.pop();
                    target = '.js-' + target.join('-');
                    isIndirect = true;
                    $(target).not(this).trigger('click');
                    setTimeout(function () {
                        isIndirect = false;
                    }, 5); // to allow for the other click handler to run
                }
            });

            $('.js-type-radio').off('click.notifications').on('click.notifications', function () {
                $('#' + this.name + '-label').text($(this).attr('data-text'));
                if (!isRender) {
                    var group, frequency, target;
                    group = {};
                    group.groupID = groupID;
                    if (this.id.match('my')) {
                        group.onlyParticipation = 'yes';
                    }
                    frequency = $('[name="peerHelp"]').next().filter(function () {
                        return !$(this).parents('.hide').length;
                    }).prev()[0].id;
                    frequency = $('[name="' + frequency + '"]:checked');
                    if ('digest' === frequency[0].id.split('-')[1]) {
                        frequency = $('#' + frequency.attr('data-target')).find('.active');
                    }
                    frequency = frequency[0].id.split('-')[1];
                    group.peerHelp = frequency;
                    groupSettingsController.updateNotifications(group);
                    target = this.id.split('-');
                    target.pop();
                    target.pop();
                    target = '.js-' + target.join('-');
                    isRender = true;
                    $(target).not(this).trigger('click');
                    setTimeout(function () {
                        isRender = false;
                    }, 5); // to allow for the other click handler to run
                }
            });

            $('.js-on-notification').off('click.groups').on('click.groups', function () {
                $('[name="' + $(this).attr('data-target') + '"]').next(':visible').prev().trigger('click');
            });

            $('.js-delete-group').off('click.settings').on('click.settings', deleteGroup);

            $('#cancel-modal').off('click.groups').on('click.groups', function () {
                $('#deleteGroupModal').find('.close-reveal-modal').trigger('click');
            });

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
                This.addClass('hide').next().removeClass('hide').val(finalInstructions).focus();
                if (window.innerWidth < 768) {
                    This.next().css({
                        'min-height': This.innerHeight() + 20 + 'px'
                    });
                }
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
                $('.js-email-instr-wrapper').html(finalInstructions);
            }).off('blur.groups').on('blur.groups', function () {
                $(this).addClass('hide').prev().removeClass('hide');
            });

            $('.js-email-instructions').off('click.groups').on('click.groups', function () {
                var finalInstructions, This, group_name;
                finalInstructions = '';
                $('.js-email-instr-wrapper').first().find('span').each(function () {
                    finalInstructions += $(this).text();
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
                if (undefined === window.orientation) { // do not change, inequality with undefined ONLY is what this is supposed to be
                    this.select();
                }
            });

            $('.js-join-group-code').off('click.groups').on('click.groups', function () {
                if (undefined === window.orientation) { // do not change, inequality with undefined ONLY is what this is supposed to be
                    this.select();
                }
            });

            $('.settings-nav').off('click.next').on('click.next', function () {
                var width, parentWidth, left, childWidth, childCount, $children, $parent, id, $this;
                if (!animationProgress) {
                    $children = $('.leader-settings');
                    $parent = $children.parent();
                    childCount = $children.length;
                    width = $parent.width();
                    parentWidth = $parent.offsetParent().width();
                    width = 100 * width / parentWidth;

                    childWidth = $children.width();
                    parentWidth = $children.offsetParent().width();
                    childWidth = 100 * childWidth / parentWidth;

                    $this = $(this);
                    id = $this.attr('id');
                    $this.parents('.leader-settings').next('.leader-settings').find('.levels').addClass('hide');
                    $this.parents('.leader-settings').next('.leader-settings').find('.' + id + '-wrapper').removeClass('hide');
                    left = $parent.position().left / $parent.parent().width() * 100;
                    animationProgress = true;
                    $parent.css('left', left - (childWidth * childCount) + '%');
                    setTimeout(function () {
                        animationProgress = false;
                    }, 1000);
                }
            });

            $('body').off('navigateBack.group-menu').on('navigateBack.group-menu', function () {
                var left, $children, childCount, childWidth, parentWidth;
                if (!animationProgress) {
                    left = $('.mobile-settings').position().left / $('.mobile-settings').parent().width() * 100;
                    if (left < 0) {
                        if (location.hash === '#registration' && left === -100) {
                            location.href = $('#group-home-link').attr('href');
                        } else {
                            animationProgress = true;
                            $children = $('.leader-settings');
                            childCount = $children.length;
                            childWidth = $children.width();
                            parentWidth = $children.offsetParent().width();
                            childWidth = 100 * childWidth / parentWidth;
                            $('.mobile-settings').css('left', left + (childWidth * childCount) + '%');
                            setTimeout(function () {
                                animationProgress = false;
                            }, 1000);
                        }
                    } else {
                        if ($('#group-info-container').hasClass('hide-content')) {
                            $('#group-info-container').removeClass('hide-content');
                            $('#group-details-container .group-menu-button a').html('Back to Page');
                            $('#group-details-container>div:gt(0)').toggleClass('hide-content');
                            $('.content-wrap').toggleClass('show-title');
                        } else {
                            location.href = '/my/groups/';
                        }
                    }
                }
            });

            $(window).off('resize.groups').on('resize.groups', function () {
                if ($('#side-reveal-icon').is(':visible') && $('#deleteGroupModal').is(':visible')) {
                    $('#deleteGroupModal').find('.close-reveal-modal').trigger('click');
                }
            });

            $('.js-notifications-edit').off('click.groups').on('click.groups', function () {
                var This = $(this).parent();
                This.addClass('hide').next().removeClass('hide');
                This.parent().next().removeClass('hide');
                This.parent().parent().addClass('groups-notification-open');
                if (!isIndirect) {
                    isIndirect = true;
                    $('[name="' + $(this).attr('name') + '"]').not(this).trigger('click');
                    isIndirect = false;
                }
            });

            $('.js-notifications-edit-small').off('click.groups').on('click.groups', function () {
                var This = $(this);
                This.addClass('hide');
                This.parent().next().removeClass('hide');
                This.parent().parent().addClass('groups-notification-open');
                if (!isIndirect) {
                    isIndirect = true;
                    $('[name="' + $(this).attr('name') + '"]').not(this).trigger('click');
                    isIndirect = false;
                }
            });

            $('.js-notification-close').off('click.groups').on('click.groups', function () {
                var This = $(this).parent();
                This.addClass('hide').prev().removeClass('hide');
                This.parent().next().addClass('hide');
                This.parent().parent().removeClass('groups-notification-open');
                if (!isIndirect) {
                    isIndirect = true;
                    $('[name="' + $(this).attr('name') + '"]').not(this).trigger('click');
                    isIndirect = false;
                }
            });

            $('.js-notification-close-small').off('click.groups').on('click.groups', function () {
                var This = $(this).parent().parent();
                This.addClass('hide').prev().find('.js-notifications-edit-small').removeClass('hide');
                This.parent().removeClass('groups-notification-open');
                if (!isIndirect) {
                    isIndirect = true;
                    $('[name="' + $(this).attr('name') + '"]').not(this).trigger('click');
                    isIndirect = false;
                }
            });
            
            $('.js-notify-qa-big').off('click.groups').on('click.groups', function(event) {
                if(event.target.id.match('discussion') && !$(this).is(':checked')) {
                    event.preventDefault();event.preventDefault();
                    confirmOff(this);
                } else {
                    handleQaSettingsToggle(this);
                }
            });
            $('.close-qa-reveal').off('click.groups').on('click.groups', function(event) {
                $('.close-reveal-modal').trigger('click');
            });

        }

        function confirmOff(This) {
            $('#qa-turnoff-alert').foundation('reveal', 'open');
            $('#turn-off-qa').off('click.groups').on('click.groups', function(){
                if($(This).is(':checked')) {
                    $(This).prop('checked', false);
                }
                handleQaSettingsToggle(This);
            });
        }
        function render(notifications, groupInfo) {
            var id = groupInfo.id;
            notifications = notifications.groupNotifications;
            if (!(notifications.hasOwnProperty(id)) || notifications[id].hasOwnProperty('message')) {
                groupSettingsController.nonMember();
                return;
            }
            groupID = id;
            var groupLink, groupName, groupCode, shareFrequency, peerhelpFrequency, goToServer, groupCount;
            require(['text!groups/templates/group.settings.html'], function (pageTemplate) {
                $('#group-settings-link').addClass('cursor-default').parent().addClass('active');

                $('#group-details-container').append($(pageTemplate).find('#group-settings-container').html());
                if (location.hash === '#registration') {
                    $('#group-details-container').addClass('hide');
                    $('.mobile-settings').css('left', '-100%');
                    $('.registration-instr-wrapper').removeClass('hide');
                    setTimeout(function () {
                        $('#group-details-container').removeClass('hide');
                    }, 600);
                }
                $('#group-settings').append($(pageTemplate).find('#deleteGroupModal')).append($(pageTemplate).find('#qa-turnoff-alert'));
                if ($('#group-assignments-link').length) {
                    $('.group-type').append('class:');
                    $('.link_studygroup').remove();
                    $('.js-for-study').remove();
                } else {
                    $('.group-type').append('study group:');
                    $('.link_class').remove();
                    $('.js-for-class').remove();
                }
                groupName = $('#group-name').text() || '';
                $('.js-group-name').text(groupName);
                groupCode = $('#group-name').attr('data-access-code') || '';
                groupLink = webroot_url + 'join/group/?accessCode=' + groupCode;
                groupCount = $("#group-members-count").text();
                goToServer = '1. Go to ' + location.hostname;
                $('.js-join-group-link').val(groupLink);
                $('.js-instructions-goToUrl').text(goToServer);
                $('.js-instructions-group-link').text(groupLink);
                $('.js-join-group-code').val(groupCode);
                $('.js-instructions-group-code').append(groupCode);
                $('.js-view-members-link').attr('href', webroot_url +'group-members/' + groupID);
                $('.js-group-member-count').html(groupCount);
                if ($('#image-edit-link').length) {
                    $('#group-details-container').find('.js-only-member').remove();
                } else {
                    $('#group-details-container').find('.js-only-leader').remove();
                    $('.mobile-settings').addClass('hide-important');
                    $('.email-noti-wrapper').removeClass('hide');
                }

                rosterGroup = { id: groupID,
                                accessCode: groupCode,
                                name: groupName };
                bindEvents();
                isRender = true;
                isIndirect = true;
                shareFrequency = notifications[groupID].GROUP_SHARE.frequency;
                if (notifications[groupID].hasOwnProperty('GROUP_PH_POST')) {
                    $('.js-peerHelp-all').trigger('click');
                } else {
                    $('.js-peerHelp-my').trigger('click');
                }
                peerhelpFrequency = notifications[groupID].GROUP_PH_POST || notifications[groupID].PH_POST;
                peerhelpFrequency = peerhelpFrequency.frequency;
                if ('off' === shareFrequency) {
                    $('[name="resourceShared"]').prop('checked', false);
                    $('.js-share-off').removeClass('hide');
                    $('.js-share-on').addClass('hide1');
                } else {
                    $('[name="resourceShared"]').prop('checked', true);
                    $('#share-' + shareFrequency + '-big-common').trigger('click');
                    $('#share-' + shareFrequency + '-small-leader').trigger('click');
                    $('#share-' + shareFrequency + '-small-member').trigger('click');
                    $('.js-share-off').addClass('hide');
                    $('.js-share-on').removeClass('hide1');
                }
                if ('off' === peerhelpFrequency) {
                    $('[name="peerHelp"]').prop('checked', false);
                    $('.js-peerhelp-off').removeClass('hide');
                    $('.js-peerhelp-on').addClass('hide1');
                } else {
                    $('[name="peerHelp"]').prop('checked', true);
                    $('#peerhelp-' + peerhelpFrequency + '-big-common').trigger('click');
                    $('#peerhelp-' + peerhelpFrequency + '-small-leader').trigger('click');
                    $('#peerhelp-' + peerhelpFrequency + '-small-member').trigger('click');
                    $('.js-peerhelp-off').addClass('hide');
                    $('.js-peerhelp-on').removeClass('hide1');
                }
                if(groupInfo.enableQA === true) {
                    $('[name = enableQA]').prop('checked', true);
                    $('[name = allowAnonymous]').removeAttr('disabled', 'disabled').parent().removeClass('anonymous-disabled');
                } else {
                    $('[name = enableQA]').prop('checked', false);
                    $('[name = allowAnonymous]').attr('disabled', 'disabled').parent().addClass('anonymous-disabled');;
                }
                if(groupInfo.allowAnonymous === true) {
                    $('[name = allowAnonymous]').prop('checked', true);
                } else {
                    $('[name = allowAnonymous]').prop('checked', false);
                }
                isRender = false;
                isIndirect = false;
                util.ajaxStop();
            });
        }

        this.render = render;

    }

    return new groupSettingsView();
});
