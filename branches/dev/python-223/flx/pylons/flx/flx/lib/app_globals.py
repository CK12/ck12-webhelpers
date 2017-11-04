"""The application's Globals object"""
import logging
import os

from pylons import config
from pylons.decorators.cache import beaker_cache

from flx.model import api

log = logging.getLogger(__name__)

class Globals(object):

    """Globals acts as a container for objects available throughout the
    life of the application

    """

    def __init__(self):
        """One instance of Globals is created during application
        initialization and is available during requests via the
        'app_globals' variable
        """
        self.artifactTypeDict = None
        self.artifactTypeNameDict = None
        self.resourceTypeDict = None
        self.resourceTypeNameDict = None
        self.browseTermTypeDict = None
        self.memberRoleDict = None
        self.memberRoleNameDict = None
        self.memberStateDict = None
        self.memberStateNameDict = None
        self.stateDict = None
        self.countryDict = None
        self.countryNameDict = None
        self.abuseReasonDict = None
        self.abuseReasonNameDict = None
        self.eventTypeDict = None
        self.eventTypeNameDict = None
        self.notificationRuleDict = None
        self.notificationRuleNameDict = None
        self.ck12Editor = None
        self.memberID = None
        self.resourceHelper = None
        self.flexrUtil = None
        self.languagesSupported = ['en']
        self.xv = None

        import flx.controllers.common as com

        self.ac = com.ArtifactCommon()

        from flx.controllers.resourceHelper import ResourceHelper

        self.resourceHelper = ResourceHelper()

    @beaker_cache(expire=864000, query_args=False)
    def getArtifactTypes(self):
        if not self.artifactTypeDict:
            artifactTypes = api.getArtifactTypes()
            self.artifactTypeDict = {}
            for artifactType in artifactTypes:
                self.artifactTypeDict[artifactType.name] = artifactType.id
            log.info('getArtifactTypes artifactTypeDict[%s]' % self.artifactTypeDict)
        return self.artifactTypeDict

    @beaker_cache(expire=864000, query_args=False)
    def getArtifactTypeNames(self):
        if not self.artifactTypeNameDict:
            artifactTypes = api.getArtifactTypes()
            self.artifactTypeNameDict = {}
            for artifactType in artifactTypes:
                self.artifactTypeNameDict[artifactType.id] = artifactType.asDict()
        return self.artifactTypeNameDict

    @beaker_cache(expire=864000, query_args=False)
    def getResourceTypes(self):
        if not self.resourceTypeDict:
            resourceTypes = api.getResourceTypes()
            self.resourceTypeDict = {}
            self.resourceTypeNameDict = {}
            for resourceType in resourceTypes:
                id = resourceType.id
                name = resourceType.name
                self.resourceTypeDict[name] = id
                self.resourceTypeNameDict[id] = name
            log.info('getResourceTypes resourceTypeDict[%s]' % self.resourceTypeDict)
            log.info('getResourceTypes resourceTypeNameDict[%s]' % self.resourceTypeNameDict)
        return self.resourceTypeDict, self.resourceTypeNameDict

    @beaker_cache(expire=864000, query_args=False)
    def getBrowseTermTypes(self):
        if not self.browseTermTypeDict:
            browseTermTypes = api.getBrowseTermTypes()
            self.browseTermTypeDict = {}
            for termType in browseTermTypes:
                self.browseTermTypeDict[termType.name] = termType.id
        return self.browseTermTypeDict

    def getMemberRoles(self, session=None):
        if not self.memberRoleDict:
            @beaker_cache(expire=864000, query_args=False)
            def __getMemberRoles():
                if session:
                    memberRoles = api._getMemberRoles(session)
                else:
                    memberRoles = api.getMemberRoles()
                memberRoleDict = {}
                memberRoleNameDict = {}
                for memberRole in memberRoles:
                    id = memberRole.id
                    name = memberRole.name
                    memberRoleDict[id] = name
                    memberRoleNameDict[name] = id
                return memberRoleDict, memberRoleNameDict

            self.memberRoleDict, self.memberRoleNameDict = __getMemberRoles()
            log.info('getMemberRoles memberRoleDict[%s]' % self.memberRoleDict)
            log.info('getMemberRoles memberRoleNameDict[%s]' % self.memberRoleNameDict)
        return self.memberRoleDict, self.memberRoleNameDict

    @beaker_cache(expire=864000, query_args=False)
    def getMemberStates(self):
        if not self.memberStateDict:
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

    @beaker_cache(expire=864000, query_args=False)
    def getStates(self):
        if not self.stateDict:
            states = api.getUSStates()
            self.stateDict = {}
            for state in states:
                self.stateDict[state.abbreviation] = state.name
            log.info('getStates stateDict[%s]' % self.stateDict)
        return self.stateDict

    @beaker_cache(expire=864000, query_args=False)
    def getCountries(self):
        if not self.countryDict:
            countries = api.getCountries()
            self.countryDict = {}
            self.countryNameDict = {}
            for country in countries:
                self.countryDict[country.id] = '%s: %s' % (country.code2Letter, country.name)
                self.countryNameDict[country.code2Letter] = country.id
            log.info('getCountries countryDict[%s]' % self.countryDict)
            log.info('getCountries countryNameDict[%s]' % self.countryNameDict)
        return self.countryDict, self.countryNameDict

    @beaker_cache(expire=864000, query_args=False)
    def getAbuseReasons(self):
        if not self.abuseReasonDict:
            abuseReasons = api.getAbuseReasons()
            self.abuseReasonDict = {}
            self.abuseReasonNameDict = {}
            for abuseReason in abuseReasons:
                id = abuseReason.id
                name = abuseReason.name
                self.abuseReasonDict[id] = name
                self.abuseReasonNameDict[name] = id
            log.info('getAbuseReasons abuseReasonDict[%s]' % self.abuseReasonDict)
            log.info('getAbuseReasons abuseReasonNameDict[%s]' % self.abuseReasonNameDict)
        return self.abuseReasonDict, self.abuseReasonNameDict

    def getEventTypes(self, session=None):
        if not self.eventTypeDict:
            @beaker_cache(expire=864000, query_args=False)
            def __getEventTypes():
                if session:
                    eventTypes = api._getEventTypes(session)
                else:
                    eventTypes = api.getEventTypes()
                eventTypeDict = {}
                eventTypeNameDict = {}
                for eventType in eventTypes:
                    id = eventType.id
                    name = eventType.name
                    eventTypeDict[id] = name
                    eventTypeNameDict[name] = id
                return eventTypeDict, eventTypeNameDict
            self.eventTypeDict, self.eventTypeNameDict = __getEventTypes()
            log.info('getEventTypes eventTypeDict[%s]' % self.eventTypeDict)
            log.info('getEventTypes eventTypeNameDict[%s]' % self.eventTypeNameDict)
        return self.eventTypeDict, self.eventTypeNameDict

    @beaker_cache(expire=864000, query_args=False)
    def getNotificationRules(self):
        if not self.notificationRuleDict:
            notificationRules = api.getNotificationRules()
            self.notificationRuleDict = {}
            self.notificationRuleNameDict = {}
            for notificationRule in notificationRules:
                id = notificationRule.id
                name = notificationRule.name
                self.notificationRuleDict[id] = name
                self.notificationRuleNameDict[name] = id
            log.info('getNotificationRules notificationRuleDict[%s]' % self.notificationRuleDict)
            log.info('getNotificationRules notificationRuleNameDict[%s]' % self.notificationRuleNameDict)
        return self.notificationRuleDict, self.notificationRuleNameDict

    def getCK12Editor(self):
        if not self.ck12Editor:
            self.ck12Editor = config.get('ck12_editor')
            if self.ck12Editor is None or self.ck12Editor == '':
                self.ck12Editor = 'ck12editor'
            log.info('getEditorInfo ck12Editor[%s]' % self.ck12Editor)
        return self.ck12Editor

    @beaker_cache(expire=864000, query_args=False)
    def getCK12EditorID(self):
        ck12Editor = self.getCK12Editor()
        if not self.memberID:
            member = api.getMemberByLogin(login=ck12Editor)
            self.memberID = member.id
            log.info('getEditorInfo member.id[%s]' % self.memberID)
        return self.memberID

    def getFlexrUtil(self):
        if self.flexrUtil is None:
            from flx.model.get1xinfo import FlexrUtil
            from pylons import config

            self.flexrUtil = FlexrUtil(config.get('url_1x_db'))

        return self.flexrUtil

    def getXhtmlValidator(self):
        if self.xv is None:
            from flx.lib.rosetta import XhtmlValidator
            from pylons import config

            xsdPath = os.path.join(config.get('flx_home'), 'flx/templates/flx/rosetta/2_0.xsd')
            self.xv = XhtmlValidator(xsdPath)

        return self.xv

    @beaker_cache(expire=86400)
    def getStandardBoards(self):
        boards = api.getStandardBoards()
        boardNameDict = {}
        boardIDDict = {}
        for b in boards:
            boardIDDict[b.id] = b.asDict()
            boardNameDict[b.name.lower()] = b.asDict()
        return boardIDDict, boardNameDict

    @beaker_cache(expire=86400)
    def getGrades(self):
        grades = api.getGrades()
        gradeNameDict = {}
        for g in grades:
            gradeNameDict[g.name.lower()] = g.asDict()
        return gradeNameDict

    @beaker_cache(expire=86400)
    def getSubjects(self):
        subjects = api.getSubjects()
        subjectNameDict = {}
        for s in subjects:
            subjectNameDict[s.name.lower()] = s.asDict()
        return subjectNameDict

