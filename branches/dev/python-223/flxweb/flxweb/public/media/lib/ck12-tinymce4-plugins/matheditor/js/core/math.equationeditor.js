/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module Name of module
 */
define(["jquery","extensions","foundation"],
		function ($,extentions,foundation){
	/**
	 * Add description about class here.
	 * @class EqEditor
	 */	
			function EqEditor(){
				var positionLogger = {
				        start: 0,
				        end: 0
			    	}, 
			    	matrixRowCounter = 0,
			    	$formulaContainer,
			    	selectedTextbox = '',
			    	prevValue = '',
			    	formulaHeader = {},
			    	mathFontSize,
			    	mathFontColor,
			    	mode='',
			    	prevVariableName,
			    	mathMethod,
			    	mathClass,
			    	mathObj = {},
			    	variable = {};
				/**
				 * This function will be called once the math.equationeditor.js is loaded.
				 * @function EqEditor~onload
				 * 
				 */
			    function onload() {
			    	$formulaContainer = $('.formula_container');
			        selectedTextbox = document.getElementById("math");
			        
			        init();
			    };
			    function confirmClear(){
			    	var $formulaRow = $('.formula-row'); 
			    	if($formulaRow.css('display')=='none'){
			    		$formulaRow.show();
			    		var frameParent = window.parent.frameElement.parentElement;
			    		$(frameParent).css('height','638px').parents("#"+frameParent.id.slice(0,-5)).css('height','647px');
				    }
			    	document.getElementById("texoutput").value = "";
			        //var custHeight = $('.rendered-math .mainbox').attr('custom-height');
			        //var custWidth = $('.rendered-math .mainbox').attr('custom-width');
			        $(".formula_container").find('.paste-option').remove();
			        $('.rendered-math').empty();
			        $('.rendered-math').append("<input type='text' class = 'first text mainbox' name ='math' id='math' position=0 custom-width=32 custom-height=32 style ='width:32px; height:32px;'>");
			        selectedTextbox = document.getElementById("math");
			        $formulaContainer.center();
			        positionLogger.start = 0;
			        positionLogger.end = 0;
			        matrixRowCounter = 0;
			        eqeditorObj.app.removeMath();
			        prevValue = '';
			        addButtonClass();
			        $('#modalContentConfirm').html("Equation deleted successfully.");
			        $(".ok").removeClass("hidden");
	    			$(".confirm,.cancel").addClass("hidden");
		    		if ($("#texoutput").attr("data-paste")) {
			        	   $("#editableMath").hide();
	    			}
	    			$("#editableMath").show();
			    }
			    /**
				 * This function will be executed when the user clicks on the clear button.
				 * @function EqEditor~clearMath
				 * 
				*/
			    function clearMath() {
			    	$(".ok").addClass("hidden");
	    			$(".confirm,.cancel").removeClass("hidden");
			    	$('#confirmModal').foundation('reveal', 'open', {closeOnBackgroundClick: false});
		    		$('#modalContentConfirm').html('Are you sure you want to clear the complete equation?')
		    		$(".confirm").off("click.confirm").on("click.confirm", confirmClear);   			
		    		$(".ok").off("click.ok").on("click.ok", function(){
		    			$(this).parents('.reveal-modal').foundation('reveal', 'close');
		    		});
			    }
			    
			    function setVariable(data){
			    	variable = data;
			    }
			    
			    function getVariable(){
			    	return variable;
			    }
			    
			    function showVariables(){
			    	 var variable;
			    	 variable = getVariable();
			    	 $('#variableToolbar').html('');
			    	 $('#variableToolbar').append('<div class="close-cont-var"><div class="vartooltipClose icon-remove"></div></div></div>');
			    	 $('#variableToolbar').append(' <div id = "varToolbarInner">')
			    	 for(x in variable){
			    		$('#varToolbarInner').append('<div class="variableEditDelete"><span class="varContainer random-variable" title='+variable[x].rules+' data-varName='+variable[x].name+'>'+variable[x].name+'</span></div>');
			    	 } 
			    }
			    /**
				 * This function will be called once the math.equationeditor.js is loaded.
				 * @function EqEditor~getTools
				 * @param {object} input Add description about parameter.
				 * @returns Add description about returned toolToUpdate.
				 * 
				*/
			     
			    function getTools(input) {
			        var toolToUpdate = [],
			            u = {};
			        $($(input).parents()).each(function (i, v) {
			            if ($(this).attr('data-tools') !== undefined) {
			                var toolName = $(this).attr('data-tools');
			                if (!u.hasOwnProperty(toolName)) {
			                    toolToUpdate.push($(this).attr('data-tools'));
			                    u[toolName] = 1;
			                }
			            }
			        });
			        return toolToUpdate;
			    }
			    /**
			     * This is called when the user inputs data in the math-tool working area.
			     * @function EqEditor~addLatex
			     * @param {object} input Input box into which the user has entered  data.
			     * @param {integer} length  Previous length of input box.
			     * @param deletedSplChar Add description about parameter.
			     */

			    function addLatex(input, length, deletedSplChar) {
			        var position = $(input).attr('position'),
			            decreasePosition = length + deletedSplChar,
			            latex = document.getElementById("texoutput").value.substring(position, document.getElementById("texoutput").value.length),
			            itemtoInsert,
			            textboxIndex = $(input).index('input'),
			            toolToUpdate;
			        
			        if($(input).hasClass('hasVariable')){
			        	decreasePosition = length + 2;
			        	$(input).val("");
			        	$(input).removeClass('hasVariable hasText');
			        }
			        
			        document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, position - decreasePosition);
			        $(input).attr('position', parseInt($(input).attr('position')) - decreasePosition);

			        $('.text').each(function (i) {
			            if (i > textboxIndex) {
			                $(this).attr('position', parseInt($(this).attr('position')) - decreasePosition);
			            }
			        });
			        itemtoInsert=util.getLatex(input.value);
			        
			        document.getElementById("texoutput").value = document.getElementById("texoutput").value +itemtoInsert+ latex;
			        $(input).focus();
					$('.text').each(function (i) {
			            if (i >= textboxIndex) {
			                $(this).attr('position', parseInt($(this).attr('position')) + itemtoInsert.length);
			            }
			        });
			        toolToUpdate = getTools(input);
			        $.each(toolToUpdate, function (index, value) {
			            eqeditorObj[value].updateOnAddTool();
			        });
			    }
			    /**
			     * Add description about function here.
			     * @function EqEditor~removeLatex
			     * @param {object} input Input box from which the user has removed  data..
			     * @param {number} startCursor Add description about parameter.
			     * @param {number} endCursor Add description about parameter.
			     * @param deletedSplChar Add description about parameter.
			     */

			    function removeLatex(input, deletedTextLength, deletedSplChar) {
			        var position = $(input).attr('position'),
			            len = $(input).val().length,
			            positionCursor = $(input).caret().start,
			            deleteLength = (deletedTextLength) > 0 ? (deletedTextLength) : 1,
			            latex, deleteAtpos, textboxIndex,
			            splCharOcc = util.getLatex(input.value.substring(positionCursor, len).length - (len - positionCursor));
			        
			        deleteLength = deleteLength + deletedSplChar;
			        if (positionCursor === len) {
			            latex = document.getElementById("texoutput").value.substring(position, document.getElementById("texoutput").value.length);
			            document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, (position) - deleteLength) + latex;
			        } else {
			            deleteAtpos = position - (len - positionCursor) - (splCharOcc);
			            latex = document.getElementById("texoutput").value.substring(deleteAtpos, document.getElementById("texoutput").value.length);
			            document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, deleteAtpos - deleteLength) + latex;
			        }

			        textboxIndex = $(input).index('input');
			        $('.text').each(function (i) {
			            if (i >= textboxIndex) {
			                $(this).attr('position', parseInt($(this).attr('position')) - deleteLength);
			            }
			        });
			    }
			    /**
			     * It removes a tool from work area .
			     * @function EqEditor~removeFormula
			     * @param   {object} input Input box in which backspace has been pressed.
			     * @returns {Boolean} Add description of returned value.
			     */
			    function removeFormula(input) {
			        var checkSpan = $($(input).parent()),
			            inputLeft,
			            inputRight,
			            positionToAdd1,
			            positionToAdd2,
			            positionToReduce,
			            newInputText,
			            newInput,
			            width,
			            widthPrev,
			            toolToUpdate,
			            inputLeftVar;

			        while ($(checkSpan).hasClass('leftSpan') || $(checkSpan).hasClass('rightSpan')) {
			            if ($(checkSpan).hasClass('rightSpan')) {
			                var toolToRemove = $(checkSpan).siblings('.removeTool');
			                break;
			            }
			            checkSpan = $(checkSpan).parent();
			        }

			        if (!toolToRemove) {
			            return true;
			        }

			        if (!(toolToRemove.hasClass('selectFormula'))) {
			            toolToRemove.addClass('selectFormula');
			            return true;
			        }

			        inputLeft = $('input:last', $(toolToRemove).prev()).val();
			        inputRight = $('input:first', $(toolToRemove).next()).val();
			        positionToAdd1 = parseInt($('input:last', $(toolToRemove).prev()).attr('position')) - inputLeft.length;
			        positionToAdd2 = parseInt($('input:first', $(toolToRemove).next()).attr('position')) - inputRight.length;
			        positionToReduce = positionToAdd2 - parseInt($('input:last', $(toolToRemove).prev()).attr('position'));
			        newInputText = $('input:first', $(toolToRemove).next());
			        document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, positionToAdd1) + inputLeft + document.getElementById("texoutput").value.substring(positionToAdd2, document.getElementById("texoutput").value.length);
			        width = getTextboxWidth(inputLeft, inputRight, newInputText);
			        if(inputLeft === "" && inputRight === ""){
			        	width.left = 2;
			        	width.right = 2;
			        }
			        newInput = inputLeft + inputRight;
			        selectedTextbox = newInputText[0];

			        $('input:first', $(toolToRemove).next()).val(newInput).css({
			            'width': width.left + width.right
			        });

			        removeHTML(toolToRemove, newInputText, positionToReduce);
			        positionLogger.start = $(selectedTextbox).caret().start;
			        positionLogger.end = $(selectedTextbox).caret().end;
			        updateClass(newInputText);
			        toolToUpdate = getTools(newInputText);
			        $.each(toolToUpdate, function (index, value) {
			            eqeditorObj[value].updateOnAddTool();
			        });
			        $formulaContainer.center();
			    }
			    /**
			     * It removes the html corresponding to the deleted tool.
			     * @fucntion EqEditor~removeHTML
			     * @param {object} toolToRemove contains html of removed tool.
			     * @param {object} newInputText Input box in which backspace was pressed.
			     * @param {number} positionToReduce Position attribute has to be reduce by this integer.
			     */

			    function removeHTML(toolToRemove,newInputText,positionToReduce) {
			        var prevElement = $(toolToRemove).prev().children(),
			            nextElement = $(toolToRemove).next().children(),
			            removeLast,
			            textboxIndex;

			        $(toolToRemove).prev().remove();
			        $(toolToRemove).next().remove();
			        $(toolToRemove).before(prevElement);

			        if ($(prevElement).length === 1) {
			            $(prevElement).parent().append(nextElement);
			            $(prevElement).remove();
			        } else {
			            removeLast = $('input:last', $(prevElement).last());
			            $('input:last', $(prevElement).last()).parent().append(nextElement);
			            $(removeLast).remove();
			        }

			        $(toolToRemove).remove();
			        textboxIndex = $(newInputText).index('input');
			        $('input').each(function (i) {
			            if (i >= textboxIndex) {
			                $(this).attr('position', parseInt($(this).attr('position')) - positionToReduce);
			            }
			        });
			    }
			    /**
			     * Add description about function here.
			     * @function EqEditor~updateClass
			     * @param newInputText Add description about parameter.
			     */

			    function updateClass(newInputText) {
			        if (!($(newInputText).parent().hasClass('leftSpan') || $(newInputText).parent().hasClass('rightSpan'))) {
			            $(newInputText).removeClass('rightInput leftInput cursor-input').addClass('showbox');
			            if ($(newInputText).val().length <= 0) {
			                $(newInputText).css('height', $(newInputText).attr('custom-height')+'px');
			                $(newInputText).css('width', $(newInputText).attr('custom-width')+'px');
			            }
			            widthPrev = parseInt(selectedTextbox.style.width);
			            if (widthPrev < parseInt($(newInputText).css('width'))) {
			                $(newInputText).css('min-width', widthPrev.toString() + "px");
			            }
			        } else {
			            if ($(newInputText).parent().hasClass('leftSpan')) {
			                $(newInputText).removeClass('leftInput rightInput').addClass('leftInput cursor-input');
			            } else if ($(newInputText).parent().hasClass('rightSpan')) {
			                $(newInputText).removeClass('leftInput rightInput').addClass('rightInput cursor-input');
			            }
			        }

			        if ($(newInputText).val().length > 0) {
			            $(newInputText).addClass('hasText').removeClass('noText');
			        } else {
			            $(newInputText).removeClass('hasText').addClass('noText');
			        }

			        $(newInputText).focus();
			        $(newInputText).caret({
			            start: $(newInputText).val().length,
			            end: $(newInputText).val().length
			        });
			        $('#texoutput').focus();
			    }
			    
			    function iOSversion() {
		    		  if (/iP(hone|od|ad)/.test(navigator.platform)) {
		    		    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		    		    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		    		  }
		    		}
			    
			    /**
			     * This function is called each time there is a change in data entered in input boxes by user.It resizes the box according to width of latest data.
			     * @function EqEditor~changeWidth
			     */

			    function changeWidth() {
			    	var event,
			    		ver;
			    	ver = iOSversion();
		    		if (ver !== undefined && ver[0] >= 7) {
		    		  event = 'keyup.input';
		    		}
		    		else{
		    			event = 'keydown.input';
		    		}
		    		
			    	$(".formula_container").off('click.input').on('click.input','input',function (e) {
			        	var $input=$(this),
			        		length,
			        		position;
				    		startPosition = $input.caret().start;
				    	if($input.hasClass('hasVariable')){
				    		length = this.value.length;
				    		position = (length - startPosition > startPosition) ? 0 : length;
				    		$input.caret({start:position,
				    						end:position
				    					});
				    	}
		                positionLogger.start = $input.caret().start;
		                positionLogger.end = $input.caret().end;
			    	});

			    	$(".formula_container").off(event).on(event,'input',function (e) {
			        	var input=this,
		                    length = prevValue.length,
		                    deletedText,
		                    deletedSplChar,
		                    variableLength,
		                    position,
		                    $input = $(input);
			                	
		               if ((e.keyCode === 220 && !e.shiftKey) || e.keyCode === 32) {
		                    return false;
		                }
		               
		                setTimeout(function () {
		                	if (($input.hasClass('hasVariable')) && (e.keyCode !== 9 && e.keyCode !== 37 && e.keyCode !== 38 && e.keyCode !== 39 && e.keyCode !== 40)){
		                		input.value = "";
		                	}
		                	
		                	if (($input.hasClass('hasVariable')) && (e.keyCode === 37 || e.keyCode === 39)){
		                		variableLength = $input.val().length;
		                		if(e.keyCode === 37 && ($input.caret().end === $input.val().length-1)){
		                			position = 0;
		                		}
		                		else if(e.keyCode === 39 && ($input.caret().start === 1)){
		                			position = variableLength;
		                		}
		                		
		                		$input.caret({start:position,
					    						end:position
					    					});
					    		
					    		positionLogger.start = $input.caret().start;
				                positionLogger.end = $input.caret().end;
		                	}
		                	
		                	var width=getTextboxWidth(input.value, "", $(input)).left;
	                        input.style.width = width + 'px';
		                    if (input.value.length > 0) {
		                        $(input).addClass('hasText').removeClass('noText');
		                    } else {
		                        $(input).removeClass('hasText').addClass('noText');
		                        if (!$(input).hasClass('cursor-input')) {
		                            $(input).css('width', parseInt($(input).attr('custom-width')) + "px");
		                        } else {
		                            $(input).css('min-width', "4px");
		                            $(input).css('width', "4");
		                        }
		                    }
		                    $formulaContainer.center();
		                    var parentContainer = $(input).parent();

		                    $('.showboxroot.noText', parentContainer).css('min-width', $('.showboxroot', parentContainer).attr('custom-width'));
		                    $('.showboxroot.noText', parentContainer).css('min-height', $('.showboxroot', parentContainer).attr('custom-height'));

		                    positionLogger.start = $(selectedTextbox).caret().start;
		                    positionLogger.end = $(selectedTextbox).caret().end;
		                    if(!(e.keyCode === 9)){
			                    if (prevValue !== input.value) {
			                    	length = prevValue.length;
			                        $("*").removeClass('selectFormula');
			                        deletedText = prevValue;
			                        deletedSplChar = (util.getLatex(deletedText).length-deletedText.length);
			                        addLatex(input, length, deletedSplChar);
			                        prevValue = input.value;
			                    } else if (e.keyCode === 8) {
			                        if (!($(input).parent().hasClass('leftSpan') || $(input).parent().hasClass('rightSpan'))) {
			                            if ($('input:first', $(input).parents('.removeTool').next().eq(0)).length > 0) {
			                                $('input:first', $(input).parents('.removeTool').next().eq(0)).focus().caret({
			                                    start: 0,
			                                    end: 0
			                                });
			                                $(input).parents('.removeTool').eq(0).addClass('selectFormula');
			                                prevValue = $('input:first', $(input).parents('.removeTool').next().eq(0)).val();
			                            }
			                            return true;
			                        }
			                        removeFormula(input);
			                    }
		                    }
		                    addButtonClass();
		                }, 1);
			        });
			    }
			    
			    /**
			     * Add description about function here.
			     * @function EqEditor~getTextboxWidth
			     * @param leftText Add description about parameter.
			     * @param rightText Add description about parameter.
			     * @param input Add description about parameter.
			     * @returns Add description about returned value.
			     */

			    function getTextboxWidth(leftText, rightText, input) {
			        var width = {
				            left: '',
				            right: ''
			        	},
			        	input = input[0];
			        var tmp = document.createElement('div');
			        tmp.style.padding = '0';
			        tmp.style.width = '';
			        tmp.id = 'calcWidth';
			        tmp.style.position = 'absolute';
			        tmp.style.fontSize = window.getComputedStyle(input, null).getPropertyValue('font-size');
                    tmp.style.fontFamily = window.getComputedStyle(input, null).getPropertyValue('font-family');
                    tmp.style.fontStyle = 'italic';
			        //tmp.innerHTML = leftText;
			        tmp.appendChild(document.createTextNode(leftText));
			        $('.formula_container').append(tmp);
			        if(leftText.charAt(leftText.length -1) === 'f'){
			        	width.left = tmp.clientWidth + 15;
			        }else{
			        		width.left = tmp.clientWidth + 5;
			        				        		
			        }
			        tmp.innerHTML = rightText;
		    		width.right = tmp.clientWidth + 5;
			    
			        $('#calcWidth').remove();
			        return width;
			    }
			    /**
			     * Adds the various tool symbols to the header in math tool 
			     * @function EqEditor~changeFontSize
			     * @param {String} fontSize 
			     */
			    function changeFontSize(fontSize,fontHeaderText){
			    	var tools = [],
			    		toolsToScale = [],
			    		$fontSizeHead = $('.font-size-head');
			    	var prevFontSize = $('.rendered-math').css('font-size');
			    	$('.rendered-math').css('font-size',fontSize);
			    	//$fontSizeHead.empty();
			    	//$fontSizeHead.append(fontHeaderText+ '<span></span>');
			    	$fontSizeHead.attr('data-currentFont', fontSize);
			    	var input = document.getElementsByTagName('input');
			    	$.each(input, function () {
			    		var width = getTextboxWidth($(this).val(),"",$(this));
			    		var prevCustomHeight = parseInt($(this).attr('custom-height'));
				    	var prevCustomWidth = parseInt($(this).attr('custom-width'));
				    	$(this).attr('custom-height',Math.round((prevCustomHeight*parseInt(fontSize))/parseInt(prevFontSize)));
				    	$(this).attr('custom-width',Math.round((prevCustomWidth*parseInt(fontSize))/parseInt(prevFontSize)));
				    	if(!$(this).hasClass('hasText') && !$(this).hasClass('cursor-input')){
				    		this.style.width = $(this).attr('custom-width') + "px"; 
				    	 }else if($(this).hasClass('cursor-input')&& $(this).hasClass('noText')){
				    		 this.style.width = '4px';
				    	 }
				    	 else{
				    		 this.style.width = width.left + "px";
				    	 }
				    	this.style.height = $(this).attr('custom-height') + "px";
				    	 
			    	 });
			    	
			    	 $(".rendered-math [data-tools]").each(function(){
			    		 tools.push($(this).attr('data-tools')); 
			    	 });
			    	 
					$.each(tools, function(i, el){
					    if($.inArray(el, toolsToScale) === -1) {
					    	toolsToScale.push(el);
					    }
					});
					
					 $.each(toolsToScale, function(index, value) {
			    		 eqeditorObj[value].updateOnAddTool();
			    	});
					 
			    	 $formulaContainer.center();	
			    }
			    /**
			     * Adds a tool to the working area of math editor.
			     * @function EqEditor~addFormulaContainer
			     * @param {object}formulaTemplate Contains the html and latex data for the tool to be added .
			     * @param {String} formula name of the tool to be added.
			     * @returns Add description about returned value.
			     */

			    function addFormulaContainer(formulaTemplate, formula) {
			        var len,
			        	$selectedTextbox = $(selectedTextbox),
			            text,
			            leftText,
			            rightText,
			            position,
			            html = formulaTemplate.html,
			            parentContainer = $selectedTextbox.parent(),
			            $showbox,
			            $left,
			            $right,
			            splCharOcc,
			            insertAtPos,
			            latex,
			            deletedSplChar,
			            maxUpdated,
			            variableFound = false;
			        
			        if($(".mainbox").length > 0){                            // if editable math is present
				        if($selectedTextbox.hasClass('hasVariable')){
				            variableFound = true;
				        }
				        
				        if (positionLogger.start !== positionLogger.end) {
				            deletedText = selectedTextbox.value.slice(positionLogger.start, positionLogger.end);
				            selectedTextbox.value = selectedTextbox.value.slice(0, positionLogger.start) + selectedTextbox.value.slice(positionLogger.end, selectedTextbox.value.length);
				            deletedSplChar = util.getLatex(deletedText).length - deletedText.length;
				            $(selectedTextbox).caret(positionLogger.start, positionLogger.end);
				            removeLatex(selectedTextbox, deletedText.length, deletedSplChar);
				        }
				        len = selectedTextbox.value.length !== undefined ? selectedTextbox.value.length : 0;
				        text = selectedTextbox.value;	
				        
				        leftText = text.substring(0, positionLogger.start);
			            rightText = text.substring(positionLogger.start, len);
			            position = $(selectedTextbox).attr('position');
				        $selectedTextbox.remove();
				        parentContainer.append(html);
				        resizeBox(parentContainer,leftText,rightText,formula);
				        $('.mathfunctionBox', parentContainer).css('width',parseInt($('.font-size-head').attr('data-currentFont'))/2);
				        splCharOcc = util.getLatex(rightText).length - rightText.length;
				        insertAtPos = position - (len - positionLogger.start) - (splCharOcc);
				        
				        if(variableFound && positionLogger.start !== len){
			        		insertAtPos = insertAtPos - 2;
			        	}
				        
				        if(variableFound){
				        	if(leftText.length > 0){
				    			$('.leftInput', parentContainer).addClass('hasVariable');
				    		}
				    		else{
				    			$('.rightInput', parentContainer).addClass('hasVariable');
				    		}
				        	variableFound = false;
				        }
				        
				        $('.text', parentContainer).each(function (i) {
				            maxUpdated = $(this).index('input');
				            if (i === 0)
				                $(this).attr('position', insertAtPos + formulaTemplate.template[formula].pos[i]);
				            else
				            if (i !== $('.text', parentContainer).length - 1)
				                $(this).attr('position', parseInt(insertAtPos) + formulaTemplate.template[formula].pos[i]);
				            else {
				                $(this).attr('position', parseInt(position) + formulaTemplate.template[formula].pos[i]);
				            }
				        });
				        $('.text').each(function (i) {
				            if (i > maxUpdated) {
				                $(this).attr('position', parseInt($(this).attr('position')) + formulaTemplate.template[formula].length);
				            }
				        });
				        if (positionLogger.start === len) {
				            latex = document.getElementById("texoutput").value.substring(position, document.getElementById("texoutput").textLength);
				            document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, position) + formulaTemplate.template[formula].data + latex;
				        } else {
				            latex = document.getElementById("texoutput").value.substring(insertAtPos, document.getElementById("texoutput").textLength);
				            document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, insertAtPos) + formulaTemplate.template[formula].data + latex;
				        }
				        $formulaContainer.center();
				        addButtonClass();
				        if(parentContainer.find('.triggerOn').length>0){
				        	var showBoxInput = parentContainer.find('.triggerOn.showbox');
				        	showBoxInput.trigger("focus");
				        	var e = jQuery.Event("keydown");
							e.which = 88;
							e.keyCode = 88;
							showBoxInput.val("x").trigger(e);
							setTimeout(function(){
								var showBoxRootInput = parentContainer.find('.triggerOn.showboxroot');
								showBoxRootInput.trigger("focus");
								var e = jQuery.Event("keydown");
								e.which = 98;
								e.keyCode = 98;
								showBoxRootInput.val("2").trigger(e);
							},3);
				        }
				        $('.rightInput', parentContainer).focus();
				        
				        return $('.showbox', parentContainer).eq(0);
			    }
			        else{                              //editable math is not present
			        	var $texOutput = $("#texoutput")
			        		startLatex = $texOutput.caret().start,
			        		endLatex = $texOutput.caret().end,
			        		latexLength = $texOutput.val().length;
			        	
                        if(formula === 'superscriptSquare'){
                        	document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, startLatex) + '{x}^{2}' + document.getElementById("texoutput").value.substring(endLatex, latexLength);
                        }
                        else {
                        	document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, startLatex) + formulaTemplate.template[formula].data + document.getElementById("texoutput").value.substring(endLatex, latexLength);
                        }
			        }
			    }
			    /**
			     * Add description about function here.
			     * @function EqEditor~resizeBox
			     * @param parentContainer Add description about parameter.
			     * @param leftText Add description about parameter.
			     * @param rightText Add description about parameter.
			     * @param formula Add description about parameter.
			     */
			    function resizeBox(parentContainer,leftText,rightText,formula){
			    	var $showbox = $('.showbox', parentContainer),
			        	$left = $('.leftInput', parentContainer),
			        	$right = $('.rightInput', parentContainer),
			        	$selectedTextbox = $(selectedTextbox),
			        	adjustWidth = $selectedTextbox.attr('custom-width'),
			        	adjustHeight = $selectedTextbox.attr('custom-height'),
			            width;
			    	
			        if ($selectedTextbox.hasClass('mainbox')) {
			            if ($showbox.hasClass('skip')) {
			            	$showbox.removeClass('skip');
			            	$showbox.attr('custom-height', adjustHeight);
			            	$showbox.attr('custom-width', adjustWidth);
			            } else {
			            	$showbox.css('height', adjustHeight).attr('custom-height', adjustHeight);
			            	$showbox.css('width', adjustWidth).attr('custom-width', adjustWidth);
			            }
			            if(!(formula === 'frac')){
			            	$showbox.addClass('mainbox');
			            }
			        } else {
			            if (!(formula === 'frac')) {
			            	$showbox.css('height', adjustHeight+'px').attr('custom-height', adjustHeight);
			            	$showbox.css('width', adjustWidth+'px').attr('custom-width', adjustWidth);
			            } else {
			            	$showbox.css('height', ((adjustHeight) * 80) / 100).attr('custom-height', ((adjustHeight) * 80) / 100);
			            	$showbox.css('width', ((adjustWidth) * 80) / 100).attr('custom-width', ((adjustWidth) * 80) / 100);
			            }
			        }
			        if ($selectedTextbox.hasClass('mainbox')) {
			            $('.leftInput,.rightInput', parentContainer).addClass('mainbox');
			        }
			        $('.rightInput,.leftInput', parentContainer).css('height',adjustHeight).attr('custom-height', adjustHeight);
			        $('.rightInput,.leftInput', parentContainer).attr('custom-width', adjustWidth);
			        $('.showboxroot', parentContainer).css('height', ((adjustHeight) * 80) / 100).attr('custom-height', ((adjustHeight) * 80) / 100);
			        $('.showboxroot', parentContainer).css('width', ((adjustWidth) * 80) / 100).attr('custom-width', ((adjustWidth) * 80) / 100);

			        leftText = leftText + $('.leftInput', parentContainer).val();
			        $left.val(leftText);
			        if(leftText.length > 0){
			        	$left.removeClass('noText').addClass('hasText');
			        }
			        $right.val(rightText);
			        if(rightText.length > 0){
			        	$right.removeClass('noText').addClass('hasText');
			        }
			        width = getTextboxWidth(leftText, rightText, $left);
			        if ($left.val() === "") {
			        	$left.css('width', '4px');
			        } else {
			            $('.leftInput', parentContainer).css('width', width.left);
			        }
			        if ($right.val() === "") {
			        	$right.css('width', '4px');
			        } else {
			        	$right.css('width', width.right);
			        }
			    }
			    
			    function addVariableLatex(variable){
			    	var $selectedTextbox = $(selectedTextbox),
			        	maxUpdated,
			        	position,
			        	variableLength,
			        	width;
			    	
			    	if($selectedTextbox.hasClass('hasVariable') || $selectedTextbox.val().length > 0){
			    		$('#infoModal').foundation('reveal', 'open', {closeOnBackgroundClick: false});
			    		$('#modalContentInfo').html('Cannot add variable to the selected inputbox.');
			    		$(".ok").off("click.ok").on("click.ok", function(){
			    			$('#infoModal').foundation('reveal', 'close');
			    		});
			        	return false;
			        }
			    	
			    	position = $(selectedTextbox).attr('position');
			    	maxUpdated = $selectedTextbox.index('input');
		        	variableToLatex = '$'+variable+'$';
		        	$selectedTextbox.addClass('hasVariable hasText').removeClass('noText');
		        	width = getTextboxWidth(variable, "",$selectedTextbox);
		        	$selectedTextbox.css('width', width.left);
		        	$selectedTextbox.val(variable);
		        	latex = document.getElementById("texoutput").value.substring(position, document.getElementById("texoutput").textLength);
		            document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0, position) + variableToLatex + latex;
		        	
		        	$('.text').each(function (i) {
			            if (i >= maxUpdated) {
			                $(this).attr('position', parseInt($(this).attr('position')) + variableToLatex.length);
			            }
			        });
		        	
		        	variableLength = $selectedTextbox.val().length;
		            if($selectedTextbox.hasClass('hasVariable')) {
		            	$selectedTextbox.caret({
            				start:variableLength,
    						end:variableLength
    					});
		            }	            
			    	positionLogger.start = $selectedTextbox.caret().start;
			    	positionLogger.end = $selectedTextbox.caret().end;
		        	addButtonClass();
			    }
			    function editLatex(){
			    	//if(!$($(".formula_container").children()).hasClass("paste-option")){
			    	if($(".formula_container").find(".paste-option").length == 0){
			    		$(".rendered-math").html("<span class='paste-option'>Equations entered in LaTeX cannot be edited in the WYSIWYG editor. Please use the area below to edit.</span>")
			    		$("#texoutput").attr("data-paste","Equation pasted");
			    	}
			    	if ($("#texoutput").attr("data-paste")) {
			    		//$("#editableMath").hide();
			    		$(".preview").removeClass('preview_disable disabled grey disable_button').addClass('green_button');
			    		$(".clearMath").removeClass('disabled grey disable_button').addClass('green_button');
			    	}
			    	$formulaContainer.center();
			    	$(document).trigger("resize");
			    }
			    function changeFontFamily(){
			    	var font_family= $(this).attr('data-font-family'),
			    	    class_name;
			    	closeFontFamilyToolbar();
			    	var class_name=$("#editableMath").attr('class').split(/\s+/);
			    	for(var i=0;i<class_name.length;i++){
			    		if(class_name[i].match('font-family')){
			    			$("#editableMath").removeClass(class_name[i]);
			    		};
			    	}
			    	$("#editableMath").addClass(font_family);
			    	$('.font-family-head').html($(this).text()+ '<span></span>');
			    }
			    
			    /**
			     * Add descriptoin about function here.
			     * @function EqEditor~bindevents
			     */
			    function bindevents() {
			    	$('a.close-reveal-modal').off('click.closePreview').on('click.closePreview', function(){
			    		closeModal($(this).parent());
			    		$(".preview").removeClass("preview_disable");
			    	});
			    	
			    	$('.preview').off('click.preview').on('click.preview', function(e){	
			    		if (document.getElementById("texoutput").value.length !== 0 && (!$('.preview').hasClass('preview_disable'))) {
			    			//$(this).addClass("preview_disable");
			    			eqeditorObj.app.showMath({"Tex":document.getElementById("texoutput").value,"id":e.timeStamp,"cb":_append});
			    		}
			        });
			    	 
			    	$('.variable-button').off('click').on('click',function(){
			    		var variable;
			    		
			    		variable = getVariable();
			    		hideColorPicker();
			    		closeVariableToolbar();
			    		closeFontFamilyToolbar();
			    		closeFontSizeToolbar();
			    		$('.tooltipClose').trigger('click');
			    		if(variable.length !== 0 && variable.length !== undefined){
			    			showVariables();
			    		}
			    	});
			    	
			        $('.formula_container').off('focus').on('focus', '.text', function () {
			            selectedTextbox = this;
			            prevValue=selectedTextbox.value;
			            positionLogger.start = $(selectedTextbox).caret().start;
				        positionLogger.end = $(selectedTextbox).caret().end;
				        $("*").removeClass('selectFormula');
			            $('.tooltipClose').trigger('click');
			            closeVariableToolbar();
			            hideColorPicker();
			        });

			        $('.clearMath').off('click.clearMath').on('click.clearMath', function () {
			        	if (document.getElementById("texoutput").value.length !== 0 || $($(".formula_container").children()).hasClass('paste-option') || $("#editableMath").has('input')){
			        		if(!$(this).hasClass("disabled")){
			        		clearMath();
			        		}
			        	}
			            
			        });
			        
			        $('#texoutput').off('click.setCaretClick').on('click.setCaretClick', function () {
			        	$('.rendered-math input').each(function () {
			        		var cursorPosition = $('#texoutput').caret().start,
				            pos = parseInt($(this).attr('position'));
				            if (pos >= cursorPosition) {
				            	var newInputText = $(this);
				            	$(newInputText).focus();
					            $(newInputText).caret({
						            start: $(newInputText).val().length,
						            end: $(newInputText).val().length
						        });
					            $('#texoutput').focus();
					            return false;
				            }
				        });
			        	if($('#noEditorPreviewModal').attr('showModal')==1){
				        	$('#noEditorPreviewModal').foundation('reveal', 'open', {closeOnBackgroundClick: false});
				        	$('#noEditorPreviewModal').attr('showModal',0);
				        	$(".ok").off("click.ok").on("click.ok", function(){
				    			$(this).closest('.reveal-modal').foundation('reveal', 'close');
				    			$('#texoutput').focus();
				    		});
			        	}
			        });

			        $('#texoutput').keydown(function (event) {
			            var textareaCursorPosition = $('#texoutput').caret().start,
							key = event.which,
			            	variableRemoved = 0;
			            setTimeout(function () {
			            	if(key!=17 && key!=16 && key!=9 && event.ctrlKey !==true){
			            		if($('#noEditorPreviewModal').attr('showModal')==0){
			            			editLatex();
			            		}
			            		else {
			            			changeInput(textareaCursorPosition, key, variableRemoved);
			            			addButtonClass();
			            		}
			            	}
			            }, 1);
			        });

			        $(document).on('keyup', function(e) {
			        	 if (e.which === 8 || e.which=== 46) {
				            	if(document.getElementById("texoutput").value.length === 0){
				            		confirmClear();
				            	$(".formula_container").find('.paste-option').remove();
						    		if ($("#texoutput").attr("data-paste")) {
							        	   $("#editableMath").hide();
					    			}
					    			$("#editableMath").show();
				            	}
				            }
			        });
			        $(document).on("keydown", function (e) {
			            if (e.which === 8 && !$(e.target).is("input:not([readonly]), textarea")) {
			                e.preventDefault();
			            }
			        });
			        
			        $('.math-cont').off('click.closeTooltip').on('click.closeTooltip', function(e){
				    	var currentElement = e.target,
				    		toolBarClicked = false;
				    	
				    	if(currentElement.namespaceURI.match(/svg/g) !== null || $(currentElement).parents('.color-cont').length !== 0 || $(currentElement).hasClass('variable-button') || $(currentElement).parents('.variable-button').length !== 0 || $(currentElement).hasClass('color-cont')){
				    		return false;
				    	}
				    	
				    	while(currentElement.parentNode){
							if(currentElement.className.split(/\s+/)[0] === 'formulacontainer' || currentElement.className.split(/\s+/)[0] === 'deleteVariable'){
								toolBarClicked = true;
								break;
							}
							else{
								currentElement = currentElement.parentNode;
							}
						}
				    	
				    	if(e.target && ($(e.target).hasClass("tool-tip") || $(e.target).hasClass("inner-container"))){
				    		toolBarClicked = true;
			        	}
				    		
				    	if(!toolBarClicked){
				    		$('.tool-tip-container').remove();
							$('.tool-bar-tools').removeClass('highlightTool');
							closeVariableToolbar();
				    	}
				    	hideColorPicker();
				    });
				    
				    $('.render_canvas').off('click.render_canvas').on('click.render_canvas',function(e){
			        	if (document.getElementById("texoutput").textLength !== 0) {
			    			eqeditorObj.app.showMath({"Tex":document.getElementById("texoutput").value,"id":e.timeStamp,"cb":saveImage});
			    		}
			        	else{
			        		return false;
			        	}
			        });
				    
				    $('.font-size-drd li').off('click').on('click',function(e){
				    	var font_size = $(this).attr('data-font'),
				    		fontHeaderText = $(this).text();
				    	closeFontSizeToolbar();
				    	setFontSize(font_size);
				    	changeFontSize(font_size,fontHeaderText);
				    	$(".mathdiv").css("fontSize",font_size);
				    });
				   $(".math-method input[type='radio']").change(function() {
					   mathMethod = $(".math-method input[type='radio']:checked").val();
					   mathClass = $(".math-method input[type='radio']:checked").attr('data-mathClass');
					   data = {
							    "mathMethod": mathMethod, 
							    "mathClass": mathClass
							};
					   setMathMethod(data);
					   if(mathMethod=='block'){
						   $('.preview-container').css('text-align','center');
					   }
					   else {
						   $('.preview-container').css('text-align','left');
					   }
				   });
				    $('#fontFamily li').off('click.fontFamily').on('click.fontFamily',changeFontFamily);
				    
				    $(".color-cont").off("click.color-cont").on("click.color-cont", function(){
				    	$('.tooltipClose').trigger('click');
				    	closeVariableToolbar();
				    	closeFontFamilyToolbar();
				    	closeFontSizeToolbar();
				    	var colorPicker = document.getElementById('color-picker');
				    	if(colorPicker.style.display === 'none'){
				    		colorPicker.style.display = 'block';
				    	}else{
				    		colorPicker.style.display = 'none';
				    	}
				    	
				    	
				    });
				    
				    $("#variableToolbar").off("click.randomVariable").on("click.randomVariable",".random-variable", function(){
				    	var variable = $(this).attr('data-varname');
				    	addVariableLatex(variable);
				    });
				    
			    	$('.cancel').off("click.cancel").on("click.cancel", function(){
			    		if(!$(this).hasClass("disabled")){
			    			closeModal($(this).parents('.reveal-modal'));
			    		}
			    	});
			    	
				    $('.addVariableValue').keyup(function(e){
				    	if(e.which == 188){
				    		$('.setRadio').attr('checked','checked');
				    		$('.constantRadio').removeAttr('checked');
				    	}else if((e.which == 46 ||e.which == 8) && ($('.addVariableValue').val().indexOf(',') == -1) && ($('.setRadio').attr('checked')=='checked')){
				    		$('.constantRadio').attr('checked','checked');
				    		$('.setRadio').removeAttr('checked');
				    	}
				    });
			        changeWidth();

			        window.onresize = function () {
			        	$formulaContainer.center();
			        };
			        
			        $("input[name=variableValueType]:radio").change(function () {
			        	$('#addVariableModal').find('[checked]').removeAttr('checked');
			        	$(this).attr('checked','checked');
			        });
			        $("#texoutput").off('paste.latex').on('paste.latex', editLatex);
			        $("#texoutput").off('cut.latex').on('cut.latex', editLatex);
			        /*$(".infoIcon").hover(
			        	function() {
			        		$(this).next("div").show();
			        	}, function() {
			        		$(this).next("div").hide();
			        	}
			        );*/
			        $(".infoIcon")
			        .mouseenter(function() {
			        	$(this).next("div").css('left', $(this).position().left - 9).show();
			        })
			        .mouseleave(function() {
			        	$(this).next("div").hide();
			        });
			    }
			    
			    function closeVariableToolbar(){
			    	$('#variableToolbar').html('');
			    }
			    
			    function closeModal(modal){
			    	modal.foundation('reveal', 'close');
			    }
			    
			    function closeFontFamilyToolbar(){
			    	$('#fontFamily').removeClass("open").css("left", "-99999px");
			    }
			    
			    function closeFontSizeToolbar(){
			    	$('.font-size-drd').removeClass("open").css("left", "-99999px");
			    }
			    
			    function changeColor(color){
			    	$(".rendered-math input").css("color",color);
			    	$(".lowerContainer").css("border-top-color",color);
			    	$(".roottop").css("border-top-color",color);
			    	$(".rendered-math").css("color",color);
			    	$(".colorSelector").css("background",color);
			    	$(".arrowLeft").css("border-right-color",color);
			    	$(".arrowLeft").css("border-top-color",color);
			    	$(".arrowRight").css("border-right-color",color);
			    	$(".arrowRight").css("border-top-color",color);
			    	setColor(color);
			    }
			    
			    function setFontSize(data){
			    	mathFontSize = data;
			    }
			    
			    function setColor(data){
			    	mathFontColor = data;
			    }
			    function setMathMethod(data){
			    	mathObj = data;
			    }
			    function getFontSize(){
			    	return mathFontSize;
			    }
			    function getfontColor(){
			    	return mathFontColor;
			    }
			    function getMathMethod(){
			    	return mathObj;
			    }
			    function getFontProperty(){
			    	var fontProperty = {};
			    	fontProperty.fontSize = getFontSize();
			    	fontProperty.fontColor = getfontColor();
			    	return fontProperty;
			    }
			    
			    function _append(data){
			    	$('.preview-container').empty();
			    	if($('input:radio[name=math-method]:checked').val()=='block'){
			    		$('.preview-container').append(data.wrapHtml.innerHTML).css('text-align','center');
			    	}
			    	else {
			    		$('.preview-container').append(data.wrapHtml.innerHTML);
			    	}
			    	//$('#modalContentPreview').empty();
	    			//$('#modalContentPreview').append(data.wrapHtml.innerHTML);
	    			//$('#myModal').foundation('reveal', 'open', {closeOnBackgroundClick: false});
	    			$('input').blur();
	    			$('.mathdiv').children().eq(1).empty();
			    }
			    
			    function saveImage(){
			    	html2canvas($(".mathdiv"), {
		        		onrendered: function(canvas) {
		        			var img = canvas.toDataURL();
		        			$.post("../../html2canvas/save.php", {data: img}, function (file) {
		        				window.location.href =  "../../html2canvas/download.php?path="+ file}); 
		        				$('.mathdiv').children().eq(1).empty();
		        		}
		        	});
			    }
			    /**
			     * Adds the various tool symbols to the header in math tool 
			     * @function EqEditor~addTool
			     * @param {String} html Html of tool to be added to header conatining all tool symbols.
			     */

			    function addTool(html,toolFunc) {
			    	formulaHeader[toolFunc] = html;
			    }
			    /**
			     * Add description about function here.
			     * @function EqEditor~showToolVariations
			     * @param args Add description about parameter.
			     */

			    function showToolVariations(args) {
			        var addToparent = '.' + args.addToparent,
			            event = args.event+'.'+args.addToparent,
			            callback = args.callback;
			        $('.formulacontainer').off(event).on(event,addToparent, function () {
						if($('.tool-tip-container')){
							$('.tool-tip-container').remove();
			            }
						hideColorPicker();
						closeVariableToolbar();
						$('.tool-bar-tools').removeClass('highlightTool');
						//$(this).addClass('highlightTool');
						var variationHtml = callback.getVariationHtml();
						$(variationHtml).insertAfter('.formulaselector');
						var $this = $(this),
							$toolTip = $('.tool-tip'),
							toolTipLeft = parseInt($this.position().left)-parseInt($toolTip.css('width'))/2,
							toolTipLeftExtra = toolTipLeft + $toolTip.outerWidth() - parseInt($('.formulaselector').css('width')) + 10;
						if(toolTipLeftExtra > 0){
							toolTipLeft = toolTipLeft - toolTipLeftExtra;
						}
						$toolTip.css('left',toolTipLeft+'px');
						var tipLeft = $this.position().left - toolTipLeft + $this.outerWidth()/2 - 10;
							$('head').append('<style>.tool-tip:before{left:'+tipLeft+'px;}</style>');
						$('.tooltip-tools-inner').each(function(){
							$(this).on('click', function(e){
								var selectedFunction = $(this).attr('formula'),
									input = addFormulaContainer(eqeditorObj[args.addToparent].getEditableHtml(selectedFunction),selectedFunction),
									toolToUpdate = getTools(input);
								
								changeColor($(".colorSelector").css("background-color"));
								$.each(toolToUpdate, function(index, value) {
									eqeditorObj[value].updateOnAddTool();
								});
								
								$('.tool-tip-container').remove();
								$('.tool-bar-tools').removeClass('highlightTool');
			                });
			            });

			            $('.tooltipClose').off('click').on('click', function () {
							if($('.tool-tip-container')){
								$('.tool-tip-container').remove();
								$('.tool-bar-tools').removeClass('highlightTool');
			                }
			            });
			        });
			    }
			    
			    function hideColorPicker(){
			    	/*var colorPicker = document.getElementById('color-picker');
			    	colorPicker.style.display = 'none';*/
			    }
			    
			    function adjustTooltipCss(){
			    	var maxHeight = 0;
		            $(".tooltip-tools-inner").each(function(){
		            	if($(this).height() > maxHeight){
		            		maxHeight = $(this).height(); 
		            	}
		            });
		            
		            $(".tooltip-tools-inner").css('height', maxHeight+'px');
			    }
			    
			    /**
			     * Add description about function here.
			     * @function EqEditor~init
			     */

			    function init() {
			    	$formulaContainer = $('.formula_container');
			    	$messageText = $('.messageText'); 
			    	$('.first').css('width',24);
			    	$('.first').css('height',24);
			    	document.getElementById("texoutput").value="";
			    	$formulaContainer.center();
			        bindevents();
			        addButtonClass();
			        //setColorPicker();
			        //$('.font-size-drd li').eq(0).trigger('click');
			        changeFontSize('24px','18pt');
			    }
			    
			    function setColorPicker(){
			    	var colorPicker = document.getElementById('color-picker');
			    	ColorPicker(colorPicker,function(hex, hsv, rgb) {
		                changeColor(hex);
		            });
			    	hideColorPicker();
			    }
			    
			    function addButtonClass(){
			    	if(document.getElementById("texoutput").value.length === 0){
			    		$('span:not(.confirm,.cancel,.ok)' ,'.button-inner').removeClass('green_button').addClass('disabled grey disable_button');
			    	}
			    	else{
			    		$('span:not(.confirm,.cancel,.ok)' ,'.button-inner').removeClass('disabled grey disable_button').addClass('green_button');
			    	}
			    }
			    function setMathType(option){
			    	if(!option){
			    		option = 'alignat';
			    	}
			    	var checkedAttr = $(".math-method input[type='radio']");
			    	for(var i=0;i<checkedAttr.length;i++){
			    	        if(option == checkedAttr[i].value){
			    	            $(checkedAttr[i]).attr('checked','checked');        
			    	        }
			    	}
			    }
			    function updateVariableButton(){
			    	var variable;
			    	
			    	variable = getVariable();
			    	if(variable.length === 0 || variable.length === undefined){
			        	$('#variable').css('opacity','0.5');
			        	$('#variable').addClass('inactiveVarIcon').removeClass('activeVarIcon');
			        }else{
			        	$('#variable').css('opacity','1');
			        	$('#variable').removeClass('inactiveVarIcon').addClass('activeVarIcon');
			        }
			    }
			    
			    /**
			     * This function handles the input entered by user in the latex textarea.
			     * @function EqEditor~changeInput
			     * @param {number} textareaCursorPosition Position at which character is entered in latex.
			     * @param {number} keyCode Keycode of the entered character.
			     */

			    function changeInput(textareaCursorPosition, keyCode, variableRemoved) {
			    	var toolsToScale = [],
			    	tools = [];
			        $('.rendered-math input').each(function () {
			            var cursorPosition;
			            var start, index;
			            var pos = parseInt($(this).attr('position'));
			            cursorPosition = textareaCursorPosition;
			            if (pos >= cursorPosition) {
			                start = parseInt(pos) - ($(this).val().length);
			                var posValue = getIntegerValue(keyCode);
			                if($(this).hasClass('hasVariable')){
			                	posValue = ($(this).val().length+2) * -1;
			                	$(this).val("").removeClass('hasVariable');
			                	document.getElementById("texoutput").value = document.getElementById("texoutput").value.substring(0,pos+(posValue ))+document.getElementById("texoutput").value.substring(pos - 1 + variableRemoved,document.getElementById("texoutput").value.length)
			                }
			                else{
			                	$(this).val($('#texoutput').val().substring(start, pos + posValue));
			                }
			                $(this).attr('position', parseInt(pos) + posValue);
			                var widthInput = getTextboxWidth($(this).val(), "",$(this));
			                $(this).css('width', widthInput.left + widthInput.right);
			                updateClass($(this));
			                if($(this).val() === "" && $(this).hasClass('cursor-input')){
			                	 $(this).css('width','4');
			                }
			                index = $(this).index('input');
			                $('.text').each(function (i) {
			                    if (i > index) {
			                        $(this).attr('position', parseInt($(this).attr('position')) + posValue);
			                    }
			                });
			                return false;
			            }

			        });
			        $(".rendered-math [data-tools]").each(function(){
				    	 tools.push($(this).attr('data-tools')); 
				    });
						
					$.each(tools, function(i, el){
					    if($.inArray(el, toolsToScale) === -1) {
					    	toolsToScale.push(el);
					    }
					});
					
					if($.inArray("symbol",toolsToScale)!==-1){
						eqeditorObj["symbol"].updateOnAddTool();
					}
					 $formulaContainer.center();
			    }
			    /**
			     * Gives us different ineteger values according to whether the character entered for changeInput was a printable char or delete/backspace or special characters.
			     * The value returned is used in setting the positions in changeInput function.
			     * @function EqEditor~getIntegerValue
			     * @param {number} keyCode Keycode of the entered character.
			     * @returns {number} integerValue Used in setting the positions in changeInput function.
			     */

			    function getIntegerValue(keyCode) {
			        var integerValue;
			        if (keyCode === 8 || keyCode === 46) {
			            integerValue = -1;
			        } else if (keyCode !== 37 && keyCode !== 39 && keyCode !== 37 && keyCode !== 35 && keyCode !== 36 && keyCode !== 9 && keyCode !== 16) {
			            integerValue = 1;
			        } else {
			            integerValue = 0;
			        }
			        return integerValue;
			    }
			    
			    function getFormulaHeader(){
			    	return formulaHeader;
			    }
			    
			    function setSelectedTextbox(){
			    	var $lastInput = $('.text:last'),
			    		color = $('.rendered-math').css("color"),
			    		fontSize = $('.rendered-math').css("fontSize"); 
			    	$lastInput.focus();
			    	$('span' ,'.button-inner').removeClass('disabled grey disable_button').addClass('green_button');
			    	$formulaContainer.center();
			    	selectedTextbox = $lastInput[0];
			    	positionLogger.start = $(selectedTextbox).caret().start;
			        positionLogger.end = $(selectedTextbox).caret().end;
			        $('.colorSelector').css('background',color);
			        $('.font-size-head').html(fontSize+'<span></span>');
			        setColor(color);
			        setFontSize(fontSize);
			        //$(".mathdiv").css("fontSize",fontSize);
			    }

			    this.init = init;
			    this.addTool = addTool;
			    this.showToolVariations = showToolVariations;
			    this.selectedTextbox = selectedTextbox;
			    this.matrixRowCounter = 0;
			    this.clearMath = clearMath;
			    this.changeWidth = changeWidth;
			    this.getFormulaHeader = getFormulaHeader;
			    this.setSelectedTextbox = setSelectedTextbox;
			    this.getFontProperty = getFontProperty;
			    this.getMathMethod = getMathMethod;
			    this.setVariable = setVariable;
			    this.updateVariableButton = updateVariableButton;
			    this.addButtonClass = addButtonClass;
			    this.setMathType = setMathType;
			    onload();
			}

			
			window.eqeditor = EqEditor;
			window.eqeditorObj = new EqEditor();
		}
);