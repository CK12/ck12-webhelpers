/* global define, describe, it*/
define(['common/utils/utils'], function(validateHelper){
    describe('validateHelper', function() {
        it('validateHelper exists', function(){
            validateHelper.should.exist;
        });
        it('Validate Title', function(){
            var titles = {
                alphaNumericTitle : 'mytitle20',
                alphabeticTitle : 'mytitle',
                numericTitle: '1234',
                mixTitle : '#my%title*24',
                charaterTitle : '*#%'
            };
            validateHelper.validateResourceTitle(titles.alphaNumericTitle, 'artifact').should.equal(true);
            validateHelper.validateResourceTitle(titles.alphabeticTitle, 'artifact').should.equal(true);
            validateHelper.validateResourceTitle(titles.numericTitle, 'artifact').should.equal(true);
            validateHelper.validateResourceTitle(titles.mixTitle, 'artifact').should.equal(true);
            validateHelper.validateResourceTitle(titles.charaterTitle, 'artifact').should.equal(false);
        });
    });
});
