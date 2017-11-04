var now = new Date();
var daysAgo = 100;
var cutoffTime = new Date(now.getTime() - (60*60*24*daysAgo*1000));

db.AuthSessions.remove({'created': { '$lt': cutoffTime } });
db.FlxwebSessions.remove({'created': { '$lt': cutoffTime } });
db.FlxSessions.remove({'created': { '$lt': cutoffTime } });
db.AsmtSessions.remove({'created': { '$lt': cutoffTime } });
