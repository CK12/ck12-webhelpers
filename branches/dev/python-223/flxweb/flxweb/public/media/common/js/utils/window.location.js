define(function() {
    // Add additional window.location polyfils in this file

    // support for window.location.origin in IE
    if (window.location.origin === undefined) {
        window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }

});
