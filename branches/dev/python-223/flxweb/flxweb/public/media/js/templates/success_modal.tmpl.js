define([
    'underscore',
    'text!templates/flxweb.share.successmodal.html',
], function (_,successInfo) {
    'use strict';
    function _t(tmpl){
        return _.template(tmpl, null, {"variable":"data"});
    }
    return {
        /*'MAIN': _t(main),*/
    	'SUCCESSINFO' : successInfo
    };
});