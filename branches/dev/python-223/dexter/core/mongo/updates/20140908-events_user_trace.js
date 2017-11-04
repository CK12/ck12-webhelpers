db.Events.ensureIndex( {"payload.memberID" : 1, "eventType" : 1,"time_bucket" : 1}, {"background" : true})
