/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/operator/operator
 */
define(['text!tools/operator/operator.html','text!tools/operator/operator.css','tool'], function(markup,css,tool){
	/**
	 * Class for operator tool
	 * @class operator
	 * @extends tool
	 */
	function operator(){
		
	}
	//inherit from generic tool class
	operator.prototype = new tool();
	
	//Initializing operator object
	var op = new operator();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'operator'
	}
	op.init(initObject);
	
	//Adding operator to editor
	eqeditor.prototype.operator = op;

});