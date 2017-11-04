/*
 * Author: Viraj Kanwade
 */

(function ( $ ) {

    Date.prototype.isDST = function() {
        return this.getTimezoneOffset() != this.getStdTimezoneOffset();
    };

    Date.prototype.getStdTimezoneOffset = function() {
        var arr = [];
        var d = new Date(this);
        for (var i = 0; i < 365; i++) {
            d.setDate(i);
            newoffset = d.getTimezoneOffset();
            if (arr.indexOf(newoffset) == -1) {
                arr.push(newoffset);
            }
        }
        //DST = Math.min.apply(null, arr);
        nonDST = Math.max.apply(null, arr);
        return nonDST
    };

}( jQuery ));
