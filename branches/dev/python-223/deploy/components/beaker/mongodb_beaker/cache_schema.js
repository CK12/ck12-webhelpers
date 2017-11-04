db.FlxForever.ensureIndex({'_id.key': 1}, {'background': true});
db.FlxForever.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.FlxCache.ensureIndex({'_id.key': 1}, {'background': true});
db.FlxCache.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.FlxDaily.ensureIndex({'_id.key': 1}, {'background': true});
db.FlxDaily.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.FlxShortTerm.ensureIndex({'_id.key': 1}, {'background': true});
db.FlxShortTerm.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.FlxWeekly.ensureIndex({'_id.key': 1}, {'background': true});
db.FlxWeekly.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.FlxMonthly.ensureIndex({'_id.key': 1}, {'background': true});
db.FlxMonthly.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.AsmtMonthly.ensureIndex({'_id.key': 1}, {'background': true});
db.AsmtMonthly.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.AsmtYearly.ensureIndex({'_id.key': 1}, {'background': true});
db.AsmtYearly.ensureIndex({'_id.key': 1, '_id.namespace': 1}, {'unique': true});

db.Cry.ensureIndex({'key': 1}, {'unique': true});
