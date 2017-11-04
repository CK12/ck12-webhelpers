import logging, re, subprocess
from datetime import date
from sqlalchemy import func
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
from pylons import config
from flx.engine.utils import sqlQuote
from flx.model.model import Measure, EventGroup, Event, Metric, Attribute, Dimension, Hierarchy, Level, MeasureDimensionAssociation
from flx.model.api import _transactional
from flx.controllers.celerytasks.eventlogger import _cacheTimeDimension, _time_dim

log = logging.getLogger(__name__)

@_transactional()
def registerEventGroup(name, latency, dimensions, attributes, session):
    """Registers a event group.
    
    A event group is associated with a set of dimensions and can have attributes.
    
    Arguments:
    name       -- metric name
    latency    -- must be either Measure.LATENCY_RT or Measure.LATENCY_NT
    dimensions -- a list of dimension names
    attributes -- a list of attribute names
    """
    gn = name.lower()
    if session.query(func.count(Measure.id)).filter(Measure.name == gn).scalar():
        raise Exception('Event group with name `%s` already exists' % name)
    try:
        latency = int(latency)
    except ValueError:
        raise Exception('Invalid latency `%s`' % latency)
    if latency not in [Measure.LATENCY_RT, Measure.LATENCY_NT]:
        raise Exception('Invalid latency `%s`' % latency)
    
    group = EventGroup(name=gn, latency=latency)
    session.add(group)
    for a in attributes:
        attr = Attribute(name=a.lower(), eventgroup=group)
        session.add(attr)

    # First dimension is always the time dimension
    dimensions = [d for d in dimensions]
    dimensions.insert(0, 'time')
    
    dimArr = []
    for dn in dimensions:
        try:
            dimArr.append(session.query(Dimension).filter(Dimension.name == dn.lower()).one())
        except NoResultFound:
            raise Exception('Dimension with name `%s` does not exist' % dn)
        except MultipleResultsFound:
            msg = 'Multiple dimensions with name `%s` found' % dn
            log.error(msg)
            raise Exception(msg)
    for d in dimArr:    
        assoc = MeasureDimensionAssociation(fk_column=None)
        assoc.dimension = d
        group.associations.append(assoc)

    ddl = 'CREATE TABLE %s (`id` INT(11) NOT NULL AUTO_INCREMENT, `ts` TIMESTAMP DEFAULT CURRENT_TIMESTAMP' % sqlQuote(group.tablename)
    for d in dimArr:
        ddl += ', %sID INT(11), KEY (%sID)' % (d.hierarchies[0].levels[-1].name, d.hierarchies[0].levels[-1].name)
    for a in attributes:
        ddl += ', %s VARCHAR(%d)' % (sqlQuote(a.lower()), Attribute.COLUMN_LENGTH)
    ddl += ', PRIMARY KEY (`id`), KEY (`ts`)) ENGINE=InnoDB DEFAULT CHARSET=utf8'
    log.debug('Event group DDL: %s', ddl)
    session.execute('DROP TABLE IF EXISTS %s' % sqlQuote(group.tablename))
    session.execute(ddl)

@_transactional()
def registerEvent(name, eventGroupName, session):
    """Registers a new event.
    
    The event group for this event should be created before this method is called. 
    
    Arguments:
    name       -- event name
    group_name -- name of the event group that this new event belongs to
    """
    en, gn = name.lower(), eventGroupName.lower()
    try:
        group = session.query(EventGroup).filter(EventGroup.name == gn).one()
    except NoResultFound:
        raise Exception('Event group with name `%s` does not exist' % eventGroupName)
    if session.query(func.count(Event.id)) \
        .filter(Event.name == en) \
        .filter(Event.eventgroup == group) \
        .scalar():
        raise Exception('Event with name `%s` already exists in group `%s`' % (name, eventGroupName))
    
    event = Event(name=en)
    group.events.append(event)
    session.add(event)

    if en != 'ts':
        session.execute('ALTER TABLE %s ADD COLUMN %s FLOAT' % (sqlQuote(group.tablename), sqlQuote(en)))

