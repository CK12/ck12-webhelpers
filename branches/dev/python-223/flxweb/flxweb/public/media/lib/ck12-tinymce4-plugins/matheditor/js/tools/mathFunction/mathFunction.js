/**

 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/mathFunction/mathFunction
 */
define(['text!tools/mathFunction/mathFunction.html','text!tools/mathFunction/mathFunction.css','tool'], function(markup,css,tool){
	/**
	 * Class for function tool
	 * @class mathFunction
	 * @extends tool
	 */
	function mathFunction(){
		/**
		 *Scaling for function tool.
		 * @function mathFunction#updateOnAddTool
		 * @param {object} input Input box inside function
		 */
		function updateOnAddTool(input){
			var height = 17;
			for(var i=0;i<$('.functionParenthesesContainer').length;i++){
					var scaleY = $($('.functionParenthesesContainer')[i]).height()/height,
					scaleX = (scaleY/3 > 1) ? scaleY/3 : 1;
					$($('.functionParenthesesContainer')[i]).find('.bracTrans').each(function(){
						$(this).css({
							"webkitTransform":"scale("+scaleX+","+scaleY+")",
						    "MozTransform":"scale("+scaleX+","+scaleY+")",
						    "msTransform":"scale("+scaleX+","+scaleY+")",
						    "OTransform":"scale("+scaleX+","+scaleY+")",
						    "transform":"scale("+scaleX+","+scaleY+")"
						});
					});
				}
		}
		
		this.updateOnAddTool = updateOnAddTool;
	}
	//inherit from generic tool class
	mathFunction.prototype = new tool();
	
	//Initializing suffix object
	var mathFunc = new mathFunction();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'mathFunction'
	}
	
	mathFunc.init(initObject);
	
	//Adding suffix to editor
	eqeditor.prototype.mathFunction = mathFunc;
});