import os, sys
import glob
import pprint
from datetime import datetime
from flx.model import api
from pylons import config
from pylons import app_globals as g

def run():
    joinEventType = api.getEventTypeByName('GROUP_MEMBER_JOINED')
    shareEventType = api.getEventTypeByName('GROUP_SHARE')

    notifications = api.getNotificationsByFilter(filters=[('eventTypeID', joinEventType.id)])
    for notification in notifications:
        api.deleteNotification(notification.id)

    notifications = api.getNotificationsByFilter(filters=[('eventTypeID', shareEventType.id)])
    for notification in notifications:
        api.deleteNotification(notification.id)

    groups = api.getGroups().results

    for group in groups:
        members = api.getGroupMembers(group=group).results
        
        for member in members:
            if member[0].roleID == 15:
                joinNotification = api.addGroupNotificationSetting(eventType='GROUP_MEMBER_JOINED', groupID=group.id, subscriberID=member[0].memberID)
            shareNotification = api.addGroupNotificationSetting(eventType='GROUP_SHARE', groupID=group.id, subscriberID=member[0].memberID)

