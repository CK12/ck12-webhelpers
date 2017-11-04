
function isAppInfoExpired(created, expiry){
    let tsnow = Date.now();
    if ( (((tsnow - created)/1000/60) < expiry)) {
        return false;
    }
    return true;
}

function getAppInfoSessionStorage(key){
    let appInfo = '';
    try {
        appInfo = JSON.parse(sessionStorage.getItem(key));
    } catch (e) {
        console.log('Error getting app info sessin storage:'+ String(e))
    }
    return appInfo;
}

function getAppInfoLocalStorage(key, expiry=0){
    let appInfo = {};
    try {
        let lsAppInfo = JSON.parse(localStorage.getItem(key));
	if ( !isAppInfoExpired(appInfo.created, expiry)) {
	    appInfo = lsAppInfo;
	} else {
	    localStorage.removeItem(key);
	}
    } catch (e) {
        console.log('Error getting app info local storage:'+ String(e))
    }
    return appInfo;
}

/**
 * Get app info from session storage or local storage
 *
 * @param {string} Name of key
 */
function getAppInfo(key, expiry_time){
    let appInfo = {};
    if (key){
        appInfo = getAppInfoSessionStorage(key);
	if (!appInfo){ 
	    appInfo = getAppInfoLocalStorage(key, expiry_time);
        }
    }
    return appInfo;
}

export {getAppInfo};
