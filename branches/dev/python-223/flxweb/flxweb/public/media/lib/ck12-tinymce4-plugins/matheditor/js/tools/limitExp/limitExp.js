/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/limitExp/limitExp
 */
define(['text!tools/limitExp/limitExp.html','text!tools/limitExp/limitExp.css','tool'], function(markup,css,tool){
	/**
	 *Class for limitExp tool.
	 *@class limitExp
	 *@extends tool
	 */
	function limitExp(){
		//tool specific implementation goes here
	}
	
	//inherit from generic tool class
	limitExp.prototype = new tool();
	
	//Initializing limitExp object
	var lgLimit = new limitExp();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'limitExp'
	}
	lgLimit.init(initObject);
	
	//Adding limitExp to editor
	eqeditor.prototype.limitExp = lgLimit;

});