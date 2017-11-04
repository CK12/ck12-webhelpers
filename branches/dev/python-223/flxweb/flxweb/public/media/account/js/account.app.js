/* global practiceAppHelper */
require.config({
    'baseUrl':'ui/practiceapp/media'
});

require(['require.config'], function(){
    require(['_main']);
});

define('_main',function (require) {
    'use strict';
    var $ = require('jquery');

    function getParam (){

        var results = window.location.href.split('ep=');
        if( results == null ){
            return '';
        } else{
            return decodeURIComponent(results[1].replace(/\+/g, ' '));
        }

    }

    function back(){
        var ep = getParam('ep');
        if(ep){
            window.location.href = ep;
        }
        return true;
    }

    window.practiceAppHelper.init();
    practiceAppHelper.initRootPath('.');

    window.practiceAppHelper['backButtonHandler'] = back;

    $('#backButton').off('click.back').on('click.back', back);

    require(['account/controllers/account'], function(account){
        account.loadForApp($('#settingContainer').get(0));
    });
});
