db.Clients.insert({"updated" : ISODate("2014-03-26T11:10:55.968Z"), "name" : "MS Athena", "clientID" : 71438528, "created" : ISODate("2014-03-26T11:10:55.968Z") });

db.EventTypes.insert({ "clientID" : 71438528, "eventType" : "ATHENA_APP_LAUNCH", "parameters" : [ { "mandatory" : true, "name" : "appID" }, ] });

db.EventTypes.insert({ "clientID" : 71438528, "eventType" : "ATHENA_MODALITY_INSERT", "parameters" : [ { "mandatory" : true, "name" : "appID" }, { "mandatory" : true, "name" : "artifactID" }, { "mandatory" : true, "name" : "context_eid" }] });

