import errno
import os
import logging
from pylons import config
from pylons.i18n.translation import _ 
from flx.lib import helpers as h

log = logging.getLogger(__name__)

class vcs:
    contentExtension = '.xhtml'

    ADD, COMMIT, GET, GET_SIZE, GET_HISTORY, GET_REVISION, HAS_CHANGED, MKDIR, MKDIRS, REMOVE, REVERT, SAVE = range(12)

    def __init__(self, memberID, pathPrefix=None, inPlace=False, session=None):
        """
            All files belonging to member with memberID will be located
            under the directory of memberID.

            if inPlace is True, everything will be performed in place;
            otherwise, the task to communicate with the VCS will be
            done by another thread, synchronously. This is for VCS that
            are not thread-safe so that only 1 thread will be dedicated
            to perform the task.
        """
        if pathPrefix is not None:
            self.pathPrefix = pathPrefix
        else:
            self.pathPrefix = config.get('vcs_dir')
            if self.pathPrefix is None:
                self.pathPrefix = '/opt/data/bzr'
        self.newFiles = []
        self.modFiles = []
        self.common = vcsCore()
        self.basedir = h.getBucketPath('', id=memberID)
        
        if inPlace:
            from bzrlib.workingtree import WorkingTree as wt

            self.tree = wt.open(self.pathPrefix)
            self.remoteTask = None
        else:
            from flx.controllers.celerytasks import vcs

            self.remoteTask = vcs.VcsTask()

        log.info('vcs __init__ memberID[%s]' % memberID)
        log.info('vcs __init__ basedir[%s]' % self.basedir)
        #
        #  Construct and create basedir if not yet there.
        #
        path = os.path.join(self.pathPrefix, self.basedir)
        if not os.path.exists(path):
            basedir = self.basedir
            self.basedir = ''
            self.makedirs(basedir,
                          commit=True,
                          message='Created directory[%s]' % basedir)
            self.basedir = basedir

    def _setFileExtension(self, path):
        if path.endswith(self.contentExtension):
            return path

        return path + self.contentExtension

    def _remoteTask(self, kwargs):
        """
            Sends the task to be done remotely.
        """
        from celery.task import Task

        task = self.remoteTask.apply_async(kwargs=kwargs)
        result = task.wait()
        task = Task.AsyncResult(task_id=task.task_id)
        return task, result

    def test(self, relPath):
        return h.getBucketPath(relPath, id=2)

    def save(self, relPath, contents=None, toInclude=True):
        """
            Save contents into the file specified in relPath.
        """
        log.info('vcs save relPath[%s]' % relPath)
        if contents is not None:
            path = os.path.join(self.basedir, relPath)
        else:
            #
            #  Contents uploaded, information in relPath.
            #
            src = relPath
            contents = h.getUploadedContents(src)
            path = os.path.join(self.basedir, src.filename.lstrip(os.sep))
        path = self._setFileExtension(path)

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.SAVE,
                                'path':path,
                                'contents':h.safe_decode(contents),
                            })
            if task.successful():
                if toInclude:
                    self.modFiles.append(path)
                return result
            raise Exception(task.traceback)

        try:
            result = self.common.save(tree=self.tree,
                                      pathPrefix=self.pathPrefix,
                                      path=path,
                                      contents='contents')
            if toInclude:
                self.modFiles.append(path)
            return result
        except Exception, e:
            log.error('vcs save exception[%s]' % e)
            raise e

    def add(self, relPath, contents=None):
        """
            Add a new file, optionally with contents.
        """
        log.info('vcs add basedir[%s] relPath[%s]' % (self.basedir, relPath))
        fileExists = self.exists(relPath)
        #    raise Exception((_(u'vcs: add file[%(relPath)s] already exists')  % {"relPath":relPath}).encode("utf-8"))

        result = None
        relPath = self._setFileExtension(relPath)
        if contents is not None:
            result = self.save(relPath, contents=contents, toInclude=False)

        if fileExists:
            log.warn('vcs add returning without add (file already exists: %s)' % (self.basedir + '/' + relPath))
            return result

        path = os.path.join(self.basedir, relPath)
        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.ADD,
                                'path':path,
                            })
            if task.successful():
                if path not in self.newFiles:
                    self.newFiles.append(path)
                return result
            raise Exception(task.traceback)

        try:
            result = self.common.add(tree=self.tree, path=path)
            self.newFiles.append(path)
            return result
        except Exception, e:
            log.error('vcs add exception[%s]' % e)
            raise e

    def exists(self, relPath):
        """
            Check if the file exists.
        """
        relPath = self._setFileExtension(relPath)
        bzrPath = os.path.join(self.pathPrefix, self.basedir, relPath)
        return os.path.exists(bzrPath)

    def get(self, relPath, revNo=None):
        """
            Get the contents of the given file, with the optional revision.
            If revision is not given, the latest will be used.
        """
        relPath = self._setFileExtension(relPath)
        if revNo is None:
            bzrPath = os.path.join(self.pathPrefix, self.basedir, relPath)
            try:
                file = open(bzrPath, 'r')
            except Exception:
                file = None
            if file is not None:
                try:
                    contents = file.read()
                    return contents
                finally:
                    file.close()

        path = os.path.join(self.basedir, relPath)
        log.info('vcs get path[%s] revNo[%s]' % (path, revNo))

        try:
            if self.remoteTask is not None:
                task, result = self._remoteTask(
                                kwargs={
                                    'command':self.GET,
                                    'path':path,
                                    'revNo':revNo,
                                })
                if task.successful():
                    return result
                raise Exception(task.traceback)

            return self.common.get(tree=self.tree, path=path, revNo=revNo)
        except Exception:
            return None

    def getSize(self, relPath, revNo=None):
        """
            Get the size of the given file with the optional revision.
            If revision is not given, the latest will be used.
        """
        relPath = self._setFileExtension(relPath)
        path = os.path.join(self.basedir, relPath)

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.GET_SIZE,
                                'path':path,
                                'revNo':revNo,
                            })
            if task.successful():
                return result
            raise Exception(task.traceback)

        return self.common.getSize(tree=self.tree, path=path, revNo=revNo)

    def getHistory(self, relPath, revNo=None):
        """
            Get the history of the given file with the optional revision.
            If revision is not given, the latest will be used.
        """
        relPath = self._setFileExtension(relPath)
        path = os.path.join(self.basedir, relPath)

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.GET_HISTORY,
                                'path':path,
                                'revNo':revNo,
                            })
            if task.successful():
                return result
            raise Exception(task.traceback)

        return self.common.getHistory(tree=self.tree, path=path, revNo=revNo)

    def getRevision(self, relPath):
        """
            Get the current revision info of the given file.
        """
        relPath = self._setFileExtension(relPath)
        path = os.path.join(self.basedir, relPath)

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.GET_REVISION,
                                'path':path,
                            })
            if task.successful():
                return result
            raise Exception(task.traceback)

        return self.common.getRevision(tree=self.tree, path=path)

    def hasChanged(self, relPath):
        """
            Return True if the given file has uncommitted changes.
        """
        if relPath is None:
            files = None
        else:
            relPath = self._setFileExtension(relPath)
            files = [ os.path.join(self.basedir, relPath) ]

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.HAS_CHANGED,
                                'files':files,
                            })
            if task.successful():
                return result
            raise Exception(task.traceback)

        return self.common.hasChanged(tree=self.tree, files=files)

    def commit(self, message):
        """
            Commit all the changes.
        """
        if len(self.newFiles) == 0 and len(self.modFiles) == 0:
            #
            #  Nothing to commit.
            #
            return None

        log.info('vcs commit new[%s] mod[%s] message[%s]' % (self.newFiles, self.modFiles, message))
        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.COMMIT,
                                'message':message,
                                'newFiles':self.newFiles,
                                'modFiles':self.modFiles,
                            })
            if task.successful():
                self.newFiles = []
                self.modFiles = []
                return result
            raise Exception(task.traceback)

        try:
            result = self.common.commit(tree=self.tree,
                                        newFiles=self.newFiles,
                                        modFiles=self.modFiles,
                                        message=message)
            self.newFiles = []
            self.modFiles = []
            return result
        except Exception, e:
            log.error('vcs commit exception[%s]' % e)
            raise e

    def mkdir(self, relPath, osPath=None):
        """
            Create the given directory.
        """
        path = os.path.join(self.basedir, relPath)
	if osPath is None:
            osPath = os.path.join(self.pathPrefix, path)

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.MKDIR,
                                'path':path,
                                'osPath':osPath,
                            })
            if task.successful():
                self.newFiles.append(path)
                return result
            raise Exception(task.traceback)

        try:
            result = self.common.mkdir(tree=self.tree, path=path, osPath=osPath)
            self.newFiles.append(path)
            return result
        except Exception, e:
            log.error('vcs mkdir exception[%s]' % e)
            raise e

    def makedirs(self, relPath, commit=False, message=None):
        """
            Add a new path with one or more non-existent directories.
        """
        relPath = os.path.dirname(relPath)
        path = os.path.join(self.basedir, relPath)

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.MKDIRS,
                                'path':path,
                            })
            if task.successful():
                files = result
                for file in files:
                    self.newFiles.append(file)
                if not commit:
                    return None
                return self.commit(message)
            raise Exception(task.traceback)

        try:
            result = self.common.makedirs(tree=self.tree,
                                          pathPrefix=self.pathPrefix,
                                          path=path)
            files = result
            for file in files:
                self.newFiles.append(file)
            if not commit:
                return None
            return self.commit(message)
        except Exception, e:
            log.error('vcs makedirs exception[%s]' % e)
            raise e

    def remove(self, relPath, isDir=False):
        """
            Remove the given directory or file.
        """
        if not isDir:
            relPath = self._setFileExtension(relPath)
        path = os.path.join(self.basedir, relPath)

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.REMOVE,
                                'path':path,
                            })
            if task.successful():
                self.modFiles.append(path)
                return result
            raise Exception(task.traceback)

        try:
            self.common.remove(tree=self.tree, path=path)
            self.modFiles.append(path)
            return None
        except Exception, e:
            log.error('vcs remove exception[%s]' % e)
            raise e

    def revert(self):
        """
            Forget all the uncommitted changes.
        """
        if len(self.newFiles) == 0 and len(self.modFiles) == 0:
            return None

        if self.remoteTask is not None:
            task, result = self._remoteTask(
                            kwargs={
                                'command':self.REVERT,
                                'newFiles':self.newFiles,
                                'modFiles':self.modFiles,
                            })
            if task.successful():
                self.newFiles = []
                self.modFiles = []
                return result
            raise Exception(task.traceback)

        try:
            self.common.revert(tree=self.tree,
                               newFiles=self.newFiles,
                               modFiles=self.modFiles)
            self.newFiles = []
            self.modFiles = []
            return None
        except Exception, e:
            log.error('vcs revert exception[%s]' % e)
            raise e

