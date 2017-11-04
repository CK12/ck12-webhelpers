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
 * $Id: flxweb.details.exercise.js 17086 2012-03-29 13:32:49Z shanmuga $
 */
(function ($) {

    var isAnswered = false;
    var encodedID = '';
    var count = 0;
    var timer;
    var screenState = 'exercisestate';

    function get_exercise_encoded_id() {
        return  $.trim($('#exerciseEncodedID').text());
    }
    
    function get_concept_encoded_id() {
        return  $.trim($('#concept_encoding').text());
    }
    
    function get_concept_id() {
        return  $.trim($('#concept_id').text());
    }
    
    function get_questionid () {
        return $.trim($('#js_questionid').text());
    }
    
    function get_varvalmap () {
        return $.trim($('#js_varvalmap').text());
    }
    
    function get_questionclass () {
        return $.trim($('#js_questionclass').text());    
    }
    
    function get_questiontype () {
        return $.trim($('#js_questiontypeid').text());
    }
    
    function get_difficulty_level () {
        return $.trim($('#js_difficultylevel').text());
    }
    
    function submit_answer() {
        var jsondata = {};
        jsondata['questionID'] =  get_questionid();
        jsondata['variableValueMap'] = get_varvalmap();
        jsondata['questionClass'] = get_questionclass();
        jsondata['answer'] = $.trim($('#questionwrapper #answer').val());
        jsondata['duration'] = count;
        jsondata = JSON.stringify(jsondata);
        $.ajax({
            url: webroot_url + 'assess/answer/',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: jsondata,
            success: function (result) {
                isAnswered = true;
            },
            error: function (jqXHR, textStatus, errorThrown) {
            }
        });
    }

    function get_one_question() {
        var encodedID = get_exercise_encoded_id();
        var question_loader_url;
        if(screenState == 'quizstate') {
            question_loader_url = webroot_url + 'get/questionfromquiz/';
        } else {
            question_loader_url = webroot_url + 'get/questionfromexercise/encodedid/' + encodedID;
        } 
        $('#questionwrapper').load(question_loader_url, function () {
            var isAnswered = false;
            postload_settings();
            clear_assessor_area();
            //Got signal to quit
            if($('#signal_quit_quiz').exists()) {
                quit_quiz_btn_click();
            } 
        });
    }

    function load_exercise_widget() {
        var encodedID = get_concept_encoded_id();
        $('#exercisewidget').load(webroot_url + 'ajax/exercise/' + encodedID, function () {
            init_timer_data();
	    refreshQuestion();
            $("#js_reportExerciseError").click(showReportErrorDialog);
        });
    } 

    function show_loader() {
        $("#loading_div").show();
    }

    function hide_loader() {
        $("#loading_div").hide();
    }

    function show_question_wrapper() {
        $("#questionwrapper").show();
    }

    function clear_assessor_area() {
        $('#assessor_area').empty();
        $('#assessor_area').removeClass();
    } 

    function hide_question_wrapper() {
        $("#questionwrapper").hide();
    }

    function domReady() {
        $("#exercisebtnwrap .go_btn").unbind('click');
        $("#exercisebtnwrap .skip_btn").unbind('click');
        $("#exercisebtnwrap .next_btn").unbind('click');
        $("#questionwrapper .hint_btn").unbind('click');
        $(".take_quiz_btn").unbind('click');
        $(".quit_quiz_btn").unbind('click');
        $(".back_to_exercise_btn").unbind('click');
        $(".view_quiz_results_btn").unbind('click');
        $("#exercisebtnwrap .go_btn").click(gobtn_click);
        $("#exercisebtnwrap .skip_btn").click(skipbtn_click);
        $("#exercisebtnwrap .next_btn").click(nextbtn_click);
        $(".take_quiz_btn").click(take_quiz_btn_click);
        $(".quit_quiz_btn").click(quit_quiz_btn_click);
        $(".back_to_exercise_btn").click(back_to_exercise_btn_click);
        $(".view_quiz_results_btn").click(view_quiz_results_btn_click);
        toggle_btn("#exercisebtnwrap .go_btn", 'show');
        //refresh_form_state();

        $('#questionwrapper #answer').keyup(function (ev) {
            //Press Enter Key
            if (ev.keyCode === 13) {
                gobtn_click();
            }
        });
    }

    function preload_settings() {
        pause_timer();
        hide_question_wrapper();
        show_loader();
        $("#exercisebtnwrap .skip_btn").hide();
        if(screenState == 'exercisestate') {
            $("#exercisebtnwrap .skip_btn").show();
        }
        $("#exercisebtnwrap .next_btn").hide();
    }

    function postload_settings() {
        domReady();
        show_question_wrapper();
        hide_loader();
        resume_timer();
    }

    function refreshQuestion() {
        preload_settings();
        get_one_question();
    }

    function gobtn_click() {
        var jsondata = {};
        clear_assessor_area();
        var questionID =  get_questionid();
        var questionClass = get_questionclass();
        var artifactID = get_concept_id();
        var difficultyLevel = get_difficulty_level();
        jsondata['questionID'] = questionID;
        jsondata['variableValueMap'] = get_varvalmap();
        jsondata['questionClass'] = questionClass;
        jsondata['questionTypeID'] = get_questiontype();
        if (jsondata['questionTypeID'] === '1') {
            jsondata['answer'] = $.trim($('#questionwrapper #answer').val());
        } else {
            jsondata['answer'] = $.trim($('input:radio[name=answer]:checked').val());
        }
        if (jsondata['answer'] === "") {
            $('#assessor_area').addClass('empty');
            $('#assessor_area').text('Please write some answer');
            return;
        }
        $("#exercisebtnwrap .go_btn").unbind('click');
        toggle_btn("#exercisebtnwrap .go_btn", 'disable');
        jsondata = JSON.stringify(jsondata);
        $.ajax({
            url: webroot_url + 'assess/answer/',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: jsondata,
            success: function (result) {
                if (result.isCorrect) {
                    $('#assessor_area').addClass('correct');
                    $('#assessor_area').html(result.resultMessage);
                    $.flxweb.logADS('hwp_attempt', 'attempted', 1, [artifactID, ads_userid], [questionClass, questionID, "correct", difficultyLevel]);
                    $.flxweb.logADS('exercise', 'correct', 1, [artifactID, ads_userid], [questionClass, questionID, difficultyLevel, '', '']);
                } else {
                    $('#assessor_area').addClass('wrong');
                    $('#assessor_area').html(result.resultMessage);
                    $.flxweb.logADS('hwp_attempt', 'attempted', 1, [artifactID, ads_userid], [questionClass, questionID, "wrong", difficultyLevel]);
                    $.flxweb.logADS('exercise', 'wrong', 1, [artifactID, ads_userid], [questionClass, questionID, difficultyLevel, '', '']);
                    
                }
                $('#questionwrapper #answer').unbind('keyup');
                $("#exercisebtnwrap .skip_btn").hide();
                $("#exercisebtnwrap .next_btn").show();
               // $(window).unbind('beforeunload');
                isAnswered = true;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#assessor_area').addClass('empty');
                $('#assessor_area').html("Sorry, we are unable to get your answer now. Please try again later.");
                $("#exercisebtnwrap .go_btn").click(gobtn_click);
                toggle_btn("#exercisebtnwrap .go_btn", 'show');
            }
        });
    }

    function take_quiz_btn_click() {
        $(".take_quiz_btn").unbind('click');  
        toggle_btn(".take_quiz_btn", 'disable');
        var encodedID = get_exercise_encoded_id();
        var timeLimit = 300;
        $.ajax({
            url: webroot_url + 'start/quiz/' + encodedID,
            type: 'POST',
            success: function (result) {
                if (result.statusFlag === "START") {
                    timeLimit = result.timeLimit;
                    toggle_btn(".take_test_btn", 'show');
                    toggle_btn(".quit_quiz_btn", 'show');
                    screenState = 'quizstate'; 
                    switch_screen_state();
        	    start_timer(timeLimit);
                    refreshQuestion();
                } else {
                    //TODO Fix it
                    $.flxweb.showDialog($('#js_start_quiz_failed_message').html());		
                    toggle_btn(".take_quiz_btn", 'show');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                toggle_btn(".take_quiz_btn", 'show');
                $(".take_quiz_btn").click(start_quiz_btn_click);  
            }

        });
    }

    function quit_quiz_btn_click() {
        stop_timer();
        var encodedID = get_exercise_encoded_id();
        screenState = 'quizresultstate'
        switch_screen_state()
        $('#quizresultssection').html($('#loading_fetchquizresults').html());
        var quit_quiz_url = webroot_url + 'end/quiz/' + encodedID;
        $('#quizresultssection').load(quit_quiz_url, function() {
        });        
    }
 
    function view_quiz_results_btn_click() {
        var encodedID = get_exercise_encoded_id();
        screenState = 'quizresultstate'
        switch_screen_state()
        $('#quizresultssection').html($('#loading_fetchquizresults').html());
        var quit_quiz_url = webroot_url + 'view/user/quizresults/' + encodedID;
        $('#quizresultssection').load(quit_quiz_url, function() {
        });        
    } 

    function back_to_exercise_btn_click() {
        screenState = 'exercisestate'
        switch_screen_state();
        init_timer_data();
        refreshQuestion();

    }

    function nextbtn_click() {
        clear_assessor_area();  
        refreshQuestion();
    }

    function skipbtn_click() {
        var questionID =  get_questionid();
        var questionClass = get_questionclass();
        var artifactID = get_concept_id();
        var difficultyLevel = get_difficulty_level();
        $.flxweb.logADS('hwp_attempt', 'attempted', 1, [artifactID, ads_userid], [questionClass, questionID, "skipped", difficultyLevel]);
        $.flxweb.logADS('exercise', 'skipped', 1, [artifactID, ads_userid], [questionClass, questionID, difficultyLevel, '', '']);
        refreshQuestion();
    }

    function toggle_btn(selector, set) {
        if (set == 'show') {
           $(selector).removeClass('hide').removeClass('disabled');
        } else if (set == 'disable') {
           $(selector).addClass('disabled');
        } else if (set == 'hide') {
           $(selector).addClass('hide');
        }  
    }

    /*
	TIMER PARTS
    */
    Number.prototype.pad = function (len) {
    return (new Array(len+1).join("0") + this).slice(-len);
    }

    function start_timer(limit) {
        count = limit;
        timer = $.timer(1000, timer_callback);
    }

    function pause_timer() {
        if(timer) { 
            timer.stop(); 
        }
    } 
    
    function resume_timer() {
        if(timer) {
            timer = $.timer(1000, timer_callback);
        }  
    }  

    function stop_timer() {
        if(timer) { 
            timer.stop();
            timer = null;
            count = 0; 
            $('#timer-hours').html('0');
            $('#timer-minutes').html('00');
            $('#timer-seconds').html('00');
            
        }
    }
 
    function timer_callback() {
            count--;
            if (count > 0) { 
                time = get_timer_duration();
                $('#timer-hours').empty().html(time.hours);
                $('#timer-minutes').empty().html( time.minutes.pad(2) );
                $('#timer-seconds').empty().html( time.seconds.pad(2) );
            } else {
                //Force quit quiz
                stop_timer();
                quit_quiz_btn_click(); 
            }  
    }

    function get_timer_duration() {
        return {
            'hours': Math.floor(count / 3600),
            'minutes': Math.floor( (count % 3600) / 60),
            'seconds': (count % 3600) % 60
        }
    }

    function init_timer_data() {
        initCount = $('#test_duration').text();
        if ((!isNaN(initCount)) && (initCount.length > 0) ) {
            count = initCount;
            start_timer();    
        }    
    }

    // exercise error report link handler
    function showReportErrorDialog(options) {
        options = $.extend({
            width:800,
            buttons: null,
            title: 'Report Error'
        }, options);
        var url = $('#js_reportExerciseErrorDialog').attr('url');
        var params = '?qid=' + get_questionid() + 
                     '&qclass=' + get_questionclass() + 
                     '&varmap=' + get_varvalmap();
        url = url + params;
        url = encodeURI(url);
        $.flxweb.showDialog('<iframe id="reportiframe" '+
                                    'frameborder="0" '+
                                    'scrolling="auto" ' +
                                    'src="'+url+'" ' +
                                    'width="680"' + 
                                    'height="500"' +
                                    '/>', options);

        return false;
    }

    function switch_screen_state() {
        $('#topexercisesection').removeClass('exercisestate').removeClass('quizstate').removeClass('quizresultstate');
   	$('#topexercisesection').addClass(screenState);
        if (screenState == 'quizstate') { 
       	    $("#rightexercisesection").addClass(screenState);
            //Promt while go out  
            $(window).unbind('beforeunload');
            $(window).bind('beforeunload', function () {
                 return 'You are currently taking the exercise quiz. Do you want to leave this page without answering the questions?';
            });
        } else {
            $("#rightexercisesection").removeClass('quizstate');
            $(window).unbind('beforeunload');
        }
        if (screenState == 'quizresultstate') {
            $('#quizresultssection').removeClass('hide');
            $('#leftexercisesection').addClass('hide'); 
            $('#rightexercisesection').addClass('hide');
        } else {
            $('#quizresultssection').addClass('hide');
            $('#leftexercisesection').removeClass('hide'); 
            $('#rightexercisesection').removeClass('hide');
        }
    }

    function show_question_details_btn_click() {
        $('.scorecard_list .js_scorecard_list_item').removeClass('selected');
 
        rowExpandToggle = $(this).children('.row_expand_toggle').get(0);  

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

    $(document).ready(function () {
        load_exercise_widget();
        init_timer_data();
        refreshQuestion();
        $(document).bind('flxweb.exercise.question.submit_answer', gobtn_click);
        $(".scorecard_list .scorecard_row").live("click", show_question_details_btn_click);
        $(".triggersignin").click($.flxweb.showSigninDialog);
        $("#js_reportExerciseError").click(showReportErrorDialog);
    });

})(jQuery);

jQuery.fn.exists = function () {return jQuery(this).length > 0; };