@_transactional()
def addAttribute(name, eventGroupName, session):
    """Adds a new attribute to an event group.
    
    The event group for this attribute should be created before this method is called. 
    
    Arguments:
    name       -- event name
    group_name -- name of the event group that this new event belongs to
    """
    attr, gn = name.lower(), eventGroupName.lower()
    try:
        group = session.query(EventGroup).filter(EventGroup.name == gn).one()
    except NoResultFound:
        raise Exception('Event group with name `%s` does not exist' % eventGroupName)
    if session.query(func.count(Attribute.id)) \
        .filter(Attribute.name == attr) \
        .filter(Event.eventgroup == group) \
        .scalar():
        raise Exception('Attribute with name `%s` already exists in group `%s`' % (name, eventGroupName))
    
    session.add(Attribute(name=attr, eventgroup=group))

    if attr != 'ts':
        session.execute('ALTER TABLE %s ADD COLUMN %s FLOAT' % (sqlQuote(group.tablename), sqlQuote(attr)))

@_transactional()
def registerMetric(name, latency, dimensions, source_column, source_table, source_db_db,
                   source_db_host, source_db_user, source_db_password, session):
    """Registers a new metric.
    
    Arguments:
    name               -- metric name
    latency            -- must be either Measure.LATENCY_RT or Measure.LATENCY_NT
    dimensions         -- a list of dimension names
    source_column      -- column name
    source_table       -- table name
    source_db_db       -- database name
    source_db_host     -- database host name/IP
    source_db_user     -- database user name
    source_db_password -- database user password
    """
    if not (name and dimensions and source_column and source_table and source_db_db and
            source_db_host and source_db_user):
        raise Exception('Invalid parameter(s)')
    if latency not in [Measure.LATENCY_RT, Measure.LATENCY_NT]:
        raise Exception('Invalid latency `%s`' % latency)
    mn = name.lower()
    if session.query(Metric).filter(Metric.name == mn).scalar():
        raise Exception('Metric with name `%s` already exists' % name)
    dimArr = []
    for dn in dimensions:
        try:
            if ':' in dn:
                dn, fk = dn.split(':')
            else:
                fk = None
            dimArr.append((session.query(Dimension).filter(Dimension.name == dn.lower()).one(), fk))
        except NoResultFound:
            raise Exception('Dimension with name `%s` does not exist' % dn)
        except MultipleResultsFound:
            msg = 'Multiple dimensions with name `%s` found' % dn
            log.error(msg)
            raise Exception(msg)

    metric = Metric(name=mn, latency=latency, source_column=source_column, source_table=source_table,
                    source_db_db=source_db_db, source_db_host=source_db_host, source_db_user=source_db_user,
                    source_db_password=source_db_password)
    session.add(metric)
    
    for i in dimArr:
        assoc = MeasureDimensionAssociation(fk_column=i[1])
        assoc.dimension = i[0]
        metric.associations.append(assoc)

@_transactional()
def registerDimension(name, tag, session):
    """Registers a new dimension.
    
    Arguments:
    name -- dimension name
    tag -- dimension tag enabled or not
    """
    if not name:
        raise Exception('Invalid parameter(s)')
    dn = name.lower()
    if session.query(Dimension).filter(Dimension.name == dn).scalar():
        raise Exception('Dimension with name `%s` already exists' % name)
    dim = Dimension(name=dn, tag=bool(tag), is_builtin=False)
    session.add(dim)
    session.execute('DROP TABLE IF EXISTS %s' % dim.tablename)
    session.execute('CREATE TABLE %s ('
                    ' `id` int(11) NOT NULL AUTO_INCREMENT,'
                    ' `tag` varchar(256),'
                    ' PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8' % dim.tablename)

