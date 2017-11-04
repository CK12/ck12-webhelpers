define([
    'backbone',
    'jquery',
    'underscore',
    'common/views/modal.view',
    'library/templates/library.templates',
    'common/utils/utils'
], function(Backbone, $, _, ModalView, TMPL, Util) {
    'use strict';
    var CoursegenView = Backbone.View.extend({
        subjectTemplate: TMPL.SUBJECT,
        standardboardtTemplate: TMPL.STANDARDBOARD,
        gradeTemplate: TMPL.GRADE,
        events: {
            'click #cg_subject .js-dropdown-element': 'onSelectSubject',
            'click #cg_state .js-dropdown-element': 'onSelectStandardboard',
            'click #cg_grade .js-dropdown-element': 'onSelectGrade',
            'click #save-book': 'saveBook',
            'click #cancel-save': 'cancelSave',
            'click #cg_form .library-dropdown-secondary': 'handleDropdown',
            'click #cg_form': 'dropdownClose',
            'keyup #cg_title': 'displayCount'
        },
        initialize: function(){
            _.bindAll(this, "render", "openModal", "onSubjectsFetchSuccess", "onStandardboardsFetchSuccess", "onGradesFetchSuccess", "onSelectSubject", "onSelectStandardboard", "displayCount",
                    "onSelectGrade", "saveBook", "cancelSave", "handleDropdown", "dropdownClose", "createBook", "htmlEscapArtifactTitle", "onAssembleBookSuccessSuccess", "onAssembleBookError");
            this.render();
            this.model.off("subjectsFetchSuccess").on("subjectsFetchSuccess", this.onSubjectsFetchSuccess);
            this.model.off("standardboardsFetchSuccess").on("standardboardsFetchSuccess", this.onStandardboardsFetchSuccess);
            this.model.off("gradesFetchSuccess").on("gradesFetchSuccess", this.onGradesFetchSuccess);
            this.model.off("assembleBookSuccess").on("assembleBookSuccess", this.onAssembleBookSuccessSuccess);
            this.model.off("assembleBookError").on("assembleBookError", this.onAssembleBookError);
        },
        openModal: function() {
            $('.content-type-dropdown').removeClass('open').css('left', '-99999px');
            $('#coursegenModal').foundation('reveal', 'open');
        },
        render: function() {
            this.$el.html(CoursegenView.template);
            this.openModal();
            this.model.fetchSubjects();
        },
        onSubjectsFetchSuccess: function(data) {
            var i, str = '',
                subjectContainer = this.$("#cg_subject");
            for (i = 0; i < data.length; i++) {
                str += this.subjectTemplate(data[i]);
            }
            subjectContainer.html(str);
        },
        onStandardboardsFetchSuccess: function(data) {
            var i, str = '',
                stateContainer = this.$("#cg_state");
            for (i = 0; i < data.length; i++) {
                str += this.standardboardtTemplate(data[i]);
            }
            stateContainer.html(str);
        },
        onGradesFetchSuccess: function(data) {
            var i, str = '', state_id, country_value, options = {}, gradeList, message,
                gradeContainer = this.$("#cg_grade");
            gradeList = data.response.grades;
            state_id = $('#cg_state').find('.selected').attr('data-id');
            country_value = $('#cg_state').find('.selected').attr('data-val');
            if (!this.aletrnateGrade) {
                if (gradeList.length === 0 && country_value.indexOf('US.') !== -1) {
                    this.aletrnateGrade = true;
                    options.subject = this.subject;
                    options.standardBoardID = this.standardBoardID;
                    options.aletrnateGrade = this.aletrnateGrade;
                    this.model.fetchGrades(options);
                } else if(gradeList.length === 0 && country_value.indexOf('US.') === -1) {
                    var standard_name = $('#cg_state .selected').text();
                    $('#js_old_fb_notification').html("We have not aligned our books with the standards with " + $.trim(standard_name));
                    $('#js_old_fb_notification').addClass('nostandardsmatch');
                } else {
                    for (i = 0; i < gradeList.length; i++) {
                        str += this.gradeTemplate(gradeList[i]);
                    }
                    gradeContainer.html(str);
                }
            } else {
                this.aletrnateGrade = false;
                for (i = 0; i < gradeList.length; i++) {
                    str += this.gradeTemplate(gradeList[i]);
                }
                gradeContainer.html(str);
                message = data.response.message;
                $('#js_old_fb_notification').html(message);
                $('#js_old_fb_notification').addClass('nostandardsmatch');
            }
        },
        onAssembleBookError: function(err) {
            if (err && err.response && err.response.message) {
                if(err.response.message.indexOf('exists already') !== -1) {
                    ModalView.alert('A FlexBook® textbook with this title already exist in your Inbox or Archived, please enter a new title.');
                } else {
                    ModalView.alert(err.response.message);
                }
            } else {
                ModalView.alert("error occured while saving");
            }
        },
        onAssembleBookSuccessSuccess: function(data) {
            var artifact;
            if (data.response.artifact) {
                artifact = data.response.artifact;
                $('#coursegenModal').foundation('reveal', 'close');
                window.location.href = '/' + encodeURIComponent(artifact.realm) + '/' + artifact.artifactType + '/' + artifact.handle;
            } else {
                ModalView.alert('error occured while saving');
            }
        },
        dropdownClose: function(e) {
            if (!$(e.target).hasClass('dropdown')) {
                $('.f-dropdown.open').removeClass('open').css('left', '-99999px');
            } else if (!$(e.target).next().hasClass('open')) {
                $('.f-dropdown.open').removeClass('open').css('left', '-99999px');
            }
        },
        handleDropdown: function(e) {
            if (!$(e.currentTarget).next('ul').find('li').length) {
                return false;
            }
        },
        onSelectSubject: function(e) {
            var options = {};
            $('.js-dropdown-element', '#cg_subject').removeClass('selected');
            $('#cg_subject').removeClass('open').css('left', '-99999px');
            this.subject = $(e.currentTarget).attr('data-subject');
            $('#dropdown-subjects').text($(e.currentTarget).find('a').text());
            $(e.currentTarget).addClass('selected');
            options.subject = this.subject;
            $('#cg_subject').attr('selected-subject', this.subject);
            $('#cg_state li').remove();
            $('#cg_grade li').remove();
            $('#dropdown-state').text('Select state or standard set');
            $('#dropdown-grade').text('Select grade');
            $('#js_old_fb_notification').html('<br>');
            $('#js_old_fb_notification').removeClass('nostandardsmatch');
            this.model.fetchStandardboards(options);
            $('#cg_title_div').addClass('hide');
            $('.js-buttons-wrapper').addClass('hide');
        },
        onSelectStandardboard: function(e) {
            var standardboard, options = {};
            $('.js-dropdown-element', '#cg_state').removeClass('selected');
            $('#cg_state').removeClass('open').css('left', '-99999px');
            this.standardBoardID = $(e.currentTarget).attr('data-id');
            standardboard = $(e.currentTarget).attr('data-standardboard');
            $('#dropdown-state').text(standardboard);
            $(e.currentTarget).addClass('selected');
            this.subject = $('#cg_subject').attr('selected-subject');
            options.subject = this.subject;
            options.standardBoardID = this.standardBoardID;
            $('#cg_state').attr('selected-standardBoardID', this.standardBoardID);
            $('#cg_grade li').remove();
            $('#dropdown-grade').text('Select grade');
            $('#js_old_fb_notification').html('<br>');
            $('#js_old_fb_notification').removeClass('nostandardsmatch');
            this.model.fetchGrades(options);
            $('#cg_title_div').addClass('hide');
            $('.js-buttons-wrapper').addClass('hide');
        },
        onSelectGrade: function(e) {
            var state_text, grade_text, subject_text, fName, title;
            $('.js-dropdown-element', '#cg_grade').removeClass('selected');
            $('#cg_grade').removeClass('open').css('left', '-99999px');
            this.grade = $(e.currentTarget).attr('data-grade');
            $(e.currentTarget).addClass('selected');
            $('#dropdown-grade').text(this.grade);
            state_text = $('#dropdown-state').text();
            grade_text = this.grade;
            subject_text = $('#dropdown-subjects').text();

            fName = window.gtm_user_firstname;
            if (state_text != "-" && grade_text != "-" && subject_text != "-") {
                title = subject_text + " FlexBook for " + state_text +
                            " " + grade_text + " by " + fName ;
                title = title.substr(0,100);
                $('#cg_title').val(title);
                $('#cg_title').trigger('keyup');
                $('#cg_title_div').removeClass('hide');
                $('.js-buttons-wrapper').removeClass('hide');
            }else{
                $('#cg_title_div').addClass('hide');
            }

        },
        displayCount: function () {
            var count;
            count = $('#cg_title').val().length;
            $('#cg_title_counter').text('(' + count + '/100)');
        },
        htmlEscapArtifactTitle : function(artifactTitle){
            artifactTitle = artifactTitle.replace(/(\r\n|\n|\r)/gm," ");
            var display_title=artifactTitle.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return {'artifact_title' : artifactTitle,
                    'display_title' : display_title};
        },
        getTemplateXhtml: function () {
            return '<body>\
            <div class="x-ck12-data"><!-- %CHAP_CONT% --></div>\
            <div class="x-ck12-data-lesson"><!-- <lessons /> --></div>\
            <div class="x-ck12-data"><!-- %CHAP_TAIL_SUBSECTIONS% --></div>\
            </body>';
        },
        getChapters: function(options, params, include_raw_response) {
            var self = this, artifacts_result, pageNum, pageSize = 10, artifact, artifacts, children_list1, each_child2, art, children,
                child, each_artifact_res, is_title_match, each_artifact,
                new_book = {}, child_ids = [], chapter = {}, chapters = [];
            return this.model.getChaptersByStandards(options, params, include_raw_response)
                .done(function (artifacts_result, raw_response) {
                    if (raw_response) {
                        self.totalCount = raw_response.total;
                        if (!artifacts_result.length) {
                            ModalView.alert("At present we don't have content for the selected standards. Please change the selection and try again");
                            return;
                        }
                    }
                    //remove duplicates
                    artifacts = self.model.toJSON();
                    if (!artifacts.length && artifacts_result) {
                        self.model.add(artifacts_result);
                    } else {
                        // remove duplicates across fetched pages - Bug #13126
                        for (each_artifact_res in artifacts_result) {
                            is_title_match = false;
                            for (each_artifact in artifacts) {
                                if (artifacts[each_artifact]['title'] == artifacts_result[each_artifact_res]['title']) {
                                    is_title_match = true;
                                    break;
                                }
                            }
                            if (!is_title_match) {
                                self.model.add(artifacts_result[each_artifact_res]);
                            }
                        }
                    }

                    include_raw_response = false;
                    self.pageNum += 1;
                    params = {
                        'pageNum': self.pageNum,
                        'pageSize': 10
                    };
                    if (!(self.totalCount < (self.pageNum * pageSize) ||  (self.pageNum * pageSize) > 50 || !artifacts_result)) {
                        self.getChapters(options, params, include_raw_response);
                    } else {
                        artifacts = self.model.toJSON();
                        if(artifacts) {
                            chapters = [];
                            for (artifact in artifacts) {
                                child_ids = [];
                                chapter['summary'] = artifacts[artifact]['title'];
                                chapter['artifactRevisionID'] = 'new';
                                chapter['artifactType'] = 'chapter';
                                chapter['title'] = artifacts[artifact]['title'];
                                chapter['xhtml'] = self.getTemplateXhtml();
                                for (child in artifacts[artifact]['children']) {
                                    child_ids.push(self.model.getRevisionID(artifacts[artifact]['children'][child]));
                                }
                                chapter['children'] = child_ids;
                                chapters.push($.parseJSON(JSON.stringify(chapter)));
                            }
                            artifact = {
                                'title':self.bookTitle,
                                'summary':self.bookTitle,
                                'artifactID':'new',
                                'artifactType':'book',
                                'children': chapters,
                                'xhtml' : ''
                            };
                            new_book = {
                                'artifact': Util.b64EncodeUnicode(JSON.stringify(artifact))
                            };
                            this.new_book = new_book;
                            self.model.assembleBook(new_book);
                        }
                    }
                }).fail(function (err) {
                });
        },
        createBook: function(bookDetails) {
            var self = this, totalCount;
            var options = {
                'artifactTypeName': 'lesson,section',
                'state': bookDetails.state,
                'grade': bookDetails.grade,
                'subject': bookDetails.subject
            };
            var params = {
                'pageNum': 1,
                'pageSize': 10
            };
            var include_raw_response = true;
            this.pageNum = 1;
            this.getChapters(options, params, include_raw_response);
        },
        cancelSave: function() {
            $('#coursegenModal').foundation('reveal', 'close');
        },
        saveBook: function(e) {
            this.model.reset();
            var bookDetails = {};
            var state = $('#cg_state').find('.selected').attr('data-val');
            var grade = $('#cg_grade').find('.selected').attr('data-val');
            var subject = $('#cg_subject').find('.selected').attr('data-val');

            if (state == "-" || grade == "-" || subject == "-") {
                ModalView.alert('Please select a state, grade and a subject');
                return;
            }
            var title = $.trim($('#cg_title').val());
            if (! Util.validateResourceTitle(title, 'artifact', $('#cg_title'))){
                return false;
            }
            title = this.htmlEscapArtifactTitle(title);
            this.bookTitle = title.artifact_title;
            bookDetails = {
                'state':state,
                'grade':grade,
                'subject': subject,
                'title' : title.artifact_title,
                'silent':true
            };
            this.createBook(bookDetails);
        }
    }, {
        template: TMPL.COURSEGEN
    });
    return CoursegenView;
});
