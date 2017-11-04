define(function () {
    /**
     * Return the value of some cookie.
     * @param c_name - name of the cookie to be found.
     * @returns - string or null when not found.
     */
    return function getCookie(c_name) {
        var i, x, y, iCookie, pos, ARRcookies = document.cookie.split(';');
        var l = ARRcookies.length;
        for (i = 0; i < l; i++) {
            iCookie = ARRcookies[i];
            pos = iCookie.indexOf('=')
            x = iCookie.substr(0, pos);
            y = iCookie.substr(pos + 1);
            x = x.replace(/^\s+|\s+$/g, '');
            if (x === c_name) {
                // NOTE: the unescape function was deprecated in ECMA v3
                return decodeURIComponent(y);
            }
        }
        return null;
    };
});
