/* globals $:false */
define([], function(){
    'use strict';

    var url       = '/flx/search/direct/modality/minimal/domain/',
        urlParams = '?pageNum=1&specialSearch=false&filters=false&ck12only=true&pageSize=10&includeEIDs=1';

    function removeIllegals(text){
        return text.replace(/%*#*&*/g, '');
    }

    function initAutoComplete(query) {
        return $.ajax({
            url: url + encodeURIComponent(removeIllegals(query)) + urlParams,
            dataType: 'json'
        });
    }

    return {
        initAutoComplete: initAutoComplete
    };
});
