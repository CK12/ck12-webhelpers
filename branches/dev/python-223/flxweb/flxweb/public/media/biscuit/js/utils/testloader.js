/* globals describe*/
define(function(require){

    function TestLoader(tests, onLoadCallback){
        var _totalTests = 0,
            _tests = [],
            _onLoadCallbacks = [];
        /**
         * Called when each test finishes loading
         * @param err: Error object
         * @param testfn : loaded test function
         */
        function onTestFetchComplete(err, testfn){
            if (err){
                //console.log("Failed to load a test module", err);
                onTestLoadComplete();
            } else {
                if( testfn instanceof TestLoader ){
                    testfn.addOnLoadCallback(function(){
                        onTestLoadComplete();
                    });
                    testfn.load();
                } else {
                    testfn();
                    onTestLoadComplete();
                }
            }

        }

        function onTestLoadComplete(){
            _totalTests -= 1;
            if (_totalTests === 0){
                onLoadComplete();
            }
        }


        /**
         * Called when all tests complete loading
         */
        function onLoadComplete(){
            var fn = null;
            while(_onLoadCallbacks.length){
                fn = _onLoadCallbacks.pop();
                fn();
            }
        }


        /**
         * load tests 'common/tests/urlhelper'
         */
        function loadTest(test){
            describe(test, function(){
                require([test], function(testfn){
                    onTestFetchComplete(null, testfn);
                }, function(err){
                    onTestFetchComplete(err);
                });
            });
        }

        /**
         * Adds a callback that executes after the tests are loaded
         */
        function addOnLoadCallback(callback){
            if (callback && typeof callback === 'function'){
                _onLoadCallbacks.push(callback);
            }
        }

        /**
         * initialize the TestLoader instance
         */
        function initialize(tests, onLoadCallback){
            _totalTests = (tests)?tests.length:0;
            _tests = tests;
            addOnLoadCallback(onLoadCallback);
        }

        /**
         * Start loading tests
         */
        this.load = function(){
            if (tests && tests.length > 0){
                for (var i = 0, l=_tests.length; i<l; i++){
                    loadTest(_tests[i]);
                }
            } else {
                onLoadComplete();
            }
        };

        this.addOnLoadCallback = addOnLoadCallback;

        initialize(tests, onLoadCallback);
    }

    return TestLoader;
});
