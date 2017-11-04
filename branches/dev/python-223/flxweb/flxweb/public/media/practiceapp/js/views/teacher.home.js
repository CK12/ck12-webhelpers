define([
        'jquery',
        'underscore',
        'practiceapp/views/library.view',
        'practiceapp/views/appview',
        'practiceapp/templates/templates',
        'groups/controllers/assignment.edit',
        'practiceapp/views/autocomplete.view',
        'common/utils/walkthrough',
        'common/views/modal.view',
        'common/utils/utils'
    ],
    function ($, _, EdmodoLibraryView, AppView, Templates, AssignmentEditController,AutoCompleteView, walkthrough, ModalView, util) {
        'use strict';
        
        var _c,
            visible,
            searchVal,
            appSubjectEIDs,
            groupListInfo = [],
            groupFetchDone = false,
            errorShown = false,
            quizAssignment = false,
            controller = null,
            context = "",
            searchBackHTML = null,
            SubjectListData,
            adaptive = true,
            assignmentInProgress = false, //TODO: make the assign popup it's own view so that this variable can be private per assignment popup
            collection = null, // The whole collection data retrieved. Contains depth upto level 4
            collectionDataPointer = null; // Keeps track of navigation within collection
        
        /**
         * Function responsible for refining collection data
         * Adds missing data like conceptCount at current root level
         * Also adds conceptHandle to concepts with EID
         * @param {Object} topicOrConcept concept/topic from collection (level 2 to 3,4,..)
         * @param {Object} modalityCount The response of get modality count API for a collection 
         * @returns {number} The number of concepts the node accomodates 
         */
        function refineTopic(topicOrConcept, modalityCount) {
            var count = 0, itemsToRemove = [], i, innerConceptsCount;
            if (topicOrConcept.contains) {

                _.each(topicOrConcept.contains, function (concept, index) {
                    if (concept.encodedID) {
                        if (!_.isEmpty(util.get(modalityCount[concept.encodedID], 'conceptCollectionHandleCounts.0.ck12OwnedCounts'))) {
                            concept.conceptHandle = modalityCount[concept.encodedID].handle;
                            count++;
                        }
                        else {
                            itemsToRemove.push(index);
                        }
                    } else {
                        if(concept.contains){
                            innerConceptsCount = refineTopic(concept, modalityCount);
                            if(innerConceptsCount === 0){
                                //delete this concept / topic
                                itemsToRemove.push(index);
                            }
                            count += innerConceptsCount;
                        }
                    }
                });

                // Remove concepts without modality
                while ((i = itemsToRemove.pop()) !== undefined) {
                    topicOrConcept.contains.splice(i, 1);
                }

                topicOrConcept.conceptCount = count;
            }
            return count;
        }

        /**
         * Responsible for getting the template for concepts in concept view page
         * @param {Function} templateFunction The function responsible for creating HTML 
         *  template in concept page
         * @param {Object} concepts Array of concepts to be rendered 
         * @param {number} level The level at which the concepts is to be rendered. Starts from 1
         * @param {String} [conceptItemButton] Will create a button with same text in concept page if passed
         * @returns {Object} 'template' contains the HTML template to render and 'conceptCount' contains
         *  the number of concepts present in current page   
         */
        function createConceptRowTemplate(templateFunction, concepts, level, conceptItemButton) {
            var i = 0,
                len = 0,
                count = 0,
                template = '';
            var parentHandle, eID, nextLevelConcepts, collectionHandle;
            var returnTemplate;

            for (i, len = concepts.length; i < len; i++) {
                collectionHandle = concepts[i].handle.split('-::-')[0];
                
                eID = (concepts[i].encodedID || '').replace(/\./g, '-');
                if (eID) {
                    count++;
                    parentHandle = util.getBranchName(concepts[i].encodedID).replace(/ /g, '-');
                } else {
                    // doesn't matter anyway. Its not strict to set. We are only
                    // setting it here beacuse we have set it in assignment flow
                    parentHandle = collectionHandle;
                }
                //Check if we have to drill down to get next level concepts
                nextLevelConcepts = concepts[i].contains;
                if (eID || nextLevelConcepts) {
                    template += templateFunction({
                        'conceptName': _.escape(concepts[i].title) || '',
                        'handle': eID ? (concepts[i].conceptHandle || '') : '',
                        'conceptCollectionAbsoluteHandle': concepts[i].absoluteHandle || '',
                        'parentHandle': parentHandle,
                        'conceptCollectionHandle': concepts[i].handle || '',
                        'collectionCreatorID': concepts[i].creatorID || '',
                        'collectionHandle': collectionHandle,
                        'encodedID': eID,
                        'isChecked': $(".js-add-concepts-wrapper").find("[data-encodedID=" + eID + "]").length ? "checked" : "",
                        'conceptLevel': level,
                        'buttonText': eID ? conceptItemButton : ''
                    });
                }
                // Drill down to generate child concepts
                if (!eID && nextLevelConcepts) {
                    returnTemplate = createConceptRowTemplate(templateFunction, nextLevelConcepts, level + 1, conceptItemButton);
                    template += returnTemplate.template;
                    count += returnTemplate.conceptCount;
                }
            }
            return {
                'template': template,
                'conceptCount': count
            };
        }

        var TeacherHomeView = AppView.extend({
            'tmpl': Templates.TEACHER_HOME,
            'tmpl_ltiTeacherHome': Templates.LTI_TEACHER_HOME,
            'practice_tmpl' : Templates.PRACTICE_HOME,
            'tmpl_subjects': _.template(Templates.SUBJECT_ROW, null, {
                'variable': 'data'
            }),
            'tmpl_tracks': _.template(Templates.CONCEPT_TRACKS_ROW, null, {
                'variable': 'data'
            }),
            'tmpl_concepts': _.template(Templates.CONCEPT_ROW, null, {
                'variable': 'data'
            }),
            'tmpl_applyDueDate': _.template(Templates.SELECTED_GROUPS_DUE_DATE, null, {
                'variable': 'data'
            }),
            'tmpl_groups': _.template(Templates.GROUP_LIST, null, {
                'variable': 'data'
            }),
            'tmpl_quizzes': _.template(Templates.QUIZ_ROW, null, {
                'variable': 'data'
            }),
            'tmpl_adaptiveModal' :  _.template(Templates.ADAPTIVE_MODAL, null, {
                'variable': 'data'
            }),
            initialize: function () {
                _c = this;
                _.bindAll(this, 'render', 'checkForSubjectsNew', 'renderBranches', 'renderTopics', 'checkForDescendantsNew', 'renderDescendants', 'renderTracks', 'onGroupFetchDone');
                TeacherHomeView.__super__.initialize.apply(this, arguments); // run parent class init first
                $('body').off('click.coversheet').on('click.coversheet','.js-close-coversheet',function() {
                    _c.removePractice();
                });
                $('body').off('click.concept').on('click.concept','.js-assign-concept',function(e) {
                    var target = $(e.target),
                    concept_row = target.closest('.js-select-concept-wrapper'),
                    concept_eid = concept_row.attr('data-encodedid'),
                    concept_handle = concept_row.attr('data-handle'),
                    concept_title = concept_row.find('.js-concept-name').text();
                    _c.current_concept = {
                        eid: concept_eid.replace(/\-/g,'.'),
                        title: concept_title,
                        handle: concept_handle
                    };
                    var assignParams = {
                            'target': target,
                            'current_concept': _c.current_concept,
                            'container': $('#assignConceptViewContainer')
                    };
                    _c.trigger('assignConcept', assignParams);
                });
                
                if(context !== 'androidPracticeApp' && context !== 'ltiApp'){ //for practice app we dont want library views and assign concept functionality
                    $('body').off('click.coversheet').on('click.coversheet','.js-close-coversheet',function() {
                        _c.removePractice();
                    });
                    $('body').off('click.concept').on('click.concept','.js-assign-concept',function(e) {
                        _c.assignConcepts(e);
                    });
                    
                    _c.libraryView = new EdmodoLibraryView({
                        el : this.$("#library_main")
                        //el : this.$("#library-container")
                    });
                    _c.libraryView.on("LibraryView.ItemFetchComplete", _c.updateMyQuizCount);
                    _c.libraryView.render();
                    controller.on('groupFetchDone', _c.onGroupFetchDone);
                }
                
            },
            events: {
                'click.subjects .js-node-wrapper': 'renderTopics',
                'click.subjects .js-group-assignment-nav': 'showSubjects',
                'click.subjects .js-concept-select': 'showPractice',
                'click.subjects .js-search-open': 'openSearch',
                'click.subjects .js-search-close': 'closeSearch',
                'click.subjects .js-search': 'searchConcepts',
                'keypress.subjects #assignment-search-input': 'callSearch',

                'click.subjects .js-group-list': 'selectGroup',
                'click.subjects #toggle-group-button': 'toggleSelectGroups',
                'focus.subjects .js-due': 'openDatePicker',
                'click.subjects .js-cancel-assign': 'cancelAssign',
                'click.subjects .js-confirm-assign': 'confirmAssign',
                'change.subjects .js-due': 'changeDueDate',
                'click.subjects .js-date-close': 'closeErrorPopup',
                'blur.subjects .js-due': 'changeDueDate',
                'click.subjects .js-edit-assignment-name': 'editAssignmentName',
                'click.subjects .js-assignment-edit-cancel': 'cancelAssignmentEdit',
                'click.subjects #save-assignment-name': 'changeAssignmentName',
                'click.walktrough .walkthrough-link': 'adaptiveWalkthrough',
                'click.tab .assign-modal-tab' : 'changeTab',
                'click.quizModal #createNewQuiz' : 'openQuizModal',
                'mousedown.quizModal #closeQuizModal' : 'closeQuizModal',
                'blur.quizModal #editQuestionCount' : 'setQuestionCount',
                'click.quizModal #quizQuestionCount' : 'editQuestionCount',
                'change.quizModal #timeLimitUnit' : 'changeTimeLimit',
                'click.quizModal #createQuiz' : 'createQuiz',
                'click.assignQuiz .js-assign-quiz' : 'openAssignQuizView',
                'click.libraryShow #library-show' : 'showLibrary',
                'click.libraryBack #library-back': 'hideLibrary',
                'click.libraryView .js-quiz-title' : 'showCoverSheetForQuiz',
                'click.close-assign-modal .close-am' : 'closeAssignModal'
            },
            // Once the fetch group call has finished this handler gets called.
            // Close the loading groups modal if open, and render the group list.
        'onGroupFetchDone': function(){
                 groupListInfo = this.context.user.groups;
                 groupFetchDone = true;
                 var loadingRevealIsOpen = $('#loading-groups-modal').hasClass('open');
                 if (loadingRevealIsOpen) {
                     this.renderGroupList();
                       
                     $('.js-due').datepicker({
                        minDate: 0,
                        dayNamesMin: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
                    });
                 }
            },
            'render': function () {
                appSubjectEIDs = this.config.app_subject_eid.split(",");
                groupListInfo = this.context.user.groups || groupListInfo;
                context = this.config.app_name;
                SubjectListData = this;
                controller = this.controller;
                if(context === 'androidPracticeApp'){
                    return this.renderAllBranches();
                }else{
                if (controller.launchContext === 'coversheet'){
                    window.setTimeout( function(){
                        SubjectListData.showCoverSheet();
                    },10);
                }
                if (controller.launchContext === 'scoresheet'){
                    controller.showScoreSheet();
                }

                controller.setTitle( _.template("Assign <%= subject %>Practice", {subject: this.config.app_subject_label + " "}) );
                for(var i=0; i<appSubjectEIDs.length; i++){
                    var appSubjectEID = $.trim(appSubjectEIDs[i]);
                    AssignmentEditController.getBranchesLms(appSubjectEID.toLowerCase(), this.checkForSubjectsNew);
                }
                $('body').addClass('app-view');
                
                var teacherHomeTmpl = this.tmpl;
                // Check to see if which teacher home template to use.
                if ( context === "ltiApp"){
                    teacherHomeTmpl = this.tmpl_ltiTeacherHome;
                }
                return $(teacherHomeTmpl);
                }
            },
        "addAutoComplete" : function(){
                var autoCompleteView = null,
                    artifactType = (context === 'androidPracticeApp') ? 'asmtpractice' : 'domain',
                    appSubjectEids = (context === 'androidPracticeApp') ? ['MAT', 'SCI'] : appSubjectEIDs;
                if(!$("#assignment-search-input").hasClass("ui-autocomplete-input")){ //this class is added by autocomplete so if present then autocomplete is already added
                    autoCompleteView = new AutoCompleteView({
                        "el" : $("#assignment-search-input"),
                        "search" : controller.appServices.searchHints,
                        "artifactType" : artifactType,
                        "subjectEid" : appSubjectEids, 
                         "success" : function(){
                            SubjectListData.searchConcepts();
                        }
                    });
                }
            },
             'showCoverSheetForQuiz' : function(e){ //click handler for quiz title in myQuiz page
                var target = $(e.currentTarget),
                    artifactId = "";
                
                if(target.closest(".js-listitem").length > 0){
                    artifactId = target.closest(".js-listitem").data("artifactid");
                }
                
                if(artifactId){
                    this.showCoverSheet({
                        "eid" : artifactId.toString()
                    });
                }
            },
            'showCoverSheet': function(settings){
                var eid,collectionParams;
                if(settings){
                    eid= settings.eid;
                }else{
                    eid = controller.appUrl.search_params.assignmentEID;
                    if (!eid && controller.coverSheetData) {
                        eid = controller.coverSheetData.eid;
                        collectionParams = controller.coverSheetData.collectionParams;
                    }
                }
                _c.trigger('openCoverSheet', eid, collectionParams);
                $('#assignment-full-page').addClass('hide');
            },
            checkForSubjectsNew: function (subjects, id) {
                if (!this.checkForDescendantError(subjects)) {
                    subjects = subjects.response.branches;
                    _c.renderBranches(subjects, id);
                }
            },
            renderBranches: function (subjects, id) {
                var name, template = '',
                    This = this;
                _.each(subjects, function (branch) {
                    if ( ! ( controller.appContext.config.hidden_branches && 
                        _(controller.appContext.config.hidden_branches).contains(branch.shortname) ) ){
                        name = branch.name || '';
                        template += This.tmpl_subjects({
                            'small': 12,
                            'large': 6,
                            'title': name,
                            'icon': name.toLowerCase().replace(/[\s]+/g, '-'),
                            'encodedID': (branch.subjectID || '') + '.' + (branch.shortname || '')
                        });
                    }
                });
                $('#groups-assignments-subject-' + id).append(template);
                $('#practiceapp_container .teacher-view-container').append($('#assign-groups-modal'));
                if (controller && controller.trigger){
                    controller.trigger("renderBranches");
                }
            },

            renderTopics: function (e) {
                var This, selectTab, Th, branchName, conceptIndex, collectionName;
                var scope = this, asyncHits = 0, collectionData = null, modalityCount = null;
                This = $(e.target).hasClass('js-node-name') ? $(e.target) : $(e.target).closest('.js-node-wrapper').find('.js-node-name');
                selectTab = $('.js-group-assignment-nav.selected').next();
                if (This.text() !== selectTab.find('span').attr('data-text')) {
                    if (!$('#tracks-container').is(':visible')) {
                        $('#branch-name').empty();
                        collectionName = This.attr('data-collection').split(' ').join('-');
                        AssignmentEditController.getCollection({collectionName: collectionName}, function (collection) {
                            collectionData = collection;
                            asyncHits++;
                            if (asyncHits === 2) { // Both the async functions are complete now
                                scope.checkForDescendantsNew(collectionData, modalityCount);
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
                                scope.checkForDescendantsNew(collectionData, modalityCount);
                            }
                        });
                    } else {
                        Th = This.closest('.select-track-wrapper');
                        Th.addClass('js-selected').siblings().removeClass('js-selected');
                        conceptIndex = This.parents('.js-node-wrapper').index();
                        collectionDataPointer = collection.contains[conceptIndex];
                        // Run below function in next event loop and not immediately
                        setTimeout(function(){
                            _c.renderDescendants(collectionDataPointer);
                        },0);
                        $('#no-practice-concept').addClass('hide');
                    }
                    selectTab.find('span').attr('data-text', This.text());
                    selectTab.removeClass('hide-important').addClass('selected').siblings().removeClass('selected');
                    selectTab.next('.js-group-assignment-nav').addClass('hide-important').find('span').attr('data-text', '');
                    This = $('#' + selectTab.attr('data-target'));
                    $('#branch-name').prev().find('span').removeClass();
                    branchName = $('#branch-name-header').attr('data-text');
                    $('#branch-name').prev().find('span').addClass('icon-' + branchName.toLowerCase().replace(/[\s]+/g, '-'));
                    This.removeClass('hide').siblings().addClass('hide');
                    This.find('.js-concept-child-wrapper').empty();
                } else {
                    selectTab.trigger('click').removeClass('hide-important');
                }
                if (controller && controller.trigger) {
                    controller.trigger("renderTopics");
                }
            },
            checkForDescendantsNew: function (subjects, modalityCount) {
                errorShown = false; //reset
                if (!this.checkForDescendantError(subjects) && !this.checkForDescendantError(modalityCount)) {
                    subjects = subjects.response;
                    modalityCount = modalityCount.response;
                    _c.renderDescendants(subjects.collection, modalityCount.featuredModalityTypeCounts);
                }
            },
            renderDescendants: function (tracks, modalityCount) {
                var itemsToRemove = [], conceptCount, i;
                if (1 === $('.js-group-assignment-nav.selected').index()) {
                    collection = tracks;
                    // Iterate through the collection and delete concepts without modalities
                    _.each(collection.contains, function(topic, index){
                        conceptCount = refineTopic(topic, modalityCount);
                        if(!conceptCount){
                            itemsToRemove.push(index);
                        }
                    }); 
                    // Remove concepts without modality
                    while((i = itemsToRemove.pop()) !== undefined){
                        collection.contains.splice(i, 1);
                    }       
                    _c.renderTracks(collection);
                } else {
                    _c.renderConcepts(tracks.contains);
                }
                if (controller && controller.trigger){
                    controller.trigger("renderDecendants");
                }
            },
            renderTracks: function (tracks) {
                var count, template = '';
                tracks = tracks.contains;
                var This = this;
                $('#branch-name').text($('#branch-name-header').attr('data-text'));
                _.each(tracks, function (track) {
                    count = track.contains ? track.conceptCount : 0;
                    if (count) {
                        template += This.tmpl_tracks({
                            'conceptCount': count,
                            'trackName': track.title || '',
                            'encodedID': track.handle || ''
                        });
                    }
                });
                $('#tracks-wrapper').html(template);
                if (controller && controller.trigger){
                    controller.trigger("renderTracks");
                }
            },
            checkForDescendantError: function (subjects) {
                if ('error' === subjects) {
                    if (!errorShown) {
                        errorShown = true;
                        controller.showMessage('Sorry, we could not load the subjects right now. Please try again after some time.');
                    }
                    
                    if(context === 'androidPracticeApp' && SubjectListData.checkNetwork){
                        SubjectListData.checkNetwork();
                    }
                    return true;
                }
                if (subjects.hasOwnProperty('response') && subjects.response.hasOwnProperty('message')) {
                    if (subjects.response.message.match('No such subject')) {
                        if (!errorShown) {
                            errorShown = true;
                            controller.showMessage('Sorry, the subject you are trying to load does not exist.');
                        }
                    } else if (!errorShown) {
                        errorShown = true;
                        controller.showMessage('Sorry, we could not load the subjects right now. Please try again after some time.');
                    }
                    return true;
                }
                errorShown = false;
                return false;
            },
            showSubjects: function (e) {
                console.log("!!");
                var el = $(e.target).closest('.group-assignment-nav'),
                    target = "";
                el.addClass('selected')
                    .siblings().removeClass('selected')
                        .filter(".tab-library").addClass('hide-important');
                el = el.attr('data-target');
                target = el;
                el = $('#' + el);
                el.removeClass('hide').siblings().addClass('hide');
                
                if(typeof SubjectListData.changeState === "function"){
                    SubjectListData.changeState(target);
                }
                
                if(typeof SubjectListData.animate === "function"){
                    SubjectListData.animate($("#" + target), 'slideinleft');
                }
            },
            renderConcepts: function (concepts) {
                var conceptItemButton = "";
                var conceptRowTemplate;
                if (this.config.lms_provider === "edmodo"){
                    conceptItemButton = "Assign";
                }
                conceptRowTemplate = createConceptRowTemplate(this.tmpl_concepts, concepts, 1, conceptItemButton);

                if ($('.js-search-open').is(':visible')) {
                    $('#concept-heading').html($('#tracks-wrapper').find('.js-selected').html());
                    $('#concept-heading').prepend($('#branch-image').html());
                    $('#concepts-wrapper').html(conceptRowTemplate.template);
                    $('#concept-heading').find('.concept-count').text(conceptRowTemplate.conceptCount + ' concepts');
                } else {
                    searchBackHTML = $('<div>' + searchBackHTML + '</div>');
                    searchBackHTML.find('#concepts-wrapper').html(conceptRowTemplate.template);
                    searchBackHTML.find('#concept-heading').html($('#tracks-wrapper').find('.js-selected').html());
                    searchBackHTML.find('#concept-heading').prepend($('#branch-image').html());
                    searchBackHTML.find('#concept-heading').find('.concept-count').text(conceptRowTemplate.conceptCount + ' concepts');
                    searchBackHTML = searchBackHTML.html();
                }
                if (controller && controller.trigger){
                    controller.trigger("renderConcepts");
                }
            },

            assignConcepts: function (e) {
                //TODO: assignment modal should be an independent view.
                e.stopPropagation();
                if ($(".ui-widget.ui-autocomplete").css("display") !=="none"){
                    $(".ui-widget.ui-autocomplete").css("display","none");
                }
                var This = $(e.target),
                    concept_row = This.closest('.js-select-concept-wrapper'),
                    concept_eid = concept_row.attr('data-encodedid'),
                    concept_title = concept_row.find('.js-concept-name').text(),
                    artifact_id = concept_row.data('artifactid'); //ArtifactID for quiz (invoked from "My Quizzes")
                    this.current_concept = {
                        eid: concept_eid.replace(/\-/g,'.'),
                        handle: concept_row.attr('data-handle'),
                        conceptCollectionHandle: concept_row.attr('data-concept-collection-handle'),
                        collectionHandle: concept_row.attr('data-collection-handle'),
                        collectionCreatorID: concept_row.attr('data-collection-creator-ID'),
                        conceptCollectionAbsoluteHandle: concept_row.attr('data-concept-collection-absolute-handle')
                    };
                    
                if(adaptive){ //for adaptive assign modal, replace current modal with adaptive assign modal template and fetch user quizzes and adaptive practice info 
                    concept_eid = concept_eid.replace(/-/g, ".");
                    
                    $(".assign-header-wrapper").html(SubjectListData.tmpl_adaptiveModal({
                        "title" : concept_title,
                        "concept_eid" : concept_eid,
                        "handle" : concept_row.attr('data-handle')
                    }));
                    
                    $(".assign-group-modal").removeClass("quiz-list-view quiz-assign-view").addClass("adaptive");
                    SubjectListData.renderAssignmentInfo(concept_eid);
                    if(artifact_id){ //if artifact_id is given then open quiz assign view for quiz with artifact id
                        SubjectListData.changeTab(null, {
                            "tab" : "myQuiz",
                            "view" : "quizAssign"
                        });
                        SubjectListData.getQuizzes(concept_eid, {
                            "assignView" : true,
                            "artifactId" : artifact_id 
                        });
                    }else{
                        SubjectListData.getQuizzes(concept_eid);
                    }
                    $(".concept-header-text", "#adaptivePracticeContainer").text(concept_title).attr('title', concept_title); 
                }else{
                    $('.concept-header-text').text(concept_title).attr('title', concept_title);
                }
                
                $('.groups-list-container').addClass('hide');
                $('#lms-group-list').empty();
                $('#lms-assigned-group-list').empty();
                $('.js-confirm-assign').addClass('js-disabled').addClass('disabled').removeClass('turquoise').addClass('grey');
                if(This.hasClass('coversheet-assign-button')) {
                    $('.dashboard-modal-wrapper').addClass('coversheet-open');
                }
                if (!groupFetchDone) {
                    $('#loading-groups-modal').foundation('reveal', 'open');
                } else {
                    this.renderGroupList();
                    $('.js-due').datepicker({
                        minDate: 0,
                        dayNamesMin: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
                    });
                }
            },
            postConceptComplete: function () {
                window.location.reload();
            },
            showPractice: function (e) {
                if(!$(e.target).hasClass('js-assign-concept')) {
                    var This = $(e.target).closest('.select-concept-wrapper'),
                    /*var handle = $(This).attr("data-handle"),
                    branchHandle = $(This).attr("data-parent-handle"),*/
                    collectionParams = {
                        collectionHandle: $(This).attr("data-collection-handle") || '',
                        conceptCollectionAbsoluteHandle: $(This).attr("data-concept-collection-absolute-handle") || '',
                        conceptCollectionHandle: $(This).attr("data-concept-collection-handle") || '',
                        collectionCreatorID: $(This).attr("data-collection-creator-ID") || '',
                    },
                    encodedId = $(This).attr("data-encodedid").replace(/\-/g, '.');
                    var conceptTitle = '';

                    conceptTitle = $.trim($(This).find('.js-concept-name').html());
                    if($('.dashboard-modal-wrapper').length) {
                        $('.dashboard-modal-wrapper').find('.js-select-concept-wrapper').attr('data-encodedid', encodedId);
                    }
                    _c.trigger('openCoverSheet', encodedId, collectionParams);
                    $('#assignment-full-page').addClass('hide');
                }

            },
            removePractice: function () {
                $('.dashboard-modal-wrapper').removeClass('coversheet-open');
                $('.concept-coversheet').foundation("reveal", "close");
                $('#assignment-full-page').removeClass('hide');
            },
            openSearch: function(e) {
                var This = $(e.target).closest('.js-search-open');
                visible = $('#groups-assignment-container').children(':visible');
                visible.addClass('hide');
                $('#concepts-container').removeClass('hide').addClass("js-search-view");
                searchBackHTML = $.trim($('#concepts-container').find('.js-list-left').html());
                $('.js-search-heading').addClass('hide');
                $('#concept-heading').empty();
                $('#concepts-wrapper').empty();
                $('#no-practice-concept').addClass('hide');
                $('#assignment-search-input').val('');
                $('#assignment-search-input').removeClass('hide');
                This.parents('.assignment-subject-list').addClass('hide').next().removeClass('hide');
                $('#assignment-search-input').focus();
                $('#assignment-search-input').trigger('click');
                if (context === "ltiApp") {
                    $(".assignment-search-container").css({
                        "padding-left": "44px",
                        "padding-top": "8px"
                    });
                    $("#groups-assignment-container").css("padding-top", "0px");
                }
                if($(window).width() <= 475){
                        $("#assignment-search-input").attr('placeholder','Search for a topic.');
                }
                else{
                        var placeholder = 'Search for a topic. For example: Photosynthesis';
                        if (context === "edmPracticeMath" || context === "athenaMathResources"){
                            placeholder = 'Search for a topic. For example: Linear Equations';
                        }
                    $("#assignment-search-input").attr('placeholder', placeholder);
                }
                
                this.current_list_type = $("#groups-assignment-container").attr("data-type"); //in app tablet view we are showing both concepts and tracks so storing curent type
                $("#groups-assignment-container").attr("data-type", "");
                $("body").addClass('app-search-view'); //in app for search we need background color 
                
                this.addAutoComplete();
            },
            closeSearch: function(e) {
                var This = $(e.target).closest('.js-search-close');
                This.parents('.assignment-search-container').addClass('hide').prev().removeClass('hide');
                $('#concepts-container').addClass('hide').removeClass("js-search-view");
                visible.removeClass('hide');
                $('.js-search-heading').removeClass('hide');
                $('#concepts-container').find('.js-list-left').html(searchBackHTML);
                $(".ui-widget.ui-autocomplete").css("display","none");
                $("#groups-assignment-container").attr("data-type", this.current_list_type);
                $("body").removeClass('app-search-view');
                if (context === 'ltiApp'){
                    $("#groups-assignment-container").css("padding-top", "44px");
                }
                
                if(typeof SubjectListData.setSearchTerm === "function"){
                    SubjectListData.setSearchTerm("");
                }
            },
            searchConcepts: function() {
                var artifactType = ("androidPracticeApp" === context) ? "asmtpractice" : "domain,asmtquiz";
                var ck12only = ("androidPracticeApp" === context) || (/^athena.*Resources/g).exec(context) ? "true" : "false";
                searchVal = $.trim($('#assignment-search-input').val());
                $('.js-search-heading').addClass('hide');
                $('#concepts-wrapper').empty();
                $('#concept-heading').empty();
                $("#concepts-wrapper").removeClass("blurred");
                if (searchVal) {
                    $(".ui-widget.ui-autocomplete").css("display","none"); //to hide the virtual keypad if open
                    controller.appServices.searchLms({
                        "callback" : this.checkForSearch,
                        "value" : searchVal,
                        "artifactType" : artifactType,
                        "ck12only": ck12only
                    });
                } else {
                    $('#concept-heading').html('<p>Please enter keywords.</p>');
                }
            },
            renderSearch: function(result) {
                var eID, count, template = '', parentHandle, This = this, conceptName = "", appSubjectEID;
                var searchItemButton = "", collectionIndex, collectionData, len, collectionHandle, collectionTitle;
                var conceptCollectionAbsoluteHandle = '', foundCanonical, collectionCreatorID;
                result = result.Artifacts;
                if (this.config.lms_provider === "edmodo"){
                    searchItemButton = "Assign";
                }
                if (appSubjectEIDs.length === 1){
                    appSubjectEID = $.trim( appSubjectEIDs[0] );
                }
                if ($('.js-search-close').is(':visible')) {
                    $('#assignment-empty-search-container').removeClass('hide');
                    $('#assignment-search-suggestion').parent().removeClass('hide');
                    if (result.result instanceof Array && result.result.length) {
                        _.each(result.result, function (resultData) {
                            conceptName = resultData.name;
                            collectionHandle = '';
                            if (resultData.hasOwnProperty('parent')) {
                                parentHandle = resultData.parent.handle || '';
                                if(!This.config.lms_provider !== "edmodo"){
                                  parentHandle = resultData.branchInfo.handle || '';
                                }
                            } else {
                                parentHandle = '';
                            }

                            foundCanonical = false;                            
                            if (resultData.hasOwnProperty('collections') && resultData.collections.length) {
                                collectionData = resultData.collections;
                                for (collectionIndex = 0, len = collectionData.length; collectionIndex < len; collectionIndex++) {
                                    if (collectionData[collectionIndex].isCanonical && collectionData[collectionIndex].exactMatch) {
                                        collectionHandle = collectionData[collectionIndex].collectionHandle;
                                        collectionTitle = collectionData[collectionIndex].collectionTitle;
                                        conceptCollectionAbsoluteHandle = collectionData[collectionIndex].conceptCollectionAbsoluteHandle;
                                        collectionCreatorID = collectionData[collectionIndex].collectionCreatorID;
                                        conceptName = collectionData[collectionIndex].conceptCollectionTitle + " (" + collectionTitle + ")";
                                        // bring modality data to root level
                                        resultData.modalityCount = collectionData[collectionIndex].ck12ModalityCount;
                                        for (var modality in collectionData[collectionIndex].communityModalityCount) {
                                             if(resultData.modalityCount[modality]) {
                                                resultData.modalityCount[modality]['at grade'] = (resultData.modalityCount[modality]['at grade'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['at grade'] || 0);
                                                resultData.modalityCount[modality]['basic'] = (resultData.modalityCount[modality]['basic'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['basic'] || 0);
                                             } else {
                                                resultData.modalityCount[modality] = collectionData[collectionIndex].communityModalityCount[modality];
                                            } 
                                        }
                                        foundCanonical = true;						
                                        break;
                                    } else if (collectionData[collectionIndex].isCanonical && !foundCanonical) {
                                        collectionHandle = collectionData[collectionIndex].collectionHandle;
                                        collectionTitle = collectionData[collectionIndex].collectionTitle;
                                        conceptCollectionAbsoluteHandle = collectionData[collectionIndex].conceptCollectionAbsoluteHandle;
                                        collectionCreatorID = collectionData[collectionIndex].collectionCreatorID;
                                        conceptName = collectionData[collectionIndex].conceptCollectionTitle + " (" + collectionTitle + ")";
                                        // bring modality data to root level
                                        resultData.modalityCount = collectionData[collectionIndex].ck12ModalityCount;
                                        for (var modality in collectionData[collectionIndex].communityModalityCount) {
                                             if(resultData.modalityCount[modality]) {
                                                resultData.modalityCount[modality]['at grade'] = (resultData.modalityCount[modality]['at grade'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['at grade'] || 0);
                                                resultData.modalityCount[modality]['basic'] = (resultData.modalityCount[modality]['basic'] || 0) + (collectionData[collectionIndex].communityModalityCount[modality]['basic'] || 0);
                                             } else {
                                                resultData.modalityCount[modality] = collectionData[collectionIndex].communityModalityCount[modality];
                                            } 
                                        }
                                        foundCanonical = true;
                                    }
                                }
                            }
                            if (!foundCanonical && resultData.hasOwnProperty('branchInfo')) {
                                conceptName = conceptName + " (" + resultData.branchInfo.name + ")";
                            }
                            
                            if (resultData.hasOwnProperty('modalityCount') && resultData.modalityCount.hasOwnProperty('asmtpractice') && appSubjectEIDs.indexOf( resultData.encodedID.slice(0, 3)) > -1 ) {
                                count++;
                                eID = (resultData.encodedID || '').replace(/\./g, '-');
                                template += This.tmpl_concepts({
                                    'conceptName': conceptName || '',
                                    'handle': resultData.handle || '',
                                    'parentHandle': parentHandle,
                                    'collectionHandle': collectionHandle || '',
                                    'collectionCreatorID': collectionCreatorID || '',
                                    'conceptCollectionAbsoluteHandle': conceptCollectionAbsoluteHandle || '',
                                    'encodedID': eID,
                                    'isChecked': $('.js-add-concepts-wrapper').find('[data-encodedID="' + eID + '"]').length ? 'checked' : '',
                                    'buttonText': searchItemButton
                                });
                            }
                        });
                        if(template) {
                            $('#concepts-wrapper').html(template);
                            $('.js-search-heading').removeClass('hide');
                        } else {
                            this.renderEmptySearch(result.suggestions);
                        }
                    } else {
                        this.renderEmptySearch(result.suggestions);
                    }
                }
            },
            renderEmptySearch: function(result) {
                $('#concept-heading').parent().addClass('assignment-search-no-padding');
                require(['text!groups/templates/groups.assignment.search.empty.html'], function (template) {
                    //var artifactType = ("androidPracticeApp" === context) ? "asmtpractice" : "domain,asmtquiz";
                    $('#concept-heading').html(template);
                    searchVal = searchVal.toLowerCase();
                    if (searchVal && result[searchVal] && result[searchVal][0] !== searchVal) {
                        $('#assignment-search-suggestion').text(result[searchVal][0]);
                        AssignmentEditController.searchLms(_c.checkForSearch, result[searchVal][0]);
                        searchVal = '';
                    } else {
                        $('#assignment-empty-search-container').removeClass('hide');
                    }
                });
            },
            checkForSearch: function(search) {
                if ('error' === search) {
                    if(context === 'androidPracticeApp' && SubjectListData.checkNetwork){
                        SubjectListData.checkNetwork();
                    }
                    console.log('Sorry, we cannot perform this search right now. Please try again later.');
                } else if (search.hasOwnProperty('response') && search.response.hasOwnProperty('message')) {
                    controller.showMessage('Sorry, we cannot perform this search right now. Please try again later.');
                } else {
                    _c.renderSearch(search.response);
                }
            },
            callSearch: function(event) {
                if (13 === (event.keyCode || event.which)) {
                    $('.js-search').trigger('click');
                }
            },

            closeAssignModal: function() {
                $('#apply-due-date').detach();
            },

            renderGroupList: function() {
                var _c = this, templateUnassigned = '';
                this.setSelectGroupsButtonIcon('none',false);
                _.each(groupListInfo, function (group) {
                    templateUnassigned += _c.tmpl_groups({
                        'groupName': group.lmsGroups[0].title,
                        'ck12GroupID': group.id,
                        'lmsGroupID': group.lmsGroups[0].providerGroupID
                    });
                });
                var applygroups = _c.tmpl_applyDueDate({dueDate: '',dueValue:''});
                
                if ($('#apply-selected-due-date').find('#apply-due-date').length === 0){
                    $('#apply-selected-due-date').append( applygroups);
                }
                $('#lms-group-list').append(templateUnassigned);
                $('.groups-list-container').removeClass('hide');
                if(!$('.assignment-name-edit-wrapper').hasClass('hide')) {
                    $('.js-assignment-edit-cancel').trigger('click');
                }
                if(groupListInfo.length === 1) {
                    $('.group-select-header').addClass('hide').next().addClass('left');
                    $('.group-list-name').addClass('hide').next().addClass('left');
                    $('.assign-group-modal').addClass('single-group-container');
                    $('.group-context').text(groupListInfo[0].lmsGroups[0].title);
                    $('.concept-header-text').removeClass('single-group-concept-header');
                }
                $('#assign-groups-modal').foundation('reveal', 'open');
            },
            renderAssignmentInfo : function(eid){ //render adaptive practice info
                //var template = null;
                if(eid){
                    controller.appServices.getAdaptivePracticeInfo(eid).done(function(response){
                        $(".assignment-goal", "#assignmentInfo").html("Get " + response.test.goal + " correct answers");
                        $(".assignment-time-limit", "#assignmentInfo").html(SubjectListData.getTimeLimit(response.test.policies));
                        $("#assignmentInfo").attr("data-question-count", getQuestionCount(response.test.itemsInput[0]["questionsCount"]));
                    }).fail(function(){
                        $("#assignmentInfo").addClass("hide");
                    });
                }
                
                function getQuestionCount(countObject){
                    var count = 0;
                    for(var key in countObject){
                        if(countObject.hasOwnProperty(key)){
                            count = count + parseInt(countObject[key], 10);
                        }
                    }
                    return count;
                }
                
            },
            getQuizzes : function(eid, options){
            	if(controller.appContext.user.quizzes !== undefined && !(options && options.assignView)){
            		SubjectListData.renderQuizzes(eid, controller.appContext.user.quizzes, options);
            	}else{
                        var artifactID = (options && options.artifactId) ? options.artifactId : "";
            		controller.appServices.getQuizzes(artifactID).done(function(data){
                		var quizzes = [],quiz = null;
                    	if(data.response.tests){
                    		for(var i = 0; i < data.response.tests.length; i++){
                    			quiz = data.response.tests[i];
                    			quizzes[quiz._id] = quiz;
                    		}
                    		
                    		//if(controller.appContext.user.quizzes === undefined){
                    			controller.appContext.user.quizzes = quizzes;
                    		//}
                    		
                    		SubjectListData.renderQuizzes(eid, controller.appContext.user.quizzes, options);
                    	}
                    }).fail(function(){
                       
                    });
                }
            },
            renderQuizzes : function(eid, quizzes, options){
                var template = [],
                    container = $("#quizContainer"),
                    selectedRow = null;
                
                    for(var key in quizzes){
                        if(quizzes.hasOwnProperty(key) && quizzes[key].encodedIDs.indexOf(eid) > -1){
                            template.push(SubjectListData.tmpl_quizzes({
                                'quizName': quizzes[key].title,
                                'id': key,
                                "artifactID" : quizzes[key].artifactID
                            }));
                        }
                    }
                    
                    if(template.length > 0){
                        container.html(template.join(""));
                        container.append("<div class='separator'></div>");
                    }
                    
                    if(options && options.assignView && options.artifactId){ //if arifactId is passed then change tab to quiz and render assign view for required quiz(artifactID)
                        selectedRow = container.find("[data-artifact-id=" + options.artifactId + "]");
                        if(selectedRow.length > 0){
                            selectedRow.find(".js-assign-quiz").trigger("click.assignQuiz");
                        }
                    }
            },
            toggleApplySelectedDueDate: function(icon){
        var toggleRow = $('#apply-due-date');
                var showFor = ["all","some"];
        var visible = toggleRow.is(':visible');
        if ( !visible && showFor.indexOf(icon) !==-1){
            toggleRow.slideDown("slow");	
        }else if ( visible && icon === "none"){
            toggleRow.hide("slow");
        }
        },
        setSelectGroupsButtonIcon: function(icon,checked){
                var iconClasses = {'all': 'icon-validated',
                                   'some': 'icon-apply-some',
                                   'none': ''};
                var groupsButton = $('#toggle-group-button');
                var iconElement = $('#icon-for-toggle');
        
                iconElement.attr('class', iconClasses[icon]);
                // Set the property to ensure the box is checked.
                groupsButton.data('selected', icon);
                groupsButton.prop("checked", checked);
                this.toggleApplySelectedDueDate(icon);
            },
            selectGroup: function(e) {
                var This = $(e.target).closest('.js-group-list');
                if (This.closest('#lms-assigned-group-list').size() !== 0){
                    return false;
                }
                if(This.hasClass('selected') && !$('#ui-datepicker-div').is(':visible')) {
                    This.parents('.js-group-row').find('.js-due').val('').attr('value', '');
                }
                This.toggleClass('selected').find('.js-concept-check').toggleClass('checked');
                this.checkForAllSelection();
                this.checkForAssignment();
            },
            toggleSelectGroups: function(e) {
                var This = $(e.target);
                if (This.is(":checked")) {
                    $('.js-group-list').not('.selected').find('.js-concept-check').trigger('click');
                } else {
                    $('.js-group-list.selected').find('.js-concept-check').trigger('click');
                }
                this.checkForAllSelection();
            },
            applySelectedDueDate: function(e) {
                var dueDate = e.val();
                var needDates = $('.js-group-list.selected').find('.js-concept-check');
        needDates.each(function(i){
                    var el = $(this).parents(".group-list-wrapper").find(".due-date");
            el.val(dueDate);
        });
            },
            checkForAllSelection: function() {
                var unselectedCount = $('.unassigned-list-wrapper').find('.js-group-list').not('.selected').length;
                var selectedCount = ($('#lms-group-list .js-group-row').length) - unselectedCount;
        var checkboxIcon = 'none';
                var checkedBox = false;
                if (selectedCount > 1){
                    if (unselectedCount === 0 ) {
                        checkboxIcon = 'all';
                checkedBox = true;
                    // Else at least two groups are selected
                    } else { 
                        checkboxIcon = 'some';
                        checkedBox = true;
                    }
                } 
           
                this.setSelectGroupsButtonIcon(checkboxIcon,checkedBox);

            },
            openDatePicker: function(e) {
                e.stopPropagation();
                var This = $(e.target);
                // Remove input error Bug 47774
                var groupsSelected = $('.unassigned-list-wrapper .js-group-list.selected');
                groupsSelected.parent().find('input[value=""]').removeClass('input-error2');
                groupsSelected.parent().find('.js-empty-date').addClass('hide'); 
                //This.removeClass('input-error2');
                if (This.parent().siblings('.js-invalid-date').is(':visible') || This.parent().siblings('.js-before-date').is(':visible') || This.parent().siblings('.js-empty-date').is(':visible')) {
                    This.val('');
                    $('.js-invalid-date').addClass('hide');
                    $('.js-before-date').addClass('hide');
                    $('.js-empty-date').addClass('hide');
                }
                $('.ui-datepicker-prev').addClass('icon-arrow_left');
                $('.ui-datepicker-next').addClass('icon-arrow_right');

                // Bug #47765
                $('.ui-datepicker-prev').text('');
                $('.ui-datepicker-next').text('');
                $('.ui-datepicker-title').insertAfter('.ui-datepicker-prev');
                $('.ui-datepicker-title').css({"display":"inline","padding-left":"5px", "padding-right":"5px"});
                $('.ui-datepicker-header').css({"padding-top":"10px"});
                $('.ui-datepicker-header').addClass("text-center");
            },

            cancelAssign: function() {
                $('#apply-due-date').detach();
                $('#assign-groups-modal').foundation('reveal', 'close');
            },
            confirmAssign: function(){
                if(!$('.js-confirm-assign').hasClass('js-disabled')) {
                    if (assignmentInProgress){
                        return false;
                    }
                    var assignments = [],
                    emptyDue = [],
                    isDueDateEmpty = false,
                    grp_info,
                    due_date,
                    handle,
                    assignmentName = $('#assignment-name').text(),
                    launch_key = null, // appServices.assign() expects this
                    assignQuizContainer = $("#assignQuiz"),
                    concept = '';
                    $('.unassigned-list-wrapper .js-group-list.selected').each(function(){
                        if($(this).parents('.js-group-row').find('.js-due').val().length === 0) {
                            emptyDue.push($(this).parents('.js-group-row').find('.js-due'));
                            isDueDateEmpty = true;
                            return true;
                        }
                    });
                    if(!isDueDateEmpty) {
                        if(!$('.js-date-popup').is(':visible')) {
                            $('#assign-groups-modal .js-group-row').each(function(){
                                 if ($(this).find('.js-group-list.selected').size()){
                                     grp_info = $(this).data();
                                     //console.log(grp_info);
                                     due_date = $(this).find('.js-due').val();
                                     if (due_date){
                                         due_date = due_date.split('/');
                                         due_date = due_date[2] + '-' + due_date[0] + '-' + due_date[1];
                                     }
                                     assignmentInProgress = true;
                                     if(assignQuizContainer.length > 0 && assignQuizContainer.hasClass("active")){ //for assigning quiz
                                         quizAssignment = true;
                                         handle = assignQuizContainer.attr("data-handle") + '-' + new Date().getTime().toString();
                                         assignmentName = assignQuizContainer.attr("data-title");
                                         _c.current_concept.eid = assignQuizContainer.attr("data-artifact-id");
                                     }else{
                                         handle = _c.current_concept.handle + '-' + new Date().getTime().toString();
                                     }
                                     // EID, ck12_group_id, lms_group_id, title, due_date, assign_handle, launch_key
                                     // Check for ascii chracters in the title
                     if (/[^ -~]+/.test(assignmentName)){
                         errorShown = true;
                         controller.showMessage('The assignment title contains characters that are not supported. Please edit the title before continuing.');
                    assignmentInProgress = false;
                                        _c.editAssignmentName();
                    } else {
                        concept = _c.current_concept.eid + '||'; //no context url hence double pipe
                        if (_c.current_concept.collectionHandle || _c.current_concept.conceptCollectionHandle) {
                            concept += (_c.current_concept.conceptCollectionHandle || 
                                ( _c.current_concept.collectionHandle + '-::-' + _c.current_concept.conceptCollectionAbsoluteHandle)) +
                               '|' +  _c.current_concept.collectionCreatorID;
                        } else {
                            concept += '|';
                        }
                        assignments.push(controller.appServices.assign(
                            _c.current_concept.eid,
                            grp_info.ck12groupid,
                            grp_info.lmsgroupid,
                            assignmentName,
                            due_date,
                            handle,
                            launch_key,
                            concept
                        ));
                        $('#assign-groups-modal .close-reveal-modal').trigger('click');
                    }
                                 }
                             });
                        }
                    } else {
                        emptyDue[0].parent().siblings('.js-empty-date').removeClass('hide');
                        $('.unassigned-list-wrapper .js-group-list.selected').parent().find('input[value=""]').addClass('input-error2');
                    }
                    if (assignments.length !== 0){
                        $.when.apply($, assignments).done(function(){
                            controller.showMessage("Your assignment has been posted to " + controller.appContext.config.provider_display_name + ".");
                            assignmentInProgress = false;
                        }).fail(function(){
                            controller.showMessage("There was an error while creating assignments on " + controller.appContext.config.provider_display_name + ". Please try again later.");
                            assignmentInProgress = false;
                        });
                    }
                //$('.reveal-modal-bg').hide();
                }
            },

            checkForAssignment: function() {
                if ($('.js-group-list.selected').length && !$('.lms-assignment-name-wrapper').hasClass('hide')) {
                    $('.js-confirm-assign').removeClass('disabled').removeClass('js-disabled').removeClass('grey').addClass('turquoise');
                } else {
                    $('.js-confirm-assign').addClass('disabled').addClass('js-disabled').removeClass('turquoise').addClass('grey');
                }
            },
            changeDueDate: function(e) {
                var This = $(e.target),
                    _c = this,
                    isDateValid = true,
                    isDateBefore = false,
                    due = This.val();
                    
                This.removeClass('input-error2');
                This.parent().siblings('.js-date-popup').addClass('hide');
                
                This.attr('value', due);
                if (due) {
                    if (!_c.isValidDate(due)) {
                        This.parent().siblings('.js-invalid-date').removeClass('hide');
                        This.addClass('input-error2');
                        isDateValid = false;
                        this.selectConceptWithDue(This, isDateValid);
                        return;
                    }
                    if (_c.isBeforeDate(due)) {
                        This.parent().siblings('.js-before-date').removeClass('hide');
                        This.addClass('input-error2');
                        isDateBefore = true;
                        this.selectConceptWithDue(This, isDateBefore);
                        return;
                    }
                    this.selectConceptWithDue(This, true);
                }
            },
            selectConceptWithDue: function(This, isDate) {
                var conceptContainer = This.parents('.js-group-row').find('.js-group-list');
                if(isDate && !conceptContainer.hasClass('selected')) {
                    conceptContainer.trigger('click');
                } else if (!isDate && conceptContainer.hasClass('selected')) {
                    conceptContainer.trigger('click');
                }   
        // If date applied from groups date selector, apply date to all selected groups.
        if (This.data("applySelected")){
                    this.applySelectedDueDate(This);
                }
            },
            isValidDate: function(checkDate) {
                if (!new Date(checkDate).getYear()) {
                    return false;
                }
                checkDate = checkDate.split('/');
                if (3 !== checkDate.length) {
                    return false;
                }
                if (12 < parseInt(checkDate[0], 10)) {
                    return false;
                }
                if (31 < parseInt(checkDate[1], 10)) {
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
            },
            isBeforeDate: function(checkDate) {
                checkDate = checkDate.split('/');
                checkDate = checkDate.join('/');
                checkDate = new Date(checkDate);
                if ((new Date() - checkDate) > (86400 * 1000)) {
                    return true;
                }
                return false;
            },
            closeErrorPopup: function(e) {
                var This = $(e.target);
                This.parent().addClass('hide');
                $('.js-due.input-error2').removeClass('input-error2').val('').attr('value', '');
                //This.parent().siblings('.due-date-container').find('.js-due').removeClass('input-error2').val('');
            },
            renderAllBranches : function(){
                var branches = controller.appServices.getAllBranches(), name, template_science = '', template_math = '',template_ele = '', This = this,
                    subjectTmpl = $(this.practice_tmpl),
                    col = 12,
                    isPracticeApp = (context === 'androidPracticeApp');
                
                _.each(branches, function (branch) {
                    name = branch.name || '';
                    
                    if(branch.subjectID === 'MAT'){
                        if(branch.shortname.indexOf('EM') === 0){
                            col = isPracticeApp ? 4 : 12;
                            template_ele = template_ele + This.tmpl_subjects({
                                'small': 12,
                                'large': col,
                                'title': name,
                                'icon': "elementary-math-" + name.toLowerCase().replace(/[\s]+/g, '-'),
                                'encodedID': (branch.subjectID || '') + '.' + (branch.shortname || '')
                            });
                        }else{
                            col = isPracticeApp ? 4 : 6;
                            template_math = template_math + This.tmpl_subjects({
                                'small': 12,
                                'large': col,
                                'title': name,
                                'icon': name.toLowerCase().replace(/[\s]+/g, '-'),
                                'encodedID': (branch.subjectID || '') + '.' + (branch.shortname || '')
                            });
                        }
                    }else if(branch.subjectID === 'SCI'){
                        col = isPracticeApp ? 4 : 12;
                        template_science = template_science + This.tmpl_subjects({
                            'small': 12,
                            'large': col,
                            'title': name,
                            'icon': name.toLowerCase().replace(/[\s]+/g, '-'),
                            'encodedID': (branch.subjectID || '') + '.' + (branch.shortname || '')
                        });
                    } 
                });
                
                subjectTmpl.find('#groups-assignments-subject-mat').append(template_math);
                subjectTmpl.find('#groups-assignments-subject-sci').append(template_science);
                subjectTmpl.find('#groups-assignments-subject-ele').append(template_ele);
                
                $('body').addClass('practice-app-view');
                
                return subjectTmpl;
            },
            editAssignmentName : function() {
                if(!quizAssignment){
                    $('.lms-assignment-name-wrapper').addClass('hide');
                    $('.assignment-edit-name-wrapper').removeClass('hide');
                    $('#assignment-name-input').val($('.concept-header-text').first().text());
                }else{
                    $('.lms-quiz-name-wrapper').addClass('hide');
                    $('.assignment-edit-name-wrapper').removeClass('hide');
                    $('#quiz-assignment-name-input').val($('#assignQuiz').attr("data-title"));
                }
                this.checkForAssignment();
            },
            cancelAssignmentEdit : function() {
                if (!quizAssignment){
                    $('.lms-assignment-name-wrapper').removeClass('hide');
                    $('.assignment-edit-name-wrapper').addClass('hide');
                }else{
                    $('.lms-quiz-name-wrapper').removeClass('hide');
                    $('.assignment-edit-name-wrapper').addClass('hide');
                    quizAssignment = false;
                    errorShown = false;
                }
                this.checkForAssignment();
            },
            changeAssignmentName : function() {
                if( !quizAssignment && $.trim($('#assignment-name-input').val())) {
            $('#assignment-name-input').removeClass('error');
            $('.concept-header-text').text($('#assignment-name-input').val());
            $('.lms-assignment-name-wrapper').removeClass('hide');
            $('.assignment-edit-name-wrapper').addClass('hide');
        } else if (quizAssignment) {
                    var title = $('#quiz-assignment-name-input').val();
                    $('#quiz-assignment-name-input').removeClass('error');
            $('.concept-header-text').text(title);
                    $('#assignQuiz').attr("data-title",title);
                    $('.lms-quiz-name-wrapper').removeClass('hide');
                    $('.assignment-edit-name-wrapper').addClass('hide');
                    errorShown = false;
        } else {
            $('#assignment-name-input').addClass('error');
            if (!errorShown) {
                errorShown = true;
            controller.showMessage('Please enter a title for the assignment');
            }
        }
        this.checkForAssignment();
        errorShown = false;
            },
            getTimeLimit : function(policies){ //get value of timelimit policy 
                var timeLimit = 0;
                
                for(var i = 0; i < policies.length; i++){
                    if(policies[i].name === "timelimit"){
                        timeLimit = policies[i].value;
                        break;
                    }
                }
                
                if(timeLimit > 1){
                    timeLimit = Math.floor(timeLimit/60);
                    timeLimit = timeLimit + (timeLimit > 1 ? " mins" : " min");
                }else{
                    timeLimit = "Unlimited";
                }
                
                return timeLimit;
            },
            adaptiveWalkthrough: function() {
                 this.walkthroughRender();
                 $("#walkthrough").removeClass("hide");
            },
            changeTab : function(e, options){ //function used to change assign modal tabs
                var target = null,
                    container = $("#assignTabContainer"),
                    tab = null;
                
                if(e){
                    tab = $(e.currentTarget);
                }else if(options && options.tab){
                    tab = (options.tab === "myQuiz") ? container.find("[data-target=myQuizContainer]") : container.find("[data-target=adaptivePracticeContainer]");
                }
                
                target = tab.attr("data-target");
                container.find(".assign-modal-tab").addClass("hide");
                container.find(".active").removeClass("active");
                
                $("#assign-groups-modal").removeClass("quiz-list-view quiz-assign-view");
                
                if(target){
                    $("#adaptivePracticeContainer, #myQuizContainer").addClass("hide");
                    $("#" + target).removeClass("hide");
                    tab.addClass("active");
                    
                    if(target === "myQuizContainer"){ //in myQuiz tab we have two main view, quiz list and quiz assign.
                        _c.cancelAssignmentEdit();
                        if(options && options.view === "quizAssign"){
                            $("#assignTabContainer").addClass("hide");
                            $("#assign-groups-modal").addClass("quiz-assign-view");
                        }else{
                            $("#assign-groups-modal").addClass("quiz-list-view");
                        }
                    }else{
                        $("#assignQuiz").removeClass("active");
                    }
                }
            },
            openQuizModal : function(){ //will be called when user clicks on create new Quiz modal
                var maxCount = parseInt($("#assignmentInfo").attr("data-question-count"), 10),
                    count = (maxCount > 20) ? 20 : maxCount;
                
                $("#createNewQuiz").addClass("hide");
                $("#createQuizModal").removeClass("hide");
                $("#quizTitle").val("").closest(".quiz-title-wrapper").removeClass("alert");
                $("#quizError").addClass("hide");
                if($("#quizContainer").find(".js-assign-quiz-wrapper").length === 0){ //if there is no quiz then hide 
                    $("#quizContainer").addClass("hide");
                }
                $("#editQuestionCount").val(count).focus().attr("data-count", count);
                $("#quizTotalQuestionCount").html(maxCount);
                
                $("#timeLimitUnit").val("unlimited").trigger("change");
                $("#timeLimitUnit").siblings(".custom.dropdown").find(".current").attr("title", $("#timeLimitUnit").val());
                $("#createQuizModal").addClass("open");
            },
            closeQuizModal : function(){ 
                $("#createNewQuiz,#quizContainer").removeClass("hide");
                $("#createQuizModal").addClass("hide").removeClass("open");
            },
            openAssignQuizView : function(e){ //called when quiz is open in assign mode
                var id = $(e.currentTarget).closest(".select-concept-wrapper").attr("data-id"),
                    container = $("#quizInfo"),
                    quizzes = controller.appContext.user.quizzes,
                    test = quizzes[id];
                
                $("#quizName").html(_.escape(test.title));
                
                container.find(".quiz-question-count").html(test.questionsCount);
                container.find(".quiz-time-limit").html(SubjectListData.getTimeLimit(test.policies));
                
                if(test.artifactID){ //if test is added to the quizzes collection by calling getQuizzes then it will contain all the information for assigning quiz othewise we need to call API get/info/test
                    $("#assignQuiz").addClass("active").attr({
                        "data-artifact-id" : test.artifactID,
                        "data-title" : test.title,
                        "data-handle" : test.handle
                    });
                    $("#assign-groups-modal").removeClass("quiz-assign-view quiz-list-view").addClass("quiz-assign-view");
                }else{
                    controller.appServices.getQuizInfo(id).done(function(response){
                        $("#assignQuiz").addClass("active").attr({
                            "data-artifact-id" : response.test.artifactID,
                            "data-title" : response.test.title,
                            "data-handle" : response.test.handle
                        });
                        $("#assign-groups-modal").removeClass("quiz-assign-view quiz-list-view").addClass("quiz-assign-view");
                    }).fail(function(){
                        
                    });
                }
            },
            createQuiz : function(){
                var quizTitle = $("#quizTitle").val(),
                policies = {
                    "timelimit" : 0,
                    "shuffle" : false,
                    "enable_feedback" : true,
                    "show_hints" : true,
                    "noofattempts" : 0,
                    "immediate_evaluation" : true
                },
                policyArray = [],
                itemArray = [],
                quizObject = null,
                eid = $("#createQuizModal").attr("data-eid");
                
                if(!$("#editQuestionCount").hasClass("hide")){
                    SubjectListData.setQuestionCount();
                }
                if($.trim(quizTitle) === ""){
                    $("#quizTitle").closest(".quiz-title-wrapper").addClass("alert");
                    $("#quizError").html("Please provide a title!!!").removeClass("hide");
                    return false;
                }
                
                if(parseInt($("#quizQuestionCount").attr("data-count"), 10) === 0){
                    $("#quizTitle").closest(".quiz-title-wrapper").addClass("alert");
                    $("#quizError").html("Can't create quiz without any question!!!").removeClass("hide");
                    return false;
                }
                
                itemArray.push({
                    "type" : "questionset",
                    "encodedID" : eid,
                    "count" : parseInt($("#quizQuestionCount").attr("data-count"), 10)
                });
                
                if($("#timeLimitUnit").val() !== "unlimited"){
                    policies.timelimit = (parseInt($("#timeLimit").val(), 10)*60) || 0;
                }
                
                for(var key in policies){
                    policyArray.push({
                        "name" : key,
                        "value" : policies[key]
                    });
                }
                
                quizObject = {
                        "title" : quizTitle,
                        "testTypeName" : "quiz",
                        "items" : JSON.stringify(itemArray),
                        "policies" : JSON.stringify(policyArray),
                        "encodedIDs" : $("#createQuizModal").attr("data-eid")
                    };
                
                $("#quizTitle").closest(".quiz-title-wrapper").removeClass("alert");
                $("#quizError").addClass("hide");
                controller.appServices.createQuiz(quizObject).done(function(response){
                    var quizzes = controller.appContext.user.quizzes || {},
                        data = {
                             "testID"          : response.test._id,
                             "encodedIDs"      : response.test.encodedIDs.join(","),
                             "questions_count" : response.test.questionsCount,
                             "referrer"        : "edmodo",
                             "context"         : context
                        };
                    
                    quizzes[response.test._id] = response.test;
                    
                    SubjectListData.closeQuizModal();
                    SubjectListData.getQuizzes(eid);
                    
                    if(SubjectListData.libraryView){
                        SubjectListData.libraryView.editCompletionChecker.trigger('EditCompletionChecker.editComplete');
                    }
                    
                    controller.dexterjs.logEvent("FBS_ASSESSMENT_CREATE", data);
                }).fail(function(response){
                    var message = response.message || "Error in creating test!!!";
                    $("#quizTitle").closest(".quiz-title-wrapper").addClass("alert");
                    $("#quizError").html(message).removeClass("hide");
                });
            },
            setQuestionCount : function(){ //called when blurs from edit question count input box
                if($("#createQuizModal").hasClass("hide") === true){
                    // Do nothing if the modal has been closed.
                    return;
                }

                var editField = $("#editQuestionCount"),
                    count = parseInt(editField.val(), 10),
                    maxCount = parseInt($("#assignmentInfo").attr("data-question-count"), 10);
                
                if(isNaN(count) || count === 0){
                    ModalView.alert("Please add some questions!!!");
                    //editField.val(editField.attr("data-count")).focus();
                }else if(count > maxCount){
                    ModalView.alert("You can't add more questions than available questions in the concept!!!");
                    //editField.val(editField.attr("data-count")).focus();
                }else{
                    editField.addClass("hide").attr("data-count", count);
                    $("#quizQuestionCount").removeClass("hide").html(count).attr("data-count", count);
                }
            },
            editQuestionCount : function(){ //open edit question count input box
                var count = $("#quizQuestionCount").attr("data-count");
                
                $("#quizQuestionCount").addClass("hide");
                $("#editQuestionCount").removeClass("hide").val(count).attr("data-count", count);
            },
            changeTimeLimit : function(e){ //change time limit
                var This = $(e.currentTarget);
                if(This.val() === "unlimited"){
                    $("#timeLimit").val("unlimited").attr("disabled", true);
                }else{
                    $("#timeLimit").val("").removeAttr("disabled");
                }
                if(This.siblings(".custom.dropdown")){
                    This.siblings(".custom.dropdown").find(".current").attr("title", This.val());
                }
            },
            walkthroughRender : function(){
                if($("body").find("#walkthrough").length === 0){
                    $('body').prepend('<div id="walkthrough"></div>');
                    walkthrough.init({
                        container: '#walkthrough',
                        context : context
                    });
                }
            },
            showLibrary: function(){
                this.$("#subjects_container").addClass("hide");
                this.$("#library_container").removeClass("hide");
            },
            hideLibrary: function(){
                this.$("#subjects_container").removeClass("hide");
                this.$("#library_container").addClass("hide");
            },
            updateMyQuizCount: function(data){
                var total = data.xhrResponse.response.total || 0;
                if ( total || total === 0 ){
                    $("#myquiz-count-container").removeClass('hide');
                    $("#myquiz-count").text( total );
                }
            }
            
        });

        return TeacherHomeView;
    });
