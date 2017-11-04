import logging

from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.ck12_eflex_lib.eflex_processor import CK12EflexGateway
from flx.controllers.common import ArtifactCache

from pylons import config

logger = logging.getLogger(__name__)

class EflexProcessor(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.routing_key = "print"

    def run(self, email_content_file, **kwargs):
        GenericTask.run(self, **kwargs)
        logger.info('EMAIL ACC File %s'%email_content_file)
        eflex_gateway = CK12EflexGateway(cache=ArtifactCache)
        eflex_gateway.setLogger(logger)
        eflex_gateway.process_email(email_content_file)
        return {}
