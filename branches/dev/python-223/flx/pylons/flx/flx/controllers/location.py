import logging

from pylons import tmpl_context as c
from pylons.i18n.translation import _ 

from flx.controllers import decorators as d
from flx.model import model
from flx.model import api
from flx.lib.base import BaseController

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class LocationController(BaseController):

    @d.jsonify()
    @d.trace(log, ['id'])
    def getStateInfo(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            usState = api.getUSState(abbreviation=id)
            if usState is None:
                raise Exception((_(u'No state of %(id)s')  % {"id":id}).encode("utf-8"))
            result['response']['abbreviation'] = id
            result['response']['name'] = usState.name
            return result
        except Exception, e:
            log.error('get state Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_STATE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getStates(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            states = api.getUSStates()
            stateList = []
            for state in states:
                stateList.append(state.asDict())
            result['response']['states'] = stateList
            return result
        except Exception, e:
            log.error('get stateInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_STATE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id'])
    def getCountryInfo(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            country = api.getUnique(what=model.Country, term='id', value=id)
            if country is None:
                raise Exception((_(u'No country of %(id)s')  % {"id":id}).encode("utf-8"))
            result['response']['id'] = country.id
            result['response']['name'] = country.name
            result['response']['code'] = country.code3Letter
            return result
        except Exception, e:
            log.error('get countryInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_COUNTRY
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getCountries(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            countries = api.getCountries()
            countryList = []
            for country in countries:
                countryList.append(country.asDict())
            result['response']['countries'] = countryList
            return result
        except Exception, e:
            log.error('get countryInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_COUNTRY
            return ErrorCodes().asDict(c.errorCode, str(e))
