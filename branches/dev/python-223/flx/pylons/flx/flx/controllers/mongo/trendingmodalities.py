import logging
import traceback
from pylons import request, tmpl_context as c

from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.mongo.base import MongoBaseController

from flx.model import iplocation
from flx.model.mongo import trendingmodalities

log = logging.getLogger(__name__)


class TrendingmodalitiesController(MongoBaseController):
    """
        Trending Modalities APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
                        
    #  Get Trending Modalities
    #
    @d.jsonify()
    @d.trace(log)
    def getTrendingModalities(self):
        """
            Returns trending modalities
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            parameters = request.GET
            log.info('parameters: [%s]' % (parameters))            
            
            collectionHandles = parameters.get('collectionHandles', '').strip()
            modalityTypes = parameters.get('modality_types', '').strip()
            country = parameters.get('country', '').strip()
            state = parameters.get('state', '').strip()
            # If country/state info not available then get it from ip address.
            if not country:
                clientIP = request.client_addr
                if clientIP:
                    ipInfo = iplocation.IPLocation(self.db).get_location(ip_address=clientIP)
                    country = ipInfo.get('country_long', '').strip()
                    state = ipInfo.get('region', '').strip()
            ck12Only = False    
            if parameters.has_key('ck12Only') and parameters['ck12Only'] == 'true':
                ck12Only = True
            try:
                pageSize = int(parameters['pageSize'])
            except:
                pageSize = 10

            @d.ck12_cache_region('long_term')
            def _getTrendingModalities(collectionHandles, modalityTypes, country, state, ck12Only, pageSize):
                """
                """
                kwargs = {'filters':{}}
                kwargs['filters']['collectionHandles'] = collectionHandles
                kwargs['filters']['modalityTypes'] = modalityTypes
                kwargs['filters']['country'] = country
                kwargs['filters']['state'] = state
                kwargs['ck12Only'] = ck12Only
                kwargs['pageSize'] = pageSize
                return trendingmodalities.TrendingModalities(self.db).getTrendingModalities(**kwargs) or {}    
            
            response = _getTrendingModalities(collectionHandles, modalityTypes, country, state, ck12Only, pageSize)            
            result['response'] = response
            return result
        except Exception, e:
            log.error('Error in getting trending modalities: [%s]' %(str(e)))
            errorCode = ErrorCodes.CAN_NOT_GET_TRENDING_MODALITIES
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(errorCode, str(e))
