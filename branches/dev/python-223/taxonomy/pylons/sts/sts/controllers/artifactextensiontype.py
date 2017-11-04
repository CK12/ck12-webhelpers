import logging
import os
from datetime import datetime
import traceback
from tempfile import NamedTemporaryFile

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort
from sqlalchemy.sql import select
from pylons.decorators.cache import beaker_cache

from sts.controllers import decorators as d
import sts.controllers.user as u
import sts.controllers.activitylog as alog
from sts.model import meta
from sts.model import api
from sts.model.model import ConceptNode, ActivityLog
from sts.lib.base import BaseController, render
import sts.lib.helpers as h

from sts.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class ArtifactextensiontypeController(BaseController):

    def _get(self, id):
        extType = api.getArtifactExtensionTypeByShortname(shortname=id)
        if not extType:
            raise Exception("No extension type by shortname : %s" % id)
        return extType

    @d.jsonify()
    @d.trace(log, ['id'])
    def getInfo(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            extType = self._get(id)
            result['response'] = extType.asDict()
            return result
        except Exception, e:
            log.error("Get artifact extension type info exception: [%s]" % str(e))
            log.error(traceback.format_exc())
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ARTIFACT_EXTENSION_TYPE, str(e))

    @d.jsonify()
    @d.setPage(['status'])
    @d.trace(log, ['status', 'pageNum', 'pageSize'])
    def listExtensionTypes(self, status=None, pageNum=0, pageSize=0):
        """
            List all extension types of a particular status.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not status:
                status = 'published'
            extTypes = api.getArtifactExtensionTypes(status=status, pageNum=pageNum, pageSize=pageSize)
            result['response']['total'] = extTypes.getTotal()
            result['response']['offset'] = (pageNum-1) * pageSize
            result['response']['limit'] = pageSize if pageSize <= len(extTypes) else len(extTypes)
            result['response']['artifactExtensionTypes'] = [ e.asDict() for e in extTypes ]
            return result
        except Exception, e:
            log.error("list artifact extension type exception: [%s]" % str(e))
            log.error(traceback.format_exc())
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ARTIFACT_EXTENSION_TYPE, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def exportArtifactExtensionTypeData(self, member):
        start = datetime.now()
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        if not u.hasRoleInGroup('admin'):
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.INSUFFICIENT_PRIVILEGES), start)

        try:
            columns = ['shortname', 'name', 'description']
            csvFile = NamedTemporaryFile(suffix='csv', delete=False)
            csvFile.close()
            import csv
            f = open(csvFile.name, 'wb')
            writer = csv.writer(f)
            writer.writerow(columns)
            log.info("Wrote header: %s" % columns)

            pageNum = 1
            pageSize = 64
            while True:
                aeTypes = api.getArtifactExtensionTypes(pageSize=pageSize, pageNum=pageNum)
                log.info("aeTypes: %s" % aeTypes)
                if aeTypes.results:
                    log.info("Here")
                    for aeType in aeTypes:
                        log.info("Writing: %s" % [aeType.shortname, aeType.typeName, aeType.description])
                        writer.writerow([aeType.shortname, aeType.typeName, aeType.description])
                else:
                    break

                pageNum += 1

            f.close()

            file_size = os.path.getsize(csvFile.name)
            headers = [('Content-Disposition', 'attachment; filename=\"ArtifactExtensionTypes.csv\"'), ('Content-Type', 'text/csv'), ('Content-Length', str(file_size))]

            from paste.fileapp import FileApp
            fapp = FileApp(csvFile.name, headers=headers)

            return fapp(request.environ, self.start_response)
        except Exception, e:
            log.error("Error exporting ArtifactExtensionTypes data: %s" % str(e))
            log.error(traceback.format_exc())
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.CANNOT_EXPORT_ARTIFACT_EXTENSION_TYPE_DATA, str(e)), start)

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def create(self, member):
        """
            Register a new artifact extension type
            Expects a post request with following parameters
                name: name of the extension type
                description': description of the extension type
                shortname: shortname of the extension type
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            name = request.POST.get('name', '').strip()
            if not name:
                raise Exception('Must specify a name for the new extension type')

            description = request.POST.get('description')
            shortname = request.POST.get('shortname', '').strip()
            if not shortname:
                raise Exception('Must specify a shortname')

            kwargs = {
                    'typeName': name,
                    'description': description,
                    'shortname': shortname.upper(),
                }
            aet = api.createArtifactExtensionType(**kwargs)

            ## Log the activity
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_CREATE, aet)

            result['response'] = aet.asDict()
            return result
        except Exception, e:
            log.error("Error creating a new extension type: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_CREATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_ARTIFACT_EXTENSION_TYPE, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def createForm(self, member):
        c.memberID = member['id']
        c.memberLogin = member['login']
        return render('/sts/create/artifactExtensionTypeForm.html')

    @d.checkAuth(toJsonifyError=True, argNames=['id'])
    @d.trace(log, ['id', 'member'])
    def updateForm(self, member, id):

        aet_node = api.getArtifactExtensionTypeByShortname(id)
        c.memberID = member['id']
        c.memberLogin = member['login']
        aet_info = aet_node.asDict()
        c.shortname = aet_info.get('shortname', '')
        c.typeName = aet_info.get('typeName', '')
        c.description = aet_info.get('description', '')
        #c.node_id = aet_info.get('id', '')

        return render('/sts/update/artifactExtensionTypeForm.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def update(self, member):
        """
            Update artifact extension type
            Expects a post request with following parameters
                name: name of the extension type
                description': description of the extension type
                shortname: shortname of the extension type
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err
	    	
            nodeID = request.POST.get('nodeID', '').strip()          
            shortname = request.POST.get('shortname', '').strip()          
            name = request.POST.get('name', '').strip()
            description = request.POST.get('description', '').strip()
            kwargs = {
                    'typeName': name,
                    'description': description,
                    'shortname': shortname.upper(),
                    'id': nodeID,
                }
            aet = api.updateArtifactExtensionType(**kwargs)

            ## Log the activity
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_UPDATE, aet)

            result['response'] = aet.asDict()
            return result
        except Exception, e:
            log.error("Error updating an extension type: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_UPDATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_ARTIFACT_EXTENSION_TYPE, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def delete(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            id = request.POST.get('id')
            extType = self._get(id)

            aet = api.deleteArtifactExtensionType(id=extType.id)
            ## Log the activity
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_DELETE, extType)
            result['response'] = aet.asDict()
            return result
        except Exception, e:
            log.error("Error deleting extension type: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_ARTIFACT_EXTENTION_TYPE_DELETE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_ARTIFACT_EXTENSION_TYPE, str(e))

