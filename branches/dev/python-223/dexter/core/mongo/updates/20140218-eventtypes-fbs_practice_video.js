db.EventTypes.update({'eventType': 'FBS_PRACTICE_VIDEO', 'parameters.name': 'testID'}, {$set: {"parameters.$.name": "testScoreID"}});
db.EventTypes.update({'eventType': 'FBS_PRACTICE_VIDEO', 'parameters.name': 'encodedID'}, {$set: {"parameters.$.name": "context_eid"}});
db.EventTypes.update({'eventType': 'FBS_PRACTICE_VIDEO', 'parameters.name': 'practiceType'}, {$set: {"parameters.$.name": "practice_type"}});

db.EventTypes.update({'eventType': 'FBS_PRACTICE_VIDEO'}, {$push: {parameters: { $each: [ { "mandatory" : true, "name" : "sequence" }, { "mandatory" : true, "name" : "practiceType" }, { "mandatory" : true, "name" : "difficulty_level" }, { "mandatory" : true, "name" : "question_type" }   ] } } } );

