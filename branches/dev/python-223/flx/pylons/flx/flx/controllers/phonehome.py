import logging
import os
from urllib import unquote

from pylons import config, request, session, url, tmpl_context as c

from flx.controllers import decorators as d
#from flx.model import meta
#from flx.model import model
from flx.model import api
from flx.lib.base import BaseController
from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)
__controller__ = 'PhoneHomeController'

class PhoneHomeController(BaseController):

    @d.jsonify()
    @d.trace(log)
    def getDownloadStats(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            totalDownloadCount = api.getTotalDownloadCountAsString()
            result['response']['downloadstats'] = totalDownloadCount
            log.info('Returning the total download count: %s' %(totalDownloadCount))
            return result
        except Exception as e:
            log.error('Exception while getting the total download count: %s' %(e.__str__()))
            c.errorCode = ErrorCodes.CANNOT_GET_DOWNLOADCOUNT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getDownloadStatsTypes(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            downloadStatsTypes = api.getDownloadStatsTypes()
            result['response']['downloadstatstypes'] = downloadStatsTypes
            log.info('Returning all the downloadstatstypes: %s' %(downloadStatsTypes))
            return result
        except Exception as e:
            log.error('Exception while getting the all the downloadstatstypes: %s' %(e.__str__()))
            c.errorCode = ErrorCodes.CANNOT_GET_DOWNLOADSTATSTYPES
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['downloadStatsType', 'count'])
    @d.trace(log, ['downloadStatsType', 'count'])
    def updateDownloadStatsForType(self, downloadStatsType, count):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            allDownloadStatsTypes = api.getDownloadStatsTypes()
            downloadStatsType = unquote(downloadStatsType)
            for eachDownloadStats in allDownloadStatsTypes:
                if downloadStatsType == eachDownloadStats[0]:
                    api.updateDownloadCountFor(downloadType=downloadStatsType, count=count)
                    result['response']['result'] = 'Download stats updated successfully for %s' %(downloadStatsType)
                    log.info('Download stats updated successfully for %s' %(downloadStatsType))
                    return result
            result['response']['result'] = 'No such Download stats %s' %(downloadStatsType)
            log.info('No such download stats for %s' %(downloadStatsType))
            return result
        except Exception as e:
            log.error('Exception while updating downloadstats: %s' %(e.__str__()))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_DOWNLOADSTATS
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['downloadStatsType'])
    @d.trace(log, ['downloadStatsType'])
    def addDownloadStatsType(self, downloadStatsType):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            downloadStatsType = unquote(downloadStatsType)
            downloadTypeObj = api.addDownloadStatsType(downloadType=downloadStatsType)
            log.info('Download stats for type %s added' %(downloadTypeObj))
            result['response']['result'] = 'Download stats added successfully for %s' %(downloadTypeObj.asDict())
            return result
        except Exception as e:
            log.error('Exception while adding the following downloadstats type: %s' %(downloadStatsType), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_ADD_DOWNLOADSTATSTYPE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['downloadStatsType'])
    @d.trace(log, ['downloadStatsType'])
    def deleteDownloadStatsType(self, downloadStatsType):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            downloadStatsType = unquote(downloadStatsType)
            downloadTypeObj = api.deleteDownloadStatsType(downloadType=downloadStatsType)
            log.info('Download stats for type %s deleted' %(downloadTypeObj))
            result['response']['result'] = 'Download stats deleted successfully for %s' %(downloadTypeObj.asDict())
            return result
        except Exception as e:
            log.error('Exception while deleting the following downloadstats type: %s' %(downloadStatsType), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_DOWNLOADSTATSTYPE
            return ErrorCodes().asDict(c.errorCode, str(e))
