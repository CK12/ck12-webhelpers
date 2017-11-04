"""The base Controller API

Provides the BaseController class for subclassing.
"""
from flx.lib.http import Http
from pylons import config, request, response, tmpl_context as c
from pylons.i18n.translation import _, add_fallback,set_lang
from pylons import app_globals as g
from pylons.controllers import WSGIController
## Keep the import - used elsewhere
from pylons.templating import render_jinja2 as render
from Crypto.Cipher import Blowfish                                                                                                                                                                                  

from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model import api
from flx.model import meta
from flx.lib import helpers as h

import logging

log = logging.getLogger(__name__)

SORTABLE_COLUMNS = {
        'Artifacts': [ 'creationTime', 'updateTime', 'name', 'creatorID', ],
        'Assignments': [ 'id', 'groupID', 'assigneeID', 'creatorID', 'artifactID', 'url', 'assignmentType', 'creationTime', 'startTime', 'endTime', ],
        'Resources': [ 'creationTime', 'name', 'ownerID', ],
        'MemberLibraryArtifactRevisions': [ 'creationTime', 'updateTime', 'name', 'creatorID', 'added' ],
        'MemberLibraryResourceRevisions': [ 'creationTime', 'name', 'ownerID', 'added', 'latest', ],
    }

class BaseController(WSGIController):
    prefix = '/%s' % config.get('instance')

    def __before__(self):
        c.errorCode = ErrorCodes.OK

    def __after__(self):
        ## Set CORS and Cache headers for all API calls.
        h.setCORSAndCacheHeaders(request, response)
        h.setSEOHeaders(response)

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        self.setLanguage()
        try:
            return WSGIController.__call__(self, environ, start_response)
        finally:
            meta.Session.remove()

    def getFuncName(self):
        return h.getFuncName()

    def getResponseTemplate(self, status, time):
        return {
                'responseHeader':{'status':status, 'time':time},
                'response':{},
               }

    def getSortOrder(self, sort, modelName):
        """
            Get sort order prescription from request parameters
            Format is: fld1,order1;fld2,order2 ...
        """
        if not sort or sort.lower() == 'none':
            return None
        if sort == 'latest':
            if modelName == 'Resources' or modelName == 'MemberLibraryResourceRevisions':
                sort = [('creationTime', 'desc')]
            else:
                sort = [('updateTime', 'desc'), ('creationTime', 'desc')]
        else:
            sortParts = sort.split(';')
            sort = []
            for s in sortParts:
                order = 'asc'
                if s.endswith(',desc'):
                    order = 'desc'
                sortFld = s.split(",", 1)[0]
                if sortFld in SORTABLE_COLUMNS[modelName]:
                    sort.append((sortFld, order))
                else:
                    raise Exception((_(u'Invalid sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))
        log.info('Sort order: %s' % sort)
        return sort

    def setLanguage(self):
        accept_languages= str(request.accept_language)
        if accept_languages:
            accept_languages=accept_languages.replace(',',';')
            acceptlanguagesList= accept_languages.split(';')
            languagesList=[]
            supportedLanguages=g.languagesSupported     
            for language in range(len(acceptlanguagesList)):
                acceptlanguagesList[language]=acceptlanguagesList[language].strip().split('-')
                if acceptlanguagesList[language][0].find('=')==-1 and acceptlanguagesList[language][0] not in languagesList and acceptlanguagesList[language][0] in supportedLanguages:
                    languagesList.append(acceptlanguagesList[language][0])
            if len(languagesList)>0:
                for lang in range(1, len(languagesList)):
                    add_fallback(languagesList[lang])
                set_lang(languagesList[0])
        else:
            set_lang('en')  

    @d.trace(log, ['durl', 'timeout', 'method', 'params', 'fromReq', 'external'])
    def _call(self, durl, timeout=30, method='GET', params=None, fromReq=False, external=False):
        """
            Make call to the api
        """
        headers = {
                   'Accept': 'application/json, */*; q=0.01',
                   'Content-Type': 'application/json; charset=UTF-8',
                   'Connection': 'keep-alive',
                }
        http = Http(timeout=timeout, fromReq=fromReq, external=external, headers=headers)
        return http.call(durl, method, params)

    @d.trace(log, ['appID', 'launchKey', 'txSession'])
    def getLMSInstance(self, appID, launchKey=None, txSession=None):
        if appID:
            appID = appID.lower()
        if appID.startswith('canvas') :
            from flx.lib.lms.canvas import CanvasManager as lmsManager
        elif appID.startswith('schoology') :
            from flx.lib.lms.schoology import SchoologyManager as lmsManager
        elif appID.startswith('itslearning') :
            from flx.lib.lms.itslearning import ItsLearningManager as lmsManager
        elif appID.startswith('safarimontage') :
            from flx.lib.lms.safarimontage import SafariMontageManager as lmsManager
        elif appID.startswith('moodle') :
           from flx.lib.lms.moodle import MoodleManager as lmsManager
        elif appID.startswith('google_classroom') :
           from flx.lib.lms.google import GoogleManager as lmsManager
        else:
            from flx.lib.lms.edmodo import EdmodoManager as lmsManager

        return lmsManager(appID, request=request, launchKey=launchKey, txSession=txSession)


    def _updatePeerhelpGroupMemberAssociation(self, rurl, payloadData, QAInfo=False):
        #Update group member information in peerhelp
        server = config.get('flx_peerhelp_api_server')
        peehelpClientID = config.get('peerhelp_client_id')
        rurl = '%s/%s' % (server, rurl)

        if QAInfo:
                enableQA = True
                allowAnonymous = False
                eventTypeDict,eventTypeNameDict = g.getEventTypes()
                typeID = eventTypeNameDict.get('GROUP_QA_STATUS')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_DISABLE_QA')))
                events = api.getEventsForObject(objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    enableQA = eventDict.get('eventData').get('enableQA',True)
                    if isinstance(enableQA, list):
                        enableQA = enableQA[0]
                
                typeID = eventTypeNameDict.get('GROUP_QA_ANONYMOUS_PERMISSION')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_ALLOW_QA_ANONYMOUS_IDENTITY')))
                events = api.getEventsForObject(objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    allowAnonymous = eventDict.get('eventData').get('allowAnonymous',False)
                payloadData.update({'enableQA' : enableQA, 'allowAnonymous' : allowAnonymous})

        issPasscode = config.get('iss_passcode') + str(payloadData['memberID']) + str(payloadData['groupID'])
        if len(issPasscode) % 8:
            # data block length must be multiple of eight
            issPasscode += 'X' * (8 - (len(issPasscode) % 8))

        payloadData.update({'clientID': peehelpClientID,
                            'secret': h.genURLSafeBase64Encode(Blowfish.new(config.get('iss_secret')).encrypt(issPasscode), usePrefix=False),
                            })

        status, data = self._call(rurl, method='POST', params=payloadData, fromReq=True)
        if status !=  ErrorCodes.OK:
            log.error('Unable to update peerhelp member group association: %s: %s' % (status, data))


    def _updatePeerhelpGroupMemberAssociation(self, rurl, payloadData, QAInfo=False, session=None):
        #Update group member information in peerhelp
        server = config.get('flx_peerhelp_api_server')
        peehelpClientID = config.get('peerhelp_client_id')
        rurl = '%s/%s' % (server, rurl)

        if QAInfo:
                enableQA = True
                allowAnonymous = False
                eventTypeDict,eventTypeNameDict = g.getEventTypes()
                typeID = eventTypeNameDict.get('GROUP_QA_STATUS')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_DISABLE_QA')))
                if session:
                    events = api._getEvents(session, objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                else:
                    events = api.getEventsForObject(objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    enableQA = eventDict.get('eventData').get('enableQA',True)
                    if isinstance(enableQA, list):
                        enableQA = enableQA[0]
                
                typeID = eventTypeNameDict.get('GROUP_QA_ANONYMOUS_PERMISSION')
                if typeID is None:
                    raise Exception((_(u'getGroupQAstatusInfo: Invalid type: GROUP_ALLOW_QA_ANONYMOUS_IDENTITY')))
                if session:
                    events = api._getEvents(session, objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                else:
                    events = api.getEventsForObject(objectID=payloadData['groupID'], objectType='group', eventTypeIDs=[typeID])
                if events:
                    eventDict = events[0].asDict()
                    allowAnonymous = eventDict.get('eventData').get('allowAnonymous',False)
                payloadData.update({'enableQA' : enableQA, 'allowAnonymous' : allowAnonymous})

        issPasscode = config.get('iss_passcode') + str(payloadData['currentUserID']) + str(payloadData['groupID'])
        if len(issPasscode) % 8:
            # data block length must be multiple of eight
            issPasscode += 'X' * (8 - (len(issPasscode) % 8))

        payloadData.update({'clientID': peehelpClientID,
                            'secret': h.genURLSafeBase64Encode(Blowfish.new(config.get('iss_secret')).encrypt(issPasscode), strip=False, usePrefix=False),
                            })

        status, data = self._call(rurl, method='POST', params=payloadData, fromReq=True)
        if status !=  ErrorCodes.OK:
            log.error('Unable to update peerhelp member group association: %s: %s' % (status, data))