@_transactional()
def setDimensionLoadScript(dimName, script, session):
    """Set load script of a dimension.
    
    Arguments:
    dimension_name -- dimension name
    script         -- SQL script content
    """    
    if not (dimName and script):
        raise Exception('Invalid parameter(s)')
    dn = dimName.lower()
    try:
        dim = session.query(Dimension).filter(Dimension.name == dn).one()
        dim.load_script = script
    except NoResultFound:
        raise Exception('Dimension with name `%s` does not exist' % dimName)
    except MultipleResultsFound:
        msg = 'Multiple dimensions with name `%s` found' % dimName
        log.error(msg)
        raise Exception(msg)

@_transactional()
def setDimensionUpdateScript(dimName, script, session):
    """Set update script of a dimension.
    
    Arguments:
    dimension_name -- dimension name
    script         -- SQL script content
    """    
    if not (dimName and script):
        raise Exception('Invalid parameter(s)')
    dn = dimName.lower()
    try:
        dim = session.query(Dimension).filter(Dimension.name == dn).one()
        dim.update_script = script
        
        # Save the script to file and use mysql client to execute it because
        # we cannot programmatically create triggers in MySQL.
        SCRIPT_FILE = '/tmp/ads.trigger'
        scriptFile = open(SCRIPT_FILE, 'w')
        scriptFile.write(script)
        scriptFile.close()
        m = re.match('mysql://(?P<user>.*):(?P<passwd>.*)@(?P<host>.*):(?P<port>.*)/', config['sqlalchemy.url'])
        cmd = '/usr/bin/mysql -h %s -P %s -u %s -p%s <%s' % (m.group('host'), m.group('port'), m.group('user'), m.group('passwd'), SCRIPT_FILE)
        log.debug('Execute update script for dimension: %s; cmd: %s', dim.name, cmd)
        subprocess.check_call(cmd, shell=True)
    except NoResultFound:
        raise Exception('Dimension with name `%s` does not exist' % dimName)
    except MultipleResultsFound:
        msg = 'Multiple dimensions with name `%s` found' % dimName
        log.error(msg)
        raise Exception(msg)

@_transactional()
def loadDimension(dimName, session):
    """Load a dimension.
    
    Arguments:
    dimension_name -- dimension name
    """    
    if not dimName:
        raise Exception('Invalid parameter(s)')
    dn = dimName.lower()
    try:
        dim = session.query(Dimension).filter(Dimension.name == dn).one()
        if not dim.load_script:
            raise Exception('Dimension with name `%s` has no load script' % dimName)
        # Can only load single hierarchy for now
        columns = 'tag,' if dim.tag else ''
        for l in dim.hierarchies[0].levels:
            columns += '%s,%s,' % (sqlQuote(l.name + 'ID'), sqlQuote(l.name))
        columns = columns.rstrip(',')
        session.execute('TRUNCATE TABLE %s' % dim.tablename)
        session.execute('INSERT INTO %s (%s) %s' % (dim.tablename, columns, dim.load_script))
        
        if dim.hierarchies[0].ragged:
            _createBridge(dim, session)
    except NoResultFound:
        raise Exception('Dimension with name `%s` does not exist' % dimName)
    except MultipleResultsFound:
        msg = 'Multiple dimensions with name `%s` found' % dimName
        log.error(msg)
        raise Exception(msg)

