/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module text!tools
 */
define(['text!tools/toolsHeader.html','text!tools/toolsHeader.css'], function(toolsHeaderHTML,toolsHeaderCSS){
	var link = document.createElement("style");
    link.innerHTML = toolsHeaderCSS;
    document.getElementsByTagName("head")[0].appendChild(link);
	$.each(($(toolsHeaderHTML).find('div.formula-container')), function(i,v){
    	var $this = $(this);
    	eqeditorObj.addTool(this.outerHTML,$this.attr('formula'));
	});
	eqeditorObj.bindClickEvent();
});