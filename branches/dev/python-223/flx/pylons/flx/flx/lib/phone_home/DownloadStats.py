import datetime
import logging
import traceback

import gdata.analytics.client

import settings

class DownloadStats():
    '''DownloadStats class to retrieve the number of flexbook downloads tracked
    through Google Analytics, Amazon Kindle Store, Apple AppStore, Android
    Market, PhoneHome Feature and others'''

    def __init__(self, logger):
        '''
        1)Initialize the GA Username, Password from settings.py
        2) Establish connection and fetch the required profile from GA
        3) Fetch the DownloadStats model object from the DB '''

        self.GAUserName = settings.GA_USERNAME
        self.GAPassword = settings.GA_PASSWORD
        self.CK12AppName = settings.SOURCE_CK12_APP_NAME
        self.logger = logger
        self.logger.info("Attempting to connect to GA")
        try:
            self.client = gdata.analytics.client.AnalyticsClient(source=self.CK12AppName)
            self.client.client_login(self.GAUserName, self.GAPassword, source=self.CK12AppName, service=self.client.auth_service)
        except Exception as e:
            self.logger.error(e)
            self.logger(traceback.format_exc())
            raise e

    def getGATotalStatsByTableId(self, table_id):
        self.logger.info("Attempting to fetch GA Stats from Google for table_id: %s. Sit tight!" %(table_id))
        table_id = 'ga:' + table_id
        self.GAStartDate = settings.GA_STARTDATE
        self.GAEndDate = settings.GA_ENDDATE
        self.GAEvent = settings.GA_EVENTS
        if self.GAStartDate == 'start':
            startDate = datetime.date(2005, 01, 01)
        else:
            date = [int(x) for x in self.GAStartDate.split('-')]
            startDate = datetime.date(date[0], date[1], date[2])
        if self.GAEndDate == 'today':
            endDate = datetime.date.today()
        else:
            date = [int(x) for x in self.GAEndDate.split('-')]
            endDate = datetime.date(date[0], date[1], date[2])
        try:
            data_query = gdata.analytics.client.DataFeedQuery({'ids': table_id, 'start-date': startDate.isoformat(), 'end-date': endDate.isoformat(), 'metrics': 'ga:pageviews'})
            feed = self.client.GetDataFeed(data_query)
            totalStats = feed.entry[0].metric[0].value
        except Exception as e:
            self.logger.error(e)
            self.logger(traceback.format_exc())
            raise e
        self.logger.info("Got the total number of hits for table_id: %s %s" %(table_id, totalStats))
        return int(totalStats)

    def getGATotalStats(self):
        return self.getGATotalStatsByTableId(table_id='22252794')

    def getINAPTotalStats(self):
        return self.getGATotalStatsByTableId(table_id='2792286')

    def getBrainGenieStats(self):
        return self.getGATotalStatsByTableId(table_id='64215804')

#logger = logging.getLogger(__name__)
#downloadStats = DownloadStats(logger)
#print downloadStats.getGATotalStats()
#print downloadStats.getINAPTotalStats()
