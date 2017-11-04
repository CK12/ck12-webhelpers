define([], function(){

	var  STORAGE_CURRENT_PAGE_VIEW_COUNT = 'currentPageVCount', // key to store the current page view count,
		 STORAGE_CURR_COUNT_EXPIRY_TS =  'pageVCountExpiryTS',  // key to store the expiry TS
	 	 STORAGE_MAX_VIEWS_IN_CYCLE =  'maxVInCycle', // key to store the max-views in current cycle
		 STORAGE_VIEW_PATH_ARR = 'viewPathArr', // key to store the pathname of current visited pages 
		 STORAGE_CYCLES_COMPLETED = 'cyclesCompleted', // key to store number of number of view cycles completed,
		 STORAGE_SHOULD_DISABLE_SOFT_REG = 'disableSoftReg',
		 SESSION_TRIGGERED_FROM_SEO = 'sessionTriggeredFromSEO',
	     storage,  // global storage object
	     config,
	     isStorageAllowed = true;

	var initialize =  function(_config){
		config  =  _config;
		storage =  window[ config.storage ];
		(function(){
			try{
				setInStorageByKey('testItem','abc');
				clearStorageByKey('testItem');
			}catch(e){
				isStorageAllowed = false;
			}
		})()
	}

	

	// APIs for count expiry TS

	var saveCountExpiryTS  =  function(){
		setInStorageByKey(STORAGE_CURR_COUNT_EXPIRY_TS, Date.now()+ config.cacheExpiry);
	};

	var clearCountExpiryTS =  function(){
		clearStorageByKey(STORAGE_CURR_COUNT_EXPIRY_TS);
	};

	var getCountExpiryTS  =  function(){
		return parseInt( getItemFromStorageByKey(STORAGE_CURR_COUNT_EXPIRY_TS)) || Number.MAX_VALUE ;
	};

	// APIs for Modality Count
	var saveModalitiesCount =  function(count){
		setInStorageByKey(STORAGE_CURRENT_PAGE_VIEW_COUNT,count)	
	};

	var clearModalitiesCount  =  function(){
		clearStorageByKey(STORAGE_CURRENT_PAGE_VIEW_COUNT);
	};

	var getViewCount =  function(){
		return parseInt(getItemFromStorageByKey(STORAGE_CURRENT_PAGE_VIEW_COUNT)) || 0;
	};

	// APIs for Modality Path Array
	var saveModalitiesArray =  function(array){
		setInStorageByKey(STORAGE_VIEW_PATH_ARR,JSON.stringify(array));	
	};

	var clearModalitiesArray  =  function(){
		clearStorageByKey(STORAGE_VIEW_PATH_ARR);
	};

	var getModalitiesArray =  function(){
		return JSON.parse(getItemFromStorageByKey(STORAGE_VIEW_PATH_ARR)) || [];
	};

	// max Views in cycle 

	var setMaxViewsInCycle =  function(val){
		setInStorageByKey(STORAGE_MAX_VIEWS_IN_CYCLE , val);
	};

	var getMaxViewsInCycle =  function(){
		return getItemFromStorageByKey(STORAGE_MAX_VIEWS_IN_CYCLE);
	};

	// cycles completed 

	var setCyclesCompleted  = function(val){
		setInStorageByKey(STORAGE_CYCLES_COMPLETED, val);
	};

	var getCyclesCompleted =  function(){
		return parseInt(getItemFromStorageByKey(STORAGE_CYCLES_COMPLETED));
	};


	// disable soft registration to execute after a certain count

	var setShouldDisableSoftReg =  function(flag){
		setInStorageByKey(STORAGE_SHOULD_DISABLE_SOFT_REG, flag);
	};

	var getShouldDisableSoftReg  = function(){
		return getItemFromStorageByKey(STORAGE_SHOULD_DISABLE_SOFT_REG);
	};
	var clearShouldDisableSoftReg =  function(){
		clearStorageByKey(STORAGE_SHOULD_DISABLE_SOFT_REG);
	}

	var sessionTriggeredFromSEO =  function(){
		setInStorageByKey(SESSION_TRIGGERED_FROM_SEO, true);
	};
	var hasSessionTriggeredFromSEO =  function(){
		return getItemFromStorageByKey(SESSION_TRIGGERED_FROM_SEO);
	};
  var clearSessionTriggeredFromSEO =  function(){
		 clearStorageByKey(SESSION_TRIGGERED_FROM_SEO);
	};

	// Generic Methods for accessing persistance 
	var clearStorageByKey  = function(key){
		storage.removeItem(key);
	};
	var setInStorageByKey =  function(key, val){
		if( isStorageAllowed )
		   storage.setItem(key, val);
	};
	var getItemFromStorageByKey =  function(key){
		return storage.getItem(key);
	};

	return {
		initialize       : initialize,
		// expiry TS
		saveCountExpiryTS  : saveCountExpiryTS,
		clearCountExpiryTS : clearCountExpiryTS,
		getCountExpiryTS   : getCountExpiryTS,
		// page count
		saveModalitiesCount : saveModalitiesCount,
		clearModalitiesCount : clearModalitiesCount,
		getViewCount : getViewCount,
		// page array
		saveModalitiesArray : saveModalitiesArray,
		clearModalitiesArray : clearModalitiesArray,
		getModalitiesArray : getModalitiesArray,
		// max views in cycle , TODO : Remove after a while
		setMaxViewsInCycle : setMaxViewsInCycle,
		getMaxViewsInCycle : getMaxViewsInCycle,
		// cycles completed , TODO : Remove after a while
		setCyclesCompleted : setCyclesCompleted,
		getCyclesCompleted : getCyclesCompleted,

		//disable soft registration

		setShouldDisableSoftReg :  setShouldDisableSoftReg,
		getShouldDisableSoftReg :  getShouldDisableSoftReg,
		clearShouldDisableSoftReg : clearShouldDisableSoftReg,

		//
		sessionTriggeredFromSEO : sessionTriggeredFromSEO,
		hasSessionTriggeredFromSEO : hasSessionTriggeredFromSEO,
    clearSessionTriggeredFromSEO : clearSessionTriggeredFromSEO
	}

})
