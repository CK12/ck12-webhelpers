/* global define*/
define([
    'biscuit/utils/testloader'
], function(TestLoader){

    return new TestLoader([
        'common/tests/urlhelper',
        'common/tests/validatehelper',
        'common/tests/utils',
        'common/tests/practice_badge',
        'common/tests/saveOptimization'
    ]);

});
