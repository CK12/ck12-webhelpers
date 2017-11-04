import logging
from pylons.i18n.translation import _ 

from pylons import request, tmpl_context as c

from flx.controllers import decorators as d
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class FavoriteController(BaseController):
    """
        Favorite related APIs.
    """

    #
    #  Create related APIs.
    #
    def _create(self):
        artifactRevisions = api.getArtifactRevisions()
        c.artifactRevisionDict = {}
        for artifactRevision in artifactRevisions:
            c.artifactRevisionDict[artifactRevision.artifact.name + '.' + artifactRevision.revision] = artifactRevision.id
        c.artifactRevisionKeys = sorted(c.artifactRevisionDict.keys())
        member = u.getCurrentUser(request)
        c.userName = member.fix().name
        c.prefix = self.prefix
        return render('/flx/favorite/createForm.html')

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def createForm(self):
        return self._create()

    @d.jsonify()
    @d.checkAuth(request, True, False, ['revisionID'])
    @d.trace(log, ['revisionID'])
    def create(self, revisionID=None):
        """
            Adds a revision of an artifact as favorite.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            if member.id == 1 and request.params.has_key('memberID'):
                memberID = request.params['memberID']
                if memberID != 1:
                    member = api.getMemberByID(id=memberID)
            if revisionID is None:
                revisionID = request.POST['revisionID']
            #
            #  See if the favorite has already been added.
            #
            favorite = api.getFavorite(artifactRevisionID=revisionID,
                                        memberID=member.id)
            if favorite is not None:
                c.errorCode = ErrorCodes.FAVORITE_ALREADY_EXIST
                return ErrorCodes().asDict(c.errorCode)

            revision =  api.getArtifactRevisionByID(id=revisionID)
            favorite = api.createFavorite(artifactRevision=revision,
                                          member=member)
            result['response']['favorite'] = { 'memberID': member.id, 'revisionID': revisionID }
            #
            #  Reindex
            #
            id = revision.artifactID
            taskId = h.reindexArtifacts([id])
            log.debug("Featured: reindex[%s] Task id: %s" % (id, taskId))
            return result
        except Exception, e:
            log.error('add favorite Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_FAVORITE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['revisionID'])
    @d.trace(log, ['member', 'revisionID'])
    def delete(self, member, revisionID):
        """
            Deletes the given favorite identified by id.
        """
        try:
            memberID = member.id
            if member.id == 1 and request.params.has_key('memberID'):
                memberID = request.params['memberID']
                member = api.getMemberByID(id=memberID)
            favorite = api.getFavorite(artifactRevisionID=revisionID, memberID=memberID)
            if favorite is None:
                c.errorCode = ErrorCodes.NO_SUCH_FAVORITE
                raise Exception((_(u'Favorite for %(revisionID)s not found.')  % {"revisionID":revisionID}).encode("utf-8"))

            api.deleteFavorite(favorite=favorite)
            #
            #  Reindex
            #
            revision = api.getArtifactRevisionByID(id=revisionID)
            id = revision.artifactID
            taskId = h.reindexArtifacts([id])
            log.debug("Featured: reindex[%s] Task id: %s" % (id, taskId))
            return ErrorCodes().asDict(ErrorCodes.OK)
        except Exception, e:
            log.error('delete Favorite Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_FAVORITE
            return ErrorCodes().asDict(c.errorCode, str(e))
