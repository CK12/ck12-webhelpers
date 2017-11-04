function mathpreview(){

	function mathjaxInitializtion(){
		var script = document.createElement("script");
		
		script.id = "mathLoader";
	    script.type = "text/javascript";
	    script.src = "//d3lkjnwva6z405.cloudfront.net/mathjax-min-2.6-20160201/MathJax.js";
	    
	    var config = 'MathJax.Hub.Config({' +
	                   'extensions: ["tex2jax.js","TeX/AMSmath.js","TeX/AMSsymbols.js"],' +
	                   'tex2jax: {'+
	                   		'inlineMath: [["@$","@$"]],'+
	                   		'displayMath: [["@$$","@$$"]],'+
	                   		'skipTags: ["script","noscript","style","textarea","code"]'+
	                	    '},'+
	                	    'showMathMenu: false ,'+
	                   'jax: ["input/TeX","output/HTML-CSS"],' +
	                   'TeX: {'+
	                   		'extensions: ["cancel.js", "color.js", "autoload-all.js"]'+
	                   	'}'+
	                 '});' ;
	    				
	    if (window.opera) {
	    	script.innerHTML = config
	    }
	    else {
	    	script.text = config
	    }
	
	    document.getElementsByTagName("head")[0].appendChild(script); 
	}
	
	function renderMath(container){
		//For cases where mathJAX is not loaded and renderMath call is initiated
		if(typeof MathJax === 'undefined'){
			$("#mathLoader").load(function(){
				renderMathEquation(container);
			});
		}
		else{
			renderMathEquation(container);
		}
	}
	
	function renderMathEquation(container){
		var mathElement,
			tex,
			QUEUE = MathJax.Hub.queue,
			mathElements = [],
			x,
			target;
		
		mathElements = $('.x-ck12-mathEditor' ,container);
		
		for(x=0; x < mathElements.length; x++){
			mathId = $(mathElements[x]).attr('id');
			tex = $('#'+mathId).attr('tex');
			fontSize = $('#'+mathId).children().eq(0).css('fontSize');
			$('#'+mathId).removeAttr('tex');
			$('#'+mathId).removeAttr('edithtml');
			//$('#'+mathId).html('$'+tex+'$');
		
			MathJax.Hub.Queue(["Typeset",MathJax.Hub,mathId]);
			//$('#'+mathId).css('fontSize',fontSize);
		}
	}
	
	//mathjaxInitializtion();
	this.renderMath = renderMath;
}

var mathpreview = new mathpreview();
