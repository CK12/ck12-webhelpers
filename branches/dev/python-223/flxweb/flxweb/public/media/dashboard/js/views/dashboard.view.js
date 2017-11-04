/* global Hammer */
/* eslint no-unused-vars:0 */
define(['jquery', 'common/utils/date', 'common/utils/concept_coversheet', 'common/utils/modality',
'dashboard/templates/dashboard.templates', 'graphTool/graph-tool', 'jq/jquery-knob/jquery.knob', 'hammer', 'common/utils/user'
],
function ($, date, coverSheet, modality) {
    'use strict';

    function dashboardView(dashboardController) {

        function emailSent() {
            $('.js-resend-email').addClass('hide').next().removeClass('hide').next().removeClass('hide');
        }

        var selfStudyState, dashboardStates, dashboardActiveState = false,
            currentCollectionCanonicalEID, currentCollectionTitle, currentCollectionHandle,
            currentCollectionCreatorID;

        function escapeHTML(string) {
            string = string.toString();
            return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function handleCardExpansion(thisElement) {
            var sibbling, index, $this, $parent,
                desktop = true,
                prev = true,
                mobile = false;
            if (window.innerWidth > 767) {
                if ($('#assignmentsContainer').find('.expand-view-button.active').not(thisElement).length > 0) {
                    handleCardExpansion($('#assignmentsContainer').find('.expand-view-button.active'));
                }
            }
            $this = thisElement;
            $parent = $this.parent('.dashboard-widget');
            $this.toggleClass('active');
            index = $parent.index();
            if ($('#assignmentsContainer').width() < (981)) {
                desktop = false;
            }

            if (window.innerWidth < (768)) {
                mobile = true;
            }

            if (!$parent.hasClass('expand-active')) {
                $parent.find('.expand-open').removeClass('hide');
                $parent.find('.expand-close').addClass('hide');
                if (desktop) {
                    if ((index + 1) % 3 === 0) {
                        sibbling = $('#assignmentsContainer').find('.dashboard-widget.expand-active').prev();
                    } else {
                        sibbling = $('#assignmentsContainer').find('.dashboard-widget.expand-active').next();
                    }
                } else {
                    if ((index + 1) % 2 === 0) {
                        sibbling = $('#assignmentsContainer').find('.dashboard-widget.expand-active').prev();
                    } else {
                        sibbling = $('#assignmentsContainer').find('.dashboard-widget.expand-active').next();
                    }
                }
                if (sibbling.length === 0) {
                    sibbling = $('#assignmentsContainer').find('.dashboard-widget.expand-active').prev();
                }
                if (!mobile) {
                    sibbling.css({
                        'margin': '0 8px 20px 9px'
                    });
                }
                if (window.innerWidth > 767) {
                    $('#assignmentsContainer').find('.dashboard-widget').removeClass('overlap-widget expand-active').css({
                        'z-index': '1'
                    });
                }
            }

            $parent.css('z-index', '2');
            $parent.toggleClass('overlap-widget');
            $this.children('.expand-open, .expand-close').toggleClass('hide');
            $parent.toggleClass('expand-active');
            setTimeout(function () {
                $parent.toggleClass('active');
            }, 1000);

            if (!mobile) {
                if (desktop) {
                    if ((index + 1) % 3 === 0) {
                        sibbling = $parent.prev();
                    } else {
                        sibbling = $parent.next();
                        prev = false;
                    }
                } else {
                    if ((index + 1) % 2 === 0) {
                        sibbling = $parent.prev();
                    } else {
                        sibbling = $parent.next();
                        prev = false;
                    }
                }
                $('#assignmentsContainer').find('.dashboard-widget').unbind('transitionend').bind('transitionend', function () {
                    if (!$parent.hasClass('expand-active')) {
                        sibbling.css('z-index', '1');
                    }
                });

                if (prev) {
                    if ($parent.hasClass('expand-active')) {
                        sibbling.css('margin-right', '-320px');
                    } else {
                        sibbling.css('margin-right', '8px');
                        sibbling.css('z-index', '1');
                    }
                } else {
                    if ($parent.hasClass('expand-active')) {
                        sibbling.css('margin-left', '-320px');
                    } else {
                        sibbling.css('margin-left', '9px');
                        sibbling.css('z-index', '1');
                    }
                }
            }
            if ($parent.find('.concepts-wrapper').height() < $parent.find('.assignment-concept-list').height()) {
                $parent.find('.swiped-bottom-button').addClass('active');
                $parent.find('.spindle-expand').addClass('spindle-bottom-present');
            }
        }

        function bindEventsForLatestAssignments() {
            $('.js-group-link').off('clik.group').on('click.group', function () {
                var groupID = $(this).parents('.dashboard-widget').attr('data-group-id');
                location.href = '/group-assignments/' + groupID;
            });

            $('#assignmentsContainer').find('.expand-view-button').off('click.expand').on('click.expand', function () {
                handleCardExpansion($(this));
            });

            $('#assignmentsContainer').find('.dashboard-widget').each(function () {

                Hammer('#' + this.id).off('dragleft.latestAssignment').on('dragleft.latestAssignment', function () {
                    if (window.innerWidth < (768)) {
                        if (!$(this).hasClass('overlap-widget')) {
                            $(this).addClass('dragleft');
                        }
                    }
                });

                Hammer('#' + this.id).off('dragright.latestAssignment').on('dragright.latestAssignment', function () {
                    if (window.innerWidth < (768)) {
                        if ($(this).hasClass('overlap-widget')) {
                            $(this).addClass('dragright');
                        }
                    }
                });

                Hammer('#' + this.id).off('release.latestAssignment').on('release.latestAssignment', function () {
                    if (window.innerWidth < (768)) {
                        if ($(this).hasClass('dragleft') || $(this).hasClass('dragright')) {
                            handleCardExpansion($(this).find('.expand-view-button'));
                        }
                        $(this).removeClass('dragleft dragright');
                    }
                });

            });

            $('#assignmentsContainer').find('.swiped-bottom-button').off('click.next').on('click.next', function () {
                var $this, $list, $container, containetHeight, listTop, listHeight, newTop, $topButton, $spindle;
                $this = $(this);
                if ($this.hasClass('active') && !($this.hasClass('js-disabled'))) {
                    $container = $this.siblings('.concepts-wrapper');
                    $list = $this.siblings('.concepts-wrapper').find('.assignment-concept-list');
                    $topButton = $this.siblings('.swiped-top-button');
                    $spindle = $this.siblings('.spindle-expand');
                    $spindle.addClass('spindle-top-present');
                    containetHeight = $container.height();
                    listHeight = $list.height();
                    listTop = parseInt($list.css('top'), 10);
                    if ((listHeight + listTop) > containetHeight) {
                        $spindle.addClass('spindle-top-present');
                        $topButton.addClass('active');
                        newTop = listTop - containetHeight;
                        $this.addClass('js-disabled');
                        $list.css('top', newTop + 'px');
                        setTimeout(function () {
                            $this.removeClass('js-disabled');
                        }, 800);
                        if ((listHeight + newTop) > containetHeight) {
                            $spindle.addClass('spindle-bottom-present');
                        } else {
                            $(this).removeClass('active');
                            $spindle.removeClass('spindle-bottom-present');
                        }
                    }
                }
            });

            $('#assignmentsContainer').find('.swiped-top-button').off('click.next').on('click.next', function () {
                var $this, $list, $container, containetHeight, listTop, newTop, $bottomButton, $spindle;
                $this = $(this);
                if ($this.hasClass('active') && !($this.hasClass('js-disabled'))) {
                    $container = $this.siblings('.concepts-wrapper');
                    $list = $this.siblings('.concepts-wrapper').find('.assignment-concept-list');
                    $bottomButton = $this.siblings('.swiped-bottom-button');
                    $spindle = $this.siblings('.spindle-expand');
                    $spindle.addClass('spindle-bottom-present');
                    containetHeight = $container.height();
                    listTop = parseInt($list.css('top'), 10);
                    if (listTop < 0) {
                        newTop = listTop + containetHeight;
                        $this.addClass('js-disabled');
                        $list.css('top', newTop + 'px');
                        setTimeout(function () {
                            $this.removeClass('js-disabled');
                        }, 800);
                        $bottomButton.addClass('active');
                        if (!(newTop < 0)) {
                            $spindle.removeClass('spindle-top-present');
                            $this.removeClass('active');
                        }
                    }
                }
            });
            $(window).off('resize.latestAssignment').on('resize.latestAssignment', function () {
                if (window.innerWidth > 767) {
                    if (!$('#assignmentsContainer .dashboard-widget').hasClass('large-view')) {
                        $('#assignmentsContainer .dashboard-widget').css({
                            'z-index': '1',
                            'margin-left': '9px',
                            'margin-right': '8px'
                        });
                        $('#assignmentsContainer .dashboard-widget.overlap-widget').find('.expand-view-button').trigger('click');
                        if (!$('#assignmentsContainer .dashboard-widget').hasClass('overlap-widget')) {
                            $('#assignmentsContainer .dashboard-widget').addClass('large-view');
                        }
                    }
                } else {
                    if ($('#assignmentsContainer .dashboard-widget').hasClass('large-view')) {
                        $('#assignmentsContainer .dashboard-widget.overlap-widget').find('.expand-view-button').trigger('click');
                        $('#assignmentsContainer .dashboard-widget').css({
                            'z-index': '1',
                            'margin-left': '9px',
                            'margin-right': '8px'
                        });
                        $('#assignmentsContainer .dashboard-widget').removeClass('large-view');
                    }
                }
            });
        }

        function parseDate(dueDate) {
            var dateString = '';
            dueDate = dueDate.substr(0, 10);
            dateString = dueDate.substr(5, 2) + '/' + dueDate.substr(8, 2) + '/' + dueDate.substr(0, 4);
            return dateString;
        }

        function absolutePositioning() {
            var windowWidth, startPracticeWidth, sideContainerWidth, offset, height;
            windowWidth = $(window).width();
            height = $('.practice-message').outerHeight();
            startPracticeWidth = $('.practice-message').outerWidth();
            sideContainerWidth = (windowWidth - startPracticeWidth) / 2;
            offset = '-' + sideContainerWidth + 'px';
            $('.left-practice-message').css({
                height: height,
                left: offset,
                width: sideContainerWidth
            });
            $('.right-practice-message').css({
                height: height,
                right: offset,
                width: sideContainerWidth
            });
        }

        function postConceptComplete() {
            location.reload();
        }

        function initCoversheetBinding(isAssignment) {
            $('.concept').off('click.coverSheet').on('click.coverSheet', function () {
                var handle = $(this).attr('data-handle'),
                    encodedId,
                    collectionHandle = $(this).attr('data-collection-handle') || '',
                    conceptCollectionAbsoluteHandle = $(this).attr('data-concept-collection-absolute-handle') || '',
                    conceptCollectionHandle = $(this).attr('data-concept-collection-handle') || '',
                    collectionCreatorID = $(this).attr('data-collection-creator-ID') || '',
                    assignmentId = isAssignment ? $(this).attr('data-assignmentid') : '',
                    completed = '',
                    login = $(this).attr('data-login'),
                    contextUrl = $(this).attr('data-contextUrl'),
                    mtype = $(this).attr('data-mtype'),
                    conceptTitle = '';
                if ($(this).siblings(':last').children().eq(1).is(':visible') || $(this).children(':eq(0)').hasClass('ploted')) {
                    completed = 'completed';
                }
                else if ($(this).hasClass('recent-block') && $(this).parent().siblings().find('.last-score-done').is(':visible')) {
                    completed = 'completed';
                }
                if ($(this).hasClass('plotContainer')) {
                    conceptTitle = $(this).find('.plot').attr('data-conceptname');
                } else if ($(this).hasClass('start-block')) {
                    conceptTitle = $(this).siblings('.body-left-side').find('.widget-instructions').find('span').text();
                } else if ($(this).hasClass('recent-block') || $(this).hasClass('next-block')) {
                    conceptTitle = $(this).parent().siblings('.widget-instructions').find('span').text();
                } else {
                    conceptTitle = $.trim($(this).text());
                }
                if (contextUrl) {
                    //condition change for bug 49309
                    if (contextUrl.indexOf('asmtquiz') === -1) {
                        encodedId = $(this).attr('data-encodedid');
                    }
                    //adding mtype condition for US#150860043
                    if (contextUrl.indexOf('asmtpractice') > 0 || contextUrl.indexOf('asmtquiz') > 0 || (mtype === "assignFlow" || mtype === "asmtquiz" || mtype === "asmtpractice")) {
                        coverSheet.init({
                            'handle': handle,
                            'collectionHandle': collectionHandle,
                            'conceptCollectionAbsoluteHandle': conceptCollectionAbsoluteHandle,
                            'conceptCollectionHandle': conceptCollectionHandle,
                            'collectionCreatorID': collectionCreatorID,
                            'encodedId': encodedId,
                            'login': login,
                            'completed': completed,
                            'conceptTitle': conceptTitle,
                            'assignmentId': assignmentId,
                            'callback': postConceptComplete
                        });
                        $('.dashboard-body-container').addClass('hide');
                    } else {
                        window.open(contextUrl);
                    }

                } else {
                    if (mtype !== 'asmtquiz' && mtype !== 'quiz') {
                        encodedId = $(this).attr('data-encodedid');
                    }
                    coverSheet.init({
                        'handle': handle,
                        'collectionHandle': collectionHandle,
                        'conceptCollectionAbsoluteHandle': conceptCollectionAbsoluteHandle,
                        'conceptCollectionHandle': conceptCollectionHandle,
                        'collectionCreatorID': collectionCreatorID,
                        'encodedId': encodedId,
                        'login': login,
                        'completed': completed,
                        'conceptTitle': conceptTitle,
                        'assignmentId': assignmentId,
                        'callback': postConceptComplete
                    });
                    $('.dashboard-body-container').addClass('hide');
                }

            });
        }

        function updateHash(tabName) {
            location.hash = tabName;
            $.cookie('flxDashboardState', tabName, {
                path: '/'
            });
        }

        function renderAssignments(assignments) {
            var index, template, conceptIndex, template1, total, completedCount, incompleteCount, dueDate, assignment,
                htmlString = '',
                allComplete = false,
                htmlString1 = '',
                recentConcept = {},
                nextConcept = {},
                i, conceptsLength;
            updateHash('latestAssignments');
            if (assignments.response.assignmentCompletedCount > 0 && assignments.response.total === 0) {
                allComplete = true;
            }
            assignments = assignments.response.assignments;
            if (allComplete) {
                require(['text!dashboard/templates/dashboard.latest.assignments.complete.html'], function (assignmentsCompleteTemplate) {
                    $('#assignmentsContainer').html(assignmentsCompleteTemplate);
                    $('#assignmentsContainer').parent().addClass('latest-assignment-complete');
                    $('#assignmentsContainer').addClass('loaded');
                    absolutePositioning();
                    $(window).off('resize.position').on('resize.position', function () {
                        absolutePositioning();
                    });
                });
            } else {
                require(['text!dashboard/templates/dashboard.student.assignment.html',
                'text!dashboard/templates/dashboard.student.concept.html'
            ], function (assignmentTemplate, conceptTemplate) {
                    for (index = 0; index < assignments.length; index++) {
                        htmlString1 = '';
                        recentConcept = {};
                        recentConcept.lastAccess = '';
                        dueDate = '';
                        if (assignments[index].group) {
                            template = assignmentTemplate.replace(/@@groupName@@/g, escapeHTML(assignments[index].group.name || ''));
                            template = template.replace(/@@imageSrc@@/g, assignments[index].group.imageUri);
                        }
                        template = template.replace(/@@assignmentName@@/g, escapeHTML(assignments[index].name || ''));
                        template = template.replace(/@@id@@/g, 'assignment' + assignments[index].assignmentID);
                        template = template.replace(/@@assignmentid@@/g, assignments[index].assignmentID);
                        template = template.replace(/@@groupID@@/g, assignments[index].groupID);

                        if (assignments[index].due) {
                            dueDate = parseDate(assignments[index].due);
                            template = template.replace(/@@dueDate@@/g, dueDate);
                            template = template.replace(/@@hiddenDate@@/g, '');
                        } else {
                            template = template.replace(/@@hiddenDate@@/g, 'hidden');
                        }

                        conceptsLength = assignments[index].concepts.length;
                        for (conceptIndex = 0; conceptIndex < conceptsLength; conceptIndex++) {
                            //find recent concept
                            if ((recentConcept.lastAccess < assignments[index].concepts[conceptIndex].lastAccess) && (assignments[index].concepts[conceptIndex].status === 'completed')) {
                                recentConcept = assignments[index].concepts[conceptIndex];
                                recentConcept.index = conceptIndex;
                            }
                            template1 = conceptTemplate.replace(/@@conceptName@@/g, escapeHTML(
                                assignments[index].concepts[conceptIndex].conceptCollectionTitle || assignments[index].concepts[conceptIndex].name || ''
                            ));
                            if (assignments[index].concepts[conceptIndex].conceptCollectionHandle) {
                            	template1 = template1.replace(/@@collectionHandle@@/g, assignments[index].concepts[conceptIndex].collectionHandle);                                
                            	template1 = template1.replace(/@@collectionCreatorID@@/g, assignments[index].concepts[conceptIndex].collectionCreatorID);
                                template1 = template1.replace(/@@conceptCollectionHandle@@/g, assignments[index].concepts[conceptIndex].conceptCollectionHandle);
                            } else {
                                template1 = template1.replace(/@@collectionHandle@@/g, '');
                                template1 = template1.replace(/@@conceptCollectionAbsoluteHandle@@/g, '');
                                template1 = template1.replace(/@@conceptCollectionHandle@@/g, '');
                                template1 = template1.replace(/@@collectionCreatorID@@/g, '');
                            }
                            // Add actualScore which can represent score above 100%
                            assignments[index].concepts[conceptIndex].actualScore = '';
                            if (assignments[index].concepts[conceptIndex].score !== undefined && assignments[index].concepts[conceptIndex].score !== null) {
                                assignments[index].concepts[conceptIndex].actualScore = assignments[index].concepts[conceptIndex].score.toString();
                            }
                            if (assignments[index].concepts[conceptIndex].score || assignments[index].concepts[conceptIndex].score === 0) {
                                template1 = template1.replace(/@@percentage@@/g, assignments[index].concepts[conceptIndex].score + '%');
                                template1 = template1.replace(/@@hideScore@@/g, '');
                                template1 = template1.replace(/@@hideComplete@@/g, 'hide-important');
                                template1 = template1.replace(/@@hideRadioButton@@/g, '');
                            } else {
                                template1 = template1.replace(/@@hideScore@@/g, 'hide-important');
                                if (assignments[index].concepts[conceptIndex].status === 'completed') {
                                    template1 = template1.replace(/@@hideComplete@@/g, '');
                                    template1 = template1.replace(/@@hideRadioButton@@/g, '');
                                } else {
                                    template1 = template1.replace(/@@hideComplete@@/g, 'hide-important');
                                    template1 = template1.replace(/@@hideRadioButton@@/g, 'hide-important');
                                }
                            }
                            if (assignments[index].concepts[conceptIndex].type === 'asmtquiz') {
                                template1 = template1.replace(/@@login@@/g, assignments[index].concepts[conceptIndex].login || '');
                            } else {
                                template1 = template1.replace(/@@login@@/g, '');
                            }
                            if ('lesson' === assignments[index].concepts[conceptIndex].type) {
                                template1 = template1.replace(/@@icon-name@@/g, 'read');
                            }else if('asmtpractice' === assignments[index].concepts[conceptIndex].type){
                                template1 = template1.replace(/@@icon-name@@/g, 'exercise');
                            }else if('lecture' === assignments[index].concepts[conceptIndex].type){
                                template1 = template1.replace(/@@icon-name@@/g, 'video');
                            }else if('enrichment' === assignments[index].concepts[conceptIndex].type){
                                template1 = template1.replace(/@@icon-name@@/g, 'video');
                            }else if('rwa' === assignments[index].concepts[conceptIndex].type) {
                                template1 = template1.replace(/@@icon-name@@/g, 'rwa');
                            }else if('simulationint' === assignments[index].concepts[conceptIndex].type){
                                template1 = template1.replace(/@@icon-name@@/g, 'simulations');
                            }else if('plix' === assignments[index].concepts[conceptIndex].type){
                                template1 = template1.replace(/@@icon-name@@/g, 'interactive_practice');
                            }else if('asmtquiz' ===  assignments[index].concepts[conceptIndex].type || 'quiz' ===  assignments[index].concepts[conceptIndex].type){
                                template1 = template1.replace(/@@icon-name@@/g, 'quiz');
                            }else if('domain' ===  assignments[index].concepts[conceptIndex].type){
                                template1 = template1.replace(/@@icon-name@@/g, 'lightbulb');
                            }
                            if (assignments[index].concepts[conceptIndex].contextUrl){
                                template = template.replace(/@@data-contextUrl@@/g,  assignments[index].concepts[conceptIndex].contextUrl ||  '');
                                template1 = template1.replace(/@@data-contextUrl@@/g,  assignments[index].concepts[conceptIndex].contextUrl ||  '');
                                template1 = template1.replace(/@@mtype@@/g, assignments[index].concepts[conceptIndex].type || '');
                                template = template.replace(/@@mtype@@/g, assignments[index].concepts[conceptIndex].type || '');
                                if(assignments[index].concepts[conceptIndex].domains){
                                    template1 = template1.replace(/@@encodedid@@/g,  (assignments[index].concepts[conceptIndex].domains[0] && assignments[index].concepts[conceptIndex].domains[0].encodedID)||  '');
                                    template = template.replace(/@@recentEncodedID@@/g, (assignments[index].concepts[conceptIndex].domains[0] && assignments[index].concepts[conceptIndex].domains[0].encodedID)|| '');
                                }
                            }else{
                                template = template.replace(/@@data-contextUrl@@/g, '');
                                template1 = template1.replace(/@@data-contextUrl@@/g, '');
                                template1 = template1.replace(/@@encodedid@@/g, assignments[index].concepts[conceptIndex].encodedID || '');
                                template1 = template1.replace(/@@mtype@@/g, assignments[index].concepts[conceptIndex].type || '');
                                template = template.replace(/@@mtype@@/g, assignments[index].concepts[conceptIndex].type || '');
                            }
                            template1 = template1.replace(/@@assignmentid@@/g, assignments[index].assignmentID);
                            template1 = template1.replace(/@@handle@@/g, assignments[index].concepts[conceptIndex].handle);
                            htmlString1 += template1;
                        }

                        completedCount = parseInt(assignments[index].completedCount, 10);
                        incompleteCount = parseInt(assignments[index].incompleteCount, 10);
                        total = completedCount + incompleteCount;

                        template = template.replace(/@@conceptList@@/g, htmlString1);
                        assignments[index].recentConcept = recentConcept;
                        assignments[index].recentConcept.color = '#FFFFFF';
                        if (recentConcept.lastAccess) {
                            //find next concept
                            for (i = ((recentConcept.index + 1) % conceptsLength); i > -5; i++) {
                                if (assignments[index].concepts[i].status === 'incomplete') {
                                    nextConcept = assignments[index].concepts[i];
                                    break;
                                }
                                if (i === recentConcept.index) {
                                    break;
                                }
                                if (i === (conceptsLength - 1)) {
                                    i = -1;
                                }
                            }

                            if ('asmtquiz' === recentConcept.type) {
                                template = template.replace(/@@recentquiz@@/g, '');
                            } else {
                                template = template.replace(/@@recentquiz@@/g, ' hide');
                            }
                            template = template.replace(/@@hideStart@@/g, 'hide');
                            template = template.replace(/@@recentConceptName@@/g, escapeHTML(
                                recentConcept.type === 'domain' ? (recentConcept.conceptCollectionTitle || recentConcept.name || '') :
                                (recentConcept.name || '')
                            ));
                            template = template.replace(/@@recentEncodedID@@/g, recentConcept.encodedID || '');
                            template = template.replace(/@@recentLogin@@/g, recentConcept.login);
                            template = template.replace(/@@recentHandle@@/g, recentConcept.handle);
                            if (recentConcept.collectionHandle && recentConcept.conceptCollectionAbsoluteHandle) {
                                template = template.replace(/@@recentCollectionHandle@@/g, recentConcept.collectionHandle);
                                template = template.replace(/@@recentConceptCollectionAbsoluteHandle@@/g, recentConcept.conceptCollectionAbsoluteHandle);
                                template = template.replace(/@@recentConceptCollectionHandle@@/g, recentConcept.conceptCollectionHandle);
                                template = template.replace(/@@recentCollectionCreatorID@@/g, recentConcept.collectionCreatorID || '');
                            } else {
                                template = template.replace(/@@recentCollectionHandle@@/g, '');
                                template = template.replace(/@@recentConceptCollectionAbsoluteHandle@@/g, '');
                                template = template.replace(/@@recentConceptCollectionHandle@@/g, '');
                                template = template.replace(/@@recentCollectionCreatorID@@/g, '');
                            }
                            if (recentConcept.score !== '' && recentConcept.score !== null) {
                                template = template.replace(/@@hidden@@/g, '');
                                template = template.replace(/@@hideDone@@/g, 'hide');
                                template = template.replace(/@@lastScore@@/g, recentConcept.actualScore + '%');
                            } else {
                                template = template.replace(/@@hideDone@@/g, 'DONE');
                                if (recentConcept.status === 'completed') {
                                    template = template.replace(/@@hidden@@/g, '');
                                    template = template.replace(/@@hideLastScore@@/g, 'hide');
                                } else {
                                    template = template.replace(/@@hidden@@/g, 'hide');
                                }
                            }

                            if ('asmtquiz' === nextConcept.type) {
                                template = template.replace(/@@nextquiz@@/g, '');
                            } else {
                                template = template.replace(/@@nextquiz@@/g, ' hide');
                            }
                            template = template.replace(/@@nextConceptName@@/g, escapeHTML(
                                nextConcept.type === 'domain' ?
                                (nextConcept.conceptCollectionTitle || nextConcept.name || '') :
                                (nextConcept.name || '')
                            ));
                            template = template.replace(/@@nextEncodedID@@/g, nextConcept.encodedID || '');
                            template = template.replace(/@@nextLogin@@/g, nextConcept.login);
                            template = template.replace(/@@nextHandle@@/g, nextConcept.handle);
                            if (nextConcept.collectionHandle && nextConcept.conceptCollectionAbsoluteHandle) {
                                template = template.replace(/@@nextCollectionHandle@@/g, nextConcept.collectionHandle);
                                template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, nextConcept.conceptCollectionAbsoluteHandle);
                                template = template.replace(/@@nextConceptCollectionHandle@@/g, nextConcept.conceptCollectionHandle);
                                template = template.replace(/@@nextCollectionCreatorID@@/g, nextConcept.collectionCreatorID || '');
                            } else {
                                template = template.replace(/@@nextCollectionHandle@@/g, '');
                                template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, '');
                                template = template.replace(/@@nextConceptCollectionHandle@@/g, '');
                                template = template.replace(/@@nextCollectionCreatorID@@/g, '');
                            }
                        } else {
                            if ('asmtquiz' === assignments[index].concepts[0].type) {
                                template = template.replace(/@@recentquiz@@/g, '');
                            } else {
                                template = template.replace(/@@recentquiz@@/g, ' hide');
                            }
                            template = template.replace(/@@hidden@@/g, 'hidden');
                            template = template.replace(/@@hideDone@@/g, 'hide');
                            template = template.replace(/@@hideStart@@/g, '');
                            if (assignments[index].concepts[0]) {
                                template = template.replace(/@@recentConceptName@@/g, escapeHTML(
                                    assignments[index].concepts[0].type === 'domain' ?
                                    (assignments[index].concepts[0].conceptCollectionTitle || assignments[index].concepts[0].name || '') :
                                    (assignments[index].concepts[0].name || '')
                                ));
                                template = template.replace(/@@recentEncodedID@@/g, assignments[index].concepts[0].encodedID || '');
                                template = template.replace(/@@recentLogin@@/g, assignments[index].concepts[0].login);
                                template = template.replace(/@@recentHandle@@/g, assignments[index].concepts[0].handle || assignments[index].concepts[0].handle);
                                if (assignments[index].concepts[0].collectionHandle && assignments[index].concepts[0].conceptCollectionAbsoluteHandle) {
                                    template = template.replace(/@@recentCollectionHandle@@/g, assignments[index].concepts[0].collectionHandle);
                                    template = template.replace(/@@recentConceptCollectionAbsoluteHandle@@/g, assignments[index].concepts[0].conceptCollectionAbsoluteHandle);
                                    template = template.replace(/@@recentConceptCollectionHandle@@/g, assignments[index].concepts[0].conceptCollectionHandle);
                                    template = template.replace(/@@recentCollectionCreatorID@@/g, assignments[index].concepts[0].collectionCreatorID || '');
                                } else {
                                    template = template.replace(/@@recentCollectionHandle@@/g, '');
                                    template = template.replace(/@@recentConceptCollectionAbsoluteHandle@@/g, '');
                                    template = template.replace(/@@recentConceptCollectionHandle@@/g, '');
                                    template = template.replace(/@@recentCollectionCreatorID@@/g, '');
                                }
                            } else {
                                template = template.replace(/@@recentConceptName@@/g, '');
                                template = template.replace(/@@recentEncodedID@@/g, '');
                                template = template.replace(/@@recentLogin@@/g, '');
                                template = template.replace(/@@recentHandle@@/g, '');
                                template = template.replace(/@@hidePrevConcept@@/g, 'hide');
                                template = template.replace(/@@recentCollectionHandle@@/g, '');
                                template = template.replace(/@@recentCollectionCreatorID@@/g, '');
                                template = template.replace(/@@recentConceptCollectionAbsoluteHandle@@/g, '');
                                template = template.replace(/@@recentConceptCollectionHandle@@/g, '');
                            }

                            if (assignments[index].concepts[1]) {
                                if ('asmtquiz' === assignments[index].concepts[1].type) {
                                    template = template.replace(/@@nextquiz@@/g, '');
                                } else {
                                    template = template.replace(/@@nextquiz@@/g, ' hide');
                                }
                                template = template.replace(/@@nextConceptName@@/g, escapeHTML(
                                    assignments[index].concepts[1].type === 'domain' ?
                                    (assignments[index].concepts[1].conceptCollectionTitle || assignments[index].concepts[1].name || '') :
                                    (assignments[index].concepts[1].name || '')
                                ));
                                template = template.replace(/@@nextEncodedID@@/g, assignments[index].concepts[1].encodedID || '');
                                template = template.replace(/@@nextLogin@@/g, assignments[index].concepts[1].login);
                                template = template.replace(/@@nextHandle@@/g, assignments[index].concepts[1].handle);
                                if (assignments[index].concepts[1].collectionHandle && assignments[index].concepts[1].conceptCollectionAbsoluteHandle) {
                                    template = template.replace(/@@nextCollectionHandle@@/g, assignments[index].concepts[1].collectionHandle);
                                    template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, assignments[index].concepts[1].conceptCollectionAbsoluteHandle);
                                    template = template.replace(/@@nextConceptCollectionHandle@@/g, assignments[index].concepts[1].conceptCollectionHandle);
                                    template = template.replace(/@@nextCollectionCreatorID@@/g, assignments[index].concepts[1].collectionCreatorID);
                                } else {
                                    template = template.replace(/@@nextCollectionHandle@@/g, '');
                                    template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, '');
                                    template = template.replace(/@@nextConceptCollectionHandle@@/g, '');
                                    template = template.replace(/@@nextCollectionCreatorID@@/g, '');
                                }
                            } else {
                                template = template.replace(/@@nextConceptName@@/g, '');
                                template = template.replace(/@@nextEncodedID@@/g, '');
                                template = template.replace(/@@nextLogin@@/g, '');
                                template = template.replace(/@@nextHandle@@/g, '');
                                template = template.replace(/@@hideNextConcept@@/g, 'hide');
                                template = template.replace(/@@nextCollectionHandle@@/g, '');
                                template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, '');
                                template = template.replace(/@@nextConceptCollectionHandle@@/g, '');
                                template = template.replace(/@@nextCollectionCreatorID@@/g, '');
                            }
                        }

                        template = template.replace(/@@completed@@/g, completedCount);
                        template = template.replace(/@@total@@/g, total);
                        if (completedCount === total) {
                            template = template.replace(/@@hideComplete@@/g, '');
                            template = template.replace(/@@hideNext@@/g, 'hide');
                        } else {
                            template = template.replace(/@@hideComplete@@/g, 'hide');
                            template = template.replace(/@@hideNext@@/g, '');
                        }

                        if (completedCount === 0) {
                            template = template.replace(/@@graphClass@@/g, 'zero-complete');
                            assignments[index].backgroundColor = '#A5E5D8';
                            assignments[index].color = '#4DCCC4';
                        } else if (completedCount > incompleteCount) {
                            template = template.replace(/@@graphClass@@/g, 'full-complete');
                            assignments[index].backgroundColor = '#019690';
                            assignments[index].color = '#4DCCC4';
                        } else {
                            template = template.replace(/@@graphClass@@/g, 'half-complete');
                            assignments[index].backgroundColor = '#4DCCC4';
                            assignments[index].color = '#00ABA4';
                        }

                        htmlString += template;
                    }
                    $('#assignmentsContainer').append(htmlString).addClass('loaded');

                    for (i = 0; i < assignments.length; i++) {
                        assignment = assignments[i];
                        $('#assignment' + assignments[i].assignmentID).find('.barGraphs').graph({
                            items: assignment
                        });
                    }
                    if (window.innerWidth > 767) {
                        $('#assignmentsContainer .dashboard-widget').addClass('large-view');
                    }
                    bindEventsForLatestAssignments();
                    initCoversheetBinding(true);
                });
            }
        }

        function renderSubjectDropDown(subjectList) {
            var template, index, subjectName, encodedID, param,
                collectionHandle, collectionCreatorID,
                htmlString = '';
            require(['text!dashboard/templates/dashboard.self.study.subject.html'], function (subjectTemplate) {
                for (index = 0; index < subjectList.length; index++) {
                    template = subjectTemplate.replace(/@@subjectName@@/, subjectList[index].name);
                    template = template.replace(/@@encodedID@@/, subjectList[index].subjectID + '.' + subjectList[index].shortname);
                    template = template.replace(/@@collectionHandle@@/, subjectList[index].handle.toLowerCase());
                    template = template.replace(/@@collectionCreatorID@@/, '3'); // 3 is default collection creator ID
                    htmlString += template;
                }
                $('#subjectListDropDown').html(htmlString);
                $('#subjectListDropDown').find('.subject-list-item').off('click.load').on('click.load', function () {
                    subjectName = $(this).find('a').text();
                    encodedID = $(this).attr('data-encodedID');
                    collectionHandle = $(this).attr('data-collection-handle');
                    collectionCreatorID = $(this).attr('data-collection-creator-ID');
                    $('#allSubjectsContainer').find('.subject-name').text(subjectName);
                    $('#subjectListDropDown').removeClass('open').css({
                        left: '-99999px'
                    });
                    param = {
                        'format': 'json',
                        'limit': 20
                    };
                    if(collectionHandle && collectionCreatorID){
                        param.collectionHandle = collectionHandle;
                        param.collectionCreatorID = collectionCreatorID;
                    }
                    dashboardController.getSubjectTracks(param);
                });
            });
        }

        function postRenderSubjectTracks() {
            if ($('#allSubjectsContainer').find('.js-completed-track-item').length) {
                $('.select-option').removeClass('checked');
                $('#allSubjectsContainer').find('.select-option-wrapper').removeClass('hidden');
            } else {
                $('#allSubjectsContainer').find('.select-option-wrapper').addClass('hidden');
            }

            $('#showLatestSelfStudyView').off('click.back').on('click.back', function () {
                $('#latestTracksontainer').removeClass('hide');
                $('#allSubjectsContainer').addClass('hide');
            });

            $('.track-view').off('click.grid').on('click.grid', function () {
                if (!$(this).hasClass('active')) {
                    $('.track-view').toggleClass('active');
                    $('.tracks-container').toggleClass('hide active');
                    if ($(this).hasClass('grid-view') && !$('#tracksGridView').find('.dashboard-widget:first-child').hasClass('loaded')) {
                        $('#tracksGridView').find('.recent-arrow').each(function () {
                            var margin = ($(this).parent().width() - $(this).outerWidth()) / 2;
                            $(this).css('margin-left', margin);
                        });
                        $('#tracksGridView').find('.dashboard-widget:first-child').addClass('loaded');
                    }
                }
            });

            $('#tracksListView').find('.items-row').off('click.expand').on('click.expand', function () {
                var sibling;
                sibling = $(this).siblings('.widget-body-expands');
                sibling.toggleClass('hide');
                $(this).find('.arrow-icon').toggleClass('hide');
                if (!sibling.hasClass('hide')) {
                    if (sibling.find('.concepts-wrapper').height() < sibling.find('.assignment-concept-list').height()) {
                        sibling.find('.swiped-bottom-button').addClass('active');
                        sibling.find('.spindle-expand').addClass('spindle-bottom-present');
                    }
                }
            });

            $('#tracksListView').find('.expand-view-button').off('click.collapse').on('click.collapse', function () {
                $(this).parent('.widget-body-expands').toggleClass('hide');
                $(this).parent('.widget-body-expands').siblings('.items-row').find('.arrow-icon').addClass('hide');
            });

            $('.select-option').off('click.check').on('click.check', function () {
                $(this).toggleClass('checked');
                if ($(this).hasClass('checked')) {
                    $('#allSubjectsContainer').find('.track-item').addClass('hide');
                    $('#allSubjectsContainer').find('.js-completed-track-item').removeClass('hide');
                } else {
                    $('#allSubjectsContainer').find('.track-item').removeClass('hide');
                }
            });

            $('#tracksListView').find('.swiped-bottom-button').off('click.next').on('click.next', function () {
                var $this, $list, $container, containetHeight, listTop, listHeight, newTop, $topButton, $spindle;
                $this = $(this);
                if ($this.hasClass('active') && !($this.hasClass('js-disabled'))) {
                    $container = $this.siblings('.concepts-wrapper');
                    $list = $this.siblings('.concepts-wrapper').find('.assignment-concept-list');
                    $topButton = $this.siblings('.swiped-top-button');
                    $spindle = $this.siblings('.spindle-expand');
                    $spindle.addClass('spindle-top-present');
                    containetHeight = $container.height();
                    listHeight = $list.height();
                    listTop = parseInt($list.css('top'), 10);
                    if ((listHeight + listTop) > containetHeight) {
                        $spindle.addClass('spindle-top-present');
                        $topButton.addClass('active');
                        newTop = listTop - containetHeight;
                        $this.addClass('js-disabled');
                        $list.css('top', newTop + 'px');
                        setTimeout(function () {
                            $this.removeClass('js-disabled');
                        }, 800);
                        if ((listHeight + newTop) > containetHeight) {
                            $spindle.addClass('spindle-bottom-present');
                        } else {
                            $(this).removeClass('active');
                            $spindle.removeClass('spindle-bottom-present');
                        }
                    }
                }
            });

            $('#tracksListView').find('.swiped-top-button').off('click.next').on('click.next', function () {
                var $this, $list, $container, containetHeight, listTop, newTop, $bottomButton, $spindle;
                $this = $(this);
                if ($this.hasClass('active') && !($this.hasClass('js-disabled'))) {
                    $container = $this.siblings('.concepts-wrapper');
                    $list = $this.siblings('.concepts-wrapper').find('.assignment-concept-list');
                    $bottomButton = $this.siblings('.swiped-bottom-button');
                    $spindle = $this.siblings('.spindle-expand');
                    $spindle.addClass('spindle-bottom-present');
                    containetHeight = $container.height();
                    listTop = parseInt($list.css('top'), 10);
                    if (listTop < 0) {
                        newTop = listTop + containetHeight;
                        $this.addClass('js-disabled');
                        $list.css('top', newTop + 'px');
                        setTimeout(function () {
                            $this.removeClass('js-disabled');
                        }, 800);
                        $bottomButton.addClass('active');
                        if (!(newTop < 0)) {
                            $spindle.removeClass('spindle-top-present');
                            $this.removeClass('active');
                        }
                    }
                }
            });
        }

        function handleSelfStudyCardExpansion(thisElement, container) {
            var sibbling, index, $this, $parent,
                desktop = true,
                prev = true,
                mobile = false;
            if (window.innerWidth > 767) {
                if (container.find('.expand-view-button.active').not(thisElement).length > 0) {
                    handleSelfStudyCardExpansion(container.find('.expand-view-button.active'), container);
                }
            }
            $this = thisElement;
            $parent = $this.parent('.dashboard-widget');
            $this.toggleClass('active');
            index = $parent.index();
            if (container.width() < (981)) {
                desktop = false;
            }

            if (window.innerWidth < (768)) {
                mobile = true;
            }

            if (!$parent.hasClass('expand-active')) {
                $parent.find('.expand-open').removeClass('hide');
                $parent.find('.expand-close').addClass('hide');
                if (desktop) {
                    if ((index + 1) % 3 === 0) {
                        sibbling = container.find('.dashboard-widget.expand-active').prev();
                    } else {
                        sibbling = container.find('.dashboard-widget.expand-active').next();
                    }
                } else {
                    if ((index + 1) % 2 === 0) {
                        sibbling = container.find('.dashboard-widget.expand-active').prev();
                    } else {
                        sibbling = container.find('.dashboard-widget.expand-active').next();
                    }
                }
                if (sibbling.length === 0) {
                    sibbling = container.find('.dashboard-widget.expand-active').prev();
                }
                if (!mobile) {
                    sibbling.css({
                        'margin': '0 8px 20px 9px'
                    });
                }
                if (window.innerWidth > 767) {
                    container.find('.dashboard-widget').removeClass('overlap-widget expand-active').css({
                        'z-index': '1'
                    });
                }
            }

            $parent.css('z-index', '2');
            $parent.toggleClass('overlap-widget');
            $this.children('.expand-open, .expand-close').toggleClass('hide');
            $parent.toggleClass('expand-active');
            setTimeout(function () {
                $parent.toggleClass('active');
            }, 200);

            if (!mobile) {
                if (desktop) {
                    if ((index + 1) % 3 === 0) {
                        sibbling = $parent.prev();
                    } else {
                        sibbling = $parent.next();
                        prev = false;
                    }
                } else {
                    if ((index + 1) % 2 === 0) {
                        sibbling = $parent.prev();
                    } else {
                        sibbling = $parent.next();
                        prev = false;
                    }
                }
                container.find('.dashboard-widget').unbind('transitionend').bind('transitionend', function () {
                    if (!$parent.hasClass('expand-active')) {
                        sibbling.css('z-index', '1');
                    }
                });

                if (prev) {
                    if ($parent.hasClass('expand-active')) {
                        sibbling.css('margin-right', '-320px');
                    } else {
                        sibbling.css('margin-right', '8px');
                        sibbling.css('z-index', '1');
                    }
                } else {
                    if ($parent.hasClass('expand-active')) {
                        sibbling.css('margin-left', '-320px');
                    } else {
                        sibbling.css('margin-left', '9px');
                        sibbling.css('z-index', '1');
                    }
                }
            }
            if ($parent.find('.concepts-wrapper').height() < $parent.find('.assignment-concept-list').height()) {
                $parent.find('.swiped-bottom-button').addClass('active');
                $parent.find('.spindle-expand').addClass('spindle-bottom-present');
            }
        }

        function bindEventsForSelfStudy(container) {
            $('#allSubjectsProgressLink').find('a').off('click.subject').on('click.subject', function () {
                var param, firstTime;
                if (!$('#allSubjectsContainer').hasClass('loaded')) {
                    firstTime = true;
                    $('#latestTracksontainer').addClass('hide');
                    $('#allSubjectsContainer').removeClass('hide');
                    param = {
                        'format': 'json',
                        'limit': 20
                    };
                    if (currentCollectionHandle) {
                        param.collectionHandle = currentCollectionHandle;
                        param.collectionCreatorID = currentCollectionCreatorID;
                    }
                    dashboardController.getSubjectTracks(param, firstTime);
                    $('#allSubjectsContainer').addClass('loaded');
                } else {
                    $('#latestTracksontainer').addClass('hide');
                    $('#allSubjectsContainer').removeClass('hide');
                }
            });

            container.find('.expand-view-button').off('click.expand').on('click.expand', function () {
                handleSelfStudyCardExpansion($(this), container);
            });

            container.find('.dashboard-widget').each(function () {
                Hammer('#' + this.id).off('dragleft.selfStudy').on('dragleft.selfStudy', function () {
                    if (window.innerWidth < (768)) {
                        if (!$(this).hasClass('overlap-widget')) {
                            $(this).addClass('dragleft');
                        }
                    }
                });
                Hammer('#' + this.id).off('dragright.selfStudy').on('dragright.selfStudy', function () {
                    if (window.innerWidth < (768)) {
                        if ($(this).hasClass('overlap-widget')) {
                            $(this).addClass('dragright');
                        }
                    }
                });
                Hammer('#' + this.id).off('release.selfStudy').on('release.selfStudy', function () {
                    if (window.innerWidth < (768)) {
                        if ($(this).hasClass('dragleft') || $(this).hasClass('dragright')) {
                            handleSelfStudyCardExpansion($(this).find('.expand-view-button'), container);
                        }
                        $(this).removeClass('dragleft dragright');
                    }
                });
            });

            container.find('.swiped-bottom-button').off('click.next').on('click.next', function () {
                var $this, $list, $container, containetHeight, listTop, listHeight, newTop, $topButton, $spindle;
                $this = $(this);
                if ($this.hasClass('active') && !($this.hasClass('js-disabled'))) {
                    $container = $this.siblings('.concepts-wrapper');
                    $list = $this.siblings('.concepts-wrapper').find('.assignment-concept-list');
                    $topButton = $this.siblings('.swiped-top-button');
                    $spindle = $this.siblings('.spindle-expand');
                    $spindle.addClass('spindle-top-present');
                    containetHeight = $container.height();
                    listHeight = $list.height();
                    listTop = parseInt($list.css('top'), 10);
                    if ((listHeight + listTop) > containetHeight) {
                        $spindle.addClass('spindle-top-present');
                        $topButton.addClass('active');
                        newTop = listTop - containetHeight;
                        $this.addClass('js-disabled');
                        $list.css('top', newTop + 'px');
                        setTimeout(function () {
                            $this.removeClass('js-disabled');
                        }, 800);
                        if ((listHeight + newTop) > containetHeight) {
                            $spindle.addClass('spindle-bottom-present');
                        } else {
                            $(this).removeClass('active');
                            $spindle.removeClass('spindle-bottom-present');
                        }
                    }
                }
            });

            container.find('.swiped-top-button').off('click.next').on('click.next', function () {
                var $this, $list, $container, containetHeight, listTop, newTop, $bottomButton, $spindle;
                $this = $(this);
                if ($this.hasClass('active') && !($this.hasClass('js-disabled'))) {
                    $container = $this.siblings('.concepts-wrapper');
                    $list = $this.siblings('.concepts-wrapper').find('.assignment-concept-list');
                    $bottomButton = $this.siblings('.swiped-bottom-button');
                    $spindle = $this.siblings('.spindle-expand');
                    $spindle.addClass('spindle-bottom-present');
                    containetHeight = $container.height();
                    listTop = parseInt($list.css('top'), 10);
                    if (listTop < 0) {
                        newTop = listTop + containetHeight;
                        $this.addClass('js-disabled');
                        $list.css('top', newTop + 'px');
                        setTimeout(function () {
                            $this.removeClass('js-disabled');
                        }, 800);
                        $bottomButton.addClass('active');
                        if (!(newTop < 0)) {
                            $spindle.removeClass('spindle-top-present');
                            $this.removeClass('active');
                        }
                    }
                }
            });
            $(window).off('resize.selfStudy').on('resize.selfStudy', function () {
                if (window.innerWidth > 767) {
                    if (!$('#selfStudyContainer .dashboard-widget').hasClass('large-view')) {
                        $('#selfStudyContainer .dashboard-widget').css({
                            'z-index': '1',
                            'margin-left': '9px',
                            'margin-right': '8px'
                        });
                        $('#selfStudyContainer .dashboard-widget.overlap-widget').find('.expand-view-button').trigger('click');
                        if (!$('#selfStudyContainer .dashboard-widget').hasClass('overlap-widget')) {
                            $('#selfStudyContainer .dashboard-widget').addClass('large-view');
                        }
                    }
                } else {
                    if ($('#selfStudyContainer .dashboard-widget').hasClass('large-view')) {
                        $('#selfStudyContainer .dashboard-widget.overlap-widget').find('.expand-view-button').trigger('click');
                        $('#selfStudyContainer .dashboard-widget').css({
                            'z-index': '1',
                            'margin-left': '9px',
                            'margin-right': '8px'
                        });
                        $('#selfStudyContainer .dashboard-widget').removeClass('large-view');
                    }
                }
            });
        }

        function convertToSlug(text) {
            return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
        }

        function renderInactiveSelfStudy(mathSubjects, scienceSubjects, englishSubjects) {
            var htmlFileList, index, template,
                htmlString = '';
            if (selfStudyState === 'complete') {
                htmlFileList = ['text!dashboard/templates/dashboard.self.study.complete.html',
                'text!dashboard/templates/dashboard.self.study.subjects.list.html',
                'text!dashboard/templates/dashboard.student.inactive.subject.html'
            ];
            } else {
                htmlFileList = ['text!dashboard/templates/dashboard.self.study.zero.state.html',
                                'text!dashboard/templates/dashboard.self.study.subjects.list.html',
                                'text!dashboard/templates/dashboard.student.inactive.subject.html'
                                ];
            }
            require(htmlFileList, function (selfStudyStateTemplate, subjectListTemplate, subjectTemplate) {
                $('.self-study-state').addClass('hide');
                $('#slefStudyZeroStateContainer').removeClass('hide').html(selfStudyStateTemplate);
                $('#slefStudyZeroStateContainer').find('.dashboard-zerostate').append(subjectListTemplate);
                $('#selfStudyContainer').parent().addClass('self-study-zerostate');
                if (selfStudyState === 'complete') {
                    $('#selfStudyContainer').parent().addClass('completed');
                }
                for (index = 0; index < mathSubjects.length; index++) {
                    template = subjectTemplate.replace(/@@title@@/g, mathSubjects[index].name);
                    template = template.replace(/@@href@@/g, '/' + convertToSlug(mathSubjects[index].name));
                    template = template.replace(/@@encodedID@@/g, mathSubjects[index].subjectID + '.' + mathSubjects[index].shortname);
                    template = template.replace(/@@subjectHandle@@/g, convertToSlug(mathSubjects[index].name));
                    htmlString += template;
                }
                $('#selfStudyMathSubjectsContainer').append(htmlString);
                htmlString = '';
                for (index = 0; index < scienceSubjects.length; index++) {
                    template = subjectTemplate.replace(/@@title@@/g, scienceSubjects[index].name);
                    template = template.replace(/@@href@@/g, '/' + convertToSlug(scienceSubjects[index].name));
                    template = template.replace(/@@encodedID@@/g, scienceSubjects[index].subjectID + '.' + scienceSubjects[index].shortname);
                    template = template.replace(/@@subjectHandle@@/g, convertToSlug(scienceSubjects[index].name));
                    htmlString += template;
                }
                $('#selfStudyScienceSubjectsContainer').append(htmlString);
                htmlString = '';
                for (index = 0; index < englishSubjects.length; index++) {
                    template = subjectTemplate.replace(/@@title@@/g, englishSubjects[index].name);
                    template = template.replace(/@@href@@/g, '/' + convertToSlug(englishSubjects[index].name));
                    template = template.replace(/@@encodedID@@/g, englishSubjects[index].subjectID + '.' + englishSubjects[index].shortname);
                    template = template.replace(/@@subjectHandle@@/g, convertToSlug(englishSubjects[index].name));
                    htmlString += template;
                }
                $('#selfStudyEnglishSubjectsContainer').append(htmlString);
                $('#selfStudyContainer').addClass('loaded');
                absolutePositioning();
                $(window).off('resize.position').on('resize.position', function () {
                    absolutePositioning();
                });
            });
        }

        function renderSelfStudyTracks(assignments, loadSubjects, callback) {
            var index, template, conceptIndex, template1, template2, total, completedCount, dynamicId, incompleteCount, container, assignmentCompletedCount, assignmentTotal,
                selfStudy = true,
                htmlFileList = [],
                htmlString = '',
                listHtmlString = '',
                htmlString1 = '',
                recentConcept = {},
                nextConcept = {},
                conceptsLength, i, assignment;
            updateHash('selfStudy');
            if (!$('#latestTracks').hasClass('loaded') || loadSubjects) {
                if (assignments.response.complete === 'true') {
                    selfStudyState = 'complete';
                    dashboardController.loadSubjects(selfStudy);
                } else if (assignments.response.complete === 'false') {
                    selfStudyState = 'zero';
                    dashboardController.loadSubjects(selfStudy);
                } else {
                    selfStudyState = 'active';
                    if (loadSubjects) {
                        htmlFileList = ['text!dashboard/templates/dashboard.self.study.html',
                                'text!dashboard/templates/dashboard.student.concept.html',
                                'text!dashboard/templates/dashboard.self.study.listview.html'];
                        container = $('#tracksGridView');
                    } else {
                        htmlFileList = [
                            'text!dashboard/templates/dashboard.self.study.html',
                            'text!dashboard/templates/dashboard.student.concept.html'
                        ];
                        container = $('#latestTracks');
                    }
                    require(htmlFileList, function (assignmentTemplate, conceptTemplate, listviewTemplate) {
                        assignmentCompletedCount = 0;
                        assignments = assignments.response.selfStudies;
                        assignmentTotal = assignments.length;
                        for (index = 0; index < assignments.length; index++) {
                            htmlString1 = '';
                            recentConcept.lastAccessTime = '';
                            currentCollectionCanonicalEID = assignments[0].collectionCanonicalEncodedID;
                            currentCollectionHandle = assignments[0].collectionHandle ? assignments[0].collectionHandle : '';
                            currentCollectionCreatorID = assignments[0].collectionCreatorID ? assignments[0].collectionCreatorID : '3';
                            currentCollectionTitle = assignments[0].collectionTitle || '';
                            $('#allSubjectsContainer').find('.subject-name').text(currentCollectionTitle);
                            template = assignmentTemplate.replace(/@@subjectName@@/g, assignments[index].collectionTitle || '');
                            template = template.replace(/@@subjectIcon@@/g, 'icon-' + convertToSlug(assignments[index].collectionTitle || ''));
                            template = template.replace(/@@imageSrc@@/g, assignments[index].groupImage); //TODO: SARATH?
                            template = template.replace(/@@assignmentName@@/g, escapeHTML(assignments[index].title || ''));
                            dynamicId = container.attr('id') + index;
                            template = template.replace(/@@id@@/g, dynamicId);

                            if (assignments[index].completedCount === assignments[index].totalCount) {
                                assignmentCompletedCount++;
                            }

                            conceptsLength = assignments[index].concepts.length;
                            for (conceptIndex = 0; conceptIndex < conceptsLength; conceptIndex++) {
                                //add extra info for the graph
                                assignments[index].concepts[conceptIndex].encodedID = assignments[index].concepts[conceptIndex].conceptEncodedID;
                                assignments[index].concepts[conceptIndex].name = assignments[index].concepts[conceptIndex].conceptCollectionTitle || assignments[index].concepts[conceptIndex].name || '';
                                assignments[index].concepts[conceptIndex].handle = assignments[index].concepts[conceptIndex].conceptHandle;
                                assignments[index].concepts[conceptIndex].collectionHandle = assignments[index].collectionHandle;
                                //find recent concept
                                if ((recentConcept.lastAccessTime < assignments[index].concepts[conceptIndex].lastAccessTime) && (assignments[index].concepts[conceptIndex].status === 'completed')) {
                                    recentConcept = assignments[index].concepts[conceptIndex];
                                    recentConcept.index = conceptIndex;
                                    recentConcept.collectionHandle = recentConcept.collectionHandle || assignments[index].collectionHandle;
                                }
                                template1 = conceptTemplate.replace(/@@conceptName@@/g, escapeHTML(
                                    assignments[index].concepts[conceptIndex].conceptCollectionTitle || assignments[index].concepts[conceptIndex].name || ''
                                ));
                                if (assignments[index].concepts[conceptIndex].conceptCollectionHandle) {
                                    template1 = template1.replace(/@@collectionCreatorID@@/g, assignments[index].concepts[conceptIndex].collectionCreatorID);
                                    template1 = template1.replace(/@@conceptCollectionHandle@@/g, assignments[index].concepts[conceptIndex].conceptCollectionHandle);
                                    template1 = template1.replace(/@@collectionHandle@@/g, assignments[index].collectionHandle);
                                    if (!currentCollectionHandle) {
                                        currentCollectionHandle = assignments[index].collectionHandle;
                                        currentCollectionCreatorID = assignments[index].collectionCreatorID;
                                    }
                                } else {
                                    template1 = template1.replace(/@@collectionHandle@@/g, '');
                                    template1 = template1.replace(/@@conceptCollectionHandle@@/g, '');
                                    template1 = template1.replace(/@@collectionCreatorID@@/g, '');
                                }
                                // Add actualScore which can represent score above 100%
                                assignments[index].concepts[conceptIndex].actualScore = '';
                                if (assignments[index].concepts[conceptIndex].score !== undefined && assignments[index].concepts[conceptIndex].score !== null) {
                                    assignments[index].concepts[conceptIndex].actualScore = assignments[index].concepts[conceptIndex].score.toString();
                                }
                                if (assignments[index].concepts[conceptIndex].score || assignments[index].concepts[conceptIndex].score === 0) {
                                    template1 = template1.replace(/@@percentage@@/g, assignments[index].concepts[conceptIndex].actualScore + '%');
                                    template1 = template1.replace(/@@hideScore@@/g, '');
                                    template1 = template1.replace(/@@hideComplete@@/g, 'hide-important');
                                    template1 = template1.replace(/@@hideRadioButton@@/g, '');
                                } else {
                                    template1 = template1.replace(/@@hideScore@@/g, 'hide-important');
                                    if (assignments[index].concepts[conceptIndex].status === 'completed') {
                                        template1 = template1.replace(/@@hideComplete@@/g, '');
                                        template1 = template1.replace(/@@hideRadioButton@@/g, '');
                                    } else {
                                        template1 = template1.replace(/@@hideComplete@@/g, 'hide-important');
                                        template1 = template1.replace(/@@hideRadioButton@@/g, 'hide-important');
                                    }
                                }
                                if (assignments[index].concepts[conceptIndex].contextUrl){
                                    template1 = template1.replace(/@@data-contextUrl@@/g,  assignments[index].concepts[conceptIndex].contextUrl ||  '');
                                    template1 = template1.replace(/@@mtype@@/g, assignments[index].concepts[conceptIndex].type || '');

                                    if(assignments[index].concepts[conceptIndex].domains){
                                        template1 = template1.replace(/@@encodedid@@/g,  (assignments[index].concepts[conceptIndex].domains[0] && assignments[index].concepts[conceptIndex].domains[0].encodedID)||  '');
                                        template = template.replace(/@@recentEncodedID@@/g, (assignments[index].concepts[conceptIndex].domains[0] && assignments[index].concepts[conceptIndex].domains[0].encodedID)|| '');
                                    }
                                }else{
                                    template1 = template1.replace(/@@data-contextUrl@@/g, '');
                                    template1 = template1.replace(/@@encodedid@@/g, assignments[index].concepts[conceptIndex].conceptEncodedID || '');
                                    template1 = template1.replace(/@@mtype@@/g, assignments[index].concepts[conceptIndex].type || '');

                                }
                                template1 = template1.replace(/@@encodedid@@/g, assignments[index].concepts[conceptIndex].conceptEncodedID || '');
                                template1 = template1.replace(/@@assignmentid@@/g, index);
                                template1 = template1.replace(/@@handle@@/g, assignments[index].concepts[conceptIndex].conceptHandle);
                                htmlString1 += template1;
                            }
                            completedCount = parseInt(assignments[index].completedCount, 10);
                            incompleteCount = parseInt(assignments[index].incompleteCount, 10);
                            total = completedCount + incompleteCount;

                            template = template.replace(/@@conceptList@@/g, htmlString1);
                            assignments[index].recentConcept = recentConcept;
                            assignments[index].recentConcept.color = '#FFFFFF';
                            if (recentConcept.lastAccessTime) {
                                //find next concept
                                for (i = ((recentConcept.index + 1) % conceptsLength); i > -5; i++) {
                                    if (assignments[index].concepts[i].status === 'incomplete') {
                                        nextConcept = assignments[index].concepts[i];
                                        nextConcept.collectionHandle = nextConcept.collectionHandle || assignments[index].collectionHandle;
                                        break;
                                    }
                                    if (i === recentConcept.index) {
                                        break;
                                    }
                                    if (i === (conceptsLength - 1)) {
                                        i = -1;
                                    }
                                }

                                template = template.replace(/@@hideStart@@/g, 'hide');
                                template = template.replace(/@@recentConceptName@@/g, escapeHTML(
                                    recentConcept.conceptCollectionTitle || recentConcept.name || ''
                                ));
                                template = template.replace(/@@recentEncodedID@@/g, recentConcept.conceptEncodedID || '');
                                template = template.replace(/@@recentHandle@@/g, recentConcept.conceptHandle);
                                if (recentConcept.conceptCollectionHandle) {
                                    template = template.replace(/@@recentCollectionCreatorID@@/g, recentConcept.collectionCreatorID);
                                    template = template.replace(/@@recentConceptCollectionHandle@@/g, recentConcept.conceptCollectionHandle);
                                    template = template.replace(/@@recentCollectionHandle@@/g, recentConcept.collectionHandle);
                                } else {
                                    template = template.replace(/@@recentCollectionCreatorID@@/g, '');
                                    template = template.replace(/@@recentConceptCollectionHandle@@/g, '');
                                    template = template.replace(/@@recentCollectionHandle@@/g, '');
                                }
                                if (recentConcept.score !== '' && recentConcept.score !== null) {
                                    template = template.replace(/@@hidden@@/g, '');
                                    template = template.replace(/@@hideDone@@/g, 'hide');
                                    template = template.replace(/@@lastScore@@/g, recentConcept.actualScore + '%');
                                } else {
                                    template = template.replace(/@@hideDone@@/g, 'DONE');
                                    if (recentConcept.status === 'completed') {
                                        template = template.replace(/@@hidden@@/g, '');
                                        template = template.replace(/@@hideLastScore@@/g, 'hide');
                                    } else {
                                        template = template.replace(/@@hidden@@/g, 'hide');
                                    }
                                }

                                template = template.replace(/@@nextConceptName@@/g, escapeHTML(
                                    nextConcept.conceptCollectionTitle || nextConcept.name || ''
                                ));
                                template = template.replace(/@@nextEncodedID@@/g, nextConcept.conceptEncodedID || '');
                                template = template.replace(/@@nextHandle@@/g, nextConcept.conceptHandle);
                                if (nextConcept.conceptCollectionHandle) {
                                    template = template.replace(/@@nextCollectionCreatorID@@/g, nextConcept.collectionCreatorID);
                                    template = template.replace(/@@nextConceptCollectionHandle@@/g, nextConcept.conceptCollectionHandle);
                                    template = template.replace(/@@nextCollectionHandle@@/g, nextConcept.collectionHandle);
                                } else {
                                    template = template.replace(/@@nextCollectionCreatorID@@/g, '');
                                    template = template.replace(/@@nextConceptCollectionHandle@@/g, '');
                                    template = template.replace(/@@nextCollectionHandle@@/g, '');
                                }
                            } else {
                                template = template.replace(/@@hidden@@/g, 'hidden');
                                template = template.replace(/@@hideDone@@/g, 'hide');
                                template = template.replace(/@@hideStart@@/g, '');
                                if (assignments[index].concepts[0]) {
                                    template = template.replace(/@@recentConceptName@@/g, escapeHTML(
                                        assignments[index].concepts[0].conceptCollectionTitle || assignments[index].concepts[0].name || ''
                                    ));
                                    template = template.replace(/@@recentEncodedID@@/g, assignments[index].concepts[0].conceptEncodedID || '');
                                    template = template.replace(/@@recentHandle@@/g, assignments[index].concepts[0].conceptHandle);
                                    if (assignments[index].concepts[0].conceptCollectionHandle) {
                                        template = template.replace(/@@recentCollectionCreatorID@@/g, assignments[index].concepts[0].collectionCreatorID);
                                        template = template.replace(/@@recentConceptCollectionHandle@@/g, assignments[index].concepts[0].conceptCollectionHandle);
                                        template = template.replace(/@@recentCollectionHandle@@/g, assignments[index].concepts[0].collectionHandle);
                                    } else {
                                        template = template.replace(/@@recentCollectionCreatorID@@/g, '');
                                        template = template.replace(/@@recentConceptCollectionHandle@@/g, '');
                                        template = template.replace(/@@recentCollectionHandle@@/g, '');
                                    }
                                } else {
                                    template = template.replace(/@@recentConceptName@@/g, '');
                                    template = template.replace(/@@recentEncodedID@@/g, '');
                                    template = template.replace(/@@recentHandle@@/g, '');
                                    template = template.replace(/@@hidePrevConcept@@/g, 'hide');
                                    template = template.replace(/@@recentConceptCollectionHandle@@/g, '');
                                    template = template.replace(/@@recentCollectionHandle@@/g, '');
                                    template = template.replace(/@@recentCollectionCreatorID@@/g, '');
                                }

                                if (assignments[index].concepts[1]) {
                                    template = template.replace(/@@nextConceptName@@/g, escapeHTML(
                                        assignments[index].concepts[1].conceptCollectionTitle || assignments[index].concepts[1].name || ''
                                    ));
                                    template = template.replace(/@@nextEncodedID@@/g, assignments[index].concepts[1].conceptEncodedID || '');
                                    template = template.replace(/@@nextHandle@@/g, assignments[index].concepts[1].conceptHandle);
                                    if (assignments[index].concepts[1].conceptCollectionHandle) {
                                        template = template.replace(/@@nextCollectionCreatorID@@/g, assignments[index].concepts[1].collectionCreatorID);
                                        template = template.replace(/@@nextConceptCollectionHandle@@/g, assignments[index].concepts[1].conceptCollectionHandle);
                                        template = template.replace(/@@nextCollectionHandle@@/g, assignments[index].concepts[1].collectionHandle);
                                    } else {
                                        template = template.replace(/@@nextCollectionCreatorID@@/g, '');
                                        template = template.replace(/@@nextConceptCollectionHandle@@/g, '');
                                        template = template.replace(/@@nextCollectionHandle@@/g, '');
                                    }
                                } else {
                                    template = template.replace(/@@nextConceptName@@/g, '');
                                    template = template.replace(/@@nextEncodedID@@/g, '');
                                    template = template.replace(/@@nextHandle@@/g, '');
                                    template = template.replace(/@@hideNextConcept@@/g, 'hide');
                                    template = template.replace(/@@nextCollectionCreatorID@@/g, '');
                                    template = template.replace(/@@nextConceptCollectionHandle@@/g, '');
                                    template = template.replace(/@@nextCollectionHandle@@/g, '');
                                }
                            }

                            template = template.replace(/@@completed@@/g, completedCount);
                            template = template.replace(/@@total@@/g, total);
                            if (completedCount === total) {
                                template = template.replace(/@@hideComplete@@/g, '');
                                template = template.replace(/@@hideNext@@/g, 'hide');
                                template = template.replace(/@@completedTrack@@/g, 'js-completed-track-item');
                            } else {
                                template = template.replace(/@@hideComplete@@/g, 'hide');
                                template = template.replace(/@@hideNext@@/g, '');
                                template = template.replace(/@@completedTrack@@/g, '');
                            }

                            if (completedCount === 0) {
                                template = template.replace(/@@graphClass@@/g, 'zero-complete');
                                assignments[index].backgroundColor = '#A5E5D8';
                                assignments[index].color = '#4DCCC4';
                            } else if (completedCount > incompleteCount) {
                                template = template.replace(/@@graphClass@@/g, 'full-complete');
                                assignments[index].backgroundColor = '#019690';
                                assignments[index].color = '#4DCCC4';
                            } else {
                                template = template.replace(/@@graphClass@@/g, 'half-complete');
                                assignments[index].backgroundColor = '#4DCCC4';
                                assignments[index].color = '#00ABA4';
                            }

                            // code for list view starts
                            if (loadSubjects) {
                                template2 = listviewTemplate.replace(/@@assignmentName@@/g, escapeHTML(assignments[index].title || ''));
                                template2 = template2.replace(/@@percentage@@/g, parseInt((completedCount / total) * 100, 10));
                                template2 = template2.replace(/@@completed@@/g, completedCount);
                                template2 = template2.replace(/@@total@@/g, total);
                                template2 = template2.replace(/@@conceptList@@/g, htmlString1);
                                if (completedCount === total) {
                                    template2 = template2.replace(/@@completedTrack@@/g, 'js-completed-track-item');
                                } else {
                                    template2 = template2.replace(/@@completedTrack@@/g, '');
                                }
                            }
                            // code for list view ends
                            htmlString += template;
                            listHtmlString += template2;
                        }

                        container.html(htmlString).addClass('loaded');
                        $('#selfStudyContainer').addClass('loaded');
                        if (loadSubjects) {
                            $('.js-subject-progress-container').find('input').val(parseInt((assignmentCompletedCount / assignmentTotal * 100), 10));
                            $('.js-subject-progress-container').removeClass('hide-important');
                            $('.js-subject-progress-count').find('.progress-completed').text(assignmentCompletedCount);
                            $('.js-subject-progress-count').find('.progress-total').text('/' + assignmentTotal);
                            $('#tracksListContainer').find('li.track-item').remove();
                            $('#tracksListContainer').append(listHtmlString).addClass('loaded');
                            $('.knob').knob({
                                'displayInput': false,
                                'readOnly': true,
                                'thickness': 1,
                                'fgColor': '#00ABA4',
                                'height': 21,
                                'width': 21
                            });
                        }
                        $('#allSubjectsProgressLink').removeClass('hide');

                        for (i = 0; i < assignments.length; i++) {
                            assignment = assignments[i];
                            dynamicId = container.attr('id') + i;
                            $('#' + dynamicId).find('.barGraphs').graph({
                                items: assignment
                            });
                        }
                        if (window.innerWidth > 767) {
                            $('#selfStudyContainer .dashboard-widget').addClass('large-view');
                        }
                        bindEventsForSelfStudy(container);
                        initCoversheetBinding();
                        if (callback) {
                            callback();
                        }
                    });
                }
            }
        }

        function renderSubjectTracks(tracks, subjectList) {
            renderSelfStudyTracks(tracks, true, function () {
                if (subjectList) {
                    renderSubjectDropDown(subjectList);
                }
                postRenderSubjectTracks();
            });
        }

        function bindEventsForGroupActivity() {

            $('.js-share-link').off('click.groups').on('click.groups', function () {
                var groupID = $(this).parents('.dashboard-widget')[0].id;
                location.href = '/group-resources/' + groupID;
            });

            $('.js-assign-link').off('click.groups').on('click.groups', function () {
                var groupID = $(this).parents('.dashboard-widget')[0].id;
                location.href = '/group-assignments/' + groupID;
            });

            $('.js-group-link').off('click.groups').on('click.groups', function () {
                var $dashboardWidget = $(this).parents('.dashboard-widget'),
                    groupID = $dashboardWidget[0].id;
                if ($dashboardWidget.data('enable-qa') === false || $(this).parent().siblings().find('span.members-count').text() === '1') {
                    location.href = '/group/' + groupID;
                } else {
                    location.href = '/group-discussions/' + groupID;
                }
            });

            $('.js-create-group-wrapper').off('click.groups').on('click.groups', function () {
                location.href = '/my/groups/';
            });

            $('.js-group-members').off('click.groups').on('click.groups', function () {
                var groupID = $(this).parents('.dashboard-widget')[0].id;
                location.href = '/group-members/' + groupID;
            });
        }

        function renderGroupDetails(details, currentTime) {
            var groupActivity, activity, groupIndex, index, template, k,
                htmlString = '',
                activityHTMLString = '',
                activityHTML = '',
                activityType = '',
                currentActivityType = '',
                parsedTitle, discussionOwner, activityOwner, discussionTitle, discussionHTML, dHTMLLength, discussionSplit,
                discussionOwnerID, imgCount, singleImage, tempDate;
            updateHash('groupActivity');
            groupActivity = details.response.groups;
            if (!$('#groupActivityContainer').hasClass('loaded')) {
                if (details === '') {
                    require(['text!dashboard/templates/dashboard.group.activity.zero.state.html'], function (groupZerostateTemplate) {
                        $('#groupActivityContainer').append(groupZerostateTemplate).addClass('loaded');
                        $('#groupActivityContainer').parent().addClass('groupactivity-zerostate');
                    });
                } else {
                    require(['text!dashboard/templates/dashboard.student.group.activity.html',
                    'text!dashboard/templates/dashboard.student.group.join.html',
                    'text!dashboard/templates/dashboard.activity.join.html',
                    'text!dashboard/templates/dashboard.activity.share.html',
                    'text!dashboard/templates/dashboard.activity.assign.html',
                    'text!dashboard/templates/dashboard.student.group.class.html',
                    'text!dashboard/templates/dashboard.student.group.study.html',
                    'text!dashboard/templates/dashboard.activity.discussion.html'
                ], function (activityTemplate, joinGroupTemplate, joinTemplate, shareTemplate, assignTemplate, classGroupTemplate, studyGroupTemplate, discussionTemplate) {
                        for (groupIndex = 0; groupIndex < groupActivity.length; groupIndex++) {
                            activityHTMLString = '';
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
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, escapeHTML(activity[index].owner.name || ''));
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, activity[index].owner.authID || '');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                                        }
                                    } else if ('assign' === currentActivityType || 'unassign' === currentActivityType || 'change-due-date' === currentActivityType || 'assignment-delete' === currentActivityType || 'assignment-edit' === currentActivityType) {
                                        activityHTML = assignTemplate;
                                        if ('change-due-date' === currentActivityType) {
                                            activityHTML = activityHTML.replace(/@@changedue@@/g, '@@dueDate@@');
                                            activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentLink dueDateChange');
                                            activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@due@@/g, 'dueDateGroup');
                                            activityType = 'changed';
                                            activityHTML = activityHTML.replace(/@@hide@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                            if (activity[index].activityData.name && activity[index].activityData.due) {
                                                activityHTML = activityHTML.replace(/@@assignTitle@@/g, escapeHTML(activity[index].activityData.name || ''));
                                            } else {
                                                activityHTML = activityHTML.replace(/@@assignTitle@@/g, escapeHTML(activity[index].activityData.name || '') + ' due date removed');
                                            }
                                        } else {
                                            activityHTML = activityHTML.replace(/@@hide@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@changedue@@/g, '');
                                            activityHTML = activityHTML.replace(/@@due@@/g, 'hide-important');
                                            activityHTML = activityHTML.replace(/@@assignTitle@@/g, escapeHTML(activity[index].activityData.name || ''));
                                            if ('assignment-delete' === currentActivityType) {
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentNoLink');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'assignmentDelete');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                                activityType = 'deleted';
                                            } else if ('unassign' === currentActivityType) {
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentNoLink');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                                activityType = 'removed';
                                            } else if ('assignment-edit' === currentActivityType) {
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentLink');
                                                activityHTML = activityHTML.replace(/@@activityPrevTitle@@/g, escapeHTML(activity[index].activityData['orig-name'] || '') + ' ');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                                if (activity[index].activityData['orig-name'] !== undefined) {
                                                    activityHTML = activityHTML.replace(/@@activityPrevTitle@@/g, escapeHTML(activity[index].activityData['orig-name'] || '') + ' ');
                                                    activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'previousTitleGroup');
                                                    activityHTML = activityHTML.replace(/@@changedTo@@/g, '');
                                                } else {
                                                    activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                    activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                                }
                                                activityType = 'updated @@isNameUpdate@@';
                                            } else {
                                                activityHTML = activityHTML.replace(/@@assignmentLink@@/g, 'assignmentLink');
                                                activityHTML = activityHTML.replace(/@@previousTitleGroup@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@assignmentDelete@@/g, 'hide-important');
                                                activityHTML = activityHTML.replace(/@@hideForDelete@@/g, '');
                                                activityHTML = activityHTML.replace(/@@changedTo@@/g, 'hide-important');
                                                activityType = 'assigned';
                                            }
                                        }
                                        activityHTML = activityHTML.replace(/@@activityType@@/g, activityType);
                                        if (activity[index].activityData) {
                                            if (activity[index].activityData.due && activity[index].activityData.due != 'none') {
                                                tempDate = (activity[index].activityData.due || '').replace(/\-/g, '/');
                                                tempDate = new Date(tempDate);
                                                tempDate = tempDate.getMonth() || 0 === tempDate.getMonth() ? (tempDate.getMonth() + 1) + '/' + tempDate.getDate() + '/' + (tempDate.getYear() + 1900) : '';
                                                activityHTML = activityHTML.replace(/@@dueDate@@/g, ' due date changed to ' + tempDate);
                                                activityHTML = activityHTML.replace(/@@dueDateTo@@/g, ' due date to ' + tempDate);
                                            } else {
                                                activityHTML = activityHTML.replace(/@@dueDate@@/g, ' due date removed');
                                                activityHTML = activityHTML.replace(/@@dueDateTo@@/g, '');
                                            }
                                            if (activity[index].activityData.hasOwnProperty('concepts-added') || activity[index].activityData.hasOwnProperty('concepts-removed')) {
                                                activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, '');
                                            } else {
                                                activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, 'name');
                                            }
                                        } else {
                                            activityHTML = activityHTML.replace(/@@isNameUpdate@@/g, '');
                                            activityHTML = activityHTML.replace(/@@dueDate@@/g, '');
                                        }
                                        if (activity[index].owner) {
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, escapeHTML(activity[index].owner.name || ''));
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, activity[index].owner.authID || '');
                                        } else {
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, '');
                                            activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, '');
                                        }
                                    } else if ('join' === currentActivityType || 'leave' === currentActivityType) {
                                        activityHTML = joinTemplate;
                                        if (activity[index].member) {
                                            activityHTML = activityHTML.replace(/@@activityOwner@@/g, escapeHTML(activity[index].member.name || ''));
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
                                        activityHTML = discussionTemplate;
                                        parsedTitle = '';
                                        discussionOwner = activity[index].owner;
                                        // Handle posts from anonymous users
                                        if (activity[index].hasOwnProperty('activityData') && !($.isEmptyObject(activity[index].activityData)) && activity[index].activityData.hasOwnProperty('post') && activity[index].activityData.post.isAnonymous === true) {
                                            activityOwner = 'Anonymous';
                                            discussionOwnerID = 'anonymous';
                                        } else {
                                            discussionOwnerID = discussionOwner.id;
                                            activityOwner = discussionOwner.name;
                                        }

                                        if (activity[index].hasOwnProperty('activityData') && !($.isEmptyObject(activity[index].activityData)) && activity[index].activityData.hasOwnProperty('post')) {
                                            discussionTitle = activity[index].activityData.post.content || '';
                                        } else {
                                            discussionTitle = 'Content is too long to display';
                                        }
                                        discussionHTML = $.parseHTML(discussionTitle);
                                        dHTMLLength = discussionHTML.length;
                                        discussionSplit = [];
                                        // pull out text content
                                        imgCount = 0;
                                        singleImage = null;
                                        var tagName = null;
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
                                        parsedTitle = parsedTitle.replace(/"/g, '\'');
                                        activityHTML = activityHTML.replace(/@@activityOwnerAuthID@@/g, discussionOwnerID);
                                        activityHTML = activityHTML.replace(/@@activityOwner@@/g, escapeHTML(activityOwner || ''));
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

                                    }

                                    activityHTML = activityHTML.replace(/@@activityTime@@/g,
                                        date.getTimeDifference(activity[index].creationTime || '', currentTime).big);
                                    activityHTML = activityHTML.replace(/@@activityTimeSmall@@/g,
                                            date.getTimeDifference(activity[index].creationTime || '', currentTime).small);
                                    activityHTMLString += activityHTML;
                                }
                            }
                            if (groupActivity[groupIndex].groupType === 'study') {
                                groupActivity[groupIndex].groupType = 'study group';
                            }

                            if (activity.length === 0) {
                                if (groupActivity[groupIndex].groupType === 'study group') {
                                    template = studyGroupTemplate;
                                } else {
                                    template = classGroupTemplate;
                                }
                            } else {
                                template = activityTemplate.replace(/@@activityStamp@@/g, activityHTMLString);
                            }
                            if (groupActivity[groupIndex].id) {
                                template = template.replace(/@@id@@/, groupActivity[groupIndex].id);
                            } else {
                                template = template.replace(/@@id@@/, '');
                            }
                            template = template.replace(/@@totalMembers@@/g, groupActivity[groupIndex].membersCount);
                            if (groupActivity[groupIndex].resource) {
                                template = template.replace(/@@imageSrc@@/g, groupActivity[groupIndex].resource.uri);
                            } else {
                                template = template.replace(/@@imageSrc@@/g, '');
                            }
                            template = template.replace(/@@groupName@@/g, escapeHTML(groupActivity[groupIndex].name || ''));
                            template = template.replace(/@@groupType@@/g, groupActivity[groupIndex].groupType);
                            if (groupActivity[groupIndex].creator) {
                                if (groupActivity[groupIndex].creator.authID === parseInt($('header').attr('data-user'), 10)) {
                                    template = template.replace(/@@hideOwn@@/g, '');
                                    template = template.replace(/@@hideOther@@/g, 'hide-important');
                                } else {
                                    template = template.replace(/@@hideOwn@@/g, 'hide-important');
                                    template = template.replace(/@@hideOther@@/g, '');
                                    template = template.replace(/@@ownerName@@/g, escapeHTML(groupActivity[groupIndex].creator.name || ''));
                                }
                            }
                            if (groupActivity[groupIndex].hasNewAssignment) {
                                template = template.replace(/@@hide@@/g, '');
                            } else {
                                template = template.replace(/@@hide@@/g, 'hide');
                            }
                            template = template.replace(/@@enableQA@@/g, groupActivity[groupIndex].enableQA);
                            htmlString += template;
                        }
                        if (groupActivity.length < 3) {
                            htmlString += joinGroupTemplate;
                        }
                        $('#groupActivityContainer').append(htmlString).addClass('loaded');
                        if (details.response.total > 3) {
                            $('#groupActivityContainer').append('<div class=\'see-all-groups\'><a href=\'/my/groups/\'>See all of your groups</a></div>');
                        }
                        $('.js-discussion-title').each(function () {
                            $(this).text('"' + this.title + '"');
                        });
                        bindEventsForGroupActivity();
                    });
                }
            }
        }

        function bindEventsForActiveDashboard() {
            $('#latestAssignmentsMobile').off('click.select').on('click.select', function () {
                $('.latest-assignment').trigger('click');
                $('.dashboard-tabs-mobile').removeClass('active');
                $(this).addClass('active');
            });
            $('#groupActivityMobile').off('click.select').on('click.select', function () {
                $('.group-activity').trigger('click');
                $('.dashboard-tabs-mobile').removeClass('active');
                $(this).addClass('active');
            });
            $('#selfStudyMobile').off('click.select').on('click.select', function () {
                $('.self-study').trigger('click');
                $('.dashboard-tabs-mobile').removeClass('active');
                $(this).addClass('active');
            });
            $('.latest-assignment').off('click.select').on('click.select', function () {
                var param, dueDateStart, dueDate;
                updateHash('latestAssignments');
                if (!$('#assignmentsContainer').hasClass('loaded')) {
                    dueDateStart = new Date();
                    dueDateStart.setMonth(dueDateStart.getMonth() - 1);
                    dueDate = (dueDateStart.getYear() + 1900).toString();
                    dueDate += (dueDateStart.getMonth() < 9) ? '0' + (dueDateStart.getMonth() + 1) : dueDateStart.getMonth() + 1;
                    dueDate += (dueDateStart.getDate() < 10) ? '0' + (dueDateStart.getDate()) : dueDateStart.getDate();
                    param = {
                        'filters': 'state,past-due-after-' + dueDate + ';state,upcoming',
                        'pageSize': 3
                    };
                    dashboardController.getAssignments(param);
                }
            });
            $('.group-activity').off('click.select').on('click.select', function () {
                updateHash('groupActivity');
                if (!$('#groupActivityContainer').hasClass('loaded')) {
                    var param = {
                        'activity': true,
                        'newAssignmentCheck': true,
                        'sort': 'd_latestGroupActivity',
                        'pageSize': 3
                    };
                    dashboardController.getGroupActivity(param);
                }
            });
            $('.self-study').off('click.select').on('click.select', function () {
                var param, selfStudy = true;
                updateHash('selfStudy');
                if (!$('#selfStudyContainer').hasClass('loaded')) {
                    if (dashboardStates['self-study-count'] > 0) {
                        if (!$('#latestTracks').hasClass('loaded')) {
                            param = {
                                'limit': 3,
                                'format': 'json'
                            };
                            dashboardController.getSelfStudyDetails(param);
                        }
                    } else {
                        selfStudyState = 'zero';
                        dashboardController.loadSubjects(selfStudy);
                    }
                }
            });
        }

        function displayActiveDashboard(state) {
            var param, dueDateStart, dueDate;
            if (state) {
                require(['text!dashboard/templates/dashboard.student.active.html'], function (activeTemplate) {
                    $('#dashboard_contentwrap').append(activeTemplate);


                    if (!(dashboardStates['group-count'] > 0)) {
                        $('#groupActivityContainer').parent().addClass('hide-important');
                        $('.section-container').addClass('no-group');
                        $('.active-dashboard-wrapper').addClass('no-group');
                    }
                    if (!(dashboardStates['assignment-count'] > 0)) {
                        $('#assignmentsContainer').parent().addClass('hide-important');
                        $('.section-container').addClass('no-assignment');
                        $('.active-dashboard-wrapper').addClass('no-assignment');
                    }


                    if (state === 'latestAssignments') {
                        dueDateStart = new Date();
                        dueDateStart.setMonth(dueDateStart.getMonth() - 1);
                        dueDate = (dueDateStart.getYear() + 1900).toString();
                        dueDate += (dueDateStart.getMonth() < 9) ? '0' + (dueDateStart.getMonth() + 1) : dueDateStart.getMonth() + 1;
                        dueDate += (dueDateStart.getDate() < 10) ? '0' + (dueDateStart.getDate()) : dueDateStart.getDate();
                        param = {
                            'filters': 'state,past-due-after-' + dueDate + ';state,upcoming',
                            'pageSize': 3
                        };
                        dashboardController.getAssignments(param);
                    } else if (state === 'groupActivity') {
                        param = {
                            'activity': true,
                            'newAssignmentCheck': true,
                            'sort': 'd_latestGroupActivity',
                            'pageSize': 3
                        };
                        dashboardController.getGroupActivity(param);
                        $('.active-tab-header').parent().removeClass('active');
                        $('#groupActivityContainer').parent().addClass('active');
                        $('.dashboard-tabs-mobile').removeClass('active');
                        $('#groupActivityMobile').addClass('active');
                    } else {
                        param = {
                            'limit': 3,
                            'format': 'json'
                        };
                        dashboardController.getSelfStudyDetails(param);
                        $('.active-tab-header').parent().removeClass('active');
                        $('#selfStudyContainer').parent().addClass('active');
                        $('.dashboard-tabs-mobile').removeClass('active');
                        $('#selfStudyMobile').addClass('active');
                    }
                    $('body').foundation('section', 'reflow');
                    bindEventsForActiveDashboard();
                });
            } else {
                dashboardController.loadSubjects();
            }
        }

        function handleRoleChange(event, userRole) {
            if (userRole.toLowerCase() !== $('#dashboard_contentwrap').attr('data-user-role').toLowerCase()) {
                $('#dashboard_contentwrap').attr('data-user-role', userRole);
                dashboardController.loadSubjects();
            }
        }

        function bindEventsForDashboard() {
            $(document).off('profile.builder.post.processing').on('profile.builder.post.processing', handleRoleChange);
        }

        function render(mathSubjects, scienceSubjects, englishSubjects) {
            var index, template,
                htmlString = '';
            require([
                'text!dashboard/templates/dashboard.student.inactive.html',
                'text!dashboard/templates/dashboard.teacher.inactive.html',
                'text!dashboard/templates/dashboard.student.inactive.subject.html'
            ], function (studentZeroSateTemplate, teacherZeroSateTemplate, subjectTemplate) {
                $('.dashboard-zerostate').remove();
                if ('teacher' === $('#dashboard_contentwrap').attr('data-user-role').toLowerCase()) {
                    $('#dashboard_contentwrap').append(teacherZeroSateTemplate);
                } else {
                    $('#dashboard_contentwrap').append(studentZeroSateTemplate);
                }
                for (index = 0; index < mathSubjects.length; index++) {
                    template = subjectTemplate.replace(/@@title@@/g, mathSubjects[index].name);
                    template = template.replace(/@@href@@/g, '/' + convertToSlug(mathSubjects[index].name));
                    template = template.replace(/@@encodedID@@/g, mathSubjects[index].subjectID + '.' + mathSubjects[index].shortname);
                    template = template.replace(/@@subjectHandle@@/g, convertToSlug(mathSubjects[index].name));
                    htmlString += template;
                }
                $('#mathSubjectsContainer').append(htmlString);
                htmlString = '';
                for (index = 0; index < scienceSubjects.length; index++) {
                    template = subjectTemplate.replace(/@@title@@/g, scienceSubjects[index].name);
                    template = template.replace(/@@href@@/g, '/' + convertToSlug(scienceSubjects[index].name));
                    template = template.replace(/@@encodedID@@/g, scienceSubjects[index].subjectID + '.' + scienceSubjects[index].shortname);
                    template = template.replace(/@@subjectHandle@@/g, convertToSlug(scienceSubjects[index].name));
                    htmlString += template;
                }
                $('#scienceSubjectsContainer').append(htmlString);
                htmlString = '';
                for (index = 0; index < englishSubjects.length; index++) {
                    template = subjectTemplate.replace(/@@title@@/g, englishSubjects[index].name);
                    template = template.replace(/@@href@@/g, '/' + convertToSlug(englishSubjects[index].name));
                    template = template.replace(/@@encodedID@@/g, englishSubjects[index].subjectID + '.' + englishSubjects[index].shortname);
                    template = template.replace(/@@subjectHandle@@/g, convertToSlug(englishSubjects[index].name));
                    htmlString += template;
                }
                $('#englishSubjectsContainer').append(htmlString);
            });
        }

        function loadDashboardBasedOnHash() {
            var selfStudy;
            if (dashboardActiveState) {
                if (location.hash === '#latestAssignments') {
                    if (dashboardStates['assignment-count'] > 0) {
                        displayActiveDashboard('latestAssignments');
                    } else if (dashboardStates['group-count'] > 0) {
                        displayActiveDashboard('groupActivity');
                    } else if (dashboardStates['self-study-count'] > 0) {
                        displayActiveDashboard('selfStudy');
                    } else {
                        dashboardController.loadSubjects();
                    }
                } else if (location.hash === '#groupActivity') {
                    if (dashboardStates['group-count'] > 0) {
                        displayActiveDashboard('groupActivity');
                    } else if (dashboardStates['assignment-count'] > 0) {
                        displayActiveDashboard('latestAssignments');
                    } else if (dashboardStates['self-study-count'] > 0) {
                        displayActiveDashboard('selfStudy');
                    } else {
                        dashboardController.loadSubjects();
                    }
                } else if (location.hash === '#selfStudy') {
                    if (dashboardStates['self-study-count'] > 0) {
                        displayActiveDashboard('selfStudy');
                    } else {
                        require(['text!dashboard/templates/dashboard.student.active.html'], function (activeTemplate) {
                            $('#dashboard_contentwrap').append(activeTemplate);
                            if (!(dashboardStates['group-count'] > 0)) {
                                $('#groupActivityContainer').parent().addClass('hide-important');
                                $('.section-container').addClass('no-group');
                                $('.active-dashboard-wrapper').addClass('no-group');
                            }
                            if (!(dashboardStates['assignment-count'] > 0)) {
                                $('#assignmentsContainer').parent().addClass('hide-important');
                                $('.section-container').addClass('no-assignment');
                                $('.active-dashboard-wrapper').addClass('no-assignment');
                            }
                            $('.active-tab-header').parent().removeClass('active');
                            $('#selfStudyContainer').parent().addClass('active');
                            $('.dashboard-tabs-mobile').removeClass('active');
                            $('#selfStudyMobile').addClass('active');
                            selfStudyState = 'zero';
                            selfStudy = true;
                            dashboardController.loadSubjects(selfStudy);
                            $('body').foundation('section', 'reflow');
                            bindEventsForActiveDashboard();
                        });
                    }
                }
            } else {
                dashboardController.loadSubjects();
            }
        }

        function renderDashboardState(dashboardState) {
            dashboardStates = dashboardState.response;
            if (dashboardStates['assignment-count'] > 0 || dashboardStates['group-count'] > 0 || dashboardStates['self-study-count'] > 0) {
                dashboardActiveState = true;
                if ($.cookie('flxDashboardState')) {
                    location.hash = $.cookie('flxDashboardState');
                }
                if (location.hash === '#latestAssignments' || location.hash === '#groupActivity' || location.hash === '#selfStudy') {
                    loadDashboardBasedOnHash();
                } else {
                    if (dashboardStates['assignment-count'] > 0) {
                        displayActiveDashboard('latestAssignments');
                    } else if (dashboardStates['group-count'] > 0) {
                        displayActiveDashboard('groupActivity');
                    } else if (dashboardStates['self-study-count'] > 0) {
                        displayActiveDashboard('selfStudy');
                    } else {
                        dashboardController.loadSubjects();
                    }
                }
            } else {
                dashboardActiveState = false;
                dashboardController.loadSubjects();
            }
            bindEventsForDashboard();
        }

        this.renderDashboardState = renderDashboardState;
        this.render = render;
        this.renderAssignments = renderAssignments;
        this.renderGroupDetails = renderGroupDetails;
        this.renderSelfStudyTracks = renderSelfStudyTracks;
        this.renderSubjectTracks = renderSubjectTracks;
        this.renderInactiveSelfStudy = renderInactiveSelfStudy;
        this.loadDashboardBasedOnHash = loadDashboardBasedOnHash;
        this.emailSent = emailSent;
    }

    return dashboardView;
});
