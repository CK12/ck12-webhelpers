/* global define, describe, it*/
define([
    'js/flxwebSave/flxwebSaveAdaptor'
], function(SaveAdaptor){

    describe('SaveAdaptor', function() {
        it('saveAdapter Exists', function(){
            SaveAdaptor.should.exist;
        });
    });
    
});
