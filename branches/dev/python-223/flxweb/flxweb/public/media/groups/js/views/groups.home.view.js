define(['jquery', 'common/utils/date', 'common/utils/modality', 'common/utils/user', 'common/utils/utils','common/views/modal.view'], function ($, date, modality, userInfoModel, util, ModalView) {
    'use strict';

    var groupsController, groupInfoController, groupID, ck12EmailVerified,
        moreGroups = [],
        saveInProgress = false;
    require(['groups/controllers/groups.home'], function (controller) {
        groupsController = controller;
    });
    require(['groups/controllers/group.info'], function (controller) {
        groupInfoController = controller;
    });

    function groupsHomeView() {

        var qaEnabled = true;

        function emailSent() {
            $('a.js-resend-email').addClass('hide-important').next().removeClass('hide-important');
        }

        function updateGroupDetails(group) {
            if ('error' === group) {
                console.log('Sorry, we were not able to save the group details right now. Please try again after some time.');
                group = '';
            } else if (group.response.hasOwnProperty('message')) {
                if (group.response.message.toLowerCase().match('already existing group') || group.response.message.toLowerCase().match('already exists')) {
                    if ($('#side-reveal-icon').is(':visible')) {
                    	ModalView.alert('You already created a group with that name. Enter a unique name so you can tell them apart.');
                    } else {
                        $('#group-edit-wrong-error').removeClass('hide');
                    }
                }
                group = '';
                saveInProgress = false;
                return false;
            }
            $('#group-title').text($('#group-name-edit-small').val());
            $('.dashboard-widget[id=' + groupID + '] .js-group-name').text($('#group-name-edit-small').val());
            var description = $('#group-description-edit-small').val();
            $('#group-detail-description').text(description || '');
            if (description) {
                $('#no-description-conatiner').addClass('hide');
                $('#description-container').removeClass('hide');
            } else {
                $('#description-container').addClass('hide');
            }
            $('#group-image')[0].src = $('#group-image-edit-small')[0].src;
            $('.dashboard-widget[id=' + groupID + '] .group-image')[0].src = $('#group-image-edit-small')[0].src;
            $('#group-image').attr('data-resourcerevisionid', $('#group-image-edit-small').attr('data-resourcerevisionid'));
            $('#group-info-cancel-small').trigger('click');
            saveInProgress = false;
        }

        function saveGroupDetails() {
            var group, groupName, groupDescription, groupImage, groupType;
            groupName = $('#group-name-edit-small').val();
            groupDescription = $('#group-description-edit-small').val();
            groupImage = $('.js-group-image-main:visible').attr('data-resourcerevisionid');
            groupName = $.trim(groupName);
            groupType = $('#group-assignments-link').length ? 'class' : 'study';
            group = {
                'groupID': groupID,
                'newGroupName': groupName,
                'newGroupDesc': groupDescription,
                'resourceRevisionID': groupImage,
                'groupType': groupType
            };
            groupInfoController.updateGroup(updateGroupDetails, group);
        }

        function bindEventsGroupInfo() {
            $('body').off('navigateBack.group-menu').on('navigateBack.group-menu', function () {
                $('#groups-content').removeClass('hide-for-small');
                $('#group-main-info-container').addClass('hide-important');
                $('.title-area').removeClass('visible');
                $('.back-icon').removeClass('visible').addClass('hide-one hidden');
                $('.title-area .name').removeClass('hide-small');
            });
            $('.side-nav li').off('click.nav').on('click.nav', function () {
                if ($(this).hasClass('group-discussion-link') && qaEnabled === false) {
                    return false;
                }
                location.href = $(this).find('a').attr('href');
            });
            $('.js-group-detail-edit').off('click.groups-overview').on('click.groups-overview', function () {
                $('#group-main-info-container').addClass('hide-important');
                $('.js-small-edit').removeClass('hide-important');
                $('#group-name-edit-small').val($('#group-title').text());
                $('#group-description-edit-small').val($('#group-detail-description').text());
                $('#group-image-edit-small')[0].src = $('#group-image')[0].src;
                $('#group-image-edit-small').attr('data-resourcerevisionid', $('#group-image').attr('data-resourcerevisionid'));
            });
            $('#group-info-cancel-small').off('click.groups-overview').on('click.groups-overview', function () {
                $('#group-main-info-container').removeClass('hide-important');
                $('.js-small-edit').addClass('hide-important');
            });
            $('#group-info-save-small').off('click.groups-overview').on('click.groups-overview', function () {
                if (!saveInProgress) {
                    if ($.trim($('#group-name-edit-small').val()).length) {
                        saveInProgress = true;
                        saveGroupDetails();
                    } else {
                    	ModalView.alert('Enter a name for your group. For example: Math Geeks Unite!');
                    }
                }
            });
            $('#group-edit-image-small').off('click.groups-overview').on('click.groups-overview', function () {
                $('#editImageModal').foundation('reveal', 'open');
                loadImagesForCreate();
                $('.js-image-edit-border').parent().removeClass('add-border').children().removeClass('group-image-select');
                $('.js-image-edit-border').filter(function () {
                    return $(this).prop('src') === $('#group-image-edit-small')[0].src;
                }).parent().addClass('add-border').children().eq(1).addClass('group-image-select');
            });
        }

        function setGroupMenuInfo(groupInfo) {
            var groupDescription, ck12PeerHelpClientID, phFilters, $groupDiscussionLink = $('#group-discussions-link');
            $('.title-area').addClass('visible');
            $('.back-icon').removeClass('hide-one hidden').addClass('visible');
            $('.title-area .name').addClass('hide-small');
            $('#groups-content').addClass('hide-for-small');
            groupInfo = groupInfo.response.group;
            qaEnabled = groupInfo.enableQA;
            $('#group-home-link').attr('href', '/group/' + groupID);
            $('#group-assignments-link').attr('href', '/group-assignments/' + groupID);
            $('#group-resources-link').attr('href', '/group-resources/' + groupID);
            $('#group-members-link').attr('href', '/group-members/' + groupID);
            $('#group-settings-link').attr('href', '/group-settings/' + groupID);
            $('#group-reports-link').attr('href', '/group-reports/' + groupID + '/');
            if (groupInfo.enableQA === false) {
                $groupDiscussionLink.removeAttr('href').parent().addClass('QAdisabled');
            } else {
                $groupDiscussionLink.attr('href', '/group-discussions/' + groupID).parent().removeClass('QAdisabled');
            }
            $groupDiscussionLink.attr({
                'data-allow-anonymous': groupInfo.allowAnonymous,
                'data-enable-qa': groupInfo.enableQA
            });

            $('#group-members-count,.group-members-count').html(groupInfo.membersCount || '0');
            $('#group-resources-count').html(groupInfo.resourcesCount || '0');
            $('#group-assignments-count').html(groupInfo.assignmentsCount || '0');

            // Get PeerHelp post count (group discussions post count)
            ck12PeerHelpClientID = 24839961;
            phFilters = {
                groupIDs: [groupID]
            };
            phFilters = JSON.stringify(phFilters);
            if (!window.PeerHelp) {
                $.ajax({
                    type: 'GET',
                    url: '/peerhelp/api/get/posts?clientID=' + ck12PeerHelpClientID + '&filters=' + phFilters,
                    success: function (data) {
                        if (data.response.total !== undefined) {
                            $('#group-discussions-count').html(data.response.total);
                        }
                    },
                    error: function () {
                        $('#group-discussions-count').html(0);
                        console.log('error in Q&A GET');
                    }
                });
            }

            if ('class' !== groupInfo.groupType) {
                $('.only-for-class').addClass('hide');
            } else {
                $('.only-for-class').removeClass('hide');
            }

            if (groupInfo.resource) {
                $('#group-image').attr('src', groupInfo.resource.uri || '');
                $('#group-image').attr('data-resourcerevisionid', groupInfo.resource.id || '');
            }

            if (groupInfo.creator && groupInfo.creator.authID === parseInt($('#groups-content').attr('data-user'), 10)) {
                $('.js-group-detail-edit').removeClass('hide');
            } else {
                $('.js-group-detail-edit').addClass('hide');
            }
            $('#group-title').text(groupInfo.name);
            $('#group-title').attr('data-access-code', groupInfo.accessCode || '');
            $('#group-name-edit').val(groupInfo.name || '');

            groupDescription = groupInfo.description;
            if (groupDescription) {
                $('#group-detail-description').text(groupDescription);
                $('#group-detail-description-edit').val(groupDescription);
            }
        }

        function getGroupMenuCallback(groupInfo) {
            $('#group-main-info-container').removeClass('hide-important');
            if (groupInfo) {
                groupID = groupInfo.response.group.id;
                setGroupMenuInfo(groupInfo);
                bindEventsGroupInfo();
                $(document).scrollTop(0);
            }
        }

        function checkForNoGroups() {
            if ($('#groups-row').children(':visible').length) {
                $('#no-groups').addClass('hide');
            } else {
                $('#no-groups').removeClass('hide');
            }
        }

        function filterType(selection) {
            $('.dashboard-widget:visible', '#groups-row').each(function () {
                if (selection !== $(this).attr('data-type')) {
                    $(this).addClass('hide');
                }
            });
        }

        function filterRole(selection) {
            $('.dashboard-widget:visible', '#groups-row').each(function () {
                if (selection !== $(this).attr('data-role')) {
                    $(this).addClass('hide');
                }
            });
        }

        function filterGroupsByType(isIndirect) {
            var indirect = true;
            if ($('.js-class:visible').hasClass('checked') && $('.js-study-group:visible').hasClass('checked')) {
                $.cookie('flxgroupsclass', 'true', {
                    path: '/'
                });
                $.cookie('flxgroupsstudy', 'true', {
                    path: '/'
                });
            } else if ($('.js-class:visible').hasClass('checked')) {
                $.cookie('flxgroupsclass', 'true', {
                    path: '/'
                });
                $.cookie('flxgroupsstudy', 'false', {
                    path: '/'
                });
                filterType('CLASS');
            } else if ($('.js-study-group:visible').hasClass('checked')) {
                $.cookie('flxgroupsclass', 'false', {
                    path: '/'
                });
                $.cookie('flxgroupsstudy', 'true', {
                    path: '/'
                });
                filterType('STUDY GROUP');
            } else { // no filters checked
                $.cookie('flxgroupsclass', 'false', {
                    path: '/'
                });
                $.cookie('flxgroupsstudy', 'false', {
                    path: '/'
                });
                if ('none' === isIndirect) {
                    $('.dashboard-widget', '#groups-row').addClass('hide');
                }
                indirect = 'none';
            }
            if (!isIndirect) {
                filterGroupsByRole(indirect);
            }
            checkForNoGroups();
        }

        function filterGroupsByRole(isIndirect) {
            var indirect = true;
            if ($('.js-group-owner:visible').hasClass('checked') && $('.js-group-member:visible').hasClass('checked')) {
                $.cookie('flxgroupsowner', 'true', {
                    path: '/'
                });
                $.cookie('flxgroupsmember', 'true', {
                    path: '/'
                });
            } else if ($('.js-group-owner:visible').hasClass('checked')) {
                $.cookie('flxgroupsowner', 'true', {
                    path: '/'
                });
                $.cookie('flxgroupsmember', 'false', {
                    path: '/'
                });
                filterRole('owner');
            } else if ($('.js-group-member:visible').hasClass('checked')) {
                $.cookie('flxgroupsowner', 'false', {
                    path: '/'
                });
                $.cookie('flxgroupsmember', 'true', {
                    path: '/'
                });
                filterRole('member');
            } else { // no filters checked
                $.cookie('flxgroupsowner', 'false', {
                    path: '/'
                });
                $.cookie('flxgroupsmember', 'false', {
                    path: '/'
                });
                if ('none' === isIndirect) {
                    $('.dashboard-widget', '#groups-row').addClass('hide');
                }
                indirect = 'none';
            }
            if (!isIndirect) {
                filterGroupsByType(indirect);
            }
            checkForNoGroups();
        }

        function bindEvents() {

            $('.js-create-group-button').off('click.create').on('click.create', function () {
                loadImagesForCreate();
                loadSubjectsForCreate();
                if ($('#side-reveal-icon').is(':visible')) {
                    $('.groups-body-wrapper').addClass('hide-content');
                    $('.create-join-group-container').removeClass('hide-important');
                    $('.join-group-small').addClass('hide');
                    $('.user-data-main-container').removeClass('hide');
                    $('.back-icon', '.title-area').addClass('visible');
                    $('#group-name-small').val('');
                    $('#group-description-small').val('');
                } else {
                    $('#group-name').val('');
                    $('#group-description').val('');
                    $('#create-group-final').text('Create Group');
                    $('#createGroupModal').foundation('reveal', 'open');
                    $('.js-group-title').trigger('change');
                    if ('student' === $('#groups-content').attr('data-user-role').toLowerCase()) {
                        $('[data-type="study"]').next().trigger('click');
                    } else {
                        $('[data-type="class"]').next().trigger('click');
                    }
                }
            });

            $('.js-join-group-button').off('click.create').on('click.create', function () {
                if ($('#side-reveal-icon').is(':visible')) {
                    $('.groups-body-wrapper').addClass('hide-content');
                    $('.create-join-group-container').removeClass('hide-important');
                    $('.user-data-main-container').addClass('hide');
                    $('.join-group-small').removeClass('hide');
                    $('.back-icon', '.title-area').addClass('visible');
                }
                $('.js-join-group-code').val('');
                $('.js-join-group-error').addClass('hide');
                $('.js-join-group-code').removeClass('input-required');
            });

            //join group dialog close button
            $('.js-close-modal').off('click.theme').on('click.theme', function () {
                $('#joinGroupModal').find('.close-reveal-modal').trigger('click');
            });

            $('.js-role-filters').off('click.group').on('click.group', function () {
                if ($(this).children(':eq(0)').hasClass('js-group-owner')) {
                    $('.js-group-owner').toggleClass('checked');
                } else {
                    $('.js-group-member').toggleClass('checked');
                }
                $('.dashboard-widget', '#groups-row').removeClass('hide');
                filterGroupsByRole();
            });

            $('.js-type-filters').off('click.group').on('click.group', function () {
                if ($(this).children(':eq(0)').hasClass('js-class')) {
                    $('.js-class').toggleClass('checked');
                } else {
                    $('.js-study-group').toggleClass('checked');
                }
                $('.dashboard-widget', '#groups-row').removeClass('hide');
                filterGroupsByType();
            });

            $('.js-group-members').off('click.groups').on('click.groups', function () {
                var groupsID = $(this).parents('.dashboard-widget')[0].id;
                location.href = '/group-members/' + groupsID;
            });

            $('.js-share-link').off('click.groups').on('click.groups', function () {
                var groupsID = $(this).parents('.dashboard-widget')[0].id;
                location.href = '/group-resources/' + groupsID;
            });

            $('.js-assign-link').off('click.groups').on('click.groups', function () {
                var groupsID = $(this).parents('.dashboard-widget')[0].id;
                location.href = '/group-assignments/' + groupsID;
            });

            $('.js-group-header').off('click.groups').on('click.groups', function () {
                var groupsID, groups = {};
                groupsID = this.parentNode.id;
                groups.groupID = groupsID;
                if ($(window).width() < 767) { // only for smartphones
                    groupsController.getGroupMenu(getGroupMenuCallback, groups);
                } else if ('1' === $(this).siblings().find('span.members-count').text()) {
                    location.href = '/group/' + groupsID;
                } else if ($(this).parent().data('enable-qa') !== false) {
                    location.href = '/group-discussions/' + groupsID;
                } else {
                    location.href = '/group/' + groupsID;
                }
            });

            $('.assignmentLink').off('click.groups').on('click.groups', function () {
                var groupsID = $(this).parents('.dashboard-widget')[0].id;
                location.href = '/group-assignments/' + groupsID;
            });

            function joinGroupCallback(result) {
                if (result) {
                    if ('error' === result) {
                        console.log('Sorry, we could not join you to the group at this time. Please try again later.');
                    } else if (result.hasOwnProperty('message')) {
                        $('.js-join-group-error').addClass('hide');
                        if (result.message.toLowerCase().match('does not match')) {
                            $('.js-group-join-wrong-error').removeClass('hide');
                            $('.js-join-group-code:visible').addClass('input-required');
                        } else if (result.message.toLowerCase().match('already in the group')) {
                            $('.js-group-join-member-error').removeClass('hide');
                            $('.js-join-group-code:visible').addClass('input-required');
                        } else {
                            $('.js-group-join-api-error').removeClass('hide');
                            $('.js-join-group-code:visible').addClass('input-required');
                        }
                    } else {
                        if ($('#side-reveal-icon').is(':visible')) {
                            $('.js-cancel-join').trigger('click');
                        } else {
                            $('#joinGroupModal').find('.close-reveal-modal').trigger('click');
                        }
                        try {
                            if (result.hasOwnProperty('qa') && result.qa.hasOwnProperty('enableQA') && result.qa.enableQA) {
                                location.href = '/group-discussions/' + result.groupID;
                            } else {
                                location.href = '/group/' + result.groupID;
                            }
                        } catch (e) {
                            location.href = '/group/' + result.groupID;
                        }
                    }
                }
            }

            $('.js-join-group').off('click.groups').on('click.groups', function () {
                var accessCode = $('.js-join-group-code:visible').val();
                accessCode = $.trim(accessCode);
                if (accessCode) {
                    accessCode = {
                        'accessCode': accessCode
                    };
                    groupsController.joinGroup(joinGroupCallback, accessCode);
                } else {
                    $('.js-join-group-code:visible').val('');
                    $('.js-group-join-empty-error').removeClass('hide');
                    $('.js-join-group-code:visible').addClass('input-required');
                }
            });

            $('.js-join-group-code').off('keypress.error').on('keypress.error', function (e) {
                $('.js-join-group-error').addClass('hide');
                $(this).removeClass('input-required');
                if (13 === (e.which || e.keyCode)) {
                    $('.js-join-group:visible').trigger('click');
                }
            }).off('change.error').on('change.error', function () {
                $('.js-join-group-error').addClass('hide');
                $(this).removeClass('input-required');
            });

            function createGroupCallback(result) {
                $('#create-group-final').text('Create Group');
                if ('error' === result) {
                    $('.close-reveal-modal', '#createGroupModal').trigger('click');
                    console.log('Sorry, we could not create the group at this time. Please try again later.');
                } else if (0 !== result.responseHeader.status) {
                    if (result.response.message.toLowerCase().match('already existing group') || result.response.message.toLowerCase().match('already exists')) {
                        if ($('#side-reveal-icon').is(':visible')) {
                            $('#group-create-wrong-error-small').removeClass('hide');
                        } else {
                            $('#group-create-wrong-error').removeClass('hide');
                        }
                        $('#group-name').addClass('input-required');
                    } else {
                        $('.close-reveal-modal', '#createGroupModal').trigger('click');
                        ModalView.alert('Sorry, we could not create the group at this time. Please try again later.');
                    }
                } else {
                    if ($('#side-reveal-icon').is(':visible')) {
                        $('.groups-body-wrapper').removeClass('hide-content');
                        $('.create-join-group-container').addClass('hide-important');
                        $('.user-data-main-container').addClass('hide');
                    } else {
                        $('#joinGroupModal').find('.close-reveal-modal').trigger('click');
                    }
                    $('#create-group-final').text('Your Group Created');
                    $('.close-reveal-modal', '#createGroupModal').trigger('click');
                    $('#groups-row').empty();

                    location.href = '/group/' + result.response.group.id;
                    // groupsController.getGroups();
                }
            }

            function createGroup(e) {
                e.preventDefault();
                var title, description, group, type, image, groupSubjects;
                title = $('.js-group-title:visible').val();
                title = $.trim(title);
                description = $('.js-group-description:visible').val();
                type = $('.js-group-type-option:visible').find(':checked').attr('data-type');
                image = $('.js-group-home-image-edit:visible').find('.theme-select').attr('data-resourceRevisionID');
                if (!image) {
                    image = $('#image-select').find('.js-theme-container:eq(0)');
                    image.trigger('click');
                    image = image.attr('data-resourceRevisionID');
                }
                if (title) {
                    $('#create-group-final').text('Creating your Group...');
                    groupSubjects = $('#group-subjects').val();
                    group = {
                        'groupName': title,
                        'groupDescription': description,
                        'groupScope': 'closed',
                        'groupType': type,
                        'resourceRevisionID': image,
                        'groupSubjects': groupSubjects instanceof Array ? groupSubjects.join(',') : ''
                    };
                    groupsController.createGroup(createGroupCallback, group);
                } else {
                    $('.js-group-title:visible').val('');
                    if ($('#side-reveal-icon').is(':visible')) {
                        $('#group-create-empty-error-small').removeClass('hide');
                    } else {
                        $('#group-create-empty-error').removeClass('hide');
                    }
                    $('.js-group-title:visible').addClass('input-required');
                }
            }

            $('.js-create-group-final').off('click.create').on('click.create', createGroup);

            $('#create-group').off('submit.create').on('submit.create', function (e) {
                e.preventDefault();
                $('.js-create-group-final').trigger('click');
            });

            $('.js-group-title').off('keypress.error').on('keypress.error', function () {
                $('.js-create-group-error').addClass('hide');
                $('.js-group-title').removeClass('input-required');
            }).off('change.error').on('change.error', function () {
                $('.js-create-group-error').addClass('hide');
                $('.js-group-title').removeClass('input-required');
            });
            $('.js-cancel-join').off('click.groups').on('click.groups', function () {
                $('.groups-body-wrapper').removeClass('hide-content');
                $('.join-group-small').addClass('hide');
                $('.create-join-group-container').addClass('hide-important');
                $('.back-icon', '.title-area').removeClass('visible');
            });
            $('#image-edit-select').off('click.edit-image').on('click.edit-image', function () {
                $('#editImageModal').foundation('reveal', 'open');
                $('.js-image-edit-border').parent().removeClass('add-border').children().removeClass('group-image-select');
                $('.js-image-edit-border[src="' + $('#image-edit-select img').attr('src') + '"]').parent().addClass('add-border');
                $('.js-image-edit-border[src="' + $('#image-edit-select img').attr('src') + '"]').parent().children().eq(1).addClass('group-image-select');
            });

            $('body').off('navigateBack.group-menu').on('navigateBack.group-menu', function () {
                if ($('.groups-body-wrapper').hasClass('hide-content')) {
                    $('.groups-body-wrapper').removeClass('hide-content');
                    $('.create-join-group-container').addClass('hide-important');
                    $('.user-data-main-container').addClass('hide');
                    $('.join-group-small').addClass('hide');
                    $('.back-icon', '.title-area').removeClass('visible');
                }
            });
            $(window).off('resize.groupsHome').on('resize.groupsHome', function () {
                if (window.innerWidth > 767) {
                    if ($('#editImageModal').is(':visible')) {
                        $('#editImageModal').foundation('reveal', 'close');
                    }
                }
                if (window.innerWidth < 768) {
                    if ($('#createGroupModal').is(':visible') || $('#joinGroupModal').is(':visible')) {
                        $('#createGroupModal').foundation('reveal', 'close');
                        $('#joinGroupModal').foundation('reveal', 'close');
                    }
                }
            });

            $('.js-resend-email').off('click.verify').on('click.verify', function () {
                groupsController.resendVerficationEmail();
            });

        }

        function renderGroups(groupActivity, currentTime) {
            if (groupActivity instanceof Array && groupActivity.length) {
                if (!($('#groups-row').length)) {
                    moreGroups = moreGroups.concat(groupActivity);
                    return;
                }
                groupActivity = groupActivity.concat(moreGroups);
                require(['text!groups/templates/groups.card.html',
                        'text!groups/templates/groups.card.class.zero.html',
                        'text!groups/templates/groups.card.study.zero.html',
                        'text!groups/templates/groups.card.assign.html',
                        'text!groups/templates/groups.card.join.html',
                        'text!groups/templates/groups.card.share.html',
                        'text!groups/templates/groups.card.discussion.html'
                    ],
                    function (activityTemplate,
                        classGroupTemplate,
                        studyGroupTemplate,
                        assignTemplate,
                        joinTemplate,
                        shareTemplate,
                        discussionTemplate) {

                        var activity, groupIndex, index, template, temp, discussionOwnerID, time, singleImage, imgCount,
                            parsedTitle, discussionOwner, activityOwner, discussionTitle, discussionHTML, dHTMLLength, discussionSplit, k,
                            activityHTMLString = '',
                            activityHTML = '',
                            activityType = '',
                            currentActivityType = '',
                            qaDisabled = false;
                        for (groupIndex = 0; groupIndex < groupActivity.length; groupIndex++) {
                            activityHTMLString = '';
                            qaDisabled = false;
                            activity = groupActivity[groupIndex].activities;
                            if (activity.length !== 0) {
                                for (index = 0; index < activity.length; index++) {
                                    activityHTML = '';
                                    currentActivityType = activity[index].activityType;
                                    if ('share' === currentActivityType) {
                                        activityHTML = shareTemplate;
                                        if (activity[index].artifact) {
                                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, activity[index].artifact.title || '');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, '');
                                        }
                                        if (activity[index].hasOwnProperty('activityData') && !($.isEmptyObject(activity[index].activityData))) {
                                            activityHTML = activityHTML.replace(/@@activityLink@@/g, activity[index].activityData.url || '');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityLink@@/g, modality.getURLfromJSON(activity[index] || ''));
                                        }
                                        if (activity[index].owner) {
                                            activityOwner = activity[index].owner.name || '';
                                            activityOwner = activityOwner.replace(/&/g, '&amp;')
                                                .replace(/</g, '&lt;')
                                                .replace(/>/g, '&gt;')
                                                .replace(/"/g, '&quot;');
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activityOwner);
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, activity[index].owner.authID || '');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                                        }
                                    } else if ('assign' === currentActivityType || 'unassign' === currentActivityType || 'change-due-date' === currentActivityType || 'assignment-delete' === currentActivityType || 'assignment-edit' === currentActivityType) {
                                        activityHTML = assignTemplate;
                                        if ('change-due-date' === currentActivityType) {
                                            activityHTML = activityHTML.replace(/@@changedue@@/g, 'due date @@dueDate@@');
                                            activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentLink dueDateChange');
                                            activityHTML = activityHTML.replace(/@@due@@/g, 'dueDateGroup');
                                            activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                            activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                            activityType = 'changed';
                                        } else {
                                            activityHTML = activityHTML.replace(/@@due@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@changedue@@/g, '');
                                            if ('unassign' === currentActivityType) {
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentNoLink');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                                activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                                activityType = 'removed';
                                            } else if ('assign' === currentActivityType) {
                                                activityHTML = activityHTML.replace(/@@dueDate@@/g, 'assigned');
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentLink');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                                activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                                activityType = 'assigned';
                                            } else if ('assignment-edit' === currentActivityType) {
                                                activityHTML = activityHTML.replace(/@@dueDate@@/g, 'updated');
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentLink');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                                if (activity[index].activityData['orig-name'] !== undefined) {
                                                    activity[index].activityData['orig-name'] = (activity[index].activityData['orig-name'] || '').replace(/&/g, '&amp;')
                                                        .replace(/</g, '&lt;')
                                                        .replace(/>/g, '&gt;')
                                                        .replace(/"/g, '&quot;');
                                                    activityHTML = activityHTML.replace(/@@activityPrevTitle@@/g, activity[index].activityData['orig-name'] + ' ');
                                                    activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'previousTitleGroup');
                                                    activityHTML = activityHTML.replace(/@@changedTo@@/g, '');
                                                } else {
                                                    activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                    activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                                }

                                                activityType = 'updated @@isNameUpdate@@';
                                            } else {
                                                activityType = 'deleted';
                                                activityHTML = activityHTML.replace(/@@dueDate@@/g, 'deleted');
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentNoLink');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'assignmentDelete');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                            }
                                        }
                                        activityHTML = activityHTML.replace(/@@activityType@@/g, activityType);
                                        if (activity[index].activityData) {
                                            activity[index].activityData.name = (activity[index].activityData.name || '').replace(/&/g, '&amp;')
                                                .replace(/</g, '&lt;')
                                                .replace(/>/g, '&gt;')
                                                .replace(/"/g, '&quot;');

                                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, activity[index].activityData.name || '');
                                            if (activity[index].activityData.due && activity[index].activityData.due != "none") {
                                                temp = (activity[index].activityData.due || '').replace(/\-/g, '/');
                                                temp = new Date(temp);
                                                temp = temp.getMonth() || 0 === temp.getMonth() ? (temp.getMonth() + 1) + '/' + temp.getDate() + '/' + (temp.getYear() + 1900) : '';
                                                activityHTML = activityHTML.replace(/@@dueDate@@/g, 'due date changed to ' + temp);
                                                activityHTML = activityHTML.replace(/@@dueDateTo@@/g, 'due date to ' + temp);
                                            } else {
                                                activityHTML = activityHTML.replace(/@@dueDate@@/g, 'due date removed');
                                            }
                                            if (activity[index].activityData.hasOwnProperty('concepts-added') || activity[index].activityData.hasOwnProperty('concepts-removed')) {
                                                activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, '');
                                            } else {
                                                activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, 'name');
                                            }
                                        } else {
                                            activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, '');
                                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, '');
                                            activityHTML = activityHTML.replace(/@@dueDate@@/g, 'due date removed');
                                        }
                                        if (activity[index].owner) {
                                            activityOwner = activity[index].owner.name || '';
                                            activityOwner = activityOwner.replace(/&/g, '&amp;')
                                                .replace(/</g, '&lt;')
                                                .replace(/>/g, '&gt;')
                                                .replace(/"/g, '&quot;');
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activityOwner);
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, activity[index].owner.authID || '');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                                        }
                                    } else if ('join' === currentActivityType || 'leave' === currentActivityType) {
                                        activityHTML = joinTemplate;
                                        if (activity[index].member) {
                                            activityOwner = activity[index].member.name || '';
                                            activityOwner = activityOwner.replace(/&/g, '&amp;')
                                                .replace(/</g, '&lt;')
                                                .replace(/>/g, '&gt;')
                                                .replace(/"/g, '&quot;');
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activityOwner);
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, activity[index].member.authID || '');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                                        }
                                        if ('join' === currentActivityType) {
                                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'Joined');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'Left');
                                        }
                                    } else if ('ph-comment' === currentActivityType ||
                                        'ph-question' === currentActivityType ||
                                        'ph-answer' === currentActivityType) {
                                        if (groupActivity[groupIndex].enableQA !== false) {
                                            activityHTML = discussionTemplate;
                                            parsedTitle = '';
                                            discussionOwner = activity[index].owner;
                                            // Handle posts from anonymous users
                                            if (activity[index].activityData && activity[index].activityData.post) {
                                                if (activity[index].activityData.post.isAnonymous === true) {
                                                    activityOwner = 'Anonymous';
                                                    discussionOwnerID = 'anonymous';
                                                } else {
                                                    discussionOwnerID = discussionOwner.id;
                                                    activityOwner = discussionOwner.name;
                                                }
                                                discussionTitle = activity[index].activityData.post.content;
                                            } else {
                                                activityOwner = 'Anonymous';
                                                discussionOwnerID = 'anonymous';
                                                discussionTitle = "Content is too long to display";
                                            }

                                            activityOwner = activityOwner.replace(/&/g, '&amp;')
                                                .replace(/</g, '&lt;')
                                                .replace(/>/g, '&gt;')
                                                .replace(/"/g, '&quot;');
                                            discussionHTML = jQuery.parseHTML(discussionTitle);
                                            dHTMLLength = discussionHTML.length;
                                            discussionSplit = [];
                                            singleImage = null;
                                            imgCount = 0;
                                            // pull out text content
                                            for (k = 0; k < dHTMLLength; k++) {
                                                if (discussionHTML[k].localName === null && discussionHTML[k].data) {
                                                    discussionSplit.push(discussionHTML[k].data);
                                                }
                                                // handle link content
                                                else if (discussionHTML[k].tagName === 'A') {
                                                    discussionSplit.push(discussionHTML[k].innerHTML);
                                                } else if (['SPAN', 'DIV', 'P', 'OL', 'UL'].indexOf(discussionHTML[k].tagName) !== -1) {
                                                    try{
                                                        //if only image in present in post, embedded inside p tag
                                                        if ($.parseHTML(discussionHTML[k].innerHTML.replace(/&nbsp;/g,'').trim())[0].tagName == 'IMG'){
                                                            imgCount++;
                                                            //singleImage = $.parseHTML(discussionHTML[k].innerHTML.replace(/&nbsp;/g,'').trim())[0];
                                                            singleImage = 'Image';
                                                        }else{
                                                            discussionSplit.push(discussionHTML[k].textContent);
                                                        }
                                                    }catch(e){
                                                        discussionSplit.push(discussionHTML[k].textContent);
                                                    }
                                                }
                                                // get 1 image, print image if there is no text content in the parsedTitle
                                                else if (imgCount === 0 && discussionHTML[k].tagName === 'IMG') {
                                                    imgCount++;
                                                    //singleImage = discussionHTML[k];
                                                    singleImage = 'Image';
                                                }
                                            }
                                            k = 0;
                                            while (parsedTitle.length < 20 && discussionSplit[k]) {
                                                parsedTitle += discussionSplit[k] + ' ';
                                                k++;
                                            }
                                            if (parsedTitle.length === 0 && imgCount > 0) {
                                                parsedTitle = singleImage;
                                            } else {
                                                parsedTitle = parsedTitle.replace(/&nbsp;/g, '');
                                                parsedTitle = parsedTitle.trim();
                                                // handle very long strings
                                                if (parsedTitle.length > 75) {
                                                    parsedTitle = parsedTitle.substring(0, 75);
                                                    parsedTitle += '...';
                                                }
                                            }
                                            parsedTitle = parsedTitle.replace(/"/g, "'");
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, discussionOwnerID);
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activityOwner);
                                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, parsedTitle);
                                            activityHTML = activityHTML.replace(/@@activityLink@@/g, '/group-discussions/' + groupActivity[groupIndex].id);

                                            switch (currentActivityType) {
                                            case 'ph-comment':
                                                activityHTML = activityHTML.replace(/@@discussionType@@/g, 'commented');
                                                break;
                                            case 'ph-question':
                                                activityHTML = activityHTML.replace(/@@discussionType@@/g, 'asked');
                                                break;
                                            case 'ph-answer':
                                                activityHTML = activityHTML.replace(/@@discussionType@@/g, 'answered');
                                                break;
                                            default:
                                                throw new Error('Unhandled currentActivityType');
                                            }
                                        } else {
                                            qaDisabled = true;
                                        }
                                    }
                                    time = date.getTimeDifference(activity[index].creationTime || '', currentTime);
                                    activityHTML = activityHTML.replace(/@@activityTime@@/g, time.big);
                                    activityHTML = activityHTML.replace(/@@activityTimeSmall@@/g, time.small);
                                    activityHTMLString += activityHTML;
                                }
                            }

                            if ((activity.length === 0) || (activity.length === 1 && qaDisabled === true)) {
                                if (groupActivity[groupIndex].groupType === 'study') {
                                    template = studyGroupTemplate;
                                } else {
                                    template = classGroupTemplate;
                                }
                            } else {
                                template = activityTemplate.replace(/@@activityStamp@@/g, activityHTMLString);
                            }
                            template = template.replace(/@@totalMembers@@/g, groupActivity[groupIndex].membersCount || '');
                            if (groupActivity[groupIndex].resource) {
                                template = template.replace(/@@imageSrc@@/g, groupActivity[groupIndex].resource.uri || '');
                            } else {
                                template = template.replace(/@@imageSrc@@/g, '');
                            }
                            temp = (groupActivity[groupIndex].groupType || '').toLowerCase();
                            temp = 'study' === temp ? 'STUDY GROUP' : 'CLASS';
                            template = template.replace(/@@groupType@@/g, temp);
                            groupActivity[groupIndex].name = (groupActivity[groupIndex].name || '').replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;');

                            template = template.replace(/@@groupName@@/g, groupActivity[groupIndex].name || '');
                            template = template.replace(/@@groupID@@/g, groupActivity[groupIndex].id || '');
                            if (groupActivity[groupIndex].creator) {
                                if (groupActivity[groupIndex].creator.authID === parseInt($('header').attr('data-user'), 10)) {
                                    template = template.replace(/@@youIcon@@/g, '');
                                    template = template.replace(/@@groupRole@@/g, 'owner');
                                    template = template.replace(/@@ownerName@@/g, 'You');
                                    template = template.replace(/@@newAssignment@@/g, 'hide');
                                } else {
                                    template = template.replace(/@@youIcon@@/g, 'hide');
                                    template = template.replace(/@@groupRole@@/g, 'member');
                                    template = template.replace(/@@ownerName@@/g, groupActivity[groupIndex].creator.name || '');
                                    if (groupActivity[groupIndex].hasNewAssignment) {
                                        template = template.replace(/@@newAssignment@@/g, 'card-new-assignment');
                                    } else {
                                        template = template.replace(/@@newAssignment@@/g, 'hide');
                                    }
                                }
                            } else {
                                template = template.replace(/@@youIcon@@/g, 'hide');
                                template = template.replace(/@@groupRole@@/g, 'member');
                                template = template.replace(/@@ownerName@@/g, '');
                                if (groupActivity[groupIndex].hasNewAssignment) {
                                    template = template.replace(/@@newAssignment@@/g, 'card-new-assignment');
                                } else {
                                    template = template.replace(/@@newAssignment@@/g, 'hide');
                                }
                            }
                            template = template.replace(/@@enableqa@@/g, groupActivity[groupIndex].enableQA);
                            $('#groups-row').append(template);
                        }
                        util.ajaxStop();
                        $('.js-discussion-title').each(function () {
                            $(this).text('"' + this.title + '"');
                        });
                        bindEvents();
                        filterGroupsByRole();
                        filterGroupsByType();
                        if ('#create' === location.hash) {
                            $('.js-create-group-button:visible').trigger('click');
                            location.hash = '';
                        }
                    });
            }
            $('#group-filter-row').removeClass('hide');
        }

        function verifyUser(container, groups, currentTime) {
            try {
                var userInfo = new userInfoModel();
                userInfo.fetch({
                    success: function () {
                        ck12EmailVerified = userInfo.get('emailVerified');
                        if (!ck12EmailVerified) {
                            require(['text!groups/templates/groups.unverified.html'], function (pageTemplate) {
                                pageTemplate = pageTemplate.replace(/@@user_email@@/g, userInfo.get('email') || '');
                                $(container).before(pageTemplate);
                                $('.js-' + flxweb_role + '-text').removeClass('hide');
                                $('#groups-unverified').addClass('hide');
                                renderGroups(groups, currentTime);
                            });
                        } else {
                            renderGroups(groups, currentTime);
                        }
                    }
                });
            } catch (e) {
                console.log('Could not load user info.');
            }
        }

        /**
        * Will be called when Create Group button is called. This loads group
        * images by making API call and inserting in DOM of the create group dialog
        */
        function loadImagesForCreate() {
            groupsController.getImagesForCreateGroup().done(function (images) {
                require(['text!groups/templates/groups.images.html',
                    'text!groups/templates/group.edit.image.html'
                ], function (imageTemplate, imageTemplateSmall) {
                    if (images instanceof Array && images.length) {
                        $('#image-select').empty();
                        for (var index = 0; index < images.length; index++) {
                            var imageHTML = imageTemplate;
                            imageHTML = imageHTML.replace(/@@src@@/g, images[index].uri || '');
                            imageHTML = imageHTML.replace(/@@alt@@/g, images[index].originalName.replace(/\..+/g, '').replace(/_/g, ' ') || '');
                            imageHTML = imageHTML.replace(/@@resourceRevisionID@@/g, images[index].resourceRevisionID || '');
                            $('#image-select').append(imageHTML);
                            if (0 === index) {
                                $('#image-select').children().addClass('theme-select');
                                $('#image-edit-select').append(imageHTML);
                            }
                            imageHTML = imageTemplateSmall;
                            imageHTML = imageHTML.replace(/@@src@@/g, images[index].uri || '');
                            imageHTML = imageHTML.replace(/@@alt@@/g, images[index].originalName.replace(/\..+/g, '').replace(/_/g, ' ') || '');
                            imageHTML = imageHTML.replace(/@@resourceRevisionID@@/g, images[index].resourceRevisionID || '');
                            $('.js-group-image-edit').append(imageHTML);
                        }
                        $('#image-edit-select .theme-container').addClass('theme-select');
                        //set first image as default selection
                        var imageElement = $('#image-select').find('.js-theme-container:eq(0)');
                        if (!imageElement.hasClass('theme-select')) {
                            imageElement.trigger('click');
                        }

                        //bind the handlers for create dialog
                        bindCreateGroupEvents();

                    }
                });
            }).fail(function(error){
                console.log(error);
                ModalView.alert('Sorry, we could not load the images for groups right now. Please try again after some time.');
            });
        }
        function loadSubjectsForCreate() {
            groupsController.getSubjectsForCreateGroup().then(function (subjects) {
                var selectBox = document.getElementById('group-subjects'),
                    fragment  = document.createDocumentFragment();

                function createOption (name, disabled){
                    name = name || '';

                    var option = document.createElement('option');

                    option.textContent = name;
                    option.setAttribute('value', name.toLowerCase());
                    if(disabled) { option.setAttribute('disabled', 'disabled'); }

                    fragment.appendChild(option);
                }

                Object.keys(subjects).forEach(function(branchName){
                    createOption(branchName, true);

                    subjects[branchName].forEach(function(subject){
                        createOption(subject.name);
                    });
                });

                $(selectBox).children().remove();
                selectBox.appendChild(fragment);

            }).fail(function(error){
                console.log(error);
            });
        }

        function bindCreateGroupEvents() {

            //handler for group image selection
            $('.js-theme-container').off('click.theme').on('click.theme', function () {
                if (!$('#side-reveal-icon').is(':visible')) {
                    $('.js-theme-container').not($(this)).removeClass('theme-select');
                    $(this).toggleClass('theme-select');
                }
            });

            //handler for group image selection on small screens
            $('.js-image-edit-border').off('click.groups').on('click.groups', function () {
                $('.js-image-edit-border').parent().removeClass('add-border');
                $(this).parent().addClass('add-border');
                $('.image-container span').removeClass('group-image-select');
                $(this).parent().children().eq(1).addClass('group-image-select');
                if ($('#group-image-edit-small').is(':visible')) {
                    $('#group-image-edit-small').attr('src', $(this).attr('src'));
                    $('#group-image-edit-small').attr('data-resourcerevisionid', this.id);
                } else {
                    $('.image-edit-container img').attr('src', $(this).attr('src'));
                    $('.image-edit-container .theme-container').attr('data-resourcerevisionid', this.id);
                    $('#image-edit-select .theme-container').addClass('theme-select');
                }
                $('.edit-image-close-icon:visible').trigger('click');
            });

            //group type selection
            $('.js-group-type-label').off('click.theme').on('click.theme', function () {
                if (window.innerWidth < 768) {
                    $(this).prev().trigger('click');
                } else {
                    $(this).parent().prev().find('.radio').trigger('click');
                }
            });
        }

        function render(groups, container, currentTime) {
            $('.content-wrap').addClass('row').addClass('no-padding');
            $('#groups-content').removeClass('groups-main').addClass('collapse').addClass('row');
            util.ajaxStart();
            require(['text!groups/templates/groups.home.html',
                'text!groups/templates/group.main.info.html'
            ], function (pageTemplate,
                groupMainInfoTemplate) {
                container.innerHTML = pageTemplate;
                $('.content-wrap').append(groupMainInfoTemplate);
                if ('false' === $.cookie('flxgroupsowner')) {
                    $('.js-group-owner').removeClass('checked');
                }
                if ('false' === $.cookie('flxgroupsmember')) {
                    $('.js-group-member').removeClass('checked');
                }
                if ('false' === $.cookie('flxgroupsclass')) {
                    $('.js-class').removeClass('checked');
                }
                if ('false' === $.cookie('flxgroupsstudy')) {
                    $('.js-study-group').removeClass('checked');
                }
                $('#group-filter-row').addClass('hide');
                $('#groups-row').empty();
                renderGroups(groups, currentTime);
            });
        }

        this.render = render;
        this.renderGroups = renderGroups;
        this.emailSent = emailSent;

    }
    return new groupsHomeView();
});
