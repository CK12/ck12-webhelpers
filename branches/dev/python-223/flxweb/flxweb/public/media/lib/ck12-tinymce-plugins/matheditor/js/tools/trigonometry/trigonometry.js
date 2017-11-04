/**

 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/trigonometry/trigonometry
 */
define(['text!tools/trigonometry/trigonometry.html','text!tools/trigonometry/trigonometry.css','tool'], function(markup,css,tool){
	/**
	 * Class for trigonometry tool
	 * @class trigonometry
	 * @extends tool
	 */
	function trigonometry(){
		/**
		 *Scaling for trigonometry tool.
		 * @function trigonometry#updateOnAddTool
		 * @param {object} input Input box inside function
		 */
		function updateOnAddTool(input){
			var height = 17;
			for(var i=0;i<$('.trigonometryParenthesesContainer').length;i++){
					var scaleY = $($('.trigonometryParenthesesContainer')[i]).height()/height,
					scaleX = (scaleY/3 > 1) ? scaleY/3 : 1;
					$($('.trigonometryParenthesesContainer')[i]).find('.bracTrans').each(function(){
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
	trigonometry.prototype = new tool();
	
	//Initializing suffix object
	var mathFunc = new trigonometry();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'trigonometry'
	}
	
	mathFunc.init(initObject);
	
	//Adding suffix to editor
	eqeditor.prototype.trigonometry = mathFunc;
});