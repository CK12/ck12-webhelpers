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

var screenState = 'exercisestate';

function toggle_btn(selector, set) {
    if (set == 'show') {
        $(selector).removeClass('hide').removeClass('disabled');
    } else if (set == 'disable') {
        $(selector).addClass('disabled');
    } else if (set == 'hide') {
        $(selector).addClass('hide');
    }  
}

function switch_screen_state(state) {
    if (state == 0) {
        $('#exercisedetailwrapper').removeClass('hide');
        $('#quizresultwrapper').addClass('hide');
        $('#endpracticewrapper').addClass('hide');
    } else if(state == 1) {
        $('#exercisedetailwrapper').addClass('hide');
        $('#quizresultwrapper').removeClass('hide');
        $('#endpracticewrapper').addClass('hide');
    } else if(state == 2) {
        $('#exercisedetailwrapper').addClass('hide');
        $('#quizresultwrapper').addClass('hide');
        $('#endpracticewrapper').removeClass('hide');
    } else if(state == 3) { //for embed mode
        //$('.active #questionwrapper').html('You have reached the maximum practice questions.');
        $('.questionpanel.leftalign.active').addClass('hide');
        $('#endpracticewrapper').removeClass('hide');
        $(".ex-row").show("slow");
        $(".ex-row").slideDown(1000);
        $('#ex-banner').animate({width:'+=20'},400);
    }
}

