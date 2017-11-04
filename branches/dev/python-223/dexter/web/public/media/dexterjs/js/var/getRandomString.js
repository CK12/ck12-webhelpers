define(function() {
    return function getRandomString(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', value = '';
        for (var i = length; i > 0; --i) {
            value += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return value;
    };
});
