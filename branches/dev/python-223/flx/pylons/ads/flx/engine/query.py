import logging, StringIO, heapq, datetime, urllib
from sqlalchemy.orm.exc import NoResultFound
from flx.engine.utils import sqlQuote
from flx.engine import ftlexer, ftparser, solexer, soparser
from flx.engine.aggregate import Aggregate
from flx.model.model import Dimension, Metric, Event, EventGroup
from flx.model.meta import Session

log = logging.getLogger(__name__)

def process(**kwargs):
    """Processes a query.
    
    Arguments:
    query -- query string passed from client
    """
    log.debug('Parameters: %s', kwargs)
    session = Session()
    if 'eg' in kwargs:
        return EventQueryProcessor(session).process(kwargs)
    else:
        return MetricQueryProcessor(session).process(kwargs)

class SyntaxError(Exception):
    """Raised when query syntax error is encountered."""
    pass

class QueryError(Exception):
    """Raised when query execution error is encountered."""
    pass
            
class EventQueryProcessor(object):
    """Handles queries against events."""
    
    def __init__(self, session):
        self.session = session

    def process(self, kwargs):
        obj = _queryCache.get(kwargs)
        if obj:
            (query, labels, aggr), hit = obj, True
        else:
            (query, labels, aggr), hit = self.parse(kwargs), False
        log.debug('SQL query: %s', query)
        results = [r.values() for r in self.session.execute(query).fetchall()]
        if kwargs.get('olap'):
            results = aggr.run(results)
        if not hit:
            _queryCache.push(kwargs, (query, labels, aggr))
            
        _convertNullValues(kwargs, results)                     
        return results, query, labels
    
    def parse(self, kwargs):
        """Parses a query's parameters."""
        olap = kwargs.get('olap')
        gn = kwargs.get('eg').lower()
        try:
            eg = _measureCache.get(gn)
            if not eg:
                eg = self.session.query(EventGroup).filter(EventGroup.name == gn).one()
                _measureCache.push(gn, eg)
        except NoResultFound:
            raise QueryError('Event group with name `%s` does not exist' % gn)
        
        aggrTypes, aggrGrouping = [], []
        eventList = []
        selectList = ['SELECT ']
        selectListMap = {}  # name -> index in selectList
        labelList = []
        try:
            ml = kwargs.get('ml')
            for m in ml.split(','):
                name, aggr = m.lower().split(':')
                if not aggr in _AGGR_FUNCS:
                    raise SyntaxError('Illegal aggregate function: %s' % aggr)
                try:
                    cacheKey = '%s.%s' % (eg.name, name)
                    event = _measureCache.get(cacheKey)
                    if not event:
                        event = self.session.query(Event).filter(Event.name == name).filter(Event.eventgroup_id == eg.id).one()
                        _measureCache.push(cacheKey, event)
                except NoResultFound:
                    raise QueryError('Event with name `%s` does not exist' % name)
                aggrTypes.append((_mapAggrFunc(aggr), len(selectList)-1))
                selectList.append('%s%s' % (',' if len(selectList) > 1 else '', _processAggregateFunc(eg, event, aggr, kwargs)))
                labelList.append(name)
                eventList.append(event)
            log.debug('SELECT list: %s', ''.join(selectList))
        except (SyntaxError, QueryError):
            raise
        except Exception, e:
            log.debug('Raised syntax error; server exception: %s', str(e))
            raise Exception('Syntax error near: %s' % ml)
    
        whereClause = [' WHERE ']
        try:
            ft = kwargs.get('ft', '')
            en = kwargs.get('en', '')
            if ft or en:
                lexer = ftlexer.Lexer(StringIO.StringIO(ft + ' ' + en))
                parser = ftparser.Parser(lexer)
                parser.filter_list()
                ast = parser.getAST()
                dimDict = _convertFilters(self.session, ast, whereClause, eventGroup=eg)
                # Check if dimensions are legal for this event group
                for i in dimDict:
                    if any([assoc.dimension.name == i for assoc in eg.associations]):
                        continue
                    raise Exception('Illegal dimension: %s' % i)
            else:
                whereClause = []
                dimDict = {}
            log.debug('WHERE clause: %s', ''.join(whereClause))
        except Exception, e:
            raise e
        
        tableList = [' FROM ']
        tableList.append(eg.aggregate_name)
        for i in dimDict:
            tableList.append('%s%s' % (',' if len(tableList) > 1 else '', dimDict[i].tablename))
        log.debug('FROM table list: %s', ''.join(tableList))

        # Attribute fields to be returned
        try:
            al = kwargs.get('al').split(',') if kwargs.has_key('al') else [] 
            for a in al:
                attrName = a.lower()
                if not any([attrName == i.name for i in eg.attributes]):
                    raise QueryError('Attribute `%s` not in event group `%s`' % (a, gn))
                selectListMap[attrName] = len(selectList) - 1
                selectList.append('%s%s.`%s`' % (',' if len(selectList) > 1 else '', eg.aggregate_name, attrName))
                labelList.append(attrName)
            log.debug('SELECT list (with attribute fields): %s', ''.join(selectList))
        except QueryError:
            raise
        except Exception, e:
            log.debug('Raised syntax error; server exception: %s', str(e))
            raise Exception('Syntax error near: %s' % kwargs.get('al', ''))
    
        # Dimension fields to be returned
        try:
            dl = kwargs.get('dl').split(',') if kwargs.has_key('dl') else [] 
            for d in dl:
                dn, ln = d.lower().split(':')
                dim = dimDict.get(dn)
                if not dim:
                    raise QueryError('Dimension `%s` needs to be specified in `ft` parameter' % dn)
                isTag = ln == 'tag'
                if not any([ln == l.name for l in dim.hierarchies[0].levels]) and not isTag:
                    raise QueryError('Level `%s` not in dimension `%s`' % (ln, dn))
                if isTag:
                    selectListMap[dn] = len(selectList) - 1
                    selectList.append('%s%s.`%s`' % (',' if len(selectList) > 1 else '', dim.tablename, ln))
                    labelList.append(ln)
                else:
                    selectList.append('%s%s.`%s`' % (',' if len(selectList) > 1 else '', dim.tablename, ln))
                    selectListMap[dn] = len(selectList) - 1
                    selectList.append('%s%s.%sID' % (',' if len(selectList) > 1 else '', dim.tablename, ln))
                    labelList.append(ln)
                    labelList.append('%sID' % ln)
            log.debug('SELECT list (with dim fields): %s', ''.join(selectList))
        except QueryError:
            raise
        except Exception, e:
            log.debug('Raised syntax error; server exception: %s', str(e))
            raise Exception('Syntax error near: %s' % dl)
    
        # Group by clause
        groupByClause = ''
        try:
            groupByList = [' GROUP BY ']
            gb = kwargs.get('gb').split(',') if kwargs.has_key('gb') else []
            for i in gb:
                if ':' not in i:
                    continue  # group by attribute
                dn, ln = i.lower().split(':')
                dim = dimDict.get(dn)
                if not dim:
                    raise QueryError('Dimension `%s` needs to be specified in `ft` parameter' % dn)
                isTag = ln == 'tag'
                if not any([ln == l.name for l in dim.hierarchies[0].levels]) and not isTag:
                    raise QueryError('Level `%s` not in dimension `%s`' % (ln, dn))
                sortColumn = ln if isTag else '%sID' % ln
                groupByList.append('%s%s.`%s`' % (',' if len(groupByList) > 1 else '', dim.tablename, sortColumn))
                if selectListMap.has_key(dn):
                    aggrGrouping.append(selectListMap.get(dn))
            if len(groupByList) > 1:
                groupByClause = ''.join(groupByList)
                log.debug('GROUP BY clause: %s', groupByClause)

            for i in gb:
                if ':' in i:
                    continue  # group by dimension
                attrName = i.lower()
                if not any([attrName == i.name for i in eg.attributes]):
                    raise QueryError('Attribute `%s` not in event group `%s`' % (attrName, gn))
                groupByList.append('%s%s.`%s`' % (',' if len(groupByList) > 1 else '', eg.aggregate_name, attrName))
                if selectListMap.has_key(attrName):
                    aggrGrouping.append(selectListMap.get(attrName))
            if len(groupByList) > 1:
                groupByClause = ''.join(groupByList)
                log.debug('GROUP BY clause: %s', groupByClause)
        except QueryError:
            raise
        except Exception, e:
            log.debug('Raised syntax error; server exception: %s', str(e))
            raise Exception('Syntax error near: %s' % gb)
        
        # Join event fact table to dimension tables
        joinDict = {}
        for assoc in eg.associations:
            dim = assoc.dimension
            if dim.name in dimDict:
                naturalKey = dim.hierarchies[0].levels[-1].name + 'ID'
                if dim.hierarchies[0].ragged and olap:
                    # Join to a ragged dimension via its bridge table
                    bridge = 'B_%s' % dim.name
                    fk = sqlQuote(assoc.fk_column or naturalKey)
                    join = '%s.%s=%s.%s AND %s.%s=%s.%s' % (eg.aggregate_name,
                                                            fk,
                                                            bridge,
                                                            'childID',
                                                            bridge,
                                                            'parentID',
                                                            dim.tablename,
                                                            sqlQuote(naturalKey))
                    extraTable = '%s%s' % (',' if len(tableList) > 1 else '', bridge)
                    if extraTable not in tableList:
                        tableList.append(extraTable)
                else:
                    join = '%s.`%s`=%s.`%s`' % (eg.aggregate_name, assoc.fk_column or naturalKey, dim.tablename, naturalKey)
                joinDict[join] = True
        log.debug('Joins: %s', joinDict.keys())
        joins = (' AND ' if len(whereClause)>1 and joinDict else '') + ' AND '.join(joinDict)

        # Order by clause
        orderBy = [' ORDER BY ']
        sorts = _parseSortOrders(self.session, kwargs.get('so'), orderBy, dimDict, labelList, eg)
        orderByClause = ''.join(orderBy) if len(orderBy)>1 else ''
        log.debug('Order by: %s', orderByClause)
        
        # Roll up clause
        rollupClause = ' WITH ROLLUP' if ('rp' in kwargs and len(orderBy) == 1 and len(groupByList) > 1 and not olap) else ''
            
        # Aggregate operation
        aggregator = Aggregate(grouping=aggrGrouping, aggregates=aggrTypes, sorts=sorts, rollup='rp' in kwargs) 
        
        return ''.join(selectList + tableList + whereClause) + joins + groupByClause + orderByClause + rollupClause, labelList, aggregator

