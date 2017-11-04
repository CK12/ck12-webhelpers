require.config({
    'baseUrl':'/lmspractice/media'
});

require(['require.config'], function(){
    require(['_main']);
});

define('_main',function (require) {
    "use strict";
    var $ = require('jquery');
    require('jquery-ui');
    require('fn/vendor/custom.modernizr');
    require('fn/foundation.min');
    require('fn/foundation/foundation.dropdown');
    require('fn/foundation/foundation.topbar');
    require('common/utils/Number.isNaN');
    var PracticeApp = require('practiceapp/practiceapp');
    
    //This is a common main that loads all the common dependencies needed on all pages
    if (typeof console === "undefined" || typeof console.log === "undefined") {
        console = {};
        console.log = function() {};
    }
    //initialize foundation framework and any its plugins
    $(document).foundation();
    var app = new PracticeApp();
    return app;
});