@_transactional()
def addHierarchy(**kwargs):
    """Adds a new hierarchy to a existing dimension.
    
    Arguments:
    name    -- hierarchy name
    dimName -- dimension name
    
    (For ragged hierarchy)
    ragged           -- if present, this is a ragged hierarchy
    pk_column        -- primary key column name
    parent_pk_column -- parent primary key column name
    lookup_table     -- lookup table name
    db_db            -- database name
    db_host          -- database host name/IP
    db_user          -- database user name
    db_password      -- database user password
    """
    name = kwargs.get('name')
    dimName = kwargs.get('dimension_name')
    ragged = kwargs.get('ragged')
    pk_column = kwargs.get('pk_column')
    parent_pk_column = kwargs.get('parent_pk_column')
    lookup_table = kwargs.get('lookup_table')
    db_db = kwargs.get('db_db')
    db_host = kwargs.get('db_host')
    db_user = kwargs.get('db_user')
    db_password = kwargs.get('db_password')
    session = kwargs.get('session')
    if not (name and dimName):
        raise Exception('Invalid parameter(s)')
    hn, dn = name.lower(), dimName.lower()
    try:
        dim = session.query(Dimension).filter(Dimension.name == dn).one()
        if session.query(func.count(Hierarchy.id)) \
            .filter(Hierarchy.name == hn) \
            .filter(Hierarchy.dimension == dim).scalar():
            raise Exception('Hierarchy with name `%s` already exists' % name)

        if ragged != None:
            if not (pk_column and parent_pk_column and lookup_table and db_db and
                    db_host and db_user and db_password):
                raise Exception('Missing parameter(s) for ragged hierarchy')
            hierarchy = Hierarchy(name=hn,
                                  ragged=True,
                                  pk_column=pk_column,
                                  parent_pk_column=parent_pk_column,
                                  lookup_table=lookup_table,
                                  db_db=db_db,
                                  db_host=db_host,
                                  db_user=db_user,
                                  db_password=db_password)
        else:
            hierarchy = Hierarchy(name=hn)
        dim.hierarchies.append(hierarchy)
        session.add(hierarchy)
    except NoResultFound:
        raise Exception('Dimension with name `%s` does not exist' % dimName)
    except MultipleResultsFound:
        msg = 'Multiple dimensions with name `%s` found' % dimName
        log.error(msg)
        raise Exception(msg)

@_transactional()
def addLevel(name, dimName, hierarchyName, session):
    """Adds a new level to a hierarchy in a dimension.
    
    The dimension and hierarchy should have been created already.
    
    Arguments:
    name          -- level name
    dimName       -- dimension name
    hierarchyName -- hierarchy name
    """
    if not (name and dimName and hierarchyName):
        raise Exception('Invalid parameter(s)')
    ln, dn, hn = name.lower(), dimName.lower(), hierarchyName.lower()

    try:
        hierarchy = session.query(Hierarchy) \
                           .join(Hierarchy.dimension) \
                           .filter(Hierarchy.name == hn) \
                           .filter(Dimension.name == dn).one()
        level = Level(name=ln)
        if hierarchy.levels:
            hierarchy.levels[0].parent = level
        hierarchy.levels.insert(0, level)  # push to head or cached list will have wrong order
        session.add(level)
        session.execute('ALTER TABLE %s ADD COLUMN %s INT(11), ADD COLUMN %s VARCHAR(%d), ADD KEY (%s)' %
                        (level.hierarchy.dimension.tablename,
                         sqlQuote(ln + 'ID'),
                         sqlQuote(ln), Level.COLUMN_LENGTH,
                         sqlQuote(ln + 'ID')))
    except NoResultFound:
        raise Exception('Hierarchy with name `%s` does not exist' % hierarchyName)
    except MultipleResultsFound:
        msg = 'Multiple hierarchies with name `%s` found' % hierarchyName
        log.error(msg)
        raise Exception(msg)
            
def getDimension(name):
    """Retrieves a dimension object by name."""
    pass

def getMeasure(name):
    """Retrieves a measure (event or metric) by name."""
    pass 