class MetricQueryProcessor(object):
    """Handles queries against metrics."""
    
    def __init__(self, session):
        self.session = session

    def process(self, kwargs):
        obj = _queryCache.get(kwargs)
        if obj:
            (query, labels, aggr), hit = obj, True
        else:
            (query, labels, aggr), hit = self.parse(kwargs), False
        log.debug('SQL query: %s', query)
        results = [r.values() for r in self.session.execute(query).fetchall()]
        if kwargs.get('olap'):
            results = aggr.run(results)
        if not hit:
            _queryCache.push(kwargs, (query, labels, aggr))
            
        _convertNullValues(kwargs, results)                     
        return results, query, labels
    
    def parse(self, kwargs):
        """Parses a query's parameters."""
        olap = kwargs.get('olap')
        aggrTypes, aggrGrouping = [], []        
        srcTableDict = {}
        metricList = []
        selectList = ['SELECT ']
        selectListMap = {}  # name -> index in selectList
        labelList = []
        try:
            ml = kwargs.get('ml')
            for m in ml.split(','):
                name, aggr = m.lower().split(':')
                if not aggr in _AGGR_FUNCS:
                    raise SyntaxError('Illegal aggregate function: %s' % aggr)
                try:
                    metric = _measureCache.get(name)
                    if not metric:
                        metric = self.session.query(Metric).filter(Metric.name == name).one()
                        _measureCache.push(name, metric)
                except NoResultFound:
                    raise QueryError('Metric with name `%s` does not exist' % name)
                aggrTypes.append((_mapAggrFunc(aggr), len(selectList)-1))
                selectList.append('%s%s(%s.`%s`)' % (',' if len(selectList) > 1 else '',
                                                     'sum' if olap else aggr,
                                                     metric.source_table,
                                                     metric.source_column))
                labelList.append(name)
                metricList.append(metric)
                srcTableDict[metric.source_table] = metric.source_db_db
            log.debug('SELECT list: %s', ''.join(selectList))
        except (SyntaxError, QueryError):
            raise
        except Exception, e:
            log.debug('Raised syntax error; server exception: %s', str(e))
            raise Exception('Syntax error near: %s' % ml)
    
        whereClause = [' WHERE ']
        try:
            ft = kwargs.get('ft', '')
            en = kwargs.get('en', '')
            if ft or en:
                lexer = ftlexer.Lexer(StringIO.StringIO(ft + ' ' + en))
                parser = ftparser.Parser(lexer)
                parser.filter_list()
                ast = parser.getAST()
                dimDict = _convertFilters(self.session, ast, whereClause)
            else:
                whereClause = []
                dimDict = {}
            log.debug('WHERE clause: %s', ''.join(whereClause))
        except Exception, e:
            raise e
        
        tableList = [' FROM ']
        for i in srcTableDict:
            tableList.append('%s%s.%s' % (',' if len(tableList) > 1 else '', srcTableDict[i], i))
        for i in dimDict:
            tableList.append('%s%s' % (',' if len(tableList) > 1 else '', dimDict[i].tablename))
        log.debug('FROM table list: %s', ''.join(tableList))
    
        # Dimension fields to be returned
        try:
            dl = kwargs.get('dl').split(',') if kwargs.has_key('dl') else [] 
            for d in dl:
                dn, ln = d.lower().split(':')
                dim = dimDict.get(dn)
                if not dim:
                    raise QueryError('Dimension `%s` needs to be specified in `ft` parameter' % dn)
                isTag = ln == 'tag'
                if not any([ln == l.name for l in dim.hierarchies[0].levels]) and not isTag:
                    raise QueryError('Level `%s` not in dimension `%s`' % (ln, dn))
                if isTag:
                    selectListMap[dn] = len(selectList) - 1
                    selectList.append('%s%s.`%s`' % (',' if len(selectList) > 1 else '', dim.tablename, ln))
                    labelList.append(ln)
                else:
                    selectList.append('%s%s.`%s`' % (',' if len(selectList) > 1 else '', dim.tablename, ln))
                    selectListMap[dn] = len(selectList) - 1
                    selectList.append('%s%s.%sID' % (',' if len(selectList) > 1 else '', dim.tablename, ln))
                    labelList.append(ln)
                    labelList.append('%sID' % ln)
            log.debug('SELECT list (with dim fields): %s', ''.join(selectList))
        except QueryError:
            raise
        except Exception, e:
            log.debug('Raised syntax error; server exception: %s', str(e))
            raise Exception('Syntax error near: %s' % dl)
    
        # Group by clause
        groupByClause = ''
        try:
            groupByList = [' GROUP BY ']
            gb = kwargs.get('gb').split(',') if kwargs.has_key('gb') else []
            for i in gb:
                dn, ln = i.lower().split(':')
                dim = dimDict.get(dn)
                if not dim:
                    raise QueryError('Dimension `%s` needs to be specified in `ft` parameter' % dn)
                isTag = ln == 'tag'
                if not any([ln == l.name for l in dim.hierarchies[0].levels]) and not isTag:
                    raise QueryError('Level `%s` not in dimension `%s`' % (ln, dn))
                sortColumn = ln if isTag else '%sID' % ln
                groupByList.append('%s%s.`%s`' % (',' if len(groupByList) > 1 else '', dim.tablename, sortColumn))
                if selectListMap.has_key(dn):
                    aggrGrouping.append(selectListMap.get(dn))
            if len(groupByList) > 1:
                groupByClause = ''.join(groupByList)
                log.debug('GROUP BY clause: %s', groupByClause)
        except QueryError:
            raise
        except Exception, e:
            log.debug('Raised syntax error; server exception: %s', str(e))
            raise Exception('Syntax error near: %s' % gb)
        
        # Join source tables to dimension tables. Three styles of joins supported.
        #
        # (1) Direct join:
        #       <source table>.<fk_column> = <dimension table>.<natural key>
        #
        # (2) Indirect join via a lookup table/view:
        #       <source table>.<fk_column> = <lookup>.<fk_column> AND \
        #       <lookup>.<natural key> = <dimension table>.<natural key>
        #
        # (3) (Ragged hierarchy)
        #     Indirect join via a temporary bridge table created at runtime. 
        #
        #       <source table>.<fk_column> = <lookup>.<fk_column> AND \
        #       <lookup>.<natural key> = <dimension table>.<natural key>
        #            
        joinDict = {}
        for m in metricList:
            # Check if dimensions are legal for this metric
            for i in dimDict:
                if any([assoc.dimension.name == i for assoc in m.associations]):
                    continue
                raise Exception('Illegal dimension: %s' % i)
            for assoc in m.associations:
                dim = assoc.dimension
                if dim.name in dimDict:
                    naturalKey = dim.hierarchies[0].levels[-1].name + 'ID'  # dimension's natural key
                    if assoc.fk_column and '@' in assoc.fk_column:
                        # Case (2)
                        fk, lookup = assoc.fk_column.split('@')
                        if '|' in fk:
                            skey, lkey = fk.split('|')
                        else:
                            skey = lkey = fk 
                        join = '%s.%s=%s.%s AND %s.%s=%s.%s' % (m.source_table,
                                                                sqlQuote(skey or naturalKey),
                                                                lookup,
                                                                sqlQuote(lkey or naturalKey),
                                                                lookup,
                                                                sqlQuote(naturalKey),
                                                                dim.tablename,
                                                                sqlQuote(naturalKey))
                        extraTable = '%s%s' % (',' if len(tableList) > 1 else '', lookup)
                        if extraTable not in tableList:
                            tableList.append(extraTable)
                    elif dim.hierarchies[0].ragged and olap:
                        # Case (3)
                        bridge = 'B_%s' % dim.name
                        fk = sqlQuote(assoc.fk_column or naturalKey)
                        join = '%s.%s=%s.%s AND %s.%s=%s.%s' % (m.source_table,
                                                                fk,
                                                                bridge,
                                                                'childID',
                                                                bridge,
                                                                'parentID',
                                                                dim.tablename,
                                                                sqlQuote(naturalKey))
                        extraTable = '%s%s' % (',' if len(tableList) > 1 else '', bridge)
                        if extraTable not in tableList:
                            tableList.append(extraTable)
                    else:
                        # Case (1)
                        join = '%s.`%s`=%s.`%s`' % (m.source_table, assoc.fk_column or naturalKey,
                                                    dim.tablename, naturalKey)
                    joinDict[join] = True
        log.debug('Joins: %s', joinDict.keys())
        joins = (' AND ' if len(whereClause)>1 and joinDict else '') + ' AND '.join(joinDict)

        # Order by clause
        orderBy = [' ORDER BY ']
        sorts = _parseSortOrders(self.session, kwargs.get('so'), orderBy, dimDict, labelList)
        orderByClause = ''.join(orderBy) if len(orderBy)>1 else ''
        log.debug('Order by: %s', orderByClause)

        # Roll up clause
        rollupClause = ' WITH ROLLUP' if ('rp' in kwargs and len(orderBy) == 1 and len(groupByList) > 1 and not olap) else ''

        # Aggregate operation
        aggregator = Aggregate(grouping=aggrGrouping, aggregates=aggrTypes, sorts=sorts, rollup='rp' in kwargs) 
                    
        return ''.join(selectList + tableList + whereClause) + joins + groupByClause + orderByClause + rollupClause, labelList, aggregator

