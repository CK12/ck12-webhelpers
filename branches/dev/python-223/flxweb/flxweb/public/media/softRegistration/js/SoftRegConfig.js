/**
* Stores the configuration for soft registration
*/
define( [] , function(){

	var singlePageRule = /forum(s)?|schools|ccss|ngss|standards|elementary-math(\/)?$|elementary-math-grade-[0-9](\/)?$|auth\//;
	var EventType =  {
		SOFT : 'raiseEventForSoftReg',
	 	HARD : 'raiseEventForHardReg',
	 	TRIGGER_REG : 'TRIGGER_REG',
	 	PAGE_ROUTE_CHANGE : 'PAGE_ROUTE_CHANGE',
	 	TRIGGER_UA_SUCCESS_POPUP:'TRIGGER_UA_SUCCESS_POPUP',
	 	CLOSE_REG : 'CLOSE_REG'
	};
	var pageType =  {
		ALL : 'ALL',
   		MODALITIES : 'MODALITIES'
	};
	var regType  =  {
		SOFT : 'SOFT',
   		HARD : 'HARD',
   		MIXED : 'MIXED' 
	};
	var softRegViewType =  {
		POPUP : 'POPUP',
		BANNER : 'BANNER',
		REDIRECTION : 'REDIRECTION'
	};
	var rule =  {
		'1' :  {'status' : 'IGNORE'},
	    '2' :  {'status' : 'SHOW', 'type' : 'BANNER'},
	    '3' :  {'status' : 'SHOW', 'type' : 'POPUP'},
	    '4' :  {'status' : 'CLOSE'}
	};

	var defaultModalityConfig =  {
		enabled : true,
		sleepTime : {  startTS :  0, endTS : 0 	},
		maxViewsInCycle : 2, // For Hard and Mixed Registration Types 
		minViewsInCycle : 0,
		modCountSteps : 0,  // -ve for decrementing the steps
		maxNoOfCycles : 1, // MAX no of Times when one cycle of counter needs to work. After that it no longer works in the session/forever
		regType :regType.SOFT, // SOFT, HARD , MIXED  
		storage : 'sessionStorage', // localStorage/sessionStorage
		shouldVisitedPageBeStored : false, // whether you want to count the already visited links
		pagesToConsider : pageType.ALL,  // what all pages need to be counted, ALL or only MODALITIES
		exemptedModalities : ['assessment','plix','simulations'],  // exempted modalities,
		cacheExpiry :  86400000, // time for which pageCount should be valid,
		shouldTriggerSRFromSEO :  false, // Whether to not show the first landing page from SEO ,
		shouldCountForSEORedirection : true, // whether to increase the counter if the user has landed from SEO,
    shouldCountForAddressBarAccess : true, // whether to increase the counter if the user has accessed the link via address bar
		enableCacheTTL : false, //should enable a TTL for cache,
		rule : rule,
		exemptedPaths: [/study-guides/],

	};

	var urlConfig =  {
		SIGNUP_COMPLETE_URL : 'https://'+document.location.hostname + '/auth/signup/',
		returnTo            : document.location.href,
        requestor           : document.location.protocol + '//'+document.location.hostname,
        FORGET_PASSWORD_URL : 'https://'+document.location.hostname + '/auth/forgot/password'
	};
	var getMessageProps =  function( arr ){
		if( Array.isArray( arr )){
			var len =  arr.length ;
			var max =  len -1 ;
			var min =  0;
			var random = Math.floor(Math.random()*(max-min+1)+min);
			return arr[random];
		}
		return null;
	}

	var bannerMsgPropsPrimaryArray = [
		'<b>It only takes a few seconds!</b>',
		'<b>Signing up only takes seconds!</b>'
	] ;

	var bannerMsgPropsSecondaryArray  = [
		'<b>We can tell you love to learn!</b> Our full set of <b>FREE</b> resources are accessible if you sign up.',
		'Create a <b>FREE</b> CK-12 account to access more high quality resources, including our interactive Simulations and PLIX.'
	];
	var valuePropMsgs =  [
			{
				'Teacher': [
					'Customize content to meet the needs of your students.',
					'Assign work and track student progress.',
					'Access interactives to further explore concepts.',
					'Ask and answer questions within a community of educators.',
					'Gain offline access to FlexBooks® and Simulations.'
				],
				'Student' : [
					'Play with simulations and interactives to learn concepts.',
					'Create study groups and get answers to questions.',
					'Use our highlighting and note-taking tools right on your screen.',
					'Access content and simulations offline.',
					'Practice and track your progress on the web or on your phone!'
				],
				'headerMsg': true
			},
			{
				'Teacher': [
					'Wish you had a place to ask questions, share ideas, and get help? ',
					'Looking for content to help you get started or redesign your class?',
					'Want to customize content to fit your specific course?',
					'Want a wider variety of resources, from videos to text to interactives?',
					'Need offline access to resources?',
				],
				'Student' : [
					'Need to study for a test while riding the bus or waiting for practice?',
					'Interested in joining an online study group to get help?',
					'Want to “learn-by-doing” with our interactive PLIX and Simulations?',
					'Hope to get better at a math or science skill?',
					'Wish you could “learn it your way” with full access to CK-12 resources?'
				],
				footerMsg : {
					'Teacher' : '… Sign up for free today to access all of this and more!',
					'Student' : '...Never lose a learning moment! Act now: Sign up for free today!'
				},
				'headerMsg': false
			}

	];

	var defaultViewConfig =  {
		'softRegView' : softRegViewType['BANNER'],
		valueProps : (function(){ return getMessageProps( valuePropMsgs )})(),
        disableDismissOnPopup : false,
        bannerMsgPropsSecondary: ( function(){ return getMessageProps(bannerMsgPropsSecondaryArray) })(),  //;"CK-12's mission is to provide high quality educational content to any student, anywhere in the world for FREE."
		bannerMsgPropsPrimary: (function(){ return getMessageProps(bannerMsgPropsPrimaryArray) })(),
	};

	var SEReferrerRegex =  [/\google/, /\yahoo/];

	return {
		EventType : EventType,
		pageType : pageType,
		regType : regType,
		softRegViewType : softRegViewType,
		urlConfig : urlConfig,
		defaultViewConfig : defaultViewConfig,
		defaultModalityConfig : defaultModalityConfig,
		SEReferrerRegex : SEReferrerRegex,
		singlePageRule: singlePageRule

	}
})
