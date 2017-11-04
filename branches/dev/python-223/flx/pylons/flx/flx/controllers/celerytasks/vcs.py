from flx.controllers.celerytasks.generictask import GenericTask
from pylons.i18n.translation import _ 
from flx.lib.vcs.vcs import vcsCore
import logging

logger = logging.getLogger(__name__)

class VcsTask(GenericTask):
    #recordToDB = True
    core = vcsCore()
    funcs = [ core.add, core.commit, core.get, core.getSize, core.getHistory, core.getRevision, core.hasChanged, core.mkdir, core.makedirs, core.remove, core.revert, core.save ]

    commandNames = [ 'add', 'commit', 'get', 'getSize', 'getHistory', 'getRevision', 'hasChanged', 'mkdir', 'makedirs', 'remove', 'revert', 'save' ]

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        kwargs['init_db'] = False
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'vcs'
        self.pathPrefix = self.config['vcs_dir']
        if self.pathPrefix is None:
            self.pathPrefix = '/opt/data/bzr'
        self.tree = None

    def __del__(self):
        if self.tree is not None and self.tree.is_locked():
            self.tree.unlock()

    def getCommandName(self, command):
        """
            Returns the readable command name from the given command code.
        """
        return self.commandNames[command]

    def call(self, **kwargs):
        """
            Calls the function of the corresponding command.
        """
        command = kwargs['command']
        if self.tree is None:
            from bzrlib.workingtree import WorkingTree as wt

            self.tree = wt.open(self.pathPrefix)
            if self.tree is None:
                raise Exception((_(u'VCS unable to open working tree for[%(self.pathPrefix)]')  % {"self.pathPrefix":self.pathPrefix}).encode("utf-8"))

        kwargs['tree'] = self.tree
        kwargs['pathPrefix'] = self.pathPrefix
        self.core.cleanLock(self.tree)
        return self.funcs[command](**kwargs)

    def run(self, **kwargs):
        """
            Perform Version Control tasks.
        """
        GenericTask.run(self, **kwargs)
        command = kwargs['command']
        if not kwargs.has_key('contents'):
            a = kwargs
        else:
            #
            #  Too much to display contents.
            #
            import copy

            a = copy.copy(kwargs)
            del a['contents']
        logger.info('Performing VCS task %s[%s]' % (self.getCommandName(command), a))
        try:
            return self.call(**kwargs)
        except Exception, e:
            logger.error('Unable to perform VCS task %s[%s]' % (self.getCommandName(command), kwargs), exc_info=e)
            raise e
