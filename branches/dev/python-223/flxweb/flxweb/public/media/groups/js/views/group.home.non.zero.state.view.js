define(['jquery', 'common/utils/date', 'common/utils/modality', 'common/utils/utils'], function ($, date, modality, util) {
    'use strict';

    var groupHomeController;
    require(['groups/controllers/group.home'], function (controller) {
        groupHomeController = controller;
    });

    function parseDate(dueDate) {
        if (!dueDate || dueDate === 'none') {
            return '';
        }
        dueDate = dueDate.replace(/\-/g, '/');
        dueDate = new Date(dueDate);
        dueDate = dueDate.getMonth() || 0 === dueDate.getMonth() ? (dueDate.getMonth() + 1) + '/' + dueDate.getDate() + '/' + (dueDate.getYear() + 1900) : ''; // equality to zero required for date in January month
        return dueDate;
    }

    function groupHomeView() {

        var activityBlockTemplate, groupID,
            months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
            scrollPage = 0;

        function bindEvents() {

            $('.js-activity-link').off('click.groups').on('click.groups', function () {
                $(this).parent().siblings('.activity-content').find('a')[0].click();
            });

            $('#close-reminder').off('click.groups').on('click.groups', function () {
                $('#settings-reminder').remove();
            });

            $(window).off('scroll.groups').on('scroll.groups', function () {
                if ($(document).height() === $(document).scrollTop() + $(window).height() && scrollPage) {
                    var group;
                    group = {
                        'groupID': groupID,
                        'pageNum': scrollPage
                    };
                    scrollPage = 0;
                    groupHomeController.loadActivities(group);
                }
            });

            $('.js-activityTitle.pointer').off('click.assignment').on('click.assignment', function () {
                window.location.href = $('#group-assignments-link').prop('href');
            });
        }

        function getActivityBlock(time) {
            var month, block;
            time = time || '';
            time = new Date(time);
            if (Date.parse(time)) {
                month = months[time.getMonth()];
                time = month + ' ' + (time.getYear() + 1900);
                $('.js-activity-time').each(function () {
                    if (time === $(this).html()) {
                        block = $(this);
                    }
                });
                if (!block) {
                    $('#activity-container').append(activityBlockTemplate);
                    block = $('.js-activity-time:last');
                }
            } else if (!$('.js-undefined-time').length) {
                $('#activity-container').append(activityBlockTemplate);
                block = $('.js-activity-time:last');
                block.addClass('js-undefined-time');
            } else {
                block = $('.js-undefined-time');
            }
            block.html(time);
            return block;
        }

        function loadGroupActivity(activity, currentTime, groupID) {
            var index, activityHTML, activityBlock, activityType, currentActivityType,
                parsedTitle, discussionOwner, discussionOwnerName, discussionTitle, discussionHTML, dHTMLLength, discussionSplit, k,
                discussionOwnerID, imgCount, singleImage;
            scrollPage = (activity.total > activity.offset + activity.limit) ? activity.offset / 10 + 2 : 0;
            activity = activity.activity;
            require(['text!groups/templates/group.activity.share.html',
                'text!groups/templates/group.activity.join.html',
                'text!groups/templates/group.activity.assign.html',
                'text!groups/templates/group.activity.discuss.html'
            ], function (shareTemplate,
                joinTemplate,
                assignTemplate,
                discussionTemplate) {
                var tagName;
                for (index = 0; index < activity.length; index++) {
                    activityHTML = '';
                    activityBlock = '';
                    currentActivityType = activity[index].activityType;
                    if ('share' === currentActivityType) {
                        activityHTML = shareTemplate;
                        if (activity[index].artifact) {
                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, activity[index].artifact.title || '');
                            activityType = modality.getModalityType(activity[index].artifact.artifactType || '');
                            if (activityType === 'FlexBook&#174; Textbooks') {
                                activityHTML = activityHTML.replace(/@@artifactType@@/g, activityType);
                                activityHTML = activityHTML.replace(/@@book@@/g, ' flexbook');
                            } else {
                                activityHTML = activityHTML.replace(/@@artifactType@@/g, activityType.toLowerCase());
                                activityHTML = activityHTML.replace(/@@book@@/g, '');
                            }
                            activityHTML = activityHTML.replace(/@@modalityicon@@/g, modality.getModalityIcon(activityType || ''));
                        } else {
                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, '');
                            activityHTML = activityHTML.replace(/@@artifactType@@/g, '');
                            activityHTML = activityHTML.replace(/@@modalityicon@@/g, modality.getModalityIcon(''));
                        }
                        if (activity[index].hasOwnProperty('activityData') && !($.isEmptyObject(activity[index].activityData))) {
                            activityHTML = activityHTML.replace(/@@activityLink@@/g, activity[index].activityData.url || '');
                        } else {
                            activityHTML = activityHTML.replace(/@@activityLink@@/g, modality.getURLfromJSON(activity[index] || ''));
                        }
                        if (activity[index].owner) {
                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activity[index].owner.name || '');
                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, activity[index].owner.authID || '');
                        } else {
                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                        }
                    } else if ('join' === currentActivityType || 'leave' === currentActivityType) {
                        activityHTML = joinTemplate;
                        if (activity[index].member) {
                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activity[index].member.name || '');
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
                    } else if ('assign' === currentActivityType || 'unassign' === currentActivityType || 'change-due-date' === currentActivityType || 'assignment-delete' === currentActivityType || 'assignment-edit' === currentActivityType) {
                        activityHTML = assignTemplate;
                        if ('change-due-date' === currentActivityType) {
                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'changed');
                            activityHTML = activityHTML.replace(/@@due@@/g, 'dueDate');
                            activityHTML = activityHTML.replace(/@@smallIcon@@/g, 'icon-calendar');
                            activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'pointer link-green');
                            activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'activityUpdate');
                        } else {
                            activityHTML = activityHTML.replace(/@@due@@/g, 'hide');
                            activityHTML = activityHTML.replace(/@@dueDateChange@@/g, '');
                            activityHTML = activityHTML.replace(/@@dueDateChangeTo@@/g, '');
                        }
                        if ('assignment-delete' === activity[index].activityType) {
                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'deleted');
                            activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'assignment-delete-text');
                            activityHTML = activityHTML.replace(/@@smallIcon@@/g, 'icon-remove');
                            activityHTML = activityHTML.replace(/@@assignmentLink@@/g, '');
                            activityHTML = activityHTML.replace(/@@isAssignmentDelete@@/g, '');
                            activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'activityUpdate');
                        } else {
                            activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                            activityHTML = activityHTML.replace(/@@isAssignmentDelete@@/g, ' pointer');
                        }
                        if ('unassign' === activity[index].activityType) {
                            activityHTML = activityHTML.replace(/@@smallIcon@@/g, 'icon-remove');
                            activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'unassign');
                        }
                        if ('assignment-edit' === activity[index].activityType) {
                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'updated @@isNameUpdate@@');
                            activityHTML = activityHTML.replace(/@@smallIcon@@/g, 'icon-edit');
                            activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'pointer link-green');
                            //activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'activityUpdate');
                        } else {
                            activityHTML = activityHTML.replace(/@@smallIcon@@/g, 'icon-grps_assgnmts');
                        }
                        if ('assign' === activity[index].activityType) {
                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'assigned');
                            activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'pointer link-green');
                            activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'activityUpdate');
                        } else {
                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'removed');
                            activityHTML = activityHTML.replace(/@@assignmentLink@@/g, '');
                        }
                        if (activity[index].owner) {
                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, activity[index].owner.name || '');
                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, activity[index].owner.authID || '');
                        } else {
                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                        }
                        if (activity[index].activityData) {
                            if (activity[index].activityData.due && activity[index].activityData.due != "none") {
                                activityHTML = activityHTML.replace(/@@dueDateChange@@/g, 'due date:');
                                activityHTML = activityHTML.replace(/@@dueDateChangeTo@@/g, 'due date changed to');
                            } else {
                                activityHTML = activityHTML.replace(/@@dueDateChange@@/g, 'due date removed');
                                activityHTML = activityHTML.replace(/@@dueDateChangeTo@@/g, 'due date removed');
                            }
                            if (activity[index].activityData.hasOwnProperty('concepts-added') || activity[index].activityData.hasOwnProperty('concepts-removed')) {
                                activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, '');
                                activityHTML = activityHTML.replace(/@@previousTitle@@/g, 'hide');
                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide');
                            } else {
                                activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, 'assignment name');
                            }
                            activityHTML = activityHTML.replace(/@@dueDate@@/g, parseDate(activity[index].activityData.due));
                            activity[index].activityData.name = (activity[index].activityData.name || '').replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;');

                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, activity[index].activityData.name || '');
                            if ('assignment-edit' === activity[index].activityType) {
                                activity[index].activityData['orig-name'] = (activity[index].activityData['orig-name'] || '').replace(/&/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/"/g, '&quot;');
                                activityHTML = activityHTML.replace(/@@activityPrevTitle@@/g, activity[index].activityData['orig-name'] + ' ');
                                activityHTML = activityHTML.replace(/@@previousTitle@@/g, 'previousTitle');
                                activityHTML = activityHTML.replace(/@@changedTo@@/g, '');
                            } else {
                                activityHTML = activityHTML.replace(/@@previousTitle@@/g, 'hide');
                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide');
                            }
                            if (activity[index].activityData['concepts-added'] || activity[index].activityData['concepts-removed']) {
                                activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'unassign');
                            } else {
                                activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'activityUpdate');
                            }
                        } else {
                            activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, '');
                            activityHTML = activityHTML.replace(/@@dueDate@@/g, '');
                            activityHTML = activityHTML.replace(/@@activityTitle@@/g, '');
                            activityHTML = activityHTML.replace(/@@previousTitle@@/g, 'hide');
                            activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide');
                            activityHTML = activityHTML.replace(/@@activityUpdate@@/g, 'activityUpdate');
                        }
                        if ('assign' === currentActivityType) {
                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'assigned');
                        } else {
                            activityHTML = activityHTML.replace(/@@activityType@@/g, 'removed');
                        }

                    } else if ('ph-comment' === currentActivityType ||
                        'ph-question' === currentActivityType ||
                        'ph-answer' === currentActivityType) {

                        activityHTML = discussionTemplate;
                        parsedTitle = '';
                        discussionOwner = activity[index].owner;
                        // Handle posts from anonymous users
                        if (activity[index].hasOwnProperty('activityData') && !($.isEmptyObject(activity[index].activityData)) && activity[index].activityData.hasOwnProperty('post') && activity[index].activityData.post.isAnonymous === true) {
                            discussionOwnerName = 'Anonymous';
                            discussionOwnerID = 'anonymous';
                        } else {
                            discussionOwnerID = discussionOwner.id;
                            discussionOwnerName = discussionOwner.name;
                        }

                        if (activity[index].hasOwnProperty('activityData') && !($.isEmptyObject(activity[index].activityData)) && activity[index].activityData.hasOwnProperty('post')) {
                            discussionTitle = activity[index].activityData.post.content || '';
                        } else {
                            discussionTitle = 'Content is too long to display';
                        }
                        discussionHTML = jQuery.parseHTML(discussionTitle);
                        dHTMLLength = discussionHTML.length;
                        discussionSplit = [];
                        // pull out text content
                        imgCount = 0;
                        singleImage = null;
                        tagName = null;
                        for (k = 0; k < dHTMLLength; k++) {
                            tagName = discussionHTML[k].tagName;
                            // this is a text node
                            if (discussionHTML[k].localName == null && discussionHTML[k].data) {
                                discussionSplit.push(discussionHTML[k].data);
                            }
                            // handle regular content in spans, divs, p, ul and ol tags
                            else if (['SPAN', 'DIV', 'P', 'OL', 'UL'].indexOf(tagName) !== -1) {
                                try{
                                    //if only image in present in post, embedded inside p tag
                                    if ($.parseHTML(discussionHTML[k].innerHTML.replace(/&nbsp;/g,'').trim())[0].tagName == 'IMG'){
                                        imgCount++;
                                        singleImage = $.parseHTML(discussionHTML[k].innerHTML.replace(/&nbsp;/g,'').trim())[0];
                                    }else{
                                        discussionSplit.push(discussionHTML[k].textContent);
                                    }
                                }catch(e){
                                    discussionSplit.push(discussionHTML[k].textContent);
                                }
                                
                            }
                            // handle link content
                            else if (tagName === 'A') {
                                discussionSplit.push(discussionHTML[k].innerHTML);
                            }
                            // get 1 image, print image if there is no text content in the parsedTitle
                            else if (imgCount === 0 && tagName === 'IMG') {
                                imgCount++;
                                singleImage = discussionHTML[k];
                            }
                        }
                        k = 0;
                        while (parsedTitle.length < 20 && discussionSplit[k]) {
                            parsedTitle += discussionSplit[k] + ' ';
                            k++;
                        }
                        parsedTitle = parsedTitle.trim();
                        if (parsedTitle.indexOf(' ') === -1 && parsedTitle.length > 45) {
                            parsedTitle = parsedTitle.substring(0, 45) + '...';
                        } else if (parsedTitle.length > 300) {
                            parsedTitle = parsedTitle.substring(0, 300) + '...';
                        } else if (parsedTitle.length === 0 && imgCount > 0) {
                            parsedTitle = singleImage.outerHTML;
                        }
                        parsedTitle = parsedTitle.replace(/"/g, "'");
                        activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, discussionOwnerID);
                        activityHTML = activityHTML.replace(/@@activityOwner@@/g, discussionOwnerName);
                        activityHTML = activityHTML.replace(/@@discussionTitle@@/g, parsedTitle);
                        activityHTML = activityHTML.replace(/@@activityLink@@/g, '/group-discussions/' + groupID);

                        switch (currentActivityType) {
                        case 'ph-comment':
                            activityHTML = activityHTML.replace(/@@discussionType@@/g, 'commented');
                            activityHTML = activityHTML.replace(/@@discussion-icon@@/g, 'icon-comments');
                            break;
                        case 'ph-question':
                            activityHTML = activityHTML.replace(/@@discussionType@@/g, 'asked');
                            activityHTML = activityHTML.replace(/@@discussion-icon@@/g, 'icon-answer');
                            break;
                        case 'ph-answer':
                            activityHTML = activityHTML.replace(/@@discussionType@@/g, 'answered');
                            activityHTML = activityHTML.replace(/@@discussion-icon@@/g, 'icon-answer');
                            break;
                        default:
                            throw new Error('Unhandled currentActivityType');
                        }
                    }

                    if (activityHTML) {
                        activityBlock = getActivityBlock(activity[index].creationTime);
                    }
                    activityHTML = activityHTML.replace(/@@activityTimeBig@@/g, date.getTimeDifference(activity[index].creationTime || '', currentTime).big);
                    activityHTML = activityHTML.replace(/@@activityTimeSmall@@/g, date.getTimeDifference(activity[index].creationTime || '', currentTime).small);
                    if (activityBlock instanceof $) {
                        activityBlock.next().append(activityHTML);
                    }
                }
                $('.js-discussion-title').each(function () {
                    $(this).html(this.title);
                });
                util.ajaxStop();
                bindEvents();
            });
        }

        function render(activity, currentTime, id) {
            require(['text!groups/templates/group.home.non.zero.state.html'], function (pageTemplate) {
                groupID = id;
                $('#group-home-link').addClass('cursor-default').parent().addClass('active');
                $('#group-details-container').append($(pageTemplate).find('#activity-container'));
                activityBlockTemplate = $('#activity-container').html().replace(/\s{2}/g, '');
                $('#activity-container').empty();
                if (activity.isFirstTime) {
                    $('#group-info-container').append($(pageTemplate).find('#settings-reminder'));
                }
                loadGroupActivity(activity, currentTime, groupID);
            });
        }

        this.render = render;
        this.loadGroupActivity = loadGroupActivity;

    }
    return new groupHomeView();
});
