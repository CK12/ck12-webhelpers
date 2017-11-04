/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module name of module
 */
define([], function(markup){
	/**
	 * Add description about class here.
	 * @class tool
	 */
	function tool(){
		var template = null,
			config = null,
			variationHtml = null;
		/**
		 * Add description about function here.
		 * @function tool#getTemplate
		 * @returns Add description about returned value.
		 */
		function getTemplate(){
			return template;
		}
		/**
		 * Add description about function here.
		 * @function tool#setTemplate
		 * @param element Add description about parameter. 
		 */
		function setTemplate(element){
			template = element;
		}
		/**
		 * Add description about function here.
		 * @function tool#getConfig
		 * @returns Add description about returned value.
		 */
		function getConfig(){
			return config;
		}
		/**
		 * Add description about function here.
		 * @function tool#setConfig
		 * @param path Add description about parameter.
		 */
		function setConfig(path){
			var configPath = 'js/tools/'+path+'/'+path+'Config.json';
			$.getJSON(configPath, function(data){
				if(data){
					config = data;
				}
				else{
					//util.log("error in fetching configuration data!");
				}
			});
		}
		/**
		 * Add description about function here.
		 * @function tool#getHtml
		 * @returns Add description about returned value. 
		 */
		function getHtml(){
			return variationHtml;
		}
		/**
		 * Add description about function here.
		 * @function tool#getHtml
		 */
		function setHtml(){
			variationHtml = $("#variationhtml",this.getTemplate()).html();
		}
		
		function createCss(css){
			var link = document.createElement("style");
		    link.innerHTML = css;
		    document.getElementsByTagName("head")[0].appendChild(link);
		}
		
		this.getTemplate = getTemplate;
		this.setTemplate = setTemplate;
		this.getConfig = getConfig;
		this.setConfig = setConfig;
		this.setHtml = setHtml;
		this.getHtml = getHtml;
		this.createCss = createCss;
	}
	
	/*tool.prototype.formulaHeaderHtml = function (){
		var markup = $("#formulaHeader",this.getTemplate()).html();
		
		return markup;
	};*/
	
	tool.prototype.getVariationHtml = function (){
		var markup = this.getHtml();								//Get variation HTML
		
		return markup;
	};
	
	tool.prototype.getEditableHtml = function (selectedFunction){
		var editableHtml= $("#editableHtml",this.getTemplate()),
		html = null;
		html = $("#"+selectedFunction,editableHtml).html();
		
		if(this.replaceTokens && typeof this.replaceTokens === 'function'){
			var htmlToReplace = {
				"selectedFunction" : selectedFunction,
				"html" : html
			}
			
			html = this.replaceTokens(htmlToReplace);
		}
		
		var fromulaTemplate = this.getFormulaTemplate(html);
		
		return fromulaTemplate;
	};
	
	tool.prototype.getFormulaTemplate = function(html){
		return {
			html : html,
			template : this.getConfig()
		};
	};
	
	tool.prototype.init = function(initObject){
		var markup = initObject.markup,
			toolFunc = initObject.tool,
			css = initObject.css;
		
		this.setTemplate($(markup));
		this.setConfig(toolFunc);
		this.setHtml();
		this.createCss(css);
		
		/*eqeditorObj.addTool(this.formulaHeaderHtml(),toolFunc);
		eqeditorObj.showToolVariations({
			event : 'click',
			callback : this,
			addToparent : toolFunc
		});*/
	};
	
	return tool;
});
