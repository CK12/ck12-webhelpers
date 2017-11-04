/*global adsEnabled, _ck12*/

define([
    'jquery',
    'lib/json2',
    'jquery-ui',
    'lib/jquery-plugins/jquery.validate.min',
    'auth/flx.jquery.plugins'],function($) {

    // Global FLX object
    $.flx = {};

    function logADS(g,e, v, d, a) {
        if (adsEnabled) {
            if (window._ck12){
                _ck12.logEvent(g,e,v,d,a);
            }
        }
    }

    /**
    * Returns the value of query string parameter
    */
    function queryParam(name) {
        name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
        var regexS = '[\\?&]' + name + '=([^&#]*)';
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if(results == null){
            return '';
        } else{
            return decodeURIComponent(results[1].replace(/\+/g, ' '));
        }
    }


    // Global Page-Load Initializations
    function documentReady(){
        $.extend(true, $.flx, {
            'logADS': logADS,
            'queryParam':queryParam
        });
    }

    $(document).ready(documentReady);
});
