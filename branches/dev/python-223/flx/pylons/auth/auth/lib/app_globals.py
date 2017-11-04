"""The application's Globals object"""
import logging

from pylons import config

from auth.model import api

log = logging.getLogger(__name__)

def ck12_cache_region(region, *deco_args, **deco_kwargs):
    """
    Modified version of the beaker cache_region decorator.
    We add a support for nocache parameter which will fetch
    the latest data and replace it in the cache.
    Return a caching function decorator.
    """
    import beaker.util as util
    from beaker.exceptions import BeakerException
    from beaker.cache import cache_regions,Cache
    from beaker.crypto.util import sha1
    cache = [None]

    def decorate(func):
        namespace = util.func_namespace(func)
        skip_self = util.has_self_arg(func)
        def cached(*args):
            log.info("Args: %s" % str(args))
            if not cache[0]:
                if region is not None:
                    if region not in cache_regions:
                        raise BeakerException(
                            'Cache region not configured: %s' % region)
                    reg = cache_regions[region]
                    if not reg.get('enabled', True):
                        return func(*args)
                    cache[0] = Cache._get_cache(namespace, reg)
                else:
                    raise Exception("'manager + kwargs' or 'region' "
                                    "argument is required")

            if skip_self:
                try:
                    cache_key = " ".join(map(str, deco_args + args[1:]))
                except UnicodeEncodeError:
                    cache_key = " ".join(map(unicode, deco_args + args[1:]))
            else:
                try:
                    cache_key = " ".join(map(str, deco_args + args))
                except UnicodeEncodeError:
                    cache_key = " ".join(map(unicode, deco_args + args))
            if region:
                key_length = cache_regions[region]['key_length']
            else:
                key_length =  250
            if len(cache_key) + len(namespace) > key_length:
                cache_key = sha1(cache_key).hexdigest()
            def go():
                log.debug("Generating cache ...")
                return func(*args)

            log.debug("deco_args: %s, deco_kwargs: %s" % (str(deco_args), str(deco_kwargs)))
            invalidation_key = None
            if 'invalidation_key' in deco_kwargs:
                invalidation_key = deco_kwargs['invalidation_key']
            if deco_kwargs.get('nocache') == True \
                and ( (not invalidation_key) or \
                (deco_kwargs.has_key('key') and invalidation_key == deco_kwargs.get('key') )):
                    log.info("ck12_cache_region: Invalidating cached: %s" % func)
                    data = go()
                    cache[0].set_value(cache_key,data)
                    return data
            else:
                log.info("ck12_cache_region: No invalidation requested: %s" % func)
                return cache[0].get_value(cache_key, createfunc=go)
        cached._arg_namespace = namespace
        if region is not None:
            cached._arg_region = region
        return cached
    return decorate

