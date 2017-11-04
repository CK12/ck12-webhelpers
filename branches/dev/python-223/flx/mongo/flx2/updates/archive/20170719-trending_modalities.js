//Add the new index
db.ModalityAggregate.ensureIndex({'modality_type': 1,  'country': 1, 'state': 1, 'collection_handle':1}, {'background':true})
db.ModalityAggregate.ensureIndex({'collection_handle':1, 'time_bucket':1, 'modality_type': 1,  'country': 1, 'state': 1}, {'background':true})
db.IP2Location.ensureIndex({'ip_address': 1}, {'background':true})
