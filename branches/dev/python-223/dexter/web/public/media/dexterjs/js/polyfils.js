define(function() {
    function polyfils() {
        /**
         * Handle missing console
         */
        if (!window.console) {
            window.console = {};
            window.console.log = window.console.warn = window.console.debug = function() {};
        }
    }
    return polyfils;

});
