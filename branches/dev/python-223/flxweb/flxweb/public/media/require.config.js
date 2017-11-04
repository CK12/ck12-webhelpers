require.config({
    waitSeconds: 90,
    //paths config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        'requireLib': 'common/vendor/requirejs/require',
        'fn': 'common/vendor/foundation/js',
        'jq': 'common/vendor/jquery-plugins',
        'jquery': 'common/vendor/jquery/jquery-1.9.1.min',
        'jquery-ui': 'common/vendor/jquery-ui/js/jquery-ui-1.10.2.custom.min',
        'jquery.ui.widget': 'lib/jquery-plugins/jquery-fileupload/js/vendor/jquery.ui.widget',
        'jquery.fileupload': 'lib/jquery-plugins/jquery-fileupload/js/jquery.fileupload',
        'jquery.iframe-transport': 'lib/jquery-plugins/jquery-fileupload/js/jquery.iframe-transport',
        'underscore': 'common/vendor/underscore/underscore-min',
        'graphTool': 'common/vendor/jquery-plugins/graph-tool',
        'knob': 'common/vendor/jquery-plugins/jquery-knob',
        'hammer': 'common/vendor/jquery-plugins/hammer/jquery.hammer.min',
        'jquery.appdownload': 'common/vendor/jquery-plugins/appdownload/js/jquery.appdownload',
        'jquery.isotope': 'lib/jquery-plugins/jquery.isotope.min',
        'jquery-migrate': 'lib/jquery-plugins/jquery-migrate-1.2.1',
        'jquery.validate': 'lib/jquery-plugins/jquery.validate.min',
        'jquery.autocomplete': 'lib/jquery-plugins/jquery.autocomplete-1.1.3/jquery.autocomplete-min',
        'jquery.simple-text-rotator': 'lib/jquery-plugins/jquery.simple-text-rotator',
        'jquery-dttz': 'lib/jquery-plugins/jquery-dttz',
        'sinon': 'common/vendor/sinon/sinon',
        'backbone': 'lib/backbone',
        'backbone1x': 'lib/backbone.1.1.2',
        'slick': 'lib/slick/slick.min',
        'base64' : 'js/flxweb.utils.base64',
        'marionette': 'common/vendor/marionette/backbone.marionette.min',
        'aes': 'common/vendor/aes/aes',
        'flxweb.settings': 'js/flxweb.settings',
        'd3': 'lib/d3.v3-5-16.min',
        'svg4everybody': 'lib/svg4everybody.v2.min',
        'react': 'common/vendor/react-0.14.0/build/react',
        'react-dom': 'common/vendor/react-0.14.0/build/react-dom',
        'annotator': 'lib/annotator/annotator.lib',
        'redux': 'common/vendor/redux/redux.min',
        'annotator': 'lib/annotator/annotator.lib',
        'clipboard': 'lib/clipboard',
        'ltiBridge': 'lmsbridge/dist/ltiBridge.bundle',

        //paths to modules
        'common' : 'common/js',
        'carousel': 'carousel/js',
        'groups' : 'groups/js',
        'dashboard' : 'dashboard/js',
        'standard' : 'standard/js',
        'profilebuilder' : 'profilebuilder/js',
        'duplicateUsername': 'duplicateUsernames/js',
        'ck12license' : 'ck12license/js',
        'auth' : 'auth/js',
        'embed' : 'embed/js',
        'modality' : 'modality/js',
        'library' : 'library/js',
        'modalityAssign' : 'modalityAssign/js',
        'notification' : 'notification/js',
        'account' : 'account/js',
        'search' : 'search/js',
        'practiceapp' : 'practiceapp/js',
        'athenaapp' : 'athenaapp/js',
        'taxonomy' : 'taxonomy/js',
        'templates' : 'js/templates',
        'cache': 'cache',
        'biscuit': 'biscuit/js',
        'bookmarklet': 'bookmarklet/js',
        'elementarymath': 'elementarymath/js',
        'schools': 'schools/js',
        'forums': 'forums/js',
        'flexbook': 'flexbook/js',
        'conceptmap': 'conceptmap/js',
        'cbse': 'cbse/js',
        'ck12annotator': 'annotatorjs/js',
        'browse': 'browse/js',
        'reader':'reader/js',
        'softRegistration': 'softRegistration/js',
        'autoStdAlignment': 'autoStdAlignment/dist',
        'alignedSearch': 'alignedSearch/dist',
        'flxwebSave': 'js/flxwebSave',
        'flxwebSaveAdaptor': 'js/flxwebSave/flxwebSaveAdaptor'
    },
    shim: {
        'jquery-ui': {
            deps: ['jquery']
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            exports: 'Backbone',
            deps: ['jquery', 'underscore']
        },
        'marionette': {
            exports: 'Backbone.marionette',
            deps: ['backbone']
        },
        'react' : {
            exports: 'React'
        },
        'react-dom':{
            exports: 'ReactDOM',
            deps: ['react']
        },
        'clipboard':{
            exports: 'Clipboard'
        },
        'fn/foundation.min' : {
            deps : ['jquery']
        },
        'fn/foundation/foundation.alerts': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.clearing': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.cookie': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.dropdown': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.forms': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.joyride': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.magellan': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.orbit': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.placeholder': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.reveal': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.section': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.tooltips': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/foundation/foundation.topbar': {
            deps: ['jquery', 'fn/foundation.min']
        },
        'fn/vendor/custom.modernizr': {
            deps: ['jquery']
        },
        'jquery-migrate': {
            deps: ['jquery']
        },
        'jquery.isotope': {
            deps: ['jquery', 'jquery-migrate']
        },
        'jquery.autocomplete': {
            deps: ['jquery']
        },
        'jquery.simple-text-rotator': {
            deps: ['jquery']
        },
        'cache/ajax_prefilter': {
            deps: ['jquery', 'cache/cache_ajax']
        },
        'cache/ajax_complete': {
            deps: ['jquery', 'cache/cache_ajax']
        },
        'jquery.appdownload': {
            deps: ['jquery']
        },
        'annotator': {
            deps: ['jquery']
        }
    },
    map: {
        'marionette': {
            'backbone': 'backbone1x'
        }
    }
});
