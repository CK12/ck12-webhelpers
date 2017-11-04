define(function() {
    /**
     * Given some pointer to the cookie configuration in the default_configuration, 
     * build the cookie string.
     * @param {Object} ingreedients A collection containing at least 'name' from 
     *                              { name, value, domain, path, max-age, expires, secure }
     * @param {String} ingreedients A string will be set as the 'name' of the cookie. 
     * @param {String} cookieValue (optional) The value assigned to the cookie. The value
     *                              property in default_configuration takes priority.
     *                              This value will default to a random string.
     * @returns {String} cookie
     */
    return function bakeCookie(ingreedients, cookieValue) {
        ingreedients = (typeof ingreedients === "string") ? {name:ingreedients} : ingreedients;
        if (!ingreedients) { throw new Error("Unknown Cookie!"); }
        var cookie = "";
        cookie += ingreedients.name + "=" + (ingreedients.value || cookieValue || getRandomString(25)) + ";";
        cookie += "domain="               + (ingreedients.domain || window.location.host)+ ";";
        cookie += "path="                 + (ingreedients.path || "/") + ";";
        cookie += "max-age="              + (ingreedients["max-age"] || "session")  + ";";
        if (ingreedients.secure) {
            cookie += "secure;";
        }
        return cookie;
    };
});
