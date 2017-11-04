//Add indexing on time_bucket field for all the event types collections.
var prefix = 'FBS_';
var otherCollections = ['APP_ACTION', 'APP_SCREEN_VIEW', 'ATHENA_APP_LAUNCH', 'ATHENA_MODALITY_INSERT', 'HERO_BANNER_CLICK', 'LAUNCH_SUCCESS'];
var collections = db.getCollectionNames();
var performIndex = false;
for(index in collections) {
    collection = collections[index];
    performIndex = false;
    if(collection.substring(0, prefix.length) == prefix) {
        performIndex = true;
    } else {
        var result = otherCollections.indexOf(collection);
        if (result != -1) {
            performIndex = true;
        }
    }   
    if (performIndex) { 
        db[collection].ensureIndex({'time_bucket':1}, {'background':true});
        print("Adding indexes for collection: " + collection);
    }

}