define('flxweb.exercise.common',['jquery','jquery-ui','flxweb.global'],
function ($) {

    var encodedID = '';
    var adsTimer, adsCount = 0;

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
        return $.trim($('.active #js_questionid').text());
    }
    
    function get_varvalmap () {
        return $.trim($('.active #js_varvalmap').text());
    }
    
    function get_questionclass () {
        return $.trim($('.active #js_questionclass').text());    
    }
    
    function get_questiontype () {
        return $.trim($('.active #js_questiontypeid').text());
    }
    
    function get_difficulty_level () {
        return $.trim($('.active #js_difficultylevel').text());
    }

    function getExerciseMode(){
        var mode = $('#exercise_mode').data('mode');
        return mode;
    }

    function show_loader() {
        $(".active #loading_div").show();
    }

    function hide_loader() {
        $(".active #loading_div").hide();
    }

    function show_question_wrapper() {
        $(".active #questionwrapper").show();
    }

    function clear_assessor_area() {
        $('.active #assessor_area').empty();
        $('.active #assessor_area').removeClass();
    } 

    function hide_question_wrapper() {
        $(".active #questionwrapper").hide();
    }

    /* Build necessary artifact data needed for exercise calls */ 
    function build_artifact_data(artifact) {
        artifact_data = {}
        artifact_data['title'] = artifact.title
        artifact_data['artifactID'] = artifact.artifactID
        artifact_data['encodedID'] = artifact.encodedID
        artifact_data['handle'] = artifact.handle
        artifact_data['artifactType'] = artifact.artifactType
        return artifact_data  
    }

    /* Resets bottom quiz taking section on exercise / practice page on returning from scorecard page */
    function reset_quiz_section() {
        $('#quiz_btn_pretext').text('Ready to Retest Yourself?');
        $('#take_quiz_btn').attr('title','Retake Quiz').text('Retake Quiz');
        $('.view_quiz_results_btn').removeClass('quiz_result_link_disable');
    }

    
    function get_one_question(dorder) {
        var encodedID = get_exercise_encoded_id();
        var question_loader_url;
        var params;

        if(screenState == 'quizstate') {
            question_loader_url = $.fn.get_quiz_question_loader(dorder);
            if(!question_loader_url) {
                return;
            } 
        } else if (getExerciseMode() == 'embed') {
            question_loader_url = webroot_url + 'get/questionfromexercise/encodedid/' + encodedID + "?max_restrict=false";
        } else {
            question_loader_url = webroot_url + 'get/questionfromexercise/encodedid/' + encodedID;
        }
 

        $('.active #questionwrapper').load(question_loader_url, function (responseText, textStatus, XMLHttpRequest) {
            postload_settings();
            clear_assessor_area();

            //Got signal to quit
            if($('#signal_quit_quiz').exists()) {
                $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.end_quiz');
            }else if(getExerciseMode() == 'embed' && responseText=='MAX_REACHED') {
                switch_screen_state(3); 
            }else if(responseText=='MAX_REACHED') {
                switch_screen_state(2); 
            }
        });
    }

    function load_exercise_widget() {
        var encodedID = get_concept_encoded_id();
        artifact_data= {};
        var artifactDomainHandle = '';
        if ( typeof artifact_json !== "undefined" && artifact_json !== null ) { 
            artifactDomainHandle = $.trim($('#artifact_domain_handle').val());
            artifact_data = build_artifact_data(artifact_json);
            artifact_data['artifact_domain_handle'] = artifactDomainHandle;
            jsondata = JSON.stringify(artifact_data);
            artifact_data = {'artifact_data':jsondata, 'artifact_domain_handle':artifactDomainHandle};
        }
        
        if( typeof artifact_json !== "undefined" && artifact_json !== null && (artifact_json.artifactType === "asmtpractice" || artifact_json.artifactType === "asmtquiz" || artifact_json.artifactType === "asmtpracticeint")){
        	setExercisePageUrl.call($(".exercise_tools_link"));
        	return;
        }
        
        $('#exercisewidget').load(webroot_url + 'ajax/exercise/' + encodedID, artifact_data ,function () {
        	setExercisePageUrl.call($(".exercise_tools_link"));
            $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.timer.init_timer');
	    refreshQuestion();
            add_next_artifact_link();

            $("#js_reportExerciseError").click(showReportErrorDialog);
             
            $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.dom_ready');
            $('#rightexercisesection').unbind('click'); 
            $('#rightexercisesection').click(slider); 
            $('#leftexercisesection').click(slide_in); 
        });
    } 

    function add_next_artifact_link() {
         next_artifact_url = $('#js_next_artifact_info').data('url');
         next_artifact_type = $('#js_next_artifact_info').data('type');
         next_artifact_title = $('#js_next_artifact_info').data('title');
         if (next_artifact_url && next_artifact_type && next_artifact_title ) {
             $('#js_next_art_type').html(next_artifact_type);
             $('#js_next_art_link').attr('href', next_artifact_url);
             $('#js_next_art_link').html($.flxweb.truncate(next_artifact_title, 35));
             $('#endpracticeleftsection').removeClass('singlesection');	
             $('#endpracticemiddlesection').removeClass('hide');	
             $('#endpracticerightsection').removeClass('hide');	
         } else {
             $('#endpracticeleftsection').addClass('singlesection');	
             $('#endpracticemiddlesection').addClass('hide');	
             $('#endpracticerightsection').addClass('hide');	
         }   
    }  

    function setExercisePageUrl(){
        var pageUrl = document.location.href,newHref = "",
        pageUrl = "/" + escape(pageUrl.replace($.flxweb.settings.webroot_url, ''));
        this.each(function(i,el){
        	newHref = $(el).attr("href") + "&ep=" + pageUrl;
        	this.href = newHref;
        });
    }

    function domReady() {
        $(".exercisebtnwrap .go_btn").unbind('click');
        $(".exercisebtnwrap .skip_btn").unbind('click');
        $(".exercisebtnwrap .next_btn").unbind('click');
        $(".take_quiz_btn").unbind('click');
        $(".back_to_exercise_btn").unbind('click');
        $(".exercisebtnwrap .go_btn").click(gobtn_click);
        $(".exercisebtnwrap .skip_btn").click(skipbtn_click);
        $(".exercisebtnwrap .next_btn").click(nextbtn_click);
        $(".take_quiz_btn").click(take_quiz_btn_click);
        $(".back_to_exercise_btn").click(back_to_exercise_btn_click);
        $("#rightexercisesection").find('.exercisebarwrap').css('display', 'none');
        toggle_btn(".exercisebtnwrap .go_btn", 'show');

        $('.active #questionwrapper #answer').unbind('keypress');
        $('.active #questionwrapper #answer').keypress(function (ev) {
            //Press Enter Key
            if (ev.keyCode === 13) {
                //gobtn_click();
            }
        });
    }

    function preload_settings() {
        $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.timer.pause_timer');
        hide_question_wrapper();
        show_loader();
        $(".exercisebtnwrap .skip_btn").show();
        $(".exercisebtnwrap .next_btn").hide();
    }

    function show_selected_question(e, dorder) {
        preload_settings();
        get_one_question(dorder);
    } 

    function postload_settings() {
        domReady();
        show_question_wrapper();
        hide_loader();
        $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.timer.resume_timer');
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
        var params = '';
        jsondata['questionID'] = questionID;
        jsondata['variableValueMap'] = get_varvalmap();
        jsondata['questionClass'] = questionClass;
        jsondata['questionTypeID'] = get_questiontype();
        if (jsondata['questionTypeID'] === '1') {
            jsondata['answer'] = $.trim($('.active #questionwrapper #answer').val());
        } else {
            jsondata['answer'] = $.trim($('.active input:radio[name=answer]:checked').val());
        }
        if (jsondata['answer'] === "") {
            $('.active #assessor_area').addClass('empty');
            $('.active #assessor_area').html('<span class="imgwrap empty"></span>Please provide an answer');
            return;
        }
        $(".exercisebtnwrap .go_btn").unbind('click');
        toggle_btn(".exercisebtnwrap .go_btn", 'disable');

        if (screenState == 'quizstate') {
            params = $.fn.get_quiz_question_assess_params();
        }

        jsondata = JSON.stringify(jsondata);
        $.ajax({
            url: webroot_url + 'assess/answer/'+params,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: jsondata,
            success: function (result) {

                //For ADS 
                if (result.isCorrect) {
                    $.flxweb.logADS('hwp_attempt', 'attempted', 1, [artifactID, ads_userid], [questionClass, questionID, "correct", difficultyLevel]);
                    $.flxweb.logADS('exercise', ['correct', 'time_spent'], [1, get_ads_timer_duration()], [artifactID, ads_userid], [questionClass, questionID, difficultyLevel, '', '']);
                } else {
                    $.flxweb.logADS('hwp_attempt', 'attempted', 1, [artifactID, ads_userid], [questionClass, questionID, "wrong", difficultyLevel]);
                    $.flxweb.logADS('exercise', ['wrong', 'time_spent'], [1, get_ads_timer_duration()], [artifactID, ads_userid], [questionClass, questionID, difficultyLevel, '', '']);
                }

                if(result.quizProgress) {
                    $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.progress.mark_answered');
                    $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.progress.update',result.quizProgress);
                }

                if(screenState == 'quizstate') {
                    nextbtn_click();
                    return;  
                }
                if (result.isCorrect) {
                    $('.active #assessor_area').html('<span class="imgwrap correct"></span>'+result.resultMessage);
                } else {
                    $('.active #assessor_area').html('<span class="imgwrap wrong"></span>'+result.resultMessage);
                } 
                $('.active #questionwrapper #answer').unbind('keyup');
                $(".exercisebtnwrap .skip_btn").hide();
                $(".exercisebtnwrap .next_btn").show();
                
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.active #assessor_area').addClass('empty');
                $('.active #assessor_area').html("Sorry, we are unable to evaluate your answer now. Please try again later.");
                $(".exercisebtnwrap .go_btn").click(gobtn_click);
                toggle_btn(".exercisebtnwrap .go_btn", 'show');
            }
        });
    }

    function take_quiz_btn_click() {
        $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.take_quiz');
    }

    function back_to_exercise_btn_click() {
        switch_screen_state(0);
        $.flxweb.events.triggerEvent(document, 'flxweb.exercise.quiz.timer.init_timer');
        reset_quiz_section();
        refreshQuestion();
    }

    function nextbtn_click() {
        clear_assessor_area();  
        refreshQuestion();
        start_ads_timer();
    }

    function skipbtn_click() {
        var questionID =  get_questionid();
        var questionClass = get_questionclass();
        var artifactID = get_concept_id();
        var difficultyLevel = get_difficulty_level();
        $.flxweb.logADS('hwp_attempt', 'attempted', 1, [artifactID, ads_userid], [questionClass, questionID, "skipped", difficultyLevel]);
        $.flxweb.logADS('exercise', ['skipped', 'time_spent'], [1, get_ads_timer_duration()], [artifactID, ads_userid], [questionClass, questionID, difficultyLevel, '', '']);
        refreshQuestion();
        start_ads_timer();
    }
 
    function start_ads_timer() {
    	adsCount = 0;
    	if (! adsTimer && $.timer)
    		adsTimer = $.timer(1000, function() { adsCount++; });
    }

    function get_ads_timer_duration() {
    	return adsCount + '';
    }

    /*
	REPORT ERROR

    */

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

    function cancel_error_report_btn_click() {
        $("#errorReportContinueDiv").hide();
        $("#errorReportSubmitDiv").show();
        $("#submitAnyways").val("False");
    }

    /*
	SLIDER BAR

    */

    function slider(event) {
        if ($(this).hasClass('in')) {
            slide_out();
        } else if ($(this).hasClass('out')) {
            slide_in();
        }
    }

    function slide_out() {
        var thisObj = '#rightexercisesection';
        if ($(thisObj).hasClass('in')) {
            $(thisObj).find('.exercisebarwrap').css('display', 'block');
            $(thisObj).animate({
                right: 0,
                'padding-left':16, 	
	    },250,'linear',function() {
                $(thisObj).find('#arrow_marker').css('right', 53);
                $(thisObj).removeClass('in').addClass('out');	
            }); 
        }    
    }  

    function slide_in() {
        var thisObj = '#rightexercisesection';
        if ($(thisObj).hasClass('out')) {
            $(thisObj).animate({
                right: -228,
                'padding-left':0, 	
	    },200,'linear',function() {
                $(thisObj).removeClass('out').addClass('in');	
                $(thisObj).find('#arrow_marker').css('right', 37);
                $(thisObj).find('.exercisebarwrap').css('display', 'none');
            }); 
        }
    }
  
    /*
	PUBLIC FUNCTIONS

    */

    $.fn.preview_question = function(questionID, questionClass, success_callback, failure_callback) {
        var preview_question_url = webroot_url + 'get/preview/question/'+questionClass+'/'+questionID+'/';
        $(this).load(preview_question_url, function(response, status, xhr) {
            if(status == 'success') {
                $(this).css('display','block');                      
                $(this).find(".go_btn").unbind('click');
                $(this).find(".go_btn").click(function() {
                      gobtn_click();                      
                });
                $(this).find("#questionwrapper #answer").keypress(function (ev) {
                     //Press Enter Key
                     if (ev.keyCode === 13) {
                         gobtn_click();                      
                     }
                }); 
                if (typeof success_callback  != "undefined" && typeof success_callback  == "function") {
                    success_callback();
                } 
            } else {
                if (typeof failure_callback  != "undefined" && typeof failure_callback  == "function") {
                    failure_callback();
                } 
            }
       }); 
    } 
    
    function initExercise() {
        load_exercise_widget();
        refreshQuestion();
        $(document).bind('flxweb.exercise.question.submit_answer', gobtn_click);
        $(document).bind('flxweb.exercise.question.refresh_question', refreshQuestion);
        $(document).bind('flxweb.exercise.question.show_selected_question', show_selected_question);
        //$(document).bind('flxweb.exercise.question.preview.embed', preview_question_embed);
        $("#js_reportExerciseError").click(showReportErrorDialog);
        $("#errorReportContinueDiv .reportcancel").live("click", cancel_error_report_btn_click);

    }
    
    $(document).ready(function() { 
        //In embedded exercise, init instantly.
        if (getExerciseMode() == 'embed') { 
            initExercise(); 
       } 
    });

    $.fn.exists = function () {return $(this).length > 0; }
    
    var ExerciseModule = {
        'initExercise': initExercise
    };
    return ExerciseModule;
});
