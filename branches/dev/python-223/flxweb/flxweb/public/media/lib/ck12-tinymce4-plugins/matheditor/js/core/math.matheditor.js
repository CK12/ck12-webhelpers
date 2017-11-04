/**
 * @fileoverview Add description about file.
 * @copyright copyright
 * @author Name of author
 * @license license
 * @version 0.0.0
 * @module name of module
 */
define([],function (){
	/**
	 * Add description about class here.
	 * @class MathEditor
	 */
	function MathEditor(){
		/**
		 * Add description about function here.
		 * @function MathEditor~mathjaxInitializtion
		 */
		function mathjaxInitializtion(){
			var script = document.createElement("script");
			
		    script.type = "text/javascript";
		    script.src = "//d3lkjnwva6z405.cloudfront.net/mathjax-min-2.6-20160201/MathJax.js";
		    
		    var config = 'MathJax.Hub.Config({' +
		    	'styles: {'+
		    		'"#MathJax_MSIE_Frame": {'+
		    			'"position": "static",'+
		    			'"height": "0",'+
		    			'"overflow": "hidden",'+
		    			'"visibility": "hidden",'+
		    			'"display": "none"'+
		    		'}'+
		    	'},'+
		    	'extensions: ["tex2jax.js","TeX/AMSmath.js","TeX/AMSsymbols.js"],' +
		    	'tex2jax: {'+
		    		'inlineMath: [["@$","@$"]],'+
		    		'skipTags: ["script","noscript","style","textarea","code"]'+
		    	'},'+
		    	'showMathMenu: false ,'+
		    	'jax: ["input/TeX","output/HTML-CSS"],' +
		    	'messageStyle: "none",' +
		    	'TeX: {'+
		    		'extensions: ["cancel.js", "color.js"]'+
		    	'},'+
		    	'"HTML-CSS": {'+
		    	   	'scale: 100'+
		    	'}'+
		    '});'+
		    'MathJax.Hub.Queue(function(){'+
				'require(["core/app"]);' + 
			'})';
		    				
		    if (window.opera) {
		    	script.innerHTML = config
		    }
		    else {
		    	script.text = config
		    }

		    document.getElementsByTagName("head")[0].appendChild(script); 
		}
		/**
		 * Add description about function here.
		 * @function MathEditor~mathjaxInitializtion
		 * @param options  Add description about parameter.
		 */
		
		function toolregistration(options){
			var toolbar = (options && options.toolbar)? options.toolbar: [],
				toolbarObj;
			
			for(var i=0; i<toolbar.length; i++){
				var url = "tools/"+ toolbar[i]+ "/"+toolbar[i];
				
				require([url],function(){
					var toolsLoaded = Object.keys(eqeditorObj.getFormulaHeader()).length;
					if(toolsLoaded === toolbar.length){
						toolbarObj = {
							"headerObj" : eqeditorObj.getFormulaHeader(),
							"toolbar" : toolbar
						}	
						loadFormulaHeader(toolbarObj);
					}
				});
			}
		}
		/**
		 * Add description about function here.
		 * @function MathEditor#mathjaxInitializtion
		 * @param options Add description about parameter.
		 */
		function init(options){
			mathjaxInitializtion();
			toolregistration(options);	
		}
		
		function loadFormulaHeader(toolbarObj){
			var headerObj = toolbarObj.headerObj,
				toolbar = toolbarObj.toolbar,
				toolHeaderHtml;
			for(var i=0; i<toolbar.length; i++){
				toolHeaderHtml = headerObj[toolbar[i]];
				$('.formulacontainer').append(toolHeaderHtml);
			}
		}
		
		this.init = init;
	}
	
	return new MathEditor();
});
