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