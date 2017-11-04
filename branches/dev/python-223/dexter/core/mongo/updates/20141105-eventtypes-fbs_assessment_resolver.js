db.EventTypes.update({'eventType':'FBS_ASSESSMENT'}, {$set:{'default_resolution':'assessment'}})
db.EventTypes.update({'eventType':'FBS_ASSESSMENT'}, {$push:{parameters:{$each:[{ 'mandatory' : false, 'name' : 'resolver' }]}}})
