/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/fraction/fraction
 */
define(['text!tools/fraction/fraction.html','text!tools/fraction/fraction.css','tool'], function(markup,css,tool){
	/**
	 * Class for fraction tool.
	 * @class fraction
	 * @extends tool
	 */
	function fraction(){
		//tool specific implementation goes here
	}
	
	//inherit from generic tool class
	fraction.prototype = new tool();
	
	//Initializing fraction object
	var frac = new fraction();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'fraction'
	}
	frac.init(initObject);
	
	//Adding fraction to editor
	eqeditor.prototype.fraction = frac;
});