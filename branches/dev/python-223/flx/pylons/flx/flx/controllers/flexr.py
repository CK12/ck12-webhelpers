import logging
from datetime import datetime
from pylons.i18n.translation import _ 

from pylons import config, request, tmpl_context as c

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache
from flx.model import model
from flx.model import api
from flx.model import exceptions as ex
from flx.lib.base import BaseController
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class FlexrController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, False, ['memberID'])
    @d.trace(log, ['member', 'memberID'])
    def has1xBooks(self, member, memberID=None):
        """
            See if this member has any 1.x books.

            If memberID is given and not the same as the logged in member,
            then the logged in member must be the administrator.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.NO_SUCH_MEMBER
        try:
	    if memberID is None or long(memberID) == member.id:
                memberID = member.id
            elif not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                raise ex.UnauthorizedException((_(u'Only admin can check 1.x flexbooks for other members.')).encode("utf-8"))

            fbm = api.getFrom1xBookMember(memberID=memberID)
            result['response']['result'] = fbm.asDict() if fbm else {}
            return result
        except Exception, e:
            log.error('has1xBooks: Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.sortable(request, ['member'])
    @d.filterable(request, ['member', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'sort', 'fq'])
    @d.trace(log, ['member', 'sort', 'fq', 'pageNum', 'pageSize'])
    def have1xBooks(self, member, sort=None, fq=None, pageNum=0, pageSize=0):
        """
            Return the list of members that have 1.x books.

            This is an admistrator only API.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.NO_SUCH_MEMBER
        try:
            if not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                raise ex.UnauthorizedException((_(u'Only admin can check 1.x flexbooks for other members.')).encode("utf-8"))

            filterDict = {}
            if fq:
                for fld, term in fq:
                    filterDict[fld] = term

            fbms = api.getFrom1xBookMembers(sorting=sort,
                                            filterDict=filterDict,
                                            pageNum=pageNum,
                                            pageSize=pageSize)
            fbmList = []
            for fbm in fbms:
                fbmList.append(fbm.asDict())
            result['response']['total'] = fbms.getTotal()
            result['response']['limit'] = len(fbmList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = fbmList
            return result
        except Exception, e:
            log.error('have1xBooks: Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def acknowledge1xBooks(self, member):
        """
            This member acknowledged the completion of importing 1.x books.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            fbm = api.getFrom1xBookMember(memberID=member.id)
            fbm.status = 'Acknowledged'
            api.update(instance=fbm)
            result['response']['result'] = fbm.asDict() if fbm else {}
            return result
        except Exception, e:
            log.error('acknowledge1xBooks: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def decline1xBooks(self, member):
        """
            This member declines the invitation to import 1.x books.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            fbm = api.getFrom1xBookMember(memberID=member.id)
            fbm.status = 'Declined'
            api.update(instance=fbm)
            result['response']['result'] = fbm.asDict() if fbm else {}
            return result
        except Exception, e:
            log.error('decline1xBooks: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['memberID'])
    @d.trace(log, ['member', 'memberID'])
    def reset1xBooks(self, member, memberID):
        """
            The member, identified by memberID, changes her mind and would
            like to be able to import 1.x books again.

            The support (admin) is performing the reset for her.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.NO_SUCH_MEMBER
        try:
            if not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                raise ex.UnauthorizedException((_(u'Only administator can reset import 1.x flexbooks for other members.')).encode("utf-8"))

            fbm = api.getFrom1xBookMember(memberID=memberID)
            if fbm is None:
                raise Exception((_(u'No flexbook for member[%(memberID)s]')  % {"memberID":memberID}).encode("utf-8"))

            fbm.status = 'Not Started'
            api.update(instance=fbm)
            result['response']['result'] = fbm.asDict() if fbm else {}
            return result
        except Exception, e:
            log.error('reset1xBooks: Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['memberID'])
    @d.setPage(request, ['member', 'memberID'])
    @d.trace(log, ['member', 'memberID', 'pageNum', 'pageSize'])
    def get1xBooks(self, member, memberID, pageNum, pageSize):
        """
            Get the list of migrated books for member, identified
            by memberID.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.NO_SUCH_MEMBER
        try:
            memberID = long(memberID)
            if memberID != member.id and not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                raise ex.UnauthorizedException((_(u'Only administator can get migrated flexbook list for others.')).encode("utf-8"))

            books = api.getFrom1xBooks(memberID=memberID)
            bookList = []
            for book in books:
                bookDict = book.asDict()
                del bookDict['memberID']
                bookList.append(bookDict)

            result['response']['total'] = books.getTotal()
            result['response']['limit'] = len(bookList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = bookList
            return result
        except Exception, e:
            log.error('get1xBooks: Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['fid'])
    def get1xBook(self, fid):
        """
            Get the artifact of migrated book, identified by fid.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            bookMapping = api.getUnique(what=model.From1xBook, term='fid', value=fid)
            if bookMapping is None:
                raise ex.NotFoundException((_(u'No 1.x book id of %(fid)s')  % {"fid":fid}).encode("utf-8"))
            id = bookMapping.artifactID
            bookDict, artifact = ArtifactCache().load(id)
            if not artifact:
                raise ex.NotFoundException((_(u'No 2.0 book artifact id of %(id)s')  % {"id":id}).encode("utf-8"))
            result['response']['artifact'] = bookDict
            return result
        except ex.NotFoundException, nfe:
            log.error('get1xBook: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            log.error('get1xBook: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['cid'])
    def get1xChapter(self, cid):
        """
            Get the artifact of migrated chapter, identified by cid.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            chapterMapping = None
            member = u.getCurrentUser(request)
            if member is not None:
                #
                #  Get the chapter owned by this member, if available.
                #
                chapterMapping = api.getFrom1xChapter(cid=cid, memberID=member.id)
            if chapterMapping is None:
                #
                #  Get the public chapter.
                #
                ck12Editor = config.get('ck12_editor')
                member = api.getMemberByLogin(login=ck12Editor)
                chapterMapping = api.getFrom1xChapter(cid=cid, memberID=member.id)
            if chapterMapping is None:
                raise ex.NotFoundException((_(u'No 1.x chapter id of %(cid)s')  % {"cid":cid}).encode("utf-8"))
            id = chapterMapping.artifactID
            chapterDict, artifact = ArtifactCache().load(id, memberID=member.id)
            if not artifact:
                raise ex.NotFoundException((_(u'No 2.0 chapter id of %(id)s')  % {"id":id}).encode("utf-8"))
            result['response']['artifact'] = chapterDict
            parents = api.getArtifactParents(id)
            if len(parents) > 0:
                parentDict, artifact = ArtifactCache().load(parents[0]['parentID'], memberID=member.id)
                result['response']['parent'] = parentDict
                result['response']['position'] = parents[0]['sequence']
            return result
        except ex.NotFoundException, nfe:
            log.error('get1xChapter: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            log.error('get1xChapter: Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['memberID'])
    @d.trace(log, ['member', 'memberID'])
    def import1xBooks(self, member, memberID=None):
        """
            Import 1.x books for the member.

            If memberID is given and not the same as the logged in member,
            then the logged in member must be the administrator.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
        try:
	    if memberID is None or long(memberID) == member.id:
                memberID = member.id
            elif not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                raise ex.UnauthorizedException((_(u'Only admin can import 1.x flexbooks for other members.')).encode("utf-8"))
            else:
                memberID = long(memberID)

            fbm = api.getFrom1xBookMember(memberID=memberID)
            if fbm is None:
                raise Exception((_(u'Member[%(memberID)s] has no 1.x flexbooks')  % {"memberID":memberID}).encode("utf-8"))

            memberID = fbm.memberID
            log.debug('fbm: status[%s]' % fbm.status)
            if fbm.status in ('Not Started', 'Failed', 'Declined'):
                from flx.controllers.celerytasks import flexr

                import1xBooks = flexr.Import1xBooks()

                task = import1xBooks.delay(memberID=memberID, user=memberID)
                #
                #  Indicate that the migration process is set to start.
                #
                fbm = api.getFrom1xBookMember(memberID=memberID)
                fbm.status = 'In Progress'
                fbm.started = datetime.now()
                fbm.taskID = task.task_id
                api.update(instance=fbm)

            fbmDict = fbm.asDict()
            result['response']['result'] = fbmDict
            return result
        except Exception, e:
            log.error('import1xBooks:  Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
