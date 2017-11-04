import logging
import traceback
import zipfile

from pylons import config, request, tmpl_context as c

from flx.controllers import decorators as d
from flx.model import api
from flx.model.workdir import workdir as WD
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
from flx.controllers import importcommon as common
from flx.controllers.celerytasks import importer
from flx.controllers.errorCodes import ErrorCodes

from celery.task import Task

log = logging.getLogger(__name__)

class ImporterController(BaseController):
    """
        Importer APIs.
    """
    #
    #  Common internal methods.
    #
    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.trace(log, [])
    def wikiImport(self):
        """
            Import content from wiki
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if request.POST.get('import_user_id'):
                user_id = int(request.POST['import_user_id'])
            else:
                user_id = config.get('import_user_id')
            contentVersion = request.POST.get('contentVersion', '2')
            workdir_prefix = "/opt/2.0/work/"

            wiki_url = savedFilePath = None

            myUtil = WD.WorkDirectoryUtil()
            workdir = workdir_prefix + myUtil.getWorkdir()[1]
            log.error("My workdir is: "+ workdir)

            content_splitter_guide = request.POST.get('content_splitter_guide')
            is_metadata_mode = request.POST.get('is_metadata_mode', "False").lower() == 'true'
            import_drill_mode = request.POST.get('import_drill_mode', 'section')

            if request.POST.get('wiki_url'):
                wiki_url = request.params.get('wiki_url')
            elif request.POST.get('filename'):
                ## save the zip file to workdir location
                savedFilePath = h.saveUploadedFile(request, 'file', dir=workdir)
                contentVersion = '3'
            else:
                raise Exception('Wiki URL or Upload is required.')

            #Task 1: Downloading content from wiki
            wiki_importer = importer.WikiImporter()

            task = wiki_importer.delay(wiki_url, user_id, contentVersion=contentVersion, workdir=workdir, is_metadata_mode=is_metadata_mode,
                    import_drill_mode=import_drill_mode, content_splitter_guide=content_splitter_guide, toCache=True)
            result['response']['task_id'] = task.task_id
            return result
        except Exception as e:
            log.error('wiki import Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_IMPORT_FROM_WIKI
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['taskId'])
    def wikiImportStatus(self, taskId):  
        """
            Get status of a wiki import task
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response']['status_message'] = 'Downloading from wiki..'
            got_current_status = False
            current_task_id = taskId
            while not got_current_status:
                if current_task_id == "":
                    break
                wiki_import_task =  Task.AsyncResult(task_id=current_task_id)    
                result['response']['status']  = wiki_import_task.status
        
                if result['response']['status'] == 'SUCCESS':
                    result['response']['result'] = wiki_import_task.result   
                    result['response']['status'] = wiki_import_task.status
                    try:
                        current_task_id = result['response']['result']['task_id']
                    except Exception as e:
                        got_current_status = True
                        result['response']['status_message'] = 'Task completed'
                else:
                    result['response']['status'] = wiki_import_task.status
                    got_current_status = True
            return result
        except Exception, e:
            log.error("wiki import task status check Exception[%s]" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_TASK
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True, ['wiki_url'])
    @d.trace(log, ['wiki_url', 'member'])
    def wikiImportForm(self, member, wiki_url=None):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/wikiimport/wikiimport.html')

    @d.checkAuth(request, True, False)
    @d.trace(log, ['wiki_url'])
    def userContentImportForm(self):
        c.prefix = self.prefix
        return render('/flx/wikiimport/usercontentimport.html')

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def userContentImport(self, member):
        """
            Importing user content from 1.x (actually a zip containing content)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            contentVersion = '1'
            import_drill_mode = 'section'
            user_id = config.get('import_user_id')
            content_splitter_guide = None
            is_metadata_mode = False
            log.debug('ZIP: %s'%request.params)
            log.debug('ZIP: %s'%request.POST)
            wiki_url = request.POST['exported_zip']
            user_id = member.id
            if request.POST.has_key('email'):
                email = request.POST['email']
                user_info = api.getMemberByEmail(email=email) 
                if user_info is None:
                    log.debug('userContentImport: email not found')
                elif user_info.id:
                    user_id = user_info.id
            elif request.POST.has_key('login'):
                login = request.POST['login']
                user_info = api.getMemberByLogin(login=login) 
                if user_info is None:
                    log.debug('userContentImport: login not found')
                elif user_info.id:
                    user_id = user_info.id
            wiki_content_dir = common.create_working_location()
            source_dir = wiki_content_dir
            wiki_content_dir = common.create_working_location() 
            try:
                zf = zipfile.ZipFile(wiki_url.file)
            except Exception, e:
                zf = zipfile.ZipFile(wiki_url)
            zipfile.ZipFile.extractall(zf, source_dir)
            common.transform_1x_to_2x(source_dir, wiki_content_dir)
       

            #Task 2: Process images
            image_processor = importer.ImageProcessor()

            #Task 3: Load content
            content_loader = importer.ContentLoader()
        
            if request.POST.has_key('wait'):
                toWait = request.POST['wait']
            else:
                toWait = False
            task = image_processor.delay(wiki_content_dir, user_id, contentVersion=contentVersion, import_drill_mode=import_drill_mode, content_splitter_guide=content_splitter_guide, is_metadata_mode=is_metadata_mode, callback=content_loader.subtask(), toWait=toWait, toCache=False)
            taskID = task.task_id
            log.info('ZIP: Invoked task[%s]' % taskID)

            result['response']['task_id'] = taskID
            return result
        except Exception as e:
            log.error('wiki import Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_IMPORT_FROM_ZIP
            return ErrorCodes().asDict(c.errorCode, str(e))
