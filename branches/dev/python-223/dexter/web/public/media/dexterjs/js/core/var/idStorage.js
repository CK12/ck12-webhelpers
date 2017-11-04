define([
    "../../var/default_configuration",
    "../../var/getCookie",
    "../../var/bakeCookie",
    "../../var/getRandomString"
], function(default_configuration,getCookie,bakeCookie,getRandomString) {
    return (function(){
            var config = default_configuration;
            var useCookies = (document.location.protocol.indexOf("http") !== -1) ? true : false;
            
            /** @private */
            function saveId(type,id) {
                if (useCookies){
                    document.cookie = bakeCookie(config.clientStorage[type], id);
                } else {
                    localStorage[config.clientStorage[type].name] = JSON.stringify({
                        "id" : id,
                        "expiry" : new Date().getTime() + config.clientStorage[type]["max-age"]*1000 
                    });
                }
            };

            /** @private */
            function getIdFromLocalStorage(key) {
                var currentTime = new Date().getTime();
                try {
                    var storedObj = JSON.parse(localStorage[key]);
                    if (storedObj && (storedObj.expiry > currentTime)){
                        return storedObj.id;
                    }
                } catch (e){
                    console.debug("Invalid JSON stored in localStorage");
                }
                
            };

            /** @private */
            function getId(type){
                var id;
                if (useCookies){
                    id = getCookie(config.clientStorage[type].name);
                } else {
                    id = getIdFromLocalStorage(config.clientStorage[type].name);
                }
                id = id || generateAndStoreId(type);
                return id;
            };

            /** @private */
            function generateAndStoreId(type){
                var id = getRandomString(25);
                saveId(type,id);
                return id;
            };

            function getVisitorId(){
                return getId("visitor");
            };

            function getSessionId(){
                return getId("session");
            };

            function updateIdExpiry(){
                    saveId("session",getSessionId());
                    saveId("visitor",getVisitorId());
            };

            return {
                "getVisitorId" : getVisitorId,
                "getSessionId" : getSessionId,
                "updateIdExpiry" : updateIdExpiry
            };
    })();
    

});
