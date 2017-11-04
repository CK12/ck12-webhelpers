from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId

MONGO_URI = 'mongodb://localhost:27017/'
MONGO_DB = 'dexter'

def reload_events():
    """
    """
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    skip_counter = 0 
    record_limit = 10
    rec_count = 0
    while True:
        events = db.InvalidEvents.find().sort('timestamp').limit(record_limit).skip(skip_counter)
        processing = False           
        for ev in events:
            processing = True
            print ev    
            #ev['timestamp'] = datetime.now()
            id = ev['_id']
            del ev['_id']
            db.Events.insert(ev)
            db.InvalidEvents.remove({'_id':ObjectId(id)})
            rec_count += 1
        #break
        if not processing:
            break        
        skip_counter += record_limit
    print "Processed %s invalid events." % rec_count
if __name__ == "__main__":
    reload_events()
