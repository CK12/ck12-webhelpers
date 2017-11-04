# -*- coding: utf-8 -*-

from pylons.templating import render_jinja2
from flxweb.lib.base import BaseController
import logging

log = logging.getLogger(__name__)

class AlignedSearchController(BaseController):
    """
    Controller for handling the Auto Aligned Standards page actions
    """

    def home(self, anything=None):
        return render_jinja2('/alignedSearch/index.html')
