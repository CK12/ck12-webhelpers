#from dexter.models import event
import logging

log = logging.getLogger(__name__)

class BaseView(object):
    def __init__(self, context, request):
        self.c = context
        self.request = request
        log.debug("Request: %s" % str(request.params))
