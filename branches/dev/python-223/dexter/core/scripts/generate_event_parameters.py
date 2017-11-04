import logging
import logging.handlers
import json
import subprocess
import time
import pymongo
from bson.code import Code
# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()  # Prints on console
hdlr = logging.FileHandler('/tmp/generate_event_parameter.log') # Use for smaller logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# MongoDB configuration
db_hostname = 'localhost'
db_port = 27017
db_name = 'dexter'
db_username = 'adsadmin'
db_password = 'D-coD43'
db_replica_set = 'rs1'
db_username = None
db_password = None
db_replica_set = None

variety_path = "/opt/2.0/deploy/components/variety/variety.js"

def run(time_bucket="2013-year"):
    """
    Sample Query :
    
    mongo  --host localhost  -u  adsadmin  -p D-coD43 dexter --quiet --eval "var collection = 'Resolved_FBS_ASSESSMENT', 
           query = {'time_bucket':'2015-04-23 14-hour'}, outputFormat='json'" /tmp/variety/variety.js
    """ 
    stime = time.time()
    db = get_mongo_db()
    colls = db.collection_names()
    resolved_colls = filter(lambda x:x.startswith('Resolved'), colls)
    if not resolved_colls:
        log.info("No resolved collections exists")
        return

    log.info("Resolved collenctions:[%s]" % str(resolved_colls))

    # Prepare the variety js code 
    variety_data = open(variety_path).read()
    variety_code = Code(variety_data)
    variety_tmpl = "collection = '%s', query = {'time_bucket':'%s'}, outputFormat='json'"
    
    # Process all the resolved collections.
    for resolved_coll in resolved_colls:
        coll_name = resolved_coll.replace('Resolved_', '')
        log.info("Processing collection:%s" % resolved_coll)
        try:
            # Set the required variables Eg. collection, query , outputFormat etc..
            eval_code = variety_tmpl % (resolved_coll, time_bucket)
            log.info("Executing eval_code: [%s]" % eval_code)
            db.eval(eval_code)
            # Run the variety code
            results = db.eval(variety_code)
            new_parameters = []
            for result in results:
                name = result['_id']['key']
                # . not allowed in mongodb document key, so replace it with #
                name = name.replace('.', '#')
                values = result['value']['types']
                new_parameters.append({name:values})

            # Add the eventParameters to the database
            record = db.EventParameters.find_one({'eventType':coll_name})
            if not record:
                record = {'eventType':coll_name, 'parameters':new_parameters}
                db.EventParameters.insert(record)
                log.info("Added eventParameters for eventType:%s" % coll_name)
                continue
            # Combine exisitng and new parameters to create final parameters
            old_parameters = record.get('parameters', [])
            all_parameters = old_parameters + new_parameters
            all_parameters_dict = {}
            for parameter in all_parameters:
                key = parameter.keys()[0]
                values = all_parameters_dict.get(key, [])
                values.extend(parameter[key])
                all_parameters_dict[key] = values

            # Prepare final parameters containing unique parameter names
            all_parameters = [{key:list(set(all_parameters_dict[key]))} for key in all_parameters_dict]
            log.info("Adding parameters:[%s]" % str(all_parameters))
            db.EventParameters.update({'eventType':coll_name}, {'$set':{'parameters':all_parameters}})
            log.info("Updated eventParameters for eventType:%s" % coll_name)
        except Exception as e:
            log.info("Unable to get event parameters for the collection:%s, Error:%s" % (resolved_coll, str(e)))
            import traceback
            traceback.print_exc()
            raise
    
    print "Time Taken: %s" % (time.time() - stime)   
        
def get_mongo_db():
    """Get mongodb.
    """
    # Get the collection from mongodb
    if db_replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_hostname, port=db_port,
                                             replicaSet=db_replica_set,
                                             read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
    else:
        conn = pymongo.MongoClient(host=db_hostname, port=db_port)
    db = conn[db_name]
    if db_username and db_password:
        db.authenticate(db_username, db_password)
    return db

if __name__ == "__main__":
    run(time_bucket='2015-year')
