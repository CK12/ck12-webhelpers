import os, sys
import glob
import pprint
from datetime import datetime
from flx.model import api
from pylons import config
from pylons import app_globals as g

def run():
    dir_path = '/opt/2.0/flx/pylons/flx/data/images/group_system_images'

    resourceDict = {}

    resourceDict['resourceType'] = api.getResourceTypeByName(name="group system image")
    resourceDict['uriOnly'] = False
    resourceDict['isExternal'] = False
    resourceDict['isPublic'] = True
    resourceDict['description'] = ''
    resourceDict['ownerID'] = api.getMemberByLogin(login=(config.get('ck12_editor') if config.get('ck12_editor') else 'ck12editor')).id

    #for fn in os.listdir(dir_path):
    os.chdir(dir_path)
    for fn in glob.glob("*.png"):
        rd = resourceDict.copy()
        rd['name'] = fn
        rd['uri'] = open(os.path.join(dir_path, fn), 'rb')
        rd['creationTime'] = datetime.now()

        resourceRevision = api.createResource(resourceDict=rd, commit=True)
        pprint.pprint(g.resourceHelper.getResourceInfo(resourceRevision))

