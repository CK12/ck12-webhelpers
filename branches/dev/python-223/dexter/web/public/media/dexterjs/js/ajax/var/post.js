define([
    "../../utils/var/serialize",
    "../../utils/extend"
],function (serialize, extend) {
    /**
     * Call an HTTP POST method with the given URL and data
     *
     * @param {string} url - This is your endpoint to POST.
     * @param {object} postData - An object containing data to be sent to the server.
     * @param {object} config - (optional) Extends the `DEFAULTS` configuration object.
     */
    return function post(url, postData, config) {
        var xhr = xmlhttp();
        var buffer;
        var dummyF = function() { return null; };
        var DEFAULTS = {
            success:dummyF,
            error: dummyF,
            headers: { 
                // default form urlencoded type
                "Content-Type" : "application/x-www-form-urlencoded;charset=UTF-8"
            }
        };
        config = (config === undefined) ? { } : config;
        config = extend(true, DEFAULTS, config);

        xhr.open("POST", url);
        for (buffer in config.headers) {
            xhr.setRequestHeader(buffer, config.headers[buffer]);
        }

        // TODO: may need to handle special server codes in the future
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ( xhr.status === 200 || xhr.status === 304 ) {
                    config.success();
                } else {
                    config.error();
                }
            }
        };

        if (config.headers["Content-Type"] === "application/json") {
            xhr.send(JSON.stringify(postData));
        }
        else {
            xhr.send(serialize(postData));
        }
    };

});
