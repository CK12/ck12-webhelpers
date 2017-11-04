define(['jquery', 'common/utils/concept_coversheet', 'common/utils/utils', 'jq/jquery-knob/jquery.knob', 'graphTool/graph-tool', 'hammer'], function ($, coverSheet, util) {
    'use strict';

    var groupAssignmentsController;
    require(['groups/controllers/group.assignments'], function (controller) {
        groupAssignmentsController = controller;
    });

    function groupAssignmentsNonZeroStateView() {

        var groupID, scrollPage, sort, dateRefined;

        function escapeHTML(string) {
            string = string.toString();
            return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function postConceptComplete() {
            $('.js-unassign').addClass('js-disabled');
            $('.js-assign').addClass('js-disabled');
            location.reload();
        }

        function parseDate(dueDate) {
            if (!dueDate) {
                return '';
            }
            if (!(new Date(dueDate).getTime())) {
                dueDate = dueDate.replace(/\-/g, '/');
            }
            dueDate = new Date(dueDate);
            dateRefined = parseInt(dueDate.getMonth(), 10) + 1 < 10 ? '0' + parseInt(dueDate.getMonth() + 1, 10) : parseInt(dueDate.getMonth() + 1, 10);
            dateRefined = parseInt(dueDate.getDate(), 10) < 10 ? dateRefined + '/0' + dueDate.getDate() : dateRefined + '/' + dueDate.getDate();
            dateRefined = dateRefined + '/' + (dueDate.getYear() + 1900);
            //dueDate = dueDate.getMonth() || 0 === dueDate.getMonth() ? (dueDate.getMonth() + 1) + '/' + dueDate.getDate() + '/' + (dueDate.getYear() + 1900) : '';
            return dateRefined;
        }

        function getDate(date) {
            if (!date) {
                return '';
            }
            var temp;
            date = date.split('/');
            temp = parseInt(date[2], 10);
            if (2000 > temp) {
                temp += 2000;
            }
            date[2] = date[0];
            date[0] = temp;
            temp = date[2];
            date[2] = date[1];
            date[1] = temp;
            date = date.join('-');
            return date;
        }

        function checkFutureDate(checkDate){
    		var maxDate = new Date(),
			date = new Date(checkDate);

			maxDate.setHours(0,0,0,0);

			maxDate.setFullYear(maxDate.getFullYear() + 2);
			if(date <= maxDate){
				return true;
			}
			return false;

        }

        function isBeforeDate(checkDate) {
            checkDate = checkDate.split('/');
            checkDate = checkDate.join('/');
            checkDate = new Date(checkDate);
            if ((new Date() - checkDate) > (86400 * 1000)) {
                return true;
            }
            return false;
        }

        function isValidDate(checkDate) {
            if (!new Date(checkDate).getYear()) {
                return false;
            }
            checkDate = checkDate.split('/');
            if (3 !== checkDate.length) {
                return false;
            }
            if (12 < parseInt(checkDate[0], 10) || 2 < checkDate[0].length) {
                return false;
            }
            if (31 < parseInt(checkDate[1], 10) || 2 < checkDate[1].length) {
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
        }

        function bindEventsForDetailView() {
            $('#group-assignment-container').add('#complete-assignment-container').find('.swiped-bottom-button').off('click.next').on('click.next', function () {
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
                            $this.removeClass('active');
                            $spindle.removeClass('spindle-bottom-present');
                        }
                    }
                }
            });

            $('#group-assignment-container').add('#complete-assignment-container').find('.swiped-top-button').off('click.next').on('click.next', function () {
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
            $('.js-member-assignment').off('click.detail').on('click.detail', function () {
                var arrow = $(this);
                if (!$(arrow).hasClass('member-assignment-arrow-icon')) {
                    arrow = $(this).parent().find('.member-assignment-arrow-icon');
                }
                if ($(arrow).hasClass('icon-arrow_down')) {
                    $(arrow).removeClass('icon-arrow_down member-assignment-arrow-icon');
                    $(arrow).addClass('icon-arrow_right member-assignment-arrow-icon');
                } else {
                    $(arrow).removeClass('icon-arrow_right member-assignment-arrow-icon');
                    $(arrow).addClass('icon-arrow_down member-assignment-arrow-icon');
                }
                var $detail = $(this).next();
                $detail.toggleClass('hide').find('.recent-arrow, .widget-instructions').each(function () {
                	var $this = $(this),
                		margin;
                	if ($this.hasClass('recent-arrow')) {
                		margin = ($this.parent().width() - $this.outerWidth()) / 2;
                		$this.css('margin-left', margin);
                	} else if ($this.hasClass('widget-instructions') && !$this.hasClass('hide') && window.BrowserDetect.browser === 'Firefox' && parseInt($this.css('height')) > 88) {
                		$this.css('height','90px').find('> span').addClass('line-eclipse');
                	}
                });
                if (window.innerWidth < 768) {
                    if (!$detail.hasClass('hide')) {
                        $detail.find('.expand-view-button').addClass('mobile');
                        $detail.find('.expand-open').removeClass('hide-important');
                        $detail.find('.expand-close').addClass('hide-important');
                        $detail.find('.dashboard-widget').removeClass('widget-expand-active');
                        $detail.addClass('widget-container-open');
                    } else {
                        $detail.find('.expand-view-button').removeClass('mobile');
                        $detail.find('.expand-open').addClass('hide-important');
                        $detail.find('.expand-close').removeClass('hide-important');
                        $detail.find('.dashboard-widget').removeClass('widget-expand-active');
                        $detail.removeClass('widget-container-open');
                    }
                } else {
                    $detail.toggleClass('widget-container-open');
                }
            });
            $('.js-detail-close').off('click.detail').on('click.detail', function () {
                var $this = $(this);
                if (window.innerWidth < 768) {
                    $this.find('span').toggleClass('hide-important');
                    $this.toggleClass('mobile');
                    $this.parents('.dashboard-widget').toggleClass('widget-expand-active');
                } else {
                    $this.parents('.js-detail-view').toggleClass('hide');
                    $this.parents('.js-detail-view').removeClass('widget-container-open');
                    $this.find('.expand-open').addClass('hide-important');
                    $this.find('.expand-close').removeClass('hide-important');
                }
            });

            $('#group-assignment-container').add('#complete-assignment-container').find('.dashboard-widget').each(function () {
                Hammer('#' + this.id).off('dragleft.memberWidget').on('dragleft.memberWidget', function () {
                    if (window.innerWidth < (768)) {
                        if ($(this).find('.expand-view-button').hasClass('mobile')) {
                            $(this).addClass('dragleft');
                        }
                    }
                });
                Hammer('#' + this.id).off('dragright.memberWidget').on('dragright.memberWidget', function () {
                    if (window.innerWidth < (768)) {
                        if (!$(this).find('.expand-view-button').hasClass('mobile')) {
                            $(this).addClass('dragright');
                        }
                    }
                });
                Hammer('#' + this.id).off('release.memberWidget').on('release.memberWidget', function () {
                    if (window.innerWidth < (768)) {
                        if ($(this).hasClass('dragleft') || $(this).hasClass('dragright')) {
                            $(this).find('.js-detail-close').trigger('click');
                        }
                        $(this).removeClass('dragleft dragright');
                    }
                });
            });

            $(window).off('resize.memberWidget').on('resize.memberWidget', function () {
                if (window.innerWidth > (767)) {
                    $('.widget-container-open .expand-close').removeClass('hide-important');
                    $('.widget-container-open .expand-open').addClass('hide-important');
                    $('.widget-container-open .expand-view-button').removeClass('mobile');
                    $('.dashboard-widget').removeClass('small-view');
                } else if (!$('.dashboard-widget').hasClass('small-view')) {
                    $('.widget-container-open .expand-close').addClass('hide-important');
                    $('.widget-container-open .expand-open').removeClass('hide-important');
                    $('.widget-container-open .expand-view-button').addClass('mobile');
                    $('.dashboard-widget').removeClass('widget-expand-active');
                    $('.dashboard-widget').addClass('small-view');
                }
            });
        }

        function initCoversheetBinding() {
            $('.concept').off('click.coverSheet').on('click.coverSheet', function () {
                var conceptTitle,
                    src,
                    handle = $(this).attr('data-handle'),
                    collectionHandle = $(this).attr('data-collection-handle') || '',
                    conceptCollectionAbsoluteHandle = $(this).attr('data-concept-collection-absolute-handle') || '',
                    conceptCollectionHandle = $(this).attr('data-concept-collection-handle') || '',
                    collectionCreatorID = $(this).attr('data-collection-creator-ID') || '',
                    encodedId,
                    assignmentId = $(this).attr('data-assignmentid'),
                    login = $(this).attr('data-login'),
                    mtype = $(this).attr('data-mtype'),
                    branch = $(this).attr('data-branch'),
                    contextUrl = $(this).attr('data-contextUrl'),
                    context = $(this).attr('data-contextName'),
                    completed = $(this).hasClass('plotContainer') ? ($(this).find('div.ploted').data('status')==='completed' ? 'completed' : '') : ($(this).siblings(':last').children().eq(1).is(':visible') ? 'completed' : '');

                if ($(this).hasClass('plotContainer')) {
                    conceptTitle = $(this).find('.plot').attr('data-conceptname');
                } else if ($(this).hasClass('start-block')) {
                    conceptTitle = $(this).siblings('.body-left-side').find('.widget-instructions').find('span').text();
                } else if ($(this).hasClass('recent-block') || $(this).hasClass('next-block')) {
                    conceptTitle = $(this).parent().siblings('.widget-instructions').find('span').text();
                } else {
                    conceptTitle = $.trim($(this).text());
                }
                encodedId = $(this).attr('data-encodedid');
                if (mtype === "assignFlow" || mtype === "asmtquiz" || mtype === "asmtpractice") {
                    coverSheet.init({
                        'handle': handle,
                        'collectionHandle': collectionHandle,
                        'conceptCollectionAbsoluteHandle': conceptCollectionAbsoluteHandle,
                        'conceptCollectionHandle': conceptCollectionHandle,
                        'collectionCreatorID': collectionCreatorID,
                        'encodedId': encodedId,
                        'assignmentId': assignmentId,
                        'conceptTitle': conceptTitle,
                        'mtype': mtype,
                        'login': login,
                        'completed': completed,
                        'callback': postConceptComplete
                    });
                    $('#group-assignments').addClass('hide');
                } else if (mtype === 'simulationint') {
                    var url = '/' + branch + '/' + context + '/' + mtype + '/' + handle;
                    window.open(url);
                } else {
                    window.open(contextUrl);
                }
            });
        }

        function renderDetailView(assignment, assignmentTemplate, conceptTemplate) {
            var template, conceptIndex, template1, total, completedCount, incompleteCount, conceptsLength, index, date,
                htmlString = '',
                htmlString1 = '',
                recentConcept = {},
                nextConcept = {};
            recentConcept.lastAccess = '';
            if (assignment.group) {

                template = assignmentTemplate.replace(/@@groupName@@/g, escapeHTML(assignment.group.name || ''));
                template = template.replace(/@@imageSrc@@/g, assignment.group.imageUri || '');
            }
            template = template.replace(/@@assignmentName@@/g, escapeHTML(assignment.name || ''));
            template = template.replace(/@@assignmentInstructions@@/g, escapeHTML(assignment.instructions || ''));
            template = template.replace(/@@id@@/g, 'assignment' + assignment.assignmentID);
            template = template.replace(/@@assignmentid@@/g, assignment.assignmentID || '');
            date = parseDate(assignment.due);
            template = template.replace(/@@dueDate@@/g, date || '');
            date = date ? '' : 'hide';
            template = template.replace(/@@isDueDate@@/g, date);
            conceptsLength = assignment.concepts.length;
            for (conceptIndex = 0; conceptIndex < conceptsLength; conceptIndex++) {
                //find recent concept
                if ((recentConcept.lastAccess < assignment.concepts[conceptIndex].lastAccess) && (assignment.concepts[conceptIndex].status === 'completed')) {
                    recentConcept = assignment.concepts[conceptIndex];
                    recentConcept.index = conceptIndex;
                }
                template1 = conceptTemplate.replace(/@@conceptName@@/g, escapeHTML(
                     assignment.concepts[conceptIndex].type === 'domain' ? (assignment.concepts[conceptIndex].conceptCollectionTitle ||
                    assignment.concepts[conceptIndex].name || '') : (assignment.concepts[conceptIndex].name || '')
                ));
                if (assignment.concepts[conceptIndex].score || 0 === assignment.concepts[conceptIndex].score) {
                    template1 = template1.replace(/@@percentage@@/g, assignment.concepts[conceptIndex].score + '%');
                    template1 = template1.replace(/@@hideScore@@/g, '');
                    template1 = template1.replace(/@@hideComplete@@/g, 'hide-important');
                    template1 = template1.replace(/@@hideRadioButton@@/g, '');
                    assignment.concepts[conceptIndex].actualScore = assignment.concepts[conceptIndex].score.toString();
                } else {
                    template1 = template1.replace(/@@hideScore@@/g, 'hide-important');
                    assignment.concepts[conceptIndex].actualScore = '';
                    if (assignment.concepts[conceptIndex].status === 'completed') {
                        template1 = template1.replace(/@@hideComplete@@/g, '');
                        template1 = template1.replace(/@@hideRadioButton@@/g, '');
                    } else {
                        template1 = template1.replace(/@@hideComplete@@/g, 'hide-important');
                        template1 = template1.replace(/@@hideRadioButton@@/g, 'hide-important');
                    }
                }
                if ('lesson' ===  assignment.concepts[conceptIndex].type || 'section' === assignment.concepts[conceptIndex].type) {
                  	template1 = template1.replace(/@@icon-name@@/g, 'read');
                  }else if('asmtpractice' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'exercise');
                  }else if('lecture' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'video');
                  }else if('enrichment' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'video');
                  }else if('rwa' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'rwa');
                  }else if('simulationint' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'simulations');
                  }else if('plix' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'interactive_practice');
                  }else if('asmtquiz' ===  assignment.concepts[conceptIndex].type  || 'quiz' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'quiz');
                  }else if('domain' ===  assignment.concepts[conceptIndex].type){
                  	template1 = template1.replace(/@@icon-name@@/g, 'lightbulb');
                  }
                if (assignment.concepts[conceptIndex].type === 'asmtquiz' || assignment.concepts[conceptIndex].type === 'quiz') {
                    template1 = template1.replace(/@@mtype@@/g, assignment.concepts[conceptIndex].type);
                }
                if (assignment.concepts[conceptIndex].contextUrl){
                	  template1 = template1.replace(/@@mtype@@/g, assignment.concepts[conceptIndex].type);
                	  template1 = template1.replace(/@@data-contextUrl@@/g,  assignment.concepts[conceptIndex].contextUrl);
                	  template1 = template1.replace(/@@login@@/g, assignment.concepts[conceptIndex].login || '');

                	  template = template.replace(/@@data-contextUrl@@/g,  assignment.concepts[conceptIndex].contextUrl);
                	  template = template.replace(/@@recentLogin@@/g, assignment.concepts[conceptIndex].login || '');
                	  if(assignment.concepts[conceptIndex].domains){
                		  template1 = template1.replace(/@@encodedid@@/g , (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].encodedID) ||  '');
                		  template1 = template1.replace(/@@branch@@/g,  (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].branchInfo.handle) || '');
                          template1 = template1.replace(/@@contextName@@/g,  (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].handle) || '');

                		  template = template.replace(/@@branch@@/g,  (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].branchInfo.handle) || '');
                          template = template.replace(/@@contextName@@/g,  (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].handle) || '');
                	  }

                		template = template.replace(/@@assign-class@@/, 'quick-assign');
                }else{
                	template1 = template1.replace(/@@data-contextUrl@@/g, '');
                	template = template.replace(/@@data-contextUrl@@/g, '');
                	 template1 = template1.replace(/@@mtype@@/g, 'assignFlow');
                     if (assignment.concepts[conceptIndex].domains) {
                         template1 = template1.replace(/@@encodedid@@/g, (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].encodedID) || '');
                         template1 = template1.replace(/@@branch@@/g, (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].branchInfo.handle) || '');
                         template1 = template1.replace(/@@contextName@@/g, (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].handle) || '');

                         template = template.replace(/@@branch@@/g, (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].branchInfo.handle) || '');
                         template = template.replace(/@@contextName@@/g, (assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].handle) || '');
                     }
                }
                template1 = template1.replace(/@@encodedid@@/g, assignment.concepts[conceptIndex].encodedID || (assignment.concepts[conceptIndex].domains && assignment.concepts[conceptIndex].domains[0] && assignment.concepts[conceptIndex].domains[0].encodedID) ||  '');
                template1 = template1.replace(/@@assignmentid@@/g, assignment.assignmentID || '');
                template1 = template1.replace(/@@handle@@/g, assignment.concepts[conceptIndex].handle || '');
                if ('asmtquiz' === assignment.concepts[conceptIndex].type) {
                    template1 = template1.replace(/@@login@@/g, assignment.concepts[conceptIndex].login || '');
                } else {
                    template1 = template1.replace(/@@login@@/g, '');
                }
                if (assignment.concepts[conceptIndex].collectionHandle && assignment.concepts[conceptIndex].conceptCollectionAbsoluteHandle) {
                    template1 = template1.replace(/@@collectionHandle@@/g, assignment.concepts[conceptIndex].collectionHandle.toLowerCase());
                    template1 = template1.replace(/@@conceptCollectionAbsoluteHandle@@/g, assignment.concepts[conceptIndex].conceptCollectionAbsoluteHandle);
                    template1 = template1.replace(/@@conceptCollectionHandle@@/g, assignment.concepts[conceptIndex].conceptCollectionHandle);
                    template1 = template1.replace(/@@collectionCreatorID@@/g, assignment.concepts[conceptIndex].collectionCreatorID || '');
                } else {
                    template1 = template1.replace(/@@collectionHandle@@/g, '');
                    template1 = template1.replace(/@@conceptCollectionAbsoluteHandle@@/g, '');
                    template1 = template1.replace(/@@conceptCollectionHandle@@/g, '');
                    template1 = template1.replace(/@@collectionCreatorID@@/g, '');
                }
                htmlString1 += template1;
            }

            completedCount = parseInt(assignment.completedCount, 10);
            incompleteCount = parseInt(assignment.incompleteCount, 10);
            total = completedCount + incompleteCount;

            // find next concept
            if (completedCount !== 0) {
                for (index = ((recentConcept.index + 1) % conceptsLength); index !== recentConcept.index; index++) {
                    if (assignment.concepts[index].status === 'incomplete') {
                        nextConcept = assignment.concepts[index];
                        break;
                    }
                    if (index === (conceptsLength - 1)) {
                        index = -1;
                    }
                }
            }

            template = template.replace(/@@conceptList@@/g, htmlString1);
            assignment.recentConcept = recentConcept;
            assignment.recentConcept.color = '#FFFFFF';
            if (recentConcept.lastAccess) {
                if ('asmtquiz' === recentConcept.type) {
                    template = template.replace(/@@recentquiz@@/g, '');
                } else {
                    template = template.replace(/@@recentquiz@@/g, ' hide');
                }
                template = template.replace(/@@hideStart@@/g, 'hide');
                template = template.replace(/@@recentConceptName@@/g, escapeHTML(
                    recentConcept.type === 'domain' ? (recentConcept.conceptCollectionTitle || recentConcept.name || '') : (recentConcept.name || '')
                ));
                if (recentConcept.domains) {
                    template = template.replace(/@@recentEncodedID@@/g , (recentConcept.domains[0] && recentConcept.domains[0].encodedID) || '');
                }
                if (recentConcept.contextUrl || recentConcept.type === 'asmtquiz' || recentConcept === 'quiz'){
                    template = template.replace(/@@mtype@@/g, recentConcept.type);
                } else {
                    template = template.replace(/@@mtype@@/g, 'assignFlow');
                }
                template = template.replace(/@@recentEncodedID@@/g, recentConcept.encodedID || '');
                template = template.replace(/@@recentLogin@@/g, recentConcept.login || '');
                template = template.replace(/@@recentHandle@@/g, recentConcept.handle || '');
                template = template.replace(/@@recentCollectionHandle@@/g, recentConcept.collectionHandle || '');
                template = template.replace(/@@recentConceptCollectionAbsoluteHandle@@/g, recentConcept.conceptCollectionAbsoluteHandle || '');
                template = template.replace(/@@recentConceptCollectionHandle@@/g, recentConcept.conceptCollectionHandle || '');
                template = template.replace(/@@recentCollectionCreatorID@@/g, recentConcept.collectionCreatorID || '');

                if (recentConcept.score !== '' && recentConcept.score !== null) {
                    template = template.replace(/@@hidden@@/g, '');
                    template = template.replace(/@@hideDone@@/g, 'hide');
                    template = template.replace(/@@lastScore@@/g, recentConcept.score + '%');
                } else {
                    template = template.replace(/@@hideDone@@/g, 'DONE');
                    template = template.replace(/@@hidden@@/g, 'hide');
                }

                if ('asmtquiz' === nextConcept.type) {
                    template = template.replace(/@@nextquiz@@/g, '');
                } else {
                    template = template.replace(/@@nextquiz@@/g, ' hide');
                }
                template = template.replace(/@@nextConceptName@@/g, escapeHTML(
                    nextConcept.type === 'domain' ? (nextConcept.conceptCollectionTitle || nextConcept.name || '') : (nextConcept.name || '')
                ));
                if (nextConcept.name) {
                    template = template.replace(/@@hideNextConceptWidget@@/g, '');
                } else {
                    template = template.replace(/@@hideNextConceptWidget@@/g, 'hide');
                }
                if (nextConcept.domains) {
                    template = template.replace(/@@nextEncodedID@@/g , (nextConcept.domains[0] && nextConcept.domains[0].encodedID) || '');
                }
                if (nextConcept.contextUrl || nextConcept.type === 'asmtquiz' || nextConcept === 'quiz'){
                    template = template.replace(/@@nextmtype@@/g, nextConcept.type);
                } else {
                    template = template.replace(/@@nextmtype@@/g, 'assignFlow');
                }
                template = template.replace(/@@nextEncodedID@@/g, nextConcept.encodedID || '');
                template = template.replace(/@@nextLogin@@/g, nextConcept.login || '');
                template = template.replace(/@@nextHandle@@/g, nextConcept.handle || '');
                template = template.replace(/@@nextCollectionHandle@@/g, nextConcept.collectionHandle || '');
                template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, nextConcept.conceptCollectionAbsoluteHandle || '');
                template = template.replace(/@@nextConceptCollectionHandle@@/g, nextConcept.conceptCollectionHandle || '');
                template = template.replace(/@@nextCollectionCreatorID@@/g, nextConcept.collectionCreatorID || '');
            } else {
                if ('asmtquiz' === assignment.concepts[0].type) {
                    template = template.replace(/@@recentquiz@@/g, '');
                } else {
                    template = template.replace(/@@recentquiz@@/g, ' hide');
                }
                template = template.replace(/@@hidden@@/g, 'hidden');
                template = template.replace(/@@hideDone@@/g, 'hide');
                template = template.replace(/@@hideStart@@/g, '');
                template = template.replace(/@@recentConceptName@@/g, escapeHTML(
                    assignment.concepts[0].type === 'domain' ? (assignment.concepts[0].conceptCollectionTitle || assignment.concepts[0].name || '') : (assignment.concepts[0].name || '')
                ));
                if (assignment.concepts[0].domains) {
                    template = template.replace(/@@recentEncodedID@@/g , (assignment.concepts[0].domains[0] && assignment.concepts[0].domains[0].encodedID) || '');
                }
                if (assignment.concepts[0].contextUrl || assignment.concepts[0].type === 'asmtquiz' || assignment.concepts[0].type === 'quiz'){
                    template = template.replace(/@@mtype@@/g, assignment.concepts[0].type);
                } else {
                    template = template.replace(/@@mtype@@/g, 'assignFlow');
                }
                template = template.replace(/@@recentEncodedID@@/g, assignment.concepts[0].encodedID || '');
                template = template.replace(/@@recentLogin@@/g, assignment.concepts[0].login || '');
                template = template.replace(/@@recentHandle@@/g, assignment.concepts[0].handle || '');
                template = template.replace(/@@recentCollectionHandle@@/g, assignment.concepts[0].collectionHandle || '');
                template = template.replace(/@@recentConceptCollectionAbsoluteHandle@@/g, assignment.concepts[0].conceptCollectionAbsoluteHandle || '')
                template = template.replace(/@@recentConceptCollectionHandle@@/g, assignment.concepts[0].conceptCollectionHandle || '')
                template = template.replace(/@@recentCollectionCreatorID@@/g, assignment.concepts[0].collectionCreatorID || '')

                if (assignment.concepts[1]) {
                    if ('asmtquiz' === assignment.concepts[1].type) {
                        template = template.replace(/@@nextquiz@@/g, '');
                    } else {
                        template = template.replace(/@@nextquiz@@/g, ' hide');
                    }
                    template = template.replace(/@@nextConceptName@@/g, escapeHTML(
                        assignment.concepts[1].type === 'domain' ? (assignment.concepts[1].conceptCollectionTitle || assignment.concepts[1].name || '') : (assignment.concepts[1].name || '')
                    ));
                    if (assignment.concepts[1].name) {
                        template = template.replace(/@@hideNextConceptWidget@@/g, '');
                    } else {
                        template = template.replace(/@@hideNextConceptWidget@@/g, 'hide');
                    }
                    if (assignment.concepts[1].domains) {
                        template = template.replace(/@@recentEncodedID@@/g , (assignment.concepts[1].domains[0] && assignment.concepts[1].domains[0].encodedID) || '');
                    }
                    if (assignment.concepts[1].contextUrl || assignment.concepts[1].type === 'asmtquiz' || assignment.concepts[1].type === 'quiz'){
                        template = template.replace(/@@nextmtype@@/g, assignment.concepts[1].type);
                    } else {
                        template = template.replace(/@@nextmtype@@/g, 'assignFlow');
                    }
                    template = template.replace(/@@nextEncodedID@@/g, assignment.concepts[1].encodedID || '');
                    template = template.replace(/@@nextLogin@@/g, assignment.concepts[1].login || '');
                    template = template.replace(/@@nextHandle@@/g, assignment.concepts[1].handle || '');
                    template = template.replace(/@@nextCollectionHandle@@/g, assignment.concepts[1].collectionHandle || '');
                    template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, assignment.concepts[1].conceptCollectionAbsoluteHandle || '');
                    template = template.replace(/@@nextConceptCollectionHandle@@/g, assignment.concepts[1].conceptCollectionHandle || '');
                    template = template.replace(/@@nextCollectionCreatorID@@/g, assignment.concepts[1].collectionCreatorID || '');
                } else {
                    template = template.replace(/@@nextquiz@@/g, ' hide');
                    template = template.replace(/@@nextConceptName@@/g, '');
                    template = template.replace(/@@hideNextConceptWidget@@/g, 'hide');
                    template = template.replace(/@@nextLogin@@/g, '');
                    template = template.replace(/@@nextEncodedID@@/g, '');
                    template = template.replace(/@@nextHandle@@/g, '');
                    template = template.replace(/@@nextCollectionHandle@@/g, '');
                    template = template.replace(/@@nextConceptCollectionAbsoluteHandle@@/g, '');
                    template = template.replace(/@@nextCollectionCreatorID@@/g, '');
                    template = template.replace(/@@nextConceptCollectionHandle@@/g, '');
                }
            }

            //template = template.replace(/@@graphHeader@@/g, completedCount + '/' + total + ' CONCEPTS COMPLETED');
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
                assignment.backgroundColor = '#A5E5D8';
                assignment.color = '#4DCCC4';
            } else if (completedCount > incompleteCount) {
                template = template.replace(/@@graphClass@@/g, 'full-complete');
                assignment.backgroundColor = '#019690';
                assignment.color = '#4DCCC4';
            } else {
                template = template.replace(/@@graphClass@@/g, 'half-complete');
                assignment.backgroundColor = '#4DCCC4';
                assignment.color = '#00ABA4';
            }

            htmlString += template;

            return {
                'html': htmlString,
                'recent': assignment
            };
        }

        function dueDateChanged() {
            var This, date, dueDateObject;
            This = $('.js-changed').children('input');
            dueDateObject = new Date(This.val());
            date = parseInt(dueDateObject.getMonth(), 10) + 1 < 10 ? '0' + parseInt(dueDateObject.getMonth() + 1, 10) : parseInt(dueDateObject.getMonth() + 1, 10);
            date = parseInt(dueDateObject.getDate(), 10) < 10 ? date + '/0' + dueDateObject.getDate() : date + '/' + dueDateObject.getDate();
            This.attr('value', This.val());
            This.parents('.assignment-list-container').find('.assignment-due-date span:first-child').text(This.val());
            This.parents('.assignment-list-container').find('.assignment-due-date span:last-child').text(date);
            This = $('.js-changed').siblings('.js-date-change');
            This.removeClass('hide');
            setTimeout(function () {
                This.addClass('hide');
            }, 10000);
        }

        function getDaysLate(concepts, due) {
            var index, conceptDate, submitDate;
            submitDate = concepts[0].lastAccess || '';
            submitDate = new Date(submitDate);
            for (index = 0; index < concepts.length; index++) {
                conceptDate = concepts[index].lastAccess || '';
                conceptDate = new Date(conceptDate);
                if (conceptDate - submitDate > 0) {
                    submitDate = conceptDate;
                }
            }
            submitDate = submitDate - due;
            submitDate = submitDate / (1000 * 3600 * 24);
            submitDate = Math.ceil(submitDate);
            return submitDate;
        }

        function actionComplete() {
            $('.js-unassign').addClass('js-disabled');
            $('.js-assign').addClass('js-disabled');
            //location.reload(); //53538
            window.location.href = window.location.href.split('?')[0];
        }

        function createTemplate(template, assignments) {
            var date, isLate, progress;
            template = template.replace(/@@assignmentName@@/g, escapeHTML(assignments.name || ''));
            template = template.replace(/@@assignmentID@@/g, assignments.assignmentID || '');
            progress = parseInt(assignments.completedCount || 0, 10);
            progress = progress ? '<b>' + progress + '</b>' : progress;
            progress += '/' + (assignments.totalCount || '0');
            template = template.replace(/@@progress@@/g, progress);
            progress = parseInt(assignments.completedCount || 0, 10) / parseInt(assignments.totalCount || 0, 10) * 100;
            template = template.replace(/@@percentage@@/g, progress);
            date = new Date(assignments.due || '');
            if (assignments.isPastDue && 100 === progress) {
                isLate = 'member-is-late';
                progress = getDaysLate(assignments.concepts, date);
            } else {
                isLate = 'hide';
                progress = 0;
            }
            template = template.replace(/@@dueDate@@/g, parseDate(assignments.due) || '&nbsp;');
            template = template.replace(/@@dueDateShort@@/g, parseDate(assignments.due).substr(0, 5) || '&nbsp;');
            template = template.replace(/@@daysLate@@/g, progress);
            template = template.replace(/@@isLate@@/g, isLate);
            return template;
        }

        /*
        function sortAccordingToDue(assignment1, assignment2) {
            var due1, due2;
            due1 = assignment1.due.substring(0,10);
            due1 = new Date(due1);
            due1 = due1.getTime();
            due2 = assignment2.due.substring(0,10);
            due2 = new Date(due2);
            due2 = due2.getTime();
            if (due1 > due2) {
            return 1;
            } else {
                return -1;
            }
        }
        */

        function renderAssignmentsForMember(assignments) {
            var index, detailView, i, pageTemplate, This,
                pastTemplate = '',
                upcomingTemplate = '',
                completeTemplate = '';
            require(['text!groups/templates/group.assignment.list.member.html',
                'text!groups/templates/group.assignment.detail.assignment.html',
                'text!groups/templates/group.assignment.detail.concept.html'
            ], function (template, assignmentTemplate, conceptTemplate) {
                //assignments.sort(sortAccordingToDue);
                for (index = 0; index < assignments.length; index++) {
                    pageTemplate = template;
                    detailView = renderDetailView(assignments[index], assignmentTemplate, conceptTemplate);
                    assignments[index] = detailView.recent;
                    pageTemplate = pageTemplate.replace(/@@detailView@@/g, detailView.html);
                    if (assignments[index].incompleteCount) {
                        if (assignments[index].isPastDue) {
                            pastTemplate += createTemplate(pageTemplate, assignments[index]);
                        } else {
                            upcomingTemplate += createTemplate(pageTemplate, assignments[index]);
                        }
                    } else {
                        completeTemplate += createTemplate(pageTemplate, assignments[index]);
                    }
                }
                $('#past-due').append(pastTemplate);
                $('#upcoming').append(upcomingTemplate);
                $('#complete').append(completeTemplate);
                for (i = 0; i < assignments.length; i++) {
                    $('#' + assignments[i].assignmentID).find('.barGraphs').graph({
                        items: assignments[i]
                    });
                }
                initCoversheetBinding();
                $('.member-assignment-list-wrapper').each(function () {
                    This = $(this).next();
                    This.removeClass('hide');
                    if (This.find('.concepts-wrapper').height() < This.find('.assignment-concept-list').height()) {
                        This.find('.swiped-bottom-button').addClass('active');
                        This.find('.spindle-expand').addClass('spindle-bottom-present');
                    }
                    This.addClass('hide');
                });
                This = $('.js-only-upcoming');
                if (1 === $('#past-due').children().length) {
                    This.removeClass('hide');
                    This.prev().addClass('hide');
                    $('#past-due').addClass('hide');
                } else {
                    This.addClass('hide');
                    This.prev().removeClass('hide');
                    $('#past-due').removeClass('hide');
                }
                if (1 === $('#upcoming').children().length) {
                    $('#upcoming').addClass('hide');
                } else {
                    $('#upcoming').removeClass('hide');
                }
                $('.knob').knob({
                    'displayInput': false,
                    'readOnly': true,
                    'thickness': 1,
                    'fgColor': '#00ABA4',
                    'height': 20,
                    'width': 20
                });
                util.ajaxStop();
                bindEventsForDetailView();
                if (window.innerWidth < 768) {
                    $('.dashboard-widget').addClass('small-view');
                }
            });
        }

        function renderMoreAssignments(assignment) {
            assignment = assignment.assignments;
            renderAssignmentsForMember(assignment);
            $('.change-assignment-viewed').siblings().toggleClass('hide');
            $('.js-complete').toggleClass('hide');
            $('.js-incomplete').toggleClass('hide');
            if ('See completed assignments' === $('.change-assignment-viewed:visible').text()) {
                $('.change-assignment-viewed').text('See incomplete assignments');
                $('.js-incomplete').find('.member-assignment-list-container').remove();
            } else {
                $('.change-assignment-viewed').text('See completed assignments');
                $('.js-complete').find('.member-assignment-list-container').remove();
            }
        }

        function bindTooltipEvent() {
            $('#complete').off('mouseenter.groups').on('mouseenter.groups', '.js-islate', function () {
                $(this).parent().next().removeClass('hide');
            }).off('mouseleave.groups').on('mouseleave.groups', '.js-islate', function () {
                $(this).parent().next().addClass('hide');
            });
        }

        function bindEventsMember() {

            $('.change-assignment-viewed').off('click.assignment').on('click.assignment', function () {
                var pageSize, data = {};
                pageSize = $('#group-assignments-count').text();
                data.filters = $(this).siblings().not('.hide').attr('data-state');
                data.pageSize = pageSize;
                $('#assignment-wrapper').empty();
                groupAssignmentsController.loadMoreAssignments(groupID, data, renderMoreAssignments);
            });

            bindTooltipEvent();
        }

        function bindEventForAssign() {
            $('.js-assign').off('click.assignment').on('click.assignment', function () {
                if (!$(this).hasClass('js-disabled')) {
                    var due, This;
                    This = $(this).parents('.assignment-list-container');
                    due = This.find('.js-due').val();
                    This.find('.js-date-popup').addClass('hide');
                    if (due) {
                        if (!isValidDate(due)) {
                            This.find('.js-due').addClass('input-error2');
                            This.find('.js-invalid-date').removeClass('hide');
                        } else if (isBeforeDate(due)) {
                            This.find('.js-due').addClass('input-error2');
                            This.find('.js-before-date').removeClass('hide');
                        } else if(!checkFutureDate(due)){
                        	This.find('.js-due').addClass('input-error2');
                            This.find('.js-future-date').removeClass('hide');
                        } else {
                            $('.assignment-list-container').removeClass('js-selected');
                            This.addClass('js-selected');
                            $('#assign-modal-group-name').text($('#group-name').text());
                            $('#assign-modal-assignment-name').text(This.find('.js-assignment-name').text());
                            $('#assignment-assign-modal-link').trigger('click');
                        }
                    } else {
                        $('.assignment-list-container').removeClass('js-selected');
                        This.addClass('js-selected');
                        $('#assign-modal-group-name').text($('#group-name').text());
                        $('#assign-modal-assignment-name').text(This.find('.js-assignment-name').text());
                        $('#assignment-assign-modal-link').trigger('click');
                    }
                }
            });
        }

        function bindEventsLeaderAssignmentDetails(assignmentID) {
            $('#' + assignmentID).find('.expand-view-button').off('click.expand').on('click.expand', function () {
                if (window.innerWidth < 768) {
                    $(this).parents('.leader-assignment-details').removeClass('widget-expand-active');
                } else {
                    $(this).parents('.leader-assignment-details').addClass('hide');
                    var arrow = $(this).parents('.leader-assignment-details').parents('.js-assignment-detail-wrapper').find('.leader-assignment-arrow-icon');
                    $(arrow).removeClass('icon-arrow_down leader-assignment-arrow-icon');
                    $(arrow).addClass('icon-arrow_right leader-assignment-arrow-icon');                    
                }
            });
            $('.leader-assignment-expand').off('click.expand').on('click.expand', function () {
                $(this).parents('.leader-assignment-details').addClass('widget-expand-active');
            });
            Hammer($('#' + assignmentID).find('.leader-assignment-details')).off('dragleft.leaderWidget').on('dragleft.leaderWidget', function () {
                if (window.innerWidth < (768)) {
                    $(this).addClass('dragleft');
                }
            });

            Hammer($('#' + assignmentID).find('.leader-assignment-details')).off('dragright.leaderWidget').on('dragright.leaderWidget', function () {
                if (window.innerWidth < (768)) {
                    $(this).addClass('dragright');
                }
            });

            Hammer($('#' + assignmentID).find('.leader-assignment-details')).off('release.leaderWidget').on('release.leaderWidget', function () {
                if (window.innerWidth < (768)) {
                    if ($(this).hasClass('dragleft')) {
                        $(this).addClass('widget-expand-active');
                    } else if ($(this).hasClass('dragright')) {
                        $(this).removeClass('widget-expand-active');
                    }
                    $(this).removeClass('dragleft dragright');
                }
            });

            $('#' + assignmentID).find('.swiped-bottom-button').off('click.next').on('click.next', function () {
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
                            $this.removeClass('active');
                            $spindle.removeClass('spindle-bottom-present');
                        }
                    }
                }
            });

            $('#' + assignmentID).find('.swiped-top-button').off('click.next').on('click.next', function () {
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

            $('#' + assignmentID).find('.concept').off('click.newspaper').on('click.newspaper', function () {
                var src = '/embed/#module=concept&amp;handle=' + $(this).attr('data-handle') + '&amp;branch=' + $(this).attr('data-branchHandle') + '&amp;context=' + $(this).attr('data-contextname') + '&amp;nochrome=true';
                var mtype = $(this).attr('data-mtype');
                var collectionHandle = $(this).attr('data-collection-handle');
                var conceptCollectionAbsoluteHandle = $(this).attr('data-concept-collection-absolute-handle');
                var collectionCreatorID = $(this).attr('data-collection-creator-ID');
                if (collectionHandle && conceptCollectionAbsoluteHandle) {
                    src += '&amp;collectionHandle=' + collectionHandle + '&amp;collectionCreatorID=' + (collectionCreatorID || '3'); // default collection creator ID
                    src += '&amp;conceptCollectionAbsoluteHandle=' + conceptCollectionAbsoluteHandle;
                }
                if($(this).hasClass("quick-show")){
                	if (mtype === "plix" || mtype === 'simulationint') {
                        if (mtype === 'plix') {
                            src = $(this).attr('data-contextUrl');
                        } else {
                            src = '/' + $(this).attr('data-branchHandle') + '/' + $(this).attr('data-contextname') + '/' + $(this).attr('data-mtype') + '/' + $(this).attr('data-handle');
                        }
                		window.open(src);
                		return;
                    } else {
                		src = '/embed/#module=modality&handle=' + $(this).attr('data-handle') + '&branch=' + $(this).attr('data-branchHandle') + '&context=' + $(this).attr('data-contextname') + '&mtype=' + $(this).attr('data-mtype') + '&realm=user:' + $(this).attr('data-login') +'&amp;nochrome=true';
                	}
                } else if (mtype === "asmtquiz") { // it is a quiz
                    src = '/assessment/ui/?test/view/quiz/' + $(this).attr('data-handle') + '/user:' + $(this).attr('data-login') + '?type=quiz&preview=true';
                }
                if (mtype !== 'domain') { // For section, lesson or other modalities hide the back button
                    src += '&amp;hideConceptLink=true';
                }
                groupAssignmentsController.showNewspaper(src);
            });

            $('#' + assignmentID).find('.display-indicator-container').off('click.newspaper').on('click.newspaper', function () {
                $(this).siblings('.concept').trigger('click');
            });

            $('#' + assignmentID).find('.js-edit-assignment').off('click.edit').on('click.edit', function () {
            	if($(this).hasClass("js-disabled")){
            		var payload = {
        		        	"memberID": ads_userid,
        		        	"action_type" : "info_icon" ,
        		        	"action_name" : "edit_disabled",
        		        	"screen_name" : "assignments",
        		        	"assignmentID" :  $(this).data("assignmentid"),
        		        	"groupID" : $(this).data("groupid")
                	}
            		if (window._ck12) {
                        window._ck12.logEvent('FBS_ACTION', payload);
                    }
            		return false;
            	}
                $('.js-edit-assignment').removeClass('active');
                $(this).addClass('active');
            });
            $('#' + assignmentID).find('.js-info-quick').off('click.info').on('click.info', function () {
            	var payload = {
    		        	"memberID": ads_userid,
    		        	"action_type" : "info_icon" ,
    		        	"action_name" : "edit_disabled",
    		        	"screen_name" : "assignments",
    		        	"assignmentID" :  $($(this).parent()).siblings(".js-edit-assignment").data("assignmentid"),
    		        	"groupID" : $($(this).parent()).siblings(".js-edit-assignment").data("groupid")
            	}
        		if (window._ck12) {
                    window._ck12.logEvent('FBS_ACTION', payload);
                }
            });
            $('#' + assignmentID).find('.js-delete-assignment').off('click.delete').on('click.delete', function () {
                var assignmentName;
                $('.js-delete-assignment').removeClass('active');
                $(this).addClass('active');
                assignmentName = $(this).parents('.assignment-list-container').find('.js-assignment-name').text();
                $('#deleteAssignmentModal').find('.js-assignment-name').text(assignmentName);
            });

            $('.js-due').off('paste.disable').on('paste.disable', function (e) {
                e.preventDefault();
            }).off('focus.groups').on('focus.groups', function () {
                $(this).removeClass('input-error2');
                var This = $(this).parents('.assignment-list-container');
                if (This.find('.js-invalid-date').is(':visible') || This.find('.js-before-date').is(':visible')) {
                    This.find('.js-invalid-date').addClass('hide');
                    This.find('.js-before-date').addClass('hide');
                    $(this).val($(this).attr('value'));
                }
                $('.ui-datepicker-prev').addClass('icon-arrow_left');
                $('.ui-datepicker-next').addClass('icon-arrow_right');
            }).off('change.groups').on('change.groups', function () {
                var assignID,
                    due = $(this).val(),
                    This = $(this).parent(),
                    date = {};
                $(this).removeClass('input-error2');

                This.siblings('.js-date-popup').addClass('hide');
                if (This.prev().hasClass('assignment-assigned')) {
                    assignID = This.parents('.assignment-list-container')[0].id;
                    if (due) {
                        if (!isValidDate(due)) {
                            This.siblings('.js-invalid-date').removeClass('hide');
                            $(this).addClass('input-error2');
                            return;
                        }
                        if (isBeforeDate(due)) {
                            This.siblings('.js-before-date').removeClass('hide');
                            $(this).addClass('input-error2');
                            return;
                        }
                        if(!checkFutureDate(due)){
                            This.siblings('.js-future-date').removeClass('hide');
                            $(this).addClass('input-error2');
                            return;
                        }
                        due = getDate(due);
                    }
                    date.due = due;
                    $('.js-due').parent().removeClass('js-changed');
                    This.addClass('js-changed');
                    groupAssignmentsController.updateAssignment(assignID, date, dueDateChanged);
                }
            }).datepicker({
                minDate: 0,
                dayNamesMin: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
            });

            $('.js-invalid-date-close').off('click.close').on('click.close', function () {
                $(this).parent().addClass('hide');
                var This = $(this).parents('.assignment-list-wrapper').find('.js-due');
                This.removeClass('input-error2').val(This.attr('value'));
            });

            $('.js-before-date-close,.js-future-date-close').off('click.close').on('click.close', function () {
                $(this).parent().addClass('hide');
                var This = $(this).parents('.assignment-list-wrapper').find('.js-due');
                This.removeClass('input-error2').val(This.attr('value'));
            });

            $('.js-date-change-close').off('click.close').on('click.close', function () {
                $(this).parent().addClass('hide');
            });
            $(".js-edit-objective").off("click").on("click",function(e){
            	var This = $(this).parents('.assignment-list-container');
            	$(".description").addClass("hide-imp");
            	$(this).prev(".bg-description").removeClass("hide-imp").html(This.find(".description").html());
            });
            $(".bg-description").off("blur").on("blur",function(){
        		var $this = $(this),
            	This = $this.parents('.assignment-list-container');

            	if($this.val().trim().length > 500){
            		This.find(".assignment-instruction-change").removeClass("hide");
            		$this.addClass("input-error2");
            	}else{
                	$(this).prev(".description").removeClass("hide-imp").html($(this).val());
                	$(this).addClass("hide-imp");
                	This.find(".assignment-instruction-change").addClass("hide");
                	$this.removeClass("input-error2");
                	var assignID =  $(this).parents('.assignment-list-container')[0].id,
                    description = $(this).val();
                	groupAssignmentsController.updateAssignment(assignID, {"description": description}, null);
            	}
            });

            $(".text-assign-name").off("blur").on("blur",function(){
            	var $this = $(this),
            	This = $this.parents('.assignment-list-container');

            	if($this.val().trim().length > 200 || $this.val().trim().length === 0){
            		This.find(".assignment-title-change").removeClass("hide");
            		$this.addClass("input-error2");
            	}else{
                	$this.prev(".assignment-title-text").removeClass("hide-imp").html($this.val());
                	This.find(".assignment-title-change").addClass("hide");
                	$this.removeClass("input-error2");
                	$this.addClass("hide-imp");
                	var assignID =  $this.parents('.assignment-list-container')[0].id,
                    name = $this.val();
                	groupAssignmentsController.updateAssignment(assignID, {"name": name}, null);
            	}
            });
            bindEventForAssign();

            $('.js-unassign').off('click.assignment').on('click.assignment', function () {
                if (!$(this).hasClass('js-disabled')) {
                    $('#unassign-assignment-modal-name').text($(this).parents('.assignment-list-container').find('.js-assignment-name').text());
                    $('#unAssignAssignmentModal').attr('data-id', $(this).parents('.assignment-list-container')[0].id);
                    $('#assignment-unassign-modal-link').trigger('click');
                }
            });
        }

        function bindEventsForEditAssignment() {
            $('#cancelEditAssignment').off('click.close').on('click.close', function () {
                $('#continueEditAssignment').foundation('reveal', 'close');
            });

            $('#continueEditAssignment').off('click.edit').on('click.edit', function () {
                var $this, assignment;
                $this = $('.js-edit-assignment.active');
                assignment = {
                    'name': $this.attr('data-assignmentName'),
                    'id': $this.attr('data-assignmentID'),
                    'concepts': []
                };
                $this.parents('.assignment-list-container').find('.concept').each(function () {
                    assignment.concepts.push({
                        'name': $(this).text(),
                        'eID': $(this).attr('data-encodedid').replace(/\./g, '-'),
                        'collectionHandle': $(this).attr('data-collection-handle').toLowerCase() || '',
                        'conceptCollectionHandle': $(this).attr('data-concept-collection-handle').toLowerCase() || '',
                        'collectionCreatorID': $(this).attr('data-collection-creator-ID') || '',
                        'icon': $(this).attr('data-mtype') === 'asmtquiz' ? 'quiz' : $(this).attr('data-branchhandle').toLowerCase().replace(/\s+/g, '-')
                    });
                });
                groupAssignmentsController.editAssignment('#group-assignments', assignment);
                $('#continueEditAssignment').foundation('reveal', 'close');
            });
        }

        function assignmentDeleted() {
            var $this, title, assignmentCount;
            $this = $('.js-delete-assignment.active').parents('.assignment-list-container');
            title = $this.find('.assignment-title-text').text();
            $('#deleteAssignmentModal').foundation('reveal', 'close');
            if ($this.find('.assignment-list-wrapper').hasClass('assignment-list-even')) {
                $this.after('<div class="delete-assignment-message row collapse" style="background-color: #FFFFFF;">' + title + ' has been deleted.</div>');
            } else {
                $this.after('<div class="delete-assignment-message row collapse">' + title + ' has been deleted.</div>');
            }
            if ($this.find('.assignment-assigned').length) {
                assignmentCount = parseInt($('#group-assignments-count').text(), 10);
                $('#group-assignments-count').text(assignmentCount - 1);
            }
            if ($('.assignment-list-container').length === 1) {
                $('#group-assignment-container').remove();
                groupAssignmentsController.renderZeroStateForLeaderAssignments();
            }
            $this.remove();
            setTimeout(function () {
                $('.delete-assignment-message').remove();
                $('.assignment-list-wrapper').removeClass('assignment-list-even');
                $('.assignment-list-wrapper:even').addClass('assignment-list-even');
            }, 5000);
        }

        function bindEventsForDeleteAssignment() {
            $('#cancelDeleteAssignment').off('click.close').on('click.close', function () {
                $('#deleteAssignmentModal').foundation('reveal', 'close');
            });

            $('#deleteAssignment').off('click.edit').on('click.edit', function () {
                var $this, assignmentID;
                $this = $('.js-delete-assignment.active');
                assignmentID = $this.parents('.assignment-list-container').attr('id');
                groupAssignmentsController.deleteAllAssignment(assignmentID, assignmentDeleted);
            });
        }

        function renderLeaderAssignmentDetails(assignment) {
            var index, currentAssignment, conceptCount,
                template = '',
                htmlString = '',
                template1 = '',
                quizCount = 0;
            assignment = assignment.assignment;
            currentAssignment = $('#' + assignment.id);
            require(['text!groups/templates/group.assignment.detail.leader.html',
                'text!groups/templates/group.assignment.detail.concept.leader.html',
                'text!groups/templates/assignment.delete.modal.html',
                'text!groups/templates/assignment.edit.modal.html'
            ], function (assignmentTemplate, conceptTemplate, deleteAssignmentTemplate, editAssignmentTemplate) {

                if (assignment.concepts) {
                    for (index = 0; index < assignment.concepts.length; index++) {
                        template1 = conceptTemplate.replace(/@@conceptName@@/g, escapeHTML(
                            assignment.concepts[index].type === 'domain' ? (assignment.concepts[index].conceptCollectionTitle ||
                            assignment.concepts[index].name || '') : (assignment.concepts[index].name || '')
                        ));

                        if (assignment.concepts[index].collectionHandle && assignment.concepts[index].conceptCollectionAbsoluteHandle) {
                            template1 = template1.replace(/@@collectionHandle@@/g, assignment.concepts[index].collectionHandle.toLowerCase());
                            template1 = template1.replace(/@@conceptCollectionAbsoluteHandle@@/g, assignment.concepts[index].conceptCollectionAbsoluteHandle);
                            template1 = template1.replace(/@@conceptCollectionHandle@@/g, assignment.concepts[index].conceptCollectionHandle.toLowerCase());
                            template1 = template1.replace(/@@collectionCreatorID@@/g, assignment.concepts[index].collectionCreatorID);
                        } else {
                            template1 = template1.replace(/@@collectionHandle@@/g, '');
                            template1 = template1.replace(/@@conceptCollectionAbsoluteHandle@@/g, '');
                            template1 = template1.replace(/@@conceptCollectionHandle@@/g, '');
                            template1 = template1.replace(/@@collectionCreatorID@@/g, '');
                        }

                        template1 = template1.replace(/@@branchHandle@@/g, assignment.concepts[index].branchHandle || (assignment.concepts[index].domains && assignment.concepts[index].domains[0].branchInfo.name.toLowerCase()) || '');
                        template1 = template1.replace(/@@encodedid@@/g, assignment.concepts[index].encodedID || assignment.concepts[index].id || '');
                        template1 = template1.replace(/@@handle@@/g, assignment.concepts[index].handle || '');
                        template1 = template1.replace(/@@login@@/g, assignment.concepts[index].login || '');
                        template1 = template1.replace(/@@mtype@@/g, assignment.concepts[index].type || '');
                        template1 = template1.replace(/@@contextName@@/g,  (assignment.concepts[index].domains && assignment.concepts[index].domains[0].handle) || '');
                        template1 = template1.replace(/@@data-contextUrl@@/g, assignment.concepts[index].contextUrl || '');

                        if ('lesson' === assignment.concepts[index].type || 'section' === assignment.concepts[index].type) {
                        	template1 = template1.replace(/@@icon-name@@/g, 'read');
                        }else if('asmtpractice' === assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'exercise');
                        }else if('lecture' === assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'video');
                        }else if('enrichment' === assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'video');
                        }else if('rwa' === assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'rwa');
                        }else if('simulationint' === assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'simulations');
                        }else if('plix' === assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'interactive_practice');
                        }else if('asmtquiz' ===  assignment.concepts[index].type || 'quiz' ===  assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'quiz');
                        }else if('domain' ===  assignment.concepts[index].type){
                        	template1 = template1.replace(/@@icon-name@@/g, 'lightbulb');
                        }
                        if(assignment.concepts[index].contextUrl){
                        	if('plix' === assignment.concepts[index].type){
                          	  template1 = template1.replace(/@@data-contextUrl@/g, assignment.concepts[index].contextUrl);
                            }else if('simulationint' === assignment.concepts[index].type){
                               	template1 = template1.replace(/@@data-contextUrl@/g, assignment.concepts[index].contextUrl);
                            }
                            $('#' + assignment.id).addClass("quick-assign");
                        }else{
                        	template1 = template1.replace(/@@data-contextUrl@/g, '');
                        }
                        htmlString += template1;
                        if ('asmtquiz' === assignment.concepts[index].type) {
                            quizCount++;
                        }
                    }

                    conceptCount = assignment.concepts.length - quizCount;
                    template = assignmentTemplate.replace(/@@conceptList@@/g, htmlString || '');
                    template = template.replace(/@@conceptCount@@/g, conceptCount);
                    template = template.replace(/@@quizCount@@/g, quizCount);
                    if (1 === quizCount) {
                        template = template.replace(/@@quizzes@@/g, 'Quiz');
                    } else {
                        template = template.replace(/@@quizzes@@/g, 'Quizzes');
                    }
                    if (1 === conceptCount) {
                        template = template.replace(/@@concepts@@/g, 'Concept');
                    } else {
                        template = template.replace(/@@concepts@@/g, 'Concepts');
                    }
                    if (currentAssignment.find('.assignment-assigned').length) {
                        template = template.replace(/@@undoAssignHide@@/g, '');
                        template = template.replace(/@@assignHide@@/g, 'hide');
                    } else {
                        template = template.replace(/@@undoAssignHide@@/g, 'hide');
                        template = template.replace(/@@assignHide@@/g, '');
                    }

                    template = template.replace(/@@value@@/g, parseDate(assignment.due) || '');
                    template = template.replace(/@@assignmentID@@/g, assignment.id || '');
                    template = template.replace(/@@assignmentName@@/g, escapeHTML(assignment.name || ''));
                    template = template.replace(/@@status@@/g, assignment.assignmentID ? 'assigned' : 'assign');
                    template = template.replace(/@@hideReports@@/g, assignment.assignmentID ? '' : 'hide');
                    template = template.replace(/@@groupID@@/g, groupID);
                    template = template.replace(/@@description@@/g, assignment.studyTracks[0].summary || '');
                    if (currentAssignment.find('.dashboard-widget').length === 0) {
                        currentAssignment.find('.js-assignment-detail-wrapper').append(template);
                    }

                    if (currentAssignment.find('.concepts-wrapper').height() < currentAssignment.find('.assignment-concept-list').height()) {
                        currentAssignment.find('.swiped-bottom-button').addClass('active');
                        currentAssignment.find('.spindle-expand').addClass('spindle-bottom-present');
                    }
                    if (!$('#deleteAssignmentModal').length) {
                        $('body').append(deleteAssignmentTemplate);
                        bindEventsForDeleteAssignment();
                    }
                    if($('#' + assignment.id).hasClass("quick-assign")){
                  	  $('#' + assignment.id).find(".js-edit-assignment").addClass("js-disabled");
                  	  $('#' + assignment.id).find(".quick-assign-info").removeClass("hide-important");
                  	$('#' + assignment.id).find(".concept-descriptions").addClass("quick-show");
                    }
                    if (!$('#editAssignmentModal').length) {
                        $('body').append(editAssignmentTemplate);
                        bindEventsForEditAssignment();
                    }
                    currentAssignment.find('.js-assignment-list-wrapper').removeClass('js-disabled');
                    bindEventsLeaderAssignmentDetails(assignment.id);
                }
            });
        }

        function bindEventsLeaderAssignment() {

            bindEventForAssign();
            $('.js-assignment-list-wrapper').off('click.assignment').on('click.assignment', function (e) {
                var $this = $(this),
                    $targetElement = $(e.target);
                if ($targetElement.hasClass('js-edit-name')) {
                	$targetElement.siblings(".assignment-title-text").addClass("hide-imp");
                	$targetElement.prev(".text-assign-name").removeClass("hide-imp").val($targetElement.siblings(".assignment-title-text").html()).focus();
                	bindEditTitleEvents($targetElement.closest(".js-assignment-list-wrapper"));
                } else if ($targetElement.hasClass('text-assign-name')){
                	// conditional code
                } else if (!($targetElement.hasClass('js-assign') || $this.hasClass('js-disabled'))) {
                    var arrow = $(e.target);
                    if (! $(e.target).hasClass('leader-assignment-arrow-icon')) {
                      arrow = $(e.target).parent().find('.leader-assignment-arrow-icon');
                    }
                    if ($(arrow).hasClass('icon-arrow_down')) {
                      $(arrow).removeClass('icon-arrow_down leader-assignment-arrow-icon');
                      $(arrow).addClass('icon-arrow_right leader-assignment-arrow-icon');
                    } else {
                      $(arrow).removeClass('icon-arrow_right leader-assignment-arrow-icon');
                      $(arrow).addClass('icon-arrow_down leader-assignment-arrow-icon');
                    }

                    if ($this.siblings('.leader-assignment-details').length) {
                        $this.siblings('.leader-assignment-details').toggleClass('hide');
                        if (window.innerWidth < 768) {
                            $this.siblings('.leader-assignment-details').removeClass('widget-expand-active');
                        }
                    } else {
                        $this.addClass('js-disabled');
                        groupAssignmentsController.getLeaderAssignmentDetails($this.parents('.assignment-list-container')[0].id);
                    }
                }
            });

            function bindEditTitleEvents(parentElement) {
            	parentElement.off("keypress.save", ".text-assign-name").on("keypress.save", ".text-assign-name", function(e) {
                    var brackets = "{}[]()",
                    key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
                    if (brackets.indexOf(key) !== -1) {
                        e.preventDefault();
                        return false;
                    }
                });	
            }
        }

        function renderAssignmentsForLeader(assignments) {
            scrollPage = assignments.total > assignments.offset + assignments.limit ? assignments.offset / 10 + 2 : 0;
            assignments = assignments.assignments;
            var index, template = '';
            require(['text!groups/templates/group.assignment.list.leader.html'], function (pageTemplate) {
                for (index = 0; index < assignments.length; index++) {
                    template += pageTemplate;
                    assignments[index].name = (assignments[index].name || '').replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;');
                    template = template.replace(/@@assignmentName@@/g, assignments[index].name || '');
                    template = template.replace(/@@status@@/g, assignments[index].assigned ? 'assigned' : 'assign');
                    template = template.replace(/@@assignmentID@@/g, assignments[index].id || '');
                    template = template.replace(/@@dueDate@@/g, parseDate(assignments[index].due) || '&nbsp');
                    template = template.replace(/@@dueDateShort@@/g, parseDate(assignments[index].due).substr(0, 5) || '&nbsp');
                }
                $('#assignment-wrapper').append(template);
                $('.assignment-list-wrapper:even').addClass('assignment-list-even');
                util.ajaxStop();
                if (scrollPage > 0) {
                  $('#show-more-assignment-wrapper').removeClass('hide');
                }
                bindEventsLeaderAssignment();
                checkParam()
            });
        }
        function checkParam () {
            var queries = function () {
                var query_string = {};
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i=0;i<vars.length;i++) {
                    var pair = vars[i].split("=");
                    if (typeof query_string[pair[0]] === "undefined") {
                        query_string[pair[0]] = decodeURIComponent(pair[1]);
                    } else if (typeof query_string[pair[0]] === "string") {
                        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                        query_string[pair[0]] = arr;
                    } else {
                        query_string[pair[0]].push(decodeURIComponent(pair[1]));
                    }
                }
                return query_string;
            }();

            if (queries.hasOwnProperty('pageType')) {
                $('#create-assignment').trigger('click', [{quizHandle: queries.quizHandle}]);
            }
        }
        function bindEventsLeaderPage() {
            $('.js-dropdown-element').off('click.groups').on('click.groups', function () {
                if ($('#dropdown-title').text() !== $(this).children().text()) {
                    var data = {};
                    sort = $(this).attr('data-sort');
                    data.sort = sort;
                    $('#assignment-wrapper').empty();
                    groupAssignmentsController.loadMoreAssignments(groupID, data, renderAssignmentsForLeader);
                }
                $('#dropdown-title').text($(this).children().text());
                $('#dropdown-title').trigger('click');
            });

            $('#create-assignment').off('click.assignment').on('click.assignment', function () {
                groupAssignmentsController.editAssignment('#group-assignments');
            });

            $('#unassign-assignment-modal-cancel').off('click.assignment').on('click.assignment', function () {
                $('#unAssignAssignmentModal').find('.close-reveal-modal').trigger('click');
            });

            $('#unassign-assignment-modal-unassign').off('click.assignment').on('click.assignment', function () {
                $('#unAssignAssignmentModal').find('.close-reveal-modal').trigger('click');
                groupAssignmentsController.unAssignAssignment($('#unAssignAssignmentModal').attr('data-id'), actionComplete);
            });

            $('#assign-modal-cancel').off('click.assignment').on('click.assignment', function () {
                $('#assignAssignmentModal').find('.close-reveal-modal').trigger('click');
            });

            $('#assign-modal-assign').off('click.assignment').on('click.assignment', function () {
                $('#assignAssignmentModal').find('.close-reveal-modal').trigger('click');
                var id, due;
                id = $('.js-selected')[0].id + '/' + groupID;
                due = {};
                due.due = getDate($('.js-selected').find('.js-due').val());
                groupAssignmentsController.assignAssignment(due, id, actionComplete);
            });

            $(window).off('scroll.groups').on('scroll.groups', function () {
                if (($(document).scrollTop() + $(window).height()) === $(document).height() && scrollPage && !$('#assignment-full-page').length) {
                    var assignment = {};
                    assignment.pageSize = '10';
                    assignment.pageNum = scrollPage;
                    assignment.sort = sort || 'due,asc';
                    groupAssignmentsController.loadMoreAssignments(groupID, assignment, renderAssignmentsForLeader);
                    scrollPage = 0;
                    $('#show-more-assignment-wrapper').addClass('hide');
                }
            });
            $('#show-more-assignment').off('click.showmore').on('click.showmore', function(){
              var assignment = {};
              assignment.pageSize = '10';
              assignment.pageNum = scrollPage;
              assignment.sort = sort || 'due,asc';
              groupAssignmentsController.loadMoreAssignments(groupID, assignment, renderAssignmentsForLeader);
              scrollPage = 0;
              $('#show-more-assignment-wrapper').addClass('hide');
            });
        }

        function bindEventsMemberAllCompleted() {
            $('.view-completed-assignments').off('click.assignment').on('click.assignment', function () {
                var pageSize, data = {};
                pageSize = $('#group-assignments-count').text();
                data.pageSize = pageSize;
                $('#complete-assignment-container').removeClass('hide');
                $('#complete-assignment-container').prev().addClass('hide');
                data.filters = 'state,completed';
                $('#assignment-wrapper').empty();
                groupAssignmentsController.loadMoreAssignments(groupID, data, renderMoreAssignments);
            });

            bindTooltipEvent();
        }

        function render(assignment, id) {
            groupID = id;
            $('#group-assignments-link').addClass('cursor-default').parent().addClass('active');
            $('#group-assignments-count').addClass('group-count-black');
            if ($('#image-edit-link').length) {
                require(['text!groups/templates/group.assignment.non.zero.state.leader.html'], function (pageTemplate) {
                    $('#group-details-container').append($(pageTemplate).find('#group-assignment-container'));
                    $('#group-assignments').append($(pageTemplate).find('#unAssignAssignmentModal'));
                    $('#group-assignments').append($(pageTemplate).find('#assignAssignmentModal'));
                    renderAssignmentsForLeader(assignment);
                    bindEventsLeaderPage();
                });
            } else {
                require(['text!groups/templates/group.assignment.non.zero.state.member.html'], function (pageTemplate) {
                    if (assignment.assignments instanceof Array && assignment.assignments.length) {
                        $('#group-details-container').append($(pageTemplate).find('#member-assignment').html());
                        renderAssignmentsForMember(assignment.assignments);
                        bindEventsMember();
                    } else {
                        pageTemplate = $(pageTemplate).find('#member-no-assignment').html();
                        pageTemplate = pageTemplate.replace(/@@reportsLink@@/g, $('#group-reports-link').attr('href'));
                        $('#group-details-container').append(pageTemplate);
                        util.ajaxStop();
                        bindEventsMemberAllCompleted();
                    }
                    if (!(assignment.assignmentCompletedCount)) {
                        $('.change-assignment-viewed').addClass('hide').siblings().addClass('hide');
                        $('.member-assignment-header-mobile').addClass('hide-important');
                    }
                });
            }
            $(window).off('pageshow').on("pageshow", function(event) {
                if (event.originalEvent.persisted) {
                    window.location.reload();
                }
            });
        }

        this.render = render;
        this.renderLeaderAssignmentDetails = renderLeaderAssignmentDetails;

    }
    return new groupAssignmentsNonZeroStateView();
});
