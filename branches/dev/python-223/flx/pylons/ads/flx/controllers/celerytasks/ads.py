import re, logging, os
from datetime import date, timedelta
from flx.model.model import Hierarchy, EventGroup
from flx.engine.repository import updateBridge, createAggregate, aggregate
from flx.controllers.celerytasks.generictask import GenericTask
from flx.controllers.celerytasks.eventlogger import getWriter, EventLoader, _cacheTimeDimension

logger = logging.getLogger(__name__)

def _synchronized(name):
    """Decorator to synchronize execution of scheduled job.
    
    Arguments:
    name    -- lock name
    session -- database session
    """
    def _synchronized_impl(func):
        def _get_lock(self, *args, **kw):
            locked = self.dbsession.execute('SELECT GET_LOCK("%s", 1)' % name).fetchone()[0]
            logger.debug('Lock `%s` get result: %s', name, locked)
            if not locked:
                logger.warn('Task `%s` is already running', name)
                return

            try:
                return func(self, *args, **kw)
            finally:
                released = self.dbsession.execute('SELECT RELEASE_LOCK("%s")' % name).fetchone()[0]
                logger.debug('Lock `%s` release result: %s', name, released)
        _get_lock.__name__ = func.__name__
        _get_lock.__doc__ = func.__doc__
        _get_lock.__dict__ = func.__dict__
        return _get_lock
    return _synchronized_impl

class runAggregation(GenericTask):
    def run(self, frequency, **kwargs):
        """Runs daily aggregation.
        
        Arguments:
        frequency -- `d`, `w`, `m`, or `y`
        """
        if frequency == 'd':
            fromDate = date.today() - timedelta(days=1)
            toDate = date.today() - timedelta(days=1)
        elif frequency == 'w':
            fromDate = date.today() - timedelta(days=7)
            toDate = date.today() - timedelta(days=1)
        elif frequency == 'm':
            d = date.today()
            if d.day != 1:
                # Celery scheduler does not support monthly job, so the job is scheduled
                # daily instead. Do not execute aggregation unless today is first day of
                # the month.
                return 
            year, month = d.year, d.month - 1
            if month == 0:
                month = 12
                year -= 1 
            fromDate = date(year=year, month=month, day=1)
            toDate = date(year=d.year, month=d.month, day=1) - timedelta(days=1)
        elif frequency == 'y':
            d = date.today()
            if d.month != 1 or d.day != 1:
                # Celery scheduler does not support yearly job, so the job is scheduled
                # daily instead. Do not execute aggregation unless today is first day of
                # the year.
                return 
            fromDate = date(year=d.year-1, month=1, day=1)
            toDate = date(year=d.year-1, month=12, day=31)
        
        for eg in self.dbsession.query(EventGroup).filter(EventGroup.aggregate == frequency):
            createAggregate(eg, self.dbsession)
            aggregate(eg, self.dbsession, fromDate, toDate)

class runDailyAggregation(runAggregation):
    @_synchronized('runDailyAggregation')
    def run(self, **kwargs):
        """Runs daily aggregation."""
        super(runDailyAggregation, self).run('d', **kwargs)
        
class runWeeklyAggregation(runAggregation):
    @_synchronized('runWeeklyAggregation')
    def run(self, **kwargs):
        """Runs weekly aggregation."""
        super(runWeeklyAggregation, self).run('w', **kwargs)
        
class runMonthlyAggregation(runAggregation):
    @_synchronized('runMonthlyAggregation')
    def run(self, **kwargs):
        """Runs monthly aggregation."""
        super(runMonthlyAggregation, self).run('m', **kwargs)

class runYearlyAggregation(runAggregation):
    @_synchronized('runYearlyAggregation')
    def run(self, **kwargs):
        """Runs yearly aggregation."""
        super(runYearlyAggregation, self).run('y', **kwargs)

class updateBridgeTables(GenericTask):
    @_synchronized('updateBridgeTables')
    def run(self, **kwargs):
        """Updates all bridge tables of ragged dimensions"""
        for hierarchy in self.dbsession.query(Hierarchy).filter(Hierarchy.ragged == True):
            updateBridge(hierarchy.dimension, self.dbsession)

class logEvent(GenericTask):
    def __init__(self, **kwargs):
        """Caches time dimension after the task is initialized."""
        super(self.__class__, self).__init__(**kwargs)
        _cacheTimeDimension(self.dbsession)
        
    def run(self, table, record, **kwargs):
        """Writes an interactive event to its corresponding data file.
    
        The data file will be loaded by scheduled tasks into database.
        
        Arguments:
        table  -- table name
        record -- [event value, ..., dimension value, ..., attribute value, ...]
        """
        writer = getWriter(os.path.normpath(os.path.join(self.config['data_dir'],'events')), table, 3)  # roll over every three minute
        writer.log(record)

