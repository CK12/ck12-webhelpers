window.loadBiscuit(function(requirejs, mocha) {
    require(['biscuit/utils/testloader'], function(TestLoader){

        'use strict';
        //look for modules in requirejs config

        var rjspaths = requirejs.s.contexts._.config.paths,
            moduleName = null,
            path = null,
            testLoader = null,
            pathSplit = null,
            modules = {},
            testModules = [];

        for (moduleName in rjspaths){
            path = rjspaths[moduleName];
            pathSplit = path.split('/');
            if (pathSplit.length == 2 && pathSplit[1] === 'js'){
                modules[moduleName] = moduleName + '/tests/tests';
            }
        }

        for (moduleName in modules){
            testModules.push(modules[moduleName]);
        }
        testLoader = new TestLoader(testModules, function(){
            mocha.run();
        });
        testLoader.load();
    });
});
