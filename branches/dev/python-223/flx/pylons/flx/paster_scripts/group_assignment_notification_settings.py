from flx.model import api

def run():
    assignEventType = api.getEventTypeByName('ASSIGNMENT_ASSIGNED')
    deleteEventType = api.getEventTypeByName('ASSIGNMENT_DELETED')

    groups = api.getGroups(pageNum=1, pageSize=0).results
    for group in groups:
        if group.id == 1:
            continue

        members = api.getGroupMembers(group=group).results
        for member in members:
            if member[0].roleID == 14:
                assignNotification = api.addGroupNotificationSetting(eventType='ASSIGNMENT_ASSIGNED', groupID=group.id, subscriberID=member[0].memberID)
                deleteNotification = api.addGroupNotificationSetting(eventType='ASSIGNMENT_DELETED', groupID=group.id, subscriberID=member[0].memberID)
