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
(function($){

    var isValid = true;
    var qClass = 'declarative';
    var qTypeId = 1;
    var maxRuleBox = 25;

    function addThisQuestion_click() {
        isValid = true;
        qClass = getQuestionClass();
        clearErrorMessages();
        if(qClass == "declarative") {     
            isValid = $(".declarativequestionform").valid();
        }else if(qClass == "generative") {
            isValid =  $(".generativequestionform").valid(); 
        } 
        hideResult();
        jsondata = getQuestionForm()
        if(isValid && jsondata ) {
             $('.addquestionbtnwrap #add_this_question_btn').addClass('disabled');
             exerciseId = getExerciseId()    
             jsondata = JSON.stringify(jsondata);
             showLoading();		
             $.ajax({
                url: webroot_url + 'exercise/add/question/'+exerciseId+'/',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: jsondata,
                success: function(result) {
                     $('.addquestionbtnwrap #add_this_question_btn').removeClass('disabled');
                     stopLoading();		
                     showResult(result)
                },
                error: function(jqXHR,textStatus,errorThrown) {
                    $('.addquestionbtnwrap #add_this_question_btn').removeClass('disabled');
                    stopLoading();		
                    $.flxweb.showDialog($('#js_add_question_failed_message').html());		
                }
             });
        }
       
    }

    function selectCorrectAnswer_click() {
        if($(this).hasClass('selected') != true) {
            qTypeId = getQuestionType(qClass)
            if(qTypeId == 3) {
                $('.multiplechoiceoptions .iscorrect_checkbox').removeClass('selected');
                $(this).addClass('selected');    
                $('.multiplechoiceoptions .iscorrect_checkbox').attr('title','Wrong Answer');
                $(this).attr('title','Correct Answer');
            }else if(qTypeId == 2) {
               	$('.truefalseoptions .iscorrect_checkbox').removeClass('selected');
                $(this).addClass('selected');    
                $('.truefalseoptions .iscorrect_checkbox').attr('title','False Question');
                $(this).attr('title','True Question');
            }
            
        }  
    }  

    function chooseQuestionClass_click() {
        if($(this).hasClass('selected') != true) {
            $('.questionclassbtn').removeClass('selected').addClass('secondary');
            $(this).addClass('selected').removeClass('secondary');
            qClass = $(this).attr('id');
            $('.createquestionform').css('display','none');

            if(qClass == 'generative') {
                $('.declarativeclasshelp').css('display','none')
                $('.generativeclasshelp').css('display','block')
                $('.generativequestionform').css('display','block'); 
            }else if(qClass == 'declarative') {
                $('.generativeclasshelp').css('display','none')
                $('.declarativeclasshelp').css('display','block')
                $('.declarativequestionform').css('display','block'); 
            }
            hideToolTip(); 
            hideResult();
            clearErrorMessages();
        }
    }

    function chooseQuestionType_click() {
        if($(this).hasClass('selected') != true) {
            qClass = getQuestionClass()

            if(qClass == 'generative') {
                $('.generativequestionform .questiontypebox').removeClass('selected');
            }else if(qClass == 'declarative') {
                $('.declarativequestionform .questiontypebox').removeClass('selected');
            } 
             
            $(this).addClass('selected');

            if(qClass == 'declarative') {
                $('.optionsblock').removeClass('currentblock');
   	        qType = $(this).attr('id');
        	if(qType == 'multichoicetype') {
               		$('.input_options .multiplechoiceoptions').addClass('currentblock');
     	    	}else if(qType == 'truefalsetype') {
        	        $('.input_options .truefalseoptions').addClass('currentblock');
	    	}else if(qType == 'shortanswertype') {
        	        $('.input_options .shortanswer').addClass('currentblock');
    	    	}
            }else if(qClass == 'generative') {
                $('.distractorsblock').removeClass('currentblock');
   	        qType = $(this).attr('id');
        	if(qType == 'multichoicetype') {
                        $('.input_distractors').removeClass('nodistractorinput');
               		$('.input_distractors .multiplechoicedistractors').addClass('currentblock');
     	    	}else if(qType == 'truefalsetype') {
                        $('.input_distractors').removeClass('nodistractorinput');
        	        $('.input_distractors .truefalsedistractors').addClass('currentblock');
    	    	}else {
                        $('.input_distractors').addClass('nodistractorinput');
                }
            } 
        }
    }   

    function chooseDifficultyLevel_click() {
        if($(this).hasClass('selected') != true) {
            qClass = getQuestionClass()

            if(qClass == 'generative') {
                $('.generativequestionform .difficultylevelbox').removeClass('selected');
            }else if(qClass == 'declarative') {
                $('.declarativequestionform .difficultylevelbox').removeClass('selected');
            } 
             
            $(this).addClass('selected');
        }
    }   

    function resetQuestionForm_click() {
        resetQuestionForm();
    } 

    function previewQuestion_click() {
        $('.previewquestion').unbind('click');			
        var qId = getQuestionId();
        if ( qId == null ) 
           return; 
        var qClass = getQuestionClass();
        var preview_question_url = webroot_url + 'get/preview/question/'+qClass+'/'+qId+'/';
        $('.previewquestionwrap').load(preview_question_url, function(response, status, xhr) {
            if(status == 'success') {
                $('.previewquestion').click(previewQuestion_click);
                $(".previewquestionwrap .go_btn").unbind('click');
                $('.previewquestionwrap .go_btn').click(function() {
                      $.flxweb.events.triggerEvent(document, 'flxweb.exercise.question.submit_answer');                     
                });
                $('.createresultwrap').removeClass('hide');			
                $('.previewquestionwrap').css('display','block');			
                $("#deletequestion").unbind('click');
                $("#keepquestion").unbind('click');
                $('#deletequestion').click(deleteQuestion_click);
                $('#keepquestion').click(keepQuestion_click);
            } else {
                $('.previewquestion').click(previewQuestion_click);			
                $.flxweb.showDialog($('#js_preview_question_failed_message').html());		
                $('.createresultwrap').addClass('hide');			
                $("#deletequestion").unbind('click');
                $("#keepquestion").unbind('click');
                $('#deletequestion').click(deleteQuestion_click);
                $('#keepquestion').click(keepQuestion_click);
            }
        });

    }

    function keepQuestion_click() {
         closeAcknowledge()
    }

    function deleteQuestion_click() {
        $('#deletequestion').unbind('click');			
        var qId = getQuestionId();
        var qClass = getQuestionClass();
        params = {}
        params['question_id'] = getQuestionId();
        params['question_class'] = getQuestionClass();
        params['del_question'] = '';
        $.ajax({
                url: webroot_url + 'exercise/delete/question/'+getExerciseId(),
                type: 'POST',
                data: params,
                success: function(result) {
                     hideResult();
                     $('#deletequestion').click(deleteQuestion_click);			
                },
                error: function(jqXHR,textStatus,errorThrown) {
                    $('#deletequestion').click(deleteQuestion_click);			
                    $.flxweb.showDialog($('#js_delete_question_failed_message').html());		
                }
             });
    }   

    function addRuleBox_click() {

       if($('.rulebox').length <= maxRuleBox ) { 
           currentbox = $(this).parent().parent();

           if($('.rulebox').length == 1) {   
               currentbox.find('.removerulebox').css('visibility','visible');
           }
           newbox = currentbox.clone(true);
           newbox.find('.ruletext').val('');  
           newbox.insertAfter(currentbox);
       }
     
       if($('.rulebox').length == maxRuleBox ) {
           $('.rulebox').find('.question_rule').find('.addrulebox').css('visibility', 'hidden');
       }  

    }

    function removeRuleBox_click() {

       if($('.rulebox').length > 1 ) { 
           currentbox = $(this).parent().parent();
           currentbox.remove();
       }
 
       if($('.rulebox').length == 1 ) {
           $('.rulebox').find('.question_rule').first().find('.removerulebox').css('visibility', 'hidden');
       }
      
       if($('.rulebox').length < maxRuleBox ) {
           $('.rulebox').find('.question_rule').find('.addrulebox').css('visibility', 'visible');
       }  
    }

    function showResult(result) {
        $('.createresultwrap').html(result);
        $('.createresultwrap').removeClass('hide');
        previewQuestion_click()
    }

    function hideResult() {
        $('.createresultwrap').html('');
        $('.createresultwrap').addClass('hide');
        removePreview(); 
    }

    function hideToolTip() {
        $.each($.fn.qtip.interfaces, function(i, curValue) {
            if (curValue && curValue.status && curValue.status.rendered) {
                curValue.hide();
            }
        });
    }  

    function prepareHelpTips() {
        tooltip_options = {
            position: {
                corner: { target: 'rightMiddle', tooltip: 'leftMiddle' }
            },
            style: { 
                tip: { corner: 'leftMiddle', color: '#D3D3D3', size: { x:8, y:14 } },
                border: { width: 1, radius: 0, color: '#D3D3D3' },
                background: '#F7F6F7',
                name: 'light',
                classes: { tooltip: 'tooltip' }   
            },
            show: {
                when: { target: false, event: 'click' },
                delay: 10,
                solo: true,
                ready: false
            },
            hide: 'unfocus',
            width:400,
        }
        $("#dec-question-help").qtip(         $.extend(tooltip_options,{ content: $('#dec-question-tooltip').html()          }));
        $("#gen-question-help").qtip(         $.extend(tooltip_options,{ content: $('#gen-question-tooltip').html()          }));
        $("#gen-algebraictext-help").qtip(    $.extend(tooltip_options,{ content: $('#gen-algebraictext-tooltip').html()     }));
        $("#gen-answerdisplaytext-help").qtip($.extend(tooltip_options,{ content: $('#gen-answerdisplaytext-tooltip').html() }));
        $("#gen-inputrules-help").qtip(       $.extend(tooltip_options,{ content: $('#gen-inputrules-tooltip').html()        }));
        $("#gen-distractors-help").qtip(      $.extend(tooltip_options,{ content: $('#gen-distractors-tooltip').html()       }));
        $("#dec-options-help").qtip(          $.extend(tooltip_options,{ content: $('#dec-options-tooltip').html()           }));
    }  

    function showLoading() {
	$('#createq_loading_div').removeClass('hide');
    }
 
    function stopLoading() {
	$('#createq_loading_div').addClass('hide');
    }

    function closeAcknowledge() {
        $('.addquestionmessage').html('');
        $('.thanks-message').removeClass('hide');
        removePreview(); 
    }
    
    function showPreview(result) {
        $('.previewquestionwrap').html(result);  
        $('.previewquestionwrap').show();     
    }
  
    function removePreview() {
        $('.previewquestionwrap').html('');  
        $('.previewquestionwrap').css('display','none')
    }

    function getQuestionForm() {
        formdata = {}
        var qClass = getQuestionClass();
        var qTypeId = getQuestionType(qClass);
        formdata['question_class'] = qClass;
        formdata['exercise_handle'] = getExerciseHandle();
        formdata['difficulty_level'] = getDifficultyLevel(qClass);
        if(qClass == 'declarative') {
             formdata['display_text'] = getQuestion(qClass);
             formdata['questiontype_id'] = qTypeId;
             formdata['question_options'] = getQuestionOptions(qTypeId);
        }else if(qClass == 'generative') {
             formdata['display_text'] = getQuestion(qClass);
             formdata['algebraic_text'] = getAlgebraicText();
             formdata['questiontype_id'] = getQuestionType(qClass);
             formdata['instance_rules'] = getInstanceRules();
               
             if(qTypeId == 3) { 
                 formdata['answer_display_text'] = getAnswerDisplayText();
             }
             if(qTypeId != 1) { 
                 formdata['question_options'] = getQuestionDistractors(qTypeId);
             } 
        }
        return formdata
    }

    function resetQuestionForm() {
        $(':input','.createquestionwrap')
            .not(':button, :submit, :reset')
            .not('[readonly="readonly"]')
            .val('');
        $('.multiplechoiceoptions .iscorrect_checkbox').removeClass('selected');
        $('.multiplechoiceoptions .iscorrect_checkbox').attr('title','Wrong Answer');
        hideResult();
        clearErrorMessages(); 
    }    

    function getQuestion(qClass) {
        if (qClass == 'declarative')  {
             question = $.trim($('.declarativequestionform .questiontext').val());
             stripedQuestion = stripHtmlTags(question); 
             if (!(stripedQuestion.length > 0))  {
                isValid = false;  
                $('.declarativequestionform #er_invalid_question').html('Please write your question');
                $('.declarativequestionform #er_invalid_question').css('display','block');
                return;
             }     
        } else if (qClass == 'generative') {
             question = $.trim($('.generativequestionform .questiontext').val());
             stripedQuestion = stripHtmlTags(question); 
             if (!(stripedQuestion.length > 0))  {
                isValid = false;  
                $('.generativequestionform #er_invalid_question').html('Please write your question');
                $('.generativequestionform #er_invalid_question').css('display','block');
                return;
             }     
        }
        //changing hwp variable delimeters from \\$ to $
        question = question.replace(/\$/g, "$").replace(/%5C%24/g,'%24');
        question = question.replace(/&nbsp;/g,"");

        return question 
    } 

    function getQuestionClass() {
        var qClass = $('.questiontclassbtns .selected').attr('id');  
        return qClass
    }  

    function getExerciseId() {
        var exercise_id = $.trim($('#exerciseid').html());  
        return exercise_id
    }
   
    function getQuestionId() {
        var question_id = $('#questionid').html();
        return question_id
    } 

    function getExerciseHandle() {
        return $.trim($('#exercisehandle').html()); 
    }    

    function getQuestionType(qClass) {

        if(qClass == 'declarative') { 
             qType = $('.declarativequestionform .input_questiontype').find('.selected').attr('id'); 
        }else if(qClass == 'generative') {
             qType = $('.generativequestionform .input_questiontype').find('.selected').attr('id'); 
        } 
        var qTypeId = 0; 

        if(qType == 'multichoicetype') {
             qTypeId = 3
        }else if(qType == 'truefalsetype') {
             qTypeId = 2     
        }else if(qType == 'shortanswertype') {
             qTypeId = 1 
        }      
        return qTypeId 
    }    

    function getDifficultyLevel(qClass) {

        if(qClass == 'declarative') { 
             qType = $('.declarativequestionform .input_difficultylevel').find('.selected').attr('id'); 
        }else if(qClass == 'generative') {
             qType = $('.generativequestionform .input_difficultylevel').find('.selected').attr('id'); 
        } 
        return qType
    }    
    function getQuestionOptions(qTypeId) {
        options = []
        if(qTypeId == 1)  {
             options.push( getOption('shortanswer', 1) ); 
        }else if(qTypeId == 2) {  
             options.push( getOption('truefalseoptions', 1) );
             options.push( getOption('truefalseoptions',2) );
        }else if(qTypeId == 3) {
             options.push( getOption('multiplechoiceoptions', 1) ); 
             options.push( getOption('multiplechoiceoptions', 2) ); 
             options.push( getOption('multiplechoiceoptions', 3) ); 
             options.push( getOption('multiplechoiceoptions', 4) );
             checkOptionshasOneTick('multiplechoiceoptions');  
        }
        return options   
    }

    function getOption(parentClass , option_no) {
        optionbox = 'option' + option_no;    
        option = $('.input_options .'+parentClass+' #'+optionbox);
        optionText = $.trim(option.find('input[type=text]').val());
        optionIsCorrect = option.find('.iscorrect_checkbox').hasClass('selected');
        if(optionIsCorrect == true) {
             isCorrect = "T" 
        }else {
             isCorrect = "F"
        }
    
        option = {}
        option['displayText'] = optionText;
        option['isCorrect'] = isCorrect;
        option['displayOrder'] = option_no;
        return option 
    }

    function getQuestionDistractors(qTypeId) {
        distractors = []
        if(qTypeId == 1)  {
             return distractors;
        }else if(qTypeId == 2) {  
             distractors.push( getDistractor('truefalsedistractors', 1) ); 
        }else if(qTypeId == 3) {
             distractors.push( getDistractor('multiplechoicedistractors', 1) ); 
             distractors.push( getDistractor('multiplechoicedistractors', 2) ); 
             distractors.push( getDistractor('multiplechoicedistractors', 3) ); 
        }
        return distractors  
    }

    function getDistractor(parentClass , distractor_no) {
        distractorbox = 'distractor' + distractor_no;    
        distractor = $('.input_distractors .'+parentClass+' #'+distractorbox);
        algebraicText = $.trim( distractor.find('.question_dist_eq').find('input[type=text]').val() );

        if(parentClass == 'multiplechoicedistractors') { 
            displayText = $.trim( distractor.find('.question_dist_text').find('input[type=text]').val() );
        }else {
            displayText=''; 
        } 
        distractor = {}
        distractor['displayText'] = displayText;
        distractor['algebraicText'] = algebraicText;
        return distractor 
    }

    function getAlgebraicText() {
        algebraicText = $.trim($('.generativequestionform .algebraictext').val()); 
        return algebraicText
    }

    function getAnswerDisplayText() {
        answerDisplayText = $.trim($('.generativequestionform .answerdisplaytext').val()); 
        return answerDisplayText
    }

    function getInstanceRules() {
        var instanceRules = '';
        $('.generativequestionform .ruletext').each(function(index) {
                 var instanceRule = $.trim( $(this).val() );
                 if(instanceRule.length > 3) {
                     if(index) { 
                         instanceRules = instanceRules +';'+ instanceRule;
                     } else { 
                         instanceRules = instanceRule;
                     } 
                 }
        });
        return instanceRules
    }

    function checkOptionshasOneTick(parentClass) {
         option = $('.input_options .'+parentClass);
         hasOneTick = option.find('.iscorrect_checkbox').hasClass('selected');
         if(!hasOneTick) {
              option.find('.er_hasnotick').html('Please tick the correct option\'s checkbox');
              option.find('.er_hasnotick').css('display','block');
              isValid = false;
         } 
    } 
    
 
    function domReady() {
        $('.addquestionbtnwrap #add_this_question_btn').click(addThisQuestion_click);
        $('.addquestionbtnwrap #reset_btn').click(resetQuestionForm_click);
        $('.iscorrect_checkbox').click(selectCorrectAnswer_click); 
        $('.questiontypebox').click(chooseQuestionType_click);
        $('.difficultylevelbox').click(chooseDifficultyLevel_click);
        $('.questiontclassbtns div').click(chooseQuestionClass_click);
        $('.addrulebox').click(addRuleBox_click); 
        $('.removerulebox').click(removeRuleBox_click); 
    } 

    function clearErrorMessages() {
        $('.errorbox').empty(); 
        $('label[class="errorbox"]').css('display','none'); 
        $('.errorspan').empty().css('display','none'); 
    }

    function stripHtmlTags(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML =  html;
        var content = tmp.textContent||tmp.innerText;
        content = jQuery.trim(content); 
        return content
    }  
    
    $(document).ready(function(){
        domReady();
        $(".triggersignin").unbind('click');
        $("#deletequestion").unbind('click');
        $("#keepquestion").unbind('click');
        $(".triggersignin").click($.flxweb.showSigninDialog);
        $('#deletequestion').click(deleteQuestion_click);
        $('#keepquestion').click(keepQuestion_click);
        prepareHelpTips();
        $.flxweb.editor.tinymce.initQuestion('.declarativequestionform .questiontext');
        $.flxweb.editor.tinymce.initQuestion('.generativequestionform .questiontext');

        $.validator.addMethod("checkTrueFalseValid", function(value, element) {
           qTypeID = getQuestionType("declarative");
           option = $('.input_options .truefalseoptions');

           if( qTypeID == 2) {
               option.find('.errorspan').html(''); 
               return  option.find('.iscorrect_checkbox').hasClass('selected');
           }else {
               return true; 
           }   

        });

        $.validator.addMethod("checkInstanceRules", function(value, element) {
            isGood = false
            $('.generativequestionform .ruletext').each(function(index) {
                 var instanceRule = $.trim( $(this).val() );
                 if(instanceRule.length > 1) {
                    isGood = true;
                    return;
                 }
            });
            return isGood;
        });

        $.validator.addMethod("hasOneTick", function(value, element) {
            option = $('.input_options .multiplechoiceoptions');
            hasOneTick = option.find('.iscorrect_checkbox').hasClass('selected');
            return hasOneTick;
        });

  	$('.declarativequestionform ').validate({
             rules : {
                 declarativeQuestion : {
                     required : true,
                 },
                 declarativeOption_short : {
                     required : true 
                 },
                 declarativeOption_multiple_1 : {
                     required : true,
                 },
                 declarativeOption_multiple_2 : {
                     required : true,
                 },
                 declarativeOption_multiple_3 : {
                     required : true,
                 },
                 declarativeOption_multiple_4 : {
                     required : true,
                 },
                 declarativeOption_truefalse_1 : { 
                     checkTrueFalseValid: true
                 },  
                 declarativeOption_truefalse_2 : { 
                     checkTrueFalseValid: true
                 }  
             },
             messages : {
                 declarativeQuestion         : "Please write your question",
                 declarativeOption_short     : "Please write the answer",
                 declarativeOption_multiple_1: "Please enter the option 1",
                 declarativeOption_multiple_2: "Please enter the option 2",
                 declarativeOption_multiple_3: "Please enter the option 3",
                 declarativeOption_multiple_4: "Please enter the option 4",
                 declarativeOption_truefalse_1 : "Please tick the correct answer's checkbox", 
                 declarativeOption_truefalse_2 : "Please tick the correct answer's checkbox", 
             },
             ignore: ":hidden",
             errorPlacement: function(error, element) {
                 parentNode = $(element).parent().parent().parent()
                 if( parentNode.hasClass('truefalseoptions') ) {
                     parentNode.find('.errorspan').empty();
                     parentNode.find('.errorspan').append(error.html());
                     parentNode.find('.errorspan').css('display','block');
                 }else {
                     error.insertAfter(element);
                 }
                 return error 
             },
             errorClass:'errorbox'
        });

  	$('.generativequestionform ').validate({
             rules : {
                 generativeQuestion : {
                     required : true
                 },
                 algebraicText : {
                     required : true 
                 },
                 instanceRules_1 : {
                     checkInstanceRules : true
                 },
                 instanceRules_2 : {
                     checkInstanceRules : true
                 },
                 distractorAlgebraicText_multiple_1 : {
                     required : true
                 },
                 distractorAlgebraicText_multiple_2 : {
                     required : true
                 },
                 distractorAlgebraicText_multiple_3 : {
                     required : true
                 },
                 distractorAlgebraicText_multiple_4 : { 
                     required: true
                 },  
                 distractorAlgebraicText_short : { 
                     required: true
                 },  
             },
             messages : {
                 generativeQuestion : "Please write your question",
                 algebraicText: "Please write the algebraic equation",
                 instanceRules_1: "Please enter atleast one variable rule",   
                 instanceRules_2: "Please enter atleast one variable rule",   
                 distractorAlgebraicText_multiple_1: "Please write the algebraic equation",   
                 distractorAlgebraicText_multiple_2: "Please write the algebraic equation",   
                 distractorAlgebraicText_multiple_3: "Please write the algebraic equation",   
                 distractorAlgebraicText_multiple_4: "Please write the algebraic equation",   
                 distractorDisplayText_multiple_1: "Please write the option display text",   
                 distractorDisplayText_multiple_2: "Please write the option display text",   
                 distractorDisplayText_multiple_3: "Please write the option display text",   
                 distractorDisplayText_multiple_4: "Please write the option display text",   
                 distractorAlgebraicText_short: "Please write the algebraic equation",   
             },
             ignore: ":hidden",
              
             errorPlacement: function(error, element) {
                 if( $(element).hasClass('ruletext') ) {
                     errorbox = $('.input_rules').find('.er_rules');
                     errorbox.empty(); 
                     errorbox.append(error);
                     errorbox.css('display','block');
                     errorbox.removeClass('errorspan');
                     return error
                 }else if( $(element).parent().parent().parent().hasClass('distractorbox') && element.parent().hasClass('question_dist_eq') ) {

                     parentNode = $(element).parent().parent().parent()
                     if(parentNode.next().hasClass('errorbox')) {
                        parentNode.next().remove();
                        error.html('Please enter option fields');
                     }
                     error.insertAfter(parentNode);
                     return parentNode.next()

                 }else if( element.parent().hasClass('question_dist_text') ) {

                     parentNode = $(element).parent().parent().parent()
                     if(parentNode.next().hasClass('errorbox')) {
                         parentNode.next().remove();
                         error.html('Please enter option fields');
                     }
                     error.insertAfter(parentNode);
                     return parentNode.next()

                 }else if( element.parent().hasClass('input_algebraictext'))  {
                     error.insertAfter(element.next());
                 }else {
                     error.insertAfter(element);
                 }                  
             },
             errorClass:'errorbox'
        });

    });
   
})(jQuery);

jQuery.fn.exists = function(){return jQuery(this).length>0;}
