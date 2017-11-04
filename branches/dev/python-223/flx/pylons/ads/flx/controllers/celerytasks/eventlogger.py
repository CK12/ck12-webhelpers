from __future__ import with_statement
import os, sys, stat, logging, re, time, threading, datetime, atexit, fcntl, subprocess, shutil
from logging.handlers import TimedRotatingFileHandler
from flx.model.model import EventGroup

_logger = logging.getLogger(__name__)

_ROLLOVER_CHECK = 30  # seconds 
_ROLLOVER_WAIT  = 2   # seconds 

_SECS_IN_MINUTE = 60

_CR = len(os.linesep) - 1

_writers = {}

_timer = None

def _startTimer():
    global _timer
    try:
        _timer = threading.Timer(_ROLLOVER_CHECK, _doRollover)
        _timer.setDaemon(True)
        # Disable meaningless error to stderr during interpret shutdown
        # (see threading.__bootstrap() and threading.__bootstrap_inner() 
        _timer._Thread__stderr=None
        _timer.start()
    except Exception, e:
        _logger.error('Failed to start timer: %s', str(e))
    
def _stopTimer():
    for t in threading.enumerate():
        if type(t) == threading._Timer: t.cancel()

def _checkTimer():
    for t in threading.enumerate():
        if type(t) == threading._Timer: return
    _startTimer()
        
def _doRollover():
    for wr in _writers.itervalues():
        with wr.lock:  # blocking
            try:
                if wr.handler.shouldRollover(None) and os.stat(wr.handler.baseFilename).st_size:
                    wr.handler.doRollover()
            except Exception, e:
                _logger.error('Failed to roll over: file=%s, e=%s', wr.logFile, str(e))
    _startTimer()

def getWriter(logDir, logFile, logInterval):
    global _writers
    _checkTimer()
    key = '%s:%s' % (logDir, logFile)
    wr = _writers.get(key)
    if wr:
        assert wr.handler.interval == logInterval * _SECS_IN_MINUTE, 'Inconsistent log interval'
        return wr
    else:
        wr = EventWriter(logDir, logFile, logInterval)
        _writers[key] = wr
        return wr

class EventWriter(object):
    TIME_DIM_VALUE = '::time::dim::value::'  # pattern to be replaced with time dimension value
    def __init__(self, logDir, logFile, logInterval):
        """Creates a writer.

        The log file name is suffixed with the process ID to avoid write contention from
        multiple processes.
        
        Arguments:
        logDir      -- log file directory
        logFile     -- log file name
        logInterval -- file rotation period in minutes
        """
        if not os.path.isdir(logDir):
            os.mkdir(logDir)

        self.logFile = os.path.normpath(os.path.join(logDir, '%s.%s' % (logFile, os.getpid())))
        self.mylogger = logging.Logger('__EventWriter__', logging.INFO)
        if not self.mylogger.handlers:
            self.handler = TimedRotatingFileHandler(self.logFile, when='m', interval=logInterval, encoding='utf8')       
            self.handler.setFormatter(logging.Formatter('%(message)s'))
            self.mylogger.addHandler(self.handler)
        self.lock = threading.Lock()

    def log(self, record):
        """Writes event data as tab-delimited record to a data file.
        
        The time is plugged in as first dimension. The data file is rolled over to new data
        file per specified log interval.
        
        Arguments:
        record -- list of values in the order consistent with `EventGroup`.`getColumnList()`
        """
        if not self.lock.acquire(0):  # non-blocking
            time.sleep(_ROLLOVER_WAIT)
        try:
            values = []
            for data in record:
                if data == True: 
                    values.append('1')
                elif data == False:
                    values.append('0')
                elif data == None:
                    values.append('\\N')
                elif data == self.TIME_DIM_VALUE:
                    # Plug in time dimension value
                    values.append(str(_time_dim.get(datetime.date.today())) or '\\N')
                else:
                    values.append(str(data).replace('\t', ' ').replace('\\', '\\\\'))
            self.mylogger.info('\t'.join(values))
        except Exception, e:
            _logger.error('Failed to log event: file=%s, e=%s, data=%s', self.logFile, str(e), str(record))
        try:
            self.lock.release()
        except Exception, e:
            _logger.warning('No lock held: file=%s, e=%s, data=%s', self.logFile, str(e), str(record))
        