class _Cache(object):
    """Caches generated SQL query statements or dimensional model meta objects."""
    def __init__(self, cacheSize=1000):
        self.lru = []  # a LRU list
        self.entries = {}
        self.cacheSize = cacheSize

    def __len__(self):
        return len(self.entries)

    def __encode(self, params):
        """Encode parameters into cache key."""
        if isinstance(params, dict):
            key = {}
            key['ml'] = params.get('ml')
            key['al'] = params.get('al')
            key['dl'] = params.get('dl')
            key['ft'] = params.get('ft')
            key['eg'] = params.get('eg')
            key['gb'] = params.get('gb')
            key['so'] = params.get('so')
            key['rp'] = params.get('rp')
            key['en'] = params.get('en')
            key['rl'] = params.get('rl')
            key['olap'] = params.get('olap')
            return urllib.urlencode(key).lower()
        elif isinstance(params, str) or isinstance(params, unicode):
            return params.lower()
        else:
            return id(params)
            
    def push(self, params, obj):
        """Pushes an object (SQL statement or meta data object) into cache."""
        if self.cacheSize == 0:
            return
        elif len(self.lru) >= self.cacheSize:
            key = heapq.heappop(self.lru)
            del self.entries[key[1]]
        key = self.__encode(params)
        self.entries[key] = obj.cacheable() if hasattr(obj, 'cacheable') else obj
        heapq.heappush(self.lru, (datetime.datetime.now(), key))
        
    def get(self, params):
        """Searches for a cached object (query statement or meta data object) matching the given parameters."""
        obj = self.entries.get(self.__encode(params))
        if obj:
            log.debug('Cache hit for key: %s (%s)', str(params), type(obj))
        return obj
    
    def clear(self):
        """Cleans the cache."""
        self.lru = []  # a LRU list
        self.entries = {}

