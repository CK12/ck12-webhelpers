require.config({
            //By default load any module IDs from /media/js
            //except, if the module ID starts with "lib",
            //load it from the lib directory. paths
            //config is relative to the baseUrl, and
            //never includes a ".js" extension since
            //the paths config could be for a directory.
            paths: {
                'lib': '../lib',
                'jquery': '../lib/jquery/jquery-1.7.1.min',
                //'flxweb.settings': '/js/settings/flxweb.settings',
                'jquery.cookie': '../lib/jquery-plugins/jquery.cookie',
                'underscore.string': '../lib/underscore.string.min',
                'underscore': '../lib/underscore-min',
                'backbone-relational': '../lib/backbone-relational',
                'backbone': '../lib/backbone',
                'json2': '../lib/json2.min',
                'jquery-ui': '../lib/jquery-ui/js/jquery-ui-1.8.17.custom.min',
                'jquery.blockUI': '../lib/jquery-plugins/jquery.blockUI.min',
                'jquery.validate': '../lib/jquery-plugins/jquery.validate.min',
                'jquery.ba-postmessage': '../lib/jquery-plugins/jquery.ba-postmessage.min',
                'jquery.qtip': '../lib/jquery-plugins/jquery.qtip.v2.min',
                'jquery.noty': '../lib/jquery.noty',
                'jquery.scrollTo': '../lib/jquery-plugins/jquery.scrollTo-min',
                'jquery.ba-hashchange': '../lib/jquery-plugins/jquery.ba-hashchange.min',
                'jquery.timer': '../lib/jquery-plugins/jquery.timer',
                'jquery.iframe-transport': '../lib/jquery-plugins/jquery-fileupload/js/jquery.iframe-transport',
                'jquery.fileupload': '../lib/jquery-plugins/jquery-fileupload/js/jquery.fileupload',
                'jquery.autocomplete': '../lib/jquery-plugins/jquery.autocomplete-1.1.3/jquery.autocomplete-min',
                'jquery.ui.widget': '../lib/jquery-plugins/jquery-fileupload/js/vendor/jquery.ui.widget',
                'jquery.isotope': '../lib/jquery-plugins/jquery.isotope.min',
                'jquery.simpleplaceholder': '../lib/jquery-plugins/jquery.simpleplaceholder',
                'tinymce-jquery': '../lib/tinymce4/js/tinymce/jquery.tinymce.min',
                'tinymce': '../lib/tinymce4/js/tinymce/tinymce.min',
                'tinymce3-jquery': '../lib/tinymce/jscripts/tiny_mce/jquery.tinymce',
                'tinymce3': '../lib/tinymce/jscripts/tiny_mce/tiny_mce',
                'jeditable': '../lib/jquery-plugins/jquery.jeditable',
                'jstree': '../lib/jquery-plugins/jquery.jstree',
                'hammer': '../common/vendor/jquery-plugins/hammer/jquery.hammer.min',
                'd3': '../lib/d3.v2.min',
                'raphael': '../lib/raphael',
                'highcharts': '../lib/highcharts',
                'path': '../lib/path.min',
                'jquery.hoverIntent': '../lib/jquery-plugins/jquery.hoverIntent.min',
                'jquery.ba-bbq': '../lib/jquery-plugins/jquery.ba-bbq.min',
                'modernizr': '../lib/modernizr.custom.53451',
                'jquery.gallery': '../lib/jquery.gallery',
                'jquery.transit': '../lib/jquery-plugins/jquery.transit.min',
                'jquery.dotdotdot': '../lib/jquery-plugins/jquery.dotdotdot-1.5.6',
                'jquery.highlighttextarea': '../lib/jquery-plugins/jquery.highlighttextarea',
                'jquery.appdownload': '../common/vendor/jquery-plugins/appdownload/js/jquery.appdownload',
                'common': '../common/js',
                'groups': '../groups/js',
                'library': '../library/js',
                'modalityAssign' : '../modalityAssign/js',
                'modality': '../modality/js',
                'notification': '../notification/js',
                'profilebuilder': '../profilebuilder/js',
                'ck12license': '../ck12license/js',
                'fn': '../common/vendor/foundation/js',
                'text': '../text',
                'practiceapp': '../practiceapp/js',
                'standard': '../standard/js',
                'cache': '../cache',
                'bookmarklet': '../bookmarklet/js',
                'slick': '../lib/slick/slick.min',
                'aes': '../common/vendor/aes/aes',
                'annotator': '../lib/annotator/annotator.lib',
                'ck12annotator': '../annotatorjs/js',
                'reader':'../reader/js',
                'softRegistration': '../softRegistration/js',
                'duplicateUsername': '../duplicateUsernames/js',
		'js': '../js',
                'flxwebSaveAdaptor': './flxwebSave/flxwebSaveAdaptor',
		'ltiBridge': '../lmsbridge/dist/ltiBridge.bundle'
            },
            shim: {
                'underscore': {
                    exports: "_"
                },
                'backbone': {
                    //These script dependencies should be loaded before loading
                    //backbone.js
                    deps: ['jquery', 'underscore'],
                    //Once loaded, use the global 'Backbone' as the
                    //module value.
                    exports: 'Backbone'
                },
                'backbone-relational': {
                    deps: ['backbone'],
                    exports: 'Backbone'
                },
                'underscore.string': {
                    deps: ['underscore']
                },
                'raphael': {
                    deps: ['jquery'],
                    exports: 'raphael'
                },
                'jquery-ui': {
                    deps: ['jquery']
                },
                'jquery.cookie': {
                    deps: ['jquery']
                },
                'jquery.blockUI': {
                    deps: ['jquery']
                },
                'jquery.validate': {
                    deps: ['jquery']
                },
                'jquery.ba-postmessage': {
                    deps: ['jquery']
                },
                'jquery.qtip': {
                    deps: ['jquery']
                },
                'jquery.noty': {
                    deps: ['jquery']
                },
                'jquery.isotope': {
                    deps: ['jquery']
                },
                'jquery.scrollTo': {
                    deps: ['jquery']
                },
                'jquery.transit': {
                    deps: ['jquery']
                },
                'tinymce': {
                    deps: ['tinymce-jquery']
                },
                'tinymce-jquery': {
                    deps: ['jquery']
                },
                'tinymce3': {
                    deps: ['tinymce3-jquery']
                },
                'tinymce3-jquery': {
                    deps: ['jquery']
                },
                'jeditable': {
                    deps: ['jquery']
                },
                'jstree': {
                    deps: ['jquery']
                },
                'jquery.autocomplete': {
                    deps: ['jquery']
                },
                'jquery.hoverIntent': {
                    deps: ['jquery']
                },
                'jquery.ba-bbq': {
                    deps: ['jquery']
                },
                'cache/ajax_prefilter': {
                    deps: ['jquery', 'cache/cache_ajax']
                },
                'annotator': {
                    deps: ['jquery']
                },
                //Dependencies for integrating new navigation with the old pages
                "fn/foundation.min": {
                    deps: ["jquery"]
                },
                "fn/vendor/custom.modernizr": {
                    deps: ["jquery"]
                },
                "fn/foundation/foundation.dropdown": {
                    deps: ["jquery", "fn/foundation.min", "fn/vendor/custom.modernizr"]
                },
                "fn/foundation/foundation.topbar": {
                    deps: ["jquery", "fn/foundation.min", "fn/vendor/custom.modernizr"]
                },
                "fn/foundation/foundation.reveal": {
                    deps: ["jquery", "fn/foundation.min"]
                }
            },
            waitSeconds: 90
        });

