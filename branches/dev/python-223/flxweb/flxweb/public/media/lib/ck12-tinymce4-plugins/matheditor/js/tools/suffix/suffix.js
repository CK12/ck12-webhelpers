/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/suffix/suffix
 */
define(['text!tools/suffix/suffix.html','text!tools/suffix/suffix.css','tool'], function(markup,css,tool){
	/**
	 *Class for suffix tool.
	 *@class suffix
	 *@extends tool
	 */
	function suffix(){
		//tool specific implementation goes here
		/**
		 * Add description about function here.
		 * @function suffix#updateOnAddTool
		 */
		function updateOnAddTool(){
			if($('.supEdit').children().hasClass('divisionContainer')||$('.supEdit').children().hasClass('matrixContainer')){
				$('.supEdit').css('vertical-align','text-bottom');
			}
		}
		
		this.updateOnAddTool = updateOnAddTool;
	}
	
	//inherit from generic tool class
	suffix.prototype = new tool();
	
	//Initializing suffix object
	var suff = new suffix();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'suffix'
	}
	suff.init(initObject);
	
	//Adding suffix to editor
	eqeditor.prototype.suffix = suff;

});