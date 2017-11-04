#
# Copyright 2007-2014 CK-12 Foundation
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
# This file originally written by Somnath Zankar
#


#import flx.lib.viewer.ck12doc.ck12doc as document
import logging
import os
import urllib
import urllib2
import simplejson
from flx.lib import helpers as h

config = h.load_pylons_config()
file_formats = config.get('dv_supported_file_formats','doc,pdf,ppt,docx,pptx')
box_url = config.get('box_url','https://view-api.box.com/1/')
box_view_token = config.get('box_view_token','g548kcbg42okykuowon6k5gtierge3jk')

log = logging.getLogger(__name__)

class BoxViewer(object):
    """
    class to Upload document and return document_id of Box Viewer
    """

    def boxUpload(self, resourceURL):
        """
        Method to upload document and return document_id
        """
        url = box_url+'documents'
        log.info('Document Box URL---:%s'%(url))
        params = {"url":resourceURL}
        log.info('Document Box params---:%s'%(params))
        params = simplejson.dumps(params)
        
        token = "Token "+ box_view_token
        headers = { "Content-type" : "application/json","Authorization": token }
        try:
            req = urllib2.Request(url, params, headers)
        
            response = urllib2.urlopen(req)
            the_page = response.read()
            data = simplejson.loads(the_page)
            log.info('Document Box data---:%s'%(data))
            return data['id']
            
        except urllib2.HTTPError as e:
            error_message = e.read()
            log.error('Error creating document_id for box viewer : %s'%( error_message))
        
    @staticmethod
    def isFormatSupported(file_name):
        # a comma separated list of supported file formats 
        global file_formats
        if file_name:
            fileName, fileExtension = os.path.splitext(file_name)
            fileExtension = fileExtension[1:]
            if fileExtension in file_formats:
                return True
        return False


