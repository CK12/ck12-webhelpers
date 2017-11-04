/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module name of module
 * @class app
 */
define(["jquery", "foundation"],function ($,foundation){
	function app(){
		
		var QUEUE = MathJax.Hub.queue,
		prevLatex;
		function initFoundation(){
			$(document).foundation();
		}
		function init(){
			QUEUE.Push(function () {
				math = MathJax.Hub.getAllJax("mathdiv")[0];
			});
			initFoundation();
			initMathEditorApis();
		}
		
		function initMathEditorApis(){
			require(['core/api'],function(API){
				if(window.parent && window.parent.container 
						&& window.parent.container.API 
						&& window.parent.container.API.info && typeof window.parent.container.API.info === 'function'){
					
					var supportedEvents = window.parent.container.API.info().events;
					
					if($.inArray("onload", supportedEvents) !== -1 &&  window.parent.container.API.notify && typeof window.parent.container.API.notify === 'function'){
						window.parent.container.API.notify({
							"event": "onload",
							"API": API
						});
					}
				}
			});
		}
		
		
		/**
		 * Add description about function here.
		 * @function app#showMath
		 * @param Tex
		 * @param id
		 */
		function showMath(options){
			var targetWrapper = document.createElement('span'),
				mathOutputId = 'MathOutput_'+options.id,
				target,
				data,
				parsedLatex;
				/*data_tex_mathjax;*/
			parsedLatex = options.Tex;
			if(parsedLatex === prevLatex){
				parsedLatex = parsedLatex+" ";
			}
			prevLatex = parsedLatex;
			parsedLatex = "\\begin{align*}"+parsedLatex+"\\end{align*}";
			options.cb = options.cb || function(){};
			QUEUE.Push(["Text",math,"\\displaystyle{"+parsedLatex+"}"]);
			QUEUE.Push(function(){
				/*var fontColor = eqeditorObj.getFontProperty().fontColor,
					fontSize = eqeditorObj.getFontProperty().fontSize;*/
				var mathMethod = eqeditorObj.getMathMethod().mathMethod;
				var mathClass = eqeditorObj.getMathMethod().mathClass;
				if(mathMethod == undefined){
					 mathMethod = $(".math-method input[type='radio']:checked").val();
					 mathClass = $(".math-method input[type='radio']:checked").attr('data-mathClass');
				}
				$('.text').each(function(i){
					$(this).attr('value',$(this).val());
				});
				if($('.formula_container').find('.paste-option').length != 0){
					var edithtml = '';
				}
				else {
					var edithtml = LZString.compressToBase64($('.formula_container').html());
				}
				
				target = document.getElementById('mathdiv').children[1];
				//target.setAttribute("contenteditable","false");
				
				if($(".merror", target).length > 0){
					$(".ok").removeClass("hidden");
					$(".confirm,.cancel").addClass("hidden");
					$('#confirmModal').foundation('reveal', 'open',{closeOnBackgroundClick: false});
		    		$('#modalContentConfirm').html('The generated latex is incorrect. Please clear the formula and regenerate it.');
		    		$(".ok").off("click.ok").on("click.ok", function(){
		    			$(this).parents('.reveal-modal').foundation('reveal', 'close');
		    		});
					return false;
				}
				
				/*target.style.color = fontColor;
				target.style.fontSize = fontSize;
				
				var targetStyle = 'color: '+fontColor+'; font-size: '+fontSize;*/
				
				targetWrapper.appendChild(target.cloneNode(true));
				
				var data_tex = options.Tex;
				var data_tex_test = data_tex.match(/to(\\{2,}[^}]*)}/);
				if(data_tex_test!=null && $.isArray(data_tex_test)){
					data_tex = data_tex.replace(data_tex_test[1], "{" + (data_tex_test[1]).replace(/\\{2,}/, '') + "}");
					edithtml = '';
				}
				/*
				if(mathMethod === 'alignat' || mathMethod === 'inline'){
					data_tex_mathjax = '@$'+data_tex+'@$';
				}
				else{
					data_tex_mathjax = '@$$'+data_tex+'@$$';
				}
				*/
				options.Tex = options.Tex.replace("<", "\\lt ").replace(">", "\\gt ");
				data = {
						"id" : mathOutputId,
						"wrapHtml" : targetWrapper,
						"tex" : data_tex,
						"editHtml" : edithtml, 
						"variable" : localStorage,
						"mathMethod" : mathMethod,
						"mathClass" : mathClass
						/*"data_tex_mathjax" : data_tex_mathjax*/
						/*"data_style" : targetStyle*/
				};
				options.cb(data);
				$('.text:last').focus();
				$('.text:last').blur();
				//QUEUE.Push(["Text",math,"\\displaystyle{"+parsedLatex+"}"]);
			});
		}

		/**
		 * Add description about function here.
		 * @function app#removeMath
		 */
		function removeMath(){
			QUEUE.Push(["Text",math,"\\displaystyle{"+''+"}"]);
		}
		
		this.showMath = showMath;
		this.removeMath = removeMath;
		this.initFoundation=initFoundation;
		
		init();
	}
	
	eqeditor.prototype.app = new app();
});