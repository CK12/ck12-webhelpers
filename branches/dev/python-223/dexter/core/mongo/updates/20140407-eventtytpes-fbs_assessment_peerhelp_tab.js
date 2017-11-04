db.EventTypes.update({'eventType': 'FBS_ASSESSMENT_PEERHELP_TAB'}, {$push: {parameters: { $each: [ { "mandatory" : true, "name" : "sequence" }, { "mandatory" : true, "name" : "memberID" }   ] } } } );

db.EventTypes.update({'eventType': 'FBS_ASSESSMENT_PEERHELP_TAB'}, {$pull: {'parameters': {'name':'memberIDsequence'}}});
