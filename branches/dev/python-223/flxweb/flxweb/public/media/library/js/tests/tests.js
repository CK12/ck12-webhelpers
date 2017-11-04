define([
    'biscuit/utils/testloader',
], function(TestLoader){
    
    return new TestLoader([
        'library/tests/libraryview.test',
        'library/tests/librarymodel.test',
    ]);
    
});
