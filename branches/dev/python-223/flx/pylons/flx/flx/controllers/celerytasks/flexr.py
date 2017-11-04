import logging
from celery.task.sets import subtask
from pylons.i18n.translation import _ 
import traceback
import json
import os
import shutil
import time
from datetime import datetime

from flx.controllers.celerytasks.generictask import GenericTask
from flx.model import api, model
from flx.lib.processwithtimeout import ProcessWithTimeout

log = logging.getLogger(__name__)

MIGRATED_BOOK_LABEL = 'Migrated'

class Import1xBooks(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "migrator"
        self.flexrUtil = None

    def _call(self, durl, timeout=30, method='GET', params=None, toJson=False):
        """
            Make call to the api
        """
        from urllib2 import build_opener, HTTPCookieProcessor

        durl = durl.encode('utf-8')
        log.info("Calling remote url[%s]" % durl)
        opener = build_opener()
        opener.addheaders = [('Accept', 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')]
        start_time = datetime.today()

        postBody = None
        if params:
            from urllib import urlencode

            if method == 'GET':
                durl += '?%s' % urlencode(params)
            else:
                if toJson:
                    postBody = json.dumps(params)
                else:
                    postBody = urlencode(params)
                postBody = postBody.encode('utf-8')

        u = opener.open(durl, postBody, timeout)
        try:
            data = u.read()
        finally:
            u.close()

        end_time = datetime.today()
        delta = end_time - start_time
        log.info("[%s.%s seconds] %s  " % (delta.seconds, delta.microseconds , durl))
        return data

    def getFlexrUtil(self):
        if self.flexrUtil is None:
            from flx.model.get1xinfo import FlexrUtil
            from pylons import config

            self.flexrUtil = FlexrUtil(self.config.get('url_1x_db'))

        return self.flexrUtil

    def run(self, memberID, **kwargs):
        successful = False
        exc = None
        bookList = []
        try:
            GenericTask.run(self, **kwargs)
            fbm = api.getFrom1xBookMember(memberID=memberID)
            #
            #  Start the migration process.
            #
            flexrUtil = self.getFlexrUtil()
            url1xrest = self.config.get('url_1x_rest')

            from urllib import quote

            taskdata = { 'memberID': memberID }
            title = 'Flexbook of Standalone Chapters'
            checkChapterWrapper = '%s?method=flexbook.isflexbooktitlepresent&title=%s&userid=%d&fid=null' % (url1xrest, quote(title), fbm.memberID1x)
            data = self._call(checkChapterWrapper)
            checkResult = json.loads(data)
            isDuplicate = checkResult.get('isduplicate')
            if not isDuplicate:

                #
                #  Request to assemble the book that wraps all standalone chapters.
                #
                now = datetime.now()
                s = int(time.mktime(now.timetuple()) *1000)
                chapterWrapper = '%s?method=flexbook.save&_d=%d' % (url1xrest, s)
                log.info('import1xBooks: chapterWrapper[%s]' % chapterWrapper)
                chapters = flexrUtil.getChapterInfo(id=fbm.memberID1x)
                if len(chapters) > 0:
                    chapterList = []
                    for chapter in chapters:
                        chapterTitle = chapter['chapter_title']
                        chapterList.append({
                            'id': chapter['chapter_id'],
                            'title': chapterTitle,
                            'originalTitle': chapterTitle,
                        })
                    log.info('import1xBooks: chapterList[%s]' % chapterList)
                    params = {
                        'userid': fbm.memberID1x,
                        'flexbook': {
                            'flexbook_id': None,
                            'flexbook_title': title,
                            'flexbook_desc': title,
                            'keywords': '',
                            'flexbook_published': False,
                            'categories': [],
                            'certifications': [],
                            'parameters': [],
                            'attributions': [],
                            'chapterlist': chapterList,
                            'front_matter': [],
                            'flexbook_license': 'CC-by-NC-SA',
                            'flexbook_grade': '',
                            'flexbook_difficulty': '',
                            'flexbook_state': '',
                        }
                    }
                    wrapperResult = self._call(chapterWrapper, method='POST', params=params, toJson=True)
                    log.info('import1xBooks: chapterWrapper result[%s]' % wrapperResult)
            #
            #  Import books from 1.x.
            #
            import errno

            tmpDir = self.config.get('tmp_1x_dir', '/tmp/export-1x-books')
            try:
                os.makedirs(tmpDir)
            except OSError, e:
                if e.errno != errno.EEXIST:
                    raise e

            url1xfb = self.config.get('url_1x_fb')
            books = flexrUtil.getBookInfo(id=fbm.memberID1x)
            log.info('import1xBooks: books[%s] for 1x[%s]' % (books, fbm.memberID1x))
            taskdata['books'] = {}
            for book in books:
                taskdata['books'][book['flexbook_id']] = { 'status': 'PENDING' }
            self.userdata = json.dumps(taskdata)
            self.updateTask()
            successful = True
            for book in books:
                sourceDir = None
                contentDir = None
                path = None
                try:
                    fid = book['flexbook_id']

                    taskdata['books'][fid] = { 'status': 'IN PROGRESS' }
                    self.userdata = json.dumps(taskdata)
                    self.updateTask()

                    log.info('import1xBooks: book[%s]' % book)
                    fb = api.getFrom1xBook(fid=fid)
                    if fb is None or fb.artifactID is None:
                        #
                        #  Export book from 1.x.
                        #
                        path = os.path.join(tmpDir, '%s.zip' % fid)
                        if os.path.exists(path):
                            os.remove(path)

                        log.info('import1xBooks: path[%s] for 1x[%d]' % (path, fbm.memberID1x))

                        bookUrl ='%s?fid=%d&images=true' % (url1xfb, fid)
                        cmd = ['wget', '--output-document=%s' % path, bookUrl]
                        proc = ProcessWithTimeout(cmd=cmd, log=log)
                        ret = proc.start(timeout=1800)
                        log.info('import1xbooks: wget ret[%s] out[%s] err[%s]' % (ret, proc.output, proc.error))
                        #
                        #  Extract and process zip file.
                        #
                        import shutil
                        from zipfile import ZipFile
                        from flx.controllers import importcommon as com

                        sourceDir = com.create_working_location()
                        log.info('import1xBooks: sourceDir[%s]' % sourceDir)
                        zf = ZipFile(path)
                        try:
                            ZipFile.extractall(zf, sourceDir)
                        finally:
                            zf.close()
                        contentDir = com.create_working_location()
                        log.info('import1xBooks: contentDir[%s]' % contentDir)
                        com.transform_1x_to_2x(sourceDir, contentDir)
                        #
                        #  Import book.
                        #
                        from flx.lib.wiki_importer_lib.wiki_importer import WikiImporter as Importer

                        importer = Importer()
                        importer.process_images(contentDir, memberID)
                        artifactID = importer.process_and_import_content(contentDir, memberID, 'section', None, False, False)
                        log.info('import1xBooks: migrating path[%s] for member[%d] artifactID[%s]' % (path, memberID, artifactID))
                        #
                        #  Add to library.
                        #
                        artifact = api.getArtifactByID(id=artifactID)
                        api.safeAddObjectToLibrary(objectID=artifact.revisions[0].id, objectType='artifactRevision', memberID=memberID)
                        api.assignLabelsToMemberLibraryObject(objectID=artifact.revisions[0].id, objectType='artifactRevision', memberID=memberID, labels=[MIGRATED_BOOK_LABEL], systemLabels=False)

                        #
                        #  Associate 1.x chapters to those of 2.0.
                        #
                        chapters = flexrUtil.getBookChapterList(fid=fid)
                        children = api.getArtifactChildren(artifactID)
                        for n in range(0, min(len(chapters), len(children))):
                            cid = chapters[n]['chapter_id']
                            r = api.getUnique(what=model.From1xChapter, term='cid', value=cid)
                            if r is None:
                                kwargs = {
                                    'cid' : cid,
                                    'memberID': memberID,
                                    'artifactID': children[n]['childID'],
                                }
                                log.info('import1xBooks: associating 1x chapter[%s] to artifact[%s]' % (cid, kwargs['artifactID']))
                                c = api.create(what=model.From1xChapter, **kwargs)
                        #
                        #  Update database indicating the migragion is
                        #  done on this book.
                        #
                        fb = api.getFrom1xBook(fid=fid)
                        if fb:
                            fb.artifactID = artifactID
                            api.update(fb)
                            fbDict = fb.asDict()
                        else:
                            kwargs = {
                                'fid': fid,
                                'memberID': memberID,
                                'artifactID': artifactID,
                            }
                            fb = api.create(what=model.From1xBook, **kwargs)
                            fbDict = kwargs
                        del fbDict['memberID']
                        bookList.append(fbDict)
                        taskdata['books'][fid] = { 'status': 'SUCCESS' }
                    else:
                        log.info("import1xBooks: Already imported! Skipping.")
                        taskdata['books'][fid] = { 'status': 'SKIPPED' }

                    self.userdata = json.dumps(taskdata)
                    self.updateTask()
                except Exception as be:
                    successful = False
                    exc = be
                    log.error('Error importing book %s: taskID: %s, [%s]' % (fid, self.taskID, str(be)), exc_info=be)
                    taskdata['books'][fid] = {
                        'status': 'FAILED',
                        'msg': str(be),
                    }
                    self.userdata = json.dumps(taskdata)
                    self.updateTask()
                finally:
                    #
                    #  Cleanup.
                    #
                    if sourceDir:
                        try:
                            #
                            #  Remove sourceDir.
                            #
                            shutil.rmtree(sourceDir)
                        except Exception, e:
                            log.info('import1xBooks: Unable to remove [%s] %s' % (sourceDir, e))
                    if contentDir:
                        try:
                            #
                            #  Remove contentDir.
                            #
                            shutil.rmtree(contentDir)
                        except Exception, e:
                            log.info('import1xBooks: Unable to remove [%s] %s' % (contentDir, e))
                    if path:
                        try:
                            #
                            #  Remove path.
                            #
                            os.remove(path)
                        except Exception, e:
                            log.info('import1xBooks: Unable to remove [%s] %s' % (path, e))
        except Exception, ex:
            successful = False
            exc = ex
            log.error('Error importing taskID: %s, [%s]' % (self.taskID, str(ex)), exc_info=ex)

        #
        #  Migration is done. Update status accordingly.
        #
        fbm = api.getFrom1xBookMember(memberID=memberID)
        if successful:
            fbm.migrated = datetime.now()
            fbm.status = 'Done'
        else:
            fbm.status = 'Failed'
        api.update(instance=fbm)
        if exc:
            raise exc
        return json.dumps(bookList)

    @classmethod
    def cleanupTask(cls, taskID):
        try:
            task = api.getTaskByTaskID(taskID=taskID)
            if not task:
                raise Exception((_(u"No such task for id: %(taskID)s")  % {"taskID":taskID}).encode("utf-8"))
            if task.status == model.TASK_STATUS_FAILURE and task.userdata:
                j = json.loads(task.userdata)
                memberID = j.get('memberID')
                if not memberID:
                    raise Exception((_(u'No member id in userdata for task: %(taskID)s')  % {"taskID":taskID}).encode("utf-8"))
                bm = api.getFrom1xBookMembersByMemberID(memberID=memberID)
                if bm:
                    kwargs = {
                            'memberID': memberID,
                            'status': 'Failed',
                            }
                    bm = api.updateFrom1xBookMembers(**kwargs)
                    log.info("Updated status for member: %d to Failed." % memberID)
                else:
                    raise Exception((_(u"No such From1xBookMembers row for memberID: %(memberID)d")  % {"memberID":memberID}).encode("utf-8"))
        except Exception, e:
            log.error("Error in cleanupTask: %s" % str(e), exc_info=e)

