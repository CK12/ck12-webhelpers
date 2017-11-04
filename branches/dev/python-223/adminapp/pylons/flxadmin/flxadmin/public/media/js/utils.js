if(!window.admin) {window.admin = {utils: {}}};
(function(admin, window, $){
	admin.utils = {
        "validateEids": function (eIDs) {
             var eidRegex = new RegExp(/^([a-zA-Z0-9]{3}\.[a-zA-Z0-9]{3}\.\d{3}|[a-zA-Z0-9]{3}\.[a-zA-Z0-9]{3}\.\d{3}\.\d+)$/);
             eidList = eIDs.replace(/ /g, '').split(',');
             for (var i = 0; i < eidList.length; i++) {
                if (!eidRegex.test(eidList[i])) {
                    alert("Invalid EID: " + eidList[i]);
                    return false;
                }
             }
             return true;
        },
        "b64EncodeUnicode": function(str) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        }
    }
})(window.admin, window, $);

