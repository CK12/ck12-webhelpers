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
define('flxweb.contribute.exercise',[
    'jquery','backbone','flxweb.global','flxweb.editor.tinymce', 'flxweb.exercise.common'
],


/*
Question Classes
Label: 'Static'
Actual class: 'declarative'

Label: 'Algorithmic'
Actual class: 'generative'

Label: 'Programatic/Advanced'
Actual class: 'generative' 
*/

function($, Backbone){

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
            isValid = $(".generativequestionform").valid(); 
        }else  {
            isValid = $(".algorithmicquestionform").valid();
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
            qClass = getQuestionClass();
            if(qTypeId == 3) {
                if(qClass == "declarative") {
                    $('.multiplechoiceoptions .iscorrect_checkbox').removeClass('selected');
                    $(this).addClass('selected');    
                    $('.multiplechoiceoptions .iscorrect_checkbox').attr('title','Wrong Answer');
                    $(this).attr('title','Correct Answer');
                }
                else if(qClass == "algorithmic") {
                    $('.multiplechoicedistractors .iscorrect_checkbox').removeClass('selected');
                    $(this).addClass('selected');    
                    $('.multiplechoicedistractors .iscorrect_checkbox').attr('title','Wrong Answer');
                    $(this).attr('title','Correct Answer');

                    //For the new generative questions
                    var form_name = "."+ qClass +"questionform"

                    $(form_name+ ' input:text[name=distractorAlgebraicText_multiple_1]').val('False');
                    $(form_name+ ' input:text[name=distractorAlgebraicText_multiple_2]').val('False');
                    $(form_name+ ' input:text[name=distractorAlgebraicText_multiple_3]').val('False');
                    $(form_name+ ' input:text[name=distractorAlgebraicText_multiple_4]').val('False');
                    selectedOption = $(this).children('.optionno').text();
                    selectedName = 'distractorAlgebraicText_multiple_' + selectedOption;
                    $(form_name+ ' input:text[name='+ selectedName +']').val('True');
                }  
                
            }else if(qTypeId == 2) {
               	$('.truefalseoptions .iscorrect_checkbox').removeClass('selected');
                $(this).addClass('selected');    
                $('.truefalseoptions .iscorrect_checkbox').attr('title','False Question');
                $(this).attr('title','True Question');
            }
            
        }
        //For the new generative questions
          
    }  

    function chooseQuestionClass_click() {
        if($(this).hasClass('selected') != true) {
            $('.questionclassbtn').removeClass('selected').addClass('secondary');
            $(this).addClass('selected').removeClass('secondary');
            qClass = $(this).attr('id');
            $('.createquestionform').css('display','none');
            $('.create_question_help').css('display', 'none');

            if(qClass == 'generative') {
                $('.generativeclasshelp').css('display','block');
                $('.generativequestionform').css('display','block'); 
            }else if(qClass == 'declarative') {
                $('.declarativeclasshelp').css('display','block');
                $('.declarativequestionform').css('display','block'); 
            }else if(qClass == 'algorithmic') {
                $('.algorithmicclasshelp').css('display','block'); 
                $('.algorithmicquestionform').css('display','block');
            }
            
            hideResult();
            clearErrorMessages();
        }
    }

    function chooseQuestionType_click() {
        if($(this).hasClass('selected') != true) {
            qClass = getQuestionClass()

            var form_classname = '.'+ qClass +'questionform'
            $(form_classname +' .questiontypebox').removeClass('selected');
            
            $(this).addClass('selected');

            if(qClass == 'declarative') {
                $(form_classname +' .optionsblock').removeClass('currentblock');
   	        qType = $(this).attr('id');
        	if(qType == 'multichoicetype') {
               		$(form_classname +' .input_options .multiplechoiceoptions').addClass('currentblock');
     	    	}else if(qType == 'truefalsetype') {
        	        $(form_classname +' .input_options .truefalseoptions').addClass('currentblock');
	    	}else if(qType == 'shortanswertype') {
        	        $(form_classname +' .input_options .shortanswer').addClass('currentblock');
    	    	}
            }else if(qClass == 'generative') {
                $(form_classname +' .distractorsblock').removeClass('currentblock');
   	        qType = $(this).attr('id');
        	if(qType == 'multichoicetype') {
                        $(form_classname +' .input_distractors').removeClass('nodistractorinput');
               		$(form_classname +' .input_distractors .multiplechoicedistractors').addClass('currentblock');
     	    	}else if(qType == 'truefalsetype') {
                        $(form_classname +' .input_distractors').removeClass('nodistractorinput');
        	        $(form_classname +' .input_distractors .truefalsedistractors').addClass('currentblock');
    	    	}else {
                        $(form_classname +' .input_distractors').addClass('nodistractorinput');
                }
            }else if(qClass == 'algorithmic') {
                $(form_classname +' .distractorsblock').removeClass('currentblock');
   	        qType = $(this).attr('id');
        	if(qType == 'multichoicetype') {
                        $(form_classname +' .input_distractors').removeClass('nodistractorinput');
               		$(form_classname +' .input_distractors .multiplechoicedistractors').addClass('currentblock');
     	    	}else if(qType == 'truefalsetype') {
                        $(form_classname +' .input_distractors').removeClass('nodistractorinput');
        	        $(form_classname +' .input_distractors .truefalsedistractors').addClass('currentblock');
    	    	}else {
                        $(form_classname +' .input_distractors').addClass('nodistractorinput');
                }
            } 
        }
    }  

    function resetQuestionType() {
        $('.questiontypebox').removeClass('selected');
        $('#shortanswertype.questiontypebox').addClass('selected');
        $('.optionsblock').removeClass('currentblock');
        $('.input_options .shortanswer').addClass('currentblock');
        $('.generativequestionform distractorsblock').removeClass('currentblock');
        $('.generativequestionform .input_distractors').addClass('nodistractorinput');
        $('.truefalseoptions .iscorrect_checkbox').removeClass('selected');
        $('.multiplechoiceoptions .iscorrect_checkbox').removeClass('selected');
        $('.multiplechoiceoptions .iscorrect_checkbox').attr('title','Wrong Answer');
        $('.multiplechoicedistractors .iscorrect_checkbox').removeClass('selected');
        $('.multiplechoicedistractors .iscorrect_checkbox').attr('title','Wrong Answer');
    }     

    function chooseDifficultyLevel_click() {
        if($(this).hasClass('selected') != true) {
            qClass = getQuestionClass()

            var form_classname = '.'+ qClass +'questionform'
            $(form_classname +' .difficultylevelbox').removeClass('selected');
            
            $(this).addClass('selected');
        }
    }   

    function resetDifficultyLevel() {
           $('.difficultylevelbox').removeClass('selected');
           $('#normal.difficultylevelbox').addClass('selected');
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
        if (qClass == 'algorithmic')
            qClass = 'generative'
        $('.previewquestionwrap').preview_question(qId, qClass, preview_success_callback, preview_failure_callback);
    }

    function preview_success_callback() {
        $('.previewquestion').click(previewQuestion_click);
        $('.createresultwrap').removeClass('hide');			
        $("#deletequestion").unbind('click');
        $("#keepquestion").unbind('click');
        $('#deletequestion').click(deleteQuestion_click);
        $('#keepquestion').click(keepQuestion_click);
    }

    function preview_failure_callback() {
        $('.previewquestion').click(previewQuestion_click);			
        $.flxweb.showDialog($('#js_preview_question_failed_message').html());		
        $('.createresultwrap').addClass('hide');			
    }

    function keepQuestion_click() {
        var qId = getQuestionId();
        if ( qId == null ) 
            return; 
        var qClass = getQuestionClass();
        if (qClass == 'algorithmic')
            qClass = 'generative'
             
        params = {}
        var preview_question_url = webroot_url + 'exercise/keep/question/'+qClass+'/'+qId+'/';
        $.ajax({
            url: preview_question_url,
            type: 'POST',
            data: params,
            success: function(result) {
                closeAcknowledge();
            },
            error: function(jqXHR,textStatus,errorThrown) {
                $('.addquestionmessage').html('');
                $('.keep-this-error-message.hide').removeClass('hide');
            }
        });
    }

    function deleteQuestion_click() {
        $('#deletequestion').unbind('click');			
        var qId = getQuestionId();
        var qClass = getQuestionClass();
        if (qClass == 'algorithmic')
            qClass = 'generative'
             
        params = {}
        params['question_id'] = getQuestionId();
        params['question_class'] = qClass;
        params['del_question'] = '';
        $.ajax({
                url: webroot_url + 'exercise/delete/question/'+getExerciseId(),
                type: 'POST',
                data: params,
                success: function(result) {
                     $('.createresultwrap').html($.flxweb.gettext("<br>Question deleted successfully"));
                     removePreview();
                     $('#deletequestion').click(deleteQuestion_click);			
                },
                error: function(jqXHR,textStatus,errorThrown) {
                    $('#deletequestion').click(deleteQuestion_click);			
                    $.flxweb.showDialog($('#js_delete_question_failed_message').html());		
                }
             });
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

    function prepareHelpTips() {
        tooltip_options = {
             position: {
                  at: "right center",
                  my: "left center",
                  adjust: {
                      y: -5,	
                      x: 5,	
                  }
             },
             style: {
                 tip: {
                     width: 14,
                     height: 8
                 },
                 classes: "ui-tooltip-light ui-tooltip-question",
             },
	     show: {
                 delay: 10,
                 solo: true,
                 ready: false,
                 event: "click"
             },
             hide: {
                 event: "unfocus"
             },
        }
        $("#dec-question-help").qtip(         $.extend(tooltip_options,{ content: $('#dec-question-tooltip').html()          }));
        $("#dec-options-help").qtip(          $.extend(tooltip_options,{ content: $('#dec-options-tooltip').html()           }));
        $("#dec-question-help").qtip(         $.extend(tooltip_options,{ content: $('#dec-question-tooltip').html()          }));
        $("#gen-question-help").qtip(         $.extend(tooltip_options,{ content: $('#gen-question-tooltip').html()          }));
        $("#gen-algebraictext-help").qtip(    $.extend(tooltip_options,{ content: $('#gen-algebraictext-tooltip').html()     }));
        $("#gen-answerdisplaytext-help").qtip($.extend(tooltip_options,{ content: $('#gen-answerdisplaytext-tooltip').html() }));
        $("#gen-inputrules-help").qtip(       $.extend(tooltip_options,{ content: $('#gen-inputrules-tooltip').html()        }));
        $("#gen-distractors-help").qtip(      $.extend(tooltip_options,{ content: $('#gen-distractors-tooltip').html()       }));
        $("#alg-question-help").qtip(         $.extend(tooltip_options,{ content: $('#alg-question-tooltip').html()          }));
        $("#alg-inputrules-help").qtip(       $.extend(tooltip_options,{ content: $('#alg-inputrules-tooltip').html()        }));

        $("#e2n-help").qtip(   $.extend(tooltip_options,{ content: $('#e2n-tooltip').html()   }));
        $("#n2e-help").qtip(   $.extend(tooltip_options,{ content: $('#n2e-tooltip').html()   }));
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

    //FIXME: EZ working on
    function getQuestionForm() {
        formdata = {}
        var qClass = getQuestionClass();
        var qTypeId = getQuestionType(qClass);
        if (qClass == 'algorithmic')
            formdata['question_class'] = 'generative'
        else 
            formdata['question_class'] = qClass;
            
        formdata['questiontype_id'] = qTypeId;
        formdata['exercise_handle'] = getExerciseHandle();
        formdata['difficulty_level'] = getDifficultyLevel(qClass);
        if(qClass == 'declarative') {
             formdata['display_text'] = getQuestionStem(qClass);
             formdata['question_options'] = getQuestionOptions(qTypeId);
        }else if(qClass == 'generative' || qClass == 'algorithmic') {
             formdata['display_text'] = getQuestionStem(qClass);
             formdata['algebraic_text'] = getAlgebraicText();
             formdata['instance_rules'] = getInstanceRules();
             formdata['answer_display_text'] = getAnswerDisplayText(qClass);
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
        hideResult();
        resetDifficultyLevel();
        resetQuestionType();
        clearErrorMessages(); 
        
        //clear MyVars, render correctly
        for (varID = 0; varID < MyVars.models.length; varID ++) {
            var badVar = MyVars.models[parseInt(varID)];
            MyVars.remove(badVar);
            badVar.destroy();
        }
        $('#generative_variables').html("<p><em>There are no variables currently available.</em></p>");


    }    
    
    //need to refactor
    function getQuestionStem(qClass) {
        if (qClass == 'declarative')  {
             question = $.trim($('.declarativequestionform .questiontext').val());
             stripedQuestion = checkForImage(question); 
             if (!(stripedQuestion.length > 0))  {
                isValid = false;  
                $('.declarativequestionform #er_invalid_question').html("<span class='imgwrap'></span>Please write your question text");
                $('.declarativequestionform #er_invalid_question').css('display','block');
                return;
             }     
        } else if (qClass == 'generative') {
             question = $.trim($('.generativequestionform .questiontext').val());
             stripedQuestion = checkForImage(question); 
             if (!(stripedQuestion.length > 0))  {
                isValid = false;  
                $('.generativequestionform #er_invalid_question').html("<span class='imgwrap'></span>Please write your question text");
                $('.generativequestionform #er_invalid_question').css('display','block');
                return;
             }     
        } else if (qClass == 'algorithmic') {
             question = $.trim($('.algorithmicquestionform .questiontext').val());
             stripedQuestion = checkForImage(question); 
             if (!(stripedQuestion.length > 0))  {
                isValid = false;  
                $('.algorithmicquestionform #er_invalid_question').html("<span class='imgwrap'></span>Please write your question text");
                $('.algorithmicquestionform #er_invalid_question').css('display','block');
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

    function getQuestionFormClass() {
        var qClass = getQuestionClass();
        return '.'+qClass+'questionform';
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

        //for 02/21 release, we are only supporting multiple choice for algorithmic questions
        if (qClass == 'algorithmic')
            return 3
            
            
        var form_name = "."+ qClass +"questionform"
        var qType = $(form_name +" .input_questiontype").find('.selected').attr('id');
        
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

        var form_name = "."+ qClass +"questionform"
        var qType = $(form_name +' .input_difficultylevel').find('.selected').attr('id');

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
             checkOptionshasOneTick('.input_options .multiplechoiceoptions');  
             checkDuplicateOptions(options, '.input_options .multiplechoiceoptions');  
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
        qClass = getQuestionClass();
        distractors = []
        selected = []
        if(qTypeId == 1)  {
             return distractors;
        }else if(qTypeId == 2) {  
             distractors.push( getDistractor('truefalsedistractors', 1) ); 
        }else if(qTypeId == 3) {
             dCount = 3;
             if(qClass == 'algorithmic') {
                 checkOptionshasOneTick('.input_distractors .multiplechoicedistractors');  
                 dCount = 4;
             }
             for (var i = 1; i <= dCount; i++) {
                 if (!$('#distractor'+ i +' .iscorrect_checkbox').hasClass('selected')) 
                     distractors.push( getDistractor('multiplechoicedistractors', i) ); 
                 else 
                     selected.push( getDistractor('multiplechoicedistractors', i) ); 
             }
             if(qClass == 'algorithmic') {
                 checkDuplicateOptions(selected.concat(distractors), '.input_distractors .multiplechoicedistractors');  
             }
        }
        return distractors  
    }

    function getDistractor(parentClass , distractor_no) {
        qFormClass = getQuestionFormClass();
        distractorbox = 'distractor' + distractor_no;    
        distractor = $(qFormClass + ' .input_distractors .'+parentClass+' #'+distractorbox);
        algebraicText = $.trim( distractor.find('.distractor_eq').val() );

        if(parentClass == 'multiplechoicedistractors') { 
            displayText = $.trim( distractor.find('.distractor_text').val() );
        }else {
            displayText=''; 
        } 
        distractor = {}
        distractor['displayText'] = displayText;
        distractor['algebraicText'] = algebraicText;
        return distractor 
    }

    function getAlgebraicText() {
        var qClass = getQuestionClass();
        if (qClass == 'generative'){
            algebraicText = $.trim($('.generativequestionform .algebraictext').val()); 
            return algebraicText
        } else {
            return 'True'
        }
    }

    function getAnswerDisplayText(qClass) {
        if(qClass == 'generative') {
            return $.trim($('.generativequestionform .answerdisplaytext').val()); 
        }else if(qClass == 'algorithmic') {
            selectedOption = $('.selected.iscorrect_checkbox').filter(':visible').children('.optionno').text();
            selectedName="distractorDisplayText_multiple_"+selectedOption;
            answerDisplayText = $('input:text[name='+ selectedName +']').val();
            return answerDisplayText
        }
    }

    function getInstanceRules() {
        var instanceRules = '';
        var qClass = getQuestionClass();
        if (qClass == 'generative') {
            $('.generativequestionform .ruletext').each(function(index) {
                     var instanceRule = $.trim( $(this).val() );
                     if(instanceRule.length >= 1) {
                         if(instanceRules.length > 1) { 
                             instanceRules = instanceRules +';'+ instanceRule;
                         } else {
                             instanceRules = instanceRule;
                         } 
                     }
            });
        } else {
            instanceRules = MyVars.getRules();
            if(instanceRules.length == 0) {
	        $('#er_variables').html("<span class='imgwrap'></span> Please add at least one variable");
                $('#er_variables').css('display','block');
                isValid = false;
            } else {
		$('#er_variables').empty();
            }  
        }
        return instanceRules
    }

    $('.generativequestionform .ruletext').live('blur', validateNumberFormat);
    $('input:text[name=variable_value_input]').live('blur', validateNumberFormat);
    $('input:text[name=variable_list_input]').live('blur', validateNumberFormat);
    $('input:text[name=variable_from_input]').live('blur', validateNumberFormat);
    $('input:text[name=variable_to_input]').live('blur', validateNumberFormat);
    $('input:text[name=var_rule]').live('blur', validateNumberFormat);
    $('.generativequestionform .distractor_eq, .algorithmicquestionform .distractor_eq').live('blur', validateNumberFormat);
    $('.generativequestionform .distractor_text, .algorithmicquestionform .distractor_text').live('blur', validateNumberFormat);

    function validateNumberFormat() {
        var isValid = checkForOctalHexaNumbers(this);
        var self = this;
        if(isValid){
            resp = confirm("You have Octal / Hexadecimal number for this option, this will be converted to Decimal. Click 'OK' to continue or 'Cancel' to change the value.")
            if (!resp){
                setTimeout(function() { self.focus(); }, 10);
            }
        }
    }

    function checkForOctalHexaNumbers(obj){
        var ruleVal = $(obj).val();
        var self = obj;
        if(ruleVal.indexOf("[") != -1){
            ruleVal = $.trim(ruleVal.substr(ruleVal.lastIndexOf("[")+1,ruleVal.indexOf("]")-ruleVal.lastIndexOf("[")-1));
        }else if(ruleVal.indexOf("(") != -1){
            ruleVal = $.trim(ruleVal.substr(ruleVal.lastIndexOf("(")+1,ruleVal.indexOf(")")-ruleVal.lastIndexOf("(")-1));
        }else if(ruleVal.indexOf(":") != -1){
            ruleVal = $.trim(ruleVal.substr(ruleVal.indexOf(":")+1));
        }else if(ruleVal.indexOf("=") != -1){
            ruleVal = $.trim(ruleVal.substr(ruleVal.indexOf("=")+1));
        }
        vals = ruleVal.split(",");
        var numFormatRegex = /^[-+]?0[0-9A-Z]*$/i;
        var octRegex = /^[-+]?0[0-7]*$/i;
        var hexRegex = /^[-+]?0x[0-9A-F]*$/i;
        var isValid = '';
        for(cnt=0;cnt<vals.length;cnt++){
            if(numFormatRegex.test($.trim(vals[cnt])) && $.trim(vals[cnt])!=0){
                var numFormat = '';
                var isValidFormat = false;
                if(octRegex.test($.trim(vals[cnt])) || hexRegex.test($.trim(vals[cnt]))){
                    isValidFormat = true;
                }

                if(isValidFormat){
                    isValid = true;
                    break;
                }else{
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    }

    function checkOptionshasOneTick(selector) {
         option = $(selector);
         hasOneTick = option.find('.iscorrect_checkbox').hasClass('selected');
         if(!hasOneTick) {
              option.find('.er_hasnotick').html('<span class="imgwrap"></span>Please tick the correct option\'s checkbox');
              option.find('.er_hasnotick').css('display','block');
              isValid = false;
         } 
    } 
    
    function checkDuplicateOptions(options, selector) {
         option = $(selector);
         if(checkForDuplicates(options, 'displayText')) {
              option.find('.er_noduplicateoption').html('<span class="imgwrap"></span>Options must not be same');
              option.find('.er_noduplicateoption').css('display','block');
              isValid = false;
         } 
    } 

    function checkForDuplicates(arr, key) {
         var i,
         len=arr.length,
         obj=[];
         for (i=0;i<len;i++) {
             var value = arr[i][key];
             if(value && value.length > 0) {
                 if (obj.indexOf(value) == -1) { 
                     obj.push(value);
                 } else {
                     return true;  
                 }  
             } 
         }
         return false;  
    }
 
    function domReady() {
        //Adding indexOf method to Array for IE <= 8
        if (!Array.prototype.indexOf)
        {
          Array.prototype.indexOf = function(elt /*, from*/)
          {
            var len = this.length >>> 0;

            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                 ? Math.ceil(from)
                 : Math.floor(from);
            if (from < 0)
              from += len;

            for (; from < len; from++)
            {
              if (from in this &&
                  this[from] === elt)
                return from;
            }
            return -1;
          };
        }
        $('.addquestionbtnwrap #add_this_question_btn').click(addThisQuestion_click);
        $('.addquestionbtnwrap #reset_btn').click(resetQuestionForm_click);
        $('.iscorrect_checkbox').click(selectCorrectAnswer_click); 
        $('.questiontypebox').click(chooseQuestionType_click);
        $('.difficultylevelbox').click(chooseDifficultyLevel_click);
        $('.questiontclassbtns div').click(chooseQuestionClass_click);
        $('.addrulebox').click(addRuleBox_click); 
        $('.removerulebox').click(removeRuleBox_click); 
        $('.addvariable').click(addVariable_click);
        $('.editvariable').click(editVariable_click); 
        $('.removevariable').click(removeVariable_click);


        //NOTE: Setting height to dialog is not working well in cross-browsers,
        //So, set the height in quiz wrapper as css
        var_dlg = $.flxweb.createDialog($('#js_dialog_variable_editor'),{
                width:'720px',
                'dialogClass' : 'js_ck12_dialog_common variablebox notitle',
                'close': onVarDialogClose,
                'beforeClose':onBeforeVarDialogClose,
            });
        var_dlg.bind('flxweb.dialog.open', onVarDialogOpen);
        var_dlg.bind('flxweb.dialog.close', onVarDialogClose);

        $.extend(true, $.flxweb, {
            'exercise':{
                'varDialog': var_dlg
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
    
    
    
/*****
VARIABLE EDITOR DIALOG
*****/

    /**** Backbone models *****/
    QuestionVariable = Backbone.Model.extend ({
    }); 
    QuestionVariables = Backbone.Collection.extend ({
        model: QuestionVariable,
        getRules: function() {
            var instanceRules = '';
            for (i = 0; i < this.models.length; i++) {
                var variable = MyVars.models[i];
                var name = variable.get("name");
                var type = variable.get("type");
                
                
                if (type == 'constant') {
                    instanceRules += name +"="+ variable.get("constant_val") +";";
                } else if (type == 'random') {
                    var random_type = variable.get("random_type");
                    if (random_type == 'list') {
                        instanceRules += name +"=choice(["+ variable.get("random_list") +"]);";
                    } else {
                        instanceRules += name +"=choice(range("+ variable.get("random_from") +", "+ variable.get("random_to") +"+1, "+ variable.get("random_step") +"));";
                    }
                } else {
                    instanceRules += name +"="+ variable.get("rules") +";";
                }
            }
            return instanceRules
        }
    });
    MyVars = new QuestionVariables();

    function addVariable_click() {
        resetVarDialog(); 
        $.flxweb.exercise.varDialog.open();
    }

    function editVariable_click() {
        var varID = $(this).attr("id").replace("editrulebox","");
        var editVar = MyVars.models[parseInt(varID)];
        var random_type = '';

        resetVarDialog();
        $('.var_edit_pane').addClass("hide");

        $('input:text[name=variable_name_input]').val(editVar.get("name"));
        type = editVar.get("type");
        $('input:radio[value='+ type +']').attr('checked', true);
        
        if (type == 'constant') {
            
            $("#variable_constant_pane").removeClass("hide");
            $('input:text[name=variable_value_input]').val(editVar.get("constant_val"));
            
        } else if (type == 'random') {
            $('#variable_random_pane').removeClass("hide");
            random_type = editVar.get("random_type");
            $('input:radio[value='+ random_type +']').attr('checked', true);
            
            $('.var_random_builder_pane').addClass('hide');
            if (random_type == 'list') {
                $('#random_list_pane').removeClass('hide');
                $('input:text[name=variable_list_input]').val(editVar.get("random_list"));
            } else {
                $('#random_range_pane').removeClass('hide');
                $('input:text[name=variable_from_input]').val(editVar.get("random_from"));
                $('input:text[name=variable_to_input]').val(editVar.get("random_to"));
                $('input:text[name=variable_interval_input]').val(editVar.get("random_step"));
            }
        } else {
            
            $('#variable_rule_pane').removeClass("hide");
            $('input:text[name=var_rule]').val(editVar.get("rules"));
            
        }

        $('.var_submitbtn').text('Update');
        $('input:hidden[name=var_dialog_mode]').val('edit');
        $('input:hidden[name=var_edited]').val(varID);
        $.flxweb.exercise.varDialog.open();
    }

    function removeVariable_click() {

       var varID = $(this).attr("id").replace("removerulebox","");
       var badVar = MyVars.models[parseInt(varID)];
       MyVars.remove(badVar);
       badVar.destroy();
       renderVariables();

        var qClass = getQuestionClass();
        var form_name = "."+ qClass +"questionform"
 
       if($(form_name +' .rulebox').length == 0 )
           $('#generative_variables').html("<p><em>There are no variables currently available.</em></p>");
       
    }
    
    //resets the Variable Generator Dialog to it's original/default setting
    function resetVarDialog() {    
        $('input:text[name=variable_name_input]').val('');
        $('.var_type_radio').attr('checked', false);
        $('.var_type_radio').first().attr('checked', true);
        $('.var_edit_pane').addClass('hide');
        $('.var_edit_pane').first().removeClass('hide');
        $('input:text[name=variable_value_input]').val('');
        $('.var_random_type_radio').attr('checked', false);
        $('.var_random_type_radio').first().attr('checked', true);
        $('.var_random_builder_pane').addClass('hide');
        $('.var_random_builder_pane').first().removeClass('hide');
        $('input:text[name=variable_list_input]').val('');
        $('input:text[name=variable_from_input]').val('');
        $('input:text[name=variable_to_input]').val('');
        $('input:text[name=variable_interval_input]').val('1');
        $('input:text[name=var_rule]').val('');
        $('.var_submitbtn').text('Create');
        //hidden objects
        $('input:hidden[name=var_dialog_mode]').val('create');
        $('.var_dialog_error').addClass('hide');
        
    }

    function onVarDialogOpen() {
        //During edit mode, need to read values from dom/bbone
    }

    function onVarDialogClose() {
        //Process variable, and store to DOM/bbone 
        //processVarDialog();
    }

    function onBeforeVarDialogClose() {
        //Validations
    }

    //Handles submit event on the variable dialog
    function processVarDialog(){

        if (validateVarDialog()) {
            var name = $.trim($('input:text[name=variable_name_input]').val());
            var type = $('input:radio[name=var_type]:checked').val();
            var constant_val = $.trim($('input:text[name=variable_value_input]').val());
            constant_val = constant_val.split(',').join('');
            var random_type = $('input:radio[name="random_type"]:checked').val();
            var random_list = $.trim($('input:text[name=variable_list_input]').val()); 
            var random_from = $.trim($('input:text[name=variable_from_input]').val());
            var random_to = $.trim($('input:text[name=variable_to_input]').val());
            var random_step = $.trim($('input:text[name=variable_interval_input]').val());
            var rules = $.trim($('input:text[name=var_rule]').val());
            
            if ($('input:hidden[name=var_dialog_mode]').val() == 'edit') {
                var varID = $('input:hidden[name=var_edited]').val()
                var editVar = MyVars.models[parseInt(varID)];

                editVar.set ({
                    "name": name,
                    "type": type,
                    "constant_val": constant_val,
                    "random_type": random_type,
                    "random_list": random_list,
                    "random_from": random_from,
                    "random_to": random_to, 
                    "random_step": random_step,
                    "rules": rules
                });

            } else {
            
                //Create the backbone model, push to collection
                var myvar = new QuestionVariable ({
                    name: name,
                    type: type,
                    constant_val: constant_val,
                    random_type: random_type,
                    random_list: random_list,
                    random_from: random_from,
                    random_to: random_to, 
                    random_step: random_step,
                    rules: rules
                });
                
                MyVars.add(myvar);
            }
            
            renderVariables();
            $.flxweb.exercise.varDialog.close();
        }

    }
    
    
    function renderVariables() {
        var varText = '';
        var random_type ='';
        
        for (i = 0; i < MyVars.models.length; i++) {
            variable = MyVars.models[i];
            type = variable.get("type");
            if (type == 'rule') 
                type = 'rule based'
           
            
            varText += "<li class='rulebox'> \
                            <span>A <em>"+ type +"</em> variable: <strong>"+ variable.get("name") +"</strong>";
                            
            if (type == 'constant') {
                varText += ", which has a value of "+ variable.get("constant_val");
            } else if (type == 'random') {
                random_type = variable.get("random_type");
                if (random_type == 'list') {
                    varText += ", which is chosen from the list  "+ variable.get("random_list");
                } else {
                    varText += ", which is between "+ variable.get("random_from") +" and "+ variable.get("random_to") +" with an interval of "+ variable.get("random_step") 
                }
            } else {
                varText += ", which has an arithmetic expression of "+ variable.get("rules");
            }
            
            
            varText += "    </span> \
                            <span class='addremoverule editvariable' id='editrulebox"+ i +"' title='edit this rule box'>Edit</span> \
                            <span class='addremoverule removevariable' id='removerulebox"+ i +"' title='remove this rule box'>x</span> \
                        </li>";
        }
        
        $('#generative_variables').html('<ul>'+ varText +'</ul>');
        $('.editvariable').click(editVariable_click); 
        $('.removevariable').click(removeVariable_click); 
        
    }
    
    function varDialog_selectType() {
         $('.var_edit_pane').addClass('hide');
         type = $(this).val();
         $('#variable_'+ type +'_pane').removeClass('hide');
    }

    function varDialog_selectRandomType() {
         $('.var_random_builder_pane').addClass('hide');
         type = $(this).val();
         $('#random_'+ type +'_pane').removeClass('hide');
    }


/* var dialog validations */

    function validateVarDialog() {
        $('.var_dialog_error').addClass('hide');
        
        
        var varname = $.trim($('input:text[name=variable_name_input]').val());
        if (!validateVarName(varname)) 
            return false;

        var type = $('input:radio[name=var_type]:checked').val();
        if (type == 'constant') {
            var constantvalVar = $('input:text[name=variable_value_input]');
            if (!validateVarConstant(constantvalVar)) { 
                return false;
            }
                
        } else if (type == 'random') {
            var random_type = $('input:radio[name="random_type"]:checked').val();
            if (random_type == 'list') {
                var randomlistVar = $('input:text[name=variable_list_input]');
                if (!validateVarRandomList(randomlistVar)) { 
                    return false;
                } 
            } else {
                
                var randomfromVar = $('input:text[name=variable_from_input]');
                var randomtoVar = $('input:text[name=variable_to_input]');
                var randomstepVar = $('input:text[name=variable_interval_input]');
                
                if (!validateVarRandomRange(randomfromVar, randomtoVar, randomstepVar)) 
                    return false;
            }
        } else {
            var rulesVar = $('input:text[name=var_rule]');
            if (!validateVarRules(rulesVar))
                return false;
        }
        
        return true;
    }
    
    function validateVarName(name) {
        //Case 1, must be a valid name
        var reg = /^[a-z,A-Z,_]\w*$/;
        if (!reg.test(name)){
            $('#var_dialog_name_error').html("Variable name must begin with a letter or an underscore, and it may not contain white space and punctuation.");
            $('#var_dialog_name_error').removeClass('hide');
            return false;
        }
        
        //Case 2, must be a new name during add mode
        if ($('input:hidden[name=var_dialog_mode]').val() != 'edit') {
            var exist = MyVars.where({name: name});
            if(exist.length > 0) {
                $('#var_dialog_name_error').html("Variable '"+name+"' has already been defined. Please choose a different name.");
                $('#var_dialog_name_error').removeClass('hide');
                return false;
            } 
        }

        return true;
    }

    function validateVarConstant(constantvalVar) {
        //we only support number for now
        constant_val = $(constantvalVar).val();
        constant_val = constant_val.split(',').join('');
        var numberFormatRegex = /^[-+]?0[0-9A-Z]*$/i;
        if($.trim(constant_val).length == 0) {
            emessage = 'Please enter the value';  
            $('#var_dialog_constant_error').html(emessage);
            $('#var_dialog_constant_error').removeClass('hide');
            return false;
        } else if(!$.validator.methods.validateNumberFormat.call(this, constant_val, constantvalVar)) {
            emessage = $.invalidNumberFormatErrorMessage;  
            $('#var_dialog_constant_error').html(emessage);
            $('#var_dialog_constant_error').removeClass('hide');
            return false;
        } else if (!numberFormatRegex.test($.trim(constant_val)) && !mathEval(constant_val)) {
            $('#var_dialog_constant_error').html("Constant value must be a valid number or valid arithmetic expression with numbers and basic arithmetic operators only.");
            $('#var_dialog_constant_error').removeClass('hide');
            return false;
        } 
        return true;
    }

    function validateOctalHexaNumbers(val){
        var hexRegex = /^[-+]?0x[0-9A-F]*$/i;
        var octRegex = /^[-+]?0[0-7]*$/i;
        valid = false;
        if(hexRegex.test(val)){
            valid = true;
        }else if(octRegex.test(val)){
            valid = true;
        }else{
            valid = false;
        }
        return valid;
    }

    //Validates against mathematical expression
    function mathEval (exp) {
        var reg = /(?:[a-z$_][a-z0-9$_]*)|(?:[;={}\[\]"'!&<>^\\?:])/ig,
            valid = true;
           
        // Detect valid JS identifier names and replace them
        exp = exp.replace(reg, function ($0) {
            // If the name is a direct member of Math, then invalidate the expression
            valid = false;
        });
        
        // Don't eval if our replace function flagged as invalid
        if (!valid)
            return false;
        else
            try { return eval(exp); } catch (e) { return false; };
    }

    function validateVarRandomList(randomlistVar) {
        random_list = $(randomlistVar).val();
        if($.trim(random_list).length == 0) {
            emessage = 'Please enter the list values';  
            $('#var_dialog_random_list_error').html(emessage);
            $('#var_dialog_random_list_error').removeClass('hide');
            return false;
        // Allowed literals are 0-9, a-z, space, doublequote, singlequote, comma 
        }else if(!$.validator.methods.validateNumberFormat.call(this, random_list, randomlistVar)) {
            emessage = $.invalidNumberFormatErrorMessage;  
            $('#var_dialog_random_list_error').html(emessage);
            $('#var_dialog_random_list_error').removeClass('hide');
            return false;
        }else {
            list = random_list.split(',');
            for (var i = 0; i < list.length; i++) {
               value = list[i]; 
               if(/[^0-9a-z\s"'_]/i.test(value)) {
                   emessage = "The value: "+value+" is not a valid literal. Allowed values are numbers and strings."
                   $('#var_dialog_random_list_error').html(emessage);
                   $('#var_dialog_random_list_error').removeClass('hide');
                   return false;
               }
            }  
        }
        return true;
    }
    
    function validateVarRandomRange(randomfromVar, randomtoVar, randomstepVar) {
        var isvalid = true;
        from = $(randomfromVar).val();
        to = $(randomtoVar).val();
        step = $(randomstepVar).val();
        missingMessage = 'This field is required.';  
        if($.trim(from).length == 0) {
            $('#var_dialog_random_from_error').html(missingMessage);
            $('#var_dialog_random_from_error').removeClass('hide');
            isvalid = false;
        }else if(!$.validator.methods.validateNumberFormat.call(this, from, randomfromVar)) {
            emessage = $.invalidNumberFormatErrorMessage;  
            $('#var_dialog_random_from_error').html(emessage);
            $('#var_dialog_random_from_error').removeClass('hide');
            return false;
        }

        if($.trim(to).length == 0) {
            $('#var_dialog_random_to_error').html(missingMessage);
            $('#var_dialog_random_to_error').removeClass('hide');
            isvalid = false;
        }else if(!$.validator.methods.validateNumberFormat.call(this, to, randomtoVar)) {
            emessage = $.invalidNumberFormatErrorMessage;  
            $('#var_dialog_random_to_error').html(emessage);
            $('#var_dialog_random_to_error').removeClass('hide');
            return false;
        }

        if($.trim(step).length == 0) {
            $('#var_dialog_random_interval_error').html(missingMessage);
            $('#var_dialog_random_interval_error').removeClass('hide');
            isvalid = false;
        }else if(!$.validator.methods.validateNumberFormat.call(this, step, randomstepVar)) {
            emessage = $.invalidNumberFormatErrorMessage;  
            $('#var_dialog_random_interval_error').html(emessage);
            $('#var_dialog_random_interval_error').removeClass('hide');
            return false;
        }

        //case 1, all must be numbers
        if (isNaN(from)) {
            $('#var_dialog_random_from_error').html("Starting value must be a valid number.");
            $('#var_dialog_random_from_error').removeClass('hide');
            isvalid = false;
        }
        if (isNaN(to)) {
            $('#var_dialog_random_to_error').html("Ending value must be a valid number.");
            $('#var_dialog_random_to_error').removeClass('hide');
            isvalid = false;
        }
        if (isNaN(step)) {
            $('#var_dialog_random_interval_error').html("Interval value must be a valid number.");
            $('#var_dialog_random_interval_error').removeClass('hide');
            isvalid = false;
        } else {
            var interval = parseInt($.trim(step),10);
            if(!interval || interval <= 0)  {
                $('#var_dialog_random_interval_error').html("Interval value must be greater than zero.");
                $('#var_dialog_random_interval_error').removeClass('hide');
                isvalid = false;
            }  
        }  
        
        //case 2, from > to
        if (parseFloat(from) >= parseFloat(to)) {
            $('#var_dialog_random_to_error').html('Ending value must be larger than starting value.');
            $('#var_dialog_random_to_error').removeClass('hide');
            isvalid = false;
        }
        
        return isvalid;
    }
    
    function validateVarRules(rulesVar) {
        //Allowed literals: 0-9, a-z, spaces
        // Allowed operators: (,),+,-,*,/,%
        var rules = $(rulesVar).val();
        allowedOperators = ['(',')','%','/','*','+','-']
        if($.trim(rules).length == 0) {
            emessage = 'Please enter an arithmetic expression.';  
            $('#var_dialog_rule_error').html(emessage);
            $('#var_dialog_rule_error').removeClass('hide');
            return false;
        }else if(!$.validator.methods.validateNumberFormat.call(this, rules, rulesVar)) {
            emessage = $.invalidNumberFormatErrorMessage;  
            $('#var_dialog_rule_error').html(emessage);
            $('#var_dialog_rule_error').removeClass('hide');
            return false;
        }else if(/[^0-9a-z\s()%*\/+-]/i.test(rules)) {
            operators = rules.match(/[^a-z\d\s]/i); 
            validOp = true;
            for(op in operators) {
                if ($.inArray(op, allowedOperators) == -1) {
                    validOp = false;
                    break;           
                }
            } 
            if(!validOp) 
                 emessage = 'The allowed operators are '+ allowedOperators.join(' , ')  +'.'
            else
                 emessage = 'Invalid arithmetic expression.'  
 
            $('#var_dialog_rule_error').html(emessage);
            $('#var_dialog_rule_error').removeClass('hide');
            return false;
        }
        return true;
    }

    function flashVarError(selector){
        setInterval('toggleColor('+ selector +', "' + blinkColor + '")', 400);
        setTimeout('stopBlinking("' + id + '")', blinkTime);
    }


/****
UTILS
****/

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
    
    function checkForImage(html) {
        if(jQuery(html).find("img").length){
            return html;
        } else {
            return stripHtmlTags(html);
        }
    }
    
    function toggleDetailHelp_click(){
        var qClass = getQuestionClass();
        var questionForm = "."+ qClass +"classhelp"
        
        if ($(questionForm +" .question_type_detail_help").hasClass('hide')) {
            $(questionForm +" .question_type_detail_help").removeClass('hide');
            $(questionForm +" .toggle_detail_help").html("<a>hide details</a>");
        } else {
            $(questionForm +" .question_type_detail_help").addClass('hide');
            $(questionForm +" .toggle_detail_help").html("<a>show details</a>");
        }
    }
    
    $(document).ready(function(){
        domReady();
        $(".triggersignin").unbind('click');
        $("#deletequestion").unbind('click');
        $("#keepquestion").unbind('click');
        $(".triggersignin").click($.flxweb.showSigninDialog);
        $('#deletequestion').click(deleteQuestion_click);
        $('#keepquestion').click(keepQuestion_click);
        $('.var_type_radio').click(varDialog_selectType);
        $('.var_random_type_radio').click(varDialog_selectRandomType);
        $('.var_submitbtn').click(processVarDialog);
        $('.toggle_detail_help').click(toggleDetailHelp_click);
        prepareHelpTips();
        $.flxweb.editor.tinymce.initQuestion('.declarativequestionform .questiontext');
        $.flxweb.editor.tinymce.initQuestion('.algorithmicquestionform .questiontext');
        $.flxweb.editor.tinymce.initQuestion('.generativequestionform .questiontext');

        $.invalidNumberFormatErrorMessage = "<span class='imgwrap'></span>You have invalid Octal / Hexadecimal number for this option. Please refer Guidelines from show details and enter valid number.";
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

        $.validator.addMethod("validateNumberFormat", function(value, element) {
            isGood = checkForOctalHexaNumbers(element);
            if(typeof(eval(isGood)) == 'undefined'){
                return true;
            }else{ 
                return isGood; 
            }
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
                 declarativeQuestion         : "<span class='imgwrap'></span>Please write your question text",
                 declarativeOption_short     : "<span class='imgwrap'></span>Please write the answer",
                 declarativeOption_multiple_1: "<span class='imgwrap'></span>Please write the option",
                 declarativeOption_multiple_2: "<span class='imgwrap'></span>Please write the option",
                 declarativeOption_multiple_3: "<span class='imgwrap'></span>Please write the option",
                 declarativeOption_multiple_4: "<span class='imgwrap'></span>Please write the option",
                 declarativeOption_truefalse_1 : "<span class='imgwrap'></span>Please tick the correct answer's checkbox", 
                 declarativeOption_truefalse_2 : "<span class='imgwrap'></span>Please tick the correct answer's checkbox", 
             },
             ignore: ":hidden",
             errorPlacement: function(error, element) {
                 if( $(element).hasClass('tfoptiontext')) {
                     parentNode = $(element).closest('.truefalseoptions');
                     if( parentNode && parentNode.length > 0) {
                         parentNode = $(parentNode[0]);
                         parentNode.find('.errorspan').empty();
                         parentNode.find('.errorspan').append(error.html());
                         parentNode.find('.errorspan').css('display','block');
                     }
                 }else if( $(element).hasClass('optiontext')) {
                     parentNode = $(element).parent().parent();
                     errorbox = parentNode.next().children('td').eq(1);
                     errorbox.append(error); 
                     return errorbox
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
                     checkInstanceRules : true,
                     validateNumberFormat : true
                 },
                 instanceRules_2 : {
                     checkInstanceRules : true,
                     validateNumberFormat : true
                 },
                 distractorAlgebraicText_multiple_1 : {
                     required : true,
                     validateNumberFormat : true
                 },
                 distractorAlgebraicText_multiple_2 : {
                     required : true,
                     validateNumberFormat : true
                 },
                 distractorAlgebraicText_multiple_3 : {
                     required : true,
                     validateNumberFormat : true
                 },
                 distractorAlgebraicText_multiple_4 : { 
                     required: true,
                     validateNumberFormat : true
                 },  
                 distractorAlgebraicText_tf : { 
                     required: true,
                     validateNumberFormat : true
                 },  
             },
             messages : {
                 generativeQuestion : "<span class='imgwrap'></span>Please write your question text",
                 algebraicText: "<span class='imgwrap'></span>Please write the answer expression",
                 instanceRules_1: { required: "<span class='imgwrap'></span>Please enter at least one variable rule", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
                 instanceRules_2: { required: "<span class='imgwrap'></span>Please enter at least one variable rule", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
                 distractorAlgebraicText_multiple_1: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
                 distractorAlgebraicText_multiple_2: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
                 distractorAlgebraicText_multiple_3: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
                 distractorAlgebraicText_multiple_4: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
                 distractorDisplayText_multiple_1: "<span class='imgwrap'></span>Please write the option display text",   
                 distractorDisplayText_multiple_2: "<span class='imgwrap'></span>Please write the option display text",   
                 distractorDisplayText_multiple_3: "<span class='imgwrap'></span>Please write the option display text",   
                 distractorDisplayText_multiple_4: "<span class='imgwrap'></span>Please write the option display text",   
                 distractorAlgebraicText_tf: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
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
                 }else if( $(element).hasClass('distractor_eq')) {
                     parentNode = $(element).parent()
                     grandParent = $(parentNode).parent();
                     position = $(grandParent).children().index(parentNode);
                     errorbox = grandParent.next().children('td').eq(position);
                     errorbox.append(error); 
                     return errorbox
                 }else if( element.parent().hasClass('input_algebraictext'))  {
                     error.insertAfter(element.next());
                 }else {
                     error.insertAfter(element);
                 }                  
             },
             errorClass:'errorbox'
        });
        
  	$('.algorithmicquestionform').validate({
             rules : {
                 generativeQuestion : {
                     required : true
                 },
                 algebraicText : {
                     required : true 
                 },
                 distractorDisplayText_multiple_1 : {
                     required : true,
                     validateNumberFormat : true
                 },
                 distractorDisplayText_multiple_2 : {
                     required : true,
                     validateNumberFormat : true
                 },
                 distractorDisplayText_multiple_3 : {
                     required : true,
                     validateNumberFormat : true
                 },
                 distractorDisplayText_multiple_4 : { 
                     required: true,
                     validateNumberFormat : true
                 },  
             },
             messages : {
                 generativeQuestion : "<span class='imgwrap'></span>Please write your question text",
                 algebraicText: "<span class='imgwrap'></span>Please write the algebraic equation",
                 distractorDisplayText_multiple_1: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },   
                 distractorDisplayText_multiple_2: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },
                 distractorDisplayText_multiple_3: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },
                 distractorDisplayText_multiple_4: { required: "<span class='imgwrap'></span>Please write the answer expression", validateNumberFormat: $.invalidNumberFormatErrorMessage },
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
                 }else if( $(element).hasClass('distractor_text')) {
                     parentNode = $(element).parent().parent();
                     errorbox = parentNode.next().children('td').eq(1);
                     errorbox.append(error); 
                     return errorbox
                 }else if( element.parent().hasClass('input_algebraictext'))  {
                     error.insertAfter(element.next());
                 }else {
                     error.insertAfter(element);
                 }                  
             },
             errorClass:'errorbox'
        });

    });
    $.fn.exists = function(){return $(this).length>0;}
})

