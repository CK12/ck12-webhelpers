#!/usr/bin/python
import pprint
import logging
import os
import requests
import json
import httplib2
import re
from urllib2 import build_opener
from apiclient.discovery import build
from oauth2client.client import AccessTokenCredentials
from gdata.spreadsheet.service import SpreadsheetsService
from tempfile import NamedTemporaryFile, mkdtemp
import urllib2

import flx.lib.helpers as h
from flx.lib.unicode_util import UnicodeWriter
#from unicode_util import UnicodeWriter

# Initialise Logger
log = logging.getLogger(__name__)

DOCUMENT_TYPE = 'application/vnd.google-apps.spreadsheet'

class GDTCSVDownloader(object):

    def __init__(self):
        """Initialise the required parameters from config
        """
        self.config = h.load_pylons_config()
        self.client_id = self.config.get('client_id', '')
        self.client_secret = self.config.get('client_secret', '') 
        self.refresh_token = self.config.get('refresh_token', '') 
        self.refresh_token_url = self.config.get('refresh_token_url', '') 
        if not (self.client_id and self.client_secret and self.refresh_token 
                and self.refresh_token_url):
            raise Exception("Please set the required configuration parameters.")

    def get_oauth_credentials(self):
        data = {'client_id':self.client_id, 'client_secret':self.client_secret, 
                'refresh_token':self.refresh_token, 'grant_type':'refresh_token'}

        response = requests.post(self.refresh_token_url, data)
        response_json = json.loads(response.text)
        if not response_json.has_key('access_token'):
            raise Exception("Unable to get Access Token Error:%s" % str(response_json))
        access_token = response_json['access_token']
        credentials = AccessTokenCredentials(access_token, 'ck12-user-agent/1.0')
        
        if credentials.invalid or credentials.access_token_expired:
            log.info("Google Auth Credentials/Token expired. Access Token: %s" % access_token)
            credentials.refresh(http = httplib2.Http())
            log.info("Google Auth Token after refresh. Access Token: %s" % credentials.access_token)

        return credentials


    def gss_get(self, output, doc, worksheet=None, login=None, password=None):
        if not output:
            fdout = sys.stdout
        else:
            fdout = output
        csvout = UnicodeWriter(fdout)

        credentials = self.get_oauth_credentials()

        # Build the Service and get the spreadsheet
        http = httplib2.Http()
        http = credentials.authorize(http)
        service = build('drive', 'v2', http=http)
        file_info = self.get_google_doc_info(service, doc)
        ss_key = file_info['id']

        if not worksheet:
            # No worksheet specified so Download the first file.
            log.warn("No worksheet specified. Will use the first one!")
            self.download_file(service, ss_key, output)
        else:
            ws_key = None
            # Get the spreadsheet cliet
            client = SpreadsheetsService(additional_headers={'Authorization' : 'Bearer %s' % credentials.access_token})
            # Get the worksheet id of the spreadsheet
            worksheet_lw = worksheet.lower()
            for w in client.GetWorksheetsFeed(ss_key).entry:
                if w.title.text.lower() != worksheet_lw:
                    continue
                ws_key = w.id.text.rsplit('/', 1)[1]
                ws_name = w.title.text   
                break
            if ws_key == None:
                raise IOError, 'spreadsheet %s ok, worksheet %s not found' % (doc, worksheet)
            log.info("Found worksheet: %s" % ws_name)

            fields, fields_exact = self.google_get_header(client, ss_key, ws_key)
            log.info("Fields: %s" % fields)
            log.info("Fields Exact: %s" % fields_exact)

            csvout.writerow(fields)
            listfeed = client.GetListFeed(ss_key, ws_key)
            t = len(listfeed.entry)
            i = 0
            for lf in listfeed.entry:
                log.info('%03d/%03d: getting row' % (i, t))
                if i == 0: log.info("lf.custom: %s" % str(lf.custom))
                i = i + 1
                lu = [ lf.custom[f].text for f in fields ]
                lt = []
                for c in lu:
                    ct = c
                    if isinstance(c, type(None)):
                        ct = u''
                    lt.append(ct)
                csvout.writerow(lt)
            if output:
                output.close()

    
    def google_get_header(self, client, ss_key, ws_key):
        re_special = re.compile(r'[^0-9a-zA-Z-\.]*')
        log.info('Getting header')
        cellfeed = client.GetCellsFeed(ss_key, ws_key)
        fields = []
        fields_exact = []
        for c in cellfeed.entry:
            if c.title.text[1:] != '1':
                continue
            fields.append(re_special.sub('', c.content.text.lower()))
            fields_exact.append(c.content.text)
        return fields, fields_exact

    def download_file(self, service, file_id, output):
        """Download a Drive file's content to the local filesystem.
        """
        from apiclient import errors
        from apiclient import http as http_media

        file = service.files().get(fileId=file_id).execute()
        download_link = file['exportLinks']['text/csv']
        resp, content = service._http.request(download_link)        
        output.write(content)
        output.close()

        return

    def get_google_doc_info(self, service, title):
        """Return the google doc info of the given title.
        """
        file_info = None
        query = "title contains '%s' and mimeType = '%s'" % (title, DOCUMENT_TYPE)
        param = {'q':query}
        files = service.files().list(**param).execute()

        for file_info in files['items']:
            if file_info['title'].lower() == title.lower():
                break

        if not file_info:
            raise Exception("No spreadsheet exists with the name:%s" % title )
        return file_info
def main():
    obj = GDTCSVDownloader()
    # Account akshay.valsa@ck12.org
    obj.client_id = '1039000837333-8mjfgf4u28o0hbeh9ahl9lh1v5f6d032.apps.googleusercontent.com'
    obj.client_secret = 'vD2CitXJqmD7iJd5NGuh5cLg'
    obj.refresh_token = '1/qfQ3nXPiaKIUFk-DimmH_1U5CaId2BIPgAsKgdVxH7Q'
    obj.refresh_token_url = 'https://www.googleapis.com/oauth2/v3/token'
    #local_fd = open('/tmp/test_file.csv', 'w')
    #obj.gss_get(local_fd, 'NG Simulations', worksheet='Production')


if __name__ == '__main__':
    main()
