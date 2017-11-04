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
 * This file originally written by Deepak Babu
 *
 * $Id$
 */
(function ($) {

    var isAnswered = false;
    var encodedID = '';
    var taskID = '';
    var taskServer = '';
    var worksheetdata = null;
    var count = 0;
    var timer;
    // If not set, It will not show the same results next time eventhough requested params are same(Results would not be cached)
    var reuseWorksheetResults = false;

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
    
    function update_question_attempt() {
       if ($('.stop_test_btn').exists()) {
           var data = {};
           data['questionID'] =  get_questionid();
           data['duration'] = count;
           $.ajax({
               url: webroot_url + 'update/questionattempt/',
               type: 'POST',
               data: data,
               success: function (result) {
               }
           });
       }
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
        $('#questionwrapper').load(webroot_url + 'get/questionfromexercise/encodedid/' + encodedID, function () {
            var isAnswered = false;
            update_question_attempt();
            postload_settings();
            clear_assessor_area();
            if ($('.stop_test_btn').exists()) {
                $(window).unbind('beforeunload');
                $(window).bind('beforeunload', function () {
                    if (!isAnswered) {
                        submit_answer();
                    }
                    update_test_duration();
                    return 'You are currently taking the exercise test. Do you want to leave this page without answering this question?';
                });
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

    function clear_testtry_session() {
        $.ajax({
            url: webroot_url + 'clearsession/testtry/',
            data: '',
            success: function (result) {}
        });
    }

    function config_resource_src(src) {
        if (src.indexOf('youtube') !== -1) {
            if (src.indexOf('?') === -1) {
                src = src + '?';
            }
            //Set auto hide
            src = src + '&autohide=1';
            //Remove 'YouTube' display in controll bar
            src = src + '&modestbranding=1';
            //Disable clicking on the youtube logo which will lead you to the youtube site
            src = src + '&allownetworking=internal';
            //Enable controls
            src = src + '&controls=1';
            //Disable show info of video
            src = src + '&showinfo=0';
            //Disable load related video
            src = src + '&rel=0';
            //Autoplay video
            src = src + '&autoplay=1';
            //Enable auto caption/subtitles
            src = src + '&cc_load_policy=1';
        } else if (src.indexOf('schooltube') !== -1) {
            if (src.indexOf('?') === -1) {
                src = src + '?';
            }
            //Autoplay video
            src = src + '&autoplay=true';
            //Disable sharing
            src = src + '&sharing=false';
        }
        return src;
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

    function show_lightbox() {
        $("#questionwrapper .js_questionhintresourcewrap .LightBox").addClass('LightBoxMode');
    }

    function hide_lightbox() {
        $("#questionwrapper .js_questionhintresourcewrap .LightBox").removeClass('LightBoxMode');
    }

    function domReady() {
        $("#exercisebtnwrap .go_btn").unbind('click');
        $("#exercisebtnwrap .skip_btn").unbind('click');
        $("#exercisebtnwrap .next_btn").unbind('click');
        $("#questionwrapper .hint_btn").unbind('click');
        $(".start_test_btn").unbind('click');
        $(".stop_test_btn").unbind('click');
        $("#questionwrapper .LightBox .lightboxCloseBtn").unbind('click');
        $("#questionwrapper .LightBox .lightboxCloseBtn").click(hide_lightbox);
        $("#questionwrapper .LightBox").click(trigger_lightbox_shadow_click);
        $("#exercisebtnwrap .go_btn").click(gobtn_click);
        $("#exercisebtnwrap .skip_btn").click(skipbtn_click);
        $("#exercisebtnwrap .next_btn").click(nextbtn_click);
        $("#questionwrapper .hint_btn").click(show_lightbox);
        $(".start_test_btn").click(start_test_btn_click);
        $(".stop_test_btn").click(stop_test_btn_click);
        toggle_btn("#exercisebtnwrap .go_btn", 'show');

        $('#questionwrapper #answer').keyup(function (ev) {
            //Press Enter Key
            if (ev.keyCode === 13) {
                gobtn_click();
            }
        });
    }

    function config_lightbox() {
        if ( $('.LightBox').find('.stage embed').exists() || $('.LightBox').find('.stage iframe').exists() ) {
            $('.stage embed,.stage iframe').each(function () {
                var src = $(this).attr('src');
                src = config_resource_src(src);
                $(this).attr('src',  src);
            });
        }
    }

    function preload_settings() {
        pause_timer();
        hide_question_wrapper();
        show_loader();
        $("#exercisebtnwrap .skip_btn").show();
        $("#exercisebtnwrap .next_btn").hide();
    }

    function postload_settings() {
        domReady();
        config_lightbox();
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

    function start_test_btn_click() {
        $(".start_test_btn").unbind('click');  
        toggle_btn(".start_test_btn", 'disable');
        var encodedID = get_exercise_encoded_id();
        $.ajax({
            url: webroot_url + 'start/test/' + encodedID,
            type: 'POST',
            success: function (result) {
                if (result.testStarted === true) {
                    toggle_btn(".start_test_btn", 'show');
                    $(".start_test_btn").text("Stop Timer");
                    $(".start_test_btn").attr("title", "Stop Timer");
                    $(".start_test_btn").addClass("stop_test_btn").removeClass("start_test_btn")
                    $(".stop_test_btn").unbind('click');
                    $(".stop_test_btn").click(stop_test_btn_click);
        	    start_timer();
                    refreshQuestion();
                } else {
                    $.flxweb.showDialog($('#js_start_test_failed_message').html());		
                    toggle_btn(".start_test_btn", 'show');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                toggle_btn(".start_test_btn", 'show');
                $(".start_test_btn").click(start_test_btn_click);  
            }

        });
    }

    function stop_test_btn_click() {
        toggle_btn(this, 'disable');
        $(this).unbind('click');
        pause_timer();

        $(window).unbind('beforeunload');

        options = {
            width:500,
            buttons: null,
            title: 'Result',
            beforeClose: close_test_result_btn_click 
        };
        
        var url = $('#js_testresultdialog').attr('url')+ '?duration='+count;

        $.flxweb.showDialog('<iframe id="reportiframe" '+
                                    'frameborder="0" '+
                                    'scrolling="auto" ' +
                                    'src="'+url+'" ' +
                                    'width="475"' + 
                                    'height="280"' +
                                    '/>', options);
        return false;
    }
 
    function stop_test_btn_click_old() {
        toggle_btn(this, 'disable');
        $(this).unbind('click');
        pause_timer();
        if (!isAnswered) {
            submit_answer();
        }
        $(window).unbind('beforeunload');

	$.blockUI({ message: $('#js_testresultdialog'), css:{
            width: '500px',
            'min-height': '335px',		
            top:  ($(window).height() - 343) /2 + 'px',
            left: ($(window).width() - 500) /2 + 'px',
            border: '2px',
            padding: '10px',
            backgroundColor: '#5d5d5d',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            'cursor': 'default'
        } });

        $('.blockOverlay').click(close_test_result_btn_click);
        $('#close_testresult_btn').live('click', close_test_result_btn_click );
        
        $('#js_testresultdialog').load(
            $('#js_testresultdialog').attr('url')+ '?duration='+count,
            function() {
         });
        return false;
    }
 
    function close_test_result_btn_click() {
        stop_timer();
        $('#js_testresultdialog').empty();
        $(".extestresultwrapper").addClass('hide');
        document.location.reload(true);
        return true;	
    } 

    function trigger_lightbox_shadow_click() {
        if ($('.js_questionhintresourcewrap .LightBox .StreamMode').exists()) {
            hide_lightbox();
        }
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

    /*
	WORKSHEET PARTS
    */
    function disable_worksheet_btn() {
        toggle_btn(".createworksheet_btn", 'disable');
    }

    function enable_worksheet_btn() {
        toggle_btn(".createworksheet_btn", 'show');
    }

    function show_loading_box() {
        disable_worksheet_btn();
        $(".worksheetwrapper #ws_loading_div").removeClass('hide');
    }

    function hide_loading_box() {
        $(".worksheetwrapper #ws_loading_div").addClass('hide');
        enable_worksheet_btn();
    }

    function show_worksheet_result(result) {
        var worksheet = result.userdata;
        $('.worksheetresultpanel').empty();
        for(each in worksheet) {
            $('.worksheetresultpanel').append('<a href="' + worksheet[each].uri + '" target="_blank" >Download ' + worksheet[each].worksheetType + ' worksheet</a>');
        }
        $('.worksheetresultpanel').removeClass('hideresults');
    }

    function hide_worksheet_result() {
        $('.worksheetresultpanel').addClass('hideresults');
    }

    function toggle_worksheetform_btn_click() {
        $(".worksheetwrapper").slideToggle("fast", function () {
            if ($(".worksheetwrapper").is(":visible")) {
                $('.uptip').css('visibility', 'visible');
            } else {
                $('.uptip').css('visibility', 'hidden');
            }
        });
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

    function get_worksheet_form() {
        var formdata = $(".createworksheetform").serialize();
        if (!reuseWorksheetResults) {
            //This will avoid showing same results next time
            formdata = formdata + '&uid=' + new Date().getTime();
        }
        return formdata;
    }

    function close_worksheet_form_btn_click() {
        if ($(".worksheetwrapper").is(":visible")) {
            $('.uptip').css('visibility', 'hidden');
            $(".worksheetwrapper").slideUp("fast");
        }
    }

    function render_error() {
        hide_loading_box();
        alert('Sorry,we could not create your worksheet, Please retry..');
        enable_worksheet_btn();
    }

    function renderWorksheetStatusCheck(json_status) {
        if (json_status!=null && json_status.taskId && json_status.taskServer ) {
            taskID = json_status.taskId;
            taskServer = json_status.taskServer;
        }
        data = {}
        data['task_server'] = taskServer
        $.ajax({
            url: webroot_url + 'render/exercise/worksheet/status/' + taskID + '/',
            type: 'POST',
            success: worksheetDownloadStatusChange,
            error: render_error,
            dataType: 'json',
            data:data      
        });
        return false;
    }

    function worksheetDownloadStatusChange(json_status) {
        if (json_status.status === "SUCCESS") {
            hide_loading_box();
            show_worksheet_result(json_status);
        } else if (json_status.status === "FAILURE") {
            render_error();
        } else if ((json_status.status === "IN PROGRESS") || (json_status.status === "PENDING")) {
            window.worksheettimeout = window.setTimeout(renderWorksheetStatusCheck, 5 * 1000);
        }
    }

    function renderWorksheetInitiate() {
        $.ajax({
            type: 'POST',
            url: webroot_url + 'render/exercise/worksheet/' + encodedID + '/',
            success: renderWorksheetStatusCheck,
            error: render_error,
            data: worksheetdata,
            dataType: 'json'
        });
        return false;
    }

    function create_worksheet_btn_click() {
        show_loading_box();
        hide_worksheet_result();
        encodedID = get_exercise_encoded_id();
        worksheetdata = get_worksheet_form();
        renderWorksheetInitiate();
    }

    /*
	TIMER PARTS
    */
    Number.prototype.pad = function (len) {
    return (new Array(len+1).join("0") + this).slice(-len);
    }

    function start_timer() {
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
            ++count;
            time = get_timer_duration();
            $('#timer-hours').empty().html(time.hours);
            $('#timer-minutes').empty().html( time.minutes.pad(2) );
            $('#timer-seconds').empty().html( time.seconds.pad(2) );
    }

    function get_timer_duration() {
        return {
            'hours': Math.floor(count / 3600),
            'minutes': Math.floor( (count % 3600) / 60),
            'seconds': (count % 3600) % 60
        }
    }

    function update_test_duration() {
        pause_timer();
        data = {};
        data['duration'] = count
        $.ajax({
            type: 'POST',
            url: webroot_url + 'update/test/',
            success: function(result) { },
            data: data,
        });
        return false;
    }

    function init_timer_data() {
        initCount = $('#test_duration').text();
        if ((!isNaN(initCount)) && (initCount.length > 0) ) {
            count = initCount;
            start_timer();    
        }    
    }

    $('.previewquestionwrap .go_btn').live('click',gobtn_click); 

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
        $.flxweb.showDialog('<iframe id="reportiframe" '+
                                    'frameborder="0" '+
                                    'scrolling="auto" ' +
                                    'src="'+url+'" ' +
                                    'width="680"' + 
                                    'height="500"' +
                                    '/>', options);

        return false;
    }




    $(document).ready(function () {
        load_exercise_widget();
        init_timer_data();
        refreshQuestion();
        $(".showworksheetform_btn").click(toggle_worksheetform_btn_click);
        $(".createworksheet_btn").click(create_worksheet_btn_click);
        $(".closeworksheetform_btn").click(close_worksheet_form_btn_click);
        $(".triggersignin").click($.flxweb.showSigninDialog);
        $("#js_reportExerciseError").click(showReportErrorDialog);
    });

})(jQuery);

jQuery.fn.exists = function () {return jQuery(this).length > 0; };
