/* global define, describe, it */
define(['common/utils/practice_badge'], function(PracticeBadge){
    describe('PracticeBadge', function() {
        describe('PracticeBadge.widgetPracticeUrlUtility', function(){
            it('PracticeBadge.widgetPracticeUrlUtility exists', function(){
                (PracticeBadge.widgetPracticeUrlUtility).should.exist;
            });
            it('example test', function(){
                var expectedURL = '/assessment/ui/?test/view/practice/sample-handle/branch&&nextPractice=false&referrer=practice_badge&fromPracticeWidget=true&&repeat=0';
                var options = {
                    'spaceScheduledObject': null,
                    'encodedID': 'SCI.ESC.200',
                    'practiceHandle': 'sample-handle',
                    'branchHandle': 'branch',
                    'pointsAndAwards' : {
                        'correctAnswers': 10,
                        'questionCount': 20
                    },
                    'collectionInfo': null,
                    'showNextConcept': false
                };
                var iframeURL = PracticeBadge.widgetPracticeUrlUtility(options);
                iframeURL.should.equal(expectedURL);
            });
            //TODO:Add more tests to handle various options cases.
        });
    });
});
