import logging
import os
import traceback
from tempfile import NamedTemporaryFile
from pylons.i18n.translation import _ 

from pylons import config, request, tmpl_context as c

from flx.controllers import decorators as d
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u
from flx.controllers.celerytasks import xdt
from flx.controllers.errorCodes import ErrorCodes


log = logging.getLogger(__name__)

class XdtController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False)
    @d.trace(log, ['member'])
    def xdtImport(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = member
        token = u.getUserToken(request)
        try:
            user = u.getImpersonatedMember(user)
            xdtShareDir = config.get('xdt_share_linux')
            command = None
            if request.POST.has_key('command'):
                command = request.POST['command']
            if not command or command == 'docx2docbook':
                command = 'docx2xhtml'

            title = request.POST.get('title')
            if not title:
                raise Exception((_(u"Lesson title must be specified")).encode("utf-8"))
            artifactHandle = title.replace(" ", '-')
            artifactType = request.params.get('artifactType', 'lesson')

            # For xdt request create duplicate file with some random string, so even if originally uploaded file contains
            # unicode characters in the file name, it will not cause any issue on windows instance. 
            savedFilePath = h.saveUploadedFile(request, 'fromFile', dir=xdtShareDir, allowedExtenstions=['.docx'], duplicateFile=True, userID=user.id)
            if h.isFileMalicious(savedFilePath):
                raise Exception((_(u'Malicious file detected. Aborting.')).encode("utf-8"))

            filename = os.path.basename(savedFilePath)
            tofile = filename + '.xhtml'
     
            updateExisting = False
            if request.POST.has_key('updateExisting'):
                updateExisting = request.POST['updateExisting']
    
            xdtTask = xdt.XdtTask()
            handle = xdtTask.delay(command, filename, tofile, user.id, token, title=title, artifactHandle=artifactHandle, type=artifactType, saveArtifacts=True,updateExisting=updateExisting, loglevel='INFO', user=user.id)

            result['response']['task_id'] = handle.task_id
            result['response']['output'] = tofile
            return result
        except Exception, e:
            log.error('XDT import Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_IMPORT_XDT_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def xdtImportForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/xdt/xdtimport.html')

    @d.jsonify()
    @d.checkAuth(request, False)
    @d.trace(log)
    def xdtExport(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        token = u.getUserToken(request)
        try:
            xdtShareDir = config.get('xdt_share_linux')
            command = None
            if request.POST.has_key('command'):
                command = request.POST['command']
            if not command or command == 'docbook2docx':
                command = 'xhtml2docx'
            savedFilePath = h.saveUploadedFile(request, 'fromFile', dir=xdtShareDir)
            
            filename = os.path.basename(savedFilePath)
            tofile = filename + '.docx'
        
            xdtTask = xdt.XdtTask()
            handle = xdtTask.delay(command, filename, tofile, user.id, token, loglevel='INFO', user=user.id)

            result['response']['task_id'] = handle.task_id
            result['response']['output'] = tofile
            return result
        except Exception, e:
            log.error('XDT export Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_EXPORT_XDT_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.checkAuth(request, False, False, ['command', 'artifactID', 'revisionID'])
    @d.trace(log, ['command', 'artifactID', 'revisionID'])
    def xdtExportArtifact(self, command, artifactID, revisionID=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=False)
        token = u.getUserToken(request)
        try:
            xdtShareDir = config.get('xdt_share_linux')
            if not command or command == 'docbook2docx':
                command = 'xhtml2docx'
            #raise Exception((_(u'Not implemented.')).encode("utf-8"))

            artifactID = int(artifactID)
            artifact = api.getArtifactByID(id=artifactID)
            if not artifact:
                raise Exception((_(u'No such artifact: %(artifactID)d')  % {"artifactID":artifactID}).encode("utf-8"))

            artifactRevision = None
            if revisionID:
                revisionID = int(revisionID)
                for revision in artifact.revisions:
                    if revision.id == revisionID:
                        artifactRevision = revision
                        break
            else:
                artifactRevision = artifact.revisions[0]

            if not artifactRevision:
                raise Exception((_(u'No such revisionID for this artifact[%(artifactID)d]: %(revisionID)d')  % {"artifactID":artifactID,"revisionID": revisionID}).encode("utf-8"))

            uri = artifactRevision.getUri('contents')
            if not uri:
                raise Exception((_(u"Could not get xhtml uri for artifact[%(artifactID)d]: %(revisionID)d")  % {"artifactID":artifactID,"revisionID": revisionID}).encode("utf-8"))

            log.info("File: %s" % uri)
            savedFile = NamedTemporaryFile(suffix=os.path.basename(uri), delete=False, dir=xdtShareDir)
            savedFile.close()

            h.saveContents(savedFile.name, artifactRevision.getXhtml())

            ## Convert XHTML to docbook first
            #xhtmlPath = translator.cleanup(savedFile.name)
            #docbook = translator.get_docbook(xhtmlPath)
            #if docbook:
            #    h.saveContents(savedFile.name, docbook)
            #else:
            #    raise Exception((_(u'Error converting to docbook.')).encode("utf-8"))

            filename = os.path.basename(savedFile.name)
            tofile = filename + '.docx'
        
            xdtTask = xdt.XdtTask()
            handle = xdtTask.delay(command, filename, tofile, user.id, token, loglevel='INFO', user=user.id)

            result['response']['task_id'] = handle.task_id
            result['response']['output'] = tofile
            return result
        except Exception, e:
            log.error('XDT export artifact Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_EXPORT_XDT_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def xdtExportForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/xdt/xdtexport.html')

