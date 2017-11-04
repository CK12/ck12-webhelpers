//CollectionNodes
db.CollectionNodes.ensureIndex({'absoluteHandle': 1, 'collection.handle': 1, 'collection.creatorID': 1}, {'unique': true});
db.CollectionNodes.ensureIndex({'descendantIdentifier': 1, 'collection.handle': 1, 'collection.creatorID': 1}, {'unique': true});
db.CollectionNodes.ensureIndex({'rank': 1, 'collection.handle': 1, 'collection.creatorID': 1}, {'unique': true});
db.CollectionNodes.ensureIndex({'encodedID': 1}, {'background': true});
print("Finished CollectionNodes indexes");

