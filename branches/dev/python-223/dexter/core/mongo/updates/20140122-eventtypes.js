db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_SIGNUPS", "parameters" : [ { "mandatory" : true, "name" : "referrer" }, { "mandatory" : true, "name" : "memberID" }, { "mandatory" : false, "name" : "authType" } ] })

db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_ASSESSMENT_START", "parameters" : [ { "mandatory" : true, "name" : "referrer" }, { "mandatory" : true, "name" : "testID" }, { "mandatory" : true, "name" : "memberID" } ] })

db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_PRACTICE_VIDEO", "parameters" : [ { "mandatory" : true, "name" : "questionID" }, { "mandatory" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "encodedID" }, { "mandatory" : true, "name" : "testID" }, { "mandatory" : true, "name" : "videoID" } ] })

db.EventTypes.insert({ "clientID" : 24839961, "eventType" : "FBS_IMPROVE_QUESTION", "parameters" : [ { "mandatory" : true, "name" : "questionID" }, { "mandatory" : true, "name" : "memberID" }, { "mandatory" : true, "name" : "encodedID" }, { "mandatory" : true, "name" : "invoke" } ] })

db.EventTypes.insert({ "clientID" : 59963265, "eventType" : "PARTNERS_PRINT_DOWNLOAD", "parameters" : [ { "mandatory" : true, "name" : "partnerName" }, { "mandatory" : true, "name" : "artifactID" }, { "mandatory" : true, "name" : "format" }, { "mandatory" : true, "name" : "grade" }, { "mandatory" : true, "name" : "branch" } ] })

db.EventTypes.insert({ "clientID" : 59963265, "eventType" : "PARTNERS_EMBED_DOWNLOAD", "parameters" : [ { "mandatory" : true, "name" : "partnerName" }, { "mandatory" : true, "name" : "encodedIDs" }, { "mandatory" : true, "name" : "modalityTypes" } ] })

