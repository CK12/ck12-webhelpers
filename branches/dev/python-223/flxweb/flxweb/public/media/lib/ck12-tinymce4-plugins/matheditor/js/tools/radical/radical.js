/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/radical/radical
 */
define(['text!tools/radical/radical.html','text!tools/radical/radical.css','tool'], function(markup,css,tool){
	/**
	 * Class for radical tool.
	 * @class radical
	 * @extends tool.
	 */
	function radical(){
		var height = 13.5;
		/**
		 * Add description about function here.
		 * @function radical~adjustHeight
		 */
		function adjustHeight(){
			$('.roottop').each(function(){
				$(this).prev().css({'font-size':$(this).height()+"px"});
				$(this).css('border-top-width',$(this).height()/28+1);
			});
		}
		/**
		 * Add description about function here.
		 * @function radical#updateOnTool
		 */
		function updateOnAddTool(){
			$('.roottop').each(function(){
				//var scaleY = ($(this).height()/  $(this).prev().height())-($(this).height()/  $(this).prev().height())/11,
				height=parseInt($(this).prev().css('font-size'))+0.9;
				var scaleY=$(this).height()/height,
				/*var scaleY=$(this).height()/($(this).prev().height()+1),*/
					scaleX = (scaleY/3 > 1) ? scaleY/3 : 1;
				
				$(this).prev().css({
					"webkitTransform":"scale("+scaleX+","+scaleY+")",
				    "MozTransform":"scale("+scaleX+","+scaleY+")",
				    "msTransform":"scale("+scaleX+","+scaleY+")",
				    "OTransform":"scale("+scaleX+","+scaleY+")",
				    "transform":"scale("+scaleX+","+scaleY+")"
				});
			});
		}
		
		this.updateOnAddTool = updateOnAddTool;
	}
	//inherit from generic tool class
	radical.prototype = new tool();
	
	//Initializing radical object
	var rad = new radical();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'radical'
	}
	rad.init(initObject);
	
	//Adding radical to editor
	eqeditor.prototype.radical = rad;

});