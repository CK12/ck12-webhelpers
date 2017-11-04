import logging
from celery.task.sets import subtask
import traceback
import json
from flx.model import api
import os

from flx.controllers.celerytasks.generictask import GenericTask

logger = logging.getLogger(__name__)

def getImporterInstance(contentVersion='1'):
    if contentVersion == '1':
        from flx.lib.wiki_importer_lib.wiki_importer import WikiImporter as current_wiki_importer
    elif contentVersion == '2':
        from flx.lib.wiki_importer_lib.wiki_importer_2_0 import WikiImporter as current_wiki_importer
    else:
        from flx.lib.wiki_importer_lib.wiki_zip_importer import WikiImporter as current_wiki_importer
    importer = current_wiki_importer()
    return importer

class WikiImporter(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.routing_key = "importer"

    def _is_machine_configured_for_wiki(self, workdir):
        is_machine_configured = True
        try:
            metadata_file = '%s/metadata.xml' % (workdir)
            if not os.path.exists(metadata_file):
                is_machine_configured = False
            else:
                f = open(metadata_file, 'r')
                metadata_content = f.read()
                f.close()
                if metadata_content.__contains__('<title>Login required - CK-12 WiKi</title>'):
                    is_machine_configured = False 
        except Exception as e:
            pass
        return is_machine_configured

    def run(self, wiki_url, user_id, contentVersion='2', workdir=None, is_metadata_mode=False, callback=None, toWait=False, **kwargs):
        if user_id:
            kwargs['user'] = user_id
        GenericTask.run(self, **kwargs)
        importer = getImporterInstance(contentVersion)
        importer.setLogger(logger)
        logger.info("WikiImporter: contentVersion: %s, Importer: %s, callback: %s, toWait: %s, kwargs: %s" % (contentVersion, str(importer), callback, str(toWait), str(kwargs)))
        self.userdata = json.dumps({'status': '[1 of 3] Downloading from wiki.','wiki_url': wiki_url})
        self.updateTask()
        importer_response = importer.import_from_wiki(wiki_url, user_id, workdir=workdir, is_metadata_mode=is_metadata_mode)
        logger.info("Importer response: %s" % str(importer_response))
        is_machine_configured = self._is_machine_configured_for_wiki(workdir)
        if not is_machine_configured and contentVersion != '3':
            self.userdata = json.dumps({'status': 'Failed', 'message':'Invalid Wiki content received.'})
            self.updateTask()
            raise Exception('Please configure system to fetch valid wiki content.')
        self.userdata = json.dumps({'status': '[2 of 3] Processing images..','wiki_url': wiki_url})
        self.updateTask()
        if contentVersion == '3':
            workdir = importer_response['working_dir']
        importer.process_images(workdir, user_id)
        self.userdata = json.dumps({'status': '[3 of 3] Processing content..', 'wiki_url': wiki_url})
        self.updateTask()
        try:
            artifact_id = importer.process_and_import_content(workdir, user_id, kwargs.get('import_drill_mode', 'concept'), kwargs.get('content_splitter_guide'), is_metadata_mode, kwargs.get('toCache', True), wikiurl=wiki_url, taskID=self.task['id'], toWait=toWait)
        except Exception as e:
            task = api.getTaskByID(id=int(self.task['id']))
            if task:
                udata = task.userdata
                if udata:
                    udJson = json.loads(udata)
                else:
                    udJson = {}
                logger.info('UDJSON: %s' % udJson)
                if not udJson.has_key('message'):
                    self.userdata = json.dumps({'status': 'Failed','message':e.__str__(), 'wiki_url':wiki_url})
                else:
                    udJson['wiki_url'] = wiki_url
                    self.userdata = json.dumps(udJson)
            logger.error("Error processing and importing content: %s" % str(e), exc_info=e)
            raise e
        self.userdata = json.dumps({'artifactID': artifact_id, 'wiki_url':wiki_url})
        logger.info("Returning importer response: %s" % str(importer_response))
        logger.info("User data: %s" % self.userdata)
        return importer_response

def loadContent(wiki_imported_dir, user_id, contentVersion='2', import_drill_mode='concept', content_splitter_guide=None, is_metadata_mode=False, toCache=True, wikiurl=None, **kwargs):
    try:
        if user_id:
            kwargs['user'] = user_id
        importer = getImporterInstance(contentVersion)
        logger.info("ContentLoader: contentVersion: %s, Importer: %s" % (contentVersion, str(importer)))
        importer.setLogger(logger)
        artifact_id = importer.process_and_import_content(wiki_imported_dir, user_id,import_drill_mode, content_splitter_guide, is_metadata_mode, toCache, wikiurl=wikiurl)
        response = {}
        response['status_message'] = "Content loaded."
        response['book_id'] = artifact_id
        return response
    except Exception, e:
        logger.error(traceback.format_exc())
        raise e

class ContentLoader(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.routing_key = "importer"

    def run(self, wiki_imported_dir, user_id, contentVersion='2', import_drill_mode='concept', content_splitter_guide=None, is_metadata_mode=False, toCache=True, wikiurl=None, **kwargs):
        GenericTask.run(self, **kwargs)
        self.userdata = json.dumps({
            'wiki_imported_dir': wiki_imported_dir,
            'user_id': user_id,
            'contentVersion': contentVersion,
            'import_drill_mode': import_drill_mode,
            'is_metadata_mode': str(is_metadata_mode),
            'wikiurl': wikiurl,
            })
        self.updateTask()
        return loadContent(wiki_imported_dir, user_id, contentVersion, import_drill_mode, content_splitter_guide, is_metadata_mode, toCache, wikiurl=wikiurl, **kwargs)

class ImageProcessor(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.routing_key = "importer"

    def run(self, wiki_imported_dir, user_id, contentVersion='2', import_drill_mode='concept', content_splitter_guide=None, is_metadata_mode=False, callback=None, toWait=False, toCache=True, wikiurl=None, **kwargs):
        if user_id:
            kwargs['user'] = user_id
        try:
            GenericTask.run(self, **kwargs)
            importer = getImporterInstance(contentVersion)
            importer.setLogger(logger)
            logger.info("ImageProcessor: wiki_imported_dir:%s, user_id:%s, import_drill_mode: %s, content_splitter_guide:%s, is_metadata_mode:%s, callback:%s, toWait:%s, toCache:%s, wikiurl:%s, kwargs:%s" % (wiki_imported_dir, user_id, import_drill_mode, content_splitter_guide, is_metadata_mode, callback, toWait, toCache, wikiurl, kwargs))
            logger.info("ImageProcessor: contentVersion: %s, Importer: %s" % (contentVersion, str(importer)))
            self.userdata = json.dumps({
                'wiki_imported_dir': wiki_imported_dir,
                'user_id': user_id,
                'import_drill_mode': import_drill_mode,
                'is_metadata_mode': str(is_metadata_mode),
                'wikiurl': wikiurl,
                })
            self.updateTask()
            importer.process_images(wiki_imported_dir, user_id)
            if callback is not None:
                if toWait:
                    ret = loadContent(wiki_imported_dir, user_id, contentVersion, import_drill_mode, content_splitter_guide, is_metadata_mode, toCache, wikiurl=wikiurl)
                    logger.info("Returning from loadContent: %s" % ret)
                    return ret

                content_loader = ContentLoader()
                t = subtask(callback).delay(wiki_imported_dir,user_id, contentVersion, import_drill_mode, content_splitter_guide, is_metadata_mode, toCache, wikiurl=wikiurl) 
                response = {}
                response['task_id'] = t.task_id
                response['status_message'] = "Loading content into system.."
                return response

            return {}
        except Exception, e:
            logger.error(traceback.format_exc())
            raise e

