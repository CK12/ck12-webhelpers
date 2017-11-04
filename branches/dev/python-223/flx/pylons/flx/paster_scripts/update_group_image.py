import os
from datetime import datetime
from pylons import config
from flx.model import api

def run(groupID, imagePath):
    resourceDict = {}

    if not os.path.isfile(imagePath):
        print 'Error: File not found [%s]' % imagePath
        return

    group = api.getGroupByID(groupID)
    if group is None:
        print 'Error: No such group [%d]' % groupID
        return

    fn = os.path.basename(imagePath)

    resourceDict['resourceType'] = api.getResourceTypeByName(name="group user image")
    resourceDict['uriOnly'] = False
    resourceDict['isExternal'] = False
    resourceDict['isPublic'] = True
    resourceDict['description'] = ''
    resourceDict['ownerID'] = api.getMemberByLogin(login=(config.get('ck12_editor') if config.get('ck12_editor') else 'ck12editor')).id
    resourceDict['name'] = fn
    resourceDict['uri'] = open(imagePath, 'rb')
    resourceDict['creationTime'] = datetime.now()

    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)

    upGroup = api.updateGroup(group=group, newGroupName=group.name, newGroupDesc=group.description, groupType=group.groupType, groupScope=group.groupScope, resourceRevisionID=resourceRevision.id)
    if upGroup is None:
        print 'Error: error updating group'
    else:
        print upGroup.asDict()
