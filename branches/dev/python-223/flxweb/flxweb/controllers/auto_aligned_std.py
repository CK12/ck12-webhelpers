# -*- coding: utf-8 -*-

from pylons.templating import render_jinja2
from flxweb.lib.base import BaseController
import logging

log = logging.getLogger(__name__)

class AutoAlignedStdController(BaseController):
    """
    Controller for handling the Auto Aligned Standards page actions
    """

    def standards_selector(self, anything=None):
        return render_jinja2('/autoStandards/index.html')


