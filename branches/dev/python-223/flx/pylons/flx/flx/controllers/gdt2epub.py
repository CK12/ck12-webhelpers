import logging
import os
import traceback
from datetime import datetime
from tempfile import NamedTemporaryFile
import urllib
from urllib2 import urlopen, build_opener
import json

from pylons import config, request, response, session, url, tmpl_context as c
from pylons.controllers.util import abort, redirect

from flx.controllers import decorators as d
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.lib.translator as translator
import flx.controllers.user as u
from flx.controllers.celerytasks import gdt2epub
from flx.controllers.errorCodes import ErrorCodes

from celery.task import Task
from celery.task.sets import subtask

GOOGLE_AUTHSUB_URL = r'https://www.google.com/accounts/AuthSubRequest?scope=https%3A%2F%2Fdocs.google.com%2Ffeeds%2F&session=1&secure=0&next='
GOOGLE_AUTHSUB_SESSION_URL = r'https://www.google.com/accounts/AuthSubSessionToken'

log = logging.getLogger(__name__)

class Gdt2EpubController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def gdt2ePubConvert(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        artifactHandle = None
        start = datetime.now()
        try:
            docIDs = request.params.get('docIDs')
            bookTitle = request.params.get('bookTitle')
            token = session.get('googleAuthToken')

            log.info(request.params)
            log.info("Converting with GoogleDocs with docIDs: %s, authToken: %s" %(docIDs, token))

            gdt2ePubTask = gdt2epub.Gdt2ePubTask()
            handle = gdt2ePubTask.delay(docIDs, member.id, bookTitle, token, loglevel='INFO', user=member.id)
            taskID = handle.task_id
            log.info("Task id: %s" % taskID)
            result['response']['taskID'] = taskID
            return result
        except Exception, e:
            log.error('GDT to ePub conversion Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CONVERT_GDT2EPUB
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def gdt2ePubForm(self, member):
        log.info('Redirecting to gdt2epub form')
        c.prefix = self.prefix
        c.member = member
        c.googleAuthToken = session.get('googleAuthToken')
        ret = url(controller='gdt', action='googleAuthToken', qualified=True)
        c.googleAuth = GOOGLE_AUTHSUB_URL + urllib.quote(ret)
        return render('/flx/gdt/gdt2epub.html')


    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def googleAuthToken(self, member):
        token = request.params.get('token')
        if token:
            log.info("Received single use token: %s" % token)
            ## Make session token
            opener = build_opener()
            opener.addheaders.append(('Authorization', 'AuthSub token="%s"' % (token)))
            data = opener.open(GOOGLE_AUTHSUB_SESSION_URL, None, 30).read()
            log.info("Data: %s" % data)
            token = data.strip().split('=')[1]
            log.info("Saving session token: %s" % token)
            session['googleAuthToken'] = token
            session.save()
        rurl = url(controller='gdt2epub', action='gdt2ePubForm', qualified=True)
        return redirect(rurl)
