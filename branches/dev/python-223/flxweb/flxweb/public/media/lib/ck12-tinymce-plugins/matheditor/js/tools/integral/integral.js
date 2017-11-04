/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/integral/integral
 */
define(['text!tools/integral/integral.html','text!tools/integral/integral.css','tool'], function(markup,css,tool){
	/**
	 * Class for integral tool
	 * @class integral
	 * @extends tool
	 */
	function integral(){
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
	integral.prototype = new tool();
	
	//Initializing integral object
	var inte = new integral();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'integral'
	}
	inte.init(initObject);
	
	//Adding integral to editor
	eqeditor.prototype.integral = inte;
	
});