def _convertFilters(session, ast, where, level=0, eventGroup=None):
    """Converts a filter list into SQL WHERE clause.
    
    Arguments:
    session    -- db session
    where      -- output array containing the WHERE clause being constructed
    ast        -- antlr AST tree
    level      -- AST node level (0 = top level)
    eventGroup -- a EventGroup object accessed in the query
    """
    dimDict = {}
    if not ast: return dimDict
    log.debug('AST node: (%.2d:%.2d) %s ', level, ast.getType(), ast.getText())
    if level == 0:
        tree = ast
        negate = False
        if tree.getType() == ftparser.NOT:
            tree = tree.getFirstChild()
            negate = True
        elif tree.getType() in (ftparser.LITERAL_and, ftparser.LITERAL_or):
            pass  # [TODO] Need to handle `OR` case
        elif tree.getFirstChild():
            # Dimension name is the root of AST subtree
            dimName = tree.getText()
            try:
                dim = _dimCache.get(dimName)
                if not dim:
                    dim = session.query(Dimension).filter(Dimension.name == dimName.lower()).one()
                    _dimCache.push(dimName, dim)
                dimDict[dim.name] = dim
                _convertDimensionPath(tree.getFirstChild(), dim, where, negate)
            except NoResultFound:
                raise Exception('Dimension with name `%s` does not exist' % dimName)
        else:
            # Attribute name is the root of AST subtree
            attrName = tree.getText()
            if not eventGroup:
                raise QueryError('Syntax error near filter: `%s`' % attrName)
            if not eventGroup and any([attrName == i.name for i in eventGroup.attributes]):
                raise QueryError('Attribute `%s` not in event group `%s`' % (attrName, eventGroup.name))
            if len(where) > 1:
                where.append(' AND ')
            where.append('%s.`%s`' % (eventGroup.aggregate_name, attrName))

    next = ast.getNextSibling()
    if not next:
        return dimDict 
    if next.getType() in [ftparser.EQ, ftparser.GT, ftparser.GE, ftparser.LT, ftparser.LE]:
        where.append(next.getText())
        next = next.getNextSibling()
        where.append(next.getText())
        next = next.getNextSibling()
    elif next.getType() in [ftparser.IN]:
        where.append(' IN ')
        next = next.getNextSibling()
        while next:
            where.append(next.getText())
            next = next.getNextSibling()
        
    dimDict.update(_convertFilters(session, next, where, level=level, eventGroup=eventGroup))
    return dimDict
 
