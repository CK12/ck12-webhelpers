/* global describe, it */
define(['biscuit/utils/testloader'], function(TestLoader){

    var dummy1 = new TestLoader(['biscuit/tests/dummy1']);
    describe('TestLoader', function(){
        it('exists', function(){
            TestLoader.should.exist;
        });

        it('should have a load and addOnLoadCallback ', function(){
            dummy1.should.have.property('load').and.be.a('function');
            dummy1.should.have.property('addOnLoadCallback').and.be.a('function');
        });

        it('should load module', function(done){
            dummy1.addOnLoadCallback(done);
            dummy1.load();
        });
    });
});
