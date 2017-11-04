/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module util
 */
define([],function (){
	/**
	 * Add description about class here.
	 * @class util
	 */
function util(){
	
	function getLatex(input)
	{
		var itemtoInsert = [];
			
		var	splCharObj = new Object;
		
		splCharObj = {
			'{'	:	'\\{',
			'^'	:	'\\wedge ',
			'}' :   '\\}',
			'#' :   '\\#',
			'%' :   '\\%',
			'_' :   '\\_',
			'&' :	'\\&'
		};
		$.each(input, function (index, value) {
			itemtoInsert.push((splCharObj[value] !== undefined) ? splCharObj[value] : value);
		});
		return itemtoInsert.join("");
	}
	
	function getUID(a){
		return a ? (a ^ Math.random() * 16 >> a / 4).toString(16).toUpperCase() : ([1e7] + -2e3 + -4e3 + -8e3 + -1e11).replace(/[014]/g, this.getUID);
	}
	
	function log(msg){
		if(typeof console !== "undefined"){
			//console.log(msg);
		}
	}
	
	this.getLatex=getLatex;
	this.getUID = getUID;
	this.log = log;
	}
	window.util = new util();
});