def updateBridge(dim, session):
    """Update a bridge table for a ragged dimension.
    
    The bridge table will be named `B_<dimension name>`.
    """
    hierarchy = dim.hierarchies[0]
    if not hierarchy.ragged:
        raise Exception('Hierarchy %s of dimension %s is not ragged' % (hierarchy.name, dim.name))
    bridge = 'B_%s' % dim.name
    
    graph = {}
    for r in session.execute('SELECT %s, %s FROM %s.%s' % (hierarchy.parent_pk_column, hierarchy.pk_column,
                                                           hierarchy.db_db, hierarchy.lookup_table)).fetchall():
        entry = graph.get(r[0], [])
        entry.append(r[1])
        graph[r[0]] = entry
        
    pairs = {}
    for i in graph:
        pairs.update(_walkGraph(graph, [], i))
    pairs = pairs.keys()
        
    insert = 'INSERT IGNORE INTO %s (parentID, childID) VALUES ' % bridge
    values = []
    for i in xrange(1, len(pairs)+1):
        if i % 1000 == 0:
            dml = insert + ','.join(values)
            log.debug('Bridge table DML: %s', dml)
            session.execute(dml)
            values = []
        values.append('(%s,%s)' % pairs[i-1])
    if values:
        dml = insert + ','.join(values)
        log.debug('Bridge table DML: %s', dml)
        session.execute(dml)

def _createBridge(dim, session):
    """Creates a bridge table for a ragged dimension.
    
    The bridge table will be named `B_<dimension name>`.
    """
    hierarchy = dim.hierarchies[0]
    if not hierarchy.ragged:
        raise Exception('Hierarchy %s of dimension %s is not ragged' % (hierarchy.name, dim.name))
    bridge = 'B_%s' % dim.name
    session.execute('DROP TABLE IF EXISTS %s' % bridge)
    session.execute('CREATE TABLE %s (parentID INT, childID INT, UNIQUE KEY (parentID, childID))' % bridge)
    
    graph = {}
    for r in session.execute('SELECT %s, %s FROM %s.%s' % (hierarchy.parent_pk_column, hierarchy.pk_column,
                                                           hierarchy.db_db, hierarchy.lookup_table)).fetchall():
        entry = graph.get(r[0], [])
        entry.append(r[1])
        graph[r[0]] = entry
        
    pairs = {}
    for i in graph:
        pairs.update(_walkGraph(graph, [], i))
    pairs = pairs.keys()
        
    insert = 'INSERT INTO %s (parentID, childID) VALUES ' % bridge
    values = []
    for i in xrange(1, len(pairs)+1):
        if i % 1000 == 0:
            dml = insert + ','.join(values)
            log.debug('Bridge table DML: %s', dml)
            session.execute(dml)
            values = []
        values.append('(%s,%s)' % pairs[i-1])
    if values:
        dml = insert + ','.join(values)
        log.debug('Bridge table DML: %s', dml)
        session.execute(dml)
        
def _walkGraph(graph, ancestors, node):
    """Computes all possible (ancestor, descendant) pairs starting at a node.
    
    Arguments:
    graph     -- parent ID to immediate child ID mapping
    ancestors -- list of ancestors visited
    node      -- the node where traversing commences
    """
    pairs = {}
    if node in ancestors:
        return pairs
    pairs[(node, node)] = True
    for i in graph.get(node, []):
        pairs[(node, i)] = True
        for a in ancestors:
            pairs[(a, i)] = True
        pairs.update(_walkGraph(graph, ancestors + [node], i))
    return pairs

