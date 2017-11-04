/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/mathOperatorsymbol/mathOperatorsymbol
 */
define(['text!tools/shapeSymbol/shapeSymbol.html','text!tools/shapeSymbol/shapeSymbol.css','tool'], function(markup,css,tool){
	/**
	 *Class for mathOperatorSymbol tool.
	 *@class mathOperatorSymbol
	 *@extends tool
	 */
	function shapeSymbol(){
		//tool specific implementation goes here
		
	}
	
	//inherit from generic tool class
	shapeSymbol.prototype = new tool();
	
	//Initializing mathOperatorsymbol object
	var shape = new shapeSymbol();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'shapeSymbol'
	}
	shape.init(initObject);
	
	//Adding mathOperatorSymbol to editor
	eqeditor.prototype.shapeSymbol = shape;

});