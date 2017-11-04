import logging

log = logging.getLogger(__name__)

class AssessCommon(object):

    @staticmethod
    def getResponseTemplate(status, qTime):
        return {
            'responseHeader':{'status':status, 'QTime':qTime},
            'response':{},
           }
