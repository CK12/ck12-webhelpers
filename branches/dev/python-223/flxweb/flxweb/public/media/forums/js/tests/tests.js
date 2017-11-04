define([
    'biscuit/utils/testloader',
    'fn/foundation.min'
], function(TestLoader){
    
    return new TestLoader([
        // 'common/tests/urlhelper',
        // 'common/tests/validatehelper'
        'forums/tests/forumTest',
        'forums/tests/testForumView'
    ]);
    
});
