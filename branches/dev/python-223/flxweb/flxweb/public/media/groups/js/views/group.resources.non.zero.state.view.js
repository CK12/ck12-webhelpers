define(['jquery', 'common/utils/date', 'common/utils/modality', 'common/utils/utils', 'hammer'], function ($, date, modality, util) {
    'use strict';

    var groupResourcesController;
    require(['groups/controllers/group.resources'], function (controller) {
        groupResourcesController = controller;
    });

    function groupResourcesView() {

        var groupID, scrollPage = 0,
            drag;

        function escapeHTML(string) {
            string = string.toString();
            return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function actionComplete(id) {
            $('#deleteResourceModal').find('.close-reveal-modal').trigger('click');
            id = id.split('/')[1];
            id = $('#' + id);
            if (1 !== id.parent().children('.js-resources-entry').length) {
                id.remove();
            } else {
                id.parent().remove();
            }
            location.reload();
        }

        function filterResources() {
            if ($('.js-my-resource:visible').hasClass('checked') && $('.js-other-resource:visible').hasClass('checked')) {
                $('#resources-container').find('.js-resources-entry').removeClass('hide');
                $.cookie('flxmyresources', 'true', {
                    path: '/'
                });
                $.cookie('flxotherresources', 'true', {
                    path: '/'
                });
            } else if ($('.js-my-resource:visible').hasClass('checked')) {
                $('#resources-container').find('.js-resources-entry').removeClass('hide');
                $.cookie('flxmyresources', 'true', {
                    path: '/'
                });
                $.cookie('flxotherresources', 'false', {
                    path: '/'
                });
                $('#resources-container').find('.js-resources-entry').filter(function () {
                    return !($(this).hasClass('js-my'));
                }).addClass('hide');
            } else if ($('.js-other-resource:visible').hasClass('checked')) {
                $.cookie('flxmyresources', 'false', {
                    path: '/'
                });
                $.cookie('flxotherresources', 'true', {
                    path: '/'
                });
                $('#resources-container').find('.js-resources-entry').removeClass('hide');
                $('#resources-container').find('.js-resources-entry').filter(function () {
                    return !($(this).hasClass('js-other'));
                }).addClass('hide');
            } else { // no filters checked
                $('#resources-container').find('.js-resources-entry').addClass('hide');
                $.cookie('flxmyresources', 'false', {
                    path: '/'
                });
                $.cookie('flxotherresources', 'false', {
                    path: '/'
                });
            }
            $('.resource-details-container').removeClass('hide');
            $('.resource-details-container').each(function () {
                if (1 === $(this).children(':visible').length) {
                    $(this).addClass('hide');
                }
            });
            if ($('.resource-details-container:visible').length) {
                $('#no-resources').addClass('hide');
            } else {
                $('#no-resources').removeClass('hide');
            }
        }

        function getBlock(filter, resource, blockTemplate, display, data, defaultTitle) {
            var uiBlock;
            if ('member' === filter) {
                if (resource.owner) {
                    blockTemplate = blockTemplate.replace(/@@activityOwnerAuthID@@/g, '/auth/member/image/' + resource.owner.authID || '');
                } else {
                    blockTemplate = blockTemplate.replace(/@@activityOwnerAuthID@@/g, '');
                }
                blockTemplate = blockTemplate.replace(/@@activityOwner@@/g, display);
            } else {
                blockTemplate = blockTemplate.replace(/@@activityOwnerAuthID@@/g, '');
                if (resource.artifact) {
                    blockTemplate = blockTemplate.replace(/@@modalityicon@@/g, modality.getModalityIcon(display || ''));
                } else {
                    blockTemplate = blockTemplate.replace(/@@modalityicon@@/g, modality.getModalityIcon(''));
                }
            }
            if (data) {
                $('.js-block-title').each(function () {
                    if (data === $(this).attr('data-block')) {
                        uiBlock = $(this).parents('.resource-details-container');
                    }
                });
                if (!uiBlock) {
                    $('#resources-container').append(blockTemplate);
                    uiBlock = $('.resource-details-container:last');
                    uiBlock.find('.js-block-title').html(display.toUpperCase());
                    uiBlock.find('.js-block-title').attr('data-block', data);
                }
            } else if ($('.js-undefined').length) {
                uiBlock = $('.js-undefined');
            } else {
                $('#resources-container').append(blockTemplate);
                uiBlock = $('.resource-details-container:last');
                uiBlock.addClass('js-undefined');
                uiBlock.find('.js-block-title').html(defaultTitle);
            }
            return uiBlock;
        }

        function swipeLeft(thisElement) {
            if (thisElement.find('.js-delete-resource').hasClass('right')) {
                thisElement.addClass('thrash-visible');
            }
        }

        function swipeRight(thisElement) {
            if (thisElement.find('.js-delete-resource').hasClass('right')) {
                thisElement.removeClass('thrash-visible');
            }
        }

        function bindEventsForResources() {
            $('.js-delete-resource').off('click.groups').on('click.groups', function () {
                $('.js-delete-title').text($(this).prev().text());
                $('#delete-resource').attr('data-id', $(this).parents('.js-resources-entry')[0].id);
            });

            Hammer('.js-resources-entry').off('dragleft.drag').on('dragleft.drag', function () {
                drag = 'left';
                //swipeLeft();
            });

            Hammer('.js-resources-entry').off('dragright.drag').on('dragright.drag', function () {
                drag = 'right';
                //swipeRight();
            });

            Hammer('.js-resources-entry').off('release.drag').on('release.drag', function () {
                if (drag === 'left') {
                    drag = undefined;
                    swipeLeft($(this));
                } else if (drag === 'right') {
                    drag = undefined;
                    swipeRight($(this));
                }
            });

            $('.js-remove-resource-mobile').off('click.remove').on('click.remove', function () {
                groupResourcesController.unshare(groupID + '/' + $(this).parents('.js-resources-entry').attr('id'));
            });
        }
        
        function getDetailsURL(artifact, activityURL) {
            var url = "/",
                realm = encodeURIComponent(artifact.realm || ''),
                artifactType = artifact.artifactType,
                handle = artifact.handle,
                revision = artifact.latestRevision,
                domain = artifact.domain,
                currentUser = parseInt($('#group-resources').attr('data-user')),
                book_types = ['book', 'tebook', 'workbook', 'labkit', 'quizbook'];


            if (_(book_types).contains(artifactType) || artifactType === 'section' || !domain) {
                if (realm) {
                    url += realm + "/";
                }
                url += artifactType + "/" + handle;
            } else {
                if (domain.branch === "UBR") {
                    url += 'na/';
                    url += domain.handle + '/';
                } else {
                    if (activityURL && activityURL.toLowerCase().indexOf('/c/') >= 0) { //collection aware
                        activityURL = activityURL.split('/c/');
                        activityURL = activityURL[activityURL.length - 1].split('/');
                        url += 'c/' + activityURL[0] + '/'; //adding collectionHandle
                        url += activityURL[1] + '/'; //adding conceptCollectionAbsoluteHandle
                    } else {
                        url += domain.branchInfo.handle.toLowerCase() + '/';
                        url += domain.handle + '/';
                    }
                }

                url += artifactType + '/';
                if (realm) {
                    url += realm + "/";
                }
                url += handle;
            }
            if (currentUser !== artifact.creatorID) {
                url += "/r" + revision;
            }
            return url;
        }

        function loadGroupActivity(filter, resources, currentTime) {
            if (resources) {
                scrollPage = resources.total > resources.offset + resources.limit ? resources.offset / 10 + 2 : 0;
                resources = resources.activity;

                var index, activityHTML, activityType, activityOwner,
                    block = false;

                require(['text!groups/templates/group.resources.block.html', 'text!groups/templates/group.resources.entry.html'], function (blockTemplate, entryTemplate) {
                    for (index = 0; index < resources.length; index++) {
                        activityHTML = entryTemplate;
                        if (resources[index].artifact) {
                            activityType = modality.getModalityType(resources[index].artifact.artifactType || '');
                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, resources[index].artifact.title || '');
                            activityHTML = activityHTML.replace(/@@activityTitleText@@/g, escapeHTML(resources[index].artifact.title || ''));
                            block = modality.getModalityIcon(activityType || '');
                        } else {
                            activityType = modality.getModalityType('');
                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, '');
                            activityHTML = activityHTML.replace(/@@activityTitleText@@/g, '');
                            block = modality.getModalityIcon('');
                        }
                        if (activityType === 'FlexBook&#174; Textbooks') {
                            activityHTML = activityHTML.replace(/@@book@@/g, ' flexbook');
                        } else {
                            activityHTML = activityHTML.replace(/@@book@@/g, '');
                        }
                        activityHTML = activityHTML.replace(/@@modalityicon@@/g, block);
                        if (resources[index].hasOwnProperty('activityData') && !($.isEmptyObject(resources[index].activityData))) {
                            activityHTML = activityHTML.replace(/@@activityLink@@/g, getDetailsURL(resources[index].artifact, resources[index].activityData && resources[index].activityData.url) || '');
                        } else {
                            activityHTML = activityHTML.replace(/@@activityLink@@/g, modality.getURLfromJSON(resources[index] || ''));
                        }
                        block = block.split('icon-')[1];
                        if (resources[index].owner) {
                            activityOwner = resources[index].owner.name || '';
                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activityOwner);
                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, resources[index].owner.authID || '');
                            block = filter ? resources[index].owner.authID || '' : block;
                            if (resources[index].owner.authID && $('#group-resources').attr('data-user') === resources[index].owner.authID.toString()) {
                                activityHTML = activityHTML.replace(/@@filterResource@@/g, 'js-my');
                                activityHTML = activityHTML.replace(/@@deleteResource@@/g, '');
                            } else {
                                activityHTML = activityHTML.replace(/@@filterResource@@/g, 'js-other');
                                activityHTML = activityHTML.replace(/@@deleteResource@@/g, 'hide-important');
                            }
                        } else {
                            activityOwner = '';
                            block = filter ? activityOwner : block;
                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                            activityHTML = activityHTML.replace(/@@filterResource@@/g, 'js-other');
                            activityHTML = activityHTML.replace(/@@deleteResource@@/g, 'hide-important');
                        }
                        block = block.toString();
                        activityHTML = activityHTML.replace(/@@activityID@@/g, resources[index].id || index);
                        activityHTML = activityHTML.replace(/@@activityTimeBig@@/g, date.getTimeDifference(resources[index].creationTime || '', currentTime).big);
                        activityHTML = activityHTML.replace(/@@activityTimeSmall@@/g, date.getTimeDifference(resources[index].creationTime || '', currentTime).small);
                        if (!filter) {
                            block = getBlock('type', resources[index], blockTemplate, activityType, block, 'Undefined Type');
                            if (activityType === 'FlexBook&#174; Textbooks') {
                                activityHTML = activityHTML.replace(/@@activityType@@/g, 'FlexBook&#174; Textbooks');
                            } else {
                                activityHTML = activityHTML.replace(/@@activityType@@/g, block.find('.js-block-title').html().toLowerCase());
                            }

                            block.append(activityHTML);
                            $('.js-member-block').remove();
                        } else {
                            block = getBlock('member', resources[index], blockTemplate, activityOwner, block, 'Unknown Member');
                            if (resources[index].artifact) {
                                activityHTML = activityHTML.replace(/@@activityType@@/g, activityType);
                            } else {
                                activityHTML = activityHTML.replace(/@@activityType@@/g, '');
                            }
                            block.append(activityHTML);
                            $('.js-type-block').remove();
                        }
                        activityHTML = '';
                        block = false;
                    }
                    filterResources();
                    util.ajaxStop();
                    bindEventsForResources();
                });
            }
        }

        function bindEvents() {

            $('.js-activity-link').off('click.groups').on('click.groups', function () {
                $(this).parent().next().find('a')[0].click();
            });

            $('.js-dropdown-element').off('click.groups').on('click.groups', function () {
                $('#resources-container').empty();
                var group, sort;
                sort = $(this).index() ? 'a_userName' : 'a_activityType';
                group = {
                    'groupID': groupID,
                    'filters': 'activityType,share',
                    'sort': sort
                };
                groupResourcesController.getActivities(loadGroupActivity, group);
                $('#dropdown-title-sort').text($(this).children().text());
                $('#dropdown-title').text($(this).children().text());
                if ($('.members-select-container-small').is(':visible')) {
                    $('#dropdown-title-sort').trigger('click');
                } else {
                    $('#dropdown-title').trigger('click');
                }
            });

            $('.js-resources-filters').off('click.group').on('click.group', function () {
                if ($(this).children(':eq(0)').hasClass('js-my-resource')) {
                    $('.js-my-resource').toggleClass('checked');
                } else {
                    $('.js-other-resource').toggleClass('checked');
                }
                filterResources();
            });

            $(window).off('scroll.groups').on('scroll.groups', function () {
                if (($(document).scrollTop() + $(window).height()) === $(document).height() && scrollPage) {
                    var group, sort;
                    sort = 'Type' === $.trim($('.js-dropdown-title').text()) ? 'a_activityType' : 'a_userName';
                    group = {
                        'groupID': groupID,
                        'pageNum': scrollPage,
                        'filters': 'activityType,share',
                        'sort': sort
                    };
                    scrollPage = 0;
                    groupResourcesController.getActivities(loadGroupActivity, group);
                }
            });

            $('#cancel-delete').off('click.delete').on('click.delete', function () {
                $('#deleteResourceModal').find('.close-reveal-modal').trigger('click');
            });

            $('#delete-resource').off('click.delete').on('click.delete', function () {
                groupResourcesController.unshare(groupID + '/' + $(this).attr('data-id'));
            });
        }

        function render(activity, currentTime, id) {
            groupID = id;
            require(['text!groups/templates/group.resources.non.zero.state.html'], function (pageTemplate) {
                $('#group-resources-link').addClass('cursor-default').parent().addClass('active');
                $('#group-resources-count').addClass('group-count-black');
                $('#group-details-container').append($(pageTemplate).find('#page').html());
                $('#group-resources').append($(pageTemplate).find('#modal').html());
                if ('false' === $.cookie('flxmyresources')) {
                    $('.js-my-resource').removeClass('checked');
                }
                if ('false' === $.cookie('flxotherresources')) {
                    $('js-other-resource').removeClass('checked');
                }
                loadGroupActivity(0, activity, currentTime);
                bindEvents();
            });
        }

        this.render = render;
        this.loadGroupActivity = loadGroupActivity;
        this.actionComplete = actionComplete;

    }

    return new groupResourcesView();
});