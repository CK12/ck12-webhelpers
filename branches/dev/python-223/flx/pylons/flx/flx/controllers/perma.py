import logging
from datetime import datetime
from pylons.i18n.translation import _ 

from pylons import request, tmpl_context as c
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache, ArtifactRevisionCache
from flx.model import api
from flx.model import model
from flx.model.model import title2Handle
from flx.lib.base import BaseController
import flx.lib.helpers as h

from flx.controllers.errorCodes import ErrorCodes
from flx.controllers import user as u

log = logging.getLogger(__name__)

class PermaController(BaseController):
    """
        PermaURL related APIs.
    """

    @d.jsonify()
    @d.trace(log, ['id'])
    def construct(self, id):
        """
            Returns the perma URL of the given artifact identifier.
        """
        c.errorCode = ErrorCodes.OK
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifact = api.getArtifactByIDOrTitle(idOrTitle=id)
            if artifact is None:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                raise Exception((_(u'No artifact of id %(id)s')  % {"id":id}).encode("utf-8"))

            login = artifact.creator.login
            if login == g.getCK12Editor():
                realm = None
            else:
                if login is not None and login != '':
                    realm = 'user:%s' % login.strip()
                else:
                    raise Exception((_(u'Cannot generate perma for empty login: %(artifact.creatorID)s')  % {"artifact.creatorID":artifact.creatorID}).encode("utf-8"))

            artifactType = artifact.type.name

            handle = artifact.handle
            if handle is None or handle == '':
                handle = title2Handle(artifact.name)
            handle = u'%s' % handle

            if realm is None:
                perma = '/%s/%s' % (artifactType, handle)
            else:
                perma = '/%s/%s/%s' % (realm, artifactType, handle)
            result['response']['perma'] = perma
            result['response']['realm'] = realm
            result['response']['type'] = artifactType
            result['response']['handle'] = handle
            return result
        except Exception, e:
            log.error('get perma Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(c.errorCode, str(e))

    #@d.cache_control(seconds=86400)
    @d.trace(log, ['type', 'handle', 'realm', 'infoOnly'])
    def get(self, type, handle, realm=None, infoOnly=False):
        """
            Returns the artifact of the given perma URL information:

            type        The artifact type.
            handle      The artifact handle, defaults to the artifact handle
                        with spaces converted to underscores.
            realm       The user nickname (login), organizations, etc.

            From params:

            extension   Additional qualifier, in key-value pair format with
                        comma separator:
                            version     The 1-origin version number.
                                        For example, if an artifact has 3
                                        revisions, 5, 7, and 12, specifying
                                        version 1 will get revision 5,
                                        version 2 will get revision 7, and
                                        version 3 will get revision 12.
                            withMathJax If true => use mathJax expressions;
                                        otherwise, no mathJax expressions
                                        will be used (default).
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        c.errorCode = ErrorCodes.OK
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            extDict = h.parsePermaExtension(request.params.get('extension'))
            forUpdate = str(extDict.get('forupdate', False)) == 'true'
            ar = g.ac.getArtifactByPerma(type, handle, realm, extDict)
            revisionID = ar.artifactRevisionID
            options = g.ac.parseExtension(extDict)

            memberID = None
            try:
                member = u.getCurrentUser(request, anonymousOkay=False)
                memberID = member.id
            except Exception as e:
                pass

            returnDraftIfDraftExists = request.params.get('returnDraftIfDraftExists')
            if returnDraftIfDraftExists in ('TRUE', 'True', 'true', 'YES','Yes', 'yes'):
                returnDraftIfDraftExists = True
            else:
                returnDraftIfDraftExists= False

            draftResult = None
            if returnDraftIfDraftExists and memberID and revisionID:
                draftResult = api.getMemberArtifactDraftByArtifactRevisionID(memberID=memberID, artifactRevisionID=revisionID)

            from flx.lib import artifact_utils as au

            result = au.getArtifact(ar.id, revisionID, type, memberID, options, result, draftResult=draftResult, forUpdate=forUpdate, infoOnly=infoOnly)

            if request.GET.get('format') == 'html':
                if result['response'].get(type) and result['response'][type].get('xhtml'):
                    xhtml = result['response'][type]['xhtml']
                    log.debug("headers: %s" % str(request.headers.get("X-CK12-META-APPID")))
                    if request.headers.get('X-CK12-META-APPID') == '5386f4d2f3008abe34221e82b3242caf3fd9695e':
                        newAppNotification = '''<div style="background: #FFF9D5; padding:10px 10px 10px 20px; min-height:122px; font-family:Helvetica Neue, Helvetica, serif; font-size:14px; text-align:center; vertical-align:middle;">
                                                <div style="min-height:102px; padding:50px 20px 20px 90px; background-image: url(http://www.ck12.org/media/images/notice.png); background-position:left center; background-repeat:no-repeat;">
                                                    A <a href="https://itunes.apple.com/us/app/ck-12/id909343639?ls=1&mt=8" style="font-weight:bold; color:#1aaba3;">new CK-12 App</a> is now available 
                                                        for both iPhone and iPad. The app you are currently using will be retired on June 30, 2015, and will no longer be available.
                                                </div>
                                                </div>'''
                        xhtml = xhtml.replace('<body>', '<body>' + newAppNotification)
                    return xhtml
            return d.jsonifyResponse(result, datetime.now())
        except Exception, e:
            log.error('get perma Exception[%s]' % str(e), exc_info=e)
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, str(e)), datetime.now())

    @d.jsonify()
    @d.trace(log, ['type', 'handle', 'realm'])
    def getParent(self, type, handle, realm=None):
        """
            Returns the parent of the artifact identified by the perma URL
            information:

            type        The artifact type.
            handle      The artifact handle, defaults to the artifact handle
                        with spaces converted to underscores.
            realm       The user nickname (login), organizations, etc.

            If there are more than one parent, only the first one
            will be selected.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ar = g.ac.getArtifactByPerma(type, handle, realm)
            if ar is None:
                if type is None:
                    type = 'artifact'
                raise Exception((_(u'No %(type)s found for %(handle)s')  % {"type":type,"handle": handle}).encode("utf-8"))

            parents = api.getArtifactParents(artifactID=ar.id)
            if parents is None or len(parents) == 0:
                id = '%s/%s' % (type, handle)
                if realm is not None:
                    id = '%s/%s' % (realm, id)
                raise Exception((_(u'No parent found for %(id)s')  % {"id":id}).encode("utf-8"))
            result = g.ac.getDetail(result, id=parents[0]['parentID'])
            return result
        except Exception as e:
            log.error('get artifact parents Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['rtype', 'type', 'handle', 'realm'])
    def getDescendant(self, type, handle, realm=None, rtype='detail'):
        """
            Returns the details of a descendant of the artifact
            identified by the perma url.

            section parameter contains the sequence number of
            the desired descendant in the form x.y where
            x and y are integers referring to the sequence numbers
            of the artifact descendants with the book parent. All
            sequence numbers are 1 based.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            infoOnly = minimalOnly = False
            extDict = h.parsePermaExtension(request.params.get('extension'))
            log.debug("extDict: %s" % extDict)
            ar = g.ac.getArtifactByPerma(type, handle, realm, extDict)
            if not ar:
                if not type:
                    type = 'artifact'
                raise Exception((_(u'No %(type)s found for %(handle)s, %(realm)s')  % {"type":type,"handle": handle,"realm": realm}).encode("utf-8"))
            artifactRevision = api.getArtifactRevisionByID(id=ar.artifactRevisionID)

            options = []
            value = extDict.get('includeconceptcontent')
            if value and str(value).lower() == 'true':
                options.append('includeConceptContent')
            value = extDict.get('includechildcontent')
            if value and str(value).lower() == 'true':
                options.append('includeChildContent')
            value = extDict.get('includechildheaders')
            if value and str(value).lower() == 'true':
                options.append('includeChildHeaders')
            value = extDict.get('includerelatedartifacts')
            if value and str(value).lower() == 'true':
                options.append('includeRelatedArtifacts')
            forUpdate = str(extDict.get('forupdate', False)) == 'true'

            if rtype == 'info':
                infoOnly = True
            if rtype == 'minimal':
                minimalOnly = True

            returnDraftIfDraftExists = request.params.get('returnDraftIfDraftExists')
            if returnDraftIfDraftExists in ('TRUE', 'True', 'true', 'YES','Yes', 'yes'):
                returnDraftIfDraftExists = True
            else:
                returnDraftIfDraftExists= False

            memberID = None
            try:
                member = u.getCurrentUser(request, anonymousOkay=False)
                memberID = member.id
            except Exception as e:
                pass

            if not request.params.get('section'):
                raise Exception((_(u"No section specified for artifact: %(handle)s")  % {"handle":handle}).encode("utf-8"))
            section = request.params.get('section')
            sections = section.split('.')
            listLen = 2
            sequenceList = [ int(i) for i in sections ]
            while len(sequenceList) < listLen:
                sequenceList.append(0)
            if sequenceList[0] == 0:
                raise Exception((_(u"Invalid section: %(section)s")  % {"section":section}).encode("utf-8"))
            log.info('sequenceList[%s]' % sequenceList)
            descendantType = request.params.get('descendantType')
            descRevs = api.getDescendantArtifactRevisionBySequence(artifactRevision=artifactRevision, sequenceList=sequenceList)
            log.info('descRevs[%s]' % descRevs)
            descRev = descRevs[-1]
            revisionID=descRev.id

            draftResult = None
            type = 'artifact'
            if returnDraftIfDraftExists and memberID and revisionID:
                draftResult = api.getMemberArtifactDraftByArtifactRevisionID(memberID=memberID, artifactRevisionID=revisionID)

            from flx.lib import artifact_utils as au

            result = au.getArtifact(descRev.artifactID, revisionID, type, memberID, options, result, draftResult=draftResult, forUpdate=forUpdate, infoOnly=infoOnly, minimalOnly=minimalOnly, descendantType=descendantType, sequenceList=sequenceList, descRevs=descRevs)

            return result
        except Exception as e:
            log.error('get artifact descendant Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #@d.cache_control(seconds=86400)
    @d.jsonify()
    @d.trace(log, ['type', 'handle', 'realm', 'resourceTypes'])
    def getResourcesInfo(self, type, handle, realm=None, resourceTypes='resource'):
        """
            Retrieves metadata for all resources associated with this artifact.
            If type is specified, the loopup will be limited to only the given 
            artifact type. If revision is not specified, the latest revision will
            be selected. If resourceType is specified, only resources of that type
            will be returned.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            attachmentsOnly = str(request.params.get('attachmentsOnly')).lower() == 'true'
            member = u.getCurrentUser(request)
            extDict = h.parsePermaExtension(request.params.get('extension'))
            ar = g.ac.getArtifactByPerma(type, handle, realm, extDict)
            data = {
                'id': ar.artifactRevisionID,
                'artifactID': ar.id,
                'revision': ar.revision,
                'downloads': ar.downloads,
                'favorites': ar.favorites,
                'creationTime': ar.revCreationTime,
                'publishTime': ar.publishTime,
            }
            artifactRevision = model.ArtifactRevision(**data)

            rInfos = g.ac.getResourcesInfo(resourceTypes, [artifactRevision], attachmentsOnly, member)
            result['response']['resources'] = rInfos
            result['response']['total'] = len(rInfos)
            return result
        except Exception, e:
            log.error('get artifact resources Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['type', 'handle', 'realm'])
    def getVocabularyInfo(self, type, handle, realm=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            languageCode = request.params.get('languageCode')
            extDict = h.parsePermaExtension(request.params.get('extension'))
            ar = g.ac.getArtifactByPerma(type, handle, realm, extDict)
            if languageCode:
                language = api.getLanguageByCode(code=languageCode)
                if not language:
                    c.errorCode = ErrorCodes.NO_SUCH_LANGUAGE
                    raise Exception('No such language code, Code:%s' % languageCode)
            else:
                languageCode = 'en'
            if not ar:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                raise Exception('No such artifact: type:%s handle:%s realm:%s' % (str(type), str(handle), str(realm)))
            vocabularies = api.getVocabulariesByArtifactID(artifactID=ar.id, languageCode=languageCode)
            vresults = []
            lresults = []
            languages= api.getVocabularyLanguagesForArtifact(artifactID=ar.id)
            log.debug("languages: %s" % languages) 
            for vocab in vocabularies:
                vresults.append(vocab.asDict())
            for language in languages:
                lresults.append({'languageCode':language[0], 'languageName':language[1]})
            result['response'][ 'languages' ] = lresults
            result['response'][ 'vocabularies' ] = vresults
            return result
        except Exception, e:
            log.error('get vocabularies Exception[%s]' % str(e), exc_info=e)
            if not hasattr(c,'errorCode'):
                c.errorCode = ErrorCodes.NO_SUCH_VOCABULARY
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['type', 'handle', 'realm', 'artifactTypes'])
    def getExtendedArtifacts(self, type, handle, realm=None, artifactTypes='artifact'):
        """
            Retrieves metadata information for all extended artifacts associated with
            the given artifact using perma.
            Supported artifactTypes are: book, tebook, workbook, studyguide, labkit, quizbook
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ar = g.ac.getArtifactByPerma(type, handle, realm)
            artifactTypes = [ x.strip() for x in artifactTypes.split(',') ]
            if 'artifact' in artifactTypes:
                artifactTypes = None
            artifactDict, artifact = ArtifactCache().load(ar.id, ar.artifactRevisionID, None, None)

            member = u.getCurrentUser(request, anonymousOkay=True)

            artifacts = api.getExtendedArtifacts(artifact=artifact, memberID=member.id, artifactTypes=artifactTypes, countOnly=False) 
            result['response']['extendedArtifacts'] = artifacts
            return result
        except Exception, e:
            log.error('get extended artifacts Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
