import json
import logging

from celery.task import Task
from flx.model import api
from flx.lib import helpers as h
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.phone_home import DownloadStats

logger = logging.getLogger(__name__)

class PhoneHomeTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.routing_key = "print"

    def run(self, **kwargs):

        GenericTask.run(self, **kwargs)
        try:
            stats = {}
            downloadStats = DownloadStats.DownloadStats(logger)
            logger.info('Getting the GA stats for www.ck12.org')
            totalGAStats = downloadStats.getGATotalStats()
            logger.info('Total GA stats for www.ck12.org: %d', totalGAStats)
            logger.info('Updating DownloadStats table with total GA stats')
            api.updateDownloadCountFor(downloadType='GA Total Stats', count=totalGAStats)
            stats['GA Total Stats'] = totalGAStats

            logger.info('Getting the GA stats for iNAP')
            totalINAPStats = downloadStats.getINAPTotalStats()
            logger.info('Total iNAP stats: %d', totalINAPStats)
            logger.info('Updating DownloadStats table with total iNAP stats')
            api.updateDownloadCountFor(downloadType='GA INAP Total Stats', count=totalINAPStats)
            stats['GA INAP Total Stats'] = totalINAPStats

            logger.info('Getting the GA stats for Brain Genie')
            totalBrainGenieStats = downloadStats.getBrainGenieStats()
            logger.info('Total BrainGenie stats: %d', totalBrainGenieStats)
            logger.info('Updating DownloadStats table with total BrainGenie stats')
            api.updateDownloadCountFor(downloadType='GA BrainGenie Total Stats', count=totalBrainGenieStats)
            stats['GA BrainGenie Total Stats'] = totalBrainGenieStats

            logger.info('Updating DownloadStats table completed successfully')
            self.userdata = json.dumps(stats)
            return 'Updating DownloadStats table completed successfully'
        except Exception as e:
            logger.error('Updating DownloadStats table failed: %s' %(e.__str__()))
            return 'Updating DownloadStats table failed: %s' %(e.__str__())


class ExecutiveEmailTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.routing_key = "print"

    def run(self, **kwargs):

        GenericTask.run(self, **kwargs)
        try:
            logger.info('Sending executive email task')
            downloadStatsList = ['GA Total Stats', 'Apple AppStore', 'Amazon Kindle Store', 'Google Play/Books']
            downloadStats = {}
            downloadStatTypes = api.getDownloadStatsTypes()
            for eachDownloadStat in downloadStatTypes:
                if eachDownloadStat[0] in downloadStatsList:
                    downloadStats[eachDownloadStat[0]] = {'count': eachDownloadStat[1], 'lastUpdateTime': eachDownloadStat[2].strftime("%Y-%m-%d %H:%M:%S")}
            logger.info('Download Stats: [%s]' %(downloadStats))
            eventTypeName = 'EXECUTIVE_EMAIL'
            #eventTypeForExecutiveEmail = api.getEventTypeByName(typeName=eventTypeName)
            #notification = api.createNotification(eventTypeID=eventTypeForExecutiveEmail.id, objectID=artifact.id, objectType='artifact', type='email', subscriberID=member.id, frequency='instant')
            event = api.createEventForType(typeName=eventTypeName, objectID=None, objectType=None, eventData=json.dumps(downloadStats), ownerID=1, processInstant=True)
            h.processInstantNotifications([event.id], notificationIDs=[181590], user='thejaswi@ck12.org', noWait=True)
            return 'Done executing executive email task'
        except Exception as e:
            logger.error('Sending executive email failed: %s' %(e.__str__()))
            return 'Sending executive email failed: %s' %(e.__str__())
