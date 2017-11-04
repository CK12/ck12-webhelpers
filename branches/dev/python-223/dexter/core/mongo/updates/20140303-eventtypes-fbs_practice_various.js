db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_ASSESSMENT_FILTERS", "parameters" : [ { "mandatory" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "page" }, { "mandatory" : true, "name" : "filter_type" },{ "mandatory" : true, "name" : "filter_value" } ] })

db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_ASSESSMENT_REVIEW_ANSWERS", "parameters" : [ { "mandatory" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "testID" }, { "mandatory" : true, "name" : "testScoreID" } ] })

db.EventTypes.insert({"clientID" : 24839961, "eventType" : "FBS_ASSESSMENT_PEERHELP_TAB", "parameters" : [ { "mandatory" : true, "name" : "context_eid" }, { "mandatory" : true, "name" : "testScoreID" }, { "mandatoryry" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "memberIDsequence" }, { "mandatory" : true, "name" : "questionID" }, { "mandatoryrydatory" : true, "name" : "practiceType" }, { "mandatory" : true, "name" : "difficulty_level" }, { "mandatory" : true, "name" : "question_type" } ] })

db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_ASSESSMENT_ATTEMPTS_NAVIGATE", "parameters" : [ { "mandatory" : true, "name" : "testID" }, { "mandatory" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "referrer" } ] })

db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_ASSESSMENT_RESULTS_SWITCH", "parameters" : [ { "mandatory" : true, "name" : "testID" }, { "mandatory" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "switchTo" } ] })
