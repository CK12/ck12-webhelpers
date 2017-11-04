import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from flxweb.lib.base import BaseController, render
from flxweb.lib.remoteapi import RemoteAPI
from pylons.templating import render_jinja2

log = logging.getLogger(__name__)

class SaythanksController(BaseController):

    def index(self):
        api = 'get/downloadStats'
        data = RemoteAPI.makeGetCall(api)
        c.downloadstats = data['response']['downloadstats']
        return render_jinja2('saythanks/saythanks.html')
