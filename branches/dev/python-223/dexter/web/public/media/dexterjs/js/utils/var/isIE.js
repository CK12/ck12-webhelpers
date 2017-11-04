define(function() {
    // check if user is using ie9 or ie10.... :(
    return (function () {
        return ( window.navigator.userAgent.match(/MSIE 9|MSIE 10/) ) ? true : false;
    })();
});
