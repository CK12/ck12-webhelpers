module.exports = function(grunt){
    "use strict";

    var fs = require('fs');
    var requirejs = require('requirejs');
    var extend = require('node.extend');
    
    function readOptionalJSON( filepath ) {
        var data = {};
        try {
            data = grunt.file.readJSON( filepath );
        } catch ( e ) {
            console.log(e);
        }
        return data;
    }



    grunt.registerMultiTask('ck12-media-build','Build media directory',function(){
        var config = extend({
            optimize: "none",
            optimizeCss: "standard",
            findNestedDependencies : true,
            optimizeAllPluginResources: true,
            //removeCombined : true,
            preserveLicenseComments: true
        }, this.data.requireConfig);
        var done = this.async();
        var buildConfig = readOptionalJSON(config.modules);
        if (buildConfig && buildConfig.modules){
            config.modules = buildConfig.modules;
        }
        console.log(config);
        requirejs.optimize(config, function(response){
            console.log(response);
            done();
        }, function(err){
            done(err);
        });
    });

};
