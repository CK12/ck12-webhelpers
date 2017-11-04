define(function() {

    return function() {
        try {
            return new XMLHttpRequest();
        } catch (error) {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (error2) {
                return new ActiveXObject("Msxml2.XMLHTTP");
            }
        } 
    };
});
