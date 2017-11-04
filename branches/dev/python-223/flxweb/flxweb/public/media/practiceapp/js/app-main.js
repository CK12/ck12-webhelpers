require.config({ //the only change here is the baseUrl path. Can use main.js if can set baseUrl conditionally. in main.js its value is '/lmspractice/media'
    'baseUrl':'media'
});

require(['require.config'], function(){
    require(['_main']);
});

define('_main',function (require) {
    "use strict";
    var $ = require('jquery');
    require('fn/vendor/custom.modernizr');
    require('fn/foundation.min');
    require('fn/foundation/foundation.dropdown');
    require('fn/foundation/foundation.topbar');
    var PracticeApp = require('practiceapp/practiceapp');
    require('cache/cache_ajax');
    require('cache/ajax_prefilter');
    
    //This is a common main that loads all the common dependencies needed on all pages
    if (typeof console === "undefined" || typeof console.log === "undefined") {
        console = {};
        console.log = function() {};
    }
    //initialize foundation framework and any its plugins
    $(document).foundation();
    if(practiceAppHelper){
    	practiceAppHelper.init();
    }
    var app = new PracticeApp();
    return app;
});