class importEvents(GenericTask):
    def run(self, **kwargs):
        """Imports event data files to database"""
        try:
            m = re.match('mysql://(?P<user>.*):(?P<password>.*)@(?P<host>.*):(?P<port>.*)/(?P<db>.*)\?',
                         self.config['sqlalchemy.url'])
            loader = EventLoader(self.dbsession,
                                 m.group('host'),
                                 m.group('port'),
                                 m.group('user'),
                                 m.group('password'),
                                 m.group('db'),
                                 os.path.normpath(os.path.join(self.config['data_dir'], 'events')))
            loader.run()
        except Exception, e:
            logger.error('Failed to import events: %s', str(e))

class computeTimeSpent(GenericTask):
    @_synchronized('computeTimeSpent')
    def run(self, **kwargs):
        """Computes time spent on artifacts.
        
        We look at F_fbs_visited (database table for `fbs_visit` event) and extract the time differences
        between users' consecutive visits. There was an attempt to use onbeforeunload event to fire ADS
        `fbs_time_spent` event, but outbeforeunload is not reliable due to the race condition of page unload.
        """
        BATCH_SIZE = 1000
        
        try:
            minValue, maxValue = self.dbsession.execute('SELECT min_value, max_value FROM Events WHERE name="duration"').fetchone()

            rs = self.dbsession.execute(
                    'SELECT CAST(duration AS UNSIGNED), id FROM F_fbs_time_spent'
                    ' WHERE userID=0 AND artifactID=0 AND revisionID=0 AND dateID=0').fetchone()
            cutoff = (rs[0] or 0) if rs else 0
            bkID = rs[1] if rs else None  # bookkeeping record ID

            startRow, endRow = self.dbsession.execute('SELECT MIN(id), MAX(id) FROM F_fbs_visit WHERE id>%s ORDER BY id ASC LIMIT %s' %
                                                      (cutoff, BATCH_SIZE)).fetchone()
            if not (startRow and endRow):
                return
            
            while True:
                userID, artifactID, revisionID, dateID, ts = None, None, None, None, None
                values = []  # [[userID, artifactID, revisionID, dateID, ts, duration], ...]

                for i in self.dbsession.execute('SELECT userID, artifactID, revisionID, dateID, ts'
                                                ' FROM F_fbs_visit WHERE userID is not NULL AND id>=%s AND id<=%s ORDER BY 1 ASC,5 ASC' %
                                                (startRow, endRow)).fetchall():
                    if userID != i[0]:
                        # Fetch this user's prior visit to serve as starting point
                        rs = self.dbsession.execute('SELECT userID, artifactID, revisionID, dateID, ts'
                                                    ' FROM F_fbs_visit WHERE userID=%s AND id<%s ORDER BY ts DESC LIMIT 1' %
                                               (i[0], startRow)).fetchone()
                        if rs:
                            userID, artifactID, revisionID, dateID, ts = rs
                    
                    if userID == i[0]:
                        if (artifactID and artifactID != i[1]) or (revisionID and revisionID != i[2]):
                            delta = i[4] - ts
                            duration = delta.days * 86400 + delta.seconds
                            if not ((minValue and duration < minValue) or (maxValue and duration > maxValue)):
                                values.append((userID, artifactID, revisionID, dateID, ts, duration))  

                    userID, artifactID, revisionID, dateID, ts = i

                self.dbsession.begin()
                
                if values:
                    # Insert into database
                    sql = 'INSERT INTO F_fbs_time_spent (userID, artifactID, revisionID, dateID, ts, duration) VALUES ' + \
                          ','.join(['(%s,%s,%s,%s,"%s",%s)' % i for i in values])
                    self.dbsession.execute(sql)
                
                # Record the end row of the block processed in bookkeeping record (i.e. the record with all dimension
                # keys being zeros)
                if bkID:
                    self.dbsession.execute('UPDATE F_fbs_time_spent SET duration=%s WHERE id=%s' % (endRow, bkID))
                else:
                    self.dbsession.execute('REPLACE INTO F_fbs_time_spent (userID, artifactID, revisionID, dateID, duration)'
                                           ' VALUES (0, 0, 0, 0, %s)' % endRow)
                self.dbsession.commit()
                
                # Move on to next batch
                rs = self.dbsession.execute('SELECT MIN(id), MAX(id) FROM F_fbs_visit WHERE id>%s ORDER BY id ASC LIMIT %s' %
                                            (endRow, BATCH_SIZE)).fetchone()
                startRow, endRow = rs if rs else (None, None)
                
                if not (startRow and endRow): 
                    break
            
        except Exception, e:
            logger.error('Failed to compute time spent: %s', str(e))
