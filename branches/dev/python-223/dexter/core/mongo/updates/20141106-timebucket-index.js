//Add indexing on time_bucket field for all the resolved collections.
var prefix = 'Resolved_';
var collections = db.getCollectionNames();
for(index in collections) {
    collection = collections[index];
    if(collection.substring(0, prefix.length) == prefix) {
        db[collection].ensureIndex({'time_bucket':1}, {'background':true});
        print("Adding indexes for collection: " + collection);
    }
}