def _convertDimensionPath(ast, dim, where, negate):
    """Converts a path identifier into SQL joins.
    
    Formats of path identifiers:
    (1) n.n.n.n with up to the number of levels in the dimension.
        AST node type is `ftparser.ID`.
    (2) A single dot (.) means no join. AST node type is `ftparser.DOT`.
    """
    if not ast: return
    node, level = ast, 0
    while node:
        if node.getType() == ftparser.ID:
            if len(where) > 1:
                where.append(' AND ')
            where.append('%s.`%sID`' % (dim.tablename, dim.hierarchies[0].levels[level].name))
            where.append('<>' if negate else '=')
            where.append(node.getText())
            level += 1
        elif node.getType() == ftparser.NAME:
            # This is the dimension level name or ID in a comparison expression. Ignore all but the
            # last level specified (i.e. l1.l2.l3 is literally equivalent to l3).
            if not node.getNextSibling():
                if len(where) > 1:
                    where.append(' AND ')
                levelName = node.getText().lower().rstrip('id')
                if not (levelName == 'tag' or any([levelName == l.name for l in dim.hierarchies[0].levels])):
                    raise Exception('Level `%s` is not in dimension `%s`' % (levelName, dim.name))
                where.append('%s.`%s`' % (dim.tablename, node.getText()))
        node = node.getNextSibling()
    log.debug('WHERE clause after converting filters of dimension `%s`: %s', dim.name, where)

