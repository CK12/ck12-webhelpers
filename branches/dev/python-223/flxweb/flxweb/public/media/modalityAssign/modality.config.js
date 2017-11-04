/* 
* modalityAssign new changes done for FLXWEB story Quick Assign Functionality
* Need to use window.API_SERVER_URL prefixes since this file is also included 
* from Simulation pages.
* */
define(function() {
	requirejs.config({
        /*
        * By RG: 
        * Don't set the baseUrl for this config, as it throws off the require paths
        * in simulations (especially chemistry sims). 
        * Looks like the paths in this config are absolute URL anyways?
        * if we need baseURL, then may be we need to look at using require
        * contexts?
        * baseUrl: ".",
        */
		paths: {
			'jquery': window.API_SERVER_URL + '/media/lib/jquery/jquery-1.7.1.min',
			'backbone': window.API_SERVER_URL + '/media/lib/backbone',
			'underscore': window.API_SERVER_URL +  '/media/lib/underscore-min',
			'text': window.API_SERVER_URL +  '/media/text',
			'common': window.API_SERVER_URL +  '/media/common/js',
			'fn': window.API_SERVER_URL +  '/media/common/vendor/foundation/js',
			'jquery-ui': window.API_SERVER_URL +  '/media/common/vendor/jquery-ui/js/jquery-ui-1.10.2.custom.min',
            "modalityAssign" : window.API_SERVER_URL +  "/media/modalityAssign/js",
            "flxweb.settings": window.API_SERVER_URL + "/media/js/flxweb.settings",
	    "ltiBridge": window.API_SERVER_URL +  "/media/lmsbridge/dist/ltiBridge.bundle"
		},
        shim: {
            'backbone' : {
                deps: ["jquery","underscore"],
                exports: "Backbone"
            },    
            'underscore' : {
            	deps: ["jquery"],
                exports: "_"
            },
            "fn/foundation.min" : {
                deps : ["jquery"]
            },
            "jquery-ui": {
                deps : ["jquery"]
            }
		}
	});
});
