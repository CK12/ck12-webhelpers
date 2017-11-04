/* global define, describe, it*/
define(['common/utils/utils'], function(Utils){
    describe('Utils', function() {
        describe('deepLookup', function() {
            var deepLookup = Utils.deepLookup;
            it('deepLookup exists', function(){
                deepLookup.should.exist;
            });
            it('finds the nested property', function(){
                deepLookup('a.b.c', {
                    a: {b: {c: 20}}
                }).should.equal(20);
            });
            it('returns undefined if property is not found', function(){
                (typeof deepLookup('a.b.c', {})).should.equal('undefined');
            });
            it('returns undefined if sourceObj is missing', function(){
                (typeof deepLookup('a.b.c')).should.equal('undefined');
            });
            it('returns undefined if sourceObj is an array', function(){
                (typeof deepLookup('a.b.c',[])).should.equal('undefined');
            });
            it('returns undefined if sourceObj is a number', function(){
                (typeof deepLookup('a.b.c',99)).should.equal('undefined');
            });
            it('returns undefined if sourceObj is an string', function(){
                (typeof deepLookup('a.b.c','elephant')).should.equal('undefined');
            });
            it('can return prototypical property of sourceObj', function(){
                (deepLookup('a.b.length',{
                    a: {
                        b: [1,2,3,4,5]
                    }
                })).should.equal(5);
            });
            it('can also work with arrays', function(){
                deepLookup('0.0.1', [[[1,2]]]).should.equal(2);
            })
        });
    });
});