class vcsCore:
    """
        The core that interface with the Version Control System.
    """

    def __init__(self):
        from bzrlib import plugin as p

        p.load_plugins()
        log.debug('vcsCore plugins[%s]' % p.plugins())

    def _getFileID(self, tree, path, revNo):
        """
            Get the Bazaar file identifier for the given file and revision.
        """
        if revNo is None:
            revTree = tree
        else:
            branch = tree.branch
            repository = branch.repository
            revNo = int(revNo)
            revID = branch.get_rev_id(revNo)
            revTree = repository.revision_tree(revID)

        return revTree, revTree.path2id(path)

    def _bind(self, tree):
        """
            Bind to the server, if it has been unbound before.
        """
        branch = tree.branch
        boundLocation = branch.get_old_bound_location()
        if boundLocation is not None:
            branch.set_bound_location(boundLocation)

    def _unbind(self, tree):
        """
            Unbind from the server, if it is bound.
        """
        branch = tree.branch
        boundLocation = branch.get_bound_location()
        if boundLocation is not None:
            return branch.set_bound_location(None)

    def cleanLock(self, tree):
        #
        #  Clean leftover lock, if any.
        #
        log.info('vcsCore cleanLock')
        lockDir = tree._control_files._lock
        info = lockDir.peek()
        if info is not None:
            log.info('vcsCore cleanLock leftover lock[%s]' % info)
            #
            #  Cleanup.
            #
            pid = int(info.get('pid'))
            if pid == os.getpid():
                #
                #  Cleanup my own lock.
                #
                try:
                    tree.unlock()
                    log.info('vcsCore cleanLock lock cleaned')
                except Exception, e:
                    log.exception('vcsCore cleanLock unable to clean leftover lock[%s]' % e)
            else:
                #
                #  See if process is still alive.
                #
                try:
                    os.kill(pid, 0)
                except OSError, ose:
                    if ose.errno == errno.ESRCH:
                        #
                        #  Cleanup dead process' leftover.
                        #
                        try:
                            lockDir.force_break(info)
                            tree.branch.break_lock()
                            log.info('vcsCore cleanLock leftover lock cleaned')
                        except Exception, e:
                            log.exception('vcsCore unable to clean leftover lock[%s]' % e)

    def save(self, **kwargs):
        """
            Save a file.
        """
        tree = kwargs['tree']
        pathPrefix = kwargs['pathPrefix']
        path = kwargs['path']
        contents = kwargs['contents']
        log.info('vcsCore save path[%s]' % path)

        bzrPath = os.path.join(pathPrefix, path)
        h.saveContents(bzrPath, contents)
        return tree.branch.last_revision_info()[0]

    def add(self, **kwargs):
        """
            Add a new file.
        """
        tree = kwargs['tree']
        path = kwargs['path']
        log.info('vcsCore add path[%s]' % path)

        try:
            tree.add(path)
        except Exception, e:
            log.exception('vcsCore unable to add path[%s]: %s' % (path, e))
            try:
                tree.remove(path)
            except Exception:
                pass
            raise e

        return tree.branch.last_revision_info()[0]

    def commit(self, **kwargs):
        """
            Commit all the changes.
        """
        tree = kwargs['tree']
        newFiles = kwargs['newFiles']
        modFiles = kwargs['modFiles']
        files = newFiles + modFiles
        message = kwargs['message']
        log.info('vcsCore commit files[%s] message[%s]' % (files, message))

        #self.bind(tree)
        try:
            tree.commit(message=message,
                        specific_files=files,
                        recursive='down')
            return tree.branch.last_revision_info()[0]
        except Exception, e:
            self.revert(**kwargs)
            log.exception('vcsCore commit[%s]' % e)
            raise e
        #finally:
        #    self.unbind(tree)

    def get(self, **kwargs):
        """
            Get the contents of the given file, with the optional revision.
            If revision is not given, the latest will be used.
        """
        tree = kwargs['tree']
        path = kwargs['path']
        revNo = kwargs['revNo']
        revTree, fid = self._getFileID(tree, path, revNo)

        tree.lock_read()
        try:
            return revTree.get_file_text(fid)
        finally:
            tree.unlock()

    def getSize(self, **kwargs):
        """
            Get the size of the given file with the optional revision.
            If revision is not given, the latest will be used.
        """
        tree = kwargs['tree']
        path = kwargs['path']
        revNo = kwargs['revNo']
        revTree, fid = self._getFileID(tree, path, revNo)

        tree.lock_read()
        try:
            return revTree.get_file_size(fid)
        finally:
            tree.unlock()

    def getHistory(self, **kwargs):
        """
            Get the history of the given file with the optional revision.
            If revision is not given, the latest will be used.
        """
        tree = kwargs['tree']
        path = kwargs['path']
        revNo = kwargs['revNo']
        revTree, fid = self._getFileID(tree, path, revNo)

        from StringIO import StringIO
        from bzrlib import log

        sio = StringIO()
        lf = log.LongLogFormatter(sio)
        log.show_log(tree.branch, lf, specific_fileid=fid, verbose=True)
        sio.seek(0)
        info = sio.read().split('\n')
        sio.close()
        historyList = []
        for item in info:
            if len(item) == 0:
                continue
            if item[0] == '-':
                historyItem = []
                historyList.append(historyItem)
                continue
            historyItem.append(item)
        return historyList

    def getRevision(self, **kwargs):
        """
            Get the current revision info of the given file.
        """
        tree = kwargs['tree']
        #path = kwargs['path']

        revision = tree.last_revision()
        log.info('vcsCore getRevision  revision[%s]' % revision)
        return revision

    def hasChanged(self, **kwargs):
        """
            Return True if the given file has uncommitted changes.
        """
        tree = kwargs['tree']
        files = kwargs['files']

        old = tree.basis_tree()
        old.lock_read()
        tree.lock_read()
        try:
            delta = tree.changes_from(old, specific_files=files)
            modified = delta.modified
            if modified is None:
                return False
            return len(modified) > 0
        finally:
            old.unlock()
            tree.unlock()

    def mkdir(self, **kwargs):
        """
            Create the given directory.
        """
        tree = kwargs['tree']
        path = kwargs['path']
	osPath = kwargs['osPath']
        log.info('vcsCore mkdir path[%s] osPath[%s]' % (path, osPath))

	if not os.path.exists(osPath):
	    tree.mkdir(path)
        return None

    def makedirs(self, **kwargs):
        """
            Add a new path with one or more non-existent directories.
        """
        tree = kwargs['tree']
        path = kwargs['path']
        pathPrefix = kwargs['pathPrefix']
        osPath = os.path.join(pathPrefix, path)
        log.info('vcsCore makedirs path[%s] osPath[%s]' % (path, osPath))

        files = []
        dirPath = ''
        dirList = path.split(os.path.sep)
        for dir in dirList:
            dirPath = os.path.join(dirPath, dir)
            bzrPath = os.path.join(pathPrefix, dirPath)
            if not os.path.exists(bzrPath):
                self.mkdir(tree=tree, path=dirPath, osPath=bzrPath)
                files.append(dirPath)

        return files

    def remove(self, **kwargs):
        """
            Remove the given directory or file.
        """
        tree = kwargs['tree']
        path = kwargs['path']
        log.info('vcsCore remove path[%s]' % path)

        tree.remove(path, keep_files=False, force=True)
        return None

    def revert(self, **kwargs):
        """
            Forget all the uncommitted changes.
        """
        tree = kwargs['tree']
        newFiles = kwargs['newFiles']
        modFiles = kwargs['modFiles']
        files = newFiles + modFiles
        log.info('vcsCore revert files[%s]' % files)

        #self.bind(tree)
        tree.lock_write()
        try:
            tree.revert(filenames=files, backups=False)
            for file in newFiles:
                tree.remove(file, keep_files=False, force=True)
            return None
        finally:
            tree.unlock()
            #self.unbind(tree)
