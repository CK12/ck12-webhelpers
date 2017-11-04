import logging
import os

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort
from sqlalchemy.sql import select

from flx.controllers import decorators as d
from flx.model import meta
from flx.model import model
from flx.model import api
#from flx.model.workdir import WorkDirectoryUtil as WD
from flx.model.workdir import workdir 
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)


class WorkdirController(BaseController):

    @d.jsonify()
    @d.trace(log)
    def create(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            myUtil = workdir.WorkDirectoryUtil()
            #myUtil = WD()
            newDir = myUtil.getWorkdir()
            result['response']['workdirID'] = { 'workdirID' : newDir[0]}
            result['response']['relativePath'] = { 'relativePath' : newDir[1]}
            return result
        except Exception, e:
            log.exception('Unable to create directory [%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_OVERLAY
            return ErrorCodes().asDict(c.errorCode, str(e))

    
    @d.jsonify()
    @d.trace(log, ['id'])
    def delete(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #myUtil = WD()
            myUtil = workdir.WorkDirectoryUtil()
            newDir = myUtil.purgeWorkDir(id)
            result['response']['status'] = "deleted"
            return result
        except Exception, e:
            log.exception('Unable to delete directory [%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_OVERLAY
            return ErrorCodes().asDict(c.errorCode, str(e))
    