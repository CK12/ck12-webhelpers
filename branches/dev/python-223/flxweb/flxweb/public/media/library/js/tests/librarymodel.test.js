define([
    'library/models/library.models'
], function(LibraryModel){

    describe("LibraryModel tests", function(){
        it("LibraryModel exists", function(){
            LibraryModel.should.exist;
        });
        // describe("fetchLabels", function(){
        //     var library = new LibraryModel();
        //     it("Should successfully fetch labels", function(done){
        //         library.fetchLabels().done(function(data){
        //             done();
        //         });
        //     });
        // });
    });


});