define('underscore.string.mixin', ['underscore', 'underscore.string'],
    function (_) {
        'use strict';

        _.mixin(_.str.exports());
    });

require(['require', 'jquery', 'common/controllers/navigation', 'common/views/login.popup.view',
        'softRegistration/index',
        'aes', 'cache/cache_ajax', 'cache/ajax_prefilter',
        'jquery.cookie', 'underscore', 'underscore.string.mixin', 'json2',
        'backbone', 'jquery-ui', 'jquery.blockUI', 'jquery.validate',
        'jquery.ba-postmessage', 'jquery.qtip',
        'flxweb.settings', 'flxweb.jquery.plugins',
        'flxweb.global', 'jquery.noty',
        'fn/foundation/foundation.dropdown',
        'fn/foundation/foundation.topbar'
    ],
    function (require, $, navigation, signin, SoftRegistration) {
        'use strict';

        function initLogin() {
            signin.showLoginDialogue({
                'returnTo': ($('.js-sign-in').attr('data-return') || '')
            });
        }
        window.setTimeout(function(){
        	 $(document).foundation();
        },5000);
        
        //initialize the search bar component
        navigation.init();

        //SoftRegistration watcher
        SoftRegistration.initialize();

        //
        SoftRegistration.triggerSoftRegistration();

        //init signin
        $('.js-sign-in').off('click.sign-in').on('click.sign-in', function () {
            if ($('body').hasClass('side-bar-active')) {
                $('#side-reveal-icon').trigger('click');
                window.setTimeout(initLogin, 500);
            } else {
                initLogin();
            }
        });

        $('footer').show();
    });
