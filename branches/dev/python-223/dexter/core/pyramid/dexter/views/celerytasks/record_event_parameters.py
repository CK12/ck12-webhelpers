import logging
import logging.handlers
import subprocess
import time
import json
import pymongo
from bson.code import Code
from urlparse import urlparse
from datetime import datetime, timedelta
from celery import task
from dexter.views.celerytasks.generictask import GenericTask

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()  # Prints on console
hdlr = logging.FileHandler('/tmp/generate_event_parameter.log') # Use for smaller logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

variety_path = "/opt/2.0/deploy/components/variety/variety.js"

log = logging.getLogger(__name__)


@task(name="tasks.event_parameter_task", base=GenericTask)
class EventParametersTask(GenericTask):
    """
    Class for Recording event parameters.
    Sample Query :
    
    mongo  --host localhost  -u  adsadmin  -p D-coD43 dexter --quiet --eval "var collection = 'Resolved_FBS_ASSESSMENT', 
           query = {'time_bucket':'2015-04-23 14-hour'}, outputFormat='json'" /tmp/variety/variety.js
    """
    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.singleInstance = True
        # Uncomment below line if want to use any other mongoDB.
        #self.db = get_mongo_db()

    def run(self, **kwargs):
        
        GenericTask.run(self, **kwargs)
        stime = time.time()
        try:
            log.info("EventParametersTask kwargs:%s" % kwargs)
            event_type = kwargs.get('event_type', '')
            frequency = kwargs.get('frequency', '').lower()
            if not (event_type and frequency):
                log.info("No event_type/frequency provided.")
                raise Exception("No event_type/frequency provided.")

            if frequency in ['hour', 'day', 'week', 'month']:
                time_bucket = get_time_bucket(frequency)
            else:
                log.info("Invalid requency provided, frequency:%s" % frequency)
                raise Exception("Invalid requency provided, frequency:%s" % frequency)
            
            if event_type == "ALL":
                colls = self.db.collection_names()
                resolved_colls = filter(lambda x:x.startswith('Resolved'), colls)
            else:
                resolved_colls = [event_type]

            if not resolved_colls:
                log.info("No resolved collections exists.")
                raise Exception("No resolved collections exists.")
            log.info("Resolved collenctions:[%s]" % str(resolved_colls))
            log.info("Time Bucket:%s" % time_bucket)

            variety_data = open(variety_path).read()
            variety_code = Code(variety_data)
            variety_tmpl = "collection = '%s', query = {'time_bucket':'%s'}, outputFormat='json'"

            # Process all the resolved collections.
            for resolved_coll in resolved_colls:
                coll_name = resolved_coll.replace('Resolved_', '')
                log.info("Processing collection:%s" % resolved_coll)
                # Set the required variables Eg. collection, query , outputFormat etc..
                eval_code = variety_tmpl % (resolved_coll, time_bucket)
                log.info("Executing eval_code: [%s]" % eval_code)
                self.db.eval(eval_code)
                # Run the variety code
                results = self.db.eval(variety_code)
                new_parameters = []
                for result in results:
                    name = result['_id']['key']
                    # . not allowed in mongodb document key, so replace it with #
                    name = name.replace('.', '#')
                    values = result['value']['types']
                    new_parameters.append({name:values})

                # Add the eventParameters to the database
                record = self.db.EventParameters.find_one({'eventType':coll_name})
                if not record:
                    record = {'eventType':coll_name, 'parameters':new_parameters}
                    self.db.EventParameters.insert(record)
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
                self.db.EventParameters.update({'eventType':coll_name}, {'$set':{'parameters':all_parameters}})
                log.info("Updated eventParameters for eventType:%s" % coll_name)
        except Exception as e:
            import traceback
            log.info("Unable to get event parameters for the collection, Error:%s" % (str(e)))
            log.info("Traceback:%s" % str(traceback.print_exc()))
            raise e
    
        print "Time Taken: %s" % (time.time() - stime)   

def get_time_bucket(frequency):
    """
    """
    time_bucket = None
    dt = datetime.now()
    if frequency == "hour":
        # Prepare the time bucket for last hour
        dt = dt - timedelta(hours=1)
        time_bucket = dt.strftime('%Y-%m-%d %H-hour')
    elif frequency == "day":
        dt = dt - timedelta(days=1)
        time_bucket = dt.strftime('%Y-%m-%d-day')
    elif frequency == "week":
        week_day = dt.isoweekday() + 1
        last_week_dt = dt - timedelta(days=week_day)
        week_no = last_week_dt.isocalendar()[1]
        time_bucket = '%s-%s-week' % (last_week_dt.year, week_no)
    elif frequency == "month":
        last_month_dt = dt - timedelta(dt.day)
        time_bucket = '%s-%s-month' % (last_month_dt.year, last_month_dt.month)
    return time_bucket

def get_mongo_db():
    """Get mongodb.
    """
    # MongoDB configuration
    db_hostname = 'localhost'
    db_port = 27017
    db_name = 'dexter'
    db_username = 'adsadmin'
    db_password = 'D-coD43'
    db_replica_set = 'rs0'
    db_username = None
    db_password = None
    db_replica_set = None
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
