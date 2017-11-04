/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/bracket/bracket
 */


 define(['text!tools/bracket/bracket.html','text!tools/bracket/bracket.css','tool'], function(markup,css,tool){
	/**
	 * Class for bracket tool.
	 * @class bracket
	 * @extends tool
	 */
	
	function bracket(){
		var height = 14;
		/**
		 * Add description here.
		 * @function bracket~adjustFont
		 */
		function adjustFont(){
			var i,
				scaleY,
				scaleX;
			
			for(i=0;i<$('.parenthesesContainer').length;i++){
				height=parseInt($(this).prev().css('font-size'));
				scaleY = $($('.parenthesesContainer')[i]).height()/height;
				scaleX = (scaleY/3 > 1) ? scaleY/3 : 1;
				
				$($('.parenthesesContainer')[i]).find('.bracTrans').each(function(){
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
		
		/**
		 *@function bracket#updateOnAddTool
		 */

		function updateOnAddTool(){
			var i,
				scaleY,
				scaleX;
			for(var i=0;i<$('.parenthesesContainer').length;i++){
				/*$('.parenthesesContainer').each(function(){*/
					var scaleY = $($('.parenthesesContainer')[i]).height()/height,
					scaleX = (scaleY/3 > 1) ? scaleY/3 : 1;
					$($('.parenthesesContainer')[i]).find('.bracketTrans').each(function(){
						$(this).css({
							"webkitTransform":"scale("+scaleX+","+scaleY+")",
						    "MozTransform":"scale("+scaleX+","+scaleY+")",
						    "msTransform":"scale("+scaleX+","+scaleY+")",
						    "OTransform":"scale("+scaleX+","+scaleY+")",
						    "transform":"scale("+scaleX+","+scaleY+")"
						});
					});
				/*	$(this).siblings().last().css({
						"webkitTransform":"scale("+scaleX+","+scaleY+")",
					    "MozTransform":"scale("+scaleX+","+scaleY+")",
					    "msTransform":"scale("+scaleX+","+scaleY+")",
					    "OTransform":"scale("+scaleX+","+scaleY+")",
					    "transform":"scale("+scaleX+","+scaleY+")"
					});*/
				}
		}
		
		this.updateOnAddTool = updateOnAddTool;
		}
		
	/**
	 * @type {object}
	 * @extends tool
	 */
	//inherit from generic tool class
	bracket.prototype = new tool();
	
	//Initializing bracket object
	/**
	 * @type {object}
	 */
	var brac = new bracket();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'bracket'
	}
	brac.init(initObject);
	
	//Adding bracket to editor
	eqeditor.prototype.bracket = brac;
});