def _parseSortOrders(session, so, orderBy, dimDict, labelList, eventGroup=None):
    """Converts a sort list into SQL ORDER BY clause.
    
    Arguments:
    session    -- db session
    orderBy    -- output array containing the ORDER BY clause being constructed
    so         -- sort order string
    dimDict    -- names of dimensions involved in the query (used to check sort field)
    labelList  -- names of returned values
    eventGroup -- a EventGroup object accessed in the query
    
    Returns sorting specification as [(column index, asc|desc), ...] to be used
    in case furthur processing (e.g. passing to aggregator) is needed. 
    """
    if not so:
        return
    log.debug('sort order: %s', so)
    spec = []
     
    lexer = solexer.Lexer(StringIO.StringIO(so))
    parser = soparser.Parser(lexer)
    parser.sort_list()
    tree = parser.getAST()

    while tree:
        if tree.getType() == soparser.COMMA:
            tree = tree.getNextSibling()
            continue

        child = tree.getFirstChild()
        if child.getType() == soparser.AT:         
            # Dimension name is the root of AST subtree
            dn = tree.getText().lower()
            dim = dimDict.get(dn)
            if not dim:
                raise QueryError('Dimension `%s` needs to be specified in `ft` parameter' % dn)
            child = child.getNextSibling()
            ln = child.getText().lower()
            if not any([ln == l.name for l in dim.hierarchies[0].levels]):
                raise QueryError('Level `%s` not in dimension `%s`' % (ln, dim.name))
            order = child.getNextSibling().getText().lower()
            if len(orderBy) > 1:
                orderBy.append(',')
            orderBy.append('%s.`%s` %s' % (dim.tablename, ln, order))
            try:
                spec.append((labelList.index(ln), order))
            except ValueError:
                pass  # ignore if sort column is not in returned result
        else:
            # Attribute name or field position (a number) is the root of AST subtree
            text = tree.getText().lower()
            if not text.isdigit():
                # An attribute name
                if not (eventGroup and any([text == i.name for i in eventGroup.attributes])):
                    raise QueryError('Attribute `%s` not in event group `%s`' % (text, eventGroup.name))
                text = '%s.`%s`' % (eventGroup.aggregate_name, text)
            order = child.getText()
            if len(orderBy) > 1:
                orderBy.append(',')
            orderBy.append('%s %s' % (text, order))
            try:
                if text.isdigit():
                    spec.append((text, order))
                else:
                    spec.append((labelList.index(text), order))
            except ValueError:
                pass  # ignore if sort column is not in returned result

        tree = tree.getNextSibling()
    return spec

