define(
    [
        'jquery',
        'underscore',
        'common/utils/utils',
        'common/utils/walkthrough',
        'common/controllers/search',
        'common/views/modal.view'
    ],
    function ($, _, util, walkthrough, search, ModalView) {
    'use strict';

    var AssignmentEditController;
    require(['groups/controllers/assignment.edit'], function (controller) {
        AssignmentEditController = controller;
    });

    function AssignmentEditView() {

        var backContainer, searchBackHTML, visible, searchVal, isBack, conceptRadioStatus, isSaved,
            redirect_link = '',
            searchPageSize = 10,
            number_of_pages_show = 3,
            errorShown = false,
            hasDateError = false,
            collection = null,
            collectionDataPointer = null,
            ck12PeerHelpClientID = 24839961;

        var conceptTemplate;
        require(['text!groups/templates/concept.row.collection.html'], function (artifactTemplate) {
            conceptTemplate =  _.template(artifactTemplate, null, {
                'variable': 'data'
            });
        });

        function escapeHTML(string) {
            string = string.toString();
            return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        // checks whether there are any concepts with practice
        function checkForNoPracticeConcept() {
            if (!($('.js-concept-select:visible').length)) {
                $('#no-practice-concept').removeClass('hide');
                $('#toggle-select-concepts').addClass('hide');
                if ($('.js-search-open').is(':visible')) {
                    $('.js-no-concept-title').text($('#concept-heading').find('.js-node-name').text());
                    $('.js-no-concept-title-dot').text($('#concept-heading').find('.js-node-name').text() + '.');
                } else {
                	$('.js-no-concept-title').text(unescape(searchVal));
                  $('.js-no-concept-title-dot').text(unescape(searchVal) + '.');
                }
            } else {
                $('#no-practice-concept').addClass('hide');
                $('#toggle-select-concepts').removeClass('hide');
            }
        }

        function deleteComplete() {
            $('#save-assignment').addClass('js-disabled');
            $('#close-assignment-modal').addClass('js-disabled');
            location.href = $('#group-assignments-link')[0].href;
        }

        function bindEventsForNewspaper() {
            $('#close-newspaper-modal-icon').off('click.newspaper').on('click.newspaper', function () {
                util.ajaxStop();
                setTimeout(function () {
                    $('#concept-newspaper').remove();
                }, 0); // do not remove, zero second time out required
            });

            $('#concept-frame').off('load.newspaper').on('load.newspaper', function () {
                util.ajaxStop();
            });


            window.closePreview = function () {
                $('#close-newspaper-modal-icon').trigger('click');
            };
        }

        function showNewspaper(src, filters, isRecommendation) {
            if (!src) {
                ModalView.alert('Sorry, we are not able to show you the newspaper for this concept right now. Please try again later or contact our support team.');
                return;
            }
            util.ajaxStart();
            require(['text!groups/templates/concept.newspaper.html'], function (template) {
                src = src + (filters ? '&amp;filters=' + filters : '');
                template = template.replace(/@@src@@/g, src);
                $('body').prepend(template);
                if (isRecommendation) {
                  $('#close-newspaper-modal-icon').hide();
                  $('#close-newspaper-modal-arrow').show();

                  $('#close-newspaper-modal-arrow').off('click.closenewspaper').on('click.closenewspaper', function() {
                      //switch to assignment-recommendation modal
                      $('#assignment-recommendation-modal-hidden').trigger('click');
                  });
                } else {
                    $('#close-newspaper-modal-icon').show();
                    $('#close-newspaper-modal-arrow').hide();
                }
                $('#newsPaperLink').trigger('click');
                bindEventsForNewspaper();
            });
        }

        function getConceptList(isRecommendation) {
            var concepts = '';
            $('#add-concept-container').find('.add-concept').each(function (index) {
                //Ignore quizes when generating input for recommendations
                if ($(this).attr('data-concept-collection-handle') || !isRecommendation ) {
                    if (concepts.length > 0) {
                      concepts += ',';
                    }
                    concepts += $(this).attr('data-encodedid').replace(/\-/g, '.');
                }
                //if ($(this).attr('data-concept-collection-handle') && ! isRecommendation) {
                if ($(this).attr('data-concept-collection-handle')) {
                    concepts += '||' + $(this).attr('data-concept-collection-handle') + '|' + $(this).attr('data-collection-creator-ID');
                }
            });
            return concepts;
        }

        function getRecommendedConceptList() {
            var concepts = [];
            $('#recommended-concept-list').find('.select-concept-wrapper').each(function () {
                if ($(this).find('input').is(':checked')){
                    concepts.push( $(this).attr('data-encodedid').replace(/\-/g, '.'));
                }
            });
            return concepts.join();
        }

        function showDuplicateNameError() {
            var This;
            if ($('#closeAssignmentModal').is(':visible')) {
                $('#assignment-create-wrong-error').removeClass('hide');
                This = $('#assignment-name-input');
            } else {
                $('#assignment-edit-wrong-error').removeClass('hide');
                This = $('#assignment-name-edit');
            }
            This.addClass('input-error2');
            This.val('');
        }

        function saveComplete(assignment) {
            if ($('#closeAssignmentModal').is(':visible')) {
                $('#closeAssignmentModal').find('.close-reveal-modal').trigger('click');
            }
            if ($('#close-assignment-modal-text').is(':visible')) {
                $('#save-assignment').addClass('js-disabled');
                $('#close-assignment-modal').addClass('js-disabled');
                location.href = redirect_link || $('#group-assignments-link')[0].href;
            } else {
                isSaved = true;
                if ($('#new-assignment').is(':visible')) {
                    $('#new-assignment').addClass('hide');
                    $('#saved-assignment').removeClass('hide');
                    $('#save-assignment').addClass('disabled').addClass('js-disabled');
                    $('#assignment-name').text(assignment.name || '');
                    $('#assignment-name').attr('data-id', assignment.id || '');
                }
            }
        }

        function closeAssignmentModal() {
          $('#close-assignment-modal').trigger('click');
        }

        function updateComplete(assignment, id) {
            if (redirect_link) {
                $('#save-assignment').addClass('js-disabled');
                $('#close-assignment-modal').addClass('js-disabled');
                location.href = redirect_link;
            }
            var name = assignment.name || '';
            if ($('#closeConfirmModal').is(':visible')) {
                $('#close-confirm-modal-back').trigger('click');
            } else if ($('#assignment-name-edit').is(':visible')) {
                if (id) {
                    $('#' + id).find('.js-assignment-name').text(name).parent().parent().attr('title', name);
                    $('#' + id).find('.js-edit-assignment').attr('data-assignmentname', name);
                }
                $('#assignment-name').text(name);
                $('#assignment-name-edit-cancel').trigger('click');
            } else {
                isSaved = true;
                $('#save-assignment').addClass('disabled').addClass('js-disabled');
            }
        }

        function saveAssignment() {
            var assignment = {};
            assignment.concepts = getConceptList();
            assignment.name = $.trim($('#assignment-name-input').val());
            assignment.assign = $('#close-assignment-assign-to-class')[0].checked;
            assignment.due = $('#close-assignment-due-date').val();
            assignment.group_id = $('#group-home-link').attr('href').split('/')[2];
            if (assignment.assign) {
              AssignmentEditController.createAndAssignAssignment(assignment);
            } else {
              AssignmentEditController.createAssignment(assignment);
            }
        }

        function updateAssignment() {
            if ($('#assignmentRecommendationModal').is(':visible')) {
              $('#assignmentRecommendationModal').find('.close-reveal-modal').trigger('click');
            }
            var assignment = {};
            assignment.concepts = getConceptList();
            AssignmentEditController.updateAssignment(assignment, $('#assignment-name').attr('data-id'));
        }

        function checkForAllSelection() {
            if ($('.js-concept-select:visible').not('.selected').length) {
                $('.js-toggle-select-concepts:visible').text('Select All');
            } else {
                $('.js-toggle-select-concepts:visible').text('Select None');
            }
        }

        function checkForAddition() {
            var concepts = $('#add-concept-container').find('.js-add-concept-delete').length;
            if (concepts) {
                isBack = false;
                $('#add-concept-container').removeClass('hide');
                $('#no-concept-container').addClass('hide');
                $('#save-assignment').removeClass('disabled').removeClass('js-disabled');
                $('#done-assignment').removeClass('disabled').removeClass('js-disabled');
            } else {
                $('#save-assignment').addClass('disabled').addClass('js-disabled');
                $('#done-assignment').addClass('disabled').addClass('js-disabled');
                $('#add-concept-container').addClass('hide');
                isBack = true;
                if ($('#new-assignment').is(':visible')) {
                    $('#no-concept-container').addClass('hide');
                } else {
                    $('#no-concept-container').removeClass('hide');
                }
            }
            $('.js-concept-count').text(concepts);
        }

        function addConceptToAssignment(This) {
            require(['text!groups/templates/concept.add.row.html'], function (artifactTemplate) {
                if ($('.js-add-concepts-wrapper').find('[data-encodedID=' + This.attr('data-encodedID') + ']').length) {
                    // we have duplicate concept in the added list
                    This.find('.js-concept-check').prop('checked', false);
                    This.removeClass('selected');
                    This.removeClass('js-disabled');
                    return;
                }
                var icon = This.attr('data-realm') ? 'quiz' : This.attr('data-parent-handle').toLowerCase().replace(/\s+/g, '-');
                artifactTemplate = artifactTemplate.replace(/@@conceptName@@/g, escapeHTML(This.find('.js-concept-name').text()));
                artifactTemplate = artifactTemplate.replace(/@@conceptEID@@/g, This.attr('data-encodedID'));
                artifactTemplate = artifactTemplate.replace(/@@icon@@/g, icon);
                artifactTemplate = artifactTemplate.replace(/@@conceptCollectionHandle@@/g, This.attr('data-concept-collection-handle') ?
                    This.attr('data-concept-collection-handle').toLowerCase() : '');
                artifactTemplate = artifactTemplate.replace(/@@collectionCreatorID@@/g, This.attr('data-collection-creator-ID') || '');
                if (This.attr('data-recommendedConcept')) {
                  artifactTemplate = artifactTemplate.replace(/@@recommendation@@/g, 'recommended-concept-item');
                } else {
                  artifactTemplate = artifactTemplate.replace(/@@recommendation@@/g, '');
                }
                $('.js-add-concepts-wrapper').append(artifactTemplate);
                checkForAddition();
                This.removeClass('js-disabled');
            });
        }

        function addConcept(This) {
            if (!(This.hasClass('js-disabled'))) {
                This.addClass('js-disabled').toggleClass('selected');
                if (This.hasClass('selected')) {
                    This.find('.js-concept-check').prop('checked', true);
                    addConceptToAssignment(This);
                } else {
                    This.find('.js-concept-check').prop('checked', false);
                    $('.js-add-concepts-wrapper').find('[data-encodedID="' + This.attr('data-encodedID') + '"]').remove();
                    checkForAddition();
                    This.removeClass('js-disabled');
                }
                checkForAllSelection();
            }
        }

        function handleDuplicateConceptAddition(concepts) {
            var duplicateConcept,
                hasDuplicateConcept = false,
                errorMessage,
                eid,
                addedConcept = {};

            $.each(concepts, function () {
                eid = $(this).attr('data-encodedID');
                duplicateConcept = $('.js-add-concepts-wrapper').find('[data-encodedID=' + eid + ']');
                if (duplicateConcept.length || addedConcept[eid]) {
                    hasDuplicateConcept = true;
                } else {
                    addedConcept[eid] = $(this).find('.js-concept-name')[0].innerHTML;
                }
            });

            if (hasDuplicateConcept) {
                ModalView.alert('Two or more of your chosen Concepts are designed to help teach ' +
                    'very similar topics, therefore the practice questions for them are shared, ' +
                    'and may only be added to this assignment once.');
                if (window._ck12) {
                    _ck12.logEvent('FBS_USER_ACTION', {
                        'memberID': window.ads_userid,
                        'desc': 'assignment_duplicate_concept_added'
                    });
                }
                return false;
            }
            return true;
        }

        function bindEventsConceptSelection() {
            $('.js-concept-newspaper').off('click.newspaper').on('click.newspaper', function () {
                var This = $(this).parents('.js-concept-select');
                var url = '';
                var isRecommendation = This.attr('data-recommendedConcept');
                var collectionAware = false;
                if (This.attr('data-realm')) { //it is a quiz
                    showNewspaper('/assessment/ui/?test/view/quiz/' + This.attr('data-handle') + '/' + This.attr('data-realm') + '?type=quiz&preview=true', '', isRecommendation);
                } else {
                    url = ('/embed/#module=concept&amp;handle=' + This.attr('data-handle') + '&amp;branch=' + This.attr('data-parent-handle') + '&amp;nochrome=true');
                    if (This.attr('data-collection-handle')) {
                        url += '&amp;collectionHandle=' + This.attr('data-collection-handle');
                        collectionAware = true;
                    }
                    if (This.attr('data-concept-collection-absolute-handle')) {
                        url += '&amp;conceptCollectionAbsoluteHandle=' + This.attr('data-concept-collection-absolute-handle');
                        collectionAware = true;
                    }
                    if (This.attr('data-collection-creator-ID')) {
                        url += '&amp;collectionCreatorID=' + This.attr('data-collection-creator-ID');
                    } else if (collectionAware) {
                        url += '&amp;collectionCreatorID=' + '3'; //default collection creator ID
                    }
                    url = (This.data('concept-collection-handle') ? url + '&amp;collectionHandle=' + This.data('concept-collection-handle').split("-::-")[0] : url);
                    showNewspaper(url, '', isRecommendation);
                }
            });
            $('.js-concept-check').off('change.concept').on('change.concept', function () {
                if (//!($(this).parents('.js-concept-select').hasClass('js-disabled')) &&
                    !($(this).parents('.js-concept-select').hasClass('selected'))) {
                        handleDuplicateConceptAddition($(this).parents('.js-concept-select'));
                }
                addConcept($(this).parents('.js-concept-select'));
            });
            $('.js-concept-select').off('click.concept').on('click.concept', function (e) {
                if (!($(e.target).hasClass('js-concept-newspaper') || $(e.target).closest('.custom-box').length)) {
                    addConcept($(this));
                }
            });
            $('.js-toggle-select-concepts').off('click.concept').on('click.concept', function () {
                if ('Select All' === $(this).text()) {
                    handleDuplicateConceptAddition($('.js-concept-select:visible').not('.selected'));
                    $('.js-concept-select:visible').not('.selected').trigger('click');
                } else {
                    $('.js-concept-select.selected:visible').trigger('click');
                }
            });
            $('.js-concept-radio').off('click.concept').on('click.concept', function () {
                if ($('#practice-radio').is(':checked')) {
                    $('.js-no-practice').addClass('hide');
                } else {
                    $('.js-no-practice').removeClass('hide');
                }
                checkForNoPracticeConcept();
                checkForAllSelection();
                $('#concept-heading').find('.concept-count').text($('.js-concept-select:visible').length + ' concepts');
            });
            $('#no-concept-link').off('click.concept').on('click.concept', function () {
                // click on "all concepts" radio box
                $('#all-radio').prop('checked', true);
                $('.js-no-practice').removeClass('hide');
                checkForNoPracticeConcept();
                checkForAllSelection();
                $('#concept-heading').find('.concept-count').text($('.js-concept-select:visible').length + ' concepts');
            });
        }

        function createConceptRowTemplate(concepts, level) {
            var i = 0,
                len = 0,
                count = 0,
                practiceCount = 0,
                template = '';
            var parentHandle, eID, nextLevelConcepts, collectionHandle;
            var returnTemplate;

            for (i, len = concepts.length; i < len; i++) {
                collectionHandle = concepts[i].handle.split('-::-')[0];

                eID = (concepts[i].encodedID || '').replace(/\./g, '-');
                if (eID) {
                    count++;
                    parentHandle = util.getBranchName(concepts[i].encodedID).replace(/ /g, '-');
                    if(concepts[i].hasPractice){
                        practiceCount++;
                    }
                } else {
                    parentHandle = collectionHandle;
                }
                //Check if we have to drill down to get next level concepts
                nextLevelConcepts = concepts[i].contains;
                if (eID || nextLevelConcepts) {
                    template += conceptTemplate({
                        'realm': '',
                        'conceptName': escapeHTML(concepts[i].title || ''),
                        'handle': eID ? (concepts[i].conceptHandle || '') : '',
                        'conceptCollectionHandle': concepts[i].handle || '',
                        'conceptCollectionAbsoluteHandle': concepts[i].absoluteHandle || '',
                        'collectionCreatorID': concepts[i].creatorID || '',
                        'parentHandle': parentHandle, // This is the branch handle
                        'collectionHandle': collectionHandle,
                        'encodedID': eID,
                        'conceptLevel': level,
                        'assignmentConceptIcon': concepts[i].hasPractice || concepts[i].practiceCount ? 'practice-concept-icon' : 'js-no-practice hide',
                        'isPracticeConcept': concepts[i].hasPractice || concepts[i].practiceCount ? '' : 'js-no-practice hide',
                        'artifactID': concepts[i].handle.split('-::-').join('_'),
                        'isChecked': $('.js-add-concepts-wrapper').find('[data-encodedID="' + eID + '"]').length ? 'checked' : ''
                    });
                }
                // Drill down to generate child concepts
                if (!eID && nextLevelConcepts) {
                    returnTemplate = createConceptRowTemplate(nextLevelConcepts, level + 1);
                    template += returnTemplate.template;
                    count += returnTemplate.conceptCount;
                    practiceCount += returnTemplate.practiceCount;
                }
            }

            return {
                'template': template,
                'conceptCount': count,
                'practiceCount': practiceCount
            };
        }

        function renderConcepts(concepts) {
            var conceptTemplate = createConceptRowTemplate(concepts, 1);
            if ($('.js-search-open').is(':visible')) {
                $('#concept-heading').html($('#tracks-wrapper').find('.js-selected').html());
                $('#concepts-wrapper').html(conceptTemplate.template);
                $('#concept-heading').find('.concept-count').text(conceptTemplate.practiceCount + ' concepts');
                checkForNoPracticeConcept();
            } else {
                searchBackHTML = $('<div>' + searchBackHTML + '</div>');
                searchBackHTML.find('#concepts-wrapper').html(conceptTemplate.template);
                searchBackHTML.find('#concept-heading').html($('#tracks-wrapper').find('.js-selected').html());
                searchBackHTML.find('#concept-heading').find('.concept-count').text(conceptTemplate.practiceCount + ' concepts');
                searchBackHTML = searchBackHTML.html();
            }
            $('.js-concept-check:checked').parents('.js-concept-select').addClass('selected');
            checkForAllSelection();
            $('#practice-radio').prop('checked', true);
            bindEventsConceptSelection();
        }

        function renderTracks(tracks) {
            var count,
                template = '';
            tracks = tracks.contains;
            $('#branch-name').text($('#branch-name-header').attr('data-text'));
            require(['text!groups/templates/concept.tracks.row.html'], function (trackTemplate) {
                _.each(tracks, function (track) {
                    count = track.contains ? track.conceptCount : 0;
                    if (count) {
                        template += trackTemplate;
                        template = template.replace(/@@conceptCount@@/g, count);
                        template = template.replace(/@@trackName@@/g, track.title || '');
                        template = template.replace(/@@trackImage@@/g, track.previewImageUrl || '/media/images/modality_generic_icons/topic_gicon.svg');
                        template = template.replace(/@@hasTrackImage@@/g, track.previewImageUrl ? '' : 'no-track-image');
                        template = template.replace(/@@encodedID@@/g, track.handle || '');
                    }
                });
                $('#tracks-wrapper').html(template);
            });
        }

        function renderDescendants(tracks, modalityCount) {
            var itemsToRemove = [],
                conceptCount, i;
            if (1 === $('.js-group-assignment-nav.selected').index()) {
                collection = tracks;
                // Iterate through the collection and delete concepts without modalities
                _.each(collection.contains, function (topic, index) {
                    conceptCount = refineTopic(topic, modalityCount);
                    if (!conceptCount.count) {
                        itemsToRemove.push(index);
                    }
                });
                // Remove concepts without modality
                while ((i = itemsToRemove.pop()) !== undefined) {
                    collection.contains.splice(i, 1);
                }
                renderTracks(collection);
            } else {
                renderConcepts(tracks.contains);
            }
        }

        function renderBranches(subjects, id) {
            require(['text!groups/templates/subject.row.html'], function (subjectTemplate) {
                var index, name,
                    template = '';
                for (index = 0; index < subjects.length; index++) {
                    template += subjectTemplate;
                    template = template.replace(/@@small@@/g, 12);
                    template = template.replace(/@@large@@/g, 6);
                    name = subjects[index].name || '';
                    template = template.replace(/@@title@@/g, name);
                    name = name.toLowerCase().replace(/[\s]+/g, '-');
                    template = template.replace(/@@icon@@/g, name);
                    template = template.replace(/@@encodedID@@/g, (subjects[index].subjectID || '') + '.' + (subjects[index].shortname || ''));
                }
                util.ajaxStop();
                $('#groups-assignments-subject-' + id).append(template);
            });
        }

        function prepareCloseAssignmentModal() {
          $('#close-assignment-due-date-wrapper').addClass('hide');
          $('#close-assignment-due-date').removeClass('hasDatepicker');
          $('#close-assignment-due-date').datepicker({
                minDate: 0,
                dayNamesMin: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
            });
          $('#close-assignment-due-date').off('focus.date').on('focus.date',function(){
            $('.ui-datepicker-prev').addClass('icon-arrow_left');
            $('.ui-datepicker-next').addClass('icon-arrow_right');
          });
          $('#close-assignment-due-date').off('change.date').on('change.date', function(){
            //validation if this is a proper format of due date or not
        	var dueDate = $(this).val(),
        	    dateObj = '';

        	if (dueDate.trim().length === 0) {
        	    $(this).val('');
        	    return false;
        	}

        	if (!isValidDate(dueDate)) {
        	    $(this).addClass("input-error2").val("");
        	    $('#assignment-create-wrong-date-error').removeClass('hide');
                $('#assignment-create-wrong-date-error').text('Please enter correct date.');
                hasDateError = true;
        	    return false;
        	}

        	dateObj = new Date(dueDate);

        	if (datePeriodCheck(dateObj)) {
        	    $(this).removeClass("input-error2");
        	    $('#assignment-create-wrong-date-error').addClass('hide');
                $('#assignment-create-wrong-date-error').text('');
                hasDateError = false;
        	} else {
        	    $(this).addClass("input-error2").val("");
        	    $('#assignment-create-wrong-date-error').removeClass('hide');
                $('#assignment-create-wrong-date-error').text('Due date can not be in past & can be only max 2 years in future!');
                hasDateError = true;
        	}

        	function datePeriodCheck(date) {
        	    var maxDate = new Date(),
        	        today = new Date();

        	    maxDate.setHours(0, 0, 0, 0);
        	    today.setHours(0, 0, 0, 0);

        	    maxDate.setFullYear(maxDate.getFullYear() + 2);
        	    if (date >= today && date <= maxDate) {
        	        return true;
        	    }
        	    return false;
        	}

        	function isValidDate(s) {
        	    var bits = s.split('/'),
        	        d = "";

        	    if (bits.length !== 3 || bits[0].length > 2 || bits[1].length > 2 || bits[2].length > 4) {
        	        return false;
        	    }
        	    d = new Date(bits[2], bits[0] - 1, bits[1]); //format is mm/dd/yyyy
        	    return d && (d.getMonth() + 1) == bits[0];
        	}
          });
          $('#close-assignment-assign-to-class')[0].checked = false;
          $('#close-assignment-due-date')[0].value = '';
          $('#close-assignment-assign-to-class').off('click.assign').on('click.assign', function() {
            if ($('#close-assignment-due-date-wrapper').hasClass('hide')) {
              $('#close-assignment-due-date-wrapper').removeClass('hide');
            } else {
              $('#close-assignment-due-date-wrapper').addClass('hide');
            }
          });
          var group_name = $('#group-name').text();
          $('#assignment-assign-to-class-text').html('Assign to group <b>' + group_name +'</b>:');
          $('#assignment-name-input').removeClass('input-error2').val('');
          $('.js-create-assignment-error').addClass('hide');
        }

        function continueToCloseAssignmentModal(create_new_quiz){
          if (typeof create_new_quiz === 'undefined') {
              $('#save-assignment-modal-text').removeClass('hide');
              $('#close-assignment-modal-text').addClass('hide');
          } else {
            $('#save-assignment-modal-text').addClass('hide');
            $('#close-assignment-modal-text').removeClass('hide');
          }

          prepareCloseAssignmentModal();
          $('#close-assignment-modal-back').text('Cancel');
          $('#close-assignment-modal-hidden').trigger('click');
        }

        function renderRecommendations(result, update) {
            update = (typeof update !== 'undefined')? update : false;
            var concepts = result.response;
            if (typeof concepts.message !== 'undefined' || concepts.length === 0) {
                if (update) {
                    updateAssignment();
                } else {
                    continueToCloseAssignmentModal();
                }
            } else {
              var template = '';
              var conceptEIDs = [];
              require(['text!groups/templates/assignment.recommendation.row.html'], function (artifactTemplate) {
                for (var index = 0; index < concepts.length; index++) {
                    var concept = concepts[index];
                    conceptEIDs.push(concept.encodedID);
                    template += artifactTemplate;
                    var temp = escapeHTML(concept.name || concept.title || '');
                    temp += concept.hasOwnProperty('branch') ? ' (' + (concept.branch.name || '') + ')' : '';
                    template = template.replace(/@@conceptName@@/g, temp);
                    template = template.replace(/@@handle@@/g, concept.absoluteHandle || '');
                    if (concept.hasOwnProperty('modalityCount') && concept.modalityCount.hasOwnProperty('asmtpractice')) {
                        template = template.replace(/@@assignmentConceptIcon@@/g, 'practice-concept-icon');
                        template = template.replace(/@@isPracticeConcept@@/g, '');
                    } else {
                        template = template.replace(/@@assignmentConceptIcon@@/g, 'all-concept-icon');
                        template = template.replace(/@@isPracticeConcept@@/g, 'js-no-practice');
                    }
                    temp = (concept.encodedID || '').replace(/\./g, '-');
                    template = template.replace(/@@encodedID@@/g, temp);
                    template = template.replace(/@@artifactID@@/g, (concept._id || ''));
                    temp = $('.js-add-concepts-wrapper').find('[data-encodedID="' + temp + '"]').length ? 'checked' : '';
                    template = template.replace(/@@isChecked@@/g, temp);
                    temp = 'domain' === concept.type ? '' : concept.realm || '';
                    template = template.replace(/@@realm@@/g, temp);
                    template = template.replace(/@@subjectName@@/g, concept.collection.handle);
                    if (index > 3) {
                      template = template.replace(/@@showMoreState@@/g, "additional-concepts additional-concept-hide");
                    } else {
                      template = template.replace(/@@showMoreState@@/g, "");
                    }
                    temp = concept.hasOwnProperty('domain') ? concept.domain : concept;
                    if (temp.collection && temp.collection.handle) {
                    	template = template.replace(/@@parentHandle@@/g, temp.collection.handle || '');
                    } else if (temp.hasOwnProperty('branch')) {
                        template = template.replace(/@@parentHandle@@/g, temp.branch.handle || '');
                    } else {
                        template = template.replace(/@@parentHandle@@/g, '');
                    }
                    template = template.replace(/@@conceptCollectionHandle@@/g, concept.handle);
                    template = template.replace(/@@collectionCreatorID@@/g, concept.collection.creatorID);
                }
                $('#recommended-concept-list').html(template);
                if (window._ck12) {
                    window._ck12.logEvent('FBS_RECOMMENDATION', {
                        "memberID": ads_userid,
                        "product": 'assignment',
                        "feature": (update ? 'editing': 'creation'),
                        "recs": conceptEIDs.join()
                    });
                }
                bindEventsConceptSelection();
              });
              // See more
              $('#assignment-recommendation-more-wrapper').hide();
              if (concepts.length > 3) {
                $('#assignment-recommendation-more-wrapper').off('click.more').on('click.more', function () {
                    if ($('#assignment-recommendation-more-text').text() === 'See More') {
                      $('#assignment-recommendation-more-text').text('See Less');
                      $('#assignment-recommendation-more-arrow-icon').removeClass('icon-arrow3-down').addClass('icon-arrow3-up');
                      $('.additional-concepts').removeClass('additional-concept-hide');
                    } else {
                      $('#assignment-recommendation-more-text').text('See More');
                      $('#assignment-recommendation-more-arrow-icon').removeClass('icon-arrow3-up').addClass('icon-arrow3-down');
                      $('.additional-concepts').addClass('additional-concept-hide');
                    }
                });
                $('#assignment-recommendation-more-wrapper').show();
              }
              //Click next
              $('#assignment-recommendation-modal-next').off('click.next').on('click.next', function() {
                if (window._ck12) {
                    window._ck12.logEvent('FBS_RECOMMENDATION_ACTION', {
                        "memberID": ads_userid,
                        "product": 'assignment',
                        "feature": (update ? 'editing': 'creation'),
                        "actionType": 'select',
                        "recsSelected": getRecommendedConceptList()
                    });
                }
                if (update) {
                  updateAssignment();
                } else {
                  continueToCloseAssignmentModal();
                }
              });
              $('#assignment-recommendation-modal-hidden').trigger('click');
            }
        }

        function checkForConceptChanged() {
            $('.js-concept-select').removeClass('selected').find('.js-concept-check').prop('checked', false);
            $('.js-add-concepts-wrapper:visible').find('.js-add-concept-delete').each(function () {
                $('.js-concept-select[data-encodedID="' + $(this).parent().attr('data-encodedID') + '"]').addClass('selected').find('.js-concept-check').prop('checked', true);
            });
        }

        function bindEventsPagination() {
            $('.js-search-pagination').children(':first').off('click.prev').on('click.prev', function () {
                if (!($(this).hasClass('disabled'))) {
                    $('.js-search-pagination').children('.number.selected').prev().trigger('click');
                }
            });
            $('.js-search-pagination').children(':last').off('click.next').on('click.next', function () {
                if (!($(this).hasClass('disabled'))) {
                    $('.js-search-pagination').children('.number.selected').next().trigger('click');
                }
            });
            $('.js-search-pagination').off('click.number').on('click.number', '.number', function () {
                AssignmentEditController.search(searchVal, $(this).text());
            });
        }

        function getPagesToShow(total_pages, current) {
            var sidePages, index,
                pages_to_show = {};
            pages_to_show.label = [];
            pages_to_show.value = [];
            if (total_pages < number_of_pages_show + 2) {
                // add 2 for first and last page
                // total pages are less than most to be shown
                for (index = 1; index <= total_pages; index++) {
                    pages_to_show.label.push('number');
                    pages_to_show.value.push(index);
                }
            } else {
                sidePages = Math.floor(number_of_pages_show / 2);
                if (current <= sidePages + 2) {
                    // current page is near to beginning
                    for (index = 1; index <= number_of_pages_show; index++) {
                        pages_to_show.label.push('number');
                        pages_to_show.value.push(index);
                    }
                    if (current === sidePages + 2) {
                        pages_to_show.label.push('number');
                        pages_to_show.value.push(current + 1);
                    }
                    pages_to_show.label.push('dots');
                    pages_to_show.value.push('...');
                    pages_to_show.label.push('number');
                    pages_to_show.value.push(total_pages);
                } else if (current >= total_pages - sidePages - 1) {
                    // current page is near to end
                    pages_to_show.label.push('number');
                    pages_to_show.value.push(1);
                    pages_to_show.label.push('dots');
                    pages_to_show.value.push('...');
                    if (current === total_pages - sidePages - 1) {
                        pages_to_show.label.push('number');
                        pages_to_show.value.push(current - 1);
                    }
                    for (index = total_pages - number_of_pages_show + 1; index <= total_pages; index++) {
                        pages_to_show.label.push('number');
                        pages_to_show.value.push(index);
                    }
                } else {
                    // current page is somewhere in middle
                    pages_to_show.label.push('number');
                    pages_to_show.value.push(1);
                    pages_to_show.label.push('dots');
                    pages_to_show.value.push('...');
                    for (index = current - sidePages; index <= current + sidePages; index++) {
                        pages_to_show.label.push('number');
                        pages_to_show.value.push(index);
                    }
                    pages_to_show.label.push('dots');
                    pages_to_show.value.push('...');
                    pages_to_show.label.push('number');
                    pages_to_show.value.push(total_pages);
                }
            }
            return pages_to_show;
        }

        function renderSearchPagination(total, offset) {
            total = Math.ceil(total / searchPageSize);
            offset = (offset / searchPageSize) + 1;
            var index, html = '';
            total = getPagesToShow(total, offset);
            for (index = 0; index < total.label.length; index++) {
                html += '<a class="' + total.label[index] + (total.value[index].toString() === offset.toString() ? ' selected' : '') + '">' + total.value[index] + '</a>';
            }
            return html;
        }

        function renderSearch(result) {
            var temp, index, template = '', collectionData, collectionIndex, len, foundCanonical, templateCopy;
            result = result.Artifacts;
            $('.js-search-pagination').addClass('hide').children('.number').remove().end().children('.dots').remove().end().children('.search_pagination_arrow').addClass('disabled');
            if (result.total > searchPageSize) {
                $('.js-search-pagination').removeClass('hide').children(':first').after(renderSearchPagination(result.total, result.offset));
                if (0 !== result.offset) {
                    $('.js-search-pagination').children(':first').removeClass('disabled');
                }
                if (result.offset + searchPageSize < result.total) {
                    $('.js-search-pagination').children(':last').removeClass('disabled');
                }
            }
            if ($('.js-search-close').is(':visible')) {
                $('#assignment-empty-search-container').removeClass('hide');
                $('#assignment-search-suggestion').parent().removeClass('hide');
                if (result.result instanceof Array && result.result.length) {
                    result = result.result;
                    require(['text!groups/templates/concept.row.html'], function (artifactTemplate) {
                        for (index = 0; index < result.length; index++) {
                            if ((result[index].ck12ModalityCount !== 0 && !$.isEmptyObject(result[index].ck12ModalityCount)) || 'asmtquiz' === result[index].artifactType) {
                                template += artifactTemplate;
                                temp = escapeHTML(result[index].name || result[index].title || '');
                                collectionData = result[index].collections;
                                foundCanonical = false;
                                if (collectionData && collectionData.length) {
                                    templateCopy = template;
                                    for (collectionIndex = 0, len = collectionData.length; collectionIndex < len; collectionIndex++) {
                                        if(collectionData[collectionIndex].isCanonical && collectionData[collectionIndex].exactMatch){
                                            template = templateCopy;
                                            temp = (escapeHTML(collectionData[collectionIndex].conceptCollectionTitle) || temp) + ' (' + (collectionData[collectionIndex].collectionTitle || '') + ')';
                                            template = template.replace(/@@collectionHandle@@/g, collectionData[collectionIndex].collectionHandle);
                                            if (collectionData[collectionIndex].conceptCollectionHandle) {
                                                template = template.replace(/@@conceptCollectionHandle@@/g, collectionData[collectionIndex].conceptCollectionHandle);
                                            } else if (collectionData[collectionIndex].collectionHandle && collectionData[collectionIndex].conceptCollectionAbsoluteHandle) {
                                                template = template.replace(/@@conceptCollectionHandle@@/g, collectionData[collectionIndex].collectionHandle + '-::-' + collectionData[collectionIndex].conceptCollectionAbsoluteHandle);
                                            } else {
                                                template = template.replace(/@@conceptCollectionHandle@@/g, '');
                                            }
                                            template = template.replace(/@@collectionCreatorID@@/g, collectionData[collectionIndex].collectionCreatorID || '');
                                            // bring modality data to root level
                                            result[index].modalityCount = collectionData[collectionIndex].ck12ModalityCount;
                                            for (var modality in collectionData[collectionIndex].communityModalityCount) {
                                                if (result[index].modalityCount[modality]) {
                                                    result[index].modalityCount[modality]['at grade'] = (result[index].modalityCount[modality]['at grade'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['at grade'] || 0);
                                                    result[index].modalityCount[modality]['basic'] = (result[index].modalityCount[modality]['basic'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['basic'] || 0);
                                                } else {
                                                    result[index].modalityCount[modality] = collectionData[collectionIndex].communityModalityCount[modality];
                                                }
                                            }
                                            foundCanonical = true;
                                            break;
                                        } else if (collectionData[collectionIndex].isCanonical && !foundCanonical) {
                                            template = templateCopy;
                                            temp = (escapeHTML(collectionData[collectionIndex].conceptCollectionTitle) || temp) + ' (' + (collectionData[collectionIndex].collectionTitle || '') + ')';
                                            template = template.replace(/@@collectionHandle@@/g, collectionData[collectionIndex].collectionHandle);
                                            if (collectionData[collectionIndex].conceptCollectionHandle) {
                                                template = template.replace(/@@conceptCollectionHandle@@/g, collectionData[collectionIndex].conceptCollectionHandle);
                                            } else if (collectionData[collectionIndex].collectionHandle && collectionData[collectionIndex].conceptCollectionAbsoluteHandle) {
                                                template = template.replace(/@@conceptCollectionHandle@@/g, collectionData[collectionIndex].collectionHandle + '-::-' + collectionData[collectionIndex].conceptCollectionAbsoluteHandle);
                                            } else {
                                                template = template.replace(/@@conceptCollectionHandle@@/g, '');
                                            }
                                            template = template.replace(/@@collectionCreatorID@@/g, collectionData[collectionIndex].collectionCreatorID || '');
                                            // bring modality data to root level
                                            result[index].modalityCount = collectionData[collectionIndex].ck12ModalityCount;
                                            for (var modality in collectionData[collectionIndex].communityModalityCount) {
                                                if (result[index].modalityCount[modality]) {
                                                    result[index].modalityCount[modality]['at grade'] = (result[index].modalityCount[modality]['at grade'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['at grade'] || 0);
                                                    result[index].modalityCount[modality]['basic'] = (result[index].modalityCount[modality]['basic'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['basic'] || 0);
                                                } else {
                                                    result[index].modalityCount[modality] = collectionData[collectionIndex].communityModalityCount[modality];
                                                }
                                            }
                                            foundCanonical = true;
                                        }
                                    }
                                }
                                if(!foundCanonical) {
                                    // Fallback mechanism to display branch name instead
                                    // if collection info is not present in result
                                    template = template.replace(/@@collectionHandle@@/g, '');
                                    template = template.replace(/@@conceptCollectionHandle@@/g, '');
                                    template = template.replace(/@@collectionCreatorID@@/g, '');
                                    temp += result[index].hasOwnProperty('branchInfo') ? ' (' + (result[index].branchInfo.name || '') + ')' : '';
                                }
                                template = template.replace(/@@conceptName@@/g, temp);
                                template = template.replace(/@@handle@@/g, result[index].handle || '');
                                if (result[index].hasOwnProperty('modalityCount') && result[index].modalityCount.hasOwnProperty('asmtpractice')) {
                                    template = template.replace(/@@assignmentConceptIcon@@/g, 'practice-concept-icon');
                                    template = template.replace(/@@isPracticeConcept@@/g, '');
                                } else {
                                    template = template.replace(/@@assignmentConceptIcon@@/g, 'all-concept-icon');
                                    template = template.replace(/@@isPracticeConcept@@/g, 'js-no-practice @@isHide@@');
                                }
                                temp = (result[index].encodedID || '').replace(/\./g, '-');
                                template = template.replace(/@@encodedID@@/g, temp);
                                template = template.replace(/@@artifactID@@/g, (result[index].id || ''));
                                temp = $('.js-add-concepts-wrapper').find('[data-encodedID="' + temp + '"]').length ? 'checked' : '';
                                template = template.replace(/@@isChecked@@/g, temp);
                                temp = 'domain' === result[index].type ? '' : result[index].realm || '';
                                template = template.replace(/@@realm@@/g, temp);
                                temp = result[index].hasOwnProperty('domain') ? result[index].domain : result[index];
                                if (temp.hasOwnProperty('branchInfo')) {
                                    template = template.replace(/@@parentHandle@@/g, temp.branchInfo.handle || '');
                                } else {
                                    template = template.replace(/@@parentHandle@@/g, '');
                                }
                            }
                        }
                        if ($('#practice-radio').is(':checked')) {
                            template = template.replace(/@@isHide@@/g, 'hide');
                        } else {
                            template = template.replace(/@@isHide@@/g, '');
                        }
                        $('#concepts-wrapper').html(template);
                        $('.js-search-heading').removeClass('hide');
                        $('.js-concept-check:checked').parents('.js-concept-select').addClass('selected');
                        checkForNoPracticeConcept();
                        checkForAllSelection();
                        bindEventsConceptSelection();
                        bindEventsPagination();
                    });
                } else {
                    result = result.suggestions;
                    $('#concept-heading').parent().addClass('assignment-search-no-padding');
                    require(['text!groups/templates/groups.assignment.search.empty.html'], function (template) {
                        $('#concept-heading').html(template);
                        if (searchVal && result[searchVal] && result[searchVal][0] !== searchVal) {
                            $('#assignment-search-suggestion').text(result[searchVal][0]);
                            AssignmentEditController.search(result[searchVal][0]);
                            searchVal = '';
                        } else {
                            $('#assignment-empty-search-container').removeClass('hide');
                        }
                    });
                }
            }
        }

        function checkForDescendantError(subjects) {
            if ('error' === subjects) {
                if (!errorShown) {
                    errorShown = true;
                    ModalView.alert('Sorry, we could not load the subjects right now. Please try again after some time.');
                }
                return true;
            }
            if (subjects.hasOwnProperty('response') && subjects.response.hasOwnProperty('message')) {
                if (subjects.response.message.match('No such subject')) {
                    if (!errorShown) {
                        errorShown = true;
                        ModalView.alert('Sorry, the subject you are trying to load does not exist.');
                    }
                } else if (!errorShown) {
                    errorShown = true;
                    ModalView.alert('Sorry, we could not load the subjects right now. Please try again after some time.');
                }
                return true;
            }
            errorShown = false;
            return false;
        }

        function checkForDescendantsNew(subjects, modalityCount) {
            errorShown = false; //reset
            if (!checkForDescendantError(subjects) && !checkForDescendantError(modalityCount)) {
                subjects = subjects.response;
                modalityCount = modalityCount.response;
                renderDescendants(subjects.collection, modalityCount.featuredModalityTypeCounts);
            }
        }

        /**
         * Function responsible for refining collection data
         * Adds missing data like conceptCount at current root level
         * Also adds conceptHandle to concepts with EID
         * @param {Object} topicOrConcept concept/topic from collection (level 2 to 3,4,..)
         * @param {Object} modalityCount The response of get modality count API for a collection
         * @returns {Object} The conceptCount and prcticeCount the node accomodates
         */
        function refineTopic(topicOrConcept, modalityCount) {
            var count = 0, practiceCount = 0, itemsToRemove = [], i, innerConceptsCount, conceptCollectionHandleCounts;
            if (topicOrConcept.contains) {

                _.each(topicOrConcept.contains, function (concept, index) {
                    if (concept.encodedID) {
                        if (!_.isEmpty(util.get(modalityCount[concept.encodedID], 'conceptCollectionHandleCounts.0.ck12OwnedCounts'))) {
                            concept.conceptHandle = modalityCount[concept.encodedID].handle;
                            count++;
                            conceptCollectionHandleCounts = util.get(modalityCount[concept.encodedID], 'conceptCollectionHandleCounts') || [];
                            conceptCollectionHandleCounts.every(function (item) {
                                if (util.get(item, 'ck12OwnedCounts.asmtpractice') && concept.handle === item.conceptCollectionHandle) {
                                    practiceCount++;
                                    concept.hasPractice = true;
                                    return false;
                                }
                                return true;
                            });
                        }
                        else {
                            itemsToRemove.push(index);
                        }
                    } else {
                        if(concept.contains){
                            innerConceptsCount = refineTopic(concept, modalityCount);
                            if(innerConceptsCount.count === 0){
                                //delete this concept / topic
                                itemsToRemove.push(index);
                            }
                            count += innerConceptsCount.count;
                            practiceCount += innerConceptsCount.practiceCount;
                        }
                    }
                });

                // Remove concepts without modality
                while ((i = itemsToRemove.pop()) !== undefined) {
                    topicOrConcept.contains.splice(i, 1);
                }

                topicOrConcept.conceptCount = count;
                topicOrConcept.practiceCount = practiceCount;
            }
            return {
                count: count,
                practiceCount: practiceCount
            };
        }

        function bindEvents() {
            $('.js-add-concepts-wrapper').sortable({
                'helper': 'clone',
                'handle': '.js_drag_concept',
                'axis': 'y',
                'containment': 'parent',
                'revert': 'invalid',
                'stop': function () {
                    checkForAddition();
                }
            });
            $('#add-quizes').off('click.quiz').on('click.quiz', function () {
                if ($('.js-search-close').is(':visible')) {
                    $('.js-search-close').trigger('click');
                }
                var selectTab = $('[data-target="quizzes-container"]');
                selectTab.prevUntil('[data-target="subjects-container"]').addClass('hide-important').find('span').attr('data-text', '');
                selectTab.trigger('click').removeClass('hide-important').addClass('selected').siblings().removeClass('selected');
                if (!($('#quiz-list-wrapper').children().length)) {
                    AssignmentEditController.getMyQuizes();
                }
            });

            $('.js-search-open').off('click.search').on('click.search', function () {
                visible = $('#groups-assignment-container').children(':visible').not('.add-concept-container');
                visible.addClass('hide');
                $('#concepts-container').removeClass('hide');
                conceptRadioStatus = $('#practice-radio').prop('checked');
                $('#practice-radio').prop('checked', true);
                searchBackHTML = $('#concepts-container').find('.js-list-left').html().trim();
                $('#all-radio').next()[0].childNodes[1].textContent = ' All concepts and quizzes ';
                $('.js-search-heading').addClass('hide');
                $('#concept-heading').empty();
                $('#concepts-wrapper').empty();
                $('#no-practice-concept').addClass('hide');
                $('#assignment-search-input').val('');
                $(this).parents('.assignment-subject-list').addClass('hide').next().removeClass('hide');
            });
            $('.js-search-close').off('click.search').on('click.search', function () {
                $(this).parents('.assignment-search-container').addClass('hide').prev().removeClass('hide');
                $('#concepts-container').addClass('hide');
                visible.removeClass('hide');
                $('.js-search-heading').removeClass('hide');
                $('#concepts-container').find('.js-list-left').html(searchBackHTML);
                $('#all-radio').next()[0].childNodes[1].textContent = ' All concepts ';
                checkForConceptChanged();
                checkForNoPracticeConcept();
                checkForAllSelection();
                bindEventsConceptSelection();
                if (conceptRadioStatus) {
                    $('#practice-radio').prop('checked', true);
                } else {
                    $('#all-radio').prop('checked', true);
                }
            });

            /*$('.js-search').off('click.search').on('click.search', function () {
                searchVal = $.trim($('#assignment-search-input').val());
                $('.js-search-heading').addClass('hide');
                $('#concepts-wrapper').empty();
                $('#concept-heading').empty();
                if (searchVal) {
                    AssignmentEditController.search(searchVal);
                } else {
                    $('#concept-heading').html('<p>Please enter keywords.</p>');
                }
            });
            $('#assignment-search-input').off('keypress.search').on('keypress.search', function (event) {
                if (13 === (event.keyCode || event.which)) {
                    $('.js-search').trigger('click');
                }
            });*/
            $('.js-group-assignment-nav').off('click.nav').on('click.nav', function () {
                $(this).addClass('selected').siblings().removeClass('selected');
                $('#' + $(this).attr('data-target')).removeClass('hide').siblings().not('.add-concept-container').addClass('hide');
            });
            $('#close-assignment-modal').off('click.close').on('click.close', function () {
                if (window.location.href.indexOf('pageType=create') !== -1) {
                    window.history.back();
                } else {
                    redirect_link = '';
                    if (!$(this).hasClass('js-disabled')) {
                        if ($('#save-assignment').hasClass('js-disabled')) {
                            if (isBack && !isSaved) {
                                $('#close-assignment-modal-back').trigger('click');
                            } else {
                                $('#save-assignment').addClass('js-disabled');
                                $('#close-assignment-modal').addClass('js-disabled');
                                location.href = $('#group-assignments-link')[0].href;
                            }
                        } else {
                            if ($('#new-assignment').is(':visible')) {
                                prepareCloseAssignmentModal();
                                $('#save-assignment-modal-text').addClass('hide');
                                $('#close-assignment-modal-text').removeClass('hide');
                                $('#close-assignment-modal-back').text("No, Don't Save");
                                $('#close-assignment-modal-hidden').trigger('click');
                                $('#assignment-name-input').removeClass('input-error2').val('');
                                $('.js-create-assignment-error').addClass('hide');
                            } else {
                                $('#close-confirm-modal-hidden').trigger('click');
                                $('#close-confirm-assignment').text($('#assignment-name').text());
                                $('#close-confirm-assignment')[0].title = $('#assignment-name').text();
                            }
                        }
                    }
                }
            });
            $('#assignment-name-input').off('focus.groups').on('focus.groups', function () {
                $(this).removeClass('input-error2');
                $('.js-create-assignment-error').addClass('hide');
            }).off('change.groups').on('change.groups', function () {
                $(this).removeClass('input-error2');
                $('.js-create-assignment-error').addClass('hide');
            }).off('keypress.save').on('keypress.save', function (e) {
            	var brackets = "{}[]()",
                    key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
                if (brackets.indexOf(key) !== -1) {
                   e.preventDefault();
                   return false;
                } else if (13 === (e.which || e.keyCode)) {
                    $('#close-assignment-modal-save').trigger('click');
                } else {
                    $(this).removeClass('input-error2');
                    $('.js-create-assignment-error').addClass('hide');
                }
            }).off('paste.save').on('paste.save', function () {
                $(this).removeClass('input-error2');
                $('.js-create-assignment-error').addClass('hide');
            });
            $('#close-assignment-modal-back').off('click.back').on('click.back', function () {
                if ($('#closeAssignmentModal').is(':visible')) {
                    $('#closeAssignmentModal').find('.close-reveal-modal').trigger('click');
                }
                if (redirect_link) {
                    $('#save-assignment').addClass('js-disabled');
                    $('#close-assignment-modal').addClass('js-disabled');
                    location.href = redirect_link;
                    return;
                }
                if ($('#save-assignment-modal-text').is(':hidden')) {
                    $('body').removeClass('full-height');
                    $(backContainer).removeClass('hide');
                    $('#assignment-full-page').remove();
                    $('header').removeClass('hide');
                    $('footer').add('.share-plane-container').show();
                    $('#maintenanceWrapper').removeClass('hide');
                }
            });
            $('#close-assignment-modal-save').off('click.save').on('click.save', function () {
                if(hasDateError) {
                    // The date field is already reset. Continue with no due date
                    hasDateError = false;
                    $('#assignment-create-wrong-date-error').addClass('hide');
                    $('#assignment-create-wrong-date-error').text('');
                }
                if ($.trim($('#assignment-name-input').val())) {
                    saveAssignment();
                } else {
                    $('#assignment-name-input').val('');
                    $('#assignment-name-input').addClass('input-error2');
                    $('#assignment-create-empty-error').removeClass('hide');
                }
            });
            $('#groups-assignment-container').off('click.subjects').on('click.subjects', '.js-node-wrapper', function () {
                var This,
                    selectTab,
                    collectionName,
                    conceptIndex,
                    asyncHits = 0,
                    collectionData = null,
                    modalityCount = null;
                This = $(this).find('.js-node-name');
                selectTab = $('.js-group-assignment-nav.selected').next();
                if (This.text() !== selectTab.find('span').attr('data-text')) {
                    $('#practice-radio').prop('checked', true);
                    if (!$('#tracks-container').is(':visible')) {
                        $('#branch-name').empty();
                        collectionName = This.attr('data-collection').split(' ').join('-');
                        AssignmentEditController.getCollection({
                                collectionName: collectionName,
                                includeTaxonomyComposistionsInfo: false
                            },
                            function (collection) {
                                collectionData = collection;
                                asyncHits++;
                                if (asyncHits === 2) { // Both the async functions are complete now
                                    checkForDescendantsNew(collectionData, modalityCount);
                                }
                            });
                        AssignmentEditController.getModalitiesCountLms(
                            {
                                'collectionHandle': collectionName,
                                'modalityTypes': this.modalityTypes
                            }, function (modalityCnt) {
                            modalityCount = modalityCnt;
                            asyncHits++;
                            if (asyncHits === 2) { // Both the async functions are complete now
                                checkForDescendantsNew(collectionData, modalityCount);
                            }
                        });
                    } else {
                        $(this).addClass('js-selected').siblings().removeClass('js-selected');
                        conceptIndex = This.parents('.js-node-wrapper').index();
                        collectionDataPointer = collection.contains[conceptIndex];
                        // Run below function in next event loop and not immediately
                        setTimeout(function () {
                            renderDescendants(collectionDataPointer);
                        }, 0);
                        $('#no-practice-concept').addClass('hide');
                        // AssignmentEditController.getModalities(This.attr('data-encodedId') + '/all');
                        // $('#no-practice-concept').addClass('hide');
                    }
                    $('[data-target="quizzes-container"]').removeClass('selected').addClass('hide-important');
                    selectTab.find('span').attr('data-text', This.text());
                    selectTab.removeClass('hide-important').addClass('selected').siblings().removeClass('selected');
                    selectTab.next('.js-group-assignment-nav').addClass('hide-important').find('span').attr('data-text', '');
                    This = $('#' + selectTab.attr('data-target'));
                    This.removeClass('hide').siblings().not('.add-concept-container').addClass('hide');
                    This.find('.js-concept-child-wrapper').empty();
                } else {
                    selectTab.trigger('click');
                }
            });

            $('#add-concept-container').off('click.remove').on('click.remove', '.js-add-concept-delete', function () {
                var eid = $(this).parent().attr('data-encodedID');
                $('.js-concept-select[data-encodedID="' + eid + '"]').removeClass('selected').find('.js-concept-check').prop('checked', false);
                $('.js-add-concepts-wrapper').find('[data-encodedID="' + eid + '"]').remove();
                checkForAllSelection();
                checkForAddition();
            });

            $('#save-assignment').off('click.save').on('click.save', function () {
                redirect_link = '';
                if (!$(this).hasClass('js-disabled')) {
                       var data = {};
                       data.conceptEIDs = getConceptList(true);
                    if ($('#new-assignment').is(':visible')) {
                        AssignmentEditController.getAssignmentReccomendation(data);
                    } else {
                        AssignmentEditController.getAssignmentReccomendation(data, true);
                    }
                }
            });

            $('#done-assignment').off('click.assignment').on('click.assignment', function () {
                redirect_link = '';
                if (!$(this).hasClass('js-disabled')) {
                    $('#close-assignment-modal').trigger('click');
                }
            });

            $('#assignment-name-edit-icon').off('click.assignment').on('click.assignment', function () {
                $(this).parent().addClass('hide');
                $(this).parent().next().removeClass('hide');
                $('#assignment-name-edit').val($(this).prev().text());
                $('#assignment-name-edit').focus();
            });

            $('#assignment-name-edit-cancel').off('click.assignment').on('click.assignment', function () {
                $(this).parent().parent().addClass('hide');
                $(this).parent().parent().prev().removeClass('hide');
            });

            $('#assignment-name-edit-save').off('click.assignment').on('click.assignment', function () {
                var This, assignment;
                This = $('#assignment-name-edit');
                if ($.trim(This.val())) {
                    assignment = {};
                    assignment.name = $.trim(This.val());
                    AssignmentEditController.updateAssignment(assignment, $('#assignment-name').attr('data-id'));
                } else {
                    This.addClass('input-error2');
                    $('#assignment-edit-empty-error').removeClass('hide');
                }
            });

            $('#assignment-name-edit').off('focus.groups').on('focus.groups', function () {
                $(this).removeClass('input-error2');
                $('.js-edit-assignment-error').addClass('hide');
            }).off('change.groups').on('change.groups', function () {
                $(this).removeClass('input-error2');
                $('.js-edit-assignment-error').addClass('hide');
            }).off('keypress.save').on('keypress.save', function (e) {
                var brackets = "{}[]()",
                    key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
                if (brackets.indexOf(key) !== -1) {
                    e.preventDefault();
                    return false;
                }
            });

            $('#close-confirm-modal-back').off('click.assignment').on('click.assignment', function () {
                $('#closeConfirmModal').find('.close-reveal-modal').trigger('click');
                $('#save-assignment').addClass('js-disabled');
                $('#close-assignment-modal').addClass('js-disabled');
                location.href = $('#group-assignments-link')[0].href;
            });

            $('#close-confirm-modal-save').off('click.assignment').on('click.assignment', function () {
                $('#save-assignment').trigger('click');
            });

            $('.js-delete-created-assignment').off('click.assignment').on('click.assignment', function () {
                AssignmentEditController.deleteAllAssignment($('#assignment-name').attr('data-id'));
            });
            $('#assignment-flow-close').off('click.assignment').on('click.assignment', function () {
                if (isBack && !isSaved) {
                    $('#close-assignment-modal-back').trigger('click');
                } else {
                    $('#save-assignment').addClass('js-disabled');
                    $('#close-assignment-modal').addClass('js-disabled');
                    location.href = $('#group-assignments-link')[0].href;
                }
            });
            $(window).off('resize.assignment').on('resize.assignment', function () {
                if (window.innerWidth < 767) {
                    $('.reveal-modal').foundation('reveal', 'close');
                }
            });

            $('.walkthrough-link').off('click.walkthrough').on('click.walkthrough', function () {
                $('#walkthrough').removeClass('hide');
                $('#assignment-full-page').addClass('hide');
            });

        }

        function walkthroughRender() {
            if ($('body').find('#walkthrough').length === 0) {
                $('body').prepend('<div id="walkthrough"></div>');
                var isWalkThrough = walkthrough.init({
                    container: '#walkthrough'
                });
                if (isWalkThrough) {
                    $('#assignment-full-page').addClass('hide');
                }
            }
        }

        function renderAssignment(assignment) {
            var index, template = '';
            $('#new-assignment').addClass('hide');
            $('#saved-assignment').removeClass('hide');
            $('#assignment-name').text(assignment.name || '');
            $('#assignment-name').attr('data-id', assignment.id || '');
            assignment = assignment.concepts;
            require(['text!groups/templates/concept.add.row.html'], function (artifactTemplate) {
                for (index = 0; index < assignment.length; index++) {
                    template += artifactTemplate;
                    template = template.replace(/@@conceptName@@/g, escapeHTML(assignment[index].name || ''));
                    template = template.replace(/@@conceptEID@@/g, assignment[index].eID || '');
                    template = template.replace(/@@icon@@/g, assignment[index].icon || '');
                    if (assignment[index].conceptCollectionHandle) {
                        template = template.replace(/@@conceptCollectionHandle@@/g, assignment[index].conceptCollectionHandle);
                    } else {
                        template = template.replace(/@@conceptCollectionHandle@@/g, '');
                    }
                    if (assignment[index].collectionCreatorID) {
                        template = template.replace(/@@collectionCreatorID@@/g, assignment[index].collectionCreatorID);
                    } else {
                        template = template.replace(/@@collectionCreatorID@@/g, '');
                    }
                }
                $('.js-add-concepts-wrapper').append(template);
                checkForAddition();
                isBack = true;
                isSaved = false;
                $('#save-assignment').addClass('disabled').addClass('js-disabled');
                $('#done-assignment').addClass('disabled').addClass('js-disabled');
            });
        }

        function render(container, assignment) {
            backContainer = container;
            isBack = true;
            isSaved = false;
            util.ajaxStart();
            require(['text!groups/templates/assignment.edit.html'], function (template) {
                $('header').addClass('hide');
                $('#maintenanceWrapper').addClass('hide');
                $('footer').add('.share-plane-container').hide();
                $('body').addClass('full-height').prepend(template);
                search.init({
                    'element': $('#assignment-search-input'),
                    'artifactTypes': 'domain',
                    'onSelect': function (options) {
                        searchVal = (options.searchString || '').trim();
                        searchVal = escape(searchVal);
                        $('.js-search-heading').addClass('hide');
                        $('#concepts-wrapper').empty();
                        $('#concept-heading').empty();
                        $('.ui-autocomplete').hide();
                        if (searchVal) {
                            AssignmentEditController.search(searchVal);
                        } else {
                            $('#concept-heading').html('<p>Please enter keywords.</p>');
                        }
                    }
                });
                $(backContainer).addClass('hide');
                AssignmentEditController.getBranches('mat');
                AssignmentEditController.getBranches('sci');
                AssignmentEditController.getBranches('ela');
                if (assignment) {
                    renderAssignment(assignment);
                }
                //$('#walkthrough').addClass('hide');
                $('#assignment-full-page').removeClass('hide');
                walkthroughRender();
                bindEvents();
                if (getQueryParam().quizHandle) {
                	$('#add-quizes').trigger('click');
                }
            });
        }

        function bindEventsQuiz() {
            $('.js_sort').off('click.sort').on('click.sort', function () {
                var This = 'i' === this.nodeName.toLowerCase() ? $(this) : $(this).siblings('i');
                $('#quiz-sort-list').slideToggle('slow', function () {
                    This.toggleClass('dropdown_open');
                });
            });
            $('body').off('click.close').on('click.close', function (e) {
                if ($(e.target).closest('#quiz-sort-list').length || $(e.target).closest('.js_sort').length || $('#quiz-sort-list').is(':hidden')) {
                    return;
                }
                $('#quiz-sort').trigger('click');
            });
            $('.js_sort_option').off('click.sort').on('click.sort', function () {
                if ($(this).hasClass('active')) {
                    return;
                }
                $(this).addClass('active').siblings().removeClass('active');
                AssignmentEditController.getMyQuizes({
                    sort: $(this).attr('data-sort')
                });
            });
        }

        function getQueryParam () {
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
        }

        function checkQueryParam () {
            var queries = getQueryParam();

            if (queries.quizHandle) {
            	$('.js-concept-select[data-handle="'+ queries.quizHandle +'"]').trigger('click');
            }
        }

        function renderQuizes(quiz) {
            $('#quiz-sort').text($('.js_sort_option.active').text().trim());
            /*if ($('#quiz-sort-list').is(':visible')) {
                $('#quiz-sort').trigger('click');
            } else {
                $('#quiz-sort-list').removeClass('hide').hide(); // to maintain consistency with the click action
            }*/
            if ($('#quiz-sort-list').is(':visible')) {
        	    $('#quiz-sort-list').removeClass('hide').hide();
        	    $('.quiz-sort-wrapper i.icon-arrow_down').toggleClass('dropdown_open');
            }
            quiz = quiz.artifacts;
            if (quiz && quiz instanceof Array && quiz.length) {
                require(['text!groups/templates/concept.row.html'], function (artifactTemplate) {
                    $('#quizzes-wrapper').removeClass('hide');
                    $("#QuizWrap").removeClass("hide");
                    var index, eID, template = '', quizRealm;
                    for (index = 0; index < quiz.length; index++) {
                    	if (quiz[index].realm && quiz[index].realm.length !== 0) {
                    		quizRealm = quiz[index].realm;
                    	} else if (quiz[index].creator && quiz[index].creator.login){
                    		quizRealm = 'user:' + quiz[index].creator.login;
                    	} else {
                    		quizRealm = '';
                    	}
                        template += artifactTemplate;
                        template = template.replace(/@@conceptName@@/g, escapeHTML(quiz[index].title || ''));
                        template = template.replace(/@@realm@@/g, quizRealm);
                        template = template.replace(/@@handle@@/g, quiz[index].handle || '');
                        template = template.replace(/@@assignmentConceptIcon@@/g, 'all-concept-icon');
                        template = template.replace(/@@isPracticeConcept@@/g, '');
                        eID = (quiz[index].id || '').toString().replace(/\./g, '-');
                        template = template.replace(/@@encodedID@@/g, eID);
                        template = template.replace(/@@artifactID@@/g, (quiz[index].id || ''));
                        eID = $('.js-add-concepts-wrapper').find('[data-encodedID="' + eID + '"]').length ? 'checked' : '';
                        template = template.replace(/@@isChecked@@/g, eID);
                        if (quiz[index]['domain'] && quiz[index]['domain']['branchInfo']) {
                            template = template.replace(/@@parentHandle@@/g, quiz[index].domain.branchInfo.handle || '');
                        } else {
                            template = template.replace(/@@parentHandle@@/g, '');
                        }
                        template = template.replace(/@@collectionHandle@@/g, '');
                        template = template.replace(/@@conceptCollectionHandle@@/g, '');
                        template = template.replace(/@@collectionCreatorID@@/g, '');
                    }
                    $('#quiz-list-wrapper').html(template);
                    $('.js-concept-check:checked').parents('.js-concept-select').addClass('selected');
                    bindEventsConceptSelection();
                    bindEventsQuiz();
                    checkForAllSelection();
                    checkQueryParam();
                });
            } else {
                $('#quiz-list-wrapper').html('<span></span>'); // to prevent api call for subsequent clicks
                $('#no-quizzes-wrapper').removeClass('hide');
                $("#QuizWrap").addClass("hide");
            }
            $('.js_create_quiz').off('click.quiz').on('click.quiz', function () {
                redirect_link = '/create/exercise/test/?referrer=assignment&ep=' + window.location.pathname + "?pageType=create";
                if ($('#save-assignment').hasClass('js-disabled')) {
                    $('#close-assignment-modal').addClass('js-disabled');
                    location.href = redirect_link;
                } else {
                    if ($('#new-assignment').is(':visible')) {
                        continueToCloseAssignmentModal(true);
                    } else {
                        updateAssignment();
                    }
                }
            });
        }

        this.render = render;
        this.renderBranches = renderBranches;
        this.renderDescendants = renderDescendants;
        this.showDuplicateNameError = showDuplicateNameError;
        this.saveComplete = saveComplete;
        this.renderSearch = renderSearch;
        this.showNewspaper = showNewspaper;
        this.updateComplete = updateComplete;
        this.deleteComplete = deleteComplete;
        this.renderQuizes = renderQuizes;
        this.renderRecommendations = renderRecommendations;
        this.closeAssignmentModal = closeAssignmentModal;

    }
    return new AssignmentEditView();
});
