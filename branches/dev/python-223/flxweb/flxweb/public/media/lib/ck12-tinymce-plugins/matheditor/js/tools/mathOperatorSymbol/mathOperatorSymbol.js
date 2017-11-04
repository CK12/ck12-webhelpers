/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/mathOperatorsymbol/mathOperatorsymbol
 */
define(['text!tools/mathOperatorSymbol/mathOperatorSymbol.html','text!tools/mathOperatorSymbol/mathOperatorSymbol.css','tool'], function(markup,css,tool){
	/**
	 *Class for mathOperatorSymbol tool.
	 *@class mathOperatorSymbol
	 *@extends tool
	 */
	function mathOperatorSymbol(){
		//tool specific implementation goes here
		
	}
	
	//inherit from generic tool class
	mathOperatorSymbol.prototype = new tool();
	
	//Initializing mathOperatorsymbol object
	var mathOperator = new mathOperatorSymbol();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'mathOperatorSymbol'
	}
	mathOperator.init(initObject);
	
	//Adding mathOperatorSymbol to editor
	eqeditor.prototype.mathOperatorSymbol = mathOperator;

});