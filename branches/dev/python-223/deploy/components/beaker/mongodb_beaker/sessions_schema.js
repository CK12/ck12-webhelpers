db.AuthSessions.ensureIndex({'_id.key':1, '_id.namespace': 1}, {'unique': true});
db.AuthSessions.ensureIndex({'_id.namespace': 1}, {'background': true});
db.AuthSessions.ensureIndex({'created': 1}, {'background': true});
db.AuthSessions.ensureIndex({'userID': 1}, {'background': true});

db.FlxSessions.ensureIndex({'_id.key':1, '_id.namespace': 1}, {'unique': true});
db.FlxSessions.ensureIndex({'_id.namespace': 1}, {'background': true});
db.FlxSessions.ensureIndex({'created': 1}, {'background': true});
db.FlxSessions.ensureIndex({'userID': 1}, {'background': true});

db.FlxwebSessions.ensureIndex({'_id.key':1, '_id.namespace': 1}, {'unique': true});
db.FlxwebSessions.ensureIndex({'_id.namespace': 1}, {'background': true});
db.FlxwebSessions.ensureIndex({'created': 1}, {'background': true});
db.FlxwebSessions.ensureIndex({'userID': 1}, {'background': true});

db.AsmtSessions.ensureIndex({'_id.key':1, '_id.namespace': 1}, {'unique': true});
db.AsmtSessions.ensureIndex({'_id.namespace': 1}, {'background': true});
db.AsmtSessions.ensureIndex({'created': 1}, {'background': true});
db.AsmtSessions.ensureIndex({'userID': 1}, {'background': true});

db.StsSessions.ensureIndex({'_id.key':1, '_id.namespace': 1}, {'unique': true});
db.StsSessions.ensureIndex({'_id.namespace': 1}, {'background': true});
db.StsSessions.ensureIndex({'created': 1}, {'background': true});
db.StsSessions.ensureIndex({'userID': 1}, {'background': true});

db.PeerhelpSessions.ensureIndex({'_id.key':1, '_id.namespace': 1}, {'unique': true});
db.PeerhelpSessions.ensureIndex({'_id.namespace': 1}, {'background': true});
db.PeerhelpSessions.ensureIndex({'created': 1}, {'background': true});
db.PeerhelpSessions.ensureIndex({'userID': 1}, {'background': true});

