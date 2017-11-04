define([
	'jquery',
	], function( $ ){

	//define the rules by 

	/**
	* First page should be ignored if it is coming from SEO
	* First page needs to be counted if it is not coming from SE)
	* For second page , we need to show a reg banner
	* For third page , we need to show a reg popup 
	* For subsequent pages, we need not block anything 
	*
	* rules should be defined as a map 
	*     {
	*      1 :  ['status' : 'IGNORE'],
	*      2 :  ['status' : 'SHOW', 'type' : 'BANNER'],
	*      3 :  ['status' : 'SHOW' ,'type' : 'POPUP'],
	*      4 :  ['status' : 'CLOSE']
 	*	  }
	*
 	*  or 
 	*  if the rule is like this : 
 	*  First page should be ignored
 	*  Second page needs to show banner
 	*  Third page needs to  show banner  
 	*  Fourth page should be ignored 
 	*  Fifth page needs to show banner
 	*  Sixth page needs to show banner
 	*  Seventh page needs to close
 	*    {
	*      1 :  ['status' : 'IGNORE'],
	*      2 :  ['status' : 'SHOW', 'type' : 'BANNER'],
	*      3 :  ['status' : 'SHOW' ,'type' : 'BANNER'],
	*      7 :  ['status' : 'CLOSE'],
	*      repeat : 2
 	*    }
	*
	*/
	var config,
	    isFeatureDisabled;

	var initialize =  function(_config){
		config = _config;
	};
	var RuleOrchestrator =  function(){
		var rule =  config.rule;
		// based on the rules, it returns an enum flag 
		// PRE-SHOW
		// SHOW 
		// CLOSE
		// POST-SHOW
		var currentViewCount = this.getViewCount();
		if( rule[currentViewCount] ) return rule[currentViewCount];

		return [];

	};

	//define what is the exemption rule for pages to not be counted 

	var ExemptionOrchestrator =  function(params){
		return (params[0] && config.exemptedModalities.indexOf( params[0]) != -1)|| 
		        (function(){
		        	var isExempted = false,
		        	path = location.pathname;

		        	if( Array.isArray(config.exemptedPaths )){
		        		var rule;
		        		for( var i =0, len = config.exemptedPaths.length; i < len; i++){
		        			rule = config.exemptedPaths[i];
		        			if( rule instanceof RegExp){
		        				isExempted = rule.test(path);
		        			}else if( typeof rule == 'string'){
		        				isExempted = (rule == path);
		        			}
		        			if( isExempted ){
		        				break;
		        			}
		        		}
		        		// config.exemptedPaths.indexOf(location.pathname) != -1; //  this rule needs to change 
		        	}else if ( config.exemptedPaths instanceof RegExp ){
		        		isExempted =  config.exemptedPaths.tets(path);
		        	}else if( typeof config.exemptedPaths == 'string'){
		        		isExempted = config.exemptedPaths == path;
		        	}
		        	return isExempted;
		        })();	
	};

	var _checkSleepDurationEnabled =  function(){

		var ts  = Date.now();
		if(config.sleepTime && config.sleepTime.startTS > 0  && config.sleepTime.endTS > 0 ){
				return ts >=  config.sleepTime.startTS  && ts <= config.sleepTime.endTS;
		}else{
			return false;
		}
	};

	var DisableRule =  function(latestConfig){

		// If either of these condition becomes true then it is disabled
		// 1. Either it is not enabled
		// 2. If TS falls in the sleep duration given
		if( typeof isFeatureDisabled == 'undefined'){
				isFeatureDisabled = !config.enabled ||  ( _checkSleepDurationEnabled.call(this) ) 
										|| deviceRule() || iframeRule() || productRule();
		} 
		return isFeatureDisabled; 
	};

	var deviceRule = function(){
		//TODO Modernizr is a global object 
		return  userAgentRule() ||
		        viewPortRule();
		
	};
	var iframeRule =  function(){
		var shouldDisableForIframe =  window.top !== window;
		console.warn( 'is the feature in iframe', shouldDisableForIframe);
		return shouldDisableForIframe; 
	};
	
	var viewPortRule =  function(){
		var shouldDisableForViewport =  Modernizr.mq('(max-width: 1024px) and (max-height:768px)') || Modernizr.mq('(max-height:668px)');
		console.warn( 'is the feature disabled for viewport size ', shouldDisableForViewport);
		return shouldDisableForViewport;
	};

	var userAgentRule =  function(){
		// Ref: http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
		return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) ;
	};

	var productRule =  function(){
		// added for not displaying the ER when the concept banner overlay is active
		return $.cookie('seenConceptmapTutorial') == null && ( (/\?view=mapview/.test(location.search ) || (/conceptmap/.test( location.pathname))));
	}


	return {
		RuleOrchestrator : RuleOrchestrator,
		ExemptionOrchestrator : ExemptionOrchestrator,
		DisableRule : DisableRule,
		initialize : initialize
	};
})