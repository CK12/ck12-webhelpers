#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Girish Vispute
#
# $Id$

from flxweb.lib.base import BaseController
from pylons.templating import render_jinja2
from pylons import config, tmpl_context as c
import urllib2, json
from datetime import datetime
from urllib import quote
import logging

log = logging.getLogger(__name__)

class MuruganController(BaseController):
    '''
    Controller for handling the health pages. 
    '''
    def __init__(self):
        self.spreadsheetKey = config.get('MURUGAN_SPREADSHEET_KEY')
        self.formKey = config.get('MURUGAN_FORM_KEY')
        log.info("Spreadsheet: %s" % self.spreadsheetKey)

    def murugan(self):
        c.formKey = self.formKey
        return render_jinja2('/murugan/murugan.html')

    def getComments(self):
        url = 'http://spreadsheets.google.com/feeds/cells/' + self.spreadsheetKey + '/2/public/basic?alt=json'
        log.info("Calling: %s" % url)
        r = urllib2.urlopen(url, timeout=30)
        resp = r.read()
        jResp = json.loads(resp)
        comments = []
        rowCount = 1
        i = 3
        title = timestamp = comment = ''
        while i < len(jResp['feed']['entry']):
            idx = i
            entry = jResp['feed']['entry'][idx]
            log.info("idx: %d, title: %s" % (idx, entry['title']['$t']))
            if entry['title']['$t'].startswith('A'):
                title = quote(entry['content']['$t']) if entry['content']['type'] == 'html' else entry['content']['$t']
            elif entry['title']['$t'].startswith('B'):
                comment = quote(entry['content']['$t']) if entry['content']['type'] == 'html' else entry['content']['$t']
            elif entry['title']['$t'].startswith('C'):
                dateStr = entry['content']['$t'].strip()
                if dateStr:
                    timestamp = datetime.strptime(entry['content']['$t'].strip(), '%m/%d/%Y %H:%M:%S')
                else:
                    break
            if timestamp:
                ## Row is complete
                if not title:
                    title = 'Anonymous'
                if comment:
                    ## Only add a row if comment is present
                    comments.append({'rowCount': rowCount, 'from': title, 'comment': comment, 'timestamp': timestamp})
                    rowCount += 1
                title = timestamp = comment = ''
            i += 1

        c.comments = comments
        return render_jinja2('/murugan/ajax_murugan_comments.html')
