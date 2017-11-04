/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/symbol/symbol
 */
define(['text!tools/symbol/symbol.html','text!tools/symbol/symbol.css','tool'], function(markup,css,tool){
	/**
	 * Class for symbol tool.
	 * @class symbol
	 * @extends tool
	 */
	function symbol(){
		/**
		 * Scales the symbol tool
		 * @function symbol#updateOnAddTool
		 */
		
		function updateOnAddTool(){
			var width=18;
			$('.specialCharacterCont').each(function(){
				var scaleY = (scaleY/3 > 1) ? scaleY/3 : 1;
				scaleX = $(this).width()/width;
				/*if($(this).hasClass('botharrowOverExpressionContainer')){
					var scaleVal= $(this).width()-($(this).find('.arrowLeft').width()+$(this).find('.arrowRight').width());
					scaleX =scaleVal/width;
				}else{
					scaleX = $(this).width()/width;
				} */
				$(this).find('.baseScale').css({
					"webkitTransform":"scale("+scaleX+","+scaleY+")",
				    "MozTransform":"scale("+scaleX+","+scaleY+")",
				    "msTransform":"scale("+scaleX+","+scaleY+")",
				    "OTransform":"scale("+scaleX+","+scaleY+")",
				    "transform":"scale("+scaleX+","+scaleY+")"
				});
				/*$(this).find('.arrowLeft').css('left',Math.min('-'+Math.ceil(scaleX/5),-1));
				if(parseInt($(this).find('.arrowLeft').css('left'))<-10){
					$(this).find('.arrowLeft').css('left','-10px');
				}*/
			});
		}
		
		this.updateOnAddTool = updateOnAddTool;
	}
	//inherit from generic tool class
	symbol.prototype = new tool();
	
	//Initializing symbol object
	var sym = new symbol();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'symbol'
	}
	sym.init(initObject);
	
	//Adding fraction to editor
	eqeditor.prototype.symbol = sym;
});