def createAggregate(eg, session, force_create=False):
    """Creates an aggregate table for an event group.
    
    Arguments:
    eg           -- event group object
    session      -- database session
    force_create -- whether existing aggregate table will be dropped and recreated
    """
    try:
        tableName = sqlQuote(eg.aggregate_name)
        session.execute('SELECT 1 FROM %s LIMIT 1' % tableName)
        if not force_create:
            return  # aggregate table exists
    except:
        pass
    
    keys = []
    ddl = 'CREATE TABLE %s (' % tableName
    timeDimKey = '%sID' % \
                    'date' if eg.aggregate == 'd' else \
                    'week' if eg.aggregate == 'w' else \
                    'month' if eg.aggregate == 'm' else \
                    'year';
    ddl += '%s INT(11),KEY (%s)' % (timeDimKey, timeDimKey)
    keys.append(timeDimKey)
    
    for i in eg.associations[1:]:  # excluding time dimension
        ddl += ',%sID INT(11),KEY (%sID)' % (i.dimension.hierarchies[0].levels[-1].name,
                                             i.dimension.hierarchies[0].levels[-1].name)
        keys.append('%sID' % i.dimension.hierarchies[0].levels[-1].name)
    for a in eg.attributes:
        ddl += ',%s VARCHAR(%d),KEY (%s)' % (sqlQuote(a.name), Attribute.COLUMN_LENGTH, sqlQuote(a.name))
        keys.append(sqlQuote(a.name))
    for i in eg.events:
        ddl += ',%s FLOAT,%s$min$ FLOAT,%s$max$ FLOAT' % (sqlQuote(i.name), i.name, i.name)
    ddl += ',$count$ FLOAT,UNIQUE KEY (%s)) ENGINE=InnoDB DEFAULT CHARSET=utf8' % ','.join(keys)
    log.debug('Event group aggregate DDL: %s', ddl)
    session.execute('DROP TABLE IF EXISTS %s' % tableName)
    session.execute(ddl)

def aggregate(eg, session, fromDate=None, toDate=None):
    """Perform aggregation for an event group.
    
    Arguments:
    eg       -- event group object
    fromDate -- starting time period (inclusive), must be a datetime.date object
    toDate   -- ending time period (inclusive), must be a datetime.date object
    """
    if (fromDate and not isinstance(fromDate, date)) or (toDate and not isinstance(toDate, date)):
        raise Exception('Invalid time range: fromDate=%s, toDate=%s' % (fromDate, toDate))
     
    dml = 'INSERT INTO %s (' % sqlQuote(eg.aggregate_name)
    timeDimKey = '%sID' % \
                'date' if eg.aggregate == 'd' else \
                'week' if eg.aggregate == 'w' else \
                'month' if eg.aggregate == 'm' else \
                'year';
    dml+= timeDimKey
    for i in eg.associations[1:]:  # excluding time dimension
        dml += ',%sID' % i.dimension.hierarchies[0].levels[-1].name
    for a in eg.attributes:
        dml += ',%s' % sqlQuote(a.name.lower())
    for i in eg.events:        
        dml += ',%s,%s$min$,%s$max$' % (sqlQuote(i.name), i.name, i.name)
    dml += ',$count$) SELECT '
    dml += timeDimKey
    for i in eg.associations[1:]:  # excluding time dimension
        dml += ',IFNULL(%sID,0)' % i.dimension.hierarchies[0].levels[-1].name
    for a in eg.attributes:
        dml += ",IFNULL(%s,'')" % sqlQuote(a.name.lower())
    for i in eg.events:
        column = sqlQuote(i.name)
        dml += ',SUM(%s),MIN(%s),MAX(%s)' % (column, column, column)
    dml += ',COUNT(*) FROM %s' % eg.tablename
    if fromDate or toDate:
        _cacheTimeDimension(session)
        dml += ' WHERE '
        if fromDate:
            dml += '%s >= %s' % (timeDimKey, _time_dim.get(fromDate))
        if toDate:
            dml += ' AND ' if fromDate else ''
            dml += '%s <=%s' % (timeDimKey, _time_dim.get(toDate))

    dml += ' GROUP BY %s' % timeDimKey
    for i in eg.associations[1:]:  # excluding time dimension
        dml += ',%sID' % i.dimension.hierarchies[0].levels[-1].name
    for a in eg.attributes:
        dml += ',%s' % sqlQuote(a.name.lower())
    dml += ' ON DUPLICATE KEY UPDATE $count$=VALUES($count$)'
    for i in eg.events:        
        dml += ',%s=VALUES(%s)' % (sqlQuote(i.name), sqlQuote(i.name))
    
    log.debug('Event group aggregate DML: %s', dml)
    session.execute(dml)
