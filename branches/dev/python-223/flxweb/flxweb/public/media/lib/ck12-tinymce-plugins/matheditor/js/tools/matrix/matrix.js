/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools/matrix/matrix
 */
define(['text!tools/matrix/matrix.html','text!tools/matrix/matrix.css','tool'], function(markup,css,tool){
	/**
	 *  Class for matrix tool
	 * @class matrix
	 * @extends tool
	 */
	function matrix() {
		var height = 14;
		/**
		 * Add description about function here.
		 * @function matrix#replaceTokens
		 * @param {object} htmlToReplace Contains the html to be replaced and the matrix variation name.
		 * @returns {String} html Html of the selected matrix variation.
		 */		
		function replaceTokens(htmlToReplace) {
			var selectedFunction = htmlToReplace.selectedFunction,
				html = htmlToReplace.html;
			eqeditorObj.matrixRowCounter = eqeditorObj.matrixRowCounter + 1;
			
			switch (selectedFunction) {
				case 'unbracketedMatrix1X2':
					html = html;
					break;

				case 'unbracketedMatrix2X1':
					html = html.replace(/@@matrixRowCounter@@/g,eqeditorObj.matrixRowCounter);
					break;

				case 'unbracketedMatrix1X3':
					html = html;
					break;

				case 'unbracketedMatrix3X1':
					html = html.replace(/@@matrixRowCounter@@/g,eqeditorObj.matrixRowCounter);
					break;

				case 'unbracketedMatrix2X2':
					html = html.replace(/@@matrixRowCounter@@/g,eqeditorObj.matrixRowCounter);
					html = html.replace(/@@matrixRowCounterPlusOne@@/g, eqeditorObj.matrixRowCounter + 1);
					eqeditorObj.matrixRowCounter = eqeditorObj.matrixRowCounter + 1;
					break;

				case 'unbracketedMatrix2X3':
					html = html.replace(/@@matrixRowCounter@@/g,eqeditorObj.matrixRowCounter);
					html = html.replace(/@@matrixRowCounterPlusOne@@/g, eqeditorObj.matrixRowCounter + 1);
					html = html.replace(/@@matrixRowCounterPlusTwo@@/g, eqeditorObj.matrixRowCounter + 2);
					eqeditorObj.matrixRowCounter = eqeditorObj.matrixRowCounter + 2;
					break;

				case 'unbracketedMatrix3X2':
					html = html.replace(/@@matrixRowCounter@@/g,eqeditorObj.matrixRowCounter);
					html = html.replace(/@@matrixRowCounterPlusOne@@/g, eqeditorObj.matrixRowCounter + 1);
					eqeditorObj.matrixRowCounter = eqeditorObj.matrixRowCounter + 1;
					break;
			}
			
			return html;
		}
		/**
		 * Add description about function here.
		 * @function matrix#updateOnWriteTool
		 * @param input Add description about input parameter here.
		 */

		function updateOnWriteTool(input) {
			var toolToUpdate = [], matrixId = [];
			
			$($(input).parents().not(':last').not(':last')).each(function(i, v) {
								if ($(this).attr('class').match(/(matrixRow_)[\d]+?$/gi) !== null && $(this).attr('class').match(/(matrixRow_)[\d]+?$/gi) !== undefined) {
									toolToUpdate.push(($(this).attr('class').match(/(matrixRow_)[\d]+?$/gi)).toString());
								}
			});
			
			for ( var i = 0; i < toolToUpdate.length; i++) {
				matrixId.push(toolToUpdate[i].toString().split("matrixRow_")[1]);
			}
			
			for ( var i = 0; i <= matrixId.length; i++) {
				$('.matrixRow_' + matrixId[i]).css({
					'min-width' : 0	
				});
				
				var maxWidth = 0;
				
				$('.matrixRow_' + matrixId[i]).each(function(key) {
					maxWidth = $(this).width() > maxWidth ? $(this).width() : maxWidth;
				});
				
				$('.matrixRow_' + matrixId[i]).css({
					'min-width' : maxWidth
				});
			}
		}
		/**
		 * Add description about function here.
		 * @function matrix#updateOnAddTool
		 */

		function updateOnAddTool() {
			var i,
			scaleY,
			scaleX;
		for(var i=0;i<$('.bracketContainer').length;i++){
			/*$('.parenthesesContainer').each(function(){*/
				var scaleY = $($('.bracketContainer')[i]).height()/height,
				scaleX = (scaleY/3 > 1) ? scaleY/3 : 1;
				$($('.bracketContainer')[i]).find('.bracketTransMat').each(function(){
					$(this).css({
						"webkitTransform":"scale("+scaleX+","+scaleY+")",
					    "MozTransform":"scale("+scaleX+","+scaleY+")",
					    "msTransform":"scale("+scaleX+","+scaleY+")",
					    "OTransform":"scale("+scaleX+","+scaleY+")",
					    "transform":"scale("+scaleX+","+scaleY+")"
					});
				});
			}
			for ( var i = 1; i <= eqeditorObj.matrixRowCounter; i++) {
				$('.matrixRow_' + i).css({
					'min-width' : 0
				});
				
				var maxWidth = 0;
				
				$('.matrixRow_' + i).each(function(key) {
						maxWidth = $(this).width() > maxWidth ? $(this).width() : maxWidth;
				});
				
				$('.matrixRow_' + i).css({
					'min-width' : maxWidth
				});
			}
			
		}

		this.updateOnAddTool = updateOnAddTool;
		this.updateOnWriteTool = updateOnWriteTool;
		this.replaceTokens = replaceTokens;
		
		
	}

	
	//inherit from generic tool class
	matrix.prototype = new tool();
	
	//Initializing matrix object
	var matt = new matrix();
	var initObject={
			"markup":markup,
			"css":css,
			"tool":'matrix'
	}
	matt.init(initObject);
	
	//Adding matrix to editor
	eqeditor.prototype.matrix = matt;

});