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
(function($) {

    var workbookdata = null;
    // If not set, It will not show the same results next time eventhough requested params are same(Results would not be cached)
    var reuseWorkbookResults = false;
    var taskID = '';
    var taskServer = '';
    var targetField = '';
    var minExerciserequired = 1;
    var minNoq = 2;
    var maxNoq = 30;
    var workbookForm = null;

    function create_workbook_btn_click() {
        var isValid = $("#createworkbookform").valid();
        if (isValid) {
            show_loading_box();
            disable_workbook_form();
            hide_workbook_result();
            workbookdata = get_workbook_form();
            renderWorkBookInitiate();
        }
    }

    function addmore_exercise_btn_click() {
        //show_learning_tree();
        $.flxweb.editor.AddContentDialog.open();
        return false;
    }

    function remove_exercise_btn_click() {
        total_toc = $(".toccontent:visible").length;
        if(total_toc == 1) {
            $(this).parent().addClass('hide');      
            $('.tocerror').removeClass('hide');
        } else { 
            $(this).parent().remove();
        }
        sortExerciseOrder();
    }

    function remove_all_exercises() {
        $(".toccontent::visible").each(function(index) {
            total_toc = $(".toccontent:visible").length;
            if(total_toc == 1) {
                $(this).addClass('hide');     
		$(this).find('.exerciseno span').html('1') 
                $('.tocerror').removeClass('hide');
            } else { 
                $(this).remove();
            }
        }); 
    }

    function is_odd(exerciserow) {
        return exerciserow.hasClass('oddrow');
    }

    function get_ex_no(exerciserow) {
        return parseInt(exerciserow.find('.exerciseno span').html());
    }

    function set_ex_no(exerciserow, ex_no) {
        exerciserow.find('.exerciseno span').html(ex_no);
    }

    /*Global Function*/
    $.fn.addtocrow = function () {
        var lastrow = $('#workbooktocform').find('.toccontent:last');
        if (!lastrow.is(":visible")) {
            lastrow.removeClass('hide');
            $('#workbooktocform').find('.tocerror').addClass('hide');
            $('.notocerror').empty();
            return false;
        }
        var ex_no =  get_ex_no(lastrow);
        var isOdd = is_odd(lastrow);
        lastrow.clone(true).insertAfter(lastrow);
        lastrow = $('#workbooktocform').find('.toccontent:last');
        set_odd_even_class(lastrow, isOdd);
        set_ex_no(lastrow, ex_no + 1);
        lastrow.find('.input_execisedetails').html('');
         
        //Remove any toc error
        $('.notocerror').empty();
    };

    function show_loader() {
        $("#loading_div").show();
    }

    function set_odd_even_class(exerciserow, isOdd) {
        var classname = ""
        if (isOdd) {
            classname = "evenrow";
        } else {
            classname = "oddrow";
        }
        exerciserow.removeClass('oddrow').removeClass('evenrow');
        exerciserow.addClass(classname);
    }

    function hide_loader() {
        $("#loading_div").hide();
    }

    function render_error() {
        hide_loading_box();
        $.flxweb.showDialog($('#js_workbook_failed_message').html());
        enable_workbook_form();
        enable_workbook_btn();
    }

    function renderWorkBookInitiate() {
        $.ajax({
            type: 'POST',
            url: webroot_url + 'render/exercise/workbook/',
            success: renderWorkbookStatusCheck,
            error: render_error,
            data: workbookdata,
            dataType: 'json'
        });
        return false;
    }

    function workbookDownloadStatusChange(json_status) {
        if (json_status.status === "SUCCESS") {
            hide_loading_box();
            enable_workbook_form();
            show_workbook_result(json_status);
        } else if (json_status.status === "FAILURE") {
            render_error();
        } else if ((json_status.status === "IN PROGRESS") ||(json_status.status === "PENDING")) {
            window.workbooktimeout = window.setTimeout(renderWorkbookStatusCheck, 5 * 1000);
        }
    }

    function renderWorkbookStatusCheck(json_status) {
        if (json_status!=null && json_status.taskId && json_status.taskServer ) {
            taskID = json_status.taskId;
            taskServer = json_status.taskServer;
        }
        data = {}
        data['task_server'] = taskServer

        $.ajax({
            url: webroot_url + 'render/exercise/worksheet/status/' + taskID + '/',
            type: 'POST',
            success: workbookDownloadStatusChange,
            error: render_error,
            dataType: 'json',
            data: data
        });
        return false;
    }

    function get_workbook_form() {
        var tocdata = get_toc_data();
        var workbook_title = get_title();
        var workbook_format = get_workbook_format();
        var workbook_answerkey_option = get_answerkey_option();
        var formdata = tocdata + '&' + workbook_title + '&' + workbook_format + '&' + workbook_answerkey_option;
        if (!reuseWorkbookResults) {
            //this will avoid showing same results next time
            formdata = formdata + '&uid=' + new Date().getTime();
        }
        return formdata;
    }

    function get_toc_data() {
        var tocdetails = '';
        $('#workbooktocform').children(".toccontent").each(function (index) {
            var exercisedetails =  $.trim($(this).find('.input_conceptid').val());
            var noq =  $.trim($(this).find('.input_noq').val());
            var exercise = '{"' + exercisedetails + '":' + noq + '}';
            if (index) {
                tocdetails = tocdetails + '&' + 'exercise=' + exercise;
            } else {
                tocdetails = tocdetails + 'exercise=' + exercise;
            }
        });
        return tocdetails;
    }

    function get_workbook_format() {
        var workbook_format = "";
        $('#workbookoptionsform').find('input:checkbox:checked').each(function (index) {
            if (index) {
                workbook_format = workbook_format + '&' + $(this).attr('id') + '=' + $(this).attr('value');
            } else {
                workbook_format = workbook_format + $(this).attr('id') + '=' + $(this).attr('value');
            }
        });
        return workbook_format;
    }

    function get_answerkey_option() {
        var selected_option = $('#workbookoptionsform').find('input:radio:checked');
        return selected_option.attr('name') + '=' + selected_option.attr('value');
    }

    function get_title() {
        return 'workbook_title=' + $.trim($('input[name=workbooktitle]').val());
    }

    function disable_workbook_btn() {
        $(".createworkbook_btn").addClass('disabled');
    }

    function enable_workbook_btn() {
        $(".createworkbook_btn").removeClass('disabled');
    }

    function disable_workbook_form() {
        $('#createworkbookform').find('input, textarea, button, select').attr('disabled','disabled');
        $(".createworkbook_btn, .resetworkbookform_btn, #addexercise_btn, .removeexercise_btn").unbind('click');
    }

    function enable_workbook_form() {
        $('#createworkbookform').find('input, textarea, button, select').removeAttr('disabled');
        $(".createworkbook_btn, .resetworkbookform_btn, #addexercise_btn, .removeexercise_btn").unbind('click');
        $(".createworkbook_btn").click(create_workbook_btn_click);
        $(".resetworkbookform_btn").click(reset_form_btn_click);
        $("#addexercise_btn").click(addmore_exercise_btn_click);
        $(".removeexercise_btn").click(remove_exercise_btn_click);
    }

    function show_loading_box() {
        disable_workbook_btn();
        $("#createworkbookform #wb_loading_div").removeClass('hide');
    }

    function hide_loading_box() {
        $("#createworkbookform #wb_loading_div").addClass('hide');
        enable_workbook_btn();
    }

    function show_workbook_result(result) {
        var workbook = result.userdata;
        $('.workbookresultpanel').empty();
        for (each in workbook) {
            $('.workbookresultpanel').append('<a href="' + workbook[each].uri + '" target="_blank" >Download ' + workbook[each].worksheetType + ' workbook</a>');
        }
        $('.workbookresultpanel').removeClass('hide');
    }

    function hide_workbook_result() {
        $('.workbookresultpanel').addClass('hide');
    }

    function hide_learning_tree_click(event) {
        event.stopPropagation();
        var clicked = event.target;
        if (clicked.id == 'learningtreeholder') {
            hide_learning_tree();
        }
    }

    function reset_form_btn_click(event) {
	$('#createworkbookform').each (function(){
            this.reset();
        });
        remove_all_exercises();
        if (workbookForm) { 
            workbookForm.resetForm();
        }
        hide_workbook_result();
    }

    function addContent(e, data) {
        var artifactData = data.artifact.attributes;
        addToWorkBookToc(artifactData)
        $.flxweb.editor.AddContentDialog.close();
    }

    function addToWorkBookToc(artifact) {
        emptyExercise = getNextEmptyExerciseDom();
        emptyExercise.find('.input_execisedetails').html( trimTitle(artifact.title) );
        emptyExercise.find('.input_conceptid').val(artifact.encodedID);
        emptyExercise.find('.input_handle').val(artifact.handle);
    }

    function trimTitle(title) {
        if ( title.length > 50 ) {
            title = title.substr(0,50) + ' ...';
        }
        return title
    }
 
    /* Sort Exercises after Drag and Drop*/
    function sortExerciseOrder() {
        var exercisetoc = $('#workbooktocform').sortable( "widget" )
        exerciseList = exercisetoc.find('.toccontent:visible'); 
        nextClass = 'evenrow';
        exerciseList.each(function(index) {
            $(this).removeClass('oddrow').removeClass('evenrow');

            if(nextClass == 'evenrow') {
                $(this).addClass(nextClass);
                nextClass = 'oddrow';
            }else if(nextClass == 'oddrow')  {
                $(this).addClass(nextClass);
                nextClass = 'evenrow';
            }
        $(this).find('.exerciseno span').html(index+1);
   });
   }

    function forceOnlyNumeric(event) {
       // Allow: backspace, delete, tab, escape, and enter
       if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
            // Allow: Ctrl+A
           (event.keyCode == 65 && event.ctrlKey === true) || 
            // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39)) {
                return;
       }
       else {
           // Ensure that it is a number and stop the keypress
           if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
               event.preventDefault(); 
           }   
       }
    }

    function getNextEmptyExerciseDom() {
        $(".addexercise_btn").addtocrow();
        lastrow = $('#workbooktocform').delay(500).find('.toccontent:last');
        if (lastrow) {
            return lastrow;
        } else {
            $.flxweb.showDialog($('#js_workbook_reached_limitation').html());
        }
    }

    $(document).ready(function() {
    $(".triggersignin").click($.flxweb.showSigninDialog);
    enable_workbook_form();	
    $(document).bind('flxweb.editor.addcontent.add_artifact', addContent);
    $(".input_noq").keydown(forceOnlyNumeric);
 
    $( "#workbooktocform" ).sortable({
        axis: "y",
        cursor: "move",
        items: 'li:not(#tocheadermenu)',
        update: function() { sortExerciseOrder(); },
    });
      

    /* Validatation Part --START*/
    $.validator.addMethod("hasMinExercises", function(value, element) {
        if( $(".toccontent:visible").length >= minExerciserequired) {
           return true;
        }
        return false;
    });

    $.validator.addMethod("hasLimitedNOQ", function(value, element) {
        var noq;
        var isGood = true;
        $('.input_noq').each(function(index) {
              noq = parseInt($(this).val());
              if(noq < minNoq || noq > maxNoq) {
		 isGood = false;
                 return;  
              }
        });
        return  isGood;
    });

    workbookForm = $('#createworkbookform').validate({
            rules : {
                workbooktitle : {
                    required : true
                },
                formattype : {
                    required: true,
                    minlength: 1
                },
                conceptid : {
                    required: true,
                    hasMinExercises:true,
                },
                noq : {
                    required: true,
                    hasLimitedNOQ: true,			
                }
            },
            messages : {
                workbooktitle : "Please enter workbook title",
                formattype    : "Please select your desired workbook formats",
                noq           : { required : "Please fill up the number of questions in all your selected exercises", hasLimitedNOQ : "Please make sure the number of questions fields has minimum "+ minNoq +" and maximum "+ maxNoq +" questions"} ,
                conceptid     : "Please select some exercises",
            },
            errorPlacement: function(error, element) {
                if ( $(element).hasClass('input_conceptid') || $(element).hasClass('input_noq') ) {
                    errorbox = $('.middleformerrors');
                    errorbox.empty();
                    errorbox.append(error);
                    errorbox.addClass('notocerror')
                    return error;
                } else if ($(element).hasClass('formattype')) {
                    errorbox = $('.optionserrors');
                    errorbox.empty();
                    errorbox.append(error);
                    return error;
                } else {
                    $(element).next('.error').removeClass('hide').append(error);   
                }
            },
            ignore: "",
            errorClass:'errorbox',
        });
    });
    /* Validatation Part --END*/


})(jQuery);

jQuery.fn.exists = function() {return jQuery(this).length>0;}

/* Add workbook table of contents from learning tree data */

