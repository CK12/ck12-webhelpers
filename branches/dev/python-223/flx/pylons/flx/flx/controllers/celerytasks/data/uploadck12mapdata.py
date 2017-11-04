import logging
from datetime import datetime
from datetime import timedelta
import MySQLdb as mdb

from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib import helpers as h

import argparse

from apiclient import discovery
import httplib2

from oauth2client.client import SignedJwtAssertionCredentials
from oauth2client import tools
from apiclient.http import MediaFileUpload
import time

log = logging.getLogger(__name__)

# Initialise Logger
#hdlr = logging.StreamHandler()
#formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
#hdlr.setFormatter(formatter)
#log.addHandler(hdlr)
#log.setLevel(logging.INFO)

class UploadMapDataTask(GenericTask):
    """Class to upload ck12 map data.
    """
    recordToDB = False
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.config = h.load_pylons_config()

        self.server_account_api_key = self.config.get('server_account_api_key')
        self.server_account_email = self.config.get('server_account_email')
        self.server_account_p12_key = self.config.get('server_account_p12_key')
        self.project_id = self.config.get('project_id')
        self.map_id = self.config.get('map_id')

        self.state_file = self.config.get('state_file')
        self.city_file = self.config.get('city_file')
        self.zipcode_file = self.config.get('zipcode_file')

    def buildService(self):
        """
        """
        # Load the key in PKCS 12 format that you downloaded from the Google API
        # Console when you created your Service account.
        with file(self.server_account_p12_key, 'rb') as key_file:
            key = key_file.read()

        # Create an httplib2.Http object to handle our HTTP requests and to
        # authorize them correctly.
        #
        # Note that the first parameter, service_account_name, is the Email address
        # created for the Service account. It must be the email address associated
        # with the key that was created.
        credentials = SignedJwtAssertionCredentials(
          self.server_account_email,
          key,
          scope='https://www.googleapis.com/auth/mapsengine')
        http = httplib2.Http()
        http = credentials.authorize(http)

        # Read the first page of features in a Table.
        self.service = discovery.build('mapsengine', 'v1', http=http, developerKey=self.server_account_api_key)

        log.info("Got the service")

    def create_ck12_map_tables(self):
        """Create the vector tables for State , City and Zipcodes.
        """
        log.info("Processing CK-12 States")
        # Add States Vector Data
        ds_name = "CK-12 States"
        filename = "CK-12_States.csv"
        state_table_id = self.upload_vector_data(ds_name, filename, self.state_file)

        log.info("Processing CK-12 Cities")
        # Add States Vector Data
        ds_name = "CK-12 Cities"
        filename = "CK-12_Cities.csv"
        city_table_id = self.upload_vector_data(ds_name, filename, self.city_file)

        log.info("Processing CK-12 Zipcodes")
        # Add States Vector Data
        ds_name = "CK-12 Zipcodes"
        filename = "CK-12_Zipcodes.csv"
        zipcode_table_id = self.upload_vector_data(ds_name, filename, self.zipcode_file)

        return (state_table_id, city_table_id, zipcode_table_id)

    def create_ck12_map_layer(self, table_id, name, layer_style):
        """Create the map layers for State , City and Zipcodes.
        """
        layer_body = {}
        layer_body['name'] = name
        layer_body['projectId'] = self.project_id
        layer_body['datasources'] = [{'id':table_id}]
        layer_body['datasourceType'] = 'table'
        layer_body['style'] = layer_style
        layer_request = self.service.layers().create(body=layer_body)
        time.sleep(5)
        layer_response = layer_request.execute()
        layer_id = layer_response['id']
        log.info("Created layer %s: %s"% (layer_body['name'], layer_id))
        self.service.layers().process(id=layer_id).execute()
        self.pollOnStatus('layer', layer_id, 'processingStatus', 'complete')
        log.info("Processed layer %s: %s"% (layer_body['name'], layer_id))
        layer_response = self.service.layers().publish(id=layer_id).execute()
        self.pollOnStatus('layer', layer_id, 'publishingStatus', 'published')
        log.info("Published layer %s: %s"% (layer_body['name'], layer_id))

        return layer_id

    def pollOnStatus(self, entity_type, entity_id, status_key, status_value):
        """
        """
        time.sleep(1)
        if status_key == "deletingStatus":
            while True:
                if entity_type == 'layer':
                    results = self.service.layers().list(projectId=self.project_id).execute()
                    layers = results['layers']
                    layer_ids = [layer['id'] for layer in layers]
                    print layer_ids
                    if entity_id not in layer_ids:
                        break
                    time.sleep(5)
                if entity_type == 'table':
                    results = self.service.tables().list(projectId=self.project_id).execute()
                    tables = results['tables']
                    table_ids = [table['id'] for table in tables]
                    print table_ids
                    if entity_id not in table_ids:
                        break
                    time.sleep(5)
        else:
            while True:
                if entity_type == 'layer':
                    response = self.service.layers().get(id=entity_id).execute()
                    status = response[status_key]
                    if status == status_value:
                        break
                    time.sleep(5)
                elif entity_type == 'map':
                    response = self.service.maps().get(id=entity_id).execute()
                    status = response[status_key]
                    if status == status_value:
                        break
                    time.sleep(5)
                else:
                    break
        time.sleep(1)

    def upload_vector_data(self, ds_name, filename, file_location):
        """
        """
        files = [{"filename":filename}]
        fileupload = {
            "projectId": self.project_id,
            "name": ds_name,
            "files": files,
        }
        tables = self.service.tables()
        request = tables.upload(body=fileupload)
        time.sleep(1)
        response = request.execute()
        table_id = response['id']
        log.info("Created empty placeholder asset for %s" %ds_name)
        
        media = MediaFileUpload(file_location, mimetype='text/csv')
        request = tables.files().insert(id=table_id,filename=filename, media_body=media)
        response = request.execute()

        while True:
            request = tables.get(id=table_id)
            response = request.execute()
            status = response['files'][0]['uploadStatus']
            if status == "complete":
                break
            time.sleep(5)
        log.info("Uploaded vector data for %s: %s" % (ds_name, table_id))
        return table_id

    def run(self):
        """
        """
        self.buildService()

        # Get the list of layers
        map_info = self.service.maps().get(id=self.map_id).execute()
        time.sleep(1)
        ex_layers = map_info['contents']
        ex_layer_ids = [ layer['id'] for layer in ex_layers]
        log.info("Get the exisiting layers :%s" % ex_layer_ids)

        # Create the State, city zipcode vector tables
        table_ids = self.create_ck12_map_tables()
        state_table_id, city_table_id, zipcode_table_id = table_ids

        # Create the State, city zipcode layers
        log.info("\nProcessing CK-12 State layers")
        state_layer_style = {u'featureInfo': {u'content': u"<div class='googft-info-window' style='font-family: sans-serif'>\n<b>State:</b> {state}<br>\n<b>CK-12 Teachers:</b> {state teachers}<br>\n<b>CK-12 Students:</b> {state students}<br>\n<b>Schools:</b> {state schools}<br>\n</div>"}, u'type': u'displayRule', u'displayRules': [{u'zoomLevels': {u'max': 5, u'min': 0}, u'pointOptions': {u'icon': {u'name': u'gx_orange_dot'}}, u'name': u'CK-12 States', u'filters': []}]}
        state_layer_id = self.create_ck12_map_layer(state_table_id, "CK-12 States", state_layer_style)

        log.info("\nProcessing CK-12 City layers")
        city_layer_style = {u'featureInfo': {u'content': u"<div class='googft-info-window' style='font-family: sans-serif'>\n<b>State:</b> {state}<br>\n<b>City:</b> {city}<br>\n<b>CK-12 Teachers:</b> {city teachers}<br>\n<b>CK-12 Students:</b> {city students}<br>\n<b>Schools:</b> {city schools}<br>\n</div>"}, u'type': u'displayRule', u'displayRules': [{u'zoomLevels': {u'max': 7, u'min': 5}, u'pointOptions': {u'icon': {u'name': u'gx_orange_dot'}}, u'name': u'Ck-12 Cities', u'filters': []}, {u'zoomLevels': {u'max': 10, u'min': 5}, u'pointOptions': {u'icon': {u'name': u'gx_orange_dot'}}, u'name': u'Display rule name', u'filters': []}]}
        city_layer_id = self.create_ck12_map_layer(city_table_id, "CK-12 Cities", city_layer_style)

        log.info("\nProcessing CK-12 Zipcode layers")
        zipcode_layer_style = {u'featureInfo': {u'content': u"<div class='googft-info-window' style='font-family: sans-serif'>\n<b>State:</b> {state}<br>\n<b>City:</b> {city}<br>\n<b>Zipcode:</b> {zipcode}<br>\n<b>CK-12 Teachers:</b> {zipcode teachers}<br>\n<b>CK-12 Students:</b> {zipcode students}<br>\n<b>Schools:</b> {zipcode schools}<br>\n</div>"}, u'type': u'displayRule', u'displayRules': [{u'zoomLevels': {u'max': 24, u'min': 10}, u'pointOptions': {u'icon': {u'name': u'gx_orange_dot'}}, u'name': u'CK-12 Zipcodes', u'filters': []}]}
        zipcode_layer_id = self.create_ck12_map_layer(zipcode_table_id, "CK-12 Zipcodes", zipcode_layer_style)

        # Add the new layer to map
        layer_contents = [{'id':state_layer_id, 'type':'layer'}, {'id':city_layer_id, 'type':'layer'}, {'id':zipcode_layer_id, 'type':'layer'}]
        map_response = self.service.maps().patch(id=self.map_id, body={'contents':layer_contents}).execute()    
        self.pollOnStatus('map', self.map_id, 'processingStatus', 'complete')
        log.info("Added layer to the map, id %s"%(self.map_id))

        map_response = self.service.maps().publish(id=self.map_id).execute()
        self.pollOnStatus('map', self.map_id, 'publishingStatus', 'published')
        log.info("Published map, id %s"%(self.map_id))

        log.info("Deleting existing layes and tables.")
        # unpublish and remove the layers
        ex_layer_table_ids = []
        for layer_id in ex_layer_ids:
            layer_response = self.service.layers().get(id=layer_id).execute()

            # Get vector tables under layer
            datasources = layer_response['datasources']
            publish_status = layer_response['publishingStatus']

            tmp_ids = [table['id'] for table in datasources]
            ex_layer_table_ids.extend(tmp_ids)
            if publish_status == 'published':
                self.service.layers().unpublish(id=layer_id).execute()
            self.pollOnStatus('layer', layer_id, 'publishingStatus', 'notPublished')
            self.service.layers().delete(id=layer_id).execute()
            self.pollOnStatus('layer', layer_id, 'deletingStatus', 'deleted')

        # Delete all the vector tables exisitng under layers
        for layer_table_id in ex_layer_table_ids:
            self.service.tables().delete(id=layer_table_id).execute()
            self.pollOnStatus('table', layer_table_id, 'deletingStatus', 'deleted')

