define(['modality/controllers/concept'], function(modalityTest){
	describe('modalityTest', function() {
		it("modalityTest exists", function(){
			modalityTest.should.exist;
        });
        it("Get Modality Group By Type", function(){
        	var modality = "lesson",
        	modalityGroups = ["lesson", "concept", "section"];
        	mod = new modalityTest();
        	mod.init({"branch":"algebra","handle":"Inequalities-on-a-Number-Line"});
        	setTimeout(function(){
        	mod.getModalityGroupByType(modality).artifact_types.should.equal(modalityGroups);
        	}, 2000);
        });
        
        it("Get Modality Group By Name",function(){
        	var groupname = "text",
        		modalities = ["lesson", "concept", "section"];
        	mod = new modalityTest();
        	mod.init({"branch":"algebra","handle":"Inequalities-on-a-Number-Line"});
        	setTimeout(function(){
            	mod.getModalityGroupByName(groupname).artifact_types.should.equal(modalities);
            	}, 2000);
        });
        
        it("Get Concept", function(){
        	var topic = 'MAT.ALG.100', expectedTotal = 46;
        	mod = new modalityTest();
        	mod.getConcepts(topic).done(function(concepts){
        		concepts.results.should.exist;
        	});
        	
        });
        
	});
});
