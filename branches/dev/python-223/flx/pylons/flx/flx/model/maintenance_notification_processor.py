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
# $Id:$

from xml.dom import minidom
from pylons import config
import logging
from pylons.i18n.translation import _
from flx.controllers import decorators as d
import json
log = logging.getLogger( __name__ )

class NotificationModel( dict ):

    def __init__( self, dict_obj=None ):
        '''
        Constructs the model object using the key/values from the dict object
        '''
        if dict_obj:
            for key, value in dict_obj.items():
                self[key] = dict_obj[key]

    def __decode__(self,obj):
        if type(obj) == dict:
            for key, value in obj.items():
                obj[key] = self.__decode__(value)
        elif type(obj) == list:
            for index,value in enumerate(obj):
                obj[index] = self.__decode__(value)
        elif type(obj) == str:
            obj = obj.decode('utf-8')
        return obj

    def __getitem__(self, key):
        return dict.get(self, key)


class MaintenanceNotificationManager():
    
    processed_configuration = None
    configuraionFilePath = None
    docElement = None

    @staticmethod
    #@trace
    def getHandles():
        try:
            MaintenanceNotificationManager.configurationFilePath =  "%s/%s" % (config.get('flx_home').strip(), config.get('maintenance_configuration_path').strip())
            MaintenanceNotificationManager.docElement = minidom.parse(MaintenanceNotificationManager.configurationFilePath)
            notification_conf = MaintenanceNotificationManager.docElement.getElementsByTagName('Notifications')
            MaintenanceNotificationManager.notifications = notification_conf[0].getElementsByTagName('Notification')
        except Exception, e:
            log.error((_(u'Error parsing maintenance notification configuration. Invalid xml format : %s' % (str(e)))).encode("utf-8"))
            raise e

    @staticmethod
    @d.ck12_cache_region('forever', invalidation_key='maintenancenotification')
    def get_notification():
        """
           parse the configuration from xml and create notification
        """
        #if MaintenanceNotificationManager.processed_configuration:
        #    notifications = MaintenanceNotificationManager.processed_configuration
        #    return notifications
        
        log.debug("reading notification configuration file")
        MaintenanceNotificationManager.getHandles()
        notifications = []
        for notification in MaintenanceNotificationManager.notifications:
            param_list = notification.getElementsByTagName('Param')
            dict_obj = {}
            dict_obj['id'] = notification.getAttribute('sequence')
            for param in param_list:
                try:
                    name = param.getElementsByTagName('Name')[0].firstChild.nodeValue
                    value = param.getElementsByTagName('Value')[0].firstChild.nodeValue \
                        if param.getElementsByTagName('Value')[0].firstChild else ''
                    if value.lower() == 'true':
                        value = True
                    elif value.lower() == 'false':
                        value = False
                    dict_obj[name] = value
                except Exception, e:
                    log.error((_(u'Error modalities configuration: %s ' % (str(e)))).encode("utf-8"))
            notifications.append(NotificationModel(dict_obj=dict_obj))
        MaintenanceNotificationManager.processed_configuration = notifications
        return notifications
    
    @staticmethod
    def update_notification_configuration(newNotifications):
        """
            update the system maintenance notification
        """
        response = {}
        MaintenanceNotificationManager.getHandles()
        configuration_changed = False
        try :
            for notification_obj in MaintenanceNotificationManager.notifications:
                seq_id = notification_obj.getAttribute('sequence').strip()
                if not isinstance(newNotifications, list):
                    newNotifications = json.loads(newNotifications)
                
                for notification in newNotifications:
                    if not notification.has_key("id") or not notification.get("id"):
                        response['status'] = (_(u'error' )).encode("utf-8")
                        response['message'] = (_(u'Notification id missing.' )).encode("utf-8")
                        return response
                    if not notification.has_key('message') or not notification.get('message'):
                        response['status'] = (_(u'error' )).encode("utf-8")
                        response['message'] = (_(u'Notification message missing.' )).encode("utf-8")
                        return response

                    if int(seq_id) == notification.get('id'):
                        params_list = notification_obj.getElementsByTagName('Param')
                        for param in params_list:
                            name = param.getElementsByTagName('Name')[0]
                            nodeName = name.firstChild.nodeValue
                            value = param.getElementsByTagName('Value')[0]
                            if value.firstChild:
                                nodeValue = value.firstChild.nodeValue
                            else:
                                nodeValue = ''
                            if nodeName == 'status' and notification.get(nodeName) == True:
                                from datetime import datetime
                                notification['updateTime'] = datetime.now().__format__('%d-%m-%Y %H:%M:%S')
                            if notification.has_key(nodeName) and notification.get(nodeName) !=  nodeValue :
                                configuration_changed = True
                                if not value.firstChild:
                                    valuetxt = MaintenanceNotificationManager.docElement.createTextNode(notification.get(nodeName))
                                    value.appendChild(valuetxt)
                                else:
                                    value.firstChild.nodeValue =  notification.get(nodeName)
        except Exception, e:
            log.error((_(u'Error updating settings: %s' % (str(e)))).encode("utf-8"))
            return Exception((_(u'Error updating settings: %s' % (str(e)))).encode("utf-8"))
        try :
            if configuration_changed == True:
                f = open(MaintenanceNotificationManager.configurationFilePath, 'w')
                MaintenanceNotificationManager.docElement.writexml(f,encoding = 'UTF-8')
                f.close()
            else:
                response['status'] = (_(u'error' )).encode("utf-8")
                response['message'] = (_(u'No changes made.' )).encode("utf-8")
                return response
        except Exception, e:
            log.error((_(u'Error writing to xml: %s' % (str(e)))).encode("utf-8"))
            raise Exception((_(u'Error writing to xml : %s' % (str(e)))).encode("utf-8"))

        response['status'] = (_(u'success' )).encode("utf-8")
        response['message'] = (_(u'Settings changed.' )).encode("utf-8")
        return response
