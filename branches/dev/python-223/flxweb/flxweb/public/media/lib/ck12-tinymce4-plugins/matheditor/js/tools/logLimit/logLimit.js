/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/logLimit/logLimit
 */
define(['text!tools/logLimit/logLimit.html','text!tools/logLimit/logLimit.css','tool'], function(markup,css,tool){
	/**
	 *Class for logLimit tool.
	 *@class logLimit
	 *@extends tool
	 */
	function logLimit(){
		//tool specific implementation goes here
	}
	
	//inherit from generic tool class
	logLimit.prototype = new tool();
	
	//Initializing logLimit object
	var lgLimit = new logLimit();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'logLimit'
	}
	lgLimit.init(initObject);
	
	//Adding logLimit to editor
	eqeditor.prototype.logLimit = lgLimit;

});