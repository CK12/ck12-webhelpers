#
# Copyright 2007-2013 CK-12 Foundation
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
# This file originally written by Javed Attar
#
# $Id$

from flx.controllers.celerytasks.webthumbnail import GenerateThumbnails
from datetime import datetime

def help():
    print "webthumbnail_generation.run()"
    print "fromDate and toDate in mm/dd/yyyy format: To generate thumbnails for all modalities between date range"
    print "force=True: To generate thumbnails for all modalities irrespective of previous and current generation time difference"
    print "newOnly=True: To generate thumbnails for only new modalities ()"

def run(fromDate=None, toDate=None, newOnly=False, force=False, handle=None):
    """
        Generate cover pages for web modalities
    """
    if (not fromDate and toDate) or (not toDate and fromDate):
        raise Exception("Please supply date range. fromDate and toDate")
    if fromDate and toDate:
        try:
            datetime.strptime(fromDate.strip(),'%m/%d/%Y')
            datetime.strptime(toDate.strip(),'%m/%d/%Y')
        except Exception, e:
            raise Exception("Enter Date in correct format")
    td = GenerateThumbnails()
    task = td.delay(newOnly=newOnly, fromDate=fromDate, toDate=toDate, force=force, handle=handle)
    return task.task_id
