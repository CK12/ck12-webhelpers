define(function() {
    //polyfill for Number.isNaN
    (function (global) {
        var global_isNaN = global.isNaN;
        if (!Number.isNaN) {
            Object.defineProperty(Number, 'isNaN', {
                value: function isNaN(value) {
                    return typeof value === 'number' && global_isNaN(value);
                },
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    })(this);
});
