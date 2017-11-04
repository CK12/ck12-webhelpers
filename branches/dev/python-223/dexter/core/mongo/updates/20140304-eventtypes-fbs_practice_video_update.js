db.EventTypes.remove({'eventType':'FBS_PRACTICE_VIDEO'})

db.EventTypes.insert({"clientID" : 24839961, "eventType" : "FBS_PRACTICE_VIDEO", "parameters" : [ { "mandatory" : true, "name" : "questionID" }, { "mandatory" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "context_eid" }, { "mandatory" : true, "name" : "testScoreID" }, { "mandatory" : true, "name" : "videoID" }, { "mandatory" : true, "name" : "sequence" }, { "mandatory" : true, "name" : "practiceType" }, { "mandatory" : true, "name" : "difficulty_level" }, { "mandatory" : true, "name" : "question_type" } ] })
