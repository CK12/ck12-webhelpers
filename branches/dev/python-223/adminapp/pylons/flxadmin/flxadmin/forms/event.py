#
# Copyright 2011-201x CK-12 Foundation
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
# This file originally written by John Leung
# $Id:$

import formencode
from formencode import validators
from flxadmin.lib import helpers as h
from flxadmin.forms import options


class Notifications:
    events = types = h.get_sel('/get/info/eventtypes', 'eventTypes', 
        ('id', 'name'), 'name', 'eventTypeID,', ('', 'All'))
    rules = h.get_sel('/get/info/notificationrules', 'notificationRules', 
        ('name', 'name'), 'name')

class EventsForm(formencode.Schema, Notifications):
    """ Events listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'),
     ('Owner', 'ownerID', 'sortable'),
     ('Event Type', 'eventTypeID', 'sortable'),
     ('Object', 'objectType'),
     ('Description', 'typeDesc'),
     ('Created', 'created', 'sortable'),
    ]]
    

class NotificationsForm(formencode.Schema, Notifications):
    """ Notifications listing Form 
    """
    listhead = [ h.htmldiv(*vals) for vals in [
     ('Id', 'id'),
     ('Event Type', 'eventTypeID', 'sortable'),
     ('Via', 'notificationType'),
     ('Frequency', 'frequency', 'sortable'), 
     ('Subscriber', 'subscriber'),
     ('Last Sent', 'lastSent', 'sortable'),
     ('Created', 'created', 'sortable'),
     ('Updated', 'updated', 'sortable'),
    ]]
    listhead_short = [ h.htmldiv(*vals) for vals in [
     ('Event Type', 'eventTypeID', 'sortable'),
     ('Last Sent, Freq, Via', 'lastSent', 'sortable'), 
     ('Updated', 'updated', 'sortable'),
    ]]
    # email is the only type avail now
    # types = [('???TypeID,'+s, s.capitalize()) for s in options.notification_types]
    # types.insert(0, ('???TypeID,', 'All'))
    freqs = [('frequency,'+s, s.capitalize()) for s in options.notification_freqs]
    freqs.insert(0, ('frequency,', 'All'))

class NotificationForm(formencode.Schema, Notifications):
    id = validators.String()
    eventType = validators.String()
    objectID = validators.String(strip=True) # may be encodedID, so no Int()
    objectType = validators.String(strip=True)
    notificationType = validators.String()
    rule = validators.String()
    frequency = validators.String()
    resetLastSent = validators.String(if_missing='false')
    address = validators.String(strip=True)
    allow_extra_fields = True
    
    freqs = options.notification_freqs
    types = options.notification_types

class NewNotificationForm(formencode.Schema, Notifications):
    sel_msg = {'empty': 'Please make a selection'}
    int_msg = {'integer': 'Please enter an integer or leave empty'}
    eventType = validators.String(not_empty=True, messages=sel_msg)
    objectID = validators.String(strip=True) # may be encodedID, so no Int()
    objectType = validators.String(strip=True)
    notificationType = validators.String()
    rule = validators.String()
    frequency = validators.String(not_empty=True, messages=sel_msg)
    address = validators.String(strip=True)
    impersonateMemberID = validators.Int(messages=int_msg)
    allow_extra_fields = True

    freqs = options.notification_freqs
    types = options.notification_types

class MaintenanceNotificationForm(formencode.Schema, Notifications):
    hasNotification = validators.String()
    systemNotification = validators.String(strip=True, not_empty=True)
    allow_extra_fields = True

    listhead = [ h.htmldiv(*vals) for vals in [
     ('', ''),
     ('Notification Message', '')
    ]]