import logging
from pylons.controllers import WSGIController
from pylons import request
from flx.logic.artifactBusinessAnalyticsManager import ArtifactBusinessAnalyticsLogic
from flx.model import exceptions
from flx.controllers import user as u
from flx.controllers import decorators as dec1
from flx.util import decorators as dec2

log = logging.getLogger(__name__)
__controller__ = 'ArtifactAnalyticsController'

class ArtifactAnalyticsController(WSGIController):

    def __init__(self):
        self.businessLogic = ArtifactBusinessAnalyticsLogic()

    @dec2.responsify() 
    #@dec1.checkAuth(throwbackException=True)
    def getArtifactVisitDetails(self):
        log.info("Request Parameters:%s" % request.params)
        if request.method != 'GET':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        artifactIDs = request.params.get('artifactIDs')
        if not artifactIDs:
            raise exceptions.InvalidArgumentException("Please provide the artifactIDs.")
        artifactIDs = artifactIDs.upper().split(',')
        try:
            artifactIDs = map(long, artifactIDs)
        except Exception as ex:
            raise exceptions.InvalidArgumentException("artifactIDs should be integers.")
        log.info("artifactIDs :[%s]" %artifactIDs)
        artifactVisitDetails = self.businessLogic.getArtifactVisitDetails(artifactIDs)        
        responseDict = {'artifactVisitDetails': artifactVisitDetails}
        return responseDict
