/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/greekSymbol/greekSymbol
 */
define(['text!tools/greekSymbol/greekSymbol.html','text!tools/greekSymbol/greekSymbol.css','tool'], function(markup,css,tool){
	/**
	 *Class for greekSymbol tool.
	 *@class greekSymbol
	 *@extends tool
	 */
	function greekSymbol(){
		//tool specific implementation goes here
	}
	
	//inherit from generic tool class
	greekSymbol.prototype = new tool();
	
	//Initializing greekSymbol object
	var gkSymbol = new greekSymbol();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'greekSymbol'
	}
	gkSymbol.init(initObject);
	
	//Adding greekSymbol to editor
	eqeditor.prototype.greekSymbol = gkSymbol;

});