def _processAggregateFunc(eg, event, aggrFunc, kwargs):
    """Maps aggregate function to proper query constructs.
    
    Returns (function name, table name, column name).

          Pre-Aggregated  Aggregate
    OLAP  Event Group     Function   Mapping
    ====  ==============  =========  ===============================================================
    no    no                         straight
    no    yes             sum        sum(aggregate_table.event_column)
    no    yes             count      sum(aggregate_table.$count$)
    no    yes             avg        sum(aggregate_table.event_column)/sum(aggregate_table.$count$)
    no    yes             min        min(aggregate_table.$min$)
    no    yes             max        max(aggregate_table.$max$)
    yes   no                         sum(table.event_column) [actual aggregation is done after roll-up]
    yes   yes                        sum(aggregate_table.event_column) [actual aggregation is done after roll-up]
    """
    olap = kwargs.get('olap')
    
    if olap:
        if aggrFunc == 'val':
            raise Exception('Aggregaton function `%s` is not supported in OLAP mode' % aggrFunc)
        return 'sum(%s.%s)' % (sqlQuote(eg.aggregate_name), sqlQuote(event.name))

    if not eg.aggregate:
        if aggrFunc == 'val':
            return '%s.%s' % (sqlQuote(eg.tablename), sqlQuote(event.name))
        else:
            return '%s(%s.%s)' % (aggrFunc, sqlQuote(eg.tablename), sqlQuote(event.name))
    
    if aggrFunc == 'sum':
        return 'sum(%s.%s)' % (sqlQuote(eg.aggregate_name), sqlQuote(event.name))
    if aggrFunc == 'count':
        return 'sum(%s.$count$)' % sqlQuote(eg.aggregate_name)
    if aggrFunc == 'avg':
        table = sqlQuote(eg.aggregate_name)
        return 'sum(%s.%s)/sum(%s.$count$)' % (table, sqlQuote(event.name), table)
    if aggrFunc == 'min':
        return 'min(%s.%s$min$)' % (sqlQuote(eg.aggregate_name), event.name)
    if aggrFunc == 'max':
        return 'max(%s.%s$max$)' % (sqlQuote(eg.aggregate_name), event.name)
    if aggrFunc == 'val':
        return '%s.%s' % (sqlQuote(eg.aggregate_name), sqlQuote(event.name))

def _mapAggrFunc(aggrName):
    """Map an aggregate operator from name to id used in OLAP aggregator.""" 
    return Aggregate.SUM if aggrName == 'sum' else \
           Aggregate.AVG if aggrName == 'avg' else \
           Aggregate.COUNT if aggrName == 'count' else \
           Aggregate.MIN if aggrName == 'min' else \
           Aggregate.MAX if aggrName == 'max' else \
           Aggregate.VAL
           
def _convertNullValues(kwargs, results):
    """Convert NULL values in query result per query parameter `nv`."""
    if not ('nv' in kwargs and results):
        return
    
    try:
        nullValue = float(kwargs.get('nv'))
    except:
        raise QueryError('Invalid value `%s` for parameter `nv`' % kwargs.get('nv'))
        
    numMetrics = len(kwargs.get('ml', '').split(','))
    for row in results:
        for i in xrange(numMetrics):
            if row[i] is None:
                row[i] = nullValue

_queryCache = _Cache()
_dimCache = _Cache()
_measureCache = _Cache()
_AGGR_FUNCS = ['sum', 'count', 'avg', 'min', 'max', 'val']

