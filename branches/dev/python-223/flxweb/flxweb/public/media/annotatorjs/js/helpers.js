define(function(){

    // Taken from annotator.touch.js
    function isTouchDevice(){
        return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    }

    return {
        isTouchDevice: isTouchDevice
    }
});