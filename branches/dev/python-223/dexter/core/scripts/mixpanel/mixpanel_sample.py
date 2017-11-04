import requests
import json
import base64
import calendar
from datetime import datetime, timedelta
import logging
from mixpanel import Mixpanel

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/mixpanel_insert.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

# CK-12 Analytics
#PROJECT_TOKEN = '0097d68bb53089517f638ace9464db0f'
#API_KEY = '1ae02154d5491a4d7d0cfdb5d86a7552'
# CK-12 Test
PROJECT_TOKEN = '657fed1b2b3213980209974573508d75'
API_KEY = '2a207a17cdf7352e6353b67652065928'
mixpanel_api = 'http://api.mixpanel.com/import/'


def main():
    # Insert into mixpanel
    mp = Mixpanel(PROJECT_TOKEN)
    distinct_id = 1
    event_type = 'My Test 1'
    event_params = {'key 1':'value 1'}
    log.info("\nInsert event_dict: %s" % event_params)
    mp.track(distinct_id, event_type, event_params)

    # Export to mixpanel
    event_params = {'Updated key 1':'Updated value 1'}
    dt = datetime.now() - timedelta(days=10)
    epoch_time = calendar.timegm(dt.timetuple())      
    event_properties = dict()
    event_properties['distinct_id'] = distinct_id
    event_properties['time'] = epoch_time
    event_properties['token'] = PROJECT_TOKEN
    event_properties.update(event_params)
    event_dict = {'event':event_type, 'properties':event_properties}
    # Record the event
    log.info("\nExport event_dict: %s" % event_dict)
    # Base64 encoding of the json of event dict
    json_data = json.dumps(event_dict)            
    encoded_data = base64.b64encode(json_data)
    api = "%s?data=%s&api_key=%s" % (mixpanel_api, encoded_data, API_KEY)
    log.info("Calling API:%s" % api)
    fp = requests.post(api)
    log.info("Response:%s " % fp)
    
if __name__ == "__main__":
    main()