class Globals(object):

    """Globals acts as a container for objects available throughout the
    life of the application

    """

    def __init__(self):
        """One instance of Globals is created during application
        initialization and is available during requests via the
        'app_globals' variable
        """
        self.memberAuthTypeDict = None
        self.memberAuthTypeNameDict = None
        self.memberRoleDict = None
        self.memberRoleNameDict = None
        self.memberStateDict = None
        self.memberStateNameDict = None
        self.stateDict = None
        self.countryDict = None
        self.countryNameDict = None
        self.ck12Editor = None
        self.memberID = None
        self.languagesSupported = ['en']

    def getMemberAuthTypes(self, session=None, nocache=False):

        @ck12_cache_region('daily', nocache=nocache)
        def _getMemberAuthTypes():
            if not self.memberAuthTypeDict:
                if session:
                    memberAuthTypes = api._getMemberAuthTypes(session)
                else:
                    memberAuthTypes = api.getMemberAuthTypes()
                self.memberAuthTypeDict = {}
                for memberAuthType in memberAuthTypes:
                    self.memberAuthTypeDict[memberAuthType.name] = memberAuthType.id
                log.info('getMemberAuthTypes memberAuthTypeDict[%s]' % self.memberAuthTypeDict)
            return self.memberAuthTypeDict

        return _getMemberAuthTypes()

    def getMemberAuthTypeNames(self, session=None, nocache=False):

        @ck12_cache_region('daily', nocache=nocache)
        def _getMemberAuthTypeNames():
            if not self.memberAuthTypeNameDict:
                if session:
                    memberAuthTypes = api._getMemberAuthTypes(session)
                else:
                    memberAuthTypes = api.getMemberAuthTypes()
                self.memberAuthTypeNameDict = {}
                for memberAuthType in memberAuthTypes:
                    self.memberAuthTypeNameDict[memberAuthType.id] = memberAuthType.name
                log.info('getMemberAuthTypes memberAuthTypeNameDict[%s]' % self.memberAuthTypeNameDict)
            return self.memberAuthTypeNameDict

        return _getMemberAuthTypeNames()

    def getMemberRoles(self, session=None):
        return self.getAuthMemberRoles(session=session)

    def getAuthMemberRoles(self, session=None, nocache=False):

        @ck12_cache_region('monthly', nocache=nocache)
        def _getAuthMemberRoles():
            if not self.memberRoleDict:
                if session:
                    memberRoles = api._getMemberRoles(session)
                else:
                    memberRoles = api.getMemberRoles()
                self.memberRoleDict = {}
                self.memberRoleNameDict = {}
                for memberRole in memberRoles:
                    id = memberRole.id
                    name = memberRole.name
                    self.memberRoleDict[id] = name
                    self.memberRoleNameDict[name] = id
                log.info('getMemberRoles memberRoleDict[%s]' % self.memberRoleDict)
                log.info('getMemberRoles memberRoleNameDict[%s]' % self.memberRoleNameDict)
            return self.memberRoleDict, self.memberRoleNameDict

        return _getAuthMemberRoles()

    def getMemberStates(self):
        return self.getAuthMemberStates()

    def getAuthMemberStates(self, session=None, nocache=False):

        @ck12_cache_region('monthly', nocache=nocache)
        def _getAuthMemberStates():
            if not self.memberStateDict:
                if session:
                    memberStates = api._getMemberStates(session)
                else:
                    memberStates = api.getMemberStates()
                self.memberStateDict = {}
                self.memberStateNameDict = {}
                for memberState in memberStates:
                    id = memberState.id
                    name = memberState.name
                    self.memberStateDict[id] = name
                    self.memberStateNameDict[name] = id
                log.info('getMemberStates memberStateDict[%s]' % self.memberStateDict)
                log.info('getMemberStatus memberStateNameDict[%s]' % self.memberStateNameDict)
            return self.memberStateDict, self.memberStateNameDict

        return _getAuthMemberStates()

    def getStates(self):
        return self.getAuthStates()

    def getAuthStates(self, session=None, nocache=False):

        @ck12_cache_region('monthly', nocache=nocache)
        def _getAuthStates():
            if not self.stateDict:
                if session:
                    states = api._getUSStates(session)
                else:
                    states = api.getUSStates()
                self.stateDict = {}
                for state in states:
                    self.stateDict[state.abbreviation] = state.name
                log.info('getStates stateDict[%s]' % self.stateDict)
            return self.stateDict

        return _getAuthStates()

    def getCountries(self):
        return self.getAuthCountries()

    def getAuthCountries(self, session=None, nocache=False):

        @ck12_cache_region('monthly', nocache=nocache)
        def _getAuthCounties():
            if not self.countryDict:
                if session:
                    countries = api.getCountries(session)
                else:
                    countries = api.getCountries()
                self.countryDict = {}
                self.countryNameDict = {}
                for country in countries:
                    self.countryDict[country.id] = '%s: %s' % (country.code2Letter, country.name)
                    self.countryNameDict[country.code2Letter] = country.id
                log.info('getCountries countryDict[%s]' % self.countryDict)
                log.info('getCountries countryNameDict[%s]' % self.countryNameDict)
            return self.countryDict, self.countryNameDict

        return _getAuthCounties()

    def getCK12Editor(self):
        return self.getAuthCK12Editor()

    def getAuthCK12Editor(self, nocache=False):

        @ck12_cache_region('monthly', nocache=nocache)
        def _getAuthCK12Editor():
            if not self.ck12Editor:
                self.ck12Editor = config.get('ck12_editor')
                if self.ck12Editor is None or self.ck12Editor == '':
                    self.ck12Editor = 'ck12editor'
                log.info('getEditorInfo ck12Editor[%s]' % self.ck12Editor)
            return self.ck12Editor

        return _getAuthCK12Editor()

    def getCK12EditorID(self):
        return self.getAuthCK12EditorID()

    def getAuthCK12EditorID(self, session=None, nocache=False):

        @ck12_cache_region('monthly', nocache=nocache)
        def _getAuthCK12EditorID():
            ck12Editor = self.getAuthCK12Editor()
            if not self.memberID:
                if session:
                    member = api._getMemberByLogin(session, login=ck12Editor)
                else:
                    member = api.getMemberByLogin(login=ck12Editor)
                self.memberID = member.id
                log.info('getEditorInfo member.id[%s]' % self.memberID)
            return self.memberID

        return _getAuthCK12EditorID()
