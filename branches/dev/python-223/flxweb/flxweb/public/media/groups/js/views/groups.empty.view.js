define(['jquery', 'common/utils/user', 'common/utils/utils', 'common/views/modal.view',], function ($, userInfoModel, util, ModalView) {
    'use strict';

    var groupsController;
    require(['groups/controllers/groups.home'], function (controller) {
        groupsController = controller;
    });

    function groupsEmptyView() {

        var actionInProgress = false;

        function emailSent() {
            $('a.js-resend-email').addClass('hide-important').next().removeClass('hide-important');
        }

        function bindEvents() {

            (function loadSubjectsForCreate() {
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
            })();

            $('.js-join-group-button').off('click.create').on('click.create', function () {
                if ($('#side-reveal-icon').is(':visible')) {
                    $('.groups-title-wrapper').addClass('hide-small');
                    $('.join-group-small').removeClass('hide-important');
                    $('.back-icon', '.title-area').addClass('visible');
                } else {
                    if (!actionInProgress) {
                        $('#joinGroupLinkHidden').trigger('click');
                    }
                }
                $('.js-join-group-code').val('');
                $('.js-join-group-error').addClass('hide');
                $('.js-join-group-code').removeClass('input-required');
            });

            $('.js-theme-container').off('click.theme').on('click.theme', function () {
                if (!$('#side-reveal-icon').is(':visible')) {
                    $('.js-theme-container').not($(this)).removeClass('theme-select');
                    $(this).toggleClass('theme-select');
                }
            });

            $('.js-group-type-label').off('click.theme').on('click.theme', function () {
                $(this).prev().trigger('click');
            });

            $('.js-close-modal').off('click.theme').on('click.theme', function () {
                $('#joinGroupModal').find('.close-reveal-modal').trigger('click');
            });

            function joinGroupCallback(result) {
                actionInProgress = false;
                if (result) {
                    if ('error' === result) {
                        console.log('Sorry, we could not join you to the group at this time. Please try again later.');
                    } else if (result.hasOwnProperty('message')) {
                        if (result.message.match('does not match')) {
                            $('.js-group-join-wrong-error').removeClass('hide');
                            $('.js-join-group-code').addClass('input-required');
                        } else if (result.message.toLowerCase().match('already in the group')) {
                            $('.js-group-join-member-error').removeClass('hide');
                            $('.js-join-group-code').addClass('input-required');
                        } else {
                        	ModalView.alert('Sorry, we could not join you to the group at this time. Please try again later.');
                        }
                    } else {
                        actionInProgress = true;
                        if ($('#joinGroupModal').is(':visible')) {
                            $('#joinGroupModal').find('.close-reveal-modal').trigger('click');
                        } else {
                            $('footer').removeClass('groups-unverfied');
                            $('#groups-unverified').remove();
                        }
                        location.href = '/group-discussions/' + result.groupID;
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
                    actionInProgress = true;
                    groupsController.joinGroup(joinGroupCallback, accessCode);
                } else {
                    $('.js-join-group-code').val('');
                    $('.js-group-join-empty-error').removeClass('hide');
                    $('.js-join-group-code').addClass('input-required');
                }
            });

            $('.js-join-group-code').off('keypress.error').on('keypress.error', function () {
                $('.js-join-group-error').addClass('hide');
                $(this).removeClass('input-required');
            });

            $('.js-join-group-code').off('change.error').on('change.error', function (e) {
                $('.js-join-group-error').addClass('hide');
                $(this).removeClass('input-required');
                if (13 === (e.which || e.keyCode)) {
                    $('.js-join-group').trigger('click');
                }
            });

            function createGroupCallback(result) {
                actionInProgress = false;
                $('#create-group-final').text('Create Group');
                if (result) {
                    if ('error' === result) {
                        console.log('Sorry, we could not create the group at this time. Please try again later.');
                    } else if (0 !== result.responseHeader.status) {
                    	ModalView.alert('Sorry, we could not create the group at this time. Please try again later.');
                    } else {
                        actionInProgress = true;
                        $('#create-group-final').text('Your Group Created');
                        $('#group-name').val('');
                        $('#group-description').val('');
                        var imageElement = $('#image-select').find('.js-theme-container:eq(0)');
                        if (!imageElement.hasClass('theme-select')) {
                            imageElement.trigger('click');
                        }
                        location.href = '/group/' + result.response.group.id;
                        //groupsController.load($('#groups-content')[0]);
                    }
                }
            }

            function createGroup() {
                if (!actionInProgress) {
                    var title, description, group, type, image, groupSubjects;
                    title = $('#group-name').val();
                    title = $.trim(title);
                    description = $('#group-description').val();
                    type = $('#group-type-option').find(':checked').attr('data-type');
                    image = $('.js-group-empty-image-edit').find('.theme-select').attr('data-resourceRevisionID');
                    if (title) {
                        $('#create-group-final').text('Creating your Group...');
                        $('.js-join-group-button').addClass('creating');
                        groupSubjects = $('#group-subjects').val();
                        group = {
                            'groupName': title,
                            'groupDescription': description,
                            'groupScope': 'closed',
                            'groupType': type,
                            'resourceRevisionID': image,
                            'groupSubjects': groupSubjects instanceof Array ? groupSubjects.join(',') : ''
                        };
                        actionInProgress = true;
                        groupsController.createGroup(createGroupCallback, group);
                    } else {
                        $('#group-name').val('');
                        $('#group-name-empty-error').removeClass('hide');
                        $('#group-name').addClass('input-required');
                    }
                }
            }

            $('#create-group-final, #create-final').off('click.create').on('click.create', createGroup);

            $('#create-group').off('submit.create').on('submit.create', function (e) {
                e.preventDefault();
                $('#create-group-final').trigger('click');
            });

            $('#group-name').off('keypress.error').on('keypress.error', function () {
                $('.js-group-name-exists-error').addClass('hide');
                $('#group-name-empty-error').addClass('hide');
                $('#group-name').removeClass('input-required');
            });

            $('#group-name').off('change.error').on('change.error', function () {
                $('.js-group-name-exists-error').addClass('hide');
                $('#group-name-empty-error').addClass('hide');
                $('#group-name').removeClass('input-required');
            });
            $('.js-image-edit-border').off('click.groups').on('click.groups', function () {
                $('.js-image-edit-border').parent().removeClass('add-border');
                $(this).parent().addClass('add-border');
                $('.image-container span').removeClass('group-image-select');
                $(this).parent().children().eq(1).addClass('group-image-select');
                $('.image-edit-container img').attr('src', $(this).attr('src'));
                $('.image-edit-container .theme-container').attr('data-resourcerevisionid', this.id);
                $('#image-edit-select .theme-container').addClass('theme-select');
                $('.edit-image-close-icon:visible').trigger('click');
            });
            $('#image-edit-select').off('click.edit-image').on('click.edit-image', function () {
                $('.js-image-edit-border').parent().removeClass('add-border').children().removeClass('group-image-select');
                $('.js-image-edit-border[src="' + $('#image-edit-select img').attr('src') + '"]').parent().addClass('add-border');
                $('.js-image-edit-border[src="' + $('#image-edit-select img').attr('src') + '"]').parent().children().eq(1).addClass('group-image-select');
            });
            $('#group-empty-create-group').off('click.groups').on('click.groups', function () {
                $('.groups-title-wrapper').addClass('hide-small');
                $('.user-data-main-container').removeClass('hide-small');
                $('.back-icon', '.title-area').addClass('visible');
                $('#group-name').val('');
                $('#group-description').val('');
                $('#group-name').trigger('change');

            });
            $('.js-cancel-join').off('click.groups').on('click.groups', function () {
                $('.join-group-small').addClass('hide-important');
                $('.groups-title-wrapper').removeClass('hide-small');
                $('.back-icon', '.title-area').removeClass('visible');
            });
            $('body').off('navigateBack.group-menu').on('navigateBack.group-menu', function () {
                if ($('.groups-title-wrapper').hasClass('hide-small')) {
                    $('.user-data-main-container').addClass('hide-small');
                    $('.join-group-small').addClass('hide-important');
                    $('.groups-title-wrapper').removeClass('hide-small');
                    $('.back-icon', '.title-area').removeClass('visible');
                }
            });
            $(window).off('resize.groupsEmpty').on('resize.groupsEmpty', function () {
                if (window.innerWidth > 767) {
                    if ($('#editImageModal').is(':visible')) {
                        $('#editImageModal').foundation('reveal', 'close');
                    }
                }
                if (window.innerWidth < 768) {
                    if ($('#joinGroupModal').is(':visible')) {
                        $('#joinGroupModal').foundation('reveal', 'close');
                    }
                }
            });

            $('.js-resend-email').off('click.verify').on('click.verify', function () {
                groupsController.resendVerficationEmail();
            });

        }

        function verifyUser(container) {
            try {
                var userInfo = new userInfoModel();
                userInfo.fetch({
                    success: function () {
                        if (!(userInfo.get('emailVerified'))) {
                            require(['text!groups/templates/groups.unverified.html'], function (pageTemplate) {
                                pageTemplate = pageTemplate.replace(/@@user_email@@/g, userInfo.get('email') || '');
                                $(container).before(pageTemplate);
                                $('.js-' + flxweb_role + '-text').removeClass('hide');
                                $('footer').addClass('groups-unverfied');
                                bindEvents();
                                util.ajaxStop();
                            });
                        } else {
                            bindEvents();
                            util.ajaxStop();
                        }
                    }
                });
            } catch (e) {
                console.log('Could not load user info.');
            }
        }

        function render(container, images) {
            $('.content-wrap').removeClass('row').addClass('no-padding');
            $('#groups-content').addClass('groups-main').removeClass('collapse').removeClass('row');
            util.ajaxStart();
            require(['text!groups/templates/groups.empty.html', 'text!groups/templates/groups.images.html', 'text!groups/templates/group.edit.image.html'], function (pageTemplate, imageTemplate, imageTemplateSmall) {
                container.innerHTML = pageTemplate;
                var imageHTML, imageEditHTML, index, imageEditHTMLSmall;
                if (images instanceof Array && images.length) {
                    $('#image-select').empty();
                    for (index = 0; index < images.length; index++) {
                        imageHTML = imageTemplate;
                        imageHTML = imageHTML.replace('@@src@@', images[index].uri || '');
                        imageHTML = imageHTML.replace('@@alt@@', images[index].originalName.replace(/\..+/g, '').replace(/_/g, ' ') || '');
                        imageHTML = imageHTML.replace('@@resourceRevisionID@@', images[index].resourceRevisionID || '');
                        $('#image-select').append(imageHTML);
                    }
                    $('#image-select').children(':eq(0)').addClass('theme-select');
                    imageEditHTML = imageTemplate;
                    imageEditHTML = imageEditHTML.replace('@@src@@', images[0].uri || '');
                    imageEditHTML = imageEditHTML.replace('@@alt@@', images[0].originalName.replace(/\..+/g, '').replace(/_/g, ' ') || '');
                    imageEditHTML = imageEditHTML.replace('@@resourceRevisionID@@', images[0].resourceRevisionID || '');
                    $('#image-edit-select').append(imageEditHTML);
                    $('#image-edit-select .theme-container').addClass('theme-select');

                    for (index = 0; index < images.length; index++) {
                        imageEditHTMLSmall = imageTemplateSmall;
                        imageEditHTMLSmall = imageEditHTMLSmall.replace(/@@src@@/g, images[index].uri || '');
                        imageEditHTMLSmall = imageEditHTMLSmall.replace(/@@alt@@/g, images[index].originalName.replace(/\..+/g, '').replace(/_/g, ' ') || '');
                        imageEditHTMLSmall = imageEditHTMLSmall.replace(/@@resourceRevisionID@@/g, images[index].resourceRevisionID || '');
                        $('.js-group-image-edit').append(imageEditHTMLSmall);
                    }
                }
                bindEvents();
                if ('student' !== $('#groups-content').attr('data-user-role').toLowerCase()) {
                    $('.js-group-type-label:eq(1)').trigger('click');
                }
                util.ajaxStop();
                location.hash = '';
            });
        }

        this.render = render;
        this.emailSent = emailSent;

    }
    return new groupsEmptyView();
});