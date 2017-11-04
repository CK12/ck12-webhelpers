/**
* Copyright 2007-2011 CK-12 Foundation
*
* All rights reserved
*
*
* Unless required by applicable law or agreed to in writing, software
* distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations.
*
* This file originally written by Shivprasad
*
* $Id$
*/
define(['jquery', 'underscore', 'common/utils/modality', 'common/utils/assessmentFrameListener', 'groups/controllers/assignment.edit', 'standard/services/ck12.standard', 'common/utils/user'],
function ($, _, modality, frameListener, AssignmentEditController, standardServices, User) {
    'use strict';
    var markup = '',
        WEBROOT_URL = window.webroot_url || '/';

    function ConceptCoverSheet() {
        var conceptHandle = null,
            collectionHandle = null,
            conceptCollectionAbsoluteHandle = null,
            conceptCollectionHandle = null,
            collectionCreatorID = null,
            encodedId = null,
            login = null,
            assignmentId = '',
            modalitiesPageUrl = '',
            assessmentUrl = '',
            MODALITY_INFO_URL = WEBROOT_URL + 'flx/browse/modality/artifact/@@encodedId@@?termOnly=true&format=json',
            MODALITY_ITEM_URL = WEBROOT_URL + 'flx/get/minimal/modalities/@@encodedId@@?pageSize=1',
            ARTIFACT_INFO_URL = WEBROOT_URL + 'flx/get/info/asmtquiz/@@artifactId@@',
            PRACTICE_INFO_URL = WEBROOT_URL + 'assessment/api/get/info/test/practice/encodedid/@@encodedId@@?minimal=true',
            assessmentPresent = false,
            conceptTitle = '',
            modalitiesPresent = false,
            callback = null,
            referrer = '',
            defaultPracticeModality = null,
            ep = '', //exit page for assessment
            context = '',
            appID = '',
            launch_key = '',
            lmsConceptID = '',
            lmsGroupID = '',
            isStudent = false,
            handle = null,
            completed = '',
            standardDataServices = new standardServices(),
            container = '', //used for concept coversheet page view. container where coversheet content will be loaded.
            isPageView = false, //flag to load coversheet as a page
            isAppView = false,
            mtype = 'practice',
            showAssignBtn = true,
            showCloseBtn = true,
            ltiContextID = '',
            adaptive = true; //loading new concept dashboard

        function render() {
            if (assessmentPresent) {
                /*              iFrame = document.createElement('IFRAME');
                iFrame.setAttribute('src', assessmentUrl);
                iFrame.setAttribute('id', 'assessmentFrame');
                iFrame.style.border = 'border:0px';
                iFrame.scrolling = 'no';
                $('#assessmentFrameContainer').html(iFrame);
                $('practice-question-wrapper', '.concept-coversheet').removeClass('hide');*/
                var currentHref = window.location.href;

                if (conceptCollectionHandle && !currentHref.match(/conceptCollectionHandle/)) {
                    assessmentUrl += '&conceptCollectionHandle=' + conceptCollectionHandle;
                    if(!currentHref.match(/collectionCreatorID/)){
                        assessmentUrl += '&collectionCreatorID=' + (collectionCreatorID || '3');
                    }
                }
                if (collectionHandle && !currentHref.match(/collectionHandle/)) {
                    assessmentUrl += '&collectionHandle=' + collectionHandle;
                }

                window.location.href = assessmentUrl + '&isPageView=true' + '&ep='+ ( ep || window.location.href );
            } else {
                $('.practice-question-wrapper', '.concept-coversheet').addClass('hide');
                $('.study-complete', '.concept-coversheet').removeClass('hide');
                window.scrollTo(0, 0);
                $('.dashboard-container').removeClass('hide');
            }

            if(isAppView){
                $('.modal-subtitle').hide();
                $('.modality-types-wrapper').add('#showAllModalities').addClass('hide');
                return;
            }

            $('.js-loading-icon', '.concept-coversheet').addClass('hide');

            if (!adaptive || !assessmentPresent) {
                $('.modality-types-wrapper', '.concept-coversheet').removeClass('hide');
                $('.modal-subtitle', '.concept-coversheet').css('display', 'inline-block');
            } else {
                $('#showAllModalities').removeClass('hide');
            }
        }

        function resetConceptCoverSheet() {
            $('#assessmentFrame', '.concept-coversheet').attr('src', '').css('height', '0px');

            $('.practice-question-wrapper', '.concept-coversheet').removeClass('hide');
            $('.modality-types-wrapper', '.concept-coversheet').addClass('hide');
            $('.modal-subtitle', '.concept-coversheet').css('display', 'none');
            $('.study-complete', '.concept-coversheet').addClass('hide');
            $('.no-modalities', '.concept-coversheet').addClass('hide');
            $('#conceptTitle').html('');
            $('#standards-container').addClass('hide');

            $('.js-loading-icon', '.concept-coversheet').removeClass('hide');

            $('.concept-coversheet').removeClass('coversheet-open'); //Bug #36776 remove coversheet-open added by standard selector.
        }

        function countForGroupModalities(i, modalitiesCollection, modalitiesData) {
            var displayType = null,
                count = 0,
                key = 0;

            // [Bug #37953] Skip modality types not present in the modality configuration
            displayType = modality.getModalityType(i);
            if (displayType === 'Others') {
                return;
            }

            // If modality is already present then add the count
            if (modalitiesData[displayType]) {
                count = modalitiesData[displayType].count;
            } else {
                modalitiesData[displayType] = {};
                count = 0;
            }
            for (key in modalitiesCollection[i]) {
                if (modalitiesCollection[i].hasOwnProperty(key)) {
                    count = count + modalitiesCollection[i][key];
                }
            }
            modalitiesData[displayType].count = count;
            modalitiesData[displayType].className = modality.getModalityClassName(i);
            modalitiesPresent = true;
        }

        function groupModalities(modalitiesCollection) {
            var modalitiesData = {},
                i = 0;

            for (i in modalitiesCollection) {
                if (modalitiesCollection.hasOwnProperty(i)) {
                    if (isStudent) {
                        if (modality.getStudentShow(i)) {
                            countForGroupModalities(i, modalitiesCollection, modalitiesData);
                        }
                    } else {
                        countForGroupModalities(i, modalitiesCollection, modalitiesData);
                    }
                }
            }

            return modalitiesData;
        }

        function createModalitiesList(items) {
            var html = [],
                i,
                itemsPerList = 4,
                temp = '',
                danglingItem = false;

            for (i = 0; i < items.length; i++) {
                danglingItem = true;
                temp = temp + items[i];

                if (i % (itemsPerList - 1) === 0 && i !== 0) {
                    html.push('<li>' + temp + '</li>');
                    danglingItem = false;
                    temp = '';
                }
            }

            if (danglingItem) {
                html.push('<li>' + temp + '</li>');
            }

            return html;
        }

        function generateModalitiesmarkup(modalitiesData) {
            var key = null,
                modalityItem = null,
                modalityMarkup = $('#modalityMarkup', '#markupTemplates').html(),
                seeAllMarkup = $('#seeAllMarkup', '#markupTemplates').html(),
                listItems = [],
                html = '',
                totalCount = 0;

            for (key in modalitiesData) {
                if (modalitiesData.hasOwnProperty(key)) {
                    modalityItem = modalityMarkup;

                    modalityItem = modalityItem.replace('@@icon@@', modality.getModalityIcon(key));
                    modalityItem = modalityItem.replace('@@modalityType@@', key);
                    modalityItem = modalityItem.replace('@@modalityClassName@@', modalitiesData[key].className);
                    modalityItem = modalityItem.replace('@@count@@', modalitiesData[key].count);
                    if (!context || (context && key !== 'Assessments')) {
                        totalCount = totalCount + modalitiesData[key].count;
                    }
                    listItems.push(modalityItem);
                }
            }

            html = createModalitiesList(listItems);
            if (totalCount > 0) {
                seeAllMarkup = seeAllMarkup.replace('@@totalCount@@', totalCount);
                seeAllMarkup = seeAllMarkup.replace('@@modalityClassName@@', 'all');

                html.push(seeAllMarkup);
            }

            return html;
        }

        function initUrls(modalitiesCollection) {
            var obj = modalitiesCollection[0],
                perma = '',
                tempEid = '',
                parent = null,
                i = 0;

            tempEid = obj.domain.encodedID;
            parent = obj.domain.parent;
            while (tempEid.split('.').length > 2) {
                tempEid = parent.encodedID;
                handle = parent.handle;
                parent = parent.parent;
            }

            if(collectionHandle && conceptCollectionAbsoluteHandle){
                modalitiesPageUrl = '/c/' + collectionHandle.toLowerCase() + '/' + conceptCollectionAbsoluteHandle;
            }
            else if(conceptCollectionHandle){
                modalitiesPageUrl = '/c/' +
                conceptCollectionHandle.split('-::-')[0].toLowerCase() +
                '/' +
                conceptCollectionHandle.split('-::-')[1];
            }
            else if(handle){
                modalitiesPageUrl = '/' + handle.toLowerCase() + '/' + conceptHandle.toLowerCase();
            }

            for (i = 0; i < modalitiesCollection.length; i++) {
                if (handle && modalitiesCollection[i].artifactType === 'asmtpractice') {
                    modalitiesPageUrl = '/' + handle.toLowerCase();
                }
                if (modalitiesCollection[i].artifactType === 'asmtpractice') {
                    assessmentPresent = true;
                    var practiceInfoUrl = PRACTICE_INFO_URL.replace('@@encodedId@@', obj.domain.encodedID);
                    if (collectionHandle) {
                        practiceInfoUrl += '&collectionHandle=' + collectionHandle;
                    }
                    $.getJSON(practiceInfoUrl, function (data) {
                        modalitiesPageUrl += ('/' + data.response.test.handlelc);
                        perma = modalitiesCollection[i].perma.replace(/(\/)$/, '');
                        perma = encodeURIComponent(perma.replace('/asmtpractice/', 'type=practice&title='));
                        perma = encodeURIComponent(perma);
                        if (isAppView) {
                            assessmentUrl = '../ui/views/test.detail.new.html?' + perma;
                        } else {
                            assessmentUrl = '/assessment/ui/?test/detail/practice' + modalitiesPageUrl;
                        }
                        assessmentUrl = assessmentUrl + '&coversheet=true';
                        assessmentUrl = assessmentUrl + '&referrer=' + encodeURIComponent(referrer);
                        if (context) {
                            assessmentUrl = assessmentUrl + '&context=' + context;
                        }

                        if (assignmentId) {
                            assessmentUrl = assessmentUrl + '&assignmentId=' + assignmentId;
                        }

                        if (appID) {
                            assessmentUrl = assessmentUrl + '&appID=' + appID;
                        }
                        if (launch_key) {
                            assessmentUrl = assessmentUrl + '&launch_key=' + launch_key;
                        }
                        if (ltiContextID) {
                            assessmentUrl = assessmentUrl + '&ltiContextID=' + ltiContextID;
                        }
                        if (lmsGroupID) {
                            assessmentUrl = assessmentUrl + '&lmsGroupID=' + lmsGroupID;
                        }
                        bindEvents();
                        render();
                    });
                    break;
                }
            }
            if (!assessmentPresent) {
                bindEvents();
                render();
            }
        }

        function completeConceptHandler() {
            var bodyData = {
                'status': 'completed',
                'concepts': [encodedId].join(',')
            };
            if (conceptCollectionHandle) {
                bodyData.concepts = [encodedId + '||' + conceptCollectionHandle + '|' + (collectionCreatorID || '3')].join(',');
            }
            if (!($(this).hasClass('completed'))) {
                $.ajax({
                    'url': '/flx/update/my/assignment/status',
                    'data': bodyData,
                    'type': 'POST',
                    'dataType' : 'json',
                    'success': function (data) {
                        //console.log('success');
                        if (data && data.responseHeader && data.responseHeader.status === 0) {
                            $('.concept-coversheet').foundation('reveal', 'close');
                            if (callback instanceof Function) {
                                callback();
                            }
                        }
                    }
                });
            } else {
                $('.expand-close', '.concept-coversheet').trigger('click');
            }
        }

        function addStandards() {
            var standardParam = {},
                set,
                standardTitle,
                standardSubject,
                subjectCode = encodedId.slice(0, 3);
            if (subjectCode === 'MAT') {
                set = 'CCSS';
                standardTitle = 'Common Core Math';
                standardSubject = 'Math';
            } else {
                set = 'NGSS';
                standardTitle = 'Next Generation Science';
                standardSubject = 'Science';
            }
            standardParam = {
                'set': set,
                'eid': encodedId
            };
            standardDataServices.getStandardsForConcept(standardParam).done(function (response) {
                response = response.response;
                var standards = response.standards,
                    standardsData = '',
                    standardDescTmpl = '',
                    standardGradeRange,
                    descriptionTemplate = '<div class="standard-description-wrapper"><div class="standard-heading-text"><span class="standard-name">' + standardSubject + ' ' + '<%= standardName %></span><span> Grades (<%= standardGrade %>)</span></div><div class="standard-desc"><%= standardDescription %></div></div>';
                if (standards instanceof Array && standards.length) {
                    _.each(standards, function (standardsList) {
                        if (standardsList.grades.length === 1) {
                            standardGradeRange = standardsList.grades[0];
                        } else {
                            standardGradeRange = standardsList.grades[0] + '-' + standardsList.grades[standardsList.grades.length - 1];
                        }
                        standardsData += _.template('<div class="standard-text"><%= standard %></div>', {
                            'standard': standardsList.label
                        });
                        standardDescTmpl += _.template(descriptionTemplate, {
                            'standardName': standardsList.label,
                            'standardGrade': standardGradeRange,
                            'standardDescription': standardsList.description
                        });
                    });
                    $('.standard-title').text(standardTitle);
                    $('.standard-concept-name').text(conceptTitle);
                    $('.standard-set-name').text(set);
                    $('#standard-list').html(standardsData);
                    $('.standard-description-list').html(standardDescTmpl);
                    $('#standards-container').removeClass('hide');
                } else {
                    $('#standards-container').addClass('hide');
                }
            }).fail(function (err) {
                console.log(err);
                $('#standards-container').addClass('hide');
            });
        }

        function bindEvents() {
            $('.expand-close', '.concept-coversheet').off('click.closeModal').on('click.closeModal', function () {
                if (isPageView) {
                    if (ep) {
                        window.location.href = ep;
                    }
                } else {
                    $('.concept-coversheet').foundation('reveal', 'close');
                    $('#assessmentFrame').remove();
                    $('.dashboard-body-container').removeClass('hide');
                    if (window.innerWidth > 767) {
                        $('.active-dashboard-section section.active').css('padding-top', '63px');
                    }
                    $('#group-assignments').removeClass('hide');
                    $('.dashboard-modal-wrapper').removeClass('coversheet-open');
                }
            });

            if (context) {
                $('.modalityType', '.modality-types-wrapper').off('click.openConceptPage').on('click.openConceptPage', function () {
                    var modalityClassName = $(this).attr('data-modalityClassName');
                    if (modalityClassName === 'all') {
                        if (context) {
                            modalityClassName = modality.getModalityGroups().join(',').replace('assessment,', '');
                        } else {
                            modalityClassName = '';
                        }
                    }
                    AssignmentEditController.showNewspaper('/embed/#module=concept&amp;handle=' + conceptHandle + '&amp;branch=' + handle + '&amp;nochrome=true', modalityClassName);
                    $('.concept-coversheet').addClass('coversheet-open');
                });
            } else {
                $('.modalityType', '.modality-types-wrapper').off('click.openModalityPage').on('click.openModalityPage', function () {
                    $('.concept-coversheet').foundation('reveal', 'close');
                    window.location.href = modalitiesPageUrl + '?by=ck12&difficulty=all#' + $(this).attr('data-modalityClassName');
                });
                $('#icon-validated').off('click.markComplete').on('click.markComplete', completeConceptHandler);
            }
            $('.js-standard-title', '.concept-coversheet').off('click.standard').on('click.standard', function () {
                $('.concept-coversheet').addClass('coversheet-open').after($('#standards-description-modal'));
            });

            $('#showAllModalities').off('click.showAll').on('click.showAll', function () {
                $(this).addClass('hide');
                $('.modality-types-wrapper', '.concept-coversheet').removeClass('hide');
                $('.modal-subtitle', '.concept-coversheet').css('display', 'inline-block');
            });
        }

        function initModalities(retry) {
            var modalityUrl = MODALITY_INFO_URL;
            if (conceptCollectionHandle) {
                modalityUrl += '&conceptCollectionHandle=' + conceptCollectionHandle;
            } else if (collectionHandle && conceptCollectionAbsoluteHandle) {
                conceptCollectionHandle = collectionHandle + '-::-' + conceptCollectionAbsoluteHandle;
                modalityUrl += '&conceptCollectionHandle=' + conceptCollectionHandle;
            }

            if (collectionHandle) {
                modalityUrl += '&collectionHandle=' + collectionHandle;
            }
            if (collectionCreatorID) {
                modalityUrl += '&collectionCreatorID=' + collectionCreatorID;
            }
            $('.dashboard-container').addClass('hide');
            $.ajaxSetup({
                'cache':true,
                'cacheControl':'max-age=86400'
            });
            $.getJSON(modalityUrl.replace('@@encodedId@@', encodedId), function (data) {
                var modalitiesData = {},
                    url = MODALITY_ITEM_URL,
                    isPracticePresent = false,
                    i = 0;

                if (data && data.response && data.response.results && data.response.results.length !== 0 && data.response.results[0].modalityCount) {
                    conceptHandle = data.response.results[0].handle;
                    conceptTitle = data.response.results[0].name;
                    $('#conceptTitle').text(conceptTitle);

                    modalitiesData = groupModalities(data.response.results[0].modalityCount);
                    $('.modality-types-wrapper', '.concept-coversheet').html(generateModalitiesmarkup(modalitiesData).join(''));
                    if (context) {
                        $('.modalityType').each(function () {
                            if ($(this).data('modalityclassname') === 'assessment') {
                                $(this).addClass('hide-important');
                            }
                        });
                    }

                    if (collectionHandle) {
                        url += '&collectionHandle=' + collectionHandle;
                    }
                    if (conceptCollectionHandle) {
                        url += '&conceptCollectionHandle=' + conceptCollectionHandle;
                    }
                    if (collectionCreatorID) {
                        url += '&collectionCreatorID=' + collectionCreatorID;
                    }

                    url = url.replace('@@encodedId@@', encodedId);

                    for (i in data.response.results[0].modalityCount) {
                        if (data.response.results[0].modalityCount.hasOwnProperty(i)) {
                            if (i === 'asmtpractice') {
                                isPracticePresent = true;
                            }
                        }
                    }

                    if (isPracticePresent) {
                        url = url + '&modalities=asmtpractice&ownedBy=ck12';
                    }

                    if (modalitiesPresent) {
                        if (defaultPracticeModality) {
                            initUrls([defaultPracticeModality]);
                        } else {
                            $.ajaxSetup({
                                'cache':true,
                                'cacheControl':'max-age=86400'
                            });
                            $.getJSON(url, function (data) {
                                if (data && data.response && data.response.domain && data.response.domain.modalities && data.response.domain.modalities.length !== 0) {
                                    // initUrls will call bindEvents and render.
                                    initUrls(data.response.domain.modalities);
                                } else {
                                    bindEvents();
                                    render();
                                }
                            });
                        }
                    }

                    if (!isAppView) {
                        addStandards();
                    }

                }
                // We don't need to be end up in an infinite loop, hence check for retry flag
                else if (!retry && data && data.response && data.response.redirectedConcept && data.responseHeader.status === 2063) {
                    encodedId = data.response.redirectedConcept.encodedID;
                    initModalities(true);
                } else {
                    $('.practice-question-wrapper', '.concept-coversheet').addClass('hide');
                    window.scrollTo(0, 0);
                    $('.dashboard-container').removeClass('hide');
                    $('.no-modalities', '.concept-coversheet').removeClass('hide');
                    $('.expand-close', '.concept-coversheet').off('click.closeModal').on('click.closeModal', function () {
                        if (isPageView) {
                            if (ep) {
                                window.location.href = ep;
                            }
                        } else {
                            $('.concept-coversheet').foundation('reveal', 'close');
                            $('#assessmentFrame').remove();
                            $('.dashboard-body-container').removeClass('hide');
                            if (window.innerWidth > 767) {
                                $('.active-dashboard-section section.active').css('padding-top', '63px');
                            }
                            $('#group-assignments').removeClass('hide');
                            $('.dashboard-modal-wrapper').removeClass('coversheet-open');
                        }
                    });
                }
            });
        }

        function initModal() {
            if ($('.concept-coversheet').length === 0 && !container) {
                $('body').append(markup);
            } else if (container) {
                container.html(markup);
            }
            $('#icon-validated').removeClass('completed').addClass(completed);
            if (isStudent) {
                $('.concept-coversheet').find('.coversheet-assign-button').addClass('hide');
            }

            resetConceptCoverSheet();

            if (!isPageView) {
                $('.concept-coversheet').foundation('reveal', 'open');
            }
        }

        function initAssessmentFrameListener() {
            //get selected methods to window.assessmentFrameListener
            frameListener.init({
                'apis': ['showSigninDialog', 'getParentURL', 'setParentURL']
            });

            function resize(options) {
                var height = (options && options.height) ? options.height : '350';

                //Reducing padding at bottom in assessment frame as only two possible view here
                height = height + 35;
                $('#assessmentFrame').animate({
                    'height': height
                }, 'slow');
                //console.log('Frame resized. height: '+ height + 'px');
            }

            //specifying specific resize method for concept coversheet only
            window.assessmentFrameListener.resize = resize;

            window.assessmentFrameListener.loadCoverSheet = function (options) {
                var url = '';
                /*coversheet_home = options.coversheet_home || '/coversheet/';*/

                if (isPageView) {


                    if (options.handle && options.login) {
                        url = '/assessment/ui/?test/detail/quiz/' + options.handle + '/user:' + escape(options.login) + '&isPageView=true';
                    } else if (options.handle) {
                        url = '/assessment/ui/?test/detail/practice/' + options.handle + '&isPageView=true';
                    }

                    if (url && assignmentId) {
                        url = url + '&assignmentId=' + assignmentId;
                        url = url + '&ep=' + encodeURIComponent(ep);
                    }

                    if (url) {
                        window.location.href = url;
                    }
                } else {
                    defaultPracticeModality = false; //setting defaultPracticeModality & completed as false as this is for current practice and we want to load new practice now.
                    completed = false;
                    resetConceptCoverSheet();
                    initModal();
                    if (options.eid) {
                        encodedId = options.eid;
                        initModalities();
                    } else if (options.handle && options.login) { //if it is quiz
                        handle = (options && options.handle) ? options.handle : '';
                        conceptTitle = (options && options.conceptTitle) ? options.conceptTitle : '';
                        assessmentUrl = '/assessment/ui/?test/detail/quiz/' + handle + '/user:' + options.login + '&referrer=' + referrer + '&attemptPageReferrer=practice_details';
                        assessmentPresent = true;

                        assessmentUrl = assessmentUrl + '&coversheet=true';

                        if (context) {
                            assessmentUrl = assessmentUrl + '&context=' + context;
                        }

                        if (assignmentId) {
                            assessmentUrl = assessmentUrl + '&assignmentId=' + assignmentId;
                        }

                        if (appID) {
                            assessmentUrl = assessmentUrl + '&appID=' + appID;
                        }
                        if (launch_key) {
                            assessmentUrl = assessmentUrl + '&launch_key=' + launch_key;
                        }
                        if (ltiContextID) {
                            assessmentUrl = assessmentUrl + '&ltiContextID=' + ltiContextID;
                        }

                        if (lmsGroupID) {
                            assessmentUrl = assessmentUrl + '&lmsGroupID=' + lmsGroupID;
                        }

                        render();
                        $('#conceptTitle').text(conceptTitle);
                        bindEvents();
                        $('.modal-subtitle').hide();
                        $('.modality-types-wrapper').add('#showAllModalities').addClass('hide');
                        $('#standards-container').addClass('hide');
                    }
                }
            };
        }

        function initLms(options) {
            require(['text!practiceapp/templates/concept.coversheet.html'], function (markupHtml) {
                markup = markupHtml;
                encodedId = (options && options.encodedId) ? options.encodedId : '';
                collectionHandle = (options && options.collectionHandle && options.collectionHandle[0] !== '@') ? options.collectionHandle : '';
                conceptCollectionAbsoluteHandle = (options && options.conceptCollectionAbsoluteHandle && options.conceptCollectionAbsoluteHandle[0] !== '@') ? options.conceptCollectionAbsoluteHandle : '';
                conceptCollectionHandle = (options && options.conceptCollectionHandle && options.conceptCollectionHandle[0] !== '@') ? options.conceptCollectionHandle : '';
                collectionCreatorID = (options && options.collectionCreatorID && options.collectionCreatorID[0] !== '@') ? options.collectionCreatorID : '3';
                handle = (options && options.handle) ? options.handle : '';
                assignmentId = (options && options.assignmentId) ? options.assignmentId : '';
                callback = (options && options.callback) ? options.callback : '';
                ep = (options && options.ep) ? options.ep : '';
                defaultPracticeModality = (options && options.defaultPracticeModality) ? options.defaultPracticeModality : null;

                //use referrer perma if passed else default to global pageType value
                referrer = (options && options.referrer) ? options.referrer : window.pageType || '';
                context = (options && options.context) ? options.context : '';
                appID = (options && options.appID) ? options.appID : '';
                launch_key = (options && options.launch_key) ? options.launch_key : '';
                ltiContextID = (options && options.ltiContextID) ? options.ltiContextID : '';
                lmsConceptID = (options && options.lmsConceptID) ? options.lmsConceptID : '';
                lmsGroupID = (options && options.lmsGroupID) ? options.lmsGroupID : '';


                markup = markup.replace('@@encodedID@@', encodedId);
                markup = markup.replace('@@handle@@', handle);
                isStudent = options.user.is_student();
                showAssignBtn = options.showAssignBtn;
                showCloseBtn = options.showCloseBtn;

                assessmentPresent = false;

                if (!encodedId) {
                    return;
                }
                initModal();
                // Hide assign button if show option is false
                if (!showAssignBtn) {
                    $('.concept-coversheet').find('.coversheet-assign-button').hide();
                }
                // Hide close coversheet button if show option is false
                if (!showCloseBtn) {
                    $('.concept-coversheet').find('.js-close-coversheet').hide();
                }
                if (encodedId.indexOf('.') === -1) { // it is a quiz, need to  check if there is some other way to check if it is quiz
                    $('.concept-coversheet').find('.coversheet-assign-button').addClass('hide'); //hiding assign button for quiz coversheet
                    $.getJSON(ARTIFACT_INFO_URL.replace(/@@artifactId@@/, encodedId), function (data) {
                        var quiz = data.response.asmtquiz,
                            perma = '';
                        if (quiz) {
                            handle = quiz.handle;
                            conceptTitle = quiz.title;
                            perma = quiz.perma.replace(/\/asmt/, '');
                            // [bug #54171] perma already has type - so removing quiz from the url
                            assessmentUrl = '/assessment/ui/?test/detail/' + perma + '&referrer=' + referrer;
                            assessmentPresent = true;

                            assessmentUrl = assessmentUrl + '&coversheet=true';

                            if (context) {
                                assessmentUrl = assessmentUrl + '&context=' + context;
                            }

                            if (assignmentId) {
                                assessmentUrl = assessmentUrl + '&assignmentId=' + assignmentId;
                            }

                            if (appID) {
                                assessmentUrl = assessmentUrl + '&appID=' + appID;
                            }
                            if (launch_key) {
                                assessmentUrl = assessmentUrl + '&launch_key=' + launch_key;
                            }
                            if (ltiContextID) {
                                assessmentUrl = assessmentUrl + '&ltiContextID=' + ltiContextID;
                            }
                            if (lmsConceptID) {
                                assessmentUrl = assessmentUrl + '&lmsConceptID=' + lmsConceptID;
                            }
                            if (lmsGroupID) {
                                assessmentUrl = assessmentUrl + '&lmsGroupID=' + lmsGroupID;
                            }
                            render();

                            $('#conceptTitle').text(conceptTitle);
                            bindEvents();
                            $('.modal-subtitle').hide();
                            $('.modality-types-wrapper').add('#showAllModalities').addClass('hide');
                            initAssessmentFrameListener();
                        }
                    });
                } else {
                    initModalities();
                    initAssessmentFrameListener();
                }


            });
        }

        function init(options) {
            require(['text!common/templates/concept.coversheet.html'], function (markupHtml) {
                markup = markupHtml;
                encodedId = (options && options.encodedId) ? options.encodedId : '';
                collectionHandle = (options && options.collectionHandle && options.collectionHandle[0] !== '@') ? options.collectionHandle : '';
                conceptCollectionAbsoluteHandle = (options && options.conceptCollectionAbsoluteHandle && options.conceptCollectionAbsoluteHandle[0] !== '@') ? options.conceptCollectionAbsoluteHandle : '';
                collectionCreatorID = (options && options.collectionCreatorID && options.collectionCreatorID[0] !== '@') ? options.collectionCreatorID : '3';
                conceptCollectionHandle = (options && options.conceptCollectionHandle && options.conceptCollectionHandle[0] !== '@') ? options.conceptCollectionHandle : '';
                login = (options && options.login) ? options.login : '';
                completed = (options && options.completed) ? options.completed : '';
                assignmentId = (options && options.assignmentId) ? options.assignmentId : '';
                callback = (options && options.callback) ? options.callback : '';
                defaultPracticeModality = (options && options.defaultPracticeModality) ? options.defaultPracticeModality : null;
                container = (options && options.container) ? options.container : '';
                isPageView = (options && options.isPageView) || false;
                isAppView = (options && options.isAppView) || false;
                ep = (options && options.ep) || '';
                mtype = (options && options.mtype) || 'practice';
                mtype = mtype.replace(/^asmt/, '');

                if (isPageView && container) { //for concept coversheet page view,loading html content of modal element into page
                    markup = $(markup).html();
                }

                //use referrer perma if passed else default to global pageType value
                referrer = (options && options.referrer) ? options.referrer : window.pageType || '';

                assessmentPresent = false;

                if (!(encodedId || login)) {
                    return;
                }
                initModal();
                if (!encodedId) { // it is a quiz
                    mtype = 'quiz';
                }
                if (mtype === 'quiz') {
                    handle = (options && options.handle) ? options.handle : '';
                    conceptTitle = (options && options.conceptTitle) ? options.conceptTitle : '';
                    assessmentUrl = '/assessment/ui/?test/detail/quiz/'+ handle + '/user:' + login + '&referrer=' + referrer + '&attemptPageReferrer=practice_details&coversheet=true';
                    assessmentPresent = true;

                    assessmentUrl += (context ? '&context=' + context : '');
                    assessmentUrl += (assignmentId ? '&assignmentId=' + assignmentId : '');
                    assessmentUrl += (ep ? '&ep=' + ep : '');

                    render();
                    $('#conceptTitle').text(conceptTitle);
                    bindEvents();
                    $('.modal-subtitle').hide();
                    $('.modality-types-wrapper').add('#showAllModalities').addClass('hide');
                } else {
                    initModalities();
                }
                initAssessmentFrameListener();
                isStudent = (new User()).is_student();
            });
        }

        this.init = init;
        this.initLms = initLms;
    }

    return new ConceptCoverSheet();
}
);
