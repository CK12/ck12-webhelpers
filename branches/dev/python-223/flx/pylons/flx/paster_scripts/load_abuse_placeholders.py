import logging
import os
import urllib
from datetime import datetime

from flx.model import api
from flx.model import meta

log = None

def run():
    dir = '/opt/2.0/flx/pylons/flx/flx/public/media/images/placeholders'
    images = ['emb_video_copyright.png', 'emb_video_inapp.png', 'emb_video_malcontent.png', 'emb_video_na.png', 'imgdisabled_copyright.jpg', 'imgdisabled_disable.jpg', 'imgdisabled_inappropriate.jpg']

    for image in images:
        path = os.path.join(dir, image)
        print 'Creating resource for path[%s]' % path
        rr = create_resource(path, 1, 'image', '')
        print 'rr.id[%s] id[%s]' % (rr.id, rr.resource.id)

def create_resource(resourcePath, user_id, resourceType, desc, license=None):
    session = meta.Session()
    resourceDict = {}
    path, name = os.path.split(resourcePath)
    resourceDict['uri'] = open(resourcePath, "rb")
    resourceDict['uriOnly'] = False
    resourceDict['isExternal'] = False
    resourceDict['isAttachment'] = False
    resourceDict['isPublic'] = False
    resourceDict['resourceType'] = api.getResourceTypeByName(name=resourceType)
    resourceDict['name'] = name
    resourceDict['description'] = desc
    language = api.getLanguageByName(name='English')
    resourceDict['languageID'] = language.id
    resourceDict['ownerID'] = user_id   
    resourceDict['creationTime'] = datetime.now()
    resourceDict['authors'] = None
    resourceDict['license'] = license
    return api.createResource(resourceDict=resourceDict, commit=True)
