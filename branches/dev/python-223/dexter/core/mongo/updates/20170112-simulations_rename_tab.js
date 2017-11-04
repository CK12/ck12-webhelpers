db.EventTypes.update({'eventType':'FBS_SIMULATION_QCREATE_A'}, {$pull:{'parameters':{'name':'tab'}}});
db.EventTypes.update({'eventType':'FBS_SIMULATION_QCREATE_A'}, {$push:{'parameters':{"mandatory" : true, "name" : "button"}}});

db.EventTypes.update({'eventType':'FBS_SIMULATION_Q'}, {$pull:{'parameters':{'name':'tab'}}});
db.EventTypes.update({'eventType':'FBS_SIMULATION_Q'}, {$push:{'parameters':{"mandatory" : true, "name" : "button"}}});

db.EventTypes.update({'eventType':'FBS_SIMULATION_Q_A'}, {$pull:{'parameters':{'name':'tab'}}});
db.EventTypes.update({'eventType':'FBS_SIMULATION_Q_A'}, {$push:{'parameters':{"mandatory" : true, "name" : "button"}}});
