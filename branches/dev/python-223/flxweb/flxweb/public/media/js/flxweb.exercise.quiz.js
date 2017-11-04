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
 * This file originally written by Shanmuga Bala
 *
 * $Id$
 */

var screenState = 'exercisestate'; // exercisestate, quizstate
var isQuizStarted = false;

function switch_state(state) {
    if ( state == 0 ) {
        $('#exercisewrapper').addClass('active');
        $('#quizwrapper').removeClass('active');
        screenState= "exercisestate"
    } else if (state  == 1 ) {
        $('#exercisewrapper').removeClass('active');
        $('#quizwrapper').addClass('active');
        screenState= "quizstate"
        $.fn.quiz_before_load();
    }
}

define('flxweb.exercise.quiz',['jquery','jquery-ui','flxweb.global', 'flxweb.exercise.common', 'jquery.timer'],
function ($) {

    var count = 0;
    var quizResultID = null;
    var countdown = 9;
    var countdownMax = countdown + 1;
    var timer, countdowntimer;
    var quizQuestionNumbers = [];
    var skippedQuizQuestionNumbers = [];
    var attendedQuestions = [];
    var questionIndex = 0;
    var quizDuration = 300; //In seconds, js will override this
    var timerObj = null;

    function get_exercise_encoded_id() {
        return  $.trim($('#exerciseEncodedID').text());
    }

    function get_quiz_result_id() {
        return quizResultID;
    }

    function get_selected_question(event) {
       var dorder = $(this).data('displayorder');
       $.flxweb.events.triggerEvent(document, 'flxweb.exercise.question.show_selected_question', dorder);
       move_to_question_no(dorder);
    }

    function start_quiz() {
        var encodedID = get_exercise_encoded_id();
        var timeLimit = 300;
        $.ajax({
            url: webroot_url + 'start/quiz/' + encodedID,
            type: 'POST',
            success: function (result) {
                if (result.statusFlag === "START") {
                    set_quiz_progressbar_data(0,result.quizQuestionsCount);
                    set_quiz_result_id(result.quizResultID);
                    init_quiz_question_numbers(result.quizQuestionsCount);
                    timerObj.init_timer_data(result.timeLimit);
                    screenState = 'quizstate';
                    $('#quizinfowrapper').addClass('hide');
                    $('#quizdetailwrapper').removeClass('hide');
                    switch_state(1);
                    timerObj.start_timer();
                    $.flxweb.events.triggerEvent(document, 'flxweb.exercise.question.refresh_question');

                } else {
                    $.flxweb.showDialog($('#js_start_quiz_failed_message').html());
                    toggle_btn(".take_quiz_btn", 'show');
                    $(".take_quiz_btn").click(take_quiz_btn_click);
                    cancel_quiz();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $.flxweb.showDialog($('#js_start_quiz_failed_message').html());
                toggle_btn(".take_quiz_btn", 'show');
                $(".take_quiz_btn").click(take_quiz_btn_click);
                cancel_quiz();
            }

        });
    }

   function take_quiz_btn_click() {
        $(this).unbind('click');
        toggle_btn(".take_quiz_btn", 'disable');
        clear_quiz_progress_data();
        show_question_details_btn_click();
        $.flxweb.exercise.quizDialog.open();
        return;
    }

   function end_quiz_btn_click(closeWindow) {
        if(!(closeWindow == false)) {
            if(screenState ==  "quizstate" || screenState ==  "quizendstate" ) {
                $.flxweb.exercise.quizDialog.close();
            }
        }
        var duration = quizDuration-count;
        var encodedID = get_exercise_encoded_id();
        var qrid = get_quiz_result_id()
        timerObj.stop_timer();
        stop_countdowntimer();
        switch_state(0);

        toggle_btn(".take_quiz_btn", 'show');
        $(".take_quiz_btn").unbind('click');
        $(".take_quiz_btn").click(take_quiz_btn_click);

        if(qrid != null ) {
            $('#quizresultssection').html($('#loading_fetchquizresults').html());
            switch_screen_state(1);
            var end_quiz_url = webroot_url + 'end/quiz/' + encodedID+'?qrid='+ qrid + '&duration=' + duration;
            clear_quiz_result_id();
            clear_attended_questions();
            $('#quizresultssection').load(end_quiz_url, function() {
                $(".scorecard_list .scorecard_row").unbind('click');
                $(".scorecard_list .scorecard_row").click(show_question_details_btn_click);
            });
        }
    }

    function end_quiz() {
        $('#quizinfowrapper').addClass('hide');
        $('#quizdetailwrapper').addClass('hide');
        $('#quizendwrapper').removeClass('hide');
        screenState= "quizendstate";
    } 

    function cancel_quiz() {
        $.flxweb.exercise.quizDialog.close();
        end_quiz_btn_click();
    }

    /*
        INITIALIZE QUIZ POPUP BOX

    */

    function onDialogOpen() {
        if($(this).has('#quizerrormessage').length != 0) {
            message = $(this).find('#quizerrormessage').data('message');
            $(this).dialog('close');
            $.flxweb.showDialog(message); 
            return false;
        }  
        timerObj.init_timer_data();
        prepare_start_quiz_countdown();
        start_quiz_countdown();
        $(".cancel_quiz_btn").unbind('click');
        $(".cancel_quiz_btn").click(cancel_quiz);
        $(".qprogressbox.unanswered").unbind('click');
        $(".qprogressbox.unanswered").click(get_selected_question);
        $(".see_quiz_result_btn").unbind('click');
        $(".see_quiz_result_btn").click(end_quiz_btn_click);
        isQuizStarted = true;
        return false;
    }

    function onDialogClose() {
    }

    function onBeforeDialogClose() {
        isQuizStarted = false;
        if(screenState ==  "quizstate") {
            $.flxweb.showDialog($.flxweb.gettext("Are you sure you want to end the quiz?"),
                           {'dialogClass' : 'js_ck12_dialog_common notitle',
                            'buttons' : [
                                {
                                    'text':$.flxweb.gettext("Yes"),
                                    'click': function() {
                                        end_quiz();
                                        $(this).dialog('close');
                                    }
                                },
                                {
                                    'text':$.flxweb.gettext("No"),
                                    'click': function() {
                                        $(this).dialog('close');
                                    }
                                }
                            ]
            });
            return false;
        } else {
            end_quiz_btn_click(false);
        }

        return true;
    }

    function domReady() {
        $(".view_quiz_results_btn").unbind('click');
        $(".view_quiz_results_btn").click(view_quiz_results_btn_click); 

        //NOTE: Setting height to dialog is not working well in cross-browsers,
        //So, set the height in quiz wrapper as css
        quiz_dlg = $.flxweb.createDialog($('#js_dialog_quiz'),{
                width:'870px',
                'dialogClass' : 'js_ck12_dialog_common quizbox notitle',
                'close': onDialogClose,
                'beforeClose':onBeforeDialogClose,
            });
            quiz_dlg.bind('flxweb.dialog.open', onDialogOpen);
            quiz_dlg.bind('flxweb.dialog.close', onDialogClose);

            $.extend(true, $.flxweb, {
            'exercise':{
                'quizDialog': quiz_dlg
            }
            });
    }

    /*
        QUIZ  HELPERS 

    */

    function init_quiz_question_numbers(noq) {
        quizQuestionNumbers = [];
        skippedQuizQuestionNumbers = []
        questionIndex = -1;
        for (i=0;i<noq;i++) {
            quizQuestionNumbers[i] = i+1;
            skippedQuizQuestionNumbers[i] = i+1
        }
    }

    function get_next_question_number() {
        questionIndex = questionIndex + 1
        var qno = quizQuestionNumbers[questionIndex];
        while(1) {
            if (qno && !skippedQuizQuestionNumbers.has(qno)) {
                questionIndex = questionIndex + 1
                qno = quizQuestionNumbers[questionIndex];
            } else {
                break;
            }
        }
        if (qno) {
            return qno;
        } else {
            return check_for_end_quiz();
        }
    }

    function check_for_end_quiz() {
        var skippedCount = skippedQuizQuestionNumbers.length;
        if (skippedCount > 0) {
            quizQuestionNumbers = skippedQuizQuestionNumbers.slice(0);
            questionIndex = -1;
            return get_next_question_number();
        } else {
            end_quiz();
            return null;
        }
    }

    function get_current_question_number() {
        return quizQuestionNumbers[questionIndex]
    }

    function mark_question_answered() {
        questionNo = get_current_question_number()
        skippedQuizQuestionNumbers.splice($.inArray(questionNo,skippedQuizQuestionNumbers),1);
    }

    function move_to_question_no(questionNo) {
        questionIndex = $.inArray(questionNo,quizQuestionNumbers);
    }

    function set_quiz_result_id(id) {
        quizResultID = id;
    }

    function clear_quiz_result_id() {
        quizResultID = null;
    }

    function add_to_attended_questions(questionNo) {
        attendedQuestions.push(questionNo);
    }

    function clear_attended_questions() {
        attendedQuestions = [];
    }

    function hasAttended(qno) {
        return attendedQuestions.has(qno)
    }

    //Consider dorder as question number in front end
    function check_for_attended(qno) {
         $('#skipindicator').addClass('hidden');
         if(hasAttended(qno)) {
             $('#skipindicator').removeClass('hidden');
         } else {
            add_to_attended_questions(qno);
         }
    }

    /*
        TIMER PARTS

    */
    Number.prototype.pad = function (len) {
    return (new Array(len+1).join("0") + this).slice(-len);
    }

    Array.prototype.has = function(value) {
        var i;
        for (var i = 0, loopCnt = this.length; i < loopCnt; i++) {
            if (this[i] === value) {
                return true;
            }
        }
        return false;
    };

    var timerObj = new function() {

        thisObj = this;
        this.timer = null;

        this.start_timer = function() {
            if (isNaN(count)) {
                count =300;
            }
            thisObj.timer = $.timer(1000, thisObj.timer_callback);
        };

        this.pause_timer = function() {
            if(thisObj.timer) {
                thisObj.timer.stop();
            }
        };

        this.resume_timer = function() {
            if(thisObj.timer) {
                thisObj.timer.stop();
                thisObj.timer = $.timer(1000, thisObj.timer_callback);
            }
        };

        this.stop_timer = function() {
            if(thisObj.timer) {
                thisObj.timer.stop();
                thisObj.timer = null;
                count = 0;
                $('#timer-hours').html('0');
                $('#timer-minutes').html('00');
                $('#timer-seconds').html('00');

            }
        };

        this.get_timer_duration = function() {
            return {
                'hours': Math.floor(count / 3600),
                'minutes': Math.floor( (count % 3600) / 60),
                'seconds': (count % 3600) % 60
            }
        };

        this.timer_callback = function() {
            count--;
            if (count > 0) {
                time = thisObj.get_timer_duration();
                $('#timer-hours').empty().html(time.hours);
                $('#timer-minutes').empty().html( time.minutes.pad(2) );
                $('#timer-seconds').empty().html( time.seconds.pad(2) );
            } else {
                //Force quit quiz
                thisObj.stop_timer();
                end_quiz();
            }
        };

        this.init_timer_data = function(initCount) {
            count = initCount;
            quizDuration = initCount;
        };
    };

    /*
        COUNTDOWN PARTS

    */
    function prepare_start_quiz_countdown() {
        var timeLimit = parseInt($('#quiz_info_duration').html());
        timeLimit = Math.floor(timeLimit / 60);
    }

    function start_quiz_countdown() {
        $('#countdownclock').tzineClock();
        if(isQuizStarted){
            return false;
        }
        countdowntimer = $.timer(1000, countdowntimer_callback);
    }

    function countdowntimer_callback() {

            if (countdown >= 0 ){
                $.fn.countdownCallback(countdown, countdownMax)
                countdown--;
            }
            else {
                //Start quiz
                start_quiz();
                stop_countdowntimer();
                //$('#countdownclock').html('');
            }
    }

    function stop_countdowntimer() {
        if(countdowntimer) {
            countdowntimer.stop();
            countdowntimer = null;
            countdown = 9;
            $('#countdowndigit').html(countdown);
            $('#countdownsec').show()
        }
    }

    /*
        QUIZ PROGRESS CONTROL  

    */
    function update_quiz_progress(e, quizProgress) {
        update_quiz_progress_bar(quizProgress);
    }

    function move_the_question_indicator(dorder) {
       $('.qprogressbox').find('.currentindicator').removeClass('current');
       $(".qprogressbox.unanswered").unbind('click');
       $(".qprogressbox.unanswered").click(get_selected_question);
       $(".qprogressbox.unanswered").css('cursor','');
       $('#qprogress-'+ dorder).find('.currentindicator').addClass('current');
       $('#qprogress-'+ dorder).unbind('click');
       $('#qprogress-'+ dorder).css('cursor','default');
    }

    function clear_quiz_progress_data() {
        $('#quiz_progress_right').html(0);
        $('#quiz_progress_wrong').html(0);
        $('#quizprogress_indicator').css('width','0px');
        $('#quiz_progress_total_attempt').html("Attempted: 0");
        $('#quiz_progress_total_questions').html("Total: 0");
    }

    function set_quiz_progressbar_data(start, end) {
        $('#quiz_progress_total_attempt').html("Attempted: "+ start);
        $('#quiz_progress_total_questions').html("Total: "+ end);
    }

    function update_quiz_progress_bar(quizProgress) {
        if (screenState !== 'quizstate')
            return
        var progressIndicator = $('#quizprogress_indicator');
        var dorder = get_current_question_number();
        $('#quizprogress_indicator').find('#qprogress-'+dorder).addClass('answered').removeClass('unanswered');
        $('#quizprogress_indicator').find('#qprogress-'+dorder).unbind('click');

        $('#quiz_progress_total_attempt').html("Attempted: "+ quizProgress.totalAttempt);
        $('#quiz_progress_total_questions').html("Total: "+ quizProgress.totalQuestions);
    }


    /*
        QUIZ RESULTS SCREEN

    */
    function view_quiz_results_btn_click() {
        switch_screen_state(1);
        var encodedID = get_exercise_encoded_id();
        $('#quizresultssection').html($('#loading_fetchquizresults').html());
        var quiz_results_url = webroot_url + 'view/user/quizresults/' + encodedID;
        $('#quizresultssection').load(quiz_results_url, function() {
            $(".scorecard_list .scorecard_row").unbind('click');
            $(".scorecard_list .scorecard_row").click(show_question_details_btn_click);
        });
    }

    function show_question_details_btn_click() {
        $('.scorecard_list .js_scorecard_list_item').removeClass('selected');
        rowExpandToggle = $(this).children('.row_expand_toggle').get(0);
        if(!rowExpandToggle){
            $('.js_expand_toggle.row_expand_toggle.ui-icon').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-e');
        }

        if ( $(rowExpandToggle).hasClass('ui-icon-triangle-1-e') ) {
            $('.scorecard_list .row_expand_toggle').addClass('ui-icon-triangle-1-e').removeClass('ui-icon-triangle-1-s');
            $(rowExpandToggle).removeClass('ui-icon-triangle-1-e').addClass('ui-icon-triangle-1-s');
        } else {
            $(rowExpandToggle).addClass('ui-icon-triangle-1-e').removeClass('ui-icon-triangle-1-s');
        }

        questionDetailsRow = $(this).parent().children('.quiz_questions_info').get(0);
        if(!$(questionDetailsRow).is(":visible")) {
            $(this).parent().parent().addClass('selected');
            $('.scorecard_list .quiz_questions_info').css('display','none');
            $(questionDetailsRow).css('display','block');
        } else {
            $(this).parent().parent().removeClass('selected');
            $(questionDetailsRow).css('display','none');
        }
        //$(questionDetailsRow).fadeToggle('slow');
    }

    /*
        PUBLIC FUNCTIONS

    */
    $.fn.get_quiz_question_loader = function get_quiz_question_loader(dorder) {
        if(!dorder) {
            var dorder = get_next_question_number();
        }
        var quizResultID = get_quiz_result_id();
        if(!dorder || !quizResultID) {
            return null;
        }
        params = 'qrid='+quizResultID+'&'+'do='+ dorder;
        question_loader_url = webroot_url + 'get/questionfromquiz/?'+params;
        move_the_question_indicator(dorder);
        check_for_attended(dorder);
        return question_loader_url
   }

    $.fn.get_quiz_question_assess_params = function get_quiz_question_assess_params() {
        params = '?qrid='+ get_quiz_result_id();
        return params
    }

    $.fn.quiz_before_load = function quiz_before_load() {
        $(window).unbind('beforeunload');
        $(window).bind('beforeunload',function (e) {
            if($('#quizwrapper').hasClass('active') && $('#quizwrapper').is(':visible')) {
                var duration = quizDuration-count;
                var encodedID = get_exercise_encoded_id();
                var qrid = get_quiz_result_id()
                //Save quiz progress
                if(qrid != null ) {
                    var end_quiz_url = webroot_url + 'end/quiz/' + encodedID+'?qrid='+ qrid + '&duration=' + duration + '&result=F';
                    $('#quizresultssection').load(end_quiz_url, function() {
                        $(".scorecard_list .scorecard_row").unbind('click');
                        $(".scorecard_list .scorecard_row").click(show_question_details_btn_click);
                        });
                }
                var alert_message = $.flxweb.gettext("You are currently taking the quiz. Do you want to leave this page without answering the quiz questions?");
                return alert_message;
            }
        });
    }

    $(document).ready(function () {
        $(document).bind('flxweb.exercise.quiz.take_quiz', take_quiz_btn_click);
        $(document).bind('flxweb.exercise.quiz.end_quiz', end_quiz);
        $(document).bind('flxweb.exercise.quiz.dom_ready', domReady);
        $(document).bind('flxweb.exercise.quiz.timer.init_timer', timerObj.init_timer_data);
        $(document).bind('flxweb.exercise.quiz.timer.pause_timer', timerObj.pause_timer);
        $(document).bind('flxweb.exercise.quiz.timer.resume_timer', timerObj.resume_timer);
        $(document).bind('flxweb.exercise.quiz.progress.mark_answered', mark_question_answered);
        $(document).bind('flxweb.exercise.quiz.progress.update', update_quiz_progress);

        $(".scorecard_list .scorecard_row").unbind('click');
        $(".scorecard_list .scorecard_row").click(show_question_details_btn_click);
    });

});

