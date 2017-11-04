/* globals chai, mocha, requirejs */
(function(){
    var globals = {};
    globals.loadBiscuit = function(doneCallback, options){
        if (!options){
            options = {};
        }
        if (!options.baseUrl){
            options.baseUrl = '..';
        }
        require.config({
            'baseUrl' : options.baseUrl
        });

        require(['require.config'], function() {
            doneCallback(requirejs, mocha);
        });
    };

    globals.should = chai.should();
    mocha.setup('bdd');

    if (window){
        Object.keys(globals).forEach(function(key){
            if (!window[key]){
                window[key] = globals[key];
            }
        });
    }

    return globals;
})();