class EventReader(object):
    def __init__(self, logDir):
        """Creates a reader.

        The reader allows for iterating through data files ready to be imported.
        
        Arguments:
        logDir  -- log file directory
        """
        self._logDir = logDir
        self._prefix = re.compile('\w+\.\d+\..*')
        self._orphan = re.compile('\w+\.\d+$')
        self._filepath = None
        self._fileobj = None

    def __iter__(self):
        """Required to be an iterator."""
        return self
    
    def __del__(self):
        if self._fileobj:
            self._fileobj.flush()
            self._unlockFile(self._fileobj)
            self._fileobj.close()
    
    def next(self):
        """Iterates through data files ready to be imported.

        The iteration is done in chronological order. File being visited is locked
        so multiple reader iterators can run concurrently. This method returns next
        "unread" data file or None if no more unread data file can be found. Once
        iterated, a data log file is marked as read-only.
        """
        if self._fileobj:
            # Release lock on previous data file. Also mark it as read-only.
            os.chmod(self._filepath, stat.S_IRUSR)
            self._unlockFile(self._fileobj)
            self._fileobj.close()
            self._fileobj = None
            try:
                shutil.move(os.path.normpath(os.path.join(self._logDir, self._filepath)),
                            os.path.normpath(os.path.join(self._logDir, 'loaded')))
            except:
                pass
    
        if self._openFile():
            return self._filepath
        else:
            raise StopIteration()  # no more data file

    def _openFile(self):
        """Looks for the oldest unread data file.
        
        This method returns True if a data file is successful opened and locked,
        else returns False.
        """ 
        # Collect orphan data files (those did not get a chance to roll over before
        # the worker processes died)
        for f in os.listdir(os.path.normpath(self._logDir)):
            if self._orphan.match(f):
                try:
                    pid = f.rsplit('.', 1)[-1]
                    if not self._ps(pid):
                        suffix = datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d_%H-%M-%S')
                        os.rename(os.path.normpath(os.path.join(self._logDir, f)),
                                  os.path.normpath(os.path.join(self._logDir, f + '.' + suffix)))
                        _logger.info('Garbage-collected orphan data file: %s', f)
                except Exception, e:
                    _logger.warning('Cannot garbage-collect orphan data file: %s, e=%s', f, str(e))
        
        logs = []
        for f in os.listdir(os.path.normpath(self._logDir)):
            if self._prefix.match(f): logs.append(f)
        logs.sort()
        for f in logs:
            filepath = os.path.normpath(os.path.join(self._logDir, f))
            try:
                fileobj = open(filepath, 'r+')
            except IOError, e:
                continue
            if self._lockFile(fileobj):
                if os.stat(filepath).st_mode & stat.S_IWUSR:  # skip read-only files 
                    self._filepath = filepath
                    self._fileobj = fileobj
                    return True
            fileobj.close()
        return False
        
    def _lockFile(self, fileobj):
        """Locks a data file.

        Place an exclusive advisory lock on a opened data file. Return True if
        the data file is successfully locked, else return False.
        
        Note: This call only works for Linux platform.
        """
        assert sys.platform == 'linux2'
        try:
            fcntl.lockf(fileobj, fcntl.LOCK_EX | fcntl.LOCK_NB, 1, 0, os.SEEK_SET)
        except IOError:
            return False
        return True

    def _unlockFile(self, fileobj):
        """Unlocks a locked data file.

        Note: This call only works for Linux platform.
        """
        assert sys.platform == 'linux2'
        fcntl.lockf(fileobj, fcntl.LOCK_UN, 1, 0, os.SEEK_SET)
    
    def _ps(self, pid):
        """Checks if a process is running.
        
        Return True if a process with the given pid is running, else False.
        
        Note: This call only works for linux platform.
        """
        assert sys.platform == 'linux2'
        return pid in os.listdir('/proc')
    
class EventLoader(object):
    def __init__(self, dbSession, dbHost, dbPort, dbUser, dbPassword, db, logDir):
        """Creates a event loader.
        
        The event loader is used to bulk import event data files into database.
        
        Arguments:
        dbSession  -- database session used to query event meta data
        dbHost     -- database host name
        dbPort     -- database port
        dbUser     -- database user name
        dbPassword -- database user password
        db         -- database schema
        logDir     -- event data directory
        """
        self.dbSession = dbSession
        self.dbHost = dbHost
        self.dbPort = dbPort
        self.dbUser = dbUser
        self.dbPassword = dbPassword
        self.db = db
        self.logDir = logDir
        
    def run(self):
        """Loads event data files."""
        for r in EventReader(self.logDir):
            self.loadDataFile(r)
    
    def loadDataFile(self, logFileName):
        """Load a data file into database.
        
        Using MySQL's mysqlimport command (i.e. "LOAD DATA INFILE") to load the data file.
        This is much faster than row-by-row loading but data error cannot be identified precisely.
        
        The target table is determined from the `logFileName` argument.
        """
        _logger.debug('Loading %s', logFileName)

        try:
            counter = 0
            
            gn = EventGroup.getEventGroupName(os.path.basename(logFileName).split('.', 1)[0])
            group = self.dbSession.query(EventGroup).filter(EventGroup.name == gn).one()
            columns = group.getColumnList()

            OPTIONS = '--host=%s --port=%s --user=%s --password=%s -L -C --low-priority --default-character-set=utf8 -f -c %s %s %s'
            args = OPTIONS % (self.dbHost, self.dbPort, self.dbUser, self.dbPassword, ','.join(columns), self.db, logFileName) 
            args = ['/usr/bin/mysqlimport'] + args.split()
            p = subprocess.Popen(args=args, env=os.environ, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            _logger.debug('Errors from loading %s: %s', logFileName, p.stderr.read())
            result = p.stdout.read()
            if not result:
                ex = Exception('Missing output from mysqlimport')
                _logger.error('Loading %s: %s', logFileName, str(ex))
                raise Exception('Missing output from mysqlimport')
            _logger.debug('Loading %s: %s', logFileName, result)
                    
            resultRe = re.compile('Records: (\d*)  Deleted: (\d*)  Skipped: (\d*)  Warnings: (\d*)')
            records, deleted, skipped, warnings = [int(d) for d in resultRe.search(result).groups()]
            counter += records
            if deleted or skipped or warnings:
                # Loading went through but MySQL complained about some records. Log the complaints.
                _logger.warn('Warnings from loading %s: %s\n', logFileName, result)
            _logger.info('Loading %s: %s events loaded', logFileName, counter)
        except Exception, e:
            _logger.error('Failed to load %s: %s', (logFileName, str(e)))

def _cacheTimeDimension(session):
    if _time_dim:
        return
    with _time_dim_lock:
        if _time_dim:
            return 
        try:
            for r in session.execute('SELECT dateID, DATE(`date`) FROM D_time').fetchall():
                _time_dim[r[1]] = r[0]
        except Exception, e:
            _logger.error('Failed to cache time dimension: %s', str(e))

_time_dim_lock = threading.Lock()
_time_dim = {}
            
atexit.register(_stopTimer)
_startTimer()


